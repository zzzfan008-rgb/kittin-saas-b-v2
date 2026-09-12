> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite 生圖/編輯

> 谷歌最快最省的影像模型 Nano Banana 2 Lite (gemini-3.1-flash-lite-image)，約 4 秒出圖、比 Nano Banana 2 快約 2.7 倍，專注 1K 畫布 + 14 種寬高比。API易按量計費實測約 $0.018/次（官網 4 折費率），按次 $0.025/次。

## 概述

**Nano Banana 2 Lite**（本站欄目簡稱 **Nano Banana Lite**）是谷歌於 2026 年 6 月 30 日釋出的影像模型，模型 ID 為 `gemini-3.1-flash-lite-image`。它是 Nano Banana 2（`gemini-3.1-flash-image`）的**輕量經濟版**，把重心放在**速度與成本**上：約 4 秒即可出圖，比 Nano Banana 2 快約 **2.7 倍**，是 Nano Banana 系列裡**最快、最省**的一檔。

<Note>
  **🍌 2026年6月30日釋出**：Nano Banana 2 Lite 上線！約 4 秒出圖、比 Nano Banana 2 快約 2.7 倍，專注 1K 畫布 + 14 種寬高比，自帶 SynthID 隱形水印。API易 已第一時間接入，**按量計費實測約 \$0.018/次**（官網 4 折費率）、按次 \$0.025/次，主打高併發、低成本、快速迭代。
</Note>

<Warning>
  **價格暫定**：模型剛上線，當前售價為暫定價，後續可能調整最終售價。如有變動我們會另行公告，請以平臺即時價格為準。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/nano-banana-lite-image/text-to-image">
    輸入文本提示詞生成圖片，帶互動式 Playground 線上除錯。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/nano-banana-lite-image/image-edit">
    上傳圖片 + 編輯指令生成新圖片，帶互動式 Playground 線上除錯。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、`parts` 防禦式解析、上傳壓縮、以及 Lite 只支援 1K 這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Nano Banana Lite 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Nano Banana Lite（`gemini-3.1-flash-lite-image`）的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/nano-banana-lite-image/overview.md](https://docs.apiyi.com/api-capabilities/nano-banana-lite-image/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：走 Gemini 原生格式 `POST https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent`，客戶端 timeout 設到 300 秒。本模型常規出圖只要 4 秒左右，300 秒是給高峰擁塞留的餘量，**不要因為它快就把超時壓到幾十秒**。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬。

  2. 返回解析（**最容易寫錯的一條**）：圖片是 base64，在 `candidates[0].content.parts[]` 裡的 `inlineData.data`。但 `parts` 是**異構陣列，段數和順序都不保證**——前面可能掛一個文本段，圖片就落到下標 1 而不是 0。所以**絕對不要寫死 `parts[0]` 或 `parts[1]`**，在兩者之間來回改是解決不了問題的。正確寫法：遍歷 `parts`、篩出所有含 `inlineData` 的段，取**最後一張**。`mimeType` 也從響應裡讀，不要寫死成 `image/png`。拿到後渲染展示並提供「儲存到本地」。

  3. 上傳壓縮：編輯時把參考圖 base64 塞進 `inlineData`（支援 `image/png` 和 `image/jpeg`）。上傳前先壓縮——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；多圖時合計控制在 6MB 以內。base64 編碼後體積還會再膨脹約三分之一，別直傳手機原圖。某張圖壓縮失敗就回退用原圖繼續，不要因為壓縮失敗中斷整個請求。另外注意：**同一個 part 裡只能放 `text` 或 `inlineData` 其中一個**，不能兩個欄位並存，正確結構是 1 個文本段 + N 個圖片段。

  4. 解析度引數：`generationConfig.imageConfig.imageSize` 在 Lite 上**只接受 `1K`**，傳 `2K` 或 `4K` 會報錯——如果你從 Nano Banana 2 的程式碼改過來，務必把這兩個值刪掉。`aspectRatio` 支援本頁列出的 14 個比例，顯式傳、別靠預設值。前臺介面只需要暴露比例下拉，不要給解析度選項。

  5. 錯誤處理：內容稽核攔截時 HTTP 仍然是 200，但 `candidates[0].content.parts` 為空。判斷順序是先看 `candidatesTokenCount` 是否為 0，再看 `finishReason` 是否非 `STOP`。`IMAGE_SAFETY` 這類攔截**不計費**，原樣重試 1-2 次往往就成功了，建議在程式碼裡對它做自動重試。

  6. Key 從環境變數 `APIYI_API_KEY` 讀，用 `Authorization` 頭加 `Bearer` 字首傳，不要硬編碼進程式碼、也不要提交進 git。

  7. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                    | 擋掉的坑                                                                                                                    |
  | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
  | `imageSize` 只傳 `1K`   | Lite 只有 1K 一檔，從 Nano Banana 2 遷過來忘了刪 `2K` / `4K` 會直接報錯                                                                  |
  | 不寫死 `parts` 下標        | `parts` 段數和順序都不保證，寫死下標一定會間歇性失敗。詳見 [Nano Banana 開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide)                   |
  | 超時仍設 300 秒            | 常規 4 秒出圖容易讓人把超時壓得很小，高峰擁塞時就會誤超時，而**斷連的請求照常計費**。詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) |
  | 上傳前壓縮                 | base64 編碼後體積再膨脹約三分之一，直傳手機原圖會拖慢請求。壓縮標準見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)           |
  | 對 `IMAGE_SAFETY` 自動重試 | 稽核攔截返回 200 但沒有圖，且不計費，原樣重試往往就過了。詳見 [Gemini 出圖錯誤處理](/zh-Hant/api-capabilities/gemini-image-error-handling)                |
</Accordion>

## 為什麼選 API易 的 Nano Banana Lite

**Nano Banana Pro / 2 是 API易 消耗量排名第一的影像模型**——穩定、可靠、速度快。Lite 版把「快」和「省」做到新高度，適合走量場景。API易 在**穩定性**、**成本**、**接入體驗**三方面做了深度最佳化：

<CardGroup cols={2}>
  <Card title="官方通道 · 與 Gemini 一致" icon="shield-check">
    完全相容谷歌官方 Gemini API 格式（`/v1beta/models/.../generateContent`），同時支援 OpenAI SDK 模式，請求體、響應欄位、錯誤碼與官方一致，遷移零改造。
  </Card>

  <Card title="不限併發 · 企業可放量" icon="infinity">
    無谷歌 AI Studio 的 RPM/RPD 硬限制，企業批量出圖、高峰流量都能線性放大，避免被官方配額打斷。
  </Card>

  <Card title="按量實測約 \$0.018/次" icon="percent">
    **按量計費實測約 \$0.018/次**（官網 4 折費率：提示 \$0.10 / 輸出 \$12 每 1M tokens），比按次 \$0.025/次（官方約 \$0.034/張）更省；疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 實際成本更低。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，延遲穩定、免去出海改造。
  </Card>

  <Card title="模型生態齊全" icon="layers">
    同系列覆蓋 [Nano Banana Pro](/zh-Hant/api-capabilities/nano-banana-image/overview)（極致畫質）、[Nano Banana 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)（畫質速度兼顧）、Nano Banana 2 Lite（最快最省），按場景自由組合。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕影像生成場景，具備豐富的選型、調優與整合經驗，可為企業客戶提供從 PoC 到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="約 4 秒出圖" icon="gauge">
    約 4 秒生成一張，較 Nano Banana 2 快約 2.7 倍，主打高併發、快速迭代
  </Card>

  <Card title="低成本" icon="hand-coins">
    按量計費實測約 \$0.018/次（官網 4 折費率），比按次 \$0.025 更省，單張成本敏感場景理想選擇
  </Card>

  <Card title="14 種寬高比" icon="maximize">
    覆蓋 `1:1`、`4:1`、`1:4`、`16:9`、`9:16` 等 14 種寬高比，適配多種版式
  </Card>

  <Card title="SynthID 水印" icon="shield-check">
    輸出自帶 SynthID 隱形數字水印，肉眼不可見，不影響使用
  </Card>
</CardGroup>

## 版本對比

| 特性     | **Nano Banana 2 Lite**        | Nano Banana 2            | Nano Banana Pro      |
| ------ | ----------------------------- | ------------------------ | -------------------- |
| 模型 ID  | `gemini-3.1-flash-lite-image` | `gemini-3.1-flash-image` | `gemini-3-pro-image` |
| 定位     | 最快 / 最省                       | 畫質速度兼顧                   | 畫質上限                 |
| 畫質     | ⭐⭐⭐⭐ 優秀                       | ⭐⭐⭐⭐⭐ Pro 級              | ⭐⭐⭐⭐⭐ 最高             |
| 出圖速度   | 🚀 約 4 秒                      | ⚡ 較快                     | 🐢 較慢                |
| 最高解析度  | 1K                            | 4K                       | 4K                   |
| 寬高比數量  | 14 種                          | 14 種                     | 10 種                 |
| API易定價 | **\$0.025/次**                 | \$0.055/次                | \$0.09/次             |

<Tip>
  **選型速記**：

  * ⚡ **追求極致價效比 / 快速批量出圖** → Nano Banana 2 Lite（約 4 秒出圖，按次 \$0.025）
  * 🔥 **需要 2K/4K 高畫質或更強畫質** → Nano Banana 2（Pro 級畫質 + Flash 級速度）
  * 🎨 **追求極致畫質** → Nano Banana Pro（最高保真度）
</Tip>

## 模型定價

<Info>
  **計費模式選擇**：Nano Banana 2 Lite 支援兩種計費方式，通過建立令牌時的「Billing model」設定選擇：

  * 選擇 **Pay-as-you-go**（按量計費）或 **Pay-as-you-go Priority**（按量優先）→ 按量計費
  * 選擇 **Pay-per-request**（按次計費）或 **Pay-per-request Priority**（按次優先）→ 按次計費
  * ⚠️ **請勿選擇 Hybrid billing（混合計費）**
</Info>

### 按量計費（推薦 · 官網 4 折）

| 計費專案   | 谷歌官方             | API易                 | 官網折扣       |
| ------ | ---------------- | -------------------- | ---------- |
| 提示（輸入） | \$0.25/M tokens  | **\$0.10/M tokens**  | **官網 4 折** |
| 補全（輸出） | \$30.00/M tokens | **\$12.00/M tokens** | **官網 4 折** |

<Info>
  **實測單價可預期**：按量（按 tokens）計費下，1K 出圖**實測平均約 \$0.018/次**（常見區間約 \$0.016–\$0.019，輸出 token 決定單價）。比按次固定價 \$0.025/次更省，且單價穩定、可預期。
</Info>

### 按次計費

| 模型                                                   | API易定價        | 谷歌官方        | 說明               |
| ---------------------------------------------------- | ------------- | ----------- | ---------------- |
| **Nano Banana 2 Lite** `gemini-3.1-flash-lite-image` | **\$0.025/次** | 約 \$0.034/張 | 固定單價，後續可能下調、暫時不動 |

<Tip>
  **💰 計費模式怎麼選：首選「按量優先」**。按量（按 tokens）計費實測約 \$0.018/次，比按次 \$0.025/次更省、單價可預期；且令牌計費模式選 `按量優先`（Pay-as-you-go Priority）時，**同一把令牌還相容 Nano Banana Pro / 2 的按次計費**，一把跑全系列。按次 \$0.025/次為固定單價，後續**可能下調、暫時不動**，以平臺即時價為準。結合充值加贈活動，實際成本更低。
</Tip>

<Warning>
  模型剛上線，當前價格為暫定價，後續可能調整最終售價（按次 \$0.025/次後續可能下調）。如有變動我們會另行公告，請以平臺即時價格為準。
</Warning>

## 分組介紹

Nano Banana 2 Lite 走 API易 預設通道即可呼叫，無需專屬分組：

| 分組             | 倍率   | 適用場景             |
| -------------- | ---- | ---------------- |
| `Default` 預設分組 | 1.0x | 基礎通道，與定價表一致；預設推薦 |

**令牌「計費模式」推薦：預設選 `按量優先`（Pay-as-you-go Priority）**。原因有三：① 按量（按 tokens）計費實測約 \$0.018/次，比按次 \$0.025/次更省；② 單價穩定、可預期；③ 同一把令牌**同時相容 Lite / Nano Banana 2 的按量計費與 Nano Banana Pro 的按次計費**，一把跑全系列。

## 支援的解析度與寬高比

### 輸出解析度

| 解析度 | 說明              | 推薦場景              |
| --- | --------------- | ----------------- |
| 1K  | 唯一檔位（不支援 2K/4K） | 社交配圖、縮圖、草稿預覽、網頁展示 |

<Info>
  Nano Banana 2 Lite 專注 **1K 畫布**，不支援 2K/4K。需要更高解析度或更強畫質時，切換到 [Nano Banana 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)（最高 4K）或 [Nano Banana Pro](/zh-Hant/api-capabilities/nano-banana-image/overview)。
</Info>

### 支援的寬高比（14 種）

`1:1`、`1:4`、`4:1`、`1:8`、`8:1`、`2:3`、`3:2`、`3:4`、`4:3`、`4:5`、`5:4`、`9:16`、`16:9`、`21:9`

### 各寬高比的輸出尺寸（1K，畫素）

在請求中通過 `aspectRatio` 指定寬高比、`imageSize` 固定為 `1K`：

| 寬高比      | 1K 輸出尺寸   |
| -------- | --------- |
| **1:1**  | 1024×1024 |
| **1:4**  | 512×2048  |
| **1:8**  | 384×3072  |
| **2:3**  | 848×1264  |
| **3:2**  | 1264×848  |
| **3:4**  | 896×1200  |
| **4:1**  | 2048×512  |
| **4:3**  | 1200×896  |
| **4:5**  | 928×1152  |
| **5:4**  | 1152×928  |
| **8:1**  | 3072×384  |
| **9:16** | 768×1376  |
| **16:9** | 1376×768  |
| **21:9** | 1584×672  |

## 常見問題

<AccordionGroup>
  <Accordion title="Nano Banana 2 Lite 和 Nano Banana 2 有什麼區別？">
    兩者都基於谷歌 Gemini 3.1 Flash 系列，**Lite** 是**輕量經濟版**：

    * ✅ **速度**：Lite 約 4 秒出圖，比 Nano Banana 2 快約 2.7 倍
    * ✅ **價格**：Lite 按量實測約 \$0.018/次（官網 4 折費率）、按次 \$0.025/次，更適合走量
    * ⚠️ **解析度**：Lite 僅支援 1K；Nano Banana 2 最高 4K
    * ⚠️ **畫質上限**：追求極致畫質時 Nano Banana 2 / Pro 更優

    從 Nano Banana 2 遷移只需改模型名（注意 Lite 僅 1K）：把 `gemini-3.1-flash-image` 換成 `gemini-3.1-flash-lite-image` 即可。
  </Accordion>

  <Accordion title="我應該選 Lite 還是 Nano Banana 2？">
    * **追求極致價效比 / 快速批量出圖 / 1K 夠用** → 選 **Lite**（約 4 秒、按次 \$0.025）
    * **需要 2K/4K 高畫質、或對畫質有更高要求** → 選 **Nano Banana 2**（最高 4K，Pro 級畫質）

    兩者程式碼完全一致，只差模型名，隨時可切換測試。
  </Accordion>

  <Accordion title="生成一張圖片需要多長時間？">
    Nano Banana 2 Lite 主打速度，**1K 解析度約 4 秒**出圖。建議仍把客戶端超時設到較長（如 300 秒），以應對偶發延遲和高峰擁塞。
  </Accordion>

  <Accordion title="有併發限制嗎？">
    **API 不限制併發，也不是序列處理。** 你可以放心地自行併發呼叫，請求之間不用排隊、不會互相阻塞。與谷歌 AI Studio 不同，API易 的通道沒有 RPM/RPD 硬限制，企業批量出圖、高峰流量都能線性放大。

    真正要注意的是 `timeout` 超時時間——雖然 Lite 出圖快，但高峰擁塞時單次仍可能變慢，建議把客戶端超時設到 300 秒。
  </Accordion>

  <Accordion title="支援哪些輸入圖片格式？">
    圖片編輯時支援 `image/png` 和 `image/jpeg` 格式，可通過 base64 編碼上傳。詳見 [圖片編輯 API 參考](/zh-Hant/api-capabilities/nano-banana-lite-image/image-edit)。
  </Accordion>

  <Accordion title="輸出圖片有水印嗎？">
    所有輸出圖片都帶有 SynthID 隱形數字水印（Google 的 AI 生成內容標識技術），肉眼不可見，不影響使用。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Nano Banana 2 圖片生成](/zh-Hant/api-capabilities/nano-banana-2-image/overview) - 畫質速度兼顧版，最高 4K
* [Nano Banana Pro 圖片生成](/zh-Hant/api-capabilities/nano-banana-image/overview) - 極致畫質旗艦版
* [影像生成對比測試](https://imagen.apiyi.com/)
* [API 使用手冊](/zh-Hant/api-manual)

<Info>
  Nano Banana 2 Lite 剛上線，功能和定價可能會有調整。建議關注文件更新獲取最新資訊。
</Info>
