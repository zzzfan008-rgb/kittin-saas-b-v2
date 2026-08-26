import { expect, test } from "./fixtures";

interface InitialDraftBody {
  draft: null | {
    id: string;
    name: string;
    revision: number;
  };
}

test("hard refresh, a second tab, and relogin restore the same initial draft", async ({ page }) => {
  const accountId = process.env.E2E_ACCOUNT_ID;
  const password = process.env.E2E_PASSWORD;
  if (!accountId || !password) throw new Error("Missing E2E login credentials");

  const readDraft = async () => {
    const response = await page.context().request.get("/api/projects/initial-draft");
    expect(response.ok()).toBeTruthy();
    return (await response.json() as InitialDraftBody).draft;
  };

  await page.goto("/");
  const projectName = page.getByPlaceholder("项目名称");
  await expect(projectName).toBeVisible();
  const initial = await readDraft();
  expect(initial).not.toBeNull();
  if (!initial) throw new Error("Initial draft was not bootstrapped");

  const editedName = `E2E 未保存草稿 ${Date.now()}`;
  await projectName.fill(editedName);
  await projectName.blur();
  await expect.poll(async () => (await readDraft())?.name).toBe(editedName);
  const synchronized = await readDraft();
  expect(synchronized?.id).toBe(initial.id);

  await page.reload();
  await expect(page.getByPlaceholder("项目名称")).toHaveValue(editedName);
  expect((await readDraft())?.id).toBe(initial.id);

  const secondPage = await page.context().newPage();
  await secondPage.goto("/");
  await expect(secondPage.getByPlaceholder("项目名称")).toHaveValue(editedName);
  const secondTabDraft = await secondPage.context().request.get("/api/projects/initial-draft");
  expect(secondTabDraft.ok()).toBeTruthy();
  expect(((await secondTabDraft.json()) as InitialDraftBody).draft?.id).toBe(initial.id);
  await secondPage.close();

  await page.getByRole("button", { name: /^账户菜单：/ }).click();
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page.getByRole("heading", { name: "登录服装设计工作台" })).toBeVisible();
  await page.getByRole("textbox", { name: "账号" }).fill(accountId);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page.getByPlaceholder("项目名称")).toHaveValue(editedName);
  const afterRelogin = await readDraft();
  expect(afterRelogin?.id).toBe(initial.id);
  expect(afterRelogin?.name).toBe(editedName);
});
