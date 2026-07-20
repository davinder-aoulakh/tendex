import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, ChevronDown, Lightbulb, ClipboardList, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DIMENSION_LABELS = {
  clarity:           'Clarity',
  completeness:      'Completeness',
  timeline:          'Timeline',
  requirements:      'Requirements',
  supplierReadiness: 'Supplier Readiness',
};

const DOC_OPTIONS = [
  {
    type: 'EOI',
    icon: Lightbulb,
    label: 'Expression of Interest',
    desc: 'Best when you want to gauge market capability before committing to a formal process.',
    color: 'var(--purple)',
  },
  {
    type: 'RFQ',
    icon: ClipboardList,
    label: 'Request for Quotation',
    desc: 'Best for well-defined goods or services where price is the main differentiator.',
    color: 'var(--success)',
  },
  {
    type: 'RFP',
    icon: Search,
    label: 'Request for Proposal',
    desc: 'Best for complex or services-heavy procurements where supplier methodology matters.',
    color: 'var(--warning)',
  },
];

const ScoreIcon = ({ ok }) =>
  ok
    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
    : <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--destructive)' }} />;

const levelConfig = {
  high:   { icon: CheckCircle2, iconColor: 'var(--success)',    bg: 'var(--success-subtle)',   border: 'var(--success-border)' },
  medium: { icon: AlertCircle,  iconColor: 'var(--warning)',    bg: 'var(--warning-subtle)',   border: 'var(--warning-border)' },
  low:    { icon: XCircle,      iconColor: 'var(--destructive)', bg: 'rgba(200,30,58,0.08)',    border: 'rgba(200,30,58,0.25)' },
};

export default function ScopeScoreResult({ scoreData, onProceed, onOverride }) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideChoice, setOverrideChoice] = useState(null);

  if (!scoreData) return null;

  const {
    statement,
    scoreLevel = 'medium',
    weakDimensions = [],
    recommendation,
    recommendationReason,
    dimensions = {},
  } = scoreData;

  const level = levelConfig[scoreLevel] || levelConfig.medium;
  const LevelIcon = level.icon;

  const handleProceedWithOverride = () => {
    if (overrideChoice) onOverride(overrideChoice);
  };

  const handleProceedRecommended = () => {
    onProceed(recommendation);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* Score statement */}
      <div className="rounded-2xl border p-5" style={{ background: level.bg, borderColor: level.border }}>
        <div className="flex items-start gap-3">
          <LevelIcon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: level.iconColor }} />
          <div>
            <p className="font-semibold text-base leading-snug" style={{ color: 'var(--text-primary)' }}>{statement}</p>
            {weakDimensions.length > 0 && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Areas to strengthen: {weakDimensions.map(d => DIMENSION_LABELS[d] || d).join(', ')}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Scope Dimensions</p>
        {Object.entries(dimensions).map(([key, val]) => (
          <div key={key} className="flex items-start gap-3">
            <ScoreIcon ok={val?.ok} />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{DIMENSION_LABELS[key] || key}</span>
              {val?.note && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{val.note}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="rounded-2xl border p-5" style={{ border: '1px solid var(--primary)', background: 'rgba(200,30,58,0.06)', borderRadius: 14, padding: '20px' }}>
        <p style={{ color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Our Recommendation</p>
        <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
          We recommend <span style={{ color: 'var(--primary)' }}>{recommendation}</span>
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{recommendationReason}</p>
        <Button
          onClick={handleProceedRecommended}
          className="mt-4 gap-2 text-white border-0"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 0 16px rgba(200,30,58,0.25)' }}
        >
          Create {recommendation} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Override */}
      <div>
        <button
          onClick={() => setShowOverride(v => !v)}
          className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: 'var(--text-muted)' }}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showOverride ? 'rotate-180' : ''}`} />
          I want to choose a different document type
        </button>

        <AnimatePresence>
          {showOverride && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid gap-3">
                {DOC_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => setOverrideChoice(opt.type)}
                    className="text-left rounded-xl border p-4 transition-all"
                    style={{
                      borderColor: overrideChoice === opt.type ? 'var(--primary)' : 'var(--border)',
                      background: overrideChoice === opt.type ? 'rgba(200,30,58,0.06)' : 'var(--card)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <opt.icon className="w-4 h-4" style={{ color: opt.color }} />
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{opt.type} — {opt.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                  </button>
                ))}

                {overrideChoice && (
                  <Button
                    onClick={handleProceedWithOverride}
                    variant="outline"
                    className="gap-2 hover-muted self-start" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    Continue with {overrideChoice} <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}