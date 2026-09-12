import type { WorkflowNodeData } from "@/types/workflow";

interface RunFailure {
  prompt?: string;
  error: string;
}

interface RunEventMeta {
  seq?: number;
  error?: string;
  model?: string;
  prompts?: string[];
  providerOutputSizes?: Array<string | null>;
  failures?: RunFailure[];
  startedAt?: number;
  finishedAt?: number;
}

export type NodeStatusRunEvent =
  | (RunEventMeta & {
      type: "node-status";
      nodeId: string;
      status: "queued" | "running" | "retry_wait" | "cancel_requested";
      images?: never;
    })
  | (RunEventMeta & {
      type: "node-status";
      nodeId: string;
      status: "success";
      images: string[];
    })
  | (Omit<RunEventMeta, "error"> & {
      type: "node-status";
      nodeId: string;
      status: "error" | "outcome_unknown" | "cancelled";
      error: string;
      images?: never;
    });

export type RunEvent =
  | NodeStatusRunEvent
  | { seq?: number; type: "done" }
  | { seq?: number; type: "run-error"; nodeId?: string; error: string; finishedAt?: number };

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

/** Normalize untrusted SSE payloads before they enter the document store. */
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

/** Failure events preserve existing output images; only success replaces them. */
export function applyRunEventToNode(
  data: WorkflowNodeData,
  event: NodeStatusRunEvent,
): WorkflowNodeData {
  if (event.status === "success") {
    return {
      ...data,
      ...(data.kind !== "image-input" && data.kind !== "result" ? { outputImages: event.images } : {}),
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

export function requestedResultCount(data: WorkflowNodeData): number {
  switch (data.kind) {
    case "sketch-to-render":
    case "ai-modify":
      return Math.max(1, Math.min(8, Number(data.batchSize) || 1));
    case "print-mutate":
      return Math.max(1, Math.min(8, Number(data.count) || 1));
    case "fabric-recolor":
      return Math.max(1, Math.min(8, data.colors.length || 1));
    case "mask-redraw":
      return 1;
    default:
      return 1;
  }
}
