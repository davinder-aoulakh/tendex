/**
 * ABN Validation Utilities
 * Implements the official ATO checksum algorithm before any API call is made.
 * This avoids hitting the ABR for numbers that are structurally invalid.
 */

// Strip all whitespace and non-digit characters from an ABN string
export const cleanABN = (raw) => String(raw || '').replace(/[^\d]/g, '');

// Format an 11-digit ABN for display: XX XXX XXX XXX
export const formatABN = (raw) => {
  const d = cleanABN(raw);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 11)}`;
};

/**
 * Validates an ABN using the official ATO checksum algorithm.
 * Returns true if the number is structurally a valid ABN.
 * Returns false if the number is 11 digits but fails the checksum —
 * meaning it could never be a real ABN, so there is no point calling the ABR API.
 *
 * Algorithm source: ato.gov.au/individuals-and-families/tax-file-number/abn-lookup
 * Weights: [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
 * Step 1: Subtract 1 from the first digit.
 * Step 2: Multiply each resulting digit by its weight.
 * Step 3: Sum all the products.
 * Step 4: Divide the total by 89 — if the remainder is 0, the ABN is valid.
 */
export const validateABNChecksum = (abn) => {
  const clean = cleanABN(abn);
  if (clean.length !== 11) return false;

  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = clean.split('').map(Number);

  // Subtract 1 from the first digit (this is part of the algorithm, not an error)
  digits[0] = digits[0] - 1;

  const sum = digits.reduce((total, digit, index) => total + digit * weights[index], 0);

  return sum % 89 === 0;
};

/**
 * Returns a plain-English description of an ABR entity type code.
 * Covers all EntityTypeCode values returned by the ABR JSON API.
 */
export const describeEntityType = (code) => {
  const types = {
    IND: 'Sole Trader / Individual',
    PRV: 'Australian Private Company',
    PUB: 'Australian Public Company',
    PTR: 'Partnership',
    TRT: 'Trust',
    SMF: 'Self-Managed Superannuation Fund',
    SUP: 'Superannuation Fund',
    DIT: 'Discretionary Investment Trust',
    DTT: 'Discretionary Trading Trust',
    FXT: 'Fixed Trust',
    HYT: 'Hybrid Trust',
    LPT: 'Limited Partnership',
    FOR: 'Foreign Company',
    ASO: 'Australian Government Entity',
    STG: 'State Government Entity',
    LGE: 'Local Government Entity',
    NPO: 'Non-Profit Organisation',
    OTH: 'Other',
  };
  return types[code] || code || 'Unknown entity type';
};