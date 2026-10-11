import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  selectActiveEdges,
  selectActiveNodes,
  useFlowStore,
} from "@/store/flowStore";
import {
  selectAllReferenceOrdinals,
  type ReferenceOrdinalAssignment,
} from "@/types/workflow";

/**
 * R-39 参考图序号的画布级派生（连线后常显，不依赖选中态）：
 * 图片节点连到生成节点后，右上角常显「图N」徽标——N = 该源在目标生成节点
 * 入边序列中的序号（与 dag/runner 拼装参考图、模型看到的「参考图N」一致）。
 * 同一源连多个生成节点时携带多个 assignment。永不持久化。
 */
const ReferenceOrdinalsContext = createContext<ReadonlyMap<string, ReferenceOrdinalAssignment[]>>(new Map());

export function ReferenceOrdinalsProvider({ children }: { children: ReactNode }) {
  const nodes = useFlowStore(useShallow(selectActiveNodes));
  const edges = useFlowStore(useShallow(selectActiveEdges));
  const value = useMemo(() => selectAllReferenceOrdinals(nodes, edges), [nodes, edges]);
  return (
    <ReferenceOrdinalsContext.Provider value={value}>
      {children}
    </ReferenceOrdinalsContext.Provider>
  );
}

/**
 * 源图节点订阅自身的参考图序号（连线后常显）；未连到任何生成节点时返回 null。
 * 同一源连多个目标时返回多个 assignment。
 */
export function useReferenceOrdinals(sourceNodeId: string): ReferenceOrdinalAssignment[] | null {
  const all = useContext(ReferenceOrdinalsContext);
  const list = all.get(sourceNodeId);
  return list && list.length > 0 ? list : null;
}
