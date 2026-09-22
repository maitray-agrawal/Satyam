# GEV-VERIFY (SATYAM) Security & Governance Policy

## 1. Secrets Management & Environment Security

- **Zero Hardcoded Secrets**: The repository contains no production credentials, private keys, or API tokens.
- **Environment Isolation**:
  - Runtime parameters are configured strictly through environment variables.
  - `.env`, `.env.local`, and `.env.production` are strictly ignored by `.gitignore`.
  - `.env.example` provides safe, explicit placeholder keys (`replace_with_a_long_random_secret`).
- **Container Security**:
  - `infrastructure/docker-compose.yml` uses dynamic environment expansion (`${POSTGRES_USER:-gev_admin}`, `${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}`) ensuring credentials must be explicitly injected in production.

---

## 2. Role-Based Access Control (RBAC)

The platform enforces strict role-based access control across all administrative and evaluation endpoints:

| Role | Permissions | Limitations |
| :--- | :--- | :--- |
| **PROCUREMENT_OFFICER** | Manage tenders, review dossiers, trigger evaluations, record final decisions | Cannot alter system security policies |
| **ADMIN** | User administration, adapter configuration, audit export | Cannot override procurement officer decisions |
| **AUDITOR** | Read-only inspection of evaluation history, logs, and evidence trails | Cannot modify scores or decisions |
| **REVIEWER** | Technical committee evaluation and advisory review | Cannot finalize official determinations |

RBAC is enforced via Express middleware (`server/modules/auth/auth.middleware.ts`) on all `/api` routes with HTTP 403 Forbidden responses upon unauthorized access attempts.

---

## 3. Document Ingestion & Storage Security

- **Strict MIME-Type Validation**: Only official document formats are permitted (`application/pdf`, `image/jpeg`, `image/png`). Executable files, scripts, and unvetted binaries are rejected at the gateway.
- **Upload Size Bounds**: Configured with strict 15 MB file size limits in Express/Multer to prevent denial-of-service (DoS) attacks via memory exhaustion.
- **Document Hash Provenance**: Every uploaded document receives an immutable SHA-256 cryptographic checksum upon ingestion, ensuring tamper evidence across evaluation cycles.

---

## 4. Simulated External Sources & Zero-Leakage Policy

- **Sandbox Data Isolation**: In this demonstration environment, all external registry adapters (CBIC/GSTN, CBDT, Udyam, EPFO, ESIC, OEM) operate using simulated government datasets. No real taxpayer records or classified procurement files are accessed or exposed.
- **Pino Observability Redaction**: The platform logger (`server/observability/logger.ts`) implements automatic path redaction for sensitive fields:
  ```typescript
  redact: ['password', 'secret', 'apiKey', 'geminiApiKey', '*.password', '*.apiKey', '*.secret']
  ```

---

## 5. AI Safety & Zero-Hallucination Policy

- **Deterministic Evaluation Integrity**: Mathematical compliance scores (0–100) are computed strictly by deterministic rule algorithms. The AI model has no write access to scoring tables.
- **Mandatory Evidence Grounding**: The AI model is constrained by structured JSON schemas requiring exact verbatim citations (`rawSnippet`) and source page numbers (`sourcePage`). If a field is omitted from a document, the model must return `isPresent: false` and cite the absence reason.
- **Statutory Non-Delegation Principle**: AI recommendations are explicitly marked with statutory legal disclaimers. Autonomous qualification or disqualification of bids is prohibited by software constraints and GeM GTC policies.

---

## 6. Production Deployment Recommendations

For enterprise deployment in a government cloud environment (e.g., MeghRaj / NIC / AWS GovCloud):
1. **Database Encryption**: Enforce PostgreSQL transparent data encryption (TDE) and TLS 1.3 for all database traffic.
2. **Reverse Proxy & WAF**: Deploy behind a Web Application Firewall (WAF) with rate limiting and DDoS protection.
3. **Dedicated Object Storage**: Transition from local disk storage to encrypted S3 / GCS buckets with private VPC endpoints.
4. **Audit Immutability**: Configure write-once-read-many (WORM) storage or append-only cloud audit logging for legal compliance.
