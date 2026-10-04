import assert from "node:assert/strict";
import fs from "node:fs";

// v9（64 Phase 2）：功能目录迁出，生成节点面板参数自治（裁决 C）。
const panelSource = fs.readFileSync(
  new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
  "utf8",
);
const toolbarSource = fs.readFileSync(
  new URL("../src/components/nodes/NodeToolbar.tsx", import.meta.url),
  "utf8",
);
const textNodeSource = fs.readFileSync(
  new URL("../src/components/nodes/TextNode.tsx", import.meta.url),
  "utf8",
);

console.log("v9 生成面板 + 工具条 + 文本节点预设 UI 契约测试");

// -- 面板：删功能行，增操作下拉 --
assert.doesNotMatch(panelSource, /data\.promptVariantId/);
assert.doesNotMatch(panelSource, /applyVariant/);
assert.doesNotMatch(panelSource, /focusGeneratorFunctionControl/);
// 65b：操作模式由接线自动推断（不再有独立下拉）
assert.match(panelSource, /自动推断.*operationMode|inferredMode|已接参考图|未接参考图/);
assert.match(panelSource, /operationMode/);
assert.match(panelSource, /operationMode/);
// 65b：操作由接线自动推断（已无独立下拉 + 无兼容提示）
assert.match(panelSource, /operationMode/);
assert.match(panelSource, /自动推断.*operationMode|inferredMode|已接参考图|未接参考图/);
assert.match(panelSource, /admission\.allowed/);
assert.match(panelSource, /imageModelOptionsWarnings\(/);
assert.match(panelSource, /videoModelOptionsWarnings\(/);
// 模型参数区 aria-label 保留。
assert.match(panelSource, /aria-label="模型参数"/);
// §5.2 1a：text-label → text-[11px]（twMerge 挤掉 text-foreground 元凶处置）。
assert.match(panelSource, /text-\[11px\]/);
// 字段口径：批次（替换数量）。
assert.match(panelSource, /label="批次"/);
assert.doesNotMatch(panelSource, /label="数量"/);

// -- 工具条：无 function-picker，有 preset-picker --
assert.doesNotMatch(toolbarSource, /function-picker/);
assert.match(toolbarSource, /preset-picker/);
assert.match(toolbarSource, /提示词预设/);

// -- 文本节点：预设下拉接线（替换写入） --
assert.match(textNodeSource, /listTextPresetTemplates/);
assert.match(textNodeSource, /getTextPresetTemplate/);
assert.match(textNodeSource, /updateValue\(preset\.text\)/);
assert.match(textNodeSource, /textEdit\.flush\(\)/);

console.log("v9 提示词预设 UI 契约测试通过");