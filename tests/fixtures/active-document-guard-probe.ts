import type { FlowState } from "../../src/store/flowStore";

// Intentional violations used only to prove the architecture guard is not vacuous.
export const destructuredSelectorProbe = ({
  nodes,
  dirty: renamedDirty,
}: FlowState): number => nodes.length + Number(renamedDirty);
