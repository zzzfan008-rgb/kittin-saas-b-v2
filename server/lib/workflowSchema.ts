import {
  WORKFLOW_SCHEMA_VERSION,
  NODE_SPECS,
  type NodeKind,
  type PersistedWorkflow,
  type PersistedWorkflowEdge,
  type PersistedWorkflowNode,
  type WorkflowNodeData,
  BATCH_SIZES,
} from "../../src/types/workflow";
import {
  createDocumentSnapshot,
  documentSnapshotToPersistedWorkflow,
} from "../../src/lib/documentSnapshot";
import { isLocalImageReference, validateImageDataUrl } from "./imageValidation";
import {
  MASK_REDRAW_MODEL_ID,
  getImageModelContract,
} from "../../src/types/imageModels";

// v7：旧 9 值 kind 的迁移 helper（retiredModelIdForMigration /
// migratedModelFields / migratedOperationFields / migrateNodeData /
// validateModelSelection）随 R7 无迁移裁定整体退役删除。
// 旧 validateData 的九分支由下方 validateDataV7 取代（三值 kind）。
const NODE_KINDS: readonly NodeKind[] = ["text", "image", "video"];
const STATUSES = [
  "idle", "queued", "running", "retry_wait", "cancel_requested",
  "success", "error", "outcome_unknown", "cancelled",
] as const;
const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;
const IMAGE_SIZES = ["2K", "4K"] as const;
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

// v7：旧 9 值 kind 的迁移 helper（retiredModelIdForMigration 已无引用，
// migratedModelFields / migratedOperationFields / migrateNodeData /
// validateModelSelection）随 R7 无迁移裁定整体退役删除。
// 旧 validateData 的九分支由下方 validateDataV7 取代（三值 kind）。

function validateModelOptionsShape(rawValue: unknown, path: string): void {
  // R5：自由 key-value；仅校验形状（对象 + 标量值），取值 warning 归运行侧。
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

/**
 * v7 三值 kind 的节点数据校验（R-48 P2-a 首版；契约 data-model.md §3）。
 * 字段级深校验（蒙版引用校验、评估绑定哈希格式、maskSourceRef 联动）与
 * INV-1 图级规则在 P2-b 补全；本版先立结构骨架：kind/label/status/error +
 * 各 kind 的必填形状。
 */
function validateDataV7(kind: NodeKind, rawValue: unknown, path: string): WorkflowNodeData {
  const input = record(rawValue, path);
  // 运行中与失败状态不能跨保存/模板持久化；成功结果本身可以保留。
  const runtimeStatus = input.status;
  const raw =
    runtimeStatus !== "idle" && runtimeStatus !== "success"
      ? { ...input, status: "idle", error: undefined }
      : input;
  if (raw.kind !== kind) fail(`${path}.kind`, `must equal node type ${kind}`);
  stringValue(raw.label, `${path}.label`, { nonEmpty: true });
  oneOf(raw.status, STATUSES, `${path}.status`);
  optionalString(raw.error, `${path}.error`);
  for (const field of [
    "promptVariantId",
    "promptFamilyId",
    "parameterProfileId",
    "evaluationVersion",
    "postprocessVersion",
  ]) {
    optionalString(raw[field], `${path}.${field}`);
  }
  const contractHash = optionalString(raw.contractHash, `${path}.contractHash`);
  if (contractHash !== undefined && !/^sha256:[a-f0-9]{64}$/.test(contractHash)) {
    fail(`${path}.contractHash`, "must be a sha256: prefixed lowercase SHA-256");
  }
  validateModelOptionsShape(raw.modelOptions, path);
  if (raw.featherRadius !== undefined) {
    const radius = finiteNumber(raw.featherRadius, `${path}.featherRadius`);
    if (radius < 0 || radius > 64) fail(`${path}.featherRadius`, "must be between 0 and 64");
  }

  switch (kind) {
    case "text":
      stringValue(raw.text, `${path}.text`);
      optionalString(raw.outputText, `${path}.outputText`);
      optionalString(raw.lastRunInput, `${path}.lastRunInput`);
      break;
    case "image":
      oneOf(raw.aspectRatio, ASPECT_RATIOS, `${path}.aspectRatio`);
      oneOf(raw.batchSize, BATCH_SIZES, `${path}.batchSize`);
      imageReferenceArray(raw.outputImages, `${path}.outputImages`);
      optionalMaskReference(raw.mask, `${path}.mask`);
      optionalImageReference(raw.maskSourceRef, `${path}.maskSourceRef`);
      break;
    case "video":
      // 视频引用校验（/api/files/*.mp4）归 P2-e；此处先做形状校验。
      if (raw.outputVideos !== undefined && !Array.isArray(raw.outputVideos)) {
        fail(`${path}.outputVideos`, "must be an array");
      }
      if (Array.isArray(raw.outputVideos)) {
        (raw.outputVideos as unknown[]).forEach((item, index) => {
          if (typeof item !== "string" || !item.trim()) {
            fail(`${path}.outputVideos[${index}]`, "must be a non-empty string");
          }
        });
      }
      break;
  }
  return raw as unknown as WorkflowNodeData;
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
  const initialData = record(raw.data, `${path}.data`);
  const data = validateDataV7(type, initialData, `${path}.data`);
  return { ...raw, id, type, position: { ...position, x: position.x as number, y: position.y as number }, data } as PersistedWorkflowNode;
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
  if (raw.sourceHandle !== undefined && raw.sourceHandle !== null) stringValue(raw.sourceHandle, `${path}.sourceHandle`);
  if (raw.targetHandle !== undefined && raw.targetHandle !== null) stringValue(raw.targetHandle, `${path}.targetHandle`);
  // 角色字段已废弃：边 data 存在即忽略，不报错、不写回。
  const data = typeof raw.data === "object" && raw.data !== null && !Array.isArray(raw.data)
    ? raw.data as Record<string, unknown>
    : {};
  return { ...raw, id, source, target, data } as PersistedWorkflowEdge;
}

/**
 * Validate untrusted JSON. Schema v7（三基础节点模型）：
 * v6 及以下（含无版本）一律 WorkflowValidationError，不做迁移（R7；契约 data-model.md §2）。
 * 节点级 v7 数据校验与 INV-1 图级规则的重写归 P2-b。
 */
export function validateAndMigrateFlow(value: unknown): PersistedWorkflow {
  const raw = record(value, "flow");
  const version = raw.schemaVersion;
  const versionNumber = typeof version === "number" ? version : undefined;
  if (versionNumber === undefined || versionNumber < WORKFLOW_SCHEMA_VERSION) {
    // 拒绝文案固定（契约 data-model.md §2）；无版本按 v0 呈现。
    fail("flow.schemaVersion", `该项目为旧版本格式（v${versionNumber ?? 0}），已在三节点重构中清理，请新建项目`);
  }
  if (versionNumber !== WORKFLOW_SCHEMA_VERSION) {
    fail("flow.schemaVersion", `unsupported version ${String(version)}; current version is ${WORKFLOW_SCHEMA_VERSION}`);
  }
  if (!Array.isArray(raw.nodes)) fail("flow.nodes", "must be an array");
  if (!Array.isArray(raw.edges)) fail("flow.edges", "must be an array");
  if (raw.nodes.length > MAX_WORKFLOW_NODES) {
    fail("flow.nodes", `must contain at most ${MAX_WORKFLOW_NODES} nodes`);
  }
  if (raw.edges.length > MAX_EDGES) fail("flow.edges", `must contain at most ${MAX_EDGES} edges`);

  const nodes = raw.nodes.map((node, index) => validateNode(node, index));
  const edges = raw.edges.map((edge, index) => validateEdge(edge, index));
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
  const nodeKindById = new Map(nodes.map((node) => [node.id, node.type]));
  // 边类型校验（graph-invariants.md §2）：targetHandle 区分 text 边 / image 边；
  // 未知 handle（含旧 fabric / garment）一律拒绝。
  for (const edge of edges) {
    const sourceKind = nodeKindById.get(edge.source)!;
    const targetKind = nodeKindById.get(edge.target)!;
    const handle = edge.targetHandle ?? "";
    if (handle === "prompt") {
      if (sourceKind !== "text") {
        fail("flow.edges", `edge ${edge.id} 的 prompt 入边只能来自 text 节点`);
      }
    } else if (handle === "reference" || handle === "") {
      if (targetKind === "text") {
        fail("flow.edges", `edge ${edge.id} 不能指向 text 节点（text 节点没有图片入边）`);
      }
      if (sourceKind !== "image") {
        fail("flow.edges", `edge ${edge.id} 的 reference 入边只能来自 image 节点`);
      }
    } else {
      fail("flow.edges", `edge ${edge.id} 使用了未知的 targetHandle: ${String(handle)}`);
    }
  }
  // INV-1（graph-invariants.md §1）：每个 image/video 节点必须有 ≥1 条 text→该节点的入边。
  for (const node of nodes) {
    if (node.type === "text") continue;
    const hasTextUpstream = edges.some((edge) => edge.target === node.id && edge.targetHandle === "prompt");
    if (!hasTextUpstream) {
      fail("flow.nodes", `「${node.data.label}」需要至少一个上游文本节点提供提示词`);
    }
  }
  // 入边限位（graph-invariants.md §2）：text 边 / image 边分开计数。
  for (const node of nodes) {
    const spec = NODE_SPECS[node.type];
    const incoming = edges.filter((edge) => edge.target === node.id);
    const textIncoming = incoming.filter((edge) => edge.targetHandle === "prompt").length;
    const imageIncoming = incoming.length - textIncoming;
    if (textIncoming > spec.inputs.text || imageIncoming > spec.inputs.image) {
      fail(
        "flow.edges",
        `node ${node.id} accepts at most ${spec.inputs.text} text and ${spec.inputs.image} image incoming connections`,
      );
    }
  }
  return documentSnapshotToPersistedWorkflow(createDocumentSnapshot({
    projectName: "",
    nodes,
    edges,
  }));
}
