> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 原生格式呼叫指南

> 通過 API易 呼叫 Gemini 官方 generateContent 格式：google-genai SDK 配置、流式輸出、thinking_level 思考控制、思維簽名。

API易 完整支援 **Gemini 官方原生格式**（`/v1beta` generateContent 端點）：把 base\_url 指向 `https://api.apiyi.com`，現有 Gemini 程式碼和官方 SDK 即可無縫遷移，無需任何格式轉換。

本頁基於 Google 官方文件整理（`ai.google.dev/gemini-api/docs`，2026年6月資料），示例均可直接複製執行。

## 為什麼用原生格式

OpenAI 相容格式也能調 Gemini，但以下能力**只有原生格式有**：

* **完整思考控制**：`thinking_level`（Gemini 3 系列）/ `thinking_budget`（2.5 系列）、思考摘要、思維簽名
* **原生多模態 Part**：圖片 / 音訊 / 影片直接內聯傳入，支援 `media_resolution` 控費 —— 見 [多模態與程式碼執行](/zh-Hant/api-capabilities/gemini/multimodal)
* **程式碼執行工具**：`code_execution` 沙箱跑 Python
* **精細的用量欄位**：`thoughts_token_count`、`cached_content_token_count` 等

簡單文本對話、或要和其它廠商模型共用一套程式碼 → 用 [OpenAI 相容模式呼叫](/zh-Hant/api-capabilities/openai/compatible) 即可。

## 快速開始

推薦使用 Google 官方統一 SDK `google-genai`（舊版 `google-generative-ai` 已於 2025年11月30日 停止支援）：

```bash theme={null}
pip install google-genai
```

<CodeGroup>
  ```python Python theme={null}
  from google import genai

  client = genai.Client(
      api_key="YOUR_API_KEY",  # 你的 API易 金鑰
      http_options={"base_url": "https://api.apiyi.com"}
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash",
      contents="用一句話介紹你自己"
  )
  print(response.text)
  ```

  ```javascript Node.js theme={null}
  import { GoogleGenAI } from '@google/genai';

  const ai = new GoogleGenAI({
    apiKey: 'YOUR_API_KEY',
    httpOptions: { baseUrl: 'https://api.apiyi.com' }
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: '用一句話介紹你自己'
  });
  console.log(response.text);
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{
      "contents": [{
        "parts": [{"text": "用一句話介紹你自己"}]
      }]
    }'
  ```
</CodeGroup>

<Warning>
  注意 base\_url 是 `https://api.apiyi.com`（**不帶** `/v1`），與 OpenAI 相容格式的 `https://api.apiyi.com/v1` 不同。請使用 **API易 金鑰**，不是 Google AI Studio 的金鑰。
</Warning>

## 流式輸出

```python theme={null}
stream = client.models.generate_content_stream(
    model="gemini-3.5-flash",
    contents="寫一篇關於量子計算的短文"
)

for chunk in stream:
    print(chunk.text, end="", flush=True)
```

## 思考控制

Gemini 是思考型模型，**兩代引數不一樣，混用會直接報錯**：

| 模型系列                 | 引數                | 取值                                       |
| -------------------- | ----------------- | ---------------------------------------- |
| Gemini 3 / 3.1 / 3.5 | `thinking_level`  | `minimal`（僅 Flash 系）/ `low` / `high`（預設） |
| Gemini 2.5           | `thinking_budget` | token 數上限（如 0–8192），不設則模型自動控制            |

<Warning>
  對 Gemini 3 系列模型**同時傳 `thinking_level` 和 `thinking_budget` 會返回錯誤**，只能二選一（Gemini 3 系列請用 `thinking_level`）。
</Warning>

```python theme={null}
from google.genai import types

# Gemini 3 系列：按檔位控制
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="證明根號2是無理數",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high")
    )
)

# Gemini 2.5 系列：按 token 預算控制
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="簡單問題，要快",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)  # 關閉思考
    )
)
```

檔位選型：`minimal` 適合低延遲簡單任務（分類、抽取）；`low` 適合常規對話；`high` 適合複雜推理和程式碼 —— 思考 token 按**輸出價**計費，檔位越高賬單越貴。

### 思考摘要與思維簽名

* **思考摘要**：`include_thoughts=True` 可在響應中返回思考過程摘要（`part.thought` 為 `True` 的 part）
* **思維簽名（thought signatures）**：Gemini 3 引入的加密推理狀態。多輪對話（尤其函式呼叫）時要把響應裡的 `thought_signature` 原樣回傳，模型才能延續推理鏈。**官方 SDK 自動處理**，手寫 REST 請求時注意不要丟棄該欄位 —— 詳見 [FC函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="分析這段程式碼的時間複雜度：def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high", include_thoughts=True)
    )
)

for part in response.candidates[0].content.parts:
    if getattr(part, "thought", False):
        print(f"[思考摘要] {part.text}")
    else:
        print(f"[最終答案] {part.text}")
```

## 常用配置引數

通過 `config`（`GenerateContentConfig`）傳入：

| 引數                   | 說明                                                               |
| -------------------- | ---------------------------------------------------------------- |
| `system_instruction` | 系統指令                                                             |
| `temperature`        | 0–2。**Gemini 3 系列官方建議保持預設 1.0**，調低反而可能損傷推理品質                     |
| `max_output_tokens`  | 最大輸出（含思考 token）                                                  |
| `thinking_config`    | 思考控制，見上文                                                         |
| `response_mime_type` | 設為 `application/json` 強制 JSON 輸出                                 |
| `response_schema`    | 配合 JSON 輸出的結構約束（結構化輸出）                                           |
| `tools`              | 函式宣告 / `code_execution` 等工具                                      |
| `media_resolution`   | 多模態輸入解析度控費，見 [多模態頁](/zh-Hant/api-capabilities/gemini/multimodal) |

## 用量欄位（usage\_metadata）

```python theme={null}
usage = response.usage_metadata
print(f"輸入: {usage.prompt_token_count}")
print(f"輸出: {usage.candidates_token_count}")
print(f"思考: {usage.thoughts_token_count}")
print(f"快取命中: {usage.cached_content_token_count}")
```

| 欄位                           | 說明          | 計費                                                              |
| ---------------------------- | ----------- | --------------------------------------------------------------- |
| `prompt_token_count`         | 輸入 tokens   | 按輸入價                                                            |
| `candidates_token_count`     | 輸出 tokens   | 按輸出價                                                            |
| `thoughts_token_count`       | 思考 tokens   | **按輸出價**，控檔位可省                                                  |
| `cached_content_token_count` | 快取命中 tokens | 按官方折扣，見 [快取計費](/zh-Hant/api-capabilities/gemini/prompt-caching) |
| `total_token_count`          | 總量          | —                                                               |

## 支援的模型與價格

| 模型                       | 輸入（每 1M tokens） | 輸出（每 1M tokens） | 說明                         |
| ------------------------ | --------------- | --------------- | -------------------------- |
| `gemini-3.5-flash`       | \$1.50          | \$9.00          | 當前主力，多項指標反超 3.1 Pro，1M 上下文 |
| `gemini-3.1-pro-preview` | \$1.80          | \$10.80         | Pro 旗艦                     |
| `gemini-3-pro-preview`   | \$1.80          | \$10.80         | 上代 Pro                     |
| `gemini-3-flash-preview` | \$0.44          | \$2.64          | 輕量快速                       |
| `gemini-3.1-flash-lite`  | \$0.25          | \$1.50          | 超低價                        |
| `gemini-2.5-pro`         | \$1.25          | \$10.00         | 2.5 系 Pro                  |
| `gemini-2.5-flash`       | \$0.30          | \$2.40          | 2.5 系主力                    |
| `gemini-2.5-flash-lite`  | \$0.10          | \$0.40          | 最便宜                        |

<Tip>
  部分模型提供 `-thinking` / `-nothinking` 字尾別名（如 `gemini-3-flash-preview-nothinking`），固定開啟/關閉思考，適合不方便改請求引數的客戶端。完整列表見 [模型與價格總覽](/zh-Hant/api-capabilities/model-info)。
</Tip>

## 與 OpenAI 相容格式對比

| 特性          | Gemini 原生格式                          | OpenAI 相容格式                |
| ----------- | ------------------------------------ | -------------------------- |
| base\_url   | `https://api.apiyi.com`              | `https://api.apiyi.com/v1` |
| SDK         | `google-genai`                       | `openai`                   |
| 思考控制        | `thinking_level` / `thinking_budget` | `reasoning_effort`         |
| 思考摘要 / 思維簽名 | ✅                                    | ❌                          |
| 程式碼執行工具     | ✅                                    | ❌                          |
| 媒體輸入        | 原生 Part 內聯（PIL / bytes）              | Base64 image\_url          |
| 快取命中欄位      | `cached_content_token_count`         | `cached_tokens`            |

## 注意事項

* **不支援 Files API**（`client.files.upload()`），媒體一律內聯傳入且**單檔案不超過 20MB** —— 詳見 [多模態與程式碼執行](/zh-Hant/api-capabilities/gemini/multimodal)
* 媒體、長上下文的緩存摺扣與命中率說明見 [快取計費](/zh-Hant/api-capabilities/gemini/prompt-caching)

## 相關連結

* 同組頁面：[多模態與程式碼執行](/zh-Hant/api-capabilities/gemini/multimodal) · [快取計費](/zh-Hant/api-capabilities/gemini/prompt-caching) · [FC函式呼叫](/zh-Hant/api-capabilities/gemini/function-calling)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
* Google 官方文件：`ai.google.dev/gemini-api/docs`
