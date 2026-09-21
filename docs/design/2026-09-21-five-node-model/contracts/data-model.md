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
| T4 | `result-video → video-generator` 边 | **本版禁止** | runner 只实现首帧（0–1 张 image 边），放开等于允许用户连出运行时被静默忽略的边 |

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
4. **逐张操作不丢失**。B 的独有能力是「单产物独立寻址」；A 用 `selectedIndex`（持久化意图）
   + 网格单元点击（UI 状态）覆盖：`[作为输入]` 边记录 `imageIndex`，语义与 B 等价。

**A 必须遵守的补充约束**（否则退化成 v7 的「结果不可追溯」）：

- **重跑不覆盖**：同一生成节点重跑，**新建**一个 result 节点，旧 result 节点原样保留。
  禁则：绝不改写既有 result 节点的 `images`。这是 AGENTS.md §3「结果不得削弱」的落地约束。
- **删除生成节点不删 result 节点，也不删 files 记录**（R2，frontend 已确认守住）。
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
| C7 | 结果节点溯源指向存在的生成节点 | `sourceGeneratorId` 必须命中同文档 nodes 中的 `*-generator` |

C1–C7 在 `server/lib/workflowSchema.ts`（服务端拒绝非法持久化）与 `src/lib/documentSnapshot.ts`
（前端拒绝非法入文档）两侧同时生效。

## 8. 影响面（共享契约变更）

本文件定义的类型被以下模块引用，改动需同步：

- 类型：`src/types/workflow.ts`
- 服务端：`server/lib/workflowSchema.ts`、`server/engine/dag.ts`、`server/engine/runner.ts`
- 前端：`src/lib/documentSnapshot.ts`、`src/store/flowStore.ts`、`src/components/nodes/**`
- 模板：`server/routes/templates.ts`（见 template-format.md）
