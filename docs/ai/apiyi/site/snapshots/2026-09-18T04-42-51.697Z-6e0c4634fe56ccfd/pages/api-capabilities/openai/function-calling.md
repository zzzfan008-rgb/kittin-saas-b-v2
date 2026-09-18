> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Function Calling 函数调用指南

> tools 定义、strict 严格模式、并行调用、流式拼装，以及 responses 与 chat/completions 两个端点的格式差异。

Function Calling（函数调用，简称 FC）是构建 Agent 的基础能力：**模型不执行函数，只输出"想调哪个函数 + 什么参数"**，执行在你自己的代码里完成，把结果回传后模型再给出最终回答。

本页基于 OpenAI 官方文档整理（`developers.openai.com/api/docs/guides/function-calling`，2026年6月数据），两个端点的示例均可直接复制运行。

## 完整调用循环

<Steps>
  <Step title="定义 tools">
    把函数名、用途描述、参数 JSON Schema 随请求发给模型
  </Step>

  <Step title="模型返回函数调用">
    模型判断需要调用时，返回函数名和 JSON 格式的参数
  </Step>

  <Step title="本地执行">
    你的代码解析参数、真正执行函数（查数据库、调外部 API……）
  </Step>

  <Step title="回传结果">
    把执行结果连同历史一起再发一次请求，模型基于结果生成最终回答
  </Step>
</Steps>

## 两个端点的关键格式差异

同一个功能，`/v1/chat/completions` 和 `/v1/responses` 的字段格式**不一样**，这是接入时最容易踩的坑：

|           | Chat Completions                                               | Responses                                                                  |
| --------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| tools 定义  | 嵌套：`{"type": "function", "function": {name, parameters, ...}}` | 扁平：`{"type": "function", "name": ..., "parameters": ...}`                  |
| 调用返回      | `message.tool_calls[]`（含 `id`）                                 | 顶层 output item：`{"type": "function_call", "call_id", "name", "arguments"}` |
| 结果回传      | `{"role": "tool", "tool_call_id": ..., "content": ...}`        | `{"type": "function_call_output", "call_id": ..., "output": ...}`          |
| strict 模式 | 需显式 `"strict": true`                                           | 服务端会尽量自动归一化为 strict                                                        |

<Warning>
  两套格式**不能混用**。把 Chat Completions 的嵌套 `function: {...}` 定义发给 `/v1/responses`（或反过来）是 SDK 报"参数无效"最常见的原因。
</Warning>

需要把现有的工具调用从 Chat Completions 整体搬到 Responses（比如撞上了 GPT-5.4+ 的 `tools` 与 `reasoning_effort` 互斥限制），见 [端点选型与迁移](/api-capabilities/openai/responses-migration)，那里有完整的前后代码对照。

## Chat Completions 完整示例

以查天气为例，走完"定义 → 调用 → 执行 → 回传"全循环：

<CodeGroup>
  ```python Python theme={null}
  import json
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "获取指定城市的当前天气",
          "parameters": {
              "type": "object",
              "properties": {
                  "city": {"type": "string", "description": "城市名，如：北京"}
              },
              "required": ["city"],
              "additionalProperties": False
          },
          "strict": True
      }
  }]

  messages = [{"role": "user", "content": "北京天气怎么样？"}]

  # 第 1 次请求：模型决定调函数
  r1 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  tool_call = r1.choices[0].message.tool_calls[0]
  args = json.loads(tool_call.function.arguments)

  # 本地执行（这里用假数据代替真实查询）
  weather = {"city": args["city"], "temp": "26°C", "condition": "晴"}

  # 第 2 次请求：回传结果，模型生成最终回答
  messages.append(r1.choices[0].message)
  messages.append({
      "role": "tool",
      "tool_call_id": tool_call.id,
      "content": json.dumps(weather, ensure_ascii=False)
  })

  r2 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  print(r2.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const tools = [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市的当前天气',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名，如：北京' }
        },
        required: ['city'],
        additionalProperties: false
      },
      strict: true
    }
  }];

  const messages = [{ role: 'user', content: '北京天气怎么样？' }];

  const r1 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  const toolCall = r1.choices[0].message.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);

  const weather = { city: args.city, temp: '26°C', condition: '晴' };

  messages.push(r1.choices[0].message);
  messages.push({
    role: 'tool',
    tool_call_id: toolCall.id,
    content: JSON.stringify(weather)
  });

  const r2 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  console.log(r2.choices[0].message.content);
  ```

  ```bash cURL（第 1 次请求） theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [{"role": "user", "content": "北京天气怎么样？"}],
      "tools": [{
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "获取指定城市的当前天气",
          "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
            "additionalProperties": false
          },
          "strict": true
        }
      }]
    }'
  ```
</CodeGroup>

## Responses 完整示例

注意三处不同：tools 定义是**扁平**的、调用以顶层 `function_call` item 返回、回传用 `function_call_output`。配合 `previous_response_id`，第 2 次请求不必重发全部历史：

```python theme={null}
import json
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

tools = [{
    "type": "function",          # 扁平定义，没有嵌套的 function 字段
    "name": "get_weather",
    "description": "获取指定城市的当前天气",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名，如：北京"}
        },
        "required": ["city"],
        "additionalProperties": False
    }
}]

# 第 1 次请求
r1 = client.responses.create(
    model="gpt-5.4",
    input="北京天气怎么样？",
    tools=tools
)

# 从 output 数组里找 function_call item
call = next(item for item in r1.output if item.type == "function_call")
args = json.loads(call.arguments)

weather = {"city": args["city"], "temp": "26°C", "condition": "晴"}

# 第 2 次请求：用 previous_response_id 接上文，只回传函数结果
r2 = client.responses.create(
    model="gpt-5.4",
    previous_response_id=r1.id,
    input=[{
        "type": "function_call_output",
        "call_id": call.call_id,
        "output": json.dumps(weather, ensure_ascii=False)
    }],
    tools=tools
)
print(r2.output_text)
```

## strict 严格模式（结构化输出）

`strict: true` 让模型输出的参数**严格符合你的 JSON Schema**，杜绝幻觉字段和缺字段。三个要求：

1. Schema 里必须有 `"additionalProperties": false`
2. 所有字段都要出现在 `required` 里（可选语义用 `"type": ["string", "null"]` 表达）
3. 只能用受支持的 JSON Schema 子集（基本类型、enum、数组、嵌套对象等）

```json theme={null}
// ✅ 合法的 strict schema
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
    "date": {"type": ["string", "null"], "description": "可选，默认今天"}
  },
  "required": ["city", "unit", "date"],
  "additionalProperties": false
}
```

```json theme={null}
// ❌ 不合法：缺 additionalProperties，date 不在 required 里
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "date": {"type": "string"}
  },
  "required": ["city"]
}
```

<Warning>
  **strict 模式与并行函数调用不兼容**：需要严格 schema 保证时，请同时设置 `parallel_tool_calls: false`。
</Warning>

## parallel\_tool\_calls 与 tool\_choice

### 并行调用

`parallel_tool_calls` 默认开启，模型可以在一轮里同时请求多个函数（如同时查北京和上海的天气）。逐个执行后**全部回传**再发起下一次请求，每个结果都要带对应的 `call_id`（responses）或 `tool_call_id`（chat）配对。

### tool\_choice 控制策略

| 取值                                            | 行为            |
| --------------------------------------------- | ------------- |
| `"auto"`（默认）                                  | 模型自行决定调不调、调哪个 |
| `"required"`                                  | 必须调用至少一个函数    |
| `{"type": "function", "name": "get_weather"}` | 强制调用指定函数      |
| `"none"`                                      | 禁止调用，只生成文本    |

### allowed\_tools 限定子集

工具很多但本轮只想开放一部分时，用 `tool_choice` 的 `allowed_tools` 形式限定可调用子集 —— 它**不改变 tools 列表本身**，因此不破坏 [缓存](/api-capabilities/openai/prompt-caching) 的稳定前缀：

```python theme={null}
tool_choice={
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [{"type": "function", "name": "get_weather"}]
}
```

## 流式中的函数调用

### Chat Completions：按 index 拼接

函数参数在流式里是分片下发的，按 `index` 累加 `arguments` 字符串，流结束后再 `json.loads`：

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4", messages=messages, tools=tools, stream=True
)

calls = {}  # index -> {name, arguments}
for chunk in stream:
    delta = chunk.choices[0].delta if chunk.choices else None
    if delta and delta.tool_calls:
        for tc in delta.tool_calls:
            entry = calls.setdefault(tc.index, {"name": "", "arguments": ""})
            if tc.function.name:
                entry["name"] = tc.function.name
            if tc.function.arguments:
                entry["arguments"] += tc.function.arguments

print(calls)  # 流结束后每个 entry 的 arguments 才是完整 JSON
```

### Responses：监听语义事件

`response.function_call_arguments.delta` 事件携带参数增量，`response.function_call_arguments.done` 给出完整参数，无需自己按 index 拼。

## 最佳实践与踩坑

写好工具定义：

* **函数名和 description 是写给模型看的**：说清楚"什么时候该调我"，比如 `"获取实时天气，仅当用户明确询问天气时调用"`
* **参数用 enum 收窄**：能枚举就别用自由字符串，幻觉参数会少一大半
* **工具定义放 prompt 前部且保持稳定**：tools 会参与缓存前缀比对，定义稳定 = 输入费打 1 折（见 [缓存计费](/api-capabilities/openai/prompt-caching)）
* **Agent 循环设最大轮数**：避免模型在"调函数 → 回传 → 又调函数"里打转烧钱

常见踩坑：

| 现象                    | 处理                                                   |
| --------------------- | ---------------------------------------------------- |
| `arguments` 不是合法 JSON | 上 `strict: true`，从根上解决                               |
| 模型调了不存在的函数名           | 用 `tool_choice` 收紧；检查 description 是否误导               |
| 并行调用后报 `call_id` 不匹配  | 每个结果必须和对应调用的 `call_id` / `tool_call_id` 一一配对，缺一个都会报错 |
| 两个端点格式混用报参数错误         | 对照上文差异表，确认 tools 定义嵌套/扁平与端点匹配                        |

## 模型支持与选型

gpt-5 全系支持函数调用，按场景选：

| 场景              | 推荐模型                                 | 理由        |
| --------------- | ------------------------------------ | --------- |
| 日常 Agent / 工具调用 | `gpt-5.4`（\$2.50 / \$15.00 每 1M）     | 能力与成本均衡   |
| 高频轻量工具路由        | `gpt-5.4-mini`（\$0.75 / \$4.50 每 1M） | 便宜，简单分发够用 |
| 复杂多步推理 Agent    | `gpt-5.5`（\$5.00 / \$30.00 每 1M）     | 长链路规划更稳   |

## 相关链接

* 同组页面：[原生调用](/api-capabilities/openai/native) · [兼容模式调用](/api-capabilities/openai/compatible) · [缓存计费](/api-capabilities/openai/prompt-caching)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
* OpenAI 官方文档：`developers.openai.com/api/docs/guides/function-calling`
