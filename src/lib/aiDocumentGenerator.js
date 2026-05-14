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

const EOI_PROMPT = (d) => {
  const purposeMap = {
    understand_market:  'Understand what the market can offer',
    identify_suppliers: 'Identify and shortlist capable suppliers',
    refine_scope:       'Refine scope before issuing a formal request',
    all_of_the_above:   'Multiple objectives — understand market, identify suppliers, and refine scope',
  };
  const shortlistMap = {
    '2_3': '2–3 suppliers',
    '3_5': '3–5 suppliers',
    '5_plus': '5 or more suppliers',
    no_target: 'No set target — open to all capable suppliers',
  };
  const constraints = Array.isArray(d.eoi_constraints) ? d.eoi_constraints.join(', ') : 'None specified';
  const learningGoals = Array.isArray(d.eoi_learning_goals) ? d.eoi_learning_goals.join(', ') : 'N/A';
  const supplierReqs = Array.isArray(d.eoi_supplier_reqs) ? d.eoi_supplier_reqs.join(', ') : 'None specified';
  const submissionMethod = d.eoi_submission_method === 'portal'
    ? `Via online portal: ${d.eoi_portal_url || 'TBC'}`
    : `By email to: ${d.eoi_contact_email || 'N/A'}`;

  return `You are an expert Australian procurement consultant. Generate a professional, formal Expression of Interest (EOI) document suitable for public release.

Organisation: ${d.organisation_name || 'N/A'}
Project / Procurement: ${d.project_name || d.eoi_title || 'N/A'}
Industry / Scope: ${d.industry || d.procurement_type || 'N/A'}

EOI Purpose: ${purposeMap[d.eoi_primary_purpose] || d.eoi_primary_purpose || 'N/A'}
Constraints suppliers should know: ${constraints}${d.eoi_budget_ceiling ? ` — Budget ceiling: ${d.eoi_budget_ceiling}` : ''}

What we want to learn: ${learningGoals}
Shortlist target: ${shortlistMap[d.eoi_shortlist_target] || d.eoi_shortlist_target || 'N/A'}

Supplier requirements: ${supplierReqs}${d.eoi_licences_detail ? ` — Licences/registrations: ${d.eoi_licences_detail}` : ''}

Closing date: ${d.eoi_closing_date || 'N/A'} at ${d.eoi_closing_time || 'N/A'}
Responses addressed to: ${d.eoi_addressed_to || 'N/A'}
Contact for queries: ${d.eoi_contact_name || 'N/A'} — ${d.eoi_contact_email || 'N/A'}
Submission method: ${submissionMethod}

Scope of Work context (from previous SOW — always list as Attachment 1):
${d.summary_of_services || d.concept_details || d.product_description || 'Refer to Attachment 1 — Scope of Work'}

Provider responsibilities: ${d.provider_responsibilities || d.supplier_responsibilities || 'N/A'}
Requester responsibilities: ${d.requester_responsibilities || 'N/A'}
Timeline: ${d.timeline || 'N/A'}
Key deliverables: ${d.key_deliverables || 'N/A'}
Project milestones: ${JSON.stringify(d.milestones || [])}
Company representative: ${d.representative_name || d.eoi_addressed_to || 'N/A'}
Project start: ${d.project_start_date || 'N/A'}
Project end: ${d.project_end_date || 'N/A'}

Generate all 14 sections in order. Use formal Australian government procurement language throughout. Each section must be 1–3 paragraphs of complete, professional prose. Do not use markdown headings inside the values.

IMPORTANT: In the attachments_list section, always list "Attachment 1 — Scope of Work" as the first attachment.`;
};

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
  EOI: [
    'conditions_of_request',
    'confidentiality',
    'submission_lodgement',
    'shortlisting_statement',
    'evaluation_criteria',
    'respondent_information',
    'specification_introduction',
    'concept_description',
    'supplier_responsibilities',
    'project_milestones',
    'company_representative',
    'timeframe',
    'indicative_pricing',
    'attachments_list',
  ],
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
  shortlisting_statement: 'Shortlisting Statement',
  evaluation_criteria: 'Evaluation Criteria',
  respondent_information: 'Respondent Information',
  specification_introduction: 'Specification Introduction',
  concept_description: 'Concept Description',
  supplier_responsibilities: 'Supplier Responsibilities',
  project_milestones: 'Project Milestones',
  company_representative: 'Company Representative',
  timeframe: 'Project Timeframe',
  indicative_pricing: 'Indicative Pricing',
  attachments_list: 'Attachments',
  reporting: 'Reporting Requirements',
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