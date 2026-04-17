import { base44 } from '@/api/base44Client';

const SOW_PROMPT = (data) => `You are an expert procurement consultant. Generate a comprehensive, professional Scope of Work (SOW) document for the following project.

Organisation: ${data.organisation_name || 'N/A'}
Project Name: ${data.project_name || 'N/A'}
Industry: ${data.industry || 'N/A'}
Background: ${data.background || 'N/A'}
Objectives: ${data.objectives || 'N/A'}
Scope: ${data.scope_description || 'N/A'}
Deliverables: ${data.deliverables || 'N/A'}
Timeline: ${data.timeline || 'N/A'}
Budget: ${data.budget || 'N/A'}
Constraints: ${data.constraints || 'N/A'}
Payment Terms: ${data.payment_terms || 'N/A'}
Contact: ${data.contact_name || 'N/A'} (${data.contact_email || 'N/A'})

Generate a complete, well-structured SOW document with the following sections. Each section should be detailed and professional, using formal procurement language appropriate for ${data.industry || 'business'}.`;

const EOI_PROMPT = (data) => `You are an expert procurement consultant. Generate a professional Expression of Interest (EOI) document.

Organisation: ${data.organisation_name || 'N/A'}
Project: ${data.project_name || 'N/A'}
Industry: ${data.industry || 'N/A'}
Opportunity: ${data.opportunity_overview || 'N/A'}
Capabilities Required: ${data.required_capabilities || 'N/A'}
Submission Requirements: ${data.submission_requirements || 'N/A'}
Closing Date: ${data.closing_date || 'N/A'}
Evaluation Criteria: ${data.evaluation_criteria || 'N/A'}
Budget Indication: ${data.budget_indication || 'N/A'}
Further Process: ${data.further_process || 'N/A'}

Generate a complete, professional EOI document ready for release to market.`;

const RFQ_PROMPT = (data) => `You are an expert procurement consultant. Generate a professional Request for Quotation (RFQ) document.

Organisation: ${data.organisation_name || 'N/A'}
Project: ${data.project_name || 'N/A'}
Industry: ${data.industry || 'N/A'}
Goods/Services: ${data.goods_services || 'N/A'}
Specifications: ${data.specifications || 'N/A'}
Delivery Location: ${data.delivery_location || 'N/A'}
Delivery Date: ${data.delivery_date || 'N/A'}
Quote Validity: ${data.quote_validity || 'N/A'}
Evaluation Criteria: ${data.evaluation_criteria || 'N/A'}
Closing Date: ${data.closing_date || 'N/A'}
Special Conditions: ${data.special_conditions || 'N/A'}

Generate a complete, professional RFQ document ready for release to market.`;

const RFP_PROMPT = (data) => `You are an expert procurement consultant. Generate a comprehensive Request for Proposal (RFP) document.

Organisation: ${data.organisation_name || 'N/A'}
Project: ${data.project_name || 'N/A'}
Industry: ${data.industry || 'N/A'}
Background: ${data.background || 'N/A'}
Objectives: ${data.objectives || 'N/A'}
Scope: ${data.scope || 'N/A'}
Proposal Requirements: ${data.proposal_requirements || 'N/A'}
Evaluation Criteria: ${data.evaluation_criteria || 'N/A'}
Budget: ${data.budget || 'N/A'}
Closing Date: ${data.closing_date || 'N/A'}
Contract Term: ${data.contract_term || 'N/A'}
Mandatory Requirements: ${data.mandatory_requirements || 'N/A'}

Generate a complete, professional RFP document ready for release to market.`;

const SECTION_SCHEMAS = {
  SOW: ['executive_summary', 'background', 'objectives', 'scope_of_work', 'deliverables', 'timeline', 'payment_schedule', 'responsibilities', 'constraints_and_assumptions', 'terms_and_conditions'],
  EOI: ['introduction', 'opportunity_overview', 'required_capabilities', 'submission_requirements', 'evaluation_criteria', 'process_and_timeline', 'terms_and_conditions'],
  RFQ: ['introduction', 'requirements', 'specifications', 'submission_instructions', 'evaluation_criteria', 'terms_and_conditions'],
  RFP: ['executive_summary', 'background_and_context', 'objectives', 'scope_of_work', 'proposal_requirements', 'evaluation_criteria', 'contract_terms', 'mandatory_requirements', 'submission_instructions', 'terms_and_conditions'],
};

export async function generateDocumentContent(docType, questionnaireData) {
  const promptFn = { SOW: SOW_PROMPT, EOI: EOI_PROMPT, RFQ: RFQ_PROMPT, RFP: RFP_PROMPT }[docType];
  const sections = SECTION_SCHEMAS[docType];

  const sectionProperties = {};
  sections.forEach(s => { sectionProperties[s] = { type: 'string' }; });

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: promptFn(questionnaireData) + `\n\nReturn JSON with these exact keys: ${sections.join(', ')}. Each value should be a well-written, detailed paragraph or multiple paragraphs suitable for a professional procurement document.`,
    response_json_schema: {
      type: 'object',
      properties: sectionProperties,
    },
    model: 'claude_sonnet_4_6',
  });

  return result;
}

export const SECTION_LABELS = {
  executive_summary: 'Executive Summary',
  background: 'Background',
  objectives: 'Objectives',
  scope_of_work: 'Scope of Work',
  deliverables: 'Deliverables',
  timeline: 'Timeline',
  payment_schedule: 'Payment Schedule',
  responsibilities: 'Roles & Responsibilities',
  constraints_and_assumptions: 'Constraints & Assumptions',
  terms_and_conditions: 'Terms & Conditions',
  introduction: 'Introduction',
  opportunity_overview: 'Opportunity Overview',
  required_capabilities: 'Required Capabilities',
  submission_requirements: 'Submission Requirements',
  evaluation_criteria: 'Evaluation Criteria',
  process_and_timeline: 'Process & Timeline',
  requirements: 'Requirements',
  specifications: 'Specifications',
  submission_instructions: 'Submission Instructions',
  background_and_context: 'Background & Context',
  proposal_requirements: 'Proposal Requirements',
  contract_terms: 'Contract Terms',
  mandatory_requirements: 'Mandatory Requirements',
  scope: 'Scope of Work',
};

export { SECTION_SCHEMAS };