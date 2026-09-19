---
version: alpha
name: Garment Canvas Design Tokens (Rev.3)
description: >-
  服装设计 AI 工作台三主题系统——曜黑(荧光绿,默认)、简白(Apple)、护眼绿(薄荷翡翠)。
  2026-09-19 锁定快照:以已实施代码 head e13de4c 为准逐条对齐后冻结。
  命名约定:ob-* ↔ 曜黑(:root/[data-theme="current"])、aw-* ↔ 简白([data-theme="white"])、
  eg-* ↔ 护眼绿([data-theme="eye"])、st-* ↔ 状态色(--gc-status-*)。
  运行时唯一实现通道为 src/index.css 的 --gc-* 变量;本 front matter 是其设计侧冻结镜像。
colors:
  primary: "#B7F35A"
  # ---- 曜黑(默认,深底亮色版) ----
  ob-shell: "#1a1c22"
  ob-canvas: "#16181d"
  ob-panel: "#21242a"
  ob-panel-hover: "#2b2f36"
  ob-control: "#1e2126"
  ob-ink: "#e8eaee"
  ob-ink-secondary: "#9ba1a9"
  ob-border: "#33373f"
  ob-border-strong: "#454a53"
  ob-accent: "#B7F35A"
  ob-accent-ink: "#131313"
  ob-accent-deep: "#4a7a17"
  ob-node-main: "#ffffff"
  ob-node-header: "#ffffff"
  ob-node-inner: "#f2f3f5"
  ob-node-inner-hover: "#e9eaee"
  ob-node-border: "#e4e6ea"
  ob-node-ink: "#1d1d1f"
  ob-node-ink-secondary: "#6b7075"
  ob-node-accent: "#B7F35A"
  ob-edge: "#B7F35A"
  ob-handle-highlight: "#dcffab"
  ob-handle-mid: "#8ed94e"
  ob-handle-dark: "#4a7a17"
  # ---- 简白·Apple ----
  aw-shell: "#f5f5f7"
  aw-canvas: "#f5f5f7"
  aw-panel: "#ffffff"
  aw-panel-hover: "#e8e8ed"
  aw-control: "#ffffff"
  aw-ink: "#1d1d1f"
  aw-ink-secondary: "#6e6e73"
  aw-border: "rgba(0, 0, 0, 0.08)"
  aw-border-strong: "rgba(0, 0, 0, 0.16)"
  aw-accent: "#0071e3"
  aw-accent-ink: "#ffffff"
  aw-accent-deep: "#0066cc"
  aw-node-main: "#ffffff"
  aw-node-header: "#ffffff"
  aw-node-inner: "#f5f5f7"
  aw-node-inner-hover: "#ececf0"
  aw-node-border: "rgba(0, 0, 0, 0.08)"
  aw-node-ink: "#1d1d1f"
  aw-node-ink-secondary: "#6e6e73"
  aw-node-accent: "#0071e3"
  aw-edge: "#0071e3"
  aw-handle-highlight: "#d6ecff"
  aw-handle-mid: "#66b2ff"
  aw-handle-dark: "#004a99"
  # ---- 护眼绿·薄荷翡翠 ----
  eg-shell: "#EDF4EE"
  eg-canvas: "#E9F1EA"
  eg-panel: "#ffffff"
  eg-panel-hover: "#DCE9DD"
  eg-control: "#f4f9f5"
  eg-ink: "#123B2B"
  eg-ink-secondary: "#47685A"
  eg-border: "#c9dccc"
  eg-border-strong: "#a8c2ac"
  eg-accent: "#0B7A43"
  eg-accent-ink: "#ffffff"
  eg-accent-deep: "#0B7A43"
  eg-node-main: "#ffffff"
  eg-node-header: "#ffffff"
  eg-node-inner: "#f0f6f1"
  eg-node-inner-hover: "#e5efe7"
  eg-node-border: "#e2ece4"
  eg-node-ink: "#123B2B"
  eg-node-ink-secondary: "#47685A"
  eg-node-accent: "#0B7A43"
  eg-edge: "#0B7A43"
  eg-handle-highlight: "#d2ecdc"
  eg-handle-mid: "#3fa46a"
  eg-handle-dark: "#0a5c33"
  # ---- 状态色(与强调色彻底解耦,按底色三档) ----
  st-idle: "#8b9198"
  st-idle-light: "#8e8e93"
  st-idle-eye: "#6d8d7c"
  st-queued-dark: "#2dd4bf"
  st-queued-light: "#9a6f00"
  st-queued-eye: "#85660e"
  st-running-dark: "#60a5fa"
  st-running-light: "#3b82f6"
  st-running-eye: "#2f6db5"
  st-retry-dark: "#fb923c"
  st-retry-light: "#ea8a00"
  st-retry-eye: "#c07a10"
  st-success-dark: "#34d399"
  st-success-light: "#1d7a3e"
  st-success-eye: "#1d7a3e"
  st-error-dark: "#f87171"
  st-error-light: "#d30000"
  st-error-eye: "#c23a3a"
  st-unknown-dark: "#a78bfa"
  st-unknown-light: "#6e54b3"
  st-unknown-eye: "#5e50a8"
  st-warn-dark: "#fbbf24"
  st-warn-light: "#b45309"
  st-warn-eye: "#92600a"
typography:
  ui:
    fontFamily: "-apple-system, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 12px
  body:
    fontFamily: "-apple-system, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 13px
  label:
    fontFamily: "-apple-system, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 11px
  meta-en:
    fontFamily: "-apple-system, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 10px
  mono-value:
    fontFamily: "JetBrains Mono, SF Mono, ui-monospace, monospace"
    fontSize: 11px
  brand-display:
    fontFamily: "-apple-system, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 52px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
rounded:
  node: 12px
  ctl: 8px
  slot: 10px
  card: 20px
  chip: 999px
  pill: 980px
spacing:
  node-pad: 12px
  node-gap: 12px
  login-card-pad: 36px
motion:
  handle: 140ms ease
  reveal: 500ms cubic-bezier(0.2, 0.8, 0.2, 1)
  breathe: 1.6s ease-in-out
  develop: 1.6s/2s ease-in-out
  dur-fast: 120ms
  dur-base: 200ms
components:
  node-card:
    backgroundColor: "#ffffff"
    textColor: "{colors.ob-node-ink}"
    rounded: "{rounded.node}"
    width: 280px
  run-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ob-accent-ink}"
    rounded: "{rounded.ctl}"
  login-cta-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ob-accent-ink}"
    rounded: "{rounded.pill}"
    height: 46px
  prompt-chip:
    backgroundColor: "{colors.ob-node-inner}"
    textColor: "{colors.ob-node-ink}"
    rounded: "{rounded.slot}"
---

# Garment Canvas 机读设计规范 · Rev.3

| 项 | 值 |
|---|---|
| 版本 | Rev.3(2026-09-19,R-49) |
| 派生自 | [`DESIGN-Rev2-locked-2026-09-19.md`](./DESIGN-Rev2-locked-2026-09-19.md) front matter(R-47 锁定,对齐 `e13de4c`) |
| 对应代码 head | `54198a9`(main;= 锁定基线 `e13de4c` + R-48 残留清理 `54198a9`) |
| 本文件地位 | 机读唯一事实源;`lint -> export` 流水线的输入 |
| 导出物 | `theme.css`(Tailwind v4 @theme)/ `tailwind.theme.json`(v3 theme.extend)/ `tokens.json`(W3C DTCG),均由 `@google/design.md` CLI 0.4.0 从本文导出 |

## 变量名映射(实现层约定)

front matter token ↔ `src/index.css` 自定义属性:ob-* ↔ `[data-theme="current"]`、aw-* ↔ `[data-theme="white"]`、eg-* ↔ `[data-theme="eye")]` 的 `--gc-*` 同名变量(如 `ob-canvas` → `--gc-canvas`;`*-accent-ink` → `--gc-accent-cta-ink`;`*-ink` → `--gc-text`)。st-* 状态色三档后缀 -dark/-light/-eye ↔ `--gc-status-*` 在 :root/white/eye 三段覆盖。实现层还有设计规范不收录的派生变量(handle-ring/glow 的 rgba、primary-foreground 桥、kind-* 九色、font-*/dot-status),以代码为准。

## 与 Rev.2 的差异(全部)

1. `st-queued-light` #c79002 → **#9a6f00**、`st-queued-eye` #a1801a → **#85660e**——R-48 B5 状态点加深至 WCAG 1.4.11 ≥3:1(commit 54198a9)。
2. 补 Rev.2 漏记槽位(代码既有,非新变化):`st-idle-light` #8e8e93、`aw-node-header`/`eg-node-header` #ffffff。
3. `typography.brand-display.fontSize` 由 `clamp(36px, 4vw, 52px)` 改记 **52px**——CLI dimension 语法不接受 clamp(),实际实现为 `text-[clamp(36px,4vw,52px)]`(`src/auth/LoginPage.tsx`),上、下限与中值以代码为准。

## Colors

三主题 97 色槽全部锁定于 front matter;语义与用人规则(一色一义、白卡语言、CTA 前景 cta-ink)见人读版锁定快照 §0-§3,本文不复述。

## Typography

字阶四档 ui 12 / body 13 / label 11 / meta-en 10,mono 数值栈,系统栈零网络字体;brand-display 见上文差异第 3 条。

## Components

四个组件契约(node-card / run-button / login-cta-pill / prompt-chip)为 lint 引用锚点,完整组件语言见锁定快照 §5-§8。
