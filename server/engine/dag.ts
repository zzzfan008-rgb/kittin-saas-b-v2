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
  generationKindOf,
  isGeneratorNodeKind,
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
  NODE_SPECS,
} from "../../src/types/workflow";
import {
  DEFAULT_GENERATION_MODEL_ID,
  isImageModelId,
  isModelAllowedForNode,
  MASK_REDRAW_MODEL_ID,
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

/**
 * Release/evaluation admission is separate from graph-shape validation so
 * legacy migration tests can inspect a plan without authorising a paid run.
 * Both paid enqueue routes must call this immediately before enqueueing.
 *
 * v9（64 Phase 3）：仅 image 节点走异步 runQueue 的付费准入；text 节点走同步链路（§1b），
 * video 节点归 P2-e。v7 变体绑定准入已随 variant 概念删除——准入只做
 * 兼容性闸（operationMode/参考图/模型），服务端授权由 run queue 统一承担。
 */
export function assertPromptRunAdmissions(
  plan: ExecutionPlan,
): void {
  for (const step of plan.steps) {
    if (step.kind !== "image-generator") continue;
    const references = (step.inputReferences ?? []).map((reference, order) => ({
      order,
      sourceNodeId: reference.sourceNodeId,
    }));
    const decision = evaluatePromptRunAdmission(
      promptRunAdmissionInputFromParams(generationKindOf(step.kind), step.params, references),
    );
    if (!decision.allowed) {
      throw new PromptRunAdmissionError(step.nodeId, decision);
    }
  }
}

/** 运行前验证会产生费用的节点具备真实输入（runtime.md §3）。 */
export function assertPlanInputs(plan: ExecutionPlan, _edges: FlowEdge[]): void {
  for (const step of plan.steps) {
    // v8：只有 image-generator 产生付费图片；video-generator 归异步视频路径。
    if (step.kind !== "image-generator") continue;

    // 操作兼容（64 裁决 C5）：edit/mask-edit 需 ≥1 条参考图入边。
    // 只对 image-generator 生效：video-generator 的物理输入是 first-frame（0..1），
    // 其 edit 语义（首帧动效）由 first-frame 边与 schema handle 校验承载，无「参考图」概念。
    const operationMode = typeof step.params.operationMode === "string" ? step.params.operationMode : "generate";
    if ((operationMode === "edit" || operationMode === "mask-edit") && step.inputImages.length === 0) {
      throw new DagError(`Node ${step.nodeId} 操作 ${operationMode} 需要至少 1 条参考图入边`);
    }

    const modelId = step.params.modelId;
    if (!isImageModelId(modelId)) {
      throw new DagError(`Node ${step.nodeId} must select an explicit supported image model`);
    }
    if (!isModelAllowedForNode(modelId, generationKindOf(step.kind))) {
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

  // 65d §3.1 方案 A：onlyNodeId 指向 image 节点且带 editPrompt → 蒙版重绘/整图编辑合成 step。
  // 不走 generator 拓扑 filter 主链（image 节点会被 filter 挡在 steps 外），直接返回单个 synthetic step。
  // 运行时复用 generator 执行/账单/验证链；nodeId 用 image 节点 id，lifecycle 据此发 image-node-updated
  // （禁发 result-node-created，否则 C7 溯源判伪造）。runPlan 的 imageEditGate 已在 route 层保证
  // editPrompt 非空（缺口 4 的 400），这里再做一次自持判定，使 buildExecutionPlan 单独调用语义自洽。
  if (opts?.onlyNodeId) {
    const target = nodeMap.get(opts.onlyNodeId);
    if (target?.data.kind === "image") {
      const img = target.data;
      const editPrompt = typeof img.editPrompt === "string" ? img.editPrompt.trim() : "";
      if (editPrompt) {
        const mask = typeof img.mask === "string" && img.mask.trim() !== "" ? img.mask : undefined;
        const primary = img.outputImages[0];
        // §3.2：显式 modelId 对冲「删 carrierMask canonicalize 后无人落 sunburst」：
        // 有 mask=sunburst（官方蒙版重绘），无 mask=flare-vip（整图编辑定案）。
        const syntheticStep: NodeExecution = {
          nodeId: target.id,
          kind: "image-generator",
          inputImages: primary ? [primary] : [],
          inputReferences: primary
            ? [{ imageRef: primary, order: 0, sourceNodeId: target.id }]
            : [],
          upstream: [{ nodeId: target.id, images: primary ? [primary] : [] }],
          params: {
            operationMode: mask ? "mask-edit" : "edit",
            modelId: mask ? MASK_REDRAW_MODEL_ID : DEFAULT_GENERATION_MODEL_ID,
            mask,
            maskSourceRef: mask ? (img.maskSourceRef || primary) : undefined,
            featherRadius: mask ? (img.featherRadius ?? undefined) : undefined,
            inputTexts: [editPrompt],
            prompt: editPrompt,
            modelOptions: {},
            aspectRatio: "1:1",
            batchSize: 1,
            // 合成 run 标记：lifecycle 据此发 image-node-updated（§1.4），绝不发 result-node-created（§6 硬规则）。
            syntheticEdit: true,
          },
        };
        return { steps: [syntheticStep] };
      }
    }
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

  // v8：只有生成节点是可执行步骤；输入/结果节点是数据源，不产生 job。
  // 运行时由 runner 从本次 Run 的 outputs 解析真实输入；上游不在执行范围
  // （单节点重跑）时回退到快照。
  const steps: NodeExecution[] = sorted
    .filter((id) => isGeneratorNodeKind(nodeMap.get(id)!.data.kind))
    .map((id) => {
      const node = nodeMap.get(id)!;
      const data = node.data;

      // 上游按 edges 数组顺序；按 targetHandle 分区：prompt → text，reference/first-frame → image。
      const upstream: NodeExecution["upstream"] = [];
      const inputTexts: string[] = [];
      for (const e of edges) {
        if (e.target !== id) continue;
        const srcData = nodeMap.get(e.source)!.data;
        upstream.push({
          nodeId: e.source,
          images: extractOutputImages(srcData),
        });
        if (e.targetHandle === "prompt" && srcData.kind === "text") inputTexts.push(srcData.text);
      }

      const inputImages = upstream.flatMap((source) => source.images);
      const inputReferences = upstream.flatMap((source) => source.images.map((imageRef) => ({
        imageRef,
        sourceNodeId: source.nodeId,
      }))).map((reference, order) => ({ ...reference, order }));
      if (inputReferences.length !== inputImages.length) {
        throw new DagError(`Node ${id} reference role expansion does not match its input images`);
      }

      // 65d（决策 C 路线1）：蒙版重绘从生成节点彻底剥离为图片节点本地编辑动作。
      // 生成节点不再从上游 image 节点推断 carrierMask / canonicalize 成 sunburst（65a/65b Q3 已删），
      // 生成节点 operationMode 只剩 generate/edit；mask 只在图片节点自身被重跑（合成 step）时生效。
      const params = { ...extractParams(data), inputTexts };

      return {
        nodeId: id,
        kind: data.kind,
        inputImages,
        inputReferences,
        upstream,
        params,
      };
    });

  // 65d：删去原 65a 独占校验（一张蒙版只能服务一个生成节点的 image[0]）——
  // 蒙版已随决策 C 剥离出生成节点，不再存在"生成节点消费蒙版"的语义，独占约束随之失效；
  // 图片节点本地编辑由合成 step 单步承载（onlyNodeId=image 节点时），天然独占。
  return { steps };
}

/** 从节点 data 提取该节点作为下游输入源的图片引用（runtime.md §2）。 */
function extractOutputImages(data: WorkflowNodeData): string[] {
  switch (data.kind) {
    case "image":
      return data.outputImages;
    case "result-image":
      return data.images;
    case "text":
    case "video":
    case "image-generator":
    case "video-generator":
    case "result-video":
      return [];
  }
}

/** 从节点 data 提取该节点作为下游输入源的视频引用（runtime.md §2；v8 暂无消费方，v2v 预留）。 */
export function extractOutputVideos(data: WorkflowNodeData): string[] {
  switch (data.kind) {
    case "video":
      return data.outputVideos;
    case "result-video":
      return data.videos;
    default:
      return [];
  }
}

/** 提取节点执行参数（v9 七值 kind；operationMode 归节点 data，缺省不注入 = generate，64 裁决 A）。 */
function extractParams(data: WorkflowNodeData): Record<string, unknown> {
  switch (data.kind) {
    case "text":
      return { text: data.text };
    case "image":
    case "video":
    case "result-image":
    case "result-video":
      // 输入/结果节点不承载生成语义，无执行参数。
      return {};
    case "image-generator": {
      const modelId = data.modelId;
      if (!isImageModelId(modelId)) {
        throw new DagError("Node data for image-generator must select an explicit supported image model");
      }
      // v9（64 Phase 1 C4）：variant 绑定五字段注入删除；operationMode 显式归节点 data。
      // 65a：mask/maskSourceRef/featherRadius 已搬到上游 image 节点 data——
      // 本函数不再读取，蒙版注入在 buildExecutionPlan 组装面（见 maskCarrierForImageInput）。
      return {
        modelId,
        ...(data.operationMode ? { operationMode: data.operationMode } : {}),
        aspectRatio: data.aspectRatio,
        batchSize: data.batchSize,
        modelOptions: { ...(data.modelOptions as Record<string, unknown>) },
      };
    }
    case "video-generator":
      return {
        ...(typeof data.modelId === "string" ? { modelId: data.modelId } : {}),
        ...(data.modelOptions ? { modelOptions: { ...data.modelOptions } } : {}),
        ...(data.operationMode ? { operationMode: data.operationMode } : {}),
        aspectRatio: data.aspectRatio,
      };
  }
}
