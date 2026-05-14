import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, Plus, CheckCircle2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

/**
 * AI Assist 3 — Deliverables List
 * Shown after S4c service description field (summary_of_services + service_type).
 * Pre-populates key_deliverables with 3-5 AI-suggested editable chips.
 */
export default function AIDeliverableChips({ answers, value, onChange }) {
  // value is a string (comma/newline separated) — we parse to chips internally
  const parseChips = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v.filter(Boolean);
    return v.split(/\n|;/).map(s => s.trim()).filter(Boolean);
  };

  const [chips, setChips] = useState(parseChips(value));
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(chips.length > 0);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [newChip, setNewChip] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  const emitChange = (updated) => {
    onChange(updated.join('\n'));
  };

  const generate = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an Australian procurement advisor. Based on the service description below, suggest 3–5 concise key deliverables for a Scope of Work document.

Service Type: ${answers.service_type || 'professional services'}
Construction Type: ${answers.construction_type || ''}
Summary of Services: ${answers.summary_of_services || ''}
Provider Responsibilities: ${answers.provider_responsibilities || ''}

Return ONLY a JSON array of short deliverable strings (1 sentence each, no bullet symbols, no numbering). Example: ["Deliverable A", "Deliverable B"]`,
      response_json_schema: {
        type: 'object',
        properties: {
          deliverables: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    const items = result?.deliverables || [];
    setChips(items);
    emitChange(items);
    setGenerated(true);
    setLoading(false);
  };

  const removeChip = (idx) => {
    const updated = chips.filter((_, i) => i !== idx);
    setChips(updated);
    emitChange(updated);
  };

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditText(chips[idx]);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    const updated = chips.map((c, i) => i === editingIdx ? editText.trim() : c);
    setChips(updated);
    emitChange(updated);
    setEditingIdx(null);
    setEditText('');
  };

  const addChip = () => {
    if (!newChip.trim()) return;
    const updated = [...chips, newChip.trim()];
    setChips(updated);
    emitChange(updated);
    setNewChip('');
    setAddingNew(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-purple-400/30 p-5 space-y-4"
      style={{ background: 'rgba(168,85,247,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-purple-300">AI-suggested deliverables</span>
        <span className="text-xs text-purple-300/50">— remove or add to this list</span>
        {loading && <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin ml-auto" />}
      </div>

      {!generated && !loading ? (
        <div className="text-center py-4">
          <p className="text-sm text-white/40 mb-3">Let AI suggest deliverables based on your service description.</p>
          <Button
            size="sm"
            onClick={generate}
            className="gap-2 bg-purple-500 hover:bg-purple-400 text-white border-0"
          >
            <Sparkles className="w-3.5 h-3.5" /> Suggest deliverables
          </Button>
        </div>
      ) : loading ? (
        <p className="text-sm text-purple-200/50 animate-pulse">Generating deliverables...</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {chips.map((chip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group relative"
                >
                  {editingIdx === idx ? (
                    <div className="flex items-center gap-1.5 rounded-full border border-purple-400/50 px-3 py-1.5"
                      style={{ background: 'rgba(168,85,247,0.15)' }}>
                      <input
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingIdx(null); }}
                        className="text-xs text-white bg-transparent outline-none min-w-[120px] max-w-[220px]"
                      />
                      <button onClick={saveEdit}
                        className="text-purple-300 hover:text-white transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-purple-400/40 transition-all cursor-default"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <span className="max-w-[200px] truncate" title={chip}>{chip}</span>
                      <button onClick={() => startEdit(idx)}
                        className="ml-1 text-white/30 hover:text-white/70 transition-colors">
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      <button onClick={() => removeChip(idx)}
                        className="text-white/30 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add new chip */}
            {addingNew ? (
              <div className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <input
                  autoFocus
                  value={newChip}
                  onChange={e => setNewChip(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addChip(); if (e.key === 'Escape') setAddingNew(false); }}
                  placeholder="Add deliverable..."
                  className="text-xs text-white bg-transparent outline-none min-w-[120px] max-w-[180px] placeholder:text-white/30"
                />
                <button onClick={addChip} className="text-green-400 hover:text-green-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setAddingNew(false)} className="text-white/30 hover:text-white/60">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingNew(true)}
                className="flex items-center gap-1 rounded-full border border-dashed border-white/20 px-3 py-1.5 text-xs text-white/30 hover:text-white/60 hover:border-white/40 transition-all"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={generate}
            disabled={loading}
            className="h-7 text-xs gap-1.5 text-purple-300/50 hover:text-purple-200 hover:bg-white/10"
          >
            <Sparkles className="w-3 h-3" /> Regenerate suggestions
          </Button>
        </>
      )}
    </motion.div>
  );
}