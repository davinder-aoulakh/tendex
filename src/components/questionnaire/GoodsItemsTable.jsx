import { useRef, useState } from 'react';
import { Plus, Trash2, Loader2, Sparkles, Check, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const UNITS = ['each', 'kg', 'litres', 'metres', 'sets', 'boxes', 'pallets', 'other'];

const inputStyle = {
  background: 'var(--input)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const handleInputFocus = (e) => { e.target.style.borderColor = 'var(--primary)'; };
const handleInputBlur  = (e) => { e.target.style.borderColor = 'var(--border)'; };

export default function GoodsItemsTable({ value = [], onChange }) {
  const items = Array.isArray(value) ? value : [];

  // Always-current ref — solves the stale closure problem in async callbacks.
  // Every async call reads itemsRef.current instead of capturing items at call time.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Per-row suggestion state kept locally so it never touches the parent's answers
  const [suggestions,  setSuggestions]  = useState({});
  const [loadingRows,  setLoadingRows]  = useState({});
  const [editingRows,  setEditingRows]  = useState({});
  const [acceptedRows, setAcceptedRows] = useState({});

  // Debounce refs per row so rapid typing doesn't hammer the LLM
  const debounceRefs = useRef({});

  // ── CORE UPDATE HELPERS ────────────────────────────────────────────────────

  // Update one field on one row — reads itemsRef.current so it is always fresh
  const updateItem = (idx, field, val) => {
    const current = [...itemsRef.current];
    current[idx] = { ...current[idx], [field]: val };
    onChange(current);
  };

  // Update multiple fields at once — avoids stale-overwrite when batching changes
  const updateItemFields = (idx, fields) => {
    const current = [...itemsRef.current];
    current[idx] = { ...current[idx], ...fields };
    onChange(current);
  };

  // ── ADD / REMOVE ROWS ─────────────────────────────────────────────────────

  const addItem = () => {
    const current = [...itemsRef.current];
    onChange([...current, { name: '', quantity: '', unit: 'each', spec: '', brand: '' }]);
  };

  const removeItem = (idx) => {
    onChange(itemsRef.current.filter((_, i) => i !== idx));
    setSuggestions(prev => { const n = { ...prev }; delete n[idx]; return n; });
    setLoadingRows(prev => { const n = { ...prev }; delete n[idx]; return n; });
    setEditingRows(prev => { const n = { ...prev }; delete n[idx]; return n; });
    setAcceptedRows(prev => { const n = { ...prev }; delete n[idx]; return n; });
    clearTimeout(debounceRefs.current[idx]);
  };

  // ── AI SUGGESTION (debounced, triggered only from item name field) ─────────

  const triggerSuggestion = (idx, itemName) => {
    clearTimeout(debounceRefs.current[idx]);
    setSuggestions(prev => ({ ...prev, [idx]: '' }));
    setAcceptedRows(prev => ({ ...prev, [idx]: false }));

    if (!itemName || itemName.trim().length < 4) {
      setLoadingRows(prev => ({ ...prev, [idx]: false }));
      return;
    }

    setLoadingRows(prev => ({ ...prev, [idx]: true }));

    // 1.5s debounce — waits until user stops typing before calling LLM
    debounceRefs.current[idx] = setTimeout(async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt:
            'You are an Australian procurement officer. Write a concise 1-2 sentence ' +
            'technical specification for the following item, suitable for a Scope of Work ' +
            'or RFQ document.\n\nItem: ' + itemName + '\n\n' +
            'Return only the specification text. No bullet points. No heading. ' +
            'Formal, precise procurement language.',
          model: 'gpt_5_mini',
        });
        const text = typeof result === 'string'
          ? result.trim()
          : (result?.text || result?.content || '').trim();

        setSuggestions(prev => ({ ...prev, [idx]: text }));
      } catch (err) {
        console.error('AI suggestion failed:', err);
        setSuggestions(prev => ({ ...prev, [idx]: '' }));
      } finally {
        setLoadingRows(prev => ({ ...prev, [idx]: false }));
      }
    }, 1500);
  };

  // ── ACCEPT SUGGESTION ──────────────────────────────────────────────────────

  const acceptSuggestion = (idx) => {
    const text = editingRows[idx] ?? suggestions[idx] ?? '';
    if (!text) return;
    // Single updateItemFields call — avoids the stale double-update bug
    updateItemFields(idx, { spec: text });
    setAcceptedRows(prev => ({ ...prev, [idx]: true }));
    setEditingRows(prev => { const n = { ...prev }; delete n[idx]; return n; });
  };

  const dismissSuggestion = (idx) => {
    setSuggestions(prev => ({ ...prev, [idx]: '' }));
    setEditingRows(prev => { const n = { ...prev }; delete n[idx]; return n; });
    setAcceptedRows(prev => ({ ...prev, [idx]: false }));
  };

  const editSuggestion = (idx) => {
    setEditingRows(prev => ({ ...prev, [idx]: suggestions[idx] }));
    setAcceptedRows(prev => ({ ...prev, [idx]: false }));
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--muted)' }}>
              {['Item Name *', 'Qty *', 'Unit *', 'Size / Spec', 'Brand / Model', 'Action'].map((label, i) => (
                <th
                  key={label}
                  style={{
                    textAlign: i === 5 ? 'center' : 'left',
                    color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    padding: '10px 12px', borderBottom: '1px solid var(--border)',
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No items yet. Click "+ Add Another Item" below to start.
                </td>
              </tr>
            )}
            {items.map((item, idx) => (
              <tr
                key={idx}
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Item Name — triggers AI suggestion on debounce */}
                <td style={{ padding: '10px 12px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Laptop"
                    value={item.name || ''}
                    onChange={e => {
                      updateItem(idx, 'name', e.target.value);
                      triggerSuggestion(idx, e.target.value);
                    }}
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </td>

                {/* Quantity */}
                <td style={{ padding: '10px 12px' }}>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={item.quantity || ''}
                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                    style={{ ...inputStyle, maxWidth: 80 }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </td>

                {/* Unit */}
                <td style={{ padding: '10px 12px' }}>
                  <select
                    value={item.unit || 'each'}
                    onChange={e => updateItem(idx, 'unit', e.target.value)}
                    style={{ ...inputStyle, maxWidth: 90 }}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </td>

                {/* Size / Spec — user-editable; AI suggestion writes here on accept */}
                <td style={{ padding: '10px 12px' }}>
                  <input
                    type="text"
                    placeholder="e.g. 14 inch, 16GB RAM"
                    value={item.spec || ''}
                    onChange={e => updateItem(idx, 'spec', e.target.value)}
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </td>

                {/* Brand / Model */}
                <td style={{ padding: '10px 12px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Lenovo"
                    value={item.brand || ''}
                    onChange={e => updateItem(idx, 'brand', e.target.value)}
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </td>

                {/* Delete */}
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <button
                    onClick={() => removeItem(idx)}
                    style={{ color: 'var(--destructive)', background: 'transparent', border: 'none', opacity: 0.7, cursor: 'pointer', padding: 4 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                    title="Remove item"
                  >
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-row AI suggestion panels — shown below the table, one at a time */}
      {items.map((item, idx) => {
        const isLoading   = !!loadingRows[idx];
        const suggestion  = suggestions[idx] || '';
        const isEditing   = idx in editingRows;
        const isAccepted  = !!acceptedRows[idx];
        const editText    = editingRows[idx] ?? suggestion;

        if (!item.name || item.name.trim().length < 4) return null;
        if (!isLoading && !suggestion) return null;

        return (
          <div
            key={'sugg-' + idx}
            style={{
              border: '1px solid var(--action-border)',
              background: 'var(--action-subtle)',
              borderRadius: 12, padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {isLoading
                ? <Loader2 style={{ width: 13, height: 13, color: 'var(--action)', animation: 'spin 0.8s linear infinite' }} />
                : <Sparkles style={{ width: 13, height: 13, color: 'var(--action)', flexShrink: 0 }} />
              }
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--action)' }}>
                {isLoading
                  ? 'AI is drafting a specification for "' + item.name + '"...'
                  : 'AI specification suggestion for "' + item.name + '"'}
              </span>
              {isAccepted && (
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                  <Check style={{ width: 11, height: 11 }} /> Applied to Size / Spec
                </span>
              )}
            </div>

            {!isLoading && suggestion && (
              <>
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={editText}
                    onChange={e => setEditingRows(prev => ({ ...prev, [idx]: e.target.value }))}
                    style={{
                      width: '100%', fontSize: '0.8rem', borderRadius: 8, padding: '8px 10px',
                      background: 'var(--input)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
                      minHeight: 60, fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, fontStyle: 'italic', marginBottom: 10 }}>
                    {suggestion}
                  </p>
                )}

                {!isAccepted && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <button
                      onClick={() => acceptSuggestion(idx)}
                      style={{
                        fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 7,
                        background: 'var(--action)', color: '#fff', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      <Check style={{ width: 12, height: 12 }} />
                      {isEditing ? 'Accept edit' : 'Accept suggestion'}
                    </button>
                    {!isEditing && (
                      <button
                        onClick={() => editSuggestion(idx)}
                        style={{
                          fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 7,
                          background: 'transparent', color: 'var(--text-secondary)',
                          border: '1px solid var(--border)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        <Pencil style={{ width: 11, height: 11 }} /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => dismissSuggestion(idx)}
                      style={{
                        fontSize: 12, padding: '6px 10px', borderRadius: 7,
                        background: 'transparent', color: 'var(--text-muted)',
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {isAccepted && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => editSuggestion(idx)}
                      style={{
                        fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 7,
                        background: 'transparent', color: 'var(--action)',
                        border: '1px solid var(--action-border)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      <Pencil style={{ width: 11, height: 11 }} /> Amend accepted text
                    </button>
                    <button
                      onClick={() => dismissSuggestion(idx)}
                      style={{
                        fontSize: 12, padding: '5px 10px', borderRadius: 7,
                        background: 'transparent', color: 'var(--text-muted)',
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Add row button */}
      <button
        onClick={addItem}
        style={{
          border: '1px solid var(--border)', color: 'var(--primary)', background: 'transparent',
          borderRadius: 8, padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          alignSelf: 'flex-start', fontFamily: 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(200,30,58,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <Plus style={{ width: 15, height: 15 }} /> Add Another Item
      </button>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
        All items will be procured together from a single supplier.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}