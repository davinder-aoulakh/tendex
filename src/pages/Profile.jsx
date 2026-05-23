import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ChevronLeft, LogOut, Zap, Crown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import ABNLookup from '@/components/questionnaire/ABNLookup';
import LogoUpload from '@/components/questionnaire/LogoUpload';
import { useToast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/lib/ThemeContext';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    org_name: '',
    abn: '',
    abn_entity_name: '',
    logo_url: '',
    contact_name: '',
    contact_email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate('/');
          return;
        }
        setUser(currentUser);
        setFormData({
          org_name: currentUser.organisation_name || '',
          abn: currentUser.abn || '',
          abn_entity_name: currentUser.abn_entity_name || '',
          logo_url: currentUser.logo_url || '',
          contact_name: currentUser.primary_contact_name || '',
          contact_email: currentUser.email,
          phone: currentUser.phone || '',
          address: currentUser.business_address || '',
        });

        const subs = await base44.entities.Subscription.filter({
          user_email: currentUser.email,
        });
        if (subs.length > 0) {
          setSubscription(subs[0]);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleSave = async () => {
    if (!formData.org_name) {
      toast({ title: 'Validation error', description: 'Organisation name is required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await base44.auth.updateMe({
        organisation_name: formData.org_name,
        abn: formData.abn,
        abn_entity_name: formData.abn_entity_name,
        logo_url: formData.logo_url,
        primary_contact_name: formData.contact_name,
        phone: formData.phone,
        business_address: formData.address,
      });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (err) {
      console.error('Error saving profile:', err);
      toast({ title: 'Error', description: 'Failed to save profile changes.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveABN = () => {
    setFormData(prev => ({ ...prev, abn: '', abn_entity_name: '' }));
  };

  const getPlanDaysRemaining = () => {
    if (!subscription || subscription.plan !== 'free' || !subscription.renewal_date) return null;
    const renewalDate = new Date(subscription.renewal_date);
    const today = new Date();
    const daysLeft = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : null;
  };

  const daysRemaining = getPlanDaysRemaining();
  const isTrialExpired = subscription?.plan === 'free' && daysRemaining === null && subscription.renewal_date && new Date(subscription.renewal_date) < new Date();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-white/10 border-t-[#E53935] rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate('/dashboard')}
            className="p-1 text-sm transition-colors" style={{ color: 'rgba(229,57,53,0.5)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(229,57,53,0.5)'}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-3xl font-semibold text-white">User Profile</h1>
        </div>

        {/* Section 1: Organisation Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 p-8 mb-8" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <h2 className="font-syne font-700 text-2xl text-white mb-6">Organisation Details</h2>

          {/* Organisation Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Organisation Name</label>
            <Input
              value={formData.org_name}
              onChange={e => setFormData({ ...formData, org_name: e.target.value })}
              placeholder="Your organisation"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#E53935]/50"
            />
          </div>

          {/* ABN Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Australian Business Number (ABN)</label>
            {formData.abn ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-xl px-4 py-3 border" style={{ borderColor: 'rgba(34,197,94,0.4)', backgroundColor: 'rgba(34,197,94,0.08)' }}>
                  <p className="text-white font-mono text-sm">{formData.abn}</p>
                  <p className="text-green-400 text-xs mt-1">✓ Verified: <strong>{formData.abn_entity_name}</strong></p>
                </div>
                <button onClick={handleRemoveABN} className="text-xs transition-colors" style={{ color: 'rgba(229,57,53,0.5)' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(229,57,53,0.5)'}>
                  Remove and re-verify
                </button>
              </div>
            ) : (
              <ABNLookup
                value={formData.abn}
                onChange={val => setFormData({ ...formData, abn: val })}
                onConfirmed={(abn, entityName) => setFormData({ ...formData, abn, abn_entity_name: entityName })}
              />
            )}
          </div>

          {/* Logo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Organisation Logo</label>
            <LogoUpload
              value={formData.logo_url}
              onChange={val => setFormData({ ...formData, logo_url: val })}
            />
          </div>

          {/* Contact Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Primary Contact Name</label>
            <Input
              value={formData.contact_name}
              onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="Full name"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#E53935]/50"
            />
          </div>

          {/* Email (read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Login Email</label>
            <Input
              value={formData.contact_email}
              disabled
              className="bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
            />
            <p className="text-xs text-white/40 mt-1">This is your authentication email and cannot be changed here.</p>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
            <Input
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+61 4xx xxx xxx"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#E53935]/50"
            />
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">Business Address</label>
            <Input
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, suburb, state, postcode"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#E53935]/50"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2 text-white border-0" style={{ backgroundColor: '#E53935' }}>
              {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
            </Button>
          </div>
        </motion.div>

        {/* Section 2: Account */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/10 p-8" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <h2 className="font-syne font-700 text-2xl text-white mb-6">Account</h2>

          {/* Current Plan */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/60 mb-3">Current Plan</label>
            <div className="flex items-center gap-3 mb-6">
              {subscription?.plan === 'free' && <Zap className="w-5 h-5 text-[#F59E0B]" />}
              {subscription?.plan === 'professional' && <Crown className="w-5 h-5 text-[#E53935]" />}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription?.plan === 'free' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#E53935]/20 text-[#E53935]'
              }`}>
                {subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : '—'}
              </span>
            </div>

            {/* Trial Status */}
            {subscription?.plan === 'free' && (
              isTrialExpired ? (
                <div className="flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 mb-6">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-medium text-sm">Trial Expired</p>
                    <p className="text-amber-200/70 text-xs mt-1">Your free trial has ended. Upgrade to continue creating documents.</p>
                  </div>
                </div>
              ) : daysRemaining !== null ? (
                <div className="rounded-lg border border-[#E53935]/30 bg-[#E53935]/10 p-4 mb-6">
                  <p className="text-[#E53935] font-medium text-sm">{daysRemaining} days remaining</p>
                  <p className="text-[#E53935]/60 text-xs mt-1">Your free trial expires on {subscription.renewal_date && new Date(subscription.renewal_date).toLocaleDateString()}</p>
                </div>
              ) : null
            )}
          </div>

          {/* Appearance */}
          <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-syne font-700 text-base mb-4" style={{ color: 'var(--text-primary)' }}>
              Appearance
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Theme</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Currently using {theme} mode
                </p>
              </div>
              <ThemeToggle variant="pill" />
            </div>
          </div>

          {/* Subscription Actions */}
          <div className="mt-8 flex items-center gap-3">
            <Button onClick={() => navigate('/billing')} className="gap-2 text-white border-0" style={{ backgroundColor: '#E53935' }}>
              Manage Subscription →
            </Button>
            <Button onClick={() => base44.auth.logout('/')} variant="ghost" className="gap-2 text-white/60 hover:text-white hover:bg-white/10 border border-white/10">
              <LogOut className="w-4 h-4" />Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}