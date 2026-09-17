# Contract: Reference Role Run Admission

## Scope

Defines shared role validation for workflow runs, direct runs and delayed Worker execution. Covers FR-003–FR-010 and FR-013–FR-014.

## Canonical decision

A user-reference set is admissible only when:

1. every entry has one supported role;
2. every entry carries explicit `roleNeedsConfirmation: false`;
3. entries have contiguous zero-based order matching image order;
4. every referenced image is present, readable and accessible to the submitting user;
5. model/node/mode reference limits and required-role rules are satisfied.

## Failure response

Both `POST /api/run-plan` and `POST /api/generate` return HTTP 400 for role-confirmation failures using the same response shape:

```json
{
  "error": "参考图角色尚未全部确认",
  "code": "reference-role-unconfirmed",
  "references": [
    {
      "order": 1,
      "sourceNodeId": "image-2",
      "reason": "roleNeedsConfirmation is not false"
    }
  ]
}
```

Supported role-related codes:

| Code | Meaning |
|------|---------|
| `reference-role-unconfirmed` | At least one user reference lacks explicit confirmation. |
| `reference-role-invalid` | A role identifier or order is invalid. |
| `reference-role-missing` | The selected prompt contract requires a role not present in the task. |
| `reference-image-unavailable` | A referenced image cannot be read or authorized, or is a remote HTTP(S) input that must first be imported. |

No failed decision may enqueue a run or invoke a Provider.

For `reference-image-unavailable`, `targetNodeId` is optional for single-target
or direct requests and is included by workflow failures. Together with
`sourceNodeId` and the target-relative `order`, it keeps failures uniquely
attributable when the same source image feeds more than one Provider node.
HTTP(S) user-reference inputs use the same structured code with reason
`remote reference must be uploaded or imported before generation` and the
actionable message `远程参考图不能直接用于生成，请先上传或导入后再试`. They are rejected
before a run or job is created. Provider result URLs are not user references;
the Worker still downloads and persists those temporary outputs immediately.

## Workflow run input

`POST /api/run-plan` continues to receive the saved workflow shape. The server reconstructs assignments from the authoritative saved project, compares the submitted and saved plan, and persists the ordered `ReferenceImageSource[]` in the run snapshot.

## Direct run input

`POST /api/generate` requires structured `request.references` when reference images are present. Each item contains the image, role, order, content identity and explicit confirmation proof. A legacy `referenceImages` array may only accompany it when both arrays describe the same images in the same order; it never substitutes for role evidence.

## Worker invariant

Immediately before every Provider call, the Worker re-evaluates the persisted snapshot with the shared admission function. It does not consult current canvas state. A failed recheck records an error without a Provider request.
Legacy or manually queued HTTP(S) input references, fabric inputs and masks are rejected before any input download or Provider resolution. This does not change the separate Provider-output path, which still downloads and persists temporary result URLs.

## Prompt boundary output

The Provider request uses the same ordered `ReferenceImageInput[]` to create both the image array and role instruction. The instruction identifies every image by order, role label, allowed responsibility and forbidden cross-role influence.

## Acceptance mapping

- AS-001: unconfirmed entries return precise 400 details and make no Provider call.
- AS-003/AS-004/AS-009: Provider prompt captures explicit boundaries.
- AS-005: ordered input and role arrays cannot diverge.
- AS-006: Worker reads the immutable enqueue snapshot.
