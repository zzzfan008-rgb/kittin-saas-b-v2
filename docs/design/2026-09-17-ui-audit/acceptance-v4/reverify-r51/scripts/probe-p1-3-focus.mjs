// R-51 P1-3 复验：焦点环三主题实测对比度 + 节点内 input/textarea/select 聚焦可见变化 + chip 左强调条。
// 手法：blur→快照 → focus→快照 的 delta（避免只看聚焦态漏掉「本来就没变」）+ 逐像素截图供对比度计算。
import { join } from "node:path";
import { BASE, THEMES, nodeRequire, SHOTS, write, login, dismissTutorial, switchTheme, closeDock, clipFor, openFreshProject } from "./lib.mjs";

const { chromium } = nodeRequire("playwright");

const DELTA = `(sel) => {
  const el = document.querySelector(sel);
  if (!el) return { missing: sel };
  const focusable = el.matches("input,textarea,button,select") ? el : el.querySelector("input,textarea,button,select") || el;
  const snap = () => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      borderTopColor: s.borderTopColor, borderLeftColor: s.borderLeftColor, borderTopWidth: s.borderTopWidth, borderLeftWidth: s.borderLeftWidth,
      boxShadow: s.boxShadow, outlineStyle: s.outlineStyle, outlineColor: s.outlineColor, outlineWidth: s.outlineWidth,
      backgroundColor: s.backgroundColor, color: s.color,
      rect: { x: r.x, y: r.y, width: r.width, height: r.height },
    };
  };
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const before = snap();
  focusable.focus({ preventScroll: true });
  const after = snap();
  const changed = ["borderTopColor","borderLeftColor","borderTopWidth","borderLeftWidth","boxShadow","outlineStyle","outlineWidth","outlineColor","backgroundColor","color"].filter((k) => before[k] !== after[k]);
  return {
    tag: el.tagName, cls: (typeof el.className === "string" ? el.className : "").slice(0, 200),
    focusableTag: focusable.tagName, focusableCls: (typeof focusable.className === "string" ? focusable.className : "").slice(0, 200),
    focused: document.activeElement === focusable, focusVisible: focusable.matches(":focus-visible"),
    before, after, changed,
  };
}`;

const THEME_VARS = `() => {
  const s = getComputedStyle(document.documentElement);
  const read = (n) => s.getPropertyValue(n).trim();
  return {
    dataTheme: document.documentElement.dataset.theme ?? null,
    accent: read("--gc-accent"), accentDeep: read("--gc-accent-deep"), nodeAccent: read("--gc-node-accent"),
    nodeInner: read("--gc-node-inner"), nodeBorder: read("--gc-node-border"), colorGold: read("--color-gold"),
  };
}`;

const TARGETS = [
  { name: "thumbSlot", sel: '[data-testid^="rf__node-pattern"] .aspect-\\[4\\/3\\]', kind: "focus-within ring" },
  { name: "thumbSlotFallback", sel: ".gc-node-card .aspect-\\[4\\/3\\]", kind: "focus-within ring" },
  { name: "promptChipTextarea", sel: ".gc-node-card textarea", kind: "chip / field-input" },
  { name: "modelSelect", sel: ".gc-node-card select", kind: "field-input" },
  { name: "firstInput", sel: ".gc-node-card input:not([type=file]):not([type=hidden])", kind: "field-input" },
  { name: "assetPickerButton", sel: ".gc-node-card button:not([disabled])", kind: "button focus" },
];

async function runPhase({ projectMatcher, label, out }) {
  const { statePath, api } = await login();
  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState: statePath, locale: "zh-CN", viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25_000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.keyboard.press("Escape");
  await dismissTutorial(page);
  const templateHits = await openFreshProject(page, projectMatcher);
  await page.getByRole("button", { name: "适应画布" }).click();
  await page.waitForTimeout(900);
  const inventory = await page.evaluate(() => ({
    nodes: [...document.querySelectorAll(".react-flow__node")].map((el) => el.getAttribute("data-testid")),
    textareas: document.querySelectorAll(".gc-node-card textarea").length,
    selects: document.querySelectorAll(".gc-node-card select").length,
    inputs: document.querySelectorAll(".gc-node-card input").length,
    slots: document.querySelectorAll(".gc-node-card .aspect-\\[4\\/3\\]").length,
    goldEls: [...document.querySelectorAll("body *")].filter((el) => typeof el.className === "string" && /(^|\\s)(bg-gold|border-gold|text-gold|ring-gold)/.test(el.className)).map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { tag: el.tagName, cls: String(el.className).slice(0, 200), text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 24), bg: s.backgroundColor, color: s.color, borderLeft: s.borderLeftColor, borderLeftWidth: s.borderLeftWidth, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], opacity: s.opacity };
    }),
  }));
  out[label] = { templateHits, inventory, themes: {}, errors };

  for (const theme of THEMES) {
    await switchTheme(page, theme);
    await page.waitForTimeout(400);
    const vars = await page.evaluate(THEME_VARS);
    const entry = { vars, targets: [] };
    for (const target of TARGETS) {
      const delta = await page.evaluate(new Function(`return (${DELTA})(${JSON.stringify(target.sel)})`));
      if (delta.missing) continue;
      const rec = { name: target.name, kind: target.kind, before: delta.before, after: delta.after, changed: delta.changed, tag: delta.tag, focusableTag: delta.focusableTag, cls: delta.cls, focusableCls: delta.focusableCls, focused: delta.focused, focusVisible: delta.focusVisible };
      // 焦点态截图（元素 + 外扩 8px，覆盖 2px ring）
      const rect = delta.after.rect;
      if (rect.width > 0 && rect.height > 0) {
        const clip = clipFor(rect, 1280, 720, 8);
        const afterShot = join(SHOTS, `p1-3-focus-${target.name}-${theme.id}-1280.png`);
        await page.screenshot({ path: afterShot, clip });
        rec.afterShot = afterShot;
        rec.clip = clip;
        // 未聚焦对照
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
        await page.waitForTimeout(150);
        const beforeShot = join(SHOTS, `p1-3-blur-${target.name}-${theme.id}-1280.png`);
        await page.screenshot({ path: beforeShot, clip });
        rec.beforeShot = beforeShot;
      }
      entry.targets.push(rec);
    }
    out[label].themes[theme.id] = entry;
    console.log(`[${label}/${theme.id}] vars`, JSON.stringify(vars), "targets", entry.targets.length);
    for (const t of entry.targets) {
      console.log(`   ${t.name}: changed=[${t.changed.join("|")}] borderL ${t.before.borderLeftColor}->${t.after.borderLeftColor} shadow ${String(t.after.boxShadow).slice(0, 70)} rect ${JSON.stringify(t.after.rect)}`);
    }
  }
  await api.dispose();
  await context.close();
  await browser.close();
}

const out = { url: BASE };
await runPhase({ projectMatcher: "图案风格迁移", label: "pattern", out });
await runPhase({ projectMatcher: "文生图（服装设计）", label: "text", out });
write("p1-3-focus.json", out);
console.log("pageerrors:", JSON.stringify(Object.fromEntries(Object.entries(out).filter(([k]) => k !== "url").map(([k, v]) => [k, v.errors.length]))));
