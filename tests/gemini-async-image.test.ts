/**
 * Gemini 图片模型异步任务链路契约测试（2026-11-10）。
 *
 * 实测依据：兔子《异步图片生成》文档 + 两个模型各一次真实付费调用：
 * POST /v1/videos → task_id → GET /v1/videos/{task_id} → video_url 为图片直链。
 * 覆盖：提交体字段、画幅/分辨率映射、多参考图角色编号、状态机、失败不重提交、
 * 任务失败分类、4xx 回退同步、一键关闭开关、按 task_id 找回。
 */
import assert from "node:assert/strict";
import sharp from "sharp";
import { config } from "../server/config";
import { gatewayProviders } from "../server/providers/gateway";
import { ProviderError } from "../server/providers/base";
import { resetProviderCircuitBreakerForTests } from "../server/providers/circuitBreaker";
import {
  AsyncImageSubmitError,
  asyncImagePollPath,
  extractAsyncImageUrls,
  parseAsyncTaskState,
} from "../server/providers/asyncImageTask";
import { runWithAsyncImageTaskHook } from "../server/providers/asyncTaskContext";
import { isRetryableProviderError } from "../server/engine/runQueueContracts";
import { recoverByIdentifier } from "../server/routes/runRecovery";

let passed = 0;

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  resetProviderCircuitBreakerForTests();
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

function setEnv(name: string, value: string | undefined): () => void {
  const original = process.env[name];
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
  return () => {
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  };
}

function installFetchMock(
  implementation: (input: string | URL | Request, init?: RequestInit) => Response | Promise<Response>,
): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = implementation as typeof fetch;
  return () => { globalThis.fetch = original; };
}

async function pngDataUrl(): Promise<string> {
  const buffer = await sharp({
    create: { width: 4, height: 2, channels: 3, background: { r: 240, g: 240, b: 240 } },
  }).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function jsonBody(init: RequestInit | undefined): Record<string, unknown> {
  return JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
}

const RESULT_URL = "https://cdn.example/gemini/result.png?token=short-lived";
const TASK_ID = "task_contractTest123";

interface Capture { url: string; init: RequestInit }

async function main(): Promise<void> {
  console.log("Gemini 异步图片任务契约测试");
  const restoreBase = setEnv("GATEWAY_BASE_URL", "https://gateway.example");
  const restoreKey = setEnv("GATEWAY_API_KEY", "apiyi-test-key");
  const restoreDisabled = setEnv("GEMINI_ASYNC_DISABLED", undefined);
  const restoreInitial = setEnv("GEMINI_ASYNC_POLL_INITIAL_DELAY_MS", "0");
  const restoreInterval = setEnv("GEMINI_ASYNC_POLL_INTERVAL_MS", "500");
  const white = await pngDataUrl();

  try {
    await test("任务提交成功即把 task_id 交给运行上下文存证（轮询之前）", async () => {
      const recorded: string[] = [];
      let calls = 0;
      const restoreFetch = installFetchMock((_input, init) => {
        calls += 1;
        if (calls === 1) return Response.json({ id: TASK_ID, status: "queued" });
        assert.ok(recorded.includes(TASK_ID), "进入轮询前 task_id 必须已落库");
        return Response.json({ id: TASK_ID, status: "completed", video_url: RESULT_URL });
      });
      try {
        await runWithAsyncImageTaskHook({
          onSubmitted: async (id) => { recorded.push(id); },
        }, () => gatewayProviders["gemini-3.1-flash-image"].generate({
          prompt: "时装大片", operationMode: "generate",
          modelOptions: { aspectRatio: "3:4", imageSize: "1K" },
        }));
        assert.deepEqual(recorded, [TASK_ID]);
      } finally {
        restoreFetch();
      }
    });

    await test("并发运行的 task_id 存证互不串味", async () => {
      const byRun: Record<string, string[]> = { A: [], B: [] };
      const restoreFetch = installFetchMock((_input, init) => {
        if (init?.method === "POST") {
          const prompt = String(jsonBody(init).prompt ?? "");
          const id = prompt.startsWith("A-") ? "task_runA" : "task_runB";
          return Response.json({ id, status: "queued" });
        }
        return Response.json({ status: "completed", video_url: RESULT_URL });
      });
      try {
        const runOne = (tag: "A" | "B") => runWithAsyncImageTaskHook({
          onSubmitted: async (id) => { byRun[tag].push(id); },
        }, async () => {
          // 交错提交，确保 ALS 上下文不会互相覆盖。
          await new Promise<void>((resolve) => setTimeout(resolve, tag === "A" ? 8 : 0));
          await gatewayProviders["gemini-nano-banana-2.1"].generate({
            prompt: `${tag}-并发隔离`, operationMode: "generate",
            modelOptions: { aspectRatio: "1:1", imageSize: "1K" },
          });
        });
        await Promise.all([runOne("A"), runOne("B")]);
        assert.deepEqual(byRun.A, ["task_runA"]);
        assert.deepEqual(byRun.B, ["task_runB"]);
      } finally {
        restoreFetch();
      }
    });

    await test("存证失败不中断已提交任务的取图", async () => {
      let calls = 0;
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        return calls === 1
          ? Response.json({ id: TASK_ID, status: "queued" })
          : Response.json({ id: TASK_ID, status: "completed", video_url: RESULT_URL });
      });
      try {
        const result = await runWithAsyncImageTaskHook({
          onSubmitted: async () => { throw new Error("DB down"); },
        }, () => gatewayProviders["gemini-3.1-flash-image"].generate({
          prompt: "白瓷杯", operationMode: "generate",
          modelOptions: { aspectRatio: "1:1", imageSize: "1K" },
        }));
        assert.deepEqual(result.images, [RESULT_URL]);
      } finally {
        restoreFetch();
      }
    });

    await test("状态机与结果 URL 字段覆盖兔子各渠道写法", () => {
      assert.equal(asyncImagePollPath("task_a/b"), "/v1/videos/task_a%2Fb");
      assert.deepEqual(parseAsyncTaskState({ status: "queued", progress: 0 }), { status: "pending" });
      assert.deepEqual(parseAsyncTaskState({ status: "in_progress", progress: 30 }), { status: "running" });
      assert.deepEqual(parseAsyncTaskState({ status: "succeeded", url: RESULT_URL }), {
        status: "completed", urls: [RESULT_URL],
      });
      assert.deepEqual(
        parseAsyncTaskState({ status: "failed", error: { code: "x", message: "上游拒绝" } }),
        { status: "failed", error: "上游拒绝" },
      );
      assert.equal(parseAsyncTaskState({ status: "brand_new_state" }), undefined, "未知状态不得直接判失败");
      assert.deepEqual(
        extractAsyncImageUrls({ status: "completed", video_url: RESULT_URL, url: RESULT_URL }),
        [RESULT_URL],
      );
      assert.deepEqual(
        extractAsyncImageUrls({ status: "completed", data: [{ image_url: "https://cdn.example/a.png" }, { url: "/relative.png" }] }),
        ["https://cdn.example/a.png"],
        "相对路径或非 http(s) 地址必须过滤",
      );
    });

    await test("文生图提交 /v1/videos 并轮询取回图片直链与 task_id", async () => {
      const captures: Capture[] = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        if (captures.length === 1) {
          return Response.json({ id: TASK_ID, task_id: TASK_ID, object: "video", status: "queued", progress: 0 });
        }
        return Response.json({
          id: TASK_ID, status: "completed", progress: 100, video_url: RESULT_URL,
          metadata: { usage: { output_image_count: 1 } },
        });
      });
      try {
        const result = await gatewayProviders["gemini-3.1-flash-image"].generate({
          prompt: "时装大片", operationMode: "generate",
          modelOptions: { aspectRatio: "3:4", imageSize: "1K" },
        });
        assert.deepEqual(result.images, [RESULT_URL]);
        assert.equal(result.providerRequestId, TASK_ID, "task_id 必须作为可找回凭据返回");
        assert.equal(captures.length, 2);
        assert.equal(captures[0].url, "https://gateway.example/v1/videos");
        assert.equal(captures[1].url, `https://gateway.example/v1/videos/${TASK_ID}`);
        assert.equal(captures[1].init.method, "GET");
        const body = jsonBody(captures[0].init);
        assert.equal(body.model, "gemini-3.1-flash-image");
        assert.equal(body.prompt, "时装大片");
        assert.equal(body.response_format, "url");
        assert.equal(body.size, "768x1024", "3:4 + 1K 必须换算成 WxH，而非被拒的 aspect_ratio");
        for (const forbidden of ["aspect_ratio", "imageSize", "seconds", "duration", "images", "quality"]) {
          assert.equal(Object.hasOwn(body, forbidden), false, `异步图片请求不得携带 ${forbidden}`);
        }
      } finally {
        restoreFetch();
      }
    });

    await test("多参考图编辑按顺序带 images，并把编号/角色写进提示词", async () => {
      const captures: Capture[] = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        return captures.length === 1
          ? Response.json({ id: TASK_ID, status: "queued" })
          : Response.json({ id: TASK_ID, status: "completed", url: RESULT_URL });
      });
      try {
        const reference = white;
        await gatewayProviders["gemini-nano-banana-2.1"].edit({
          prompt: "AI 换装",
          operationMode: "edit",
          references: [
            { dataUrl: reference, order: 0, assetSha256: "0".repeat(64), role: "服装" },
            { dataUrl: reference, order: 1, assetSha256: "1".repeat(64), role: "模特" },
          ],
          referenceImages: [reference, reference],
          modelOptions: { aspectRatio: "3:4", imageSize: "2K" },
        });
        const body = jsonBody(captures[0].init);
        assert.equal(body.model, "gemini-nano-banana-2.1", "两个 Gemini 模型都必须走异步");
        assert.equal(body.size, "1536x2048");
        const images = body.images as string[];
        assert.equal(images.length, 2);
        assert.ok(images.every((image) => image.startsWith("data:image/png;base64,")));
        const prompt = String(body.prompt);
        assert.ok(prompt.includes("参考图按上传顺序依次编号：参考图1、参考图2"));
        assert.ok(prompt.includes("参考图1=服装") && prompt.includes("参考图2=模特"));
        assert.ok(prompt.endsWith("AI 换装"), "用户正文必须完整保留在编号说明之后");
      } finally {
        restoreFetch();
      }
    });

    await test("任务提交后查询连续失败：标 outcome_unknown 带 task_id，绝不重提交", async () => {
      const captures: Capture[] = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        if (captures.length === 1) return Response.json({ id: TASK_ID, status: "queued" });
        throw new Error("ECONNRESET while polling");
      });
      try {
        await assert.rejects(
          () => gatewayProviders["gemini-3.1-flash-image"].generate({
            prompt: "查询会断", operationMode: "generate",
          }),
          (error: unknown) => error instanceof ProviderError
            && error.category === "outcome_unknown"
            && error.requestId === TASK_ID,
        );
        const posts = captures.filter((capture) => capture.init.method === "POST");
        assert.equal(posts.length, 1, "已建立的任务绝对不能重发，否则重复计费");
      } finally {
        restoreFetch();
      }
    });

    await test("任务明确失败：不可重试分类，并保留 task_id 供排查", async () => {
      const captures: Capture[] = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        return captures.length === 1
          ? Response.json({ id: TASK_ID, status: "queued" })
          : Response.json({ id: TASK_ID, status: "failed", error: { message: "上游渠道不可用" } });
      });
      try {
        await assert.rejects(
          () => gatewayProviders["gemini-3.1-flash-image"].generate({ prompt: "会失败", operationMode: "generate" }),
          (error: unknown) => error instanceof ProviderError
            && error.category === "invalid_request"
            && error.requestId === TASK_ID,
        );
        assert.equal(captures.filter((capture) => capture.init.method === "POST").length, 1);
      } finally {
        restoreFetch();
      }
    });

    await test("提交被参数类 4xx 拒绝时回退原生同步端点", async () => {
      const captures: Capture[] = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        if (captures.length === 1) {
          return new Response(JSON.stringify({
            code: "unsupported_async_image_field",
            message: "size is not supported by local async image tasks",
          }), { status: 400 });
        }
        return Response.json({
          candidates: [{
            finishReason: "STOP",
            content: { parts: [{ inlineData: { mimeType: "image/png", data: white.split(",")[1] } }] },
          }],
        });
      });
      try {
        const result = await gatewayProviders["gemini-3.1-flash-image"].generate({
          prompt: "回退验证", operationMode: "generate",
          modelOptions: { aspectRatio: "1:1", imageSize: "1K" },
        });
        assert.equal(result.images.length, 1);
        assert.equal(captures.length, 2);
        assert.equal(captures[0].url, "https://gateway.example/v1/videos");
        assert.equal(captures[1].url, "https://gateway.example/v1beta/models/gemini-3.1-flash-image:generateContent");
      } finally {
        restoreFetch();
      }
    });

    await test("5xx 提交失败标 outcome_unknown：不回退同步，worker 绝不重发", async () => {
      const captures: Capture[] = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        return new Response("upstream error", { status: 503 });
      });
      try {
        await assert.rejects(
          () => gatewayProviders["gemini-3.1-flash-image"].generate({ prompt: "503", operationMode: "generate" }),
          (error: unknown) => {
            assert.ok(error instanceof ProviderError);
            assert.equal(error.category, "outcome_unknown", "提交阶段 5xx 必须视为结果未知");
            assert.equal(error instanceof AsyncImageSubmitError, false, "不得伪装成可回退的提交拒绝");
            assert.equal(isRetryableProviderError(error), false, "worker 必须终止而不是重发 POST /v1/videos");
            return true;
          },
        );
        assert.equal(captures.length, 1, "5xx 之后不得改走同步端点重发");
      } finally {
        restoreFetch();
      }
    });

    await test("429 限流提交失败仍可重试（请求确定未被受理）", async () => {
      const restoreFetch = installFetchMock(() => new Response(
        JSON.stringify({ error: { message: "too many requests" } }), { status: 429 },
      ));
      try {
        await assert.rejects(
          () => gatewayProviders["gemini-3.1-flash-image"].generate({ prompt: "429", operationMode: "generate" }),
          (error: unknown) => {
            assert.ok(error instanceof AsyncImageSubmitError, "429 应保留提交拒绝类型");
            assert.equal(error.status, 429);
            assert.equal(error.category, "rate_limited");
            assert.equal(isRetryableProviderError(error), true, "429 由 worker 按 Retry-After 有界重试");
            return true;
          },
        );
      } finally {
        restoreFetch();
      }
    });

    await test("200 响应缺 task_id 同样标 outcome_unknown，不重试也不回退", async () => {
      const captures: Capture[] = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        return Response.json({ object: "video", status: "queued", progress: 0 });
      });
      try {
        await assert.rejects(
          () => gatewayProviders["gemini-3.1-flash-image"].generate({ prompt: "no-task-id", operationMode: "generate" }),
          (error: unknown) => {
            assert.ok(error instanceof ProviderError);
            assert.equal(error.category, "outcome_unknown");
            assert.equal(isRetryableProviderError(error), false);
            return true;
          },
        );
        assert.equal(captures.length, 1, "不得因缺 task_id 而回退同步端点");
      } finally {
        restoreFetch();
      }
    });

    await test("529 / 早期 504 这类会被通用规则重试的错误也不重发提交", async () => {
      for (const status of [529, 504]) {
        const captures: Capture[] = [];
        const restoreFetch = installFetchMock((input, init) => {
          captures.push({ url: String(input), init: init ?? {} });
          return new Response("service unavailable", { status });
        });
        try {
          await assert.rejects(
            () => gatewayProviders["gemini-3.1-flash-image"].generate({ prompt: `status-${status}`, operationMode: "generate" }),
            (error: unknown) => {
              assert.ok(error instanceof ProviderError);
              assert.equal(error.category, "outcome_unknown");
              assert.equal(isRetryableProviderError(error, 10_000), false);
              return true;
            },
          );
          assert.equal(captures.length, 1);
        } finally {
          restoreFetch();
          resetProviderCircuitBreakerForTests();
        }
      }
    });

    await test("GEMINI_ASYNC_DISABLED=true 一键回退，完全不发异步请求", async () => {
      const restoreDisabledFlag = setEnv("GEMINI_ASYNC_DISABLED", "true");
      const captures: Capture[] = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        return Response.json({
          candidates: [{ content: { parts: [{ inline_data: { mime_type: "image/png", data: white.split(",")[1] } }] } }],
        });
      });
      try {
        assert.equal(config.geminiAsyncEnabled(), false);
        const result = await gatewayProviders["gemini-3.1-flash-image"].generate({
          prompt: "同步", operationMode: "generate",
          modelOptions: { aspectRatio: "1:1", imageSize: "1K" },
        });
        assert.equal(result.images.length, 1);
        assert.equal(captures.length, 1);
        assert.ok(captures[0].url.includes(":generateContent"));
      } finally {
        restoreFetch();
        restoreDisabledFlag();
      }
    });

    await test("找回按 task_ 前缀查询 /v1/videos/{task_id} 拿到结果 URL", async () => {
      const calls: string[] = [];
      const restoreFetch = installFetchMock((input) => {
        calls.push(String(input));
        return Response.json({ id: TASK_ID, status: "completed", progress: 100, video_url: RESULT_URL });
      });
      try {
        const recovered = await recoverByIdentifier(TASK_ID);
        assert.deepEqual(recovered, { urls: [RESULT_URL], pending: false });
        assert.equal(calls.length, 1);
        assert.equal(calls[0], `https://gateway.example/v1/videos/${TASK_ID}`);
      } finally {
        restoreFetch();
      }
    });

    await test("找回遇到仍在处理中的任务返回 pending，不判失败", async () => {
      const restoreFetch = installFetchMock(() => Response.json({ id: TASK_ID, status: "in_progress", progress: 30 }));
      try {
        const recovered = await recoverByIdentifier(TASK_ID);
        assert.deepEqual(recovered, { urls: [], pending: true });
      } finally {
        restoreFetch();
      }
    });
  } finally {
    restoreBase();
    restoreKey();
    restoreDisabled();
    restoreInitial();
    restoreInterval();
    resetProviderCircuitBreakerForTests();
  }
  console.log(`  ${passed} 项通过`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
