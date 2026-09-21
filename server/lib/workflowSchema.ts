import {
  WORKFLOW_SCHEMA_VERSION,
  BATCH_SIZES,
  type NodeKind,
  type PersistedWorkflow,
  type PersistedWorkflowEdge,
  type PersistedWorkflowNode,
  type WorkflowNodeData,
  isGeneratorNodeKind,
  isInputNodeKind,
  isResultNodeKind,
} from "../../src/types/workflow";
import { isLocalImageReference, validateImageDataUrl } from "./imageValidation";
import {
  MASK_REDRAW_MODEL_ID,
  getImageModelContract,
  isImageModelId,
} from "../../src/types/imageModels";
import { isVideoModelId } from "../../src/types/videoModels";

const NODE_KINDS: readonly NodeKind[] = [
  "text", "image", "video", "image-generator", "video-generator", "result-image", "result-video",
];
const STATUSES = [
  "idle", "queued", "running", "retry_wait", "cancel_requested",
  "success", "error", "outcome_unknown", "cancelled",
] as const;
const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
/** v8 视频生成节点只实现首帧任务（T4），画幅必须 "adaptive"（data-model.md C6）。 */
const VIDEO_ASPECT_RATIO = "adaptive" as const;
export const MAX_WORKFLOW_NODES = 500;
const MAX_EDGES = 2_000;
const MAX_TEXT_LENGTH = 20_000;
const MAX_IMAGE_REFERENCE_LENGTH = 20_000;
const MAX_IMAGE_REFS = 100;
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const MASK_DATA_URL_CONTRACT = (() => {
  const contract = getImageModelContract(MASK_REDRAW_MODEL_ID).edit.mask;
  if (!contract) throw new Error(`${MASK_REDRAW_MODEL_ID} 缺少蒙版契约`);
  return contract;
})();

/**
 * C2：输入节点不得携带生成语义字段（data-model.md §3「输入节点不承载任何生成语义」）。
 * 机检范围取 data-model.md §7 C2 明确列出的三字段，外加其余生成字段以 fail-closed。
 */
const GENERATION_FIELDS = [
  "modelId", "promptVariantId", "modelOptions", "promptFamilyId", "parameterProfileId",
  "contractHash", "evaluationVersion", "postprocessVersion", "aspectRatio", "batchSize",
  "mask", "maskSourceRef", "featherRadius",
] as const;

export class WorkflowValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowValidationError";
  }
}

function fail(path: string, message: string): never {
  throw new WorkflowValidationError(`${path}: ${message}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "must be an object");
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, path: string, opts?: { nonEmpty?: boolean }): string {
  if (typeof value !== "string") fail(path, "must be a string");
  if (opts?.nonEmpty && value.trim().length === 0) fail(path, "must not be empty");
  if (value.length > MAX_TEXT_LENGTH) fail(path, `must be at most ${MAX_TEXT_LENGTH} characters`);
  return value;
}

function optionalString(value: unknown, path: string): string | undefined {
  return value === undefined ? undefined : stringValue(value, path);
}

function optionalContractHash(value: unknown, path: string): `sha256:${string}` | undefined {
  const contractHash = optionalString(value, path);
  if (contractHash !== undefined && !/^sha256:[a-f0-9]{64}$/.test(contractHash)) {
    fail(path, "must be a sha256: prefixed lowercase SHA-256");
  }
  return contractHash as `sha256:${string}` | undefined;
}

interface ImageReferenceOptions {
  maxDataUrlBytes?: number;
  allowedDataUrlMimes?: readonly string[];
}

function imageReference(value: unknown, path: string, opts?: ImageReferenceOptions): string {
  if (typeof value !== "string") fail(path, "must be a string");
  if (value.trim().length === 0) fail(path, "must not be empty");
  const ref = value;
  if (ref.startsWith("data:")) {
    let mime = "";
    try {
      mime = validateImageDataUrl(ref, opts?.maxDataUrlBytes).mime;
    } catch (error) {
      fail(path, error instanceof Error ? error.message : "invalid image dataURL");
    }
    if (opts?.allowedDataUrlMimes && !opts.allowedDataUrlMimes.includes(mime)) {
      fail(path, `dataURL MIME must be one of: ${opts.allowedDataUrlMimes.join(", ")}`);
    }
    return ref;
  }
  if (ref.length > MAX_IMAGE_REFERENCE_LENGTH) {
    fail(path, `must be at most ${MAX_IMAGE_REFERENCE_LENGTH} characters`);
  }
  const isRemote = /^https?:\/\//i.test(ref);
  if (!isLocalImageReference(ref) && !isRemote) {
    fail(path, "must be an image dataURL, local /api/files reference, or http(s) URL");
  }
  return ref;
}

function optionalImageReference(value: unknown, path: string): string | undefined {
  return value === undefined ? undefined : imageReference(value, path);
}

function optionalMaskReference(value: unknown, path: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") fail(path, "must be a string");
  if (value.startsWith("data:")) {
    return imageReference(value, path, {
      maxDataUrlBytes: MASK_DATA_URL_CONTRACT.maxBytes,
      allowedDataUrlMimes: MASK_DATA_URL_CONTRACT.mimeTypes,
    });
  }
  if (!isLocalImageReference(value) || !value.toLowerCase().endsWith(".png")) {
    fail(path, "must be an inline PNG dataURL or local /api/files/*.png reference");
  }
  return imageReference(value, path);
}

function finiteNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(path, "must be a finite number");
  return value;
}

function oneOf<T extends string | number>(value: unknown, allowed: readonly T[], path: string): T {
  if (!allowed.includes(value as T)) fail(path, `must be one of: ${allowed.join(", ")}`);
  return value as T;
}

function stringArray(value: unknown, path: string, max = MAX_IMAGE_REFS): string[] {
  if (!Array.isArray(value)) fail(path, "must be an array");
  if (value.length > max) fail(path, `must contain at most ${max} items`);
  return value.map((item, index) => stringValue(item, `${path}[${index}]`, { nonEmpty: true }));
}

function imageReferenceArray(value: unknown, path: string, max = MAX_IMAGE_REFS): string[] {
  if (!Array.isArray(value)) fail(path, "must be an array");
  if (value.length > max) fail(path, `must contain at most ${max} items`);
  return value.map((item, index) => imageReference(item, `${path}[${index}]`));
}

function optionalNullableStringArray(value: unknown, path: string): Array<string | null> | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) fail(path, "must be an array");
  return value.map((item, index) => (
    item === null ? null : stringValue(item, `${path}[${index}]`, { nonEmpty: true })
  ));
}

function validateModelOptionsShape(rawValue: unknown, path: string): void {
  if (rawValue === undefined) return;
  if (typeof rawValue !== "object" || rawValue === null || Array.isArray(rawValue)) {
    fail(`${path}.modelOptions`, "must be an object");
  }
  for (const [key, value] of Object.entries(rawValue as Record<string, unknown>)) {
    if (
      value !== undefined
      && typeof value !== "string"
      && typeof value !== "number"
      && typeof value !== "boolean"
    ) {
      fail(`${path}.modelOptions.${key}`, "must be a string, number, or boolean");
    }
  }
}

function assertNoGenerationFields(raw: Record<string, unknown>, path: string): void {
  for (const field of GENERATION_FIELDS) {
    if (raw[field] !== undefined) fail(`${path}.${field}`, "输入节点不得携带生成语义字段");
  }
}

/**
 * v8 七值 kind 的节点数据校验（data-model.md §7 C1-C6）。
 * 返回归一化后的干净节点数据（只保留契约已知字段），替代 documentSnapshot 的字段收敛。
 */
function validateDataV8(kind: NodeKind, rawValue: unknown, path: string): WorkflowNodeData {
  const input = record(rawValue, path);
  // 运行中与失败状态不能跨保存/模板持久化；成功结果本身可以保留。
  const runtimeStatus = input.status;
  const raw =
    runtimeStatus !== "idle" && runtimeStatus !== "success"
      ? { ...input, status: "idle", error: undefined }
      : input;
  if (raw.kind !== kind) fail(`${path}.kind`, `must equal node type ${kind}`);
  const label = stringValue(raw.label, `${path}.label`, { nonEmpty: true });
  oneOf(raw.status, STATUSES, `${path}.status`);
  const status = raw.status as WorkflowNodeData["status"];
  const error = optionalString(raw.error, `${path}.error`);
  const withError = (fields: Record<string, unknown>): Record<string, unknown> => (
    error !== undefined ? { ...fields, error } : fields
  );

  switch (kind) {
    case "text": {
      assertNoGenerationFields(raw, path);
      const text = stringValue(raw.text, `${path}.text`);
      return { kind, label, status, text, ...withError({}) } as WorkflowNodeData;
    }
    case "image": {
      assertNoGenerationFields(raw, path);
      const outputImages = imageReferenceArray(raw.outputImages, `${path}.outputImages`);
      return { kind, label, status, outputImages, ...withError({}) } as WorkflowNodeData;
    }
    case "video": {
      assertNoGenerationFields(raw, path);
      const outputVideos = stringArray(raw.outputVideos, `${path}.outputVideos`);
      return { kind, label, status, outputVideos, ...withError({}) } as WorkflowNodeData;
    }
    case "image-generator": {
      if (raw.outputImages !== undefined) {
        fail(`${path}.outputImages`, "生成节点不得承载产物（产物归结果节点）");
      }
      const promptVariantId = stringValue(raw.promptVariantId, `${path}.promptVariantId`, { nonEmpty: true });
      const modelId = raw.modelId;
      if (!isImageModelId(modelId)) {
        fail(`${path}.modelId`, "必须选择一个受支持的图片生成模型");
      }
      const promptFamilyId = optionalString(raw.promptFamilyId, `${path}.promptFamilyId`);
      const parameterProfileId = optionalString(raw.parameterProfileId, `${path}.parameterProfileId`);
      const contractHash = optionalContractHash(raw.contractHash, `${path}.contractHash`);
      const evaluationVersion = optionalString(raw.evaluationVersion, `${path}.evaluationVersion`);
      const postprocessVersion = optionalString(raw.postprocessVersion, `${path}.postprocessVersion`);
      validateModelOptionsShape(raw.modelOptions, path);
      const aspectRatio = oneOf(raw.aspectRatio, ASPECT_RATIOS, `${path}.aspectRatio`);
      const batchSize = oneOf(raw.batchSize, BATCH_SIZES, `${path}.batchSize`);
      const mask = optionalMaskReference(raw.mask, `${path}.mask`);
      const maskSourceRef = optionalImageReference(raw.maskSourceRef, `${path}.maskSourceRef`);
      let featherRadius: number | undefined;
      if (raw.featherRadius !== undefined) {
        const radius = finiteNumber(raw.featherRadius, `${path}.featherRadius`);
        if (radius < 0 || radius > 64) fail(`${path}.featherRadius`, "must be between 0 and 64");
        featherRadius = radius;
      }
      return {
        kind,
        label,
        status,
        promptVariantId,
        modelId,
        ...(promptFamilyId !== undefined ? { promptFamilyId } : {}),
        ...(parameterProfileId !== undefined ? { parameterProfileId } : {}),
        ...(contractHash !== undefined ? { contractHash } : {}),
        ...(evaluationVersion !== undefined ? { evaluationVersion } : {}),
        ...(postprocessVersion !== undefined ? { postprocessVersion } : {}),
        ...(raw.modelOptions !== undefined ? { modelOptions: { ...raw.modelOptions as Record<string, unknown> } } : {}),
        aspectRatio,
        batchSize,
        ...(mask !== undefined ? { mask } : {}),
        ...(maskSourceRef !== undefined ? { maskSourceRef } : {}),
        ...(featherRadius !== undefined ? { featherRadius } : {}),
        ...withError({}),
      } as WorkflowNodeData;
    }
    case "video-generator": {
      if (raw.outputVideos !== undefined) {
        fail(`${path}.outputVideos`, "生成节点不得承载产物（产物归结果节点）");
      }
      const promptVariantId = stringValue(raw.promptVariantId, `${path}.promptVariantId`, { nonEmpty: true });
      const modelId = raw.modelId;
      if (!isVideoModelId(modelId)) {
        fail(`${path}.modelId`, "必须选择一个受支持的视频生成模型");
      }
      const contractHash = optionalContractHash(raw.contractHash, `${path}.contractHash`);
      const evaluationVersion = optionalString(raw.evaluationVersion, `${path}.evaluationVersion`);
      validateModelOptionsShape(raw.modelOptions, path);
      const aspectRatio = oneOf(raw.aspectRatio, [VIDEO_ASPECT_RATIO], `${path}.aspectRatio`);
      return {
        kind,
        label,
        status,
        promptVariantId,
        modelId,
        ...(contractHash !== undefined ? { contractHash } : {}),
        ...(evaluationVersion !== undefined ? { evaluationVersion } : {}),
        ...(raw.modelOptions !== undefined ? { modelOptions: { ...raw.modelOptions as Record<string, unknown> } } : {}),
        aspectRatio,
        ...withError({}),
      } as WorkflowNodeData;
    }
    case "result-image": {
      const images = imageReferenceArray(raw.images, `${path}.images`);
      const sourceGeneratorId = stringValue(raw.sourceGeneratorId, `${path}.sourceGeneratorId`, { nonEmpty: true });
      const runId = stringValue(raw.runId, `${path}.runId`, { nonEmpty: true });
      const thumbnail = optionalImageReference(raw.thumbnail, `${path}.thumbnail`);
      const outputSizes = optionalNullableStringArray(raw.outputSizes, `${path}.outputSizes`);
      let selectedIndex: number | undefined;
      if (raw.selectedIndex !== undefined) {
        const index = finiteNumber(raw.selectedIndex, `${path}.selectedIndex`);
        if (!Number.isInteger(index) || index < 0) fail(`${path}.selectedIndex`, "must be a non-negative integer");
        selectedIndex = index;
      }
      return {
        kind,
        label,
        status,
        images,
        sourceGeneratorId,
        runId,
        ...(thumbnail !== undefined ? { thumbnail } : {}),
        ...(outputSizes !== undefined ? { outputSizes } : {}),
        ...(selectedIndex !== undefined ? { selectedIndex } : {}),
        ...withError({}),
      } as WorkflowNodeData;
    }
    case "result-video": {
      const videos = stringArray(raw.videos, `${path}.videos`);
      const sourceGeneratorId = stringValue(raw.sourceGeneratorId, `${path}.sourceGeneratorId`, { nonEmpty: true });
      const runId = stringValue(raw.runId, `${path}.runId`, { nonEmpty: true });
      let selectedIndex: number | undefined;
      if (raw.selectedIndex !== undefined) {
        const index = finiteNumber(raw.selectedIndex, `${path}.selectedIndex`);
        if (!Number.isInteger(index) || index < 0) fail(`${path}.selectedIndex`, "must be a non-negative integer");
        selectedIndex = index;
      }
      return {
        kind,
        label,
        status,
        videos,
        sourceGeneratorId,
        runId,
        ...(selectedIndex !== undefined ? { selectedIndex } : {}),
        ...withError({}),
      } as WorkflowNodeData;
    }
  }
}

/** v7 节点迁移：保留内容、剥离全部生成字段（migration.md §2）。 */
function migrateV7NodeData(
  kind: "text" | "image" | "video",
  rawValue: unknown,
  path: string,
): WorkflowNodeData {
  const input = record(rawValue, path);
  const label = stringValue(input.label, `${path}.label`, { nonEmpty: true });
  const status = input.status === "idle" || input.status === "success" ? input.status : "idle";
  switch (kind) {
    case "text":
      return { kind, label, status, text: stringValue(input.text, `${path}.text`) };
    case "image":
      return { kind, label, status, outputImages: imageReferenceArray(input.outputImages, `${path}.outputImages`) };
    case "video":
      return { kind, label, status, outputVideos: stringArray(input.outputVideos, `${path}.outputVideos`) };
  }
}

function validateNode(value: unknown, index: number): PersistedWorkflowNode {
  const path = `flow.nodes[${index}]`;
  const raw = record(value, path);
  const id = stringValue(raw.id, `${path}.id`, { nonEmpty: true });
  if (!SAFE_ID.test(id)) fail(`${path}.id`, "must contain only letters, digits, underscore or hyphen");
  const type = oneOf(raw.type, NODE_KINDS, `${path}.type`);
  const position = record(raw.position, `${path}.position`);
  finiteNumber(position.x, `${path}.position.x`);
  finiteNumber(position.y, `${path}.position.y`);
  const data = validateDataV8(type, raw.data, `${path}.data`);
  return {
    id,
    type,
    position: { x: position.x as number, y: position.y as number },
    data,
  };
}

function validateEdge(value: unknown, index: number): PersistedWorkflowEdge {
  const path = `flow.edges[${index}]`;
  const raw = record(value, path);
  const id = stringValue(raw.id, `${path}.id`, { nonEmpty: true });
  const source = stringValue(raw.source, `${path}.source`, { nonEmpty: true });
  const target = stringValue(raw.target, `${path}.target`, { nonEmpty: true });
  if (!SAFE_ID.test(id)) fail(`${path}.id`, "must contain only letters, digits, underscore or hyphen");
  if (!SAFE_ID.test(source)) fail(`${path}.source`, "must be a valid node id");
  if (!SAFE_ID.test(target)) fail(`${path}.target`, "must be a valid node id");
  const sourceHandle = raw.sourceHandle !== undefined && raw.sourceHandle !== null
    ? stringValue(raw.sourceHandle, `${path}.sourceHandle`)
    : undefined;
  const targetHandle = raw.targetHandle !== undefined && raw.targetHandle !== null
    ? stringValue(raw.targetHandle, `${path}.targetHandle`)
    : undefined;
  const data = typeof raw.data === "object" && raw.data !== null && !Array.isArray(raw.data)
    ? raw.data as Record<string, unknown>
    : {};
  const result: PersistedWorkflowEdge = { id, source, target, data };
  if (sourceHandle !== undefined) result.sourceHandle = sourceHandle;
  if (targetHandle !== undefined) result.targetHandle = targetHandle;
  return result;
}

/** v8 图级校验：边 handle 类型 + INV-1/INV-2/INV-3 + C7（data-model.md §7 / runtime.md §2.1）。 */
function validateV8Flow(nodes: PersistedWorkflowNode[], edges: PersistedWorkflowEdge[]): PersistedWorkflow {
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) fail("flow.nodes", `duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) fail("flow.edges", `duplicate edge id: ${edge.id}`);
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.source)) fail("flow.edges", `edge ${edge.id} source not found: ${edge.source}`);
    if (!nodeIds.has(edge.target)) fail("flow.edges", `edge ${edge.id} target not found: ${edge.target}`);
  }
  const kindById = new Map(nodes.map((node) => [node.id, node.type]));

  // 边 handle 校验（runtime.md §2.1 + T4）：
  // - prompt：text → *-generator
  // - reference：image/result-image → image-generator（video→video-generator 与 result-video→video-generator 本版禁止）
  // - first-frame：image/result-image → video-generator
  // 生成节点不作为任何边的源；结果节点不作为任何边的目标（溯源走 sourceGeneratorId）。
  for (const edge of edges) {
    const sourceKind = kindById.get(edge.source)!;
    const targetKind = kindById.get(edge.target)!;
    const handle = edge.targetHandle ?? "";
    if (handle === "prompt") {
      if (sourceKind !== "text") {
        fail("flow.edges", `edge ${edge.id} 的 prompt 入边只能来自 text 节点`);
      }
      if (!isGeneratorNodeKind(targetKind)) {
        fail("flow.edges", `edge ${edge.id} 的 prompt 入边只能指向生成节点`);
      }
    } else if (handle === "reference") {
      if (targetKind !== "image-generator") {
        fail("flow.edges", `edge ${edge.id} 的 reference 入边只能指向 image-generator 节点`);
      }
      if (sourceKind !== "image" && sourceKind !== "result-image") {
        fail("flow.edges", `edge ${edge.id} 的 reference 入边只能来自 image/result-image 节点`);
      }
    } else if (handle === "first-frame") {
      if (targetKind !== "video-generator") {
        fail("flow.edges", `edge ${edge.id} 的 first-frame 入边只能指向 video-generator 节点`);
      }
      if (sourceKind !== "image" && sourceKind !== "result-image") {
        fail("flow.edges", `edge ${edge.id} 的 first-frame 入边只能来自 image/result-image 节点`);
      }
    } else {
      fail("flow.edges", `edge ${edge.id} 使用了未知的 targetHandle: ${String(handle)}`);
    }
  }

  // INV-1：每个生成节点必须有 ≥1 条 text→该节点的 prompt 入边。
  for (const node of nodes) {
    if (!isGeneratorNodeKind(node.type)) continue;
    const hasPrompt = edges.some((edge) => edge.target === node.id && edge.targetHandle === "prompt");
    if (!hasPrompt) {
      fail("flow.nodes", `「${node.data.label}」需要至少一个上游文本节点提供提示词`);
    }
  }

  // INV-2：单个 text 节点最多连接 1 个生成节点（runtime.md §2.1）。
  const generatorTargetsByText = new Map<string, number>();
  for (const edge of edges) {
    if (edge.targetHandle !== "prompt") continue;
    if (kindById.get(edge.source) !== "text") continue;
    if (!isGeneratorNodeKind(kindById.get(edge.target))) continue;
    generatorTargetsByText.set(edge.source, (generatorTargetsByText.get(edge.source) ?? 0) + 1);
  }
  for (const [textId, count] of generatorTargetsByText) {
    if (count > 1) fail("flow.edges", `text 节点 ${textId} 只能连接 1 个生成节点`);
  }

  // INV-3：输入节点之间不得互连（已由 handle 校验隐含，此处显式兜底）。
  for (const edge of edges) {
    const sourceKind = kindById.get(edge.source)!;
    const targetKind = kindById.get(edge.target)!;
    if (isInputNodeKind(sourceKind) && isInputNodeKind(targetKind)) {
      fail("flow.edges", `edge ${edge.id} 输入节点之间不得互连`);
    }
  }

  // C7：结果节点的 sourceGeneratorId 必须命中同文档的生成节点。
  const generatorIds = new Set(
    nodes.filter((node) => isGeneratorNodeKind(node.type)).map((node) => node.id),
  );
  for (const node of nodes) {
    if (!isResultNodeKind(node.type)) continue;
    const source = (node.data as { sourceGeneratorId?: unknown }).sourceGeneratorId;
    if (typeof source !== "string" || !generatorIds.has(source)) {
      fail("flow.nodes", `结果节点 ${node.id} 的 sourceGeneratorId 必须命中同文档的生成节点`);
    }
  }

  return { schemaVersion: WORKFLOW_SCHEMA_VERSION, nodes, edges };
}

/**
 * Validate untrusted JSON（schema v8，三层七节点模型）。
 * - schemaVersion === 8 → 直接校验（C1-C7）。
 * - schemaVersion === 7 → 惰性迁移：保留输入节点内容、剥离生成字段、丢弃全部边（migration.md）。
 * - schemaVersion < 7（含 undefined/0）→ 拒绝（v7 已确立「v6 及以下一律拒绝」，v8 沿用该边界）。
 * - schemaVersion > 8 → 拒绝（未知的更高版本，fail-closed）。
 */
export function validateAndMigrateFlow(value: unknown): PersistedWorkflow {
  const raw = record(value, "flow");
  const version = raw.schemaVersion;
  const versionNumber = typeof version === "number" ? version : undefined;

  if (versionNumber !== undefined && versionNumber > WORKFLOW_SCHEMA_VERSION) {
    fail("flow.schemaVersion", `unsupported version ${String(version)}; current version is ${WORKFLOW_SCHEMA_VERSION}`);
  }
  if (versionNumber === undefined || versionNumber < 7) {
    // 拒绝文案固定（migration.md §8）；无版本按 v0 呈现。
    fail("flow.schemaVersion", `该项目为旧版本格式（v${versionNumber ?? 0}），已在三节点重构中清理，请新建项目`);
  }

  if (versionNumber === 7) {
    if (!Array.isArray(raw.nodes)) fail("flow.nodes", "must be an array");
    if (raw.nodes.length > MAX_WORKFLOW_NODES) {
      fail("flow.nodes", `must contain at most ${MAX_WORKFLOW_NODES} nodes`);
    }
    // v7 → v8：只保留节点、剥离生成字段；丢弃全部边（migration.md §3 M4）。
    const nodes: PersistedWorkflowNode[] = raw.nodes.map((node, index) => {
      const path = `flow.nodes[${index}]`;
      const n = record(node, path);
      const id = stringValue(n.id, `${path}.id`, { nonEmpty: true });
      if (!SAFE_ID.test(id)) fail(`${path}.id`, "must contain only letters, digits, underscore or hyphen");
      const type = oneOf(n.type, ["text", "image", "video"] as const, `${path}.type`);
      const position = record(n.position, `${path}.position`);
      finiteNumber(position.x, `${path}.position.x`);
      finiteNumber(position.y, `${path}.position.y`);
      return {
        id,
        type,
        position: { x: position.x as number, y: position.y as number },
        data: migrateV7NodeData(type, n.data, `${path}.data`),
      };
    });
    return validateV8Flow(nodes, []);
  }

  // versionNumber === 8：直接校验。
  if (!Array.isArray(raw.nodes)) fail("flow.nodes", "must be an array");
  if (!Array.isArray(raw.edges)) fail("flow.edges", "must be an array");
  if (raw.nodes.length > MAX_WORKFLOW_NODES) {
    fail("flow.nodes", `must contain at most ${MAX_WORKFLOW_NODES} nodes`);
  }
  if (raw.edges.length > MAX_EDGES) fail("flow.edges", `must contain at most ${MAX_EDGES} edges`);
  const nodes = raw.nodes.map((node, index) => validateNode(node, index));
  const edges = raw.edges.map((edge, index) => validateEdge(edge, index));
  return validateV8Flow(nodes, edges);
}
