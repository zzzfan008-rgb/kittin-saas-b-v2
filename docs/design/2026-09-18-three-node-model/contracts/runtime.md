# 契约：运行时（渲染器组装 / DAG / 执行器）

- 来源：plan.md §2；需求挂靠 R2/R3/R5/R6/R8、§3.3/§3.4/§3.5
- v2：Q1=B（text 运行路径 §1b 新增）、Q2=A（video 路径 §2 定稿）、Q4=A（kind 特化循环删除）、Q5=A（§5 run 记录口径）已落地。
- v3：Q3=A（fabric handle 抹平）——`fabricImageUrl` 特化删除，图片入边统一为 reference 顺序语义（§4 末段）。

## 1. 渲染器组装顺序（image 节点）

`executeStep` 中 `kind === "image"` 的统一路径，**严格按此顺序**：

1. **取用户提示词正文**：从执行计划的上游 text 边收集各 text 节点 `data.text`，按边顺序以 `\n\n` 拼接为 `userPrompt`。INV-2 已保证非空。
2. **取系统提示词变体**：`promptVariantId → getGarmentPromptVariantById`。变体必须存在且 `supportStatus` 通过现有 `promptRunAdmission` 准入（R6，语义不变）。
3. **合成 taskPrompt**：`variant.fullPrompt + "\n\n" + userPrompt`。
   - 职责切分：系统提示词承载功能与质量约束（原 runner 硬编码文案的迁移目标）；text 正文承载用户意图。
   - **不再执行** v6 的 `buildGarmentPrompt`「主题与任务/提示词变体」包装——那是单节点时代的拼合协议，正文上画布后由本步骤替代。
4. **解析参考图**：上游 image 边 → `resolveReferenceInputs`（顺序 = 边顺序，现有 `ReferenceImageInput` 契约不变，§3.4）。
5. **mask 分支**（仅当变体声明 `needsMask: true`）：
   - 校验 `mask` 存在、`maskSourceRef === 第一条图片入边的当前引用`（沿用 v6 语义）；
   - `prepareMaskForGeneration` 生成区域引导图并追加为最后一张参考图（不变）；
   - taskPrompt 经 `maskPromptTemplate` 包装（`providerPromptRenderer` 现有能力，不变）。
6. **渲染**：`renderProviderPrompt({ modelId, operationMode: variant.mode, taskPrompt, references })` 追加「参考图:」列表（`PROVIDER_PROMPT_RENDERER_CONTRACT` 不变）。
7. **请求**：`ImageGenRequest = { prompt, operationMode: variant.mode, references, aspectRatio, batchSize, modelOptions, mask? }`；评估绑定字段（promptVariantId/contractHash/evaluationVersion…）原样透传。
8. **后处理**：`postProcessGeneratedOutputImages` 保留（fit-contain 等）；mask 合成 `compositeMaskedEdit` 保留。

**禁止**：runner 内出现任何按功能硬编码的提示词文案（upscale/print-extract 等文案必须已全部迁入提示词目录）。P2-b 验收时以 ast-grep 规则扫描 runner 中文字面量。Q4=A 裁定：多色换色「一色一图循环」与印花裂变批量机制**一并删除**，由 `batchSize` + 系统提示词正文表达；runner 不再有任何按 kind/变体循环调用 Provider 的分支。

## 1b. text 节点运行路径（Q1=B）

`executeStep` 中 `kind === "text"` 的路径：

1. **输入组装**：上游 text 边各源节点的输出（运行过则取 `outputText`，否则取 `text`）按边顺序 + 自身 `text` 正文，以 `\n\n` 拼接为 `input`；`lastRunInput = input`（可追溯快照）。
2. **变体准入**：`promptVariantId → getGarmentPromptVariantById`，走同一 `promptRunAdmission`（R6 不变）；未选变体的 text 节点**不可运行**（仅作内容节点，运行按钮禁用，提示「先在悬浮窗口选择功能」）。
3. **组装**：`messages = [{ role: "system", content: variant.fullPrompt }, { role: "user", content: input }]`。
4. **调用**：文本 Provider 同步 chat completions（HTTP 请求内完成，不进 runQueue 异步骨架）；`modelId`/`modelOptions` 透传，modelOptions 走 R5 warning 通道。
5. **写回**：结果写 `outputText`；**`text` 字段永不覆盖**。节点状态机走 idle→running→success/error 全程（SSE 事件不变）。
6. **记录**：产生 `generation_runs`（`kind='text'`）+ `usage_events`（按 prompt/completion token 计量，复用现有计量骨架）。

```ts
export interface TextGenRequest {
  input: string;                    // 组装后的用户输入
  promptVariantId: string;          // 必须已发布
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  modelId: TextModelId;
  modelOptions?: TextModelOptions;
}

export interface TextProvider {
  readonly id: TextModelId;
  /** 同步调用；失败返回 error 与 billed=false 证据 */
  complete(req: TextGenRequest): Promise<
    | { status: "completed"; text: string; usage: { promptTokens: number; completionTokens: number } }
    | { status: "failed"; error: string; billed: boolean }
  >;
}
```

## 2. video 节点路径（Q2=A 已裁定）

1–4 同 image（首帧 = 唯一 image 边）。之后进入视频 Provider 抽象：

```ts
export interface VideoGenRequest {
  prompt: string;
  firstFrame?: ReferenceImageInput;
  modelOptions?: VideoModelOptions;
  promptVariantId?: string;
  contractHash?: `sha256:${string}`;
}

export interface VideoProvider {
  readonly id: VideoModelId;
  /** 提交异步任务，返回 provider 侧 task id */
  submit(req: VideoGenRequest): Promise<{ taskId: string }>;
  /** 轮询；返回 done 时必须已完成 MP4 服务端落地并给出 files 引用 */
  poll(taskId: string): Promise<
    | { status: "pending" | "running" }
    | { status: "completed"; videoFileRef: string; durationSec?: number }
    | { status: "failed"; error: string; billed: boolean }
  >;
}
```

- 轮询循环由 runQueue worker 承载（复用现有重试/取消骨架），**不在 HTTP 请求内同步等待**。
- 计费语义：仅 `completed` 计费（Veo/Seedance 文档一致）；`failed` 记录 `billed: false` 证据。
- **MP4 服务端落地自有存储是强制步骤**（Q2=A：Veo 官转明确不返 CDN URL；Seedance 远端留存期不作依赖）；落地后 `videoFileRef` 引用 `/api/files/xxx`（files 表 video/mp4，见 contracts/data-model.md §7），画布不持有远端 URL。
- 画布显示：首帧缩略图 + 点击播放；首帧来源 = video 节点唯一图片入边（图生视频）或落地视频抽帧（文生视频），P2-e 定其一。
- 存储：本期仍落 `data/` 文件存储，对象存储二期（Q2=A）。

## 3. DAG 改动清单

| 函数 | 改动 |
|---|---|
| `buildExecutionPlan` | `extractOutputImages`/`extractParams` 重写为 3 分支；text 节点的"输出"定义为 `outputText ?? text`（Q1=B：运行过取运行结果，否则取手写正文），沿 text 边传递——`NodeExecution.upstream` 增加 `texts: string[]` 或在 params 注入，P2-b 定死其一 |
| `assertPlanInputs` | 删除 kind 特化；保留：模型 ID 契约检查、参考图数量检查、INV-2、needsMask 变体的 mask 检查；`modelOptions` 硬校验改 warning 收集（附加到 RunEvent meta，前端展示不阻断） |
| `assertPromptRunAdmissions` | 不变 |
| `buildExecutionPlan` 拓扑/环检测/局部重跑 | 不变 |

## 4. 执行器（executeStep）三分支

| kind | 行为 | Provider 调用 |
|---|---|---|
| text | §1b 路径：上游串联 + 变体准入 + 同步调用，结果写 `outputText` | 同步 chat completions（Q1=B） |
| image | §1 统一路径 | 同步 images |
| video | §2 异步路径 | submit + worker 轮询 + MP4 落地（Q2=A） |

`assertNoRemoteWorkerReferences` 等远程引用防线保留（图片入边统一为 reference 语义，fabricImageUrl 特化随 fabric-recolor 旧 kind 一并删除，mask 保留）。

## 5. result 归位后的运行记录

- `generation_runs.kind` 值域变为 `text | image | video`（Q1=B 后 text 运行**产生** run 记录，kind='text'；video 一条 run 对应一次完整 submit→completed/failed）。
- run 历史/用量/最近结果面板数据源不变，UI 按新 kind 渲染。
- 导出触发点：`resultExportStore.saveAll` 的调用方从 ResultNode 改为 ImageNode 工具栏 + ResultsPanel（UX 细节归 designer，本契约只定能力归属）。

## 6. R5 warning 通道

`assertPlanInputs` 与 `workflowSchema` 收集的 modelOptions warnings 经 RunEvent meta 新字段 `parameterWarnings?: string[]` 透传到前端，节点上以警示图标展示。**不进入错误通道，不阻断状态机。**
