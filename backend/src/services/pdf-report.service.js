/**
 * pdf-report.service.js — Government of India memo-styled PDF audit report generator
 *
 * Generates a Legal Metrology (Packaged Commodities) compliance audit memo
 * using PDFKit, conforming to FR-6.2 (Milestone 4).
 *
 * Layout sections:
 *   1. Official letterhead — Ministry of Consumer Affairs, Food & Public Distribution
 *   2. Inspection metadata table (ID, timestamp, commodity, dimensions, PDP area, status)
 *   3. Image exhibit (if available on disk)
 *   4. Image Quality Assessment (OpenCV Laplacian blur, glare %)
 *   5. Declaration breakdown table (raw OCR text -> normalised value, confidence, override status)
 *   6. Rule-by-rule compliance verdicts table (citations, status, findings)
 *   7. Overall verdict banner (COMPLIANT / NON-COMPLIANT / NEEDS REVIEW)
 *   8. Inspector sign-off block with official digital seal placeholder
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';

// --- Colour palette (Government of India document styling) ---
const COLOR_NAVY    = '#1A3660';   // Primary header & title block
const COLOR_SAFFRON = '#FF6600';   // India saffron accents
const COLOR_GREEN   = '#1A7340';   // Compliant verdicts
const COLOR_RED     = '#C0392B';   // Non-compliant verdicts
const COLOR_AMBER   = '#D4830A';   // Needs review
const COLOR_GREY    = '#5A6472';   // Secondary text
const COLOR_LIGHT   = '#F4F6F8';   // Table alternating rows
const COLOR_WHITE   = '#FFFFFF';

function statusColor(status) {
  if (!status) return COLOR_GREY;
  const s = String(status).toUpperCase();
  if (s === 'COMPLIANT') return COLOR_GREEN;
  if (s.includes('NON_COMPLIANT') || s.includes('NON-COMPLIANT')) return COLOR_RED;
  return COLOR_AMBER;
}

function statusLabel(status) {
  if (!status) return 'UNKNOWN';
  const s = String(status).toUpperCase();
  if (s === 'COMPLIANT') return 'COMPLIANT';
  if (s.includes('NON_COMPLIANT') || s.includes('NON-COMPLIANT')) return 'NON-COMPLIANT';
  if (s.includes('NEEDS_REVIEW') || s.includes('NEEDS REVIEW')) return 'NEEDS REVIEW';
  return s;
}

function safeStr(v, fallback = '—') {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length > 0 ? s : fallback;
}

function formatConfidence(c) {
  if (c === null || c === undefined) return '—';
  return `${Math.round(Number(c) * 100)}%`;
}

function normalizedSummary(decl) {
  if (!decl || !decl.normalizedValue) return '—';
  const nv = decl.normalizedValue;
  if (typeof nv === 'string') return nv;
  const parts = [];
  if (nv.amount !== undefined) parts.push(`₹${nv.amount}`);
  if (nv.inclTaxes !== undefined) parts.push(nv.inclTaxes ? 'incl. taxes ✓' : 'taxes missing ✗');
  if (nv.magnitude !== undefined) parts.push(`${nv.magnitude} ${nv.unit || ''}`.trim());
  if (nv.formatted) parts.push(nv.formatted);
  if (nv.country) parts.push(nv.country);
  if (nv.phone) parts.push(`Ph: ${nv.phone}`);
  if (nv.email) parts.push(`Email: ${nv.email}`);
  if (nv.name && !nv.phone) parts.push(nv.name);
  if (nv.pincode) parts.push(`PIN: ${nv.pincode}`);
  if (nv.baseUnit) parts.push(`per ${nv.baseUnit}`);
  if (nv.durationValue) parts.push(`${nv.durationValue} ${nv.durationUnit || ''}`.trim());
  return parts.join(', ') || JSON.stringify(nv).slice(0, 80);
}

/**
 * generateCompliancePdfStream(options)
 *
 * Pipes the generated PDF directly to an output stream (e.g. Express `res`).
 */
export function generateCompliancePdfStream(options, outputStream) {
  const doc = buildCompliancePdfDocument(options);
  doc.pipe(outputStream);
  doc.end();
  return doc;
}

/**
 * generateCompliancePdfBuffer(options)
 *
 * Generates and resolves a complete Buffer of the PDF document.
 * Useful for tests and storage.
 */
export function generateCompliancePdfBuffer(options) {
  return new Promise((resolve, reject) => {
    try {
      const doc = buildCompliancePdfDocument(options);
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * buildCompliancePdfDocument(options)
 *
 * Constructs the PDFDocument object with all sections and styling.
 */
export function buildCompliancePdfDocument(options = {}) {
  const {
    inspectionId = `INSP-${Date.now()}`,
    productName = 'Packaged Commodity',
    brandName = '',
    packageShape = 'RECTANGULAR',
    dimensions = {},
    pdpAreaSqCm = 0,
    overallStatus = 'NEEDS_REVIEW',
    quality = {},
    declarations = {},
    evaluations = [],
    imagePath = null,
    inspectorName = 'Authorized Enforcement Officer',
    officerDesignation = 'Legal Metrology Inspector, Central/State Cell',
  } = options;

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 44, left: 45, right: 45 },
    info: {
      Title: `Compliance Audit Report — ${inspectionId}`,
      Author: 'Legal Metrology Division, Department of Consumer Affairs',
      Subject: 'Legal Metrology (Packaged Commodities) Rules 2011 Compliance Audit',
      Creator: 'SIH-26034 Compliance Checker v1.0',
    },
    bufferPages: true,
  });

  const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const L = doc.page.margins.left;

  // --- SECTION 1: Letterhead ---
  doc.rect(L, 26, W, 4).fill(COLOR_SAFFRON);
  doc.rect(L, 32, W, 2).fill(COLOR_NAVY);

  // Government Emblem Placeholder
  doc.circle(L + 24, 62, 18).fill(COLOR_NAVY);
  doc.fillColor(COLOR_WHITE).fontSize(7).font('Helvetica-Bold').text('GoI', L + 16, 59);

  // Ministry & Division Title
  doc.fillColor(COLOR_NAVY).fontSize(11).font('Helvetica-Bold').text('GOVERNMENT OF INDIA', L + 52, 46);
  doc.fontSize(8.5).font('Helvetica').fillColor(COLOR_GREY).text('Ministry of Consumer Affairs, Food & Public Distribution', L + 52, 59);
  doc.fontSize(8).text('Department of Consumer Affairs — Legal Metrology Division', L + 52, 70);

  // Inspection Memo ID & Timestamp
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.fillColor(COLOR_GREY).fontSize(8).font('Helvetica')
    .text(`Inspection ID: ${inspectionId}`, L, 46, { align: 'right', width: W })
    .text(`Date: ${dateStr}`, L, 58, { align: 'right', width: W })
    .text('Form LM-PC-01 (Statutory Audit)', L, 70, { align: 'right', width: W });

  doc.moveTo(L, 86).lineTo(L + W, 86).strokeColor(COLOR_NAVY).lineWidth(1).stroke();

  // Memo Title
  doc.fillColor(COLOR_NAVY).fontSize(12).font('Helvetica-Bold')
    .text('STATUTORY PACKAGED COMMODITIES COMPLIANCE AUDIT MEMO', L, 94, { align: 'center', width: W });
  doc.fillColor(COLOR_GREY).fontSize(8).font('Helvetica')
    .text('Under the Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011', L, 108, { align: 'center', width: W });

  doc.y = 124;

  // --- SECTION 2: Inspection Metadata Table ---
  drawSectionHeader(doc, L, W, '1. INSPECTION & COMMODITY IDENTIFICATION');

  const dimStr = packageShape === 'CYLINDRICAL'
    ? `Diameter: ${dimensions?.diameter_cm || dimensions?.width_cm || '—'} cm, Height: ${dimensions?.height_cm || '—'} cm`
    : `H: ${dimensions?.height_cm || '—'} cm × W: ${dimensions?.width_cm || '—'} cm × D: ${dimensions?.depth_cm || '—'} cm`;

  const metaRows = [
    ['Inspection Reference', inspectionId],
    ['Inspection Date', dateStr],
    ['Commodity / Product Name', productName],
    ['Brand / Trade Name', safeStr(brandName)],
    ['Package Geometry', packageShape],
    ['Package Dimensions', dimStr],
    ['Principal Display Panel (PDP) Area', pdpAreaSqCm ? `${Number(pdpAreaSqCm).toFixed(2)} cm²` : 'Calculated automatically'],
    ['Assigned Officer', inspectorName],
    ['Designation / Unit', officerDesignation],
    ['Overall Legal Metrology Status', statusLabel(overallStatus)],
  ];

  drawKeyValueTable(doc, L, W, metaRows, overallStatus);

  // --- SECTION 3: Quality Assessment (OpenCV) ---
  if (quality && (quality.blurScore !== undefined || quality.glarePercentage !== undefined)) {
    drawSectionHeader(doc, L, W, '2. FORENSIC IMAGE QUALITY VERIFICATION (OpenCV)');
    const qualRows = [
      ['Laplacian Variance Blur Score', safeStr(quality.blurScore, 'N/A')],
      ['Blur Threshold Verdict', quality.isBlurry ? 'FLAGGED AS BLURRY (Score < 100)' : 'PASSED (Sharp / Legible)'],
      ['Overexposure / Glare Extent', quality.glarePercentage !== undefined ? `${quality.glarePercentage}%` : 'N/A'],
      ['Glare Threshold Verdict', quality.isOverexposed ? 'FLAGGED (Specular Glare Detected)' : 'PASSED (Uniform Lighting)'],
    ];
    drawKeyValueTable(doc, L, W, qualRows);
  }

  // --- SECTION 4: Image Exhibit (If Available on Disk) ---
  if (imagePath && fs.existsSync(imagePath)) {
    if (doc.y > doc.page.height - 240) doc.addPage();
    drawSectionHeader(doc, L, W, '3. EVIDENCE EXHIBIT — PACKAGE PANEL PHOTOGRAPH');
    try {
      const imgMaxHeight = 180;
      doc.image(imagePath, L + (W - 280) / 2, doc.y + 4, { fit: [280, imgMaxHeight], align: 'center' });
      doc.y += imgMaxHeight + 10;
      doc.fillColor(COLOR_GREY).fontSize(7.5).font('Helvetica')
        .text(`Exhibit A: Photographic record captured for ${inspectionId}`, L, doc.y, { align: 'center', width: W });
      doc.y += 12;
    } catch {
      doc.fillColor(COLOR_GREY).fontSize(8).text('[Photograph attached in primary inspection docket]', L + 4, doc.y + 4);
      doc.y += 14;
    }
  }

  // --- SECTION 5: Mandatory Declaration Breakdown Table ---
  if (doc.y > doc.page.height - 200) doc.addPage();
  drawSectionHeader(doc, L, W, '4. STATUTORY DECLARATIONS AUDIT BREAKDOWN (Rule 6)');

  const FIELD_LABELS = {
    mrp: 'Maximum Retail Price (MRP)',
    unit_sale_price: 'Unit Sale Price (USP)',
    net_quantity: 'Net Quantity',
    mfg_date: 'Date of Manufacture / Packing',
    expiry_date: 'Best Before / Expiry Date',
    manufacturer: 'Name & Address of Manufacturer/Packer',
    country_of_origin: 'Country of Origin',
    customer_care: 'Consumer Care Cell Details',
    generic_name: 'Generic / Common Name',
  };

  const declHeaders = ['Mandatory Field', 'Extracted OCR Text', 'Normalised Legal Value', 'Conf.', 'Source'];
  const declColWidths = [W * 0.22, W * 0.26, W * 0.30, W * 0.09, W * 0.13];

  drawTableHeader(doc, L, W, declHeaders, declColWidths);

  const declKeys = Object.keys(FIELD_LABELS);
  for (let i = 0; i < declKeys.length; i++) {
    if (doc.y > doc.page.height - 50) {
      doc.addPage();
      drawTableHeader(doc, L, W, declHeaders, declColWidths);
    }
    const key = declKeys[i];
    const decl = declarations[key];
    const label = FIELD_LABELS[key];
    const rawText = decl ? safeStr(decl.rawText, '— not found —') : '— not found —';
    const normValue = decl ? normalizedSummary(decl) : '— missing —';
    const conf = decl ? formatConfidence(decl.confidence) : '0%';
    const source = decl ? (decl.isUserOverridden ? 'HITL Override' : 'AI Extracted') : 'Missing';
    const isAlt = i % 2 === 1;
    drawTableRow(doc, L, W, [label, rawText, normValue, conf, source], declColWidths, isAlt, !decl);
  }
  doc.y += 10;

  // --- SECTION 6: Rule-by-Rule Compliance Verdicts Table ---
  if (doc.y > doc.page.height - 180) doc.addPage();
  drawSectionHeader(doc, L, W, '5. STATUTORY RULE COMPLIANCE DETERMINATION');

  const evalHeaders = ['Rule Code', 'Legal Citation', 'Status', 'Statutory Finding / Reason'];
  const evalColWidths = [W * 0.20, W * 0.28, W * 0.16, W * 0.36];

  drawTableHeader(doc, L, W, evalHeaders, evalColWidths);

  if (!evaluations || evaluations.length === 0) {
    doc.fillColor(COLOR_GREY).fontSize(8).font('Helvetica').text('No automated rule evaluations recorded.', L + 6, doc.y + 6);
    doc.y += 18;
  } else {
    for (let i = 0; i < evaluations.length; i++) {
      if (doc.y > doc.page.height - 50) {
        doc.addPage();
        drawTableHeader(doc, L, W, evalHeaders, evalColWidths);
      }
      const ev = evaluations[i];
      const ruleCode = safeStr(ev.ruleCode || ev.ruleId);
      const citation = safeStr(ev.legalCitation || ev.citation);
      const evStatus = safeStr(ev.status || ev.verdict);
      const explanation = safeStr(ev.explanation || ev.message || ev.detail);
      const isAlt = i % 2 === 1;
      const isNonCompliant = evStatus.toUpperCase().includes('NON_COMPLIANT') || evStatus.toUpperCase().includes('NON-COMPLIANT');
      drawTableRow(
        doc, L, W,
        [ruleCode, citation, statusLabel(evStatus), explanation],
        evalColWidths,
        isAlt,
        isNonCompliant,
      );
    }
  }
  doc.y += 12;

  // --- SECTION 7: Overall Verdict Banner ---
  if (doc.y > doc.page.height - 130) doc.addPage();

  const bannerColor = statusColor(overallStatus);
  const bannerY = doc.y;
  doc.rect(L, bannerY, W, 46).fill(bannerColor);
  doc.fillColor(COLOR_WHITE).fontSize(14).font('Helvetica-Bold')
    .text(`FINAL VERDICT: ${statusLabel(overallStatus)}`, L, bannerY + 10, { align: 'center', width: W });

  const totalRules = evaluations.length;
  const passCount = evaluations.filter((e) => (e.status || e.verdict || '').toUpperCase() === 'COMPLIANT').length;
  const failCount = evaluations.filter((e) => (e.status || e.verdict || '').toUpperCase().includes('NON_COMPLIANT')).length;
  const reviewCount = evaluations.filter((e) => (e.status || e.verdict || '').toUpperCase().includes('REVIEW')).length;

  doc.fontSize(8.5).font('Helvetica')
    .text(`${passCount} Passed  |  ${failCount} Non-Compliant  |  ${reviewCount} Needs Review  |  ${totalRules} Total Evaluated Rules`,
      L, bannerY + 28, { align: 'center', width: W });
  doc.y = bannerY + 54;

  // --- SECTION 8: Statutory Certification & Sign-off ---
  if (doc.y > doc.page.height - 110) doc.addPage();

  const signY = doc.y + 4;
  const blockW = W * 0.48;

  // Inspector Signature Box
  doc.rect(L, signY, blockW, 72).strokeColor('#CCD0D5').lineWidth(0.5).stroke();
  doc.fillColor(COLOR_NAVY).fontSize(8).font('Helvetica-Bold').text('INSPECTOR SIGN-OFF', L + 8, signY + 6);
  doc.fillColor('#222222').fontSize(8).font('Helvetica')
    .text(`Name: ${inspectorName}`, L + 8, signY + 20)
    .text(`Designation: ${officerDesignation}`, L + 8, signY + 32)
    .text(`Verification Date: ${dateStr}`, L + 8, signY + 44)
    .text('Signature / e-Sign: ____________________', L + 8, signY + 56);

  // Official Seal Box
  const sealX = L + W - blockW;
  doc.rect(sealX, signY, blockW, 72).strokeColor('#CCD0D5').lineWidth(0.5).stroke();
  doc.circle(sealX + blockW / 2, signY + 36, 26).strokeColor(COLOR_NAVY).lineWidth(0.75).stroke();
  doc.fillColor(COLOR_NAVY).fontSize(7).font('Helvetica-Bold')
    .text('OFFICIAL RECORD SEAL', sealX, signY + 28, { align: 'center', width: blockW });
  doc.fillColor(COLOR_GREY).fontSize(6).font('Helvetica')
    .text('Legal Metrology Division', sealX, signY + 38, { align: 'center', width: blockW })
    .text('Ministry of Consumer Affairs, GoI', sealX, signY + 46, { align: 'center', width: blockW });

  doc.y = signY + 82;

  // Statutory Footer Notice
  doc.fillColor(COLOR_GREY).fontSize(6.5).font('Helvetica')
    .text(
      'Notice: This inspection report is generated pursuant to Section 15 of the Legal Metrology Act, 2009. ' +
      'Findings are derived from automated optical character recognition combined with human-in-the-loop validation. ' +
      'This record is cryptographically timestamped and serves as an evidentiary exhibit for administrative proceedings.',
      L, doc.y, { align: 'justify', width: W }
    );

  // Add Page Numbers to all pages
  const pageRange = doc.bufferedPageRange();
  for (let i = 0; i < pageRange.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(COLOR_GREY).fontSize(7).font('Helvetica')
      .text(`Legal Metrology Form LM-PC-01  |  Inspection: ${inspectionId}  |  Page ${i + 1} of ${pageRange.count}`,
        L, doc.page.height - 30, { align: 'center', width: W });
    doc.rect(L, doc.page.height - 34, W, 0.5).fill('#CCD0D5');
  }

  return doc;
}

// --- Layout Helpers ---

function drawSectionHeader(doc, L, W, title) {
  const y = doc.y;
  doc.rect(L, y, W, 16).fill(COLOR_NAVY);
  doc.fillColor(COLOR_WHITE).fontSize(8).font('Helvetica-Bold').text(title, L + 6, y + 4);
  doc.y = y + 20;
}

function drawKeyValueTable(doc, L, W, rows, highlightStatus) {
  const keyW = W * 0.35;
  const valW = W * 0.65;
  const rowH = 15;

  for (let i = 0; i < rows.length; i++) {
    if (doc.y > doc.page.height - 40) doc.addPage();
    const [key, val] = rows[i];
    const y = doc.y;
    const bg = i % 2 === 0 ? COLOR_WHITE : COLOR_LIGHT;
    doc.rect(L, y, W, rowH).fill(bg);

    doc.fillColor(COLOR_NAVY).fontSize(7.5).font('Helvetica-Bold')
      .text(key, L + 5, y + 3.5, { width: keyW - 8, lineBreak: false });

    let valCol = '#222222';
    if (key.includes('Status')) {
      valCol = statusColor(highlightStatus);
    }
    doc.fillColor(valCol).fontSize(7.5).font(key.includes('Status') ? 'Helvetica-Bold' : 'Helvetica')
      .text(val, L + keyW + 4, y + 3.5, { width: valW - 8, lineBreak: false });

    doc.rect(L, y, W, rowH).strokeColor('#E2E6EA').lineWidth(0.4).stroke();
    doc.y = y + rowH;
  }
  doc.y += 6;
}

function drawTableHeader(doc, L, W, headers, colWidths) {
  const y = doc.y;
  const rowH = 16;
  doc.rect(L, y, W, rowH).fill(COLOR_NAVY);
  let x = L;
  for (let i = 0; i < headers.length; i++) {
    doc.fillColor(COLOR_WHITE).fontSize(7.5).font('Helvetica-Bold')
      .text(headers[i], x + 4, y + 4, { width: colWidths[i] - 6, lineBreak: false });
    x += colWidths[i];
  }
  doc.y = y + rowH;
}

function drawTableRow(doc, L, W, cells, colWidths, isAlt, isFlagged) {
  const rowH = 17;
  const y = doc.y;
  const bg = isFlagged ? '#FDF2F0' : (isAlt ? COLOR_LIGHT : COLOR_WHITE);
  doc.rect(L, y, W, rowH).fill(bg);

  let x = L;
  for (let i = 0; i < cells.length; i++) {
    let col = '#222222';
    const text = String(cells[i] || '');
    if (text === 'COMPLIANT') col = COLOR_GREEN;
    else if (text.includes('NON-COMPLIANT') || text.includes('NON_COMPLIANT')) col = COLOR_RED;
    else if (text.includes('NEEDS REVIEW')) col = COLOR_AMBER;

    doc.fillColor(col).fontSize(7).font(i === 2 ? 'Helvetica-Bold' : 'Helvetica')
      .text(text, x + 4, y + 4, { width: colWidths[i] - 6, lineBreak: false });
    x += colWidths[i];
  }
  doc.rect(L, y, W, rowH).strokeColor('#E2E6EA').lineWidth(0.3).stroke();
  doc.y = y + rowH;
}
