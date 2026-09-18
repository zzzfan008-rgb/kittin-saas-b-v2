> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Interactions API 與 generateContent 對比

> 詳解谷歌 Gemini 兩種 API 範式的差異：端點、請求響應結構、狀態管理、思考呈現與計費欄位，附 API易 閘道相容性實測結論

2026 年 6 月起，谷歌將 **Interactions API** 定為 GA（正式可用）並推薦所有新專案使用，經典的 **generateContent API** 轉為 legacy 但仍完全支援。官方文件（如 Nano Banana 圖片生成頁）已提供兩種範式的切換開關，很多開發者因此困惑：兩者差異是什麼？經 API易 閘道該用哪個？本文給出詳細對比與實測結論。

<Info>
  **API易 閘道當前狀態（2026 年 7 月 4 日實測）**：暫不支援 Interactions API 中轉——`/v1beta2/interactions` 與 `/v1beta/interactions` 路徑均返回 404。經 API易 呼叫 Gemini 請繼續使用 [generateContent 原生格式](/zh-Hant/api-capabilities/gemini/native)，本站全部 Gemini 文件均基於該格式；後續閘道支援 Interactions API 時會更新本頁。
</Info>

## 兩種範式是什麼

**generateContent** 是經典的無狀態介面：一次請求帶全部上下文，一次響應返回全部結果，端點為 `POST /v1beta/models/{模型名}:generateContent`。谷歌稱它"雖已被視為 legacy，但仍獲得完整支援"。

**Interactions API** 是谷歌 2026 年 6 月 GA 的新介面，端點為 `POST /v1beta2/interactions`。它圍繞核心資源 `Interaction`（一次完整的對話輪次或任務）設計，響應是一條按時間排列的**執行步驟（steps）時間線**——模型思考、工具呼叫與結果、最終輸出都是顯式的 step。官方明確：**今後主線模型之外的新模型、新 Agent 能力將優先在 Interactions API 上釋出**（來源：`ai.google.dev/gemini-api/docs/interactions-overview`）。

## 核心差異總覽

| 維度       | generateContent（經典）                                                                    | Interactions API（新）                                                                                             |
| -------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 端點       | `POST /v1beta/models/{模型名}:generateContent`                                            | `POST /v1beta2/interactions`                                                                                    |
| 輸入結構     | `contents[].parts[]`（按角色組織的多模態 part）                                                   | `input`（字串或內容塊，模型名放請求體）                                                                                         |
| 輸出結構     | `candidates[0].content.parts[]`                                                        | `steps[]` 時間線：`user_input` / `thought` / `function_call` / `function_result` / `model_output`                   |
| 多輪對話     | 客戶端自行拼接**全量歷史**逐輪重發                                                                    | `previous_interaction_id` 服務端續接（也可自帶歷史走無狀態）                                                                     |
| 思考呈現     | `thoughtsTokenCount` 計數；圖片模型的思考中間稿混在圖片 parts 裡返回                                       | 以 `steps`（`type: "thought"`）顯式返回，含思考文本與臨時圖片                                                                     |
| 流式輸出     | 專用端點 `:streamGenerateContent`                                                          | 同一端點，請求體加 `"stream": true`                                                                                      |
| 後臺執行     | 不支援                                                                                    | `"background": true`，適合長任務                                                                                      |
| 快取       | 顯式快取 + 隱式快取                                                                            | 無顯式快取；`previous_interaction_id` 可顯著提升隱式快取命中率                                                                    |
| 服務端資料保留  | 不儲存請求                                                                                  | 預設 `store: true`：付費層保留 **55 天**、免費層 1 天，可主動刪除；`store: false` 退回無狀態（但與 background、previous\_interaction\_id 不相容） |
| usage 欄位 | `promptTokenCount` / `candidatesTokenCount` / `thoughtsTokenCount` / `totalTokenCount` | `total_thought_tokens` / `total_output_tokens` 等（蛇形命名）                                                          |
| Agent 呼叫 | 不支援                                                                                    | 同一介面可直接呼叫 Deep Research、Antigravity 等官方 Agent                                                                   |
| 尚不支援的能力  | —（功能最全）                                                                                | Batch API、顯式快取、`video_metadata`、Python 自動函式呼叫、Gemini 3 遠端 MCP                                                   |
| SDK 入口   | `client.models.generate_content`（google-genai）                                         | `client.interactions.create`（google-genai ≥ 2.3.0 / @google/genai ≥ 2.3.0）                                      |

<Note>
  Interactions API 的服務端狀態管理有一個易踩的坑：`previous_interaction_id` **只續接對話歷史**，`tools`、`system_instruction`、`generation_config`（含 `thinking_level`、`temperature` 等）都是"單次互動作用域"，每一輪都要重新傳，否則不生效。
</Note>

## 請求與響應結構對比（文本單輪）

generateContent 示例可直接在 API易 閘道使用；Interactions API 示例為官方直連端點（API易 暫不支援）：

<CodeGroup>
  ```bash generateContent（API易 可用） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{
        "parts": [{ "text": "Tell me a joke." }]
      }]
    }'
  ```

  ```bash Interactions API（官方直連） theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "input": "Tell me a joke."
    }'
  ```
</CodeGroup>

兩者的響應結構差異（同一請求的兩種返回形態）：

<CodeGroup>
  ```json generateContent 響應 theme={null}
  {
    "candidates": [
      {
        "content": {
          "parts": [{ "text": "Why did the chicken cross the road? ..." }],
          "role": "model"
        },
        "finishReason": "STOP",
        "index": 0
      }
    ],
    "usageMetadata": {
      "promptTokenCount": 4,
      "candidatesTokenCount": 12,
      "totalTokenCount": 16
    }
  }
  ```

  ```json Interactions API 響應 theme={null}
  {
    "id": "int_123",
    "status": "completed",
    "steps": [
      {
        "type": "user_input",
        "status": "done",
        "content": [{ "type": "text", "text": "Tell me a joke." }]
      },
      {
        "type": "model_output",
        "status": "done",
        "content": [{ "type": "text", "text": "Why did the chicken cross the road?" }]
      }
    ]
  }
  ```
</CodeGroup>

## 多輪對話對比

這是兩者體驗差異最大的地方。generateContent 每一輪都要把**完整歷史**重新發一遍；Interactions API 只需帶上一輪的 `id`：

<CodeGroup>
  ```bash generateContent（全量重發歷史） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [
        { "role": "user",  "parts": [{ "text": "Hi, my name is Phil." }] },
        { "role": "model", "parts": [{ "text": "Hello Phil! How can I help?" }] },
        { "role": "user",  "parts": [{ "text": "What is my name?" }] }
      ]
    }'
  ```

  ```bash Interactions API（服務端續接） theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "previous_interaction_id": "int_123",
      "input": "What is my name?"
    }'
  ```
</CodeGroup>

服務端續接除了省去拼歷史的程式碼，還能讓隱式快取更容易命中對話字首，官方稱可降低多輪場景的 token 成本。代價是資料預設儲存在谷歌側（付費層 55 天），對資料合規敏感的業務需評估 `store` 語義。

## 圖片模型場景的差異

Gemini 3 系圖片模型（如 `gemini-3-pro-image`）預設帶思考過程，兩種範式對"思考中間稿圖片"的呈現完全不同：

* **generateContent（API易 閘道現行格式）**：思考中間稿以**普通圖片 part** 混在 `candidates[0].content.parts` 裡返回（帶 `thoughtSignature`、無 `thought` 標記），實測一次可返回 2–10 張、每張按 1120/2000 tokens 計入輸出——解析時務必遍歷 parts 並**取最後一張為最終稿**。完整實測與對賬口徑見 [usage 欄位與輸出解讀](/zh-Hant/api-capabilities/nano-banana-usage-metadata)。
* **Interactions API**：思考被顯式化為 `type: "thought"` 的 steps（含思考文本與臨時圖片），最終圖在 `model_output` step 中；SDK 另提供 `.output_image` / `.output_text` 便捷屬性。交錯圖文輸出（如圖文並茂的故事）仍需手動遍歷 steps。

## API易 閘道相容性實測

2026 年 7 月 4 日以測試 key 對 `api.apiyi.com` 的探測結果：

| 測試項                                                | 請求                      | 結果                      |
| -------------------------------------------------- | ----------------------- | ----------------------- |
| `POST /v1beta2/interactions` + Bearer 認證           | `gemini-2.5-flash` 最小請求 | ❌ 404（Invalid URL）      |
| `POST /v1beta/interactions` + Bearer 認證            | 同上                      | ❌ 404（Invalid URL）      |
| `POST /v1beta2/interactions` + `x-goog-api-key` 認證 | 同上                      | ❌ 404（Invalid URL）      |
| `POST /v1beta/models/{模型名}:generateContent`        | 文本/圖片各模型                | ✅ 正常（本站全部 Gemini 文件基於此） |

**結論：API易 閘道暫未開通 Interactions API 轉發**，多輪續接、Agent 呼叫、後臺執行等 Interactions 獨有能力現階段無法經閘道使用。

## 開發者建議

1. **經 API易 呼叫：繼續用 generateContent**。它功能最全（Batch、顯式快取、video\_metadata 反而只有它支援），且 generateContent 被官方承諾持續完整支援，短期內沒有停用風險。
2. **多輪對話在 generateContent 下的寫法**：客戶端拼接歷史即可，參考 [Gemini 原生格式呼叫](/zh-Hant/api-capabilities/gemini/native) 與 [多輪對話](/zh-Hant/api-capabilities/multi-turn-conversation)。
3. **如果你直連官方並考慮遷移到 Interactions API**，注意四點：`tools` / `system_instruction` / `generation_config` 每輪需重傳；`store` 預設開啟、付費層資料保留 55 天；Batch API 與顯式快取尚不可用；SDK 需升級 google-genai / @google/genai 到 2.3.0 以上。
4. **值得關注 Interactions API 的時機**：需要官方 Agent（Deep Research、Antigravity）、`background: true` 長任務、或多輪場景想靠服務端狀態省 token 時。API易 支援後本頁會第一時間更新。

## 相關文件

<CardGroup cols={2}>
  <Card title="Gemini 原生格式呼叫" icon="sparkles" href="/zh-Hant/api-capabilities/gemini/native">
    經 API易 使用 generateContent 原生格式的完整指南
  </Card>

  <Card title="Gemini 響應處理" icon="braces" href="/zh-Hant/api-capabilities/gemini/response-handling">
    candidates、parts、finishReason 的解析要點
  </Card>

  <Card title="usage 欄位與輸出解讀" icon="receipt-text" href="/zh-Hant/api-capabilities/nano-banana-usage-metadata">
    圖片模型 usageMetadata 欄位口徑與思考中間稿實測
  </Card>

  <Card title="多輪對話" icon="messages-square" href="/zh-Hant/api-capabilities/multi-turn-conversation">
    無狀態介面下的多輪對話實現方式
  </Card>
</CardGroup>
