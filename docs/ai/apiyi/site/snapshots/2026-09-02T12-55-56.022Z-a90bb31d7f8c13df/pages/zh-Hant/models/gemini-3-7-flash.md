> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.7 Flash

> Gemini 3.7 Flash 模型詳情：輸入 $0.75 / 輸出 $3.75 每 1M tokens，1,000,000 上下文、64,000 最大輸出，2 個分組可用。

編碼與 Agent 大幅進步的新一代 Flash 主力，DeepSWE v1.1 達 65.3%，思考三檔可調，1M 上下文。

## 規格

| 屬性        | 值                  |
| --------- | ------------------ |
| **模型 ID** | `gemini-3.7-flash` |
| **廠商**    | Google             |
| **廠商釋出日** | 2026-08-13         |
| **上線日期**  | 2026-08-14         |
| **知識截止**  | 2026-03            |
| **輸入模態**  | 文本、影像、音訊、影片、PDF    |
| **輸出模態**  | 文本                 |
| **上下文視窗** | 1,000,000 tokens   |
| **最大輸出**  | 64,000 tokens      |
| **計費方式**  | 按量                 |

## 定價

單位為美元每 100 萬 tokens（\$/1M）。

| 輸入     | 快取讀     | 輸出     |
| ------ | ------- | ------ |
| \$0.75 | \$0.075 | \$3.75 |

<Info>表中為**預設標價**。充值活動與分組優惠**可疊加**，實際扣費以控制台即時顯示為準。詳見[價格說明](/zh-Hant/pricing)與[充值活動](/zh-Hant/faq/recharge-promotions)。</Info>

## 端點支援

| 端點                        | 路徑                                            | 支援 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 可用分組

| 分組        | 倍率 | 說明  |
| --------- | -- | --- |
| `Default` | 1× | 標準價 |
| `SVIP`    | 1× | 標準價 |

部分分組有折扣，且可與充值優惠疊加。分組的完整說明見[令牌與分組](/zh-Hant/faq/token-and-groups)。

## 支援的特性

| 特性    | 支援   |
| ----- | ---- |
| 流式輸出  | ✅    |
| 工具呼叫  | ✅    |
| 結構化輸出 | ✅    |
| 視覺理解  | ✅    |
| 提示詞快取 | ✅    |
| 深度思考  | 預設開啟 |
| 聯網搜尋  | ✅    |
| 程式碼執行 | ✅    |

## 呼叫示例

以下示例通過 OpenAI Chat Completions（`/v1/chat/completions`）呼叫 `gemini-3.7-flash`。base\_url 換成 `https://api.apiyi.com/v1` 即可，其餘用法與官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.7-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 從環境變數讀取，不要寫死在程式碼裡。生產環境建議為不同用途分別建令牌，便於單獨停用與用量歸因。</Tip>

## 相關文件

<CardGroup cols={2}>
  <Card title="上線公告" icon="megaphone" href="/news/gemini-3-7-flash-launch">
    Gemini 3.7 Flash 的釋出背景、實測表現與遷移建議
  </Card>

  <Card title="原生呼叫" icon="book-open" href="/zh-Hant/api-capabilities/gemini/native">
    引數、呼叫方式與最佳實踐
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/zh-Hant/models/gemini-3-6-flash">
    同系列模型詳情
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/zh-Hant/models/gemini-3-5-flash">
    同系列模型詳情
  </Card>

  <Card title="模型價格總表" icon="table" href="/models">
    全量 283 個模型的即時價格、端點與分組
  </Card>
</CardGroup>

<Note>本頁規格資料人工維護於 `models/data/model-details.json`，價格與端點取自系統即時定價介面，資料更新於 2026-08-31 11:46 (UTC+8)，規格最後核對於 2026-08-17。</Note>
