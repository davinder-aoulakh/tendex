import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, LayoutDashboard, CreditCard, Plus, LogOut, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import TrialBanner from '@/components/pricing/TrialBanner';

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
    <div className="min-h-screen" style={{ backgroundColor: '#080E1A' }}>
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 blur-nav">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00C9A7]/20 rounded-lg flex items-center justify-center border border-[#00C9A7]/30">
              <FileText className="w-4 h-4 text-[#00C9A7]" />
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
                   <Button size="sm" className="gap-2 ml-2 bg-[#00C9A7] hover:bg-[#00E0BA] text-[#080E1A] border-0 shadow-lg" style={{ boxShadow: '0 0 20px rgba(0, 201, 167, 0.3)' }}>
                     <Plus className="w-4 h-4" />New
                   </Button>
                 </Link>
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
      <main className="pt-16">
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