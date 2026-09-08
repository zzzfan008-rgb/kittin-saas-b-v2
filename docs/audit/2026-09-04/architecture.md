# Garment Canvas Audit Architecture

## Scope

The audit covers the current working tree candidate and the stored `origin/main` architecture. The working tree is the candidate of record because `HEAD` and `origin/main` are identical while the worktree contains tracked and untracked changes.

## Layer Map

### Domain and shared rules

- `src/types/workflow.ts` and `src/types/imageModels.ts` define node, model, document and execution shapes.
- `src/lib/documentSnapshot.ts`, `src/lib/referenceInputs.ts`, `src/lib/referenceRoles.ts` and `src/lib/promptRunAdmission.ts` own pure normalization and admission rules.
- `src/lib/garmentPromptPresets.ts`, `src/types/modelParameterProfiles.ts` and `src/lib/providerPromptRenderer.ts` bind prompt variants and model-specific native parameters.
- `src/lib/evaluation*` and `src/types/promptEvaluation.ts` define release vectors, evaluation policy and evidence projections.

### Adapters and runtime

- Express routes under `server/routes/` authenticate requests and translate them to domain inputs.
- `server/lib/database.ts` owns PostgreSQL 18 lifecycle and migrations; SQLite is used only for compatibility tests.
- `server/lib/fileStore.ts`, `server/lib/imageValidation.ts` and `server/lib/imageReferenceAccess.ts` own file and image boundaries.
- `server/engine/dag.ts` builds plans; `server/engine/runQueue.ts` owns durable queue state, leases, retries, unknown outcomes and result persistence; `server/engine/runner.ts` creates runs.
- `server/providers/apiyi.ts`, `server/providers/apiyiTransport.ts`, `server/providers/exact.ts` and `server/providers/base.ts` own provider adaptation and error classification.

### Release and evidence

- `docs/ai/apiyi/` stores reviewed contract metadata, source fingerprints and evidence summaries.
- `docs/ai/evaluation/` stores evaluation plans, prompt/model matrices and release registries.
- `scripts/apiyi-docs.mjs`, `scripts/apiyi-kb.mjs`, `scripts/evaluation-*` and `scripts/codex-gate.mjs` enforce offline evidence and fail-closed release policy.

## Core Flows

### Authentication and ownership

1. Auth middleware resolves the session user.
2. Route handlers load the target project, file, run, template or usage rows.
3. Ownership or administrator capability is checked before mutation.
4. PostgreSQL transactions transfer or mutate owned rows with deletion protection.
5. The route returns a stable error shape without secrets or provider internals.

Primary evidence: `tests/auth-storage.test.ts`, `tests/authorization.test.ts`, `server/routes/auth.ts`, `server/routes/projects.ts`, `server/routes/files.ts`, `server/routes/assets.ts`.

### Document and async boundary

1. A tab owns a `ProjectTab` and its `documentEpoch`.
2. Save, upload, run and history operations capture `{ tabId, projectId, documentEpoch }`.
3. A response is accepted only if all tuple fields still match the current tab.
4. A queued run stores a canonical execution snapshot; later tab edits cannot mutate it.
5. Results are applied to the matching node and project or reported unavailable.

Primary evidence: `src/store/flowStore.ts`, `src/lib/documentSnapshot.ts`, `tests/active-document-boundary.test.ts`, `tests/project-tabs-session.test.ts`, `tests/flow-history.test.ts`.

### DAG, queue and provider

1. `buildExecutionPlan` validates the workflow and produces ordered `NodeExecution` steps.
2. `createRun` stores the immutable plan and durable run metadata.
3. `claimNextJob` acquires a lease and records retry/evaluation policy.
4. `runner` resolves the provider and performs prompt/reference admission before a paid call.
5. `apiyiTransport` classifies deterministic errors separately from ambiguous transport failures.
6. `runQueue` persists provider originals before business post-processing and marks ambiguous outcomes as `outcome_unknown` without replay.
7. Completion is guarded by run and step identity, then history and usage records are written.

Primary evidence: `server/engine/dag.ts`, `server/engine/runQueue.ts`, `server/engine/runner.ts`, `server/providers/apiyi.ts`, `server/providers/apiyiTransport.ts`, `tests/dag.test.ts`, `tests/run-queue.test.ts`, `tests/provider-contract.test.ts`, `tests/apiyi-transport.test.ts`.

### Storage and recovery

1. PostgreSQL 18 migrations run through `server/lib/database.ts`.
2. Legacy snapshots are normalized before becoming editable documents.
3. Files are stored below the configured data root and retain provider-original evidence where required.
4. History and result routes apply ownership checks and expose missing assets as unavailable.
5. SQLite migration tests provide compatibility evidence only; they do not replace PostgreSQL semantics.

Primary evidence: `tests/schema-migrations.test.ts`, `tests/sqlite-postgres-migration.test.ts`, `tests/recent-results.test.ts`, `tests/image-viewer-reference-evidence.test.ts`.

## Evidence Gaps

- GitNexus does not fully reverse every router mounted from `server/index.ts`; `/api/generate` and `/api/templates` require manual route and response-shape records.
- The external raw API易 model export is intentionally outside Git. Its exact byte SHA and canonical ID-set SHA are recorded, but the file must be supplied from the controlled external path for a fresh contract check.
- Catalog presence is not generation, edit, quality, billing or release evidence. All five model runtime statuses remain unverified until separately authorized evaluation evidence exists.
- The final `origin/main` release gate is invalid until the candidate is committed; the uncommitted gate is the only meaningful interim receipt.

## Redesign Guardrails

Any P2/P3 split must preserve old readers, map old interfaces to new domain functions, keep database/document migrations additive, and provide a reversible adapter switch. UI components must consume existing domain projections and may not create a second business-state owner.
