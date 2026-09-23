# Contributing to SATYAM

Thank you for your interest in contributing to **SATYAM** (*AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement*).

## Engineering Standards

1. **Deterministic Compliance First**: Policy evaluation code must remain deterministic and testable. AI models provide clause candidate suggestions and extraction; policy evaluation logic resides in `@gev-verify/compliance-core`.
2. **Evidence Provenance**: Any check, flag, or finding must link back to an evidence pointer (document ID, SHA-256 hash, page, bounding excerpt).
3. **Audit Immutability**: All state mutations must log to the forward-chained SHA-256 audit ledger.
4. **Zero Regressions**: All 82 automated test cases (`bun run test`) must pass before submitting a pull request.
5. **TypeScript Strictness**: Code must compile cleanly with `tsc --noEmit` (`bun run lint`).

## Local Development Workflow

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   bun install --frozen-lockfile
   ```
3. Run test suite:
   ```bash
   bun run test
   ```
4. Verify TypeScript compilation:
   ```bash
   bun run lint
   ```
5. Test build:
   ```bash
   bun run build
   ```

## Commit Message Conventions

Use conventional commits:
- `feat:` New functionality (e.g. new verification adapter, ruleset clause)
- `fix:` Bug fixes or defect resolutions
- `docs:` Documentation improvements
- `test:` Adding or refining automated tests
- `refactor:` Code improvements that do not change external behavior
