import type {
  NodeStatusRunEvent,
  ResultNodeCreatedRunEvent,
  RunEvent,
  RunEventMeta,
  RunFailure,
  WorkflowNodeData,
} from "@/types/workflow";

/**
 * RunEvent 客户端投影（runtime.md §3）。
 *
 * RunEvent 的类型契约**单点声明在 `@/types/workflow`**（architect R-89：backend 发射 /
 * 本模块消费，两侧共用一份声明）；这里只做「未知 JSON → 已知事件」的运行时归一。
 *
 * v8 关键语义变化：
 * - 生成节点的产物**不写回节点 data**（product 归结果节点）；node-status(success) 只收口运行态。
 * - 产物通过 `result-node-created` 事件告知前端实例化结果节点（§3.1/§3.2）。
 *   前端不得本地凭空造结果节点（否则刷新/重连丢产物）。
 */
export type {
  NodeStatusRunEvent,
  ResultNodeCreatedRunEvent,
  RunEvent,
  RunEventMeta,
  RunFailure,
};

function optionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function nullableStringArray(value: unknown): Array<string | null> | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => optionalString(item) ?? null);
}

function runFailures(value: unknown): RunFailure[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const failures = value.flatMap((item): RunFailure[] => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as { prompt?: unknown; error?: unknown };
    const error = optionalString(candidate.error);
    if (!error) return [];
    return [{ error, ...(optionalString(candidate.prompt) ? { prompt: optionalString(candidate.prompt) } : {}) }];
  });
  return failures.length ? failures : undefined;
}

/**
 * Normalize untrusted SSE payloads before they enter the document store.
 * 未知/损坏的事件一律抛错（由消费端收口），绝不静默猜测字段。
 */
export function normalizeRunEvent(value: unknown): RunEvent {
  if (!value || typeof value !== "object") throw new Error("运行事件格式无效");
  const raw = value as Record<string, unknown>;
  const seq = optionalFiniteNumber(raw.seq);
  if (raw.type === "done") return { type: "done", ...(seq !== undefined ? { seq } : {}) };
  if (raw.type === "run-error") {
    return {
      type: "run-error",
      error: optionalString(raw.error) ?? "运行失败",
      ...(optionalString(raw.nodeId) ? { nodeId: optionalString(raw.nodeId) } : {}),
      ...(optionalFiniteNumber(raw.finishedAt) !== undefined ? { finishedAt: optionalFiniteNumber(raw.finishedAt) } : {}),
      ...(seq !== undefined ? { seq } : {}),
    };
  }
  if (raw.type === "result-node-created") {
    const resultNodeId = optionalString(raw.resultNodeId);
    if (!resultNodeId) throw new Error("结果节点事件缺少节点标识");
    const sourceGeneratorId = optionalString(raw.sourceGeneratorId);
    if (!sourceGeneratorId) throw new Error("结果节点事件缺少来源生成节点");
    const runId = optionalString(raw.runId);
    if (!runId) throw new Error("结果节点事件缺少运行编号");
    const mediaKind = raw.mediaKind === "image" || raw.mediaKind === "video" ? raw.mediaKind : undefined;
    if (!mediaKind) throw new Error("结果节点事件缺少媒体类型");
    return {
      type: "result-node-created",
      resultNodeId,
      sourceGeneratorId,
      runId,
      mediaKind,
      urls: stringArray(raw.urls) ?? [],
      ...(nullableStringArray(raw.outputSizes) ? { outputSizes: nullableStringArray(raw.outputSizes) } : {}),
      ...(seq !== undefined ? { seq } : {}),
    };
  }
  if (raw.type !== "node-status") throw new Error("运行事件类型无效");
  const nodeId = optionalString(raw.nodeId);
  if (!nodeId) throw new Error("运行事件缺少节点标识");
  const common: RunEventMeta = {
    ...(seq !== undefined ? { seq } : {}),
    ...(optionalString(raw.error) ? { error: optionalString(raw.error) } : {}),
    ...(optionalString(raw.model) ? { model: optionalString(raw.model) } : {}),
    ...(stringArray(raw.prompts) ? { prompts: stringArray(raw.prompts) } : {}),
    ...(nullableStringArray(raw.providerOutputSizes)
      ? { providerOutputSizes: nullableStringArray(raw.providerOutputSizes) }
      : {}),
    ...(runFailures(raw.failures) ? { failures: runFailures(raw.failures) } : {}),
    ...(optionalFiniteNumber(raw.startedAt) !== undefined ? { startedAt: optionalFiniteNumber(raw.startedAt) } : {}),
    ...(optionalFiniteNumber(raw.finishedAt) !== undefined ? { finishedAt: optionalFiniteNumber(raw.finishedAt) } : {}),
  };
  if (raw.status === "success") {
    return { ...common, type: "node-status", nodeId, status: "success", images: stringArray(raw.images) ?? [] };
  }
  if (raw.status === "error" || raw.status === "outcome_unknown" || raw.status === "cancelled") {
    const { error: commonError, ...meta } = common;
    const fallback = raw.status === "cancelled" ? "任务已取消" : raw.status === "outcome_unknown" ? "生成结果未知" : "生成失败";
    return { ...meta, type: "node-status", nodeId, status: raw.status, error: commonError ?? fallback };
  }
  if (raw.status === "queued" || raw.status === "running" || raw.status === "retry_wait" || raw.status === "cancel_requested") {
    return { ...common, type: "node-status", nodeId, status: raw.status };
  }
  throw new Error("运行事件状态无效");
}

/**
 * 运行态回写：只改 status/error。
 *
 * v8（runtime.md §1/§3）：生成节点不承载媒体，产物落在结果节点（由 `result-node-created`
 * 驱动实例化）。因此成功事件**绝不**改写任何节点的产物字段——v7 的「成功即覆盖
 * outputImages / outputText」正是「结果不可追溯」的根因。失败事件同样保留既有数据。
 */
export function applyRunEventToNode(
  data: WorkflowNodeData,
  event: NodeStatusRunEvent,
): WorkflowNodeData {
  if (event.status === "success") {
    return {
      ...data,
      status: "success",
      error: event.error,
    } as WorkflowNodeData;
  }
  return {
    ...data,
    status: event.status,
    error: event.error,
  } as WorkflowNodeData;
}

/** 用户选择/预期的一次运行产出数量（决定「最近结果」先建几张排队卡）。 */
export function requestedResultCount(data: WorkflowNodeData): number {
  switch (data.kind) {
    case "image-generator":
      return Math.max(1, Math.min(8, Number(data.batchSize) || 1));
    case "result-image":
      return Math.max(1, Math.min(8, data.images.length || 1));
    case "result-video":
      return Math.max(1, Math.min(8, data.videos.length || 1));
    case "text":
    case "image":
    case "video":
    case "video-generator":
      return 1;
  }
}
