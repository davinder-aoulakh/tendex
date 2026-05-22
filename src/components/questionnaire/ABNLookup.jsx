import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ABNLookup({ value = '', onChange, onConfirmed, confirmed, confirmedName }) {
  const [status, setStatus]           = useState('idle'); // idle | loading | valid | invalid | error
  const [entityName, setEntityName]   = useState(confirmedName || '');
  const [isConfirmed, setIsConfirmed] = useState(confirmed || false);
  const [inputValue, setInputValue]   = useState(value || '');
  const debounceRef                   = useRef(null);

  useEffect(() => {
    if (!value) {
      setInputValue('');
      setStatus('idle');
      setEntityName('');
      setIsConfirmed(false);
    }
  }, [value]);

  const cleanAbn = (raw) => raw.replace(/[^\d]/g, '');

  const lookupABN = async (abn) => {
    setStatus('loading');
    setEntityName('');
    setIsConfirmed(false);

    const result = await base44.functions.invoke('abnLookup', { abn });
    const data = result.data;

    if (!data.valid) {
      setStatus('invalid');
      return;
    }

    setEntityName(data.entityName || '');
    setStatus('valid');
  };

  useEffect(() => {
    const clean = cleanAbn(inputValue);
    if (isConfirmed && clean === cleanAbn(value)) return;

    if (clean.length < 9) {
      setStatus('idle');
      setEntityName('');
      if (clean.length === 0) setIsConfirmed(false);
      return;
    }

    if (clean.length !== 9 && clean.length !== 11) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lookupABN(clean).catch(() => setStatus('error'));
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleConfirmYes = () => {
    const clean = cleanAbn(inputValue);
    setIsConfirmed(true);
    onChange?.(clean);
    onConfirmed?.(clean, entityName);
  };

  const handleClear = () => {
    setInputValue('');
    setStatus('idle');
    setEntityName('');
    setIsConfirmed(false);
    onChange?.('');
  };

  const formatDisplay = (raw) => {
    const d = cleanAbn(raw);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0,2)} ${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5)}`;
    if (d.length === 9) return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6,9)}`;
    return `${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5,8)} ${d.slice(8,11)}`;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          maxLength={14}
          value={isConfirmed ? formatDisplay(value || inputValue) : formatDisplay(inputValue)}
          onChange={e => {
            const clean = cleanAbn(e.target.value);
            if (clean.length <= 11) setInputValue(clean);
          }}
          disabled={isConfirmed}
          placeholder="e.g. 51 824 753 556"
          className={`w-full rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 border transition-all focus:outline-none focus:border-blue-400/50 font-mono pr-10
            ${isConfirmed
              ? 'border-green-400/40 opacity-70 cursor-not-allowed'
              : status === 'invalid' || status === 'error'
                ? 'border-red-400/40'
                : 'border-white/10'
            }`}
          style={{
            background: isConfirmed
              ? 'rgba(34,197,94,0.08)'
              : status === 'invalid' || status === 'error'
                ? 'rgba(239,68,68,0.08)'
                : 'rgba(255,255,255,0.05)',
          }}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {(inputValue || value) && (status === 'idle' || status === 'invalid' || status === 'error' || isConfirmed) && (
            <button type="button" onClick={handleClear}
              className="text-white/30 hover:text-white/70 transition-colors p-0.5" tabIndex={-1} title="Clear">
              <X className="w-4 h-4" />
            </button>
          )}
          {status === 'loading' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          {status === 'valid' && !isConfirmed && <CheckCircle2 className="w-4 h-4 text-green-400" />}
        </div>
      </div>

      <p className="text-xs text-white/30 px-1">Enter your 11-digit ABN or 9-digit ACN</p>

      {isConfirmed && (
        <div className="flex items-center justify-between gap-2 text-sm text-green-400 px-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Verified: <strong>{entityName}</strong></span>
          </div>
          <button type="button" onClick={handleClear}
            className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2">
            Change
          </button>
        </div>
      )}

      {status === 'valid' && !isConfirmed && (
        <div className="rounded-xl border border-green-400/30 px-4 py-3 text-sm" style={{ background: 'rgba(34,197,94,0.08)' }}>
          <p className="text-green-300 mb-2.5">
            Found: <strong>{entityName}</strong> — is this your organisation?
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleConfirmYes}
              className="bg-green-500 hover:bg-green-400 text-white border-0 h-8 px-4 text-xs">
              Yes, that's us
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClear}
              className="text-white/50 hover:text-white hover:bg-white/10 border border-white/10 h-8 px-4 text-xs">
              No, re-enter
            </Button>
          </div>
        </div>
      )}

      {(status === 'invalid' || status === 'error') && (
        <div className="flex items-center gap-2 text-sm text-red-400 px-1">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {status === 'error'
              ? 'Could not connect to the ABN register. Please try again.'
              : 'ABN/ACN not found or inactive. Please check and try again.'}
          </span>
        </div>
      )}
    </div>
  );
}