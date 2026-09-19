# R-46 V4 三主题视觉验收（隔离实例 · ui-qa 独立验收）

- 验收人：ui-qa（独立验收，不采信实现者自述）
- 验收对象：`main` @ `e13de4c`（工作树干净；V4 六笔提交 `3d5f8f7` `283e1e6` `0406807` `a4c5698` `593eda8` `c35cd52` 均在 main）
- 验收日期：2026-09-19
- 结论：**4 项重点核验中 2 项通过、2 项不通过**；无 P0；P1 ×4、P2 ×1、P3 ×3
- 产出位置：`docs/design/2026-09-17-ui-audit/acceptance-v4/`（shots / measurements / scripts / logs）
- 说明：验收期间设计师的 R-47 锁定版（`99a9335`）落到 main —— **docs-only，未触及 `src/server/e2e/tests/scripts`**（`git diff --stat e13de4c 99a9335 -- src server e2e tests scripts` 为空），故本轮渲染量测对 `e13de4c` 的 src 依然有效。该锁定版 §11 的 B1–B5 代码问题报告已在本报告 §3.5 做独立渲染复核。

---

## 0. 结论摘要

| # | 重点核验项（来自任务卡） | 结论 | 关键实测值 |
|---|---|---|---|
| 1 | 主题切换后**无残留硬编码色** | **不通过** | ① `bg-gold` 在 简白/护眼绿 下恒为 `rgb(183,243,90)`（曜黑荧光绿）；② 旧金 `rgb(201,166,107)` 在 连线预览 / 框选 / 暗房显影 三主题**逐值相同** |
| 2 | 焦点环新语言（`ring-2 + ring-gold/60`）三主题**都可见** | **不通过** | 三主题环像素完全相同 `(212,248,156)`；对比度 **1.19:1**（vs 节点卡白底）、1.07–1.09:1（vs 槽内底色）；节点内 `textarea/input/select` 聚焦**零可见变化** |
| 3 | 结果揭示动画在 `prefers-reduced-motion` 下**不播** | **通过** | no-preference：`animationstart/end = gc-result-reveal` ×2；reduce：**0** 个 animation 事件 |
| 4 | **1024 档不溢出/不裁切**（登录页分屏是否挤压） | **通过** | 登录页 1024：`docScrollWidth=1024`，品牌区 544px 内零裁切，登录卡 400×442 落在 x=584..984；画布 1024（含 320px 面板展开）同样无真实溢出 |

> 人眼交叉核对（vision 模型看图，非本人主观）：`shots/cta/cta-enabled-white-1280.png` —— “卡片边框是蓝色，底部主按钮填充是**黄绿色**”。与机器量测一致。

---

## 1. 隔离实例（不复用 orchestrator 的 5173/3001）

| 项 | 值 |
|---|---|
| 测试库 | `garment_canvas_uiqa_test`（`GARMENT_CANVAS_TEST_DATABASE_URL`；库主 = `garment_canvas`，启动前 `RESET_DB=1` 清空 public schema） |
| 服务端口 | api `127.0.0.1:3411`（`tsx server/index.ts`）/ web `127.0.0.1:5411`（`vite --strictPort`） |
| DATA_DIR | `/tmp/gc-uiqa-v4/data`（`SQLITE_IMPORT_FILE` 指向不存在文件） |
| 账号 | `uiqa-v4-admin`（本轮初始化口令 → 首次登录改密） |
| 付费调用 | **零**：`APIYI_API_KEY=uiqa-disabled`、`APIYI_BASE_URL=https://127.0.0.1:9`；结果图由 Playwright `page.route("**/api/run-plan**")` 桩 SSE 提供 |
| 页面错误 | 全阶段 `pageerror = 0`（`measurements/page-errors.json`） |
| 渲染器 | Playwright + 真实 Chromium，原生视口尺寸（**非视口缩放仿真**），`locale=zh-CN`、`timezoneId=Asia/Shanghai` |

复现脚本在 `scripts/`（`bootstrap-db.mjs` → `run-stack.mjs` → `harness.mjs` → `probe-*.mjs`），量测脚本 `analyze-*.py` / `report-*.py`。

---

## 2. 验收矩阵（截图按「面 × 主题 × 宽度」组织）

主题 id：`current`（曜黑·荧光绿）/ `white`（简白）/ `eye`（护眼绿）；宽度：1024 / 1280 / 1440。

| 面 | 覆盖 | 截图目录 |
|---|---|---|
| 登录页（V4 分屏） | 3 主题 × 3 宽 + 登出后 + 聚焦特写 + 1024 全页 | `shots/login/`（13） |
| 画布 + 节点卡（图案风格迁移项目：2× image-input + ai-modify + result） | 3 主题 × 3 宽 | `shots/canvas/canvas-pattern-*`（9） |
| 画布 + 节点卡（文生图项目：sketch-to-render + result，含桩结果图） | 3 主题 × 3 宽 | `shots/canvas/canvas-text-*`（9） |
| 缩略图槽 空态 / 填充态（真实上传） | 3 主题（1280） | `shots/focus-ring/slot-*`（6） |
| 主 CTA（RunButton 启用态，桩运行成功） | 3 主题（1280） | `shots/cta/cta-enabled-*`（3） |
| 面板：Inspector（空态）/ Inspector（选中节点）/ 结果·记录 / 节点库 / 素材库浮层 | 3 主题 × 3 宽（选中态 3 主题 × 1280） | `shots/panels/`（42） |
| 顶栏 + 主题切换器（菜单展开态） | 3 主题（1280）；顶栏随画布截图覆盖 3×3 | `shots/panels/theme-menu-*`（3） |
| 焦点环像素特写（槽 / chip） | 3 主题（1280） | `shots/focus-ring/focus-*`（6） |
| 动效（桩运行前 / 揭示后） | 1280 | `shots/canvas/00-*.png`（2） |
| 交互态（连线预览 / 框选 / 暗房显影运行中） | 三主题（1280） | `shots/interaction/`（8） |

截图清单含 md5 与字节数：`measurements/shots-index.json`。

---

## 3. 逐条结论与证据

### 3.1 主题切换后无残留硬编码色 —— 不通过（P1-2 `bg-gold` / P1-4 旧金 `#c9a66b`）

实测（`measurements/color-audit/audit-<theme>-1280.json`，同一 DOM 路径三主题比对）：

| 元素 | 源码类 | 曜黑实测 | 简白实测 | 护眼绿实测 | 判定 |
|---|---|---|---|---|---|
| RunButton「生成效果图」 | `bg-gold text-ink` | `rgb(183,243,90)` | `rgb(183,243,90)` | `rgb(183,243,90)` | **未跟随** |
| 结果节点「保存全部到文件夹」 | `bg-gold … text-ink` | `rgb(183,243,90)` | `rgb(183,243,90)` | `rgb(183,243,90)` | **未跟随** |
| 节点卡（选中） | `border-gold` | `rgb(183,243,90)` | `rgb(0,113,227)` | `rgb(11,122,67)` | 跟随 ✓ |
| Inspector「未设置」 | `text-gold` | `rgb(183,243,90)` | `rgb(0,113,227)` | `rgb(11,122,67)` | 跟随 ✓ |

启用态 CTA 像素取证（桩运行成功、按钮 `disabled=false opacity=1`，`measurements/results-cta-enabled.json`）：

```
current  accent=#B7F35A  CTA 像素=(183,243,90)  节点卡底色=(242,243,245)
white    accent=#0071e3  CTA 像素=(183,243,90)  节点卡底色=(245,245,247)
eye      accent=#0B7A43  CTA 像素=(183,243,90)  节点卡底色=(240,246,241)
```

规格依据：`docs/design/2026-09-17-ui-audit/design.md` §3 ——
「历史 `text-gold / border-gold / bg-gold` Tailwind 类**跟随各主题 accent**：曜黑→活力黄、简白→蓝、护眼绿→翡翠 …… **禁止再引入第二金色**」。
实测表明：反查段只覆盖了 `text-gold` 与 `border-gold`（`src/index.css:295`、`322`、`379-381`），`bg-gold` 无 white/eye 反查 → 简白/护眼绿下出现**第二强调色**（曜黑荧光绿），且落在「唯一填充强调色控件」run-button 上（design.md §5）。

机理（源码定位，供实现方修）：
- `src/index.css:13` —— `--color-gold: #B7F35A` 是**静态回退**，不随 `--gc-accent` 走；
- `src/index.css:379-381` —— 仅 `[data-theme="current"]` 定义了 `.text-gold/.border-gold/.bg-gold`；
- `src/index.css:295 / 322` —— white/eye 只反查了 `.text-gold`（**未**覆盖 `.bg-gold`、`.border-gold\/60`、`.bg-gold\/10`、`.ring-gold`、`.border-l-gold` 等带修饰的类名）。
- 同类风险（**源码层面列举，未逐项渲染实测**）：`src/App.tsx:375`（`border-gold/60`）、`src/components/ImageViewer.tsx:182`（`bg-gold`）、`src/components/nodes/ResultNode.tsx:127`、`src/components/nodes/MaskEditor.tsx:381,401`、`src/components/panels/ResultsPanel.tsx:86`（`border-gold/60 bg-gold/10`）。

### 3.2 焦点环新语言三主题可见性 —— 不通过（P1-3）

缩略图槽 `focus-within:ring-2 focus-within:ring-gold/60`（`src/components/nodes/ImageInputNode.tsx:164`）实测：

| 主题 | 聚焦后 box-shadow 中环颜色 | 环像素（截图采样） | vs 节点卡白底 | vs 槽内底色 |
|---|---|---|---|---|
| current | `oklab(0.894 -0.118 0.150 / 0.6)` | `(212,248,156)` | **1.19:1** | 1.07:1 |
| white | 同上（完全相同） | `(212,248,156)` | **1.19:1** | 1.09:1 |
| eye | 同上（完全相同） | `(212,248,156)` | **1.19:1** | 1.08:1 |

- 环 = `#B7F35A @ 60%` 叠白底，三主题逐像素相同 → 既**未跟随主题**，又**远低于 WCAG 2.4.11 / 1.4.11 的 3:1**。
- 证据：`measurements/results-focus.json`、`shots/focus-ring/focus-thumbSlot-*.png`、`shots/focus-ring/ring-slot-*.png`。
- 人眼层：vision 模型看 `focus-thumbSlot-white-1280.png` 认为“描边清晰可见”。**与人眼印象不矛盾**（亮色环在纯白上仍可被色相区分），但结论按可测标准判定为不达标；两处证据都写在报告里，由裁定方决定口径。

节点内输入控件聚焦**零可见变化**（同一 `results-focus.json`，聚焦前后对比）：

| 目标 | 聚焦前后 | 说明 |
|---|---|---|
| `.gc-node-card textarea`（V4 chip 提示词板） | `box-shadow: none → none`；`border-color` 不变；`outline-style: none` | 无任何焦点指示 |
| `.gc-node-card select` | `border-color` 不变；`outline-style: none` | 无任何焦点指示 |
| 「从素材库选择」按钮 | `border/shadow` 不变、无 outline | 无任何焦点指示（P2-1） |

机理（源码定位）：`src/index.css:535-541`
`[data-theme] .gc-node-card input/textarea/select { border-color: var(--gc-node-border) !important; }`
以 `!important` 覆盖了组件自身的 `focus:border-gold/70` / `focus:border-gold`（`src/components/nodes/NodeFrame.tsx:234-239`），因此
**V4 chip 的「左侧 3px accent 引用条」虽然几何存在（实测 `border-left-width: 3px`），颜色却等于普通边框色**（current `rgb(228,230,234)` / white `rgba(0,0,0,.08)` / eye `rgb(226,236,228)`）——
即 `border-l-gold` 同被 `!important` 吃掉，chip 与普通输入框的 V4 区分手段在渲染上失效。

对照组（通过）：登录页账号输入框聚焦 —— 1px 强调色边框 `rgb(183,243,90)` vs 卡底 `rgb(33,36,42)` = **11.83:1**（可见 ✓），另有 3px 18% 光晕 = 1.62:1（偏弱，P3-2）。

### 3.3 reduced-motion 下的结果揭示动画 —— 通过

同一页面、同一节点、连续两次桩运行，仅切换 `emulateMedia(reducedMotion)`（`measurements/results-matrix.json → extras.anim*`）：

```
no-preference : runTriggered=true, revealEvents=[start gc-result-reveal ×2, end ×2]
reduce        : runTriggered=true, revealEvents=[], animationEvents=[]
```

- 实现：`src/components/nodes/ImageGrid.tsx:32`（`motion-safe:animate-[gc-result-reveal…] motion-reduce:animate-none`）+ `src/index.css:239-247` 关键帧 —— **行为符合预期**。
- 附带观察（P3-1）：reduce 模式下仍有 **90** 条 `transitionrun`（属性含 `transform` / `translate` / `d` / `visibility` / `aspect-ratio` / 颜色类）与 **1** 个下拉菜单 `enter` 动画（tw-animate-css）。均非本次验收点，但属「动效纪律」（design.md §6）可收紧项。

### 3.4 1024 档不溢出 / 不裁切 —— 通过

| 场景 | 实测 | 结论 |
|---|---|---|
| 登录页 1024×768 | `docScrollWidth=1024`；品牌区 `[0,0,544,768]`，内部元素越界数 **0**；登录卡 `[584,163,984,605]`（400×442）；`paneScrollHeight==clientHeight` | 无溢出、无裁切、分屏未挤压 ✓ |
| 登录页 1280 / 1440 | 无横向溢出；品牌区 800 / 960；卡均在右列且留边 ≥24px | ✓ |
| 画布 1024（面板关闭） | `docScrollWidth=1024`；节点 `rf__node-generate [100,288,380,991]`、`rf__node-result [530,288,810,701]` 均在视口内 | ✓ |
| 画布 1024（Inspector 展开 320px） | `docScrollWidth=1024`；`offendersOutside=1`（`INPUT` 12×12 为 sr-only 文件输入，非可见裁切） | ✓ |
| 画布 1280 / 1440 × 3 主题 | 命中项仅 `sr-only` 文本 / 1px 隐藏元素，无真实可见溢出 | ✓ |

证据：`measurements/results-matrix.json`（每档 `patternOverflow` / `textOverflow`）、`results-probe4.json`（`login1024`）、`results-panels.json`（`overflowWithDockOpen`）、`shots/login/login-1024-full.png`。

---

### 3.5 R-47 锁定版 §11 B1–B5 的独立渲染复核（不采信自述）

设计师锁定版（`99a9335`）自报了 4+1 项代码侧问题。本轮以渲染实况逐条复核（`measurements/results-b-probe.json`）：

| 编号 | 自述 | 独立复核结论 | 实测证据 |
|---|---|---|---|
| B1 | RunButton 前景 `text-ink #0a0a0a` 不随主题，浅底主题对比度 4.22:1 / 3.66:1 | **确认**（且给出耦合提示） | 实测前景恒为 `rgb(10,10,10)`；计算复核 `#0a0a0a` on `#0071e3` = **4.22:1**、on `#0B7A43` = **3.66:1**（与其数字一致）；token `--gc-accent-cta-ink=#ffffff` 为 4.70 / 5.41。**当前**因 P1-2 未修，实际是 `#0a0a0a` on `#B7F35A` = 15.07:1（不报错但配色错）→ **B1 与 P1-2 必须同批修**，只修背景会立刻引入 AA 不达标 |
| B2 | 暗房显影硬编码旧金 `#c9a66b/#806135` | **确认（并升级为可见缺陷）** | 在 **简白**主题运行中态实测 5 处：`develop-overlay` `linear-gradient(rgba(201,166,107,.05), …)`, `develop-gridlines` `rgba(201,166,107,.13)`, `develop-scanline` `rgb(201,166,107)` + `0 0 12px` 光晕, `develop-label` `rgba(201,166,107,.8)`；截图 `shots/interaction/b2-developing-white-1280.png` |
| B3 | `.react-flow__connection-path` / `.react-flow__selection` 仍为旧金未接变量 | **确认（并扩大结论）** | 连线预览 `stroke=rgb(201,166,107)`、框选 `background=rgba(201,166,107,.08)` / `border=rgba(201,166,107,.4)`，在 current / white / eye **三主题完全逐值相同** → 旧金在浅底主题下同样出现，不只是「未接变量」；截图 `shots/interaction/b3-connection-*.png`、`b3-selection-*.png` |
| B4 | 基础 `.react-flow__handle` 段旧金硬编码，仅靠 `!important` 覆盖；首帧有闪旧金窗口 | **部分确认**：渲染层**无影响** | 三主题实测 handle 渐变分别为 `rgb(220,255,171)→…→rgb(183,243,90)` / `rgb(214,236,255)→…→rgb(0,113,227)` / `rgb(210,236,220)→…→rgb(11,122,67)`，均为对应主题 accent 系，**未出现旧金**；「首帧闪旧金」为时序窗口，本轮未实测 |
| B5 | 状态点浅底 `st-queued-light #c79002` 2.83:1 / `#a1801a` 3.74:1 | **未复核** | 本轮可见 DOM 未出现 queued 状态点（桩运行状态跃迁过快），按未验证处理 |

### 3.6 焦点环与 chip 的「规范 vs 渲染」对照（锁定版 §5/§7）

锁定版 §5 写「**field-input**：focus = 边框变 gold（无环、即时、永不动画）」，§7 写「**chip 提示词板**：左 3px accent 引用条 + focus 时边框 gold/70 + 左条全亮」。渲染实况（`results-focus.json`）：

| 规范期望 | 渲染实况 | 差异 |
|---|---|---|
| field-input 聚焦边框变 gold | 边框色与未聚焦**完全相同**（current `rgb(228,230,234)` / white `rgba(0,0,0,.08)` / eye `rgb(226,236,228)`），`outline-style: none` | **规范未落地**（`src/index.css:535-541` 的 `!important` 覆盖） |
| chip 左 3px accent 引用条 | 几何在（`border-left-width: 3px`）但颜色 **= 普通边框色**，三主题都不是 accent | **规范未落地**（同因） |
| chip 聚焦边框 gold/70 + 左条全亮 | 无任何变化 | **规范未落地**（同因） |

即：P1-3 不只是「环太淡」，而是**节点内所有输入控件的焦点态与 V4 chip 的区分设计被 `!important` 反查整体吃掉**。

---

## 4. Findings（P0–P3）

| 级别 | 编号 | 现象 | 证据（截图 / 量测 / 代码） | 期望（规范依据） |
|---|---|---|---|---|
| P1 | 1 | **登录页完全不应用主题**：`data-theme` 缺失，白/护眼主题用户（含从简白工作台登出）看到的仍是曜黑登录页 | `measurements/results-logout-theme.json`：white→`dataThemeAttr=null, accentToken=#B7F35A, cardBg=rgb(33,36,42)`，`localStorageTheme=white`，硬刷新后同；`shots/login/login-{current,white,eye}-{1024,1280,1440}.png` **三主题 md5 完全相同**（`43769032e8` / `11a0dd1693` / `abf1315ce4`）；登出后截图与曜黑登录页仅差 2×58px 输入框光标；机理：`src/lib/theme.ts:57-59` 只在模块加载时应用主题，而 `theme.ts` 仅被 `src/components/CanvasFlow.tsx:22` 与 `src/components/panels/TopBar.tsx:20` 引入（登录页不经这两处） | 主题机制 = `data-theme` + `--gc-*` 单一事实源（AGENTS.md §2 / design.md §7）；V4 登录卡自称「token 化、全主题适配」（`0406807`）。**任一修法都可，但需裁定**：① 登录页挂载即应用主题；② 明确裁定「登录页恒曜黑」并在 design.md 固化（那么 V4 卡的 token 化只是内部一致，验收口径要改） |
| P1 | 2 | **`bg-gold` 未 token 化**：简白/护眼绿下 run-button 与结果节点主按钮仍是曜黑荧光绿（第二金色） | `measurements/results-cta-enabled.json`（三主题 CTA 像素 `(183,243,90)`，accent `#0071e3`/`#0B7A43`）；`shots/cta/cta-enabled-white-1280.png`；代码 `src/index.css:13,295,322,379-381` + `NodeFrame.tsx:188`、`ResultNode.tsx:127` | design.md §3「bg-gold 跟随各主题 accent，禁止再引入第二金色」、§5「run-button 是唯一填充强调色控件」 |
| P1 | 3 | **新焦点环不可达 3:1 且不随主题**：`ring-gold/60` 三主题同为 `#B7F35A@60%`（叠白 `(212,248,156)`，1.19:1）；节点内 `input/textarea/select` 聚焦无任何可见变化（`!important` 反查覆盖 focus 态）；chip 的 3px 左侧强调条同样被覆盖 | `measurements/results-focus.json`、`shots/focus-ring/focus-thumbSlot-*.png`、`shots/focus-ring/focus-promptChipTextarea-*.png`、代码 `src/index.css:535-541` + `NodeFrame.tsx:234-239` + `ImageInputNode.tsx:164,190` | AGENTS.md §2「保留键盘操作、可见焦点」；WCAG 2.4.11/1.4.11 ≥3:1；design.md §5「field-input 焦点环即时出现」 |
| P1 | 4 | **旧金 `#c9a66b` 残留**：连线预览、框选、暗房显影（运行中）在三主题下**逐值相同**，浅底主题同样渲染旧金 | `measurements/results-b-probe.json`（`connection.stroke=rgb(201,166,107)`；`selection=rgba(201,166,107,.08/.4)`；`develop-*` 5 处 `rgba(201,166,107,…)`）；`shots/interaction/b3-connection-*.png`、`b3-selection-*.png`、`b2-developing-white-1280.png` | 主题切换后零残留（任务卡重点核验项 1）；design.md §6「canvas-edge = 强调色贝塞尔 + 同色箭头，三主题同规则」 |
| P2 | 1 | **「从素材库选择」按钮无任何焦点样式**（键盘聚焦后无视觉反馈） | `results-focus.json` → `assetPickerButton: changed=0, outline-style=none`；代码 `ImageInputNode.tsx:180-186`（仅 `hover:` 样式） | 同上（可见焦点） |
| P3 | 1 | reduce 模式仍执行 90 条过渡（含 `transform/translate/d`）与 1 个菜单 `enter` 动画 | `results-probe4.json → reduceMotion.transitionNames` | design.md §6 动效纪律（全局 reduced-motion 兜底）——非本次验收项 |
| P3 | 2 | 登录页输入框焦点 3px 光晕仅 1.62:1（靠 1px 边框 11.83:1 兜底） | `results-probe4.json → loginFocus`；`shots/login/login-focus-account-1280.png` | 焦点指示 ≥3:1（建议提高 ring 不透明度或 2px 边框） |
| P3 | 3 | 带修饰的 gold 工具类（`border-gold/60`、`bg-gold/10`、`bg-gold/8`、`hover:text-gold`、`ring-gold/70`）按类名无法命中现有 white/eye 反查段 | 源码：`src/App.tsx:375`、`ResultsPanel.tsx:40,86,147-149`、`ImageInputNode.tsx:166`、`UpscaleNode.tsx:37`、`FabricRecolorNode.tsx:136`（**未逐项渲染实测**，因为相关控件在本轮可见 DOM 中未出现） | design.md §7「新组件直接用 `var(--gc-*)`，不再新增反查规则」 |

**P0：无。**

---

## 5. 未验证项 / 降级说明（fail-closed 口径）

1. **结果面板「最近生成」列表态未验证**：列表数据来自服务端真实运行记录，本轮为桩运行（不产生服务端结果）；只验证了空态文案与布局（`shots/panels/panel-results-*.png`：`最近生成 0 条 …`）。列表态、对比、下载按钮的视觉未取证。
2. **登录页 white/eye 渲染无法取证**：被 P1-1 阻塞（截图字节等同于曜黑）。
3. **启用态 RunButton 的键盘焦点指示未实测**：启用态只出现在桩运行会话内，该会话未做 Tab 序列测量；源码 `NodeFrame.tsx:180-199` 无 `focus-visible` 样式，**疑同 P2-1**，按未验证处理。
4. **仅 Chromium**：项目 e2e 亦仅 chromium；未覆盖 WebKit/Firefox。「真机模式」= 真实 Chromium 渲染 + 原生视口（非缩放仿真），非移动端真机（产品为桌面专用，最小 1024）。
5. **未跑项目完整门禁**：本次为只读验收 + docs-only 产出（未改 `src/**`），未执行 `npm run check` / `gate:codex` / CI；提交仅限 `docs/design/2026-09-17-ui-audit/acceptance-v4/`。
6. **P3-3 的 `/opacity` gold 变体仅源码列举**，未逐项渲染实测。
7. **B5（状态点浅底对比度）未复核**：可见 DOM 未出现 queued 状态点；**B4 首帧闪旧金窗口未实测**（渲染终态无旧金，见 §3.5）。
8. **`bg-gold` 的 /opacity 变体（`bg-gold/8`、`bg-gold/10`、`border-gold/60`、`ring-gold/70`、`hover:text-gold`）未逐项渲染实测**：本轮可见 DOM 未出现（相关控件依赖素材库/结果列表等未进入的状态）。

---

## 6. 方法说明（严格区分「机器量测」与「人眼判断」）

- **机器量测**（本报告所有数值）：
  - 渲染：Playwright + Chromium，真实视口；`page.emulateMedia({reducedMotion})` 做对照；`page.route` 桩 SSE 产生结果图（不触达 provider）。
  - 取值：`getComputedStyle` / `getBoundingClientRect` / `document.elementFromPoint` 级别的 DOM 采样；焦点前后 **delta 对比**（先 `blur()` 再 `focus()`，两次快照）。
  - 动效：`document` 级 `animationstart/animationend/transitionrun` 事件记录（捕获冒泡阶段）。
  - 像素：Playwright `clip` 截图 + PIL 逐像素采样；对比度按 **WCAG 相对亮度**公式 `(L1+0.05)/(L2+0.05)`，半透明色按 α 合成到实测底色后计算。半透明示例：`ring-gold/60` → `0.6×(183,243,90)+0.4×(255,255,255)=(212,248,156)`，与截图实测像素完全一致。
- **人眼判断**（仅 2 处，均标注来源）：`vision` 模型对 `cta-enabled-white-1280.png`（黄绿按钮）与 `focus-thumbSlot-white-1280.png`（环可见性）的描述。
- 二者不一致处已并列呈现（3.2 节），未以人眼印象推翻机器数值，也未以机器数值抹掉人眼观察。

---

## 7. 目录索引

```
acceptance-v4/
├── README.md                     ← 本报告
├── shots/
│   ├── login/        (13)        登录页：三主题三宽 + 登出后 + 聚焦特写 + 1024 全页
│   ├── canvas/       (23)        画布 + 节点卡（两个项目）+ 桩运行前后
│   ├── focus-ring/   (15)        空/填充缩略图槽、焦点环像素特写
│   ├── cta/          (6)         主 CTA（启用态 3 + 全屏 3）
│   ├── panels/       (42)        Inspector / 结果 / 节点库 / 素材库 / 主题菜单
│   ├── interaction/  (8)         连线预览 / 框选 / 暗房显影（B2/B3 复核）
│   └── misc/         (12)        其余（chip 特写、切换主题后的工作台）
├── measurements/                 results-*.json（量测原始值）、color-audit/*.json（三主题计算样式全量）、shots-index.json（md5+字节）
├── scripts/                      隔离栈、harness、探针与像素分析脚本（可复现）
└── logs/harness.log              主 harness 运行日志（含逐档进度与断言输出）
```

截图总量 119 张 / 约 15.6 MB（PNG optimize）。`measurements/shots-index.json` 含每张图的 md5，可核验未被二次修改。
