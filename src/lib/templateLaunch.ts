import type { Edge } from "@xyflow/react";
import { nanoid } from "nanoid";
import type { WorkflowTemplate, WorkflowNodeData } from "@/types/workflow";
import { useFlowStore, type FlowNode } from "@/store/flowStore";
import { requestCanvasLanding } from "@/lib/canvasLanding";

export type TemplateLaunchMode = "default" | "upload" | "text";

function isMissingParameter(data: WorkflowNodeData): boolean {
  if (data.kind === "image-input") return !data.imageUrl;
  if (
    data.kind === "sketch-to-render" ||
    data.kind === "ai-modify" ||
    data.kind === "print-extract" ||
    data.kind === "print-mutate" ||
    data.kind === "mask-redraw"
  ) return !data.prompt.trim();
  if (data.kind === "fabric-recolor") {
    return data.colors.length === 0 && !data.prompt.trim() && !data.fabricImageUrl;
  }
  return false;
}

export function templateLandingNodeId(
  nodes: readonly FlowNode[],
  mode: TemplateLaunchMode,
): string | undefined {
  if (mode === "upload") {
    return nodes.find((node) => node.data.kind === "image-input" && !node.data.imageUrl)?.id;
  }
  if (mode === "text") {
    return nodes.find((node) => node.data.kind === "sketch-to-render")?.id;
  }
  return nodes.find((node) => isMissingParameter(node.data))?.id ??
    nodes.find((node) => node.data.kind !== "result")?.id;
}

function cloneNodes(nodes: WorkflowTemplate["flow"]["nodes"]): FlowNode[] {
  return structuredClone(nodes) as FlowNode[];
}

function cloneEdges(edges: WorkflowTemplate["flow"]["edges"]): Edge[] {
  return structuredClone(edges) as Edge[];
}

/** 从模板始终新建独立项目页签，并登记一次性 fitView/首输入焦点。 */
export function launchTemplateInNewTab(
  template: WorkflowTemplate,
  mode: TemplateLaunchMode = "default",
): { tabId: string; projectId: string; landingNodeId?: string } {
  const projectId = nanoid(10);
  const nodes = cloneNodes(template.flow.nodes);
  const edges = cloneEdges(template.flow.edges);
  const landingNodeId = templateLandingNodeId(nodes, mode);
  useFlowStore.getState().openFlowTab({
    projectId,
    projectName: `${template.name} - 副本`,
    nodes,
    edges,
    markDirty: true,
  });
  const tabId = useFlowStore.getState().activeTabId;
  if (landingNodeId) useFlowStore.getState().setSelectedNodeIds([landingNodeId]);
  requestCanvasLanding({
    tabId,
    nodeId: landingNodeId,
    fitView: true,
    activateFilePicker: mode === "upload",
    selectText: mode === "text",
  });
  return { tabId, projectId, landingNodeId };
}

