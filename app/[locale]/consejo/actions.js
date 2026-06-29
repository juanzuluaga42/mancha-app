'use server';

import { createClient } from '@/utils/supabase/server';
import { SPECIALTY_KEYS, specialtyEs } from '@/lib/curatorial';
import { notifyAdmin, sendEmail, brandedEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/utils';

// Expresión de interés para el Consejo Curatorial. No da de alta a nadie:
// crea un candidato que el Founder revisa e invita.
// Devuelve estado (no redirige) → el cliente muestra éxito/error en el sitio,
// sin navegación: imposible un 404 y mejor experiencia.
export async function applyToCouncil(_prev, formData) {
  const s = (k, n) => String(formData.get(k) || '').trim().slice(0, n);
  const name = s('name', 200);
  const email = s('email', 200);
  const statement = s('statement', 4000);

  if (name.length < 1 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: true };
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
  if (error) return { error: true };

  // Aviso interno + confirmación al candidato (mejor esfuerzo, no bloquea).
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const specEs = specialties.map((k) => escapeHtml(specialtyEs(k))).join(' · ') || '—';
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://manchagallery.com';

  await notifyAdmin({
    subject: 'Nueva solicitud de experto (Consejo)',
    html: brandedEmail({
      heading: 'Nueva solicitud al Consejo Curatorial',
      lead: 'Alguien quiere sumar su mirada al estándar de MANCHA.',
      paragraphs: [
        `<b>${safeName}</b> · <a href="mailto:${safeEmail}" style="color:#16110D;">${safeEmail}</a>`,
        `<b>Perfil:</b> ${escapeHtml(s('current_title', 200) || '—')}${s('organization', 200) ? ` · ${escapeHtml(s('organization', 200))}` : ''}`,
        `<b>Especialidades:</b> ${specEs}`,
        statement ? `<i>“${escapeHtml(statement)}”</i>` : 'Sin texto de motivación.',
      ],
      cta: { label: 'Revisar en el pipeline', href: `${site}/curaduria/candidatos` },
      note: 'Aviso automático del sistema de MANCHA.',
    }),
  });

  try {
    await sendEmail({
      to: email,
      subject: 'MANCHA · Recibimos tu candidatura al Consejo Curatorial',
      html: brandedEmail({
        heading: 'Recibimos tu candidatura',
        lead: `Gracias, ${safeName}.`,
        paragraphs: [
          `Tu interés en integrar el <b>Consejo Curatorial Fundador de MANCHA</b> llegó a nuestras manos. Lo leemos con la misma atención con la que miramos una obra: sin prisa.`,
          `No es una convocatoria abierta. Revisamos cada mirada con cuidado y, si encaja con lo que MANCHA está construyendo, te escribiremos personalmente para dar el siguiente paso.`,
          `<span style="color:#8a8178;">— — —</span>`,
          `<b>We’ve received your application.</b> Your interest in joining MANCHA’s Founding Curatorial Council reached us. This isn’t an open call: we read every voice closely, and if it fits, we’ll reach out personally.`,
        ],
        signoff: 'El Consejo Curatorial de MANCHA',
        note: 'La obra habla primero. The work speaks first.',
      }),
    });
  } catch {}

  return { ok: true };
}
