/**
 * DAG 工作流执行计划构建。
 * 输入 React Flow 的 nodes/edges JSON，Kahn 拓扑排序输出 ExecutionPlan。
 * 支持环检测与两种局部重跑：只跑选中节点，或选中节点及其下游。
 *
 * v7（P2-c 编译桥 + R3 前置检查）：三值 kind。assertPlanInputs 按
 * contracts/graph-invariants.md 落地 INV-1（text 上游）与 INV-2（正文非空）；
 * operationMode 由提示词变体携带（mode 归属反转），节点不再自述。
 * P2-b 的三分支执行器重写（runner 文案迁移、needsMask 联动、text 同步链路）
 * 不在本卡范围；此处保证 v7 图结构与准入语义可编译、可运行。
 */
import type {
  ExecutionPlan,
  NodeExecution,
  NodeKind,
  WorkflowNodeData,
} from "../../src/types/workflow";
import {
  MAX_REFERENCE_IMAGES,
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

/** text 边判定（graph-invariants.md §2）：targetHandle === "prompt"。 */
function isPromptEdge(edge: FlowEdge): boolean {
  return edge.targetHandle === "prompt";
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

/**
 * 运行前置检查（R3 / graph-invariants.md INV-1 + INV-2 + 参考图限位）。
 * v7：kind 特化检查（fabric/garment、mask-redraw 专属）随旧 kind 退役删除；
 * 蒙版检查改由变体声明（mode === "mask-edit"）驱动。
 */
export function assertPlanInputs(plan: ExecutionPlan, edges: FlowEdge[]): void {
  const executingNodeIds = new Set(plan.steps.map((step) => step.nodeId));

  for (const step of plan.steps) {
    if (step.kind === "text") {
      // text 运行路径（Q1=B）：输入 = 上游 text 串联 + 自身正文；组装结果为空则拒绝。
      const input = typeof step.params.text === "string" ? step.params.text.trim() : "";
      if (!input) {
        throw new DagError(`Node ${step.nodeId} has no text input to run (inv2.emptyTextUpstream)`);
      }
      continue;
    }

    // ---- image / video：模型契约 + INV-1/INV-2 + 参考图限位 ----
    if (!isImageModelId(step.params.modelId)) {
      throw new DagError(`Node ${step.nodeId} must select an explicit supported image model`);
    }
    const modelId = step.params.modelId;
    if (!isModelAllowedForNode(modelId, step.kind)) {
      throw new DagError(`Model ${modelId} is not allowed for node ${step.nodeId}`);
    }

    const usableImages = (step.upstream ?? []).flatMap((upstream) =>
      executingNodeIds.has(upstream.nodeId) ? ["__runtime_output__"] : upstream.images,
    );
    const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(modelId));
    const maxUserReferences = step.kind === "video" ? 1 : maxReferences;
    if (usableImages.length > maxUserReferences) {
      throw new DagError(
        `Node ${step.nodeId} accepts at most ${maxUserReferences} reference images for ${modelId}`,
      );
    }

    // INV-1（结构）：image/video 必须有 ≥1 条 text→该节点的边；INV-2（内容）：正文非空。
    const promptEdges = edges.filter((edge) => edge.target === step.nodeId && isPromptEdge(edge));
    const promptTexts = promptEdges.flatMap((edge) => {
      const source = plan.steps.find((candidate) => candidate.nodeId === edge.source);
      const text = typeof source?.params.text === "string" ? source.params.text : "";
      return executingNodeIds.has(edge.source) && !source ? ["__runtime_text__"] : [text];
    });
    if (promptTexts.length === 0) {
      throw new DagError(
        `「${String(step.params.label ?? step.nodeId)}」需要至少一个上游文本节点提供提示词 (inv1.missingTextUpstream)`,
      );
    }
    if (!promptTexts.some((text) => text.trim() !== "")) {
      throw new DagError(
        `「${String(step.params.label ?? step.nodeId)}」的上游文本节点还没有填写提示词 (inv2.emptyTextUpstream)`,
      );
    }

    // 蒙版检查（Q4=A：由变体声明驱动；mode=mask-edit 的变体要求蒙版就位）。
    if (step.params.operationMode === "mask-edit") {
      if (usableImages.length === 0) throw new DagError(`Node ${step.nodeId} requires an upstream image`);
      if (typeof step.params.mask !== "string" || !step.params.mask) {
        throw new DagError(`Node ${step.nodeId} requires a saved PNG mask`);
      }
      if (typeof step.params.maskSourceRef !== "string" || step.params.maskSourceRef !== usableImages[0]) {
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

    // 上游按 edges 数组顺序（result 节点多输入时保持连接顺序）
    const upstream: NodeExecution["upstream"] = [];
    for (const e of edges) {
      if (e.target !== id) continue;
      const srcData = nodeMap.get(e.source)!.data;
      upstream.push({
        nodeId: e.source,
        images: extractOutputImages(srcData),
      });
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
      params: extractParams(data),
    };
  });

  return { steps };
}

/** 从节点 data 提取该节点当前已知的输出图片（v7：只有 image 节点产参考图）。 */
function extractOutputImages(data: WorkflowNodeData): string[] {
  if (data.kind === "image") return data.outputImages ?? [];
  return [];
}

/** 提取节点执行参数（v7 三分支；operationMode 由变体携带，自变体 mode 透传）。 */
function extractParams(data: WorkflowNodeData): Record<string, unknown> {
  const promptBindingFields = {
    label: data.label,
    ...(typeof data.promptVariantId === "string" ? { promptVariantId: data.promptVariantId } : {}),
    ...(typeof data.promptFamilyId === "string" ? { promptFamilyId: data.promptFamilyId } : {}),
    ...(typeof data.parameterProfileId === "string" ? { parameterProfileId: data.parameterProfileId } : {}),
    ...(typeof data.contractHash === "string" ? { contractHash: data.contractHash } : {}),
    ...(typeof data.evaluationVersion === "string" ? { evaluationVersion: data.evaluationVersion } : {}),
    ...(typeof data.postprocessVersion === "string" ? { postprocessVersion: data.postprocessVersion } : {}),
  };
  switch (data.kind) {
    case "text":
      return {
        ...promptBindingFields,
        text: data.text,
        outputText: data.outputText,
        ...(typeof data.modelId === "string" ? { modelId: data.modelId } : {}),
        modelOptions: { ...(data.modelOptions ?? {}) },
      };
    case "image":
      if (!isImageModelId(data.modelId) || !isModelAllowedForNode(data.modelId, data.kind)) {
        throw new DagError(`Node data for image must select an explicit supported image model`);
      }
      return {
        ...promptBindingFields,
        aspectRatio: data.aspectRatio,
        batchSize: data.batchSize,
        modelId: data.modelId,
        modelOptions: { ...(data.modelOptions ?? {}) },
        ...(data.mask !== undefined ? { mask: data.mask } : {}),
        ...(data.maskSourceRef !== undefined ? { maskSourceRef: data.maskSourceRef } : {}),
        ...(data.featherRadius !== undefined ? { featherRadius: data.featherRadius } : {}),
      };
    case "video":
      return {
        ...promptBindingFields,
        ...(isImageModelId(data.modelId) ? { modelId: data.modelId } : {}),
        modelOptions: { ...(data.modelOptions ?? {}) },
        outputVideos: data.outputVideos,
      };
  }
}
