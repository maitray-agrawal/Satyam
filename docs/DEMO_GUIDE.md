# SATYAM — Platform Demonstration Guide

This guide outlines a comprehensive **3 to 5 minute live demonstration sequence** designed for Smart India Hackathon (SIH26100) jury evaluation, technical reviewers, and procurement officers.

---

## Pre-requisites & Quick Start
Before beginning the walkthrough:
1. Ensure the platform is running:
   ```powershell
   npm run dev
   ```
2. Open your browser to: **`http://localhost:3000`**
3. The platform is pre-loaded with representative tenders and multi-scenario bidders (Clean, Discrepant, Debarred, Startup).

---

## 3–5 Minute Step-by-Step Demonstration Sequence

### Step 1: Executive Dashboard Overview
- **What to show**: The initial dashboard screen.
- **Key Talking Points**:
  - Point out top metrics: Total Active Tenders, Evaluated Bidders, Discrepancies Detected, and High/Critical Risk Flags.
  - Highlight the **SLA Clock** and **Statutory Compliance Badge** indicating alignment with **GFR 2017** and **GeM GTC v4.0**.
  - Note the clear simulation banner clarifying that external registries are running on simulated sandbox data for this evaluation environment.

### Step 2: Tender Selection
- **What to show**: Navigate to **Tender Catalog** or select the default featured tender from the dashboard:
  - *Tender: "Procurement of High-Performance Computing Cluster & Networking Equipment"* (Tender ID: `GEM/2026/B/948210`).
- **Key Talking Points**:
  - Show the statutory requirements table (GST, PAN, CA Turnover Certificate, OEM Authorization, Make-in-India Local Content, Debarment Undertaking).
  - Demonstrate that each requirement has an assigned evaluation weight and threshold.

### Step 3: Select a Discrepant Bidder Dossier
- **What to show**: Click on Bidder **"Apex Infotech Solutions"** (Bid ID: `bid-2`) or **"Bharat Electro-Tech Pvt Ltd"** (`bid-3`).
- **Key Talking Points**:
  - Explain that the dossier aggregates all submitted bidder documentation, third-party verification results, and cross-document reconciliation in one pane.

### Step 4: Inspect Uploaded Documents
- **What to show**: Switch to Subtab **"2. Uploads & Document Intelligence"**.
- **Key Talking Points**:
  - View the list of ingested bidder files: GST Registration Certificate, Audited Balance Sheet, OEM Authorization Letter, PAN Card.
  - Click on a document (e.g., *GST Registration Certificate*) to open the Document Deep-Dive Inspector.

### Step 5: Show Extracted Evidence & Zero-Hallucination Citations
- **What to show**: Review the **Extracted Fields** table in the inspector.
- **Key Talking Points**:
  - Highlight exact textual evidence: extracted Legal Entity Name, GSTIN, and registration date.
  - Notice the **Source Page Citation** and verbatim **Raw Snippet** quoted from the source text.
  - Point out that absent fields are explicitly marked `isPresent: false` with reason `Not stated in document` to guarantee a **zero-hallucination policy**.

### Step 6: Multi-Source Verification Results
- **What to show**: Switch to Subtab **"3. Third-Party Registry Verification"**.
- **Key Talking Points**:
  - Review the 13 simulated statutory adapters (CBIC/GSTN, CBDT/PAN, Udyam MSME, EPFO, ESIC, OEM Authorization, CPPP Debarment).
  - Show how external portal status is retrieved independently of what the bidder claimed.

### Step 7: Open Three-Way Evidence Reconciliation
- **What to show**: Switch to Subtab **"4. 3-Way Cross-Verification"** (or the dedicated Three-Way Reconciliation view).
- **Key Talking Points**:
  - Show the side-by-side tri-party comparison columns:
    1. **Layer 1**: Extracted Bidder Document Evidence
    2. **Layer 2**: External Simulated Government Portal Record
    3. **Layer 3**: Tender Mandatory Rules & Thresholds

### Step 8: Demonstrate Real-Time Discrepancy Detection
- **What to show**: Locate a requirement with a conflict (e.g., OEM Authorization code mismatch or Make-in-India local content below threshold).
- **Key Talking Points**:
  - Highlight the discrepancy badge: the system flagged a contradiction between the claimed value in the bidder's document and the authoritative registry record.
  - Explain how manual scrutiny usually misses these subtle cross-document discrepancies.

### Step 9: Show Deterministic Compliance Scoring
- **What to show**: Point to the top Compliance Summary card showing the **Deterministic Compliance Score** (e.g., `55/100`).
- **Key Talking Points**:
  - Emphasize: **The compliance score is 100% mathematical and rule-based**.
  - Show the breakdown: passing items receive full weight; non-compliant mandatory items receive 0; blacklisting triggers score capping.
  - Point out that **AI cannot alter this score**.

### Step 10: Explainable Risk Assessment
- **What to show**: The Risk Assessment badge and Critical Disqualification Flags.
- **Key Talking Points**:
  - Show the categorized risk tier (`LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`).
  - Explain that critical flags clearly state the statutory clause violated (e.g., *GFR Rule 144(xi)* or *GeM GTC Clause 4.2*).

### Step 11: Inspect the AI Advisory Layer
- **What to show**: Switch to Subtab **"5. AI Recommendation & Copilot"**.
- **Key Talking Points**:
  - Highlight the **Prominent Statutory Disclaimer**: *"AI is strictly decision support. Autonomous qualification/disqualification is legally prohibited."*
  - Review the structured recommendation: Recommendation (`MANUAL_REVIEW` / `NON_COMPLIANT`), Key Positive Factors, Critical Defects, and Recommended Clarification Steps under GeM guidelines.

### Step 12: Procurement Officer Decision & Override
- **What to show**: Click the **"Record Officer Decision"** button at the top right.
- **Key Talking Points**:
  - Select determination: `QUALIFY`, `DISQUALIFY`, or `CLARIFICATION_REQUESTED`.
  - Demonstrate the **Mandatory Justification Field**: The officer must provide a written rationale (minimum 10 characters) citing tender rules.
  - Save the decision to create an immutable governance record.

### Step 13: Evaluation Runs & Audit Ledger
- **What to show**: Navigate to **"Audit Ledger"** or the **"Evaluation Runs"** tab.
- **Key Talking Points**:
  - Show the chronological, append-only log of every event: document upload, verification check, reconciliation run, officer decision.
  - Every entry captures: Actor Role, Actor Email, Timestamp, and Before/After state change.

### Step 14: Generate Audit-Grade Summary Report
- **What to show**: Click **"Print Report"** or **"Export Evaluation Summary"**.
- **Key Talking Points**:
  - Displays a clean, printable technical dossier with bidder profile, requirement checklist, reconciliation matrix, AI advisory synopsis, and official signed determination block for the Tender Inviting Authority.

---

## Summary of Key Demo Scenarios

| Scenario | Bidder Name | Key Characteristic Demonstrated | Expected Result |
| :--- | :--- | :--- | :--- |
| **Scenario 1** | TechVanguard Solutions | 100% compliant documentation, active GST/PAN/Udyam, valid CA UDIN | **100/100 — LOW RISK** (Qualified) |
| **Scenario 2** | Apex Infotech Solutions | Fake or mismatched OEM Authorization code | **55/100 — HIGH RISK** (Discrepancy Flagged) |
| **Scenario 3** | Bharat Electro-Tech | Local Content (35%) below Class-II MII threshold (50%) | **65/100 — HIGH RISK** (Non-Compliant) |
| **Scenario 4** | Global Quantum Systems | Debarred/blacklisted entity in simulated CPPP repo | **5/100 — CRITICAL RISK** (Disqualified) |
| **Scenario 5** | Surya Solar Innovations | DPIIT recognized startup claiming statutory exemption | **EXEMPTED CLAUSES APPLIED** |
