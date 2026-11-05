/**
 * clientComplianceEngine.js
 * Client-side evaluation fallback and preset definitions for the HITL Dashboard.
 */

export const PRESETS = [
  {
    id: 'preset-compliant-biscuit',
    name: 'Parle-G Glucose Biscuits (Fully Compliant)',
    productName: 'Parle-G Gold Biscuits',
    brandName: 'Parle',
    packageShape: 'RECTANGULAR',
    dimensions: { height_cm: 15, width_cm: 8, depth_cm: 4 },
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    quality: { blurScore: 185.4, isBlurry: false, glarePercentage: 2.1, isOverexposed: false },
    textBlocks: [
      {
        id: 'tb-1',
        text: 'Parle-G Gold Glucose Biscuits',
        confidence: 0.98,
        bounding_box: { x_min: 40, y_min: 30, x_max: 380, y_max: 75 },
        fieldKey: 'generic_name',
      },
      {
        id: 'tb-2',
        text: 'Generic Name: Biscuits',
        confidence: 0.97,
        bounding_box: { x_min: 40, y_min: 85, x_max: 240, y_max: 115 },
        fieldKey: 'generic_name',
      },
      {
        id: 'tb-3',
        text: 'Net Qty: 200 g',
        confidence: 0.96,
        bounding_box: { x_min: 40, y_min: 130, x_max: 200, y_max: 165 },
        fieldKey: 'net_quantity',
      },
      {
        id: 'tb-4',
        text: 'MRP Rs. 25.00 (Incl. of all taxes)',
        confidence: 0.99,
        bounding_box: { x_min: 40, y_min: 180, x_max: 420, y_max: 220 },
        fieldKey: 'mrp',
      },
      {
        id: 'tb-5',
        text: 'USP: Rs. 0.125 / g',
        confidence: 0.95,
        bounding_box: { x_min: 40, y_min: 235, x_max: 240, y_max: 270 },
        fieldKey: 'unit_sale_price',
      },
      {
        id: 'tb-6',
        text: 'Mfg Date: 10/2026',
        confidence: 0.94,
        bounding_box: { x_min: 40, y_min: 285, x_max: 220, y_max: 320 },
        fieldKey: 'mfg_date',
      },
      {
        id: 'tb-7',
        text: 'Best Before 6 Months from Mfg',
        confidence: 0.93,
        bounding_box: { x_min: 40, y_min: 335, x_max: 330, y_max: 370 },
        fieldKey: 'expiry_date',
      },
      {
        id: 'tb-8',
        text: 'Mfg by: Parle Products Pvt Ltd, V.S. Khandekar Marg, Vile Parle East, Mumbai, Maharashtra - 400057',
        confidence: 0.92,
        bounding_box: { x_min: 40, y_min: 385, x_max: 560, y_max: 445 },
        fieldKey: 'manufacturer',
      },
      {
        id: 'tb-9',
        text: 'Country of Origin: India',
        confidence: 0.97,
        bounding_box: { x_min: 40, y_min: 460, x_max: 260, y_max: 495 },
        fieldKey: 'country_of_origin',
      },
      {
        id: 'tb-10',
        text: 'Customer Care: 1800 22 7700 | care@parle.biz',
        confidence: 0.96,
        bounding_box: { x_min: 40, y_min: 510, x_max: 450, y_max: 545 },
        fieldKey: 'customer_care',
      },
    ],
  },
  {
    id: 'preset-deceptive-mrp',
    name: 'Spicy Potato Chips (Non-Compliant: Missing Tax Inclusive Phrase)',
    productName: 'Crunchy Hot Masala Chips',
    brandName: 'Crunchies',
    packageShape: 'RECTANGULAR',
    dimensions: { height_cm: 20, width_cm: 12, depth_cm: 3 },
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    quality: { blurScore: 142.1, isBlurry: false, glarePercentage: 4.8, isOverexposed: false },
    textBlocks: [
      {
        id: 'tb-1',
        text: 'Hot Masala Potato Chips',
        confidence: 0.98,
        bounding_box: { x_min: 50, y_min: 40, x_max: 350, y_max: 85 },
        fieldKey: 'generic_name',
      },
      {
        id: 'tb-2',
        text: 'Net Wt: 85 g',
        confidence: 0.95,
        bounding_box: { x_min: 50, y_min: 100, x_max: 180, y_max: 135 },
        fieldKey: 'net_quantity',
      },
      {
        id: 'tb-3',
        text: 'MRP Rs. 40.00', // Missing inclusive of all taxes
        confidence: 0.99,
        bounding_box: { x_min: 50, y_min: 150, x_max: 220, y_max: 190 },
        fieldKey: 'mrp',
      },
      {
        id: 'tb-4',
        text: 'USP: Rs. 0.47 / g',
        confidence: 0.93,
        bounding_box: { x_min: 50, y_min: 205, x_max: 230, y_max: 240 },
        fieldKey: 'unit_sale_price',
      },
      {
        id: 'tb-5',
        text: 'Mfg: 11/2026',
        confidence: 0.96,
        bounding_box: { x_min: 50, y_min: 255, x_max: 190, y_max: 290 },
        fieldKey: 'mfg_date',
      },
      {
        id: 'tb-6',
        text: 'Customer Care Phone: +91-9876543210',
        confidence: 0.91,
        bounding_box: { x_min: 50, y_min: 305, x_max: 410, y_max: 340 },
        fieldKey: 'customer_care',
      },
      {
        id: 'tb-7',
        text: 'Mfg by: Snack Masters India, GIDC Industrial Estate, Vadodara, Gujarat - 390010',
        confidence: 0.94,
        bounding_box: { x_min: 50, y_min: 355, x_max: 560, y_max: 410 },
        fieldKey: 'manufacturer',
      },
    ],
  },
  {
    id: 'preset-imported-chocolate',
    name: 'Belgian Dark Chocolate (Non-Compliant: Importer without Origin)',
    productName: 'Noir 85% Dark Chocolate',
    brandName: 'ChocoArt',
    packageShape: 'RECTANGULAR',
    dimensions: { height_cm: 18, width_cm: 9, depth_cm: 1.5 },
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
    quality: { blurScore: 160.0, isBlurry: false, glarePercentage: 1.5, isOverexposed: false },
    textBlocks: [
      {
        id: 'tb-1',
        text: 'Artisan Dark Chocolate Bar',
        confidence: 0.97,
        bounding_box: { x_min: 40, y_min: 30, x_max: 350, y_max: 70 },
        fieldKey: 'generic_name',
      },
      {
        id: 'tb-2',
        text: 'Net Qty: 100 g',
        confidence: 0.98,
        bounding_box: { x_min: 40, y_min: 85, x_max: 180, y_max: 120 },
        fieldKey: 'net_quantity',
      },
      {
        id: 'tb-3',
        text: 'MRP Rs. 299.00 (Inclusive of all taxes)',
        confidence: 0.96,
        bounding_box: { x_min: 40, y_min: 135, x_max: 430, y_max: 175 },
        fieldKey: 'mrp',
      },
      {
        id: 'tb-4',
        text: 'USP: Rs. 2.99 / g',
        confidence: 0.94,
        bounding_box: { x_min: 40, y_min: 190, x_max: 220, y_max: 225 },
        fieldKey: 'unit_sale_price',
      },
      {
        id: 'tb-5',
        text: 'Imported by: Global Confectionery Impex Ltd., DLF Cyber City, Gurugram, Haryana - 122002',
        confidence: 0.95,
        bounding_box: { x_min: 40, y_min: 240, x_max: 560, y_max: 300 },
        fieldKey: 'manufacturer',
      },
      {
        id: 'tb-6',
        text: 'Customer Care: care@globalimpex.in',
        confidence: 0.92,
        bounding_box: { x_min: 40, y_min: 315, x_max: 350, y_max: 350 },
        fieldKey: 'customer_care',
      },
    ],
  },
  {
    id: 'preset-blurry-low-confidence',
    name: 'Bottled Energy Drink (Needs Review: Blurry OCR Scan)',
    productName: 'Electrolyte Energy Spark',
    brandName: 'HydroBlast',
    packageShape: 'CYLINDRICAL',
    dimensions: { height_cm: 22, circumference_cm: 20 },
    imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80',
    quality: { blurScore: 68.2, isBlurry: true, glarePercentage: 12.5, isOverexposed: false },
    textBlocks: [
      {
        id: 'tb-1',
        text: 'HydroBlast Electrolyte Drink',
        confidence: 0.72,
        bounding_box: { x_min: 40, y_min: 50, x_max: 340, y_max: 95 },
        fieldKey: 'generic_name',
      },
      {
        id: 'tb-2',
        text: 'Net Content: 500 ml',
        confidence: 0.65,
        bounding_box: { x_min: 40, y_min: 110, x_max: 230, y_max: 145 },
        fieldKey: 'net_quantity',
      },
      {
        id: 'tb-3',
        text: 'MRP Rs. 75.00 (Incl. of all taxes)',
        confidence: 0.68,
        bounding_box: { x_min: 40, y_min: 160, x_max: 360, y_max: 200 },
        fieldKey: 'mrp',
      },
      {
        id: 'tb-4',
        text: 'USP: Rs. 0.15 / ml',
        confidence: 0.62,
        bounding_box: { x_min: 40, y_min: 215, x_max: 220, y_max: 250 },
        fieldKey: 'unit_sale_price',
      },
      {
        id: 'tb-5',
        text: 'Mfg Date: 08/2026',
        confidence: 0.69,
        bounding_box: { x_min: 40, y_min: 265, x_max: 180, y_max: 295 },
        fieldKey: 'mfg_date',
      },
      {
        id: 'tb-6',
        text: 'Best Before 12 Months from Mfg',
        confidence: 0.70,
        bounding_box: { x_min: 40, y_min: 310, x_max: 310, y_max: 340 },
        fieldKey: 'expiry_date',
      },
      {
        id: 'tb-7',
        text: 'Mfg by: Hydro Tech Beverages, Industrial Area, Solan, Himachal Pradesh - 173229',
        confidence: 0.73,
        bounding_box: { x_min: 40, y_min: 355, x_max: 520, y_max: 405 },
        fieldKey: 'manufacturer',
      },
      {
        id: 'tb-8',
        text: 'Country of Origin: India',
        confidence: 0.75,
        bounding_box: { x_min: 40, y_min: 415, x_max: 240, y_max: 445 },
        fieldKey: 'country_of_origin',
      },
      {
        id: 'tb-9',
        text: 'Customer Care: 1800 11 2233 | care@hydroblast.com',
        confidence: 0.74,
        bounding_box: { x_min: 40, y_min: 455, x_max: 420, y_max: 485 },
        fieldKey: 'customer_care',
      },
    ],
  },
  {
    id: 'preset-sunflower-oil',
    name: 'Fortune Sunflower Oil 1L Pouch (Fully Compliant)',
    productName: 'Refined Sunflower Oil',
    brandName: 'Fortune',
    packageShape: 'RECTANGULAR',
    dimensions: { height_cm: 26, width_cm: 15, depth_cm: 5 },
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    quality: { blurScore: 175.0, isBlurry: false, glarePercentage: 3.2, isOverexposed: false },
    textBlocks: [
      {
        id: 'tb-1',
        text: 'Fortune Sunlite Refined Sunflower Oil',
        confidence: 0.98,
        bounding_box: { x_min: 50, y_min: 30, x_max: 380, y_max: 75 },
        fieldKey: 'generic_name',
      },
      {
        id: 'tb-2',
        text: 'Generic Name: Edible Vegetable Oil',
        confidence: 0.96,
        bounding_box: { x_min: 50, y_min: 85, x_max: 310, y_max: 115 },
        fieldKey: 'generic_name',
      },
      {
        id: 'tb-3',
        text: 'Net Quantity: 1 L',
        confidence: 0.97,
        bounding_box: { x_min: 50, y_min: 130, x_max: 210, y_max: 165 },
        fieldKey: 'net_quantity',
      },
      {
        id: 'tb-4',
        text: 'MRP Rs. 145.00 (inclusive of all taxes)',
        confidence: 0.99,
        bounding_box: { x_min: 50, y_min: 180, x_max: 410, y_max: 220 },
        fieldKey: 'mrp',
      },
      {
        id: 'tb-5',
        text: 'USP: Rs. 145.00 / l',
        confidence: 0.95,
        bounding_box: { x_min: 50, y_min: 235, x_max: 240, y_max: 268 },
        fieldKey: 'unit_sale_price',
      },
      {
        id: 'tb-6',
        text: 'Date of Packing: 09/2026',
        confidence: 0.94,
        bounding_box: { x_min: 50, y_min: 285, x_max: 250, y_max: 315 },
        fieldKey: 'mfg_date',
      },
      {
        id: 'tb-7',
        text: 'Best Before 9 Months from Packing',
        confidence: 0.93,
        bounding_box: { x_min: 50, y_min: 330, x_max: 330, y_max: 360 },
        fieldKey: 'expiry_date',
      },
      {
        id: 'tb-8',
        text: 'Manufactured by: Adani Wilmar Limited, Fortune House, Near Navrangpura Railway Crossing, Ahmedabad, Gujarat - 380009',
        confidence: 0.93,
        bounding_box: { x_min: 50, y_min: 380, x_max: 560, y_max: 440 },
        fieldKey: 'manufacturer',
      },
      {
        id: 'tb-9',
        text: 'Country of Origin: India',
        confidence: 0.98,
        bounding_box: { x_min: 50, y_min: 455, x_max: 240, y_max: 485 },
        fieldKey: 'country_of_origin',
      },
      {
        id: 'tb-10',
        text: 'Customer Care Toll Free: 1800 233 9999 | consumercare@adaniwilmar.in',
        confidence: 0.95,
        bounding_box: { x_min: 50, y_min: 500, x_max: 480, y_max: 535 },
        fieldKey: 'customer_care',
      },
    ],
  },
];

export function calculateClientPdpArea(shape, dimensions = {}) {
  const s = String(shape || 'RECTANGULAR').toUpperCase();
  if (s === 'CYLINDRICAL') {
    const h = parseFloat(dimensions.height_cm || 0);
    const c = parseFloat(dimensions.circumference_cm || 0);
    if (h > 0 && c > 0) return parseFloat((0.4 * h * c).toFixed(2));
  }
  const h = parseFloat(dimensions.height_cm || 0);
  const w = parseFloat(dimensions.width_cm || 0);
  if (h > 0 && w > 0) return parseFloat((h * w).toFixed(2));
  return 120.0;
}

export function requiredMinFontHeightMm(pdpAreaSqCm) {
  if (pdpAreaSqCm <= 50) return 1.0;
  if (pdpAreaSqCm <= 100) return 1.5;
  if (pdpAreaSqCm <= 500) return 2.5;
  if (pdpAreaSqCm <= 2500) return 4.0;
  return 6.0;
}

/**
 * Client-side compliance evaluation fallback.
 */
export function evaluateDeclarationsClient(declarations = {}, pdpAreaSqCm = 120, minObservedFontMm = 3.0) {
  const evaluations = [];

  // 1. MRP
  const mrp = declarations.mrp;
  if (!mrp) {
    evaluations.push({
      ruleCode: 'RULE_6_1_E_MRP',
      title: 'Maximum Retail Price (MRP) inclusive of all taxes',
      legalCitation: 'Rule 6(1)(e) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NON_COMPLIANT',
      explanation: 'No MRP declaration was detected on the packaging label.',
      evidenceSnippet: null,
    });
  } else if (!mrp.isUserOverridden && mrp.confidence < 0.8) {
    evaluations.push({
      ruleCode: 'RULE_6_1_E_MRP',
      title: 'Maximum Retail Price (MRP) inclusive of all taxes',
      legalCitation: 'Rule 6(1)(e) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NEEDS_REVIEW',
      explanation: `MRP text detected with low confidence (${(mrp.confidence * 100).toFixed(0)}%). Please inspect and confirm.`,
      evidenceSnippet: mrp.rawText,
    });
  } else if (!mrp.normalizedValue?.inclTaxes) {
    evaluations.push({
      ruleCode: 'RULE_6_1_E_MRP',
      title: 'Maximum Retail Price (MRP) inclusive of all taxes',
      legalCitation: 'Rule 6(1)(e) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NON_COMPLIANT',
      explanation: 'Mandatory phrase "inclusive of all taxes" is absent from the MRP declaration.',
      evidenceSnippet: mrp.rawText,
    });
  } else {
    evaluations.push({
      ruleCode: 'RULE_6_1_E_MRP',
      title: 'Maximum Retail Price (MRP) inclusive of all taxes',
      legalCitation: 'Rule 6(1)(e) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'COMPLIANT',
      explanation: `Declared MRP of ₹${mrp.normalizedValue.amount?.toFixed(2)} inclusive of all taxes complies with Rule 6(1)(e).`,
      evidenceSnippet: mrp.rawText,
    });
  }

  // 2. USP
  const usp = declarations.unit_sale_price;
  const netQty = declarations.net_quantity;
  if (!usp) {
    evaluations.push({
      ruleCode: 'RULE_6_11_USP',
      title: 'Unit Sale Price (USP) per standard base unit',
      legalCitation: 'Rule 6(11) LM(PC) Rules 2011 · GSR 779(E)',
      status: 'NEEDS_REVIEW',
      explanation: 'No Unit Sale Price declaration detected. Required for packaged goods under 2021 amendments.',
      evidenceSnippet: null,
    });
  } else if (!usp.isUserOverridden && usp.confidence < 0.8) {
    evaluations.push({
      ruleCode: 'RULE_6_11_USP',
      title: 'Unit Sale Price (USP) per standard base unit',
      legalCitation: 'Rule 6(11) LM(PC) Rules 2011 · GSR 779(E)',
      status: 'NEEDS_REVIEW',
      explanation: `USP text detected with low confidence (${(usp.confidence * 100).toFixed(0)}%).`,
      evidenceSnippet: usp.rawText,
    });
  } else {
    evaluations.push({
      ruleCode: 'RULE_6_11_USP',
      title: 'Unit Sale Price (USP) per standard base unit',
      legalCitation: 'Rule 6(11) LM(PC) Rules 2011 · GSR 779(E)',
      status: 'COMPLIANT',
      explanation: `Unit Sale Price declared as ₹${usp.normalizedValue?.amount} per ${usp.normalizedValue?.baseUnit}.`,
      evidenceSnippet: usp.rawText,
    });
  }

  // 3. Font Size (Rule 7)
  const requiredFontMm = requiredMinFontHeightMm(pdpAreaSqCm);
  if (minObservedFontMm >= requiredFontMm) {
    evaluations.push({
      ruleCode: 'RULE_7_FONT_SIZE',
      title: 'Minimum numeral and letter font height based on PDP area',
      legalCitation: 'Rule 7, Table-I LM(PC) Rules 2011 · GSR 830(E)',
      status: 'COMPLIANT',
      explanation: `Observed font height (${minObservedFontMm.toFixed(1)}mm) meets minimum required ${requiredFontMm.toFixed(1)}mm for ${pdpAreaSqCm}cm² PDP.`,
      evidenceSnippet: `PDP Area: ${pdpAreaSqCm} cm² · Observed: ${minObservedFontMm}mm`,
    });
  } else {
    evaluations.push({
      ruleCode: 'RULE_7_FONT_SIZE',
      title: 'Minimum numeral and letter font height based on PDP area',
      legalCitation: 'Rule 7, Table-I LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NON_COMPLIANT',
      explanation: `Observed font height (${minObservedFontMm.toFixed(1)}mm) is below required ${requiredFontMm.toFixed(1)}mm for ${pdpAreaSqCm}cm² PDP.`,
      evidenceSnippet: `PDP Area: ${pdpAreaSqCm} cm² · Required: ${requiredFontMm}mm`,
    });
  }

  // 4. Manufacturer
  const mfg = declarations.manufacturer;
  if (!mfg) {
    evaluations.push({
      ruleCode: 'RULE_6_1_A_MANUFACTURER',
      title: 'Name and complete address of manufacturer or packer',
      legalCitation: 'Rule 6(1)(a) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NON_COMPLIANT',
      explanation: 'Missing manufacturer or packer declaration on package.',
      evidenceSnippet: null,
    });
  } else if (!mfg.normalizedValue?.pincode) {
    evaluations.push({
      ruleCode: 'RULE_6_1_A_MANUFACTURER',
      title: 'Name and complete address of manufacturer or packer',
      legalCitation: 'Rule 6(1)(a) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NEEDS_REVIEW',
      explanation: 'Manufacturer declaration found but 6-digit postal PIN code is missing.',
      evidenceSnippet: mfg.rawText,
    });
  } else {
    evaluations.push({
      ruleCode: 'RULE_6_1_A_MANUFACTURER',
      title: 'Name and complete address of manufacturer or packer',
      legalCitation: 'Rule 6(1)(a) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'COMPLIANT',
      explanation: `Complete postal address verified with PIN code ${mfg.normalizedValue.pincode}.`,
      evidenceSnippet: mfg.rawText,
    });
  }

  // 5. Country of Origin
  const origin = declarations.country_of_origin;
  if (origin) {
    evaluations.push({
      ruleCode: 'RULE_6_1_AA_ORIGIN',
      title: 'Country of origin for imported goods',
      legalCitation: 'Rule 6(1)(aa) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'COMPLIANT',
      explanation: `Country of origin verified: "${origin.normalizedValue?.country}".`,
      evidenceSnippet: origin.rawText,
    });
  } else if (mfg?.normalizedValue?.role === 'importer') {
    evaluations.push({
      ruleCode: 'RULE_6_1_AA_ORIGIN',
      title: 'Country of origin for imported goods',
      legalCitation: 'Rule 6(1)(aa) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NON_COMPLIANT',
      explanation: 'Package has an importer declaration but country of origin is missing.',
      evidenceSnippet: mfg.rawText,
    });
  } else {
    evaluations.push({
      ruleCode: 'RULE_6_1_AA_ORIGIN',
      title: 'Country of origin for imported goods',
      legalCitation: 'Rule 6(1)(aa) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'COMPLIANT',
      explanation: 'Domestic product with verified manufacturer address.',
      evidenceSnippet: null,
    });
  }

  // 6. Net Quantity
  if (!netQty) {
    evaluations.push({
      ruleCode: 'RULE_6_1_C_NET_QUANTITY',
      title: 'Net quantity in standard metric units',
      legalCitation: 'Rule 6(1)(c) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NON_COMPLIANT',
      explanation: 'Net quantity declaration missing from package.',
      evidenceSnippet: null,
    });
  } else {
    evaluations.push({
      ruleCode: 'RULE_6_1_C_NET_QUANTITY',
      title: 'Net quantity in standard metric units',
      legalCitation: 'Rule 6(1)(c) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'COMPLIANT',
      explanation: `Declared net quantity of ${netQty.normalizedValue?.magnitude} ${netQty.normalizedValue?.unit} complies with metric standards.`,
      evidenceSnippet: netQty.rawText,
    });
  }

  // 7. Manufacturing Date
  const mfgDate = declarations.mfg_date;
  if (!mfgDate) {
    evaluations.push({
      ruleCode: 'RULE_6_1_D_MFG_DATE',
      title: 'Month and year of manufacture or packing',
      legalCitation: 'Rule 6(1)(d) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'NON_COMPLIANT',
      explanation: 'Month and year of manufacture/packing is missing.',
      evidenceSnippet: null,
    });
  } else {
    evaluations.push({
      ruleCode: 'RULE_6_1_D_MFG_DATE',
      title: 'Month and year of manufacture or packing',
      legalCitation: 'Rule 6(1)(d) LM(PC) Rules 2011 · GSR 830(E)',
      status: 'COMPLIANT',
      explanation: `Manufacturing date declared as ${mfgDate.normalizedValue?.formatted || mfgDate.rawText}.`,
      evidenceSnippet: mfgDate.rawText,
    });
  }

  // 8. Consumer Care
  const care = declarations.customer_care;
  if (!care) {
    evaluations.push({
      ruleCode: 'RULE_6_2_CUSTOMER_CARE',
      title: 'Customer care details for grievance redressal',
      legalCitation: 'Rule 6(2) LM(PC) Rules 2011 · GSR 779(E)',
      status: 'NON_COMPLIANT',
      explanation: 'No consumer care phone number or email address found.',
      evidenceSnippet: null,
    });
  } else {
    evaluations.push({
      ruleCode: 'RULE_6_2_CUSTOMER_CARE',
      title: 'Customer care details for grievance redressal',
      legalCitation: 'Rule 6(2) LM(PC) Rules 2011 · GSR 779(E)',
      status: 'COMPLIANT',
      explanation: `Consumer grievance contact verified (${care.normalizedValue?.phone || ''} ${care.normalizedValue?.email || ''}).`,
      evidenceSnippet: care.rawText,
    });
  }

  let overallStatus = 'COMPLIANT';
  if (evaluations.some((e) => e.status === 'NON_COMPLIANT')) overallStatus = 'NON_COMPLIANT';
  else if (evaluations.some((e) => e.status === 'NEEDS_REVIEW')) overallStatus = 'NEEDS_REVIEW';

  return { evaluations, overallStatus };
}

