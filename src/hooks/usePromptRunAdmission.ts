import { useMemo } from "react";
import {
  selectActiveEdges,
  selectActiveNodes,
  useFlowStore,
} from "@/store/flowStore";
import type { WorkflowNodeData } from "@/types/workflow";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionInputFromNode,
  promptRunReferenceSnapshotsFromGraph,
  type PromptRunGraphEdge,
  type PromptRunGraphNode,
} from "@/lib/promptRunAdmission";
import {
  isReferenceRole,
  resolveReferenceEdgeData,
  type ReferenceRole,
} from "@/types/workflow";

export interface PromptRunBrowserReference {
  order: number;
  edgeId?: string;
  sourceNodeId: string;
  sourceLabel: string;
  role: ReferenceRole;
  roleNeedsConfirmation: boolean;
  imageUrl?: string;
  available: boolean;
  unavailableReason?: string;
}

function sourceImageRefs(node: PromptRunGraphNode | undefined): Array<string | undefined> {
  if (!node) return [undefined];
  switch (node.data.kind) {
    case "image-input":
      return [node.data.imageUrl];
    case "result":
      return node.data.images.length > 0 ? node.data.images : [undefined];
    case "sketch-to-render":
    case "ai-modify":
    case "fabric-recolor":
    case "upscale":
    case "print-extract":
    case "print-mutate":
    case "mask-redraw":
      return node.data.outputImages.length > 0 ? node.data.outputImages : [undefined];
  }
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
    const target = nodes.find((node) => node.id === targetNodeId);
    const role = resolveReferenceEdgeData(edge.data, source?.data, target?.data.kind, edge.targetHandle);
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
        // TODO(R-02/R-03): 移除角色后删除此守卫
        role: isReferenceRole(role.role) ? role.role : "generic",
        roleNeedsConfirmation: role.roleNeedsConfirmation !== false,
        ...(imageUrl ? { imageUrl } : {}),
        available,
        ...(available ? {} : {
          unavailableReason: source
            ? `来源“${source.data.label}”尚未产出可读取图片`
            : `来源节点 ${edge.source} 不存在或不可读取`,
        }),
      });
    }
  }
  return references;
}

/** Browser mirror of the server admission gate; the server remains authoritative. */
export function usePromptRunAdmission(nodeId: string, data: WorkflowNodeData) {
  const nodes = useFlowStore(selectActiveNodes);
  const edges = useFlowStore(selectActiveEdges);
  return useMemo(() => {
    const references = promptRunReferenceSnapshotsFromGraph(nodes, edges, nodeId);
    return {
      ...evaluatePromptRunAdmission(promptRunAdmissionInputFromNode(data, references)),
      referenceRows: promptRunBrowserReferencesFromGraph(nodes, edges, nodeId),
    };
  }, [data, edges, nodeId, nodes]);
}
