import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, Pencil, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

/**
 * AI Assist 4 — Full Scope of Work Document Generation (S7)
 * Shown after all SOW questions (before scope scoring).
 * Generates the complete 8-section SOW inline for review and editing.
 * User must click "Confirm scope and continue" to proceed to scoring.
 */

const SECTIONS = [
  { key: 'statement_of_requirements', label: '1. Statement of Requirements' },
  { key: 'specification',             label: '2. Specification' },
  { key: 'standards_compliance',      label: '3. Standards and Compliance Requirements' },
  { key: 'delivery_schedule',         label: '4. Delivery Schedule' },
  { key: 'qualitative_requirements',  label: '5. Qualitative Requirements' },
  { key: 'price_schedule',            label: '6. Price Schedule' },
  { key: 'known_suppliers',           label: '7. Known Suppliers' },
  { key: 'signature_blocks',          label: '8. Signature Blocks' },
];

function EditableSection({ label, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</h4>
        <button
          onClick={() => setEditing(e => !e)}
          className="flex items-center gap-1 text-xs transition-colors" style={{ color: 'var(--text-muted)' }}
        >
          {editing ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Pencil className="w-3 h-3" />}
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <Textarea
          value={draft}
          onChange={e => { setDraft(e.target.value); onChange(e.target.value); }}
          className="min-h-[100px] text-sm resize-none font-mono text-xs leading-relaxed focus-visible:ring-1"
          style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      ) : (
        <div className="rounded-xl border p-4 text-sm leading-relaxed whitespace-pre-wrap"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          {value || <span className="italic" style={{ color: 'var(--text-muted)' }}>Empty</span>}
        </div>
      )}
    </div>
  );
}

export default function SOWDocumentReview({ answers, onConfirm, onBack }) {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState(null);

  useEffect(() => {
    if (!sections) generate();
  }, []);

  const generate = async () => {
    setLoading(true);
    setSections(null);

    const goodsList = answers.product_description
      ? `Item: ${answers.product_description}\nQuantity: ${answers.quantity || '—'} ${answers.quantity_unit || ''}\nSpecs: ${answers.technical_specs || '—'}\nWarranty: ${answers.warranty_description || '—'}`
      : '';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior Australian procurement officer. Generate a complete, professional Scope of Work document using the procurement details below.

--- PROCUREMENT DETAILS ---
Organisation: ${answers.organisation_name || '—'}
Project Name: ${answers.project_name || '—'}
Procurement Type: ${answers.procurement_type || '—'}
Purchase Type: ${answers.purchase_type || '—'}
Scope Purpose (AI-drafted): ${answers._scope_purpose || '—'}

GOODS:
${goodsList || 'N/A'}
Product Size: ${answers.product_size || '—'}
Material/Colour: ${answers.material_colour || '—'}
Customisation: ${answers.customisation || '—'}
Packaging: ${answers.packaging || '—'}
Delivery: ${answers.include_delivery ? (answers.delivery_address || 'Yes') : 'Not required'}
Delivery Date: ${answers.delivery_date || '—'}

SERVICES:
Service Type: ${answers.service_type || 'N/A'}
Construction Type: ${answers.construction_type || '—'}
Summary: ${answers.summary_of_services || '—'}
Provider Responsibilities: ${answers.provider_responsibilities || '—'}
Requester Responsibilities: ${answers.requester_responsibilities || '—'}
Timeline: ${answers.timeline || '—'}
Key Deliverables: ${answers.key_deliverables || '—'}
Key Personnel: ${answers.key_personnel || '—'}
Additional Info: ${answers.additional_info || '—'}

COMBINED:
Combined Scope: ${answers.combined_scope_description || '—'}
Primary Outcome: ${answers.combined_primary_outcome || '—'}

SUPPLIER:
Supplier Name: ${answers.supplier_name || 'None specified'}
Supplier Contact: ${answers.supplier_contact || '—'}
Supplier Email: ${answers.supplier_email || '—'}
Supplier Phone: ${answers.supplier_phone || '—'}

--- OUTPUT INSTRUCTIONS ---
Generate each of these 8 sections as professional, formal Australian procurement text.

1. statement_of_requirements: 2–3 paragraphs summarising what is being procured and why, using the scope purpose and project context.
2. specification: Detailed specification of goods and/or services. For goods, include item name, quantity, specs, dimensions, material. For services, include detailed scope description, methodology expectations.
3. standards_compliance: List relevant Australian standards, compliance requirements, licensing, WHS obligations, and any technical standards relevant to this procurement type and industry. Be specific.
4. delivery_schedule: Timeline, key milestones, delivery date, commencement date, and any phasing. Structure as clear paragraphs or a descriptive schedule.
5. qualitative_requirements: A professional paragraph describing the non-price criteria the supplier must demonstrate: capacity, experience, personnel qualifications, methodology, references.
6. price_schedule: A plain-text table formatted for a Scope of Work document. Columns: Item Description | Quantity | Unit | Unit Price (ex GST) | Total Price (ex GST). Pre-fill known items with quantities. Leave price columns blank for supplier to complete. Include a row for GST and Total. Format as a readable text table.
7. known_suppliers: If a supplier is named, list their details. If not, write "No known suppliers identified. This Scope of Work will be issued via open or select tender."
8. signature_blocks: A formal signature block with: Prepared by (name/title/date/signature line), Reviewed by (name/title/date/signature line), Approved by (name/title/date/signature line). Format as readable plain text.

Write in formal, professional Australian English. Do not use markdown headers — plain text only within each field.`,
      response_json_schema: {
        type: 'object',
        properties: {
          statement_of_requirements: { type: 'string' },
          specification:             { type: 'string' },
          standards_compliance:      { type: 'string' },
          delivery_schedule:         { type: 'string' },
          qualitative_requirements:  { type: 'string' },
          price_schedule:            { type: 'string' },
          known_suppliers:           { type: 'string' },
          signature_blocks:          { type: 'string' },
        },
      },
      model: 'claude_sonnet_4_6',
    });

    setSections(result);
    setLoading(false);
  };

  const updateSection = (key, val) => {
    setSections(prev => ({ ...prev, [key]: val }));
  };

  const handleConfirm = () => {
    onConfirm(sections);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-blue-400/30 p-5" style={{ background: 'rgba(59,130,246,0.07)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-blue-300">AI-Generated Scope of Work</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Review and edit each section below. Click "Confirm scope and continue" when you're ready to proceed to document type selection.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-sm text-blue-200/50">Generating your Scope of Work...</p>
          <p className="text-xs text-blue-200/30">This may take 20–30 seconds</p>
        </div>
      ) : sections ? (
        <>
          <div className="space-y-6">
            {SECTIONS.map(sec => (
              <EditableSection
                key={sec.key}
                label={sec.label}
                value={sections[sec.key]}
                onChange={val => updateSection(sec.key, val)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t flex-wrap gap-3" style={{ borderColor: 'var(--border)' }}>
            <Button
              variant="ghost"
              onClick={generate}
              disabled={loading}
              className="gap-2 hover-muted" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <Sparkles className="w-4 h-4" /> Regenerate
            </Button>
            <Button
              size="lg"
              onClick={handleConfirm}
              className="gap-2 px-8 bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-lg shadow-blue-500/20"
            >
              Confirm scope and continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}