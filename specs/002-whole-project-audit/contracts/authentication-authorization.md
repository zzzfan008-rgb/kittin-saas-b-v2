# Contract: Authentication and Authorization

## Scope

Defines the security boundary for authentication, session changes, account mutations and resource ownership. It covers FR-004, FR-005 and FR-010.

## Invariants

- Authentication middleware resolves the current user before protected handlers execute.
- Every project, file, asset, run, result, template and usage mutation is authorized against the current user or an explicitly documented administrator capability.
- Ownership checks are performed in the same transaction as the mutation when concurrent ownership changes are possible.
- A denied request has no observable mutation and returns a stable error shape without secrets, SQL, filesystem paths or upstream credentials.
- Session replacement, password changes and account deletion reconcile active owned resources under the documented lock order; partial ownership transfer is not reported as success.

## Required verification

- Direct and workflow routes reject another user's IDs.
- Admin-only operations reject ordinary users and do not broaden object access implicitly.
- Deleted or purged resources cannot be resurrected through stale IDs or history endpoints.
- Response shape and middleware coverage are checked with GitNexus `api_impact` and `shape_check` for every write route.

## Compatibility and rollback

Existing client error codes remain readable during migration. A stricter check may fail closed, but must not silently reinterpret another user's resource as missing and then write a replacement.
