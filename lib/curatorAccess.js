import { createAdminClient } from '@/utils/supabase/admin';

// Resuelve el curador del usuario actual. Si no está vinculado pero existe
// una invitación pendiente (fila en cur_curators con su email y user_id vacío),
// la reclama (claim) y vincula la cuenta — sin importar cómo se registró.
// Server-only: usa service role para encontrar/vincular la invitación, ya que
// las RLS no dejan ver una fila ajena con user_id nulo.
export async function resolveCurator(supabase, user) {
  if (!user) return null;

  // 1) Ya vinculado.
  const { data: byUser } = await supabase
    .from('cur_curators')
    .select('id, role, display_name')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();
  if (byUser) return byUser;

  // 2) Invitación pendiente por email → claim.
  if (!user.email) return null;
  const admin = createAdminClient();
  const { data: pending } = await admin
    .from('cur_curators')
    .select('id, role, display_name')
    .is('user_id', null)
    .eq('active', true)
    .ilike('email', user.email)
    .maybeSingle();
  if (!pending) return null;

  await admin.from('cur_curators').update({ user_id: user.id }).eq('id', pending.id);
  await admin.from('cur_audit').insert({
    actor: user.id,
    action: 'curator_claimed',
    entity: 'cur_curator',
    entity_id: pending.id,
  });
  return { id: pending.id, role: pending.role, display_name: pending.display_name };
}
