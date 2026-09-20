// R-51 P1-3 补证（精确）：填充态「重新上传」包装器的 focus-within 环（ImageInputNode:190 改动行）。
import { join } from "node:path";
import { BASE, THEMES, nodeRequire, SHOTS, write, login, dismissTutorial, switchTheme, openFreshProject, clipFor } from "./lib.mjs";

const { chromium } = nodeRequire("playwright");
const sharp = nodeRequire("sharp");

const PROBE = `() => {
  const input = [...document.querySelectorAll('.gc-node-card input[type=file]')].find((el) => el.getAttribute('aria-label') === '重新上传图片');
  if (!input) return { missing: '重新上传图片 input' };
  const wrapper = input.parentElement;
  const snap = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return { cls: String(el.className).slice(0, 160), borderTopColor: s.borderTopColor, borderLeftColor: s.borderLeftColor, boxShadow: s.boxShadow, rect: { x: r.x, y: r.y, width: r.width, height: r.height } }; };
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const before = snap(wrapper);
  input.focus({ preventScroll: true });
  const after = snap(wrapper);
  const changed = Object.keys(before).filter((k) => k !== "rect" && JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  return { wrapperTag: wrapper.tagName, before, after, changed, focusVisible: input.matches(":focus-visible") };
}`;

const out = { url: BASE, themes: {}, errors: [] };
const { statePath, api } = await login();
const browser = await chromium.launch();
const context = await browser.newContext({ storageState: statePath, locale: "zh-CN", viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.setDefaultTimeout(25_000);
page.on("pageerror", (e) => out.errors.push(String(e).slice(0, 200)));
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.keyboard.press("Escape");
await dismissTutorial(page);
out.templateHits = await openFreshProject(page, "图案风格迁移");
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(800);

const buf = await sharp({ create: { width: 360, height: 270, channels: 3, background: { r: 120, g: 96, b: 70 } } }).png().toBuffer();
const fileInput = page.locator('.gc-node-card input[type=file]').first();
await fileInput.setInputFiles({ name: "uiqa-r51-reupload.png", mimeType: "image/png", buffer: buf });
await page.waitForTimeout(2500);
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(800);
out.imageCount = await page.evaluate(() => document.querySelectorAll(".gc-node-card img").length);

for (const theme of THEMES) {
  await switchTheme(page, theme);
  await page.waitForTimeout(500);
  const res = await page.evaluate(new Function(`return (${PROBE})()`));
  if (!res.missing && res.after?.rect) {
    const clip = clipFor(res.after.rect, 1280, 720, 10);
    const shot = join(SHOTS, `p1-3c-reupload-${theme.id}-1280.png`);
    await page.screenshot({ path: shot, clip });
    res.shot = shot;
    res.clip = clip;
  }
  out.themes[theme.id] = res;
  console.log(theme.id, "changed=[", res.changed?.join("|"), "] wrapper:", res.wrapperTag);
  console.log("   blur shadow:", res.before?.boxShadow, "| focus shadow:", res.after?.boxShadow);
  console.log("   blur border:", res.before?.borderTopColor, "| focus border:", res.after?.borderTopColor, "| focusVisible:", res.focusVisible);
}
write("p1-3c-reupload.json", out);
await api.dispose();
await context.close();
await browser.close();
console.log("errors:", out.errors.length);
