import { expect, test } from "./fixtures";

test("login form exposes its validation and errors", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "登录工作台" })).toBeVisible();
  const account = page.getByRole("textbox", { name: "账号" });
  const password = page.getByLabel("密码");
  const submit = page.getByRole("button", { name: "登录" });

  await expect(account).toBeFocused();
  await expect(submit).toBeDisabled();
  await account.fill(process.env.E2E_ACCOUNT_ID ?? "e2e-admin");
  await password.fill("not-the-e2e-password");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "显示输入内容" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "隐藏输入内容" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole("alert")).toHaveText("账号或密码错误");
});

test("login V4 split layout: brand pane + token card at desktop widths", async ({ page }) => {
  const viewports = [
    { width: 1024, height: 768 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const card = page.getByTestId("login-card");
    await expect(card).toBeVisible();

    // 品牌区（左侧）在所有验收宽度可见
    const brandPane = page.locator("aside[aria-hidden='true']");
    await expect(brandPane).toBeVisible();
    await expect(page.getByRole("heading", { name: "让每一张面料，" })).toBeVisible();
    await expect(page.getByText("无限画布")).toBeVisible();

    const cardBox = await card.boundingBox();
    const brandBox = await brandPane.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(brandBox).not.toBeNull();
    if (!cardBox || !brandBox) throw new Error("login geometry is unavailable");

    // 登录卡在右侧列内，不溢出视口
    expect(cardBox.x).toBeGreaterThan(viewport.width * 0.5);
    expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(viewport.width - 24);
    expect(cardBox.width).toBeGreaterThanOrEqual(340);
    expect(cardBox.width).toBeLessThanOrEqual(400);
    expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(viewport.height - 24);

    // 品牌区占左侧（x 起点小于视口一半）
    expect(brandBox.x).toBeLessThan(viewport.width * 0.5);
    expect(brandBox.width).toBeGreaterThan(viewport.width * 0.4);

    // 无横向溢出
    const documentMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(documentMetrics.scrollWidth).toBeLessThanOrEqual(documentMetrics.viewportWidth);

    // 登录卡使用主题 token（不透明面板色，非旧玻璃拟态）
    const cardStyle = await card.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, backdropFilter: style.backdropFilter };
    });
    expect(cardStyle.backgroundColor).not.toContain("0.72");
    expect(cardStyle.backdropFilter === "none" || cardStyle.backdropFilter === "").toBe(true);

    // 输入框可见且可聚焦
    const accountInput = page.locator('input[name="accountId"]');
    await expect(accountInput).toBeVisible();
    await accountInput.focus();
    await expect(accountInput).toBeFocused();

    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
  }
});
