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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}&role=${role}`);
  }

  redirect('/registro/revisa-tu-correo');
}
