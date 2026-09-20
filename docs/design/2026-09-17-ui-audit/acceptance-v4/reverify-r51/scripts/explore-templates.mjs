// 探查「内置模板」tab 的模板按钮文案（用于新建空画布）。
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
const tab = center.getByRole("tab", { name: "内置模板" });
if (await tab.count()) await tab.first().click();
else await center.getByText("内置模板", { exact: true }).first().click();
await page.waitForTimeout(900);
const dump = await center.evaluate((el) => ({
  text: el.textContent.replace(/\s+/g, " ").slice(0, 600),
  buttons: [...el.querySelectorAll("button")].map((b) => ({ text: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80), aria: b.getAttribute("aria-label") })),
}));
console.log(JSON.stringify(dump.buttons, null, 1).slice(0, 3000));
console.log("TEXT:", dump.text);
await page.screenshot({ path: "/tmp/gc-uiqa-r51/shots/project-center-templates.png" });
await api.dispose();
await context.close();
await browser.close();
