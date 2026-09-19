# Garment Canvas 设计规范（人读版）· Rev.1

> **🔒 锁定指针（R-47，2026-09-19）**：本文已被冻结快照 [`DESIGN-Rev2-locked-2026-09-19.md`](./DESIGN-Rev2-locked-2026-09-19.md) 取代为现行有效版本——该快照与代码 head `e13de4c` 逐条对齐后冻结（含 9 项规范修订与 4+1 项代码问题报告）。**后续修订以新版本另立文件，本文不再原地修改**；引用数值请以锁定版及其 front matter（机读源）为准。本文下方内容仅作历史存档，其中曜黑行动色仍为旧「活力黄」、Rev.2 CTA 深绿例外已被作废。

日期：2026-09-18 · 状态：**已锁定存档**（现行版见上方指针）
机读唯一事实源：[`DESIGN-Rev2-locked-2026-09-19.md`](./DESIGN-Rev2-locked-2026-09-19.md) front matter（原 `DESIGN.md` 已丢失，见锁定版 §10；其旧导出 `theme.css` / `tailwind.theme.json` / `tokens.json` 停留在旧黄时代值，重新导出前不得引用）——本文件只引用 token 名，不复述数值。
视觉证据：[`shots/`](./shots/)（prototype-v3 迭代 + acceptance 验收 + fix-white-* 修复复验）· 问题清单 [`audit-report.md`](./audit-report.md) · 评审清单 [`review-checklist.md`](./review-checklist.md)。

---

## 0. 设计立场

服装设计师的生产工具，不是通用 AI SaaS 仪表盘。三条铁律：

1. **画布优先**——chrome 退后，节点与服装图像是主角；
2. **一色一义**——每主题一个行动色，落在选中描边、焦点环、连线；**例外（Rev.2 新增）**：简白/护眼绿的主 CTA 用深绿 `#166534`（荧光绿在浅底 1.21:1 不可读），此例外只适用于 CTA，连线/焦点环仍用 accent；
3. **白卡语言**——三主题节点卡统一纯白 + 四层软阴影，无边框。

## 1. 三主题（Rev.1 定稿）

| 主题 | ThemeId | 画布 | 节点卡 | 行动色 |
|---|---|---|---|---|
| **曜黑·活力黄**（默认） | `current` | ob-canvas 提亮黑 | 纯白 | ob-accent 活力黄 |
| **简白·Apple** | `white` | aw-canvas 微蓝灰白 | 纯白 | aw-accent Apple Blue |
| **护眼绿·薄荷翡翠** | `eye` | eg-canvas 薄荷 | 纯白 | eg-accent 翡翠绿 |

- 连线三主题统一 = 各自强调色单色线（`--gc-edge`），箭头同色。
- handle 圆点默认中性色，hover/连线/选中才亮强调色。
- ThemeId 保持 `current/white/eye` 不变，localStorage 旧值无缝兼容。
- 各主题关键对比度：黄 on 曜黑 11.6:1、白字 on 翡翠 5.4:1、白字 on 蓝 4.7:1（hover 加深后 5.34:1）。

## 2. 状态色三档机制（Rev.1 核心修复）

状态语义与强调色彻底解耦，**按底色分配**：

- `:root` 默认 = 深底亮色版（曜黑章）——**queued 用青 st-queued-dark，不是黄**（与强调黄撞色是设计错误）；
- `[data-theme="white"]` 覆盖 st-*-light 系；
- `[data-theme="eye"]` 覆盖 st-*-eye 系（暖化加深适配薄荷底）。

8 态：idle / queued / running / retry / success / error / unknown / cancelled。idle 与 cancelled 共用中性灰靠文字区分；running/retry 加同色描边环。

## 3. gold 工具类（Rev.1 决策）

历史 `text-gold / border-gold / bg-gold` Tailwind 类**跟随各主题 accent**：曜黑→活力黄、简白→蓝、护眼绿→翡翠。`@theme` 回退值 = 活力黄（与默认主题一致）。禁止再引入第二金色。

## 4. 字体 / 排版 / 几何

系统栈零网络字体；数值语境走 mono 栈；中文最小 11px；负字距全尺寸；大标题紧行高 1.08。圆角五档、四层软阴影、玻璃导航——详见 DESIGN.md §Typography/§Layout/§Elevation/§Shapes。

## 5. 组件契约

- **run-button**：唯一填充强调色控件；loading = 浅底 + 内联 spinner；disabled = 中性灰底（WCAG 豁免，3.89:1 为有意下限）。
- **field-input**：1px 边框恒定（状态切换零布局位移）；焦点环即时出现永不动画；错误 = 红边 + helper 位（min-height:1lh）+ aria-invalid。
- **canvas-edge**：强调色贝塞尔 + 同色箭头，三主题同规则。

## 6. 动效纪律

命名 token 三曲线（--ease-out/in/in-out）+ 三档时长（--dur-1/2/3 = 120/180/250ms）；`transition: all` 与动画焦点环为禁止项；全局 reduced-motion 兜底（duration + iteration-count）。

## 7. 实施映射（给 frontend 的约定）

- 主题机制：`data-theme` + `--gc-*` 单一事实源（AGENTS.md §2）。
- token 前缀 ↔ 运行时：aw-* ↔ white 段、ob-* ↔ :root/current 段、eg-* ↔ eye 段、st-* ↔ --gc-status-*。
- 工具类反查段只保留存活选择器；**新组件直接用 `var(--gc-*)`，不再新增反查规则**。
- 主题标签/色卡在 `src/lib/theme.ts` THEMES；TopBar themePreviewColors 必须同步（长期应改读 var）。

## 8. 登录页 V4（分屏 + 品牌区 a11y 裁决）

结构 = 左品牌叙事区（装饰）+ 右登录卡（功能，`login-card`）。原型 `login-v4.html`，证据 `shots/login-v4/`。

**裁决（R-44，2026-09-19）：品牌区整块 `aria-hidden="true"` 恰当，不拆、不降级为局部隐藏。** 理由：

1. 品牌区唯一职责是视觉叙事，零交互件；登录任务所需信息（账号、密码、错误提示、CTA）全部在右侧卡内。AT 用户不读品牌文案也能完整登录——隐藏它不损失任何任务能力。
2. 品牌大标题（「让每一张面料，都有无限画布。」）与登录卡标题（「登录工作台」）是两套文案系统：营销语言 vs 功能语言。两者同时暴露会产生竞争性标题语义，稀释屏幕阅读器对登录表单的定位。聚焦的可访问树优于重复的全量树。
3. 若未来品牌区出现真实功能件（如主题切换），该元素必须移出 aria-hidden 或将 aria-hidden 上移绕开它——装饰性以「无交互、无任务信息」为前提，不是永久豁免。

**测试口径（随裁决固化）**：`aria-hidden` 子树对 `getByRole` 永不可见是 a11y 正确行为，不是产品 bug。e2e 断言品牌区内容必须用 `brandPane.getByText(...)`（定位器内文本），**禁止为测试转绿而移除或挪动 `aria-hidden`**。参见 `e2e/login.spec.ts` 分屏用例注释。

## 9. 版本记录

- **2026-09-17 审核**：15 项发现（4C/6M/5m）→ V1 工程板（否）→ V2 Atelier（方向对）→ V3 简白 Apple（Hallmark 精修 7 处违规清零）→ 三主题终配色。
- **2026-09-18 定稿实施**（`bd8b1fd`）：三主题 token + 13 处槽位修正 + 连线强调色 + e2e 同步。
- **Rev.1 评审修复**（`92af4f7`）：独立评审 BLOCK（P0 white 反查段错配 / P1 queued 未落地 / P2×2 缩略图过期与双金并存 / P3 死选择器）→ 全部修复，全门禁绿 + 简白面板展开实截复验通过。
- **R-44 e2e 修复**（`593eda8`）：登录页 V4 两处 e2e 失败收口——① 品牌区断言改定位器内文本（aria-hidden 裁决见 §8）；② initial-draft.spec 旧标题「登录服装设计工作台」×2 → 「登录工作台」同步。
- 历史方案（暖象牙纸样卡、墨白深节点、护眼绿绿灰同族）已被取代，原型存档 prototype-v2.html。
