import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Pencil, Clock, ArrowLeftRight, ChevronDown, ChevronUp, PlusCircle, MinusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SECTION_LABELS, SECTION_SCHEMAS } from '@/lib/aiDocumentGenerator';
import { format } from 'date-fns';

// ─── Word-level LCS Diff ──────────────────────────────────────────────────────
function diffWords(oldText, newText) {
  const tokenize = (t) => (t || '').split(/(\s+|\b)/g).filter(Boolean);
  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);
  const m = oldTokens.length, n = newTokens.length;

  // Use a flat array for performance
  const dp = new Int32Array((m + 1) * (n + 1));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i * (n + 1) + j] = oldTokens[i - 1] === newTokens[j - 1]
        ? dp[(i - 1) * (n + 1) + (j - 1)] + 1
        : Math.max(dp[(i - 1) * (n + 1) + j], dp[i * (n + 1) + (j - 1)]);

  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      result.unshift({ text: oldTokens[i - 1], type: 'same' });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i * (n + 1) + (j - 1)] >= dp[(i - 1) * (n + 1) + j])) {
      result.unshift({ text: newTokens[j - 1], type: 'added' });
      j--;
    } else {
      result.unshift({ text: oldTokens[i - 1], type: 'removed' });
      i--;
    }
  }
  return result;
}

function countChanges(tokens) {
  let added = 0, removed = 0;
  tokens.forEach(t => {
    if (t.type === 'added' && t.text.trim()) added++;
    if (t.type === 'removed' && t.text.trim()) removed++;
  });
  return { added, removed };
}

// ─── Render diff tokens ───────────────────────────────────────────────────────
function DiffPane({ tokens, side }) {
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {tokens.map((token, i) => {
        if (token.type === 'same') {
          return <span key={i} className="text-blue-100/65">{token.text}</span>;
        }
        if (side === 'left') {
          if (token.type === 'removed')
            return (
              <mark key={i} className="rounded px-0.5 bg-red-500/25 text-red-200 line-through decoration-red-400/60">
                {token.text}
              </mark>
            );
          return null; // don't show additions on left
        } else {
          if (token.type === 'added')
            return (
              <mark key={i} className="rounded px-0.5 bg-emerald-500/25 text-emerald-200">
                {token.text}
              </mark>
            );
          return null; // don't show deletions on right
        }
      })}
    </p>
  );
}

// ─── Per-section comparison block ────────────────────────────────────────────
function SectionDiff({ sectionKey, leftContent, rightContent, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const label = SECTION_LABELS[sectionKey] || sectionKey;
  const left = leftContent?.[sectionKey] || '';
  const right = rightContent?.[sectionKey] || '';
  const changed = left !== right;

  const tokens = useMemo(() => (changed ? diffWords(left, right) : []), [left, right, changed]);
  const { added, removed } = useMemo(() => (changed ? countChanges(tokens) : { added: 0, removed: 0 }), [tokens, changed]);

  const onlyInLeft = !left && !!right ? false : !!left && !right;
  const onlyInRight = !right && !!left ? false : !left && !!right;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        changed ? 'border-blue-400/20' : 'border-white/8'
      }`}
      style={{ background: changed ? 'rgba(59,130,246,0.04)' : 'rgba(255,255,255,0.025)' }}
    >
      {/* Section header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-white/8 hover:bg-white/5 transition-colors text-left"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-blue-100/80">{label}</span>
          {changed ? (
            <div className="flex items-center gap-1.5">
              {added > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-emerald-300/80 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                  <PlusCircle className="w-3 h-3" />{added}
                </span>
              )}
              {removed > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-red-300/80 bg-red-500/15 px-1.5 py-0.5 rounded">
                  <MinusCircle className="w-3 h-3" />{removed}
                </span>
              )}
              <Badge className="text-xs bg-amber-500/15 text-amber-300 border-amber-500/25">Modified</Badge>
            </div>
          ) : (
            <Badge className="text-xs bg-white/5 text-white/25 border-white/10">Unchanged</Badge>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>

      {/* Expandable diff body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 divide-x divide-white/8">
              {/* Left pane */}
              <div className="p-5">
                {!left ? (
                  <span className="text-xs text-blue-200/25 italic">Not present in this version</span>
                ) : changed ? (
                  <DiffPane tokens={tokens} side="left" />
                ) : (
                  <p className="text-sm text-blue-100/65 leading-relaxed whitespace-pre-wrap break-words">{left}</p>
                )}
              </div>
              {/* Right pane */}
              <div className="p-5">
                {!right ? (
                  <span className="text-xs text-blue-200/25 italic">Not present in this version</span>
                ) : changed ? (
                  <DiffPane tokens={tokens} side="right" />
                ) : (
                  <p className="text-sm text-blue-100/65 leading-relaxed whitespace-pre-wrap break-words">{right}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Version selector pill ────────────────────────────────────────────────────
function VersionSelector({ label, value, onChange, versions, isLoading, exclude }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-blue-200/40 mb-2 uppercase tracking-widest font-medium">{label}</p>
      {isLoading ? (
        <div className="h-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
      ) : (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value || null)}
          className="w-full rounded-lg border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <option value="" style={{ background: '#0d1b4b' }}>Select a version…</option>
          {versions.filter(v => v.id !== exclude).map((v, i) => (
            <option key={v.id} value={v.id} style={{ background: '#0d1b4b' }}>
              {i === 0 && !exclude ? '★ ' : ''}
              {v.label || (v.source === 'ai_generated' ? 'AI Generated' : 'Manual Save')}
              {v.created_date ? ` — ${format(new Date(v.created_date), 'dd MMM yy, h:mm a')}` : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VersionCompare({ documentId, documentType, onClose }) {
  const [leftId, setLeftId] = useState(null);
  const [rightId, setRightId] = useState(null);
  const [showUnchanged, setShowUnchanged] = useState(true);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', documentId],
    queryFn: () => base44.entities.DocumentVersion.filter({ document_id: documentId }, '-created_date', 50),
  });

  const leftVersion = versions.find(v => v.id === leftId);
  const rightVersion = versions.find(v => v.id === rightId);
  const sections = SECTION_SCHEMAS[documentType] || [];
  const canCompare = !!(leftVersion && rightVersion && leftId !== rightId);

  // Summary stats
  const stats = useMemo(() => {
    if (!canCompare) return null;
    let changed = 0, added = 0, removed = 0, unchanged = 0;
    sections.forEach(key => {
      const l = leftVersion?.content?.[key] || '';
      const r = rightVersion?.content?.[key] || '';
      if (l !== r) {
        changed++;
        const tokens = diffWords(l, r);
        const c = countChanges(tokens);
        added += c.added; removed += c.removed;
      } else unchanged++;
    });
    return { changed, unchanged, added, removed };
  }, [canCompare, leftId, rightId]);

  const visibleSections = useMemo(() => {
    if (!canCompare) return sections;
    return sections.filter(key => {
      if (showUnchanged) return true;
      const l = leftVersion?.content?.[key] || '';
      const r = rightVersion?.content?.[key] || '';
      return l !== r;
    });
  }, [sections, canCompare, showUnchanged, leftId, rightId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'rgba(6,10,28,0.99)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0"
        style={{ background: 'rgba(8,13,36,0.9)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center border border-blue-400/20">
            <ArrowLeftRight className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Version Comparison</h2>
            <p className="text-xs text-blue-200/40">Select two versions to compare changes side by side</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}
          className="text-white/40 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Version selector bar */}
      <div
        className="flex items-end gap-4 px-6 py-4 border-b border-white/10 flex-shrink-0"
        style={{ background: 'rgba(8,13,36,0.7)' }}
      >
        <VersionSelector
          label="Base version (older)"
          value={leftId}
          onChange={setLeftId}
          versions={versions}
          isLoading={isLoading}
          exclude={rightId}
        />
        <div className="flex-shrink-0 pb-2">
          <ArrowLeftRight className="w-5 h-5 text-white/20" />
        </div>
        <VersionSelector
          label="Compare to (newer)"
          value={rightId}
          onChange={setRightId}
          versions={versions}
          isLoading={isLoading}
          exclude={leftId}
        />
      </div>

      {/* Stats bar + column labels */}
      {canCompare && (
        <div className="flex-shrink-0 border-b border-white/10" style={{ background: 'rgba(8,13,36,0.6)' }}>
          {/* Stats */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-white/8">
            <div className="flex items-center gap-3 text-xs flex-1">
              <span className="flex items-center gap-1.5 text-blue-200/50">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">{stats.changed}</span> sections changed
              </span>
              <span className="text-white/15">|</span>
              <span className="flex items-center gap-1 text-emerald-300/70">
                <PlusCircle className="w-3.5 h-3.5" />
                {stats.added} words added
              </span>
              <span className="flex items-center gap-1 text-red-300/70">
                <MinusCircle className="w-3.5 h-3.5" />
                {stats.removed} words removed
              </span>
              <span className="flex items-center gap-1 text-blue-200/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stats.unchanged} unchanged
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnchanged(v => !v)}
              className="text-xs text-white/40 hover:text-white hover:bg-white/10 border border-white/10 h-7 px-3"
            >
              {showUnchanged ? 'Hide unchanged' : 'Show all'}
            </Button>
          </div>

          {/* Column labels */}
          <div className="grid grid-cols-2 divide-x divide-white/8">
            {[leftVersion, rightVersion].map((v, i) => (
              <div key={i} className="px-5 py-2.5 flex items-center gap-2">
                {v.source === 'ai_generated'
                  ? <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  : <Pencil className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                <span className="text-sm font-medium text-white truncate">
                  {v.label || (v.source === 'ai_generated' ? 'AI Generated' : 'Manual Save')}
                </span>
                <span className="text-xs text-blue-200/40 flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {v.created_date ? format(new Date(v.created_date), 'dd MMM yy, h:mm a') : '—'}
                </span>
                {i === 1 && (
                  <div className="ml-auto flex items-center gap-2 text-xs flex-shrink-0">
                    <mark className="bg-emerald-500/25 text-emerald-200 rounded px-1.5 py-0.5 not-italic">added</mark>
                    <del className="bg-red-500/20 text-red-300/70 rounded px-1.5 py-0.5 line-through decoration-red-400/60">removed</del>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diff body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        {!canCompare ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-24">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-400/15 mb-5">
              <ArrowLeftRight className="w-7 h-7 text-blue-300/40" />
            </div>
            <p className="text-white/50 font-medium mb-1">No versions selected</p>
            <p className="text-blue-200/30 text-sm max-w-xs">
              {isLoading
                ? 'Loading versions…'
                : versions.length < 2
                ? 'Save at least two versions to compare.'
                : 'Choose a base version and a version to compare from the dropdowns above.'}
            </p>
          </div>
        ) : visibleSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400/40 mx-auto mb-4" />
            <p className="text-white/40 font-medium">No changes detected</p>
            <p className="text-blue-200/30 text-sm mt-1">These two versions are identical.</p>
          </div>
        ) : (
          visibleSections.map((sectionKey, i) => {
            const l = leftVersion?.content?.[sectionKey] || '';
            const r = rightVersion?.content?.[sectionKey] || '';
            return (
              <SectionDiff
                key={sectionKey}
                sectionKey={sectionKey}
                leftContent={leftVersion?.content}
                rightContent={rightVersion?.content}
                defaultExpanded={l !== r}
              />
            );
          })
        )}
      </div>
    </motion.div>
  );
}