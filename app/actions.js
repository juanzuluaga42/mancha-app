'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import { safePath, escapeHtml } from '@/lib/utils';

export async function toggleFavorite(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const redirectTo = safePath(formData.get('redirectTo'), '/');
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
  const redirectTo = safePath(formData.get('redirectTo'), '/');
  if (!user) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);

  const pieceId = formData.get('pieceId');
  const amount = Number(formData.get('amount'));

  if (!Number.isInteger(amount) || amount <= 0 || amount % 5 !== 0) {
    redirect(`${redirectTo}?error=${encodeURIComponent('El monto de la puja debe ser múltiplo de 5 USD.')}`);
  }

  const { data: pieceCheck } = await supabase.from('pieces').select('sold, artist_id, title, artists(season_id, display_name)').eq('id', pieceId).maybeSingle();
  if (pieceCheck?.sold) {
    redirect(`${redirectTo}?error=${encodeURIComponent('Esta pieza ya se vendió — ya no se puede pujar por ella.')}`);
  }

  const seasonId = pieceCheck?.artists?.season_id;
  let endsAtBefore = null;
  if (seasonId) {
    const { data: seasonBefore } = await supabase.from('seasons').select('ends_at').eq('id', seasonId).maybeSingle();
    endsAtBefore = seasonBefore?.ends_at ?? null;
  }

  if (endsAtBefore && new Date(endsAtBefore).getTime() < Date.now()) {
    redirect(`${redirectTo}?error=${encodeURIComponent('Esta temporada ya cerró — ya no se pueden registrar pujas nuevas.')}`);
  }

  // Identificar al líder anterior para notificarle si lo superan
  const { data: prevBids } = await supabase
    .from('bids')
    .select('amount, buyer_id, buyer:profiles(email, full_name)')
    .eq('piece_id', pieceId)
    .order('amount', { ascending: false })
    .limit(1);
  const prevLeader = prevBids?.[0] ?? null;
  const prevLeaderIsOther = prevLeader && prevLeader.buyer_id !== user.id;

  const { error } = await supabase.from('bids').insert({
    piece_id: pieceId,
    buyer_id: user.id,
    amount,
  });

  let extended = false;
  if (seasonId && endsAtBefore) {
    const { data: seasonAfter } = await supabase.from('seasons').select('ends_at').eq('id', seasonId).maybeSingle();
    if (seasonAfter?.ends_at && new Date(seasonAfter.ends_at).getTime() !== new Date(endsAtBefore).getTime()) {
      extended = true;
    }
  }

  revalidatePath('/');
  revalidatePath(redirectTo);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent('No pudimos registrar tu puja — prueba con un monto mayor, o revisa que tu cuenta sea de comprador.')}`);
  }

  // Email al ex-líder: "te superaron"
  if (!error && prevLeaderIsOther && prevLeader.buyer?.email) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manchagallery.com';
    await sendEmail({
      to: prevLeader.buyer.email,
      subject: `Alguien superó tu puja por "${pieceCheck.title}" — MANCHA`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">Te superaron, ${escapeHtml(prevLeader.buyer.full_name || '')}.</h2>
          <p>Alguien acaba de pujar más alto que tú por <strong>"${escapeHtml(pieceCheck.title)}"</strong> de ${escapeHtml(pieceCheck.artists?.display_name ?? 'la temporada actual')}.</p>
          <p>Puedes volver a pujar cuando quieras — la temporada sigue abierta.</p>
          <p style="margin: 24px 0;">
            <a href="${baseUrl}/obras/${pieceId}" style="background:#16110D;color:#FAF3E6;padding:12px 22px;border-radius:100px;text-decoration:none;font-size:14px;">
              Volver a pujar →
            </a>
          </p>
          <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
        </div>
      `,
    });
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
            <p>Pujaste <strong>$${amount.toLocaleString('es-MX')} USD</strong> por <strong>"${escapeHtml(piece.title)}"</strong>, de ${escapeHtml(piece.artists?.display_name ?? 'la temporada actual')}.</p>
            <p>Eres la oferta más alta en este momento. Si alguien puja más alto antes de que cierre la temporada, te avisaremos. Si ganas, te contactaremos por correo para coordinar el pago y el envío.</p>
            <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
          </div>
        `,
      });
    }
  }

  redirect(`${redirectTo}?success=${encodeURIComponent(
    extended
      ? '¡Pujaste justo a tiempo! Como faltaba poco para el cierre, extendimos la temporada 5 minutos más.'
      : '¡Listo! Tu puja quedó registrada — por ahora eres la oferta más alta de esa pieza.'
  )}`);
}
