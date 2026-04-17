import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Zap, Shield, Download, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NetworkCanvas from '@/components/landing/NetworkCanvas';

const features = [
  { icon: Zap, title: 'AI-Powered Content', desc: 'GPT-4o drafts your procurement documents in seconds, tailored to your industry and needs.' },
  { icon: FileText, title: 'Four Document Types', desc: 'Generate SOW, EOI, RFQ, and RFP documents with guided questionnaires.' },
  { icon: Shield, title: 'Professional Quality', desc: 'Templates built on real procurement standards used by governments and enterprises.' },
  { icon: Download, title: 'Instant PDF Export', desc: 'Download polished, print-ready PDFs directly from your browser.' },
];

const plans = [
  { name: 'Free', price: '$0', period: 'forever', features: ['3 documents/month', 'SOW, EOI, RFQ/RFP', 'AI content generation', 'PDF export'], cta: 'Get Started Free', link: '/dashboard', highlight: false },
  { name: 'Starter', price: '$29', period: '/month', features: ['20 documents/month', 'All document types', 'Advanced AI enhancement', 'Priority support', 'Document history'], cta: 'Get Starter', link: '/billing', highlight: true },
  { name: 'Professional', price: '$79', period: '/month', features: ['Unlimited documents', 'All document types', 'Advanced AI enhancement', 'Dedicated support', 'Priority AI processing'], cta: 'Get Professional', link: '/billing', highlight: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-inter">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-white">TendeX</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — full screen with network canvas */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0f2e 0%, #0d1b4b 40%, #0e2260 70%, #0a1535 100%)' }}>

        <NetworkCanvas />

        {/* Soft radial glow center */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37,99,235,0.18) 0%, transparent 70%)' }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

            <div className="inline-flex items-center gap-2 border border-blue-400/30 bg-blue-500/10 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Procurement Documents
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
              The Art of Making
            </h1>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
              style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Informed Decisions
            </h1>

            <p className="text-xl text-blue-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Generate professional SOW, EOI, RFQ and RFP documents in minutes — not days. Powered by AI, guided by expertise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tool-select">
                <Button size="lg" className="gap-2 px-8 text-base bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/30">
                  Create Your First Document <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="px-8 text-base border-white/20 text-white hover:bg-white/10 bg-transparent">
                  View Dashboard
                </Button>
              </Link>
            </div>

          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40 text-xs">
          <span>Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-white/40 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-4xl font-semibold text-foreground mb-4">Procurement Simplified</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">Built for businesses navigating complex procurement — from first draft to final PDF.</p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-4xl font-semibold text-foreground mb-4">Simple, transparent pricing</h2>
              <p className="text-muted-foreground text-lg">Start free. Scale as you grow.</p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`rounded-2xl p-8 border ${plan.highlight ? 'bg-primary text-primary-foreground border-primary shadow-xl scale-105' : 'bg-card border-border'}`}>
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-1 ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-primary-foreground/80' : 'text-primary'}`} />
                      <span className={plan.highlight ? 'text-primary-foreground/90' : 'text-foreground'}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.link}>
                  <Button className="w-full" variant={plan.highlight ? 'secondary' : 'default'}>{plan.cta}</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">TendeX</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 TendeX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}