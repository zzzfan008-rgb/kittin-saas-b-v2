> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite 文本生成

> 谷歌 Gemini 3.5 Flash-Lite 高性價比多模態模型：1M 上下文、預設不思考、響應極快。API易開通 Gemini 原生與 OpenAI 相容雙端點，輸入 $0.30、輸出 $2.50 每 1M tokens，與官網同價。

Gemini 3.5 Flash-Lite（`gemini-3.5-flash-lite`）是谷歌 2026 年 7 月更新的輕量多模態模型（stable 版），主打高頻、低延遲、低成本，支援文本/影像/影片/音訊/PDF 輸入，1M 上下文、64K 輸出。API易已完成**雙端點全量實測**（25+5 用例），Gemini 原生格式與 OpenAI 相容格式均可直接呼叫，搜尋 grounding、URL context 等原生工具實測可用。

<Info>
  **API易已接入 Gemini 3.5 Flash-Lite**：模型名 `gemini-3.5-flash-lite`，`default` / `svip` 分組可用。與 3.6 Flash 相反——**預設不輸出思考**，簡單請求實測約 2 秒返回；需要深度推理時傳 `thinkingLevel: "high"` 顯式開啟。
</Info>

## 核心優勢

<CardGroup cols={2}>
  <Card title="極致價效比" icon="circle-dollar-sign">
    輸入 \$0.30、輸出 \$2.50 每 1M tokens（音訊輸入同價），僅為 3.6 Flash 的 1/5–1/3，適合高頻呼叫與批次處理。
  </Card>

  <Card title="預設零思考低延遲" icon="zap">
    預設不產生思考 tokens，簡單請求實測約 2 秒返回（3.6 Flash 約 4.5 秒），客服、分類、抽取等場景開箱即用。
  </Card>

  <Card title="全模態理解" icon="eye">
    影像、PDF、音訊實測識別準確（影片同管線支援），1M 上下文與旗艦同規格。
  </Card>

  <Card title="原生工具可用" icon="wrench">
    Google 搜尋 grounding、Maps grounding、URL context、程式碼執行在原生端點實測放通，無需 Google API Key。
  </Card>
</CardGroup>

## 模型資訊

| 引數        | 值                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------ |
| **模型名稱**  | `gemini-3.5-flash-lite`（stable，無重定向別名）                                                                 |
| **輸入模態**  | 文本、影像、影片、音訊、PDF                                                                                        |
| **上下文視窗** | 1,048,576 輸入 / 65,536 輸出                                                                               |
| **可用分組**  | `default`、`svip`                                                                                       |
| **端點**    | `POST /v1beta/models/gemini-3.5-flash-lite:generateContent`（原生）、`POST /v1/chat/completions`（OpenAI 相容） |
| **深度思考**  | **預設關閉**；`thinkingLevel: "high"` 顯式開啟                                                                  |
| **流式輸出**  | ✅ 兩端點均支援                                                                                               |

## 實測能力矩陣

以下為 API易 2026 年 7 月 22 日的實測結果（官方能力宣告 vs 實際表現）：

| 能力                                   | 官方宣告     | Gemini 原生                                                           | OpenAI 相容                                             |
| ------------------------------------ | -------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| 基礎對話（非流式/流式）                         | ✅        | ✅ / ✅                                                               | ✅ / ✅                                                 |
| 系統指令                                 | ✅        | ✅                                                                   | ✅                                                     |
| 深度思考                                 | ✅        | ✅ `thinkingLevel: "high"` 實測觸發（約 1000 tokens），`includeThoughts` 可回顯 | ⚠️ `reasoning_effort` 接受但 usage 不回顯 reasoning\_tokens |
| 影像 / PDF / 音訊理解                      | ✅        | ✅ 全部實測通過                                                            | ✅ 影像（data URL）實測通過                                    |
| Function calling                     | ✅        | ✅                                                                   | ✅                                                     |
| 結構化輸出                                | ✅        | ✅ responseSchema                                                    | ✅ json\_schema                                        |
| Google 搜尋 grounding                  | ✅        | ✅ groundingMetadata 完整                                              | — 原生專屬                                                |
| Maps grounding / URL context         | ✅        | ✅ / ✅                                                               | — 原生專屬                                                |
| 程式碼執行                                | ✅        | ⚠️ 實測真實執行、結果正確，但 `executableCode` 欄位暫不回顯                            | — 原生專屬                                                |
| Computer Use                         | ❌ 官方不支援  | —                                                                   | —                                                     |
| 隱式快取                                 | ✅        | ⚠️ 實測未觀測到命中，勿按命中做成本測算                                               | 同左                                                    |
| 顯式快取 API / countTokens / File search | 部分支援     | ❌ 平臺暫未開通                                                            | —                                                     |
| Batch / Live API / 音訊生成 / 影像生成       | ❌ 或平臺不適用 | —                                                                   | —                                                     |

## 定價

| 專案                  | API易價格（與官網一致）         |
| ------------------- | --------------------- |
| 輸入（文本/影像/影片/音訊）     | \$0.30 / 1M tokens    |
| 輸出（含思考）             | \$2.50 / 1M tokens    |
| Google 搜尋 grounding | \$14 / 1K 次查詢（按工具呼叫計） |

<Info>
  **價格說明**：API易與官網同價，折扣體現在充值加贈：充 \$100 送 10%、最高送 20%（≈83 折），詳見 [充值優惠](/zh-Hant/faq/recharge-promotions)。
</Info>

## 思考控制

**與 3.6 Flash 相反，本模型預設不思考**——這正是它快和便宜的原因。實測：

| 配置                                   | 思考 tokens（實測） | 說明           |
| ------------------------------------ | ------------- | ------------ |
| 不傳（預設）/ `minimal` / `low` / `medium` | 0             | 簡單問題各檔均未觸發思考 |
| `thinkingLevel: "high"`              | 約 1000        | 穩定觸發深度思考     |

<Tip>
  實用建議：**要思考就直接上 `high`**，中間檔位對簡單問題不產生思考；配合 `includeThoughts: true` 可回顯思考過程。若任務長期需要深度推理，直接選 [Gemini 3.6 Flash](/zh-Hant/api-capabilities/gemini-3-6-flash/overview) 更合適。
</Tip>

## 呼叫示例

### Gemini 原生格式（推薦，工具全支援）

<CodeGroup>
  ```bash cURL（基礎對話，預設零思考） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.5-flash-lite:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "把這句話翻譯成英文：今天天氣不錯"}]}]
    }'
  ```

  ```python Python（google-genai SDK，按需開思考） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents="一個水池兩根進水管，甲單獨8小時注滿，乙單獨12小時注滿，同時開啟需要幾小時？",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python（影像理解） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents=[
          types.Part.from_bytes(data=open("photo.png", "rb").read(), mime_type="image/png"),
          "描述這張圖片"
      ]
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
      model="gemini-3.5-flash-lite",
      messages=[{"role": "user", "content": "把下面的評論分類為正面/負面/中性：物流很快但包裝一般"}]
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
    model: 'gemini-3.5-flash-lite',
    messages: [{ role: 'user', content: '用三句話總結 RAG 的原理' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 常見問題

<AccordionGroup>
  <Accordion title="什麼場景選 Flash-Lite 而不是 3.6 Flash？">
    高頻短問答、分類、抽取、翻譯、客服等吞吐優先的場景選 Flash-Lite（快約一倍、便宜至 1/5）；需要深度推理、複雜規劃或 Computer Use 時選 [3.6 Flash](/zh-Hant/api-capabilities/gemini-3-6-flash/overview)。
  </Accordion>

  <Accordion title="原生端點需要 Google API Key 嗎？">
    不需要。API易令牌（`sk-` 開頭）直接放在 `x-goog-api-key` 請求頭即可，官方 google-genai SDK 只需把 `base_url` 改為 `https://api.apiyi.com`。
  </Accordion>

  <Accordion title="怎麼觀測思考消耗？">
    原生端點看 `usageMetadata.thoughtsTokenCount`。注意 OpenAI 相容端本模型不回顯 `reasoning_tokens`，需要精確觀測思考消耗請用原生端點。
  </Accordion>

  <Accordion title="隱式快取能命中嗎？">
    實測 15.9K tokens 相同字首連打 3 次未觀測到命中（同條件 3.6 Flash 命中 1 次），請勿按快取命中做成本測算。顯式快取 API 平臺暫未開通。
  </Accordion>
</AccordionGroup>

## 相關文件

* [原生 generateContent 線上除錯](/zh-Hant/api-capabilities/gemini-3-5-flash-lite/generate-content)
* [Chat Completions 線上除錯](/zh-Hant/api-capabilities/gemini-3-5-flash-lite/chat-completions)
* [Gemini 3.6 Flash 概覽](/zh-Hant/api-capabilities/gemini-3-6-flash/overview)
* [Gemini 原生呼叫通用指南](/zh-Hant/api-capabilities/gemini/native)
