/**
 * flowTabSession：会话持久化纯层（从 flowStore.ts 拆出，第 4 步）。
 *
 * localStorage/sessionStorage 归一 + 读写快照 + 节点默认 data。
 * 零 zustand 闭包：loadTabSession / discardActiveTabSession 与保存队列留守 flowStore。
 */
import type { Edge } from "@xyflow/react";
import {
  BATCH_SIZES,
  NODE_SPECS,
  type NodeKind,
  type NodeRunStatus,
  type WorkflowNodeData,
} from "@/types/workflow";
import {
  DEFAULT_GENERATION_MODEL_ID,
  defaultImageModelOptions,
  isImageModelId,
  normalizeImageModelOptions,
} from "@/types/imageModels";
import {
  DEFAULT_VIDEO_MODEL_ID,
  isVideoModelId,
  videoModelRecommendedOptions,
  type VideoModelOptions,
} from "@/types/videoModels";
import { isRetiredImageModelId } from "@/types/retiredImageModels";
import {
  createDocumentSnapshot,
  documentSnapshotToPersistedWorkflow,
} from "@/lib/documentSnapshot";
import {
  clearUnreferencedProjectTabSessionStorage,
  PROJECT_TABS_STORAGE_KEY,
  PROJECT_TABS_STORAGE_SCHEMA_VERSION,
  parseProjectTabsStorageManifest,
  projectTabStorageKey,
  type ProjectTabsStorageManifest,
} from "@/lib/tabSessionStorage";
import type { FlowNode, ProjectLifecycle, ProjectTab } from "./flowDocument";

/** persistTabSession 的文档形态承接（tabs + activeTabId），避免循环 import flowStore。 */
export interface TabSessionDocument {
  tabs: ProjectTab[];
  activeTabId: string;
}

/**
 * v8 节点默认 data（七节点，单一事实源）。
 * 输入层只带契约字段（无生成字段，C2）；生成层只带功能绑定 + 模型参数（无产物字段，C3）；
 * 结果层带产物数组 + 溯源键（C5；溯源在 RunEvent 落地时填真实值）。
 */
export function defaultNodeData(kind: NodeKind): WorkflowNodeData {
  const spec = NODE_SPECS[kind];
  const base = { label: spec.title, status: "idle" as NodeRunStatus };
  switch (kind) {
    case "text":
      // R2：正文由文本节点承载；功能/参数/模型已上移到生成节点。
      return { ...base, kind, text: "" };
    case "image":
      return { ...base, kind, outputImages: [] };
    case "video":
      return { ...base, kind, outputVideos: [] };
    case "image-generator":
      // v9（64 裁决 C）：默认值在节点创建时物化；aspectRatio 缺省 1:1（裁决 C §10.3）。
      return {
        ...base, kind,
        aspectRatio: "1:1", batchSize: 1,
        modelId: DEFAULT_GENERATION_MODEL_ID,
        modelOptions: defaultImageModelOptions(DEFAULT_GENERATION_MODEL_ID, "1:1"),
      };
    case "video-generator":
      // R10：视频唯一模型 doubao-seedance-2-5-260628；首帧任务画幅必须 adaptive（C6）。
      return {
        ...base, kind,
        aspectRatio: "adaptive",
        modelId: DEFAULT_VIDEO_MODEL_ID,
        modelOptions: defaultVideoModelOptions(DEFAULT_VIDEO_MODEL_ID),
      };
    case "result-image":
      return { ...base, kind, images: [], sourceGeneratorId: "", runId: "" };
    case "result-video":
      return { ...base, kind, videos: [], sourceGeneratorId: "", runId: "" };
  }
}

/** 视频模型推荐参数的默认值（`videoModelRecommendedOptions` 是模型契约的事实源）。 */
export function defaultVideoModelOptions(modelId: string): VideoModelOptions {
  const options: VideoModelOptions = {};
  if (!isVideoModelId(modelId)) return options;
  for (const [key, spec] of Object.entries(videoModelRecommendedOptions(modelId))) {
    if (spec && spec.default !== undefined) options[key] = spec.default;
  }
  return options;
}

export const TAB_SESSION_STORAGE_KEY = PROJECT_TABS_STORAGE_KEY;
export const TAB_SESSION_SCHEMA_VERSION = PROJECT_TABS_STORAGE_SCHEMA_VERSION;

export interface PersistedTabSession {
  schemaVersion: typeof TAB_SESSION_SCHEMA_VERSION;
  tabs: ProjectTab[];
  activeTabId: string;
}

export interface TabSessionWriteResult {
  ok: boolean;
  error?: string;
  failedTabIds?: string[];
}

export const TAB_SESSION_WRITE_ERROR = "本地草稿未写入浏览器，请先保存项目或重新保存大蒙版；刷新会丢失本页修改";
export const TAB_SESSION_READ_ERROR = "浏览器暂时无法读取完整草稿；为避免覆盖恢复点，本页不再写入会话缓存，请刷新后重试";

const NODE_KINDS = new Set<NodeKind>(Object.keys(NODE_SPECS) as NodeKind[]);

/**
 * C2/C3：会话恢复时必须清空的生成层字段（v7 的 image/video/text 节点曾自描述这些）。
 * 清空后按 v9 分层重新填入，使会话草稿本身就是合法 v9 文档形状。
 * v9（64 Phase 3）：variant 绑定六字段保留在清理清单中——这是防御性 delete 语义
 * （旧 localStorage 会话数据可能仍携带 v7 字段），清理它们不等于写入；
 * v9 写入面不再产生这些字段，新会话数据天然无此六项。
 */
const SESSION_GENERATION_FIELDS = [
  "modelId", "modelOptions",
  "promptVariantId", "promptFamilyId", "parameterProfileId",
  "contractHash", "evaluationVersion", "postprocessVersion",
  "aspectRatio", "batchSize", "mask", "maskSourceRef", "featherRadius",
  // v7 的 image 节点曾自描述请求正文；v8+ 的正文只存在于 text 节点（生成节点由上游 text 供词）。
  "prompt",
  "outputText", "lastRunInput",
] as const;

const IMAGE_ASPECT_RATIOS: readonly string[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];

/** 只把「非空字符串」的可选绑定字段从会话数据搬进 v8 data（空串/脏值不写）。 */
function copyOptionalStrings(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  keys: readonly string[],
): void {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value) target[key] = value;
  }
}
const NODE_STATUSES = new Set<NodeRunStatus>([
  "idle", "queued", "running", "retry_wait", "cancel_requested",
  "success", "error", "outcome_unknown", "cancelled",
]);

export function finiteNonNegative(value: unknown, fallback: number): number {
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
export function normalizeSessionNode(value: unknown): FlowNode | undefined {
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
  // v7 删除字段族（retiredModel / modelSelectionNeedsConfirmation）
  // 不再参与会话归一：历史会话里的这些键直接丢弃。
  // 注：operationMode 在 v9 中是生成节点的合法字段（裁决 A），保留不删；
  // 输入/结果节点从 session 恢复时不会带 operationMode，删与不删等价。
  delete data.operationModeNeedsConfirmation;
  delete data.retiredModelId;
  delete data.modelSelectionNeedsConfirmation;

  // C2：输入节点不得携带任何生成字段（v7 的 image 节点曾自描述 modelId/promptVariantId/
  // aspectRatio/batchSize/mask/outputText…）。先统一清空生成字段，再按 v8 分层重新填入，
  // 保证会话恢复出来的文档形状本身就是 v8（不依赖保存时的投影兜底）。
  for (const key of SESSION_GENERATION_FIELDS) delete data[key];

  switch (kind) {
    case "text":
      data.text = typeof input.text === "string" ? input.text : "";
      break;
    case "image":
      data.outputImages = stringList(input.outputImages);
      // 65b：蒙版三字段随图片节点 data 会话恢复。
      if (typeof input.mask === "string" && input.mask) data.mask = input.mask;
      if (typeof input.maskSourceRef === "string" && input.maskSourceRef) data.maskSourceRef = input.maskSourceRef;
      if (typeof input.featherRadius === "number" && Number.isFinite(input.featherRadius)) {
        data.featherRadius = Math.max(0, Math.min(64, Math.round(input.featherRadius)));
      }
      break;
    case "video":
      data.outputVideos = stringList(input.outputVideos);
      break;
    case "image-generator": {
      // v9（64 Phase 2）：promptVariantId 已随概念删除，不再写入；operationMode 保留（裁决 A）。
      if (typeof input.operationMode === 'string' && (input.operationMode === "generate" || input.operationMode === "edit" || input.operationMode === "mask-edit")) {
        data.operationMode = input.operationMode;
      }
      const modelId: string = isImageModelId(input.modelId) && !isRetiredImageModelId(input.modelId)
        ? input.modelId
        : DEFAULT_GENERATION_MODEL_ID;
      data.modelId = modelId;
      // v9（64 裁决 C）：aspectRatio 缺省 1:1；意象比例不在枚举中则回落缺省。
      data.aspectRatio = typeof input.aspectRatio === "string" && IMAGE_ASPECT_RATIOS.includes(input.aspectRatio)
        ? input.aspectRatio
        : "1:1";
      data.batchSize = BATCH_SIZES.includes(Number(input.batchSize) as (typeof BATCH_SIZES)[number])
        ? Number(input.batchSize)
        : 1;
      data.modelOptions = normalizeImageModelOptions(
        modelId as Parameters<typeof normalizeImageModelOptions>[0],
        input.modelOptions,
      );
      // v9（64 Phase 2）：评估字段已随概念删除，不再从会话拷贝。
      break;
    }
    case "video-generator": {
      // v9（64 Phase 2）：promptVariantId 已随概念删除；operationMode 保留。
      if (typeof input.operationMode === 'string' && (input.operationMode === "generate" || input.operationMode === "edit" || input.operationMode === "mask-edit")) {
        data.operationMode = input.operationMode;
      }
      data.modelId = isVideoModelId(input.modelId) ? input.modelId : DEFAULT_VIDEO_MODEL_ID;
      // C6：首帧任务画幅必须 adaptive；会话恢复一律保守回落到 adaptive。
      data.aspectRatio = typeof input.aspectRatio === "string" && input.aspectRatio ? input.aspectRatio : "adaptive";
      const options: VideoModelOptions = {};
      if (typeof input.modelOptions === "object" && input.modelOptions !== null && !Array.isArray(input.modelOptions)) {
        for (const [key, entry] of Object.entries(input.modelOptions as Record<string, unknown>)) {
          if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
            options[key] = entry;
          }
        }
      }
      data.modelOptions = options;
      // v9（64 Phase 2）：评估字段已随概念删除，不再从会话拷贝。
      break;
    }
    case "result-image": {
      data.images = stringList(input.images);
      if (typeof input.thumbnail === "string" && input.thumbnail) data.thumbnail = input.thumbnail;
      data.sourceGeneratorId = typeof input.sourceGeneratorId === "string" ? input.sourceGeneratorId : "";
      data.runId = typeof input.runId === "string" ? input.runId : "";
      const outputSizes = Array.isArray(input.outputSizes)
        ? input.outputSizes.map((item) => (typeof item === "string" && item ? item : null))
        : undefined;
      if (outputSizes) data.outputSizes = outputSizes;
      if (typeof input.selectedIndex === "number" && Number.isSafeInteger(input.selectedIndex) && input.selectedIndex >= 0) {
        data.selectedIndex = input.selectedIndex;
      }
      break;
    }
    case "result-video": {
      data.videos = stringList(input.videos);
      data.sourceGeneratorId = typeof input.sourceGeneratorId === "string" ? input.sourceGeneratorId : "";
      data.runId = typeof input.runId === "string" ? input.runId : "";
      if (typeof input.selectedIndex === "number" && Number.isSafeInteger(input.selectedIndex) && input.selectedIndex >= 0) {
        data.selectedIndex = input.selectedIndex;
      }
      break;
    }
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

export function normalizeSessionEdge(
  value: unknown,
  nodesById: ReadonlyMap<string, FlowNode>,
): Edge | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== "string" || !raw.id ||
    typeof raw.source !== "string" || !nodesById.has(raw.source) ||
    typeof raw.target !== "string" || !nodesById.has(raw.target)
  ) return undefined;
  return {
    ...raw,
    id: raw.id,
    source: raw.source,
    target: raw.target,
    data: (typeof raw.data === "object" && raw.data !== null && !Array.isArray(raw.data)
      ? raw.data
      : {}) as Record<string, unknown>,
  } as Edge;
}

export function normalizeSessionTab(value: unknown): ProjectTab | undefined {
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
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const seenEdgeIds = new Set<string>();
  const edges = raw.edges.flatMap((edge): Edge[] => {
    const normalized = normalizeSessionEdge(edge, nodesById);
    if (!normalized || seenEdgeIds.has(normalized.id)) return [];
    seenEdgeIds.add(normalized.id);
    return [normalized];
  });
  const revision = finiteNonNegative(raw.revision, 0);
  const wasSaving = raw.saveState === "saving";
  const dirty = wasSaving || raw.dirty === true;
  const savedRevision = Math.min(finiteNonNegative(raw.savedRevision, 0), revision);
  const hasBeenPersisted = raw.hasBeenPersisted === true ||
    raw.saveState === "saved" ||
    savedRevision > 0;
  const lifecycle: ProjectLifecycle = raw.lifecycle === "initial_draft" ||
    raw.lifecycle === "saved" || raw.lifecycle === "local"
    ? raw.lifecycle
    : hasBeenPersisted ? "saved" : "local";
  const draftRevision = lifecycle === "initial_draft"
    ? finiteNonNegative(raw.draftRevision, 0)
    : undefined;
  const draftSyncedRevision = lifecycle === "initial_draft"
    ? Math.min(finiteNonNegative(raw.draftSyncedRevision, 0), revision)
    : undefined;
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
    hasBeenPersisted,
    revision,
    savedRevision,
    dirty,
    documentEpoch: finiteNonNegative(raw.documentEpoch, 0),
    lifecycle,
    ...(draftRevision === undefined ? {} : { draftRevision }),
    ...(draftSyncedRevision === undefined ? {} : { draftSyncedRevision }),
    ...(lifecycle === "initial_draft" && typeof raw.draftCreatedAt === "string"
      ? { draftCreatedAt: raw.draftCreatedAt }
      : {}),
  };
}

export function normalizeTabSessionValue(value: unknown): PersistedTabSession | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as { schemaVersion?: unknown; tabs?: unknown; activeTabId?: unknown };
  if (
    raw.schemaVersion !== undefined &&
    raw.schemaVersion !== 0 &&
    raw.schemaVersion !== 1 &&
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

export function readTabSessionSnapshot(
  storage: Pick<Storage, "getItem">,
): PersistedTabSession | undefined {
  return readTabSessionSnapshotResult(storage).snapshot;
}

export interface TabSessionReadResult {
  snapshot?: PersistedTabSession;
  manifest?: ProjectTabsStorageManifest;
  /**
   * Storage access threw while loading the root or a referenced shard. This is
   * deliberately different from a confirmed missing/corrupt shard: callers
   * must not repair the manifest or clean fragments from an incomplete view.
   */
  unreadable: boolean;
}

export function readTabSessionSnapshotResult(
  storage: Pick<Storage, "getItem">,
): TabSessionReadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(TAB_SESSION_STORAGE_KEY);
  } catch {
    return { unreadable: true };
  }
  if (!raw) return { unreadable: false };

  const manifest = parseProjectTabsStorageManifest(raw);
  if (manifest) {
    const tabs: ProjectTab[] = [];
    let unreadable = false;
    for (const tabId of manifest.tabIds) {
      let tabRaw: string | null;
      try {
        tabRaw = storage.getItem(projectTabStorageKey(tabId));
      } catch {
        unreadable = true;
        continue;
      }
      if (!tabRaw) continue;
      try {
        const tab = normalizeSessionTab(JSON.parse(tabRaw));
        if (tab?.id === tabId) tabs.push(tab);
      } catch {
        // Confirmed malformed JSON is an isolated corrupt shard, not an
        // indeterminate Storage read.
      }
    }
    if (tabs.length === 0) return { manifest, unreadable };
    const activeTabId = tabs.some((tab) => tab.id === manifest.activeTabId)
      ? manifest.activeTabId
      : tabs[0].id;
    return {
      manifest,
      unreadable,
      snapshot: { schemaVersion: TAB_SESSION_SCHEMA_VERSION, tabs, activeTabId },
    };
  }

  try {
    return { unreadable: false, snapshot: normalizeTabSessionValue(JSON.parse(raw)) };
  } catch {
    return { unreadable: false };
  }
}

export interface TabSessionWriteOptions {
  writeTabIds?: ReadonlySet<string>;
  knownPersistedTabIds?: ReadonlySet<string>;
  unresolvedTabIds?: ReadonlySet<string>;
}

export interface DetailedTabSessionWriteResult extends TabSessionWriteResult {
  persistedTabIds: string[];
  manifestWritten: boolean;
  /** Referenced shards whose Storage read threw. They remain known-good until
   * a later read proves absence or a write definitively fails. */
  indeterminateTabIds?: string[];
}

function sessionTabSnapshot(tab: ProjectTab): ProjectTab {
  const document = createDocumentSnapshot(tab);
  const flow = documentSnapshotToPersistedWorkflow(document);
  return {
    ...tab,
    projectName: document.projectName,
    nodes: flow.nodes as FlowNode[],
    edges: flow.edges as Edge[],
    selectedNodeIds: [],
    selectedNodeId: null,
    selectedResultId: null,
    compareIds: [],
  };
}

export function writeTabSessionSnapshot(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> &
    Partial<Pick<Storage, "key" | "length">>,
  value: PersistedTabSession,
  options?: TabSessionWriteOptions,
): DetailedTabSessionWriteResult {
  let previousRaw: string | null = null;
  let previousReadFailed = false;
  try { previousRaw = storage.getItem(TAB_SESSION_STORAGE_KEY); } catch { previousReadFailed = true; }
  const previousManifest = parseProjectTabsStorageManifest(previousRaw);
  let migratingLegacy = false;
  if (previousRaw && !previousManifest) {
    try { migratingLegacy = Boolean(normalizeTabSessionValue(JSON.parse(previousRaw))); } catch { /* invalid */ }
  }
  const writeTabIds = options?.writeTabIds;
  const knownPersistedTabIds = options?.knownPersistedTabIds ?? new Set<string>();
  const unresolvedTabIds = options?.unresolvedTabIds ?? new Set<string>();
  const persistedTabIds: string[] = [];
  const failedTabIds: string[] = [];
  const indeterminateTabIds: string[] = [];
  let indeterminateRead = false;
  const recordFailure = (tabId: string) => {
    if (!failedTabIds.includes(tabId)) failedTabIds.push(tabId);
  };

  for (const tab of value.tabs) {
    const key = projectTabStorageKey(tab.id);
    const shouldWrite = !writeTabIds || writeTabIds.has(tab.id);
    if (!shouldWrite) {
      if (unresolvedTabIds.has(tab.id)) {
        recordFailure(tab.id);
        continue;
      }
      if (knownPersistedTabIds.has(tab.id)) {
        try {
          if (storage.getItem(key) !== null) persistedTabIds.push(tab.id);
          else recordFailure(tab.id);
        } catch {
          recordFailure(tab.id);
          indeterminateTabIds.push(tab.id);
          indeterminateRead = true;
        }
      }
      continue;
    }
    try {
      storage.setItem(key, JSON.stringify(sessionTabSnapshot(tab)));
      persistedTabIds.push(tab.id);
    } catch {
      recordFailure(tab.id);
      // Never restore the stale version of the one tab whose latest write failed.
      try { storage.removeItem(key); } catch { /* best effort */ }
    }
  }

  // A legacy monolith remains the only complete recovery point until every tab
  // key succeeds. Never replace it with a partial v2 manifest.
  if (
    previousReadFailed ||
    indeterminateRead ||
    (migratingLegacy && (
      failedTabIds.length > 0 || persistedTabIds.length !== value.tabs.length
    ))
  ) {
    return {
      ok: false,
      error: TAB_SESSION_WRITE_ERROR,
      failedTabIds,
      ...(indeterminateTabIds.length > 0 ? { indeterminateTabIds } : {}),
      persistedTabIds,
      manifestWritten: false,
    };
  }

  if (persistedTabIds.length === 0) {
    if (!migratingLegacy) {
      try { storage.removeItem(TAB_SESSION_STORAGE_KEY); } catch { /* best effort */ }
    }
    return {
      ok: false,
      error: TAB_SESSION_WRITE_ERROR,
      failedTabIds,
      persistedTabIds,
      manifestWritten: false,
    };
  }

  const activeTabId = persistedTabIds.includes(value.activeTabId)
    ? value.activeTabId
    : persistedTabIds[0];
  try {
    storage.setItem(TAB_SESSION_STORAGE_KEY, JSON.stringify({
      schemaVersion: TAB_SESSION_SCHEMA_VERSION,
      activeTabId,
      tabIds: persistedTabIds,
    }));
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error && error.name !== "QuotaExceededError"
        ? `${TAB_SESSION_WRITE_ERROR}（${error.message}）`
        : TAB_SESSION_WRITE_ERROR,
      failedTabIds,
      persistedTabIds,
      manifestWritten: false,
    };
  }

  clearUnreferencedProjectTabSessionStorage(storage, new Set(persistedTabIds));
  return {
    ok: failedTabIds.length === 0,
    ...(failedTabIds.length > 0 ? { error: TAB_SESSION_WRITE_ERROR, failedTabIds } : {}),
    persistedTabIds,
    manifestWritten: true,
  };
}

export function persistTabSession(
  state: TabSessionDocument,
  options?: TabSessionWriteOptions,
): DetailedTabSessionWriteResult {
  return writeTabSessionSnapshot(window.sessionStorage, {
    schemaVersion: TAB_SESSION_SCHEMA_VERSION,
    tabs: state.tabs,
    activeTabId: state.activeTabId,
  }, options);
}

export function normalizeNodeSelection(
  nodes: FlowNode[],
  requestedIds: readonly string[],
): Pick<ProjectTab, "nodes" | "selectedNodeIds" | "selectedNodeId"> {
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
