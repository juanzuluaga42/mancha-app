// ════════════════════════════════════════════════════════════════
// Correos transaccionales de MANCHA — bilingües (ES/EN).
// Cada builder devuelve { subject, html } según el idioma del destinatario.
// Los avisos internos al equipo (institucional) NO se localizan: van en ES.
// ════════════════════════════════════════════════════════════════
import { brandedEmail } from './email';
import { escapeHtml } from './utils';

const e = (v) => escapeHtml(String(v ?? ''));

// Idioma del destinatario a partir de su perfil (fallback 'es').
// supabase: cliente con permiso para leer profiles (admin/service o el propio).
export async function recipientLocale(supabase, { id, email } = {}) {
  try {
    let q = supabase.from('profiles').select('locale');
    if (id) q = q.eq('id', id);
    else if (email) q = q.eq('email', email);
    else return 'es';
    const { data } = await q.maybeSingle();
    return data?.locale === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

// ── Artista: recordatorio para subir obras (tras confirmar correo) ──
export function artistReminder(locale, { name, url }) {
  const en = locale === 'en';
  return {
    subject: en ? 'Your MANCHA artist account is ready — upload your work' : 'Tu cuenta de artista en MANCHA está lista — sube tus obras',
    html: brandedEmail({
      locale,
      heading: en ? 'Your artist account is ready' : 'Tu cuenta de artista está lista',
      lead: en ? `Welcome to MANCHA, ${e(name)}.` : `Bienvenido a MANCHA, ${e(name)}.`,
      paragraphs: en
        ? [
            `You confirmed your email — you’re now part of this season’s selection.`,
            `You haven’t uploaded any work yet, and that’s the step that’s missing. MANCHA can only review your work once there’s at least one piece.`,
            `Sign in and upload <b>up to 3 works</b> — high-quality image, title, medium and starting price — before the call closes. Each season takes in a small group, chosen by hand: the quality of what you upload is what earns your place.`,
          ]
        : [
            `Confirmaste tu correo: ya eres parte del proceso de selección de la temporada.`,
            `Todavía no subiste ninguna obra, y ese es el paso que falta. MANCHA solo puede revisar tu trabajo cuando hay al menos una pieza cargada.`,
            `Entra a tu cuenta y sube <b>hasta 3 obras</b> —imagen en alta calidad, título, técnica y precio de salida— antes de que cierre la convocatoria. Cada temporada entra un grupo pequeño, elegido a mano: la calidad de lo que subas define tu lugar.`,
          ],
      cta: { label: en ? 'Upload my work' : 'Subir mis obras', href: url },
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
      note: en ? 'If you didn’t create this account, you can ignore this message.' : 'Si no creaste esta cuenta, puedes ignorar este mensaje.',
    }),
  };
}

// ── Coleccionista: puja registrada ──
export function bidPlaced(locale, { amount, title, artist, url }) {
  const en = locale === 'en';
  return {
    subject: en ? `Your bid on "${title}" is in — MANCHA` : `Tu puja por "${title}" quedó registrada — MANCHA`,
    html: brandedEmail({
      locale,
      heading: en ? 'Your bid is in' : 'Tu puja quedó registrada',
      lead: en ? 'You’re in the lead.' : 'Vas a la cabeza.',
      paragraphs: en
        ? [
            `You bid <b>$${amount} USD</b> for <b>“${e(title)}”</b>, by ${e(artist)}.`,
            `For now you’re the highest offer. If someone outbids you before the season closes, we’ll tell you in time to decide.`,
            `If you win, we’ll email you to arrange secure payment and shipping, along with your collection certificate.`,
          ]
        : [
            `Pujaste <b>$${amount} USD</b> por <b>“${e(title)}”</b>, de ${e(artist)}.`,
            `Por ahora eres la oferta más alta. Si alguien te supera antes de que cierre la temporada, te lo diremos a tiempo para que decidas.`,
            `Si ganas, te escribiremos para coordinar el pago seguro y el envío de la obra, con su certificado de colección.`,
          ],
      cta: { label: en ? 'View the work' : 'Ver la obra', href: url },
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
    }),
  };
}

// ── Coleccionista: te superaron ──
export function outbid(locale, { name, title, artist, url }) {
  const en = locale === 'en';
  return {
    subject: en ? `You’ve been outbid on "${title}" — MANCHA` : `Alguien superó tu puja por "${title}" — MANCHA`,
    html: brandedEmail({
      locale,
      heading: en ? 'You’ve been outbid' : 'Te superaron',
      lead: en ? `${e(name) || 'Collector'}, there’s still time.` : `${e(name) || 'Coleccionista'}, todavía estás a tiempo.`,
      paragraphs: en
        ? [
            `Someone just bid higher than you for <b>“${e(title)}”</b>, by ${e(artist)}.`,
            `At MANCHA every work is unique and the season closes for good: when it ends, what isn’t collected is gone. If this piece moves you, you can still take the lead back.`,
          ]
        : [
            `Otra persona acaba de pujar más alto que tú por <b>“${e(title)}”</b>, de ${e(artist)}.`,
            `En MANCHA cada obra es única y la temporada cierra para siempre: cuando termina, lo no adquirido se va. Si esta pieza te mueve, aún puedes recuperar la delantera.`,
          ],
      cta: { label: en ? 'Bid again' : 'Volver a pujar', href: url },
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
      note: en ? 'You’re getting this because you held the highest bid.' : 'Recibes este aviso porque tenías la puja más alta.',
    }),
  };
}

// ── Artista seleccionado ──
export function artistSelected(locale, { name, url }) {
  const en = locale === 'en';
  return {
    subject: en ? 'You’ve been selected for MANCHA!' : '¡Fuiste seleccionado para MANCHA!',
    html: brandedEmail({
      locale,
      heading: en ? 'You’ve been selected' : 'Fuiste seleccionado',
      lead: en ? `Welcome to MANCHA, ${e(name)}.` : `Bienvenido a MANCHA, ${e(name)}.`,
      paragraphs: en
        ? [
            `Among many eyes, yours made it into this season. Your work is now visible in the catalogue, in front of collectors who want to discover before the world does.`,
            `If you haven’t yet, you can complete up to <b>3 pieces</b> from your account. Care for every image and starting price: that’s how a season worth something is built.`,
          ]
        : [
            `Entre muchas miradas, la tuya entró a esta temporada. Tus obras ya son visibles en el catálogo, frente a coleccionistas que buscan descubrir antes que el mundo.`,
            `Si aún no lo hiciste, puedes completar hasta <b>3 piezas</b> desde tu cuenta. Cuida cada imagen y cada precio de salida: así se construye una temporada que vale algo.`,
          ],
      cta: { label: en ? 'Go to my account' : 'Ir a mi cuenta', href: url },
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
    }),
  };
}

// ── Artista no seleccionado ──
export function artistRejected(locale, { name }) {
  const en = locale === 'en';
  return {
    subject: en ? 'About your MANCHA submission' : 'Sobre tu postulación a MANCHA',
    html: brandedEmail({
      locale,
      heading: en ? 'About your submission' : 'Sobre tu postulación',
      paragraphs: en
        ? [
            `Thank you for showing us your work${name ? `, ${e(name)}` : ''}. We looked at it with care.`,
            `This time we’re not moving forward with your profile for the current season. It isn’t a verdict on your whole practice: each season takes in a small group, and many valuable eyes are left out for space, not for lack of merit.`,
            `You can apply again in a future call. We’ll be watching what you do.`,
          ]
        : [
            `Gracias por mostrarnos tu trabajo${name ? `, ${e(name)}` : ''}. Lo miramos con cuidado.`,
            `Esta vez no avanzamos con tu perfil para la temporada actual. No es un juicio sobre tu obra entera: cada temporada entra un grupo pequeño y muchas miradas valiosas quedan fuera por espacio, no por falta de mérito.`,
            `Puedes volver a postular en una próxima convocatoria. Seguiremos atentos a tu trabajo.`,
          ],
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
    }),
  };
}

// ── Coleccionista: ganaste la puja ──
export function bidWon(locale, { name, amount, title, checkoutUrl }) {
  const en = locale === 'en';
  return {
    subject: en ? `You won the bid on "${title}"! — MANCHA` : `¡Ganaste la puja por "${title}"! — MANCHA`,
    html: brandedEmail({
      locale,
      heading: en ? 'You won the bid' : 'Ganaste la puja',
      lead: en ? `Congratulations, ${e(name)}.` : `Felicitaciones, ${e(name)}.`,
      paragraphs: en
        ? [
            `Your bid of <b>$${amount} USD</b> for <b>“${e(title)}”</b> was the highest. The work is yours.`,
            checkoutUrl
              ? `Complete your payment securely to close the acquisition. As soon as it’s confirmed, you’ll receive your collection certificate and we’ll write to arrange shipping.`
              : `We’ll write to you separately to arrange secure payment and shipping.`,
          ]
        : [
            `Tu puja de <b>$${amount} USD</b> por <b>“${e(title)}”</b> fue la más alta. La obra es tuya.`,
            checkoutUrl
              ? `Completa el pago de forma segura para cerrar la adquisición. Apenas se confirme, recibirás tu certificado de colección y te escribiremos para coordinar el envío.`
              : `Te escribimos por separado para coordinar el pago seguro y el envío de la obra.`,
          ],
      cta: checkoutUrl ? { label: en ? 'Pay now' : 'Pagar ahora', href: checkoutUrl } : undefined,
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
      note: en ? 'Payment is processed in USD through a secure checkout.' : 'El cobro se realiza en USD a través de un pago seguro.',
    }),
  };
}

// ── Coleccionista: pago confirmado ──
export function paymentConfirmed(locale, { amount, title, certUrl }) {
  const en = locale === 'en';
  return {
    subject: en ? `Your payment for "${title}" is confirmed — MANCHA` : `Tu pago por "${title}" fue confirmado — MANCHA`,
    html: brandedEmail({
      locale,
      heading: en ? 'It’s yours' : 'Ya es tuya',
      lead: en ? 'Thank you for collecting before the world.' : 'Gracias por coleccionar antes que el mundo.',
      paragraphs: en
        ? [
            `We’ve confirmed your payment of <b>$${amount} USD</b> for <b>“${e(title)}”</b>.`,
            `This work is unique and now part of your collection. We’ve issued a <b>collection certificate</b> in your name, attesting that you discovered it here.`,
            `In the next few hours we’ll write to arrange shipping with fine-art packaging.`,
          ]
        : [
            `Confirmamos tu pago de <b>$${amount} USD</b> por <b>“${e(title)}”</b>.`,
            `Esta obra es única y ahora forma parte de tu colección. Generamos un <b>certificado de colección</b> a tu nombre que acredita que la descubriste aquí.`,
            `En las próximas horas te escribimos para coordinar el envío con embalaje de obra de arte.`,
          ],
      cta: { label: en ? 'View my certificate' : 'Ver mi certificado', href: certUrl },
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
    }),
  };
}

// ── Coleccionista: recordatorio de pago ──
export function paymentReminder(locale, { name, title, checkoutUrl }) {
  const en = locale === 'en';
  return {
    subject: en ? `Reminder: your payment for "${title}" is pending — MANCHA` : `Recordatorio: tu pago por "${title}" sigue pendiente — MANCHA`,
    html: brandedEmail({
      locale,
      heading: en ? 'Your work is waiting' : 'Tu obra te espera',
      lead: en ? `Hi ${e(name)}.` : `Hola ${e(name)}.`,
      paragraphs: en
        ? [
            `You won the bid for <b>“${e(title)}”</b>, but we don’t see your payment completed yet.`,
            checkoutUrl
              ? `You can finish the purchase securely from the button below. As soon as it’s confirmed, you’ll receive your collection certificate.`
              : `Write to us to arrange payment so you don’t lose the piece.`,
          ]
        : [
            `Ganaste la puja por <b>“${e(title)}”</b>, pero todavía no vemos tu pago completado.`,
            checkoutUrl
              ? `Puedes terminar la compra de forma segura desde el botón de abajo. Apenas se confirme, recibirás tu certificado de colección.`
              : `Escríbenos para coordinar el pago y no perder la pieza.`,
          ],
      cta: checkoutUrl ? { label: en ? 'Complete my payment' : 'Completar mi pago', href: checkoutUrl } : undefined,
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
      note: en ? 'If payment isn’t completed in the next few days, we may offer the work to the next highest bid.' : 'Si el pago no se completa en los próximos días, podríamos ofrecer la obra a la siguiente puja más alta.',
    }),
  };
}

// ── Lista de espera / interés ──
export function waitlist(locale, { pieceTitle }) {
  const en = locale === 'en';
  if (pieceTitle) {
    return {
      subject: en ? `We’ll keep you posted on "${pieceTitle}" — MANCHA` : `Te avisamos sobre "${pieceTitle}" — MANCHA`,
      html: brandedEmail({
        locale,
        heading: en ? 'We’ll let you know' : 'Te avisaremos',
        paragraphs: en
          ? [
              `We noted your interest in <b>“${e(pieceTitle)}”</b>.`,
              `We’ll write the moment there’s news about this work. At MANCHA every piece is unique: we let you know in time so it doesn’t slip away.`,
            ]
          : [
              `Anotamos tu interés en <b>“${e(pieceTitle)}”</b>.`,
              `Te escribiremos en cuanto haya novedades sobre esta obra. En MANCHA cada pieza es única: avisamos a tiempo para que no se te escape.`,
            ],
        signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
        note: en ? 'You’re getting this because you left your address at manchagallery.com.' : 'Recibes este correo porque dejaste tu dirección en manchagallery.com.',
      }),
    };
  }
  return {
    subject: en ? 'You’re on the MANCHA waitlist' : 'Estás en la lista de espera de MANCHA',
    html: brandedEmail({
      locale,
      heading: en ? 'You’re on the list' : 'Estás en la lista',
      lead: en ? 'Welcome to MANCHA.' : 'Bienvenido a MANCHA.',
      paragraphs: en
        ? [
            `You’re on the waitlist. You’ll be among the first to know when a new season opens or new artists join.`,
            `MANCHA is a gallery by seasons: few works, chosen by hand, available for a limited time. When something moves, it reaches you here first.`,
          ]
        : [
            `Quedaste en la lista de espera. Serás de los primeros en saber cuándo abre una nueva temporada o entran nuevos artistas.`,
            `MANCHA es una galería por temporadas: pocas obras, elegidas a mano, disponibles por tiempo limitado. Cuando algo se mueva, te llega aquí primero.`,
          ],
      signoff: en ? 'The MANCHA team' : 'El equipo de MANCHA',
      note: en ? 'You’re getting this because you left your address at manchagallery.com.' : 'Recibes este correo porque dejaste tu dirección en manchagallery.com.',
    }),
  };
}
