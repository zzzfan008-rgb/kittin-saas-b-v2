import assert from "node:assert/strict";
import fs from "node:fs";

const inspectorSource = fs.readFileSync(
  new URL("../src/components/nodes/NodeInspectorWindowPortal.tsx", import.meta.url),
  "utf8",
);

// 提示词变体选择已从「侧栏预设确认」收敛为悬浮窗口内的直接绑定：选中即写
// promptVariantId，不再有 pending 确认态；撤销/下线由 variantRevoked 拦截运行。
assert.match(inspectorSource, /selectedVariant = data\.promptVariantId/);
assert.match(inspectorSource, /variantRevoked/);
assert.match(inspectorSource, /promptVariantId: variant\.variantId/);
assert.match(inspectorSource, /role="dialog"/);
assert.match(inspectorSource, /aria-live="polite"/);
assert.match(inspectorSource, /!selectedVariant \|\| variantRevoked/);
assert.match(inspectorSource, /imageModelOptionsWarnings\(/);
assert.match(inspectorSource, /textModelOptionsWarnings\(/);

console.log("提示词变体选择 UI 契约测试通过");
