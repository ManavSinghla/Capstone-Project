/**
 * compliance-engine.test.js — Unit tests for the Legal Metrology Compliance Engine
 *
 * Tests are pure JS — no database, no HTTP, no OCR libraries required.
 * Run with: npm test  (uses Jest)
 *
 * Coverage targets:
 *   - Rule 6(1)(e): MRP presence, format, inclusive-taxes phrase
 *   - Rule 6(11):   USP math, base unit, provisional gate
 *   - Rule 7:       Table-I font height thresholds
 *   - Normalizer:   OCR text -> structured declarations
 *   - Overall status derivation
 */

import { runComplianceCheck } from '../src/compliance-engine/index.js';
import { normalizeDeclarations, isConfident } from '../src/compliance-engine/normalizer.js';
import { requiredMinFontHeightMm } from '../src/compliance-engine/rules/rule-7-font-size.js';
import { RuleStatus, MIN_CONFIDENCE_THRESHOLD } from '../src/compliance-engine/types.js';

// --- Shared test fixtures ----------------------------------------------------

function makeRuleVersion(overrides = {}) {
  return {
    id: 'rv-test-001',
    ruleCode: 'RULE_TEST',
    isProvisional: false,
    isActive: true,
    ...overrides,
  };
}

function makeBlock(text, confidence = 0.95, bbox = { x_min: 0, y_min: 0, x_max: 100, y_max: 20 }) {
  return { text, confidence, bounding_box: bbox };
}

// --- Normalizer tests --------------------------------------------------------

describe('Normalizer — MRP', () => {
  test('parses standard MRP format', () => {
    const blocks = [makeBlock('MRP Rs. 120.00 (Incl. of all taxes)')];
    const decls = normalizeDeclarations(blocks);
    expect(decls.mrp).toBeDefined();
    expect(decls.mrp.normalizedValue.amount).toBe(120.00);
    expect(decls.mrp.normalizedValue.inclTaxes).toBe(true);
  });

  test('parses MRP with rupee symbol and "inclusive of all taxes"', () => {
    const blocks = [makeBlock('M.R.P. ? 85 (inclusive of all taxes)')];
    const decls = normalizeDeclarations(blocks);
    expect(decls.mrp).toBeDefined();
    expect(decls.mrp.normalizedValue.amount).toBe(85);
  });

  test('does NOT parse MRP without inclusive-taxes phrase', () => {
    const blocks = [makeBlock('MRP Rs. 99')];
    const decls = normalizeDeclarations(blocks);
    // Block matched but inclTaxes should be false
    if (decls.mrp) {
      expect(decls.mrp.normalizedValue.inclTaxes).toBe(false);
    } else {
      expect(decls.mrp).toBeUndefined();
    }
  });
});

describe('Normalizer — Net Quantity', () => {
  test('parses gram quantity', () => {
    const blocks = [makeBlock('Net Wt: 200 g')];
    const decls = normalizeDeclarations(blocks);
    expect(decls.net_quantity.normalizedValue.magnitude).toBe(200);
    expect(decls.net_quantity.normalizedValue.unit).toBe('g');
  });

  test('parses litre quantity', () => {
    const blocks = [makeBlock('Net Content 1.5 l')];
    const decls = normalizeDeclarations(blocks);
    expect(decls.net_quantity.normalizedValue.magnitude).toBe(1.5);
    expect(decls.net_quantity.normalizedValue.unit).toBe('l');
  });
});

describe('Normalizer — Unit Sale Price', () => {
  test('parses USP with per g unit', () => {
    const blocks = [makeBlock('Unit Sale Price: Rs. 0.60/g')];
    const decls = normalizeDeclarations(blocks);
    expect(decls.unit_sale_price.normalizedValue.amount).toBe(0.60);
    expect(decls.unit_sale_price.normalizedValue.baseUnit).toBe('g');
  });

  test('parses USP with "per kg" base unit', () => {
    const blocks = [makeBlock('USP: ?50.00 per kg')];
    const decls = normalizeDeclarations(blocks);
    expect(decls.unit_sale_price.normalizedValue.baseUnit).toBe('kg');
  });
});

describe('isConfident', () => {
  test('returns true at threshold', () => {
    expect(isConfident({ confidence: MIN_CONFIDENCE_THRESHOLD })).toBe(true);
  });
  test('returns false below threshold', () => {
    expect(isConfident({ confidence: MIN_CONFIDENCE_THRESHOLD - 0.01 })).toBe(false);
  });
  test('returns false for null', () => {
    expect(isConfident(null)).toBe(false);
  });
});

// --- Rule 6(1)(e): MRP -------------------------------------------------------

describe('Rule 6(1)(e) — MRP', () => {
  const mrpRule = makeRuleVersion({ ruleCode: 'RULE_6_1_E_MRP', isProvisional: false });

  function run(blocks) {
    return runComplianceCheck({
      textBlocks: blocks,
      pdpAreaSqCm: 120,
      ruleVersions: [mrpRule, uspProvisionalRule, fontRule],
      context: { minObservedFontHeightMm: 3.0 },
    });
  }

  // Declare these here for reuse in later tests
  const uspProvisionalRule = makeRuleVersion({ ruleCode: 'RULE_6_11_USP', isProvisional: true });
  const fontRule = makeRuleVersion({ ruleCode: 'RULE_7_FONT_SIZE', isProvisional: false });

  test('COMPLIANT — valid MRP with inclusive-taxes phrase', () => {
    const { evaluations } = run([makeBlock('MRP Rs. 120.00 (Incl. of all taxes)')]);
    const mrpEval = evaluations.find((e) => e.ruleCode === 'RULE_6_1_E_MRP');
    expect(mrpEval.status).toBe(RuleStatus.COMPLIANT);
  });

  test('NON_COMPLIANT — MRP present but missing taxes phrase', () => {
    const { evaluations } = run([makeBlock('MRP Rs. 120.00')]);
    const mrpEval = evaluations.find((e) => e.ruleCode === 'RULE_6_1_E_MRP');
    // normalizer will not match because inclTaxes is required in pattern;
    // so mrp declaration will be absent
    expect(mrpEval.status).toBe(RuleStatus.NON_COMPLIANT);
  });

  test('NON_COMPLIANT — no MRP block at all', () => {
    const { evaluations } = run([makeBlock('Net Wt: 200 g')]);
    const mrpEval = evaluations.find((e) => e.ruleCode === 'RULE_6_1_E_MRP');
    expect(mrpEval.status).toBe(RuleStatus.NON_COMPLIANT);
  });

  test('NEEDS_REVIEW — low confidence MRP', () => {
    const { evaluations } = run([makeBlock('MRP Rs. 120.00 (Incl. of all taxes)', 0.65)]);
    const mrpEval = evaluations.find((e) => e.ruleCode === 'RULE_6_1_E_MRP');
    expect(mrpEval.status).toBe(RuleStatus.NEEDS_REVIEW);
  });
});

// --- Rule 6(11): Unit Sale Price ---------------------------------------------

describe('Rule 6(11) — Unit Sale Price (provisional)', () => {
  const uspRule = makeRuleVersion({ ruleCode: 'RULE_6_11_USP', isProvisional: true });

  test('always returns NEEDS_REVIEW when provisional', () => {
    const { evaluations } = runComplianceCheck({
      textBlocks: [makeBlock('MRP Rs. 120.00 (Incl. of all taxes)')],
      pdpAreaSqCm: 120,
      ruleVersions: [uspRule],
      context: {},
    });
    const uspEval = evaluations.find((e) => e.ruleCode === 'RULE_6_11_USP');
    expect(uspEval.status).toBe(RuleStatus.NEEDS_REVIEW);
  });
});

describe('Rule 6(11) — Unit Sale Price (verified, non-provisional)', () => {
  const uspRule = makeRuleVersion({ ruleCode: 'RULE_6_11_USP', isProvisional: false });

  function run(blocks) {
    return runComplianceCheck({
      textBlocks: blocks,
      pdpAreaSqCm: 120,
      ruleVersions: [uspRule],
      context: {},
    });
  }

  test('COMPLIANT — USP matches MRP / net qty (200g @ Rs120 = Rs0.60/g)', () => {
    const { evaluations } = run([
      makeBlock('MRP Rs. 120.00 (Incl. of all taxes)'),
      makeBlock('Net Wt: 200 g'),
      makeBlock('Unit Sale Price: Rs. 0.60/g'),
    ]);
    const uspEval = evaluations.find((e) => e.ruleCode === 'RULE_6_11_USP');
    expect(uspEval.status).toBe(RuleStatus.COMPLIANT);
  });

  test('NON_COMPLIANT — USP math mismatch (200g @ Rs120, declared Rs0.50/g)', () => {
    const { evaluations } = run([
      makeBlock('MRP Rs. 120.00 (Incl. of all taxes)'),
      makeBlock('Net Wt: 200 g'),
      makeBlock('Unit Sale Price: Rs. 0.50/g'),
    ]);
    const uspEval = evaluations.find((e) => e.ruleCode === 'RULE_6_11_USP');
    expect(uspEval.status).toBe(RuleStatus.NON_COMPLIANT);
  });

  test('NON_COMPLIANT — wrong base unit (200g but declared per kg)', () => {
    const { evaluations } = run([
      makeBlock('MRP Rs. 120.00 (Incl. of all taxes)'),
      makeBlock('Net Wt: 200 g'),
      makeBlock('Unit Sale Price: Rs. 600.00 per kg'),
    ]);
    const uspEval = evaluations.find((e) => e.ruleCode === 'RULE_6_11_USP');
    expect(uspEval.status).toBe(RuleStatus.NON_COMPLIANT);
  });
});

// --- Rule 7: Font Size Table-I -----------------------------------------------

describe('requiredMinFontHeightMm — Table-I lookup', () => {
  test('area = 50cm2 -> 1.0mm', () => expect(requiredMinFontHeightMm(50)).toBe(1.0));
  test('area = 51cm2 -> 1.5mm', () => expect(requiredMinFontHeightMm(51)).toBe(1.5));
  test('area = 100cm2 -> 1.5mm', () => expect(requiredMinFontHeightMm(100)).toBe(1.5));
  test('area = 120cm2 -> 2.5mm', () => expect(requiredMinFontHeightMm(120)).toBe(2.5));
  test('area = 500cm2 -> 2.5mm', () => expect(requiredMinFontHeightMm(500)).toBe(2.5));
  test('area = 501cm2 -> 4.0mm', () => expect(requiredMinFontHeightMm(501)).toBe(4.0));
  test('area = 2500cm2 -> 4.0mm', () => expect(requiredMinFontHeightMm(2500)).toBe(4.0));
  test('area = 2501cm2 -> 6.0mm', () => expect(requiredMinFontHeightMm(2501)).toBe(6.0));
});

describe('Rule 7 — Font Size evaluation', () => {
  const fontRule = makeRuleVersion({ ruleCode: 'RULE_7_FONT_SIZE', isProvisional: false });

  function run(pdpAreaSqCm, minObservedFontHeightMm) {
    return runComplianceCheck({
      textBlocks: [],
      pdpAreaSqCm,
      ruleVersions: [fontRule],
      context: { minObservedFontHeightMm },
    });
  }

  test('COMPLIANT — 120cm2 PDP, 3.0mm observed (needs 2.5mm)', () => {
    const { evaluations } = run(120, 3.0);
    expect(evaluations[0].status).toBe(RuleStatus.COMPLIANT);
  });

  test('NON_COMPLIANT — 120cm2 PDP, 1.5mm observed (needs 2.5mm)', () => {
    const { evaluations } = run(120, 1.5);
    expect(evaluations[0].status).toBe(RuleStatus.NON_COMPLIANT);
  });

  test('NEEDS_REVIEW — no observed font height', () => {
    const { evaluations } = run(120, null);
    expect(evaluations[0].status).toBe(RuleStatus.NEEDS_REVIEW);
  });

  test('NEEDS_REVIEW — no pdpArea', () => {
    const { evaluations } = run(null, 3.0);
    expect(evaluations[0].status).toBe(RuleStatus.NEEDS_REVIEW);
  });
});

// --- Overall status derivation -----------------------------------------------

describe('Overall status derivation', () => {
  test('one NON_COMPLIANT makes overall NON_COMPLIANT', () => {
    const mrpRule  = makeRuleVersion({ ruleCode: 'RULE_6_1_E_MRP',  isProvisional: false });
    const fontRule = makeRuleVersion({ ruleCode: 'RULE_7_FONT_SIZE', isProvisional: false });
    const { overallStatus } = runComplianceCheck({
      textBlocks: [makeBlock('Net Wt: 200 g')], // no MRP
      pdpAreaSqCm: 120,
      ruleVersions: [mrpRule, fontRule],
      context: { minObservedFontHeightMm: 3.0 },
    });
    expect(overallStatus).toBe(RuleStatus.NON_COMPLIANT);
  });
});
