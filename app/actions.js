'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

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

  if (user.email) {
    const { data: piece } = await supabase
      .from('pieces')
      .select('title, artists(display_name)')
      .eq('id', pieceId)
      .maybeSingle();

    if (piece) {
      await sendEmail({
        to: user.email,
        subject: `Tu puja por "${piece.title}" quedó registrada — MANCHA`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
            <h2 style="margin-bottom: 4px;">¡Tu puja quedó registrada!</h2>
            <p>Pujaste <strong>$${amount.toLocaleString('es-MX')}</strong> por <strong>"${piece.title}"</strong>, de ${piece.artists?.display_name ?? 'la temporada actual'}.</p>
            <p>Eres la oferta más alta en este momento. Si alguien puja más alto antes de que cierre la temporada, te avisaremos. Si ganas, te contactaremos por correo para coordinar el pago y el envío.</p>
            <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
          </div>
        `,
      });
    }
  }

  redirect(`${redirectTo}?success=${encodeURIComponent('¡Listo! Tu puja quedó registrada — por ahora eres la oferta más alta de esa pieza.')}`);
}
