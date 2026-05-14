import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PlanSelectionComponent from '@/components/pricing/PlanSelection';
import { base44 } from '@/api/base44Client';

export default function PlanSelection() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingSubscription, setExistingSubscription] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate('/');
          return;
        }
        setUser(currentUser);

        // Check if user already has a subscription
        const subs = await base44.entities.Subscription.filter({
          user_email: currentUser.email,
        });
        if (subs.length > 0) {
          setExistingSubscription(subs[0]);
          // If they already have a plan, go to dashboard
          navigate('/dashboard');
          return;
        }
      } catch (err) {
        console.error('Error checking user:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (existingSubscription) {
    return null; // Will redirect via useEffect
  }

  return (
    <PlanSelectionComponent
      onSelectPlan={(subscription) => {
        // Successfully selected a plan, proceed to dashboard
        navigate('/dashboard');
      }}
    />
  );
}