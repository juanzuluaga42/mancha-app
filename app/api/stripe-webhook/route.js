import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Faltan variables de Stripe en el servidor.', { status: 500 });
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

      await supabase.from('pieces').update({ paid_at: new Date().toISOString() }).eq('id', pieceId);

      await sendEmail({
        to: 'mancha.gallery@gmail.com',
        subject: `💰 Pago confirmado: "${piece?.title ?? pieceId}"`,
        html: `
          <div style="font-family: sans-serif;">
            <p>Stripe confirmó el pago de la pieza "${piece?.title ?? pieceId}" por ${session.customer_details?.email ?? 'un comprador'}.</p>
            <p>Monto: $${((session.amount_total ?? 0) / 100).toLocaleString('es-AR')}</p>
          </div>
        `,
      });
    }
  }

  return new Response('ok', { status: 200 });
}
