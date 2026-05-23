import { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AITextAssist from './AITextAssist';

export default function DocumentSection({ title, sectionKey, content, onChange, onFocus, onBlur, activeEditors = [] }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const handleSave = () => {
    onChange(draft);
    setEditing(false);
    onBlur?.();
  };

  const handleCancel = () => {
    setDraft(content);
    setEditing(false);
    onBlur?.();
  };

  const startEditing = () => {
    setDraft(content);
    setEditing(true);
    onFocus?.();
  };

  return (
    <div className="rounded-xl border overflow-hidden group transition-all" style={{ background: 'var(--card)', borderColor: activeEditors.length > 0 ? 'rgba(251,191,36,0.3)' : 'var(--border)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          {activeEditors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {activeEditors.map((p, i) => (
                <div key={i} className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: `${p.color}25`, color: p.color, border: `1px solid ${p.color}40` }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: p.color }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: p.color }} />
                  </span>
                  {p.user_name}
                </div>
              ))}
            </div>
          )}
        </div>
        {!editing && (
          <Button variant="ghost" size="sm" onClick={startEditing}
            className="gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover-muted" style={{ color: 'var(--text-muted)' }}>
            <Edit3 className="w-3.5 h-3.5" />Edit
          </Button>
        )}
      </div>
      <div className="p-5">
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              className="min-h-[140px] text-sm leading-relaxed resize-none focus-visible:ring-1"
              style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <AITextAssist text={draft} onApply={(val) => setDraft(val)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="gap-1.5 text-white border-0" style={{ backgroundColor: 'var(--primary)' }}>
                <Check className="w-3.5 h-3.5" />Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}
                className="gap-1.5 hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <X className="w-3.5 h-3.5" />Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{content}</p>
        )}
      </div>
    </div>
  );
}