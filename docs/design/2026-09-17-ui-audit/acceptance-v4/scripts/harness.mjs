#!/usr/bin/env node
/**
 * ui-qa R-46 V4 三主题视觉验收 harness（隔离栈版）。
 * 只读验收：不修改 src/**；所有状态落在独立测试库 garment_canvas_uiqa_test + /tmp/gc-uiqa-v4。
 * 产出：/tmp/gc-uiqa-v4/shots/*.png + results-matrix.json + color-audit/*.json + anim.json
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { PROBES } from "./probes.mjs";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const require = createRequire(join(REPO, "package.json"));
const { chromium, request } = require("playwright");
const sharp = require("sharp");

const WEB = process.env.UiqaBase ?? "http://127.0.0.1:5411";
const API = process.env.UiqaApi ?? "http://127.0.0.1:3411";
const OUT = "/tmp/gc-uiqa-v4";
const SHOTS = join(OUT, "shots");
const AUDIT = join(OUT, "color-audit");
mkdirSync(SHOTS, { recursive: true });
mkdirSync(AUDIT, { recursive: true });

const ACCOUNT = "uiqa-v4-admin";
const INITIAL_PASSWORD = "UiqaV4Initial1234";
const PASSWORD = "UiqaV4Final5678";

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

const matrix = [];
const extras = {};
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const dump = () => {
  writeFileSync(join(OUT, "results-matrix.json"), JSON.stringify({ matrix, extras }, null, 2));
};

/** 把元素矩形钳进当前视口，得到合法的截图 clip。 */
function clampedClip(rect, viewport, pad = 12) {
  const x = Math.max(0, Math.floor(rect.x - pad));
  const y = Math.max(0, Math.floor(rect.y - pad));
  const right = Math.min(viewport.width, Math.ceil(rect.x + rect.width + pad));
  const bottom = Math.min(viewport.height, Math.ceil(rect.y + rect.height + pad));
  const width = Math.max(1, right - x);
  const height = Math.max(1, bottom - y);
  return { x, y, width, height };
}

async function stubImage(color, circle) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="600">
    <rect width="480" height="600" fill="${color}"/>
    <circle cx="240" cy="230" r="140" fill="${circle}"/>
    <rect x="60" y="430" width="360" height="90" fill="#2b2723"/>
    <rect x="60" y="540" width="360" height="20" fill="#8a7c6d"/>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "data:image/png;base64," + buf.toString("base64");
}

async function uploadImage() {
  return sharp({
    create: { width: 320, height: 240, channels: 3, background: { r: 115, g: 91, b: 66 } },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><circle cx="160" cy="120" r="70" fill="#d9c7b0"/><rect x="20" y="200" width="280" height="24" fill="#4a3f34"/></svg>`,
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
}

let runSequence = 0;
const nodeIdByRun = new Map();

async function installRunStub(page, images) {
  await page.route("**/api/run-plan**", async (route) => {
    const req = route.request();
    const pathname = new URL(req.url()).pathname;
    if (pathname === "/api/run-plan" && req.method() === "POST") {
      const body = req.postDataJSON();
      const runId = `uiqa-v4-${++runSequence}`;
      nodeIdByRun.set(runId, body.onlyNodeId);
      const url = images[(runSequence - 1) % images.length];
      stubImagePayloads.set(runId, url);
      await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ runId, status: "queued" }) });
      return;
    }
    const match = pathname.match(/^\/api\/run-plan\/([^/]+)(\/events)?$/);
    if (!match) {
      await route.abort("blockedbyclient");
      return;
    }
    const runId = decodeURIComponent(match[1]);
    const nodeId = nodeIdByRun.get(runId);
    if (!nodeId) throw new Error(`Unknown stub run ${runId}`);
    if (match[2] === "/events") {
      const now = Date.now();
      const body = [
        { seq: 1, type: "node-status", nodeId, status: "running", startedAt: now },
        {
          seq: 2,
          type: "node-status",
          nodeId,
          status: "success",
          images: [stubImagePayloads.get(runId)],
          model: "uiqa-stub-model",
          prompts: ["uiqa isolated acceptance"],
          startedAt: now,
          finishedAt: now + 25,
        },
        { seq: 3, type: "done" },
      ]
        .map((e) => `id: ${e.seq}\ndata: ${JSON.stringify(e)}\n\n`)
        .join("");
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
        body,
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: runId, status: "running" }) });
  });
}
const stubImagePayloads = new Map();

const INSTALL_VARIANT = async () => {
  const promptCatalogPath = "/src/lib/garmentPromptPresets.ts";
  const releasePath = "/src/lib/promptEvaluationRelease.ts";
  const registryPath = "/src/lib/promptEvaluationReleaseRegistry.ts";
  const [catalog, releaseTools, registry] = await Promise.all([
    import(/* @vite-ignore */ promptCatalogPath),
    import(/* @vite-ignore */ releasePath),
    import(/* @vite-ignore */ registryPath),
  ]);
  const codeSha = "0123456789abcdef0123456789abcdef01234567";
  globalThis.process = { env: { GARMENT_CANVAS_CODE_SHA: codeSha } };
  const variant = catalog.getGarmentPromptVariant({
    familyId: "commerce-hero",
    modelId: "gpt-image-2.5-flare-vip",
    nodeKind: "sketch-to-render",
    mode: "generate",
  }) ?? catalog.getGarmentPromptVariant({
    familyId: "commerce-hero",
    nodeKind: "sketch-to-render",
    mode: "generate",
  });
  if (!variant) return "no-variant";
  variant.supportStatus = "verified";
  const releases = registry.PROMPT_EVALUATION_RELEASES;
  releases.push(
    releaseTools.createPromptEvaluationReleaseSnapshot(variant, "verified", "uiqa-test-only-evidence", {
      evaluationStage: "formal-validation",
      evidenceArtifactSha256: "0".repeat(64),
      gateReceiptSha256: "0".repeat(64),
      evaluationUnitKey: `sha256:${"0".repeat(64)}`,
      codeSha,
    }),
  );
  return "ok:" + variant.modelId;
};

// ---------- 登录并保存认证态 ----------
const api = await request.newContext({ baseURL: API });
let res = await api.post("/api/auth/login", { data: { accountId: ACCOUNT, password: PASSWORD } });
if (res.status() === 401) {
  res = await api.post("/api/auth/login", { data: { accountId: ACCOUNT, password: INITIAL_PASSWORD } });
  const body = await res.json();
  if (body?.user?.mustChangePassword) {
    const ch = await api.post("/api/auth/change-password", { data: { currentPassword: INITIAL_PASSWORD, newPassword: PASSWORD } });
    if (!ch.ok()) throw new Error("change-password failed: " + (await ch.text()));
  }
}
if (!res.ok() && res.status() !== 401) throw new Error("login failed " + res.status() + " " + (await res.text()));
res = await api.get("/api/auth/me");
if (!res.ok()) throw new Error("session verification failed: " + res.status());
const me = await res.json();
log("logged in as", me?.user?.accountId ?? ACCOUNT);
const tutorial = await api.get("/api/tutorials/workbench-onboarding");
if (!(await tutorial.json()).acknowledged) {
  await api.post("/api/tutorials/workbench-onboarding/acknowledge", { data: {} });
}
const AUTH_FILE = join(OUT, "auth.json");
await api.storageState({ path: AUTH_FILE });

const IMAGES = [await stubImage("#7a6350", "#c9b6a3"), await stubImage("#5d6b7a", "#b9c9d6"), await stubImage("#6b7a5d", "#cbd6b9")];

const browser = await chromium.launch();
const context = await browser.newContext({
  storageState: AUTH_FILE,
  locale: "zh-CN",
  timezoneId: "Asia/Shanghai",
  viewport: WIDTHS[1],
  reducedMotion: "no-preference",
});
const page = await context.newPage();
page.setDefaultTimeout(30_000);
await page.addInitScript(PROBES);
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 300)));
await installRunStub(page, IMAGES);

const tabTitles = async () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("button[title]"))
      .map((e) => e.getAttribute("title"))
      .filter((t) => t && t.includes("双击重命名")),
  );

async function clickTab(title) {
  await page.locator(`button[title="${title}"]`).first().click();
  await page.waitForTimeout(500);
}

/** 遍历页签，返回第一个满足给定页面断言（函数源码字符串）的页签标题。 */
async function resolveCanvasTab(predicateSource) {
  for (const title of await tabTitles()) {
    await clickTab(title);
    await page.waitForTimeout(600);
    const ok = await page.evaluate(new Function(`return (${predicateSource})()`));
    if (ok) return title;
  }
  return null;
}

const PATTERN_PROBE = `() => Boolean(document.querySelector('[data-testid="rf__node-pattern"]'))`;
const TEXT_PROBE = `() => Array.from(document.querySelectorAll('.react-flow__node')).some((n) => (n.querySelector('.gc-node-header')?.textContent || '').includes('文生图'))`;

const dockWidth = () => page.evaluate(() => Math.round(document.querySelector('aside[aria-label="工作台左侧面板"]').getBoundingClientRect().width));

/** 关闭左侧 Dock（重复点击当前激活的 rail 按钮直到宽度为 0）。 */
async function closeDock() {
  for (let i = 0; i < 3 && (await dockWidth()) > 0; i += 1) {
    for (const label of ["属性 / 结果", "节点库"]) {
      const btn = page.getByRole("button", { name: label });
      if ((await btn.count()) === 0) continue;
      await btn.first().click();
      await page.waitForTimeout(400);
      if ((await dockWidth()) === 0) break;
    }
  }
  return dockWidth();
}

async function activateTab(nameFragment) {
  const tabs = await tabTitles();
  const target = tabs.find((t) => t.includes(nameFragment));
  if (!target) throw new Error(`tab not found for ${nameFragment}; have ${JSON.stringify(tabs)}`);
  await page.locator(`button[title="${target}"]`).click();
  await page.waitForTimeout(600);
}

async function dismissTutorial() {
  const tutorial = page.getByRole("dialog", { name: "欢迎使用服装设计工作台" });
  if (!(await tutorial.isVisible().catch(() => false))) return false;
  const next = tutorial.getByRole("button", { name: "下一步" });
  const done = tutorial.getByRole("button", { name: "完成教程" });
  for (let i = 0; i < 8 && !(await done.isVisible().catch(() => false)); i += 1) {
    await next.click();
    await page.waitForTimeout(150);
  }
  await done.click();
  await tutorial.waitFor({ state: "hidden" });
  log("tutorial dismissed");
  return true;
}

async function ensureLauncher() {
  await dismissTutorial();
  let launcher = page.getByRole("region", { name: "开始第一个创作任务" });
  if (!(await launcher.isVisible().catch(() => false))) {
    await page.getByRole("button", { name: "打开项目中心" }).click();
    const center = page.getByRole("dialog", { name: "项目中心" });
    await center.waitFor({ state: "visible" });
    await center.getByRole("button", { name: /新建项目/ }).click();
    await page.waitForTimeout(400);
  }
  launcher = page.getByRole("region", { name: "开始第一个创作任务" });
  await launcher.waitFor({ state: "visible" });
  return launcher;
}

async function switchTheme(id, label) {
  const trigger = page.getByRole("button", { name: /^切换主题，当前为/ });
  await trigger.click();
  await page.getByRole("menuitemradio", { name: new RegExp("^" + label) }).click();
  await page.waitForTimeout(400);
  const state = await page.evaluate(() => window.__gcTheme());
  if (state.attr !== id) log(`!! theme switch mismatch wanted=${id} got=${state.attr}`);
  return state;
}

// ---------- 阶段 1：准备工作台 ----------
log("stage 1: build workbench");
await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
extras.initialTabs = await tabTitles();

let launcher = await ensureLauncher();
await launcher.getByRole("button", { name: "使用内置模板：图案风格迁移（图案→参考风格）" }).click();
await page.waitForTimeout(1500);
extras.tabsAfterPattern = await tabTitles();
log("tabs after pattern:", JSON.stringify(extras.tabsAfterPattern));

await ensureLauncher();
const variantResult = await page.evaluate(INSTALL_VARIANT);
extras.variantInjection = variantResult;
log("variant injection:", variantResult);
await launcher.getByRole("button", { name: "使用内置模板：文生图（服装设计）" }).click();
await page.waitForTimeout(1500);
extras.tabsAfterText = await tabTitles();
log("tabs after text:", JSON.stringify(extras.tabsAfterText));

extras.patternTab = await resolveCanvasTab(PATTERN_PROBE);
extras.textTab = await resolveCanvasTab(TEXT_PROBE);
log("resolved tabs:", JSON.stringify({ pattern: extras.patternTab, text: extras.textTab }));
if (!extras.patternTab || !extras.textTab) {
  extras.setupFailure = { tabs: await tabTitles(), patternTab: extras.patternTab, textTab: extras.textTab };
  writeFileSync(join(OUT, "results-matrix.json"), JSON.stringify({ matrix, extras }, null, 2));
  await page.screenshot({ path: join(SHOTS, "99-setup-failure.png") });
  await context.close();
  await browser.close();
  throw new Error("无法定位图案/文生图画布页签：" + JSON.stringify(extras.setupFailure));
}

// 在文生图项目里做一次（桩）生成：先绑定受审提示词变体（真实用户路径：属性面板 → 服装提示词预设 → 确认应用）
await clickTab(extras.textTab);
await page.waitForTimeout(800);
const textNode = page.locator(".react-flow__node").filter({ hasText: "文生图" }).first();
await textNode.locator("textarea").first().fill("uiqa 验收：极简黑白通勤女装，写实摄影，浅灰背景");

async function bindPromptVariant(nodeTestId) {
  const result = {};
  const safeClick = async (locator, label) => {
    const count = await locator.count();
    if (count === 0) return { label, count, clicked: false, reason: "not found" };
    const visible = await locator.first().isVisible().catch(() => false);
    if (!visible) return { label, count, clicked: false, reason: "not visible" };
    try {
      await locator.first().click({ timeout: 5_000 });
      await page.waitForTimeout(500);
      return { label, count, clicked: true };
    } catch (error) {
      return { label, count, clicked: false, reason: String(error).slice(0, 120) };
    }
  };
  result.steps = [];
  result.steps.push(await safeClick(page.locator(`[data-testid="${nodeTestId}"]`), "select node"));
  result.steps.push(await safeClick(page.getByRole("button", { name: "属性 / 结果" }), "open inspector rail"));
  result.steps.push(await safeClick(page.getByRole("tab", { name: "属性" }), "属性 tab"));
  result.panelDump = await page.evaluate(() => {
    const panel = document.querySelector('[aria-label="属性与结果"]');
    const chain = [];
    let node = panel;
    while (node && node !== document.body) {
      const r = node.getBoundingClientRect();
      chain.push({
        tag: node.tagName,
        cls: String(node.className).slice(0, 70),
        display: getComputedStyle(node).display,
        w: Math.round(r.width),
        h: Math.round(r.height),
        hidden: node.hasAttribute("hidden"),
        dataState: node.getAttribute("data-state") ?? node.getAttribute("data-active") ?? null,
      });
      node = node.parentElement;
    }
    return {
      found: Boolean(panel),
      selectedNodes: document.querySelectorAll(".react-flow__node.selected").length,
      selectedNodeIds: Array.from(document.querySelectorAll(".react-flow__node.selected")).map((n) => n.getAttribute("data-id")),
      chain,
      tabPanels: Array.from(document.querySelectorAll('[role="tabpanel"]')).map((p) => ({
        hidden: p.hasAttribute("hidden"),
        display: getComputedStyle(p).display,
        w: Math.round(p.getBoundingClientRect().width),
        text: p.innerText.replace(/\s+/g, " ").slice(0, 100),
      })),
      presetTrigger: (() => {
        const span = Array.from(document.querySelectorAll("span")).find((s) => s.textContent.trim() === "服装提示词预设");
        if (!span) return null;
        const r = span.getBoundingClientRect();
        const cs = getComputedStyle(span);
        return { w: Math.round(r.width), h: Math.round(r.height), display: cs.display, visibility: cs.visibility };
      })(),
    };
  });
  result.steps.push(await safeClick(page.getByText("服装提示词预设", { exact: true }), "preset trigger"));
  const preset = page.getByRole("button", { name: /电商主图/ });
  result.presetCount = await preset.count();
  if (result.presetCount > 0) {
    result.presetDisabled = await preset.first().isDisabled();
    result.presetVisible = await preset.first().isVisible();
    if (!result.presetDisabled && result.presetVisible) {
      result.steps.push(await safeClick(preset, "preset"));
      result.steps.push(await safeClick(page.getByRole("button", { name: "确认应用" }), "confirm"));
    }
  }
  result.presetReasons = await page.evaluate(() =>
    Array.from(document.querySelectorAll("p[id^='prompt-preset-']")).map((n) => n.textContent.trim().slice(0, 90)),
  );
  return result;
}

extras.bindVariant = await bindPromptVariant("rf__node-generate");
log("bindVariant:", JSON.stringify(extras.bindVariant));
extras.dockAfterBind = await closeDock();
extras.runButtons = await textNode.locator("button").allInnerTexts();
extras.textNodeDump = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".react-flow__node")).map((n) => ({
    testid: n.getAttribute("data-testid"),
    header: (n.querySelector(".gc-node-header")?.textContent || "").trim().slice(0, 20),
    buttons: Array.from(n.querySelectorAll("button")).map((b) => ({
      t: b.textContent.trim().slice(0, 24),
      disabled: b.disabled,
      title: (b.getAttribute("title") || "").slice(0, 80),
    })),
    hasTextarea: Boolean(n.querySelector("textarea")),
  })),
);
log("textNodeDump:", JSON.stringify(extras.textNodeDump));
const runButton = textNode.locator("button").filter({ hasText: /生成效果图|开始生成|生成中|生成/ }).first();
try {
  await runButton.click({ timeout: 8_000 });
} catch (error) {
  extras.runClickFailed = String(error).slice(0, 200);
  log("run click failed:", extras.runClickFailed);
}
await page.waitForTimeout(3000);
extras.afterRunStatus = await page.evaluate(() => {
  const node = Array.from(document.querySelectorAll(".react-flow__node")).find((n) => n.textContent.includes("文生图"));
  return node ? node.getAttribute("aria-label") + " | " + node.textContent.replace(/\s+/g, " ").slice(0, 160) : "not found";
});
extras.runCount = runSequence;
extras.imagesRendered = await page.evaluate(() => document.querySelectorAll(".react-flow__node img").length);
log("stub runs fired:", runSequence, "images:", extras.imagesRendered);
await page.screenshot({ path: join(SHOTS, "00-setup-after-run.png") });
dump();

if (process.env.STOP_AFTER_SETUP === "1") {
  log("STOP_AFTER_SETUP: exiting after setup");
  await context.close();
  await browser.close();
  process.exit(0);
}

const PATTERN_TAB = extras.patternTab;
const TEXT_TAB = extras.textTab;

// ---------- 阶段 2：三主题 × 三档宽 矩阵 ----------
log("stage 2: theme × width matrix");
for (const viewport of WIDTHS) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(500);
  for (const theme of THEMES) {
    const tokens = await switchTheme(theme.id, theme.label);
    const entry = { viewport: viewport.width, theme: theme.id, tokens, pageErrors: [...pageErrors] };

    // A. 图片节点（缩略图槽）聚焦环
    await clickTab(PATTERN_TAB);
    await page.waitForTimeout(700);
    entry.patternNodes = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".react-flow__node")).map((n) => n.getAttribute("data-testid")),
    );
    entry.ringEmptySlot = await page.evaluate((sel) => window.__gcRing(sel), ".gc-node-card .aspect-\\[4\\/3\\]");
    if (entry.ringEmptySlot.rect) {
      await page.screenshot({
        path: join(SHOTS, `ring-slot-${theme.id}-${viewport.width}.png`),
        clip: clampedClip(entry.ringEmptySlot.rect, viewport, 10),
      });
    }
    entry.patternOverflow = await page.evaluate(() => window.__gcOverflow());
    await page.screenshot({ path: join(SHOTS, `canvas-pattern-${theme.id}-${viewport.width}.png`) });

    // 素材库浮层（图片节点「从素材库选择」）
    if (viewport.width === 1280) {
      const assetBtn = page.getByRole("button", { name: "从素材库选择" });
      if ((await assetBtn.count()) > 0) {
        await assetBtn.first().click();
        await page.waitForTimeout(900);
        await page.screenshot({ path: join(SHOTS, `panel-asset-library-${theme.id}-1280.png`) });
        entry.assetOverlay = await page.evaluate(() => {
          const overlay = document.querySelector('[role="dialog"]');
          return overlay ? overlay.textContent.replace(/\s+/g, " ").slice(0, 120) : null;
        });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
      }
    }

    // B. 文生图节点（chip 提示词板 + 结果揭示态）
    await clickTab(TEXT_TAB);
    await page.waitForTimeout(700);
    entry.chipRing = await page.evaluate((sel) => window.__gcRing(sel), ".gc-node-card textarea");
    entry.libraryButton = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "从素材库选择");
      const s = btn ? getComputedStyle(btn) : null;
      const r = btn ? btn.getBoundingClientRect() : null;
      return btn ? { text: btn.textContent.trim(), color: s.color, border: s.borderTopColor, rect: { x: r.x, y: r.y, width: r.width, height: r.height } } : null;
    });
    if (entry.chipRing.rect) {
      await page.screenshot({
        path: join(SHOTS, `ring-chip-${theme.id}-${viewport.width}.png`),
        clip: clampedClip(entry.chipRing.rect, viewport, 12),
      });
    }
    entry.textOverflow = await page.evaluate(() => window.__gcOverflow());
    entry.textNodeGeometry = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll(".react-flow__node"));
      return nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { testid: n.getAttribute("data-testid"), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] };
      });
    });
    entry.resultImages = await page.evaluate(() => document.querySelectorAll(".react-flow__node img").length);
    await page.screenshot({ path: join(SHOTS, `canvas-text-${theme.id}-${viewport.width}.png`) });

    // C. 面板：Inspector / 结果 / 素材库 / 节点库 / 主题切换器（仅 1280 档取面板截图）
    if (viewport.width === 1280) {
      await closeDock();
      // 主题切换器（菜单打开态）
      await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(SHOTS, `theme-menu-${theme.id}-1280.png`) });
      entry.themeMenu = await page.evaluate(() => {
        const menu = document.querySelector('[role="menu"]');
        if (!menu) return null;
        const r = menu.getBoundingClientRect();
        const items = Array.from(menu.querySelectorAll('[role="menuitemradio"]')).map((i) => ({
          name: i.textContent.replace(/\s+/g, " ").trim().slice(0, 40),
          checked: i.getAttribute("aria-checked"),
        }));
        return { rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], items };
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);

      // Inspector（属性）
      await page.getByRole("button", { name: "属性 / 结果" }).click();
      await page.waitForTimeout(600);
      entry.inspectorText = await page.evaluate(() =>
        (document.querySelector('[aria-label="属性 / 结果"]')?.innerText || "").replace(/\s+/g, " ").slice(0, 240),
      );
      await page.screenshot({ path: join(SHOTS, `panel-inspector-${theme.id}-1280.png`) });

      // 结果 / 记录 tab
      const resultsTab = page.getByRole("tab", { name: /结果/ });
      if ((await resultsTab.count()) > 0) {
        await resultsTab.first().click();
        await page.waitForTimeout(800);
        entry.resultsText = await page.evaluate(() =>
          (document.querySelector('[aria-label="属性 / 结果"]')?.innerText || "").replace(/\s+/g, " ").slice(0, 240),
        );
        await page.screenshot({ path: join(SHOTS, `panel-results-${theme.id}-1280.png`) });
      }

      // 节点库
      const libraryBtn = page.getByRole("button", { name: "节点库" });
      if ((await libraryBtn.count()) > 0) {
        await libraryBtn.first().click();
        await page.waitForTimeout(700);
        await page.screenshot({ path: join(SHOTS, `panel-library-${theme.id}-1280.png`) });
      }
      entry.dockWidthAfterPanels = await dockWidth();
      await closeDock();
    }

    const audit = await page.evaluate(() => window.__gcColorAudit());
    writeFileSync(join(AUDIT, `audit-${theme.id}-${viewport.width}.json`), JSON.stringify(audit, null, 1));
    entry.auditNodes = Object.keys(audit).length;
    matrix.push(entry);
    dump();
    log(`done ${theme.id}@${viewport.width} ring=${entry.ringEmptySlot.boxShadow?.slice(0, 60)} chipBorder=${entry.chipRing.borderColor} imgs=${entry.resultImages}`);
  }
}

// ---------- 阶段 3：reduced-motion 下的结果揭示动画 ----------
log("stage 3: reduced-motion comparison");
async function triggerRunAndRecord(mode) {
  await page.emulateMedia({ reducedMotion: mode });
  await page.waitForTimeout(300);
  await clickTab(TEXT_TAB);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__gcAnim());
  const node = page.locator(".react-flow__node").filter({ hasText: "文生图" }).first();
  const before = runSequence;
  await node.locator("button").filter({ hasText: /生成效果图|开始生成|生成/ }).first().click();
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline && runSequence === before) await page.waitForTimeout(200);
  await page.waitForTimeout(2500);
  const entries = await page.evaluate(() => window.__gcAnimLog);
  const reveals = entries.filter((e) => e.name && e.name.startsWith("gc-result-reveal"));
  const animationEvents = entries.filter((e) => e.phase === "start" || e.phase === "end");
  return {
    mode,
    runTriggered: runSequence > before,
    totalEvents: entries.length,
    revealEvents: reveals,
    animationEvents: animationEvents.slice(0, 12),
    transitions: entries.filter((e) => e.phase === "transition").length,
  };
}
extras.animNoPreference = await triggerRunAndRecord("no-preference");
log("anim (no-preference):", JSON.stringify(extras.animNoPreference));
extras.animReduce = await triggerRunAndRecord("reduce");
log("anim (reduce):", JSON.stringify(extras.animReduce));
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.screenshot({ path: join(SHOTS, "00-after-reveal.png") });
dump();

writeFileSync(join(OUT, "page-errors.json"), JSON.stringify(pageErrors, null, 2));
await context.close();
await browser.close();
log("DONE; errors:", pageErrors.length);
