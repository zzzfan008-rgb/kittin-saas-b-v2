import {
  getGarmentPromptVariantById,
  type PromptSupportStatus,
  type PromptVariant,
} from "./garmentPromptPresets";
import { effectivePromptSupport } from "./promptEvaluationRelease";
import type { PromptEvaluationRelease } from "./promptEvaluationReleaseRegistry";
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "../types/modelParameterProfiles";
import {
  getImageModelContract,
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
  type ImageModelId,
} from "../types/imageModels";
import type {
  EvaluationShutdownRule,
} from "../types/promptEvaluation";
import { PROMPT_RUNTIME_SHUTDOWN_RULES } from "./promptRuntimeShutdown";
import { nodeProductPolicy } from "./nodeProductPolicy";
import {
  referenceInputIssues,
  type ReferenceInputIssue,
} from "./referenceInputs";
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
  // v7 三值 kind：image 节点 outputImages 承载输出（R8 输入输出同体）；
  // text 节点输出为正文（不产参考图）；video 节点输出视频（不产参考图）。
  if (data.kind === "image") return data.outputImages.length;
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
  promptVariantId?: unknown;
  promptFamilyId?: unknown;
  parameterProfileId?: unknown;
  contractHash?: unknown;
  evaluationVersion?: unknown;
  postprocessVersion?: unknown;
  aspectRatio?: unknown;
  batchSize?: unknown;
  modelOptions?: unknown;
  references?: readonly PromptRunReferenceSnapshot[];
}

export interface PromptRunAdmissionDecision {
  allowed: boolean;
  code:
    | "verified"
    | "evaluation-only"
    | "node-product-policy-blocked"
    | "missing-binding"
    | "unknown-variant"
    | "binding-mismatch"
    | "prompt-drift"
    | "parameter-drift"
    | "retired-model"
    | "unsupported-model"
    | "model-node-incompatible"
    | "operation-mode-incompatible"
    | "generate-reference-conflict"
    | "edit-reference-missing"
    | "reference-limit-exceeded"
    | "reference-structure-invalid"
    | "shutdown"
    | "support-status-blocked";
  reason: string;
  variant?: PromptVariant;
  references?: readonly PromptRunAdmissionReferenceIssue[];
}

export interface PromptRunAdmissionFailurePayload {
  error: string;
  code: PromptRunAdmissionDecision["code"];
  references?: readonly PromptRunAdmissionReferenceIssue[];
}

/** Shared HTTP failure shape for every paid-run admission entry point. */
export function promptRunAdmissionFailurePayload(
  decision: PromptRunAdmissionDecision,
): PromptRunAdmissionFailurePayload {
  return {
    error: decision.reason,
    code: decision.code,
    ...(decision.references?.length ? { references: decision.references } : {}),
  };
}

export interface PromptRunAdmissionOptions {
  /** Only the separately authorised, admin-only evaluation route may set this. */
  evaluationRun?: boolean;
  shutdownRules?: readonly EvaluationShutdownRule[];
  /** Test/review injection; production callers use the code-reviewed registry. */
  releases?: readonly PromptEvaluationRelease[];
  /** Exact build/runtime SHA; required for every non-empty release, including tests. */
  currentCodeSha?: string;
}

function shutdownSpecificity(rule: EvaluationShutdownRule): number {
  switch (rule.scope.level) {
    case "global": return 0;
    case "task-family": return 1;
    case "model-variant": return 2;
    case "task-family-model-node": return 3;
  }
}

function effectiveShutdownRule(
  variant: PromptVariant,
  rules: readonly EvaluationShutdownRule[],
): EvaluationShutdownRule | undefined {
  return rules
    .filter((rule) => {
      if (!rule.active) return false;
      switch (rule.scope.level) {
        case "global": return true;
        case "task-family": return rule.scope.taskFamilyId === variant.familyId;
        case "model-variant": return rule.scope.promptVariantId === variant.variantId;
        case "task-family-model-node": return (
          rule.scope.taskFamilyId === variant.familyId
          && rule.scope.modelId === variant.modelId
          && rule.scope.nodeKind === variant.nodeKind
        );
      }
    })
    .sort((left, right) => (
      shutdownSpecificity(right) - shutdownSpecificity(left) || left.id.localeCompare(right.id)
    ))[0];
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`).join(",")}}`;
}

/**
 * v7 task prompt 合成（runtime.md §1 第 3 步），必须与
 * server/engine/runner.ts executeImageStep、server/lib/evaluationEvidence.ts
 * 逐字同一套：taskPrompt = variant.fullPrompt + "\n\n" + userPrompt；
 * userPrompt 取上游 text 正文（inputTexts，边顺序、"\n\n" 拼接），无 text
 * 上游的直连生成路径回退 params.prompt。
 *
 * 准入是 fail-closed 证据边界：inputTexts 一旦提供就必须是全字符串数组
 * （DAG 产出的形状）；伪造请求或脏持久化产生的其他形状返回 null，绝不按
 * runner 的容错 filter 静默丢弃。用户正文缺失时同样返回 null。
 */
export function synthesizeVariantTaskPrompt(
  input: { inputTexts?: unknown; prompt?: unknown },
  variant: Pick<PromptVariant, "fullPrompt">,
): string | null {
  let inputTexts: string[];
  if (input.inputTexts === undefined) {
    inputTexts = [];
  } else if (
    Array.isArray(input.inputTexts)
    && input.inputTexts.every((value) => typeof value === "string")
  ) {
    inputTexts = input.inputTexts;
  } else {
    return null;
  }
  const userPrompt = inputTexts.length > 0
    ? inputTexts.join("\n\n")
    : (typeof input.prompt === "string" ? input.prompt : "");
  if (!userPrompt) return null;
  return `${variant.fullPrompt}\n\n${userPrompt}`.trim();
}

/**
 * v7 drift 语义：受审身份是服务端目录钉死的 variant.fullPrompt（变体绑定五字段
 * + parameterProfile 已单独比对），客户端无法影响系统提示词。这里验证合成出的
 * taskPrompt 确实把该 fullPrompt 完整内联在最前；v6 的「提示词变体：<id>」
 * 客户端包装后缀校验已删除，且没有任何兼容路径。
 */
function synthesizedPromptMatchesVariant(
  input: PromptRunAdmissionInput,
  variant: PromptVariant,
): boolean {
  const taskPrompt = synthesizeVariantTaskPrompt(input, variant);
  if (taskPrompt === null) return false;
  // trim 后仍须以受审 fullPrompt + 分隔起始，杜绝任何前缀注入空间。
  return taskPrompt.startsWith(`${variant.fullPrompt}\n\n`);
}

function blockedStatusReason(status: PromptSupportStatus, variant: PromptVariant, reason: string): string {
  if (status === "unsupported") return `提示词变体 ${variant.variantId} 已标记为不支持。${reason}`;
  if (status === "experimental") {
    return `提示词变体 ${variant.variantId} 仅处于内部实验阶段，普通用户只能运行 verified 或 recommended。`;
  }
  return reason;
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
  if (!isModelAllowedForNode(input.modelId, input.nodeKind)) {
    return {
      allowed: false,
      code: "model-node-incompatible",
      reason: `模型 ${input.modelId} 不支持节点 ${input.nodeKind} 的当前产品策略。`,
    };
  }
  // v7：operationMode 由提示词变体携带（mode 归属反转），节点不再自描述；
  // 该检查的变体驱动重写归 P2-b（promptRunAdmission 与 needsMask 联动）。
  if (!isImageOperationMode(input.operationMode)) {
    return {
      allowed: false,
      code: "operation-mode-incompatible",
      reason: `operationMode ${String(input.operationMode)} 不是受支持的调用模式。`,
    };
  }
  const contract = getImageModelContract(input.modelId);
  if (
    (input.operationMode === "generate" && !contract.generation)
    || (input.operationMode !== "generate" && !contract.edit)
  ) {
    return {
      allowed: false,
      code: "operation-mode-incompatible",
      reason: `模型 ${input.modelId} 的当前网关契约不支持 ${input.operationMode}。`,
    };
  }
  const references = input.references ?? [];
  if (input.operationMode === "generate" && references.length > 0) {
    return {
      allowed: false,
      code: "generate-reference-conflict",
      reason: "generate 模式不能携带参考图；请明确改为 edit，而不是由系统临时推断模式。",
    };
  }
  if (input.operationMode !== "generate" && references.length === 0) {
    return {
      allowed: false,
      code: "edit-reference-missing",
      reason: `${input.operationMode} 模式至少需要一张参考图。`,
    };
  }
  const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(input.modelId));
  // v7：mask-redraw 特例随旧 kind 退役；蒙版参考图限位改由变体 needsMask 声明
  // 驱动（runtime.md §1 第 5 步），P2-b 接线。当前统一按普通 image 节点限位。
  const maxUserReferences = maxReferences;
  if (references.length > maxUserReferences) {
    return {
      allowed: false,
      code: "reference-limit-exceeded",
      reason: `模型 ${input.modelId} 在 ${input.operationMode} 模式最多接受 ${maxUserReferences} 张用户参考图；系统不会静默裁剪。`,
    };
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

/** Exact, fail-closed admission with no cross-model or parameter fallback. */
export function evaluatePromptRunAdmission(
  input: PromptRunAdmissionInput,
  options: PromptRunAdmissionOptions = {},
): PromptRunAdmissionDecision {
  const compatibility = evaluatePromptRunCompatibility(input);
  if (compatibility) return compatibility;
  if (typeof input.promptVariantId !== "string" || !input.promptVariantId.trim()) {
    return {
      allowed: false,
      code: "missing-binding",
      reason: "该节点没有绑定当前版本的独立提示词变体；未验证或自由提示词不能发起付费运行。",
    };
  }
  const variant = getGarmentPromptVariantById(input.promptVariantId);
  if (!variant) {
    return {
      allowed: false,
      code: "unknown-variant",
      reason: `提示词变体 ${input.promptVariantId} 不在当前受审目录中，系统不会回退到通用提示词。`,
    };
  }
  const bindingMatches = (
    input.modelId === variant.modelId
    && input.nodeKind === variant.nodeKind
    && input.operationMode === variant.mode
    && input.promptFamilyId === variant.familyId
    && input.parameterProfileId === variant.parameterProfileId
    && input.contractHash === variant.contractHash
    && input.evaluationVersion === variant.evaluationVersion
  );
  if (!bindingMatches) {
    return {
      allowed: false,
      code: "binding-mismatch",
      reason: "提示词变体与当前模型、节点、模式、契约或评估版本不一致；请重新选择并确认精确变体。",
      variant,
    };
  }
  if (!synthesizedPromptMatchesVariant(input, variant)) {
    return {
      allowed: false,
      code: "prompt-drift",
      reason: "无法用所绑定变体内联合成当前运行提示词（缺少上游文本正文或正文形状不受信）；为避免借用旧评估结论，必须重新选择并确认。",
      variant,
    };
  }
  const profile = getModelParameterProfile(variant.parameterProfileId);
  if (!profile || input.postprocessVersion !== profile.postprocess.version) {
    return {
      allowed: false,
      code: "parameter-drift",
      reason: "参数档案或后处理版本与提示词评估证据不一致。",
      variant,
    };
  }
  const materialized = materializeModelParameterProfile(profile);
  const aspectMatches = materialized.aspectRatio === "source" || input.aspectRatio === materialized.aspectRatio;
  const batchMatches = input.batchSize === materialized.batchSize;
  if (
    !aspectMatches
    || !batchMatches
    || canonicalJson(input.modelOptions ?? {}) !== canonicalJson(materialized.modelOptions)
  ) {
    return {
      allowed: false,
      code: "parameter-drift",
      reason: "当前原生参数、业务画幅或输出数量已偏离已评估参数档案；系统不会静默修正。",
      variant,
    };
  }
  const shutdown = effectiveShutdownRule(
    variant,
    options.shutdownRules ?? PROMPT_RUNTIME_SHUTDOWN_RULES,
  );
  if (shutdown) {
    return {
      allowed: false,
      code: "shutdown",
      reason: `该组合已被运行时关闭（${shutdown.id}）：${shutdown.reason}`,
      variant,
    };
  }
  const support = effectivePromptSupport(
    variant,
    options.releases,
    options.currentCodeSha,
  );
  if (support.status === "verified" || support.status === "recommended") {
    return { allowed: true, code: "verified", reason: support.reason, variant };
  }
  if (
    options.evaluationRun
    && (support.status === "unverified" || support.status === "experimental")
  ) {
    return {
      allowed: true,
      code: "evaluation-only",
      reason: "仅允许在管理员显式授权的 no-retry 真实评估运行中使用。",
      variant,
    };
  }
  return {
    allowed: false,
    code: "support-status-blocked",
    reason: blockedStatusReason(support.status, variant, support.reason),
    variant,
  };
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
    operationMode: params.operationMode as ImageOperationMode | undefined,
    operationModeNeedsConfirmation: params.operationModeNeedsConfirmation,
    prompt: params.prompt,
    inputTexts: params.inputTexts,
    promptVariantId: params.promptVariantId,
    promptFamilyId: params.promptFamilyId,
    parameterProfileId: params.parameterProfileId,
    contractHash: params.contractHash,
    evaluationVersion: params.evaluationVersion,
    postprocessVersion: params.postprocessVersion,
    aspectRatio: params.aspectRatio,
    batchSize: params.batchSize,
    modelOptions: params.modelOptions,
    references,
  };
}

export function promptRunAdmissionInputFromNode(
  data: WorkflowNodeData,
  references?: readonly PromptRunReferenceSnapshot[],
): PromptRunAdmissionInput {
  return promptRunAdmissionInputFromParams(
    data.kind,
    data as unknown as Record<string, unknown>,
    references,
  );
}
