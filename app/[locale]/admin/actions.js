'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendEmail, brandedEmail } from '@/lib/email';
import { artistSelected, artistRejected, bidWon, paymentReminder } from '@/lib/emails';
import { createCheckoutLink } from '@/lib/stripe';
import { escapeHtml } from '@/lib/utils';

const recLoc = (v) => (v === 'en' ? 'en' : 'es');

const ADMIN_EMAIL = 'mancha.gallery@gmail.com';

export async function approveArtist(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const artistId = formData.get('artistId');

  const { data: artist } = await supabase.from('artists').select('display_name, profiles(email, locale)').eq('id', artistId).maybeSingle();

  await supabase.from('artists').update({ status: 'approved' }).eq('id', artistId);

  if (artist?.profiles?.email) {
    const { subject, html } = artistSelected(recLoc(artist.profiles.locale), {
      name: artist.display_name,
      url: 'https://manchagallery.com/cuenta',
    });
    await sendEmail({ to: artist.profiles.email, subject, html });
  }

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function rejectArtist(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const artistId = formData.get('artistId');

  const { data: artist } = await supabase.from('artists').select('display_name, profiles(email, locale)').eq('id', artistId).maybeSingle();

  await supabase.from('artists').update({ status: 'rejected' }).eq('id', artistId);

  if (artist?.profiles?.email) {
    const { subject, html } = artistRejected(recLoc(artist.profiles.locale), { name: artist.display_name });
    await sendEmail({ to: artist.profiles.email, subject, html });
  }

  revalidatePath('/admin');
}

export async function approveApplication(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const appId = formData.get('applicationId');
  const { data: application } = await supabase.from('artist_applications').select('email, full_name').eq('id', appId).maybeSingle();

  await supabase.from('artist_applications').update({ status: 'approved' }).eq('id', appId);

  if (application?.email) {
    await sendEmail({
      to: application.email,
      subject: '¡Tu postulación a MANCHA fue aceptada!',
      html: brandedEmail({
        heading: 'Tu postulación fue aceptada',
        lead: `Bienvenido a MANCHA, ${escapeHtml(application.full_name || '')}.`,
        paragraphs: [
          `Nos gustó lo que vimos. Para empezar a cargar tus piezas, crea tu cuenta de artista usando <b>este mismo correo</b> (${escapeHtml(application.email)}).`,
          `Al registrarte con ese correo, tu cuenta queda lista para subir obras sin pasar por otra revisión. Podrás cargar hasta 3 piezas para la temporada.`,
        ],
        cta: { label: 'Crear mi cuenta', href: 'https://manchagallery.com/registro?role=artist' },
        signoff: 'El equipo de MANCHA',
      }),
    });
  }

  revalidatePath('/admin');
}

export async function rejectApplication(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const appId = formData.get('applicationId');
  const { data: application } = await supabase.from('artist_applications').select('email, full_name').eq('id', appId).maybeSingle();

  await supabase.from('artist_applications').update({ status: 'rejected' }).eq('id', appId);

  if (application?.email) {
    await sendEmail({
      to: application.email,
      subject: 'Tu postulación a MANCHA',
      html: brandedEmail({
        heading: 'Sobre tu postulación',
        paragraphs: [
          `Gracias por postular a MANCHA, ${escapeHtml(application.full_name || '')}. Lo miramos con atención.`,
          `Esta vez no avanzamos con tu perfil para la temporada actual. Cada temporada entra un grupo pequeño y muchas buenas miradas quedan fuera por espacio, no por falta de mérito.`,
          `Puedes volver a postular más adelante. Seguimos atentos a tu trabajo.`,
        ],
        signoff: 'El equipo de MANCHA',
      }),
    });
  }

  revalidatePath('/admin');
}

export async function markAsSold(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const pieceId = formData.get('pieceId');

  const { data: piece } = await supabase
    .from('pieces')
    .select('title, bids(amount, buyer:profiles(full_name, email, locale))')
    .eq('id', pieceId)
    .maybeSingle();

  await supabase.from('pieces').update({ sold: true }).eq('id', pieceId);

  const bids = [...(piece?.bids ?? [])].sort((a, b) => Number(b.amount) - Number(a.amount));
  const winner = bids[0] ?? null;

  if (winner?.buyer?.email) {
    const checkoutUrl = await createCheckoutLink({
      pieceId,
      pieceTitle: piece.title,
      amountUsd: winner.amount,
      buyerEmail: winner.buyer.email,
    });
    const loc = recLoc(winner.buyer.locale);
    const { subject, html } = bidWon(loc, {
      name: winner.buyer.full_name || '',
      amount: Number(winner.amount).toLocaleString(loc === 'en' ? 'en-US' : 'es-AR'),
      title: piece.title,
      checkoutUrl,
    });
    await sendEmail({ to: winner.buyer.email, subject, html });
  }

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/obras');
  revalidatePath(`/obras/${pieceId}`);
  revalidatePath('/artistas', 'layout');
}

// Sella una temporada: asigna números de acceso inmutables a sus obras (por
// orden de creación) y la cierra (sealed_at + is_current=false). Tras esto, sus
// obras entran al Índice como Edition permanente.
export async function sealSeason(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const seasonId = formData.get('seasonId');
  const admin = createAdminClient();

  const { data: artists } = await admin.from('artists').select('id').eq('season_id', seasonId);
  const artistIds = (artists ?? []).map((a) => a.id);

  if (artistIds.length > 0) {
    const { data: pieces } = await admin
      .from('pieces')
      .select('id, accession')
      .in('artist_id', artistIds)
      .order('created_at', { ascending: true });

    let n = 0;
    for (const p of (pieces ?? [])) {
      n += 1;
      // Número de acceso inmutable: solo se asigna si todavía no tiene uno.
      if (p.accession == null) {
        await admin.from('pieces').update({ accession: n }).eq('id', p.id);
      }
    }
  }

  await admin.from('seasons').update({ sealed_at: new Date().toISOString(), is_current: false }).eq('id', seasonId);

  revalidatePath('/admin');
  revalidatePath('/indice');
  revalidatePath('/');
}


export async function sendPaymentReminder(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const pieceId = formData.get('pieceId');

  const { data: piece } = await supabase
    .from('pieces')
    .select('title, bids(amount, buyer:profiles(full_name, email, locale))')
    .eq('id', pieceId)
    .maybeSingle();

  const bids = [...(piece?.bids ?? [])].sort((a, b) => Number(b.amount) - Number(a.amount));
  const winner = bids[0] ?? null;

  if (winner?.buyer?.email) {
    // El link de pago de Stripe vence a las 24hs, así que generamos uno nuevo
    // en vez de reusar el que se mandó en el correo original.
    const checkoutUrl = await createCheckoutLink({
      pieceId,
      pieceTitle: piece.title,
      amountUsd: winner.amount,
      buyerEmail: winner.buyer.email,
    });
    const { subject, html } = paymentReminder(recLoc(winner.buyer.locale), {
      name: winner.buyer.full_name || '',
      title: piece.title,
      checkoutUrl,
    });
    await sendEmail({ to: winner.buyer.email, subject, html });
  }

  revalidatePath('/admin');
}
