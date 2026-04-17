import { Link, useLocation } from 'react-router-dom';
import { FileText, LayoutDashboard, CreditCard, Plus, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Documents', path: '/dashboard' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
];

export default function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 bg-card border-b border-border h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">TendeX</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.path + item.label} to={item.path}>
                <Button variant={location.pathname === item.path ? 'secondary' : 'ghost'} size="sm" className="gap-2 text-sm hidden sm:flex">
                  <item.icon className="w-4 h-4" />{item.label}
                </Button>
              </Link>
            ))}
            <Link to="/tool-select">
              <Button size="sm" className="gap-2 ml-2"><Plus className="w-4 h-4" />New</Button>
            </Link>
            <Button variant="ghost" size="icon" className="ml-1" onClick={() => base44.auth.logout('/')}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>
      <main className="pt-16">{children}</main>
    </div>
  );
}