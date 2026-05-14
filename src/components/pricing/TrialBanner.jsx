import { AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function TrialBanner({ daysRemaining, isExpired, onUpgradeClick }) {
  if (!daysRemaining && !isExpired) return null;

  if (isExpired) {
    return (
      <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg px-4 py-3 flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-amber-300">Trial expired</p>
            <p className="text-amber-200/70 text-xs">Upgrade to continue creating new documents</p>
          </div>
        </div>
        <Link to="/billing">
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-white border-0">
            Upgrade Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg px-4 py-3 flex items-center justify-between gap-4 mb-6" style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.3)' }}>
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 flex-shrink-0" style={{ color: '#00C9A7' }} />
        <div className="text-sm">
          <p className="font-semibold" style={{ color: '#7FEEE1' }}>
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining in your free trial
          </p>
          <p className="text-xs" style={{ color: 'rgba(0,201,167,0.5)' }}>Upgrade anytime to unlock unlimited procurements</p>
        </div>
      </div>
      <Link to="/billing">
        <Button size="sm" className="text-white border-0" style={{ backgroundColor: '#00C9A7' }}>
          Upgrade
        </Button>
      </Link>
    </div>
  );
}