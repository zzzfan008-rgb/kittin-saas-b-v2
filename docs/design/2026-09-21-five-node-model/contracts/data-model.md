# 数据模型契约 — v8 三层七节点

- 版本：v8（`WORKFLOW_SCHEMA_VERSION = 8`）
- 状态：**已定稿**（architect 2026-09-21）
- 前置：`docs/design/2026-09-18-three-node-model/contracts/data-model.md`（v7，本文件取代之）
- 方案来源：`docs/design/2026-09-21-five-node-model/plan.md`
- 项目硬规则：`AGENTS.md`（本文件不复制其条文，只引用）

## 0. architect 裁定（T1–T4）

| # | 问题 | 裁定 | 理由 |
|---|------|------|------|
| T1 | `[功能选项]` 归属 | **在生成节点内** | 与 D6 一致；创建时一次性选定会让「改功能」变成删节点重建，违反 D10「生成节点独立持久」 |
| T2 | 视频时长/运动参数来源 | **时长由契约动态给；"运动参数" 本版不落地** | `docs/ai/apiyi/video-model-contracts.json` 的 `recommendedOptions` 只有 `resolution/aspectRatio/seconds/seed`，**没有运动参数键**。契约无从给，前端不得硬编码枚举。运动参数等契约扩充后再加 |
| T3 | N 张产物 = 1 个结果节点还是 N 个 | **A：1 个结果节点（内部网格）** | 见 §5.1 论证（推翻我上一轮的 B 倾向） |
| T4 | `video` / `result-video` → `video-generator` 的 `reference` 边 | **本版禁止（两类源均禁）** | runner 只实现首帧（0–1 条 image 边），放开等于允许用户连出运行时被静默忽略的边。范围澄清：`runtime.md §2.1` 与 `NODE_SPECS["video-generator"].inputs.reference = 0` 均按「两类源双双禁止」实现；本行原仅点名 `result-video`，现扩为两类源，与实现对齐 |

## 0.2 补充裁定（R-89 复核裁决，2026-09-21）

| # | 问题 | 裁定 | 理由 |
|---|------|------|------|
| P2-3 | 多个 text 节点可否汇聚到同一生成节点 | **否，`inputs.prompt` 上限 = 1** | 一次生成的提示词来源唯一。与 plan「单一 text 只能连 1 个生成节点」构成双向 1:1，INV-1 闭环。若允许多条，拼接/定序/去重规则契约未定义，等于让 DAG 层发明语义。**附带修正**：`NODE_SPECS` 中 `prompt` 上限不得复用 `MAX_REFERENCE_IMAGES`（图片上限，量纲错配），应新增独立常量 `MAX_PROMPT_INPUTS = 1` |
| P2-4 | `first-frame` 边是否参与参考图序号（order） | **否** | 首帧/首尾帧在 video 契约里是独立角色（`role: first_frame`），不是参考图序列的一员。order 语义（AGENTS.md §4「ordered reference-image semantics, order only」）只管参考图之间的相对顺序。**落地**：`isReferenceEdge` 不得用「非 prompt 即 reference」反向判定，须显式只认 `EDGE_HANDLE_REFERENCE`，否则 first-frame 与 null 句柄会被错算成 reference |


### 0.1 边规则唯一事实来源

**合法边 / 禁止边以 `runtime.md §2.1` 为准。** `plan.md §2.1` 的边表已作废其中两行，
仅作历史草案：

| plan.md §2.1 作废行 | 取代者 |
|---|---|
| `video` → `video-generator` / `reference`（原标「可选，可多条」） | T4：本版禁止 |
| `result-video` → `video-generator` / `reference`（原标「可选」） | T4：本版禁止 |
| `*-generator` → `result-*` / `result` 句柄（原标「系统自动创建」） | 本文件 §5：生成→结果关系建模为**结果节点字段**（`sourceGeneratorId` + `runId`），**不落边**；类型层不定义 `result` 句柄 |


## 1. 节点分层

```
输入层  text / image / video                      用户供给：提示词、图、视频
生成层  image-generator / video-generator         执行单元：参数 + 触发
结果层  result-image / result-video               产物载体：URL + 溯源
```

## 2. NodeKind

```ts
export const WORKFLOW_SCHEMA_VERSION = 8 as const;

export type NodeKind =
  | "text" | "image" | "video"
  | "image-generator" | "video-generator"
  | "result-image" | "result-video";
```

## 3. 输入层

输入节点**不承载任何生成语义**：无 `promptVariantId`、无 `modelId`、无 `modelOptions`、无 `batchSize`。

```ts
export interface TextNodeData extends BaseNodeData {
  kind: "text";
  /** 提示词正文，上限 MAX_TEXT_LENGTH = 20_000（沿用 v7）。 */
  text: string;
}
```

```ts
export interface ImageNodeData extends BaseNodeData {
  kind: "image";
  /** 用户上传的图片引用（/api/files/xxx）。输入节点不写生成结果。 */
  outputImages: string[];
}
```

```ts
export interface VideoNodeData extends BaseNodeData {
  kind: "video";
  /** 用户上传的视频引用（/api/files/xxx，files 表 video/mp4）。 */
  outputVideos: string[];
}
```

字段名 `outputImages` / `outputVideos` **沿用 v7**，不改成 frontend 草案里的 `mediaUrl(s)`。理由：
改名会迫使迁移层做「字段重命名映射」，而沿用原名让 v7→v8 迁移只做结构拆分、不做字段改名，少一处出错点。

## 4. 生成层

生成节点**不承载任何媒体展示**：产物在结果节点。

```ts
export interface ImageGeneratorNodeData extends BaseNodeData {
  kind: "image-generator";
  /** 功能绑定；必填。决定业务方向与提示词变体。 */
  promptVariantId: string;
  promptFamilyId?: string;
  parameterProfileId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  postprocessVersion?: string;
  modelId: GenerationImageModelId;
  modelOptions?: ImageModelOptions;
  aspectRatio: string;
  batchSize: BatchSize;
  mask?: string;
  maskSourceRef?: string;
  featherRadius?: number;
}
```

```ts
export interface VideoGeneratorNodeData extends BaseNodeData {
  kind: "video-generator";
  promptVariantId: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  modelId: VideoModelId;
  modelOptions?: VideoModelOptions;
  /** Seedance 2.5 首帧/首尾帧任务必须 "adaptive"（见 videoModels.ts 与契约 JSON）。 */
  aspectRatio: string;
}
```

与 v7 的差异：
- `promptVariantId` / `modelId` 由**可选变必填**（生成节点必须绑定功能与模型）
- **移除** `outputImages` / `outputVideos`（产物归结果节点）
- video 生成节点**不设**独立 `duration` 字段，时长走 `modelOptions.seconds`
  （T2 裁定：与契约 `recommendedOptions.seconds` 同源，避免双份真值）

## 5. 结果层

```ts
export interface ResultImageNodeData extends BaseNodeData {
  kind: "result-image";
  /** 该次运行的全部产物；一次运行 = 一个 result 节点（T3 裁定 A）。 */
  images: string[];
  thumbnail?: string;
  /** 溯源：产生它的生成节点。必填。 */
  sourceGeneratorId: string;
  /** 溯源：该次运行的账本键；AGENTS.md §4 授权/成本反查入口。必填。 */
  runId: string;
  /** 产物尺寸，与 images 同序。 */
  outputSizes?: Array<string | null>;
  /** 用户确认的复用单元下标（持久化意图，非 UI 状态）。 */
  selectedIndex?: number;
}
```

```ts
export interface ResultVideoNodeData extends BaseNodeData {
  kind: "result-video";
  /** 当前 Provider 一次任务产出一个 MP4，长度恒 0 或 1；保留数组形状与 image 同构。 */
  videos: string[];
  sourceGeneratorId: string;
  runId: string;
  selectedIndex?: number;
}
```

### 5.1 T3 裁定论证（A vs B）

裁定 **A（一次运行 = 一个结果节点，内部网格）**，推翻我上一轮的 B 倾向。理由：

1. **重跑爆炸才是主要矛盾**。batchSize 最大 8。B 方案下每次重跑新增 8 个节点，三次运行 = 24 个节点；
   A 方案下三次运行 = 3 个节点。frontend 担心的「画布爆炸」，真正来源是重跑累积，不是单次批量。
2. **一次运行天然成组**。`runId` 是账本键（AGENTS.md §4），一节点对一 run 是最自然映射；
   B 下 N 个节点共享一个 runId，信息冗余，且易出现「同 run 节点被删剩一个」的悬空状态。
3. **布局有界**。A 的位置算法只依赖一次运行，不随历史增长（见 runtime.md §4）。
4. **逐张操作：本期只保留「部分能力」（R-100 改写，原文不成立）**。B 的独有能力是
   「单产物独立寻址」。A **当前不具备**该能力，原文「`[作为输入]` 边记录 `imageIndex`，
   语义与 B 等价」是未落地的论证：边数据**没有** `imageIndex` 字段（全仓同名概念只存在于
   `server/lib/evaluationEvidence*.ts` 的评估证据域，与边无关——已 grep 复核）；
   `selectedIndex` 只在文档投影与会话缓存恢复里被透传，**没有 UI 写入方**
   （`src/store/flowStore.ts:1980` 位于 `normalizeSessionNode`）。A 的实际复用语义是
   **整节点输出**：一条 reference 边把该结果节点的**全部** `images` 按数组顺序传入
   （`extractOutputImages(result-image) → data.images`，`server/engine/dag.ts:255-260`；
   入边展开 `dag.ts:227-236`）。`selectedIndex` 保留为「用户确认的复用单元」意图字段，
   本版无写入方，不得据此声称逐张寻址已实现。

**已知限制（R-100 裁定：明示，不隐藏，也不作为本批合并的阻断项）**

整节点语义在「结果张数 > 参考图上限」时无补救入口（系统不静默裁剪）：

| 模式 | 上限 | 8 张结果可否整节点复用 |
|---|---|---|
| 非蒙版 | `min(MAX_REFERENCE_IMAGES=8, modelMaxReferenceImages)`；契约内 9 个图片模型 `edit.maxReferences` 全为 8 → **8** | 可（8 ≤ 8，与 `BATCH_SIZES` 最大值恰好相等） |
| 蒙版（`needsMask` 变体 / `operationMode === "mask-edit"`） | `MAX_MASK_USER_REFERENCE_IMAGES = MAX_REFERENCE_IMAGES - 1 = 7`（`src/types/workflow.ts:82-84`） | **不可**：8 > 7，被 `evaluatePromptRunAdmission` 以 `reference-limit-exceeded` 拒绝 |

- 拒绝点：`src/lib/promptRunAdmission.ts:441-453`（前端准入）；服务端同一把尺
  `server/engine/dag.ts:121-129`、`server/engine/runner.ts:295-303`。
- 用户补救：改小批次重跑，或把目标那张另存为素材后经 `image` 节点引入（多一步，但能力不丢）。
- 「按产物逐张寻址」（边携带 `imageIndex` + 前端选择入口 + dag/runner 按 index 取图）
  是**未排期的后续需求**，不是本期能力；它属新能力而非缺陷修复（涉及边契约、UI 与运行时
  三方改动），需另行拍板后立项。

**A 必须遵守的补充约束**（否则退化成 v7 的「结果不可追溯」）：

- **重跑不覆盖**：同一生成节点重跑，**新建**一个 result 节点，旧 result 节点原样保留。
  禁则：绝不改写既有 result 节点的 `images`。这是 AGENTS.md §3「结果不得削弱」的落地约束。
- **删除生成节点不删 result 节点，也不删 files 记录**（R2，frontend 已确认守住）。
  删除后该 result 节点的 `sourceGeneratorId` 进入**悬空态**：文档**仍可保存**（C7 两档语义见 §7），
  结果节点必须仍可查看、可 `[作为输入]`；溯源改由 `runId` → 账本解析。
  禁则：不得以「删除生成节点时联动删除 result 节点」实现 C7 一致——破 AGENTS.md §3。
- **网格单元选择是 UI 状态**，不进文档（AGENTS.md §3）；只有 `selectedIndex`（用户确认的复用意图）进文档。

## 6. 迁移状态字段

`BaseNodeData` 保持 v7 形状（`label` / `status` / `error?`）。v8 **不新增**迁移标记字段——
迁移是打开即做的一次性结构变换，不保留「这曾是 v7 节点」的运行时痕迹，避免长期双分支。

## 7. 可机检约束清单

| # | 约束 | 机检方式 |
|---|------|---------|
| C1 | `NodeKind` 恰为 7 值 | 类型层联合；构造第 8 值的负例应 tsc 失败 |
| C2 | 输入节点无生成字段 | `validateDataV8`：`text`/`image`/`video` 出现 `modelId`/`promptVariantId`/`modelOptions` 即 fail |
| C3 | 生成节点无产物字段 | `image-generator` 出现 `outputImages` 即 fail；`video-generator` 出现 `outputVideos` 即 fail |
| C4 | 生成节点必绑功能与模型 | `promptVariantId`/`modelId` 缺失即 fail |
| C5 | 结果节点必带溯源 | `sourceGeneratorId`/`runId` 缺失即 fail |
| C6 | video 生成节点首帧任务 `aspectRatio === "adaptive"` | 契约 JSON 校验 + schema 约束 |
| C7 | 结果节点溯源**良构且不伪指**（两档，见下） | (a) `sourceGeneratorId` 命中同文档节点但 kind 非 `*-generator` → **error / fail**；(b) 不命中任何节点 → **warning / 放行** |

C1–C7 在 `server/lib/workflowSchema.ts`（服务端拒绝非法持久化）与 `src/lib/documentSnapshot.ts`
（前端拒绝非法入文档）两侧同时生效。

**C7 两档语义（R-90 裁定，取代原「必须命中」的单一 fail）**

原表述（「必须命中同文档生成节点」）与 §5.1（删除生成节点不删 result 节点）在服务端
`validateV8Flow` 上正面冲突：用户删除生成节点后文档会被 fail-closed 拒存，即**文档不可保存**，
且 UI 无补救入口（`onNodesChange` 直接 `applyNodeChanges`，不联动删 result）。裁定拆两档：

| 情形 | 严重度 | 理由 |
|---|---|---|
| 命中同文档节点但 kind 非 `*-generator` | **error（两侧 fail-closed）** | 溯源指向错误类型 = 伪造/损坏 provenance，是 C7 真正要防的 |
| 不命中任何节点（生成节点已被用户删除） | **warning（不阻断保存/打开）** | 删除是合法操作（§5.1 / R2）；`runId` 才是账本键（AGENTS.md §4），`sourceGeneratorId` 仅是便利指针，其失效不损失可追溯性 |

**禁则**：不得以「删除生成节点时联动删除 result 节点」来维持 C7 一致——那会破 AGENTS.md §3
与 §5.1 的 R2 红线。**C7 不得全线降级为 warning**：情形 (a) 仍是硬闸。

## 8. 影响面（共享契约变更）

本文件定义的类型被以下模块引用，改动需同步：

- 类型：`src/types/workflow.ts`
- 服务端：`server/lib/workflowSchema.ts`、`server/engine/dag.ts`、`server/engine/runner.ts`
- 前端：`src/lib/documentSnapshot.ts`、`src/store/flowStore.ts`、`src/components/nodes/**`
- 模板：`server/routes/templates.ts`（见 template-format.md）
