> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash 文本生成

> 谷歌 Gemini 3.6 Flash 多模態文本模型：1M 上下文、思考四檔可控、原生工具全家桶。API易開通 Gemini 原生與 OpenAI 相容雙端點，輸入 $1.50、輸出 $7.50 每 1M tokens，與官網同價。

Gemini 3.6 Flash（`gemini-3.6-flash`）是谷歌 2026 年 7 月更新的多模態文本模型（stable 版），支援文本/影像/影片/音訊/PDF 輸入，1M 上下文、64K 輸出。API易已完成**雙端點全量實測**（26+5 用例），Gemini 原生格式與 OpenAI 相容格式均可直接呼叫，搜尋 grounding、程式碼執行、URL context 等原生工具實測可用。

<Info>
  **API易已接入 Gemini 3.6 Flash**：模型名 `gemini-3.6-flash`，`default` / `svip` 分組可用。**預設開啟深度思考**（思考 tokens 計入輸出計費），對延遲和成本敏感的場景請調低思考檔位（詳見下方「思考控制」）。輕量場景可考慮半價姊妹款 [Gemini 3.5 Flash-Lite](/zh-Hant/api-capabilities/gemini-3-5-flash-lite/overview)。
</Info>

## 核心優勢

<CardGroup cols={2}>
  <Card title="原生工具全家桶" icon="wrench">
    Google 搜尋 grounding、Maps grounding、URL context、程式碼執行、Computer Use（Preview）在原生端點全部實測放通，無需 Google API Key。
  </Card>

  <Card title="全模態理解" icon="eye">
    影像、PDF、音訊實測識別準確（影片同管線支援），1M 上下文可塞整本書或整個程式碼庫。
  </Card>

  <Card title="思考四檔可控" icon="brain">
    thinkingLevel minimal/low/medium/high 實測思考量 0/403/487/837 tokens 單調遞增，按任務精確控制思考成本。
  </Card>

  <Card title="雙端點無縫接入" icon="git-fork">
    Gemini 原生格式（官方 SDK 直連）與 OpenAI 相容格式（改 base\_url 即用）同時開通，與官網同價。
  </Card>
</CardGroup>

## 模型資訊

| 引數        | 值                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------- |
| **模型名稱**  | `gemini-3.6-flash`（stable，無重定向別名）                                                                 |
| **輸入模態**  | 文本、影像、影片、音訊、PDF                                                                                   |
| **上下文視窗** | 1,048,576 輸入 / 65,536 輸出                                                                          |
| **可用分組**  | `default`、`svip`                                                                                  |
| **端點**    | `POST /v1beta/models/gemini-3.6-flash:generateContent`（原生）、`POST /v1/chat/completions`（OpenAI 相容） |
| **深度思考**  | 預設開啟；`thinkingLevel` 四檔 / `thinkingBudget: 0` 可關                                                  |
| **流式輸出**  | ✅ 兩端點均支援                                                                                          |

## 實測能力矩陣

以下為 API易 2026 年 7 月 22 日的實測結果（官方能力宣告 vs 實際表現）：

| 能力                                   | 官方宣告     | Gemini 原生                                       | OpenAI 相容                                          |
| ------------------------------------ | -------- | ----------------------------------------------- | -------------------------------------------------- |
| 基礎對話（非流式/流式）                         | ✅        | ✅ / ✅                                           | ✅ / ✅                                              |
| 系統指令                                 | ✅        | ✅                                               | ✅                                                  |
| 深度思考（檔位/關閉/思考回顯）                     | ✅        | ✅ 四檔實測 0–837 tokens，`includeThoughts` 可回顯       | ✅ `reasoning_effort` 生效，usage 回顯 reasoning\_tokens |
| 影像 / PDF / 音訊理解                      | ✅        | ✅ 全部實測通過                                        | ✅ 影像（data URL）實測通過                                 |
| Function calling                     | ✅        | ✅                                               | ✅                                                  |
| 結構化輸出                                | ✅        | ✅ responseSchema                                | ✅ json\_schema                                     |
| Google 搜尋 grounding                  | ✅        | ✅ groundingMetadata 完整                          | — 原生專屬                                             |
| Maps grounding / URL context         | ✅        | ✅ / ✅                                           | — 原生專屬                                             |
| 程式碼執行                                | ✅        | ⚠️ 實測真實執行、結果正確，但 `executableCode` 欄位暫不回顯（見下方說明） | — 原生專屬                                             |
| Computer Use（Preview）                | ✅        | ✅ 返回操作指令 functionCall                           | — 原生專屬                                             |
| 隱式快取                                 | ✅        | ⚠️ 機率命中，不承諾命中率                                  | 同左                                                 |
| 顯式快取 API / countTokens / File search | ✅        | ❌ 平臺暫未開通                                        | —                                                  |
| Batch / Live API / 音訊生成 / 影像生成       | ❌ 或平臺不適用 | —                                               | —                                                  |

<Warning>
  **程式碼執行說明**：實測程式碼在上游真實執行（不可心算的 sha256 題答案正確），但響應中 `executableCode` / `codeExecutionResult` 欄位暫不回顯，程式碼與執行結果會在正文文本中呈現。依賴這兩個欄位做介面分離展示的應用請注意。
</Warning>

## 定價

| 專案                  | API易價格（與官網一致）         |
| ------------------- | --------------------- |
| 輸入                  | \$1.50 / 1M tokens    |
| 輸出（含思考）             | \$7.50 / 1M tokens    |
| Google 搜尋 grounding | \$14 / 1K 次查詢（按工具呼叫計） |

<Info>
  **價格說明**：思考 tokens 按輸出計費——這是控制思考檔位最直接的理由。API易與官網同價，折扣體現在充值加贈：充 \$100 送 10%、最高送 20%（≈83 折），詳見 [充值優惠](/zh-Hant/faq/recharge-promotions)。
</Info>

## 思考控制

**預設開啟深度思考**：一句 1+1 也會先產生約 200 思考 tokens。實測四檔：

| 配置                                               | 思考 tokens（實測） | 適用場景          |
| ------------------------------------------------ | ------------- | ------------- |
| `thinkingLevel: "minimal"` 或 `thinkingBudget: 0` | 0             | 高頻短問答、成本敏感場景  |
| `thinkingLevel: "low"`                           | 403           | 常規推理任務        |
| `thinkingLevel: "medium"`                        | 487           | 中等複雜度分析       |
| `thinkingLevel: "high"`                          | 837+          | 複雜規劃、數學、程式碼分析 |

<Tip>
  需要檢視思考過程時傳 `thinkingConfig: {"includeThoughts": true}`，響應中會返回帶 `thought: true` 標記的思考 part，用量看 `usageMetadata.thoughtsTokenCount`。OpenAI 相容端用 `reasoning_effort`（low/medium/high）分檔，消耗看 `usage.completion_tokens_details.reasoning_tokens`。
</Tip>

## 呼叫示例

### Gemini 原生格式（推薦，工具全支援）

<CodeGroup>
  ```bash cURL（基礎對話） theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.6-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "用一句話介紹你自己"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingLevel": "minimal"}}
    }'
  ```

  ```python Python（google-genai SDK + 搜尋 grounding） theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents="2026年7月 AI 領域最重要的釋出是什麼？",
      config=types.GenerateContentConfig(
          tools=[types.Tool(google_search=types.GoogleSearch())]
      )
  )
  print(response.text)
  ```

  ```python Python（多模態：PDF 理解） theme={null}
  import base64
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  pdf = base64.standard_b64encode(open("report.pdf", "rb").read()).decode()
  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents=[
          types.Part.from_bytes(data=base64.b64decode(pdf), mime_type="application/pdf"),
          "總結這份文件的核心結論"
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
      model="gemini-3.6-flash",
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
    model: 'gemini-3.6-flash',
    messages: [{ role: 'user', content: '寫一首關於夏天的短詩' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## 常見問題

<AccordionGroup>
  <Accordion title="原生端點需要 Google API Key 嗎？">
    不需要。API易令牌（`sk-` 開頭）直接放在 `x-goog-api-key` 請求頭即可，官方 google-genai SDK 只需把 `base_url` 改為 `https://api.apiyi.com`。
  </Accordion>

  <Accordion title="搜尋 grounding / 程式碼執行在 OpenAI 相容端能用嗎？">
    不能。google\_search、url\_context、codeExecution、Maps grounding、Computer Use 等原生工具僅 Gemini 原生格式支援，OpenAI 相容端覆蓋常規能力（對話/流式/FC/JSON Schema/視覺）。
  </Accordion>

  <Accordion title="隱式快取能省多少？">
    相同長字首第二次請求可能命中（實測 15.9K tokens 字首命中 8,176 tokens），但命中為機率行為，請勿按穩定命中做成本測算。顯式快取 API（cachedContents）平臺暫未開通。
  </Accordion>

  <Accordion title="和 Gemini 3.5 Flash-Lite 怎麼選？">
    要工具、要深度思考、要更強推理選 3.6 Flash；高頻、低延遲、成本敏感選 [3.5 Flash-Lite](/zh-Hant/api-capabilities/gemini-3-5-flash-lite/overview)（輸入 \$0.30/輸出 \$2.50，預設不思考、響應約快一倍）。
  </Accordion>
</AccordionGroup>

## 相關文件

* [原生 generateContent 線上除錯](/zh-Hant/api-capabilities/gemini-3-6-flash/generate-content)
* [Chat Completions 線上除錯](/zh-Hant/api-capabilities/gemini-3-6-flash/chat-completions)
* [Gemini 3.5 Flash-Lite 概覽](/zh-Hant/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini 原生呼叫通用指南](/zh-Hant/api-capabilities/gemini/native)
