/**
 * compliance-engine/index.js — ComplianceEngine Orchestrator
 *
 * ISOLATION GUARANTEE:
 *   This module has zero imports from Express, Prisma, Axios, or any
 *   network/database library. It is a pure JavaScript computation module.
 *   Tests can import it with no server running.
 *
 * Usage:
 *   import { runComplianceCheck } from './compliance-engine/index.js';
 *   const results = runComplianceCheck({ textBlocks, pdpAreaSqCm, ruleVersions, context });
 */

import { normalizeDeclarations } from './normalizer.js';
import { evaluate as evaluateMrp, RULE_CODE as MRP_CODE } from './rules/rule-6-1-mrp.js';
import { evaluate as evaluateUsp, RULE_CODE as USP_CODE } from './rules/rule-6-11-usp.js';
import { evaluate as evaluateFont, RULE_CODE as FONT_CODE } from './rules/rule-7-font-size.js';
import { evaluate as evaluateMfg, RULE_CODE as MFG_CODE } from './rules/rule-6-1-a-manufacturer.js';
import { evaluate as evaluateOrigin, RULE_CODE as ORIGIN_CODE } from './rules/rule-6-1-aa-origin.js';
import { evaluate as evaluateGeneric, RULE_CODE as GENERIC_CODE } from './rules/rule-6-1-b-generic-name.js';
import { evaluate as evaluateQty, RULE_CODE as QTY_CODE } from './rules/rule-6-1-c-net-quantity.js';
import { evaluate as evaluateMfgDate, RULE_CODE as MFG_DATE_CODE } from './rules/rule-6-1-d-mfg-date.js';
import { evaluate as evaluateExpiry, RULE_CODE as EXPIRY_CODE } from './rules/rule-6-1-da-expiry.js';
import { evaluate as evaluateCare, RULE_CODE as CARE_CODE } from './rules/rule-6-2-customer-care.js';
import { RuleStatus } from './types.js';

/** Ordered list of rules and their evaluators. */
const RULE_REGISTRY = [
  { code: MRP_CODE, evaluator: evaluateMrp },
  { code: USP_CODE, evaluator: evaluateUsp },
  { code: FONT_CODE, evaluator: evaluateFont },
  { code: MFG_CODE, evaluator: evaluateMfg },
  { code: ORIGIN_CODE, evaluator: evaluateOrigin },
  { code: GENERIC_CODE, evaluator: evaluateGeneric },
  { code: QTY_CODE, evaluator: evaluateQty },
  { code: MFG_DATE_CODE, evaluator: evaluateMfgDate },
  { code: EXPIRY_CODE, evaluator: evaluateExpiry },
  { code: CARE_CODE, evaluator: evaluateCare },
];

/**
 * Run all active compliance rules against extracted or user-overridden OCR data.
 *
 * @param {Object} input
 * @param {Array}  [input.textBlocks]   - Raw text_blocks from the OCR service
 * @param {Object} [input.declarations] - Pre-normalized or inspector-overridden declarations
 * @param {number} input.pdpAreaSqCm    - Computed PDP area in cm²
 * @param {Array}  input.ruleVersions   - Array of RuleVersion objects from DB
 * @param {Object} [input.context]      - Extra context (e.g. minObservedFontHeightMm)
 *
 * @returns {{ declarations: Object, evaluations: Array, overallStatus: string }}
 */
export function runComplianceCheck({
  textBlocks,
  declarations: inputDeclarations,
  pdpAreaSqCm,
  ruleVersions = [],
  context = {},
}) {
  // If declarations are provided (e.g. from HITL re-evaluation), use them; otherwise normalize text blocks.
  const declarations = inputDeclarations || normalizeDeclarations(textBlocks || []);

  // Build a lookup map from ruleCode -> ruleVersion for O(1) access.
  const ruleMap = Object.fromEntries(ruleVersions.map((r) => [r.ruleCode, r]));

  const evaluations = [];

  for (const { code, evaluator } of RULE_REGISTRY) {
    const ruleVersion = ruleMap[code];
    if (!ruleVersion) {
      // Rule exists in the engine but is not in the provided ruleVersions list — skip.
      continue;
    }
    if (!ruleVersion.isActive) continue;

    const result = evaluator(declarations, ruleVersion, {
      pdpAreaSqCm,
      ...context,
    });

    evaluations.push({
      ruleCode: code,
      ruleVersionId: ruleVersion.id,
      title: ruleVersion.title || code,
      legalCitation: ruleVersion.legalCitation || null,
      isProvisional: Boolean(ruleVersion.isProvisional),
      ...result,
    });
  }

  const overallStatus = deriveOverallStatus(evaluations);

  return { declarations, evaluations, overallStatus };
}

/**
 * Derive the aggregate status from individual rule evaluations.
 * One NON_COMPLIANT -> overall NON_COMPLIANT.
 * Any NEEDS_REVIEW (no NON_COMPLIANT) -> overall NEEDS_REVIEW.
 * All COMPLIANT or NOT_APPLICABLE -> overall COMPLIANT.
 *
 * @param {Array} evaluations
 * @returns {string} RuleStatus value
 */
function deriveOverallStatus(evaluations) {
  if (evaluations.some((e) => e.status === RuleStatus.NON_COMPLIANT)) {
    return RuleStatus.NON_COMPLIANT;
  }
  if (evaluations.some((e) => e.status === RuleStatus.NEEDS_REVIEW)) {
    return RuleStatus.NEEDS_REVIEW;
  }
  return RuleStatus.COMPLIANT;
}
