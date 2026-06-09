import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const STATUS_MESSAGES = [
  'Assembling your document...',
  'Applying AI enhancements...',
  'Generating professional content...',
  'Adding your branding...',
  'Almost ready...',
];

export default function GeneratingScreen({ done, documentId }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (done) { setProgress(100); return; }
    const msgTimer = setInterval(() => setMsgIndex(i => (i + 1) % STATUS_MESSAGES.length), 3500);
    const progTimer = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8 + 2, 90)), 1200);
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, [done]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      style={{ background: 'var(--background)' }}>

      {/* TendeX logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,34,26,0.12)', border: '1px solid var(--border-strong)' }}>
          <svg className="w-5 h-5" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className="font-syne text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>TendeX</span>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center px-6">

            {/* Animated ring */}
            <div className="relative w-24 h-24 mb-8">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" style={{ stroke: 'var(--border)' }} />
                <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" style={{ stroke: 'var(--primary)' }}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(progress)}%</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p key={msgIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {STATUS_MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This usually takes under 60 seconds</p>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center px-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
              <CheckCircle className="w-20 h-20 text-emerald-400 mb-6" />
            </motion.div>
            <h2 className="text-2xl font-syne font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Your document is ready!</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Review and edit your AI-generated content below.</p>
            <div className="flex gap-3">
              {documentId && (
                <Link to={`/document/${documentId}`}>
                  <Button className="text-white border-0" style={{ backgroundColor: 'var(--primary)' }}>
                    View Document
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" className="hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}