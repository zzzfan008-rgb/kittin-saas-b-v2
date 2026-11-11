/**
 * 参考图解析客户端：POST /api/reference-analysis/analyze。
 *
 * 与「帮我优化」不同，解析耗时更长（实测 6–15s），客户端超时放宽到 60s，
 * 服务端内部还有 45s 模型链总预算，正常不会用到这么久。
 */

const ENDPOINT = "/api/reference-analysis/analyze";
const CLIENT_TIMEOUT_MS = 60_000;

export interface ReferenceAnalysisMatch {
  order: number;
  role: string;
  label: string;
}

export interface ReferenceAnalysisUnmatched {
  order: number;
  label: string;
}

export interface ReferenceAnalysisFailed {
  order: number;
  role: string;
  label: string;
  reason: string;
}

export interface ReferenceAnalysisResponse {
  analysis: string | null;
  skipped?: boolean;
  reason?: string;
  matched: ReferenceAnalysisMatch[];
  unmatched: ReferenceAnalysisUnmatched[];
  failed?: ReferenceAnalysisFailed[];
  analyzedCount: number;
  droppedCount: number;
  elapsedMs: number;
  modelId?: string;
  truncated?: boolean;
}

export async function requestReferenceAnalysis(
  params: { projectId: string; nodeId: string },
  fetcher: typeof fetch = fetch,
): Promise<ReferenceAnalysisResponse> {
  const projectId = typeof params.projectId === "string" ? params.projectId.trim() : "";
  const nodeId = typeof params.nodeId === "string" ? params.nodeId.trim() : "";
  if (!projectId || !nodeId) throw new Error("解析参数缺失");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const response = await fetcher(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, nodeId }),
      signal: controller.signal,
    });
    if (response.status === 403) {
      let message = "只读项目不能解析参考图";
      try {
        const payload = await response.json() as { error?: string };
        if (typeof payload?.error === "string" && payload.error.trim()) message = payload.error.trim();
      } catch {
        // 非 JSON 错误体沿用默认文案
      }
      throw new Error(message);
    }
    if (!response.ok) {
      let detail = `解析失败（HTTP ${response.status}）`;
      try {
        const payload = await response.json() as { error?: string };
        if (typeof payload?.error === "string" && payload.error.trim()) detail = payload.error.trim();
      } catch {
        // 忽略非 JSON
      }
      throw new Error(detail);
    }
    return await response.json() as ReferenceAnalysisResponse;
  } finally {
    clearTimeout(timer);
  }
}
