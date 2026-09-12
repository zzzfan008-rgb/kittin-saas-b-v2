> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 对话与推理调用指南

> Grok 系列在 API易 的 Chat Completions 全能力实测：流式输出、思维链 reasoning_content 与计费、结构化输出 json_schema、函数调用、视觉输入与自动缓存。

本文覆盖 Grok 系列在 `/v1/chat/completions` 端点上的全部对话类能力，所有结论基于 2026年7月13日 (UTC+8) 在 API易 网关的实测。

## 基础对话与流式输出

全系 6 个模型均支持标准 OpenAI 格式与流式输出，`stream_options: {"include_usage": true}` 实测可用（末尾 chunk 返回完整 usage）：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

stream = client.chat.completions.create(
    model="grok-4.3",
    messages=[{"role": "user", "content": "从1数到5，每个数字一行"}],
    stream=True,
    stream_options={"include_usage": True},
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    if chunk.usage:
        print(f"\n用量: {chunk.usage.total_tokens} tokens")
```

实测流式首 token 延迟 1.5–2.3 秒（全模型），非流式短问答整体延迟 1.7–5.1 秒。

## 思维链（Reasoning）

这是 Grok 系列最容易被误解的计费点，务必读完本节。

### 哪些模型输出思维链

| 模型                                         | 思维链行为                                    |
| ------------------------------------------ | ---------------------------------------- |
| `grok-4.5` / `grok-4.3` / `grok-build-0.1` | **默认开启**，响应含 `reasoning_content` 字段，无法关闭 |
| `grok-4.20-0309-reasoning`                 | 开启，含 `reasoning_content`                 |
| `grok-4.20-0309-non-reasoning`             | 关闭，`reasoning_tokens` 为 0，直接快答           |
| `grok-4.20-multi-agent-beta-0309`          | 内部推理不外露，但 `reasoning_tokens` 照常计费        |

<Warning>
  **推理 tokens 计入输出计费**。实测一条短问答：可见回答仅 30 tokens，实际计费输出 586 tokens（其中推理 556 tokens）。高频短问答场景选 `grok-4.20-0309-non-reasoning` 可显著省成本。
</Warning>

### 读取思维链与推理用量

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.20-0309-reasoning",
    messages=[{"role": "user", "content": "A管8小时注满水池，B管12小时，同开需几小时？"}]
)
msg = resp.choices[0].message
print("回答:", msg.content)
print("思维链:", msg.reasoning_content)          # 推理过程文本
print("推理 tokens:", resp.usage.completion_tokens_details.reasoning_tokens)
```

### reasoning\_effort 参数

`reasoning_effort`（如 `"low"` / `"high"`）**仅 `grok-4.5` 接受**；`grok-4.20-0309-reasoning` 会明确报错 `Model ... does not support parameter reasoningEffort`（400）。跨模型代码请勿硬编码该参数。

## 结构化输出（Structured Outputs）

支持 OpenAI 标准的 `response_format: json_schema`（strict 模式），实测 `grok-4.5` / `grok-4.3` / `grok-build-0.1` / `grok-4.20-0309-reasoning` / multi-agent 模型全部通过，返回严格符合 schema 的 JSON：

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{"role": "user", "content": "张三今年25岁，住在杭州。请抽取信息。"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "city": {"type": "string"}
                },
                "required": ["name", "age", "city"],
                "additionalProperties": False
            }
        }
    }
)
print(resp.choices[0].message.content)   # {"name":"张三","age":25,"city":"杭州"}
```

## 函数调用（Function Calling）

支持 OpenAI 标准的 `tools` / `tool_choice` 字段与完整的两轮工具调用流程（实测 `grok-4.5` / `grok-4.3` / `grok-build-0.1` 通过）：

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "查询指定城市当前天气",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string", "description": "城市名"}},
            "required": ["city"]
        }
    }
}]

messages = [{"role": "user", "content": "上海现在天气怎么样？"}]

# 第一轮：模型决定调用工具
resp = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
msg = resp.choices[0].message
tool_call = msg.tool_calls[0]
print(tool_call.function.name, tool_call.function.arguments)  # get_weather {"city":"上海"}

# 第二轮：喂回工具执行结果
messages += [
    msg,
    {"role": "tool", "tool_call_id": tool_call.id,
     "content": '{"city": "上海", "temp_c": 31, "condition": "晴"}'}
]
resp2 = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
print(resp2.choices[0].message.content)  # 上海现在天气晴朗，气温31℃。
```

`tool_choice` 强制调用（`{"type": "function", "function": {"name": "get_weather"}}`）实测同样可用。

<Tip>
  这里说的是**客户端函数调用**（工具由你的代码执行）。如果想让 xAI 服务端替你执行搜索 / 跑代码 / 连 MCP，请走 Responses API，见 [联网搜索与 X 搜索](/api-capabilities/grok/web-search) 和 [代码执行与 MCP](/api-capabilities/grok/code-execution-mcp)。
</Tip>

## 视觉输入（图片理解）

Grok 4.x 对话模型支持图片输入（jpg / png，单图不大于 20MiB），使用 OpenAI Vision 兼容格式。实测 `grok-4.5` / `grok-4.3` / `grok-4.20-0309-non-reasoning` 均正确识别图形与颜色：

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "图里有什么？"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
        ]
    }]
)
print(resp.choices[0].message.content)
```

<Warning>
  **优先使用 base64 data URL**。传外链 URL 时，图片由 xAI 上游服务器直接抓取——实测部分图床（如维基媒体）会对服务器抓取返回错误，导致请求失败（`image_download_error`）。若必须用外链，请确保图床对服务端请求开放且 URL 直接指向图片文件。
</Warning>

## Prompt Caching（自动缓存）

Grok 前缀缓存**自动生效，无需任何配置**，命中部分按缓存折扣价计费（`grok-4.6` 为 0.25×，省 75%）：

```python theme={null}
resp = client.chat.completions.create(model="grok-4.6", messages=messages)
print("缓存命中:", resp.usage.prompt_tokens_details.cached_tokens)
```

优化建议：把稳定不变的 system prompt / few-shot 示例放在消息最前面，可变内容放最后，最大化前缀命中。xAI 官方明确缓存条目可能被驱逐、不保证 100% 命中，**做成本测算请按无缓存价格打底**。

命中判读、128 token 块粒度、长对话该走哪个端点等完整口径，见 [Grok 缓存计费指南](/api-capabilities/grok/prompt-caching)。

## 常见问题

<AccordionGroup>
  <Accordion title="怎么关闭 grok-4.5 的思维链？">
    关不掉。`grok-4.5` / `grok-4.3` / `grok-build-0.1` 的内部推理是模型固有行为。若不需要思维链、追求快答低成本，直接改用 `grok-4.20-0309-non-reasoning`。
  </Accordion>

  <Accordion title="reasoning_content 会计入下一轮上下文吗？">
    多轮对话回传历史时，只需回传 `content`（和工具调用相关字段），不要把 `reasoning_content` 塞回 messages——它不是标准字段，回传徒增输入 tokens。
  </Accordion>

  <Accordion title="max_tokens 怎么设置？">
    推理模型的思维链也消耗输出配额，`max_tokens` 给小了会导致思维链吃满配额、正文被截断。带推理的模型建议 `max_tokens` 至少 2048 起步。
  </Accordion>

  <Accordion title="temperature / top_p 能用吗？">
    可以正常传入。注意推理类模型对采样参数的敏感度低于传统模型，调优价值有限。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="Grok 概览" icon="rocket" href="/api-capabilities/grok/overview">
    模型阵容、定价与能力矩阵
  </Card>

  <Card title="缓存计费" icon="database" href="/api-capabilities/grok/prompt-caching">
    命中省 75%、判读口径与长对话接法
  </Card>

  <Card title="联网搜索与 X 搜索" icon="globe" href="/api-capabilities/grok/web-search">
    server-side 联网工具实战
  </Card>
</CardGroup>
