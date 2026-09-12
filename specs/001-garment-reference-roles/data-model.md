# Data Model: 服装多参考图角色确认与提示词约束

## 1. ReferenceRoleDefinition (shared, not persisted)

Represents one supported role's canonical semantics.

| Field | Type | Rules |
|-------|------|-------|
| `id` | `ReferenceRole` | One of the ten stable role identifiers. |
| `label` | string | User-facing Chinese label. |
| `responsibility` | string | What this role may influence. |
| `forbiddenInfluence` | string[] | Boundaries that must not be borrowed from this image. |
| `specificity` | `specific` or `generic` | Specific roles take precedence over `generic`. |

The supported identifiers remain: `identity`, `pose_composition`, `garment_top`, `garment_bottom`, `garment_full`, `fabric`, `accessory`, `styling_only`, `background`, `generic`.

## 2. PersistedReferenceAssignment

Represents how one source image is used by one target generation node. It is persisted on the workflow edge.

| Field | Type | Rules |
|-------|------|-------|
| `edgeId` | string | Existing unique workflow-edge identifier. |
| `sourceNodeId` | string | Must identify an existing source node. |
| `targetNodeId` | string | Must identify an existing generation node. |
| `referenceRole` | `ReferenceRole` | Exactly one supported role. |
| `roleNeedsConfirmation` | boolean | Only literal `false` is confirmed. |
| `sourceHandle` | string or null | Existing connection metadata. |
| `targetHandle` | string or null | May define a fixed semantic role for dedicated inputs. |

### Validation rules

- Every image-producing edge into a Provider-backed target has one assignment.
- Multiple assignments may use the same role.
- One assignment cannot carry more than one role.
- A dedicated semantic handle may set a fixed confirmed role only when the user deliberately connects to its visibly labeled input, as defined by FR-003; all other inferred or migrated assignments remain pending until a user confirms them.
- Removing an edge removes its assignment. Reordering edges changes only their derived order, not their role.

## 3. ImageInputRoleDefault

Represents the reusable default on an image-input node and the migration source for existing projects.

| Field | Type | Rules |
|-------|------|-------|
| `imageRole` | current or legacy image role | Current roles are selectable; legacy values are read-only migration inputs. |
| `roleNeedsConfirmation` | boolean | Missing or true means pending. |

This entity does not override an existing target-connection assignment.

## 4. ReferenceImageSource

The immutable lightweight reference captured in an execution plan and queued run.

| Field | Type | Rules |
|-------|------|-------|
| `imageRef` | string | Valid accessible image reference. |
| `role` | `ReferenceRole` | Copied from the confirmed connection assignment. |
| `order` | non-negative integer | Contiguous and starts at zero for each target step. |
| `sourceNodeId` | string | Identifies the source shown to the user. |
| `roleNeedsConfirmation` | boolean | Must be false for user references before enqueue. |

## 5. ReferenceImageInput

The resolved Provider-facing reference.

| Field | Type | Rules |
|-------|------|-------|
| `dataUrl` | normalized image data | Resolved through existing image validation and access controls. |
| `role` | `ReferenceRole` | Must match the queued source role. |
| `order` | non-negative integer | Must match array position. |
| `assetSha256` | lowercase SHA-256 | Calculated from the resolved image bytes. |
| `sourceNodeId` | string, optional | Preserved when available. |
| `roleNeedsConfirmation` | boolean | Must be false for every user reference. |

System-generated processing guides are not user references. They retain explicit provenance and are appended only after user-reference admission succeeds.

## 6. ReferenceImageEvidence

The durable, non-image-body evidence returned in history.

| Field | Type | Rules |
|-------|------|-------|
| `role` | `ReferenceRole` | Role used by the run. |
| `order` | non-negative integer | Original Provider order. |
| `assetSha256` | lowercase SHA-256 | Content identity of the resolved input. |
| `sourceNodeId` | string, optional | Original source where available. |
| `roleNeedsConfirmation` | boolean | Successful user-reference evidence must be false. |

`referenceImages[]` remains the ordered visual lookup list; `referenceInputs[]` is the matching evidence list. Equal indexes describe the same input.

## 7. GenerationRoleSnapshot

Represents the role state frozen for a run.

| Field | Type | Rules |
|-------|------|-------|
| `runId` | string | Stable run identifier. |
| `targetNodeId` | string | Target generation node. |
| `references` | `ReferenceImageSource[]` then `ReferenceImageEvidence[]` | Ordered, immutable for this run. |
| `capturedAt` | timestamp | Existing run enqueue/start timestamps provide lifecycle evidence. |

Later canvas edits create a different snapshot for a future run; they do not mutate this entity.

## Relationships

```text
Image-producing node
        │ 1
        ├──< PersistedReferenceAssignment >──1 Target generation node
        │                                        │
        │                                        └──< GenerationRoleSnapshot
        │                                                   │
        └───────────────────────────────────────────────────└──< ReferenceImageEvidence
```

## State transitions

```text
new generic connection ──> pending assignment ──user selects role──> confirmed assignment
user connects to dedicated visibly labeled input ────────────────> confirmed assignment
legacy image-node edge ──migration──> mapped assignment ───────────> pending or confirmed
confirmed assignment ──user changes role──> confirmed assignment for future runs
confirmed assignment ──enqueue──> immutable run snapshot
assignment ──edge removed──> deleted from future workflow snapshots
missing/unreadable image ──> blocked availability state (role remains unchanged)
```

## Invariants

1. Role order and image order are derived from the same ordered assignment collection.
2. Missing confirmation proof is pending, never implicitly confirmed.
3. `styling_only` cannot provide identity or face semantics.
4. `generic` cannot override any specific role in the same target task.
5. Project persistence contains assignment state; UI expansion state and runtime progress do not.
6. Queued and completed run evidence never changes when the project is edited later.
