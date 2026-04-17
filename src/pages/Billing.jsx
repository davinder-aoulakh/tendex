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
    highlight: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    docsLimit: 20,
    icon: Crown,
    features: ['20 documents per month', 'All document types', 'Advanced AI enhancement', 'Priority email support', 'Document history', 'Early access to new features'],
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
    highlight: false,
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
    alert(`Stripe billing integration coming soon! Plan: ${planId}`);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold text-white mb-2">Billing & Plans</h1>
          <p className="text-blue-200/50">Manage your subscription and usage.</p>
        </div>

        {/* Current Usage */}
        <div className="rounded-2xl border border-white/10 p-6 mb-10" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Current Plan</h2>
            <Badge className="capitalize bg-blue-500/20 text-blue-300 border-blue-500/30">{currentPlan}</Badge>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-200/50">Documents used this month</span>
            <span className="text-sm font-medium text-white">{docsThisMonth} / {docsLimit === 999 ? '∞' : docsLimit}</span>
          </div>
          <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="bg-blue-500 rounded-full h-2 transition-all"
              style={{ width: `${Math.min((docsThisMonth / Math.max(docsLimit, 1)) * 100, 100)}%` }}
            />
          </div>
          {docsThisMonth >= docsLimit && docsLimit !== 999 && (
            <p className="text-sm text-red-400 mt-2">You've reached your document limit. Upgrade to continue.</p>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-7 relative ${plan.highlight ? 'border-blue-400/50 shadow-xl shadow-blue-500/10' : 'border-white/10'}`}
              style={{ background: plan.highlight ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)' }}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white border-0">Most Popular</Badge>
                </div>
              )}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <plan.icon className={`w-5 h-5 ${plan.highlight ? 'text-blue-300' : 'text-white/50'}`} />
              </div>
              <h3 className="font-semibold text-lg text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-blue-200/50 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100/70">{feat}</span>
                  </li>
                ))}
              </ul>
              {currentPlan === plan.id ? (
                <Button className="w-full bg-white/10 text-white/50 border border-white/10 hover:bg-white/10 cursor-default" disabled>Current Plan</Button>
              ) : (
                <Button className={`w-full gap-2 border-0 ${plan.highlight ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 hover:bg-white/15 text-white'}`}
                  onClick={() => handleUpgrade(plan.id)}>
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