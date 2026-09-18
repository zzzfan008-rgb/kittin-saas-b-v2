# 契约：图不变量（R3 强制上游 text 节点）

- 来源：plan.md §1.3；需求挂靠 R3、§3.5
- 本文是三处实现（画布 / schema / 运行前置）的**统一语义来源**；任何一处改动必须同步另两处并由同一条测试断言覆盖。
- v2：Q1=B 新增 text→text 串联边；Q3 双分支写全（§2 末），默认分支 A。

## 1. 不变量

```
G = (V, E)，V 中每个节点有 kind ∈ {text, image, video}

INV-1（结构）：
  ∀ n ∈ V, n.kind ∈ {image, video}
    ⇒ |{ e ∈ E : e.target = n ∧ e 为 text 边 }| ≥ 1

INV-2（内容）：
  对 INV-1 中至少一条 text 边的源节点 t：t.data.text.trim() ≠ ""
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

### Q3 双分支（待 designer 对比图后用户裁定，默认分支 A）

- **分支 A（默认）：抹平 fabric handle。** 上表即全部边类型；面料参考图是普通 image 边，顺序语义。画布零新增 handle；本文件无新增规则。
- **分支 B：保留面料专用 handle。** 上表追加一行：fabric 边（image → image，`targetHandle="fabric"`），仅当目标节点选中变体声明 `needsFabricRef: true` 时可用；schema 层追加规则「声明 needsFabricRef 的变体对应节点必须有 ≥1 条 fabric 边」。画布 ImageNode 渲染第三个入边锚点。运行时无差异（参考图仍是顺序数组，fabric 边在数组中的位置由 schema 固定为末位）。

两分支均不改动 INV-1/INV-2 本文。

## 3. 三处实现点

| 层 | 文件 | 强制点 |
|---|---|---|
| 画布 | `src/components/CanvasFlow.tsx`（`isValidConnection`）+ 节点创建路径 | 连线合法性；新建 image/video 节点时若无 text 节点可连，自动生成空 text 节点并预连 text 边 |
| schema | `server/lib/workflowSchema.ts`（`validateAndMigrateFlow` 图级规则段） | INV-1 全图检查；text 边/边的 handle 类型检查 |
| 运行前置 | `server/engine/dag.ts`（`assertPlanInputs`） | INV-2 对每个 image/video step 检查 |

## 4. 测试契约（P2 必须落地）

- `tests/workflow-schema.test.ts`：INV-1 正例/反例（无 text 边、text 边来自错误 kind、handle 错误）；text→text 串联边的合法性（允许）与 image→text 边的拒绝。
- `tests/dag.test.ts`：INV-2 正例/反例（text 空、text 全空白、多 text 上游拼接顺序）；text 运行路径的输入组装（上游 outputText ?? text 的取值顺序）。
- `tests/canvas-connection`（或并入现有 e2e）：非法连线 UI 反馈 + 自动补 text 节点行为；text→text 连线的画布允许。
- 一条跨层一致性测试：同一组非法 flow JSON，schema 拒绝文案与画布 tooltip 文案共享同一 i18n 键。
- Q3 裁定后补：分支 B 被选中时，fabric 边的 schema 规则与画布锚点测试（分支 A 则无需新增）。
