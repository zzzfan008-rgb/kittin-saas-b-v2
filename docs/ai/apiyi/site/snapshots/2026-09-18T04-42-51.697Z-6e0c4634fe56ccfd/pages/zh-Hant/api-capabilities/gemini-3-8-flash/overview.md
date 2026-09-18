> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash 文本生成

> 谷歌 Gemini 3.8 Flash 多模態文本模型：API易 雙端點開通，輸入 $0.75、輸出 $3.75 每 1M tokens，是 3.6 Flash 的一半。含 150 例上線前實測資料與從 3.6 / 3.7 遷移的注意事項。

Gemini 3.8 Flash（`gemini-3.8-flash`）是谷歌 2026 年 9 月 2 日推出的多模態文本模型，支援文本 / 影像 / 影片 / 音訊輸入。API易 已開通 **Gemini 原生**與 **OpenAI 相容**雙端點，並在上線前完成 **150 例雙協議成對實測**（以 `gemini-3.7-flash` 為參照）。

<Info>
  **API易 已接入 Gemini 3.8 Flash**：模型名 `gemini-3.8-flash`，`default` / `svip` 分組可用。**預設開啟深度思考**（思考 tokens 計入輸出計費），對延遲和成本敏感的場景請調低思考檔位或關閉思考（詳見下方「思考控制」）。
</Info>

<Warning>
  **官方規格尚未公佈**：截至本頁釋出，谷歌的 Gemini API 模型列表與 DeepMind 模型卡都還沒有收錄 3.8 Flash，官方釋出部落格也未上線。因此**上下文視窗、最大輸出、知識截止、官方基準分數本頁一律標註"官方未公佈"**，不做轉述也不做推測。本頁所有"實測"標記的內容均來自 API易 自己的測試，官方材料釋出後會同步補齊。
</Warning>

## 核心優勢

<CardGroup cols={2}>
  <Card title="比 3.6 Flash 便宜一半" icon="dollar-sign">
    輸入 \$0.75 / 輸出 \$3.75 每 1M tokens，是 3.6 Flash（\$1.50 / \$7.50）的一半；與 3.7 Flash 逐項同價，從 3.7 平遷零成本變化。
  </Card>

  <Card title="上線前 150 例實測" icon="clipboard-check">
    與 3.7 Flash 成對同時發起、雙協議覆蓋，核心能力、推理、並行工具呼叫、圖片影片理解逐項對齊，未發現 3.8 獨有回退。
  </Card>

  <Card title="雙端點無縫接入" icon="git-fork">
    Gemini 原生格式（官方 SDK 直連，無需 Google API Key）與 OpenAI 相容格式（改 base\_url 即用）同時開通。
  </Card>

  <Card title="遷移成本接近於零" icon="arrow-right-arrow-left">
    從 3.7 Flash 只改模型名：請求結構、引數、返回欄位均不變，實測響應欄位集差異僅 1 組且無欄位型別變化。
  </Card>
</CardGroup>

## 模型資訊

| 引數               | 值                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| **模型名稱**         | `gemini-3.8-flash`                                                                                |
| **輸入模態**         | 文本、影像、影片、音訊（影像與影片已實測）                                                                             |
| **輸出模態**         | 文本                                                                                                |
| **上下文視窗 / 最大輸出** | 官方未公佈                                                                                             |
| **知識截止**         | 官方未公佈                                                                                             |
| **可用分組**         | `default`、`svip`                                                                                  |
| **端點**           | `POST /v1beta/models/gemini-3.8-flash:generateContent`（原生）、`POST /v1/chat/completions`（OpenAI 相容） |
| **深度思考**         | 預設開啟；`thinkingLevel` 三檔（low / medium / high）；`thinkingBudget: 0` 可關                               |
| **流式輸出**         | ✅ 兩端點均支援                                                                                          |

## 實測能力矩陣

以下為 API易 2026 年 9 月 2 日的實測結果，共 150 份用例日誌、198 次呼叫，每個用例與 `gemini-3.7-flash` **同時發起**以排除時段干擾：

| 能力                                     | Gemini 原生                              | OpenAI 相容               | 與 3.7 Flash 對比        |
| -------------------------------------- | -------------------------------------- | ----------------------- | --------------------- |
| 基礎對話（非流式 / 流式）                         | ✅ / ✅                                  | ✅ / ✅                   | 一致                    |
| 系統指令                                   | ✅                                      | ✅                       | 一致                    |
| 多輪對話                                   | ✅                                      | ✅                       | 一致                    |
| 長上下文定位（14.5K 字元字首 + 128 輸出上限）          | ✅                                      | ✅                       | 答案相同                  |
| 結構化輸出                                  | ✅ responseSchema                       | ✅ json\_schema          | 返回 JSON 逐位元組相同        |
| Function calling（單次 / 結果回傳 / 順序）       | ✅                                      | ✅                       | 一致                    |
| **並行 Function calling**                | ✅ 兩輪均返回 2 個呼叫，引數與 ID 完整                | ✅                       | 一致                    |
| 影像理解                                   | ✅ 2/2                                  | ✅ 2/2                   | IMAGE 模態 token 計數逐位相同 |
| 影片理解                                   | ✅ 2/2                                  | ✅ 2/2                   | VIDEO 模態 token 計數逐位相同 |
| 程式碼執行（`codeExecution`）                 | ✅ 答案正確                                 | — 原生專屬                  | 一致                    |
| URL context（`urlContext`）              | ✅ 回 `urlContextMetadata`，頁面內容確實被抓取     | — 原生專屬                  | 一致                    |
| 思考檔位 low / medium / high               | ✅ 思考 token 單調遞增                        | ✅ `reasoning_effort` 生效 | 一致                    |
| `stopSequences` / `stop`               | ✅ 嚴格執行                                 | ⚠️ 不生效                  | 一致                    |
| `temperature=0` + `topK=1` + `seed`    | ✅ 兩發逐字一致                               | ⚠️ 兩發不一致                | 一致                    |
| `safetySettings`                       | ✅ 被接受，回 `safetyRatings`                | — 原生專屬                  | 一致                    |
| Google 搜尋 grounding                    | ⚠️ 請求被接受但未回 `groundingMetadata`（見下方說明） | — 原生專屬                  | 一致                    |
| 隱式快取                                   | ⚠️ 8 輪連打未觀察到命中                         | 同左                      | 一致                    |
| 顯式快取 `cachedContents` / `:countTokens` | ❌ 平臺暫未開通                               | —                       | 一致                    |

<Warning>
  **搜尋 grounding 待確認**：傳入 `tools: [{"googleSearch": {}}]` 時請求返回 200 且答案正確，但響應中**沒有 `groundingMetadata`**，說明該答案來自模型自身知識而非即時檢索。`gemini-3.7-flash` 在同一輪測試中表現完全相同，因此這**更可能是鏈路層面的開通狀態、而非模型能力差異**。依賴即時檢索的場景請先小流量驗證，不要按"已 grounding"設計。
</Warning>

## 定價

| 專案      | API易 價格             |
| ------- | ------------------- |
| 輸入      | \$0.75 / 1M tokens  |
| 輸出（含思考） | \$3.75 / 1M tokens  |
| 快取讀取    | \$0.075 / 1M tokens |

**與 `gemini-3.7-flash` 逐項一致**，從 3.7 平遷不涉及任何成本變化；相比 3.6 Flash（\$1.50 / \$7.50）則**直接減半**。

<Info>
  **價格說明**：思考 tokens 按輸出計費——這是控制思考檔位最直接的理由。谷歌尚未公佈 3.8 Flash 的官方定價；作為參考，3.7 Flash 現行的 \$0.75 / \$3.75 是谷歌自己的限時優惠價，官方註明有效期至 2026 年 12 月 31 日。API易 的模型價格與原廠逐項對齊，折扣通過充值加贈體現，詳見 [充值優惠](/zh-Hant/faq/recharge-promotions)。
</Info>

## 思考控制

**預設開啟深度思考**：一句 1+1 也會先產生上百思考 tokens。實測三檔（同一道題、原生端點）：

| 配置                                      | 思考 tokens（實測）                | 適用場景          |
| --------------------------------------- | ---------------------------- | ------------- |
| `thinkingConfig: {"thinkingBudget": 0}` | 0（響應不回 `thoughtsTokenCount`） | 高頻短問答、成本敏感場景  |
| `thinkingLevel: "low"`                  | 84                           | 常規推理任務        |
| `thinkingLevel: "medium"`               | 127                          | 中等複雜度分析       |
| `thinkingLevel: "high"`                 | 263                          | 複雜規劃、數學、程式碼分析 |

<Warning>
  **`minimal` 檔已被移除**（3.6 Flash 有、3.8 沒有）：原生端點傳 `thinkingLevel: "minimal"` 會直接返回 400 `Thinking level is unsupported: THINKING_LEVEL_MINIMAL`。要完全關閉思考請改用 `thinkingConfig: {"thinkingBudget": 0}`。

  **更需要注意 OpenAI 相容端**：傳 `reasoning_effort: "minimal"` **不會報錯**，返回 200，但實測仍消耗了 76 個思考 token 並計入輸出計費——即引數被靜默忽略、思考照常發生。從 3.6 Flash 遷移過來的程式碼若還帶著 `minimal`，在這一端不會有任何報錯提示你改。
</Warning>

<Tip>
  需要檢視思考過程時傳 `thinkingConfig: {"includeThoughts": true}`，響應中會返回帶 `thought: true` 標記的思考 part，用量看 `usageMetadata.thoughtsTokenCount`。OpenAI 相容端用 `reasoning_effort`（low / medium / high）分檔，消耗看 `usage.completion_tokens_details.reasoning_tokens`。
</Tip>

## 呼叫示例

### Gemini 原生格式（推薦，工具支援更全）

<CodeGroup>
  ```bash cURL（關閉思考的基礎對話） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "用一句話介紹你自己"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingBudget": 0}}
    }'
  ```

  ```python Python（google-genai SDK） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="分析這段程式碼的時間複雜度並給出最佳化方案",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python（URL context：實測可用） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="總結 https://ai.google.dev/gemini-api/docs 這個頁面講了什麼",
      config=types.GenerateContentConfig(
          tools=[types.Tool(url_context=types.UrlContext())]
      )
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI 相容格式（存量程式碼零改造）

<CodeGroup>
  ```python Python（OpenAI SDK） theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.8-flash",
      messages=[{"role": "user", "content": "分析這段程式碼的時間複雜度"}],
      reasoning_effort="high",
      max_tokens=4000
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js（流式） theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'gemini-3.8-flash',
    messages: [{ role: 'user', content: '寫一首關於秋天的短詩' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 遷移指南

<AccordionGroup>
  <Accordion title="從 gemini-3.7-flash 遷移">
    **只改模型名**。實測請求結構、引數與返回欄位均無變化，響應欄位集差異僅 1 組且無型別變化，客戶端不需要適配。價格逐項相同，用量預算可直接沿用。
  </Accordion>

  <Accordion title="從 gemini-3.6-flash 遷移">
    價格**直接減半**（輸入 \$1.50 → \$0.75、輸出 \$7.50 → \$3.75），但有一處必改：**`thinkingLevel: "minimal"` 已不支援**，原生端點會返回 400，需改成 `thinkingConfig: {"thinkingBudget": 0}`。OpenAI 相容端的 `reasoning_effort: "minimal"` 不報錯但會被靜默忽略、思考照常計費，務必一併改掉。
  </Accordion>

  <Accordion title="上下文上限是多少？">
    官方未公佈，我們也不按 3.7 的數字推測。實測 14.5K 字元字首的長上下文定位任務正常通過。**長上下文重度依賴的場景建議先小流量灰度**，確認邊界後再全量切換；官方規格公佈後本頁會補齊。
  </Accordion>

  <Accordion title="原生端點需要 Google API Key 嗎？">
    不需要。API易 令牌（`sk-` 開頭）直接放在 `x-goog-api-key` 請求頭即可，官方 google-genai SDK 只需把 `base_url` 改為 `https://api.apiyi.com`。
  </Accordion>

  <Accordion title="哪些能力只有原生端點有？">
    程式碼執行、URL context、`safetySettings`、`stopSequences` 與 `seed` 的嚴格執行都只在 Gemini 原生端點可用。OpenAI 相容端覆蓋常規能力（對話 / 流式 / Function Call / JSON Schema / 視覺），但 `stop` 與 `seed` 實測不生效。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Gemini 3.8 Flash 上線說明（含完整實測資料）](/news/gemini-3-8-flash-launch)
* [Gemini 3.6 Flash 概覽](/zh-Hant/api-capabilities/gemini-3-6-flash/overview)
* [Gemini 3.5 Flash-Lite 概覽](/zh-Hant/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini 原生呼叫通用指南](/zh-Hant/api-capabilities/gemini/native)
