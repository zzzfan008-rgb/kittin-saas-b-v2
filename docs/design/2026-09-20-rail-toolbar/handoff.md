# 左侧工具栏 V2 · 前端交接文件

日期：2026-09-20 · 状态：**核心实现已完成，待业务动作映射**
负责人：designer → frontend（交接）
提交 SHA：`69e5602`（本地，实现提交）· 本文档提交紧随其后
相关文档：[`design.md`](./design.md) · [`prototype-rail-v2.html`](./prototype-rail-v2.html) · [`layout-diagram-v2.txt`](./layout-diagram-v2.txt)

---

## 1. 背景与目标

**改造前**：左侧是两张分离的圆角方卡（节点库 / 属性结果），无业务工作流入口，需点击展开。

**改造后**：参考可灵风格，改为**双胶囊悬浮竖条**——主工具组（7 入口）+ 操作历史组（撤销/重做），均锚定画布区，不占画布宽度。菜单 **hover 自动展开 / 移开自动关闭**，无需点击。

**用户裁定的关键决策**：
- hover 底色 = 主题色**实底**（不是淡色），图标文字同时转对比色 → 保证简白/护眼绿可读
- 节点库面板**下线**，加节点改由「添加」菜单直接创建
- 顶部工具栏「快捷键」窗口也要改 hover 自动弹出（**未做，待下一批**）

---

## 2. 已实现文件清单

### 新增
| 文件 | 作用 |
|---|---|
| `src/components/workbench/railConfig.tsx` | 配置事实源：RAIL_ENTRIES / RAIL_HISTORY / RAIL_SEPARATOR_BEFORE + 类型 + 图标组件 |

### 改造
| 文件 | 改动量 | 主要变更 |
|---|---|---|
| `src/components/workbench/WorkbenchShell.tsx` | 重写工具栏段约 200 行 | RailTool 组件重构、双胶囊结构、hover 自动菜单逻辑、addCanvasNode 接入、第 7 格开属性面板 |
| `src/components/panels/NodeLibraryPanel.tsx` | 抽出 `addCanvasNode(kind)` 公共函数 | 菜单建节点复用同一套锚点位置计算（nodeLibraryClickPosition） |
| `src/components/EmptyCanvasCTA.tsx` | 1 行 | 空态文案随节点库下线同步 |

### 测试同步
| 文件 | 主要变更 |
|---|---|
| `e2e/workbench.spec.ts` | libraryToggle → 移除；left-dock 断言改为单面板；addLibraryNode → addRailNode |
| `e2e/golden-path.spec.ts` | 加节点步骤改走「添加」菜单 hover |
| `e2e/initial-draft.spec.ts` | 空态文案断言同步 |
| `tests/workbench-shell.test.ts` | 结构断言从「两张方卡」改为「悬浮胶囊」 |
| `tests/project-tabs.test.ts` | aria-controls 断言改为 id 断言（菜单不再用 button 控制） |

---

## 3. 配置与接口约定

### 3.1 菜单项类型（railConfig.tsx）

```ts
type RailItemKind =
  | "primary"       // 主操作（添加，圆形 accent 底）
  | "tool"          // 普通工具
  | "inspector"     // 面板切换（属性/结果）
  | "separator"     // 分隔线
  | "history";      // 历史操作（undo/redo）

interface RailMenuItem {
  id: string;
  label: string;
  icon: string;        // 图标名 → 对应 RailIcon 组件
  nodeKind?: string;   // 若有，点击后调用 addCanvasNode(nodeKind)
  action?: string;     // 未实现的动作名，留待映射
  subMenu?: RailSubMenuItem[];
}

interface RailSubMenuItem {
  id: string;
  label: string;
  icon: string;
  nodeKind?: string;   // 有此字段 = 直接建节点
  action?: string;     // 有此字段 = 待映射动作
}
```

### 3.2 RAIL_ENTRIES 分组规则

```ts
export const RAIL_SEPARATOR_BEFORE = [1, 4, 6];
// 含义：第 1/4/6 项**之前**插分隔线
// 结果分组：[添加] | [AI换装, 服装设计, 视频生成] | [AI画板, 色彩工具] | [属性/结果]
```

### 3.3 建节点接口（NodeLibraryPanel.tsx 导出）

```ts
// 公共函数：在画布锚点位置创建指定 kind 的节点
export function addCanvasNode(
  kind: string,
  {
    reactFlowInstance,
    screenToFlowPosition,
    setNodes,
    edges,
    NODE_SPECS,
    onConnectEditor,
  }: AddCanvasNodeArgs
): void
```

**调用约定**：菜单项带 `nodeKind` 字段时，`handleSelectItem` 自动调 `addCanvasNode(nodeKind)`，无需额外接线。

---

## 4. 未完成项 · 待映射

以下菜单项当前为**占位状态**（点击无副作用，只关菜单），需要产品给动作映射表后接线：

### 4.1 「AI 换装」工作流（5 项）
| 菜单项 | 预期行为（待确认） |
|---|---|
| 模特试穿 | ？ |
| 摆拍 Pose | ？ |
| 更换背景 | ？ |
| LookBook | ？ |
| 数字模特 | ？ |

### 4.2 「服装设计」工作流（8 项）
| 菜单项 | 预期行为 |
|---|---|
| 印花提取 | ？ |
| 印花裂变 | ？ |
| 服装换色 | ？ |
| 面料更换 | ？ |
| 线稿图到服装 | ？ |
| AI 改款 | ？ |
| 穿搭推荐 | ？ |
| 真人转人台 | ？ |

### 4.3 「视频生成」工作流（4 项）
| 菜单项 | 预期行为 |
|---|---|
| 服装走秀 | ？ |
| 小红书视频 | ？ |
| 首尾帧 | ？ |
| 视频复刻 | ？ |

### 4.4 直接入口（2 项）
| 菜单项 | 预期行为 |
|---|---|
| AI 画板 | ？（跳独立页面？还是开画布模式？） |
| 色彩工具 | ？（开面板？还是跳功能页？） |

### 4.5 待做的同类改造（1 项）
- **顶部工具栏「快捷键」窗口**：用户要求同样改为 hover 自动弹出 / 移开自动关闭，当前仍是点击开合

---

## 5. 视觉规范（摘要）

| 元素 | 规则 | token 引用 |
|---|---|---|
| 胶囊容器 | 宽 56px，圆角 20px，1px 描边，四层软阴影 | `--gc-panel` / `--gc-border` |
| 工具按钮 | 40×40，圆角 12px，间距 4px | 图标色 `--gc-text-muted` |
| hover 态 | 主题色实底 + 图标文字转对比色 | `--gc-accent` / `--gc-accent-cta-ink` |
| 主「添加」按钮 | 40×40 圆形，常驻 accent 底 + accent 投影 | `--gc-accent` |
| 分隔线 | 22px 宽 / 1px 描边 | `--gc-border` |
| 菜单 | 宽 218px，圆角 16px，`left: 52px; top: 0` | 与胶囊同阴影 |
| 键盘焦点 | outline 2px，offset 2px（菜单项 -2px） | `--gc-accent` |
| 减少动态 | 关闭过渡与位移动画 | `motion-reduce` |

> **重要**：菜单必须显式 `top: 0`——之前用 `top: auto` 被 flex 静态位置推到容器外、被 `overflow-hidden` 裁切，e2e 测出来的。

---

## 6. 交互行为（摘要）

| 行为 | 参数 | 说明 |
|---|---|---|
| hover 展开延迟 | 120ms | 防误触 |
| 离开关闭延迟 | 200ms | 鼠标从入口移到菜单的过渡窗口 |
| 菜单互斥 | 是 | 同时只开一个菜单 |
| 点击入口 | 切换开合 | 触屏兜底 |
| 键盘 focus | 立即展开 | 可访问性 |
| Esc | 关闭菜单 + 失焦 | 可访问性 |
| Tab 到菜单项 | 菜单保持打开 | 可访问性 |

---

## 7. 验收标准

### 7.1 结构验收
- [ ] 左侧有两条独立胶囊（主工具组 + 历史组），均悬浮在画布区
- [ ] 主胶囊 7 个入口 + 3 条分隔线，顺序与配置一致
- [ ] 历史胶囊 2 个入口（撤销 / 重做）在画布左下
- [ ] 「添加」是圆形 accent 底，与其他 40×40 圆角按钮区分

### 7.2 交互验收
- [ ] hover 入口 120ms 后展开对应菜单
- [ ] 鼠标从入口移到菜单上，菜单不关闭
- [ ] 鼠标离开菜单 200ms 后关闭
- [ ] 同时只有一个菜单打开（开第二个自动关第一个）
- [ ] 「添加」→ 文本 / 图片 / 视频 点击后在画布上建对应节点
- [ ] 第 7 格「属性 / 结果」点击开合左侧 Dock 面板
- [ ] 键盘 Tab 可聚焦入口，focus 时展开；Esc 可关闭
- [ ] `prefers-reduced-motion` 下无动画

### 7.3 视觉验收（三主题）
- [ ] 曜黑：胶囊 = 亮边暗底，荧光绿主钮，hover 实绿底 + 墨字
- [ ] 简白：胶囊 = 白卡软影，Apple 蓝主钮，hover 实蓝底 + 白字
- [ ] 护眼绿：胶囊 = 浅绿卡，翡翠主钮，hover 实深绿底 + 白字
- [ ] hover 态图标/文字与底色对比度 ≥ 4.5:1（文字）/ ≥ 3:1（图标）

### 7.4 回归验收
- [ ] 三断点 1024 / 1280 / 1440 下工具栏位置正确
- [ ] 空画布 CTA 文案与新交互一致
- [ ] 左侧 Dock 开合行为不受影响（只有属性/结果一个面板）
- [ ] 撤销 / 重做功能正常（历史组按钮）

---

## 8. 测试覆盖

**本地实测全绿**（基于实现提交 `69e5602`）：

| 测试 | 结果 |
|---|---|
| `tsc --noEmit` | ✓ exit 0 |
| `npm run build:web` | ✓ CSS 产物门禁 + 包体门禁均通过 |
| `ast-grep` | ✓ 0 error |
| `depcruise` | ✓ 0 error |
| `git diff --check` | ✓ 干净 |
| `npm run test:e2e` | ✓ **33 passed / 1 skipped / 0 failed**（2.3m） |
| `tests/workbench-shell.test.ts` | ✓ 通过 |
| `tests/project-tabs.test.ts` | ✓ 通过（45 项） |
| `tests/theme-contract.test.ts` | ✓ 通过 |

### e2e 关键用例
- `workbench.spec.ts:630` → adding a library node keeps the canvas mounted（已改为走 rail 添加菜单）
- `workbench.spec.ts:830` → left dock and horizontal zoom controls preserve canvas identity（已改为单面板）
- `golden-path.spec.ts:195` → isolated golden path（加节点步骤已同步）
- `initial-draft.spec.ts:23` → empty first screen（空态文案已同步）

---

## 9. 风险与注意事项

1. **菜单定位硬编码**：`left: 52px; top: 0` 是相对 `.rail-tool` 容器的绝对定位。如果将来改胶囊宽度或图标尺寸，需要同步调这个值。建议改成 CSS 变量或由容器派生。

2. **NodeLibraryPanel 未删除**：节点库面板代码和 `library` prop 都还在，只是入口没了。如果确定彻底下线，可以后续清理（省 ~300 行 + 减少 Dock 复杂度）。

3. **17 个工作流动作为空**：现在点击这些菜单项只关菜单，不报错也不做任何事。建议先加个 `console.warn` 或 toast 提示"开发中"，避免用户困惑。

4. **顶栏快捷键窗口未改**：用户要求"包括顶部工具栏的快捷键窗口"也要 hover 自动弹出，本次没动。优先级请产品确认。

5. **三主题 token 全量使用**：所有颜色、边框、阴影都走 `--gc-*` token，没有硬编码色值——改主题不用动这个组件。

---

## 10. 设计源文件

```
docs/design/2026-09-20-rail-toolbar/
├── design.md                  ← 人读设计规范（详细版）
├── handoff.md                 ← 本交接文件
├── prototype-rail-v2.html     ← 最终版原型（三主题可切换）
├── prototype-rail.html        ← 初版原型（参考用）
├── layout-diagram-v2.txt      ← 最终布局文字示意图
├── layout-diagram.txt         ← 初版布局图
└── shots/
    ├── rail-obsidian.png      ← 曜黑主题截图
    ├── rail-obsidian-menu.png ← 曜黑菜单展开态
    ├── rail-apple.png         ← 简白主题截图
    ├── rail-eye.png           ← 护眼绿主题截图
    └── rail-design-8.png      ← 服装设计 8 项菜单展开
```

---

**交接结论**：核心结构 + 「添加」建节点 + 属性面板入口 已跑通，e2e 全绿。剩下的主要是**17 个工作流菜单项 + 2 个直接入口的动作映射**，需要产品出映射表后前端接线。顶栏快捷键窗口的 hover 改造是同类小活，可顺手带走。
