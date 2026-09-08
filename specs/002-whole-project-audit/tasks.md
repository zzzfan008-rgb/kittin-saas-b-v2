---

description: "Dependency-ordered audit, remediation and verification tasks for Garment Canvas"
---

# Tasks: Garment Canvas 全量逻辑与代码审计整改

**Input**: Design documents from `specs/002-whole-project-audit/`

**Prerequisites**: `spec.md`, `research.md`, `plan.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1: Baseline and Spec Kit closure

- [x] T001 Create the ordered Spec Kit artifacts and update `.specify/feature.json` to this feature (FR-001–FR-003).
- [x] T002 Record Git, environment, test and external API易 evidence baseline in `docs/audit/2026-09-04/baseline.json` (FR-001, FR-011, FR-012).
- [x] T003 Record architecture, findings and verification ledgers without deleting or overwriting existing worktree evidence (FR-001–FR-003).
- [x] T004 Run Spec Kit cross-artifact analysis and resolve any orphan requirement, task or contract. Evidence: 16 FRs and 7 buildable SCs have task coverage; all planned contracts exist; no orphan requirement or task found in the 2026-09-04 analysis.

## Phase 2: P0 release and security blockers

- [x] T010 Run GitNexus `api_impact` and `shape_check` for every changed write route; record authorization and response-shape findings (FR-004, FR-005, FR-010). Evidence: `docs/audit/2026-09-04/route-authorization-shapes.json`; mounted-route reverse mapping limitations are recorded explicitly.
- [x] T011 Reproduce and fix confirmed ownership, session, SSRF, path, sensitive-log, data-loss or duplicate-provider-submission defects; add one focused regression per P0/P1 finding (FR-005, FR-007, FR-010, FR-013). Evidence: `tests/authorization.test.ts`, `tests/auth-storage.test.ts`, `tests/upload-image-normalization.test.ts`, `tests/e2e-safety.test.mjs`, `tests/provider-retry.test.ts`, `tests/run-queue.test.ts`, `tests/active-document-boundary.test.ts`; no confirmed actionable P0/P1 defect remains in `findings.json`.
- [x] T012 Verify the five exact API易 catalog IDs, raw export SHA and `reviewedExportSha256` baseline offline without image endpoint calls (FR-011, FR-012).
- [x] T013 Classify `server/routes/usage.ts` CSV/XSS alert using response headers, formula-injection tests and actual download semantics; keep any unresolved risk fail-closed (FR-005, FR-013). Evidence: `docs/audit/2026-09-04/findings.json` finding `AUDIT-P1-002` and authorization CSV assertions.

## Phase 3: P1 core boundaries

- [x] T020 Verify `tabId + projectId + documentEpoch` across save, upload, run and result write-back, then fix stale-response paths with focused tests (FR-006, FR-013). Evidence: `src/store/flowStore.ts`, `src/lib/documentSnapshot.ts`, `tests/active-document-boundary.test.ts`, `tests/project-tabs-session.test.ts`, `tests/flow-history.test.ts`.
- [x] T021 Verify DAG admission, queue lease recovery, retry classification, unknown outcomes and idempotent completion with fake Providers (FR-007, FR-008, FR-013). Evidence: `server/engine/dag.ts`, `server/engine/runQueue.ts`, `server/engine/runner.ts`, `tests/dag.test.ts`, `tests/run-queue.test.ts`, `tests/provider-retry.test.ts`.
- [x] T022 Verify Provider parameter profiles, product/upstream IDs and output persistence for all active models; API易 checks are conditional on related changes (FR-008, FR-011). Evidence: `server/providers/apiyi.ts`, `server/providers/apiyiTransport.ts`, `src/types/modelParameterProfiles.ts`, `docs/ai/evaluation/node-prompt-parameter-matrix-v1.json`, `tests/apiyi-transport.test.ts`, `tests/provider-contract.test.ts`, `tests/model-parameter-profiles.test.ts`, `tests/node-prompt-parameter-matrix.test.ts`, `npm run docs:apiyi:kb:check`.
- [x] T023 Verify PostgreSQL migration transactions, SQLite compatibility, legacy reads and deletion protection; add rollback coverage (FR-009, FR-013). Evidence: `server/lib/database.ts`, `tests/schema-migrations.test.ts`, `tests/sqlite-postgres-migration.test.ts`, `tests/auth-storage.test.ts`.
- [x] T024 Verify history/result access, comparison, download, set-as-input and cross-project restoration ownership/evidence boundaries (FR-010, FR-013). Evidence: `server/routes/history.ts`, `server/lib/generationRecords.ts`, `tests/recent-results.test.ts`, `tests/image-viewer-reference-evidence.test.ts`, `tests/authorization.test.ts`.

## Phase 4: P2 reliability and performance

- [x] T030 Capture p95, query count, memory and bundle baselines for queue, database, image processing and desktop rendering. Evidence: `docs/audit/2026-09-06/performance-baseline.json` and `docs/audit/2026-09-06/performance-baseline.md`; Node `24.20.0`; queue-claim p95 `3.481 ms` with 9 queries/claim, database transaction p95 `1.753 ms`, upload normalization p95 `5625.232 ms`, 100-node stable-paint p95 `245.8 ms`, initial JS gzip `164400` bytes. The baseline made zero Provider or image generation/editing calls and is comparison evidence, not a release threshold.
- [x] T031 Split `flowStore`, `database`, `runQueue`/`runner` and evaluation evidence responsibilities only after impact analysis and compatibility tests (FR-014). Evidence: `docs/audit/2026-09-06/t031-responsibility-split.md`, extracted compatibility modules, `tests/module-facade-contract.test.ts`, focused PostgreSQL 18 and evidence/result tests, Node `24.20.0`, production build and `git diff --check`. Existing import paths and runtime identities remain compatible; no schema or persisted format changed.
- [x] T032 Optimize only measured regressions and retain before/after evidence with rollback switches where behavior changes (FR-014, FR-016). Evidence: `docs/audit/2026-09-06/upload-normalization-optimization.json`, `docs/audit/2026-09-06/upload-normalization-optimization.md`, `scripts/upload-normalization-benchmark.ts`, `tests/upload-normalization-config.test.ts`, and `tests/upload-normalization-optimization-evidence.test.ts`. Default libjpeg normalization reduced the deterministic fixture p95 from `5597.935 ms` to `299.507 ms` (`94.65%`) while retaining JPEG, quality-range, 4:4:4 and 1.5 MB invariants; `UPLOAD_NORMALIZATION_MOZJPEG=true` is the rollback switch.

## Phase 5: P3 maintainability and UI

- [x] T040 Unify duplicated shared types and error semantics without introducing a second business-state owner (FR-014). Evidence: `docs/audit/2026-09-06/t040-shared-contracts.md`, `src/types/imageOperations.ts`, `src/lib/apiErrors.ts`, and `tests/module-facade-contract.test.ts`. The duplicated image-operation mode contract and the only file import cycle were removed while preserving the `workflow.ts` export identity; client API error fallback semantics now use a pure helper with no state ownership.
- [x] T041 Run desktop E2E at 1024, 1280 and 1440 CSS px for focus, errors, async feedback and no-overlap layout (FR-015). Evidence: `docs/audit/2026-09-06/t041-desktop-e2e.md`; all 28 isolated Playwright checks passed under Node `24.20.0`, with two retained screenshots per viewport and no Provider or image generation/editing calls.
- [x] T042 Record separately confirmed UI changes and residual usability gaps; do not expand product scope during audit (FR-015, FR-016). Evidence: `docs/audit/2026-09-06/t042-ui-residuals.md`; automated desktop behavior is separated from the still-open ten-designer `T039`, unverified prompt releases, external release-directory preflight and final reviewer gates.

## Phase 6: Convergence and release gate

- [ ] T050 Run focused tests, `npm run lint`, `npm run check`, `npm run build`, `git diff --check`, GitNexus `impact`/`detect_changes` and `npm run gate:codex -- --uncommitted` (FR-013, FR-016). The latest healthy review found and led to the fix for `AUDIT-P1-004`; three post-fix reviewer attempts timed out and remain fail-closed. On 2026-09-06, focused gate/Spec Kit tests, lint, build, dependency audit and diff checks passed, and the unconditional API易 guard defect was fixed; the complete uncommitted gate and receipt remain outstanding. Require `verdict=pass`, `findings=[]`, `gitnexus.status=pass` in a complete gate receipt. See `docs/audit/2026-09-04/verification.md`, `docs/audit/2026-09-06/verification.md` and `AUDIT-P0-003`.
- [x] T051 Reconcile every finding with implementation evidence, regression coverage and disposition; append unresolved work instead of declaring convergence (FR-002, FR-013). Evidence: `docs/audit/2026-09-04/findings.json`, `docs/audit/2026-09-04/verification.md`; open release-environment and external-evidence findings remain explicitly fail-closed.
- [ ] T052 Run `npm run gate:codex -- --base origin/main` only from a clean committed candidate and retain the final receipt (FR-016).

## Dependency order

```text
T001–T003 → T004
T010–T013 → T020–T024
T020–T024 → T030–T032 → T040–T042
all implementation tasks → T050–T052
```

Every task that changes a shared symbol must run GitNexus impact before editing and `detect_changes` before delivery. A task is complete only when its named evidence exists.
