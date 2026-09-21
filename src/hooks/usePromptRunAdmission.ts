import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  selectActiveEdges,
  selectActiveNodes,
  useFlowStore,
} from "@/store/flowStore";
import type { WorkflowNodeData } from "@/types/workflow";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionInputFromNode,
  promptRunInputTextsFromGraph,
  promptRunReferenceSnapshotsFromGraph,
  type PromptRunGraphEdge,
  type PromptRunGraphNode,
} from "@/lib/promptRunAdmission";

export interface PromptRunBrowserReference {
  order: number;
  edgeId?: string;
  sourceNodeId: string;
  sourceLabel: string;
  imageUrl?: string;
  available: boolean;
  unavailableReason?: string;
}

function sourceImageRefs(node: PromptRunGraphNode | undefined): Array<string | undefined> {
  if (!node) return [undefined];
  // v8：可作参考来源的是输入层 image 节点（上传/历史图，outputImages）与结果节点
  // （result-image 的 images，产物经 result-node-created 落地）。
  if (node.data.kind === "image") {
    return node.data.outputImages.length > 0 ? node.data.outputImages : [undefined];
  }
  if (node.data.kind === "result-image") {
    return node.data.images.length > 0 ? node.data.images : [undefined];
  }
  return [undefined];
}

export function promptRunBrowserReferencesFromGraph(
  nodes: readonly PromptRunGraphNode[],
  edges: readonly PromptRunGraphEdge[],
  targetNodeId: string,
): PromptRunBrowserReference[] {
  const references: PromptRunBrowserReference[] = [];
  for (const edge of edges) {
    if (edge.target !== targetNodeId) continue;
    const source = nodes.find((node) => node.id === edge.source);
    const edgeId = typeof (edge as { id?: unknown }).id === "string"
      ? (edge as unknown as { id: string }).id
      : undefined;
    const imageRefs = sourceImageRefs(source);
    for (const imageUrl of imageRefs) {
      const available = typeof imageUrl === "string" && imageUrl.trim().length > 0;
      references.push({
        order: references.length,
        ...(edgeId ? { edgeId } : {}),
        sourceNodeId: edge.source,
        sourceLabel: source?.data.label ?? edge.source,
        ...(imageUrl ? { imageUrl } : {}),
        available,
        ...(available ? {} : {
          unavailableReason: source
            ? `来源"${source.data.label}"尚未产出可读取图片`
            : `来源节点 ${edge.source} 不存在或不可读取`,
        }),
      });
    }
  }
  return references;
}

/** Browser mirror of the server admission gate; the server remains authoritative. */
export function usePromptRunAdmission(nodeId: string, data: WorkflowNodeData) {
  const nodes = useFlowStore(useShallow(selectActiveNodes));
  const edges = useFlowStore(useShallow(selectActiveEdges));
  return useMemo(() => {
    const references = promptRunReferenceSnapshotsFromGraph(nodes, edges, nodeId);
    const inputTexts = promptRunInputTextsFromGraph(nodes, edges, nodeId);
    return {
      ...evaluatePromptRunAdmission(promptRunAdmissionInputFromNode(data, references, inputTexts)),
      referenceRows: promptRunBrowserReferencesFromGraph(nodes, edges, nodeId),
    };
  }, [data, edges, nodeId, nodes]);
}
