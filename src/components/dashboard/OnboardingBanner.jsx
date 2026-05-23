import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, FileText, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: FileText, title: 'Choose your document type', desc: 'SOW, EOI, RFQ or RFP — pick what your project needs.' },
  { icon: Zap, title: 'Answer a few questions', desc: 'Our guided questionnaire collects only what matters.' },
  { icon: Sparkles, title: 'AI drafts your document', desc: 'GPT-4o writes professional procurement content in seconds.' },
  { icon: Download, title: 'Export a polished PDF', desc: 'Download a branded, print-ready PDF instantly.' },
];

const DISMISSED_KEY = 'tendex_onboarding_dismissed';

export default function OnboardingBanner({ documentCount }) {
  const alreadyDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
  const [visible, setVisible] = useState(!alreadyDismissed && documentCount === 0);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl p-6 mb-8 relative overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(232,34,26,0.12) 0%, transparent 70%)' }} />

          <button onClick={dismiss} className="absolute top-4 right-4 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: '#E8221A' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Welcome to TendeX! Here's how it works:</h3>
            </div>
            <div className="grid sm:grid-cols-4 gap-4 mb-5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(232,34,26,0.1)', border: '1px solid rgba(232,34,26,0.2)' }}>
                    <step.icon className="w-3.5 h-3.5" style={{ color: '#E8221A' }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{step.title}</div>
                     <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/tool-select">
                <Button size="sm" className="gap-1.5 text-white border-0" style={{ backgroundColor: '#E8221A', boxShadow: '0 0 20px rgba(232,34,26,0.3)' }}>
                  Create your first document <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <button onClick={dismiss} className="text-xs transition-colors ml-3" style={{ color: 'var(--text-muted)' }}>Dismiss</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}