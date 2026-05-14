import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

/**
 * AI Assist 2 — Item Specification Suggestion
 * Shown below product_description on S3 goods page.
 * Debounces 300ms after the user stops typing, then suggests a 1–2 sentence
 * specification. User can Accept (writes to technical_specs) or Edit inline.
 */
export default function AIGoodsSpecSuggestion({ productDescription, category, onAccept }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const debounceRef = useRef(null);
  const lastFetchedRef = useRef('');

  useEffect(() => {
    // Reset accepted state when description changes substantially
    if (productDescription !== lastFetchedRef.current) {
      setAccepted(false);
    }

    if (!productDescription || productDescription.trim().length < 10) {
      setSuggestion('');
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (productDescription.trim() === lastFetchedRef.current) return;
      lastFetchedRef.current = productDescription.trim();
      setLoading(true);
      setSuggestion('');
      setAccepted(false);
      setEditMode(false);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an Australian procurement officer. Write a concise 1–2 sentence technical specification for the following item, suitable for inclusion in a Scope of Work or RFQ document.

Item description: ${productDescription}
${category ? `Category context: ${category}` : ''}

Return only the specification text. No bullet points. No heading. Formal, precise procurement language.`,
      });

      const text = typeof result === 'string' ? result : result?.text || result?.content || '';
      setSuggestion(text.trim());
      setEditText(text.trim());
      setLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [productDescription, category]);

  const handleAccept = () => {
    onAccept(editMode ? editText : suggestion);
    setAccepted(true);
    setEditMode(false);
  };

  if (!productDescription || productDescription.trim().length < 10) return null;
  if (!loading && !suggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="rounded-xl border border-green-400/25 p-4 space-y-3"
        style={{ background: 'rgba(34,197,94,0.06)' }}
      >
        <div className="flex items-center gap-2">
          {loading
            ? <Loader2 className="w-3.5 h-3.5 text-green-400 animate-spin flex-shrink-0" />
            : <Sparkles className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
          <span className="text-xs font-semibold text-green-300">
            {loading ? 'AI is drafting a specification...' : 'AI specification suggestion'}
          </span>
          {accepted && !editMode && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
              <Check className="w-3 h-3" /> Accepted
            </span>
          )}
        </div>

        {!loading && suggestion && (
          <>
            {editMode ? (
              <textarea
                autoFocus
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full text-xs text-white/80 bg-white/5 border border-white/15 rounded-lg p-3 resize-none min-h-[60px] outline-none focus:border-green-400/40 leading-relaxed"
              />
            ) : (
              <p className="text-xs text-white/70 leading-relaxed">{suggestion}</p>
            )}

            {!accepted ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-500 text-white border-0"
                >
                  <Check className="w-3 h-3" /> Accept
                </Button>
                {!editMode ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditText(suggestion); setEditMode(true); }}
                    className="h-7 text-xs gap-1.5 text-white/40 hover:text-white hover:bg-white/10"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAccept}
                    className="h-7 text-xs gap-1.5 text-green-300/60 hover:text-green-200 hover:bg-white/10"
                  >
                    <Check className="w-3 h-3" /> Accept edit
                  </Button>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setAccepted(false); setEditMode(true); }}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Change
              </button>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}