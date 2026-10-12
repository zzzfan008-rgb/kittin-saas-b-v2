# 提示词改写层（文本模型通道）— 接口/契约设计

日期：2026-10-12
分支：fix/r100-comments-1-3
状态：方案评审稿（backend/frontend 落地前须先评审通过；本稿只定契约，不含实现代码）

---

## 0. 结论先行

- 新建一条 **OpenAI 兼容 chat-completions 文本通道**（server/lib/，复用 `config.apiyiApiKey()`，无需新密钥），模型 = `gemini-3.8-flash`（固定 `reasoning_effort:"medium"`，见下），模型 id 走配置项 + 进 `model-contracts.json` 契约。
- 改写层是**增强而非必经**：任何失败/超时/429/断连一律 fail-closed 回退「不改写、用原文跑」，绝不让改写层阻断出图。
- 两个入口共享同一改写核心：①运行时自动改写（runner 拼装前，非空 prompt 且 family 白名单 `model-tryon` 内才改写）；②`✨ 帮我补全` 按钮（新路由 `POST /api/text/rewrite`，鉴权走全局 `requireAuth`，只读项目 403）。
- 改写 system prompt **复用并扩展冻结表**（`prompt-polish:edit` 已含「服装视觉提示词编辑」骨架），新增六要素 + 不覆盖约束 + 禁负资产词，按 family 可选覆盖。
- 成本口径：一次 run 最多 1 次改写调用；连续运行按 user 时间窗限流；文本通道允许最多 1 次有限重试（与出图「不重试防重复计费」语义相反，理由见 §4）。

四项上游拍板已定（2026-10-12，hermes 确认，见 §7）：
1. 默认文本模型 id = `gemini-2.5-flash`（落地前 backend 再 lookup 核实）；
2. 运行时自动改写首期范围 = 仅 `model-tryon` 白名单；
3. 改写结果写回 = 补全按钮写回 text 节点 / 运行时改写不回写；
4. 评估证据 = 不独立保存「改写前/后」对照字段（run 快照已含最终 prompt）。

---

## 1. 背景与已核实代码事实

产品决策（已拍板，本稿只实现契约不改决策）：
- 方案 C = 运行时自动改写（A）+ 文本节点 `✨ 帮我补全` 按钮（B），按钮在 textarea 右下角带图标与标题。
- 用户输入优先：用户写了具体要求 → 改写只做补全/扩写（六要素：主体/环境/光线/镜头/色调/构图），绝不覆盖/篡改用户原话；用户没写 → 跳过改写直接跑。
- 视觉择优（多采样+视觉模型打分）本轮不做；改写模型用便宜文本模型；一次运行最多 1 次改写调用。

代码事实（已亲验，作插入点依据）：

| 事实 | 位置 |
|---|---|
| 全局鉴权中间件（会话 cookie） | `server/index.ts:96` `app.use("/api", requireAuth, requirePasswordChanged)` |
| 路由挂载点 | `server/index.ts:99-109`（`/api/generate` 有 `aiRateLimit`） |
| taskPrompt 拼装（改写插入点） | `server/engine/runner.ts:246` `taskPrompt = modeSystemText(kind,mode) + "\n\n" + userPrompt` |
| userPrompt 来源 | `runner.ts:241` `inputTextsOf(step)` → `inputTexts.join("\n\n")` |
| 冻结 system 文本表 | `server/lib/promptPresetsFrozen.ts`（`MODE_SYSTEM_TEXT` + `PRESET_TEMPLATE_TEXTS`，sha256 快照锁定，测试 `tests/prompt-presets-frozen.test.ts`） |
| 已有改写素材 | `promptPresetsFrozen.ts` `"prompt-polish:edit"` / `"prompt-generate:generate"`（「服装视觉提示词编辑/作者」文本，含「保留原意、补充构图光线背景质感、不臆造、只输出连续正文」骨架） |
| 出图 provider 重试语义 | `server/providers/base.ts:310-383` `fetchWithRetry`（不重试、超时/断连抛 `outcome_unknown` 防重复计费） |
| 出图 provider 连接池 | `server/providers/apiyiTransport.ts`（undici `Agent`，`getApiyiDispatcher()`） |
| 配置项 | `server/config.ts:44-45` `apiyiBaseUrl/apiyiApiKey`，`:75` `aiTimeoutMs` |
| 客户端文本节点 | `src/components/nodes/TextNode.tsx`（textarea `:167-188`；`TextNodeData extends BaseNodeData`，无生成语义字段） |
| 节点 kind / 生成语义归一 | `src/types/workflow.ts:17-22`（`image-generator`/`video-generator`）、`:58` `generationKindOf` |
| 参考图尾巴渲染 | `src/lib/providerPromptRenderer.ts`（`参考图:参考图1…`） |

API易知识门（§5 已执行）：`npm run docs:apiyi:kb:check` 通过（快照 2026-09-18，2799 页）；`docs:apiyi:search` 确认存在 `POST /v1/chat/completions`（OpenAI 兼容、Bearer 同 key、400+ 模型一个令牌、请求 `{model,messages,temperature,max_tokens,top_p,n,stream,stop,…}`、响应 `{choices[].message.content,finish_reason,usage}`、错误 400/401/429/500 `ErrorResponse{error.message/type/code}`）。快照模型示例含 `gemini-2.5-flash`/`gemini-2.5-pro`/`gemini-2.0-flash`/`claude-3-5-haiku`/`gpt-4o-mini` 等便宜文本模型；**不含 `gemini-3.5-flash`**。

---

## 2. 契约表

### 2.1 文本通道客户端（server 内部，非 HTTP 路由）

模块：新建 `server/lib/textChat.ts`（薄 chat-completions 客户端，纯传输，不含改写业务）。

```
type TextChatCompletionArgs = {
  model: string;                  // 来自 config.apiyiTextModelId()，默认 "gemini-3.8-flash"
  messages: { role: "system" | "user"; content: string }[];
  reasoningEffort?: "low" | "medium" | "high";  // 默认 "medium"（用户拍板）；禁止 "minimal"（见 §7-1）
  temperature?: number;           // 默认 0.4（改写要确定性，低于 chat 默认 1）
  maxTokens?: number;             // 默认 512（改写输出是中文提示词，够用）
  timeoutMs?: number;             // 默认 config.aiTextTimeoutMs()
};

type TextChatCompletionResult = {
  content: string;                // choices[0].message.content（trim 后）
  finishReason: string;           // stop | length | content_filter | …
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
};
```

错误语义（契约，机检可断言）：
- 网络错误 / 连接断 / 读取超时 → 抛 `TextRewriteError(code="text_transport_error")`，**可重试 1 次**（与出图相反，理由 §4）。
- HTTP 429 → 抛 `TextRewriteError(code="text_rate_limited")`，尊重 `Retry-After` 头（无头则 1s 退避），**可重试 1 次**。
- HTTP 400/401/403 → 抛 `TextRewriteError(code="text_request_rejected")`，**不重试**（配置/密钥问题重试无意义）。
- HTTP 500/502/503 → 抛 `TextRewriteError(code="text_upstream_error")`，**可重试 1 次**。
- 响应非 JSON / 缺 `choices[0].message.content` / 空内容 → 抛 `TextRewriteError(code="text_bad_response")`，**不重试**。

### 2.2 补全按钮路由

| 项 | 值 |
|---|---|
| 路由 | `POST /api/text/rewrite`（挂 `server/index.ts` `/api` 下，自动 `requireAuth` + `requirePasswordChanged`） |
| 入参 | `{ text: string; nodeId?: string; projectId: string }`（nodeId 用于服务端反查下游生成节点上下文，见下） |
| 出参（成功 200） | `{ rewritten: string }` |
| 出参（改写失败降级 200） | `{ rewritten: null, skipped: true }`（**返回 200 + null，不是 5xx**——改写失败不是请求失败，前端拿 null 保持原文） |
| 只读项目 | `403 { error: "只读项目不能改写提示词" }` |
| 入参校验失败 | `400 { error, code: "invalid_request" }`（text 非 string / 空 / 超长；projectId 缺失） |

服务端上下文反查（不用客户端传 kind/mode，避免前端伪造）：
- 若带 `nodeId`：服务端在 project 的 `flow.nodes` 中定位该 text 节点 → 找其 `prompt` 出边指向的 `image-generator`/`video-generator` 节点 → 取 `kind` + `operationMode` + `promptVariantId`（解析 familyId）。找不到下游 → 用默认上下文（`kind=image` 通用服装改写）。
- 若不带 `nodeId`：默认上下文。

### 2.3 运行时自动改写（无独立路由，runner 内）

插入点：`runner.ts:241`（`userPrompt` 算得之后、`:246` 拼装之前）。

**familyId 来源（2026-10-12 裁定，见 §7-2）**：v9 已删 variant 六字段，`ImageGeneratorNodeData` 当前无 familyId（仅 kind/operationMode/modelId/modelOptions/aspectRatio/batchSize），运行时 step 亦无 family 上下文。**白名单门控依赖 familyId，必须新增结构标识**——裁定采用 **A 机制：生成节点 data 新增可选 `familyId?: string`，模板实例化时落标**（`builtin-model-tryon` → `familyId:"model-tryon"` 等）。来源不是「从 promptVariantId 解析」（v9 已无 variant），也不是「从 text 正文反推族」（否决，理由见 §7-2）。

触发条件：`userPrompt 非空` 且 `step 对应生成节点 data.familyId ∈ REWRITE_ENABLED_FAMILIES`。

```
userPrompt 非空 且 data.familyId ∈ REWRITE_ENABLED_FAMILIES
  → rewritten = await textRewriter.rewrite(userPrompt, { kind, mode, familyId })
    → 成功且非空：taskPrompt 用 rewritten 作 userPrompt
    → 失败/空/超时：taskPrompt 用原始 userPrompt（fail-closed）
userPrompt 空 / familyId 缺失 / 不在白名单 → 跳过改写，直接用原文
```

改写结果**不进 modeSystemText**（system text 是冻结出图协议文本，语义不同）；改写只作用于 userPrompt 段。

白名单只约束「运行时自动改写」入口；`✨ 帮我补全` 按钮是用户手动触发、族无关，**不受白名单限制**（任意 text 节点均可点，family 缺失 → 用 default 改写提示词）。

**过渡态（familyId 落标未就绪前）**：`REWRITE_ENABLED_FAMILIES` 初始设为 `[]`（空集合 = 运行时自动改写全局关闭，fail-closed 安全），等 familyId 落标（A 机制，建议与「模板协议重写」任务合并同批落地）就绪后改为 `["model-tryon"]` 启用。空白名单下运行时改写自然跳过，不影响 ✨按钮与出图主链。

---

## 3. system prompt 归属与「不覆盖用户原话」的落地

归属：**冻结表扩展**，放 `server/lib/promptPresetsFrozen.ts` 新增独立常量（与 `MODE_SYSTEM_TEXT` 并列），不复用 `PRESET_TEMPLATE_TEXTS`（后者是「内置模板 text 节点正文」，语义不同）。

**定稿文本（用户 2026-10-12 拍板，逐字冻结；backend 照抄进冻结表，sha256 快照锁定，不得自行改措辞）：**

```
export const REWRITE_SYSTEM_PROMPTS: Readonly<Record<string, string>> = {
  // 默认改写提示词（无 family 命中时用；首期 model-tryon 未提供专用条目前亦用此条）
  "default": `你是一位服装视觉提示词的结构化优化编辑。你的唯一任务是在严格遵从用户要求的前提下，把用户输入优化为一段结构完整、可直接用于服装出图模型的中文提示词。

铁律（最高优先级，违反即失败）：
1. 用户明确写出的所有要求——包括服装品类、款式、颜色、面料、人物动作、姿势、表情、场景、环境、构图、风格等任何具体指令——必须原样保留，逐字不得删除、替换、弱化、否定或改写其含义；用户要求是最高优先级。
2. 你只做结构化补全与扩写：围绕主体、环境、光线、镜头、色调、构图六个维度补充用户没有提及但与用户要求不冲突的合理细节；严禁新增任何与用户输入相矛盾或改变用户意图的设定（例如用户写红色就不得改成别的颜色，用户写室内就不得加室外）。
3. 输出必须前后自洽：补全的各要素之间、补全内容与用户原话之间不得自相矛盾；若某个六要素按用户描述本就不适用（如纯色背景无环境细节），不要硬凑。

输出格式：只输出一段连续的中文正文，不要解释、不要分点、不要 Markdown 标题或列表符号。禁止使用「8K」「杰作」「大师级」「完美光线」「超高清」等无信息量的夸大词；不要添加文字、Logo、水印相关描述（除非用户明确要求图中文字）。`,
};
```

后续如需 model-tryon 专用条目，按同一铁律结构新增 `"model-tryon": …`（覆盖默认），同样逐字冻结 + 评审，不得在落地时临时撰写。

```
export function rewriteSystemPrompt(familyId: string | undefined): string; // 命中 family 覆盖表 → 该条；否则 "default"
```

选型：按 `familyId`（从 `promptVariantId` 解析，`promptPresetsFrozen.ts` 已有 `VARIANT_ID_PATTERN`）选改写提示词；未命中 → `default`。

「不覆盖用户原话」写进契约的方式（三级，可机检边界明确）：
1. **进 system prompt 文本**（硬约束句，冻结 sha256 锁定）——「只补全缺失六要素；不得删除、替换、改写、否定用户已明确表述的任何要素与措辞；用户指定的主体/颜色/款式/场景原样保留」。
2. **禁负资产词清单进 system prompt**——「不得使用 8K/杰作/大师级/完美光线/超高清 等无信息量夸大词」。
3. **机检边界**：system prompt 文本可 sha256 锁定（冻结测试）；「改写失败回退原文」「空跳过」「最多 1 次调用」是纯机检的。「不覆盖」的**模型行为正确性无法纯机检**，靠冻结 prompt + 评测样例（§6 单测点 e）覆盖，标注为「行为级验收，非结构级」。

---

## 4. 成本 / 限流 / 降级口径

| 口径 | 值 | 机检等价物 |
|---|---|---|
| 每 run 最多改写次数 | 1（常量 `MAX_REWRITE_CALLS_PER_RUN = 1`，runner 内计数断言） | 单测：mock 计数，第 2 次调用即 fail |
| 文本通道重试上限 | 1（仅 transport/429/5xx 可重试，见 §2.1） | 单测：mock 失败一次后成功→通过；失败两次→放弃 |
| 文本超时 | `config.aiTextTimeoutMs()` 默认 20_000ms（`AI_TEXT_TIMEOUT_MS` 环境变量） | config 单测 |
| 连续运行限流 | 独立 `textRewriteRateLimit`（per-user 时间窗，参考 `aiRateLimit` 形态，默认 20 次/分钟） | 限流中间件单测 |
| 断连计费 | 文本 token 计费且改写幂等 → **允许 1 次重试，接受可能双倍 token 成本**（远小于出图）；绝不无限重试 | §2.1 错误语义 |
| 最终降级 | 任何失败 → 回退原文（运行时）/ 返回 null（补全按钮） | 单测（§6） |

与出图 `fetchWithRetry`（不重试、`outcome_unknown` 防重复计费）**相反**的理由：出图单价高、结果不可重复、断连时结果可能已生成（重试=重复扣费）；文本改写单价低、幂等（同输入近似同输出）、断连不产生「已生成的高价值产物」，重试 1 次的成本可忽略且能显著提高可用性。

---

## 5. 插入点清单（file:line，后端/前端照此落地）

| 变更 | 位置 | 域 |
|---|---|---|
| 文本 chat 客户端 | 新建 `server/lib/textChat.ts` | backend |
| 改写业务核心（prompt 组装 + fail-closed + family 选型） | 新建 `server/lib/textRewriter.ts` | backend |
| 补全路由 | 新建 `server/routes/textRewrite.ts` + `server/index.ts:105` 后 `app.use("/api/text", textRewriteRouter)` | backend |
| 文本模型 id / 超时配置 | `server/config.ts`（`apiyiTextModelId`、`aiTextTimeoutMs`） | backend |
| 改写 system prompt | `server/lib/promptPresetsFrozen.ts` 新增 `REWRITE_SYSTEM_PROMPTS` | backend |
| 运行时自动改写 | `server/engine/runner.ts:241-246`（userPrompt 计算后、拼装前） | backend |
| 运行时改写 family 白名单 | `server/lib/textRewriter.ts` 常量 `REWRITE_ENABLED_FAMILIES`（初始 `[]`，familyId 落标后改 `["model-tryon"]`） | backend |
| familyId 落标（A 机制，跨端） | ① `src/types/workflow.ts:165` `ImageGeneratorNodeData` 新增 `familyId?: string`；② `server/lib/workflowSchema.ts:57` `GENERATION_FIELDS` 加 `"familyId"`；③ `src/lib/documentSnapshot.ts:319` 投影白名单加 `"familyId"`；④ 模板定义 `builtin-model-tryon`/`builtin-digital-model` 实例化时写入 `data.familyId`（`src/lib/workflowMenuMapping.ts:36` 映射的 templateId 对应模板） | frontend 首落类型，backend 同步字段清单 |
| 文本通道契约进 runtime contract | `docs/ai/apiyi/model-contracts.json` 新增顶层 `textModels` 节（`{ endpoint:"/v1/chat/completions", defaultModelId, timeoutMs, maxRetries }`） | backend |
| 补全按钮 UI | `src/components/nodes/TextNode.tsx:167` textarea 右下角（shadcn 原语 + 图标 + 标题；`disabled: readOnly`） | frontend |
| 补全客户端 | 新建 `src/lib/textRewriteClient.ts`（fetch `/api/text/rewrite`，拿 `rewritten` 写回 text 节点，走 `useCoalescedTextEdit` + flush 可 undo） | frontend |
| 客户端类型 | `src/types/` 新增改写请求/响应类型 | frontend |

跨域字段纪律：`TextNodeData`/`NodeKind` 等类型归 frontend（`src/types/workflow.ts` 首落）；server 侧经 `generationKindOf`（`workflow.ts:58`）复用，backend 不重复定义。改写请求/响应类型是**新契约**，由 architect 在本稿定形，两端按本稿实现（server 用运行时守卫读 raw，不 import 前端组件）。

---

## 6. 测试契约

单测（`server/`，mock 文本通道，`tests/text-rewriter.test.ts`）：
- a. 非空 prompt 改写成功 → 返回改写文本；
- b. 空 prompt → 不调用通道、返回原文（跳过）；
- c. 通道抛 transport/429/5xx → 回退原文（fail-closed）；抛 request_rejected → 回退原文（不重试）；
- d. 重试预算：mock 失败 1 次后成功 → 通过；连续失败 2 次 → 放弃并回退；
- e. system prompt 选型：familyId 命中/未命中 → 对应 prompt 文本；system prompt 含「不得删除/替换/改写」约束句与禁负资产词清单（行为级验收样例）；
- f. `MAX_REWRITE_CALLS_PER_RUN=1`：runner 集成单测 mock 计数，断言一次 run 至多 1 次改写调用。
- f2. familyId 白名单判定（A 机制就绪后）：mock step 携带 `data.familyId="model-tryon"` + 非空 prompt → 断言改写被调用；`familyId` 缺失 / 不在白名单 / 空白名单 `[]` → 断言改写**不**被调用且原文直通。
- g. 文本请求体断言（gemini-3.8-flash 思考控制）：mock fetch 捕获请求体，断言 `model==="gemini-3.8-flash"` 且 `reasoning_effort==="medium"`，且**不含** `"minimal"` 与 `thinkingBudget`（防止误写静默忽略参数或完全关闭）。

路由契约测试（`tests/text-rewrite-route.test.ts`，隔离 PostgreSQL runner）：
- 鉴权：未登录 401；只读项目 403；入参非法 400；成功 200 `{rewritten}`；改写失败 200 `{rewritten:null,skipped:true}`。

冻结测试扩展（`tests/prompt-presets-frozen.test.ts`）：`REWRITE_SYSTEM_PROMPTS` 各条文本与键集合 sha256 锁定（增删改即拦）。

客户端：补全按钮禁用态（readOnly）、写回可 undo、请求失败保持原文（frontend 单测，归 frontend）。

---

## 7. 已拍板项（2026-10-12 hermes 确认，落地口径）

1. 默认文本模型 id = `gemini-3.8-flash`（2026-10-12 用户拍板修订，替代原拟的 gemini-2.5-flash）。OpenAI 兼容端 `POST /v1/chat/completions`（base_url `https://api.apiyi.com/v1`，同 key，default/svip 分组可用）。**思考控制固定 `reasoning_effort:"medium"`**（用户拍板：关闭默认深度思考、推理强度 medium——语义=medium 档而非完全关闭）。文档实测事实（https://docs.apiyi.com/api-capabilities/gemini-3-8-flash/overview，获取 2026-10-12，快照 2026-09-18 不含此模型）：
   - OpenAI 兼容端 `reasoning_effort` 有效值仅 `low`/`medium`/`high`；**禁止传 `"minimal"`**（不报错、200，但参数被静默忽略、思考照常发生并计入输出计费）；
   - 完全关闭思考只有原生端点 `thinkingConfig:{"thinkingBudget":0}`——本契约不采用（用户语义是 medium 档，非完全关闭）；
   - 若落地改走 Gemini 原生端点 `/v1beta/models/gemini-3.8-flash:generateContent`，对应参数为 `generationConfig.thinkingConfig.thinkingLevel:"medium"`（同样**不得写 minimal**：原生端传 minimal 直接 400 `THINKING_LEVEL_MINIMAL`，更不得写 thinkingBudget:0 与 medium 语义矛盾）；
   - 定价 $0.75/$3.75 每 1M tokens（输入/输出含思考）；结构化输出两端均支持（OpenAI json_schema / 原生 responseSchema，实测逐字节相同），本期不使用（改写输出为自由连续正文）。
   - 落地前 backend 仍须 `docs:apiyi:search` + `docs:apiyi:lookup`（留 receipt）复核后写入 `model-contracts.json` 新增 `textModels` 节。
2. **运行时自动改写首期范围 = 仅 `model-tryon` 白名单**（验证一轮效果后按打磨节奏放开）；`✨` 补全按钮不受白名单限制。

   **familyId 来源裁定（2026-10-12，backend 落地硬冲突核实后）**：v9 已删 variant，`ImageGeneratorNodeData`/运行时 step 均无 familyId。三候选评估——
   - **A（推荐）**：生成节点 data 新增可选 `familyId?: string`，模板实例化落标（`builtin-model-tryon`→`"model-tryon"`）。忠实、显式、可机检、向前兼容；跨端面 = workflow.ts 类型 + workflowSchema.ts:57 字段清单 + documentSnapshot.ts:319 投影 + 模板定义打标（4 处，均为「加一个可选字段」机械改动）。与「模板协议重写」任务解耦（familyId 是纯标识，不依赖协议文本内容）。
   - **B（否决）**：运行时对照 text 正文是否以冻结族协议文本开头反推 family。否决理由：① `model-tryon` 协议文本当前**不存在**（`FROZEN_PRESET_FAMILY_IDS` 无此族，依赖「模板协议重写」先行落地，硬串行）；② family 是结构语义，从用户可编辑自由文本反推不可靠——用户删改协议文本或手动建节点（不用模板）则永远 miss、运行时改写静默失效；③ 协议文本重写即前缀变更，匹配逻辑双重维护。
   - **C（兜底）**：运行时自动改写延后到二期，本期只交 ✨按钮。用户拍板的是 A+B 两入口，延后需用户认可。
   - **落地安排**：本期（prompt-rewrite）交 ✨按钮 + 文本通道 + 改写核心（族无关部分）；`REWRITE_ENABLED_FAMILIES` 初始 `[]`（运行时改写关闭）；familyId 落标（A）与「模板协议重写」合并同批落地后就绪，届时白名单改 `["model-tryon"]`。若用户不接受 A 跨端面，则选 C。
3. **改写结果写回**：补全按钮 = 写回 text 节点（`useCoalescedTextEdit` + flush，可 undo）；运行时自动改写 = 只进本次 run 快照，**不回写**（不静默改用户正文）。
4. **评估证据**：不独立保存「改写前/后」对照字段（run 快照已含最终 taskPrompt，自然计入）。

---

## 8. 风险清单

| 风险 | 影响 | 缓解 |
|---|---|---|
| 改写层阻断出图（最高风险） | 用户 0 输入/微调出不了图，核心功能挂 | fail-closed 回退原文（§2.3/§4），任何异常吞掉；改写失败不返回 5xx（补全按钮 200+null） |
| 文本模型 id 漂移或思考参数被忽略（gemini-3.8-flash / reasoning_effort） | 上线即 400 或 minimal 被静默忽略仍计费 | §7-1：模型 id + reasoning_effort:"medium" 进 `model-contracts.json` textModels 节 + 落地前 lookup 核实 + 单测断言请求体含 medium、绝不含 minimal/thinkingBudget:0 |
| 成本放大（改写调用失控） | 文本虽便宜，滥用仍耗钱 | 每 run 1 次上限 + per-user 限流 + 重试 1 次上限 |
| 「不覆盖用户原话」被破坏 | 用户指定要素被篡改，出图违背意图 | system prompt 硬约束 + 冻结锁定 + 评测样例；仍属模型行为级风险，标注不可纯机检 |
| 运行时改写静默改语义 | 用户不知道 prompt 被改 | 建议运行时改写不回写节点（§7-3），改写只进 run 快照可追溯 |
| 六要素扩写引入幻觉要素 | 扩写臆造用户未提的元素 | system prompt「不臆造」约束 + 禁负资产词；沿用 prompt-polish 既有「不臆造」骨架 |
| 文本通道与出图通道共享 key | 单 key 泄露影响两通道 | 复用现有 key 管理（不外泄、不落日志，AGENTS §4）；无新密钥面 |

---

## 9. 被否决项

- 复用出图 `AIProvider` 接口（`base.ts`）：出图接口是「validate/adapt/generate 出图流」，与 chat 请求/响应/计费语义不同，强行复用会污染出图注册表。改新建薄 `textChat.ts` 客户端。
- 复用出图 `fetchWithRetry` 的不重试语义：出图「断连即 outcome_unknown 不重试」为防重复计费；文本改写语义相反（便宜幂等），复用会导致可用性无谓降低。改独立轻量重试（1 次上限）。
- 客户端传 kind/mode 给补全接口：易被伪造、且 text 节点本无生成语义字段。改服务端按 nodeId 反查下游生成节点。

---

## 10. 关联变更（用户 2026-10-12 拍板）：出图模型 gemini-3.1-flash-image → gemini-nano-banana-2.1

本节是与改写层同期的独立 provider 契约变更，**范围待用户最终确认（见 §10.3），确认前 backend 不得动出图模型面**。事实依据：API易上线页 `https://docs.apiyi.com/news/gemini-nano-banana-2-1-launch`（获取 2026-10-12；本地快照 2026-09-18 不含此模型）+ 代码亲验。

### 10.1 网关事实（上线页实测，落地前须 docs:apiyi:lookup 复核留 receipt）

- 新模型 id：`gemini-nano-banana-2.1`（GA，2026-10-06 发布；旧 id `gemini-3.1-flash-image` = Nano Banana 2，官方弃用表**无下线日期**，继续可用、价格不变）。
- 端点同构：`POST /v1beta/models/gemini-nano-banana-2.1:generateContent`（Gemini 原生），请求体与 3.1 同形：`contents[].parts` + `generationConfig.responseModalities:["IMAGE"]` + `imageConfig:{aspectRatio,imageSize}`；响应仍是 candidates[].content.parts[].inlineData（parts 顺序不固定，须遍历取最后一个 inlineData——现契约 `output.scanAllParts:true` 已满足）。
- 参数差异：**imageSize 仅 1K/2K/4K，不支持 512**（传 512 返回 400 不计费）；14 种宽高比（比例名同代，但部分比例像素尺寸与上代不同，如 8:1@1K=2928×352 vs 上代 3072×384——契约只存比例名时无影响，若有像素尺寸表须重核）；默认开思考（思考 token 计输出费，本期出图链路不暴露思考档位，走默认）；超时建议 360s（现契约 timeoutMs=360000，一致）。
- 定价：按次 $0.05（1K/2K/4K 同价）或按量（API易 $0.66/$13.2 每 M tokens），令牌计费模式二选一——**计费配置属账号/令牌面，不在代码契约内，待确认项目令牌走哪种**。

### 10.2 替换影响面（代码亲验清单，backend 落地照此）

| # | 位置 | 变更 |
|---|---|---|
| 1 | `src/types/imageModels.ts:10` | `IMAGE_MODEL_IDS` 中 `"gemini-3.1-flash-image"` → `"gemini-nano-banana-2.1"`（GenerationImageModelId 自动跟随） |
| 2 | `docs/ai/apiyi/model-contracts.json:587+` 模型条目 | id/gatewayModelId/upstreamModelId/vendorModelId 改名；generation/edit path 的 `{model}` 占位跟随；`imageSizes` 删除 `"512"`（1K/2K/4K）；`recommendedOptions.imageSize.default` 由 `"2K"` 保持、`examples` 同步删 `"512"`；aspectRatios 按 lookup 复核（14 种）；contractHash 重算；**9 处 expectedGatewayModelIds 全表数组同步改**（每模型条目内嵌全表） |
| 3 | `server/providers/apiyi.ts:482`（generate case）/ `:591`（edit case）/ `:660`（apiyiProviders 注册表） | 三处 case 列表/id 表替换为新 id；请求体同构，无需改拼装（3.1 与 3-pro/lite 共用分支，2.1 同形直接并入） |
| 4 | `src/types/imageModels.ts:291` 宽高比归一 case | case 列表替换 id（同 gemini 家族分支，只认契约 aspectRatios） |
| 5 | `src/lib/providerPromptRenderer.ts:40` | 参考图尾巴映射键替换（值 `"参考图:"` 不变） |
| 6 | `server/routes/aiDiagnostics.ts:91-92` | 诊断分支 case 替换；**同时改 `imageSize:"512"` 默认值 → `"1K"`**（nano-banana-2.1 不支持 512，传 512 会 400） |
| 7 | 旧项目持久化兼容 | 历史 flow 中已存的 `modelId:"gemini-3.1-flash-image"`：id 改名后会过不了模型 id 校验。参照 `src/types/retiredImageModels.ts`（grok-imagine-image 先例）处理——**旧 id 移入 RETIRED_IMAGE_MODEL_IDS 还是做 id 映射（v 迁移期 rewrite 为新 id）须拍板**（见 §10.3-2） |
| 8 | 评估提示面 | `docs/design/2026-09-23-evaluation-campaign/spec.md` 记录 3.1 为「未评估备选」；替换后新 id 同样未评估，节点「未完成评估」提示语义继承——无需改代码，记录在案 |
| 9 | 测试同步（快照/契约/用例 fixture） | `tests/` 中所有以 3.1 作 modelId 的 fixture 与断言同步换新 id（或改用一个仍在列表的模型）。已亲验涉及：`tests/provider-contract.test.ts:369/375/384/592`（`apiyiProviders["gemini-3.1-flash-image"]` 端点断言 `/v1beta/models/gemini-3.1-flash-image:generateContent` → 改新 id + 新端点路径）、`tests/project-tabs.test.ts:36/1442`（`GEMINI_TEST_MODEL_ID` 常量）、`tests/document-snapshot.test.ts:77/309/358/464/583/683`、`tests/initial-draft-client.test.ts:546`、`tests/project-tabs-session.test.ts:463`、`tests/five-node-model-ui.test.ts:77` |

不受影响（已亲验）：`DEFAULT_GENERATION_MODEL_ID` = `gpt-image-2.5-flare-vip`（imageModels.ts:145）；`MASK_REDRAW_MODEL_ID` = `gpt-image-2.5-sunburst`（:146）；内置模板/预设无任何业务代码引用 3.1（grep src/server 仅上述 1/3/4/5/6 结构点，无模板默认值）。

### 10.3 定稿（用户 2026-10-12 拍板 3 项 + architect 定稿旧 id 策略）

1. **替换范围（定）**：仅替换可选模型 `gemini-3.1-flash-image` → `gemini-nano-banana-2.1`；`DEFAULT_GENERATION_MODEL_ID` 保持 `gpt-image-2.5-flare-vip` 不动（`MASK_REDRAW_MODEL_ID` = sunburst 亦不动）。
2. **3.1 彻底下架（定，方案 A）**：`IMAGE_MODEL_IDS` / `model-contracts.json` 移除 `gemini-3.1-flash-image`。**旧项目持久化处理 = retired 不映射**：把 `"gemini-3.1-flash-image"` 加入 `src/types/retiredImageModels.ts` 的 `RETIRED_IMAGE_MODEL_IDS`，复用既有 retired-model 机制（`src/lib/promptRunAdmission.ts:171` reason「模型 X 已退出当前产品范围；系统不会静默换模，请手动选择新模型并重新确认提示词与参数」；`flowStore.ts:2027` 已把 retired 从有效模型排除）。**报错文案裁定**：沿用既有通用文案，**不新增指名「请改选 gemini-nano-banana-2.1」的硬编码**——`RETIRED_IMAGE_MODEL_IDS` 是多值列表，per-model 指名文案会破坏通用性、未来每退役一个模型都要加分支；「不静默换模 + 手动重选」语义已被既有 reason 完整覆盖。若产品确需指名引导，作为**可选 UI 增强**（节点侧维护「退役模型→推荐替换」映射表）单独评估，不进 admission 契约。
3. **计费模式（定）**：按量计费（API易 后台令牌配置，不影响代码；1K/2K 按量更低、4K 按次更低——本项目按量，若重度出 4K 可再评估切换）。
4. **删 512 档（定）**：`gemini-nano-banana-2.1` imageSize 仅 1K/2K/4K。契约 `imageSizes` 数组删 `"512"`、`recommendedOptions.imageSize.examples` 删 `"512"`、`server/routes/aiDiagnostics.ts:92` 默认值 `"512"` → `"1K"`。
5. **知识门（落地硬前提）**：backend 落地前必须 `docs:apiyi:lookup` 核实 `gemini-nano-banana-2.1` overview 完整参数页（端点 /14 比例 / 尺寸 1K-4K / 默认思考），留 receipt 写 `docs/ai/apiyi/consultations/`，再改 `model-contracts.json`；contractHash 与 9 处 `expectedGatewayModelIds` 全表数组走既有语义信封校验重算（`imageModels.ts:93-100` 加载即校验，改错即模块加载抛错，fail-closed 防线）。

落地顺序（backend 照做）：① lookup 留 receipt → ② imageModels.ts:10 + model-contracts.json 条目（含删 512、hash 重算）→ ③ apiyi.ts 三处 case → ④ imageModels.ts:291 宽高比归一 + providerPromptRenderer.ts:40 + aiDiagnostics.ts:91-92 → ⑤ retiredImageModels.ts 加旧 id → ⑥ tests/ 同步（§10.2-9 清单）→ ⑦ `npm run check` + `tsc --noEmit` + 相关测试 + `npm run gate:codex -- --base origin/main` 全绿。

## 11. 落地指令补充（orchestrator 2026-10-12，backend 必读）

1. **已批准先行落地全部不依赖 familyId 白名单的部分**：config(apiyiTextModelId/aiTextTimeoutMs)、server/lib/textChat.ts、REWRITE_SYSTEM_PROMPTS（§3 逐字）+ rewriteSystemPrompt、textRewriter 核心（familyId optional、命中→default）、✨按钮路由 POST /api/text/rewrite、model-contracts.json textModels 节（对齐既有 src/types/textModels.ts 体系）、及 §6 中不依赖白名单的全部测试。
2. **runner 运行时白名单门控 + §6-f 暂缓**：familyId 无来源（v9 删 variant 属实，已核实），机制待用户拍板（候选：E=冻结协议文本前缀匹配 / A=节点加 familyId 字段 / C=运行时改写延后）。**禁止自行发明 family 来源机制。**
3. 出图模型替换 §10 按既有排队任务在改写层交付后接续。

## 12. 门禁 FAIL 修复任务（reviewer gate:codex，2026-10-12；DM busy 以此为准）

基线：主分支 `fix/r100-comments-1-3` 最新 `79908d4`（改写层已 merge d477dfe）。**新修复请基于 79908d4 开新分支**（旧 feat/prompt-rewrite-backend 已改名 tmp-rewrite 停在 merge 提交，勿继续在其上叠加）。

### 12.1 P2：runner 自动改写未接入（dead code）
现状（已核实）：`server/engine/runner.ts` 无任何 rewrite 调用；`rewriteUserPrompt` 仅 POST /api/text/rewrite 消费；`isRewriteEnabledFamily` 零调用。dag.ts:375 已透传 `step.params.familyId`（仅 image-generator）。
实现 runner.ts:241-246 插入（userPrompt 算得后、taskPrompt 拼装前）：
- 仅 image-generator；`isRewriteEnabledFamily(step.params.familyId)` 真且 userPrompt 非空 → `await rewriteUserPrompt(userPrompt,{kind:step.kind,mode:operationMode,familyId:step.params.familyId})`，用 outcome.text；
- fail-closed 在 rewriteUserPrompt 内部，调用方不 try/catch；不命中/空→原文（零行为变化）；
- 每 run ≤1 次改写（测试锁）；不回写 data，只进 taskPrompt/run 快照。
测试：命中改写进 taskPrompt / family 缺失或非白名单不调通道 / 通道抛错用原文不阻断 / 空 prompt 跳过 / ≤1 次。

### 12.2 知识门：src/types/imageModels.ts 缺凭证（历史遗漏）
d73aa26（尺寸三档，早于本批合入）改了该 gated 文件但未出 receipt，guard --base origin/main --head HEAD 红。
修法：对 imageModels.ts 做零行为小改（补 JSDoc/提常量）使其成为 uncommitted change → `npm run docs:apiyi:lookup --query "gpt-image-2.5-flare-vip / sunburst-vip 输出像素尺寸 sizes 清单与 quality 取值" --paths src/types/imageModels.ts --receipt docs/ai/apiyi/consultations/vip-size-tiers.json --decision "VIP 系尺寸三档像素值取自 model-contracts sizes 清单；3:4=1536x2048；仅 flare-vip/sunburst-vip 提供档位"` → 与 runner 修复提交 → guard（base 新分支基点，head HEAD）必须同时覆盖 imageModels.ts 与 runner.ts。
