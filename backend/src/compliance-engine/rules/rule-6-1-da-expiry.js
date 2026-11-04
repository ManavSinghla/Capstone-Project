/**
 * rule-6-1-da-expiry.js — Rule 6(1)(da): Expiry date or best before statement
 *
 * Legal Basis: Rule 6(1)(da) of the Legal Metrology (Packaged Commodities)
 * Rules, 2011 (as amended).
 * Provisional: NO (verified)
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_1_DA_EXPIRY';

export function evaluate(declarations, ruleVersion) {
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'Provisional rule awaiting verification.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const expiry = declarations['expiry_date'];

  if (!expiry) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        'Expiry / Best Before declaration was not identified. ' +
        'Rule 6(1)(da) applies to perishable commodities; verify whether this commodity category mandates an expiry date.',
      evidenceSnippet: null,
      metadata: { found: false },
    };
  }

  if (!isConfident(expiry)) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `Expiry text was detected ("${expiry.rawText}") but confidence ` +
        `(${(expiry.confidence * 100).toFixed(1)}%) is below ${MIN_CONFIDENCE_THRESHOLD * 100}%.`,
      evidenceSnippet: expiry.rawText,
      metadata: { confidence: expiry.confidence },
    };
  }

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `Expiry / Best Before declared as "${expiry.normalizedValue.formatted || expiry.rawText}". ` +
      'Satisfies Rule 6(1)(da).',
    evidenceSnippet: expiry.rawText,
    metadata: { ...expiry.normalizedValue },
  };
}

