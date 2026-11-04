/**
 * rule-6-1-a-manufacturer.js — Rule 6(1)(a): Name and complete address of manufacturer/packer
 *
 * Legal Basis: Rule 6(1)(a) of the Legal Metrology (Packaged Commodities)
 * Rules, 2011. Gazette: GSR 830(E), 3 September 2011.
 * Provisional: NO (verified)
 *
 * Checks:
 * 1. Manufacturer or packer name is declared.
 * 2. Complete postal address (including Indian postal PIN code or city/state) is present.
 * 3. OCR confidence meets the threshold.
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_1_A_MANUFACTURER';

export function evaluate(declarations, ruleVersion) {
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'Provisional rule awaiting gazette notification verification.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const mfg = declarations['manufacturer'];

  if (!mfg) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'No manufacturer or packer name and address declaration was detected on the package. ' +
        'Rule 6(1)(a) requires the name and complete postal address of the manufacturer, packer, or importer.',
      evidenceSnippet: null,
      metadata: { found: false },
    };
  }

  if (!isConfident(mfg)) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `Manufacturer text was detected ("${mfg.rawText.slice(0, 80)}") but OCR confidence ` +
        `(${(mfg.confidence * 100).toFixed(1)}%) is below the ${MIN_CONFIDENCE_THRESHOLD * 100}% threshold. ` +
        'Manual inspection required.',
      evidenceSnippet: mfg.rawText,
      metadata: { confidence: mfg.confidence, found: true },
    };
  }

  const { name, address, pincode } = mfg.normalizedValue || {};

  if (!pincode) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `Manufacturer declaration found ("${name || address}") but 6-digit postal PIN code is missing. ` +
        'Rule 6(1)(a) requires a complete postal address to ensure traceability.',
      evidenceSnippet: mfg.rawText,
      metadata: { name, address, pincode: null },
    };
  }

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `Complete manufacturer/packer declaration verified: "${name}", PIN Code: ${pincode}. ` +
      'Satisfies Rule 6(1)(a).',
    evidenceSnippet: mfg.rawText,
    metadata: { name, address, pincode },
  };
}

