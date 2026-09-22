import { expect, test } from "./fixtures";

function parseBundledAssets(html: string) {
  const jsMatch = /<script[^>]+src=\"(\/assets\/[^\"]+\.js)\"/i.exec(html)?.[1] ?? null;
  const cssMatch = /<link[^>]+href=\"(\/assets\/[^\"]+\.css)\"/i.exec(html)?.[1] ?? null;
  return { js: jsMatch, css: cssMatch };
}

test("production bundle serves hashed assets and the authenticated desktop shell", async ({ page, request }) => {
  const failedScriptResponses: string[] = [];
  page.on("response", (assetResponse) => {
    if (assetResponse.request().resourceType() === "script" && assetResponse.status() >= 400) {
      failedScriptResponses.push(`${assetResponse.status()} ${assetResponse.url()}`);
    }
  });

  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ ok: true, status: "alive" });

  const ready = await request.get("/api/ready");
  expect(ready.ok()).toBeTruthy();
  expect((await ready.json()).mode).toBe("full");

  const response = await request.get("/", { headers: { accept: "text/html" } });
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  const assets = parseBundledAssets(html);
  expect(assets.js, "production html should expose hashed js bundle").toMatch(/\/assets\/[^"]+-[A-Za-z0-9_-]{8,}\.js$/);
  expect(assets.css, "production html should expose hashed css bundle").toMatch(/\/assets\/[^"]+-[A-Za-z0-9_-]{8,}\.css$/);

  const jsResponse = await request.get(assets.js!);
  const cssResponse = await request.get(assets.css!);
  expect(jsResponse.status()).toBe(200);
  expect(cssResponse.status()).toBe(200);
  expect(jsResponse.headers()["cache-control"]).toContain("immutable");
  expect(cssResponse.headers()["cache-control"]).toContain("immutable");

  const missingAsset = await request.get("/assets/production-smoke-missing.js");
  expect(missingAsset.status()).toBe(404);

  await page.goto("/");
  // 2026-09-25 登录语义（决策 4）：冷启动 0 页签 → 「空工作区」引导；先建一个本地空白页签。
  const emptyGuide = page.getByRole("region", { name: "空工作区" });
  await expect(emptyGuide).toBeVisible();
  await emptyGuide.getByRole("button", { name: "新建项目" }).click();
  await expect(page.getByRole("navigation", { name: "工作台左侧工具" })).toBeVisible();
  await page.getByRole("button", { name: "打开项目中心" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await expect(center).toBeVisible();
  // 2026-09-25 决策：项目中心只留「最近项目」，模板入口迁到左侧工作流二级菜单。
  await expect(center.getByText("最近项目", { exact: true })).toBeVisible();
  await expect(center.getByRole("button", { name: "新建项目" })).toBeVisible();
  await center.getByRole("button", { name: "关闭项目中心" }).click();
  // 生产包里二级菜单（及其 lazy chunk）必须能展开。
  const rail = page.getByRole("navigation", { name: "工作台左侧工具" });
  await rail.getByRole("button", { name: "AI 换装工作流" }).hover();
  await expect(page.getByRole("menu", { name: "AI 换装工作流" })).toBeVisible();
  expect(failedScriptResponses, "lazy production chunks should load without HTTP errors").toEqual([]);
});

test("production smoke covers static fallback route", async ({ page, request }) => {
  const fallback = await request.get("/project-center", { headers: { accept: "text/html" } });
  expect(fallback.status()).toBe(200);
  expect(await fallback.text()).toContain("/assets/");

  await page.goto("/static/not-found-route");
  await expect(page).toHaveURL("/static/not-found-route");
  // 决策 4 / 决策 2：深链冷启动 = 0 页签 → 落「空工作区」引导，此时左侧工具栏按设计不渲染。
  // 这条要验的是「静态回退把生产包起起来了」，所以锚点用空工作区引导。
  await expect(page.getByRole("region", { name: "空工作区" })).toBeVisible();
});
