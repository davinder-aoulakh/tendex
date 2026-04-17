/**
 * Questionnaire configuration for TendeX.
 * Each document type is an array of PAGES (wizard steps).
 * Each page has: { id, title, description, fields[] }
 * Each field has: { key, label, type, required, placeholder, options, condition, helpText }
 *
 * Field types: text | textarea | select | date | radio-cards | toggle | checkbox-multi | milestone-table | number | email
 * condition: (answers) => boolean  — field/page is shown only when true
 */

// ─────────────────────────────────────────────
// SOW — Scope of Work
// ─────────────────────────────────────────────
export const SOW_PAGES = [
  {
    id: 'procurement_type',
    title: 'What type of procurement is this?',
    description: 'Select whether you are procuring goods or services.',
    fields: [
      {
        key: 'procurement_type',
        label: 'Procurement Type',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'goods', label: 'Goods', description: 'Physical products, equipment, or materials' },
          { value: 'services', label: 'Services', description: 'Professional services, labour, or expertise' },
        ],
      },
    ],
  },

  // ── GOODS PATH ──
  {
    id: 'goods_purchase_type',
    title: 'Purchase Type',
    description: 'How will you be purchasing these goods?',
    condition: (a) => a.procurement_type === 'goods',
    fields: [
      {
        key: 'purchase_type',
        label: 'Purchase Type',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'once_off', label: 'Once-Off Purchase', description: 'A single, one-time purchase' },
          { value: 'bulk', label: 'Wholesale / Bulk Purchase', description: 'Recurring or large-volume purchase' },
        ],
      },
    ],
  },
  {
    id: 'goods_delivery_warranty',
    title: 'Delivery & Warranty',
    description: 'Tell us about delivery and warranty requirements.',
    condition: (a) => a.procurement_type === 'goods',
    fields: [
      {
        key: 'include_delivery',
        label: 'Does your purchase include delivery?',
        type: 'toggle',
        required: false,
      },
      {
        key: 'include_warranty',
        label: 'Does your purchase include warranty requirements?',
        type: 'toggle',
        required: false,
      },
      {
        key: 'warranty_description',
        label: 'Warranty Requirements',
        type: 'textarea',
        placeholder: 'Describe the warranty requirements in detail...',
        required: true,
        helpText: 'Detail the expected warranty terms and conditions.',
        condition: (a) => a.include_warranty === true,
      },
    ],
  },
  {
    id: 'goods_delivery_info',
    title: 'Delivery Information',
    description: 'Provide details about where and when goods should be delivered.',
    condition: (a) => a.procurement_type === 'goods' && a.include_delivery === true,
    fields: [
      {
        key: 'delivery_address',
        label: 'Delivery Address',
        type: 'text',
        placeholder: 'Street address, suburb, state, postcode',
        required: true,
        helpText: 'Enter the full delivery address.',
      },
      {
        key: 'delivery_date',
        label: 'Required Delivery Date',
        type: 'date',
        required: true,
      },
      {
        key: 'delivery_notes',
        label: 'Additional Delivery Notes',
        type: 'textarea',
        placeholder: 'Any special delivery instructions...',
        required: false,
      },
    ],
  },
  {
    id: 'goods_specifications',
    title: 'Specification Details',
    description: 'Describe the goods you need in detail.',
    condition: (a) => a.procurement_type === 'goods',
    fields: [
      { key: 'product_description', label: 'Product Description', type: 'textarea', placeholder: 'Describe the product...', required: true },
      { key: 'product_size', label: 'Product Size / Dimensions', type: 'text', placeholder: 'e.g. 30cm x 20cm x 10cm', required: false },
      { key: 'material_colour', label: 'Material and Colour', type: 'text', placeholder: 'e.g. Stainless steel, black finish', required: false },
      { key: 'quantity', label: 'Quantity Required', type: 'number', placeholder: '100', required: true },
      { key: 'quantity_unit', label: 'Unit of Measure', type: 'select', options: ['units', 'kg', 'litres', 'metres', 'other'], required: true },
      { key: 'customisation', label: 'Customisation & Branding Requirements', type: 'textarea', placeholder: 'e.g. Logo embroidered, custom packaging...', required: false },
      { key: 'technical_specs', label: 'Technical Specifications', type: 'textarea', placeholder: 'Any technical standards or compliance requirements...', required: false },
      { key: 'packaging', label: 'Packaging Requirements', type: 'textarea', placeholder: 'e.g. Individually wrapped, pallet delivery...', required: false },
    ],
  },
  {
    id: 'goods_supplier',
    title: 'Supplier Information',
    description: 'If you have a supplier in mind, provide their details (optional).',
    condition: (a) => a.procurement_type === 'goods',
    fields: [
      { key: 'supplier_name', label: 'Supplier Name', type: 'text', placeholder: 'Company name', required: false },
      { key: 'supplier_contact', label: 'Contact Person', type: 'text', placeholder: 'Full name', required: false },
      { key: 'supplier_email', label: 'Email Address', type: 'email', placeholder: 'supplier@company.com', required: false },
      { key: 'supplier_phone', label: 'Phone Number', type: 'text', placeholder: '+61 4xx xxx xxx', required: false },
    ],
  },

  // ── SERVICES PATH ──
  {
    id: 'services_type',
    title: 'Select Service Type',
    description: 'What type of service are you procuring?',
    condition: (a) => a.procurement_type === 'services',
    fields: [
      {
        key: 'service_type',
        label: 'Service Type',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'design', label: 'Design Services', description: 'Graphic, product, or UX design' },
          { value: 'marketing', label: 'Marketing Services', description: 'Campaigns, media, branding' },
          { value: 'construction_professional', label: 'Construction — Professional', description: 'Architects, engineers, project managers' },
          { value: 'construction_building', label: 'Construction — Building', description: 'Builders, trades, civil works' },
          { value: 'it', label: 'IT Services', description: 'Software, infrastructure, support' },
          { value: 'transport', label: 'Transport Services', description: 'Logistics, freight, fleet' },
          { value: 'safety', label: 'Safety & Risk Services', description: 'WHS, risk assessment, compliance' },
          { value: 'other', label: 'Other Professional Services', description: 'Consulting, legal, finance, etc.' },
        ],
      },
    ],
  },
  {
    id: 'services_details',
    title: 'Service Details',
    description: 'Provide detailed information about the services required.',
    condition: (a) => a.procurement_type === 'services' && !!a.service_type,
    fields: [
      { key: 'organisation_name', label: 'Organisation Name', type: 'text', placeholder: 'Your organisation', required: true },
      { key: 'project_name', label: 'Project Name', type: 'text', placeholder: 'e.g. IT Infrastructure Upgrade', required: true },
      { key: 'summary_of_services', label: 'Summary of Services', type: 'textarea', placeholder: 'Describe what you need the service provider to do...', required: true },
      { key: 'provider_responsibilities', label: 'Responsibilities of Service Provider', type: 'textarea', placeholder: 'What will the supplier be responsible for?', required: true },
      { key: 'requester_responsibilities', label: 'Responsibilities of Service Requester', type: 'textarea', placeholder: 'What will your organisation provide or be responsible for?', required: true },
      { key: 'timeline', label: 'Timeline', type: 'text', placeholder: 'e.g. 6 months commencing July 2027', required: true },
      { key: 'key_deliverables', label: 'Key Deliverables', type: 'textarea', placeholder: 'List the specific outputs expected...', required: true },
      { key: 'key_personnel', label: 'Key Personnel', type: 'textarea', placeholder: 'Roles and experience required from the supplier...', required: false },
      { key: 'additional_info', label: 'Relevant Additional Information', type: 'textarea', placeholder: 'Any other relevant context...', required: false },
    ],
  },
  {
    id: 'services_supplier',
    title: 'Supplier Information',
    description: 'If you have a supplier in mind, provide their details (optional).',
    condition: (a) => a.procurement_type === 'services',
    fields: [
      { key: 'supplier_name', label: 'Supplier Name', type: 'text', placeholder: 'Company name', required: false },
      { key: 'supplier_contact', label: 'Contact Person', type: 'text', placeholder: 'Full name', required: false },
      { key: 'supplier_email', label: 'Email Address', type: 'email', placeholder: 'supplier@company.com', required: false },
      { key: 'supplier_phone', label: 'Phone Number', type: 'text', placeholder: '+61 4xx xxx xxx', required: false },
    ],
  },
];

// ─────────────────────────────────────────────
// EOI — Expression of Interest
// ─────────────────────────────────────────────
export const EOI_PAGES = [
  {
    id: 'eoi_cover',
    title: 'Cover Details',
    description: 'Basic information that appears on the EOI cover page.',
    fields: [
      { key: 'issue_date', label: 'Date of Issue', type: 'date', required: true },
      { key: 'closing_date', label: 'EOI Closing Date', type: 'date', required: true },
      { key: 'contact_name', label: 'Contact Person Name', type: 'text', placeholder: 'Full name', required: true },
    ],
  },
  {
    id: 'eoi_business',
    title: 'Business Information',
    description: 'Details about your organisation issuing this EOI.',
    fields: [
      { key: 'organisation_name', label: 'Business Name of Requester', type: 'text', placeholder: 'Your company name', required: true },
      { key: 'abn', label: 'ACN / ABN', type: 'text', placeholder: 'e.g. 12 345 678 901', required: false, helpText: 'Optional — will be validated against the ABR.' },
      { key: 'business_address', label: 'Registered Business Address', type: 'text', placeholder: 'Street address, suburb, state, postcode', required: false },
    ],
  },
  {
    id: 'eoi_submission',
    title: 'Submission Lodgement',
    description: 'How should suppliers submit their EOI response?',
    fields: [
      { key: 'submission_email', label: 'Submission Email Address', type: 'email', placeholder: 'submissions@yourorg.com', required: true, helpText: 'All submissions must be made via email to this address.' },
    ],
  },
  {
    id: 'eoi_concept',
    title: 'Concept & Responsibilities',
    description: 'Describe what your business is seeking and what the supplier will be responsible for.',
    fields: [
      { key: 'concept_details', label: 'Concept Details / Background', type: 'textarea', placeholder: 'Describe what your business is trying to achieve. What goods/services are you seeking? Why?', required: true },
      { key: 'supplier_responsibilities', label: 'Responsibilities of the Supplier', type: 'textarea', placeholder: 'What will the selected supplier be responsible for delivering?', required: true },
    ],
  },
  {
    id: 'eoi_milestones',
    title: 'Project Milestones',
    description: 'Define the key milestones for this project. Add at least one.',
    fields: [
      { key: 'milestones', label: 'Milestones', type: 'milestone-table', required: true },
    ],
  },
  {
    id: 'eoi_representative',
    title: 'Company Representative & Timeline',
    description: 'Who will manage this project and what is the anticipated timeline?',
    fields: [
      { key: 'representative_name', label: 'Company Representative Name', type: 'text', placeholder: 'Full name', required: true },
      { key: 'reporting_requirements', label: 'Reporting Requirements', type: 'textarea', placeholder: 'Describe how and how often the selected supplier should report to you...', required: false },
      { key: 'project_start_date', label: 'Anticipated Project Start Date', type: 'date', required: false },
      { key: 'project_end_date', label: 'Anticipated Project End Date', type: 'date', required: false },
    ],
  },
];

// ─────────────────────────────────────────────
// RFQ — Request for Quotation
// ─────────────────────────────────────────────
export const RFQ_PAGES = [
  {
    id: 'rfq_title',
    title: 'Document Title',
    description: 'Give your RFQ a clear, descriptive title.',
    fields: [
      { key: 'organisation_name', label: 'Organisation Name', type: 'text', placeholder: 'Your company name', required: true },
      { key: 'rfq_title', label: 'RFQ Document Title', type: 'text', placeholder: 'e.g. Provision of Denim Products', required: true },
      { key: 'project_name', label: 'Project / Reference Name', type: 'text', placeholder: 'Internal reference name', required: false },
    ],
  },
  {
    id: 'rfq_submission',
    title: 'Offer Submission Details',
    description: 'Where should suppliers send their quotes?',
    fields: [
      { key: 'submission_contact_name', label: 'Offers to be Addressed To', type: 'text', placeholder: 'Name of person receiving offers', required: true },
      { key: 'submission_email', label: 'Offers Email Address', type: 'email', placeholder: 'rfq@yourorg.com', required: true },
    ],
  },
  {
    id: 'rfq_contact',
    title: 'Contact Details',
    description: 'Who can suppliers contact with questions?',
    fields: [
      { key: 'contact_name', label: 'Contact Person Name', type: 'text', placeholder: 'Full name', required: true },
      { key: 'contact_title', label: 'Position / Title', type: 'text', placeholder: 'e.g. Procurement Manager', required: true },
      { key: 'contact_email', label: 'Email Address', type: 'email', placeholder: 'contact@yourorg.com', required: true },
      { key: 'contact_phone', label: 'Phone Number', type: 'text', placeholder: '+61 4xx xxx xxx', required: true },
    ],
  },
  {
    id: 'rfq_company',
    title: 'Company Details',
    description: 'Your organisation\'s legal details.',
    fields: [
      { key: 'company_name', label: 'Full Legal Company Name', type: 'text', placeholder: 'e.g. Woodington Holdings Pty Ltd', required: true },
      { key: 'abn', label: 'Company ABN', type: 'text', placeholder: 'e.g. 12 345 678 901', required: true, helpText: 'Will be validated against the Australian Business Register.' },
      { key: 'registered_address', label: 'Registered Business Address', type: 'text', placeholder: 'Street address, suburb, state, postcode', required: true },
    ],
  },
  {
    id: 'rfq_dates',
    title: 'Dates & Pricing Terms',
    description: 'Set key dates and pricing conditions.',
    fields: [
      { key: 'closing_date', label: 'Closing Date for Offers', type: 'date', required: true },
      { key: 'commencement_date', label: 'Anticipated Commencement Date', type: 'date', required: true },
      { key: 'validity_period', label: 'Offer Validity Period (months)', type: 'number', placeholder: '3', required: true },
      {
        key: 'price_variation',
        label: 'Price Variation',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'fixed', label: 'Fixed Price for Term', description: 'Price cannot change during the contract period' },
          { value: 'variable', label: 'Subject to Variation', description: 'Price may be adjusted — describe conditions below' },
        ],
      },
      { key: 'price_variation_details', label: 'Variation Details', type: 'textarea', placeholder: 'Describe under what conditions prices may vary...', required: true, condition: (a) => a.price_variation === 'variable' },
    ],
  },
  {
    id: 'rfq_insurance',
    title: 'Insurance Requirements',
    description: 'Select the insurance types required from your supplier.',
    fields: [
      {
        key: 'insurance_types',
        label: 'Required Insurance',
        type: 'checkbox-multi',
        required: false,
        options: [
          { value: 'workers_comp', label: 'Workers Compensation Insurance' },
          { value: 'public_liability', label: 'Public Liability Insurance' },
          { value: 'product_liability', label: 'Product Liability Insurance' },
          { value: 'professional_indemnity', label: 'Professional Indemnity Insurance' },
          { value: 'motor_vehicle', label: 'Motor Vehicle Insurance' },
          { value: 'ctp', label: 'Compulsory Third Party Insurance' },
        ],
      },
      { key: 'public_liability_amount', label: 'Public Liability — Minimum Coverage (AUD)', type: 'text', placeholder: '$20,000,000', required: false, condition: (a) => Array.isArray(a.insurance_types) && a.insurance_types.includes('public_liability') },
      { key: 'professional_indemnity_amount', label: 'Professional Indemnity — Minimum Coverage (AUD)', type: 'text', placeholder: '$10,000,000', required: false, condition: (a) => Array.isArray(a.insurance_types) && a.insurance_types.includes('professional_indemnity') },
    ],
  },
  {
    id: 'rfq_site_meeting',
    title: 'Mandatory Site Meeting',
    description: 'Is there a mandatory site meeting for this RFQ?',
    fields: [
      { key: 'mandatory_site_meeting', label: 'Is there a mandatory site meeting?', type: 'toggle', required: false },
      { key: 'site_meeting_details', label: 'Site Meeting Details', type: 'textarea', placeholder: 'Address, date, and time of the site meeting...', required: true, condition: (a) => a.mandatory_site_meeting === true, helpText: 'Attendance at this meeting is a pre-qualification requirement.' },
    ],
  },
  {
    id: 'rfq_prequalification',
    title: 'Pre-Qualifications & Requirements',
    description: 'Define the requirements suppliers must meet to be considered.',
    fields: [
      { key: 'contract_manager', label: 'Contract Manager Name', type: 'text', placeholder: 'Full name', required: true },
      {
        key: 'prequalification_reqs',
        label: 'Pre-Qualification Requirements',
        type: 'checkbox-multi',
        required: false,
        options: [
          { value: 'modern_slavery', label: 'Modern Slavery Questionnaire Required' },
          { value: 'site_meeting', label: 'Mandatory Site Meeting Attendance Required' },
          { value: 'licensing', label: 'Licensing and Statutory Requirements' },
        ],
      },
      {
        key: 'qualitative_reqs',
        label: 'Qualitative Requirements',
        type: 'checkbox-multi',
        required: false,
        options: [
          { value: 'suitability', label: 'Suitability of Proposed Products/Services' },
          { value: 'capacity', label: 'Organisational Capacity' },
          { value: 'experience', label: 'Demonstrated Experience' },
          { value: 'service', label: 'Service and Maintenance' },
          { value: 'referees', label: 'Referees (minimum 2)' },
        ],
      },
      { key: 'statement_of_requirements', label: 'Statement of Requirements / Scope', type: 'textarea', placeholder: 'Describe in detail what you need the supplier to provide...', required: true },
    ],
  },
];

// ─────────────────────────────────────────────
// RFP — Request for Proposal (same pages as RFQ with minor label difference)
// ─────────────────────────────────────────────
export const RFP_PAGES = RFQ_PAGES.map(page => ({
  ...page,
  fields: page.fields.map(f => ({
    ...f,
    label: f.label?.replace('RFQ', 'RFP'),
    placeholder: f.placeholder?.replace('RFQ', 'RFP'),
  })),
}));

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
export const getPages = (type) => {
  switch (type) {
    case 'SOW': return SOW_PAGES;
    case 'EOI': return EOI_PAGES;
    case 'RFQ': return RFQ_PAGES;
    case 'RFP': return RFP_PAGES;
    default: return SOW_PAGES;
  }
};

/** Filter pages based on current answers (conditional pages) */
export const getVisiblePages = (type, answers) => {
  return getPages(type).filter(page => !page.condition || page.condition(answers));
};

/** Get visible fields on a page based on current answers */
export const getVisibleFields = (page, answers) => {
  return page.fields.filter(f => !f.condition || f.condition(answers));
};

/** Validate required fields on a page. Returns array of missing field keys. */
export const validatePage = (page, answers) => {
  const visibleFields = getVisibleFields(page, answers);
  const errors = [];
  for (const field of visibleFields) {
    if (!field.required) continue;
    const val = answers[field.key];
    if (field.type === 'milestone-table') {
      if (!val || !Array.isArray(val) || val.length === 0) {
        errors.push(field.key);
      }
    } else if (field.type === 'checkbox-multi' || field.type === 'radio-cards') {
      if (!val || (Array.isArray(val) && val.length === 0)) {
        errors.push(field.key);
      }
    } else {
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        errors.push(field.key);
      }
    }
  }
  return errors;
};

// Legacy compat for any code still using getQuestions
export const getQuestions = (type) => {
  const pages = getPages(type);
  return pages.flatMap(p => p.fields);
};