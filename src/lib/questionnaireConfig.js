const commonFields = [
  { key: 'organisation_name', label: 'Organisation Name', type: 'text', placeholder: 'Your company or organisation', required: true },
  { key: 'project_name', label: 'Project Name', type: 'text', placeholder: 'e.g. Website Redevelopment Project', required: true },
  { key: 'industry', label: 'Industry / Sector', type: 'select', options: ['Technology & IT', 'Construction & Infrastructure', 'Healthcare', 'Education', 'Finance & Insurance', 'Retail & E-commerce', 'Professional Services', 'Government & Public Sector', 'Manufacturing', 'Other'], required: true },
  { key: 'contact_name', label: 'Contact Person', type: 'text', placeholder: 'Full name of procurement contact' },
  { key: 'contact_email', label: 'Contact Email', type: 'text', placeholder: 'procurement@yourorg.com' },
];

const sowFields = [
  ...commonFields,
  { key: 'background', label: 'Project Background', type: 'textarea', placeholder: 'Describe the context and reason for this project...', required: true },
  { key: 'objectives', label: 'Project Objectives', type: 'textarea', placeholder: 'What are the key goals and outcomes expected?', required: true },
  { key: 'scope_description', label: 'Scope Description', type: 'textarea', placeholder: 'Describe the work to be performed in detail...', required: true },
  { key: 'deliverables', label: 'Key Deliverables', type: 'textarea', placeholder: 'List the specific outputs or deliverables expected...' },
  { key: 'timeline', label: 'Project Timeline', type: 'text', placeholder: 'e.g. 3 months, start Jan 2027' },
  { key: 'budget', label: 'Budget Range (optional)', type: 'text', placeholder: 'e.g. $50,000 - $80,000' },
  { key: 'constraints', label: 'Constraints & Assumptions', type: 'textarea', placeholder: 'Any known constraints, risks, or assumptions...' },
  { key: 'payment_terms', label: 'Payment Terms', type: 'text', placeholder: 'e.g. Milestone-based, Net 30' },
];

const eoiFields = [
  ...commonFields,
  { key: 'opportunity_overview', label: 'Opportunity Overview', type: 'textarea', placeholder: 'Describe the opportunity you are inviting interest for...', required: true },
  { key: 'required_capabilities', label: 'Required Capabilities', type: 'textarea', placeholder: 'What skills, experience, or capabilities are you looking for?', required: true },
  { key: 'submission_requirements', label: 'Submission Requirements', type: 'textarea', placeholder: 'What should respondents include in their EOI?' },
  { key: 'closing_date', label: 'Closing Date', type: 'text', placeholder: 'e.g. 30 May 2027' },
  { key: 'evaluation_criteria', label: 'Evaluation Criteria', type: 'textarea', placeholder: 'How will EOI responses be assessed?' },
  { key: 'budget_indication', label: 'Budget Indication (optional)', type: 'text', placeholder: 'Indicative budget range if applicable' },
  { key: 'further_process', label: 'Further Process', type: 'textarea', placeholder: 'Describe what happens after EOI — e.g. shortlisting for RFP' },
];

const rfqFields = [
  ...commonFields,
  { key: 'goods_services', label: 'Goods / Services Required', type: 'textarea', placeholder: 'Describe in detail what you need priced...', required: true },
  { key: 'specifications', label: 'Technical Specifications', type: 'textarea', placeholder: 'Detailed specs, quantities, standards or requirements...' },
  { key: 'delivery_location', label: 'Delivery Location', type: 'text', placeholder: 'Where should goods/services be delivered?' },
  { key: 'delivery_date', label: 'Required Delivery Date', type: 'text', placeholder: 'e.g. By 15 March 2027' },
  { key: 'quote_validity', label: 'Quote Validity Period', type: 'text', placeholder: 'e.g. 30 days from submission' },
  { key: 'evaluation_criteria', label: 'Evaluation Criteria', type: 'textarea', placeholder: 'How will quotes be evaluated? Price, quality, lead time...' },
  { key: 'closing_date', label: 'Closing Date for Quotes', type: 'text', placeholder: 'e.g. 28 February 2027' },
  { key: 'special_conditions', label: 'Special Conditions', type: 'textarea', placeholder: 'Insurance, warranties, payment terms...' },
];

const rfpFields = [
  ...commonFields,
  { key: 'background', label: 'Background & Context', type: 'textarea', placeholder: 'Why is this proposal being sought? What problem are you solving?', required: true },
  { key: 'objectives', label: 'Objectives & Expected Outcomes', type: 'textarea', placeholder: 'What do you want to achieve?', required: true },
  { key: 'scope', label: 'Scope of Work', type: 'textarea', placeholder: 'Describe what the proposal must cover...', required: true },
  { key: 'proposal_requirements', label: 'Proposal Requirements', type: 'textarea', placeholder: 'Structure and content expected in proposals...' },
  { key: 'evaluation_criteria', label: 'Evaluation Criteria & Weightings', type: 'textarea', placeholder: 'e.g. Technical 40%, Price 30%, Experience 30%' },
  { key: 'budget', label: 'Budget Range (optional)', type: 'text', placeholder: 'Indicate available budget if appropriate' },
  { key: 'closing_date', label: 'Closing Date', type: 'text', placeholder: 'e.g. 15 April 2027' },
  { key: 'contract_term', label: 'Contract Term', type: 'text', placeholder: 'e.g. 12 months + 2 x 12 month options' },
  { key: 'mandatory_requirements', label: 'Mandatory Requirements', type: 'textarea', placeholder: 'Non-negotiable requirements vendors must meet...' },
];

export const getQuestions = (type) => {
  switch (type) {
    case 'SOW': return sowFields;
    case 'EOI': return eoiFields;
    case 'RFQ': return rfqFields;
    case 'RFP': return rfpFields;
    default: return sowFields;
  }
};