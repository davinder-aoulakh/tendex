import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Shield, Lock, Bell,
  Laptop, Phone, Check, AlertTriangle, Loader2, Save
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Account section state
  const [fullName, setFullName] = useState('');
  const [phone,    setPhone]    = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // Password section state
  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [savingPwd,   setSavingPwd]   = useState(false);
  const [pwdError,    setPwdError]    = useState('');

  // Notifications state
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [savingNotif,   setSavingNotif]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        if (!u) { navigate('/'); return; }
        setUser(u);
        setFullName(u.full_name || '');
        setPhone(u.phone || '');
        setWeeklySummary(u.notification_weekly_summary ?? false);
      } catch {
        toast({ title: 'Error', description: 'Failed to load settings.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  // ── HANDLERS ────────────────────────────────────────────────────

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    try {
      await base44.auth.updateMe({ full_name: fullName, phone: phone });
      toast({ title: 'Account updated', description: 'Your details have been saved.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save account details.', variant: 'destructive' });
    } finally {
      setSavingAccount(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPwdError('');
    if (!newPwd || !confirmPwd) {
      setPwdError('Please fill in all password fields.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New password and confirmation do not match.');
      return;
    }
    if (newPwd.length < 8) {
      setPwdError('Password must be at least 8 characters.');
      return;
    }
    setSavingPwd(true);
    try {
      await base44.auth.resetPasswordRequest(user.email);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      toast({
        title: 'Password reset email sent',
        description: 'A password reset link has been sent to ' + user.email + '. Follow the link in that email to set your new password.',
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to send password reset email.', variant: 'destructive' });
    } finally {
      setSavingPwd(false);
    }
  };

  const handleToggleWeeklySummary = async (checked) => {
    setWeeklySummary(checked);
    setSavingNotif(true);
    try {
      await base44.auth.updateMe({ notification_weekly_summary: checked });
    } catch {
      setWeeklySummary(!checked);
      toast({ title: 'Error', description: 'Failed to save notification preference.', variant: 'destructive' });
    } finally {
      setSavingNotif(false);
    }
  };

  const handleEnable2FA = () => {
    toast({
      title: 'Coming soon',
      description: 'Two-factor authentication will be available in a future update.',
    });
  };

  const handleLogoutAllSessions = () => {
    base44.auth.logout('/');
  };

  const handleDeleteAccount = () => {
    const subject = encodeURIComponent('Account Deletion Request');
    const body = encodeURIComponent('Please delete my TendeX account.\n\nMy email address: ' + (user?.email || ''));
    window.location.href = 'mailto:support@tendex.com.au?subject=' + subject + '&body=' + body;
  };

  // ── SHARED STYLE CONSTANTS ────────────────────────────────────────

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '26px 28px',
    boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)',
    marginBottom: 20,
  };

  const cardTitleStyle = {
    display: 'flex', alignItems: 'center', gap: 9,
    fontSize: 15, fontWeight: 700, margin: '0 0 4px',
    color: 'var(--text-primary)',
  };

  const cardSubStyle = {
    fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 22px',
  };

  const labelStyle = {
    fontSize: '12.5px', fontWeight: 700,
    color: 'var(--text-secondary)', display: 'block', marginBottom: 6,
  };

  const inputStyle = {
    fontFamily: 'inherit', fontSize: '13.5px', padding: '10px 13px',
    borderRadius: 9, border: '1px solid var(--border)',
    background: 'var(--background)', color: 'var(--text-primary)',
    width: '100%', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const inputDisabledStyle = {
    ...inputStyle,
    background: 'var(--muted)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
  };

  const hintStyle = {
    fontSize: '11.5px', color: 'var(--text-muted)',
    lineHeight: 1.4, marginTop: 5,
  };

  const saveBtnStyle = (loading) => ({
    background: loading ? 'var(--muted)' : 'var(--primary)',
    color: loading ? 'var(--text-muted)' : '#fff',
    border: 'none', padding: '10px 20px', borderRadius: 9,
    fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'background 0.15s',
  });

  const secondaryBtnStyle = (loading) => ({
    background: loading ? 'var(--muted)' : 'var(--muted)',
    color: loading ? 'var(--text-muted)' : 'var(--text-primary)',
    border: '1px solid var(--border)', padding: '10px 20px', borderRadius: 9,
    fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'background 0.15s',
  });

  const fieldGrid = {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px',
  };

  // ── LOADING ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
            Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Manage your personal account, notifications, and data.
          </p>
        </div>

        {/* ── 1. ACCOUNT ─────────────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            <User style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
            Account
          </div>
          <p style={cardSubStyle}>
            Your personal login details — separate from your organisation's Company Profile.
          </p>

          <div style={fieldGrid}>
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Login Email (read-only) */}
            <div>
              <label style={labelStyle}>Login Email</label>
              <input type="email" value={user?.email || ''} disabled style={inputDisabledStyle} />
              <p style={hintStyle}>This is your authentication email and cannot be changed here.</p>
            </div>

            {/* Phone Number */}
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="04XX XXX XXX"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <p style={hintStyle}>Used for account recovery and SMS two-factor codes, if enabled.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            <button
              onClick={handleSaveAccount}
              disabled={savingAccount}
              style={saveBtnStyle(savingAccount)}
              onMouseEnter={e => { if (!savingAccount) e.currentTarget.style.background = '#a9182f'; }}
              onMouseLeave={e => { if (!savingAccount) e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {savingAccount && <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.8s linear infinite' }} />}
              Save Changes
            </button>
          </div>
        </div>

        {/* ── 2. VERIFY ACCOUNT ──────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            <Shield style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
            Verify Account
          </div>
          <p style={cardSubStyle}>
            Confirms this email address belongs to you and secures your account.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '11.5px', fontWeight: 700, padding: '4px 10px',
              borderRadius: 20, whiteSpace: 'nowrap',
              background: 'var(--success-subtle)', color: 'var(--success)',
              border: '1px solid var(--success-border)',
            }}>
              <Check style={{ width: 10, height: 10, strokeWidth: 2.4 }} />
              Verified
            </span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Your email address has been verified.
            </span>
          </div>
        </div>

        {/* ── 3. TWO-FACTOR AUTHENTICATION ───────────────────────── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            <Shield style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
            Two-Factor Authentication
          </div>
          <p style={cardSubStyle}>
            Add an extra layer of security — you'll need a code from your phone as well as your password to log in.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '11.5px', fontWeight: 700, padding: '4px 10px',
              borderRadius: 20, whiteSpace: 'nowrap',
              background: 'var(--muted)', color: 'var(--text-muted)',
              border: '1px solid var(--border-strong)',
            }}>
              Not enabled
            </span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Your account currently only requires a password to log in.
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleEnable2FA}
              style={saveBtnStyle(false)}
              onMouseEnter={e => e.currentTarget.style.background = '#a9182f'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>

        {/* ── 4. CHANGE PASSWORD ─────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            <Lock style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
            Change Password
          </div>
          <p style={cardSubStyle}>Choose a new password for your account.</p>

          <div style={fieldGrid}>
            {/* Current Password — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* New Password */}
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {pwdError && (
            <p style={{ fontSize: 12.5, color: 'var(--destructive)', marginTop: 12 }}>{pwdError}</p>
          )}

          <p style={{ ...hintStyle, marginTop: 12 }}>
            For security, a password reset link will be sent to your email address to confirm the change.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            <button
              onClick={handleUpdatePassword}
              disabled={savingPwd}
              style={secondaryBtnStyle(savingPwd)}
              onMouseEnter={e => { if (!savingPwd) e.currentTarget.style.background = 'var(--border)'; }}
              onMouseLeave={e => { if (!savingPwd) e.currentTarget.style.background = 'var(--muted)'; }}
            >
              {savingPwd && <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.8s linear infinite' }} />}
              Update Password
            </button>
          </div>
        </div>

        {/* ── 5. NOTIFICATIONS ────────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            <Bell style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
            Notifications
          </div>
          <p style={cardSubStyle}>Choose what TendeX emails you about.</p>

          {/* Weekly summary toggle row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 0',
          }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: 2, color: 'var(--text-primary)' }}>
                Weekly summary
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.4 }}>
                A weekly email summarising the status of your procurement processes and documents.
              </div>
            </div>

            {/* Custom toggle */}
            <label style={{ position: 'relative', width: 42, height: 24, flexShrink: 0, cursor: savingNotif ? 'not-allowed' : 'pointer', opacity: savingNotif ? 0.7 : 1 }}>
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={e => handleToggleWeeklySummary(e.target.checked)}
                disabled={savingNotif}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <span style={{
                position: 'absolute', inset: 0, borderRadius: 20,
                background: weeklySummary ? 'var(--primary)' : 'var(--border-strong)',
                transition: 'background 0.15s ease',
              }} />
              <span style={{
                position: 'absolute', top: 3, left: 3, width: 18, height: 18,
                background: '#fff', borderRadius: '50%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s ease',
                transform: weeklySummary ? 'translateX(18px)' : 'translateX(0)',
              }} />
            </label>
          </div>
        </div>

        {/* ── 6. ACTIVE SESSIONS ──────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            <Laptop style={{ width: 18, height: 18, color: 'var(--primary)', flexShrink: 0 }} />
            Active Sessions
          </div>
          <p style={cardSubStyle}>Devices currently logged in to your account.</p>

          {/* Current device (this session) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: 'var(--muted)', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Laptop style={{ width: 17, height: 17 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Current browser
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--success)',
                  background: 'var(--success-subtle)', border: '1px solid var(--success-border)',
                  padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}>
                  This device
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Active now
              </div>
            </div>
          </div>

          {/* Placeholder session — shows what other sessions look like */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: 'var(--muted)', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Phone style={{ width: 17, height: 17 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Other device
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Individual session management coming soon
              </div>
            </div>
          </div>

          {/* Footer: log out all */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)',
          }}>
            <button
              onClick={handleLogoutAllSessions}
              style={{
                fontSize: '12.5px', fontWeight: 700, color: 'var(--primary)',
                cursor: 'pointer', background: 'none', border: 'none',
                fontFamily: 'inherit', padding: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Log out of all sessions
            </button>
          </div>
        </div>

        {/* ── 7. DANGER ZONE / DELETE ACCOUNT ─────────────────────── */}
        <div style={{
          background: 'var(--card)',
          border: '1.5px solid rgba(200,30,58,0.35)',
          borderRadius: 16, padding: '26px 28px', marginTop: 34,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            fontSize: 15, fontWeight: 700, color: 'var(--primary)',
            margin: '0 0 6px',
          }}>
            <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />
            Delete Account
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 440, lineHeight: 1.4 }}>
                Permanently deletes your account, organisation data, and all procurement processes and documents. This cannot be undone.
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              style={{
                background: 'transparent', color: 'var(--primary)',
                border: '1.5px solid rgba(200,30,58,0.35)',
                padding: '9px 18px', borderRadius: 9,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(200,30,58,0.08)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(200,30,58,0.35)';
              }}
            >
              Delete My Account
            </button>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      </div>
    </AppLayout>
  );
}