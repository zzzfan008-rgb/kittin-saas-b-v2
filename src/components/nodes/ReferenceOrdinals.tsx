import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  selectActiveEdges,
  selectActiveNodes,
  selectActiveSelectedNodeIds,
  useFlowStore,
} from "@/store/flowStore";
import { selectReferenceOrdinals } from "@/types/workflow";

/**
 * R-39 参考图序号的画布级派生（graph-invariants.md §2b.3）：
 * 以「当前选中的 image/video 目标」为输入现算 Map<sourceNodeId, ordinal>。
 * 切换选中目标时按新目标入边数组重新派生——不缓存跨目标的映射（防串味）。
 * 未选中目标时 Map 为空（画布无徽标）。序号永不持久化。
 */
const ReferenceOrdinalsContext = createContext<ReadonlyMap<string, number>>(new Map());

export function ReferenceOrdinalsProvider({ children }: { children: ReactNode }) {
  const nodes = useFlowStore(useShallow(selectActiveNodes));
  const edges = useFlowStore(useShallow(selectActiveEdges));
  const selectedNodeIds = useFlowStore(useShallow(selectActiveSelectedNodeIds));
  const ordinals = useMemo(() => {
    // 渲染闸（§2b.2）：仅当选中的是 image/video 目标时为其入边源节点派生序号；
    // v8（plan.md §2.1）：参考图 / 首帧入边落在生成层节点上，因此生成层同为目标；
    // 多选时取最后一个（与主选择口径一致）。
    const selectedTarget = [...selectedNodeIds].reverse().find((selectedId) => {
      const target = nodes.find((node) => node.id === selectedId);
      return target?.data.kind === "image"
        || target?.data.kind === "video"
        || target?.data.kind === "image-generator"
        || target?.data.kind === "video-generator";
    }) ?? null;
    return selectReferenceOrdinals(nodes, edges, selectedTarget);
  }, [nodes, edges, selectedNodeIds]);
  return (
    <ReferenceOrdinalsContext.Provider value={ordinals}>
      {children}
    </ReferenceOrdinalsContext.Provider>
  );
}

/** 源图节点订阅自身序号；不在任何选中目标的入边里时返回 null（不渲染徽标）。 */
export function useReferenceOrdinal(sourceNodeId: string): number | null {
  const ordinals = useContext(ReferenceOrdinalsContext);
  return ordinals.get(sourceNodeId) ?? null;
}
