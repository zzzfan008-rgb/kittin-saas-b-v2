// 探针 8：把画布缩放到能看见主 CTA，按主题截取节点局部图（用于 CTA 配色取证）。
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
await page.waitForTimeout(1200);

const out = {};
for (const theme of [
  { id: "current", label: "曜黑·荧光绿" },
  { id: "white", label: "简白" },
  { id: "eye", label: "护眼绿" },
]) {
  await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp("^" + theme.label) }).click();
  await page.waitForTimeout(700);
  const info = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll(".react-flow__node button")).find((b) => b.textContent.includes("生成效果图") || b.textContent.includes("未验证不可运行"));
    const node = document.querySelector('[data-testid="rf__node-generate"]');
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)];
    };
    return {
      accent: getComputedStyle(document.documentElement).getPropertyValue("--gc-accent").trim(),
      runButton: btn ? { text: btn.textContent.trim(), bg: getComputedStyle(btn).backgroundColor, color: getComputedStyle(btn).color, opacity: getComputedStyle(btn).opacity, rect: r(btn) } : null,
      node: node ? r(node) : null,
      folderButton: (() => {
        const b = Array.from(document.querySelectorAll(".react-flow__node button")).find((x) => x.textContent.includes("保存全部到文件夹"));
        return b ? { bg: getComputedStyle(b).backgroundColor, opacity: getComputedStyle(b).opacity, rect: r(b), disabled: b.disabled } : null;
      })(),
    };
  });
  out[theme.id] = info;
  const path = join(SHOTS, `cta-node-${theme.id}-1280.png`);
  const viewport = page.viewportSize();
  if (info.node) {
    const [x, y, w, h] = info.node;
    const cx = Math.max(0, x - 6);
    const cy = Math.max(0, y - 6);
    await page.screenshot({ path, clip: { x: cx, y: cy, width: Math.max(1, Math.min(viewport.width - cx, w + 12)), height: Math.max(1, Math.min(viewport.height - cy, h + 12)) } });
  }
  out[theme.id].screenshot = path;
  console.log(theme.id, JSON.stringify(info));
}
writeFileSync(join(OUT, "results-cta-zoom.json"), JSON.stringify(out, null, 2));
await browser.close();
