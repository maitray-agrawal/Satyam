# SATYAM Platform Engineering Baseline & State Audit

**Project**: SATYAM — Government Procurement Bid Compliance Verification Platform  
**Problem Statement**: SIH26100 — AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement  
**Audit Baseline Date**: 2026-09-23  
**Auditor**: Senior Software Architect, Security Engineer & QA Lead  
**Baseline Git Commit**: `c45762ba3a132242e1e7096a27af177a7384f1d7`  

---

## 1. System Architecture & Component Inventory

### 1.1 Frontend Architecture
- **Framework**: React 19 (`react@^19.0.1`, `react-dom@^19.0.1`)
- **Bundler & Build Tooling**: Vite 6 (`vite@^6.2.3`), `@vitejs/plugin-react@^5.0.4`
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`), Vanilla CSS with print media queries (`@media print` in `src/index.css`)
- **State Management & Data Fetching**: TanStack React Query (`@tanstack/react-query@^5.102.8`)
- **Iconography & Visualization**: Lucide React (`lucide-react@^0.546.0`), Recharts (`recharts@^3.10.1`), Motion (`motion@^12.23.24`)
- **Visual Identity**: Official Government of India Institutional Two-Tier Header, bilingual identity (*भारत सरकार / GOVERNMENT OF INDIA*), transparent vector Lion Capital of Ashoka with *सत्यमेव जयते* (`/emblem.svg`), SATYAM Sanskrit provenance mark (*सत्यम् / Truth*), and GFR 2017 Rule 144 compliance status indicators.

### 1.2 Backend Architecture
- **Server Runtime**: Express 4 (`express@^4.21.2`) on Node.js / Bun
- **Language**: TypeScript 5.8 (`typescript@~5.8.2`) executed via `tsx` or bundled via `esbuild` (`esbuild@^0.25.0`)
- **Database Engine**: Embedded SQLite / `sql.js` (`sql.js@^1.14.2`) with deterministic disk synchronization (`data/procurement.db`)
- **File Upload & Ingestion**: Multer (`multer@^2.3.0`) with strict file type validation (PDF, PNG, JPG) and 15MB upload ceiling
- **Security Middlewares**: Helmet-grade HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`) and scoped CORS
- **Role-Based Access Control (RBAC)**: Enforced via `authMiddleware` supporting roles:
  - `PROCUREMENT_OFFICER`
  - `TECHNICAL_EVALUATOR`
  - `AUDITOR`
  - `ADMIN`

### 1.3 AI Components & Advisory Boundary
- **AI Integration**: Google GenAI SDK (`@google/genai@^2.4.0`)
- **Role Separation**:
  - **Extraction & OCR**: Structured JSON extraction from uploaded bidder documents (PAN, GSTIN, Udyam registration, turnover, blacklisting affidavits)
  - **Tender Clause Parsing**: Automated clause extraction from RFP PDFs
  - **Advisory Decision Support**: Interactive Co-pilot chat assistant for procurement officers
  - **Deterministic Safety Fallback**: Full rule-based fallback (`generateDeterministicRecommendation`) when API key is absent or external service is unreachable
  - **Decision Authority Boundary**: Deterministic policy-as-code evaluates statutory compliance rules; AI is strictly restricted to extraction/advisory tasks. Final statutory decisions remain with authorized human officers.

### 1.4 Verification Adapters (Statutory Data Plane)
Thirteen (13) statutory registry verification adapters implemented in `server/verificationSimulators.ts` and `server/integrations/verification/`:
1. **GSTN** — Goods and Services Tax Network status, legal name, taxpayer type, return filing frequency
2. **PAN** — Income Tax Department PAN registry and entity name verification
3. **Udyam MSME** — Ministry of MSME enterprise classification (Micro, Small, Medium)
4. **Income Tax Return** — Form 26AS / ITR filing verification
5. **EPFO** — Employees' Provident Fund Organisation establishment and ECR compliance
6. **ESIC** — Employees' State Insurance Corporation employer verification
7. **DPIIT / Startup India** — Startup recognition certificate and DIPP number validation
8. **NSIC** — National Small Industries Corporation registration check
9. **OEM Authorization** — Manufacturer Authorization Form (MAF) verification
10. **Central Debarment / Blacklist** — Department of Expenditure / CPPP Central Debarment List
11. **Make In India (MII)** — Local content declaration percentage validation (Class-I: ≥50%, Class-II: ≥20%)
12. **MCA21** — Ministry of Corporate Affairs CIN / active company verification
13. **DigiLocker** — Document certificate authenticity validation

All adapters include explicit `simulated: true` flags and `simulationNotice` disclaimers to ensure audit integrity and eliminate false claims of live production government API access in the demonstration environment.

### 1.5 Deterministic Compliance Core
- **Policy Engine**: Package `@gev-verify/compliance-core`
- **Scoring**: Normalized scoring algorithm (0–100 scale) based on requirement weights
- **Risk Assessment**:
  - `LOW` (Score ≥ 90, 0 failed mandatory checks, 0 critical flags)
  - `MEDIUM` (Score 70–89, no critical debarment)
  - `HIGH` (Score 50–69 or elevated document mismatches)
  - `CRITICAL` (Score < 50 or active blacklisting/debarment flag)
- **Three-Way Reconciliation**: Evaluates matches across (1) Tender Requirement, (2) Bidder Document Evidence, and (3) Independent Registry Verification Evidence.

### 1.6 Cryptographic Audit Ledger
- **Hashing**: SHA-256 hash chaining implemented in `server/db.ts`
- **Genesis Hash**: `GENESIS`
- **Structure**: Each log entry hashes `(previousHash + timestamp + eventType + entityId + userId + userRole + actionSummary + metadataJson)`
- **Verification**: `verifyAuditLedgerIntegrity()` mathematically verifies the entire chain from genesis to head on demand.

---

## 2. Environment & Tooling Specifications

| Component | Specification | Status |
|---|---|---|
| Node.js | v24.15.0 (Docker target: Node 22 Alpine) | Verified |
| Package Manager | Bun 1.4.0 (lockfile: `bun.lock`) / npm 12.0.1 | Verified |
| TypeScript | 5.8.2 | 0 type errors (`tsc --noEmit` pass) |
| Vite | 6.4.3 | Build verified |
| Automated Tests | 82 test cases across 8 suites | 82 / 82 Passed (100%) |
| Test Runtime | ~635 ms | Sub-second execution |
| Build Output | `dist/index.html` (1.01 kB), `dist/assets/index-*.js` (877 kB), `dist/server.cjs` (312 kB) | Build verified |
| Docker Build | Multi-stage `oven/bun:1` builder + `node:22-alpine` runner | Configuration verified |
| Cloud Deployment | Render Web Service (`render.yaml`, Docker runtime) | Configuration verified |

---

## 3. Seed Data & Evaluation Scenarios

The platform includes nine (9) pre-configured procurement evaluation dossiers directly testable by SIH evaluators:
1. **GEM/BID/2026/894201/01 (TechVanguard Solutions)** — Fully compliant bidder; 100/100 score; Low risk; Officer decision APPROVED.
2. **GEM/BID/2026/894201/02 (Apex Infotech)** — Missing/doubtful OEM authorization; 70/100 score; High risk review flag; Pending officer review.
3. **GEM/BID/2026/894201/03 (Bharat Electro-Systems)** — Make In India local content declaration mismatch; High risk review.
4. **GEM/BID/2026/894201/04 (Global Quantum Logistics)** — Entity listed on Central Debarment / Blacklist; Score capped at 5/100; Critical risk; Mandatory disqualification.
5. **GEM/BID/2026/894201/05 (Zenith Technologies)** — Turnover requirement threshold borderline case.
6. **GEM/BID/2026/894201/06 (Hindustan Telematics)** — Incomplete GST filing history.
7. **GEM/BID/2026/894201/07 (Surya Solar Systems)** — MSME / Startup India exemption recognition.
8. **GEM/BID/2026/894201/08 (CyberShield Defense)** — Defense procurement security clearance check.
9. **GEM/BID/2026/894201/09 (MegaBuild Infrastructure)** — Joint venture consortium verification.

---

## 4. Current Limitations & Honest Disclosures

1. **Controlled Verification Adapters**: The 13 government registry adapters are controlled simulation adapters populated with deterministic mock data. They accurately demonstrate the three-way reconciliation data model, but do not connect to live government REST/SOAP endpoints (which require formal NIC/GSTN/GeM departmental API onboarding, VPN peering, and production digital certificates).
2. **Local Embedded SQLite**: The demonstration environment uses `sql.js` (SQLite in WebAssembly with disk persistence). Production deployments requiring multi-instance scaling require PostgreSQL (`@prisma/client` schema is already defined in `prisma/schema.prisma`).
3. **Ephemeral Container Uploads**: On free-tier cloud platforms (e.g. Render free tier), the `/app/uploads` directory is ephemeral across service redeploys unless backed by an S3/GCS bucket or persistent volume.
4. **AI Generation Disclaimers**: All AI extraction confidence scores and advisory recommendations carry prominent visual disclaimers indicating they are advisory outputs requiring officer validation under Rule 144 of the General Financial Rules (GFR 2017).

---

## 5. Security & Risk Assessment

- **Injection & Traversal**: Upload directory uses randomly generated unique hex suffixes with strict extension filtering (`.pdf`, `.png`, `.jpg`).
- **Cryptographic Audit Ledger**: Intact and mathematically verifiable across all 31 events with genesis hash `GENESIS`.
- **Dependency Audit**: Core production dependencies (`express`, `sql.js`, `lucide-react`, `recharts`, `zod`, `@google/genai`) are clean. Development dependencies in unlinked Prisma AST parser packages are isolated from runtime execution.
