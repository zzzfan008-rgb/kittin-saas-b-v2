import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { NodeExecution } from "../src/types/workflow";
import {
  VIDEO_MODEL_IDS,
  getVideoModelContract,
  getVideoRuntimeContract,
  videoModelOptionsWarnings,
} from "../src/types/videoModels";
import {
  createApiyiVideoProvider,
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
import { GARMENT_PROMPT_VARIANTS } from "../src/lib/garmentPromptPresets";

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
    kind: "video",
    inputImages: [],
    params: {
      promptVariantId: GARMENT_PROMPT_VARIANTS[0].variantId,
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
  await test("视频模型清单收敛为单个 doubao-seedance-2-5-260628 且契约一致", () => {
    assert.deepEqual(VIDEO_MODEL_IDS, ["doubao-seedance-2-5-260628"]);
    assert.equal(getVideoModelContract("doubao-seedance-2-5-260628").id, "doubao-seedance-2-5-260628");
    assert.match(getVideoModelContract("doubao-seedance-2-5-260628").contractHash, /^sha256:[a-f0-9]{64}$/);
  });

  await test("视频运行时契约声明异步任务端点与 succeeded 成功状态", () => {
    const runtime = getVideoRuntimeContract();
    assert.equal(runtime.upstreamMode, "async-task");
    assert.equal(runtime.submitEndpoint, "/seedance/api/v3/contents/generations/tasks");
    assert.ok(runtime.pollEndpointTemplate.includes("{id}"));
    assert.equal(runtime.successStatus, "succeeded");
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
  const restoreBase = setEnv("APIYI_BASE_URL", "https://gateway.example");
  const restoreKey = setEnv("APIYI_API_KEY", "apiyi-test-key");

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
        const provider = createApiyiVideoProvider("doubao-seedance-2-5-260628");
        const { taskId } = await provider.submit({ prompt: "一段测试视频" });
        assert.equal(taskId, "cgt-test-task-1");
        assert.equal(captures.length, 1);
        assert.equal(captures[0].url, "https://gateway.example/seedance/api/v3/contents/generations/tasks");
        assert.equal(captures[0].body.model, "doubao-seedance-2-5-260628");
        assert.equal(captures[0].body.duration, 5);
        assert.equal(captures[0].body.generate_audio, false);
        assert.deepEqual(captures[0].body.content, [{ type: "text", text: "一段测试视频" }]);
      } finally {
        restoreFetch();
      }
    });

    await test("poll 把 queued/running 映射为 pending/running（非终态继续轮询）", async () => {
      const states = ["queued", "running"];
      const provider = createApiyiVideoProvider("doubao-seedance-2-5-260628");
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
        return Response.json({
          id: "cgt-test-task-1",
          status: "succeeded",
          content: { video_url: "https://cdn.example/out.mp4" },
          duration: 5,
        });
      });
      try {
        const provider = createApiyiVideoProvider("doubao-seedance-2-5-260628", {
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
      const provider = createApiyiVideoProvider("doubao-seedance-2-5-260628");
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
  } finally {
    restoreKey();
    restoreBase();
    restoreDataDir();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }

  console.log(`\n视频 Provider / 落地 / runner 测试通过：${passed} 项`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
