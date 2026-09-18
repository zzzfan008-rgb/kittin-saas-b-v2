> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 生圖/編輯

> 字節跳動 BytePlus 火山方舟 Seedream 系列影像生成模型完整指南，5.0 / 4.5 / 4.0 三版本統一接入，支援 4K 高畫質、多圖融合、批次序列生成、參考圖編輯。

## 概述

**Seedream** 是字節跳動 BytePlus 火山方舟海外版的旗艦影像生成模型系列，**統一生成-編輯架構**：文生圖、單圖編輯、多圖融合、批次序列生成都通過同一個 `/v1/images/generations` 端點完成，僅引數不同。API易 與 BytePlus 達成官方戰略合作，第一時間接入全部活躍版本。

<Note>
  **🎨 核心亮點**：三個活躍版本（5.0 / 4.5 / 4.0）統一計費 + 4K 高清出圖 + 最多 10 張參考圖融合 + 批處理 (輸入+輸出 ≤ 15 張) + 強中文文字渲染。**適合電商主圖、廣告海報、產品攝影、內容創作** 等需要高畫質 + 文字渲染的生產場景。
</Note>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<Note>
  **資源版本說明**：API易 接入的 Seedream 走**海外 BytePlus（國際版）官方資源**，而非國內的豆包 / 火山引擎版本。國際版的內容稽核策略相對國內版寬鬆，創作自由度更高——這是本平臺的一項優勢，但**不代表沒有安全稽核**：BytePlus 仍內建內容安全機制，違規提示詞或參考圖會被 400/403 攔截（攔截不計費）。請在合規前提下使用。
</Note>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/seedream-image/text-to-image">
    `POST /v1/images/generations`，純文本提示詞生成圖片，支援 1K/2K/3K/4K 與精確畫素尺寸。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/seedream-image/image-edit">
    同端點 + `image` 引數，支援單圖改圖、多圖融合、批次序列生成（最多 15 張）。
  </Card>

  <Card title="歷史版本" icon="rotate-ccw-clock" href="/zh-Hant/api-capabilities/seedream-image/historical-versions">
    5.0 / 4.5 / 4.0 三版本規格對比、價格差異、遷移指南。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、URL 結果要立即轉存、編輯走 URL 陣列而不是 multipart、以及 `seedream-5-0-pro` 的禁傳引數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Seedream 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Seedream 的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/seedream-image/overview.md](https://docs.apiyi.com/api-capabilities/seedream-image/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：客戶端 timeout 按型號分檔——4.x 系列 60 秒起步，`seedream-5-0` 提到 120 秒，**`seedream-5-0-pro` 實測約 2 分鐘出圖，提到 240 秒**。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬。

  2. 返回處理：預設返回 `url`（BytePlus TOS 的臨時簽名連結，約 24 小時後失效），也可以傳 `response_format: "b64_json"` 拿純 base64（不帶 `data:` 字首）。走 URL 的話**必須在服務端立即下載轉存到自己的物件儲存**，不要把上游連結直接存進資料庫當長期地址；走 base64 就要能渲染展示並提供「儲存到本地」。請顯式指定 `response_format`，別依賴預設值。

  3. 上傳參考圖（**和其它出圖模型最不一樣的一條**）：Seedream 是統一的生成-編輯架構，**沒有 `/v1/images/edits` 端點**，生成和編輯都打 `/v1/images/generations`，`application/json`。參考圖放在 `image` 欄位裡，它是一個 **URL 陣列**——不是 multipart 檔案上傳，也不是重複的 `image[]` 欄位。陣列元素可以是圖片 URL，也可以是 `data:image/jpeg;base64,...` 形式的 data URL，兩種可以混用。最多 10 張參考圖，且**輸入圖 + 輸出圖合計不能超過 15 張**。本模型沒有 `mask` 欄位。本地大圖建議先傳到你自己的物件儲存再傳 URL；如果用 data URL，上傳前先壓縮——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼；多圖時合計控制在 6MB 以內，某張圖壓縮失敗就回退用原圖繼續。

  4. 引數紅線：本模型**沒有 `quality` 引數**，畫質由型號和 `size` 決定。`size` 可以填檔位（`1K` / `2K` / `3K` / `4K`，預設 `2K`）或者精確畫素，注意 `seedream-5-0-pro` 總畫素上限約 419 萬、最大 2048×2048，**沒有 3K / 4K 檔**。`n` 會被**靜默忽略**（仍只返回 1 張、按 1 張計費），要出多張得用 `sequential_image_generation`；`seed` 在 4.x / 5.x 上不生效。商用場景**務必顯式傳 `watermark: false`**，預設值隨版本不同。`output_format` 只有 5.0 和 5.0-pro 支援 png，4.5 / 4.0 只出 jpeg、沒有透明通道。

  5. `seedream-5-0-pro` 的兩個硬紅線：**不要傳 `sequential_image_generation`（傳任何值、包括 `"disabled"` 都會直接 400）**，也**不要傳 `stream`**（同樣 400）。如果你的程式碼是從 5.0 或 4.x 改過來的，務必把這兩個欄位整個刪掉。

  6. Key 從環境變數 `APIYI_API_KEY` 讀，base\_url 用 [https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進](https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進) git。用 OpenAI SDK 呼叫時，`image` / `sequential_image_generation` / `watermark` / `output_format` 這幾個引數要放進 `extra_body` 才能傳下去。

  7. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                     | 擋掉的坑                                                                                                                               |
  | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
  | 編輯不走 multipart         | Seedream 沒有 `/v1/images/edits`，參考圖是 JSON 裡的 URL 陣列；按 OpenAI 習慣寫 multipart 會整條路走不通                                                  |
  | 立即服務端轉存                | 上游連結約 24 小時失效，存進資料庫當長期地址用會陸續 404                                                                                                   |
  | 超時按型號分檔                | `seedream-5-0-pro` 實測約 2 分鐘，按 60 秒配會大量誤超時，而**斷連的請求照常計費**。詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) |
  | `5-0-pro` 禁傳兩個欄位       | `sequential_image_generation` 傳 `"disabled"` 也照樣 400，從其它型號改過來最容易踩                                                                  |
  | 不依賴 `n`                | `n` 被靜默忽略，仍只出 1 張，要多張得換 `sequential_image_generation`                                                                              |
  | 顯式傳 `watermark: false` | 預設值隨版本不同，商用圖上可能帶水印                                                                                                                 |
</Accordion>

## 為什麼選 API易 的 Seedream

對標 BytePlus 火山方舟海外版官方通道，針對企業生產場景在 **穩定性**、**成本**、**接入體驗** 三方面做了深度最佳化：

<CardGroup cols={2}>
  <Card title="官方戰略合作 · 資源穩定" icon="shield-check">
    與 BytePlus 火山方舟達成官方合作，走授權直連鏈路，請求和響應行為與官方一致，**無協議繞行風險**，企業可放心走生產。
  </Card>

  <Card title="不限併發 · 企業可放量" icon="infinity">
    批量出圖、多圖融合、序列生成等高併發場景下，可線性擴容，不受官方賬號 Tier 限制。**500 RPM 預設配額**，更高量級可申請擴容。
  </Card>

  <Card title="同價 + 充值最高 8 折" icon="percent">
    預設單價與 BytePlus 官方一致，疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) **最低可享 8 折**，長期使用成本顯著下降。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需海外伺服器或代理**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，省去為 BytePlus `ap-southeast-1` / `eu-west-1` 配置出海鏈路的麻煩。
  </Card>

  <Card title="OpenAI 相容 · 零程式碼改動" icon="plug">
    端點路徑 `/v1/images/generations` 與 OpenAI 一致，OpenAI 官方 SDK 把 `base_url` 指過來即可呼叫，擴充套件引數（`image` / `sequential_image_generation` 等）通過 `extra_body` 透傳。注意 OpenAI 的 `n` 引數上游不支援（傳入被靜默忽略，仍返回 1 張），多圖輸出請用 `sequential_image_generation`。
  </Card>

  <Card title="專業服務 · 企業陪跑" icon="handshake">
    團隊深耕影像生成場景，在多圖融合、文字渲染、批次素材生產等場景具備豐富經驗，可為企業客戶提供從 PoC 到生產上線的完整技術支援。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="4K 高保真出圖" icon="expand">
    4.0 / 4.5 支援原生 4K（4096×4096），細節層次豐富，適合海報、印刷物料；5.0-lite 上限 3K，但綜合體驗更新。
  </Card>

  <Card title="統一生成-編輯架構" icon="wand-sparkles">
    文生圖 / 單圖編輯 / 多圖融合 / 序列批次 都走 **同一端點同一引數集**，僅靠 `image` 與 `sequential_image_generation` 切換模式。
  </Card>

  <Card title="多圖融合 · 最多 10 張參考圖" icon="layers">
    `image` 欄位接受 URL 陣列，prompt 中可用「圖1/圖2」明確指代順序，配合 `sequential_image_generation: "disabled"` 做主體一致性控制。
  </Card>

  <Card title="文字渲染突破" icon="type">
    4.5 版本對小文本渲染大幅改進，海報標題、廣告文案、產品文字等場景清晰可讀，業界領先。
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="批次序列生成（最多 15 張）" icon="images">
    `sequential_image_generation: "auto"` + `max_images` 一次生成成系列的連續影像，適合分鏡、品牌視覺、產品系列圖。
  </Card>

  <Card title="約 15 秒/張 · 速度均衡" icon="bolt">
    單圖典型耗時 15 秒左右，4K + hd 檔稍長。**500 RPM** 預設配額，企業批次需求可申請擴容。
  </Card>

  <Card title="靈活尺寸 · 任意比例" icon="ruler">
    支援解析度檔位（`1K`/`2K`/`3K`/`4K`）或精確畫素，總畫素範圍 \[1280×720, 4096×4096]，寬高比 \[1/16, 16]。
  </Card>

  <Card title="OpenAI SDK 直連" icon="plug">
    `base_url=https://api.apiyi.com/v1` 即可用 OpenAI 官方 SDK 呼叫，擴充套件引數通過 `extra_body` 透傳，零程式碼改動遷移。
  </Card>
</CardGroup>

## 模型定價

按張計費，**與 BytePlus 官方同價**，疊加充值加贈後實際成本進一步下降。

| 模型                        | API易價格       | 折扣前估算      | 狀態                               |
| ------------------------- | ------------ | ---------- | -------------------------------- |
| `seedream-5-0-pro-260628` | \$0.12/次（單圖） | 約 ￥0.84/次  | 🆕 專業版（約 2 分鐘出圖，常規場景建議 5.0-lite） |
| `seedream-5-0-260128`     | \$0.035/張    | 約 ￥0.245/張 | ✅ 當前推薦（最新）                       |
| `seedream-4-5-251128`     | \$0.04/張     | 約 ￥0.28/張  | ✅ 當前推薦                           |
| `seedream-4-0-250828`     | \$0.03/張     | 約 ￥0.21/張  | 🟡 維護中（仍可呼叫）                     |

<Info>
  **計費說明**：

  * 按出圖張數計費，與 prompt 長度、是否走多圖融合無關
  * `seedream-5-0-pro` 為**按次固定價 \$0.12**（每次輸出 1 張，不支援批次序列）。官方原價按輸出畫素分兩檔（≤2.36M / >2.36M 各一價）並對第 2 張起的輸入參考圖另行收費；API易 簡化為按次統一價，**不分檔、已含輸入圖費用**。該模型**官方無任何折扣**，API易 按保供原則定價——計入充值加贈活動與稅務等成本後基本不盈利，價格如有調整會提前公告
  * `sequential_image_generation: "auto"` 模式下按實際生成張數計費（如 `max_images: 4` 出 4 張則計 4 次）
  * 失敗請求（4xx / 內容稽核攔截）**不計費**
  * 官方提供 200 張免費圖片測試額度（首次接入即享）
  * 充值加贈政策見 [充值加贈活動](/zh-Hant/faq/recharge-promotions)
</Info>

## 技術規格

| 維度               | seedream-5-0-pro                                     | seedream-5-0                     | seedream-4-5          | seedream-4-0          |
| ---------------- | ---------------------------------------------------- | -------------------------------- | --------------------- | --------------------- |
| **Model ID**     | `seedream-5-0-pro-260628`                            | `seedream-5-0-260128`            | `seedream-4-5-251128` | `seedream-4-0-250828` |
| **Model ID 別名**  | —                                                    | `seedream-5-0-lite-260128`       | —                     | —                     |
| **上線日期**         | 2026-06-28 (UTC+8)                                   | 2026-01-28 (UTC+8)               | 2025-11-28 (UTC+8)    | 2025-08-28 (UTC+8)    |
| **支援解析度檔位**      | 1K / 2K + 精確 WxH（總畫素 ≤ 4.19M，16:9 最長邊可達 2720，約 2.7K） | 2K / 3K                          | 2K / 4K               | 1K / 2K / 4K          |
| **輸出格式**         | `png` / `jpeg`                                       | `png` / `jpeg`                   | `jpeg`                | `jpeg`                |
| **Prompt 最佳化模式** | standard / fast                                      | standard                         | standard              | standard / fast       |
| **文生圖**          | ✅                                                    | ✅                                | ✅                     | ✅                     |
| **單圖編輯**         | ✅                                                    | ✅                                | ✅                     | ✅                     |
| **多圖參考融合**       | ✅（最多 10 張）                                           | ✅                                | ✅（最多 10 張）            | ✅                     |
| **批次序列生成**       | ❌（傳參即 400）                                           | ✅                                | ✅                     | ✅                     |
| **流式輸出**         | ❌（傳參即 400）                                           | ✅                                | ✅                     | ✅                     |
| **每分鐘最大出圖（RPM）** | 500                                                  | 500                              | 500                   | 500                   |
| **單次輸入+輸出圖數量**   | 輸入 ≤ 10，輸出 1                                         | ≤ 15                             | ≤ 15                  | ≤ 15                  |
| **典型延遲**         | 約 2 分鐘                                               | 30 秒級                            | 10\~20 秒              | 10\~15 秒              |
| **響應欄位**         | 同右                                                   | `data[].url` 或 `data[].b64_json` | 同                     | 同                     |

## 生成耗時對比

各版本單次請求的實測耗時（2026-07 實測，UTC+8；單位為從發起請求到拿到完整響應的牆鍾時間，單次請求有正常波動）：

| 場景              | seedream-4-0 | seedream-4-5 | seedream-5-0 | seedream-5-0-pro           |
| --------------- | ------------ | ------------ | ------------ | -------------------------- |
| 文生圖（1K/2K）      | 7\~11 秒      | 8\~13 秒      | 29\~34 秒     | **110\~130 秒**             |
| 文生圖（高檔位）        | 約 15 秒（4K）   | 約 18 秒（4K）   | 約 37 秒（3K）   | 約 134 秒（WxH 2720×1530，最大檔） |
| 圖生圖 / 多圖融合      | 約 11 秒       | 17\~21 秒     | 38\~40 秒     | **115\~132 秒**             |
| 組圖（2 張，編輯+auto） | —            | 約 36 秒       | —            | —（不支援組圖）                   |
| **建議客戶端超時**     | ≥ 60 秒       | ≥ 60 秒       | ≥ 120 秒      | **≥ 240 秒**                |

<Warning>
  **`seedream-5-0-pro` 出圖穩定在 2 分鐘級**（實測 110\~132 秒，多輪無一例外），這是深度推理型出圖的預期行為，不是故障。接入 pro 前請確認業務能接受該延遲：互動式場景（使用者線上等圖）不適合 pro，建議用 5.0-lite（30 秒級）；pro 適合離線批產、對畫質與指令遵循要求極高的場景。
</Warning>

## 端點一覽

| 端點                            | 用途                                                 | Content-Type       |
| ----------------------------- | -------------------------------------------------- | ------------------ |
| `POST /v1/images/generations` | 文生圖 / 單圖編輯 / 多圖融合 / 批次序列 — 全部能力**統一入口**，靠請求體引數切換模式 | `application/json` |

<Tip>
  **域名選擇**：主域名 `api.apiyi.com`，也可使用 `vip.apiyi.com` 等其它閘道域名，響應行為一致。**不需要使用 BytePlus 原生的 `ark.ap-southeast.bytepluses.com` / `ark.eu-west.bytepluses.com`**——API易 閘道已統一對映到 OpenAI 相容路徑。
</Tip>

## 關鍵引數詳解

### `size`（輸出尺寸）

支援兩類取值，**二選一**：

**預設檔位**（按解析度自動決定寬高比）：

| 檔位   | 含義              | 模型支援          |
| ---- | --------------- | ------------- |
| `1K` | 約 1024×1024     | 4.0 / 5.0-pro |
| `2K` | 約 2048×2048（預設） | 全部版本          |
| `3K` | 約 3072×3072     | 僅 5.0         |
| `4K` | 約 4096×4096     | 4.5 / 4.0     |

**精確畫素**（自定義任意尺寸）：

* 總畫素範圍：\[1280×720, 4096×4096]
* 寬高比範圍：\[1/16, 16]
* 預設值：`2048x2048`

**合法示例**：`1920x1080`（FullHD）、`3840x2160`（橫版 4K）、`1080x1920`（手機桌布）、`2560x1440`（橫版 2K）
**非法示例**：`5000x5000`（超上限）、`100x1600`（比例超 1/16）

<Warning>
  超過 `4096×4096` 總畫素的尺寸會直接報 400。某些極端比例（接近 1/16 或 16）可能出現畫面拉伸不穩定，建議優先用預設檔位或常見 16:9 / 9:16 / 1:1 比例。

  **5.0 系的精確畫素範圍與 4.x 不同**（下限更高、上限更低），超出時會返回 400 並在錯誤資訊中提示合法範圍。實測參考：5.0-lite 下限約 2560×1440；**5.0-pro 總畫素上限 4.19M（最大 2048×2048，16:9 時最長邊可達 2720×1530 ≈ 2.7K，實測可用），沒有 3K/4K 預設**。
</Warning>

### `image` 與 `sequential_image_generation`（編輯 / 多圖 / 批次模式開關）

`/v1/images/generations` 端點同時承擔文生圖與編輯/多圖能力，靠 **兩個引數組合** 切換模式：

| 模式     | `image` 引數              | `sequential_image_generation`                               | 說明                                                  |
| ------ | ----------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| 純文生圖   | 不傳                      | 不傳或 `"disabled"`                                            | 輸出 1 張                                              |
| 單圖編輯   | `["url1"]`              | `"disabled"`                                                | 基於 1 張參考圖改圖                                         |
| 多圖融合   | `["url1", "url2", ...]` | `"disabled"`                                                | 最多 10 張參考圖，prompt 用「圖1/圖2」指代                        |
| 批次序列生成 | 可選（傳或不傳）                | `"auto"` + `sequential_image_generation_options.max_images` | 輸出 N 張連貫影像，**N ≤ max\_images** 且 **輸入圖 + 輸出圖 ≤ 15** |

<Warning>
  **`seedream-5-0-pro` 不支援 `sequential_image_generation` 引數**——傳任何值（包括 `"disabled"`）都會直接返回 400。用 pro 做單圖編輯 / 多圖融合時**不要傳**該引數，只傳 `image` 即可；`stream` 同理不可傳。
</Warning>

詳細程式碼示例見 [文生圖 Playground](/zh-Hant/api-capabilities/seedream-image/text-to-image) 和 [圖片編輯 Playground](/zh-Hant/api-capabilities/seedream-image/image-edit)。

## 最佳實踐

<Steps>
  <Step title="選對版本">
    * **追求最強綜合體驗** → `seedream-5-0-260128`（功能最全，但解析度上限 3K）
    * **要 4K 出圖 + 強文字渲染** → `seedream-4-5-251128`（4K + 文字渲染突破）
    * **要 4K + 價效比** → `seedream-4-0-250828`（最便宜的 4K）
    * **極致畫質 / 複雜指令的專業場景** → `seedream-5-0-pro-260628`（\$0.12/次、約 2 分鐘出圖、僅 1K/2K，常規場景不建議）
  </Step>

  <Step title="尺寸優先選預設">
    `1K`/`2K`/`3K`/`4K` 檔位經過官方最佳化，速度和品質更穩定。自定義畫素留給真有比例需求的場景，注意各版本支援的檔位不同。
  </Step>

  <Step title="多圖融合時顯式指代">
    傳入 `image` 陣列時，prompt 裡用「把圖1的人物放進圖2的場景，沿用圖3的色彩風格」明確順序引用，避免模型自行猜測。
  </Step>

  <Step title="批次序列控制成本">
    `sequential_image_generation: "auto"` + `max_images: 4` 一次出 4 張，按張計費總價乘 4。先用 `max_images: 1` 驗證 prompt，再放大批次。
  </Step>

  <Step title="輸出格式按場景選">
    5.0 / 5.0-pro 支援 `png` 與 `jpeg`，4.5 / 4.0 僅 `jpeg`。需要透明背景或無損細節時優先 5.0 系 + png，體積敏感的場景用 jpeg。
  </Step>

  <Step title="超時配置 ≥ 60 秒">
    單圖約 15 秒，但批次序列（4 張）或 4K + hd 可能 30–60 秒。**客戶端超時建議 60 秒起步**，前端做進度反饋。**`seedream-5-0-pro` 實測約 2 分鐘出圖，超時建議 ≥ 240 秒**。
  </Step>

  <Step title="水印按需關閉">
    `watermark: false` 關閉水印（預設行為視版本而定，建議顯式傳）。商用素材建議顯式關，避免輸出帶 BytePlus 標識。
  </Step>
</Steps>

## 錯誤碼與重試

| 狀態碼   | 含義                                      | 處理建議                                  |
| ----- | --------------------------------------- | ------------------------------------- |
| `400` | 引數非法（size 超限、`image` 陣列超 10、未支援的解析度檔位等） | 校驗引數，注意各版本支援的解析度檔位差異                  |
| `401` | 令牌無效                                    | 檢查 Bearer Token                       |
| `403` | 內容稽核攔截                                  | 調整 prompt 或更換參考圖                      |
| `429` | 限流（預設 500 RPM）/ 餘額不足                    | 指數退避重試；超出 500 RPM 聯絡商務申請擴容            |
| `5xx` | 閘道 / 後端錯誤                               | 重試 1–2 次                              |
| 超時    | 長尾請求                                    | 客戶端超時 ≥ **60 秒**（批次序列或 4K hd 可達 1 分鐘） |

<Info>
  **建議客戶端**：

  * 請求超時 **60 秒** 起步（批次序列或 4K hd 可能 1 分鐘）
  * 對 5xx 與超時做 **指數退避重試**（建議 2 次）
  * 記錄響應頭 `x-request-id` 方便排查
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="5.0 Pro / 5.0 / 4.5 / 4.0 應該選哪個？">
    | 你的需求                  | 推薦                                                    |
    | --------------------- | ----------------------------------------------------- |
    | 最新功能 + 綜合體驗           | `seedream-5-0-260128`                                 |
    | 4K 高畫質 + 強文字渲染（海報、廣告） | `seedream-4-5-251128`                                 |
    | 4K 高畫質 + 最優價效比        | `seedream-4-0-250828`                                 |
    | 長期穩定大批次               | `seedream-4-0-250828`（已驗證）                            |
    | 極致畫質 / 複雜指令的專業場景      | `seedream-5-0-pro-260628`（\$0.12/次、約 2 分鐘出圖，非專業場景不建議） |

    詳見 [歷史版本對比](/zh-Hant/api-capabilities/seedream-image/historical-versions)。
  </Accordion>

  <Accordion title="為什麼圖片編輯也走 generations 端點？">
    Seedream 是統一生成-編輯架構，**沒有獨立的 `/v1/images/edits` 端點**。和 OpenAI 的 `gpt-image-2` 不同：OpenAI 的圖編輯要 `multipart/form-data` 上傳檔案到 `/v1/images/edits`，Seedream 則統一用 `application/json` 把圖片 **URL 陣列** 傳到 `image` 欄位。

    優點：協議統一、引數複用、容易切換模式。詳見 [圖片編輯 Playground](/zh-Hant/api-capabilities/seedream-image/image-edit)。
  </Accordion>

  <Accordion title="image 欄位接受 base64 嗎？">
    **接受**（已實測驗證）。格式必須是 data URI：`data:image/<格式>;base64,<base64編碼>`，注意 `<格式>` 小寫（如 `data:image/jpeg;base64,...`），URL 與 base64 也可以混在同一個數組裡。**但請優先傳公網 URL**：URL 由 BytePlus 直接從新加坡下載，不經過 API易 閘道；base64 請求體要先整體跨境上傳，20 MB 以上的請求體在跨境鏈路慢時會撞原廠 600 秒請求體超時而失敗，閘道不會替你把 base64 轉成 URL。細節見圖片編輯頁頂部的提示。
  </Accordion>

  <Accordion title="多圖融合最多幾張？批次序列最多幾張？">
    * **多圖融合**（`image` 陣列）：4.5 / 5.0-pro 官方明確"最多 10 張"，5.0 / 4.0 同樣支援但官方未單獨說明上限
    * **批次序列**（`max_images`）：受全域性約束 **輸入參考圖 + 輸出圖 ≤ 15**。所以多圖 + 序列同時用時要算總和。注意 **5.0-pro 不支援批次序列**（傳 `sequential_image_generation` 即 400）。
  </Accordion>

  <Accordion title="返回的 b64_json 要不要自己加 data:image 字首？">
    要看 `response_format`：

    * `response_format: "url"`（預設）→ 返回 `data[0].url`，直接 `<img src=...>` 渲染
    * `response_format: "b64_json"` → 返回 `data[0].b64_json` **純 base64 字串**（不含 `data:image/...;base64,` 字首），客戶端需 `base64.b64decode` 寫檔案，或瀏覽器渲染時自行拼字首
  </Accordion>

  <Accordion title="支援流式出圖嗎？">
    5.0 / 4.5 / 4.0 支援，配合 `stream: true` 啟用。流式特別適合長 prompt + 高解析度場景，前端可提前渲染部分結果。**`seedream-5-0-pro` 不支援流式**——傳 `stream` 引數會直接返回 400。
  </Accordion>

  <Accordion title="速率限制是多少？">
    **預設 500 張/分鐘**（Max Images per Minute），各版本統一。如果業務需要更高配額，請聯絡商務告知預估 QPS，可申請擴容資源。
  </Accordion>

  <Accordion title="生成失敗會扣費嗎？">
    **不會**。BytePlus 自帶內容安全稽核，觸發稽核或引數非法時直接返回 `400`/`403` 錯誤並**不計費**。其它常見 0 計費錯誤：`401`（令牌無效）、`429`（限流）。**只有請求實際進入模型生成階段（200 + 有效響應）才按張計費**。
  </Accordion>

  <Accordion title="可以用 OpenAI 官方 SDK 直連嗎？">
    可以，零程式碼改動。把 `base_url` 指向 `https://api.apiyi.com/v1`，擴充套件引數（`image` / `sequential_image_generation` / `watermark` 等）通過 `extra_body` 透傳：

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(api_key="sk-your-key", base_url="https://api.apiyi.com/v1")
    resp = client.images.generate(
        model="seedream-5-0-260128",
        prompt="...",
        size="2K",
        extra_body={
            "image": ["https://.../ref.png"],
            "sequential_image_generation": "disabled",
            "watermark": False,
        }
    )
    ```
  </Accordion>

  <Accordion title="生成的圖片版權歸誰？">
    通過 API 生成的圖片，使用者擁有完整的使用權，可用於商業和非商業用途。具體條款詳見 BytePlus 服務協議。
  </Accordion>

  <Accordion title="支援透明背景嗎？">
    `seedream-5-0` / `seedream-5-0-pro` 支援 `png` 輸出格式，可在 prompt 中要求"transparent background, alpha channel"得到帶透明的圖。`seedream-4-5` / `4-0` 僅 `jpeg` 輸出，**不支援透明背景**，需自行後處理摳圖。
  </Accordion>

  <Accordion title="主動取消生成任務可以嗎？">
    **不支援**。`/v1/images/generations` 是同步端點，請求一旦提交會跑到結束。客戶端即使斷開連線，服務端仍會完整執行並照常計費。建議客戶端做好超時控制，不要依賴"斷連不計費"。
  </Accordion>
</AccordionGroup>

## 相關文件

* [文生圖 Playground](/zh-Hant/api-capabilities/seedream-image/text-to-image) - `POST /v1/images/generations` 線上除錯，5 段語言程式碼示例
* [圖片編輯 Playground](/zh-Hant/api-capabilities/seedream-image/image-edit) - `image` + `sequential_image_generation` 用法詳解
* [歷史版本與遷移](/zh-Hant/api-capabilities/seedream-image/historical-versions) - 5.0 / 4.5 / 4.0 規格對比、價格差異、遷移建議
* [Seedream 4.5 上線公告](/news/seedream-4-5-launch) - News 文章
* [API 使用手冊](/zh-Hant/api-manual) - 通用呼叫規範
* [影像生成測試工具](https://imagen.apiyi.com/) - 線上試玩
* BytePlus 官方文件：`docs.byteplus.com/en/docs/ModelArk/1824121` - Seedream 4.0-5.0 tutorial（英文）

<Info>
  Seedream 系列是 API易 與 BytePlus 火山方舟達成戰略合作後推出的高品質影像生成服務。三個版本統一接入、統一計費、統一鑑權，按需切換。如有問題或建議，歡迎在控制台工單中反饋。
</Info>
