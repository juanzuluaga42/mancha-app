'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signUp(formData) {
  const supabase = await createClient();

  const email = formData.get('email');
  const password = formData.get('password');
  const full_name = formData.get('full_name');
  const role = formData.get('role') === 'artist' ? 'artist' : 'buyer';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Datos del artista guardados en metadata: al confirmar el correo se usa para
  // crear su perfil de artista (ver app/auth/confirm/route.js). Las obras se suben
  // después, ya con la cuenta confirmada, desde /cuenta.
  const data = { full_name, role };
  if (role === 'artist') {
    data.medium = formData.get('medium') || null;
    data.location = formData.get('location') || null;
    data.bio = formData.get('bio') || null;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data,
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}&role=${role}`);
  }

  redirect('/registro/revisa-tu-correo');
}
