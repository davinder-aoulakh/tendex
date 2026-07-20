import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const MAX_SIZE_MB = 2;
const ACCEPTED = ['image/png', 'image/jpeg'];

/**
 * Logo upload component — persists to user profile via updateMe.
 *
 * Props:
 *   value    — current logo_url (string | null)
 *   onChange — (url: string | null) => void
 */
export default function LogoUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState(null);
  const [saved, setSaved]         = useState(false);
  const inputRef                  = useRef(null);

  const handleFile = async (file) => {
    setError(null);
    setSaved(false);

    if (!ACCEPTED.includes(file.type)) {
      setError('Only PNG and JPEG files are accepted.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Persist to user profile
    await base44.auth.updateMe({ logo_url: file_url });

    onChange?.(file_url);
    setSaved(true);
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = async () => {
    await base44.auth.updateMe({ logo_url: null });
    onChange?.(null);
    setSaved(false);
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="rounded-xl p-3 flex items-center justify-center" style={{ border: '1px solid var(--border)', background: 'var(--card)', minWidth: 120, minHeight: 64 }}>
            <img
              src={value}
              alt="Organisation logo"
              style={{ maxHeight: 48, maxWidth: 200, objectFit: 'contain' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {saved && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--success)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Logo saved to your profile
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="ghost"
                onClick={() => inputRef.current?.click()}
                className="text-xs h-8"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Replace
              </Button>
              <Button size="sm" variant="ghost" onClick={handleRemove}
                className="text-xs h-8"
                style={{ color: 'var(--destructive)', border: '1px solid var(--border)' }}>
                <X className="w-3 h-3 mr-1" /> Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
          style={{
            border: '2px dashed var(--border)',
            borderRadius: 12,
            background: 'var(--card)',
            padding: '32px 20px',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(200,30,58,0.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card)'; }}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
          ) : (
            <Upload className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
          )}
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {uploading ? 'Uploading...' : 'Click or drag to upload your logo'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>PNG or JPEG, max 2MB</p>
        </div>
      )}

      {error && (
        <p className="text-xs px-1" style={{ color: 'var(--destructive)' }}>{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}