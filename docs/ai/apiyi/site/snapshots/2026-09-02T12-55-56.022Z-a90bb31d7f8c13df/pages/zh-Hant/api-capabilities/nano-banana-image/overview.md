> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 圖片生成

> 谷歌最新、最強的影像生成模型 gemini-3-pro-image-preview，俗稱 Nano Banana Pro。支援自定義解析度 1K、2K、4K 輸出、10種寬高比，低至官網 2 折優惠。

<Note>
  **🔥 最新發布**：谷歌於 2026年2月26日釋出了 **Nano Banana 2** (`gemini-3.1-flash-image-preview`)，Pro 級畫質 + Flash 級速度，按量低至 \$0.025/張！[檢視 Nano Banana 2 文件](/zh-Hant/api-capabilities/nano-banana-2-image/overview)
</Note>

<Note>
  **🆕 2026年5月29日更新（去掉 `-preview`）**：谷歌更新了官方文件，推出去掉 `-preview` 的正式模型名 **`gemini-3-pro-image`**，API易已同步上線支援。

  * **原模型名仍可用**：`gemini-3-pro-image-preview` 繼續正常呼叫，**價格不變**，現有程式碼無需改動。
  * **兩個名字都能跑**：可按需選用新名 `gemini-3-pro-image` 或原 `-preview` 名。

  話說在前面：正式版相比 preview 版在效果表現、安全稽核機制等方面是否存在差異，谷歌官方暫未明確說明，歡迎大家在實際使用中一起測試反饋。
</Note>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

**Nano Banana Pro**（代號）是谷歌影像生成模型系列，目前有以下版本可用：

### 最新版本

* **Nano Banana 2**：`gemini-3.1-flash-image-preview`（🔥 2026年2月26日上線）— [檢視詳情](/zh-Hant/api-capabilities/nano-banana-2-image/overview)
* **Nano Banana Pro**：`gemini-3-pro-image-preview`（2025年11月20日上線）

### 前代版本

* **正式版**：`gemini-2.5-flash-image`（穩定版，支援 10 種寬高比）
* **預覽版**：`gemini-2.5-flash-image-preview`（⚠️ 已於2025年10月30日下線）

<Card>
  **核心優勢**

  * 🔥 **Nano Banana Pro 新特性**：
    * 🎯 **4K 高畫質支援**：支援 1K、2K、4K 三種解析度，最高可達 4096×4096
    * 📝 **文本渲染之王**：影像中的文字清晰可讀，適合海報、廣告等場景
    * ✨ **局部編輯**：支援攝像機角度、焦點、色彩分級、場景照明調整
    * 🧠 **智慧推理**：基於 Gemini 3 Pro，更好地理解複雜提示詞

  * 🚀 **通用優勢**：
    * ⚡ **生成速度**：Nano Banana Pro 約 20 秒，前代版本約 10 秒
    * 💰 **價格實惠**：結合充值優惠，價效比極高
    * 🔄 **完全相容**：完全相容谷歌官方 Gemini API 格式
    * 🎨 **谷歌技術**：基於谷歌最新、最強的影像生成/編輯技術
</Card>

## 線上除錯 API

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/nano-banana-image/text-to-image">
    輸入文本提示詞生成圖片，帶互動式 Playground 線上除錯。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/nano-banana-image/image-edit">
    上傳圖片 + 編輯指令生成新圖片，帶互動式 Playground 線上除錯。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、`parts` 防禦式解析、上傳壓縮、解析度引數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Nano Banana Pro 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Nano Banana Pro（`gemini-3-pro-image`）的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/nano-banana-image/overview.md](https://docs.apiyi.com/api-capabilities/nano-banana-image/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：走 Gemini 原生格式 `POST https://api.apiyi.com/v1beta/models/gemini-3-pro-image:generateContent`。客戶端 timeout 按解析度分檔：1K / 2K 用 300 秒，**4K 用 600 秒兜底**。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬，任何一層小於生成時間都會掐斷請求。如果你用 Node，注意 undici 有三個獨立的超時設定，SDK 的 `timeout` 並不覆蓋它們。

  2. 返回解析（**最容易寫錯的一條**）：圖片是 base64，在 `candidates[0].content.parts[]` 裡的 `inlineData.data`。但 `parts` 是**異構陣列，段數和順序都不保證**——前面可能掛一個文本段，圖片就落到下標 1 而不是 0。所以**絕對不要寫死 `parts[0]` 或 `parts[1]`**，在兩者之間來回改是解決不了問題的。正確寫法：遍歷 `parts`、篩出所有含 `inlineData` 的段，取**最後一張**（複雜任務會返回多張中間稿，最後一張才是終稿）。`mimeType` 也從響應裡讀，不要寫死成 `image/png`。拿到後渲染展示並提供「儲存到本地」。

  3. 上傳壓縮：編輯時把參考圖 base64 塞進 `inlineData`。上傳前先壓縮——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；多圖時合計控制在 6MB 以內。官方硬限制是單圖 7MB、每次請求最多 14 張、單次上傳總量低於 100MB，而 base64 編碼後體積還會再膨脹約三分之一，所以單圖儘量壓到 5MB 以內留足餘量。某張圖壓縮失敗就回退用原圖繼續，不要因為壓縮失敗中斷整個請求。另外注意：**同一個 part 裡只能放 `text` 或 `inlineData` 其中一個**，不能兩個欄位並存，正確結構是 1 個文本段 + N 個圖片段。

  4. 解析度引數：顯式傳 `generationConfig.imageConfig.imageSize`（`1K` / `2K` / `4K`，預設 `1K`）和 `aspectRatio`（本頁列了 10 個合法比例），別靠預設值。前臺介面把解析度和比例都做成下拉。選了 4K 記得把 timeout 一起提到 600 秒。本模型**不支援** `thinkingConfig`，也不支援 Google 搜尋接地（`tools` 裡的 `google_search`），不要傳。

  5. 錯誤處理：內容稽核攔截時 HTTP 仍然是 200，但 `candidates[0].content.parts` 為空。判斷順序是先看 `candidatesTokenCount` 是否為 0，再看 `finishReason` 是否非 `STOP`。`IMAGE_SAFETY` 這類攔截**不計費**，原樣重試 1-2 次往往就成功了，建議在程式碼裡對它做自動重試。

  6. Key 從環境變數 `APIYI_API_KEY` 讀，用 `Authorization: Bearer` 頭傳，不要硬編碼進程式碼、也不要提交進 git。

  7. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                    | 擋掉的坑                                                                                                                         |
  | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
  | 不寫死 `parts` 下標        | `parts` 段數和順序都不保證，寫死下標一定會間歇性失敗，且在下標 0 和 1 之間來回改解決不了問題。詳見 [Nano Banana 開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide) |
  | 取最後一張圖片段              | 複雜編輯任務會返回多張中間稿，最後一張才是終稿                                                                                                      |
  | 超時按解析度分檔              | 4K 按 300 秒配會誤超時，而**斷連的請求照常計費**。詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)                     |
  | 上傳前壓縮                 | 官方單圖上限 7MB，base64 後還會再膨脹約三分之一，直傳手機原圖容易觸發 500。壓縮標準見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)    |
  | 對 `IMAGE_SAFETY` 自動重試 | 稽核攔截返回 200 但沒有圖，且不計費，原樣重試往往就過了。詳見 [Gemini 出圖錯誤處理](/zh-Hant/api-capabilities/gemini-image-error-handling)                     |
</Accordion>

## 為什麼選 API易 的 Nano Banana Pro

**Nano Banana Pro / 2 是 API易 消耗量排名第一的影像模型**——穩定、可靠、速度快。如果你期望跟專業的團隊合作，那選 API易 就對了。

針對 Nano Banana Pro 這種谷歌最新旗艦、內容安全管控嚴格的模型，API易 在**穩定性**、**成本**、**接入體驗**三方面做了深度最佳化：

<CardGroup cols={2}>
  <Card title="官方通道 · 與 Gemini 一致" icon="shield-check">
    完全相容谷歌官方 Gemini API 格式（`/v1beta/models/.../generateContent`），同時支援 OpenAI SDK 模式，請求體、響應欄位、錯誤碼與官方一致，遷移零改造。
  </Card>

  <Card title="不限併發 · 企業可放量" icon="infinity">
    無谷歌 AI Studio 的 RPM/RPD 硬限制，企業批量出圖、高峰流量都能線性放大，避免被官方配額打斷。
  </Card>

  <Card title="官網 31-38% 價格" icon="percent">
    按次 \$0.09/張（官方 4K \$0.24），疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 最低可達官方 31.25%——4K 場景最多省 68.75%。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，延遲穩定、免去出海改造。
  </Card>

  <Card title="模型生態齊全" icon="layers">
    同系列覆蓋 [Nano Banana 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)（價效比 + Flash 速度）、Nano Banana Pro（極致畫質）、Nano Banana 第一代（基礎版），按場景自由組合。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕影像生成場景，具備豐富的選型、調優與整合經驗，可為企業客戶提供從 PoC 到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 呼叫方式

使用谷歌原生 Gemini API 格式呼叫：

```
POST /v1beta/models/gemini-3-pro-image-preview:generateContent
```

<Tip>
  * ✅ 支援 4K 高畫質解析度（1K / 2K / 4K）
  * ✅ 10 種寬高比自由選擇
  * ✅ 業界最佳文字渲染
  * ✅ 支援高階局部編輯
  * 📖 完全相容谷歌官方 API 格式，參考 `ai.google.dev/gemini-api/docs/image-generation`
</Tip>

### 不支援的功能

<Warning>
  以下谷歌官方功能在 API易 中**不支援**，需要單獨計費：

  * **Grounding with Google Search**（谷歌搜尋增強）：通過 `tools: [{"google_search": {}}]` 呼叫
  * **thinkingConfig**（思維模式）：僅 Nano Banana 2 支援，Nano Banana Pro 不支援
  * **Image Search Grounding**（圖片搜尋增強）：僅 Nano Banana 2 獨有

  其他圖片生成和編輯能力均正常支援。
</Warning>

## 價格對比

| 模型                          | 定價                | 優勢               |
| --------------------------- | ----------------- | ---------------- |
| **Nano Banana Pro** (4K)    | \$0.09/張（約¥0.52）  | 🔥 4K 支援，約官方 38% |
| **Nano Banana Pro** (1K-2K) | \$0.09/張（約¥0.52）  | 🔥 高清出圖，約官方 67%  |
| **Nano Banana**             | \$0.025/張（約¥0.15） | ⭐ 快速生成，官方 52%    |
| gpt-image-1                 | 較高                | -                |
| flux-kontext-pro            | \$0.035/張         | 持平               |

<Tip>
  **價效比推薦**：

  * **Nano Banana Pro**：4K 支援，文字渲染最強，定價約官方 38-67%
  * **NanoBananaEnterprise**：企業 HA 通道 1.4 倍率（\$0.126/張），適合高可用需求
  * **Nano Banana**：快速生成（約10秒），官方 52% 價格，適合常規高品質影像生成
</Tip>

## 分組介紹

Nano Banana Pro 在 API易提供兩個分組，可在後臺「令牌設定」中切換：

| 分組                          | 倍率   | 適用場景                                  |
| --------------------------- | ---- | ------------------------------------- |
| `Default` 預設分組              | 1.0x | 基礎通道，按次 \$0.09/張；預設推薦                 |
| `NanoBananaEnterprise` 企業分組 | 1.4x | 兜底通道，按次 \$0.126/張，預設緊張/超時高發時手動切換，穩定優先 |

**1.4x 倍率怎麼來的？** 1.4x 後仍約等於谷歌官方 5 折水平，遠低於官網原價。這是面向更高併發需求、應對意外風控時的兜底方案，為企業客戶提供高可用性保障。預設分組緊張時，把令牌切到 `NanoBananaEnterprise` 即可臨時過渡。

**令牌「計費模式」推薦**：選 `按量優先`（Pay-as-you-go Priority）—— 同時相容 Nano Banana Pro 的按次計費 和 Nano Banana 2 的按量計費，**一把令牌跑全系列**。

<Frame caption="令牌設定：計費模式選「按量優先」，主分組選 Default、兜底分組掛上 NanoBananaEnterprise（1.4x）">
  <img src="https://mintcdn.com/apiyillc/EyWjOyg5fLaMGReJ/images/nano-banana-enterprise-token-setup-20260506.png?fit=max&auto=format&n=EyWjOyg5fLaMGReJ&q=85&s=cf85cd8ddaaa541ebbd970a52a98c68f" alt="令牌建立介面：計費模式『按量優先』相容 NB Pro 按次 + NB2 按量；主分組 Default + 兜底分組 NanoBananaEnterprise（1.4x 兜底通道）" width="1270" height="1052" data-path="images/nano-banana-enterprise-token-setup-20260506.png" />
</Frame>

<Tip>
  **拓展玩法**：如果你的令牌還覆蓋其它影像模型（如 GPT-image-2），把更穩的 Default 分組放主位、`NanoBananaEnterprise` 放兜底位即可，主分組 429 會自動回退到企業分組繼續出圖，無需切換 token。
</Tip>

## 相容性說明

如果你之前使用過以下模型，可以直接替換模型名稱：

### 升級到最新版本

* 任何舊版本 → `gemini-3-pro-image-preview`（🔥 推薦，Nano Banana Pro）
  * 支援 4K 高清出圖
  * 文本渲染能力最強
  * 局部編輯功能

### 使用穩定版本

* `gpt-4o-image` → `gemini-2.5-flash-image`
* `sora_image` → `gemini-2.5-flash-image`
* 舊版 Nano Banana → `gemini-2.5-flash-image`

其他引數保持不變，即可無縫切換使用。

## 支援的解析度與寬高比

### 輸出解析度

Nano Banana Pro 支援 1K、2K、4K 三檔解析度（不含 Nano Banana 2 獨有的 512px）：

| 解析度 | 說明   | 推薦場景       |
| --- | ---- | ---------- |
| 1K  | 預設   | 社交媒體、網頁展示  |
| 2K  | 高畫質  | 高畫質顯示、列印材料 |
| 4K  | 超高畫質 | 專業設計、商業海報  |

### 各寬高比的輸出尺寸（畫素）

下表為 Nano Banana Pro 在 1K / 2K / 4K 三檔解析度下、10 種寬高比對應的實際輸出畫素尺寸（資料來源：谷歌官方文件）。在請求中通過 `aspect_ratio` 指定寬高比、`image_size`（或 `resolution`）指定解析度即可：

| 寬高比      | 1K        | 2K        | 4K        |
| -------- | --------- | --------- | --------- |
| **1:1**  | 1024×1024 | 2048×2048 | 4096×4096 |
| **2:3**  | 848×1264  | 1696×2528 | 3392×5056 |
| **3:2**  | 1264×848  | 2528×1696 | 5056×3392 |
| **3:4**  | 896×1200  | 1792×2400 | 3584×4800 |
| **4:3**  | 1200×896  | 2400×1792 | 4800×3584 |
| **4:5**  | 928×1152  | 1856×2304 | 3712×4608 |
| **5:4**  | 1152×928  | 2304×1856 | 4608×3712 |
| **9:16** | 768×1376  | 1536×2752 | 3072×5504 |
| **16:9** | 1376×768  | 2752×1536 | 5504×3072 |
| **21:9** | 1584×672  | 3168×1344 | 6336×2688 |

<Info>
  需要 `1:4`、`4:1`、`1:8`、`8:1` 這類超長/超寬比例，或 512px 低解析度檔位時，請使用 [Nano Banana 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)（支援 14 種寬高比 + 512px）。
</Info>

## API 錯誤處理指南

Nano Banana Pro 有嚴格的內容安全管控，可能在多個層級拒絕不合規請求。

<CardGroup cols={3}>
  <Card title="candidatesTokenCount" icon="shield-check">
    **最高優先順序**

    值為 0 時，內容在稽核階段被拒絕，未生成任何候選內容。
  </Card>

  <Card title="finishReason" icon="flag">
    **次要優先順序**

    值非 `STOP`（如 `PROHIBITED_CONTENT`、`SAFETY`）時，表示生成過程中被拒絕。
  </Card>

  <Card title="API 文本響應" icon="message-square">
    **拒絕說明**

    API 返回拒絕說明文本而非圖片資料時，應將這些說明展示給使用者。
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="應該選擇 Nano Banana 2 還是 Pro？">
    **追求價效比**推薦 **Nano Banana 2** (`gemini-3.1-flash-image-preview`)：

    * Pro 級畫質 + Flash 級速度
    * 按量計費低至 \$0.025/張
    * 支援 14 種寬高比（比 Pro 多 4 種）
    * 獨有：思維模式、圖片搜尋 Grounding

    **追求極致畫質**選 **Nano Banana Pro** (`gemini-3-pro-image-preview`)：

    * 最高保真度
    * 定價 \$0.09/次

    詳情參考 [Nano Banana 2 文件](/zh-Hant/api-capabilities/nano-banana-2-image/overview)。
  </Accordion>

  <Accordion title="應該選擇 Pro 版本還是前代版本？">
    **新專案推薦：Nano Banana Pro** (`gemini-3-pro-image-preview`)

    ✅ **Pro 版優勢**：

    * 支援 4K 超高畫質解析度
    * 業界最佳文本渲染品質
    * 高階局部編輯功能
    * 定價僅約官方 38-67%

    ⚡ **前代版本** (`gemini-2.5-flash-image`) 適合：

    * 預算敏感場景（約\$0.025/張 vs \$0.09/張）
    * 需要快速生成（10s vs 20s）
    * 現有專案遷移
  </Accordion>

  <Accordion title="如何從其他影像模型切換到 Nano Banana？">
    只需將模型名稱從 `gpt-4o-image` 或 `sora_image` 更改為 `gemini-3-pro-image-preview`（推薦 Pro）或 `gemini-2.5-flash-image`（前代），其他引數保持不變。
  </Accordion>

  <Accordion title="生成的圖片是什麼格式？">
    模型返回 base64 編碼的圖片資料，通常為 PNG 或 JPEG 格式。程式碼會自動檢測格式並儲存為對應的檔案型別。
  </Accordion>

  <Accordion title="支援圖片編輯功能嗎？">
    是的，Nano Banana Pro 支援圖片生成和圖片編輯。請檢視 [圖片編輯 API 參考](/zh-Hant/api-capabilities/nano-banana-image/image-edit)。
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

* [Nano Banana 2 圖片生成](/zh-Hant/api-capabilities/nano-banana-2-image/overview)
* [Nano Banana 定價說明](/zh-Hant/api-capabilities/nano-banana-pricing)
* [其他影像生成模型](/api-capabilities/gpt-image-1)
* [API 使用手冊](/zh-Hant/api-manual)
