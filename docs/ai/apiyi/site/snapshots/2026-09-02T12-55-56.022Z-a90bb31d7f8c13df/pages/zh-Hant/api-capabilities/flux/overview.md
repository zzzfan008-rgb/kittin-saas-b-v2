> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FLUX 生圖/編輯

> Black Forest Labs 的 FLUX 模型族 — 從 sub-second 的 FLUX.2 [klein] 到 4MP 旗艦 [max]，覆蓋文生圖、參考圖編輯、多圖融合、文字渲染、hex 精確色控。OpenAI 相容直連。

## 概述

**FLUX** 是德國 Black Forest Labs（BFL）推出的旗艦影像生成模型族。最新一代 **FLUX.2** 橫跨 sub-second 到 4MP 旗艦畫質共 5 檔，疊加上一代影像編輯專用的 **FLUX.1 Kontext** 共 7 個模型在售；老版本 FLUX.1 \[pro] 系列也保留可呼叫。API易 閘道把 BFL 的非同步 API 封裝成標準 OpenAI Images API（`/v1/images/generations` 與 `/v1/images/edits`），OpenAI 官方 SDK 把 `base_url` 指過來即可零程式碼改動直連。

<Note>
  **🎨 核心亮點**：FLUX.2 \[max] 獨家支援 **grounding search 聯網搜尋**，原生 4MP 輸出（2048×2048）+ 多參考圖最多 8 張 + 32K tokens 長 prompt + hex 色精確控制 + 文字渲染領先。**適合需要旗艦畫質、多圖一致性、品牌色精確還原、專業排版** 的生產場景。
</Note>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/flux/text-to-image">
    `/v1/images/generations`，輸入文本提示詞生成圖片，覆蓋 FLUX.2 全部 5 個模型。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/flux/image-edit">
    JSON `input_image` 傳參考圖（最多 8 張多圖融合，走 `/generations`），另有 OpenAI 相容 multipart `/edits` 單圖編輯，FLUX.2 + FLUX.1 Kontext 通用。
  </Card>

  <Card title="歷史版本" icon="rotate-ccw-clock" href="/zh-Hant/api-capabilities/flux/historical-versions">
    FLUX.1 \[pro] / \[pro] 1.1 / \[pro] 1.1 Ultra / \[dev] 老版本規格、遷移建議、計費差異。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、**10 分鐘就失效的 URL 必須立即轉存**、上傳壓縮、尺寸必須是 16 的倍數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 FLUX 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 FLUX 的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/flux/overview.md](https://docs.apiyi.com/api-capabilities/flux/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：客戶端 timeout 設到 120 秒；如果用的是 `flux-2-flex`，放寬到 180 秒。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬，任何一層小於生成時間都會掐斷請求。

  2. 返回處理（**本模型最關鍵的一條**）：FLUX **只返回 URL、不返回 base64**——結果在 `data[0].url`，不要去找 `b64_json`，也不要傳 `response_format`。這個簽名連結**只有約 10 分鐘有效期**，而且**沒有開 CORS**：瀏覽器裡用 `fetch` 直接抓會被跨域擋掉（把連結塞進圖片標籤的 `src` 顯示是可以的）。所以正確做法是：**拿到 URL 後立刻在服務端下載，轉存到你自己的物件儲存**，再把你自己的永久連結返回給前端。千萬不要把上游連結直接存進資料庫當長期地址用。另外本模型的響應裡**沒有 `usage` 欄位**，別指望從響應裡讀 token 數。

  3. 上傳參考圖：多圖融合走 `/v1/images/generations`，用 JSON 欄位 `input_image`、`input_image_2` 一直到 `input_image_8`，值可以是圖片 URL 或者 `data:image/...;base64,...` 形式的 data URL。`/v1/images/edits`（multipart）**只收單張圖，且檔案欄位名必須叫 `image`**，寫錯會返回 `image is required`。參考圖張數上限按型號不同：FLUX.2 pro / max / flex 最多 8 張，klein 最多 4 張，FLUX.1 Kontext 只有 1 張。上傳前先壓縮——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；單圖不要超過 20MB 或 2000 萬畫素。某張圖壓縮失敗就回退用原圖繼續。

  4. 尺寸引數：用 `size`（比如 `1024x1024`）或者 `width` / `height` 兩個整數，二選一即可，兩種寫法等價。**寬高必須都是 16 的倍數**，最小 64×64，最大約 400 萬畫素（建議控制在 200 萬畫素以內）。注意 `1000x1000` 不合法（不是 16 的倍數）、`3840x2160` 也不合法（超過 400 萬畫素），前臺如果讓使用者填尺寸，務必先做這兩條校驗。編輯場景用 `aspect_ratio` 控制比例，不傳時輸出會自動跟隨第一張輸入圖。本模型**沒有 `quality` 引數**，`flux-2-flex` 獨有 `steps`（預設 50）和 `guidance`（預設 4.5）兩個品質旋鈕。成本靠選型控制：klein 最便宜、max 最貴，編輯與生成同價、多圖不額外加錢。

  5. 其它注意：用 OpenAI SDK 呼叫時，FLUX 特有的引數要放進 `extra_body` 才能傳下去。`prompt_upsampling` 預設關閉，它會改寫你的提示詞，做品牌相關內容時保持關閉。`webhook_url` 不會透傳，別依賴它。

  6. Key 從環境變數 `APIYI_API_KEY` 讀，base\_url 用 [https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進](https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進) git。

  7. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求               | 擋掉的坑                                                                                              |
  | ---------------- | ------------------------------------------------------------------------------------------------- |
  | 立即服務端轉存          | 上游連結約 10 分鐘就失效，存進資料庫當長期地址用必然大面積 404                                                               |
  | 不要在瀏覽器裡 `fetch`  | 上游沒開 CORS，前端直接抓會被跨域擋掉；只有圖片標籤的 `src` 能正常顯示                                                         |
  | 不要找 `b64_json`   | 本模型只返回 URL，按 base64 解析只會拿到空值                                                                      |
  | 寬高必須是 16 的倍數     | `1000x1000` 這種看起來很正常的尺寸直接非法，`3840x2160` 則超了畫素上限                                                   |
  | 上傳前壓縮            | 單圖上限 20MB / 2000 萬畫素。壓縮標準見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution) |
  | 編輯介面欄位名叫 `image` | 寫成別的名字會返回 `image is required`；多圖融合根本不該走這個端點                                                       |
</Accordion>

## 為什麼選 API易 的 FLUX？

對標 BFL 官方通道，針對企業生產場景在 **穩定性**、**成本**、**接入體驗** 三方面做了深度最佳化：

<CardGroup cols={2}>
  <Card title="OpenAI 相容封裝 · 零程式碼遷移" icon="shield-check">
    BFL 官方走非同步 polling，APIYI 把它封裝成同步的 **OpenAI Images API**。OpenAI 官方 SDK 把 `base_url` 指過來直接用，不用自己寫 `polling_url` 輪詢迴圈。
  </Card>

  <Card title="不限併發 · 突破 24 active 限制" icon="infinity">
    BFL 官方對單賬號限 **24 個 active tasks**（kontext-max 僅 6），APIYI 在閘道層做了池化，企業使用者線性放量不受單賬號限制。
  </Card>

  <Card title="同價或最高節省 17%" icon="percent">
    FLUX.2 \[pro/max/flex] 與官方 1MP 同價，klein 4B/9B 比官方更便宜（節省約 28%），FLUX.1 \[pro] 1.1 Ultra 節省 17%，疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) **最低可享 85 折**。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，延遲穩定、免去出海改造。
  </Card>

  <Card title="模型生態齊全" icon="layers">
    搭配 [gpt-image-2](/zh-Hant/api-capabilities/gpt-image-2/overview)、[Seedream](/zh-Hant/api-capabilities/seedream-image/overview)、[Nano Banana](/zh-Hant/api-capabilities/nano-banana-image/overview) 等同站系列，可按場景自由組合。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕影像生成場景，具備豐富的選型、調優與整合經驗，可為企業客戶提供從 PoC 到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="速度全檔位覆蓋" icon="bolt">
    klein 4B/9B **sub-second** 出圖（消費級 GPU 即可）、pro **\< 10 秒**、max **\< 15 秒**、flex 較慢但精度更高。一個系列橫跨即時到旗艦。
  </Card>

  <Card title="原生 4MP 輸出" icon="expand">
    最大 2048×2048（約 4MP），是 FLUX.1 時代 1.6MP 的 2.5 倍。任意寬高（邊長鬚 16 倍數），最小 64×64。
  </Card>

  <Card title="多參考圖融合" icon="layers">
    JSON 欄位 `input_image` \~ `input_image_8` 傳多張參考圖（URL 或 base64 data URL）：FLUX.2 \[pro/max/flex] 最多 **8 張**，\[klein] 最多 4 張，prompt 中可用「圖1/圖2」精確指代。
  </Card>

  <Card title="聯網搜尋（grounding search）" icon="globe">
    FLUX.2 \[max] 獨家：prompt 觸發即時網路檢索，可生成"昨日比賽比分"、"即時天氣"、"歷史事件復刻"等需要外部知識的畫面。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="精確 hex 色控制" icon="palette">
    在 prompt 裡直接寫 `#02eb3c` / `#ff0088` 等 hex 碼，模型按精確色值出圖，專業品牌設計無需後期調色。
  </Card>

  <Card title="32K tokens 長 prompt" icon="type">
    支援最長 **32K tokens** 的 prompt，可用結構化 JSON 描述（subject / background / lighting / style 等），適合產線自動化。
  </Card>

  <Card title="文字渲染特化" icon="type">
    FLUX.2 \[flex] 專為文字場景調優，海報標題、UI 截圖、資訊圖等小字保留度業內領先；max / pro 同樣可用。
  </Card>

  <Card title="OpenAI SDK 直連" icon="plug">
    把 `base_url` 指向 `https://api.apiyi.com/v1` 即可用 OpenAI 官方 SDK 直接調 `client.images.generate(model="flux-2-pro", ...)`，零程式碼改動。
  </Card>
</CardGroup>

## 模型定價

按次計費，單價見下表（**APIYI 單價**列）。BFL 官方按 **MP（megapixel）** 計費，1MP 內同價、超過逐 MP 加成；APIYI 按張定價更可預測。

### FLUX.2 系列（最新一代）

| 模型 ID             | APIYI 單價   | 官方價            | 速度         | 適用場景                     |
| ----------------- | ---------- | -------------- | ---------- | ------------------------ |
| `flux-2-max`      | \$0.0700/次 | from \$0.07/MP | \< 15 秒    | 旗艦畫質 + 聯網搜尋（grounding）   |
| `flux-2-pro`      | \$0.0300/次 | from \$0.03/MP | \< 10 秒    | 生產規模、最佳價效比               |
| `flux-2-flex`     | \$0.0600/次 | \$0.06/MP      | 較慢         | 文字渲染特化，可調 steps/guidance |
| `flux-2-klein-9b` | \$0.0100/次 | from \$0.015   | sub-second | 平衡畫質和速度                  |
| `flux-2-klein-4b` | \$0.0100/次 | from \$0.014   | sub-second | 最快、消費級 GPU 友好            |

### FLUX.1 Kontext 系列（影像編輯專用）

| 模型 ID              | APIYI 單價   | 官方價    | 節省    | 適用場景            |
| ------------------ | ---------- | ------ | ----- | --------------- |
| `flux-kontext-max` | \$0.0700/次 | \$0.08 | 12.5% | 編輯最高品質、文字精修     |
| `flux-kontext-pro` | \$0.0350/次 | \$0.04 | 12.5% | 編輯價效比首選、5-6 秒生成 |

### FLUX.1 \[pro] 經典版本（歷史版本，仍可呼叫）

| 模型 ID                | APIYI 單價   | 官方價    | 節省    |
| -------------------- | ---------- | ------ | ----- |
| `flux-pro-1.1-ultra` | \$0.0500/次 | \$0.06 | 17%   |
| `flux-pro-1.1`       | \$0.0350/次 | \$0.04 | 12.5% |
| `flux-pro`           | \$0.0400/次 | \$0.04 | 同價    |
| `flux-dev`           | \$0.0200/次 | —      | —     |

詳細規格與遷移建議見 [歷史版本頁](/zh-Hant/api-capabilities/flux/historical-versions)。

<Info>
  **計費說明**：

  * APIYI 走按次定價，1 張圖固定單價，與輸出 MP 無關
  * 官方按 MP 計費，1MP 起步價 + 超過部分逐 MP 加成
  * 編輯請求與文生圖同價（不像 OpenAI gpt-image-2 編輯要按 Vision 加價）
  * klein 4B / klein 9B 的開源權重可在 Hugging Face 自行部署（Apache 2.0 / FLUX NCL 協議）
  * 失敗請求（4xx / 內容稽核攔截）不計費
</Info>

## 技術規格

| 維度                     | 引數                                                                     |
| ---------------------- | ---------------------------------------------------------------------- |
| **當前主力推薦**             | `flux-2-pro` / `flux-2-pro-preview`（綜合）+ `flux-kontext-max`（編輯文字）      |
| **速度**                 | sub-second（klein）/ \< 10 秒（pro）/ \< 15 秒（max）/ 較慢（flex）                |
| **輸出解析度**              | 最大 4MP（2048×2048），任意寬高，邊長鬚 16 倍數                                       |
| **輸入解析度**              | 最小 64×64，最大 4MP（僅編輯端點）                                                 |
| **參考圖上限**              | 8 張（FLUX.2 \[pro/max/flex]）/ 4 張（FLUX.2 \[klein]）/ 1 張（FLUX.1 Kontext） |
| **Prompt 長度**          | 最長 32K tokens                                                          |
| **輸出格式**               | `jpeg`（預設）/ `png`                                                      |
| **稽核檔位**               | `safety_tolerance` 0–6（0 最嚴、6 最寬鬆，預設 2）                                |
| **聯網搜尋**               | 僅 `flux-2-max` 支援 grounding search                                     |
| **響應欄位**               | `data[0].url`（**10 分鐘內有效**，需立即下載）                                      |
| **單次出圖數量**             | 1 張（`n=1`）                                                             |
| **prompt\_upsampling** | FLUX.2 \[pro/max/flex] 支援，\[klein] 不支援                                 |

## 端點一覽

| 端點                            | 用途                                                                         | Content-Type          |
| ----------------------------- | -------------------------------------------------------------------------- | --------------------- |
| `POST /v1/images/generations` | 文生圖 + 圖片編輯 / 多圖融合（JSON `input_image` \~ `input_image_8`，**推薦**，所有 FLUX 模型） | `application/json`    |
| `POST /v1/images/edits`       | OpenAI 相容單圖編輯（`client.images.edit()` 直連；Kontext 系列已實測）                     | `multipart/form-data` |

多圖融合請走 `/generations`（JSON `input_image_N`）；`/edits` 僅接受單張 `image` 檔案，適合已有 OpenAI SDK 編輯程式碼的遷移場景。

<Tip>
  **域名選擇**：`api.apiyi.com` 為主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平臺提供的其他閘道域名，響應行為一致。
</Tip>

## 尺寸（width / height）詳解

### 常用尺寸

| 尺寸          | 含義       | 畫素      | 適用              |
| ----------- | -------- | ------- | --------------- |
| `1024x1024` | 方形 1:1   | \~1MP   | 通用、社媒頭像         |
| `1024x1536` | 豎版 2:3   | \~1.6MP | 海報、肖像           |
| `1536x1024` | 橫版 3:2   | \~1.6MP | 風景、桌面           |
| `1440x2048` | 豎版 \~3:4 | \~2.9MP | 電影豎幅            |
| `1920x1080` | 橫版 16:9  | \~2MP   | 影片縮圖            |
| `2048x2048` | 方形 1:1   | 4MP     | 旗艦列印（FLUX.2 上限） |

### 自定義尺寸約束

FLUX.2 接受任意尺寸，只需同時滿足：

1. **width / height 都是 16 的倍數**
2. **最小 64×64**
3. **最大約 4MP**（如 2048×2048 / 1920×2048 / 2048×1920 等）
4. **推薦總畫素 ≤ 2MP** 以兼顧速度與價格

**合法示例**：`1280x720`、`1920x1080`、`2048x1024`、`1456x1920`
**非法示例**：`1000x1000`（非 16 倍數）、`3840x2160`（超 4MP 上限）、`32x32`（小於 64×64）

<Warning>
  **API 端 width/height 與 OpenAI 相容寫法的差異**：BFL 原生使用 `width` / `height` 整數；APIYI 也接受 OpenAI 風格的 `size: "1024x1024"` 字串，兩種寫法等價，二選一即可。
</Warning>

## 最佳實踐

<Steps>
  <Step title="按場景選模型">
    旗艦終稿 + 需要聯網知識 → `flux-2-max`；生產批次 → `flux-2-pro`；文字海報 / 資訊圖 → `flux-2-flex`；高吞吐即時 → `flux-2-klein-9b`；影像編輯首選 → `flux-kontext-max` 或 `flux-kontext-pro`。
  </Step>

  <Step title="尺寸優先 ≤ 2MP">
    速度和價格的最優平衡點在 1MP–2MP 之間。僅在列印 / 4K 螢幕等明確需要時再上 4MP，klein 高解析度會顯著增加單次成本。
  </Step>

  <Step title="多圖融合用「圖1/圖2」指代">
    `input_image` / `input_image_2` / `input_image_3` 的編號就是 prompt 中「圖1/圖2/圖3」的指代依據，prompt 中顯式說"圖1的人物放進圖2的場景，沿用圖3的色彩風格"，比讓模型自己推斷穩得多。
  </Step>

  <Step title="結果 URL 立即下載">
    `data[0].url` 僅 **10 分鐘有效**，且託管在 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`，CORS 預設關閉。生產服務必須代下載到自有 CDN。
  </Step>

  <Step title="文字場景鎖 flex 或 max">
    招牌、海報、UI 截圖等帶文字的場景優先用 `flux-2-flex`（專精文字）或 `flux-2-max`（綜合品質更高），其它模型小字仍可能糊。
  </Step>

  <Step title="聯網知識用 max grounding search">
    需要"今天的天氣"、"昨晚比賽"等即時知識時僅 `flux-2-max` 能用。其它模型純靠訓練資料，無法即時檢索。
  </Step>

  <Step title="客戶端超時 60–120 秒">
    APIYI 已封裝好同步等待，pro / max \< 15 秒到幀，但疊加排隊 + 網路抖動建議客戶端超時 60–120 秒。flex 較慢可設到 180 秒。
  </Step>

  <Step title="seed 固定可復現">
    傳相同 `seed` + 相同其它引數可獲一致結果，適合 A/B 測試與客戶驗收。klein 不支援 prompt\_upsampling，pro/max/flex 預設關閉，按需開啟。
  </Step>
</Steps>

## 錯誤碼與重試

| 狀態碼   | 含義                                                     | 處理建議                                   |
| ----- | ------------------------------------------------------ | -------------------------------------- |
| `400` | 引數非法（width/height 非 16 倍數、超 4MP、prompt 超 32K tokens 等） | 按尺寸約束章節校驗，特別檢查 16 倍數                   |
| `401` | 令牌無效                                                   | 檢查 Bearer Token                        |
| `403` | 內容稽核攔截                                                 | 調整 prompt 或調高 `safety_tolerance`（最高 6） |
| `429` | 限流 / 餘額不足 / active tasks 超限                            | 指數退避重試                                 |
| `5xx` | 閘道 / 後端錯誤                                              | 重試 1–2 次                               |
| 超時    | 長尾                                                     | 客戶端超時 ≥ **60 秒**（flex 建議 180 秒）        |

<Info>
  **建議客戶端**：

  * 請求超時 **60–120 秒** 起步（flex 模型放寬到 180 秒）
  * 對 5xx 與 429 做 **指數退避重試**（建議 2 次）
  * 拿到 `data[0].url` 後**立即非同步下載**，不要等使用者點選再拉
  * 記錄響應頭 `x-request-id` 方便排查
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="返回的 url 欄位為什麼 10 分鐘就失效？">
    BFL 官方設計：所有結果都託管在 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`，簽名 URL 有效期 10 分鐘，且**不開啟 CORS**。生產服務必須服務端代下載到自有 OSS / CDN，不能直接給瀏覽器渲染、也不能讓使用者長期訪問。

    APIYI 閘道沿用了同一套 URL 機制，行為與官方一致。
  </Accordion>

  <Accordion title="官方走非同步輪詢，APIYI 怎麼變成同步的？">
    APIYI 閘道替你做了 polling：你發一個標準的 OpenAI Images API 請求，閘道內部代你 POST 到 BFL、輪詢 `polling_url` 直到 `Ready`，再把最終的 `result.sample` URL 包裝成 `data[0].url` 返回。客戶端看到的就是一發請求一次響應，與 OpenAI / GPT-Image / Nano Banana 完全一致。
  </Accordion>

  <Accordion title="多參考圖最多能傳幾張？怎麼寫 prompt？">
    * **FLUX.2 \[pro/max/flex]**：最多 **8 張**
    * **FLUX.2 \[klein]**：最多 **4 張**
    * **FLUX.1 Kontext \[pro/max]**：單張為主（多圖融合靠拼圖變通）

    在 prompt 裡用「圖1/圖2/圖3」明確指代，例如"把圖1的人物放進圖2的場景，沿用圖3的色彩風格"。也可以自然語言描述，模型理解輸入圖的內容能力較強。
  </Accordion>

  <Accordion title="prompt_upsampling 是幹什麼的？要開嗎？">
    `prompt_upsampling=true` 時模型會自動擴寫 / 最佳化你的 prompt（特別適合短 prompt）。但**會改變原意**，專業排版 / 品牌素材建議關閉、自由探索時可以開。

    **限制**：FLUX.2 \[klein] 系列不支援，傳了會被忽略。
  </Accordion>

  <Accordion title="grounding search 聯網搜尋具體怎麼用？">
    僅 `flux-2-max` 支援。**無需特殊引數**，只要 prompt 裡包含需要即時知識的內容，模型就會自動聯網搜尋後再出圖。例如：

    > "Generate a news photo of the snowstorm hitting NYC on Dec 15, 2025"

    適合"昨日比賽比分"、"即時天氣"、"歷史事件復刻"、"最新流行趨勢"等。無聯網知識的 prompt 即使開啟也不會觸發，按普通生圖計費。
  </Accordion>

  <Accordion title="hex 色控怎麼寫最有效？">
    直接在 prompt 中寫 hex 碼，並用「color」/「hex」之類關鍵詞顯式標註：

    ```
    A vase on a table, the color of the vase is gradient from #02eb3c to #edfa3c, the flowers have color #ff0088
    ```

    或者多色品牌：

    ```
    Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020
    ```

    精度業內領先，無需後期調色。
  </Accordion>

  <Accordion title="結構化 JSON prompt 是什麼？">
    FLUX.2 支援把 prompt 寫成 JSON：

    ```json theme={null}
    {
      "subject": "Mona Lisa painting by Leonardo da Vinci",
      "background": "museum gallery wall, ornate gold frame",
      "lighting": "soft gallery lighting",
      "style": "digital art, high contrast",
      "camera_angle": "eye level view",
      "composition": "centered, portrait orientation"
    }
    ```

    把 JSON 字串作為 `prompt` 欄位值傳入。適合產線自動化、批次生成同模板素材。
  </Accordion>

  <Accordion title="圖片編輯該走哪個端點？">
    兩種方式二選一：

    * **方式 A（推薦）**：JSON + `input_image`（\~ `input_image_8`）發 `/v1/images/generations`，所有 FLUX 模型通用，支援多圖融合
    * **方式 B**：`multipart/form-data` 發 `/v1/images/edits`，檔案欄位名必須是 `image`（單圖），與 OpenAI SDK `client.images.edit()` 直接相容，Kontext 系列已實測

    詳細引數和示例見 [圖片編輯 API](/zh-Hant/api-capabilities/flux/image-edit)。

    **注意**：FLUX.1 Kontext 系列原生只支援單參考圖；FLUX.2 系列原生支援最多 8 張（走方式 A）。
  </Accordion>

  <Accordion title="可以直接用 OpenAI 官方 SDK 呼叫嗎？">
    可以，零程式碼改動。把 `base_url` 指向 `https://api.apiyi.com/v1` 即可：

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="flux-2-pro",
        prompt="...",
        size="1024x1024"
    )
    ```

    Node.js 的 `openai` 包同理。所有 FLUX 模型都按 OpenAI Images API 規範返回 `data[0].url`。
  </Accordion>

  <Accordion title="支援主動取消任務嗎？">
    **不支援**。客戶端斷開連線後服務端仍會把生成跑完並照常計費。建議客戶端做好超時控制，不要依賴"斷連不收費"的假設。
  </Accordion>

  <Accordion title="速率限制和併發是多少？">
    BFL 官方對單賬號限 **24 active tasks**，`flux-kontext-max` 單獨限 **6 active tasks**。

    APIYI 在閘道層做了池化，企業使用者的併發不受單賬號上限制約。如需明確 SLA / RPM 配額，請聯絡商務申請擴容。
  </Accordion>

  <Accordion title="webhook 回撥能用嗎？">
    BFL 官方支援 `webhook_url` + `webhook_secret`，但 APIYI 的 OpenAI 相容封裝走同步等待，**未透傳 webhook 欄位**——不需要輪詢，發一發拿一發。如果業務確實需要 webhook，請聯絡我們說明場景，可單獨開啟原生非同步通道。
  </Accordion>

  <Accordion title="生成失敗會扣費嗎？">
    **不會**。引數 `400`、內容稽核 `403`、限流 `429` 都返回錯誤且不計費。**只有請求實際進入模型生成階段（即收到 `200` + `data[0].url`）才會按張數計費**。
  </Accordion>
</AccordionGroup>

## 相關文件

* [文生圖 Playground](/zh-Hant/api-capabilities/flux/text-to-image) - `/v1/images/generations` 線上除錯
* [圖片編輯 Playground](/zh-Hant/api-capabilities/flux/image-edit) - `/v1/images/edits` 多圖融合 + 編輯
* [歷史版本與遷移](/zh-Hant/api-capabilities/flux/historical-versions) - FLUX.1 \[pro] / \[pro] 1.1 / Ultra / \[dev]
* [API 使用手冊](/zh-Hant/api-manual) - 通用呼叫規範
* [GPT-Image-2 概覽](/zh-Hant/api-capabilities/gpt-image-2/overview) - OpenAI 官方旗艦影像，支援 4K
* [Seedream 概覽](/zh-Hant/api-capabilities/seedream-image/overview) - 位元組火山戰略合作通道

<Info>
  FLUX 是 BFL 自研模型族，在 hex 色精確控制、文字渲染、長 prompt 理解上業內領先。如果你更看重 OpenAI 生態一致性可參考 [GPT-Image-2](/zh-Hant/api-capabilities/gpt-image-2/overview)；更看重中文場景可參考 [Seedream](/zh-Hant/api-capabilities/seedream-image/overview)。
</Info>
