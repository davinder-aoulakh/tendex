import { base44 } from '@/api/base44Client';

/**
 * Evaluate a completed SOW questionnaire against 5 dimensions and
 * recommend a document type (EOI / RFQ / RFP).
 *
 * Returns:
 * {
 *   statement: string,           // one of three plain-English statements
 *   scoreLevel: 'high'|'medium'|'low',
 *   weakDimensions: string[],    // labels of weak dimensions
 *   recommendation: 'EOI'|'RFQ'|'RFP',
 *   recommendationReason: string,
 *   dimensions: {                // per-dimension detail
 *     clarity: { ok: boolean, note: string },
 *     completeness: { ok: boolean, note: string },
 *     timeline: { ok: boolean, note: string },
 *     requirements: { ok: boolean, note: string },
 *     supplierReadiness: { ok: boolean, note: string },
 *   }
 * }
 */
export async function scoreScopeAnswers(answers) {
  const prompt = `You are a senior Australian procurement advisor. A user has completed a Scope of Work questionnaire. 
Evaluate their answers across FIVE dimensions and recommend the best procurement document type.

--- ANSWERS ---
Procurement Type: ${answers.procurement_type || 'N/A'}
Organisation: ${answers.organisation_name || 'N/A'}
Project Name: ${answers.project_name || 'N/A'}
Purchase Type: ${answers.purchase_type || 'N/A'}

GOODS (if applicable):
  Product Description: ${answers.product_description || 'N/A'}
  Quantity: ${answers.quantity ? `${answers.quantity} ${answers.quantity_unit || ''}` : 'N/A'}
  Technical Specs: ${answers.technical_specs || 'N/A'}
  Delivery: ${answers.include_delivery ? answers.delivery_address || 'Yes (no address)' : 'Not required'}
  Warranty: ${answers.include_warranty ? answers.warranty_description || 'Yes (no detail)' : 'Not required'}

SERVICES (if applicable):
  Service Type: ${answers.service_type || 'N/A'}
  Construction Type: ${answers.construction_type || 'N/A'}
  Summary of Services: ${answers.summary_of_services || 'N/A'}
  Provider Responsibilities: ${answers.provider_responsibilities || 'N/A'}
  Timeline: ${answers.timeline || 'N/A'}
  Key Deliverables: ${answers.key_deliverables || 'N/A'}
  Key Personnel: ${answers.key_personnel || 'N/A'}
  Additional Info: ${answers.additional_info || 'N/A'}

COMBINED (if applicable):
  Combined Scope Description: ${answers.combined_scope_description || 'N/A'}
  Primary Outcome: ${answers.combined_primary_outcome || 'N/A'}

SUPPLIER:
  Known Supplier Name: ${answers.supplier_name || 'None provided'}
  Known Supplier Email: ${answers.supplier_email || 'None provided'}

--- EVALUATION INSTRUCTIONS ---

Score each dimension as true (strong) or false (weak):

1. clarity — Is the need clearly described? (project_name meaningful + summary_of_services or product_description substantive)
2. completeness — Are deliverables and quantities specified? (key_deliverables for services OR quantity for goods — must be present and non-trivial)
3. timeline — Is a timeline or deadline provided? (timeline field for services OR delivery_date for goods — must be present)
4. requirements — Are standards, compliance, or constraints captured? (technical_specs OR warranty_description OR additional_info OR key_personnel — at least one substantive entry)
5. supplierReadiness — Is there enough info for a supplier to price this? Consider overall richness of answers PLUS whether supplier_name is provided (known supplier = more ready)

Then:
- If 5/5 strong → scoreLevel = "high", statement = "Your scope looks ready to go to market"
- If 3-4/5 strong → scoreLevel = "medium", statement = "Your scope is mostly ready — a few gaps to address before going to market"
- If 0-2/5 strong → scoreLevel = "low", statement = "Your scope needs a bit more detail before we can recommend a document type"

Recommend document type:
- EOI: if no known supplier AND (scoreLevel = "low" OR procurement is novel/exploratory/high-complexity)
- RFQ: if scoreLevel = "high" AND known supplier exists AND (procurement_type = "goods" OR service is clearly specified with price as main differentiator)
- RFP: if scoreLevel = "medium" or "high" AND procurement_type = "services" or "both" AND supplier methodology matters
- Default to EOI if uncertain.

Return JSON matching the schema exactly.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        statement: { type: 'string' },
        scoreLevel: { type: 'string' },
        weakDimensions: { type: 'array', items: { type: 'string' } },
        recommendation: { type: 'string' },
        recommendationReason: { type: 'string' },
        dimensions: {
          type: 'object',
          properties: {
            clarity:          { type: 'object', properties: { ok: { type: 'boolean' }, note: { type: 'string' } } },
            completeness:     { type: 'object', properties: { ok: { type: 'boolean' }, note: { type: 'string' } } },
            timeline:         { type: 'object', properties: { ok: { type: 'boolean' }, note: { type: 'string' } } },
            requirements:     { type: 'object', properties: { ok: { type: 'boolean' }, note: { type: 'string' } } },
            supplierReadiness:{ type: 'object', properties: { ok: { type: 'boolean' }, note: { type: 'string' } } },
          },
        },
      },
    },
    model: 'gpt_5_mini',
  });

  const runnerUp =
    result.recommendation === 'RFP' ? 'RFQ' :
    result.recommendation === 'RFQ' ? 'EOI' :
    'RFQ'; // EOI runner-up is RFQ

  return { ...result, runnerUp };
}