// R-51 P1-3 补证：主题 token 变量实测、填充态缩略图槽（重新上传）focus-within 环、
// 「从素材库选择」按钮焦点态、firstInput 身份、FabricRecolor hex 输入是否存在。
import { join } from "node:path";
import { BASE, THEMES, nodeRequire, SHOTS, write, login, dismissTutorial, switchTheme, closeDock, clipFor, openFreshProject } from "./lib.mjs";

const { chromium } = nodeRequire("playwright");
const sharp = nodeRequire("sharp");

const VARS = "() => { const s = getComputedStyle(document.documentElement); const r = (n) => s.getPropertyValue(n).trim(); return { dataTheme: document.documentElement.dataset.theme ?? null, accent: r('--gc-accent'), accentDeep: r('--gc-accent-deep'), nodeAccent: r('--gc-node-accent'), nodeInner: r('--gc-node-inner'), nodeBorder: r('--gc-node-border'), nodeText: r('--gc-node-text'), colorGold: r('--color-gold') }; }";

const DELTA = `(sel, idx) => {
  const list = [...document.querySelectorAll(sel)];
  const el = list[idx ?? 0];
  if (!el) return { missing: sel };
  const focusable = el.matches("input,textarea,button,select") ? el : el.querySelector("input,textarea,button,select") || el;
  const snap = () => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { borderTopColor: s.borderTopColor, borderLeftColor: s.borderLeftColor, boxShadow: s.boxShadow, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor, backgroundColor: s.backgroundColor, rect: { x: r.x, y: r.y, width: r.width, height: r.height } };
  };
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const before = snap();
  focusable.focus({ preventScroll: true });
  const after = snap();
  const changed = Object.keys(before).filter((k) => k !== "rect" && JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  return { tag: el.tagName, cls: String(el.className).slice(0, 160), focusableTag: focusable.tagName, focusableType: focusable.getAttribute("type"), focusablePlaceholder: focusable.getAttribute("placeholder"), focusableAria: focusable.getAttribute("aria-label"), focusableOpacity: getComputedStyle(focusable).opacity, focusableSize: (() => { const b = focusable.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; })(), nodeOwner: el.closest(".react-flow__node")?.getAttribute("data-testid") ?? null, focusVisible: focusable.matches(":focus-visible"), before, after, changed };
}`;

const out = { url: BASE, phases: {} };

async function phase({ label, projectMatcher, upload }) {
  const { statePath, api } = await login();
  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState: statePath, locale: "zh-CN", viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25_000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.keyboard.press("Escape");
  await dismissTutorial(page);
  const templateHits = await openFreshProject(page, projectMatcher);
  await page.getByRole("button", { name: "适应画布" }).click();
  await page.waitForTimeout(800);

  const result = { vars: {}, targets: {}, identity: {}, errors, templateHits };
  result.identity = await page.evaluate(() => ({
    hasHexInput: document.querySelectorAll('input[placeholder="#RRGGBB"]').length,
    inputs: [...document.querySelectorAll(".gc-node-card input")].map((el) => ({
      type: el.getAttribute("type"), placeholder: el.getAttribute("placeholder"), aria: el.getAttribute("aria-label"), cls: String(el.className).slice(0, 80),
      size: (() => { const b = el.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; })(),
      visibility: getComputedStyle(el).visibility, opacity: getComputedStyle(el).opacity, display: getComputedStyle(el).display, node: el.closest(".react-flow__node")?.getAttribute("data-testid") ?? null,
    })),
    assetButtons: [...document.querySelectorAll("button")].filter((b) => /素材库/.test(b.textContent || "")).map((b) => ({ text: b.textContent.trim().slice(0, 20), cls: String(b.className).slice(0, 120), node: b.closest(".react-flow__node")?.getAttribute("data-testid") ?? null })),
  }));

  if (upload) {
    const fileInput = page.locator('.gc-node-card .aspect-\\[4\\/3\\] input[type=file]').first();
    const buf = await sharp({ create: { width: 360, height: 270, channels: 3, background: { r: 120, g: 96, b: 70 } } }).png().toBuffer();
    await fileInput.setInputFiles({ name: "uiqa-r51.png", mimeType: "image/png", buffer: buf });
    await page.waitForTimeout(2500);
    result.identity.uploaded = await page.evaluate(() => document.querySelectorAll(".gc-node-card img").length);
    await page.getByRole("button", { name: "适应画布" }).click();
    await page.waitForTimeout(700);
  }

  for (const theme of THEMES) {
    await switchTheme(page, theme);
    await page.waitForTimeout(400);
    result.vars[theme.id] = await page.evaluate(new Function(`return (${VARS})()`));
    const targets = {};
    for (const [name, sel] of [
      ["slot", ".gc-node-card .aspect-\\[4\\/3\\]"],
      ["reupload", ".gc-node-card input[type=file]"],
      ["assetPicker", ".gc-node-card button"],
      ["hexInput", '.gc-node-card input[placeholder="#RRGGBB"]'],
    ]) {
      const delta = await page.evaluate(new Function(`return (${DELTA})(${JSON.stringify(sel)})`));
      if (delta.missing) { targets[name] = { missing: true }; continue; }
      // 焦点态祖先环（focus-within 效果）
      const ancestorRing = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const chain = [];
        let cur = el;
        for (let i = 0; i < 4 && cur; i += 1) {
          const cs = getComputedStyle(cur);
          if (cs.boxShadow && cs.boxShadow !== "none") chain.push({ cls: String(cur.className).slice(0, 90), boxShadow: cs.boxShadow.slice(0, 120) });
          cur = cur.parentElement;
        }
        return chain;
      }, sel);
      const rect = delta.after?.rect;
      if (rect && rect.width > 0) {
        const clip = clipFor(rect, 1280, 720, 8);
        const shot = join(SHOTS, `p1-3b-focus-${label}-${name}-${theme.id}.png`);
        await page.screenshot({ path: shot, clip });
        delta.shot = shot;
        delta.clip = clip;
      }
      targets[name] = { ...delta, ancestorRing };
      console.log(`[${label}/${theme.id}] ${name} changed=[${delta.changed?.join("|")}] focusable=${delta.focusableTag}/${delta.focusableType} owner=${delta.nodeOwner} size=${JSON.stringify(delta.focusableSize)} shadowAfter=${String(delta.after?.boxShadow).slice(0, 70)}`);
      if (ancestorRing?.length) console.log(`      ancestorRing: ${JSON.stringify(ancestorRing).slice(0, 220)}`);
    }
    result.targets[theme.id] = targets;
    console.log(`   vars: ${JSON.stringify(result.vars[theme.id])}`);
  }
  out.phases[label] = result;
  await api.dispose();
  await context.close();
  await browser.close();
}

await phase({ label: "pattern", projectMatcher: "未修改项目名称", upload: true });
await phase({ label: "text", projectMatcher: "文生图", upload: false });
write("p1-3b-focus.json", out);
console.log("errors:", JSON.stringify(Object.fromEntries(Object.entries(out.phases).map(([k, v]) => [k, v.errors.length]))));
