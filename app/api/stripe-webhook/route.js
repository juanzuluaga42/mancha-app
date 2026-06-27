import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendEmail } from '@/lib/email';
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

      await sendEmail({
        to: 'mancha.gallery@gmail.com',
        subject: `💰 Pago confirmado: "${piece?.title ?? pieceId}"`,
        html: `
          <div style="font-family: sans-serif;">
            <p>Stripe confirmó el pago de la pieza "${escapeHtml(piece?.title ?? pieceId)}" por ${escapeHtml(session.customer_details?.email ?? 'un comprador')}.</p>
            <p>Monto: $${((session.amount_total ?? 0) / 100).toLocaleString('es-AR')}</p>
          </div>
        `,
      });

      const buyerEmail = session.customer_details?.email;
      if (buyerEmail) {
        await sendEmail({
          to: buyerEmail,
          subject: `Tu pago por "${piece?.title ?? pieceId}" fue confirmado — MANCHA`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
              <h2 style="margin-bottom: 4px;">¡Gracias, ya es tuya!</h2>
              <p>Confirmamos tu pago de $${((session.amount_total ?? 0) / 100).toLocaleString('es-AR')} por <strong>"${escapeHtml(piece?.title ?? pieceId)}"</strong>.</p>
              <p style="margin: 20px 0;"><a href="${baseUrl}/obras/${pieceId}/certificado" style="background:#16110D;color:#FAF3E6;padding:12px 22px;text-decoration:none;font-size:14px;">Ver tu certificado de colección →</a></p>
              <p>Te escribimos por separado en las próximas horas para coordinar el envío.</p>
              <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
            </div>
          `,
        });
      }
    }
  }

  return new Response('ok', { status: 200 });
}
