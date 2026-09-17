# Quickstart Validation: 服装多参考图角色确认与提示词约束

This guide validates the feature without a real or paid Provider call. Detailed shapes are defined in [data-model.md](data-model.md) and [contracts/](contracts/).

## Prerequisites

- Work from the repository root.
- Use the project Node.js version and the existing isolated PostgreSQL test runner.
- Keep Provider calls stubbed or captured by test doubles.

## 1. Focused domain and migration checks

```bash
npx tsx tests/reference-inputs.test.ts
npx tsx tests/prompt-run-admission.test.ts
npx tsx tests/workflow-schema.test.ts
npx tsx tests/document-snapshot.test.ts
```

Expected outcomes:

- all ten roles use one shared catalog;
- missing confirmation proof fails closed;
- v0–v4 projects preserve images and migrate ambiguous roles to pending v5 assignments;
- edge roles survive snapshot round trips and preserve order.

## 2. DAG, queue, history and Provider-request checks

Run the repository's isolated integration suite:

```bash
npm run test
```

Expected outcomes:

- `/api/run-plan` and `/api/generate` reject the same invalid role sets before enqueue;
- a queued run keeps its original role snapshot after the project changes;
- the Worker rejects malformed snapshots before the Provider double is called;
- captured Provider prompts and images share one order;
- history returns typed, index-aligned role evidence.

## 3. Desktop behavior checks

Run the existing desktop E2E harness:

```bash
npm run test:e2e
```

Validate at the configured desktop widths required by `AGENTS.md §§1, 5`:

1. Add three references for identity, pose/composition and garment.
2. Confirm that the target node lists them in actual order and blocks Run while any role is pending.
3. Confirm every role; Run becomes available without a real Provider request in the mocked scenario.
4. Change a role, reorder references and remove one; verify remaining roles do not drift.
5. Save and reopen the project; verify role, pending state and order round-trip.
6. Open a migrated legacy fixture; verify images remain and ambiguous roles require confirmation.
7. Open a completed mocked result; verify history shows the immutable ordered role snapshot.

Expected UI outcome: keyboard access, focus visibility and compact node layout remain usable at every supported width.

## 4. Repository verification

Run the focused checks above, then follow the current commands and evidence requirements in `AGENTS.md §5`. This feature's final evidence must include the exact spec scenarios it proves; no real Provider acceptance is part of this quickstart.

## Scenario-to-evidence matrix

| Scenario | Primary evidence |
|----------|------------------|
| AS-001, AS-002 | admission tests and desktop E2E |
| AS-003, AS-004 | captured per-model Provider prompt tests |
| AS-005 | Store, snapshot and DAG order tests |
| AS-006 | queue snapshot and history tests |
| AS-007 | project round-trip and desktop E2E |
| AS-008, AS-009 | workflow migration and prompt-boundary tests |
