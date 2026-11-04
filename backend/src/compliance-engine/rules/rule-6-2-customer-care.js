/**
 * rule-6-2-customer-care.js — Rule 6(2): Consumer care contact details
 *
 * Legal Basis: Rule 6(2) of the Legal Metrology (Packaged Commodities)
 * Rules, 2011 (amended by GSR 779(E) 2021).
 * Provisional: NO (verified)
 *
 * Checks:
 * 1. Consumer care contact details must be declared on the package.
 * 2. Must include at least a telephone number or email address.
 */

import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../types.js';
import { isConfident } from '../normalizer.js';

export const RULE_CODE = 'RULE_6_2_CUSTOMER_CARE';

export function evaluate(declarations, ruleVersion) {
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'Provisional rule awaiting verification.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const care = declarations['customer_care'];

  if (!care) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'No consumer care contact details were detected on the package. ' +
        'Rule 6(2) mandates the name, address, telephone number, or email address of the consumer care executive.',
      evidenceSnippet: null,
      metadata: { found: false },
    };
  }

  if (!isConfident(care)) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `Consumer care text was detected ("${care.rawText}") but confidence ` +
        `(${(care.confidence * 100).toFixed(1)}%) is below ${MIN_CONFIDENCE_THRESHOLD * 100}%.`,
      evidenceSnippet: care.rawText,
      metadata: { confidence: care.confidence },
    };
  }

  const { phone, email, address } = care.normalizedValue || {};

  if (!phone && !email && !address) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        'Consumer care declaration text found but no valid telephone number, email, or contact address could be parsed.',
      evidenceSnippet: care.rawText,
      metadata: { found: false },
    };
  }

  const contactMethods = [];
  if (phone) contactMethods.push(`Phone: ${phone}`);
  if (email) contactMethods.push(`Email: ${email}`);

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `Consumer care contact verified (${contactMethods.join(', ')}). ` +
      'Satisfies Rule 6(2).',
    evidenceSnippet: care.rawText,
    metadata: { phone, email, address },
  };
}

