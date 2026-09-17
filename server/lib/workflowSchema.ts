import {
  WORKFLOW_SCHEMA_VERSION,
  MAX_REFERENCE_IMAGES,
  NODE_SPECS,
  LEGACY_IMAGE_ROLE_VALUES,
  REFERENCE_ROLE_VALUES,
  type NodeKind,
  type PersistedWorkflow,
  type PersistedWorkflowEdge,
  type PersistedWorkflowNode,
  type ReferenceEdgeData,
  type WorkflowNodeData,
  BATCH_SIZES,
  IMAGE_OPERATION_MODE_VALUES,
  allowedOperationModesForNode,
  defaultOperationModeForNode,
  resolveReferenceEdgeData,
  type ReferenceRole,
} from "../../src/types/workflow";
import {
  createDocumentSnapshot,
  documentSnapshotToPersistedWorkflow,
} from "../../src/lib/documentSnapshot";
import { isLocalImageReference, validateImageDataUrl } from "./imageValidation";
import {
  DEFAULT_GENERATION_MODEL_ID,
  MASK_REDRAW_MODEL_ID,
  defaultImageModelOptions,
  getImageModelContract,
  imageModelOptionsErrorForOperation,
  isImageModelId,
  isModelAllowedForNode,
  normalizeImageModelOptionsForOperation,
} from "../../src/types/imageModels";

function retiredModelIdForMigration(
  kind: NodeKind,
  raw: Record<string, unknown>,
): string | undefined {
  if (typeof raw.retiredModelId === "string" && raw.retiredModelId.trim()) {
    return raw.retiredModelId;
  }
  if (
    kind !== "mask-redraw"
    && typeof raw.modelId === "string"
    && raw.modelId.trim()
    && (!isImageModelId(raw.modelId) || !isModelAllowedForNode(raw.modelId, kind))
  ) {
    return raw.modelId;
  }
  return undefined;
}

const NODE_KINDS: readonly NodeKind[] = [
  "image-input",
  "sketch-to-render",
  "ai-modify",
  "fabric-recolor",
  "upscale",
  "print-extract",
  "print-mutate",
  "mask-redraw",
  "result",
];
const STATUSES = [
  "idle", "queued", "running", "retry_wait", "cancel_requested",
  "success", "error", "outcome_unknown", "cancelled",
] as const;
const IMAGE_ROLES = [...REFERENCE_ROLE_VALUES, ...LEGACY_IMAGE_ROLE_VALUES] as const;
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

export type WorkflowReferenceRoleValidationField =
  | "data"
  | "role"
  | "roleNeedsConfirmation";

export class WorkflowReferenceRoleValidationError extends WorkflowValidationError {
  readonly edgeIndex: number;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly field: WorkflowReferenceRoleValidationField;
  readonly issueKind: "missing" | "invalid";

  constructor(
    message: string,
    details: {
      edgeIndex: number;
      sourceNodeId: string;
      targetNodeId: string;
      field: WorkflowReferenceRoleValidationField;
      issueKind: "missing" | "invalid";
    },
  ) {
    super(message);
    this.name = "WorkflowReferenceRoleValidationError";
    this.edgeIndex = details.edgeIndex;
    this.sourceNodeId = details.sourceNodeId;
    this.targetNodeId = details.targetNodeId;
    this.field = details.field;
    this.issueKind = details.issueKind;
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

function migratedModelFields(
  kind: NodeKind,
  raw: Record<string, unknown>,
  preferredAspectRatio = "1:1",
): Record<string, unknown> {
  const requested = isImageModelId(raw.modelId) && isModelAllowedForNode(raw.modelId, kind)
    ? raw.modelId
    : kind === "mask-redraw" ? MASK_REDRAW_MODEL_ID : DEFAULT_GENERATION_MODEL_ID;
  const retiredModelId = retiredModelIdForMigration(kind, raw);
  const allowedModes = allowedOperationModesForNode(kind);
  const operationMode = allowedModes.includes(raw.operationMode as never)
    ? raw.operationMode as "generate" | "edit" | "mask-edit"
    : defaultOperationModeForNode(kind)!;
  return {
    modelId: requested,
    ...(retiredModelId ? {
      retiredModelId,
      modelSelectionNeedsConfirmation: true,
      promptVariantId: undefined,
      promptFamilyId: undefined,
      parameterProfileId: undefined,
      contractHash: undefined,
      evaluationVersion: undefined,
      postprocessVersion: undefined,
    } : {
      modelSelectionNeedsConfirmation: raw.modelSelectionNeedsConfirmation === true,
    }),
    modelOptions: kind === "mask-redraw"
      ? {}
      : normalizeImageModelOptionsForOperation(
          requested,
          raw.modelOptions,
          preferredAspectRatio,
          operationMode,
        ),
  };
}

function migratedOperationFields(
  kind: NodeKind,
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const allowed = allowedOperationModesForNode(kind);
  if (allowed.length === 0) return {};
  const hasExplicitMode = IMAGE_OPERATION_MODE_VALUES.includes(raw.operationMode as never)
    && allowed.includes(raw.operationMode as never);
  const operationMode = hasExplicitMode ? raw.operationMode : defaultOperationModeForNode(kind);
  return {
    operationMode,
    // Only the historically ambiguous dual-mode node requires a user decision.
    operationModeNeedsConfirmation: hasExplicitMode
      ? raw.operationModeNeedsConfirmation === true
      : kind === "sketch-to-render",
  };
}

function migrateNodeData(kind: NodeKind, raw: Record<string, unknown>): Record<string, unknown> {
  // v0/v1 文件保留现有值，只补后来新增且运行时依赖的确定性默认字段。
  switch (kind) {
    case "image-input":
      return {
        ...raw,
        imageRole: raw.imageRole ?? "generic",
        roleNeedsConfirmation: raw.roleNeedsConfirmation === false ? false : true,
      };
    case "sketch-to-render":
      return {
        prompt: "", aspectRatio: "3:4", batchSize: 1, outputImages: [],
        ...raw,
        ...migratedModelFields(kind, raw, typeof raw.aspectRatio === "string" ? raw.aspectRatio : "3:4"),
        ...migratedOperationFields(kind, raw),
      };
    case "ai-modify":
      return {
        prompt: "", aspectRatio: "1:1", batchSize: 1, outputImages: [],
        ...raw,
        ...migratedModelFields(kind, raw, typeof raw.aspectRatio === "string" ? raw.aspectRatio : "1:1"),
        ...migratedOperationFields(kind, raw),
      };
    case "fabric-recolor":
      return {
        colors: [], prompt: "", outputImages: [], ...raw,
        ...migratedModelFields(kind, raw), ...migratedOperationFields(kind, raw),
      };
    case "upscale":
      return {
        imageSize: "2K", outputImages: [], ...raw,
        ...migratedModelFields(kind, raw), ...migratedOperationFields(kind, raw),
      };
    case "print-extract":
      return {
        prompt: "", outputImages: [], savedAsAssets: [], ...raw,
        ...migratedModelFields(kind, raw), ...migratedOperationFields(kind, raw),
      };
    case "print-mutate":
      return {
        prompt: "", count: 4, outputImages: [], ...raw,
        ...migratedModelFields(kind, raw), ...migratedOperationFields(kind, raw),
      };
    case "mask-redraw": {
      const { maskMode: _legacyMaskMode, ...migratedMaskData } = raw;
      return {
        prompt: "", outputImages: [], ...migratedMaskData,
        modelId: MASK_REDRAW_MODEL_ID,
        modelOptions: defaultImageModelOptions(MASK_REDRAW_MODEL_ID),
        ...migratedOperationFields(kind, raw),
      };
    }
    case "result":
      return { images: [], ...raw };
  }
}

function validateModelSelection(kind: NodeKind, raw: Record<string, unknown>, path: string): void {
  if (!NODE_SPECS[kind].providerId) return;
  if (!isImageModelId(raw.modelId)) fail(`${path}.modelId`, "must be a supported API易 image model");
  if (!isModelAllowedForNode(raw.modelId, kind)) {
    fail(`${path}.modelId`, `${raw.modelId} is not allowed for ${kind}`);
  }
  const allowedModes = allowedOperationModesForNode(kind);
  if (!allowedModes.includes(raw.operationMode as never)) {
    fail(`${path}.operationMode`, `must be one of: ${allowedModes.join(", ")}`);
  }
  if (raw.operationModeNeedsConfirmation !== undefined && typeof raw.operationModeNeedsConfirmation !== "boolean") {
    fail(`${path}.operationModeNeedsConfirmation`, "must be a boolean when present");
  }
  if (raw.modelSelectionNeedsConfirmation !== undefined && typeof raw.modelSelectionNeedsConfirmation !== "boolean") {
    fail(`${path}.modelSelectionNeedsConfirmation`, "must be a boolean when present");
  }
  const retiredModelId = optionalString(raw.retiredModelId, `${path}.retiredModelId`);
  if (retiredModelId !== undefined && !retiredModelId.trim()) {
    fail(`${path}.retiredModelId`, "must not be empty");
  }
  if (retiredModelId !== undefined && raw.modelSelectionNeedsConfirmation !== true) {
    fail(`${path}.modelSelectionNeedsConfirmation`, "must be true while retiredModelId is present");
  }
  if (
    retiredModelId !== undefined
    && [
      "promptVariantId",
      "promptFamilyId",
      "parameterProfileId",
      "contractHash",
      "evaluationVersion",
      "postprocessVersion",
    ].some((field) => raw[field] !== undefined)
  ) {
    fail(path, "retired models must not retain prompt, parameter, contract, evaluation, or postprocess bindings");
  }
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
  const inputOptions = raw.modelOptions;
  const optionsError = imageModelOptionsErrorForOperation(
    raw.modelId,
    inputOptions,
    raw.operationMode as "generate" | "edit" | "mask-edit",
  );
  if (optionsError) fail(`${path}.modelOptions`, optionsError);
  if (
    kind === "mask-redraw"
    && typeof inputOptions === "object"
    && inputOptions !== null
    && !Array.isArray(inputOptions)
    && Object.keys(inputOptions as Record<string, unknown>).length > 0
  ) {
    fail(`${path}.modelOptions`, "must be empty; mask output size is derived from the source image at runtime");
  }
}

function validateData(kind: NodeKind, rawValue: unknown, path: string): WorkflowNodeData {
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
  validateModelSelection(kind, raw, path);

  switch (kind) {
    case "image-input":
      oneOf(raw.imageRole, IMAGE_ROLES, `${path}.imageRole`);
      if (typeof raw.roleNeedsConfirmation !== "boolean") {
        fail(`${path}.roleNeedsConfirmation`, "must be a boolean");
      }
      optionalImageReference(raw.imageUrl, `${path}.imageUrl`);
      break;
    case "sketch-to-render":
    case "ai-modify":
      stringValue(raw.prompt, `${path}.prompt`);
      oneOf(raw.aspectRatio, ASPECT_RATIOS, `${path}.aspectRatio`);
      oneOf(raw.batchSize, BATCH_SIZES, `${path}.batchSize`);
      imageReferenceArray(raw.outputImages, `${path}.outputImages`);
      break;
    case "fabric-recolor": {
      const colors = stringArray(raw.colors, `${path}.colors`, 8);
      for (let i = 0; i < colors.length; i++) {
        if (!/^#[0-9a-fA-F]{6}$/.test(colors[i])) fail(`${path}.colors[${i}]`, "must be #RRGGBB");
      }
      stringValue(raw.prompt, `${path}.prompt`);
      optionalImageReference(raw.fabricImageUrl, `${path}.fabricImageUrl`);
      imageReferenceArray(raw.outputImages, `${path}.outputImages`);
      break;
    }
    case "upscale":
      oneOf(raw.imageSize, IMAGE_SIZES, `${path}.imageSize`);
      imageReferenceArray(raw.outputImages, `${path}.outputImages`);
      break;
    case "print-extract":
      stringValue(raw.prompt, `${path}.prompt`);
      imageReferenceArray(raw.outputImages, `${path}.outputImages`);
      imageReferenceArray(raw.savedAsAssets, `${path}.savedAsAssets`);
      break;
    case "print-mutate":
      stringValue(raw.prompt, `${path}.prompt`);
      if (!Number.isInteger(raw.count) || (raw.count as number) < 1 || (raw.count as number) > 8) {
        fail(`${path}.count`, "must be an integer from 1 to 8");
      }
      imageReferenceArray(raw.outputImages, `${path}.outputImages`);
      break;
    case "mask-redraw":
      stringValue(raw.prompt, `${path}.prompt`);
      optionalMaskReference(raw.mask, `${path}.mask`);
      optionalImageReference(raw.maskSourceRef, `${path}.maskSourceRef`);
      imageReferenceArray(raw.outputImages, `${path}.outputImages`);
      break;
    case "result":
      imageReferenceArray(raw.images, `${path}.images`);
      optionalString(raw.note, `${path}.note`);
      break;
  }
  if (kind === "mask-redraw" && Object.hasOwn(raw, "maskMode")) {
    const { maskMode: _legacyMaskMode, ...normalized } = raw;
    return normalized as unknown as WorkflowNodeData;
  }
  return raw as unknown as WorkflowNodeData;
}

function validateNode(value: unknown, index: number, migrateLegacy: boolean): PersistedWorkflowNode {
  const path = `flow.nodes[${index}]`;
  const raw = record(value, path);
  const id = stringValue(raw.id, `${path}.id`, { nonEmpty: true });
  if (!SAFE_ID.test(id)) fail(`${path}.id`, "must contain only letters, digits, underscore or hyphen");
  const type = oneOf(raw.type, NODE_KINDS, `${path}.type`);
  const position = record(raw.position, `${path}.position`);
  finiteNumber(position.x, `${path}.position.x`);
  finiteNumber(position.y, `${path}.position.y`);
  const initialData = record(raw.data, `${path}.data`);
  const data = validateData(
    type,
    migrateLegacy ? migrateNodeData(type, initialData) : initialData,
    `${path}.data`,
  );
  return { ...raw, id, type, position: { ...position, x: position.x as number, y: position.y as number }, data } as PersistedWorkflowNode;
}

function validateReferenceEdgeData(
  value: unknown,
  edgeIndex: number,
  sourceNodeId: string,
  targetNodeId: string,
): ReferenceEdgeData {
  const path = `flow.edges[${edgeIndex}].data`;
  const failReferenceRole = (
    field: WorkflowReferenceRoleValidationField,
    issueKind: "missing" | "invalid",
    fieldPath: string,
    message: string,
  ): never => {
    throw new WorkflowReferenceRoleValidationError(`${fieldPath}: ${message}`, {
      edgeIndex,
      sourceNodeId,
      targetNodeId,
      field,
      issueKind,
    });
  };
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    failReferenceRole("data", value === undefined ? "missing" : "invalid", path, "must be an object");
  }
  const raw = value as Record<string, unknown>;
  // TODO(R-02/R-03): 移除角色后删除此守卫（ReferenceEdgeData 现为 Record<string, unknown>，此处先校验再窄化）
  if (!REFERENCE_ROLE_VALUES.includes(raw.role as ReferenceRole)) {
    failReferenceRole(
      "role",
      raw.role === undefined ? "missing" : "invalid",
      `${path}.role`,
      `must be one of: ${REFERENCE_ROLE_VALUES.join(", ")}`,
    );
  }
  const role = raw.role as ReferenceRole;
  if (typeof raw.roleNeedsConfirmation !== "boolean") {
    failReferenceRole(
      "roleNeedsConfirmation",
      raw.roleNeedsConfirmation === undefined ? "missing" : "invalid",
      `${path}.roleNeedsConfirmation`,
      "must be a boolean",
    );
  }
  return { role, roleNeedsConfirmation: raw.roleNeedsConfirmation as boolean };
}

function validateEdge(
  value: unknown,
  index: number,
  migrateLegacy: boolean,
  sourceDataByNodeId: ReadonlyMap<string, WorkflowNodeData>,
  targetDataByNodeId: ReadonlyMap<string, WorkflowNodeData>,
): PersistedWorkflowEdge {
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
  const data = migrateLegacy
    ? resolveReferenceEdgeData(
      raw.data,
      sourceDataByNodeId.get(source),
      targetDataByNodeId.get(target)?.kind,
      typeof raw.targetHandle === "string" ? raw.targetHandle : null,
    )
    : validateReferenceEdgeData(raw.data, index, source, target);
  return { ...raw, id, source, target, data } as PersistedWorkflowEdge;
}

/** Validate untrusted JSON and migrate legacy unversioned/v0-v5 formats to v6. */
export function validateAndMigrateFlow(value: unknown): PersistedWorkflow {
  const raw = record(value, "flow");
  const version = raw.schemaVersion;
  const migrateLegacy = version === undefined
    || version === 0
    || version === 1
    || version === 2
    || version === 3
    || version === 4
    || version === 5;
  if (!migrateLegacy && version !== WORKFLOW_SCHEMA_VERSION) {
    fail("flow.schemaVersion", `unsupported version ${String(version)}; current version is ${WORKFLOW_SCHEMA_VERSION}`);
  }
  if (!Array.isArray(raw.nodes)) fail("flow.nodes", "must be an array");
  if (!Array.isArray(raw.edges)) fail("flow.edges", "must be an array");
  if (raw.nodes.length > MAX_WORKFLOW_NODES) {
    fail("flow.nodes", `must contain at most ${MAX_WORKFLOW_NODES} nodes`);
  }
  if (raw.edges.length > MAX_EDGES) fail("flow.edges", `must contain at most ${MAX_EDGES} edges`);

  const nodes = raw.nodes.map((node, index) => validateNode(node, index, migrateLegacy));
  const sourceDataByNodeId = new Map(nodes.map((node) => [node.id, node.data]));
  const targetDataByNodeId = sourceDataByNodeId;
  const edges = raw.edges.map((edge, index) => validateEdge(
    edge,
    index,
    migrateLegacy,
    sourceDataByNodeId,
    targetDataByNodeId,
  ));
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
  for (const node of nodes) {
    const incomingCount = edges.filter((edge) => edge.target === node.id).length;
    // v2 曾允许蒙版节点保存 8 路输入。持久化层继续容忍这类历史文档，
    // 但新建连线和运行前检查仍按 7 张用户参考图限制，提示用户移除一张后再运行。
    const persistedInputLimit = node.type === "mask-redraw"
      ? MAX_REFERENCE_IMAGES
      : NODE_SPECS[node.type].inputs;
    if (incomingCount > persistedInputLimit) {
      fail(
        "flow.edges",
        `node ${node.id} accepts at most ${persistedInputLimit} incoming image connections`,
      );
    }
    if (NODE_SPECS[node.type].providerId && incomingCount > MAX_REFERENCE_IMAGES) {
      fail("flow.edges", `node ${node.id} accepts at most ${MAX_REFERENCE_IMAGES} reference images`);
    }
  }
  return documentSnapshotToPersistedWorkflow(createDocumentSnapshot({
    projectName: "",
    nodes,
    edges,
  }));
}
