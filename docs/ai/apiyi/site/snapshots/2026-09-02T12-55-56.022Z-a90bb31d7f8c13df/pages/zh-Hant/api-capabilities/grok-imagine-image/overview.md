> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Imagine 2 生圖/編輯

> xAI 最新一代影像生成模型 Grok Imagine 2（grok-imagine-image / grok-imagine-image-quality）完整指南，支援 5 種寬高比、1K/2K 雙檔解析度、單次最多 10 張、真參考圖編輯，按次計費 $0.02 / $0.045 一張，不區分解析度，出 2K 約合官網 6.4 折。

## 概述

**Grok Imagine 2** 是 xAI **最新發布的第二代**影像生成模型，相比初代在引數可控性與編輯能力上是整代升級：寬高比與解析度引數真實生效、2K 檔可用、單次最多出 10 張、參考圖編輯能真正保留原圖特徵。

API易 提供 `grok-imagine-image`（標準）與 `grok-imagine-image-quality`（高品質）兩個型號，共用同一套介面與引數，區別只在畫質檔位與價格。

<Note>
  **核心亮點**：按次固定計費且**不區分解析度**（官網 quality 版 2K 收 \$0.07，我們統一 \$0.045，**出 2K 約合 6.4 折**），5 種寬高比 × 2 檔解析度引數**真實生效**，單次最多出 10 張，參考圖編輯保真度高（畫風、構圖、配色、主體身份都能保留）。1K 出圖約 9 秒。
</Note>

<Info>
  **模型 ID 裡不帶 `2`**。產品代號叫 Grok Imagine 2，但呼叫時的模型名是 **`grok-imagine-image`** 和 **`grok-imagine-image-quality`**——不要寫成 `grok-imagine-2-image`，那樣會因模型不存在而返回 503。
</Info>

<Warning>
  **📌 上手前必看的一條**：**參考圖只能傳給編輯介面 `/v1/images/edits`，不能傳給文生圖介面。**

  給 `/v1/images/generations` 傳 `image` / `image_url` / `images` 會返回 **200 並正常出圖**，但參考圖被**靜默丟棄**、且照常計費——沒有任何錯誤提示。詳見下方 [端點一覽](#端點一覽)。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/grok-imagine-image/text-to-image">
    輸入文本提示詞生成圖片，帶互動式 Playground 線上除錯。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/grok-imagine-image/image-edit">
    上傳參考圖 + 編輯指令生成新圖，支援 1–4 張多圖融合，帶 Playground。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、URL 結果要立即轉存、**參考圖發錯端點會靜默丟棄還照樣計費**、以及 `size` 不生效這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Grok Imagine 2 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Grok Imagine 2 的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/grok-imagine-image/overview.md](https://docs.apiyi.com/api-capabilities/grok-imagine-image/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 模型名：普通檔是 `grok-imagine-image`，高畫質檔是 `grok-imagine-image-quality`。**注意模型 ID 裡不帶數字 2**——寫成 `grok-imagine-2-image` 會因為模型不存在返回 503。

  2. 超時：客戶端 timeout 提到 360 秒兜底。雖然實測 1K 約 9 秒、2K 約 15 秒，但按 60 秒配會產生大量誤超時，而這些請求仍然計費。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬。

  3. 端點選擇（**本模型最容易踩的一條**）：文生圖打 `/v1/images/generations`（JSON）；**任何帶參考圖的請求都必須打 `/v1/images/edits`，而且必須是 `multipart/form-data`**。兩個方向都有坑：把參考圖塞進 `/v1/images/generations`，介面會**返回 200、靜默丟棄參考圖、當成純文生圖出一張不相干的圖，並且照常計費**；反過來給 `/v1/images/edits` 發 JSON 則固定返回 400。檔案欄位名必須是 `image` 或 `image[]`，寫成 `images` 或 `image_file` 會返回 415。編輯端點最多 1 到 4 張參考圖，傳 5 張返回 400。

  4. 返回處理：預設返回 `url`，也可以傳 `response_format: "b64_json"` 拿純 base64（不帶 `data:` 字首）；同一條 `data[]` 裡只會有其中一個。走 URL 的話請在服務端立即下載轉存到自己的物件儲存。另外注意本模型**不返回 `revised_prompt`**，`created` 恆為 0，`usage` 是佔位值（`prompt_tokens` 永遠是 1000 乘以 n），**不能拿來對賬**，費用請以控制台賬單為準。

  5. 尺寸引數：用 `aspect_ratio`（`1:1` / `16:9` / `9:16` / `4:3` / `3:4`，預設 `1:1`）加 `resolution`（`1k` / `2k`，**小寫**，預設 `1k`）。**不要傳 `size`**——它會被靜默忽略，結果是你以為設了 1536×1024、實際拿到一張 1024×1024 的方圖。同理 `quality` / `style` 也會被靜默忽略，要高畫質請換 `-quality` 那個模型名，而不是傳引數。傳超出列舉的 `aspect_ratio` 或 `resolution` 會靜默回落到預設值；特別地 `resolution: "4k"` 會返回 503，那是引數錯誤不是服務故障。還有一點：**在編輯端點上 `resolution` 和 `aspect_ratio` 都不起作用**，輸出畫幅固定跟隨第一張參考圖的尺寸。

  6. 上傳壓縮：上傳前先壓縮參考圖——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；多圖時合計控制在 6MB 以內。某張圖壓縮失敗就回退用原圖繼續，不要因為壓縮失敗中斷整個請求。

  7. 錯誤處理：`400 invalid_request` 同時覆蓋「引數寫錯」和「內容稽核攔截」兩種情況，從響應體裡區分不出來，排查時兩個方向都要看。`n` 取值 1 到 10，傳 0 會被當成 1，傳 11 及以上返回 400。`seed` 雖然接受但不生效，結果不可復現。本模型不支援 `mask`。

  8. Key 從環境變數 `APIYI_API_KEY` 讀，base\_url 用 [https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進](https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進) git。

  9. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求            | 擋掉的坑                                                                                                                 |
  | ------------- | -------------------------------------------------------------------------------------------------------------------- |
  | 參考圖只發編輯端點     | 發到 `/v1/images/generations` 會返回 200、靜默丟棄參考圖、照樣計費——最貴的一個坑，因為它不報錯                                                      |
  | 不傳 `size`     | `size` 被靜默忽略，你以為設了尺寸，拿到的卻是一張 1024×1024 方圖                                                                            |
  | 模型 ID 不帶數字 2  | 寫成 `grok-imagine-2-image` 會返回 503，看起來像服務故障其實是名字錯了                                                                    |
  | 高畫質換模型不是傳參    | 本模型沒有 `quality` 引數，傳了會被靜默忽略                                                                                          |
  | 不拿 `usage` 對賬 | `usage` 是佔位值，`prompt_tokens` 恆為 1000 乘以 n，費用請以控制台賬單為準                                                                |
  | 超時仍設 360 秒    | 出圖只要十幾秒容易讓人把超時壓得很小，高峰時就會誤超時，而**斷連的請求照常計費**。詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) |
</Accordion>

## 為什麼選 API易 的 Grok Imagine 2

<CardGroup cols={2}>
  <Card title="OpenAI 相容格式" icon="shield-check">
    走標準 `/v1/images/generations` 與 `/v1/images/edits`，請求體與響應欄位與 OpenAI Images API 一致，可直接用 OpenAI SDK 呼叫，遷移零改造。
  </Card>

  <Card title="不限併發 · 企業可放量" icon="infinity">
    沒有 RPM/RPD 硬限制，**實測 100 RPM 無壓力**，渠道資源充足，批量出圖可線性放大，無需申請配額或自建限流。
  </Card>

  <Card title="按次計費 · 成本可預測" icon="percent">
    固定單價、**不區分解析度**：官網 quality 版 1K \$0.05 / 2K \$0.07，我們兩檔統一 \$0.045，**出 2K 約合官網 6.4 折**。預算可精確到張，疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 更低。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，免去出海改造。
  </Card>

  <Card title="模型生態齊全" icon="layers">
    影像側還有 [Nano Banana 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)、[GPT-Image-2](/zh-Hant/api-capabilities/gpt-image-2/overview)、[Seedream](/zh-Hant/api-capabilities/seedream-image/overview)、[FLUX](/zh-Hant/api-capabilities/flux/overview) 可按場景組合；文本側有 [Grok 系列](/zh-Hant/api-capabilities/grok/overview)。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕影像生成場景，具備豐富的選型、調優與整合經驗，可為企業客戶提供從 PoC 到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="雙檔解析度" icon="expand">
    `1k` 約 1 兆畫素、`2k` 約 4.2–4.5 兆畫素（16:9 達 2816×1584），**兩檔同價，出 2K 更划算**
  </Card>

  <Card title="5 種寬高比" icon="maximize">
    `1:1` / `16:9` / `9:16` / `4:3` / `3:4`，實測畫素與請求值精確吻合
  </Card>

  <Card title="單次最多 10 張" icon="images">
    `n` 支援 1–10，一次請求返回多張，適合批次選圖
  </Card>

  <Card title="出圖快" icon="zap">
    1K 約 9 秒、2K 約 15–17 秒；併發下延遲穩定，100 RPM 無壓力
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="真參考圖編輯" icon="wand">
    改指定部分、其餘逐畫素保留——畫風、構圖、配色、主體身份都不走樣
  </Card>

  <Card title="多圖融合" icon="layers-2">
    編輯介面支援 1–4 張參考圖，實測每多一張就多一個主體；第一張決定輸出畫幅
  </Card>

  <Card title="雙返回格式" icon="braces">
    `url` 直鏈或 `b64_json` 純 base64，兩個端點都支援
  </Card>

  <Card title="OpenAI SDK 直連" icon="plug">
    `client.images.generate()` / `client.images.edit()` 直接可用，無需自己拼 HTTP
  </Card>
</CardGroup>

## 模型定價

| 模型                               | 解析度         | API易定價          | xAI 官網 | 折扣          |
| -------------------------------- | ----------- | --------------- | ------ | ----------- |
| **`grok-imagine-image`**         | `1k` / `2k` | **\$0.02 / 張**  | \$0.02 | 持平          |
| **`grok-imagine-image-quality`** | `1k`        | **\$0.045 / 張** | \$0.05 | **9 折**     |
| **`grok-imagine-image-quality`** | `2k`        | **\$0.045 / 張** | \$0.07 | **約 6.4 折** |

<Info>
  **計費說明**

  * **我們不區分解析度，官方區分**。xAI 官網的 quality 版 1K 收 \$0.05、2K 收 \$0.07，API易 兩檔統一 **\$0.045**——所以**解析度越高越划算**，出 2K 相當於官網 **6.4 折**。
  * **按張計費**：`n=4` 即按 4 張計費，與提示詞長度無關。
  * **編輯與文生圖同價**：走 `/v1/images/edits` 不額外收費。
  * **響應體裡的 `usage` 不能用來核賬**：`prompt_tokens` 恆為 `1000 × n`，是佔位值，真實扣費以控制台賬單為準。
</Info>

### 疊加充值加贈後的實際成本

上面的折扣還能**疊加 [充值階梯加贈](/zh-Hant/faq/recharge-promotions)**（加贈按**單次充值金額**計算）。以 quality 版出 2K 為例：

| 充值檔位               | 到賬倍數   | 單張實付         | 相當於官網 \$0.07 |
| ------------------ | ------ | ------------ | ------------ |
| 不參與活動（掛牌價）         | 1.0 倍  | \$0.045      | **6.4 折**    |
| 單次充 \$100（送 10%）   | 1.1 倍  | ≈ \$0.041    | **約 5.8 折**  |
| 單次充 \$1,000（送 15%） | 1.15 倍 | ≈ \$0.039    | **約 5.6 折**  |
| 單次充 \$3,000（送 20%） | 1.2 倍  | **\$0.0375** | **約 5.4 折**  |

<Tip>
  **常規情況下（充 \$100 檔）出 2K 約合官網 5.8 折，加贈拉滿可到約 5.4 折。** 標準版 `grok-imagine-image` 同樣可疊加加贈，\$0.02 掛牌價在 20% 加贈下實付約 \$0.0167/張。
</Tip>

## 分組介紹

Grok Imagine 2 在 **`Default` 預設分組（1.0x 倍率）**，與上方定價表一致，**無需切換分組**即可呼叫。

**令牌「計費模式」推薦**：選 `按量優先`（Pay-as-you-go Priority）—— 本系列是按次計費模型，按量優先與按次計費都能正常路由，選按量優先可以讓同一把令牌相容站內其它按 token 計費的模型。

<Tip>
  如果你的令牌還覆蓋其它影像模型，保持主分組 `Default` 即可，本系列不需要任何專屬分組或額外配置。
</Tip>

## 技術規格

| 專案                  | 規格                                                |
| ------------------- | ------------------------------------------------- |
| 模型 ID               | `grok-imagine-image`、`grok-imagine-image-quality` |
| 寬高比                 | 5 種：`1:1` / `16:9` / `9:16` / `4:3` / `3:4`       |
| 解析度檔位               | `1k`（約 0.9–1.05 MP）、`2k`（約 4.2–4.5 MP）            |
| 輸出格式                | **1K 為 JPEG（約 220–300 KB）、2K 為 PNG（約 5–6 MB）**    |
| 單次張數                | `n` 1–10                                          |
| 參考圖                 | 編輯介面 **1–4 張**（`image[]` 重複傳入，傳 5 張返回 400）        |
| mask 局部重繪           | ❌ 不支援                                             |
| `seed` 可復現          | ❌ 不支援，結果不可復現                                      |
| `revised_prompt` 回顯 | ❌ 不返回                                             |
| 出圖耗時                | 1K 約 9 秒、2K 約 15–17 秒                             |
| 併發 / 速率             | 不限併發，**實測 100 RPM 無壓力**                           |
| 建議客戶端超時             | ≥ 360 秒                                           |

## 端點一覽

| 功能    | 方法     | 路徑                       | Content-Type              |
| ----- | ------ | ------------------------ | ------------------------- |
| 文生圖   | `POST` | `/v1/images/generations` | `application/json`        |
| 圖片編輯  | `POST` | `/v1/images/edits`       | **`multipart/form-data`** |
| 對話式出圖 | `POST` | `/v1/chat/completions`   | `application/json`        |

<Warning>
  **✅ 編輯介面必須用 `multipart/form-data` 檔案上傳**

  傳送 JSON 到 `/v1/images/edits` 會**固定返回 400**：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  這條對**照著上游廠商文件接入的客戶尤其重要**——上游文件寫的是 JSON + 公網圖片 URL 的形式，但在 API易 閘道上走不通，**請以本站文件為準**：用 `-F "image=@photo.jpg"` 上傳檔案。完整示例見 [圖片編輯 API](/zh-Hant/api-capabilities/grok-imagine-image/image-edit)。

  檔案欄位名只能是 `image` 或 `image[]`，寫成 `images` / `image_file` 會返回 415。
</Warning>

<Warning>
  **⚠️ 參考圖不要傳給文生圖介面**

  `/v1/images/generations` 收到 `image` / `image_url` / `images` 時**不會報錯**，而是返回 200 並按提示詞重新生成一張全新的圖，參考圖被完全忽略，**並且照常計費**。

  由於沒有任何錯誤訊號，這類問題往往要到發現"出的圖和輸入圖毫無關係"時才被察覺。**只要涉及參考圖，一律走 `/v1/images/edits`。**
</Warning>

<Tip>
  主域名 `https://api.apiyi.com`，備用域名 `https://vip.apiyi.com`。對話式出圖（`/v1/chat/completions`）可用但**不主推**，詳見下方常見問題。
</Tip>

## 從 GPT-Image-2 遷移

如果你已經接入了 [GPT-Image-2](/zh-Hant/api-capabilities/gpt-image-2/overview)，**端點和呼叫方式完全一樣**（`/v1/images/generations` + `/v1/images/edits`，OpenAI SDK 直連），但**引數體系是另一套**，直接換模型名跑不通。下面是必須改的地方。

### 引數對照

| 維度        | GPT-Image-2                                          | **Grok Imagine 2**            | 遷移動作                          |
| --------- | ---------------------------------------------------- | ----------------------------- | ----------------------------- |
| 輸出尺寸      | `size`（`1536x1024` 等具體畫素）                            | `aspect_ratio` + `resolution` | **必須改寫**，且 `size` 傳了不報錯       |
| 畫質檔位      | `quality`（`low`/`medium`/`high`/`auto`）              | 無此引數，**用模型名區分**               | 刪掉 `quality`，改選 `-quality` 型號 |
| 輸出格式      | `output_format`（png/jpeg/webp）+ `output_compression` | 無此引數，**格式由解析度決定**             | 刪掉；1K 固定 JPEG、2K 固定 PNG       |
| 背景        | `background`（`opaque`/`auto`）                        | 無此引數                          | 刪掉                            |
| 稽核強度      | `moderation`（`auto`/`low`）                           | 無此引數                          | 刪掉                            |
| 高保真       | 禁傳 `input_fidelity`                                  | 無此引數                          | 刪掉                            |
| 單次張數      | `n` **僅支援 1**                                        | `n` **支援 1–10**               | ✅ 可以去掉客戶端的併發出圖迴圈              |
| 編輯參考圖上限   | 16 張                                                 | **4 張**                       | ⚠️ 超過 4 張要改邏輯                 |
| mask 局部重繪 | ✅ 支援                                                 | ❌ **不支援**                     | ⚠️ 依賴 mask 的流程無法遷移            |
| 計費        | 按 token（high 檔約 \$0.21/張）                            | **按次固定** \$0.02 / \$0.045     | 預算模型從"按量"變"按張"                |

### 三個最容易踩的坑

<Warning>
  **1. 響應格式預設值是反的 —— 這條最容易漏**

  GPT-Image-2 **只返回 `b64_json`**（沒有 `url`），而 Grok Imagine 2 **預設返回 `url`**。如果你的解析程式碼寫的是 `resp.data[0].b64_json`，遷移後會拿到 `None` / `undefined`。

  兩個解法，二選一：

  * **保持原始碼不動** → 顯式傳 `"response_format": "b64_json"`
  * **改用直鏈** → 讀 `data[0].url` 再下載

  另外 GPT-Image-2 的 `usage` 是**真實 token 數**，Grok Imagine 2 的 `usage` 是**佔位值**（恆為 `1000 × n`）——如果你有基於 `usage` 做成本統計的指令碼，遷移後會算出錯誤的數字。
</Warning>

<Warning>
  **2. `size` 傳了不會報錯，只會靜默失效**

  GPT-Image-2 的引數校驗是嚴格的，傳錯通常直接 400。**Grok Imagine 2 的校驗很寬鬆**：`size`、`quality`、`style` 這些 OpenAI 習慣欄位傳進來一律**靜默忽略**，非法的 `aspect_ratio` / `resolution` 也會**靜默回退預設值**。

  也就是說，如果你只把 `model` 改了、`size: "1536x1024"` 忘了刪，請求會**返回 200 並出一張 1024×1024 的方圖**——沒有任何報錯提示你引數沒生效。

  遷移後請**先用一次呼叫核對輸出畫素**，確認 `aspect_ratio` / `resolution` 真的生效了。
</Warning>

<Warning>
  **3. 參考圖不能再傳給文生圖介面**

  這是本模型獨有的坑：給 `/v1/images/generations` 傳參考圖會 **200 出圖但靜默丟棄參考圖並照常計費**。任何涉及參考圖的呼叫都必須走 `/v1/images/edits`（`multipart/form-data`），詳見上方 [端點一覽](#端點一覽)。
</Warning>

### 遷移前後程式碼對照

```python theme={null}
# 遷移前：GPT-Image-2
resp = client.images.generate(
    model="gpt-image-2",
    prompt="賽博朋克城市雨夜",
    size="1536x1024",           # ← 刪掉
    quality="high",             # ← 刪掉
    output_format="jpeg"        # ← 刪掉
)
img = base64.b64decode(resp.data[0].b64_json)

# 遷移後：Grok Imagine 2
resp = client.images.generate(
    model="grok-imagine-image",           # 高畫質用 grok-imagine-image-quality
    prompt="賽博朋克城市雨夜",
    n=1,
    extra_body={
        "aspect_ratio": "16:9",           # ← 取代 size
        "resolution": "1k",               # ← 取代 quality 的尺寸含義
        "response_format": "b64_json"     # ← 顯式指定，保持解析程式碼不變
    }
)
img = base64.b64decode(resp.data[0].b64_json)
```

<Tip>
  **該選哪個？** 需要 mask 局部重繪、精確到畫素的自定義尺寸、或 16 張參考圖融合 → 繼續用 [GPT-Image-2](/zh-Hant/api-capabilities/gpt-image-2/overview)。想要**成本可預測**（按張固定價、2K 不加價）、**單次多圖**（`n` 最多 10）、或**編輯時高度保留原圖** → 用 Grok Imagine 2。兩者共存不衝突，同一把令牌都能調。
</Tip>

## 關鍵引數詳解

### `aspect_ratio` 與 `resolution`（輸出尺寸）

兩個引數組合決定實際輸出畫素。下表為實測值，與請求值精確吻合：

| `aspect_ratio` | `resolution: 1k` | `resolution: 2k` |
| -------------- | ---------------- | ---------------- |
| `1:1`          | 1024×1024        | 2048×2048        |
| `16:9`         | 1280×720         | 2816×1584        |
| `9:16`         | 720×1280         | 1584×2816        |
| `4:3`          | 1152×864         | 2368×1776        |
| `3:4`          | 864×1152         | 1776×2368        |

<Warning>
  **這兩個引數只在文生圖介面生效。** 在編輯介面 `/v1/images/edits` 上傳入不會報錯，但也**不起作用**——編輯結果的畫幅**跟隨第一張參考圖**（輸入 1280×720 就輸出 1280×720；多圖融合時把順序顛倒，畫幅會跟著新的第一張變）。需要改變畫幅請先自行裁剪參考圖。
</Warning>

<Info>
  **引數校驗很寬鬆，寫錯不會報錯**：傳入列舉外的 `aspect_ratio`（如 `5:7`、`21:9`）或 `resolution`（如 `1K`、`1024x1024`）都會**靜默回退預設值**並正常出圖。`response_format` 傳非法值同樣靜默回退為 `url`。所以拿到的圖不符合預期時，**先檢查引數拼寫**。

  唯一的例外是 `resolution: "4k"` —— 它會返回 `503 model_service_unavailable`，這是**該檔位不支援**，不是渠道故障，改回 `1k` / `2k` 即可。
</Info>

### `n`（單次出圖數量）

取值 **1–10**，返回的 `data` 陣列長度等於 `n`，按張計費。傳 `0` 會靜默按 `1` 處理；傳 `11` 及以上返回 400。

## 最佳實踐

<Steps>
  <Step title="先明確是「生成」還是「編輯」">
    沒有參考圖 → `/v1/images/generations`；有參考圖（哪怕只是想微調一處）→ `/v1/images/edits`。選錯端點不會報錯，只會拿到不符預期的圖。
  </Step>

  <Step title="客戶端超時設到 360 秒">
    圖片 API 是同步呼叫，2K 出圖約 15–17 秒，高峰或冷啟動時可能更久。按 60 秒配置會產生大量誤超時，而請求實際仍在計費。
  </Step>

  <Step title="用 aspect_ratio 控制構圖，不要寫進提示詞">
    引數是真實生效的，直接傳 `aspect_ratio: "16:9"` 比在提示詞裡寫「橫版構圖」可靠得多。
  </Step>

  <Step title="按頻寬選擇解析度檔">
    2K 是 PNG 無損、單張 5–6 MB，1K 是 JPEG、單張 220–300 KB，相差約 20 倍。移動端或需要批量回傳的場景優先 1K——反正兩檔同價（出 2K 反而更划算），選擇只取決於畫質與頻寬的權衡。
  </Step>

  <Step title="編輯時明確寫「其餘保持不變」">
    編輯指令建議寫成「把圍巾改成紅色，其餘部分完全保持不變」這種形式，模型對這類約束遵循度很好，能最大限度保留原圖。
  </Step>

  <Step title="多圖融合時在提示詞裡顯式指代">
    `image[]` 的上傳順序就是「圖1 / 圖2 / 圖3」，在提示詞裡寫明「把圖1的主體放進圖2的場景」，比讓模型自己猜要穩。
  </Step>

  <Step title="不要依賴 seed 做復現">
    本系列不支援 `seed`，同一提示詞兩次呼叫結果不同。需要固定素材請把出圖結果存下來，而不是指望重跑復現。
  </Step>

  <Step title="批量出圖直接併發">
    沒有併發限制，**實測 100 RPM 無壓力**，渠道資源充足。不需要自建佇列序列化，也不用額外申請配額。
  </Step>
</Steps>

## 錯誤碼與重試

| HTTP  | code                        | 含義                          | 處理建議                               |
| ----- | --------------------------- | --------------------------- | ---------------------------------- |
| `400` | `invalid_image_request`     | 編輯介面收到了 JSON 而非 multipart   | 改用 `multipart/form-data` 檔案上傳，不要重試 |
| `400` | `invalid_request`           | 引數非法**或**提示詞被內容稽核攔截         | 兩者同碼，先自查引數；引數無誤則調整提示詞              |
| `415` | —                           | 編輯介面的檔案欄位名不受支援              | 欄位名改為 `image` 或 `image[]`          |
| `429` | —                           | 頻率超限或額度不足                   | 指數退避重試，並檢查賬戶餘額                     |
| `503` | `model_service_unavailable` | 引數檔位不支援（如 `resolution: 4k`） | **不是渠道故障**，改回 `1k` / `2k`，不要重試     |
| `503` | —                           | 當前分組無可用渠道                   | 檢查令牌分組配置，見上方「分組介紹」                 |

<Info>
  **客戶端建議**：`400` 與 `415` 是確定性錯誤，重試沒有意義，應直接告警。只有 `429` 和網路層超時值得重試，建議指數退避、最多 3 次。

  注意 `400 invalid_request` 同時承載「引數錯誤」和「內容被稽核攔截」兩種語義，**錯誤體無法區分**。經驗判據是耗時：被稽核攔截通常在 5–6 秒返回，比正常出圖（約 9 秒）更快，因為攔截髮生在生成之前。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼我按廠商文件發 JSON 到 /v1/images/edits 就報 400？">
    因為 **API易 閘道的編輯介面只接受 `multipart/form-data`**，而上游廠商文件寫的是 JSON + 公網圖片 URL 的形式。這兩種口徑不一致，請以本站文件為準。

    正確寫法是檔案上傳：

    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/images/edits" \
      -H "Authorization: Bearer sk-your-api-key" \
      -F "model=grok-imagine-image" \
      -F "prompt=把圍巾改成紅色，其餘保持不變" \
      -F "image=@photo.jpg"
    ```

    好處是**不需要圖床**——直接傳本地檔案即可，比公網 URL 的方式更省事。完整示例見 [圖片編輯 API](/zh-Hant/api-capabilities/grok-imagine-image/image-edit)。
  </Accordion>

  <Accordion title="我給文生圖介面傳了參考圖，返回 200 但圖完全不對？">
    這是預期行為，也是本模型**最容易踩的坑**：`/v1/images/generations` 收到 `image` / `image_url` / `images` 時會**靜默忽略**它們，只按提示詞重新生成，並且**照常計費**。

    因為沒有任何錯誤訊號，很容易誤以為"編輯功能有問題"。**只要涉及參考圖，請改用 `/v1/images/edits`。**
  </Accordion>

  <Accordion title="編輯介面傳了 resolution / aspect_ratio 為什麼不生效？">
    編輯介面的輸出畫幅**跟隨輸入參考圖**：輸入 1280×720 就輸出 1280×720，輸入 1024×1024 就輸出 1024×1024。`resolution` 與 `aspect_ratio` 在這個端點上傳了不報錯也不起作用。

    需要改變輸出畫幅，請先自行裁剪或縮放參考圖再上傳。
  </Accordion>

  <Accordion title="響應裡為什麼沒有 revised_prompt？">
    本系列**不返回** `revised_prompt`，也不返回 `respect_moderation` 等欄位。`data[]` 裡每項只有 `url` 或 `b64_json` **二選一**（取決於 `response_format`），不會同時出現。

    解析響應時請不要假設這些欄位存在。
  </Accordion>

  <Accordion title="usage 裡的 token 數能用來核對賬單嗎？">
    **不能。** 響應體的 `usage.prompt_tokens` 恆為 `1000 × n`，與提示詞實際長度無關，是佔位值。

    本系列是**按次計費**（按張固定價），真實扣費請以 API易 控制台的賬單記錄為準。
  </Accordion>

  <Accordion title="為什麼 1K 出 JPEG、2K 出 PNG？體積差很多">
    這是上游的行為：`resolution: 1k` 返回 JPEG（約 220–300 KB），`resolution: 2k` 返回 PNG 無損（約 5–6 MB），體積相差約 20 倍。

    返回的 URL 副檔名、HTTP `Content-Type` 與實際位元組格式三者是一致的，可以直接按 `Content-Type` 分支處理。

    如果你的場景對頻寬敏感（移動端、批量回傳），建議用 `1k`——兩檔同價，純看畫質與頻寬取捨；反過來，追求畫質時選 `2k` 不加價、相對官網折扣更深。
  </Accordion>

  <Accordion title="傳 resolution: 4k 報 503，是渠道掛了嗎？">
    **不是。** `4k` 不是本系列支援的檔位，閘道會返回 `503 model_service_unavailable`。這個錯誤碼看起來像服務故障，但實際是引數問題，**重試無效**，改回 `1k` 或 `2k` 即可。

    支援的檔位只有 `1k` 和 `2k` 兩個。
  </Accordion>

  <Accordion title="為什麼引數寫錯了不報錯，只是圖不對？">
    本系列的引數校驗很寬鬆：非法的 `aspect_ratio`（如 `5:7`）、`resolution`（如 `1K`、`1024x1024`）、`response_format`（如 `base64`）都會**靜默回退到預設值**並正常出圖，不會返回 400。

    所以拿到的圖不符合預期時，**第一步先檢查引數拼寫**，特別注意 `resolution` 的值是小寫 `1k` / `2k`。
  </Accordion>

  <Accordion title="單次最多能出幾張？">
    `n` 支援 **1–10**，返回的 `data` 陣列長度等於 `n`，**按張計費**。

    傳 `0` 會靜默按 `1` 處理；傳 `11` 及以上返回 `400 invalid_request`。
  </Accordion>

  <Accordion title="支援 seed 復現嗎？">
    **不支援。** 傳入 `seed` 不會報錯，但也不生效——相同提示詞、相同 `seed` 的兩次呼叫會得到不同的圖。

    需要複用某張圖請把結果儲存下來，不要指望通過重跑復現。
  </Accordion>

  <Accordion title="能用 OpenAI 官方 SDK 直接呼叫嗎？">
    可以。兩個端點都相容 OpenAI Images API 格式，把 `base_url` 指向 `https://api.apiyi.com/v1` 即可：

    ```python theme={null}
    from openai import OpenAI
    client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

    resp = client.images.generate(
        model="grok-imagine-image",
        prompt="a red wooden boat on an alpine lake at dawn",
        extra_body={"aspect_ratio": "16:9", "resolution": "1k"}
    )
    ```

    注意 `aspect_ratio` / `resolution` 不是 OpenAI SDK 的標準欄位，需要放進 `extra_body` 傳遞。
  </Accordion>

  <Accordion title="有併發限制嗎？批量出圖會不會被限流？">
    **不限制併發。** 實測 **100 RPM 無壓力**，沒有 429、沒有排隊拒絕，渠道資源充足，可以直接併發呼叫，不需要自建序列佇列，也無需額外申請配額。

    真正要注意的是 **`timeout`**：圖片 API 是同步呼叫，建議客戶端超時設到 **360 秒**，避免請求還在正常處理就被本地超時掐斷——被掐斷的請求仍然會計費。
  </Accordion>

  <Accordion title="內容稽核是怎樣的？被攔了怎麼判斷？">
    本系列有內容稽核。被攔截時返回 `400 invalid_request`，**與引數錯誤使用完全相同的錯誤碼和提示文案**，從響應體無法區分。

    實用判據是**耗時**：稽核攔截通常在 5–6 秒返回（攔截髮生在生成之前），而正常出圖約 9 秒。另外，稽核結果具有一定隨機性，個別邊界內容多次重試的結果可能不一致，因此**不要根據單次結果就下判斷**。

    確認引數無誤後仍持續報 400，通常就是提示詞觸發了稽核，建議調整表述。
  </Accordion>

  <Accordion title="能用 /v1/chat/completions 對話方式出圖嗎？">
    可以，但**不主推**。該端點會返回標準的 chat 結構，`content` 是一個 markdown 圖片連結：

    ```text theme={null}
    ![image](https://apac.ossforai.com/...)
    ```

    適合 Chatbox / LobeChat 這類對話式客戶端直接接入。但**程式化呼叫請統一使用 Images API**（`/v1/images/generations` 與 `/v1/images/edits`）——引數更完整、響應結構更穩定，也與本文件的說明一致。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Grok Imagine 2 文生圖 API](/zh-Hant/api-capabilities/grok-imagine-image/text-to-image) - 帶 Playground 的介面參考
* [Grok Imagine 2 圖片編輯 API](/zh-Hant/api-capabilities/grok-imagine-image/image-edit) - 參考圖編輯與多圖融合
* [Grok 系列模型呼叫指南](/zh-Hant/api-capabilities/grok/overview) - xAI 文本模型
* [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) - 超時、斷連、壓縮通用建議
* [API 使用手冊](/zh-Hant/api-manual)
* [充值加贈活動](/zh-Hant/faq/recharge-promotions)
