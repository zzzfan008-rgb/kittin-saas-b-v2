> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI 相容模式：推理模型輸出

> /v1/chat/completions 下推理模型的輸出特點：思考型（reasoning_content）、思考簽名、結構化輸出，附各模型實測支援度。

推理模型（reasoning models）在回答前會先「思考」。通過 [相容模式](/zh-Hant/api-capabilities/openai/compatible) 呼叫時，它們的輸出比普通模型多了一些細節。本頁講清三件事：**思考內容怎麼拿、多輪怎麼傳、結構化輸出怎麼穩**。

<Info>
  本頁聚焦 `/v1/chat/completions` 相容模式。Claude 原生格式的思考塊（`/v1/messages` 的 `thinking`）見 [Claude Effort 思考指南](/zh-Hant/api-capabilities/claude-effort-thinking)；Gemini 原生的 `thinking_level` 與 `thought_signature` 見 [Gemini 原生呼叫](/zh-Hant/api-capabilities/gemini/native)。
</Info>

## 推理模型輸出總覽

相容模式下，推理模型在「是否輸出思考文本」上分三類：

| 型別       | 代表模型                                                | 思考內容                             | 取正文方式                                 |
| -------- | --------------------------------------------------- | -------------------------------- | ------------------------------------- |
| 不輸出思考    | gpt-4.1-mini、gemini-3.1-flash-lite、claude-haiku-4-5 | 無                                | 與普通模型一致                               |
| 輸出思考文本   | grok-4.3、qwen3.6-plus、glm-5.1                       | `reasoning_content` 欄位           | 正文在 `content`，思考在 `reasoning_content` |
| 僅計 token | gpt-5.4-mini                                        | 不返回文本，僅 `usage.reasoning_tokens` | 與普通模型一致                               |

<Tip>
  無論哪一類，**正文永遠在 `content`**。只要你只讀 `content`，所有推理模型都能像普通模型一樣接入；想額外展示思考過程，再去讀 `reasoning_content`。
</Tip>

## 思考型：reasoning\_content

會輸出思考文本的模型，把思考鏈放在與 `content` 平行的 `reasoning_content` 欄位。

**非流式**——`message` 同時含兩者：

```json theme={null}
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "1+1等於2。",
      "reasoning_content": "使用者在問 1+1 ……（一段思考過程）"
    },
    "finish_reason": "stop"
  }]
}
```

```python theme={null}
msg = resp.choices[0].message
print("正文：", msg.content)
# 思考過程（僅部分模型有，SDK 裡可能在 model_extra 中）
print("思考：", getattr(msg, "reasoning_content", None))
```

**流式**——先推送一連串 `delta.reasoning_content`，思考完才開始推送 `delta.content`。務必把兩者**分流渲染**（思考摺疊、正文上屏），否則介面會先刷一大段思考：

```python theme={null}
for chunk in stream:
    if not chunk.choices:
        continue
    delta = chunk.choices[0].delta
    reasoning = getattr(delta, "reasoning_content", None)
    if reasoning:
        render_thinking(reasoning)   # 摺疊區/灰字
    if delta.content:
        render_answer(delta.content) # 正文區
```

<Warning>
  **流式裡 reasoning 與 content 的「互斥」寫法三家不同**，解析時三種都要容忍：

  * **grok-4.3**：思考階段只有 `reasoning_content` 鍵，正文階段只有 `content` 鍵（另一個鍵直接不出現）。
  * **qwen3.6-plus**：兩個鍵都在，非當前的為 `null`。
  * **glm-5.1**：思考階段 `content` 為 `""`（空串）+ `reasoning_content` 有值。

  統一做法：用「真值判斷」取值（`if reasoning:` / `if content:`），自動跳過缺失、`null`、`""` 三種空態。
</Warning>

<Note>
  推理 token 可能遠超正文。實測一個「1+1」級問題，grok-4.3 的 `reasoning_tokens` 可達數百，而正文只有幾個 token。思考鏈按輸出 token 計費，**對延遲和成本敏感的場景請評估是否需要開啟 / 展示思考**。
</Note>

## 思考簽名與多輪對話

「思考簽名」（thought signature）是 **Gemini 原生格式**的概念：原生多模態 / 函式呼叫裡，模型會返回加密的 `thought_signature`，多輪時需原樣回傳以保持推理連續性（詳見 [Gemini 原生呼叫](/zh-Hant/api-capabilities/gemini/native) 與 [Gemini 函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)）。

**在 `/v1/chat/completions` 相容模式下，推理模型是無狀態的：**

* 多輪對話只需把上一輪 assistant 的 **`content`** 放進 messages 歷史即可；
* **無需回傳 `reasoning_content`**，響應裡也**不出現任何 signature 欄位**；
* 實測 gemini-3.1-flash-lite、grok-4.3 在僅回傳 `content` 的情況下，多輪上下文記憶均正常。

```python theme={null}
messages = [
    {"role": "user", "content": "記住數字 42。"},
    {"role": "assistant", "content": "好的，我記住了 42。"},  # 只回傳 content
    {"role": "user", "content": "剛才那個數字乘以2是多少？"}
]
# grok-4.3 / gemini-3.1-flash-lite 均正確回答 84
```

<Tip>
  需要跨輪保留 Gemini 的思考簽名、或用 Claude 的原生思考塊做多輪，請改用對應的**原生格式**端點，而非相容模式。
</Tip>

## 結構化輸出

通過 `response_format` 讓模型只吐 JSON。兩種型別：

```python theme={null}
# 1) json_schema：嚴格按 schema 約束欄位（OpenAI 標準）
response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "city_info",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "population": {"type": "integer"},
                "is_capital": {"type": "boolean"}
            },
            "required": ["city", "population", "is_capital"],
            "additionalProperties": False
        }
    }
}

# 2) json_object：只保證是合法 JSON，不約束欄位
response_format = {"type": "json_object"}
```

### 各模型實測支援度

`json_schema` 各家支援參差，**這是結構化輸出最大的坑**：

| 模型                    | `json_schema`                     | `json_object` | content 可否直接 parse |
| --------------------- | --------------------------------- | ------------- | ------------------ |
| gpt-4.1-mini          | ✅ 嚴格遵守                            | ✅             | ✅ 純 JSON           |
| gemini-3.1-flash-lite | ✅                                 | ✅             | ✅                  |
| grok-4.3              | ✅（另帶思考鏈）                          | ✅             | ✅ content 為純 JSON  |
| gpt-5.4-mini          | ⚠️ JSON 對，但前面帶 `<think>…</think>` | —             | ❌ 需先剝離 think 塊     |
| qwen3.6-plus          | ⚠️ 報 400：messages 須含 "json" 字樣    | ✅             | ✅                  |
| claude-haiku-4-5      | ❌ 忽略 schema，返回 Markdown           | —             | ❌                  |
| glm-5.1               | ❌ 忽略 schema，返回自然語言                | ✅             | json\_object 下 ✅   |

### 跨模型穩定拿 JSON 的建議

<Warning>
  不要假設 `json_schema` 在所有模型上都生效。要跨模型穩定，推薦組合拳：

  1. 優先用 `json_object`，相容性比 `json_schema` 好；
  2. prompt 裡**明確寫「只返回 JSON」並出現 "json" 字樣**（qwen 強制要求，其它模型也更穩）；
  3. 解析前做**容錯**：剝離 ` ```json ` 程式碼塊圍欄、剝離 `<think>…</think>` 字首，再 `json.loads`，失敗則降級處理。
</Warning>

````python theme={null}
import json, re

def parse_json_loose(content: str):
    # 去掉 <think>…</think> 字首（gpt-5.4-mini）
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()
    # 去掉 ```json 程式碼塊圍欄
    content = re.sub(r"^```(json)?|```$", "", content, flags=re.M).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None   # 降級：記錄原文 / 重試 / 換模型
````

## 相關連結

* 同組頁面：[響應資料處理](/zh-Hant/api-capabilities/openai/response-handling) · [相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible) · [函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)
* 原生格式思考：[Claude Effort 思考指南](/zh-Hant/api-capabilities/claude-effort-thinking) · [Gemini 原生呼叫](/zh-Hant/api-capabilities/gemini/native)
* 模型與價格：[模型與價格總覽](/zh-Hant/api-capabilities/model-info)
