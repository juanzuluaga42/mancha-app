'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendEmail, brandedEmail } from '@/lib/email';
import { createCheckoutLink } from '@/lib/stripe';
import { escapeHtml } from '@/lib/utils';

const ADMIN_EMAIL = 'mancha.gallery@gmail.com';

export async function approveArtist(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const artistId = formData.get('artistId');

  const { data: artist } = await supabase.from('artists').select('display_name, profiles(email)').eq('id', artistId).maybeSingle();

  await supabase.from('artists').update({ status: 'approved' }).eq('id', artistId);

  if (artist?.profiles?.email) {
    await sendEmail({
      to: artist.profiles.email,
      subject: '¡Fuiste seleccionado para MANCHA!',
      html: brandedEmail({
        heading: 'Fuiste seleccionado',
        lead: `Bienvenido a MANCHA, ${escapeHtml(artist.display_name)}.`,
        paragraphs: [
          `Entre muchas miradas, la tuya entró a esta temporada. Tus obras ya son visibles en el catálogo, frente a coleccionistas que buscan descubrir antes que el mundo.`,
          `Si aún no lo hiciste, puedes completar hasta <b>3 piezas</b> desde tu cuenta. Cuida cada imagen y cada precio de salida: así se construye una temporada que vale algo.`,
        ],
        cta: { label: 'Ir a mi cuenta', href: 'https://manchagallery.com/cuenta' },
        signoff: 'El equipo de MANCHA',
      }),
    });
  }

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function rejectArtist(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const artistId = formData.get('artistId');

  const { data: artist } = await supabase.from('artists').select('display_name, profiles(email)').eq('id', artistId).maybeSingle();

  await supabase.from('artists').update({ status: 'rejected' }).eq('id', artistId);

  if (artist?.profiles?.email) {
    await sendEmail({
      to: artist.profiles.email,
      subject: 'Tu postulación a MANCHA',
      html: brandedEmail({
        heading: 'Sobre tu postulación',
        paragraphs: [
          `Gracias por mostrarnos tu trabajo. Lo miramos con cuidado.`,
          `Esta vez no avanzamos con tu perfil para la temporada actual. No es un juicio sobre tu obra entera: cada temporada entra un grupo pequeño y muchas miradas valiosas quedan fuera por espacio, no por falta de mérito.`,
          `Puedes volver a postular en una próxima convocatoria. Seguiremos atentos a lo que hagas.`,
        ],
        signoff: 'El equipo de MANCHA',
      }),
    });
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
    .select('title, bids(amount, buyer:profiles(full_name, email))')
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

    await sendEmail({
      to: winner.buyer.email,
      subject: `¡Ganaste la puja por "${piece.title}"! — MANCHA`,
      html: brandedEmail({
        heading: 'Ganaste la puja',
        lead: `Felicitaciones, ${escapeHtml(winner.buyer.full_name || '')}.`,
        paragraphs: [
          `Tu puja de <b>$${Number(winner.amount).toLocaleString('es-AR')} USD</b> por <b>“${escapeHtml(piece.title)}”</b> fue la más alta. La obra es tuya.`,
          checkoutUrl
            ? `Completa el pago de forma segura para cerrar la adquisición. Apenas se confirme, recibirás tu certificado de colección y te escribiremos para coordinar el envío.`
            : `Te escribimos por separado para coordinar el pago seguro y el envío de la obra.`,
        ],
        cta: checkoutUrl ? { label: 'Pagar ahora', href: checkoutUrl } : undefined,
        signoff: 'El equipo de MANCHA',
        note: 'El cobro se realiza en USD a través de un pago seguro.',
      }),
    });
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

// Marca / desmarca una obra como parte de The Canon de su temporada.
export async function toggleCanon(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const pieceId = formData.get('pieceId');
  const next = formData.get('next') === 'true';
  const admin = createAdminClient();

  await admin.from('pieces').update({ in_canon: next }).eq('id', pieceId);

  revalidatePath('/admin');
  revalidatePath('/indice');
  revalidatePath(`/obras/${pieceId}`);
}

export async function sendPaymentReminder(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const pieceId = formData.get('pieceId');

  const { data: piece } = await supabase
    .from('pieces')
    .select('title, bids(amount, buyer:profiles(full_name, email))')
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

    await sendEmail({
      to: winner.buyer.email,
      subject: `Recordatorio: tu pago por "${piece.title}" sigue pendiente — MANCHA`,
      html: brandedEmail({
        heading: 'Tu obra te espera',
        lead: `Hola ${escapeHtml(winner.buyer.full_name || '')}.`,
        paragraphs: [
          `Ganaste la puja por <b>“${escapeHtml(piece.title)}”</b>, pero todavía no vemos tu pago completado.`,
          checkoutUrl
            ? `Puedes terminar la compra de forma segura desde el botón de abajo. Apenas se confirme, recibirás tu certificado de colección.`
            : `Escríbenos para coordinar el pago y no perder la pieza.`,
        ],
        cta: checkoutUrl ? { label: 'Completar mi pago', href: checkoutUrl } : undefined,
        signoff: 'El equipo de MANCHA',
        note: 'Si el pago no se completa en los próximos días, podríamos ofrecer la obra a la siguiente puja más alta.',
      }),
    });
  }

  revalidatePath('/admin');
}
