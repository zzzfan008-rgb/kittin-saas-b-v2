/**
 * 产物图片下载的重试与降级契约。
 *
 * 背景：gpt-image 产物是 7–11MB PNG，托管在跨区 CDN；原实现 30 秒硬超时且不重试，
 * 一次网络抖动就把「图已生成」的整单判成失败，且不留任何日志。
 *
 * 覆盖：瞬时网络错误自动重试、持续超时降级为中文文案、确定性错误不重试。
 *
 * 运行：npx tsx tests/artifact-download-retry.test.ts
 */
import assert from "node:assert/strict";
import { downloadImageToDataUrl, type ImageFetch, type ImageResponse } from "../server/lib/fileStore";

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

/** 1×1 透明 PNG。 */
const PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const IMAGE_URL = "https://cdn.example.com/out.png";
/** 任何公网 IP 都可，避免测试依赖真实 DNS。 */
const lookup = async () => ["93.184.216.34"] as const;

function pngResponse(): ImageResponse {
  const buf = Buffer.from(PNG_BASE64, "base64");
  return {
    ok: true,
    status: 200,
    headers: {
      get(name: string) {
        const key = name.toLowerCase();
        if (key === "content-type") return "image/png";
        if (key === "content-length") return String(buf.byteLength);
        return null;
      },
    },
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
  };
}

function networkError(code: string): Error {
  const error = new Error(`read ${code}`) as Error & { code?: string };
  error.code = code;
  return error;
}

console.log("产物下载重试契约测试");

await test("瞬时网络错误后重试成功（第 1 次失败、第 2 次成功）", async () => {
  let calls = 0;
  const fetchStub: ImageFetch = async () => {
    calls += 1;
    if (calls === 1) throw networkError("ECONNRESET");
    return pngResponse();
  };
  const dataUrl = await downloadImageToDataUrl(IMAGE_URL, { lookup, fetch: fetchStub });
  assert.ok(dataUrl.startsWith("data:image/png;base64,"), "应返回 PNG dataURL");
  assert.equal(calls, 2, "应重试一次");
});

await test("持续超时：重试到上限后降级为中文提示", async () => {
  let calls = 0;
  const fetchStub: ImageFetch = async () => {
    calls += 1;
    const error = new Error("The operation was aborted");
    error.name = "AbortError";
    throw error;
  };
  await assert.rejects(
    () => downloadImageToDataUrl(IMAGE_URL, { lookup, fetch: fetchStub }),
    (error: unknown) => {
      const message = (error as Error).message;
      assert.match(message, /图片回传超时/, "应是中文提示");
      assert.match(message, /已尝试 3 次/, "应说明重试次数");
      assert.match(message, /图片可能已在网关生成/, "应提示结果可能已存在");
      return true;
    },
  );
  assert.equal(calls, 3, "共尝试 3 次");
});

await test("体积超限属确定性错误，不重试且保留原始原因", async () => {
  let calls = 0;
  const fetchStub: ImageFetch = async () => {
    calls += 1;
    return {
      ok: true,
      status: 200,
      headers: {
        get(name: string) {
          const key = name.toLowerCase();
          if (key === "content-type") return "image/png";
          if (key === "content-length") return String(21 * 1024 * 1024);
          return null;
        },
      },
      arrayBuffer: async () => new ArrayBuffer(0),
    };
  };
  await assert.rejects(
    () => downloadImageToDataUrl(IMAGE_URL, { lookup, fetch: fetchStub }),
    /image too large/,
  );
  assert.equal(calls, 1, "确定性错误不应重试");
});

await test("404 不重试（重试也无法恢复）", async () => {
  let calls = 0;
  const fetchStub: ImageFetch = async () => {
    calls += 1;
    return {
      ok: false,
      status: 404,
      headers: { get: () => null },
      arrayBuffer: async () => new ArrayBuffer(0),
    };
  };
  await assert.rejects(
    () => downloadImageToDataUrl(IMAGE_URL, { lookup, fetch: fetchStub }),
    /image download failed: HTTP 404/,
  );
  assert.equal(calls, 1, "4xx 不应重试");
});

console.log(`\n通过 ${passed} 项产物下载测试`);
