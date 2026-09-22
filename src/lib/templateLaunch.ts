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
import { readFlowDocumentForOpen } from "@/lib/documentSnapshot";

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

function readTemplateDocument(template: WorkflowTemplate): { nodes: FlowNode[]; edges: Edge[] } {
  // R-91：模板 flow 同样是「含 schemaVersion 的持久化文档」，读取必须经同一版本闸 + v7→v8 惰性迁移
  // （migration.md §4「加载模板时惰性迁移」），不得直接把 flow.nodes 交给画布。
  const { flow } = readFlowDocumentForOpen(template.flow);
  return { nodes: flow.nodes as unknown as FlowNode[], edges: flow.edges as unknown as Edge[] };
}

/** 从模板始终新建独立项目页签，并登记一次性 fitView/首输入焦点。 */
export function launchTemplateInNewTab(
  template: WorkflowTemplate,
  mode: TemplateLaunchMode = "default",
): { tabId: string; projectId: string; landingNodeId?: string } {
  const projectId = nanoid(10);
  const { nodes, edges } = readTemplateDocument(template);
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

  const { nodes, edges } = readTemplateDocument(template);
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
/** 用户 2026-09-25 决策：模板工作流落在「现有已打开画布」内（右侧扩展），不做新页签。 */
export function mergeTemplateIntoActiveCanvas(
  template: WorkflowTemplate,
  mode: TemplateLaunchMode = "default",
): { tabId: string; landingNodeId?: string } {
  const active = selectActiveDocument(useFlowStore.getState());
  const { nodes: templateNodes, edges: templateEdges } = readTemplateDocument(template);

  // 模板内节点向右离散：最右节点右侧 380px，同 Y 对齐；空画布保持模板原始坐标。
  let offsetX = 0;
  if (active.nodes.length > 0) {
    const rightmostX = Math.max(
      ...active.nodes.map((node) => node.position.x + estimatedNodeWidth(node)),
    );
    offsetX = rightmostX + 380 - Math.min(
      ...templateNodes.map((node) => node.position.x),
    );
  }
  const takenNodeIds = new Set(active.nodes.map((node) => node.id));
  const movedNodes = templateNodes.map((node) => {
    // 稳定业务 id 优先（资产选择器的预选分类按模板节点 id 映射）；与画布已有节点
    // 撞 id 时才换名，避免把「加同一套模板两次」静默吞掉。
    const id = takenNodeIds.has(node.id) ? `${node.id}-${nanoid(4)}` : node.id;
    takenNodeIds.add(id);
    return offsetX > 0
      ? { ...node, id, position: { x: node.position.x + offsetX, y: node.position.y } }
      : { ...node, id };
  });

  const idMap = new Map(templateNodes.map((node, index) => [node.id, movedNodes[index].id]));
  const takenEdgeIds = new Set(active.edges.map((edge) => edge.id));
  const movedEdges = templateEdges.map((edge) => {
    const id = takenEdgeIds.has(edge.id) ? `${edge.id}-${nanoid(4)}` : edge.id;
    takenEdgeIds.add(id);
    return {
      ...edge,
      id,
      source: idMap.get(edge.source) ?? edge.source,
      target: idMap.get(edge.target) ?? edge.target,
    };
  });

  // 落地引导指向映射后的节点 id（模板原 id 可能已撞名换掉）。
  const landingSourceId = templateLandingNodeId(templateNodes, mode);
  const landingNodeId = landingSourceId ? (idMap.get(landingSourceId) ?? landingSourceId) : undefined;

  // 与既有节点/边/连线去重：节点按 id，边按 source+target+targetHandle。
  const existingNodeIds = new Set(active.nodes.map((node) => node.id));
  const existingEdgeKeys = new Set(
    active.edges.map((edge) => `${edge.source}\u0000${edge.target}\u0000${edge.targetHandle ?? ""}`),
  );
  const nextNodes = [
    ...active.nodes,
    ...movedNodes.filter((node) => !existingNodeIds.has(node.id)),
  ];
  const nextEdges = [
    ...active.edges,
    ...movedEdges.filter((edge) => (
      !existingEdgeKeys.has(`${edge.source}\u0000${edge.target}\u0000${edge.targetHandle ?? ""}`)
    )),
  ];

  let changed = false;
  flushSync(() => {
    changed = commitDocumentMutation({
      nodes: nextNodes,
      edges: nextEdges,
      selectedNodeIds: [],
      selectedNodeId: null,
      compareIds: [],
    });
  });
  if (!changed) return { tabId: active.id, landingNodeId };

  if (landingNodeId) useFlowStore.getState().setSelectedNodeIds([landingNodeId]);
  useFlowStore.getState().closeViewer();
  requestCanvasLanding({
    tabId: active.id,
    nodeId: landingNodeId,
    fitView: true,
    activateFilePicker: mode === "upload",
    selectText: mode === "text",
  });
  return { tabId: active.id, landingNodeId };
}

/** 未知节点类型不再猜具体宽度，保守用「输入 / 生成」常见宽度估值的下界 260。 */
function estimatedNodeWidth(node: { width?: number | null }): number {
  return Math.max(node.width ?? 0, 260);
}
