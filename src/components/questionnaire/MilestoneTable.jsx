import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const emptyMilestone = () => ({ id: Date.now(), name: '', description: '' });

export default function MilestoneTable({ value, onChange, error }) {
  const rows = (Array.isArray(value) && value.length > 0) ? value : [emptyMilestone()];

  const update = (index, key, val) => {
    const updated = rows.map((r, i) => i === index ? { ...r, [key]: val } : r);
    onChange(updated);
  };

  const addRow = () => onChange([...rows, emptyMilestone()]);

  const removeRow = (index) => {
    if (rows.length === 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-red-400">At least one milestone is required.</p>}
      {rows.map((row, i) => (
        <div key={row.id || i} className="rounded-xl border border-white/10 p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-300/60 font-medium uppercase tracking-wider">Milestone {i + 1}</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} className="text-white/30 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <Input
            value={row.name || ''}
            onChange={e => update(i, 'name', e.target.value)}
            placeholder="Milestone name (e.g. Project Kickoff)"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/50"
          />
          <Textarea
            value={row.description || ''}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Brief description of this milestone..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-blue-500/50 min-h-[70px] resize-none"
          />
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={addRow}
        className="gap-2 text-blue-300/70 hover:text-blue-300 hover:bg-white/10 border border-white/10 border-dashed w-full">
        <Plus className="w-4 h-4" /> Add Milestone
      </Button>
    </div>
  );
}