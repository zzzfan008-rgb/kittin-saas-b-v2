// 探针 9：启用态 CTA 逐主题取证（绑定受审变体 + 桩运行 → 按钮转为可用）。
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROBES } from "./probes.mjs";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const require = createRequire(join(REPO, "package.json"));
const { chromium, request } = require("playwright");
const sharp = require("sharp");
const WEB = "http://127.0.0.1:5411";
const API = "http://127.0.0.1:3411";
const OUT = "/tmp/gc-uiqa-v4";
const SHOTS = join(OUT, "shots");
mkdirSync(SHOTS, { recursive: true });

const INSTALL_VARIANT = async () => {
  const [catalog, releaseTools, registry] = await Promise.all([
    import(/* @vite-ignore */ "/src/lib/garmentPromptPresets.ts"),
    import(/* @vite-ignore */ "/src/lib/promptEvaluationRelease.ts"),
    import(/* @vite-ignore */ "/src/lib/promptEvaluationReleaseRegistry.ts"),
  ]);
  const codeSha = "0123456789abcdef0123456789abcdef01234567";
  globalThis.process = { env: { GARMENT_CANVAS_CODE_SHA: codeSha } };
  const variant = catalog.getGarmentPromptVariant({ familyId: "commerce-hero", modelId: "gpt-image-2.5-flare-vip", nodeKind: "sketch-to-render", mode: "generate" });
  if (!variant) return "no-variant";
  variant.supportStatus = "verified";
  registry.PROMPT_EVALUATION_RELEASES.push(
    releaseTools.createPromptEvaluationReleaseSnapshot(variant, "verified", "uiqa-test-only-evidence", {
      evaluationStage: "formal-validation",
      evidenceArtifactSha256: "0".repeat(64),
      gateReceiptSha256: "0".repeat(64),
      evaluationUnitKey: `sha256:${"0".repeat(64)}`,
      codeSha,
    }),
  );
  return "ok";
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="600"><rect width="480" height="600" fill="#7a6350"/><circle cx="240" cy="230" r="140" fill="#c9b6a3"/><rect x="60" y="430" width="360" height="90" fill="#2b2723"/></svg>`;
const STUB_IMAGE = "data:image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");

const api = await request.newContext({ baseURL: API });
const login = await api.post("/api/auth/login", { data: { accountId: "uiqa-v4-admin", password: "UiqaV4Final5678" } });
if (!login.ok()) throw new Error("login failed " + login.status());
await api.storageState({ path: join(OUT, "auth.json") });

const browser = await chromium.launch();
const context = await browser.newContext({ storageState: join(OUT, "auth.json"), locale: "zh-CN", viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.setDefaultTimeout(25_000);
await page.addInitScript(PROBES);

const nodeIdByRun = new Map();
await page.route("**/api/run-plan**", async (route) => {
  const req = route.request();
  const pathname = new URL(req.url()).pathname;
  if (pathname === "/api/run-plan" && req.method() === "POST") {
    const body = req.postDataJSON();
    const runId = "uiqa-cta-1";
    nodeIdByRun.set(runId, body.onlyNodeId);
    await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ runId, status: "queued" }) });
    return;
  }
  const m = pathname.match(/^\/api\/run-plan\/([^/]+)(\/events)?$/);
  if (!m) return route.abort("blockedbyclient");
  const runId = decodeURIComponent(m[1]);
  const nodeId = nodeIdByRun.get(runId);
  if (m[2] === "/events") {
    const now = Date.now();
    const body = [
      { seq: 1, type: "node-status", nodeId, status: "running", startedAt: now },
      { seq: 2, type: "node-status", nodeId, status: "success", images: [STUB_IMAGE], model: "uiqa-stub", prompts: ["uiqa"], startedAt: now, finishedAt: now + 20 },
      { seq: 3, type: "done" },
    ].map((e) => `id: ${e.seq}\ndata: ${JSON.stringify(e)}\n\n`).join("");
    return route.fulfill({ status: 200, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }, body });
  }
  return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: runId, status: "running" }) });
});

await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "打开项目中心" }).click();
const center = page.getByRole("dialog", { name: "项目中心" });
await center.waitFor({ state: "visible" });
const cards = center.locator("button").filter({ hasText: "文生图" });
if (await cards.count()) {
  await cards.first().click();
  await page.waitForTimeout(3000);
}
await page.keyboard.press("Escape");
await page.waitForTimeout(800);
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(1000);

console.log("variant:", await page.evaluate(INSTALL_VARIANT));
await page.locator('[data-testid="rf__node-generate"] .gc-node-header').click();
await page.waitForTimeout(700);
await page.getByRole("button", { name: "属性 / 结果" }).click();
await page.waitForTimeout(700);
await page.getByText("服装提示词预设", { exact: true }).click();
await page.waitForTimeout(500);
await page.getByRole("button", { name: /电商主图/ }).first().click();
await page.waitForTimeout(500);
await page.getByRole("button", { name: "确认应用" }).click();
await page.waitForTimeout(1200);
// 关闭 Dock，避免遮挡
const asideW = () => page.evaluate(() => Math.round(document.querySelector('aside[aria-label="工作台左侧面板"]').getBoundingClientRect().width));
for (let i = 0; i < 3 && (await asideW()) > 0; i += 1) {
  await page.getByRole("button", { name: "属性 / 结果" }).click();
  await page.waitForTimeout(500);
}
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(900);
const runBtn = page.locator('[data-testid="rf__node-generate"] button').filter({ hasText: /生成效果图|生成中/ }).first();
await runBtn.click();
await page.waitForTimeout(3500);
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(900);

const out = {};
for (const theme of [
  { id: "current", label: "曜黑·荧光绿" },
  { id: "white", label: "简白" },
  { id: "eye", label: "护眼绿" },
]) {
  await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp("^" + theme.label) }).click();
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('[data-testid="rf__node-generate"] button')).find((b) => b.textContent.includes("生成效果图"));
    const node = document.querySelector('[data-testid="rf__node-generate"]');
    const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    return {
      accent: getComputedStyle(document.documentElement).getPropertyValue("--gc-accent").trim(),
      runButton: btn ? { text: btn.textContent.trim(), bg: getComputedStyle(btn).backgroundColor, color: getComputedStyle(btn).color, opacity: getComputedStyle(btn).opacity, disabled: btn.disabled, rect: r(btn) } : null,
      node: node ? r(node) : null,
      images: document.querySelectorAll('[data-testid="rf__node-generate"] img').length,
    };
  });
  const path = join(SHOTS, `cta-enabled-${theme.id}-1280.png`);
  if (info.node) {
    const [x, y, w, h] = info.node;
    const cx = Math.max(0, x - 6), cy = Math.max(0, y - 6);
    await page.screenshot({ path, clip: { x: cx, y: cy, width: Math.max(1, Math.min(1280 - cx, w + 12)), height: Math.max(1, Math.min(720 - cy, h + 12)) } });
  }
  info.screenshot = path;
  out[theme.id] = info;
  console.log(theme.id, JSON.stringify(info));
}
writeFileSync(join(OUT, "results-cta-enabled.json"), JSON.stringify(out, null, 2));
await browser.close();
