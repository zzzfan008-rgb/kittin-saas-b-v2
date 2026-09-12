# Contract: DAG, Queue and Provider Runtime

## Scope

Defines node admission, execution plans, queue leases, retry classification, Provider requests and result persistence. It covers FR-007, FR-008 and FR-010.

## State model

Allowed durable states are `queued`, `running`, `retry_wait`, `cancel_requested`, `success`, `error`, `outcome_unknown` and `cancelled`. Transitions must be explicit and idempotent.

## Invariants

- The execution plan is built from one immutable input snapshot and preserves ordered references.
- A lease has an owner, expiry and guarded completion; expired work is recoverable without allowing two workers to complete the same run.
- Only explicitly retryable failures, such as bounded rate-limit or service-unavailable responses before an ambiguous provider outcome, may be retried.
- Timeout, connection interruption, malformed tail or HTTP success without a usable image becomes `outcome_unknown` when the upstream result is ambiguous; it is never automatically replayed.
- Product model IDs, upstream contract IDs and retired IDs are distinct. Missing or stale contract evidence blocks new runs.
- Provider output URLs are downloaded and persisted before business post-processing; user-supplied remote references are rejected before enqueue.

## Required verification

Use fake Providers to assert request shape, no-call admission failures, retry bounds, unknown-outcome behavior, lease recovery, idempotent completion and original-output retention.

## Compatibility and rollback

Existing durable rows are mapped conservatively. A new queue claimant can be disabled while known-safe queued rows remain readable; `outcome_unknown` rows require explicit operator action and are not converted to retryable work automatically.
