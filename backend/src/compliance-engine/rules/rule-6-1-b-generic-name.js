/**
 * rule-6-1-b-generic-name.js — Rule 6(1)(b): Generic or common name of the commodity
 *
 * Legal Basis: Rule 6(1)(b) of the Legal Metrology (Packaged Commodities)
 * Rules, 2011. Gazette: GSR 830(E), 3 September 2011.
 * Provisional: NO (verified)
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_1_B_GENERIC_NAME';

export function evaluate(declarations, ruleVersion) {
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'Provisional rule awaiting verification.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const genericName = declarations['generic_name'];

  if (!genericName) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        'Generic / common commodity name declaration was not unambiguously identified. ' +
        'Rule 6(1)(b) requires the common or generic name to be displayed on the principal display panel.',
      evidenceSnippet: null,
      metadata: { found: false },
    };
  }

  if (!isConfident(genericName)) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `Generic name detected ("${genericName.rawText}") but confidence ` +
        `(${(genericName.confidence * 100).toFixed(1)}%) is below ${MIN_CONFIDENCE_THRESHOLD * 100}%.`,
      evidenceSnippet: genericName.rawText,
      metadata: { confidence: genericName.confidence },
    };
  }

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `Generic name declared as "${genericName.normalizedValue.name}". ` +
      'Satisfies Rule 6(1)(b).',
    evidenceSnippet: genericName.rawText,
    metadata: { genericName: genericName.normalizedValue.name },
  };
}

