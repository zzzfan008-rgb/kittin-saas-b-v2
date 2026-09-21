import assert from "node:assert/strict";
import fs from "node:fs";

// v8（plan.md §3.3）：功能目录 / 参数配置由 v7 悬浮窗口（NodeInspectorWindowPortal，已退役）
// 迁到生成节点内的内联面板 GeneratorParamsPanel。
const panelSource = fs.readFileSync(
  new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
  "utf8",
);

// 提示词变体选择仍是「直接绑定」：选中即写 promptVariantId，不再有 pending 确认态；
// 撤销/下线由 variantRevoked 拦截运行。
assert.match(panelSource, /const selectedVariant[\s\S]{0,80}data\.promptVariantId/);
assert.doesNotMatch(panelSource, /pendingVariant/);
assert.match(panelSource, /variantRevoked/);
assert.match(panelSource, /promptVariantId: variant\.variantId/);
// 内联面板没有对话框，但「阻塞原因」必须走可访问的告警语义 + 参数 warning 走 role=status。
assert.match(panelSource, /role="alert"/);
assert.match(panelSource, /role="status"/);
assert.match(panelSource, /aria-label="模型参数"/);
// 运行闸门仍由准入判定决定（不允许 UI 自己放行）。
assert.match(panelSource, /admission\.allowed \? undefined : admission\.reason/);
assert.match(panelSource, /imageModelOptionsWarnings\(/);
assert.match(panelSource, /videoModelOptionsWarnings\(/);

console.log("提示词变体选择 UI 契约测试通过");
