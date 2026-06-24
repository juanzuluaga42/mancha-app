'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function createArtistProfile(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: season } = await supabase.from('seasons').select('id').eq('is_current', true).maybeSingle();

  const display_name = formData.get('display_name');

  let initialStatus = 'pending';
  if (user.email) {
    const { data: matchingApp } = await supabase
      .from('artist_applications')
      .select('id')
      .eq('email', user.email)
      .eq('status', 'approved')
      .maybeSingle();
    if (matchingApp) initialStatus = 'approved';
  }

  const { error } = await supabase.from('artists').insert({
    profile_id: user.id,
    season_id: season?.id ?? null,
    display_name,
    bio: formData.get('bio'),
    location: formData.get('location'),
    medium: formData.get('medium'),
    status: initialStatus,
  });

  if (error) {
    redirect(`/cuenta?error=${encodeURIComponent('No se pudo enviar tu postulación. ' + error.message)}`);
  }

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: initialStatus === 'approved' ? '¡Tu cuenta de artista en MANCHA está lista!' : 'Recibimos tu postulación a MANCHA',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">${initialStatus === 'approved' ? `¡Bienvenido/a, ${display_name}!` : `¡Recibimos tu postulación, ${display_name}!`}</h2>
          <p>${initialStatus === 'approved'
            ? 'Ya puedes entrar a tu cuenta y subir hasta 3 piezas para esta temporada.'
            : 'La estamos revisando. Te avisamos por correo apenas tengamos una respuesta — normalmente en pocos días.'}</p>
          <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
        </div>
      `,
    });
  }

  revalidatePath('/cuenta');
  revalidatePath('/');
}

export async function addPiece(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: artist } = await supabase.from('artists').select('id, status').eq('profile_id', user.id).maybeSingle();
  if (!artist) redirect(`/cuenta?error=${encodeURIComponent('Primero completa tu postulación de artista.')}`);
  if (artist.status !== 'approved') redirect(`/cuenta?error=${encodeURIComponent('Tu postulación todavía está en revisión — vas a poder cargar piezas apenas la aprobemos.')}`);

  let image_url = null;
  const file = formData.get('image_file');

  if (file && typeof file === 'object' && file.size > 0) {
    if (file.size > 8 * 1024 * 1024) {
      redirect(`/cuenta?error=${encodeURIComponent('La foto pesa demasiado — el máximo son 8 MB. Prueba con una versión más liviana.')}`);
    }

    let uploadErrorMessage = null;

    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('pieces').upload(path, file);

      if (uploadError) {
        uploadErrorMessage = uploadError.message;
      } else {
        const { data: publicUrl } = supabase.storage.from('pieces').getPublicUrl(path);
        image_url = publicUrl.publicUrl;
      }
    } catch (e) {
      uploadErrorMessage = 'Puede que falte correr la migración de almacenamiento en Supabase (migration-storage.sql).';
    }

    if (uploadErrorMessage) {
      redirect(`/cuenta?error=${encodeURIComponent('No se pudo subir la foto: ' + uploadErrorMessage)}`);
    }
  }

  const { error } = await supabase.from('pieces').insert({
    artist_id: artist.id,
    title: formData.get('title'),
    year: Number(formData.get('year')) || null,
    technique: formData.get('technique'),
    dimensions: formData.get('dimensions'),
    description: formData.get('description') || null,
    min_bid: Number(formData.get('min_bid')),
    image_url,
  });

  if (error) {
    redirect(`/cuenta?error=${encodeURIComponent('No se pudo guardar la pieza — recuerda que el máximo son 3 por artista.')}`);
  }

  revalidatePath('/cuenta');
  revalidatePath('/');
}

export async function deletePiece(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const pieceId = formData.get('pieceId');

  const { data: artist } = await supabase.from('artists').select('id').eq('profile_id', user.id).maybeSingle();
  if (!artist) redirect('/cuenta');

  await supabase.from('pieces').delete().eq('id', pieceId).eq('artist_id', artist.id);

  revalidatePath('/cuenta');
  revalidatePath('/');
}
