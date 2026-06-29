import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

// El flujo de postulación se unificó con el de cuenta de artista.
// Si ya hay sesión, vamos a la cuenta (subir obra); si no, a crear cuenta.
export default async function PostularPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  redirect(user ? '/cuenta' : '/registro?role=artist');
}
