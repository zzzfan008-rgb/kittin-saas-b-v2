import assert from "node:assert/strict";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import sharp from "sharp";
import sources from "../docs/ai/apiyi/sources.json";
import { config } from "../server/config";
import { compositeMaskedEdit, validateMaskForSource } from "../server/lib/maskProcessing";
import { createRateLimitMiddleware } from "../server/lib/rateLimit";
import { apiyiProviders } from "../server/providers/apiyi";
import { closeApiyiDispatcher } from "../server/providers/apiyiTransport";
import { fetchWithRetry, ProviderError } from "../server/providers/base";
import { createAiDiagnosticsRouter } from "../server/routes/aiDiagnostics";
import {
  IMAGE_MODEL_IDS,
  REVIEWED_MODEL_CATALOG_BASELINE,
  getImageModelContract,
  hasReviewedModelCatalogBaseline,
  imageModelOptionsError,
} from "../src/types/imageModels";

let passed = 0;
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

async function imageDataUrl(
  width: number,
  height: number,
  color: { r: number; g: number; b: number },
  format: "png" | "jpeg" | "webp" = "png",
): Promise<string> {
  const pipeline = sharp({
    create: { width, height, channels: 3, background: color },
  });
  const buffer = format === "webp"
    ? await pipeline.webp().toBuffer()
    : format === "jpeg" ? await pipeline.jpeg().toBuffer() : await pipeline.png().toBuffer();
  const mime = format === "jpeg" ? "image/jpeg" : `image/${format}`;
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function halfEditableMask(width: number, height: number, compressionLevel?: number): Promise<string> {
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      pixels[offset] = 255;
      pixels[offset + 1] = 255;
      pixels[offset + 2] = 255;
      pixels[offset + 3] = x < width / 2 ? 0 : 255;
    }
  }
  const image = sharp(pixels, { raw: { width, height, channels: 4 } });
  const buffer = compressionLevel === undefined
    ? await image.png().toBuffer()
    : await image.png({ compressionLevel }).toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function jsonBody(init: RequestInit | undefined): Record<string, unknown> {
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

function pngPayload(dataUrl: string): { data: Array<{ b64_json: string }> } {
  return { data: [{ b64_json: dataUrl.split(",")[1] }] };
}

function assertPixel(
  data: Buffer,
  width: number,
  channels: number,
  x: number,
  y: number,
  expected: { r: number; g: number; b: number },
): void {
  const offset = (y * width + x) * channels;
  assert.ok(Math.abs(data[offset] - expected.r) <= 2);
  assert.ok(Math.abs(data[offset + 1] - expected.g) <= 2);
  assert.ok(Math.abs(data[offset + 2] - expected.b) <= 2);
}

async function main(): Promise<void> {
  console.log("API易 Provider 契约测试");
  const restoreBase = setEnv("APIYI_BASE_URL", "https://gateway.example");
  const restoreKey = setEnv("APIYI_API_KEY", "apiyi-test-key");
  const white = await imageDataUrl(4, 2, { r: 255, g: 255, b: 255 });
  const blue = await imageDataUrl(4, 2, { r: 20, g: 80, b: 220 });
  const red = await imageDataUrl(4, 2, { r: 220, g: 30, b: 30 });
  const mask = await halfEditableMask(4, 2);

  try {
    await test("本地知识库与 Provider 注册表严格覆盖当前九个模型", () => {
      assert.deepEqual(Object.keys(apiyiProviders).sort(), [...IMAGE_MODEL_IDS].sort());
      assert.equal(Object.hasOwn(apiyiProviders, "grok-imagine-image"), false, "退役模型不得保留 Provider 入口");
      for (const modelId of IMAGE_MODEL_IDS) {
        assert.equal(apiyiProviders[modelId].id, modelId);
        assert.equal(getImageModelContract(modelId).id, modelId);
        assert.ok(getImageModelContract(modelId).upstreamModelId);
      }
      assert.equal(getImageModelContract("gpt-image-2.5-sunburst").generation, null);
    });

    await test("九模型契约哈希绑定同一份 reviewed model catalog baseline", () => {
      const expectedBaseline = {
        reviewedExportHashScope: sources.modelCatalog.reviewedExportHashScope,
        reviewedExportSha256: sources.modelCatalog.reviewedExportSha256,
        reviewedRawExportSha256: sources.modelCatalog.reviewedRawExportSha256,
        expectedGatewayModelIds: sources.modelCatalog.expectedGatewayModelIds,
      };
      assert.deepEqual(REVIEWED_MODEL_CATALOG_BASELINE, expectedBaseline);
      assert.deepEqual(expectedBaseline.expectedGatewayModelIds, IMAGE_MODEL_IDS);
      assert.equal(expectedBaseline.reviewedExportHashScope, "sha256-canonical-model-id-set-v1");
      assert.equal(expectedBaseline.reviewedExportSha256, null);
      assert.equal(expectedBaseline.reviewedRawExportSha256, null);
      assert.equal(sources.modelCatalog.reviewedExportCapturedAt, null);
      assert.equal(hasReviewedModelCatalogBaseline(), false, "新九模型目录尚未经人工评审，运行时基线应保持 null");
      for (const modelId of IMAGE_MODEL_IDS) {
        assert.deepEqual(getImageModelContract(modelId).reviewedModelCatalogBaseline, expectedBaseline);
        assert.match(getImageModelContract(modelId).contractHash, /^sha256:[a-f0-9]{64}$/);
      }
    });

    await test("API易来源清单指向存在的本地整理契约", () => {
      assert.equal(sources.sourceFormat, "official-markdown");
      assert.equal(sources.localKnowledgeBase.rawSourcePagesStored, true);
      assert.equal(sources.localKnowledgeBase.rawContentTrust, "untrusted_document_content");
      assert.ok(
        fs.statSync(path.join(REPO_ROOT, "docs/ai/apiyi", sources.localKnowledgeBase.rawSnapshotPointer)).isFile(),
      );
      for (const document of sources.localKnowledgeBase.documents) {
        assert.ok(fs.statSync(path.join(REPO_ROOT, "docs/ai/apiyi", document)).isFile(), document);
      }
      for (const source of sources.sources) {
        assert.ok(source.markdownUrl.endsWith(".md"), source.markdownUrl);
        assert.match(source.sha256, /^[a-f0-9]{64}$/);
        assert.ok(fs.statSync(path.join(REPO_ROOT, "docs/ai/apiyi", source.localDocument)).isFile());
      }
    });

    await test("API易配置要求非空 Key 与 HTTPS Base URL", () => {
      const restoreMissingKey = setEnv("APIYI_API_KEY", undefined);
      try {
        assert.throws(() => config.apiyiApiKey(), /APIYI_API_KEY/);
        assert.equal(config.aiConfigReady(), false);
      } finally {
        restoreMissingKey();
      }
      const restoreHttp = setEnv("APIYI_BASE_URL", "http://gateway.example");
      try {
        assert.equal(config.aiConfigReady(), false);
      } finally {
        restoreHttp();
      }
      assert.equal(config.aiConfigReady(), true);
    });

    await test("公共请求出口拒绝非 HTTPS 且不会发送 Bearer 请求", async () => {
      let calls = 0;
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        return Response.json({ data: [] });
      });
      try {
        await assert.rejects(
          () => fetchWithRetry("http://gateway.example/v1/images/generations", () => ({
            headers: { Authorization: "Bearer secret" },
          })),
          (error: unknown) => error instanceof ProviderError && error.category === "invalid_request",
        );
        assert.equal(calls, 0);
      } finally {
        restoreFetch();
      }
    });

    await test("gpt-image-2.5-flare-vip 文生图与多参考图编辑使用文档字段", async () => {
      const captures: Array<{ url: string; init?: RequestInit }> = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init });
        return Response.json(pngPayload(white));
      });
      try {
        const generated = await apiyiProviders["gpt-image-2.5-flare-vip"].generate({
          prompt: "礼服",
          operationMode: "generate",
          modelOptions: { size: "1280x1280" },
        });
        assert.deepEqual(generated.images, [white]);
        assert.equal(captures[0].url, "https://gateway.example/v1/images/generations");
        assert.equal(new Headers(captures[0].init?.headers).get("authorization"), "Bearer apiyi-test-key");
        assert.deepEqual(jsonBody(captures[0].init), {
          model: "gpt-image-2.5-flare-vip",
          prompt: "礼服",
          size: "1280x1280",
          quality: "high",
        });
        const generateDispatcher = (captures[0].init as RequestInit & { dispatcher?: unknown })?.dispatcher;
        assert.ok(generateDispatcher, "API易请求必须显式携带专属 Undici dispatcher");

        await apiyiProviders["gpt-image-2.5-flare-vip"].edit({
          prompt: "融合参考图",
          operationMode: "edit",
          referenceImages: [white, blue],
          modelOptions: { size: "2048x2048" },
        });
        const form = captures[1].init?.body as FormData;
        assert.equal(captures[1].url, "https://gateway.example/v1/images/edits");
        assert.equal(form.get("model"), "gpt-image-2.5-flare-vip");
        assert.equal(form.get("size"), "2048x2048");
        assert.equal(form.get("response_format"), null);
        assert.equal(form.getAll("image").length, 2);
        assert.equal(form.getAll("image[]").length, 0);
        assert.equal(form.get("quality"), "high");
        assert.equal(form.get("n"), null);
        assert.equal(form.get("aspect_ratio"), null);
        assert.equal(
          (captures[1].init as RequestInit & { dispatcher?: unknown })?.dispatcher,
          generateDispatcher,
          "同一进程内 API易请求必须复用连接池",
        );
      } finally {
        restoreFetch();
      }
    });

    await test("gpt-image-2.5-sunburst 只接受有效 PNG Alpha 蒙版并发送精确合法尺寸", async () => {
      let calls = 0;
      const capturedForms: FormData[] = [];
      const restoreFetch = installFetchMock((_input, init) => {
        calls += 1;
        capturedForms.push(init?.body as FormData);
        return Response.json(pngPayload(red));
      });
      try {
        await assert.rejects(
          () => apiyiProviders["gpt-image-2.5-sunburst"].generate({
            prompt: "禁止文生图",
            operationMode: "generate",
          }),
          (error: unknown) => error instanceof ProviderError &&
            error.category === "invalid_request" &&
            error.message === "gpt-image-2.5-sunburst 首版仅支持 mask-edit 模式",
        );
        assert.equal(calls, 0);

        const jpegMask = await imageDataUrl(4, 2, { r: 0, g: 0, b: 0 }, "jpeg");
        await assert.rejects(
          () => apiyiProviders["gpt-image-2.5-sunburst"].edit({
            prompt: "局部改红", operationMode: "mask-edit",
            referenceImages: [blue], mask: jpegMask, modelOptions: {},
          }),
          /蒙版必须是 PNG/,
        );
        assert.equal(calls, 0);

        const opaqueMask = await imageDataUrl(4, 2, { r: 0, g: 0, b: 0 });
        await assert.rejects(
          () => apiyiProviders["gpt-image-2.5-sunburst"].edit({
            prompt: "局部改红", operationMode: "mask-edit",
            referenceImages: [blue], mask: opaqueMask, modelOptions: {},
          }),
          /Alpha 通道/,
        );
        assert.equal(calls, 0);

        const wrongSizeMask = await halfEditableMask(2, 2);
        await assert.rejects(
          () => apiyiProviders["gpt-image-2.5-sunburst"].edit({
            prompt: "局部改红", operationMode: "mask-edit",
            referenceImages: [blue], mask: wrongSizeMask, modelOptions: {},
          }),
          /蒙版尺寸必须与原图完全一致/,
        );
        assert.equal(calls, 0);

        const oversizedMask = await halfEditableMask(1024, 1024, 0);
        const maskContract = getImageModelContract("gpt-image-2.5-sunburst").edit.mask;
        assert.ok(maskContract);
        assert.ok(
          Buffer.from(oversizedMask.split(",")[1], "base64").length > maskContract.maxBytes,
          "fixture 必须超过蒙版字节上限",
        );
        await assert.rejects(
          () => apiyiProviders["gpt-image-2.5-sunburst"].edit({
            prompt: "局部改红", operationMode: "mask-edit",
            referenceImages: [blue], mask: oversizedMask, modelOptions: {},
          }),
          /image too large/,
        );
        assert.equal(calls, 0);

        await apiyiProviders["gpt-image-2.5-sunburst"].edit({
          prompt: "局部改红", operationMode: "mask-edit", referenceImages: [blue], mask,
          modelOptions: { size: "1152x576" },
        });
        assert.equal(calls, 1);
        assert.equal(capturedForms[0].get("model"), "gpt-image-2.5-sunburst");
        assert.equal(capturedForms[0].get("n"), null);
        assert.equal(capturedForms[0].get("size"), "1152x576");
        assert.equal(capturedForms[0].get("output_format"), "png");
        assert.equal(
          capturedForms[0].get("background"),
          "opaque",
          "统一局部修改必须请求完整不透明画面",
        );
        assert.equal(capturedForms[0].get("response_format"), null);
        assert.equal(capturedForms[0].get("input_fidelity"), null);
        assert.ok(capturedForms[0].get("image[]") instanceof Blob);
        assert.equal(capturedForms[0].get("image"), null);
        assert.ok(capturedForms[0].get("mask") instanceof Blob);
      } finally {
        restoreFetch();
      }
    });

    await test("蒙版外像素由服务端合成硬保护", async () => {
      await validateMaskForSource(blue, mask);
      const output = await compositeMaskedEdit(blue, mask, red);
      const decoded = await sharp(Buffer.from(output.split(",")[1], "base64"))
        .raw()
        .toBuffer({ resolveWithObject: true });
      assertPixel(decoded.data, decoded.info.width, decoded.info.channels, 0, 0, { r: 220, g: 30, b: 30 });
      assertPixel(decoded.data, decoded.info.width, decoded.info.channels, 3, 0, { r: 20, g: 80, b: 220 });
    });

    await test("Gemini 文生图与 WebP 参考图编辑使用 parts 契约并扫描所有图片 part", async () => {
      const captures: Array<{ url: string; init: RequestInit }> = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init: init ?? {} });
        return Response.json({
          candidates: [{
            finishReason: "STOP",
            content: { parts: [{ text: "done" }, { inlineData: { mimeType: "image/png", data: white.split(",")[1] } }] },
          }],
        });
      });
      try {
        const options = { aspectRatio: "3:4", imageSize: "1K" };
        const generated = await apiyiProviders["gemini-3.1-flash-image"].generate({
          prompt: "时装大片", operationMode: "generate", modelOptions: options,
        });
        assert.deepEqual(generated.images, [white]);
        assert.equal(
          captures[0].url,
          "https://gateway.example/v1beta/models/gemini-3.1-flash-image:generateContent",
        );
        const generateBody = jsonBody(captures[0].init);
        assert.deepEqual(generateBody, {
          contents: [{ parts: [{ text: "时装大片" }] }],
          generationConfig: { responseModalities: ["IMAGE"], imageConfig: options },
        });

        const webp = await imageDataUrl(4, 2, { r: 90, g: 120, b: 150 }, "webp");
        await apiyiProviders["gemini-3.1-flash-image"].edit({
          prompt: "改图", operationMode: "edit", referenceImages: [webp], modelOptions: options,
        });
        assert.equal(captures[1].url, captures[0].url);
        const editBody = jsonBody(captures[1].init) as { contents: Array<{ parts: Array<Record<string, unknown>> }> };
        const parts = editBody.contents[0].parts;
        assert.deepEqual(parts[0], { text: "改图" });
        assert.equal((parts[1].inlineData as { mimeType: string }).mimeType, "image/png");
      } finally {
        restoreFetch();
      }
    });

    await test("FLUX.2 Pro 使用 generations 端点、显式尺寸和有序参考图字段", async () => {
      const captures: Array<{ url: string; init?: RequestInit }> = [];
      const resultUrl = "https://cdn.example/flux.png?token=temporary";
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init });
        return Response.json({ data: [{ url: resultUrl }] });
      });
      try {
        const modelOptions = { width: 1024, height: 768, outputFormat: "png" as const };
        const generated = await apiyiProviders["flux-2-pro"].generate({
          prompt: "生成", operationMode: "generate", modelOptions,
        });
        assert.deepEqual(generated.images, [resultUrl]);
        assert.deepEqual(jsonBody(captures[0].init), {
          model: "flux-2-pro", prompt: "生成", width: 1024, height: 768, output_format: "png",
        });
        await apiyiProviders["flux-2-pro"].edit({
          prompt: "融合", operationMode: "edit", referenceImages: [white, blue], modelOptions,
        });
        const editedBody = jsonBody(captures[1].init);
        const firstInput = String(editedBody.input_image);
        const secondInput = String(editedBody.input_image_2);
        delete editedBody.input_image;
        delete editedBody.input_image_2;
        assert.deepEqual(editedBody, {
          model: "flux-2-pro", prompt: "融合", width: 1024, height: 768, output_format: "png",
        });
        for (const input of [firstInput, secondInput]) {
          assert.match(input, /^data:image\/(?:jpeg|png);base64,/);
          const metadata = await sharp(Buffer.from(input.split(",")[1], "base64")).metadata();
          assert.ok(metadata.width && metadata.height);
          assert.equal(metadata.width % 16, 0);
          assert.equal(metadata.height % 16, 0);
          assert.ok(metadata.width >= 64 && metadata.height >= 64);
          assert.ok(metadata.width * metadata.height <= 4_194_304);
        }

        const largeReference = await imageDataUrl(3000, 2000, { r: 120, g: 80, b: 40 }, "jpeg");
        await apiyiProviders["flux-2-pro"].edit({
          prompt: "缩放输入", operationMode: "edit", referenceImages: [largeReference], modelOptions,
        });
        const adapted = String(jsonBody(captures[2].init).input_image);
        const adaptedMetadata = await sharp(Buffer.from(adapted.split(",")[1], "base64")).metadata();
        assert.ok(adaptedMetadata.width && adaptedMetadata.height);
        assert.equal(adaptedMetadata.width % 16, 0);
        assert.equal(adaptedMetadata.height % 16, 0);
        assert.ok(adaptedMetadata.width * adaptedMetadata.height <= 4_194_304);
        assert.ok(captures.every((capture) => capture.url === "https://gateway.example/v1/images/generations"));
      } finally {
        restoreFetch();
      }
    });

    await test("Seedream 固定关闭水印与序列生成且禁止发送 n", async () => {
      const bodies: Record<string, unknown>[] = [];
      const restoreFetch = installFetchMock((_input, init) => {
        bodies.push(jsonBody(init));
        return Response.json({
          data: [{
            b64_json: white.split(",")[1],
            size: bodies.length === 1 ? "2048x2048" : "3072x3072",
          }],
        });
      });
      try {
        const generated = await apiyiProviders["seedream-5-0-260128"].generate({
          prompt: "生成", operationMode: "generate", batchSize: 8, modelOptions: { size: "2K" },
        });
        const edited = await apiyiProviders["seedream-5-0-260128"].edit({
          prompt: "融合", operationMode: "edit",
          referenceImages: [white, blue], modelOptions: { size: "3K" },
        });
        assert.deepEqual(generated.providerOutputSizes, ["2048x2048"]);
        assert.deepEqual(edited.providerOutputSizes, ["3072x3072"]);
        assert.deepEqual(bodies[0], {
          model: "seedream-5-0-260128", prompt: "生成", size: "2K", response_format: "b64_json",
          watermark: false, sequential_image_generation: "disabled",
        });
        assert.deepEqual(bodies[1], {
          model: "seedream-5-0-260128", prompt: "融合", image: [white, blue], size: "3K",
          response_format: "b64_json", watermark: false, sequential_image_generation: "disabled",
        });
        assert.equal("n" in bodies[0], false);
      } finally {
        restoreFetch();
      }
    });

    await test("非法模型原生参数在付费调用前拒绝", async () => {
      assert.match(imageModelOptionsError("flux-2-pro", { width: 513, height: 512, outputFormat: "png" }) ?? "", /unsupported/);
      assert.match(imageModelOptionsError("seedream-5-0-260128", { size: "4K" }) ?? "", /unsupported/);
      let calls = 0;
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        return Response.json(pngPayload(white));
      });
      try {
        await assert.rejects(
          () => apiyiProviders["flux-2-pro"].generate({
            prompt: "非法尺寸",
            operationMode: "generate",
            modelOptions: { width: 513, height: 512, outputFormat: "png" },
          }),
          /模型参数无效/,
        );
        assert.equal(calls, 0);
      } finally {
        restoreFetch();
      }
    });

    await test("HTTP 200 响应体截断标记 outcome_unknown 且只请求一次", async () => {
      let calls = 0;
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        return new Response("{", { status: 200, headers: { "Content-Type": "application/json" } });
      });
      try {
        await assert.rejects(
          () => apiyiProviders["gpt-image-2.5-flare-vip"].generate({
            prompt: "截断", operationMode: "generate", modelOptions: { size: "1280x1280" },
          }),
          (error: unknown) => error instanceof ProviderError && error.category === "outcome_unknown",
        );
        assert.equal(calls, 1);
      } finally {
        restoreFetch();
      }
    });

    await test("HTTP 200 完整对象已到齐但无 EOF 时安全收尾，仍只发送一次", async () => {
      const restoreGrace = setEnv("APIYI_TAIL_STALL_GRACE_MS", "1000");
      let calls = 0;
      let cancelCount = 0;
      let payload: Record<string, unknown> = {
        ...pngPayload(white),
        padding: "x".repeat(1_100),
      };
      const originalWarn = console.warn;
      const recoveryEvents: unknown[] = [];
      console.warn = (...args: unknown[]) => { recoveryEvents.push(args); };
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(JSON.stringify(payload)));
          },
          cancel() { cancelCount += 1; },
        });
        return new Response(stream, { status: 200, headers: { "Content-Type": "application/json" } });
      });
      const request = () => apiyiProviders["gpt-image-2.5-flare-vip"].generate({
        prompt: "尾部恢复", operationMode: "generate", modelOptions: { size: "1280x1280" },
      });
      try {
        assert.deepEqual((await request()).images, [white]);
        assert.equal(calls, 1);
        assert.equal(cancelCount, 1);
        assert.equal(recoveryEvents.length, 1);

        payload = { data: [{ b64_json: "not-canonical-base64-response" }], padding: "x".repeat(1_100) };
        await assert.rejects(
          request,
          (error: unknown) => error instanceof ProviderError && error.category === "invalid_response",
        );
        assert.equal(calls, 2, "尾部恢复后的坏图片也不得触发第二次请求");
        assert.equal(cancelCount, 2);
      } finally {
        restoreFetch();
        console.warn = originalWarn;
        restoreGrace();
      }
    });

    await test("HTTP 200 中的损坏 Base64、伪造 MIME 与非法 URL 均确定失败且只请求一次", async () => {
      const jpeg = await imageDataUrl(4, 2, { r: 70, g: 110, b: 160 }, "jpeg");
      const signatureOnly = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString("base64");
      let payload: unknown = {};
      let calls = 0;
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        return Response.json(payload);
      });
      const vipRequest = () => apiyiProviders["gpt-image-2.5-flare-vip"].generate({
        prompt: "响应校验", operationMode: "generate", modelOptions: { size: "1280x1280" },
      });
      try {
        const scenarios: Array<{ payload: unknown; invoke: () => Promise<unknown> }> = [
          { payload: { data: [{ b64_json: "not-canonical-base64-response" }] }, invoke: vipRequest },
          { payload: { data: [{ b64_json: signatureOnly }] }, invoke: vipRequest },
          {
            payload: {
              candidates: [{ content: { parts: [{
                inlineData: { mimeType: "image/png", data: jpeg.split(",")[1] },
              }] } }],
            },
            invoke: () => apiyiProviders["gemini-3.1-flash-image"].generate({
              prompt: "响应校验", operationMode: "generate",
              modelOptions: { aspectRatio: "1:1", imageSize: "1K" },
            }),
          },
          { payload: { data: [{ url: "/relative-result.png?token=secret" }] }, invoke: vipRequest },
          {
            payload: pngPayload(white),
            invoke: () => apiyiProviders["seedream-5-0-260128"].generate({
              prompt: "响应校验", operationMode: "generate", modelOptions: { size: "2K" },
            }),
          },
        ];
        for (const scenario of scenarios) {
          payload = scenario.payload;
          calls = 0;
          await assert.rejects(
            scenario.invoke,
            (error: unknown) => error instanceof ProviderError &&
              error.status === 502 && error.category === "invalid_response",
          );
          assert.equal(calls, 1, "HTTP 200 内的坏图片不得触发第二次付费请求");
        }
      } finally {
        restoreFetch();
      }
    });

    await test("内容审核常见错误码与措辞统一分类为确定拒绝", async () => {
      let responseBody: unknown = {};
      let calls = 0;
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        return new Response(JSON.stringify(responseBody), { status: 400 });
      });
      try {
        for (const errorBody of [
          { message: "content policy violation: raw gateway detail" },
          { message: "Your request was rejected as a result of our safety system." },
          { code: "content_filter", message: "The response was filtered by the content management policy." },
          { code: "ResponsibleAIPolicyViolation", message: "The request was blocked." },
        ]) {
          responseBody = { error: errorBody };
          calls = 0;
          await assert.rejects(
            () => fetchWithRetry("https://gateway.example/v1/images/edits", () => ({}), { providerId: "test" }),
            (error: unknown) => error instanceof ProviderError &&
              error.category === "content_refused" &&
              error.message === "本次请求未通过 AI 安全审核，请调整提示词或参考图片后重试",
          );
          assert.equal(calls, 1);
        }
      } finally {
        restoreFetch();
      }
    });

    await test("网关 401/403 始终优先归类为鉴权失败且不重试", async () => {
      let status = 401;
      let responseMessage = "content policy violation while validating the API key";
      let calls = 0;
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        return new Response(JSON.stringify({ error: { message: responseMessage } }), { status });
      });
      try {
        for (const scenario of [
          { status: 401, message: "content policy violation while validating the API key" },
          { status: 403, message: "model gpt-image-2.5-sunburst is not available for this API key" },
        ]) {
          status = scenario.status;
          responseMessage = scenario.message;
          calls = 0;
          await assert.rejects(
            () => fetchWithRetry("https://gateway.example/v1/images/generations", () => ({}), { providerId: "test" }),
            (error: unknown) => error instanceof ProviderError &&
              error.status === status && error.category === "gateway_authentication" &&
              error.message === "AI 网关鉴权失败，请联系管理员检查 API Key 或账号权限",
          );
          assert.equal(calls, 1);
        }
      } finally {
        restoreFetch();
      }
    });

    await test("AI 诊断列出九个 API易模型且 gpt-image-2.5-sunburst 只开放改图探针", async () => {
      const app = express();
      app.use(express.json());
      app.use((req, _res, next) => {
        (req as express.Request & { authUser: unknown }).authUser = {
          id: "admin-test", accountId: "admin-test", displayName: "Admin Test",
          role: "admin", mustChangePassword: false,
        };
        next();
      });
      app.use("/api/ai-diagnostics", createAiDiagnosticsRouter(createRateLimitMiddleware({
        windowMs: 60_000, maxRequests: 1,
      })));
      const server = app.listen(0, "127.0.0.1");
      await new Promise<void>((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
      });
      const address = server.address() as AddressInfo;
      const baseUrl = `http://127.0.0.1:${address.port}/api/ai-diagnostics`;
      try {
        const response = await fetch(baseUrl);
        assert.equal(response.status, 200);
        const body = await response.json() as {
          gateway: string;
          providers: Array<{ providerId: string; configured: boolean; probes: string[] }>;
        };
        assert.equal(body.gateway, "gateway.example");
        assert.deepEqual(body.providers.map((item) => item.providerId), IMAGE_MODEL_IDS);
        assert.ok(body.providers.every((item) => item.configured));
        assert.deepEqual(body.providers.find((item) => item.providerId === "gpt-image-2.5-sunburst")?.probes, ["edit"]);

        const invalid = {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerId: "invalid", mode: "invalid" }),
        };
        assert.equal((await fetch(`${baseUrl}/probe`, invalid)).status, 400);
        assert.equal((await fetch(`${baseUrl}/probe`, invalid)).status, 429);
      } finally {
        await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      }
    });
  } finally {
    await closeApiyiDispatcher();
    restoreKey();
    restoreBase();
  }

  console.log(`\n通过 ${passed} 项`);
}

await main();
