> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Responses API 原生呼叫指南

> 通過 API易 呼叫 /v1/responses：狀態管理、推理引數、內建工具、語義化流式事件。OpenAI 官方推薦新專案首選的端點。

`/v1/responses` 是 OpenAI 當前的原生主力端點。官方原話："While Chat Completions remains supported, **Responses is recommended for all new projects**." API易 完整支援該端點，base\_url 換成 `https://api.apiyi.com/v1` 即可。

本頁基於 OpenAI 官方文件整理（`developers.openai.com/api/docs`，2026年6月資料），示例均可直接複製執行。

## 為什麼用 Responses

相比 Chat Completions，官方給出的三個硬數字：

* **推理更強**：同一個推理模型走 Responses 端點，SWE-bench 成績提升約 3%（推理狀態跨輪保持）
* **快取更省**：快取利用率比 Chat Completions 高 40%–80%（官方內部測試），輸入賬單直接受益
* **工具更多**：`web_search`、`code_interpreter` 等內建工具只在 Responses 提供

什麼時候仍然選 Chat Completions：你在用現成框架（LangChain、各類客戶端預設走 `/v1/chat/completions`），或需要用同一套程式碼調 Claude、Gemini 等非 OpenAI 模型 —— 見 [相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible)。

<Note>
  被棄用的是 **Assistants API**（官方計劃 2026年8月26日 關停），不是 Chat Completions。兩個端點都會長期支援，只是新功能優先落在 Responses。
</Note>

## 快速開始

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "input": "用一句話介紹你自己",
      "instructions": "你是一個簡潔的助手"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.responses.create(
      model="gpt-5.4",
      input="用一句話介紹你自己",
      instructions="你是一個簡潔的助手"
  )

  print(response.output_text)  # SDK 提供的便捷欄位，自動拼接文本輸出
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: '用一句話介紹你自己',
    instructions: '你是一個簡潔的助手'
  });

  console.log(response.output_text);
  ```
</CodeGroup>

<Tip>
  取結果優先用 `response.output_text`，不要手寫 `output[0].content[0].text` —— 推理模型的 `output` 陣列第一項往往是 `reasoning` 而不是 `message`，手寫下標會取錯。
</Tip>

## 請求引數速查表

| 引數                     | 型別             | 預設值    | 說明                                                                    |
| ---------------------- | -------------- | ------ | --------------------------------------------------------------------- |
| `model`                | string         | 必填     | 如 `gpt-5.4`、`gpt-5.5`                                                 |
| `input`                | string / array | 必填     | 使用者輸入，支援多模態 content 陣列                                                |
| `instructions`         | string         | null   | 系統指令（相當於 system prompt）                                               |
| `max_output_tokens`    | int            | null   | 最大輸出 token（含推理 token）                                                 |
| `reasoning`            | object         | medium | `{"effort": "none/low/medium/high/xhigh"}`                            |
| `text`                 | object         | —      | `format`（輸出格式）、`verbosity`（low/medium/high）                           |
| `tools`                | array          | \[]    | 函式 + 內建工具                                                             |
| `tool_choice`          | string         | "auto" | `auto` / `required` / `none` / 指定工具                                   |
| `parallel_tool_calls`  | boolean        | true   | 是否允許並行工具呼叫                                                            |
| `store`                | boolean        | true   | 服務端保留響應物件 —— ⚠️ **API易 下不可用**，見下方多輪對話一節                               |
| `previous_response_id` | string         | null   | 鏈式引用上一個響應 —— ⚠️ **API易 下不生效**，多輪請用 `input` 陣列自帶歷史                     |
| `conversation`         | string         | null   | 持久會話物件 —— ⚠️ **API易 下不支援**（`/v1/conversations` 返回 404）                |
| `background`           | boolean        | false  | 非同步後臺執行（長任務 / Pro 模型）                                                 |
| `stream`               | boolean        | false  | 流式輸出（語義化事件）                                                           |
| `prompt_cache_key`     | string         | null   | 快取路由鍵，提高命中率，見 [快取計費](/zh-Hant/api-capabilities/openai/prompt-caching) |
| `metadata`             | object         | {}     | 自定義後設資料                                                               |

<Warning>
  gpt-5 系列推理模型**不支援 `temperature` / `top_p`**，傳了會報錯。控制輸出風格請改用 `reasoning.effort` 和 `text.verbosity`。
</Warning>

## 響應結構

`output` 是一個 item 陣列，常見三種類型：`reasoning`（推理摘要）、`message`（文本回復）、`function_call`（函式呼叫請求）。精簡後的響應示例：

```json theme={null}
{
  "id": "resp_abc123",
  "object": "response",
  "status": "completed",
  "model": "gpt-5.4-2026-03-05",
  "output": [
    { "type": "reasoning", "summary": [] },
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "你好！我是一個 AI 助手。" }]
    }
  ],
  "usage": {
    "input_tokens": 24,
    "input_tokens_details": { "cached_tokens": 0 },
    "output_tokens": 58,
    "output_tokens_details": { "reasoning_tokens": 40 },
    "total_tokens": 82
  }
}
```

`usage` 裡兩個值得盯的欄位：

* `input_tokens_details.cached_tokens`：命中快取的輸入量（按 0.1× 計費）
* `output_tokens_details.reasoning_tokens`：推理消耗（按輸出價計費，調低 `reasoning.effort` 可控）

## 多輪對話：自己維護歷史

經 API易 呼叫 Responses API，多輪請**把完整歷史作為 `input` 陣列傳入**（每條帶 `role` / `content`），與 Chat Completions 的做法一致：

```python theme={null}
resp = client.responses.create(
    model="gpt-5.4",
    input=[
        {"role": "user", "content": "我叫 Alice，請記住。"},
        {"role": "assistant", "content": "好的，我記住了，你叫 Alice。"},
        {"role": "user", "content": "我叫什麼名字？"},
    ],
)
print(resp.output_text)  # 會回答 Alice
```

<Warning>
  **服務端會話狀態在 API易 下不可用，請勿依賴。** 經閘道實測（多模型、含延遲重試）：

  * `previous_response_id`：傳了不報錯（返回 200），但下一輪**不會記得**上一輪內容（`input_tokens` 僅為本輪量，未帶入歷史）；
  * `GET /v1/responses/{id}`：返回 400，**無法取回**已存響應；
  * `conversation` 持久會話物件（`/v1/conversations`）：返回 404，**不支援**。

  因此 `store` / `previous_response_id` / `conversation` 這幾個服務端狀態引數在 API易 上均**不要使用**，請統一採用上面的「`input` 陣列自管理歷史」方式。完整跨格式說明見 [多輪對話實現指南](/zh-Hant/api-capabilities/multi-turn-conversation)。
</Warning>

<Warning>
  **多輪不省輸入費**：每輪把完整歷史重新發送，全部上下文按輸入 token 全量計費。長對話省錢靠的是緩存摺扣（歷史字首自動命中 0.1× 快取價）—— 詳見 [快取計費](/zh-Hant/api-capabilities/openai/prompt-caching)。
</Warning>

## 推理與輸出控制

### reasoning.effort 檔位選型

| 檔位           | 適用場景                             |
| ------------ | -------------------------------- |
| `none`       | 簡單問答、格式轉換，要快要便宜                  |
| `low`        | 常規對話、摘要                          |
| `medium`（預設） | 日常開發的均衡選擇                        |
| `high`       | 複雜程式碼、多步推理                       |
| `xhigh`      | 最難的題，配合 `gpt-5.5` / `gpt-5.4` 使用 |

```python theme={null}
response = client.responses.create(
    model="gpt-5.5",
    input="證明根號2是無理數",
    reasoning={"effort": "xhigh"}
)
```

### text.verbosity 輸出長度

`low` / `medium`（預設）/ `high` 控制回答詳略，僅 Responses 端點支援：

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="解釋什麼是閉包",
    text={"verbosity": "low"}  # 給簡短版本
)
```

## 流式輸出

Responses 的流式是**語義化事件**，不是 Chat Completions 那種 `choices[0].delta` 通用塊。核心事件：

| 事件                                       | 含義                                           |
| ---------------------------------------- | -------------------------------------------- |
| `response.created`                       | 響應開始                                         |
| `response.output_item.added`             | 新增一個 output item（message / function\_call 等） |
| `response.output_text.delta`             | 文本增量                                         |
| `response.function_call_arguments.delta` | 函式引數增量                                       |
| `response.completed`                     | 全部完成（含最終 usage）                              |
| `error`                                  | 出錯                                           |

```python theme={null}
stream = client.responses.create(
    model="gpt-5.4",
    input="寫一首關於秋天的短詩",
    stream=True
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
    elif event.type == "response.completed":
        print("\n\n用量:", event.response.usage)
```

## 內建工具一覽

內建工具是 Responses 獨有能力，在 `tools` 數組裡宣告即可，無需自己實現執行邏輯：

| 工具     | type 值             | 說明                                                                                                                |
| ------ | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 網頁搜尋   | `web_search`       | 模型自主聯網檢索                                                                                                          |
| 檔案搜尋   | `file_search`      | 檢索已上傳的向量庫                                                                                                         |
| 程式碼直譯器 | `code_interpreter` | 沙箱裡跑 Python                                                                                                       |
| 計算機使用  | `computer_use`     | 操作虛擬桌面                                                                                                            |
| 遠端 MCP | `mcp`              | 連線遠端 MCP 伺服器                                                                                                      |
| 影像生成   | `image_generation` | 內嵌生圖。**API易 不建議**用此工具出圖（按次固定收費、穩定性無法保證），請走 [Images API](/zh-Hant/api-capabilities/gpt-image-2/text-to-image) 按量計費 |
| 工具搜尋   | `tool_search`      | 海量工具動態檢索（gpt-5.4 及之後模型）                                                                                           |

`web_search` 最小示例：

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="今天有哪些重要的 AI 新聞？",
    tools=[{"type": "web_search"}]
)
print(response.output_text)
```

<Info>
  內建工具依賴 OpenAI 服務端執行，API易 通道對各內建工具的透傳支援情況以實測為準。函式呼叫（自定義工具）完整支援，見 [FC函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)。
</Info>

## Pro 模型與 background 模式

`gpt-5.4-pro`、`gpt-5.5-pro` 是面向專業場景的深度推理模型（\$30 / \$180 每百萬 tokens，僅 **svip 分組**可用），實務上**僅通過 `/v1/responses` 呼叫**。單次請求耗時可達分鐘級，建議配合 `background: true` 非同步執行：

```python theme={null}
# 提交後臺任務
response = client.responses.create(
    model="gpt-5.4-pro",
    input="對這份架構方案做深度評審：...",
    background=True
)

# 輪詢取回結果
import time
while response.status in ("queued", "in_progress"):
    time.sleep(10)
    response = client.responses.retrieve(response.id)

print(response.output_text)
```

<Warning>
  Pro 模型價格高、速度慢，定位是"花幾分鐘換一個更靠譜的答案"。日常開發請用 `gpt-5.4` / `gpt-5.5`，沒有明確的深度推理需求不建議上 Pro。
</Warning>

## 支援的模型與價格

| 模型                  | 輸入（每 1M tokens） | 輸出（每 1M tokens） | 說明                                                    |
| ------------------- | --------------- | --------------- | ----------------------------------------------------- |
| `gpt-5.6-sol`       | \$4.00          | \$20.00         | 最新旗艦，1M 上下文，`gpt-5.6` 別名指向它；9/3 起降價，優惠期至少到 2026/11/21 |
| `gpt-5.6-terra`     | \$2.50          | \$15.00         | 5.6 系列均衡主力                                            |
| `gpt-5.6-luna`      | \$1.00          | \$6.00          | 5.6 系列輕量款                                             |
| `gpt-5.4`           | \$2.50          | \$15.00         | 上代主力，1M 上下文                                           |
| `gpt-5.4-mini`      | \$0.75          | \$4.50          | 輕量高性價比                                                |
| `gpt-5.5`           | \$5.00          | \$30.00         | 上代旗艦，複雜推理                                             |
| `gpt-5.2`           | \$1.75          | \$14.00         | 上代主力                                                  |
| `gpt-5.1` / `gpt-5` | \$1.25          | \$10.00         | 價格友好                                                  |
| `gpt-5.4-pro`       | \$30.00         | \$180.00        | 僅 svip，僅 responses，專業場景                               |
| `gpt-5.5-pro`       | \$30.00         | \$180.00        | 僅 svip，僅 responses，專業場景                               |

日期固定版本（如 `gpt-5.4-2026-03-05`）同步在售，價格與主版本一致。完整列表見 [模型與價格總覽](/zh-Hant/api-capabilities/model-info)。

## 與 Chat Completions 對照

<Warning>
  **GPT-5.4 及之後的模型（含 `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna`）在 `/v1/chat/completions` 上，「工具呼叫 + 顯式推理檔位」可能被上游拒絕**：請求帶 `tools` 且**顯式**傳了非 `none` 的 `reasoning_effort` 時會報 400 `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`。這是 OpenAI 的官方限制，本頁的 `/v1/responses` 端點沒有此限制——這類模型做工具呼叫請直接用 Responses。

  是否觸發**取決於請求落到哪條上游鏈路**，同一個模型可能這次 200、下次 400，所以不能靠「我這次沒報錯」判斷安全。實測資料、兩條出路的取捨與完整遷移步驟見 [端點選型與遷移](/zh-Hant/api-capabilities/openai/responses-migration)。
</Warning>

從 `/v1/chat/completions` 遷移過來的欄位對映：

| Chat Completions                       | Responses                              | 說明               |
| -------------------------------------- | -------------------------------------- | ---------------- |
| `messages` 陣列                          | `input`                                | 簡單場景直接傳字串        |
| `messages[0]` 的 system                 | `instructions`                         | 獨立引數             |
| `max_tokens` / `max_completion_tokens` | `max_output_tokens`                    | —                |
| `response_format`                      | `text.format`                          | —                |
| 頂層 `reasoning_effort`                  | `reasoning.effort`                     | Responses 裡是巢狀物件 |
| `choices[0].message.content`           | `output_text`                          | 取結果              |
| 無狀態，自己拼歷史                              | 同樣自己拼歷史（`input` 陣列）⚠️ 服務端狀態在 API易 下不可用 | —                |
| `usage.prompt_tokens`                  | `usage.input_tokens`                   | 欄位名不同            |

<CodeGroup>
  ```python Chat Completions（舊） theme={null}
  response = client.chat.completions.create(
      model="gpt-5.4",
      messages=[
          {"role": "system", "content": "你是一個簡潔的助手"},
          {"role": "user", "content": "你好"}
      ]
  )
  content = response.choices[0].message.content
  ```

  ```python Responses（新） theme={null}
  response = client.responses.create(
      model="gpt-5.4",
      input="你好",
      instructions="你是一個簡潔的助手"
  )
  content = response.output_text
  ```
</CodeGroup>

## 客戶端支援現狀

為什麼 Cline、Trae 等 VS Code 系 IDE / 外掛大多隻支援 `/v1/chat/completions`，不支援本頁的 Responses 端點？

* **chat/completions 是事實上的行業通用協議**：第三方閘道、本地推理框架（Ollama / vLLM / LM Studio）、各家非 OpenAI 廠商全都實現它，客戶端寫一套處理邏輯就能接幾百家供應商；而 `/v1/responses` 目前基本是 OpenAI 專屬方言
* **Responses 不是「換個 URL」**：語義化事件流（不是 delta 拼接）、item 化輸出、推理狀態傳遞都與 chat/completions 完全不同，客戶端需要重寫整個 agent 迴圈，維護成本高
* **雞生蛋問題**：客戶端不做，是因為大多數自定義端點（閘道）不支援 responses；閘道反過來也不急著做。API易 已託管 `/v1/responses`（即本頁），不存在閘道側障礙

截至 2026 年 7 月的主流客戶端支援情況：

| 客戶端                                                   | Responses 支援  | 說明                                                                                                                                     |
| ----------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Codex CLI](/zh-Hant/scenarios/programming/codex-cli) | ✅ 原生          | OpenAI 官方出品，agent 迴圈整個建在 Responses 上，2026 年初已棄用 chat/completions                                                                       |
| [opencode](/zh-Hant/scenarios/programming/opencode)   | ✅             | OpenAI provider 預設走 Responses                                                                                                          |
| [Roo Code](/zh-Hant/scenarios/programming/roo-code)   | ✅（止步 gpt-5.4） | 「OpenAI」provider 走 Responses 且支援自定義 Base URL（「OpenAI Compatible」仍是 chat/completions）；已停更，預置模型止步 `gpt-5.4`；可作為外掛裝進 Trae 等 VS Code 系 IDE |
| Continue                                              | ✅             | gpt-5 / o 系預設走 responses；已被 Cursor 收購，獨立產品收尾中                                                                                          |
| [Cline](/zh-Hant/scenarios/programming/cline)         | ❌             | OpenAI Compatible 方式固定 chat/completions，社群 feature request 尚未落地                                                                        |
| [Trae](/zh-Hant/scenarios/programming/trae)           | ❌             | 自定義模型僅 chat/completions 與 messages 兩種端點                                                                                                |

需要 GPT-5.4+「推理 + 工具呼叫」的場景，首選 Codex CLI / opencode，Base URL 指向 `https://api.apiyi.com/v1` 即可；只用到 `gpt-5.4`、又想留在 VS Code 系 IDE（含 Trae）裡的，可裝 Roo Code 外掛並選 OpenAI provider。

## 常見問題

| 現象                                                                | 原因與處理                                                                                                                                                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model_not_supported` 報錯                                          | 該模型不支援 responses 端點，換 gpt-5 系列                                                                                                                                                    |
| 多輪不記得上文                                                           | 最穩的做法是用 `input` 陣列自帶完整歷史；`previous_response_id` 鏈式 2026-09-02 實測可用，但 `GET /v1/responses/{id}` 回取仍不可用，依賴前請在自己的分組驗一次                                                                |
| `output_text` 為空                                                  | 輸出全是 `function_call` item（模型在要求調函式），檢查 `output` 陣列逐項處理                                                                                                                            |
| 傳 `temperature` 報錯                                                | gpt-5 推理模型不支援，刪掉改用 `reasoning.effort`                                                                                                                                             |
| `Function tools with reasoning_effort are not supported ...`（400） | GPT-5.4+ 在 `/v1/chat/completions` 的官方限制（tools 與顯式非 `none` 的 reasoning\_effort 互斥），改用本頁 `/v1/responses` 端點即可，遷移步驟見 [端點選型與遷移](/zh-Hant/api-capabilities/openai/responses-migration) |

## 相關連結

* 同組頁面：[相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible) · [端點選型與遷移](/zh-Hant/api-capabilities/openai/responses-migration) · [快取計費](/zh-Hant/api-capabilities/openai/prompt-caching) · [FC函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
* OpenAI 官方遷移指南：`developers.openai.com/api/docs/guides/migrate-to-responses`
