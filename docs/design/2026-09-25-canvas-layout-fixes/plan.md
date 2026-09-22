# 画布布局与工作台交互修复 — 实施记录

- 日期：2026-09-25 · owner：frontend
- 状态：实施中（8 条 UI/交互修复，独立于已完成的 v8 节点模型重构）

## 背景

v8 七节点模型重构已落地（tsc --noEmit 0 错误）。本批是用户在画布实测后提出的 8 条
布局与交互缺陷修复，属于前端 UI 层，不触碰数据模型。

## 问题清单与根因

| # | 问题 | 根因（代码证据） | 修复方案 |
|---|------|------------------|----------|
| 1 | 登录进入画布不自动适应 | fitView 仅在落地事件 `intent.fitView` 触发；首次登录/打开项目只 `openFlowTab`，不触发 fitView | 画布就绪+节点存在时发一次自适应 |
| 2 | 适应画布应为 80% | `fitView({padding:0.16,minZoom:0.35,maxZoom:1})` 是"缩到装下"非固定 80% | 改为目标缩放 80% 且内容居中 |
| 3 | 撤销按钮无效、位置不对 | HistoryRail 按钮只渲染图标未绑 onClick；定位在 `absolute bottom-4 left-4` | 绑 store.undo/redo；移到左侧工具栏正下方隔 8px |
| 4 | 首次登录应新建未保存项目（**已被 2026-09-25 决策 A 取代**） | 空画布(nodes=[]&&edges=[])不落库 | ~~登录即保证存在一个未保存项目页签~~ → 登录后 0 页签，见下节 |
| 5 | 结果/记录合并、图标移右上角、文字图标、3列缩略图 | 结果在左侧 Dock 两 Tab；缩略图 2 列；示意图标 | 右上角文字图标，点开悬浮面板，3 列缩略图 |
| 6 | 允许关所有页签不提醒、自动保存 | requestClose 有运行中 alert、dirty confirm、initial-draft 双 confirm | 静默关，dirty 先自动保存，空白无改动直接关 |
| 7 | 二级菜单打开时图标也应点亮 | RailTool 只对 inspector 面板传 activePanelOpen | 菜单展开 open 态也点亮 |
| 8 | 节点添加保持合理距离/布局 | nodeLibraryClickPosition 锚点+380 横排，连续添加一条直线延伸 | 最右节点右侧 380px 对齐，超 3 个换行向右下错开 |

## 关键实现点

### 画布自适应（1、2）

- 新增 `fitViewAtZoom(0.8)` 或等价：用 `getNodesBounds` 求内容包围盒，算中心，
  用 `setViewport`/`zoomTo` 将内容中心对齐视口中心，zoom 锁 0.8，duration 0。
- 触发时机：`CanvasFlow` 挂载后一次（nodes 就绪）、切页签、打开项目后。
- "适应画布"按钮 onClick 复用同一逻辑。

### 撤销组位置（3）

- 将 `HistoryRail` 从 `absolute bottom-4 left-4` 改为位于主工具胶囊正下方：
  主胶囊是 `absolute left-4 top-4`，历史组用 `absolute left-4` 且 top 依主胶囊
  高度 + 8px 计算（或两者包进同一个容器，历史组在下）。

### 结果面板（5）

- 从左侧 Rail 移除 inspector 入口（或保留属性但把"结果"独立到右上角）。
- 右上角文字图标（"结果"），点击开悬浮面板（Popover/Sheet），缩略图 grid-cols-3。

### 关闭页签（6）

UI 层（`ProjectTabs.requestClose`）：

- 去掉全部 `confirm`/`alert`（初稿的「二次确认放弃初始项目」与运行中 alert 都删掉）；
  dirty 且非空白 → 先 `await saveTabById` 再关；空白且无改动 → 直接关；只读 → 直接关。
- 关闭被封锁时不再弹窗，而是把 × 置灰 + `title` 给出原因。

store 层（`flowStore.ts`）：

- **单一真相** `projectTabCloseBlockReason(tab, generationSafetyBlockReason)`：运行中付费任务、
  以及「对账未完成 + 有内容的页签」都 fail-closed；`closeTab` 与页签 × 共用这一份判断。
- **允许关掉全部页签**：删掉 `if (remaining.length === 0) remaining.push(newTab())`。
  关光后 `tabs=[] && activeTabId=""`，画布区交给新的 `EmptyWorkspaceCTA`
  （「新建项目 / 打开项目」两个按钮）——不再偷偷塞回一个空白页签。
- **空工作区投影** `EMPTY_ACTIVE_DOCUMENT`：`selectActiveDocument` 在 `tabs.length === 0` 时
  返回这个冻结单例，而不是抛错（52 处调用点无需逐个改）。不变量没有放松：
  `tabs` 非空而 `activeTabId` 落空仍 fail fast。
- **写入 fail-closed**：`commitDocumentMutationWithSet` 在 `tabs.length === 0` 时直接不落变更，
  `addNode` 返回 `null`；避免返回一个并不存在的节点 id。
- **会话快照**：`persistLatestStableState` 在空工作区清掉残留快照并报成功，否则会误报
  「本地恢复失败」（TopBar 红色重试按钮 + 离页确认），违反第 6 条「不提醒」。

### 首次登录的全新未保存项目（4）— 已被 2026-09-25 决策 A 取代

原方案（**不再生效，仅留档**）：冷启动空 `sessionStorage` 时 store 初始态自动带一个
`未命名设计项目` 空白页签。2026-09-25 用户明确要求「登录后没有打开任何页签」，
该自动页签已删除，改为 `tabs=[]`，详见下节。

## 实施记录（2026-09-22 第 4/6 条，运行期取证）

`node node_modules/tsx/dist/cli.mjs probe-empty-workspace.tmp.ts`（真实 store + 受控 sessionStorage，探针跑完即删）：

```
A 冷启动           : tabs=1 name=未命名设计项目 lifecycle=local pristine=true dirty=false
C 关掉全部页签     : tabs=0 activeTabId=""
C 空工作区投影     : isSentinel=true nodes=0 readOnly=false frozen=true
C 空工作区任意 id  : 返回空投影（符合预期）
C 有页签+幽灵 id   : 仍 fail fast（符合预期）
C 空工作区写节点   : null | tabs 仍为 0
D flush 后         : storage=(空) persistenceError=null
E 新建项目后       : tabs=1 pristine=true activeTabId===tab: true
F 有内容页签封锁原因: "正在确认运行历史，为保住付费结果暂时不能关闭这个页签。"
F 门禁期关有内容页签: tabs 1 -> 1（应不变）
F 门禁期关空白页签  : null （应为 null = 可关）
```

## 验证

- `./node_modules/.bin/tsc --noEmit` → 0 错误
- 聚焦测试：`node scripts/test-with-postgres.mjs tests/project-tabs.test.ts tests/generation-safety.test.ts …`
- 结构证据：`ast-grep scan --config sgconfig.yml src server scripts e2e` → `[]`；
  `depcruise --config .dependency-cruiser.cjs src server scripts e2e` → 241 模块 / 929 依赖，
  3 条违规全部是已登记豁免的 `no-circular-baseline`，与本次改动文件无关。
- 交付前 `npm run check`（lint + build:web + 全量测试）→ 全绿：lint 0 错误、
  CSS 与包体门禁通过（初始 JS gzip 168636 / 210000）、`[test:suite] 79/79 通过`。
- 停写指纹复核（范围 `src/` + `tests/`）：
  `git status --porcelain -- src tests | awk '{print $2}' | while read f; do [ -f "$f" ] && git hash-object "$f"; done | sort | shasum -a 256`
  → `a52a697810929710274dd467c44bb2f98bf00484bcd8b53d33e448aafb52713b`

## 待办 / 移交

- **e2e 需同步（归 ui-qa）**：第 5 条把「结果 / 记录」从左侧 Dock 移到画布右上角文字图标后，
  以下断言已过期：`e2e/golden-path.spec.ts:383,423`、`e2e/workbench.spec.ts:588-593`（含
  `grid-cols-2` 缩略图断言，现为 3 列）、`e2e/workbench.spec.ts:984-1010`（属性/结果 Tab 键盘
  导航与 aria-controls）。空工作区新增 `role="region" aria-label="空工作区"` 也需补验收。

## 决策记录（默认，可推翻）

- 第2条：进入时与按钮都锁 80%。
- 第5条：右上角文字图标，点击弹悬浮面板，3 列缩略图。
- 第6条：关任何 dirty 页签先自动保存；**允许关光全部页签**，落底是空白画布 + 中央
  「新建项目 / 打开项目」引导（用户 2026-09-22「继续」确认 B）。
- 第4条：~~登录后立即存在「未命名设计项目」的未保存页签~~（**已被 2026-09-25 决策 A 取代**：
  登录后 0 页签、无自动页签、无自动打开最近项目）。
- 第8条：最右节点右侧 380px，超 3 个换行向右下错开。

## 2026-09-25 第二批：工作台交互改造（4 条，frontend）

用户原话要点与最终决策：

1. 「结果」按钮改名 **历史创作记录**（面板标题与 `aria-label` 同步）。
2. 15 个内置模板从**画布左侧工作栏对应的二级菜单**直接打开；且**不新开页签**，
   而是往**当前已打开的画布内**追加一套拉好线的工作流，**不覆盖原有节点**（向右走）。
3. 页签 + 号进去后**只剩「最近项目」**：「内置模板」与画布左侧工具栏重叠 → 迁走；
   「我的模板」整体取消（模板自动保存、打开过的项目也已自动保存，用不到）。
   后端接口一并取消 → 已移交 backend（卡 `t_c40ec099`）。
4. 用户登录后**无任何页签**，该状态下**左侧工具栏不显示**。
   登录语义取 **A（一律空白优先）**：不自动打开最近已保存项目，恢复交给「打开项目」。

### 实现点

| 文件 | 改动 |
|------|------|
| `src/store/flowStore.ts` | 冷启动 `tabs: restored?.tabs ?? []` 且 `activeTabId` 为空串（不留悬挂 id）；`documentForTab` 导出；新页签落位带 fitView |
| `src/components/workbench/WorkbenchShell.tsx` | 工作流二级菜单点击 → `WORKFLOW_MENU_MAPPING` → `mergeTemplateIntoActiveCanvas`；loading / pending / error 三态提示条；延后项（首尾帧、视频复刻）给「正在开发中」提示；`tabs.length === 0` 时隐藏工具胶囊与 Dock |
| `src/lib/templateLaunch.ts` | 新增 `mergeTemplateIntoActiveCanvas`：整块右移到「最右节点 + 380」同 Y；节点 id 撞车才加后缀（保住资产选择器的模板节点 id 映射）；落地节点 id 走映射后的真实 id |
| `src/components/panels/ProjectCenter.tsx` | 删除 Tabs（内置模板 / 我的模板）、`SaveTemplateForm`、删除模板弹窗与相关 state；只保留「最近项目」+ 搜索；搜索占位改「搜索最近项目」 |
| `src/components/panels/TemplatesDock.tsx` | 整文件删除；`createTemplateRequestPayload` 迁到 `src/lib/templateSerialization.ts`（纯序列化，无 UI） |
| `src/components/EmptyWorkspaceCTA.tsx` | 空工作区引导（新建项目 / 打开项目）；文案改「工作流模板在画布左侧工具栏中直接打开」 |
| `src/components/panels/ResultsFab.tsx` | 「结果」→「历史创作记录」 |
| `src/initialDraft/InitialDraftWorkspace.tsx` | 登录网关：空工作区直接 ready；不再自动打开最近已保存项目 |
| `src/initialDraft/initialDraftMigration.ts` | `shouldRestoreSavedProjectOnStartup` → `shouldStayBlankOnStartup`（语义已变为「保持空白、不新建草稿」，避免函数名误导） |

### 运行期取证（真实 store 探针，跑完即删）

```
✓ 冷启动：0 页签 / activeTabId 空串 / 空投影
✓ 空工作区不产生幽灵节点（addNode → null）
✓ createBlankTab 建立承载页签
✓ 空画布合并：模板原坐标 + 落地选中 source
✓ 已有节点合并：右侧扩展 +380，不覆盖原节点，不丢节点/边（一次合并 = 一次 revision）
```

### 验证

- `./node_modules/.bin/tsc --noEmit` → 0 错误
- `node scripts/test-with-postgres.mjs` → **79/79 通过**
- 受决策 4 影响的既有用例改为显式 `createBlankTab()` 起步
  （recent-results / flow-history / text-edit-coalescing / selection-consistency /
  active-document-boundary / initial-draft-client / project-tabs）

### 待移交

- **ui-qa（e2e）**：登录后 0 页签（原首个空白页签断言失效）、空工作区引导取代默认页签、
  项目中心不再有「内置模板 / 我的模板」Tab、右上角改「历史创作记录」。
  （左侧 Dock 入口的 `属性 / 结果` 标签本轮**未改**——`e2e/workbench.spec.ts:916,1051`
  仍按该名称查询，改名会打破 ui-qa 现有断言，留作独立的小改动。）

### 交接给 ui-qa 的口径裁决（2026-09-25，双方 DM 通道反复丢件，故落文档为准）

1. **boot 落点 = 「空工作区」，是产品意图（决策 4），不是回归。**
   用户原话：登录后没有任何页签，且该状态下左侧工具栏不显示。`App.tsx` 的
   `workspaceEmpty` 分支与 `WorkbenchShell` 隐藏工具栏/Dock 都是有意交付的。
   e2e 侧正确做法 = 在各起点前插「空工作区 → 新建项目」，**不要写成回归契约**。
   （盘上已按此改完 6 个 spec：auth.setup 4 处、workbench 7 处，initial-draft /
   golden-path / production-smoke / performance-baseline 各 2 处。）
2. **`fitView` `maxZoom: 0.8` + 挂载/切页签自动 fitView = 有意**（用户 8 条布局修复
   第 1、2 条：「适应画布 = 80%」「打开/切页签自动适应」）。三处一致：
   `CanvasFlow.tsx:457`（落地事件）、`:473`（挂载/切页签）、`CanvasZoomControls.tsx:110`
   （「适应画布」按钮）。e2e 不应假定初始缩放为 100%。
3. **左侧 Dock 入口名保持「属性 / 结果」不变**（本轮曾改为「属性」后回退），
   `e2e/workbench.spec.ts:916,1051` 无需改动。
4. **模板并入画布的可断言事实**：`builtin-model-tryon` = 4 节点 / 3 边，节点 id
   `tryon-requirement / garment / model / tryon-gen`；第二次加同一套 → id 加后缀，
   节点再 +4、边再 +3、页签数不变、既有节点坐标不变、revision 只 +1。
   延后项：`keyframes` → `role=status`「首尾帧模板正在开发中」；`video-clone` →
   「视频复刻正在开发中」。加载失败 → `role=alert`「加载「<菜单项>」失败：…」，画布/页签不变。
5. **前端停写指纹**（范围 `src/` + `tests/`，本文件所在的 `docs/` 不在内）：
   最后写入 2026-09-22 13:01:43；复核命令与期望值见下节「验证」。
- **backend**：卡 `t_c40ec099` 取消 `POST/DELETE /api/templates` 与 `userTemplateLifecycle`。

### 根因裁定：workbench 12 条红 = spec helper 竞态，**不是 src 回归**（2026-09-22 14:0x）

证据：`test-results/workbench-adding-a-node-fr-e6f04--…/trace.zip` → `0-trace.trace`
单调时间线（ms），以及 `error-context.md` 的失败时 aria 快照（页面＝「空工作区」）：

| t | 动作 | 结果 |
|---|---|---|
| 64786 | `goto("/")` | — |
| 64914 | expect「空工作区」可见 | ✅ |
| 65721 | `queryCount(空工作区)`（helper 判定） | >0 → 点「新建项目」 |
| 65725 | click「新建项目」 | — |
| 65820 | expect「工作流画布」可见 | ✅ 画布确实建出来了 |
| 65822 | POST `force-clear` | — |
| 65830 | `sessionStorage.clear()` | — |
| 65835 | `Page.reload` | — |
| **65924** | `queryCount(空工作区)`（helper 判定） | **reload 后仅 +89ms，React 尚未渲染 → count=0** |
| 65948 | `queryCount(.react-flow__node)` | 0 |
| 65984 | expect「开始创作」 | ❌ 空等 8s；boot 此时才落定，快照＝「空工作区」 |

机制：`e2e/workbench.spec.ts:320` `if (await guide.count() === 0) return;` ——
`Locator.count()` **不自动等待**。`resetToEmptyFirstScreen`（`:344` `page.reload()`）之后立刻调用，
落在 React 首帧之前的窗口里，helper 把「还没渲染」误判为「画布已开」而直接 return，
于是**整个用例没有再点「新建项目」**，一个画布都没有；`startFirstProject` 的
`region[开始创作]` 必然超时。

为什么决策 4 之前不显形：以前冷启动会自动建一个空白页签，helper 即使跳过点击也能等到
带 CTA 的空白画布；决策 4 之后必须靠这次点击，竞态才暴露。**故非 src 回归。**

建议修法（`e2e/**` 属 ui-qa 域，此处只给方案）：

```ts
async function openBlankCanvasFromGuide(page: Page): Promise<void> {
  const guide = page.getByRole("region", { name: "空工作区" });
  const canvas = page.getByRole("application", { name: "工作流画布" });
  await expect(guide.or(canvas)).toBeVisible(); // 先等 boot 落定；count() 不能当等待用
  if (await canvas.isVisible()) return;
  await guide.getByRole("button", { name: "新建项目" }).click();
  await expect(canvas).toBeVisible();
}
```

（本仓 Playwright 1.61.0，`locator.or()` 自 1.33 起可用。）

同类写法（同一类竞态，建议一并复看）：
`workbench.spec.ts:192`（`nodes.count() > 0` 直接 return）、
`workbench.spec.ts:646`、`golden-path.spec.ts:438` 的 `isVisible()` 控制流。
其余 `page.reload()` 点都有前置 `await expect(...)`（`auth.setup.ts:129`、
`golden-path.spec.ts:72`、`initial-draft.spec.ts:162`、`workbench.spec.ts:637/1261`），不受影响。

### 决策 5（2026-09-25 追加）：删除左侧「属性 / 结果」栏 + 结果详情改为点单个结果弹出

用户原话：「1、左侧工具栏的属性/结果这个栏，删除掉，然后把结果详情页整合到，用户在历史创作记录那里点单个结果的时候再弹出」；
四点确认：① 居中 Dialog ② 先开详情、详情里点大图再开查看器 ③ 属性面板整体删掉 ④ 不可达的节点库面板一并删。

开工前实测的现状（与用户表述不同，已当面澄清）：
- 那一栏的真身是入口 `inspector`（label「属性 / 结果」）→ 左侧 Dock(`w-64`) → `ContextPanel`
  → `InspectorPanel view="properties"`，里面**只有属性**（节点名称输入 + 状态 + 说明），
  没有结果页签——结果早在上一批就迁到右上角「历史创作记录」浮层了。
- 左侧 Dock 里还挂着一个「节点库」面板，但没有任何入口能把 `activePanel` 设成 `"library"`
  → 渲染但永远打不开（不可达 UI）。
- 节点改名不依赖该面板：`NodeFrame.tsx:146` 双击节点标题就地改名（title「双击改名」）。
- 点结果卡片原来做两件事：`setSelectedResultId`（让浮层下方内联运行记录出现）+ `openViewer`（直接开图片查看器）。

改动清单：
- **删** `panels/ContextPanel.tsx`、`panels/InspectorPanel.tsx`、`panels/NodeLibraryPanel.tsx`、
  `workbench/workbenchState.ts`（面板状态 `activePanel` 一并移除；原 NodeLibraryPanel 的 `addCanvasNode`
  与落位策略迁到 `panels/canvasNodeActions.ts`，函数更名 `canvasNodeClickPosition`）
- **新** `panels/ResultRecordDetail.tsx`（从 InspectorPanel 拆出，成为弹窗主体）
- **新** `panels/ResultDetailDialog.tsx`（居中本地 shadcn Dialog：大图 + 运行记录 + 查看大图/对比/下载/设为输入）
- **新** `lib/resultActions.ts`（卡片与弹窗共用：`openResultViewer` / `continueWithResult` / `toggleResultCompare`）
- `ResultsFab`：删除浮层内联的运行记录块；点结果 → `detailResultId` → 弹窗；
  **弹窗打开期间浮层不关闭**（关闭弹窗回到原位与滚动位置），document 级 pointerdown/Esc 让路
- `ResultsPanel`：新增必填 prop `onOpenDetail`；主点击与卡片上的「查看」都改为打开详情
  （`aria-label` 保持不变，减少 e2e 选择器churn）；不再直接调 `openViewer`
- `railConfig`：删 `inspector` 条目与 `RailEntry.panel` 字段；`RAIL_SEPARATOR_BEFORE` `[1,4,5]` → `[1,4]`
- `WorkbenchShell`：删 Dock 容器、`LIBRARY_PANEL_ID`/`INSPECTOR_PANEL_ID`、`openPanel`、
  `panelOpen`/`libraryOpen`/`inspectorOpen`、Dock 宽度事件（`emitDockViewportWillChange`）；props 只剩 `children`
- `App.tsx`：`<WorkbenchShell>` 只接 `children`

三态与可访问性：记录不在当前会话（切项目 / 刷新过）→ 弹窗内给明确空态文案（不是空白）；
Esc / 右上角关闭按钮 / 点遮罩三类关闭路径；焦点由 Base UI Dialog 归还原结果卡片；
缩略图是 `button`（Enter/Space 可开）；弹窗内焦点陷阱；运行记录无异步加载（数据来自 store），
分页加载态仍由浮层承担。

**已知遗留（有意不在本批做，建议单独一批）**：`src/lib/dockViewport.ts` 的
`emitDockViewportWillChange` 已无调用点，`CanvasFlow` 对该事件的订阅成为死路径
（真机窗口 resize 仍由 `ResizeObserver` 覆盖）。它压在画布 R1/R2 红线上，本批不动。

**e2e 需同步（ui-qa 域）**：`workbench.spec.ts:994`（按「属性 / 结果」查询按钮）、`:1052`、
`:1074-1089`（Dock 几何与「只剩属性视角」断言）、`:664/736`（注释与前置条件里
「打开图片查看器会收起浮层」的语义已变：现在点结果开详情、浮层保持打开）、
`golden-path.spec.ts:395-440`（结果流：现在要先经详情，再从详情里点大图进查看器）。

**本批建议新增的覆盖（验收口径，6 条）**：
1. 左侧工具栏不再有「属性 / 结果」按钮（`getByRole("button",{name:"属性 / 结果"}).toHaveCount(0)`）；
2. 在「最近生成」里点一条结果 → `role=dialog`、`name=结果详情` 出现，**且浮层 `aria-expanded` 仍为 `true`**；
3. `Esc` 关闭详情，**焦点回到那张结果卡片**（Base UI Dialog 的 `finalFocus`）；
4. 详情里点大图（`aria-label="查看 <节点名> 大图"`）→ 图片查看器出现（不再是一步直达）；
5. 详情保留四个动作：查看大图 / 加入对比（`aria-pressed` 正确翻转）/ 下载 / 设为输入（只读项目下禁用）；
6. 记录不在当前会话时（切项目或刷新后）显示空态文案，而不是空白。

**分支门禁红项：已修（2026-09-25 15:0x）。** 现象是 `tests/e2e-safety.test.mjs:66` 报
`AssertionError: initial-draft relogin recovery must remain in the isolated browser regression matrix`：
它钉的是 `playwright test --list` 里的用例标题，而 ui-qa 在 `dbae2a6` 里把
`e2e/initial-draft.spec.ts` 的 relogin 用例更名为
`relogin lands on the empty workspace without bootstrapping, and the saved project stays reachable`。
`tests/**` 属前端单测域，所以由前端同步断言（不是 ui-qa 改自己的 e2e）。

**修复后 `npm run check` = exit 0**：lint ✓ + build ✓ + 包体门禁 168631/210000 ✓ + `test:suite` **79/79**（53.2s）。

**联动约定（避免再互相踩）**：e2e 用例标题一旦更名，`tests/e2e-safety.test.mjs` 的矩阵断言会跟着红——
ui-qa 改名后把新标题告知前端，由前端改 `tests/`，ui-qa 不要自己动 `tests/**`。
已知待联动项：本批删掉左侧 Dock 后，`workbench.spec.ts` 的
`left dock and horizontal zoom controls preserve canvas identity` 大概率要改名。

**测试基建观察（2026-09-25，ui-qa 发现，非本批引入，归属待定）**：测试库由
`resolveTestDatabaseUrl` 读主仓 `.env`（全局共享），而 `acquireTestLock` 的 projectName 按 worktree 命名
→ 两个 worktree 各自持锁却共享同一个库，互相 reset schema，出现
`relation "sessions" does not exist` / `首次落库失败：HTTP 500` 一类假红。
结论：**e2e 只在主树串行跑，worktree 只做只读量测**。属 `scripts/` + 测试库辅助设施，
建议由 orchestrator 决定是否单独开卡（前端与 ui-qa 都不自行修改测试基建）。

**DM 通道备注**：本轮交给 ui-qa 的两条消息（本批产品变更 + 上面的门禁红项）均 `target_busy` 失败
（第 3、4 次失败，未送达）；因此上述口径以**本文档为准**，ui-qa 从文档读取即可。

### 本批未完成项（截至 2026-09-22 14:0x）

1. **提交授权**：工作树混有 backend / designer / ui-qa 未提交改动，等用户「通过」；
   授权后只按 `src/** + tests/** + docs/design/2026-09-25-canvas-layout-fixes/` 提交。
2. **e2e 验证未闭环（ui-qa 域）**：12 条 workbench 用例因上节竞态全红，
   第二组（模板并入画布 / 延后项 / 加载失败）与决策 4 的断言**至今没有一次真实执行到**。
3. **ui-qa 未跑**：`production-smoke`（需生产构建）、`npm run check`、`npm run build`。
4. **ui-qa 临时文件待清**（未跟踪，勿随提交进入）：`playwright.probe.config.ts`、
   `e2e/tmp-probe.spec.ts`、`shots/`。
5. **`data/templates/builtin/` 重复副本**（`data/**` 非前端非 e2e 域）：6 个 tracked 文件显示
   删除 + 16 个未跟踪（含 `builtin.json`，会让真实数据目录的 `GET /api/templates` 返回 16 条）——
   需 orchestrator 路由清理。
6. **~40 个陈旧 git worktree**（`.worktrees/p2*/` 等）仍带旧 `ProjectCenter`（628 行、7 个
   `TabsTrigger`），是「改动未落地」误判的根因；跨域，建议 orchestrator 清理或约定「以主树为准」。