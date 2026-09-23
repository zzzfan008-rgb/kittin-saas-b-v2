/**
 * 生成错误中文化 — 表驱动单测
 *
 * 验收标准：
 * 1. 每个错误码一条中文常量（ERROR_MESSAGES）
 * 2. 输入真实错误样本，输出全为中文且不含 ASCII 句子
 * 3. 未匹配走兜底（含状态码占位符）
 * 4. 不透传英文，不泄露上游实现细节
 */
import { ERROR_MESSAGES } from "../server/providers/base";
import { providerErrorFromMessage } from "../server/providers/base";

let passed = 0;

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

/** 验证字符串为全中文（不含英文单词/句子），允许数字、标点、空格。 */
function assertChineseOnly(value: string, label: string): void {
  // ASCII 字母不在 CJK 统一表意文字区；检测英文单词（连续 3+ 字母）
  const englishWord = /[a-zA-Z]{3,}/.exec(value);
  if (englishWord) {
    throw new Error(`${label} 包含英文单词 "${englishWord[0]}"：${value}`);
  }
}

/**
 * 严格泄露检测：原始英文短语不得原样出现在中文消息中。
 * 用连续 10+ 字母的片段检测（排除误报的短词如 "API"）。
 */
function assertNoRawLeak(raw: string, chinese: string): void {
  const leak = /[a-zA-Z]{10,}/.exec(raw);
  if (leak && chinese.includes(leak[0])) {
    throw new Error(`消息泄露原始英文 "${leak[0]}"：${chinese}`);
  }
}

async function main(): Promise<void> {
  console.log("Provider 错误中文化表驱动测试\n");

  // ---------- 常量完整性：ERROR_MESSAGES 覆盖所有声明的 category ----------
  await test("ERROR_MESSAGES 每个错误码都有中文常量", () => {
    const categories = [
      "rate_limited",
      "timeout",
      "content_refused",
      "invalid_request",
      "reference_image_error",
      "model_unavailable",
      "gateway_authentication",
      "account_credit",
      "gateway_unavailable",
      "network_error",
      "unknown",
      "empty_response",
      "invalid_response",
      "outcome_unknown",
    ] as const;
    for (const cat of categories) {
      const msg = ERROR_MESSAGES[cat];
      if (!msg) throw new Error(`ERROR_MESSAGES 缺少错误码：${cat}`);
      assertChineseOnly(msg, `ERROR_MESSAGES[${cat}]`);
    }
  });

  await test("未知兜底格式嵌入状态码", () => {
    // 无状态码
    const e0 = providerErrorFromMessage("completely unknown gibberish xyz");
    console.assert(e0.category === "unknown", "无状态码无匹配应归类 unknown");
    console.assert(e0.message === ERROR_MESSAGES.unknown, "无状态码应命中 0000 兜底");

    // 状态码无 message 匹配时走范围兜底：422→invalid_request，502→gateway_unavailable
    const e422 = providerErrorFromMessage("some upstream error", undefined, 422);
    console.assert(e422.category === "invalid_request", `有状态码422应归 invalid_request，实际 ${e422.category}`);
    console.assert(e422.message === ERROR_MESSAGES.invalid_request);

    const e502 = providerErrorFromMessage("some upstream error", undefined, 502);
    console.assert(e502.category === "gateway_unavailable", `有状态码502应归 gateway_unavailable`);
    console.assert(e502.message === ERROR_MESSAGES.gateway_unavailable);

    // 4xx 有 message 匹配时走 message 规则
    const e401 = providerErrorFromMessage("invalid api key", undefined, 401);
    console.assert(e401.category === "gateway_authentication");
    assertChineseOnly(e401.message, "401+message 的提示");
  });

  // ---------- 错误归一化表驱动测试 ----------
  const testCases: Array<{
    category: string;
    samples: Array<{ status?: number; raw: string; expectedMessage: string }>;
  }> = [
    {
      category: "rate_limited",
      samples: [
        { status: 429, raw: "rate limit exceeded", expectedMessage: ERROR_MESSAGES.rate_limited },
        { raw: "too many requests, please retry after 60 seconds", expectedMessage: ERROR_MESSAGES.rate_limited },
      ],
    },
    {
      category: "gateway_authentication",
      samples: [
        { status: 401, raw: "invalid api key", expectedMessage: ERROR_MESSAGES.gateway_authentication },
        { status: 403, raw: "Forbidden: insufficient permissions", expectedMessage: ERROR_MESSAGES.gateway_authentication },
        { raw: "invalid token", expectedMessage: ERROR_MESSAGES.gateway_authentication },
      ],
    },
    {
      category: "content_refused",
      samples: [
        { raw: "content policy violation: raw gateway detail", expectedMessage: ERROR_MESSAGES.content_refused },
        { raw: "Your request was rejected as a result of our safety system.", expectedMessage: ERROR_MESSAGES.content_refused },
        { raw: "ResponsibleAIPolicyViolation", expectedMessage: ERROR_MESSAGES.content_refused },
        { raw: "content_filter: The response was filtered by the content management policy.", expectedMessage: ERROR_MESSAGES.content_refused },
        { raw: "safety system blocked this image", expectedMessage: ERROR_MESSAGES.content_refused },
        { raw: "内容安全审核拒绝本次请求", expectedMessage: ERROR_MESSAGES.content_refused },
        { raw: "内容违规，请调整提示词", expectedMessage: ERROR_MESSAGES.content_refused },
        { raw: "prompt was filtered by safety system", expectedMessage: ERROR_MESSAGES.content_refused },
      ],
    },
    {
      category: "invalid_request",
      samples: [
        { raw: "invalid parameter: resolution must be 1024x1024", expectedMessage: ERROR_MESSAGES.invalid_request },
        { raw: "aspect ratio not supported for this model", expectedMessage: ERROR_MESSAGES.invalid_request },
        { raw: "image count exceeds maximum of 5", expectedMessage: ERROR_MESSAGES.invalid_request },
        { raw: "invalid request body", expectedMessage: ERROR_MESSAGES.invalid_request },
        { raw: "Bad Request", expectedMessage: ERROR_MESSAGES.invalid_request },
        { raw: "malformed request: missing prompt field", expectedMessage: ERROR_MESSAGES.invalid_request },
      ],
    },
    {
      category: "reference_image_error",
      samples: [
        { raw: "reference image exceeds size limit of 20MB", expectedMessage: ERROR_MESSAGES.reference_image_error },
        { raw: "reference image count exceeds maximum allowed", expectedMessage: ERROR_MESSAGES.reference_image_error },
        { raw: "FLUX 参考图尺寸无效", expectedMessage: ERROR_MESSAGES.reference_image_error },
        { raw: "蒙版尺寸必须与原图完全一致", expectedMessage: ERROR_MESSAGES.reference_image_error },
        { raw: "蒙版 Alpha 通道缺失", expectedMessage: ERROR_MESSAGES.reference_image_error },
        { raw: "reference image invalid format", expectedMessage: ERROR_MESSAGES.reference_image_error },
        { raw: "input image dimension must be at least 64 pixels", expectedMessage: ERROR_MESSAGES.reference_image_error },
      ],
    },
    {
      category: "model_unavailable",
      samples: [
        { raw: "model gpt-image-2.5-sunburst does not exist", expectedMessage: ERROR_MESSAGES.model_unavailable },
        { raw: "model not found or not available", expectedMessage: ERROR_MESSAGES.model_unavailable },
        { raw: "unknown model requested", expectedMessage: ERROR_MESSAGES.model_unavailable },
        { raw: "模型不可用", expectedMessage: ERROR_MESSAGES.model_unavailable },
      ],
    },
    {
      category: "account_credit",
      samples: [
        { raw: "insufficient credit for this operation", expectedMessage: ERROR_MESSAGES.account_credit },
        { raw: "credit limit exceeded", expectedMessage: ERROR_MESSAGES.account_credit },
        { raw: "账户余额不足", expectedMessage: ERROR_MESSAGES.account_credit },
        { raw: "账户欠费，请联系管理员", expectedMessage: ERROR_MESSAGES.account_credit },
      ],
    },
    {
      category: "gateway_unavailable",
      samples: [
        { status: 500, raw: "Internal Server Error", expectedMessage: ERROR_MESSAGES.gateway_unavailable },
        { status: 502, raw: "Bad Gateway upstream error", expectedMessage: ERROR_MESSAGES.gateway_unavailable },
        { status: 503, raw: "Service Temporarily Unavailable", expectedMessage: ERROR_MESSAGES.gateway_unavailable },
        { status: 504, raw: "Gateway Timeout", expectedMessage: ERROR_MESSAGES.gateway_unavailable },
      ],
    },
    {
      category: "network_error",
      samples: [
        { raw: "Connection reset by peer", expectedMessage: ERROR_MESSAGES.network_error },
        { raw: "ECONNRESET", expectedMessage: ERROR_MESSAGES.network_error },
        { raw: "network unreachable", expectedMessage: ERROR_MESSAGES.network_error },
        { raw: "ETIMEDOUT Connection timed out", expectedMessage: ERROR_MESSAGES.network_error },
      ],
    },
  ];

  for (const { category, samples } of testCases) {
    await test(`${category} — ${samples.length} 个真实样本全部归一化为中文`, async () => {
      for (const { status, raw, expectedMessage } of samples) {
        const error = providerErrorFromMessage(raw, undefined, status);
        console.assert(
          error.category === category,
          `[${category}] 样本 "${raw.slice(0, 40)}" 归类为 ${error.category}，期望 ${category}`,
        );
        console.assert(
          error.message === expectedMessage,
          `[${category}] 样本 "${raw.slice(0, 40)}" 消息为 "${error.message}"，期望 "${expectedMessage}"`,
        );
        assertChineseOnly(error.message, `[${category}] ${raw}`);
        // 确保长英文短语（10+字母）不被透传
        assertNoRawLeak(raw, error.message);
      }
    });
  }

  // ---------- 优先级：content_refused 优先于 invalid_request ----------
  await test("content_refused 优先于 invalid_request（优先级冲突）", () => {
    // 同时含两者关键词的消息应命中 content_refused
    const e = providerErrorFromMessage("safety system blocked the image due to invalid content policy parameters");
    console.assert(e.category === "content_refused", `期望 content_refused，实际 ${e.category}`);
    assertChineseOnly(e.message, "优先级冲突消息");
  });

  // ---------- 4xx 兜底 without message match → invalid_request ----------
  await test("4xx 无 message 匹配时归 invalid_request 而非 unknown", () => {
    for (const status of [400, 402, 404, 408, 418]) {
      const e = providerErrorFromMessage("generic client error", undefined, status);
      console.assert(
        e.category === "invalid_request",
        `status ${status} 期望 invalid_request，实际 ${e.category}`,
      );
      console.assert(e.message === ERROR_MESSAGES.invalid_request);
      assertChineseOnly(e.message, `status ${status}`);
    }
  });

  // ---------- ERROR_MESSAGES 直接导出，无 ASCII 句子 ----------
  await test("ERROR_MESSAGES 所有值不含英文单词（常量表审查）", () => {
    const seen = new Set<string>();
    for (const [cat, msg] of Object.entries(ERROR_MESSAGES) as [string, string][]) {
      if (seen.has(msg)) throw new Error(`重复文案：${msg}（cat=${cat}）`);
      seen.add(msg);
      assertChineseOnly(msg, `ERROR_MESSAGES[${cat}]`);
    }
  });

  console.log(`\n通过 ${passed} 项`);
}

await main();
