import type { PersistedWorkflow } from "@/types/workflow";
import type { ServerInitialDraftSnapshot } from "@/store/flowStore";

export class InitialDraftApiError extends Error {
  readonly status: number;
  readonly currentRevision?: number;
  readonly currentDraftId?: string;

  constructor(status: number, body: Record<string, unknown>) {
    super(typeof body.error === "string" ? body.error : `HTTP ${status}`);
    this.name = "InitialDraftApiError";
    this.status = status;
    if (typeof body.currentRevision === "number") this.currentRevision = body.currentRevision;
    if (typeof body.currentDraftId === "string") this.currentDraftId = body.currentDraftId;
  }
}

function isWorkflow(value: unknown): value is PersistedWorkflow {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PersistedWorkflow>;
  return Number.isInteger(candidate.schemaVersion) &&
    Array.isArray(candidate.nodes) && Array.isArray(candidate.edges);
}

export function parseInitialDraft(value: unknown): ServerInitialDraftSnapshot {
  if (!value || typeof value !== "object") throw new Error("初始草稿响应格式无效");
  const draft = value as Partial<ServerInitialDraftSnapshot>;
  if (
    typeof draft.id !== "string" || !draft.id ||
    typeof draft.name !== "string" || !draft.name ||
    !isWorkflow(draft.flow) ||
    typeof draft.revision !== "number" || !Number.isSafeInteger(draft.revision) || draft.revision < 0 ||
    draft.lifecycle !== "initial_draft" ||
    typeof draft.createdAt !== "string" ||
    typeof draft.updatedAt !== "string"
  ) throw new Error("初始草稿响应格式无效");
  return draft as ServerInitialDraftSnapshot;
}

async function json(response: Response): Promise<Record<string, unknown>> {
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new InitialDraftApiError(response.status, body);
  return body;
}

export async function fetchInitialDraft(signal?: AbortSignal): Promise<ServerInitialDraftSnapshot | null> {
  const response = await fetch("/api/projects/initial-draft", {
    cache: "no-store",
    signal,
  });
  const body = await json(response);
  return body.draft === null ? null : parseInitialDraft(body.draft);
}

export async function bootstrapInitialDraft(input: {
  id: string;
  name?: string;
  flow: PersistedWorkflow;
  signal?: AbortSignal;
}): Promise<{ created: boolean; draft: ServerInitialDraftSnapshot }> {
  const response = await fetch("/api/projects/initial-draft/bootstrap", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: input.id, ...(input.name ? { name: input.name } : {}), flow: input.flow }),
    signal: input.signal,
  });
  const body = await json(response);
  return { created: body.created === true, draft: parseInitialDraft(body.draft) };
}

export async function syncInitialDraft(input: {
  id: string;
  expectedRevision: number;
  name: string;
  flow: PersistedWorkflow;
  signal?: AbortSignal;
}): Promise<ServerInitialDraftSnapshot> {
  const response = await fetch(`/api/projects/initial-draft/${encodeURIComponent(input.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      expectedRevision: input.expectedRevision,
      name: input.name,
      flow: input.flow,
    }),
    signal: input.signal,
  });
  const body = await json(response);
  return parseInitialDraft(body.draft);
}

export async function abandonInitialDraft(input: {
  id: string;
  expectedRevision: number;
}): Promise<{ purgeAfter: string }> {
  const response = await fetch(`/api/projects/initial-draft/${encodeURIComponent(input.id)}`, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ confirm: true, expectedRevision: input.expectedRevision }),
  });
  const body = await json(response);
  if (typeof body.purgeAfter !== "string") throw new Error("草稿放弃响应格式无效");
  return { purgeAfter: body.purgeAfter };
}

export function isServerInitialDraftPristine(draft: ServerInitialDraftSnapshot): boolean {
  if (!/^未修改项目名称\d{8}000000$/.test(draft.name) || draft.flow.edges.length !== 0) return false;
  if (draft.flow.nodes.length !== 1) return false;
  const node = draft.flow.nodes[0];
  return node.data.kind === "image-input" && node.data.status === "idle" && !node.data.imageUrl;
}
