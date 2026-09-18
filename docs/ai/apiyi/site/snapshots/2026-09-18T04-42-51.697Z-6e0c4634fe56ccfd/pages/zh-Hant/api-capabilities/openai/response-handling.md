> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 相容模式：響應資料處理

> /v1/chat/completions 流式與非流式響應的統一解析方法：共性優先，附健壯解析參考實現，覆蓋各模型不影響接入的少數差異。

呼叫 [相容模式](/zh-Hant/api-capabilities/openai/compatible) 時，無論你用的是 OpenAI、Claude、Gemini、Grok、Qwen、GLM 還是其它模型，響應都遵循同一套 OpenAI schema。**絕大多數解析邏輯是通用的**——只要按本頁的統一寫法處理，換模型不用改程式碼。

本頁幫你把「響應資料處理」一次做對：先講共性，再用一張表列出**少數需要相容、但不影響接入**的差異點。

<Info>
  請求側（base\_url、鑑權、換模型）見 [相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible)。本頁只講**響應側**：拿到響應後怎麼解析。
</Info>

## 兩種模式，同一端點

同一個 `/v1/chat/completions`，只由 `stream` 引數決定返回形態：

|      | `stream: false`（預設）          | `stream: true`                  |
| ---- | ---------------------------- | ------------------------------- |
| 返回形態 | 單個 JSON 物件                   | SSE 資料流（多行 `data:`）             |
| 頂層型別 | `chat.completion`            | `chat.completion.chunk`         |
| 取正文  | `choices[0].message.content` | 累加各塊 `choices[0].delta.content` |
| 適用場景 | 後端任務、批處理、需完整結果               | 聊天 UI、需要逐字上屏                    |

## 非流式響應

結構穩定，取 `choices[0].message.content` 即可：

```json theme={null}
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4.1-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "1+1等於2。" },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 31, "completion_tokens": 8, "total_tokens": 39 }
}
```

<CodeGroup>
  ```python Python theme={null}
  resp = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "1+1等於幾？"}]
  )
  print(resp.choices[0].message.content)
  print(resp.usage.total_tokens)
  ```

  ```javascript Node.js theme={null}
  const resp = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: '1+1等於幾？' }]
  });
  console.log(resp.choices[0].message.content);
  console.log(resp.usage.total_tokens);
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{"model":"gpt-4.1-mini","messages":[{"role":"user","content":"1+1等於幾？"}]}'
  ```
</CodeGroup>

<Tip>
  非流式下七家主流模型高度一致，`choices[0].message.content` 可無差別取值。部分模型（如 OpenAI 系）`message` 裡還會帶 `annotations`、`refusal` 等欄位，按需讀取，不用則忽略即可。
</Tip>

## 流式響應（SSE）

流式以 Server-Sent Events 逐塊推送，每行形如 `data: {...}`，以 `data: [DONE]` 收尾：

```text theme={null}
data: {"choices":[{"delta":{"content":"1"},"index":0}], ...}
data: {"choices":[{"delta":{"content":"+1"},"index":0}], ...}
data: {"choices":[{"delta":{},"finish_reason":"stop","index":0}], ...}
data: [DONE]
```

用官方 SDK 時迭代即可，核心是**累加 `delta.content`**：

<CodeGroup>
  ```python Python theme={null}
  stream = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "寫一首短詩"}],
      stream=True
  )

  for chunk in stream:
      if chunk.choices and chunk.choices[0].delta.content:
          print(chunk.choices[0].delta.content, end="", flush=True)
  ```

  ```javascript Node.js theme={null}
  const stream = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: '寫一首短詩' }],
    stream: true
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
  ```
</CodeGroup>

## 接入要點：少數差異，統一處理

不同模型的流式細節略有出入，但**只要遵守下面幾條，就能用同一套程式碼相容全部模型**。

<Warning>
  **結束塊的 `choices` 可能是空陣列。** 攜帶 `usage` 的最後一塊，部分模型是 `"choices":[]`（如 gpt-4.1-mini、grok、qwen、glm），直接取 `choices[0]` 會越界報錯。**解析每塊前先判 `choices` 是否非空。**
</Warning>

| 差異點                 | 表現                                                             | 統一處理方式                            |
| ------------------- | -------------------------------------------------------------- | --------------------------------- |
| 結束塊 choices         | 可能為 `[]` 空陣列，也可能非空                                             | 取 delta 前先判 `choices` 非空          |
| `finish_reason` 中間值 | 多數為 `null`，claude 為 `""`（空串）                                   | 判結束統一用 `finish_reason === "stop"` |
| `usage` 出現位置        | 空 choices 塊 / 非空 choices 塊 / 與 `stop` 同塊                       | 三處都嘗試讀取，讀到即記錄                     |
| 分塊粒度                | 逐 token（gpt 系）或整句（gemini/claude）                               | 不影響——累加即可，無需關心顆粒                  |
| 首個角色宣告塊             | 有的先發一個空 content 塊宣告 `role`                                     | content 為空時跳過，不要當正文               |
| 廠商私有欄位              | `obfuscation`、`system_fingerprint`、`first_token_return_time` 等 | 一律忽略，不要硬依賴                        |

## 健壯解析參考實現

不依賴 SDK、直接處理原始 SSE 時，按下面的寫法可覆蓋上述全部差異：

<CodeGroup>
  ```python Python theme={null}
  import json, requests

  def stream_chat(model, messages, api_key):
      resp = requests.post(
          "https://api.apiyi.com/v1/chat/completions",
          headers={"Authorization": f"Bearer {api_key}",
                   "Content-Type": "application/json"},
          json={"model": model, "messages": messages, "stream": True},
          stream=True, timeout=300,
      )
      text, usage = "", None
      for line in resp.iter_lines(decode_unicode=True):
          if not line or not line.startswith("data: "):
              continue
          data = line[6:]
          if data == "[DONE]":
              break
          chunk = json.loads(data)
          if chunk.get("usage"):          # usage 可能出現在任意塊
              usage = chunk["usage"]
          choices = chunk.get("choices")
          if not choices:                 # 結束塊可能是空陣列，先判空
              continue
          delta = choices[0].get("delta", {})
          piece = delta.get("content")
          if piece:                       # 跳過 role 宣告等空 content 塊
              text += piece
              print(piece, end="", flush=True)
          if choices[0].get("finish_reason") == "stop":
              pass                        # 僅作結束標記，不要 break（usage 常在其後）
      return text, usage
  ```

  ```javascript Node.js theme={null}
  async function streamChat(model, messages, apiKey) {
    const resp = await fetch("https://api.apiyi.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", text = "", usage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();             // 保留可能不完整的最後一行

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return { text, usage };
        const chunk = JSON.parse(data);
        if (chunk.usage) usage = chunk.usage;        // usage 可能出現在任意塊
        const choices = chunk.choices;
        if (!choices || choices.length === 0) continue;  // 結束塊可能為空陣列
        const piece = choices[0].delta?.content;
        if (piece) { text += piece; process.stdout.write(piece); }
      }
    }
    return { text, usage };
  }
  ```
</CodeGroup>

<Note>
  推理模型（grok、qwen、glm 等）流式時會先推送 `delta.reasoning_content`（思考鏈），再推送 `delta.content`（正文）。上面的解析只取了 `content`，因此思考鏈被自動跳過。需要展示思考過程時的處理見 [推理模型輸出](/zh-Hant/api-capabilities/openai/reasoning-models)。
</Note>

## usage 與計費

* `usage` 在非流式響應裡隨結果一起返回；流式則在尾部某一塊裡返回（位置見上表，建議「讀到即覆蓋」）。
* 各家欄位細分不同：OpenAI 繫有 `completion_tokens_details`，Gemini/Claude 額外帶 `input_tokens`/`output_tokens`，推理模型帶 `reasoning_tokens`。統一以 `prompt_tokens` / `completion_tokens` / `total_tokens` 三個標準欄位為準。

<Warning>
  **流式 usage 的 `total_tokens` 不要全信。** 實測個別模型（如 gpt-5.4-mini）流式尾塊出現 `total ≠ prompt + completion` 的異常幀，同模型非流式則正常。**計費請以賬單為準**，不要用流式那一幀的 total 做結算。
</Warning>

## 相關連結

* 同組頁面：[相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible) · [推理模型輸出](/zh-Hant/api-capabilities/openai/reasoning-models) · [原生呼叫](/zh-Hant/api-capabilities/openai/native)
* 模型與價格：[模型與價格總覽](/zh-Hant/api-capabilities/model-info)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
