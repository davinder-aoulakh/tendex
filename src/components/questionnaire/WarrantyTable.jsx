import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function WarrantyTable({ goodsItems = [], value = {}, onChange }) {
  const [expandedItems, setExpandedItems] = useState({});

  const updateWarranty = (itemIdx, field, val) => {
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
        Specify warranty requirements for each item. These will appear in the generated procurement document.
      </p>

      {goodsItems.map((item, idx) => {
        const config = value[idx] || {};
        const isExpanded = expandedItems[idx];
        const hasWarranty = config.warranty === 'yes';

        return (
          <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3">
            {/* Item header with warranty toggle */}
            <button
              onClick={() => toggleExpanded(idx)}
              className="w-full flex items-center justify-between text-left hover:bg-white/5 p-2 rounded transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <ChevronDown
                  className={`w-4 h-4 text-blue-300 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-white">{item.name || `Item ${idx + 1}`}</p>
                  <p className="text-xs text-blue-200/50">{item.quantity} {item.unit}</p>
                </div>
              </div>

              {/* Warranty toggle */}
              <label className="flex items-center gap-2 cursor-pointer mr-2">
                <span className="text-sm text-white">Warranty:</span>
                <select
                  value={config.warranty || 'no'}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateWarranty(idx, 'warranty', e.target.value);
                  }}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-blue-400 focus:outline-none"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
            </button>

            {/* Warranty duration field */}
            {isExpanded && hasWarranty && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <label className="block text-xs font-medium text-blue-100 mb-2">
                  Warranty Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 months, 2 years, 5 years"
                  value={config.duration || ''}
                  onChange={(e) => updateWarranty(idx, 'duration', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white placeholder-blue-200/30 focus:border-blue-400 focus:outline-none text-sm"
                />
              </div>
            )}
          </div>
        );
      })}

      {goodsItems.length === 0 && (
        <p className="text-xs text-blue-200/40 italic">Add items above to configure warranty requirements.</p>
      )}
    </div>
  );
}