import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { NodeExecution, RunProgress } from "../src/types/workflow";
import {
  VIDEO_MODEL_IDS,
  getVideoModelContract,
  getVideoRuntimeContract,
  videoModelOptionsWarnings,
} from "../src/types/videoModels";
import {
  createGatewayVideoProvider,
  type VideoProvider,
  type VideoGenRequest,
} from "../server/providers/videoProvider";
import {
  isSupportedVideoFile,
  mimeOfFile,
  saveVideoBuffer,
  deleteStoredVideo,
} from "../server/lib/fileStore";
import { executeStep } from "../server/engine/runner";
import { getProvider } from "../server/providers";

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

function videoStep(overrides: Partial<NodeExecution["params"]> = {}): NodeExecution {
  return {
    nodeId: "video-1",
    kind: "video-generator",
    inputImages: [],
    params: {
      // v9（64 Phase 3）：promptVariantId 已删，video 任务文本沿 text 边进入 inputTexts。
      modelId: "doubao-seedance-2-5-260628",
      modelOptions: { seconds: "5", resolution: "720p" },
      inputTexts: ["一段服装视频提示词"],
      ...overrides,
    },
  };
}

const FAKE_MP4 = Buffer.from("000000186674797069736f6d00000000", "hex");

async function main(): Promise<void> {
  console.log("P2-e 视频 Provider / 落地 / runner 测试");

  // ---------- 契约类型层 ----------
  await test("视频模型清单为兔子API 三个模型（seedance / MiniMax-H3 / veo3.1）且契约一致", () => {
    assert.deepEqual([...VIDEO_MODEL_IDS], ["doubao-seedance-2-5-260628", "MiniMax-H3", "veo3.1"]);
    assert.equal(getVideoModelContract("doubao-seedance-2-5-260628").id, "doubao-seedance-2-5-260628");
    assert.match(getVideoModelContract("doubao-seedance-2-5-260628").contractHash, /^sha256:[a-f0-9]{64}$/);
  });

  await test("视频运行时契约声明异步任务端点与 completed 成功状态", () => {
    const runtime = getVideoRuntimeContract();
    assert.equal(runtime.upstreamMode, "async-task");
    // 兔子API 三家视频模型共用 /v1/videos 提交与 /v1/videos/{id} 轮询。
    assert.equal(runtime.submitEndpoint, "/v1/videos");
    assert.ok(runtime.pollEndpointTemplate.includes("{id}"));
    // seedance / veo / H3 的成功态实测均为 completed（2026-11-18 H3 真实响应修正，
    // 见 minimaxH3RegressionSuite；此前误记 H3 为 succeeded）。
    assert.equal(runtime.successStatus, "completed");
    // 逐模型响应形状记在各模型契约的 responseShape 上。
    assert.equal(getVideoModelContract("MiniMax-H3").responseShape?.successStatus, "completed");
    // H3 实测顶层 video_url；content.url 保留为旧式信封的回退位。
    assert.deepEqual(getVideoModelContract("MiniMax-H3").responseShape?.videoUrlFields, ["video_url", "content.url"]);
    assert.equal(getVideoModelContract("doubao-seedance-2-5-260628").responseShape?.successStatus, "completed");
  });

  await test("视频参数仅产生 warning（R5），未知 key 与越界值分别提示", () => {
    const warnings = videoModelOptionsWarnings("doubao-seedance-2-5-260628", {
      resolution: "4k",
      unknownKey: "x",
      seconds: "5",
    });
    assert.ok(warnings.some((w) => w.includes("resolution=4k")));
    assert.ok(warnings.some((w) => w.includes("unknownKey")));
  });

  // ---------- 文件落盘 ----------
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "gc-video-"));
  const restoreDataDir = setEnv("DATA_DIR", dataDir);
  const restoreBase = setEnv("GATEWAY_BASE_URL", "https://gateway.example");
  const restoreKey = setEnv("GATEWAY_API_KEY", "apiyi-test-key");

  try {
    await test("saveVideoBuffer 落盘 .mp4 并可被 files 路由识别为 video/mp4", () => {
      const saved = saveVideoBuffer(FAKE_MP4, "video/mp4");
      assert.ok(saved.id.endsWith(".mp4"));
      assert.equal(saved.url, `/api/files/${saved.id}`);
      assert.equal(isSupportedVideoFile(saved.id), true);
      assert.equal(mimeOfFile(saved.id), "video/mp4");
      assert.ok(fs.existsSync(path.join(dataDir, "uploads", saved.id)));
      deleteStoredVideo(saved.id);
      assert.equal(fs.existsSync(path.join(dataDir, "uploads", saved.id)), false);
    });

    // ---------- Provider：提交 / 轮询状态机 ----------
    await test("submit 使用 Seedance 端点与 content 数组并映射 seconds→duration", async () => {
      const captures: Array<{ url: string; body: Record<string, unknown> }> = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), body: JSON.parse(String(init?.body)) });
        return Response.json({ id: "cgt-test-task-1" });
      });
      try {
        const provider = createGatewayVideoProvider("doubao-seedance-2-5-260628");
        const { taskId } = await provider.submit({ prompt: "一段测试视频" });
        assert.equal(taskId, "cgt-test-task-1");
        assert.equal(captures.length, 1);
        // 兔子API 统一视频端点（三家模型共用 /v1/videos）。
        assert.equal(captures[0].url, "https://gateway.example/v1/videos");
        assert.equal(captures[0].body.model, "doubao-seedance-2-5-260628");
        assert.equal(captures[0].body.duration, 5);
        assert.equal(captures[0].body.generate_audio, false);
        assert.deepEqual(captures[0].body.content, [{ type: "text", text: "一段测试视频" }]);
      } finally {
        restoreFetch();
      }
    });

    await test("poll 把 in_progress 也算中间态（2026-11-05 实测：Seedance 2.5 用它，不是 running）", async () => {
      const restoreFetch = installFetchMock(() =>
        // 真实响应节选：status=in_progress, progress=0
        Response.json({ id: "cgt-test-task-1", task_id: "cgt-test-task-1", object: "video", status: "in_progress", progress: 0 }));
      try {
        const provider = createGatewayVideoProvider("doubao-seedance-2-5-260628");
        const result = await provider.poll("cgt-test-task-1");
        assert.equal(result.status, "running", "in_progress 必须映射为 running，否则会抛未知状态");
      } finally {
        restoreFetch();
      }
    });

    await test("poll 把 queued/running 映射为 pending/running（非终态继续轮询）", async () => {
      const states = ["queued", "running"];
      const provider = createGatewayVideoProvider("doubao-seedance-2-5-260628");
      for (const state of states) {
        const restoreFetch = installFetchMock((input) => {
          assert.ok(String(input).includes("cgt-test-task-1"));
          return Response.json({ id: "cgt-test-task-1", status: state });
        });
        try {
          const result = await provider.poll("cgt-test-task-1");
          assert.equal(result.status, state === "queued" ? "pending" : "running");
        } finally {
          restoreFetch();
        }
      }
    });

    await test("poll 成功时拉回 MP4 落地并返回 /api/files 引用", async () => {
      const restoreFetch = installFetchMock((input) => {
        assert.ok(String(input).includes("cgt-test-task-1"));
        // 兔子API Seedance 轮询信封：成功态 completed，视频地址在顶层 video_url。
        return Response.json({
          id: "cgt-test-task-1",
          object: "video",
          status: "completed",
          progress: 100,
          video_url: "https://cdn.example/out.mp4",
          created_at: 1768976510,
          seconds: "5",
        });
      });
      try {
        const provider = createGatewayVideoProvider("doubao-seedance-2-5-260628", {
          downloadVideo: async (url) => {
            assert.equal(url, "https://cdn.example/out.mp4");
            return FAKE_MP4;
          },
        });
        const result = await provider.poll("cgt-test-task-1");
        assert.equal(result.status, "completed");
        if (result.status === "completed") {
          assert.ok(result.videoFileRef.startsWith("/api/files/"));
          assert.equal(result.durationSec, 5);
          assert.equal(isSupportedVideoFile(result.videoFileRef.split("/").pop()!), true);
        }
      } finally {
        restoreFetch();
      }
    });

    await test("poll 失败/过期返回 failed 且 billed=false（不静默重试）", async () => {
      const cases: Array<[unknown, string]> = [
        [{ status: "failed", error: { message: "内容审核拦截" } }, "内容审核拦截"],
        [{ status: "expired" }, "视频任务已过期"],
      ];
      const provider = createGatewayVideoProvider("doubao-seedance-2-5-260628");
      for (const [payload, expected] of cases) {
        const restoreFetch = installFetchMock(() => Response.json({ id: "cgt-x", ...payload as object }));
        try {
          const result = await provider.poll("cgt-x");
          assert.equal(result.status, "failed");
          if (result.status === "failed") {
            assert.equal(result.billed, false);
            assert.equal(result.error, expected);
          }
        } finally {
          restoreFetch();
        }
      }
    });

    // ---------- runner：异步轮询循环（completed / failed / 超时） ----------
    await test("executeStep video 完成后返回 videos 引用并回调提交 taskId", async () => {
      const submitted: string[] = [];
      const provider: VideoProvider = {
        id: "doubao-seedance-2-5-260628",
        submit: async (req: VideoGenRequest) => {
          assert.ok(req.prompt.includes("服装视频"));
          return { taskId: "cgt-runner-1" };
        },
        poll: async () => ({ status: "completed", videoFileRef: "/api/files/runner.mp4", durationSec: 5 }),
      };
      const result = await executeStep(videoStep(), [], () => provider, {
        resolveVideoProvider: () => provider,
        onVideoTaskSubmitted: async (taskId) => { submitted.push(taskId); },
        videoPollInitialDelayMs: 0,
        videoPollIntervalMs: 1,
        videoPollTimeoutMs: 1_000,
      });
      assert.deepEqual(result.videos, ["/api/files/runner.mp4"]);
      assert.equal(result.videoDurationSec, 5);
      assert.deepEqual(submitted, ["cgt-runner-1"]);
    });

    await test("RUN-02：视频每 poll tick 发 phase 心跳且无 done/total 假值", async () => {
      const heartbeats: RunProgress[] = [];
      let polls = 0;
      const provider: VideoProvider = {
        id: "doubao-seedance-2-5-260628",
        submit: async () => ({ taskId: "cgt-progress-1" }),
        poll: async () => {
          polls += 1;
          if (polls <= 2) return { status: "running" };
          return { status: "completed", videoFileRef: "/api/files/progress.mp4" };
        },
      };
      await executeStep(videoStep(), [], getProvider, {
        resolveVideoProvider: () => provider,
        onProgress: (event) => { heartbeats.push(event); },
        videoPollInitialDelayMs: 0,
        videoPollIntervalMs: 1,
        videoPollTimeoutMs: 1_000,
      });
      assert.deepEqual(heartbeats.map((event) => event.phase), [
        "video-submitted",
        "video-polling",
        "video-polling",
      ]);
      assert.ok(
        heartbeats.every((event) => event.done === undefined && event.total === undefined),
        "视频无百分比能力时禁止出现 done/total 假值",
      );
    });

    await test("executeStep video 失败时抛错（轮询终态 failed）", async () => {
      const provider: VideoProvider = {
        id: "doubao-seedance-2-5-260628",
        submit: async () => ({ taskId: "cgt-fail-1" }),
        poll: async () => ({ status: "failed", error: "内容审核拦截", billed: false }),
      };
      await assert.rejects(
        () => executeStep(videoStep(), [], () => provider, {
          resolveVideoProvider: () => provider,
          videoPollInitialDelayMs: 0,
          videoPollIntervalMs: 1,
          videoPollTimeoutMs: 1_000,
        }),
        /内容审核拦截/,
      );
    });

    await test("executeStep video 轮询超时抛错（异步链路超时路径）", async () => {
      const provider: VideoProvider = {
        id: "doubao-seedance-2-5-260628",
        submit: async () => ({ taskId: "cgt-slow-1" }),
        poll: async () => ({ status: "running" }),
      };
      await assert.rejects(
        () => executeStep(videoStep(), [], () => provider, {
          resolveVideoProvider: () => provider,
          videoPollInitialDelayMs: 0,
          videoPollIntervalMs: 5,
          videoPollTimeoutMs: 40,
        }),
        /超时/,
      );
    });

    // H3 真实响应形状回归（需复用 main() 的 DATA_DIR / fetch mock 环境，故在 finally 前调用）。
    await minimaxH3RegressionSuite();
  } finally {
    restoreKey();
    restoreBase();
    restoreDataDir();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }

  console.log(`\n视频 Provider / 落地 / runner 测试通过：${passed} 项`);
}

/**
 * 2026-11-18 回归：MiniMax-H3 真实响应形状。
 *
 * 用户反馈「生成视频提示 AI 服务返回格式异常」。实测任务
 * task_WRVsIaH3S0gX7rF8GRMz0UK4WsrB1USa 在网关侧**已成功**（completed + video_url），
 * 但契约把 H3 写成 `videoUrlFields:["content.url"]` + `taskWrapper:"task"`，
 * 与网关实际信封（顶层 video_url、无 task 包装）不符 → getByPath 取不到 URL →
 * 抛「AI 服务返回了无效视频地址」。视频其实已生成，只是系统取不到地址。
 *
 * 证据归档：docs/ai/gateway/evidence/2026-11-18-minimax-h3-poll-response.json
 */
async function minimaxH3RegressionSuite(): Promise<void> {
  const evidence = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), "docs/ai/gateway/evidence/2026-11-18-minimax-h3-poll-response.json"),
    "utf8",
  )) as { response: Record<string, unknown> };

  await test("H3 契约声明的 videoUrlFields 含顶层 video_url（修复前只有 content.url）", () => {
    const contract = getVideoModelContract("MiniMax-H3");
    const fields = contract.responseShape?.videoUrlFields ?? [];
    assert.ok(fields.includes("video_url"), `videoUrlFields 必须含 video_url，实际 ${fields.join(",")}`);
    assert.equal(contract.responseShape?.taskWrapper, undefined, "实测无 task 包装，契约不得声明 taskWrapper");
    assert.equal(contract.responseShape?.successStatus, "completed", "实测成功态为 completed");
    assert.ok(
      (contract.responseShape?.pendingStatuses ?? []).includes("in_progress"),
      "实测中间态含 in_progress",
    );
  });

  await test("H3 用真实抓取的响应体能取到 video_url 并落地（原 bug 抛 invalid_response）", async () => {
    const realPayload = { ...evidence.response, video_url: "https://cdn.example/h3-real.mp4" };
    const restoreFetch = installFetchMock(() => Response.json(realPayload));
    try {
      let requestedUrl = "";
      const provider = createGatewayVideoProvider("MiniMax-H3", {
        downloadVideo: async (url) => {
          requestedUrl = url;
          return FAKE_MP4;
        },
      });
      const result = await provider.poll("task_WRVsIaH3S0gX7rF8GRMz0UK4WsrB1USa");
      assert.equal(result.status, "completed", "真实 H3 响应必须识别为完成态");
      assert.equal(requestedUrl, "https://cdn.example/h3-real.mp4", "必须取顶层 video_url");
      if (result.status === "completed") {
        assert.ok(result.videoFileRef.startsWith("/api/files/"));
        assert.equal(result.durationSec, 5, "H3 时长字段为字符串 seconds");
      }
    } finally {
      restoreFetch();
    }
  });

  await test("H3 旧式 content.url 信封仍兼容（双字段回退不破坏既有假设）", async () => {
    const restoreFetch = installFetchMock(() => Response.json({
      id: "h3-legacy",
      status: "completed",
      content: { url: "https://cdn.example/h3-legacy.mp4" },
      seconds: "10",
    }));
    try {
      const provider = createGatewayVideoProvider("MiniMax-H3", {
        downloadVideo: async () => FAKE_MP4,
      });
      const result = await provider.poll("h3-legacy");
      assert.equal(result.status, "completed");
      if (result.status === "completed") assert.equal(result.durationSec, 10);
    } finally {
      restoreFetch();
    }
  });

  await test("H3 的 in_progress 中间态不再抛未知状态", async () => {
    const restoreFetch = installFetchMock(() => Response.json({ id: "h3-mid", status: "in_progress", progress: 50 }));
    try {
      const provider = createGatewayVideoProvider("MiniMax-H3");
      const result = await provider.poll("h3-mid");
      assert.equal(result.status, "running");
    } finally {
      restoreFetch();
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
