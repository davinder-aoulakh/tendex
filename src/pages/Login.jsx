import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function Login() {
  const getReturnUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('from_url') || '/dashboard';
    } catch { return '/dashboard'; }
  };

  // Immediately redirect to the platform login page
  useEffect(() => {
    base44.auth.redirectToLogin(getReturnUrl());
  }, []);

  // Show nothing while redirecting
  return null;
}