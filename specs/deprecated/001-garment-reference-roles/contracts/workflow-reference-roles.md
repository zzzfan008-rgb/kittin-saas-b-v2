# Contract: Workflow Reference Roles

## Scope

Defines the persisted workflow fields and migration behavior needed by FR-001–FR-006 and FR-010–FR-014.

## Workflow version

Newly saved workflows use schema version 5. Versions 0–4 are accepted only through deterministic migration; unknown future versions remain rejected.

## Edge contract

Every image-producing edge entering a Provider-backed target carries the image's target-specific role assignment:

```json
{
  "id": "edge-identity-to-look",
  "source": "identity-image",
  "target": "look-generator",
  "sourceHandle": null,
  "targetHandle": null,
  "referenceRole": "identity",
  "roleNeedsConfirmation": false
}
```

### Required behavior

- `referenceRole` is one of the ten supported identifiers.
- `roleNeedsConfirmation` is a boolean. Only `false` proves explicit confirmation.
- The edge role is authoritative for this target and does not mutate the source node's default role.
- Edge array order determines the reference order for a target after filtering to its incoming image-producing edges.
- Removing or reordering an edge cannot transfer its role to another edge.

## New-connection defaults

| Source/target condition | Initial role | Confirmation |
|-------------------------|--------------|--------------|
| Confirmed image-input node | Copy node role | Confirmed |
| Pending or legacy image-input node | Conservatively normalized role | Pending |
| Generated/output node | `generic` | Pending |
| Dedicated, visibly labeled semantic input | Fixed handle role | Confirmed only by the user's deliberate connection action, as defined by FR-003 |

## Migration from versions 0–4

1. Preserve all valid nodes, images and edges.
2. Normalize the source image-input role using the current legacy mapping.
3. Populate each incoming Provider-edge assignment using the table above.
4. Keep ambiguous and non-image-node sources pending.
5. Save the migrated document as version 5 only after normal validation succeeds.

## Acceptance mapping

- AS-001/AS-002: every incoming reference has visible confirmation state.
- AS-005: order changes preserve edge-role identity.
- AS-007: assignments round-trip through project persistence.
- AS-008/AS-009: legacy images survive and ambiguous roles remain pending.
