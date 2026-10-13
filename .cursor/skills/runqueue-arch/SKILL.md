# runqueue-arch

Analyze backend DAG + run-queue engine.

Read first:

- `server/engine/dag.ts` — DAG validation
- `server/engine/runner.ts` — execution semantics
- `server/engine/runQueue/` — queue, concurrency, recovery

Rules:

- Preserve `tabId + projectId + documentEpoch` binding on async writes.
- Keep destructive multi-table operations transactional.
- Auth (`requireAuth` / `requirePasswordChanged` / `requireAdmin`) is never weakened.
