// 探针 5（修订）：面板面 × 三主题 × 三档宽 全覆盖；修正 Dock 开关判定。
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROBES } from "./probes.mjs";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const require = createRequire(join(REPO, "package.json"));
const { chromium, request } = require("playwright");
const WEB = "http://127.0.0.1:5411";
const API = "http://127.0.0.1:3411";
const OUT = "/tmp/gc-uiqa-v4";
const SHOTS = join(OUT, "shots");
mkdirSync(SHOTS, { recursive: true });

const THEMES = [
  { id: "current", label: "曜黑·荧光绿" },
  { id: "white", label: "简白" },
  { id: "eye", label: "护眼绿" },
];
const WIDTHS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
];

const api = await request.newContext({ baseURL: API });
const login = await api.post("/api/auth/login", { data: { accountId: "uiqa-v4-admin", password: "UiqaV4Final5678" } });
if (!login.ok()) throw new Error("login failed " + login.status());
await api.storageState({ path: join(OUT, "auth.json") });

const browser = await chromium.launch();
const context = await browser.newContext({ storageState: join(OUT, "auth.json"), locale: "zh-CN", viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.setDefaultTimeout(25_000);
await page.addInitScript(PROBES);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.keyboard.press("Escape");

const dockState = () =>
  page.evaluate(() => {
    const aside = document.querySelector('aside[aria-label="工作台左侧面板"]');
    const sections = Array.from(aside.querySelectorAll("section"));
    return {
      width: Math.round(aside.getBoundingClientRect().width),
      open: sections.filter((s) => s.getAttribute("aria-hidden") === "false").map((s) => s.getAttribute("aria-label")),
    };
  });

async function closeDock() {
  for (let i = 0; i < 4; i += 1) {
    const st = await dockState();
    if (st.width === 0) return st;
    const label = st.open[0] === "节点库" ? "节点库" : "属性 / 结果";
    const btn = page.getByRole("button", { name: label });
    if ((await btn.count()) === 0) return st;
    await btn.first().click();
    await page.waitForTimeout(400);
  }
  return dockState();
}

async function openPanel(label) {
  for (let i = 0; i < 3; i += 1) {
    const st = await dockState();
    if (st.width > 0 && st.open.includes(label)) return st;
    const btn = page.getByRole("button", { name: label });
    if ((await btn.count()) === 0) return st;
    await btn.first().click();
    await page.waitForTimeout(500);
  }
  return dockState();
}

const sectionText = (label) =>
  page.evaluate((l) => {
    const s = document.querySelector(`aside[aria-label="工作台左侧面板"] section[aria-label="${l}"]`);
    return s ? (s.innerText || "").replace(/\s+/g, " ").slice(0, 200) : null;
  }, label);

const out = { panels: [], errors };
for (const viewport of WIDTHS) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(400);
  for (const theme of THEMES) {
    await closeDock();
    await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
    await page.getByRole("menuitemradio", { name: new RegExp("^" + theme.label) }).click();
    await page.waitForTimeout(600);
    const entry = { width: viewport.width, theme: theme.id };

    entry.dockInspector = await openPanel("属性 / 结果");
    await page.screenshot({ path: join(SHOTS, `panel-inspector-${theme.id}-${viewport.width}.png`) });
    entry.inspectorText = await sectionText("属性 / 结果");
    entry.overflowWithDockOpen = await page.evaluate(() => window.__gcOverflow());

    const resultsTab = page.getByRole("tab", { name: /结果/ });
    if ((await resultsTab.count()) > 0) {
      await resultsTab.first().click();
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(SHOTS, `panel-results-${theme.id}-${viewport.width}.png`) });
      entry.resultsText = await sectionText("属性 / 结果");
    }

    entry.dockLibrary = await openPanel("节点库");
    await page.screenshot({ path: join(SHOTS, `panel-library-${theme.id}-${viewport.width}.png`) });
    entry.libraryText = await sectionText("节点库");

    await closeDock();
    entry.dockClosed = await dockState();
    const assetBtn = page.getByRole("button", { name: /^(从素材库选择|素材库)$/ }).first();
    if ((await assetBtn.count()) > 0) {
      await assetBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: join(SHOTS, `panel-asset-library-${theme.id}-${viewport.width}.png`) });
      entry.assetText = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return d ? d.textContent.replace(/\s+/g, " ").slice(0, 140) : null;
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }
    out.panels.push(entry);
    writeFileSync(join(OUT, "results-panels.json"), JSON.stringify(out, null, 2));
    console.log(
      `panels ${theme.id}@${viewport.width} dock=${JSON.stringify(entry.dockInspector)} lib=${JSON.stringify(entry.dockLibrary)} closed=${entry.dockClosed.width} outside=${entry.overflowWithDockOpen.offenderCountOutside} asset=${(entry.assetText || "").slice(0, 30)}`,
    );
  }
}
await browser.close();
console.log("errors:", errors.length);
