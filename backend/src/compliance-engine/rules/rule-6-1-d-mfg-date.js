/**
 * rule-6-1-d-mfg-date.js — Rule 6(1)(d): Month and year of manufacture or pre-packing
 *
 * Legal Basis: Rule 6(1)(d) of the Legal Metrology (Packaged Commodities)
 * Rules, 2011. Gazette: GSR 830(E), 3 September 2011.
 * Provisional: NO (verified)
 *
 * Checks:
 * 1. Month and year of manufacture / packing is declared.
 * 2. Month is valid (1–12), year is sensible (e.g. 2020–2035).
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_1_D_MFG_DATE';

export function evaluate(declarations, ruleVersion) {
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'Provisional rule awaiting verification.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const mfgDate = declarations['mfg_date'];

  if (!mfgDate) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'Month and year of manufacture or packing was not found. ' +
        'Rule 6(1)(d) mandates month and year of manufacture or packing on all pre-packaged commodities.',
      evidenceSnippet: null,
      metadata: { found: false },
    };
  }

  if (!isConfident(mfgDate)) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `Manufacturing date text detected ("${mfgDate.rawText}") but confidence ` +
        `(${(mfgDate.confidence * 100).toFixed(1)}%) is below ${MIN_CONFIDENCE_THRESHOLD * 100}%.`,
      evidenceSnippet: mfgDate.rawText,
      metadata: { confidence: mfgDate.confidence },
    };
  }

  const { month, year } = mfgDate.normalizedValue || {};

  if (!month || month < 1 || month > 12 || !year || year < 2015 || year > 2035) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        `Manufacturing date format is invalid (${month}/${year}). ` +
        'Rule 6(1)(d) requires a valid calendar month and year.',
      evidenceSnippet: mfgDate.rawText,
      metadata: { month, year },
    };
  }

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `Month and year of manufacture declared as ${String(month).padStart(2, '0')}/${year}. ` +
      'Satisfies Rule 6(1)(d).',
    evidenceSnippet: mfgDate.rawText,
    metadata: { month, year },
  };
}

