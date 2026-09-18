> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 原生格式：流式与非流式响应

> Anthropic 原生 /v1/messages 的流式与非流式响应结构：content 块数组、具名事件 SSE 协议，附解析方法与各字段说明。

通过 [Claude 原生格式](/api-capabilities/claude)（`/v1/messages`）调用时，响应结构与 OpenAI 兼容格式**完全不同**：正文是按类型区分的 `content` 块数组，流式则用 Anthropic 的**具名事件 SSE 协议**。本页讲清两种模式怎么解析。

<Info>
  请求侧（端点、`anthropic-version` 头、`x-api-key` 鉴权、effort / thinking 参数）见 [Claude API 基础说明](/api-capabilities/claude) 与 [Claude Effort 思考指南](/api-capabilities/claude-effort-thinking)。本页只讲**响应侧**。示例用轻量模型 `claude-haiku-4-5-20251001`。
</Info>

## 非流式响应

顶层是一个 `message` 对象，**正文在 `content` 数组**里，按 `type` 区分块：

```json theme={null}
{
  "id": "msg_bdrk_xxx",
  "type": "message",
  "role": "assistant",
  "model": "claude-haiku-4-5-20251001",
  "content": [
    { "type": "text", "text": "1+1等于2。" }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 26,
    "output_tokens": 11,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

取正文要**遍历 `content` 数组**——不能像 OpenAI 那样直接取一个字符串字段：

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1/messages",
      headers={
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": "YOUR_API_KEY",
      },
      json={
          "model": "claude-haiku-4-5-20251001",
          "max_tokens": 100,
          "messages": [{"role": "user", "content": "1+1等于几？"}],
      },
      timeout=60,
  )
  data = resp.json()
  for block in data["content"]:
      if block["type"] == "text":
          print(block["text"])
      elif block["type"] == "thinking":      # 开启思考时才有
          print("[思考]", block["thinking"])
  print(data["usage"])
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/messages \
    -H "content-type: application/json" \
    -H "anthropic-version: 2023-06-01" \
    -H "x-api-key: YOUR_API_KEY" \
    -d '{
      "model": "claude-haiku-4-5-20251001",
      "max_tokens": 100,
      "messages": [{"role": "user", "content": "1+1等于几？"}]
    }'
  ```
</CodeGroup>

<Note>
  `stop_reason` 取值：`end_turn`（正常结束）、`max_tokens`（被 `max_tokens` 截断，正文可能为空，调大即可）、`stop_sequence`、`tool_use`（要调用工具）。开启思考后，`content` 数组里会多出 `type: "thinking"` 的块，排在 `text` 块之前。
</Note>

## 流式响应（具名事件 SSE）

Claude 流式用的是 **Anthropic 事件协议**：每条消息有 `event:` 名称 + `data:` 负载，需要**按事件类型分发**，而不是像 OpenAI 那样每块都同构。

```text theme={null}
event: message_start
data: {"type":"message_start","message":{"id":"...","content":[],"usage":{"input_tokens":26,"output_tokens":8}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"1+1等于2。"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":11}}

event: message_stop
data: {"type":"message_stop"}
```

事件流的固定顺序与职责：

| 事件                    | 作用                                                 |
| --------------------- | -------------------------------------------------- |
| `message_start`       | 消息骨架；`usage.input_tokens` 和初始 `output_tokens` 在此   |
| `content_block_start` | 一个内容块开始（`index` + 块类型 text / thinking）             |
| `content_block_delta` | 增量；正文是 `delta.type == "text_delta"` 的 `delta.text` |
| `content_block_stop`  | 当前块结束                                              |
| `message_delta`       | 最终 `stop_reason` + **累计的 `output_tokens`** 在此      |
| `message_stop`        | 整条消息结束（**无 `[DONE]`，以此事件为终止信号**）                   |

解析的核心是**累加 `content_block_delta` 里的 `text_delta`**：

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": "YOUR_API_KEY",
    },
    json={
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 100,
        "stream": True,
        "messages": [{"role": "user", "content": "写一首短诗"}],
    },
    stream=True, timeout=120,
)

text, usage = "", {}
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue                       # event: 行可跳过，类型也在 data 的 "type" 里
    evt = json.loads(line[6:])
    t = evt["type"]
    if t == "message_start":
        usage.update(evt["message"]["usage"])
    elif t == "content_block_delta" and evt["delta"]["type"] == "text_delta":
        piece = evt["delta"]["text"]
        text += piece
        print(piece, end="", flush=True)
    elif t == "message_delta":
        usage.update(evt["usage"])     # 最终 output_tokens
    elif t == "message_stop":
        break                          # 终止信号，无 [DONE]
```

<Tip>
  事件类型在 `event:` 行和 `data:` 负载的 `"type"` 字段里**都有**，按任一个分发都行。用官方 `anthropic` SDK 时，把 base\_url 指向 `https://api.apiyi.com` 即可，SDK 会自动处理事件流，无需手写上面的循环。
</Tip>

<Note>
  开启思考（adaptive thinking）时，会先出现 `type: "thinking"` 的内容块，其增量是 `thinking_delta`，并在块结束前出现一个 `signature_delta`（思考块签名）。展示思考时把 `thinking_delta` 与 `text_delta` 分流渲染即可。思考用法见 [Claude Effort 思考指南](/api-capabilities/claude-effort-thinking)。
</Note>

## 与 OpenAI 兼容格式的关键差异

| 维度           | Claude 原生（`/v1/messages`）                                             | OpenAI 兼容（`/v1/chat/completions`）                      |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------------------ |
| 正文位置         | `content` **块数组**，按 `type` 区分                                         | `choices[0].message.content` 字符串                       |
| 流式协议         | 具名事件（`event:` + `data:`）                                              | 同构 chunk 对象                                            |
| 流式终止         | `message_stop` 事件，**无 `[DONE]`**                                      | `data: [DONE]`                                         |
| 增量字段         | `content_block_delta.delta.text`                                      | `choices[0].delta.content`                             |
| usage 字段     | `input_tokens` / `output_tokens`（分散在 message\_start 与 message\_delta） | `prompt_tokens` / `completion_tokens` / `total_tokens` |
| 结束原因         | `stop_reason`（`end_turn` 等）                                           | `finish_reason`（`stop` 等）                              |
| `max_tokens` | **必填**                                                                | 选填                                                     |

<Warning>
  迁移最容易踩的两点：① 正文是**数组**不是字符串，必须遍历 `content` 取 `type=="text"` 的块；② 流式**没有 `[DONE]`**，要用 `message_stop` 事件判结束。
</Warning>

## usage 与计费

* 非流式：`usage` 随结果返回，含 `input_tokens`、`output_tokens`、`cache_creation_input_tokens`、`cache_read_input_tokens`。
* 流式：`input_tokens` 在 `message_start`，最终 `output_tokens` 在 `message_delta`，需**两处合并**。
* 缓存命中字段（`cache_read_input_tokens`）的折扣与用法见 [Claude 缓存计费](/api-capabilities/claude-prompt-caching)。

## 相关链接

* 同组页面：[Claude API 基础说明](/api-capabilities/claude) · [Claude 缓存计费](/api-capabilities/claude-prompt-caching) · [Claude Effort 思考指南](/api-capabilities/claude-effort-thinking)
* 兼容格式对照：[OpenAI 兼容模式响应数据处理](/api-capabilities/openai/response-handling)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
