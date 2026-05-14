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
// Branching logic:
//   S1  → procurement_type (goods | services | both)
//   S2  → procurement basics (always shown after S1)
//   S3  → goods list        (goods | both)
//   S4a → service type      (services | both)
//   S4b → construction type (services|both + service_type === 'construction_trades')
//   S4c → service details   (services | both)
//   S5  → combined intent   (both only — shown BEFORE S3/S4)
//   S6  → known suppliers   (always shown last)
// ─────────────────────────────────────────────

const IS_GOODS    = (a) => a.procurement_type === 'goods';
const IS_SERVICES = (a) => a.procurement_type === 'services';
const IS_BOTH     = (a) => a.procurement_type === 'both';
const HAS_GOODS   = (a) => IS_GOODS(a) || IS_BOTH(a);
const HAS_SERVICES= (a) => IS_SERVICES(a) || IS_BOTH(a);

export const SOW_PAGES = [
  // ── S1: Procurement type (Q1.1) ──
  {
    id: 's1_procurement_type',
    title: 'What type of procurement is this?',
    description: 'Select the category that best describes what you need to procure.',
    sectionLabel: 'Procurement Type',
    fields: [
      {
        key: 'procurement_type',
        label: 'What best describes what you need to procure?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'goods',    label: 'Goods — supply only',            description: 'Physical products, equipment, or materials supplied by a vendor' },
          { value: 'services', label: 'Services — labour or expertise only', description: 'Professional services, labour, consulting, or trades' },
          { value: 'both',     label: 'Both — goods and services together', description: 'A procurement that requires the supplier to provide goods AND deliver services as part of the same engagement' },
        ],
      },
    ],
  },

  // ── S2: Procurement basics (always shown) ──
  {
    id: 's2_basics',
    title: 'Procurement Basics',
    description: 'Tell us about your organisation and this procurement.',
    sectionLabel: 'Basics',
    condition: (a) => !!a.procurement_type,
    fields: [
      { key: 'organisation_name', label: 'Organisation Name', type: 'text', placeholder: 'Your organisation', required: true },
      { key: 'project_name', label: 'Project Name', type: 'text', placeholder: 'e.g. Office Fit-Out 2027', required: true },
      {
        key: 'purchase_type',
        label: 'Purchase Type',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'once_off', label: 'Once-Off', description: 'A single, one-time engagement' },
          { value: 'ongoing',  label: 'Ongoing / Panel', description: 'Recurring or standing arrangement' },
        ],
      },
    ],
  },

  // ── S5: Combined intent (both only — shown before S3/S4) ──
  {
    id: 's5_combined_intent',
    title: 'Combined Procurement Intent',
    description: 'Because you are procuring goods and services together, help us understand how they are linked.',
    sectionLabel: 'Combined Scope',
    condition: IS_BOTH,
    fields: [
      {
        key: 'combined_scope_description',
        label: 'Describe how the goods and services are connected',
        type: 'textarea',
        placeholder: 'e.g. We need a supplier to both manufacture custom signage (goods) and install it on-site across our network of venues (services)...',
        required: true,
        helpText: 'This helps AI understand that these are linked — not two separate procurements.',
      },
      {
        key: 'combined_primary_outcome',
        label: 'What is the primary outcome you are trying to achieve?',
        type: 'textarea',
        placeholder: 'e.g. Fully installed, branded signage across all locations within 90 days...',
        required: true,
      },
    ],
  },

  // ── S3: Goods list (goods | both) ──
  {
    id: 's3_goods_list',
    title: 'Goods Specification',
    description: 'Describe the goods you need supplied.',
    sectionLabel: 'Goods',
    condition: HAS_GOODS,
    fields: [
      { key: 'product_description', label: 'Product Description', type: 'textarea', placeholder: 'Describe the product(s) in detail...', required: true },
      { key: 'product_size', label: 'Product Size / Dimensions', type: 'text', placeholder: 'e.g. 30cm x 20cm x 10cm', required: false },
      { key: 'material_colour', label: 'Material and Colour', type: 'text', placeholder: 'e.g. Stainless steel, black finish', required: false },
      { key: 'quantity', label: 'Quantity Required', type: 'number', placeholder: '100', required: true },
      { key: 'quantity_unit', label: 'Unit of Measure', type: 'select', options: ['units', 'kg', 'litres', 'metres', 'other'], required: true },
      { key: 'customisation', label: 'Customisation & Branding Requirements', type: 'textarea', placeholder: 'e.g. Logo embroidered, custom packaging...', required: false },
      { key: 'technical_specs', label: 'Technical Specifications', type: 'textarea', placeholder: 'Any technical standards or compliance requirements...', required: false },
      { key: 'packaging', label: 'Packaging Requirements', type: 'textarea', placeholder: 'e.g. Individually wrapped, pallet delivery...', required: false },
      { key: 'include_delivery', label: 'Does this include delivery to site?', type: 'toggle', required: false },
      {
        key: 'delivery_address',
        label: 'Delivery Address',
        type: 'text',
        placeholder: 'Street address, suburb, state, postcode',
        required: true,
        condition: (a) => a.include_delivery === true,
      },
      {
        key: 'delivery_date',
        label: 'Required Delivery Date',
        type: 'date',
        required: true,
        condition: (a) => a.include_delivery === true,
      },
      { key: 'include_warranty', label: 'Are warranty requirements included?', type: 'toggle', required: false },
      {
        key: 'warranty_description',
        label: 'Warranty Requirements',
        type: 'textarea',
        placeholder: 'Describe the expected warranty terms...',
        required: true,
        condition: (a) => a.include_warranty === true,
      },
    ],
  },

  // ── S4a: Service type selector (services | both) ──
  {
    id: 's4a_service_type',
    title: 'Service Type',
    description: 'What category of service are you procuring?',
    sectionLabel: 'Services',
    condition: HAS_SERVICES,
    fields: [
      {
        key: 'service_type',
        label: 'Select Service Type',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'design',                 label: 'Design Services',          description: 'Graphic, product, or UX design' },
          { value: 'marketing',              label: 'Marketing Services',        description: 'Campaigns, media, branding' },
          { value: 'construction_trades',    label: 'Construction and trades',   description: 'Builders, trades, civil works, installations' },
          { value: 'construction_professional', label: 'Construction — Professional', description: 'Architects, engineers, project managers' },
          { value: 'it',                     label: 'IT Services',              description: 'Software, infrastructure, support' },
          { value: 'transport',              label: 'Transport Services',        description: 'Logistics, freight, fleet' },
          { value: 'safety',                 label: 'Safety & Risk Services',    description: 'WHS, risk assessment, compliance' },
          { value: 'other',                  label: 'Other Professional Services', description: 'Consulting, legal, finance, etc.' },
        ],
      },
    ],
  },

  // ── S4b: Construction sub-branch (only when service_type === 'construction_trades') ──
  {
    id: 's4b_construction_type',
    title: 'Construction Type',
    description: 'Select the specific type of construction or trades work required.',
    sectionLabel: 'Construction Detail',
    condition: (a) => HAS_SERVICES(a) && a.service_type === 'construction_trades',
    fields: [
      {
        key: 'construction_type',
        label: 'Type of Construction / Trades Work',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'new_build',       label: 'New Build',            description: 'Construction of a new structure or facility' },
          { value: 'fit_out',         label: 'Fit-Out / Refurbishment', description: 'Interior fit-out, renovation, or upgrade' },
          { value: 'civil',           label: 'Civil Works',           description: 'Roads, drainage, earthworks, utilities' },
          { value: 'mechanical',      label: 'Mechanical & HVAC',     description: 'Heating, ventilation, air conditioning, plumbing' },
          { value: 'electrical',      label: 'Electrical',            description: 'Electrical installation or maintenance' },
          { value: 'maintenance',     label: 'Maintenance & Repair',  description: 'Ongoing or reactive maintenance of existing assets' },
          { value: 'other_trades',    label: 'Other Trades',          description: 'Painting, tiling, landscaping, or other specialist trades' },
        ],
      },
    ],
  },

  // ── S4c: Service details (services | both, after type is selected) ──
  {
    id: 's4c_service_details',
    title: 'Service Details',
    description: 'Provide detailed information about the services required.',
    sectionLabel: 'Service Scope',
    condition: (a) => HAS_SERVICES(a) && !!a.service_type,
    fields: [
      { key: 'summary_of_services', label: 'Summary of Services Required', type: 'textarea', placeholder: 'Describe what you need the service provider to do...', required: true },
      { key: 'provider_responsibilities', label: 'Responsibilities of Service Provider', type: 'textarea', placeholder: 'What will the supplier be responsible for?', required: true },
      { key: 'requester_responsibilities', label: 'Responsibilities of Your Organisation', type: 'textarea', placeholder: 'What will your organisation provide or be responsible for?', required: true },
      { key: 'timeline', label: 'Timeline', type: 'text', placeholder: 'e.g. 6 months commencing July 2027', required: true },
      { key: 'key_deliverables', label: 'Key Deliverables', type: 'textarea', placeholder: 'List the specific outputs or milestones expected...', required: true },
      { key: 'key_personnel', label: 'Key Personnel Requirements', type: 'textarea', placeholder: 'Roles and experience required from the supplier...', required: false },
      { key: 'additional_info', label: 'Relevant Additional Information', type: 'textarea', placeholder: 'Any other relevant context or requirements...', required: false },
    ],
  },

  // ── S6: Known suppliers (always last) ──
  {
    id: 's6_supplier',
    title: 'Known Suppliers',
    description: 'If you have a supplier in mind, provide their details (optional).',
    sectionLabel: 'Suppliers',
    condition: (a) => !!a.procurement_type,
    fields: [
      { key: 'supplier_name',    label: 'Supplier Name',   type: 'text',  placeholder: 'Company name',           required: false },
      { key: 'supplier_contact', label: 'Contact Person',  type: 'text',  placeholder: 'Full name',              required: false },
      { key: 'supplier_email',   label: 'Email Address',   type: 'email', placeholder: 'supplier@company.com',   required: false },
      { key: 'supplier_phone',   label: 'Phone Number',    type: 'text',  placeholder: '+61 4xx xxx xxx',         required: false },
    ],
  },
];

// ─────────────────────────────────────────────
// EOI — Expression of Interest
// Four sections: E1 Purpose | E2 Learning | E3 Requirements | E4 Closing
// ─────────────────────────────────────────────

const EOI_HAS_BUDGET    = (a) => Array.isArray(a.eoi_constraints)    && a.eoi_constraints.includes('budget_ceiling');
const EOI_HAS_PORTAL    = (a) => a.eoi_submission_method === 'portal';
const EOI_HAS_LICENCES  = (a) => Array.isArray(a.eoi_supplier_reqs)  && a.eoi_supplier_reqs.includes('licences');

export const EOI_PAGES = [
  // ── E1: EOI Purpose ──
  {
    id: 'e1_purpose',
    title: 'EOI Purpose',
    description: 'Tell us why you are issuing this Expression of Interest.',
    sectionLabel: 'Purpose',
    fields: [
      {
        key: 'eoi_primary_purpose',
        label: 'What is the primary purpose of this EOI?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'understand_market',    label: 'Understand what the market can offer',          description: 'Explore solutions or approaches available in the market' },
          { value: 'identify_suppliers',   label: 'Identify and shortlist capable suppliers',      description: 'Find and pre-qualify vendors for a future formal process' },
          { value: 'refine_scope',         label: 'Refine our scope before issuing a formal request', description: 'Use market feedback to sharpen your requirements' },
          { value: 'all_of_the_above',     label: 'All of the above',                              description: 'Multiple objectives apply' },
        ],
      },
      {
        key: 'eoi_constraints',
        label: 'Are there any constraints suppliers should know about?',
        type: 'checkbox-multi',
        required: false,
        options: [
          { value: 'budget_ceiling',        label: 'Budget ceiling' },
          { value: 'fixed_delivery_date',   label: 'Fixed delivery date' },
          { value: 'local_preference',      label: 'Preference for local or Australian suppliers' },
          { value: 'site_access',           label: 'Specific site or access constraints' },
          { value: 'no_constraints',        label: 'No constraints to disclose' },
        ],
      },
      {
        key: 'eoi_budget_ceiling',
        label: 'Budget ceiling amount (AUD)',
        type: 'text',
        placeholder: 'e.g. $500,000',
        required: true,
        condition: EOI_HAS_BUDGET,
      },
    ],
  },

  // ── E2: What you want to learn ──
  {
    id: 'e2_learning',
    title: 'What You Want to Learn',
    description: 'Help suppliers understand what market intelligence you are seeking.',
    sectionLabel: 'Market Intelligence',
    fields: [
      {
        key: 'eoi_learning_goals',
        label: 'What do you most want to learn from suppliers?',
        type: 'checkbox-multi',
        required: true,
        options: [
          { value: 'solutions_available',   label: 'What solutions or approaches are available' },
          { value: 'likely_cost',           label: 'What it is likely to cost' },
          { value: 'capable_suppliers',     label: 'Which suppliers are capable and available' },
          { value: 'delivery_time',         label: 'How long delivery is likely to take' },
          { value: 'market_understanding',  label: 'Whether the market understands our requirement' },
        ],
      },
      {
        key: 'eoi_shortlist_target',
        label: 'How many capable suppliers do you hope to shortlist from this EOI?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: '2_3',     label: '2–3',                description: 'A small, focused shortlist' },
          { value: '3_5',     label: '3–5',                description: 'A moderate shortlist' },
          { value: '5_plus',  label: '5 or more',          description: 'A broad shortlist' },
          { value: 'no_target', label: 'No target',        description: 'We want to hear from any capable supplier' },
        ],
      },
    ],
  },

  // ── E3: Respondent requirements ──
  {
    id: 'e3_requirements',
    title: 'Respondent Requirements',
    description: 'What must suppliers demonstrate to be considered?',
    sectionLabel: 'Supplier Requirements',
    fields: [
      {
        key: 'eoi_supplier_reqs',
        label: 'What must suppliers demonstrate to be considered?',
        type: 'checkbox-multi',
        required: false,
        options: [
          { value: 'relevant_experience',  label: 'Relevant experience in similar work' },
          { value: 'local_presence',       label: 'Local or Australian presence' },
          { value: 'licences',             label: 'Specific licences or registrations' },
          { value: 'financial_capacity',   label: 'Financial capacity' },
          { value: 'no_requirements',      label: 'No specific requirements at this stage' },
        ],
      },
      {
        key: 'eoi_licences_detail',
        label: 'Specify the required licences or registrations',
        type: 'text',
        placeholder: 'e.g. QBCC licence, electrical contractor registration…',
        required: true,
        condition: EOI_HAS_LICENCES,
      },
    ],
  },

  // ── E4: Closing and contact ──
  {
    id: 'e4_closing',
    title: 'Closing & Contact Details',
    description: 'Set the closing date and tell suppliers how to submit.',
    sectionLabel: 'Closing Details',
    fields: [
      { key: 'eoi_closing_date', label: 'Closing date for this EOI', type: 'date', required: true },
      { key: 'eoi_closing_time', label: 'Closing time (local time)', type: 'text', placeholder: 'e.g. 2:00 PM AWST', required: true },
      { key: 'eoi_addressed_to', label: 'Who should responses be addressed to?', type: 'text', placeholder: 'Full name and title', required: true },
      { key: 'eoi_contact_name', label: 'Contact person for supplier queries', type: 'text', placeholder: 'Full name', required: true },
      { key: 'eoi_contact_email', label: 'Contact email address', type: 'email', placeholder: 'procurement@yourorg.com', required: true },
      {
        key: 'eoi_submission_method',
        label: 'How should suppliers submit their EOI response?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'email',  label: 'By email to the nominated address', description: 'Responses sent directly to the contact email above' },
          { value: 'portal', label: 'Via an online portal',              description: 'Responses submitted through a procurement portal' },
        ],
      },
      {
        key: 'eoi_portal_url',
        label: 'Portal URL',
        type: 'text',
        placeholder: 'https://portal.youragency.gov.au/eoi/…',
        required: true,
        condition: EOI_HAS_PORTAL,
      },
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