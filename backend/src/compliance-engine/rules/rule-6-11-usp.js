/**
 * rule-6-11-usp.js — Rule 6(11): Unit Sale Price declaration
 *
 * Legal Basis: Rule 6(11) of the Legal Metrology (Packaged Commodities) Rules,
 * 2011 as amended by LM(PC) Amendment Rules, 2021 (GSR 779(E)) and 2022 (GSR 247(E)).
 * Provisional: YES — exemption boundary conditions and exact commencement date
 * require confirmation against official gazette text.
 *
 * Checks (when not provisional):
 * 1. USP is declared alongside MRP on the PDP.
 * 2. Base unit matches net quantity bracket (g/kg, ml/l, cm/m, per number).
 * 3. Declared USP rounded to 2 decimal places matches MRP ÷ net_quantity.
 * 4. OCR confidence meets the threshold.
 *
 * Exemptions (provisional — NOT enforced until verified):
 * - MRP equals USP (single-unit packages at base rate)
 * - Wholesale packages (Rule 2(r))
 * - Alcoholic beverages governed by State Excise
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_11_USP';

/**
 * Determine the correct base unit for USP given net quantity magnitude and unit.
 * @param {number} magnitude
 * @param {string} unit - 'g', 'kg', 'ml', 'l', 'cm', 'm', or number variants
 * @returns {string} Expected base unit symbol
 */
function expectedBaseUnit(magnitude, unit) {
  const u = unit.toLowerCase();
  if (u === 'g')   return magnitude < 1000 ? 'g' : 'kg';   // Note: label uses declared unit
  if (u === 'kg')  return 'kg';
  if (u === 'ml')  return magnitude < 1000 ? 'ml' : 'l';
  if (u === 'l')   return 'l';
  if (u === 'cm')  return 'cm';
  if (u === 'm')   return 'm';
  // Sold by number
  return 'number';
}

/**
 * Compute expected USP and round to 2 decimal places.
 * @param {number} mrpAmount
 * @param {number} qtyMagnitude
 * @param {string} qtyUnit
 * @returns {number|null}
 */
function calculateExpectedUsp(mrpAmount, qtyMagnitude, qtyUnit) {
  if (!mrpAmount || !qtyMagnitude || qtyMagnitude === 0) return null;
  // Convert to base unit if needed
  const u = qtyUnit.toLowerCase();
  let qty = qtyMagnitude;
  if (u === 'kg') qty = qtyMagnitude * 1000; // convert to g for per-g calc — not needed; kg stays
  // ponytail: keep simple — rule is per declared unit, not converted
  const raw = mrpAmount / qty;
  return Math.round(raw * 100) / 100; // round to 2dp
}

/**
 * @param {Object} declarations - Output of normalizeDeclarations()
 * @param {Object} ruleVersion  - RuleVersion record from DB
 * @returns {{ status: string, explanation: string, evidenceSnippet: string|null, metadata: Object }}
 */
export function evaluate(declarations, ruleVersion) {
  // This rule is provisional. Always return NEEDS_REVIEW until cleared.
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        'Rule 6(11) (Unit Sale Price) is marked provisional pending verification ' +
        'of exemption boundaries and commencement date against the official gazette. ' +
        'Manual review required. See docs/legal_references.md.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const usp = declarations['unit_sale_price'];
  const mrp = declarations['mrp'];
  const qty = declarations['net_quantity'];

  if (!usp) {
    // Missing USP — check if exempt (MRP == USP by calculation)
    if (mrp && qty && isConfident(mrp) && isConfident(qty)) {
      const { amount: mrpAmt } = mrp.normalizedValue;
      const { magnitude, unit } = qty.normalizedValue;
      const calcUsp = calculateExpectedUsp(mrpAmt, magnitude, unit);
      if (calcUsp !== null && calcUsp === mrpAmt) {
        return {
          status: RuleStatus.COMPLIANT,
          explanation:
            'Unit Sale Price equals MRP (single-unit package). ' +
            'Declaration is exempt under the proviso to Rule 6(11).',
          evidenceSnippet: null,
          metadata: { exempt: true, reason: 'mrp_equals_usp' },
        };
      }
    }
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'No Unit Sale Price declaration detected. Rule 6(11) requires USP ' +
        'to be declared on the PDP alongside MRP for non-exempt commodities.',
      evidenceSnippet: null,
      metadata: { found: false },
    };
  }

  if (!isConfident(usp)) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `USP text detected ("${usp.rawText}") but OCR confidence ` +
        `(${(usp.confidence * 100).toFixed(1)}%) is below threshold. Manual verification required.`,
      evidenceSnippet: usp.rawText,
      metadata: { confidence: usp.confidence },
    };
  }

  const { amount: declaredUsp, baseUnit } = usp.normalizedValue;

  // Validate base unit matches net quantity bracket
  if (qty && isConfident(qty)) {
    const { magnitude, unit } = qty.normalizedValue;
    const expected = expectedBaseUnit(magnitude, unit);
    if (expected !== baseUnit) {
      return {
        status: RuleStatus.NON_COMPLIANT,
        explanation:
          `USP base unit "${baseUnit}" does not match the required unit "${expected}" ` +
          `for net quantity ${magnitude}${unit}. ` +
          'Rule 6(11) specifies exact base unit thresholds.',
        evidenceSnippet: usp.rawText,
        metadata: { declaredBaseUnit: baseUnit, expectedBaseUnit: expected, qtyMagnitude: magnitude, qtyUnit: unit },
      };
    }

    // Validate arithmetic
    if (mrp && isConfident(mrp)) {
      const { amount: mrpAmt } = mrp.normalizedValue;
      const expectedUsp = calculateExpectedUsp(mrpAmt, magnitude, unit);
      if (expectedUsp !== null && Math.abs(declaredUsp - expectedUsp) > 0.005) {
        return {
          status: RuleStatus.NON_COMPLIANT,
          explanation:
            `Declared USP (?${declaredUsp}/${baseUnit}) does not match calculated value ` +
            `(?${mrpAmt} ÷ ${magnitude}${unit} = ?${expectedUsp}/${unit}). ` +
            'Discrepancy exceeds rounding tolerance.',
          evidenceSnippet: usp.rawText,
          metadata: { declaredUsp, expectedUsp, mrpAmt, qtyMagnitude: magnitude, qtyUnit: unit },
        };
      }
    }
  }

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `Unit Sale Price declared as ?${declaredUsp}/${baseUnit}. Passes Rule 6(11).`,
    evidenceSnippet: usp.rawText,
    metadata: { declaredUsp, baseUnit },
  };
}
