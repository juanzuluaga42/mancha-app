'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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

  const { error } = await supabase.from('artists').insert({
    profile_id: user.id,
    season_id: season?.id ?? null,
    display_name: formData.get('display_name'),
    bio: formData.get('bio'),
    location: formData.get('location'),
    medium: formData.get('medium'),
  });

  if (error) {
    redirect(`/cuenta?error=${encodeURIComponent('No se pudo crear tu perfil de artista. ' + error.message)}`);
  }

  revalidatePath('/cuenta');
  revalidatePath('/');
}

export async function addPiece(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: artist } = await supabase.from('artists').select('id').eq('profile_id', user.id).maybeSingle();
  if (!artist) redirect(`/cuenta?error=${encodeURIComponent('Primero completa tu perfil de artista.')}`);

  const { error } = await supabase.from('pieces').insert({
    artist_id: artist.id,
    title: formData.get('title'),
    year: Number(formData.get('year')) || null,
    technique: formData.get('technique'),
    dimensions: formData.get('dimensions'),
    description: formData.get('description') || null,
    min_bid: Number(formData.get('min_bid')),
    image_url: formData.get('image_url') || null,
  });

  if (error) {
    redirect(`/cuenta?error=${encodeURIComponent('No se pudo guardar la pieza — recuerda que el máximo son 3 por artista.')}`);
  }

  revalidatePath('/cuenta');
  revalidatePath('/');
}
