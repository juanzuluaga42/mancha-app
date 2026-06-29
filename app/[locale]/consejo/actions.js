'use server';

import { redirect } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';

// Expresión de interés para el Consejo Curatorial. No da de alta a nadie:
// crea un candidato que el Founder revisa e invita.
import { SPECIALTY_KEYS } from '@/lib/curatorial';

export async function applyToCouncil(formData) {
  const s = (k, n) => String(formData.get(k) || '').trim().slice(0, n);
  const name = s('name', 200);
  const email = s('email', 200);
  const statement = s('statement', 4000);

  if (name.length < 1 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect('/consejo?error=1');
  }

  // Especialidades: solo claves válidas.
  let specialties = [];
  try {
    const parsed = JSON.parse(String(formData.get('specialties') || '[]'));
    if (Array.isArray(parsed)) specialties = parsed.filter((k) => SPECIALTY_KEYS.includes(k)).slice(0, 12);
  } catch {}

  const yearsRaw = parseInt(formData.get('years_experience'), 10);
  const years_experience = Number.isFinite(yearsRaw) ? Math.min(80, Math.max(0, yearsRaw)) : null;

  const supabase = await createClient();
  const { error } = await supabase.from('cur_candidates').insert({
    name,
    email,
    statement,
    country: s('country', 120) || null,
    current_title: s('current_title', 200) || null,
    organization: s('organization', 200) || null,
    years_experience,
    links: s('links', 600) || null,
    availability: s('availability', 300) || null,
    specialties,
    status: 'new',
  });
  if (error) redirect('/consejo?error=1');

  redirect('/consejo?sent=1');
}
