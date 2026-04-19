import { base44 } from '@/api/base44Client';

// ─────────────────────────────────────────────
// Prompt builders — map Phase 1 questionnaire data
// ─────────────────────────────────────────────

const SOW_PROMPT = (d) => `You are an expert Australian procurement consultant. Generate a comprehensive, professional Scope of Work (SOW) document.

Organisation: ${d.organisation_name || 'N/A'}
Project Name: ${d.project_name || 'N/A'}
Procurement Type: ${d.procurement_type || 'N/A'}
Service Type: ${d.service_type || 'N/A'}
Summary of Services: ${d.summary_of_services || 'N/A'}
Provider Responsibilities: ${d.provider_responsibilities || 'N/A'}
Requester Responsibilities: ${d.requester_responsibilities || 'N/A'}
Timeline: ${d.timeline || 'N/A'}
Key Deliverables: ${d.key_deliverables || 'N/A'}
Key Personnel: ${d.key_personnel || 'N/A'}
Product Description: ${d.product_description || 'N/A'}
Specifications: ${d.technical_specs || 'N/A'}
Quantity: ${d.quantity ? `${d.quantity} ${d.quantity_unit || 'units'}` : 'N/A'}
Delivery Address: ${d.delivery_address || 'N/A'}
Warranty Requirements: ${d.warranty_description || 'N/A'}
Supplier: ${d.supplier_name || 'N/A'}
Additional Info: ${d.additional_info || 'N/A'}

Write a formal, professional SOW suitable for release to a supplier. Use clear, unambiguous procurement language. Each section should be 1-3 detailed paragraphs.`;

const EOI_PROMPT = (d) => `You are an expert Australian procurement consultant. Generate a professional Expression of Interest (EOI) document.

Organisation: ${d.organisation_name || 'N/A'}
Contact Person: ${d.contact_name || 'N/A'}
Closing Date: ${d.closing_date || 'N/A'}
Submission Email: ${d.submission_email || 'N/A'}
Concept Details: ${d.concept_details || 'N/A'}
Supplier Responsibilities: ${d.supplier_responsibilities || 'N/A'}
Company Representative: ${d.representative_name || 'N/A'}
Reporting Requirements: ${d.reporting_requirements || 'N/A'}
Project Start: ${d.project_start_date || 'N/A'}
Project End: ${d.project_end_date || 'N/A'}
Milestones: ${JSON.stringify(d.milestones || [])}

Write a formal EOI document appropriate for release to the Australian market. Each section should be professional and complete.`;

const RFQ_PROMPT = (d) => `You are an expert Australian procurement consultant. Generate a professional Request for Quotation (RFQ) document.

Organisation: ${d.organisation_name || d.company_name || 'N/A'}
RFQ Title: ${d.rfq_title || d.project_name || 'N/A'}
ABN: ${d.abn || 'N/A'}
Registered Address: ${d.registered_address || 'N/A'}
Contact: ${d.contact_name || 'N/A'}, ${d.contact_title || 'N/A'} — ${d.contact_email || 'N/A'}
Submission Contact: ${d.submission_contact_name || 'N/A'} — ${d.submission_email || 'N/A'}
Closing Date: ${d.closing_date || 'N/A'}
Commencement Date: ${d.commencement_date || 'N/A'}
Validity Period: ${d.validity_period || 'N/A'} months
Price Variation: ${d.price_variation || 'fixed'}
Insurance Required: ${JSON.stringify(d.insurance_types || [])}
Mandatory Site Meeting: ${d.mandatory_site_meeting ? 'Yes — ' + (d.site_meeting_details || '') : 'No'}
Contract Manager: ${d.contract_manager || 'N/A'}
Pre-Qualification Requirements: ${JSON.stringify(d.prequalification_reqs || [])}
Statement of Requirements: ${d.statement_of_requirements || 'N/A'}

Write a formal RFQ document ready for release to market. Use professional procurement language throughout.`;

const RFP_PROMPT = (d) => RFQ_PROMPT(d).replace('Request for Quotation (RFQ)', 'Request for Proposal (RFP)').replace('RFQ Title', 'RFP Title');

// ─────────────────────────────────────────────
// Section schemas & labels
// ─────────────────────────────────────────────

export const SECTION_SCHEMAS = {
  SOW: ['executive_summary', 'background', 'objectives', 'scope_of_work', 'deliverables', 'timeline', 'payment_schedule', 'responsibilities', 'constraints_and_assumptions', 'terms_and_conditions'],
  EOI: ['introduction', 'opportunity_overview', 'conditions_of_request', 'confidentiality', 'submission_lodgement', 'evaluation_criteria', 'specification', 'project_milestones', 'reporting', 'timeframe', 'terms_and_conditions'],
  RFQ: ['introduction', 'background', 'submission_of_offer', 'offer_validity', 'contact_persons', 'selection_process', 'statement_of_requirements', 'insurance_requirements', 'pre_qualification', 'evaluation_criteria', 'pricing_schedule'],
  RFP: ['introduction', 'background', 'submission_of_offer', 'offer_validity', 'contact_persons', 'selection_process', 'statement_of_requirements', 'proposal_requirements', 'insurance_requirements', 'pre_qualification', 'evaluation_criteria', 'pricing_schedule'],
};

export const SECTION_LABELS = {
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

// ─────────────────────────────────────────────
// Main generation function
// ─────────────────────────────────────────────

export async function generateDocumentContent(docType, questionnaireData) {
  const promptFn = { SOW: SOW_PROMPT, EOI: EOI_PROMPT, RFQ: RFQ_PROMPT, RFP: RFP_PROMPT }[docType];
  const sections = SECTION_SCHEMAS[docType];

  const sectionProperties = {};
  sections.forEach(s => { sectionProperties[s] = { type: 'string' }; });

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: promptFn(questionnaireData) + `\n\nReturn JSON with these exact keys: ${sections.join(', ')}. Each value must be a complete, professionally written section (1-3 paragraphs). Do not use markdown headings inside the values — plain prose only.`,
    response_json_schema: { type: 'object', properties: sectionProperties },
    model: 'claude_sonnet_4_6',
  });

  // Unwrap nested { response: { ... } } if the LLM returned that structure
  if (result && result.response && typeof result.response === 'object') {
    return result.response;
  }
  return result;
}

// ─────────────────────────────────────────────
// AI Field Enhancement
// ─────────────────────────────────────────────

export async function enhanceField(fieldLabel, rawText, docType) {
  if (!rawText || rawText.trim().length < 30) return rawText;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a procurement document writing assistant for small businesses in Australia.
The user has typed a rough description for the "${fieldLabel}" field of a formal ${docType} procurement document.
Rewrite their text to be:
- Professional and formal in tone
- Clear and unambiguous
- Appropriate for a formal Australian procurement document
- Between 2-5 sentences for short fields; 1-3 paragraphs for longer fields
Do not add headings. Do not invent specific facts like prices or dates. Return only the enhanced text.

User's text: "${rawText}"`,
    model: 'gpt_5_mini',
  });

  return typeof result === 'string' ? result : rawText;
}