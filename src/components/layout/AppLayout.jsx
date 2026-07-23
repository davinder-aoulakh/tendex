import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuestionnaireGuard } from '@/lib/QuestionnaireGuard';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  LayoutDashboard, CreditCard, Settings,
  Building2, HelpCircle, LogOut, Plus, Menu, X
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TrialBanner from '@/components/pricing/TrialBanner';

const HASH_COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#f59e0b',
  '#10b981','#ef4444','#06b6d4','#f97316',
];
function hashColor(email) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0;
  return HASH_COLORS[Math.abs(h) % HASH_COLORS.length];
}

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDirty, clearDirty } = useQuestionnaireGuard();
  const [pendingNav, setPendingNav] = useState(null);
  const [showGuard, setShowGuard] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [docsCount, setDocsCount] = useState(0);
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem('tendex_theme') || 'dark'; } catch { return 'dark'; }
  });
  const [isMobile, setIsMobile] = useState(() => {
    try { return window.matchMedia('(max-width: 900px)').matches; } catch { return false; }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const applyTheme = (t) => {
    setThemeState(t);
    try { localStorage.setItem('tendex_theme', t); } catch {}
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  };

  const handleSidebarNav = (path) => {
    setDrawerOpen(false);
    if (isDirty) { setPendingNav(path); setShowGuard(true); }
    else { navigate(path); }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const handler = (e) => { setIsMobile(e.matches); if (!e.matches) setDrawerOpen(false); };
    try { mq.addEventListener('change', handler); } catch { mq.addListener(handler); }
    return () => { try { mq.removeEventListener('change', handler); } catch { mq.removeListener(handler); } };
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const u = await base44.auth.me();
        if (!u) return;
        setUser(u);
        if (!u.organisation_name) setProfileIncomplete(true);
        const subs = await base44.entities.Subscription.filter({ user_email: u.email });
        if (subs.length > 0) {
          setSubscription(subs[0]);
          if (subs[0].plan === 'free' && subs[0].renewal_date) {
            const days = Math.ceil((new Date(subs[0].renewal_date) - new Date()) / 86400000);
            if (days <= 0) setIsTrialExpired(true);
            else setTrialDaysRemaining(days);
          }
        }
        // Count the user's actual documents for the sidebar usage display
        try {
          const docs = await base44.entities.Document.filter({}, '-created_date', 500);
          setDocsCount(docs.length);
        } catch {}
      } catch {}
    };
    load();
  }, [isAuthenticated]);

  // Refresh document count whenever the route changes (after create/delete)
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    base44.entities.Document.filter({}, '-created_date', 500)
      .then(docs => setDocsCount(docs.length))
      .catch(() => {});
  }, [isAuthenticated, user?.email, location.pathname]);

  const currentPlan = subscription?.plan || 'free';
  const planLimits = { free: 25, starter: 50, professional: 999 };
  const docsLimit = subscription?.documents_limit || planLimits[currentPlan] || 25;
  const docsUsed = docsCount;

  // Nav item component
  const NavItem = ({ icon: Icon, label, path, incomplete }) => {
    const active = location.pathname === path;
    return (
      <button
        onClick={() => handleSidebarNav(path)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          textAlign: 'left', borderRadius: 8, padding: '8px 11px',
          fontSize: '13.5px', fontWeight: active ? 600 : 500, cursor: 'pointer',
          marginBottom: 1, border: 'none', background: 'transparent',
          borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
          backgroundColor: active ? 'rgba(200,30,58,0.08)' : 'transparent',
          color: active ? 'var(--primary)' : 'var(--text-secondary)',
          transition: 'background 0.1s ease',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--muted)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <Icon style={{ width: 16, height: 16, flexShrink: 0,
          color: active ? 'var(--primary)' : 'var(--text-muted)' }} />
        <span style={{ flex: 1 }}>{label}</span>
        {incomplete && (
          <span style={{
            fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.03em', padding: '1px 6px', borderRadius: 20,
            background: 'var(--warning-subtle)', color: 'var(--warning)',
            border: '1px solid var(--warning-border)', whiteSpace: 'nowrap',
          }}>
            Incomplete
          </span>
        )}
      </button>
    );
  };

  const SectionLabel = ({ text }) => (
    <div style={{
      fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: 'var(--text-muted)',
      padding: '0 11px', margin: '20px 0 8px',
    }}>
      {text}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>

      {/* Skip to content */}
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded focus:text-white"
        style={{ backgroundColor: 'var(--primary)' }}>
        Skip to main content
      </a>

      {/* MOBILE TOP BAR */}
      {isAuthenticated && isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 56,
          background: 'var(--card)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 14px', zIndex: 50,
        }}>
          <button onClick={() => setDrawerOpen(o => !o)} aria-label="Open menu"
            style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--background)', color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {drawerOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
          </button>
          <button onClick={() => handleSidebarNav('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src={theme === 'dark'
              ? 'https://media.base44.com/images/public/69e23169311147ecf99b113d/d91cd1b61_T_BB.png'
              : 'https://media.base44.com/images/public/69e23169311147ecf99b113d/9e5ef92b4_T_LB.png'}
              alt="TendeX" style={{ display: 'block', height: 30, width: 'auto', borderRadius: 6 }} />
          </button>
          <button onClick={() => handleSidebarNav('/start-procurement')} aria-label="New procurement"
            style={{ width: 40, height: 40, borderRadius: 8, border: 'none',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus style={{ width: 20, height: 20 }} />
          </button>
        </div>
      )}

      {/* MOBILE DRAWER BACKDROP */}
      {isAuthenticated && isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 55 }} />
      )}

      {/* SIDEBAR */}
      {isAuthenticated && (
        <aside style={{
          width: 236, flexShrink: 0, background: 'var(--card)',
          borderRight: '1px solid var(--border)', position: 'fixed',
          top: 0, left: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
          padding: '22px 14px', overflowY: 'auto',
          zIndex: isMobile ? 60 : 40,
          transform: isMobile && !drawerOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
          boxShadow: isMobile && drawerOpen ? '0 0 40px rgba(0,0,0,0.3)' : 'none',
        }}>

          {/* Logo */}
          <button
            onClick={() => handleSidebarNav('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '4px 10px 18px', background: 'none',
              border: 'none', cursor: 'pointer',
            }}
          >
            <img src={theme === 'dark'
              ? 'https://media.base44.com/images/public/69e23169311147ecf99b113d/d91cd1b61_T_BB.png'
              : 'https://media.base44.com/images/public/69e23169311147ecf99b113d/9e5ef92b4_T_LB.png'}
              alt="TendeX" style={{ display: 'block', height: 32, width: 'auto', borderRadius: 6 }} />
          </button>

          {/* Appearance toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 11px', marginBottom: 18,
            background: 'var(--muted)', borderRadius: 9,
          }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Appearance
            </span>
            <div style={{
              display: 'flex', background: 'var(--card)', borderRadius: 7,
              padding: 2, border: '1px solid var(--border)',
            }}>
              {['light', 'dark'].map(t => (
                <button
                  key={t}
                  onClick={() => applyTheme(t)}
                  title={t === 'light' ? 'Light mode' : 'Dark mode'}
                  style={{
                    border: 'none', padding: '5px 8px', borderRadius: 5,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    background: theme === t ? 'var(--primary)' : 'transparent',
                    color: theme === t ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {t === 'light' ? (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="4.2"/>
                      <path d="M12 2.5v2.3M12 19.2v2.3M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                      <path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a7 7 0 0 0 10.2 10.2z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main nav */}
          <NavItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" />

          <SectionLabel text="Account" />
          <NavItem icon={Building2} label="Company Profile" path="/profile" incomplete={profileIncomplete} />
          <NavItem icon={CreditCard} label="Billing" path="/billing" />
          <NavItem icon={Settings} label="Settings" path="/settings" />

          <SectionLabel text="Support" />
          <a
            href="mailto:support@tendex.com.au"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px',
              borderRadius: 8, fontSize: '13.5px', fontWeight: 500,
              color: 'var(--text-secondary)', textDecoration: 'none',
              borderLeft: '2px solid transparent', marginBottom: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <HelpCircle style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
            Contact Support
          </a>

          {/* New Procurement CTA */}
          <div style={{ padding: '16px 4px 0' }}>
            <button
              onClick={() => handleSidebarNav('/start-procurement')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, width: '100%', padding: '10px', borderRadius: 9,
                fontSize: '13.5px', fontWeight: 600, color: '#fff', border: 'none',
                cursor: 'pointer', background: 'var(--primary)',
                boxShadow: '0 0 16px rgba(200,30,58,0.25)',
              }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              New Procurement
            </button>
          </div>

          {/* Bottom: plan mini + user row */}
          <div style={{
            marginTop: 'auto', paddingTop: 16,
            borderTop: '1px solid var(--border)', flexShrink: 0,
          }}>
            {/* Plan mini card */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', background: 'var(--muted)',
              borderRadius: 10, marginBottom: 10,
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {currentPlan} Plan
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {docsLimit === 999 ? 'Unlimited docs' : docsUsed + ' / ' + docsLimit + ' docs used'}
                </div>
              </div>
              {currentPlan === 'free' && (
                <button
                  onClick={() => handleSidebarNav('/billing')}
                  style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  Upgrade
                </button>
              )}
            </div>

            {/* User row */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px' }}>
                <div style={{
                  width: 29, height: 29, borderRadius: '50%', flexShrink: 0,
                  background: hashColor(user.email), color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {user.full_name
                    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user.full_name || user.email}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {currentPlan} Plan
                  </div>
                </div>
                <button
                  onClick={() => base44.auth.logout('/')}
                  title="Log out"
                  style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    border: '1px solid var(--border)', background: 'var(--card)',
                    color: 'var(--text-muted)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--primary)';
                    e.currentTarget.style.borderColor = 'rgba(200,30,58,0.3)';
                    e.currentTarget.style.background = 'rgba(200,30,58,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--card)';
                  }}
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main
        id="main-content"
        style={{
          flex: 1,
          marginLeft: isAuthenticated && !isMobile ? 236 : 0,
          minHeight: '100vh',
          background: 'var(--background)',
          paddingTop: isAuthenticated && isMobile ? 56 : 0,
        }}
      >
        {/* Trial banner */}
        {isAuthenticated && (subscription?.plan === 'free' || isTrialExpired) && (
          <div style={{ padding: '24px 38px 0' }}>
            <TrialBanner daysRemaining={trialDaysRemaining} isExpired={isTrialExpired} />
          </div>
        )}

        {/* Profile incomplete banner */}
        {isAuthenticated && profileIncomplete && location.pathname !== '/profile' && location.pathname !== '/settings' && (
          <div style={{ padding: '16px 38px 0' }}>
            <div
              className="flex items-center justify-between gap-3 rounded-xl px-5 py-3 text-sm"
              style={{ background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)' }}>
                <Building2 style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>
                  <strong>Your company profile is incomplete.</strong>{' '}
                  Add your organisation and contact details so you do not have to re-enter them on every document.
                </span>
              </div>
              <button
                onClick={() => handleSidebarNav('/profile')}
                style={{
                  flexShrink: 0, fontSize: '12px', fontWeight: 600, padding: '6px 12px',
                  borderRadius: 8, whiteSpace: 'nowrap', cursor: 'pointer',
                  color: 'var(--warning)', border: '1px solid var(--warning-border)',
                  background: 'transparent',
                }}
              >
                Complete profile
              </button>
            </div>
          </div>
        )}

        {children}
      </main>

      {/* UNSAVED CHANGES DIALOG — logic unchanged */}
      <Dialog open={showGuard} onOpenChange={setShowGuard}>
        <DialogContent
          style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, maxWidth: 440,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              You have unsaved answers
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--text-secondary)' }}>
              {'Your answers have not been saved yet.'}
              {pendingNav && (' Save your progress before going to ' + (
                pendingNav === '/dashboard' ? 'Dashboard'
                : pendingNav === '/billing' ? 'Billing'
                : pendingNav === '/profile' ? 'Company Profile'
                : pendingNav === '/settings' ? 'Settings'
                : pendingNav === '/start-procurement' ? 'New Procurement'
                : 'the selected page'
              ) + '.')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={async () => {
                if (window.__tendex_saveNow) await window.__tendex_saveNow();
                clearDirty(); setShowGuard(false);
                if (pendingNav) navigate(pendingNav);
              }}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--primary)', boxShadow: '0 0 12px rgba(200,30,58,0.2)' }}
            >
              Save Draft and Leave
            </button>
            <button
              onClick={() => { clearDirty(); setShowGuard(false); if (pendingNav) navigate(pendingNav); }}
              className="w-full py-3 rounded-lg text-sm font-semibold border"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
            >
              Discard and Leave
            </button>
            <button
              onClick={() => { setShowGuard(false); setPendingNav(null); }}
              className="w-full py-3 text-sm"
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Cancel — stay here
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}