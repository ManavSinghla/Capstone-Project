/**
 * normalizer.js — Raw OCR text -> Structured Declaration Entities
 *
 * Accepts the array of text_blocks from the OCR service response
 * and parses each block into strongly typed declaration objects
 * under the Legal Metrology (Packaged Commodities) Rules, 2011.
 *
 * This module is PURE — zero external DB, network, or framework dependencies.
 * All regex patterns produce null on non-match (never throw).
 *
 * Returns: { fieldName: { rawText, normalizedValue, boundingBox, confidence, isUserOverridden? } }
 */

import { MIN_CONFIDENCE_THRESHOLD } from './types.js';

// --- Indian Currency Patterns --------------------------------------------------
const CURRENCY_REGEX = '(?:rs\\.?|\\u20B9|inr)?';

// --- Rule 6(1)(e): MRP ---------------------------------------------------------
// Mandatory format: MRP inclusive of all taxes.
// 1. With statutory taxes phrase:
const MRP_WITH_TAXES_PATTERN = new RegExp(
  `(?:m\\.?r\\.?p\\.?|maximum\\s+retail\\s+price)\\s*${CURRENCY_REGEX}\\s*([\\d,]+(?:\\.\\d{1,2})?)\\s*(?:\\(?\\s*incl(?:usive)?\\.?\\s+(?:of\\s+)?all\\s+taxes\\s*\\)?)`,
  'i'
);

// 2. Bare MRP without taxes phrase (triggers non-compliance in rule evaluation):
const MRP_BARE_PATTERN = new RegExp(
  `(?:m\\.?r\\.?p\\.?|maximum\\s+retail\\s+price)\\s*${CURRENCY_REGEX}\\s*([\\d,]+(?:\\.\\d{1,2})?)`,
  'i'
);

// --- Rule 6(11): Unit Sale Price (USP) -----------------------------------------
// Accepts: "Unit Sale Price: Rs. 0.60/g", "USP: ₹0.425 per g", "USP: Rs. 1.20 / ml", "USP: ₹50.00 per kg"
const USP_PATTERN = new RegExp(
  `(?:unit\\s+sale\\s+price|u\\.?s\\.?p\\.?)\\s*:?\\s*${CURRENCY_REGEX}\\s*([\\d,]+(?:\\.\\d{1,4})?)\\s*(?:\\/|per\\s+)(g|kg|gm|gms|ml|l|ltr|litres?|cm|m|meters?|no|nos?\\.?|pieces?|pcs|units?|u|n)\\b`,
  'i'
);

// --- Rule 6(1)(c): Net Quantity ------------------------------------------------
// Standard metric units under Second Schedule: g, kg, ml, l, m, cm, mm, N, U
const NET_QTY_PATTERN =
  /(?:net\s+(?:wt\.?|weight|qty\.?|quantity|content|vol\.?|volume)|weight|quantity)\s*:?\s*([\d,]+(?:\.\d+)?)\s*(kg|g|gm|gms|grams?|l|ltr|litres?|ml|milli\s*litres?|cm|m|meters?|nos?\.?|pieces?|pcs|units?|u|n)\b/i;

// Fallback short net qty pattern (e.g. "200 g", "500 ml" when label is concise)
const NET_QTY_SHORT_PATTERN =
  /^([\d,]+(?:\.\d+)?)\s*(kg|g|gm|gms|l|ltr|ml|cm|m|nos?|pcs|units?)\b/i;

// --- Rule 6(1)(d): Month & Year of Manufacture / Packing -----------------------
// 1. Numeric: "Mfg: 10/2026", "Mfd on 05/2024", "Date of Mfg: 10-2026", "PKD 03/24"
const MFG_NUMERIC_PATTERN =
  /(?:mfg\.?|mfd\.?|manufactured|packing|packed|pkd)\s*(?:date|on)?\s*:?\s*(\d{1,2})[\/\-](\d{2,4})/i;

// 2. Named month: "Mfg: OCT 2024", "Manufactured: October 2026", "Packed: Jan 2025"
const MFG_TEXT_PATTERN =
  /(?:mfg\.?|mfd\.?|manufactured|packing|packed|pkd)\s*(?:date|on)?\s*:?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s\.\/\-](\d{2,4})/i;

// --- Rule 6(1)(da): Expiry Date / Best Before ----------------------------------
// 1. Explicit Expiry: "Expiry Date: 10/2027", "EXP: 12/2025", "Best Before: 06/2026", "Use by: 15/08/2026"
const EXPIRY_NUMERIC_PATTERN =
  /(?:exp\.?|expiry|best\s+before|use\s+by)\s*(?:date)?\s*:?\s*(?:(\d{1,2})[\/\-])?(\d{1,2})[\/\-](\d{2,4})/i;

// 2. Named month expiry: "Best Before: Nov 2026", "EXP: Dec 2025"
const EXPIRY_TEXT_PATTERN =
  /(?:exp\.?|expiry|best\s+before|use\s+by)\s*(?:date)?\s*:?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s\.\/\-](\d{2,4})/i;

// 3. Duration phrase: "Best Before 12 Months from Mfg", "Use within 180 days of pkd"
const EXPIRY_DURATION_PATTERN =
  /(?:best\s+before|use\s+within)\s*:?\s*(\d+)\s*(months?|days?|years?)\s*(?:from\s+(?:mfg|packing|pkd|date\s+of\s+mfg))?/i;

// --- Rule 6(1)(a): Manufacturer / Packer Name & Postal Address ------------------
// Identifies manufacturer/packer/importer lead-ins and postal address
const MFG_ADDRESS_PATTERN =
  /(?:mfg\.?\s*(?:&|and)?\s*pkd\.?\s*by|manufactured\s*(?:&|and)?\s*packed\s*by|manufactured\s*by|mfd\.?\s*by|packed\s*by|pkd\.?\s*by|marketed\s*by|mktd\.?\s*by|imported\s*by)\s*:?\s*([^\n\r]+)/i;

// Indian 6-digit postal PIN code (e.g. 110001, 560001, 400 099, 173229)
const INDIAN_PINCODE_PATTERN = /\b([1-9][0-9]{2}\s?[0-9]{3})\b/;

// Common Indian States for address validation
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry'
];

// --- Rule 6(1)(aa): Country of Origin ------------------------------------------
const COUNTRY_ORIGIN_PATTERN =
  /(?:country\s+of\s+origin|made\s+in|product\s+of|origin)\s*:?\s*([a-zA-Z\s]{3,25})/i;

// --- Rule 6(1)(b): Generic / Common Name ---------------------------------------
const GENERIC_NAME_PATTERN =
  /(?:generic\s+name|commodity|product\s+name|item)\s*:?\s*([a-zA-Z0-9\s\(\)\-]{3,40})/i;

// --- Rule 6(2): Consumer Care Details ------------------------------------------
const PHONE_PATTERN =
  /(?:\+91[-\s]?)?[6-9]\d{9}|1800[-\s]?\d{3}[-\s]?\d{3,4}|1[0-9]{3}-?[0-9]{3}-?[0-9]{4}/;
const EMAIL_PATTERN =
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const CARE_ADDRESS_PATTERN =
  /(?:consumer\s+care|customer\s+care|feedback|in\s+case\s+of\s+complaints)\s*:?\s*([^\n\r]+)/i;

// Month abbreviation map
const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

/**
 * Normalizes 2-digit or 4-digit year into full 4-digit number.
 * e.g. 24 -> 2024, 2026 -> 2026.
 */
function normalizeYear(yearStr) {
  const y = parseInt(yearStr, 10);
  if (y < 100) return 2000 + y;
  return y;
}

/**
 * Normalizes metric quantity unit string into standard symbol.
 */
function normalizeUnit(unitStr) {
  const u = unitStr.toLowerCase().trim();
  if (['g', 'gm', 'gms', 'gram', 'grams'].includes(u)) return 'g';
  if (['kg', 'kgs', 'kilogram', 'kilograms'].includes(u)) return 'kg';
  if (['ml', 'milli litres', 'millilitres'].includes(u)) return 'ml';
  if (['l', 'ltr', 'litre', 'litres', 'liter'].includes(u)) return 'l';
  if (['cm', 'centimetre', 'centimeter'].includes(u)) return 'cm';
  if (['m', 'meter', 'metre', 'meters'].includes(u)) return 'm';
  if (['no', 'nos', 'number', 'piece', 'pieces', 'pcs', 'unit', 'units', 'u', 'n'].includes(u)) return 'number';
  return u;
}

/**
 * Parses a single OCR text block into a named declaration field.
 *
 * @param {Object} block - An individual OCR text_block
 * @returns {{ fieldName: string, parsed: Object }|null}
 */
export function parseBlock(block) {
  const { text, confidence, bounding_box } = block;
  const base = { rawText: text, confidence, boundingBox: bounding_box };

  // 1. MRP (Check with tax clause first, then bare)
  const mrpTaxMatch = text.match(MRP_WITH_TAXES_PATTERN);
  if (mrpTaxMatch) {
    return {
      fieldName: 'mrp',
      parsed: {
        ...base,
        normalizedValue: {
          amount: parseFloat(mrpTaxMatch[1].replace(/,/g, '')),
          currency: 'INR',
          inclTaxes: true,
        },
      },
    };
  }

  const mrpBareMatch = text.match(MRP_BARE_PATTERN);
  if (mrpBareMatch) {
    return {
      fieldName: 'mrp',
      parsed: {
        ...base,
        normalizedValue: {
          amount: parseFloat(mrpBareMatch[1].replace(/,/g, '')),
          currency: 'INR',
          inclTaxes: false,
        },
      },
    };
  }

  // 2. Unit Sale Price (USP)
  const uspMatch = text.match(USP_PATTERN);
  if (uspMatch) {
    const rawUnit = uspMatch[2].toLowerCase();
    return {
      fieldName: 'unit_sale_price',
      parsed: {
        ...base,
        normalizedValue: {
          amount: parseFloat(uspMatch[1].replace(/,/g, '')),
          baseUnit: normalizeUnit(rawUnit),
          rawUnit,
          currency: 'INR',
        },
      },
    };
  }

  // 3. Net Quantity
  const qtyMatch = text.match(NET_QTY_PATTERN);
  if (qtyMatch) {
    const unit = normalizeUnit(qtyMatch[2]);
    return {
      fieldName: 'net_quantity',
      parsed: {
        ...base,
        normalizedValue: {
          magnitude: parseFloat(qtyMatch[1].replace(/,/g, '')),
          unit,
          isStandardUnit: ['g', 'kg', 'ml', 'l', 'm', 'cm', 'number'].includes(unit),
        },
      },
    };
  }

  // 4. Manufacturing Date
  const mfgNumMatch = text.match(MFG_NUMERIC_PATTERN);
  if (mfgNumMatch) {
    const month = parseInt(mfgNumMatch[1], 10);
    const year = normalizeYear(mfgNumMatch[2]);
    if (month >= 1 && month <= 12) {
      return {
        fieldName: 'mfg_date',
        parsed: {
          ...base,
          normalizedValue: {
            month,
            year,
            formatted: `${String(month).padStart(2, '0')}/${year}`,
          },
        },
      };
    }
  }

  const mfgTextMatch = text.match(MFG_TEXT_PATTERN);
  if (mfgTextMatch) {
    const monthKey = mfgTextMatch[1].toLowerCase().slice(0, 3);
    const month = MONTH_MAP[monthKey] || 1;
    const year = normalizeYear(mfgTextMatch[2]);
    return {
      fieldName: 'mfg_date',
      parsed: {
        ...base,
        normalizedValue: {
          month,
          year,
          formatted: `${String(month).padStart(2, '0')}/${year}`,
        },
      },
    };
  }

  // 5. Expiry Date / Best Before
  const expDurationMatch = text.match(EXPIRY_DURATION_PATTERN);
  if (expDurationMatch) {
    return {
      fieldName: 'expiry_date',
      parsed: {
        ...base,
        normalizedValue: {
          durationValue: parseInt(expDurationMatch[1], 10),
          durationUnit: expDurationMatch[2].toLowerCase(),
          isDuration: true,
          formatted: `Best before ${expDurationMatch[1]} ${expDurationMatch[2]} from mfg`,
        },
      },
    };
  }

  const expNumMatch = text.match(EXPIRY_NUMERIC_PATTERN);
  if (expNumMatch) {
    const m = parseInt(expNumMatch[2], 10);
    const y = normalizeYear(expNumMatch[3]);
    if (m >= 1 && m <= 12) {
      return {
        fieldName: 'expiry_date',
        parsed: {
          ...base,
          normalizedValue: {
            day: expNumMatch[1] ? parseInt(expNumMatch[1], 10) : null,
            month: m,
            year: y,
            isDuration: false,
            formatted: `${String(m).padStart(2, '0')}/${y}`,
          },
        },
      };
    }
  }

  const expTextMatch = text.match(EXPIRY_TEXT_PATTERN);
  if (expTextMatch) {
    const monthKey = expTextMatch[1].toLowerCase().slice(0, 3);
    const m = MONTH_MAP[monthKey] || 1;
    const y = normalizeYear(expTextMatch[2]);
    return {
      fieldName: 'expiry_date',
      parsed: {
        ...base,
        normalizedValue: {
          day: null,
          month: m,
          year: y,
          isDuration: false,
          formatted: `${String(m).padStart(2, '0')}/${y}`,
        },
      },
    };
  }

  // 6. Country of Origin
  const originMatch = text.match(COUNTRY_ORIGIN_PATTERN);
  if (originMatch) {
    const country = originMatch[1].trim();
    const isDomestic = /^india$/i.test(country);
    return {
      fieldName: 'country_of_origin',
      parsed: {
        ...base,
        normalizedValue: {
          country,
          isDomestic,
        },
      },
    };
  }

  // 7. Generic / Common Name
  const genericMatch = text.match(GENERIC_NAME_PATTERN);
  if (genericMatch) {
    return {
      fieldName: 'generic_name',
      parsed: {
        ...base,
        normalizedValue: {
          name: genericMatch[1].trim(),
        },
      },
    };
  }

  // 8. Manufacturer / Packer Address
  const mfgAddrMatch = text.match(MFG_ADDRESS_PATTERN);
  const pinMatch = text.match(INDIAN_PINCODE_PATTERN);
  if (mfgAddrMatch || pinMatch) {
    const fullText = text.trim();
    const roleMatch = fullText.match(/(mfg|manufactured|pkd|packed|marketed|imported)/i);
    let role = 'manufacturer';
    if (roleMatch) {
      const r = roleMatch[1].toLowerCase();
      if (r.startsWith('pk') || r.startsWith('pack')) role = 'packer';
      else if (r.startsWith('mk') || r.startsWith('mark')) role = 'marketer';
      else if (r.startsWith('imp')) role = 'importer';
    }

    // Detect state if mentioned
    let detectedState = null;
    for (const state of INDIAN_STATES) {
      if (new RegExp(`\\b${state}\\b`, 'i').test(fullText)) {
        detectedState = state;
        break;
      }
    }

    const pincode = pinMatch ? pinMatch[1].replace(/\s/g, '') : null;

    return {
      fieldName: 'manufacturer',
      parsed: {
        ...base,
        normalizedValue: {
          role,
          name: mfgAddrMatch ? mfgAddrMatch[1].split(',')[0].trim() : fullText.split(',')[0].trim(),
          address: fullText,
          pincode,
          state: detectedState,
          hasPincode: Boolean(pincode),
        },
      },
    };
  }

  // 9. Customer Care (Phone, Email, Address)
  const phone = text.match(PHONE_PATTERN);
  const email = text.match(EMAIL_PATTERN);
  const careAddress = text.match(CARE_ADDRESS_PATTERN);
  if (phone || email || careAddress) {
    return {
      fieldName: 'customer_care',
      parsed: {
        ...base,
        normalizedValue: {
          phone: phone ? phone[0] : null,
          email: email ? email[0] : null,
          address: careAddress ? careAddress[1].trim() : null,
        },
      },
    };
  }

  return null;
}

/**
 * Normalizes an array of OCR text blocks into a declarations map.
 * Multi-block entity aggregation: merges related text blocks (e.g. phone in block 1,
 * email in block 2, or address multi-line continuation).
 *
 * @param {Array} textBlocks - Array of OCR text blocks
 * @returns {Object} Map of fieldName -> { rawText, normalizedValue, boundingBox, confidence }
 */
export function normalizeDeclarations(textBlocks = []) {
  const declarations = {};

  for (const block of textBlocks) {
    if (!block || !block.text) continue;
    const result = parseBlock(block);
    if (!result) continue;

    const { fieldName, parsed } = result;

    if (!declarations[fieldName]) {
      declarations[fieldName] = parsed;
    } else {
      // Smart field merging for multi-line or split detections
      if (fieldName === 'customer_care') {
        const existing = declarations.customer_care;
        declarations.customer_care = {
          ...existing,
          rawText: `${existing.rawText} | ${parsed.rawText}`,
          confidence: Math.max(existing.confidence, parsed.confidence),
          normalizedValue: {
            phone: parsed.normalizedValue.phone || existing.normalizedValue.phone,
            email: parsed.normalizedValue.email || existing.normalizedValue.email,
            address: parsed.normalizedValue.address || existing.normalizedValue.address,
          },
        };
      } else if (fieldName === 'manufacturer') {
        const existing = declarations.manufacturer;
        // If current block adds a missing PIN code, enrich the declaration
        if (!existing.normalizedValue.pincode && parsed.normalizedValue.pincode) {
          declarations.manufacturer = {
            ...parsed,
            rawText: `${existing.rawText}\n${parsed.rawText}`,
            confidence: Math.max(existing.confidence, parsed.confidence),
          };
        } else if (parsed.confidence > existing.confidence) {
          declarations.manufacturer = parsed;
        }
      } else if (parsed.confidence > declarations[fieldName].confidence) {
        declarations[fieldName] = parsed;
      }
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
  return Boolean(declaration && declaration.confidence >= MIN_CONFIDENCE_THRESHOLD);
}
