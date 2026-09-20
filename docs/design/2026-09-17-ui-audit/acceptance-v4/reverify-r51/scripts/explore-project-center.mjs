// 探查项目中心：列出可用项目卡与内置模板按钮（用于在隔离库里拿到「空槽」的新画布）。
import { BASE, nodeRequire, login, dismissTutorial } from "./lib.mjs";

const { chromium } = nodeRequire("playwright");
const { statePath, api } = await login();
const browser = await chromium.launch();
const context = await browser.newContext({ storageState: statePath, locale: "zh-CN", viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.setDefaultTimeout(25_000);
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.keyboard.press("Escape");
await dismissTutorial(page);
await page.getByRole("button", { name: "打开项目中心" }).click();
const center = page.getByRole("dialog", { name: "项目中心" });
await center.waitFor({ state: "visible" });
await page.waitForTimeout(800);
const dump = await center.evaluate((el) => ({
  text: el.textContent.replace(/\s+/g, " ").slice(0, 400),
  buttons: [...el.querySelectorAll("button")].map((b) => ({ text: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60), aria: b.getAttribute("aria-label"), cls: String(b.className).slice(0, 80) })),
  sections: [...el.querySelectorAll("h1,h2,h3,[role=heading]")].map((h) => h.textContent.trim().slice(0, 40)),
}));
console.log(JSON.stringify(dump, null, 1).slice(0, 4000));
await page.screenshot({ path: "/tmp/gc-uiqa-r51/shots/project-center.png" });
await api.dispose();
await context.close();
await browser.close();
