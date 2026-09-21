/**
 * 工作流核心类型契约 —— 团队共用，改动需通知全员
 * v8 三层七节点模型：
 *   输入层 text / image / video
 *   生成层 image-generator / video-generator
 *   结果层 result-image / result-video
 * 字段级契约唯一来源：docs/design/2026-09-21-five-node-model/contracts/data-model.md
 */
import type { GenerationImageModelId, ImageModelOptions } from "./imageModels";
import type { VideoModelId, VideoModelOptions } from "./videoModels";
import type { ImageOperationMode } from "./imageOperations";

export { IMAGE_OPERATION_MODE_VALUES } from "./imageOperations";
export type { ImageOperationMode } from "./imageOperations";

// ---------- 节点类型（v8：7 值）----------
export type NodeKind =
  | "text"
  | "image"
  | "video"
  | "image-generator"
  | "video-generator"
  | "result-image"
  | "result-video";

/** 输入层：用户供给（提示词 / 图片 / 视频）。不承载任何生成语义，不可运行。 */
export const INPUT_NODE_KINDS = ["text", "image", "video"] as const;
/** 生成层：唯一的可执行单元（runtime.md §1）。 */
export const GENERATOR_NODE_KINDS = ["image-generator", "video-generator"] as const;
/** 结果层：产物载体。由 RunEvent 驱动创建，用户不可手动新增。 */
export const RESULT_NODE_KINDS = ["result-image", "result-video"] as const;

export type InputNodeKind = (typeof INPUT_NODE_KINDS)[number];
export type GeneratorNodeKind = (typeof GENERATOR_NODE_KINDS)[number];
export type ResultNodeKind = (typeof RESULT_NODE_KINDS)[number];

export function isInputNodeKind(kind: unknown): kind is InputNodeKind {
  return typeof kind === "string" && (INPUT_NODE_KINDS as readonly string[]).includes(kind);
}

export function isGeneratorNodeKind(kind: unknown): kind is GeneratorNodeKind {
  return typeof kind === "string" && (GENERATOR_NODE_KINDS as readonly string[]).includes(kind);
}

export function isResultNodeKind(kind: unknown): kind is ResultNodeKind {
  return typeof kind === "string" && (RESULT_NODE_KINDS as readonly string[]).includes(kind);
}

/**
 * 生成节点的语义生成类别：`image-generator` → `image`、`video-generator` → `video`，
 * 其余 kind 原样返回。
 *
 * v8 把「节点结构 kind」（7 值）与「生成语义 kind」（image/video/text）解耦：
 * 提示词变体绑定、模型×节点闸（isModelAllowedForNode）、付费准入（promptRunAdmission）
 * 仍按语义 kind 工作（variant.nodeKind === "image"|"video"|"text"），而 DAG 步骤的
 * `step.kind` 是结构 kind（"image-generator"）。跨越这两套 kind 的调用点必须先经本函数归一。
 */
export function generationKindOf(kind: NodeKind): NodeKind {
  switch (kind) {
    case "image-generator":
      return "image";
    case "video-generator":
      return "video";
    default:
      return kind;
  }
}

// ---------- 节点执行状态机 ----------
export type NodeRunStatus =
  | "idle"
  | "queued"
  | "running"
  | "retry_wait"
  | "cancel_requested"
  | "success"
  | "error"
  | "outcome_unknown"
  | "cancelled";

/** OpenAI Images Edit 最多支持 16 图；产品端为控制成本与上传体积限制为 8 图。 */
export const MAX_REFERENCE_IMAGES = 8;
/** 局部修改会由服务端追加 1 张区域引导图，因此用户最多提供 7 张参考图。 */
export const MAX_MASK_USER_REFERENCE_IMAGES = MAX_REFERENCE_IMAGES - 1;
/** 局部修改提示词、区域引导图和服务端合成策略的可追踪版本。 */
export const MASK_PIPELINE_VERSION = 3;
export const BATCH_SIZES = [1, 2, 4, 8] as const;
export type BatchSize = (typeof BATCH_SIZES)[number];

// ---------- 参考图可追溯输入 ----------
/** 边数据按任意键值容忍读取；历史数据中的角色字段一律忽略。 */
export type ReferenceEdgeData = Record<string, unknown>;

/** Provider 收到的已解析参考图；dataUrl 必须与 assetSha256 对应。 */
export interface ReferenceImageInput {
  dataUrl: string;
  order: number;
  assetSha256: string;
  sourceNodeId?: string;
}

/** 持久化历史证据不包含 base64 正文，避免数据库与 API 载荷膨胀。 */
export type ReferenceImageEvidence = Omit<ReferenceImageInput, "dataUrl">;

/** DAG 计划中的轻量引用；运行时解析为 ReferenceImageInput。 */
export interface ReferenceImageSource {
  imageRef: string;
  order: number;
  sourceNodeId?: string;
}

// ---------- 节点数据（存 React Flow node.data）----------
export interface BaseNodeData {
  label: string;
  status: NodeRunStatus;
  error?: string;
  [key: string]: unknown;
}

// ===== 输入层（data-model.md §3）：无生成语义字段 =====

export interface TextNodeData extends BaseNodeData {
  kind: "text";
  /** 提示词正文。长度上限沿用 MAX_TEXT_LENGTH = 20_000。
   *  用户手写内容的所有权字段：任何运行路径都不写本字段。 */
  text: string;
}

export interface ImageNodeData extends BaseNodeData {
  kind: "image";
  /** 用户上传的图片引用（/api/files/xxx）。输入节点不写生成结果。 */
  outputImages: string[];
}

export interface VideoNodeData extends BaseNodeData {
  kind: "video";
  /** 用户上传的视频引用（/api/files/xxx，files 表 video/mp4）。 */
  outputVideos: string[];
}

// ===== 生成层（data-model.md §4）：无媒体展示，产物归结果节点 =====

export interface ImageGeneratorNodeData extends BaseNodeData {
  kind: "image-generator";
  /** 功能绑定；必填（C4）。决定业务方向与提示词变体。 */
  promptVariantId: string;
  promptFamilyId?: string;
  parameterProfileId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  postprocessVersion?: string;
  modelId: GenerationImageModelId;
  /** R5：自由 key-value；契约提供 recommendedOptions 元数据。 */
  modelOptions?: ImageModelOptions;
  aspectRatio: string; // "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
  batchSize: BatchSize; // 1 | 2 | 4 | 8
  /** 蒙版能力：仅当 promptVariantId 对应变体声明 needsMask=true 时启用 */
  mask?: string;
  maskSourceRef?: string;
  featherRadius?: number; // 0–64
}

export interface VideoGeneratorNodeData extends BaseNodeData {
  kind: "video-generator";
  /** 功能绑定；必填（C4）。 */
  promptVariantId: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  modelId: VideoModelId;
  /** 时长走 modelOptions.seconds（与契约 recommendedOptions 同源，不设独立 duration 字段）。 */
  modelOptions?: VideoModelOptions;
  /** Seedance 2.5 首帧/首尾帧任务必须 "adaptive"（C6）。 */
  aspectRatio: string;
}

// ===== 结果层（data-model.md §5）：产物 + 溯源 =====

export interface ResultImageNodeData extends BaseNodeData {
  kind: "result-image";
  /** 该次运行的全部产物；一次运行 = 一个 result 节点（T3 裁定 A）。 */
  images: string[];
  thumbnail?: string;
  /** 溯源：产生它的生成节点。必填（C5）。 */
  sourceGeneratorId: string;
  /** 溯源：该次运行的账本键（AGENTS.md §4 反查入口）。必填（C5）。 */
  runId: string;
  /** 产物尺寸，与 images 同序。 */
  outputSizes?: Array<string | null>;
  /** 用户确认的复用单元下标（持久化意图，非 UI 状态）。 */
  selectedIndex?: number;
}

export interface ResultVideoNodeData extends BaseNodeData {
  kind: "result-video";
  /** 当前 Provider 一次任务产出一个 MP4，长度恒 0 或 1；保留数组形状与 image 同构。 */
  videos: string[];
  sourceGeneratorId: string;
  runId: string;
  selectedIndex?: number;
}

export type InputNodeData = TextNodeData | ImageNodeData | VideoNodeData;
export type GeneratorNodeData = ImageGeneratorNodeData | VideoGeneratorNodeData;
export type ResultNodeData = ResultImageNodeData | ResultVideoNodeData;

export type WorkflowNodeData =
  | InputNodeData
  | GeneratorNodeData
  | ResultNodeData;

export function isNodeRunActive(status: NodeRunStatus): boolean {
  return status === "queued" || status === "running" || status === "retry_wait" || status === "cancel_requested";
}

export function isNodeRunTerminal(status: NodeRunStatus): boolean {
  return status === "success" || status === "error" || status === "outcome_unknown" || status === "cancelled";
}

// ---------- 持久化工作流（项目 / 模板共用）----------
/**
 * 版本 8 为三层七节点模型（本文件）。
 * 版本 <= 7 的持久化数据由迁移层惰性升到 v8（migration.md）；
 * 版本 > 8 一律拒绝（未知的更高版本，fail-closed）。
 */
export const WORKFLOW_SCHEMA_VERSION = 8 as const;
export type WorkflowSchemaVersion = typeof WORKFLOW_SCHEMA_VERSION;

export interface PersistedWorkflowNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  [key: string]: unknown;
}

export interface PersistedWorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data: ReferenceEdgeData;
  [key: string]: unknown;
}

export interface PersistedWorkflow {
  schemaVersion: WorkflowSchemaVersion;
  nodes: PersistedWorkflowNode[];
  edges: PersistedWorkflowEdge[];
}

// ---------- Provider 抽象层契约 ----------
/** 所有 AI 调用必须经此接口，禁止业务代码直连第三方 SDK */
export interface ImageGenRequest {
  prompt: string;
  /** Exact reviewed prompt/evaluation binding; direct calls are fail-closed without it. */
  promptVariantId?: string;
  promptFamilyId?: string;
  parameterProfileId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  postprocessVersion?: string;
  /** 调用模式；由选中的提示词变体携带（variant.mode），节点不自描述。 */
  operationMode: ImageOperationMode;
  /**
   * 新的可追溯参考图契约。Provider 按 order 转换为各自协议；
   * 不得根据数组位置静默推断人物或服装语义。
   */
  references?: ReferenceImageInput[];
  /**
   * @deprecated 旧客户端与迁移期的冗余数组（v7 前的 legacy 通道）。
   * 与 references 同时存在时必须逐项一致（referenceInputs.ts 校验）。
   */
  referenceImages?: string[];
  aspectRatio?: string;
  batchSize?: number;
  /** 模型原生参数；自由 key-value，仅产生 warning。 */
  modelOptions?: ImageModelOptions;
  /** 局部编辑蒙版（dataURL），仅 needsMask=true 的变体 */
  mask?: string;
}

export interface ImageGenResult {
  images: string[]; // dataURL 或可访问 URL
  model: string;
  usageNote?: string;
  /** 上游声明的逐图实际输出尺寸；顺序与 images 一致，未知项为 null。 */
  providerOutputSizes?: Array<string | null>;
  /** 仅在服务端 Provider 证据链中传递，绝不写入用户运行记录或返回浏览器。 */
  providerRequestId?: string;
}

export interface AIProvider {
  readonly id: string; // API易模型 ID；与本地模型知识库一致
  validate?(req: ImageGenRequest, mode: ImageOperationMode): void | Promise<void>;
  generate(req: ImageGenRequest): Promise<ImageGenResult>;
  edit(req: ImageGenRequest): Promise<ImageGenResult>;
}

// ---------- 节点执行计划（DAG 引擎与后端之间）----------
export interface NodeExecution {
  nodeId: string;
  kind: NodeKind;
  /** 上游传入的图片（按边顺序，计划期静态快照） */
  inputImages: string[];
  /** 与 inputImages 对齐的角色快照；供单节点重跑和历史证据使用。 */
  inputReferences?: ReferenceImageSource[];
  /** 上游依赖（按边顺序）：运行时优先取本次 Run 中该上游的产出，
   * 上游不在执行范围（单节点重跑）时回退到 images 快照。
   */
  upstream?: {
    nodeId: string;
    images: string[];
  }[];
  params: Record<string, unknown>;
}

export interface ExecutionPlan {
  /** 拓扑排序后的执行序列 */
  steps: NodeExecution[];
}

// ---------- 工作流模板（P1-a）----------
export interface WorkflowTemplate {
  schemaVersion: WorkflowSchemaVersion;
  id: string;
  /** 用户模板所有者；内置模板不设置。服务端据此执行账号隔离。 */
  ownerId?: string;
  name: string;
  description: string;
  /** 内置模板（随部署预置，不可删） */
  builtIn?: boolean;
  /** 缩略图（可选，/api/files/xxx） */
  thumbnail?: string;
  flow: PersistedWorkflow;
  createdAt: string;
}

// ---------- 素材库（印花提取等产出的可复用素材）----------
export interface Asset {
  id: string;
  ownerId?: string | null;
  ownerName?: string | null;
  scope?: "global" | "private" | "shared";
  canManage?: boolean;
  name: string;
  /**
   * 素材类型：print=印花 / fabric=面料 / reference=参考图 / model=数字模特。
   * 服务端镜像清单见 `server/routes/assets.ts` 的 `CATEGORIES` 与
   * `server/lib/database.ts` 的 CHECK 约束（R-86）。
   */
  category: "print" | "fabric" | "reference" | "model";
  /** 图片 URL（/api/files/xxx） */
  image: string;
  /** 列表/画布预览使用的轻量缩略图；执行节点时仍使用 image 原图。 */
  thumbnail?: string;
  /** 来源说明（如来自哪个节点/项目） */
  sourceNote?: string;
  createdAt: string;
  deletedAt?: string | null;
  purgeAfter?: string | null;
}

// ---------- API 契约（前端 ↔ Express）----------
// POST /api/generate   { clientRequestId, providerId, request: ImageGenRequest } → 202 { runId, status }
// POST /api/files      { dataUrl } → { id, url }
// GET  /api/files/:id  读取图片
// POST /api/projects   保存项目 { id, name, flow } → { ok }
// GET  /api/projects/:id → { id, name, flow }
// GET    /api/templates        → WorkflowTemplate[]（内置 + 用户）
// POST   /api/templates        { name, description, thumbnail?, flow } → { ok, id }
// DELETE /api/templates/:id    删除用户模板（内置不可删，403）
// GET    /api/templates/:id    → WorkflowTemplate
// GET    /api/assets           ?category=print → Asset[]（按 createdAt 倒序）
// POST   /api/assets           { name, category, image, sourceNote? } → { ok, id }
// PATCH  /api/assets/:id       { name? } 重命名
// DELETE /api/assets/:id       删除素材（不删底层图片文件，允许多素材共图）

// ---------- 图不变量（data-model.md §7 / runtime.md §2.1）----------
/**
 * 图不变量的纯函数实现，前端唯一事实源。
 * 三处实现（画布 / schema / 运行前置）共享同一组不变量；
 * 服务端等价实现见 server/lib/workflowSchema.ts。
 */

export type GraphNodeLike = { id: string; data: { kind: NodeKind } };
export type GraphEdgeLike = {
  target: string;
  source: string;
  targetHandle?: string | null;
};

/** targetHandle 取值：prompt / reference / first-frame（runtime.md §2.1）。 */
export const EDGE_HANDLE_PROMPT = "prompt";
export const EDGE_HANDLE_REFERENCE = "reference";
export const EDGE_HANDLE_FIRST_FRAME = "first-frame";

export function isPromptEdge(edge: GraphEdgeLike): boolean {
  return edge.targetHandle === EDGE_HANDLE_PROMPT;
}

export function isReferenceEdge(edge: GraphEdgeLike): boolean {
  return edge.targetHandle !== EDGE_HANDLE_PROMPT;
}

/** 可作为图片输入的源 kind：用户上传图 + 上游产物。 */
export function isImageSourceKind(kind: NodeKind | undefined): boolean {
  return kind === "image" || kind === "result-image";
}

/** 可作为视频输入的源 kind。 */
export function isVideoSourceKind(kind: NodeKind | undefined): boolean {
  return kind === "video" || kind === "result-video";
}

/** INV-1：每个生成节点必须存在 ≥1 条来自 text 节点的 prompt 边。 */
export function missingTextUpstreamNodeIds(
  nodes: readonly GraphNodeLike[],
  edges: readonly GraphEdgeLike[],
): string[] {
  const kindById = new Map(nodes.map((node) => [node.id, node.data.kind]));
  const result: string[] = [];
  for (const node of nodes) {
    if (!isGeneratorNodeKind(node.data.kind)) continue;
    const hasTextUpstream = edges.some(
      (edge) =>
        edge.target === node.id &&
        isPromptEdge(edge) &&
        kindById.get(edge.source) === "text",
    );
    if (!hasTextUpstream) result.push(node.id);
  }
  return result;
}

/** INV-2：单个 text 节点最多连接 1 个生成节点（runtime.md §2.1）。 */
export function textNodesOverGeneratorLimit(
  nodes: readonly GraphNodeLike[],
  edges: readonly GraphEdgeLike[],
): string[] {
  const kindById = new Map(nodes.map((node) => [node.id, node.data.kind]));
  const countByTextId = new Map<string, number>();
  for (const edge of edges) {
    if (kindById.get(edge.source) !== "text") continue;
    if (!isGeneratorNodeKind(kindById.get(edge.target))) continue;
    countByTextId.set(edge.source, (countByTextId.get(edge.source) ?? 0) + 1);
  }
  return [...countByTextId.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);
}

/** INV-3：输入节点之间不得互连（plan.md §2.2）。 */
export function illegalEdgeIndexes(
  nodes: readonly GraphNodeLike[],
  edges: readonly GraphEdgeLike[],
): number[] {
  const kindById = new Map(nodes.map((node) => [node.id, node.data.kind]));
  const bad: number[] = [];
  edges.forEach((edge, index) => {
    const sourceKind = kindById.get(edge.source);
    const targetKind = kindById.get(edge.target);
    if (sourceKind === undefined || targetKind === undefined) return;
    if (isInputNodeKind(sourceKind) && isInputNodeKind(targetKind)) bad.push(index);
    else if (isResultNodeKind(sourceKind)) bad.push(index);
    else if (isGeneratorNodeKind(sourceKind)) bad.push(index);
  });
  return bad;
}

/**
 * T4：本版禁止 video / result-video → video-generator 的 reference 边。
 * schema 层拒绝，不是 UI 隐藏（runtime.md §2.1）。
 */
export function forbiddenReferenceEdgeIndexes(
  nodes: readonly GraphNodeLike[],
  edges: readonly GraphEdgeLike[],
): number[] {
  const kindById = new Map(nodes.map((node) => [node.id, node.data.kind]));
  const bad: number[] = [];
  edges.forEach((edge, index) => {
    if (kindById.get(edge.target) !== "video-generator") return;
    if (!isReferenceEdge(edge)) return;
    const sourceKind = kindById.get(edge.source);
    if (isVideoSourceKind(sourceKind)) bad.push(index);
  });
  return bad;
}

/** C7：结果节点的 sourceGeneratorId 必须命中同文档的生成节点。 */
export function danglingResultNodeIds(nodes: readonly GraphNodeLike[]): string[] {
  const generatorIds = new Set(
    nodes.filter((node) => isGeneratorNodeKind(node.data.kind)).map((node) => node.id),
  );
  const bad: string[] = [];
  for (const node of nodes) {
    if (!isResultNodeKind(node.data.kind)) continue;
    const source = (node.data as { sourceGeneratorId?: unknown }).sourceGeneratorId;
    if (typeof source !== "string" || !generatorIds.has(source)) bad.push(node.id);
  }
  return bad;
}

/**
 * 参考图序号（graph-invariants）：(选中目标, 源图) 的二元派生视图。
 * 永不持久化——不写入节点 data、不进 DocumentSnapshot、不进 flow_json。
 * 只有图片类边参与编号；text 边不编号。无选中目标时返回空 Map。
 * 选择器必须以 selectedTargetId 为输入现算，禁止缓存跨目标的映射。
 */
export function selectReferenceOrdinals(
  nodes: readonly GraphNodeLike[],
  edges: readonly GraphEdgeLike[],
  selectedTargetId: string | null,
): ReadonlyMap<string, number> {
  const ordinals = new Map<string, number>();
  if (!selectedTargetId) return ordinals;
  const kindById = new Map(nodes.map((node) => [node.id, node.data.kind]));
  let nextOrdinal = 1;
  for (const edge of edges) {
    if (edge.target !== selectedTargetId || !isReferenceEdge(edge)) continue;
    // 只给图片源节点编号（video 源不产参考图；text 源不会出现在 reference 边上）
    if (!isImageSourceKind(kindById.get(edge.source))) continue;
    if (!ordinals.has(edge.source)) {
      ordinals.set(edge.source, nextOrdinal);
      nextOrdinal += 1;
    }
  }
  return ordinals;
}

// ---------- 节点注册表（前端渲染 + 引擎共用）----------
export interface NodeSpec {
  kind: NodeKind;
  title: string;
  /** 节点库/快捷建图展示用一句话描述；文案单一事实源在此，不在组件里散落。 */
  description: string;
  /**
   * 按 targetHandle 分区的入边数上限（runtime.md §2.1）；0 = 不接受该 handle 的入边。
   * firstFrame 仅 video-generator 使用（0–1）。
   */
  inputs: { prompt: number; reference: number; firstFrame: number };
  outputs: "text" | "images" | "video" | "none";
  /** runtime.md §1：只有生成节点可运行。 */
  runnable: boolean;
  /** 结果节点由 RunEvent 驱动创建，用户不可从节点库手动新增。 */
  userCreatable: boolean;
  /** 同层内是否可与其他输入节点相连（v8 一律 false）。 */
  acceptsInputEdges: boolean;
}

const NO_INPUTS = { prompt: 0, reference: 0, firstFrame: 0 } as const;

export const NODE_SPECS: Record<NodeKind, NodeSpec> = {
  text: {
    kind: "text", title: "文本",
    description: "写提示词正文；连到生成节点决定生成内容",
    inputs: { ...NO_INPUTS }, outputs: "text",
    runnable: false, userCreatable: true, acceptsInputEdges: false,
  },
  image: {
    kind: "image", title: "图片",
    description: "上传图片作为参考图；本身不执行生成",
    inputs: { ...NO_INPUTS }, outputs: "images",
    runnable: false, userCreatable: true, acceptsInputEdges: false,
  },
  video: {
    kind: "video", title: "视频",
    description: "上传视频作为参考素材；本身不执行生成",
    inputs: { ...NO_INPUTS }, outputs: "video",
    runnable: false, userCreatable: true, acceptsInputEdges: false,
  },
  "image-generator": {
    kind: "image-generator", title: "生图",
    description: "选择功能与模型参数，生成图片；产物落到结果节点",
    inputs: { prompt: MAX_REFERENCE_IMAGES, reference: MAX_REFERENCE_IMAGES, firstFrame: 0 },
    outputs: "images",
    runnable: true, userCreatable: true, acceptsInputEdges: false,
  },
  "video-generator": {
    kind: "video-generator", title: "生视频",
    description: "选择功能与模型参数，生成视频；产物落到结果节点",
    inputs: { prompt: MAX_REFERENCE_IMAGES, reference: 0, firstFrame: 1 },
    outputs: "video",
    runnable: true, userCreatable: true, acceptsInputEdges: false,
  },
  "result-image": {
    kind: "result-image", title: "图片结果",
    description: "生成产出的图片；可预览、下载，或作为下游生成节点的输入",
    inputs: { ...NO_INPUTS }, outputs: "images",
    runnable: false, userCreatable: false, acceptsInputEdges: false,
  },
  "result-video": {
    kind: "result-video", title: "视频结果",
    description: "生成产出的视频；可播放、下载，或作为下游生成节点的输入",
    inputs: { ...NO_INPUTS }, outputs: "video",
    runnable: false, userCreatable: false, acceptsInputEdges: false,
  },
};

/** 可用于「选择基础节点后新建生成节点」的两个生成节点（用户交互入口）。 */
export const CREATABLE_GENERATOR_KINDS = ["image-generator", "video-generator"] as const;

/**
 * 未知/legacy kind 的稳健查表（R-79）。七值之外（旧档、脏数据、未来版本）返回
 * undefined，调用方据此显式降级为「不支持的旧版本内容」占位，而不是抛异常白屏。
 * `NODE_SPECS` 仍是最上层事实源：本函数不新增任何标题/描述文案。
 */
export function nodeSpecForKind(kind: unknown): NodeSpec | undefined {
  if (typeof kind !== "string") return undefined;
  return (NODE_SPECS as Record<string, NodeSpec | undefined>)[kind];
}

/**
 * 展示用节点类型名（R-79）。已知 kind 返回 NODE_SPECS 标题；未知 kind 返回其原始
 * 字符串（保证「类型可读」的降级要求）；空/非字符串返回「未知类型」。
 */
export function nodeTitleForKind(kind: unknown): string {
  const spec = nodeSpecForKind(kind);
  if (spec) return spec.title;
  return typeof kind === "string" && kind.trim() !== "" ? kind : "未知类型";
}

// ---------- 运行事件（SSE）契约 ----------
/**
 * RunEvent 的单一事实源（R-89 裁定）：此前 `server/engine/runner.ts` 与
 * `src/store/flowRunEvents.ts` 各自独立声明，导致 `result-node-created` 无法共享。
 * 现在统一在此声明：后端（runQueue/lifecycle）发射、前端（flowRunEvents）消费。
 */

export interface RunFailure {
  prompt?: string;
  error: string;
}

export interface RunEventMeta {
  /** Run 内单调递增事件序号，供 SSE 重连去重。 */
  seq?: number;
  error?: string;
  model?: string;
  /** 每张成功图片对应的实际提示词；顺序与 images 一致。 */
  prompts?: string[];
  /** 上游声明的逐图实际输出尺寸；顺序与 images 一致。 */
  providerOutputSizes?: Array<string | null>;
  failures?: RunFailure[];
  startedAt?: number;
  finishedAt?: number;
  /** R5 参数 warning（不阻断，前端展示）。 */
  parameterWarnings?: string[];
}

export type RunEvent =
  | (RunEventMeta & {
      type: "node-status";
      nodeId: string;
      status: Exclude<NodeRunStatus, "success" | "error" | "idle">;
      images?: never;
    })
  | (RunEventMeta & {
      type: "node-status";
      nodeId: string;
      status: "success";
      images: string[];
      /** video 节点产出的 MP4 引用（files 表 video/mp4）；image 节点缺省。 */
      videos?: string[];
    })
  | (Omit<RunEventMeta, "error"> & {
      type: "node-status";
      nodeId: string;
      status: "error";
      error: string;
      images?: never;
    })
  | (RunEventMeta & {
      /** 一轮 run 发一次，携带该 run 的全部产物；前端据此实例化 result 节点。 */
      type: "result-node-created";
      resultNodeId: string;
      sourceGeneratorId: string;
      runId: string;
      /** "image" | "video" */
      mediaKind: "image" | "video";
      /** 产物引用（/api/files/xxx） */
      urls: string[];
      outputSizes?: Array<string | null>;
    })
  | { seq?: number; type: "done" }
  | { seq?: number; type: "run-error"; nodeId?: string; error: string; finishedAt?: number };
