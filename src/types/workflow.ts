/**
 * 工作流核心类型契约 —— 团队共用，改动需通知全员
 * 三基础节点模型（schema v7）：text / image / video。
 * 字段级契约唯一来源：docs/design/2026-09-18-three-node-model/contracts/data-model.md
 */
import type { GenerationImageModelId, ImageModelOptions } from "./imageModels";
import type { TextModelId, TextModelOptions } from "./textModels";
import type { VideoModelId, VideoModelOptions } from "./videoModels";
import type { ImageOperationMode } from "./imageOperations";

export { IMAGE_OPERATION_MODE_VALUES } from "./imageOperations";
export type { ImageOperationMode } from "./imageOperations";

// ---------- 节点类型 ----------
/**
 * 三基础节点（R1）。旧 9 值（image-input / sketch-to-render / ai-modify /
 * fabric-recolor / upscale / print-extract / print-mutate / mask-redraw /
 * result）在类型层删除，不留别名、不留运行时映射（R7 无迁移路径）。
 */
export type NodeKind = "text" | "image" | "video";

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

export interface TextNodeData extends BaseNodeData {
  kind: "text";
  /** 提示词正文。长度上限沿用 MAX_TEXT_LENGTH = 20_000。
   *  用户手写内容的所有权字段：运行路径（Q1=B）永不写本字段。 */
  text: string;
  /** Q1=B：可运行文本模型。三项窗口配置与 image/video 同构（R4）。 */
  promptVariantId?: string;              // 文本功能变体（如"提示词润色"），走同一 promptRunAdmission
  modelId?: TextModelId;                 // 见 textModels 契约
  modelOptions?: TextModelOptions;       // 自由 key-value（R5），契约提供 recommendedOptions
  /** 最近一次文本运行的输出（展示态；「采纳」是显式 UI 动作，把 outputText 复制进 text）。
   *  长度上限同 text（MAX_TEXT_LENGTH = 20_000），Provider 返回超长时截断写回并标记
   *  truncated（见 contracts/runtime.md §1b 超长处置）。
   *  随文档持久化：进 DocumentSnapshot 与 flow_json，刷新/重开不丢失未采纳提案。 */
  outputText?: string;
  /** 最近一次运行的输入快照（上游串联 + 当时正文），用于可追溯展示；不受 20_000 限制 */
  lastRunInput?: string;
}

export interface ImageNodeData extends BaseNodeData {
  kind: "image";
  promptVariantId?: string;
  promptFamilyId?: string;
  parameterProfileId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  postprocessVersion?: string;
  modelId?: GenerationImageModelId;
  /** R5：自由 key-value；契约提供 recommendedOptions 元数据，UI 负责默认填充。 */
  modelOptions?: ImageModelOptions;
  aspectRatio: string;            // "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
  batchSize: BatchSize;           // 1 | 2 | 4 | 8，沿用
  /** 蒙版能力：仅当 promptVariantId 对应变体声明 needsMask=true 时启用 */
  mask?: string;                  // PNG dataURL 或 /api/files/*.png（校验沿用现有 optionalMaskReference）
  maskSourceRef?: string;         // 必须等于第一条图片入边的当前引用，否则运行拒绝（沿用现有语义）
  featherRadius?: number;         // 0–64
  /** R8：输入与输出同体。上传图 = 用户直接写入 outputImages；生成结果 = 运行时写回。 */
  outputImages: string[];
}

export interface VideoNodeData extends BaseNodeData {
  kind: "video";
  promptVariantId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  modelId?: VideoModelId;
  modelOptions?: VideoModelOptions;  // 见 videoModels（契约 data-model.md §5）
  /** 输出视频引用（/api/files/xxx，files 表 video/mp4）。
   *  语义：当前产物数组，非历史——一次 run 覆盖写（当前 Provider 一次任务产出一个 MP4，
   *  长度恒 0 或 1；保留数组形状只为与未来多产物 Provider 对齐，不做多余 UI 分支）。
   *  历史产物由 generation_runs/generation_outputs 与最近结果面板承载（与 image 同构）。 */
  outputVideos: string[];
}

export type WorkflowNodeData =
  | TextNodeData
  | ImageNodeData
  | VideoNodeData;

export function isNodeRunActive(status: NodeRunStatus): boolean {
  return status === "queued" || status === "running" || status === "retry_wait" || status === "cancel_requested";
}

export function isNodeRunTerminal(status: NodeRunStatus): boolean {
  return status === "success" || status === "error" || status === "outcome_unknown" || status === "cancelled";
}

// ---------- 持久化工作流（项目 / 模板共用）----------
/**
 * 版本 7 为三基础节点模型（R7：v6 及以下一律拒绝，不做迁移）。
 * 拒绝文案见 contracts/data-model.md §2。
 */
export const WORKFLOW_SCHEMA_VERSION = 7 as const;
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
  /** 调用模式；v7 起由选中的提示词变体携带（variant.mode），节点不再自描述。 */
  operationMode: ImageOperationMode;
  /**
   * 新的可追溯参考图契约。Provider 按 order 转换为各自协议；
   * 不得根据数组位置静默推断人物或服装语义。
   */
  references?: ReferenceImageInput[];
  /**
   * @deprecated 旧客户端与迁移期的冗余数组（v7 前的 legacy 通道）。
   * 与 references 同时存在时必须逐项一致（referenceInputs.ts 校验）。
   * P2-b 服务端重写时随旧 runner 一起清理；P2-a 仅保留类型以维持编译。
   */
  referenceImages?: string[];
  aspectRatio?: string;
  batchSize?: number;
  /** 模型原生参数；R5 起为自由 key-value，仅产生 warning（契约 §4）。 */
  modelOptions?: ImageModelOptions;
  /** 局部编辑蒙版（dataURL），仅 needsMask=true 的变体 */
  mask?: string;
}

export interface ImageGenResult {
  images: string[];          // dataURL 或可访问 URL
  model: string;
  usageNote?: string;
  /** 上游声明的逐图实际输出尺寸；顺序与 images 一致，未知项为 null。 */
  providerOutputSizes?: Array<string | null>;
  /** 仅在服务端 Provider 证据链中传递，绝不写入用户运行记录或返回浏览器。 */
  providerRequestId?: string;
}

export interface AIProvider {
  readonly id: string;                 // API易模型 ID；与本地模型知识库一致
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
  /** 素材类型：print=印花 / fabric=面料 / reference=参考图 */
  category: "print" | "fabric" | "reference";
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

// ---------- 节点注册表（前端渲染 + 引擎共用）----------
export interface NodeSpec {
  kind: NodeKind;
  title: string;
  /** 按边类型的入边数上限（graph-invariants.md §2：text 边 / image 边）；0 = 不接受该类型入边。 */
  inputs: { text: number; image: number };
  outputs: "text" | "images" | "video";
}

export const NODE_SPECS: Record<NodeKind, NodeSpec> = {
  text:  { kind: "text",  title: "文本", inputs: { text: 8, image: 0 }, outputs: "text"  },
  image: { kind: "image", title: "图片", inputs: { text: 8, image: 8 }, outputs: "images" },
  video: { kind: "video", title: "视频", inputs: { text: 8, image: 1 }, outputs: "video" },
};
