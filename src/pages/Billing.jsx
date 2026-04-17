import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Crown, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/layout/AppLayout';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    docsLimit: 3,
    icon: Zap,
    features: ['3 documents per month', 'SOW, EOI, RFQ & RFP', 'AI content generation', 'PDF export', 'Document history'],
    color: 'text-muted-foreground',
    buttonVariant: 'outline',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    docsLimit: 20,
    icon: Crown,
    features: ['20 documents per month', 'All document types', 'Advanced AI enhancement', 'Priority email support', 'Document history', 'Early access to new features'],
    color: 'text-primary',
    buttonVariant: 'default',
    highlight: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$79',
    period: '/month',
    docsLimit: 999,
    icon: Building2,
    features: ['Unlimited documents', 'All document types', 'Advanced AI enhancement', 'Dedicated support', 'Document history', 'Priority AI processing'],
    color: 'text-purple-600',
    buttonVariant: 'outline',
  },
];

export default function Billing() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents-count'],
    queryFn: () => base44.entities.Document.list(),
  });

  const currentSub = subscriptions[0];
  const currentPlan = currentSub?.plan || 'free';
  const docsThisMonth = documents.length;

  const planLimits = { free: 3, starter: 20, professional: 999 };
  const docsLimit = planLimits[currentPlan] || 3;

  const handleUpgrade = (planId) => {
    // In a real app, this would open Stripe checkout
    alert(`Stripe billing integration coming soon! Plan: ${planId}`);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Billing & Plans</h1>
          <p className="text-muted-foreground">Manage your subscription and usage.</p>
        </div>

        {/* Current Usage */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Current Plan</h2>
            <Badge variant="secondary" className="capitalize">{currentPlan}</Badge>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Documents used this month</span>
            <span className="text-sm font-medium">{docsThisMonth} / {docsLimit === 999 ? '∞' : docsLimit}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${Math.min((docsThisMonth / Math.max(docsLimit, 1)) * 100, 100)}%` }}
            />
          </div>
          {docsThisMonth >= docsLimit && docsLimit !== 999 && (
            <p className="text-sm text-destructive mt-2">You've reached your document limit. Upgrade to continue.</p>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-7 relative ${plan.highlight ? 'border-primary shadow-lg' : 'border-border bg-card'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${plan.highlight ? 'bg-primary/10' : 'bg-secondary'}`}>
                <plan.icon className={`w-5 h-5 ${plan.color}`} />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feat}</span>
                  </li>
                ))}
              </ul>
              {currentPlan === plan.id ? (
                <Button className="w-full" variant="secondary" disabled>Current Plan</Button>
              ) : (
                <Button className="w-full gap-2" variant={plan.buttonVariant} onClick={() => handleUpgrade(plan.id)}>
                  <CreditCard className="w-4 h-4" />{currentPlan === 'free' ? 'Upgrade' : plan.id === 'free' ? 'Downgrade' : 'Switch Plan'}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}