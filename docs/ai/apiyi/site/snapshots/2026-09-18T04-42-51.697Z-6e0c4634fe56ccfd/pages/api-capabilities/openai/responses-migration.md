> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 两个端点怎么选：GPT-5.4+ 迁移到 Responses

> GPT-5.4 起的模型在 /v1/chat/completions 上把工具调用和推理档位一起传，可能被直接 400 拒掉。这一页讲怎么确认自己撞上了、两条出路怎么选、代码逐字段怎么改（含带工具调用的完整前后对照）、以及改完怎么验证。

<Note>
  **一句话**：GPT-5.4 起的模型，在 `/v1/chat/completions` 上**同时传 `tools` 和显式的 `reasoning_effort`**（`none` 除外）可能被上游直接拒掉，报 400 `Function tools with reasoning_effort are not supported ...`。

  两条出路：**把带工具的请求改走 `/v1/responses`**（推理和工具都保留，推荐），或者**显式设 `reasoning_effort="none"`**（保住端点，但放弃推理）。不带 `tools` 的请求完全不受影响。
</Note>

## 先确认你是不是撞上了这条

有三种表现，第二种最容易误判。

### 表现一：明确的 400

```text theme={null}
Function tools with reasoning_effort are not supported for gpt-5.6-sol in
/v1/chat/completions. To use function tools, use /v1/responses or set
reasoning_effort to 'none'.
```

响应里 `param` 是 `reasoning_effort`。这是**上游 OpenAI 的官方限制**，不是 API易 网关的问题——同一段请求直连 OpenAI 官方也是这个结果。

### 表现二：时灵时不灵

同一个模型可能挂着多条上游链路，**这条限制并不是每条链路都会拦**。我们 2026-09-02 在默认分组实测（同一把 KEY、同一时段，每个组合各发 6 次）：

| 模型              | `tools` + `reasoning_effort="medium"` |
| --------------- | ------------------------------------- |
| `gpt-5.6-luna`  | 6/6 返回 400                            |
| `gpt-5.6-sol`   | 6/6 返回 200，工具正常调用                     |
| `gpt-5.6-terra` | 6/6 返回 200，工具正常调用                     |
| `gpt-5.4`       | 6/6 返回 200，工具正常调用                     |

而同一天早些时候，有客户在 `gpt-5.6-sol` 上实实在在收到了这条 400。

<Warning>
  **「我这次没报错」不能当作安全依据。** 同一个模型、同一段代码，换个时间点、换个分组就可能开始 400。要么改走 Responses，要么显式 `reasoning_effort="none"`——这两条在所有链路上都是稳定的。
</Warning>

### 表现三：没报错，但工具压根没被调用

如果模型该调工具却回了一句闲聊（`finish_reason` 是 `stop`、`tool_calls` 为空），先别急着调提示词：把 `reasoning_effort` 显式设成 `none` 重发一次，工具能正常调用，就说明问题出在这个参数组合上，而不是提示词写得不好。

## 这条限制的范围

|                                                                             | 是否受影响                       |
| --------------------------------------------------------------------------- | --------------------------- |
| `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4` 系列 | 受影响（取决于链路，见上）               |
| `gpt-5.2` / `gpt-5.1` / `gpt-5` 等更早的模型                                      | 不在官方公告的影响范围内                |
| Claude / Gemini / Grok 等非 OpenAI 模型                                         | 无关，不受影响                     |
| 请求里没有 `tools`                                                               | 不受影响，`reasoning_effort` 随便传 |
| 走 `/v1/responses` 端点                                                        | 不受影响，推理 + 工具可以同时用           |

触发条件是**显式传了非 `none` 的档位**。`low` / `medium` / `high` / `xhigh` 四个档位实测都会触发。

<Note>
  **不传 `reasoning_effort` 不会触发。** 在 `gpt-5.6-luna` 这条稳定复现 400 的链路上，四个档位全部 400，而不传该参数时 6/6 正常返回 `tool_calls`。所以最小改动的应急方案其实有两个：显式 `none`，或者干脆把这个参数删掉。
</Note>

## 两条出路怎么选

|        | 改走 `/v1/responses` | 显式 `reasoning_effort="none"` |
| ------ | ------------------ | ---------------------------- |
| 保留推理能力 | ✅ 完整保留，档位照传        | ❌ 关掉推理，模型少了规划这一步             |
| 改动量    | 请求 / 响应结构都要改，见下文   | 加一个参数，一行                     |
| 稳定性    | 所有链路一致             | 所有链路一致                       |
| 适合谁    | Agent、多步工具编排、长期方案  | 线上救火、工具逻辑简单、暂时改不动代码          |

带工具的复杂任务，推理关掉之后模型的表现会明显变差（少了「先想清楚该调哪个工具、按什么顺序调」这一步），所以 `none` 更适合当过渡手段。

## 不只是为了绕开报错

即使你没撞上这条限制，Responses 本身也是 OpenAI 给新项目的推荐端点。官方给出的差异是：同一个推理模型走 Responses 的 SWE-bench 成绩更高、缓存利用率比 Chat Completions 高一大截、`web_search` / `code_interpreter` 等内置工具只在这里提供。细节和数字见 [原生调用](/api-capabilities/openai/native)。

对账单最直接的是缓存那一条：**多轮 Agent 是缓存命中的最大受益者**，而多轮 Agent 恰恰也是最容易撞上本页这条限制的场景。缓存怎么算、怎么看命中，见 [缓存计费](/api-capabilities/openai/prompt-caching)。

## 你属于哪一类

| 你的接入方式                         | 走哪条路                                                                                                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **自己写代码**（OpenAI SDK / 裸 HTTP） | 直接改端点，见下一节                                                                                                                                                                                   |
| **用框架**（LangChain 等）           | 先查框架有没有 Responses 开关。LangChain 是 `ChatOpenAI(..., use_responses_api=True)`；没有开关的框架只能退到 `reasoning_effort="none"` 或换模型                                                                        |
| **用客户端 / IDE 插件**              | 客户端侧改不了，只能换支持 Responses 的客户端。完整支持清单见 [原生调用的「客户端支持现状」](/api-capabilities/openai/native)，Trae / Cline 的具体处理见 [Trae 接入](/scenarios/programming/trae) 与 [Cline 接入](/scenarios/programming/cline) |

## 代码怎么改

完整的字段映射表见 [原生调用](/api-capabilities/openai/native)。这里只讲**工具调用相关**的四处差异，因为这正是本页场景要动的部分：

|          | Chat Completions                             | Responses                                                 |
| -------- | -------------------------------------------- | --------------------------------------------------------- |
| 推理档位     | 顶层 `reasoning_effort="medium"`               | 嵌套 `reasoning={"effort": "medium"}`                       |
| tools 定义 | 嵌套：`{"type": "function", "function": {...}}` | 扁平：`{"type": "function", "name": ..., "parameters": ...}` |
| 调用返回     | `message.tool_calls[]`，标识是 `id`              | `output` 里的 `function_call` item，标识是 `call_id`            |
| 结果回传     | `{"role": "tool", "tool_call_id": ...}`      | `{"type": "function_call_output", "call_id": ...}`        |

<Warning>
  两套 tools 格式**不能混用**。把 Chat Completions 的嵌套 `function: {...}` 定义发给 `/v1/responses`（或反过来）是 SDK 报「参数无效」最常见的原因。更多细节见 [FC函数调用](/api-capabilities/openai/function-calling)。
</Warning>

同一个「查天气」工具循环，改前改后完整对照：

<CodeGroup>
  ```python 改前：Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "查询某地天气",
          "parameters": {
              "type": "object",
              "properties": {"city": {"type": "string"}},
              "required": ["city"],
          },
      },
  }]

  messages = [{"role": "user", "content": "北京今天天气怎么样？"}]

  resp = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",              # ← 与 tools 同传，可能被上游拒绝
  )

  call = resp.choices[0].message.tool_calls[0]
  messages.append(resp.choices[0].message)    # 助手那一轮原样接回
  messages.append({
      "role": "tool",
      "tool_call_id": call.id,
      "content": '{"temp": 26, "sky": "晴"}',
  })

  final = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",
  )
  print(final.choices[0].message.content)
  ```

  ```python 改后：Responses theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{                                  # 扁平结构，没有 function 这一层
      "type": "function",
      "name": "get_weather",
      "description": "查询某地天气",
      "parameters": {
          "type": "object",
          "properties": {"city": {"type": "string"}},
          "required": ["city"],
          "additionalProperties": False,
      },
  }]

  history = [{"role": "user", "content": "北京今天天气怎么样？"}]

  resp = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},         # ← 嵌套写法，这里不受限制
  )

  call = next(i for i in resp.output if i.type == "function_call")
  history += resp.output                      # 整个 output 原样接回历史
  history.append({
      "type": "function_call_output",
      "call_id": call.call_id,                # 注意是 call_id，不是 id
      "output": '{"temp": 26, "sky": "晴"}',
  })

  final = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},
  )
  print(final.output_text)
  ```
</CodeGroup>

两段代码都在 API易 默认分组实测跑通：改前那段稳定复现 400，改后那段正常走完「调用 → 回传 → 最终回答」全循环。

<Tip>
  `history += resp.output` 这一步别省。Responses 的 `output` 里除了 `function_call`，还可能有 `reasoning` item —— 把它原样带回下一轮，模型才能接着上一轮的思路继续，这也正是 Responses 在多步工具任务上更强的原因。
</Tip>

## 迁移时最容易踩的坑

<AccordionGroup>
  <Accordion title="response.output 不是 choices，别直接取 [0]">
    `output` 是一个 **item 数组**，里面可能同时有 `reasoning`、`message`、`function_call` 三类，顺序和数量都不固定。取文本用 `resp.output_text`，取工具调用要遍历筛 `type == "function_call"`，不要写死下标。
  </Accordion>

  <Accordion title="参数改名：max_tokens / response_format / temperature">
    `max_tokens`（或 `max_completion_tokens`）改成 `max_output_tokens`；`response_format` 改成 `text.format`；系统提示词可以从 `messages` 里拿出来放到顶层 `instructions`。另外 gpt-5 系列推理模型**不支持 `temperature` / `top_p`**，两个端点都一样，传了会报错，删掉改用 `reasoning.effort` 控制。
  </Accordion>

  <Accordion title="usage 字段名全变了">
    `usage.prompt_tokens` → `usage.input_tokens`，`completion_tokens` → `output_tokens`，缓存命中在 `usage.input_tokens_details.cached_tokens`。做用量统计的代码要一起改，否则会静默统计成 0。
  </Accordion>

  <Accordion title="多轮：自管历史永远可用，链式取决于分组">
    最稳的做法是**自己维护 `input` 数组**，把每轮的 `output` 原样接回去——这条在任何分组、任何模型上都成立，也是本页示例的写法。

    `previous_response_id` 链式在 2026-09-02 的默认分组实测可用（`gpt-5.6-sol` / `terra` / `luna` / `gpt-5.4` 均能记住上一轮，且 `store` 默认为 `true`；显式传 `store: false` 后再链式会正确报「找不到上一条」）。但 `GET /v1/responses/{id}` 回取历史仍不可用。**上线前请在你自己的分组里验一次**，别把它当作默认保证。相关背景见 [多轮对话指南](/api-capabilities/multi-turn-conversation)。
  </Accordion>

  <Accordion title="流式事件是语义化的，不是 delta 拼接">
    Chat Completions 流式是一串 `delta` 增量，Responses 是带类型的事件流（`response.output_text.delta`、`response.function_call_arguments.delta` 等）。流式解析逻辑要重写，不能沿用。写法见 [原生调用](/api-capabilities/openai/native)。
  </Accordion>
</AccordionGroup>

## 迁移后怎么验证

改完别只看 HTTP 200，按这四条过一遍：

<Steps>
  <Step title="确认 output 里真的有 function_call">
    打印 `[i.type for i in resp.output]`，应该能看到 `function_call`（推理档位高时前面还会有 `reasoning`）。只有 `message` 说明工具没被调用。
  </Step>

  <Step title="确认 usage 字段读到了值">
    检查 `usage.input_tokens` / `output_tokens` 不为 0，`output_tokens_details.reasoning_tokens` 能反映推理档位的变化。
  </Step>

  <Step title="确认缓存开始命中">
    多轮跑几次，看 `usage.input_tokens_details.cached_tokens` 是否大于 0。这是 Responses 相比兼容模式最直接的账单收益。
  </Step>

  <Step title="把原来会 400 的那个请求重跑一遍">
    同样的 `tools` + `reasoning_effort` 组合，走新端点应该稳定通过。留一条回归用例，之后换模型时能立刻发现问题。
  </Step>
</Steps>

## 什么时候可以不迁

不必一刀切。以下场景留在兼容模式完全合理：

* **根本不用工具调用** —— 这条限制与你无关，`reasoning_effort` 随便传
* **需要用同一套代码调多家模型** —— Claude、Gemini 等只有 `/v1/chat/completions` 这条通路，为 OpenAI 单独分叉未必划算
* **框架 / 客户端锁死了端点** —— 先用 `reasoning_effort="none"` 顶住，等框架跟进
* **用 `gpt-5.2` 及更早的模型** —— 不在影响范围内

兼容模式的完整能力边界见 [兼容模式调用](/api-capabilities/openai/compatible)。

## 常见问题

<AccordionGroup>
  <Accordion title="reasoning_effort=none 到底损失了什么？">
    模型不再做显式推理，直接输出。单步、工具选择明确的任务影响不大；多步编排、需要「先想清楚调用顺序」的 Agent 任务会明显变差。它适合当过渡，不适合当终态。
  </Accordion>

  <Accordion title="能不能只在带 tools 的请求上切端点？">
    可以，而且是常见的渐进式做法：普通对话继续走 `/v1/chat/completions`，只把带 `tools` 的那条链路改成 `/v1/responses`。两个端点用同一把 KEY、同一个 base\_url，价格也完全一致。
  </Accordion>

  <Accordion title="换端点之后价格会变吗？">
    不变。同一个模型在两个端点上的输入 / 输出单价一样，计费口径也一样。价格见 [模型与价格总览](/api-capabilities/model-info)。差别只在缓存命中率——Responses 通常更高，实际账单反而更省。
  </Accordion>

  <Accordion title="Claude、Gemini 受这条限制影响吗？">
    不受影响。这是 OpenAI 对自家 GPT-5.4+ 模型的限制。Claude 走 `/v1/messages` 或兼容模式、Gemini 走原生或兼容模式，工具调用和思考都可以同时开。
  </Accordion>

  <Accordion title="为什么 Pro 系列只能走 Responses？">
    `gpt-5.4-pro` / `gpt-5.5-pro` 这类模型在实务上只有 `/v1/responses` 可用（且需要 SVIP 分组）。它们运行时间长，配合 background 模式使用，兼容模式承载不了这个交互形态。见 [原生调用](/api-capabilities/openai/native)。
  </Accordion>

  <Accordion title="Chat Completions 会被废弃吗？">
    不会。被官方计划关停的是 **Assistants API**，不是 Chat Completions。两个端点都会长期支持，只是新功能优先落在 Responses。
  </Accordion>
</AccordionGroup>

## 相关页面

<CardGroup cols={3}>
  <Card title="原生调用" icon="zap" href="/api-capabilities/openai/native">
    Responses 端点的完整用法：参数、响应结构、内置工具、客户端支持清单
  </Card>

  <Card title="兼容模式调用" icon="plug" href="/api-capabilities/openai/compatible">
    Chat Completions 的用法与能力边界，各语言 SDK 配置
  </Card>

  <Card title="FC函数调用" icon="wrench" href="/api-capabilities/openai/function-calling">
    两个端点各自的工具调用完整示例与流式拼装
  </Card>
</CardGroup>
