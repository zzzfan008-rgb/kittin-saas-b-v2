# T040 Shared Contracts And Error Semantics

Captured: 2026-09-06

The change is local and offline. Provider calls and image generation/editing endpoint calls: **0**.

## Findings

- `ImageOperationMode` was defined independently in `src/types/workflow.ts` and `src/types/modelParameterProfiles.ts`.
- `src/types/imageModels.ts` imported that type from `workflow.ts` while `workflow.ts` imported model types from `imageModels.ts`, producing the repository's only file import cycle.
- Client API consumers repeated slightly different `{ error?: string }` parsing and fallback behavior.

## Remediation

- `src/types/imageOperations.ts` is now the single owner of `IMAGE_OPERATION_MODE_VALUES` and `ImageOperationMode`.
- `workflow.ts` re-exports the same runtime value and type, preserving existing imports and runtime identity.
- `imageModels.ts` and `modelParameterProfiles.ts` consume the shared contract directly, removing the cycle without changing workflow or persisted document schemas.
- `src/lib/apiErrors.ts` provides the pure `apiErrorMessage` helper. It prefers a trimmed, non-empty server error and otherwise uses the caller's scenario-specific fallback or `HTTP <status>`.
- Login, password change, formal save, run submission, initial-draft, normalized upload and mask-upload paths now share the same error-message semantics. The helper owns no application state.

## Verification

- Pre-change GitNexus impact: `workflow.ts` and `imageModels.ts` were `CRITICAL` fan-out files, so their public export paths were preserved; `responseErrorMessage` and `uploadMaskDraft` were `LOW` risk.
- Node `24.20.0` `npm run lint`: pass.
- Node `24.20.0` facade, initial-draft client, image-input, mask-upload and active-document-boundary tests: pass.
- GitNexus re-index: 33,462 nodes, 75,471 edges, 394 clusters and 300 flows.
- GitNexus import-cycle check: clean, 0 cycles (previously 1).
- `git diff --check`: pass.
- Full-worktree GitNexus result remains fail-closed: 99 changed files, 571 changed symbols, 159 affected symbols, aggregate risk `critical`.
