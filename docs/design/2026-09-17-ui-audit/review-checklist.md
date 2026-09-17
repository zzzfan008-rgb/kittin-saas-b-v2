# Garment Canvas UI 评审清单 — 2026-09-17

> **用途**：逐条评审、裁决、验收。每条独立可批准/否决。
> **如何评审**：对每条给出 **✅ 同意 / ❌ 否决（写原因）/ 💬 改方案** 三种裁决之一；被批准的条目按批次排期，完成后勾选 Done 并跑该条「验收标准」。
> **证据**：截图在 [`shots/`](./shots/)，完整分析在 [`audit-report.md`](./audit-report.md)，数值事实源在 [`tokens.css`](./tokens.css)。

**裁决人**：＿＿＿＿＿　**日期**：＿＿＿＿＿

---

## 汇总

| 严重度 | 数量 | 含义 |
|---|---|---|
| Critical | 4 | 影响主题系统正确性 / 基础可读性，必须修 |
| Major | 6 | 明显拉低产品品质，应修 |
| Minor | 5 | 细节打磨，可延后 |

---

## 需要用户先裁决的 3 个决策点

这些条目含方向性选择，评审时先定方向再排期：

- [ ] **D1 · Inter 字体怎么处理**（对应 C3）
  - 方案 A（推荐）：删掉声明，诚实走系统栈 + 数字语境引入自托管 mono（JetBrains Mono 子集约 40KB）
  - 方案 B：自托管 Inter Variable + 中文系统栈回退（多加载一个字体文件）
- [ ] **D2 · 「黑白」主题改名与 accent**（对应 M1）
  - 方案 A（推荐）：改名「墨白」，accent 粉→墨 `#1d1d1f`，深节点上保留金呼应品牌
  - 方案 B：保留粉色 accent，但主题改名含粉意象且需提对比度（不推荐，与品牌脱节）
- [ ] **D3 · 护眼绿节点族配色**（对应 M2）
  - 方案 A（推荐）：节点族改绿灰同族（`#dce8d2` 系），accent 藏蓝→深绿
  - 方案 B：保留蓝灰节点（需将 node-muted 提对比度到 ≥4.5，冷暖割裂仍在）

---

## P0 批 · 立即修（无争议项，不动视觉方向）

- [ ] **C2 · 删除死文件 `theme-blocks.css`**
  - 位置：仓库根 `theme-blocks.css`（无任何引用，白色主题值与 `index.css` 冲突）
  - 修复：删除文件
  - 验收：`grep -r theme-blocks` 零命中；`npm run build:web` 通过；白主题截图无变化
  - 裁决：＿＿＿

- [ ] **C3 · 移除假 Inter 声明**（依赖 D1）
  - 位置：`src/index.css:49-55`（声明 Inter 但全项目无字体加载）
  - 修复：按 D1 裁决执行（A：删声明走系统栈；B：补自托管）
  - 验收：A → CSS 中无 "Inter" 残留；B → 构建产物含 woff2 且 `font-display: swap`
  - 裁决：＿＿＿

- [ ] **C4 · 清零 8/9px 中文字号**
  - 位置：`text-[8px]`×14（`ImageViewer.tsx:38,42`、`ImageInputNode.tsx:190`、`FabricRecolorNode.tsx:176`、`ReferenceRoleSummary.tsx:120,207` 等）；`text-[9px]`×38
  - 修复：中文语境一律 `--gc-font-label`(11px) 起；英文 meta 语境改走 mono token
  - 验收：`grep -rE 'text-\[[89]px\]' src` 零命中；1280 宽度节点特写截图 11px 可读
  - 裁决：＿＿＿

- [ ] **M5 · 全局 reduced-motion 兜底**
  - 位置：src 内无 `@media (prefers-reduced-motion)`；`develop-*` 扫描线（`index.css:154-220`）、`animate-pulse`×5、`btn-running-breathe` 均无兜底（仅 10 处 Tailwind `motion-reduce:` 变体集中在 WorkbenchShell）
  - 修复：粘贴 `tokens.css` §6 全局兜底段
  - 验收：系统开启「减弱动态效果」后扫描线/呼吸/脉冲全部静止；面板开合仍可用（opacity 过渡）
  - 裁决：＿＿＿

---

## P1 批 · Token 迁移（工作量最大，根治 C1）

- [ ] **C1 · 100+ 硬编码 hex → `--gc-*` 语义 token**
  - 位置：`src/components/**` —— `#262626`×40、`#333`×20、`#0f0f0f`×19、`#141414`×9、`#C9A66B`×8 等
  - 迁移映射表（高频值）：

    | 旧内联值 | 语义槽位 |
    |---|---|
    | `#141414` / `#161616` | `--gc-panel` |
    | `#0f0f0f` / `#111` | `--gc-control` |
    | `#1a1a1a` / `#1d1d1f` | `--gc-panel-hover`（层级重估） |
    | `#262626` / `#333` / `#2a2a2a` | `--gc-border` |
    | `#C9A66B` / `text-gold` | `--gc-accent`（暗面板）/ `--gc-accent-deep`（浅节点表面） |
    | `#3a3226`（运行按钮底） | `--gc-panel-hover` + `--gc-warn-text` |

  - 同步删除 `index.css:222-294` 的转义类名反查段（`.bg-\[\#141414\]` 等）
  - 验收：`grep -rE '#[0-9a-fA-F]{3,8}' src/components --include='*.tsx' | grep -v 'var(--'` 仅剩 ≤5 处（注释/特殊色）；三主题切换截图逐面板对比无视觉回归
  - 裁决：＿＿＿

---

## P2 批 · 主题值对齐（依赖 D2、D3 裁决）

- [ ] **M1 · accent 语义修正：「黑白」→「墨白」，粉→墨**（依赖 D2）
  - 位置：`index.css:333`（`--gc-accent: #dc7397`）、TopBar `ThemeMiniature`（`TopBar.tsx:31-57`）、`src/lib/theme.ts` 标签文案
  - 修复：按 D2 执行；Miniature 预览色同步
  - 验收：主题切换器显示新名；新 accent on panel ≥4.5:1（tokens.css 已验证 16.69:1）；三主题截图
  - 裁决：＿＿＿

- [ ] **M2 · 护眼绿 v2：节点族绿灰化 + 深绿 accent**（依赖 D3）
  - 位置：`index.css:350-374` 整段
  - 修复：按 D3 执行；对照 `tokens.css` §5c 逐值替换
  - 验收：node-muted on node-main ≥4.5:1（现 3.43:1 → 新 5.19:1 已验证）；截图确认冷暖割裂消除
  - 裁决：＿＿＿

- [ ] **M4 · 墨白主题节点内控件统一**
  - 位置：`index.css:466-477`（节点内 input/select 走 `--gc-node-inner`）
  - 修复：节点内控件跟随节点表面 token，与面板控件同一设计语言；控件高度双档 `--gc-ctl-height-sm/md`
  - 验收：白主题下节点内输入框与面板输入框同语言（截图对比）；`npm run test` 几何断言不回归
  - 裁决：＿＿＿

---

## P3 批 · 语义与可发现性

- [ ] **M3 · 金色语义收拢（一色一义）**
  - 位置：TopBar 品牌字、AccountMenu 徽章、ProjectTabs 活动点、NodeFrame 警告文字/unsupported 徽章、RunButton
  - 修复：金只留「品牌 + 主 CTA + 选中态」；警示归 `--gc-warn-text`；unsupported 归中性灰
  - 验收：暗金主题截图上金色仅出现在三类位置；警告文字颜色 ≠ 品牌金
  - 裁决：＿＿＿

- [ ] **M6 · StatusDot 提级 + 图例**
  - 位置：`NodeFrame.tsx:31-38`（8px 直径、8 状态色、无图例）
  - 修复：直径 `--gc-dot-status`(10px)；色值走 `--gc-status-*` 8 槽位；hover 出 visible tooltip；运行/排队态加描边环
  - 验收：键盘 Tab 可达 tooltip；8 状态截图逐一确认可区分
  - 裁决：＿＿＿

---

## P4 批 · 细节打磨（可延后，不阻塞）

- [ ] **m1 · 默认项目名** — `未修改项目名称20260917000000` → 「未命名项目 · MM-DD HH:mm」
  - 位置：项目创建逻辑（ProjectCenter / store）｜验收：新建项目标签截图
- [ ] **m2 · unsupported 徽章中文化** — `NodeLibraryPanel.tsx:115` 等 → 「暂不支持」
- [ ] **m3 · onboarding 去版本徽章 + 中英混杂** — 去 `V1.2.0`、`WORKSPACE GUIDE`/`STEP 1/4` 全中文化
- [ ] **m4 · 节点库卡片高度对齐** — unsupported 警示文案收进 hover/展开，卡片高度统一
- [ ] **m5 · 连线提级 + 箭头** — 新增 `--gc-edge` token（从 border 解耦）；默认 marker 箭头；选中态走 accent

---

## 全局验收门（每批完成后必跑）

1. `npm run check`（lint + build:web + test）
2. `npm run gate:codex -- --base origin/main`（若走 PR）
3. 1024 / 1280 / 1440 三宽度截图对比（项目验收宽度，AGENTS.md §6）
4. 三主题（暗金 / 墨白 / 护眼绿 v2）切换逐面板截图
5. 系统开启「减弱动态效果」复测 P0-C4/M5 兜底

## 不动清单（审核确认无需修改，防止误改）

- `@theme inline` shadcn 桥接段（`index.css:513-541`）
- React Flow handle 径向渐变+多层阴影（`index.css:485-510`）——全项目最精细的细节，保留
- WorkbenchShell 的 aria/inert/motion-reduce 结构
- 21 组对比度中已达标的 19 组色值
