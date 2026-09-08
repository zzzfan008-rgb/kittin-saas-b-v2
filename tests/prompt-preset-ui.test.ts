import assert from "node:assert/strict";
import fs from "node:fs";

const inspectorSource = fs.readFileSync(
  new URL("../src/components/panels/InspectorPanel.tsx", import.meta.url),
  "utf8",
);
const maskNodeSource = fs.readFileSync(
  new URL("../src/components/nodes/MaskRedrawNode.tsx", import.meta.url),
  "utf8",
);

assert.match(inspectorSource, /const contextKey = JSON\.stringify\(\{/);
assert.match(inspectorSource, /pending\?\.contextKey === contextKey \? pending : null/);
assert.match(inspectorSource, /pending && pending\.contextKey !== contextKey/);
assert.match(inspectorSource, /提示词变体/);
assert.match(inspectorSource, /参数档案/);
assert.match(inspectorSource, /提示词预览/);
assert.match(inspectorSource, /aria-live="polite"/);
assert.match(inspectorSource, /aria-describedby=\{reason \? reasonId : undefined\}/);

assert.match(maskNodeSource, /!presetAvailability\.enabled \|\| running \|\| readOnly/);
assert.match(maskNodeSource, /setPresetPending\(false\)/);
assert.match(maskNodeSource, /aria-describedby=\{!presetAvailability\.enabled/);
assert.match(maskNodeSource, /提示词变体/);
assert.match(maskNodeSource, /参数档案/);
assert.match(maskNodeSource, /提示词预览/);
assert.match(maskNodeSource, /aria-live="polite"/);

console.log("提示词预设确认 UI 契约测试通过");
