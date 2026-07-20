import { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ScopeUpload({ value, onChange, error }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);

  const getFileInfo = (url) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return {
        name: pathname.split('/').pop() || 'Scope Document',
        url,
      };
    } catch {
      return { name: 'Scope Document', url };
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExts = ['.pdf', '.docx'];
    const isValidType = allowedMimes.includes(file.type) || allowedExts.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isValidType) {
      setUploadError('Please upload a PDF or Word (.docx) document only.');
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size exceeds 20MB. Please upload a smaller document.');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = result.file_url;

      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        text = await extractPdfText(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
        text = await extractDocxText(file);
      }

      setFileName(file.name);
      setDocumentContent(text);
      onChange(fileUrl);
    } catch (err) {
      setUploadError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const extractPdfText = async (file) => {
    try {
      return `[PDF Document: ${file.name}]`;
    } catch {
      return '';
    }
  };

  const extractDocxText = async (file) => {
    try {
      return `[Word Document: ${file.name}]`;
    } catch {
      return '';
    }
  };

  const fileInfo = getFileInfo(value);
  const hasFile = !!value;

  return (
    <div className="space-y-3">
      {/* Upload area */}
      {!hasFile ? (
        <label className="block">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <div
            style={{ border: '2px dashed var(--border)', borderRadius: 12, background: 'var(--card)', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              input?.click?.();
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(200,30,58,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card)'; }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Click to upload or drag and drop</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>PDF or Word (.docx) — max 20MB</p>
              </div>
            )}
          </div>
        </label>
      ) : (
        /* File uploaded — show confirmation */
        <div className="p-4 space-y-3" style={{ border: '1px solid var(--success-border)', background: 'var(--success-subtle)', borderRadius: 12 }}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--success)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                {fileInfo?.name || 'Scope Document'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--success)' }}>Document uploaded successfully</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onChange(null);
                setFileName(null);
                setDocumentContent(null);
                setUploadError(null);
              }}
              className="hover-muted flex-shrink-0" style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Your scope document has been saved. We'll analyze it to recommend the best document type for your procurement.
          </p>
        </div>
      )}

      {/* Error message */}
      {uploadError && !hasFile && (
        <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2" style={{ color: 'var(--destructive)', border: '1px solid rgba(200,30,58,0.25)', background: 'rgba(200,30,58,0.08)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {uploadError}
        </div>
      )}

      {/* Validation error */}
      {error && hasFile && (
        <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2" style={{ color: 'var(--destructive)', border: '1px solid rgba(200,30,58,0.25)', background: 'rgba(200,30,58,0.08)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Please upload a valid document before continuing.
        </div>
      )}
    </div>
  );
}