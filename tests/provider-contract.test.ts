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
      // 2026-10-28 实测：sunburst 支持文生图/图生图，generation 不再为 null。
      assert.ok(getImageModelContract("gpt-image-2.5-sunburst").generation);
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
      // 2026-10-29 用户拍板 A：API易 全站快照已删除（128MB/8441 文件），凭证门取消；
      // 但每个来源仍必须绑定本地整理契约（models/*.md），这条不放松。
      assert.equal(sources.localKnowledgeBase.rawSourcePagesStored, false);
      assert.equal(sources.localKnowledgeBase.kind, "curated-contract-only");
      assert.equal(sources.localKnowledgeBase.rawContentTrust, "untrusted_document_content");
      assert.equal(sources.localKnowledgeBase.rawSnapshotPointer, undefined, "快照指针必须已移除");
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

    await test("gpt-image-2.5-flare 文生图与多参考图编辑使用文档字段", async () => {
      const captures: Array<{ url: string; init?: RequestInit }> = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init });
        return Response.json(pngPayload(white));
      });
      try {
        const generated = await apiyiProviders["gpt-image-2.5-flare"].generate({
          prompt: "礼服",
          operationMode: "generate",
          modelOptions: { size: "1280x1280" },
        });
        assert.deepEqual(generated.images, [white]);
        assert.equal(captures[0].url, "https://gateway.example/v1/images/generations");
        assert.equal(new Headers(captures[0].init?.headers).get("authorization"), "Bearer apiyi-test-key");
        assert.deepEqual(jsonBody(captures[0].init), {
          model: "gpt-image-2.5-flare",
          prompt: "礼服",
          size: "1280x1280",
          quality: "high",
        });
        const generateDispatcher = (captures[0].init as RequestInit & { dispatcher?: unknown })?.dispatcher;
        assert.ok(generateDispatcher, "API易请求必须显式携带专属 Undici dispatcher");

        await apiyiProviders["gpt-image-2.5-flare"].edit({
          prompt: "融合参考图",
          operationMode: "edit",
          referenceImages: [white, blue],
          modelOptions: { size: "2048x2048" },
        });
        const form = captures[1].init?.body as FormData;
        assert.equal(captures[1].url, "https://gateway.example/v1/images/edits");
        assert.equal(form.get("model"), "gpt-image-2.5-flare");
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

    await test("gpt-image-2.5-flare 空参数用契约默认值填充且绝不写出 size=undefined", async () => {
      // 兔子API 契约声明 flare 的默认 size=1536x2048、quality=high：空参数必须填契约默认；
      // 核心保证不变：任何字段都不得被序列化成字面量 "undefined" 触发上游 4xx。
      const captures: Array<{ url: string; init?: RequestInit }> = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init });
        return Response.json(pngPayload(white));
      });
      try {
        await apiyiProviders["gpt-image-2.5-flare"].edit({
          prompt: "融合参考图",
          operationMode: "edit",
          referenceImages: [white],
          modelOptions: {},
        });
        const form = captures[0].init?.body as FormData;
        assert.equal(form.get("size"), "1536x2048", "缺 size 时填契约默认值，而不是写出字面量 undefined");
        assert.equal(form.get("quality"), "high");
        assert.equal(form.get("model"), "gpt-image-2.5-flare");
        for (const [, value] of form.entries()) {
          assert.notEqual(String(value), "undefined", "任何表单字段都不得是字面量 undefined");
        }
      } finally {
        restoreFetch();
      }
    });

    await test("gpt-image-2.5-flare 直接用 size 控制尺寸，不再拼接提示词前缀", async () => {
      // 兔子API 迁移后，gpt-image-2.5-flare 直接接受像素 size（旧 gpt-image-2.5-all 的
      // promptSizePrefix 机制已随该模型退役删除）：prompt 必须原样发送，不被改写。
      const captures: Array<{ url: string; init?: RequestInit }> = [];
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init });
        return Response.json(pngPayload(white));
      });
      try {
        await apiyiProviders["gpt-image-2.5-flare"].generate({
          prompt: "一只猫",
          operationMode: "generate",
          modelOptions: { size: "3840x2160" },
        });
        assert.deepEqual(jsonBody(captures[0].init), {
          model: "gpt-image-2.5-flare",
          prompt: "一只猫",
          size: "3840x2160",
          quality: "high",
        }, "文生图必须直接传像素 size，prompt 不得拼接任何尺寸前缀");

        await apiyiProviders["gpt-image-2.5-flare"].edit({
          prompt: "加一顶帽子",
          operationMode: "edit",
          referenceImages: [white],
          modelOptions: { size: "1024x1536" },
        });
        const form = captures[1].init?.body as FormData;
        assert.equal(captures[1].url, "https://gateway.example/v1/images/edits");
        assert.equal(form.get("prompt"), "加一顶帽子", "编辑 prompt 必须原样发送");
        assert.equal(form.get("size"), "1024x1536", "编辑直接传像素 size");
      } finally {
        restoreFetch();
      }
    });

    await test("gpt-image-2.5-sunburst 的蒙版局部修改校验 PNG Alpha 并发送精确合法尺寸", async () => {
      let calls = 0;
      const capturedForms: FormData[] = [];
      const restoreFetch = installFetchMock((_input, init) => {
        calls += 1;
        capturedForms.push(init?.body as FormData);
        return Response.json(pngPayload(red));
      });
      try {
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
        // 兔子API /v1/images/edits 没有 background / output_format / input_fidelity 字段。
        assert.equal(capturedForms[0].get("background"), null);
        assert.equal(capturedForms[0].get("output_format"), null);
        assert.equal(capturedForms[0].get("input_fidelity"), null);
        assert.equal(capturedForms[0].get("response_format"), null);
        // 兔子文档图片字段统一为 image（可重复多文件），不是 image[]。
        assert.ok(capturedForms[0].get("image") instanceof Blob);
        assert.equal(capturedForms[0].get("image[]"), null);
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
        // 2026-10-28：Gemini parts 改为「图片在前（每图前带「参考图N：」标签）+ 提示词在后」，
        // 让图号与图片就地绑定；谷歌两个模型此前对图号-图片的对应不稳定。
        assert.deepEqual(parts[0], { text: "参考图1：" });
        // 兔子API 的 Gemini 端点用 snake_case（inline_data/mime_type）；WebP 必须转成 PNG 上传。
        assert.equal((parts[1].inline_data as { mime_type: string }).mime_type, "image/png");
        assert.deepEqual(parts[2], { text: "改图" }, "提示词必须排在全部图片之后");

        // 2026-10-28 角色下发：有 role 时标签内联角色（图号 + 是什么绑在同一点）。
        await apiyiProviders["gemini-3.1-flash-image"].edit({
          prompt: "换装",
          operationMode: "edit",
          references: [
            { dataUrl: await imageDataUrl(4, 4, { r: 200, g: 30, b: 30 }, "png"), order: 0, assetSha256: "0".repeat(64), role: "服装" },
            { dataUrl: await imageDataUrl(4, 4, { r: 30, g: 30, b: 200 }, "png"), order: 1, assetSha256: "1".repeat(64), role: "模特" },
          ],
          // 旧数组通道必须与结构化通道逐项一致（referenceInputs 契约）
          referenceImages: [
            await imageDataUrl(4, 4, { r: 200, g: 30, b: 30 }, "png"),
            await imageDataUrl(4, 4, { r: 30, g: 30, b: 200 }, "png"),
          ],
          modelOptions: options,
        });
        const roleBody = jsonBody(captures[2].init) as { contents: Array<{ parts: Array<Record<string, unknown>> }> };
        const roleParts = roleBody.contents[0].parts;
        assert.deepEqual(roleParts[0], { text: "参考图1（服装）：" });
        assert.deepEqual(roleParts[2], { text: "参考图2（模特）：" });
        assert.deepEqual(roleParts[4], { text: "换装" });
      } finally {
        restoreFetch();
      }
    });

    await test("FLUX 3 Image 统一走 JSON generations，参考图用 input_image / input_image_2", async () => {
      // 2026-10-28 实测更正：原生 /flux/v1 只接受 prompt+width+height；multipart edits 传多张
      // 同名 image 时参考图被整体丢弃。唯一可用形态 = JSON generations + input_image*。
      const captures: Array<{ url: string; init?: RequestInit }> = [];
      const resultUrl = "https://cdn.example/flux.png?token=temporary";
      const restoreFetch = installFetchMock((input, init) => {
        captures.push({ url: String(input), init });
        return Response.json({ data: [{ url: resultUrl }] });
      });
      try {
        const generated = await apiyiProviders["flux-3-image"].generate({
          prompt: "生成", operationMode: "generate",
          modelOptions: { aspect_ratio: "3:4", output_format: "png" },
        });
        assert.deepEqual(generated.images, [resultUrl]);
        assert.equal(captures[0].url, "https://gateway.example/v1/images/generations");
        assert.deepEqual(jsonBody(captures[0].init), {
          model: "flux-3-image", prompt: "生成", aspect_ratio: "3:4", output_format: "png",
        }, "flux generations 只发 aspect_ratio，不发 width/height/size");

        await apiyiProviders["flux-3-image"].edit({
          prompt: "融合", operationMode: "edit", referenceImages: [white, blue],
          modelOptions: { aspect_ratio: "3:4" },
        });
        assert.equal(
          captures[1].url,
          "https://gateway.example/v1/images/generations",
          "flux 参考图必须走 JSON generations，不能再用 multipart edits",
        );
        const editBody = jsonBody(captures[1].init);
        assert.equal(editBody.model, "flux-3-image");
        assert.equal(editBody.prompt, "融合");
        assert.equal(typeof editBody.input_image, "string", "图1 用 input_image");
        assert.equal(typeof editBody.input_image_2, "string", "图2 用 input_image_2");
        assert.equal("image" in editBody, false, "不得再出现 multipart 时代的 image 字段");
        assert.equal("images" in editBody, false, "兔子网关不接受 images 数组名");
      } finally {
        restoreFetch();
      }
    });

    await test("Seedream 固定关闭水印、不再发送 sequential_image_generation、禁止发送 n", async () => {
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
        const generated = await apiyiProviders["doubao-seedream-5-0-pro-260628"].generate({
          prompt: "生成", operationMode: "generate", batchSize: 8, modelOptions: { size: "2K" },
        });
        const edited = await apiyiProviders["doubao-seedream-5-0-pro-260628"].edit({
          prompt: "融合", operationMode: "edit",
          referenceImages: [white, blue], modelOptions: { size: "3K" },
        });
        assert.deepEqual(generated.providerOutputSizes, ["2048x2048"]);
        assert.deepEqual(edited.providerOutputSizes, ["3072x3072"]);
        // 2026-10-28 实测：seedream 5.0 pro/lite 不再支持 sequential_image_generation，
        // 带上会 400 "not supported by the current model"（生图 0 秒失败）。
        assert.deepEqual(bodies[0], {
          model: "doubao-seedream-5-0-pro-260628", prompt: "生成", size: "2K", response_format: "b64_json",
          watermark: false,
        });
        assert.deepEqual(bodies[1], {
          model: "doubao-seedream-5-0-pro-260628", prompt: "融合", image: [white, blue], size: "3K",
          response_format: "b64_json", watermark: false,
        });
        for (const body of bodies) {
          assert.equal("sequential_image_generation" in body, false, "不得再发 sequential_image_generation");
        }
        assert.equal("n" in bodies[0], false);
      } finally {
        restoreFetch();
      }
    });

    await test("模型原生参数校验降级为 warning：仅形状校验，取值不再阻断付费调用", async () => {
      assert.equal(imageModelOptionsError("flux-3-image", null), "must be an object");
      assert.equal(imageModelOptionsError("flux-3-image", [1, 2, 3]), "must be an object");
      assert.equal(imageModelOptionsError("flux-3-image", { width: 513, height: 512, outputFormat: "png" }), undefined);
      assert.equal(imageModelOptionsError("doubao-seedream-5-0-pro-260628", { size: "4K" }), undefined);
      let calls = 0;
      const restoreFetch = installFetchMock(() => {
        calls += 1;
        return Response.json({ data: [{ url: "https://cdn.example/generated.png" }] });
      });
      try {
        await apiyiProviders["flux-3-image"].generate({
          prompt: "非法尺寸",
          operationMode: "generate",
          modelOptions: { width: 513, height: 512, outputFormat: "png" },
        });
        assert.equal(calls, 1);
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
          () => apiyiProviders["gpt-image-2.5-flare"].generate({
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
      const request = () => apiyiProviders["gpt-image-2.5-flare"].generate({
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
      const vipRequest = () => apiyiProviders["gpt-image-2.5-flare"].generate({
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
            invoke: () => apiyiProviders["doubao-seedream-5-0-pro-260628"].generate({
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
              error.message === "AI 网关鉴权失败，请联系管理员检查密钥或账号权限",
          );
          assert.equal(calls, 1);
        }
      } finally {
        restoreFetch();
      }
    });

    await test("AI 诊断列出九个模型，sunburst 同时开放文生图与改图探针", async () => {
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
        // 2026-10-28 实测：sunburst 支持文生图，探针随契约 generation 自动扩为 generate+edit。
        assert.deepEqual(body.providers.find((item) => item.providerId === "gpt-image-2.5-sunburst")?.probes, ["generate", "edit"]);

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
