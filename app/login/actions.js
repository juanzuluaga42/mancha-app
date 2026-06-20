'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function logIn(formData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent('Correo o contraseña incorrectos.')}`);
  }

  const next = formData.get('next') || '/cuenta';
  redirect(next);
}
