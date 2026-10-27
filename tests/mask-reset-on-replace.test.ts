/**
 * 换底图必须清蒙版三字段（源码断言，无 DOM）。
 *
 * 背景：mask / maskSourceRef / featherRadius 存在图片节点 data 上，mask 是服务端
 * mask-draft 文件 URL，maskSourceRef 绑定"当时那张底图"。换底图（上传 / 裁剪 /
 * 抠图 / 多轮修改 / 资产库选素材）后若不清，dag.ts 的
 * `mask does not match its current source image` 会让下一次运行直接抛 DagError。
 *
 * 2026-10-22 实测缺口：资产库（AssetPickerOverlay）写回时只清了
 * outputImages/status/error，漏了蒙版三字段，成了唯一不清的入口。
 *
 * 运行：node node_modules/tsx/dist/cli.mjs tests/mask-reset-on-replace.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const imageNodeSource = readFileSync("src/components/nodes/ImageNode.tsx", "utf8");
const assetPickerSource = readFileSync("src/components/AssetPickerOverlay.tsx", "utf8");

/** 取源码里某个 writeback 块（从标记起到下一个 `});` 结束）。 */
function blockAfter(source: string, marker: string, length = 700): string {
  const index = source.indexOf(marker);
  assert.ok(index >= 0, `未找到写回块标记：${marker}`);
  return source.slice(index, index + length);
}

const MASK_FIELDS = ["mask: undefined", "maskSourceRef: undefined", "featherRadius: undefined"];

console.log("换底图清蒙版契约");

// ---------- 1. 资产库写回：新增的缺口点 ----------
const assetLibBlock = blockAfter(assetPickerSource, "if (request.target && request.nodeId) {");
for (const field of MASK_FIELDS) {
  assert.ok(
    assetLibBlock.includes(field),
    `资产库写回未清理 ${field}——换底图后旧蒙版会让 dag 抛 mask does not match its current source image`,
  );
}
assert.match(
  assetLibBlock,
  /outputImages: \[asset\.image\]/,
  "资产库写回必须覆盖 outputImages（上传位语义）",
);
console.log("  ✓ 资产库写回同时清 outputImages 与蒙版三字段");

// ---------- 2. ImageNode 既有四个换底图入口保持清理 ----------
const imageNodeEntries: Array<[string, string]> = [
  ["本地上传（handleFile）", "outputImages: [upload.url]"],
  ["裁剪完成", "outputImages: [croppedUrl]"],
];
for (const [label, marker] of imageNodeEntries) {
  const block = blockAfter(imageNodeSource, marker);
  for (const field of MASK_FIELDS) {
    assert.ok(block.includes(field), `${label}：未清理 ${field}`);
  }
}
console.log("  ✓ ImageNode 上传 / 裁剪 入口清蒙版");

// ---------- 3. 蒙版本身必须落在服务端文件上，不是内存 ----------
// 若哪天改成纯内存（data URL 存节点），下面的清理语义就要重设计，所以锁死这个前提。
assert.match(
  imageNodeSource,
  /mask: url, maskSourceRef: sourceRef, featherRadius/,
  "蒙版必须写入服务端返回的 url（mask-draft 文件），不得存 data URL",
);
assert.match(
  imageNodeSource,
  /saveMaskDraft\(\s*\{\s*dataUrl: mask,/,
  "蒙版绘制结果必须经 /api/files/mask 上传，不得只留在内存",
);
console.log("  ✓ 蒙版存服务端文件 URL（mask-draft），非内存");

// ---------- 4. dag 的 fail-closed 判据仍在校验 maskSourceRef ----------
const dagSource = readFileSync("server/engine/dag.ts", "utf8");
assert.match(
  dagSource,
  /maskSourceRef !== step\.inputImages\[0\]/,
  "dag 必须继续校验 maskSourceRef 与当前底图一致（这正是清蒙版的理由）",
);
console.log("  ✓ dag 继续 fail-closed 校验 maskSourceRef");

console.log("换底图清蒙版契约全部通过");
