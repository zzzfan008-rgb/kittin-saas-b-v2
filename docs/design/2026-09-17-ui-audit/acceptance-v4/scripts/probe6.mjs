// 探针 6：Inspector（选中节点）+ 缩略图槽空态/填充态 × 三主题（1280）补拍。
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROBES } from "./probes.mjs";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const require = createRequire(join(REPO, "package.json"));
const { chromium, request } = require("playwright");
const WEB = "http://127.0.0.1:5411";
const API = "http://127.0.0.1:3411";
const OUT = "/tmp/gc-uiqa-v4";
const SHOTS = join(OUT, "shots");

const api = await request.newContext({ baseURL: API });
const login = await api.post("/api/auth/login", { data: { accountId: "uiqa-v4-admin", password: "UiqaV4Final5678" } });
if (!login.ok()) throw new Error("login failed " + login.status());
await api.storageState({ path: join(OUT, "auth.json") });

const browser = await chromium.launch();
const context = await browser.newContext({ storageState: join(OUT, "auth.json"), locale: "zh-CN", viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.setDefaultTimeout(25_000);
await page.addInitScript(PROBES);
await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.keyboard.press("Escape");

const out = {};
for (const theme of [
  { id: "current", label: "曜黑·荧光绿" },
  { id: "white", label: "简白" },
  { id: "eye", label: "护眼绿" },
]) {
  // 选中图片节点（点节点头部，避免误触节点内按钮）
  const node = page.locator('[data-testid^="rf__node-pattern"] .gc-node-header').first();
  if (await node.count()) {
    await node.click();
    await page.waitForTimeout(800);
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp("^" + theme.label) }).click();
  await page.waitForTimeout(700);

  // 确保 Inspector 打开
  const aside = await page.evaluate(() => Math.round(document.querySelector('aside[aria-label="工作台左侧面板"]').getBoundingClientRect().width));
  if (aside === 0) {
    await page.getByRole("button", { name: "属性 / 结果" }).click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: join(SHOTS, `panel-inspector-node-${theme.id}-1280.png`) });

  // 空槽 / 已填充槽 的局部特写
  const slots = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".gc-node-card")).map((card, i) => {
      const el = card.querySelector(".aspect-\\[4\\/3\\]") || card.querySelector("img");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const filled = Boolean(card.querySelector('img[alt="已上传图片"]'));
      return { i, filled, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] };
    }).filter(Boolean),
  );
  out[theme.id] = { slots };
  for (const slot of slots) {
    const [x, y, w, h] = slot.rect;
    if (w === 0 || h === 0) continue;
    if (y >= 720 || x >= 1280 || x + w <= 0 || y + h <= 0) continue;
    const cx = Math.max(0, x - 8);
    const cy = Math.max(0, y - 8);
    const clip = { x: cx, y: cy, width: Math.max(1, Math.min(1280 - cx, w + 16)), height: Math.max(1, Math.min(720 - cy, h + 16)) };
    await page.screenshot({ path: join(SHOTS, `slot-${slot.filled ? "filled" : "empty"}-${theme.id}-1280.png`), clip });
  }
  console.log(theme.id, JSON.stringify(slots));
  // 关闭 Inspector，恢复默认视图
  await page.getByRole("button", { name: "属性 / 结果" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(SHOTS, `canvas-pattern-nodock-${theme.id}-1280.png`) });
}
writeFileSync(join(OUT, "results-probe6.json"), JSON.stringify(out, null, 2));
await browser.close();
console.log("probe6 done");
