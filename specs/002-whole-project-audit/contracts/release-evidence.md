# Contract: Release Evidence and Fail-Closed Promotion

## Scope

Defines the evidence closure for code identity, API易 catalog, model contracts, evaluations, runtime projection and release gates. It covers FR-001, FR-002, FR-011–FR-016.

## Invariants

- Every release candidate has a stable code identity, baseline, finding ledger and verification records.
- The current five API易 IDs are matched by exact string equality only: `gpt-image-2`, `gpt-image-2-vip`, `gemini-3.1-flash-image`, `flux-2-pro`, `seedream-5-0-260128`.
- The retained external raw `/v1/models` export has an exact byte SHA and a canonical ID-set SHA; both are recorded in repository evidence without copying the raw export into the release package.
- Catalog presence does not imply generation, editing, quality, billing or release readiness. All five models remain unverified until their separate evaluation and promotion evidence passes.
- Any missing ID, hash, code identity, authorization, review or reproducible verification keeps promotion fail-closed.
- API易 knowledge checks are required only when API易-related paths or evidence change; ordinary non-API易 audit work does not repeat that check.

## Required verification

Run offline API易 checks, model-matrix and evaluation-manifest checks, focused tests, full checks/builds, GitNexus change detection and the applicable Codex gate. Record exact command, timestamp, status and output summary.

## Rollback

Deployment may target a previously saved version whose evidence hashes still match. Never repair a missing evidence hash by substituting a new export or alias without a new manual review.
