import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICE_IDS = {
  starter: 'price_1TNCvcIjVOWW0K2a5bfYGtb5',
  professional: 'price_1TNCvcIjVOWW0K2areYQXQoE',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, successUrl, cancelUrl } = await req.json();
    const priceId = PRICE_IDS[plan];
    if (!priceId) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    // Find or create Stripe customer
    const subs = await base44.entities.Subscription.filter({ user_email: user.email });
    let customerId = subs[0]?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.full_name });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.get('origin')}/billing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/billing?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        plan,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});