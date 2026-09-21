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
  // v8（runtime.md §2 extractOutputImages）：产参考图的只有输入层 image（上传/素材）
  // 与结果层 result-image。生成节点本身不承载产物，text/video 不产参考图。
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

/**
 * v7（mode 归属反转）：operationMode 的唯一事实源是选中变体（与
 * server/engine/dag.ts extractParams 的 `variant?.mode` 同源同语义）。
 * 返回受审变体；未绑定 / 未知变体返回对应 fail-closed 决策，沿用既有拒绝码。
 */
function resolveBoundPromptVariant(
  input: PromptRunAdmissionInput,
): PromptVariant | PromptRunAdmissionDecision {
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
  return variant;
}

function isPromptRunAdmissionDecision(
  value: PromptVariant | PromptRunAdmissionDecision,
): value is PromptRunAdmissionDecision {
  return "allowed" in value;
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
  // v8（data-model.md §4）：图片模型只允许用于**生图节点**。v7 的
  // `isModelAllowedForNode` 仍表达「只允许 image 节点」的旧语义（types/imageModels.ts:330），
  // 在 v8 会把每一次生图运行都拦在闸内，故此处按 v8 分层判定；等类型层修订后
  // 改为共用同一事实源（已上交 architect/R-89 立案）。
  // 过渡期保留 v7 的 "image" 别名：本闸同时被 server/engine/dag.ts（后端先落 v8 前的 step.kind）
  // 复用，逐字拒绝旧值会让服务端在迁移窗口内全量拒绝运行。
  if (input.nodeKind !== "image-generator" && input.nodeKind !== "image") {
    return {
      allowed: false,
      code: "model-node-incompatible",
      reason: `模型 ${input.modelId} 不支持节点 ${input.nodeKind} 的当前产品策略。`,
    };
  }
  // v7（mode 归属反转，R-76/R-78）：operationMode 不再存节点 data，唯一事实源是
  // 选中的提示词变体——与 server/engine/dag.ts extractParams 的 `variant?.mode`
  // 同源同语义。未绑定/未知变体在此 fail-closed；浏览器 UI 镜像闸与服务端 choke
  // point 共用同一推导，不再可能出现「服务端放行、UI 死拦」的双源漂移。
  const bound = resolveBoundPromptVariant(input);
  if (isPromptRunAdmissionDecision(bound)) return bound;
  const variant = bound;
  // 显式携带的 operationMode（服务端 step.params 会把推导结果落入 params）只允许
  // 与变体声明逐字一致；任何不一致都拒绝，而不是静默切换到另一调用模式。
  // 浏览器节点 data 不再携带该字段（R-76），缺省即直接采用 variant.mode。
  if (input.operationMode !== undefined && input.operationMode !== variant.mode) {
    return {
      allowed: false,
      code: "operation-mode-incompatible",
      reason: `operationMode ${String(input.operationMode)} 与所选提示词变体声明的 ${variant.mode} 不一致；模式只能由变体携带，系统不会静默切换。`,
    };
  }
  const operationMode: ImageOperationMode = variant.mode;
  if (!isImageOperationMode(operationMode)) {
    return {
      allowed: false,
      code: "operation-mode-incompatible",
      reason: `operationMode ${String(operationMode)} 不是受支持的调用模式。`,
    };
  }
  const contract = getImageModelContract(input.modelId);
  if (
    (operationMode === "generate" && !contract.generation)
    || (operationMode !== "generate" && !contract.edit)
  ) {
    return {
      allowed: false,
      code: "operation-mode-incompatible",
      reason: `模型 ${input.modelId} 的当前网关契约不支持 ${operationMode}。`,
    };
  }
  const references = input.references ?? [];
  if (operationMode === "generate" && references.length > 0) {
    return {
      allowed: false,
      code: "generate-reference-conflict",
      reason: "generate 模式不能携带参考图；请明确改为 edit，而不是由系统临时推断模式。",
    };
  }
  if (operationMode !== "generate" && references.length === 0) {
    return {
      allowed: false,
      code: "edit-reference-missing",
      reason: `${operationMode} 模式至少需要一张参考图。`,
    };
  }
  const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(input.modelId));
  // 蒙版参考图限位由变体 needsMask 声明驱动（runtime.md §1 第 5 步），与
  // server/engine/dag.ts assertPlanInputs 同一把尺：蒙版运行额外附加一张系统
  // 引导图，用户参考图限位相应减一。
  const maxUserReferences = variant.needsMask
    ? Math.min(MAX_MASK_USER_REFERENCE_IMAGES, Math.max(0, maxReferences - 1))
    : maxReferences;
  if (references.length > maxUserReferences) {
    return {
      allowed: false,
      code: "reference-limit-exceeded",
      reason: `模型 ${input.modelId} 在 ${operationMode} 模式最多接受 ${maxUserReferences} 张用户参考图；系统不会静默裁剪。`,
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

/**
 * v8 过渡桥：生成节点在提示词目录里仍以 v7 轴（`image` / `video`）登记
 * （`PromptVariant.nodeKind` 属服务端目录契约；目录轴迁移未完成，见 architect R-89）。
 * 绑定比较必须接受这组对映，否则每个 v8 生成节点都会被 fail-closed 拒绝。
 * 目录轴迁移完成后本函数与其调用点一并删除。
 */
function nodeKindMatchesCatalogAxis(nodeKind: string, catalogNodeKind: string): boolean {
  if (nodeKind === catalogNodeKind) return true;
  if (nodeKind === "image-generator" && catalogNodeKind === "image") return true;
  if (nodeKind === "video-generator" && catalogNodeKind === "video") return true;
  return false;
}

/** Exact, fail-closed admission with no cross-model or parameter fallback. */
export function evaluatePromptRunAdmission(
  input: PromptRunAdmissionInput,
  options: PromptRunAdmissionOptions = {},
): PromptRunAdmissionDecision {
  const compatibility = evaluatePromptRunCompatibility(input);
  if (compatibility) return compatibility;
  // 变体存在性与 mode 推导已在 compatibility 阶段 fail-closed；此处解析供后续
  // drift / 参数档案 / shutdown / 发布状态判定共用（目录查询是纯函数，重复求值无副作用）。
  const bound = resolveBoundPromptVariant(input);
  if (isPromptRunAdmissionDecision(bound)) return bound;
  const variant = bound;
  const bindingMatches = (
    input.modelId === variant.modelId
    && nodeKindMatchesCatalogAxis(input.nodeKind, variant.nodeKind)
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
  // v7（mode 归属反转，R-76/R-78）：operationMode 不再读节点 data，绑定变体时
  // 一律从受审目录推导（与 server/engine/dag.ts extractParams 的 variant?.mode
  // 同源同语义）；未知变体落 undefined，由 compatibility 的 unknown-variant 拒绝。
  // 未绑定变体时保留 params.operationMode 透传（仅无变体的直连回退路径会走到，
  // 随后仍被 missing-binding fail-closed）。
  const promptVariantId = typeof params.promptVariantId === "string"
    ? params.promptVariantId
    : undefined;
  // 与 dag.ts extractParams 同准绳：variant 绑定是唯一事实源，节点不自描述。
  // parameterProfileId / postprocessVersion 同样只从变体推导（applyVariant 不写
  // 这三项），服务端 step.params 里的值本身也是这样推导出来的，重复求值结果一致。
  const boundVariant = promptVariantId
    ? getGarmentPromptVariantById(promptVariantId)
    : undefined;
  const operationMode = promptVariantId
    ? boundVariant?.mode
    : params.operationMode;
  const parameterProfileId = promptVariantId
    ? boundVariant?.parameterProfileId
    : params.parameterProfileId;
  const postprocessVersion = boundVariant
    ? getModelParameterProfile(boundVariant.parameterProfileId)?.postprocess.version
    : params.postprocessVersion;
  // v7 绑定身份五字段（family/contract/evaluation）同样以受审目录钉死的变体为
  // 唯一事实源：内置模板节点只携带 promptVariantId（templates.ts imageNode），
  // applyVariant 写入或客户端伪造的差异值都不应影响受审身份。与服务端
  // dag.ts extractParams「variant 绑定是唯一事实源，节点不自描述」同准绳。
  const promptFamilyId = boundVariant
    ? boundVariant.familyId
    : params.promptFamilyId;
  const contractHash = boundVariant
    ? boundVariant.contractHash
    : params.contractHash;
  const evaluationVersion = boundVariant
    ? boundVariant.evaluationVersion
    : params.evaluationVersion;
  return {
    nodeKind,
    modelId: params.modelId as ImageModelId | undefined,
    retiredModelId: params.retiredModelId,
    modelSelectionNeedsConfirmation: params.modelSelectionNeedsConfirmation,
    operationMode,
    operationModeNeedsConfirmation: params.operationModeNeedsConfirmation,
    prompt: params.prompt,
    inputTexts: params.inputTexts,
    promptVariantId: params.promptVariantId,
    promptFamilyId,
    parameterProfileId,
    contractHash,
    evaluationVersion,
    postprocessVersion,
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
  // 浏览器镜像闸的上游 text 正文来自画布快照（dag.ts buildExecutionPlan
  // 同源收集），image 节点 data 自身不携带正文。
  return inputTexts === undefined ? input : { ...input, inputTexts };
}
