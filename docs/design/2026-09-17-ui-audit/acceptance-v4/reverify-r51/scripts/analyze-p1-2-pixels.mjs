// R-51 P1-2 像素级复核：从启用态 CTA 截图中采样按钮底色像素，并计算前后景对比度（WCAG 相对亮度）。
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire("/Users/lionfan/dev/kittin-saas-b-v2/package.json");
const sharp = require("sharp");

const MEAS = "/tmp/gc-uiqa-r51/measurements";
const data = JSON.parse(readFileSync(join(MEAS, "p1-2-bg-gold.json"), "utf8"));

const srgb = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a, b) => {
  const l1 = lum(a);
  const l2 = lum(b);
  return Number((((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05))).toFixed(2));
};
const parseRgb = (s) => {
  const m = String(s).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
  return parts.slice(0, 3);
};

const report = { sampled: {}, declared: {}, auditRows: {} };

for (const theme of ["current", "white", "eye"]) {
  const t = data.themes[theme];
  const shot = t.shot;
  const { clip } = t;
  const btn = t.button;
  const raw = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { info } = raw;
  // 按钮中心（clip 坐标系）
  const cx = Math.round((btn.rect.x - clip.x) + btn.rect.width / 2);
  const cy = Math.round((btn.rect.y - clip.y) + btn.rect.height / 2);
  const at = (x, y) => {
    const i = (y * info.width + x) * 3;
    return [raw.data[i], raw.data[i + 1], raw.data[i + 2]];
  };
  // 多点采样取众数，避开文字笔画
  const counts = new Map();
  for (let dx = -40; dx <= 40; dx += 2) {
    for (let dy = -8; dy <= 8; dy += 2) {
      const x = Math.min(info.width - 1, Math.max(0, cx + dx));
      const y = Math.min(info.height - 1, Math.max(0, cy + dy));
      const key = at(x, y).join(",");
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0].split(",").map(Number);
  const declaredBg = parseRgb(btn.bg);
  const declaredFg = parseRgb(btn.color);
  const nodeBgSample = at(Math.round(cx - (btn.rect.width / 2) + 6), Math.round(cy - btn.rect.height / 2 - 10));
  report.sampled[theme] = {
    clip,
    shot,
    buttonCenterPx: [cx, cy],
    dominantPixel: dominant,
    dominantShare: `${sorted[0][1]}/${[...counts.values()].reduce((a, b) => a + b, 0)}`,
    top3: sorted.slice(0, 3).map(([k, v]) => ({ px: k.split(",").map(Number), n: v })),
    nodeBackgroundSample: nodeBgSample,
    contrastDominantVsNodeBg: contrast(dominant, nodeBgSample),
  };
  report.declared[theme] = {
    accent: t.accent,
    declaredBg: btn.bg,
    declaredFg: btn.color,
    disabled: btn.disabled,
    opacity: btn.opacity,
    computedContrastBgVsFg: declaredBg && declaredFg ? contrast(declaredBg, declaredFg) : null,
    sampledContrastVsFg: declaredFg ? contrast(dominant, declaredFg) : null,
  };
  report.auditRows[theme] = t.goldAudit.rows.map((r) => ({
    goldClasses: r.goldClasses.join(" "),
    testid: r.testid,
    text: r.text,
    bg: r.backgroundColor,
    color: r.color,
    borderTop: r.borderTopColor,
    borderLeft: r.borderLeftColor,
    borderLeftWidth: r.borderLeftWidth,
    opacity: r.opacity,
    rect: r.rect,
  }));
}

writeFileSync(join(MEAS, "p1-2-analysis.json"), JSON.stringify(report, null, 2));
for (const theme of ["current", "white", "eye"]) {
  console.log(theme, JSON.stringify(report.sampled[theme].dominantPixel), "declared", report.declared[theme].declaredBg, "ctr(bg,f g)", report.declared[theme].computedContrastBgVsFg, "sampled ctr", report.declared[theme].sampledContrastVsFg);
}
console.log("\naudit rows:");
for (const theme of ["current", "white", "eye"]) {
  console.log(`-- ${theme}`);
  for (const r of report.auditRows[theme]) console.log("   ", JSON.stringify(r));
}
