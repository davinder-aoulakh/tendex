import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TableRow, TableCell, Table,
  WidthType, PageBreak, Header, Footer, ImageRun,
} from 'npm:docx@8.5.0';

const SECTION_LABELS = {
  executive_summary: 'Executive Summary',
  background: 'Background',
  objectives: 'Objectives',
  scope_of_work: 'Scope of Work',
  deliverables: 'Key Deliverables',
  timeline: 'Timeline',
  payment_schedule: 'Payment Schedule',
  responsibilities: 'Roles & Responsibilities',
  constraints_and_assumptions: 'Constraints & Assumptions',
  terms_and_conditions: 'Terms & Conditions',
  introduction: 'Introduction',
  opportunity_overview: 'Opportunity Overview',
  conditions_of_request: 'Conditions of Request',
  confidentiality: 'Confidentiality',
  submission_lodgement: 'Submission Lodgement',
  evaluation_criteria: 'Evaluation Criteria',
  specification: 'Specification',
  project_milestones: 'Project Milestones',
  reporting: 'Reporting Requirements',
  timeframe: 'Project Timeframe',
  submission_of_offer: 'Submission of Offer',
  offer_validity: 'Offer Validity',
  contact_persons: 'Contact Persons',
  selection_process: 'Selection Process',
  statement_of_requirements: 'Statement of Requirements',
  insurance_requirements: 'Insurance Requirements',
  pre_qualification: 'Pre-Qualification Requirements',
  pricing_schedule: 'Pricing Schedule',
  proposal_requirements: 'Proposal Requirements',
};

const SECTION_SCHEMAS = {
  SOW: ['executive_summary', 'background', 'objectives', 'scope_of_work', 'deliverables', 'timeline', 'payment_schedule', 'responsibilities', 'constraints_and_assumptions', 'terms_and_conditions'],
  EOI: ['introduction', 'opportunity_overview', 'conditions_of_request', 'confidentiality', 'submission_lodgement', 'evaluation_criteria', 'specification', 'project_milestones', 'reporting', 'timeframe', 'terms_and_conditions'],
  RFQ: ['introduction', 'background', 'submission_of_offer', 'offer_validity', 'contact_persons', 'selection_process', 'statement_of_requirements', 'insurance_requirements', 'pre_qualification', 'evaluation_criteria', 'pricing_schedule'],
  RFP: ['introduction', 'background', 'submission_of_offer', 'offer_validity', 'contact_persons', 'selection_process', 'statement_of_requirements', 'proposal_requirements', 'insurance_requirements', 'pre_qualification', 'evaluation_criteria', 'pricing_schedule'],
};

const DOC_TYPE_LABELS = {
  SOW: 'Scope of Work',
  EOI: 'Expression of Interest',
  RFQ: 'Request for Quotation',
  RFP: 'Request for Proposal',
};

// TendeX brand blue: #3B82F6 → RGB 59, 130, 246
const BRAND_COLOR = '3B82F6';
const DARK_COLOR = '0F172A';
const GRAY_COLOR = '64748B';

const EMU_PER_CM = 914400 / 2.54;
const PAGE_WIDTH_CM = 21.0;
const MARGIN_CM = 2.5;
const CONTENT_WIDTH_CM = PAGE_WIDTH_CM - MARGIN_CM * 2;

function makeHeaderParagraph(docData, docId, genDate, logoImageRun) {
  const leftChild = logoImageRun || new TextRun({
    text: 'Powered by TendeX',
    bold: true,
    size: 16,
    color: BRAND_COLOR,
  });
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_COLOR, space: 4 },
    },
    children: [
      leftChild,
      new TextRun({ text: '\t', size: 16 }),
      new TextRun({
        text: `${docId}  |  ${genDate}  |  ${DOC_TYPE_LABELS[docData.document_type] || docData.document_type}`,
        size: 16,
        color: GRAY_COLOR,
      }),
    ],
    tabStops: [{ type: 'right', position: Math.round(CONTENT_WIDTH_CM * EMU_PER_CM / 914.4) }],
  });
}

function makeFooterParagraph(docId, genDate) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0', space: 4 },
    },
    children: [
      new TextRun({
        text: `Powered by TendeX  •  tendex.com.au  •  Document ID: ${docId}  •  Generated: ${genDate}  •  Confidential`,
        size: 14,
        color: GRAY_COLOR,
      }),
    ],
  });
}

function makeCoverPage(docData, docId, genDate) {
  const docTypeLabel = (DOC_TYPE_LABELS[docData.document_type] || docData.document_type).toUpperCase();
  const isSow = docData.document_type === 'SOW';
  const children = [];

  // "Powered by TendeX" attribution
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000, after: 200 },
    children: [
      new TextRun({ text: 'POWERED BY ', size: 20, color: GRAY_COLOR }),
      new TextRun({ text: 'TendeX', size: 20, bold: true, color: BRAND_COLOR }),
    ],
  }));

  // Document type — large bold
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 400 },
    children: [
      new TextRun({
        text: docTypeLabel,
        bold: true,
        size: 72, // 36pt
        color: DARK_COLOR,
      }),
    ],
  }));

  // Blue accent line
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 12, color: BRAND_COLOR, space: 1 },
    },
    children: [new TextRun({ text: '' })],
  }));

  // Organisation name
  if (docData.organisation_name) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: `FOR ${docData.organisation_name}`, size: 28, color: GRAY_COLOR }),
      ],
    }));
  }

  // Key metadata fields
  if (!isSow) {
    const qd = docData.questionnaire_data || {};
    const metaRows = [
      ['Document ID', docId],
      ['Date Generated', genDate],
      ['Document Type', DOC_TYPE_LABELS[docData.document_type] || docData.document_type],
      ...(docData.industry ? [['Category', docData.industry]] : []),
      ...(qd.closing_date ? [['Closing Date', qd.closing_date]] : []),
      ...(qd.contact_name ? [['Contact Person', qd.contact_name]] : []),
    ];

    children.push(new Paragraph({ spacing: { before: 800, after: 0 }, children: [] }));

    const tableRows = metaRows.map(([label, val]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              children: [new TextRun({ text: label.toUpperCase(), bold: true, size: 18, color: DARK_COLOR })],
            })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              children: [new TextRun({ text: String(val || '—'), size: 18, color: GRAY_COLOR })],
            })],
          }),
        ],
      })
    );

    if (tableRows.length > 0) {
      children.push(new Table({
        width: { size: 80, type: WidthType.PERCENTAGE },
        rows: tableRows,
      }));
    }
  } else {
    // SOW — just show doc ID + date
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
      children: [
        new TextRun({ text: `Document ID: ${docId}   |   ${genDate}`, size: 22, color: GRAY_COLOR }),
      ],
    }));
  }

  // Page break after cover
  children.push(new Paragraph({
    children: [new PageBreak()],
  }));

  return children;
}

function makeSectionParagraphs(sectionKey, bodyText) {
  const label = SECTION_LABELS[sectionKey] || sectionKey;
  const paragraphs = [];

  // Section heading
  paragraphs.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_COLOR, space: 4 },
    },
    children: [
      new TextRun({ text: label.toUpperCase(), bold: true, size: 24, color: DARK_COLOR }),
    ],
  }));

  // Body paragraphs
  const blocks = String(bodyText).split(/\n\n+/).filter(Boolean);
  blocks.forEach(block => {
    paragraphs.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      style: 'Normal',
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: block.replace(/\n/g, ' '), size: 22, color: '334155' }),
      ],
    }));
  });

  return paragraphs;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { docData, content } = body;

    if (!docData || !content) {
      return Response.json({ error: 'Missing docData or content' }, { status: 400 });
    }

    const docId = docData.procurement_id || 'UNKNOWN';
    const genDate = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // ── Logo: fetch if available ─────────────────────────
    let logoImageRun = null;
    const logoUrl = docData.questionnaire_data?.logo_url || null;
    if (logoUrl) {
      const logoRes = await fetch(logoUrl).catch(() => null);
      if (logoRes && logoRes.ok) {
        const logoBuffer = await logoRes.arrayBuffer();
        const logoBytes = new Uint8Array(logoBuffer);
        const isJpeg = logoUrl.toLowerCase().includes('.jpg') || logoUrl.toLowerCase().includes('.jpeg');
        // Scale to ~50px height @ 96dpi → ~13mm; in EMU: 50*9144 = 457200 EMU height
        logoImageRun = new ImageRun({
          data: logoBytes,
          transformation: { width: 130, height: 40 }, // px
          type: isJpeg ? 'jpg' : 'png',
        });
      }
    }

    const sectionKeys = SECTION_SCHEMAS[docData.document_type] || [];
    const contentParagraphs = [];

    sectionKeys.forEach(key => {
      const text = content[key];
      if (!text || String(text).trim() === '') return;
      makeSectionParagraphs(key, text).forEach(p => contentParagraphs.push(p));
    });

    const coverChildren = makeCoverPage(docData, docId, genDate);

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            run: { font: 'Calibri', size: 22 },
            paragraph: { spacing: { line: 276 } },
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            run: { bold: true, size: 24, color: DARK_COLOR },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: Math.round(MARGIN_CM * 1440 / 2.54),
                bottom: Math.round(MARGIN_CM * 1440 / 2.54),
                left: Math.round(MARGIN_CM * 1440 / 2.54),
                right: Math.round(MARGIN_CM * 1440 / 2.54),
              },
            },
          },
          headers: {
            default: new Header({
              children: [makeHeaderParagraph(docData, docId, genDate, logoImageRun)],
            }),
          },
          footers: {
            default: new Footer({
              children: [makeFooterParagraph(docId, genDate)],
            }),
          },
          children: [...coverChildren, ...contentParagraphs],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    const titleSlug = (docData.project_name || docData.title || docData.organisation_name || 'Document')
      .replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '');
    const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${docData.document_type}_${titleSlug}_${dateSlug}_${docId}.docx`;

    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('DOCX export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});