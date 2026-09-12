> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 系列文本模型（歷史版本）

> 阿里通義千問 Qwen3.6 系列：Max-Preview 程式設計旗艦 + Flash 極速多模態 + Plus 均衡主力 + 27B / 35B-A3B 開源版（API易官轉託管，免租卡）。全系阿里雲官轉通道，OpenAI Chat 相容直接呼叫，掛牌價持平官網，疊加充值加贈約 8.5 折。

<Warning>
  **本頁為歷史版本存檔。** 通義千問當前旗艦是 [Qwen3.8-Max](/zh-Hant/api-capabilities/qwen-3-8/overview)（2026 年 8 月釋出）——2.4T 引數、1M 上下文、原生圖片與影片輸入，掛牌價比官網低 17.5％。本頁 Qwen3.6 五款模型仍可正常呼叫，價格與接入方式不變，新專案建議直接用 Qwen3.8-Max。
</Warning>

Qwen3.6 是阿里通義千問團隊在 2026 年第二季度推出的新一代大模型家族，整體路線分為 **Max**（旗艦）、**Plus**（均衡）、**Flash**（極速）三個閉源生產檔位，外加 **27B**、**35B-A3B** 兩款開源權重版本。API易 通過 **阿里雲官轉 / 自建官轉** 通道接入全部 5 款模型，OpenAI Chat Completions 相容格式直接呼叫——閉源版鑑權與限流策略與阿里雲官網一致；**開源版由 API易 官轉託管，免去客戶租 GPU、買算力的負擔**。

<Note>
  **🚀 核心亮點**：Max-Preview 在 SWE-bench Pro / Terminal-Bench 2.0 等 **6 項程式設計基準登頂**，Flash 是 35B-A3B MoE、原生 256K 可擴 1M 多模態上下文，Plus 是 72B/18B 啟用的均衡主力（1M 上下文）。開源 **`qwen3.6-27b`**（27B 稠密）與 **`qwen3.6-35b-a3b`**（35B MoE / 3B 啟用）由 API易 官轉託管，按量付費、不用自己租卡。**適合程式設計 Agent、長上下文 RAG、多模態批次分發，以及需要可控權重 / 合規審計** 的生產場景。
</Note>

### 閉源生產版（阿里雲官轉）

<CardGroup cols={3}>
  <Card title="qwen3.6-max-preview" icon="trophy">
    **程式設計旗艦**

    國產程式設計登頂：6 項 Coding 基準 #1，AIME 2025 93%，GPQA 86%，LiveCodeBench 79%。
  </Card>

  <Card title="qwen3.6-flash" icon="bolt">
    **極速多模態**

    35B-A3B MoE，文本 / 影像 / 影片原生輸入，256K 基礎可擴 1M 上下文。
  </Card>

  <Card title="qwen3.6-plus" icon="scale">
    **均衡主力**

    72B 總參 / 18B 啟用，1M 上下文，Terminal-Bench 61.6 超越 Claude Opus 4.5。
  </Card>
</CardGroup>

### 開源權重版（API易官轉託管 · 免租卡）

<CardGroup cols={2}>
  <Card title="qwen3.6-27b" icon="box">
    **27B 稠密 · 程式設計小鋼炮**

    Qwen 團隊開源權重（Hugging Face `Qwen/Qwen3.6-27B`），27B 程式設計能力對標 397B 量級模型。API易 官轉託管，無需本地 GPU。
  </Card>

  <Card title="qwen3.6-35b-a3b" icon="boxes">
    **35B-A3B 開源 MoE**

    Qwen 團隊開源權重（Hugging Face `Qwen/Qwen3.6-35B-A3B`），與閉源 Flash 同源不同檔位，3B 啟用極低算力成本。
  </Card>
</CardGroup>

## 為什麼選 API易 的 Qwen3.6 阿里雲官轉？

對標阿里雲百鍊官方通道，針對企業生產場景在 **穩定性**、**成本**、**接入體驗** 三方面做了深度最佳化：

<CardGroup cols={2}>
  <Card title="阿里雲官轉直連" icon="server">
    通過阿里雲百鍊官方通道接入，鑑權與限流策略與官網一致，國內機房與家寬網路延遲穩定，企業級 SLA。
  </Card>

  <Card title="不限併發 · 企業可放量" icon="infinity">
    無 RPM / TPM 上限封頂（受底層供給限制），企業客戶可按需放量；支援工單與專屬群協助高併發排程。
  </Card>

  <Card title="同價 + 充值加贈 ≈ 8.5 折" icon="percent">
    掛牌單價與阿里雲官網一致，疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions)，長期使用成本約 **官網 8.5 折**。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，免去出海改造。
  </Card>

  <Card title="OpenAI 相容生態齊全" icon="layers">
    OpenAI Chat Completions 相容格式，配合 GPT / Claude / DeepSeek / GLM 等 [全模型生態](/zh-Hant/api-capabilities/model-info) 可無縫切換。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕大模型選型與 Agent 工作流，可為企業客戶提供從 PoC、灰度到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 五款模型怎麼選

<CardGroup cols={2}>
  <Card title="Max-Preview · 程式設計與複雜推理" icon="trophy">
    **場景**：Coding Agent 主力、SWE-Verified 類真實軟工任務、Cursor / Claude Code 工作流主驅動模型。

    **基準**：SWE-bench Pro 58.4（反超 GLM-5.1 56.6）、AIME 2025 93%、GPQA 86%、LiveCodeBench 79%、Terminal-Bench 2.0 #1。

    **注意**：標記為 Preview，權重仍在迭代，關鍵鏈路建議先小流量灰度。
  </Card>

  <Card title="Flash · 高頻多模態長上下文" icon="bolt">
    **場景**：影像 / 影片理解、長文件總結、批次翻譯、RAG 後整篇綜合歸納。

    **結構**：35B 總參 / 3B 啟用的 MoE（35B-A3B），原生 256K 可擴充套件至 1M tokens。

    **多模態**：原生支援文本 / 影像 / 影片輸入，單價僅 Max 的約 1/8。
  </Card>

  <Card title="Plus · 主力均衡" icon="scale">
    **場景**：日常對話、客服、內容生成、企業知識庫問答、中等複雜度推理。

    **結構**：72B 總參 / 18B 啟用的 MoE，推理速度約 Claude Opus 4.6 的 3 倍。

    **基準**：Terminal-Bench 2.0 達 61.6 超越 Claude Opus 4.5（59.3），SWE-bench Verified 78.8。
  </Card>

  <Card title="qwen3.6-27b · 開源程式設計小鋼炮" icon="box">
    **場景**：成本敏感的程式設計輔助、私有化部署評估前的 API 驗證、對開源協議 / 可審計權重有合規要求的客戶。

    **特點**：27B 稠密結構，開源權重，程式設計能力對標 397B 級別。API易 官轉託管，按量計費，無需本地 GPU。
  </Card>

  <Card title="qwen3.6-35b-a3b · 開源極速 MoE" icon="boxes">
    **場景**：高頻低成本場景、希望未來切換為本地推理的過渡期、合規要求權重可下載的專案。

    **特點**：與閉源 Flash 同源（35B 總參 / 3B 啟用），開源版本由 API易 託管，省去租卡 / 部署 / 運維。
  </Card>

  <Card title="混合路由建議" icon="route">
    **推薦策略**：Flash 預設 + Plus 升級 + Max-Preview 兜頂；成本敏感場景再下沉到開源 27b / 35b-a3b。

    常規對話與多模態批次交給 Flash；需要更強推理時升級到 Plus；程式設計 Agent / 複雜推理 / 多步規劃升級到 Max-Preview；對成本極敏感或需可審計權重的場景下沉到開源版。
  </Card>
</CardGroup>

## 模型定價

全系採用 **按量付費 - Chat** 計費模式：閉源生產版（Max-Preview / Flash / Plus）按 **單次請求輸入 token 數** 決定整請求單價檔位（階梯計費）；開源版（27b / 35b-a3b）為**單一檔位平價計費**，不分檔。掛牌價持平阿里雲官網，疊加 API易 充值加贈後實際單價約 **官網 8.5 折**。

### qwen3.6-max-preview

| 單次輸入 tokens     | 提示價格（輸入）             | 補全價格（輸出）              |
| --------------- | -------------------- | --------------------- |
| **0 – 128K**    | \$1.2800 / 1M tokens | \$7.6800 / 1M tokens  |
| **128K – 256K** | \$2.1200 / 1M tokens | \$12.7200 / 1M tokens |

### qwen3.6-flash

| 單次輸入 tokens      | 提示價格（輸入）             | 補全價格（輸出）             |
| ---------------- | -------------------- | -------------------- |
| **0 – 256K**     | \$0.1700 / 1M tokens | \$1.0200 / 1M tokens |
| **256K – 1000K** | \$0.6800 / 1M tokens | \$4.0800 / 1M tokens |

### qwen3.6-plus

| 單次輸入 tokens      | 提示價格（輸入）             | 補全價格（輸出）             |
| ---------------- | -------------------- | -------------------- |
| **0 – 256K**     | \$0.3000 / 1M tokens | \$1.8000 / 1M tokens |
| **256K – 1000K** | \$1.2000 / 1M tokens | \$7.2000 / 1M tokens |

### qwen3.6-27b（開源版 · API易官轉託管）

| 計費方式        | 提示價格（輸入）             | 補全價格（輸出）             |
| ----------- | -------------------- | -------------------- |
| **平價（不分檔）** | \$0.4200 / 1M tokens | \$2.5200 / 1M tokens |

### qwen3.6-35b-a3b（開源版 · API易官轉託管）

| 計費方式        | 提示價格（輸入）             | 補全價格（輸出）             |
| ----------- | -------------------- | -------------------- |
| **平價（不分檔）** | \$0.2600 / 1M tokens | \$1.5600 / 1M tokens |

<Info>
  **計費說明**：

  * **閉源生產版（階梯計費）**：單價檔位由**單次請求的總輸入 tokens** 決定，整次請求的所有 tokens（輸入 + 輸出）按對應檔位的單價計費。**跨檔不分攤**——例如 Flash 單次輸入 300K tokens 落入 `256K – 1000K` 檔，整請求按 \$0.68 / \$4.08 計價；不會出現"前 256K 按低價、後 44K 按高價"的拆分。
  * **開源版（平價計費）**：`qwen3.6-27b` 與 `qwen3.6-35b-a3b` 由 API易 官轉託管，單價不分檔；客戶無需自行租 GPU 或部署本地推理，按實際消耗 token 數直接結算。
  * 掛牌價持平阿里雲百鍊官網，疊加 [充值加贈](/zh-Hant/faq/recharge-promotions) 實際單價約 **8.5 折**。
  * 快取命中價當前未單獨披露，按基礎檔計價。
</Info>

## 技術規格

### 閉源生產版

| 維度                  | qwen3.6-max-preview   | qwen3.6-flash   | qwen3.6-plus     |
| ------------------- | --------------------- | --------------- | ---------------- |
| **模型 ID**           | `qwen3.6-max-preview` | `qwen3.6-flash` | `qwen3.6-plus`   |
| **架構**              | 稠密大模型                 | MoE 35B-A3B     | MoE 72B / 18B 啟用 |
| **上下文**             | 262K tokens           | 256K（可擴 1M）     | 1M tokens        |
| **輸入模態**            | 文本                    | 文本 / 影像 / 影片    | 文本               |
| **輸出格式**            | 文本                    | 文本              | 文本               |
| **流式輸出**            | ✅ 支援                  | ✅ 支援            | ✅ 支援             |
| **函式呼叫 / Tool Use** | ✅ 支援                  | ✅ 支援            | ✅ 支援             |
| **思維鏈**             | ✅ 推理任務自動啟用            | —               | ✅ 始終開啟           |
| **計費模式**            | 按量付費 - Chat（階梯）       | 按量付費 - Chat（階梯） | 按量付費 - Chat（階梯）  |
| **通道**              | 阿里雲官轉                 | 阿里雲官轉           | 阿里雲官轉            |

### 開源權重版（API易官轉託管）

| 維度                  | qwen3.6-27b                                | qwen3.6-35b-a3b                                |
| ------------------- | ------------------------------------------ | ---------------------------------------------- |
| **模型 ID**           | `qwen3.6-27b`                              | `qwen3.6-35b-a3b`                              |
| **架構**              | 27B 稠密                                     | MoE 35B 總參 / 3B 啟用                             |
| **開源協議**            | Qwen 團隊開源（Hugging Face `Qwen/Qwen3.6-27B`） | Qwen 團隊開源（Hugging Face `Qwen/Qwen3.6-35B-A3B`） |
| **上下文**             | 與官方權重一致（詳見模型卡片）                            | 與官方權重一致（詳見模型卡片）                                |
| **輸入模態**            | 文本                                         | 文本                                             |
| **流式輸出**            | ✅ 支援                                       | ✅ 支援                                           |
| **函式呼叫 / Tool Use** | ✅ 支援                                       | ✅ 支援                                           |
| **計費模式**            | 按量付費 - Chat（平價不分檔）                         | 按量付費 - Chat（平價不分檔）                             |
| **通道**              | API易 官轉託管                                  | API易 官轉託管                                      |

<Tip>
  **開源版的價值**：開源版本權重在 Hugging Face 公開可下載，但跑起來需要 GPU、視訊記憶體與運維。**API易 把開源權重託管到官轉通道**，客戶用 API 直接呼叫即可——既保留"權重可審計、協議可控"的合規優勢，又免去租卡、部署、運維的成本。
</Tip>

## 端點一覽

| 端點                     | 方法     | Content-Type       | 用途                                         |
| ---------------------- | ------ | ------------------ | ------------------------------------------ |
| `/v1/chat/completions` | `POST` | `application/json` | 對話 / 推理 / 工具呼叫（**5 款模型共用**，僅 `model` 欄位區分） |

<Tip>
  **域名選擇**：`api.apiyi.com` 為主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平臺提供的其他閘道域名，響應行為一致。`base_url` 設為 `https://api.apiyi.com/v1` 即可使用 OpenAI / OpenAI 相容 SDK 直接呼叫。
</Tip>

## 呼叫示例

### Python（OpenAI SDK 相容）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Max-Preview：程式設計 Agent 主驅動
resp = client.chat.completions.create(
    model="qwen3.6-max-preview",
    messages=[
        {"role": "system", "content": "你是一個資深 Python 工程師，按規範返回 unified diff。"},
        {"role": "user", "content": "為下面這段程式碼補充型別註解並修復潛在 bug ..."}
    ]
)
print(resp.choices[0].message.content)

# Flash：影像 + 文本多模態輸入
resp = client.chat.completions.create(
    model="qwen3.6-flash",
    messages=[
        {"role": "user", "content": [
            {"type": "text", "text": "請用中文描述這張圖片的關鍵資訊"},
            {"type": "image_url", "image_url": {"url": "https://your-image-url.png"}}
        ]}
    ]
)
print(resp.choices[0].message.content)

# Plus：日常對話與中等複雜推理
resp = client.chat.completions.create(
    model="qwen3.6-plus",
    messages=[{"role": "user", "content": "用一句話介紹你自己"}]
)
print(resp.choices[0].message.content)
```

### Node.js

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

const resp = await client.chat.completions.create({
  model: 'qwen3.6-plus',
  messages: [{ role: 'user', content: '用一句話介紹你自己' }],
});

console.log(resp.choices[0].message.content);
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.6-max-preview",
    "messages": [
      {"role": "user", "content": "解釋一下什麼是 MoE 架構"}
    ]
  }'
```

## 最佳實踐

<Steps>
  <Step title="按任務選模型檔">
    Flash 預設處理常規對話 / 分類 / 多模態批次；Plus 處理中等複雜推理與企業知識庫問答；只在程式設計 Agent / 複雜規劃 / 數學競賽級推理時升級到 Max-Preview。能省一檔成本就降一檔。
  </Step>

  <Step title="階梯檔位測算">
    上線前先估算 P95 輸入 token 數：Max-Preview 跨過 128K、Flash / Plus 跨過 256K 後單價顯著上升。建議把超長上下文先做摘要 / 分段，控制 P95 在低檔區間內。
  </Step>

  <Step title="多模態分批">
    Flash 支援 1M 上下文與影片輸入，但單次過長會觸發高檔單價。建議把超長影片先切片再喂入，按 256K 分批控制單次成本。
  </Step>

  <Step title="Preview 灰度">
    `qwen3.6-max-preview` 標記為 Preview，權重仍在迭代。關鍵鏈路建議先小流量灰度 + AB 比對，待版本穩定後再切主流量。
  </Step>

  <Step title="工具呼叫與流式">
    三款模型均支援 OpenAI 風格的 `tools` 欄位與 `stream: true`，可直接複用現有 OpenAI Agent 框架（OpenClaw / LangChain / LlamaIndex 等）的工具呼叫邏輯。
  </Step>

  <Step title="充值加贈疊加">
    掛牌價已與官網持平，疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 後實際單價約 **8.5 折**。大額充值（\$1000+）檔位贈送比例更高，長期使用建議一次性充值到位。
  </Step>
</Steps>

## 錯誤碼與重試

| 狀態碼   | 含義           | 處理建議                                        |
| ----- | ------------ | ------------------------------------------- |
| `400` | 引數錯誤 / 模型名錯誤 | 檢查 `model` 欄位拼寫、`messages` 結構、超長輸入是否超出最大上下文 |
| `401` | 令牌無效         | 檢查 Bearer Token 是否正確                        |
| `403` | 內容稽核攔截       | 調整 prompt 或參考輸入，避開違規內容                      |
| `429` | 限流 / 餘額不足    | 指數退避重試，並檢查賬戶餘額                              |
| `5xx` | 閘道 / 後端錯誤    | 重試 1–2 次，仍失敗請提交工單                           |
| 超時    | 長尾響應         | 客戶端超時建議 ≥ **120 秒**（思維鏈或長上下文請求耗時較長）         |

<Info>
  **建議客戶端**：

  * 請求超時 **120 秒** 起步（Max-Preview 推理 / Plus 思維鏈長上下文請求耗時較長）
  * 對 5xx 與超時做 **指數退避重試**（建議 2 次）
  * 記錄響應頭 `x-request-id` 方便排查
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="五款模型用的是同一個 API 端點嗎？">
    是。5 款模型共用 `/v1/chat/completions` 端點，OpenAI Chat Completions 相容格式，僅 `model` 欄位不同（`qwen3.6-max-preview` / `qwen3.6-flash` / `qwen3.6-plus` / `qwen3.6-27b` / `qwen3.6-35b-a3b`），可在同一份程式碼裡按需切換。
  </Accordion>

  <Accordion title="開源版（27b / 35b-a3b）和閉源版有什麼區別？">
    主要差別有三：**(1) 權重可下載**——開源版本可在 Hugging Face 拉取權重，便於內部審計、合規備案或後續切換為本地推理；**(2) 算力託管**——API易 把開源權重託管到官轉通道，客戶調 API 即可，省去租卡、部署與運維成本；**(3) 計費簡單**——開源版按量平價計費，不分檔，預算可控。能力上 35B-A3B 與閉源 Flash 同源不同檔位，27B 是獨立的稠密模型，程式設計能力對標更大引數量級模型。
  </Accordion>

  <Accordion title="既然權重開源，為什麼還要走 API易 的官轉 API？">
    本地跑開源大模型至少需要：合適的 GPU（27B 至少 A100 40G ×1，35B-A3B 視訊記憶體更高）、推理框架（vLLM / TensorRT-LLM）、監控告警、容災、版本升級流程。**API易 官轉託管把這些全部托掉**，按 token 計費，按需擴縮，且與閉源版共用同一份 OpenAI 相容 SDK——開發期用 API 跑通，生產期再決定要不要切自託管，路徑平滑。
  </Accordion>

  <Accordion title="階梯計費具體怎麼算？">
    單價檔位由**單次請求的總輸入 token 數**決定，整次請求的所有 token（輸入 + 輸出）按對應檔位的單價計費。例如 Flash 單次輸入 300K tokens 落入 `256K – 1000K` 檔，整請求按 \$0.68 / \$4.08 計價，不會拆分前 256K 與後 44K。
  </Accordion>

  <Accordion title="Max-Preview 是 Preview，能用於生產嗎？">
    可以，但建議先做小流量灰度。Qwen 團隊已明確表示後續版本仍會迭代權重，關鍵鏈路上線前建議跑 AB 比對，記錄基準任務表現，待版本穩定後再切主流量。
  </Accordion>

  <Accordion title="Flash 的多模態輸入怎麼呼叫？">
    使用 OpenAI Vision 相容格式：`messages` 中 `content` 欄位傳入陣列，每個元素為 `{type: "text", text: ...}` 或 `{type: "image_url", image_url: {url: ...}}`。影片輸入按官方文件使用 `video_url` / 幀取樣欄位。
  </Accordion>

  <Accordion title="API易 與阿里雲百鍊官網價格一樣嗎？">
    掛牌價完全持平阿里雲百鍊官網。區別在於 API易 上疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 後，實際單價約官網 **8.5 折**；同時賬戶支援 OpenAI 全生態切換（GPT / Claude / Gemini / DeepSeek / GLM 等），無需重複開多個供應商賬號。
  </Accordion>

  <Accordion title="是否支援函式呼叫 / Tool Use？">
    支援。三款模型均相容 OpenAI 標準的 `tools` / `tool_choice` 欄位，可直接複用現有 Agent 框架的工具呼叫邏輯。Max-Preview 在多步工具呼叫與長程規劃上表現最佳。
  </Accordion>

  <Accordion title="是否支援思維鏈輸出？">
    Max-Preview 在推理任務上自動啟用思維鏈；Plus 始終開啟思維鏈；Flash 主打速度，預設不輸出思維鏈。具體欄位名以阿里雲官網響應格式為準（`reasoning_content` 等）。
  </Accordion>

  <Accordion title="超過 1M 上下文怎麼辦？">
    Flash 與 Plus 的最大上下文為 1M tokens，Max-Preview 為 262K。超過上限會觸發 `400` 錯誤。建議先做摘要 / 分段 / RAG 檢索，避免一次性塞入超長內容。
  </Accordion>

  <Accordion title="可以用 OpenAI 官方 SDK 直連嗎？">
    可以。把 `base_url` 設為 `https://api.apiyi.com/v1`，`model` 欄位填上述任一模型 ID 即可，零改動遷移。
  </Accordion>

  <Accordion title="失敗的請求會扣費嗎？">
    `4xx` 類客戶端錯誤（引數錯誤 / 鑑權失敗 / 內容稽核攔截）不計費；`5xx` 類服務端錯誤若請求未實際進入推理階段亦不計費。已成功返回 token 的請求按實際 token 數計費，即使響應被客戶端中斷。
  </Accordion>
</AccordionGroup>

## 相關文件

* [深度解讀：Qwen3.6 雙模上線 Max-Preview + Flash](/news/qwen-3-6-max-flash-launch)
* [深度解讀：Qwen3.6-Plus 上線 阿里千問最強程式設計 Agent 模型](/news/qwen-3-6-plus-launch)
* [充值加贈活動](/zh-Hant/faq/recharge-promotions) - 把單價壓到約 8.5 折
* [模型資訊總覽](/zh-Hant/api-capabilities/model-info) - 檢視所有可用模型及分組
* [API 使用手冊](/zh-Hant/api-manual) - 通用呼叫規範

<Info>
  **小結**：Qwen3.6 系列覆蓋了從重型 Coding Agent 到高頻多模態分發的完整需求曲線——Max-Preview 把國產程式設計推到新高，Flash 用極低單價撐起多模態長上下文，Plus 是穩定的均衡主力；27B 與 35B-A3B 兩款開源版由 API易 官轉託管，把"開源權重可控 + 免租卡"這條路徑補齊。5 款模型共用 OpenAI Chat 相容端點，掛牌持平官網 + 充值加贈約 8.5 折，是當前阿里雲官轉通道里價效比最優的國產模型組合。
</Info>
