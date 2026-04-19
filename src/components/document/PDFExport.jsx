import { useState } from 'react';
import { X, Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SECTION_LABELS, SECTION_SCHEMAS } from '@/lib/aiDocumentGenerator';
import jsPDF from 'jspdf';

const DOC_ID = (type) => `${type}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

export default function PDFExport({ doc, content, onClose }) {
  const [exporting, setExporting] = useState(false);

  const hasContent = content && Object.keys(content).length > 0;

  const handleExport = async () => {
    setExporting(true);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth();   // 210
    const ph = pdf.internal.pageSize.getHeight();  // 297
    const margin = 20;
    const cw = pw - margin * 2;
    const docId = DOC_ID(doc.document_type);
    const genDate = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
    const genDateShort = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let y = 0;

    const RED = [220, 30, 30];
    const BLACK = [15, 15, 15];
    const DARK_GRAY = [40, 40, 40];
    const MID_GRAY = [100, 100, 100];
    const LIGHT_GRAY = [180, 180, 180];
    const VERY_LIGHT = [245, 245, 245];
    const WHITE = [255, 255, 255];
    const BLUE_DARK = [8, 13, 36];

    // ── COVER PAGE ──────────────────────────────────────────────
    // White background
    pdf.setFillColor(...WHITE);
    pdf.rect(0, 0, pw, ph, 'F');

    // Top bar — thin dark line with logo area
    pdf.setFillColor(...BLUE_DARK);
    pdf.rect(0, 0, pw, 18, 'F');

    // "POWERED BY TendeX" in top bar
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...LIGHT_GRAY);
    pdf.text('POWERED BY', 14, 11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...WHITE);
    pdf.text('TendeX', 35, 11);

    // Red accent line below top bar
    pdf.setFillColor(...RED);
    pdf.rect(0, 18, pw, 1.2, 'F');

    // Document type heading — large, centered, bold
    const docTypeText = {
      SOW: 'SCOPE OF WORK',
      EOI: 'EXPRESSION OF INTEREST',
      RFQ: 'REQUEST FOR QUOTATION',
      RFP: 'REQUEST FOR PROPOSAL',
    }[doc.document_type] || doc.document_type;

    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...BLACK);
    const typeLines = pdf.splitTextToSize(docTypeText, cw);
    y = 80;
    typeLines.forEach(line => {
      pdf.text(line, pw / 2, y, { align: 'center' });
      y += 18;
    });

    // Red separator line below title
    pdf.setFillColor(...RED);
    pdf.rect(margin + 20, y + 2, cw - 40, 0.8, 'F');
    y += 14;

    // Organisation / "FOR" line
    if (doc.organisation_name) {
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...MID_GRAY);
      pdf.text(`FOR ${doc.organisation_name}`, pw / 2, y, { align: 'center' });
      y += 16;
    }

    // Meta fields block centered
    y += 12;
    const metaFields = [
      ['DOCUMENT ID', docId],
      ['DATE', genDateShort],
      ['DOCUMENT TYPE', doc.document_type],
      ...(doc.industry ? [['TYPE', doc.industry]] : []),
    ];

    metaFields.forEach(([label, val]) => {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...DARK_GRAY);
      pdf.text(label, pw / 2 - 40, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...MID_GRAY);
      pdf.text(String(val), pw / 2 + 10, y);
      y += 8;
    });

    // Footer line
    pdf.setDrawColor(...LIGHT_GRAY);
    pdf.setLineWidth(0.3);
    pdf.line(margin, ph - 16, pw - margin, ph - 16);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...LIGHT_GRAY);
    pdf.text(`Confidential – TendeX Procurement System | Generated ${genDateShort}`, pw / 2, ph - 10, { align: 'center' });

    // ── CONTENT PAGES ────────────────────────────────────────────
    const sections = SECTION_SCHEMAS[doc.document_type] || [];

    const addPage = () => {
      pdf.addPage();
      pdf.setFillColor(...WHITE);
      pdf.rect(0, 0, pw, ph, 'F');

      // Compact header
      pdf.setFillColor(...BLUE_DARK);
      pdf.rect(0, 0, pw, 12, 'F');
      pdf.setFontSize(6.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...WHITE);
      pdf.text('TendeX', 14, 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...LIGHT_GRAY);
      pdf.text(`${doc.document_type} — ${doc.organisation_name || doc.title || ''}`, pw / 2, 8, { align: 'center' });
      pdf.text(`Document ID: ${docId}`, pw - 14, 8, { align: 'right' });

      // Red accent line
      pdf.setFillColor(...RED);
      pdf.rect(0, 12, pw, 0.7, 'F');

      y = 22;
    };

    const drawFooter = (pageNum, total) => {
      pdf.setDrawColor(...LIGHT_GRAY);
      pdf.setLineWidth(0.3);
      pdf.line(margin, ph - 14, pw - margin, ph - 14);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...LIGHT_GRAY);
      pdf.text(`${doc.title || doc.document_type}`, margin, ph - 8);
      pdf.text(`Confidential – TendeX RFX System | Generated: ${genDateShort}`, pw / 2, ph - 8, { align: 'center' });
      pdf.text(`Page ${pageNum}`, pw - margin, ph - 8, { align: 'right' });
    };

    const checkBreak = (height) => {
      if (y + height > ph - 20) { addPage(); }
    };

    addPage();

    // Render each section
    sections.forEach((sectionKey) => {
      const sectionContent = content[sectionKey];
      if (!sectionContent || String(sectionContent).trim() === '') return;

      const label = SECTION_LABELS[sectionKey] || sectionKey;

      checkBreak(18);

      // Section heading
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BLACK);
      pdf.text(label.toUpperCase(), margin, y);
      y += 2;

      // Red underline
      pdf.setFillColor(...RED);
      pdf.rect(margin, y, Math.min(label.length * 2.1, cw), 0.6, 'F');
      y += 6;

      // Body text
      pdf.setFontSize(9.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...DARK_GRAY);
      const bodyText = String(sectionContent).replace(/\n\n+/g, '\n');
      const lines = pdf.splitTextToSize(bodyText, cw);
      lines.forEach(line => {
        checkBreak(6);
        pdf.text(line, margin, y);
        y += 5.5;
      });
      y += 10;
    });

    // Draw footers on all content pages
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      pdf.setPage(i);
      drawFooter(i - 1, totalPages - 1);
    }

    const orgSlug = (doc.organisation_name || 'TendeX').replace(/\s+/g, '_');
    const dateSlug = new Date().toISOString().slice(0, 10);
    pdf.save(`${doc.document_type}_${orgSlug}_${dateSlug}.pdf`);

    setExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-8"
        style={{ background: 'rgba(8,13,36,0.95)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-white">Export PDF</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!hasContent && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-400/30 px-4 py-3 mb-5 text-sm text-amber-300"
            style={{ background: 'rgba(245,158,11,0.07)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            No content found. Please generate the document first before exporting.
          </div>
        )}

        <div className="rounded-xl border border-white/10 p-4 mb-6 space-y-2 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {[
            ['Document type', doc.document_type],
            ['Title', doc.title],
            ['Organisation', doc.organisation_name || '—'],
            ['Sections', Object.keys(content).filter(k => content[k]).length],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-blue-200/50">{label}</span>
              <span className="font-medium text-white truncate ml-4 max-w-[60%]">{val}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-blue-200/40 mb-6">
          Exports a professional branded A4 PDF with a TendeX cover page and clean white content pages.
        </p>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose}
            className="flex-1 text-white/60 hover:text-white hover:bg-white/10 border border-white/10">
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || !hasContent}
            className="flex-1 gap-2 bg-blue-500 hover:bg-blue-400 text-white border-0 disabled:opacity-50">
            {exporting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Exporting...</>
              : <><Download className="w-4 h-4" />Download PDF</>}
          </Button>
        </div>
      </div>
    </div>
  );
}