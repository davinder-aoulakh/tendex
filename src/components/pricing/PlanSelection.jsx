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
      '25 active procurement documents',
      'Scope of Work generation',
      'All document types (SOW, EOI, RFQ, or RFP)',
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
        documents_limit: 25,
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
      style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-syne text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Choose Your Plan</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Select the plan that works best for your team</p>
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
              className="relative rounded-2xl border transition-all duration-300 p-8 flex flex-col"
              style={plan.highlighted
                 ? { borderColor: 'var(--primary)', background: 'rgba(200,30,58,0.08)', boxShadow: '0 0 0 2px rgba(200,30,58,0.15)' }
                 : { borderColor: 'var(--border)', background: 'var(--card)' }}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Plan name & price */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                <p className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{plan.price}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.duration}</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={key === 'free' ? handleFreeTrial : handlePaidPlan}
                disabled={loading || processingPlan !== null}
                className="w-full gap-2 border-0"
                style={plan.highlighted
                  ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
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
        <div className="text-center space-y-3">
          <p className="text-xs max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Pricing and features are placeholder values [TBC] pending final confirmation by the TendeX team.
            Free trial includes 25 active procurement documents. Paid plan features and pricing to be confirmed.
          </p>

          <p className="text-xs max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            By starting a trial or purchasing a plan, you agree to our{' '}
            <a href="/terms" className="hover:underline transition-colors" style={{ color: 'var(--primary)' }}>Terms of Service</a> and{' '}
            <a href="/privacy" className="hover:underline transition-colors" style={{ color: 'var(--primary)' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}