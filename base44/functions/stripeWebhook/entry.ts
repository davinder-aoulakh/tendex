import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLAN_LIMITS = { starter: 20, professional: 999 };
const PRICE_TO_PLAN = {
  'price_1TNCvcIjVOWW0K2a5bfYGtb5': 'starter',
  'price_1TNCvcIjVOWW0K2areYQXQoE': 'professional',
};

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response('Webhook Error', { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata?.user_email;
      const plan = session.metadata?.plan;
      if (!userEmail || !plan) return Response.json({ received: true });

      const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });

      const subData = {
        user_email: userEmail,
        plan,
        status: 'active',
        documents_limit: PLAN_LIMITS[plan] || 3,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        billing_cycle: 'monthly',
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, subData);
      } else {
        await base44.asServiceRole.entities.Subscription.create(subData);
      }
      console.log(`Subscription created/updated for ${userEmail}: ${plan}`);
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const priceId = subscription.items?.data?.[0]?.price?.id;
      const plan = PRICE_TO_PLAN[priceId] || 'free';
      const status = subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'cancelled' : 'expired';

      const customer = await stripe.customers.retrieve(subscription.customer);
      const userEmail = customer.email;
      if (!userEmail) return Response.json({ received: true });

      const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
      if (existing.length > 0) {
        const update = event.type === 'customer.subscription.deleted'
          ? { plan: 'free', status: 'cancelled', documents_limit: 3, stripe_subscription_id: '' }
          : { plan, status, documents_limit: PLAN_LIMITS[plan] || 3 };
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, update);
        console.log(`Subscription ${event.type} for ${userEmail}`);
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }

  return Response.json({ received: true });
});