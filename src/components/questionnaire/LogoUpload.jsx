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
          <div className="rounded-xl border border-white/10 p-3 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', minWidth: 120, minHeight: 64 }}>
            <img
              src={value}
              alt="Organisation logo"
              style={{ maxHeight: 48, maxWidth: 200, objectFit: 'contain' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {saved && (
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Logo saved to your profile
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="ghost"
                onClick={() => inputRef.current?.click()}
                className="text-white/60 hover:text-white hover:bg-white/10 border border-white/10 text-xs h-8">
                Replace
              </Button>
              <Button size="sm" variant="ghost" onClick={handleRemove}
                className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10 border border-red-400/20 text-xs h-8">
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
          className="rounded-xl border-2 border-dashed border-white/15 hover:border-blue-400/40 transition-colors cursor-pointer p-6 flex flex-col items-center justify-center gap-2 text-center"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-blue-300/50" />
          )}
          <p className="text-sm text-blue-200/50">
            {uploading ? 'Uploading...' : 'Click or drag to upload your logo'}
          </p>
          <p className="text-xs text-blue-200/30">PNG or JPEG, max 2MB</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 px-1">{error}</p>
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