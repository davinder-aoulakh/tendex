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
// Three sections: R1 Submission & Contact | R2 Evaluation | R3 Commercial Terms
// ─────────────────────────────────────────────

const RFQ_HAS_SITE_MEETING = (a) => a.rfq_site_meeting === 'mandatory' || a.rfq_site_meeting === 'optional';
const RFQ_HAS_PORTAL        = (a) => a.rfq_submission_method === 'portal';
const RFQ_HAS_CUSTOM_VALIDITY = (a) => a.rfq_validity === 'custom';
const RFQ_HAS_PROGRESS_PAYMENTS = (a) => a.rfq_payment_terms === 'progress';
const RFQ_HAS_DEPOSIT = (a) => a.rfq_payment_terms === 'deposit';
const RFQ_HAS_LICENCES = (a) => !!a.rfq_licences && a.rfq_licences.trim().length > 0;
const RFQ_INS = (type) => (a) => Array.isArray(a.rfq_insurance_types) && a.rfq_insurance_types.includes(type);

export const RFQ_PAGES = [
  // ── R1: Submission and contact ──
  {
    id: 'r1_submission',
    title: 'Submission & Contact',
    description: 'Set the closing details and nominate the key contacts for this RFQ.',
    sectionLabel: 'Submission',
    fields: [
      { key: 'rfq_closing_date', label: 'Closing date for quote submissions', type: 'date', required: true },
      { key: 'rfq_closing_time', label: 'Closing time (local time)', type: 'text', placeholder: 'e.g. 2:00 PM AWST', required: true },
      { key: 'rfq_commencement_date', label: 'Expected commencement date', type: 'text', placeholder: 'e.g. 1 July 2025 or "within 4 weeks of award"', required: false },
      { key: 'rfq_addressed_to', label: 'Who should quotes be addressed to?', type: 'text', placeholder: 'Full name and title', required: true },
      { key: 'rfq_contact_name', label: 'Query contact during advertising', type: 'text', placeholder: 'Full name', required: true },
      { key: 'rfq_contact_title', label: 'Query contact position / title', type: 'text', placeholder: 'e.g. Procurement Manager', required: true },
      { key: 'rfq_contact_email', label: 'Query contact email', type: 'email', placeholder: 'procurement@yourorg.com', required: true },
      { key: 'rfq_contact_phone', label: 'Query contact phone', type: 'text', placeholder: '+61 4xx xxx xxx', required: false },
      {
        key: 'rfq_site_meeting',
        label: 'Will there be a mandatory site meeting or inspection?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'mandatory', label: 'Yes — Mandatory', description: 'Non-attendance disqualifies the supplier' },
          { value: 'optional',  label: 'Yes — Optional',  description: 'Attendance is recommended but not required' },
          { value: 'no',        label: 'No',              description: 'No site meeting required' },
        ],
      },
      { key: 'rfq_site_meeting_date', label: 'Site meeting date', type: 'date', required: true, condition: RFQ_HAS_SITE_MEETING },
      { key: 'rfq_site_meeting_time', label: 'Site meeting time', type: 'text', placeholder: 'e.g. 10:00 AM AWST', required: true, condition: RFQ_HAS_SITE_MEETING },
      { key: 'rfq_site_meeting_address', label: 'Site meeting address', type: 'text', placeholder: 'Street address, suburb, state, postcode', required: true, condition: RFQ_HAS_SITE_MEETING },
    ],
  },

  // ── R2: Evaluation ──
  {
    id: 'r2_evaluation',
    title: 'Evaluation Method',
    description: 'Tell us how you will assess and select the winning quote.',
    sectionLabel: 'Evaluation',
    fields: [
      {
        key: 'rfq_evaluation_method',
        label: 'How will you evaluate quotes?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'lowest_price',  label: 'Lowest price that meets specifications', description: 'Award goes to the compliant quote with the lowest price' },
          { value: 'best_value',    label: 'Best value (price AND quality)',          description: 'Price and qualitative factors are both assessed' },
          { value: 'price_only',    label: 'Price only — all specifications identical', description: 'All respondents offer identical specs; price is the sole differentiator' },
        ],
      },
    ],
  },

  // ── R3: Commercial terms ──
  {
    id: 'r3_commercial',
    title: 'Commercial Terms',
    description: 'Define the commercial requirements suppliers must meet.',
    sectionLabel: 'Commercial',
    fields: [
      {
        key: 'rfq_licences',
        label: 'What specific licences or registrations must the supplier hold? (optional)',
        type: 'text',
        placeholder: 'e.g. QBCC licence, electrical contractor registration…',
        required: false,
      },
      {
        key: 'rfq_insurance_types',
        label: 'What insurance must the supplier hold?',
        type: 'checkbox-multi',
        required: false,
        options: [
          { value: 'public_liability',        label: 'Public liability insurance' },
          { value: 'workers_comp',            label: 'Workers compensation' },
          { value: 'product_liability',       label: 'Product liability insurance' },
          { value: 'professional_indemnity',  label: 'Professional indemnity insurance' },
          { value: 'motor_vehicle',           label: 'Motor vehicle' },
          { value: 'ctp',                     label: 'CTP insurance' },
          { value: 'none',                    label: 'No specific insurance requirements' },
        ],
      },
      { key: 'rfq_ins_public_liability_amt',       label: 'Public liability — minimum insured amount (AUD)', type: 'text', placeholder: '$20,000,000', required: false, condition: RFQ_INS('public_liability') },
      { key: 'rfq_ins_workers_comp_amt',           label: 'Workers compensation — minimum insured amount (AUD)', type: 'text', placeholder: 'Statutory minimum', required: false, condition: RFQ_INS('workers_comp') },
      { key: 'rfq_ins_product_liability_amt',      label: 'Product liability — minimum insured amount (AUD)', type: 'text', placeholder: '$20,000,000', required: false, condition: RFQ_INS('product_liability') },
      { key: 'rfq_ins_professional_indemnity_amt', label: 'Professional indemnity — minimum insured amount (AUD)', type: 'text', placeholder: '$10,000,000', required: false, condition: RFQ_INS('professional_indemnity') },
      { key: 'rfq_ins_motor_vehicle_amt',          label: 'Motor vehicle — minimum insured amount (AUD)', type: 'text', placeholder: '$5,000,000', required: false, condition: RFQ_INS('motor_vehicle') },
      { key: 'rfq_ins_ctp_amt',                   label: 'CTP — minimum insured amount (AUD)', type: 'text', placeholder: 'Statutory minimum', required: false, condition: RFQ_INS('ctp') },
      {
        key: 'rfq_payment_terms',
        label: 'What payment terms are you proposing?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: '30_days',  label: '30 days from invoice',                         description: 'Standard 30-day payment terms' },
          { value: '14_days',  label: '14 days from invoice',                         description: 'Faster 14-day payment terms' },
          { value: 'progress', label: 'Progress payments — milestone-based',          description: 'Payments tied to agreed milestones' },
          { value: 'deposit',  label: 'Upfront deposit plus balance on completion',   description: 'A deposit is paid before work commences' },
          { value: 'negotiate', label: 'To be negotiated',                            description: 'Terms agreed with successful supplier' },
        ],
      },
      { key: 'rfq_payment_milestones', label: 'Describe the payment milestones', type: 'textarea', placeholder: 'e.g. 25% on commencement, 25% at week 4, 50% on completion...', required: true, condition: RFQ_HAS_PROGRESS_PAYMENTS },
      { key: 'rfq_deposit_percent', label: 'Deposit percentage (%)', type: 'text', placeholder: 'e.g. 20', required: true, condition: RFQ_HAS_DEPOSIT },
      {
        key: 'rfq_validity',
        label: 'How long must supplier quotes remain valid?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: '30',     label: '30 days',      description: '' },
          { value: '60',     label: '60 days',      description: '' },
          { value: '90',     label: '90 days',      description: '' },
          { value: 'custom', label: 'I will specify', description: '' },
        ],
      },
      { key: 'rfq_validity_custom', label: 'Specify validity period', type: 'text', placeholder: 'e.g. 45 days', required: true, condition: RFQ_HAS_CUSTOM_VALIDITY },
      {
        key: 'rfq_submission_method',
        label: 'How should suppliers submit their quote?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'email',  label: 'By email to the nominated address', description: 'Quotes sent directly to the contact email above' },
          { value: 'portal', label: 'Via an online portal',              description: 'Quotes submitted through a procurement portal' },
        ],
      },
      { key: 'rfq_portal_url', label: 'Portal URL', type: 'text', placeholder: 'https://portal.youragency.gov.au/rfq/…', required: true, condition: RFQ_HAS_PORTAL },
    ],
  },
];

// ─────────────────────────────────────────────
// RFP — Request for Proposal
// P1: Submission & Contact (same as RFQ R1, rfp_ prefix, briefing instead of site)
// P2: Evaluation Criteria (unique — ranking + weighted criteria)
// P3: Compliance & Declarations (unique)
// P4: Commercial Terms (reuses RFQ R3 structure, rfp_ prefix)
// ─────────────────────────────────────────────

const RFP_HAS_BRIEFING     = (a) => a.rfp_briefing_session === 'mandatory' || a.rfp_briefing_session === 'optional';
const RFP_HAS_PORTAL       = (a) => a.rfp_submission_method === 'portal';
const RFP_HAS_CASE_STUDIES = (a) => a.rfp_case_studies === 'yes';
const RFP_HAS_METHODOLOGY  = (a) => a.rfp_methodology === 'yes';
const RFP_HAS_PERSONNEL    = (a) => a.rfp_key_personnel === 'yes';
const RFP_HAS_MODERN_SLAVERY = (a) => a.rfp_modern_slavery === 'yes';
const RFP_HAS_PRIVACY      = (a) => a.rfp_privacy === 'yes';
const RFP_HAS_CUSTOM_VALIDITY = (a) => a.rfp_validity === 'custom';
const RFP_HAS_PROGRESS_PAYMENTS = (a) => a.rfp_payment_terms === 'progress';
const RFP_HAS_DEPOSIT      = (a) => a.rfp_payment_terms === 'deposit';
const RFP_INS = (type) => (a) => Array.isArray(a.rfp_insurance_types) && a.rfp_insurance_types.includes(type);

export const RFP_PAGES = [
  // ── P1: Submission & Contact (mirrors RFQ R1, briefing instead of site meeting) ──
  {
    id: 'p1_submission',
    title: 'Submission & Contact',
    description: 'Set the closing details and nominate the key contacts for this RFP.',
    sectionLabel: 'Submission',
    fields: [
      { key: 'rfp_closing_date', label: 'Closing date for proposal submissions', type: 'date', required: true },
      { key: 'rfp_closing_time', label: 'Closing time (local time)', type: 'text', placeholder: 'e.g. 2:00 PM AWST', required: true },
      { key: 'rfp_commencement_date', label: 'Expected commencement date', type: 'text', placeholder: 'e.g. 1 July 2025 or "within 4 weeks of award"', required: false },
      { key: 'rfp_addressed_to', label: 'Who should proposals be addressed to?', type: 'text', placeholder: 'Full name and title', required: true },
      { key: 'rfp_contact_name', label: 'Query contact during advertising', type: 'text', placeholder: 'Full name', required: true },
      { key: 'rfp_contact_title', label: 'Query contact position / title', type: 'text', placeholder: 'e.g. Procurement Manager', required: true },
      { key: 'rfp_contact_email', label: 'Query contact email', type: 'email', placeholder: 'procurement@yourorg.com', required: true },
      { key: 'rfp_contact_phone', label: 'Query contact phone', type: 'text', placeholder: '+61 4xx xxx xxx', required: false },
      {
        key: 'rfp_briefing_session',
        label: 'Will there be a mandatory briefing session for respondents?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'mandatory', label: 'Yes — Mandatory', description: 'Non-attendance disqualifies the supplier' },
          { value: 'optional',  label: 'Yes — Optional',  description: 'Attendance is recommended but not required' },
          { value: 'no',        label: 'No',              description: 'No briefing session required' },
        ],
      },
      { key: 'rfp_briefing_date', label: 'Briefing session date', type: 'date', required: true, condition: RFP_HAS_BRIEFING },
      { key: 'rfp_briefing_time', label: 'Briefing session time', type: 'text', placeholder: 'e.g. 10:00 AM AWST', required: true, condition: RFP_HAS_BRIEFING },
      { key: 'rfp_briefing_location', label: 'Briefing location or link', type: 'text', placeholder: 'e.g. 123 Main St, Perth or https://zoom.us/...', required: true, condition: RFP_HAS_BRIEFING },
      {
        key: 'rfp_submission_method',
        label: 'How should suppliers submit their proposal?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'email',  label: 'By email to the nominated address', description: 'Proposals sent directly to the contact email above' },
          { value: 'portal', label: 'Via an online portal',              description: 'Proposals submitted through a procurement portal' },
        ],
      },
      { key: 'rfp_portal_url', label: 'Portal URL', type: 'text', placeholder: 'https://portal.youragency.gov.au/rfp/…', required: true, condition: RFP_HAS_PORTAL },
    ],
  },

  // ── P2: Evaluation Criteria ──
  {
    id: 'p2_evaluation',
    title: 'Evaluation Criteria',
    description: 'Define how you will assess and score proposals.',
    sectionLabel: 'Evaluation',
    fields: [
      {
        key: 'rfp_criteria_ranking',
        label: 'What matters most to you in selecting a supplier?',
        type: 'criteria-ranking', // handled by special component in Questionnaire.jsx
        required: false,
        helpText: 'Drag to rank from most important (top) to least important (bottom). Then use AI to suggest weightings.',
      },
      {
        key: 'rfp_case_studies',
        label: 'Do you need suppliers to demonstrate similar work?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'yes', label: 'Yes — require case studies', description: 'Suppliers must submit evidence of similar completed work' },
          { value: 'no',  label: 'No', description: 'Case studies are not required' },
        ],
      },
      {
        key: 'rfp_case_studies_count',
        label: 'How many case studies must suppliers provide?',
        type: 'radio-cards',
        required: true,
        condition: RFP_HAS_CASE_STUDIES,
        options: [
          { value: '1', label: '1 case study', description: '' },
          { value: '2', label: '2 case studies', description: '' },
          { value: '3', label: '3 case studies', description: '' },
        ],
      },
      {
        key: 'rfp_case_studies_referees',
        label: 'Must referee contact details be included with each case study?',
        type: 'radio-cards',
        required: true,
        condition: RFP_HAS_CASE_STUDIES,
        options: [
          { value: 'yes', label: 'Yes — referees required', description: 'Supplier must provide a contact who can verify the work' },
          { value: 'no',  label: 'No', description: 'Case studies only — no referee contact required' },
        ],
      },
      {
        key: 'rfp_methodology',
        label: 'Do you need suppliers to describe how they will deliver this work?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'yes', label: 'Yes — include methodology question', description: 'AI will draft a methodology question based on your service type' },
          { value: 'no',  label: 'No', description: 'No methodology response required' },
        ],
      },
      {
        key: 'rfp_methodology_question',
        label: 'Methodology question for suppliers',
        type: 'methodology-draft', // handled by special component in Questionnaire.jsx
        required: false,
        condition: RFP_HAS_METHODOLOGY,
        helpText: 'AI will draft this based on your service type. You can edit it.',
      },
      {
        key: 'rfp_key_personnel',
        label: 'Do you need suppliers to name key personnel?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'yes', label: 'Yes — name personnel and provide qualifications', description: 'Suppliers must identify team members and their credentials' },
          { value: 'no',  label: 'No', description: 'No key personnel requirement' },
        ],
      },
    ],
  },

  // ── P3: Compliance & Declarations ──
  {
    id: 'p3_compliance',
    title: 'Compliance & Declarations',
    description: 'Set the compliance requirements and declarations suppliers must meet.',
    sectionLabel: 'Compliance',
    fields: [
      {
        key: 'rfp_licences',
        label: 'What specific licences or registrations must the supplier hold? (optional)',
        type: 'text',
        placeholder: 'e.g. QBCC licence, electrical contractor registration…',
        required: false,
      },
      {
        key: 'rfp_insurance_types',
        label: 'What insurance must the supplier hold?',
        type: 'checkbox-multi',
        required: false,
        options: [
          { value: 'public_liability',        label: 'Public liability insurance' },
          { value: 'workers_comp',            label: 'Workers compensation' },
          { value: 'product_liability',       label: 'Product liability insurance' },
          { value: 'professional_indemnity',  label: 'Professional indemnity insurance' },
          { value: 'motor_vehicle',           label: 'Motor vehicle' },
          { value: 'ctp',                     label: 'CTP insurance' },
          { value: 'none',                    label: 'No specific insurance requirements' },
        ],
      },
      { key: 'rfp_ins_public_liability_amt',       label: 'Public liability — minimum insured amount (AUD)', type: 'text', placeholder: '$20,000,000', required: false, condition: RFP_INS('public_liability') },
      { key: 'rfp_ins_workers_comp_amt',           label: 'Workers compensation — minimum insured amount (AUD)', type: 'text', placeholder: 'Statutory minimum', required: false, condition: RFP_INS('workers_comp') },
      { key: 'rfp_ins_product_liability_amt',      label: 'Product liability — minimum insured amount (AUD)', type: 'text', placeholder: '$20,000,000', required: false, condition: RFP_INS('product_liability') },
      { key: 'rfp_ins_professional_indemnity_amt', label: 'Professional indemnity — minimum insured amount (AUD)', type: 'text', placeholder: '$10,000,000', required: false, condition: RFP_INS('professional_indemnity') },
      { key: 'rfp_ins_motor_vehicle_amt',          label: 'Motor vehicle — minimum insured amount (AUD)', type: 'text', placeholder: '$5,000,000', required: false, condition: RFP_INS('motor_vehicle') },
      { key: 'rfp_ins_ctp_amt',                   label: 'CTP — minimum insured amount (AUD)', type: 'text', placeholder: 'Statutory minimum', required: false, condition: RFP_INS('ctp') },
      {
        key: 'rfp_modern_slavery',
        label: 'Do you require a modern slavery compliance declaration?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'yes', label: 'Yes', description: 'A standard modern slavery clause will be inserted into the document' },
          { value: 'no',  label: 'No',  description: 'Modern slavery declaration not required' },
        ],
      },
      {
        key: 'rfp_privacy',
        label: 'Will the supplier have access to personal, sensitive, or confidential information?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'yes', label: 'Yes', description: 'A standard privacy and data handling clause will be inserted' },
          { value: 'no',  label: 'No',  description: 'No personal or sensitive information involved' },
        ],
      },
      {
        key: 'rfp_declarations',
        label: 'Do you require suppliers to make any declarations?',
        type: 'checkbox-multi',
        required: false,
        options: [
          { value: 'conflict_of_interest',    label: 'Conflict of interest declaration' },
          { value: 'criminal_convictions',    label: 'Criminal convictions declaration' },
          { value: 'subcontracting',          label: 'Subcontracting disclosure' },
          { value: 'none',                    label: 'No declarations required' },
        ],
      },
      {
        key: 'rfp_ip_ownership',
        label: 'Who will own the intellectual property created through this engagement?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'client_owns',    label: 'Our organisation owns all IP', description: 'All IP created vests in our organisation upon creation' },
          { value: 'supplier_owns',  label: 'Supplier retains IP — we receive a licence', description: 'Supplier retains ownership; we get a licence to use' },
          { value: 'shared',         label: 'Shared ownership — to be negotiated', description: 'IP ownership and licencing to be agreed at contract stage' },
          { value: 'not_applicable', label: 'Not applicable', description: 'No IP is expected to be created' },
        ],
      },
    ],
  },

  // ── P4: Commercial Terms (mirrors RFQ R3, rfp_ prefix) ──
  {
    id: 'p4_commercial',
    title: 'Commercial Terms',
    description: 'Define the pricing and payment structure for this RFP.',
    sectionLabel: 'Commercial',
    fields: [
      {
        key: 'rfp_pricing_structure',
        label: 'What pricing structure are you seeking?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: 'lump_sum',         label: 'Lump sum (fixed price)',           description: 'Supplier quotes a single total price for the full scope' },
          { value: 'schedule_of_rates', label: 'Schedule of rates',               description: 'Supplier quotes rates per unit, hour, or item — total varies by usage' },
          { value: 'not_specified',    label: 'Not specified — open to supplier', description: 'Suppliers may propose their preferred pricing model' },
        ],
      },
      {
        key: 'rfp_payment_terms',
        label: 'What payment terms are you proposing?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: '30_days',  label: '30 days from invoice',                         description: 'Standard 30-day payment terms' },
          { value: '14_days',  label: '14 days from invoice',                         description: 'Faster 14-day payment terms' },
          { value: 'progress', label: 'Progress payments — milestone-based',          description: 'Payments tied to agreed milestones' },
          { value: 'deposit',  label: 'Upfront deposit plus balance on completion',   description: 'A deposit is paid before work commences' },
          { value: 'negotiate', label: 'To be negotiated',                            description: 'Terms agreed with successful supplier' },
        ],
      },
      { key: 'rfp_payment_milestones', label: 'Describe the payment milestones', type: 'textarea', placeholder: 'e.g. 25% on commencement, 25% at week 4, 50% on completion...', required: true, condition: RFP_HAS_PROGRESS_PAYMENTS },
      { key: 'rfp_deposit_percent', label: 'Deposit percentage (%)', type: 'text', placeholder: 'e.g. 20', required: true, condition: RFP_HAS_DEPOSIT },
      {
        key: 'rfp_validity',
        label: 'How long must supplier proposals remain valid?',
        type: 'radio-cards',
        required: true,
        options: [
          { value: '30',     label: '30 days', description: '' },
          { value: '60',     label: '60 days', description: '' },
          { value: '90',     label: '90 days', description: '' },
          { value: 'custom', label: 'I will specify', description: '' },
        ],
      },
      { key: 'rfp_validity_custom', label: 'Specify validity period', type: 'text', placeholder: 'e.g. 45 days', required: true, condition: RFP_HAS_CUSTOM_VALIDITY },
    ],
  },
];

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
    } else if (field.type === 'criteria-ranking' || field.type === 'methodology-draft') {
      // These are always optional from a required-field perspective (rendered as custom components)
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