// R-51 P1-4 复验：连线预览 / 框选 / 暗房显影在 三主题 是否跟随主题（旧金 #c9a66b / #806135 零残留）+ handle 渐变。
import { join } from "node:path";
import { BASE, THEMES, nodeRequire, SHOTS, write, login, dismissTutorial, switchTheme, closeDock, clipFor, openFreshProject } from "./lib.mjs";

const { chromium } = nodeRequire("playwright");
const sharp = nodeRequire("sharp");

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

const OLD_GOLD_PATTERNS = ["201, 166, 107", "201,166,107", "128, 97, 53", "128,97,53", "c9a66b", "C9A66B", "806135"];
const SCAN = `() => {
  const patterns = ${JSON.stringify(OLD_GOLD_PATTERNS.map((p) => p.toLowerCase()))};
  const hits = [];
  for (const el of document.querySelectorAll("body *")) {
    const s = getComputedStyle(el);
    const values = [s.color, s.backgroundColor, s.borderTopColor, s.borderLeftColor, s.borderRightColor, s.borderBottomColor, s.backgroundImage, s.boxShadow, s.stroke, s.fill, s.outlineColor, s.textDecorationColor];
    for (const v of values) {
      if (!v) continue;
      const low = String(v).toLowerCase();
      if (patterns.some((p) => low.includes(p))) {
        hits.push({ tag: el.tagName, cls: String(el.className).slice(0, 90), testid: el.getAttribute("data-testid"), value: String(v).slice(0, 110) });
        break;
      }
    }
  }
  return hits.slice(0, 25);
}`;

const out = { url: BASE, themes: {}, develop: {}, handle: {}, notes: [] };
const { statePath, api } = await login();
const browser = await chromium.launch();
const context = await browser.newContext({ storageState: statePath, locale: "zh-CN", viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.setDefaultTimeout(25_000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="600"><rect width="480" height="600" fill="#7a6350"/><circle cx="240" cy="230" r="140" fill="#c9b6a3"/></svg>`;
const STUB_IMAGE = "data:image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");

let sseDelayMs = 300;
let runSeq = 0;
const nodeIdByRun = new Map();
await page.route("**/api/run-plan**", async (route) => {
  const req = route.request();
  const pathname = new URL(req.url()).pathname;
  if (pathname === "/api/run-plan" && req.method() === "POST") {
    const body = req.postDataJSON();
    const runId = `uiqa-r51-p4-${(runSeq += 1)}`;
    nodeIdByRun.set(runId, body.onlyNodeId);
    await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ runId, status: "queued" }) });
    return;
  }
  const m = pathname.match(/^\/api\/run-plan\/([^/]+)(\/events)?$/);
  if (!m) return route.abort("blockedbyclient");
  const runId = decodeURIComponent(m[1]);
  const nodeId = nodeIdByRun.get(runId);
  if (m[2] === "/events") {
    if (sseDelayMs) await new Promise((r) => setTimeout(r, sseDelayMs));
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

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.keyboard.press("Escape");
await dismissTutorial(page);
await page.getByRole("button", { name: "打开项目中心" }).click();
const center = page.getByRole("dialog", { name: "项目中心" });
await center.waitFor({ state: "visible" });
const cards = center.locator("button").filter({ hasText: "文生图" });
if (await cards.count()) {
  await cards.first().click();
  await page.waitForTimeout(3000);
}
await page.keyboard.press("Escape");
await page.waitForTimeout(600);
const templateHits = await openFreshProject(page, "文生图（服装设计）");
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(900);
out.notes.push(`template hits: ${templateHits}`);
out.notes.push(`variant install: ${await page.evaluate(INSTALL_VARIANT)}`);

// 绑定受审变体（供运行触发）
await page.locator('[data-testid="rf__node-generate"] .gc-node-header').click();
await page.waitForTimeout(700);
await page.getByRole("button", { name: "属性 / 结果" }).click();
await page.waitForTimeout(700);
await page.getByText("服装提示词预设", { exact: true }).click();
await page.waitForTimeout(500);
await page.getByRole("button", { name: /电商主图/ }).first().click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "确认应用" }).click();
await page.waitForTimeout(1000);
await closeDock(page);
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(800);

for (const theme of THEMES) {
  await switchTheme(page, theme);
  await page.waitForTimeout(400);
  const rec = { vars: await page.evaluate(() => { const s = getComputedStyle(document.documentElement); return { accent: s.getPropertyValue("--gc-accent").trim(), accentDeep: s.getPropertyValue("--gc-accent-deep").trim(), edge: s.getPropertyValue("--gc-edge").trim(), statusQueued: s.getPropertyValue("--gc-status-queued").trim() }; }) };

  // 1) 框选
  const box = await page.evaluate(() => { const p = document.querySelector(".react-flow__pane"); const r = p.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; });
  await page.mouse.move(box[0] + 40, box[1] + box[3] - 120);
  await page.mouse.down();
  await page.mouse.move(box[0] + 260, box[1] + box[3] - 40, { steps: 8 });
  await page.waitForTimeout(250);
  rec.selection = await page.evaluate(() => {
    const s = document.querySelector(".react-flow__selection");
    if (!s) return null;
    const cs = getComputedStyle(s);
    return { background: cs.backgroundColor, border: cs.borderTopColor, borderWidth: cs.borderTopWidth };
  });
  const selShot = join(SHOTS, `p1-4-selection-${theme.id}-1280.png`);
  await page.screenshot({ path: selShot });
  rec.selectionShot = selShot;
  await page.mouse.up();
  await page.waitForTimeout(250);

  // 2) 连线预览
  const hb = await page.evaluate(() => {
    const h = document.querySelector('[data-testid="rf__node-generate"] .react-flow__handle.source') || document.querySelector(".react-flow__handle.source");
    if (!h) return null;
    const r = h.getBoundingClientRect();
    return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)];
  });
  if (hb) {
    await page.mouse.move(hb[0], hb[1]);
    await page.mouse.down();
    await page.mouse.move(hb[0] + 140, hb[1] + 70, { steps: 8 });
    await page.waitForTimeout(250);
    rec.connection = await page.evaluate(() => {
      const p = document.querySelector(".react-flow__connection-path");
      if (!p) return null;
      const cs = getComputedStyle(p);
      return { stroke: cs.stroke, strokeWidth: cs.strokeWidth, d: (p.getAttribute("d") || "").slice(0, 60) };
    });
    const conShot = join(SHOTS, `p1-4-connection-${theme.id}-1280.png`);
    await page.screenshot({ path: conShot });
    rec.connectionShot = conShot;
    await page.mouse.up();
    await page.waitForTimeout(300);
  } else {
    rec.connection = { missing: "no source handle" };
  }

  // 3) handle 渐变
  rec.handle = await page.evaluate(() => {
    const h = document.querySelector(".react-flow__handle");
    if (!h) return null;
    const cs = getComputedStyle(h);
    return { background: cs.backgroundImage.slice(0, 180), boxShadow: cs.boxShadow.slice(0, 180), border: cs.borderTopColor };
  });

  // 4) 旧金扫描（静态 DOM）
  rec.oldGoldHits = await page.evaluate(new Function(`return (${SCAN})()`));
  out.themes[theme.id] = rec;
  console.log(`${theme.id} vars`, JSON.stringify(rec.vars), "\n   selection", JSON.stringify(rec.selection), "\n   connection", JSON.stringify(rec.connection), "\n   handle", JSON.stringify(rec.handle).slice(0, 200), "\n   oldGoldHits", rec.oldGoldHits.length, JSON.stringify(rec.oldGoldHits.slice(0, 4)));
}

// 5) 暗房显影（运行中态）：三主题各跑一次（SSE 延迟 4.5s 以取证显影中）
sseDelayMs = 4500;
for (const theme of THEMES) {
  await switchTheme(page, theme);
  await page.waitForTimeout(400);
  const runBtn = page.locator('[data-testid="rf__node-generate"] button').filter({ hasText: /生成效果图/ }).first();
  if (!(await runBtn.count())) {
    out.develop[theme.id] = { skipped: "run button not found" };
    continue;
  }
  await runBtn.click();
  await page.waitForTimeout(1600);
  const dev = await page.evaluate(new Function(`return (${SCAN})()`));
  const detail = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const st = (el) => (el ? { backgroundImage: getComputedStyle(el).backgroundImage.slice(0, 150), color: getComputedStyle(el).color, backgroundColor: getComputedStyle(el).backgroundColor, boxShadow: getComputedStyle(el).boxShadow.slice(0, 120) } : null);
    const grid = q(".develop-gridlines");
    const scan = q(".develop-scanline");
    const label = q(".develop-label");
    const overlay = q(".develop-overlay");
    return { overlay: st(overlay), gridlines: st(grid), scanline: st(scan), label: st(label), overlayClass: overlay ? String(overlay.className).slice(0, 80) : null, text: overlay ? overlay.textContent.replace(/\s+/g, " ").slice(0, 40) : null };
  });
  const shot = join(SHOTS, `p1-4-developing-${theme.id}-1280.png`);
  const node = await page.evaluate(() => { const n = document.querySelector('[data-testid="rf__node-generate"]'); if (!n) return null; const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  if (node) await page.screenshot({ path: shot, clip: clipFor(node, 1280, 720, 8) });
  else await page.screenshot({ path: shot });
  out.develop[theme.id] = { ...detail, oldGoldHits: dev, shot };
  console.log(`${theme.id} develop`, JSON.stringify(detail).slice(0, 500), "oldGoldHits:", dev.length);
  await page.waitForTimeout(5200); // 等本次运行结束
}
out.errors = errors;
write("p1-4-residue.json", out);
await api.dispose();
await context.close();
await browser.close();
console.log("pageerrors:", errors.length);
