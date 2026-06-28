'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { safePath } from '@/lib/utils';

export async function logIn(formData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (error) {
    const t = await getTranslations('actions');
    redirect(`/login?error=${encodeURIComponent(t('loginError'))}`);
  }

  redirect(safePath(formData.get('next'), '/cuenta'));
}
