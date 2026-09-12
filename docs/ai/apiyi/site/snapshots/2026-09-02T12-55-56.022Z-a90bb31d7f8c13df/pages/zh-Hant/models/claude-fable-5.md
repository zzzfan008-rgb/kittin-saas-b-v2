> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5

> Claude Fable 5 模型詳情：輸入 $10 / 輸出 $50 每 1M tokens，4 個分組可用。

Mythos 級旗艦，軟體工程與視覺理解近乎全面 SOTA；輸入輸出保留 30 天用於濫用檢測。

## 規格

| 屬性        | 值                                            |
| --------- | -------------------------------------------- |
| **模型 ID** | `claude-fable-5` · `claude-fable-5-thinking` |
| **廠商**    | Anthropic                                    |
| **上線日期**  | 2026-06-10                                   |
| **知識截止**  | 未公開                                          |
| **輸入模態**  | 文本、影像                                        |
| **輸出模態**  | 文本                                           |
| **計費方式**  | 按量                                           |

## 定價

單位為美元每 100 萬 tokens（\$/1M）。

| 輸入   | 快取讀 | 輸出   |
| ---- | --- | ---- |
| \$10 | \$1 | \$50 |

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

| 分組                  | 倍率    | 說明       |
| ------------------- | ----- | -------- |
| `ClaudeCode`        | 0.95× | 相當於 95 折 |
| `ClaudeCodeReverse` | 0.5×  | 相當於 50 折 |
| `Default`           | 1×    | 標準價      |
| `SVIP`              | 1×    | 標準價      |

部分分組有折扣，且可與充值優惠疊加。分組的完整說明見[令牌與分組](/zh-Hant/faq/token-and-groups)。

## 支援的特性

| 特性    | 支援   |
| ----- | ---- |
| 流式輸出  | ✅    |
| 工具呼叫  | ✅    |
| 結構化輸出 | ✅    |
| 視覺理解  | ✅    |
| 提示詞快取 | ✅    |
| 深度思考  | 可選開啟 |

## 模型變體

| 模型 ID                     | 說明                                               |
| ------------------------- | ------------------------------------------------ |
| `claude-fable-5`          | 標準呼叫                                             |
| `claude-fable-5-thinking` | 強制思考變體，價格與端點與標準版完全相同；分組比標準版少一個 ClaudeCodeReverse |

## 呼叫示例

以下示例通過 OpenAI Chat Completions（`/v1/chat/completions`）呼叫 `claude-fable-5`。base\_url 換成 `https://api.apiyi.com/v1` 即可，其餘用法與官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-fable-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 從環境變數讀取，不要寫死在程式碼裡。生產環境建議為不同用途分別建令牌，便於單獨停用與用量歸因。</Tip>

## 相關文件

<CardGroup cols={2}>
  <Card title="上線公告" icon="megaphone" href="/news/claude-fable-5-launch">
    Claude Fable 5 的釋出背景、實測表現與遷移建議
  </Card>

  <Card title="Claude API 基礎說明" icon="book-open" href="/zh-Hant/api-capabilities/claude">
    引數、呼叫方式與最佳實踐
  </Card>

  <Card title="Claude Effort 思考指南" icon="book-open" href="/zh-Hant/api-capabilities/claude-effort-thinking">
    引數、呼叫方式與最佳實踐
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/zh-Hant/models/claude-opus-5">
    同系列模型詳情
  </Card>

  <Card title="模型價格總表" icon="table" href="/models">
    全量 283 個模型的即時價格、端點與分組
  </Card>
</CardGroup>

<Note>本頁規格資料人工維護於 `models/data/model-details.json`，價格與端點取自系統即時定價介面，資料更新於 2026-08-31 11:46 (UTC+8)，規格最後核對於 2026-07-31。</Note>
