> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.3

> GLM-5.3 模型詳情：輸入 $1.4 / 輸出 $4.396 每 1M tokens，1,000,000 上下文、128,000 最大輸出，2 個分組可用。

沿用 5.2 的 753B MoE 基座、只擴後訓練，Z.ai Code Bench 比 5.2 提升 50%，網路安全基準翻倍；思考不可關閉，適合程式設計 Agent 與安全審計。

## 規格

| 屬性        | 值                |
| --------- | ---------------- |
| **模型 ID** | `glm-5.3`        |
| **廠商**    | 智譜               |
| **廠商釋出日** | 2026-08-14       |
| **上線日期**  | 2026-09-08       |
| **知識截止**  | 未公開              |
| **輸入模態**  | 文本               |
| **輸出模態**  | 文本               |
| **上下文視窗** | 1,000,000 tokens |
| **最大輸出**  | 128,000 tokens   |
| **計費方式**  | 按量               |

## 定價

單位為美元每 100 萬 tokens（\$/1M）。

| 輸入    | 快取讀     | 輸出      |
| ----- | ------- | ------- |
| \$1.4 | \$0.259 | \$4.396 |

<Info>表中為**預設標價**。充值活動與分組優惠**可疊加**，實際扣費以控制台即時顯示為準。詳見[價格說明](/zh-Hant/pricing)與[充值活動](/zh-Hant/faq/recharge-promotions)。</Info>

## 端點支援

| 端點                        | 路徑                                            | 支援 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | —  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
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
| 提示詞快取 | ✅    |
| 深度思考  | 預設開啟 |

## 呼叫示例

以下示例通過 OpenAI Chat Completions（`/v1/chat/completions`）呼叫 `glm-5.3`。base\_url 換成 `https://api.apiyi.com/v1` 即可，其餘用法與官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "glm-5.3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 從環境變數讀取，不要寫死在程式碼裡。生產環境建議為不同用途分別建令牌，便於單獨停用與用量歸因。</Tip>

## 相關文件

<CardGroup cols={2}>
  <Card title="上線公告" icon="megaphone" href="/news/glm-5-3-launch">
    GLM-5.3 的釋出背景、實測表現與遷移建議
  </Card>

  <Card title="GLM-5.3-Flash" icon="git-compare" href="/zh-Hant/models/glm-5-3-flash">
    同系列模型詳情
  </Card>

  <Card title="GLM-5.2" icon="git-compare" href="/zh-Hant/models/glm-5-2">
    同系列模型詳情
  </Card>

  <Card title="模型價格總表" icon="table" href="/models">
    全部模型的即時價格、端點與分組
  </Card>
</CardGroup>

<Note>本頁規格資料人工維護於 `models/data/model-details.json`，價格與端點取自系統即時定價介面，隨每次重新整理同步。</Note>
