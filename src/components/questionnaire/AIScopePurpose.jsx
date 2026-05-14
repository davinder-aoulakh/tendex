import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

/**
 * AI Assist 1 — Scope Purpose Statement
 * Shown after S2 (basics). Generates a 2-3 sentence professional scope purpose
 * from Q2.2 (purchase_type / project context) and Q1.1 (procurement_type).
 * User must confirm or edit before continuing.
 */
export default function AIScopePurpose({ answers, value, onChange, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [generated, setGenerated] = useState(!!value);
  const [editing, setEditing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!generated && !loading) {
      generate();
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    setGenerated(false);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an Australian procurement officer. Write a professional 2–3 sentence scope purpose statement for a procurement document.

Organisation: ${answers.organisation_name || 'the organisation'}
Project: ${answers.project_name || 'this project'}
Procurement Type: ${answers.procurement_type || 'goods and/or services'}
Purchase Type: ${answers.purchase_type === 'once_off' ? 'once-off engagement' : 'ongoing / panel arrangement'}
Additional context: ${answers.combined_scope_description || answers.product_description || answers.summary_of_services || ''}

Write in formal Australian procurement language. Do not use bullet points. Return only the statement text, no heading or labels.`,
    });
    const text = typeof result === 'string' ? result : result?.text || result?.content || JSON.stringify(result);
    setDraft(text.trim());
    onChange(text.trim());
    setGenerated(true);
    setLoading(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setEditing(false);
    onChange(draft);
    onConfirm(draft);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-blue-400/30 p-5 space-y-4"
      style={{ background: 'rgba(59,130,246,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-blue-300">AI Scope Purpose Statement</span>
        {loading && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin ml-auto" />}
        {confirmed && !editing && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
      </div>

      {loading ? (
        <p className="text-sm text-blue-200/50 animate-pulse">AI is drafting your scope purpose...</p>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-xs text-blue-200/50 uppercase tracking-widest font-semibold">
              Your scope purpose statement — review and edit
            </label>
            {editing || !confirmed ? (
              <Textarea
                value={draft}
                onChange={e => { setDraft(e.target.value); onChange(e.target.value); }}
                className="min-h-[90px] text-sm bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400/50 resize-none"
                placeholder="Your scope purpose statement..."
              />
            ) : (
              <p className="text-sm text-white/80 leading-relaxed bg-white/5 rounded-xl p-4 border border-white/10">
                {draft}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {confirmed && !editing ? (
              <>
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditing(true); setConfirmed(false); }}
                  className="h-7 text-xs gap-1.5 text-white/50 hover:text-white hover:bg-white/10"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  disabled={!draft.trim()}
                  className="h-8 text-xs bg-blue-500 hover:bg-blue-400 text-white border-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirm statement
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={generate}
                  disabled={loading}
                  className="h-8 text-xs gap-1.5 text-blue-300/60 hover:text-blue-200 hover:bg-white/10"
                >
                  <Sparkles className="w-3 h-3" /> Regenerate
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}