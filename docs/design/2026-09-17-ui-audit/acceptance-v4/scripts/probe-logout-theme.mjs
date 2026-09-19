// 探针 3：① 应用内切换主题后退出登录 → 登录页是否跟随主题；② 已绑定变体的 RunButton 聚焦可见性。
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

const api = await request.newContext({ baseURL: API });

async function freshAuth() {
  const res = await api.post("/api/auth/login", { data: { accountId: "uiqa-v4-admin", password: "UiqaV4Final5678" } });
  if (!res.ok()) throw new Error("login failed " + res.status());
  await api.storageState({ path: join(OUT, "auth.json") });
}
await freshAuth();

const browser = await chromium.launch();
const out = { loginAfterLogout: [], runButton: {}, pageErrors: [] };

for (const theme of [
  { id: "white", label: "简白" },
  { id: "eye", label: "护眼绿" },
]) {
  const context = await browser.newContext({ storageState: join(OUT, "auth.json"), locale: "zh-CN", viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25_000);
  await page.addInitScript(PROBES);
  page.on("pageerror", (e) => out.pageErrors.push(String(e).slice(0, 200)));
  await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.keyboard.press("Escape");
  const preState = await page.evaluate(() => ({
    isLogin: Boolean(document.querySelector('[data-testid="login-card"]')),
    hasThemeTrigger: Boolean(Array.from(document.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "").startsWith("切换主题"))),
    text: document.body.innerText.replace(/\s+/g, " ").slice(0, 160),
  }));
  console.log("pre-state", theme.id, JSON.stringify(preState));
  if (preState.isLogin) {
    await page.screenshot({ path: join(OUT, "shots", `debug-unexpected-login-${theme.id}.png`) });
    throw new Error("unexpected login page in probe-logout-theme");
  }

  // 应用内切换主题
  await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp("^" + theme.label) }).click();
  await page.waitForTimeout(700);
  const beforeLogout = await page.evaluate(() => window.__gcTheme());
  await page.screenshot({ path: join(OUT, "shots", `theme-applied-${theme.id}-1280.png`) });

  // 打开文生图项目 → 检查已绑定变体的 RunButton 聚焦样式
  if (theme.id === "white") {
    await page.getByRole("button", { name: "打开项目中心" }).click();
    const center = page.getByRole("dialog", { name: "项目中心" });
    await center.waitFor({ state: "visible" });
    const cards = center.locator("button").filter({ hasText: "文生图" });
    out.runButton.cards = await cards.count();
    if (out.runButton.cards > 0) {
      await cards.first().click();
      await page.waitForTimeout(2500);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
      out.runButton.state = await page.evaluate(() => {
        const node = Array.from(document.querySelectorAll(".react-flow__node")).find((n) => n.textContent.includes("文生图"));
        if (!node) return { found: false };
        const btn = Array.from(node.querySelectorAll("button")).find((b) => b.textContent.trim().length > 0);
        if (!btn) return { found: true, button: null };
        btn.focus();
        const s = getComputedStyle(btn);
        return {
          found: true,
          text: btn.textContent.trim().slice(0, 20),
          disabled: btn.disabled,
          focused: document.activeElement === btn,
          boxShadow: s.boxShadow,
          outline: s.outline,
          borderTopColor: s.borderTopColor,
          cls: String(btn.className).slice(0, 160),
        };
      });
    }
  }

  // 回到应用内 → 退出登录
  await page.getByRole("button", { name: /^账户菜单/ }).click();
  await page.waitForTimeout(400);
  await page.getByRole("menuitem", { name: "退出登录" }).click();
  await page.waitForTimeout(2500);
  const afterLogout = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="login-card"]');
    const cs = getComputedStyle(document.documentElement);
    return {
      url: location.href,
      dataThemeAttr: document.documentElement.getAttribute("data-theme"),
      localStorageTheme: window.localStorage.getItem("garment-canvas-theme"),
      accentToken: cs.getPropertyValue("--gc-accent").trim(),
      shellToken: cs.getPropertyValue("--gc-shell").trim(),
      cardBg: card ? getComputedStyle(card).backgroundColor : null,
      cardColor: card ? getComputedStyle(card).color : null,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      cardPresent: Boolean(card),
    };
  });
  await page.screenshot({ path: join(OUT, "shots", `login-after-logout-${theme.id}-1280.png`) });
  out.loginAfterLogout.push({ theme: theme.id, beforeLogout, afterLogout });

  // 再硬刷新一次，确认主题是否仍然生效（跨 reload）
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const afterReload = await page.evaluate(() => ({
    dataThemeAttr: document.documentElement.getAttribute("data-theme"),
    localStorageTheme: window.localStorage.getItem("garment-canvas-theme"),
    cardBg: (() => {
      const card = document.querySelector('[data-testid="login-card"]');
      return card ? getComputedStyle(card).backgroundColor : null;
    })(),
  }));
  out.loginAfterLogout[out.loginAfterLogout.length - 1].afterReload = afterReload;
  console.log(theme.id, JSON.stringify(out.loginAfterLogout[out.loginAfterLogout.length - 1]));
  await context.close();
  writeFileSync(join(OUT, "results-logout-theme.json"), JSON.stringify(out, null, 2));
  await freshAuth();
}

writeFileSync(join(OUT, "results-logout-theme.json"), JSON.stringify(out, null, 2));
console.log("runButton:", JSON.stringify(out.runButton));
console.log("pageErrors:", out.pageErrors.length);
await browser.close();
