'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { sendEmail } from '@/lib/email';
import { safePath } from '@/lib/utils';

export async function joinWaitlist(formData) {
  const supabase = await createClient();
  const email = formData.get('email');
  const pieceId = formData.get('pieceId') || null;
  const redirectTo = safePath(formData.get('redirectTo'), '/');
  const t = await getTranslations('actions');

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    redirect(`${redirectTo}?error=${encodeURIComponent(t('waitlistInvalidEmail'))}`);
  }

  const { error } = await supabase.from('leads').insert({ email, piece_id: pieceId || null });

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(t('waitlistError'))}`);
  }

  let pieceTitle = null;
  if (pieceId) {
    const { data: piece } = await supabase.from('pieces').select('title').eq('id', pieceId).maybeSingle();
    pieceTitle = piece?.title ?? null;
  }

  await sendEmail({
    to: email,
    subject: pieceTitle ? `Te avisamos sobre "${pieceTitle}" — MANCHA` : 'Estás en la lista de espera de MANCHA',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="margin-bottom: 4px;">${pieceTitle ? '¡Listo!' : '¡Bienvenido a MANCHA!'}</h2>
        <p>${pieceTitle
          ? `Te vamos a avisar por correo sobre novedades de "${pieceTitle}".`
          : 'Te avisamos por correo apenas abramos una nueva temporada o sumemos artistas nuevos.'}</p>
        <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
      </div>
    `,
  });

  redirect(`${redirectTo}?success=${encodeURIComponent(t('waitlistSuccess'))}`);
}
