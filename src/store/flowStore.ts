import { create } from "zustand";
import { temporal } from "zundo";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import {
  NODE_SPECS,
  WORKFLOW_SCHEMA_VERSION,
  isNodeRunActive,
  isNodeRunTerminal,
  type Asset,
  type NodeKind,
  type WorkflowNodeData,
  type NodeRunStatus,
  type ImageInputNodeData,
} from "@/types/workflow";
import {
  DEFAULT_GENERATION_MODEL_ID,
  MASK_REDRAW_MODEL_ID,
  defaultImageModelOptions,
  isImageModelId,
  isModelAllowedForNode,
  normalizeImageModelOptions,
} from "@/types/imageModels";
import { getGenerationSafetyBlockReason } from "@/store/generationSafety";

export type FlowNode = Node<WorkflowNodeData>;

/** 最近生成条目：生成图片 + 该次运行的完整记录（运行记录已合并到这里） */
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
  parameters?: Record<string, unknown>;
  referenceImages?: string[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

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
  revision: number;
  savedRevision: number;
  dirty: boolean;
  documentEpoch: number;
}

export interface FlowState {
  /** 应用内项目页签；当前页签的实时内容仍映射到下方兼容字段。 */
  tabs: ProjectTab[];
  activeTabId: string;
  projectId: string;
  projectName: string;
  readOnly: boolean;
  nodes: FlowNode[];
  edges: Edge[];
  /** 节点选择唯一真相，顺序稳定；最后一项为 primary。 */
  selectedNodeIds: string[];
  selectedNodeId: string | null;
  /** 底部「最近生成」中被点选的条目（右侧面板显示其运行记录） */
  selectedResultId: string | null;
  /** 最近生成（底部结果面板，含运行记录），新条目在前 */
  recentResults: RecentResult[];
  /** 对比模式：Ctrl 多选的最近生成条目 id（2~4 个），非空时显示对比浮层 */
  compareIds: string[];
  /** 全局图片查看器（单击任意图片弹出，滚轮缩放 1x~2x） */
  viewer: { url: string; title?: string; prompt?: string; meta?: string } | null;
  saveState: SaveState;
  /** 当前文档内容的单调版本号；每次可持久化内容变化都会递增。 */
  revision: number;
  /** 最近一次确认已写入服务端的版本号。 */
  savedRevision: number;
  /** 当前画布是否包含尚未确认写入服务端的修改。 */
  dirty: boolean;
  /** 每次整体载入画布递增，用来隔离旧文档的异步响应。 */
  documentEpoch: number;
  /** 浏览器会话草稿未能持久化；非空时刷新可能丢失尚未保存的修改。 */
  tabSessionPersistenceError: string | null;
  /** 仅内存：打开的蒙版编辑器与尚未结束的蒙版上传总数。 */
  pendingMaskWorkCount: number;

  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  openFlowTab: (opts: {
    projectId: string;
    projectName: string;
    nodes: FlowNode[];
    edges: Edge[];
    markDirty?: boolean;
    readOnly?: boolean;
  }) => void;
  createBlankTab: () => void;
  setProjectName: (name: string) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedResultId: (id: string | null) => void;
  toggleCompareId: (id: string) => void;
  clearCompare: () => void;
  removeRecentResult: (id: string) => void;
  openViewer: (v: { url: string; title?: string; prompt?: string; meta?: string }) => void;
  closeViewer: () => void;
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (conn: Connection) => void;
  isValidConnection: (conn: Connection | Edge) => boolean;
  addNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  /** 将素材以已完成的图片输入节点原子加入画布，一次撤销即可完整移除。 */
  addAssetNode: (
    asset: Pick<Asset, "name" | "image">,
    position: { x: number; y: number },
  ) => string | null;
  /** 复制/粘贴等调用方已有完整节点时，仍通过此入口维护 revision/dirty。 */
  addExistingNode: (node: FlowNode) => void;
  updateNodeData: (id: string, patch: Record<string, unknown>) => void;
  updateNodeDataInTab: (tabId: string, id: string, patch: Record<string, unknown>) => void;
  setNodeStatus: (id: string, status: NodeRunStatus, error?: string) => void;
  runNode: (id: string) => Promise<void>;
  cancelNodeRun: (id: string) => Promise<void>;
  /** 保存当前页签；返回服务端是否确认持久化成功。 */
  saveProject: () => Promise<boolean>;
  /**
   * 整组载入画布（打开项目 / 从模板新建）：
   * 替换 nodes/edges 并重置选择、对比、查看器与撤销历史。
   * 调用方决定 projectId（打开项目用原 id，模板派生用新 id）。
   */
  loadFlow: (opts: {
    projectId: string;
    projectName: string;
    nodes: FlowNode[];
    edges: Edge[];
    /** 从模板新建时为 true；打开已保存项目时保持 false。 */
    markDirty?: boolean;
  }) => void;
  undo: () => void;
  redo: () => void;
}

type FlowSet = (
  partial: Partial<FlowState> | ((state: FlowState) => Partial<FlowState>),
) => unknown;

type FlowTemporalState = Pick<FlowState, "projectName" | "nodes" | "edges">;

type DocumentMutation =
  | Partial<FlowState>
  | ((state: FlowState) => Partial<FlowState>);

export type HistoryTransactionToken = symbol;

interface ActiveHistoryTransaction {
  tokens: Set<HistoryTransactionToken>;
  tabId: string;
  before: FlowTemporalState;
  positionBeforeByNodeId: Map<string, { x: number; y: number }>;
  documentChanged: boolean;
}

let historySuppressionDepth = 0;
let activeHistoryTransaction: ActiveHistoryTransaction | null = null;
let recordHistoryEntry: (pastState: FlowTemporalState, currentState: FlowTemporalState) => void = () => undefined;
let flushDeferredTabSessionPersistence = (): void => undefined;
const DOCUMENT_HISTORY_LIMIT = 50;

interface TabTemporalHistory {
  pastStates: FlowTemporalState[];
  futureStates: FlowTemporalState[];
}

/** zundo 只挂在活动文档上；非活动页签的内存历史在切页时显式换入换出。 */
const temporalHistoryByTab = new Map<string, TabTemporalHistory>();

interface TabSaveQueue {
  promise: Promise<SaveTabResult>;
  queued: boolean;
}

interface SaveTabResult {
  ok: boolean;
  error?: string;
}

interface RunPreparation {
  cancelled: boolean;
}

class AmbiguousRunSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AmbiguousRunSubmissionError";
  }
}

/** 每个页签独立串行保存；切页不会使旧页签的保存响应失效。 */
const saveQueueByTab = new Map<string, TabSaveQueue>();

/** 节点处于“保存项目、尚未创建后端 Run”的短暂阶段时，用于去重并支持本地取消。 */
const runPreparations = new Map<string, RunPreparation>();

/** 传输结果未知时保留原请求号；再次点击只会确认/复用同一后端 Run。 */
const AMBIGUOUS_RUN_STORAGE_KEY = "garment-canvas-ambiguous-run-requests";

function loadAmbiguousRunRequestIds(): Map<string, string> {
  if (typeof window === "undefined") return new Map();
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(AMBIGUOUS_RUN_STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return new Map();
    return new Map(parsed.filter(
      (entry): entry is [string, string] =>
        Array.isArray(entry) && entry.length === 2 &&
        typeof entry[0] === "string" && typeof entry[1] === "string",
    ));
  } catch {
    return new Map();
  }
}

const ambiguousRunRequestIds = loadAmbiguousRunRequestIds();

function persistAmbiguousRunRequestIds(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      AMBIGUOUS_RUN_STORAGE_KEY,
      JSON.stringify([...ambiguousRunRequestIds]),
    );
  } catch {
    // 会话存储不可用时仍保留当前进程内的幂等请求号。
  }
}

function rememberAmbiguousRunRequest(key: string, clientRequestId: string): void {
  ambiguousRunRequestIds.set(key, clientRequestId);
  persistAmbiguousRunRequestIds();
}

function clearAmbiguousRunRequest(key: string): void {
  if (!ambiguousRunRequestIds.delete(key)) return;
  persistAmbiguousRunRequestIds();
}

function runPreparationKey(tabId: string, nodeId: string): string {
  return JSON.stringify([tabId, nodeId]);
}

function runSubmissionKey(projectId: string, nodeId: string): string {
  return JSON.stringify([projectId, nodeId]);
}

function latestActiveRecordsByNode(
  records: RecentResult[],
  projectId: string,
): Map<string, RecentResult> {
  const result = new Map<string, RecentResult>();
  for (const record of records) {
    if (record.projectId !== projectId || !isNodeRunActive(record.status) || !record.runId) continue;
    const existing = result.get(record.nodeId);
    if (!existing || existing.startedAt < record.startedAt) result.set(record.nodeId, record);
  }
  return result;
}

/** 同一节点存在历史并发 Run 时，只有最新一次 Run 可以回写画布状态。 */
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

/** 历史分页可能重叠；同一后端 Run 同一时刻只允许一条恢复连接。 */
const resumingRecentRunIds = new Set<string>();

/**
 * 屏蔽一个同步运行态/UI mutation 的历史记录。不得把异步 Promise 包在这里，
 * 否则 await 期间的真实用户编辑也会被吞掉。
 */
export function runWithoutHistory<T>(run: () => T): T {
  historySuppressionDepth += 1;
  try {
    return run();
  } finally {
    historySuppressionDepth = Math.max(0, historySuppressionDepth - 1);
  }
}

const TRANSIENT_NODE_KEYS = new Set([
  "selected",
  "dragging",
  "measured",
  "width",
  "height",
]);

const DOCUMENT_NODE_SHELL_EXCLUDED_KEYS = new Set([
  ...TRANSIENT_NODE_KEYS,
  "id",
  "type",
  "position",
  "data",
]);

const RUNTIME_NODE_DATA_KEYS = new Set(["status", "error"]);

function sameRecordValues(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  excludedKeys: ReadonlySet<string>,
): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (excludedKeys.has(key)) continue;
    const leftValue = left[key];
    const rightValue = right[key];
    if (Object.is(leftValue, rightValue)) continue;
    if (JSON.stringify(leftValue) !== JSON.stringify(rightValue)) return false;
  }
  return true;
}

function sameDocumentNode(left: FlowNode, right: FlowNode): boolean {
  if (left === right) return true;
  if (
    left.id !== right.id ||
    left.type !== right.type ||
    left.position.x !== right.position.x ||
    left.position.y !== right.position.y
  ) return false;
  if (!sameRecordValues(
    left as unknown as Record<string, unknown>,
    right as unknown as Record<string, unknown>,
    DOCUMENT_NODE_SHELL_EXCLUDED_KEYS,
  )) return false;
  if (left.data === right.data) return true;
  return sameRecordValues(
    left.data as unknown as Record<string, unknown>,
    right.data as unknown as Record<string, unknown>,
    RUNTIME_NODE_DATA_KEYS,
  );
}

function documentEdgeValue(edge: Edge): unknown {
  const { selected: _selected, ...documentEdge } = edge;
  return documentEdge;
}

function sameDocumentNodes(left: FlowNode[], right: FlowNode[]): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (!sameDocumentNode(left[index], right[index])) return false;
  }
  return true;
}

function sameDocumentEdges(left: Edge[], right: Edge[]): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] === right[index]) continue;
    if (JSON.stringify(documentEdgeValue(left[index])) !== JSON.stringify(documentEdgeValue(right[index]))) {
      return false;
    }
  }
  return true;
}

function sameTemporalDocument(left: FlowTemporalState, right: FlowTemporalState): boolean {
  return left.projectName === right.projectName &&
    sameDocumentNodes(left.nodes, right.nodes) &&
    sameDocumentEdges(left.edges, right.edges);
}

function stashActiveTemporalHistory(tabId: string): void {
  const temporalState = useFlowStore.temporal.getState();
  if (temporalState.pastStates.length === 0 && temporalState.futureStates.length === 0) {
    temporalHistoryByTab.delete(tabId);
    return;
  }
  temporalHistoryByTab.set(tabId, {
    pastStates: [...temporalState.pastStates] as FlowTemporalState[],
    futureStates: [...temporalState.futureStates] as FlowTemporalState[],
  });
}

function restoreTemporalHistory(tabId: string): void {
  const history = temporalHistoryByTab.get(tabId);
  useFlowStore.temporal.setState({
    pastStates: history ? [...history.pastStates] : [],
    futureStates: history ? [...history.futureStates] : [],
  });
}

function recordInactiveTabHistory(
  tabId: string,
  before: FlowTemporalState,
  current: FlowTemporalState,
): void {
  if (sameTemporalDocument(before, current)) return;
  const history = temporalHistoryByTab.get(tabId) ?? { pastStates: [], futureStates: [] };
  temporalHistoryByTab.set(tabId, {
    pastStates: [...history.pastStates, before].slice(-DOCUMENT_HISTORY_LIMIT),
    futureStates: [],
  });
}

function documentMutationChanged(state: FlowState, patch: Partial<FlowState>): boolean {
  if (patch.projectName !== undefined && patch.projectName !== state.projectName) return true;
  if (patch.nodes !== undefined && !sameDocumentNodes(state.nodes, patch.nodes)) return true;
  if (patch.edges !== undefined && !sameDocumentEdges(state.edges, patch.edges)) return true;
  return false;
}

function captureTransactionPositionChanges(
  transaction: ActiveHistoryTransaction,
  state: FlowState,
  patch: Partial<FlowState>,
): void {
  if (!patch.nodes) return;
  const currentById = new Map(state.nodes.map((node) => [node.id, node]));
  for (const nextNode of patch.nodes) {
    const currentNode = currentById.get(nextNode.id);
    if (
      !currentNode ||
      transaction.positionBeforeByNodeId.has(nextNode.id) ||
      (currentNode.position.x === nextNode.position.x && currentNode.position.y === nextNode.position.y)
    ) continue;
    transaction.positionBeforeByNodeId.set(nextNode.id, { ...currentNode.position });
  }
}

/**
 * 将事务中的实时拖拽位置还原到起点，同时保留期间发生的其他文档变化。
 * 这样后台 success/output 等并发提交可以获得独立、按时间排序的历史记录。
 */
function rebaseDocumentOutsideTransaction(
  document: FlowTemporalState,
  transaction: ActiveHistoryTransaction,
): FlowTemporalState {
  if (transaction.positionBeforeByNodeId.size === 0) return document;
  const baselineById = new Map(transaction.before.nodes.map((node) => [node.id, node]));
  let changed = false;
  const nodes = document.nodes.map((node) => {
    const position = transaction.positionBeforeByNodeId.get(node.id);
    if (!position) return node;
    const baseline = baselineById.get(node.id);
    if (
      node.position.x === position.x &&
      node.position.y === position.y &&
      node.dragging === baseline?.dragging
    ) return node;
    changed = true;
    return { ...node, position: { ...position }, dragging: baseline?.dragging };
  });
  return {
    projectName: document.projectName,
    nodes: changed ? nodes : document.nodes,
    edges: document.edges,
  };
}

function commitDocumentMutationWithSet(
  set: FlowSet,
  mutation: DocumentMutation,
  options?: { coalesceWithActiveTransaction?: boolean },
): boolean {
  let changed = false;
  const concurrent: {
    transaction: ActiveHistoryTransaction | null;
    before: FlowTemporalState | null;
  } = { transaction: null, before: null };
  set((state) => {
    const patch = typeof mutation === "function" ? mutation(state) : mutation;
    if (!documentMutationChanged(state, patch)) {
      // 同一次 action 可能只更新运行态或选择投影；应用它，但不写 history/revision。
      // 完全同引用的真正 no-op 仍直接返回空 patch。
      const hasTransientChange = Object.entries(patch).some(([key, value]) => (
        value !== state[key as keyof FlowState]
      ));
      return hasTransientChange ? patch : {};
    }
    changed = true;
    const transaction = activeHistoryTransaction?.tabId === state.activeTabId
      ? activeHistoryTransaction
      : null;
    if (transaction && options?.coalesceWithActiveTransaction) {
      captureTransactionPositionChanges(transaction, state, patch);
      transaction.documentChanged = true;
      return patch;
    }
    if (transaction) {
      concurrent.transaction = transaction;
      concurrent.before = rebaseDocumentOutsideTransaction(
        { projectName: state.projectName, nodes: state.nodes, edges: state.edges },
        transaction,
      );
    }
    return {
      ...patch,
      revision: state.revision + 1,
      dirty: true,
      saveState: state.saveState === "saving" ? "saving" : "idle",
    };
  });
  if (changed && concurrent.transaction && concurrent.before) {
    const latest = useFlowStore.getState();
    const concurrentAfter = rebaseDocumentOutsideTransaction(
      { projectName: latest.projectName, nodes: latest.nodes, edges: latest.edges },
      concurrent.transaction,
    );
    if (!sameTemporalDocument(concurrent.before, concurrentAfter)) {
      recordHistoryEntry(concurrent.before, concurrentAfter);
    }
    concurrent.transaction.before = concurrentAfter;
  }
  return changed;
}

/** 对当前项目文档执行一次原子、可撤销且具备 no-op 判定的修改。 */
export function commitDocumentMutation(mutation: DocumentMutation): boolean {
  return commitDocumentMutationWithSet(useFlowStore.setState, mutation);
}

/** 开始一组实时可见、但只在结束时写入一次历史与 revision 的文档事务。 */
export function beginHistoryTransaction(label = "document-transaction"): HistoryTransactionToken {
  const token = Symbol(label);
  const state = useFlowStore.getState();
  if (!activeHistoryTransaction || activeHistoryTransaction.tabId !== state.activeTabId) {
    activeHistoryTransaction = {
      tokens: new Set(),
      tabId: state.activeTabId,
      before: { projectName: state.projectName, nodes: state.nodes, edges: state.edges },
      positionBeforeByNodeId: new Map(),
      documentChanged: false,
    };
  }
  activeHistoryTransaction.tokens.add(token);
  return token;
}

/** 结束事务；返回是否产生了一次净文档提交。 */
export function endHistoryTransaction(token: HistoryTransactionToken): boolean {
  const transaction = activeHistoryTransaction;
  if (!transaction || !transaction.tokens.delete(token)) return false;
  if (transaction.tokens.size > 0) return false;

  let state = useFlowStore.getState();
  const settledNodes = state.nodes.map((node) => (
    node.dragging ? { ...node, dragging: false } : node
  ));
  if (settledNodes.some((node, index) => node !== state.nodes[index])) {
    runWithoutHistory(() => useFlowStore.setState({ nodes: settledNodes }));
    state = useFlowStore.getState();
  }
  if (!transaction.documentChanged || transaction.tabId !== state.activeTabId) {
    activeHistoryTransaction = null;
    flushDeferredTabSessionPersistence();
    return false;
  }
  const current: FlowTemporalState = {
    projectName: state.projectName,
    nodes: state.nodes,
    edges: state.edges,
  };
  const temporalChanged = !sameTemporalDocument(transaction.before, current);
  if (!temporalChanged) {
    activeHistoryTransaction = null;
    flushDeferredTabSessionPersistence();
    return false;
  }

  recordHistoryEntry(transaction.before, current);
  // Keep session persistence suppressed until the final coordinates and their
  // revision/dirty metadata can be observed in the same completed transaction.
  activeHistoryTransaction = null;
  runWithoutHistory(() => {
    useFlowStore.setState((latest) => ({
      revision: latest.revision + 1,
      dirty: true,
      saveState: latest.saveState === "saving" ? "saving" : "idle",
    }));
  });
  flushDeferredTabSessionPersistence();
  return true;
}

function cancelHistoryTransaction(): void {
  const transaction = activeHistoryTransaction;
  if (!transaction) return;

  const state = useFlowStore.getState();
  if (transaction.tabId !== state.activeTabId) {
    activeHistoryTransaction = null;
    flushDeferredTabSessionPersistence();
    return;
  }

  // A tab/load transition can invalidate a drag before React Flow emits dragStop.
  // Restore the document snapshot so an intermediate position is never persisted
  // without a history entry or revision. Runtime status and current selection are
  // transient, so keep those values while rolling the persisted document back.
  const runtimeById = new Map(
    state.nodes.map((node) => [node.id, { status: node.data.status, error: node.data.error }]),
  );
  const selectedEdges = new Map(state.edges.map((edge) => [edge.id, edge.selected]));
  const nodes = transaction.before.nodes.map((node) => {
    const runtime = runtimeById.get(node.id);
    return runtime
      ? { ...node, data: { ...node.data, ...runtime } as WorkflowNodeData }
      : node;
  });
  const edges = transaction.before.edges.map((edge) => {
    const selected = selectedEdges.get(edge.id);
    return edge.selected === selected ? edge : { ...edge, selected };
  });
  runWithoutHistory(() => {
    useFlowStore.setState({
      ...normalizeNodeSelection(nodes, state.selectedNodeIds),
      edges,
      projectName: transaction.before.projectName,
    });
  });
  activeHistoryTransaction = null;
  flushDeferredTabSessionPersistence();
}

/**
 * 直接执行受控的画布内容变更，并同步 revision/dirty。
 * 用于 App 等既有调用方尚未迁移到 store action 的兼容路径。
 */
export function markFlowDocumentChanged(partial: Pick<FlowState, "nodes"> | Pick<FlowState, "edges">): void {
  commitDocumentMutation(partial);
}

function defaultNodeData(kind: NodeKind): WorkflowNodeData {
  const spec = NODE_SPECS[kind];
  const base = { label: spec.title, status: "idle" as NodeRunStatus };
  switch (kind) {
    case "image-input":
      return { ...base, kind, imageRole: "default" };
    case "sketch-to-render":
      return {
        ...base, kind, prompt: "", aspectRatio: "3:4", batchSize: 1, outputImages: [],
        modelId: DEFAULT_GENERATION_MODEL_ID,
        modelOptions: defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID, "3:4"),
      };
    case "ai-modify":
      return {
        ...base, kind, prompt: "", aspectRatio: "1:1", batchSize: 1, outputImages: [],
        modelId: DEFAULT_GENERATION_MODEL_ID,
        modelOptions: defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID),
      };
    case "fabric-recolor":
      return {
        ...base, kind, colors: [], prompt: "", outputImages: [],
        modelId: DEFAULT_GENERATION_MODEL_ID,
        modelOptions: defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID),
      };
    case "upscale":
      return {
        ...base, kind, imageSize: "2K", outputImages: [],
        modelId: DEFAULT_GENERATION_MODEL_ID,
        modelOptions: defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID),
      };
    case "print-extract":
      return {
        ...base, kind, prompt: "", outputImages: [], savedAsAssets: [],
        modelId: DEFAULT_GENERATION_MODEL_ID,
        modelOptions: defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID),
      };
    case "print-mutate":
      return {
        ...base, kind, prompt: "", count: 4, outputImages: [],
        modelId: DEFAULT_GENERATION_MODEL_ID,
        modelOptions: defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID),
      };
    case "mask-redraw":
      return {
        ...base, kind, prompt: "", outputImages: [],
        modelId: MASK_REDRAW_MODEL_ID, modelOptions: {},
      };
    case "result":
      return { ...base, kind, images: [] };
  }
}

/** 从节点 data 中取它对外输出的图片 */
function nodeOutputImages(data: WorkflowNodeData): string[] {
  if (data.kind === "image-input") return data.imageUrl ? [data.imageUrl] : [];
  if (data.kind === "result") return [];
  return data.outputImages ?? [];
}

function sameStringList(left: string[], right: string[]): boolean {
  return left === right || (
    left.length === right.length && left.every((value, index) => value === right[index])
  );
}

export function selectPrimarySelectedNodeId(
  state: Pick<FlowState, "selectedNodeIds">,
): string | null {
  return state.selectedNodeIds.at(-1) ?? null;
}

function normalizeNodeSelection(
  nodes: FlowNode[],
  requestedIds: readonly string[],
): Pick<FlowState, "nodes" | "selectedNodeIds" | "selectedNodeId"> {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const seen = new Set<string>();
  const selectedNodeIds = requestedIds.filter((id) => {
    if (!nodeIds.has(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const selected = new Set(selectedNodeIds);
  let changed = false;
  const normalizedNodes = nodes.map((node) => {
    const shouldSelect = selected.has(node.id);
    if (Boolean(node.selected) === shouldSelect) return node;
    changed = true;
    return { ...node, selected: shouldSelect };
  });
  return {
    nodes: changed ? normalizedNodes : nodes,
    selectedNodeIds,
    selectedNodeId: selectedNodeIds.at(-1) ?? null,
  };
}

function selectionIdsAfterNodeChanges(
  currentIds: readonly string[],
  nodes: FlowNode[],
  changes: readonly NodeChange<FlowNode>[],
): string[] {
  const selectedNodeIds = new Set(
    nodes.filter((node) => node.selected).map((node) => node.id),
  );
  let nextIds = currentIds.filter((id) => selectedNodeIds.has(id));
  const selectionChanges = changes.filter(
    (change): change is Extract<NodeChange<FlowNode>, { type: "select" }> => change.type === "select",
  );
  if (selectionChanges.length === 0) return nextIds;

  for (const change of selectionChanges) {
    nextIds = nextIds.filter((id) => id !== change.id);
    if (change.selected && selectedNodeIds.has(change.id)) nextIds.push(change.id);
  }
  // Defensive fallback for a React Flow version that batches a selected node
  // without an explicit select change; event order remains authoritative.
  for (const node of nodes) {
    if (node.selected && !nextIds.includes(node.id)) nextIds.push(node.id);
  }
  return nextIds;
}

function makeStarterNode(): FlowNode {
  return {
    id: nanoid(8),
    type: "image-input",
    position: { x: 0, y: 0 },
    data: defaultNodeData("image-input"),
  };
}

type ActiveDocumentState = Pick<
  FlowState,
  | "projectId"
  | "projectName"
  | "readOnly"
  | "nodes"
  | "edges"
  | "selectedNodeIds"
  | "selectedNodeId"
  | "selectedResultId"
  | "compareIds"
  | "saveState"
  | "revision"
  | "savedRevision"
  | "dirty"
  | "documentEpoch"
>;

function snapshotActiveTab(state: FlowState): ProjectTab {
  return {
    id: state.activeTabId,
    projectId: state.projectId,
    projectName: state.projectName,
    readOnly: state.readOnly,
    nodes: state.nodes,
    edges: state.edges,
    selectedNodeIds: state.selectedNodeIds,
    selectedNodeId: state.selectedNodeId,
    selectedResultId: state.selectedResultId,
    compareIds: state.compareIds,
    saveState: state.saveState,
    revision: state.revision,
    savedRevision: state.savedRevision,
    dirty: state.dirty,
    documentEpoch: state.documentEpoch,
  };
}

function activeFields(tab: ProjectTab): ActiveDocumentState {
  return {
    projectId: tab.projectId,
    projectName: tab.projectName,
    readOnly: tab.readOnly,
    nodes: tab.nodes,
    edges: tab.edges,
    selectedNodeIds: tab.selectedNodeIds,
    selectedNodeId: tab.selectedNodeId,
    selectedResultId: tab.selectedResultId,
    compareIds: tab.compareIds,
    saveState: tab.saveState,
    revision: tab.revision,
    savedRevision: tab.savedRevision,
    dirty: tab.dirty,
    documentEpoch: tab.documentEpoch,
  };
}

function replaceTab(tabs: ProjectTab[], tab: ProjectTab): ProjectTab[] {
  return tabs.map((candidate) => (candidate.id === tab.id ? tab : candidate));
}

function documentForTab(state: FlowState, tabId: string): ProjectTab | undefined {
  return tabId === state.activeTabId
    ? snapshotActiveTab(state)
    : state.tabs.find((tab) => tab.id === tabId);
}

function patchTab(
  set: (partial: Partial<FlowState> | ((state: FlowState) => Partial<FlowState>)) => unknown,
  tabId: string,
  patch: Partial<ProjectTab> | ((tab: ProjectTab) => Partial<ProjectTab>),
): void {
  set((state) => {
    const tab = documentForTab(state, tabId);
    if (!tab) return {};
    const changes = typeof patch === "function" ? patch(tab) : patch;
    const next = { ...tab, ...changes };
    if (state.activeTabId === tabId) return changes;
    return { tabs: replaceTab(state.tabs, next) };
  });
}

function newTab(opts?: {
  projectId?: string;
  projectName?: string;
  nodes?: FlowNode[];
  edges?: Edge[];
  markDirty?: boolean;
  readOnly?: boolean;
}): ProjectTab {
  const markDirty = opts?.markDirty ?? false;
  const selection = normalizeNodeSelection(opts?.nodes ?? [makeStarterNode()], []);
  return {
    id: nanoid(10),
    projectId: opts?.projectId ?? nanoid(10),
    projectName: opts?.projectName ?? "未命名设计项目",
    readOnly: opts?.readOnly ?? false,
    nodes: selection.nodes,
    edges: opts?.edges ?? [],
    selectedNodeIds: [],
    selectedNodeId: selection.selectedNodeId,
    selectedResultId: null,
    compareIds: [],
    saveState: "idle",
    revision: markDirty ? 1 : 0,
    savedRevision: 0,
    dirty: markDirty,
    documentEpoch: 0,
  };
}

/** 在目标页签内更新节点；目标为当前页签时同步兼容字段。 */
function updateTabNodes(
  set: (partial: Partial<FlowState> | ((state: FlowState) => Partial<FlowState>)) => unknown,
  tabId: string,
  update: (nodes: FlowNode[]) => FlowNode[],
  opts?: { markDirty?: boolean },
): void {
  if (opts?.markDirty === true && useFlowStore.getState().activeTabId === tabId) {
    commitDocumentMutationWithSet(set, (state) => {
      const nodes = update(state.nodes);
      return nodes === state.nodes ? {} : { nodes };
    });
    return;
  }
  const history: {
    before: FlowTemporalState | null;
    current: FlowTemporalState | null;
  } = { before: null, current: null };
  patchTab(set, tabId, (tab) => {
    const nodes = update(tab.nodes);
    if (nodes === tab.nodes) return {};
    const documentChanged = opts?.markDirty === true && !sameDocumentNodes(tab.nodes, nodes);
    if (documentChanged) {
      history.before = { projectName: tab.projectName, nodes: tab.nodes, edges: tab.edges };
      history.current = { projectName: tab.projectName, nodes, edges: tab.edges };
    }
    return {
      nodes,
      revision: documentChanged ? tab.revision + 1 : tab.revision,
      dirty: documentChanged ? true : tab.dirty,
      saveState: documentChanged && tab.saveState !== "saving" ? "idle" : tab.saveState,
    };
  });
  if (history.before && history.current) {
    recordInactiveTabHistory(tabId, history.before, history.current);
  }
}

/** 最近生成持久化（localStorage）：刷新/重开浏览器不丢 */
const RECENT_STORAGE_KEY = "garment-canvas-recent-results";
const TAB_SESSION_STORAGE_KEY = "garment-canvas-project-tabs";
export const TAB_SESSION_SCHEMA_VERSION = 1 as const;

export interface PersistedTabSession {
  schemaVersion: typeof TAB_SESSION_SCHEMA_VERSION;
  tabs: ProjectTab[];
  activeTabId: string;
}

export interface TabSessionWriteResult {
  ok: boolean;
  error?: string;
}

const TAB_SESSION_WRITE_ERROR = "本地草稿未写入浏览器，请先保存项目或重新保存大蒙版；刷新会丢失本页修改";

const NODE_KINDS = new Set<NodeKind>(Object.keys(NODE_SPECS) as NodeKind[]);
const NODE_STATUSES = new Set<NodeRunStatus>([
  "idle", "queued", "running", "retry_wait", "cancel_requested",
  "success", "error", "outcome_unknown", "cancelled",
]);

function finiteNonNegative(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function stringList(value: unknown, max = 100): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0).slice(0, max)
    : [];
}

/**
 * 会话缓存属于浏览器易失数据：逐节点容错迁移，坏节点/悬空边单独丢弃，
 * 不让一个历史字段缺失导致所有项目页签都无法恢复。
 */
function normalizeSessionNode(value: unknown): FlowNode | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== "string" ||
    !raw.id ||
    typeof raw.type !== "string" ||
    !NODE_KINDS.has(raw.type as NodeKind) ||
    !raw.position ||
    typeof raw.position !== "object" ||
    !raw.data ||
    typeof raw.data !== "object"
  ) return undefined;
  const position = raw.position as Record<string, unknown>;
  if (
    typeof position.x !== "number" || !Number.isFinite(position.x) ||
    typeof position.y !== "number" || !Number.isFinite(position.y)
  ) return undefined;

  const kind = raw.type as NodeKind;
  const input = raw.data as Record<string, unknown>;
  const defaults = defaultNodeData(kind) as unknown as Record<string, unknown>;
  const status = typeof input.status === "string" && NODE_STATUSES.has(input.status as NodeRunStatus)
    ? input.status as NodeRunStatus
    : "idle";
  const data: Record<string, unknown> = {
    ...defaults,
    ...input,
    kind,
    label: typeof input.label === "string" && input.label.trim() ? input.label : defaults.label,
    status,
  };
  if (typeof input.error !== "string") delete data.error;
  if (NODE_SPECS[kind].providerId) {
    const modelId = isImageModelId(input.modelId) && isModelAllowedForNode(input.modelId, kind)
      ? input.modelId
      : kind === "mask-redraw" ? MASK_REDRAW_MODEL_ID : DEFAULT_GENERATION_MODEL_ID;
    const preferredAspectRatio = typeof input.aspectRatio === "string" ? input.aspectRatio : "1:1";
    data.modelId = modelId;
    data.modelOptions = normalizeImageModelOptions(modelId, input.modelOptions, preferredAspectRatio);
  }

  switch (kind) {
    case "image-input":
      data.imageRole = typeof input.imageRole === "string" && ["default", "sketch", "garment", "fabric", "reference"].includes(input.imageRole)
        ? input.imageRole
        : "default";
      if (typeof input.imageUrl !== "string") delete data.imageUrl;
      break;
    case "sketch-to-render":
    case "ai-modify":
      data.prompt = typeof input.prompt === "string" ? input.prompt : "";
      data.aspectRatio = typeof input.aspectRatio === "string" && ["1:1", "3:4", "4:3", "9:16", "16:9"].includes(input.aspectRatio)
        ? input.aspectRatio
        : kind === "sketch-to-render" ? "3:4" : "1:1";
      data.batchSize = [1, 2, 4, 8].includes(Number(input.batchSize)) ? Number(input.batchSize) : 1;
      data.outputImages = stringList(input.outputImages);
      break;
    case "fabric-recolor":
      data.colors = stringList(input.colors, 8).filter((color) => /^#[0-9a-fA-F]{6}$/.test(color));
      data.prompt = typeof input.prompt === "string" ? input.prompt : "";
      data.outputImages = stringList(input.outputImages);
      if (typeof input.fabricImageUrl !== "string") delete data.fabricImageUrl;
      break;
    case "upscale":
      data.imageSize = input.imageSize === "4K" ? "4K" : "2K";
      data.outputImages = stringList(input.outputImages);
      break;
    case "print-extract":
      data.prompt = typeof input.prompt === "string" ? input.prompt : "";
      data.outputImages = stringList(input.outputImages);
      data.savedAsAssets = stringList(input.savedAsAssets);
      break;
    case "print-mutate":
      data.prompt = typeof input.prompt === "string" ? input.prompt : "";
      data.count = Number.isInteger(input.count) && Number(input.count) >= 1 && Number(input.count) <= 8
        ? input.count
        : 4;
      data.outputImages = stringList(input.outputImages);
      break;
    case "mask-redraw":
      data.modelId = MASK_REDRAW_MODEL_ID;
      data.modelOptions = {};
      data.prompt = typeof input.prompt === "string" ? input.prompt : "";
      data.outputImages = stringList(input.outputImages);
      if (typeof input.mask !== "string") delete data.mask;
      if (typeof input.maskSourceRef !== "string") delete data.maskSourceRef;
      break;
    case "result":
      data.images = stringList(input.images);
      if (typeof input.note !== "string") delete data.note;
      break;
  }

  const { dragging: _dragging, ...sessionNode } = raw;
  return {
    ...sessionNode,
    id: raw.id,
    type: kind,
    position: { x: position.x, y: position.y },
    data: data as unknown as WorkflowNodeData,
  } as FlowNode;
}

function normalizeSessionEdge(value: unknown, nodeIds: Set<string>): Edge | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== "string" || !raw.id ||
    typeof raw.source !== "string" || !nodeIds.has(raw.source) ||
    typeof raw.target !== "string" || !nodeIds.has(raw.target)
  ) return undefined;
  return { ...raw, id: raw.id, source: raw.source, target: raw.target } as Edge;
}

function normalizeSessionTab(value: unknown): ProjectTab | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<ProjectTab>;
  if (
    typeof raw.id !== "string" || !raw.id ||
    typeof raw.projectId !== "string" || !raw.projectId ||
    typeof raw.projectName !== "string" ||
    !Array.isArray(raw.nodes) || !Array.isArray(raw.edges)
  ) return undefined;

  const seenNodeIds = new Set<string>();
  const nodes = raw.nodes.flatMap((node): FlowNode[] => {
    const normalized = normalizeSessionNode(node);
    if (!normalized || seenNodeIds.has(normalized.id)) return [];
    seenNodeIds.add(normalized.id);
    return [normalized];
  });
  // 一个原本非空的页签若没有任何节点能迁移，说明其结构整体不可恢复。
  if (raw.nodes.length > 0 && nodes.length === 0) return undefined;
  const seenEdgeIds = new Set<string>();
  const edges = raw.edges.flatMap((edge): Edge[] => {
    const normalized = normalizeSessionEdge(edge, seenNodeIds);
    if (!normalized || seenEdgeIds.has(normalized.id)) return [];
    seenEdgeIds.add(normalized.id);
    return [normalized];
  });
  const revision = finiteNonNegative(raw.revision, 0);
  const wasSaving = raw.saveState === "saving";
  const dirty = wasSaving || raw.dirty === true;
  const savedRevision = Math.min(finiteNonNegative(raw.savedRevision, 0), revision);
  const requestedSelection = Array.isArray(raw.selectedNodeIds)
    ? stringList(raw.selectedNodeIds, nodes.length)
    : typeof raw.selectedNodeId === "string"
      ? [raw.selectedNodeId]
      : [];
  const selection = normalizeNodeSelection(nodes, requestedSelection);

  return {
    id: raw.id,
    projectId: raw.projectId,
    projectName: raw.projectName,
    readOnly: raw.readOnly === true,
    nodes: selection.nodes,
    edges,
    selectedNodeIds: selection.selectedNodeIds,
    selectedNodeId: selection.selectedNodeId,
    // Recent results are deliberately reloaded from the authenticated server and
    // never restored from the browser session. Clear their view references here
    // so a failed/slow history request cannot leave a phantom detail or compare UI.
    selectedResultId: null,
    compareIds: [],
    // 刷新会中断 in-flight 请求；必须恢复成可再次保存，同时保守地视为未保存。
    saveState: raw.saveState === "saved" || raw.saveState === "error" ? raw.saveState : "idle",
    revision,
    savedRevision,
    dirty,
    documentEpoch: finiteNonNegative(raw.documentEpoch, 0),
  };
}

export function normalizeTabSessionValue(value: unknown): PersistedTabSession | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as { schemaVersion?: unknown; tabs?: unknown; activeTabId?: unknown };
  if (
    raw.schemaVersion !== undefined &&
    raw.schemaVersion !== 0 &&
    raw.schemaVersion !== TAB_SESSION_SCHEMA_VERSION
  ) return undefined;
  if (!Array.isArray(raw.tabs) || typeof raw.activeTabId !== "string") return undefined;
  const tabs = raw.tabs.flatMap((tab): ProjectTab[] => {
    const normalized = normalizeSessionTab(tab);
    return normalized ? [normalized] : [];
  });
  if (tabs.length === 0) return undefined;
  const activeTabId = tabs.some((tab) => tab.id === raw.activeTabId) ? raw.activeTabId : tabs[0].id;
  return { schemaVersion: TAB_SESSION_SCHEMA_VERSION, tabs, activeTabId };
}

function loadTabSession(): { tabs: ProjectTab[]; activeTabId: string } | undefined {
  try {
    const raw = window.sessionStorage.getItem(TAB_SESSION_STORAGE_KEY);
    if (!raw) return undefined;
    return normalizeTabSessionValue(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

export function writeTabSessionSnapshot(
  storage: Pick<Storage, "setItem" | "removeItem">,
  value: PersistedTabSession,
): TabSessionWriteResult {
  try {
    storage.setItem(TAB_SESSION_STORAGE_KEY, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    // setItem 失败会保留同 key 的旧值；必须废弃它，不能让刷新恢复成旧画布。
    try { storage.removeItem(TAB_SESSION_STORAGE_KEY); } catch { /* best effort */ }
    return {
      ok: false,
      error: error instanceof Error && error.name !== "QuotaExceededError"
        ? `${TAB_SESSION_WRITE_ERROR}（${error.message}）`
        : TAB_SESSION_WRITE_ERROR,
    };
  }
}

function persistTabSession(state: FlowState): TabSessionWriteResult {
  try {
    const current = snapshotActiveTab(state);
    const normalized = normalizeTabSessionValue({
      schemaVersion: TAB_SESSION_SCHEMA_VERSION,
      tabs: replaceTab(state.tabs, current),
      activeTabId: state.activeTabId,
    });
    if (!normalized) return { ok: false, error: TAB_SESSION_WRITE_ERROR };
    return writeTabSessionSnapshot(window.sessionStorage, normalized);
  } catch (error) {
    try { window.sessionStorage.removeItem(TAB_SESSION_STORAGE_KEY); } catch { /* best effort */ }
    return {
      ok: false,
      error: error instanceof Error ? `${TAB_SESSION_WRITE_ERROR}（${error.message}）` : TAB_SESSION_WRITE_ERROR,
    };
  }
}

/** 错误边界恢复：只丢弃当前损坏页签，其他页签与服务端项目都不受影响。 */
export function discardActiveTabSession(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(TAB_SESSION_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { tabs?: unknown; activeTabId?: unknown };
    if (!Array.isArray(parsed.tabs) || typeof parsed.activeTabId !== "string") {
      window.sessionStorage.removeItem(TAB_SESSION_STORAGE_KEY);
      return;
    }
    const activeIndex = parsed.tabs.findIndex(
      (value) => Boolean(value && typeof value === "object" && (value as { id?: unknown }).id === parsed.activeTabId),
    );
    const remaining = parsed.tabs.filter(
      (value) => !(value && typeof value === "object" && (value as { id?: unknown }).id === parsed.activeTabId),
    );
    if (remaining.length === 0) {
      window.sessionStorage.removeItem(TAB_SESSION_STORAGE_KEY);
      return;
    }
    const fallbackIndex = Math.max(0, Math.min(activeIndex, remaining.length - 1));
    const fallback = remaining[fallbackIndex] as { id?: unknown };
    if (typeof fallback.id !== "string") {
      window.sessionStorage.removeItem(TAB_SESSION_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(
      TAB_SESSION_STORAGE_KEY,
      JSON.stringify({ tabs: remaining, activeTabId: fallback.id }),
    );
  } catch {
    window.sessionStorage.removeItem(TAB_SESSION_STORAGE_KEY);
  }
}

function loadRecentResults(): RecentResult[] {
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(arr)) return [];
    const now = Date.now();
    return (arr as RecentResult[]).map((record) => {
      if (isNodeRunActive(record.status) && !record.runId) {
        return {
          ...record,
          status: "error" as const,
          finishedAt: now,
          error: "页面刷新发生在任务提交完成前，无法自动恢复此次生成",
        };
      }
      return record;
    });
  } catch {
    return [];
  }
}

function persistRecentResults(list: RecentResult[]): void {
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 存储不可用时静默降级
  }
}

interface RunFailure {
  prompt?: string;
  error: string;
}

interface RunEventMeta {
  seq?: number;
  error?: string;
  model?: string;
  prompts?: string[];
  providerOutputSizes?: Array<string | null>;
  failures?: RunFailure[];
  startedAt?: number;
  finishedAt?: number;
}

export type NodeStatusRunEvent =
  | (RunEventMeta & {
      type: "node-status";
      nodeId: string;
      status: "queued" | "running" | "retry_wait" | "cancel_requested";
      images?: never;
    })
  | (RunEventMeta & {
      type: "node-status";
      nodeId: string;
      status: "success";
      /** 成功事件在客户端归一化后始终包含数组。 */
      images: string[];
    })
  | (Omit<RunEventMeta, "error"> & {
      type: "node-status";
      nodeId: string;
      status: "error" | "outcome_unknown" | "cancelled";
      error: string;
      images?: never;
    });

export type RunEvent =
  | NodeStatusRunEvent
  | { seq?: number; type: "done" }
  | { seq?: number; type: "run-error"; nodeId?: string; error: string; finishedAt?: number };

function optionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function nullableStringArray(value: unknown): Array<string | null> | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => optionalString(item) ?? null);
}

function runFailures(value: unknown): RunFailure[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const failures = value.flatMap((item): RunFailure[] => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as { prompt?: unknown; error?: unknown };
    const error = optionalString(candidate.error);
    if (!error) return [];
    return [{ error, ...(optionalString(candidate.prompt) ? { prompt: optionalString(candidate.prompt) } : {}) }];
  });
  return failures.length ? failures : undefined;
}

/** SSE 数据不可信：在进入状态层前归一为判别联合，缺失图片永远不会写成 undefined。 */
export function normalizeRunEvent(value: unknown): RunEvent {
  if (!value || typeof value !== "object") throw new Error("运行事件格式无效");
  const raw = value as Record<string, unknown>;
  const seq = optionalFiniteNumber(raw.seq);
  if (raw.type === "done") return { type: "done", ...(seq !== undefined ? { seq } : {}) };
  if (raw.type === "run-error") {
    return {
      type: "run-error",
      error: optionalString(raw.error) ?? "运行失败",
      ...(optionalString(raw.nodeId) ? { nodeId: optionalString(raw.nodeId) } : {}),
      ...(optionalFiniteNumber(raw.finishedAt) !== undefined ? { finishedAt: optionalFiniteNumber(raw.finishedAt) } : {}),
      ...(seq !== undefined ? { seq } : {}),
    };
  }
  if (raw.type !== "node-status") throw new Error("运行事件类型无效");
  const nodeId = optionalString(raw.nodeId);
  if (!nodeId) throw new Error("运行事件缺少节点标识");
  const common: RunEventMeta = {
    ...(seq !== undefined ? { seq } : {}),
    ...(optionalString(raw.error) ? { error: optionalString(raw.error) } : {}),
    ...(optionalString(raw.model) ? { model: optionalString(raw.model) } : {}),
    ...(stringArray(raw.prompts) ? { prompts: stringArray(raw.prompts) } : {}),
    ...(nullableStringArray(raw.providerOutputSizes)
      ? { providerOutputSizes: nullableStringArray(raw.providerOutputSizes) }
      : {}),
    ...(runFailures(raw.failures) ? { failures: runFailures(raw.failures) } : {}),
    ...(optionalFiniteNumber(raw.startedAt) !== undefined ? { startedAt: optionalFiniteNumber(raw.startedAt) } : {}),
    ...(optionalFiniteNumber(raw.finishedAt) !== undefined ? { finishedAt: optionalFiniteNumber(raw.finishedAt) } : {}),
  };
  if (raw.status === "success") {
    return { ...common, type: "node-status", nodeId, status: "success", images: stringArray(raw.images) ?? [] };
  }
  if (raw.status === "error" || raw.status === "outcome_unknown" || raw.status === "cancelled") {
    const { error: commonError, ...meta } = common;
    const fallback = raw.status === "cancelled" ? "任务已取消" : raw.status === "outcome_unknown" ? "生成结果未知" : "生成失败";
    return { ...meta, type: "node-status", nodeId, status: raw.status, error: commonError ?? fallback };
  }
  if (raw.status === "queued" || raw.status === "running" || raw.status === "retry_wait" || raw.status === "cancel_requested") {
    return { ...common, type: "node-status", nodeId, status: raw.status };
  }
  throw new Error("运行事件状态无效");
}

/** 单一节点回写规则：失败保留旧图片，只有成功事件可以替换 outputImages。 */
export function applyRunEventToNode(
  data: WorkflowNodeData,
  event: NodeStatusRunEvent,
): WorkflowNodeData {
  if (event.status === "success") {
    return {
      ...data,
      ...(data.kind !== "image-input" && data.kind !== "result" ? { outputImages: event.images } : {}),
      status: "success",
      error: event.error,
    } as WorkflowNodeData;
  }
  return {
    ...data,
    status: event.status,
    error: event.error,
  } as WorkflowNodeData;
}

function recordPrompt(data: WorkflowNodeData): string | undefined {
  if ("prompt" in data && typeof data.prompt === "string" && data.prompt.trim()) {
    return data.prompt.trim();
  }
  return undefined;
}

export function requestedResultCount(data: WorkflowNodeData): number {
  switch (data.kind) {
    case "sketch-to-render":
    case "ai-modify":
      return Math.max(1, Math.min(8, Number(data.batchSize) || 1));
    case "print-mutate":
      return Math.max(1, Math.min(8, Number(data.count) || 1));
    case "fabric-recolor":
      return Math.max(1, Math.min(8, data.colors.length || 1));
    case "mask-redraw":
      return 1;
    default:
      return 1;
  }
}

function pendingResultCardId(recordId: string, index: number): string {
  return `${recordId}:pending:${index}`;
}

export function createQueuedResultCards(initial: RecentResult, count: number): RecentResult[] {
  const requestedCount = Math.max(1, Math.min(8, Math.floor(count) || 1));
  return Array.from({ length: requestedCount }, (_, index) => ({
    ...initial,
    id: index === 0 ? initial.id : pendingResultCardId(initial.id, index),
    requestedCount,
  }));
}

function terminalResultCardId(recordId: string, kind: "image" | "failure", index: number): string {
  return `${recordId}:terminal:${kind}:${index}`;
}

/** 用一次后端事件更新点击时创建的主卡片，并为额外图片/部分失败追加卡片。 */
export function applyRunEventToRecentResults(
  records: RecentResult[],
  recordId: string,
  event: RunEvent,
): RecentResult[] {
  if (event.type !== "node-status") return records;
  const current = records.find((record) => record.id === recordId);
  if (!current) return records;
  const pendingPrefix = `${recordId}:pending:`;
  const terminalPrefix = `${recordId}:terminal:`;
  const isBatchSibling = (record: RecentResult) =>
    record.id === recordId ||
    record.id.startsWith(pendingPrefix) ||
    record.id.startsWith(terminalPrefix) ||
    (Boolean(current.runId) && record.runId === current.runId);
  if (isNodeRunActive(event.status)) {
    const status = event.status;
    return records.map((record) =>
      isBatchSibling(record)
        ? {
            ...record,
            status,
            error: event.error,
            model: event.model ?? record.model,
            startedAt: event.startedAt ?? record.startedAt,
          }
        : record,
    );
  }
  if (!isNodeRunTerminal(event.status)) return records;

  const startedAt = event.startedAt ?? current.startedAt;
  const finishedAt = event.finishedAt ?? Date.now();
  const { providerOutputSize: _previousProviderOutputSize, ...currentWithoutProviderOutputSize } = current;
  const base = {
    ...currentWithoutProviderOutputSize,
    model: event.model ?? current.model,
    startedAt,
    finishedAt,
  };
  const images = event.images ?? [];
  const failures = event.failures ?? [];
  const targetCount = Math.max(1, Math.min(8,
    current.requestedCount ?? Math.max(images.length + failures.length, 1),
  ));
  const terminalCards: RecentResult[] = [];

  for (let index = 0; index < Math.min(images.length, targetCount); index += 1) {
    terminalCards.push({
      ...base,
      id: index === 0 ? recordId : terminalResultCardId(recordId, "image", index),
      image: images[index],
      thumbnail: undefined,
      prompt: event.prompts?.[index] ?? current.prompt,
      ...(event.providerOutputSizes?.[index]
        ? { providerOutputSize: event.providerOutputSizes[index] as string }
        : {}),
      status: "success",
      error: undefined,
    });
  }

  let failureIndex = 0;
  while (terminalCards.length < targetCount) {
    const failure = failures[failureIndex];
    const cardIndex = terminalCards.length;
    terminalCards.push({
      ...base,
      id: cardIndex === 0 ? recordId : terminalResultCardId(recordId, "failure", failureIndex),
      image: "",
      thumbnail: undefined,
      prompt: failure?.prompt ?? current.prompt,
      status: event.status === "success" ? "error" : event.status,
      error: failure?.error || event.error || (images.length > 0 ? "未返回图片" : "运行完成但未返回图片"),
    });
    failureIndex += 1;
  }

  const next: RecentResult[] = [];
  let inserted = false;
  for (const record of records) {
    if (isBatchSibling(record)) {
      if (!inserted) {
        next.push(...terminalCards);
        inserted = true;
      }
      continue;
    }
    next.push(record);
  }
  return trimRecentResults(next);
}

/**
 * 最近结果是展示列表，也是活动 Run 的付费去重门禁。裁剪时可以丢旧终态，
 * 但绝不能丢仍在后端执行的记录；活动记录超过展示上限时宁可临时扩容。
 */
export function trimRecentResults(
  records: RecentResult[],
  limit = 200,
): RecentResult[] {
  const activeCount = records.reduce(
    (count, record) => count + (isNodeRunActive(record.status) ? 1 : 0),
    0,
  );
  let terminalBudget = Math.max(0, limit - activeCount);
  return records.filter((record) => {
    if (isNodeRunActive(record.status)) return true;
    if (terminalBudget <= 0) return false;
    terminalBudget -= 1;
    return true;
  });
}

/** 合并服务器历史与请求期间新增的本地记录；同 id 以服务器终态为准。 */
export function mergeRecentResults(
  current: RecentResult[],
  incoming: RecentResult[],
  limit = 200,
): RecentResult[] {
  const incomingById = new Map(incoming.map((record) => [record.id, record]));
  const currentIds = new Set(current.map((record) => record.id));
  return trimRecentResults([
    ...current.map((record) => incomingById.get(record.id) ?? record),
    ...incoming.filter((record) => !currentIds.has(record.id)),
  ], limit);
}

function pruneResultReferences(
  tab: ProjectTab,
  validIds: Set<string>,
  comparableIds: Set<string>,
): ProjectTab {
  const selectedResultId = tab.selectedResultId && validIds.has(tab.selectedResultId)
    ? tab.selectedResultId
    : null;
  const compareIds = tab.compareIds.filter((id, index, ids) => (
    comparableIds.has(id) && ids.indexOf(id) === index
  )).slice(0, 4);
  if (selectedResultId === tab.selectedResultId && sameStringList(compareIds, tab.compareIds)) {
    return tab;
  }
  return { ...tab, selectedResultId, compareIds };
}

/**
 * recentResults 与所有页签引用必须在同一个 Zustand snapshot 中变化，避免
 * Inspector/CompareOverlay 短暂观察到已不存在的结果 ID。
 */
export function recentResultsPatch(
  state: FlowState,
  recentResults: RecentResult[],
): Partial<FlowState> {
  const validIds = new Set(recentResults.map((record) => record.id));
  const comparableIds = new Set(
    recentResults
      .filter((record) => record.status === "success" && Boolean(record.image))
      .map((record) => record.id),
  );
  const activeSnapshot = snapshotActiveTab(state);
  let referencesChanged = false;
  const tabs = state.tabs.map((tab) => {
    const source = tab.id === state.activeTabId ? activeSnapshot : tab;
    const pruned = pruneResultReferences(source, validIds, comparableIds);
    if (pruned !== source) referencesChanged = true;
    return pruned;
  });
  if (!referencesChanged) return { recentResults };
  const activeTab = tabs.find((tab) => tab.id === state.activeTabId);
  return {
    recentResults,
    tabs,
    selectedResultId: activeTab?.selectedResultId ?? null,
    compareIds: activeTab?.compareIds ?? [],
  };
}

/**
 * 首屏历史确认后，用服务端仍在运行的记录恢复节点；会话里没有后端 Run 的
 * queued/running 属于刷新中断的孤儿状态，必须解除，避免页签永久卡死。
 */
export function reconcileRunHistory(records: RecentResult[]): void {
  const activeByNode = new Map<string, RecentResult>();
  const confirmedActiveRunIds = new Set<string>();
  const uniqueRecordsById = new Map<string, RecentResult>();
  for (const record of records) {
    uniqueRecordsById.set(record.id, record);
    if (record.projectId && record.clientRequestId) {
      const requestKey = runSubmissionKey(record.projectId, record.nodeId);
      if (ambiguousRunRequestIds.get(requestKey) === record.clientRequestId) {
        clearAmbiguousRunRequest(requestKey);
      }
    }
    if (!record.projectId || !isNodeRunActive(record.status) || !record.runId) continue;
    confirmedActiveRunIds.add(record.runId);
    const key = `${record.projectId}\u0000${record.nodeId}`;
    const existing = activeByNode.get(key);
    if (!existing || existing.startedAt < record.startedAt) activeByNode.set(key, record);
  }
  runWithoutHistory(() => {
    useFlowStore.setState((state) => {
      const syncedTabs = replaceTab(state.tabs, snapshotActiveTab(state));
      const tabs = syncedTabs.map((tab) => ({
        ...tab,
        nodes: tab.nodes.map((node) => {
          const active = activeByNode.get(`${tab.projectId}\u0000${node.id}`);
          if (active) {
            return {
              ...node,
              data: { ...node.data, status: active.status, error: active.error } as WorkflowNodeData,
            };
          }
          if (!isNodeRunActive(node.data.status)) return node;
          const data = { ...node.data, status: "idle" as const } as WorkflowNodeData;
          delete data.error;
          return { ...node, data };
        }),
      }));
      const activeTab = tabs.find((tab) => tab.id === state.activeTabId) ?? tabs[0];
      const retainedResults = state.recentResults.filter((record) =>
        !isNodeRunActive(record.status) ||
        (Boolean(record.runId) && confirmedActiveRunIds.has(record.runId!)),
      );
      const runtimeState = {
        ...state,
        tabs,
        ...(activeTab ? activeFields(activeTab) : {}),
      };
      const resultPatch = recentResultsPatch(
        runtimeState,
        mergeRecentResults(retainedResults, [...uniqueRecordsById.values()]),
      );
      return {
        tabs,
        ...(activeTab ? activeFields(activeTab) : {}),
        ...resultPatch,
      };
    });
  });
}

export function appendSavedAsset(current: string[] | undefined, url: string): string[] {
  const existing = current ?? [];
  return existing.includes(url) ? existing : [...existing, url];
}

function responseErrorMessage(status: number, body: unknown): string {
  if (typeof body === "object" && body !== null && "error" in body) {
    const error = (body as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) return error;
  }
  return `HTTP ${status}`;
}

/** 等待后端 DAG Run 的 SSE 终态；事件自身可重放，因此晚连接不会丢状态。 */
function consumeRunEvents(
  runId: string,
  targetNodeId: string,
  onEvent: (event: RunEvent) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const source = new EventSource(`/api/run-plan/${encodeURIComponent(runId)}/events`);
    const seenEvents = new Set<string>();
    let lastSeq = 0;
    let targetTerminalSeen = false;
    // 绝对兜底上限覆盖 8 色/多批次串行重试的最坏合法耗时。
    const timeout = window.setTimeout(
      () => finish(new Error("运行状态等待超时，请稍后在项目中确认结果")),
      2 * 60 * 60 * 1000,
    );
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      source.close();
      if (error) reject(error);
      else resolve();
    };
    source.onmessage = (message) => {
      try {
        if (message.lastEventId && seenEvents.has(message.lastEventId)) return;
        const event = normalizeRunEvent(JSON.parse(message.data) as unknown);
        if (event.seq !== undefined && event.seq <= lastSeq) return;
        if (message.lastEventId) seenEvents.add(message.lastEventId);
        if (event.seq !== undefined) lastSeq = event.seq;
        onEvent(event);
        if (
          event.type === "node-status" &&
          event.nodeId === targetNodeId &&
          isNodeRunTerminal(event.status)
        ) {
          targetTerminalSeen = true;
        }
        if (event.type === "done") {
          finish(targetTerminalSeen ? undefined : new Error("运行已结束，但目标节点未返回终态"));
        }
        if (event.type === "run-error") finish(new Error(event.error || "运行失败"));
      } catch {
        finish(new Error("运行事件格式无效"));
      }
    };
    source.onerror = () => {
      // 保留原生 EventSource 重连；服务端按 Last-Event-ID 只重放尚未收到的事件。
      // 超过总等待时限才失败，避免瞬时断网导致用户重复发起付费任务。
    };
  });
}

function updateTabFromRunEvent(
  set: (partial: Partial<FlowState> | ((state: FlowState) => Partial<FlowState>)) => unknown,
  tabId: string,
  nodeId: string,
  event: NodeStatusRunEvent,
): void {
  const commitsOutput = event.status === "success" && event.images.length > 0;
  const updateNodes = (nodes: FlowNode[]) => nodes.map((node) =>
    node.id === nodeId ? { ...node, data: applyRunEventToNode(node.data, event) } : node,
  );
  if (commitsOutput && useFlowStore.getState().activeTabId === tabId) {
    commitDocumentMutationWithSet(set, (state) => ({ nodes: updateNodes(state.nodes) }));
    return;
  }
  const update = () => updateTabNodes(
    set,
    tabId,
    updateNodes,
    { markDirty: commitsOutput },
  );
  if (commitsOutput) update();
  else runWithoutHistory(update);
}

export const useFlowStore = create<FlowState>()(
  temporal<FlowState, [], [], FlowTemporalState>(
    (set, get) => {
      const restored = typeof window === "undefined" ? undefined : loadTabSession();
      const initialTab =
        restored?.tabs.find((tab) => tab.id === restored.activeTabId) ?? newTab();
      const saveTab = async (tabId: string): Promise<SaveTabResult> => {
        const firstSnapshot = documentForTab(get(), tabId);
        if (!firstSnapshot || firstSnapshot.readOnly) {
          return { ok: false, error: "项目不存在或当前页签为只读" };
        }

        const existing = saveQueueByTab.get(tabId);
        if (existing) {
          existing.queued = true;
          return existing.promise;
        }

        const queue: TabSaveQueue = { promise: Promise.resolve({ ok: false }), queued: false };
        queue.promise = (async () => {
          let saved = false;
          do {
            queue.queued = false;
            const snapshot = documentForTab(get(), tabId);
            if (!snapshot || snapshot.readOnly) {
              return { ok: false, error: "项目不存在或当前页签为只读" };
            }
            patchTab(set, tabId, { saveState: "saving" });
            try {
              const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: snapshot.projectId,
                  name: snapshot.projectName,
                  flow: {
                    schemaVersion: WORKFLOW_SCHEMA_VERSION,
                    nodes: snapshot.nodes,
                    edges: snapshot.edges,
                  },
                }),
              });
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(responseErrorMessage(res.status, body));
              }
              saved = true;
              patchTab(set, tabId, (latest) => {
                const clean = latest.revision === snapshot.revision;
                if (!clean) queue.queued = true;
                return {
                  savedRevision: Math.max(latest.savedRevision, snapshot.revision),
                  dirty: !clean,
                  saveState: clean ? "saved" : "saving",
                };
              });
            } catch (error) {
              queue.queued = false;
              patchTab(set, tabId, (latest) => ({
                saveState: "error",
                dirty: latest.revision !== latest.savedRevision,
              }));
              return {
                ok: false,
                error: error instanceof Error ? error.message : String(error),
              };
            }
          } while (queue.queued);
          return { ok: saved };
        })();
        saveQueueByTab.set(tabId, queue);
        try {
          return await queue.promise;
        } finally {
          if (saveQueueByTab.get(tabId) === queue) saveQueueByTab.delete(tabId);
        }
      };
      return ({
        tabs: restored?.tabs ?? [initialTab],
        activeTabId: initialTab.id,
        ...activeFields(initialTab),
        tabSessionPersistenceError: null,
        pendingMaskWorkCount: 0,
        // 服务端历史在登录成功后注入；不能从浏览器本地缓存恢复其他账号的记录。
        recentResults: [],
        viewer: null,

      switchTab: (tabId) => {
        const initialState = get();
        if (tabId === initialState.activeTabId) return;
        if (!initialState.tabs.some((tab) => tab.id === tabId)) return;
        cancelHistoryTransaction();
        const state = get();
        const target = state.tabs.find((tab) => tab.id === tabId);
        if (!target) return;
        stashActiveTemporalHistory(state.activeTabId);
        const current = snapshotActiveTab(state);
        set({
          tabs: replaceTab(state.tabs, current),
          activeTabId: target.id,
          ...activeFields(target),
          viewer: null,
        });
        restoreTemporalHistory(target.id);
      },
      closeTab: (tabId) => {
        const initialState = get();
        const initialTabs = replaceTab(initialState.tabs, snapshotActiveTab(initialState));
        const initialClosingTab = initialTabs.find((tab) => tab.id === tabId);
        if (!initialClosingTab) return;
        const closingTab = initialClosingTab;
        if (closingTab.nodes.some((node) => isNodeRunActive(node.data.status))) {
          return;
        }
        cancelHistoryTransaction();
        const state = get();
        const current = snapshotActiveTab(state);
        const syncedTabs = replaceTab(state.tabs, current);
        const closingIndex = syncedTabs.findIndex((tab) => tab.id === tabId);
        if (closingIndex < 0) return;
        const remaining = syncedTabs.filter((tab) => tab.id !== tabId);
        if (remaining.length === 0) remaining.push(newTab());
        if (tabId !== state.activeTabId) {
          temporalHistoryByTab.delete(tabId);
          set({ tabs: remaining });
          return;
        }
        temporalHistoryByTab.delete(tabId);
        const target = remaining[Math.min(closingIndex, remaining.length - 1)];
        set({
          tabs: remaining,
          activeTabId: target.id,
          ...activeFields(target),
          viewer: null,
        });
        restoreTemporalHistory(target.id);
      },
      openFlowTab: ({ projectId, projectName, nodes, edges, markDirty = false, readOnly = false }) => {
        cancelHistoryTransaction();
        const state = get();
        const current = snapshotActiveTab(state);
        const syncedTabs = replaceTab(state.tabs, current);
        const applyActiveHistory = (inputNodes: FlowNode[]) => {
          const activeByNode = latestActiveRecordsByNode(state.recentResults, projectId);
          return inputNodes.map((node) => {
            const active = activeByNode.get(node.id);
            return active
              ? {
                ...node,
                data: { ...node.data, status: active.status, error: active.error } as WorkflowNodeData,
              }
              : node;
          });
        };
        const found = syncedTabs.find((tab) => tab.projectId === projectId);
        const existing = found ? { ...found, nodes: applyActiveHistory(found.nodes) } : undefined;
        if (existing) {
          const switchesTab = existing.id !== state.activeTabId;
          if (switchesTab) stashActiveTemporalHistory(state.activeTabId);
          const tabs = replaceTab(syncedTabs, existing);
          set({
            tabs,
            activeTabId: existing.id,
            ...activeFields(existing),
            viewer: null,
          });
          if (switchesTab) restoreTemporalHistory(existing.id);
        } else {
          stashActiveTemporalHistory(state.activeTabId);
          const tab = newTab({
            projectId, projectName, nodes: applyActiveHistory(nodes), edges, markDirty, readOnly,
          });
          set({
            tabs: [...syncedTabs, tab],
            activeTabId: tab.id,
            ...activeFields(tab),
            viewer: null,
          });
          temporalHistoryByTab.delete(tab.id);
          restoreTemporalHistory(tab.id);
        }
      },
      createBlankTab: () => {
        cancelHistoryTransaction();
        const tab = newTab();
        const state = get();
        stashActiveTemporalHistory(state.activeTabId);
        set({
          tabs: [...replaceTab(state.tabs, snapshotActiveTab(state)), tab],
          activeTabId: tab.id,
          ...activeFields(tab),
          viewer: null,
        });
        temporalHistoryByTab.delete(tab.id);
        restoreTemporalHistory(tab.id);
      },

      setProjectName: (name) => {
        if (get().readOnly) return;
        if (name === get().projectName) return;
        commitDocumentMutationWithSet(set, { projectName: name });
      },
      setSelectedNodeIds: (ids) => {
        runWithoutHistory(() => {
          set((state) => {
            const selection = normalizeNodeSelection(state.nodes, ids);
            if (
              sameStringList(selection.selectedNodeIds, state.selectedNodeIds) &&
              selection.nodes === state.nodes &&
              state.selectedResultId === null
            ) return {};
            return { ...selection, selectedResultId: null };
          });
        });
      },
      setSelectedNodeId: (id) => get().setSelectedNodeIds(id ? [id] : []),
      setSelectedResultId: (id) => {
        const nextId = id && get().recentResults.some((record) => record.id === id) ? id : null;
        runWithoutHistory(() => {
          set((state) => ({
            ...normalizeNodeSelection(state.nodes, []),
            selectedResultId: nextId,
          }));
        });
      },
      toggleCompareId: (id) => {
        const comparableIds = new Set(
          get().recentResults
            .filter((record) => record.status === "success" && Boolean(record.image))
            .map((record) => record.id),
        );
        const cur = get().compareIds.filter((candidate, index, ids) => (
          comparableIds.has(candidate) && ids.indexOf(candidate) === index
        ));
        if (!comparableIds.has(id)) {
          if (!sameStringList(cur, get().compareIds)) set({ compareIds: cur });
          return;
        }
        if (cur.includes(id)) {
          runWithoutHistory(() => set({ compareIds: cur.filter((c) => c !== id) }));
        } else if (cur.length < 4) {
          runWithoutHistory(() => set((state) => ({
            compareIds: [...cur, id],
            selectedResultId: null,
            ...normalizeNodeSelection(state.nodes, []),
          })));
        } else if (typeof window !== "undefined") {
          window.alert("最多选择 4 张图片进行对比");
        }
      },
      clearCompare: () => runWithoutHistory(() => set({ compareIds: [] })),
      removeRecentResult: (id) => {
        runWithoutHistory(() => set((state) => recentResultsPatch(
          state,
          state.recentResults.filter((record) => record.id !== id),
        )));
      },
      openViewer: (v) => set({ viewer: v }),
      closeViewer: () => set({ viewer: null }),

      onNodesChange: (changes) => {
        const state = get();
        const allowed = state.readOnly ? changes.filter((change) => change.type === "select" || change.type === "dimensions") : changes;
        const nodes = applyNodeChanges(allowed, state.nodes);
        if (nodes === state.nodes) return;
        const selection = normalizeNodeSelection(
          nodes,
          selectionIdsAfterNodeChanges(state.selectedNodeIds, nodes, allowed),
        );
        const patch = {
          ...selection,
          ...(selection.selectedNodeIds.length > 0 ? { selectedResultId: null } : {}),
        };
        const changesDocument = allowed.some(
          (change) => change.type !== "select" && change.type !== "dimensions",
        );
        const onlyMovesNodes = changesDocument && allowed.every(
          (change) => change.type === "select" || change.type === "dimensions" || change.type === "position",
        );
        if (changesDocument) {
          commitDocumentMutationWithSet(set, patch, {
            coalesceWithActiveTransaction: onlyMovesNodes,
          });
        }
        else runWithoutHistory(() => set(patch));
      },
      onEdgesChange: (changes) => {
        const allowed = get().readOnly ? changes.filter((change) => change.type === "select") : changes;
        const edges = applyEdgeChanges(allowed, get().edges);
        if (edges === get().edges) return;
        const changesDocument = allowed.some((change) => change.type !== "select");
        if (changesDocument) commitDocumentMutationWithSet(set, { edges });
        else runWithoutHistory(() => set({ edges }));
      },

      isValidConnection: (conn) => {
        if (!conn.source || !conn.target || conn.source === conn.target) return false;
        const target = get().nodes.find((n) => n.id === conn.target);
        if (!target) return false;
        const spec = NODE_SPECS[target.data.kind];
        const incoming = get().edges.filter((e) => e.target === conn.target);
        if (incoming.length >= spec.inputs) return false;
        // 同一来源+同一输入口不允许重复连线
        return !incoming.some(
          (e) => e.source === conn.source && (e.targetHandle ?? null) === (conn.targetHandle ?? null),
        );
      },

      onConnect: (conn) => {
        if (get().readOnly) return;
        if (!get().isValidConnection(conn)) return;
        commitDocumentMutationWithSet(set, { edges: addEdge(conn, get().edges) });
      },

      addNode: (kind, position) => {
        if (get().readOnly) return;
        const node: FlowNode = {
          id: nanoid(8),
          type: kind,
          position,
          data: defaultNodeData(kind),
        };
        const selection = normalizeNodeSelection([...get().nodes, node], [node.id]);
        commitDocumentMutationWithSet(set, { ...selection, selectedResultId: null });
      },

      addAssetNode: (asset, position) => {
        const state = get();
        if (state.readOnly) return null;
        const id = nanoid(8);
        const node: FlowNode = {
          id,
          type: "image-input",
          position,
          data: {
            ...defaultNodeData("image-input"),
            label: asset.name,
            status: "success",
            imageUrl: asset.image,
          } as ImageInputNodeData,
        };
        const selection = normalizeNodeSelection([...state.nodes, node], [id]);
        commitDocumentMutationWithSet(set, { ...selection, selectedResultId: null });
        return id;
      },

      addExistingNode: (node) => {
        if (get().readOnly) return;
        const selection = normalizeNodeSelection([...get().nodes, node], [node.id]);
        commitDocumentMutationWithSet(set, { ...selection, selectedResultId: null });
      },

      updateNodeData: (id, patch) => {
        if (get().readOnly) return;
        if (!get().nodes.some((n) => n.id === id)) return;
        commitDocumentMutationWithSet(set, {
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } as WorkflowNodeData } : n,
          ),
        });
      },
      updateNodeDataInTab: (tabId, id, patch) => {
        if (documentForTab(get(), tabId)?.readOnly) return;
        updateTabNodes(
          set,
          tabId,
          (nodes) => {
            if (!nodes.some((node) => node.id === id)) return nodes;
            return nodes.map((node) =>
              node.id === id
                ? { ...node, data: { ...node.data, ...patch } as WorkflowNodeData }
                : node,
            );
          },
          { markDirty: true },
        );
      },

      setNodeStatus: (id, status, error) =>
        (() => {
          runWithoutHistory(() => {
            set({
              nodes: get().nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, status, error } } : n,
              ),
            });
          });
        })(),

      runNode: async (id) => {
        // UI 禁用只是反馈层；所有付费运行仍必须在唯一 action 入口二次校验。
        if (getGenerationSafetyBlockReason()) return;
        const initialState = get();
        if (initialState.readOnly) return;
        const node = initialState.nodes.find((n) => n.id === id);
        if (
          !node ||
          isNodeRunActive(node.data.status) ||
          initialState.recentResults.some((record) =>
            record.projectId === initialState.projectId &&
            record.nodeId === id &&
            isNodeRunActive(record.status) &&
            Boolean(record.runId),
          )
        ) return;
        const kind = node.data.kind;
        const spec = NODE_SPECS[kind];
        if (!spec.providerId) return;

        const tabId = initialState.activeTabId;
        const preparationKey = runPreparationKey(tabId, id);
        const submissionKey = runSubmissionKey(initialState.projectId, id);
        if (runPreparations.has(preparationKey)) return;
        const preparation: RunPreparation = { cancelled: false };
        runPreparations.set(preparationKey, preparation);
        const localStartedAt = Date.now();
        const recordId = nanoid(8);
        const ambiguousClientRequestId = ambiguousRunRequestIds.get(submissionKey);
        const clientRequestId = ambiguousClientRequestId ?? nanoid(16);
        const retryingAmbiguousSubmission = ambiguousClientRequestId !== undefined;
        const requestedCount = requestedResultCount(node.data);
        let terminalRecorded = false;
        let knownRunId: string | undefined;

        // 先记录用户的这次生成操作，再请求后端；即使请求失败或页面刷新也不会丢记录。
        const initialRecord: RecentResult = {
          id: recordId,
          image: "",
          nodeId: id,
          nodeLabel: node.data.label,
          kind,
          projectId: initialState.projectId,
          projectName: initialState.projectName,
          prompt: recordPrompt(node.data),
          startedAt: localStartedAt,
          status: "queued",
          clientRequestId,
          requestedCount,
        };
        const queuedRecords = createQueuedResultCards(initialRecord, requestedCount);
        set((state) => recentResultsPatch(state, trimRecentResults([
            ...queuedRecords,
            ...initialState.recentResults,
          ])));

        try {
          runWithoutHistory(() => {
            updateTabNodes(set, tabId, (nodes) =>
              nodes.map((candidate) =>
                candidate.id === id
                  ? { ...candidate, data: { ...candidate.data, status: "queued", error: undefined } }
                  : candidate,
              ),
            );
          });
          // 付费动作严格绑定点击时的不可变快照；保存期间发生编辑时服务端会以 409 拒绝旧快照。
          const submissionSnapshot = documentForTab(get(), tabId);
          if (!submissionSnapshot) throw new Error("项目或节点已关闭，未调用生图服务");
          const saveResult = await saveTab(tabId);
          if (preparation.cancelled) {
            const event: NodeStatusRunEvent = {
              type: "node-status",
              nodeId: id,
              status: "cancelled",
              error: "已在调用生图服务前取消",
              startedAt: localStartedAt,
              finishedAt: Date.now(),
            };
            set((state) => recentResultsPatch(
              state,
              applyRunEventToRecentResults(state.recentResults, recordId, event),
            ));
            updateTabFromRunEvent(set, tabId, id, event);
            terminalRecorded = true;
            return;
          }
          if (!saveResult.ok) {
            throw new Error(`项目保存失败，未调用生图服务：${saveResult.error ?? "未知错误"}`);
          }
          if (!submissionSnapshot.nodes.some((candidate) => candidate.id === id)) {
            throw new Error("项目或节点已关闭，未调用生图服务");
          }
          let response: Response;
          try {
            response = await fetch("/api/run-plan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nodes: submissionSnapshot.nodes,
                edges: submissionSnapshot.edges,
                onlyNodeId: id,
                includeDownstream: false,
                projectId: submissionSnapshot.projectId,
                clientRequestId,
              }),
            });
          } catch (error) {
            rememberAmbiguousRunRequest(submissionKey, clientRequestId);
            const message = error instanceof Error ? error.message : String(error);
            throw new AmbiguousRunSubmissionError(`生成请求已发出，但响应未送达：${message}`);
          }
          let payload: { runId?: string; error?: string };
          try {
            payload = await response.json() as { runId?: string; error?: string };
          } catch {
            if (response.ok) {
              rememberAmbiguousRunRequest(submissionKey, clientRequestId);
              throw new AmbiguousRunSubmissionError("生成服务已接收请求，但返回内容无法确认");
            }
            payload = {};
          }
          if (
            !response.ok &&
            (response.status === 408 || (response.status === 409 && retryingAmbiguousSubmission))
          ) {
            rememberAmbiguousRunRequest(submissionKey, clientRequestId);
            throw new AmbiguousRunSubmissionError(
              `生成服务返回 HTTP ${response.status}，旧请求可能已创建任务但当前参数已变化`,
            );
          }
          if (!response.ok && response.status < 500) clearAmbiguousRunRequest(submissionKey);
          if (!response.ok && response.status >= 500) {
            rememberAmbiguousRunRequest(submissionKey, clientRequestId);
            throw new AmbiguousRunSubmissionError(
              `生成服务返回 HTTP ${response.status}，无法确认是否已创建任务`,
            );
          }
          if (response.ok && !payload.runId) {
            rememberAmbiguousRunRequest(submissionKey, clientRequestId);
            throw new AmbiguousRunSubmissionError("生成服务已接收请求，但未返回可确认的运行编号");
          }
          if (!response.ok || !payload.runId) {
            throw new Error(responseErrorMessage(response.status, payload));
          }
          clearAmbiguousRunRequest(submissionKey);
          knownRunId = payload.runId;

          set((state) => recentResultsPatch(
            state,
            state.recentResults.map((record) =>
              record.id === recordId || record.id.startsWith(`${recordId}:pending:`)
                ? { ...record, runId: payload.runId }
              : record,
            ),
          ));
          if (preparation.cancelled) {
            try {
              const cancelResponse = await fetch(
                `/api/run-plan/${encodeURIComponent(payload.runId)}/cancel`,
                { method: "POST" },
              );
              if (!cancelResponse.ok) {
                const body = await cancelResponse.json().catch(() => ({}));
                throw new Error(responseErrorMessage(cancelResponse.status, body));
              }
            } catch (cancelError) {
              const message = cancelError instanceof Error ? cancelError.message : String(cancelError);
              const event: NodeStatusRunEvent = {
                type: "node-status",
                nodeId: id,
                status: "cancel_requested",
                error: `取消请求失败：${message}；任务状态将继续同步`,
                startedAt: localStartedAt,
              };
              set((state) => recentResultsPatch(
                state,
                applyRunEventToRecentResults(state.recentResults, recordId, event),
              ));
              updateTabFromRunEvent(set, tabId, id, event);
            }
          }
          if (runPreparations.get(preparationKey) === preparation) {
            runPreparations.delete(preparationKey);
          }

          const runStatus = await fetch(`/api/run-plan/${encodeURIComponent(payload.runId)}`);
          if (!runStatus.ok) {
            throw new Error(
              runStatus.status === 404
                ? "服务已重启或运行状态已丢失，请重新发起任务"
                : `确认运行状态失败（HTTP ${runStatus.status}）`,
            );
          }

          await consumeRunEvents(payload.runId, id, (event) => {
            if (event.type !== "node-status" || event.nodeId !== id) return;
            set((state) => recentResultsPatch(
              state,
              applyRunEventToRecentResults(state.recentResults, recordId, event),
            ));
            updateTabFromRunEvent(set, tabId, id, event);
            if (isNodeRunTerminal(event.status)) terminalRecorded = true;
          });
        } catch (err) {
          if (!terminalRecorded) {
            const message = err instanceof Error ? err.message : String(err);
            const status: "cancel_requested" | "retry_wait" | "outcome_unknown" | "error" = knownRunId
              ? preparation.cancelled ? "cancel_requested" : "retry_wait"
              : err instanceof AmbiguousRunSubmissionError ? "outcome_unknown" : "error";
            const safeMessage = knownRunId
              ? `运行 ${knownRunId} 已创建，但状态同步中断：${message}；请刷新页面继续同步，勿重复提交`
              : err instanceof AmbiguousRunSubmissionError
                ? `${message}；再次点击会使用同一请求号安全确认，请勿新建重复任务`
                : message;
            const event: NodeStatusRunEvent = {
                type: "node-status",
                nodeId: id,
                status,
                error: safeMessage,
                startedAt: localStartedAt,
                ...(isNodeRunTerminal(status) ? { finishedAt: Date.now() } : {}),
              };
            set((state) => recentResultsPatch(
              state,
              applyRunEventToRecentResults(state.recentResults, recordId, event),
            ));
            updateTabFromRunEvent(set, tabId, id, event);
          }
        } finally {
          if (runPreparations.get(preparationKey) === preparation) {
            runPreparations.delete(preparationKey);
          }
        }
      },

      cancelNodeRun: async (id) => {
        const state = get();
        const active = state.recentResults.find((record) =>
          record.nodeId === id &&
          record.projectId === state.projectId &&
          isNodeRunActive(record.status),
        );
        if (!active?.runId) {
          const preparation = runPreparations.get(runPreparationKey(state.activeTabId, id));
          if (!active || !preparation || preparation.cancelled) return;
          preparation.cancelled = true;
          const event: NodeStatusRunEvent = {
            type: "node-status",
            nodeId: id,
            status: "cancel_requested",
            startedAt: active.startedAt,
          };
          set((current) => recentResultsPatch(
            current,
            applyRunEventToRecentResults(current.recentResults, active.id, event),
          ));
          updateTabFromRunEvent(set, state.activeTabId, id, event);
          return;
        }
        try {
          const response = await fetch(`/api/run-plan/${encodeURIComponent(active.runId)}/cancel`, { method: "POST" });
          if (response.ok) return;
          const body = await response.json().catch(() => ({}));
          throw new Error(responseErrorMessage(response.status, body));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          runWithoutHistory(() => {
            updateTabNodes(set, state.activeTabId, (nodes) => nodes.map((node) =>
              node.id === id
                ? { ...node, data: { ...node.data, error: `取消结果未知：${message}；任务状态将继续同步` } }
                : node,
            ));
          });
        }
      },

      saveProject: async () => (await saveTab(get().activeTabId)).ok,

      undo: () => {
        const temporalStore = useFlowStore.temporal.getState();
        if (temporalStore.pastStates.length === 0) return;
        const before = useFlowStore.getState();
        const beforeDocument: FlowTemporalState = {
          projectName: before.projectName,
          nodes: before.nodes,
          edges: before.edges,
        };
        const runtimeById = new Map(
          before.nodes.map((node) => [node.id, { status: node.data.status, error: node.data.error }]),
        );
        temporalStore.undo();
        let after = useFlowStore.getState();
        runWithoutHistory(() => {
          const nodes = after.nodes.map((node) => {
            const runtime = runtimeById.get(node.id);
            return runtime
              ? { ...node, data: { ...node.data, ...runtime } as WorkflowNodeData }
              : node;
          });
          useFlowStore.setState(normalizeNodeSelection(nodes, before.selectedNodeIds));
        });
        after = useFlowStore.getState();
        if (!sameTemporalDocument(beforeDocument, {
          projectName: after.projectName,
          nodes: after.nodes,
          edges: after.edges,
        })) {
          runWithoutHistory(() => useFlowStore.setState({
            revision: after.revision + 1,
            dirty: true,
            saveState: after.saveState === "saving" ? "saving" : "idle",
          }));
        }
      },
      redo: () => {
        const temporalStore = useFlowStore.temporal.getState();
        if (temporalStore.futureStates.length === 0) return;
        const before = useFlowStore.getState();
        const beforeDocument: FlowTemporalState = {
          projectName: before.projectName,
          nodes: before.nodes,
          edges: before.edges,
        };
        const runtimeById = new Map(
          before.nodes.map((node) => [node.id, { status: node.data.status, error: node.data.error }]),
        );
        temporalStore.redo();
        let after = useFlowStore.getState();
        runWithoutHistory(() => {
          const nodes = after.nodes.map((node) => {
            const runtime = runtimeById.get(node.id);
            return runtime
              ? { ...node, data: { ...node.data, ...runtime } as WorkflowNodeData }
              : node;
          });
          useFlowStore.setState(normalizeNodeSelection(nodes, before.selectedNodeIds));
        });
        after = useFlowStore.getState();
        if (!sameTemporalDocument(beforeDocument, {
          projectName: after.projectName,
          nodes: after.nodes,
          edges: after.edges,
        })) {
          runWithoutHistory(() => useFlowStore.setState({
            revision: after.revision + 1,
            dirty: true,
            saveState: after.saveState === "saving" ? "saving" : "idle",
          }));
        }
      },

      loadFlow: ({ projectId, projectName, nodes, edges, markDirty = false }) => {
        cancelHistoryTransaction();
        const state = get();
        const activeByNode = latestActiveRecordsByNode(state.recentResults, projectId);
        const loadedNodes = nodes.map((node) => {
          const active = activeByNode.get(node.id);
          return active
            ? {
              ...node,
              data: { ...node.data, status: active.status, error: active.error } as WorkflowNodeData,
            }
            : node;
        });
        const selection = normalizeNodeSelection(loadedNodes, []);
        const tab: ProjectTab = {
          ...snapshotActiveTab(state),
          projectId,
          projectName,
          readOnly: false,
          nodes: selection.nodes,
          edges,
          selectedNodeIds: selection.selectedNodeIds,
          selectedNodeId: selection.selectedNodeId,
          selectedResultId: null,
          compareIds: [],
          saveState: "idle",
          revision: markDirty ? 1 : 0,
          savedRevision: 0,
          dirty: markDirty,
          documentEpoch: state.documentEpoch + 1,
        };
        set({ tabs: replaceTab(state.tabs, tab), ...activeFields(tab), viewer: null });
        // 清空撤销历史，避免撤销回上一个项目的画布状态
        temporalHistoryByTab.delete(state.activeTabId);
        useFlowStore.temporal.getState().clear();
      },
    });
    },
    {
      limit: DOCUMENT_HISTORY_LIMIT,
      partialize: (state): FlowTemporalState => ({
        projectName: state.projectName,
        nodes: state.nodes,
        edges: state.edges,
      }),
      equality: sameTemporalDocument,
      handleSet: (handleSet) => {
        // zundo 2.2 的公开类型把内部 recorder 标成 Zustand setState，运行时契约
        // 实际为 (past, replace, current, delta)；Context7 与本地实现均已核对。
        const saveHistory = handleSet as unknown as (
          pastState: FlowTemporalState,
          replace: boolean | undefined,
          currentState: FlowTemporalState,
          deltaState?: Partial<FlowTemporalState> | null,
        ) => void;
        recordHistoryEntry = (pastState, currentState) => {
          saveHistory(pastState, undefined, currentState);
        };
        return (pastState, replace, currentState, deltaState) => {
          if (historySuppressionDepth > 0 || activeHistoryTransaction) return;
          saveHistory(
            pastState as unknown as FlowTemporalState,
            replace,
            currentState,
            deltaState,
          );
        };
      },
    },
  ),
);

/**
 * 登记不会进入项目快照的蒙版临时工作。返回值可重复调用，确保 React effect
 * cleanup 与异步 finally 竞态时不会把计数减成负数。
 */
export function beginMaskWork(): () => void {
  useFlowStore.setState((state) => ({
    pendingMaskWorkCount: state.pendingMaskWorkCount + 1,
  }));
  let released = false;
  return () => {
    if (released) return;
    released = true;
    useFlowStore.setState((state) => ({
      pendingMaskWorkCount: Math.max(0, state.pendingMaskWorkCount - 1),
    }));
  };
}

let retryTabSessionPersistenceImpl = (): boolean => false;

/** 用户显式重试当前完整页签快照；返回本次是否成功写入浏览器会话。 */
export function retryTabSessionPersistence(): boolean {
  return retryTabSessionPersistenceImpl();
}

if (typeof window !== "undefined") {
  let lastTabSessionJson = "";
  let tabSessionPersistenceDeferred = false;
  const sessionFingerprint = (state: FlowState): string => {
    try {
      const current = snapshotActiveTab(state);
      return JSON.stringify({
        tabs: replaceTab(state.tabs, current),
        activeTabId: state.activeTabId,
      });
    } catch {
      return "";
    }
  };
  const publishPersistenceResult = (result: TabSessionWriteResult): void => {
    // 写失败时旧 key 已被移除；旧成功指纹也必须失效，否则用户撤销回那份
    // 恰好相同的状态时会被误判为“已经写过”，导致 session 仍为空。
    if (!result.ok) lastTabSessionJson = "";
    const nextError = result.ok ? null : result.error ?? TAB_SESSION_WRITE_ERROR;
    if (useFlowStore.getState().tabSessionPersistenceError !== nextError) {
      useFlowStore.setState({ tabSessionPersistenceError: nextError });
    }
  };
  flushDeferredTabSessionPersistence = () => {
    if (!tabSessionPersistenceDeferred || activeHistoryTransaction) return;
    tabSessionPersistenceDeferred = false;
    const state = useFlowStore.getState();
    const sessionJson = sessionFingerprint(state);
    if (sessionJson && sessionJson === lastTabSessionJson) return;
    const result = persistTabSession(state);
    if (result.ok) lastTabSessionJson = sessionJson;
    publishPersistenceResult(result);
  };
  retryTabSessionPersistenceImpl = () => {
    const state = useFlowStore.getState();
    // An explicit retry must not turn an in-flight drag frame into a durable,
    // apparently clean snapshot. The completed transaction will trigger a write.
    if (activeHistoryTransaction?.tabId === state.activeTabId) {
      tabSessionPersistenceDeferred = true;
      return false;
    }
    const sessionJson = sessionFingerprint(state);
    const result = persistTabSession(state);
    if (result.ok) lastTabSessionJson = sessionJson;
    publishPersistenceResult(result);
    return result.ok;
  };
  useFlowStore.subscribe((state, previousState) => {
    // Drag frames are live UI state until endHistoryTransaction commits their
    // final coordinates together with revision/dirty. Preserve the last durable
    // snapshot so a crash/refresh during the drag restores the pre-drag document.
    if (activeHistoryTransaction?.tabId === state.activeTabId) {
      tabSessionPersistenceDeferred = true;
      return;
    }
    // 活动画布变化会由下一个订阅先同步进 tabs；历史/SSE/viewer 等全局状态无需序列化项目。
    if (state.tabs === previousState.tabs && state.activeTabId === previousState.activeTabId) return;
    const sessionJson = sessionFingerprint(state);
    if (sessionJson && sessionJson === lastTabSessionJson) return;
    const result = persistTabSession(state);
    if (result.ok) lastTabSessionJson = sessionJson;
    publishPersistenceResult(result);
  });
  const initialState = useFlowStore.getState();
  const initialResult = persistTabSession(initialState);
  if (initialResult.ok) lastTabSessionJson = sessionFingerprint(initialState);
  publishPersistenceResult(initialResult);

  // 当前页签内容持续同步进 tabs，保证非激活页签始终是完整快照。
  let lastActiveSnapshot = snapshotActiveTab(useFlowStore.getState());
  useFlowStore.subscribe((state) => {
    const snapshot = snapshotActiveTab(state);
    if (
      snapshot.id !== lastActiveSnapshot.id ||
      snapshot.projectId !== lastActiveSnapshot.projectId ||
      snapshot.projectName !== lastActiveSnapshot.projectName ||
      snapshot.readOnly !== lastActiveSnapshot.readOnly ||
      snapshot.nodes !== lastActiveSnapshot.nodes ||
      snapshot.edges !== lastActiveSnapshot.edges ||
      snapshot.selectedNodeIds !== lastActiveSnapshot.selectedNodeIds ||
      snapshot.selectedNodeId !== lastActiveSnapshot.selectedNodeId ||
      snapshot.selectedResultId !== lastActiveSnapshot.selectedResultId ||
      snapshot.compareIds !== lastActiveSnapshot.compareIds ||
      snapshot.saveState !== lastActiveSnapshot.saveState ||
      snapshot.revision !== lastActiveSnapshot.revision ||
      snapshot.savedRevision !== lastActiveSnapshot.savedRevision ||
      snapshot.dirty !== lastActiveSnapshot.dirty ||
      snapshot.documentEpoch !== lastActiveSnapshot.documentEpoch
    ) {
      lastActiveSnapshot = snapshot;
      const current = state.tabs.find((tab) => tab.id === snapshot.id);
      if (current && current !== snapshot) {
        useFlowStore.setState({ tabs: replaceTab(state.tabs, snapshot) });
      }
    }
  });
}

/** 登录后以服务器历史为准，恢复仍在当前服务进程中执行的任务。 */
export function resumeRecentResults(records: RecentResult[]): void {
  const resumable = records.filter(
    (record) =>
      isNodeRunActive(record.status) && Boolean(record.runId),
  );
  for (const record of resumable) {
    const runId = record.runId!;
    if (resumingRecentRunIds.has(runId)) continue;
    resumingRecentRunIds.add(runId);
    void (async () => {
      let terminalRecorded = false;
      try {
        const response = await fetch(`/api/run-plan/${encodeURIComponent(runId)}`);
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "服务已重启或恢复窗口已过，无法继续跟踪此任务"
              : `恢复任务失败（HTTP ${response.status}）`,
          );
        }
        await consumeRunEvents(runId, record.nodeId, (event) => {
          if (event.type !== "node-status" || event.nodeId !== record.nodeId) return;
          useFlowStore.setState((state) => recentResultsPatch(
            state,
            applyRunEventToRecentResults(state.recentResults, record.id, event),
          ));
          const tabId = useFlowStore
            .getState()
            .tabs.find((tab) => tab.projectId === record.projectId)?.id;
          if (tabId && event.status && isLatestTrackedRun(useFlowStore.getState().recentResults, record)) {
            updateTabFromRunEvent(useFlowStore.setState, tabId, record.nodeId, event);
          }
          if (isNodeRunTerminal(event.status)) terminalRecorded = true;
        });
      } catch (error) {
        if (terminalRecorded) return;
        const message = error instanceof Error ? error.message : String(error);
        const recoveryMessage = `运行 ${runId} 的状态同步中断：${message}；请稍后重试同步，勿重复提交`;
        useFlowStore.setState((state) => recentResultsPatch(
          state,
          applyRunEventToRecentResults(state.recentResults, record.id, {
            type: "node-status",
            nodeId: record.nodeId,
            status: "retry_wait",
            error: recoveryMessage,
            startedAt: record.startedAt,
          }),
        ));
        const tabId = useFlowStore
          .getState()
          .tabs.find((tab) => tab.projectId === record.projectId)?.id;
        if (tabId && isLatestTrackedRun(useFlowStore.getState().recentResults, record)) {
          updateTabFromRunEvent(useFlowStore.setState, tabId, record.nodeId, {
            type: "node-status",
            nodeId: record.nodeId,
            status: "retry_wait",
            error: recoveryMessage,
            startedAt: record.startedAt,
          });
        }
      } finally {
        // 成功、后端失败、恢复查询失败都必须释放，允许后续重试。
        resumingRecentRunIds.delete(runId);
      }
    })();
  }
}

/** 测试与外部恢复入口也必须复用同一套节点回写规则。 */
export function applyRunEventToTab(
  tabId: string,
  nodeId: string,
  event: NodeStatusRunEvent,
): void {
  updateTabFromRunEvent(useFlowStore.setState, tabId, nodeId, event);
}

/** 读取 result 节点聚合的上游图片（直接上游） */
export function selectResultImages(state: FlowState, nodeId: string): string[] {
  const urls: string[] = [];
  for (const e of state.edges) {
    if (e.target !== nodeId) continue;
    const src = state.nodes.find((n) => n.id === e.source);
    if (src) urls.push(...nodeOutputImages(src.data));
  }
  return urls;
}

/** 按连线顺序读取节点当前可见的上游图片，蒙版编辑器以第一张作为原图。 */
export function selectNodeInputImages(
  state: Pick<FlowState, "nodes" | "edges">,
  nodeId: string,
): string[] {
  const urls: string[] = [];
  for (const edge of state.edges) {
    if (edge.target !== nodeId) continue;
    const source = state.nodes.find((node) => node.id === edge.source);
    if (source) urls.push(...nodeOutputImages(source.data));
  }
  return urls;
}
