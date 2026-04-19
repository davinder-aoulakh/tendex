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
    <div className={`rounded-xl border overflow-hidden group transition-all ${
      activeEditors.length > 0 ? 'border-amber-400/30' : 'border-white/10'
    }`} style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-blue-100/80">{title}</h3>
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
            className="gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white hover:bg-white/10">
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
              className="min-h-[140px] text-sm leading-relaxed resize-none bg-white/5 border-white/10 text-white focus-visible:ring-blue-500/50"
              autoFocus
            />
            <AITextAssist text={draft} onApply={(val) => setDraft(val)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="gap-1.5 bg-blue-500 hover:bg-blue-400 text-white border-0">
                <Check className="w-3.5 h-3.5" />Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}
                className="gap-1.5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10">
                <X className="w-3.5 h-3.5" />Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-blue-100/70 leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
}