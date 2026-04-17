import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Zap, Shield, Download, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Zap, title: 'AI-Powered Content', desc: 'GPT-4o drafts your procurement documents in seconds, tailored to your industry and needs.' },
  { icon: FileText, title: 'Three Document Types', desc: 'Generate SOW, EOI, RFQ, and RFP documents with guided questionnaires.' },
  { icon: Shield, title: 'Professional Quality', desc: 'Templates built on real procurement standards used by governments and enterprises.' },
  { icon: Download, title: 'Instant PDF Export', desc: 'Download polished, print-ready PDFs directly from your browser.' },
];

const plans = [
  { name: 'Free', price: '$0', period: 'forever', docs: 3, features: ['3 documents/month', 'SOW, EOI, RFQ/RFP', 'AI content generation', 'PDF export'], cta: 'Get Started', highlight: false },
  { name: 'Starter', price: '$29', period: '/month', docs: 20, features: ['20 documents/month', 'All document types', 'Advanced AI enhancement', 'Priority support', 'Document history'], cta: 'Start Free Trial', highlight: true },
  { name: 'Professional', price: '$79', period: '/month', docs: 999, features: ['Unlimited documents', 'All document types', 'Advanced AI enhancement', 'Dedicated support', 'Team collaboration'], cta: 'Get Professional', highlight: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-xl text-foreground">TendeX</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/dashboard"><Button size="sm">Get Started Free</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Procurement Documents
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Procurement docs<br />
              <span className="text-primary">without the pain.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Generate professional SOW, EOI, RFQ and RFP documents in minutes — not days. Powered by AI, guided by expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tool-select">
                <Button size="lg" className="gap-2 px-8 h-13 text-base">
                  Create Your First Document <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="px-8 h-13 text-base">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-foreground mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg">Built for small businesses navigating complex procurement.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mb-4">
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
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
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
                <Link to="/dashboard">
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