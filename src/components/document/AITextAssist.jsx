import { useState } from 'react';
import { Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const ACTIONS = [
  { label: 'Improve', prompt: 'Rewrite this text to be more professional and polished, keeping the same meaning.' },
  { label: 'Make concise', prompt: 'Rewrite this text to be more concise and to the point, removing any redundancy.' },
  { label: 'Make formal', prompt: 'Rewrite this text in a more formal, professional tone suitable for a procurement document.' },
  { label: 'Expand', prompt: 'Expand this text with more detail and professional context, suitable for a procurement document.' },
  { label: 'Fix grammar', prompt: 'Fix any grammar, spelling, and punctuation issues in this text without changing the meaning.' },
];

export default function AITextAssist({ text, onApply }) {
  const [loading, setLoading] = useState(null);
  const [lastOriginal, setLastOriginal] = useState(null);
  const [canUndo, setCanUndo] = useState(false);

  const handleAction = async (action) => {
    if (!text.trim()) return;
    setLoading(action.label);
    setLastOriginal(text);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${action.prompt}\n\nText:\n${text}\n\nReturn only the rewritten text, no explanation or quotes.`,
    });
    onApply(result);
    setCanUndo(true);
    setLoading(null);
  };

  const handleUndo = () => {
    if (lastOriginal) {
      onApply(lastOriginal);
      setCanUndo(false);
      setLastOriginal(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-1 text-xs text-blue-300/60 mr-1">
        <Sparkles className="w-3 h-3" />AI:
      </div>
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => handleAction(action)}
          disabled={!!loading}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-blue-400/20 text-blue-300/70 hover:text-blue-200 hover:border-blue-400/40 hover:bg-blue-500/10 transition-all disabled:opacity-40"
        >
          {loading === action.label && <Loader2 className="w-3 h-3 animate-spin" />}
          {action.label}
        </button>
      ))}
      {canUndo && (
        <button
          onClick={handleUndo}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-amber-400/20 text-amber-300/70 hover:text-amber-200 hover:border-amber-400/40 hover:bg-amber-500/10 transition-all ml-1"
        >
          <RotateCcw className="w-3 h-3" />Undo
        </button>
      )}
    </div>
  );
}