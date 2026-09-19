---
version: alpha
name: Garment Canvas Design Spec (Rev.2 Locked)
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
  st-idle-eye: "#6d8d7c"
  st-queued-dark: "#2dd4bf"
  st-queued-light: "#c79002"
  st-queued-eye: "#a1801a"
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
    fontSize: clamp(36px, 4vw, 52px)
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

# Garment Canvas 设计规范 · Rev.2 锁定快照

| 项 | 值 |
|---|---|
| 锁定时间 | 2026-09-19(CST) |
| 对应代码 head | `e13de4c`(main;V4 三连 `3d5f8f7` 曜黑换荧光绿 / `283e1e6` 节点语言 / `0406807` 登录页分屏 均已在其内,CI 5/5 绿) |
| 与原文关系 | [`design.md`](./design.md)(人读版,Rev.2 条款含 CTA 例外)的**冻结导出**;逐条与已实施代码对齐,不一致处以代码为准修订,全部差异见文末 §11 |
| 冻结纪律 | 后续修订以新版本**另立文件**;本文不再原地修改 |
| 机读源状态 | 原机读源 `DESIGN.md` 已丢失(详见 §10);本文 front matter 即重建后的机读唯一事实源,与 `src/index.css` 实现值逐一对齐 |

本文数值与 front matter 一致;如与 `src/index.css` 冲突,以代码为准并按 §11 流程升版。

---

## 0. 设计立场(锁定版)

服装设计师的生产工具,不是通用 AI SaaS 仪表盘。三条铁律:

1. **画布优先**——chrome 退后,节点与服装图像是主角;
2. **一色一义**——每主题一个行动色(ob-accent / aw-accent / eg-accent),落在主 CTA、选中描边、焦点环、连线与 handle 宝石;**CTA 前景色由 `--gc-accent-cta-ink` 每主题自配**(曜黑=黑字 on 荧光绿 14.14:1,简白=白字 on 蓝 4.70:1,护眼=白字 on 翡翠 5.41:1)。~~Rev.2 旧例外:浅底主题 CTA 用深绿 `#166534`~~ **已作废**——该值从未落地(全仓 grep 零匹配),被 V4 的 cta-ink 变量方案取代;
3. **白卡语言**——三主题节点卡统一纯白(`--gc-node-main` 三主题同值 `#ffffff`)+ 细边框(`--gc-node-border`)+ 软阴影(静息单层 `0 10px 28px rgba(8,14,22,.2)`,hover 环 + 深影双层);「四层软阴影」语言用于登录卡(hairline + 三层渐进)。

## 1. 三主题(锁定值)

| 主题 | ThemeId | 画布 | 节点卡 | 行动色 | CTA 前景 |
|---|---|---|---|---|---|
| **曜黑·荧光绿**(默认) | `current` | ob-canvas | 纯白 | ob-accent `#B7F35A` | ob-accent-ink(黑) |
| **简白·Apple** | `white` | aw-canvas | 纯白 | aw-accent `#0071e3` | aw-accent-ink(白) |
| **护眼绿·薄荷翡翠** | `eye` | eg-canvas | 纯白 | eg-accent `#0B7A43` | eg-accent-ink(白) |

- 连线三主题统一 = 各自强调色单色线(`--gc-edge`),箭头 marker 同色;选中/hover 加粗至 2.2 + 发光,常态 1.8;光珠(三颗追尾)fill=accent,源节点运行时更亮更快(1.2s vs 2.8s)。
- handle = **accent 四档渐变宝石**(highlight→mid→accent→dark 径向渐变),常显即强调色 + 1px ring;hover/connecting 加环加辉加 scale。~~默认中性色~~ 与旧文不符,以代码为准。
- ThemeId `current/white/eye`,localStorage 旧值(含 `black`→`white` 迁移)无缝兼容;主题标签/色卡在 `src/lib/theme.ts` THEMES,TopBar themePreviewColors 已同步 `#B7F35A`。
- 关键对比度(2026-09-19 程序实测,WCAG 相对亮度公式):
  - 荧光绿 on 曜黑画布 **13.51:1**(旧文 11.6:1 为旧黄 `#ffc940` 时代数字,作废);
  - CTA ink on 荧光绿 14.14:1;白字 on 蓝 4.70:1;白字 on 蓝 hover `#0066cc` 5.57:1(旧文 5.34 作废);白字 on 翡翠 5.41:1;
  - 正文/次级:曜黑 14.14/6.54、简白 15.46/5.07、护眼 10.81/6.18、节点卡 16.83/5.00;
  - 状态点:queued 青 on 曜黑 panel 8.35:1。

## 2. 状态色三档机制(锁定值)

状态语义与强调色彻底解耦,按底色分配:`:root` 默认 = 深底亮色版(st-*-dark,queued 用青 `#2dd4bf`);`[data-theme="white"]` 覆盖 st-*-light;`[data-theme="eye"]` 覆盖 st-*-eye。全部 27 值见 front matter `st-*`。

运行态映射(代码 `NodeRunStatus` 共 **9 值**,旧文写 8 态,以代码为准):

| 运行态 | 状态色 | 附加 |
|---|---|---|
| idle / cancelled | st-idle | cancelled 叠加 60% 透明度 |
| queued | st-queued | — |
| running / retry_wait / cancel_requested | st-running / st-retry(retry_wait 与 cancel_requested 共用 retry 色) | 三者均 `animate-pulse` |
| success / error / outcome_unknown | 对应色 | — |

状态点 10px(`--gc-dot-status`,自 8px 提级),Tooltip 提供文字标签。

## 3. gold 工具类(锁定版)

`text-gold / border-gold / bg-gold` 跟随各主题 accent:曜黑→荧光绿、简白→蓝、护眼→翡翠。`@theme` 回退值 = `#B7F35A`(与默认主题一致;golddeep 回退 `#4a7a17` = ob-accent-deep 同值)。禁止引入第二金色。

## 4. 字体 / 排版 / 几何(锁定值)

系统栈零网络字体;数值语境走 mono 栈(`JetBrains Mono, SF Mono, ui-monospace`);中文最小 11px;负字距全尺寸;品牌大标题 `clamp(36px,4vw,52px)` 纯行高 1.08 / -0.03em。字阶四档 ui 12 / body 13 / label 11 / meta-en 10(仅限纯英文徽章/坐标/时间戳)。圆角:节点 12 / 控件 8 / 槽位 10 / 登录卡 20 / 芯片 999 / CTA 胶囊 980。节点宽 280px、内容内边距 12px。

导航为**实色 panel**(TopBar `bg-[var(--gc-panel)]`),~~玻璃导航~~ 与代码不符;玻璃(backdrop-blur-xs/sm)仅用于 shadcn 遮罩层(dialog/sheet/alert-dialog)与全屏覆盖层。

## 5. 组件契约(锁定版)

- **run-button**(`NodeFrame.tsx` RunButton):唯一填充强调色控件,`bg-gold` 全宽;运行中 = 浅底(`--gc-panel-hover`)+ 呼吸动画(`btn-running-breathe` 1.6s)+ `--gc-warn-text` 状态文字(~~内联 spinner~~ 代码无 spinner,以代码为准);disabled = 40% 透明度中性。⚠ 已知代码问题:RunButton 前景用全局 `text-ink #0a0a0a`,浅底两主题为黑字 on 蓝 4.22:1 / 黑字 on 翡翠 3.66:1,应改用 `--gc-accent-cta-ink`(见 §11-B1)。
- **field-input**(`inputClass`):1px 边框恒定,零布局位移;focus = 边框变 gold(无环、即时、永不动画);错误 = 红系提示条(`red-900/50` 边 + `red-950/40` 底 + `red-400` 字,Tailwind 原生红,非 token)+ NodeFrame 底部错误条。
- **canvas-edge**(PulseEdge):stroke=`--gc-edge` 贝塞尔 + 同色箭头 marker;选中/hover 加粗发光;三颗 accent 光珠 SMIL 沿路径,源运行时增亮提速。
- **upload-slot / prompt-chip / 结果揭示**:见 §7。

## 6. 焦点环语言(锁定,新立章节)

可见焦点三形态,均为即时出现、永不动画:

1. **标准控件**(shadcn 体系,button/tabs/dropdown 等):`focus-visible:ring-3 + ring-ring/50`,ring 桥接 `--gc-accent`;
2. **上传区槽位**(ImageInputNode 两处):`focus-within:ring-2 + ring-gold/60`——R-45 已固化为 CI 断言(`scripts/verify-built-css.mjs` 宽度+颜色双断言);
3. **输入框/提示词板**:边框变 gold(`focus:border-gold`,chip 叠加左 3px 引用条增亮),无环。

全局 `outline-hidden` + 上述环/边框承担可见焦点;reduced-motion 全局兜底(duration/iteration 归零)。

## 7. V4 节点语言(锁定,新立章节)

`283e1e6` 落地,三主题同构:

- **缩略图槽**(ImageInputNode 空态):`aspect-4/3` + 圆角 10 + `--gc-node-border` 边 + `--gc-node-inner` 底;拖拽悬停 = gold 边 + `bg-gold/8` + gold 字;角标 mono `IMAGE · 槽位`;已上传态 = 图片 `max-h-40 object-contain`。
- **chip 提示词板**(`promptChipClass`):圆角 10 + **左 3px accent 引用条**(`border-l-gold`)+ `--gc-node-inner` 底;focus 时边框 `gold/70` + 左条全亮——与普通输入框以左条区分,非禁用态语义。
- **结果揭示动画**(`gc-result-reveal`):图片/视频通用 blur→clear 揭示,500ms `cubic-bezier(.2,.8,.2,1)`,`motion-safe:` 前缀,reduced-motion 直出;ImageGrid 每格挂载。
- **暗房显影占位**(Developing):gridlines + scanline + 「显影中」label,运行中显示于结果区。⚠ 已知残留:其色值硬编码旧金 `#c9a66b` 系,见 §11-B2。

## 8. 登录页 V4 分屏(锁定,补全)

结构 = 左品牌叙事区(装饰)+ 右登录卡(功能,`login-card`):

- **左栏**:`lg:flex`(≥1024 显示,**1024 以下整体隐藏**——旧文未记,补);GC 标 36px 圆角 10 accent 底 cta-ink 字;eyebrow mono 11px 0.18em;大标题 clamp(36-52)/1.08/-0.03em,强调词 accent;特性条 accent 光点;背景 = accent 6% radial + shell→panel 160° 渐变 + 28px 点阵(text-muted 18%)。
- **右栏**:480px 定宽;登录卡 `max-w-400` 圆角 20 内边距 36,**四层阴影**(0.5px hairline border-mix + 1/2 + 4/10 + 20/44);CTA 胶囊 980×46px,accent 底 + cta-ink 字 + accent 30% 投影,hover 上浮 1px 提亮,active 回落 0.98,disabled 40%。
- **a11y 裁决(R-44 固化)**:品牌区整块 `aria-hidden="true"` 恰当(零交互件、任务信息全在登录卡、营销/功能两套文案分离);e2e 断言必须用 `brandPane.getByText(...)`,禁止为测试转绿移除/挪动 aria-hidden。若品牌区出现真实功能件须移出该子树。

## 9. 动效纪律(锁定值)

~~三曲线三档(--dur-1/2/3 = 120/180/250ms)~~ 从未落地,作废。实际生效:

- tokens.css 两档:`--gc-dur-fast` 120ms(hover/按压)、`--gc-dur-base` 200ms(面板开合);两曲线 `--gc-ease-out` / `--gc-ease-in-out`;
- 组件级:handle 140ms ease(scale/box-shadow/filter);结果揭示 500ms;呼吸 1.6s;显影 scan 1.6s / gridfade 2s;
- 禁止项保持:`transition: all` 仅存于 shadcn 原语(官方模板自带,不改);动画焦点环禁止;节点悬浮只增强层级光影不改坐标;全局 `prefers-reduced-motion` 兜底(时长归零 + 显影/呼吸/句柄过渡显式关闭)。

## 10. 机读源与导出物状态(重要)

- 原机读源 `DESIGN.md`(Google DESIGN.md 格式,65 token,lint 0 error)**已丢失**:它从未进入 git(`git log --all -- "…/DESIGN.md"` 为空),且 macOS 大小写不敏感盘上与 `design.md` 同槽位,现存磁盘文件只有人读版。人读版第 4 行的自指链接自 Rev.1 起即悬空。
- 其导出物 `theme.css` / `tailwind.theme.json` / `tokens.json`(e62e4cb,9-18 11:23)停留在**旧黄时代**:`--color-ob-accent: #ffc940`、字阶 body 14px 等,均与现行代码不符。**在重新导出前,这三个文件不得作为事实源引用**。
- 本锁定版 front matter 以 `src/index.css`(head `e13de4c`)逐值重建,即当前唯一有效的机读事实源;命名延续原 DESIGN.md 的 ob-*/aw-*/eg-*/st-* 约定(经 theme.css 导出物证实),映射关系不变。
- 同目录 `tokens.css`(9-17)的字阶/间距/圆角段与现行实现一致,继续有效;其 §5a 之后的主题色段为旧黄时代值,以本文为准。
- 建议(不在本卡执行):由后续任务从本文重新导出三件套并覆盖旧导出物,恢复「lint → export」流水线。

## 11. 对齐不一致清单(2026-09-19,冻结时点)

### A. 规范侧偏差——已在本文以代码为准修订(9 项)

| # | 原文 | 代码实况 | 处置 |
|---|---|---|---|
| A1 | §1 曜黑行动色「活力黄」、对比度 11.6:1 | `#B7F35A`,13.51:1(`3d5f8f7`) | §1 改荧光绿 + 实测值;§9 版本记录补 V4 三连 |
| A2 | §0 Rev.2 例外:浅底 CTA 用 `#166534` | 全仓零匹配;实际 = `--gc-accent-cta-ink` 每主题自配 | §0 改写为 cta-ink 机制,旧例外标注作废 |
| A3 | §1 handle「默认中性色,交互才亮」 | accent 四档渐变宝石,常显即强调色 + 1px ring | §1 改为宝石形态描述 |
| A4 | §0/§5「四层软阴影、无边框」(节点卡) | 节点卡 = 1px 细边框 + 单层 10/28 阴影,hover 双层;四层在登录卡 | §0 铁律 3 改写,分层如实描述 |
| A5 | §4「玻璃导航」 | TopBar 实色 panel;玻璃仅遮罩层 | §4 改写 |
| A6 | §6 动效三曲线三档 120/180/250ms | 两档 120/200 + 组件级 140/500/1600ms | §9 改写 |
| A7 | §2「8 态」 | NodeRunStatus 9 值(cancelled=idle 色+60% 透明;retry_wait/cancel_requested 共用 retry) | §2 改 9 值映射表 |
| A8 | V4 节点语言、登录页响应式未记载 | 缩略图槽/chip 板/揭示动画已落地;登录品牌区 <1024 隐藏 | §7/§8 新立与补全 |
| A9 | §5 run-button「内联 spinner」;焦点环仅提 field-input | 运行中 = 呼吸动画 + 状态文字;焦点环实为三形态 | §5 改写;§6 新立焦点环语言 |

### B. 代码侧问题——本卡不改 `src/**`,报告 orchestrator 裁决(4 项 + 1 观察)

| # | 位置 | 问题 | 建议 |
|---|---|---|---|
| B1 | `NodeFrame.tsx` RunButton `text-ink` | 全局 `#0a0a0a` 不随主题:简白黑字 on 蓝 4.22:1、护眼黑字 on 翡翠 3.66:1(低于 AA 4.5),与登录 CTA(cta-ink,4.70/5.41)双标 | 改 `text-[var(--gc-accent-cta-ink)]` |
| B2 | `index.css` develop-overlay 段 | 「暗房显影」硬编码旧金 `#c9a66b`/`#806135`,三主题共用,浅底下仍呈暗金——荧光绿换装残留 | 换 `--gc-accent` 系或降中性 |
| B3 | `index.css` `.react-flow__connection-path` / `.react-flow__selection` | 拖拽连线预览与框选仍为旧金 `#c9a66b`/`rgba(201,166,107,…)`,未接 `--gc-edge`/accent | 接变量 |
| B4 | `index.css` 基础 `.react-flow__handle` 段(L112-149) | 旧金硬编码,仅靠 `[data-theme]` 段 `!important` 覆盖;theme.ts 同步应用下风险低,但存在首帧闪旧金窗口 + 双源维护 | 清理死值,收敛到变量段 |
| B5(观察) | 状态点浅底 | st-queued-light `#c79002` on 白 2.83:1、eye `#a1801a` 3.74:1,WCAG 1.4.11 非文本 3:1 边缘;有文字标签辅助,低风险 | 可选加深 |

### C. 零差异确认(任务要求明示)

- 三主题 token 实际值(`src/index.css`)与规范意图一致:荧光绿 `#B7F35A` ✓(含 `--gc-accent`/`--gc-node-accent`/`--gc-edge`/THEMES swatch/TopBar 预览色五处同步);
- 节点语言三件(缩略图槽/chip 提示词板/gc-result-reveal)与登录页分屏实况,本次已全部写进 §7/§8(A8 属「原文缺失」而非「代码偏离」);
- 焦点环 `ring-2 + ring-gold/60` 已入规范(§6.2)且为 CI 断言覆盖 ✓;
- gold 工具类三主题跟随、无第二金 ✓;状态色三档 27 值与代码一致 ✓;edge 语言一致 ✓;§8 aria-hidden 裁决与 e2e 口径一致 ✓。

## 12. 版本记录

- 2026-09-17 审核:15 项发现 → V1/V2/V3 迭代 → 三主题终配色(详见原文 §9)。
- 2026-09-18 定稿实施(`bd8b1fd`)+ Rev.1 评审修复(`92af4f7`)。
- Rev.2 例外条款(`08912f0`):CTA 深绿 `#166534`——**未落地,本锁定版正式作废**(A2)。
- R-44(`593eda8`/`f856879`):登录页 e2e 修复 + aria-hidden 裁决入 §8。
- R-45(`c35cd52`):上传区焦点环 CI 断言同步。
- V4 三连(均在 main,CI 5/5 绿):`3d5f8f7` 曜黑换荧光绿 · `283e1e6` 节点语言 · `0406807` 登录页分屏。
- **2026-09-19 本锁定版(R-47)**:与 head `e13de4c` 对齐后冻结;9 项规范修订(A1-A9)、4+1 项代码问题报告(B1-B5)、机读源丢失与导出物过期记录(§10)。
