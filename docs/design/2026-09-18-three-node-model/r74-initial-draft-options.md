# R-74 空白起始草稿两修法 A'/B' 完整影响面对比（供拍板）

> **已拍板：见方案 C 定稿 [r75-lazy-empty-canvas.md](./r75-lazy-empty-canvas.md)**
> （用户已选择第三方案 C——空首屏 + 惰性落库 + auto-text 共享兜底，含三项裁定。本文 A'/B' 对比
> 保留为历史分析证据，其根因链 §0 与触点清单 §1 仍是方案 C 的事实来源。）

- 定位：ui-qa R-73 实测确认，证据已验收 ✓
- 本文性质：只读分析，不改 `src/**` / `server/**` 产品代码
- 基座：worktree `.worktrees/p2r74`，分支 `p2r74-options`，head `5b27df8`
- 所有行号均为当前基座实测，非记忆

---

## 0. 根因链条（已逐行核实）

全新账号首进工作台的 400 由「客户端造出一个结构非法的起始草稿」触发：

1. `src/store/flowStore.ts:1130-1138 makeStarterNode()` 返回**单个 image 节点、0 边**；
   `data` 由 `defaultNodeData("image")`（`flowStore.ts:1047-1053`）给出：
   `{ kind:"image", label:"图片", status:"idle", aspectRatio:"3:4", batchSize:1, outputImages:[] }`。
2. `newTab()`（`flowStore.ts:1603-1636`）第 1616 行 `opts?.nodes ?? [makeStarterNode()]`，
   空白页签默认就带这个 image 节点。
3. 客户端序列化 `persistedWorkflowForProjectTab`（`flowStore.ts:3457-3459`）→
   `documentSnapshotToPersistedWorkflow` 写 `schemaVersion: WORKFLOW_SCHEMA_VERSION (=7)`
   （`src/lib/documentSnapshot.ts:243`，`WORKFLOW_SCHEMA_VERSION=7` 见 `src/types/workflow.ts:144`）。
4. `bootstrapInitialDraft`（`src/initialDraft/initialDraftClient.ts:180-194`）POST 到
   `/api/projects/initial-draft/bootstrap`。
5. 服务端 `server/routes/projects.ts:403-468` bootstrap 路由第 423 行
   `validateAndMigrateFlow(flow)`。
6. `server/lib/workflowSchema.ts:326-333` INV-1 循环：image 节点无 text 入边 →
   `fail("flow.nodes", "「图片」需要至少一个上游文本节点提供提示词")`。
7. `WorkflowValidationError` → `projects.ts:465` 转 400 → 前端 BlockingScreen。

即：**起始草稿的「1 张上传位图片 + 0 边」在结构上就违反 INV-1**，而 INV-1 无豁免。

### 两处「pristine」定义都硬编码了这个非法形状

| 判定函数 | 文件:行 | 形状断言 |
|---|---|---|
| `isPristineProjectTab` | `src/store/flowStore.ts:1235-1255` | `edges.length===0` + `nodes.length===1` + `node.kind==="image" && status==="idle" && outputImages.length===0` |
| `isServerInitialDraftPristine` | `src/initialDraft/initialDraftClient.ts:248-254` | 同上（name 正则 + 1 node + idle image + 空 outputImages） |

两者一致地把「1 idle image + 0 边」当成合法空白态，与服务端 INV-1 直接冲突。

---

## 1. 现状触点全量清单（两方案共同基线）

### 1.1 客户端（起始形状的生产者与消费者）

| 触点 | 文件:函数:行 | 作用 |
|---|---|---|
| 起始节点制造 | `flowStore.ts:makeStarterNode:1130-1138` | 空白项目唯一来源 |
| 空白页签装配 | `flowStore.ts:newTab:1616` | `?? [makeStarterNode()]` |
| 空白判定(本地) | `flowStore.ts:isPristineProjectTab:1235-1255` | 决定 TaskLauncher 是否出现 |
| 空白判定(服务端快照) | `initialDraftClient.ts:isServerInitialDraftPristine:248-254` | 决定「恢复/接管」判定 |
| 首创作浮层 | `TaskLauncher.tsx:94`（`selectActiveProjectIsPristine`→`flowStore.ts:1272-1274`） | pristine 才渲染 |
| 启动决策 | `initialDraftMigration.ts:36,78`（`isServerInitialDraftPristine`） | 恢复最近项目 vs 继续草稿 |
| 草稿接入 | `InitialDraftWorkspace.tsx:104`（`isServerInitialDraftPristine`） | applyDraft 脏判定 |
| 模板接管 | `templateLaunch.ts:105`（`launchStarterTemplate` 判 `isPristineProjectTab`） | 首次任务接管初始草稿 |

### 1.2 服务端（schema 校验的 5 个调用点，全部无豁免旗标）

| 调用点 | 文件:行 | 语义 |
|---|---|---|
| 列表加载 | `server/routes/projects.ts:61` | `GET /api/projects` 逐行 map |
| 正式保存 | `projects.ts:280` | `POST /api/projects/`（新建项目） |
| 草稿 bootstrap | `projects.ts:423` | `POST /initial-draft/bootstrap` ← 400 现场 |
| 草稿同步/重命名 | `projects.ts:495` | `PUT /initial-draft/:id` |
| 打开已存项目 | `projects.ts:766` | `GET /api/projects/:id` |

INV-1 唯一实现：`server/lib/workflowSchema.ts:326-333`（image/video 必须 ≥1 条 text prompt 入边，无豁免）。

### 1.3 契约

- `docs/design/2026-09-18-three-node-model/contracts/graph-invariants.md:23`
  「INV-1 在**保存/加载/模板实例化**时强制（schema 层）」；`:25` 违反文案；`:117` §3 画布行
  「新建 image/video 节点时若无 text 节点可连，**自动生成空 text 节点并预连**」。
- 画布 auto-text 实现：`src/components/CanvasFlow.tsx:306-330`（仅 drag-drop 新建节点时触发）。

### 1.4 测试 / e2e 触点

| 触点 | 文件:行 | 现状 |
|---|---|---|
| 空白判定单测 | `tests/initial-draft-client.test.ts:37-63`（`tab()` fixture 单 image 节点）、`:147-157`（pristine 断言） | 与 `makeStarterNode` 形状耦合 |
| INV-1 单测 | `tests/workflow-schema.test.ts:70-82` | 「image 无 text 上游拒绝」正例，A'/B' 都不能让它失效 |
| workbench 前置 | `e2e/workbench.spec.ts:200-226 dismissPristineLauncher` | 靠「重命名初始草稿」结束 pristine；重命名 PUT 会带 `draft.flow` 回服务端（`PUT` 再次过 INV-1） |
| initial-draft seed | `e2e/initial-draft.spec.ts:42-45` | **seed 硬编码 `{ schemaVersion: 3, nodes: [], edges: [] }`** |

### 1.5 关键观察：e2e 为什么抓不到这个 400

- `e2e/initial-draft.spec.ts:42-45` 用 `nodes: []`（空数组）seed 草稿，空数组不触发 INV-1
  （INV-1 只遍历 image/video 节点，`workflowSchema.ts:327`），所以 e2e 的 bootstrap 从不踩雷。
- 该 seed 还硬编码 `schemaVersion: 3`，早于 v7 版本闸（`workflowSchema.ts:276-279`：`<7` 一律拒绝，
  契约 `data-model.md §2`）。这与「CI main 5/5 绿、本分支引入」一致——seed 是 v7 重构的漏迁产物，
  任一方案落地时必须一并核对，否则 e2e 的 initial-draft 项目会以另一种方式红。
- 结论：bootstrap-400 对 e2e 不可见，因为 e2e 从未用「1 idle image + 0 边」走过 bootstrap。

---

## 2. 方案 A'（前端改起始草稿，服务端零改动）

起始草稿从「单 image + 0 边」改为结构合法的形态。两个子形态：

- **A'-1**：`makeStarterNode()` 返回**单 text 节点**（空白画布 = 一个空提示词文本节点，无上传位）。
- **A'-2**：`makeStarterNode()` 返回**text 节点 + image 节点 + 一条 text→image prompt 边**
  （空白画布 = 空提示词 + 图片上传位，已被 ui-qa 探针 D/E 证明服务端可收 ✓）。

### 2.1 代码触点（A'-2 为准，A'-1 略少）

| 文件:函数:行 | 改动 |
|---|---|
| `flowStore.ts:makeStarterNode:1130-1138` | 返回 text+image+prompt 边（或单 text） |
| `flowStore.ts:isPristineProjectTab:1235-1255` | `nodes.length!==1`(1248) 与 kind 断言(1252-1254) 改为匹配新形状 |
| `initialDraftClient.ts:isServerInitialDraftPristine:248-254` | 同上镜像 |
| `tests/initial-draft-client.test.ts:37-63,147-157` | `tab()` fixture 与 pristine 断言改新形状 |
| `templateLaunch.ts:105` | 无改动（`launchStarterTemplate` 只读 `isPristineProjectTab`，形状变化后语义不变） |
| `CanvasFlow.tsx:306-330` | 无改动，但需回归：A'-2 起始已含 text 节点，拖新 image 节点时 `!hasText` 为 false，不再二次造 text |

### 2.2 契约 / 不变量

- **不动** `graph-invariants.md`。INV-1 原样保留（image 仍必须 ≥1 text 入边），A'-2 让起始草稿
  **结构上满足** INV-1，等于把矛盾从「豁免」转成「造合法的数据」。
- 不新增 schema 字段、不 bump `WORKFLOW_SCHEMA_VERSION`。

### 2.3 UX 变化（这是 A' 的实质代价，需你拍板）

- 现状：空白画布 = 一张「上传位图片」（`ImageNode.tsx:147-278` 的 `IMAGE · 槽位`）。
- A'-2：首屏 = 一个空 text 节点（左）+ 一个 image 上传位（右）+ 一条 prompt 边。
  图片输入**仍从 image 节点发起**（上传位保留），但多了一个空提示词节点，提示「先填提示词，再上传/生成」。
- A'-1：首屏只有 text 节点，**丢失「上传即图」入口**——用户必须先手动加 image 节点才能上传参考图，
  这是对 R8「图片输入输出同体」首个动作路径的破坏，**不建议单独采用**。

### 2.4 风险

- **A'-1 破坏 R8 首动作**：空白画布不再能直接上传图片，与「上传即图 / 蒙版 / 多图」的首条链路脱节。
- **pristine 双定义锁步**：`isPristineProjectTab` 与 `isServerInitialDraftPristine` 必须同时改，
  漏一处会出现「本地显示启动器但服务端判非 pristine」或反之的漂移。
- **测试/e2e fixture 漂移**：`tests/initial-draft-client.test.ts` 的 `tab()` fixture、
  `e2e/workbench.spec.ts:200` 注释「保持单一 image-input 节点不变」都要同步改；`e2e/initial-draft.spec.ts:42` 的
  `schemaVersion:3` 漏迁 seed 也必须修（否则 A' 落地后 e2e 仍以另一种方式红）。
- **不破坏「上传即图/蒙版/多图」本体**：A' 只改起始形状，`addAssetNode`（`flowStore.ts:3061-3081`）、
  `ImageNode.tsx:90-99`（上传直写 outputImages）不动；A'-2 下「往起始 image 节点上传」仍保留其 prompt 边，
  保存可过 INV-1 ✓。

### 2.5 工作量

- 核心 2 文件（`flowStore.ts` makeStarterNode + isPristineProjectTab）、
  `initialDraftClient.ts` 1 函数、`tests/initial-draft-client.test.ts` 1 fixture、
  e2e 注释/seed 各 1 处。**约 4-6 个文件，无 schema/契约/服务端改动**，回归面集中在客户端启动 + 首创作。

---

## 3. 方案 B'（后端窄豁免 pristine 初始草稿的 INV-1）

仅当 flow 是「pristine 初始草稿」形状时豁免 INV-1，其余保存/加载/模板实例化仍强制。

### 3.1 精确边界条件（防泛化，这是 B' 成败关键）

豁免必须是**形状级、且只在「什么都没做」的空态生效**，一旦有任何真实编辑立即退出豁免：

```
豁免条件（全部同时成立）：
  flow.schemaVersion === 7
  && flow.nodes.length === 1
  && 唯一节点 type === "image"
  && 该节点 data.status === "idle"
  && 该节点 data.outputImages.length === 0
  && flow.edges.length === 0
```

关键论点：这个形状 = 「用户尚未做任何事」的空态。**只要用户上传了图片（outputImages 非空）、
加了任何节点或边，豁免即失效，INV-1 重新强制**。因此它不会被泛化到正常保存——
正常保存的图里要么有边、要么 image 有产出，都落回 INV-1。

### 3.2 代码触点

| 文件:函数:行 | 改动 |
|---|---|
| `server/lib/workflowSchema.ts:326-333` | INV-1 循环前加「是否 pristine 空态」短路 |
| `server/lib/workflowSchema.ts:272-280`（`validateAndMigrateFlow` 签名） | 需新增可选旗标或形状判断（5 个调用点都要确认走位） |
| `projects.ts:423`（bootstrap）、`495`（PUT 重命名） | 两处都要豁免（重命名 PUT 也会带 pristine flow 回服务端） |
| `contracts/graph-invariants.md:23` | 文字改为「INV-1 在保存/加载/模板实例化强制；**pristine 初始草稿空态除外**」并写明精确形状 |

### 3.3 契约 / 不变量

- **要动** `graph-invariants.md:23` 的「无豁免」语义，并把豁免形状写进契约正文（否则 schema 与契约漂移）。
- 这是对共享契约 INV-1 的**语义削弱**，必须同步改 `tests/workflow-schema.test.ts` 新增「pristine 空态豁免」正例 +
  「upload 后退出豁免仍拒绝」反例。

### 3.4 UX 变化

- **保持 R8 口径不变**：空白画布仍是单张上传位图片，TaskLauncher 行为、首屏都不变。
- 代价：B' 只修「入口 400」，不修「上传后保存」——见 3.5 第一条。

### 3.5 风险（B' 的两个硬伤）

1. **修不掉「上传后保存」的二次 400**（关键发现）：
   上传直写 outputImages（`ImageNode.tsx:90-99` `updateNodeDataInTab(..., { outputImages:[...], status:"success" })`），
   **不建 text 边**。用户上传后 flow 变成 `1 image(status=success, outputImages 非空) + 0 边`，
   已**不满足 3.1 豁免形状**（outputImages 非空、status 非 idle），于是下一次保存（PUT 重命名/同步）
   `projects.ts:495` 再次 INV-1 → 400。即：B' 把 400 从「进门」推迟到「上传后第一次保存」，
   除非同步补「上传路径自动造 text 节点并预连」（那已是 A' 的前端工作）。
2. **v6 旧数据后门**：若把豁免写宽（比如「image 无 text 边一律放行」）就是 v6 回归。
   3.1 的形状级窄豁免可挡住这条，但要求 `validateAndMigrateFlow` 里做节点数据深判断，
   与「schema 层只管结构」的既有分层（`workflowSchema.ts` 注释、`data-model.md §3`）有张力，
   审阅成本高。`schemaVersion=7` 闸（`workflowSchema.ts:276-279`）已拒绝 ≤6，与 P2-f 清理口径一致，
   B' 不破坏该闸，但豁免逻辑本身需要一条跨层一致性测试兜底。
3. **修不掉第二条 400 路径（「新建项目」空白 tab）**：`makeStarterNode()` 是「首进 bootstrap」与
   「新建项目」空白页签的**共用**起点——`createBlankTab`（`flowStore.ts:2874-2877`）同样经 `newTab()`
   取到单 image + 0 边，`ProjectCenter.tsx:292-293` 的「新建项目」就调它。该空白 tab 一旦保存走
   `POST /api/projects`（`projects.ts:280`），**不经过** initial-draft bootstrap，B' 的豁免旗标若只落在
   bootstrap/PUT 边界，这条路径仍 400。A' 改 `makeStarterNode` 单点同时覆盖两条路径，这是 A' 相对 B'
   的又一决定性优势。

### 3.6 工作量

- `workflowSchema.ts` 1 处短路 + 签名、`projects.ts` 2 处调用点、
  `graph-invariants.md` 契约文字、`tests/workflow-schema.test.ts` 新增 2-3 条。
  **文件数少（约 4 个），但动的是共享 schema + 契约 + 5 调用点的语义**，回归面在服务端校验层，审阅更重。

---

## 4. 系统性发现（两方案都绕不开的背景事实）

INV-1 与 R8「图片输入输出同体」的冲突**不止于 bootstrap**，还有两个相邻链路当前同样
「image 有产出但无 text 边」：

| 链路 | 文件:行 | 现状 |
|---|---|---|
| 上传进已存在 image 节点 | `ImageNode.tsx:90-99` | 直写 outputImages，不建 text 边 |
| 素材浏览器「加入画布」 | `flowStore.ts:addAssetNode:3061-3081` | 新 image 节点 `status:"success"` + outputImages，不建 text 边 |
| （对照）拖拽新建 image/video | `CanvasFlow.tsx:306-330` | **有** auto-text 兜底 |

也就是说，v7 里「先上传后提示词」这条 R8 主路径在 INV-1 下只有「拖拽新建」被兜住，
「上传进节点」「素材加入画布」两条路没有 text 兜底。这是本分支 v7 重构的系统性缺口，
**A'-2 顺带覆盖了「上传进起始节点」这一条**（起始 image 已有 prompt 边），
但 `addAssetNode` 那条仍独立存在，建议另开卡（R-75）统一「无 text 上游时自动造 text 并预连」的兜底，
而不是在 R-74 里硬塞。

---

## 5. 工作量 / 风险 / 回归面对照

| 维度 | A'（推荐 A'-2） | B'（窄豁免） |
|---|---|---|
| 改的文件数 | 4-6（全客户端 + 测试） | ~4（服务端 schema/路由 + 契约 + 测试） |
| 是否动共享 schema | 否 | 是（INV-1 语义 + 5 调用点） |
| 是否动契约文字 | 否 | 是（graph-invariants.md:23） |
| 是否动服务端 | 否 | 是 |
| 修复范围 | 入口 400 + 「上传进起始节点」保存 | 仅入口 400 |
| 「上传后保存」二次 400 | 已覆盖（起始 image 有 prompt 边） | 未覆盖（需再补前端 auto-text） |
| UX 变化 | 空白画布从单上传位 → 文本+上传位 | 无变化（保 R8 上传位） |
| v6 后门风险 | 无 | 有（若豁免写宽即回归；窄豁免可挡但审阅重） |
| 回归面 | 客户端启动 + 首创作 | 服务端校验层（跨 5 调用点） |

---

## 6. 推荐

**推荐 A'-2（前端：起始草稿改为 text + image + prompt 边）**，理由：

1. **把矛盾从「豁免」转成「造合法数据」**——不动 INV-1 契约、不动共享 schema、不动服务端，
   天然规避 B' 的「豁免被泛化成 v6 后门」这条最重的风险。
2. **修复面更完整**——同时修「入口 400」和「上传进起始节点后的保存 400」；
   B' 只修入口，把 400 推迟到「上传后第一次保存」，等于半吊子。
3. **回归面更浅**——全部集中在客户端启动 + 首创作判定，服务端零改动；B' 动的是 5 个调用点共享的校验语义，审阅更重。
4. **首屏 UX 更符合产品主线**——「文本提示词 + 图片上传位」正是 garment 生成的正确心智；
   丢失的只是「一张孤零零的上传位图片」这个过渡形态。

A' 的实质代价是**空白画布首屏 UX 变化**（2.3 节），这需要你拍板认可「空白项目 = 空提示词 + 上传位」而非
「空白项目 = 单张上传位图片」。

**B' 作为备选仅在以下条件成立时才选**：你坚持「空白画布必须保持单张上传位图片、首屏一字不改」，
且接受「B' 落地后还需再补一次前端 auto-text 才真正闭环」。此时 B' 的豁免形状必须严格按 3.1 写死，
并在契约 `graph-invariants.md:23` 落文字 + 新增 schema 测试，否则就是 v6 回归。

**不建议**：A'-1（单 text 节点）——它丢掉「上传即图」首动作，破坏 R8 口径，收益最低。

### 后续建议（不在 R-74 范围，供 orchestrator 分解）

- R-75：把 `CanvasFlow.tsx:306-330` 的 auto-text 抽成共享函数，覆盖 `ImageNode.tsx:90-99` 上传路径与
  `addAssetNode`（`flowStore.ts:3061-3081`），统一「image 有产出但无 text 上游时自动补 text + prompt 边」，
  根治 4 节的系统性缺口。
- 修 `e2e/initial-draft.spec.ts:42-45` 的 `schemaVersion:3` 漏迁 seed（任一方案落地都必须做）。
