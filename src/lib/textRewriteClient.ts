// 「✨ 帮我补全」按钮——提示词改写客户端（契约 docs/design/2026-10-12-prompt-rewrite/plan.md §2.2）。
//
// 与 maskUpload/editDraftUpload 的三点差异：
//   ① 改写失败返回 200+{rewritten:null,skipped:true}（非 5xx），前端静默降级保持原文；
//   ② 只读项目由 server 403 拦截，前端同步禁用按钮（双保险）；
//   ③ 写回走 useCoalescedTextEdit updateValue+flush（可 undo），与预设写入同款模式。

const REWRITE_ENDPOINT = "/api/text/rewrite";

export interface TextRewriteRequest {
  text: string;
  nodeId?: string;
  projectId: string;
}

export interface TextRewriteResult {
  /** 改写后的提示词；null = 改写失败/跳过（静默降级，保持原文）。 */
  rewritten: string | null;
  skipped?: boolean;
}

/**
 * 请求服务端改写提示词。
 * - 成功 200 {rewritten: string} → 返回改写文本；
 * - 200 {rewritten: null, skipped: true} → 返回 rewritten:null（调用方保持原文）；
 * - 403/400/网络错误 → 抛错（含 server 错误文案）。
 */
export async function rewritePromptText(
  params: TextRewriteRequest,
  fetcher: typeof fetch = fetch,
): Promise<TextRewriteResult> {
  const text = typeof params.text === "string" ? params.text.trim() : "";
  const projectId = typeof params.projectId === "string" ? params.projectId.trim() : "";
  if (!text || !projectId) {
    throw new Error("改写参数缺失");
  }

  const body: Record<string, string> = { text, projectId };
  if (typeof params.nodeId === "string" && params.nodeId.trim()) {
    body.nodeId = params.nodeId.trim();
  }

  const response = await fetcher(REWRITE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.status === 403) {
    let message = "只读项目不能改写提示词";
    try {
      const payload = await response.json() as { error?: string };
      if (typeof payload?.error === "string" && payload.error.trim()) message = payload.error.trim();
    } catch {
      // 非 JSON 错误体沿用默认文案。
    }
    throw new Error(message);
  }

  if (!response.ok) {
    let message = `提示词改写失败（HTTP ${response.status}）`;
    try {
      const payload = await response.json() as { error?: string };
      if (typeof payload?.error === "string" && payload.error.trim()) message = payload.error.trim();
    } catch {
      // 非 JSON 错误体沿用 HTTP 文案。
    }
    throw new Error(message);
  }

  let payload: { rewritten?: string | null; skipped?: boolean };
  try {
    payload = await response.json();
  } catch {
    throw new Error("提示词改写响应格式无效");
  }

  // 200 + rewritten:null + skipped:true → 静默降级，返回 null（调用方保持原文，不弹错）。
  if (payload.rewritten === null || payload.rewritten === undefined) {
    return { rewritten: null, skipped: payload.skipped === true };
  }

  return { rewritten: payload.rewritten.trim() };
}
