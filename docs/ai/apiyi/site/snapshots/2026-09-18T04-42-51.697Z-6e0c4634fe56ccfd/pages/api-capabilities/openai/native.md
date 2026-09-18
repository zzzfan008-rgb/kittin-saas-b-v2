> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Responses API 原生调用指南

> 通过 API易 调用 /v1/responses：状态管理、推理参数、内置工具、语义化流式事件。OpenAI 官方推荐新项目首选的端点。

`/v1/responses` 是 OpenAI 当前的原生主力端点。官方原话："While Chat Completions remains supported, **Responses is recommended for all new projects**." API易 完整支持该端点，base\_url 换成 `https://api.apiyi.com/v1` 即可。

本页基于 OpenAI 官方文档整理（`developers.openai.com/api/docs`，2026年6月数据），示例均可直接复制运行。

## 为什么用 Responses

相比 Chat Completions，官方给出的三个硬数字：

* **推理更强**：同一个推理模型走 Responses 端点，SWE-bench 成绩提升约 3%（推理状态跨轮保持）
* **缓存更省**：缓存利用率比 Chat Completions 高 40%–80%（官方内部测试），输入账单直接受益
* **工具更多**：`web_search`、`code_interpreter` 等内置工具只在 Responses 提供

什么时候仍然选 Chat Completions：你在用现成框架（LangChain、各类客户端默认走 `/v1/chat/completions`），或需要用同一套代码调 Claude、Gemini 等非 OpenAI 模型 —— 见 [兼容模式调用](/api-capabilities/openai/compatible)。

<Note>
  被弃用的是 **Assistants API**（官方计划 2026年8月26日 关停），不是 Chat Completions。两个端点都会长期支持，只是新功能优先落在 Responses。
</Note>

## 快速开始

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "input": "用一句话介绍你自己",
      "instructions": "你是一个简洁的助手"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.responses.create(
      model="gpt-5.4",
      input="用一句话介绍你自己",
      instructions="你是一个简洁的助手"
  )

  print(response.output_text)  # SDK 提供的便捷字段，自动拼接文本输出
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: '用一句话介绍你自己',
    instructions: '你是一个简洁的助手'
  });

  console.log(response.output_text);
  ```
</CodeGroup>

<Tip>
  取结果优先用 `response.output_text`，不要手写 `output[0].content[0].text` —— 推理模型的 `output` 数组第一项往往是 `reasoning` 而不是 `message`，手写下标会取错。
</Tip>

## 请求参数速查表

| 参数                     | 类型             | 默认值    | 说明                                                            |
| ---------------------- | -------------- | ------ | ------------------------------------------------------------- |
| `model`                | string         | 必填     | 如 `gpt-5.4`、`gpt-5.5`                                         |
| `input`                | string / array | 必填     | 用户输入，支持多模态 content 数组                                         |
| `instructions`         | string         | null   | 系统指令（相当于 system prompt）                                       |
| `max_output_tokens`    | int            | null   | 最大输出 token（含推理 token）                                         |
| `reasoning`            | object         | medium | `{"effort": "none/low/medium/high/xhigh"}`                    |
| `text`                 | object         | —      | `format`（输出格式）、`verbosity`（low/medium/high）                   |
| `tools`                | array          | \[]    | 函数 + 内置工具                                                     |
| `tool_choice`          | string         | "auto" | `auto` / `required` / `none` / 指定工具                           |
| `parallel_tool_calls`  | boolean        | true   | 是否允许并行工具调用                                                    |
| `store`                | boolean        | true   | 服务端保留响应对象 —— ⚠️ **API易 下不可用**，见下方多轮对话一节                       |
| `previous_response_id` | string         | null   | 链式引用上一个响应 —— ⚠️ **API易 下不生效**，多轮请用 `input` 数组自带历史             |
| `conversation`         | string         | null   | 持久会话对象 —— ⚠️ **API易 下不支持**（`/v1/conversations` 返回 404）        |
| `background`           | boolean        | false  | 异步后台执行（长任务 / Pro 模型）                                          |
| `stream`               | boolean        | false  | 流式输出（语义化事件）                                                   |
| `prompt_cache_key`     | string         | null   | 缓存路由键，提高命中率，见 [缓存计费](/api-capabilities/openai/prompt-caching) |
| `metadata`             | object         | {}     | 自定义元数据                                                        |

<Warning>
  gpt-5 系列推理模型**不支持 `temperature` / `top_p`**，传了会报错。控制输出风格请改用 `reasoning.effort` 和 `text.verbosity`。
</Warning>

## 响应结构

`output` 是一个 item 数组，常见三种类型：`reasoning`（推理摘要）、`message`（文本回复）、`function_call`（函数调用请求）。精简后的响应示例：

```json theme={null}
{
  "id": "resp_abc123",
  "object": "response",
  "status": "completed",
  "model": "gpt-5.4-2026-03-05",
  "output": [
    { "type": "reasoning", "summary": [] },
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "你好！我是一个 AI 助手。" }]
    }
  ],
  "usage": {
    "input_tokens": 24,
    "input_tokens_details": { "cached_tokens": 0 },
    "output_tokens": 58,
    "output_tokens_details": { "reasoning_tokens": 40 },
    "total_tokens": 82
  }
}
```

`usage` 里两个值得盯的字段：

* `input_tokens_details.cached_tokens`：命中缓存的输入量（按 0.1× 计费）
* `output_tokens_details.reasoning_tokens`：推理消耗（按输出价计费，调低 `reasoning.effort` 可控）

## 多轮对话：自己维护历史

经 API易 调用 Responses API，多轮请**把完整历史作为 `input` 数组传入**（每条带 `role` / `content`），与 Chat Completions 的做法一致：

```python theme={null}
resp = client.responses.create(
    model="gpt-5.4",
    input=[
        {"role": "user", "content": "我叫 Alice，请记住。"},
        {"role": "assistant", "content": "好的，我记住了，你叫 Alice。"},
        {"role": "user", "content": "我叫什么名字？"},
    ],
)
print(resp.output_text)  # 会回答 Alice
```

<Warning>
  **服务端会话状态在 API易 下不可用，请勿依赖。** 经网关实测（多模型、含延迟重试）：

  * `previous_response_id`：传了不报错（返回 200），但下一轮**不会记得**上一轮内容（`input_tokens` 仅为本轮量，未带入历史）；
  * `GET /v1/responses/{id}`：返回 400，**无法取回**已存响应；
  * `conversation` 持久会话对象（`/v1/conversations`）：返回 404，**不支持**。

  因此 `store` / `previous_response_id` / `conversation` 这几个服务端状态参数在 API易 上均**不要使用**，请统一采用上面的「`input` 数组自管理历史」方式。完整跨格式说明见 [多轮对话实现指南](/api-capabilities/multi-turn-conversation)。
</Warning>

<Warning>
  **多轮不省输入费**：每轮把完整历史重新发送，全部上下文按输入 token 全量计费。长对话省钱靠的是缓存折扣（历史前缀自动命中 0.1× 缓存价）—— 详见 [缓存计费](/api-capabilities/openai/prompt-caching)。
</Warning>

## 推理与输出控制

### reasoning.effort 档位选型

| 档位           | 适用场景                             |
| ------------ | -------------------------------- |
| `none`       | 简单问答、格式转换，要快要便宜                  |
| `low`        | 常规对话、摘要                          |
| `medium`（默认） | 日常开发的均衡选择                        |
| `high`       | 复杂代码、多步推理                        |
| `xhigh`      | 最难的题，配合 `gpt-5.5` / `gpt-5.4` 使用 |

```python theme={null}
response = client.responses.create(
    model="gpt-5.5",
    input="证明根号2是无理数",
    reasoning={"effort": "xhigh"}
)
```

### text.verbosity 输出长度

`low` / `medium`（默认）/ `high` 控制回答详略，仅 Responses 端点支持：

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="解释什么是闭包",
    text={"verbosity": "low"}  # 给简短版本
)
```

## 流式输出

Responses 的流式是**语义化事件**，不是 Chat Completions 那种 `choices[0].delta` 通用块。核心事件：

| 事件                                       | 含义                                           |
| ---------------------------------------- | -------------------------------------------- |
| `response.created`                       | 响应开始                                         |
| `response.output_item.added`             | 新增一个 output item（message / function\_call 等） |
| `response.output_text.delta`             | 文本增量                                         |
| `response.function_call_arguments.delta` | 函数参数增量                                       |
| `response.completed`                     | 全部完成（含最终 usage）                              |
| `error`                                  | 出错                                           |

```python theme={null}
stream = client.responses.create(
    model="gpt-5.4",
    input="写一首关于秋天的短诗",
    stream=True
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
    elif event.type == "response.completed":
        print("\n\n用量:", event.response.usage)
```

## 内置工具一览

内置工具是 Responses 独有能力，在 `tools` 数组里声明即可，无需自己实现执行逻辑：

| 工具     | type 值             | 说明                                                                                                        |
| ------ | ------------------ | --------------------------------------------------------------------------------------------------------- |
| 网页搜索   | `web_search`       | 模型自主联网检索                                                                                                  |
| 文件搜索   | `file_search`      | 检索已上传的向量库                                                                                                 |
| 代码解释器  | `code_interpreter` | 沙箱里跑 Python                                                                                               |
| 计算机使用  | `computer_use`     | 操作虚拟桌面                                                                                                    |
| 远程 MCP | `mcp`              | 连接远程 MCP 服务器                                                                                              |
| 图像生成   | `image_generation` | 内嵌生图。**API易 不建议**用此工具出图（按次固定收费、稳定性无法保证），请走 [Images API](/api-capabilities/gpt-image-2/text-to-image) 按量计费 |
| 工具搜索   | `tool_search`      | 海量工具动态检索（gpt-5.4 及之后模型）                                                                                   |

`web_search` 最小示例：

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="今天有哪些重要的 AI 新闻？",
    tools=[{"type": "web_search"}]
)
print(response.output_text)
```

<Info>
  内置工具依赖 OpenAI 服务端执行，API易 通道对各内置工具的透传支持情况以实测为准。函数调用（自定义工具）完整支持，见 [FC函数调用](/api-capabilities/openai/function-calling)。
</Info>

## Pro 模型与 background 模式

`gpt-5.4-pro`、`gpt-5.5-pro` 是面向专业场景的深度推理模型（\$30 / \$180 每百万 tokens，仅 **svip 分组**可用），实务上**仅通过 `/v1/responses` 调用**。单次请求耗时可达分钟级，建议配合 `background: true` 异步执行：

```python theme={null}
# 提交后台任务
response = client.responses.create(
    model="gpt-5.4-pro",
    input="对这份架构方案做深度评审：...",
    background=True
)

# 轮询取回结果
import time
while response.status in ("queued", "in_progress"):
    time.sleep(10)
    response = client.responses.retrieve(response.id)

print(response.output_text)
```

<Warning>
  Pro 模型价格高、速度慢，定位是"花几分钟换一个更靠谱的答案"。日常开发请用 `gpt-5.4` / `gpt-5.5`，没有明确的深度推理需求不建议上 Pro。
</Warning>

## 支持的模型与价格

| 模型                  | 输入（每 1M tokens） | 输出（每 1M tokens） | 说明                                                    |
| ------------------- | --------------- | --------------- | ----------------------------------------------------- |
| `gpt-5.6-sol`       | \$4.00          | \$20.00         | 最新旗舰，1M 上下文，`gpt-5.6` 别名指向它；9/3 起降价，优惠期至少到 2026/11/21 |
| `gpt-5.6-terra`     | \$2.50          | \$15.00         | 5.6 系列均衡主力                                            |
| `gpt-5.6-luna`      | \$1.00          | \$6.00          | 5.6 系列轻量款                                             |
| `gpt-5.4`           | \$2.50          | \$15.00         | 上代主力，1M 上下文                                           |
| `gpt-5.4-mini`      | \$0.75          | \$4.50          | 轻量高性价比                                                |
| `gpt-5.5`           | \$5.00          | \$30.00         | 上代旗舰，复杂推理                                             |
| `gpt-5.2`           | \$1.75          | \$14.00         | 上代主力                                                  |
| `gpt-5.1` / `gpt-5` | \$1.25          | \$10.00         | 价格友好                                                  |
| `gpt-5.4-pro`       | \$30.00         | \$180.00        | 仅 svip，仅 responses，专业场景                               |
| `gpt-5.5-pro`       | \$30.00         | \$180.00        | 仅 svip，仅 responses，专业场景                               |

日期固定版本（如 `gpt-5.4-2026-03-05`）同步在售，价格与主版本一致。完整列表见 [模型与价格总览](/api-capabilities/model-info)。

## 与 Chat Completions 对照

<Warning>
  **GPT-5.4 及之后的模型（含 `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna`）在 `/v1/chat/completions` 上，「工具调用 + 显式推理档位」可能被上游拒绝**：请求带 `tools` 且**显式**传了非 `none` 的 `reasoning_effort` 时会报 400 `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`。这是 OpenAI 的官方限制，本页的 `/v1/responses` 端点没有此限制——这类模型做工具调用请直接用 Responses。

  是否触发**取决于请求落到哪条上游链路**，同一个模型可能这次 200、下次 400，所以不能靠「我这次没报错」判断安全。实测数据、两条出路的取舍与完整迁移步骤见 [端点选型与迁移](/api-capabilities/openai/responses-migration)。
</Warning>

从 `/v1/chat/completions` 迁移过来的字段映射：

| Chat Completions                       | Responses                              | 说明               |
| -------------------------------------- | -------------------------------------- | ---------------- |
| `messages` 数组                          | `input`                                | 简单场景直接传字符串       |
| `messages[0]` 的 system                 | `instructions`                         | 独立参数             |
| `max_tokens` / `max_completion_tokens` | `max_output_tokens`                    | —                |
| `response_format`                      | `text.format`                          | —                |
| 顶层 `reasoning_effort`                  | `reasoning.effort`                     | Responses 里是嵌套对象 |
| `choices[0].message.content`           | `output_text`                          | 取结果              |
| 无状态，自己拼历史                              | 同样自己拼历史（`input` 数组）⚠️ 服务端状态在 API易 下不可用 | —                |
| `usage.prompt_tokens`                  | `usage.input_tokens`                   | 字段名不同            |

<CodeGroup>
  ```python Chat Completions（旧） theme={null}
  response = client.chat.completions.create(
      model="gpt-5.4",
      messages=[
          {"role": "system", "content": "你是一个简洁的助手"},
          {"role": "user", "content": "你好"}
      ]
  )
  content = response.choices[0].message.content
  ```

  ```python Responses（新） theme={null}
  response = client.responses.create(
      model="gpt-5.4",
      input="你好",
      instructions="你是一个简洁的助手"
  )
  content = response.output_text
  ```
</CodeGroup>

## 客户端支持现状

为什么 Cline、Trae 等 VS Code 系 IDE / 插件大多只支持 `/v1/chat/completions`，不支持本页的 Responses 端点？

* **chat/completions 是事实上的行业通用协议**：第三方网关、本地推理框架（Ollama / vLLM / LM Studio）、各家非 OpenAI 厂商全都实现它，客户端写一套处理逻辑就能接几百家供应商；而 `/v1/responses` 目前基本是 OpenAI 专属方言
* **Responses 不是「换个 URL」**：语义化事件流（不是 delta 拼接）、item 化输出、推理状态传递都与 chat/completions 完全不同，客户端需要重写整个 agent 循环，维护成本高
* **鸡生蛋问题**：客户端不做，是因为大多数自定义端点（网关）不支持 responses；网关反过来也不急着做。API易 已托管 `/v1/responses`（即本页），不存在网关侧障碍

截至 2026 年 7 月的主流客户端支持情况：

| 客户端                                           | Responses 支持  | 说明                                                                                                                                     |
| --------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Codex CLI](/scenarios/programming/codex-cli) | ✅ 原生          | OpenAI 官方出品，agent 循环整个建在 Responses 上，2026 年初已弃用 chat/completions                                                                       |
| [opencode](/scenarios/programming/opencode)   | ✅             | OpenAI provider 默认走 Responses                                                                                                          |
| [Roo Code](/scenarios/programming/roo-code)   | ✅（止步 gpt-5.4） | 「OpenAI」provider 走 Responses 且支持自定义 Base URL（「OpenAI Compatible」仍是 chat/completions）；已停更，预置模型止步 `gpt-5.4`；可作为插件装进 Trae 等 VS Code 系 IDE |
| Continue                                      | ✅             | gpt-5 / o 系默认走 responses；已被 Cursor 收购，独立产品收尾中                                                                                          |
| [Cline](/scenarios/programming/cline)         | ❌             | OpenAI Compatible 方式固定 chat/completions，社区 feature request 尚未落地                                                                        |
| [Trae](/scenarios/programming/trae)           | ❌             | 自定义模型仅 chat/completions 与 messages 两种端点                                                                                                |

需要 GPT-5.4+「推理 + 工具调用」的场景，首选 Codex CLI / opencode，Base URL 指向 `https://api.apiyi.com/v1` 即可；只用到 `gpt-5.4`、又想留在 VS Code 系 IDE（含 Trae）里的，可装 Roo Code 插件并选 OpenAI provider。

## 常见问题

| 现象                                                                | 原因与处理                                                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model_not_supported` 报错                                          | 该模型不支持 responses 端点，换 gpt-5 系列                                                                                                                                            |
| 多轮不记得上文                                                           | 最稳的做法是用 `input` 数组自带完整历史；`previous_response_id` 链式 2026-09-02 实测可用，但 `GET /v1/responses/{id}` 回取仍不可用，依赖前请在自己的分组验一次                                                        |
| `output_text` 为空                                                  | 输出全是 `function_call` item（模型在要求调函数），检查 `output` 数组逐项处理                                                                                                                    |
| 传 `temperature` 报错                                                | gpt-5 推理模型不支持，删掉改用 `reasoning.effort`                                                                                                                                     |
| `Function tools with reasoning_effort are not supported ...`（400） | GPT-5.4+ 在 `/v1/chat/completions` 的官方限制（tools 与显式非 `none` 的 reasoning\_effort 互斥），改用本页 `/v1/responses` 端点即可，迁移步骤见 [端点选型与迁移](/api-capabilities/openai/responses-migration) |

## 相关链接

* 同组页面：[兼容模式调用](/api-capabilities/openai/compatible) · [端点选型与迁移](/api-capabilities/openai/responses-migration) · [缓存计费](/api-capabilities/openai/prompt-caching) · [FC函数调用](/api-capabilities/openai/function-calling)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
* OpenAI 官方迁移指南：`developers.openai.com/api/docs/guides/migrate-to-responses`
