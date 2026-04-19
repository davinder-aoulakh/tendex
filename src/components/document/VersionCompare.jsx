import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Sparkles, Pencil, Clock, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SECTION_LABELS, SECTION_SCHEMAS } from '@/lib/aiDocumentGenerator';
import { format } from 'date-fns';

// Naive word-level diff — returns array of { text, type: 'same'|'added'|'removed' }
function diffWords(oldText, newText) {
  const oldWords = (oldText || '').split(/(\s+)/);
  const newWords = (newText || '').split(/(\s+)/);

  // Build LCS table
  const m = oldWords.length, n = newWords.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = oldWords[i - 1] === newWords[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  // Backtrack
  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ text: oldWords[i - 1], type: 'same' });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ text: newWords[j - 1], type: 'added' });
      j--;
    } else {
      result.unshift({ text: oldWords[i - 1], type: 'removed' });
      i--;
    }
  }
  return result;
}

function DiffText({ oldText, newText }) {
  if (!oldText && !newText) return <span className="text-blue-200/30 italic">Empty</span>;

  const tokens = diffWords(oldText || '', newText || '');
  const hasChanges = tokens.some(t => t.type !== 'same');

  if (!hasChanges) {
    return <span className="text-blue-100/70 text-sm leading-relaxed">{newText}</span>;
  }

  return (
    <span className="text-sm leading-relaxed">
      {tokens.map((token, i) => {
        if (token.type === 'same') return <span key={i} className="text-blue-100/70">{token.text}</span>;
        if (token.type === 'added') return <mark key={i} className="bg-green-500/25 text-green-200 rounded px-0.5">{token.text}</mark>;
        if (token.type === 'removed') return <del key={i} className="bg-red-500/20 text-red-300/70 line-through rounded px-0.5">{token.text}</del>;
        return null;
      })}
    </span>
  );
}

function SectionDiff({ sectionKey, leftContent, rightContent }) {
  const label = SECTION_LABELS[sectionKey] || sectionKey;
  const left = leftContent?.[sectionKey] || '';
  const right = rightContent?.[sectionKey] || '';
  const changed = left !== right;

  return (
    <div className={`rounded-xl border overflow-hidden ${changed ? 'border-blue-400/30' : 'border-white/10'}`}
      style={{ background: changed ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <h3 className="font-semibold text-sm text-blue-100/80">{label}</h3>
        {changed
          ? <Badge className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">Changed</Badge>
          : <Badge className="text-xs bg-white/5 text-white/30 border-white/10">Unchanged</Badge>}
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/10">
        {/* Left */}
        <div className="p-4">
          {!left
            ? <span className="text-xs text-blue-200/30 italic">Not present</span>
            : <p className="text-sm text-blue-100/50 leading-relaxed whitespace-pre-wrap">{left}</p>}
        </div>
        {/* Right (with diff highlights) */}
        <div className="p-4">
          {!right
            ? <span className="text-xs text-blue-200/30 italic">Not present</span>
            : <p className="leading-relaxed whitespace-pre-wrap"><DiffText oldText={left} newText={right} /></p>}
        </div>
      </div>
    </div>
  );
}

export default function VersionCompare({ documentId, documentType, onClose }) {
  const [leftId, setLeftId] = useState(null);
  const [rightId, setRightId] = useState(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', documentId],
    queryFn: () => base44.entities.DocumentVersion.filter({ document_id: documentId }, '-created_date', 50),
  });

  const leftVersion = versions.find(v => v.id === leftId);
  const rightVersion = versions.find(v => v.id === rightId);
  const sections = SECTION_SCHEMAS[documentType] || [];

  const canCompare = leftVersion && rightVersion && leftId !== rightId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'rgba(8,13,36,0.98)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-white">Compare Versions</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Version selectors */}
      <div className="grid grid-cols-2 divide-x divide-white/10 border-b border-white/10 flex-shrink-0">
        {[{ side: 'left', value: leftId, set: setLeftId, label: 'Base version' },
          { side: 'right', value: rightId, set: setRightId, label: 'Compare to' }].map(({ side, value, set, label }) => (
          <div key={side} className="px-6 py-4">
            <p className="text-xs text-blue-200/40 mb-2 uppercase tracking-wide">{label}</p>
            {isLoading ? (
              <div className="h-9 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ) : (
              <select
                value={value || ''}
                onChange={e => set(e.target.value || null)}
                className="w-full rounded-lg border border-white/10 bg-white/5 text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
              >
                <option value="">Select a version...</option>
                {versions.map((v, i) => (
                  <option key={v.id} value={v.id}>
                    {i === 0 ? '★ ' : ''}{v.label || (v.source === 'ai_generated' ? 'AI Generated' : 'Manual Save')}
                    {v.created_date ? ` — ${format(new Date(v.created_date), 'dd MMM yy, h:mm a')}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Column labels */}
      {canCompare && (
        <div className="grid grid-cols-2 divide-x divide-white/10 border-b border-white/10 flex-shrink-0 px-0">
          {[leftVersion, rightVersion].map((v, i) => (
            <div key={i} className="px-6 py-2.5 flex items-center gap-2">
              {v.source === 'ai_generated'
                ? <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                : <Pencil className="w-3.5 h-3.5 text-purple-400" />}
              <span className="text-sm font-medium text-white">
                {v.label || (v.source === 'ai_generated' ? 'AI Generated' : 'Manual Save')}
              </span>
              <span className="text-xs text-blue-200/40 flex items-center gap-1 ml-1">
                <Clock className="w-3 h-3" />
                {v.created_date ? format(new Date(v.created_date), 'dd MMM yy, h:mm a') : '—'}
              </span>
              {i === 1 && (
                <div className="ml-auto flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><mark className="bg-green-500/25 text-green-200 rounded px-1">added</mark></span>
                  <span className="flex items-center gap-1"><del className="bg-red-500/20 text-red-300/70 line-through rounded px-1">removed</del></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Diff content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {!canCompare ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <ArrowLeftRight className="w-10 h-10 text-blue-300/20 mx-auto mb-4" />
            <p className="text-blue-200/40 text-sm">Select two different versions above to compare them.</p>
          </div>
        ) : (
          sections.map(sectionKey => (
            <SectionDiff
              key={sectionKey}
              sectionKey={sectionKey}
              leftContent={leftVersion?.content}
              rightContent={rightVersion?.content}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}