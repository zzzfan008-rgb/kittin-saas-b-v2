# 左侧工具栏 V2 · 设计规范

日期：2026-09-20 · 状态：**已实施**（`src/components/workbench/`）
原型：[`prototype-rail-v2.html`](./prototype-rail-v2.html) · 布局示意：[`layout-diagram-v2.txt`](./layout-diagram-v2.txt)
视觉证据：[`shots/`](./shots/) · 数值事实源：同目录 `../2026-09-17-ui-audit/DESIGN.md`（本文只引用 token 名）

## 1. 结构

左侧两条**独立悬浮胶囊**，均锚定画布区左上/左下，不占画布宽度（不挤压画布）。

| 胶囊 | 位置 | 内容 |
|---|---|---|
| 主工具组 | 画布左上 16px | 6 个业务入口 + 1 个面板入口，组间短分隔线 |
| 操作历史组 | 画布左下 16px | 撤销 / 重做 |

主工具组塔形（自上而下）：

```
➕ 添加               → 菜单：文本 / 图片 / 视频 / 从资产库选择
── 分隔线 ──
👤 AI 换装工作流      → 菜单：模特试穿 / 摆拍 Pose / 更换背景 / LookBook / 数字模特
👗 服装设计工作流     → 菜单：印花提取 / 印花裂变 / 服装换色 / 面料更换 /
                            线稿图到服装 / AI 改款 / 穿搭推荐 / 真人转人台
▶️ 视频生成工作流     → 菜单：服装走秀 / 小红书视频 / 首尾帧 / 视频复刻
── 分隔线 ──
🎨 AI 画板            → 直接进入（动作待映射）
🌈 色彩工具           → 直接进入（动作待映射）
── 分隔线 ──
⚙ 属性 / 结果         → 开合左侧 Dock 面板
```

配置事实源：`src/components/workbench/railConfig.tsx`（`RAIL_ENTRIES` / `RAIL_HISTORY` / `RAIL_SEPARATOR_BEFORE`）。

## 2. 交互（用户裁定 2026-09-20）

- **hover 自动展开**：鼠标移入入口后 **120ms** 展开对应菜单，无需点击。
- **移开自动关闭**：鼠标离开入口后 **200ms** 关闭；这 200ms 内移到菜单上则保持打开（可点菜单项）。
- **单选互斥**：同一时间只有一个菜单展开。
- **键盘可达**：`focus` 立即展开，`Esc` 关闭；菜单项可 Tab 到并可 Enter 触发。
- **触屏兜底**：点击入口同样可开合菜单（不依赖 hover）。
- 顶部工具栏「快捷键」窗口同样改为 hover 自动弹出（见 §5）。

## 3. 视觉

| 元素 | 规则 |
|---|---|
| 胶囊容器 | `--gc-panel` 底 + 1px `--gc-border` 描边 + 圆角 20px + 四层软阴影 |
| 工具按钮 | 40×40，圆角 12px，默认图标 `--gc-text-muted` |
| hover / active 底色 | **主题色实底**（`--gc-accent`），图标与文字转 `--gc-accent-cta-ink` 保证可读 |
| 主「添加」按钮 | 40×40 圆形，常驻 `--gc-accent` 底 + accent 彩色投影（唯一高饱和焦点） |
| 分隔线 | 22px 宽 1px `--gc-border` |
| 菜单 | 218px 宽，圆角 16px，与胶囊同款阴影，`left: 52px; top: 0`（**必须显式 top**，否则被容器 `overflow-hidden` 裁切） |
| 菜单项 | 28px 图标位 + 13px 文字；hover 底色 = 主题色实底，图标/文字转对比色 |
| 键盘焦点 | `outline: 2px --gc-accent`，offset 2px（菜单项 -2px） |
| 减少动态 | `motion-reduce` 下关闭过渡与位移动画 |

> **hover 底色为何用实底而非淡色**：用户明确要求「必须和主题的底色一样」。淡色（accent 14%）在简白/护眼绿下几乎不可见。实底必须同时切换图标/文字为对比色，否则浅色主题下图标与底色撞色不可读——这是本版与上一版的差别。

## 4. 面板可达性（本期裁定）

| 面板 | 裁定 | 现状 |
|---|---|---|
| 节点库 | **下线**：加节点改由「添加」菜单直接创建（文本/图片/视频） | UI 不再可达；面板代码与 `library` prop 暂留待后续清理 |
| 属性 / 结果 | **保留常驻入口**（主工具组第 7 格） | 点击开合左侧 320px Dock |

未接入的动作映射（`AI 画板` / `色彩工具` / 各工作流菜单项除「添加」外）当前为占位，点击无副作用；映射表由产品确认后接入 `WorkbenchShell.handleSelectItem`。

## 5. 与旧版的差异

| 旧版 | 新版 |
|---|---|
| 两张分离圆角方卡（节点库 / 属性结果） | 一条胶囊 7 项 + 独立历史胶囊 |
| 无机器工作流入口 | 6 个业务工作流入口 + 悬停菜单 |
| 点击展开菜单 | **hover 自动展开 / 移开自动关闭** |
| hover 只变浅灰底 | hover = 主题色实底 + 图标文字转对比色 |
| 无撤销重做入口 | 左下独立历史胶囊 |
| 空态文案「从左侧节点库拖入…」 | 「从左侧「添加」新建文本 / 图片 / 视频节点，或点击上方按钮上传图片」 |

## 6. 实现与门禁

改动文件：

- `src/components/workbench/railConfig.tsx`（新增，配置事实源）
- `src/components/workbench/WorkbenchShell.tsx`（重写工具栏）
- `src/components/panels/NodeLibraryPanel.tsx`（抽出 `addCanvasNode`，供菜单复用）
- `src/components/EmptyCanvasCTA.tsx`（空态文案）
- `e2e/{workbench,golden-path,initial-draft}.spec.ts`、`tests/{workbench-shell,project-tabs}.test.ts`（断言跟随新结构）

本地实测：`tsc --noEmit` / `npm run build:web` / `ast-grep` / `depcruise` / `git diff --check` 全绿；
`npm run test:e2e` **33 passed / 1 skipped / 0 failed**（2.3m）；`tests/workbench-shell.test.ts`、`tests/project-tabs.test.ts`、`tests/theme-contract.test.ts` 通过。
