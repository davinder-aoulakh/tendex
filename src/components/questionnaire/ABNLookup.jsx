import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2, Building2, MapPin, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { cleanABN, formatABN, validateABNChecksum, describeEntityType } from '@/lib/abnValidation';

/**
 * ABNLookup — production-grade ABN validation component.
 *
 * Flow:
 *   1. User types — strip and format to XX XXX XXX XXX
 *   2. At 11 digits: run checksum locally (ATO algorithm) — instant, no API call
 *   3. Checksum passes: call server-side proxy function (abnLookup) which holds the ABR GUID
 *   4. ABR returns entity details — show for user confirmation
 *   5. User clicks "Yes, that's us" — call onConfirmed with full entity data
 *
 * Props:
 *   value           — current ABN string (digits only)
 *   onChange        — (abn: string) => void
 *   onConfirmed     — (data: AbnResult) => void  called when user confirms
 *   confirmed       — boolean — restore confirmed state on remount
 *   confirmedData   — object — restore full confirmed data on remount
 */
export default function ABNLookup({ value = '', onChange, onConfirmed, confirmed, confirmedData }) {
  const [status, setStatus]           = useState('idle'); // idle | loading | valid | invalid | cancelled | error
  const [entityData, setEntityData]   = useState(confirmedData || null);
  const [isConfirmed, setIsConfirmed] = useState(confirmed || false);
  const [errorMessage, setErrorMessage] = useState('');
  const debounceRef = useRef(null);

  const lookupABN = async (abn) => {
    setStatus('loading');
    setEntityData(null);
    setIsConfirmed(false);
    setErrorMessage('');

    try {
      const result = await base44.functions.invoke('abnLookup', { abn });
      const data = result?.data ?? result;

      if (!data || !data.valid) {
        if (data?.reason === 'cancelled') {
          setStatus('cancelled');
          setErrorMessage(data.message || 'This ABN is no longer active.');
        } else {
          setStatus('invalid');
          setErrorMessage(data?.message || 'This ABN was not found in the ABN Register. Please check and try again.');
        }
        return;
      }

      setEntityData(data);
      setStatus('valid');
    } catch (err) {
      console.error('ABN lookup error:', err);
      setStatus('error');
      setErrorMessage('Could not connect to the ABN Register. Please check your internet connection and try again.');
    }
  };

  // Trigger lookup when we reach exactly 11 clean digits
  useEffect(() => {
    const clean = cleanABN(value);

    // Reset if user clears or reduces below 11
    if (clean.length !== 11) {
      if (status !== 'idle') {
        setStatus('idle');
        setEntityData(null);
        setIsConfirmed(false);
        setErrorMessage('');
      }
      return;
    }

    // If already confirmed with this exact ABN, don't re-lookup
    if (isConfirmed && entityData?.abn === clean) return;

    // Step 1: Run checksum locally — instant, no network
    if (!validateABNChecksum(clean)) {
      setStatus('invalid');
      setErrorMessage('This number is not a valid ABN format. Please check and re-enter.');
      return;
    }

    // Step 2: Checksum passed — hit the ABR via our server proxy
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lookupABN(clean);
    }, 400); // 400ms debounce — avoids lookup on fast paste

    return () => clearTimeout(debounceRef.current);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirmYes = () => {
    setIsConfirmed(true);
    onConfirmed?.({
      ...entityData,
      confirmedAt: new Date().toISOString(),
    });
  };

  const handleConfirmNo = () => {
    setStatus('idle');
    setEntityData(null);
    setIsConfirmed(false);
    setErrorMessage('');
    onChange?.('');
  };

  const inputStyle = () => {
    if (isConfirmed || status === 'valid') return { background: 'var(--success-subtle)', borderColor: 'var(--success-border)', color: 'var(--text-primary)' };
    if (status === 'invalid' || status === 'cancelled' || status === 'error') return { background: 'rgba(200,30,58,0.08)', borderColor: 'rgba(200,30,58,0.25)', color: 'var(--text-primary)' };
    return { background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--text-primary)' };
  };

  return (
    <div className="space-y-3">

      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          value={formatABN(value)}
          onChange={e => {
            const clean = cleanABN(e.target.value);
            if (clean.length <= 11) onChange?.(clean);
          }}
          placeholder="e.g. 51 824 753 556"
          className="w-full rounded-xl px-4 py-3 text-sm border transition-all focus:outline-none font-mono"
          style={inputStyle()}
          aria-label="Australian Business Number"
          aria-describedby="abn-status"
        />

        {/* Status icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
          {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />}
          {(status === 'valid' || isConfirmed) && <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />}
          {(status === 'invalid' || status === 'cancelled' || status === 'error') && <XCircle className="w-4 h-4" style={{ color: 'var(--destructive)' }} />}
        </div>
      </div>

      {/* Loading state */}
      {status === 'loading' && (
        <p id="abn-status" className="text-sm px-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Checking ABN Register…
        </p>
      )}

      {/* Valid — awaiting user confirmation */}
      {status === 'valid' && !isConfirmed && entityData && (
        <div
          id="abn-status"
          className="px-4 py-4 space-y-3"
          style={{ background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 12 }}
          role="region"
          aria-label="ABN verification result"
        >
          {/* Entity name */}
          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--success)', fontWeight: 600 }}>{entityData.entityName}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{entityData.entityTypeName || describeEntityType(entityData.entityTypeCode)}</p>
            </div>
          </div>

          {/* State and GST */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pl-6">
            {entityData.addressState && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <MapPin className="w-3 h-3" />
                <span>{entityData.addressState}{entityData.addressPostcode ? ` ${entityData.addressPostcode}` : ''}</span>
              </div>
            )}
            {entityData.gstRegistered && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <Receipt className="w-3 h-3" />
                <span>GST registered</span>
              </div>
            )}
            {entityData.abnActiveSince && (
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Active since {entityData.abnActiveSince}
              </div>
            )}
          </div>

          {/* Confirmation question */}
          <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Is this your organisation?</p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmYes}
                style={{ backgroundColor: 'var(--success)', color: 'var(--success-fg)', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Yes, that's us
              </button>
              <button
                onClick={handleConfirmNo}
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent', borderRadius: 8, padding: '8px 18px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                No, re-enter ABN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed state — compact summary */}
      {isConfirmed && entityData && (
        <div
          id="abn-status"
          className="flex items-center justify-between gap-2 text-sm px-1"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--success)' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>
              Verified: <strong style={{ color: 'var(--text-primary)' }}>{entityData.entityName}</strong>
              {entityData.addressState && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {entityData.addressState}</span>}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirmNo}
            className="text-xs underline underline-offset-2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Change
          </button>
        </div>
      )}

      {/* Invalid / cancelled / error */}
      {(status === 'invalid' || status === 'cancelled' || status === 'error') && (
        <div
          id="abn-status"
          className="flex items-start gap-2 text-sm px-1"
          style={{ color: 'var(--destructive)' }}
          role="alert"
        >
          <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

    </div>
  );
}