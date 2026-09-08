# T042 Confirmed UI Changes And Residual Gaps

Captured: 2026-09-06

This record does not add product scope. It separates automated UI evidence from the remaining human and release evidence.

## Confirmed UI Behavior

- Reference-image roles are visible, ordered and explicitly confirmable; unavailable or ambiguous inputs remain blocked.
- Prompt-preset application is bound to the exact serialized prompt, references, model parameters and availability context; changing that context invalidates pending confirmation.
- Unverified prompt variants remain disabled with an explicit runtime reason.
- Project-center failures do not hide usable project actions.
- Result cards, project grids, Dock geometry, minimap, zoom controls and modal layers remain inside the 1024, 1280 and 1440 desktop viewports.
- Modal and menu interactions trap or restore keyboard focus, and delayed responses from closed template dialogs do not mutate the current dialog.

Evidence: `t041-desktop-e2e.md`, `e2e/workbench.spec.ts`, `e2e/reference-role-confirmation.spec.ts`, focused prompt/reference tests and the 2026-09-06 verification ledger.

## Residual Gaps

- `specs/001-garment-reference-roles/tasks.md#T039` remains blocked pending at least ten eligible independent garment designers and a 9-of-10 success threshold within 90 seconds. Automated E2E is not a substitute for this evidence.
- All exact prompt variants remain `unverified`; the UI correctly blocks them, but real evaluation, independent review, billing reconciliation and release promotion are still absent.
- The external evaluation release directory is not configured, so release preflight remains fail-closed.
- The broad uncommitted candidate still requires the complete Codex reviewer gate and a clean committed candidate gate.

No additional UI redesign is authorized by this audit record. Any future usability change must be handled as a separate confirmed product change with its own migration and acceptance evidence.
