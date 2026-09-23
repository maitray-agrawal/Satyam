# Changelog

All notable changes to the **SATYAM** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-23

### Added
- **National Institutional Identity**: Official Government of India bilingual navigation bar featuring the transparent vector Lion Capital of Ashoka with *सत्यमेव जयते* (`/emblem.svg`) and SATYAM Sanskrit provenance mark (*सत्यम् / Truth*).
- **Compliance Analysis Report**: Dedicated, A4 print-ready Technical Evaluation Committee (TEC) report view with Back to Dossier navigation, printable bidder particulars, requirement breakdown, and CSS `@media print` rules.
- **Three-Way Evidence Reconciliation Engine**: Automated cross-examination triangulating Tender Requirements, Bidder Submissions, and 13 Statutory Verification Adapters.
- **Cryptographic Audit Ledger**: Forward-chained SHA-256 transaction logging with genesis block verification and instant on-demand integrity auditing.
- **Statutory Verification Adapters**: 13 simulated registry adapters covering GSTN, PAN, Udyam MSME, EPFO, ESIC, Income Tax, Startup India, NSIC, OEM, Debarment, Make in India, MCA21, and DigiLocker.
- **Deterministic Policy Engine**: Normalized 0–100 compliance scoring and risk tiering (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with statutory exemption rules for MSMEs and startups.
- **Comprehensive Automated Test Suite**: 82 test cases across 8 suites achieving 100% pass rate in sub-second execution.
- **Multi-Stage Docker Architecture**: Reproducible `oven/bun:1` builder with `node:22-alpine` production runner.
- **Audit Documentation Suite**: Complete baseline, AI fingerprint audit, test report, performance benchmarks, and security assessment.

### Fixed
- Replaced solid white bounding box artifact in header with transparent vector State Emblem of India.
- Cleanly resolved all git merge conflict markers across frontend components.
- Standardized package management and lockfile consistency with Bun and npm.
