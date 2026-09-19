import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  PROVIDER_PROMPT_RENDERER_CONTRACT,
  PROVIDER_PROMPT_RENDERER_HASH,
  PROVIDER_PROMPT_RENDERER_VERSION,
  providerPromptRendererHashMaterial,
  renderProviderPrompt,
} from "../src/lib/providerPromptRenderer";
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
    modelId: "gpt-image-2.5-flare-vip",
    operationMode: "edit",
    taskPrompt: "换装",
    references: [{}, {}, {}],
  });
  assert.match(promptA, /参考图:参考图1、参考图2、参考图3/);
  assert.equal(
    promptA,
    "换装\n参考图:参考图1、参考图2、参考图3",
    "gpt-image-2.5-flare-vip edit 3 张参考图渲染结果",
  );
}

{
  const promptB = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gpt-image-2.5-flare-vip",
    operationMode: "edit",
    taskPrompt: "换装",
    references: [{}, {}],
  });
  assert.match(promptB, /参考图:参考图1、参考图2/);
  assert.equal(
    promptB,
    "换装\n参考图:参考图1、参考图2",
    "gpt-image-2.5-flare-vip edit 2 张参考图渲染结果",
  );
}

// ---- 提示词实例对照（方案 §5.2）：改后不再逐图写角色/职责/禁止影响 ----
{
  const rendered = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gpt-image-2.5-flare-vip",
    operationMode: "edit",
    taskPrompt: "换装",
    references: [{}, {}, {}],
  });
  assert.equal(
    rendered,
    "换装\n参考图:参考图1、参考图2、参考图3",
    "改后 gpt-image-2.5-flare-vip edit 3 张参考图提示词实例",
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

// ---- renderer 版本与 hash ----
assert.equal(
  PROVIDER_PROMPT_RENDERER_HASH,
  `sha256:${createHash("sha256").update(providerPromptRendererHashMaterial()).digest("hex")}`,
  "renderer 语义合同变化时必须同步更新发布 hash",
);
assert.equal(PROVIDER_PROMPT_RENDERER_VERSION, "provider-prompt-renderer-v4");
assert.notEqual(
  PROVIDER_PROMPT_RENDERER_HASH,
  "sha256:cb1e87e905b6ac26b41182f9f790d4325a924d0447bdbdd31b684a51f8f6b0b4",
  "角色语义移除后 v3 hash 必须失效",
);

const rendererHashMaterial = JSON.parse(providerPromptRendererHashMaterial()) as {
  referenceListIntro: Record<string, Record<string, string>>;
};
assert.deepEqual(
  Object.fromEntries(Object.entries(rendererHashMaterial.referenceListIntro).map(([modelId, intros]) => (
    [modelId, Object.keys(intros)]
  ))),
  {
    "gpt-image-2.5-sunburst": ["mask-edit"],
    "gpt-image-2.5-all": ["generate", "edit"],
    "gpt-image-2.5-sunburst-vip": ["generate", "edit"],
    "gpt-image-2.5-flare-vip": ["generate", "edit"],
    "gemini-3-pro-image-preview": ["generate", "edit"],
    "gemini-3.1-flash-lite-image": ["generate", "edit"],
    "gemini-3.1-flash-image": ["generate", "edit"],
    "flux-2-pro": ["generate", "edit"],
    "seedream-5-0-260128": ["generate", "edit"],
  },
  "发布 hash material 必须覆盖全部模型的显式合法模式 intro",
);

// ---- 空提示词必须抛错 ----
for (const [modelId, operationMode] of [
  ["gpt-image-2.5-sunburst", "mask-edit"],
  ["gpt-image-2.5-flare-vip", "generate"],
  ["gpt-image-2.5-flare-vip", "edit"],
  ["gemini-3.1-flash-image", "generate"],
  ["gemini-3.1-flash-image", "edit"],
  ["flux-2-pro", "generate"],
  ["flux-2-pro", "edit"],
  ["seedream-5-0-260128", "generate"],
  ["seedream-5-0-260128", "edit"],
] as const satisfies readonly [ImageModelId, ImageOperationMode][]) {
  // v7：needsMask 声明驱动蒙版错误文案；kind 统一为三值。
  const needsMask = operationMode === "mask-edit";
  assert.throws(
    () => renderProviderPrompt({
      nodeKind: "image",
      needsMask,
      modelId,
      operationMode,
      taskPrompt: " \n ",
      references: [],
    }),
    needsMask
      ? /局部修改必须填写修改说明/
      : /节点 image 没有可发送的提示词/,
    `${modelId}/${operationMode} 不得从空任务提示词静默回退到跨模型默认文案`,
  );
}

console.log("结构化参考图与 Provider 适配测试通过");
