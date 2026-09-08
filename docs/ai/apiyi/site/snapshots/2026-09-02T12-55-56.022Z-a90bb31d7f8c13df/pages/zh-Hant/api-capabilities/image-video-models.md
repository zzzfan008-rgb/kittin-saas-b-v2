> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 影像與影片生成模型

> 檢視支援的影像生成和影片生成 AI 模型，包括定價和使用說明。

API易 支援多種影像和影片生成模型，本頁面提供詳細的模型資訊、定價和使用說明。

<Tip>
  檢視文本和多模態模型請訪問 [當下熱門模型](/zh-Hant/api-capabilities/model-info)。
</Tip>

## 🎨 影像生成模型

| 模型名稱                                                                                 | 狀態           | 特點                                                                          | 解析度/規格                              | 價格                          |
| ------------------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------- | ----------------------------------- | --------------------------- |
| [**Nano Banana Pro**](/api-capabilities/nano-banana-image-edit) 🔥                   | 熱賣中，本站最強     | 知識理解、中文字支援好、精準編輯                                                            | 1K/2K/4K，支援原比例改圖                    | \$0.09/張                    |
| [**Nano Banana 2**](/api-capabilities/nano-banana-2-image) 🔥                        | 熱賣中，快速       | 同 Pro，支援按量計費                                                                | 0.5K-4K，新增 1:8 和 8:1（可製作長圖）         | \$0.055/張（按量 \$0.025-0.07）  |
| [**Nano Banana Lite**](/zh-Hant/api-capabilities/nano-banana-lite-image/overview) 🆕 | 新上線，最快最省     | 谷歌最快最省、約 4s 出圖、比 NB2 快約 2.7 倍、專注 1K                                         | 1K，14 種寬高比                          | \$0.025/張（按量約 \$0.018）      |
| [**gpt-image-2**](/zh-Hant/api-capabilities/gpt-image-2/overview) 🆕                 | 新上線，官轉       | OpenAI 旗艦官轉、size/quality 精確控、參考圖自動高保真、支援 mask 局部重繪                          | 1K/2K/**4K**（任意合法尺寸）                | 按 token 計費，預設原價，充值活動 85 折左右 |
| [**gpt-image-2-all**](/zh-Hant/api-capabilities/gpt-image-2-all/overview) 🔥         | 熱賣中，官逆       | GPT 官逆 ChatGPT 網頁線、文字還原好、中文原生、約 30–60s 出圖較快、尺寸寫進 prompt                     | 1K-2K（prompt 控制）                    | \$0.03/張（按次）                |
| [**gpt-image-2-vip**](/zh-Hant/api-capabilities/gpt-image-2-vip/overview) 🆕         | 新上線，官逆       | GPT 官逆 Codex 線、呼叫同 -all、`size` 欄位鎖尺寸、30 檔常見 size 含 **4K**、約 90–150s 出圖      | 1K/2K/**4K**（30 檔統一價）               | \$0.03/張（按次，4K 不加價）         |
| [**Nano Banana**](/api-capabilities/nano-banana-image)                               | 正常可用         | 速度快、一致性佳、電商改圖                                                               | 多種尺寸                                | \$0.02/張                    |
| [**Seedream 5.0 Pro**](/zh-Hant/api-capabilities/seedream-image/overview) 🆕         | 新上線，專業版      | 全系最強畫質與複雜指令遵循、互動式編輯（座標/選框/箭頭）、最多 10 張參考圖融合、png 輸出；約 2 分鐘出圖，常規場景仍建議 5.0 Lite | 1K/2K（總畫素 ≤ 4.19M，無 3K/4K；不支援組圖與流式） | \$0.12/次                    |
| [**Seedream 5.0 Lite**](/api-capabilities/seedream-image)                            | 正常可用         | 價格優勢、速度快、輸出 URL                                                             | 2K/3K                               | \$0.035/張                   |
| [**Seedream 4.5**](/api-capabilities/seedream-image)                                 | 正常可用         | 價格優勢、速度快、輸出 URL                                                             | 2K/4K                               | \$0.04/張                    |
| [**Seedream 4.0**](/api-capabilities/seedream-image)                                 | 正常可用         | 價格優勢、速度快、輸出 URL                                                             | 2K                                  | \$0.035/張                   |
| [**GPT Image 1.5**](/news/gpt-image-1-5-launch) 🔥                                   | 官方系列         | 精準編輯，速度提升 4 倍，文本渲染增強                                                        | 低/中/高品質                             | 按量計費                        |
| [**GPT Image 1**](/api-capabilities/gpt-image-1)                                     | 官方系列         | 精準編輯                                                                        | 多種尺寸                                | 按量計費                        |
| **GPT Image 1-Mini**                                                                 | 官方系列         | 可替代 sora\_image                                                             | 多種尺寸                                | 按量計費                        |
| [**flux-2-max**](/zh-Hant/api-capabilities/flux/overview) 🆕                         | 最新一代（FLUX.2） | FLUX.2 旗艦，高品質出圖                                                             | 多種尺寸                                | \$0.07/次                    |
| [**flux-2-pro**](/zh-Hant/api-capabilities/flux/overview) 🆕                         | 最新一代（FLUX.2） | FLUX.2 專業版，均衡質價                                                             | 多種尺寸                                | \$0.03/次                    |
| [**flux-2-flex**](/zh-Hant/api-capabilities/flux/overview) 🆕                        | 最新一代（FLUX.2） | FLUX.2 靈活版，引數可調                                                             | 多種尺寸                                | \$0.06/次                    |
| [**Flux Kontext Pro**](/api-capabilities/flux-image-generation)                      | 正常可用         | 影像編輯                                                                        | 多種尺寸                                | 詳見文件                        |
| [**Flux Kontext Max**](/api-capabilities/flux-image-generation)                      | 正常可用         | 高品質影像編輯                                                                     | 多種尺寸                                | 詳見文件                        |

<Info>
  **Nano Banana Pro**：1K-4K 所有解析度統一價格 \$0.09/張，官方 4K 價格為 \$0.24/張，約官網 38%！企業高可用分組 `NanoBananaEnterprise`（1.4x）可作為兜底。[檢視詳情](/news/nano-banana-pro-launch)
</Info>

<Tip>
  **影像生成測試工具**

  * 國內訪問：<a href="https://image.apiyi.com" target="_blank" rel="noopener noreferrer">image.apiyi.com</a>
  * 全球訪問：<a href="https://imagen.apiyi.com" target="_blank" rel="noopener noreferrer">imagen.apiyi.com</a>

  詳細文件：

  * [Nano Banana Pro 文件](/api-capabilities/nano-banana-image-edit) - 本站最強，知識理解+精準編輯
  * [Nano Banana 2 文件](/api-capabilities/nano-banana-2-image) - 支援按量計費，新增超長比例
  * [gpt-image-2-all 文件](/zh-Hant/api-capabilities/gpt-image-2-all/overview) - GPT 官逆 ChatGPT 網頁線，\$0.03/張、約 30–60s 出圖較快
  * [gpt-image-2-vip 文件](/zh-Hant/api-capabilities/gpt-image-2-vip/overview) - GPT 官逆 Codex 線，\$0.03/張、30 檔 size 含 4K、約 90–150s 出圖
  * [gpt-image-2 文件](/zh-Hant/api-capabilities/gpt-image-2/overview) - OpenAI 官轉、原生 4K、size/quality 精確控
  * [⚖️ 官轉 vs 官逆 對比](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - gpt-image-2 與官逆姐妹模型 -all / -vip 選型對照
  * [Nano Banana 文件](/api-capabilities/nano-banana-image) - 速度快、一致性佳
  * [Nano Banana Lite 文件](/zh-Hant/api-capabilities/nano-banana-lite-image/overview) - 最快最省，約 4s 出圖，按次 \$0.025/張
  * [Seedream 文件](/api-capabilities/seedream-image) - 價格優勢、速度快；含 5.0 Pro 專業版（\$0.12/次、約 2 分鐘出圖）
  * [GPT Image 1.5 文件](/news/gpt-image-1-5-launch) - 速度提升 4 倍，精準編輯
  * [GPT Image 1 文件](/api-capabilities/gpt-image-1) - 官方影像生成
  * [Flux 文件](/api-capabilities/flux-image-generation) - 影像編輯
</Tip>

## 🎬 影片生成模型

| 模型名稱                                                                               | 狀態              | 特點                                                                                                                   | 時長                                                         | 價格                                                                               |
| ---------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [**Seedance 2.5 / 2.0 系列**](/zh-Hant/api-capabilities/seedance2/overview) 🔥       | 已上線，熱賣中         | 字節跳動，火山引擎國內版官方資源；**2.5** + 2.0 標準版 / 極速版 `fast` / 輕量版 `mini` 四檔並行，文生/首尾幀/多模態參考（圖+影片+音訊）/影片編輯與延長，**預設輸出同步音訊**，私域素材庫免費 | 2.5 為 4–30s，2.0 係為 4–15s（480p/720p/1080p，1080p 僅 2.5 與標準版） | 按 token 計費（面積×時長）；720p/5s 實測 \$0.45（mini）/ \$0.73（fast）/ \$0.91（標準）/ \$1.35（2.5） |
| [**Wan2.7 影片生成**](/zh-Hant/api-capabilities/wan/overview) 🆕                       | 新上線，推薦          | 阿里雲永珍，文生/圖生/參考生/影片編輯，i2v 支援音訊驅動                                                                                      | 按秒（最長 12s）                                                 | \$0.084-0.14/秒（官網 98%）                                                           |
| [**Wan2.6 影片生成**](/zh-Hant/api-capabilities/wan/historical-versions)               | 正常可用            | 與 Wan2.7 共用端點，含 `r2v-flash` 低延遲檔                                                                                     | 按秒                                                         | 以控制台為準                                                                           |
| [**VEO 3.1 官轉（Official）**](/zh-Hant/api-capabilities/veo-3-1-official/overview) 🔥 | 已上線，熱賣中（官逆替代方案） | 透傳 Google AI Studio 官方端點，聲畫同步、支援真人、預設分組即可呼叫                                                                          | 4/6/8s                                                     | 按次 \$0.3 / \$1.2（720p/1080p/4k 同價）                                               |
| **Veo 3.1 官逆**                                                                     | ⏸️ 暫停（谷歌風控）     | 谷歌 Flow 官逆；暫停期間請改用 **VEO 3.1 官轉**                                                                                    | 固定 8s                                                      | 暫不可用                                                                             |
| **Sora 2 官轉**                                                                      | ⏸️ 已下線          | OpenAI 官轉、專業創作、穩定性高、支援 sora-2-pro，不支援「角色」引用                                                                          | 4/8/12s                                                    | 暫不可用                                                                             |
| [**HappyHorse 1.1**](/zh-Hant/api-capabilities/happyhorse/overview) 🆕             | 新上線             | 阿里雲，多參考圖主體保持（最多 9 張），與 Wan 共用分組                                                                                      | 按秒（最長 12s）                                                 | \$0.126-0.224/秒（官網 98%）                                                          |
| ~~**Sora 2 官逆**~~                                                                  | ❌ 已下線           | 原電商帶貨 / 動漫漫劇場景，請改用 Sora 2 官轉                                                                                         | —                                                          | —                                                                                |

<Info>
  **影片模型核心特性**：

  * **Seedance 2.5 / 2.0 系列（字節跳動）**：`doubao-seedance-2-5-260628`（2.5，最長 30 秒、最多 30 張參考圖、支援 mov 輸出）/ `doubao-seedance-2-0-260128`（標準版）/ `-fast-260128`（極速版）/ `-mini-260615`（輕量版），價格與速度不同（mini \< fast \< 標準版 \< 2.5，2.5 約為標準版 1.5 倍），mini 與 fast 最高 720p。**四個模型同走 `SeeDance2` 分組**（0.18x），一把令牌通吃；令牌計費模式須選「按量優先」或「按量計費」。`SD2Mini`（0.10x）與 `SD2Fast`（0.15x）為限時特價分組，**mini 降價 44.4％、fast 降價 16.7％，截至 2026 年 9 月 7 日 23:59 (UTC+8)**，到期後倍率恢復 0.18x 不斷供
  * **VEO 3.1 官轉（Official）**：透傳 Google AI Studio 官方端點，業界領先的聲畫同步，支援真人出鏡，預設分組 + 按次/按量優先令牌即可呼叫，是 Veo 3.1 官逆暫停期間的推薦替代
  * **Veo 3.1 官逆**：因谷歌風控**暫停中**，恢復時間另行通知，期間請改用 VEO 3.1 官轉
  * **Sora 2 官轉**：已下線，暫不可用
  * **Wan2.7 / Wan2.6（阿里雲永珍）**：預設價約官網 98%，兩個系列與 HappyHorse 共用 `Wan&HappyHorse` 分組，一把令牌通用；Wan2.6 與 Wan2.7 同端點同 schema，只改 `model` 名即可遷移
  * **HappyHorse 1.1（阿里雲）**：擅長多參考圖主體保持，與 Wan 共用 `Wan&HappyHorse` 分組與端點
  * AI 影片工具（線上測試）：<a href="https://icover.ai" target="_blank" rel="noopener noreferrer">icover.ai</a>
</Info>

<Note>
  **即將上線的影片模型**：

  * Kling 3.0

  敬請期待！關注我們獲取最新上線通知。
</Note>

## 💰 定價說明

* **按量計費**：根據實際使用計費，無最低消費
* **餘額有效期**：自充值之日起 365 天內有效，再次充值自動重置（詳見[充值活動說明](/zh-Hant/faq/recharge-promotions)）
* 訪問 [API易控制台定價頁面](https://www.apiyi.com/account/pricing) 檢視所有模型的最新價格
