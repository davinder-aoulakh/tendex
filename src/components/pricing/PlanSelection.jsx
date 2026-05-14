import { useState } from 'react';
import { Check, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const PLANS = {
  free: {
    name: 'Free Trial',
    price: 'Free',
    duration: '14 days',
    description: 'Perfect for getting started',
    features: [
      '1 active procurement document',
      'Scope of Work generation',
      '1 document type (SOW, EOI, RFQ, or RFP)',
      'Basic email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  professional: {
    name: 'Professional Plan',
    price: '[TBC]',
    duration: 'Monthly or Annual',
    description: 'For growing procurement teams',
    features: [
      'Unlimited active procurements',
      'All document types (SOW, EOI, RFQ, RFP)',
      'Word & PDF export',
      'Priority email support',
      '[Additional features TBC]',
    ],
    cta: 'Choose Plan',
    highlighted: true,
  },
};

export default function PlanSelection({ onSelectPlan, loading = false }) {
  const [processingPlan, setProcessingPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleFreeTrial = async () => {
    setProcessingPlan('free');
    setError(null);
    try {
      const user = await base44.auth.me();
      if (!user) {
        setError('Please sign in to start your free trial');
        setProcessingPlan(null);
        return;
      }

      // Create subscription record for free trial (14 days)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const sub = await base44.entities.Subscription.create({
        user_email: user.email,
        plan: 'free',
        status: 'active',
        documents_limit: 1,
        documents_used: 0,
        renewal_date: trialEndDate.toISOString().split('T')[0],
        billing_cycle: 'monthly',
      });

      onSelectPlan(sub);
    } catch (err) {
      setError(err.message || 'Failed to start trial. Please try again.');
      setProcessingPlan(null);
    }
  };

  const handlePaidPlan = async () => {
    setProcessingPlan('professional');
    setError(null);
    try {
      const user = await base44.auth.me();
      if (!user) {
        setError('Please sign in to choose a paid plan');
        setProcessingPlan(null);
        return;
      }

      // Initiate Stripe checkout
      const response = await base44.functions.invoke('createCheckoutSession', {
        email: user.email,
        planId: 'professional',
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to initialize payment. Please try again.');
        setProcessingPlan(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment. Please try again.');
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, rgba(8,13,36,0.5) 0%, rgba(30,58,138,0.3) 100%)' }}>
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-white mb-2">Choose Your Plan</h1>
          <p className="text-lg text-blue-200/60">Select the plan that works best for your team</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-2xl border transition-all duration-300 p-8 flex flex-col ${
                plan.highlighted
                  ? 'border-blue-400/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-xl shadow-blue-500/20 scale-105 md:scale-100'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Plan name & price */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-blue-300 mb-1">{plan.price}</p>
                <p className="text-sm text-blue-200/50">{plan.duration}</p>
                <p className="text-sm text-white/40 mt-2">{plan.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-100/70">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={key === 'free' ? handleFreeTrial : handlePaidPlan}
                disabled={loading || processingPlan !== null}
                className={`w-full gap-2 ${
                  plan.highlighted
                    ? 'bg-blue-500 hover:bg-blue-400 text-white border-0'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {processingPlan === key ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {plan.cta}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-xs text-blue-200/40 max-w-2xl mx-auto">
            Pricing and features are placeholder values [TBC] pending final confirmation by the TendeX team.
            Free trial includes 1 active procurement document. Paid plan features and pricing to be confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}