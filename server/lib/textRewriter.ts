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
import { rewriteSystemPrompt } from "./promptPresetsFrozen";
import {
  createTextChatCompletion,
  TextRewriteError,
  type TextChatCompletionArgs,
  type TextChatCompletionResult,
} from "./textChat";

/**
 * 运行时自动改写的 family 白名单（§7-2 拍板：首期仅 model-tryon；验证一轮效果后按打磨节奏放开）。
 * 只约束「运行时自动改写」入口；`✨` 补全按钮是用户手动触发，不受此限。
 */
export const REWRITE_ENABLED_FAMILIES = ["model-tryon"] as const;

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
  const chatCompletion = deps.chatCompletion ?? createTextChatCompletion;
  const systemPrompt = rewriteSystemPrompt(context.familyId);
  try {
    const result = await chatCompletion({
      model: deps.modelId ?? config.apiyiTextModelId(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: original },
      ],
    });
    const rewritten = result.content;
    if (typeof rewritten !== "string" || rewritten.trim() === "") {
      return { text: original, rewritten: false, reason: "empty_result" };
    }
    return { text: rewritten, rewritten: true };
  } catch (error) {
    // fail-closed：吞掉一切错误并回退原文，绝不阻断出图（§2.3/§4）。
    const reason = error instanceof TextRewriteError ? error.code : "unknown_error";
    return { text: original, rewritten: false, reason };
  }
}
