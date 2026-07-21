import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * AddressSearchField — Australian address autocomplete using OpenStreetMap (Nominatim)
 * via the `addressLookup` backend function.
 *
 * Props:
 *   value        — current address string
 *   onChange     — (address: string) => void
 *   placeholder  — input placeholder
 *   style        — inline style applied to the input (to match surrounding form fields)
 */
export default function AddressSearchField({ value, onChange, placeholder, style }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    setVerified(false);
    onChange(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await base44.functions.invoke('addressLookup', { query: text });
        const data = result?.data ?? result;
        setResults(data?.results || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (addr) => {
    setQuery(addr.fullAddress);
    onChange(addr.fullAddress);
    setVerified(true);
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search style={{
          position: 'absolute', left: 13, top: '50%',
          transform: 'translateY(-50%)', width: 15, height: 15,
          color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
          placeholder={placeholder || 'Start typing your business address...'}
          style={{ ...style, paddingLeft: 36 }}
          autoComplete="off"
        />
        {loading && (
          <Loader2 style={{
            position: 'absolute', right: 13, top: '50%',
            transform: 'translateY(-50%)', width: 15, height: 15,
            color: 'var(--text-muted)', animation: 'spin 0.8s linear infinite',
          }} />
        )}
        {!loading && verified && (
          <CheckCircle2 style={{
            position: 'absolute', right: 13, top: '50%',
            transform: 'translateY(-50%)', width: 15, height: 15,
            color: 'var(--success)',
          }} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          marginTop: 4, borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--popover)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxHeight: 280, overflowY: 'auto',
        }}>
          {results.map((addr, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={e => { e.preventDefault(); handleSelect(addr); }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 9, width: '100%',
                textAlign: 'left', padding: '10px 13px', cursor: 'pointer',
                background: 'none', border: 'none',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                {addr.fullAddress}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}