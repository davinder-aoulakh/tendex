import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';

const PLANS = {
  free: {
    name: 'Free Trial',
    price: 'Free',
    duration: '14 days',
    features: [
      '1 active procurement document',
      'Scope of Work generation',
      '1 document type (SOW, EOI, RFQ, or RFP)',
      'Basic email support',
    ],
  },
  professional: {
    name: 'Professional Plan',
    price: '[TBC]',
    duration: 'Monthly or Annual',
    features: [
      'Unlimited active procurements',
      'All document types (SOW, EOI, RFQ, RFP)',
      'Word & PDF export',
      'Priority email support',
      '[Additional features TBC]',
    ],
  },
};

export default function Billing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate('/');
          return;
        }
        setUser(currentUser);

        const subs = await base44.entities.Subscription.filter({
          user_email: currentUser.email,
        });
        if (subs.length > 0) {
          setSubscription(subs[0]);
        }
      } catch (err) {
        console.error('Error loading billing data:', err);
        setError('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleUpgradeToPaid = async () => {
    setProcessingPayment(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        email: user.email,
        planId: 'professional',
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to initialize payment. Please try again.');
        setProcessingPayment(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access after the current billing period.')) {
      return;
    }

    setProcessingPayment(true);
    setError(null);
    try {
      await base44.functions.invoke('cancelSubscription', {
        subscriptionId: subscription.stripe_subscription_id,
      });

      // Update local subscription status
      setSubscription(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription. Please try again.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-blue-200/50 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Billing & Plans</h1>
        <p className="text-blue-200/60 mb-8">Manage your subscription and upgrade your plan</p>

        {/* Current subscription status */}
        {subscription && (
          <div className={`rounded-lg border px-6 py-4 mb-8 ${
            subscription.status === 'active'
              ? 'border-green-400/30 bg-green-400/10'
              : 'border-yellow-400/30 bg-yellow-400/10'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">
                {subscription.plan === 'free' ? 'Free Trial Active' : `${PLANS[subscription.plan]?.name} Active`}
              </h3>
            </div>
            <p className="text-sm text-blue-200/60">
              Status: <span className="font-semibold text-blue-300">{subscription.status}</span>
            </p>
            {subscription.plan === 'free' && subscription.renewal_date && (
              <p className="text-sm text-blue-200/60 mt-2">
                Trial expires: <span className="font-semibold text-blue-300">{new Date(subscription.renewal_date).toLocaleDateString('en-AU')}</span>
              </p>
            )}
            {subscription.status === 'active' && subscription.plan !== 'free' && subscription.renewal_date && (
              <p className="text-sm text-blue-200/60 mt-2">
                Renews: <span className="font-semibold text-blue-300">{new Date(subscription.renewal_date).toLocaleDateString('en-AU')}</span>
              </p>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Plans comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`rounded-xl border p-6 transition-all ${
                  subscription?.plan === key
                    ? 'border-blue-400/50 bg-blue-500/10 ring-2 ring-blue-400/30'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-2xl font-bold text-blue-300">{plan.price}</p>
                  <p className="text-sm text-blue-200/50">{plan.duration}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-blue-100/70">{feature}</span>
                    </div>
                  ))}
                </div>

                {subscription?.plan === key ? (
                  <Button disabled className="w-full bg-green-500/20 text-green-400 border border-green-400/30">
                    <Check className="w-4 h-4 mr-2" /> Current Plan
                  </Button>
                ) : key === 'professional' ? (
                  <Button
                    onClick={handleUpgradeToPaid}
                    disabled={processingPayment}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white border-0"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upgrade to Professional'
                    )}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Subscription management */}
        {subscription?.status === 'active' && subscription?.plan !== 'free' && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription Management</h3>
            <Button
              onClick={handleCancelSubscription}
              disabled={processingPayment}
              variant="destructive"
              className="bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30"
            >
              Cancel Subscription
            </Button>
            <p className="text-xs text-blue-200/50 mt-3">
              You will retain access until the end of your current billing period.
            </p>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-blue-200/40">
            Pricing and features are placeholder values [TBC] pending final confirmation.
            <br />
            For support, contact support@tendex.com.au
          </p>
        </div>
      </div>
    </AppLayout>
  );
}