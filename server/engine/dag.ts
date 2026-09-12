/**
 * DAG 工作流执行计划构建。
 * 输入 React Flow 的 nodes/edges JSON，Kahn 拓扑排序输出 ExecutionPlan。
 * 支持环检测与两种局部重跑：只跑选中节点，或选中节点及其下游。
 */
import type {
  ExecutionPlan,
  NodeExecution,
  NodeKind,
  WorkflowNodeData,
} from "../../src/types/workflow";
import {
  MASK_PIPELINE_VERSION,
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
  NODE_SPECS,
  allowedOperationModesForNode,
  referenceRoleForTargetHandle,
  resolveReferenceEdgeData,
  type ReferenceRole,
} from "../../src/types/workflow";
import {
  MASK_REDRAW_MODEL_ID,
  imageModelOptionsErrorForOperation,
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
} from "../../src/types/imageModels";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionInputFromParams,
  type PromptRunAdmissionDecision,
} from "../../src/lib/promptRunAdmission";

/** React Flow 节点/边的最小结构（前端传入） */
export interface FlowNode {
  id: string;
  type?: string;
  data: WorkflowNodeData & { kind: NodeKind };
}

export interface FlowEdge {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: unknown;
}

/**
 * A visibly labelled target handle is an explicit role selection made by the
 * user while connecting the edge. Keep this map narrow: ordinary handles and
 * all unknown nodes remain pending unless the edge already carries a role.
 */
function resolveExecutionReferenceRole(
  edge: FlowEdge,
  targetKind: NodeKind,
  sourceData: WorkflowNodeData,
): { role: ReferenceRole; roleNeedsConfirmation: boolean } {
  const explicit = resolveReferenceEdgeData(edge.data, sourceData);
  if (edge.data && typeof edge.data === "object" && !Array.isArray(edge.data)) {
    const raw = edge.data as Record<string, unknown>;
    if (Object.hasOwn(raw, "role")) return explicit;
  }
  const fixedRole = referenceRoleForTargetHandle(targetKind, edge.targetHandle);
  return fixedRole
    ? { role: fixedRole, roleNeedsConfirmation: false }
    : explicit;
}

export class DagError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DagError";
  }
}

export class PromptRunAdmissionError extends DagError {
  readonly nodeId: string;
  readonly decision: PromptRunAdmissionDecision;

  constructor(nodeId: string, decision: PromptRunAdmissionDecision) {
    super(`Node ${nodeId} prompt admission blocked: ${decision.reason}`);
    this.name = "PromptRunAdmissionError";
    this.nodeId = nodeId;
    this.decision = decision;
  }
}

/**
 * Release/evaluation admission is separate from graph-shape validation so
 * legacy migration tests can inspect a plan without authorising a paid run.
 * Both paid enqueue routes must call this immediately before enqueueing.
 */
export function assertPromptRunAdmissions(
  plan: ExecutionPlan,
  options: { evaluationRun?: boolean } = {},
): void {
  for (const step of plan.steps) {
    if (!NODE_SPECS[step.kind].providerId) continue;
    const references = (step.inputReferences ?? []).map((reference, order) => ({
      role: reference.role,
      order,
      roleNeedsConfirmation: reference.roleNeedsConfirmation,
      sourceNodeId: reference.sourceNodeId,
    }));
    const decision = evaluatePromptRunAdmission(
      promptRunAdmissionInputFromParams(step.kind, step.params, references),
      options,
    );
    if (!decision.allowed) {
      throw new PromptRunAdmissionError(step.nodeId, decision);
    }
  }
}

/** 运行前验证会产生费用的节点具备真实图片输入。 */
export function assertPlanInputs(plan: ExecutionPlan, edges: FlowEdge[]): void {
  const executingNodeIds = new Set(plan.steps.map((step) => step.nodeId));
  for (const step of plan.steps) {
    const spec = NODE_SPECS[step.kind];
    if (!spec.providerId) continue;
    if (
      step.params.modelSelectionNeedsConfirmation === true
      || (typeof step.params.retiredModelId === "string" && step.params.retiredModelId.trim())
    ) {
      throw new DagError(
        `Node ${step.nodeId} uses a retired model and must be manually reconfigured before running`,
      );
    }
    if (!isImageModelId(step.params.modelId)) {
      throw new DagError(`Node ${step.nodeId} must select an explicit supported image model`);
    }
    const modelId = step.params.modelId;
    if (!isModelAllowedForNode(modelId, step.kind)) {
      throw new DagError(`Model ${modelId} is not allowed for node ${step.nodeId}`);
    }
    const operationMode = step.params.operationMode;
    const allowedModes = allowedOperationModesForNode(step.kind);
    if (!allowedModes.includes(operationMode as never)) {
      throw new DagError(
        `Node ${step.nodeId} operationMode must be one of: ${allowedModes.join(", ")}`,
      );
    }
    if (step.params.operationModeNeedsConfirmation === true) {
      throw new DagError(`Node ${step.nodeId} operationMode must be confirmed before running`);
    }
    const optionsError = imageModelOptionsErrorForOperation(
      modelId,
      step.params.modelOptions,
      operationMode as "generate" | "edit" | "mask-edit",
    );
    if (optionsError) {
      throw new DagError(`Node ${step.nodeId} modelOptions ${optionsError}`);
    }
    if (
      step.kind === "mask-redraw"
      && Object.keys(step.params.modelOptions as Record<string, unknown>).length > 0
    ) {
      throw new DagError(
        `Node ${step.nodeId} modelOptions must be empty; mask size is derived at runtime`,
      );
    }
    const usableImages = (step.upstream ?? []).flatMap((upstream) =>
      executingNodeIds.has(upstream.nodeId) ? ["__runtime_output__"] : upstream.images,
    );
    const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(modelId));
    const maxUserReferences = step.kind === "mask-redraw"
      ? Math.min(MAX_MASK_USER_REFERENCE_IMAGES, Math.max(0, maxReferences - 1))
      : maxReferences;
    if (usableImages.length > maxUserReferences) {
      const qualifier = step.kind === "mask-redraw" ? " user" : "";
      throw new DagError(
        `Node ${step.nodeId} accepts at most ${maxUserReferences}${qualifier} reference images for ${modelId}`,
      );
    }
    if (operationMode === "generate") {
      if (usableImages.length > 0) {
        throw new DagError(`Node ${step.nodeId} is generate mode and cannot accept reference images`);
      }
      const prompt = typeof step.params.prompt === "string" ? step.params.prompt.trim() : "";
      if (!prompt) throw new DagError(`Node ${step.nodeId} requires a prompt in generate mode`);
      continue;
    }
    if (step.kind === "fabric-recolor") {
      const garmentEdges = edges.filter(
        (edge) => edge.target === step.nodeId && edge.targetHandle !== "fabric",
      );
      const garmentIds = new Set(garmentEdges.map((edge) => edge.source));
      const garmentImages = (step.upstream ?? [])
        .filter((upstream) => garmentIds.has(upstream.nodeId))
        .flatMap((upstream) =>
          executingNodeIds.has(upstream.nodeId) ? ["__runtime_output__"] : upstream.images,
        );
      if (garmentImages.length === 0) {
        throw new DagError(`Node ${step.nodeId} requires a garment image`);
      }
      continue;
    }
    if (step.kind === "mask-redraw") {
      if (usableImages.length === 0) throw new DagError(`Node ${step.nodeId} requires an upstream image`);
      if (typeof step.params.mask !== "string" || !step.params.mask) {
        throw new DagError(`Node ${step.nodeId} requires a saved PNG mask`);
      }
      if (typeof step.params.maskSourceRef !== "string" || step.params.maskSourceRef !== usableImages[0]) {
        throw new DagError(`Node ${step.nodeId} mask does not match its current source image`);
      }
      continue;
    }
    if (usableImages.length === 0) {
      throw new DagError(`Node ${step.nodeId} requires an upstream image`);
    }
  }
}

/**
 * 构建执行计划。
 * @param opts.onlyNodeId 从指定节点开始构建局部计划
 * @param opts.includeDownstream 是否把指定节点的下游也纳入计划（默认 true，保持旧接口语义）
 */
export function buildExecutionPlan(
  nodes: FlowNode[],
  edges: FlowEdge[],
  opts?: { onlyNodeId?: string; includeDownstream?: boolean },
): ExecutionPlan {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 校验边引用的节点存在
  for (const e of edges) {
    if (!nodeMap.has(e.source)) throw new DagError(`Edge source not found: ${e.source}`);
    if (!nodeMap.has(e.target)) throw new DagError(`Edge target not found: ${e.target}`);
  }

  // 局部重跑：目标节点始终在范围内；按需继续扩展到全部下游。
  let scope: Set<string> | null = null;
  if (opts?.onlyNodeId) {
    if (!nodeMap.has(opts.onlyNodeId)) {
      throw new DagError(`Node not found: ${opts.onlyNodeId}`);
    }
    scope = new Set([opts.onlyNodeId]);
    if (opts.includeDownstream !== false) {
      const queue = [opts.onlyNodeId];
      while (queue.length) {
        const cur = queue.shift()!;
        for (const e of edges) {
          if (e.source === cur && !scope.has(e.target)) {
            scope.add(e.target);
            queue.push(e.target);
          }
        }
      }
    }
  }

  const inScope = (id: string) => scope === null || scope.has(id);
  const scopedNodes = nodes.filter((n) => inScope(n.id));
  const scopedEdges = edges.filter((e) => inScope(e.source) && inScope(e.target));

  // Kahn 拓扑排序
  const indegree = new Map<string, number>();
  for (const n of scopedNodes) indegree.set(n.id, 0);
  for (const e of scopedEdges) indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);

  const queue = scopedNodes.filter((n) => indegree.get(n.id) === 0).map((n) => n.id);
  const sorted: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    sorted.push(id);
    for (const e of scopedEdges) {
      if (e.source !== id) continue;
      const d = (indegree.get(e.target) ?? 0) - 1;
      indegree.set(e.target, d);
      if (d === 0) queue.push(e.target);
    }
  }

  if (sorted.length !== scopedNodes.length) {
    const remaining = scopedNodes.filter((n) => !sorted.includes(n.id)).map((n) => n.id);
    throw new DagError(`Cycle detected in workflow, involved nodes: ${remaining.join(", ")}`);
  }

  // 生成执行步骤：记录每个节点的上游依赖（节点 ID + 计划期快照）。
  // 运行时由 runner 从本次 Run 的 outputs 解析真实输入；
  // 上游不在执行范围（单节点重跑）时回退到快照。
  const steps: NodeExecution[] = sorted.map((id) => {
    const node = nodeMap.get(id)!;
    const data = node.data;

    // 上游按 edges 数组顺序（result 节点多输入时保持连接顺序）
    const upstream: NodeExecution["upstream"] = [];
    for (const e of edges) {
      if (e.target !== id) continue;
      const srcData = nodeMap.get(e.source)!.data;
      const reference = resolveExecutionReferenceRole(e, data.kind, srcData);
      upstream.push({
        nodeId: e.source,
        images: extractOutputImages(srcData),
        referenceRole: reference.role,
        roleNeedsConfirmation: reference.roleNeedsConfirmation,
      });
    }

    const inputImages = upstream.flatMap((source) => source.images);
    const inputReferences = upstream.flatMap((source) => source.images.map((imageRef) => ({
      imageRef,
      role: source.referenceRole ?? "generic",
      roleNeedsConfirmation: source.roleNeedsConfirmation,
      sourceNodeId: source.nodeId,
    }))).map((reference, order) => ({ ...reference, order }));
    if (inputReferences.length !== inputImages.length) {
      throw new DagError(`Node ${id} reference role expansion does not match its input images`);
    }

    return {
      nodeId: id,
      kind: data.kind,
      inputImages,
      inputReferences,
      upstream,
      params: extractParams(data),
    };
  });

  return { steps };
}

/** 从节点 data 提取该节点当前已知的输出图片 */
function extractOutputImages(data: WorkflowNodeData): string[] {
  switch (data.kind) {
    case "image-input":
      return data.imageUrl ? [data.imageUrl] : [];
    case "sketch-to-render":
    case "ai-modify":
    case "fabric-recolor":
    case "upscale":
    case "print-extract":
    case "print-mutate":
    case "mask-redraw":
      return data.outputImages ?? [];
    case "result":
      return data.images ?? [];
  }
}

/** 提取节点执行参数（prompt / aspectRatio / batchSize / fabricImageUrl 等） */
function extractParams(data: WorkflowNodeData): Record<string, unknown> {
  const modelFields = (_preferredAspectRatio = "1:1") => {
    if (!NODE_SPECS[data.kind].providerId) return {};
    if (
      !("modelId" in data)
      || !isImageModelId(data.modelId)
      || !isModelAllowedForNode(data.modelId, data.kind)
    ) {
      throw new DagError(`Node data for ${data.kind} must select an explicit supported image model`);
    }
    const modelId = data.modelId;
    const operationMode = "operationMode" in data ? data.operationMode : undefined;
    const allowedModes = allowedOperationModesForNode(data.kind);
    if (!allowedModes.includes(operationMode as never)) {
      throw new DagError(`Node data for ${data.kind} has an invalid operationMode`);
    }
    const modelOptions = "modelOptions" in data ? data.modelOptions : undefined;
    const optionsError = imageModelOptionsErrorForOperation(
      modelId,
      modelOptions,
      operationMode as "generate" | "edit" | "mask-edit",
    );
    if (optionsError) {
      throw new DagError(`Node data for ${data.kind} modelOptions ${optionsError}`);
    }
    return {
      modelId,
      operationMode,
      operationModeNeedsConfirmation: "operationModeNeedsConfirmation" in data
        ? data.operationModeNeedsConfirmation === true
        : false,
      modelSelectionNeedsConfirmation: "modelSelectionNeedsConfirmation" in data
        ? data.modelSelectionNeedsConfirmation === true
        : false,
      ...(typeof data.retiredModelId === "string" && data.retiredModelId.trim()
        ? { retiredModelId: data.retiredModelId }
        : {}),
      modelOptions: { ...(modelOptions as Record<string, unknown>) },
      ...(typeof data.promptVariantId === "string" ? { promptVariantId: data.promptVariantId } : {}),
      ...(typeof data.promptFamilyId === "string" ? { promptFamilyId: data.promptFamilyId } : {}),
      ...(typeof data.parameterProfileId === "string" ? { parameterProfileId: data.parameterProfileId } : {}),
      ...(typeof data.contractHash === "string" ? { contractHash: data.contractHash } : {}),
      ...(typeof data.evaluationVersion === "string" ? { evaluationVersion: data.evaluationVersion } : {}),
      ...(typeof data.postprocessVersion === "string" ? { postprocessVersion: data.postprocessVersion } : {}),
    };
  };
  switch (data.kind) {
    case "image-input":
      return { imageUrl: data.imageUrl, imageRole: data.imageRole };
    case "sketch-to-render":
      return {
        prompt: data.prompt, aspectRatio: data.aspectRatio, batchSize: data.batchSize,
        ...modelFields(data.aspectRatio),
      };
    case "ai-modify":
      return {
        prompt: data.prompt, aspectRatio: data.aspectRatio, batchSize: data.batchSize,
        ...modelFields(data.aspectRatio),
      };
    case "fabric-recolor":
      return {
        prompt: data.prompt,
        colors: data.colors,
        fabricImageUrl: data.fabricImageUrl,
        ...modelFields(),
      };
    case "upscale":
      return { imageSize: data.imageSize, ...modelFields() };
    case "print-extract":
      return { prompt: data.prompt, ...modelFields() };
    case "print-mutate":
      return { prompt: data.prompt, count: data.count, ...modelFields() };
    case "mask-redraw":
      if (
        data.modelId !== MASK_REDRAW_MODEL_ID
        || data.operationMode !== "mask-edit"
        || imageModelOptionsErrorForOperation(
          MASK_REDRAW_MODEL_ID,
          data.modelOptions,
          "mask-edit",
        )
        || Object.keys(data.modelOptions).length > 0
      ) {
        throw new DagError(
          "Node data for mask-redraw requires gpt-image-2, mask-edit, and empty modelOptions",
        );
      }
      return {
        prompt: data.prompt, mask: data.mask, maskSourceRef: data.maskSourceRef,
        maskPipelineVersion: MASK_PIPELINE_VERSION,
        operationMode: "mask-edit", operationModeNeedsConfirmation: false,
        modelId: MASK_REDRAW_MODEL_ID, modelOptions: {},
        ...(typeof data.promptVariantId === "string" ? { promptVariantId: data.promptVariantId } : {}),
        ...(typeof data.promptFamilyId === "string" ? { promptFamilyId: data.promptFamilyId } : {}),
        ...(typeof data.parameterProfileId === "string" ? { parameterProfileId: data.parameterProfileId } : {}),
        ...(typeof data.contractHash === "string" ? { contractHash: data.contractHash } : {}),
        ...(typeof data.evaluationVersion === "string" ? { evaluationVersion: data.evaluationVersion } : {}),
        ...(typeof data.postprocessVersion === "string" ? { postprocessVersion: data.postprocessVersion } : {}),
      };
    case "result":
      return { note: data.note };
  }
}
