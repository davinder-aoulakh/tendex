import { Link, useLocation } from 'react-router-dom';
import { FileText, LayoutDashboard, CreditCard, Plus, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
];

export default function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #080d24 0%, #0d1b4b 50%, #0a1535 100%)' }}>
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 backdrop-blur-md" style={{ background: 'rgba(8,13,36,0.7)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/20">
              <FileText className="w-4 h-4 text-blue-300" />
            </div>
            <span className="font-display font-semibold text-lg text-white">TendeX</span>
          </Link>
          <div className="flex items-center gap-1">
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
              <Button size="sm" className="gap-2 ml-2 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20">
                <Plus className="w-4 h-4" />New
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="ml-1 text-white/50 hover:text-white hover:bg-white/10" onClick={() => base44.auth.logout('/')}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>
      <main className="pt-16">{children}</main>
    </div>
  );
}