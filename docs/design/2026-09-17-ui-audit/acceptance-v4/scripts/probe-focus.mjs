// 聚焦指示器 delta 探针：对每个主题测量「聚焦前 / 聚焦后」的边框、阴影、outline 变化，
// 并对缩略图槽与 chip 提示词板截取像素级证据（供 Python 计算与背景的对比度）。
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROBES } from "./probes.mjs";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const require = createRequire(join(REPO, "package.json"));
const { chromium } = require("playwright");
const sharp = require("sharp");

const WEB = "http://127.0.0.1:5411";
const OUT = "/tmp/gc-uiqa-v4";
const SHOTS = join(OUT, "shots");
mkdirSync(SHOTS, { recursive: true });

const THEMES = [
  { id: "current", label: "曜黑·荧光绿" },
  { id: "white", label: "简白" },
  { id: "eye", label: "护眼绿" },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  storageState: join(OUT, "auth.json"),
  locale: "zh-CN",
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage();
page.setDefaultTimeout(25_000);
await page.addInitScript(PROBES);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.keyboard.press("Escape");

// 打开图案风格迁移项目
await page.getByRole("button", { name: "打开项目中心" }).click();
const center = page.getByRole("dialog", { name: "项目中心" });
await center.waitFor({ state: "visible" });
const projectButtons = center.locator("button").filter({ hasText: "未修改项目名称" });
console.log("pattern project cards:", await projectButtons.count());
await projectButtons.first().click();
await page.waitForTimeout(2500);
await page.keyboard.press("Escape");
await page.waitForTimeout(500);

const DELTA_PROBE = `(sel) => {
  const el = document.querySelector(sel);
  if (!el) return { error: 'missing ' + sel };
  const focusable = el.matches('input,textarea,button,select') ? el : el.querySelector('input,textarea,button,select') || el;
  const snap = () => {
    const s = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      borderTopColor: s.borderTopColor, borderLeftColor: s.borderLeftColor,
      borderTopWidth: s.borderTopWidth, borderLeftWidth: s.borderLeftWidth,
      boxShadow: s.boxShadow, outline: s.outline, outlineColor: s.outlineColor,
      backgroundColor: s.backgroundColor,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      cls: typeof el.className === 'string' ? el.className : '',
    };
  };
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const before = snap();
  focusable.focus({ preventScroll: true });
  const after = snap();
  return { before, after, focusableTag: focusable.tagName, focused: document.activeElement === focusable, focusVisible: focusable.matches(':focus-visible') };
}`;

const TARGETS = [
  { name: "thumbSlot", sel: ".gc-node-card .aspect-\\[4\\/3\\]" },
  { name: "assetPickerButton", sel: ".gc-node-card button:not([disabled])" },
  { name: "promptChipTextarea", sel: ".gc-node-card textarea" },
  { name: "runButton", sel: ".gc-node-card button[class*='bg-gold']" },
  { name: "modelSelect", sel: ".gc-node-card select" },
];

const results = { errors, deltas: [], clips: [] };
for (const theme of THEMES) {
  const trigger = page.getByRole("button", { name: /^切换主题，当前为/ });
  await trigger.click();
  await page.getByRole("menuitemradio", { name: new RegExp("^" + theme.label) }).click();
  await page.waitForTimeout(600);
  const tokens = await page.evaluate(() => window.__gcTheme());
  for (const target of TARGETS) {
    const delta = await page.evaluate(new Function(`return (${DELTA_PROBE})(${JSON.stringify(target.sel)})`));
    results.deltas.push({ theme: theme.id, target: target.name, tokens: tokens.accent, ...delta });
    if ((target.name === "thumbSlot" || target.name === "promptChipTextarea") && delta.after) {
      const r = delta.after.rect;
      const clip = {
        x: Math.max(0, Math.floor(r.x - 8)),
        y: Math.max(0, Math.floor(r.y - 8)),
        width: Math.min(1280 - Math.max(0, Math.floor(r.x - 8)), Math.ceil(r.width + 16)),
        height: Math.min(720 - Math.max(0, Math.floor(r.y - 8)), Math.ceil(r.height + 16)),
      };
      const path = join(SHOTS, `focus-${target.name}-${theme.id}-1280.png`);
      await page.screenshot({ path, clip });
      results.clips.push({ theme: theme.id, target: target.name, path, clip, after: delta.after });
    }
  }
}

// 缩略图槽填充态（真实上传动作）——在默认主题下取证
await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
await page.getByRole("menuitemradio", { name: /^曜黑/ }).click();
await page.waitForTimeout(500);
const buf = await sharp({
  create: { width: 360, height: 270, channels: 3, background: { r: 120, g: 96, b: 70 } },
})
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="270"><circle cx="180" cy="110" r="72" fill="#d9c7b0"/><rect x="24" y="220" width="312" height="26" fill="#4a3f34"/></svg>`,
      ),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toBuffer();
const uploadBtn = page.locator('[data-testid^="rf__node-pattern"]').getByRole("button", { name: "上传图片" });
console.log("upload buttons:", await uploadBtn.count());
if (await uploadBtn.count()) {
  const chooser = page.waitForEvent("filechooser");
  await uploadBtn.first().click();
  const fc = await chooser;
  await fc.setFiles({ name: "uiqa-pattern.png", mimeType: "image/png", buffer: buf });
  await page.waitForTimeout(2500);
  results.uploadedImageVisible = await page.evaluate(() => document.querySelectorAll(".gc-node-card img").length);
  await page.screenshot({ path: join(SHOTS, "slot-filled-current-1280.png") });
  results.filledSlotDelta = await page.evaluate(new Function(`return (${DELTA_PROBE})(".gc-node-card img")`));
}
await page.screenshot({ path: join(SHOTS, "pattern-canvas-filled-current-1280.png") });

writeFileSync(join(OUT, "results-focus.json"), JSON.stringify(results, null, 2));
console.log("wrote results-focus.json; errors:", errors.length);
await context.close();
await browser.close();
