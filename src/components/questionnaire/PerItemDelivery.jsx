import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function PerItemDelivery({ goodsItems = [], value = {}, onChange }) {
  const [expandedItems, setExpandedItems] = useState({});

  const updateItemDelivery = (itemIdx, field, val) => {
    const updated = { ...value };
    if (!updated[itemIdx]) updated[itemIdx] = {};
    updated[itemIdx][field] = val;
    onChange(updated);
  };

  const toggleExpanded = (idx) => {
    setExpandedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Toggle "Different delivery address for this item?" to specify a unique delivery location or date.
      </p>

      {goodsItems.map((item, idx) => {
        const config = value[idx] || {};
        const isExpanded = expandedItems[idx];

        return (
          <div key={idx} className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            {/* Item header */}
            <button
              onClick={() => toggleExpanded(idx)}
              className="w-full flex items-center justify-between text-left hover-muted p-2 rounded transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <ChevronDown
                  className={`w-4 h-4 text-blue-300 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.name || `Item ${idx + 1}`}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.quantity} {item.unit}
                </span>
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="mt-3 space-y-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.different_address || false}
                    onChange={(e) => updateItemDelivery(idx, 'different_address', e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-500" style={{ borderColor: 'var(--border-strong)', background: 'var(--input)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Different delivery address for this item?</span>
                </label>

                {config.different_address && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street address, suburb, state, postcode"
                      value={config.address || ''}
                      onChange={(e) => updateItemDelivery(idx, 'address', e.target.value)}
                      className="w-full rounded px-2 py-1.5 focus:outline-none text-sm"
                      style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      />
                      </div>
                      )}

                      <label className="flex items-center gap-2 cursor-pointer">
                      <input
                      type="checkbox"
                      checked={config.different_date || false}
                      onChange={(e) => updateItemDelivery(idx, 'different_date', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-500" style={{ borderColor: 'var(--border-strong)', background: 'var(--input)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Different delivery date for this item?</span>
                </label>

                {config.different_date && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={config.date || ''}
                      onChange={(e) => updateItemDelivery(idx, 'date', e.target.value)}
                      className="w-full rounded px-2 py-1.5 focus:outline-none text-sm"
                      style={{ background: 'var(--input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {goodsItems.length === 0 && (
        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Add items above to configure per-item delivery.</p>
      )}
    </div>
  );
}