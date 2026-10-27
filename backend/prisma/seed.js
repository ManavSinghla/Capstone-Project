/**
 * prisma/seed.js — Initial data seeding
 *
 * Seeds the rule_versions table with Legal Metrology (Packaged Commodities)
 * Rules, 2011 (and amendments).
 *
 * IMPORTANT: Rules are seeded with isProvisional = true by default.
 * Only rules that have been cross-referenced against the authoritative
 * gazette text (see docs/legal_references.md) are seeded with
 * isProvisional = false.
 *
 * An administrator MUST clear the provisional flag manually after
 * reviewing each rule against the primary gazette source.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rules = [
  {
    ruleCode: 'RULE_6_1_A_MANUFACTURER',
    title: 'Name and address of manufacturer or packer',
    legalCitation:
      'Rule 6(1)(a) of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'Every pre-packaged commodity shall bear the name and complete postal ' +
      'address of the manufacturer, packer, or importer. If the manufacturer ' +
      'and packer differ, both must be declared.',
    isProvisional: false, // Verified — see docs/legal_references.md
    isActive: true,
  },
  {
    ruleCode: 'RULE_6_1_AA_ORIGIN',
    title: 'Country of origin for imported goods',
    legalCitation:
      'Rule 6(1)(aa) of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'For imported pre-packaged commodities, the country of origin, ' +
      'manufacture, or assembly must be declared on the label.',
    isProvisional: false,
    isActive: true,
  },
  {
    ruleCode: 'RULE_6_1_B_GENERIC_NAME',
    title: 'Generic or common name of the commodity',
    legalCitation:
      'Rule 6(1)(b) of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'The generic or common name of the commodity must be declared plainly ' +
      'and conspicuously so the consumer can identify what is inside the package.',
    isProvisional: false,
    isActive: true,
  },
  {
    ruleCode: 'RULE_6_1_C_NET_QUANTITY',
    title: 'Net quantity in standard metric units',
    legalCitation:
      'Rule 6(1)(c) of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'Net quantity must be declared in standard units of weight (g/kg), ' +
      'volume (ml/l), length (cm/m), or number. SI symbols must be used.',
    isProvisional: false,
    isActive: true,
  },
  {
    ruleCode: 'RULE_6_1_D_MFG_DATE',
    title: 'Month and year of manufacture or packing',
    legalCitation:
      'Rule 6(1)(d) of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'The month and year of manufacture, packing, or importation must be ' +
      'declared. Acceptable formats include MM/YYYY or the month written in words.',
    isProvisional: false,
    isActive: true,
  },
  {
    ruleCode: 'RULE_6_1_DA_EXPIRY',
    title: 'Best before or use-by date',
    legalCitation:
      'Rule 6(1)(da) of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'For commodities that become unfit for human consumption after a date, ' +
      'the best-before or expiry date must be declared. Applicability varies ' +
      'by product category.',
    isProvisional: false,
    isActive: true,
  },
  {
    ruleCode: 'RULE_6_1_E_MRP',
    title: 'Maximum Retail Price (MRP) including all taxes',
    legalCitation:
      'Rule 6(1)(e) of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'MRP must be declared as "MRP Rs. X.XX (inclusive of all taxes)" or ' +
      'equivalent. The phrase inclusive of all taxes (or incl. of all taxes) ' +
      'is mandatory. The rupee symbol or Rs. prefix is required.',
    isProvisional: false,
    isActive: true,
  },
  {
    ruleCode: 'RULE_6_2_CUSTOMER_CARE',
    title: 'Customer care details for grievance redressal',
    legalCitation:
      'Rule 6(2) of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'The label must include: name or designation of contact person/office, ' +
      'complete postal address, telephone number, and email address (if available).',
    isProvisional: false,
    isActive: true,
  },
  {
    ruleCode: 'RULE_6_11_USP',
    title: 'Unit Sale Price declaration',
    legalCitation:
      'Rule 6(11) of the Legal Metrology (Packaged Commodities) Rules, 2011 ' +
      'as amended by LM(PC) Amendment Rules, 2021 (GSR 779(E)) and 2022 (GSR 247(E))',
    gazetteRef: 'GSR 779(E) 2021 and GSR 247(E) 2022',
    effectiveDate: new Date('2021-01-01'), // TODO: Confirm exact commencement date from gazette
    description:
      'Unit Sale Price must be declared on the Principal Display Panel ' +
      'alongside MRP. Amount must be rounded to two decimal places. ' +
      'Base unit depends on net quantity: <1kg -> per g, >=1kg -> per kg; ' +
      '<1l -> per ml, >=1l -> per l; <1m -> per cm, >=1m -> per m; ' +
      'or per number. Exempt if MRP equals USP, or for wholesale/industrial packages.',
    isProvisional: true, // PROVISIONAL: Exemption wording and commencement date need gazette confirmation
    isActive: true,
  },
  {
    ruleCode: 'RULE_7_FONT_SIZE',
    title: 'Minimum height of letters and numerals (Table-I)',
    legalCitation:
      'Rule 7 of the Legal Metrology (Packaged Commodities) Rules, 2011',
    gazetteRef: 'GSR 830(E), dated 3 September 2011',
    effectiveDate: new Date('2011-09-03'),
    description:
      'Minimum height of numerals and letters is determined by PDP area (Table-I). ' +
      'Thresholds: <=50cm2 -> 1.0mm, 50-100cm2 -> 1.5mm, 100-500cm2 -> 2.5mm, ' +
      '500-2500cm2 -> 4.0mm, >2500cm2 -> 6.0mm. ' +
      'Width must be at least one-third of height (except 1, I, l). ' +
      'Blown/embossed labels have higher minimums.',
    isProvisional: false,
    isActive: true,
  },
];

async function main() {
  console.log('Seeding rule_versions table...');
  let created = 0;
  let skipped = 0;

  for (const rule of rules) {
    const existing = await prisma.ruleVersion.findUnique({
      where: { ruleCode: rule.ruleCode },
    });
    if (existing) {
      console.log(`  SKIP (already exists): ${rule.ruleCode}`);
      skipped++;
    } else {
      await prisma.ruleVersion.create({ data: rule });
      const tag = rule.isProvisional ? ' [PROVISIONAL]' : '';
      console.log(`  CREATED: ${rule.ruleCode}${tag}`);
      created++;
    }
  }

  console.log(`\nSeeding complete. Created: ${created}, Skipped: ${skipped}`);
  console.log('\nNOTE: Rules marked [PROVISIONAL] return NEEDS_REVIEW, not NON_COMPLIANT.');
  console.log('      Clear isProvisional=false after verifying against official gazette.\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
