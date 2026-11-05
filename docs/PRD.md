# Product Requirements Document (PRD)

## Automated Compliance Verification for Packaged Commodities
**Smart India Hackathon (SIH) — Problem Statement ID: 26034**  
**Governing Regulation:** Legal Metrology (Packaged Commodities) Rules, 2011 (as amended)  
**Nodal Ministry:** Ministry of Consumer Affairs, Food and Public Distribution, Government of India  
**Document Status:** Approved Baseline (v1.0)  
**Target Architecture:** Option B (Node.js/Express Core + Python/FastAPI OCR Microservice + React SPA)

---

## 1. Executive Summary & Problem Statement

### 1.1 Context
In India, the sale and distribution of pre-packaged commodities are strictly governed by the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011** (LM(PC) Rules). These regulations require manufacturers, packers, and importers to display mandatory statutory declarations on packaging panels—including the Maximum Retail Price (MRP), Unit Sale Price (USP), Net Quantity in standard metric units, Month and Year of Manufacture/Packing, Manufacturer/Packer identity with complete address, Customer Care contact details, and Country of Origin (for imported goods).

### 1.2 The Problem
Manual inspection of physical commodity packaging and digital e-commerce listings is labour-intensive, error-prone, and impossible to scale across millions of SKUs circulating in Indian retail and quick-commerce markets. Regulatory inspectors and brand compliance teams face:
- Inconsistent and subjective manual audits.
- Severe delays in identifying non-compliant or deceptive packaging.
- Difficulty calculating dynamic compliance metrics (e.g., minimum font size based on Principal Display Panel area, Unit Sale Price base unit calculations).
- Inability to establish tamper-evident audit trails for enforcement proceedings.

### 1.3 Solution Objective
Develop an automated, explainable, and privacy-conscious software system that ingests commodity packaging images, extracts textual declarations using specialized Optical Character Recognition (OCR), normalizes the text into structured fields, evaluates them against deterministic, versioned legal rules, and flags violations, ambiguities, and non-compliance with clear statutory citations.

---

## 2. Product Vision, Goals & Scope Boundaries

### 2.1 Product Vision
To empower enforcement authorities and compliance officers with an AI-assisted, legally auditable co-pilot that reduces packaging audit turnaround time from days to seconds while eliminating subjective discrepancies.

### 2.2 Core Goals
1. **Automated Declaration Extraction:** Extract all mandatory packaging declarations from multi-angle package photographs (PDP, back, side panels).
2. **Deterministic Legal Evaluation:** Implement pure, rule-based verification against LM(PC) Rules without black-box hallucinations.
3. **Transparent Verdicts:** Categorize every evaluated rule strictly into `COMPLIANT`, `NON_COMPLIANT`, `NEEDS_REVIEW`, or `NOT_APPLICABLE`.
4. **Human-in-the-Loop Review:** Provide visual bounding-box overlays and confidence scoring, enabling inspectors to verify and correct low-confidence OCR extractions prior to finalizing legal verdicts.
5. **Chain of Custody & Auditability:** Generate immutable inspection records with cryptographic SHA-256 hashes of source imagery and exportable, tamper-evident PDF inspection reports.

### 2.3 Non-Goals (Out of Scope for Initial Releases)
- **Automatic Enforcement/Fining:** The system does not levy legal notices or penalties automatically; it acts strictly as an advisory and evidentiary tool.
- **Physical Package Weight Verification:** The system checks declared label values, not the actual gravimetric weight of the package contents.
- **Full Cloud Dependency:** The core system is designed to run self-hosted on local/intranet infrastructure to comply with data residency rules.
- **Paid Third-Party Cloud Vision APIs:** No reliance on proprietary paid APIs (e.g., Google Cloud Vision, AWS Rekognition) to ensure zero recurring operational license costs.

---

## 3. User Roles & Key Personas

| Role | Persona | Responsibilities & Primary Workflows |
|------|---------|--------------------------------------|
| **Legal Metrology Inspector (Enforcement Officer)** | State/District Inspector inspecting retail shelves or warehouse consignments | • Uploads batch photos of suspected non-compliant commodities.<br>• Inputs package physical dimensions.<br>• Reviews flagged non-compliances and highlighted bounding boxes.<br>• Exports legally formatted PDF inspection memos for issuing statutory notices. |
| **E-Commerce Compliance Auditor** | Digital marketplace compliance officer auditing vendor catalogue images | • Ingests digital packaging graphics directly from seller catalogs.<br>• Verifies e-commerce mandatory declarations (Rule 6(10) / Rule 6(11)).<br>• Flags non-compliant listings for delisting or seller correction. |
| **Brand Packaging & Quality Assurance Manager** | FMCG/D2C brand packaging design team | • Pre-flight checks packaging artwork before plate-making and commercial printing.<br>• Validates font size minimums against calculated PDP dimensions.<br>• Ensures Unit Sale Price (USP) and customer care formats comply with current amendments. |
| **System Administrator / Legal Rule Maintainer** | Technical officer overseeing system operation | • Manages user access and authentication.<br>• Updates rule definitions when the Ministry publishes new Gazette notifications.<br>• Marks rules as verified or provisional. |

---

## 4. Legal & Regulatory Framework (LM(PC) Rules, 2011)

### 4.1 Statutory Authority & Base Rules
All checks are based on the **Legal Metrology (Packaged Commodities) Rules, 2011**, notified vide **G.S.R. 830(E)** on September 3, 2011, and subsequent amendments:
- **G.S.R. 779(E)** (dated Nov 2, 2021, effective Jan 1, 2022 / Dec 1, 2022): Introduction of mandatory Unit Sale Price (USP) and modernization of customer care contact details.
- **G.S.R. 247(E)** (dated March 28, 2022): Clarifications on unit sale price denominations and exemptions.

### 4.2 Declaration Checklist & Verification Matrix

| Rule Identifier | Statutory Reference | Mandatory Requirement | Implementation Status | Logic / Formula |
|-----------------|---------------------|-----------------------|-----------------------|-----------------|
| `RULE_6_1_A_MANUFACTURER` | Rule 6(1)(a) | Name and complete address of the manufacturer, or packer, or importer. | **VERIFIED** | Presence check of postal address, PIN code, and manufacturing entity name. |
| `RULE_6_1_AA_ORIGIN` | Rule 6(1)(aa) | Country of origin or manufacture. | **VERIFIED** | Mandatory if package is imported; conditional if domestically manufactured. |
| `RULE_6_1_B_NAME` | Rule 6(1)(b) | Generic or common name of the commodity contained in the package. | **VERIFIED** | Presence check on Principal Display Panel (PDP). |
| `RULE_6_1_C_NET_QTY` | Rule 6(1)(c) | Net quantity in terms of standard unit of weight or measure (g, kg, ml, l, or number). | **VERIFIED** | Must conform to legal metric symbols (`g`, `kg`, `ml`, `l`, `m`, `N`). Non-standard units (e.g., `gms`, `kilo`, `litres`) trigger non-compliance. |
| `RULE_6_1_D_MFG_DATE` | Rule 6(1)(d) | Month and year of manufacture, packing, or import. | **VERIFIED** | Validates `MM/YYYY` or `Month YYYY` format; flags impossible future dates. |
| `RULE_6_1_DA_EXPIRY` | Rule 6(1)(da) | "Best before" or "use by" date for commodities that may become unfit for human consumption. | **VERIFIED** | Applicable for food, cosmetic, and perishable categories. |
| `RULE_6_1_E_MRP` | Rule 6(1)(e) | Maximum Retail Price inclusive of all taxes in format `MRP Rs. XX.XX (incl. of all taxes)`. | **VERIFIED** | Regex check for INR currency symbol / `Rs.` and explicit inclusion of tax clause. |
| `RULE_6_2_CARE` | Rule 6(2) | Name, address, telephone number, and email address of the consumer care cell. | **VERIFIED** | Must contain at least: Telephone number + Email ID + Contact person/address. |
| `RULE_6_11_USP` | Rule 6(11) | Unit Sale Price (e.g., `Rs. per g`, `Rs. per ml`, `Rs. per item`). | **PROVISIONAL** | Calculated dynamically: Net Qty $\le 1\text{ kg} \implies \text{per g}$; $> 1\text{ kg} \implies \text{per kg}$. |
| `RULE_7_FONT_SIZE` | Rule 7, Table-I | Minimum height of numerals and letters based on Principal Display Panel (PDP) area. | **VERIFIED** | Evaluated against Table-I area thresholds ($A \le 50$, $50 < A \le 100$, etc.). |

---

## 5. System Architecture & Workflows

### 5.1 Architecture Overview (Option B Split)
The system adopts an asymmetric dual-service model designed for high maintainability, language-specific strengths, and clear separation of concerns:

```
[ Frontend: React + Vite + Tailwind ]
               |  HTTP Multipart / JSON (REST)
               v
[ Backend API Gateway & Engine: Node.js + Express + Prisma + PostgreSQL ]
               |  Internal Private HTTP (Multipart Image Stream)
               v
[ OCR Preprocessing & Extraction Service: Python + FastAPI + OpenCV + PaddleOCR ]
```

1. **Frontend (Port 5173):** React SPA providing image capture, drag-and-drop panel uploads, interactive bounding-box overlays, declaration editor, and audit summaries.
2. **Backend Gateway & Compliance Engine (Port 5000):** Express application handling authentication, file upload deduplication (SHA-256), orchestration, business logic, PostgreSQL persistence via Prisma ORM, and report compilation.
3. **Compliance Engine (Pure JS Module):** Completely decoupled, zero-dependency engine executing deterministic rule algorithms against extracted data structures.
4. **OCR Service (Port 8000):** FastAPI microservice executing OpenCV-based contrast enhancement, deskewing, and Laplacian blur detection followed by PaddleOCR multi-lingual text extraction.

### 5.2 End-to-End User & Data Flow
1. **Initiation & Upload:**
   - Inspector creates a new Inspection session, inputting commodity name and physical packaging dimensions (height $\times$ width $\times$ depth for rectangular; height $\times$ circumference for cylindrical).
   - Backend calculates PDP Area ($A_{\text{pdp}}$) using statutory formulas:
     - Rectangular: $A = \text{height} \times \text{width}$
     - Cylindrical: $A = 0.4 \times \text{height} \times \text{circumference}$
   - Inspector uploads images tagged by panel type (`PDP`, `BACK`, `SIDE_LEFT`, `SIDE_RIGHT`, `TOP`, `BOTTOM`).
2. **Storage & Integrity:**
   - Backend stores image files once on disk with UUID filenames under `backend/storage/uploads/{inspection_id}/`.
   - Computes SHA-256 cryptographic digest of raw bytes and commits image record to PostgreSQL.
3. **Image Preprocessing & OCR Dispatch:**
   - Backend streams image buffer to Python FastAPI service (`/api/v1/ocr/process-image`).
   - OCR Service runs OpenCV Laplacian variance quality check ($V < 100 \implies \text{Blurry}$).
   - PaddleOCR detects text polygons, extracts strings, and returns token coordinates with confidence scores ($0.0 \dots 1.0$).
4. **Field Normalization:**
   - Backend regex parser normalizes raw OCR strings into strongly typed declaration structures (e.g., parsing `MRP Rs. 120.00 (incl. of all taxes)` into `{ amount: 120.00, currency: "INR", inclTaxes: true }`).
5. **Deterministic Compliance Evaluation:**
   - Normalized records are passed into `evaluateCompliance(declarations, packageMetadata, activeRules)`.
   - Each rule outputs an evaluation record with status (`COMPLIANT`, `NON_COMPLIANT`, `NEEDS_REVIEW`, `NOT_APPLICABLE`), statutory citation, evidence snippet, and human-readable explanation.
   - *Safeguard Constraint:* Any rule marked `isProvisional: true` defaults strictly to `NEEDS_REVIEW` instead of `NON_COMPLIANT`.
6. **Inspector Verification & Correction (HITL):**
   - Inspector views side-by-side verification screen: raw image with highlighted bounding boxes vs parsed fields.
   - If confidence is low or an error occurs, the inspector overrides the extracted field with a recorded reason (`isUserOverridden: true`).
   - Re-evaluation occurs instantly without re-running OCR.
7. **Report Generation:**
   - One-click export of an official, timestamped PDF Inspection Report including commodity metadata, image snapshots, declaration breakdown, rule-by-rule verdicts, and inspector signature block.

---

## 6. Functional Requirements

### FR-1: Package Ingestion & Image Management
- **FR-1.1:** Support image formats: JPEG, PNG, WebP. Maximum file size: 10 MB per image.
- **FR-1.2:** Enforce single storage per image with SHA-256 deduplication and tamper verification.
- **FR-1.3:** Allow multi-panel assignment (`PDP`, `BACK`, `SIDE_LEFT`, `SIDE_RIGHT`, etc.) with at least one PDP panel required.
- **FR-1.4:** Capture package geometry (Rectangular or Cylindrical) and compute exact PDP area in $\text{cm}^2$.

### FR-2: OCR & Quality Assessment
- **FR-2.1:** Detect image blur using OpenCV Laplacian variance. Flag images below configured threshold (`BLUR_THRESHOLD = 100.0`) with a warning prompting the user to retake the photo.
- **FR-2.2:** Execute text detection and recognition using PaddleOCR (CPU/GPU switchable).
- **FR-2.3:** Provide normalized bounding-box coordinates (`[x_min, y_min, x_max, y_max]`) and line-level confidence scores.
- **FR-2.4:** Provide a Mock OCR fallback engine for containerized and low-resource testing environments where PaddlePaddle is not pre-installed.

### FR-3: Declaration Extraction & Normalization
- **FR-3.1:** Extract mandatory declarations via dedicated regular expression and heuristic patterns:
  - Manufacturer/Packer/Importer Name and Postal Address
  - Country of Origin
  - Common/Generic Product Name
  - Net Quantity (value + standard metric symbol)
  - Date of Manufacture/Packing (`MM/YYYY`)
  - Expiry / Best Before Date
  - MRP (numeric value, currency symbol, tax inclusion clause)
  - Unit Sale Price (USP)
  - Consumer Care Details (Phone, Email, Contact Person/Address)
- **FR-3.2:** Maintain both raw OCR text and normalized JSON structures in database records.

### FR-4: Compliance Evaluation Engine
- **FR-4.1:** Verify compliance against verified LM(PC) Rules 2011 clauses without external network calls.
- **FR-4.2:** Enforce four-state verdict model: `COMPLIANT`, `NON_COMPLIANT`, `NEEDS_REVIEW`, `NOT_APPLICABLE`.
- **FR-4.3:** Automatically compute expected Unit Sale Price based on declared Net Quantity and MRP, verifying mathematical correctness and base unit conformity (e.g., per 1 g vs per 1 kg).
- **FR-4.4:** Estimate font height against Rule 7 Table-I standards based on image pixel density and bounding box dimensions relative to PDP area.
- **FR-4.5:** Prevent provisional rules from ever issuing a `NON_COMPLIANT` verdict without administrative confirmation.

### FR-5: Human-in-the-Loop (HITL) Review Interface
- **FR-5.1:** Render interactive canvas bounding boxes over uploaded packaging images linked to extracted fields.
- **FR-5.2:** Visually highlight low-confidence fields ($\text{confidence} < 0.80$) in amber/yellow.
- **FR-5.3:** Allow inspectors to edit any extracted value, recording original value, edited value, inspector ID, and timestamp.
- **FR-5.4:** Provide instant re-evaluation upon manual correction without invoking the OCR pipeline.

### FR-6: Audit Trail & Reporting
- **FR-6.1:** Store complete audit trail of every inspection, including raw OCR outputs, user overrides, and evaluation snapshots.
- **FR-6.2:** Generate downloadable PDF audit memos containing official Ministry formatting, photo exhibits, rule verdicts, and digital signature/officer sign-off lines.

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **NFR-1.1:** End-to-end processing time (Image Upload $\rightarrow$ OCR $\rightarrow$ Normalization $\rightarrow$ Rules Evaluation) must complete within $\le 4.0\text{ seconds}$ per image on GPU, and $\le 12.0\text{ seconds}$ on standard multi-core CPU.
- **NFR-1.2:** Compliance engine evaluation alone must execute in $< 50\text{ ms}$ for all rules combined.

### 7.2 Reliability & Availability
- **NFR-2.1:** Microservice isolation: Failure of the Python OCR service must not crash the Node.js backend.
- **NFR-2.2:** Graceful degradation: The system must handle unreadable or partial labels by designating fields as `NEEDS_REVIEW` rather than halting execution.

### 7.3 Security & Data Integrity
- **NFR-3.1:** Uploaded files must be validated for MIME type, binary magic numbers, and size limits to prevent arbitrary file upload vulnerabilities.
- **NFR-3.2:** Images stored on disk must use random UUID identifiers; no user-supplied filenames may be preserved on the filesystem.
- **NFR-3.3:** Zero transmission of commodity imagery to unauthorized third parties or public APIs.
- **NFR-3.4:** Storage of raw OCR responses in JSONB for immutable audit trail and reproducibility.

### 7.4 Usability & Accessibility
- **NFR-4.1:** Adhere to WCAG 2.2 AA standards: minimum 24x24 CSS pixel interactive touch targets, visible focus indicators, full keyboard navigation, and high-contrast color palettes.
- **NFR-4.2:** Explainable verdicts: Every non-compliance or review flag must provide plain-language reasoning alongside the exact legal rule citation.

---

## 8. Data Schema & Persistence Model

The system utilizes PostgreSQL via Prisma ORM. Key entity relations:

```
[ Inspection ] 1 ──< N [ UploadedImage ]
     │
     ├──< N [ ExtractedDeclaration ]
     │
     └──< N [ RuleEvaluation ] >── 1 [ RuleVersion ]
```

### 8.1 Core Entities Summary
1. **`Inspection`:** Represents one packaging audit session. Captures commodity name, brand, shape, physical dimensions, PDP area, overall status (`PROCESSING`, `COMPLIANT`, `NON_COMPLIANT`, `NEEDS_REVIEW`), and overall confidence.
2. **`UploadedImage`:** Stores file metadata, relative storage path, SHA-256 hash, panel type (`PDP`, `BACK`, etc.), image pixel dimensions, Laplacian blur score, and verbatim raw OCR JSON.
3. **`ExtractedDeclaration`:** Stores extracted declaration fields (`mrp`, `net_quantity`, `mfg_date`, `customer_care`, etc.), raw OCR text snippet, normalized JSON representation, bounding box, confidence score, and inspector override audit data.
4. **`RuleVersion`:** Statutory rule repository maintaining rule codes (`RULE_6_1_E_MRP`), title, legal citation, gazette reference, effective date, active flag, and `isProvisional` boolean.
5. **`RuleEvaluation`:** Individual rule outcome per inspection. Stores verdict status, human explanation, evidence snippet, and structured metadata.

---

## 9. API Specifications

### 9.1 Express Backend Gateway Endpoints

| Method | Endpoint | Description | Payload / Parameters |
|--------|----------|-------------|----------------------|
| `POST` | `/api/v1/inspections` | Initialize new inspection session | `productName`, `brandName`, `packageShape`, `dimensions: { height_cm, width_cm, depth_cm }` |
| `POST` | `/api/v1/inspections/:id/images` | Upload package panel image | `multipart/form-data`: `image` (binary), `panelType` (`PDP`, `BACK`, etc.) |
| `POST` | `/api/v1/inspections/:id/process` | Trigger end-to-end OCR & evaluation | None |
| `GET` | `/api/v1/inspections/:id` | Fetch full inspection details & results | Returns inspection, images, declarations, and rule evaluations |
| `PATCH` | `/api/v1/inspections/:id/declarations/:fieldName` | Human override of extracted declaration | `{ normalizedValue: {...}, overrideReason: "string" }` |
| `GET` | `/api/v1/inspections/:id/report.pdf` | Export generated legal compliance PDF | Binary PDF stream |
| `GET` | `/api/v1/rules` | List all active statutory rule definitions | Filter by active/provisional |

### 9.2 Python OCR Microservice Endpoints

| Method | Endpoint | Description | Payload / Parameters |
|--------|----------|-------------|----------------------|
| `GET` | `/health` | Healthcheck & engine readiness probe | Returns `{ status: "ok", engine: "PaddleOCR" \| "MockOCR", gpu: bool }` |
| `POST` | `/api/v1/ocr/process-image` | Preprocess image & extract OCR tokens | `multipart/form-data`: `file` (binary), `panel_type` (string). Returns `{ blur_score, is_blurry, text_blocks: [{ text, confidence, bounding_box }] }` |

---

## 10. Risk Management & Edge Cases

| Risk / Edge Case | Likelihood | Impact | Mitigation Strategy |
|------------------|------------|--------|---------------------|
| **Curved & Cylindrical Packaging Distortion** | High | High | Preprocessing pipeline applies cylindrical unwarping heuristics; system prompts user to capture overlapping multi-shot angles. |
| **Low Contrast & Glare on Foil/Gloss Packs** | High | Medium | Adaptive thresholding, contrast stretching (CLAHE) in OpenCV; flags glare zones for inspector confirmation. |
| **Legal Ambiguity on Provisional Rules** | Medium | High | Hard programmatic constraint: `isProvisional: true` rules can never issue `NON_COMPLIANT` verdicts automatically. |
| **Non-Standard Font Types & Stylized Branding** | Medium | Medium | Maintain raw OCR text alongside normalized text; highlight low-confidence tokens for one-click inspector correction. |
| **Tampering with Evidence Images** | Low | Critical | Compute and record SHA-256 hash immediately upon file upload; verify hash before generating PDF audit report. |

---

## 11. Delivery Milestones & Phased Roadmap

### Milestone 1: Foundations & Architecture Baseline *(Completed)*
- Project scaffolding (Node.js/Express, Python/FastAPI, React/Vite).
- PostgreSQL schema setup with Prisma ORM.
- Docker Compose development orchestration.
- Core decoupled Compliance Engine module with unit tests.
- Initial seed data for verified and provisional legal rules.

### Milestone 2: OCR Microservice & Preprocessing Pipeline *(Completed)*
- Full OpenCV preprocessing integration (Laplacian blur, CLAHE contrast adjustment, deskewing).
- PaddleOCR model loading and token extraction pipeline.
- Express-to-FastAPI multipart streaming client.
- Integration tests for OCR contract with mock and test fixtures.

### Milestone 3: Normalization Engine & HITL Dashboard *(Completed)*
- Regex and NLP normalization pipeline for Indian packaging patterns (MRP, dates, addresses, USP).
- React frontend: Drag-and-drop image uploader and interactive bounding box canvas.
- Human-in-the-loop field correction interface with live re-evaluation.

### Milestone 4: Reporting, Security Hardening & Evaluation *(Completed)*
- PDF generation module with official Government of India memo styling and photo exhibits.
- End-to-end evaluation with real packaged commodity label dataset.
- Security audit, input sanitization, and production deployment packaging.

### Milestone 5: Documentation & Presentation *(next)*