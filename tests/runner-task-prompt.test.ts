/**
 * runner taskPrompt 组装回归测试（64 Phase 1 C3/C6，纯逻辑 + 注入 fake provider，不调真实 API/DB）。
 * 覆盖（architect 验收标准）：
 * - generate = 纯用户文本零系统文本（裁决 E；系统文本为空串 = 裸 API 零回归）
 * - mask-edit = 冻结系统文本 + 用户文本（裁决 E：操作协议文本与协议强制一体）
 * - edit = 用户文本 + 参考图列表（image.edit 系统文本为空，编辑协议文本随预设模板进正文）
 * - 裸 API 回归：params.prompt 直发
 * - C6：Provider 请求不携带 variant 绑定字段
 * - 提示词改写集成（runner 自动改写 §1.4 + §7-3）
 * 运行：node node_modules/tsx/dist/cli.mjs tests/runner-task-prompt.test.ts
 */
import assert from "node:assert/strict";
import sharp from "sharp";
import type { AIProvider, ImageGenRequest, ImageGenResult, NodeExecution } from "../src/types/workflow";
import { executeStep } from "../server/engine/runner";

// 改写集成：executeStep 的 rewriteDeps.chatCompletion 注入 mock。
// 绕过了 undici dispatcher + fetch 层，直接 mock chatCompletion 结果。
let rewriteCallCount = 0;

function mockChatCompletion(rewrittenText: string) {
  rewriteCallCount = 0;
  return {
    chatCompletion: async () => {
      rewriteCallCount += 1;
      return {
        content: rewrittenText,
        finishReason: "stop",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };
    },
  };
}

function mockChatCompletionError() {
  rewriteCallCount = 0;
  return {
    chatCompletion: async () => {
      rewriteCallCount += 1;
      throw new Error("channel unavailable");
    },
  };
}

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

  // ===== 提示词改写集成（runner 自动改写 §1.4 + §7-3）=====

  await ok("改写集成：familyId=model-tryon + 非空 prompt → taskPrompt 含改写文本", async () => {
    const calls: CapturedCall[] = [];
    const deps = mockChatCompletion("简洁商业白色连衣裙正面展示");
    await executeStep(
      imageStep({
        modelId: "gpt-image-2.5-flare-vip",
        inputTexts: ["白色连衣裙"],
        familyId: "model-tryon",
      }),
      [],
      () => fakeProvider(calls),
      { rewriteDeps: deps },
    );
    assert.equal(calls.length, 1, "应发出 provider 请求");
    assert.ok(
      calls[0].request.prompt.includes("简洁商业白色连衣裙正面展示"),
      `taskPrompt 应含改写文本，实际: ${calls[0].request.prompt.slice(0, 80)}`,
    );
    assert.equal(rewriteCallCount, 1, "每 run 最多 1 次改写调用");
  });

  await ok("改写集成：familyId 缺失（undefined）→ 不调用通道，原文进 taskPrompt", async () => {
    const calls: CapturedCall[] = [];
    const deps = mockChatCompletion("should-not-be-called");
    await executeStep(
      imageStep({
        modelId: "gpt-image-2.5-flare-vip",
        inputTexts: ["一件白色连衣裙"],
        // 无 familyId
      }),
      [],
      () => fakeProvider(calls),
      { rewriteDeps: deps },
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].request.prompt, "一件白色连衣裙", "familyId 缺失时应用原文");
    assert.equal(rewriteCallCount, 0, "familyId 缺失不应调用改写通道");
  });

  await ok("改写集成：familyId 非 model-tryon（不在白名单）→ 不调用通道", async () => {
    const calls: CapturedCall[] = [];
    const deps = mockChatCompletion("should-not-be-called");
    await executeStep(
      imageStep({
        modelId: "gpt-image-2.5-flare-vip",
        inputTexts: ["电商主图"],
        familyId: "fashion-lookbook",
      }),
      [],
      () => fakeProvider(calls),
      { rewriteDeps: deps },
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].request.prompt, "电商主图");
    assert.equal(rewriteCallCount, 0, "非白名单 familyId 不应调用改写通道");
  });

  await ok("改写集成：非空 prompt 但 familyId 缺失 → 不调用改写通道", async () => {
    // 原文通过 mock 验证 rewriteCallCount === 0；runner API 本身要求 non-empty prompt（空时报"节点 image 没有可发送的提示词"）。
    const calls: CapturedCall[] = [];
    const deps = mockChatCompletion("should-not-be-called");
    await executeStep(
      imageStep({
        modelId: "gpt-image-2.5-flare-vip",
        inputTexts: ["一件白色连衣裙"], // 非空 prompt
        // 无 familyId
      }),
      [],
      () => fakeProvider(calls),
      { rewriteDeps: deps },
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].request.prompt, "一件白色连衣裙");
    assert.equal(rewriteCallCount, 0, "familyId 缺失不应调用改写通道");
  });

  await ok("改写集成：通道抛错（reject）→ 降级用原文，不阻断 provider", async () => {
    const originalText = "一件白色连衣裙";
    const deps = mockChatCompletionError();
    const calls: CapturedCall[] = [];
    await executeStep(
      imageStep({
        modelId: "gpt-image-2.5-flare-vip",
        inputTexts: [originalText],
        familyId: "model-tryon",
      }),
      [],
      () => fakeProvider(calls),
      { rewriteDeps: deps },
    );
    assert.equal(calls.length, 1, "provider 仍应被调用");
    assert.equal(calls[0].request.prompt, originalText, "通道 5xx 时用原文降级");
  });

  await ok("改写集成：operationMode=edit 时同样生效", async () => {
    const calls: CapturedCall[] = [];
    // mock 输出必须 ≥ 输入长度×0.8（textRewriter 截断防线，P1），故用等长扩写文本。
    const deps = mockChatCompletion("把这件衣服穿到模特身上，柔和室内光线");
    await executeStep(
      imageStep({
        modelId: "gpt-image-2.5-flare-vip",
        operationMode: "edit",
        inputTexts: ["把这件衣服穿到模特身上"],
        familyId: "model-tryon",
      }, [PNG_DATA_URL]),
      [PNG_DATA_URL],
      () => fakeProvider(calls),
      { rewriteDeps: deps },
    );
    assert.equal(calls.length, 1);
    assert.ok(
      calls[0].request.prompt.includes("把这件衣服穿到模特身上，柔和室内光线"),
      `edit 模式改写后 taskPrompt: ${calls[0].request.prompt.slice(0, 80)}`,
    );
    assert.equal(rewriteCallCount, 1);
  });

  console.log(`\n${passed} 通过`);
}

main();
