> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 生圖/編輯

> 谷歌最新影像生成模型 Nano Banana 2 (gemini-3.1-flash-image-preview)，Pro級畫質、Flash級速度，支援4K輸出、14種寬高比、影像搜尋Grounding，按次 $0.055/次，按量低至 $0.025/張。

## 概述

**Nano Banana 2**（代號）是谷歌於 2026 年 2 月 26 日釋出的最新影像生成模型，模型 ID 為 `gemini-3.1-flash-image-preview`。它以 **Pro 級畫質 + Flash 級速度和成本** 重新定義了影像生成的價效比，是 Nano Banana 系列的最新旗艦。

<Note>
  **🔥 2026年2月26日釋出**：Nano Banana 2 上線！Pro 級畫質、Flash 級速度，支援按量計費（低至官網 36%），512px 低至 \$0.025/張！支援 4K 輸出、14 種寬高比、影像搜尋 Grounding 等獨家特性。
</Note>

<Note>
  **🆕 2026年5月29日更新（去掉 `-preview`）**：谷歌更新了官方文件，推出去掉 `-preview` 的正式模型名 **`gemini-3.1-flash-image`**，API易已同步上線支援。

  * **原模型名仍可用**：`gemini-3.1-flash-image-preview` 繼續正常呼叫，**價格不變**，現有程式碼無需改動。
  * **兩個名字都能跑**：可按需選用新名 `gemini-3.1-flash-image` 或原 `-preview` 名。

  話說在前面：正式版相比 preview 版在效果表現、安全稽核機制等方面是否存在差異，谷歌官方暫未明確說明，歡迎大家在實際使用中一起測試反饋。
</Note>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/nano-banana-2-image/text-to-image">
    輸入文本提示詞生成圖片，帶互動式 Playground 線上除錯。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/nano-banana-2-image/image-edit">
    上傳圖片 + 編輯指令生成新圖片，帶互動式 Playground 線上除錯。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、`parts` 防禦式解析、上傳壓縮、解析度引數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Nano Banana 2 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Nano Banana 2（`gemini-3.1-flash-image`）的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/nano-banana-2-image/overview.md](https://docs.apiyi.com/api-capabilities/nano-banana-2-image/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：走 Gemini 原生格式 `POST https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image:generateContent`，客戶端 timeout 提到 360 秒兜底。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬，任何一層小於生成時間都會掐斷請求。如果你用 Node，注意 undici 有三個獨立的超時設定，SDK 的 `timeout` 並不覆蓋它們。

  2. 返回解析（**最容易寫錯的一條**）：圖片是 base64，在 `candidates[0].content.parts[]` 裡的 `inlineData.data`。但 `parts` 是**異構陣列，段數和順序都不保證**——前面可能掛一個文本段，圖片就落到下標 1 而不是 0。本模型尤其容易出現這種情況，因為它支援返回思維過程文本。所以**絕對不要寫死 `parts[0]` 或 `parts[1]`**，在兩者之間來回改是解決不了問題的。正確寫法：遍歷 `parts`、篩出所有含 `inlineData` 的段，取**最後一張**（複雜任務會返回多張中間稿，最後一張才是終稿）。`mimeType` 也從響應裡讀，不要寫死成 `image/png`。拿到後渲染展示並提供「儲存到本地」。

  3. 上傳壓縮：編輯時把參考圖 base64 塞進 `inlineData`。上傳前先壓縮——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；多圖時合計控制在 6MB 以內。官方硬限制是單圖 7MB、每次請求最多 14 張，而 base64 編碼後體積還會再膨脹約三分之一，所以單圖儘量壓到 5MB 以內留足餘量。某張圖壓縮失敗就回退用原圖繼續，不要因為壓縮失敗中斷整個請求。另外注意：**同一個 part 裡只能放 `text` 或 `inlineData` 其中一個**，不能兩個欄位並存，正確結構是 1 個文本段 + N 個圖片段。

  4. 解析度引數：**必須顯式傳** `generationConfig.imageConfig.imageSize`（`512` / `1K` / `2K` / `4K`，預設 `1K`）和 `aspectRatio`（本頁列了 14 個合法比例）。本模型按量計費時**解析度直接決定單價**，靠預設值會讓成本不可控。前臺介面把解析度和比例都做成下拉。另外：程式碼裡模型名統一用 `gemini-3.1-flash-image`，**不要用帶 `-4k` 字尾的那個名字**（那是給聊天客戶端用的），需要 4K 直接在 `imageSize` 裡指定即可。本模型不支援 Google 搜尋接地（`tools` 裡的 `google_search`），不要傳。

  5. 錯誤處理：內容稽核攔截時 HTTP 仍然是 200，但 `candidates[0].content.parts` 為空。判斷順序是先看 `candidatesTokenCount` 是否為 0，再看 `finishReason` 是否非 `STOP`。`IMAGE_SAFETY` 這類攔截**不計費**，原樣重試 1-2 次往往就成功了，建議在程式碼裡對它做自動重試。

  6. Key 從環境變數 `APIYI_API_KEY` 讀，用 `Authorization` 頭加 `Bearer` 字首傳，不要硬編碼進程式碼、也不要提交進 git。

  7. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                    | 擋掉的坑                                                                                                                            |
  | --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
  | 不寫死 `parts` 下標        | `parts` 段數和順序都不保證，寫死下標一定會間歇性失敗；本模型會返回思維過程文本，更容易把圖片擠到下標 1。詳見 [Nano Banana 開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide) |
  | 取最後一張圖片段              | 複雜編輯任務會返回多張中間稿，最後一張才是終稿                                                                                                         |
  | 顯式傳 `imageSize`       | 按量計費下解析度直接決定單價，靠預設值成本不可控                                                                                                        |
  | 模型名不帶 `-4k` 字尾        | 帶字尾的名字是給聊天客戶端用的，程式碼呼叫統一用通用名更穩定                                                                                                  |
  | 上傳前壓縮                 | 官方單圖上限 7MB，base64 後還會再膨脹約三分之一。壓縮標準見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)                      |
  | 對 `IMAGE_SAFETY` 自動重試 | 稽核攔截返回 200 但沒有圖，且不計費，原樣重試往往就過了。詳見 [Gemini 出圖錯誤處理](/zh-Hant/api-capabilities/gemini-image-error-handling)                        |
</Accordion>

## 為什麼選 API易 的 Nano Banana 2

**Nano Banana Pro / 2 是 API易 消耗量排名第一的影像模型**——穩定、可靠、速度快。如果你期望跟專業的團隊合作，那選 API易 就對了。

針對 Nano Banana 2 這種谷歌官方剛釋出、產能仍緊張的新模型，API易 在**穩定性**、**成本**、**接入體驗**三方面做了深度最佳化：

<CardGroup cols={2}>
  <Card title="官方通道 · 與 Gemini 一致" icon="shield-check">
    完全相容谷歌官方 Gemini API 格式（`/v1beta/models/.../generateContent`），同時支援 OpenAI SDK 模式，請求體、響應欄位、錯誤碼與官方一致，遷移零改造。
  </Card>

  <Card title="不限併發 · 企業可放量" icon="infinity">
    無谷歌 AI Studio 的 RPM/RPD 硬限制，企業批量出圖、高峰流量都能線性放大，避免被官方配額打斷。
  </Card>

  <Card title="官網 28-36% 價格" icon="percent">
    按次 \$0.055/張（官方 \$0.151）、按量 512px 低至 \$0.025/張（官方 \$0.045），疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 最低可達官方 30.3%。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，延遲穩定、免去出海改造。
  </Card>

  <Card title="模型生態齊全" icon="layers">
    同系列覆蓋 [Nano Banana Pro](/zh-Hant/api-capabilities/nano-banana-image/overview)（極致畫質）、Nano Banana 2（價效比）、Nano Banana 第一代（基礎版），按場景自由組合。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕影像生成場景，具備豐富的選型、調優與整合經驗，可為企業客戶提供從 PoC 到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="Pro 級畫質" icon="sparkles">
    生動光影、豐富紋理、銳利細節，畫質媲美 Nano Banana Pro，速度卻快得多
  </Card>

  <Card title="4K 超清輸出" icon="expand">
    支援 512px、1K、2K、4K 四檔解析度，最高 4096×4096
  </Card>

  <Card title="14 種寬高比" icon="maximize">
    新增 1:4、4:1、1:8、8:1，共支援 14 種寬高比，覆蓋更多場景
  </Card>

  <Card title="影像搜尋 Grounding" icon="search">
    Nano Banana 2 獨家功能，可從 Google 圖片搜尋拉取視覺上下文
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="精準文字渲染" icon="type">
    圖片內文字清晰可讀，支援多語言文本渲染，適合海報、營銷物料
  </Card>

  <Card title="多輪編輯對話" icon="message-circle">
    支援多輪對話式影像編輯，逐步精調畫面效果
  </Card>

  <Card title="思維模式" icon="brain">
    可配置 minimal 或 high 思維級別，處理複雜提示詞更精準
  </Card>

  <Card title="主體一致性" icon="users">
    最多保持 5 個角色的相貌一致性，14 個參考物體的高保真度
  </Card>
</CardGroup>

## 版本對比

| 特性             | **Nano Banana 2**                | Nano Banana Pro              | Nano Banana              |
| -------------- | -------------------------------- | ---------------------------- | ------------------------ |
| 模型 ID          | `gemini-3.1-flash-image-preview` | `gemini-3-pro-image-preview` | `gemini-2.5-flash-image` |
| 畫質             | ⭐⭐⭐⭐⭐ Pro 級                      | ⭐⭐⭐⭐⭐ 最高                     | ⭐⭐⭐⭐ 優秀                  |
| 速度             | 🚀 最快                            | 🐢 較慢                        | ⚡ 快速                     |
| 最高解析度          | 4K                               | 4K                           | 1K                       |
| 寬高比數量          | 14 種                             | 10 種                         | 10 種                     |
| 影像搜尋 Grounding | ✅ 獨家                             | ❌                            | ❌                        |
| API易定價         | **\$0.055/次（按次）**                | \$0.09/次                     | \$0.02/次                 |
| 狀態             | Preview                          | Preview                      | GA                       |

<Tip>
  **選擇建議**：

  * 🔥 **追求價效比** → Nano Banana 2（按量計費低至 \$0.025/張，Pro 級畫質 + Flash 級速度）
  * 🎨 **追求極致畫質** → Nano Banana Pro（\$0.09/次，最高保真度）
  * ⚡ **追求最低成本** → Nano Banana（\$0.02/次，快速穩定）
</Tip>

## 模型定價

<Info>
  **計費模式選擇**：Nano Banana 2 支援兩種計費方式，通過建立令牌時的「Billing model」設定選擇：

  * 選擇 **Pay-as-you-go**（按量計費）或 **Pay-as-you-go Priority**（按量優先）→ 按量計費
  * 選擇 **Pay-per-request**（按次計費）或 **Pay-per-request Priority**（按次優先）→ 按次計費（與 Nano Banana Pro 相同）
  * ⚠️ **請勿選擇 Hybrid billing（混合計費）**
</Info>

### 按次計費

| 模型                                                 | API易定價        | 谷歌官方 4K 定價     | 折扣             |
| -------------------------------------------------- | ------------- | -------------- | -------------- |
| **Nano Banana 2** `gemini-3.1-flash-image-preview` | **\$0.055/次** | \$0.151/次      | **🔥 約 3.6 折** |
| Nano Banana Pro `gemini-3-pro-image-preview`       | \$0.09/次      | \$0.151/次      | **約 6 折**      |
| Nano Banana `gemini-2.5-flash-image`               | \$0.020/次     | \$0.039/次（僅1K） | 約 5 折          |

<Info>
  Nano Banana Pro 另提供 `NanoBananaEnterprise` 企業 HA 通道（1.4 倍費率，即 \$0.126/次），適合對可用性有更高要求的場景。
</Info>

### 按量計費（Nano Banana 2 專屬）

| 計費專案            | Google 官方             | API易            | 官網折扣    |
| --------------- | --------------------- | --------------- | ------- |
| Input           | \$0.50/M tokens       | \$0.18/M tokens | **36%** |
| Output（圖片和文本統一） | 圖片 \$60/M, 文本 \$1.5/M | \$21.6/M tokens | **36%** |

### 按量計費價格預估

| 解析度   | Google 官方 | API易          | Fal AI |
| ----- | --------- | ------------- | ------ |
| 512px | \$0.045   | **\~\$0.025** | \$0.06 |
| 1K    | \$0.067   | **\~\$0.035** | \$0.08 |
| 2K    | \$0.101   | **\~\$0.045** | \$0.12 |
| 4K    | \$0.151   | **\~\$0.07**  | \$0.16 |

<Tip>
  **💰 按量計費更省錢！** 使用按量計費，512px 低至 \$0.025/張，僅為官方 36%！低解析度場景下比按次計費（\$0.055/次）更實惠。4K 場景按量計費約 \$0.07/張，仍遠低於谷歌官方 \$0.151/次。結合充值加贈活動，實際成本更低。
</Tip>

## 影響計費的三個引數

以下結論來自 2026-08-27 對生產閘道的實測（每個條件 12–20 次，全部以後臺實際扣費為準，非估算）。三個引數對賬單的影響差了兩個數量級，最佳化順序應該按下表來。

| 引數                             | 對單次賬單的影響                             | 值不值得調  |
| ------------------------------ | ------------------------------------ | ------ |
| `imageConfig.imageSize`        | 1K \$0.033 → 4K \$0.064，**+90%**     | ✅ 最大槓桿 |
| `thinkingConfig.thinkingLevel` | 預設 \$0.033 → `high` \$0.052，**+54%** | ✅ 按需開  |
| `responseModalities`           | −2.8%，統計上不顯著                         | ❌ 省不到錢 |

### thinkingLevel：預設就是 minimal，high 貴一半

`gemini-3.1-flash-image` 支援思考等級調節（Pro 不支援）。實測同一提示詞各 20 次：

| 設定        | 輸出 tokens 均值 | `thoughtsTokenCount` | 單次扣費         | 耗時中位  |
| --------- | ------------ | -------------------- | ------------ | ----- |
| 不傳（預設）    | 1548.7       | 不出現該欄位               | \$0.0335     | 13.3s |
| `minimal` | 1546.0       | 不出現該欄位               | \$0.0334     | 13.6s |
| `high`    | 1557.5       | 中位 784.5             | **\$0.0516** | 20.7s |

* **預設檔就等於 `minimal`**，兩者統計上不可區分（p=0.64），顯式傳 `minimal` 沒有任何收益。
* `high` 檔下 `thoughtsTokenCount` 才作為獨立欄位出現，並**計入 `completion_tokens` 一起按圖片價計費**。
* **只有開了 `high`，複雜提示詞才會燒更多 tokens**：預設檔下，3 tokens 的極簡提示詞與 98 tokens 的推理型提示詞，輸出 tokens 無顯著差異（p=0.37）；開了 `high` 之後，推理型提示詞的思考 tokens 比極簡提示詞多 **126%**，單次賬單貴 **38%**。

<Tip>
  日常出圖**不用動這個引數**。只有對構圖邏輯、畫面內文字排版、資料圖表比例準確性有硬要求時才開 `high`，代價是 +54% 費用和 +55% 耗時。
</Tip>

### Google 搜尋接地：能力可用，但按檢索次數另收費

需要即時資訊才能畫對的場景（天氣卡、行情圖、近期活動海報），可以掛 `googleSearch` 工具。實測 12/12 觸發接地。

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "畫一張東京今天天氣的卡片海報" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

**輸出 tokens 幾乎不受影響**（扣掉搜尋費後與無工具對照差 −2.1%，不顯著），成本全部來自檢索呼叫本身：**\$0.014/次**。

| 條件                 | 接地觸發  | 檢索次數中位 | 單次賬單              |
| ------------------ | ----- | ------ | ----------------- |
| 不掛工具               | 0/12  | 0      | \$0.036           |
| `googleSearch: {}` | 12/12 | 2      | **\$0.062（+73%）** |

<Warning>
  **檢索次數由模型自己決定，客戶無法預先控制**。實測一次出圖請求會自主發起 1–3 次檢索，所以開了這個工具後單次成本是 **\$0.050–\$0.078** 的區間，不是定值。做成本預估時按上限算。
</Warning>

### 圖片搜尋接地：Nano Banana 2 獨有，且不額外收費

`searchTypes.imageSearch` 讓模型從 Google 圖片搜尋拉取視覺參考，適合「用真實照片做拼貼」「照著實物畫」這類需求。

```json theme={null}
{
  "tools": [{ "googleSearch": { "searchTypes": { "imageSearch": {} } } }]
}
```

| 條件               | 接地觸發 | 計搜尋費     | 單次賬單        |
| ---------------- | ---- | -------- | ----------- |
| 不掛工具             | 0/12 | 0/12     | \$0.036     |
| `imageSearch` 單開 | 7/12 | **0/12** | **\$0.032** |

* 生效證據是 `groundingMetadata.imageSearchQueries` 出現，實測值形如 `["current weather in Tokyo"]`。
* **目前不額外收費**，單次賬單甚至略低於無工具對照。
* 12 次裡 7 次觸發——**是否檢索由模型自己判斷**，不是每次都查。
* 網頁搜尋和圖片搜尋**可以同時開**，但選用哪條由模型決定，費用也就跟著不確定。

<Warning>
  **`searchTypes` 必須寫成物件，不能寫成陣列。**

  ✅ `{"searchTypes": {"imageSearch": {}}}` — 生效

  ❌ `{"searchTypes": ["imageSearch"]}` — **不報錯、返回 200、圖也照出，但圖片搜尋一次都不會觸發**，只看返回體察覺不到。上游對陣列寫法的報錯是 `Proto field is not repeating, cannot start list`。
</Warning>

### responseModalities：省不到錢，但能去掉多餘文本

`responseModalities: ["IMAGE"]` 宣告只要圖片。實測各 20 次：

| 設定                 | 輸出 tokens 均值 | 單次扣費     |
| ------------------ | ------------ | -------- |
| 不傳（預設）             | 1548.7       | \$0.0335 |
| `["IMAGE"]`        | 1535.0       | \$0.0332 |
| `["TEXT","IMAGE"]` | 1542.8       | \$0.0333 |

* **三者差異都在 1% 以內**，`["TEXT","IMAGE"]` 與不傳完全等價（p=0.90）。
* 普通出圖提示詞下 **60/60 本來就只返回一個圖片 part、一個字文本都沒有**，所以模態開關無從體現。只有推理型提示詞（要求畫資訊圖、資料圖表）才有約 1/3 機率附一段總結文字，此時 `["IMAGE"]` 能把它抑制掉，省約 **2.8%**（p=0.09，不顯著）。

<Info>
  **為什麼省不下來**：輸出 tokens 的構成不是「圖片 + 文本」，而是 **圖片 1120 + 約 400 tokens 的不可見開銷**。後者不體現在 `candidatesTokensDetails` 的任何欄位裡，但**照價計費，佔單次賬單的 28%**，且不隨提示詞長度變化。文本那點量在它面前微不足道。

  所以按 1120 tokens 估算單張成本會**低估約 28%**，實際請按 `candidatesTokenCount` 或 `totalTokenCount` 對賬。
</Info>

## 分組介紹

Nano Banana 2 在 API易提供兩個分組，可在後臺「令牌設定」中切換：

| 分組                          | 倍率   | 適用場景                     |
| --------------------------- | ---- | ------------------------ |
| `Default` 預設分組              | 1.0x | 基礎通道，與定價表一致；預設推薦         |
| `NanoBananaEnterprise` 企業分組 | 1.4x | 兜底通道，預設緊張/超時高發時手動切換，穩定優先 |

**1.4x 倍率怎麼來的？** 1.4x 後仍約等於谷歌官方 5 折水平，遠低於官網原價。這是面向更高併發需求、應對意外風控時的兜底方案，為企業客戶提供高可用性保障。預設分組緊張時，把令牌切到 `NanoBananaEnterprise` 即可臨時過渡。

**令牌「計費模式」推薦**：選 `按量優先`（Pay-as-you-go Priority）—— 同時相容 Nano Banana 2 的按量計費 和 Nano Banana Pro 的按次計費，**一把令牌跑全系列**。

<Frame caption="令牌設定：計費模式選「按量優先」，主分組選 Default、兜底分組掛上 NanoBananaEnterprise（1.4x）">
  <img src="https://mintcdn.com/apiyillc/EyWjOyg5fLaMGReJ/images/nano-banana-enterprise-token-setup-20260506.png?fit=max&auto=format&n=EyWjOyg5fLaMGReJ&q=85&s=cf85cd8ddaaa541ebbd970a52a98c68f" alt="令牌建立介面：計費模式『按量優先』相容 NB2 按量 + NB Pro 按次；主分組 Default + 兜底分組 NanoBananaEnterprise（1.4x 兜底通道）" width="1270" height="1052" data-path="images/nano-banana-enterprise-token-setup-20260506.png" />
</Frame>

<Tip>
  **拓展玩法**：如果你的令牌還覆蓋其它影像模型（如 GPT-image-2），把更穩的 Default 分組放主位、`NanoBananaEnterprise` 放兜底位即可，主分組 429 會自動回退到企業分組繼續出圖，無需切換 token。
</Tip>

## 支援的解析度與寬高比

### 輸出解析度

| 解析度   | 說明   | 推薦場景       |
| ----- | ---- | ---------- |
| 512px | 低解析度 | 縮圖、快速預覽    |
| 1K    | 預設   | 社交媒體、網頁展示  |
| 2K    | 高畫質  | 高畫質顯示、列印材料 |
| 4K    | 超高畫質 | 專業設計、商業海報  |

### 支援的寬高比（14 種）

`1:1`、`1:4`、`4:1`、`1:8`、`8:1`、`2:3`、`3:2`、`3:4`、`4:3`、`4:5`、`5:4`、`9:16`、`16:9`、`21:9`

### 各寬高比的輸出尺寸（畫素）

下表為 Nano Banana 2 在 512px / 1K / 2K / 4K 四檔解析度下、14 種寬高比對應的實際輸出畫素尺寸（資料來源：谷歌官方文件）。在請求中通過 `aspect_ratio` 指定寬高比、`image_size`（或 `resolution`）指定解析度即可：

| 寬高比      | 512px    | 1K        | 2K        | 4K         |
| -------- | -------- | --------- | --------- | ---------- |
| **1:1**  | 512×512  | 1024×1024 | 2048×2048 | 4096×4096  |
| **1:4**  | 256×1024 | 512×2048  | 1024×4096 | 2048×8192  |
| **1:8**  | 192×1536 | 384×3072  | 768×6144  | 1536×12288 |
| **2:3**  | 424×632  | 848×1264  | 1696×2528 | 3392×5056  |
| **3:2**  | 632×424  | 1264×848  | 2528×1696 | 5056×3392  |
| **3:4**  | 448×600  | 896×1200  | 1792×2400 | 3584×4800  |
| **4:1**  | 1024×256 | 2048×512  | 4096×1024 | 8192×2048  |
| **4:3**  | 600×448  | 1200×896  | 2400×1792 | 4800×3584  |
| **4:5**  | 464×576  | 928×1152  | 1856×2304 | 3712×4608  |
| **5:4**  | 576×464  | 1152×928  | 2304×1856 | 4608×3712  |
| **8:1**  | 1536×192 | 3072×384  | 6144×768  | 12288×1536 |
| **9:16** | 384×688  | 768×1376  | 1536×2752 | 3072×5504  |
| **16:9** | 688×384  | 1376×768  | 2752×1536 | 5504×3072  |
| **21:9** | 792×168  | 1584×672  | 3168×1344 | 6336×2688  |

<Info>
  相比 Nano Banana Pro 的 10 種寬高比，Nano Banana 2 新增了 `1:4`、`4:1`、`1:8`、`8:1` 四種超長/超寬比例，適合長圖、資訊圖等特殊場景；並獨有 512px 低解析度檔位，適合縮圖與快速預覽。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="Nano Banana 2 和 Nano Banana Pro 有什麼區別？">
    **Nano Banana 2** (`gemini-3.1-flash-image-preview`) 基於 Gemini 3.1 Flash，**Nano Banana Pro** (`gemini-3-pro-image-preview`) 基於 Gemini 3 Pro。主要區別：

    * ✅ **速度**：Nano Banana 2 更快（Flash 級速度）
    * ✅ **價格**：Nano Banana 2 按量計費更便宜（低至 \$0.025 vs \$0.09）
    * ✅ **寬高比**：Nano Banana 2 支援 14 種（多 4 種）
    * ✅ **影像搜尋 Grounding**：Nano Banana 2 獨家
    * ⚠️ **極致畫質**：Nano Banana Pro 仍略優
  </Accordion>

  <Accordion title="我應該從 Nano Banana Pro 切換到 Nano Banana 2 嗎？">
    **推薦切換**！Nano Banana 2 以更低的價格提供了接近 Pro 級別的畫質，速度還更快。除非你對畫質有極致要求，否則 Nano Banana 2 是更好的選擇。

    只需將模型名稱從 `gemini-3-pro-image-preview` 改為 `gemini-3.1-flash-image-preview` 即可。
  </Accordion>

  <Accordion title="模型名該用 gemini-3.1-flash-image-preview 還是帶 -4k 字尾的版本？">
    **程式碼 / API 呼叫，建議統一用不帶 `-4k` 字尾的通用模型名 `gemini-3.1-flash-image-preview`，而不是 `gemini-3.1-flash-image-preview-4k`。**

    * **官方命名不帶 `-4k`**：谷歌官方的模型名就是 `gemini-3.1-flash-image-preview`。這也是我們投入最多資源持續維護的通用通道，穩定性和相容性最有保障。
    * **`-4k` 的由來**：`gemini-3.1-flash-image-preview-4k` 當初是為 Chatbox 等對話式客戶端的「對話出圖」場景準備的配置——在聊天介面裡直接對話生成圖片時使用。
    * **程式碼 + Gemini 原生格式更推薦通用名**：如果你是通過程式碼呼叫、走 Gemini 原生格式（`/v1beta/models/.../generateContent`），用常規模型名 `gemini-3.1-flash-image-preview` 會更穩定。

    需要 4K 解析度輸出時，無需依賴 `-4k` 模型名——直接在請求引數裡指定 4K 解析度即可（見上方「支援的解析度與寬高比」）。
  </Accordion>

  <Accordion title="什麼是影像搜尋 Grounding？">
    影像搜尋 Grounding 是 Nano Banana 2 的獨家功能。它可以從 Google 圖片搜尋拉取視覺上下文，生成更貼合現實世界的影像。例如，當你要求生成某個真實地標的圖片時，它能參考搜尋結果來提高準確性。
  </Accordion>

  <Accordion title="思維模式有什麼用？">
    思維模式（Thinking Mode）讓模型在生成影像前進行推理分析，對複雜提示詞的理解更準確。設定為 `high` 時效果最好，但會稍微增加生成時間。適合需要精確構圖、包含文字、或涉及複雜場景的生成任務。
  </Accordion>

  <Accordion title="生成一張圖片需要多長時間？">
    生成時間取決於解析度和是否啟用思維模式：

    * **1K 解析度**：約 5-10 秒
    * **2K 解析度**：約 10-15 秒
    * **4K 解析度**：約 15-25 秒
    * 啟用高階思維模式會額外增加幾秒

    建議設定較長的超時時間（至少 360 秒）以應對偶發延遲和高峰擁塞。
  </Accordion>

  <Accordion title="有併發限制嗎？API 是序列處理嗎？需要 20 個使用者同時呼叫怎麼辦？">
    **API 不限制併發，也不是序列處理。** 你可以放心地自行併發呼叫，請求之間不用排隊、不會互相阻塞——20 個使用者同時呼叫直接發起 20 個併發請求即可，無需額外申請配額或做限流。

    與谷歌 AI Studio 不同，API易 的通道沒有 RPM/RPD 硬限制，企業批量出圖、高峰流量都能線性放大。

    **真正要注意的是 `timeout` 超時時間**：影像生成（尤其 4K 或高峰擁塞時）單次耗時可能較長，**建議把客戶端超時設到 360 秒**，避免請求還在正常處理就被本地超時掐斷。

    <Tip>
      如果偶發 429（併發過高被限流），可把令牌的兜底分組掛上 `NanoBananaEnterprise`（見上方「分組介紹」），主分組打滿時自動回退，進一步提升高併發下的成功率。
    </Tip>
  </Accordion>

  <Accordion title="支援哪些輸入圖片格式？">
    支援 `image/png` 和 `image/jpeg` 格式。可以通過 base64 編碼或 Files API 上傳。
  </Accordion>

  <Accordion title="輸出圖片有水印嗎？">
    所有輸出圖片都帶有 SynthID 隱形數字水印（Google 的 AI 生成內容標識技術），肉眼不可見，不影響使用。
  </Accordion>

  <Accordion title="報錯 connection reset by peer / write_response_body_failed（500）是什麼原因？">
    完整報錯形如：

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    這種錯誤**往往是上傳的圖片體積過大，請求體超限把連線壓崩了**。請按以下最佳實踐處理：

    * **控制圖片張數**：保持在官方規則內（每個提示最多 14 張圖），不要堆圖。
    * **控制單圖體積**：每張圖儘量不要超過 5MB——官方單圖上限為 7MB，且 base64 編碼後體積還會膨脹約 1/3，原圖請留足餘量。
    * **前端先壓縮再上傳**：在前端（或服務端中轉層）壓縮後再提交給介面，常見做法是限制最長邊、轉 JPEG/WebP 並控制品質引數。
    * **改用 URL 傳圖**：Gemini 原生格式支援 `fileData.fileUri` 直接傳圖片 URL，可避開 base64 請求體過大的問題，詳見 [Nano Banana 開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide)。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Nano Banana Pro 圖片生成](/api-capabilities/nano-banana-image) - 上一代旗艦版
* [Nano Banana 圖片編輯](/api-capabilities/nano-banana-image-edit) - 圖片編輯功能
* [影像生成對比測試](https://imagen.apiyi.com/)
* [API 使用手冊](/zh-Hant/api-manual)

<Info>
  Nano Banana 2 目前處於 Preview 狀態，功能和定價可能會有調整。建議關注文件更新獲取最新資訊。
</Info>
