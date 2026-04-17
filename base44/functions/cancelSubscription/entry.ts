import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const subs = await base44.entities.Subscription.filter({ user_email: user.email });
    const sub = subs[0];
    if (!sub?.stripe_subscription_id) return Response.json({ error: 'No active subscription' }, { status: 400 });

    await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    await base44.entities.Subscription.update(sub.id, { plan: 'free', status: 'cancelled', documents_limit: 3, stripe_subscription_id: '' });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Cancel error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});