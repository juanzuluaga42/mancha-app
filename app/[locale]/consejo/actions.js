'use server';

import { redirect } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';

// Expresión de interés para el Consejo Curatorial. No da de alta a nadie:
// crea un candidato que el Founder revisa e invita.
export async function applyToCouncil(formData) {
  const name = String(formData.get('name') || '').trim().slice(0, 200);
  const email = String(formData.get('email') || '').trim().slice(0, 200);
  const focus = String(formData.get('focus') || '').trim().slice(0, 300);
  const portfolio = String(formData.get('portfolio') || '').trim().slice(0, 500);
  const statement = String(formData.get('statement') || '').trim().slice(0, 4000);

  if (name.length < 1 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect('/consejo?error=1');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('cur_candidates')
    .insert({ name, email, focus, portfolio, statement, status: 'new' });
  if (error) redirect('/consejo?error=1');

  redirect('/consejo?sent=1');
}
