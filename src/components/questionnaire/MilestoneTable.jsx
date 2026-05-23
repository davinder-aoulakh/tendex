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
        <div key={row.id || i} className="rounded-xl border p-4 space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Milestone {i + 1}</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <Input
            value={row.name || ''}
            onChange={e => update(i, 'name', e.target.value)}
            placeholder="Milestone name (e.g. Project Kickoff)"
            className="focus-visible:ring-1"
            style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <Textarea
            value={row.description || ''}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Brief description of this milestone..."
            className="min-h-[70px] resize-none focus-visible:ring-1"
            style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={addRow}
        className="gap-2 hover-muted border-dashed w-full" style={{ border: '1px dashed var(--border)', color: 'var(--text-secondary)' }}>
        <Plus className="w-4 h-4" /> Add Milestone
      </Button>
    </div>
  );
}