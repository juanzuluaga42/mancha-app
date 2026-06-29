import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendEmail, brandedEmail, notifyAdmin } from '@/lib/email';
import { paymentConfirmed, recipientLocale } from '@/lib/emails';
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
        const loc = await recipientLocale(supabase, { email: buyerEmail });
        const { subject, html } = paymentConfirmed(loc, {
          amount: ((session.amount_total ?? 0) / 100).toLocaleString(loc === 'en' ? 'en-US' : 'es-AR'),
          title: piece?.title ?? pieceId,
          certUrl: `${baseUrl}/obras/${pieceId}/certificado`,
        });
        await sendEmail({ to: buyerEmail, subject, html });
      }
    }
  }

  return new Response('ok', { status: 200 });
}
