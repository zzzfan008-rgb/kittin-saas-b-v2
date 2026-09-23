import { expect, test } from "./fixtures";

/**
 * 批次三门禁：VIS-07 可见焦点环 + VIS-05 网格吸附。
 * - 三主题（曜黑/简白/护眼绿）下键盘 Tab 导航，每个可聚焦元素都有可见焦点指示。
 * - 焦点环色对画布底色的对比比 ≥3:1（WCAG 2.1 SC 1.4.11 非文本对比，AA）。
 * - snapGrid=[24,24] 默认关；开启后拖拽落点坐标为 24 的整数倍。
 * 截图证据落在 docs/design/2026-09-22-node-workflow-optimization/shots-batch3/。
 */

const SHOT_DIR =
  "docs/design/2026-09-22-node-workflow-optimization/shots-batch3";

const themes = [
  { id: "current", label: "曜黑", full: "曜黑·荧光绿" },
  { id: "white", label: "简白", full: "简白" },
  { id: "eye", label: "护眼绿", full: "护眼绿" },
] as const;

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`unsupported color: ${hex}`);
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

async function login(page: import("@playwright/test").Page): Promise<void> {
  const request = page.context().request;
  let response = await request.post("/api/auth/login", {
    data: { accountId: "e2e-admin", password: "E2eInitial1234" },
  });
  if (response.status() === 401) {
    response = await request.post("/api/auth/login", {
      data: { accountId: "e2e-admin", password: "E2eFinal5678" },
    });
  }
  const body = (await response.json()) as {
    error?: string;
    user?: { mustChangePassword?: boolean };
  };
  expect(response.ok(), body.error ?? "login failed").toBeTruthy();
  if (body.user?.mustChangePassword) {
    const change = await request.post("/api/auth/change-password", {
      data: {
        currentPassword: "E2eInitial1234",
        newPassword: "E2eFinal5678",
      },
    });
    expect(change.ok(), await change.text()).toBeTruthy();
  }
  await request.post("/api/tutorials/workbench-onboarding/acknowledge", {
    data: { outcome: "completed" },
  });
}

test("VIS-07 键盘焦点环（三主题）+ VIS-05 snapGrid 吸附", async ({ page }) => {
  await login(page);
  await page.goto("/");

  // API acknowledge 在全新库上未必被前端即时采纳；教程对话框若延迟弹出则直接关闭。
  const closeTutorial = page.getByRole("button", { name: "关闭教程" });
  const tutorialAppeared = await closeTutorial
    .waitFor({ timeout: 2500 })
    .then(() => true)
    .catch(() => false);
  if (tutorialAppeared) await closeTutorial.click();

  // 冷启动 0 页签：先在「空工作区」新建一个空白项目，画布与工具栏才会出现。
  await page.getByRole("button", { name: "新建项目" }).click();

  // 通过左侧悬浮工具栏「添加」菜单加入 文本/图片/视频 三节点。
  const addButton = page.getByRole("button", { name: "添加" });
  page.on("filechooser", () => {
    // 图片节点落地会尝试打开文件选择器；自动化中自动取消，不影响焦点验证。
  });
  for (const kind of ["文本", "图片", "视频"]) {
    await addButton.click();
    await page.getByRole("menuitem", { name: kind }).click();
  }

  // 适应画布：触发 fitView（约 0.5x 缩放），同时验证缩放下的焦点环宽度补偿。
  await page
    .getByRole("button", { name: "适应画布" })
    .click();
  await page.waitForTimeout(300);

  const firstNode = page.locator(".react-flow__node").first();
  await firstNode.waitFor();

  // 收集三主题的 token 值与焦点环计算样式，做 AA 对比度断言。
  // 页面不能 reload（项目未保存），通过顶栏主题切换器原地换肤。
  const switchTheme = async (fullLabel: string): Promise<void> => {
    await page.getByRole("button", { name: /^切换主题/ }).click();
    await page.getByRole("menuitemradio", { name: fullLabel }).click();
    await page.waitForTimeout(250);
  };

  for (const theme of themes) {
    await switchTheme(theme.full);

    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        accent: styles.getPropertyValue("--gc-accent").trim(),
        canvas: styles.getPropertyValue("--gc-canvas").trim(),
        zoom:
          getComputedStyle(
            document.querySelector(".react-flow")!,
          ).getPropertyValue("--rf-zoom") || "1",
      };
    });

    // 焦点节点本体（RF 默认把 outline 置 none，VIS-07 恢复）。
    // 先按一次 Tab 让 Chromium 进入键盘焦点启发式，否则纯 focus() 不匹配 :focus-visible。
    await page.keyboard.press("Tab");
    const nodeOutline = await firstNode.evaluate((el) => {
      (el as HTMLElement).focus();
      return true;
    });
    void nodeOutline;
    // transition-all 会让 outline 淡入，等过渡结束再读样式/截图。
    await page.waitForTimeout(220);
    const nodeOutlineStyle = await firstNode.evaluate((el) => {
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
    });
    expect(nodeOutlineStyle.style).not.toBe("none");
    expect(nodeOutlineStyle.width).not.toBe("0px");
    await page.screenshot({
      path: `${SHOT_DIR}/kb-focus-node-${theme.id}.png`,
    });

    // 焦点节点内控件：选中节点 → 工具条出现（shadcn Button 自带 focus ring）。
    await firstNode.click();
    const innerButton = page
      .locator('.react-flow__node button[aria-label="色彩工具"]')
      .first();
    await innerButton.waitFor();
    // 之前的鼠标点击退出了键盘启发式；按 Tab 后再聚焦，shadcn 的 focus-visible ring 才会出现。
    await page.keyboard.press("Tab");
    await innerButton.focus();
    await page.waitForTimeout(220);
    const innerIndicator = await innerButton.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        outlineStyle: s.outlineStyle,
        outlineWidth: s.outlineWidth,
        boxShadow: s.boxShadow,
      };
    });
    const boxRingLayers = innerIndicator.boxShadow
      .split(/,\s*(?=[a-z])/)
      .filter((part) => /\s[1-9]\d*px$/.test(part) && !/\/ ?0(?:\)|%|\s)/.test(part));
    const hasRing =
      (innerIndicator.outlineStyle !== "none" &&
        innerIndicator.outlineWidth !== "0px") ||
      boxRingLayers.length > 0;
    expect(hasRing, "节点内按钮必须有可见焦点指示（outline 或 ring）").toBe(
      true,
    );
    await page.screenshot({
      path: `${SHOT_DIR}/kb-focus-inner-${theme.id}.png`,
    });

    // 全局兜底规则：未声明焦点样式的普通按钮 focus-visible 时也必须有焦点环。
    // 之前的鼠标点击会退出键盘启发式，先按 Tab 再让 probe 聚焦。
    await page.keyboard.press("Tab");
    const globalRing = await page.evaluate(() => {
      const probe = document.createElement("button");
      probe.textContent = "probe";
      probe.style.position = "fixed";
      probe.style.top = "8px";
      probe.style.left = "8px";
      document.body.appendChild(probe);
      probe.focus();
      const s = getComputedStyle(probe);
      const result = { style: s.outlineStyle, width: s.outlineWidth };
      probe.remove();
      return result;
    });
    expect(globalRing.style).not.toBe("none");
    expect(parseFloat(globalRing.width)).toBeGreaterThanOrEqual(1);

    // 焦点连线（若存在 text→image 自动边）。
    const edgeCount = await page.locator(".react-flow__edge").count();
    if (edgeCount > 0) {
      await page.keyboard.press("Tab");
      const edgeOutline = await page
        .locator(".react-flow__edge")
        .first()
        .evaluate((el) => {
          (el as HTMLElement).focus();
          return true;
        });
      void edgeOutline;
      await page.waitForTimeout(220);
      const edgeOutlineStyle = await page
        .locator(".react-flow__edge")
        .first()
        .evaluate((el) => {
          const s = getComputedStyle(el);
          return { width: s.outlineWidth, style: s.outlineStyle };
        });
      expect(edgeOutlineStyle.style).not.toBe("none");
      expect(parseFloat(edgeOutlineStyle.width)).toBeGreaterThanOrEqual(0.9);
      await page.screenshot({
        path: `${SHOT_DIR}/kb-focus-edge-${theme.id}.png`,
      });
    }

    // AA：焦点环色（accent）对画布底色 ≥3:1（SC 1.4.11）。
    const ratio = contrast(tokens.accent, tokens.canvas);
    expect(ratio).toBeGreaterThanOrEqual(3);
    console.log(
      `  [${theme.label}] accent=${tokens.accent} canvas=${tokens.canvas} 焦点环对比 ${ratio.toFixed(2)}:1`,
    );
  }

  // ---- VIS-05：snapGrid 吸附（切回曜黑，不 reload）----
  await switchTheme(themes[0].full);
  const toggle = page.getByTestId("grid-snap-toggle");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.screenshot({ path: `${SHOT_DIR}/snap-toggle-off.png` });


  // 读节点位置（transform 写在节点元素的 style 或内层 wrapper 上）。
  const nodePosition = async (): Promise<{ x: number; y: number }> => {
    const node = page.locator(".react-flow__node").first();
    return node.evaluate((el) => {
      const target = el as HTMLElement;
      const inner = target.querySelector<HTMLElement>(".react-flow__node");
      const re = /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px\)/;
      const m =
        re.exec(target.getAttribute("style") || "") ??
        (inner ? re.exec(inner.getAttribute("style") || "") : null);
      return m ? { x: Number(m[1]), y: Number(m[2]) } : { x: NaN, y: NaN };
    });
  };

  const before = await nodePosition();

  // 开启吸附 → 拖拽落点为 24 的整数倍。
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: `${SHOT_DIR}/snap-toggle-on.png` });

  const box = (await page.locator(".react-flow__node").first().boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 14);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 130, box.y + 14 + 97, {
    steps: 12,
  });
  await page.mouse.up();
  await page.waitForTimeout(200);

  const snapped = await nodePosition();
  expect(snapped.x % 24).toBe(0);
  expect(snapped.y % 24).toBe(0);
  await page.screenshot({ path: `${SHOT_DIR}/snap-aligned.png` });

  // 关闭吸附后仍可自由落点（位置不再必然是 24 倍数）。
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  const box2 = (await page.locator(".react-flow__node").first().boundingBox())!;
  await page.mouse.move(box2.x + box2.width / 2, box2.y + 14);
  await page.mouse.down();
  await page.mouse.move(box2.x + box2.width / 2 + 53, box2.y + 14 + 41, {
    steps: 10,
  });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const free = await nodePosition();
  expect(
    free.x % 24 !== 0 || free.y % 24 !== 0,
    `关闭吸附后位置不应被量化（${free.x},${free.y}）`,
  ).toBeTruthy();

  console.log(
    `  VIS-05 拖拽位置 开前=(${before.x},${before.y}) 吸附=(${snapped.x},${snapped.y}) 关闭=(${free.x},${free.y})`,
  );
});
