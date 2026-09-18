> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M3

> MiniMax-M3 模型詳情：輸入 $0.3 / 輸出 $1.2 每 1M tokens，1,000,000 上下文，3 個分組可用。

首個集前沿 Agent 程式設計、百萬上下文與原生多模態於一身的開源權重模型，MSA 稀疏注意力把長上下文推理成本降至前代 1/20。

## 規格

| 屬性        | 值                |
| --------- | ---------------- |
| **模型 ID** | `MiniMax-M3`     |
| **廠商**    | MiniMax          |
| **廠商釋出日** | 2026-06-01       |
| **上線日期**  | 2026-06-05       |
| **知識截止**  | 未公開              |
| **輸入模態**  | 文本、影像、影片         |
| **輸出模態**  | 文本               |
| **上下文視窗** | 1,000,000 tokens |
| **計費方式**  | 按量               |

## 定價

單位為美元每 100 萬 tokens（\$/1M）。

| 輸入    | 快取讀    | 輸出    |
| ----- | ------ | ----- |
| \$0.3 | \$0.06 | \$1.2 |

<Info>表中為**預設標價**。充值活動與分組優惠**可疊加**，實際扣費以控制台即時顯示為準。詳見[價格說明](/zh-Hant/pricing)與[充值活動](/zh-Hant/faq/recharge-promotions)。</Info>

## 階梯計價

本模型按單次請求的 token 規模分檔計價（輸出價 = 對應檔輸入價 × 輸出倍率）：

* 0 – 524,288 tokens 輸入 \$0.3/1M
* 超過 524,288 tokens 輸入 \$0.6/1M

（已含單獨優惠，為官網名義價的 5 折）

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

| 分組           | 倍率    | 說明       |
| ------------ | ----- | -------- |
| `ClaudeCode` | 0.95× | 相當於 95 折 |
| `Default`    | 1×    | 標準價      |
| `SVIP`       | 1×    | 標準價      |

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

## 呼叫示例

以下示例通過 OpenAI Chat Completions（`/v1/chat/completions`）呼叫 `MiniMax-M3`。base\_url 換成 `https://api.apiyi.com/v1` 即可，其餘用法與官方一致。

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "MiniMax-M3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Key 從環境變數讀取，不要寫死在程式碼裡。生產環境建議為不同用途分別建令牌，便於單獨停用與用量歸因。</Tip>

## 相關文件

<CardGroup cols={2}>
  <Card title="上線公告" icon="megaphone" href="/news/minimax-m3-launch">
    MiniMax-M3 的釋出背景、實測表現與遷移建議
  </Card>

  <Card title="模型價格總表" icon="table" href="/models">
    全部模型的即時價格、端點與分組
  </Card>
</CardGroup>

<Note>本頁規格資料人工維護於 `models/data/model-details.json`，價格與端點取自系統即時定價介面，隨每次重新整理同步。</Note>
