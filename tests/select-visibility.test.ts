import assert from "node:assert/strict";
import fs from "node:fs";

// Phase 0（64 重构先行项）：Select 通用组件可见性硬化契约。
// 缺陷成因链：SelectValue 无显式文字色 + cn()/tailwind-merge 把调用方传入的 text-label
// （@theme --text-* 字号 token）误判进 text-color 组、静默剥离 SelectTrigger 基类的
// text-foreground → 回显文字继承 .gc-node-card 强制的 --gc-node-text（深色主题下 #1d1d1f
// 白卡墨色）打在深色触发器底（--gc-shell #1a1c22）上 → 深底深字不可见。
// 以下契约反向锁定修复：回显必须自带前景色，不依赖继承链。
const selectSource = fs.readFileSync(
  new URL("../src/components/ui/select.tsx", import.meta.url),
  "utf8",
);
const panelSource = fs.readFileSync(
  new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
  "utf8",
);

// 1) 回显必须自带前景色（治真凶）；占位态走 muted，不与回显色冲突。
assert.match(selectSource, /function SelectValue[\s\S]{0,400}?text-foreground/);
assert.match(selectSource, /data-placeholder:text-muted-foreground/);
// 2) 触发器基类仍声明 text-foreground（调用方不得靠它，但删除即回归继承依赖）。
assert.match(selectSource, /function SelectTrigger[\s\S]{0,900}?text-foreground/);
// 3) 选中态有独立视觉（data-selected），不再只靠 data-highlighted。
assert.match(selectSource, /data-selected:bg-accent/);
assert.match(selectSource, /data-selected:text-accent-foreground/);
// 4) 弹层宽度兜底 8rem（不随窄触发器塌缩裁剪），且不再用 overflow-hidden 裁剪
//    —— 滚动职责交给 SelectList 的 overflow-y-auto。
assert.match(selectSource, /min-w-\[max\(8rem,var\(--anchor-width\)\)\]/);
assert.doesNotMatch(selectSource, /overflow-hidden/);
// 5) OptionSelect 空 label 防御：回显与选项行都回退到 value，绝不渲染空白。
// 65b 变量名变更：option → opt / o（参数全下拉后语义更精确）
assert.match(panelSource, /opt\?\.label \|\| opt\?\.value/);
assert.match(panelSource, /o\.label \|\| o\.value \|\| "—"/);

// 6) 可访问名稳定性（a11y 回归护栏）：弹层内的分组标题必须用 SelectGroupLabel，
//    绝不能用 SelectLabel。base-ui 的 Select.Label 语义是「自动关联到 trigger 的
//    可访问名」——它会把 root.labelId 指向自己，trigger 因此拿到 aria-labelledby
//    （优先级高于 aria-label），可访问名从「模型」漂移成厂商分组名（OPENAI）。
//    该漂移只在弹层首次挂载后出现（交互后才注册 labelId），vis06 三主题循环第二轮起
//    才失效即此因。锁形状 fail-closed，防有人改回 SelectLabel。
assert.match(selectSource, /function SelectGroupLabel[\s\S]{0,300}?SelectPrimitive\.GroupLabel/);
assert.match(selectSource, /\b SelectGroupLabel,|  SelectGroupLabel,/);
assert.match(panelSource, /<SelectGroupLabel/);
assert.doesNotMatch(panelSource, /<SelectLabel/, "弹层分组标题不得用 SelectLabel（会劫持 trigger 可访问名）");

console.log("Select 可见性硬化契约测试通过");
