import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, AlertCircle, ArrowLeft, CreditCard, FileText, Download, Info } from 'lucide-react';
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
      '1 document type (SOW, EOI, RFQ or RFP)',
      'Basic email support',
    ],
  },
  professional: {
    name: 'Professional Plan',
    price: null,
    duration: 'Monthly or annual',
    features: [
      'Unlimited active procurements',
      'All document types (SOW, EOI, RFQ, RFP)',
      'PDF export',
      'Priority email support',
    ],
  },
};

export default function Billing() {
  const navigate = useNavigate();
  const [user, setUser]                     = useState(null);
  const [subscription, setSubscription]     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError]                   = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) { navigate('/'); return; }
        setUser(currentUser);
        const subs = await base44.entities.Subscription.filter({ user_email: currentUser.email });
        if (subs.length > 0) setSubscription(subs[0]);
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
        setError('Failed to initialise payment. Please try again.');
        setProcessingPayment(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access after the current billing period.')) return;
    setProcessingPayment(true);
    setError(null);
    try {
      await base44.functions.invoke('cancelSubscription', {
        subscriptionId: subscription.stripe_subscription_id,
      });
      setSubscription(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription. Please try again.');
      setProcessingPayment(false);
    }
  };

  // ── HELPERS ──────────────────────────────────────────────────────

  const isPaid  = subscription?.plan && subscription.plan !== 'free';
  const isFree  = !isPaid;
  const isActive = subscription?.status === 'active';

  const trialDaysLeft = (() => {
    if (!subscription?.renewal_date || !isFree) return null;
    const days = Math.ceil((new Date(subscription.renewal_date) - new Date()) / 86400000);
    return days > 0 ? days : 0;
  })();

  const renewalDateFormatted = subscription?.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  // ── SHARED STYLES ─────────────────────────────────────────────────

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '24px 26px',
    boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
    marginBottom: 20,
  };

  const cardTitleStyle = {
    display: 'flex', alignItems: 'center', gap: 9,
    fontSize: 15, fontWeight: 700, margin: '0 0 4px',
    color: 'var(--text-primary)',
  };

  const cardSubStyle = {
    fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 18px',
  };

  // ── LOADING ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Loader2 style={{ width: 32, height: 32, color: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </AppLayout>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 38px 60px' }}>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer',
            marginBottom: 16, padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Back
        </button>

        {/* Page title */}
        <div style={{ marginBottom: 26 }}>
          <h1 style={{ fontSize: 25, margin: '0 0 4px', fontWeight: 800, letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            Billing &amp; Plans
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Manage your subscription and upgrade your plan.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 10, padding: '12px 16px', marginBottom: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0, color: 'var(--destructive)' }} />
            <p style={{ fontSize: 13, color: 'var(--destructive)', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Status card */}
        {subscription && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: isActive ? 'var(--success-subtle)' : 'var(--warning-subtle)',
            border: '1px solid ' + (isActive ? 'var(--success-border)' : 'var(--warning-border)'),
            borderRadius: 12, padding: '15px 18px', marginBottom: 34,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'var(--card)', color: isActive ? 'var(--success)' : 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? 'var(--success)' : 'var(--warning)' }}>
                {isFree ? 'Free Trial Active' : (PLANS[subscription.plan]?.name + ' Active')}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: 1 }}>
                Status: <strong style={{ color: 'var(--text-primary)' }}>{subscription.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : '—'}</strong>
                {isFree && trialDaysLeft !== null && (
                  <span> &middot; <strong style={{ color: 'var(--text-primary)' }}>{trialDaysLeft} days remaining</strong></span>
                )}
                {isPaid && renewalDateFormatted && (
                  <span> &middot; Renews <strong style={{ color: 'var(--text-primary)' }}>{renewalDateFormatted}</strong></span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: 'var(--text-primary)' }}>
          Available Plans
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 30 }} className="billing-plans-grid">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = subscription?.plan === key;
            return (
              <div
                key={key}
                style={{
                  background: 'var(--card)',
                  border: isCurrent ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 16, padding: '26px 24px',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
                  position: 'relative',
                }}
              >
                {/* Current plan floating badge */}
                {isCurrent && (
                  <div style={{
                    position: 'absolute', top: -11, left: 24,
                    background: 'var(--primary)', color: '#fff',
                    fontSize: '10.5px', fontWeight: 700, padding: '3px 10px',
                    borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    Current Plan
                  </div>
                )}

                {/* Plan name */}
                <div style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                  {plan.name}
                </div>

                {/* Price */}
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', marginBottom: 2, color: 'var(--text-primary)' }}>
                  {key === 'free'
                    ? 'Free'
                    : <span style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600 }}>Pricing (TBC)</span>
                  }
                </div>

                {/* Duration */}
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 20 }}>
                  {plan.duration}
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', margin: '0 0 22px', padding: 0, flex: 1 }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 11, lineHeight: 1.4 }}>
                      <span style={{
                        width: 17, height: 17, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                        background: 'var(--success-subtle)', color: 'var(--success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check style={{ width: 10, height: 10, strokeWidth: 2.4 }} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div style={{
                    textAlign: 'center', padding: '10px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                    background: 'var(--muted)', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Check style={{ width: 14, height: 14, color: 'var(--success)' }} />
                    Current Plan
                  </div>
                ) : key === 'professional' ? (
                  <a
                    href="mailto:hello@tendex.com.au?subject=TendeX Professional Plan Enquiry"
                    style={{
                      display: 'block', textAlign: 'center', padding: '10px', borderRadius: 9,
                      fontSize: 13, fontWeight: 700, background: 'var(--primary)', color: '#fff',
                      textDecoration: 'none', cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#a9182f'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                  >
                    Contact us
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Plans grid responsive */}
        <style>{`@media (max-width: 760px) { .billing-plans-grid { grid-template-columns: 1fr !important; } }`}</style>

        {/* Payment Method — only for paid subscribers */}
        {isPaid && (
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <CreditCard style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
              Payment Method
            </div>
            <p style={cardSubStyle}>The card used for your subscription payments.</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 30, borderRadius: 6, background: 'var(--muted)',
                  color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CreditCard style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {subscription?.stripe_card_brand
                      ? subscription.stripe_card_brand + ' ending in ' + subscription.stripe_last4
                      : 'Card on file'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {subscription?.stripe_card_exp || 'Managed via Stripe'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpgradeToPaid}
                disabled={processingPayment}
                style={{
                  background: 'transparent', color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)', padding: '9px 16px',
                  borderRadius: 9, fontWeight: 700, fontSize: 13,
                  cursor: processingPayment ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                  opacity: processingPayment ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!processingPayment) e.currentTarget.style.background = 'var(--muted)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {processingPayment ? 'Processing...' : 'Update payment method'}
              </button>
            </div>

            {renewalDateFormatted && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--action-subtle)', border: '1px solid var(--action-border)',
                borderRadius: 10, padding: '11px 16px', marginTop: 16,
                fontSize: '12.5px', color: 'var(--text-primary)',
              }}>
                <Info style={{ width: 14, height: 14, color: 'var(--action)', flexShrink: 0 }} />
                <span>
                  Your next payment is due <strong>{renewalDateFormatted}</strong>.
                </span>
              </div>
            )}

            {/* Cancel subscription — only for active paid plans */}
            {subscription?.status === 'active' && (
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleCancelSubscription}
                  disabled={processingPayment}
                  style={{
                    background: 'none', border: 'none', cursor: processingPayment ? 'not-allowed' : 'pointer',
                    color: 'var(--text-muted)', fontSize: 12, fontFamily: 'inherit', padding: 0,
                    textDecoration: 'underline', opacity: processingPayment ? 0.5 : 1,
                  }}
                >
                  Cancel subscription
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>
                  You will retain access until the end of your current billing period.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Invoice History — only for paid subscribers */}
        {isPaid && (
          <div style={cardStyle}>
            <div style={cardTitleStyle}>
              <FileText style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
              Invoice History
            </div>
            <p style={cardSubStyle}>Download past invoices for your records.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date', 'Amount', 'Status', ''].map((h, i) => (
                    <th key={i} style={{
                      textAlign: 'left', fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: 'var(--text-muted)', padding: '0 0 10px',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Invoice rows would be populated from Stripe invoice data.
                    For now show an empty-state row until invoices are fetched. */}
                <tr>
                  <td colSpan={4} style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    Invoice history will appear here once payments have been processed.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 10 }}>
          Pricing and features are placeholder values, pending final confirmation.
          <br />
          For support, contact{' '}
          <a href="mailto:support@tendex.com.au" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
            support@tendex.com.au
          </a>
        </p>

      </div>
    </AppLayout>
  );
}