/**
 * 参考图解析结果与文本节点的合并（纯函数）。
 *
 * 产品裁决（2026-11-10）：解析结果 **替换** 「补充要求：」之后的用户补充段，
 * 协议段（锚点之前，含锚点本身）逐字保留。无锚点的正文一律不改写，
 * 避免把普通用户文本套进工作流协议语义。
 *
 * 与 `src/lib/rewriteEligibility.ts` 共用同一份锚点定义（客户端镜像），
 * 服务端 `server/lib/textRewriter.ts` 保持逐字一致。
 */
import { findSupplementAnchor } from "./rewriteEligibility";

export interface MergeAnalysisResult {
  text: string;
  changed: boolean;
  /** 未找到补充位锚点时为 true，调用方应提示用户而非静默失败。 */
  missingAnchor?: boolean;
}

/**
 * 把解析段写回正文：`protocol(含锚点)` + 解析段。
 * @param original 当前正文
 * @param analysis 解析结果（服务端已清洗、不含协议词）
 */
export function mergeAnalysisIntoPrompt(original: string, analysis: string): MergeAnalysisResult {
  const text = typeof original === "string" ? original : "";
  const body = typeof analysis === "string" ? analysis.trim() : "";
  const anchor = findSupplementAnchor(text);
  if (!anchor) {
    return { text, changed: false, missingAnchor: true };
  }
  if (!body) return { text, changed: false };
  const head = text.slice(0, anchor.end);
  // 锚点后若原本另起一行，保持同样的排版；统一用换行开头，正文更清晰。
  const merged = `${head}\n${body}`;
  return { text: merged, changed: merged !== text };
}
