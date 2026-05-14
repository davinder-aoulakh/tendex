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

const RFQ_PROMPT = (d) => {
  // Normalise keys — RFP stores answers with rfp_ prefix, remap to rfq_ for shared prompt
  const r = {};
  Object.entries(d).forEach(([k, v]) => {
    r[k.replace(/^rfp_/, 'rfq_')] = v;
  });

  const evalMap = {
    lowest_price: 'Lowest price that meets specifications',
    best_value:   'Best value — price and quality assessed',
    price_only:   'Price only — all specifications identical',
  };
  const paymentMap = {
    '30_days':  '30 days from invoice',
    '14_days':  '14 days from invoice',
    progress:   `Progress payments — milestone-based: ${r.rfq_payment_milestones || 'TBC'}`,
    deposit:    `Upfront deposit (${r.rfq_deposit_percent || 'TBC'}%) plus balance on completion`,
    negotiate:  'To be negotiated with successful supplier',
  };
  const validityLabel = r.rfq_validity === 'custom' ? (r.rfq_validity_custom || 'TBC') : `${r.rfq_validity || '30'} days`;
  const submissionMethod = r.rfq_submission_method === 'portal'
    ? `Via online portal: ${r.rfq_portal_url || 'TBC'}`
    : `By email to: ${r.rfq_contact_email || 'N/A'}`;

  const siteMeetingText = r.rfq_site_meeting === 'no' || !r.rfq_site_meeting
    ? 'No site meeting required.'
    : `${r.rfq_site_meeting === 'mandatory' ? 'MANDATORY' : 'Optional'} site inspection — ${r.rfq_site_meeting_date || 'TBC'} at ${r.rfq_site_meeting_time || 'TBC'}, ${r.rfq_site_meeting_address || 'TBC'}. ${r.rfq_site_meeting === 'mandatory' ? 'Non-attendance disqualifies the respondent.' : ''}`;

  const insuranceLines = Array.isArray(r.rfq_insurance_types)
    ? r.rfq_insurance_types.filter(t => t !== 'none').map(t => {
        const amtKey = `rfq_ins_${t}_amt`;
        const amt = r[amtKey];
        const labels = {
          public_liability: 'Public Liability', workers_comp: 'Workers Compensation',
          product_liability: 'Product Liability', professional_indemnity: 'Professional Indemnity',
          motor_vehicle: 'Motor Vehicle', ctp: 'CTP',
        };
        return `${labels[t] || t}${amt ? ` (min ${amt})` : ''}`;
      }).join('; ')
    : 'None specified';

  // Scope carried from SOW
  const scopeContent = d.summary_of_services || d.product_description || d.statement_of_requirements || 'Refer to specification section';

  return `You are an expert Australian procurement consultant. Generate a professional, formal Request for Quotation (RFQ) document suitable for release to market.

Organisation: ${d.organisation_name || 'N/A'}
Project / RFQ Reference: ${d.project_name || d.rfq_title || 'N/A'}
Industry: ${d.industry || d.procurement_type || 'N/A'}

=== SECTION DATA ===

SUBMISSION & CONTACT (Section 2 — Submission of Offer):
- Closing date & time: ${r.rfq_closing_date || 'N/A'} at ${r.rfq_closing_time || 'N/A'}
- Quotes addressed to: ${r.rfq_addressed_to || 'N/A'}
- Submission method: ${submissionMethod}

CONTACT PERSONS (Section 5):
- Query contact: ${r.rfq_contact_name || 'N/A'}, ${r.rfq_contact_title || 'N/A'}
- Email: ${r.rfq_contact_email || 'N/A'}
- Phone: ${r.rfq_contact_phone || 'N/A'}

REQUEST DETAILS (Section 6 — table):
- Organisation: ${d.organisation_name || 'N/A'}
- Commencement date: ${r.rfq_commencement_date || 'N/A'}
- Price variation: Fixed

OFFER VALIDITY (Section 3): ${validityLabel}

SITE MEETING (Section 4): ${siteMeetingText}

SPECIFICATION (Section 7 — full scope from SOW, do not ask user to re-enter):
${scopeContent}
Provider responsibilities: ${d.provider_responsibilities || 'As specified'}
Requester responsibilities: ${d.requester_responsibilities || 'As specified'}
Key deliverables: ${d.key_deliverables || 'N/A'}
Timeline: ${d.timeline || 'N/A'}

EVALUATION (feeds into Section 10):
- Evaluation method: ${evalMap[r.rfq_evaluation_method] || r.rfq_evaluation_method || 'Best value'}

COMMERCIAL TERMS (feeds into Section 10):
- Required licences/registrations: ${r.rfq_licences || 'None specified'}
- Insurance requirements: ${insuranceLines}
- Payment terms: ${paymentMap[r.rfq_payment_terms] || r.rfq_payment_terms || 'N/A'}

Generate all 10 sections in order. Use formal Australian government procurement language throughout. Each section must be 1–3 paragraphs of complete, professional prose. Do not use markdown headings inside the values.

For section 'request_conditions', write standard TendeX request conditions covering: no obligation to accept, right to reject all offers, no reimbursement of costs, confidentiality obligations, and the right to shortlist or negotiate.
For section 'identity_of_respondent', write a supplier completion statement (in table format described as prose) asking for: company name, ABN, registered address, contact name and title, phone and email, signature and date.
For section 'compliance_matrix', write a structured section covering pre-qualification requirements, evaluation criteria, qualitative requirements, insurance table (listing each required insurance with the minimum insured amount), and a pricing table template instruction.`;
};

const RFP_PROMPT = (d) => {
  // Remap rfp_ keys to rfq_ so the shared prompt builder works
  const remapped = { ...d };
  Object.entries(d).forEach(([k, v]) => {
    if (k.startsWith('rfp_')) remapped[k.replace(/^rfp_/, 'rfq_')] = v;
  });
  return RFQ_PROMPT(remapped)
    .replace(/Request for Quotation \(RFQ\)/g, 'Request for Proposal (RFP)')
    .replace(/\bRFQ\b/g, 'RFP');
};

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
  RFQ: ['background', 'submission_of_offer', 'offer_validity', 'site_meeting', 'contact_persons', 'request_details', 'specification', 'request_conditions', 'identity_of_respondent', 'compliance_matrix'],
  RFP: ['background', 'submission_of_offer', 'offer_validity', 'site_meeting', 'contact_persons', 'request_details', 'specification', 'request_conditions', 'identity_of_respondent', 'compliance_matrix'],
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
  offer_validity: 'Offer Validity Period',
  site_meeting: 'Mandatory Site Meeting',
  contact_persons: 'Contact Persons',
  request_details: 'Request Details',
  specification: 'Specification',
  request_conditions: 'Request Conditions',
  identity_of_respondent: 'Identity of Respondent',
  compliance_matrix: 'Pre-Qualification, Compliance & Evaluation',
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