# ADR-001: Two-Service Architecture (Node.js Backend + Python OCR Service)

## Status
Accepted

## Context
- **Problem**: A single-language codebase would require either a Python web
  framework (limiting Node.js ecosystem) or a Node.js OCR library (immature,
  worse accuracy than PaddleOCR).
- **Constraints**: Team familiar with both Node.js and Python. Accuracy of OCR
  is critical for compliance verdicts. Compliance engine must be testable
  independently.

## Options Considered

| Option | Pros | Cons | Complexity |
|--------|------|------|------------|
| A: Pure Python (FastAPI) | One language, mature ML ecosystem | No Node.js advantages | Low |
| B: Node.js + Python OCR sidecar | Best of both; clean separation | Two runtimes to manage | Medium |
| C: Node.js + cloud OCR API | No ML infra | Paid API; data leaves server | Low |

## Decision
**Option B** — Node.js/Express main backend with a Python/FastAPI OCR sidecar.

## Rationale
- Compliance engine and API layer benefit from Node.js async model and Prisma ORM.
- PaddleOCR (Python) is the most accurate open-source OCR toolkit for mixed-script
  Indian packaging labels (Hindi/English Devanagari).
- OCR is a stateless, replaceble module. Hiding it behind an HTTP interface keeps
  the interface stable even if the OCR engine changes.

## Consequences
- **Positive**: OCR engine is swappable (Tesseract, cloud API) without touching Express.
- **Positive**: Compliance engine is fully unit-testable in JS without a Python runtime.
- **Negative**: Local dev requires two processes (manageable via docker-compose or concurrently).
- **Mitigation**: docker-compose.yml provided for one-command local startup.

## Revisit Trigger
- If PaddleOCR accuracy on regional scripts is insufficient at Milestone 2 testing.
