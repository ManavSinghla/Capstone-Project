# Legal References and Verification Status

## Primary Authority

**Legal Metrology (Packaged Commodities) Rules, 2011**
- Notified vide: GSR 830(E), dated 3 September 2011
- Issued under: Legal Metrology Act, 2009 (No. 1 of 2010)
- Ministry: Ministry of Consumer Affairs, Food and Public Distribution
- Authoritative source: India Code portal (www.indiacode.nic.in)

---

## Key Amendments (Verified)

| Amendment                                             | Gazette Reference  | Key Changes Introduced                                               |
|-------------------------------------------------------|--------------------|----------------------------------------------------------------------|
| LM(PC) Amendment Rules, 2021                          | GSR 779(E), 2021   | Mandatory Unit Sale Price (USP) declaration; Consumer Care mandate   |
| LM(PC) Amendment Rules, 2022                          | GSR 247(E), 2022   | Clarifications on USP base units and rounding; e-commerce provisions |

> NOTE: Verify exact gazette dates at: https://egazette.gov.in

---

## Rule-by-Rule Verification Status

Each rule seeded into the database is tagged with a `provisional` flag.
Rules remain provisional until cross-referenced with the primary gazette text.

| Rule Code               | Legal Basis                          | Status       | Notes                                          |
|-------------------------|--------------------------------------|--------------|------------------------------------------------|
| RULE_6_1_A_MANUFACTURER | Rule 6(1)(a) LM(PC) Rules 2011       | VERIFIED     | Name + complete address of manufacturer/packer |
| RULE_6_1_AA_ORIGIN      | Rule 6(1)(aa) LM(PC) Rules 2011      | VERIFIED     | Country of origin mandatory for imports only   |
| RULE_6_1_B_NAME         | Rule 6(1)(b) LM(PC) Rules 2011       | VERIFIED     | Generic/common name of commodity               |
| RULE_6_1_C_NET_QTY      | Rule 6(1)(c) LM(PC) Rules 2011       | VERIFIED     | Net quantity in standard metric units          |
| RULE_6_1_D_MFG_DATE     | Rule 6(1)(d) LM(PC) Rules 2011       | VERIFIED     | Month and year of manufacture/packing          |
| RULE_6_1_DA_EXPIRY      | Rule 6(1)(da) LM(PC) Rules 2011      | VERIFIED     | Best before/expiry date (where applicable)     |
| RULE_6_1_E_MRP          | Rule 6(1)(e) LM(PC) Rules 2011       | VERIFIED     | MRP incl. of all taxes; specific format reqd   |
| RULE_6_2_CARE           | Rule 6(2) LM(PC) Rules 2011          | VERIFIED     | Customer care: name, address, tel, email       |
| RULE_6_11_USP           | Rule 6(11) as amended 2021/2022      | PROVISIONAL  | USP base-unit breakpoints; exemptions          |
| RULE_7_FONT_SIZE        | Rule 7 + Table-I LM(PC) Rules 2011   | VERIFIED     | Min font height vs PDP area (5 tiers)          |

---

## PROVISIONAL Rules — Outstanding Verification Tasks

### RULE_6_11_USP
- Exemption condition: "MRP equals Unit Sale Price" — exact wording needs
  gazette confirmation.
- Exemption for alcoholic beverages: governed by State Excise; interstate
  variation not yet mapped.
- Wholesale package definition (Rule 2(r)) needs cross-reference.

---

## Authoritative Sources to Verify Against

1. India Code portal: https://www.indiacode.nic.in/handle/123456789/1892
2. e-Gazette India: https://egazette.gov.in
3. Legal Metrology Division, GoI: https://consumeraffairs.nic.in
4. Ministry of Consumer Affairs circulars archive

---

## Important Engineering Constraint

> Rules whose provisions, effective dates, or applicability boundaries
> are marked PROVISIONAL must not produce NON_COMPLIANT verdicts.
> They must return NEEDS_REVIEW until the rule is verified and
> the provisional flag is removed by an authorised administrator.
