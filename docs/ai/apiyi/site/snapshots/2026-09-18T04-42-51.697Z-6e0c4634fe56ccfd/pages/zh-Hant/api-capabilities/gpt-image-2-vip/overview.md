> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-VIP 生圖/編輯

> GPT 影像生成 Adobe 官逆模型（Firefly 線路） gpt-image-2-vip 及 2.5 姐妹模型 gpt-image-2.5-flare-vip / gpt-image-2.5-sunburst-vip，$0.03/張統一價，支援 10 比例 × 3 檔解析度（1K/2K/4K）共 30 檔常見 size，呼叫方式與 gpt-image-2-all 一致；約 90–150 秒出圖，適合需要穩定鎖定輸出尺寸的場景。

<Info>
  **`size` 引數已恢復可用**（2026-07-22 更新）：顯式傳入 `size` 即可正常鎖定輸出尺寸，本頁 30 檔對照表恢復生效。注意：`size` 僅在 `/v1/images/generations` 與 `/v1/images/edits` 端點生效，**`/v1/chat/completions` 聊天補全端點不支援 `size` 引數**，對話方式出圖無法鎖尺寸。最新狀態以 [即時動態](/live) 欄目為準。
</Info>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

## 概述

**gpt-image-2.5-vip**（別名，指向 `gpt-image-2.5-sunburst-vip`）、**gpt-image-2.5-flare-vip** 與上一代 **gpt-image-2-vip** 是 API易 平臺的 **GPT 影像生成 Adobe 官逆模型（Firefly 線路）**——高品質的 GPT-Image 2.5 逆向資源，不是低品質的超分。與 [`gpt-image-2.5-all`](/zh-Hant/api-capabilities/gpt-image-2-all/overview) 同價 **\$0.03/張**，**呼叫方式完全一致**，最大區別是 **支援 `size` 引數**——覆蓋 **10 比例 × 3 解析度檔（1K Fast / 2K Recommended / 4K Detail）共 30 檔常見尺寸**，含 4K。

<Note>
  **🎨 核心定位**：當你需要**鎖定輸出尺寸**（電商主圖、海報模板、影片封面、4K 桌布等）時使用 `gpt-image-2.5-vip`。請求體裡只需把 `model` 改成 `gpt-image-2.5-vip`、加一個 `size` 欄位，其它程式碼與 `gpt-image-2.5-all` **完全相同**。
</Note>

<Note>
  **三款 -vip 一家人**：`gpt-image-2.5-vip`（別名，指向 `gpt-image-2.5-sunburst-vip`）、`gpt-image-2.5-flare-vip` 與上一代 `gpt-image-2-vip` 走同一條 Adobe 官逆線路，**價格（\$0.03/張按次）、分組（`Default` / `image2_OSS` / `svip`）、端點、呼叫方式完全相同**，換 `model` 即可互切。flare-vip 更快、畫面偏軟；sunburst-vip 畫質與編輯精度更高，人眼與 `gpt-image-2-vip` 接近。三款的引數邊界與實測差異見下方「三款 -vip 對比」一節。
</Note>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/gpt-image-2-vip/text-to-image">
    `/v1/images/generations`，輸入文本提示詞 + `size` 生成指定尺寸圖片。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/gpt-image-2-vip/image-edit">
    `/v1/images/edits`，multipart 上傳參考圖 + 編輯/融合指令。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、base64 渲染、上傳壓縮、`size` 的 30 個合法檔位這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 gpt-image-2.5-vip 系列的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 gpt-image-2.5-vip 的「文生圖 + 圖片編輯」（`gpt-image-2.5-flare-vip` / `gpt-image-2-vip` 同價同調用，模型名做成配置項方便切換）。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/gpt-image-2-vip/overview.md](https://docs.apiyi.com/api-capabilities/gpt-image-2-vip/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：客戶端 timeout 提到 360 秒兜底。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費，所以寧可多等也不要過早超時。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬，任何一層小於生成時間都會掐斷請求。

  2. 返回渲染：預設返回 base64（`b64_json`，不帶 `data:` 字首），也可以顯式傳 `response_format: "url"` 拿 CDN 直鏈。**請顯式傳 `response_format`，不要依賴預設值**——歷史上預設行為隨分組和負載變化過。走 base64 就要能渲染展示並提供「儲存到本地」；走 url 則要注意連結約 24 小時後失效，必須服務端立即下載轉存。同一條 `data[]` 裡只會有 `url` 和 `b64_json` 其中一個，解析時兩種都要兜住。

  3. 上傳壓縮：調 `/v1/images/edits`（multipart）前先壓縮參考圖——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；多圖時合計控制在 6MB 以內，單圖不要超過 10MB。某張圖壓縮失敗就回退用原圖繼續，不要因為壓縮失敗中斷整個請求。

  4. 尺寸引數：`size` 只能填本頁列出的 **30 個檔位之一**（1K / 2K / 4K 各 10 檔）或者 `auto`，寫法是小寫半形 `x`，比如 `1536x1024`——不要寫成全形乘號、也不要大寫 `X`，表外的尺寸不會報錯但會被對齊改寫（16 倍數對齊、過小抬到最小邊），拿到的尺寸可能與請求不同。請把這 30 檔做成前臺的解析度下拉，別讓使用者自由填。`quality` 可以傳 `low` / `medium` / `high` / `xhigh` / `max`（`xhigh` / `max` 只有 2.5 兩款接受，`gpt-image-2-vip` 傳了會被拒；不要依賴 `auto`；注意 2.5 的 `high` 只相當於 `gpt-image-2-vip` 的 `medium`、2.5 的 `max` 才等於它的 `high`）；`n` / `aspect_ratio` 不要帶（傳 `n=3` 會按 3 張扣費但仍然只返回 1 張圖）；`mask` 不做精確局部重繪，需要就走官轉。如果你需要控制 `size`，就必須走 `/v1/images/generations` 或 `/v1/images/edits`，`/v1/chat/completions` 端點不支援 `size`。

  5. Key 從環境變數 `APIYI_API_KEY` 讀，base\_url 用 [https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進](https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進) git。

  6. 限流：RPM 500 以內不用做併發限制。遇到 429 先看 error.message：引數被拒就改引數；上游飽和就退避重試，或檢視 [https://docs.apiyi.com/live。](https://docs.apiyi.com/live。)

  7. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                     | 擋掉的坑                                                                                                                              |
  | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
  | timeout 提到 360 秒       | 主流 HTTP 客戶端預設 30-60 秒超時，會在服務端還在正常出圖時掐斷請求，而**斷連的請求照常計費**。詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) |
  | 顯式傳 `response_format`  | 預設值歷史上變過；不顯式指定就得同時兜住 `url` 和 `b64_json` 兩種形態                                                                                      |
  | `size` 鎖定 30 檔         | 表外尺寸會被改寫成別的尺寸；寫成全形乘號或大寫 `X` 不合法                                                                                                   |
  | `quality` 按模型選檔、不傳 `n` | 2.5 兩款六檔全開，`gpt-image-2-vip` 傳 `xhigh` / `max` 會被拒；2.5 的 `high` 只等於 `gpt-image-2-vip` 的 `medium`；傳 `n=3` 會按 3 張扣費但只返回 1 張圖        |
  | 429 先看 `error.message` | 引數被拒和上游飽和共用 429，處理方式不同                                                                                                            |
  | 上傳前壓縮                  | 手機原圖動輒 4-5MB，base64 編碼後還會再膨脹約 33%。壓縮標準見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)                    |
</Accordion>

## 與 `gpt-image-2-all` 的關鍵差異

`gpt-image-2-vip` 與 [`gpt-image-2-all`](/zh-Hant/api-capabilities/gpt-image-2-all/overview) 同屬逆向通道、同價、同套呼叫程式碼。**互相對映**——把同一段請求裡的 `model` 欄位從一個換成另一個，行為整體一致，差異如下：

| 維度                    | `gpt-image-2-all`                        | `gpt-image-2-vip`                                                                                                                     |
| --------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **渠道**                | 逆向 ChatGPT 官網                            | Adobe 官逆線路（Firefly）                                                                                                                   |
| **價格**                | \$0.03 / 張                               | \$0.03 / 張（所有 size 統一價）                                                                                                               |
| **`size` 引數**         | ❌ 不接受（寫進 prompt）                         | ✅ 30 檔 size，含 4K                                                                                                                      |
| **4K（如 `3840x2160`）** | ❌                                        | ✅ 4K Detail 檔                                                                                                                         |
| **出圖速度**              | 約 30–60 秒                                | 約 90–150 秒（與官轉 `gpt-image-2` 持平）                                                                                                      |
| **`quality` 引數**      | ❌ 不接受                                    | ✅ 實測生效、不承諾：2.5 兩款 `auto` / `low` / `medium` / `high` / `xhigh` / `max` 六檔全開（`xhigh` / `max` 2026-09-10 放開），`gpt-image-2-vip` 到 `high` |
| **支援端點**              | `/images/generations` + `/images/edits`  | 同左（一模一樣）                                                                                                                              |
| **響應格式**              | `b64_json`（預設，純 base64 無字首）/ `url`（顯式傳參） | 同左                                                                                                                                    |
| **適合場景**              | 提示詞驅動、對尺寸不敏感                             | 需要穩定指定輸出尺寸（含 4K）                                                                                                                      |

<Tip>
  **一句話決策**：**不需要嚴格控尺寸、追求出圖速度** → `gpt-image-2-all`；**要鎖死輸出尺寸或要 4K** → `gpt-image-2-vip`；**需要畫質引數 `quality` 或 OpenAI 官方完全對齊的欄位** → 改用官方版 [`gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview)。
</Tip>

## 三款 -vip 對比（2026-09-09 實測）

同渠道、同令牌、只換模型名的三臂對比 253 次，加序列邊界用例 26 次。三款契約逐格一致，差異只在下表標出的幾行；`quality` / 透明背景這兩項 `gpt-image-2-vip` 歷史上不接受、本次實測已接受，**屬渠道行為、不作承諾，以實際返回為準**。

| 項                           | `gpt-image-2-vip`                                                           | `gpt-image-2.5-flare-vip`                                                                    | `gpt-image-2.5-sunburst-vip`（別名 `gpt-image-2.5-vip`） |
| --------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 定位                          | 上一代                                                                         | 2.5 速度優先                                                                                     | 2.5 畫質與編輯精度優先                                        |
| 價格 / 分組                     | \$0.03/張按次；`Default` / `image2_OSS` / `svip`                                | 同左                                                                                           | 同左                                                   |
| `quality`                   | ✅ `auto` / `low` / `medium` / `high`；`xhigh` / `max` ❌                      | ✅ 六檔全開：`auto` / `low` / `medium` / `high` / `xhigh` / `max`（`xhigh` / `max` 2026-09-10 複測放開） | 同 flare-vip                                          |
| 輸出 token（2048×1152）         | low 157 / medium 1,413 / high 5,650                                         | low 157 / medium 367 / high 1,413 / xhigh 2,511 / max 5,650                                  | 同 flare-vip                                          |
| 檔位怎麼對齊                      | —                                                                           | 2.5 的 `high` = 2-vip 的 `medium`，2.5 的 `max` = 2-vip 的 `high`；三款最高檔 token 相同                  | 同 flare-vip                                          |
| 預設 `size`                   | 2048×2048                                                                   | **1024×1536 豎版**                                                                             | 2048×2048                                            |
| 30 檔 `size`                 | 30/30 逐畫素命中                                                                 | 30/30                                                                                        | 30/30                                                |
| 表外 `size`                   | 不報錯：16 倍數原樣，非 16 倍數對齊（`1920x1080` → 1920×1088），過小抬到最小邊（`512x512` → 816×816） | 同左                                                                                           | 同左                                                   |
| `mask`                      | ⚠️ 接受但整圖重繪，真實照片三次內外改動比 ≈1                                                   | 同左                                                                                           | 同左                                                   |
| `background: "transparent"` | ✅ 返回帶 alpha 的 PNG                                                           | ✅ 單物體提示詞四角全透明                                                                                | ✅ 同 flare-vip                                        |
| `output_format: "jpeg"`     | 靜默忽略，仍回 PNG                                                                 | 同左                                                                                           | 同左                                                   |
| `n`                         | 只回 1 張，不要傳                                                                  | 同左                                                                                           | 同左                                                   |
| `response_format: "url"`    | ✅                                                                           | ✅                                                                                            | ✅                                                    |
| 編輯端點                        | 單圖沿用輸入尺寸，多圖以第一張定畫幅                                                          | 同左                                                                                           | 同左                                                   |
| 畫質（人眼，6 組同尺寸提示詞）            | 基準                                                                          | 偏軟、裝飾細節少                                                                                     | 與 2-vip 接近                                           |
| 1024² 耗時（序列）                | 約 90–150 秒                                                                  | 22～138 秒                                                                                     | 37～120 秒                                             |

<Tip>
  **怎麼選**：日常文生圖預設 `gpt-image-2.5-vip`；要最快選 `gpt-image-2.5-flare-vip`；要最高 token 檔 2.5 傳 `max`、`gpt-image-2-vip` 傳 `high`（token 量相同）。三款都不做精確 mask，這一項走官轉 [GPT-Image-2.5 / 2](/zh-Hant/api-capabilities/gpt-image-2/overview)。預設尺寸隨上游變動過，要鎖尺寸一律顯式傳 `size`。
</Tip>

## 核心特性

<CardGroup cols={2}>
  <Card title="穩定鎖定輸出尺寸" icon="expand">
    `size` 欄位直接接受 30 檔常見尺寸，電商主圖、海報模板、4K 桌布都能嚴格輸出
  </Card>

  <Card title="4K 高解析度" icon="image">
    4K Detail 檔支援 2880×2880 / 3840×2160 / 3840×1632 等，適合大尺寸交付物
  </Card>

  <Card title="所有 size 統一價" icon="dollar-sign">
    1K / 2K / 4K 所有檔位統一 \$0.03/張，4K 不額外加價
  </Card>

  <Card title="呼叫方式同 -all" icon="copy">
    請求結構、欄位、響應欄位與 `gpt-image-2-all` 完全一致，可秒級切換模型名
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="文字還原度高" icon="type">
    圖內中英文、招牌、海報文字還原穩定，適合資訊圖與營銷物料
  </Card>

  <Card title="中文提示詞友好" icon="languages">
    原生理解中文描述，無需翻譯即可獲得高品質輸出
  </Card>

  <Card title="自然語言改圖" icon="message-circle">
    支援通過對話描述直接改圖，無需蒙版，可多輪迭代
  </Card>

  <Card title="標準端點相容" icon="plug">
    相容 OpenAI Images API 標準端點 `/images/generations`、`/images/edits`
  </Card>
</CardGroup>

## 模型定價

| 模型名                                                  | 計費方式 | 價格             | 輸出                                              |
| ---------------------------------------------------- | ---- | -------------- | ----------------------------------------------- |
| `gpt-image-2-vip`                                    | 按次計費 | **\$0.03 / 張** | 單次返回 1 張圖片，`size` 欄位鎖定輸出尺寸                      |
| `gpt-image-2.5-flare-vip`                            | 按次計費 | **\$0.03 / 張** | GPT-Image 2.5 速度優先版，引數面同 `-vip`（`quality` 六檔全開） |
| `gpt-image-2.5-sunburst-vip`（別名 `gpt-image-2.5-vip`） | 按次計費 | **\$0.03 / 張** | GPT-Image 2.5 畫質與編輯精度優先版，引數面同 flare-vip         |

<Info>
  **計費說明**：

  * **所有 30 檔 size 統一定價 \$0.03/張**——4K Detail 不加價
  * 失敗請求不計費（如鑑權失敗、引數校驗失敗）
  * 如需生成 N 張，客戶端並行呼叫 N 次
</Info>

## 分組介紹

`gpt-image-2-vip` 放在 **`Default` 預設分組** 即可，不需要額外切分組。逆向通道目前供給穩定，不存在像官轉那樣需要"企業分組"過渡的場景。

| 模型                                                                             | 分組                                | 備註                                               |
| ------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------ |
| `gpt-image-2-vip`                                                              | `Default`                         | Adobe 官逆線路（Firefly），統一 \$0.03/張，約 90–150 秒出圖     |
| `gpt-image-2-vip`                                                              | `image2_OSS`                      | **1x 倍率（不加價）**，確定性 URL 輸出——預設分組資源緊張時不會降級為 base64 |
| `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` / `gpt-image-2.5-vip` | `Default` / `image2_OSS` / `svip` | 與 `gpt-image-2-vip` 分組完全相同                       |

### 需要確定性 URL 輸出 → 切到 `image2_OSS` 分組

`gpt-image-2-vip`（及 `gpt-image-2-all`）在預設分組下**實測（2026-07）不傳 `response_format` 時返回 `b64_json`**；顯式傳 `response_format: "url"` 可拿到圖片 URL。但預設分組的輸出格式**不做承諾**——歷史上曾預設返回 `url`、資源緊張時降級為 `b64_json`，行為隨負載與渠道版本變化過。

如果你的業務**強依賴 URL 輸出**（直接把 URL 落庫、前端按 URL 渲染、不接受 base64），請把令牌分組切到 **`image2_OSS`**——這是專為 **URL 輸出確定性**設計的分組，**1x 倍率（不加價）**，對 `gpt-image-2-vip` 和 `gpt-image-2-all` 兩個官逆模型都生效，保證響應穩定輸出圖片 URL，不會降級為 base64。

<Frame caption="令牌建立：計費模式選「按量優先」，分組選 image2_OSS（1x）——需要確定性 URL 輸出時使用">
  <img src="https://mintcdn.com/apiyillc/eNGQJU-a_dFb12gU/images/image2-oss-token-setup-20260525.png?fit=max&auto=format&n=eNGQJU-a_dFb12gU&q=85&s=727f61464cc759006a59e8de6ceccd32" alt="令牌建立介面：計費模式「按量優先」，選擇分組 image2_OSS（1x 倍率），支援輸出為圖片 URL 的分組，適合 gpt-image-2-all 與 gpt-image-2-vip" width="1278" height="846" data-path="images/image2-oss-token-setup-20260525.png" />
</Frame>

<Tip>
  **進階玩法（同時使用 `gpt-image-2-all` 與官轉 `gpt-image-2`）**：如果你的令牌同時覆蓋逆向兩模與官轉 `gpt-image-2`，可以在令牌的「分組優先順序」裡這樣配——

  * **第一優先順序**：`image2Enterprise`（1.2x 企業分組，官轉專用穩定通道）
  * **預設（兜底）**：`Default`（逆向兩模都在這裡，按模型路由）

  這樣官轉 `gpt-image-2` 走企業分組保穩，逆向兩模仍走預設分組——一把令牌覆蓋三種模型，互不干擾。
</Tip>

📖 關於 `image2Enterprise` 企業分組：[/live/2026-04/image2-enterprise](/live/2026-04/image2-enterprise)

## 技術規格

| 維度               | 引數                                                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **模型名**          | `gpt-image-2-vip`；2.5 版本 `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`（別名 `gpt-image-2.5-vip`）                                                                                                |
| **渠道性質**         | 官方逆向（Adobe 官逆線路（Firefly））                                                                                                                                                                                |
| **定價**           | \$0.03 / 張，按次計費（所有 size 統一價）                                                                                                                                                                             |
| **出圖速度**         | `gpt-image-2-vip` 約 **90–150 秒**；2.5 兩款 1024² 序列實測 22～140 秒，波動大。RPM 500 以內無需考慮併發。若遇到 `429`，先看 `error.message`：引數被拒（`quality must be one of…`）改引數即可；`當前分組上游負載已飽和` 屬偶發，退避重試即可，或聯絡客服諮詢模型狀態、檢視 [即時動態](/live) |
| **`size` 引數**    | ✅ 30 檔：10 比例 × 3 解析度檔（1K Fast / 2K Recommended / 4K Detail）                                                                                                                                              |
| **4K 支援**        | ✅ 4K Detail 檔（如 `3840x2160` / `2880x2880`）                                                                                                                                                               |
| **`quality` 引數** | 三款 ✅ 實測生效，屬渠道行為不承諾：2.5 兩款 `auto` / `low` / `medium` / `high` / `xhigh` / `max` 六檔全開（`xhigh` / `max` 2026-09-10 放開），`gpt-image-2-vip` 到 `high`；同名檔位 token 量 2.5 低一檔（見上方對照表）                               |
| **`mask` 引數**    | ⚠️ 三款接受但不保證只改蒙版區（真實照片實測整圖重繪），精確局部重繪走官轉                                                                                                                                                                   |
| **透明背景**         | ✅ 三款 `background: "transparent"` 返回帶 alpha 的 PNG（不承諾）                                                                                                                                                    |
| **預設 `size`**    | `gpt-image-2-vip` / sunburst-vip 2048×2048，flare-vip 1024×1536；隨上游變動，以實際返回為準                                                                                                                             |
| **`n` 引數**       | ❌ 不支援，單次僅返回 1 張                                                                                                                                                                                          |
| **預設響應格式**       | `b64_json`（純 base64，**無 `data:` 字首**，2026-07 實測；建議顯式傳 `response_format`）                                                                                                                                 |
| **可選響應格式**       | `url`（R2 CDN 加速連結，**預設 1 天有效期**，需顯式傳 `response_format: "url"`）                                                                                                                                           |
| **中文提示詞**        | ✅ 原生支援                                                                                                                                                                                                   |
| **支援能力**         | 文生圖、單圖編輯、多圖融合、自然語言改圖                                                                                                                                                                                     |

<Warning>
  **⏰ 圖片 URL 有效期：預設 1 天**

  `url` 模式響應的 `url` 欄位是 R2 CDN 加速連結，**有效期約 24 小時**，過期後訪問會 404。需要長期儲存的圖片請**在生成後儘快轉存到自己的物件儲存 / CDN / 資料庫**，或改用 `b64_json` 響應格式。
</Warning>

## 端點一覽

`gpt-image-2-vip` 與 `gpt-image-2-all` 相容**完全相同**的兩個端點。把 `model` 欄位換掉、按需加上 `size` 即可：

| 端點                            | 用途            | Content-Type          | 適用場景                                     |
| ----------------------------- | ------------- | --------------------- | ---------------------------------------- |
| `POST /v1/images/generations` | 文生圖           | `application/json`    | OpenAI Images API 標準格式，方便同一套程式碼同時呼叫官轉與官逆 |
| `POST /v1/images/edits`       | 圖片編輯（單圖 / 多圖） | `multipart/form-data` | OpenAI Images API 標準格式，方便同一套程式碼同時呼叫官轉與官逆 |

<Tip>
  **統一使用 OpenAI Images API**（`/v1/images/generations` + `/v1/images/edits`），理由有二：

  1. **更穩定**：上游對 Images API 通道的資源供給更充足，呼叫成功率更高
  2. **相容官轉，便於切換**：與官轉 [`gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview) 呼叫方式、`size` 等引數完全相容——遇到官逆通道風控異常時，**只需更換 `model` 名即可切換**，業務程式碼零改動

  另有對話式端點（`/v1/chat/completions`，不主推），見下方「常見問題」。
</Tip>

<Tip>
  **域名選擇**：`api.apiyi.com` 為主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平臺提供的其他閘道域名，響應行為一致。
</Tip>

## 支援的 size（30 檔完整對照表）

`gpt-image-2-vip` 支援 **10 個比例 × 3 個解析度檔 = 30 檔** 常見尺寸。請求體直接傳 `size: "寬x高"`（半形小寫 `x`）。

### 1K Fast — 草稿與低成本試稿

| 比例   | 命名       | 畫素          |
| ---- | -------- | ----------- |
| 1:1  | Square   | `1280x1280` |
| 2:3  | Portrait | `848x1280`  |
| 3:2  | Photo    | `1280x848`  |
| 3:4  | Portrait | `960x1280`  |
| 4:3  | Standard | `1280x960`  |
| 4:5  | Social   | `1024x1280` |
| 5:4  | Large    | `1280x1024` |
| 9:16 | Story    | `720x1280`  |
| 16:9 | Wide     | `1280x720`  |
| 21:9 | Cinema   | `1280x544`  |

### 2K Recommended — 預設推薦檔（多數終稿）

| 比例   | 命名       | 畫素          |
| ---- | -------- | ----------- |
| 1:1  | Square   | `2048x2048` |
| 2:3  | Portrait | `1360x2048` |
| 3:2  | Photo    | `2048x1360` |
| 3:4  | Portrait | `1536x2048` |
| 4:3  | Standard | `2048x1536` |
| 4:5  | Social   | `1632x2048` |
| 5:4  | Large    | `2048x1632` |
| 9:16 | Story    | `1152x2048` |
| 16:9 | Wide     | `2048x1152` |
| 21:9 | Cinema   | `2048x864`  |

### 4K Detail — 大尺寸交付物

| 比例   | 命名       | 畫素          |
| ---- | -------- | ----------- |
| 1:1  | Square   | `2880x2880` |
| 2:3  | Portrait | `2336x3520` |
| 3:2  | Photo    | `3520x2336` |
| 3:4  | Portrait | `2480x3312` |
| 4:3  | Standard | `3312x2480` |
| 4:5  | Social   | `2560x3216` |
| 5:4  | Large    | `3216x2560` |
| 9:16 | Story    | `2160x3840` |
| 16:9 | Wide     | `3840x2160` |
| 21:9 | Cinema   | `3840x1632` |

<Info>
  **30 檔統一價**：所有檔位都是 \$0.03/張，4K Detail 不額外加價。
</Info>

<Tip>
  **怎麼選檔位**：

  * **1K Fast**：用於草稿、縮圖、A/B 測試，省時（也不省錢，價格統一），出圖最快。
  * **2K Recommended**：**預設檔**，覆蓋大部分終稿場景（電商主圖、海報、資訊圖）。
  * **4K Detail**：印刷、大屏桌布、影片封面、桌面 / 戶外大圖。
</Tip>

**最小呼叫示例**（只傳 `size`，**不要傳 `quality`**）：

```bash theme={null}
curl "https://api.apiyi.com/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $YI_API_KEY" \
  -d '{
    "model": "gpt-image-2.5-vip",
    "prompt": "生成一張白色陶瓷馬克杯放在灰色桌面上的產品圖，柔和自然光，簡潔背景",
    "size": "2048x1360"
  }'
```

## 最佳實踐

<Steps>
  <Step title="輸入圖先壓到 1.5MB 以內（圖生圖 / 多圖融合）">
    上傳給介面的每張圖先壓到 **1.5MB 以內**（JPEG 品質 80-90 / 解析度適當下調），多圖融合時也按這個標準逐張控制。偶發的 `shell_api_error` / `Unknown error` 大多就是圖片體積過大觸發的，壓一下請求成功率和出圖速度都會明顯改善。**輸出解析度由 `size` 欄位決定，與輸入圖體積無關**——壓小輸入只會提速、不會損畫質。提示詞裡光寫 `4K` / `8K` 這類詞也不會真給你 4K，畫質看 `size`，不看 prompt 修飾詞。
  </Step>

  <Step title="按交付物檔位選 size">
    草稿用 1K Fast、終稿用 2K Recommended、印刷/大屏用 4K Detail。所有檔位統一價，按需要選。
  </Step>

  <Step title="size 用半形小寫 x">
    請求體寫 `"size": "1536x1024"`，不是 `1536×1024`、不是大寫 `X`。
  </Step>

  <Step title="quality 可傳到 high，不要傳 n">
    三款 -vip 實測接受 `quality`（不承諾）：2.5 兩款六檔全開（`xhigh` / `max` 2026-09-10 放開），`gpt-image-2-vip` 到 `high`，傳 `xhigh` / `max` 會被拒；2.5 的 `high` 只相當於 `gpt-image-2-vip` 的 `medium`，2.5 的 `max` 才等於它的 `high`。`n` 單次僅返回 1 張圖，多張請客戶端並行呼叫。
  </Step>

  <Step title="超時設到 300 秒">
    出圖典型 90–150s，疊加圖片上傳/下載與高峰長尾，**保守按 300s 配**，避免大量誤超時。
  </Step>

  <Step title="響應格式按需選擇">
    Web 應用直接渲染用 `b64_json`，服務端中轉儲存用 `url`。
  </Step>

  <Step title="程式碼可與 -all 共用">
    同一套呼叫程式碼，把 `model` 在 `gpt-image-2-all` ↔ `gpt-image-2-vip` 之間切換即可。需要鎖尺寸時切到 -vip，需要更快出圖時切回 -all。
  </Step>
</Steps>

## 錯誤碼與重試

| 狀態碼          | 含義                            | 建議                                                                                                                                       |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `400`        | size 取值不在 30 檔內或格式錯誤          | 用上表中的精確字串                                                                                                                                |
| `401`        | 令牌無效                          | 檢查 Bearer Token                                                                                                                          |
| `429`        | 引數被拒 / 上游偶發飽和 / 額度不足          | RPM 500 以內無需考慮併發。若遇到 `429`，先看 `error.message`：引數被拒（`quality must be one of…`）改引數即可；`當前分組上游負載已飽和` 屬偶發，退避重試即可，或聯絡客服諮詢模型狀態、檢視 [即時動態](/live) |
| `500`（4K 偶發） | OpenAI 上游算力波動，4K Detail 檔較易觸發 | **優先降到 2K Recommended 檔**重試；必須 4K 時改用官轉 [`gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview) + `image2Enterprise` 企業分組        |
| `5xx`（其它）    | 閘道/後端臨時錯誤                     | 重試 1–2 次                                                                                                                                 |
| 超時           | 上游高峰 + 4K 長尾                  | 客戶端設定 **≥ 300s 超時**（保守值）                                                                                                                 |

<Info>
  **建議客戶端**：

  * 請求超時 **300 秒** 起步（保守值；典型 90–150s，但 4K Detail + 高峰長尾會更長）
  * 對 5xx 與超時做 **指數退避重試**（建議 2–3 次）
  * 記錄響應頭 `request-id` 方便排查
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="vip 和 -all 呼叫程式碼可以共用嗎？">
    **可以，幾乎完全一樣。** 兩個端點（`/v1/images/generations`、`/v1/images/edits`）的請求欄位、響應欄位、`b64_json` 字首行為都一致。差異只有兩處：

    1. `model` 欄位：`gpt-image-2-vip` ↔ `gpt-image-2-all`
    2. `size` 欄位：vip 接受 30 檔常見尺寸；-all 不接受 `size`，尺寸要寫進 prompt

    實際工程實踐：保留同一套程式碼，做一個 `if model == 'vip': payload['size'] = ...` 的開關即可。
  </Accordion>

  <Accordion title="vip 出圖為什麼這麼慢？">
    `gpt-image-2-vip` 走的是 Adobe 逆向通道（Firefly），**典型 90–150 秒**，與官轉 `gpt-image-2`（100–120 秒）持平，比 ChatGPT 網頁線路的 `gpt-image-2-all`（約 30–60 秒）慢。如果對**響應延遲敏感**，建議優先用 `gpt-image-2-all`；只在**必須鎖尺寸或 4K** 時切換到 vip。
  </Accordion>

  <Accordion title="size 必須嚴格按表裡寫嗎？傳 1024x768 會怎麼樣？">
    **建議嚴格用表裡 30 檔之一**。2026-09-09 實測表外尺寸不再報錯，而是被改寫後出圖：16 倍數的會原樣保留（如 `1024x1024` / `1600x1600`），不是 16 倍數的對齊到 16（`1920x1080` → 1920×1088），過小的抬到最小邊（`512x512` → 816×816）。拿到的尺寸可能與請求不同，需要嚴格尺寸時仍按 30 檔傳。
  </Accordion>

  <Accordion title="4K 呼叫為何頻繁報 500？怎麼穩定出 4K？">
    **現象**：在 4K Detail 檔（如 `3840x2160` / `2880x2880`）較容易觸發 `status_code: 500` 錯誤，上游返回 `invalid_request_error`：

    ```json theme={null}
    {
      "status_code": 500,
      "error": {
        "message": "An error occurred while processing your request. ... Please include the request ID xxxxxxxx in your message.",
        "type": "invalid_request_error",
        "code": null
      }
    }
    ```

    **根因**：**OpenAI 算力波動**，與請求引數本身無關——同一段請求換 2K 檔大機率就過了。逆向通道對 4K 這種大輸出的負載更敏感，高峰期更明顯。

    **應對建議**（按價效比排序）：

    1. **優先改用 2K Recommended 檔**（如 `2048x1360` / `2048x2048`）—— 2K 成功率顯著更高，價格同樣 **\$0.03/張**
    2. **圖生圖 / 多圖融合少傳輸入圖** —— 逆向鏈路對多入圖請求處理壓力大，會進一步增加 4K 失敗率；單張輸入圖先壓到 **1.5MB 以內**也有幫助
    3. **如必須穩定出 4K** —— 切換到官轉模型 [`gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview) + **`image2Enterprise` 企業分組**。官轉 4K 價格更高（**約 \$0.3+/張**），但穩定性顯著更好，適合對 4K 交付有硬要求的場景。

    📖 經驗來源：[/live/2026-05/gpt-image-2-vip-4k-tips](/live/2026-05/gpt-image-2-vip-4k-tips)
  </Accordion>

  <Accordion title="輸入圖要壓縮嗎？提示詞裡寫 4K / 8K 有用嗎？">
    **強烈建議壓**。單張輸入圖壓到 **1.5MB 以內**（JPEG 品質 80-90 / 解析度適當下調）：偶發的 `shell_api_error` / `Unknown error` 大多就是圖片體積過大觸發的，壓一下請求成功率和出圖速度都會明顯改善。注意 1.5MB 是**推薦上限**（追求穩定性與速度），上面 FAQ 寫的 10MB 是閘道硬上限。

    **別擔心壓輸入會損畫質**——本模型輸出解析度由 `size` 引數決定，跟你上傳圖的體積沒關係。壓小輸入只會提速、不會損畫質。

    **提示詞裡光寫 `4K` / `8K` 這類詞也不會真給你 4K**。如果 prompt 寫 `8K 超清` 但 `size` 選 `1024x1024`，最終拿到的就是 1K 水平。**要 4K 請在 `size` 欄位裡指定**——30 檔裡 1K / 2K / 4K 同價 \$0.03/張，按需要直接選。

    📖 排錯來源：[/live/2026-05/gpt-image-2-vip-unknown-error](/live/2026-05/gpt-image-2-vip-unknown-error)
  </Accordion>

  <Accordion title="4K 真的不加價嗎？">
    **不加價**，4K Detail 檔（`3840x2160` / `2880x2880` 等）與 1K / 2K 同價 \$0.03/張。
  </Accordion>

  <Accordion title="支援 n 引數嗎？傳 n=3 會怎樣？">
    **不支援。** 本模型單次只返回 1 張圖，請通過**重複呼叫 / 併發呼叫**的方式生成多張。

    ⚠️ **重要**：如果在請求裡傳入 `n=3`，**計費會按 0.03 × 3 = \$0.09 扣費**，但**實際上仍然只返回 1 張圖**。請務必把 `n` 欄位從請求裡去掉，避免被多扣費。
  </Accordion>

  <Accordion title="內容被拒/模型回覆「我不能做到這個需求」，會計費嗎？">
    官逆是**同步對話式返回**，結果分兩種情況，**計費規則不同**：

    **1) 返回 5xx 狀態碼 → 不計費**

    上游內容策略明確攔截時會返回類似：

    ```json theme={null}
    {
      "error": {
        "message": "沒有按照預期生成圖片，請重新調整提示詞後重試（traceid: 0672821c6951af183dbf847130caaf16）",
        "localized_message": "Unknown error",
        "type": "invalid_request_error",
        "param": "",
        "code": null
      }
    }
    ```

    這種"明確報錯"呼叫**不計費**，引導使用者調整提示詞重試即可。

    **2) 返回 200 狀態碼（模型用文字軟拒絕）→ 計費**

    模型在對話裡軟拒絕、用文字回覆（例如「我不能做到這個需求」「抱歉，這個請求涉及……」），從協議層看就是一次正常的對話返回，**這種情況會被計費**。官逆目前沒有辦法在協議層提前識別"這一段是拒絕文字而不是圖片"。

    **為什麼不能直接對軟拒絕免單？**

    強行對所有"軟拒絕"都不計費意味著平臺要為每次失敗承擔上游成本；更關鍵的是，**頻繁觸發上游內容安全會讓供應方賬號更容易被封號**——這部分供給側的硬成本也無法完全規避。

    **給接入方的建議**

    * ✅ **前置內容過濾 / 風險提示**：在前端或接入層先做一道關鍵詞與場景過濾（如真實姓名、版權角色、敏感題材），並在 UI 上提示"涉及名人/版權題材時上游限制較嚴，可能失敗也會計費"，能顯著降低誤扣率。
    * ✅ **C 端產品月度補發**：理解 C 端產品無法完全控制使用者輸入。如果你的月用量較大（**月消費 \$1000+ 起**），可以**按月彙總日誌**（短耗時呼叫通常對應軟拒絕）聯絡客服一次性人工補發，無須逐條申訴。

    📖 相關：[官逆 500 多為內容違規](/live/2026-04/gpt-image-2-all-500-content-policy)
  </Accordion>

  <Accordion title="b64_json 字首要不要自己加 data:image/png;base64,？">
    **先檢測再處理**。2026-07 實測返回的 `b64_json` 為純 base64（不帶字首），需要解碼寫檔案或自行拼接字首後再渲染；但**歷史版本曾直接帶字首**。請在程式碼裡做 `startsWith('data:')` 檢測：有字首直接用作 `img src`，無字首先解碼，避免雙重拼接或帶字首解碼產出損壞的圖片。
  </Accordion>

  <Accordion title="參考圖最大多大？格式要求？">
    推薦 **單張 ≤ 10MB**，格式 `png` / `jpg` / `webp`。過大的圖可能觸發閘道限制。多圖融合時每張都需滿足此限制。
  </Accordion>

  <Accordion title="生成的圖片 URL 有效期是多久？需要自己轉存嗎？">
    `url` 模式響應的 `url` 欄位是 **R2 CDN 加速連結，有效期約 1 天（24 小時）**，過期後會 404。

    **強烈建議**：生成後儘快把圖片 **轉存到自己的物件儲存（S3 / OSS / R2）、CDN 或資料庫**，不要長期直接引用本服務返回的 URL。
  </Accordion>

  <Accordion title="能流式返回嗎？">
    本模型為一次性出圖，不支援 stream 輸出。如果對響應延遲敏感，建議客戶端顯示"生成中"進度提示，併合理配置 **300s 超時**（保守值）。
  </Accordion>

  <Accordion title="能用 OpenAI 的官方 SDK 直連嗎？">
    可以。把 `base_url` 指向 `https://api.apiyi.com/v1`，`api_key` 設為 API易 令牌即可。`client.images.generate(model="gpt-image-2.5-vip", size="2048x1360", prompt=...)` 直接可用。
  </Accordion>

  <Accordion title="還能用 /v1/chat/completions 對話方式出圖嗎？">
    可以，端點仍然可用，但**不再主推**——推薦統一使用 `/v1/images/generations` 與 `/v1/images/edits`（更穩定、與官轉 `gpt-image-2` 同套程式碼）。

    對話方式僅適合兩類場景：多輪迭代改圖、需要直接傳線上圖片 URL。注意出圖意圖不夠明確時可能返回純文字而不是圖片（可在提示詞開頭加「生成圖片：」字首強化）。

    詳細引數見 [對話式呼叫說明](/api-capabilities/gpt-image-2-vip/chat-completions)。
  </Accordion>

  <Accordion title="什麼時候應該改用官方版 gpt-image-2？">
    需要**精確**的 mask 局部重繪、需要 OpenAI 官方完全一致的欄位行為（含官方承諾的 `quality` 六檔）時，改用官轉 [`gpt-image-2.5-flare` / `sunburst` / `gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview)。詳見 [官轉 vs 官逆 對比](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all)。
  </Accordion>
</AccordionGroup>

## 相關文件

* [GPT-Image-2-All 概覽](/zh-Hant/api-capabilities/gpt-image-2-all/overview) - 同價位、出圖更快的姐妹模型，適合不需要鎖尺寸的場景
* [⚖️ 官轉 vs 官逆 對比](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - 與官方版 `gpt-image-2`（含 `-all` / `-vip`）的選型對照表
* [文生圖 Playground](/zh-Hant/api-capabilities/gpt-image-2-vip/text-to-image) - `/v1/images/generations` 相容端點，傳 `size` 鎖定尺寸
* [圖片編輯 Playground](/zh-Hant/api-capabilities/gpt-image-2-vip/image-edit) - `/v1/images/edits` 多圖融合與改圖
* [GPT-Image-2.5 / 2 官方版](/zh-Hant/api-capabilities/gpt-image-2/overview) - 需要精確 mask 局部重繪 / OpenAI 官方對齊欄位時的選擇
* [深度解讀：GPT-image-2.5 上線](/news/gpt-image-2-5-launch) - 2.5 雙模型釋出說明
* [GPT-Image 系列總覽](/api-capabilities/gpt-image-series) - 官方 GPT-Image 系列對比
* [API 使用手冊](/zh-Hant/api-manual) - 通用呼叫規範

<Info>
  gpt-image-2-vip 屬於官逆通道（Adobe 線路，Firefly），行為對齊但定價/能力與官方版本不完全一致。需要官方完全一致字段時，請使用 [`gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview)。
</Info>
