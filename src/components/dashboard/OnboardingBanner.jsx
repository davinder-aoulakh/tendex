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
          className="rounded-2xl border border-blue-400/20 p-6 mb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.10) 100%)' }}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />

          <button onClick={dismiss} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-300" />
              <h3 className="font-semibold text-white">Welcome to TendeX! Here's how it works:</h3>
            </div>
            <div className="grid sm:grid-cols-4 gap-4 mb-5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <step.icon className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white mb-0.5">{step.title}</div>
                    <div className="text-xs text-blue-200/50">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/tool-select">
                <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20">
                  Create your first document <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <button onClick={dismiss} className="text-xs text-blue-200/40 hover:text-white transition-colors">Dismiss</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}