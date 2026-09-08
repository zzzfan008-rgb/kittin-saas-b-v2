> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Interactions API 与 generateContent 对比

> 详解谷歌 Gemini 两种 API 范式的差异：端点、请求响应结构、状态管理、思考呈现与计费字段，附 API易 网关兼容性实测结论

2026 年 6 月起，谷歌将 **Interactions API** 定为 GA（正式可用）并推荐所有新项目使用，经典的 **generateContent API** 转为 legacy 但仍完全支持。官方文档（如 Nano Banana 图片生成页）已提供两种范式的切换开关，很多开发者因此困惑：两者差异是什么？经 API易 网关该用哪个？本文给出详细对比与实测结论。

<Info>
  **API易 网关当前状态（2026 年 7 月 4 日实测）**：暂不支持 Interactions API 中转——`/v1beta2/interactions` 与 `/v1beta/interactions` 路径均返回 404。经 API易 调用 Gemini 请继续使用 [generateContent 原生格式](/api-capabilities/gemini/native)，本站全部 Gemini 文档均基于该格式；后续网关支持 Interactions API 时会更新本页。
</Info>

## 两种范式是什么

**generateContent** 是经典的无状态接口：一次请求带全部上下文，一次响应返回全部结果，端点为 `POST /v1beta/models/{模型名}:generateContent`。谷歌称它"虽已被视为 legacy，但仍获得完整支持"。

**Interactions API** 是谷歌 2026 年 6 月 GA 的新接口，端点为 `POST /v1beta2/interactions`。它围绕核心资源 `Interaction`（一次完整的对话轮次或任务）设计，响应是一条按时间排列的**执行步骤（steps）时间线**——模型思考、工具调用与结果、最终输出都是显式的 step。官方明确：**今后主线模型之外的新模型、新 Agent 能力将优先在 Interactions API 上发布**（来源：`ai.google.dev/gemini-api/docs/interactions-overview`）。

## 核心差异总览

| 维度       | generateContent（经典）                                                                    | Interactions API（新）                                                                                             |
| -------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 端点       | `POST /v1beta/models/{模型名}:generateContent`                                            | `POST /v1beta2/interactions`                                                                                    |
| 输入结构     | `contents[].parts[]`（按角色组织的多模态 part）                                                   | `input`（字符串或内容块，模型名放请求体）                                                                                        |
| 输出结构     | `candidates[0].content.parts[]`                                                        | `steps[]` 时间线：`user_input` / `thought` / `function_call` / `function_result` / `model_output`                   |
| 多轮对话     | 客户端自行拼接**全量历史**逐轮重发                                                                    | `previous_interaction_id` 服务端续接（也可自带历史走无状态）                                                                     |
| 思考呈现     | `thoughtsTokenCount` 计数；图片模型的思考中间稿混在图片 parts 里返回                                       | 以 `steps`（`type: "thought"`）显式返回，含思考文本与临时图片                                                                     |
| 流式输出     | 专用端点 `:streamGenerateContent`                                                          | 同一端点，请求体加 `"stream": true`                                                                                      |
| 后台执行     | 不支持                                                                                    | `"background": true`，适合长任务                                                                                      |
| 缓存       | 显式缓存 + 隐式缓存                                                                            | 无显式缓存；`previous_interaction_id` 可显著提升隐式缓存命中率                                                                    |
| 服务端数据保留  | 不存储请求                                                                                  | 默认 `store: true`：付费层保留 **55 天**、免费层 1 天，可主动删除；`store: false` 退回无状态（但与 background、previous\_interaction\_id 不兼容） |
| usage 字段 | `promptTokenCount` / `candidatesTokenCount` / `thoughtsTokenCount` / `totalTokenCount` | `total_thought_tokens` / `total_output_tokens` 等（蛇形命名）                                                          |
| Agent 调用 | 不支持                                                                                    | 同一接口可直接调用 Deep Research、Antigravity 等官方 Agent                                                                   |
| 尚不支持的能力  | —（功能最全）                                                                                | Batch API、显式缓存、`video_metadata`、Python 自动函数调用、Gemini 3 远程 MCP                                                   |
| SDK 入口   | `client.models.generate_content`（google-genai）                                         | `client.interactions.create`（google-genai ≥ 2.3.0 / @google/genai ≥ 2.3.0）                                      |

<Note>
  Interactions API 的服务端状态管理有一个易踩的坑：`previous_interaction_id` **只续接对话历史**，`tools`、`system_instruction`、`generation_config`（含 `thinking_level`、`temperature` 等）都是"单次交互作用域"，每一轮都要重新传，否则不生效。
</Note>

## 请求与响应结构对比（文本单轮）

generateContent 示例可直接在 API易 网关使用；Interactions API 示例为官方直连端点（API易 暂不支持）：

<CodeGroup>
  ```bash generateContent（API易 可用） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{
        "parts": [{ "text": "Tell me a joke." }]
      }]
    }'
  ```

  ```bash Interactions API（官方直连） theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "input": "Tell me a joke."
    }'
  ```
</CodeGroup>

两者的响应结构差异（同一请求的两种返回形态）：

<CodeGroup>
  ```json generateContent 响应 theme={null}
  {
    "candidates": [
      {
        "content": {
          "parts": [{ "text": "Why did the chicken cross the road? ..." }],
          "role": "model"
        },
        "finishReason": "STOP",
        "index": 0
      }
    ],
    "usageMetadata": {
      "promptTokenCount": 4,
      "candidatesTokenCount": 12,
      "totalTokenCount": 16
    }
  }
  ```

  ```json Interactions API 响应 theme={null}
  {
    "id": "int_123",
    "status": "completed",
    "steps": [
      {
        "type": "user_input",
        "status": "done",
        "content": [{ "type": "text", "text": "Tell me a joke." }]
      },
      {
        "type": "model_output",
        "status": "done",
        "content": [{ "type": "text", "text": "Why did the chicken cross the road?" }]
      }
    ]
  }
  ```
</CodeGroup>

## 多轮对话对比

这是两者体验差异最大的地方。generateContent 每一轮都要把**完整历史**重新发一遍；Interactions API 只需带上一轮的 `id`：

<CodeGroup>
  ```bash generateContent（全量重发历史） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [
        { "role": "user",  "parts": [{ "text": "Hi, my name is Phil." }] },
        { "role": "model", "parts": [{ "text": "Hello Phil! How can I help?" }] },
        { "role": "user",  "parts": [{ "text": "What is my name?" }] }
      ]
    }'
  ```

  ```bash Interactions API（服务端续接） theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "previous_interaction_id": "int_123",
      "input": "What is my name?"
    }'
  ```
</CodeGroup>

服务端续接除了省去拼历史的代码，还能让隐式缓存更容易命中对话前缀，官方称可降低多轮场景的 token 成本。代价是数据默认存储在谷歌侧（付费层 55 天），对数据合规敏感的业务需评估 `store` 语义。

## 图片模型场景的差异

Gemini 3 系图片模型（如 `gemini-3-pro-image`）默认带思考过程，两种范式对"思考中间稿图片"的呈现完全不同：

* **generateContent（API易 网关现行格式）**：思考中间稿以**普通图片 part** 混在 `candidates[0].content.parts` 里返回（带 `thoughtSignature`、无 `thought` 标记），实测一次可返回 2–10 张、每张按 1120/2000 tokens 计入输出——解析时务必遍历 parts 并**取最后一张为最终稿**。完整实测与对账口径见 [usage 字段与输出解读](/api-capabilities/nano-banana-usage-metadata)。
* **Interactions API**：思考被显式化为 `type: "thought"` 的 steps（含思考文本与临时图片），最终图在 `model_output` step 中；SDK 另提供 `.output_image` / `.output_text` 便捷属性。交错图文输出（如图文并茂的故事）仍需手动遍历 steps。

## API易 网关兼容性实测

2026 年 7 月 4 日以测试 key 对 `api.apiyi.com` 的探测结果：

| 测试项                                                | 请求                      | 结果                      |
| -------------------------------------------------- | ----------------------- | ----------------------- |
| `POST /v1beta2/interactions` + Bearer 认证           | `gemini-2.5-flash` 最小请求 | ❌ 404（Invalid URL）      |
| `POST /v1beta/interactions` + Bearer 认证            | 同上                      | ❌ 404（Invalid URL）      |
| `POST /v1beta2/interactions` + `x-goog-api-key` 认证 | 同上                      | ❌ 404（Invalid URL）      |
| `POST /v1beta/models/{模型名}:generateContent`        | 文本/图片各模型                | ✅ 正常（本站全部 Gemini 文档基于此） |

**结论：API易 网关暂未开通 Interactions API 转发**，多轮续接、Agent 调用、后台执行等 Interactions 独有能力现阶段无法经网关使用。

## 开发者建议

1. **经 API易 调用：继续用 generateContent**。它功能最全（Batch、显式缓存、video\_metadata 反而只有它支持），且 generateContent 被官方承诺持续完整支持，短期内没有停用风险。
2. **多轮对话在 generateContent 下的写法**：客户端拼接历史即可，参考 [Gemini 原生格式调用](/api-capabilities/gemini/native) 与 [多轮对话](/api-capabilities/multi-turn-conversation)。
3. **如果你直连官方并考虑迁移到 Interactions API**，注意四点：`tools` / `system_instruction` / `generation_config` 每轮需重传；`store` 默认开启、付费层数据保留 55 天；Batch API 与显式缓存尚不可用；SDK 需升级 google-genai / @google/genai 到 2.3.0 以上。
4. **值得关注 Interactions API 的时机**：需要官方 Agent（Deep Research、Antigravity）、`background: true` 长任务、或多轮场景想靠服务端状态省 token 时。API易 支持后本页会第一时间更新。

## 相关文档

<CardGroup cols={2}>
  <Card title="Gemini 原生格式调用" icon="sparkles" href="/api-capabilities/gemini/native">
    经 API易 使用 generateContent 原生格式的完整指南
  </Card>

  <Card title="Gemini 响应处理" icon="braces" href="/api-capabilities/gemini/response-handling">
    candidates、parts、finishReason 的解析要点
  </Card>

  <Card title="usage 字段与输出解读" icon="receipt-text" href="/api-capabilities/nano-banana-usage-metadata">
    图片模型 usageMetadata 字段口径与思考中间稿实测
  </Card>

  <Card title="多轮对话" icon="messages-square" href="/api-capabilities/multi-turn-conversation">
    无状态接口下的多轮对话实现方式
  </Card>
</CardGroup>
