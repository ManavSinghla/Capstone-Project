/**
 * normalizer.js — Raw OCR text ? Structured Declaration Entities
 *
 * Accepts the array of text_blocks from the OCR service response
 * and parses each block into strongly typed declaration objects.
 *
 * This module is PURE — no DB, no Express, no OCR dependencies.
 * All regex patterns produce null on non-match (never throw).
 *
 * Returns: { fieldName: { rawText, normalizedValue, boundingBox, confidence } }
 */

import { MIN_CONFIDENCE_THRESHOLD } from './types.js';

// --- MRP -----------------------------------------------------------------------
// Accepts: "MRP Rs. 85.00 (Incl. of all taxes)"
//          "M.R.P. ? 85  (inclusive of all taxes)"
//          "Maximum Retail Price Rs.85.50 Incl. of all taxes"
const MRP_PATTERN =
  /(?:m\.?r\.?p\.?|maximum\s+retail\s+price)\s*(?:rs\.?|?|inr)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:\(?\s*incl(?:usive)?\.?\s+of\s+all\s+taxes\s*\)?)/i;

// --- Unit Sale Price ------------------------------------------------------------
// Accepts: "Unit Sale Price: Rs. 0.60/g"  "USP: ?0.425 per g"
const USP_PATTERN =
  /(?:unit\s+sale\s+price|u\.?s\.?p\.?)\s*:?\s*(?:rs\.?|?|inr)?\s*([\d,]+(?:\.\d{1,4})?)\s*(?:\/|per\s+)(g|kg|ml|l|cm|m|no|number|piece|pcs)/i;

// --- Net Quantity ---------------------------------------------------------------
// Accepts: "Net Wt: 200 g"  "Net Qty 1.5 kg"  "Net Content 500 ml"
const NET_QTY_PATTERN =
  /net\s+(?:wt\.?|weight|qty\.?|quantity|content|vol\.?|volume)?\s*:?\s*([\d,]+(?:\.\d+)?)\s*(g|kg|ml|l|cm|m|nos?\.?|pieces?|pcs)/i;

// --- Manufacturing Date ---------------------------------------------------------
// Accepts: "Mfg: 10/2026"  "Manufactured: October 2026"  "Date of Mfg: 10-2026"
const MFG_DATE_PATTERN =
  /(?:mfg\.?|mfd\.?|manufactured|packing|packed)\s*(?:date|on)?\s*:?\s*(\d{1,2})[\/\-](\d{4})/i;

// --- Customer Care --------------------------------------------------------------
const PHONE_PATTERN = /(?:\+91[-\s]?)?[6-9]\d{9}|1[0-9]{3}-?[0-9]{3}-?[0-9]{4}/;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

/**
 * Parses a single OCR text block into a named declaration field (or null).
 * @param {Object} block - A text_block from the OCR service
 * @param {string} block.text
 * @param {number} block.confidence
 * @param {Object} block.bounding_box
 * @returns {{ fieldName: string, parsed: Object }|null}
 */
function parseBlock(block) {
  const { text, confidence, bounding_box } = block;
  const base = { rawText: text, confidence, boundingBox: bounding_box };

  const mrpMatch = text.match(MRP_PATTERN);
  if (mrpMatch) {
    return {
      fieldName: 'mrp',
      parsed: {
        ...base,
        normalizedValue: {
          amount: parseFloat(mrpMatch[1].replace(',', '')),
          currency: 'INR',
          inclTaxes: true,
        },
      },
    };
  }

  const uspMatch = text.match(USP_PATTERN);
  if (uspMatch) {
    return {
      fieldName: 'unit_sale_price',
      parsed: {
        ...base,
        normalizedValue: {
          amount: parseFloat(uspMatch[1].replace(',', '')),
          baseUnit: uspMatch[2].toLowerCase(),
        },
      },
    };
  }

  const qtyMatch = text.match(NET_QTY_PATTERN);
  if (qtyMatch) {
    return {
      fieldName: 'net_quantity',
      parsed: {
        ...base,
        normalizedValue: {
          magnitude: parseFloat(qtyMatch[1].replace(',', '')),
          unit: qtyMatch[2].toLowerCase(),
        },
      },
    };
  }

  const mfgMatch = text.match(MFG_DATE_PATTERN);
  if (mfgMatch) {
    return {
      fieldName: 'mfg_date',
      parsed: {
        ...base,
        normalizedValue: {
          month: parseInt(mfgMatch[1], 10),
          year: parseInt(mfgMatch[2], 10),
        },
      },
    };
  }

  // Customer care: phone and email may appear in separate blocks; collect both.
  const phone = text.match(PHONE_PATTERN);
  const email = text.match(EMAIL_PATTERN);
  if (phone || email) {
    return {
      fieldName: 'customer_care',
      parsed: {
        ...base,
        normalizedValue: {
          phone: phone ? phone[0] : null,
          email: email ? email[0] : null,
        },
      },
    };
  }

  return null;
}

/**
 * Normalizes an array of OCR text blocks into a declarations map.
 *
 * @param {Array} textBlocks - Array of OCR text blocks
 * @returns {Object} Map of fieldName -> { rawText, normalizedValue, boundingBox, confidence }
 */
export function normalizeDeclarations(textBlocks) {
  const declarations = {};

  for (const block of textBlocks) {
    const result = parseBlock(block);
    if (!result) continue;

    const { fieldName, parsed } = result;

    // Keep the higher-confidence extraction if a field appears more than once.
    if (
      !declarations[fieldName] ||
      parsed.confidence > declarations[fieldName].confidence
    ) {
      declarations[fieldName] = parsed;
    }
  }

  return declarations;
}

/**
 * Checks if a declaration's confidence meets the minimum threshold.
 * Used by rules to decide between NON_COMPLIANT and NEEDS_REVIEW.
 *
 * @param {Object} declaration
 * @returns {boolean}
 */
export function isConfident(declaration) {
  return declaration && declaration.confidence >= MIN_CONFIDENCE_THRESHOLD;
}
