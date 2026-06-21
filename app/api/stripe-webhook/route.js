import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Faltan STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET.');
    return new Response('Faltan variables de Stripe en el servidor.', { status: 500 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Faltan SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL.');
    return new Response('Faltan variables de Supabase en el servidor.', { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Firma de webhook inválida:', err.message);
    return new Response('Firma inválida.', { status: 400 });
  }

  console.log('Webhook recibido:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pieceId = session.metadata?.pieceId;
    console.log('pieceId del metadata:', pieceId);

    if (pieceId) {
      const supabase = createAdminClient();

      const { data: piece, error: fetchError } = await supabase
        .from('pieces')
        .select('title')
        .eq('id', pieceId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error leyendo la pieza con la clave de servicio:', JSON.stringify(fetchError));
      } else {
        console.log('Pieza encontrada:', piece?.title);
      }

      const { error: updateError } = await supabase
        .from('pieces')
        .update({ paid_at: new Date().toISOString() })
        .eq('id', pieceId);

      if (updateError) {
        console.error('Error actualizando paid_at:', JSON.stringify(updateError));
      } else {
        console.log('paid_at actualizado para la pieza', pieceId);
      }

      const emailResult = await sendEmail({
        to: 'mancha.gallery@gmail.com',
        subject: `💰 Pago confirmado: "${piece?.title ?? pieceId}"`,
        html: `
          <div style="font-family: sans-serif;">
            <p>Stripe confirmó el pago de la pieza "${piece?.title ?? pieceId}" por ${session.customer_details?.email ?? 'un comprador'}.</p>
            <p>Monto: $${((session.amount_total ?? 0) / 100).toLocaleString('es-AR')}</p>
          </div>
        `,
      });
      console.log('Resultado de sendEmail (founder):', JSON.stringify(emailResult));

      const buyerEmail = session.customer_details?.email;
      if (buyerEmail) {
        const buyerEmailResult = await sendEmail({
          to: buyerEmail,
          subject: `Tu pago por "${piece?.title ?? pieceId}" fue confirmado — MANCHA`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
              <h2 style="margin-bottom: 4px;">¡Gracias, ya es tuya!</h2>
              <p>Confirmamos tu pago de $${((session.amount_total ?? 0) / 100).toLocaleString('es-AR')} por <strong>"${piece?.title ?? pieceId}"</strong>.</p>
              <p>Te escribimos por separado en las próximas horas para coordinar el envío.</p>
              <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
            </div>
          `,
        });
        console.log('Resultado de sendEmail (comprador):', JSON.stringify(buyerEmailResult));
      } else {
        console.error('No vino customer_details.email en la sesión — no se le pudo confirmar al comprador.');
      }
    } else {
      console.error('El evento llegó sin pieceId en metadata — no se actualizó nada.');
    }
  }

  return new Response('ok', { status: 200 });
}
