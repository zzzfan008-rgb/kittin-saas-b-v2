# 契约：运行时（渲染器组装 / DAG / 执行器）

- 来源：plan.md §2；需求挂靠 R2/R3/R5/R6/R8、§3.3/§3.4/§3.5
- v2：Q1=B（text 运行路径 §1b 新增）、Q2=A（video 路径 §2 定稿）、Q4=A（kind 特化循环删除）、Q5=A（§5 run 记录口径）已落地。
- v3：Q3=A（fabric handle 抹平）——`fabricImageUrl` 特化删除，图片入边统一为 reference 顺序语义（§4 末段）。
- v3.1（缺口修复）：§0 新增 text 下游读取规则统一定义（消除 §1 与 §3 的两处不一致）；§1b 补超时/取消/重试与超长处置；§2 定 video 首帧缩略图与 outputVideos 语义；§5 新增评估绑定弱化口径。

## 0. text 节点的下游读取规则（全局唯一定义）

**任何下游消费者读取上游 text 节点时，一律读 `data.text`（用户已采纳的正文），不读 `outputText`。**

- 依据：plan.md §2.1 设计哲学「AI 只能提案，落笔由人」——`outputText` 是未采纳的提案，未经用户显式采纳不得进入任何下游运行。
- 适用面：image/video 节点的提示词组装（§1 第 1 步）与 text→text 串联（§1b 第 1 步）**同一规则**。
- 后果：text 节点跑过一次润色但用户**未点采纳**时，下游 text/image/video 运行仍用旧正文；UI 应在该 text 节点上展示「有未采纳提案」提示，但不阻断运行（P2-c 交互细节归 designer）。
- 本条是全文唯一定义点；graph-invariants.md §1 INV-2 注释与 test-sync-inventory.md 的相关断言描述统一引用本条。

## 1. 渲染器组装顺序（image 节点）

`executeStep` 中 `kind === "image"` 的统一路径，**严格按此顺序**：

1. **取用户提示词正文**：从执行计划的上游 text 边收集各 text 节点 `data.text`（读取规则见 §0，不读 `outputText`），按边顺序以 `\n\n` 拼接为 `userPrompt`。INV-2 已保证非空。
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

1. **输入组装**：上游 text 边各源节点的 `data.text`（读取规则见 §0，一律取已采纳正文，不取 `outputText`）按边顺序 + 自身 `text` 正文，以 `\n\n` 拼接为 `input`；`lastRunInput = input`（可追溯快照）。
2. **变体准入**：`promptVariantId → getGarmentPromptVariantById`，走同一 `promptRunAdmission`（R6 不变）；未选变体的 text 节点**不可运行**（仅作内容节点，运行按钮禁用，提示「先在悬浮窗口选择功能」）。
3. **组装**：`messages = [{ role: "system", content: variant.fullPrompt }, { role: "user", content: input }]`。
4. **调用**：文本 Provider 同步 chat completions（HTTP 请求内完成，不进 runQueue 异步骨架）；`modelId`/`modelOptions` 透传，modelOptions 走 R5 warning 通道。
5. **写回**：结果写 `outputText`；**`text` 字段永不覆盖**。节点状态机走 idle→running→success/error 全程（SSE 事件不变）。
6. **记录**：产生 `generation_runs`（`kind='text'`）+ `usage_events`（按 prompt/completion token 计量，复用现有计量骨架；`usage_events` 表保留，见 purge-runbook.md §1 与 plan.md §4.1 的 D1 裁定）。

**超时 / 取消 / 重试语义**（同步链路的完整口径）：

- **请求级超时**：文本 Provider 调用的 fetch 超时常量 `TEXT_RUN_TIMEOUT_MS = 60_000`（60s），写死在 Provider 适配层（与图片链路现有超时常量同位置），超时按 `failed` 处理，错误文案「文本模型响应超时」。
- **用户取消**：前端关闭页面/切换 tab 时 AbortController 中断 fetch；服务端请求已发出则结果写不回（HTTP 已断），**不产生 run 记录**（同步路径无 runQueue 落库点，请求中断即无记录）。
- **失败计费**：`billed=false` 的 failed 结果**不产生** usage_events 计量行（与图片链路现行口径一致）；`billed=true`（Provider 已计费但返回失败，如内容审核拦截）写一条 usage_events 记录作证据，run 记录 status=error。
- **重试**：不做自动重试（同步链路用户在场，重试=用户再点一次运行按钮）；UI 在 error 状态提供「重试」按钮（复用现有运行按钮，无新交互）。
- **为何不走 runQueue 异步骨架**：chat completions 延迟在秒级（gpt-5.3 典型 < 30s），HTTP 长连接可承受；图片链路走异步是因为生成耗时 30s–数分钟且需要轮询/取消/断点恢复，文本链路无此需求。进 runQueue 反而引入「run 记录与 HTTP 请求生命周期错配」的复杂度（请求结束后谁写回 outputText？需要额外轮询或 SSE 推送）。代价是：用户关页即丢失本次运行结果——可接受，因为同步链路的结果本来就没有跨会话恢复的语义承诺（与 image 链路的 run 历史恢复不同，text 运行的 outputText 是节点内字段，随文档保存）。

**超长处置**（`outputText` 与 `text` 共用 `MAX_TEXT_LENGTH = 20_000` 上限，见 data-model.md §3）：

- Provider 返回的 `outputText` 长度 > 20_000 时：**截断至 20_000 字符**并写回，同时在 RunEvent meta 附加 `truncated: true` 与原始长度，UI 在提案卡片上展示「输出超长已截断」标记（不拒绝——截断后的内容仍是有效提案，用户可决定是否采纳）。
- 「采纳」动作：把 `outputText` 复制进 `text` 时若超长（理论上截断后不会），按 schema 上限拒绝并提示。
- `lastRunInput` 不受 20_000 限制（追溯快照，完整保留；存储成本忽略）。
- **`outputText` 随文档持久化**：是。`outputText`/`lastRunInput` 都是 `TextNodeData` 字段，进 `DocumentSnapshot` 与 flow_json，随项目保存/加载/历史走（采纳前刷新页面不丢失提案）。

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
- **画布显示（定版：前端 `<video>` 首帧渲染，不做服务端抽帧）**：video 节点卡片用 `<video preload="metadata">` 元素渲染首帧缩略图，点击进入播放态。理由：避免引入 ffmpeg 服务端依赖（新运行时镜像/部署负担，且 `data/` 文件存储模式下抽帧产物还要再占一份存储）；代价是前端首帧渲染在低端机上有百毫秒级解码延迟，可接受（视频节点单页数量少）。若未来视频节点密度升高或需要列表页缩略图，再评估服务端抽帧（届时 ffmpeg 依赖与部署文档同步走 tech-stack 维护规则）。
- **`outputVideos: string[]` 的语义（定版：当前产物数组，非历史）**：与 image 节点的 `outputImages` 对齐——一次 run 的产出**覆盖写**该数组（当前视频 Provider 一次任务产出一个 MP4，数组长度恒为 0 或 1；保留数组形状是为与未来多产物 Provider 对齐，不为此做任何 UI/逻辑分支）。历史产物不保留在节点上，由 `generation_runs`/`generation_outputs` 与最近结果面板承载（与 image 同构）。
- 存储：本期仍落 `data/` 文件存储，对象存储二期（Q2=A）。视频单文件 5–50MB 落 `data/` 的容量/保留策略：**有意不设限**（用户裁定，2026-09-18 晚，经 orchestrator 中继）——不设保留期、不设容量上限、不加自动清理；磁盘监控属运维常规动作，不在本方案范围（plan.md §7.2 风险登记已按此口径记录）。

## 3. DAG 改动清单

| 函数 | 改动 |
|---|---|
| `buildExecutionPlan` | `extractOutputImages`/`extractParams` 重写为 3 分支；text 节点的下游读取按 §0 规则（一律 `data.text`），沿 text 边传递——`NodeExecution.upstream` 增加 `texts: string[]` 或在 params 注入，P2-b 定死其一 |
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

## 5b. 边顺序的用户可控性（Q3=A 后顺序即语义的配套能力）

Q3=A 裁定后，「参考图顺序」与「多 text 串联顺序」是**语义决定性**的（哪张是面料、哪段正文在前），因此顺序必须是用户可编辑的一等能力，而不是边创建顺序的副产品：

- **能力归属**：顺序编辑 UI 归 **image/video 节点的悬浮窗口**（Node Inspector Popover）内的「参考图列表 / 提示词来源列表」——按当前生效顺序展示缩略图/摘要，提供上移/下移（或拖拽）操作；操作实现为**重排该节点的入边数组**（数据层等价于按新顺序重建 edges，不涉及新字段）。
- **画布层**不提供独立的边排序交互（边上无可抓握的排序控件，强行加会破坏画布简洁性）；画布只保证 `edges` 数组顺序稳定持久化（现有行为已满足）。
- **失效提示**：顺序变更后，若节点声明了 `maskSourceRef`（绑定第一条图片入边）或系统提示词正文声明了位置角色（如「参考图 2 = 面料」），运行前检查按新顺序重新解析；悬浮窗口在顺序变更操作后展示一次性提示「顺序已变更，角色对应关系以新顺序为准」（i18n 键入 graph-invariants.md §4 的共享键清单）。
- **text 串联顺序**：同一机制，悬浮窗口的「提示词来源列表」承载（text 节点也展示该列表，列出其上游 text 边来源）。

## 5c. R5 放开后的评估绑定口径（治理后果，明文记录）

R5 放开 `modelOptions` 硬校验后，`contractHash` / `evaluationVersion` 仍随请求透传（评估绑定机制不变），但语义弱化为：

- **「该变体已评估」只覆盖发布时的推荐参数组合**（release registry 中登记的 `releaseVector` 对应的参数面）。用户自定义的 `modelOptions` 组合**不在既有评估证据覆盖范围内**——这不是缺陷，是 R5 裁定的直接后果。
- **UI 呈现义务**：悬浮窗口的模型参数区，当用户的 `modelOptions` 与变体发布时的 `recommendedOptions` 默认值不一致时，展示「自定义参数（未评估）」标记；等于默认值时展示「已评估参数」标记。该标记是纯信息展示，不阻断、不告警升级。
- **审计口径**：run 记录中的 `contractHash`/`evaluationVersion` 继续证明「这次运行绑定了哪个已评估变体」，不再隐含「这次运行的参数组合经过评估」。审计与计费对账时不得把 contractHash 当作参数合规证据。

## 5d. 变体撤销 / 目录版本推进时的存量节点语义（引用语义的边界）

plan.md §1.3 声明存量节点对目录修订「自动跟随」（引用语义）。release registry 的**撤销（revoke）**与目录**版本推进**是该语义的边界，口径如下：

- **变体被撤销（registry 中标记撤销）**：存量引用该变体的节点**运行时拒绝**——`promptRunAdmission` 准入检查 fail-closed（与现状一致：未发布/已撤销变体不可运行），节点错误徽标文案「所选功能已被撤销，请重新选择」。**不做自动回退**（自动改用户文档违反文档所有权原则）；节点数据中的 `promptVariantId` 保留不动，等待用户手动改选。
- **目录版本推进**（如变体 ID 从 `...generate.v2` 推进到 `...generate.v3`）：变体 ID 是稳定键，**版本推进 = 新增变体 ID + 旧 ID 走撤销流程**，不存在「同 ID 内容原地变更」。因此存量节点**钉住旧 ID**：旧 ID 已撤销时按上一条处理（运行拒绝 + 提示重选）；旧 ID 未撤销（并行期）则继续可用。
- **`contractHash` 对齐**：不存在对齐问题——`contractHash` 绑定的是 registry 中该变体 ID 的发布记录，变体 ID 不变则 hash 不变；变体 ID 撤销后准入已拒绝，不会带着过期 hash 进入运行。
- **目录正文修订但不改 ID**（如文案 typo 修复）：属「引用语义自动跟随」范围，存量节点下次运行即取新正文；`contractHash` 由发布链在修订时重新登记（release registry 追加该 ID 的新 release 记录，`evaluationVersion` 递增）。此路径要求发布链支持同 ID 多 release 记录（取最新一条为准）——**待确认**：现行 registry schema（`promptEvaluationReleaseRegistry.ts`）按 `variantId` 唯一键拒绝重复（`duplicate release key`），即当前实现不支持同 ID 多版本。P2-d 提示词目录重写时如需此路径，须先扩展 registry schema（升 `schemaVersion: 2`，同 ID 取 `generatedAt` 最新）；若保持「修订必改 ID」纪律，则无需扩展。**默认按后者执行（修订必改 ID），前者仅在治理流程明确要求时启动。**

## 6. R5 warning 通道

`assertPlanInputs` 与 `workflowSchema` 收集的 modelOptions warnings 经 RunEvent meta 新字段 `parameterWarnings?: string[]` 透传到前端，节点上以警示图标展示。**不进入错误通道，不阻断状态机。**
