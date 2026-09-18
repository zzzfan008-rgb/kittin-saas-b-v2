# 三基础节点模型重构 — 架构方案（P1：只出方案，不写产品代码）

- 状态：方案待评审；含 5 处【待确认 Q1–Q5】需 orchestrator/用户拍板
- 日期：2026-09-18
- 输入：`docs/requests/2026-09-18-three-node-model.md`（R1–R10 用户逐项裁定 + §3 八条既有约束）
- 作者：architect

> 本方案对每条需求/约束标注可追溯挂靠（R1–R10、§3.1–§3.8）。
> 所有【待确认】条目均不阻塞方案主体阅读，但**阻塞 P2 实现开工**。

---

## 0. 术语与边界

| 术语 | 含义 |
|---|---|
| 节点（Node） | 画布上的三种基础节点之一：`text` / `image` / `video` |
| 系统提示词（System Prompt / 功能提示词） | 提示词目录中经评估发布链发布的、可复用的功能单元；image/video 节点通过悬浮窗口**选用**它 |
| 提示词正文（Prompt Body） | text 节点承载的、画布上可见可连线的文本内容；运行时与系统提示词组装后发给 Provider |
| 悬浮窗口（Node Inspector Popover） | image/video 节点上的配置面板：功能选项（选系统提示词）+ 技术参数 + 模型选择（R4） |
| 提示词目录（Prompt Catalog） | 现有 `garmentPromptPresets.ts` + 评估发布链（`docs/ai/evaluation` + release registry）的总称；R6 保留 |

不在本方案范围（按需求文档 R9）：UI 主题、纸感编者风落地、任何产品代码。

---

## 1. 数据模型（交付 1：NodeKind / 提示词引用 / 参数 schema）

### 1.1 NodeKind 收敛【R1】

```ts
// src/types/workflow.ts（契约示意，非实现）
export type NodeKind = "text" | "image" | "video";
```

旧 9 种（`image-input` / `sketch-to-render` / `ai-modify` / `fabric-recolor` / `upscale` / `print-extract` / `print-mutate` / `mask-redraw` / `result`）**全部退役**。类型层直接删除，不做运行时兼容映射（R7 明确旧数据全清，无迁移路径）。

`NODE_SPECS` 收敛为三条：

| kind | inputs（图片/文本入边） | outputs | providerId |
|---|---|---|---|
| `text` | 0（只出不进） | `"text"` | 无（见 Q1） |
| `image` | 0..N 文本入边（≥1，见 R3）+ 0..8 图片入边 | `"images"` | `apiyi` |
| `video` | 0..N 文本入边（≥1）+ 0..1 图片入边（首帧，见 Q2） | `"video"` | `apiyi` |

### 1.2 节点数据形状

```ts
export interface TextNodeData extends BaseNodeData {
  kind: "text";
  /** 提示词正文；R2 规定由文本节点承载 */
  text: string;
}

export interface ImageNodeData extends BaseNodeData {
  kind: "image";
  /** 悬浮窗口三项配置（R4）： */
  promptVariantId?: string;          // 功能选项：选中的系统提示词（必须已发布，R6）
  modelId?: GenerationImageModelId;  // 模型选择
  modelOptions?: ImageModelOptions;  // 技术参数（R5：自由 key-value + 推荐值，见 §1.4）
  /** 业务画幅（仍属节点参数，非模型参数） */
  aspectRatio: string;
  batchSize: BatchSize;
  /** 蒙版能力（见 Q4）：仅当选中的系统提示词声明 needsMask 时存在 */
  mask?: string;
  maskSourceRef?: string;
  featherRadius?: number;
  /** R8：同一节点既承载输入也承载输出 */
  outputImages: string[];
}

export interface VideoNodeData extends BaseNodeData {
  kind: "video";
  promptVariantId?: string;
  modelId?: VideoModelId;            // 新增，见 §6
  modelOptions?: VideoModelOptions;  // seconds / resolution / aspectRatio 等
  /** 输出视频引用（/api/files/xxx，files 表扩 video mime，见 Q2） */
  outputVideos: string[];
}
```

要点：

- `ModelSelectableNodeData` 大瘦身：`operationMode` / `operationModeNeedsConfirmation` / `retiredModelId` / `modelSelectionNeedsConfirmation` 整族字段删除。理由：旧字段存在是因为 9 种节点各自语义不同、历史模型退役要兼容；收敛后**操作模式由系统提示词携带**（变体的 `mode` 字段），节点不再自描述模式。`retiredModelId` 的"重选提示"职责由新的契约比对承担（见 §5.1）。
- `promptVariantId` / `contractHash` / `evaluationVersion` 等评估绑定字段**保留**——R6 明确保留评估发布链，运行时绑定语义不变。
- `result` 节点相关类型（`ResultNodeData`、`selectResultImages` 等）整体删除；其能力归位见 §3.3。

### 1.3 提示词引用方式【R2 + R3】

节点**不复制**系统提示词正文，只存 `promptVariantId` 引用；正文唯一来源是提示词目录（`garmentPromptPresets.ts` 的 `GARMENT_PROMPT_VARIANTS`）。这保证：

- 目录回滚/修订时，存量项目里选用了该变体的节点自动跟随（引用语义）；
- release registry 的版本向量（`promptEvaluationReleaseVector`）继续是审计锚点。

**提示词正文流向**：`text` 节点（画布可见、可连线）→ 边 → `image`/`video` 节点。运行时组装见 §2.1。

**R3 强制的三处落地**（§3.5 要求的统一语义）：

| 层 | 位置 | 行为 | 用户可见反馈 |
|---|---|---|---|
| 画布层 | `CanvasFlow` 的 `isValidConnection` | `image`/`video` 节点的文本入边 handle 只接受来自 `text` 节点的出边；新建 image/video 节点时若无可用 text 节点，自动在左侧生成一个空 text 节点并预连线 | 连线非法时 handle 红显 + tooltip「图片/视频节点需要上游文本节点提供提示词」 |
| schema 校验 | `server/lib/workflowSchema.ts` | `validateAndMigrateFlow` 新增图级规则：每个 `image`/`video` 节点必须存在 ≥1 条 `text → 该节点` 的入边，否则 422 | 保存/加载被拒，错误文案指明节点 label |
| 运行前置检查 | `server/engine/dag.ts` `assertPlanInputs` | 对每个 `image`/`video` step，断言其上游引用中存在 ≥1 个 `text` 节点且其 `text` 非空（trim 后） | 运行被拒，画布节点上显示错误徽标 |

三处共享同一条不变量：**`∀ n ∈ {image, video}: ∃ ≥1 edge(text → n) ∧ upstream.text.trim() ≠ ""`**。该不变量写入 `docs/design/2026-09-18-three-node-model/contracts/graph-invariants.md`（见 §8 交付清单），由测试断言三处实现一致。

**多图参考的表达**（§3.4）：原 `image-input` 的"参考图列表"退化为**边**——`image` 节点接受 0..8 条图片入边（来自其他 `image` 节点的输出），顺序 = 边数组顺序（现有 `inputReferences` 顺序语义已验证）。角色/顺序语义已在前一重构移除，本方案不恢复。`fabric-recolor` 的 `targetHandle="fabric"` 特例**抹平**：面料参考图改为一条普通图片入边，由系统提示词负责在正文里说明"参考图 N 是面料"。这是有意的语义简化——代价是用户要记住顺序，收益是连线模型完全统一。【若用户认为 fabric/garment 的 handle 区分有保留价值，这是 Q3 的备选，但推荐抹平】

### 1.4 参数 schema（R5：取消硬校验，保留推荐值）

现状：`ImageModelOptions` 是封闭联合（每模型固定 key 集合），`imageModelOptionsError()` 在 4 个运行时位置（`workflowSchema` / `dag` / `generate` / `apiyi.ts`）+ InspectorPanel 做硬失败校验。

新模型：**契约提供推荐，节点接受自由**。

```ts
// model-contracts.json 每模型新增（不删旧字段，向后兼容）
{
  "id": "gpt-image-2.5-flare-vip",
  ...
  "recommendedOptions": {           // 新增：推荐值元数据，非校验清单
    "size": { "default": "2048x2048", "examples": ["1536x2048", "2048x1536"] },
    "quality": { "default": "high" }
  }
}
```

```ts
// src/types/imageModels.ts
export interface ImageModelOptions {
  [key: string]: string | number | boolean | undefined;  // 放开为自由 key-value
}
```

- **UI**：InspectorPanel 按 `recommendedOptions` 渲染默认值与候选；用户可改可删可增（文本框兜底）。`imageModelAspectRatioPatch` 等联动逻辑保留，但从"校验后归一化"改为"推荐值填充"。
- **运行时**：`imageModelOptionsError*` 系列从硬失败改为**仅返回 warning 字符串数组**；`workflowSchema` / `dag` 不再因 modelOptions 拒绝，`assertPlanInputs` 改为把 warning 附加到运行事件（前端可见但不阻断）。**fail-closed 的只剩三条**：模型 ID 必须是契约内 ID、模型允许用于该节点类型、参考图数量不超限。理由：模型参数错的最坏后果是 Provider 报错（一次失败调用，费用可控），而模型 ID 错会导致契约外计费——两者风险等级不同，门禁强度应当不同。
- **契约产物**：`model-contracts.json` 增加 `recommendedOptions` 块（新增字段，不删除现有 `sizes`/`aspectRatios` 等清单——它们降级为"已知取值参考"，保留给 UI 渲染候选用）。

**CI 门禁口径同步**（§3.1，重点）：

| 现状 | 改为 | 影响面 |
|---|---|---|
| `imageModelOptionsError*` 硬校验存在于 4 个运行时文件 + 2 个测试（`provider-contract.test.ts`、`workflow-schema.test.ts` 部分用例） | 硬校验删除，改 warning；测试改为断言 warning 语义而非拒绝语义 | `server/lib/workflowSchema.ts`、`server/engine/dag.ts`、`server/routes/generate.ts`、`server/providers/apiyi.ts`、`src/components/panels/InspectorPanel.tsx`、`src/lib/documentSnapshot.ts`；测试：`tests/provider-contract.test.ts`、`tests/workflow-schema.test.ts`、`tests/model-parameter-profiles.test.ts`（profile 的 native 字段仍作为推荐来源保留，测试改断言语义） |
| `docs:apiyi:guard` 在 diff 命中 `change-scope.json` 时要求契约评审回执 | **不变**。model-contracts.json 仍是评审契约，本次新增 `recommendedOptions` 块属契约变更，需按 §5 知识库门禁走 `docs:apiyi:lookup` 回执 | 本方案 P2 实施时按既有流程执行 |
| CI 5 个必需检查 | **不变**。本次改动不新增/删除 CI job；`unit` job 内相关测试按上表改断言 | `.github/workflows/ci.yml` 无需改动 |

关键判断：R5 放开的是**模型参数的取值硬校验**，不是放开**模型清单契约**。`IMAGE_MODEL_IDS` 与 `model-contracts.json` 的一致性断言（`imageModels.ts` 顶部 throw）**保留不动**——那道防线守的是"契约外模型不得进入运行时"，与 R5 无关。

---

## 2. 运行时（交付 2：渲染器组装 / DAG / 队列影响）

### 2.1 渲染器组装

现状：`providerPromptRenderer.ts` 按 `(nodeKind, modelId, operationMode, taskPrompt, references)` 组装，taskPrompt 由 runner 内按节点类型硬编码（如 upscale 的固定文案）。

新流程（`executeStep` 内，`image`/`video` 统一）：

```
1. 从上游 text 节点取提示词正文 userPrompt（R2/R3）
2. 从 promptVariantId 取系统提示词变体 variant（R6：必须已发布，复用现有
   promptRunAdmission 准入，不变）
3. taskPrompt = variant.fullPrompt + "\n\n" + userPrompt
   （职责切分：系统提示词 = 功能/质量约束；text 正文 = 用户意图）
4. references = 上游 image 节点的 outputImages（顺序语义，§1.3）
5. mask 系提示词（若 variant.needsMask）走现有 maskPromptTemplate 包装，不变
6. 交给 renderProviderPrompt 追加「参考图:」列表（现有契约不变）
```

`providerPromptRenderer` 的版本/hash 契约（`PROVIDER_PROMPT_RENDERER_HASH`）**继续有效**，但其 `nodeKind` 入参的取值集合变化（9 → 3），release vector 中 `nodeKind` 字段相应变化——这意味着**全部已发布变体需要按新 nodeKind 重新登记**，归入 P2 的提示词目录重写（§4.3）。

`upscale` / `print-extract` / `print-mutate` / `fabric-recolor` 目前硬编码在 runner 里的固定文案，**迁移为提示词目录中的系统提示词变体**——这正是 R1「功能从结构退化为内容」的核心。runner 内不再有任何节点类型特化的文案分支；仅剩的 kind 分支是：蒙版合成（mask）、多色循环（若保留，见 Q4）、打印裂变批量（由参数驱动而非 kind 驱动）。

### 2.2 DAG / 队列 / 执行器影响

| 组件 | 影响 | 说明 |
|---|---|---|
| `buildExecutionPlan`（拓扑排序/环检测/局部重跑） | **无结构性影响** | 算法与节点类型无关；`extractOutputImages` 与 `extractParams` 两个 switch 重写为 3 分支 |
| `assertPlanInputs` | 重写 | 删除所有 kind 特化（fabric-recolor 的 garment 检查、mask-redraw 的 mask 检查改为由变体声明驱动：变体声明 `needsMask` 才检查 mask 字段）；新增 R3 的 text 上游检查 |
| `assertPromptRunAdmissions` | **语义不变** | 评估发布准入继续按 `promptVariantId` 工作，与节点类型解耦后反而更直接 |
| `executeStep` | 重写为统一路径 | 9 个 kind 分支收敛为：text（直通，不产生 Provider 调用）、image（统一生成路径 + 可选 mask 后处理）、video（异步任务路径，见 §6） |
| runQueue / generation_runs 持久化 | **表结构不变** | `generation_runs.kind` 列值域变化（存 text/image/video），无需 DDL；旧行随 R7 清理 |
| SSE 事件流 | **不变** | RunEvent 协议与节点类型无关 |

结论：DAG 引擎的图论内核零改动；变化集中在"节点类型 → 参数/输入/输出"的提取层。这是本次重构中风险最低的部分。

---

## 3. 模板格式与「拉取和组合」（交付 3 + §3.8）

### 3.1 模板格式

```jsonc
{
  "schemaVersion": 7,               // WORKFLOW_SCHEMA_VERSION 升 7（v6 及以下一律拒绝，R7）
  "id": "builtin-text-to-image",
  "name": "文生图（服装设计）",
  "builtIn": true,
  "flow": {
    "schemaVersion": 7,
    "nodes": [
      { "id": "prompt-1", "type": "text", "position": {"x": 0, "y": 0},
        "data": { "kind": "text", "label": "提示词", "status": "idle",
                  "text": "设计一套现代都市女装：……（默认正文，用户可改）" } },
      { "id": "gen-1", "type": "image", "position": {"x": 380, "y": 0},
        "data": { "kind": "image", "label": "文生图", "status": "idle",
                  "promptVariantId": "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v2",
                  "modelId": "gpt-image-2.5-flare-vip",
                  "modelOptions": { "size": "1536x2048" },
                  "aspectRatio": "3:4", "batchSize": 1, "outputImages": [] } }
    ],
    "edges": [
      { "id": "e1", "source": "prompt-1", "target": "gen-1" }
    ]
  }
}
```

模板 = 三种节点的组合 + 每个节点的 `promptVariantId` / `modelId` / `modelOptions` 预设 + text 节点的默认正文。text 正文进模板是**默认内容**（用户实例化后可改），不是只读引用——这与 R2「正文由文本节点承载」一致：正文的生命周期属于画布文档，不属于目录。

### 3.2 拉取和组合的具体形态

- **模板实例化**：`launchTemplateInNewTab` 现有机制不变（深拷贝 flow → 新 tab），拷贝时重新校验 R3 不变量（防御模板数据损坏）。
- **功能组合**：用户在画布上新增 image 节点 → 悬浮窗口选系统提示词（目录查询 `listGarmentPromptVariants`，R6 只列已发布）→ 自动补上游 text 节点（§1.3 画布层）→ 连线其他 image 节点作为参考图。
- **模板缩略图 / 启动模式**（`templateLaunch.ts` 的 `inferTemplateLaunchMode`）：按新 NodeKind 重写判定（找首个 image 节点 / text 节点），逻辑简化。

### 3.3 result 节点能力归位（§3.3）

| 旧能力 | 归位到 |
|---|---|
| 结果汇总展示 | image 节点自身的 `outputImages` 网格（已有）+ `ResultsPanel`（运行历史面板，按 run 聚合，已有，不依赖 result 节点） |
| 导出/保存 | `resultExportStore` 从「result 节点触发」改为「image 节点选中触发 + ResultsPanel 批量导出」；保存全部按钮移到节点工具栏与结果面板 |
| 历史 | `generation_runs` / `generation_outputs` 表与 `recent-results` 流程**不变**（它们本来就不依赖 result 节点，只依赖 run 记录） |
| 关联证据（参考图溯源） | `ReferenceImageInput.sourceNodeId` 机制不变；ImageViewer 的证据展示不变 |

结论：result 节点是纯 UI 聚合器，其能力在现有面板/节点 UI 中已有等价物；删除它不产生能力缺口。P2 需做一次导出交互的 UX 归位设计（归 designer），本方案只定能力归属。

---

## 4. 清理 / 不兼容执行方案（交付 4：R7 + §3.7）

### 4.1 范围

| 数据 | 处置 | 说明 |
|---|---|---|
| `projects` 表全部行（含 `lifecycle='saved'` 与 `lifecycle='initial_draft'`） | **物理删除** | R7 明确"已保存项目全部清掉" |
| 用户模板 `data/templates/user/*.json` | **物理删除** | R7 明确旧模板清掉 |
| 内置模板 `data/templates/builtin/*.json`（6 套） | **重写为新格式**（不是删除） | 内置模板是产品资产不是用户数据；按 §3.1 新格式重做，随 P2 交付 |
| `generation_runs` / `generation_outputs` / `usage_events` | **【待确认 Q5】** 推荐：物理删除 | 历史运行记录引用旧 kind 与旧节点 ID，留着无法在新 UI 呈现；但删除会清空"历史"面板与用量统计 |
| `files` 表中 `source_type='generation'` 且仅被已删 run/项目引用的行 | 级联删除（现有 purge 机制） | 随上一条联动 |
| `assets`（印花/面料素材库） | **【待确认 Q5】** 推荐：保留 | assets 是用户显式保存的素材，R7 原文是"旧草稿+旧模板+已保存项目"，未提素材库 |
| 评估证据链（`evaluation_*` 表、`docs/ai/evaluation/**`） | **保留不动** | 历史评估证据是审计资产；新变体的评估是新 campaign |
| `users` / `sessions` | 不动 | 与本次无关 |

### 4.2 执行方式

新增一次性管理脚本 `scripts/three-node-migration-purge.mjs`（P2 实现，本方案只定契约）：

1. **前置导出**（§3.7"是否给用户一次导出机会"）：脚本先对 `projects` 全表导出 `flow_json` 到 `data/migration-export-<timestamp>/projects/*.json`（含 owner 分目录），对用户模板目录整体复制。导出完成并校验行数一致后才执行删除。**这是防御性兜底**，不提供 UI 入口，不承诺向后兼容读取。
2. **删除**：单事务内按 FK 依赖序删除（`usage_events` → `generation_outputs` → `generation_runs` → `project_asset_refs` → `projects`），随后删用户模板文件。脚本打印逐表行数回执。
3. **不可逆提示**：脚本交互式确认两次（输入 `DELETE-ALL-PROJECTS` 与二次 YES），并在 CI/部署文档中标注"上线即执行"。
4. **schema 版本闸**：`WORKFLOW_SCHEMA_VERSION` 升 `7`；`validateAndMigrateFlow` 对 v6 及以下**一律拒绝**（删除现有 v0–v5 迁移路径）。拒绝文案提示"该项目为旧版本格式，已随三节点重构清理"。

### 4.3 提示词目录随清理的重登记

`GARMENT_PROMPT_VARIANTS` 现有 25 个变体的 `nodeKind` 全部失效（引用旧 kind）。P2 重写目录时：

- 功能变体重写为 `image`/`video` 语义（upscale / print-extract / print-mutate / fabric-recolor / ai-modify / sketch-to-render 六族功能文案迁移为系统提示词）；
- 所有变体 `supportStatus` 重置为 `unverified`，按既有评估链重新走 campaign（**不需要重新付费评估才可上线**——上线门槛由 release registry 的发布动作控制，评估节奏由 orchestrator 另行排期；【待确认点见 Q5 附带】）；
- `prompt-release-registry.json` 当前为空（`releases: []`），无历史 release 需要作废。

---

## 5. 文本 / 视频模型提案（交付 5：R10，需用户确认）

依据：API易 本地知识库快照 `docs/ai/apiyi/site/snapshots/2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd`（2799 页，2026-09-18 抓取）。本方案未触碰任何 Provider/契约代码，不触发 `docs:apiyi:guard`；P2 实施契约变更时按 §5 知识库门禁补 `docs:apiyi:lookup` 回执。

### 5.1 文本模型（text 节点若需调模型，见 Q1）

当前系统**没有文本生成 Provider**——text 节点是否调模型本身就是开放问题（Q1）。若需要（例如"AI 帮我写提示词"），候选：

| 模型 | 端点 | 特点 | 建议 |
|---|---|---|---|
| `gpt-5.3` 系（`api-capabilities/gpt-5-3-chat`） | OpenAI 兼容 chat completions | 通用旗舰，提示词写作质量高 | **推荐主力** |
| `gemini-3.6-flash` / `3.5-flash-lite` | chat completions | 便宜快速 | 推荐轻量档 |
| `deepseek-v4-flash` | chat completions / responses | 中文性价比 | 备选 |
| `claude` 系 / `qwen-3.8` / `kimi-k2.5` | 均有页面 | — | 不首推（成本/稳定性未评估） |

接入形态：OpenAI 兼容 `POST /v1/chat/completions`，同步调用，与现有异步图片链路完全不同——这是支持 Q1 选"text 节点不调模型"的重要理由：**引入文本模型 = 引入第二条 Provider 链路 + 计费/重试/评估体系**。若产品目标只是"提示词正文由用户手写+模板预填"，则 text 节点零 Provider 依赖，系统复杂度大幅下降。

### 5.2 视频模型（video 节点必需）

API易 当前可用视频家族（快照内均有完整 API 页）：

| 家族 | 模型 ID 示例 | 能力 | 计费/接入要点 |
|---|---|---|---|
| **Seedance 2.x**（字节） | `doubao-seedance-2-5-260628` / `2-0-260128` / `-fast` / `-mini` | 文生视频、首尾帧、多模态参考（2.5 最多 30 张参考图、30 秒）、视频编辑/延长，默认带音频 | 异步任务 `POST /seedance/api/v3/contents/generations/tasks`；需 `SeeDance2` 分组令牌（0.18x）；720p/5s 约 \$0.91（2.0 标准）/ \$1.37（2.5）；mini 约半价 |
| **Veo 3.1 Official**（Google 官转） | `veo-3.1-generate-preview` / `-fast-` | 文生视频、图生视频（1 张首帧），4/6/8 秒，720p/1080p/4k | 异步 `POST /v1/videos` + 轮询；**按次计费 \$0.3（fast）/ \$1.2（标准）**，默认分组可调；不返 CDN URL，必须服务端拉 MP4 落地 |
| **Wan 2.7**（阿里通义万相） | `wan2.7-t2v` / `-i2v` / `-r2v` / `-videoedit` | 文生、图生（可音频驱动对口型）、参考图生（1–5 张）、视频编辑；2–15 秒 | DashScope 异步端点，一个 key 四种玩法 |
| **HappyHorse 1.1**（阿里） | `happyhorse-1.1-t2v` / `-i2v` / `-r2v` / `1.0-video-edit` | 与 Wan 同端点可互换；参考图最多 9 张 | 主体还原强 |

**推荐**（需用户确认）：

1. **主力：Seedance 2.0 系（`doubao-seedance-2-0-260128` + `-fast` + `-mini`）**。理由：服装场景的"图生视频（款式图→上身动效）"是核心玩法，Seedance 首尾帧 + 多模态参考最贴合；2.0 系价格梯度完整（mini 走量、标准版保质）；同分组一把令牌。代价：需要用户令牌勾选 `SeeDance2` 分组（0.18x）——这是运营动作，需在设置 UI 提示。
2. **品质档备选：Veo 3.1 Official**。理由：默认分组即可调、按次计费简单、官方画质；适合作为"高品质"选项。代价：4/6/8 秒时长上限短，且 1080p/4k 只支持 8 秒，无多参考图能力。
3. **暂不接入** Wan / HappyHorse：能力与 Seedance 重叠，接入边际收益低；视频编辑（videoedit）属于二期玩法，不在本次重构范围。

视频节点的运行时形态（异步任务 + 轮询 + MP4 落地存储）与现有同步图片链路差异大，详见 Q2。

### 5.3 需用户确认的提案清单

- [ ] 文本模型：是否引入？引入则主力 `gpt-5.3` + 轻量 `gemini-3.6-flash`（或 text 节点不调模型，Q1）
- [ ] 视频主力：Seedance 2.0 三档（mini/fast/标准）
- [ ] 视频品质档：Veo 3.1 Official（fast/标准）
- [ ] 是否接受 `SeeDance2` 分组令牌要求（0.18x 倍率）

---

## 6. 待确认问题（Q1–Q5，阻塞 P2 开工）

> 按需求文档 §5 纪律：以下为实质歧义，**不自行拍板**。每条给推荐，但最终由用户/orchestrator 裁定。

**Q1（A 类，§1.2/§5.1）：text 节点是否调用文本模型？**
- 选项 a（推荐）：text 节点是纯内容节点——用户手写 + 模板预填 + 编辑，无模型、无运行状态、无计费。系统不引入文本 Provider 链路。
- 选项 b：text 节点可运行（"AI 润色/生成提示词"），引入 chat completions 链路与文本模型契约。
- 影响面：a 则 §1.2 `TextNodeData` 无 modelId/status 语义、§5.1 整节取消；b 则需新增文本 Provider 抽象、契约、计费与评估。

**Q2（A 类，§1.1/§5.2）：视频产物的持久化与首帧输入形态？**
- 视频文件：`files` 表目前只承载图片 mime。推荐：扩 `files` 支持 `video/mp4`（服务端按 Veo/Seedance 文档要求**必须**拉 MP4 落地到自有存储，不能依赖远端 URL），画布节点显示首帧缩略图 + 点击播放。
- 首帧输入：推荐 video 节点接受 0..1 条图片入边作为首帧（image-to-video），文生视频则 0 图片入边 + text 入边。
- 待确认点：视频存储体积（单文件 5–50MB）对 `data/` 目录与备份策略的影响是否接受？是否需要同时引入对象存储？（推荐：本期仍落 `data/` 文件存储，与图片一致；对象存储二期。）

**Q3（B 类，§1.3）：fabric-recolor 的面料 handle 语义是否确认抹平？**
推荐抹平（连线模型统一）；若保留则需为 image 节点引入多 handle，画布复杂度上升。此项影响小，标为 B 类，默认按推荐执行。

**Q4（A 类，§1.2/§2.1）：蒙版（局部修改）与多色/裂变的产品形态？**
- 蒙版：推荐保留为 image 节点能力——当选中的系统提示词变体声明 `needsMask: true` 时，节点启用蒙版编辑器（现有 MaskEditor 复用），`mask`/`maskSourceRef`/`featherRadius` 字段挂在 image 节点上。`gpt-image-2.5-sunburst` 的 mask 契约与合成后处理逻辑不变。
- 多色换色（fabric-recolor 的一色一图循环）：推荐**不保留为节点机制**，改为系统提示词 + batchSize 表达（用户在 text 正文里写配色要求，batchSize 控制张数）。牺牲：一色一图的精确控制变弱；收益：runner 内最后一条 kind 特化循环删除。
- 印花裂变 1–8 张：同理由 batchSize 表达。
- 若用户认为一色一图是必须保留的产品能力，则 runner 保留一条"按参数数组循环调用"的通用机制（参数驱动，非 kind 驱动）。

**Q5（A 类，§4.1）：清理范围的两个开放项？**
- generation_runs / outputs / usage_events 是否一并删除（推荐删）？
- assets 素材库是否保留（推荐留）？
- 附带：六族旧功能的新变体是否接受"上线即 unverified，评估另行排期"（推荐接受，与现状 25 变体全 unverified 一致）？

---

## 7. 分阶段落地计划（交付 6）+ 风险与回滚

### 7.1 里程碑（每个里程碑可独立验证）

| 阶段 | 内容 | 验证标准 |
|---|---|---|
| **P1（本方案）** | 方案 + 契约文档 | 本文档评审通过；Q1–Q5 全部裁定 |
| **P2-a 契约与类型** | `NodeKind` 三值化、`WORKFLOW_SCHEMA_VERSION=7`、`model-contracts.json` 加 `recommendedOptions`、知识库门禁回执 | `tsc --noEmit` 通过（大量红即是改动面清单）；`docs:apiyi:guard` 通过 |
| **P2-b 服务端** | workflowSchema v7 校验（含 R3 图级规则）、dag/runner 统一执行路径、清理脚本、模板路由适配 | `tests/workflow-schema`、`tests/dag`、`tests/run-queue` 重写后通过 |
| **P2-c 前端画布** | 三个节点组件（TextNode/ImageNode/VideoNode）、悬浮窗口（功能/参数/模型）、连线约束、模板启动 | e2e golden-path 重写后通过；1024/1280/1440 三档几何断言 |
| **P2-d 提示词目录** | 六族功能变体重写 + 目录治理流程文档（§3.6 见下） | `prompt-presets` / `prompt-run-admission` 测试通过 |
| **P2-e 视频链路** | 视频 Provider（异步任务/轮询/MP4 落地）、files 表 video mime、VideoNode UI | 视频 e2e（dry-run/mock Provider，不调付费） |
| **P2-f 清理执行** | 导出 + 删除脚本在 staging 跑通、生产执行窗口确认 | 导出校验回执 + 删除行数回执 |

提示词目录治理（§3.6）：新增功能 = 向 `garmentPromptPresets.ts` 提 PR（任何开发者可提）→ 评审走既有 PR 评审 + `gate:codex` → 合入后状态 `unverified` → 评估链 campaign → release registry 发布后才对普通用户可选（R6 已有机制）。回滚 = 目录 PR revert + registry 中该变体标记撤销；与代码发布解耦。该流程写入 `docs/ai/evaluation/README.md` 的治理节（P2-d 执行）。

### 7.2 风险登记

| 风险 | 等级 | 缓解 |
|---|---|---|
| 测试引用面大（37 个测试文件 + 3 个 e2e 引用旧 kind） | 高 | P2 按文件清单分批重写；清单已枚举（§3.2 影响面） |
| 旧数据清理误伤（Q5 未定） | 高 | 导出兜底 + 二次确认 + staging 先行 |
| 视频链路是全新能力（异步/轮询/存储） | 中 | 独立里程碑 P2-e，mock Provider 先行 |
| 提示词变体重写后质量回归（六族文案从 runner 硬编码迁入目录） | 中 | 文案逐字迁移，diff 评审；评估链后排 |
| R5 放开后用户填错参数导致 Provider 报错增多 | 低 | UI 推荐值默认填充 + warning 可见；Provider 错误文案已有用户可读映射 |
| mask 能力与"选提示词"模型的耦合（needsMask 声明） | 低 | 变体声明驱动，契约测试覆盖 |

### 7.3 回滚

- P2 各阶段均走 PR + CI 门禁；任何问题 revert 对应 PR。
- **P2-f 清理执行后不可回滚**（R7 用户已明确接受）；因此清理脚本必须是最后一个里程碑，且执行前导出兜底（§4.2）。
- schema v7 拒绝旧格式意味着：一旦 v7 上线，旧客户端保存的项目无法再读——这本身就是 R7 的语义，与清理脚本互为冗余保险。

---

## 8. 交付清单（本目录）

| 文件 | 内容 |
|---|---|
| `plan.md`（本文） | 总体方案 |
| `contracts/data-model.md` | NodeKind / 节点数据 / 参数 schema 契约（§1 的完整字段级定义） |
| `contracts/runtime.md` | 渲染器组装顺序、DAG 检查清单、运行前置检查语义（§2） |
| `contracts/graph-invariants.md` | R3 不变量与三处实现的统一语义（§1.3） |
| `contracts/template-format.md` | 模板 v7 格式与实例化语义（§3） |
| `contracts/purge-runbook.md` | 清理执行手册：范围/导出/删除顺序/回执格式（§4） |
| `contracts/model-proposals.md` | 文本/视频模型对比全文（§5，含知识库页面引用与 SHA） |
| `contracts/test-sync-inventory.md` | §3.2 要求的 37 个测试 + 3 个 e2e 的逐项处置清单 |
