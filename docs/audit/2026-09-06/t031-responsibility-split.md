# T031 Responsibility Split Evidence

Captured: 2026-09-06

Status: complete for the bounded compatibility-facade extraction. This is not a release approval. The full uncommitted candidate remains fail-closed until the later convergence gates pass.

## Scope and ownership

| Existing entry point | Extracted responsibility | New owner | Compatibility boundary |
| --- | --- | --- | --- |
| `server/lib/database.ts` | Pool lifecycle, primitive queries, transactions, PostgreSQL version assertion and initialization promise state | `server/lib/databaseRuntime.ts` | Existing `db`, `query`, `queryOne`, `transaction` and `closeDatabaseForTests` imports are direct re-exports. Migration order, schema and bootstrap behavior stay in `database.ts`. |
| `server/engine/runQueue.ts` | Durable statuses, queue error classes, terminal-state classification, retry classification and unknown-outcome guidance | `server/engine/runQueueContracts.ts` | Existing public error classes and `DurableRunStatus` remain available from `runQueue.ts`; class identity is preserved. |
| `server/engine/runner.ts` | Business-side exact aspect and upscale output post-processing | `server/engine/runnerOutputProcessing.ts` | `postProcessGeneratedOutputImages` remains a direct re-export from `runner.ts`. |
| `server/lib/evaluationEvidence.ts` | Canonical JSON, hashing, cloning/freezing and primitive evidence validation helpers | `server/lib/evaluationEvidenceCanonical.ts` | No new public API was introduced. The public evidence builders and types remain owned by `evaluationEvidence.ts`. |
| `src/store/flowStore.ts` | SSE event types, untrusted-event normalization, node event reduction and requested result count | `src/store/flowRunEvents.ts` | Existing value and type exports remain direct re-exports from `flowStore.ts`; Zustand remains the single business-state owner. |

## Compatibility, migration and rollback

- Database schema, migration numbering, stored document shape, queue payloads and evaluation evidence formats were not changed by this extraction.
- Existing import paths remain valid. `tests/module-facade-contract.test.ts` asserts runtime reference identity for database functions, queue error classes, runner output processing and flow event helpers.
- Rollback is file-local: move each extracted implementation back behind its original entry point and remove the corresponding re-export. No data rollback or migration is required.
- Evaluation canonicalization remains internal to the evidence module. Rolling it back does not change persisted evidence formats as long as the same canonicalization implementation is restored.

## GitNexus impact

Pre-change impact was reviewed before extraction. After refreshing the current worktree index with PDG, the exact new symbols reported:

| Symbol | Direct dependents | Total impacted | Risk | Required coverage |
| --- | ---: | ---: | --- | --- |
| `databaseRuntime.query` | 18 | 69 | CRITICAL | PostgreSQL schema, SQLite import, queue, generation and upload tests |
| `databaseRuntime.transaction` | 24 | 36 | CRITICAL | Transaction rollback and all PostgreSQL-backed focused tests |
| `runQueueContracts.GenerationRequestConflictError` | 2 | 7 | LOW | Queue conflict/idempotency tests and facade identity |
| `runnerOutputProcessing.postProcessGeneratedOutputImages` | 2 | 6 | LOW | Exact generation and upload normalization tests |
| `flowRunEvents.normalizeRunEvent` | 1 | 5 | LOW | Recent result lifecycle and facade identity tests |
| `evaluationEvidenceCanonical.canonicalJsonValue` | 3 | 9 | HIGH | Evaluation snapshot/evidence tests |

The repository-wide `detect_changes(scope=all)` result remains `critical` because it evaluates the complete 94-file dirty candidate, including earlier P0-P3 work. It is retained as a convergence warning and is not reclassified as a T031-only failure.

## Verification

All commands ran with Node `24.20.0`.

- `npm run lint`: pass.
- `tests/module-facade-contract.test.ts`: pass; four compatibility assertions.
- `tests/recent-results.test.ts`: pass; 20 cases.
- `tests/evaluation-evidence.test.ts`: pass.
- Isolated PostgreSQL 18 focused run: pass.
  - `tests/schema-migrations.test.ts`
  - `tests/sqlite-postgres-migration.test.ts`
  - `tests/run-queue.test.ts`: 42 cases.
  - `tests/exact-generation.test.ts`: 19 cases.
  - `tests/upload-image-normalization.test.ts`: 8 cases.
- `npm run build`: pass; initial JS gzip `164387` bytes, within the `210000` byte budget.
- `git diff --check`: pass.
- Provider or image generation/editing endpoint calls: 0.

No API易 knowledge validation was run for this extraction because no API易 contract, model, parameter, prompt, Provider transport or API易 evidence source changed.
