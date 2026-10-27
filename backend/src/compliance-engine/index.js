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
import { evaluate as evaluateMrp, RULE_CODE as MRP_CODE }       from './rules/rule-6-1-mrp.js';
import { evaluate as evaluateUsp, RULE_CODE as USP_CODE }       from './rules/rule-6-11-usp.js';
import { evaluate as evaluateFont, RULE_CODE as FONT_CODE }     from './rules/rule-7-font-size.js';
import { RuleStatus } from './types.js';

/** Ordered list of rules and their evaluators. */
const RULE_REGISTRY = [
  { code: MRP_CODE,  evaluator: evaluateMrp  },
  { code: USP_CODE,  evaluator: evaluateUsp  },
  { code: FONT_CODE, evaluator: evaluateFont },
];

/**
 * Run all active compliance rules against extracted OCR data.
 *
 * @param {Object} input
 * @param {Array}  input.textBlocks   - Raw text_blocks from the OCR service
 * @param {number} input.pdpAreaSqCm  - Computed PDP area in cm²
 * @param {Array}  input.ruleVersions - Array of RuleVersion objects from DB
 * @param {Object} [input.context]    - Extra context (e.g. minObservedFontHeightMm)
 *
 * @returns {{ declarations: Object, evaluations: Array, overallStatus: string }}
 */
export function runComplianceCheck({ textBlocks, pdpAreaSqCm, ruleVersions, context = {} }) {
  const declarations = normalizeDeclarations(textBlocks);

  // Build a lookup map from ruleCode -> ruleVersion for O(1) access.
  const ruleMap = Object.fromEntries(ruleVersions.map((r) => [r.ruleCode, r]));

  const evaluations = [];

  for (const { code, evaluator } of RULE_REGISTRY) {
    const ruleVersion = ruleMap[code];
    if (!ruleVersion) {
      // Rule exists in the engine but is not yet in the DB — skip silently.
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
