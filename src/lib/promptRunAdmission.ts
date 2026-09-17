import {
  getGarmentPromptVariantById,
  type PromptSupportStatus,
  type PromptVariant,
} from "./garmentPromptPresets";
import { effectivePromptSupport } from "./promptEvaluationRelease";
import type { PromptEvaluationRelease } from "./promptEvaluationReleaseRegistry";
import { canonicalReferenceRoleProfile } from "./promptEvaluation";
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
  EvaluationReferenceRoleProfileEntry,
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
  ReferenceRole,
  WorkflowNodeData,
} from "../types/workflow";
import {
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
  allowedOperationModesForNode,
  isReferenceRole,
  resolveReferenceEdgeData,
} from "../types/workflow";

export interface PromptRunReferenceSnapshot {
  role: ReferenceRole;
  order: number;
  roleNeedsConfirmation?: boolean;
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
  if (data.kind === "image-input") return data.imageUrl ? 1 : 0;
  if (data.kind === "result") return 0;
  return data.outputImages.length;
}

/**
 * Mirror DAG reference expansion exactly: edges stay in graph order and every
 * visible source image contributes one role entry. A single upstream Provider
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
    const target = nodes.find((node) => node.id === targetNodeId);
    const role = resolveReferenceEdgeData(edge.data, source.data, target?.data.kind, edge.targetHandle);
    const imageCount = promptRunNodeOutputCount(source.data);
    for (let index = 0; index < imageCount; index += 1) {
      references.push({
        order: references.length,
        // TODO(R-02/R-03): 移除角色后删除此守卫
        role: isReferenceRole(role.role) ? role.role : "generic",
        roleNeedsConfirmation: role.roleNeedsConfirmation !== false,
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
    | "reference-role-invalid"
    | "reference-role-unconfirmed"
    | "reference-role-missing"
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

function exactPromptMatchesVariant(prompt: unknown, variant: PromptVariant): boolean {
  if (typeof prompt !== "string") return false;
  const suffix = `提示词变体：${variant.variantId}\n${variant.fullPrompt}`;
  return prompt.trimEnd().endsWith(suffix);
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

/**
 * Project the exact Provider evidence profile. Mask runs append one generated
 * guide image and the PNG mask after the ordered user references.
 */
export function promptRunReferenceRoleProfile(
  input: Pick<PromptRunAdmissionInput, "nodeKind" | "operationMode" | "references">,
): readonly EvaluationReferenceRoleProfileEntry[] {
  const profile: EvaluationReferenceRoleProfileEntry[] = (input.references ?? []).map(
    (reference, index) => {
      if (reference.order !== index || !Number.isSafeInteger(reference.order)) {
        throw new Error("参考角色顺序必须连续、从 0 开始并与输入数组一致。");
      }
      return { order: reference.order, role: reference.role };
    },
  );
  if (input.nodeKind === "mask-redraw" && input.operationMode === "mask-edit") {
    profile.push({ order: profile.length, role: "generic" });
    profile.push({ order: profile.length, role: "mask" });
  }
  return canonicalReferenceRoleProfile(profile);
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
  if (
    !isImageOperationMode(input.operationMode)
    || !allowedOperationModesForNode(input.nodeKind).includes(input.operationMode)
  ) {
    return {
      allowed: false,
      code: "operation-mode-incompatible",
      reason: `节点 ${input.nodeKind} 不支持当前 operationMode；必须显式选择该节点允许的模式。`,
    };
  }
  if (input.operationModeNeedsConfirmation === true) {
    return {
      allowed: false,
      code: "operation-mode-incompatible",
      reason: "该旧项目节点的 operationMode 尚未由用户确认；请明确选择生成或编辑模式。",
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
      reason: `${input.operationMode} 模式至少需要一张已确认角色的参考图。`,
    };
  }
  const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(input.modelId));
  const maxUserReferences = input.nodeKind === "mask-redraw"
    ? Math.min(MAX_MASK_USER_REFERENCE_IMAGES, Math.max(0, maxReferences - 1))
    : maxReferences;
  if (references.length > maxUserReferences) {
    return {
      allowed: false,
      code: "reference-limit-exceeded",
      reason: `模型 ${input.modelId} 在 ${input.operationMode} 模式最多接受 ${maxUserReferences} 张用户参考图；系统不会静默裁剪。`,
    };
  }
  const referenceIssues = referenceInputIssues(references);
  const invalidReferences = referenceIssues.filter((issue) => issue.code === "reference-role-invalid");
  if (invalidReferences.length > 0) {
    return {
      allowed: false,
      code: "reference-role-invalid",
      reason: "参考图角色或顺序无效。",
      references: promptRunAdmissionReferenceIssues(invalidReferences),
    };
  }
  try {
    promptRunReferenceRoleProfile(input);
  } catch (error) {
    return {
      allowed: false,
      code: "reference-role-invalid",
      reason: error instanceof Error ? error.message : "参考角色顺序无效。",
    };
  }
  const unconfirmedReferences = referenceIssues
    .filter((issue) => issue.code === "reference-role-unconfirmed");
  if (unconfirmedReferences.length > 0) {
    return {
      allowed: false,
      code: "reference-role-unconfirmed",
      reason: "参考图角色尚未全部确认",
      references: promptRunAdmissionReferenceIssues(unconfirmedReferences),
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
  if (!exactPromptMatchesVariant(input.prompt, variant)) {
    return {
      allowed: false,
      code: "prompt-drift",
      reason: "提示词正文已偏离所绑定变体；为避免借用旧评估结论，必须重新选择并确认。",
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
  const batchMatches = input.nodeKind === "mask-redraw" || input.batchSize === materialized.batchSize;
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
  if (input.references) {
    const roles = new Set(input.references.map((reference) => reference.role));
    const missingRoles = variant.requiredRoles.filter((role) => !roles.has(role));
    if (missingRoles.length > 0) {
      return {
        allowed: false,
        code: "reference-role-missing",
        reason: `缺少该变体要求的参考角色：${missingRoles.join("、")}`,
        variant,
      };
    }
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
  const referenceRoleProfile = promptRunReferenceRoleProfile(input);
  const support = effectivePromptSupport(
    variant,
    referenceRoleProfile,
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
