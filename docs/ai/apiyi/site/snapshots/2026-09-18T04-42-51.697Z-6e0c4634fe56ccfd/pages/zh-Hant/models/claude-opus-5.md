> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5

> Claude Opus 5 模型詳情：輸入 $5 / 輸出 $25 每 1M tokens，1,000,000 上下文、128,000 最大輸出，4 個分組可用。

Anthropic 旗艦模型，以 Opus 4.8 的價格提供逼近 Fable 5 的智慧，1M 上下文、思考預設開啟。

## 規格

| 屬性        | 值                                          |
| --------- | ------------------------------------------ |
| **模型 ID** | `claude-opus-5` · `claude-opus-5-thinking` |
| **廠商**    | Anthropic                                  |
| **廠商釋出日** | 2026-07-24                                 |
| **上線日期**  | 2026-07-25                                 |
| **知識截止**  | 未公開                                        |
| **輸入模態**  | 文本、影像                                      |
| **輸出模態**  | 文本                                         |
| **上下文視窗** | 1,000,000 tokens                           |
| **最大輸出**  | 128,000 tokens                             |
| **計費方式**  | 按量                                         |

## 定價

單位為美元每 100 萬 tokens（\$/1M）。

| 輸入  | 快取讀   | 輸出   |
| --- | ----- | ---- |
| \$5 | \$0.5 | \$25 |

<Info>表中為**預設標價**。充值活動與分組優惠**可疊加**，實際扣費以控制台即時顯示為準。詳見[價格說明](/zh-Hant/pricing)與[充值活動](/zh-Hant/faq/recharge-promotions)。</Info>

## 端點支援

| 端點                        | 路徑                                            | 支援 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 可用分組

| 分組               | 倍率    | 說明       |
| ---------------- | ----- | -------- |
| `ClaudeCode`     | 0.95× | 相當於 95 折 |
| `Claude_Reverse` | 0.5×  | 相當於 50 折 |
| `Default`        | 1×    | 標準價      |
| `SVIP`           | 1×    | 標準價      |

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

## 模型變體

| 模型 ID                    | 說明                          |
| ------------------------ | --------------------------- |
| `claude-opus-5`          | 標準呼叫。省略 thinking 引數即執行自適應思考 |
| `claude-opus-5-thinking` | 強制思考變體，價格與端點與標準版完全相同        |

## 呼叫示例

以下示例通過 OpenAI Chat Completions（`/v1/chat/completions`）呼叫 `claude-opus-5`。base\_url 換成 `https://api.apiyi.com/v1` 即可，其餘用法與官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 從環境變數讀取，不要寫死在程式碼裡。生產環境建議為不同用途分別建令牌，便於單獨停用與用量歸因。</Tip>

## 相關文件

<CardGroup cols={2}>
  <Card title="上線公告" icon="megaphone" href="/news/claude-opus-5-launch">
    Claude Opus 5 的釋出背景、實測表現與遷移建議
  </Card>

  <Card title="Claude API 基礎說明" icon="book-open" href="/zh-Hant/api-capabilities/claude">
    引數、呼叫方式與最佳實踐
  </Card>

  <Card title="Claude Effort 思考指南" icon="book-open" href="/zh-Hant/api-capabilities/claude-effort-thinking">
    引數、呼叫方式與最佳實踐
  </Card>

  <Card title="Claude 快取計費" icon="book-open" href="/zh-Hant/api-capabilities/claude-prompt-caching">
    引數、呼叫方式與最佳實踐
  </Card>

  <Card title="Claude Sonnet 5" icon="git-compare" href="/zh-Hant/models/claude-sonnet-5">
    同系列模型詳情
  </Card>

  <Card title="Claude Fable 5" icon="git-compare" href="/zh-Hant/models/claude-fable-5">
    同系列模型詳情
  </Card>

  <Card title="Claude Opus 4.8" icon="git-compare" href="/zh-Hant/models/claude-opus-4-8">
    同系列模型詳情
  </Card>

  <Card title="模型價格總表" icon="table" href="/models">
    全部模型的即時價格、端點與分組
  </Card>
</CardGroup>

<Note>本頁規格資料人工維護於 `models/data/model-details.json`，價格與端點取自系統即時定價介面，隨每次重新整理同步。</Note>
