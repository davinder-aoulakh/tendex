import { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SECTION_LABELS, SECTION_SCHEMAS } from '@/lib/aiDocumentGenerator';
import jsPDF from 'jspdf';

const DOC_ID = () => `TDX-${Date.now().toString(36).toUpperCase()}`;

export default function PDFExport({ doc, content, onClose }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth();   // 210
    const ph = pdf.internal.pageSize.getHeight();  // 297
    const margin = 20;
    const cw = pw - margin * 2;
    const docId = DOC_ID();
    const genDate = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
    let y = 0;

    // ── COVER PAGE ──────────────────────────────────────────────
    // Dark background
    pdf.setFillColor(8, 13, 36);
    pdf.rect(0, 0, pw, ph, 'F');

    // Geometric accent shapes
    pdf.setFillColor(13, 27, 75);
    pdf.triangle(pw * 0.5, 0, pw, 0, pw, ph * 0.45, 'F');
    pdf.setFillColor(10, 21, 53);
    pdf.triangle(pw, ph * 0.3, pw, ph * 0.7, pw * 0.6, ph * 0.5, 'F');

    // Top accent bar
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, 6, ph, 'F');

    // POWERED BY TendeX tag
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(99, 150, 255);
    pdf.text('POWERED BY TendeX', margin + 2, 16);

    // Document type (large)
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    const docTypeText = {
      SOW: 'SCOPE OF WORK',
      EOI: 'EXPRESSION OF INTEREST',
      RFQ: 'REQUEST FOR QUOTATION',
      RFP: 'REQUEST FOR PROPOSAL',
    }[doc.document_type] || doc.document_type;

    // Word-wrap if needed
    const typeLines = pdf.splitTextToSize(docTypeText, cw - 10);
    y = 55;
    typeLines.forEach(line => { pdf.text(line, margin + 2, y); y += 14; });

    // Title
    y += 4;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(160, 190, 255);
    const titleLines = pdf.splitTextToSize(doc.title || 'Document', cw - 10);
    titleLines.forEach(line => { pdf.text(line, margin + 2, y); y += 8; });

    // Organisation
    if (doc.organisation_name) {
      y += 4;
      pdf.setFontSize(12);
      pdf.setTextColor(120, 160, 220);
      pdf.text(doc.organisation_name, margin + 2, y);
    }

    // Metadata block at bottom of cover
    pdf.setFillColor(13, 27, 75);
    pdf.roundedRect(margin, ph - 70, cw, 48, 3, 3, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 160, 220);
    const meta = [
      ['Document ID', docId],
      ['Generated', genDate],
      ['Document Type', doc.document_type],
      ...(doc.organisation_name ? [['Prepared by', doc.organisation_name]] : []),
    ];
    let mx = margin + 6;
    let my = ph - 58;
    meta.forEach(([label, val]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(99, 150, 255);
      pdf.text(label.toUpperCase(), mx, my);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 220, 255);
      pdf.text(String(val), mx, my + 5);
      mx += cw / meta.length;
    });

    // Cover footer
    pdf.setFontSize(7);
    pdf.setTextColor(60, 90, 140);
    pdf.text('CONFIDENTIAL — This document is intended solely for the named recipient(s).', margin + 2, ph - 10);

    // ── CONTENT PAGES ────────────────────────────────────────────
    const sections = SECTION_SCHEMAS[doc.document_type] || [];

    const addContentPage = () => {
      pdf.addPage();
      // White page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pw, ph, 'F');
      // Left accent bar
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, 3, ph, 'F');
      y = margin + 4;
    };

    const drawFooter = (pageNum, total) => {
      pdf.setFontSize(7);
      pdf.setTextColor(160, 160, 160);
      pdf.text(`${doc.title || doc.document_type}`, margin + 4, ph - 8);
      pdf.text(`Page ${pageNum} of ${total}  |  ${docId}  |  CONFIDENTIAL — TENDEX`, pw / 2, ph - 8, { align: 'center' });
      pdf.text(genDate, pw - margin, ph - 8, { align: 'right' });
      // Footer line
      pdf.setDrawColor(220, 230, 245);
      pdf.line(margin, ph - 12, pw - margin, ph - 12);
    };

    const checkBreak = (height) => {
      if (y + height > ph - 18) { addContentPage(); }
    };

    addContentPage();

    // Table of contents header
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(8, 13, 36);
    pdf.text('DOCUMENT CONTENTS', margin + 4, y);
    y += 2;
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(margin + 4, y, margin + 4 + 50, y);
    y += 8;

    sections.forEach((key, idx) => {
      const label = SECTION_LABELS[key] || key;
      if (content[key]) {
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(`${idx + 1}.  ${label}`, margin + 4, y);
        y += 6;
      }
    });

    y += 6;

    // Sections
    sections.forEach((sectionKey) => {
      const sectionContent = content[sectionKey];
      if (!sectionContent) return;

      const label = SECTION_LABELS[sectionKey] || sectionKey;

      checkBreak(22);

      // Section heading strip
      pdf.setFillColor(240, 246, 255);
      pdf.rect(margin, y - 5, cw, 13, 'F');
      pdf.setFillColor(59, 130, 246);
      pdf.rect(margin, y - 5, 3, 13, 'F');
      pdf.setFontSize(10.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(8, 13, 80);
      pdf.text(label.toUpperCase(), margin + 7, y + 3);
      y += 14;

      // Body text
      pdf.setFontSize(9.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 30, 30);
      const lines = pdf.splitTextToSize(sectionContent, cw - 2);
      lines.forEach(line => {
        checkBreak(6);
        pdf.text(line, margin + 2, y);
        y += 5.5;
      });
      y += 8;
    });

    // Draw footers on all content pages
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      pdf.setPage(i);
      drawFooter(i - 1, totalPages - 1);
    }

    // Save
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

        <div className="rounded-xl border border-white/10 p-4 mb-6 space-y-2 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {[
            ['Document type', doc.document_type],
            ['Title', doc.title],
            ['Organisation', doc.organisation_name || '—'],
            ['Sections', Object.keys(content).length],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-blue-200/50">{label}</span>
              <span className="font-medium text-white truncate ml-4 max-w-[60%]">{val}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-blue-200/40 mb-6">
          Your document will be exported as a branded A4 PDF with a dark TendeX cover page, professional formatting, and a confidential footer.
        </p>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose}
            className="flex-1 text-white/60 hover:text-white hover:bg-white/10 border border-white/10">
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}
            className="flex-1 gap-2 bg-blue-500 hover:bg-blue-400 text-white border-0">
            {exporting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Exporting...</>
              : <><Download className="w-4 h-4" />Download PDF</>}
          </Button>
        </div>
      </div>
    </div>
  );
}