/**
 * milestone4-features.test.js — Milestone 4 Verification Tests
 *
 * Covers:
 *   1. PDF Report Generation (FR-6.2)
 *   2. MIME Magic Number Binary Validation (NFR-3.1)
 *   3. End-to-end Evaluation Dataset (5 real packaged commodity presets)
 *   4. Principle Display Panel (PDP) calculation
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateCompliancePdfBuffer } from '../src/services/pdf-report.service.js';
import { validateMagicBytes } from '../src/middlewares/upload.middleware.js';
import { calculatePdpArea, PRESETS, DEFAULT_RULES } from '../src/routes/api.router.js';
import { runComplianceCheck } from '../src/compliance-engine/index.js';

describe('Milestone 4 — PDF Report Generator (FR-6.2)', () => {
  test('generates a valid binary PDF stream with official GoI styling', async () => {
    const pdfBuf = await generateCompliancePdfBuffer({
      inspectionId: 'INSP-M4-TEST',
      productName: 'Parle-G Gold Biscuits',
      brandName: 'Parle',
      packageShape: 'RECTANGULAR',
      dimensions: { height_cm: 15, width_cm: 8, depth_cm: 4 },
      pdpAreaSqCm: 120,
      overallStatus: 'COMPLIANT',
      quality: { blurScore: 185.4, isBlurry: false, glarePercentage: 2.1, isOverexposed: false },
      declarations: {
        mrp: {
          rawText: 'MRP Rs. 25.00 (Incl. of all taxes)',
          confidence: 0.99,
          normalizedValue: { amount: 25, inclTaxes: true },
        },
        net_quantity: {
          rawText: 'Net Qty: 200 g',
          confidence: 0.96,
          normalizedValue: { magnitude: 200, unit: 'g' },
        },
        unit_sale_price: {
          rawText: 'USP: Rs. 0.125 / g',
          confidence: 0.95,
          normalizedValue: { amount: 0.125, baseUnit: 'g' },
        },
        generic_name: {
          rawText: 'Generic Name: Biscuits',
          confidence: 0.97,
          normalizedValue: { name: 'Biscuits' },
        },
      },
      evaluations: [
        {
          ruleCode: 'RULE_6_1_E_MRP',
          legalCitation: 'Rule 6(1)(e) LM(PC) Rules 2011',
          status: 'COMPLIANT',
          explanation: 'MRP declared as ₹25.00 inclusive of all taxes.',
        },
        {
          ruleCode: 'RULE_6_11_USP',
          legalCitation: 'Rule 6(11) LM(PC) Rules 2011',
          status: 'COMPLIANT',
          explanation: 'Unit Sale Price declared as ₹0.125/g.',
        },
      ],
      inspectorName: 'Shri R. K. Sharma',
      officerDesignation: 'Senior Legal Metrology Inspector',
    });

    assert.ok(Buffer.isBuffer(pdfBuf), 'Output must be a Buffer');
    assert.ok(pdfBuf.length > 2000, `PDF size (${pdfBuf.length} bytes) must exceed minimum threshold`);
    const header = pdfBuf.subarray(0, 4).toString('ascii');
    assert.strictEqual(header, '%PDF', 'PDF buffer must start with %PDF magic signature');
  });

  test('generates non-compliant audit memo with violation flags', async () => {
    const pdfBuf = await generateCompliancePdfBuffer({
      inspectionId: 'INSP-VIOLATION-01',
      productName: 'Crunchy Hot Masala Chips',
      overallStatus: 'NON_COMPLIANT',
      evaluations: [
        {
          ruleCode: 'RULE_6_1_E_MRP',
          legalCitation: 'Rule 6(1)(e)',
          status: 'NON_COMPLIANT',
          explanation: 'Missing statutory (inclusive of all taxes) phrase.',
        },
      ],
    });

    assert.ok(pdfBuf.length > 2000);
    assert.strictEqual(pdfBuf.subarray(0, 4).toString('ascii'), '%PDF');
  });
});

describe('Milestone 4 — Security Audit & Magic Number Validation (NFR-3.1)', () => {
  const tmpDir = os.tmpdir();

  test('accepts genuine JPEG file with 0xFF 0xD8 0xFF signature', () => {
    const jpegPath = path.join(tmpDir, `test-${Date.now()}.jpg`);
    const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
    fs.writeFileSync(jpegPath, validJpeg);

    try {
      const isValid = validateMagicBytes(jpegPath, 'image/jpeg');
      assert.strictEqual(isValid, true, 'Genuine JPEG should pass validation');
    } finally {
      fs.unlinkSync(jpegPath);
    }
  });

  test('accepts genuine PNG file with \\x89PNG signature', () => {
    const pngPath = path.join(tmpDir, `test-${Date.now()}.png`);
    const validPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    fs.writeFileSync(pngPath, validPng);

    try {
      const isValid = validateMagicBytes(pngPath, 'image/png');
      assert.strictEqual(isValid, true, 'Genuine PNG should pass validation');
    } finally {
      fs.unlinkSync(pngPath);
    }
  });

  test('accepts genuine WebP file with RIFF....WEBP signature', () => {
    const webpPath = path.join(tmpDir, `test-${Date.now()}.webp`);
    const validWebp = Buffer.from('RIFF\x20\x00\x00\x00WEBPVP8 ');
    fs.writeFileSync(webpPath, validWebp);

    try {
      const isValid = validateMagicBytes(webpPath, 'image/webp');
      assert.strictEqual(isValid, true, 'Genuine WebP should pass validation');
    } finally {
      fs.unlinkSync(webpPath);
    }
  });

  test('rejects spoofed executable masquerading as a JPEG (MZ header)', () => {
    const fakePath = path.join(tmpDir, `malicious-${Date.now()}.jpg`);
    const fakeExe = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF');
    fs.writeFileSync(fakePath, fakeExe);

    try {
      const isValid = validateMagicBytes(fakePath, 'image/jpeg');
      assert.strictEqual(isValid, false, 'Spoofed executable must be rejected');
    } finally {
      fs.unlinkSync(fakePath);
    }
  });

  test('rejects shell script masquerading as an image (#!/bin/sh)', () => {
    const fakePath = path.join(tmpDir, `exploit-${Date.now()}.png`);
    const fakeScript = Buffer.from('#!/bin/bash\necho pwned\n');
    fs.writeFileSync(fakePath, fakeScript);

    try {
      const isValid = validateMagicBytes(fakePath, 'image/png');
      assert.strictEqual(isValid, false, 'Shell script disguised as PNG must be rejected');
    } finally {
      fs.unlinkSync(fakePath);
    }
  });
});

describe('Milestone 4 — Evaluation Dataset & Preset Verification', () => {
  test('includes at least 5 realistic packaged commodity presets', () => {
    assert.ok(PRESETS.length >= 5, `Expected >= 5 presets, got ${PRESETS.length}`);
  });

  test('preset-compliant-biscuit evaluates to COMPLIANT', () => {
    const preset = PRESETS.find((p) => p.id === 'preset-compliant-biscuit');
    assert.ok(preset, 'preset-compliant-biscuit must exist');
    const pdpArea = calculatePdpArea(preset.packageShape, preset.dimensions);
    const result = runComplianceCheck({
      textBlocks: preset.textBlocks,
      pdpAreaSqCm: pdpArea,
      ruleVersions: DEFAULT_RULES,
      context: { minObservedFontHeightMm: 3.0 },
    });
    assert.strictEqual(result.overallStatus, 'COMPLIANT');
  });

  test('preset-deceptive-mrp evaluates to NON_COMPLIANT due to missing tax clause', () => {
    const preset = PRESETS.find((p) => p.id === 'preset-deceptive-mrp');
    assert.ok(preset);
    const pdpArea = calculatePdpArea(preset.packageShape, preset.dimensions);
    const result = runComplianceCheck({
      textBlocks: preset.textBlocks,
      pdpAreaSqCm: pdpArea,
      ruleVersions: DEFAULT_RULES,
    });
    assert.strictEqual(result.overallStatus, 'NON_COMPLIANT');
    const mrpEval = result.evaluations.find((e) => e.ruleCode === 'RULE_6_1_E_MRP');
    assert.strictEqual(mrpEval?.status, 'NON_COMPLIANT');
  });

  test('preset-imported-chocolate evaluates to NON_COMPLIANT due to missing origin', () => {
    const preset = PRESETS.find((p) => p.id === 'preset-imported-chocolate');
    assert.ok(preset);
    const pdpArea = calculatePdpArea(preset.packageShape, preset.dimensions);
    const result = runComplianceCheck({
      textBlocks: preset.textBlocks,
      pdpAreaSqCm: pdpArea,
      ruleVersions: DEFAULT_RULES,
    });
    assert.strictEqual(result.overallStatus, 'NON_COMPLIANT');
    const originEval = result.evaluations.find((e) => e.ruleCode === 'RULE_6_1_AA_ORIGIN');
    assert.strictEqual(originEval?.status, 'NON_COMPLIANT');
  });

  test('preset-blurry-low-confidence evaluates to NEEDS_REVIEW', () => {
    const preset = PRESETS.find((p) => p.id === 'preset-blurry-low-confidence');
    assert.ok(preset);
    const pdpArea = calculatePdpArea(preset.packageShape, preset.dimensions);
    const result = runComplianceCheck({
      textBlocks: preset.textBlocks,
      pdpAreaSqCm: pdpArea,
      ruleVersions: DEFAULT_RULES,
      context: { minObservedFontHeightMm: 3.0 },
    });
    assert.strictEqual(result.overallStatus, 'NEEDS_REVIEW');
  });

  test('preset-sunflower-oil evaluates to COMPLIANT', () => {
    const preset = PRESETS.find((p) => p.id === 'preset-sunflower-oil');
    assert.ok(preset);
    const pdpArea = calculatePdpArea(preset.packageShape, preset.dimensions);
    const result = runComplianceCheck({
      textBlocks: preset.textBlocks,
      pdpAreaSqCm: pdpArea,
      ruleVersions: DEFAULT_RULES,
      context: { minObservedFontHeightMm: 3.0 },
    });
    assert.strictEqual(result.overallStatus, 'COMPLIANT');
  });
});

describe('Milestone 4 — Statutory PDP Area Calculations', () => {
  test('calculates rectangular PDP area as height * width', () => {
    const area = calculatePdpArea('RECTANGULAR', { height_cm: 20, width_cm: 15 });
    assert.strictEqual(area, 300);
  });

  test('calculates cylindrical PDP area as 0.4 * height * circumference', () => {
    const area = calculatePdpArea('CYLINDRICAL', { height_cm: 20, circumference_cm: 25 });
    assert.strictEqual(area, 200); // 0.4 * 20 * 25 = 200
  });
});
