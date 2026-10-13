# canvas-arch

Analyze Garment Canvas frontend canvas layer.

Read first:

- `src/components/CanvasFlow.tsx` — React Flow canvas mechanics
- `src/store/flowStore.ts` — store + `ProjectTab[]` / `DocumentSnapshot` boundary
- `src/components/workbench/WorkbenchShell.tsx` — workbench shell
- `@xyflow/react 12` docs (not latest) for canvas behavior claims

Rules:

- Standard controls must come from `src/components/ui/` (shadcn `base-nova`).
- Panel open/closed state, selection, viewer/compare state, and React Flow
  measurements stay out of document history and session persistence.
- Assert desktop geometry at 1024 / 1280 / 1440, not class names.
