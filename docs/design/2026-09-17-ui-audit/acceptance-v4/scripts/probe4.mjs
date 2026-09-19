// 探针 4：① 登录页键盘焦点环（暗色卡）像素对比度；② 1024 登录页品牌区裁切检查；③ reduced-motion 下的过渡清单。
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
const out = {};

const browser = await chromium.launch();

// --- 登录页（未认证）：键盘焦点环 + 1024 品牌区裁切
{
  const context = await browser.newContext({ locale: "zh-CN", viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.addInitScript(PROBES);
  await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="login-card"]');
  await page.waitForTimeout(500);
  const account = page.getByRole("textbox", { name: "账号" });
  await account.click();
  await page.waitForTimeout(400);
  out.loginFocus = await page.evaluate(() => {
    const input = document.querySelector('input[name="accountId"]');
    const s = getComputedStyle(input);
    const r = input.getBoundingClientRect();
    const wrap = input.parentElement;
    const ws = getComputedStyle(wrap);
    return {
      inputBoxShadow: s.boxShadow,
      inputOutline: s.outline,
      inputBorder: s.borderTopColor,
      wrapBoxShadow: ws.boxShadow,
      wrapBorder: ws.borderTopColor,
      rect: { x: r.x, y: r.y, width: r.width, height: r.height },
      focusVisible: input.matches(":focus-visible"),
      cardBg: getComputedStyle(document.querySelector('[data-testid="login-card"]')).backgroundColor,
    };
  });
  await page.screenshot({ path: join(OUT, "shots", "login-focus-account-1280.png"), clip: { x: Math.max(0, Math.round(out.loginFocus.rect.x) - 12), y: Math.max(0, Math.round(out.loginFocus.rect.y) - 12), width: Math.round(out.loginFocus.rect.width) + 24, height: Math.round(out.loginFocus.rect.height) + 24 } });
  await page.keyboard.press("Tab");
  out.loginTabOrder = await page.evaluate(() => document.activeElement ? document.activeElement.tagName + ":" + (document.activeElement.getAttribute("name") || document.activeElement.textContent.trim().slice(0, 12)) : null);
  await context.close();
}

// --- 1024 登录页：品牌区裁切
{
  const context = await browser.newContext({ locale: "zh-CN", viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();
  await page.addInitScript(PROBES);
  await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="login-card"]');
  await page.waitForTimeout(500);
  out.login1024 = await page.evaluate(() => {
    const pane = document.querySelector("aside[aria-hidden='true']");
    const pr = pane.getBoundingClientRect();
    const clipped = [];
    for (const el of pane.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > pr.right + 0.5 || r.left < pr.left - 0.5 || r.bottom > pr.bottom + 0.5) {
        clipped.push({ tag: el.tagName, text: (el.textContent || "").trim().slice(0, 26), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], cls: String(el.className).slice(0, 70) });
      }
    }
    const card = document.querySelector('[data-testid="login-card"]');
    const cr = card.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      paneRect: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)],
      cardRect: [Math.round(cr.left), Math.round(cr.top), Math.round(cr.right), Math.round(cr.bottom)],
      docScrollWidth: doc.scrollWidth,
      viewport: [window.innerWidth, window.innerHeight],
      paneOverflowCount: clipped.length,
      paneOverflow: clipped.slice(0, 8),
      cardScrollHeight: card.scrollHeight,
      cardClientHeight: card.clientHeight,
      headingRect: (() => {
        const h = pane.querySelector("h1, h2, p");
        if (!h) return null;
        const r = h.getBoundingClientRect();
        return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
      })(),
      paneScrollHeight: pane.scrollHeight,
      paneClientHeight: pane.clientHeight,
    };
  });
  await page.screenshot({ path: join(OUT, "shots", "login-1024-full.png") });
  await context.close();
}

// --- reduced-motion 过渡清单（工作台）
{
  const api = await request.newContext({ baseURL: API });
  const login = await api.post("/api/auth/login", { data: { accountId: "uiqa-v4-admin", password: "UiqaV4Final5678" } });
  if (!login.ok()) throw new Error("login failed " + login.status());
  await api.storageState({ path: join(OUT, "auth.json") });
  const context = await browser.newContext({ storageState: join(OUT, "auth.json"), locale: "zh-CN", viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.addInitScript(PROBES);
  await page.goto(`${WEB}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.__gcAnim());
  await page.getByRole("button", { name: "属性 / 结果" }).click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "属性 / 结果" }).click();
  await page.waitForTimeout(800);
  const node = page.locator(".react-flow__node").first();
  await node.hover();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  const events = await page.evaluate(() => window.__gcAnimLog);
  out.reduceMotion = {
    total: events.length,
    animations: events.filter((e) => e.phase === "start" || e.phase === "end"),
    transitions: events.filter((e) => e.phase === "transition").map((e) => e.name),
  };
  out.reduceMotion.transitionNames = [...new Set(out.reduceMotion.transitions)];
  await context.close();
}

writeFileSync(join(OUT, "results-probe4.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify({ loginFocus: out.loginFocus, loginTabOrder: out.loginTabOrder, login1024: { ...out.login1024, paneOverflow: out.login1024.paneOverflow }, reduceMotion: out.reduceMotion }, null, 1).slice(0, 3000));
await browser.close();
