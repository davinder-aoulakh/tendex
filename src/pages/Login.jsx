import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const getReturnUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('from_url') || '/dashboard';
    } catch { return '/dashboard'; }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = getReturnUrl();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider('google', getReturnUrl());
  };

  const inputStyle = (focused) => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: 9,
    border: `1.5px solid ${focused ? '#C81E3A' : '#E6E3DA'}`,
    boxShadow: focused ? '0 0 0 3px rgba(200,30,58,0.10)' : 'none',
    outline: 'none',
    fontSize: '0.93rem',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#ffffff',
    color: '#15171F',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  });

  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(160deg, #15171F 0%, #1E1020 60%, #2A0D15 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px', minHeight: '100vh',
      }} className="login-left">

        {/* Dot-grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }} />

        {/* Red glow */}
        <div style={{
          position: 'absolute', bottom: -80, right: -80, width: 400, height: 400,
          background: 'radial-gradient(circle, #C81E3A 0%, transparent 70%)',
          opacity: 0.22, filter: 'blur(8px)', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div>
          <img src="https://media.base44.com/images/public/69e23169311147ecf99b113d/d91cd1b61_T_BB.png" alt="TendeX" style={{ height: 34, width: 'auto', borderRadius: 6 }} />
        </div>

        {/* Mascot and headline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, justifyContent: 'center', padding: '16px 0' }}>
          <img src="https://media.base44.com/images/public/69e23169311147ecf99b113d/23f0c34fa_cat_mascot_clean.png" alt="" style={{ display: 'block', width: 200, height: 'auto', margin: '0 auto 8px' }} />
          <h1 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.6rem', color: '#F1EFE9', lineHeight: 1.25, marginBottom: 12 }}>
            Procurement,<br />made simple.
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'rgba(241,239,233,0.6)', lineHeight: 1.6, maxWidth: 320 }}>
            Guide your team through the process, build better documents, and go to market with confidence.
          </p>
        </div>

        {/* Credential pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Guided from scope to issued document', 'Privacy Act compliant, stored in Australia', 'Built by procurement professionals'].map(text => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'rgba(241,239,233,0.75)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C81E3A', flexShrink: 0 }} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 40px', backgroundColor: '#FAF9F6' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C81E3A', marginBottom: 10 }}>
            Welcome back
          </div>

          <h2 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '2rem', color: '#15171F', marginBottom: 6 }}>
            Sign in to TendeX
          </h2>

          <p style={{ fontSize: '0.92rem', color: '#5B6270', marginBottom: 32 }}>
            Don't have an account?{' '}
            <Link to="/register"
              style={{ color: '#C81E3A', fontWeight: 700, textDecoration: 'none', fontSize: '0.92rem', fontFamily: "'Inter', sans-serif" }}>
              Sign up free →
            </Link>
          </p>

          {error && (
            <div style={{ backgroundColor: '#FBE9EA', border: '1px solid #F2CBCF', borderRadius: 9, padding: '10px 14px', marginBottom: 20, fontSize: '0.87rem', color: '#A8172F' }}>
              {error}
            </div>
          )}

          {/* Google button */}
          <button onClick={handleGoogleLogin}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 20px', border: '1.5px solid #E6E3DA', borderRadius: 9, backgroundColor: '#fff', fontSize: '0.93rem', fontWeight: 600, color: '#15171F', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', marginBottom: 20 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C81E3A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,30,58,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6E3DA'; e.currentTarget.style.boxShadow = 'none'; }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.9 29.5 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.5 16.5 19 14 24 14c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 8.9 29.5 7 24 7 16.3 7 9.6 10.2 6.3 15.2z"/>
              <path fill="#4CAF50" d="M24 43c5.2 0 9.9-1.8 13.6-4.8L31 33.6C29 35.1 26.6 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.5 39.7 16.3 43 24 43z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6L37.6 38c-.3.3 6.4-4.7 6.4-12 0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#B0B8C4' }} />
            <span style={{ fontSize: '0.85rem', color: '#B0B8C4' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#B0B8C4' }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.87rem', fontWeight: 500, color: '#15171F', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com.au" required
                style={inputStyle(emailFocused)}
                onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.87rem', fontWeight: 500, color: '#15171F', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ ...inputStyle(passFocused), paddingRight: 44 }}
                  onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)} />
                <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5B6270', cursor: 'pointer', padding: 4 }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 9, backgroundColor: loading ? '#E8A0A8' : '#C81E3A', color: '#fff', fontWeight: 600, fontSize: '0.95rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background-color 0.15s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#A8172F'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = loading ? '#E8A0A8' : '#C81E3A'; }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: '0.85rem', color: '#5B6270' }}>
            <Link to="/forgot-password"
              style={{ color: '#C81E3A', fontWeight: 600, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', textDecoration: 'none' }}>
              Forgot password?
            </Link>
            <Link to="/register"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#5B6270', textDecoration: 'none' }}>
              Need an account? <span style={{ color: '#C81E3A', fontWeight: 600 }}>Sign up</span>
            </Link>
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '0.82rem', color: '#5B6270', textDecoration: 'none' }}>
              ← Back to TendeX
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}