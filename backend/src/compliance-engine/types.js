/**
 * types.js — Compliance Engine constants
 *
 * All outcome values are defined here as frozen strings.
 * Import this module wherever a rule verdict must be assigned.
 * Never use inline string literals for verdict values in rule modules.
 */

export const RuleStatus = Object.freeze({
  /** All mandatory checks for this rule passed with high confidence. */
  COMPLIANT: 'COMPLIANT',
  /**
   * A verified rule violation was identified with high OCR confidence
   * AND the rule is not marked provisional.
   */
  NON_COMPLIANT: 'NON_COMPLIANT',
  /**
   * The outcome cannot be determined automatically because:
   * - OCR confidence for the relevant text is below the threshold, OR
   * - The rule is marked isProvisional = true, OR
   * - Applicability of the rule to this product category is unclear.
   * Requires human inspector review.
   */
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  /**
   * The rule does not apply to this commodity.
   * e.g. country-of-origin rule for domestically manufactured goods.
   */
  NOT_APPLICABLE: 'NOT_APPLICABLE',
});

/** Minimum OCR confidence threshold below which a field is escalated to NEEDS_REVIEW. */
export const MIN_CONFIDENCE_THRESHOLD = 0.80;
