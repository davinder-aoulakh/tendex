import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle2, ArrowLeft, Building2, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import ABNLookup from '@/components/questionnaire/ABNLookup';
import LogoUpload from '@/components/questionnaire/LogoUpload';
import AddressSearchField from '@/components/questionnaire/AddressSearchField';
import { useToast } from '@/components/ui/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [profile, setProfile]   = useState({});
  const [formData, setFormData] = useState({
    org_name:      '',
    abn:           '',
    abn_entity_name: '',
    logo_url:      '',
    contact_name:  '',
    contact_email: '',
    phone:         '',
    address:       '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) { navigate('/'); return; }
        setUser(currentUser);

        const users = await base44.entities.User.filter({ email: currentUser.email });
        const userProfile = users[0] || {};
        setProfile(userProfile);

        setFormData({
          org_name:      currentUser.organisation_name || '',
          abn:           currentUser.abn || '',
          abn_entity_name: currentUser.abn_entity_name || '',
          logo_url:      currentUser.logo_url || '',
          contact_name:  currentUser.primary_contact_name || '',
          contact_email: currentUser.email,
          phone:         currentUser.phone || '',
          address:       currentUser.business_address || '',
        });
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
      toast({
        title: 'Validation error',
        description: 'Organisation name is required.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      await base44.auth.updateMe({
        organisation_name:    formData.org_name,
        abn:                  formData.abn,
        abn_entity_name:      formData.abn_entity_name,
        logo_url:             formData.logo_url,
        primary_contact_name: formData.contact_name,
        phone:                formData.phone,
        business_address:     formData.address,
      });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (err) {
      console.error('Error saving profile:', err);
      toast({ title: 'Error', description: 'Failed to save profile changes.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleABNConfirmed = async (data) => {
    const abnFields = {
      abn:                   data.abn,
      abn_confirmed:         true,
      abn_entity_name:       data.entityName || '',
      abn_entity_type_name:  data.entityTypeName || '',
      abn_entity_type_code:  data.entityTypeCode || '',
      abn_gst_registered:    data.gstRegistered || false,
      abn_address_state:     data.addressState || '',
      abn_address_postcode:  data.addressPostcode || '',
      abn_acn:               data.acn || '',
      abn_active_since:      data.abnActiveSince || '',
      abn_verified_at:       new Date().toISOString(),
    };
    await base44.auth.updateMe(abnFields);
    setFormData(prev => ({ ...prev, abn: data.abn, abn_entity_name: data.entityName || '' }));
    setProfile(prev => ({ ...prev, ...abnFields }));
  };

  const handleRemoveABN = async () => {
    await base44.auth.updateMe({ abn_confirmed: false, abn: '', abn_entity_name: '' });
    setProfile(prev => ({ ...prev, abn_confirmed: false, abn: '', abn_entity_name: '' }));
    setFormData(prev => ({ ...prev, abn: '', abn_entity_name: '' }));
  };

  // ── INPUT STYLE HELPERS ────────────────────────────────────────────

  const inputStyle = {
    fontFamily: 'inherit',
    fontSize: '13.5px',
    padding: '10px 13px',
    borderRadius: 9,
    border: '1px solid var(--border)',
    background: 'var(--background)',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const inputDisabledStyle = {
    ...inputStyle,
    background: 'var(--muted)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
  };

  const LabelStyle = {
    fontSize: '12.5px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: 6,
  };

  const HintStyle = {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
    marginTop: 5,
  };

  // ── LOADING ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </AppLayout>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 38px 60px' }}>

        {/* Back link */}
        <button
          onClick={() => navigate('/dashboard')}
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
          Back to Dashboard
        </button>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 25, margin: '0 0 4px', fontWeight: 800, letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            Company Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0, maxWidth: 560, lineHeight: 1.5 }}>
            Add your organisation and contact details once — they'll pre-fill every procurement process
            and document you create, so you're not re-entering the same information each time.
          </p>
        </div>

        {/* Single form card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '28px 30px',
          boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
        }}>

          {/* ── SECTION 1: Organisation Details ───────────────────── */}

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            <Building2 style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
            Organisation Details
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 22px' }}>
            Used to verify your organisation and pre-fill document headers.
          </p>

          {/* Org Name + ABN — 2 column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px', marginBottom: 18 }}>

            {/* Organisation Name */}
            <div>
              <label style={LabelStyle}>Organisation Name</label>
              <input
                type="text"
                value={formData.org_name}
                onChange={e => setFormData({ ...formData, org_name: e.target.value })}
                placeholder="e.g. Acme Pty Ltd"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* ABN */}
            <div>
              <label style={LabelStyle}>Australian Business Number (ABN)</label>
              {profile.abn_confirmed ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--success)' }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                    ABN verified
                  </div>
                  <div style={{
                    borderRadius: 9, padding: '10px 13px',
                    background: 'var(--success-subtle)', border: '1px solid var(--success-border)',
                    fontSize: '12.5px', color: 'var(--text-primary)',
                  }}>
                    <div style={{ fontWeight: 700 }}>{profile.abn_entity_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11.5, marginTop: 2, fontFamily: 'monospace' }}>
                      ABN: {(profile.abn || '').replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveABN}
                    style={{ fontSize: 11.5, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', textDecoration: 'underline' }}
                  >
                    Re-verify ABN
                  </button>
                </div>
              ) : (
                <div>
                  <ABNLookup
                    value={profile.abn || ''}
                    onChange={val => setProfile(p => ({ ...p, abn: val }))}
                    onConfirmed={handleABNConfirmed}
                    confirmed={false}
                    confirmedData={null}
                  />
                  <p style={HintStyle}>
                    Enter your ABN to verify your organisation and pre-fill all procurement documents.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Organisation Logo — full width */}
          <div style={{ marginBottom: 6 }}>
            <label style={{ ...LabelStyle, marginBottom: 8 }}>Organisation Logo</label>
            <LogoUpload
              value={formData.logo_url}
              onChange={val => setFormData({ ...formData, logo_url: val })}
            />
          </div>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '26px 0 22px' }} />

          {/* ── SECTION 2: Primary Contact ─────────────────────────── */}

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            <User style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
            Primary Contact
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 22px' }}>
            This person is the default contact on all procurement documents.
          </p>

          {/* Contact Name + Login Email — 2 column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px', marginBottom: 18 }}>

            {/* Primary Contact Name */}
            <div>
              <label style={LabelStyle}>Primary Contact Name</label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Full name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Login Email (read-only) */}
            <div>
              <label style={LabelStyle}>Login Email</label>
              <input
                type="email"
                value={formData.contact_email}
                disabled
                style={inputDisabledStyle}
              />
              <p style={HintStyle}>
                This is your authentication email and cannot be changed here.
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label style={LabelStyle}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="04XX XXX XXX"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Business Address — with Australian address autocomplete */}
            <div>
              <label style={LabelStyle}>Business Address</label>
              <AddressSearchField
                value={formData.address}
                onChange={val => setFormData({ ...formData, address: val })}
                placeholder="Start typing your business address..."
                style={inputStyle}
              />
              <p style={HintStyle}>
                Search for your address to auto-fill from verified Australian address data, or type it manually.
              </p>
            </div>

          </div>

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 26 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? 'var(--muted)' : 'var(--primary)',
                color: saving ? 'var(--text-muted)' : '#fff',
                border: 'none',
                padding: '11px 22px',
                borderRadius: 9,
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--primary-hover, #a9182f)'; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {saving ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save style={{ width: 14, height: 14 }} />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

    </AppLayout>
  );
}