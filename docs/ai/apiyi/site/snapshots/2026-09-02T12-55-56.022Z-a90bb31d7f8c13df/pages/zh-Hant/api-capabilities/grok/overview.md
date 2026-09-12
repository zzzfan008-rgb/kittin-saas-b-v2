> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 系列模型呼叫指南

> xAI Grok 4.x 系列（grok-4.6 / grok-4.5 / grok-4.3 / grok-4.20 / grok-build-0.1）API易 呼叫總覽：OpenAI 相容 + Responses API 雙端點，聯網搜尋 / X 搜尋 / 程式碼執行 / MCP 四大 server-side 工具實測可用，掛牌價與 xAI 官網一致，GrokOfficial 分組 0.8x。

Grok 是 xAI 推出的旗艦大模型家族。當前一代（Grok 4.x）覆蓋旗艦通用、長上下文標準檔、推理/非推理雙變體、程式碼專用與多智慧體協作五條產品線，全部已上架 API易。**xAI 官方 API 本身就是 OpenAI 相容格式**（Chat Completions + Responses API），沒有獨立的私有協議——因此在 API易 上用 OpenAI SDK 即可呼叫全部能力，包括官方的 server-side 工具（聯網搜尋、X 搜尋、程式碼執行、Remote MCP）。

本組文件基於 2026年7月13日 (UTC+8) 在 API易 閘道上的全量實測（56 組請求/響應日誌）編寫，能力邊界均有實測依據。

<Note>
  **🚀 核心亮點**：`grok-4.6` 是 xAI 於 2026年8月7日 釋出的最新旗艦，沿用 grok-4.5 的 1.5T 引數 V9 基座、提升全部來自後訓練，**掛牌價與 grok-4.5 完全相同**；grok-4.3 與 grok-4.20 系列提供 **100 萬 tokens 上下文**；Responses API 的 **web\_search / x\_search / code\_interpreter / MCP 四大工具在 API易 實測真實可用**，其中 X 搜尋是 Grok 獨有的差異化能力；原生 responses 協議還意味著 Grok 可以[直接接入 OpenAI Codex](/zh-Hant/scenarios/programming/codex-cli)。全系可走 **`GrokOfficial` 分組享 0.8x 倍率（8 折）**，詳見下方「分組與折扣」。
</Note>

## 模型陣容

<CardGroup cols={3}>
  <Card title="grok-4.6" icon="trophy">
    **最新旗艦 · 程式碼與 Agent**

    2026/8/7 釋出，500K 上下文。與 grok-4.5 同基座同價，長週期任務的自檢與驗證更強。
  </Card>

  <Card title="grok-4.5" icon="medal">
    **上一代旗艦 · 同價**

    500K 上下文，與 grok-4.6 掛牌同價，存量業務可繼續使用。
  </Card>

  <Card title="grok-4.3" icon="scale">
    **標準主力**

    1M 上下文，價格是旗艦的六折出頭，日常對話與中等推理的均衡之選。
  </Card>

  <Card title="grok-4.20 雙變體" icon="split">
    **推理 / 非推理可選**

    `-reasoning` 與 `-non-reasoning` 同價同上下文（1M），按需選擇是否輸出思維鏈。
  </Card>

  <Card title="grok-build-0.1" icon="code">
    **程式碼專用**

    256K 上下文，全系最低單價，適合高頻程式碼補全與輕量程式設計任務。
  </Card>

  <Card title="grok-4.20-multi-agent-beta-0309" icon="users">
    **多智慧體協作**

    多個 agent 並行協作解題，適合複雜研究任務。計費特性特殊，詳見 [Multi-Agent 模型](/zh-Hant/api-capabilities/grok/multi-agent)。
  </Card>

  <Card title="更多能力頁" icon="book-open">
    對話/推理/視覺見 [對話與推理](/zh-Hant/api-capabilities/grok/chat)；聯網見 [聯網搜尋與 X 搜尋](/zh-Hant/api-capabilities/grok/web-search)。
  </Card>
</CardGroup>

## 模型定價

掛牌價與 xAI 官網一致（已於 2026-07-13 經 API易 定價介面逐一核對，`grok-4.6` 於 2026-08-13 補核），API易 的折扣體現在 **`GrokOfficial` 分組 0.8x** 與 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 中，兩者可疊加。

下表為 **0 – 200K 上下文件位**的掛牌價（Grok 全系按上下文長度階梯計費，超過 200K 的檔位見下方說明）：

| 模型 ID                             | 上下文  | 提示價格（輸入）           | 補全價格（輸出）           | 定位                    |
| --------------------------------- | ---- | ------------------ | ------------------ | --------------------- |
| `grok-4.6`                        | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | **最新旗艦**，程式碼/Agent/通用 |
| `grok-4.5`                        | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | 上一代旗艦，與 4.6 同價        |
| `grok-4.3`                        | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 標準主力                  |
| `grok-4.20-0309-reasoning`        | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 推理變體                  |
| `grok-4.20-0309-non-reasoning`    | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 非推理變體（快答/低成本）         |
| `grok-4.20-multi-agent-beta-0309` | 1M   | \$1.25 / 1M tokens | \$2.50 / 1M tokens | 多智慧體（注意計費放大）          |
| `grok-build-0.1`                  | 256K | \$1.00 / 1M tokens | \$2.00 / 1M tokens | 程式碼專用                 |

### 階梯計費與快取價

Grok 全系按**單次請求的上下文長度**分兩檔計費，分檔點為 200K tokens（即 200Ki = 204,800）。超過該點的請求，輸入與輸出單價翻倍：

| 模型                          | 檔位          | 輸入     | 輸出      | 快取讀取   |
| --------------------------- | ----------- | ------ | ------- | ------ |
| `grok-4.6`                  | 0 – 200K    | \$2.00 | \$6.00  | \$0.50 |
| `grok-4.6`                  | 200K – 512K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.5`                  | 0 – 200K    | \$2.00 | \$6.00  | \$0.30 |
| `grok-4.5`                  | 200K – 512K | \$4.00 | \$12.00 | \$0.60 |
| `grok-4.3` / `grok-4.20` 系列 | 0 – 200K    | \$1.25 | \$2.50  | \$0.20 |
| `grok-4.3` / `grok-4.20` 系列 | 200K – 1M   | \$2.50 | \$5.00  | \$0.40 |
| `grok-build-0.1`            | 0 – 200K    | \$1.00 | \$2.00  | \$0.20 |
| `grok-build-0.1`            | 200K – 256K | \$2.00 | \$4.00  | \$0.40 |

單位均為每 1M tokens。**`grok-4.6` 與 `grok-4.5` 唯一的價格差異在快取讀取**（\$0.50 vs \$0.30），輸入輸出完全相同。

其中 `grok-4.6` 兩檔的輸入 / 輸出 / 快取讀取價均已在 API易 控制台逐項核對；其餘模型第二檔的快取讀取價按官方「第二檔單價翻倍」口徑推算，以 [模型價格頁](/zh-Hant/api-capabilities/model-info) 的即時掛牌為準。

<Info>
  * 別名 `grok-code-fast` / `grok-code-fast-1` 亦可呼叫（實測連通），定價以 [模型價格頁](/zh-Hant/api-capabilities/model-info) 為準。
  * 快取命中的輸入 tokens 享受上表的快取讀取價，Grok 字首快取**自動生效、無需配置**，雙端點與流式 / 非流式均已實測覆蓋，詳見 [Grok 快取計費指南](/zh-Hant/api-capabilities/grok/prompt-caching)。
  * 長上下文任務請留意分檔點：一次 210K tokens 的請求，全部 tokens 都按第二檔計價，而不是隻有超出的 10K 按第二檔。拆分請求可以避開這一跳變。
</Info>

## 分組與折扣

| 分組             | 倍率       | 說明                         |
| -------------- | -------- | -------------------------- |
| `Default`      | 1.0x     | 預設分組，掛牌價即官網同價              |
| `GrokOfficial` | **0.8x** | xAI 官方直轉線路，**預設分組售價的 8 折** |

`GrokOfficial` 的**模型能力與呼叫方式和預設分組完全一致**，單獨拆出這個分組只是為了做優惠、鼓勵在 Grok 系列上多跑量。建立令牌時勾選該分組（或在已有 Grok 令牌上增加該分組）即可，**程式碼一行不用改**；`grok-4.6` 等模型在該分組下同樣支援 Codex 場景使用。

折扣可與 [充值加贈](/zh-Hant/faq/recharge-promotions)（10%–20%）疊加。以 `grok-4.6` 第一檔為例：

| 口徑                 | 輸入 / 1M tokens | 輸出 / 1M tokens |
| ------------------ | -------------- | -------------- |
| xAI 官網 = API易 掛牌   | \$2.00         | \$6.00         |
| `GrokOfficial` 8 折 | \$1.60         | \$4.80         |
| 8 折 + 充值加贈 10%     | \$1.45         | \$4.36         |
| 8 折 + 充值加贈 20%     | **\$1.33**     | **\$4.00**     |

## 實測能力矩陣

以下矩陣來自 2026-07-13 (UTC+8) 在 API易 閘道的實測（✅ 實測通過；◐ 未實測、同架構預期一致；— 未覆蓋，同架構預期一致）：

| 能力                             | grok-4.6 | grok-4.5 | grok-4.3 | 4.20-reasoning | 4.20-non-reasoning | grok-build-0.1 | multi-agent |
| ------------------------------ | :------: | :------: | :------: | :------------: | :----------------: | :------------: | :---------: |
| 基礎對話                           |     ✅    |     ✅    |     ✅    |        ✅       |          ✅         |        ✅       |      ✅      |
| 流式輸出（含 usage）                  |     ✅    |     ✅    |     ✅    |        ✅       |          ✅         |        ✅       |      ✅      |
| 思維鏈輸出 `reasoning_content`      |  ◐ 預設開啟  |  ✅ 預設開啟  |  ✅ 預設開啟  |        ✅       |       ❌ 按設計關閉      |     ✅ 預設開啟     |   內部推理不外露   |
| `reasoning_effort` 引數          |     ◐    |     ✅    |     —    |     ❌ 明確拒絕     |          —         |        —       |      —      |
| 結構化輸出（json\_schema）            |     ◐    |     ✅    |     ✅    |        ✅       |          —         |        ✅       |      ✅      |
| 函式呼叫 / Tool Use                |     ◐    |     ✅    |     ✅    |        —       |          —         |        ✅       |      —      |
| 視覺輸入（圖片理解）                     |     ◐    |     ✅    |     ✅    |        —       |          ✅         |        —       |      —      |
| Prompt Caching（自動）             |     ✅    |     ✅    |     ✅    |        ✅       |          ✅         |        ✅       |      ✅      |
| Responses API + server-side 工具 |     ◐    |     ✅    |     —    |        —       |          —         |        —       |      —      |

<Note>
  **`grok-4.6` 那一列為什麼還有 ◐**：這套 56 組請求的實測跑於 2026-07-13，當時 4.6 尚未釋出。2026-08-19 我們對 4.6 補測了**基礎對話、流式輸出（含 usage）與 Prompt Caching** 三項（覆蓋 `/v1/chat/completions` 與 `/v1/responses` 雙端點、流式與非流式，並逐條核對了賬單），已改為實測結論。其餘仍為 ◐ 的專案沿用同架構預期一致的判斷：4.6 與 4.5 同為 1.5T 引數 V9 基座、同一套 API 協議與端點，上游也未公告任何引數層面的破壞性變更。生產接入前建議先在自己的用例上做一次小樣驗證。
</Note>

## 端點一覽

| 端點                     | 方法     | 用途                                                        |
| ---------------------- | ------ | --------------------------------------------------------- |
| `/v1/chat/completions` | `POST` | 對話 / 推理 / 函式呼叫 / 結構化輸出 / 視覺（全系共用，`model` 欄位區分）            |
| `/v1/responses`        | `POST` | Responses API：聯網搜尋、X 搜尋、程式碼執行、Remote MCP 等 server-side 工具 |

### 在 Codex 中直接使用

因為原生支援 `/v1/responses`，Grok 是少數能在 **OpenAI Codex**（桌面客戶端 / IDE 外掛 / CLI）裡以 responses 原生協議直接使用的非 OpenAI 模型——`config.toml` 裡 `model = "grok-4.6"`、`wire_api = "responses"` 即可，5 分鐘接上，Codex 的工具呼叫、推理條目等 Agent 能力全走原生協議。對比之下，Claude / Gemini 在 API易 上只能走 OpenAI 相容 chat 模式（`wire_api = "chat"` 兜底），在 Codex / Agent 場景存在協議不相容。完整接入步驟見 [Codex 接入教程](/zh-Hant/scenarios/programming/codex-cli)。

<Warning>
  **以下能力在 API易 上不支援**（實測確認，避免踩坑）：

  * **Legacy Completions（`/v1/completions`）**：上游拒絕——Grok 4.x 全係為推理架構，官方層面即不支援文本補全模式
  * **聯網舊入口 `search_parameters`**：已被 xAI 下線（實測返回 410），聯網一律走 Responses API 工具，見 [聯網搜尋](/zh-Hant/api-capabilities/grok/web-search)
  * **Batch API / Files 檔案能力**：閘道不路由，號池模式不適用
  * **Deferred Completions（`deferred: true`）**：引數會被**靜默忽略**，請求按同步執行並正常計費，請勿依賴
  * **Collections Search（RAG / file\_search）**：需在 xAI 控制台預建知識庫，號池模式不適用
  * **Context Compaction（`/v1/responses/compact`）**、**Priority Processing（`service_tier: "priority"`，實測回落 default）**、**WebSocket 模式**、**mTLS 認證**：均不支援
</Warning>

## 快速開始

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "grok-4.6",
      "messages": [
        {"role": "user", "content": "用一句話介紹你自己"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-api-key",
      base_url="https://api.apiyi.com/v1"
  )

  resp = client.chat.completions.create(
      model="grok-4.6",
      messages=[{"role": "user", "content": "用一句話介紹你自己"}]
  )
  print(resp.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-api-key',
    baseURL: 'https://api.apiyi.com/v1',
  });

  const resp = await client.chat.completions.create({
    model: 'grok-4.6',
    messages: [{ role: 'user', content: '用一句話介紹你自己' }],
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

<Tip>
  **模型怎麼選**：預設用 `grok-4.3`（1M 上下文、價格均衡）；程式碼 Agent / 複雜任務升級 `grok-4.6`（最新旗艦，與 `grok-4.5` 同價，存量 4.5 業務改個模型名即可）；追求快答低成本用 `grok-4.20-0309-non-reasoning`（無思維鏈、輸出 tokens 最省）；高頻程式碼補全用 `grok-build-0.1`；複雜研究類任務才考慮 multi-agent 模型（注意其計費放大特性）。想把成本壓到最低，記得把令牌切到 `GrokOfficial` 分組（0.8x）併疊加充值加贈。
</Tip>

## 計費注意：思維鏈 tokens

`grok-4.6` / `grok-4.5` / `grok-4.3` / `grok-build-0.1` **預設帶內部推理**：響應中返回 `reasoning_content`，且推理 tokens 計入輸出計費。實測短問答中可見文本僅 30 tokens、實際計費輸出 586 tokens（含 556 推理 tokens）。對成本敏感的短問答場景，建議改用 `grok-4.20-0309-non-reasoning`。詳細說明見 [對話與推理](/zh-Hant/api-capabilities/grok/chat)。

## 常見問題

<AccordionGroup>
  <Accordion title="Grok 有自己的原生 API 格式嗎？">
    沒有獨立私有協議。xAI 官方 REST API 就是 OpenAI 相容格式：`/v1/chat/completions`（對話）+ `/v1/responses`（Responses API 與 server-side 工具）。在 API易 上用 OpenAI SDK 把 `base_url` 指向 `https://api.apiyi.com/v1` 即為全功能呼叫，不存在"相容模式閹割"。
  </Accordion>

  <Accordion title="聯網搜尋怎麼開？">
    走 Responses API：`tools: [{"type": "web_search"}]`（或 `x_search`）。舊版 Chat Completions 的 `search_parameters` 引數已被 xAI 下線（實測 410），不要再使用。詳見 [聯網搜尋與 X 搜尋](/zh-Hant/api-capabilities/grok/web-search)。
  </Accordion>

  <Accordion title="模型自我介紹說自己是 Grok 4，是不是模型不對？">
    正常現象。Grok 4.x 全系的自我認知均為「Grok 4」（multi-agent 模型自稱 Oppie），不會精確報出 4.6 / 4.5 / 4.3 等版本號。驗證模型身份請以請求的 `model` 欄位和響應 `model` 欄位為準，而非模型的自我介紹。
  </Accordion>

  <Accordion title="快取需要配置嗎？">
    不需要。Grok 字首快取自動生效，響應 `usage.prompt_tokens_details.cached_tokens` 可自查命中量（`/v1/responses` 端點看 `usage.input_tokens_details.cached_tokens`）。命中量按 128 token 取整，兩輪實測都吻合：8802 token 的字首命中 8704、2735 token 的字首命中 2688。xAI 官方明確快取條目可能被驅逐、不保證 100% 命中，**做成本測算請按無快取價格打底**。完整口徑見 [Grok 快取計費指南](/zh-Hant/api-capabilities/grok/prompt-caching)。
  </Accordion>

  <Accordion title="上下文超限會怎樣？">
    返回 400 錯誤。注意各檔上限不同：grok-4.6 與 grok-4.5 為 500K，grok-4.3 與 4.20 系列為 1M，grok-build-0.1 為 256K。超長內容建議先做摘要 / 分段 / RAG 檢索。
  </Accordion>

  <Accordion title="失敗的請求會扣費嗎？">
    4xx 類客戶端錯誤（引數錯誤 / 鑑權失敗）不計費；已成功返回 tokens 的請求按實際消耗計費。注意 `deferred: true` 會被靜默忽略——請求實際同步執行並正常計費。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="對話與推理" icon="message-square" href="/zh-Hant/api-capabilities/grok/chat">
    流式、思維鏈、結構化輸出、函式呼叫、視覺輸入、快取
  </Card>

  <Card title="快取計費" icon="database" href="/zh-Hant/api-capabilities/grok/prompt-caching">
    命中省 75%、128 token 塊粒度、長對話該走哪個端點
  </Card>

  <Card title="聯網搜尋與 X 搜尋" icon="globe" href="/zh-Hant/api-capabilities/grok/web-search">
    Responses API 的 web\_search / x\_search 工具實戰
  </Card>

  <Card title="程式碼執行與 MCP" icon="terminal" href="/zh-Hant/api-capabilities/grok/code-execution-mcp">
    服務端 Python 沙箱與 Remote MCP 工具接入
  </Card>

  <Card title="Multi-Agent 模型" icon="users" href="/zh-Hant/api-capabilities/grok/multi-agent">
    多智慧體協作模型的能力與計費特性
  </Card>

  <Card title="在 Codex 中使用 Grok" icon="code" href="/zh-Hant/scenarios/programming/codex-cli">
    原生 responses 協議直連 Codex，5 分鐘接上
  </Card>

  <Card title="Grok 4.6 釋出解讀" icon="newspaper" href="/news/grok-4-6-launch">
    xAI 最新旗艦的基準、定價與遷移建議
  </Card>

  <Card title="Grok 4.5 釋出解讀" icon="newspaper" href="/news/grok-4-5-launch">
    上一代旗艦的深度解讀
  </Card>

  <Card title="模型資訊總覽" icon="database" href="/zh-Hant/api-capabilities/model-info">
    檢視所有可用模型及分組
  </Card>
</CardGroup>
