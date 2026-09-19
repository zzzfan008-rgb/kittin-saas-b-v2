#!/usr/bin/env node
// ui-qa 三主题 × 三档宽 视觉验收 harness（登录页阶段）。
// 只读验收：不修改仓库源码；输出截图与机器量测 JSON。
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const require = createRequire(join(REPO, "package.json"));
const { chromium } = require("playwright");

const BASE = process.env.UiqaBase ?? "http://127.0.0.1:5411";
const OUT = "/tmp/gc-uiqa-v4";
const SHOTS = join(OUT, "shots");
mkdirSync(SHOTS, { recursive: true });

const THEMES = ["current", "white", "eye"];
const WIDTHS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
];

const OVERFLOW_PROBE = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const de = document.documentElement;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
    const inFlowCanvas = el.closest(".react-flow__viewport") !== null;
    const clippedX = el.scrollWidth > el.clientWidth + 1 && style.overflowX !== "auto" && style.overflowX !== "scroll" && style.overflowX !== "visible";
    const overflows = r.right > vw + 0.5 || r.left < -0.5 || r.bottom > vh + 0.5 || r.top < -0.5;
    const textClipped = el.childElementCount === 0 && el.scrollWidth > el.clientWidth + 1 && style.overflowX === "hidden";
    if (overflows || textClipped) {
      offenders.push({
        tag: el.tagName,
        testid: el.getAttribute("data-testid"),
        cls: typeof el.className === "string" ? el.className.slice(0, 140) : "",
        text: (el.textContent || "").trim().slice(0, 40),
        rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)],
        kind: overflows ? "overflow" : "clipped",
        inFlowCanvas,
      });
    }
  }
  return {
    viewport: [vw, vh],
    docScrollWidth: de.scrollWidth,
    docScrollHeight: de.scrollHeight,
    bodyScrollWidth: document.body.scrollWidth,
    horizontalOverflow: de.scrollWidth > vw,
    offendersOutsideCanvas: offenders.filter((o) => !o.inFlowCanvas),
    offendersInsideCanvas: offenders.filter((o) => o.inFlowCanvas).slice(0, 5),
    offenderCountOutside: offenders.filter((o) => !o.inFlowCanvas).length,
  };
};

const THEME_PROBE = () => {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const read = (name) => cs.getPropertyValue(name).trim();
  const card = document.querySelector('[data-testid="login-card"]');
  const brand = document.querySelector("aside[aria-hidden='true']");
  const style = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderColor: s.borderColor,
      backgroundImage: s.backgroundImage.slice(0, 90),
      backdropFilter: s.backdropFilter,
      boxShadow: s.boxShadow.slice(0, 120),
    };
  };
  return {
    dataTheme: root.dataset.theme,
    tokens: {
      shell: read("--gc-shell"),
      canvas: read("--gc-canvas"),
      panel: read("--gc-panel"),
      accent: read("--gc-accent"),
      text: read("--gc-text"),
      colorGold: read("--color-gold"),
      colorRing: read("--color-ring"),
    },
    card: card ? { rect: card.getBoundingClientRect().toJSON(), ...style(card) } : null,
    brand: brand ? { rect: brand.getBoundingClientRect().toJSON(), ...style(brand) } : null,
  };
};

const browser = await chromium.launch();
const results = [];
try {
  for (const theme of THEMES) {
    for (const viewport of WIDTHS) {
      const context = await browser.newContext({ locale: "zh-CN", timezoneId: "Asia/Shanghai", viewport });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
      await page.goto(`${BASE}/?theme=${theme}`, { waitUntil: "networkidle" });
      await page.evaluate((t) => window.localStorage.setItem("garment-canvas-theme", t), theme);
      await page.goto(`${BASE}/?theme=${theme}`, { waitUntil: "networkidle" });
      await page.waitForSelector('[data-testid="login-card"]', { timeout: 20_000 });
      await page.waitForTimeout(400);
      const name = `login-${theme}-${viewport.width}`;
      await page.screenshot({ path: join(SHOTS, `${name}.png`) });
      const [overflow, themeProbe] = await Promise.all([
        page.evaluate(OVERFLOW_PROBE),
        page.evaluate(THEME_PROBE),
      ]);
      results.push({ page: "login", theme, viewport: viewport.width, overflow, themeProbe, errors });
      console.log(`shot+measure: ${name}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
writeFileSync(join(OUT, "results-login.json"), JSON.stringify(results, null, 2));
console.log("wrote results-login.json");
