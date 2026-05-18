import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, LayoutDashboard, CreditCard, Plus, LogOut, Zap, User } from 'lucide-react';
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

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
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
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded focus:text-white focus:text-sm focus:font-medium" style={{ backgroundColor: '#E8221A' }}>
        Skip to main content
      </a>
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 blur-nav">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(232,34,26,0.1)', border: '1px solid rgba(232,34,26,0.2)' }}>
              <FileText className="w-4 h-4" style={{ color: '#E8221A' }} />
            </div>
            <span className="font-syne font-800 text-lg text-white">TendeX</span>
          </Link>
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {/* Upgrade button for trial users */}
                {subscription?.plan === 'free' && (
                  <Link to="/billing">
                    <Button size="sm" className="gap-2 ml-1 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] border border-[#F59E0B]/30">
                      <Zap className="w-4 h-4" />Upgrade
                    </Button>
                  </Link>
                )}

                {navItems.map(item => {
                   const active = location.pathname === item.path;
                   return (
                     <Link key={item.path + item.label} to={item.path}>
                       <Button
                         variant="ghost"
                         size="sm"
                         className={`gap-2 text-sm hidden sm:flex transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                       >
                         <item.icon className="w-4 h-4" />{item.label}
                       </Button>
                     </Link>
                   );
                 })}
                 <Link to="/tool-select">
                   <Button size="sm" className="gap-2 ml-2 text-white border-0 shadow-lg" style={{ backgroundColor: '#E8221A', boxShadow: '0 0 20px rgba(232,34,26,0.3)' }}>
                     <Plus className="w-4 h-4" />New
                   </Button>
                 </Link>
                 {user && (
                  <Link to="/profile">
                    <button className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80" style={{ backgroundColor: hashColor(user.email) }}>
                      {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : user.email.split('@')[0].substring(0, 2).toUpperCase()}
                    </button>
                  </Link>
                 )}
                 <Button variant="ghost" size="icon" className="ml-1 text-white/50 hover:text-white hover:bg-white/10" onClick={() => base44.auth.logout('/')}>
                  <LogOut className="w-4 h-4" />
                 </Button>
              </>
            ) : (
              <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90"
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
        {children}
      </main>
    </div>
  );
}