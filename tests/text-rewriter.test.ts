/**
 * 提示词改写层契约测试（纯单元，mock 文本通道，不碰 PostgreSQL）。
 * 覆盖契约 plan.md §6：
 *   a 非空改写成功；b 空 prompt 跳过不调通道；c fail-closed 回退原文 + request_rejected 不重试；
 *   d 重试预算（首发 +1：失败 1 次后成功 / 连续 2 次失败放弃）；e system prompt 选型与硬约束；
 *   g 请求体断言（model=gemini-3.8-flash、reasoning_effort=medium、绝不含 minimal / thinkingBudget）。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/text-rewriter.test.ts
 */
import assert from "node:assert/strict";
import {
  rewriteUserPrompt,
  isRewriteEnabledFamily,
  REWRITE_ENABLED_FAMILIES,
  MAX_REWRITE_CALLS_PER_RUN,
  REWRITE_SUPPLEMENT_ANCHOR,
  REWRITE_MIN_OUTPUT_RATIO,
  splitRewriteInput,
  type RewriteContext,
} from "../server/lib/textRewriter";
import {
  createTextChatCompletion,
  TextRewriteError,
} from "../server/lib/textChat";
import { rewriteSystemPrompt, REWRITE_SYSTEM_PROMPTS } from "../server/lib/promptPresetsFrozen";

let passed = 0;
function ok(name: string, fn: () => void | Promise<void>): void {
  Promise.resolve()
    .then(fn)
    .then(() => {
      passed += 1;
      console.log(`  ✓ ${name}`);
    })
    .catch((error) => {
      console.error(`  ✗ ${name}`);
      console.error(error);
      process.exitCode = 1;
    });
}

const defaultContext: RewriteContext = { kind: "image-generator", mode: "edit" };

// 文本通道传输层测试必须注入 apiKey/baseUrl：createTextChatCompletion 生产默认读
// config.apiyiApiKey()（无 .env/无 APIYI_API_KEY 的 CI 会 throw required），单测不得依赖环境密钥。
const textChatDeps = { apiKey: "test-key", baseUrl: "https://text-chat.test.local" };

function jsonResponse(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
}

function chatOk(content: string) {
  return async () => ({
    content,
    finishReason: "stop",
    usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
  });
}

// a. 非空 prompt 改写成功 → 返回改写文本
ok("a: 非空 prompt 改写成功，返回改写文本", async () => {
  const outcome = await rewriteUserPrompt("一位穿红裙的女性室内站立", defaultContext, {
    chatCompletion: chatOk("一位身穿鲜红色长裙的女性模特在室内柔和自然光下自然站立"),
  });
  assert.equal(outcome.rewritten, true);
  assert.match(outcome.text, /红/);
});

// b. 空 prompt → 不调用通道、返回原文（跳过）
ok("b: 空/纯空白 prompt 跳过改写且不调用通道", async () => {
  let calls = 0;
  const blank = await rewriteUserPrompt("   ", defaultContext, {
    chatCompletion: async () => { calls += 1; throw new Error("不应被调用"); },
  });
  assert.equal(blank.rewritten, false);
  assert.equal(blank.reason, "empty_prompt");
  assert.equal(calls, 0);
});

// c. 通道抛各类可重试错误 → 回退原文
ok("c: 通道抛 text_transport_error/text_rate_limited/text_upstream_error → 回退原文", async () => {
  for (const code of ["text_transport_error", "text_rate_limited", "text_upstream_error"] as const) {
    const outcome = await rewriteUserPrompt("红色连衣裙", defaultContext, {
      chatCompletion: async () => { throw new TextRewriteError(code, "x", { retryable: true }); },
    });
    assert.equal(outcome.rewritten, false, code);
    assert.equal(outcome.reason, code);
    assert.equal(outcome.text, "红色连衣裙", "fail-closed 必须回退原文");
  }
});

ok("c: 通道抛 text_request_rejected/text_bad_response → 同样回退原文", async () => {
  for (const code of ["text_request_rejected", "text_bad_response"] as const) {
    const outcome = await rewriteUserPrompt("红色连衣裙", defaultContext, {
      chatCompletion: async () => { throw new TextRewriteError(code, "x", { retryable: false }); },
    });
    assert.equal(outcome.rewritten, false);
    assert.equal(outcome.text, "红色连衣裙");
  }
});

ok("c: 通道抛任意未知错误 → 回退原文（unknown_error），不外抛", async () => {
  const outcome = await rewriteUserPrompt("红裙", defaultContext, {
    chatCompletion: async () => { throw new Error("boom"); },
  });
  assert.equal(outcome.rewritten, false);
  assert.equal(outcome.reason, "unknown_error");
  assert.equal(outcome.text, "红裙");
});

ok("c: 通道返回空内容 → empty_result 回退原文", async () => {
  const outcome = await rewriteUserPrompt("红裙", defaultContext, {
    chatCompletion: async () => ({ content: "   ", finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } }),
  });
  assert.equal(outcome.rewritten, false);
  assert.equal(outcome.reason, "empty_result");
  assert.equal(outcome.text, "红裙");
});

// d. 重试预算：429 第一次成功第二次 → 通过（恰好 2 次调用）
ok("d: 429 失败 1 次后成功 → 重试 1 次通过", async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const fetchImpl = (async (_url: string, _init?: RequestInit) => {
    calls += 1;
    if (calls === 1) {
      return jsonResponse({ error: { message: "rate limited" } }, { status: 429, headers: { "retry-after": "0" } });
    }
    return jsonResponse({
      choices: [{ message: { content: "改写结果" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    });
  }) as typeof fetch;
  const result = await createTextChatCompletion(
    { model: "gemini-3.8-flash", messages: [{ role: "user", content: "x" }] },
    { ...textChatDeps, fetchImpl, sleep: async (ms) => { sleeps.push(ms); } },
  );
  assert.equal(calls, 2, "应恰好首发 + 1 次重试");
  assert.equal(result.content, "改写结果");
});

ok("d: 连续 2 次 500 → 放弃并抛 text_upstream_error（恰好 2 次）", async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    return jsonResponse({ error: { message: "upstream" } }, { status: 500 });
  }) as typeof fetch;
  await assert.rejects(
    createTextChatCompletion(
      { model: "gemini-3.8-flash", messages: [{ role: "user", content: "x" }] },
      { ...textChatDeps, fetchImpl, sleep: async () => {} },
    ),
    (error: unknown) => error instanceof TextRewriteError && error.code === "text_upstream_error",
  );
  assert.equal(calls, 2, "首发 + 1 次重试后必须放弃，绝不第 3 次");
});

ok("d: 400 request_rejected → 不重试（只调用 1 次）", async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    return jsonResponse({ error: { message: "bad request" } }, { status: 400 });
  }) as typeof fetch;
  await assert.rejects(
    createTextChatCompletion(
      { model: "gemini-3.8-flash", messages: [{ role: "user", content: "x" }] },
      { ...textChatDeps, fetchImpl, sleep: async () => {} },
    ),
    (error: unknown) => error instanceof TextRewriteError && error.code === "text_request_rejected",
  );
  assert.equal(calls, 1, "配置/密钥问题重试无意义，只调用 1 次");
});

// e. system prompt 选型
ok("e: familyId undefined/未知 → default；model-tryon 命中专用覆盖条", async () => {
  assert.equal(rewriteSystemPrompt(undefined), REWRITE_SYSTEM_PROMPTS.default);
  assert.equal(rewriteSystemPrompt("not-a-family"), REWRITE_SYSTEM_PROMPTS.default);
  assert.equal(rewriteSystemPrompt("model-tryon"), REWRITE_SYSTEM_PROMPTS["model-tryon"]);
  assert.deepEqual(Object.keys(REWRITE_SYSTEM_PROMPTS), ["default", "model-tryon"]);
});

ok("e: default system prompt 含三铁律硬约束句与禁负资产词清单", async () => {
  const p = REWRITE_SYSTEM_PROMPTS.default;
  assert.match(p, /不得删除|原样保留/);
  assert.match(p, /替换/);
  assert.match(p, /改写/);
  for (const banned of ["8K", "杰作", "大师级", "完美光线", "超高清"]) {
    assert.match(p, new RegExp(banned), `必须显式列出禁词「${banned}」`);
  }
  assert.match(p, /只输出一段连续的中文正文/);
});

// g. 请求体断言（gemini-3.8-flash 思考控制）
ok("g: 请求体 model=gemini-3.8-flash、reasoning_effort=medium，不含 minimal/thinkingBudget", async () => {
  let captured: Record<string, unknown> | undefined;
  const fetchImpl = (async (_url: string, init?: RequestInit) => {
    captured = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return jsonResponse({
      choices: [{ message: { content: "ok" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    });
  }) as typeof fetch;
  await createTextChatCompletion(
    { model: "gemini-3.8-flash", messages: [{ role: "user", content: "x" }] },
    { ...textChatDeps, fetchImpl, sleep: async () => {} },
  );
  assert.ok(captured, "必须发出请求体");
  assert.equal(captured!.model, "gemini-3.8-flash");
  assert.equal(captured!.reasoning_effort, "medium");
  assert.equal(captured!.max_tokens, 2048, "max_tokens 默认 2048（output 总预算含思考 token，P1 512 截断事故）");
  const raw = JSON.stringify(captured);
  assert.ok(!raw.includes("minimal"), "请求体绝不得含 minimal（静默忽略仍计费）");
  assert.ok(!raw.includes("thinkingBudget"), "请求体绝不得含 thinkingBudget（原生端关闭机制，与 medium 语义矛盾）");
  assert.equal(captured!.stream, false);
  assert.ok(!("thinking_config" in captured!), "不得出现任何思考关闭配置");
});

// 白名单 / 成本常量（familyId 已落标，白名单启用 ["model-tryon"]，plan §2.3/§5）
ok("白名单：model-tryon 已启用；isRewriteEnabledFamily 符合预期", async () => {
  assert.deepEqual([...REWRITE_ENABLED_FAMILIES], ["model-tryon"]);
  assert.equal(isRewriteEnabledFamily("model-tryon"), true, "model-tryon 在白名单内，应启用改写");
  assert.equal(isRewriteEnabledFamily("fashion-lookbook"), false, "fashion-lookbook 不在白名单");
  assert.equal(isRewriteEnabledFamily(undefined), false);
  assert.equal(MAX_REWRITE_CALLS_PER_RUN, 1);
});

// h. 截断/残缺检测（P1 半句话事故补课）：两种情形都回退原文且 rewritten:false
ok("h: finish_reason=length → truncated，回退原文不写回半句", async () => {
  const longInput = "一位穿红色长裙的女性站在室内落地窗前，柔和自然光，中景镜头";
  const outcome = await rewriteUserPrompt(longInput, defaultContext, {
    chatCompletion: async () => ({
      content: "AI 换装模特试穿。严格按参考图序", // 半句话（P1 实测形态）
      finishReason: "length",
      usage: { promptTokens: 165, completionTokens: 512, totalTokens: 677 },
    }),
  });
  assert.equal(outcome.rewritten, false);
  assert.equal(outcome.reason, "truncated");
  assert.equal(outcome.text, longInput, "截断必须回退原文");
});

ok("h: 输出显著短于输入（< 0.8×）且 finish_reason=stop → too_short，回退原文", async () => {
  const longInput = "一位穿红色长裙的女性站在室内落地窗前，柔和自然光，中景镜头，浅色调";
  const outcome = await rewriteUserPrompt(longInput, defaultContext, {
    chatCompletion: async () => ({
      content: "AI 换装模特试穿。严格按参考图序号使用输入图片，", // 25 字 < 30 字 × 0.8
      finishReason: "stop",
      usage: { promptTokens: 165, completionTokens: 508, totalTokens: 673 },
    }),
  });
  assert.equal(outcome.rewritten, false);
  assert.equal(outcome.reason, "too_short");
  assert.equal(outcome.text, longInput);
  assert.ok(
    "AI 换装模特试穿。严格按参考图序号使用输入图片，".length < longInput.length * REWRITE_MIN_OUTPUT_RATIO,
    "测试前提：mock 输出确实短于阈值",
  );
});

// i. 协议段只读保护（P1 §4 锚点切分）：协议原样保留，只改写补充段
ok("i: splitRewriteInput 含锚点 → protocol=含锚点行前缀，supplement=其后内容", async () => {
  const protocolText = `AI 换装模特试穿。严格按参考图序号使用输入图片。\n输出 3:4 单人全身竖版。\n${REWRITE_SUPPLEMENT_ANCHOR}`;
  const full = `${protocolText}想加一条街拍风格背景`;
  const split = splitRewriteInput(full);
  assert.equal(split.protocol, protocolText, "协议段 = 含锚点行的前缀，逐字不变");
  assert.equal(split.supplement, "想加一条街拍风格背景");
  const noAnchor = splitRewriteInput("一段没有锚点的普通提示词");
  assert.equal(noAnchor.protocol, "", "无锚点 → protocol 为空（整段改写，现行为不变）");
  assert.equal(noAnchor.supplement, "一段没有锚点的普通提示词");
});

ok("i: 锚点后为空 → empty_supplement 跳过且不调通道", async () => {
  let calls = 0;
  const outcome = await rewriteUserPrompt(
    `协议正文若干。\n${REWRITE_SUPPLEMENT_ANCHOR}`,
    defaultContext,
    { chatCompletion: async () => { calls += 1; throw new Error("不应被调用"); } },
  );
  assert.equal(outcome.rewritten, false);
  assert.equal(outcome.reason, "empty_supplement");
  assert.equal(calls, 0);
});

ok("i: 含锚点输入 → 改写器只收 supplement，协议段原样回填为前缀", async () => {
  let capturedUser = "";
  const protocolText = `AI 换装模特试穿。严格按参考图序号使用输入图片。\n${REWRITE_SUPPLEMENT_ANCHOR}`;
  const supplement = "一位穿红色长裙的女性站在室内落地窗前，柔和自然光";
  const outcome = await rewriteUserPrompt(`${protocolText}${supplement}`, defaultContext, {
    chatCompletion: async (args) => {
      capturedUser = args.messages[1].content as string;
      return {
        content: "一位穿红色长裙的女性站在室内落地窗前，柔和自然光，中景镜头浅色调",
        finishReason: "stop",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      };
    },
  });
  assert.equal(capturedUser, supplement, "进改写器的只有锚点后的补充段");
  assert.equal(outcome.rewritten, true);
  assert.ok(outcome.text.startsWith(protocolText), "协议段必须逐字回填在输出前缀");
  assert.ok(outcome.text.includes("中景镜头浅色调"));
});

process.on("exit", () => {
  if (process.exitCode === 0 || process.exitCode === undefined) {
    console.log(`通过 ${passed} 项提示词改写层测试`);
  }
});
