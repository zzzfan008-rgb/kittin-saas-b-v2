import {
  getImageModelContract,
  isImageModelId,
  modelMaxReferenceImages,
  type ImageModelId,
} from "../types/imageModels";
import {
  referenceInputIssues,
  type ReferenceInputIssue,
} from "./referenceInputs";
import { nodeProductPolicy } from "./nodeProductPolicy";
import type {
  ImageOperationMode,
  NodeKind,
  WorkflowNodeData,
} from "../types/workflow";
import {
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
} from "../types/workflow";

export interface PromptRunReferenceSnapshot {
  order: number;
  sourceNodeId?: string;
}

export interface PromptRunAdmissionReferenceIssue {
  order: number;
  sourceNodeId?: string;
  reason: string;
}

function promptRunAdmissionReferenceIssues(
  issues: readonly ReferenceInputIssue[],
): PromptRunAdmissionReferenceIssue[] {
  return issues.map(({ order, sourceNodeId, reason }) => ({
    order,
    ...(sourceNodeId ? { sourceNodeId } : {}),
    reason,
  }));
}

export interface PromptRunGraphNode {
  id: string;
  data: WorkflowNodeData;
}

export interface PromptRunGraphEdge {
  source: string;
  target: string;
  targetHandle?: string | null;
  data?: unknown;
}

function promptRunNodeOutputCount(data: WorkflowNodeData): number {
  if (data.kind === "image") return data.outputImages.length;
  if (data.kind === "result-image") return data.images.length;
  return 0;
}

/**
 * Mirror DAG reference expansion exactly: edges stay in graph order and every
 * visible source image contributes one reference entry. A single upstream Provider
 * node may expose several images, so counting edges is not sufficient evidence.
 */
export function promptRunReferenceSnapshotsFromGraph(
  nodes: readonly PromptRunGraphNode[],
  edges: readonly PromptRunGraphEdge[],
  targetNodeId: string,
): PromptRunReferenceSnapshot[] {
  const references: PromptRunReferenceSnapshot[] = [];
  for (const edge of edges) {
    if (edge.target !== targetNodeId) continue;
    const source = nodes.find((node) => node.id === edge.source);
    if (!source) continue;
    const imageCount = promptRunNodeOutputCount(source.data);
    for (let index = 0; index < imageCount; index += 1) {
      references.push({
        order: references.length,
        sourceNodeId: source.id,
      });
    }
  }
  return references;
}

/**
 * Browser mirror of server/engine/dag.ts buildExecutionPlan 的 inputTexts 收集：
 * 入边保持 edges 数组顺序，来源为 text 节点时收集其正文（runtime.md §0/§1：
 * text 正文沿 text 边传播，不区分 targetHandle）。浏览器镜像闸必须与服务端用
 * 同一份上游正文合成受审 taskPrompt，否则 UI 会在 prompt-drift 上误拦。
 */
export function promptRunInputTextsFromGraph(
  nodes: readonly PromptRunGraphNode[],
  edges: readonly PromptRunGraphEdge[],
  targetNodeId: string,
): string[] {
  const texts: string[] = [];
  for (const edge of edges) {
    if (edge.target !== targetNodeId) continue;
    const source = nodes.find((node) => node.id === edge.source);
    if (source?.data.kind === "text") texts.push(source.data.text);
  }
  return texts;
}

/** Shared browser/server input. Unknown values must be proven, never coerced. */
export interface PromptRunAdmissionInput {
  nodeKind: NodeKind;
  modelId?: unknown;
  retiredModelId?: unknown;
  modelSelectionNeedsConfirmation?: unknown;
  operationMode?: unknown;
  operationModeNeedsConfirmation?: unknown;
  prompt?: unknown;
  /**
   * v7：上游 text 节点正文（buildExecutionPlan 按边顺序收集，runtime.md §0/§1）。
   * 付费 DAG 路径的用户提示词只从这里进入；prompt 仅保留给无 text 上游的直连
   * 生成路由（/api/generate）作回退。unknown：形状必须被证明，绝不静默过滤。
   */
  inputTexts?: unknown;
  aspectRatio?: unknown;
  batchSize?: unknown;
  modelOptions?: unknown;
  references?: readonly PromptRunReferenceSnapshot[];
}

export interface PromptRunAdmissionDecision {
  allowed: boolean;
  code:
    | "verified"
    | "node-product-policy-blocked"
    | "retired-model"
    | "unsupported-model"
    | "model-node-incompatible"
    | "operation-mode-incompatible"
    | "generate-reference-conflict"
    | "edit-reference-missing"
    | "reference-limit-exceeded"
    | "reference-structure-invalid";
  reason: string;
  references?: readonly PromptRunAdmissionReferenceIssue[];
}

function isImageOperationMode(value: unknown): value is ImageOperationMode {
  return value === "generate" || value === "edit" || value === "mask-edit";
}

/** Shared early model/mode/reference compatibility gate for UI, Store and DAG. */
export function evaluatePromptRunCompatibility(
  input: PromptRunAdmissionInput,
): PromptRunAdmissionDecision | undefined {
  const productPolicy = nodeProductPolicy(input.nodeKind);
  if (!productPolicy.paidRunAllowed) {
    return {
      allowed: false,
      code: "node-product-policy-blocked",
      reason: productPolicy.reason ?? "该节点不在首版付费运行范围内。",
    };
  }
  if (
    input.modelSelectionNeedsConfirmation === true
    || (typeof input.retiredModelId === "string" && input.retiredModelId.trim())
  ) {
    const retiredModelId = typeof input.retiredModelId === "string"
      ? input.retiredModelId
      : "历史模型";
    return {
      allowed: false,
      code: "retired-model",
      reason: `模型 ${retiredModelId} 已退出当前产品范围；系统不会静默换模，请手动选择新模型并重新确认提示词与参数。`,
    };
  }
  if (!isImageModelId(input.modelId)) {
    return {
      allowed: false,
      code: "unsupported-model",
      reason: "必须选择当前五模型契约中的明确模型，未知模型不会被静默替换。",
    };
  }
  if (input.nodeKind !== "image-generator" && input.nodeKind !== "image") {
    return {
      allowed: false,
      code: "model-node-incompatible",
      reason: `模型 ${String(input.modelId)} 不支持节点 ${input.nodeKind} 的当前产品策略。`,
    };
  }
  // v7（mode 归属反转）：operationMode 的唯一事实源是选中变体。未绑定 / 未知变体
  // 时 operationMode 缺省，直连生成路径会从 params.operationMode 回退（仅作为兼容性，
  // 最终由 server 侧 DAG/直接路由授权）。
  if (input.operationMode !== undefined && !isImageOperationMode(input.operationMode)) {
    return {
      allowed: false,
      code: "operation-mode-incompatible",
      reason: `operationMode ${String(input.operationMode)} 不是受支持的调用模式。`,
    };
  }
  const operationMode: ImageOperationMode | undefined =
    input.operationMode === "generate" || input.operationMode === "edit" || input.operationMode === "mask-edit"
      ? input.operationMode
      : undefined;
  if (operationMode !== undefined) {
    const contract = getImageModelContract(input.modelId);
    if (
      (operationMode === "generate" && !contract.generation)
      || (operationMode !== "generate" && !contract.edit)
    ) {
      return {
        allowed: false,
        code: "operation-mode-incompatible",
        reason: `模型 ${String(input.modelId)} 的当前网关契约不支持 ${operationMode}。`,
      };
    }
  }
  const references = input.references ?? [];
  // v9（64 Phase 2）：operationMode 归节点 data。generate 的参考图冲突来自 mode 本身；
  // operationMode 未定义时（直连生成路由），server 侧 DAG 授权兜底，浏览器闸跳过。
  if (operationMode === "generate") {
    if (references.length > 0) {
      return {
        allowed: false,
        code: "generate-reference-conflict",
        reason: "generate 模式不能携带参考图；请明确改为 edit，而不是由系统临时推断模式。",
      };
    }
  }
  if (operationMode === "edit" || operationMode === "mask-edit") {
    if (references.length === 0) {
      return {
        allowed: false,
        code: "edit-reference-missing",
        reason: `${operationMode} 模式至少需要一张参考图。`,
      };
    }
  }
  // If operationMode is undefined (unbound, direct route), skip reference count gate
  // to allow unbound requests through (server-side DAG/auth will handle it).
  if (operationMode !== undefined) {
    const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(input.modelId));
    const maxUserReferences = maxReferences; // needsMask derivation requires bound variant
    if (references.length > maxUserReferences) {
      return {
        allowed: false,
        code: "reference-limit-exceeded",
        reason: `模型 ${String(input.modelId)} 在 ${operationMode} 模式最多接受 ${maxUserReferences} 张用户参考图；系统不会静默裁剪。`,
      };
    }
  }
  const referenceIssues = referenceInputIssues(references);
  const invalidReferences = referenceIssues.filter((issue) => issue.code === "reference-structure-invalid");
  if (invalidReferences.length > 0) {
    return {
      allowed: false,
      code: "reference-structure-invalid",
      reason: "参考图结构或顺序无效。",
      references: promptRunAdmissionReferenceIssues(invalidReferences),
    };
  }
  return undefined;
}

/**
 * Compatibility-only admission: evaluates model/mode/reference compatibility
 * without binding, drift, or support-status gates. Use for UI/Store/DAG.
 * Server-side authorization is handled by the run queue.
 */
export function evaluatePromptRunAdmission(
  input: PromptRunAdmissionInput,
): PromptRunAdmissionDecision {
  const compatibility = evaluatePromptRunCompatibility(input);
  if (compatibility) return compatibility;
  return { allowed: true, code: "verified", reason: "compatible" };
}

export function promptRunAdmissionInputFromParams(
  nodeKind: NodeKind,
  params: Readonly<Record<string, unknown>>,
  references?: readonly PromptRunReferenceSnapshot[],
): PromptRunAdmissionInput {
  return {
    nodeKind,
    modelId: params.modelId as ImageModelId | undefined,
    retiredModelId: params.retiredModelId,
    modelSelectionNeedsConfirmation: params.modelSelectionNeedsConfirmation,
    operationMode: params.operationMode,
    operationModeNeedsConfirmation: params.operationModeNeedsConfirmation,
    prompt: params.prompt,
    inputTexts: params.inputTexts,
    aspectRatio: params.aspectRatio,
    batchSize: params.batchSize,
    modelOptions: params.modelOptions,
    references,
  };
}

export function promptRunAdmissionInputFromNode(
  data: WorkflowNodeData,
  references?: readonly PromptRunReferenceSnapshot[],
  inputTexts?: readonly string[],
): PromptRunAdmissionInput {
  const input = promptRunAdmissionInputFromParams(
    data.kind,
    data as unknown as Record<string, unknown>,
    references,
  );
  // v9（64 Phase 2）：operationMode 归节点 data（裁决 A），不再从 variant 派生。
  // promptRunAdmissionInputFromParams 已直接从 data.operationMode 读取。
  return inputTexts === undefined ? input : { ...input, inputTexts };
}

export function promptRunAdmissionFailurePayload(
  decision: PromptRunAdmissionDecision,
): object {
  return {
    error: decision.reason,
    ...(decision.references ? { references: decision.references } : {}),
  };
}
