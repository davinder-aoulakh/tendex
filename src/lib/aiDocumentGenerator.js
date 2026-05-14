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

Scope of Work context (from previous SOW or uploaded document — always list as Attachment 1):
${d.own_scope_document ? `[User uploaded their own scope document: ${d.own_scope_document}]` : (d.summary_of_services || d.concept_details || d.product_description || 'Refer to Attachment 1 — Scope of Work')}

Provider responsibilities: ${d.provider_responsibilities || d.supplier_responsibilities || 'As per Attachment 1'}
Requester responsibilities: ${d.requester_responsibilities || 'As per Attachment 1'}
Timeline: ${d.timeline || 'As per Attachment 1'}
Key deliverables: ${d.key_deliverables || 'As per Attachment 1'}
Project milestones: ${JSON.stringify(d.milestones || [])}
Company representative: ${d.representative_name || d.eoi_addressed_to || 'N/A'}
Project start: ${d.project_start_date || 'N/A'}
Project end: ${d.project_end_date || 'N/A'}

Generate all 14 sections in order. Use formal Australian government procurement language throughout. Each section must be 1–3 paragraphs of complete, professional prose. Do not use markdown headings inside the values.

IMPORTANT: In the attachments_list section, always list "Attachment 1 — Scope of Work" as the first attachment. ${d.own_scope_document ? 'This is the user\'s uploaded scope document.' : ''}`;
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

SPECIFICATION (Section 7 — full scope from SOW or uploaded document, do not ask user to re-enter):
${d.own_scope_document ? `[User uploaded their own scope document: ${d.own_scope_document}]` : scopeContent}
Provider responsibilities: ${d.provider_responsibilities || 'As specified in scope'}
Requester responsibilities: ${d.requester_responsibilities || 'As specified in scope'}
Key deliverables: ${d.key_deliverables || 'As specified in scope'}
Timeline: ${d.timeline || 'As specified in scope'}

EVALUATION (feeds into Section 10):
- Evaluation method: ${evalMap[r.rfq_evaluation_method] || r.rfq_evaluation_method || 'Best value'}

COMMERCIAL TERMS (feeds into Section 10):
- Required licences/registrations: ${r.rfq_licences || 'None specified'}
- Insurance requirements: ${insuranceLines}
- Payment terms: ${paymentMap[r.rfq_payment_terms] || r.rfq_payment_terms || 'N/A'}

Generate all 10 sections in order. Use formal Australian government procurement language throughout. Each section must be 1–3 paragraphs of complete, professional prose. Do not use markdown headings inside the values.

${d.own_scope_document ? 'NOTE: The user has uploaded their own scope document. Reference it as "Attachment 1 — Scope of Work" throughout this RFQ.' : ''}

For section 'request_conditions', write standard TendeX request conditions covering: no obligation to accept, right to reject all offers, no reimbursement of costs, confidentiality obligations, and the right to shortlist or negotiate.
For section 'identity_of_respondent', write a supplier completion statement (in table format described as prose) asking for: company name, ABN, registered address, contact name and title, phone and email, signature and date.
For section 'compliance_matrix', write a structured section covering pre-qualification requirements, evaluation criteria, qualitative requirements, insurance table (listing each required insurance with the minimum insured amount), and a pricing table template instruction.`;
};

const RFP_PROMPT = (d) => {
  const r = d; // RFP keys are already rfp_ prefixed

  const paymentMap = {
    '30_days':  '30 days from invoice',
    '14_days':  '14 days from invoice',
    progress:   `Progress payments — milestone-based: ${r.rfp_payment_milestones || 'TBC'}`,
    deposit:    `Upfront deposit (${r.rfp_deposit_percent || 'TBC'}%) plus balance on completion`,
    negotiate:  'To be negotiated with successful supplier',
  };
  const validityLabel = r.rfp_validity === 'custom' ? (r.rfp_validity_custom || 'TBC') : `${r.rfp_validity || '60'} days`;
  const submissionMethod = r.rfp_submission_method === 'portal'
    ? `Via online portal: ${r.rfp_portal_url || 'TBC'}`
    : `By email to: ${r.rfp_contact_email || 'N/A'}`;

  const briefingText = r.rfp_briefing_session === 'no' || !r.rfp_briefing_session
    ? 'No briefing session required.'
    : `${r.rfp_briefing_session === 'mandatory' ? 'MANDATORY' : 'Optional'} briefing session — ${r.rfp_briefing_date || 'TBC'} at ${r.rfp_briefing_time || 'TBC'}, ${r.rfp_briefing_location || 'TBC'}. ${r.rfp_briefing_session === 'mandatory' ? 'Non-attendance disqualifies the respondent.' : ''}`;

  const insuranceLines = Array.isArray(r.rfp_insurance_types)
    ? r.rfp_insurance_types.filter(t => t !== 'none').map(t => {
        const amtKey = `rfp_ins_${t}_amt`;
        const amt = r[amtKey];
        const labels = {
          public_liability: 'Public Liability', workers_comp: 'Workers Compensation',
          product_liability: 'Product Liability', professional_indemnity: 'Professional Indemnity',
          motor_vehicle: 'Motor Vehicle', ctp: 'CTP',
        };
        return `${labels[t] || t}${amt ? ` (min ${amt})` : ''}`;
      }).join('; ')
    : 'None specified';

  // Weighted criteria table
  const criteriaRanking = r.rfp_criteria_ranking || {};
  const criteriaWeightings = r.rfp_criteria_weightings || {};
  const criteriaLabels = {
    price: 'Price and value for money',
    experience: 'Demonstrated experience in similar work',
    methodology: 'Quality of proposed approach or methodology',
    team: 'Team capability and key personnel',
    timeline: 'Ability to meet the timeline',
    values: 'Alignment with our values or culture',
  };
  const rankingOrder = Array.isArray(criteriaRanking) ? criteriaRanking : Object.keys(criteriaLabels);
  const criteriaTable = rankingOrder
    .map(id => `${criteriaLabels[id] || id} | ${criteriaWeightings[id] || 'TBC'}%`)
    .join('\n');

  // IP ownership
  const ipMap = {
    client_owns:    'All intellectual property created through this engagement vests in our organisation upon creation.',
    supplier_owns:  'The supplier retains ownership of all intellectual property. Our organisation receives a perpetual, royalty-free licence to use the deliverables.',
    shared:         'Intellectual property ownership and licencing arrangements will be negotiated and agreed at the contract stage.',
    not_applicable: 'No intellectual property is expected to be created through this engagement.',
  };

  // Declarations
  const declarations = Array.isArray(r.rfp_declarations)
    ? r.rfp_declarations.filter(d => d !== 'none').map(d => ({
        conflict_of_interest: 'Conflict of interest declaration',
        criminal_convictions: 'Criminal convictions declaration',
        subcontracting: 'Subcontracting disclosure',
      }[d] || d)).join('; ')
    : 'None required';

  // Scope carried from SOW
  const scopeContent = d.summary_of_services || d.product_description || d.statement_of_requirements || 'Refer to specification section';

  const pricingStructureMap = {
    lump_sum: 'Lump sum (fixed price)',
    schedule_of_rates: 'Schedule of rates',
    not_specified: 'Open to supplier — any pricing structure accepted',
  };

  return `You are an expert Australian procurement consultant. Generate a professional, formal Request for Proposal (RFP) document suitable for release to market.

Organisation: ${d.organisation_name || 'N/A'}
Project / RFP Reference: ${d.project_name || 'N/A'}
Industry: ${d.industry || d.procurement_type || 'N/A'}

=== SECTION DATA ===

SUBMISSION & CONTACT (Section 2 — Submission of Offer):
- Closing date & time: ${r.rfp_closing_date || 'N/A'} at ${r.rfp_closing_time || 'N/A'}
- Proposals addressed to: ${r.rfp_addressed_to || 'N/A'}
- Submission method: ${submissionMethod}

CONTACT PERSONS (Section 5):
- Query contact: ${r.rfp_contact_name || 'N/A'}, ${r.rfp_contact_title || 'N/A'}
- Email: ${r.rfp_contact_email || 'N/A'}
- Phone: ${r.rfp_contact_phone || 'N/A'}

REQUEST DETAILS (Section 6):
- Organisation: ${d.organisation_name || 'N/A'}
- Commencement date: ${r.rfp_commencement_date || 'N/A'}
- Pricing structure: ${pricingStructureMap[r.rfp_pricing_structure] || 'N/A'}
- Payment terms: ${paymentMap[r.rfp_payment_terms] || r.rfp_payment_terms || 'N/A'}

OFFER VALIDITY (Section 3): ${validityLabel}

BRIEFING SESSION (Section 4): ${briefingText}

SPECIFICATION (Section 7 — full scope from SOW or uploaded document, do not ask user to re-enter):
${d.own_scope_document ? `[User uploaded their own scope document: ${d.own_scope_document}]` : scopeContent}
Provider responsibilities: ${d.provider_responsibilities || 'As specified in scope'}
Requester responsibilities: ${d.requester_responsibilities || 'As specified in scope'}
Key deliverables: ${d.key_deliverables || 'As specified in scope'}
Timeline: ${d.timeline || 'As specified in scope'}

EVALUATION MATRIX (Section 7 — weighted criteria table):
Criterion | Weighting %
${criteriaTable}

QUALITATIVE REQUIREMENTS (Section 8):
- Case studies required: ${r.rfp_case_studies === 'yes' ? `Yes — ${r.rfp_case_studies_count || '2'} case study/studies, referees ${r.rfp_case_studies_referees === 'yes' ? 'required' : 'not required'}` : 'No'}
- Methodology response required: ${r.rfp_methodology === 'yes' ? 'Yes' : 'No'}
${r.rfp_methodology === 'yes' && r.rfp_methodology_question ? `- Methodology question: "${r.rfp_methodology_question}"` : ''}
- Key personnel required: ${r.rfp_key_personnel === 'yes' ? 'Yes — suppliers must name key personnel and provide qualifications' : 'No'}

COMPLIANCE (Section 6):
- Required licences/registrations: ${r.rfp_licences || 'None specified'}
- Insurance requirements: ${insuranceLines}
- IP ownership: ${ipMap[r.rfp_ip_ownership] || 'Not specified'}
- Modern slavery declaration: ${r.rfp_modern_slavery === 'yes' ? 'Required' : 'Not required'}
- Privacy/data handling clause: ${r.rfp_privacy === 'yes' ? 'Required — supplier will access personal/sensitive information' : 'Not required'}
- Required declarations: ${declarations}

Generate all 10 sections in order. Use formal Australian government procurement language throughout. Each section must be 1–3 paragraphs of complete, professional prose. Do not use markdown headings inside the values.

${d.own_scope_document ? 'NOTE: The user has uploaded their own scope document. Reference it as "Attachment 1 — Scope of Work" throughout this RFP.' : ''}

For section 'background': introduce the organisation and the purpose of this RFP.
For section 'submission_of_offer': detail submission requirements, closing date/time, format, and addressing.
For section 'offer_validity': state the validity period and conditions.
For section 'site_meeting': write the briefing session details: ${briefingText}
For section 'contact_persons': list contact details for queries.
For section 'request_details': include evaluation matrix table (Criterion | Weighting % | Description) based on the weighted criteria above. If pricing structure is Schedule of Rates, note that suppliers must complete a Schedule of Rates table.
For section 'specification': write the full scope of work, responsibilities, deliverables, timeline, and qualitative requirements (case studies, methodology, key personnel as applicable). Include IP ownership clause: ${ipMap[r.rfp_ip_ownership] || ''}. ${r.rfp_privacy === 'yes' ? 'Include a privacy and data handling clause requiring compliance with applicable privacy legislation.' : ''} ${r.rfp_modern_slavery === 'yes' ? 'Include a modern slavery compliance declaration requiring the supplier to confirm their supply chain is free from modern slavery.' : ''}
For section 'request_conditions': write standard TendeX request conditions covering: no obligation to accept, right to reject all offers, no reimbursement of costs, confidentiality obligations, and the right to shortlist or negotiate.
For section 'identity_of_respondent': write a supplier completion statement (described as prose) asking for: company name, ABN, registered address, contact name and title, phone and email, required declarations (${declarations}), signature and date.
For section 'compliance_matrix': write a structured section covering pre-qualification requirements, insurance table (listing each required insurance with minimum amounts), ${r.rfp_pricing_structure === 'schedule_of_rates' ? 'a schedule of rates table template instruction (item, unit of measure, rate per unit, estimated quantity, total)' : 'a lump sum pricing table template instruction'}. Include evaluation criteria weightings summary.`;
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