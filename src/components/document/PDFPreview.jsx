import { useEffect, useRef, useState } from 'react';
import { SECTION_LABELS, SECTION_SCHEMAS } from '@/lib/aiDocumentGenerator';
import jsPDF from 'jspdf';
import { Loader2, RefreshCw } from 'lucide-react';

const DOC_ID = (type) => `${type}-PREVIEW`;

export default function PDFPreview({ doc, content }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [rendering, setRendering] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!doc || !content || Object.keys(content).length === 0) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generatePreview(), 600);
    return () => clearTimeout(debounceRef.current);
  }, [JSON.stringify(content), doc?.id]);

  const generatePreview = () => {
    setRendering(true);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const cw = pw - margin * 2;
    const docId = DOC_ID(doc.document_type);
    const genDateShort = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let y = 0;

    const RED = [220, 30, 30];
    const BLACK = [15, 15, 15];
    const DARK_GRAY = [40, 40, 40];
    const MID_GRAY = [100, 100, 100];
    const LIGHT_GRAY = [180, 180, 180];
    const WHITE = [255, 255, 255];
    const BLUE_DARK = [8, 13, 36];

    // Cover page
    pdf.setFillColor(...WHITE);
    pdf.rect(0, 0, pw, ph, 'F');
    pdf.setFillColor(...BLUE_DARK);
    pdf.rect(0, 0, pw, 18, 'F');
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...LIGHT_GRAY);
    pdf.text('POWERED BY', 14, 11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...WHITE);
    pdf.text('TendeX', 35, 11);
    pdf.setFillColor(...RED);
    pdf.rect(0, 18, pw, 1.2, 'F');

    const docTypeText = { SOW: 'SCOPE OF WORK', EOI: 'EXPRESSION OF INTEREST', RFQ: 'REQUEST FOR QUOTATION', RFP: 'REQUEST FOR PROPOSAL' }[doc.document_type] || doc.document_type;
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...BLACK);
    const typeLines = pdf.splitTextToSize(docTypeText, cw);
    y = 80;
    typeLines.forEach(line => { pdf.text(line, pw / 2, y, { align: 'center' }); y += 18; });
    pdf.setFillColor(...RED);
    pdf.rect(margin + 20, y + 2, cw - 40, 0.8, 'F');
    y += 14;
    if (doc.organisation_name) {
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...MID_GRAY);
      pdf.text(`FOR ${doc.organisation_name}`, pw / 2, y, { align: 'center' });
      y += 16;
    }
    y += 12;
    [['DOCUMENT ID', docId], ['DATE', genDateShort], ['DOCUMENT TYPE', doc.document_type]].forEach(([label, val]) => {
      pdf.setFontSize(8); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(...DARK_GRAY);
      pdf.text(label, pw / 2 - 40, y);
      pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...MID_GRAY);
      pdf.text(String(val), pw / 2 + 10, y);
      y += 8;
    });
    pdf.setDrawColor(...LIGHT_GRAY); pdf.setLineWidth(0.3);
    pdf.line(margin, ph - 16, pw - margin, ph - 16);
    pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...LIGHT_GRAY);
    pdf.text(`Confidential – TendeX Procurement System | Generated ${genDateShort}`, pw / 2, ph - 10, { align: 'center' });

    // Content pages
    const sections = SECTION_SCHEMAS[doc.document_type] || [];
    const addPage = () => {
      pdf.addPage();
      pdf.setFillColor(...WHITE); pdf.rect(0, 0, pw, ph, 'F');
      pdf.setFillColor(...BLUE_DARK); pdf.rect(0, 0, pw, 12, 'F');
      pdf.setFontSize(6.5); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(...WHITE);
      pdf.text('TendeX', 14, 8);
      pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...LIGHT_GRAY);
      pdf.text(`${doc.document_type} — ${doc.organisation_name || doc.title || ''}`, pw / 2, 8, { align: 'center' });
      pdf.text(`Document ID: ${docId}`, pw - 14, 8, { align: 'right' });
      pdf.setFillColor(...RED); pdf.rect(0, 12, pw, 0.7, 'F');
      y = 22;
    };
    const checkBreak = (height) => { if (y + height > ph - 20) addPage(); };

    addPage();
    sections.forEach((sectionKey) => {
      const sectionContent = content[sectionKey];
      if (!sectionContent || String(sectionContent).trim() === '') return;
      const label = SECTION_LABELS[sectionKey] || sectionKey;
      checkBreak(18);
      pdf.setFontSize(11); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(...BLACK);
      pdf.text(label.toUpperCase(), margin, y); y += 2;
      pdf.setFillColor(...RED); pdf.rect(margin, y, Math.min(label.length * 2.1, cw), 0.6, 'F'); y += 6;
      pdf.setFontSize(9.5); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...DARK_GRAY);
      const lines = pdf.splitTextToSize(String(sectionContent).replace(/\n\n+/g, '\n'), cw);
      lines.forEach(line => { checkBreak(6); pdf.text(line, margin, y); y += 5.5; });
      y += 10;
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(...LIGHT_GRAY); pdf.setLineWidth(0.3);
      pdf.line(margin, ph - 14, pw - margin, ph - 14);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...LIGHT_GRAY);
      pdf.text(`${doc.title || doc.document_type}`, margin, ph - 8);
      pdf.text(`Confidential – TendeX RFX System | Generated: ${genDateShort}`, pw / 2, ph - 8, { align: 'center' });
      pdf.text(`Page ${i - 1}`, pw - margin, ph - 8, { align: 'right' });
    }

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
    setRendering(false);
  };

  if (!doc || Object.keys(content).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-blue-200/30 text-sm">
        No content to preview
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-xs text-blue-200/50">
        <span>PDF Preview</span>
        {rendering && <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Updating...</span>}
      </div>
      <div className="flex-1 overflow-hidden">
        {pdfUrl ? (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        )}
      </div>
    </div>
  );
}