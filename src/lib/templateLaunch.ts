import type { Edge } from "@xyflow/react";
import { nanoid } from "nanoid";
import { flushSync } from "react-dom";
import type { WorkflowTemplate, WorkflowNodeData } from "@/types/workflow";
import { isGeneratorNodeKind } from "@/types/workflow";
import {
  commitDocumentMutation,
  isPristineProjectTab,
  projectTabLifecycle,
  selectActiveDocument,
  useFlowStore,
  type FlowNode,
} from "@/store/flowStore";
import { requestCanvasLanding } from "@/lib/canvasLanding";

export type TemplateLaunchMode = "default" | "upload" | "text";

/**
 * Pick the first interaction a built-in template needs after it is opened.
 *
 * The default mode remains available for callers that intentionally want the
 * generic "first missing parameter" landing behavior.  Launcher cards use
 * this helper so an image workflow opens its file input and a text workflow
 * selects its starter prompt for immediate replacement.
 */
export function inferTemplateLaunchMode(
  template: Pick<WorkflowTemplate, "flow">,
): TemplateLaunchMode {
  // v7（契约 template-format.md §3）：含空 outputImages 且无图片入边的 image
  // 节点 → upload；否则含非空 text → text；否则 default。
  const hasUploadSlot = template.flow.nodes.some(
    (node) => node.data.kind === "image"
      && node.data.outputImages.length === 0
      && !template.flow.edges.some((edge) => edge.target === node.id && edge.targetHandle !== "prompt"),
  );
  if (hasUploadSlot) return "upload";
  const hasText = template.flow.nodes.some(
    (node) => node.data.kind === "text" && node.data.text.trim().length > 0,
  );
  if (hasText) return "text";
  return "default";
}

function isMissingParameter(data: WorkflowNodeData): boolean {
  // v8：text 缺正文 / image 输入节点缺产物 / 生成节点未选功能绑定，都视为待补参数。
  if (data.kind === "text") return !data.text.trim();
  if (data.kind === "image") return data.outputImages.length === 0;
  if (isGeneratorNodeKind(data.kind)) return !data.promptVariantId;
  return false;
}

export function templateLandingNodeId(
  nodes: readonly FlowNode[],
  mode: TemplateLaunchMode,
): string | undefined {
  if (mode === "upload") {
    return nodes.find((node) => node.data.kind === "image" && node.data.outputImages.length === 0)?.id;
  }
  if (mode === "text") {
    return nodes.find((node) => node.data.kind === "text")?.id;
  }
  return nodes.find((node) => isMissingParameter(node.data))?.id ?? nodes[0]?.id;
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

/** 首次任务直接接管唯一初始草稿；普通空白页签仍沿用“从模板新建”语义。 */
export function launchStarterTemplate(
  template: WorkflowTemplate,
  mode: TemplateLaunchMode = "default",
): { tabId: string; projectId: string; landingNodeId?: string } {
  const active = selectActiveDocument(useFlowStore.getState());
  if (projectTabLifecycle(active) !== "initial_draft" || !isPristineProjectTab(active)) {
    return launchTemplateInNewTab(template, mode);
  }

  const nodes = cloneNodes(template.flow.nodes);
  const edges = cloneEdges(template.flow.edges);
  const landingNodeId = templateLandingNodeId(nodes, mode);
  let changed = false;
  flushSync(() => {
    changed = commitDocumentMutation({
      nodes,
      edges,
      selectedNodeIds: [],
      selectedNodeId: null,
      selectedResultId: null,
      compareIds: [],
    });
  });
  if (!changed) return { tabId: active.id, projectId: active.projectId };
  if (landingNodeId) useFlowStore.getState().setSelectedNodeIds([landingNodeId]);
  useFlowStore.getState().closeViewer();
  requestCanvasLanding({
    tabId: active.id,
    nodeId: landingNodeId,
    fitView: true,
    activateFilePicker: mode === "upload",
    selectText: mode === "text",
  });
  return { tabId: active.id, projectId: active.projectId, landingNodeId };
}
