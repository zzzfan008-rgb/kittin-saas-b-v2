# R-75 方案 C 定稿：空首屏 + 惰性落库（含用户三项裁定）

- 定位：R-74 A'/B' 对比之后，用户拍板的第三方案 C 定稿
- 本文性质：只读定稿文档，不改 `src/**` / `server/**` 产品代码
- 基座：worktree `.worktrees/p2r74`，分支 `p2r74-options`，head `7d74d76`（= `5b27df8` + R-74 文档 commit，src 代码行号二者一致）
- 所有行号均为当前基座实测，非记忆
- 本文供 orchestrator 直接派单（实现卡 R-76 已预建，落地前须先读本文）

---

## 0. 结论先行

方案 C 把「空白项目」从「造出一个结构非法的单 image 起始草稿」改成「本地空白 tab、不落库、
首次实质变更才诞生」，从而**同时**消灭：

1. R-73/R-74 确认的 `bootstrap 400`（首进工作台阻断页）——空白 tab 根本不调 `/initial-draft/bootstrap`；
2. 「上传进节点后保存」的二次 400（R-74 §4 系统性缺口）——auto-text 共享化（必做项）兜底；
3. 「新建项目」空白 tab 保存走 `POST /api/projects` 的 400（该路径同样经 `makeStarterNode`）。

代价与 A' 同源：**空白画布首屏 UX 变化**（去掉单张孤零零的「上传位图片」，换成中央大 CTA），
以及 TaskLauncher 首创作浮层被移除。这已由用户三项裁定明确拍板，不再有「首屏一字不改」的约束。

---

## 1. 用户三项裁定（逐字落地，实现卡不得偏离）

1. **空状态入口**：空画布中央大 CTA「上传图片开始」+「拖入文本/图片节点」提示；节点库面板保留；
   上传动作 = 一键建 image 节点 + auto-text 兜底（自动补空 text 节点 + prompt 边）+ 图片直写。
2. **只重命名不落库**：名字不单独触发保存；只有加了节点/图片才算项目诞生。
3. **TaskLauncher 首创作浮层去掉**：空画布只留中央 CTA，不再有浮层。

---

## 2. 完整状态机（目标语义）

```
进入工作台 ──► 本地空白 tab（nodes=[], edges=[], projectId 本地 nanoid，lifecycle="local"）
                ├─ 不调 /initial-draft/bootstrap，服务端无记录，项目列表无垃圾
                ├─ 只重命名 ──► 仍为空白 tab，无任何网络请求（不 POST/PUT，不 bootstrap）
                └─ 零变更退出 / 刷新 ──► 仍为空白 tab（sessionStorage 恢复或重建，见 §6）

首次实质变更（加 text/image/video 节点、上传图片、素材加入画布）
                └─ 触发 bootstrapInitialDraft（POST /initial-draft/bootstrap）
                   └─ flow = 首次变更后的合法形状（含 auto-text 兜底，schemaVersion=7）
                      └─ 服务端 200，产生初始草稿记录，lifecycle 转 "initial_draft"

之后每次实质变更
                └─ 沿用现有 700ms debounce 自动保存（PUT /initial-draft/:id 同步）

零变更退出（已落库草稿无新改动）
                └─ 不触发额外 PUT；服务端保留最后一次已同步状态
```

关键边界（供实现与验收）：

- **「实质变更」的定义**：导致 `nodes` 或 `edges` 或节点 `data`（含 `outputImages`）变化的修改。
  `projectName` 变更**不**属于实质变更（裁定 2）。
- **重命名的实现语义**：未落库空 tab 上重命名只改本地 `tab.projectName`，不 bump `revision`、
  不置 `dirty`、不触发 sync。当前 `setProjectName`（`flowStore.ts:2889-2893`）经
  `commitDocumentMutationWithSet`（`flowStore.ts:635-697`，`:678` `revision+1`、`:679` `dirty:true`）
  会把名字当文档修改，因此**必须**改：未落库空 tab 的 rename 走「瞬态字段」路径（不写 history/revision），
  或对 rename 单独 gate。落库后（lifecycle=initial_draft）的重命名仍需走 PUT（`syncInitialDraft`
  携带 `name`），否则服务端名字不更新——这条「落库后 rename 仍 PUT」的既有语义不得回退。

---

## 3. 触点清单更新（方案 C 版，全部实测行号）

### 3.1 起始形状制造（改为「空」）

| 触点 | 文件:行 | 方案 C 改动 |
|---|---|---|
| `makeStarterNode` | `src/store/flowStore.ts:1130-1138` | 返回空（或删除该函数）；起始节点不再自动制造 |
| `newTab` 默认值 | `src/store/flowStore.ts:1616` | `opts?.nodes ?? [makeStarterNode()]` → `opts?.nodes ?? []` |
| `createBlankTab` | `src/store/flowStore.ts:2874-2887` | 无代码改动（`:2877` `newTab()` 自动继承空默认） |
| 「新建项目」按钮 | `src/components/panels/ProjectCenter.tsx:292-295` | 无改动（`:293` `createBlankTab()` 自动继承空） |

> 注意：`makeStarterNode` 是「首进 bootstrap」与「新建项目」空白页签的**共用**起点。方案 C 改这一处
> 单点，两条路径同时变成空 `[]`，这是它相对 B'（豁免只落在 bootstrap/PUT 边界、漏掉 POST /api/projects）
> 的决定性优势，也是 R-74 §3.5 那条「第二条 400 路径」论据在方案 C 下的自然收束。

### 3.2 pristine 判定（两处定义改成 `nodes=0 && edges=0`）

| 判定函数 | 文件:行 | 现形状断言 | 方案 C 形状 |
|---|---|---|---|
| `isPristineProjectTab` | `flowStore.ts:1235-1255` | `edges!==0`(1247) 或 `nodes!==1`(1248) 即 false；单 node 须 image/idle/空 outputImages(1250-1254) | `nodes.length===0 && edges.length===0` 才 pristine |
| `isServerInitialDraftPristine` | `initialDraftClient.ts:248-254` | name 正则 + `edges!==0`(249) 或 `nodes!==1`(250) 即 false；单 node 须 image/idle/空 outputImages(253) | name 正则 + `nodes.length===0 && edges.length===0` 才 pristine |

两处**必须锁步**：一处漏改会出现「本地显示空态、服务端判非 pristine」或反之的漂移（R-74 §2.4 同一警告
在方案 C 下依然成立）。

派生消费者（无需改逻辑，形状变化后语义自动迁移，但须回归）：

| 消费者 | 文件:行 | 说明 |
|---|---|---|
| `projectTabHasLocalDraftChanges` | `flowStore.ts:1265-1269` | 空 tab 上 `!isPristineProjectTab` 语义从「有单 image」变为「有节点/边」 |
| `selectActiveProjectIsPristine` | `flowStore.ts:1272-1274` | 供 TaskLauncher 使用，TaskLauncher 移除后本 selector 可保留或删除（见 3.4） |
| `localDraftDirty` | `InitialDraftWorkspace.tsx:87-91` | `!isPristineProjectTab` / `!isServerInitialDraftPristine` 的「脏」判定随形状变化迁移 |

### 3.3 bootstrap 时机（从「进入即 bootstrap」移到「首次实质变更」）

| 触点 | 文件:行 | 方案 C 改动 |
|---|---|---|
| 启动门：bootstrap-pristine / bootstrap-local 分支 | `InitialDraftWorkspace.tsx:320-350`（`:334` `bootstrapInitialDraft`） | 空 tab（本地候选为空）时**不再 bootstrap**；直接进入 ready 空画布 |
| 放弃后重 bootstrap | `InitialDraftWorkspace.tsx:504-548`（`:524` `bootstrapInitialDraft`） | 放弃旧草稿后重建的 fresh tab 若为空，不立即 bootstrap；等首次实质变更 |
| 同步循环 | `InitialDraftWorkspace.tsx:395-411`（`:402-406` 700ms debounce → `synchronizeTab`） | 保留，但触发条件从「revision 变化」改为「首次落库已发生 + revision 变化」 |
| `synchronizeTab`（PUT） | `InitialDraftWorkspace.tsx:240-278` | 保留 |
| 首次落库触发点 | **新增**（建议置于 `commitDocumentMutationWithSet` 或 store 订阅层） | 检测「空 tab → 首次实质变更」时调用 `bootstrapInitialDraft`，成功后转 `initial_draft` 生命周期 |

> 落库时序要区分两处：`flowStore.ts:3827-3831` 的 **250ms debounce** 是 sessionStorage 会话持久化
> （本机），`InitialDraftWorkspace.tsx:402-406` 的 **700ms debounce** 才是服务端 PUT 同步。方案 C 里
> 「沿用现有 debounce 自动保存」指的是后者（服务端 PUT），前者（本机会话持久化）继续原样工作——
> 二者是两个独立 debounce，实现时不要混为一个。

### 3.4 TaskLauncher 移除 + 中央 CTA

| 触点 | 文件:行 | 方案 C 改动 |
|---|---|---|
| TaskLauncher 渲染门 | `src/components/TaskLauncher.tsx:93-94`（`:124` `if (!pristine) return null`） | pristine 时**不再渲染**；TaskLauncher 整体移除或改成非 pristine 才渲染（实际为从不渲染） |
| 空状态中央 CTA | **新组件**（建议 `src/components/EmptyCanvasCTA.tsx`） | 空画布（`nodes=0 && edges=0`）覆盖层：中央「上传图片开始」大 CTA + 「拖入文本/图片节点」提示；节点库面板保留 |

中央 CTA 的交互契约（裁定 1 落地）：

- 「上传图片开始」= 一键 `addNode("image")` + auto-text 兜底（补空 text 节点 + prompt 边）+ 打开文件选择器上传、直写 `outputImages`。
- 「拖入文本/图片节点」提示 = 文案，不改拖拽既有逻辑（`CanvasFlow.tsx:299-333` 的 onDrop 已有 auto-text）。
- 中央 CTA 是**纯展示/入口**组件，业务状态仍在 Store；不新增 theme 源（沿用 `--gc-*`）。

### 3.5 重命名不落库的边界（裁定 2）

| 触点 | 文件:行 | 方案 C 改动 |
|---|---|---|
| `setProjectName` | `flowStore.ts:2889-2893` | 未落库空 tab（lifecycle=local 且 nodes=0&&edges=0）上只改 `projectName`，不 bump revision、不置 dirty、不触发 sync；落库后仍走 PUT |
| `commitDocumentMutationWithSet` | `flowStore.ts:635-697` | 提供「瞬态字段」路径或 rename gate（名字变更不进入 revision/history） |

### 3.6 auto-text 共享化（必做项）

把 `CanvasFlow.tsx:306-330` 的 auto-text 抽成共享函数，覆盖三条「image/video 无 text 上游」路径，
保证「image 有产出必有 text 上游」（满足 INV-1，`server/lib/workflowSchema.ts:326-333`）：

| 路径 | 文件:行 | 现状 | 方案 C |
|---|---|---|---|
| ① 拖入 image/video | `CanvasFlow.tsx:299-333`（`:306-330`） | 已有 auto-text | 改为调用共享函数（行为不变） |
| ② 上传进 image 节点 | `ImageNode.tsx:89-109`（`:99` 直写 outputImages） | 无 text 兜底 | 上传前/后经共享函数补 text + prompt 边 |
| ③ 素材加入画布 | `flowStore.ts:3061-3081`（`addAssetNode`） | image 节点 status=success + outputImages，无 text 边 | 经共享函数补 text + prompt 边 |

共享函数建议签名（伪代码，供实现参考）：

```ts
ensureTextUpstreamForNode(kind: "image" | "video", position: Position, targetNodeId: string): void
// 若当前文档已有 text 节点则不新增，否则在其左侧补一个空 text 节点并连 prompt 边
```

这是 R-74 §4 系统性缺口的根治项，也是方案 C「上传动作 = image + auto-text 兜底」成立的实现基础。
**不是可选项**：少了它，上传/素材路径在 INV-1 下仍会 400，方案 C 的「首次实质变更落库」就会在第一条
真实保存上再次炸。

### 3.7 恢复链路衔接

| 触点 | 文件:行 | 方案 C 保证 |
|---|---|---|
| 恢复最近项目 vs 继续草稿 | `initialDraftMigration.ts:30-38`（`:36` `isServerInitialDraftPristine`） | 空草稿（nodes=0&&edges=0）判 pristine → 有正式项目时优先恢复正式项目；无正式项目时才进空画布 |
| 启动决策 | `initialDraftMigration.ts:55-82`（`:70` `isPristineProjectTab`、`:78` `isServerInitialDraftPristine`） | 本地空 tab 无 unsynced changes → 不产生「已改动草稿」误判 |
| 模板接管 | `templateLaunch.ts:100-134`（`:105` `isPristineProjectTab`） | 空 tab 判 pristine → `launchStarterTemplate` 直接接管（`:113-121` `commitDocumentMutation` 写入模板 nodes/edges）仍成立 |
| 本机会话持久化 | `flowStore.ts:2013-2017`（`loadTabSession` 读 `sessionStorage`）、`:3827-3831`（250ms debounce） | 空 tab 刷新/崩溃恢复后仍是空画布（sessionStorage 持久化空 tab） |

> 说明：会话持久化用 `sessionStorage`（非 localStorage），键与 manifest 逻辑在 `flowStore.ts:3662-3869`。
> 「未落库空 tab 刷新后仍是空画布」由 sessionStorage 恢复空 tab 快照保证，不依赖服务端记录。

### 3.8 e2e 触点（实现卡不写 e2e，但须在单测/类型层面覆盖等价语义，并注明遗留项）

| 触点 | 文件:行 | 现状 | 方案 C 影响 |
|---|---|---|---|
| `dismissPristineLauncher` | `e2e/workbench.spec.ts:190-226` | 靠「重命名 PUT」结束 pristine（`:211-221`） | 方案 C 下 pristine=空 tab、TaskLauncher 移除，此钩子依赖「重命名结束 pristine」的逻辑失效，须由后续 ui-qa 卡重写 |
| initial-draft seed | `e2e/initial-draft.spec.ts:37-47`（`:42-43` `schemaVersion:3, nodes:[], edges:[]`） | 硬编码 v3 seed | **遗留漏迁**：v3 早于版本闸（`workflowSchema.ts:276-279` `<7` 拒绝）。方案 C 客户端序列化走 v7（`documentSnapshot.ts:241-243`），但该 seed 仍须一并修（或由后续 ui-qa 卡修），否则 e2e initial-draft 项目以另一种方式红 |

---

## 4. 服务端零改动 / 契约零改动 / 无豁免（论证）

- **空 flow 已被证明服务端可收**：`validateAndMigrateFlow`（`workflowSchema.ts:272-333`）对
  `nodes=[]`、`edges=[]`、`schemaVersion=7` 的输入不触发任何 fail——INV-1（`:326-333`）只遍历
  image/video 节点，空数组零次迭代；版本闸（`:276-282`）在 v7 下放行。R-74 §1.5 与 ui-qa 探针 C
  均已确认。
- **首次实质变更落库的 flow 必须已是合法形状**：上传/加节点经 auto-text 共享化（§3.6）保证
  「image 有产出必有 text 上游」，因此 bootstrap/PUT 时不会再违反 INV-1。**不需要**任何豁免旗标。
- **不动** `server/**`、`docs/design/2026-09-18-three-node-model/contracts/graph-invariants.md`、
  `WORKFLOW_SCHEMA_VERSION`（保持 7）、`model-contracts.json`。方案 C 把矛盾从「豁免非法形状」转成
  「从不制造非法形状」，与 A' 同源、且比 B' 更彻底（连「上传后保存」与「新建项目」两条路径一并覆盖）。

---

## 5. 实现卡验收清单草稿（供 orchestrator 派单）

> R-76 卡已预建（assignee=frontend，worktree `.worktrees/p2empty`，分支 `p2empty-canvas`）。
> 以下清单作为该卡的权威验收规格；与卡 body 冲突处，以用户三项裁定（§1）与本节为准。

### 5.1 行为验收（本地真实走查，硬性）

1. 空进工作台 → 网络面板无 `/initial-draft/bootstrap` 请求、无 400、无落库请求；画布显示中央 CTA。
2. 空 tab 上加一个 text 节点 → 首次落库（bootstrap 200）；服务端出现初始草稿记录。
3. 空 tab 上传图片 → 一键建 image 节点 + auto-text 补 text 节点 + prompt 边 + 图片直写；保存 200；
   flow 序列化后 image 节点有 text 上游（INV-1 通过）。
4. 空 tab 只重命名 → 无 POST/PUT/bootstrap 请求；项目列表无垃圾。
5. 刷新 → 空 tab 仍是空画布（sessionStorage 恢复），不因刷新产生服务端记录。
6. 已落库草稿（lifecycle=initial_draft）重命名 → 仍走 PUT，服务端名字更新（语义不回退）。

### 5.2 单测/类型/静态（硬性）

1. `tests/initial-draft-client.test.ts:37-63,147-157` 的 fixture / pristine 断言改为空形状（nodes=0&&edges=0）。
2. 新增单测：空 tab 不产生网络落库；首次加 text 节点落库；上传图片落库且图含 text 入边；重命名不落库；
   刷新恢复仍空。
3. INV-1 正例（`tests/workflow-schema.test.ts:70-82`）**不得动**（方案 C 不动服务端）。
4. `npx tsc --noEmit` 0 错；`ast-grep` / `dependency-cruiser` 无新增违规。

### 5.3 交付证据（硬性）

1. 分支持续基于 `5b27df8`（`.worktrees/p2empty`，`p2empty-canvas`）。
2. `npm run test:suite` 无新增红（当前 unit 全绿须保持）。
3. 推分支 + 贴 GHA 各 check 结论（static / unit / e2e / production-smoke / code-intelligence）。
4. 报告贴卡评论：SHA + 推没推 + 空状态截图路径或 DOM 证据。

---

## 6. 待确认 / 风险（实现前需拍板或注明，不自行填坑）

1. **「首次实质变更」的精确触发点**：在 `commitDocumentMutationWithSet`（`flowStore.ts:635`）统一拦截，
   还是在 sync 循环（`InitialDraftWorkspace.tsx:395-411`）拦截？二者对「空 tab → 首次落库」的时序不同
   （前者更早、更集中；后者复用现有 revision 语义）。建议在 `commitDocumentMutationWithSet` 层判定
   「当前 tab 空且本次 patch 含 nodes/edges/data 变更」→ 触发 bootstrap，但具体位置由实现卡定夺并写进
   交付说明。
2. **`selectActiveProjectIsPristine` / `selectActiveProjectIsPristine` 的去留**：TaskLauncher 移除后，
   该 selector 若再无消费者应一并删除（避免死代码）；若 `templateLaunch`/`InitialDraftWorkspace` 仍需
   「空态」判定，保留但改名。实现卡须说明取舍。
3. **e2e 归属**：`workbench.spec.ts:190-226` 与 `initial-draft.spec.ts:42-43` 的 v3 seed 归后续 ui-qa 卡
   （R-76 边界明确「不动 e2e」）。实现卡若测试碰到，须注明不擅自改 e2e。

---

## 7. 与 R-74 文档的关系

本文是 R-74（A'/B' 对比）的**拍板产物**，不是第二份冲突规则。R-74 的触点清单（§1）与根因链（§0）
仍是本文的事实来源；本文只在「方案选择」与「pristine 形状」两处覆盖 R-74 的 A'/B' 假设。历史证据冲突时
以本文 + 用户三项裁定为准。
