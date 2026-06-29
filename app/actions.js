'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getTranslations, getLocale } from 'next-intl/server';
import { sendEmail } from '@/lib/email';
import { bidPlaced, outbid } from '@/lib/emails';
import { safePath } from '@/lib/utils';

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
  const ta = await getTranslations('actions');

  if (!Number.isInteger(amount) || amount <= 0 || amount % 5 !== 0) {
    redirect(`${redirectTo}?error=${encodeURIComponent(ta('bidMultiple'))}`);
  }

  const { data: pieceCheck } = await supabase.from('pieces').select('sold, artist_id, title, artists(season_id, display_name)').eq('id', pieceId).maybeSingle();
  if (pieceCheck?.sold) {
    redirect(`${redirectTo}?error=${encodeURIComponent(ta('bidSold'))}`);
  }

  const seasonId = pieceCheck?.artists?.season_id;
  let endsAtBefore = null;
  if (seasonId) {
    const { data: seasonBefore } = await supabase.from('seasons').select('ends_at').eq('id', seasonId).maybeSingle();
    endsAtBefore = seasonBefore?.ends_at ?? null;
  }

  if (endsAtBefore && new Date(endsAtBefore).getTime() < Date.now()) {
    redirect(`${redirectTo}?error=${encodeURIComponent(ta('bidClosed'))}`);
  }

  // Identificar al líder anterior para notificarle si lo superan
  const { data: prevBids } = await supabase
    .from('bids')
    .select('amount, buyer_id, buyer:profiles(email, full_name, locale)')
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
    redirect(`${redirectTo}?error=${encodeURIComponent(ta('bidError'))}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manchagallery.com';
  const locale = await getLocale();
  const artistName = pieceCheck.artists?.display_name ?? (locale === 'en' ? 'the current season' : 'la temporada actual');

  // Guarda el idioma del pujador para futuros correos (ganaste / te superaron).
  if (!error) {
    await supabase.from('profiles').update({ locale }).eq('id', user.id);
  }

  // Email al ex-líder: "te superaron" — en SU idioma.
  if (!error && prevLeaderIsOther && prevLeader.buyer?.email) {
    const recLocale = prevLeader.buyer.locale === 'en' ? 'en' : 'es';
    const { subject, html } = outbid(recLocale, {
      name: prevLeader.buyer.full_name || '',
      title: pieceCheck.title,
      artist: pieceCheck.artists?.display_name ?? (recLocale === 'en' ? 'the current season' : 'la temporada actual'),
      url: `${baseUrl}/obras/${pieceId}`,
    });
    await sendEmail({ to: prevLeader.buyer.email, subject, html });
  }

  // Email al pujador: "tu puja quedó registrada" — en su idioma actual.
  if (!error && user.email) {
    const { subject, html } = bidPlaced(locale, {
      amount: amount.toLocaleString(locale === 'en' ? 'en-US' : 'es-AR'),
      title: pieceCheck.title,
      artist: artistName,
      url: `${baseUrl}/obras/${pieceId}`,
    });
    await sendEmail({ to: user.email, subject, html });
  }

  redirect(`${redirectTo}?success=${encodeURIComponent(extended ? ta('bidExtended') : ta('bidSuccess'))}`);
}
