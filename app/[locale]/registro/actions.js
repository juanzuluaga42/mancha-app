'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { notifyAdmin, brandedEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/utils';

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

  // Aviso interno: nueva solicitud de artista / nuevo coleccionista.
  const isArtist = role === 'artist';
  const safeName = escapeHtml(String(full_name || '—'));
  const safeEmail = escapeHtml(String(email || '—'));
  const paragraphs = isArtist
    ? [
        `Un nuevo artista acaba de crear su cuenta en MANCHA y entró al flujo de selección de la temporada.`,
        `<b>${safeName}</b> · <a href="mailto:${safeEmail}" style="color:#16110D;">${safeEmail}</a>`,
        `<b>Técnica:</b> ${escapeHtml(String(data.medium || '—'))} &nbsp;·&nbsp; <b>Ciudad:</b> ${escapeHtml(String(data.location || '—'))}`,
        data.bio ? `<i>“${escapeHtml(String(data.bio))}”</i>` : `Aún sin biografía.`,
        `Cuando suba sus obras aparecerá en el panel para revisión.`,
      ]
    : [
        `Una nueva persona se registró como coleccionista en MANCHA.`,
        `<b>${safeName}</b> · <a href="mailto:${safeEmail}" style="color:#16110D;">${safeEmail}</a>`,
        `Ya puede seguir la temporada y pujar por las obras cuando abra la subasta.`,
      ];
  await notifyAdmin({
    subject: isArtist ? 'Nueva solicitud de artista' : 'Nuevo coleccionista registrado',
    html: brandedEmail({
      heading: isArtist ? 'Nueva solicitud de artista' : 'Nuevo coleccionista',
      lead: isArtist ? 'Un artista quiere mostrar su obra al mundo.' : 'Se sumó alguien que quiere coleccionar antes que el mundo.',
      paragraphs,
      cta: { label: 'Abrir el panel', href: `${siteUrl}/admin` },
      note: 'Aviso automático del sistema de MANCHA.',
    }),
  });

  redirect('/registro/revisa-tu-correo');
}
