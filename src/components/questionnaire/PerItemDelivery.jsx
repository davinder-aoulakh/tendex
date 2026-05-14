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
      <p className="text-xs text-blue-200/60">
        Toggle "Different delivery address for this item?" to specify a unique delivery location or date.
      </p>

      {goodsItems.map((item, idx) => {
        const config = value[idx] || {};
        const isExpanded = expandedItems[idx];

        return (
          <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3">
            {/* Item header */}
            <button
              onClick={() => toggleExpanded(idx)}
              className="w-full flex items-center justify-between text-left hover:bg-white/5 p-2 rounded transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <ChevronDown
                  className={`w-4 h-4 text-blue-300 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
                <span className="font-medium text-white">
                  {item.name || `Item ${idx + 1}`}
                </span>
                <span className="text-sm text-blue-200/50">
                  {item.quantity} {item.unit}
                </span>
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.different_address || false}
                    onChange={(e) => updateItemDelivery(idx, 'different_address', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500"
                  />
                  <span className="text-sm text-white">Different delivery address for this item?</span>
                </label>

                {config.different_address && (
                  <div>
                    <label className="block text-xs font-medium text-blue-100 mb-1">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street address, suburb, state, postcode"
                      value={config.address || ''}
                      onChange={(e) => updateItemDelivery(idx, 'address', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white placeholder-blue-200/30 focus:border-blue-400 focus:outline-none text-sm"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.different_date || false}
                    onChange={(e) => updateItemDelivery(idx, 'different_date', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500"
                  />
                  <span className="text-sm text-white">Different delivery date for this item?</span>
                </label>

                {config.different_date && (
                  <div>
                    <label className="block text-xs font-medium text-blue-100 mb-1">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={config.date || ''}
                      onChange={(e) => updateItemDelivery(idx, 'date', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white focus:border-blue-400 focus:outline-none text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {goodsItems.length === 0 && (
        <p className="text-xs text-blue-200/40 italic">Add items above to configure per-item delivery.</p>
      )}
    </div>
  );
}