/**
 * runner taskPrompt 组装回归测试（64 Phase 1 C3/C6，纯逻辑 + 注入 fake provider，不调真实 API/DB）。
 * 覆盖（architect 验收标准）：
 * - generate = 纯用户文本零系统文本（裁决 E；系统文本为空串 = 裸 API 零回归）
 * - mask-edit = 冻结系统文本 + 用户文本（裁决 E：操作协议文本与协议强制一体）
 * - edit = 用户文本 + 参考图列表（image.edit 系统文本为空，编辑协议文本随预设模板进正文）
 * - 裸 API 回归：params.prompt 直发
 * - C6：Provider 请求不携带 variant 绑定字段
 * 运行：node node_modules/tsx/dist/cli.mjs tests/runner-task-prompt.test.ts
 */
import assert from "node:assert/strict";
import sharp from "sharp";
import type { AIProvider, ImageGenRequest, ImageGenResult, NodeExecution } from "../src/types/workflow";
import { executeStep } from "../server/engine/runner";

let passed = 0;
function ok(name: string, fn: () => void | Promise<void>): Promise<void> | void {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(() => {
        passed += 1;
        console.log(`  ✓ ${name}`);
      }).catch((error) => {
        console.error(`  ✗ ${name}`);
        console.error(error);
        process.exitCode = 1;
      });
    }
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

/** 1x1 透明 PNG dataURL（validateImageDataUrl 可解码；mask 契约 PNG MIME）。 */
const PNG_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** 不透明 PNG（合成层 unifiedGeneratedLayer 要求生成图覆盖修改区且不透明）。 */
const OPAQUE_PNG_DATA_URL = `data:image/png;base64,${(await sharp({
  create: { width: 8, height: 8, channels: 3, background: { r: 255, g: 255, b: 255 } },
}).png().toBuffer()).toString("base64")}`;

/** 8x8 带 Alpha 蒙版 PNG（与原图同尺寸契约；中心可编辑区）。 */
const MASK_PNG_DATA_URL = `data:image/png;base64,${(await sharp({
  create: { width: 8, height: 8, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0.5 } },
}).png().toBuffer()).toString("base64")}`;

interface CapturedCall {
  request: ImageGenRequest;
}

function fakeProvider(calls: CapturedCall[], resultImage = PNG_DATA_URL): AIProvider {
  return {
    id: "fake-provider",
    generate(req: ImageGenRequest): Promise<ImageGenResult> {
      calls.push({ request: req });
      return Promise.resolve({ images: [resultImage], model: "gpt-image-2.5-flare-vip" });
    },
    edit(req: ImageGenRequest): Promise<ImageGenResult> {
      calls.push({ request: req });
      return Promise.resolve({ images: [resultImage], model: "gpt-image-2.5-flare-vip" });
    },
  };
}

function imageStep(params: Record<string, unknown>, inputImages: string[] = []): NodeExecution {
  return {
    nodeId: "g1",
    kind: "image-generator",
    inputImages,
    params,
  };
}

async function main() {
  console.log("runner taskPrompt 组装测试（64 Phase 1 C3）");

  await ok("generate：纯用户文本零系统文本（operationMode 缺省 = generate）", async () => {
    const calls: CapturedCall[] = [];
    await executeStep(imageStep({ modelId: "gpt-image-2.5-flare-vip", inputTexts: ["一件白色连衣裙"] }), [], () => fakeProvider(calls));
    assert.equal(calls.length, 1);
    const req = calls[0].request;
    assert.equal(req.prompt, "一件白色连衣裙");
    assert.equal(req.operationMode, "generate");
  });

  await ok("generate：显式 operationMode=\"generate\" 同样零系统文本", async () => {
    const calls: CapturedCall[] = [];
    await executeStep(imageStep({
      modelId: "gpt-image-2.5-flare-vip", operationMode: "generate", inputTexts: ["电商主图"],
    }), [], () => fakeProvider(calls));
    assert.equal(calls[0].request.prompt, "电商主图");
    assert.equal(calls[0].request.operationMode, "generate");
  });

  await ok("edit：用户文本 + 参考图列表（image.edit 系统文本为空，无旧 fullPrompt 残留）", async () => {
    const calls: CapturedCall[] = [];
    const step = imageStep({
      modelId: "gpt-image-2.5-flare-vip",
      operationMode: "edit",
      inputTexts: ["把这件衣服穿到模特身上"],
    }, [PNG_DATA_URL]);
    await executeStep(step, step.inputImages, () => fakeProvider(calls));
    const req = calls[0].request;
    assert.equal(req.prompt, "把这件衣服穿到模特身上\n参考图:参考图1");
    assert.equal(req.operationMode, "edit");
    assert.ok(!req.prompt.includes("GPT Image 2 VIP"), "不得残留旧 variant fullPrompt");
  });

  await ok("mask-edit：冻结系统文本 + 用户文本（操作协议文本一体拼装）", async () => {
    const calls: CapturedCall[] = [];
    const step = imageStep({
      modelId: "gpt-image-2.5-sunburst",
      operationMode: "mask-edit",
      inputTexts: ["把领子改成圆领"],
      mask: MASK_PNG_DATA_URL,
      maskSourceRef: OPAQUE_PNG_DATA_URL,
    }, [OPAQUE_PNG_DATA_URL]);
    await executeStep(step, step.inputImages, () => fakeProvider(calls, OPAQUE_PNG_DATA_URL));
    const req = calls[0].request;
    assert.equal(req.operationMode, "mask-edit");
    // 系统文本（冻结表 image.mask-edit）作为 TARGET 进入蒙版模板，用户文本随 TARGET 一体送达
    assert.ok(req.prompt.includes("GPT Image 2 服装局部修改。"), `缺系统文本: ${req.prompt.slice(0, 60)}`);
    assert.ok(req.prompt.includes("把领子改成圆领"), `缺用户文本: ${req.prompt.slice(0, 60)}`);
  });

  await ok("裸 API 回归：params.prompt 直发（无 inputTexts，= 今日裸 API 行为）", async () => {
    const calls: CapturedCall[] = [];
    await executeStep(imageStep({
      modelId: "gpt-image-2.5-flare-vip",
      prompt: "直发提示词",
    }), [], () => fakeProvider(calls));
    assert.equal(calls[0].request.prompt, "直发提示词");
    assert.equal(calls[0].request.operationMode, "generate");
  });

  await ok("C6：Provider 请求不携带 variant 绑定六字段", async () => {
    const calls: CapturedCall[] = [];
    await executeStep(imageStep({
      modelId: "gpt-image-2.5-flare-vip",
      inputTexts: ["测试"],
      // 脏 params 携带旧字段：runner 绝不透传（C6 组装剥除）
      promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
      promptFamilyId: "fashion-lookbook",
      parameterProfileId: "p1",
      contractHash: "sha256:" + "a".repeat(64),
      evaluationVersion: "v99",
      postprocessVersion: "p1",
    }), [], () => fakeProvider(calls));
    const req = calls[0].request as unknown as Record<string, unknown>;
    for (const field of ["promptVariantId", "promptFamilyId", "parameterProfileId", "contractHash", "evaluationVersion", "postprocessVersion"]) {
      assert.ok(!(field in req), `请求不得携带 ${field}`);
    }
  });

  await ok("防御：非法 operationMode 回退 generate（零系统文本）", async () => {
    const calls: CapturedCall[] = [];
    await executeStep(imageStep({
      modelId: "gpt-image-2.5-flare-vip",
      operationMode: "hacked-mode",
      inputTexts: ["正文"],
    }), [], () => fakeProvider(calls));
    assert.equal(calls[0].request.prompt, "正文");
    assert.equal(calls[0].request.operationMode, "generate");
  });

  console.log(`\n${passed} 通过`);
}

main();
