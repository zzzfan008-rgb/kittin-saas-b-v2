> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 原生格式：流式與非流式響應

> Gemini 官方 generateContent / streamGenerateContent 的響應結構：candidates/parts、thoughtSignature、SSE 流式，附解析方法與欄位說明。

通過 [Gemini 原生格式](/zh-Hant/api-capabilities/gemini/native)（`/v1beta` generateContent）呼叫時，響應是 Google 的 `candidates / parts` 結構，與 OpenAI 相容格式不同。本頁講清非流式（`generateContent`）與流式（`streamGenerateContent`）兩種響應怎麼解析。

<Info>
  請求側（base\_url 為 `https://api.apiyi.com` 不帶 `/v1`、`x-goog-api-key` 鑑權、`thinking_level` 思考控制）見 [Gemini 原生格式呼叫指南](/zh-Hant/api-capabilities/gemini/native)。本頁只講**響應側**。示例用輕量模型 `gemini-3.1-flash-lite`。
</Info>

## 非流式響應

端點 `…:generateContent`，**正文在 `candidates[0].content.parts[]`**：

```json theme={null}
{
  "candidates": [{
    "content": {
      "role": "model",
      "parts": [
        { "text": "1+1等於2。", "thoughtSignature": "EjQKMgEM…" }
      ]
    },
    "finishReason": "STOP",
    "index": 0
  }],
  "usageMetadata": {
    "promptTokenCount": 15,
    "candidatesTokenCount": 6,
    "totalTokenCount": 21
  },
  "modelVersion": "gemini-3.1-flash-lite",
  "responseId": "Il0taoSYJ5Cez7…"
}
```

取正文要**遍歷 `parts`** 拼接每個 `text`：

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
      json={"contents": [{"parts": [{"text": "1+1等於幾？"}]}]},
      timeout=60,
  )
  data = resp.json()
  parts = data["candidates"][0]["content"]["parts"]
  text = "".join(p["text"] for p in parts if "text" in p)
  print(text)
  print(data["usageMetadata"])
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{"contents":[{"parts":[{"text":"1+1等於幾？"}]}]}'
  ```
</CodeGroup>

<Note>
  `finishReason` 是**大寫** `STOP`（不是 OpenAI 的小寫 `stop`），其它取值如 `MAX_TOKENS`、`SAFETY`。一個 `part` 可能只含 `thoughtSignature` 而無 `text`，遍歷時要用 `if "text" in p` 過濾，否則會 KeyError。
</Note>

## thoughtSignature（思維簽名）

Gemini 3 系列會在 part 上附帶 `thoughtSignature`（加密的推理狀態）——**實測連輕量的 `gemini-3.1-flash-lite` 也會返回**。

* **單輪**：用不到，忽略即可。
* **多輪 / 函式呼叫**：要把上一輪響應裡的 `thoughtSignature` **原樣回傳**到下一輪的 `contents` 中，模型才能延續推理鏈。**官方 `google-genai` SDK 自動處理**；手寫 REST 時注意不要丟棄該欄位。詳見 [Gemini 函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)。

<Tip>
  這正是原生格式與 [OpenAI 相容模式](/zh-Hant/api-capabilities/openai/reasoning-models) 的關鍵區別：相容模式下推理模型無狀態、不暴露簽名；原生格式才有 `thoughtSignature` 且多輪需回傳。
</Tip>

## 流式響應（SSE）

端點 `…:streamGenerateContent`，每行 `data: {...}`，每塊的增量在 `candidates[0].content.parts[0].text`：

```text theme={null}
data: {"candidates":[{"content":{"parts":[{"text":"1"}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"text":"+1等於2。"}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"thoughtSignature":"EjQK…"}]},"finishReason":"STOP","index":0}],"usageMetadata":{...}}
```

<Warning>
  **經 API易 閘道，流式統一返回 SSE 的 `data:` 行**（加不加 `?alt=sse` 都一樣），**沒有 `[DONE]` 終止符**——以 `finishReason == "STOP"` 的那一塊為結束。最後一塊通常**只含 `thoughtSignature` 而無 `text`**。
</Warning>

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse",
    headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
    json={"contents": [{"parts": [{"text": "寫一首短詩"}]}]},
    stream=True, timeout=120,
)

text, usage = "", None
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue
    chunk = json.loads(line[6:])
    usage = chunk.get("usageMetadata", usage)        # 累計值，後到的覆蓋
    for cand in chunk.get("candidates", []):
        for p in cand.get("content", {}).get("parts", []):
            if "text" in p:                          # 跳過只含 thoughtSignature 的塊
                text += p["text"]
                print(p["text"], end="", flush=True)
print("\n", usage)
```

<Note>
  `usageMetadata` **每塊都帶，且是累計值**（`candidatesTokenCount` 隨輸出增長）——以**最後一塊**為準即可，無需自己累加。
</Note>

## 與 OpenAI 相容格式的關鍵差異

| 維度        | Gemini 原生（`/v1beta`）                    | OpenAI 相容（`/v1/chat/completions`） |
| --------- | --------------------------------------- | --------------------------------- |
| base\_url | `https://api.apiyi.com`（不帶 `/v1`）       | `https://api.apiyi.com/v1`        |
| 鑑權頭       | `x-goog-api-key`                        | `Authorization: Bearer`           |
| 正文位置      | `candidates[0].content.parts[].text`    | `choices[0].message.content`      |
| 流式增量      | 各塊 `parts[].text`                       | `choices[0].delta.content`        |
| 流式終止      | `finishReason == "STOP"`，**無 `[DONE]`** | `data: [DONE]`                    |
| 結束原因      | 大寫 `STOP` / `MAX_TOKENS`                | 小寫 `stop`                         |
| 思維簽名      | ✅ `thoughtSignature`（多輪需回傳）             | ❌ 不暴露                             |
| usage     | `usageMetadata`（流式每塊累計）                 | `usage`（流式尾部一次性）                  |

## usage 與計費

```python theme={null}
u = data["usageMetadata"]
# promptTokenCount  輸入 / candidatesTokenCount 輸出 / thoughtsTokenCount 思考 / totalTokenCount 總量
```

* `thoughtsTokenCount`（思考 token）按**輸出價**計費，可用 `thinking_level` 控檔省錢。
* 快取命中 `cachedContentTokenCount` 的折扣見 [Gemini 快取計費](/zh-Hant/api-capabilities/gemini/prompt-caching)。
* 各欄位完整說明見 [Gemini 原生格式呼叫指南](/zh-Hant/api-capabilities/gemini/native) 的「用量欄位」一節。

## 相關連結

* 同組頁面：[Gemini 原生格式呼叫指南](/zh-Hant/api-capabilities/gemini/native) · [多模態與程式碼執行](/zh-Hant/api-capabilities/gemini/multimodal) · [函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)
* 相容格式對照：[OpenAI 相容模式響應資料處理](/zh-Hant/api-capabilities/openai/response-handling)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
