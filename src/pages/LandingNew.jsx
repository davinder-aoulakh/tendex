import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X, Check, AlertTriangle } from 'lucide-react';

const LP_THEME_KEY = 'tendex_lp_theme';

export default function LandingNew() {
  // ── THEME STATE (light default, separate from inner app) ─────────
  const [theme, setTheme] = useState(() => {
    try {
      const s = localStorage.getItem(LP_THEME_KEY);
      if (s === 'light' || s === 'dark') return s;
    } catch {}
    return 'light'; // marketing site defaults to light
  });

  useEffect(() => {
    try {localStorage.setItem(LP_THEME_KEY, theme);} catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => t === 'light' ? 'dark' : 'light');

  // ── MOBILE MENU ──────────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── STYLES ───────────────────────────────────────────────────────
  const s = {
    red: 'var(--lp-red)',
    redInk: 'var(--lp-red-ink)',
    redSoft: 'var(--lp-red-soft)',
    redSoftBdr: 'var(--lp-red-soft-border)',
    green: 'var(--lp-green)',
    greenSoft: 'var(--lp-green-soft)',
    greenBdr: 'var(--lp-green-border)',
    orange: 'var(--lp-orange)',
    orangeSoft: 'var(--lp-orange-soft)',
    orangeBdr: 'var(--lp-orange-border)',
    blue: 'var(--lp-blue)',
    blueSoft: 'var(--lp-blue-soft)',
    blueBdr: 'var(--lp-blue-border)',
    bg: 'var(--bg)',
    surface: 'var(--surface)',
    surfaceAlt: 'var(--surface-alt)',
    text: 'var(--lp-text)',
    textMuted: 'var(--lp-text-muted)',
    border: 'var(--lp-border)'
  };

  const START_URL = '/login?from_url=%2Fplan-selection';
  const LOGIN_URL = '/login';

  return (
    <div
      data-landing-theme={theme}
      className="lp-root font-inter min-h-screen"
      style={{ backgroundColor: s.bg, color: s.text, fontFamily: "'Inter', sans-serif" }}>
      

      {/* ── TOPBAR GRADIENT ── */}
      <div style={{ height: 4, background: 'linear-gradient(to right, #C81E3A, #C2570A)', width: '100%' }} />

      {/* ════════════════════════════════════════════════
            NAV
         ════════════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: s.bg,
        borderBottom: `1px solid ${s.border}`,
        padding: '16px 0'
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <img
            src={theme === 'dark'
              ? 'https://media.base44.com/images/public/69e23169311147ecf99b113d/d91cd1b61_T_BB.png'
              : 'https://media.base44.com/images/public/69e23169311147ecf99b113d/9e5ef92b4_T_LB.png'}
            alt="TendeX" style={{ display: 'block', height: 34, width: 'auto', borderRadius: 6 }} />

          {/* Nav links (desktop) */}
          <div className="hidden-mobile" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {[
            ['Why TendeX', '#why-tendex'],
            ['Where it goes wrong', '#problem'],
            ['How it works', '#how-it-works'],
            ['Features', '#platform-features'],
            ['Document types', '#document-types'],
            ['Pricing', '#pricing']].
            map(([label, href]) =>
            <a key={href} href={href} style={{ fontSize: '0.83rem', color: s.textMuted, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(e) => e.target.style.color = s.red}
            onMouseLeave={(e) => e.target.style.color = s.textMuted}>
                {label}
              </a>
            )}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Dark mode toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme"
            style={{ width: 38, height: 38, borderRadius: '50%', border: `1px solid ${s.border}`, background: s.surface, color: s.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Log in */}
            <Link to={LOGIN_URL} style={{ fontSize: '0.875rem', color: s.textMuted, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
            className="hidden-mobile">
              Log in
            </Link>

            {/* Start free trial */}
            <Link to={START_URL}
            style={{ backgroundColor: s.red, color: '#fff', padding: '8px 18px', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = s.redInk}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = s.red}>
              Start free trial
            </Link>

            {/* Mobile burger */}
            <button onClick={() => setMobileOpen((o) => !o)} style={{ display: 'none', background: 'none', border: 'none', color: s.text, cursor: 'pointer' }} className="show-mobile" aria-label="Menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen &&
        <div style={{ backgroundColor: s.bg, borderTop: `1px solid ${s.border}`, padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[['Why TendeX', '#why-tendex'], ['Where it goes wrong', '#problem'], ['How it works', '#how-it-works'], ['Features', '#platform-features'], ['Document types', '#document-types'], ['Pricing', '#pricing']].map(([label, href]) =>
          <a key={href} href={href} onClick={() => setMobileOpen(false)}
          style={{ color: s.text, textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', fontFamily: "'Libre Franklin', sans-serif" }}>
                {label}
              </a>
          )}
            <div style={{ borderTop: `1px solid ${s.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to={LOGIN_URL} style={{ color: s.textMuted, textDecoration: 'none' }}>Log in</Link>
              <Link to={START_URL} style={{ backgroundColor: s.red, color: '#fff', padding: '12px 20px', borderRadius: 9, textAlign: 'center', textDecoration: 'none', fontWeight: 600 }}>
                Start free trial
              </Link>
            </div>
          </div>
        }
      </nav>

      {/* ════════════════════════════════════════════════
            HERO
         ════════════════════════════════════════════════ */}
      <section style={{ padding: '68px 28px', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }} className="hero-grid">

          {/* Left */}
          <div>
            {/* Eyebrow badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: s.redSoft, border: `1px solid ${s.redSoftBdr}`, color: s.red, padding: '5px 14px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24, fontFamily: "'Inter', sans-serif" }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: s.red, display: 'inline-block' }} />
              Built for teams without a dedicated procurement function
            </div>

            {/* H1 */}
            <h1 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '2.7rem', lineHeight: 1.15, color: s.text, marginBottom: 20 }}>
              Procurement<br />made simple.
            </h1>

            {/* Body */}
            <p style={{ color: s.textMuted, fontSize: '1.06rem', lineHeight: 1.7, marginBottom: 24 }}>
              The TendeX platform is designed to make procurement fast and simple. Whether you're a small to medium sized business or a procurement professional yourself, TendeX will guide you through the procurement process, help you make better decisions along the way, and turn your requirements into structured, market-ready documents:
            </p>

            {/* Bullet list */}
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Scope of Work (SOW)', 'Expression of Interest (EOI)', 'Request for Quotation (RFQ)', 'Request for Proposal (RFP)'].map((item) =>
              <li key={item}>
                  <a href="#document-types" style={{ color: s.textMuted, textDecoration: 'none', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: s.red, fontWeight: 700 }}>—</span>
                    {item}
                  </a>
                </li>
              )}
            </ul>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <Link to={START_URL}
              style={{ backgroundColor: s.red, color: '#fff', padding: '13px 26px', borderRadius: 9, fontWeight: 600, fontSize: '0.96rem', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = s.redInk}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = s.red}>
                Start your scope
              </Link>
              <a href="#how-it-works"
              style={{ border: `1.5px solid ${s.border}`, color: s.text, padding: '13px 22px', borderRadius: 9, fontWeight: 500, fontSize: '0.96rem', textDecoration: 'none', backgroundColor: 'transparent', fontFamily: "'Inter', sans-serif" }}>
                See how it works →
              </a>
            </div>

            {/* Trust line */}
            <p style={{ color: s.textMuted, fontSize: '0.85rem' }}>
              Used by Australian businesses managing procurement without a dedicated team
            </p>
          </div>

          {/* Right — Product card mockup */}
          <div style={{ backgroundColor: s.surface, border: `1px solid ${s.border}`, borderRadius: 18, padding: '28px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${s.border}` }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: s.textMuted, fontFamily: "'Inter', sans-serif" }}>Your procurement</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: s.surfaceAlt, color: s.textMuted, padding: '3px 10px', borderRadius: 100, border: `1px solid ${s.border}` }}>Auto-checked</span>
            </div>

            {/* Steps */}
            {[
            { dot: s.red, label: 'Business profile', sub: null, active: false },
            { dot: s.red, label: 'Scope of work', sub: null, active: false },
            { dot: s.red, label: 'Reaching out to suppliers →', sub: 'Drafting your request now', active: true },
            { dot: null, label: 'Ready to send', sub: 'PDF export ready', active: false }].
            map((step, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, opacity: step.dot ? 1 : 0.45 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: step.dot || 'transparent', border: step.dot ? 'none' : `2px solid ${s.textMuted}`, flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: step.active ? 600 : 400, color: s.text }}>{step.label}</div>
                  {step.sub && <div style={{ fontSize: '0.8rem', color: s.textMuted, marginTop: 2 }}>{step.sub}</div>}
                </div>
              </div>
            )}

            {/* Recommendation callout */}
            <div style={{ marginTop: 20, backgroundColor: s.redSoft, border: `1px solid ${s.redSoftBdr}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: s.red, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>Recommended</div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: s.text, marginBottom: 6 }}>Request for Proposal</div>
              <div style={{ fontSize: '0.83rem', color: s.textMuted, lineHeight: 1.5 }}>Your scope is detailed enough that supplier methodology, not just price, should factor into the decision.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
            STATS BAR
         ════════════════════════════════════════════════ */}
      <div style={{ borderTop: `1px solid ${s.border}`, borderBottom: `1px solid ${s.border}` }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }} className="stats-grid">
          {[
          ['3×', 'Faster than building documents manually'],
          ['4', 'Document types, matched to your scope'],
          ['100%', 'Stored in Australia, Privacy Act compliant']].
          map(([num, label], i) =>
          <div key={i} style={{ textAlign: 'center', padding: '28px 24px', borderRight: i < 2 ? `1px solid ${s.border}` : 'none' }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.85rem', color: s.red, marginBottom: 6 }}>{num}</div>
              <div style={{ fontSize: '0.85rem', color: s.textMuted }}>{label}</div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
            WHY TENDEX
         ════════════════════════════════════════════════ */}
      <section id="why-tendex" style={{ padding: '68px 28px', backgroundColor: s.surfaceAlt }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.red, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>Why TendeX</div>
          <h2 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.9rem', color: s.text, marginBottom: 48, maxWidth: 560 }}>Built for the way small and mid-sized teams actually buy.</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="cards-grid">
            {[
            { accent: s.red, icon: '◎', title: 'Guided through the process', body: 'Structured to make procurement simple: TendeX helps you understand what you need, what to create, and why, without needing to be a procurement expert.' },
            { accent: s.blue, icon: '⎘', title: 'One process, every document', body: 'Your scope is defined once and used across every document you need, keeping your requirements consistent from start to finish.' },
            { accent: s.green, icon: '✓', title: 'Designed to prevent disputes', body: 'Surfaces the gaps in your brief before any supplier sees it, reducing the risk of mismatched quotes, variations, and disputes.' },
            { accent: s.orange, icon: '↗', title: 'Tailored to your requirements', body: 'Adapts to what you actually need rather than forcing your project into a fixed template.' },
            { accent: s.red, icon: '⛨', title: 'Built by procurement professionals', body: 'Every question, check and recommendation on the platform reflects real procurement practice, not a generic document builder.' },
            { accent: s.blue, icon: '↻', title: 'Your procurement activities, always available', body: 'Every procurement activity you start is saved and waiting. Come back mid-scope, pick up where you left off, and manage multiple processes without a separate filing system.' }].
            map((card, i) =>
            <div key={i} className="lp-card-hover" style={{ backgroundColor: s.surface, border: `1px solid ${s.border}`, borderRadius: 14, borderTop: `3px solid ${card.accent}`, padding: '22px 20px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, backgroundColor: `${card.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.accent, fontSize: '1.1rem', marginBottom: 14 }}>{card.icon}</div>
                <h3 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '0.96rem', color: s.text, marginBottom: 8 }}>{card.title}</h3>
                <p style={{ fontSize: '0.83rem', color: s.textMuted, lineHeight: 1.65 }}>{card.body}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
            PROBLEM SECTION
         ════════════════════════════════════════════════ */}
      <section id="problem" style={{ padding: '68px 28px', backgroundColor: s.bg }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.red, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>Where procurement goes wrong</div>
          <h2 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.9rem', color: s.text, marginBottom: 16 }}>Get the scope wrong and the whole thing falls apart.</h2>
          <p style={{ color: s.textMuted, fontSize: '1rem', lineHeight: 1.7, marginBottom: 48, maxWidth: 640 }}>When requirements are underspecified, suppliers price against their own assumptions rather than yours. That gap tends to surface later: in mismatched quotes, disputed variations, and costs that shift once work is underway.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="compare-grid">
            {/* Incomplete scope */}
            <div className="lp-card-hover" style={{ backgroundColor: s.orangeSoft, border: `1.5px solid ${s.orangeBdr}`, borderRadius: 14, padding: '24px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <AlertTriangle size={15} style={{ color: s.orange }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: s.orange, fontFamily: "'Inter', sans-serif" }}>An incomplete scope</span>
              </div>
              {['Suppliers quote against their own assumptions', 'Gaps surface once work is already underway', 'Document type is chosen without a clear basis'].map((item, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <span style={{ color: s.orange, fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>×</span>
                  <span style={{ color: s.orange, fontSize: '0.92rem', lineHeight: 1.5 }}>{item}</span>
                </div>
              )}
            </div>

            {/* Checked scope */}
            <div className="lp-card-hover" style={{ backgroundColor: s.greenSoft, border: `1.5px solid ${s.greenBdr}`, borderRadius: 14, padding: '24px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Check size={15} style={{ color: s.green }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: s.green, fontFamily: "'Inter', sans-serif" }}>A checked scope</span>
              </div>
              {["Guided questions surface what's commonly missed", 'Completeness is checked before submission', 'Document type is identified based on complexity'].map((item, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <Check size={16} style={{ color: s.green, flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: s.green, fontSize: '0.92rem', lineHeight: 1.5, fontWeight: 500 }}>{item}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
            HOW IT WORKS
         ════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '68px 28px', backgroundColor: s.surfaceAlt }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.red, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>How it works</div>
          <h2 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.9rem', color: s.text, marginBottom: 12 }}>A guided process for making better procurement decisions.</h2>
          <p style={{ color: s.textMuted, fontSize: '1rem', lineHeight: 1.7, marginBottom: 48, maxWidth: 680 }}>Running the full process means you're never guessing. A solid scope forms the foundation for everything that follows. You are guided through the decisions at each step, from scope creation, through document selection and risk assessment, instead of figuring it out alone.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="steps-grid">
            {[
            ['1', 'Define your requirements', "Structured questions covering what's typically missed"],
            ['2', 'Completeness is checked', 'Identifies gaps before a supplier sees the brief'],
            ['3', 'Document type is identified', 'EOI, RFQ or RFP, selected based on complexity'],
            ['4', 'Issue with confidence', 'Professional PDF, ready to send']].
            map(([num, title, body]) =>
            <div key={num} className="lp-card-hover" style={{ backgroundColor: s.surface, border: `1px solid ${s.border}`, borderRadius: 12, padding: '20px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: s.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, color: s.red, fontSize: '0.95rem' }}>{num}</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '0.96rem', color: s.text, marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: '0.83rem', color: s.textMuted, lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
            PLATFORM FEATURES
         ════════════════════════════════════════════════ */}
      <section id="platform-features" style={{ padding: '68px 28px', backgroundColor: s.bg }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.red, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>Platform features</div>
          <h2 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.9rem', color: s.text, marginBottom: 12 }}>Everything you need, built into one platform.</h2>
          <p style={{ color: s.textMuted, fontSize: '1rem', lineHeight: 1.7, marginBottom: 48, maxWidth: 640 }}>TendeX is designed to remove the overhead that normally comes with running a procurement process, so you can focus on the outcome, not the admin.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="feat-grid">
            {[
            { accent: s.green, icon: '✓', title: 'Privacy Act compliant', body: 'All data is stored and processed in Australia, in full compliance with the Privacy Act 1988.' },
            { accent: s.blue, icon: '⛨', title: 'Australian data sovereignty', body: 'Your procurement data never leaves Australian shores. Stored locally, end to end.' },
            { accent: s.red, icon: '◎', title: 'Scope completeness checking', body: 'Before any document is issued, TendeX checks your scope for gaps that typically lead to disputes or mismatched quotes.' },
            { accent: s.orange, icon: '↗', title: 'Intelligent document selection', body: "TendeX analyses your scope and recommends the most appropriate document type, so you don't have to know the difference upfront." },
            { accent: s.green, icon: '▤', title: 'Professional PDF export', body: 'Every document is formatted and ready to issue as a professional PDF, downloadable immediately.' },
            { accent: s.blue, icon: '✓', title: 'ABN validation', body: "Verify that a supplier's ABN is active and registered before you engage, directly within the platform." },
            { accent: s.red, icon: '↻', title: 'Auto-save across sessions', body: 'Progress is saved automatically. Return to any procurement activity at any stage without losing your work.' },
            { accent: s.orange, icon: '⎘', title: 'Multiple concurrent procurements', body: 'Run several procurement activities at once, each tracked separately with its own documents and status.' }].
            map((feat, i) =>
            <div key={i} className="lp-card-hover" style={{ backgroundColor: s.surface, border: `1px solid ${s.border}`, borderRadius: 12, padding: '18px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: `${feat.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: feat.accent, fontSize: '1rem' }}>{feat.icon}</div>
                <div>
                  <h3 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '0.92rem', color: s.text, marginBottom: 5 }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: s.textMuted, lineHeight: 1.6 }}>{feat.body}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
            DOCUMENT TYPES
         ════════════════════════════════════════════════ */}
      <section id="document-types" style={{ padding: '68px 28px', backgroundColor: s.surfaceAlt }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.red, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>Document types</div>
          <h2 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.9rem', color: s.text, marginBottom: 12 }}>What these mean, even when we choose for you.</h2>
          <p style={{ color: s.textMuted, fontSize: '1rem', lineHeight: 1.7, marginBottom: 48, maxWidth: 660 }}>Start with a checked scope, and the rest is easy. We guide you through each decision, what type of document to use, what to watch for and what's next, so nothing is missed. Already have a scope, or only need one document? Enjoy the flexibility of using any step in isolation or as part of a larger procurement process.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="term-grid">
            {[
            { code: 'SOW', title: 'Scope of Work (SOW)', body: 'The requirements written clearly enough for a supplier to price accurately.', bg: s.blueSoft, bdr: s.blueBdr, col: s.blue },
            { code: 'EOI', title: 'Expression of Interest (EOI)', body: 'An initial approach used to identify interested and capable suppliers before a formal request is issued.', bg: s.orangeSoft, bdr: s.orangeBdr, col: s.orange },
            { code: 'RFQ', title: 'Request for Quote (RFQ)', body: 'A request for pricing against a clearly defined scope.', bg: s.greenSoft, bdr: s.greenBdr, col: s.green },
            { code: 'RFP', title: 'Request for Proposal (RFP)', body: 'A request for a proposed approach, used when supplier methodology affects the outcome.', bg: s.redSoft, bdr: s.redSoftBdr, col: s.red }].
            map((card) =>
            <div key={card.code} className="lp-card-hover" style={{ backgroundColor: card.bg, border: `1.5px solid ${card.bdr}`, borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: card.col, marginBottom: 10 }}>{card.title}</div>
                <p style={{ fontSize: '0.92rem', color: s.text, lineHeight: 1.65 }}>{card.body}</p>
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.86rem', color: s.textMuted }}>
            Not sure which one fits? Run the full process and we'll identify it from your scope.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
            PRICING
         ════════════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: '68px 28px', backgroundColor: s.bg }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.red, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>Pricing</div>
          <h2 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.9rem', color: s.text, marginBottom: 12 }}>Simple, transparent pricing.</h2>
          <p style={{ color: s.textMuted, fontSize: '1rem', marginBottom: 48 }}>Start free. Scale as you grow. No credit card required for the trial.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 760, margin: '0 auto 20px' }} className="pricing-grid">
            {/* Free trial */}
            <div className="lp-card-hover" style={{ backgroundColor: s.surface, border: `1.5px solid ${s.border}`, borderRadius: 16, padding: '28px 24px', textAlign: 'left' }}>
              <h3 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: s.text, marginBottom: 8 }}>Free Trial</h3>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.6rem', color: s.red, marginBottom: 24 }}>14 days free</div>
              {['1 active procurement document', 'Scope of Work generation', '1 document type (SOW, EOI, RFQ or RFP)', 'Platform support via email'].map((item) =>
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <Check size={16} style={{ color: s.green, flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.88rem', color: s.textMuted }}>{item}</span>
                </div>
              )}
              <Link to={START_URL} style={{ display: 'block', width: '100%', marginTop: 24, padding: '12px', borderRadius: 9, border: `1.5px solid ${s.border}`, backgroundColor: 'transparent', color: s.text, fontWeight: 600, fontSize: '0.92rem', textAlign: 'center', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>
                Start free trial
              </Link>
            </div>

            {/* Professional */}
            <div className="lp-card-hover" style={{ backgroundColor: s.surface, border: `1.5px solid ${s.red}`, borderRadius: 16, padding: '28px 24px', textAlign: 'left', position: 'relative', boxShadow: '0 4px 20px rgba(200,30,58,0.12)' }}>
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', backgroundColor: s.red, color: '#fff', padding: '4px 16px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Most popular</div>
              <h3 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: s.text, marginBottom: 8 }}>Professional Plan</h3>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '1.6rem', color: s.red, marginBottom: 24 }}>Pricing (TBC)</div>
              {['Unlimited active procurements', 'All document types (SOW, EOI, RFQ, RFP)', 'PDF export', 'Priority platform support via email'].map((item) =>
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <Check size={16} style={{ color: s.green, flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.88rem', color: s.textMuted }}>{item}</span>
                </div>
              )}
              <a href="mailto:hello@tendex.com.au" style={{ display: 'block', width: '100%', marginTop: 24, padding: '12px', borderRadius: 9, backgroundColor: s.red, color: '#fff', fontWeight: 600, fontSize: '0.92rem', textAlign: 'center', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>
                Contact us
              </a>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: s.textMuted }}>Pricing and features are placeholder values, pending final confirmation.</p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
            CLOSING CTA
         ════════════════════════════════════════════════ */}
      <section style={{ padding: '68px 28px', backgroundColor: s.surfaceAlt, textAlign: 'center' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: '2rem', color: s.text, marginBottom: 14 }}>A scope suppliers can quote against with confidence.</h2>
          <p style={{ color: s.textMuted, fontSize: '1rem', marginBottom: 32 }}>Most procurement disputes are avoidable with a complete brief.</p>
          <Link to={START_URL}
          style={{ display: 'inline-block', backgroundColor: s.red, color: '#fff', padding: '14px 28px', borderRadius: 9, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = s.redInk}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = s.red}>
            Start your first document free →
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
            FOOTER
         ════════════════════════════════════════════════ */}
      <footer style={{ borderTop: `1px solid ${s.border}`, padding: '36px 28px', backgroundColor: s.bg }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <img
            src={theme === 'dark'
              ? 'https://media.base44.com/images/public/69e23169311147ecf99b113d/d91cd1b61_T_BB.png'
              : 'https://media.base44.com/images/public/69e23169311147ecf99b113d/9e5ef92b4_T_LB.png'}
            alt="TendeX" height={20} style={{ display: 'block', borderRadius: 6 }} />
          <p style={{ fontSize: '0.85rem', color: s.textMuted }}>Structured procurement documentation for Australian business.</p>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════
            RESPONSIVE CSS
         ════════════════════════════════════════════════ */}
      <style>{`
        @media (max-width: 860px) {
          .hero-grid       { grid-template-columns: 1fr !important; }
          .cards-grid      { grid-template-columns: 1fr !important; }
          .compare-grid    { grid-template-columns: 1fr !important; }
          .steps-grid      { grid-template-columns: 1fr !important; }
          .feat-grid       { grid-template-columns: 1fr !important; }
          .term-grid       { grid-template-columns: 1fr !important; }
          .pricing-grid    { grid-template-columns: 1fr !important; }
          .stats-grid      { grid-template-columns: 1fr !important; }
          .hidden-mobile   { display: none !important; }
          .show-mobile     { display: flex !important; }
          h1               { font-size: 2.05rem !important; }
        }
        @media (min-width: 861px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>);

}