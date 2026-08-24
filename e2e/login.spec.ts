import { expect, test } from "./fixtures";

test("login form exposes its validation and errors", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "登录服装设计工作台" })).toBeVisible();
  const account = page.getByRole("textbox", { name: "账号" });
  const password = page.getByLabel("密码");
  const submit = page.getByRole("button", { name: "登录" });

  await expect(account).toBeFocused();
  await expect(submit).toBeDisabled();
  await account.fill(process.env.E2E_ACCOUNT_ID ?? "e2e-admin");
  await password.fill("not-the-e2e-password");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole("alert")).toHaveText("账号或密码错误");
});
