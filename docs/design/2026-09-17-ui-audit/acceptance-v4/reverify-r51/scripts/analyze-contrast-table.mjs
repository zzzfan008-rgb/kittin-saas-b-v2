// R-51 对比度总表：全部颜色取自本卡实测 JSON（声明值/像素值），不手算。
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MEAS = "/tmp/gc-uiqa-r51/measurements";
const read = (f) => JSON.parse(readFileSync(join(MEAS, f), "utf8"));
const bg = read("p1-2-bg-gold.json");
const vars = read("p1-3b-focus.json").phases.pattern.vars;
const band = read("p1-3-ring-band.json");

const hex = (h) => {
  const s = h.replace("#", "");
  const v = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
};
const rgb = (s) => {
  const m = String(s).match(/rgba?\(([^)]+)\)/);
  return m ? m[1].split(/[,/\s]+/).filter(Boolean).map(Number).slice(0, 3) : null;
};
const mix = (a, b, t) => a.map((v, i) => Math.round(v * t + b[i] * (1 - t)));
const srgb = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ctr = (a, b) => Number(((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)).toFixed(2));

const WHITE = [255, 255, 255];
const rows = [];
for (const theme of ["current", "white", "eye"]) {
  const v = vars[theme];
  const nodeInner = hex(v.nodeInner);
  const cta = bg.themes[theme].button;
  const ring = band[theme].thumbSlot.declaredRing.color;
  const bandDarkestFocus = band[theme].thumbSlot.focus.bandLum.min;
  const bandDarkestBlur = band[theme].thumbSlot.blur.bandLum.min;
  rows.push({
    theme,
    accent: v.accent,
    accentDeep: v.accentDeep,
    nodeAccent: v.nodeAccent,
    nodeInner: v.nodeInner,
    ctaDeclaredBg: cta.bg,
    ctaDeclaredFg: cta.color,
    ctaContrast: ctr(rgb(cta.bg), rgb(cta.color)),
    ctaDisabledOpacity: cta.opacity,
    ringDeclaredPx: band[theme].thumbSlot.declaredRing.widthPx,
    ringDeclaredColor: `rgb(${ring.join(",")})`,
    ringVsNodeInner: ctr(ring, nodeInner),
    ringVsWhite: ctr(ring, WHITE),
    ringRenderedBandDarkest: `rgb(${bandDarkestFocus.join(",")})`,
    ringRenderedBandContrastVsWhite: ctr(bandDarkestFocus, WHITE),
    slotBlurBandDarkest: `rgb(${bandDarkestBlur.join(",")})`,
    slotBlurBandContrastVsWhite: ctr(bandDarkestBlur, WHITE),
    fieldFocusBorderVsNodeInner: ctr(ring, nodeInner),
    chipLeftBarAccentVsNodeInner: ctr(hex(v.nodeAccent), nodeInner),
    chipLeftBarAccentVsWhite: ctr(hex(v.nodeAccent), WHITE),
  });
}
// 对照：R-46 旧环 ring-gold/60 = #B7F35A@60% 叠白底
const oldRing = mix(hex("#B7F35A"), WHITE, 0.6);
const reference = {
  oldRingPx: `rgb(${oldRing.join(",")})`,
  oldRingVsWhite: ctr(oldRing, WHITE),
  oldRingVsNodeInnerCurrent: ctr(oldRing, hex(vars.current.nodeInner)),
  newRingVsWhite: ctr(hex(vars.current.accentDeep), WHITE),
};
const out = { generatedFrom: "p1-2-bg-gold.json / p1-3b-focus.json / p1-3-ring-band.json", rows, reference };
writeFileSync(join(MEAS, "contrast-table.json"), JSON.stringify(out, null, 2));
for (const r of rows) console.log(JSON.stringify(r));
console.log("reference:", JSON.stringify(reference));
