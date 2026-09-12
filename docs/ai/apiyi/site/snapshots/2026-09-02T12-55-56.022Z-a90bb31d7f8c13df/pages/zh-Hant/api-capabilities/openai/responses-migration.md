> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 兩個端點怎麼選：GPT-5.4+ 遷移到 Responses

> GPT-5.4 起的模型在 /v1/chat/completions 上把工具呼叫和推理檔位一起傳，可能被直接 400 拒掉。這一頁講怎麼確認自己撞上了、兩條出路怎麼選、程式碼逐欄位怎麼改（含帶工具呼叫的完整前後對照）、以及改完怎麼驗證。

<Note>
  **一句話**：GPT-5.4 起的模型，在 `/v1/chat/completions` 上**同時傳 `tools` 和顯式的 `reasoning_effort`**（`none` 除外）可能被上游直接拒掉，報 400 `Function tools with reasoning_effort are not supported ...`。

  兩條出路：**把帶工具的請求改走 `/v1/responses`**（推理和工具都保留，推薦），或者**顯式設 `reasoning_effort="none"`**（保住端點，但放棄推理）。不帶 `tools` 的請求完全不受影響。
</Note>

## 先確認你是不是撞上了這條

有三種表現，第二種最容易誤判。

### 表現一：明確的 400

```text theme={null}
Function tools with reasoning_effort are not supported for gpt-5.6-sol in
/v1/chat/completions. To use function tools, use /v1/responses or set
reasoning_effort to 'none'.
```

響應裡 `param` 是 `reasoning_effort`。這是**上游 OpenAI 的官方限制**，不是 API易 閘道的問題——同一段請求直連 OpenAI 官方也是這個結果。

### 表現二：時靈時不靈

同一個模型可能掛著多條上游鏈路，**這條限制並不是每條鏈路都會攔**。我們 2026-09-02 在預設分組實測（同一把 KEY、同一時段，每個組合各發 6 次）：

| 模型              | `tools` + `reasoning_effort="medium"` |
| --------------- | ------------------------------------- |
| `gpt-5.6-luna`  | 6/6 返回 400                            |
| `gpt-5.6-sol`   | 6/6 返回 200，工具正常呼叫                     |
| `gpt-5.6-terra` | 6/6 返回 200，工具正常呼叫                     |
| `gpt-5.4`       | 6/6 返回 200，工具正常呼叫                     |

而同一天早些時候，有客戶在 `gpt-5.6-sol` 上實實在在收到了這條 400。

<Warning>
  **「我這次沒報錯」不能當作安全依據。** 同一個模型、同一段程式碼，換個時間點、換個分組就可能開始 400。要麼改走 Responses，要麼顯式 `reasoning_effort="none"`——這兩條在所有鏈路上都是穩定的。
</Warning>

### 表現三：沒報錯，但工具壓根沒被呼叫

如果模型該調工具卻回了一句閒聊（`finish_reason` 是 `stop`、`tool_calls` 為空），先別急著調提示詞：把 `reasoning_effort` 顯式設成 `none` 重發一次，工具能正常呼叫，就說明問題出在這個引數組合上，而不是提示詞寫得不好。

## 這條限制的範圍

|                                                                             | 是否受影響                       |
| --------------------------------------------------------------------------- | --------------------------- |
| `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4` 系列 | 受影響（取決於鏈路，見上）               |
| `gpt-5.2` / `gpt-5.1` / `gpt-5` 等更早的模型                                      | 不在官方公告的影響範圍內                |
| Claude / Gemini / Grok 等非 OpenAI 模型                                         | 無關，不受影響                     |
| 請求裡沒有 `tools`                                                               | 不受影響，`reasoning_effort` 隨便傳 |
| 走 `/v1/responses` 端點                                                        | 不受影響，推理 + 工具可以同時用           |

觸發條件是**顯式傳了非 `none` 的檔位**。`low` / `medium` / `high` / `xhigh` 四個檔位實測都會觸發。

<Note>
  **不傳 `reasoning_effort` 不會觸發。** 在 `gpt-5.6-luna` 這條穩定復現 400 的鏈路上，四個檔位全部 400，而不傳該引數時 6/6 正常返回 `tool_calls`。所以最小改動的應急方案其實有兩個：顯式 `none`，或者乾脆把這個引數刪掉。
</Note>

## 兩條出路怎麼選

|        | 改走 `/v1/responses` | 顯式 `reasoning_effort="none"` |
| ------ | ------------------ | ---------------------------- |
| 保留推理能力 | ✅ 完整保留，檔位照傳        | ❌ 關掉推理，模型少了規劃這一步             |
| 改動量    | 請求 / 響應結構都要改，見下文   | 加一個引數，一行                     |
| 穩定性    | 所有鏈路一致             | 所有鏈路一致                       |
| 適合誰    | Agent、多步工具編排、長期方案  | 線上救火、工具邏輯簡單、暫時改不動程式碼         |

帶工具的複雜任務，推理關掉之後模型的表現會明顯變差（少了「先想清楚該調哪個工具、按什麼順序調」這一步），所以 `none` 更適合當過渡手段。

## 不只是為了繞開報錯

即使你沒撞上這條限制，Responses 本身也是 OpenAI 給新專案的推薦端點。官方給出的差異是：同一個推理模型走 Responses 的 SWE-bench 成績更高、快取利用率比 Chat Completions 高一大截、`web_search` / `code_interpreter` 等內建工具只在這裡提供。細節和數字見 [原生呼叫](/zh-Hant/api-capabilities/openai/native)。

對賬單最直接的是快取那一條：**多輪 Agent 是快取命中的最大受益者**，而多輪 Agent 恰恰也是最容易撞上本頁這條限制的場景。快取怎麼算、怎麼看命中，見 [快取計費](/zh-Hant/api-capabilities/openai/prompt-caching)。

## 你屬於哪一類

| 你的接入方式                          | 走哪條路                                                                                                                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **自己寫程式碼**（OpenAI SDK / 裸 HTTP） | 直接改端點，見下一節                                                                                                                                                                                                           |
| **用框架**（LangChain 等）            | 先查框架有沒有 Responses 開關。LangChain 是 `ChatOpenAI(..., use_responses_api=True)`；沒有開關的框架只能退到 `reasoning_effort="none"` 或換模型                                                                                                |
| **用客戶端 / IDE 外掛**               | 客戶端側改不了，只能換支援 Responses 的客戶端。完整支援清單見 [原生呼叫的「客戶端支援現狀」](/zh-Hant/api-capabilities/openai/native)，Trae / Cline 的具體處理見 [Trae 接入](/zh-Hant/scenarios/programming/trae) 與 [Cline 接入](/zh-Hant/scenarios/programming/cline) |

## 程式碼怎麼改

完整的欄位對映表見 [原生呼叫](/zh-Hant/api-capabilities/openai/native)。這裡只講**工具呼叫相關**的四處差異，因為這正是本頁場景要動的部分：

|          | Chat Completions                             | Responses                                                 |
| -------- | -------------------------------------------- | --------------------------------------------------------- |
| 推理檔位     | 頂層 `reasoning_effort="medium"`               | 巢狀 `reasoning={"effort": "medium"}`                       |
| tools 定義 | 巢狀：`{"type": "function", "function": {...}}` | 扁平：`{"type": "function", "name": ..., "parameters": ...}` |
| 呼叫返回     | `message.tool_calls[]`，標識是 `id`              | `output` 裡的 `function_call` item，標識是 `call_id`            |
| 結果回傳     | `{"role": "tool", "tool_call_id": ...}`      | `{"type": "function_call_output", "call_id": ...}`        |

<Warning>
  兩套 tools 格式**不能混用**。把 Chat Completions 的巢狀 `function: {...}` 定義發給 `/v1/responses`（或反過來）是 SDK 報「引數無效」最常見的原因。更多細節見 [FC函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)。
</Warning>

同一個「查天氣」工具迴圈，改前改後完整對照：

<CodeGroup>
  ```python 改前：Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "查詢某地天氣",
          "parameters": {
              "type": "object",
              "properties": {"city": {"type": "string"}},
              "required": ["city"],
          },
      },
  }]

  messages = [{"role": "user", "content": "北京今天天氣怎麼樣？"}]

  resp = client.chat.completions.create(
      model="gpt-5.6-luna", messages=messages, tools=tools,
      reasoning_effort="medium",              # ← 與 tools 同傳，可能被上游拒絕
  )

  call = resp.choices[0].message.tool_calls[0]
  messages.append(resp.choices[0].message)    # 助手那一輪原樣接回
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

  ```python 改後：Responses theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_APIYI_KEY", base_url="https://api.apiyi.com/v1")

  tools = [{                                  # 扁平結構，沒有 function 這一層
      "type": "function",
      "name": "get_weather",
      "description": "查詢某地天氣",
      "parameters": {
          "type": "object",
          "properties": {"city": {"type": "string"}},
          "required": ["city"],
          "additionalProperties": False,
      },
  }]

  history = [{"role": "user", "content": "北京今天天氣怎麼樣？"}]

  resp = client.responses.create(
      model="gpt-5.6-luna", input=history, tools=tools,
      reasoning={"effort": "medium"},         # ← 巢狀寫法，這裡不受限制
  )

  call = next(i for i in resp.output if i.type == "function_call")
  history += resp.output                      # 整個 output 原樣接回歷史
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

兩段程式碼都在 API易 預設分組實測跑通：改前那段穩定復現 400，改後那段正常走完「呼叫 → 回傳 → 最終回答」全迴圈。

<Tip>
  `history += resp.output` 這一步別省。Responses 的 `output` 裡除了 `function_call`，還可能有 `reasoning` item —— 把它原樣帶回下一輪，模型才能接著上一輪的思路繼續，這也正是 Responses 在多步工具任務上更強的原因。
</Tip>

## 遷移時最容易踩的坑

<AccordionGroup>
  <Accordion title="response.output 不是 choices，別直接取 [0]">
    `output` 是一個 **item 陣列**，裡面可能同時有 `reasoning`、`message`、`function_call` 三類，順序和數量都不固定。取文本用 `resp.output_text`，取工具呼叫要遍歷篩 `type == "function_call"`，不要寫死下標。
  </Accordion>

  <Accordion title="引數改名：max_tokens / response_format / temperature">
    `max_tokens`（或 `max_completion_tokens`）改成 `max_output_tokens`；`response_format` 改成 `text.format`；系統提示詞可以從 `messages` 裡拿出來放到頂層 `instructions`。另外 gpt-5 系列推理模型**不支援 `temperature` / `top_p`**，兩個端點都一樣，傳了會報錯，刪掉改用 `reasoning.effort` 控制。
  </Accordion>

  <Accordion title="usage 欄位名全變了">
    `usage.prompt_tokens` → `usage.input_tokens`，`completion_tokens` → `output_tokens`，快取命中在 `usage.input_tokens_details.cached_tokens`。做用量統計的程式碼要一起改，否則會靜默統計成 0。
  </Accordion>

  <Accordion title="多輪：自管歷史永遠可用，鏈式取決於分組">
    最穩的做法是**自己維護 `input` 陣列**，把每輪的 `output` 原樣接回去——這條在任何分組、任何模型上都成立，也是本頁示例的寫法。

    `previous_response_id` 鏈式在 2026-09-02 的預設分組實測可用（`gpt-5.6-sol` / `terra` / `luna` / `gpt-5.4` 均能記住上一輪，且 `store` 預設為 `true`；顯式傳 `store: false` 後再鏈式會正確報「找不到上一條」）。但 `GET /v1/responses/{id}` 回取歷史仍不可用。**上線前請在你自己的分組裡驗一次**，別把它當作預設保證。相關背景見 [多輪對話指南](/zh-Hant/api-capabilities/multi-turn-conversation)。
  </Accordion>

  <Accordion title="流式事件是語義化的，不是 delta 拼接">
    Chat Completions 流式是一串 `delta` 增量，Responses 是帶型別的事件流（`response.output_text.delta`、`response.function_call_arguments.delta` 等）。流式解析邏輯要重寫，不能沿用。寫法見 [原生呼叫](/zh-Hant/api-capabilities/openai/native)。
  </Accordion>
</AccordionGroup>

## 遷移後怎麼驗證

改完別隻看 HTTP 200，按這四條過一遍：

<Steps>
  <Step title="確認 output 裡真的有 function_call">
    列印 `[i.type for i in resp.output]`，應該能看到 `function_call`（推理檔位高時前面還會有 `reasoning`）。只有 `message` 說明工具沒被呼叫。
  </Step>

  <Step title="確認 usage 欄位讀到了值">
    檢查 `usage.input_tokens` / `output_tokens` 不為 0，`output_tokens_details.reasoning_tokens` 能反映推理檔位的變化。
  </Step>

  <Step title="確認快取開始命中">
    多輪跑幾次，看 `usage.input_tokens_details.cached_tokens` 是否大於 0。這是 Responses 相比相容模式最直接的賬單收益。
  </Step>

  <Step title="把原來會 400 的那個請求重跑一遍">
    同樣的 `tools` + `reasoning_effort` 組合，走新端點應該穩定通過。留一條迴歸用例，之後換模型時能立刻發現問題。
  </Step>
</Steps>

## 什麼時候可以不遷

不必一刀切。以下場景留在相容模式完全合理：

* **根本不用工具呼叫** —— 這條限制與你無關，`reasoning_effort` 隨便傳
* **需要用同一套程式碼調多家模型** —— Claude、Gemini 等只有 `/v1/chat/completions` 這條通路，為 OpenAI 單獨分叉未必划算
* **框架 / 客戶端鎖死了端點** —— 先用 `reasoning_effort="none"` 頂住，等框架跟進
* **用 `gpt-5.2` 及更早的模型** —— 不在影響範圍內

相容模式的完整能力邊界見 [相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible)。

## 常見問題

<AccordionGroup>
  <Accordion title="reasoning_effort=none 到底損失了什麼？">
    模型不再做顯式推理，直接輸出。單步、工具選擇明確的任務影響不大；多步編排、需要「先想清楚呼叫順序」的 Agent 任務會明顯變差。它適合當過渡，不適合當終態。
  </Accordion>

  <Accordion title="能不能只在帶 tools 的請求上切端點？">
    可以，而且是常見的漸進式做法：普通對話繼續走 `/v1/chat/completions`，只把帶 `tools` 的那條鏈路改成 `/v1/responses`。兩個端點用同一把 KEY、同一個 base\_url，價格也完全一致。
  </Accordion>

  <Accordion title="換端點之後價格會變嗎？">
    不變。同一個模型在兩個端點上的輸入 / 輸出單價一樣，計費口徑也一樣。價格見 [模型與價格總覽](/zh-Hant/api-capabilities/model-info)。差別只在快取命中率——Responses 通常更高，實際賬單反而更省。
  </Accordion>

  <Accordion title="Claude、Gemini 受這條限制影響嗎？">
    不受影響。這是 OpenAI 對自家 GPT-5.4+ 模型的限制。Claude 走 `/v1/messages` 或相容模式、Gemini 走原生或相容模式，工具呼叫和思考都可以同時開。
  </Accordion>

  <Accordion title="為什麼 Pro 系列只能走 Responses？">
    `gpt-5.4-pro` / `gpt-5.5-pro` 這類模型在實務上只有 `/v1/responses` 可用（且需要 SVIP 分組）。它們執行時間長，配合 background 模式使用，相容模式承載不了這個互動形態。見 [原生呼叫](/zh-Hant/api-capabilities/openai/native)。
  </Accordion>

  <Accordion title="Chat Completions 會被廢棄嗎？">
    不會。被官方計劃關停的是 **Assistants API**，不是 Chat Completions。兩個端點都會長期支援，只是新功能優先落在 Responses。
  </Accordion>
</AccordionGroup>

## 相關頁面

<CardGroup cols={3}>
  <Card title="原生呼叫" icon="zap" href="/zh-Hant/api-capabilities/openai/native">
    Responses 端點的完整用法：引數、響應結構、內建工具、客戶端支援清單
  </Card>

  <Card title="相容模式呼叫" icon="plug" href="/zh-Hant/api-capabilities/openai/compatible">
    Chat Completions 的用法與能力邊界，各語言 SDK 配置
  </Card>

  <Card title="FC函式呼叫" icon="wrench" href="/zh-Hant/api-capabilities/openai/function-calling">
    兩個端點各自的工具呼叫完整示例與流式拼裝
  </Card>
</CardGroup>
