import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuestionnaireGuard } from '@/lib/QuestionnaireGuard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LayoutDashboard, CreditCard, Plus, LogOut, Zap, AlertCircle } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import TrialBanner from '@/components/pricing/TrialBanner';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#06b6d4', '#f97316',
];

function hashColor(email) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const navigate = useNavigate();
  const { isDirty, clearDirty } = useQuestionnaireGuard();
  const [pendingNav, setPendingNav] = useState(null);
  const [showGuard, setShowGuard] = useState(false);

  const handleSidebarNav = (path) => {
    if (isDirty) { setPendingNav(path); setShowGuard(true); }
    else { navigate(path); }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
          // Check if business profile is incomplete
          if (!currentUser.organisation_name) {
            setProfileIncomplete(true);
          }
          const subs = await base44.entities.Subscription.filter({
            user_email: currentUser.email,
          });
          if (subs.length > 0) {
            setSubscription(subs[0]);
            
            // Calculate trial days remaining if free plan
            if (subs[0].plan === 'free' && subs[0].renewal_date) {
              const renewalDate = new Date(subs[0].renewal_date);
              const today = new Date();
              const daysLeft = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
              
              if (daysLeft <= 0) {
                setIsTrialExpired(true);
              } else {
                setTrialDaysRemaining(daysLeft);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded focus:text-white focus:text-sm focus:font-medium" style={{ backgroundColor: 'var(--primary)' }}>
        Skip to main content
      </a>
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 blur-nav">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => handleSidebarNav('/dashboard')} className="flex items-center gap-2">
            <img
              src="https://media.base44.com/images/public/69e23169311147ecf99b113d/75545adb6_Gemini_Generated_Image_cmmc92cmmc92cmmc.png"
              alt="TendeX"
              style={{ height: 32, filter: 'brightness(10)', display: 'block' }}
            />
          </button>
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {/* Upgrade button for trial users */}
                {subscription?.plan === 'free' && (
                    <Button size="sm" className="gap-2 ml-1" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }} onClick={() => handleSidebarNav('/billing')}>
                      <Zap className="w-4 h-4" />Upgrade
                    </Button>
                )}

                {navItems.map(item => {
                  const active = location.pathname === item.path;
                  return (
                      <Button
                        key={item.path + item.label}
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-sm hidden sm:flex transition-colors hover-muted"
                        style={active
                          ? { background: 'var(--border)', color: 'var(--text-primary)' }
                          : { color: 'var(--text-secondary)' }}
                        onClick={() => handleSidebarNav(item.path)}
                      >
                        <item.icon className="w-4 h-4" />{item.label}
                      </Button>
                  );
                })}
                <ThemeToggle variant="icon" />
                  <Button size="sm" className="gap-2 ml-2 border-0 shadow-lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 0 20px rgba(200,30,58,0.3)' }} onClick={() => handleSidebarNav('/start-procurement')}>
                    <Plus className="w-4 h-4" />New
                  </Button>
                {user && (
                   <button onClick={() => handleSidebarNav('/profile')} className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80" style={{ backgroundColor: hashColor(user.email) }}>
                     {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                   </button>
                )}
                <Button variant="ghost" size="icon" className="ml-1 hover-muted" style={{ color: 'var(--text-muted)' }} onClick={() => base44.auth.logout('/')}>
                 <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                onClick={() => base44.auth.redirectToLogin('/dashboard')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>
      <main id="main-content" className="pt-16">
        {/* Trial banner for free users */}
        {isAuthenticated && (subscription?.plan === 'free' || isTrialExpired) && (
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <TrialBanner 
              daysRemaining={trialDaysRemaining}
              isExpired={isTrialExpired}
            />
          </div>
        )}
        {/* Business profile incomplete banner */}
        {isAuthenticated && profileIncomplete && location.pathname !== '/profile' && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="flex items-center justify-between gap-3 rounded-xl px-5 py-3 text-sm" style={{ background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--warning)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Your business profile is incomplete. Add your organisation name and ABN to get started.
              </div>
                <Button size="sm" variant="ghost" className="flex-shrink-0 h-7 text-xs whitespace-nowrap" style={{ color: 'var(--warning)', border: '1px solid var(--warning-border)' }} onClick={() => handleSidebarNav('/profile')}>
                  Complete Profile →
                </Button>
            </div>
          </div>
        )}
        {children}
      </main>

      <Dialog open={showGuard} onOpenChange={setShowGuard}>
        <DialogContent style={{ background: 'var(--card)', border: '1px solid var(--border)',
                                borderRadius: 16, maxWidth: 440 }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
                                  fontWeight: 700 }}>
              You have unsaved answers
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--text-secondary)' }}>
              Your answers haven't been saved yet.
              {pendingNav && ` Save your progress before going to ${
                pendingNav === '/dashboard'           ? 'Dashboard'
                : pendingNav === '/billing'           ? 'Billing'
                : pendingNav === '/profile'           ? 'Company Profile'
                : pendingNav === '/start-procurement' ? 'New Procurement'
                : 'the selected page'
              }.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <button onClick={async () => {
                if (window.__tendex_saveNow) await window.__tendex_saveNow();
                clearDirty(); setShowGuard(false);
                if (pendingNav) navigate(pendingNav);
              }}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: 'var(--primary)',
                       boxShadow: '0 0 12px rgba(200,30,58,0.2)' }}>
              Save Draft & Leave
            </button>

            <button onClick={() => {
                clearDirty(); setShowGuard(false);
                if (pendingNav) navigate(pendingNav);
              }}
              className="w-full py-3 rounded-lg text-sm font-semibold border transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)',
                       background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)';
                                   e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';
                                   e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              Discard & Leave
            </button>

            <button onClick={() => { setShowGuard(false); setPendingNav(null); }}
              className="w-full py-3 text-sm transition-colors"
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}>
              Cancel — stay here
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}