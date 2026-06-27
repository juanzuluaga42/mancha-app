import Stripe from 'stripe';

let stripe = null;

function getStripe() {
  if (stripe) return stripe;
  if (!process.env.STRIPE_SECRET_KEY) return null;
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

export async function createCheckoutLink({ pieceId, pieceTitle, amountUsd, buyerEmail }) {
  const client = getStripe();
  if (!client) {
    console.error('Falta STRIPE_SECRET_KEY — no se generó link de pago.');
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manchagallery.com';

  try {
    const session = await client.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: buyerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `MANCHA — ${pieceTitle}` },
            unit_amount: Math.round(Number(amountUsd) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pago/exito?piece=${pieceId}`,
      cancel_url: `${baseUrl}/obras/${pieceId}`,
      metadata: { pieceId },
    });
    return session.url;
  } catch (e) {
    console.error('Error creando el link de pago de Stripe:', e.message);
    return null;
  }
}
