# SIH Problem Statement 26034
## Legal Metrology (Packaged Commodities) Compliance Checker

Automated compliance verification for packaged commodity labels under the
**Legal Metrology (Packaged Commodities) Rules, 2011** (as amended 2021/2022).

---

## Architecture

| Service      | Technology           | Port  |
|--------------|----------------------|-------|
| `frontend`   | React + Vite         | 5173  |
| `backend`    | Node.js + Express    | 5000  |
| `ocr-service`| Python + FastAPI     | 8000  |

See [docs/architecture.md](docs/architecture.md) for full system design.

---

## Prerequisites

| Requirement     | Version   | Notes                                      |
|-----------------|-----------|--------------------------------------------|
| Node.js         | >= 20 LTS | https://nodejs.org                         |
| npm             | >= 10     | Included with Node.js                      |
| Python          | >= 3.11   | https://www.python.org                     |
| PostgreSQL      | >= 16     | https://www.postgresql.org (Windows: EDB)  |

---

## Windows Setup Guide

### 1. Install PostgreSQL

1. Download the EDB installer: https://www.enterprisedb.com/downloads/postgres-postgresql-installer
2. Run installer — set password for `postgres` superuser (remember it).
3. Verify: open **pgAdmin 4** or run `psql -U postgres` in PowerShell.
4. Create the database:
   ```sql
   CREATE DATABASE legal_metrology_db;
   ```

### 2. Configure the Backend

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Edit `.env` — set `DATABASE_URL` with your PostgreSQL password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/legal_metrology_db?schema=public"
```

### 3. Run Database Migrations

```powershell
cd backend
npm install          # if not already done
npx prisma migrate dev --name init
npx prisma db seed
```

Expected output:
```
Seeding rule_versions table...
  CREATED: RULE_6_1_A_MANUFACTURER
  CREATED: RULE_6_1_AA_ORIGIN
  ...
  CREATED: RULE_6_11_USP [PROVISIONAL]
  ...
Seeding complete. Created: 10, Skipped: 0
```

### 4. Start the Backend

```powershell
cd backend
npm run dev
```

Visit: http://localhost:5000/health

### 5. Set Up the Python OCR Service

```powershell
cd ocr-service
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install PaddlePaddle (CPU version — required separately)
pip install paddlepaddle

# Install all other dependencies
pip install -r requirements.txt

# Copy and configure environment
Copy-Item .env.example .env
```

Start the OCR service:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Visit: http://localhost:8000/health

> **Note**: On first start, PaddleOCR downloads model weights (~200MB).
> This is a one-time operation.

---

## Running Tests

### Backend — Compliance Engine (Jest)

```powershell
cd backend
npm test
```

### OCR Service — Contract Tests (pytest)

```powershell
cd ocr-service
.\venv\Scripts\Activate.ps1
python -m pytest tests/ -v
```

---

## Legal Notice

Rules are verified against authoritative government sources (India Code,
e-Gazette India). Rules marked `isProvisional = true` in the database
return **NEEDS_REVIEW**, not **NON_COMPLIANT**, until verified.

See [docs/legal_references.md](docs/legal_references.md).
