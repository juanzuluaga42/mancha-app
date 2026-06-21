'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { createCheckoutLink } from '@/lib/stripe';

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
      subject: '¡Tu postulación a MANCHA fue aceptada!',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">¡Bienvenido/a a MANCHA, ${artist.display_name}!</h2>
          <p>Tu postulación quedó aprobada. Ya puedes entrar a tu cuenta y subir hasta 3 piezas para esta temporada.</p>
          <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
        </div>
      `,
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
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">Sobre tu postulación</h2>
          <p>Gracias por postular a MANCHA. Esta vez no avanzamos con tu perfil para la temporada actual — eso no significa que no puedas volver a intentarlo más adelante.</p>
          <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
        </div>
      `,
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
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">¡Bienvenido/a a MANCHA, ${application.full_name}!</h2>
          <p>Tu postulación quedó aprobada. Para empezar a cargar tus piezas, crea tu cuenta de artista en mancha-app.vercel.app/registro usando este mismo correo (${application.email}) — va a quedar lista para subir piezas sin pasar por otra revisión.</p>
          <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
        </div>
      `,
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
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">Sobre tu postulación</h2>
          <p>Gracias por postular a MANCHA, ${application.full_name}. Esta vez no avanzamos con tu perfil para la temporada actual — puedes volver a postular más adelante.</p>
          <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
        </div>
      `,
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
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">¡Felicitaciones, ${winner.buyer.full_name || ''}!</h2>
          <p>Tu puja de $${Number(winner.amount).toLocaleString('es-AR')} por <strong>"${piece.title}"</strong> fue la más alta. La pieza es tuya.</p>
          ${checkoutUrl
            ? `<p style="margin: 20px 0;"><a href="${checkoutUrl}" style="background:#16110D;color:#FAF3E6;padding:12px 22px;border-radius:100px;text-decoration:none;font-size:14px;">Pagar ahora →</a></p><p style="font-size: 13px; color: #666;">Una vez que completes el pago, te escribimos por separado para coordinar el envío.</p>`
            : `<p>Te escribimos por separado para coordinar el pago y el envío.</p>`}
          <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
        </div>
      `,
    });
  }

  revalidatePath('/admin');
}
