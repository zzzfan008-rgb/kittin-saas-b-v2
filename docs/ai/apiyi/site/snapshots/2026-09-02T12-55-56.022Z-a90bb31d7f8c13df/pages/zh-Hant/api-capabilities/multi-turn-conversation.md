> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 多輪對話實現指南

> 在 API易 實現多輪對話：OpenAI 相容模式（多模型通用）、OpenAI/Gemini/Anthropic 原生格式的歷史維護方式、對比與常見問題。

大模型本身**沒有記憶**——它不會記得你上一句說了什麼。所謂"多輪對話"，本質是**每次請求都把完整的對話歷史一起發給模型**。本指南講清在 API易 平臺上，四種呼叫格式各自怎麼維護歷史、有哪些坑。

<Info>
  本文示例端點統一為 `https://api.apiyi.com`，金鑰用你的 [API易 令牌](https://api.apiyi.com/token)。涉及模型：`gpt-5.4-mini`、`deepseek-v4-pro`、`gemini-3.5-flash`、`claude-sonnet-4-6`。
</Info>

## 核心原理：自己維護歷史

記住一句話就夠了：**模型無狀態，對話歷史由你（客戶端）維護，每輪把全部歷史重新發一遍。**

```text theme={null}
第1輪：發 [使用者問1]                          → 得 [回覆1]
第2輪：發 [使用者問1, 回覆1, 使用者問2]           → 得 [回覆2]
第3輪：發 [使用者問1, 回覆1, 使用者問2, 回覆2, 使用者問3] → 得 [回覆3]
```

每多一輪，就把上一輪的"使用者提問"和"模型回覆"**追加**到歷史陣列末尾，再整體發出。四種格式的差異只是**歷史陣列叫什麼名字、角色怎麼寫**而已。

<Warning>
  **在 API易 平臺，請一律採用"自己維護歷史"的方式。** 不要依賴任何服務端會話狀態（如 OpenAI Responses 的 `previous_response_id`）——經閘道轉發後該機制不保證生效，詳見下文 OpenAI 原生一節。
</Warning>

## OpenAI 相容模式（多模型通用）

最通用的方式，端點 `/v1/chat/completions`。歷史放在 `messages` 數組裡，每條帶 `role`（`system` / `user` / `assistant`）。**換個 `model` 名就能用同一套程式碼調不同模型**（gpt、deepseek、claude、gemini…）。

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  messages = [{"role": "system", "content": "你是一個友好的助手。"}]

  def chat(user_input, model="gpt-5.4-mini"):
      messages.append({"role": "user", "content": user_input})
      resp = client.chat.completions.create(model=model, messages=messages)
      reply = resp.choices[0].message.content
      messages.append({"role": "assistant", "content": reply})  # 追加回復進歷史
      return reply

  print(chat("我叫小明，今年28歲，請記住。"))
  print(chat("我今年多少歲？再加5歲是多少？"))  # 模型記得 → 28，33
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({ apiKey: 'YOUR_API_KEY', baseURL: 'https://api.apiyi.com/v1' });
  const messages = [{ role: 'system', content: '你是一個友好的助手。' }];

  async function chat(userInput, model = 'gpt-5.4-mini') {
    messages.push({ role: 'user', content: userInput });
    const resp = await client.chat.completions.create({ model, messages });
    const reply = resp.choices[0].message.content;
    messages.push({ role: 'assistant', content: reply });   // 追加回復進歷史
    return reply;
  }

  console.log(await chat('我叫小明，今年28歲，請記住。'));
  console.log(await chat('我今年多少歲？'));
  ```

  ```bash cURL theme={null}
  {/* 第2輪：把第1輪的問與答都帶上 */}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "deepseek-v4-pro",
      "messages": [
        {"role": "user", "content": "我叫小明，今年28歲，請記住。"},
        {"role": "assistant", "content": "好的，我記住了：你叫小明，今年28歲。"},
        {"role": "user", "content": "我今年多少歲？"}
      ]
    }'
  ```
</CodeGroup>

<Tip>
  **一套程式碼多模型**：把上面的 `model` 換成 `deepseek-v4-pro`、`claude-sonnet-4-6`、`gemini-3.5-flash` 等任意模型，多輪邏輯完全不變。模型清單見 [模型與價格總覽](/zh-Hant/api-capabilities/model-info)。
</Tip>

### 推理模型的歷史處理

像 `deepseek-v4-pro` 這樣的推理模型，響應裡會多一個 `reasoning_content`（思考過程）欄位。

<Warning>
  **歷史裡只放 `content`，不要回傳 `reasoning_content`。** 思考過程只是本輪的中間產物，回傳它既浪費 token，也不符合上游規範（DeepSeek 官方直連甚至會因此報 400）。正確做法是追加歷史時只取 `content`：

  ```python theme={null}
  messages.append({"role": "assistant", "content": resp.choices[0].message.content})
  # 不要把 resp.choices[0].message.reasoning_content 放進去
  ```
</Warning>

推理模型在響應解析上的更多細節，見 [推理模型輸出](/zh-Hant/api-capabilities/openai/reasoning-models)。

## OpenAI 原生格式（Responses API）

端點 `/v1/responses`。多輪時**把完整歷史作為 `input` 陣列**傳入（每條帶 `role` / `content`），用法與相容模式同理：

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

resp = client.responses.create(
    model="gpt-5.4-mini",
    input=[
        {"role": "user", "content": "記住暗號：紫色大象。"},
        {"role": "assistant", "content": "記住了，暗號是紫色大象。"},
        {"role": "user", "content": "暗號是什麼？"},
    ],
)
print(resp.output_text)   # 暗號是：紫色大象。
```

<Warning>
  **不要依賴 `previous_response_id` / `conversation` / `store` 等服務端狀態。** 經 API易 閘道實測：傳 `previous_response_id` 不報錯（返回 200），但下一輪**並不會記得**上一輪內容，`GET /v1/responses/{id}` 也不可用。因此在 API易 平臺，Responses API 也請按上面的**自管理歷史**（`input` 陣列）方式使用。
</Warning>

## Gemini 原生格式

端點 `/v1beta/models/{model}:generateContent`。歷史放在 `contents` 數組裡，注意 **role 取值是 `user` / `model`**（不是 `assistant`），每條的內容在 `parts` 裡。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_API_KEY",
                      http_options={"base_url": "https://api.apiyi.com"})

contents = [
    {"role": "user", "parts": [{"text": "記住暗號：紫色大象。"}]},
    {"role": "model", "parts": [{"text": "好的，我記住了：紫色大象。"}]},
    {"role": "user", "parts": [{"text": "暗號是什麼？"}]},
]
resp = client.models.generate_content(model="gemini-3.5-flash", contents=contents)
print(resp.text)   # 暗號是：紫色大象。
```

<Tip>
  **更省事的寫法**：官方 `google-genai` SDK 的 `client.chats.create(...)` 會自動維護 `contents` 歷史，你只管 `send_message`，無需手動拼接。
</Tip>

<Note>
  Gemini 3 系列響應的 part 上會帶 `thoughtSignature`（思維簽名）。**普通文本多輪只回傳 `text` 即可記住上下文**（更省 token）；只有在**函式呼叫**等需要嚴格推理連續性的場景才需把 `thoughtSignature` 原樣回傳——官方 SDK 會自動處理。詳見 [Gemini 原生呼叫](/zh-Hant/api-capabilities/gemini/native) 與 [函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)。
</Note>

## Anthropic 原生格式

端點 `/v1/messages`。歷史放在 `messages` 數組裡，role 取值 `user` / `assistant`，`content` 用字串簡寫即可。注意 **`max_tokens` 必填**。

```python theme={null}
import requests

def chat(messages):
    r = requests.post(
        "https://api.apiyi.com/v1/messages",
        headers={
            "content-type": "application/json",
            "anthropic-version": "2023-06-01",
            "x-api-key": "YOUR_API_KEY",
        },
        json={"model": "claude-sonnet-4-6", "max_tokens": 200, "messages": messages},
        timeout=60,
    )
    return "".join(b["text"] for b in r.json()["content"] if b["type"] == "text")

messages = [{"role": "user", "content": "記住暗號：紫色大象。"}]
reply = chat(messages)
messages.append({"role": "assistant", "content": reply})       # 追加回復
messages.append({"role": "user", "content": "暗號是什麼？"})
print(chat(messages))   # 暗號是：紫色大象。
```

<Tip>
  也可以用官方 `anthropic` SDK，把 base\_url 指向 `https://api.apiyi.com` 即可。響應是 `content` 塊陣列，解析細節見 [Claude 流式與非流式響應](/zh-Hant/api-capabilities/claude-response-handling)。
</Tip>

## 四種格式對比

| 維度      | OpenAI 相容              | OpenAI 原生(Responses) | Gemini 原生                   | Anthropic 原生   |
| ------- | ---------------------- | -------------------- | --------------------------- | -------------- |
| 端點      | `/v1/chat/completions` | `/v1/responses`      | `/v1beta/…:generateContent` | `/v1/messages` |
| 歷史欄位    | `messages`             | `input`              | `contents`                  | `messages`     |
| role 取值 | system/user/assistant  | user/assistant       | **user/model**              | user/assistant |
| 內容寫法    | `content` 字串           | `content` 字串         | `parts: [{text}]`           | `content` 字串   |
| 歷史維護方   | 自己拼                    | 自己拼                  | 自己拼                         | 自己拼            |
| 服務端會話狀態 | 無                      | ⚠️ 不可用               | 無                           | 無              |
| 多模型通用   | ✅ 換 model 名即可          | 僅 OpenAI 系           | 僅 Gemini                    | 僅 Claude       |

<Tip>
  **選型建議**：要用同一套程式碼調多家模型 → 首選 **OpenAI 相容模式**；要用某家原生獨有能力（Gemini 思維簽名 / 程式碼執行、Claude 思考塊與快取、OpenAI 內建工具）→ 用對應**原生格式**。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="對話越長，費用越高嗎？">
    是。每輪都要把完整歷史重新發送，所以**輸入 token 隨輪數增長**，費用也隨之上升。省錢主要靠**上下文快取**：相同的歷史字首會自動命中快取價（遠低於原價）。各家快取見 [OpenAI 快取](/zh-Hant/api-capabilities/openai/prompt-caching)、[Claude 快取](/zh-Hant/api-capabilities/claude-prompt-caching)、[Gemini 快取](/zh-Hant/api-capabilities/gemini/prompt-caching)。
  </Accordion>

  <Accordion title="歷史要保留多少輪？超出上下文怎麼辦？">
    沒有硬性要求，但歷史越長越貴、也可能超出模型上下文視窗。常見策略：① **滑動視窗**——只保留最近 N 輪；② **摘要壓縮**——把早期對話總結成一段話放進 system；③ 始終保留 system 指令 + 最近若干輪。按業務對"記憶深度"的需要權衡。
  </Accordion>

  <Accordion title="system / 系統指令放在哪裡？">
    OpenAI 相容與 Anthropic：放在 `messages` 最前面（相容模式用 `role:"system"`；Anthropic 用頂層 `system` 欄位或首條訊息）。Gemini：用 `config.system_instruction`。系統指令**只需設定一次**，不必每輪重複追加。
  </Accordion>

  <Accordion title="推理模型的思考過程（reasoning_content）要回傳嗎？">
    **不要。** 思考過程是本輪中間產物，歷史裡只回傳最終 `content`（Gemini 只回傳 `text`）。回傳思考既費 token，部分上游還會報錯。函式呼叫場景下 Gemini 的 `thoughtSignature` 是例外——官方 SDK 會自動處理。
  </Accordion>

  <Accordion title="能不能讓服務端幫我記住對話，不用每次發歷史？">
    在 API易 平臺**不建議依賴服務端會話狀態**。OpenAI Responses 的 `previous_response_id` 經閘道轉發後不保證生效（實測不記憶）。請統一採用客戶端自維護歷史的方式，行為最穩定、跨模型一致。
  </Accordion>
</AccordionGroup>

## 相關連結

* 呼叫基礎：[OpenAI 相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible) · [OpenAI 原生呼叫](/zh-Hant/api-capabilities/openai/native) · [Gemini 原生呼叫](/zh-Hant/api-capabilities/gemini/native) · [Claude API 基礎](/zh-Hant/api-capabilities/claude)
* 響應解析：[OpenAI 響應資料處理](/zh-Hant/api-capabilities/openai/response-handling) · [推理模型輸出](/zh-Hant/api-capabilities/openai/reasoning-models) · [Claude 流式與非流式響應](/zh-Hant/api-capabilities/claude-response-handling) · [Gemini 流式與非流式響應](/zh-Hant/api-capabilities/gemini/response-handling)
* 模型與價格：[模型與價格總覽](/zh-Hant/api-capabilities/model-info)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
