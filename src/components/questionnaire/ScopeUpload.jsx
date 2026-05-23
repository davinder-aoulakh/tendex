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

    // Validate file type
    const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExts = ['.pdf', '.docx'];
    const isValidType = allowedMimes.includes(file.type) || allowedExts.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isValidType) {
      setUploadError('Please upload a PDF or Word (.docx) document only.');
      return;
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size exceeds 20MB. Please upload a smaller document.');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      // Upload the file
      const result = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = result.file_url;

      // Extract text from the file for AI analysis
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

  // Simple PDF text extraction using pdf-parse (basic — requires backend support)
  const extractPdfText = async (file) => {
    try {
      // For now, return a placeholder — in production, use a backend function or PDF library
      return `[PDF Document: ${file.name}]`;
    } catch {
      return '';
    }
  };

  // Simple DOCX text extraction
  const extractDocxText = async (file) => {
    try {
      // DOCX is a ZIP file; we'd need a library like unzipper + xml2js
      // For now, return a placeholder
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
          <div className="border-2 border-dashed border-blue-400/30 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400/50 hover:bg-blue-400/5 transition-all"
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              input?.click?.();
            }}>
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <p className="text-sm text-blue-200/70">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-blue-400" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Click to upload or drag and drop</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>PDF or Word (.docx) — max 20MB</p>
              </div>
            )}
          </div>
        </label>
      ) : (
        /* File uploaded — show confirmation */
        <div className="border border-green-400/30 rounded-lg p-4 bg-green-400/5 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText className="w-4 h-4 text-blue-300 flex-shrink-0" />
                {fileInfo?.name || 'Scope Document'}
              </p>
              <p className="text-xs text-green-200/70 mt-1">Document uploaded successfully</p>
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
        <div className="flex items-center gap-2 text-sm text-red-400 border border-red-400/30 rounded-lg px-3 py-2 bg-red-400/5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {uploadError}
        </div>
      )}

      {/* Validation error */}
      {error && hasFile && (
        <div className="flex items-center gap-2 text-sm text-red-400 border border-red-400/30 rounded-lg px-3 py-2 bg-red-400/5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Please upload a valid document before continuing.
        </div>
      )}
    </div>
  );
}