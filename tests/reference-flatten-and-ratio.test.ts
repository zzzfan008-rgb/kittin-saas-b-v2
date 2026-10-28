/**
 * 参考图 alpha 压平 + 画幅参数真实生效（用户 2026-10-28 拍板）。
 *
 * 两件事都来自"参数/提示词必须真实生效"这条要求：
 *  1. 透明 PNG 当参考图会带进预乘 alpha 与幽灵 RGB → 压到白底；
 *  2. 面板切画幅对 gpt-image 两兄弟原本**完全无效**（契约默认 size 把画幅锁死），
 *     这里锁住"切画幅 = 保留档位、重算尺寸"的行为。
 */
import assert from "node:assert/strict";
import sharp from "sharp";

const { flattenReferenceAlpha } = await import("../server/lib/referenceFlatten");
const { imageModelOptionsForAspectRatio, defaultImageModelOptions, resolutionModelOptions } = await import(
  "../src/types/imageModels"
);

console.log("参考图压平 + 画幅参数");

let passed = 0;
async function ok(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

async function pngWithAlpha(): Promise<string> {
  const buffer = await sharp({
    create: { width: 8, height: 8, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function opaquePng(): Promise<string> {
  const buffer = await sharp({
    create: { width: 8, height: 8, channels: 3, background: { r: 10, g: 120, b: 200 } },
  }).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

await ok("透明 PNG → 压成白底 JPEG，且不再带 alpha", async () => {
  const flattened = await flattenReferenceAlpha(await pngWithAlpha());
  assert.match(flattened, /^data:image\/jpeg;base64,/);
  const buffer = Buffer.from(flattened.split(",")[1], "base64");
  const metadata = await sharp(buffer).metadata();
  assert.equal(metadata.hasAlpha, false, "压平后不得再有 alpha 通道");
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.channels, 3);
  assert.deepEqual([data[0], data[1], data[2]], [255, 255, 255], "透明区域必须变成白底");
});

await ok("不透明图原样返回（不重复编码、不改变引用）", async () => {
  const original = await opaquePng();
  assert.equal(await flattenReferenceAlpha(original), original);
});

await ok("远程 URL 与非法输入原样返回（本步骤绝不阻断参考图）", async () => {
  assert.equal(await flattenReferenceAlpha("https://cdn.example/a.png"), "https://cdn.example/a.png");
  assert.equal(await flattenReferenceAlpha("not-a-data-url"), "not-a-data-url");
  assert.equal(await flattenReferenceAlpha("data:image/png;base64,@@@"), "data:image/png;base64,@@@");
});

// ---------- 画幅参数：切画幅必须真的改 size，且保留分辨率档位 ----------

await ok("gpt-image：切画幅真的改 size（原来完全无效）", () => {
  const base = { ...defaultImageModelOptions("gpt-image-2.5-flare", "1:1"), quality: "low" };
  const wide = imageModelOptionsForAspectRatio("gpt-image-2.5-flare", base, "16:9");
  assert.equal(wide.size, "2048x1152", "16:9 必须换成 2048x1152");
  const square = imageModelOptionsForAspectRatio("gpt-image-2.5-flare", wide, "1:1");
  assert.equal(square.size, "2048x2048", "切回 1:1 必须是 2048x2048");
});

await ok("gpt-image：档位跟着画幅走，不被画幅切回默认档", () => {
  const oneK = { ...resolutionModelOptions("gpt-image-2.5-flare", "1K", "1:1") };
  assert.equal(oneK.size, "1024x1024");
  const wide = imageModelOptionsForAspectRatio("gpt-image-2.5-flare", oneK, "16:9");
  assert.equal(wide.size, "1024x576", "1K 档切 16:9 仍是 1K 长边");
});

await ok("qwen：画幅换算是 宽*高 格式（上游只认星号）", () => {
  const wide = imageModelOptionsForAspectRatio("qwen-image-3.0-pro", { size: "2048*2048" }, "16:9");
  assert.equal(wide.size, "2048*1152");
});

await ok("seedream：同样按档位重算", () => {
  const base = defaultImageModelOptions("doubao-seedream-5-0-pro-260628", "1:1");
  const wide = imageModelOptionsForAspectRatio("doubao-seedream-5-0-pro-260628", base, "16:9");
  assert.equal(wide.size, "2048x1152");
});

await ok("gemini / flux：仍走自家字段（画幅不落到 size）", () => {
  const gemini = imageModelOptionsForAspectRatio("gemini-3.1-flash-image", { imageSize: "2K" }, "16:9");
  assert.equal(gemini.aspectRatio, "16:9");
  assert.equal(gemini.size, undefined);
  const flux = imageModelOptionsForAspectRatio("flux-3-image", { resolution: "2k" }, "16:9");
  assert.equal(flux.aspect_ratio, "16:9");
  assert.equal(flux.size, undefined);
});

console.log(`通过 ${passed} 项`);
