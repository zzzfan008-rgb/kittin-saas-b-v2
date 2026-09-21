import type { ImageModelOptions } from "../types/imageModels";
import type { VideoModelOptions } from "../types/videoModels";
import {
  EDGE_HANDLE_FIRST_FRAME,
  EDGE_HANDLE_PROMPT,
  EDGE_HANDLE_REFERENCE,
  WORKFLOW_SCHEMA_VERSION,
  danglingResultNodeIds,
  forbiddenReferenceEdgeIndexes,
  illegalEdgeIndexes,
  isGeneratorNodeKind,
  isImageSourceKind,
  isInputNodeKind,
  isResultNodeKind,
  misdirectedResultSourceNodeIds,
  missingTextUpstreamNodeIds,
  nodeSpecForKind,
  textNodesOverGeneratorLimit,
  type NodeKind,
  type PersistedWorkflow,
  type ReferenceEdgeData,
  type WorkflowNodeData,
} from "../types/workflow";

/**
 * DocumentSnapshot（schema v8，三层七节点）。
 *
 * 契约依据：
 * - docs/design/2026-09-21-five-node-model/contracts/data-model.md §3/§4/§5（字段形状、C1-C7）
 * - docs/design/2026-09-21-five-node-model/contracts/migration.md §2-§6（v7→v8 惰性迁移、M1-M8）
 * - docs/design/2026-09-21-five-node-model/contracts/runtime.md §2.1（入边解析）、§3（结果节点）
 *
 * 本文件是前端文档边界的唯一事实源，承担三件事：
 * 1. 投影（store 节点 → 文档节点）：输入节点**不可能**带生成字段（C2），生成节点**不可能**
 *    带产物字段（C3），结果节点必须带溯源键（C5）——「拒绝非法入文档」由结构本身保证，
 *    而不是靠事后校验。
 * 2. 读取（持久化 flow → v8 文档）：版本闸 + v7→v8 惰性迁移（打开即迁，不拒绝旧项目）。
 * 3. 校验（文档图不变量）：plan.md §2 连线规则 + data-model.md §7 C1-C7 的前端侧回归网。
 */

interface PromptBindingDocumentFields {
  promptVariantId?: string;
  promptFamilyId?: string;
  parameterProfileId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  postprocessVersion?: string;
}

/**
 * 文档节点数据（不含运行态字段 status/error；保存时统一写 idle）。
 * 输入节点只保留契约字段，v7 遗留的生成字段在投影时被剥离（migration.md §2 M8）。
 */
export type DocumentNodeData =
  | { kind: "text"; label: string; text: string }
  | { kind: "image"; label: string; outputImages: string[] }
  | { kind: "video"; label: string; outputVideos: string[] }
  | ({
      kind: "image-generator";
      label: string;
      /** 必填字段（C4）；空串表示「尚未选择功能」，只影响可运行性，不阻断文档保存。 */
      promptVariantId: string;
      /** 文档层保留原始模型 id（历史文档可能绑定已退役模型，运行准入负责 fail-closed）。 */
      modelId: string;
      aspectRatio: string;
      batchSize: number;
      modelOptions?: ImageModelOptions;
      mask?: string;
      maskSourceRef?: string;
      featherRadius?: number;
    } & Omit<PromptBindingDocumentFields, "promptVariantId">)
  | ({
      kind: "video-generator";
      label: string;
      promptVariantId: string;
      modelId: string;
      aspectRatio: string;
      modelOptions?: VideoModelOptions;
    } & Pick<PromptBindingDocumentFields, "contractHash" | "evaluationVersion">)
  | {
      kind: "result-image";
      label: string;
      images: string[];
      thumbnail?: string;
      sourceGeneratorId: string;
      runId: string;
      outputSizes?: Array<string | null>;
      selectedIndex?: number;
    }
  | {
      kind: "result-video";
      label: string;
      videos: string[];
      sourceGeneratorId: string;
      runId: string;
      selectedIndex?: number;
    };

export interface DocumentNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: DocumentNodeData;
}

export interface DocumentEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data: ReferenceEdgeData;
}

export interface DocumentSnapshot {
  /**
   * 构造期打标（architect R-89 P1-3）：只有经过「投影 / v7→v8 迁移」的文档才带 v8 标记。
   * `documentSnapshotToPersistedWorkflow` 拒绝为没有该标记的快照盖章 schemaVersion，
   * 杜绝「v7 文档读入后被写成 v8」这类不可回滚的数据损坏。
   */
  version: typeof WORKFLOW_SCHEMA_VERSION;
  projectName: string;
  nodes: DocumentNode[];
  edges: DocumentEdge[];
}

interface NodeLike {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

interface EdgeLike {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: unknown;
}

/** 迁移后的项目首次打开时的一次性 UI 提示文案（migration.md §7；提示属 UI 层，不进文档）。 */
export const DOCUMENT_MIGRATION_NOTICE =
  "项目已升级到新节点模型。原有素材与结果完整保留；如需再次生成，请为其添加生成节点。";

/** 未知/更高版本、以及 v6 及以下的旧格式（fail-closed，绝不做猜测性转换）。 */
export class DocumentFlowVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentFlowVersionError";
  }
}

/** 文档图结构非法（非法边 / 悬空引用），拒绝入文档。 */
export class DocumentGraphError extends Error {
  readonly issues: readonly DocumentGraphIssue[];

  constructor(issues: readonly DocumentGraphIssue[]) {
    super(issues.map((issue) => issue.message).join("；"));
    this.name = "DocumentGraphError";
    this.issues = issues;
  }
}

function optionalString<K extends string>(key: K, value: string | undefined): Partial<Record<K, string>> {
  return value === undefined ? {} : { [key]: value } as Record<K, string>;
}

function stringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function requiredStringField(value: unknown, nodeId: string, field: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`节点 ${nodeId} 的 ${field} 必须是字符串（v8 文档契约）`);
  }
  return value;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function optionalNullableStringList(value: unknown): Array<string | null> | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => (typeof item === "string" && item.trim() ? item : null));
}

function optionalIndex(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

function cloneScalarRecord(value: unknown): ImageModelOptions | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const result: ImageModelOptions = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      result[key] = entry;
    }
  }
  return result;
}

function contractHashField(value: unknown): { contractHash?: `sha256:${string}` } {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/.test(value)
    ? { contractHash: value as `sha256:${string}` }
    : {};
}

/** 生成层的功能绑定字段（data-model.md §4；值非字符串一律不写入文档）。 */
function promptBindingFields(data: WorkflowNodeData): Partial<PromptBindingDocumentFields> {
  const field = (key: string): string | undefined => (
    typeof data[key] === "string" ? data[key] as string : undefined
  );
  return {
    ...optionalString("promptFamilyId", field("promptFamilyId")),
    ...optionalString("parameterProfileId", field("parameterProfileId")),
    ...contractHashField(field("contractHash")),
    ...optionalString("evaluationVersion", field("evaluationVersion")),
    ...optionalString("postprocessVersion", field("postprocessVersion")),
  };
}

function generatorAspectRatio(data: WorkflowNodeData, fallback: string): string {
  const value = data.aspectRatio;
  return typeof value === "string" && value.trim() ? value : fallback;
}

/**
 * 文档投影：三条分层的字段边界在这里被强制。
 * - 输入层：只留 label + 契约字段（丢弃 v7 的 promptVariantId/modelId/modelOptions/outputText/…）
 * - 生成层：只留功能绑定 + 模型参数（丢弃 outputImages/outputVideos 等产物字段）
 * - 结果层：产物 + 溯源（sourceGeneratorId/runId 必须是字符串，C5）
 */
export function createDocumentNodeData(data: WorkflowNodeData): DocumentNodeData {
  switch (data.kind) {
    case "text":
      return { kind: "text", label: data.label, text: stringOrEmpty(data.text) };
    case "image":
      return { kind: "image", label: data.label, outputImages: stringList(data.outputImages) };
    case "video":
      return { kind: "video", label: data.label, outputVideos: stringList(data.outputVideos) };
    case "image-generator": {
      const featherRadius = data.featherRadius;
      return {
        kind: "image-generator",
        label: data.label,
        promptVariantId: stringOrEmpty(data.promptVariantId),
        modelId: stringOrEmpty(data.modelId),
        aspectRatio: generatorAspectRatio(data, "3:4"),
        batchSize: typeof data.batchSize === "number" && Number.isFinite(data.batchSize)
          ? Math.max(1, Math.min(8, Math.round(data.batchSize)))
          : 1,
        ...(data.modelOptions !== undefined ? { modelOptions: cloneScalarRecord(data.modelOptions) } : {}),
        ...optionalString("mask", typeof data.mask === "string" ? data.mask : undefined),
        ...optionalString("maskSourceRef", typeof data.maskSourceRef === "string" ? data.maskSourceRef : undefined),
        ...(typeof featherRadius === "number" && Number.isFinite(featherRadius)
          ? { featherRadius: Math.max(0, Math.min(64, Math.round(featherRadius))) }
          : {}),
        ...promptBindingFields(data),
      };
    }
    case "video-generator":
      return {
        kind: "video-generator",
        label: data.label,
        promptVariantId: stringOrEmpty(data.promptVariantId),
        modelId: stringOrEmpty(data.modelId),
        aspectRatio: generatorAspectRatio(data, "adaptive"),
        ...(data.modelOptions !== undefined ? { modelOptions: cloneScalarRecord(data.modelOptions) } : {}),
        ...contractHashField(data.contractHash),
        ...optionalString("evaluationVersion", typeof data.evaluationVersion === "string" ? data.evaluationVersion : undefined),
      };
    case "result-image": {
      const outputSizes = optionalNullableStringList(data.outputSizes);
      const selectedIndex = optionalIndex(data.selectedIndex);
      return {
        kind: "result-image",
        label: data.label,
        images: stringList(data.images),
        ...(typeof data.thumbnail === "string" && data.thumbnail ? { thumbnail: data.thumbnail } : {}),
        sourceGeneratorId: requiredStringField(data.sourceGeneratorId, "<result-image>", "sourceGeneratorId"),
        runId: requiredStringField(data.runId, "<result-image>", "runId"),
        ...(outputSizes ? { outputSizes } : {}),
        ...(selectedIndex === undefined ? {} : { selectedIndex }),
      };
    }
    case "result-video": {
      const selectedIndex = optionalIndex(data.selectedIndex);
      return {
        kind: "result-video",
        label: data.label,
        videos: stringList(data.videos),
        sourceGeneratorId: requiredStringField(data.sourceGeneratorId, "<result-video>", "sourceGeneratorId"),
        runId: requiredStringField(data.runId, "<result-video>", "runId"),
        ...(selectedIndex === undefined ? {} : { selectedIndex }),
      };
    }
  }
  // 七值之外（旧档、脏数据、未来版本）不生成文档：fail-closed，绝不写非法 flow。
  throw new TypeError(`不支持的节点类型：${String((data as { kind?: unknown }).kind)}`);
}

function cloneDocumentNodeData(data: DocumentNodeData): DocumentNodeData {
  return createDocumentNodeData({ ...data, status: "idle" } as WorkflowNodeData);
}

/**
 * 每层文档节点的允许字段（单一事实源）。
 * 输入层不得带生成字段（C2），生成层不得带产物字段（C3），结果层只得带产物 + 溯源。
 */
const DOCUMENT_NODE_ALLOWED_FIELDS: Record<NodeKind, readonly string[]> = {
  text: ["kind", "label", "text"],
  image: ["kind", "label", "outputImages"],
  video: ["kind", "label", "outputVideos"],
  "image-generator": [
    "kind", "label",
    "promptVariantId", "promptFamilyId", "parameterProfileId",
    "contractHash", "evaluationVersion", "postprocessVersion",
    "modelId", "aspectRatio", "batchSize", "modelOptions",
    "mask", "maskSourceRef", "featherRadius",
  ],
  "video-generator": [
    "kind", "label",
    "promptVariantId", "promptFamilyId", "parameterProfileId",
    "contractHash", "evaluationVersion",
    "modelId", "aspectRatio", "modelOptions",
  ],
  "result-image": [
    "kind", "label", "images", "thumbnail",
    "sourceGeneratorId", "runId", "outputSizes", "selectedIndex",
  ],
  "result-video": [
    "kind", "label", "videos", "sourceGeneratorId", "runId", "selectedIndex",
  ],
};

/**
 * 返回节点 data 里第一个不属于该层文档契约的字段名（未投影遗留），没有则 undefined。
 * 用于落盘闸：手写/强转的 v7 节点（image 带 modelId、text 带 outputText 等）会在此暴露。
 */
export function unprojectedDocumentFields(data: DocumentNodeData): string[] {
  const spec = nodeSpecForKind(data.kind);
  if (!spec) return [];
  const allowed = new Set(DOCUMENT_NODE_ALLOWED_FIELDS[data.kind]);
  return Object.entries(data as Record<string, unknown>)
    .filter(([key, value]) => value !== undefined && !allowed.has(key))
    .map(([key]) => key);
}

function legacyDocumentFieldOf(data: DocumentNodeData): string | undefined {
  return unprojectedDocumentFields(data)[0];
}

function createDocumentNode(node: NodeLike): DocumentNode {
  const kind = node.data.kind;
  if (node.type !== kind) {
    throw new TypeError(`节点 ${node.id} 的 type 与 data.kind 不一致`);
  }
  return {
    id: node.id,
    type: kind,
    position: { x: node.position.x, y: node.position.y },
    data: createDocumentNodeData(node.data),
  };
}

function createDocumentEdge(edge: EdgeLike): DocumentEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(edge.sourceHandle === undefined ? {} : { sourceHandle: edge.sourceHandle }),
    ...(edge.targetHandle === undefined ? {} : { targetHandle: edge.targetHandle }),
    data: (typeof edge.data === "object" && edge.data !== null && !Array.isArray(edge.data)
      ? edge.data as ReferenceEdgeData
      : {}) as ReferenceEdgeData,
  };
}

function documentEdgeToPersisted(edge: DocumentEdge): PersistedWorkflow["edges"][number] {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(edge.sourceHandle === undefined ? {} : { sourceHandle: edge.sourceHandle }),
    ...(edge.targetHandle === undefined ? {} : { targetHandle: edge.targetHandle }),
    data: { ...edge.data },
  };
}

export function createDocumentSnapshot(source: {
  projectName: string;
  nodes: readonly NodeLike[];
  edges: readonly EdgeLike[];
}): DocumentSnapshot {
  return {
    version: WORKFLOW_SCHEMA_VERSION,
    projectName: source.projectName,
    nodes: source.nodes.map(createDocumentNode),
    edges: source.edges.map(createDocumentEdge),
  };
}

/**
 * 落盘前的最后一道闸（architect R-89 P1-3）：快照必须已带 v8 标记（= 走过投影或迁移），
 * 且不含「未投影」的遗留字段。宁可抛错也不盖章——被错盖成 v8 的 v7 文档不可回滚。
 *
 * 只做「未迁移」检测，不做图不变量：`server/lib/workflowSchema.ts` 的校验器同样经
 * `createDocumentSnapshot` 调用本模块，若在此对边结构 fail-closed，会把服务端的校验失败
 * 变成 500（v7 服务端校验层仍允许 input→input 参考边）。图不变量在读取入口
 * `readDocumentSnapshotFromFlow` 与 `documentGraphIssues` 中单独暴露。
 */
function assertMigratedDocumentSnapshot(snapshot: DocumentSnapshot): void {
  if (!isRecord(snapshot) || snapshot.version !== WORKFLOW_SCHEMA_VERSION) {
    throw new TypeError(
      `拒绝落盘：文档快照未标记为 v${WORKFLOW_SCHEMA_VERSION}（必须先经 createDocumentSnapshot 投影或 readDocumentSnapshotFromFlow 迁移）`,
    );
  }
  for (const node of snapshot.nodes) {
    const legacy = legacyDocumentFieldOf(node.data);
    if (legacy) {
      throw new TypeError(
        `拒绝落盘：节点 ${node.id} 仍带未迁移字段「${legacy}」（v7 文档必须先经 v7→v8 迁移）`,
      );
    }
  }
}

export function documentSnapshotToPersistedWorkflow(snapshot: DocumentSnapshot): PersistedWorkflow {
  assertMigratedDocumentSnapshot(snapshot);
  return {
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: { x: node.position.x, y: node.position.y },
      data: { ...cloneDocumentNodeData(node.data), status: "idle" } as WorkflowNodeData,
    })),
    edges: snapshot.edges.map(documentEdgeToPersisted),
  };
}

// ---------------------------------------------------------------------------
// v8 连线规则（plan.md §2.1/§2.2 + runtime.md §2.1）
// ---------------------------------------------------------------------------

type EdgeHandle = typeof EDGE_HANDLE_PROMPT | typeof EDGE_HANDLE_REFERENCE | typeof EDGE_HANDLE_FIRST_FRAME;

const KNOWN_EDGE_HANDLES: readonly string[] = [
  EDGE_HANDLE_PROMPT,
  EDGE_HANDLE_REFERENCE,
  EDGE_HANDLE_FIRST_FRAME,
];

/**
 * 解析一条入边的 targetHandle：
 * - 显式 handle 必须与源 kind 语义一致（prompt 只来自 text；reference/first-frame 只来自图片源）
 * - 未知 handle 一律拒绝（fail-closed，不猜测）
 * - 缺省 handle 按源 kind 推断（v7「缺省 = 参考边」惯例的向前兼容）：text → prompt，
 *   图片源 → 目标 accept 的 reference，或首帧位。
 */
export function resolveTargetHandle(
  sourceKind: NodeKind | undefined,
  targetKind: NodeKind | undefined,
  rawHandle: string | null | undefined,
): EdgeHandle | undefined {
  if (sourceKind === undefined || targetKind === undefined) return undefined;
  if (rawHandle !== null && rawHandle !== undefined && rawHandle !== "") {
    if (!KNOWN_EDGE_HANDLES.includes(rawHandle)) return undefined;
    if (rawHandle === EDGE_HANDLE_PROMPT) return sourceKind === "text" ? EDGE_HANDLE_PROMPT : undefined;
    return isImageSourceKind(sourceKind) ? rawHandle as EdgeHandle : undefined;
  }
  if (sourceKind === "text") return EDGE_HANDLE_PROMPT;
  if (!isImageSourceKind(sourceKind)) return undefined;
  const spec = nodeSpecForKind(targetKind);
  if (!spec) return undefined;
  if (spec.inputs.reference > 0) return EDGE_HANDLE_REFERENCE;
  if (spec.inputs.firstFrame > 0) return EDGE_HANDLE_FIRST_FRAME;
  return undefined;
}

export interface ConnectionLike {
  source?: string | null;
  target?: string | null;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

interface DocumentGraphLike {
  nodes: readonly { id: string; data: WorkflowNodeData }[];
  edges: readonly {
    source: string;
    target: string;
    targetHandle?: string | null;
  }[];
}

function edgeHandleOf(document: DocumentGraphLike, edge: { source: string; target: string; targetHandle?: string | null }): EdgeHandle | undefined {
  const sourceKind = document.nodes.find((node) => node.id === edge.source)?.data.kind;
  const targetKind = document.nodes.find((node) => node.id === edge.target)?.data.kind;
  return resolveTargetHandle(sourceKind, targetKind, edge.targetHandle ?? null);
}

function incomingCount(document: DocumentGraphLike, targetId: string, handle: EdgeHandle): number {
  return document.edges.filter(
    (edge) => edge.target === targetId && edgeHandleOf(document, edge) === handle,
  ).length;
}

/**
 * v8 连线规则唯一纯函数：画布拉线、快捷建图与读取归一必须共用它。
 * runtime.md §1（只有生成节点可运行）、§2.1（入边分区）、plan.md §2.2（禁止的边）。
 */
export function isV8ConnectionValid(document: DocumentGraphLike, connection: ConnectionLike): boolean {
  if (!connection.source || !connection.target || connection.source === connection.target) return false;
  const source = document.nodes.find((node) => node.id === connection.source);
  const target = document.nodes.find((node) => node.id === connection.target);
  if (!source || !target) return false;
  const sourceKind = source.data.kind;
  const targetKind = target.data.kind;
  const targetSpec = nodeSpecForKind(targetKind);
  if (!targetSpec) return false;
  // 生成节点不是数据源：产物经结果节点复用（plan.md §2.2）。
  if (isGeneratorNodeKind(sourceKind)) return false;
  const handle = resolveTargetHandle(sourceKind, targetKind, connection.targetHandle ?? null);
  if (!handle) return false;
  // 同一 (source, handle) 组合只允许一条边，防重复连线。
  if (document.edges.some((edge) => (
    edge.source === connection.source &&
    edge.target === connection.target &&
    edgeHandleOf(document, edge) === handle
  ))) return false;

  if (handle === EDGE_HANDLE_PROMPT) {
    if (sourceKind !== "text") return false;
    if (targetSpec.inputs.prompt <= 0) return false;
    // INV-2 / D8：同一 text 节点只能连 1 个生成节点（不静默替换，由 UI 提供「断开并新建」）。
    if (document.edges.some((edge) => (
      edge.source === source.id &&
      edge.target !== target.id &&
      isGeneratorNodeKind(document.nodes.find((node) => node.id === edge.target)?.data.kind)
    ))) return false;
    return incomingCount(document, target.id, EDGE_HANDLE_PROMPT) < targetSpec.inputs.prompt;
  }
  if (isResultNodeKind(targetKind) || isInputNodeKind(targetKind)) return false;
  const limit = handle === EDGE_HANDLE_FIRST_FRAME ? targetSpec.inputs.firstFrame : targetSpec.inputs.reference;
  if (limit <= 0) return false;
  return incomingCount(document, target.id, handle) < limit;
}

/** 读取归一：v8 文档必须满足的边规则（= isV8ConnectionValid，用于逐边过滤）。 */
function edgeIsValidInDocument(document: DocumentGraphLike, edge: DocumentGraphLike["edges"][number]): boolean {
  return isV8ConnectionValid(document, edge);
}

// ---------------------------------------------------------------------------
// 文档图不变量（data-model.md §7 C1-C7 + plan.md §2）
// ---------------------------------------------------------------------------

export type DocumentGraphIssueCode =
  | "illegal-edge"
  | "forbidden-reference-edge"
  | "text-over-generator-limit"
  | "missing-text-upstream"
  | "misdirected-result-source"
  | "dangling-result-source"
  | "video-generator-aspect-ratio"
  | "generator-missing-binding";

export interface DocumentGraphIssue {
  code: DocumentGraphIssueCode;
  severity: "error" | "warning";
  message: string;
  nodeId?: string;
  edgeId?: string;
}

/**
 * 文档图不变量回归网。两档严重度：
 * - error：结构上不可能由合法 UI 产生，读取时 fail-closed
 *   （非法边 / 禁止的 reference 边 / INV-2 / C7 情形 (a) 的伪指溯源）
 * - warning：**不阻断**文档打开或保存，只报告事实，交由运行准入或 UI 提示处理
 *   · missing-text-upstream：runtime.md §5 允许生成节点上游全断（「待接线」），D10 禁止自我销毁
 *   · dangling-result-source：C7 情形 (b)（data-model.md §7，R-90 两档语义）——生成节点已被用户
 *     删除，悬空引用合法（§5.1「删除生成节点不删 result 节点」），溯源走 runId，故不在此 fail-closed
 *   · generator-missing-binding：用户可能先建生成节点再选功能（C4 的运行期语义）
 *
 * C7 两档互斥（命中非生成节点 → error；不命中任何节点 → warning），由
 * `misdirectedResultSourceNodeIds` / `danglingResultNodeIds` 两个谓词分别承担，
 * 每个违例只报告一次。
 * 禁则（R-90）：不得为了消除 dangling-result-source 而在删除生成节点时联动删除 result 节点
 * ——那会破 AGENTS.md §3 与 §5.1 的 R2 红线；C7 也不得全线降级为 warning。
 */
export function documentGraphIssues(snapshot: Pick<DocumentSnapshot, "nodes" | "edges">): DocumentGraphIssue[] {
  const graphNodes = snapshot.nodes.map((node) => ({ id: node.id, data: node.data as WorkflowNodeData }));
  const graphEdges = snapshot.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    targetHandle: edge.targetHandle ?? null,
  }));
  const issues: DocumentGraphIssue[] = [];

  for (const index of illegalEdgeIndexes(graphNodes, graphEdges)) {
    const edge = snapshot.edges[index];
    issues.push({
      code: "illegal-edge",
      severity: "error",
      edgeId: edge.id,
      message: `非法连线 ${edge.id}：${edge.source} → ${edge.target} 违反 v8 连线规则`,
    });
  }
  for (const index of forbiddenReferenceEdgeIndexes(graphNodes, graphEdges)) {
    const edge = snapshot.edges[index];
    issues.push({
      code: "forbidden-reference-edge",
      severity: "error",
      edgeId: edge.id,
      message: `非法连线 ${edge.id}：视频素材/视频结果本版不能作为生成节点的输入`,
    });
  }
  for (const nodeId of textNodesOverGeneratorLimit(graphNodes, graphEdges)) {
    issues.push({
      code: "text-over-generator-limit",
      severity: "error",
      nodeId,
      message: `文本节点 ${nodeId} 连接了多个生成节点（同一文本节点只能连接 1 个生成节点）`,
    });
  }
  for (const nodeId of missingTextUpstreamNodeIds(graphNodes, graphEdges)) {
    issues.push({
      code: "missing-text-upstream",
      severity: "warning",
      nodeId,
      message: `生成节点 ${nodeId} 还没有提示词上游（待接线，不阻断保存）`,
    });
  }
  // C7 情形 (a)：命中同文档节点但不是生成节点 → 伪造 provenance，读取 fail-closed（R-90）。
  for (const nodeId of misdirectedResultSourceNodeIds(graphNodes)) {
    issues.push({
      code: "misdirected-result-source",
      severity: "error",
      nodeId,
      message: `结果节点 ${nodeId} 的 sourceGeneratorId 指向的节点不是生成节点（伪造/损坏溯源）`,
    });
  }
  // C7 情形 (b)：不命中任何节点（生成节点已被删除）→ 悬空引用合法，只报告不阻断（R-90 / §5.1）。
  for (const nodeId of danglingResultNodeIds(graphNodes)) {
    issues.push({
      code: "dangling-result-source",
      severity: "warning",
      nodeId,
      message: `结果节点 ${nodeId} 的来源生成节点已不存在（结果保留，溯源走 runId）`,
    });
  }
  for (const node of snapshot.nodes) {
    if (node.data.kind === "image-generator" && !node.data.promptVariantId) {
      issues.push({
        code: "generator-missing-binding",
        severity: "warning",
        nodeId: node.id,
        message: `生成节点 ${node.id} 尚未绑定功能，无法运行`,
      });
    }
    if (node.data.kind === "video-generator") {
      if (!node.data.promptVariantId) {
        issues.push({
          code: "generator-missing-binding",
          severity: "warning",
          nodeId: node.id,
          message: `生成节点 ${node.id} 尚未绑定功能，无法运行`,
        });
      }
      const hasFirstFrame = snapshot.edges.some((edge) => (
        edge.target === node.id && resolveTargetHandle(
          snapshot.nodes.find((candidate) => candidate.id === edge.source)?.data.kind,
          "video-generator",
          edge.targetHandle ?? null,
        ) === EDGE_HANDLE_FIRST_FRAME
      ));
      // C6：Seedance 2.5 首帧任务必须 adaptive。
      if (hasFirstFrame && node.data.aspectRatio !== "adaptive") {
        issues.push({
          code: "video-generator-aspect-ratio",
          severity: "error",
          nodeId: node.id,
          message: `视频生成节点 ${node.id} 的首帧任务画幅必须是 adaptive（当前 ${node.data.aspectRatio}）`,
        });
      }
    }
  }
  return issues;
}

/** 只需错误档（读取 fail-closed 用）。 */
export function documentGraphErrors(snapshot: Pick<DocumentSnapshot, "nodes" | "edges">): DocumentGraphIssue[] {
  return documentGraphIssues(snapshot).filter((issue) => issue.severity === "error");
}

// ---------------------------------------------------------------------------
// 版本闸 + v7 → v8 惰性迁移（migration.md §2-§6）
// ---------------------------------------------------------------------------

const MIGRATABLE_NODE_KINDS: readonly NodeKind[] = ["text", "image", "video"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function migratedNodePosition(value: unknown, index: number, nodeId: string): { x: number; y: number } {
  if (!isRecord(value)) throw new TypeError(`v7 节点 ${nodeId}（flow.nodes[${index}]）缺少合法坐标`);
  const x = value.x;
  const y = value.y;
  if (typeof x !== "number" || !Number.isFinite(x) || typeof y !== "number" || !Number.isFinite(y)) {
    throw new TypeError(`v7 节点 ${nodeId}（flow.nodes[${index}]）缺少合法坐标`);
  }
  return { x, y };
}

/**
 * 单个 v7 节点 → v8 输入节点（migration.md §2）。
 * 只保留 text/image/video 三种输入节点，生成字段被投影剥离（M8），不产出 generator/result（M5）。
 */
function migrateV7Node(value: unknown, index: number): PersistedWorkflow["nodes"][number] {
  if (!isRecord(value)) throw new TypeError(`v7 文档的 flow.nodes[${index}] 不是对象`);
  const id = value.id;
  const type = value.type;
  if (typeof id !== "string" || !id.trim()) throw new TypeError(`v7 文档的 flow.nodes[${index}] 缺少节点 id`);
  if (typeof type !== "string" || !MIGRATABLE_NODE_KINDS.includes(type as NodeKind)) {
    throw new DocumentFlowVersionError(
      `v7 文档包含未知节点类型（${String(type)}）；该项目无法安全迁移到 v${
        WORKFLOW_SCHEMA_VERSION
      }，请新建项目`,
    );
  }
  if (!isRecord(value.data)) throw new TypeError(`v7 文档的节点 ${id} 缺少 data`);
  const position = migratedNodePosition(value.position, index, id);
  const data = createDocumentNodeData({ ...value.data, kind: type, status: "idle" } as WorkflowNodeData);
  return {
    id,
    type: type as NodeKind,
    position,
    // 迁移不做「上传 vs 生成」的启发式拆分；运行态一律回落 idle（不把运行中状态写进文档）。
    data: { ...data, status: "idle" } as WorkflowNodeData,
  };
}

function migrateV7FlowToV8(raw: Record<string, unknown>): PersistedWorkflow {
  const nodes = raw.nodes;
  const edges = raw.edges;
  if (!Array.isArray(nodes)) throw new TypeError("flow.nodes 必须是数组");
  if (!Array.isArray(edges)) throw new TypeError("flow.edges 必须是数组");
  return {
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    nodes: nodes.map((node, index) => migrateV7Node(node, index)),
    // M4：v7 的 prompt/reference 边在 v8 全部非法（v8 无「指向输入节点的边」目标），
    // 保留即产出无法通过 schema 校验的文档 → 迁移时整体丢弃，由用户重建（用户拍板的保守路径）。
    edges: [],
  };
}

/**
 * 读取路径唯一版本闸（migration.md §4）：
 * - `schemaVersion === 8` → 直接使用
 * - `schemaVersion === 7` → 惰性迁移到 v8（打开即迁，不拒绝旧项目）
 * - `schemaVersion <= 6`（含 `undefined`/`0`）→ 拒绝（沿用 v7 边界，不做更早版本的迁移）
 * - `schemaVersion > 8` → 拒绝（未知的更高版本，fail-closed）
 * 迁移只在读取时进行；**写回发生在用户保存时**，打开不静默覆写磁盘（migration.md §5）。
 */
export function migrateFlowToV8(value: unknown): { flow: PersistedWorkflow; migrated: boolean } {
  if (!isRecord(value)) throw new TypeError("flow 必须是对象");
  const version = value.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version)) {
    if (version === undefined || version === 0) {
      throw new DocumentFlowVersionError(
        `该项目为旧版本格式（v${String(version ?? 0)}），已在七节点重构中清理，请新建项目`,
      );
    }
    throw new DocumentFlowVersionError(`flow.schemaVersion 无效：${String(version)}`);
  }
  if (version > WORKFLOW_SCHEMA_VERSION) {
    throw new DocumentFlowVersionError(
      `该项目使用了更高的节点模型版本（v${version}），当前版本无法安全打开（最高支持 v${WORKFLOW_SCHEMA_VERSION}）`,
    );
  }
  if (version < WORKFLOW_SCHEMA_VERSION) {
    if (version !== 7) {
      throw new DocumentFlowVersionError(
        `该项目为旧版本格式（v${version}），已在七节点重构中清理，请新建项目`,
      );
    }
    return { flow: migrateV7FlowToV8(value), migrated: true };
  }
  if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    throw new TypeError("flow.nodes / flow.edges 必须是数组");
  }
  return { flow: value as unknown as PersistedWorkflow, migrated: false };
}

export interface DocumentReadResult {
  snapshot: DocumentSnapshot;
  /** true 表示这是 v7 文档的惰性迁移结果（写回发生在用户保存时）。 */
  migrated: boolean;
}

/**
 * 持久化 flow → v8 文档快照。读取路径的单一入口：
 * 版本闸 → 迁移 → 投影（字段边界）→ 结构不变量（错误档 fail-closed）。
 */
export function readDocumentSnapshotFromFlow(value: unknown): DocumentReadResult {
  const { flow, migrated } = migrateFlowToV8(value);
  const snapshot = createDocumentSnapshot({
    projectName: "",
    nodes: flow.nodes as unknown as NodeLike[],
    edges: flow.edges as unknown as EdgeLike[],
  });
  const errors = documentGraphErrors(snapshot);
  if (errors.length > 0) throw new DocumentGraphError(errors);
  return { snapshot, migrated };
}

/**
 * store 读入归一（openFlowTab / loadFlow / 初始草稿）：把任意来源的节点投影成 v8 文档形状，
 * 并丢弃 v8 判定为非法或悬空的边。
 *
 * 这里同时承担「缺版本号时的迁移」：v7 的边在 v8 全部非法（text→image 的 prompt 边是 v7 最常见的边），
 * 因此打开旧项目时 edges 会被整体过滤为空，与 migration.md §3/§4 的迁移结果一致。
 */
export function normalizeFlowForDocumentRead(source: {
  nodes: readonly NodeLike[];
  edges: readonly EdgeLike[];
}): { nodes: NodeLike[]; edges: EdgeLike[]; migratedNodeIds: string[]; droppedEdgeIds: string[] } {
  const nodes: NodeLike[] = source.nodes.map((node) => {
    const kind = node.data?.kind;
    if (!nodeSpecForKind(kind)) return node; // 未知/legacy kind：保留原状由 R-79 占位降级处理
    return {
      ...node,
      type: kind,
      position: { x: node.position.x, y: node.position.y },
      data: { ...createDocumentNodeData(node.data), status: "idle" } as WorkflowNodeData,
    };
  });
  const migratedNodeIds = nodes
    .filter((node, index) => node !== source.nodes[index])
    .map((node) => node.id);
  const graph: DocumentGraphLike = { nodes, edges: [] };
  const edges: EdgeLike[] = [];
  const droppedEdgeIds: string[] = [];
  for (const edge of source.edges) {
    const sourceKind = nodes.find((node) => node.id === edge.source)?.data.kind;
    const targetKind = nodes.find((node) => node.id === edge.target)?.data.kind;
    const handle = resolveTargetHandle(sourceKind, targetKind, edge.targetHandle ?? null);
    const candidate = { source: edge.source, target: edge.target, targetHandle: handle ?? null };
    if (handle && edgeIsValidInDocument(graph, candidate)) {
      // v8 要求显式 targetHandle（data-model §2）：把缺省/别名 handle 物化为契约值，
      // 否则 types/workflow 的 isPromptEdge（严格比较 "prompt"）会把 prompt 边算成参考边。
      edges.push({ ...edge, targetHandle: handle });
      graph.edges = [...graph.edges, candidate];
    } else {
      droppedEdgeIds.push(edge.id);
    }
  }
  return { nodes, edges, migratedNodeIds, droppedEdgeIds };
}
