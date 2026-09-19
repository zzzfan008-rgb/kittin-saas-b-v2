import { createRequire } from "node:module";
import { join } from "node:path";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const require = createRequire(join(REPO, "package.json"));
const { chromium } = require("playwright");
const BASE = "http://127.0.0.1:5411";

const browser = await chromium.launch();
const context = await browser.newContext({ locale: "zh-CN", viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
for (const theme of ["current", "white", "eye"]) {
  await page.goto(`${BASE}/?theme=${theme}`, { waitUntil: "networkidle" });
  await page.evaluate((t) => window.localStorage.setItem("garment-canvas-theme", t), theme);
  await page.goto(`${BASE}/?theme=${theme}`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="login-card"]');
  await page.waitForTimeout(300);
  const probe = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="login-card"]');
    const main = document.querySelector("main");
    return {
      url: location.href,
      dataThemeAttr: document.documentElement.getAttribute("data-theme"),
      localStorageTheme: window.localStorage.getItem("garment-canvas-theme"),
      prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
      htmlClass: document.documentElement.className,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      mainBg: main ? getComputedStyle(main).backgroundColor : null,
      cardBg: card ? getComputedStyle(card).backgroundColor : null,
      cardColor: card ? getComputedStyle(card).color : null,
      accentToken: getComputedStyle(document.documentElement).getPropertyValue("--gc-accent").trim(),
    };
  });
  console.log(theme, JSON.stringify(probe));
}
await browser.close();
