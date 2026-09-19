/**
 * DAG 工作流执行计划构建。
 * 输入 React Flow 的 nodes/edges JSON，Kahn 拓扑排序输出 ExecutionPlan。
 * 支持环检测与两种局部重跑：只跑选中节点，或选中节点及其下游。
 *
 * v7 三基础节点模型（R-48/R-53）：extractOutputImages / extractParams 收敛为
 * text/image/video 三分支；text 正文沿 text 边传播（runtime.md §0/§1/§1b）。
 */
import type {
  ExecutionPlan,
  NodeExecution,
  NodeKind,
  WorkflowNodeData,
} from "../../src/types/workflow";
import {
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
  NODE_SPECS,
} from "../../src/types/workflow";
import {
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
} from "../../src/types/imageModels";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionInputFromParams,
  type PromptRunAdmissionDecision,
} from "../../src/lib/promptRunAdmission";
import { getGarmentPromptVariantById } from "../../src/lib/garmentPromptPresets";

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
 *
 * v7：仅 image 节点走异步 runQueue 的付费准入；text 节点走同步链路（§1b），
 * video 节点归 P2-e。准入继续按 promptVariantId 工作，语义不变。
 */
export function assertPromptRunAdmissions(
  plan: ExecutionPlan,
  options: { evaluationRun?: boolean } = {},
): void {
  for (const step of plan.steps) {
    if (step.kind !== "image") continue;
    const references = (step.inputReferences ?? []).map((reference, order) => ({
      order,
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

/** 运行前验证会产生费用的节点具备真实输入（runtime.md §3）。 */
export function assertPlanInputs(plan: ExecutionPlan, _edges: FlowEdge[]): void {
  for (const step of plan.steps) {
    // text 节点走同步链路（无参考图/模型 ID 约束由同步路由负责）；video 归 P2-e。
    if (step.kind !== "image") continue;

    const modelId = step.params.modelId;
    if (!isImageModelId(modelId)) {
      throw new DagError(`Node ${step.nodeId} must select an explicit supported image model`);
    }
    if (!isModelAllowedForNode(modelId, step.kind)) {
      throw new DagError(`Model ${modelId} is not allowed for node ${step.nodeId}`);
    }

    // INV-2（graph-invariants.md §1）：至少一条上游 text 节点正文非空。
    const inputTexts = Array.isArray(step.params.inputTexts)
      ? step.params.inputTexts.filter((value): value is string => typeof value === "string")
      : [];
    if (!inputTexts.some((text) => text.trim() !== "")) {
      throw new DagError(`Node ${step.nodeId} 的上游文本节点还没有填写提示词`);
    }

    // 参考图数量（保留检查第 2 条）。
    const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(modelId));
    const needsMask = step.params.operationMode === "mask-edit";
    const maxUserReferences = needsMask
      ? Math.min(MAX_MASK_USER_REFERENCE_IMAGES, Math.max(0, maxReferences - 1))
      : maxReferences;
    if (step.inputImages.length > maxUserReferences) {
      throw new DagError(
        `Node ${step.nodeId} accepts at most ${maxUserReferences} reference images for ${modelId}`,
      );
    }

    // needsMask 变体的蒙版检查（Q4=A：由变体声明驱动；过渡期按 mask-edit 模式判定）。
    if (needsMask) {
      if (typeof step.params.mask !== "string" || !step.params.mask) {
        throw new DagError(`Node ${step.nodeId} requires a saved PNG mask`);
      }
      if (typeof step.params.maskSourceRef !== "string" || step.params.maskSourceRef !== step.inputImages[0]) {
        throw new DagError(`Node ${step.nodeId} mask does not match its current source image`);
      }
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

    // 上游按 edges 数组顺序；text 节点正文沿 text 边传播（runtime.md §0）。
    const upstream: NodeExecution["upstream"] = [];
    const inputTexts: string[] = [];
    for (const e of edges) {
      if (e.target !== id) continue;
      const srcData = nodeMap.get(e.source)!.data;
      upstream.push({
        nodeId: e.source,
        images: extractOutputImages(srcData),
      });
      if (srcData.kind === "text") inputTexts.push(srcData.text);
    }

    const inputImages = upstream.flatMap((source) => source.images);
    const inputReferences = upstream.flatMap((source) => source.images.map((imageRef) => ({
      imageRef,
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
      params: { ...extractParams(data), inputTexts },
    };
  });

  return { steps };
}

/** 从节点 data 提取该节点当前已知的输出图片（v7 三值 kind）。 */
function extractOutputImages(data: WorkflowNodeData): string[] {
  switch (data.kind) {
    case "image":
      return data.outputImages;
    case "text":
    case "video":
      return [];
  }
}

/** 提取节点执行参数（v7 三值 kind；operationMode 由提示词变体携带）。 */
function extractParams(data: WorkflowNodeData): Record<string, unknown> {
  switch (data.kind) {
    case "text":
      return {
        text: data.text,
        ...(typeof data.promptVariantId === "string" ? { promptVariantId: data.promptVariantId } : {}),
        ...(typeof data.modelId === "string" ? { modelId: data.modelId } : {}),
        ...(data.modelOptions ? { modelOptions: { ...data.modelOptions } } : {}),
      };
    case "image": {
      const modelId = data.modelId;
      if (!isImageModelId(modelId)) {
        throw new DagError("Node data for image must select an explicit supported image model");
      }
      // operationMode 由提示词变体携带（mode 归属反转，runtime.md §1）；此处从变体
      // 解析落入 params，供准入（binding-mismatch 校验 operationMode === variant.mode）
      // 与运行链路共用。未选变体则缺省，由准入的 missing-binding 拒绝。
      const operationMode = typeof data.promptVariantId === "string"
        ? getGarmentPromptVariantById(data.promptVariantId)?.mode
        : undefined;
      return {
        modelId,
        ...(operationMode ? { operationMode } : {}),
        aspectRatio: data.aspectRatio,
        batchSize: data.batchSize,
        modelOptions: { ...(data.modelOptions as Record<string, unknown>) },
        ...(typeof data.promptVariantId === "string" ? { promptVariantId: data.promptVariantId } : {}),
        ...(typeof data.promptFamilyId === "string" ? { promptFamilyId: data.promptFamilyId } : {}),
        ...(typeof data.parameterProfileId === "string" ? { parameterProfileId: data.parameterProfileId } : {}),
        ...(typeof data.contractHash === "string" ? { contractHash: data.contractHash } : {}),
        ...(typeof data.evaluationVersion === "string" ? { evaluationVersion: data.evaluationVersion } : {}),
        ...(typeof data.postprocessVersion === "string" ? { postprocessVersion: data.postprocessVersion } : {}),
        ...(typeof data.mask === "string" ? { mask: data.mask } : {}),
        ...(typeof data.maskSourceRef === "string" ? { maskSourceRef: data.maskSourceRef } : {}),
        ...(typeof data.featherRadius === "number" && Number.isFinite(data.featherRadius)
          ? { featherRadius: data.featherRadius }
          : {}),
      };
    }
    case "video":
      return {
        ...(typeof data.promptVariantId === "string" ? { promptVariantId: data.promptVariantId } : {}),
        ...(typeof data.modelId === "string" ? { modelId: data.modelId } : {}),
        ...(data.modelOptions ? { modelOptions: { ...data.modelOptions } } : {}),
        ...(typeof data.contractHash === "string" ? { contractHash: data.contractHash } : {}),
        ...(typeof data.evaluationVersion === "string" ? { evaluationVersion: data.evaluationVersion } : {}),
      };
  }
}
