// R-51 追加核验：① 画布缩放（解释焦点环渲染像素宽度）② 带修饰 gold 工具类在 white/eye 下的残留。
import { join } from "node:path";
import { BASE, THEMES, nodeRequire, SHOTS, write, login, dismissTutorial, switchTheme, openFreshProject } from "./lib.mjs";

const { chromium } = nodeRequire("playwright");

const ZOOM = `() => {
  const vp = document.querySelector(".react-flow__viewport");
  const el = document.querySelector(".react-flow__node");
  const r = el ? el.getBoundingClientRect() : null;
  return {
    viewportTransform: vp ? getComputedStyle(vp).transform : null,
    inlineTransform: vp ? vp.style.transform : null,
    nodeRect: r ? [Math.round(r.width), Math.round(r.height)] : null,
    nodeInline: el ? { w: el.style.width, h: el.style.height } : null,
  };
}`;

const AUDIT = `() => {
  const rows = [];
  for (const el of document.querySelectorAll("body *")) {
    const cls = typeof el.className === "string" ? el.className : "";
    const m = cls.match(/(?:(?:hover|focus|group-hover|active):)?(?:bg|border|border-l|text|ring)-gold(?:\\/\\d+)?/g);
    if (!m) continue;
    const mods = m.filter((c) => c.includes("/") || c.startsWith("hover:") || c.startsWith("focus:"));
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const s = getComputedStyle(el);
    rows.push({ goldClasses: [...new Set(m)], modifiers: [...new Set(mods)], tag: el.tagName, text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 22), bg: s.backgroundColor, color: s.color, borderTop: s.borderTopColor, borderLeft: s.borderLeftColor, borderLeftWidth: s.borderLeftWidth, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], opacity: s.opacity });
  }
  return { accent: getComputedStyle(document.documentElement).getPropertyValue("--gc-accent").trim(), colorGold: getComputedStyle(document.documentElement).getPropertyValue("--color-gold").trim(), rows };
}`;

const out = { url: BASE, zoom: {}, themes: {}, errors: [] };
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

// ① pattern 项目缩放（P1-3 焦点环测量所在项目）
out.templateHitsPattern = await openFreshProject(page, "图案风格迁移");
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(900);
out.zoom.pattern = await page.evaluate(new Function(`return (${ZOOM})()`));
out.zoom.pattern.ringRenderedPx = (() => {
  const m = String(out.zoom.pattern.inlineTransform || "").match(/scale\(([\d.]+)\)/);
  const z = m ? Number(m[1]) : null;
  return z ? { zoom: z, declaredRingPx: 2, renderedPx: Number((2 * z).toFixed(2)) } : null;
})();
console.log("pattern zoom:", JSON.stringify(out.zoom.pattern));

// ② text 项目：带修饰 gold 类的残留审计（节点库 / 属性·结果 面板）
out.templateHitsText = await openFreshProject(page, "文生图（服装设计）");
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(900);
out.zoom.text = await page.evaluate(new Function(`return (${ZOOM})()`));
console.log("text zoom:", JSON.stringify(out.zoom.text));

for (const theme of THEMES) {
  await switchTheme(page, theme);
  await page.waitForTimeout(400);
  const lib = page.getByRole("button", { name: "节点库" });
  if (await lib.count()) {
    await lib.first().click();
    await page.waitForTimeout(900);
  }
  const withLib = await page.evaluate(new Function(`return (${AUDIT})()`));
  // 悬停第一个带 hover 的 chip
  let hoverInfo = null;
  const targets = page.locator('button:has-text("模板"), button:has-text("图")');
  if (await targets.count()) {
    await targets.first().hover().catch(() => {});
    await page.waitForTimeout(400);
    hoverInfo = await page.evaluate(new Function(`return (${AUDIT})()`));
  }
  await page.screenshot({ path: join(SHOTS, `extra-nodelib-${theme.id}-1280.png`) });
  if (await lib.count()) { await lib.first().click(); await page.waitForTimeout(600); }
  const dock = page.getByRole("button", { name: "属性 / 结果" });
  if (await dock.count()) { await dock.first().click(); await page.waitForTimeout(900); }
  const withDock = await page.evaluate(new Function(`return (${AUDIT})()`));
  await page.screenshot({ path: join(SHOTS, `extra-dock-${theme.id}-1280.png`) });
  if (await dock.count()) { await dock.first().click(); await page.waitForTimeout(600); }
  out.themes[theme.id] = { withLib, withDock, hoverInfo };
  const lines = (a) => a.rows.map((r) => `${r.goldClasses.join("+")} => bg=${r.bg} color=${r.color} bl=${r.borderLeft}(${r.borderLeftWidth}) op=${r.opacity} rect=${r.rect.join(",")}`);
  console.log(`\n== ${theme.id} accent=${withLib.accent} colorGold=${withLib.colorGold}`);
  console.log("  节点库:", lines(withLib).join(" ;; ").slice(0, 1000));
  console.log("  属性/结果:", lines(withDock).join(" ;; ").slice(0, 1000));
  console.log("  hover:", hoverInfo ? lines(hoverInfo).join(" ;; ").slice(0, 700) : "n/a");
}
write("extra-gold-variants.json", out);
await api.dispose();
await context.close();
await browser.close();
console.log("errors:", out.errors.length);
