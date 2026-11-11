/**
 * 「找回已生成的图片」客户端（2026-11-10）。
 *
 * 服务端只按运行期存证的上游 URL 重新取图，不调用模型、不重复计费。
 * 失败时把服务端给的可读原因原样抛给 UI（例如"上游没有回传图片地址"）。
 */

export interface RunRecoveryResult {
  recovered: true;
  images: string[];
  runId: string;
}

export class RunRecoveryError extends Error {
  readonly reason?: string;

  constructor(message: string, reason?: string) {
    super(message);
    this.name = "RunRecoveryError";
    this.reason = reason;
  }
}

export async function requestRunRecovery(runId: string): Promise<RunRecoveryResult> {
  const response = await fetch(`/api/runs/${encodeURIComponent(runId)}/recover`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  let payload: unknown = undefined;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }
  const body = (payload ?? {}) as { error?: unknown; reason?: unknown; images?: unknown };
  if (!response.ok) {
    throw new RunRecoveryError(
      typeof body.error === "string" && body.error.trim() ? body.error : "找回失败，请稍后再试",
      typeof body.reason === "string" ? body.reason : undefined,
    );
  }
  const images = Array.isArray(body.images)
    ? body.images.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
  if (images.length === 0) throw new RunRecoveryError("没有取回任何图片");
  return { recovered: true, images, runId };
}
