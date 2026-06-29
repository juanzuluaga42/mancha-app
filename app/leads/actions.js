'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { sendEmail, brandedEmail, notifyAdmin } from '@/lib/email';
import { waitlist as waitlistEmail } from '@/lib/emails';
import { escapeHtml } from '@/lib/utils';
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

  const locale = await getLocale();
  const wl = waitlistEmail(locale, { pieceTitle });
  await sendEmail({ to: email, subject: wl.subject, html: wl.html });

  // Aviso interno de nuevo interesado / lista de espera.
  await notifyAdmin({
    subject: pieceTitle ? `Interesado en "${pieceTitle}"` : 'Nuevo registro en lista de espera',
    html: brandedEmail({
      heading: pieceTitle ? 'Nuevo interesado en una obra' : 'Nuevo registro en lista de espera',
      paragraphs: [
        `<b>${escapeHtml(email)}</b>`,
        pieceTitle ? `Obra: <b>“${escapeHtml(pieceTitle)}”</b>` : 'Lista de espera general.',
      ],
      note: 'Aviso automático del sistema de MANCHA.',
    }),
  });

  redirect(`${redirectTo}?success=${encodeURIComponent(t('waitlistSuccess'))}`);
}
