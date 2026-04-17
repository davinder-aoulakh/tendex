import { useState, useRef, useCallback } from 'react';
import { Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { enhanceField } from '@/lib/aiDocumentGenerator';

/**
 * A textarea that auto-enhances content on blur using AI.
 * Shows "Enhancing..." → "AI Enhanced ✓" badge.
 * Keeps original text for revert.
 */
export default function EnhancedTextarea({ field, value, onChange, error, docType }) {
  const [status, setStatus] = useState('idle'); // idle | enhancing | enhanced | reverted
  const [original, setOriginal] = useState(null);
  const debounceRef = useRef(null);

  const handleBlur = useCallback(async () => {
    if (!value || value.trim().length < 30) return;
    if (status === 'enhanced' && value === original) return; // already enhanced

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setOriginal(value);
      setStatus('enhancing');
      const enhanced = await enhanceField(field.label, value, docType || 'procurement');
      if (enhanced && enhanced !== value) {
        onChange(enhanced);
        setStatus('enhanced');
      } else {
        setStatus('idle');
      }
    }, 300);
  }, [value, status, original, field.label, docType, onChange]);

  const handleRevert = () => {
    if (original) {
      onChange(original);
      setStatus('reverted');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="relative">
      <Textarea
        id={field.key}
        value={value || ''}
        onChange={e => { onChange(e.target.value); setStatus('idle'); }}
        onBlur={handleBlur}
        placeholder={field.placeholder}
        className={cn(
          'min-h-[110px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/50 pr-28',
          error && 'border-red-400/60',
          status === 'enhanced' && 'border-l-4 border-l-emerald-400'
        )}
      />
      {/* Badge */}
      <div className="absolute top-2 right-2">
        {status === 'enhancing' && (
          <span className="flex items-center gap-1 text-xs bg-white/10 text-blue-300/70 px-2 py-0.5 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" /> Enhancing...
          </span>
        )}
        {status === 'enhanced' && (
          <div className="flex items-center gap-1.5">
            <button onClick={handleRevert} className="text-xs text-blue-300/50 hover:text-blue-300 flex items-center gap-0.5 transition-colors">
              <RotateCcw className="w-3 h-3" /> Revert
            </button>
            <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> AI Enhanced
            </span>
          </div>
        )}
        {status === 'reverted' && (
          <span className="text-xs text-white/30 italic px-2">Reverted</span>
        )}
      </div>
    </div>
  );
}