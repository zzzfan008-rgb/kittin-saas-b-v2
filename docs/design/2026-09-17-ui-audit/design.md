---
version: alpha
name: Garment Canvas Themes
description: 服装设计 AI 工作台三主题系统——简白(Apple)、曜黑(活力黄)、护眼绿(薄荷翡翠)。2026-09-18 定稿。
colors:
  primary: "#0071e3"
  secondary: "#6e6e73"
  # ---- 简白 · Apple(默认工作主题) ----
  aw-canvas: "#f5f5f7"
  aw-panel: "#ffffff"
  aw-panel-translucent: "rgba(255,255,255,0.72)"
  aw-ink: "#1d1d1f"
  aw-ink-secondary: "#6e6e73"
  aw-ink-tertiary: "rgba(0,0,0,0.48)"
  aw-accent: "#0071e3"
  aw-accent-hover: "#0068d4"
  aw-accent-ink: "#ffffff"
  aw-card-inner: "#f5f5f7"
  aw-link: "#0066cc"
  aw-disabled-bg: "#ececf0"
  aw-disabled-ink: "#75757b"
  aw-border: "rgba(0,0,0,0.08)"
  aw-border-strong: "rgba(0,0,0,0.16)"
  # ---- 曜黑 · 活力黄 ----
  ob-canvas: "#16181d"
  ob-shell: "#1a1c22"
  ob-panel: "#21242a"
  ob-panel-hover: "#2b2f36"
  ob-ink: "#e8eaee"
  ob-ink-secondary: "#9ba1a9"
  ob-accent: "#FFC940"
  ob-accent-ink: "#131313"
  ob-card: "#ffffff"
  ob-card-inner: "#f2f3f5"
  ob-card-ink: "#1d1d1f"
  ob-card-ink-secondary: "#6b7075"
  ob-border: "#33373f"
  ob-border-strong: "#454a53"
  # ---- 护眼绿 · 薄荷翡翠 ----
  eg-canvas: "#E9F1EA"
  eg-shell: "#EDF4EE"
  eg-panel: "#ffffff"
  eg-panel-hover: "#DCE9DD"
  eg-ink: "#123B2B"
  eg-ink-secondary: "#47685A"
  eg-accent: "#0B7A43"
  eg-accent-ink: "#ffffff"
  eg-card: "#ffffff"
  eg-card-inner: "#f0f6f1"
  eg-border: "#c9dccc"
  eg-border-strong: "#a8c2ac"
  # ---- 语义状态色(浅底版 / 深底版) ----
  st-idle: "#8e8e93"
  st-queued-light: "#c79002"
  st-queued-dark: "#2dd4bf"
  st-running-light: "#3b82f6"
  st-running-dark: "#60a5fa"
  st-retry-light: "#ea8a00"
  st-success-light: "#1d7a3e"
  st-success-dark: "#34d399"
  st-error-light: "#d30000"
  st-error-dark: "#f87171"
  st-unknown-light: "#6e54b3"
  st-unknown-dark: "#a78bfa"
  st-warn-light: "#b45309"
typography:
  body:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.16px"
  node-title:
    fontFamily: system-ui
    fontSize: 13.5px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.25px"
  section-heading:
    fontFamily: system-ui
    fontSize: 40px
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.55px"
  field-label:
    fontFamily: system-ui
    fontSize: 11.5px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.1px"
  mono-value:
    fontFamily: SF Mono
    fontSize: 11.5px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px
rounded:
  node: 12px
  input: 8px
  pill: 980px
  stage: 18px
  card: 14px
spacing:
  node-pad: 18px
  node-gap: 14px
  field-gap: 6px
  section: 88px
components:
  node-card:
    backgroundColor: "{colors.aw-panel}"
    textColor: "{colors.aw-ink}"
    rounded: "{rounded.node}"
  run-button:
    backgroundColor: "{colors.aw-accent}"
    textColor: "{colors.aw-accent-ink}"
    rounded: "{rounded.pill}"
    height: 34px
  run-button-hover:
    backgroundColor: "{colors.aw-accent-hover}"
    textColor: "{colors.aw-accent-ink}"
  run-button-disabled:
    backgroundColor: "{colors.aw-disabled-bg}"
    textColor: "{colors.aw-disabled-ink}"
  run-button-loading:
    # loading 非静态对比场景:spinner 与文字同色系渐进,基色对 5.07:1(ink-secondary on card-inner)
    backgroundColor: "{colors.aw-card-inner}"
    textColor: "{colors.aw-ink-secondary}"
  canvas-edge:
    backgroundColor: "{colors.aw-accent}"
  field-input:
    backgroundColor: "{colors.aw-card-inner}"
    textColor: "{colors.aw-ink}"
    rounded: "{rounded.input}"
    height: 32px
---

# Garment Canvas · 三主题设计系统

## Overview

服装设计 AI 工作台的三主题系统。核心理念:**画布优先、一色一义、白卡语言**。
三主题共享同一节点结构(300px 卡、18px 内边距、分栏字段、9px 状态点、胶囊 CTA),
只交换色彩语义。连线三主题统一为强调色单色线。

## Colors

### 简白 · Apple(默认工作主题)
- **aw-canvas #f5f5f7**:工作画布,微蓝灰调防苍白,非纯白。
- **aw-accent #0071e3**:Apple Blue,唯一交互色——主 CTA、选中描边、焦点环、连线。hover 提亮为 #0077ed(色值过渡,禁用 filter:brightness)。
- **aw-ink #1d1d1f**:近黑主文字,禁纯黑 #000。

### 曜黑 · 活力黄
- **ob-canvas #16181d**:提亮黑,非死黑,有透气感。
- **ob-accent #FFC940**:活力黄(11.6:1 on canvas);CTA 墨字 #131313(12.1:1)。
- **ob-card #ffffff**:节点卡纯白——「干净」的来源。
- queued 状态用青 #2dd4bf(8.4:1),避免与强调黄撞色。

### 护眼绿 · 薄荷翡翠
- **eg-canvas #E9F1EA**:薄荷画布,低饱和偏冷,不浑浊。
- **eg-accent #0B7A43**:翡翠绿(4.7:1 on canvas),白字 CTA(5.4:1)。

### 语义状态色(8 态)
与强调色彻底解耦。浅底用 -light 版、深底(曜黑)用 -dark 版。
idle 与 cancelled 共用 st-idle 中性灰,以文字区分;running/retry 状态点加同色描边环。

## Typography

- 系统栈,零网络字体:`system-ui, -apple-system, "PingFang SC", "Segoe UI", "Microsoft YaHei"`。
- 数值语境(坐标/尺寸/百分比/时间戳)走 `"SF Mono", ui-monospace, Menlo` 等宽栈。
- 中文最小字号 11px;负字距全尺寸覆盖(section-heading -0.55px / body -0.16px / field-label -0.1px)。
- 大标题紧行高 1.08,Apple 式 billboard 气质。

## Layout

- 节点卡固定宽 300px;字段两列栅格 gap 10px;字段组纵向 gap 14px。
- handle 圆点 14px:默认中性色(--edge),hover/连线/选中时才亮强调色并放大 1.2×。
- 玻璃导航高 52px:`backdrop-filter: saturate(180%) blur(20px)`。

## Elevation

每主题一组四层软阴影(node-shadow / node-shadow-lift):0.5px 轮廓线 + 接触阴影 + 中层扩散 + 大范围环境影。简白最轻,曜黑最深(0.5px 轮廓加深至 rgba(0,0,0,.5))。选中态 = 强调色 2px 描边 + 10% 同色晕 + lift 阴影。

## Shapes

五档圆角:节点 12 / 输入 8 / 胶囊 980 / 舞台 18 / 卡片 14。矩形圆角禁超过 12px(胶囊除外)。

## Components

- **run-button** 主行动:唯一填充强调色的控件。loading 态 = 浅底 + 内联 spinner(currentColor 环 0.8s linear);disabled = 中性灰底(aw-disabled-bg/ink,3.9:1),禁用蓝色残留。
- **field-input**:1px 边框恒定不变(状态切换零布局位移);`outline: 2px solid transparent` 预留焦点槽位;焦点环即时出现、永不参与过渡。错误态 = 红边 + helper 位(min-height:1lh)红色说明 + aria-invalid,错误文字永不占 label 位。
- **canvas-edge**:强调色单色贝塞尔线 + 同色箭头 marker,三主题同规则。

## Do's and Don'ts

**Do**
- 每主题一个行动色,只落在四处:主 CTA、选中描边、焦点环、连线。
- 动效只用命名 token:--ease-out / --ease-in / --ease-in-out 三曲线 + --dur-1/2/3(120/180/250ms)三档。
- 全局 `prefers-reduced-motion` 兜底(transition-duration / animation-duration / animation-iteration-count 三属性)。
- 状态变化除颜色外必配第二信号(文字/图标/描边环)。

**Don't**
- `transition: all`(禁止,列显式属性)。
- `filter: brightness()` 做 hover 态(用具体色值)。
- 状态色与强调色混用;仅颜色承载状态。
- 焦点信号做任何动画;focus 用 focus-visible(键盘专用)。

## Provenance

2026-09-17 UI 审核(docs/design/2026-09-17-ui-audit/)迭代定稿:
V1 工程审计板(否)→ V2 时装版房 Atelier(方向对)→ V3 简白 Apple 重设计(popular-web-designs/apple.md 词汇表)→ Hallmark 交互精修(7 处违规清零)→ 三主题终配色(曜黑·活力黄 / 护眼绿 v3 薄荷翡翠 / 连线=强调色)。
全部色值经程序 WCAG 对比度验证(黄 on 曜黑 11.6:1、白字 on 翡翠 5.4:1 等);视觉证据 shots/prototype-v3/;交互原型 prototype-v3.html。
