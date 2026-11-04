/**
 * rule-6-1-c-net-quantity.js — Rule 6(1)(c): Net quantity in standard metric units
 *
 * Legal Basis: Rule 6(1)(c) and Second Schedule of the Legal Metrology
 * (Packaged Commodities) Rules, 2011. Gazette: GSR 830(E), 3 September 2011.
 * Provisional: NO (verified)
 *
 * Checks:
 * 1. Net quantity declaration is present.
 * 2. Uses standard legal metric unit (g, kg, ml, l, cm, m, number/units).
 * 3. Magnitude is positive number.
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_1_C_NET_QUANTITY';

export function evaluate(declarations, ruleVersion) {
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'Provisional rule awaiting verification.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const netQty = declarations['net_quantity'];

  if (!netQty) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'No Net Quantity declaration was detected on the label. ' +
        'Rule 6(1)(c) mandates net quantity in standard metric units on every packaged commodity.',
      evidenceSnippet: null,
      metadata: { found: false },
    };
  }

  if (!isConfident(netQty)) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `Net Quantity text detected ("${netQty.rawText}") but confidence ` +
        `(${(netQty.confidence * 100).toFixed(1)}%) is below ${MIN_CONFIDENCE_THRESHOLD * 100}%.`,
      evidenceSnippet: netQty.rawText,
      metadata: { confidence: netQty.confidence },
    };
  }

  const { magnitude, unit, isStandardUnit } = netQty.normalizedValue || {};

  if (!magnitude || magnitude <= 0) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation: 'Net quantity magnitude is zero or could not be parsed as a positive number.',
      evidenceSnippet: netQty.rawText,
      metadata: { magnitude },
    };
  }

  if (!isStandardUnit) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        `Net quantity unit "${unit}" does not conform to the standard metric units ` +
        'prescribed under the Second Schedule of LM(PC) Rules 2011 (g, kg, ml, l, m, number).',
      evidenceSnippet: netQty.rawText,
      metadata: { unit, isStandardUnit: false },
    };
  }

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `Net quantity declared as ${magnitude} ${unit} in compliant SI metric units. ` +
      'Satisfies Rule 6(1)(c).',
    evidenceSnippet: netQty.rawText,
    metadata: { magnitude, unit },
  };
}

