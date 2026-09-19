// R-51 补证：把左侧「节点库」「属性 / 结果」面板打开到可见态，审计带修饰 gold 类（P3-3 渲染验证）。
import { join } from "node:path";
import { BASE, THEMES, nodeRequire, SHOTS, write, login, dismissTutorial, switchTheme, openFreshProject, clipFor } from "./lib.mjs";

const { chromium } = nodeRequire("playwright");

const AUDIT = `() => {
  const rows = [];
  for (const el of document.querySelectorAll("body *")) {
    const cls = typeof el.className === "string" ? el.className : "";
    const m = cls.match(/(?:(?:hover|focus|group-hover|active):)?(?:bg|border|border-l|text|ring)-gold(?:\\/\\d+)?/g);
    if (!m) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const s = getComputedStyle(el);
    rows.push({ goldClasses: [...new Set(m)], tag: el.tagName, text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 20), bg: s.backgroundColor, color: s.color, borderTop: s.borderTopColor, borderLeft: s.borderLeftColor, borderLeftWidth: s.borderLeftWidth, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], opacity: s.opacity, visible: r.x + r.width > 0 && r.y + r.height > 0 && r.x < window.innerWidth && r.y < window.innerHeight });
  }
  const aside = document.querySelector('aside[aria-label="工作台左侧面板"]');
  return { accent: getComputedStyle(document.documentElement).getPropertyValue("--gc-accent").trim(), colorGold: getComputedStyle(document.documentElement).getPropertyValue("--color-gold").trim(), dockWidth: aside ? Math.round(aside.getBoundingClientRect().width) : 0, rows };
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
out.templateHits = await openFreshProject(page, "文生图（服装设计）");
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(800);

for (const theme of THEMES) {
  await switchTheme(page, theme);
  await page.waitForTimeout(500);
  const lib = page.getByRole("button", { name: "节点库" });
  await lib.first().click();
  await page.waitForTimeout(900);
  const withLib = await page.evaluate(new Function(`return (${AUDIT})()`));
  await page.screenshot({ path: join(SHOTS, `extra-nodelib-open-${theme.id}-1280.png`) });
  // 悬停面板里的第一个 chip，取 hover 态
  const chips = page.locator('aside[aria-label="工作台左侧面板"] button');
  let hoverInfo = null;
  const chipCount = await chips.count();
  if (chipCount > 1) {
    await chips.nth(1).hover().catch(() => {});
    await page.waitForTimeout(400);
    hoverInfo = await page.evaluate(new Function(`return (${AUDIT})()`));
  }
  await lib.first().click(); // 关闭节点库
  await page.waitForTimeout(600);
  const ctx = page.getByRole("button", { name: "属性 / 结果" });
  await ctx.first().click();
  await page.waitForTimeout(900);
  const withCtx = await page.evaluate(new Function(`return (${AUDIT})()`));
  await page.screenshot({ path: join(SHOTS, `extra-context-open-${theme.id}-1280.png`) });
  await ctx.first().click();
  await page.waitForTimeout(600);
  out.themes[theme.id] = { withLib: { ...withLib, rows: withLib.rows.filter((r) => r.visible) }, withCtx: { ...withCtx, rows: withCtx.rows.filter((r) => r.visible) }, hoverInfo: hoverInfo ? { ...hoverInfo, rows: hoverInfo.rows.filter((r) => r.visible) } : null, chipCount };
  const fmt = (a) => a.rows.map((r) => `${r.goldClasses.join("+")} [${r.tag}] "${r.text}" bg=${r.bg} color=${r.color} bl=${r.borderLeft}(${r.borderLeftWidth}) rect=${r.rect.join(",")}`).join(" ;; ");
  console.log(`\n== ${theme.id} accent=${withLib.accent} colorGold=${withLib.colorGold} dockW=${withLib.dockWidth}/${withCtx.dockWidth} chips=${chipCount}`);
  console.log("  节点库(可见):", fmt(withLib).slice(0, 1200));
  console.log("  属性/结果(可见):", fmt(withCtx).slice(0, 1200));
  console.log("  hover:", hoverInfo ? fmt(hoverInfo).slice(0, 900) : "n/a");
}
write("extra-panels-gold.json", out);
await api.dispose();
await context.close();
await browser.close();
console.log("errors:", out.errors.length);
