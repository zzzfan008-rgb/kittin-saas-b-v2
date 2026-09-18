> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 原生格式：流式與非流式響應

> Anthropic 原生 /v1/messages 的流式與非流式響應結構：content 塊陣列、具名事件 SSE 協議，附解析方法與各欄位說明。

通過 [Claude 原生格式](/zh-Hant/api-capabilities/claude)（`/v1/messages`）呼叫時，響應結構與 OpenAI 相容格式**完全不同**：正文是按型別區分的 `content` 塊陣列，流式則用 Anthropic 的**具名事件 SSE 協議**。本頁講清兩種模式怎麼解析。

<Info>
  請求側（端點、`anthropic-version` 頭、`x-api-key` 鑑權、effort / thinking 引數）見 [Claude API 基礎說明](/zh-Hant/api-capabilities/claude) 與 [Claude Effort 思考指南](/zh-Hant/api-capabilities/claude-effort-thinking)。本頁只講**響應側**。示例用輕量模型 `claude-haiku-4-5-20251001`。
</Info>

## 非流式響應

頂層是一個 `message` 物件，**正文在 `content` 陣列**裡，按 `type` 區分塊：

```json theme={null}
{
  "id": "msg_bdrk_xxx",
  "type": "message",
  "role": "assistant",
  "model": "claude-haiku-4-5-20251001",
  "content": [
    { "type": "text", "text": "1+1等於2。" }
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

取正文要**遍歷 `content` 陣列**——不能像 OpenAI 那樣直接取一個字串欄位：

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
          "messages": [{"role": "user", "content": "1+1等於幾？"}],
      },
      timeout=60,
  )
  data = resp.json()
  for block in data["content"]:
      if block["type"] == "text":
          print(block["text"])
      elif block["type"] == "thinking":      # 開啟思考時才有
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
      "messages": [{"role": "user", "content": "1+1等於幾？"}]
    }'
  ```
</CodeGroup>

<Note>
  `stop_reason` 取值：`end_turn`（正常結束）、`max_tokens`（被 `max_tokens` 截斷，正文可能為空，調大即可）、`stop_sequence`、`tool_use`（要呼叫工具）。開啟思考後，`content` 數組裡會多出 `type: "thinking"` 的塊，排在 `text` 塊之前。
</Note>

## 流式響應（具名事件 SSE）

Claude 流式用的是 **Anthropic 事件協議**：每條訊息有 `event:` 名稱 + `data:` 負載，需要**按事件型別分發**，而不是像 OpenAI 那樣每塊都同構。

```text theme={null}
event: message_start
data: {"type":"message_start","message":{"id":"...","content":[],"usage":{"input_tokens":26,"output_tokens":8}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"1+1等於2。"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":11}}

event: message_stop
data: {"type":"message_stop"}
```

事件流的固定順序與職責：

| 事件                    | 作用                                                 |
| --------------------- | -------------------------------------------------- |
| `message_start`       | 訊息骨架；`usage.input_tokens` 和初始 `output_tokens` 在此   |
| `content_block_start` | 一個內容塊開始（`index` + 塊型別 text / thinking）             |
| `content_block_delta` | 增量；正文是 `delta.type == "text_delta"` 的 `delta.text` |
| `content_block_stop`  | 當前塊結束                                              |
| `message_delta`       | 最終 `stop_reason` + **累計的 `output_tokens`** 在此      |
| `message_stop`        | 整條訊息結束（**無 `[DONE]`，以此事件為終止訊號**）                   |

解析的核心是**累加 `content_block_delta` 裡的 `text_delta`**：

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
        "messages": [{"role": "user", "content": "寫一首短詩"}],
    },
    stream=True, timeout=120,
)

text, usage = "", {}
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue                       # event: 行可跳過，型別也在 data 的 "type" 裡
    evt = json.loads(line[6:])
    t = evt["type"]
    if t == "message_start":
        usage.update(evt["message"]["usage"])
    elif t == "content_block_delta" and evt["delta"]["type"] == "text_delta":
        piece = evt["delta"]["text"]
        text += piece
        print(piece, end="", flush=True)
    elif t == "message_delta":
        usage.update(evt["usage"])     # 最終 output_tokens
    elif t == "message_stop":
        break                          # 終止訊號，無 [DONE]
```

<Tip>
  事件型別在 `event:` 行和 `data:` 負載的 `"type"` 欄位裡**都有**，按任一個分發都行。用官方 `anthropic` SDK 時，把 base\_url 指向 `https://api.apiyi.com` 即可，SDK 會自動處理事件流，無需手寫上面的迴圈。
</Tip>

<Note>
  開啟思考（adaptive thinking）時，會先出現 `type: "thinking"` 的內容塊，其增量是 `thinking_delta`，並在塊結束前出現一個 `signature_delta`（思考塊簽名）。展示思考時把 `thinking_delta` 與 `text_delta` 分流渲染即可。思考用法見 [Claude Effort 思考指南](/zh-Hant/api-capabilities/claude-effort-thinking)。
</Note>

## 與 OpenAI 相容格式的關鍵差異

| 維度           | Claude 原生（`/v1/messages`）                                             | OpenAI 相容（`/v1/chat/completions`）                      |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------------------ |
| 正文位置         | `content` **塊陣列**，按 `type` 區分                                         | `choices[0].message.content` 字串                        |
| 流式協議         | 具名事件（`event:` + `data:`）                                              | 同構 chunk 物件                                            |
| 流式終止         | `message_stop` 事件，**無 `[DONE]`**                                      | `data: [DONE]`                                         |
| 增量欄位         | `content_block_delta.delta.text`                                      | `choices[0].delta.content`                             |
| usage 欄位     | `input_tokens` / `output_tokens`（分散在 message\_start 與 message\_delta） | `prompt_tokens` / `completion_tokens` / `total_tokens` |
| 結束原因         | `stop_reason`（`end_turn` 等）                                           | `finish_reason`（`stop` 等）                              |
| `max_tokens` | **必填**                                                                | 選填                                                     |

<Warning>
  遷移最容易踩的兩點：① 正文是**陣列**不是字串，必須遍歷 `content` 取 `type=="text"` 的塊；② 流式**沒有 `[DONE]`**，要用 `message_stop` 事件判結束。
</Warning>

## usage 與計費

* 非流式：`usage` 隨結果返回，含 `input_tokens`、`output_tokens`、`cache_creation_input_tokens`、`cache_read_input_tokens`。
* 流式：`input_tokens` 在 `message_start`，最終 `output_tokens` 在 `message_delta`，需**兩處合併**。
* 快取命中欄位（`cache_read_input_tokens`）的折扣與用法見 [Claude 快取計費](/zh-Hant/api-capabilities/claude-prompt-caching)。

## 相關連結

* 同組頁面：[Claude API 基礎說明](/zh-Hant/api-capabilities/claude) · [Claude 快取計費](/zh-Hant/api-capabilities/claude-prompt-caching) · [Claude Effort 思考指南](/zh-Hant/api-capabilities/claude-effort-thinking)
* 相容格式對照：[OpenAI 相容模式響應資料處理](/zh-Hant/api-capabilities/openai/response-handling)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
