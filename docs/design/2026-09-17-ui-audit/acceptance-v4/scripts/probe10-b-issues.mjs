// 探针 10：独立核验 R-47 锁定版 §11 B1–B5 的渲染实况（连线预览 / 框选 / 暗房显影 / handle 渐变 / 前景色）。
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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="600"><rect width="480" height="600" fill="#7a6350"/><circle cx="240" cy="230" r="140" fill="#c9b6a3"/></svg>`;
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

let sseDelayMs = 400;
await page.route("**/api/run-plan**", async (route) => {
  const req = route.request();
  const pathname = new URL(req.url()).pathname;
  if (pathname === "/api/run-plan" && req.method() === "POST") {
    const body = req.postDataJSON();
    await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ runId: "uiqa-b-probe", status: "queued", nodeId: body.onlyNodeId }) });
    return;
  }
  const m = pathname.match(/^\/api\/run-plan\/([^/]+)(\/events)?$/);
  if (!m) return route.abort("blockedbyclient");
  const nodeId = "generate";
  if (m[2] === "/events") {
    await new Promise((r) => setTimeout(r, sseDelayMs));
    const now = Date.now();
    const body = [
      { seq: 1, type: "node-status", nodeId, status: "success", images: [STUB_IMAGE], model: "uiqa-stub", prompts: ["uiqa"], startedAt: now, finishedAt: now + 20 },
      { seq: 2, type: "done" },
    ].map((e) => `id: ${e.seq}\ndata: ${JSON.stringify(e)}\n\n`).join("");
    return route.fulfill({ status: 200, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }, body });
  }
  return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "uiqa-b-probe", status: "running" }) });
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
await page.waitForTimeout(700);
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(900);
await page.evaluate(INSTALL_VARIANT);
await page.locator('[data-testid="rf__node-generate"] .gc-node-header').click();
await page.waitForTimeout(600);
await page.getByRole("button", { name: "属性 / 结果" }).click();
await page.waitForTimeout(600);
await page.getByText("服装提示词预设", { exact: true }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /电商主图/ }).first().click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "确认应用" }).click();
await page.waitForTimeout(1000);
for (let i = 0; i < 3 && (await page.evaluate(() => Math.round(document.querySelector('aside[aria-label="工作台左侧面板"]').getBoundingClientRect().width))) > 0; i += 1) {
  await page.getByRole("button", { name: "属性 / 结果" }).click();
  await page.waitForTimeout(450);
}
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(800);

const out = { themes: {}, b1: {}, develop: {} };

// B1：启用态 CTA 前景/背景（渲染实况）
const b1 = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('[data-testid="rf__node-generate"] button')).find((b) => b.textContent.includes("生成效果图"));
  if (!btn) return null;
  const s = getComputedStyle(btn);
  return { text: btn.textContent.trim(), bg: s.backgroundColor, color: s.color, disabled: btn.disabled };
});
out.b1.button = b1;

for (const theme of [
  { id: "current", label: "曜黑·荧光绿" },
  { id: "white", label: "简白" },
  { id: "eye", label: "护眼绿" },
]) {
  await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp("^" + theme.label) }).click();
  await page.waitForTimeout(600);
  // handle 渐变（B4）
  const handle = await page.evaluate(() => {
    const h = document.querySelector(".react-flow__handle");
    if (!h) return null;
    const s = getComputedStyle(h);
    return { background: s.backgroundImage.slice(0, 200), boxShadow: s.boxShadow.slice(0, 200) };
  });
  // B3：连线预览 + 框选
  const box = await page.evaluate(() => {
    const pane = document.querySelector(".react-flow__pane");
    const r = pane.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
  });
  await page.mouse.move(box[0] + 60, box[1] + 60);
  await page.mouse.down();
  await page.mouse.move(box[0] + 260, box[1] + 200, { steps: 8 });
  await page.waitForTimeout(250);
  const selection = await page.evaluate(() => {
    const sel = document.querySelector(".react-flow__selection");
    if (!sel) return null;
    const s = getComputedStyle(sel);
    return { background: s.backgroundColor, border: s.borderTopColor, borderWidth: s.borderTopWidth };
  });
  await page.screenshot({ path: join(SHOTS, `b3-selection-${theme.id}-1280.png`) });
  await page.mouse.up();
  await page.waitForTimeout(200);
  // 连线预览：从源 handle 拖出
  const handleBox = await page.evaluate(() => {
    const h = document.querySelector('[data-testid="rf__node-generate"] .react-flow__handle.source');
    if (!h) return null;
    const r = h.getBoundingClientRect();
    return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)];
  });
  let connection = null;
  if (handleBox) {
    await page.mouse.move(handleBox[0], handleBox[1]);
    await page.mouse.down();
    await page.mouse.move(handleBox[0] + 120, handleBox[1] + 90, { steps: 6 });
    await page.waitForTimeout(250);
    connection = await page.evaluate(() => {
      const p = document.querySelector(".react-flow__connection-path");
      if (!p) return null;
      const s = getComputedStyle(p);
      return { stroke: s.stroke, strokeWidth: s.strokeWidth, d: (p.getAttribute("d") || "").slice(0, 60) };
    });
    await page.screenshot({ path: join(SHOTS, `b3-connection-${theme.id}-1280.png`) });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
  out.themes[theme.id] = { handle, selection, connection };
  console.log(theme.id, "selection:", JSON.stringify(selection), "connection:", JSON.stringify(connection));
}

// B2：暗房显影（运行中态）
await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
await page.getByRole("menuitemradio", { name: /^简白/ }).click();
await page.waitForTimeout(500);
sseDelayMs = 4000;
const runBtn = page.locator('[data-testid="rf__node-generate"] button').filter({ hasText: /生成效果图/ }).first();
await runBtn.click();
await page.waitForTimeout(1500);
out.develop = await page.evaluate(() => {
  const grid = document.querySelector(".develop-gridlines");
  const scan = document.querySelector(".develop-scanline");
  const overlay = grid ? grid.closest("div") : null;
  const s = (el) => (el ? getComputedStyle(el) : null);
  return {
    gridlines: grid ? { backgroundImage: s(grid).backgroundImage.slice(0, 160), color: s(grid).color } : null,
    scanline: scan ? { background: s(scan).backgroundImage.slice(0, 160) || s(scan).backgroundColor, color: s(scan).color } : null,
    overlay: overlay ? { className: String(overlay.className).slice(0, 120), bg: s(overlay).backgroundColor, color: s(overlay).color } : null,
    bodyText: (overlay ? overlay.textContent.replace(/\s+/g, " ").slice(0, 60) : null),
    hexHits: (() => {
      const found = [];
      for (const el of document.querySelectorAll(".react-flow__node *")) {
        const st = getComputedStyle(el);
        for (const v of [st.color, st.backgroundColor, st.borderTopColor, st.backgroundImage, st.boxShadow]) {
          if (v && (v.includes("201, 166, 107") || v.includes("128, 97, 53") || v.includes("201,166,107") || v.includes("128,97,53"))) {
            found.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), value: v.slice(0, 80) });
          }
        }
      }
      return found.slice(0, 8);
    })(),
  };
});
await page.screenshot({ path: join(SHOTS, "b2-developing-white-1280.png") });
console.log("develop:", JSON.stringify(out.develop).slice(0, 900));
await page.waitForTimeout(4500);
await page.screenshot({ path: join(SHOTS, "b2-after-white-1280.png") });

writeFileSync(join(OUT, "results-b-probe.json"), JSON.stringify(out, null, 2));
await browser.close();
console.log("probe10 done");
