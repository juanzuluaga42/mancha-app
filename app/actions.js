'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const redirectTo = formData.get('redirectTo') || '/';
  if (!user) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);

  const pieceId = formData.get('pieceId');

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('piece_id', pieceId)
    .eq('buyer_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
  } else {
    await supabase.from('favorites').insert({ piece_id: pieceId, buyer_id: user.id });
  }

  revalidatePath('/');
  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function placeBid(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const redirectTo = formData.get('redirectTo') || '/';
  if (!user) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);

  const pieceId = formData.get('pieceId');
  const amount = Number(formData.get('amount'));

  const { error } = await supabase.from('bids').insert({
    piece_id: pieceId,
    buyer_id: user.id,
    amount,
  });

  revalidatePath('/');
  revalidatePath(redirectTo);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent('No pudimos registrar tu puja — prueba con un monto mayor, o revisa que tu cuenta sea de comprador.')}`);
  }

  redirect(`${redirectTo}?success=${encodeURIComponent('¡Listo! Tu puja quedó registrada — por ahora eres la oferta más alta de esa pieza.')}`);
}
