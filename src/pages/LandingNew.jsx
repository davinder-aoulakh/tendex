import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, TrendingUp, FileText, Shield, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

export default function LandingNew() {
  const navigate = useNavigate();
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080E1A' }}>
      {/* Top Accent Strip */}
      <div className="accent-strip" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 blur-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-syne font-800 text-xl text-white">
            TendeX<span style={{ color: '#00C9A7' }}>.</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="font-dm-sans text-sm text-[#8FA5C0] hover:text-[#00C9A7] transition-colors">
              How it works
            </a>
            <a href="#documents" className="font-dm-sans text-sm text-[#8FA5C0] hover:text-[#00C9A7] transition-colors">
              Documents
            </a>
            <a href="#pricing" className="font-dm-sans text-sm text-[#8FA5C0] hover:text-[#00C9A7] transition-colors">
              Pricing
            </a>
            <a href="#about" className="font-dm-sans text-sm text-[#8FA5C0] hover:text-[#00C9A7] transition-colors">
              About
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => base44.auth.redirectToLogin('/dashboard')}
              className="font-dm-sans text-sm text-[#8FA5C0] hover:text-[#00C9A7] transition-colors"
            >
              Log in
            </button>
            <Button
              onClick={() => base44.auth.redirectToLogin('/plan-selection')}
              className="font-syne font-700 text-sm"
              style={{ backgroundColor: '#00C9A7', color: '#080E1A' }}
            >
              Start free trial →
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            {/* Eyebrow Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ borderColor: '#00C9A7', backgroundColor: 'rgba(0,201,167,0.08)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00C9A7' }} />
              <span className="font-syne font-600 text-xs text-[#00C9A7] uppercase tracking-wide">Australia's AI Procurement Platform</span>
            </motion.div>

            {/* H1 */}
            <motion.h1 variants={fadeInUp} className="font-syne font-800 text-5xl md:text-6xl leading-[1.08] tracking-tight" style={{ color: '#E8F0F8' }}>
              Stop wasting time on{' '}
              <span style={{ color: '#00C9A7' }}>procurement paperwork</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeInUp} className="font-dm-sans font-300 text-lg text-[#8FA5C0] leading-relaxed max-w-lg">
              TendeX guides you from procurement need to a professional, market-ready document — Scope, EOI, RFQ, or RFP — in a fraction of the usual time. No expertise required.
            </motion.p>

            {/* CTA Buttons */}
             <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
               <Button
                 onClick={() => base44.auth.redirectToLogin('/plan-selection')}
                 className="font-syne font-700 text-base px-6 py-2.5 rounded-lg primary-btn-hover"
                 style={{ backgroundColor: '#00C9A7', color: '#080E1A' }}>
                 Start your first procurement free
               </Button>
              <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="font-dm-sans font-400 text-base px-6 py-2.5 rounded-lg text-[#00C9A7] border border-[#00C9A7] hover:border-[#00E0BA] transition-all flex items-center gap-2 group">
                See how it works <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Trust Strip */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-2">
                {[{ initials: 'JD', bg: '#1E3A4C' }, { initials: 'SM', bg: '#1E3A4C' }, { initials: 'AS', bg: '#1E3A4C' }, { initials: 'KL', bg: '#1E3A4C' }].map((avatar, i) => (
                  <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-[#080E1A]" style={{ backgroundColor: avatar.bg }}>
                    <span className="font-syne font-700 text-xs text-[#00C9A7]">{avatar.initials}</span>
                  </div>
                ))}
              </div>
              <p className="font-dm-sans font-400 text-sm text-[#5C7A99]">Trusted by procurement managers across Australia</p>
            </motion.div>
          </motion.div>

          {/* Right Column - App Preview Card */}
          <motion.div variants={fadeInUp} className="relative hidden md:block">
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#111D2E', borderColor: 'rgba(255,255,255,0.12)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <span className="font-syne font-700 text-xs text-[#00C9A7] uppercase tracking-wide">Your Procurement</span>
                <div className="px-2 py-1 rounded" style={{ backgroundColor: '#F59E0B' }}>
                  <span className="font-syne font-600 text-xs text-[#080E1A]">AI scoring</span>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-8">
                {[
                  { num: 1, title: 'Business profile', complete: true, ai: false },
                  { num: 2, title: 'Scope of work', complete: true, ai: true },
                  { num: 3, title: 'Market engagement', active: true, ai: true, sub: 'Generating your RFP…' },
                  { num: 4, title: 'Issue to market', future: true, ai: false, sub: 'Word + PDF export ready' },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-syne font-700 text-xs ${step.active ? 'text-white' : 'text-[#00C9A7]'}`} style={{ backgroundColor: step.complete ? '#00C9A7' : step.active ? '#00C9A7' : 'rgba(255,255,255,0.1)' }}>
                      {step.complete || step.active ? '✓' : step.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-syne font-700 text-sm ${step.future ? 'text-[#5C7A99]' : 'text-white'}`}>{step.title}</span>
                        {step.ai && <span className="font-syne font-600 text-xs text-[#00C9A7]">★ AI</span>}
                        {step.active && <ArrowRight className="w-4 h-4 text-[#00C9A7]" />}
                      </div>
                      {step.sub && <p className="font-dm-sans font-400 text-xs text-[#5C7A99] mt-1">{step.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Recommendation Bubble */}
              <div className="relative mt-8 p-4 rounded-xl border-2" style={{ backgroundColor: 'rgba(0,201,167,0.1)', borderColor: '#00C9A7' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-syne font-700 text-xs text-[#00C9A7] uppercase">★ AI Recommendation</span>
                </div>
                <p className="font-syne font-800 text-lg text-white mb-2">Request for Proposal</p>
                <p className="font-dm-sans font-400 text-xs text-[#8FA5C0]">Your scope is strong. Suppliers need to explain their approach.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="w-full border-y" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-x" style={{ divideColor: 'rgba(255,255,255,0.07)' }}>
          {[
            { stat: '3×', desc: 'Faster than building documents manually' },
            { stat: '4', desc: 'Document types — Scope, EOI, RFQ, RFP' },
            { stat: '100%', desc: 'Stored in Australia, Privacy Act compliant' },
          ].map((item, i) => (
            <div key={i} className="px-6 py-8 text-center">
              <div className="font-syne font-800 text-4xl text-[#00C9A7] mb-2">{item.stat}</div>
              <p className="font-dm-sans font-400 text-sm text-[#8FA5C0]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-20 px-6" style={{ backgroundColor: '#0D1625' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-12">
            <p className="font-syne font-700 text-xs text-[#00C9A7] uppercase tracking-widest mb-2">How it works</p>
            <h2 className="font-syne font-800 text-4xl md:text-5xl text-white mb-4">From blank page to market-ready in minutes</h2>
            <p className="font-dm-sans font-400 text-lg text-[#8FA5C0] max-w-2xl">
              Our guided process combines your expertise with AI assistance to create professional procurement documents.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Steps Column */}
            <div className="space-y-6">
              {[
                { num: 1, title: 'Set up your business profile once', tag: null },
                { num: 2, title: 'Answer guided scope questions', tag: '★ AI assisted' },
                { num: 3, title: 'AI scores your scope and recommends a document type', tag: '★ AI routing' },
                { num: 4, title: 'Download your professional document', tag: '↓ Word + PDF export' },
              ].map((step) => (
                <motion.div
                  key={step.num}
                  onHoverStart={() => setHoveredStep(step.num)}
                  onHoverEnd={() => setHoveredStep(null)}
                  className="group flex gap-4 cursor-pointer card-hover p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: hoveredStep === step.num ? 'rgba(0,201,167,0.3)' : 'transparent', border: '1px solid' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-syne font-700 text-white transition-all" style={{ backgroundColor: hoveredStep === step.num ? '#00C9A7' : 'rgba(0,201,167,0.1)' }}>
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-syne font-700 text-white mb-1">{step.title}</h4>
                    {step.tag && <span className="inline-block font-syne font-600 text-xs px-2 py-1 rounded text-[#00C9A7]">{step.tag}</span>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Scoring Widget */}
            <div className="sticky top-32 h-fit rounded-xl p-6 border" style={{ backgroundColor: '#111D2E', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div className="flex gap-1 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 1 ? '#00C9A7' : 'rgba(255,255,255,0.2)' }} />
                ))}
              </div>
              <h4 className="font-syne font-700 text-sm text-white mb-6">Scope Scoring</h4>

              {[
                { label: 'Clarity', value: 88, color: '#00C9A7' },
                { label: 'Completeness', value: 82, color: '#00C9A7' },
                { label: 'Timeline', value: 60, color: '#F59E0B' },
                { label: 'Requirements', value: 75, color: '#00C9A7' },
                { label: 'Supplier readiness', value: 90, color: '#00C9A7' },
              ].map((item, i) => (
                <div key={i} className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-dm-sans font-400 text-xs text-[#8FA5C0]">{item.label}</span>
                    <span className="font-syne font-700 text-xs" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}

              <div className="mt-6 p-3 rounded-lg border-2" style={{ backgroundColor: 'rgba(0,201,167,0.1)', borderColor: '#00C9A7' }}>
                <p className="font-syne font-700 text-xs text-[#00C9A7] uppercase mb-1">★ AI Recommendation</p>
                <p className="font-syne font-800 text-base text-white">Request for Proposal</p>
                <p className="font-dm-sans font-400 text-xs text-[#5C7A99] mt-1">Detailed requirements warrant a comprehensive proposal process.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why TendeX Section */}
      <section className="py-20 px-6" style={{ backgroundColor: '#080E1A' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-12">
            <p className="font-syne font-700 text-xs text-[#00C9A7] uppercase tracking-widest mb-2">Why TendeX</p>
            <h2 className="font-syne font-800 text-4xl md:text-5xl text-white">Built for Australian procurement</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'AI-powered not template-driven', desc: 'Smart algorithms, not rigid templates' },
              { icon: TrendingUp, title: 'Smart document routing', desc: 'Right document type, every time' },
              { icon: FileText, title: 'Professional Word + PDF export', desc: 'Download and send immediately' },
              { icon: Shield, title: 'Australian data sovereignty', desc: 'Data stored and processed locally' },
              { icon: CheckCircle, title: 'ABN validation built in', desc: 'Verify Australian businesses instantly' },
              { icon: Clock, title: 'Save and return anytime', desc: 'Never lose your progress or data' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} whileHover={{ y: -3 }} className="rounded-xl p-6 border card-hover group" style={{ backgroundColor: '#111D2E', borderColor: 'rgba(255,255,255,0.12)' }}>
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00C9A7] transition-colors" style={{ backgroundColor: 'rgba(0,201,167,0.1)', borderColor: 'rgba(0,201,167,0.2)', border: '1px solid' }}>
                    <Icon className="w-5 h-5 text-[#00C9A7]" />
                  </div>
                  <h3 className="font-syne font-700 text-white mb-2">{feature.title}</h3>
                  <p className="font-dm-sans font-400 text-sm text-[#5C7A99]">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section id="documents" className="py-20 px-6" style={{ backgroundColor: '#0D1625' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-12">
            <p className="font-syne font-700 text-xs text-[#00C9A7] uppercase tracking-widest mb-2">Documents</p>
            <h2 className="font-syne font-800 text-4xl md:text-5xl text-white">Every document you need to go to market</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'SOW', title: 'Scope of Work', desc: 'Define project deliverables and responsibilities' },
              { label: 'EOI', title: 'Expression of Interest', desc: 'Market sounding and supplier pre-qualification' },
              { label: 'RFQ', title: 'Request for Quote', desc: 'Solicit prices for well-defined goods or services' },
              { label: 'RFP', title: 'Request for Proposal', desc: 'Detailed proposals for complex solutions' },
            ].map((doc, i) => (
              <motion.div key={i} whileHover={{ y: -3 }} className="rounded-xl p-6 border card-hover" style={{ backgroundColor: '#111D2E', borderColor: 'rgba(255,255,255,0.12)' }}>
                <p className="font-syne font-800 text-xs text-[#00C9A7] uppercase tracking-wide mb-2">{doc.label}</p>
                <h3 className="font-syne font-700 text-lg text-white mb-2">{doc.title}</h3>
                <p className="font-dm-sans font-400 text-sm text-[#5C7A99] mb-4">{doc.desc}</p>
                <div className="flex gap-2">
                  {['Word', 'PDF', '★ AI'].map((badge, j) => (
                    <span key={j} className="font-syne font-600 text-xs px-2 py-1 rounded" style={{ backgroundColor: '#172238', color: '#8FA5C0' }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6" style={{ backgroundColor: '#080E1A' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-12 text-center">
            <p className="font-syne font-700 text-xs text-[#00C9A7] uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="font-syne font-800 text-4xl md:text-5xl text-white">Simple, transparent pricing</h2>
            <p className="font-dm-sans font-400 text-lg text-[#8FA5C0] max-w-2xl mx-auto mt-4">
              Start free. Scale as you grow. No credit card required for the trial.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Trial Card */}
            <motion.div whileHover={{ y: -3 }} className="rounded-xl p-8 border card-hover" style={{ backgroundColor: '#111D2E', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div className="mb-6">
                <h3 className="font-syne font-700 text-2xl text-white mb-2">Free Trial</h3>
                <p className="font-dm-sans font-400 text-lg text-[#8FA5C0]">14 days free</p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  '1 active procurement document',
                  'Scope of Work generation',
                  '1 document type (SOW, EOI, RFQ, or RFP)',
                  'Basic email support',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#00C9A7] flex-shrink-0 mt-0.5" />
                    <span className="font-dm-sans font-400 text-sm text-[#E8F0F8]">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                 onClick={() => base44.auth.redirectToLogin('/plan-selection')}
                 className="w-full font-syne font-700 text-base"
                 style={{ backgroundColor: '#00C9A7', color: '#080E1A' }}>
                 Start free trial →
               </Button>
            </motion.div>

            {/* Professional Plan Card */}
            <motion.div whileHover={{ y: -3 }} className="rounded-xl p-8 border-2 card-hover relative" style={{ backgroundColor: 'rgba(0,201,167,0.08)', borderColor: '#00C9A7' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="font-syne font-700 text-xs px-3 py-1 rounded-full text-[#080E1A]" style={{ backgroundColor: '#00C9A7' }}>
                  MOST POPULAR
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-syne font-700 text-2xl text-white mb-2">Professional Plan</h3>
                <p className="font-dm-sans font-400 text-lg text-[#8FA5C0]">Pricing [TBC]</p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  'Unlimited active procurements',
                  'All document types (SOW, EOI, RFQ, RFP)',
                  'Word & PDF export',
                  'Priority email support',
                  '[Additional features TBC]',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#00C9A7] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#080E1A]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-dm-sans font-400 text-sm text-[#E8F0F8]">{feature}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-2.5 rounded-lg font-syne font-700 text-base border transition-all" style={{ borderColor: '#00C9A7', color: '#00C9A7' }}>
                Contact us
              </button>
            </motion.div>
          </div>

          <p className="text-center font-dm-sans font-400 text-xs text-[#5C7A99] mt-12">
            Pricing and features are placeholder values [TBC] pending final confirmation.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6" style={{ backgroundColor: '#080E1A' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-12 text-center">
            <p className="font-syne font-700 text-xs text-[#00C9A7] uppercase tracking-widest mb-2">What people are saying</p>
            <h2 className="font-syne font-800 text-4xl md:text-5xl text-white">Trusted by procurement professionals across Australia</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'TendeX cut our procurement document creation time from weeks to hours. The AI suggestions are surprisingly accurate.',
                author: 'Sarah Mitchell',
                role: 'Procurement Manager, Acme Corp',
                initials: 'SM',
              },
              {
                quote: 'Finally, a tool built for Australian procurement. The ABN validation and data sovereignty features were exactly what we needed.',
                author: 'James Chen',
                role: 'Head of Supply Chain, Tech Solutions',
                initials: 'JC',
              },
              {
                quote: 'Our team went from struggling with templates to issuing professional RFPs in minutes. Highly recommend.',
                author: 'Alexandra Turner',
                role: 'Operations Director, Infrastructure Group',
                initials: 'AT',
              },
            ].map((testimonial, i) => (
              <motion.div key={i} whileHover={{ y: -3 }} className="rounded-xl p-6 border card-hover" style={{ backgroundColor: '#111D2E', borderColor: 'rgba(255,255,255,0.12)' }}>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="font-dm-sans font-400 italic text-[#8FA5C0] mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-700 text-sm text-[#00C9A7]" style={{ backgroundColor: '#1E3A4C' }}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-syne font-700 text-sm text-white">{testimonial.author}</p>
                    <p className="font-dm-sans font-400 text-xs text-[#5C7A99]">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: '#0D1625' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #00C9A7 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <p className="font-syne font-700 text-xs text-[#00C9A7] uppercase tracking-widest mb-4">Get started today</p>
            <h2 className="font-syne font-800 text-5xl md:text-6xl text-white mb-4 leading-tight">
              Your next procurement starts <span style={{ color: '#00C9A7' }}>here</span>
            </h2>
            <p className="font-dm-sans font-400 text-lg text-[#8FA5C0] mb-8">
              Join hundreds of Australian procurement teams who've switched to TendeX.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button
                 onClick={() => base44.auth.redirectToLogin('/plan-selection')}
                 className="font-syne font-700 text-base px-8 py-3 rounded-lg primary-btn-hover"
                 style={{ backgroundColor: '#00C9A7', color: '#080E1A' }}>
                 Start free trial →
               </Button>
              <a href="mailto:hello@tendex.com.au" className="font-syne font-700 text-base px-8 py-3 rounded-lg border transition-all inline-block" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#E8F0F8' }}>
                Book a demo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-12" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-syne font-800 text-lg text-white mb-2">
              TendeX<span style={{ color: '#00C9A7' }}>.</span>
            </div>
            <p className="font-dm-sans font-300 text-sm text-[#5C7A99] mb-4">
              Professional procurement documents, powered by AI
            </p>
            <p className="font-dm-sans font-400 text-xs text-[#5C7A99]">
              © 2024 TendeX Australia. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-syne font-700 text-xs text-white uppercase tracking-wide mb-4">Product</h4>
            <div className="space-y-2 font-dm-sans font-400 text-sm text-[#5C7A99]">
              <a href="#how" className="block hover:text-[#00C9A7] transition-colors">
                Features
              </a>
              <a href="#pricing" className="block hover:text-[#00C9A7] transition-colors">
                Pricing
              </a>
              <a href="#" className="block hover:text-[#00C9A7] transition-colors">
                Security
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-syne font-700 text-xs text-white uppercase tracking-wide mb-4">Company</h4>
            <div className="space-y-2 font-dm-sans font-400 text-sm text-[#5C7A99]">
              <a href="#about" className="block hover:text-[#00C9A7] transition-colors">
                About
              </a>
              <a href="#" className="block hover:text-[#00C9A7] transition-colors">
                Blog
              </a>
              <a href="mailto:hello@tendex.com.au" className="block hover:text-[#00C9A7] transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-syne font-700 text-xs text-white uppercase tracking-wide mb-4">Legal</h4>
            <div className="space-y-2 font-dm-sans font-400 text-sm text-[#5C7A99]">
              <a href="#" className="block hover:text-[#00C9A7] transition-colors">
                Privacy
              </a>
              <a href="#" className="block hover:text-[#00C9A7] transition-colors">
                Terms
              </a>
              <a href="#" className="block hover:text-[#00C9A7] transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Accent Strip */}
      <div className="accent-strip" />
    </div>
  );
}