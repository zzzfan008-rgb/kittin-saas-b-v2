# Contract: Document and Async Boundary

## Scope

Defines isolation for `ProjectTab`, `DocumentSnapshot`, history, save, upload, run submission and asynchronous result write-back. It covers FR-006, FR-007 and FR-010.

## Identity token

Every async operation carries the immutable tuple:

```ts
type DocumentTarget = {
  tabId: string;
  projectId: string;
  documentEpoch: number;
};
```

## Invariants

- A response may update browser state only when all three tuple fields still match the target tab.
- A queued run stores a canonical snapshot at enqueue time; later edits, tab switches or project replacement cannot mutate that snapshot.
- Save, restore, undo and redo operate on one tab's document history and never copy history across project identities.
- Reopen and migration normalize legacy documents before they become the current editable snapshot.
- Results are linked to the owning project and run snapshot; a missing or unauthorized source is returned as unavailable rather than fabricated.

## Required verification

Tests cover stale save, upload, run and result responses; tab switching; project replacement; epoch increments; queue restart; history alignment; and legacy snapshot round trips.

## Compatibility and rollback

Legacy persisted fields remain readable. The new tuple is additive at the adapter boundary; if the new write path is disabled, old readers remain available and no queued snapshot is rewritten in place.
