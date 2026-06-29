import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendEmail, brandedEmail, notifyAdmin } from '@/lib/email';
import { escapeHtml } from '@/lib/utils';

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Faltan variables de Stripe en el servidor.', { status: 500 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return new Response('Faltan variables de Supabase en el servidor.', { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response('Firma inválida.', { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manchagallery.com';

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pieceId = session.metadata?.pieceId;

    if (pieceId) {
      const supabase = createAdminClient();

      const { data: piece } = await supabase
        .from('pieces')
        .select('title')
        .eq('id', pieceId)
        .maybeSingle();

      await supabase
        .from('pieces')
        .update({ paid_at: new Date().toISOString() })
        .eq('id', pieceId);

      await notifyAdmin({
        subject: `Pago confirmado: "${piece?.title ?? pieceId}"`,
        html: brandedEmail({
          heading: 'Pago confirmado',
          lead: 'Una obra encontró a su coleccionista.',
          paragraphs: [
            `Stripe confirmó el pago de <b>“${escapeHtml(piece?.title ?? pieceId)}”</b>.`,
            `<b>Comprador:</b> ${escapeHtml(session.customer_details?.email ?? 'sin correo')}`,
            `<b>Monto:</b> $${((session.amount_total ?? 0) / 100).toLocaleString('es-AR')} USD`,
            `Queda coordinar el envío de la pieza.`,
          ],
          note: 'Aviso automático del sistema de MANCHA.',
        }),
      });

      const buyerEmail = session.customer_details?.email;
      if (buyerEmail) {
        await sendEmail({
          to: buyerEmail,
          subject: `Tu pago por "${piece?.title ?? pieceId}" fue confirmado — MANCHA`,
          html: brandedEmail({
            heading: 'Ya es tuya',
            lead: 'Gracias por coleccionar antes que el mundo.',
            paragraphs: [
              `Confirmamos tu pago de <b>$${((session.amount_total ?? 0) / 100).toLocaleString('es-AR')} USD</b> por <b>“${escapeHtml(piece?.title ?? pieceId)}”</b>.`,
              `Esta obra es única y ahora forma parte de tu colección. Generamos un <b>certificado de colección</b> a tu nombre que acredita que la descubriste aquí.`,
              `En las próximas horas te escribimos para coordinar el envío con embalaje de obra de arte.`,
            ],
            cta: { label: 'Ver mi certificado', href: `${baseUrl}/obras/${pieceId}/certificado` },
            signoff: 'El equipo de MANCHA',
          }),
        });
      }
    }
  }

  return new Response('ok', { status: 200 });
}
