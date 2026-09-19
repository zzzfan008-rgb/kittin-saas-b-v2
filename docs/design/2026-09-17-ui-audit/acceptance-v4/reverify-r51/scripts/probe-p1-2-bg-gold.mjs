// R-51 P1-2 复验：bg-gold 在简白/护眼绿下是否跟随主题 accent（启用态 CTA 像素 + 全 DOM bg-gold 审计）。
import { join } from "node:path";
import { BASE, THEMES, nodeRequire, SHOTS, write, login, dismissTutorial, switchTheme, closeDock, clipFor, openFreshProject } from "./lib.mjs";

const PROJECT_TEMPLATE = "文生图（服装设计）";

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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="600"><rect width="480" height="600" fill="#7a6350"/><circle cx="240" cy="230" r="140" fill="#c9b6a3"/><rect x="60" y="430" width="360" height="90" fill="#2b2723"/></svg>`;
const STUB_IMAGE = "data:image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");

const GOLD_AUDIT = () => {
  const rows = [];
  for (const el of document.querySelectorAll("body *")) {
    const cls = typeof el.className === "string" ? el.className : "";
    if (!/(^|\s)(bg-gold|border-gold|text-gold|ring-gold)/.test(cls)) continue;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (r.width === 0 && r.height === 0) continue;
    rows.push({
      tag: el.tagName,
      testid: el.getAttribute("data-testid"),
      goldClasses: cls.split(/\s+/).filter((c) => /(bg|border|text|ring)-gold/.test(c)),
      text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30),
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderTopColor: s.borderTopColor,
      borderLeftColor: s.borderLeftColor,
      borderLeftWidth: s.borderLeftWidth,
      opacity: s.opacity,
      disabled: el.disabled ?? null,
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
    });
  }
  return { accent: getComputedStyle(document.documentElement).getPropertyValue("--gc-accent").trim(), dataTheme: document.documentElement.dataset.theme ?? null, rows };
};

const out = { url: BASE, flow: {}, themes: {}, shots: [] };
const { statePath, api } = await login();
const browser = await chromium.launch();
const context = await browser.newContext({ storageState: statePath, locale: "zh-CN", viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.setDefaultTimeout(25_000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

const nodeIdByRun = new Map();
let sseDelayMs = 400;
await page.route("**/api/run-plan**", async (route) => {
  const req = route.request();
  const pathname = new URL(req.url()).pathname;
  if (pathname === "/api/run-plan" && req.method() === "POST") {
    const body = req.postDataJSON();
    const runId = "uiqa-r51-cta";
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
await page.waitForTimeout(3000);
await page.keyboard.press("Escape");
await dismissTutorial(page);
out.flow.templateHits = await openFreshProject(page, PROJECT_TEMPLATE);
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(1000);

out.flow.variant = await page.evaluate(INSTALL_VARIANT);
await page.locator('[data-testid="rf__node-generate"] .gc-node-header').click();
await page.waitForTimeout(700);
await page.getByRole("button", { name: "属性 / 结果" }).click();
await page.waitForTimeout(700);
out.flow.presetPanel = await page.getByText("服装提示词预设", { exact: true }).count();
await page.getByText("服装提示词预设", { exact: true }).click();
await page.waitForTimeout(500);
await page.getByRole("button", { name: /电商主图/ }).first().click();
await page.waitForTimeout(500);
await page.getByRole("button", { name: "确认应用" }).click();
await page.waitForTimeout(1200);
await closeDock(page);
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(900);

const runBtnSel = '[data-testid="rf__node-generate"] button';
const runBtn = page.locator(runBtnSel).filter({ hasText: /生成效果图|生成中/ }).first();
out.flow.runButtonBefore = await page.evaluate((sel) => {
  const b = Array.from(document.querySelectorAll(sel)).find((x) => /生成效果图/.test(x.textContent));
  return b ? { disabled: b.disabled, bg: getComputedStyle(b).backgroundColor, color: getComputedStyle(b).color } : null;
}, runBtnSel);
await runBtn.click();
await page.waitForTimeout(3500);
await page.getByRole("button", { name: "适应画布" }).click();
await page.waitForTimeout(900);

out.flow.runButtonAfter = await page.evaluate((sel) => {
  const b = Array.from(document.querySelectorAll(sel)).find((x) => /生成效果图|再次生成|生成中/.test(x.textContent));
  return b ? { text: b.textContent.trim(), disabled: b.disabled, bg: getComputedStyle(b).backgroundColor, color: getComputedStyle(b).color, opacity: getComputedStyle(b).opacity } : null;
}, runBtnSel);

for (const theme of THEMES) {
  await switchTheme(page, theme);
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const node = document.querySelector('[data-testid="rf__node-generate"]');
    const btns = Array.from(document.querySelectorAll('[data-testid="rf__node-generate"] button'));
    const b = btns.find((x) => /生成效果图/.test(x.textContent));
    const r = (el) => { const x = el.getBoundingClientRect(); return { x: x.x, y: x.y, width: x.width, height: x.height }; };
    return {
      accent: getComputedStyle(document.documentElement).getPropertyValue("--gc-accent").trim(),
      dataTheme: document.documentElement.dataset.theme ?? null,
      button: b ? { text: b.textContent.trim(), disabled: b.disabled, opacity: getComputedStyle(b).opacity, bg: getComputedStyle(b).backgroundColor, color: getComputedStyle(b).color, rect: r(b) } : null,
      nodeRect: node ? r(node) : null,
      resultImages: document.querySelectorAll('[data-testid="rf__node-generate"] img').length,
    };
  });
  const audit = await page.evaluate(GOLD_AUDIT);
  const shot = join(SHOTS, `p1-2-cta-${theme.id}-1280.png`);
  if (info.nodeRect) {
    const clip = clipFor(info.nodeRect, 1280, 720, 8);
    await page.screenshot({ path: shot, clip });
    info.clip = clip;
  } else {
    await page.screenshot({ path: shot });
  }
  info.shot = shot;
  info.goldAudit = audit;
  out.themes[theme.id] = info;
  out.shots.push(shot);
  console.log(theme.id, "accent", info.accent, "cta", JSON.stringify(info.button));
  console.log("  gold elements:", audit.rows.length, JSON.stringify(audit.rows.map((r) => [r.goldClasses.join(","), r.backgroundColor, r.color])).slice(0, 500));
}

out.errors = errors;
write("p1-2-bg-gold.json", out);
await api.dispose();
await context.close();
await browser.close();
console.log("pageerrors:", errors.length);
