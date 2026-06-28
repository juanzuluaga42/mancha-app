'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

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

  const { error } = await supabase.from('artists').insert({
    profile_id: user.id,
    season_id: season?.id ?? null,
    display_name,
    bio: formData.get('bio'),
    location: formData.get('location'),
    medium: formData.get('medium'),
    status: 'pending',
  });

  if (error) {
    const t = await getTranslations('actions');
    redirect(`/cuenta?error=${encodeURIComponent(t('profileSaveFail', { msg: error.message }))}`);
  }

  revalidatePath('/cuenta');
  revalidatePath('/');
}

export async function addPiece(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = await getTranslations('actions');

  const { data: artist } = await supabase.from('artists').select('id, status').eq('profile_id', user.id).maybeSingle();
  if (!artist) redirect(`/cuenta?error=${encodeURIComponent(t('pieceNeedProfile'))}`);
  // Subir obra ya NO requiere aprobación previa: solo activa la revisión.
  // No se permite cargar nuevas obras si la postulación ya fue rechazada esta temporada.
  if (artist.status === 'rejected') redirect(`/cuenta?error=${encodeURIComponent(t('pieceRejected'))}`);

  let image_url = null;
  const file = formData.get('image_file');

  if (file && typeof file === 'object' && file.size > 0) {
    if (file.size > 8 * 1024 * 1024) {
      redirect(`/cuenta?error=${encodeURIComponent(t('pieceTooBig'))}`);
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
      redirect(`/cuenta?error=${encodeURIComponent(t('pieceUploadFail', { msg: uploadErrorMessage }))}`);
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
    redirect(`/cuenta?error=${encodeURIComponent(t('pieceSaveFail'))}`);
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
