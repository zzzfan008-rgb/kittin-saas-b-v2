# Audit Verification Ledger

Captured on 2026-09-06 while continuing the ordered Garment Canvas audit. The current decision remains **fail-closed**. No image generation, image editing, or paid Provider endpoint was called.

## Runtime Baseline

- Required and aligned Node.js version: `24.20.0`.
- `.nvmrc`: `24.20.0`.
- `package.json#engines.node`: `>=24.20.0`.
- Current host default: `v26.4.0`; verification commands that require the release baseline were executed through `npx -y node@24.20.0`.
- The 2026-09-04 ledger remains an immutable historical Node 22 record and was not rewritten.

## Verification Run On 2026-09-06

| Command or check | Result | Evidence |
|---|---|---|
| `npx -y node@24.20.0 tests/spec-kit-skills.test.mjs` | PASS | Spec Kit skill contract tests passed. |
| `bash .specify/scripts/bash/check-prerequisites.sh --json --require-spec --require-tasks --include-tasks` | PASS | Selected feature is `specs/002-whole-project-audit`; required research, model, contracts, quickstart and tasks artifacts exist. |
| `npx -y node@24.20.0 tests/codex-gate.test.mjs` | PASS | Conditional API易 guard, exact `base..HEAD`/uncommitted arguments, fail-closed failures, reviewer batching, receipts, timeouts and workspace drift are covered. |
| `npx -y node@24.20.0 tests/apiyi-knowledge-base.test.mjs` | PASS | 25 tests passed against temporary fake snapshots with forbidden-network preload; ordinary dependency, project-rule and UI-only changes remain outside the API易 scope. This did not validate the real repository snapshot. |
| Node 24 `npm run lint` | PASS | `tsc --noEmit` completed without diagnostics. |
| Node 24 `npm run build` | PASS | Web and server production builds completed; CSS and JS bundle budgets passed. |
| Node 24 `npm run audit:performance-baseline` | PASS | Isolated PostgreSQL 18, Sharp and Chromium measurements were written to `performance-baseline.json` and `performance-baseline.md`; Provider and image generation/editing calls remained `0`. |
| Node 24 `tests/performance-baseline-contract.test.ts` | PASS | Percentile calculation, evidence boundary metadata and invalid-input fail-closed behavior passed. |
| Node 24 `tests/e2e-safety.test.mjs` | PASS | The dedicated performance project remains in the isolated Playwright inventory and ordinary runs skip collection without the output environment variable. The inventory contract was updated from six to seven spec files. |
| Node 24 `npm audit --json` | PASS | 0 info, low, moderate, high or critical vulnerabilities across 611 dependencies. |
| `git diff --check` | PASS | The current tracked candidate has no whitespace errors. |
| GitNexus impact for `verifyApiyiKnowledge` | PASS | LOW risk; one direct file-level caller and no affected execution process. |
| GitNexus impact for `playwright.config.ts` | PASS | LOW risk; no upstream runtime callers or affected execution process. The standalone E2E safety script is not represented as an indexed symbol, so its contract was verified by direct execution. |
| GitNexus `detect_changes` for the full worktree | PASS WITH CRITICAL SCOPE | 94 changed files, 541 changed symbols, 153 affected symbols; aggregate risk remains critical because the candidate is broad. |

## Ordered Work Packages

1. **P0/P1 correctness and security**: focused authentication, authorization, document isolation, DAG, queue, Provider retry, PostgreSQL migration and result restoration evidence from the preceding ordered steps remains valid. No confirmed actionable P0/P1 finding is currently open, but the broad candidate still requires the final reviewer gate.
2. **Reference-image roles**: role catalog, input validation, prompt binding, document persistence and result evidence tests passed in the preceding step. `specs/001-garment-reference-roles/tasks.md` task `T039` remains open because it requires at least ten independent target designers.
3. **Prompt presets and UI**: all 25 exact prompt variants remain fail-closed as `unverified`. Pending preset confirmation is now bound to the exact serialized prompt/reference/parameter context and is invalidated when that context, read-only state, availability or running state changes. Focused prompt, parameter, policy, admission and UI tests passed in the preceding step.
4. **Evaluation and release infrastructure**: manifest, budget, evidence, code identity, authorization/review ledgers, promotion, release build/runtime and run-policy checks passed offline in the preceding step. Paid Provider authorization remains `0`; recommendation and immutable campaign readiness remain blocked.
5. **Spec Kit and gate tooling**: `scripts/codex-gate.mjs` now invokes the API易 knowledge guard only for exact selected paths that match the narrowed `docs/ai/apiyi/change-scope.json` or the gate's minimal self-protection rules. Ordinary dependency, project-rule, deployment, database, pure UI and non-contract test changes print a deterministic skip message and do not start `scripts/apiyi-kb.mjs`; model, parameter, prompt rendering/admission, Provider transport, reference-request semantics and evaluation-release changes retain exact-scope fail-closed behavior.

## Shared Contracts And Error Semantics

`T040` is complete. `ImageOperationMode` now has one owner in `src/types/imageOperations.ts`; the existing `workflow.ts` export remains compatible, and GitNexus reports zero file import cycles instead of the prior `imageModels.ts ↔ workflow.ts` cycle. Client API error messages now use one stateless helper for server-message precedence and scenario fallback. Focused facade, initial-draft, upload, mask and document-boundary tests pass under Node `24.20.0`. See `t040-shared-contracts.md`.

## Desktop UI Verification

`T041` and `T042` are complete. The isolated 1024, 1280 and 1440 CSS px projects passed all 28 Playwright checks for readable error states, async response isolation, focus behavior, canvas identity and no-overlap geometry. The retained report and screenshot hashes are recorded in `t041-desktop-e2e.md`; confirmed behavior and residual human/release gaps are separated in `t042-ui-residuals.md`.

## Performance Baseline

`T030` is complete with comparison evidence captured under Node `24.20.0` on the Apple M4 host:

- Queue claim: 100 runs, 500 jobs, 20 measured claims; p95 `3.481 ms`; p95 query count `9`.
- Database transaction: `BEGIN + SELECT 1 + COMMIT`; p95 `1.753 ms`; 3 queries per operation.
- Upload normalization: deterministic 1600×1200 PNG; p95 `5625.232 ms`; peak RSS delta `27049984` bytes; peak external-memory delta `14799271` bytes.
- Desktop rendering: 100 React Flow nodes at 1280×720; stable-paint p95 `245.8 ms`; peak JS heap `44700000` bytes.
- Web bundle: 13 JS chunks; initial `515288` bytes and gzip `164400` bytes, within the existing budget.

`T031` and `T032` are complete. The measured upload-normalization bottleneck was isolated to mozjpeg encoding and changed to the default libjpeg encoder. The deterministic comparison reduced p95 from `5597.935 ms` to `299.507 ms` (`94.65%`, `18.69x`) while retaining JPEG, quality-range, 4:4:4 and 1.5 MB invariants. Set `UPLOAD_NORMALIZATION_MOZJPEG=true` and restart to restore the former encoder; no database or document migration is required. Evidence is retained in `upload-normalization-optimization.json` and `upload-normalization-optimization.md`.

## API易 Boundary

The real repository API易 knowledge-base check/guard was **not rerun** in this continuation, following the confirmed rule that it is only required after an API易 call problem or an explicit user request. The Codex gate test uses an isolated fixture stub and does not read the real knowledge snapshot or call API易.

The previously reviewed read-only catalog evidence remains:

- Endpoint evidence: `GET /v1/models`, HTTP 200, captured 2026-09-03.
- Exact active IDs: `gpt-image-2`, `gpt-image-2-vip`, `gemini-3.1-flash-image`, `flux-2-pro`, `seedream-5-0-260128`.
- Active IDs present: 5/5.
- Raw export SHA-256: `7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408`.
- Reviewed normalized export SHA-256: `43b6914c1328f07599468e9129d18ba7966293cf73144b4a722c9494a2c8636d`.
- New image generation/edit calls in this continuation: `0`.
- New paid Provider calls in this continuation: `0`.

## Fail-Closed Conditions

| Condition | Status | Required closure |
|---|---|---|
| Full uncommitted Codex gate | OPEN | Run only when the applicable API易 evidence policy permits the relevant guard, and retain a structured receipt with `verdict=pass`, `findings=[]`, `gitnexus.status=pass`. |
| Clean committed `origin/main..HEAD` gate | OPEN | Requires a reviewed, committed and clean candidate; no commit was created in this continuation. |
| External evaluation release directory | BLOCKED | Configure and validate `GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR`; the prior preflight correctly failed closed when it was absent. |
| Prompt/model release readiness | BLOCKED | All exact prompt variants remain `unverified`; recommendation and immutable campaign ledgers are not ready. |
| Reference-role usability | BLOCKED | Collect the required evidence from at least ten independent target designers (`T039`). |

## Current Decision

The conditional API易 gate defect is fixed and its focused offline tests pass. This does not make the broad candidate releasable: `T050` and `T052` remain open, GitNexus reports critical aggregate scope, and the external evaluation, usability, desktop E2E and release-review evidence is incomplete.
