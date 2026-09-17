# Garment Canvas 设计规范（人读版）

日期：2026-09-17 · 状态：**提案**（按 AGENTS.md §2，实施前需你确认）
数值唯一事实源：同目录 [`tokens.css`](./tokens.css) —— 本文件只引用 token 名，不复述数值。
视觉证据：[`shots/`](./shots/)（1280×720 实截，三主题）· 问题清单见 [`audit-report.md`](./audit-report.md)。

---

## 0. 设计立场

Garment Canvas 是**服装设计师的生产工具**，不是通用 AI SaaS 仪表盘。所有视觉决策服务于三件事：

1. **画布优先** —— 界面 chrome 退后，节点与图像内容是绝对主角；
2. **一色一义** —— 品牌金只出现在「品牌、主 CTA、选中态」三处，其余语义各归其位；
3. **中文优先** —— 字号、字重、断行按中文可读性设计，英文只做点缀不做装饰。

「经典暗金」的底子（暗壳 + 浅节点 + 金圆环 handle）是这个产品最有辨识度的资产，**保留并强化**；两套浅色主题的问题是「换肤式」完成度，本次规范把它们纳入同一语义系统。

---

## 1. 字体策略

**决定：诚实走系统栈，砍掉假 Inter。**（audit C3）

- 中文：`PingFang SC`（macOS）/ `Microsoft YaHei`（Windows）系统栈，不加载网络字体——工具产品首屏速度优先；
- 数字/坐标/尺寸/时间戳：引入 `--gc-font-mono`（JetBrains Mono，自托管 woff2，约 40KB 子集，仅 latin）——画布工具的「测量感」来源，缩放百分比、节点坐标、输出尺寸全部走 mono；
- **禁止**：任何未加载却声明的字体名；任何大写英文 eyebrow 装饰（`WORKSPACE GUIDE` / `STEP 1/4` 一类，audit m3）。

### 字阶（引用 `--gc-font-*`）

| 用途 | token | 说明 |
|---|---|---|
| 正文/表单 | `--gc-font-body` | 面板、对话框 |
| 常规界面 | `--gc-font-ui` | 按钮、tab、节点标题 |
| 中文最小 | `--gc-font-label` | 标签、辅助说明——**中文下限** |
| 仅英文 meta | `--gc-font-meta-en` | 坐标、时间戳、`x1.5`——**禁止用于中文** |

迁移红线：`text-[8px]`/`text-[9px]` 清零；`text-[10px]` 中文语境升 `--gc-font-label`，纯英文语境改走 mono token。

---

## 2. 色彩系统

### 2.1 结构

三主题共享同一语义槽位（shell/canvas/panel/control/border/accent/node 族），值全部来自 `tokens.css` §5。**组件只允许引用 `var(--gc-*)`，禁止内联 hex**（audit C1 的根治）。

旧值 → 新 token 迁移映射（高频）：

| 旧内联值 | 语义槽位 |
|---|---|
| `#141414` / `#161616`（面板底） | `--gc-panel` |
| `#0f0f0f` / `#111`（输入底） | `--gc-control` |
| `#1a1a1a` / `#1d1d1f`（标题栏） | `--gc-panel-hover` 层级重估 |
| `#262626` / `#333` / `#2a2a2a`（边框） | `--gc-border` |
| `#C9A66B` / `text-gold` | `--gc-accent`（暗面板上）/ `--gc-accent-deep`（浅节点上） |
| `#3a3226`（运行中按钮底） | `--gc-panel-hover` + `--gc-warn-text` 文字 |

### 2.2 accent 语义分配（audit M1/M3 的根治）

| 语义 | token | 用在哪 |
|---|---|---|
| 品牌金 | `--gc-accent` | Logo、主题切换器当前项、**主 CTA（生成/运行）**、选中节点描边 |
| 主 CTA 文字 | `--gc-accent-cta-ink` | 金底上的墨字 |
| 浅表面金 | `--gc-accent-deep` | 浅色节点内的小号金字（6.46:1） |
| 警示 | `--gc-warn-text` | 「未验证不可运行」等前置原因文字 |
| 状态 | `--gc-status-*` 8 槽位 | StatusDot 与状态徽章，**不再与品牌金混用** |

**「黑白」→「墨白」**：粉 accent 废弃，改墨色（`--gc-accent` on panel 16.69:1），深节点上的金改 `--gc-node-accent` 呼应品牌。主题名与 Miniature 预览同步更新。

**护眼绿 v2**：节点族从蓝灰改绿灰同族，accent 从藏蓝改深绿——修复 3.43:1 不达标，冷暖割裂消除。

### 2.3 节点卡片（画布主角）

- 表面：`--gc-node-main`，标题栏 `--gc-node-header` 与主体的分隔从 hairline 升为 `--gc-node-border`；
- 选中态：`--gc-node-accent` 描边 + 0 0 0 1px 同色外环（现有 hover 光影保留）；
- 状态点：直径 `--gc-dot-status`，色值走 `--gc-status-*`；hover 出 visible tooltip（现状 title 属性不可发现，audit M6）；
- unsupported 徽章：中性灰底「暂不支持」，警示原因收进 hover 展开，不再撑开节点库卡片高度（audit m2/m4）。

### 2.4 连线

新增 `--gc-edge`（从 border 色解耦，三主题均提级）；默认带箭头 marker；选中/hover 走 `--gc-accent`（audit m5）。

---

## 3. 间距与几何

- 全局 4pt 网格：`--gc-space-1…8`；节点内容 `--gc-node-pad` / `--gc-node-gap`；
- 控件高度双档：节点内 `--gc-ctl-height-sm`、面板内 `--gc-ctl-height-md`——消灭「原生 select」观感（audit 视觉发现）；
- 圆角三档：`--gc-radius-node` / `--gc-radius-ctl` / `--gc-radius-chip`。

---

## 4. 动效

- 三档时长 + 两个命名缓动（`tokens.css` §4）；只动 `transform`/`opacity`；
- 「暗房显影」扫描线是品牌级动效，**保留**，但纳入 reduced-motion 兜底；
- 全局 `@media (prefers-reduced-motion: reduce)` 已在 `tokens.css` §6 落地（audit M5 的根治）。

---

## 5. 文案与本地化

- 默认项目名 →「未命名项目 · MM-DD HH:mm」（audit m1）；
- onboarding 去版本徽章、中英混杂 eyebrow 全部中文化（audit m3）；
- `unsupported` →「暂不支持」徽章。

---

## 6. 实施顺序（建议，未实施）

| 批次 | 内容 | 对应问题 |
|---|---|---|
| P0 | 删 `theme-blocks.css`；删假 Inter；全局 reduced-motion；8/9px 清零 | C2 C3 M5 C4 |
| P1 | 100+ 硬编码 hex → token 迁移（映射表 §2.1）；删类名反查段 | C1 |
| P2 | 三主题值对齐 `tokens.css` §5；「黑白」→「墨白」改 accent | M1 M2 M4 |
| P3 | 状态色 8 槽位接入 StatusDot；金色语义收拢 | M3 M6 |
| P4 | mono 字体接入数字语境；连线箭头；文案修订 | m1–m5 |

每批独立可验证：`npm run check` + 1024/1280/1440 三宽度截图对比（项目既有验收宽度）。

---

*Hallmark · pre-emit critique: P4 H5 E4 S4 R5 V4*
