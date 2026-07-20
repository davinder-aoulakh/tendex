import { useState, useCallback } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
};

const handleInputFocus = (e) => { e.target.style.borderColor = 'var(--primary)'; };
const handleInputBlur = (e) => { e.target.style.borderColor = 'var(--border)'; };

export default function GoodsItemsTable({ value = [], onChange }) {
  const items = Array.isArray(value) ? value : [];
  const [loadingSuggestions, setLoadingSuggestions] = useState({});

  const updateItem = (idx, field, val) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, { name: '', quantity: '', unit: 'each', spec: '', brand: '' }]);
  };

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const suggestSpec = useCallback(async (idx, itemName) => {
    if (!itemName || itemName.trim().length < 3) return;

    setLoadingSuggestions(prev => ({ ...prev, [idx]: true }));
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest a short (1-2 sentence) specification or description for a procurement item: "${itemName}". Be practical and specific. Return only the suggestion text, no label.`,
        model: 'gpt_5_mini',
      });
      const spec = typeof result === 'string' ? result : '';
      if (spec) {
        updateItem(idx, '_spec_suggestion', spec);
      }
    } catch (e) {
      console.error('Spec suggestion failed:', e);
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [idx]: false }));
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto" style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--muted)' }}>
              {['Item Name *', 'Qty *', 'Unit *', 'Size / Spec', 'Brand / Model', 'Action'].map((label, i) => (
                <th key={label}
                  className={i === 5 ? 'text-center' : 'text-left'}
                  style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--card-surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="e.g. Office chairs"
                    value={item.name || ''}
                    onChange={(e) => {
                      updateItem(idx, 'name', e.target.value);
                      suggestSpec(idx, e.target.value);
                    }}
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.unit || 'each'}
                    onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="e.g. Black leather"
                    value={item.spec || ''}
                    onChange={(e) => updateItem(idx, 'spec', e.target.value)}
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="e.g. Herman Miller"
                    value={item.brand || ''}
                    onChange={(e) => updateItem(idx, 'brand', e.target.value)}
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => removeItem(idx)}
                    style={{ color: 'var(--destructive)', background: 'transparent', border: 'none', opacity: 0.7, cursor: 'pointer', padding: 4 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Suggestion display */}
      {items.map((item, idx) => (
        item._spec_suggestion && (
          <div key={`sugg-${idx}`} className="rounded-lg p-3 space-y-2" style={{ border: '1px solid var(--action-border)', background: 'var(--action-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              <strong>AI Suggestion for "{item.name}":</strong>
            </p>
            <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>{item._spec_suggestion}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  updateItem(idx, 'spec', item._spec_suggestion);
                  updateItem(idx, '_spec_suggestion', null);
                }}
                style={{ color: 'var(--action)' }}
              >
                Accept suggestion
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateItem(idx, '_spec_suggestion', null)}
                style={{ color: 'var(--text-muted)' }}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )
      ))}

      {loadingSuggestions[Object.keys(loadingSuggestions)[0]] && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--action)' }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating AI suggestion...
        </div>
      )}

      <button
        onClick={addItem}
        style={{ border: '1px solid var(--border)', color: 'var(--primary)', background: 'transparent', borderRadius: 8, padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(200,30,58,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <Plus className="w-4 h-4" /> Add Another Item
      </button>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All items will be procured together from a single supplier.</p>
    </div>
  );
}