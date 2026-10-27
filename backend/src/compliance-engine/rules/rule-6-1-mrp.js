/**
 * rule-6-1-mrp.js — Rule 6(1)(e): MRP inclusive of all taxes
 *
 * Legal Basis: Rule 6(1)(e) of the Legal Metrology (Packaged Commodities)
 * Rules, 2011. Gazette: GSR 830(E), 3 September 2011.
 * Provisional: NO (verified)
 *
 * Checks:
 * 1. MRP declaration is present.
 * 2. Includes the mandatory phrase "inclusive of all taxes" (or "incl. of all taxes").
 * 3. Amount is a positive number.
 * 4. OCR confidence meets the threshold.
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_1_E_MRP';

/**
 * @param {Object} declarations - Output of normalizeDeclarations()
 * @param {Object} ruleVersion  - RuleVersion record from DB (includes isProvisional)
 * @returns {{ status: string, explanation: string, evidenceSnippet: string|null, metadata: Object }}
 */
export function evaluate(declarations, ruleVersion) {
  // Provisional guard — should not be needed for this rule, but defensive.
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'This rule is marked provisional and requires administrator verification before producing a definitive verdict.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const mrp = declarations['mrp'];

  if (!mrp) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'No MRP declaration was detected on the label. ' +
        'Rule 6(1)(e) requires MRP inclusive of all taxes to be declared on every pre-packaged commodity.',
      evidenceSnippet: null,
      metadata: { found: false },
    };
  }

  // Low-confidence extraction — cannot confirm presence or absence.
  if (!isConfident(mrp)) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `An MRP-like text was detected ("${mrp.rawText}") but OCR confidence ` +
        `(${(mrp.confidence * 100).toFixed(1)}%) is below the ${MIN_CONFIDENCE_THRESHOLD * 100}% ` +
        'threshold. Manual verification required.',
      evidenceSnippet: mrp.rawText,
      metadata: { confidence: mrp.confidence, found: true },
    };
  }

  const { amount, inclTaxes } = mrp.normalizedValue;

  if (!inclTaxes) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        `MRP was detected ("${mrp.rawText}") but the mandatory phrase ` +
        '"inclusive of all taxes" or "incl. of all taxes" is absent. ' +
        'Rule 6(1)(e) requires the inclusive-of-all-taxes statement.',
      evidenceSnippet: mrp.rawText,
      metadata: { amount, inclTaxes: false },
    };
  }

  if (!amount || amount <= 0) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'MRP amount is zero or could not be parsed as a positive number.',
      evidenceSnippet: mrp.rawText,
      metadata: { amount },
    };
  }

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `MRP declared as "?${amount.toFixed(2)} inclusive of all taxes". ` +
      'Satisfies Rule 6(1)(e).',
    evidenceSnippet: mrp.rawText,
    metadata: { amount, inclTaxes: true },
  };
}
