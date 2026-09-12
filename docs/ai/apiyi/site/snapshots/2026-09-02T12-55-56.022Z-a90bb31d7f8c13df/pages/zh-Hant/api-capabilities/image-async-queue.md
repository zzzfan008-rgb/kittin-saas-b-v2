> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片 API 接入實踐：自實現非同步佇列

> API易 圖片 API 是同步介面。本文分享如何在同步介面之上自行實現非同步任務佇列：任務式管理、重試解耦、結果落庫與多服務商接入。

<Info>
  本頁是一篇**技術分享 / 建議篇**，面向需要把圖片生成接入到自己產品裡的開發團隊。我們只提供工程實踐思路，不涉及任何需要 API易 側改造的功能——你完全可以基於現有的同步介面落地。
</Info>

## 同步還是非同步？先理解 API易 的介面模型

API易 的圖片生成**全部是同步介面**：`/v1/images/generations` 等端點「請求一旦提交就會跑到結束」。客戶端即使中途斷開連線，服務端仍會把這次出圖完整執行完——也就是說，它不是「先拿一個 task\_id、再輪詢結果」的非同步任務介面。

<Info>
  API易 在閘道層已經把上游的非同步 polling（部分服務商官方走 `polling_url` 輪詢）封裝成了**同步的 OpenAI Images API**。對你而言永遠是「一次提交、一次拿結果」，**不需要自己寫輪詢迴圈**。
</Info>

很多團隊第一反應是：「那我怎麼做非同步任務管理？」——這其實是兩件事：

* **同步**：是 API易 介面的形態（HTTP 請求級別，發一次拿一次）。
* **非同步佇列**：是**你這一側的工程實踐**（業務任務級別，提交即返回、後臺慢慢跑）。

兩者並不衝突。下面講的，就是如何在同步介面之上，自己包一層非同步佇列。

## 為什麼開發團隊仍然需要「任務式」管理

直接在使用者請求執行緒裡同步調一次圖片 API，對 Demo 足夠；但一旦面向 C 端使用者、要做產品，你幾乎一定需要把「業務任務」和「單次 HTTP 呼叫」解耦。原因有四：

<CardGroup cols={2}>
  <Card title="成功 ≠ 一次呼叫" icon="repeat">
    一個「成功的任務」往往由**多次同步呼叫**拼成：首次超時、偶發 429/503 都需要重試。把任務和單次呼叫解耦後，重試、退避、超時都對終端使用者透明——使用者只看到「這張圖最終成了」。
  </Card>

  <Card title="透明轉發，不存輸入輸出" icon="database">
    API易 只做**透明轉發，不儲存使用者的輸入和輸出**（prompt、參考圖、出圖結果都不留底）。要給使用者做歷史記錄、狀態查詢、結果留存，**必須自己落庫**——這是產品側繞不開的一步。
  </Card>

  <Card title="C 端體驗更友好" icon="face-slightly-smiling">
    使用者提交即拿到 `task_id`，前端**輪詢任務狀態**而不是乾等一條長連線。重新整理頁面、臨時斷網都不會丟任務；批量出圖也能排隊跑、逐個回填。
  </Card>

  <Card title="多服務商接入成為可能" icon="layers">
    一旦有了自己的任務抽象層，Worker 層就能按需切換/容災/比價**多個服務商**——退一萬步講，這讓「不把雞蛋放一個籃子」成為可能。
  </Card>
</CardGroup>

## 參考架構：把同步呼叫包進非同步佇列

核心思路只有一句：**API 層只負責"收任務、入隊、返回 task\_id"，真正的同步呼叫交給後臺 Worker。**

```text theme={null}
  C端/前端 ──①提交任務──▶  API 層  ──②入隊──▶  佇列 (Redis / MQ / DB 表)
      ▲                      │                              │
      │ ⑤輪詢 task 狀態        │ 立即返回 task_id               │ ③取任務
      │                      ▼                              ▼
      └──────────────────  資料庫  ◀──④落庫(狀態/輸入/輸出URL)── Worker
                                                              │ 同步呼叫 API易
                                                              │ (帶重試 / 退避)
                                                              ▼
                                                  api.apiyi.com (同步圖片 API)
```

<Steps>
  <Step title="提交即返回">
    前端把出圖請求發給你自己的 API 層；API 層建立一條任務記錄（狀態 `pending`）、寫入佇列，**立即把 `task_id` 返回給前端**。整個過程不阻塞使用者，毫秒級返回。
  </Step>

  <Step title="入隊">
    佇列可以很輕：Redis List / Stream、RabbitMQ / Kafka，甚至一張帶 `status` 欄位的資料庫表配合定時掃描都行。選型取決於你的量級，不必一上來就上重型中介軟體。
  </Step>

  <Step title="Worker 同步呼叫 + 重試">
    後臺 Worker 從佇列取任務，把狀態置為 `running`，**同步呼叫** API易 圖片介面。遇到可重試錯誤時按指數退避重試（見下文「重試與計費」），全程對使用者透明。
  </Step>

  <Step title="落庫">
    無論成功失敗，都把結果寫回資料庫：成功則存輸出圖地址、耗時、計費後設資料，狀態置 `succeeded`；失敗則存錯誤資訊、狀態置 `failed`。**這一步就是 API易 不替你做、必須自己做的部分。**
  </Step>

  <Step title="前端輪詢">
    前端拿著 `task_id` 週期性查任務狀態（或用 WebSocket / SSE 推送）。任務完成就展示結果，失敗就給出友好提示。使用者的瀏覽器從頭到尾不需要掛著一條長連線。
  </Step>
</Steps>

## 任務狀態機與資料模型

建議用一個清晰的狀態機來描述每個任務的生命週期：

| 狀態          | 含義                 | 典型流轉                                  |
| ----------- | ------------------ | ------------------------------------- |
| `pending`   | 已入隊，等待 Worker 領取   | → `running`                           |
| `running`   | Worker 正在同步呼叫 API易 | → `succeeded` / `retrying` / `failed` |
| `retrying`  | 命中可重試錯誤，等待退避後重試    | → `running`                           |
| `succeeded` | 出圖成功，結果已落庫         | 終態                                    |
| `failed`    | 重試用盡或不可重試錯誤        | 終態                                    |

任務表建議至少記錄以下欄位（具體型別按你的技術棧而定）：

| 欄位                          | 說明                        |
| --------------------------- | ------------------------- |
| `task_id`                   | 任務唯一標識，提交時即返回給前端          |
| `status`                    | 上表中的狀態列舉                  |
| `provider` / `model`        | 使用的服務商與模型（為多服務商預留）        |
| `input`                     | 使用者輸入（prompt、參考圖引用、尺寸等引數） |
| `output_url`                | 出圖結果地址（建議轉存自有儲存後的 URL）    |
| `retry_count`               | 已重試次數，用於限流與排查             |
| `error`                     | 失敗原因（錯誤碼 + 友好文案）          |
| `created_at` / `updated_at` | 建立與最近更新時間（建議帶時區，如 UTC+8）  |
| `latency` / `cost`          | 耗時與計費後設資料，便於成本核算與監控       |

<Tip>
  出圖結果建議**轉存到你自己的物件儲存**（OSS / S3 等）後再把 URL 落庫，不要長期依賴第三方返回的臨時連結——臨時連結可能過期，自己存一份對 C 端展示更穩定。
</Tip>

## 重試與計費：哪些該重試，哪些不該

「任務式管理」最大的價值就是把重試做對。不同錯誤的計費與重試策略並不一樣：

| 場景                       | 是否計費    | 是否重試                            |
| ------------------------ | ------- | ------------------------------- |
| `429` / `503`（限流 / 上游繁忙） | 不計費     | ✅ 可重試，指數退避，建議 2 次               |
| 客戶端超時主動斷開                | **仍計費** | ⚠️ 可重試，但要先按解析度設定合理超時（約 60–600s） |
| 內容安全拒絕（狀態碼 200 仍計費）      | **仍計費** | ❌ 不應重試，應回傳使用者友好提示               |

<Warning>
  把「**業務任務的重試次數**」和「**是否產生計費**」分開記賬。`429/503` 重試不計費可以放心退避；但超時斷開、內容安全拒絕即使「失敗」也已計費——盲目重試會**放大成本**。重試前先判斷錯誤型別，再決定要不要再花一次錢。
</Warning>

錯誤判定與友好提示的完整口徑，見下面兩篇：

<CardGroup cols={2}>
  <Card title="Gemini 出圖錯誤處理" icon="triangle-alert" href="/zh-Hant/api-capabilities/gemini-image-error-handling">
    出圖失敗的判斷指標、內容稽核政策與友好提示方案。
  </Card>

  <Card title="出圖失敗保障計劃" icon="shield-check" href="/zh-Hant/api-capabilities/nano-banana-pro-guarantee">
    非主觀原因導致的失敗，按條數核算後補發額度。
  </Card>
</CardGroup>

## 進階：一套佇列接多個服務商

有了任務抽象層，Worker 呼叫就可以從「寫死調某個介面」變成「按 `provider` 路由」。統一一個 `submit(provider, payload)` 入口，Worker 按任務裡的 `provider` 欄位決定實際打到哪個上游：

* **容災**：A 服務商連續失敗時自動切到 B，對使用者無感。
* **比價 / 分流**：按成本或場景把不同任務分給不同服務商或模型。
* **灰度**：新模型先放一小部分流量驗證，再逐步放量。

<Info>
  多數情況下其實**不需要**自建多服務商層：API易 本身已聚合 gpt-image-2、Nano Banana、FLUX、Seedream 等多模型，一個 API易 Key 即可在同一介面風格下覆蓋大部分需求。自建 provider 抽象層是「退一萬步」的可選項——當你確實需要跨服務商容災或比價時再上。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="同步介面為什麼不直接給我一個非同步 task 介面？">
    圖片出圖本身就是「發一次、拿一張圖」的強同步語義，封裝成同步介面對絕大多數呼叫方最簡單——不用維護輪詢、不用處理 task 過期。是否需要非同步佇列、狀態機、落庫，取決於你的**產品形態**（是否面向 C 端、是否要歷史記錄），所以這部分留給你按需自建最靈活。
  </Accordion>

  <Accordion title="客戶端超時主動斷開，任務還在跑嗎？會計費嗎？">
    會繼續跑。同步端點一旦收到請求就會執行到結束，客戶端斷開**不會**中止服務端出圖，且這次出圖**照常計費**。所以請按解析度設定足夠的超時（約 60–600s），不要把超時設得過短導致「白花錢還拿不到圖」。
  </Accordion>

  <Accordion title="API易 會幫我存歷史出圖記錄嗎？">
    不會。API易 只做**透明轉發，不儲存使用者的輸入和輸出**。要給使用者提供歷史記錄、狀態查詢、結果留存，需要你在自己這一側落庫——這正是本文建議「任務式管理」的核心原因。
  </Accordion>

  <Accordion title="我已經在用 API易 的一個 Key，還需要多服務商層嗎？">
    多數情況不需要。API易 已經在一個介面風格下聚合了多家模型，一個 Key 通常夠用。只有當你有跨服務商容災、比價、合規分流等明確訴求時，再考慮在 Worker 層加 provider 抽象——這是可選項，不是必需項。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="圖片 API 呼叫須知與最佳實踐" icon="book-check" href="/zh-Hant/api-capabilities/image-api-best-practices">
    各模型 timeout 速查表、base64 處理與 URL 輸出對照。
  </Card>

  <Card title="為什麼沒有非同步介面" icon="circle-question-mark" href="/zh-Hant/faq/image-async-api">
    FAQ：圖片生成有非同步介面嗎？支援任務 ID 查詢嗎？
  </Card>

  <Card title="FLUX 概覽" icon="sparkles" href="/zh-Hant/api-capabilities/flux/overview">
    上游非同步 polling 被封裝成同步 OpenAI Images API 的例項。
  </Card>

  <Card title="Nano Banana 開發指南" icon="compass" href="/zh-Hant/api-capabilities/nano-banana-dev-guide">
    同步多執行緒呼叫、超時設定與計費基礎一站式說明。
  </Card>

  <Card title="Gemini 出圖錯誤處理" icon="triangle-alert" href="/zh-Hant/api-capabilities/gemini-image-error-handling">
    出圖失敗的判斷指標與友好提示方案。
  </Card>

  <Card title="出圖失敗保障計劃" icon="shield-check" href="/zh-Hant/api-capabilities/nano-banana-pro-guarantee">
    非主觀原因失敗的額度補發規則。
  </Card>
</CardGroup>
