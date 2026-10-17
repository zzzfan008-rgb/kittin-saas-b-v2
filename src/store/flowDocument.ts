/**
 * flowDocument：纯文档类型 + 纯选择器（从 flowStore.ts 拆出，第 1 步）。
 *
 * 零运行时闭包：只依赖 @/types/* 与 @/lib/documentSnapshot，不 import flowStore。
 * `FlowState` 用结构类型承接，避免循环 import；flowStore.ts 做 re-export，39 个调用方零改动。
 */
import type { Connection, Edge, Node } from "@xyflow/react";
import {
  EDGE_HANDLE_FIRST_FRAME,
  EDGE_HANDLE_PROMPT,
  isGeneratorNodeKind,
  isInputNodeKind,
  isNodeRunActive,
  isResultNodeKind,
  isVideoSourceKind,
  nodeSpecForKind,
  type Asset,
  type NodeKind,
  type NodeRunStatus,
  type ReferenceImageEvidence,
  type WorkflowNodeData,
} from "@/types/workflow";
import type { HistoricalReferenceEvidence } from "@/lib/referenceEvidence";
import {
  isV8ConnectionValid,
  normalizeFlowForDocumentRead,
  readFlowDocumentForOpen,
  resolveTargetHandle,
} from "@/lib/documentSnapshot";

/** zustand FlowState 的结构承接（tabs + activeTabId），避免循环 import flowStore。 */
export interface DocumentStoreState {
  tabs: ProjectTab[];
  activeTabId: string;
}

export type FlowNode = Node<WorkflowNodeData>;
export type ConnectedNodeDirection = "upstream" | "downstream";
export const DEFAULT_PROJECT_NAME = "未命名设计项目";

/** 新项目默认名：固定前缀「未命名」+ 本地创建日期后缀，同日多个按 -2/-3 递增。 */
export function defaultProjectName(takenNames: Iterable<string> = [], now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const base = `未命名-${y}-${m}-${d}`;
  const taken = new Set(takenNames);
  if (!taken.has(base)) return base;
  // 优化2：使用4位随机数而非递增数字（减少碰撞概率）
  for (let attempt = 0; attempt < 10; attempt++) {
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const candidate = `${base}-${rand}`;
    if (!taken.has(candidate)) return candidate;
  }
  // 降级方案：用递增数字
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
export type ProjectLifecycle = "local" | "initial_draft" | "saved";

export interface RecentResult {
  id: string;
  /** 生成图 URL；失败记录为空字符串 */
  image: string;
  /** 列表预览图；打开详情和继续生成仍使用 image 原图。 */
  thumbnail?: string;
  nodeId: string;
  nodeLabel: string;
  kind: NodeKind;
  projectId?: string;
  projectName?: string;
  /** 后端运行 ID，用于页面刷新后恢复仍在执行的任务。 */
  runId?: string;
  /** 付费提交请求号；用于响应丢失后与服务端历史精确对账。 */
  clientRequestId?: string;
  prompt?: string;
  model?: string;
  startedAt: number;
  finishedAt?: number;
  status: Exclude<NodeRunStatus, "idle">;
  error?: string;
  ownerId?: string;
  ownerName?: string;
  requestedCount?: number;
  successfulCount?: number;
  providerRequests?: number;
  providerOutputSize?: string;
  /** Provider 原图；可能与业务后处理成品相同。 */
  providerImage?: string;
  /** 失败发生在后处理时也保留全部 Provider 原始产物。 */
  providerImages?: string[];
  parameters?: Record<string, unknown>;
  referenceImages?: string[];
  referenceInputs?: Array<ReferenceImageEvidence | HistoricalReferenceEvidence>;
  /**
   * 仅内存态：网络错误导致状态同步中断（runId 已知时）。
   * 不进入 SSE 事件流 / 持久化文档 / DocumentSnapshot（纯 runtime 字段）。
   * 由 resumeRecentResults / prepareNodeRun 中 consumeRunEvents 的网络错误触发，
   * 成功同步后清除。
   */
  syncStalled?: boolean;
}



/** 页签保存状态（从 flowStore 内部类型提升为导出，供选择器签名使用）。 */
export type SaveState = "idle" | "saving" | "saved" | "error";

export interface ProjectTab {
  id: string;
  projectId: string;
  projectName: string;
  readOnly: boolean;
  nodes: FlowNode[];
  edges: Edge[];
  /** 节点选择唯一真相；selectedNodeId 仅为兼容派生字段。 */
  selectedNodeIds: string[];
  selectedNodeId: string | null;
  selectedResultId: string | null;
  compareIds: string[];
  saveState: SaveState;
  /** 是否至少被服务端确认保存或载入过；独立于瞬时保存状态。 */
  hasBeenPersisted: boolean;
  revision: number;
  savedRevision: number;
  dirty: boolean;
  documentEpoch: number;
  /** 旧会话没有此字段；归一化时按原有保存状态推断。 */
  lifecycle?: ProjectLifecycle;
  /** 服务端 initial_draft 的乐观锁版本。 */
  draftRevision?: number;
  /** 已被服务端草稿确认的本地 document revision。 */
  draftSyncedRevision?: number;
  draftCreatedAt?: string;
}

/** Immutable identity captured before async work starts. */
export interface DocumentTarget {
  tabId: string;
  projectId: string;
  documentEpoch: number;
}

export type CoalescedTextEditDescriptor =
  | { kind: "project-name" }
  | { kind: "node-data"; nodeId: string; field: "label" | "prompt" | "note" | "text" | "outputText" | "editPrompt" };

export interface CoalescedTextEditToken {
  readonly id: symbol;
  readonly target: DocumentTarget;
  readonly descriptorKey: string;
}


/**
 * 打开路径的文档来源（二选一，互斥）。
 *
 * - `flow`：**持久化** flow（保留 `schemaVersion`）——必须走这一支，由文档层执行版本闸 +
 *   v7→v8 惰性迁移 + 投影。
 * - `nodes`/`edges`：调用方**已读过**的 v8 文档（模板派生、测试夹具）。
 *
 * 互斥是刻意的：持久化文档一旦被上游拆成 nodes/edges，schemaVersion 就丢了，
 * 「v9 文档被读进来再存成 v8」这种不可回滚的降级再也无法被发现（architect R-89 P1-3）。
 */
export type FlowDocumentSource =
  | { flow: unknown }
  | { nodes: FlowNode[]; edges: Edge[] };

export type OpenFlowDocumentOptions = FlowDocumentSource & {
  projectId: string;
  projectName: string;
  markDirty?: boolean;
  readOnly?: boolean;
};

export type LoadFlowDocumentOptions = FlowDocumentSource & {
  projectId: string;
  projectName: string;
  /** 从模板新建时为 true；打开已保存项目时保持 false。 */
  markDirty?: boolean;
};

/**
 * 读取归一唯一入口（打开路径）：
 * - 持久化 flow → 版本闸 + v7→v8 惰性迁移 + 投影 + 图不变量（`readFlowDocumentForOpen`）；
 * - 已读取文档 → 只做字段投影与非法边过滤（`normalizeFlowForDocumentRead`）。
 *
 * 被拒绝的文档在这里抛错（fail-closed）；调用方不得在读到文档之前改动任何页签状态。
 */
export function readFlowDocumentSource(source: FlowDocumentSource): { nodes: FlowNode[]; edges: Edge[] } {
  if ("flow" in source) {
    const { flow } = readFlowDocumentForOpen(source.flow);
    return { nodes: flow.nodes as unknown as FlowNode[], edges: flow.edges as unknown as Edge[] };
  }
  return normalizeFlowForDocumentRead({
    nodes: source.nodes,
    edges: source.edges,
  }) as { nodes: FlowNode[]; edges: Edge[] };
}

export function selectPrimarySelectedNodeId(
  document: Pick<ProjectTab, "selectedNodeIds">,
): string | null {
  return document.selectedNodeIds.at(-1) ?? null;
}

export const EMPTY_ACTIVE_DOCUMENT: ProjectTab = Object.freeze({
  id: "",
  projectId: "",
  projectName: "",
  // 空工作区不是「只读项目」：TopBar 不应出现只读徽标；不可写由「无页签可命中」保证。
  readOnly: false,
  nodes: Object.freeze([]) as unknown as FlowNode[],
  edges: Object.freeze([]) as unknown as Edge[],
  selectedNodeIds: Object.freeze([]) as unknown as string[],
  selectedNodeId: null,
  selectedResultId: null,
  compareIds: Object.freeze([]) as unknown as string[],
  saveState: "idle",
  hasBeenPersisted: false,
  revision: 0,
  savedRevision: 0,
  dirty: false,
  documentEpoch: 0,
  lifecycle: "local",
});

/**
 * Canonical active-document boundary.
 *
 * 两种合法状态：命中 activeTabId 的页签；或 tabs 为空（空工作区，由 EmptyWorkspaceCTA
 * 接管画布区）。tabs 非空而 activeTabId 落空仍是不变量损坏，fail fast。
 */
export function selectActiveDocument(state: DocumentStoreState): ProjectTab {
  const document = state.tabs.find((tab) => tab.id === state.activeTabId);
  if (document) return document;
  if (state.tabs.length === 0) return EMPTY_ACTIVE_DOCUMENT;
  throw new Error(`Active project tab not found: ${state.activeTabId}`);
}

export function selectActiveDocumentTarget(state: DocumentStoreState): DocumentTarget {
  const document = selectActiveDocument(state);
  return documentTarget(document);
}

export function documentTarget(document: ProjectTab): DocumentTarget {
  return {
    tabId: document.id,
    projectId: document.projectId,
    documentEpoch: document.documentEpoch,
  };
}

export function selectDocumentForTab(
  state: DocumentStoreState,
  tabId: string,
): ProjectTab | undefined {
  return documentForTab(state, tabId);
}

export function selectActiveProjectId(state: DocumentStoreState): string {
  return selectActiveDocument(state).projectId;
}

export function selectActiveProjectName(state: DocumentStoreState): string {
  return selectActiveDocument(state).projectName;
}

export function selectActiveReadOnly(state: DocumentStoreState): boolean {
  return selectActiveDocument(state).readOnly;
}

export function selectActiveNodes(state: DocumentStoreState): FlowNode[] {
  return selectActiveDocument(state).nodes;
}

export function selectActiveEdges(state: DocumentStoreState): Edge[] {
  return selectActiveDocument(state).edges;
}

export function selectActiveSelectedNodeIds(state: DocumentStoreState): string[] {
  return selectActiveDocument(state).selectedNodeIds;
}

export function selectActiveSelectedNodeId(state: DocumentStoreState): string | null {
  return selectActiveDocument(state).selectedNodeId;
}

export function selectActivePrimarySelectedNodeId(state: DocumentStoreState): string | null {
  return selectPrimarySelectedNodeId(selectActiveDocument(state));
}

export function selectActiveSelectedResultId(state: DocumentStoreState): string | null {
  return selectActiveDocument(state).selectedResultId;
}

export function selectActiveCompareIds(state: DocumentStoreState): string[] {
  return selectActiveDocument(state).compareIds;
}

export function selectActiveSaveState(state: DocumentStoreState): SaveState {
  return selectActiveDocument(state).saveState;
}

export function selectActiveRevision(state: DocumentStoreState): number {
  return selectActiveDocument(state).revision;
}

export function selectActiveSavedRevision(state: DocumentStoreState): number {
  return selectActiveDocument(state).savedRevision;
}

export function selectActiveDirty(state: DocumentStoreState): boolean {
  return selectActiveDocument(state).dirty;
}

export function selectActiveDocumentEpoch(state: DocumentStoreState): number {
  return selectActiveDocument(state).documentEpoch;
}

export function selectHasDirtyTabs(state: DocumentStoreState): boolean {
  return state.tabs.some((tab) => tab.dirty);
}

/** 只有从未编辑、未保存的空白项目（nodes=[] && edges=[]）才显示空状态。 */

export function isPristineProjectTab(tab: ProjectTab): boolean {
  const lifecycle = projectTabLifecycle(tab);
  if (
    tab.readOnly ||
    tab.dirty ||
    tab.hasBeenPersisted ||
    tab.saveState === "saving" ||
    tab.revision !== 0 ||
    tab.savedRevision !== 0 ||
    (lifecycle === "initial_draft"
      ? !/^未修改项目名称\d{8}000000$/.test(tab.projectName)
      : tab.projectName !== DEFAULT_PROJECT_NAME && !/^未命名-\d{4}-\d{2}-\d{2}(-\d+)?$/.test(tab.projectName)) ||
    tab.nodes.length !== 0 ||
    tab.edges.length !== 0
  ) return false;
  return true;
}

/**
 * 关闭页签的封锁原因（null = 可关闭）。store 与页签 UI 共用同一真相：store 用它做
 * fail-closed 兜底，× 按钮用它置灰 + title 说明，不留「点了没反应」的静默 no-op。
 */
export function projectTabCloseBlockReason(
  tab: ProjectTab,
  generationSafetyBlockReason: string | null,
): string | null {
  if (tab.nodes.some((node) => isNodeRunActive(node.data.status))) {
    return "生成任务运行中，结果要写回画布，完成后才能关闭。";
  }
  // 会话快照会剥掉运行态：对账完成前，看似空闲的恢复页签仍可能持有付费结果。
  // 只有从未落库的空白页签不可能有运行，允许直接关闭。
  if (generationSafetyBlockReason && !isPristineProjectTab(tab)) {
    return "正在确认运行历史，为保住付费结果暂时不能关闭这个页签。";
  }
  return null;
}

export function projectTabLifecycle(tab: ProjectTab): ProjectLifecycle {
  if (tab.lifecycle === "initial_draft" || tab.lifecycle === "saved" || tab.lifecycle === "local") {
    return tab.lifecycle;
  }
  return tab.hasBeenPersisted || tab.saveState === "saved" ? "saved" : "local";
}

export function projectTabHasLocalDraftChanges(tab: ProjectTab): boolean {
  if (tab.readOnly || projectTabLifecycle(tab) === "saved") return false;
  if (projectTabLifecycle(tab) === "initial_draft") {
    return tab.revision > (tab.draftSyncedRevision ?? 0);
  }
  return !isPristineProjectTab(tab);
}

/**
 * 连线规则的唯一入口；React Flow 拖线与快捷建图必须共用它。
 * v8（plan.md §2.1/§2.2、runtime.md §2.1）：入边按 targetHandle 分三区
 * （prompt：text → 生成节点；reference：图片/图片结果 → 生图；first-frame：图片/图片结果 → 生视频），
 * 生成节点与结果节点不得连出，输入节点不接受任何入边。
 * 规则本体在 `src/lib/documentSnapshot.ts:isV8ConnectionValid`（文档层单一事实源）。
 */
export function isDocumentConnectionValid(
  document: Pick<ProjectTab, "nodes" | "edges">,
  connection: Connection | Edge,
): boolean {
  return isV8ConnectionValid(document, connection);
}

/** 连线被拒时的用户可读原因（连错线要有明确反馈，不是静默失败）。 */
export function documentConnectionRejection(
  document: Pick<ProjectTab, "nodes" | "edges">,
  connection: Connection | Edge,
): string | null {
  if (isDocumentConnectionValid(document, connection)) return null;
  const source = document.nodes.find((node) => node.id === connection.source);
  const target = document.nodes.find((node) => node.id === connection.target);
  if (!source || !target) return null;
  if (connection.source === connection.target) return "节点不能连接到自身";
  const sourceKind = source.data.kind;
  const targetKind = target.data.kind;
  if (isGeneratorNodeKind(sourceKind) || isResultNodeKind(sourceKind)) {
    return "生成节点不能作为其它节点的输入；它的产物请通过结果节点使用";
  }
  if (!isInputNodeKind(sourceKind) && sourceKind !== "result-image") {
    return "该节点不能作为连线来源";
  }
  const spec = nodeSpecForKind(targetKind);
  // acceptsInputEdges 在 NODE_SPECS 里恒为 false，用它当入边闸会把所有
  // 指向生成节点的被拒连接都误报成「该节点不接受输入连线」。
  // 是否接受入边 = inputs（prompt+reference+firstFrame）总和大于 0。
  if (!spec || (spec.inputs.prompt + spec.inputs.reference + spec.inputs.firstFrame) <= 0) {
    return "该节点不接受输入连线";
  }
  const handle = resolveTargetHandle(sourceKind, targetKind, connection.targetHandle ?? null);
  if (!handle) {
    if (isVideoSourceKind(sourceKind)) {
      return "本版视频素材不能作为生成节点的输入";
    }
    return "该连线入口与节点类型不匹配";
  }
  if (handle === EDGE_HANDLE_PROMPT) {
    if (sourceKind !== "text") return "提示词入口只接受文本节点；图片请连接参考图入口";
    const usedByOtherGenerator = document.edges.some((edge) => (
      edge.source === source.id &&
      edge.target !== target.id &&
      isGeneratorNodeKind(document.nodes.find((node) => node.id === edge.target)?.data.kind)
    ));
    if (usedByOtherGenerator) {
      return "该文本节点已连接到另一个生成节点；请先断开，或用「断开并新建」";
    }
    return "该生成节点的提示词输入已达上限";
  }
  if (handle === EDGE_HANDLE_FIRST_FRAME) {
    return "该生成节点最多接受 1 张首帧图片";
  }
  return "该生成节点的参考图输入已达上限";
}

export function documentForTab(state: DocumentStoreState, tabId: string): ProjectTab | undefined {
  return state.tabs.find((tab) => tab.id === tabId);
}

export function isLatestTrackedRun(
  records: RecentResult[],
  candidate: Pick<RecentResult, "projectId" | "nodeId" | "runId" | "startedAt">,
): boolean {
  if (!candidate.projectId || !candidate.runId) return false;
  let latest: RecentResult | undefined;
  for (const record of records) {
    if (
      record.projectId !== candidate.projectId ||
      record.nodeId !== candidate.nodeId ||
      !record.runId
    ) continue;
    if (!latest || latest.startedAt < record.startedAt) latest = record;
  }
  return latest?.runId === candidate.runId;
}

/** 文本合并编辑防抖窗口（ms）。 */
export const COALESCED_TEXT_EDIT_IDLE_MS = 800;
