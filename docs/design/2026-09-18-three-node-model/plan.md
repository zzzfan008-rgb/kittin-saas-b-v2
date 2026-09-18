# 三基础节点模型重构 — 架构方案（P1：只出方案，不写产品代码）

- 状态：**已定稿**（Q1=B / Q2=A / Q3=A / Q4=A / Q5=A 全部用户裁定落地，无待确认项）
- 日期：2026-09-18（v3 更新同日：Q3 裁定落地）
- 输入：`docs/requests/2026-09-18-three-node-model.md`（R1–R10 用户逐项裁定 + §3 八条既有约束）+ orchestrator 中继的用户裁定（Q1=B、Q2=A、Q3=A、Q4=A、Q5=A）
- 作者：architect

> 本方案对每条需求/约束标注可追溯挂靠（R1–R10、§3.1–§3.8）。
> Q1–Q5 全部裁定已落地，方案定稿，可直接进入 P2。

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
| `text` | 0..N 文本入边（可选，多段正文串联，见 §1.2） | `"text"` | `apiyi`（Q1=B：可运行文本模型，见 §5.1） |
| `image` | 0..N 文本入边（≥1，见 R3）+ 0..8 图片入边 | `"images"` | `apiyi` |
| `video` | 0..N 文本入边（≥1）+ 0..1 图片入边（首帧，Q2=A） | `"video"` | `apiyi` |

### 1.2 节点数据形状

```ts
export interface TextNodeData extends BaseNodeData {
  kind: "text";
  /** 提示词正文；R2 规定由文本节点承载。用户手写内容，永远不被运行结果覆盖。 */
  text: string;
  /** Q1=B：可运行文本模型（如「AI 润色 / 生成提示词」）。
   *  三项窗口配置与 image/video 同构（R4）： */
  promptVariantId?: string;          // 系统提示词（如"提示词润色"变体）
  modelId?: TextModelId;             // 文本模型（见 §5.1）
  modelOptions?: TextModelOptions;   // temperature 等，自由 key-value（R5）
  /** 运行语义字段：text 节点有完整 NodeRunStatus 状态机（idle/running/success/error） */
  /** 最近一次运行的输入快照（用于"本次运行基于哪段正文"的可追溯展示） */
  lastRunInput?: string;
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
  modelId?: VideoModelId;            // 新增，见 §5.2
  modelOptions?: VideoModelOptions;  // seconds / resolution / aspectRatio 等
  /** 输出视频引用（/api/files/xxx，files 表扩 video mime，Q2=A：服务端拉 MP4 落地自有存储） */
  outputVideos: string[];
}
```

要点：

- `ModelSelectableNodeData` 大瘦身：`operationMode` / `operationModeNeedsConfirmation` / `retiredModelId` / `modelSelectionNeedsConfirmation` 整族字段删除。理由：旧字段存在是因为 9 种节点各自语义不同、历史模型退役要兼容；收敛后**操作模式由系统提示词携带**（变体的 `mode` 字段），节点不再自描述模式。`retiredModelId` 的"重选提示"职责由新的契约比对承担（见 §5.1）。
- `promptVariantId` / `contractHash` / `evaluationVersion` 等评估绑定字段**保留**——R6 明确保留评估发布链，运行时绑定语义不变。
- Q1=B 引入的文本 Provider 链路是**同步 chat completions**，与现有异步图片链路并存；计费/评估复用既有骨架（run 记录 + usage_events + promptRunAdmission），不新建体系（§5.1）。
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

**多图参考的表达**（§3.4）：原 `image-input` 的"参考图列表"退化为**边**——`image` 节点接受 0..8 条图片入边（来自其他 `image` 节点的输出），顺序 = 边数组顺序（现有 `inputReferences` 顺序语义已验证）。角色/顺序语义已在前一重构移除，本方案不恢复。

**text 节点的串联入边**（Q1=B 新增）：text 节点接受 0..N 条 text 入边，运行时把上游各 text 输出按边顺序拼接后与自身正文合成输入，用于"多段正文 → 一次润色"的玩法。这条入边只影响 text 运行路径，不改变 R3 对 image/video 的约束。

**Q3 已裁定：形态 A（抹平）**。image 节点只保留统一通用图片入口（`targetHandle="reference"`），不再有 `targetHandle="fabric"` 专用入口；「谁是面料」的角色语义由**选中的系统提示词正文**声明（如「参考图 2 = 面料」），顺序即语义。

- 画布组件零改动：单 `reference` handle，无新增锚点。
- graph-invariants 无新增 handle 规则：面料参考图就是普通 image 边，数量上限 ≤ 8，顺序 = 边数组顺序。
- 运行时无差异：`assertPlanInputs` 的 fabric 检查随 fabric-recolor 旧 kind 一并退役；参考图解析仍是顺序数组。
- 风险与缓解：顺序错导致静默跑偏的风险由运行前预览（参考图列表按顺序展示缩略图）兜底，该列表 UI 已存在。

裁定记录见 §6。

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
5. mask 系提示词（若 variant.needsMask）走现有 maskPromptTemplate 包装，不变（Q4=A）
6. 交给 renderProviderPrompt 追加「参考图:」列表（现有契约不变）
```

**text 节点的运行路径**（Q1=B 新增，与 image/video 并列的第三条路径）：

```
1. 输入 = 上游 text 边各节点输出（按边顺序）+ 自身 text 正文，以 \n\n 拼接
2. variant = promptVariantId 对应变体（如"提示词润色"），同样走 promptRunAdmission
3. 调文本 Provider（同步 chat completions，§5.1）
4. 结果写回节点 outputText（展示态字段）；用户手写 text 字段永不覆盖
   ——「采纳」是显式 UI 动作（点击采纳按钮把 outputText 复制进 text）
5. 产生 generation_runs 记录（kind='text'）与 usage_events（按 token 计费）
```

设计要点：text 节点的运行结果是**建议**，不是覆写。这条纪律保证 R2「正文由文本节点承载」的所有权始终属于用户——AI 只能提案，落笔由人。

`providerPromptRenderer` 的版本/hash 契约（`PROVIDER_PROMPT_RENDERER_HASH`）**继续有效**，但其 `nodeKind` 入参的取值集合变化（9 → 3），release vector 中 `nodeKind` 字段相应变化——这意味着**全部已发布变体需要按新 nodeKind 重新登记**，归入 P2 的提示词目录重写（§4.3）。

`upscale` / `print-extract` / `print-mutate` / `fabric-recolor` 目前硬编码在 runner 里的固定文案，**迁移为提示词目录中的系统提示词变体**——这正是 R1「功能从结构退化为内容」的核心。runner 内不再有任何节点类型特化的文案分支；Q4=A 裁定后，多色换色的「一色一图循环」与印花裂变的批量机制**一并删除**，统一由 `batchSize` 参数 + 系统提示词正文表达（用户在正文里写配色/裂变要求，batchSize 控制张数）。仅剩的 kind 分支是：蒙版合成后处理（mask，由变体 `needsMask` 声明驱动）与视频异步轮询（video）。

### 2.2 DAG / 队列 / 执行器影响

| 组件 | 影响 | 说明 |
|---|---|---|
| `buildExecutionPlan`（拓扑排序/环检测/局部重跑） | **无结构性影响** | 算法与节点类型无关；`extractOutputImages` 与 `extractParams` 两个 switch 重写为 3 分支 |
| `assertPlanInputs` | 重写 | 删除所有 kind 特化（fabric-recolor 的 garment 检查随 Q3 分支 A 抹平、mask-redraw 的 mask 检查改为由变体声明驱动：变体声明 `needsMask` 才检查 mask 字段）；新增 R3 的 text 上游检查 |
| `assertPromptRunAdmissions` | **语义不变** | 评估发布准入继续按 `promptVariantId` 工作，与节点类型解耦后反而更直接；text 变体走同一机制 |
| `executeStep` | 重写为三分支统一路径 | 9 个 kind 分支收敛为：text（Q1=B：同步 chat completions，结果写 outputText）、image（统一生成路径 + 可选 mask 后处理）、video（异步任务路径，Q2=A：submit + worker 轮询 + MP4 落地） |
| runQueue / generation_runs 持久化 | **表结构不变** | `generation_runs.kind` 列值域变化（存 text/image/video），无需 DDL；text 运行产生 kind='text' 的 run 记录；旧行随 R7 清理（Q5=A 确认删除） |
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

### 4.1 范围（Q5=A 已裁定）

| 数据 | 处置 | 说明 |
|---|---|---|
| `projects` 表全部行（含 `lifecycle='saved'` 与 `lifecycle='initial_draft'`） | **物理删除** | R7 明确"已保存项目全部清掉" |
| 用户模板 `data/templates/user/*.json` | **物理删除** | R7 明确旧模板清掉 |
| 内置模板 `data/templates/builtin/*.json`（6 套） | **重写为新格式**（不是删除） | 内置模板是产品资产不是用户数据；按 §3.1 新格式重做，随 P2 交付 |
| `generation_runs` / `generation_outputs` / `usage_events` | **物理删除**（Q5=A 确认） | 历史运行记录引用旧 kind 与旧节点 ID，留着无法在新 UI 呈现；用量统计随重构清零重计 |
| `files` 表中 `source_type='generation'` 且仅被已删 run/项目引用的行 | 级联删除（现有 purge 机制） | 随上一条联动 |
| `assets`（印花/面料素材库） | **保留**（Q5=A 确认） | assets 是用户显式保存的素材，不属于"旧草稿/旧模板/已保存项目" |
| `project_asset_refs` | 随 projects 级联删除 | 引用关系随主体 |
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
- 所有变体 `supportStatus` 重置为 `unverified`，按既有评估链重新走 campaign（**不需要重新付费评估才可上线**——上线门槛由 release registry 的发布动作控制，评估节奏由 orchestrator 另行排期；Q5=A 附带裁定已接受此口径，与现状 25 变体全 unverified 一致）；
- `prompt-release-registry.json` 当前为空（`releases: []`），无历史 release 需要作废。

---

## 5. 文本 / 视频模型提案（交付 5：R10，需用户确认）

依据：API易 本地知识库快照 `docs/ai/apiyi/site/snapshots/2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd`（2799 页，2026-09-18 抓取）。本方案未触碰任何 Provider/契约代码，不触发 `docs:apiyi:guard`；P2 实施契约变更时按 §5 知识库门禁补 `docs:apiyi:lookup` 回执。

### 5.1 文本模型（Q1=B 已裁定：text 节点可运行文本模型）

text 节点引入**同步 chat completions 链路**（OpenAI 兼容 `POST /v1/chat/completions`），用于「AI 润色 / 生成提示词」等玩法。这是与现有异步图片链路并存的第二条 Provider 路径，但计费/评估/准入**复用既有骨架**：`generation_runs`（kind='text'）+ `usage_events`（token 计量）+ `promptRunAdmission`（变体准入），不新建体系。

候选模型（API易快照内均有页面，详见 contracts/model-proposals.md §4）：

| 模型 | 档位 | 特点 | 建议 |
|---|---|---|---|
| `gpt-5.3` 系（`api-capabilities/gpt-5-3-chat`） | 旗舰 | 提示词写作/改写质量最高 | **推荐主力** |
| `gemini-3.6-flash` / `3.5-flash-lite` | 轻量 | 便宜快速，适合批量草稿 | **推荐轻量档** |
| `deepseek-v4-flash` | 性价比 | 中文场景备选 | 备选 |
| `claude` 系 / `qwen-3.8` / `kimi-k2.5` | — | 均有页面 | 不首推（成本/稳定性未评估） |

运行时形态（契约细节见 contracts/runtime.md §1-text 与 contracts/data-model.md §3）：

- **同步调用**：HTTP 请求内完成（chat completions 延迟可接受），不进 runQueue 异步骨架。
- **结果写 `outputText`**：展示态字段，用户手写的 `text` 字段**永不覆盖**；「采纳」是显式 UI 动作。
- **上游串联**：text 节点接受 0..N 条 text 入边，输入 = 上游输出 + 自身正文按边顺序拼接（§1.3）。
- **契约产物**：文本模型清单进 `model-contracts.json` 新区块（或并列的 `text-model-contracts.json`，P2 定其一），走与图片契约相同的评审流程；`TextModelId` 类型与契约一致性断言沿用 `imageModels.ts` 顶部 throw 的同款防线。

**推荐**（R10 要求用户确认）：主力 `gpt-5.3` + 轻量 `gemini-3.6-flash`。

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

视频节点的运行时形态（异步任务 + 轮询 + MP4 服务端落地自有存储，Q2=A 已裁定）详见 contracts/runtime.md §2 与 contracts/data-model.md §7。

### 5.3 需用户确认的提案清单（R10，文本与视频一并确认）

- [ ] 文本主力：`gpt-5.3`；文本轻量档：`gemini-3.6-flash`（Q1=B 已裁定引入，本条确认具体模型选型）
- [ ] 视频主力：Seedance 2.0 三档（mini/fast/标准）
- [ ] 视频品质档：Veo 3.1 Official（fast/标准）
- [ ] 是否接受 `SeeDance2` 分组令牌要求（0.18x 倍率）

---

## 6. 裁定记录（Q1–Q5，全部落定）

> v1 提出 5 问；v2 收到 Q1=B、Q2=A、Q4=A、Q5=A；v3 收到 Q3=A（2026-09-18 晚，经 designer 对比材料 `q3-canvas-forms/comparison.md` 评审后用户拍板）。至此 Q1–Q5 全部裁定完毕，**方案定稿**。

| 问题 | 裁定 | 落地位置 |
|---|---|---|
| Q1：text 节点是否调用文本模型 | **B：可运行**（如「AI 润色 / 生成提示词」） | §1.1/§1.2 TextNodeData、§2.1 text 运行路径、§5.1 文本模型设计、contracts/data-model.md §3、contracts/runtime.md §1-text |
| Q2：视频持久化与首帧形态 | **A：files 表扩 video/mp4，服务端拉 MP4 落地自有存储；首帧缩略图 + 点击播放；video 节点 0..1 图片入边作首帧；本期仍落 `data/` 文件存储** | §1.1、contracts/runtime.md §2、contracts/data-model.md §7 |
| Q3：fabric handle 是否抹平 | **A：抹平为统一 reference 入口**。面料角色语义由系统提示词正文声明，顺序即语义；无 `targetHandle="fabric"` 专用入口。裁定时间 2026-09-18 晚，依据 designer 对比材料 `q3-canvas-forms/comparison.md` + 用户拍板 | §1.3 Q3 段、contracts/graph-invariants.md §2 |
| Q4：蒙版与多色/裂变形态 | **A：蒙版保留为 image 节点能力（变体声明 needsMask 驱动）；一色一图循环与印花裂变批量取消，由系统提示词 + batchSize 表达；runner 最后一条 kind 特化循环删除** | §1.2 mask 字段、§2.1 末段、contracts/runtime.md §1 |
| Q5：清理范围 | **A：删 generation_runs/outputs/usage_events；保留 assets 素材库；六族旧功能新变体「上线即 unverified，评估另行排期」接受** | §4.1 范围矩阵、§4.3、contracts/purge-runbook.md |

---

## 7. 分阶段落地计划（交付 6）+ 风险与回滚

### 7.1 里程碑（每个里程碑可独立验证）

| 阶段 | 内容 | 验证标准 |
|---|---|---|
| **P1（本方案）** | 方案 + 契约文档 | 本文档评审通过；Q1–Q5 全部裁定（Q3=A 已于 2026-09-18 晚落地，方案定稿） |
| **P2-a 契约与类型** | `NodeKind` 三值化、`WORKFLOW_SCHEMA_VERSION=7`、`model-contracts.json` 加 `recommendedOptions`、文本模型契约区块（Q1=B）、知识库门禁回执 | `tsc --noEmit` 通过（大量红即是改动面清单）；`docs:apiyi:guard` 通过 |
| **P2-b 服务端** | workflowSchema v7 校验（含 R3 图级规则）、dag/runner 三分支执行路径（含 text 同步链路 + 文本 Provider）、清理脚本、模板路由适配 | `tests/workflow-schema`、`tests/dag`、`tests/run-queue` 重写后通过 |
| **P2-c 前端画布** | 三个节点组件（TextNode 含运行状态与采纳交互 / ImageNode / VideoNode）、悬浮窗口（功能/参数/模型）、连线约束、模板启动 | e2e golden-path 重写后通过；1024/1280/1440 三档几何断言 |
| **P2-d 提示词目录** | 六族功能变体重写 + 文本变体（润色/生成）+ 目录治理流程文档（§3.6 见下） | `prompt-presets` / `prompt-run-admission` 测试通过 |
| **P2-e 视频链路** | 视频 Provider（异步任务/轮询/MP4 落地）、files 表 video mime、VideoNode UI（首帧缩略图 + 点击播放） | 视频 e2e（dry-run/mock Provider，不调付费） |
| **P2-f 清理执行** | 导出 + 删除脚本在 staging 跑通、生产执行窗口确认 | 导出校验回执 + 删除行数回执 |

提示词目录治理（§3.6）：新增功能 = 向 `garmentPromptPresets.ts` 提 PR（任何开发者可提）→ 评审走既有 PR 评审 + `gate:codex` → 合入后状态 `unverified` → 评估链 campaign → release registry 发布后才对普通用户可选（R6 已有机制）。回滚 = 目录 PR revert + registry 中该变体标记撤销；与代码发布解耦。该流程写入 `docs/ai/evaluation/README.md` 的治理节（P2-d 执行）。

### 7.2 风险登记

| 风险 | 等级 | 缓解 |
|---|---|---|
| 测试引用面大（37 个测试文件 + 3 个 e2e 引用旧 kind） | 高 | P2 按文件清单分批重写；清单已枚举（contracts/test-sync-inventory.md） |
| 旧数据清理误伤 | 高 | 导出兜底 + 二次确认 + staging 先行（Q5=A 已定范围，无开放项） |
| 视频链路是全新能力（异步/轮询/MP4 落地存储） | 中 | 独立里程碑 P2-e，mock Provider 先行 |
| 文本链路是第二条 Provider 路径（Q1=B：同步 chat completions + token 计费） | 中 | 复用既有 run/usage/准入骨架，不新建体系；P2-b 内嵌交付 |
| 提示词变体重写后质量回归（六族文案从 runner 硬编码迁入目录） | 中 | 文案逐字迁移，diff 评审；评估链后排（Q5=A 已接受上线即 unverified） |
| R5 放开后用户填错参数导致 Provider 报错增多 | 低 | UI 推荐值默认填充 + warning 可见；Provider 错误文案已有用户可读映射 |
| mask 能力与"选提示词"模型的耦合（needsMask 声明） | 低 | 变体声明驱动，契约测试覆盖 |
| 多色「一色一图」精确控制变弱（Q4=A：改 batchSize 表达） | 低 | 系统提示词正文可写配色清单；batchSize ≤ 8 覆盖原循环上限 |

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
