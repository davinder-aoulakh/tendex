import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ABN validation component using the public ABN Register JSON API.
 * Calls: https://abn.business.gov.au/json/AbnDetails.aspx?abn={ABN}&callback=callback
 *
 * Props:
 *   value        — current ABN string
 *   onChange     — (abn: string) => void
 *   onConfirmed  — (abn: string, entityName: string) => void  (called when user clicks Yes)
 *   confirmed    — boolean — whether already confirmed (to restore state on re-render)
 *   confirmedName — string — already-confirmed entity name
 */
export default function ABNLookup({ value = '', onChange, onConfirmed, confirmed, confirmedName }) {
  const [status, setStatus]           = useState('idle'); // idle | loading | valid | invalid | error
  const [entityName, setEntityName]   = useState(confirmedName || '');
  const [isConfirmed, setIsConfirmed] = useState(confirmed || false);
  const debounceRef                   = useRef(null);

  // Strip non-digits and spaces
  const cleanAbn = (raw) => raw.replace(/[^\d]/g, '');

  const lookupABN = async (abn) => {
    setStatus('loading');
    setEntityName('');
    setIsConfirmed(false);

    const callbackName = `_abn_cb_${Date.now()}`;
    const url = `https://abn.business.gov.au/json/AbnDetails.aspx?abn=${abn}&callback=${callbackName}`;

    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('timeout'));
      }, 8000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[callbackName];
        const s = document.getElementById(callbackName);
        if (s) s.remove();
      }

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      const script = document.createElement('script');
      script.id = callbackName;
      script.src = url;
      script.onerror = () => { cleanup(); reject(new Error('network')); };
      document.head.appendChild(script);
    });

    // ABN Register returns: { Abn, AbnStatus, EntityName, ... }
    if (!result || result.Message || !result.Abn) {
      setStatus('invalid');
      return;
    }
    if (result.AbnStatus !== 'Active') {
      setStatus('invalid');
      setEntityName('');
      return;
    }

    setEntityName(result.EntityName || '');
    setStatus('valid');
  };

  // Auto-lookup once we have 11 digits
  useEffect(() => {
    const clean = cleanAbn(value);
    if (isConfirmed && clean.length === 11) return; // already confirmed, don't re-lookup unless they change it

    if (clean.length !== 11) {
      setStatus('idle');
      setEntityName('');
      setIsConfirmed(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lookupABN(clean).catch(() => setStatus('error'));
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleConfirmYes = () => {
    setIsConfirmed(true);
    onConfirmed?.(cleanAbn(value), entityName);
  };

  const handleConfirmNo = () => {
    setStatus('idle');
    setEntityName('');
    setIsConfirmed(false);
    onChange?.('');
  };

  // Format ABN display: XX XXX XXX XXX
  const formatDisplay = (raw) => {
    const d = cleanAbn(raw);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0,2)} ${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5)}`;
    return `${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5,8)} ${d.slice(8,11)}`;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          maxLength={14}
          value={formatDisplay(value)}
          onChange={e => {
            const clean = cleanAbn(e.target.value);
            if (clean.length <= 11) onChange?.(clean);
          }}
          placeholder="e.g. 51 824 753 556"
          className={`w-full rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 border transition-all focus:outline-none focus:border-blue-400/50 font-mono
            ${isConfirmed
              ? 'bg-green-500/10 border-green-400/40'
              : status === 'invalid' || status === 'error'
                ? 'bg-red-500/10 border-red-400/40'
                : 'bg-white/5 border-white/10'
            }`}
          style={{ background: isConfirmed ? 'rgba(34,197,94,0.08)' : status === 'invalid' || status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)' }}
        />

        {/* Status icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {status === 'loading' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          {(status === 'valid' || isConfirmed) && <CheckCircle2 className="w-4 h-4 text-green-400" />}
          {(status === 'invalid' || status === 'error') && <XCircle className="w-4 h-4 text-red-400" />}
        </div>
      </div>

      {/* Confirmed state */}
      {isConfirmed && (
        <div className="flex items-center gap-2 text-sm text-green-400 px-1">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>ABN confirmed: <strong>{entityName}</strong></span>
        </div>
      )}

      {/* Valid — awaiting confirmation */}
      {status === 'valid' && !isConfirmed && (
        <div className="rounded-xl border border-green-400/30 px-4 py-3 text-sm" style={{ background: 'rgba(34,197,94,0.08)' }}>
          <p className="text-green-300 mb-2.5">
            ABN confirmed: <strong>{entityName}</strong> — is this your organisation?
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleConfirmYes}
              className="bg-green-500 hover:bg-green-400 text-white border-0 h-8 px-4 text-xs">
              Yes, that's us
            </Button>
            <Button size="sm" variant="ghost" onClick={handleConfirmNo}
              className="text-white/50 hover:text-white hover:bg-white/10 border border-white/10 h-8 px-4 text-xs">
              No, re-enter ABN
            </Button>
          </div>
        </div>
      )}

      {/* Invalid */}
      {(status === 'invalid' || status === 'error') && (
        <div className="flex items-center gap-2 text-sm text-red-400 px-1">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {status === 'error'
              ? 'Could not connect to the ABN register. Please try again.'
              : 'This ABN could not be verified. Please check and try again.'}
          </span>
        </div>
      )}
    </div>
  );
}