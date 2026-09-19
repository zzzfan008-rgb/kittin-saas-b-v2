// 探针 7：主 CTA（RunButton）在白/护眼主题下的实际像素取证。
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

// 打开文生图项目（含结果节点与 CTA）
await page.getByRole("button", { name: "打开项目中心" }).click();
const center = page.getByRole("dialog", { name: "项目中心" });
await center.waitFor({ state: "visible" });
const cards = center.locator("button").filter({ hasText: "文生图" });
console.log("text-to-image project cards:", await cards.count());
if (await cards.count()) {
  await cards.first().click();
  await page.waitForTimeout(3000);
}
await page.keyboard.press("Escape");
await page.waitForTimeout(800);

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
    const buttons = Array.from(document.querySelectorAll(".react-flow__node button")).map((b) => {
      const r = b.getBoundingClientRect();
      const s = getComputedStyle(b);
      return { text: b.textContent.trim().slice(0, 16), bg: s.backgroundColor, color: s.color, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] };
    });
    return { theme: document.documentElement.getAttribute("data-theme"), accent: getComputedStyle(document.documentElement).getPropertyValue("--gc-accent").trim(), buttons };
  });
  out[theme.id] = info;
  const path = join(SHOTS, `cta-${theme.id}-1280.png`);
  await page.screenshot({ path });
  out[theme.id].screenshot = path;
  console.log(theme.id, JSON.stringify(info.buttons.slice(0, 6)));
}
writeFileSync(join(OUT, "results-cta.json"), JSON.stringify(out, null, 2));
await browser.close();
