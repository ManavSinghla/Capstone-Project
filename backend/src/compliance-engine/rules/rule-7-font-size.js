/**
 * rule-7-font-size.js — Rule 7 + Table-I: Minimum font height vs PDP area
 *
 * Legal Basis: Rule 7 of the Legal Metrology (Packaged Commodities) Rules, 2011.
 * Gazette: GSR 830(E), 3 September 2011.
 * Provisional: NO (verified)
 *
 * Table-I Minimum Heights (normal label — not blown/embossed):
 *   PDP area <= 50 cm²       ? 1.0 mm
 *   50 < area <= 100 cm²     ? 1.5 mm
 *   100 < area <= 500 cm²    ? 2.5 mm
 *   500 < area <= 2500 cm²   ? 4.0 mm
 *   area > 2500 cm²          ? 6.0 mm
 *
 * NOTE: Verifying measured font height in millimetres from a photograph
 * requires accurate pixels-per-mm calibration (derived from user-entered
 * package dimensions). If scale data is absent, this rule returns NEEDS_REVIEW.
 */

import { RuleStatus } from '../types.js';

export const RULE_CODE = 'RULE_7_FONT_SIZE';

/** Table-I lookup — verified against Rule 7 gazette text */
const TABLE_I = [
  { maxArea: 50,   minHeightMm: 1.0 },
  { maxArea: 100,  minHeightMm: 1.5 },
  { maxArea: 500,  minHeightMm: 2.5 },
  { maxArea: 2500, minHeightMm: 4.0 },
  { maxArea: Infinity, minHeightMm: 6.0 },
];

/**
 * Returns the minimum required font height in mm for a given PDP area.
 * @param {number} pdpAreaSqCm
 * @returns {number} mm
 */
export function requiredMinFontHeightMm(pdpAreaSqCm) {
  const tier = TABLE_I.find((t) => pdpAreaSqCm <= t.maxArea);
  return tier ? tier.minHeightMm : 6.0;
}

/**
 * @param {Object} declarations    - Output of normalizeDeclarations() (not used here)
 * @param {Object} ruleVersion     - RuleVersion DB record
 * @param {Object} context         - Supplementary data needed by this rule
 * @param {number} context.pdpAreaSqCm        - Computed PDP area
 * @param {number|null} context.minObservedFontHeightMm - Estimated from image + scale
 * @returns {{ status: string, explanation: string, evidenceSnippet: null, metadata: Object }}
 */
export function evaluate(declarations, ruleVersion, context = {}) {
  if (ruleVersion.isProvisional) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation: 'Rule is marked provisional. Administrator verification required.',
      evidenceSnippet: null,
      metadata: { provisional: true },
    };
  }

  const { pdpAreaSqCm, minObservedFontHeightMm } = context;

  if (!pdpAreaSqCm || pdpAreaSqCm <= 0) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        'PDP area could not be computed. Please verify package dimensions were entered correctly.',
      evidenceSnippet: null,
      metadata: { pdpAreaSqCm },
    };
  }

  const requiredMm = requiredMinFontHeightMm(pdpAreaSqCm);

  if (minObservedFontHeightMm == null) {
    return {
      status: RuleStatus.NEEDS_REVIEW,
      explanation:
        `PDP area is ${pdpAreaSqCm.toFixed(2)} cm². Required minimum font height: ${requiredMm} mm. ` +
        'Observed font height in mm could not be estimated — package scale data or OCR font measurements are missing. ' +
        'Manual measurement required.',
      evidenceSnippet: null,
      metadata: { pdpAreaSqCm, requiredMm, observedMm: null },
    };
  }

  if (minObservedFontHeightMm < requiredMm) {
    return {
      status: RuleStatus.NON_COMPLIANT,
      explanation:
        `PDP area ${pdpAreaSqCm.toFixed(2)} cm² requires minimum font height of ${requiredMm} mm (Table-I). ` +
        `Estimated minimum observed height: ${minObservedFontHeightMm.toFixed(2)} mm. ` +
        'Fails Rule 7.',
      evidenceSnippet: null,
      metadata: { pdpAreaSqCm, requiredMm, observedMm: minObservedFontHeightMm },
    };
  }

  return {
    status: RuleStatus.COMPLIANT,
    explanation:
      `PDP area ${pdpAreaSqCm.toFixed(2)} cm² — required minimum: ${requiredMm} mm; ` +
      `observed minimum: ${minObservedFontHeightMm.toFixed(2)} mm. Passes Rule 7 Table-I.`,
    evidenceSnippet: null,
    metadata: { pdpAreaSqCm, requiredMm, observedMm: minObservedFontHeightMm },
  };
}
