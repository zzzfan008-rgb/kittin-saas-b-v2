// R-51 P1-3 焦点环「带宽」取证：在元素左/上边缘外侧取 4px × 60px 条带，
// 报告最深像素（最接近纯环色）与其对比度，以及达到 ≥3:1 的像素占比。声明色对比度单独列出。
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire("/Users/lionfan/dev/kittin-saas-b-v2/package.json");
const sharp = require("sharp");
const MEAS = "/tmp/gc-uiqa-r51/measurements";
const SHOTS = "/tmp/gc-uiqa-r51/shots";
const data = JSON.parse(readFileSync(join(MEAS, "p1-3-focus.json"), "utf8"));

const srgb = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a, b) => Number((((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05))).toFixed(2));
const parseRgb = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); return m ? m[1].split(/[,/\s]+/).filter(Boolean).map(Number).slice(0, 3) : null; };
const parseShadowRing = (s) => {
  const m = String(s).match(/rgb\([^)]+\)\s+0px\s+0px\s+0px\s+(\d+)px/);
  if (!m) return null;
  return { color: parseRgb(String(s).match(/rgb\([^)]+\)/)[0]), width: Number(m[1]) };
};

const out = {};
for (const theme of ["current", "white", "eye"]) {
  const targets = data.pattern.themes[theme].targets;
  out[theme] = {};
  for (const name of ["thumbSlot", "promptChipTextarea", "modelSelect"]) {
    const t = targets.find((x) => x.name === name);
    if (!t) continue;
    const rec = { declaredFocusShadow: t.after.boxShadow, declaredBlurShadow: t.before.boxShadow, borderFocus: t.after.borderTopColor, borderBlur: t.before.borderTopColor };
    const ring = parseShadowRing(t.after.boxShadow);
    rec.declaredRing = ring ? { color: ring.color, widthPx: ring.width } : null;
    const files = { focus: join(SHOTS, `p1-3-focus-${name}-${theme}-1280.png`), blur: join(SHOTS, `p1-3-blur-${name}-${theme}-1280.png`) };
    for (const [kind, path] of Object.entries(files)) {
      const { data: buf, info } = await sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const at = (x, y) => { const i = (y * info.width + x) * 3; return [buf[i], buf[i + 1], buf[i + 2]]; };
      const ex0 = Math.round(t.after.rect.x - t.clip.x);
      const ey0 = Math.round(t.after.rect.y - t.clip.y);
      const band = [];
      // 左侧 4px 条带 × 元素中部 60px 高
      for (let dx = -4; dx <= -1; dx += 1) {
        for (let dy = Math.round(t.after.rect.height / 2) - 30; dy <= Math.round(t.after.rect.height / 2) + 30; dy += 3) {
          const x = ex0 + dx;
          const y = ey0 + dy;
          if (x < 0 || y < 0 || x >= info.width || y >= info.height) continue;
          band.push(at(x, y));
        }
      }
      // 参考底色：元素内部 2px 处的众数色
      const innerCounts = new Map();
      for (let dy = Math.round(t.after.rect.height / 2) - 30; dy <= Math.round(t.after.rect.height / 2) + 30; dy += 3) {
        const y = ey0 + dy;
        if (y < 0 || y >= info.height) continue;
        const px = at(Math.min(info.width - 1, ex0 + 6), y);
        innerCounts.set(px.join(","), (innerCounts.get(px.join(",")) || 0) + 1);
      }
      const innerPx = [...innerCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0].split(",").map(Number) ?? null;
      const darkest = band.slice().sort((a, b) => lum(a) - lum(b))[0];
      rec[kind] = {
        bandLum: { min: darkest, minContrastVsInner: innerPx ? contrast(darkest, innerPx) : null },
        innerRef: innerPx,
        pixelsAtOrAbove3: band.filter((p) => innerPx && contrast(p, innerPx) >= 3).length,
        bandN: band.length,
        meanPx: band.length ? band.reduce((acc, p) => [acc[0] + p[0] / band.length, acc[1] + p[1] / band.length, acc[2] + p[2] / band.length], [0, 0, 0]).map((v) => Math.round(v)) : null,
      };
    }
    if (rec.declaredRing && rec.focus?.innerRef) rec.declaredRingContrastVsInner = contrast(rec.declaredRing.color, rec.focus.innerRef);
    out[theme][name] = rec;
  }
}
writeFileSync(join(MEAS, "p1-3-ring-band.json"), JSON.stringify(out, null, 2));
for (const theme of Object.keys(out)) {
  for (const [name, rec] of Object.entries(out[theme])) {
    console.log(`${theme}/${name}: declaredRing=${JSON.stringify(rec.declaredRing)} 声明环对比度(vs 元素内底色 ${JSON.stringify(rec.focus?.innerRef)})=${rec.declaredRingContrastVsInner}:1`);
    console.log(`    focus 条带: 最深像素=${JSON.stringify(rec.focus?.bandLum.min)} 对比度=${rec.focus?.bandLum.minContrastVsInner}:1 ; ≥3:1 像素 ${rec.focus?.pixelsAtOrAbove3}/${rec.focus?.bandN} ; 均值=${JSON.stringify(rec.focus?.meanPx)}`);
    console.log(`    blur  条带: 最深像素=${JSON.stringify(rec.blur?.bandLum.min)} 对比度=${rec.blur?.bandLum.minContrastVsInner}:1 ; ≥3:1 像素 ${rec.blur?.pixelsAtOrAbove3}/${rec.blur?.bandN} ; 均值=${JSON.stringify(rec.blur?.meanPx)}`);
    console.log(`    border: blur=${rec.borderBlur} focus=${rec.borderFocus}`);
  }
}
