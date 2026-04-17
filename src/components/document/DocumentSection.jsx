import { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function DocumentSection({ title, content, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const handleSave = () => {
    onChange(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(content);
    setEditing(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden group">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/20">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        {!editing && (
          <Button variant="ghost" size="sm" onClick={() => { setDraft(content); setEditing(true); }}
            className="gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
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
              className="min-h-[140px] text-sm leading-relaxed resize-none bg-background"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="gap-1.5"><Check className="w-3.5 h-3.5" />Save</Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="gap-1.5"><X className="w-3.5 h-3.5" />Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
}