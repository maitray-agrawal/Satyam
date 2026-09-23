# AI & Template Fingerprint Audit Report

**Project**: SATYAM — Government Procurement Bid Compliance Verification Platform  
**Audit Scope**: Entire repository recursive string scan across all source files, configurations, templates, documentation, and metadata.  
**Audit Date**: 2026-09-23  

---

## 1. Classification Categories

- **A. REQUIRED RUNTIME DEPENDENCY**: Essential functional libraries, domain model fields, or service providers required for core execution.
- **B. LEGITIMATE THIRD-PARTY ATTRIBUTION**: Mandatory legal attributions, open-source license headers, or official standard citations.
- **C. TEMPLATE / DEVELOPMENT TOOL ARTIFACT**: Residual scaffolding, starter templates, or IDE configuration artifacts.
- **D. UNUSED / DEAD CONFIGURATION**: Obsolete environment variables or dead configuration flags.
- **E. DOCUMENTATION NOISE**: Outdated project branding, placeholder descriptions, or misleading marketing copy.
- **F. GITHUB-OWNED REPOSITORY METADATA**: GitHub repository template linkage ("Generated from...") that is controlled solely by GitHub platform metadata.

---

## 2. Comprehensive Occurrence Inventory

| Occurrence / String | File Path(s) | Category | Action Taken | Technical / Governance Rationale |
|---|---|---|---|---|
| `google-gemini/aistudio-repository-template` | GitHub Platform Metadata (Repository Header) | **F** | Retained (Not editable via git) | GitHub platform-level metadata cannot be modified through source code commits. Acknowledged as repository lineage. |
| `@google/genai: ^2.4.0` | `package.json:17` | **A** | Retained | Required runtime dependency for LLM-assisted document clause extraction and co-pilot interactive chat. |
| `Gemini` / `gemini.ts` | `server/gemini.ts`, `server/ai/` | **A** | Retained | Implementation files providing document OCR parsing, clause matching, and officer co-pilot assistance with deterministic fallback. |
| `generatedAt` | `packages/shared-types`, `server/db.ts`, `prisma/schema.prisma` | **A** | Retained | Legitimate domain schema timestamp field recording when recommendations and evaluation runs were created. |
| `GEV-VERIFY` (in doc titles) | `docs/DEMO_GUIDE.md`, `docs/SECURITY.md`, `docs/architecture.md` | **E** | Updated to SATYAM | Replaced legacy working title with official SIH platform identity **SATYAM**. |
| `@gev-verify/*` (package scope) | `packages/*/package.json`, `tsconfig.json`, `bun.lock` | **A** | Retained | Internal monorepo package scope (`@gev-verify/shared-types`, `@gev-verify/compliance-core`). Preserved to maintain clean dependency resolution and prevent breaking import paths. |
| `AI Studio` | Entire repository | None | Verified Absent | 0 occurrences in source code or documentation. |
| `ChatGPT` / `chatgpt` | Entire repository | None | Verified Absent | 0 occurrences in source code or documentation. |
| `OpenAI` / `openai` | Entire repository | None | Verified Absent | 0 occurrences in source code or documentation. |
| `Anthropic` / `anthropic` | Entire repository | None | Verified Absent | 0 occurrences in source code or documentation. |
| `Claude` / `claude` | Entire repository | None | Verified Absent | 0 occurrences in source code or documentation. |
| `Antigravity` / `antigravity` | Entire repository | None | Verified Absent | 0 occurrences in source code or documentation. |
| "Built with" / "Created with" | Entire repository | None | Verified Absent | 0 promotional boilerplate template strings found. |

---

## 3. Findings & Governance Conclusion

1. **Clean Codebase**: The repository contains no promotional AI boilerplate, no third-party generator badges, and no unapproved development-tool footprints.
2. **AI Provider Isolation**: Google GenAI integration is isolated to the advisory and extraction layer, with complete deterministic fallback (`generateDeterministicRecommendation`) ensuring that the platform operates reliably even in disconnected or air-gapped evaluation environments.
3. **Repository Lineage Transparency**: The GitHub repository header displays the template provenance. Per hackathon guidelines and GitHub specifications, this is cataloged as Category F (Platform Metadata) and is not fabricated or misrepresented.
