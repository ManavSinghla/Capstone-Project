# System Architecture

## SIH Problem Statement 26034: Legal Metrology (Packaged Commodities) Compliance Checker

### Option B: Node.js/Express + Python/FastAPI OCR Service

---

## Overview

This system checks packaged commodity labels for compliance with the
Legal Metrology (Packaged Commodities) Rules, 2011 (as amended).

It is composed of three independently runnable services:

| Service      | Technology            | Port  | Responsibility                                  |
|--------------|-----------------------|-------|-------------------------------------------------|
| frontend     | React + Vite          | 5173  | Upload UI, inspection review, result dashboard  |
| backend      | Node.js + Express     | 5000  | API gateway, compliance engine, DB persistence  |
| ocr-service  | Python + FastAPI      | 8000  | Image preprocessing + OCR text extraction       |

---

## Data Flow

```
User (Browser)
  |
  | 1. POST /api/v1/inspections  (multipart: images + package dimensions)
  v
Express Backend (port 5000)
  |  - Validates input with Zod
  |  - Saves image once to disk; records SHA-256
  |  - Creates Inspection record (status: PROCESSING)
  |
  | 2. POST /api/v1/ocr/process-image  (multipart: image stream)
  v
FastAPI OCR Service (port 8000)
  |  - Runs OpenCV preprocessing
  |  - Runs PaddleOCR text detection
  |  - Returns text_blocks + bounding_boxes + confidence scores
  |
  | 3. JSON response returned to Express
  v
Express Backend (continued)
  |  - Stores raw OCR result in DB
  |  - Runs Normalizer: raw text -> structured declarations
  |  - Runs Compliance Engine: declarations -> rule evaluations
  |  - Saves declarations + evaluations to DB
  |  - Returns full inspection result to browser
  v
User (Browser)
  - Sees annotated image with bounding boxes
  - Reviews per-rule compliance status
  - Can correct low-confidence fields and re-evaluate
  - Can export PDF compliance certificate
```

---

## Compliance Engine Isolation

The compliance engine (`backend/src/compliance-engine/`) is a **pure JavaScript
module** with zero dependencies on:
- Express routes or request/response objects
- Database (Prisma) access
- OCR libraries
- External network calls

It accepts plain JavaScript objects and returns plain objects.
This makes it independently testable and deployable.

---

## File Storage

- Uploads are saved once to `backend/storage/uploads/{inspection_id}/{uuid}.{ext}`
- The OCR service receives the image via HTTP multipart stream
- The OCR service NEVER writes images to its own disk
- Each uploaded image has a SHA-256 hash stored in the database

---

## Rule Versioning

- Legal rule definitions are stored in the `rule_versions` table in PostgreSQL
- Each rule has an `effective_date` and `is_active` flag
- Rules seeded during initial migration are marked `provisional: true`
  until verified against official gazette notifications
- See `docs/legal_references.md` for authoritative sources
