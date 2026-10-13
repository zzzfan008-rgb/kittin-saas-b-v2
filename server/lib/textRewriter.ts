/**
 * 提示词改写层 · 改写业务核心（prompt 组装 + fail-closed + family 选型）。
 *
 * 契约：docs/design/2026-10-12-prompt-rewrite/plan.md §2.3 / §3 / §4 / §7-2。
 * - 两个入口共享本核心：①运行时自动改写（runner，受 REWRITE_ENABLED_FAMILIES 白名单门控）；
 *   ②`✨ 帮我补全` 按钮（POST /api/text/rewrite，手动触发，**不受白名单限制**）。
 * - **fail-closed（最高优先级）**：任何改写失败/超时/429/断连/空结果一律回退「用原文跑」，
 *   绝不让改写层阻断出图；本函数本身不抛（错误吞掉并标注 reason）。
 * - 改写只作用于 userPrompt 段，不进 modeSystemText（那是冻结出图协议文本，语义不同）。
 */
import type { NodeKind } from "../../src/types/workflow";
import type { ImageOperationMode } from "../../src/types/imageOperations";
import { config } from "../config";
import { rewriteSystemPrompt, REWRITE_SYSTEM_PROMPTS } from "./promptPresetsFrozen";
import {
  createTextChatCompletion,
  TextRewriteError,
  type TextChatCompletionArgs,
  type TextChatCompletionResult,
} from "./textChat";

/**
 * 运行时自动改写的 family 白名单（§7-2 拍板：首期仅 model-tryon；验证一轮效果后放开）。
 * 只约束「运行时自动改写」入口；`✨` 补全按钮是用户手动触发、族无关，不受此限。
 *
 * 过渡态（plan.md §2.3/§5）：familyId 落标（A 机制：ImageGeneratorNodeData.familyId +
 * workflowSchema 字段清单 + 模板打标）就绪前，白名单初始为**空集合** = 运行时自动改写
 * 全局关闭（fail-closed 安全）；落标就绪后改为 ["model-tryon"] 启用。空白名单下运行时
 * 改写自然跳过，不影响 ✨按钮与出图主链。
 */
export const REWRITE_ENABLED_FAMILIES: readonly string[] = ["model-tryon"];

/** §4 成本口径：一次 run 最多 1 次改写调用（runner 内计数断言，§6-f）。 */
export const MAX_REWRITE_CALLS_PER_RUN = 1;

/** 运行时自动改写的白名单判定：familyId 命中白名单才改写；✨ 按钮不走此判定。 */
export function isRewriteEnabledFamily(familyId: string | undefined): boolean {
  return familyId !== undefined && (REWRITE_ENABLED_FAMILIES as readonly string[]).includes(familyId);
}

export interface RewriteContext {
  /** 下游生成节点 kind（image-generator / video-generator）；默认上下文为 image 通用服装改写。 */
  kind: NodeKind;
  mode: ImageOperationMode;
  /** 解析自下游节点的 familyId；缺省/未命中 → "default" system prompt（§3）。 */
  familyId?: string;
}

/**
 * model-tryon 冻结协议的「用户补充位」锚点行（P1 契约增量 §2.2-a，2026-10-12 拍板）。
 * 节点正文 = 冻结协议 + 本行 + 用户补充内容。改写时按本锚点切分：
 * 协议段（锚点行含本身）原样保留并作为输出前缀回填；只把锚点后的用户补充内容交给改写器。
 * 锚点后为空 → 无事可补，返回 skipped（reason: "empty_supplement"）。
 */
export const REWRITE_SUPPLEMENT_ANCHOR = "用户补充要求（如为空则忽略本行）：";

/**
 * 截断/残缺输出检测阈值：输出长度 < 输入长度 × 0.8 视为残缺，回退原文（reason: "too_short"）。
 * 依据 P1 实测：max_tokens=512 截断时 gemini 报 finish_reason="stop" 而非 "length"，
 * 单靠 finish_reason 漏检；长度比是兜底防线（改写是扩写/补全，正常输出不应显著短于输入）。
 */
export const REWRITE_MIN_OUTPUT_RATIO = 0.8;

/** 改写输入切分结果：protocol = 协议段（含锚点行，原样保留）；supplement = 锚点后用户补充内容。 */
export interface RewriteSplit {
  protocol: string;
  supplement: string;
}

/**
 * 按补充位锚点切分改写输入（P1 §4：协议段只读保护）。
 * 文本不含锚点 → { protocol: "", supplement: 全文 }（非协议模板走整段改写，现行为不变）。
 * 含锚点：protocol 含锚点行在内的前缀（末尾换行保留原样）；supplement 为锚点行之后的剩余内容。
 */
export function splitRewriteInput(text: string): RewriteSplit {
  const anchorIndex = text.indexOf(REWRITE_SUPPLEMENT_ANCHOR);
  if (anchorIndex === -1) return { protocol: "", supplement: text };
  const anchorEnd = anchorIndex + REWRITE_SUPPLEMENT_ANCHOR.length;
  return { protocol: text.slice(0, anchorEnd), supplement: text.slice(anchorEnd) };
}

export interface RewriteOutcome {
  /** 最终可用提示词：改写成功 = 改写文；否则 = 原文（fail-closed）。 */
  text: string;
  /** 是否发生了实际改写（true=用改写文；false=回退原文或空输入跳过）。 */
  rewritten: boolean;
  /** 跳过/回退原因（empty_prompt / empty_result / text_* 错误码 / unknown_error）。 */
  reason?: string;
}

export interface RewriteDeps {
  /** 测试注入 mock 文本通道；缺省真实 createTextChatCompletion。 */
  chatCompletion?: (args: TextChatCompletionArgs) => Promise<TextChatCompletionResult>;
  /** 缺省 config.apiyiTextModelId()。 */
  modelId?: string;
}

/**
 * 改写一条用户提示词。空输入跳过（不调用通道）；其余任何失败/空结果回退原文。
 * 返回的 `text` 恒为可直接使用的提示词——调用方无需关心是否改写成功。
 *
 * P1 契约增量（2026-10-12，plan.md §2.2-a / §2.3-a）：
 * - **协议段只读保护**：输入含补充位锚点（REWRITE_SUPPLEMENT_ANCHOR）时，协议段（含锚点行）
 *   原样保留作为输出前缀；只有锚点后的用户补充内容进改写器。锚点后为空 → skipped。
 * - **截断/残缺检测**：finish_reason="length" 或输出长度 < 输入长度 × REWRITE_MIN_OUTPUT_RATIO
 *   → 视为失败回退原文（reason: "truncated" / "too_short"），绝不写回半句话。
 */
export async function rewriteUserPrompt(
  userPrompt: string,
  context: RewriteContext,
  deps: RewriteDeps = {},
): Promise<RewriteOutcome> {
  const original = typeof userPrompt === "string" ? userPrompt : "";
  if (original.trim() === "") {
    return { text: original, rewritten: false, reason: "empty_prompt" };
  }
  // 协议段只读保护：按补充位锚点切分，只改写用户补充段（P1 §4）。
  const { protocol, supplement } = splitRewriteInput(original);
  if (protocol !== "" && supplement.trim() === "") {
    return { text: original, rewritten: false, reason: "empty_supplement" };
  }
  const rewriteTarget = protocol === "" ? original : supplement;
  const chatCompletion = deps.chatCompletion ?? createTextChatCompletion;
  // system prompt 形态必须与实际输入形态匹配（P1 缺陷修复）：锚点切分命中时改写器只收
  // 补充段，用「补充段专用」条目（协议不在消息内、不得复述/自创协议）；否则整段改写走原条目。
  const supplementPromptKey = protocol === "" ? undefined : `${context.familyId ?? "default"}-supplement`;
  const supplementPrompt =
    supplementPromptKey !== undefined
      ? (REWRITE_SYSTEM_PROMPTS as Readonly<Record<string, string>>)[supplementPromptKey]
      : undefined;
  const systemPrompt = supplementPrompt ?? rewriteSystemPrompt(context.familyId);
  try {
    const result = await chatCompletion({
      model: deps.modelId ?? config.apiyiTextModelId(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rewriteTarget },
      ],
    });
    const rewritten = result.content;
    if (typeof rewritten !== "string" || rewritten.trim() === "") {
      return { text: original, rewritten: false, reason: "empty_result" };
    }
    // 截断检测 ①：finish_reason="length" → 输出不完整，回退原文（P1 实测 stop 漏检的互补防线）。
    if (result.finishReason === "length") {
      return { text: original, rewritten: false, reason: "truncated" };
    }
    // 截断检测 ②：输出显著短于输入 → 残缺（512 事故实测 finish_reason 报 "stop" 但只剩半句）。
    if (rewritten.trim().length < rewriteTarget.trim().length * REWRITE_MIN_OUTPUT_RATIO) {
      return { text: original, rewritten: false, reason: "too_short" };
    }
    // 协议段原样回填为输出前缀（结构保证，替代"依赖模型自觉逐字保留协议"）。
    const finalText = protocol === "" ? rewritten : protocol + rewritten.trim();
    return { text: finalText, rewritten: true };
  } catch (error) {
    // fail-closed：吞掉一切错误并回退原文，绝不阻断出图（§2.3/§4）。
    const reason = error instanceof TextRewriteError ? error.code : "unknown_error";
    return { text: original, rewritten: false, reason };
  }
}
