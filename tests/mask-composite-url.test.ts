/**
 * 蒙版重绘 / 多轮修改的「provider 直链」回归（用户 2026-10-28，生成ID sG4DsK4SkA）。
 *
 * 病史：gpt-image-2.5-sunburst 等模型返回的不是 dataURL，而是 CDN 直链
 * （sydney-ai / 阿里 OSS）。`compositeMaskedEdit` 只接受严格 dataURL，
 * 把 URL 直接传进去会抛 `invalid image dataURL (strict base64 required)`，
 * 于是蒙版重绘与多轮修改全部失败（库里 17:09 / 17:31 两条即此）。
 *
 * 修复：runner 在合成前先 `normalizeImageRef`（URL → 下载 → dataURL）。
 * 本测试锁住这条接线，防止后人再把 URL 直接喂给合成函数。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (rel: string) => readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), "utf8");

console.log("蒙版合成前的直链归一化");

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const runner = read("server/engine/runner.ts");
const maskProcessing = read("server/lib/maskProcessing.ts");

ok("runner 在 compositeMaskedEdit 之前对 provider 产物调用 normalizeImageRef", () => {
  const anchor = runner.indexOf("compositeMaskedEdit(referenceImages[0], mask!");
  assert.ok(anchor > 0, "找不到蒙版合成调用点");
  // 同一处调用必须带着 await normalizeImageRef(...)
  const call = runner.slice(anchor, anchor + 220);
  assert.match(
    call,
    /await normalizeImageRef\(image\)/,
    "provider 产物可能是 URL，合成前必须 normalizeImageRef，否则蒙版重绘必失败",
  );
});

ok("compositeMaskedEdit 仍只接受 dataURL（约束不变，故上游必须归一化）", () => {
  const fnStart = maskProcessing.indexOf("export async function compositeMaskedEdit");
  assert.ok(fnStart > 0, "找不到 compositeMaskedEdit");
  const fn = maskProcessing.slice(fnStart, fnStart + 900);
  assert.match(fn, /validateImageDataUrl\(generatedDataUrl\)/, "合成入口必须继续做严格 dataURL 校验");
});

ok("normalizeImageRef 覆盖 data: / /api/files/ / http(s) 三种来源", () => {
  const store = read("server/lib/fileStore.ts");
  const fnStart = store.indexOf("export async function normalizeImageRef");
  assert.ok(fnStart > 0);
  const fn = store.slice(fnStart, fnStart + 700);
  assert.match(fn, /ref\.startsWith\("data:"\)/);
  assert.match(fn, /ref\.startsWith\("\/api\/files\/"\)/);
  assert.match(fn, /ref\.startsWith\("http:\/\/"\)/);
});

console.log(`通过 ${passed} 项`);
