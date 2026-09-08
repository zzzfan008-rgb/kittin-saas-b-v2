> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official 影片生成

> Google Veo 3.1 官轉通道完整指南：透傳 Google AI Studio 官方端點，按次計費 $0.3 / $1.2，4 / 6 / 8 秒靈活時長，支援 720p / 1080p / 4k 多檔解析度，開箱即用無需切換分組與計費模式。

## 概述

**VEO 3.1 Official** 是 API易 接入 Google Veo 3.1 系列的 **官轉通道**（透傳 Google AI Studio），直連 Google `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` 非同步端點，模型 ID、響應欄位、約束條件與 Google 官方完全一致。**按次計費**、**預設分組即可呼叫**，是目前接入門檻最低的 Veo 3.1 官方品質通道。

<Note>
  **🎬 核心亮點**：透傳 Google AI Studio 官方端點 + 同步音影片原生輸出 + 4 / 6 / 8 秒靈活時長 + 720p / 1080p / 4k 三檔解析度 + 按次計費 \$0.3 起 + **預設分組 + 按次計費 / 按量優先令牌即可呼叫**（無需切換專屬分組）。**適合廣告短片、電商影片素材、社交媒體內容、產品演示** 等追求官方畫質 + 簡單接入的生產場景。
</Note>

<Warning>
  **⚠️ 暫不返回 CDN URL，需要自行拉取 MP4 落地**：本通道目前**不輸出任何可分發的公網 / CDN URL**——拿到 `status: "completed"` 後，**通過 `GET /v1/videos/{task_id}/content` 拉取 MP4 二進位制流並儲存到你自己的 OSS / CDN**，再分發給終端使用者。前端不能直連 `/content` 端點（需鑑權頭）。詳見下方 [端點一覽](#%E7%AB%AF%E7%82%B9%E4%B8%80%E8%A7%88) 段落。
</Warning>

<CardGroup cols={2}>
  <Card title="文生影片 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/veo-3-1-official/text-to-video">
    `POST /v1/videos`，純文本提示詞生成影片，JSON 請求體，最簡單的入口。
  </Card>

  <Card title="圖生影片 API" icon="image" href="/zh-Hant/api-capabilities/veo-3-1-official/image-to-video">
    `POST /v1/videos` + multipart 上傳 `input_reference`，讓靜態圖片動起來。
  </Card>

  <Card title="官轉 vs 官逆" icon="scale" href="/zh-Hant/api-capabilities/veo-3-1-official/vs-veo-reverse">
    與既有 [VEO 3.1（官逆）](/api-capabilities/veo/overview) 的選型對照表。
  </Card>

  <Card title="視覺化介面測試" icon="flask-conical" href="https://icover.ai/zh/veo-official">
    在 iCover 視覺化測試工具裡直接除錯本介面，無需寫程式碼。
  </Card>

  <Card title="非同步任務查詢 / 下載" icon="list-checks" href="https://api.apiyi.com/task">
    在 API易後臺檢視已提交的影片任務、下載影片連結（API 之外的查詢入口）。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——非同步輪詢、**必須自己拉 MP4 落地**、超時分檔、4K 的硬約束這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 VEO 3.1 官轉的文生影片與圖生影片。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 VEO 3.1 官轉的「文生影片 + 圖生影片」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/veo-3-1-official/overview.md](https://docs.apiyi.com/api-capabilities/veo-3-1-official/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-video 和 image-to-video 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 走非同步三步，不要寫成同步等待。本通道**只支援非同步**：`POST /v1/videos` 提交任務拿 `task_id` → 每 **8 到 10 秒**輪詢一次 `GET /v1/videos/{task_id}` 直到 `status` 變成 `completed` → 再從 `GET /v1/videos/{task_id}/content` 下載 MP4。**沒有 webhook，只能輪詢**，別去找回調配置。

  2. 影片落地（**本模型最關鍵的一條**）：響應裡**沒有任何 CDN 或公網 URL**——沒有 `video_url`、沒有 `data.url`。影片只能從 `/content` 端點拉 MP4 二進位制流，而且**必須帶 `Authorization` 頭**。所以前端**不能**把這個端點地址直接塞進 video 標籤的 `src`，瀏覽器不帶鑑權頭會 401。正確做法是：**拿到 `completed` 後立刻在服務端下載 MP4，轉存到你自己的 OSS / CDN**，再把你自家的 URL 分發給終端使用者。遠端影片的留存期官方沒有明確，**不要長期依賴 `task_id` 去取影片**。下載 `/content` 時做 3 到 5 次重試、每次間隔 4 秒——`status` 剛翻成 `completed` 的那一瞬間偶發 400。

  3. 超時分檔：POST 提交給 30 秒（multipart 上傳參考圖會更慢）。輪詢的最長等待按解析度分檔——720p / 1080p 等 **3 分鐘**，4K 等 **10 分鐘**。這些都放進配置，別寫死一個值。

  4. 模型與引數：模型名是 `veo-3.1-fast-generate-preview`（便宜、日常用）或 `veo-3.1-generate-preview`（標準檔）。時長欄位名是 **`seconds` 而不是 `duration`**，而且**必須傳字串**（`"4"` / `"6"` / `"8"`），傳數字會被服務端拒絕。**寫成 `duration` 不會報錯、會被靜默忽略並回落到 4 秒**——「我傳了 8 秒卻只出 4 秒」就是這麼來的。**時長和解析度是聯動的**：`1080p` 和 `4k` 都**只支援 `seconds` 為 `"8"`**，傳 `"4"` 或 `"6"` 會直接報錯；只有 `720p` 三檔時長都能用。所以如果前臺讓使用者同時選解析度和時長，務必做聯動約束，別放出非法組合。4K 還額外要求模型用 `veo-3.1-generate-preview`、超時提到 10 分鐘。注意 4K 渲染比 1080p 慢 4 到 6 倍、檔案大約 10 倍，而且**按次計費與時長、解析度都無關（4K 不加價也不省錢）**，所以預設給 1080p、把 4K 做成使用者顯式選擇的選項。

  5. 圖生影片的三條硬約束：必須用 **`multipart/form-data`**（不是 JSON）；圖片欄位名**只能叫 `input_reference`**，寫成 `image` / `reference` / `input_image` 都不認；**只收 1 張圖**，傳多張只取第一張、其餘靜默丟棄。而且**不接受遠端 URL**，只能上傳檔案或 Base64。格式限 `image/jpeg` / `image/png` / `image/webp`。另外本通道**沒有首尾幀、也沒有多參考圖**能力，別照著谷歌官方文件寫。multipart 模式下 `metadata.*` 要拍平成 `resolution` / `aspectRatio` / `seed` 這樣的表單欄位。

  6. **不要傳 `generateAudio`**。Veo 3.1 原生自帶音訊，但這個引數傳了上游會直接回 `INVALID_ARGUMENT`。要控制音效、人聲、環境音，把意圖寫進 prompt，不要找音訊開關——本通道根本沒有音訊欄位。

  7. 計費與錯誤：**按模型名按次結算**，與時長、解析度、是否傳參考圖都無關。非同步模式下**生成失敗、內容稽核攔截、服務過載都不計費，只有 `status` 為 `completed` 才扣費**，所以失敗重試不用擔心重複扣錢。錯誤處理：`PUBLIC_` 字首的錯誤是上游官方內容稽核攔截，不計費，調整提示詞後可以直接重試；`5xx` 或 `INTERNAL` 是上游瞬時錯誤，保持同 seed 重試 1 到 2 次；任務變成 `failed` 多半是稽核或上游容量問題，同樣不計費。

  8. 令牌計費模式要注意：本模型需要令牌是**按次計費**或**按量優先**，**按量計費不支援**。如果呼叫報錯提示計費模式問題，去控制台把令牌切一下。

  9. Key 從環境變數 `APIYI_API_KEY` 讀，base\_url 用 [https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進](https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進) git。

  10. 改完真跑一次文生影片 + 一次圖生影片，把生成的影片和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                | 擋掉的坑                                                                          |
  | ----------------- | ----------------------------------------------------------------------------- |
  | 立即下載 MP4 並轉存      | 響應里根本沒有可分發的 URL，且遠端留存期未明確；把 `task_id` 當長期地址用早晚取不到                             |
  | 前端不能直連 `/content` | 該端點要鑑權頭，瀏覽器直接請求會 401，影片標籤放上去就是黑屏                                              |
  | 輪詢而不是同步等待         | 官轉只有非同步端點，沒有 webhook，寫成一次 HTTP 阻塞等結果根本跑不通                                     |
  | 時長與解析度聯動          | `1080p` 和 `4k` 都只接受 `seconds` 為 `"8"`，預設給 1080p 卻配 `"4"` 會直接報錯——只有 720p 三檔都能用 |
  | `seconds` 是字串不是數字 | 欄位名也不是 `duration`，兩處寫錯都會被服務端拒絕                                                |
  | 失敗不計費             | 只有 `completed` 才扣費，知道這點才敢放心做自動重試                                              |
  | 令牌要按次或按量優先        | 按量計費模式調不通，報錯原因不在程式碼裡                                                          |
</Accordion>

## 為什麼選 API易 的 VEO 3.1 Official

對標 Google 官方 / Vertex AI 通道，針對企業生產場景在 **接入門檻**、**穩定性**、**成本** 三方面做了深度最佳化：

<CardGroup cols={2}>
  <Card title="官轉直連 · 模型 ID 一致" icon="shield-check">
    透傳到 Google AI Studio 的 Veo 3.1 非同步端點，**模型 ID（`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`）與官方完全一致**，請求/響應欄位、約束條件一比一對齊。
  </Card>

  <Card title="開箱即用 · 無需切分組" icon="plug">
    走 `Default` 預設分組、**按次計費 或 按量優先 令牌均可呼叫**（按量計費暫不支援），**無需切換專屬分組**。老使用者現有 Key 不改配置就能直接跑，是最低接入門檻的官方品質通道。
  </Card>

  <Card title="不限併發 · 企業可放量" icon="infinity">
    賬號池聚合透傳，批量出片 / 短影片矩陣 / 廣告生產等高併發場景下可線性擴容，**不受 Google 單賬號 Tier 限制**。
  </Card>

  <Card title="按次定價 · 對比 Google 立省 60%+" icon="percent">
    `veo-3.1-fast-generate-preview` \$0.3/次、`veo-3.1-generate-preview` \$1.2/次，按次計費、4/6/8 秒 + 720p/1080p/4k 同價。**對比 Google 官方 8 秒 1080p 立省 62-68%**，疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 進一步下降；失敗任務不計費。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，省去為 Google AI Studio / Vertex AI 配置出海鏈路的麻煩。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕影片生成場景，在 prompt 工程、解析度選型、批次生產、影片後處理等場景具備豐富經驗，可為企業客戶提供從 PoC 到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="同步音影片原生輸出" icon="volume-2">
    Veo 3.1 系列**原生輸出帶同步音軌的影片**（環境音、對話、配樂），無需後期單獨配音。音訊效果通過 prompt 描述即可。
  </Card>

  <Card title="4 / 6 / 8 秒靈活時長" icon="clock">
    `seconds` 字串列舉 `"4"` / `"6"` / `"8"`，**按次計費、時長不影響單價**。1080p / 4k 解析度僅支援 `"8"`。
  </Card>

  <Card title="三檔解析度分級" icon="expand">
    `720p` / `1080p` / `4k` 三檔，**單價均一**。橫屏（`16:9`）、豎屏（`9:16`）靈活切換。
  </Card>

  <Card title="精準指令遵循" icon="target">
    Veo 3.1 在鏡頭運動、物體物理、人物表情等細節上的指令遵循能力領先同檔模型，支援豐富的鏡頭語言關鍵詞（推/拉/搖/跟、俯/仰拍等）。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="圖生影片（input_reference）" icon="image">
    上傳一張圖片作為影片起始幀，讓靜態畫面"動起來"。詳見 [圖生影片](/zh-Hant/api-capabilities/veo-3-1-official/image-to-video)。
  </Card>

  <Card title="非同步任務化" icon="list-check">
    提交後返回 `task_id`，輪詢狀態、獨立下載影片，便於批次管理和斷點續傳。
  </Card>

  <Card title="OpenAI 相容協議" icon="plug">
    `base_url=https://api.apiyi.com/v1` + `Bearer` 鑑權，HTTP / OpenAI SDK 底層 `client.post()` 均可呼叫。
  </Card>

  <Card title="失敗不計費" icon="circle-check">
    非同步模式下，生成失敗、內容稽核攔截、引數錯誤等情況均**不計費**，**僅 `status=completed` 的任務才扣費**。
  </Card>
</CardGroup>

## 模型定價

API易 使用 **Pay-per-request** 計費，在支援的時長和解析度組合內統一價格，**不按時長或解析度額外加價**。按 `ai.google.dev/gemini-api/docs/pricing` 公開價格測算，Google 官方 Veo 3.1 以秒計費；以下折扣按 **8 秒影片** 計算。

| 模型                              | API易 價格       | Google 官方 8 秒 1080p      | Google 官方 8 秒 4K         |
| ------------------------------- | ------------- | ------------------------ | ------------------------ |
| `veo-3.1-fast-generate-preview` | **\$0.3 / 次** | \$0.96<br />便宜 **68.8%** | \$2.40<br />便宜 **87.5%** |
| `veo-3.1-generate-preview`      | **\$1.2 / 次** | \$3.20<br />便宜 **62.5%** | \$4.80<br />便宜 **75.0%** |

<Info>
  **計費說明**：

  * 按 **模型名** 按次結算，與時長（4/6/8 秒）、解析度（720p/1080p/4k）、是否傳 `input_reference` 無關——選 4K 不加價
  * 非同步模式下生成失敗 / 內容稽核攔截 / 服務過載錯誤**均不計費**
  * 充值加贈政策見 [充值加贈活動](/zh-Hant/faq/recharge-promotions)，疊加後實際成本進一步下降
  * 4K 同價但渲染慢 4–6 倍、檔案大 \~10 倍，**日常用 1080p 價效比更優**
  * Google 官方 4K 單價 fast \$0.30/秒、standard \$0.60/秒，8 秒約 \$2.40 / \$4.80（資料來源 `ai.google.dev/gemini-api/docs/pricing`）
</Info>

## 分組介紹

VEO 3.1 Official **在 `Default` 預設分組即可呼叫**（1x），**無需切換專屬分組**。令牌計費模式需為 **按次計費** 或 **按量優先**——**按量計費暫不支援**（請在 [控制台](https://api.apiyi.com/token) 把令牌切到按次或按量優先）。

<Tip>
  **接入門檻低**：VEO 3.1 Official 走預設分組 + 按次或按量優先都行，無需為它單獨開分組，**適合追求"現有按次令牌一行 base\_url 就接入"** 的團隊。
</Tip>

| 維度   | VEO 3.1 Official         | 備註           |
| ---- | ------------------------ | ------------ |
| 分組   | `Default`（1x）            | 無需切換         |
| 計費模式 | 按次計費 ✅ / 按量優先 ✅ / 按量計費 ❌ | 按量計費不支援，必須切換 |
| 令牌要求 | 按次 或 按量優先 + Default 分組   | 不需要專屬令牌      |
| 倍率   | 1.0x                     | 直接按定價表結算     |

## 技術規格

| 維度                             | `veo-3.1-fast-generate-preview`                         | `veo-3.1-generate-preview` |
| ------------------------------ | ------------------------------------------------------- | -------------------------- |
| **價格**                         | \$0.3 / 次                                               | \$1.2 / 次                  |
| **支援時長（seconds，字串）**           | `"4"` / `"6"` / `"8"`                                   | `"4"` / `"6"` / `"8"`      |
| **支援解析度（metadata.resolution）** | `720p` / `1080p` / `4k`                                 | `720p` / `1080p` / `4k`    |
| **支援比例（metadata.aspectRatio）** | `16:9` / `9:16`                                         | `16:9` / `9:16`            |
| **音軌**                         | ✅ 同步音影片                                                 | ✅ 同步音影片                    |
| **圖生影片（input\_reference）**     | ✅（僅 1 張參考圖）                                             | ✅（僅 1 張參考圖）                |
| **典型生成耗時**                     | 720p 60–90s · 1080p 80–120s · 4K 5–6 分鐘                 | 同                          |
| **影片留存**                       | 官方未明確，建議生成後立即下載落地                                       | 同                          |
| **響應欄位**                       | `id` / `task_id` / `status` / `progress` / `created_at` | 同                          |

<Warning>
  **1080p / 4k 解析度時 `seconds` 必須傳 `"8"`**，傳 `"4"` 或 `"6"` 會被上游拒絕。720p 三檔時長都支援。
</Warning>

## 端點一覽

| 端點                             | 方法   | 用途                        | Content-Type                               |
| ------------------------------ | ---- | ------------------------- | ------------------------------------------ |
| `/v1/videos`                   | POST | 提交影片生成任務（文生影片 / 圖生影片統一端點） | `application/json` 或 `multipart/form-data` |
| `/v1/videos/{task_id}`         | GET  | 查詢任務狀態與進度                 | —                                          |
| `/v1/videos/{task_id}/content` | GET  | **下載已生成的影片檔案（MP4 二進位制）**  | —                                          |

<Warning>
  **⚠️ 僅支援 MP4 二進位制流下載，暫不返回 CDN URL**

  本通道目前**不會在響應中輸出任何 CDN / 公網 URL**——影片檔案**只能通過 `GET /v1/videos/{task_id}/content` 拉取 MP4 二進位制流**，需要帶 `Authorization: Bearer` 頭。

  這意味著：

  * 響應欄位裡**沒有** `video_url` / `data.url` / 任何可直接分發的連結
  * 前端**不能**直接把端點 URL 貼到 `<video>` 標籤——瀏覽器請求不帶鑑權頭會 401
  * **拿到 `status: "completed"` 後立即下載 MP4，落地到自己的 OSS / CDN**，再把你自家的 URL 分發給終端使用者
  * 影片留存期官方未明確，**不要長期依賴遠端 `task_id`** 拿影片
</Warning>

<Tip>
  **域名選擇**：主域名 `api.apiyi.com`，也可使用 `vip.apiyi.com` / `b.apiyi.com` 等其它閘道域名，響應行為一致。
</Tip>

## 關鍵引數詳解

<Tip>
  **⚡ 完整引數速查表**：跳轉到 [文生影片 - 引數說明速查](/zh-Hant/api-capabilities/veo-3-1-official/text-to-video#%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E%E9%80%9F%E6%9F%A5) 一表看全 `model` / `prompt` / `seconds` / `size` / `metadata.*` 的型別、必填、預設值、取值約束。本節只展開**最容易踩坑的 3 個引數**。
</Tip>

### `seconds`（影片時長）

控制時長的欄位名是 **`seconds`**（不是 `duration`），**必須傳字串**（`"4"` / `"6"` / `"8"`），傳數字會被服務端拒絕並報：

```
parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string
```

| 值     | 720p  | 1080p | 4k    |
| ----- | ----- | ----- | ----- |
| `"4"` | ✅     | ❌     | ❌     |
| `"6"` | ✅     | ❌     | ❌     |
| `"8"` | ✅（預設） | ✅（必填） | ✅（必填） |

<Warning>
  **常見踩坑：欄位名寫成 `duration` 會被靜默忽略**。`duration` 不是本通道識別的欄位 → 被丟棄 → 時長回落到預設 **4 秒**：

  * 720p 等允許 4 秒的解析度：**不報錯，但只出 4 秒**（"傳了 8s 卻只出 4s" 就是這麼來的）
  * 1080p / 4k：因 4 秒非法直接報錯 `Resolution 1080p requires duration seconds to be 8 seconds, but got 4`

  **正確寫法：請求欄位用 `seconds`，值 `"8"`（字串）。**
</Warning>

引數識別優先順序：`metadata.durationSeconds > seconds > 8`

### `metadata.resolution`（解析度）

| 值          | 畫素（橫）       | 畫素（豎）       | 備註                              |
| ---------- | ----------- | ----------- | ------------------------------- |
| `720p`（預設） | `1280x720`  | `720x1280`  | 三檔時長都可用                         |
| `1080p`    | `1920x1080` | `1080x1920` | **僅支援 `seconds="8"`**           |
| `4k`       | `3840x2160` | `2160x3840` | **僅支援 `seconds="8"`**，渲染慢 4–6 倍 |

引數識別優先順序：`metadata.resolution > size > 720p`

### ⚠️ 不要傳 `generateAudio`

Veo 3 / 3.1 **原生帶音訊**，但 `generateAudio` 引數**不要傳**，上游會回 `INVALID_ARGUMENT`。要控制音訊效果，**把意圖寫進 prompt**：

> "黃昏海邊的燈塔，海浪聲、遠處海鳥叫聲，低沉的風聲，電影級氛圍"

## 最佳實踐

<Steps>
  <Step title="按需選模型">
    * **試水 / 批次預覽** → `veo-3.1-fast-generate-preview`（\$0.3/次）
    * **最終交付 / 4K 高畫質** → `veo-3.1-generate-preview`（\$1.2/次）
    * 同 prompt + 同 seed 下兩個模型各跑一次，人工挑成片
  </Step>

  <Step title="先調通 4 秒再放大時長">
    每個 prompt 先用 `seconds: "4"` 快速驗證鏡頭方向、風格是否符合預期（耗時 60–90 秒、單價 \$0.3），定型後再放大到 8 秒或換 1080p。
  </Step>

  <Step title="走非同步輪詢而不是同步等待">
    官轉通道**僅支援非同步**：POST 提交拿 `task_id` → 每 8–10 秒輪詢 `GET /v1/videos/{task_id}` 直到 `status: "completed"` → 從 `/content` 下載 MP4。**沒有 webhook，只能輪詢**。
  </Step>

  <Step title="客戶端超時分檔配置">
    * 720p / 1080p：3 分鐘硬超時
    * 4K：10 分鐘硬超時
    * POST 提交（multipart）：30 秒起步
  </Step>

  <Step title="完成後立即下載落地">
    生成完成後**立即下載到自己的 OSS / CDN**，不要長期依賴遠端 `task_id` 拿影片。`status` 剛翻 `completed` 後調 `/content` **偶發 400**，等 4 秒重試一次即可（參考客戶端已內建重試）。
  </Step>

  <Step title="音訊效果寫進 prompt">
    **不要傳 `generateAudio` 引數**（會被 `INVALID_ARGUMENT` 拒）。要環境音 / 對白 / BGM 直接寫到 prompt 裡："海浪聲、遠處海鳥叫聲、低沉的風聲"。
  </Step>

  <Step title="生產側自己限流">
    併發上限官方未明示，實測同時 10 個任務全部成功入隊。**生產側建議 in-flight ≤ 10**，對 429 / 5xx 加指數退避重試。
  </Step>
</Steps>

## 錯誤碼與重試

| 狀態碼 / 現象                       | 含義                                    | 處理建議                                         |
| ------------------------------ | ------------------------------------- | -------------------------------------------- |
| `400` + `parse_request_failed` | `seconds` 傳成數字了                       | 改成字串 `"4"` / `"6"` / `"8"`                   |
| 只出 4 秒 / `... but got 4`       | 欄位名寫成了 `duration`（被靜默忽略，回落預設 4 秒）     | 改用 `seconds`，值 `"8"`（字串）                     |
| `INVALID_ARGUMENT`             | 傳了 `generateAudio` 或 1080p/4k 配了非 8 秒 | 刪掉 `generateAudio`；解析度高檔時 `seconds="8"`      |
| `401`                          | 令牌無效                                  | 檢查 `Authorization: Bearer <key>` 無空格、key 未過期 |
| `429`                          | 限流 / 餘額不足                             | 指數退避重試；充值後立即可用                               |
| `5xx` / `INTERNAL`             | 上游瞬時錯誤                                | 保持同 seed 重試 1–2 次（不計費）                       |
| `GET /content` 偶發 400          | `status` 剛翻 completed                 | 等 4 秒重試一次（建議客戶端做 3–5 次重試）                    |
| 任務 `failed`                    | 影片生成失敗（多為內容稽核或上游容量）                   | 調整 prompt 重試；**該任務不計費**                      |

<Info>
  **建議客戶端**：

  * POST 提交超時 **30 秒**（multipart 上傳可能更慢）
  * GET 輪詢間隔 **8–10 秒**，最長等待 720p/1080p **3 分鐘**、4K **10 分鐘**
  * 對 5xx 與任務 `failed` 做 **指數退避重試**（建議 1–2 次）
  * 下載 `/content` 做 3–5 次重試，每次間隔 4 秒
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="官轉和官逆有什麼區別？現在還能用官逆嗎？">
    **官轉（本頁）**：透傳到 Google AI Studio 官方端點，模型 ID 與 Google 官方一致（`veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview`），按次 \$0.3 / \$1.2，僅支援非同步端點。

    **官逆**（既有 [VEO 3.1](/api-capabilities/veo/overview)）：通過逆向工程接入 Google Flow，模型 ID 是 `veo-3.1-fast` / `veo-3.1` / `-fl` 系列，按次 \$0.15 起，價格更便宜，同時支援 **同步流式** 與非同步兩種呼叫，且支援**首尾幀**。

    詳細對比見 [官轉 vs 官逆 選型表](/zh-Hant/api-capabilities/veo-3-1-official/vs-veo-reverse)。兩個通道並存，按業務需求選。
  </Accordion>

  <Accordion title="時長欄位到底是 seconds 還是 duration？為什麼要傳字串？">
    **請求欄位名是 `seconds`**（字串 `"4"` / `"6"` / `"8"`）。寫成 `duration` 不會被識別，會被靜默丟棄，時長回落到預設 4 秒——這是"傳了 8s 卻只出 4s"的根因。

    至於為什麼必須傳字串：後端的 Go struct 把這個欄位（內部名 `duration`）宣告為 `string` 型別，傳數字直接被解碼層拒掉，報 `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string`（錯誤資訊裡出現的 `duration` 是後端內部欄位名，請求裡仍然要寫 `seconds`）。**寫程式碼時記得：欄位名用 `seconds`、值加引號 `"4"` / `"6"` / `"8"`**。
  </Accordion>

  <Accordion title="想要帶對白 / 環境音 / BGM 怎麼辦？generateAudio 能傳嗎？">
    Veo 3 / 3.1 是 **原生帶音訊** 的影片模型，但 `generateAudio` 這個引數 **不要傳**（傳了會被上游回 `INVALID_ARGUMENT`）。要控制聲音，**把音訊意圖寫進 prompt**：

    > "黃昏海邊的燈塔，海浪聲、遠處海鳥叫聲，低沉的風聲，電影級氛圍"
  </Accordion>

  <Accordion title="fast 和 standard 到底怎麼選？fast 是更快還是更便宜？">
    * 同等引數下 **渲染時長基本相同**（實測 720p 8 秒：fast 83s、standard 78s），**fast 不是更快，而是更便宜**（\$0.3 vs \$1.2）
    * 預設用 `veo-3.1-fast-generate-preview`
    * 最終交付、對畫面細膩度 / 物理一致性敏感時切 `veo-3.1-generate-preview`
    * 建議線上 AB：同 prompt + 同 seed 下兩個模型各跑一次，人工挑
  </Accordion>

  <Accordion title="4K 值得用嗎？什麼時候用 4K？">
    **絕大多數場景不推薦**：

    * 同價格按次，聽起來划算
    * 但渲染**慢 4–6 倍**（720p 80s → 4K 350s）
    * 檔案大 \~10 倍（720p 4MB → 4K 40MB），頻寬 / 儲存成本翻倍
    * 視覺上 1080p 已經夠用，大部分播放場景看不出差別

    **確實需要 4K 時**：模型用 `veo-3.1-generate-preview`、`seconds` 必須 `"8"`、客戶端超時 ≥ 10 分鐘、非同步任務做好後臺處理。
  </Accordion>

  <Accordion title="任務什麼時候才算完成？要不要 webhook？">
    * 目前 **沒有 webhook**，只能輪詢 `GET /v1/videos/{task_id}`
    * 推薦輪詢間隔：**8 秒**（實測夠用，不觸發限流）
    * 實測耗時：720p / 1080p 60–115 秒，4K 5–6 分鐘
    * 客戶端超時建議 720p/1080p 設 3 分鐘，4K 設 10 分鐘
  </Accordion>

  <Accordion title="GET /content 返回 400 是什麼原因？">
    `status` 剛翻 `completed` 後立即調 `/v1/videos/{task_id}/content` 偶發 400，是上游 CDN 同步延遲。**等 4 秒重試一次**通常就好（參考客戶端內建 3–5 次重試，間隔 4 秒）。
  </Accordion>

  <Accordion title="響應裡能直接拿到影片的 CDN URL 嗎？前端能直連嗎？">
    **暫時不可以**。本通道目前**不返回任何 CDN / 公網 URL**——響應欄位裡**沒有** `video_url` / `data.url` 之類的可直接分發連結。

    **唯一拿影片的方式**：拿到 `status: "completed"` 後調 `GET /v1/videos/{task_id}/content`，**返回 MP4 二進位制流**（需要帶 `Authorization: Bearer` 頭）。

    **生產側標準做法**：

    1. 後端任務完成後立即下載 MP4 → 推到自己的 OSS / CDN
    2. 把自家 CDN URL 分發給終端使用者
    3. **前端 `<video>` 標籤不要直接指向 `/content` 端點**——瀏覽器請求不帶鑑權頭會 401

    後續如官方上線 CDN URL 輸出能力，本頁會同步更新。
  </Accordion>

  <Accordion title="影片在遠端儲存多久？需要立刻下載嗎？">
    官方文件**未明確給出留存期**。**強烈建議生成完成後立即下載落本地儲存**，不要長期依賴遠端 `task_id` 拿影片——`/content` 端點過期後會 404。
  </Accordion>

  <Accordion title="progress 欄位為什麼一直是 50%？">
    這個欄位是粗粒度，**只在 0 / 50 / 100 三檔之間跳**，不要拿來做百分比進度條。要展示進度，要麼用旋轉 loading，要麼按"已等待秒數 / 預期秒數"自己算。
  </Accordion>

  <Accordion title="影片生成失敗會扣費嗎？">
    **不會**。**只對 `status=completed` 的任務計費**，`failed` / 取消 / 內容稽核攔截 / 引數錯誤都免費。**只要任務沒真正出片就不扣費**。
  </Accordion>

  <Accordion title="seed 能復現一模一樣的影片嗎？">
    **不能位元組級復現**。實測同 prompt + 同 seed（`88888`）+ 同參數，fast 跑兩次：檔案大小 9.81 MB vs 9.25 MB、md5 完全不同、渲染耗時也不同。

    **但 seed 不是裝飾品**：同 seed 多次結果**互相聚集**（5 次實測組內檔案大小跨度僅 6%），不同 seed **系統性偏移**（組間差距 +36.8%）。所以：

    * 想要"穩定風格" → 固定 seed
    * 想要"探索變體" → 換 seed 比換 prompt 局部詞更直觀
    * 想要"精確重放" → 別想了，把 mp4 存下來
  </Accordion>

  <Accordion title="能傳多張參考圖嗎？能傳首尾幀嗎？">
    **當前都不支援**。圖生影片只能 1 張圖，欄位名固定 `input_reference`，且**只接受檔案或 Base64，不接受遠端 URL**。

    Google 官方 Veo 3.1 有多參考圖 / 首尾幀 / 影片擴充套件能力，但本站官轉通道暫未開放。**首尾幀需求請用 [VEO 3.1（官逆）](/api-capabilities/veo/overview)** 的 `-fl` 系列模型。
  </Accordion>

  <Accordion title="一次能併發多少任務？有 QPS 限制嗎？">
    實測一口氣提交 10 個任務全部成功入隊，未觸發拒絕。具體上限官方未明示，**建議生產側自己限流（in-flight ≤ 10）**，對 429 / 5xx 加指數退避重試。
  </Accordion>

  <Accordion title="影片帶水印 / 溯源資訊嗎？">
    * 沒有可視水印
    * 但帶 **Google C2PA Content Credentials** 簽名（`urn:c2pa:...`，Google C2PA Media Services 頒發），藏在 MP4 後設資料裡。終端使用者肉眼看不到，**用 C2PA 工具（如 Adobe Content Authenticity）可以驗出"由 Veo 生成"**
    * 二創再分發知情即可，一般不影響播放
  </Accordion>

  <Accordion title="可以用 OpenAI 官方 SDK 直連嗎？">
    部分可以。介面是 OpenAI 風格的（`Bearer` 鑑權 + `/v1/...`），但 OpenAI 官方 SDK **沒有 `videos.create` 這個方法**（`/v1/videos` 是自定義路徑），多半要用 OpenAI SDK 的底層 `client.post()` 或直接 HTTP 呼叫。**直接 HTTP 最省事**，詳見 [文生影片](/zh-Hant/api-capabilities/veo-3-1-official/text-to-video) Playground 頁的程式碼示例。
  </Accordion>
</AccordionGroup>

## 相關文件

* [文生影片 Playground](/zh-Hant/api-capabilities/veo-3-1-official/text-to-video) - `POST /v1/videos`（JSON）線上除錯，5 段語言程式碼示例
* [圖生影片 Playground](/zh-Hant/api-capabilities/veo-3-1-official/image-to-video) - `POST /v1/videos`（multipart）+ `input_reference` 用法詳解
* [官轉 vs 官逆 選型表](/zh-Hant/api-capabilities/veo-3-1-official/vs-veo-reverse) - 與 [VEO 3.1（官逆）](/api-capabilities/veo/overview) 的差異對照
* [充值加贈活動](/zh-Hant/faq/recharge-promotions) - 加贈最高檔位與適用渠道
* [API 使用手冊](/zh-Hant/api-manual) - 通用呼叫規範、超時與重試建議
* Google 官方模型頁：`ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview`
* Google 官方影片生成文件：`ai.google.dev/gemini-api/docs/video`

<Info>
  VEO 3.1 Official 是 API易 透傳 Google AI Studio 的穩定官轉服務。模型 ID、響應欄位、約束條件與 Google 官方完全一致，且**預設分組 + 按次計費 / 按量優先 令牌即可呼叫**——是目前接入門檻最低的官方品質通道。如有問題或建議，歡迎在控制台工單中反饋。
</Info>
