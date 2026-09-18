import { chromium } from "playwright";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3210";
const accountId = process.env.E2E_ACCOUNT_ID ?? "e2e-admin";
const initialPassword = process.env.E2E_INITIAL_PASSWORD ?? "E2eInitial1234";
const password = process.env.E2E_PASSWORD ?? "E2eFinal5678";
const authStatePath = process.env.E2E_AUTH_STATE_PATH ?? "/tmp/gc-p0-shots/auth.json";

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
  });
  const page = await context.newPage();

  let currentPassword = password;
  let response = await context.request.post(`${baseURL}/api/auth/login`, {
    data: { accountId, password },
  });

  if (response.status() === 401) {
    currentPassword = initialPassword;
    response = await context.request.post(`${baseURL}/api/auth/login`, {
      data: { accountId, password: initialPassword },
    });
  }

  const loginBody = await response.json();
  console.log("login status:", response.status(), "body:", JSON.stringify(loginBody));
  if (!response.ok()) {
    // try the other password before giving up
    const other = currentPassword === password ? initialPassword : password;
    response = await context.request.post(`${baseURL}/api/auth/login`, {
      data: { accountId, password: other },
    });
    const retryBody = await response.json();
    console.log("retry login status:", response.status(), "body:", JSON.stringify(retryBody));
    if (!response.ok()) {
      throw new Error(`login failed: ${retryBody.error ?? response.status()}`);
    }
    loginBody.user = retryBody.user;
    currentPassword = other;
  }

  if (loginBody.user?.mustChangePassword) {
    const changeResponse = await context.request.post(`${baseURL}/api/auth/change-password`, {
      data: { currentPassword, newPassword: password },
    });
    console.log("change-password status:", changeResponse.status());
    if (!changeResponse.ok()) {
      const changeBody = await changeResponse.json();
      throw new Error(`change-password failed: ${changeBody.error ?? changeResponse.status()}`);
    }
  }

  const meResponse = await context.request.get(`${baseURL}/api/auth/me`);
  const meBody = await meResponse.json();
  console.log("me status:", meResponse.status(), "mustChangePassword:", meBody.user?.mustChangePassword);

  await context.storageState({ path: authStatePath });
  console.log("auth state saved to", authStatePath);
} finally {
  await browser.close();
}
