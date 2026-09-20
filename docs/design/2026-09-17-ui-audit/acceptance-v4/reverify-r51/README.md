# R-51 复验：V4 验收 4 条 P1 的修复结果（隔离实例 · ui-qa 独立复验）

- 复验人：ui-qa（独立复验，不采信实现者自述）
- 复验日期：2026-09-19
- **验收对象（基线）：`main` @ `a624571`** —— 独立 worktree `/tmp/gc-uiqa-r51/main`（`git rev-parse HEAD` = `a624571`，工作树干净）
- 结论：**P1-1 不通过（未修复）、P1-2 通过、P1-3 通过（声明值 ≥3:1；渲染像素在画布缩放下未达 3:1，见 P3-1）、P1-4 通过（DOM 计算样式层零残留；另发现 canvas 2D 层旧金残留，见 P2-2）**
- 新发现：P2 ×2、P3 ×4（其中 P2-1、P3-3 为承接 R-46 的未闭合项，本轮给出 a624571 上的实测/源码证据）
- 产出：本目录（`shots/` 75 张、`measurements/` 13 份 JSON、`scripts/` 可复现脚本、`logs/` 运行日志）；**未覆盖 `acceptance-v4/` 首轮数据**（首轮 README/shots/measurements 保持原状）
- **裁决补记（2026-09-19，R-56）**：P1-1 已经用户裁定为首轮 README 给出的选项②——**登录页品牌固定（恒曜黑 · 荧光绿），有意为之，不是缺陷** ✓。裁决全文见 [`../../DESIGN-Rev2.1-2026-09-19-login-brand-fixed.md`](../../DESIGN-Rev2.1-2026-09-19-login-brand-fixed.md)。本报告全部量测事实（`data-theme=null` / `#B7F35A` / 卡底 / md5 / 机理定位）原样有效，仅「不通过」的缺陷定性被该裁决翻转；**未来审计不要再重复上报此条**。

---

## 0. 结论摘要

| 编号 | 复验项 | 结论 | 关键实测值（机器量测） |
|---|---|---|---|
| P1-1 | 登录页在 white/eye 下是否真的换肤 | **不通过**（未修复，且无对应修复提交） | 三主题登录页 `data-theme=null`、`--gc-accent=#B7F35A`、登录卡底 `rgb(33,36,42)` 恒等；截图 md5 `current` 与 `eye` **逐字节相同**（`b472e977…`），`white` 差异仅 13 px（max channel delta = 1，输入框光标） |
| P1-2 | `bg-gold` 在简白/护眼绿下是否跟随各自 accent | **通过** | 启用态 CTA 背景 `rgb(183,243,90)` / `rgb(0,113,227)` / `rgb(11,122,67)`；前景 `rgb(19,19,19)` / `#fff` / `#fff`；对比度 **14.14 / 4.70 / 5.41:1**；截图像素众数与声明值逐值相等 |
| P1-3 | 焦点环三主题对比度 + 节点内输入聚焦可见变化 + chip 强调条 | **通过（声明值）**；渲染像素未达 3:1（P3-1） | 环声明 `rgb(74,122,23) 0px 0px 0px 2px` / `rgb(0,102,204)` / `rgb(11,122,67)`（blur 时 = none）；声明环色对比 **4.63 / 5.11 / 4.94:1**（vs 节点卡内底）· **5.14 / 5.57 / 5.41:1**（vs 纯白）≥3:1；chip textarea/select 聚焦 **边框可见变化**；chip 左条 `3px` = `--gc-node-accent` ✓ |
| P1-4 | 连线预览/框选/暗房显影是否跟随主题（旧金零残留） | **通过（计算样式层）** | 连线 `stroke` = 三主题 accent；框选 = accent@8% / @40%；暗房 `develop-overlay/gridlines/scanline` = accent 系；`#c9a66b`/`rgba(201,166,107,…)` 计算样式扫描三主题 **0 命中**；另见 P2-2（canvas 2D 点阵仍旧金） |

---

## 1. 基线校准（重要）

orchestrator 在复验期间给出校准：正确基线是 `main` @ `a624571`（= `3250708` + R-50 `bec1163` 的 cherry-pick）。本报告所有数值均在 `a624571` 的独立 worktree 上**重跑取得**。

| 事实 | 证据 |
|---|---|
| 校准前我自建的基线 `/tmp/gc-uiqa-r51/base`（`3250708` + R-50 diff 手工 applied）与 `a624571` 的 `src/`+`scripts/` **逐字节相同**，故旧跑法结论未被推翻 | `git -C /tmp/gc-uiqa-r51/base diff --stat a624571 -- src scripts` 输出为空；`src/index.css` sha256 = `6e1cbeec6512c121d9ba565060ba971839d6bd0eb2673c66ed8cd006d4b7d930`（base 与 bec1163 两树一致） |
| **共享工作树 HEAD 不能作为基线**：`refactor/three-node-model` @ `bec1163` 起不来 | `logs/stack-broken-bec1163.log`：api `SyntaxError: The requested module '../../src/types/workflow' does not provide an export named 'allowedOperationModesForNode'`；vite `✘ [ERROR] No matching export in "src/types/workflow.ts" for import "allowedOperationModesForNode" / "defaultOperationModeForNode" / "imageModelOptionsErrorForOperation"`（P2-a 中间态，归 P2-b/P2-c） |
| 本轮全部结论对应的提交范围 | `main` = `3250708`（含 `54198a9` 的 P1-2/P1-4 修复）+ `a624571`（R-50 的 P1-3 修复），两者均在 `a624571` |

## 2. 隔离栈（不复用 orchestrator 的 5173/3001）

| 项 | 值 |
|---|---|
| 验收树 | `/tmp/gc-uiqa-r51/main` @ `a624571`（`git worktree add --detach`；`node_modules` 软链主仓） |
| 测试库 | `garment_canvas_uiqa_test`（复用既有隔离库，未 `RESET_DB`；库主 `garment_canvas`） |
| 端口 | api `127.0.0.1:3411`（`tsx server/index.ts`）/ web `127.0.0.1:5411`（`vite --strictPort`） |
| DATA_DIR | `/tmp/gc-uiqa-r51/data`（`SQLITE_IMPORT_FILE` 指向不存在文件） |
| 付费封死 | `APIYI_API_KEY=uiqa-disabled`、`APIYI_BASE_URL=https://127.0.0.1:9`、`ENABLE_PAID_EVALUATION_RUNS=false`、`AI_TIMEOUT_MS=500`、`GENERATION_WORKER_POLL_MS=60000`；结果图由 Playwright `page.route("**/api/run-plan**")` 桩 SSE 提供（**零付费调用**） |
| 页面错误 | 全部探针 `pageerror = 0`（`measurements/page-errors` 口径见各 JSON 的 `errors` 字段） |
| 渲染器 | Playwright + 真实 Chromium，原生视口 1280×720（本轮聚焦复验 4 条 P1；三档宽溢出矩阵见首轮 README §3.4），`locale=zh-CN`、`timezoneId=Asia/Shanghai` |

---

## 3. 逐条复验

### 3.1 P1-1 登录页 white/eye 换肤 —— **不通过**（未修复）

> **裁决补记（2026-09-19，R-56）**：本条已裁定为首轮 README 给出的选项②——登录页**品牌固定（恒曜黑 · 荧光绿），有意为之** ✓，不是缺陷。量测事实不变，定性翻转，详见 [`../../DESIGN-Rev2.1-2026-09-19-login-brand-fixed.md`](../../DESIGN-Rev2.1-2026-09-19-login-brand-fixed.md) §1/§3。

机器量测（`measurements/p1-1-login-theme.json`、`measurements/p1-1-diff` 见 `scripts/analyze-p1-1-diff.mjs` 输出）：

| 主题 | `data-theme` | `--gc-accent` | 登录卡底色 | 截图 md5（`shots/p1-1-login-*-1280.png`） |
|---|---|---|---|---|
| current | `null` | `#B7F35A` | `rgb(33, 36, 42)` | `b472e9779d9444cf09665c6cd092e32d` |
| white | `null` | `#B7F35A` | `rgb(33, 36, 42)` | `933a9e3f351670ae93853513826f4b40` |
| eye | `null` | `#B7F35A` | `rgb(33, 36, 42)` | `b472e9779d9444cf09665c6cd092e32d` |

- `current` 与 `eye` 截图 **逐字节相同**；`current` vs `white` 差 13 px，`maxChannelDelta = 1`，bbox `[876,343 → 877,400]`（1px 宽竖条）= 账号输入框光标闪烁造成的抖动，**不是换肤**（该区域像素差 ≤1/255）。
- 真实用户路径（简白工作台登出后）：`data-theme=null`、`localStorageTheme=white`、`--gc-accent` 仍 `#B7F35A`、卡底 `rgb(33,36,42)`（`shots/p1-1-login-after-logout-white-1280.png`）。
- 机理（源码定位）：`src/lib/theme.ts:56-59` 只在**模块加载时** `applyTheme`，而 `theme.ts` 仅被 `src/components/CanvasFlow.tsx:22`、`src/components/panels/TopBar.tsx:20` 引入 → 未认证的登录页（`src/auth/LoginPage.tsx:94` 的 `data-testid="login-card"`）路径上无人设置 `data-theme`。
- **该条没有任何修复提交**：`git log --oneline 8a39196..3250708 -- src/lib/theme.ts src/auth src/pages src/App.tsx` 为空；`54198a9` 仅改 6 个文件（`ImageViewer`/`MaskEditor`/`NodeFrame`/`ResultNode`/`ResultsPanel`/`index.css`），`a624571` 仅改 R-50 的 5 个文件，均不涉主题挂载点。
- 期望依据：AGENTS.md §2「主题归属仍为 `data-theme` + `--gc-*`」；首轮 README P1-1 曾要求**裁定**（① 登录页挂载即应用主题，或 ② 明确裁定「登录页恒曜黑」并在 design.md 固化）。**当前两种都没发生** → 复验仍判不通过。

### 3.2 P1-2 `bg-gold` 浅底泄漏 —— **通过**

启用态取证（桩运行成功、按钮 `disabled=false`、`opacity=1`，`measurements/p1-2-bg-gold.json` + `measurements/p1-2-analysis.json`）：

| 主题 | `--gc-accent` | 声明背景（CTA） | 声明前景 | 对比度 | 截图众数像素 |
|---|---|---|---|---|---|
| current | `#B7F35A` | `rgb(183, 243, 90)` | `rgb(19, 19, 19)` | **14.14:1** | `[183,243,90]`（与声明逐值相等） |
| white | `#0071e3` | `rgb(0, 113, 227)` | `rgb(255, 255, 255)` | **4.70:1** | `[0,113,227]` |
| eye | `#0B7A43` | `rgb(11, 122, 67)` | `rgb(255, 255, 255)` | **5.41:1** | `[11,122,67]` |

- 修复前（R-46 实测）：三主题恒 `(183,243,90)`；本轮已各自跟随 accent，**不再出现曜黑荧光绿**。
- 同批跟随主题的其它 `bg-gold`/`border-gold`/`text-gold` 元素（同一 DOM 路径三主题比对，`measurements/p1-2-analysis.json → auditRows`）：
  - Inspector「运行此节点」`bg-gold`：`rgb(183,243,90)` / `rgb(0,113,227)` / `rgb(11,122,67)` ✓
  - 结果节点「保存全部到文件夹」`bg-gold`（`disabled` → `opacity 0.4`）：同上跟随 ✓
  - Inspector「未设置」`text-gold`：`rgb(183,243,90)` / `rgb(0,113,227)` / `rgb(11,122,67)` ✓
  - 选中节点卡 `border-gold`：`rgb(183,243,90)` / `rgb(0,113,227)` / `rgb(11,122,67)` ✓
- 截图：`shots/p1-2-cta-{current,white,eye}-1280.png`；对比度总表 `measurements/contrast-table.json`。

### 3.3 P1-3 焦点环 + 输入焦点态 + chip 强调条 —— **通过（声明值口径）**

缩略图槽 `focus-within:ring-2 ring-(--gc-accent-deep)`（`ImageInputNode.tsx:164`）：

| 主题 | blur `boxShadow` | focus `boxShadow` | 声明环对比度（vs 卡内底 / 纯白） | 渲染环最深像素（画布 fitView） |
|---|---|---|---|---|
| current | `none` | `rgb(74,122,23) 0px 0px 0px 2px` | **4.63:1 / 5.14:1** | `rgb(145,174,114)` → 2.47:1 |
| white | `none` | `rgb(0,102,204) 0px 0px 0px 2px` | **5.11:1 / 5.57:1** | `rgb(100,162,224)` → 2.70:1 |
| eye | `none` | `rgb(11,122,67) 0px 0px 0px 2px` | **4.94:1 / 5.41:1** | `rgb(106,174,140)` → 2.61:1 |

- 三主题声明环色 **5.14 / 5.57 / 5.41:1（vs 纯白）**，与 R-50 自述数字独立复算一致（`scripts/analyze-contrast-table.mjs`，机器计算非手算）；对照修复前 `ring-gold/60` = `#B7F35A@60%` 叠白 = `rgb(212,248,156)` → **1.19:1**。
- **渲染像素口径提示（P3-1）**：pattern 项目 `fitView` 缩放 `0.5056` → 声明 2px 环在屏幕上只有 **1.01 px**，条带最深像素因此是亚像素混合色，实测 2.47/2.70/2.61:1 **低于 3:1**；blur 态同位置为纯 `rgb(255,255,255)`（1:1），即「环确实出现且随主题变化」成立。数字与判定请按口径取用（见 §4 P3-1）。

节点内输入控件聚焦（`blur → focus` 双快照 delta，`measurements/p1-3-focus.json`）：

| 目标 | current | white | eye | 结论 |
|---|---|---|---|---|
| chip 提示词板 `textarea` `border-top` | `rgb(228,230,234)` → **`rgb(74,122,23)`** | `rgba(0,0,0,.08)` → **`rgb(0,102,204)`** | `rgb(226,236,228)` → **`rgb(11,122,67)`** | 可见变化 ✓（4.63/5.11/4.94:1） |
| `select` 边框 | `rgb(228,230,234)` → **`rgb(74,122,23)`** | `rgba(0,0,0,.08)` → **`rgb(0,102,204)`** | `rgb(226,236,228)` → **`rgb(11,122,67)`** | 可见变化 ✓ |
| chip 左 3px 强调条 | `border-left-width: 3px`，色 = `rgb(183,243,90)` = `--gc-node-accent` | `rgb(0,113,227)` | `rgb(11,122,67)` | **已恢复**（修复前 = 普通边框色 `rgb(228,230,234)`/`rgba(0,0,0,.08)`） ✓ |
| 填充态「重新上传」包装器（`ImageInputNode.tsx:190`） | blur `none` → focus `rgb(74,122,23) 0px 0px 0px 2px` + 边框变色 | `rgb(0,102,204) …2px` | `rgb(11,122,67) …2px` | 可见变化 ✓（`measurements/p1-3c-reupload.json`） |

- 反查删除已生效：`src/index.css:506-514` 的 `[data-theme] .gc-node-card input/textarea/select` 段只剩 `background-color`/`color` 的 `!important`，`border-color` 反查行已删（R-50 diff 佐证，`scripts/baseline.patch`）。
- 未闭合项：**「从素材库选择」按钮聚焦仍无任何视觉反馈**（承接 R-46 P2-1，见 §4 P2-1）。
- chip 左条在 **current 主题** vs 卡内底为 **1.18:1**（亮 accent 的固有属性）。设计上它是 chip 身份标识、焦点指示由边框承担；但首轮 R-46 对同类亮环按 3:1 判定不达标，故此处**口径需设计方明确**（见 §4 P3-4）。

### 3.4 P1-4 连线预览 / 框选 / 暗房显影 —— **通过（DOM 计算样式层）**

`measurements/p1-4-residue.json`（三主题各跑一次运行中态，逐元素读 `color/backgroundColor/borderColor/backgroundImage/boxShadow/stroke/fill/outlineColor` 并扫描旧金色值）：

| 目标 | current | white | eye | 修复前（首轮实测） |
|---|---|---|---|---|
| 连线预览 `.react-flow__connection-path` `stroke` | `rgb(183,243,90)` | `rgb(0,113,227)` | `rgb(11,122,67)` | 三主题恒 `rgb(201,166,107)` |
| 框选 `.react-flow__selection` | bg = accent@8% / border = accent@40% | `color(srgb 0 0.443137 0.890196 / .08/.4)` | `color(srgb 0.0431373 0.478431 0.262745 / .08/.4)` | 三主题恒 `rgba(201,166,107,.08/.4)` |
| 暗房 `develop-overlay` 渐变 | accent 系 `color(srgb .717647 .952941 .352941 / .05→.14)` | accent 系 | accent 系 | 三主题恒 `rgba(201,166,107,.05…)` |
| 暗房 `develop-gridlines` / `scanline` | accent@13% / accent 扫描线 | accent 系 | accent 系 | 旧金 `rgba(201,166,107,.13)` / `rgb(201,166,107)` |
| handle 渐变 | `rgb(220,255,171)→rgb(74,122,23)` | `rgb(214,236,255)→rgb(0,74,153)` | `rgb(210,236,220)→rgb(10,92,51)` | （首轮即无旧金） |
| **旧金扫描命中数** | **0** | **0** | **0** | 多处 |

- 截图：`shots/p1-4-selection-*-1280.png`、`shots/p1-4-connection-*-1280.png`、`shots/p1-4-developing-*-1280.png`。
- **但 DOM 计算样式扫描看不到 canvas 2D 层**：`src/components/DotWaveBackground.tsx:70` 仍硬编码 `rgba(201, 166, 107, …)`（画布点阵背景，`CanvasFlow.tsx:342` 挂载），像素实测在简白/护眼绿下呈暖色残留（见 §4 P2-2）。
- 附带（非本轮 4 条 P1）：`--gc-status-queued` = `#2dd4bf`(current) / `#9a6f00`(white) / `#85660e`(eye) 读取到位（B5 修复值在位），但 queued 状态点未进入可见 DOM → **未渲染验证**。

---

## 4. Findings（本轮新增 / 未闭合）

| 级别 | 编号 | 现象 | 证据（实测值 / 截图 / 代码） | 期望依据 |
|---|---|---|---|---|
| P1 | 1 | **登录页 white/eye 仍不换肤**（同 §3.1；复验判定不通过） | 三主题 `data-theme=null`、`--gc-accent=#B7F35A`、卡底 `rgb(33,36,42)`；md5 `current==eye`；机理 `theme.ts` 仅被 CanvasFlow/TopBar 引入 | AGENTS.md §2 单一主题事实源 |
| P2 | 2 | **画布点阵背景（canvas 2D）旧金残留**：`DotWaveBackground.tsx:70` `rgba(201,166,107,…)`，三主题不随 accent | 像素实测（`measurements/p1-4-dotwave.json`，全视口截图逐像素）：white 画布底 `rgb(245,245,247)`，暖色点色 `rgb(233,223,208)` → **1.21:1**（4502 px ≈ 0.8% 面积）；eye 底 `rgb(233,241,234)`，点色 `rgb(224,220,199)` → **1.20:1**；current 底 `rgb(22,24,29)`，点色最深 `rgb(110,106,99)` → 3.30:1 | 「主题切换后零残留 / 禁止第二金色」；canvas 2D 不参与 `getComputedStyle`，故历轮计算样式审计均漏检 |
| P2 | 3 | **「从素材库选择」按钮键盘聚焦无任何视觉反馈**（承接 R-46 P2-1，未修） | `measurements/p1-3b-focus.json`：`changed=[]`（border/shadow/outline 全无变化），最近祖先链只有节点卡自身阴影；无 `focus-within` 环 | WCAG 2.4.11 / AGENTS.md §2「保留可见焦点」 |
| P3 | 1 | **焦点环在画布缩放下渲染不足 3:1**：声明 2px 环被 `fitView` 缩放（实测 `scale(0.505556)`）压到 1.01px，条带最深像素 2.47/2.70/2.61:1 | `measurements/p1-3-ring-band.json`、`scripts/analyze-ring-band.mjs`；声明色本身 4.63–5.14:1（含 vs 纯白 5.14/5.57/5.41:1） | 若按「渲染后焦点指示 ≥3:1」判定则需加固（如 `outline` 不随缩放、或提高不透明度/宽度）；若按「token 声明色」判定则已达标 —— 请裁定口径 |
| P3 | 2 | white/eye 的 `.bg-gold` 反查段用**硬编码 hex**（`#0071e3` / `#0B7A43`）而非 `var(--gc-accent)` | `src/index.css:282`、`src/index.css:302`（当前渲染值与 accent 相同，功能正确） | design.md §7「新规则直接用 `var(--gc-*)`」；token 一旦调整会静默漂移 |
| P3 | 3 | 带修饰的 gold 工具类仍未 token 化（承接 R-46 P3-3）：反查段只覆盖 `.text-gold`/`.bg-gold`（white/eye）与 `.border-gold`（current）/`.gc-node-card.border-gold` | 源码计数（`grep -rhoE`）：`hover:text-gold` 15、`hover:border-gold/60` 11、`border-gold` 9、`hover:border-gold/50` 6、`bg-gold` 6、`ring-gold` 3、`bg-gold/10` 3、`bg-gold/8`、`bg-gold/15`、`ring-gold/70`、`text-gold/70` …。所在组件：`App.tsx`、`ImageInputNode`（dragOver 态）、`UpscaleNode`/`MaskRedrawNode`/`PrintExtractNode`/`FabricRecolorNode`（active chip）、`ResultsPanel`、`MaskEditor`、`ResultNode`、`AssetPickerOverlay`、`CompareOverlay`、`TemplatesDock` | 本轮**未渲染验证**：已把左侧「节点库」面板打开到可见态（`dockWidth=320`，18 个 chip）后，可见 DOM 中仍未出现任何带修饰 gold 类（`measurements/extra-panels-gold.json`）；上述组件依赖内置模板里不存在的节点类型/交互态（拖拽悬停、放大/换色节点选中态、结果列表/对比态）。属源码级线索，不计通过/不通过 |
| P3 | 4 | chip 左 3px 强调条在 **current** 主题 vs 卡内底仅 **1.18:1**（white 4.31:1 / eye 4.94:1） | 声明值取自 `measurements/p1-3b-focus.json`（`--gc-node-accent` 与 `--gc-node-inner`） | 若它算「焦点指示」则 current 不达标；若算「chip 身份标识」则不适用 3:1。建议在 design 明确 |

**P0：无。**

---

## 5. 未验证项 / 降级说明（fail-closed 口径）

1. **带修饰 gold 类与结果列表态未渲染验证**：已把「节点库」面板打开到可见态（`dockWidth=320`、18 个 chip）并逐主题审计，可见 DOM 中**没有**出现任何带修饰 gold 类（`measurements/extra-panels-gold.json`）；这些类所在组件（`UpscaleNode`/`MaskRedrawNode`/`PrintExtractNode`/`FabricRecolorNode` 的 active chip、`ResultsPanel` 结果列表/对比态、`AssetPickerOverlay`、`CompareOverlay`、`ImageInputNode` 拖拽悬停态）需要内置模板中不存在的节点类型或交互态才能进入。**B5 queued 状态点**同理未进入可见 DOM（仅读到 token 值 `#2dd4bf`/`#9a6f00`/`#85660e`）。
2. **FabricRecolorNode `#RRGGBB` hex 输入（R-50 改动行之一）未渲染验证**：两个内置模板项目均无该节点（`input[placeholder="#RRGGBB"]` 计数 0，三主题一致）→ 按「不采信」原则记为未验证；其源码改动与已验证的 `inputClass` 同源（`focus:border-[var(--gc-accent-deep)]`）。
3. **仅 Chromium**（项目 e2e 亦仅 chromium）；未覆盖 WebKit / Firefox。「真机模式」= 真实 Chromium + 原生视口 1280×720，非移动端真机（产品桌面专用）。
4. **未重跑三档宽（1024/1280/1440）全量矩阵**：该矩阵属首轮 README 覆盖范围；本轮聚焦 4 条 P1 的三主题复验（1280）。
5. **未跑项目完整门禁**（`npm run check` / `npm run build` / `gate:codex` / CI）：本轮为只读复验 + docs-only 产出。作为补充，在 `a624571` worktree 上跑了**聚焦 e2e**：
   `npm run test:e2e -- --project=login --project=setup --project=desktop-1280` → **12 passed / 0 failed（36.2s）**，见 `logs/e2e-focused.log`（含 login V4 分屏、项目中心、节点拖拽撤销、主题切换器焦点恢复等）。
6. **付费态未触发**：所有结果图来自桩 SSE，未调用真实 provider；未验证真实生成链路的视觉表现。
7. **B4「首帧闪旧金窗口」仍未实测**（时序窗口）；**B5 状态点** 见第 1 条。
8. **未验证 P3-1 之外的其他缩放档**：画布缩放 0.5056（pattern）/ 0.8186（text）两个实测点；未穷举缩放范围。

---

## 6. 方法说明（机器量测与人眼判断分开）

- **机器量测**（本报告所有数值，全部来自脚本输出）：
  - 渲染：Playwright + 真实 Chromium，原生视口；`page.route` 桩 SSE 产生结果/运行中态；每阶段前重新登录（单设备会话会吊销旧会话）。
  - 样式：`getComputedStyle` / `getBoundingClientRect`；焦点一律用 **`blur()` → 快照 → `focus({preventScroll:true})` → 快照** 的 delta，避免只看聚焦态漏掉「本来就没变」。
  - 像素：Playwright `clip` 截图 + `sharp` 逐像素采样（优先取众数色，避开文字笔画）；对比度按 WCAG 相对亮度公式；半透明/亚像素混合值单独标注（如 P3-1 的 1.01px 环）。
  - 颜色审计：同一 DOM 路径下三主题各采一份 `getComputedStyle` 全量，逐值比对找「三主题同值」的残留；再叠加**全视口逐像素**暖色扫描（用于发现 canvas 2D 层残留，P2-2）。
  - 提交面核查：`git log --oneline <range> -- <paths>` 确认「某条 P1 是否真有修复提交」。
- **人眼判断**：本轮**未使用** vision 模型看图；所有结论均为机器量测，故不存在人眼/机器冲突项。
- 复现命令（隔离栈 + 探针）：

  ```sh
  node /tmp/gc-uiqa-r51/setup-db-env.mjs            # 从主仓 .env 生成隔离库连接串（0600）
  node /tmp/gc-uiqa-r51/run-stack.mjs               # api 3411 / web 5411（后台常驻）
  sh   /tmp/gc-uiqa-r51/scripts/run-all-r51.sh      # 顺序跑 P1-2/P1-3/P1-4 探针 + 分析
  node /tmp/gc-uiqa-r51/scripts/probe-p1-1-login.mjs
  node /tmp/gc-uiqa-r51/e2e-run.mjs --project=login --project=setup --project=desktop-1280
  ```

## 7. 目录索引

```
reverify-r51/
├── README.md                      ← 本报告
├── scripts/                       隔离栈、探针、像素/对比度分析、shots-index（可复现）
├── measurements/                  p1-1..p1-4 原始量测 + 分析结果 + contrast-table + shots-index（md5）
├── shots/                         81 张（5.32 MB，md5 见 measurements/shots-index.json）
└── logs/                          隔离栈日志（a624571 正常 / bec1163 起不来）、各探针日志、聚焦 e2e 日志
```

关键量测文件索引：

- `measurements/p1-1-login-theme.json`（三主题登录页 + 登出后路径）
- `measurements/p1-2-bg-gold.json` / `p1-2-analysis.json`（启用态 CTA + gold 元素审计）
- `measurements/p1-3-focus.json` / `p1-3-analysis.json` / `p1-3-ring-band.json` / `p1-3b-focus.json` / `p1-3c-reupload.json`
- `measurements/p1-4-residue.json`（连线/框选/显影/handle + 旧金扫描）、`p1-4-dotwave.json`（canvas 2D 点阵）
- `measurements/extra-gold-variants.json` / `extra-panels-gold.json`（带修饰 gold 类的面板态审计）
- `measurements/contrast-table.json`（对比度总表）、`shots-index.json`（81 张截图 md5+字节）
