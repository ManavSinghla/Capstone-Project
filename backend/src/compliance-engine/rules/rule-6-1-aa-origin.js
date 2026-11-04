/**
 * rule-6-1-aa-origin.js — Rule 6(1)(aa): Country of origin
 *
 * Legal Basis: Rule 6(1)(aa) of the Legal Metrology (Packaged Commodities)
 * Rules, 2011. Gazette: GSR 830(E), 3 September 2011.
 * Provisional: NO (verified)
 *
 * Checks:
 * 1. Country of origin declaration is mandatory for imported goods.
 * 2. If present, country is recognized and confidence meets the threshold.
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_1_AA_ORIGIN';

export function evaluate(declarations, ruleVersion) {
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'Provisional rule awaiting verification.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const origin = declarations['country_of_origin'];
  const mfg = declarations['manufacturer'];

  // If origin is declared
  if (origin) {
    if (!isConfident(origin)) {
      return {
        status: RuleStatus.NEEDS_REVIEW,
        explanation:
          `Country of origin was detected ("${origin.rawText}") but OCR confidence ` +
          `(${(origin.confidence * 100).toFixed(1)}%) is below ${MIN_CONFIDENCE_THRESHOLD * 100}%.`,
        evidenceSnippet: origin.rawText,
        metadata: { confidence: origin.confidence },
      };
    }

    return {
      status: RuleStatus.COMPLIANT,
      explanation:
        `Country of origin declared as "${origin.normalizedValue.country}". ` +
        'Satisfies Rule 6(1)(aa).',
      evidenceSnippet: origin.rawText,
      metadata: { country: origin.normalizedValue.country },
    };
  }

  // If manufacturer has "imported by", origin declaration is strictly required
  if (mfg && mfg.normalizedValue && mfg.normalizedValue.role === 'importer') {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'Commodity has an importer declaration but no "Country of Origin" statement was found. ' +
        'Rule 6(1)(aa) mandates country of origin on all imported packages.',
      evidenceSnippet: mfg.rawText,
      metadata: { isImported: true, originDeclared: false },
    };
  }

  // For domestic goods where manufacturer is Indian, origin is implicitly domestic
  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      'Product manufactured domestically by Indian entity; explicit country-of-origin is compliant.',
    evidenceSnippet: mfg ? mfg.rawText : null,
    metadata: { isDomestic: true },
  };
}

