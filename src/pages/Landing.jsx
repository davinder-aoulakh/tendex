import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  FileText, Zap, Download, ArrowRight, CheckCircle,
  BookOpen, Search, FileCheck, Sparkles, ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ui/ThemeToggle';

const tools = [
  {
    type: 'SOW',
    icon: FileCheck,
    label: 'Scope of Work',
    tagline: 'Define deliverables',
    desc: 'Clearly define what you need from a supplier — deliverables, timelines, responsibilities.',
    step: '01',
  },
  {
    type: 'EOI',
    icon: Search,
    label: 'Expression of Interest',
    tagline: 'Discover suppliers',
    desc: 'Gauge market appetite and identify capable suppliers before committing to a formal process.',
    step: '02',
  },
  {
    type: 'RFQ',
    icon: BookOpen,
    label: 'Request for Quote',
    tagline: 'Get formal offers',
    desc: 'Invite suppliers to submit comparable, formal quotes for your procurement.',
    step: '03',
  },
  {
    type: 'RFP',
    icon: ClipboardList,
    label: 'Request for Proposal',
    tagline: 'Full proposal process',
    desc: 'Run a comprehensive proposal process for complex procurements requiring detailed solutions.',
    step: '04',
  },
];

const steps = [
  { num: '01', title: 'Describe It', desc: "Tell us what you're procuring in plain English, or pick a document type directly." },
  { num: '02', title: 'Answer Guided Questions', desc: 'Our wizard walks you through. AI enhances your rough answers into formal prose.' },
  { num: '03', title: 'Download Your Doc', desc: 'Branded, professional PDF — ready to send to suppliers today.' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['3 documents/month', 'All 4 document types', 'AI content generation', 'PDF export'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    features: ['20 documents/month', 'All document types', 'Advanced AI enhancement', 'Priority support', 'Document history'],
    cta: 'Get Starter',
    highlight: true,
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    features: ['Unlimited documents', 'All document types', 'Advanced AI enhancement', 'Dedicated support', 'Priority AI processing'],
    cta: 'Get Professional',
    highlight: false,
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');

  const handleRecommend = () => {
    if (prompt.trim()) {
      navigate(`/tool-select?hint=${encodeURIComponent(prompt.trim())}`);
    } else {
      navigate('/tool-select');
    }
  };

  return (
    <div className="min-h-screen font-dm-sans bg-background text-foreground">

      {/* Accent strip */}
      <div className="accent-strip" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 blur-nav">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'rgba(232,34,26,0.12)', borderColor: 'rgba(232,34,26,0.25)' }}>
              <FileText className="w-4 h-4 text-[#E8221A]" />
            </div>
            <span className="font-syne font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              TendeX<span style={{ color: '#E8221A' }}>.</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="icon" />
            <Button variant="ghost" size="sm" className="hover-muted" style={{ color: 'var(--text-secondary)' }}
              onClick={() => base44.auth.redirectToLogin('/dashboard')}>
              Login
            </Button>
            <Button size="sm" className="border-0 shadow-lg text-white" style={{ backgroundColor: '#E8221A' }}
              onClick={() => base44.auth.redirectToLogin('/plan-selection')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden" style={{ backgroundColor: 'var(--surface-1)' }}>
        {/* Ambient glow — hidden in light mode via .light .hero-glow */}
        <div className="hero-glow absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,34,26,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 border text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 text-[#E8221A]"
              style={{ borderColor: 'rgba(232,34,26,0.35)', backgroundColor: 'rgba(232,34,26,0.08)' }}>
              <Zap className="w-3 h-3" />AI-Powered Procurement
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <h1 className="font-syne font-bold leading-[1.05] mb-3" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', color: 'var(--text-primary)' }}>
              Professional<br />Procurement
            </h1>
            <h1 className="font-syne font-bold leading-[1.05] mb-6 text-[#E8221A]" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
              Documents.<br />In Minutes.
            </h1>
            <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Answer a few questions and we'll craft your Scope of Work, EOI, RFQ or RFP — AI-enhanced, branded, download-ready.
            </p>
          </motion.div>

          {/* Inline recommender widget */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
            <div className="rounded-2xl border p-5 max-w-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <p className="text-xs uppercase tracking-widest font-semibold mb-3 flex items-center gap-2 text-[#E8221A]">
                <Sparkles className="w-3.5 h-3.5" />
                Describe what you need — we'll recommend the right document
              </p>
              <textarea
                rows={3}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRecommend(); }}
                placeholder="e.g. I want to hire a software agency to build our customer portal..."
                className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring transition-all mb-3 border"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleRecommend}
                  className="gap-2 border-0 shadow-lg text-white" style={{ backgroundColor: '#E8221A' }}>
                  Recommend a Document <ArrowRight className="w-4 h-4" />
                </Button>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or pick one below</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PICK A TOOL ── */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--surface-2)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <p className="text-xs text-[#E8221A] uppercase tracking-widest font-semibold mb-2">Pick a Tool</p>
            <h2 className="font-syne text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Start with clarity</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <motion.div key={tool.type}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/questionnaire/${tool.type}`}>
                  <div className="group rounded-2xl border p-6 cursor-pointer transition-all h-full flex flex-col card-hover"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors"
                        style={{ backgroundColor: 'rgba(232,34,26,0.1)', borderColor: 'rgba(232,34,26,0.2)' }}>
                        <tool.icon className="w-5 h-5 text-[#E8221A]" />
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-muted)' }}>{tool.step}</span>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-[#E8221A]">{tool.tagline}</p>
                    <h3 className="font-semibold mb-2 text-base" style={{ color: 'var(--text-primary)' }}>{tool.label}</h3>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>{tool.desc}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-[#E8221A] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Now <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--surface-1)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <p className="text-xs text-[#E8221A] uppercase tracking-widest font-semibold mb-2">How It Works</p>
            <h2 className="font-syne text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Three steps.<br />
              <span style={{ color: '#E8221A' }}>One polished document.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-full h-px border-t border-dashed z-0"
                    style={{ borderColor: 'var(--border-strong)', width: 'calc(100% - 2rem)', transform: 'translateX(-1rem)' }} />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-5"
                    style={{ backgroundColor: 'rgba(232,34,26,0.1)', borderColor: 'rgba(232,34,26,0.25)' }}>
                    <span className="font-mono font-bold text-[#E8221A] text-lg">{step.num}</span>
                  </div>
                  <h3 className="font-syne font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="mt-12 text-center">
            <Button size="lg" className="gap-2 px-8 border-0 shadow-xl text-white primary-btn-hover"
              style={{ backgroundColor: '#E8221A' }}
              onClick={() => base44.auth.redirectToLogin('/plan-selection')}>
              Create Your First Document <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--surface-2)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <p className="text-xs text-[#E8221A] uppercase tracking-widest font-semibold mb-2">Pricing</p>
            <h2 className="font-syne text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Simple, transparent pricing</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Start free. Scale as you grow.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-7 border relative card-hover"
                style={{
                  backgroundColor: plan.highlight ? 'rgba(232,34,26,0.08)' : 'var(--card)',
                  borderColor: plan.highlight ? '#E8221A' : 'var(--border)',
                }}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#E8221A' }}>
                    Most Popular
                  </span>
                )}
                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-[#E8221A]" />
                      <span style={{ color: 'var(--text-secondary)' }}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => base44.auth.redirectToLogin('/dashboard')}
                  className="w-full border-0 text-white"
                  style={{ backgroundColor: plan.highlight ? '#E8221A' : 'var(--muted)', color: plan.highlight ? '#FFFFFF' : 'var(--text-primary)' }}>
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-10 px-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center border"
              style={{ backgroundColor: 'rgba(232,34,26,0.12)', borderColor: 'rgba(232,34,26,0.25)' }}>
              <FileText className="w-3 h-3 text-[#E8221A]" />
            </div>
            <span className="font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>
              TendeX<span style={{ color: '#E8221A' }}>.</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2026 TendeX. All rights reserved.</p>
        </div>
      </footer>

      {/* Bottom accent strip */}
      <div className="accent-strip" />
    </div>
  );
}