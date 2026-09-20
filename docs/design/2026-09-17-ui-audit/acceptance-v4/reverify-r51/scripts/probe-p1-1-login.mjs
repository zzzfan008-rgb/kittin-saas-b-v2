// R-51 P1-1 复验：登录页在 white/eye 下是否真的换肤（截图字节 + 像素 + 计算样式取证）。
import { join } from "node:path";
import { BASE, THEMES, md5, nodeRequire, SHOTS, write, login, dismissTutorial, switchTheme } from "./lib.mjs";

const { chromium } = nodeRequire("playwright");

const LOGIN_PROBE = () => {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const read = (n) => cs.getPropertyValue(n).trim();
  const card = document.querySelector('[data-testid="login-card"]');
  const style = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderColor: s.borderColor,
      backgroundImage: s.backgroundImage.slice(0, 120),
      boxShadow: s.boxShadow.slice(0, 140),
    };
  };
  const bodyStyle = getComputedStyle(document.body);
  return {
    dataTheme: root.dataset.theme ?? null,
    localStorageTheme: (() => {
      try {
        return window.localStorage.getItem("garment-canvas-theme");
      } catch {
        return "err";
      }
    })(),
    tokens: {
      shell: read("--gc-shell"),
      canvas: read("--gc-canvas"),
      panel: read("--gc-panel"),
      accent: read("--gc-accent"),
      text: read("--gc-text"),
      colorGold: read("--color-gold"),
    },
    body: { backgroundColor: bodyStyle.backgroundColor, color: bodyStyle.color },
    card: style(card),
    brandAside: style(document.querySelector("aside[aria-hidden='true']")),
  };
};

const out = { target: BASE, themes: {}, md5: {}, logout: {} };
const browser = await chromium.launch();

// 阶段 1：未认证（localStorage 预置主题）——复刻 R-46 手法
for (const theme of THEMES) {
  const context = await browser.newContext({ locale: "zh-CN", timezoneId: "Asia/Shanghai", viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/?theme=${theme.id}`, { waitUntil: "networkidle" });
  await page.evaluate((t) => window.localStorage.setItem("garment-canvas-theme", t), theme.id);
  await page.goto(`${BASE}/?theme=${theme.id}`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="login-card"]', { timeout: 20_000 });
  await page.waitForTimeout(500);
  const shot = join(SHOTS, `p1-1-login-${theme.id}-1280.png`);
  await page.screenshot({ path: shot });
  const probe = await page.evaluate(LOGIN_PROBE);
  const hash = md5(shot);
  out.themes[theme.id] = { ...probe, shot, md5: hash, errors };
  out.md5[theme.id] = hash;
  // 聚焦特写（账号输入框）
  const input = page.locator('input:not([type="hidden"])').first();
  if (await input.count()) {
    const box = await input.boundingBox();
    if (box) {
      await input.focus();
      await page.waitForTimeout(250);
      const clip = { x: Math.max(0, Math.round(box.x - 12)), y: Math.max(0, Math.round(box.y - 12)), width: Math.round(box.width + 24), height: Math.round(box.height + 24) };
      await page.screenshot({ path: join(SHOTS, `p1-1-login-focus-${theme.id}-1280.png`), clip });
    }
  }
  await context.close();
}
out.md5Equal = out.md5.current === out.md5.white && out.md5.white === out.md5.eye;

// 阶段 2：从简白工作台登出后的登录页（真实用户路径）
{
  const { statePath, api } = await login();
  const context = await browser.newContext({ storageState: statePath, locale: "zh-CN", viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25_000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await dismissTutorial(page);
  await switchTheme(page, THEMES[1]); // 简白
  const beforeLogout = await page.evaluate(() => ({
    dataTheme: document.documentElement.dataset.theme ?? null,
    localStorageTheme: window.localStorage.getItem("garment-canvas-theme"),
  }));
  // 登出
  const userMenu = page.getByRole("button", { name: /账号|用户|菜单|设置/ }).first();
  let logoutOk = false;
  try {
    await userMenu.click();
    await page.waitForTimeout(500);
    await page.getByRole("menuitem", { name: "退出登录" }).click();
    logoutOk = true;
  } catch {
    try {
      await page.getByRole("button", { name: "退出登录" }).click();
      logoutOk = true;
    } catch {}
  }
  await page.waitForTimeout(2500);
  if (logoutOk) {
    await page.waitForSelector('[data-testid="login-card"]', { timeout: 20_000 });
    await page.waitForTimeout(500);
    const shot = join(SHOTS, "p1-1-login-after-logout-white-1280.png");
    await page.screenshot({ path: shot });
    out.logout = { beforeLogout, afterLogout: await page.evaluate(LOGIN_PROBE), shot, md5: md5(shot), errors };
  } else {
    out.logout = { beforeLogout, error: "未能定位登出入口", errors };
  }
  await api.dispose();
  await context.close();
}

await browser.close();
write("p1-1-login-theme.json", out);
console.log("md5:", JSON.stringify(out.md5), "equal:", out.md5Equal);
for (const t of THEMES) {
  const v = out.themes[t.id];
  console.log(t.id, "data-theme=", v.dataTheme, "accent=", v.tokens.accent, "cardBg=", v.card?.backgroundColor, "bodyBg=", v.body.backgroundColor);
}
console.log("logout:", JSON.stringify(out.logout.afterLogout ?? out.logout).slice(0, 400));
console.log("pageerrors:", THEMES.map((t) => `${t.id}:${out.themes[t.id].errors.length}`).join(" "));
