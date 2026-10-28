import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { renderProviderPrompt } from "../src/lib/providerPromptRenderer";
import {
  referenceInputIssues,
  referenceDataUrls,
  referenceInputsError,
  referenceInputsTransportError,
} from "../src/lib/referenceInputs";
import type { ImageOperationMode, ImageGenRequest } from "../src/types/workflow";
import type { ImageModelId } from "../src/types/imageModels";

const PNG_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const resolved = {
  dataUrl: PNG_DATA_URL,
  order: 0,
  assetSha256: createHash("sha256").update(Buffer.from(PNG_DATA_URL.split(",")[1], "base64")).digest("hex"),
  sourceNodeId: "top",
};

const request: ImageGenRequest = {
  prompt: "换装",
  operationMode: "edit",
  references: [resolved],
  referenceImages: [PNG_DATA_URL],
};
assert.equal(referenceInputsError(request), undefined);
assert.deepEqual(referenceDataUrls(request), [PNG_DATA_URL]);
assert.deepEqual(referenceInputIssues(request.references ?? []), []);
assert.match(
  referenceInputsError({ ...request, referenceImages: ["data:image/png;base64,AAAA"] }) ?? "",
  /same ordered images/,
);

assert.deepEqual(referenceInputIssues([
  { order: 0, sourceNodeId: "identity" },
  { order: 1, sourceNodeId: "top" },
  { order: 2, sourceNodeId: "bottom" },
]), []);

const malformedIssues = referenceInputIssues([
  { order: 1, sourceNodeId: "first" },
  { order: 0, sourceNodeId: "second" },
]);
assert.deepEqual(malformedIssues, [
  {
    code: "reference-structure-invalid",
    field: "order",
    order: 0,
    sourceNodeId: "first",
    reason: "references[0].order must be a safe integer equal to 0",
  },
  {
    code: "reference-structure-invalid",
    field: "order",
    order: 1,
    sourceNodeId: "second",
    reason: "references[1].order must be a safe integer equal to 1",
  },
]);
assert.deepEqual(referenceInputIssues({}), [{
  code: "reference-structure-invalid",
  field: "references",
  order: 0,
  reason: "references must be an array",
}]);
assert.deepEqual(referenceInputIssues([null]), [{
  code: "reference-structure-invalid",
  field: "reference",
  order: 0,
  reason: "references[0] must be an object",
}]);
assert.equal(
  referenceInputsTransportError({ ...request, references: {} as never }),
  "references must be an array",
);
assert.equal(
  referenceInputsTransportError({ ...request, references: [null] as never }),
  "references[0] must be an object",
);
assert.equal(
  referenceInputsTransportError({ ...request, referenceImages: "abc" as never }),
  "referenceImages must be an array",
);
assert.match(
  referenceInputsError({
    ...request,
    references: [{ ...resolved, order: 1 }],
  }) ?? "",
  /references\[0\]\.order/,
  "Provider 契约不得通过排序掩盖数组位置与 order 分叉",
);

// ---- 顺序语义回归（方案 §6.3）：references 数组顺序变化 → 渲染提示词图号同步变化 ----
{
  const promptA = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gpt-image-2.5-flare",
    operationMode: "edit",
    taskPrompt: "换装",
    references: [{}, {}, {}],
  });
  assert.match(promptA, /参考图:参考图1、参考图2、参考图3/);
  assert.equal(
    promptA,
    "换装\n参考图:参考图1、参考图2、参考图3",
    "gpt-image-2.5-flare edit 3 张参考图渲染结果",
  );
}

{
  const promptB = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gpt-image-2.5-flare",
    operationMode: "edit",
    taskPrompt: "换装",
    references: [{}, {}],
  });
  assert.match(promptB, /参考图:参考图1、参考图2/);
  assert.equal(
    promptB,
    "换装\n参考图:参考图1、参考图2",
    "gpt-image-2.5-flare edit 2 张参考图渲染结果",
  );
}

// ---- 提示词实例对照（方案 §5.2）：改后不再逐图写角色/职责/禁止影响 ----
{
  const rendered = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gpt-image-2.5-flare",
    operationMode: "edit",
    taskPrompt: "换装",
    references: [{}, {}, {}],
  });
  assert.equal(
    rendered,
    "换装\n参考图:参考图1、参考图2、参考图3",
    "改后 gpt-image-2.5-flare edit 3 张参考图提示词实例",
  );
  assert.ok(!rendered.includes("职责"), "改后提示词不得包含职责");
  assert.ok(!rendered.includes("禁止影响"), "改后提示词不得包含禁止影响");
  assert.ok(!rendered.includes("garment_full"), "改后提示词不得包含角色 ID");
}

// ---- 蒙版渲染（v7：needsMask 声明驱动，不再按 nodeKind 判定） ----
const renderedMaskPrompt = renderProviderPrompt({
  nodeKind: "image",
  needsMask: true,
  modelId: "gpt-image-2.5-sunburst",
  operationMode: "mask-edit",
  taskPrompt: "将袖口改成银色拉链",
  references: [{}],
});
assert.match(renderedMaskPrompt, /^目标修改：将袖口改成银色拉链。/);
assert.match(renderedMaskPrompt, /最后一张参考图（参考图2）是区域引导图/);
assert.match(renderedMaskPrompt, /局部修改参考图:参考图1/);

// ---- 引导语只取决于模式，与模型无关（2026-10-28 简化后行为锁定）----
{
  const models = [
    "gpt-image-2.5-sunburst",
    "gpt-image-2.5-flare",
    "gemini-nano-banana-2.1",
    "gemini-3.1-flash-image",
    "flux-3-image",
    "doubao-seedream-5-0-pro-260628",
    "doubao-seedream-5-0-lite-260128",
    "qwen-image-3.0-pro",
    "qwen-image-3.0",
  ] as const;
  const modes = ["generate", "edit"] as const;
  for (const modelId of models) {
    for (const operationMode of modes) {
      const rendered = renderProviderPrompt({
        nodeKind: "image",
        modelId,
        operationMode,
        taskPrompt: "换装",
        references: [{}, {}],
      });
      assert.equal(
        rendered,
        "换装\n参考图:参考图1、参考图2",
        `${modelId}/${operationMode} 必须渲染同一引导语，不得出现"不支持"假故障`,
      );
    }
  }
  const maskRendered = renderProviderPrompt({
    nodeKind: "mask-redraw",
    modelId: "gpt-image-2.5-sunburst",
    operationMode: "mask-edit",
    taskPrompt: "改成红色",
    references: [{}],
    needsMask: true,
  });
  assert.match(maskRendered, /局部修改参考图:参考图1/);
}
