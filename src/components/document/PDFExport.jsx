import { useState } from 'react';
import { X, Download, Loader2, AlertCircle, FileText, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SECTION_LABELS, SECTION_SCHEMAS } from '@/lib/aiDocumentGenerator';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const getProcurementId = (doc) => doc?.procurement_id || 'TENDEX000000';

const DOC_TYPE_LABELS = {
  SOW: 'Scope of Work',
  EOI: 'Expression of Interest',
  RFQ: 'Request for Quotation',
  RFP: 'Request for Proposal',
};

// TendeX brand teal
const TEAL = [0, 201, 167];
const DARK = [8, 14, 26];
const GRAY = [100, 116, 139];
const LIGHT = [203, 213, 225];
const WHITE = [255, 255, 255];

export default function PDFExport({ doc, content, onClose }) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  const hasContent = content && Object.keys(content).length > 0;
  const docId = getProcurementId(doc);
  const genDate = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const genDateLong = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── PDF EXPORT ──────────────────────────────────────────────
  const handleExportPDF = async () => {
    setExportingPdf(true);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth();   // 210
    const ph = pdf.internal.pageSize.getHeight();  // 297
    const margin = 25; // 2.5cm
    const cw = pw - margin * 2;
    const docTypeLabel = (DOC_TYPE_LABELS[doc.document_type] || doc.document_type).toUpperCase();
    const isSow = doc.document_type === 'SOW';
    let y = 0;

    // ── LOGO: load if available ───────────────────────────
    const logoUrl = doc.questionnaire_data?.logo_url || null;
    let logoDataUrl = null;
    let logoDims = null; // { w, h } in mm

    if (logoUrl) {
      const result = await new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d').drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          const logoH = 10; // mm
          const aspect = img.naturalWidth / (img.naturalHeight || 1);
          const logoW = Math.min(aspect * logoH, 50);
          resolve({ dataUrl, dims: { w: logoW, h: logoH } });
        };
        img.onerror = () => resolve(null);
        img.src = logoUrl;
      });
      if (result) {
        logoDataUrl = result.dataUrl;
        logoDims = result.dims;
      }
    }

    // ── HELPERS ─────────────────────────────────────────────
    const addHeader = () => {
      // White background for header
      pdf.setFillColor(...WHITE);
      pdf.rect(0, 0, pw, 16, 'F');

      if (logoDataUrl && logoDims) {
        // Organisation logo top-left, scaled proportionally to 10mm height
        try {
          pdf.addImage(logoDataUrl, 'PNG', margin, 3, logoDims.w, logoDims.h);
        } catch {
          // Fallback: org name text
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...TEAL);
          pdf.text(doc.organisation_name || 'Organisation', margin, 9);
        }
      } else {
        // "Powered by TendeX" in brand style
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...TEAL);
        pdf.text('Powered by TendeX', margin, 9);
      }

      // Right: DocID | Date | Type
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...GRAY);
      const rightText = `${docId}  |  ${genDate}  |  ${DOC_TYPE_LABELS[doc.document_type] || doc.document_type}`;
      pdf.text(rightText, pw - margin, 9, { align: 'right' });
      // Brand accent line
      pdf.setFillColor(...TEAL);
      pdf.rect(0, 16, pw, 0.8, 'F');
    };

    const addFooter = () => {
      pdf.setDrawColor(...LIGHT);
      pdf.setLineWidth(0.3);
      pdf.line(margin, ph - 14, pw - margin, ph - 14);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...GRAY);
      pdf.text(`Powered by TendeX  •  tendex.com.au  •  Document ID: ${docId}  •  Generated: ${genDate}  •  Confidential`, pw / 2, ph - 8, { align: 'center' });
    };

    const addContentPage = () => {
      pdf.addPage();
      pdf.setFillColor(...WHITE);
      pdf.rect(0, 0, pw, ph, 'F');
      addHeader();
      addFooter();
      y = 24;
    };

    const checkBreak = (needed) => {
      if (y + needed > ph - 18) { addContentPage(); }
    };

    // ── COVER PAGE (non-SOW only) ────────────────────────────
    if (!isSow) {
      pdf.setFillColor(...WHITE);
      pdf.rect(0, 0, pw, ph, 'F');

      // Header on cover page too
      addHeader();

      // "Powered by TendeX" label
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...GRAY);
      pdf.text('POWERED BY', pw / 2, 52, { align: 'center' });
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...TEAL);
      pdf.text('TendeX', pw / 2 + 18, 52, { align: 'center' });

      // Large doc type title
      pdf.setFontSize(30);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...DARK);
      const titleLines = pdf.splitTextToSize(docTypeLabel, cw - 20);
      y = 80;
      titleLines.forEach(line => {
        pdf.text(line, pw / 2, y, { align: 'center' });
        y += 16;
      });

      // Brand accent line below title
      pdf.setFillColor(...TEAL);
      pdf.rect(margin + 10, y + 4, cw - 20, 1, 'F');
      y += 16;

      // "FOR Organisation" (prefer verified ABN entity name)
      const qd = doc.questionnaire_data || {};
      const displayOrgName = (qd._abn_confirmed && qd._abn_entity_name) ? qd._abn_entity_name : doc.organisation_name;
      const formattedABN = qd.abn ? qd.abn.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4') : null;

      if (displayOrgName) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text(`FOR ${displayOrgName}`, pw / 2, y, { align: 'center' });
        y += 8;
      }
      if (formattedABN) {
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text(`ABN: ${formattedABN}`, pw / 2, y, { align: 'center' });
        y += 10;
      } else {
        y += 10;
      }

      // Meta table
      y += 14;
      const closingDate = qd.eoi_closing_date || qd.rfq_closing_date || qd.rfp_closing_date || qd.closing_date;
      const contactName = qd.eoi_contact_name || qd.rfq_contact_name || qd.rfp_contact_name || qd.contact_name;
      const metaFields = [
        ['DOCUMENT ID', docId],
        ['DATE', genDateLong],
        ['TYPE', DOC_TYPE_LABELS[doc.document_type] || doc.document_type],
        ...(closingDate ? [['CLOSING DATE', closingDate]] : []),
        ...(contactName ? [['CONTACT PERSON', contactName]] : []),
        ...(doc.industry ? [['CATEGORY', doc.industry]] : []),
      ];
      const colLabel = pw / 2 - 45;
      const colVal = pw / 2 + 10;
      metaFields.forEach(([label, val]) => {
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...DARK);
        pdf.text(label, colLabel, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...GRAY);
        pdf.text(String(val || '—'), colVal, y);
        y += 9;
      });

      // Cover footer
      addFooter();
    }

    // ── CONTENT PAGES ────────────────────────────────────────
    // Start first content page
    if (!isSow) {
      // Add new page after cover
      pdf.addPage();
    }
    pdf.setFillColor(...WHITE);
    pdf.rect(0, 0, pw, ph, 'F');
    addHeader();
    addFooter();
    y = 24;

    const sections = SECTION_SCHEMAS[doc.document_type] || [];
    sections.forEach(sectionKey => {
      const bodyText = content[sectionKey];
      if (!bodyText || String(bodyText).trim() === '') return;
      const label = SECTION_LABELS[sectionKey] || sectionKey;

      checkBreak(22);

      // Section heading
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...DARK);
      pdf.text(label.toUpperCase(), margin, y);
      y += 2.5;

      // Teal underline
      pdf.setFillColor(...TEAL);
      pdf.rect(margin, y, Math.min(pdf.getStringUnitWidth(label.toUpperCase()) * 11 / pdf.internal.scaleFactor, cw), 0.7, 'F');
      y += 7;

      // Body text
      pdf.setFontSize(9.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...DARK);
      const cleaned = String(bodyText).replace(/\n\n+/g, '\n\n');
      const blocks = cleaned.split('\n\n');
      blocks.forEach((block, bi) => {
        const lines = pdf.splitTextToSize(block.replace(/\n/g, ' '), cw);
        lines.forEach(line => {
          checkBreak(6);
          pdf.text(line, margin, y);
          y += 5.5;
        });
        if (bi < blocks.length - 1) y += 3; // paragraph gap
      });
      y += 10; // section gap
    });

    // Build filename
    const titleSlug = (doc.project_name || doc.title || doc.organisation_name || 'Document')
      .replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '');
    const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    pdf.save(`${doc.document_type}_${titleSlug}_${dateSlug}_${docId}.pdf`);

    setExportingPdf(false);
  };

  // ── WORD EXPORT ─────────────────────────────────────────────
  const handleExportDocx = async () => {
    setExportingDocx(true);

    const titleSlug = (doc.project_name || doc.title || doc.organisation_name || 'Document')
      .replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '');
    const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${doc.document_type}_${titleSlug}_${dateSlug}_${docId}.docx`;

    // Use fetch directly for binary download
    const { appId, token, appBaseUrl, functionsVersion } = appParams;
    const baseUrl = appBaseUrl || '';
    const version = functionsVersion || 'v1';
    const funcUrl = `${baseUrl}/api/${version}/apps/${appId}/functions/exportDocx`;

    const res = await fetch(funcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}`, 'x-access-token': token } : {}),
      },
      body: JSON.stringify({
        docData: {
          document_type: doc.document_type,
          title: doc.title,
          organisation_name: doc.organisation_name,
          project_name: doc.project_name,
          industry: doc.industry,
          procurement_id: docId,
          questionnaire_data: doc.questionnaire_data || {},
        },
        content,
      }),
    });

    if (!res.ok) {
      console.error('DOCX fetch error:', res.status);
      setExportingDocx(false);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setExportingDocx(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-8"
        style={{ background: 'rgba(8,13,36,0.95)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-white">Export Document</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!hasContent && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-400/30 px-4 py-3 mb-5 text-sm text-amber-300"
            style={{ background: 'rgba(245,158,11,0.07)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            No content found. Please generate the document first.
          </div>
        )}

        <div className="rounded-xl border border-white/10 p-4 mb-6 space-y-2 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {[
            ['Document type', DOC_TYPE_LABELS[doc.document_type] || doc.document_type],
            ['Title', doc.title],
            ['Organisation', doc.organisation_name || '—'],
            ['Document ID', docId],
            ['Sections', Object.keys(content).filter(k => content[k]).length],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-blue-200/50">{label}</span>
              <span className="font-medium text-white truncate ml-4 max-w-[60%] font-mono text-xs">{val}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleExportDocx}
            disabled={exportingDocx || exportingPdf || !hasContent}
            className="w-full gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50"
          >
            {exportingDocx
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating Word file...</>
              : <><FileText className="w-4 h-4" />Download as Word (.docx)</>}
          </Button>

          <Button
            onClick={handleExportPDF}
            disabled={exportingPdf || exportingDocx || !hasContent}
            className="w-full gap-2 text-white border-0 disabled:opacity-50"
            style={{ backgroundColor: '#00C9A7' }}
          >
            {exportingPdf
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating PDF...</>
              : <><FileDown className="w-4 h-4" />Download as PDF</>}
          </Button>

          <Button variant="ghost" onClick={onClose}
            className="w-full text-white/40 hover:text-white hover:bg-white/10">
            Cancel
          </Button>
        </div>

        <p className="text-xs text-blue-200/30 text-center mt-4">
          Filename: {doc.document_type}_{(doc.project_name || doc.title || 'Document').replace(/\s+/g, '-').slice(0, 20)}_{new Date().toISOString().slice(0,10).replace(/-/g,'')}_{docId}
        </p>
      </div>
    </div>
  );
}