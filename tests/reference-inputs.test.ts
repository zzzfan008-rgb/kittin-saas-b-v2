import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { buildExecutionPlan } from "../server/engine/dag";
import { resolveReferenceInputs } from "../server/engine/runner";
import { referenceRolePrompt } from "../server/lib/referenceRolePrompt";
import {
  PROVIDER_PROMPT_RENDERER_CONTRACT,
  PROVIDER_PROMPT_RENDERER_HASH,
  PROVIDER_PROMPT_RENDERER_VERSION,
  providerPromptRendererHashMaterial,
  renderProviderPrompt,
} from "../src/lib/providerPromptRenderer";
import {
  REFERENCE_ROLE_CATALOG,
  getReferenceRoleDefinition,
} from "../src/lib/referenceRoles";
import {
  referenceInputIssues,
  referenceDataUrls,
  referenceInputsError,
  referenceInputsTransportError,
} from "../src/lib/referenceInputs";
import {
  REFERENCE_ROLE_VALUES,
  normalizeImageInputReferenceRole,
  type ImageOperationMode,
  type ImageGenRequest,
} from "../src/types/workflow";
import type { ImageModelId } from "../src/types/imageModels";

const PNG_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

assert.deepEqual(
  normalizeImageInputReferenceRole("garment", undefined),
  { role: "garment_full", roleNeedsConfirmation: true },
  "旧项目服装角色只能保守映射且必须待确认",
);
assert.deepEqual(
  normalizeImageInputReferenceRole("identity", false),
  { role: "identity", roleNeedsConfirmation: false },
);

const [resolved] = await resolveReferenceInputs([{
  imageRef: PNG_DATA_URL,
  role: "garment_top",
  order: 0,
  sourceNodeId: "top",
  roleNeedsConfirmation: false,
}]);
assert.equal(resolved.role, "garment_top");
assert.equal(
  resolved.assetSha256,
  createHash("sha256").update(Buffer.from(PNG_DATA_URL.split(",")[1], "base64")).digest("hex"),
  "resolved assetSha256 必须由实际解析图片字节生成",
);
assert.equal(resolved.sourceNodeId, "top");
await assert.rejects(
  () => resolveReferenceInputs([{
    imageRef: "/api/files/must-not-be-resolved.png",
    role: "garment_top",
    order: 1,
    sourceNodeId: "bad-order",
    roleNeedsConfirmation: false,
  }]),
  /referenceSources\[0\]\.order must be a safe integer equal to 0/,
  "损坏顺序必须在读取本地图片之前失败关闭，不得按数组下标修复",
);
await assert.rejects(
  () => resolveReferenceInputs([{
    imageRef: "http://127.0.0.1:9/remote-reference.png",
    role: "garment_top",
    order: 0,
    sourceNodeId: "remote-top",
    roleNeedsConfirmation: false,
  }]),
  /远程参考图不能直接用于生成，请先上传或导入后再试/,
  "Worker 必须在任何远程下载尝试之前拒绝未导入的 HTTP(S) 参考图",
);

const request: ImageGenRequest = {
  prompt: "换装",
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
  {
    role: "identity",
    order: 0,
    sourceNodeId: "identity",
    roleNeedsConfirmation: false,
  },
  {
    role: "garment_top",
    order: 1,
    sourceNodeId: "top",
    roleNeedsConfirmation: true,
  },
  {
    role: "garment_bottom",
    order: 2,
    sourceNodeId: "bottom",
  },
]), [
  {
    code: "reference-role-unconfirmed",
    field: "roleNeedsConfirmation",
    order: 1,
    sourceNodeId: "top",
    reason: "roleNeedsConfirmation is not false",
  },
  {
    code: "reference-role-unconfirmed",
    field: "roleNeedsConfirmation",
    order: 2,
    sourceNodeId: "bottom",
    reason: "roleNeedsConfirmation is not false",
  },
], "缺失与 true 确认都必须按输入顺序返回精确条目");

const malformedRoleIssues = referenceInputIssues([
  {
    role: "unsupported-role",
    order: 1,
    sourceNodeId: "first",
    roleNeedsConfirmation: false,
  },
  {
    role: "identity",
    order: 0,
    sourceNodeId: "second",
    roleNeedsConfirmation: false,
  },
]);
assert.deepEqual(malformedRoleIssues, [
  {
    code: "reference-role-invalid",
    field: "order",
    order: 0,
    sourceNodeId: "first",
    reason: "references[0].order must be a safe integer equal to 0",
  },
  {
    code: "reference-role-invalid",
    field: "role",
    order: 0,
    sourceNodeId: "first",
    reason: "references[0].role must be a supported reference role",
  },
  {
    code: "reference-role-invalid",
    field: "order",
    order: 1,
    sourceNodeId: "second",
    reason: "references[1].order must be a safe integer equal to 1",
  },
], "角色与顺序问题必须按权威数组位置稳定排序");
assert.deepEqual(referenceInputIssues({}), [{
  code: "reference-role-invalid",
  field: "references",
  order: 0,
  reason: "references must be an array",
}], "非数组 references 必须变成可定位问题而不是抛出 500");
assert.deepEqual(referenceInputIssues([null]), [{
  code: "reference-role-invalid",
  field: "reference",
  order: 0,
  reason: "references[0] must be an object",
}], "损坏数组条目必须失败关闭");
assert.deepEqual(referenceInputIssues([
  { role: "garment_top", order: 0, roleNeedsConfirmation: false },
  { role: "garment_top", order: 1, roleNeedsConfirmation: false },
]), [], "同一任务的多张图允许共用同一角色");
assert.deepEqual(referenceInputIssues([{
  role: "identity",
  order: 0,
  roleNeedsConfirmation: "false",
}]), [{
  code: "reference-role-invalid",
  field: "roleNeedsConfirmation",
  order: 0,
  reason: "references[0].roleNeedsConfirmation must be a boolean",
}], "字符串 false 是非法证据，不能伪装成已确认或普通待确认");
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

const plan = buildExecutionPlan([
  {
    id: "identity",
    type: "image-input",
    data: {
      kind: "image-input",
      label: "模特",
      status: "success",
      imageUrl: PNG_DATA_URL,
      imageRole: "identity",
      roleNeedsConfirmation: false,
    },
  },
  {
    id: "generate",
    type: "sketch-to-render",
    data: {
      kind: "sketch-to-render",
      label: "效果图",
      status: "idle",
      prompt: "写实穿搭",
      aspectRatio: "3:4",
      batchSize: 1,
      outputImages: [],
      operationMode: "edit",
      operationModeNeedsConfirmation: false,
      modelId: "gemini-3.1-flash-image",
      modelOptions: { aspectRatio: "3:4", imageSize: "2K" },
    },
  },
], [{ id: "edge", source: "identity", target: "generate" }]);
assert.deepEqual(plan.steps[1].inputReferences, [{
  imageRef: PNG_DATA_URL,
  role: "identity",
  roleNeedsConfirmation: false,
  sourceNodeId: "identity",
  order: 0,
}]);

const geminiInstruction = referenceRolePrompt("gemini-3.1-flash-image", "edit", [resolved]);
assert.match(geminiInstruction, /parts/);
assert.match(geminiInstruction, /上装/);
assert.match(geminiInstruction, /职责：仅提供上装/);
assert.match(geminiInstruction, /禁止影响：不得改变人物身份/);

assert.deepEqual(
  REFERENCE_ROLE_CATALOG.map(({ id }) => id),
  [...REFERENCE_ROLE_VALUES],
  "角色目录必须完整、唯一并保持稳定角色 ID 的权威顺序",
);
assert.equal(new Set(REFERENCE_ROLE_CATALOG.map(({ id }) => id)).size, REFERENCE_ROLE_VALUES.length);
for (const definition of REFERENCE_ROLE_CATALOG) {
  assert.ok(definition.label.length > 0);
  assert.ok(definition.responsibility.length > 0);
  assert.ok(definition.forbiddenInfluence.length > 0);
}
assert.equal(getReferenceRoleDefinition("generic").specificity, "supplemental");
assert.ok(
  REFERENCE_ROLE_CATALOG
    .filter(({ id }) => id !== "generic")
    .every(({ specificity }) => specificity === "specific"),
);

const stylingTerms = ["叠穿", "塞衣", "卷边", "开合", "腰线", "穿搭关系"] as const;
for (const role of ["garment_top", "garment_bottom", "garment_full"] as const) {
  const definition = getReferenceRoleDefinition(role);
  for (const term of stylingTerms) {
    assert.ok(
      !definition.responsibility.includes(term),
      `${role} 的权威职责不得与 styling_only 的 ${term} 重叠`,
    );
    assert.ok(
      definition.forbiddenInfluence.includes(term),
      `${role} 必须明确把 ${term} 保留给 styling_only`,
    );
  }
}
const stylingDefinition = getReferenceRoleDefinition("styling_only");
for (const term of stylingTerms) {
  assert.ok(stylingDefinition.responsibility.includes(term));
}
for (const intrinsicTerm of ["版型", "结构", "颜色", "图案", "工艺", "材质"] as const) {
  assert.ok(
    stylingDefinition.forbiddenInfluence.includes(intrinsicTerm),
    `styling_only 不得改写服装本体的 ${intrinsicTerm}`,
  );
}

const supportedRendererPairs: readonly [ImageModelId, ImageOperationMode, RegExp][] = [
  ["gpt-image-2", "mask-edit", /^局部修改参考角色：/],
  ["gpt-image-2-vip", "generate", /^GPT Image 2 VIP 文生图参考职责：/],
  ["gpt-image-2-vip", "edit", /^GPT Image 2 VIP 多图编辑参考职责：/],
  ["gemini-3.1-flash-image", "generate", /^Gemini 文生图输入图片 parts/],
  ["gemini-3.1-flash-image", "edit", /^Gemini 多图编辑输入图片 parts/],
  ["flux-2-pro", "generate", /^FLUX 文生图参考图顺序与职责：/],
  ["flux-2-pro", "edit", /^FLUX 多图编辑参考图顺序与职责：/],
  ["seedream-5-0-260128", "generate", /^Seedream 文生图参考图顺序与职责：/],
  ["seedream-5-0-260128", "edit", /^Seedream 多图编辑参考图顺序与职责：/],
];
for (const [modelId, operationMode, wrapperPattern] of supportedRendererPairs) {
  assert.equal(
    referenceRolePrompt(modelId, operationMode, []),
    "",
    `${modelId}/${operationMode} 必须有显式包装器，即使文生图没有参考图`,
  );

  const renderedBoundary = referenceRolePrompt(modelId, operationMode, [{
    role: "garment_top",
    roleNeedsConfirmation: false,
  }]);
  assert.match(
    renderedBoundary,
    wrapperPattern,
    `${modelId}/${operationMode} 必须使用自己的模型与模式包装器`,
  );
  assert.match(
    renderedBoundary,
    /图1=上装（garment_top）/,
    `${modelId}/${operationMode} 必须保留图号、标签和稳定角色 ID`,
  );
  assert.match(
    renderedBoundary,
    /职责：仅提供上装本体的版型/,
    `${modelId}/${operationMode} 必须渲染角色职责`,
  );
  assert.match(
    renderedBoundary,
    /禁止影响：不得改变人物身份/,
    `${modelId}/${operationMode} 必须渲染跨角色禁止边界`,
  );
}

for (const [modelId, operationMode] of supportedRendererPairs) {
  const nodeKind = operationMode === "mask-edit"
    ? "mask-redraw"
    : operationMode === "generate" ? "sketch-to-render" : "ai-modify";
  assert.throws(
    () => renderProviderPrompt({
      nodeKind,
      modelId,
      operationMode,
      taskPrompt: " \n ",
      references: [],
    }),
    operationMode === "mask-edit"
      ? /局部修改必须填写修改说明/
      : new RegExp(`节点 ${nodeKind} 没有可发送的提示词`),
    `${modelId}/${operationMode} 不得从空任务提示词静默回退到跨模型默认文案`,
  );
}

const unsupportedRendererPairs: readonly [ImageModelId, ImageOperationMode][] = [
  ["gpt-image-2", "generate"],
  ["gpt-image-2", "edit"],
  ["gpt-image-2-vip", "mask-edit"],
  ["gemini-3.1-flash-image", "mask-edit"],
  ["flux-2-pro", "mask-edit"],
  ["seedream-5-0-260128", "mask-edit"],
];
for (const [modelId, operationMode] of unsupportedRendererPairs) {
  assert.throws(
    () => referenceRolePrompt(modelId, operationMode, []),
    new RegExp(`does not support ${modelId}/${operationMode}`),
    `${modelId}/${operationMode} 不得静默回退到其他模型或模式的包装器`,
  );
}

const orderedRolePrompt = referenceRolePrompt("flux-2-pro", "edit", [
  { role: "garment_top", roleNeedsConfirmation: false },
  { role: "styling_only", roleNeedsConfirmation: false },
  { role: "garment_top", roleNeedsConfirmation: false },
  { role: "generic", roleNeedsConfirmation: false },
]);
const orderedMarkers = [
  "图1=上装（garment_top）",
  "图2=穿搭方式（styling_only）",
  "图3=上装（garment_top）",
  "图4=通用补充参考（generic）",
];
let previousMarkerIndex = -1;
for (const marker of orderedMarkers) {
  const markerIndex = orderedRolePrompt.indexOf(marker);
  assert.ok(markerIndex > previousMarkerIndex, `参考图职责必须保持图片数组顺序：${marker}`);
  previousMarkerIndex = markerIndex;
}
assert.match(
  orderedRolePrompt,
  /图2=穿搭方式[\s\S]*禁止影响：不得借用人物身份、面部、发型、肤色、身材、姿势、构图或背景/,
  "styling_only 只能提供穿搭关系，不得借用人物身份或面部",
);
assert.match(
  orderedRolePrompt,
  /图4=通用补充参考[\s\S]*与任何具体角色冲突时，具体角色优先/,
  "generic 只能补充信息，不能覆盖具体角色",
);

assert.equal(
  PROVIDER_PROMPT_RENDERER_HASH,
  `sha256:${createHash("sha256").update(providerPromptRendererHashMaterial()).digest("hex")}`,
  "renderer 语义合同变化时必须同步更新发布 hash",
);
assert.equal(PROVIDER_PROMPT_RENDERER_VERSION, "provider-prompt-renderer-v3");
assert.notEqual(
  PROVIDER_PROMPT_RENDERER_HASH,
  "sha256:0b3564654cdb0a82da37274cc20a4543cc3115be55760d9bf1a7c0dd8a90c314",
  "角色语义隔离与禁止默认提示词回退必须使早期 v3 评估证据自动失效",
);
assert.notEqual(
  PROVIDER_PROMPT_RENDERER_HASH,
  "sha256:55752d940f99f605df9c81673dc7563a706c6219800dd3348e16f174e67398fb",
  "角色目录与显式包装器升级必须使 v2 评估证据自动失效",
);
const rendererHashMaterial = JSON.parse(providerPromptRendererHashMaterial()) as {
  roleCatalog: unknown;
  roleWrappers: Record<string, Record<string, string>>;
};
assert.deepEqual(rendererHashMaterial.roleCatalog, REFERENCE_ROLE_CATALOG);
assert.deepEqual(
  Object.fromEntries(Object.entries(rendererHashMaterial.roleWrappers).map(([modelId, wrappers]) => (
    [modelId, Object.keys(wrappers)]
  ))),
  {
    "gpt-image-2": ["mask-edit"],
    "gpt-image-2-vip": ["generate", "edit"],
    "gemini-3.1-flash-image": ["generate", "edit"],
    "flux-2-pro": ["generate", "edit"],
    "seedream-5-0-260128": ["generate", "edit"],
  },
  "发布 hash material 必须覆盖五模型的全部显式合法模式包装器",
);
const renderedMaskPrompt = renderProviderPrompt({
  nodeKind: "mask-redraw",
  modelId: "gpt-image-2",
  operationMode: "mask-edit",
  taskPrompt: "将袖口改成银色拉链",
  references: [{ role: "garment_full", roleNeedsConfirmation: false }],
});
assert.match(renderedMaskPrompt, /^目标修改：将袖口改成银色拉链。/);
assert.match(renderedMaskPrompt, /最后一张参考图（参考图2）是区域引导图/);
assert.match(renderedMaskPrompt, /局部修改参考角色：图1=整套服装/);

console.log("结构化参考图角色与 Provider 适配测试通过");
