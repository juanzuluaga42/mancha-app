'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { safePath } from '@/lib/utils';

export async function logIn(formData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent('Correo o contraseña incorrectos.')}`);
  }

  redirect(safePath(formData.get('next'), '/cuenta'));
}
