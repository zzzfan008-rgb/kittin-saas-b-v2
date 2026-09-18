# 契约：图不变量（R3 强制上游 text 节点）

- 来源：plan.md §1.3；需求挂靠 R3、§3.5
- 本文是三处实现（画布 / schema / 运行前置）的**统一语义来源**；任何一处改动必须同步另两处并由同一条测试断言覆盖。
- v2：Q1=B 新增 text→text 串联边；Q3 已裁定 A（抹平 fabric handle），无新增规则。
- v3.1（缺口修复）：INV-2 注释对齐 runtime.md §0 的下游读取规则；§4 消除重复行并补 i18n 键清单与可访问性要求。
- v3.2（R-39）：新增 §2b 参考图序号展示语义（拉线自动定序 + 节点徽标，取代 runtime.md 原 §5b 的「顺序编辑归悬浮窗口」口径）；§4 补序号派生/重排测试契约；§5 补徽标 i18n 键与可访问性要求。

## 1. 不变量

```
G = (V, E)，V 中每个节点有 kind ∈ {text, image, video}

INV-1（结构）：
  ∀ n ∈ V, n.kind ∈ {image, video}
    ⇒ |{ e ∈ E : e.target = n ∧ e 为 text 边 }| ≥ 1

INV-2（内容）：
  对 INV-1 中至少一条 text 边的源节点 t：t.data.text.trim() ≠ ""
  （注：下游读取一律取 data.text 已采纳正文，不取 outputText——统一定义见 runtime.md §0）
```

- INV-1 在**保存/加载/模板实例化**时强制（schema 层）。
- INV-2 在**运行前**强制（运行前置检查）；保存时允许空 text（用户可以先摆结构后填词）。
- 违反 INV-1：保存/加载拒绝（422），文案：`「{节点label}」需要至少一个上游文本节点提供提示词`。
- 违反 INV-2：运行拒绝，节点显示错误徽标，文案：`「{节点label}」的上游文本节点还没有填写提示词`。

## 2. 边类型

边分两类，由 `targetHandle` 区分：

| 边类型 | source kind | target kind | targetHandle | 语义 |
|---|---|---|---|---|
| text 边 | text | image / video | `"prompt"` | 提供提示词正文 |
| text 串联边 | text | text | `"prompt"` | Q1=B 新增：多段正文串联，运行时按边顺序拼接（runtime.md §1b） |
| image 边 | image | image / video | `"reference"`（缺省） | 提供参考图/首帧 |

- text 节点的 text 入边仅用于运行路径的输入串联（§runtime 1b）；text 节点**没有 image 入边**。
- image/video 节点的 `"prompt"` handle 只接受 text 源；`"reference"` handle 只接受 image 源。画布 `isValidConnection` 按此表判定，非法连线不允许落边。
- 一个 image/video 节点可接多条 text 边：运行时按边数组顺序拼接各 text 正文（`\n\n` 连接）。多 text 上游是有意支持的形态（例：一条写款式、一条写场景）。
- image 边数量上限：image 节点 ≤ 8；video 节点 ≤ 1（首帧，Q2=A 已裁定）。
- text→text 串联不触发 INV-1（INV-1 只约束 image/video 节点）；串联成环由 DAG 拓扑环检测兜底（不变）。

### Q3 已裁定：形态 A（抹平）

上表即全部边类型；面料参考图是普通 image 边，顺序语义。画布零新增 handle；本文件无新增规则。

- 用户裁定：Q3 = **A（抹平）**，2026-09-18 晚。
- 依据：`q3-canvas-forms/comparison.md`（含「连错线后果」分析，推荐 A）+ 用户拍板。
- 语义承载位置：「谁是面料」由选中的系统提示词正文声明（如「参考图 2 = 面料」），顺序即语义。
- 风险：顺序错导致静默跑偏，由运行前预览（参考图列表按顺序展示缩略图）兜底。

原分支 B（保留 fabric 专用 handle）已否决，不再写入契约。

## 2b. 参考图序号的展示语义（R-39：拉线自动定序 + 节点徽标）

**用户裁定**（2026-09-18 晚，orchestrator 中继，两次裁定合并）：

> 「正常应该是在用户拉线的时候，自动给图片节点排序打标，并且把顺序在图片的右上角显示出来」
> 补充裁定：徽标跟随**当前选中的目标**显示——序号 = （选中目标， 源图片） 的派生视图；未选中目标时不渲染。

本条**取代** v3 中 B1/B2 的「边顺序编辑归悬浮窗口」口径：序号不是用户手动编辑的对象，而是拉线行为的自动副产品 + 节点上的直接可见标记。视觉与交互规范（徽标样式、位置、多选呈现）归 designer 的 R-38 产物，本节只定**数据与派生口径**。

### 2b.1 事实来源与派生规则

- **唯一事实来源**：`edges` 数组顺序。序号（ordinal）是纯视图概念，**永不持久化**——不写入节点 `data`、不进 `DocumentSnapshot`、不进 flow_json、不进历史条目。违反本条即制造双源真相（陈旧序号 vs 边数组漂移）。
- **派生定义**：对任一有序对 `(targetId, sourceId)`，序号 = 目标 `targetId` 的 image 入边数组中，`source === sourceId` 的边的下标 + 1（1-based）。只有 image 边（`targetHandle="reference"`）参与编号；text 边（`targetHandle="prompt"`）不参与。
- **拉线自动定序**：新建 image 边连入即追加到该目标入边数组**末尾**（序号 = 当前最大 +1）。与现有 `addEdge` 追加语义一致，画布层零改动，无手动排序交互。
- **断线/删除重排：补位（shift-up）**。删除中间一条边后，后续边上移补位（数组原生语义），序号始终连续 1..N 无空洞。理由：Q3=A 后「顺序即语义」（如「参考图 2 = 面料」），空洞会使角色指代歧义；补位保证「边数组顺序 == 显示序号」不变量恒成立。
- **不变量 INV-3**（新增，由派生定义直接成立，无需额外强制）：
  ```
  ∀ n ∈ V, n.kind ∈ {image, video}：
    n 的 image 入边按数组顺序编号 1..k（k = 入边数），连续无空洞；
    显示序号 ≡ 边数组下标 + 1。
  ```
  该不变量不是存储约束，而是**派生函数的契约**——任何序号的呈现都必须经此派生，禁止旁路。

### 2b.2 选中态口径（补充裁定）

- 序号是 **(selectedTargetId, sourceId)** 的二元函数，不是 sourceId 的一元属性。
- **渲染闸**：仅当某 image/video 节点 `t` 处于选中态时，才为 `t` 的 image 入边源节点渲染序号徽标；无任何目标选中时画布上无徽标。
- **切换重算**：选中目标从 `t1` 切换到 `t2` 时，同一源图的序号按 `t2` 的入边数组重新派生——选择器必须**以选中目标为输入参数**，不得缓存「节点 → 序号」映射（缓存会在切换目标后串味：把 t1 的序号错挂到 t2 语境）。多选（框选多个目标）时的呈现规则归 R-38；数据侧承诺每个选中目标独立派生，互不干扰。
- **选中态本身**是 UI 运行时状态（React Flow selection），不属文档数据——这与「序号不持久化」自洽：序号随选中态生灭，文档中无任何序号痕迹。

### 2b.3 展示数据流（选择器契约）

节点组件取得「我在选中目标入边数组里的下标」的推荐路径（P2-c 实现，本节为契约）：

```ts
// 契约示意，非实现。归属：src/store/ 派生选择器层（与 flowStore 同级）
/** 返回 Map<sourceNodeId, ordinal>；无选中目标时返回空 Map（不渲染）。 */
selectReferenceOrdinals(state, selectedTargetId: string | null): ReadonlyMap<string, number>
```

- 派生路径：`selectedTargetId → 该目标 image 入边（按 edges 数组顺序过滤 target===selectedTargetId && targetHandle 缺省/"reference"）→ 按下标 +1 建 Map`。
- 复杂度 O（目标入边数）；调用方为各 image 源节点组件（订阅自身 id 在 Map 中的值）。
- **禁止**：把 ordinal 作为 prop 存入节点 `data`、写入 `updateNodeDataInTab`、或经任何持久化通道流转。
- text 串联边（text→text / text→image|video 的 prompt 边）**不编号**——R-39 裁定只覆盖参考图序号；text 顺序的可见性维持现状（悬浮窗口列表），不在徽标范围。

### 2b.4 与 `maskSourceRef` 的交互（重排/断线后不失配）

- `maskSourceRef` 存的是**引用值**（图片 ref 字符串），**不是序号**——补位重排不改变任何引用值，因此 maskSourceRef 不因重排漂移。
- 真正失配只有：蒙版源边本身被删除/替换（引用值消失或第一条入边换人）。此时运行前检查 `maskSourceRef === 第一条图片入边的当前引用`（runtime.md §1 第 5 步）fail-closed 拒绝，文案已有。
- 自洽情形：蒙版源图前序边被删 → 蒙版源图补位成新第一条 → maskSourceRef 仍匹配，语义反而自然成立，无需用户动作。
- 用户可见兜底：序号因删除变化后，目标节点悬浮窗口沿用 v3.1 的 `inspector.orderChanged` 一次性提示（「顺序已变更，角色对应关系以新顺序为准」），提示角色声明（提示词正文中的位置引用）按新序号解读。

### 2b.5 边界与显式不做

- 不提供「手动改序号」入口（R-39 取代 B1/B2 的核心：用户要自动，不要手动调）。若未来出现手动调序需求，走新裁定，不在本契约预留字段。
- 序号不进提示词组装协议——Provider 侧「参考图：」列表的排列仍按边数组顺序（runtime.md §1 第 4/6 步不变），徽标序号只是该顺序的人类可读投影。
- video 节点图片入边 ≤1（首帧，Q2=A），序号恒为 1；机制同构，无特例代码。

## 3. 三处实现点

| 层 | 文件 | 强制点 |
|---|---|---|
| 画布 | `src/components/CanvasFlow.tsx`（`isValidConnection`）+ 节点创建路径 | 连线合法性；新建 image/video 节点时若无 text 节点可连，自动生成空 text 节点并预连 text 边 |
| schema | `server/lib/workflowSchema.ts`（`validateAndMigrateFlow` 图级规则段） | INV-1 全图检查；text 边/边的 handle 类型检查 |
| 运行前置 | `server/engine/dag.ts`（`assertPlanInputs`） | INV-2 对每个 image/video step 检查 |

## 4. 测试契约（P2 必须落地）

- `tests/workflow-schema.test.ts`：INV-1 正例/反例（无 text 边、text 边来自错误 kind、handle 错误）；text→text 串联边的合法性（允许）与 image→text 边的拒绝。
- `tests/dag.test.ts`：INV-2 正例/反例（text 空、text 全空白、多 text 上游拼接顺序）；text 运行路径的输入组装（上游读取按 runtime.md §0 规则：一律 `data.text`，含「上游有未采纳 outputText 时仍取 text」反例）。
- `tests/canvas-connection`（或并入现有 e2e）：非法连线 UI 反馈 + 自动补 text 节点行为；text→text 连线的画布允许。
- 一条跨层一致性测试：同一组非法 flow JSON，schema 拒绝文案与画布 tooltip 文案共享同一 i18n 键。
- 【v3.2 / R-39 新增】序号派生与重排：
  - `selectReferenceOrdinals` 纯函数测试：连入 3 条 image 边 → 序号 1/2/3；删除第 1 条 → 补位为 1/2；`selectedTargetId = null` → 空 Map；text 边不参与编号；同一源图连两个目标时，按各自目标的入边数组独立派生。
  - **切换选中目标重算**：源图 S 在 t1 中序号为 2、在 t2 中序号为 1，选择器输入从 t1 切到 t2 后返回值随之变化——断言不存在跨目标的序号缓存（契约见 §2b.2）。
  - **不持久化断言**：`DocumentSnapshot` / flow_json 序列化结果中不存在 ordinal 字段（夹具快照比对，防回归）。
  - e2e（P2-c）：拉线后源节点出现徽标且数字 = 入边下标 +1；删除中间边后徽标即时刷新为补位后序号；取消选中后徽标消失；选中另一目标后徽标按新目标重排。几何与样式断言以 R-38 视觉规范为准。
- Q3=A 后无需新增 fabric handle 测试；原 `targetHandle="fabric"` 特例测试（`FabricRecolorNode.tsx` 中 `selectActiveEdges(...).some(e => e.targetHandle === "fabric")`）随旧节点退役一并删除。

## 5. 新增 UI 文案与 i18n 键清单（本期语言范围：仅中文）

本方案新增的**全部用户可见文案**必须走 i18n 键（禁止硬编码中文字面量），键清单如下（P2-c/P2-d 实现时按此登记；本期语言范围**仅中文**，多语言扩展随产品国际化另行排期）：

| 键（命名空间.名称） | 中文文案 | 出现位置 |
|---|---|---|
| `nodes.text.title` / `nodes.image.title` / `nodes.video.title` | 文本 / 图片 / 视频 | 三节点默认 label |
| `inspector.function` / `inspector.parameters` / `inspector.model` | 功能 / 参数 / 模型 | 悬浮窗口三项配置分区（R4） |
| `inspector.unverifiedParams` / `inspector.evaluatedParams` | 自定义参数（未评估）/ 已评估参数 | R5 评估绑定标记（runtime.md §5c） |
| `inspector.orderChanged` | 顺序已变更，角色对应关系以新顺序为准 | 边删除导致序号补位后的一次性提示（runtime.md §5b） |
| `refOrdinal.badge` | 参考图 {n} | 参考图序号徽标的可访问名称（aria-label，R-39；可见数字本身即文本等价物） |
| `inv1.missingTextUpstream` | 「{节点label}」需要至少一个上游文本节点提供提示词 | INV-1 拒绝（schema 422 + 画布 tooltip 共享此键） |
| `inv2.emptyTextUpstream` | 「{节点label}」的上游文本节点还没有填写提示词 | INV-2 运行拒绝 + 节点错误徽标 |
| `variant.revoked` | 所选功能已被撤销，请重新选择 | 变体撤销后的运行拒绝（runtime.md §5d） |
| `textRun.truncated` | 输出超长已截断 | text 运行 outputText 截断标记（runtime.md §1b） |
| `textRun.timeout` | 文本模型响应超时 | text 同步链路超时错误（runtime.md §1b） |
| `textRun.noVariant` | 先在悬浮窗口选择功能 | 未选变体的 text 节点运行按钮提示 |
| `textRun.unadoptedProposal` | 有未采纳的提案 | 下游读取规则提示（runtime.md §0） |

**可访问性要求**（项目 UI 质量线，AGENTS.md §2 既有要求的落地枚举）：

- 悬浮窗口（Node Inspector Popover）与三个节点组件：键盘可达（Tab 顺序覆盖全部交互控件）、可见焦点环、Esc 关闭悬浮窗口并归还焦点到触发节点、焦点不逃逸（窗口打开时焦点陷在窗口内，关闭后还原）。
- 悬浮窗口的参考图列表（只读展示当前生效顺序）：列表项有文本序号与缩略图 alt；R-39 后不提供手动排序控件，删除补位的提示由 `inspector.orderChanged` 承载（`aria-live="polite"` 播报）。
- 节点错误徽标、R5 参数标记、撤销提示：均有文本等价物（不只颜色/图标），`role="status"` 或等价 aria 标注。
- 参考图序号徽标（R-39）：可见数字即文本等价物（非纯图标），挂 `aria-label`（键 `refOrdinal.badge`，「参考图 {n}」）；徽标随选中态生灭属装饰性变化，不需 `aria-live` 播报（选中切换本身已有焦点变化提示）；删除补位导致的序号变化由 `inspector.orderChanged` 一次性提示承载播报职责。
- 文案键清单内的每条都需有对应的可访问名称（图标按钮不得裸图标）。
