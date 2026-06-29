'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { sendEmail, brandedEmail, notifyAdmin } from '@/lib/email';
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

  await sendEmail({
    to: email,
    subject: pieceTitle ? `Te avisamos sobre "${pieceTitle}" — MANCHA` : 'Estás en la lista de espera de MANCHA',
    html: brandedEmail({
      heading: pieceTitle ? 'Te avisaremos' : 'Estás en la lista',
      lead: pieceTitle ? undefined : 'Bienvenido a MANCHA.',
      paragraphs: pieceTitle
        ? [
            `Anotamos tu interés en <b>“${escapeHtml(pieceTitle)}”</b>.`,
            `Te escribiremos en cuanto haya novedades sobre esta obra. En MANCHA cada pieza es única: avisamos a tiempo para que no se te escape.`,
          ]
        : [
            `Quedaste en la lista de espera. Serás de los primeros en saber cuándo abre una nueva temporada o entran nuevos artistas.`,
            `MANCHA es una galería por temporadas: pocas obras, elegidas a mano, disponibles por tiempo limitado. Cuando algo se mueva, te llega aquí primero.`,
          ],
      signoff: 'El equipo de MANCHA',
      note: 'Recibes este correo porque dejaste tu dirección en manchagallery.com.',
    }),
  });

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
