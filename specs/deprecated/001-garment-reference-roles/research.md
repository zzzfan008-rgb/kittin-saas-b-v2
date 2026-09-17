# Phase 0 Research: 服装多参考图角色确认与提示词约束

## Existing-system findings

- The repository already defines ten stable reference roles and conservative legacy normalization in `src/types/workflow.ts`.
- Browser admission is mirrored through `usePromptRunAdmission`; authoritative admission exists in both `/api/run-plan` and `/api/generate`, with another check immediately before a queued Worker calls a Provider.
- `buildExecutionPlan` preserves edge order and produces `ReferenceImageSource[]`; `resolveReferenceInputs` resolves images and adds a SHA-256 identity before Provider use.
- Generation runs and run steps already have `reference_inputs_json`, and history already exposes role evidence, but some boundaries still accept missing confirmation proof or expose weakly typed data.
- GitNexus identifies `normalizeImageInputReferenceRole` as CRITICAL impact (25 upstream symbols, 11 processes) and `resolveReferenceInputs` plus `referenceRolePrompt` as HIGH impact (8 upstream symbols each, 4 processes). Changes therefore need shared-contract tests before individual UI edits.

## Decision 1: Assign roles per target connection

**Decision**: Persist the actual reference role on each image connection entering a generation node. Keep the image-input node role as a reusable default and legacy migration source.

**Rationale**: A role describes how an image is used by a specific task, not an intrinsic property of the asset. Connection-level state also supports generated upstream images and lets the same source serve different roles in different target tasks.

**Alternatives considered**:

- Source-node-only roles: smaller change, but cannot express target-specific use and leaves generated outputs without a confirmable role.
- Runtime inference from node kind or image content: conflicts with the explicit-confirmation requirement and can silently cross role boundaries.
- Store roles only in transient UI state: would fail save/reopen, undo and immutable-run requirements.

## Decision 2: Keep one canonical role catalog

**Decision**: Define labels and semantic boundaries once in a shared pure TypeScript catalog; UI, admission, history and server prompt rendering consume it.

**Rationale**: The current UI and server each have their own label map. A canonical catalog prevents label and boundary drift while preserving the existing stable role identifiers.

**Alternatives considered**:

- Duplicate browser/server maps: simple locally but makes drift likely.
- Store free-form role text: not reliably testable and weakens Provider constraints.
- Put model-specific prompt prose in the catalog: rejected because model transport/prompt framing remains the server adapter's responsibility.

## Decision 3: Introduce workflow schema v5

**Decision**: Add `referenceRole` and `roleNeedsConfirmation` to persisted edges and move the workflow version to v5. Migrate v4 and older documents deterministically.

**Rationale**: Connection roles are business data and must survive project save/reopen, templates, drafts and document history. A version bump makes the new invariant explicit rather than silently accepting partially shaped documents.

**Migration rule**:

- Edge from an image-input node: copy the node's normalized role and confirmation state.
- Edge through a dedicated semantic handle: assign that fixed role as confirmed because the labeled connection action is explicit.
- Edge from any other source: map to `generic` and mark pending.
- Unknown legacy values: preserve the image/edge, map conservatively and mark pending.

**Alternatives considered**:

- Reuse v4 with optional edge fields: would make missing data indistinguishable from confirmed data.
- Rewrite node data and discard old roles: would lose user intent and violate backward compatibility.

## Decision 4: Confirmation proof is explicit false

**Decision**: At all user-reference boundaries, only `roleNeedsConfirmation === false` proves confirmation. Missing, true or invalid values are blocked before enqueue.

**Rationale**: Optional/missing values otherwise allow direct callers or migrated documents to bypass explicit confirmation. The rule matches the current conservative node normalizer.

**Alternatives considered**:

- Treat a valid role string as sufficient: cannot distinguish user choice from a migration fallback.
- Treat missing as confirmed for compatibility: preserves ambiguous requests but contradicts the feature's main safety outcome.

## Decision 5: Use layered admission with one shared decision model

**Decision**: Keep three enforcement points—browser feedback, authoritative route admission, and Worker pre-Provider admission—but derive all role decisions and codes from the same pure domain function.

**Rationale**: Browser feedback improves usability, route admission blocks untrusted clients, and Worker admission protects delayed jobs from stale or malformed snapshots. Sharing the decision model prevents semantic divergence.

**Alternatives considered**:

- Browser-only validation: bypassable and unsafe for paid calls.
- Route-only validation: queued records could drift before delayed execution and users get slower feedback.
- Independent rules at each layer: duplicates logic and creates inconsistent errors.

## Decision 6: Freeze evidence at enqueue, resolve content at execution

**Decision**: Persist ordered role/source/image references when the run is enqueued. Resolve bytes and compute the asset hash during execution; store the final evidence without image bodies.

**Rationale**: The queued run remains independent of later canvas edits while existing access checks and file resolution stay authoritative. Hashes provide content identity without bloating history rows.

**Alternatives considered**:

- Read live canvas state during execution: later edits could mutate an already accepted run.
- Persist full data URLs in evidence: increases database size and duplicates file storage.
- Hash only at enqueue: can require eagerly resolving every image inside the submission transaction.

## Decision 7: Render role boundaries centrally, wrap per model

**Decision**: Generate an ordered, explicit role-boundary list from the canonical catalog, then wrap it with model/mode-specific instructions in `referenceRolePrompt`.

**Rationale**: Every Provider receives the same business semantics while retaining the distinct input wording required by each model contract.

**Alternatives considered**:

- One generic prompt for every model: ignores provider contract differences.
- Put role prose in each Provider adapter: duplicates business semantics.
- Let the model infer roles from image order: not auditable and violates explicit boundaries.

## Decision 8: Validate without paid generation

**Decision**: Use domain tests, PostgreSQL-backed route/queue tests, fake Provider captures and desktop Playwright scenarios. Real Provider calls are excluded.

**Rationale**: These tests can prove role order, confirmation, request prompt contents, immutable snapshots and history evidence deterministically without cost or ambiguous asynchronous outcomes.

**Alternatives considered**:

- Visual-only UI checks: cannot prove server or Provider-request semantics.
- Real Provider acceptance in the implementation suite: costly, nondeterministic and outside the feature scope.

## Clarification status

All technical unknowns required for Phase 1 are resolved; no material question remains open.
