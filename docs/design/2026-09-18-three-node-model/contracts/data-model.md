# 契约：数据模型（三基础节点）

- 来源：plan.md §1；需求挂靠 R1/R2/R3/R4/R5/R8
- 性质：字段级契约。P2 实现以本文为准；改动需回归本方案评审。
- v2：Q1=B（text 可运行文本模型）、Q2=A（视频落地形态）、Q4=A（mask 保留、循环取消）、Q5=A（清理范围）已落地。
- v3：Q3=A（fabric handle 抹平）——边类型仅 `prompt`/`reference` 两种，见 contracts/graph-invariants.md §2。

## 1. NodeKind

```ts
export type NodeKind = "text" | "image" | "video";
```

旧 9 值（`image-input`/`sketch-to-render`/`ai-modify`/`fabric-recolor`/`upscale`/`print-extract`/`print-mutate`/`mask-redraw`/`result`）在类型层删除，不留别名、不留运行时映射。

## 2. 持久化版本

```ts
export const WORKFLOW_SCHEMA_VERSION = 7 as const;
```

- `validateAndMigrateFlow` 对 `schemaVersion ≤ 6`（含无版本）一律 `WorkflowValidationError`，不再迁移。
- 拒绝文案固定为：`"该项目为旧版本格式（v{n}），已在三节点重构中清理，请新建项目"`。

## 3. 节点数据

```ts
export interface BaseNodeData {
  label: string;
  status: NodeRunStatus;   // 状态机不变
  error?: string;
  [key: string]: unknown;
}

export interface TextNodeData extends BaseNodeData {
  kind: "text";
  /** 提示词正文。长度上限沿用 MAX_TEXT_LENGTH = 20_000。
   *  用户手写内容的所有权字段：运行路径（Q1=B）永不写本字段。 */
  text: string;
  /** Q1=B：可运行文本模型。三项窗口配置与 image/video 同构（R4）。 */
  promptVariantId?: string;              // 文本功能变体（如"提示词润色"），走同一 promptRunAdmission
  modelId?: TextModelId;                 // 见 §5
  modelOptions?: TextModelOptions;       // 自由 key-value（R5），契约提供 recommendedOptions
  /** 最近一次文本运行的输出（展示态；「采纳」是显式 UI 动作，把 outputText 复制进 text） */
  outputText?: string;
  /** 最近一次运行的输入快照（上游串联 + 当时正文），用于可追溯展示 */
  lastRunInput?: string;
}

export interface ImageNodeData extends BaseNodeData {
  kind: "image";
  promptVariantId?: string;
  promptFamilyId?: string;
  parameterProfileId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  postprocessVersion?: string;
  modelId?: GenerationImageModelId;
  /** R5：自由 key-value；契约提供 recommendedOptions 元数据，UI 负责默认填充。 */
  modelOptions?: ImageModelOptions;
  aspectRatio: string;            // "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
  batchSize: BatchSize;           // 1 | 2 | 4 | 8，沿用
  /** 蒙版能力：仅当 promptVariantId 对应变体声明 needsMask=true 时启用 */
  mask?: string;                  // PNG dataURL 或 /api/files/*.png（校验沿用现有 optionalMaskReference）
  maskSourceRef?: string;         // 必须等于第一条图片入边的当前引用，否则运行拒绝（沿用现有语义）
  featherRadius?: number;         // 0–64
  /** R8：输入与输出同体。上传图 = 用户直接写入 outputImages；生成结果 = 运行时写回。 */
  outputImages: string[];
}

export interface VideoNodeData extends BaseNodeData {
  kind: "video";
  promptVariantId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  modelId?: VideoModelId;
  modelOptions?: VideoModelOptions;  // 见 §5
  outputVideos: string[];            // /api/files/xxx，files 表 video/mp4
}
```

删除的字段族（相对 v6 `ModelSelectableNodeData`）：

| 字段 | 删除理由 |
|---|---|
| `operationMode` / `operationModeNeedsConfirmation` | 操作模式由提示词变体的 `mode` 字段携带；节点不再自描述 |
| `retiredModelId` / `modelSelectionNeedsConfirmation` | 历史模型兼容机制随 R7 清理失效；契约外模型由"模型 ID 必须在契约内"一道闸兜底 |
| `allowedOperationModesForNode` / `defaultOperationModeForNode` | 随 operationMode 一并删除 |

保留的运行时 fail-closed 检查（仅三条）：

1. `modelId ∈ IMAGE_MODEL_IDS`（且允许用于该 kind：`gpt-image-2.5-sunburst` 仅 mask 变体可用——该规则改由变体声明驱动，见 contracts/runtime.md）
2. 参考图数量 ≤ `min(8, contract.edit.maxReferences)`
3. R3 不变量（见 contracts/graph-invariants.md）

## 4. 参数 schema（R5）

```ts
export interface ImageModelOptions {
  [key: string]: string | number | boolean | undefined;
}
```

- `imageModelOptionsError*` 改为 `imageModelOptionsWarnings(modelId, value): string[]`：
  - 未知 key → warning「参数 {key} 不在模型 {id} 的已知参数中」
  - 值不在契约推荐集合 → warning「{key}={v} 不在推荐取值 {examples} 中」
  - **永不返回错误**；调用方不得据此拒绝保存/运行。
- `defaultImageModelOptions(modelId, aspectRatio)` 保留，数据源从硬编码 switch 改为读 `model-contracts.json` 的 `recommendedOptions` 块；缺省时返回 `{}`。
- `normalizeImageModelOptions*` / `imageModelOptionsForAspectRatio` / `imageModelAspectRatioPatch` 保留联动填充职责，删除其中的"丢弃非法值"语义，改为"保留用户值 + 追加 warning"。

`model-contracts.json` 新增字段（每模型，向后兼容的纯增量）：

```jsonc
{
  "recommendedOptions": {
    "<key>": { "default": <value>, "examples": [<value>, ...] }
  }
}
```

## 5. 视频参数（Q2=A 已裁定）

```ts
export type VideoModelId =
  | "doubao-seedance-2-0-260128"
  | "doubao-seedance-2-0-fast-260128"
  | "doubao-seedance-2-0-mini-260615"
  | "doubao-seedance-2-5-260628"
  | "veo-3.1-fast-generate-preview"
  | "veo-3.1-generate-preview";

export interface VideoModelOptions {
  seconds?: string;        // Veo 要求字符串 "4"|"6"|"8"；Seedance 4–15/30 或 "-1"
  resolution?: string;     // "480p"|"720p"|"1080p"|"4k"（联动约束由 UI 负责）
  aspectRatio?: string;
  seed?: number;
  [key: string]: string | number | boolean | undefined;
}
```

视频模型契约产物：新增 `docs/ai/apiyi/video-model-contracts.json`（与 image 的 model-contracts.json 同级、同评审流程），**不在本阶段生成**——P2-e 按 §5 知识库门禁走 `docs:apiyi:lookup` 后产出。

## 5b. 文本参数（Q1=B 已裁定）

```ts
export type TextModelId =
  | "gpt-5.3"                  // 主力（推荐，见 model-proposals.md §4）
  | "gemini-3.6-flash"         // 轻量档（推荐）
  | "deepseek-v4-flash";       // 备选
// 最终清单以 R10 用户确认（plan.md §5.3）为准；类型与契约一致性断言沿用 imageModels.ts 顶部 throw 同款防线。

export interface TextModelOptions {
  temperature?: number;
  maxTokens?: number;
  [key: string]: string | number | boolean | undefined;   // R5 自由 key-value
}
```

文本模型契约产物：清单进 `docs/ai/apiyi/model-contracts.json` 新增 `textModels` 区块（与 `recommendedOptions` 同属纯增量），走与图片契约相同的评审流程与 `docs:apiyi:lookup` 回执。

## 6. WorkflowTemplate / PersistedWorkflow

- `PersistedWorkflow` 结构不变（nodes/edges/schemaVersion），`schemaVersion: 7`。
- `WorkflowTemplate.schemaVersion` 同步 7；`flow` 内只允许三种 type。
- `NodeSpec` 收敛为：

```ts
export const NODE_SPECS: Record<NodeKind, NodeSpec> = {
  text:  { kind: "text",  title: "文本",  inputs: { text: 8, image: 0 }, outputs: "text"  },
  image: { kind: "image", title: "图片",  inputs: { text: 8, image: 8 }, outputs: "images" },
  video: { kind: "video", title: "视频",  inputs: { text: 8, image: 1 }, outputs: "video" },
};
```

（`inputs` 由单一数字改为按边类型计数；边类型由 sourceHandle/targetHandle 区分，见 contracts/graph-invariants.md §2。text 节点的 text 入边用于多段正文串联，Q1=B 新增；text 节点没有 image 入边。）

## 7. files 表 video 扩展（Q2=A 已裁定）

- `files.mime_type` 放行 `video/mp4`（及 Seedance 的 `video/quicktime` mov）。
- **服务端拉 MP4 落地自有存储是强制步骤**（Veo 官转明确不返 CDN URL；Seedance 远端留存期不作依赖）；落地后画布引用 `/api/files/xxx`，不持有远端 URL。
- 校验：`validateImageDataUrl` 不适用于视频；视频一律走 multipart 上传或服务端落地（Provider MP4 拉取后写 files），不接受 dataURL 入库存储。
- 画布显示：首帧缩略图 + 点击播放（缩略图由服务端落地时抽帧生成或前端 `<video>` 首帧渲染，P2-e 定其一）。
- 存储：本期仍落 `data/` 文件存储（与图片一致）；对象存储二期。
- `width/height/byte_length` 语义沿用；新增可选元数据（时长/码率）存 `files` 扩展列或 `source_type='generation'` 的既有 JSON 旁路——P2-e 定。
