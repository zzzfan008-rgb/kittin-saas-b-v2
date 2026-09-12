# Audit Verification Ledger

Captured and reconciled on 2026-09-04. This ledger records repeatable commands and the current decision. No image generation or image editing endpoint was called.

## Passed

| Command | Result | Evidence |
|---|---|---|
| `bash .specify/scripts/bash/check-prerequisites.sh --json --require-spec --require-tasks --include-tasks` | PASS | `FEATURE_DIR=specs/002-whole-project-audit`; all required artifacts exist |
| `npm run docs:apiyi:kb:check` | PASS | API易 local knowledge base and catalog metadata validate offline |
| `node scripts/apiyi-docs.mjs check --offline` | PASS | API易 source fingerprints and contracts validate without network/image endpoints |
| `npm run evaluation:node-matrix:check` | PASS | Active model/node/prompt parameter matrix validates |
| `npm run evaluation:manifest:check` | PASS | Evaluation manifest and release vectors validate |
| `node tests/codex-gate.test.mjs` | PASS | Gate behavior passes when run alone |
| `npm run check` | PASS | TypeScript, frontend build and serial PostgreSQL-backed test pipeline completed; final output included authorization, queue, document/session, history, export and evaluation-ledger suites |
| `npm run build` | PASS | Production Web and server bundles built; CSS and bundle budgets passed |
| `npx tsx tests/workflow-schema.test.ts` | PASS | 32 schema, legacy migration, image validation and SSRF regressions passed after fixing `AUDIT-P1-004` |
| `git diff --check` | PASS | Tracked candidate diff has no whitespace errors |
| GitNexus `impact` | PASS | Exact checks completed for `saveTab`, `claimNextJob` and `migrate`; `runNode` was disambiguated as needed and covered by focused tests |
| GitNexus `detect_changes` | PASS | Up-to-date index; 87 changed files, 153 affected symbols and critical aggregate risk recorded for the broad candidate |
| `docs/audit/2026-09-04/route-authorization-shapes.json` | PASS | Manual closure for mounted POST/DELETE routes; global auth/password middleware, owner/admin checks and response keys recorded |

## API易 Catalog Baseline

- Endpoint: `GET /v1/models`
- Captured: `2026-09-03T13:22:48.000Z`
- HTTP status: `200`
- Canonical unique IDs: `271`
- Exact expected IDs: `5/5`
- Raw export: `/Users/lionfan/Documents/ChatGPT/无限画布/_external/apiyi-model-catalog/2026-09-03Tmanual-review-v1-models.json`
- Raw export bytes: `61774`
- `reviewedRawExportSha256`: `7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408`
- `reviewedExportSha256`: `43b6914c1328f07599468e9129d18ba7966293cf73144b4a722c9494a2c8636d`
- Paid Provider calls: `0`
- Image generation/edit calls: `0`
- Catalog decision: verified catalog baseline only; runtime release remains unverified and fail-closed.

## Blocked

| Command or condition | Result | Reason |
|---|---|---|
| `npm run evaluation:release:preflight` | BLOCKED | External evaluation release directory is not configured |
| `npm run gate:codex -- --base origin/main` | BLOCKED | Candidate is uncommitted; a base comparison is not a valid final release receipt |
| `npm run gate:codex -- --uncommitted` | BLOCKED | Gate stopped before deterministic checks because current Node.js is `v26.4.0`; the full gate requires exact `v22.20.0` |
| `npm run gate:codex -- --uncommitted` (Node `22.20.0`) | FAIL-CLOSED | Deterministic stages passed. The post-fix reviewer rerun produced no structured finding within the configured timeout; the external receipt records `verdict=fail`, `findings=[]`, and `gitnexus.status=degraded` because `spawnSync codex ETIMEDOUT`. A second review-only rerun with a 30-minute timeout and a subsequent 60-minute extension produced the same fail-closed timeout result. |
| Release environment | BLOCKED | Current Node is `v26.4.0`; release baseline is `22.20.0` |
| Route evidence closure | CLOSED WITH EVIDENCE | GitNexus coverage is incomplete for some mounted write routers; manual route evidence is recorded and no confirmed authorization or response-shape defect was found |

## Final Reconciliation

- `AUDIT-P1-003` is closed with evidence: the serial `npm run check` rerun passed, and the separate production build and tracked-diff checks passed.
- The Node `22.20.0` rerun reached a healthy GitNexus-backed review and found `AUDIT-P1-004`; the migration order is fixed and the 32-case focused suite passes. The post-fix full review, a 30-minute review-only rerun, and a subsequent 60-minute extension all timed out without a structured finding. The candidate remains fail-closed until a complete gate emits an empty-finding pass receipt.
- Latest external reviewer receipt: `/Users/lionfan/Documents/ChatGPT/无限画布/_external/codex-gate-receipts/codex-gate-1d88c334609120bf86f4d0e569185459cab86b4f26d6654e39427cacc227708d.json`.
- The latest receipt captured `reviewOnly=true`, `gateDecision=fail-closed`, `verdict=fail`, `findings=[]`, and `gitnexus.status=degraded`; the degraded status reflects the missing structured reviewer result, not a clean review pass.
- `T011`, `T020`–`T024` and `T051` remain complete in `specs/002-whole-project-audit/tasks.md`; `T050` is open pending a post-fix full gate with a durable receipt, and `T052` remains open until a clean committed candidate exists.
- API易 validation remains conditional on API易-related changes only. The catalog baseline is the exact reviewed `/v1/models` export with five of five expected IDs, `reviewedRawExportSha256=7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408`, and `reviewedExportSha256=43b6914c1328f07599468e9129d18ba7966293cf73144b4a722c9494a2c8636d`.
- No `/v1/images/generations` or `/v1/images/edits` request was sent. No paid Provider call was sent.

## Test Isolation Note

`npm run test:suite` was previously started concurrently with the PostgreSQL-backed check and both processes shared the `garment-canvas-codex-gate-*` temporary directory prefix. That run is not treated as a valid failure or pass. The standalone `node tests/codex-gate.test.mjs` pass is retained; final suite execution must be serial.

## Next Verification Sequence

1. Obtain a structured reviewer result for the current candidate with the complete Node `22.20.0` uncommitted gate; the latest three attempts timed out and remain fail-closed.
2. Configure a controlled external evaluation release directory and rerun `npm run evaluation:release:preflight`.
3. Commit the candidate only after review, then run `npm run gate:codex -- --base origin/main` from the clean committed candidate.
