> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 對話與推理呼叫指南

> Grok 系列在 API易 的 Chat Completions 全能力實測：流式輸出、思維鏈 reasoning_content 與計費、結構化輸出 json_schema、函式呼叫、視覺輸入與自動快取。

本文覆蓋 Grok 系列在 `/v1/chat/completions` 端點上的全部對話類能力，所有結論基於 2026年7月13日 (UTC+8) 在 API易 閘道的實測。

## 基礎對話與流式輸出

全系 6 個模型均支援標準 OpenAI 格式與流式輸出，`stream_options: {"include_usage": true}` 實測可用（末尾 chunk 返回完整 usage）：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

stream = client.chat.completions.create(
    model="grok-4.3",
    messages=[{"role": "user", "content": "從1數到5，每個數字一行"}],
    stream=True,
    stream_options={"include_usage": True},
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    if chunk.usage:
        print(f"\n用量: {chunk.usage.total_tokens} tokens")
```

實測流式首 token 延遲 1.5–2.3 秒（全模型），非流式短問答整體延遲 1.7–5.1 秒。

## 思維鏈（Reasoning）

這是 Grok 系列最容易被誤解的計費點，務必讀完本節。

### 哪些模型輸出思維鏈

| 模型                                         | 思維鏈行為                                    |
| ------------------------------------------ | ---------------------------------------- |
| `grok-4.5` / `grok-4.3` / `grok-build-0.1` | **預設開啟**，響應含 `reasoning_content` 欄位，無法關閉 |
| `grok-4.20-0309-reasoning`                 | 開啟，含 `reasoning_content`                 |
| `grok-4.20-0309-non-reasoning`             | 關閉，`reasoning_tokens` 為 0，直接快答           |
| `grok-4.20-multi-agent-beta-0309`          | 內部推理不外露，但 `reasoning_tokens` 照常計費        |

<Warning>
  **推理 tokens 計入輸出計費**。實測一條短問答：可見回答僅 30 tokens，實際計費輸出 586 tokens（其中推理 556 tokens）。高頻短問答場景選 `grok-4.20-0309-non-reasoning` 可顯著省成本。
</Warning>

### 讀取思維鏈與推理用量

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.20-0309-reasoning",
    messages=[{"role": "user", "content": "A管8小時注滿水池，B管12小時，同開需幾小時？"}]
)
msg = resp.choices[0].message
print("回答:", msg.content)
print("思維鏈:", msg.reasoning_content)          # 推理過程文本
print("推理 tokens:", resp.usage.completion_tokens_details.reasoning_tokens)
```

### reasoning\_effort 引數

`reasoning_effort`（如 `"low"` / `"high"`）**僅 `grok-4.5` 接受**；`grok-4.20-0309-reasoning` 會明確報錯 `Model ... does not support parameter reasoningEffort`（400）。跨模型程式碼請勿硬編碼該引數。

## 結構化輸出（Structured Outputs）

支援 OpenAI 標準的 `response_format: json_schema`（strict 模式），實測 `grok-4.5` / `grok-4.3` / `grok-build-0.1` / `grok-4.20-0309-reasoning` / multi-agent 模型全部通過，返回嚴格符合 schema 的 JSON：

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{"role": "user", "content": "張三今年25歲，住在杭州。請抽取資訊。"}],
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
print(resp.choices[0].message.content)   # {"name":"張三","age":25,"city":"杭州"}
```

## 函式呼叫（Function Calling）

支援 OpenAI 標準的 `tools` / `tool_choice` 欄位與完整的兩輪工具呼叫流程（實測 `grok-4.5` / `grok-4.3` / `grok-build-0.1` 通過）：

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "查詢指定城市當前天氣",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string", "description": "城市名"}},
            "required": ["city"]
        }
    }
}]

messages = [{"role": "user", "content": "上海現在天氣怎麼樣？"}]

# 第一輪：模型決定呼叫工具
resp = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
msg = resp.choices[0].message
tool_call = msg.tool_calls[0]
print(tool_call.function.name, tool_call.function.arguments)  # get_weather {"city":"上海"}

# 第二輪：喂回工具執行結果
messages += [
    msg,
    {"role": "tool", "tool_call_id": tool_call.id,
     "content": '{"city": "上海", "temp_c": 31, "condition": "晴"}'}
]
resp2 = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
print(resp2.choices[0].message.content)  # 上海現在天氣晴朗，氣溫31℃。
```

`tool_choice` 強制呼叫（`{"type": "function", "function": {"name": "get_weather"}}`）實測同樣可用。

<Tip>
  這裡說的是**客戶端函式呼叫**（工具由你的程式碼執行）。如果想讓 xAI 服務端替你執行搜尋 / 跑程式碼 / 連 MCP，請走 Responses API，見 [聯網搜尋與 X 搜尋](/zh-Hant/api-capabilities/grok/web-search) 和 [程式碼執行與 MCP](/zh-Hant/api-capabilities/grok/code-execution-mcp)。
</Tip>

## 視覺輸入（圖片理解）

Grok 4.x 對話模型支援圖片輸入（jpg / png，單圖不大於 20MiB），使用 OpenAI Vision 相容格式。實測 `grok-4.5` / `grok-4.3` / `grok-4.20-0309-non-reasoning` 均正確識別圖形與顏色：

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "圖裡有什麼？"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
        ]
    }]
)
print(resp.choices[0].message.content)
```

<Warning>
  **優先使用 base64 data URL**。傳外鏈 URL 時，圖片由 xAI 上游伺服器直接抓取——實測部分圖床（如維基媒體）會對伺服器抓取返回錯誤，導致請求失敗（`image_download_error`）。若必須用外鏈，請確保圖床對服務端請求開放且 URL 直接指向圖片檔案。
</Warning>

## Prompt Caching（自動快取）

Grok 字首快取**自動生效，無需任何配置**，命中部分按緩存摺扣價計費（`grok-4.6` 為 0.25×，省 75%）：

```python theme={null}
resp = client.chat.completions.create(model="grok-4.6", messages=messages)
print("快取命中:", resp.usage.prompt_tokens_details.cached_tokens)
```

最佳化建議：把穩定不變的 system prompt / few-shot 示例放在訊息最前面，可變內容放最後，最大化字首命中。xAI 官方明確快取條目可能被驅逐、不保證 100% 命中，**做成本測算請按無快取價格打底**。

命中判讀、128 token 塊粒度、長對話該走哪個端點等完整口徑，見 [Grok 快取計費指南](/zh-Hant/api-capabilities/grok/prompt-caching)。

## 常見問題

<AccordionGroup>
  <Accordion title="怎麼關閉 grok-4.5 的思維鏈？">
    關不掉。`grok-4.5` / `grok-4.3` / `grok-build-0.1` 的內部推理是模型固有行為。若不需要思維鏈、追求快答低成本，直接改用 `grok-4.20-0309-non-reasoning`。
  </Accordion>

  <Accordion title="reasoning_content 會計入下一輪上下文嗎？">
    多輪對話回傳歷史時，只需回傳 `content`（和工具呼叫相關欄位），不要把 `reasoning_content` 塞回 messages——它不是標準欄位，回傳徒增輸入 tokens。
  </Accordion>

  <Accordion title="max_tokens 怎麼設定？">
    推理模型的思維鏈也消耗輸出配額，`max_tokens` 給小了會導致思維鏈吃滿配額、正文被截斷。帶推理的模型建議 `max_tokens` 至少 2048 起步。
  </Accordion>

  <Accordion title="temperature / top_p 能用嗎？">
    可以正常傳入。注意推理類模型對取樣引數的敏感度低於傳統模型，調優價值有限。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="Grok 概覽" icon="rocket" href="/zh-Hant/api-capabilities/grok/overview">
    模型陣容、定價與能力矩陣
  </Card>

  <Card title="快取計費" icon="database" href="/zh-Hant/api-capabilities/grok/prompt-caching">
    命中省 75%、判讀口徑與長對話接法
  </Card>

  <Card title="聯網搜尋與 X 搜尋" icon="globe" href="/zh-Hant/api-capabilities/grok/web-search">
    server-side 聯網工具實戰
  </Card>
</CardGroup>
