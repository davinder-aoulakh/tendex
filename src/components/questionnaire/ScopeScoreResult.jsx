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
    color: 'text-purple-300',
    border: 'border-purple-400/40',
    bg: 'rgba(168,85,247,0.08)',
  },
  {
    type: 'RFQ',
    icon: ClipboardList,
    label: 'Request for Quotation',
    desc: 'Best for well-defined goods or services where price is the main differentiator.',
    color: 'text-green-300',
    border: 'border-green-400/40',
    bg: 'rgba(34,197,94,0.08)',
  },
  {
    type: 'RFP',
    icon: Search,
    label: 'Request for Proposal',
    desc: 'Best for complex or services-heavy procurements where supplier methodology matters.',
    color: 'text-orange-300',
    border: 'border-orange-400/40',
    bg: 'rgba(249,115,22,0.08)',
  },
];

const ScoreIcon = ({ ok }) =>
  ok
    ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
    : <XCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />;

const levelConfig = {
  high:   { icon: CheckCircle2, iconClass: 'text-green-400', bg: 'rgba(34,197,94,0.08)',   border: 'border-green-400/30' },
  medium: { icon: AlertCircle,  iconClass: 'text-amber-400', bg: 'rgba(245,158,11,0.08)',  border: 'border-amber-400/30' },
  low:    { icon: XCircle,      iconClass: 'text-red-400',   bg: 'rgba(239,68,68,0.08)',   border: 'border-red-400/30'   },
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
      <div className={`rounded-2xl border p-5 ${level.border}`} style={{ background: level.bg }}>
        <div className="flex items-start gap-3">
          <LevelIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${level.iconClass}`} />
          <div>
            <p className="font-semibold text-white text-base leading-snug">{statement}</p>
            {weakDimensions.length > 0 && (
              <p className="text-sm text-white/50 mt-1">
                Areas to strengthen: {weakDimensions.map(d => DIMENSION_LABELS[d] || d).join(', ')}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="rounded-2xl border border-white/10 p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs text-blue-200/40 uppercase tracking-widest font-semibold">Scope Dimensions</p>
        {Object.entries(dimensions).map(([key, val]) => (
          <div key={key} className="flex items-start gap-3">
            <ScoreIcon ok={val?.ok} />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-white/80">{DIMENSION_LABELS[key] || key}</span>
              {val?.note && <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{val.note}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="rounded-2xl border border-blue-400/30 p-5" style={{ background: 'rgba(59,130,246,0.08)' }}>
        <p className="text-xs text-blue-300/50 uppercase tracking-widest font-semibold mb-2">Our Recommendation</p>
        <p className="text-white font-semibold text-lg mb-1">
          We recommend <span className="text-blue-300">{recommendation}</span>
        </p>
        <p className="text-sm text-blue-200/60 leading-relaxed">{recommendationReason}</p>
        <Button
          onClick={handleProceedRecommended}
          className="mt-4 gap-2 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20"
        >
          Create {recommendation} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Override */}
      <div>
        <button
          onClick={() => setShowOverride(v => !v)}
          className="flex items-center gap-1.5 text-sm text-blue-200/40 hover:text-blue-200 transition-colors"
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
                    className={`text-left rounded-xl border p-4 transition-all ${
                      overrideChoice === opt.type ? opt.border : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ background: overrideChoice === opt.type ? opt.bg : 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <opt.icon className={`w-4 h-4 ${opt.color}`} />
                      <span className="font-medium text-white text-sm">{opt.type} — {opt.label}</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}

                {overrideChoice && (
                  <Button
                    onClick={handleProceedWithOverride}
                    variant="outline"
                    className="gap-2 border-white/20 text-white hover:bg-white/10 self-start"
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