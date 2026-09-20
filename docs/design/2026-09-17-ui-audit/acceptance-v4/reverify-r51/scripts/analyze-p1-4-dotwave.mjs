// P1-4 追加核验：画布点阵背景（Canvas 2D 绘制，DOM 计算样式看不到）是否残留旧金 #c9a66b。
// 方法：全视口截图逐像素找「暖色」像素（r>g>b 且 r-b>=6），统计数量/最深样本，并与画布底色对比。
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire("/Users/lionfan/dev/kittin-saas-b-v2/package.json");
const sharp = require("sharp");
const SHOTS = "/tmp/gc-uiqa-r51/shots";
const MEAS = "/tmp/gc-uiqa-r51/measurements";

const srgb = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ctr = (a, b) => Number(((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)).toFixed(2));

const out = {};
for (const theme of ["current", "white", "eye"]) {
  const path = join(SHOTS, `p1-4-selection-${theme}-1280.png`);
  const { data: buf, info } = await sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => { const i = (y * info.width + x) * 3; return [buf[i], buf[i + 1], buf[i + 2]]; };
  const warm = [];
  const all = new Map();
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const px = at(x, y);
      const key = px.join(",");
      all.set(key, (all.get(key) || 0) + 1);
      const [r, g, b] = px;
      if (r > g && g > b && r - b >= 6 && r - b <= 90 && g - b >= 3) warm.push({ x, y, px });
    }
  }
  const darkest = warm.slice().sort((a, b) => lum(a.px) - lum(b.px))[0] ?? null;
  const brightest = warm.slice().sort((a, b) => lum(b.px) - lum(a.px))[0] ?? null;
  const dominant = [...all.entries()].sort((a, b) => b[1] - a[1])[0];
  const domPx = dominant[0].split(",").map(Number);
  out[theme] = {
    shot: path,
    size: [info.width, info.height],
    dominantCanvasPx: domPx,
    dominantShare: dominant[1],
    warmPixelCount: warm.length,
    warmSamples: warm.slice(0, 6).map((w) => ({ xy: [w.x, w.y], px: w.px })),
    warmColorHistogramTop: (() => {
      const m = new Map();
      for (const w of warm) m.set(w.px.join(","), (m.get(w.px.join(",")) || 0) + 1);
      return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ px: k.split(",").map(Number), n: v, contrastVsCanvasDominant: ctr(k.split(",").map(Number), domPx) }));
    })(),
    darkestWarm: darkest ? { xy: [darkest.x, darkest.y], px: darkest.px, contrastVsCanvasDominant: ctr(darkest.px, domPx) } : null,
    brightestWarm: brightest ? { xy: [brightest.x, brightest.y], px: brightest.px, contrastVsCanvasDominant: ctr(brightest.px, domPx) } : null,
  };
  console.log(`\n== ${theme} canvasDominant=${JSON.stringify(domPx)} (${dominant[1]} px) warmPixels=${warm.length}`);
  console.log("   top warm colors:", JSON.stringify(out[theme].warmColorHistogramTop));
  console.log("   darkestWarm:", JSON.stringify(out[theme].darkestWarm), "brightestWarm:", JSON.stringify(out[theme].brightestWarm));
}
writeFileSync(join(MEAS, "p1-4-dotwave.json"), JSON.stringify(out, null, 2));
