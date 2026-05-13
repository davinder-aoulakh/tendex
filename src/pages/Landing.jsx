import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  FileText, Zap, Shield, Download, ArrowRight, CheckCircle,
  BookOpen, Search, FileCheck, Sparkles, ClipboardList, MessageSquareDot
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  { num: '01', title: 'Describe It', desc: 'Tell us what you\'re procuring in plain English, or pick a document type directly.' },
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
      // Pass prompt as a query param so ToolSelect can use it
      navigate(`/tool-select?hint=${encodeURIComponent(prompt.trim())}`);
    } else {
      navigate('/tool-select');
    }
  };

  return (
    <div className="min-h-screen font-inter" style={{ background: '#080d24' }}>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 backdrop-blur-md" style={{ background: 'rgba(8,13,36,0.85)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/20">
              <FileText className="w-4 h-4 text-blue-300" />
            </div>
            <span className="font-display font-semibold text-xl text-white">TendeX</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => base44.auth.redirectToLogin('/dashboard')}>
              Login
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20"
              onClick={() => base44.auth.redirectToLogin('/dashboard')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #080d24 0%, #0d1b4b 60%, #080d24 100%)' }}>
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 border border-blue-400/30 bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
              <Zap className="w-3 h-3" />AI-Powered Procurement
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <h1 className="font-display font-bold text-white leading-[1.05] mb-3" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
              Professional<br />Procurement
            </h1>
            <h1 className="font-display font-bold leading-[1.05] mb-6" style={{
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Documents.<br />In Minutes.
            </h1>
            <p className="text-lg text-blue-100/60 max-w-xl mb-10 leading-relaxed">
              Answer a few questions and we'll craft your Scope of Work, EOI, RFQ or RFP — AI-enhanced, branded, download-ready.
            </p>
          </motion.div>

          {/* Inline recommender widget */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
            <div className="rounded-2xl border border-white/10 p-5 max-w-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs text-blue-300/60 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Describe what you need — we'll recommend the right document
              </p>
              <textarea
                rows={3}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRecommend(); }}
                placeholder="e.g. I want to hire a software agency to build our customer portal..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm resize-none focus:outline-none focus:border-blue-400/50 focus:bg-white/8 transition-all mb-3"
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleRecommend}
                  className="gap-2 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20">
                  Recommend a Document <ArrowRight className="w-4 h-4" />
                </Button>
                <span className="text-xs text-blue-200/30">or pick one below</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PICK A TOOL ── */}
      <section className="py-20 px-6" style={{ background: '#080d24' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <p className="text-xs text-blue-300/50 uppercase tracking-widest font-semibold mb-2">Pick a Tool</p>
            <h2 className="font-display text-3xl font-bold text-white">Start with clarity</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <motion.div key={tool.type}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/questionnaire/${tool.type}`}>
                  <div className="group rounded-2xl border border-white/10 p-6 cursor-pointer hover:border-blue-400/40 hover:bg-blue-500/5 transition-all h-full flex flex-col"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center border border-blue-400/20 group-hover:bg-blue-500/25 transition-colors">
                        <tool.icon className="w-5 h-5 text-blue-300" />
                      </div>
                      <span className="text-xs font-mono text-blue-300/30 font-bold">{tool.step}</span>
                    </div>
                    <p className="text-xs text-blue-300/50 font-semibold uppercase tracking-wider mb-1">{tool.tagline}</p>
                    <h3 className="font-semibold text-white mb-2 text-base">{tool.label}</h3>
                    <p className="text-sm text-blue-200/45 leading-relaxed flex-1">{tool.desc}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
      <section className="py-20 px-6 border-t border-white/5" style={{ background: 'linear-gradient(160deg, #080d24 0%, #0d1b4b 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <p className="text-xs text-blue-300/50 uppercase tracking-widest font-semibold mb-2">How It Works</p>
            <h2 className="font-display text-4xl font-bold text-white">
              Three steps.<br />
              <span style={{ background: 'linear-gradient(90deg,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                One polished document.
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-full w-full h-px border-t border-dashed border-white/10 -translate-x-4 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center mb-5">
                    <span className="font-mono font-bold text-blue-300 text-lg">{step.num}</span>
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-blue-200/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="mt-12 text-center">
            <Link to="/tool-select">
              <Button size="lg" className="gap-2 px-8 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-xl shadow-blue-500/20">
                Create Your First Document <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 px-6 border-t border-white/5" style={{ background: '#080d24' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <p className="text-xs text-blue-300/50 uppercase tracking-widest font-semibold mb-2">Pricing</p>
            <h2 className="font-display text-4xl font-bold text-white mb-3">Simple, transparent pricing</h2>
            <p className="text-blue-200/50">Start free. Scale as you grow.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-7 border relative ${plan.highlight ? 'border-blue-400/50 shadow-2xl shadow-blue-500/10' : 'border-white/10'}`}
                style={{ background: plan.highlight ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)' }}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-base font-semibold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-blue-200/40">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-blue-400" />
                      <span className="text-blue-100/65">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => base44.auth.redirectToLogin('/dashboard')}
                  className={`w-full border-0 ${plan.highlight ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-white/8 hover:bg-white/12 text-white'}`}>
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 py-10 px-6" style={{ background: '#050a1a' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center border border-blue-400/20">
              <FileText className="w-3 h-3 text-blue-300" />
            </div>
            <span className="font-display font-semibold text-white">TendeX</span>
          </div>
          <p className="text-sm text-blue-200/30">© 2026 TendeX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}