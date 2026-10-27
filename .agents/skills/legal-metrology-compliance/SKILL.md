

\---

name: legal-metrology-compliance

description: Implements and reviews product-label OCR, Indian Legal Metrology compliance rules, declaration extraction, validation, and explainable compliance reports. Use when building or testing the SIH packaged-commodities compliance system.

\---



\# Legal Metrology Compliance



\## Objective

Build a reliable system to analyze packaged commodity labels

and identify potential non-compliance with applicable Indian rules.



\## Workflow

1\. Validate uploaded product images and file types.

2\. Extract text using OCR.

3\. Normalize extracted declarations into structured fields.

4\. Retain original OCR text and confidence information.

5\. Validate declarations against a versioned rules engine.

6\. Explain each result and link it to evidence and its legal source.

7\. Generate a report with findings and recommendations.



\## Result categories

\- Compliant: all applicable automated checks passed.

\- Non-compliant: a verified rule violation was identified.

\- Needs review: text is uncertain, evidence is missing, or a

&#x20; legal determination requires human review.

\- Not applicable: a rule does not apply to the product.



\## Accuracy requirements

\- Never invent legal requirements or clause numbers.

\- Verify current rules and amendments using authoritative sources.

\- Store rule identifiers, legal citations, and effective dates.

\- Distinguish a missing declaration from an unreadable declaration.

\- Never treat uncertain OCR text as confirmed evidence.

\- Keep automated findings separate from final legal determinations.



\## Engineering requirements

\- Separate OCR, normalization, rules evaluation, and reporting.

\- Use typed data structures and server-side validation.

\- Test missing, conflicting, blurry, and incomplete declarations.

\- Protect uploaded files and avoid exposing sensitive data.

\- Maintain unit tests for each compliance rule.

\- Make every result explainable and reproducible.



