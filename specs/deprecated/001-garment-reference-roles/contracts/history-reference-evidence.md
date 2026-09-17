# Contract: History Reference Evidence

## Scope

Defines the user-visible evidence for FR-011 and FR-013.

## `GET /api/history`

Each returned record with reference images includes two index-aligned arrays:

```json
{
  "referenceImages": ["/api/files/reference-a.png"],
  "referenceInputs": [
    {
      "role": "garment_top",
      "order": 0,
      "assetSha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "sourceNodeId": "garment-image",
      "roleNeedsConfirmation": false
    }
  ]
}
```

### Response invariants

- `referenceInputs` is returned as typed, validated evidence rather than an unchecked array.
- `referenceInputs[index].order` equals `index`.
- The item at the same index in `referenceImages` is the image represented by that evidence.
- Completed runs preserve the exact role snapshot used for their Provider request.
- Malformed historical evidence is shown as unavailable/legacy evidence and never rewritten as confirmed.

## Result viewer behavior

- Display user-facing role labels, order and pending/legacy state alongside each reference image.
- Show source information when available.
- Do not expose inline image bodies, secrets or internal Provider credentials.
- Later project edits do not change previously returned run evidence.

## Acceptance mapping

- AS-006: an already started run continues to display its original snapshot.
- AS-007: saved projects and history agree about the role state relevant to their own lifecycle.
- SC-007: a reviewer can reconstruct the exact ordered role set for every accepted run.
