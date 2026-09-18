import { mkdirSync } from "node:fs";
import { join } from "node:path";

// Standalone three-theme × three-width screenshot harness for P0 UI sign-off.
// Uses the same authenticated session that auth.setup.ts produces.

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
const authStatePath = process.env.E2E_AUTH_STATE_PATH;
const outDir = process.env.SHOT_DIR ?? "/tmp/gc-p0-shots";

if (!authStatePath) {
  throw new Error("E2E_AUTH_STATE_PATH is required");
}

const { chromium } = await import("playwright");
mkdirSync(outDir, { recursive: true });

const themes = [
  { id: "current", label: "dark" },
  { id: "white", label: "white" },
  { id: "eye", label: "eye" },
];
const widths = [1024, 1280, 1440];

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    storageState: authStatePath,
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  // Capture the login page first (no auth needed) at 1280 for reference.
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(outDir, "login-1280.png"), fullPage: false });
  console.log("shot: login-1280.png");

  await page.goto(baseURL, { waitUntil: "networkidle" });

  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 1024 ? 768 : width === 1280 ? 720 : 900 });
    for (const theme of themes) {
      // Switch theme via the TopBar theme picker.
      const themeTrigger = page.getByRole("button", { name: /^切换主题，当前为/ });
      await themeTrigger.click();
      await page.getByRole("menuitemradio", { name: new RegExp(`^${theme.label === "dark" ? "经典暗金" : theme.label === "white" ? "简白" : "护眼绿"}`) }).click();
      await page.waitForTimeout(300);
      const file = join(outDir, `${theme.id}-${width}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`shot: ${theme.id}-${width}.png`);
    }
  }

  await context.close();
} finally {
  await browser.close();
}
console.log(`All screenshots saved to ${outDir}`);
