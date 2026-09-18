> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-2.4T-A95B

> Qwen3.8-2.4T-A95B 模型詳情：輸入 $1.72 / 輸出 $5.16 每 1M tokens，262,144 上下文，2 個分組可用。

首個以開源權重放出的 Max 級 Qwen：2.4T 總參、95B 啟用稀疏 MoE，是 Qwen3.8-Max 的基座；開源形態為純文本，不含 Max 版的視覺能力。

## 規格

| 屬性        | 值                   |
| --------- | ------------------- |
| **模型 ID** | `qwen3.8-2.4t-a95b` |
| **廠商**    | 阿里巴巴                |
| **廠商釋出日** | 2026-08-12          |
| **上線日期**  | 2026-09-03          |
| **知識截止**  | 未公開                 |
| **輸入模態**  | 文本                  |
| **輸出模態**  | 文本                  |
| **上下文視窗** | 262,144 tokens      |
| **計費方式**  | 按量                  |

## 定價

單位為美元每 100 萬 tokens（\$/1M）。

| 輸入     | 快取讀     | 輸出     |
| ------ | ------- | ------ |
| \$1.72 | \$0.215 | \$5.16 |

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

| 特性    | 支援 |
| ----- | -- |
| 流式輸出  | ✅  |
| 工具呼叫  | ✅  |
| 結構化輸出 | ✅  |
| 提示詞快取 | ✅  |

## 呼叫示例

以下示例通過 OpenAI Chat Completions（`/v1/chat/completions`）呼叫 `qwen3.8-2.4t-a95b`。base\_url 換成 `https://api.apiyi.com/v1` 即可，其餘用法與官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.8-2.4t-a95b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 從環境變數讀取，不要寫死在程式碼裡。生產環境建議為不同用途分別建令牌，便於單獨停用與用量歸因。</Tip>

## 相關文件

<CardGroup cols={2}>
  <Card title="Qwen3.7-Max" icon="git-compare" href="/zh-Hant/models/qwen3-7-max">
    同系列模型詳情
  </Card>

  <Card title="模型價格總表" icon="table" href="/models">
    全部模型的即時價格、端點與分組
  </Card>
</CardGroup>

<Note>本頁規格資料人工維護於 `models/data/model-details.json`，價格與端點取自系統即時定價介面，隨每次重新整理同步。</Note>
