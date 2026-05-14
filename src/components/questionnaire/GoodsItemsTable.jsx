import { useState, useCallback } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const UNITS = ['each', 'kg', 'litres', 'metres', 'sets', 'boxes', 'pallets', 'other'];

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
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left font-medium text-blue-100">Item Name *</th>
              <th className="px-4 py-3 text-left font-medium text-blue-100">Qty *</th>
              <th className="px-4 py-3 text-left font-medium text-blue-100">Unit *</th>
              <th className="px-4 py-3 text-left font-medium text-blue-100">Size / Spec</th>
              <th className="px-4 py-3 text-left font-medium text-blue-100">Brand / Model</th>
              <th className="px-4 py-3 text-center font-medium text-blue-100">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="e.g. Office chairs"
                    value={item.name || ''}
                    onChange={(e) => {
                      updateItem(idx, 'name', e.target.value);
                      suggestSpec(idx, e.target.value);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white placeholder-blue-200/30 focus:border-blue-400 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white placeholder-blue-200/30 focus:border-blue-400 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.unit || 'each'}
                    onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                    className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:border-blue-400 focus:outline-none"
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
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white placeholder-blue-200/30 focus:border-blue-400 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="e.g. Herman Miller"
                    value={item.brand || ''}
                    onChange={(e) => updateItem(idx, 'brand', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white placeholder-blue-200/30 focus:border-blue-400 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(idx)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Suggestion display */}
      {items.map((item, idx) => (
        item._spec_suggestion && (
          <div key={`sugg-${idx}`} className="rounded-lg border border-blue-400/30 p-3 bg-blue-400/10 space-y-2">
            <p className="text-sm text-blue-100">
              <strong>AI Suggestion for "{item.name}":</strong>
            </p>
            <p className="text-sm text-blue-200/80 italic">{item._spec_suggestion}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  updateItem(idx, 'spec', item._spec_suggestion);
                  updateItem(idx, '_spec_suggestion', null);
                }}
                className="text-blue-300 hover:bg-blue-400/20"
              >
                Accept suggestion
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateItem(idx, '_spec_suggestion', null)}
                className="text-blue-200/50 hover:bg-white/10"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )
      ))}

      {loadingSuggestions[Object.keys(loadingSuggestions)[0]] && (
        <div className="flex items-center gap-2 text-sm text-blue-200/50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating AI suggestion...
        </div>
      )}

      <Button
        onClick={addItem}
        variant="outline"
        className="gap-2 border-white/20 text-white hover:bg-white/10"
      >
        <Plus className="w-4 h-4" /> Add Another Item
      </Button>

      <p className="text-xs text-blue-200/40">All items will be procured together from a single supplier.</p>
    </div>
  );
}