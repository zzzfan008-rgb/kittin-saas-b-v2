// 「✨ 帮我补全」补充位锚点检测（P1 §4 A 案，前端本地 UX 防护）。
//
// server/lib/textRewriter.ts 按同一锚点切分「冻结协议段 / 用户补充段」（协议只读）。
// 节点正文 = 冻结协议 + 锚点行 + 用户补充内容；锚点后为空时 server 返回
// {rewritten:null,skipped:true}（reason:empty_supplement，wire 不透出 reason）。
//
// src→server 跨域 import 被 depcruise 禁止，这里是同值客户端镜像（与
// REWRITE_SUPPLEMENT_ANCHOR 逐字一致；tests/prompt-presets-catalog 同层的
// 客户端冻结表已是同款镜像模式）。漂移由单测 + 契约评审兜。

/** 补充位锚点行（与 server REWRITE_SUPPLEMENT_ANCHOR 逐字一致）。 */
export const REWRITE_SUPPLEMENT_ANCHOR = "用户补充要求（如为空则忽略本行）：";

export interface RewriteEligibility {
  /** 是否可发补全请求。 */
  eligible: boolean;
  /**
   * 不可发时的原因（供按钮 title / 禁用提示）；eligible=true 时为 null。
   * - "empty_text"：正文整体为空（空槽位）；
   * - "empty_supplement"：含锚点但锚点后无补充内容（协议模板未填补充段）。
   */
  reason: "empty_text" | "empty_supplement" | null;
}

/**
 * 判断当前正文是否值得发补全请求（纯函数）。
 * - 无锚点（非协议模板，普通用户正文）：非空即可；
 * - 含锚点：协议段只读，锚点后补充段为空则无事可补（不发请求，提示先写补充）。
 */
export function rewriteEligibility(rawText: string): RewriteEligibility {
  const text = typeof rawText === "string" ? rawText : "";
  if (text.trim() === "") return { eligible: false, reason: "empty_text" };
  const anchorIndex = text.indexOf(REWRITE_SUPPLEMENT_ANCHOR);
  if (anchorIndex === -1) return { eligible: true, reason: null };
  const supplement = text.slice(anchorIndex + REWRITE_SUPPLEMENT_ANCHOR.length);
  if (supplement.trim() === "") return { eligible: false, reason: "empty_supplement" };
  return { eligible: true, reason: null };
}
