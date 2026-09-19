// R-51 复验共用工具：隔离栈登录、主题切换、像素/样式快照。
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const BASE =
  process.env.UiqaBase ?? "http://127.0.0.1:5411";
export const API = process.env.UiqaApi ?? "http://127.0.0.1:3411";
export const OUT = "/tmp/gc-uiqa-r51";
export const SHOTS = join(OUT, "shots");
export const MEAS = join(OUT, "measurements");
mkdirSync(SHOTS, { recursive: true });
mkdirSync(MEAS, { recursive: true });

export const nodeRequire = createRequire("/Users/lionfan/dev/kittin-saas-b-v2/package.json");

export const THEMES = [
  { id: "current", label: "曜黑·荧光绿" },
  { id: "white", label: "简白" },
  { id: "eye", label: "护眼绿" },
];

export function md5(path) {
  return createHash("md5").update(readFileSync(path)).digest("hex");
}

export function write(name, data) {
  writeFileSync(join(MEAS, name), JSON.stringify(data, null, 2));
}

// 单设备会话：每次登录吊销旧会话 → 每个阶段前重新登录。
export async function login({ accountId = "uiqa-v4-admin" } = {}) {
  const { request } = nodeRequire("playwright");
  const api = await request.newContext({ baseURL: API });
  for (const password of ["UiqaV4Final5678", "UiqaV4Initial1234"]) {
    const res = await api.post("/api/auth/login", { data: { accountId, password } });
    if (res.ok()) {
      const body = await res.json().catch(() => ({}));
      if (body?.mustChangePassword) {
        const change = await api.post("/api/auth/change-password", {
          data: { currentPassword: password, newPassword: "UiqaV4Final5678" },
        });
        if (!change.ok()) throw new Error("change-password failed " + change.status());
      }
      const statePath = join(OUT, "auth.json");
      await api.storageState({ path: statePath });
      return { statePath, password, api };
    }
  }
  throw new Error("login failed: 两个候选口令均 401");
}

// 主题切换（顶栏菜单）
export async function switchTheme(page, theme) {
  await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp("^" + theme.label) }).click();
  await page.waitForTimeout(600);
}

// 教程弹层关掉（modal 会让外部 locator 全部 not found）
export async function dismissTutorial(page) {
  for (let i = 0; i < 6; i += 1) {
    const next = page.getByRole("button", { name: /下一步|完成教程/ });
    if (await next.count() === 0 || !(await next.first().isVisible().catch(() => false))) return;
    await next.first().click();
    await page.waitForTimeout(300);
  }
}

export async function closeDock(page) {
  for (let i = 0; i < 3; i += 1) {
    const w = await page.evaluate(() => {
      const el = document.querySelector('aside[aria-label="工作台左侧面板"]');
      return el ? Math.round(el.getBoundingClientRect().width) : 0;
    });
    if (w === 0) return;
    await page.getByRole("button", { name: "属性 / 结果" }).click();
    await page.waitForTimeout(450);
  }
}

// 用内置模板新建项目（保证空槽等初始态可复现），返回命中的模板卡数量。
export async function openFreshProject(page, matcher) {
  await page.getByRole("button", { name: "打开项目中心" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await center.waitFor({ state: "visible" });
  const tab = center.getByRole("tab", { name: "内置模板" });
  if (await tab.count()) await tab.first().click();
  else await center.getByText("内置模板", { exact: true }).first().click();
  await page.waitForTimeout(900);
  const cards = center.locator("button").filter({ hasText: matcher });
  const n = await cards.count();
  if (n) {
    await cards.first().click();
    await page.waitForTimeout(3500);
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  return n;
}

export function clipFor(rect, vw, vh, pad = 10) {
  const x = Math.max(0, Math.floor(rect.x - pad));
  const y = Math.max(0, Math.floor(rect.y - pad));
  return {
    x,
    y,
    width: Math.max(1, Math.min(vw - x, Math.ceil(rect.width + pad * 2))),
    height: Math.max(1, Math.min(vh - y, Math.ceil(rect.height + pad * 2))),
  };
}
