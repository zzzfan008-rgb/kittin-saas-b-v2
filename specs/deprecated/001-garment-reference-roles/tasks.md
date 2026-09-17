---

description: "Dependency-ordered implementation tasks for garment reference role confirmation"
---

# Tasks: 服装多参考图角色确认与提示词约束

**Input**: Design documents from `/specs/001-garment-reference-roles/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Regression tasks are included because every behavior change in this project requires evidence. Provider interactions must use test doubles; this task set contains no real or paid generation.

**Organization**: Tasks are grouped by user story and carry FR/AS references so each increment can be implemented and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its stated prerequisites because it modifies different files.
- **[Story]**: Maps the task to User Story 1, 2 or 3 in [spec.md](spec.md).
- Every implementation task names its exact target files and the requirements/scenarios it serves.

## Phase 1: Setup and policy checkpoint

**Purpose**: Record the applicable project-policy checkpoint and create reusable test inputs before shared contracts change.

- [x] T001 Record completion of the `AGENTS.md §2` checkpoint for the concrete UI proposal in `specs/001-garment-reference-roles/plan.md` before beginning UI implementation tasks
- [x] T002 [P] Add reusable v0–v5 workflow, duplicate-role, generated-upstream and missing-image fixtures in `tests/fixtures/reference-role-workflows.ts` (FR-003–FR-006, FR-011–FR-014; AS-001, AS-005, AS-008)
- [x] T003 [P] Add failing canonical role-label and semantic-boundary tests for all ten roles in `tests/reference-role-catalog.test.ts` (FR-002, FR-007–FR-009; AS-003, AS-004, AS-009)

**Checkpoint**: The applicable `AGENTS.md §2` checkpoint is recorded and shared fixtures describe the intended contract without modifying production behavior.

---

## Phase 2: Foundational shared contracts

**Purpose**: Create the versioned, persistable role-assignment foundation required by every user story.

**⚠️ CRITICAL**: This phase modifies shared workflow symbols. Re-run the applicable GitNexus impact checks named in each task and surface HIGH/CRITICAL results before editing.

- [x] T004 [P] Add failing deterministic v0–v4 migration, unknown-role preservation, repeated-save idempotency, v5 edge-role validation and strict-current-version tests using `tests/fixtures/reference-role-workflows.ts` in `tests/workflow-schema.test.ts` (FR-003, FR-005, FR-011, FR-012; AS-001, AS-007, AS-008)
- [x] T005 [P] Add failing edge-role clone, undo-safe snapshot, persistence and order round-trip tests in `tests/document-snapshot.test.ts` (FR-006, FR-010, FR-011, FR-014; AS-005–AS-007)
- [x] T006 Re-run GitNexus impact for `WORKFLOW_SCHEMA_VERSION` and shared reference types, then add v5 connection-role fields and explicit-confirmation types in `src/types/workflow.ts` (FR-002, FR-003, FR-005, FR-011; AS-001, AS-007)
- [x] T007 Re-run GitNexus impact for `REFERENCE_ROLE_VALUES`, then implement the single label/responsibility/forbidden-influence catalog in `src/lib/referenceRoles.ts` and make `src/types/workflow.ts` its stable identifier source without circular imports (FR-002, FR-007–FR-009; AS-003, AS-004, AS-009)
- [x] T008 Re-run GitNexus impact for `validateAndMigrateFlow` and built-in workflow normalization, then implement idempotent v0–v4-to-v5 connection-role migration, validate v5 assignments, reject malformed current-version role data and normalize built-ins in `server/lib/workflowSchema.ts` and `server/lib/database.ts` (FR-003–FR-005, FR-011, FR-012; AS-001, AS-007, AS-008)
- [x] T009 [P] Re-run GitNexus impact for `createDocumentSnapshot`, then preserve connection roles through `DocumentEdge`, cloning and persisted conversion in `src/lib/documentSnapshot.ts` (FR-006, FR-010, FR-011, FR-014; AS-005–AS-007)
- [x] T010 [P] After T001 approval, add the project-local accessible shadcn/Base UI role selector primitive in `src/components/ui/select.tsx` without adding a second business-state owner (FR-001, FR-002; AS-001, AS-002)

**Checkpoint**: New v5 documents and migrated v0–v4 documents preserve every reference, express one role per target connection and round-trip without UI or runtime behavior.

---

## Phase 3: User Story 1 — 明确每张参考图的用途后再生成 (Priority: P1) 🎯 MVP

**Goal**: Show every incoming reference in actual order, require explicit role confirmation, and send role-isolated instructions without any Provider call for invalid input.

**Independent Test**: Add identity, pose/composition and garment references to one target; Run remains blocked with precise per-image reasons until all are confirmed, then a fake Provider receives images and role instructions in the same order with no cross-role borrowing.

### Tests for User Story 1

- [x] T011 [P] [US1] Add failing domain tests proving missing/true confirmation blocks, literal false confirms, required-role failures remain distinct and error details identify entries in `tests/prompt-run-admission.test.ts` (FR-003–FR-005; AS-001, AS-002)
- [x] T012 [P] [US1] Add failing ordered-input, duplicate-role, `styling_only`, `generic` precedence and every-model prompt-boundary tests in `tests/reference-inputs.test.ts` (FR-005–FR-009, FR-014; AS-003–AS-005, AS-009; SC-003)
- [x] T013 [P] [US1] Add failing execution-plan tests for connection roles, generated-upstream pending state, dedicated semantic handles and stable edge order in `tests/dag.test.ts` (FR-003–FR-006, FR-014; AS-001, AS-002, AS-005)
- [x] T014 [P] [US1] Add failing rendered and keyboard behavior tests for pending, confirmed, duplicate-role and unavailable reference rows in `tests/reference-role-summary.test.ts` (FR-001–FR-006; AS-001, AS-002)
- [x] T015 [P] [US1] Add failing route/Worker regressions for no-enqueue, no-Provider-call, structured issue details and direct/workflow parity in `tests/authorization.test.ts`, `tests/run-queue.test.ts`, and `tests/provider-contract.test.ts` (FR-003–FR-009; AS-001–AS-004, AS-009)

### Implementation for User Story 1

- [x] T016 [US1] Re-run GitNexus impact for `referenceInputsError` and `evaluatePromptRunAdmission`, then return one structured ordered issue list from `src/lib/referenceInputs.ts` and consume it in `src/lib/promptRunAdmission.ts`, treating absent confirmation as pending (FR-003–FR-005; AS-001, AS-002)
- [x] T017 [US1] Re-run GitNexus impact for `buildExecutionPlan`, then derive `ReferenceImageSource[]` from target-connection assignments and fixed semantic handles in `server/engine/dag.ts` (FR-005, FR-006, FR-014; AS-002, AS-005)
- [x] T018 [US1] Re-run GitNexus API impact for `POST /api/run-plan` and `POST /api/generate`, then emit the shared structured role-error contract from `server/routes/runPlan.ts` and `server/routes/generate.ts` before enqueue (FR-003–FR-006; AS-001, AS-002)
- [x] T019 [US1] Re-run GitNexus impact for `usePromptRunAdmission`, then project ordered connection roles and per-entry availability into the browser decision in `src/hooks/usePromptRunAdmission.ts` (FR-001, FR-004, FR-006; AS-001, AS-002)
- [x] T020 [US1] After T001, implement the ordered reference rows, role selection, pending/unavailable states and accessible names in `src/components/nodes/ReferenceRoleSummary.tsx` (FR-001–FR-006; AS-001, AS-002)
- [x] T021 [US1] After T020, integrate the compact summary near Run through `src/components/nodes/ModelControls.tsx`, integrate the fixed-model case in `src/components/nodes/MaskRedrawNode.tsx`, and expose the expanded view in `src/components/panels/InspectorPanel.tsx` (FR-001, FR-004, FR-006; AS-001, AS-002)
- [x] T022 [US1] Replace duplicated labels and the hand-rolled role select with the shared catalog and `src/components/ui/select.tsx` in `src/components/nodes/ImageInputNode.tsx` while preserving its source-default semantics (FR-001–FR-003; AS-001, AS-002)
- [x] T023 [US1] Re-run GitNexus impact for `referenceRolePrompt`, then render ordered responsibilities and forbidden influences from the shared catalog inside each model/mode wrapper in `server/lib/referenceRolePrompt.ts` (FR-007–FR-009; AS-003, AS-004, AS-009)
- [x] T024 [US1] Re-run GitNexus impact for `resolveReferenceInputs` and the Worker admission path, then keep role/image ordering on one `ReferenceImageInput[]`, exclude internal mask guides from user confirmation and recheck snapshots before Provider calls in `server/engine/runner.ts` and `server/engine/runQueue.ts` (FR-004–FR-009, FR-014; AS-001, AS-003–AS-005)
- [x] T025 [US1] Add post-implementation mocked desktop acceptance coverage for three-reference confirmation, keyboard role selection, blocked/ready states and compact layout in `e2e/reference-role-confirmation.spec.ts` (FR-001–FR-006; AS-001, AS-002; SC-001, SC-002)

**Checkpoint**: User Story 1 is a complete MVP: explicit role confirmation and role-isolated fake-Provider input work end to end, using the Foundation migration contract without requiring the later history-edit refinements.

---

## Phase 4: User Story 2 — 调整参考图后保持角色关系一致 (Priority: P2)

**Goal**: Let users edit target-specific roles and reorder/remove references while preserving document boundaries and immutable queued/completed snapshots.

**Independent Test**: Confirm a role set, enqueue a mocked run, then edit roles, reorder and remove connections; the existing run retains its original order while the next run and reopened project use the edited assignments.

### Tests for User Story 2

- [x] T026 [P] [US2] Add failing Store tests for target-specific role edits, reorder/remove stability, undo/redo and `tabId + projectId + documentEpoch` isolation in `tests/project-tabs.test.ts` and `tests/flow-history.test.ts` (FR-010, FR-011, FR-014; AS-005–AS-007)
- [x] T027 [P] [US2] Add failing queue tests proving enqueue-time role snapshots survive later project edits and Worker restarts in `tests/run-queue.test.ts` (FR-006, FR-010, FR-013; AS-006)
- [x] T028 [P] [US2] Add failing history contract and viewer regressions for index alignment, malformed legacy evidence and user-facing role labels in `tests/recent-results.test.ts` and `tests/image-viewer-reference-evidence.test.ts` (FR-010, FR-013; AS-006, AS-007; SC-007)
- [x] T029 [P] [US2] Add failing rendered and keyboard interaction tests for visible move-up, move-down and remove controls, boundary disabled states, focus restoration and undo/redo in `tests/reference-role-summary.test.ts` (FR-006, FR-010, FR-014; AS-005, AS-006)

### Implementation for User Story 2

- [x] T030 [US2] Re-run GitNexus impact for the active-document edge actions, then add scoped document transactions for target-connection role editing, move-up, move-down and removal while preserving edge-role identity, undo/redo and document-epoch isolation in `src/store/flowStore.ts` (FR-010, FR-011, FR-014; AS-005–AS-007)
- [x] T031 [US2] After T030, bind visible, accessible move-up, move-down and remove controls in `src/components/nodes/ReferenceRoleSummary.tsx` and `src/components/panels/InspectorPanel.tsx` to the scoped Store actions, restore focus after removal and show which snapshot an active run is using (FR-006, FR-010, FR-014; AS-005, AS-006)
- [x] T032 [US2] Re-run GitNexus impact for generation-record completion and history response mapping, then persist typed immutable evidence in `server/lib/generationRecords.ts`, validate it in `server/routes/history.ts`, and render user-facing labels/source/order in `src/components/ImageViewer.tsx` (FR-013; AS-006, AS-007)
- [x] T033 [US2] Add post-implementation desktop acceptance coverage for edit, keyboard reorder, remove, save/reopen and immutable mocked-run scenarios in `e2e/reference-role-confirmation.spec.ts` (FR-006, FR-010, FR-011, FR-013, FR-014; AS-005–AS-007; SC-004, SC-007)

**Checkpoint**: User Story 2 independently proves that editable project state and immutable run evidence cannot overwrite one another.

---

## Phase 5: User Story 3 — 安全打开旧项目并补齐角色 (Priority: P3)

**Goal**: Preserve every legacy image, migrate old role information conservatively, and require confirmation before the next run.

**Independent Test**: Open v0–v4 fixtures containing legacy, unknown and generated-upstream roles; all images remain, ambiguous entries are visibly pending, generation is blocked until confirmation, and confirmed `generic` remains subordinate to specific roles.

### Tests for User Story 3

- [x] T034 [P] [US3] Add failing migrated-project UI tests for preserved thumbnails, conservative labels and actionable pending states in `tests/reference-role-summary.test.ts` (FR-001, FR-003, FR-012; AS-008, AS-009)

### Implementation for User Story 3

- [x] T035 [US3] Present migrated and unknown roles as preserved pending entries, and keep confirmed `generic` subordinate to specific roles, in `src/components/nodes/ReferenceRoleSummary.tsx`, `src/components/nodes/ImageInputNode.tsx`, and `server/lib/referenceRolePrompt.ts` (FR-001, FR-003, FR-009, FR-012; AS-008, AS-009)
- [x] T036 [US3] Add post-implementation desktop acceptance coverage for legacy project open, image preservation, blocked-before-confirmation and confirmed-generic boundary scenarios in `e2e/reference-role-confirmation.spec.ts` (FR-003, FR-009, FR-011, FR-012; AS-008, AS-009; SC-005)

**Checkpoint**: All three stories are independently demonstrable and all old projects retain their reference images without silent confirmation.

---

## Phase 6: Polish and cross-cutting verification

**Purpose**: Complete test discovery, accessibility/geometry evidence, traceability and repository-wide gates.

- [x] T037 [P] Register new focused test files in the existing test runner without changing dependency versions in `package.json` and `scripts/test-with-postgres.mjs`
- [x] T038 Add final keyboard, focus, readable-error and supported-desktop geometry assertions for all three stories in `e2e/reference-role-confirmation.spec.ts` (FR-001, FR-004, FR-014; AS-001, AS-002, AS-005)
- [ ] T039 Conduct the SC-006 usability validation with at least 10 target designers who did not participate in this feature's design or implementation, then record anonymized eligibility, per-participant completion time, ready-state outcome and the aggregate 9-of-10 threshold result in `specs/001-garment-reference-roles/usability-evidence.md` (SC-006)
- [x] T040 Execute every focused and full validation step in `specs/001-garment-reference-roles/quickstart.md`, then update the corresponding task checkboxes in `specs/001-garment-reference-roles/tasks.md` only when evidence exists
- [x] T041 Run GitNexus `detect_changes`, selected-range whitespace checks and the current final verification required by `AGENTS.md §5`, then record any remaining gap for `$speckit-converge` in `specs/001-garment-reference-roles/tasks.md`
- [x] T042 Re-audit every active node prompt against the awesome-gpt-image-2 six-block guidance, re-audit every five-model API易 request shape and native parameter profile, materialize the 35-entry fail-closed matrix in `docs/ai/evaluation/node-prompt-parameter-matrix-v1.json`, and verify it without image generation or edit calls

Convergence note: GitNexus reported `critical` risk for the broad candidate diff, while the focused and full offline regression gates passed. The external evaluation release preflight remains fail-closed because `GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR` is not configured. API易's five active model IDs were manually matched exactly and bound to `reviewedExportSha256`; the node/model audit records 9 `unverified` combinations and 26 `unsupported` combinations, and no image-generation or image-edit endpoint was called. T039 remains open because the required usability evidence from at least 10 independent target designers has not been collected.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: Starts immediately; T001 is the policy-reference checkpoint for UI tasks, while T002 and T003 can proceed independently.
- **Phase 2 — Foundation**: Depends on Phase 1 fixtures; T004 proves both legacy migration and strict v5 validation before T008 implements them. T006 establishes shared types, after which T007–T010 follow their file dependencies. Foundation blocks all user stories.
- **Phase 3 — US1**: Depends on Phase 2 and is the MVP. Failing behavior/contract tests T011–T015 precede production implementation T016–T024; T025 is post-implementation desktop acceptance.
- **Phase 4 — US2**: Incrementally depends on US1's confirmed-role UI and the shared foundation. Failing tests T026–T029 precede production implementation T030–T032; T033 is post-implementation desktop acceptance.
- **Phase 5 — US3**: Incrementally depends on Foundation migration and US1's role-summary UI. T034 precedes T035; T036 is post-implementation desktop acceptance.
- **Phase 6 — Polish**: Depends on every story selected for delivery.

### User Story Dependencies

```text
Setup/policy checkpoint
      │
      ▼
Shared v0–v5 foundation
      │
      ▼
US1 P1 MVP
      │
      ├──────────────┐
      ▼              ▼
US2 editing     US3 legacy UX
      └──────┬───────┘
             ▼
    Cross-cutting verification
```

- **US1 (P1)**: No dependency on later stories; delivers explicit confirmation and safe prompt boundaries.
- **US2 (P2)**: Incrementally depends on US1 for confirmed-role editing surfaces; after that prerequisite, AS-005–AS-007 form an independently testable acceptance set.
- **US3 (P3)**: Foundation owns deterministic migration and US1 owns the shared summary surface; after those prerequisites, AS-008–AS-009 form an independently testable acceptance set.

### Within Each User Story

1. Add failing behavior/contract tests before production edits; post-implementation E2E tasks remain acceptance evidence.
2. Update shared domain and persisted models before route or UI integration.
3. Keep browser, route and Worker admission on the same decision contract.
4. Complete the story's independent test checkpoint before moving to the next priority.

## Parallel Opportunities

### User Story 1

After Foundation, these test tasks modify separate files and can run together:

```text
T011 prompt admission tests
T012 reference input and prompt-boundary tests
T013 DAG connection-role tests
T014 role-summary UI tests
T015 route and Worker contract tests
```

After T016/T017 establish the domain shape, route integration (T018), browser projection (T019) and prompt rendering (T023) are separate-file opportunities; T024 follows their shared contract.

### User Story 2

```text
T026 Store/document-boundary tests
T027 immutable queue-snapshot tests
T028 history/viewer contract tests
T029 reorder/remove interaction tests
```

T030 and T032 modify separate frontend/backend ownership areas after their tests; T031 waits for T030 and the US1 summary component.

### User Story 3

```text
T034 migrated-project UI tests
```

Foundation migration evidence and T034 must pass before T035, then T036 completes the story's desktop acceptance.

## Implementation Strategy

### MVP First

1. Complete T001–T010.
2. Complete T011–T025 for User Story 1.
3. Stop and run the US1 independent test without a real Provider.
4. Proceed to US2 and US3 only after the MVP evidence is complete.

### Incremental Delivery

1. **Foundation**: one canonical catalog plus deterministic v0–v4 migration and strict v5 target-connection roles.
2. **US1**: explicit confirmation, authoritative blocking and role-isolated Provider requests.
3. **US2**: editable document state plus immutable run/history evidence.
4. **US3**: conservative old-project migration and user-visible recovery.
5. **Polish**: repository-wide verification and convergence input.

## Notes

- `[P]` indicates separate-file work only after stated prerequisites; shared-type changes are deliberately serialized.
- Authority checkpoints are defined only by `AGENTS.md §§4–6`.
- Task completion is evidence-based: mark a checkbox only after its file change and verification output exist.
- If implementation discovers a requirement gap, return it to `spec.md` or `plan.md` rather than resolving it silently in code.
