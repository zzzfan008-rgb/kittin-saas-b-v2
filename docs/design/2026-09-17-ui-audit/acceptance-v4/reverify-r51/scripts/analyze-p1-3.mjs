// R-51 P1-3 分析：从 p1-3-focus.json 提取焦点态 delta 明细 + 从截图采样环/边框像素并算对比度。
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire("/Users/lionfan/dev/kittin-saas-b-v2/package.json");
const sharp = require("sharp");

const MEAS = "/tmp/gc-uiqa-r51/measurements";
const data = JSON.parse(readFileSync(join(MEAS, "p1-3-focus.json"), "utf8"));

const srgb = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a, b) => Number((((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05))).toFixed(2));

async function scanline(shot, clip, rect, axis) {
  const { data: buf, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => { const i = (y * info.width + x) * 3; return [buf[i], buf[i + 1], buf[i + 2]]; };
  // 元素在 clip 坐标系中的边界
  const ex0 = Math.round(rect.x - clip.x);
  const ey0 = Math.round(rect.y - clip.y);
  const ex1 = Math.round(rect.x - clip.x + rect.width);
  const ey1 = Math.round(rect.y - clip.y + rect.height);
  const cy = Math.max(1, Math.min(info.height - 2, Math.round((ey0 + ey1) / 2)));
  const cx = Math.max(1, Math.min(info.width - 2, Math.round((ex0 + ex1) / 2)));
  const out = { size: [info.width, info.height], clip, rectInClip: [ex0, ey0, ex1, ey1] };
  if (axis === "left") {
    const samples = [];
    for (let x = Math.max(0, ex0 - 6); x <= Math.min(info.width - 1, ex0 + 3); x += 1) samples.push({ x, off: x - ex0, px: at(x, cy) });
    out.rowY = cy;
    out.samples = samples;
    // 5px 外侧 = 卡片底；-2/-1 = ring 候选
    out.cardBg = samples.find((s) => s.off === -6)?.px ?? null;
    out.ringPx = samples.filter((s) => s.off < 0).map((s) => s.px);
    out.innerPx = samples.find((s) => s.off === 2)?.px ?? null;
  } else {
    const samples = [];
    for (let y = Math.max(0, ey0 - 6); y <= Math.min(info.height - 1, ey0 + 3); y += 1) samples.push({ y, off: y - ey0, px: at(cx, y) });
    out.colX = cx;
    out.samples = samples;
    out.cardBg = samples.find((s) => s.off === -6)?.px ?? null;
    out.ringPx = samples.filter((s) => s.off < 0).map((s) => s.px);
    out.innerPx = samples.find((s) => s.off === 2)?.px ?? null;
  }
  return out;
}

const report = {};
for (const [phase, phaseData] of Object.entries(data)) {
  if (phase === "url") continue;
  report[phase] = { inventory: phaseData.inventory, themes: {} };
  for (const [theme, entry] of Object.entries(phaseData.themes)) {
    const t = { targets: {} };
    for (const target of entry.targets) {
      const rec = {
        tag: target.tag,
        cls: target.cls,
        focusableTag: target.focusableTag,
        focusVisible: target.focusVisible,
        changed: target.changed,
        before: { borderTopColor: target.before.borderTopColor, borderLeftColor: target.before.borderLeftColor, borderLeftWidth: target.before.borderLeftWidth, boxShadow: target.before.boxShadow, outlineStyle: target.before.outlineStyle, outlineWidth: target.before.outlineWidth, outlineColor: target.before.outlineColor },
        after: { borderTopColor: target.after.borderTopColor, borderLeftColor: target.after.borderLeftColor, borderLeftWidth: target.after.borderLeftWidth, boxShadow: target.after.boxShadow, outlineStyle: target.after.outlineStyle, outlineWidth: target.after.outlineWidth, outlineColor: target.after.outlineColor },
      };
      if (target.afterShot && target.clip) {
        const axis = target.name.startsWith("thumbSlot") ? "left" : "top";
        rec.focusScan = await scanline(target.afterShot, target.clip, target.after.rect, axis);
        rec.blurScan = await scanline(target.beforeShot, target.clip, target.before.rect, axis);
        // 环像素：取最内侧（贴近元素边缘）的采样点，即 off=-1 —— 最先脱离卡片底色的那一列。
        const ringOf = (scan) => (scan.ringPx && scan.ringPx.length ? scan.ringPx[scan.ringPx.length - 1] : null);
        const fRing = ringOf(rec.focusScan);
        const bRing = ringOf(rec.blurScan);
        rec.focusRingPx = fRing;
        rec.blurRingPx = bRing;
        if (fRing) {
          rec.contrastFocusRingVsCard = contrast(fRing, rec.focusScan.cardBg);
          rec.contrastFocusRingVsInner = contrast(fRing, rec.focusScan.innerPx);
        }
        if (bRing) rec.contrastBlurRingVsCard = contrast(bRing, rec.blurScan.cardBg);
        rec.contrastChanged = bRing && fRing ? contrast(bRing, fRing) : null;
      }
      t.targets[target.name] = rec;
    }
    report[phase].themes[theme] = t;
  }
}

writeFileSync(join(MEAS, "p1-3-analysis.json"), JSON.stringify(report, null, 2));

for (const phase of Object.keys(report)) {
  for (const theme of ["current", "white", "eye"]) {
    const t = report[phase]?.themes?.[theme];
    if (!t) continue;
    console.log(`\n===== ${phase} / ${theme} =====`);
    for (const [name, rec] of Object.entries(t.targets)) {
      console.log(` ${name} (${rec.tag}${rec.focusableTag !== rec.tag ? ">" + rec.focusableTag : ""}) changed=[${rec.changed.join("|")}]`);
      console.log(`   cls=${rec.cls.slice(0, 120)}`);
      console.log(`   blurTop=${rec.before.borderTopColor} focusTop=${rec.after.borderTopColor} blurL=${rec.before.borderLeftColor} focusL=${rec.after.borderLeftColor} leftW=${rec.after.borderLeftWidth}`);
      console.log(`   blurShadow=${rec.before.boxShadow.slice(0, 90)}`);
      console.log(`   focusShadow=${rec.after.boxShadow.slice(0, 90)}`);
      console.log(`   outline blur=${rec.before.outlineStyle}/${rec.before.outlineWidth}/${rec.before.outlineColor} focus=${rec.after.outlineStyle}/${rec.after.outlineWidth}/${rec.after.outlineColor}`);
      if (rec.focusScan) {
        console.log(`   scan(focus) cardBg=${JSON.stringify(rec.focusScan.cardBg)} ring=${JSON.stringify(rec.focusScan.ringPx)} inner=${JSON.stringify(rec.focusScan.innerPx)}`);
        console.log(`   ringPx(focus)=${JSON.stringify(rec.focusRingPx)} vs card=${rec.contrastFocusRingVsCard}:1 vs inner=${rec.contrastFocusRingVsInner}:1 ; blurRing=${JSON.stringify(rec.blurRingPx)} vsCard=${rec.contrastBlurRingVsCard}:1 ; blur->focus delta=${rec.contrastChanged}:1`);
      }
    }
  }
}
