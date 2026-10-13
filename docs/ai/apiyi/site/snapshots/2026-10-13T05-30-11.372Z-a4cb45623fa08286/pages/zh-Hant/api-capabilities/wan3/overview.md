> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 影片生成（阿里雲通義萬相）

> 阿里雲通義萬相 Wan3.0 影片生成完整指南：一個模型 ID 覆蓋文生 / 圖生 / 參考生 / 影片編輯，最長 30 秒、480P-1080P、原生帶音軌，含標準版與優速版 Prime 的逐檔價格對照；預設 98 折，充值加贈最高檔低至官方 8.2 折、480P 低至 $0.0245/秒。

## 概述

**Wan3.0 是通義萬相的一體化影片模型**：和 Wan2.7 需要在 `t2v` / `i2v` / `r2v` / `videoedit` 四個模型 ID 之間切換不同，Wan3.0 **一個模型 ID 打通全部玩法**——傳什麼素材就做什麼事，文生、圖生、參考生、影片編輯都在同一個請求體裡完成。

兩個型號，能力相同、速度與價格不同：

| 模型 ID | 定位 | 相對速度 | 本站 720P 價格 | **充值加贈 20% 低至** |
| - | - | - | - | - |
| `wan3.0-video` | 標準版 | 基準 | \$0.0588/秒 | **\$0.049/秒**（≈ ¥0.34/秒） |
| `wan3.0-video-prime` | **優速版（Prime）** | 更快出片 | \$0.126/秒 | **\$0.105/秒**（≈ ¥0.74/秒） |

<Info>
  兩個型號的**引數、端點、素材規則完全一致**，只有速度與單價不同。先用 `wan3.0-video` 跑通流程，對出片時延敏感的線上業務再切 `wan3.0-video-prime`。
</Info>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——**不能用 `/v1/videos`**、缺 `X-DashScope-Async` 頭會報錯、終態是 `completed` 不是 `SUCCEEDED`、參考影片的秒數也要計費這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Wan3.0 的文生影片、圖生影片、參考生影片與影片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Wan3.0 的影片生成（文生影片 / 圖生影片 / 參考生影片 / 影片編輯）。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/wan3/overview.md](https://docs.apiyi.com/api-capabilities/wan3/overview.md) 拿到本頁純文本版；介面參考頁是 [https://docs.apiyi.com/api-capabilities/wan3/video-generation.md。](https://docs.apiyi.com/api-capabilities/wan3/video-generation.md。)

  接入要求：

  1. 端點和非同步頭（**最容易一上來就卡住的兩條**）：提交必須打 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，而且**必須帶請求頭 `X-DashScope-Async: enable`**。**絕對不要用 `/v1/videos`**——那條路會丟掉 `media` 欄位，解析度和時長引數也不生效，計費還會偏高。輪詢用的是**另一個字首**：`GET /v1/tasks/{task_id}`（輪詢不需要帶非同步頭）。

  2. 輪詢與狀態：任務 ID 在提交響應的 **`output.task_id`**。輪詢每 5 到 10 秒一次，**不要小於 3 秒**，客戶端整體給 20 分鐘兜底（5 秒影片實測 480P 約 100 秒、720P 約 120 秒、1080P 約 170 秒出片）。狀態是 `submitted` / `in_progress` / `completed` / `failed`，**成功是 `completed`，不是 DashScope 原生的 `SUCCEEDED`**，按原生列舉寫判斷會永遠輪詢不到終點。`progress` 長時間停在 30% 是正常的，不是卡住了。**引數和素材錯誤也是先返回 HTTP 200、再非同步 `failed`**，不能只看提交那一步的狀態碼。

  3. 影片落地：地址在頂層 **`result_url`**，是阿里雲 OSS 簽名直鏈、**24 小時過期**。拿到後**立即在服務端下載轉存到自己的 OSS / CDN**，不要存進資料庫當長期地址。下載這條直鏈時**不要帶 `Authorization` 頭**，帶了會 403。

  4. 請求體結構與型別：body 是 DashScope 的巢狀結構 `{ model, input: { prompt, media[] }, parameters: { ... } }`，不是扁平的。**`duration` 必須是整數 `5`，不能是字串 `"5"`**；**`resolution` 要寫大寫 `480P` / `720P` / `1080P`**。

  5. 模型與玩法：Wan3.0 **只有一個模型 ID**，文生 / 圖生 / 參考生 / 影片編輯全靠 `input.media[]` 裡每項的 `type` 區分——**不要照搬 Wan2.7 的 `t2v` / `i2v` / `r2v` / `videoedit` 四個模型 ID**（那是上一代模型，照樣能調通但不是 Wan3.0）。`wan3.0-video`（標準版）和 `wan3.0-video-prime`（優速版）引數完全一致，只有速度和單價不同，做成可配置項即可。`media` 每項形如 `{"type": ..., "url": ...}`：不傳 `media` 是文生影片；`first_frame`（可配 `last_frame`）是圖生影片；`reference_image` / `reference_video` / `reference_audio` 是參考生；`file` / `link` 是文件或網頁轉影片。**`first_frame` / `last_frame` 不能與 `reference_*` / `file` / `link` 混用**，混傳會被上游拒絕。`url` 必須是公網可直接 GET 的 https 連結，並且**在任務完成前一直可訪問**。多個素材時提示詞裡用「圖1 / 影片1」按 `media` 順序指代。

  6. 關鍵引數：**`resolution` 務必顯式傳**——它決定單價，480P 只有 1080P 的四分之一。不傳 `duration` 默認出 5 秒；**輸入參考影片時長 + 輸出 `duration` 合計不能超過 30 秒**，超了同樣是提交 200、任務 `failed`。`ratio` 可選 `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `adaptive`，**傳了首幀圖時會被自動忽略**。`prompt_extend` 預設 `true`，建議保持；`audio` 預設 `true`，輸出自帶音軌。

  7. 計費與冪等：**按秒計費、單價由輸出解析度決定，計費秒數 = 輸入參考影片時長 + 輸出時長**——傳 10 秒參考影片只出 2 秒，按 12 秒收；參考圖片、音訊、檔案不計費。想省錢就先把參考影片裁短，調小 `duration` 省不掉輸入那幾秒。**帶參考影片的任務提交時按 30 秒頂格預扣**，完成後自動退差額（賬單裡是一條負數記錄），餘額偏緊時要預留。任務 `failed` **全額退費**，但**重複提交同一個任務會重複計費**——業務層要維護「業務 ID 到 task\_id」的對映做冪等，不要寫無腦自動重試；內容稽核類失敗換提示詞，素材類失敗先查 URL 可達性。5xx 和網路錯誤做指數退避（1 秒 / 4 秒 / 16 秒）。

  8. 令牌要求：本模型需要令牌帶 `Wan&HappyHorse` 分組，且計費模式是**按量優先或按量計費**——**按次計費的令牌路由不過去**，會報「該模型無可用渠道」。

  9. Key 從環境變數 `APIYI_API_KEY` 讀，不要硬編碼進程式碼、也不要提交進 git。

  10. 改完真跑一次 480P 文生影片 + 一次圖生影片，把生成的影片和這兩次呼叫的花費貼給我。注意整個流程要幾分鐘，如果你在受限的執行環境裡跑，記得把命令超時放到 600 秒以上或者放後臺。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求 | 擋掉的坑 |
  | - | - |
  | 不能用 `/v1/videos` | 那條路會丟掉 `media`、解析度和時長不生效、計費偏高，看起來像引數寫錯其實是端點選錯 |
  | 必須帶 `X-DashScope-Async` | 缺這個頭會被當成同步呼叫直接拒絕 |
  | 成功狀態是 `completed` | 按 DashScope 原生的 `SUCCEEDED` 寫判斷，會永遠輪詢不到終點 |
  | 只有一個模型 ID | 照搬 Wan2.7 的四個模型 ID 能調通，但調到的是上一代模型，時長上限和單價都不一樣 |
  | 首幀與參考素材互斥 | `first_frame` 和 `reference_*` 混傳會被上游拒絕，而且是非同步 `failed` |
  | 參考影片秒數也計費 | 只調小 `duration` 省不掉輸入那幾秒；帶參考影片還會先按 30 秒頂格預扣 |
  | 下載不帶 `Authorization` | OSS 簽名直鏈帶 Auth 反而 403 |
</Accordion>

## 相比 Wan2.7 的變化

| 維度 | Wan2.7 | **Wan3.0** |
| - | - | - |
| 模型 ID | 4 個（t2v / i2v / r2v / videoedit） | **1 個**（傳素材決定玩法） |
| 最長時長 | 15 秒（含參考影片時 10 秒） | **30 秒**（輸入+輸出合計） |
| 解析度 | 720P / 1080P | **480P** / 720P / 1080P |
| 音訊 | 需 `driving_audio` 驅動口型 | **預設輸出帶音軌** |
| 720P 單價 | \$0.084/秒 | **\$0.0588/秒**（便宜約 30%） |
| 1080P 單價 | \$0.14/秒 | **\$0.1176/秒**（便宜約 16%） |

Wan2.7 仍可正常呼叫，文件見 [Wan2.7 影片生成](/zh-Hant/api-capabilities/wan/overview)。

## 核心特性

<CardGroup cols={2}>
  <Card title="一個模型打通四種玩法" icon="list-check">
    文生 / 圖生（首幀、尾幀）/ 參考生（圖、影片、音訊）/ 影片編輯共用同一個模型 ID 與端點，靠 `input.media[]` 的 `type` 區分。
  </Card>

  <Card title="最長 30 秒長影片" icon="clock">
    單次最長 30 秒（輸入參考影片 + 輸出影片合計），比 Wan2.7 的 15 秒翻倍，適合完整口播段落與短劇分鏡。
  </Card>

  <Card title="原生音軌" icon="volume-2">
    輸出預設自帶 `soun` 音軌，無需額外傳驅動音訊；也可用 `reference_audio` 指定音色參考。
  </Card>

  <Card title="三檔解析度" icon="expand">
    新增 480P 檔，草稿階段單價只有 1080P 的四分之一，定稿再升檔，成本可控。
  </Card>
</CardGroup>

## 分組介紹

Wan3.0 與 Wan2.7、[HappyHorse](/zh-Hant/api-capabilities/happyhorse/overview) **共用同一個 `Wan&HappyHorse` 分組**——一把令牌即可呼叫全部型號。影片按**秒**計費，令牌必須同時滿足兩個條件才能成功路由：

1. **計費模式**：選「按量優先」或「按量計費」——影片按秒計費，**按次計費的令牌無法路由**
2. **分組**：選擇包含 `Wan&HappyHorse`

<Frame caption="建立令牌：計費模式選「按量優先」，分組選 Wan&HappyHorse（0.14x），即可呼叫 Wan3.0 / Wan2.7 / HappyHorse 全部影片模型（截圖中為分組舊名 Wan，現已更名 Wan&HappyHorse）">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="建立令牌介面：計費模式選「按量優先」，分組下拉中選擇 Wan&HappyHorse（倍率 0.14x）" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 模型定價

<Info>
  **預設 98 折，疊加充值加贈最高檔低至官方 8.2 折。** 480P 低至 **\$0.0245/秒**（≈ ¥0.17/秒），
  720P 低至 **\$0.049/秒**（≈ ¥0.34/秒）——按 `wan3.0-video` 計。
</Info>

### 換算口徑：預設 98 折，加贈後低至 8.2 折

控制台裡 `Wan&HappyHorse` 分組顯示倍率 **0.14x**，這是按**人民幣**計價單位計的。本站統一用**美元充值、固定匯率 1:7**：

```
0.14（人民幣計價單位） × 7（固定匯率） = 0.98
```

即 **本站每秒美元價 = 阿里雲官方每秒人民幣價 × 0.14**，等於官方價的 98%。

### 表一：本站價格明細（按秒計費）

| 模型 | 解析度 | 預設價 | 送 10%（一般） | **送 20%（大客）** | 大客價折人民幣 |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/秒 | \$0.0267/秒 | **\$0.0245/秒** | ¥0.1715/秒 |
| `wan3.0-video` | 720P | \$0.0588/秒 | \$0.0535/秒 | **\$0.049/秒** | ¥0.343/秒 |
| `wan3.0-video` | 1080P | \$0.1176/秒 | \$0.1069/秒 | **\$0.098/秒** | ¥0.686/秒 |
| `wan3.0-video-prime` | 480P | \$0.063/秒 | \$0.0573/秒 | **\$0.0525/秒** | ¥0.3675/秒 |
| `wan3.0-video-prime` | 720P | \$0.126/秒 | \$0.1145/秒 | **\$0.105/秒** | ¥0.735/秒 |
| `wan3.0-video-prime` | 1080P | \$0.252/秒 | \$0.2291/秒 | **\$0.21/秒** | ¥1.47/秒 |

| 檔位 | 相當於阿里雲官方價 | 演算法 |
| - | - | - |
| 預設 | **98 折** | 倍率 0.14x × 固定匯率 7 |
| 充值送 10%（一般） | **約 8.9 折** | 0.98 ÷ 1.1 |
| 充值送 20%（大客） | **約 8.2 折** | 0.98 ÷ 1.2 |

「送 10% / 送 20%」指 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 到賬額度放大後的**等效單價**，賬單上的扣費仍按預設價計。

### 表二：與阿里雲官方逐檔對照

| 模型 | 解析度 | 官方原價 | 官方現價 | 本站預設價（折人民幣） | 相當於官方現價 | **加贈 20% 後** |
| - | - | - | - | - | - | - |
| `wan3.0-video` | 480P | ¥0.30/秒 | **¥0.21/秒** | ¥0.2058/秒 | 98 折 | **¥0.1715/秒 · 8.2 折** |
| `wan3.0-video` | 720P | ¥0.60/秒 | **¥0.42/秒** | ¥0.4116/秒 | 98 折 | **¥0.343/秒 · 8.2 折** |
| `wan3.0-video` | 1080P | ¥1.20/秒 | **¥0.84/秒** | ¥0.8232/秒 | 98 折 | **¥0.686/秒 · 8.2 折** |
| `wan3.0-video-prime` | 480P | ¥0.45/秒 | ¥0.45/秒 | ¥0.441/秒 | 98 折 | **¥0.3675/秒 · 8.2 折** |
| `wan3.0-video-prime` | 720P | ¥0.90/秒 | ¥0.90/秒 | ¥0.882/秒 | 98 折 | **¥0.735/秒 · 8.2 折** |
| `wan3.0-video-prime` | 1080P | ¥1.80/秒 | ¥1.80/秒 | ¥1.764/秒 | 98 折 | **¥1.47/秒 · 8.2 折** |

<Info>
  `wan3.0-video` 官方當前有**限時 7 折**（所有使用者預設享受），本站價已跟隨折後價；`wan3.0-video-prime` 官方無折扣。官方促銷結束後本站價會同步調整。
</Info>

### 表三：常用時長的單次總價

| 模型 | 解析度 | 5 秒 | 10 秒 | 30 秒（上限） |
| - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.147 | \$0.294 | \$0.882 |
| `wan3.0-video` | 720P | \$0.294 | \$0.588 | \$1.764 |
| `wan3.0-video` | 1080P | \$0.588 | \$1.176 | \$3.528 |
| `wan3.0-video-prime` | 480P | \$0.315 | \$0.63 | \$1.89 |
| `wan3.0-video-prime` | 720P | \$0.63 | \$1.26 | \$3.78 |
| `wan3.0-video-prime` | 1080P | \$1.26 | \$2.52 | \$7.56 |

### 疊加充值加贈

參與 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 後到賬額度最高放大約 1.2 倍，等效價格進一步下探：

```
0.98 ÷ 1.2 ≈ 0.816
```

| 檔位 | 等效價格（對比阿里雲官方價） | 演算法 |
| - | - | - |
| 預設 | **98 折** | 倍率 0.14x × 固定匯率 7 |
| 充值送 10%（一般） | **約 8.9 折** | 0.98 ÷ 1.1 |
| 充值送 20%（大客，最高檔） | **約 8.2 折** | 0.98 ÷ 1.2 |

1:7 為**固定結算匯率**（不是優惠匯率），所有美元充值統一適用。

<Note>模型價格與官網對齊，且可能隨官網調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。</Note>

## ⚠️ 計費規則（和別的影片模型不一樣）

<Warning>
  **計費秒數 = 輸入參考影片時長 + 輸出影片時長。** 官方原文：「輸入影片和輸出影片均按時長計費，價格由輸出影片解析度決定」。
</Warning>

| 規則 | 說明 |
| - | - |
| 參考**影片**的秒數要計費 | 傳了 10 秒的 `reference_video`、只要 2 秒輸出，按 **12 秒** 計費 |
| 參考**圖片 / 音訊 / 檔案**不計費 | 只有影片素材進計費時長 |
| 單價看**輸出**解析度 | 輸入影片是 720P、輸出 1080P，整段都按 1080P 單價 |
| 合計上限 30 秒 | 輸入 + 輸出 > 30 秒會被上游拒絕 |
| 不傳 `duration` | 預設輸出 5 秒，按 5 秒計費 |
| 失敗任務 | **全額退費**，不需要找客服 |

<Tip>
  想省錢就**裁短參考影片**，調小 `duration` 省不掉輸入那幾秒。例：10 秒參考影片 + 2 秒輸出 = 12 秒計費，而把參考影片裁到 3 秒後同樣出 2 秒，只需 5 秒計費。
</Tip>

### 預扣與結算

* **不帶參考影片**：按請求的 `duration` 預扣，金額即最終金額，沒有結算行。
* **帶參考影片**：提交時閘道還不知道輸入影片多長，按**上限 30 秒頂格預扣**，任務完成後按實際計費秒數重算、差額自動退回（賬單裡是一條單獨的負數記錄）。

<Info>
  頂格預扣會**臨時凍結**一筆較大額度：480P \$0.147、720P \$0.294、1080P \$0.588（`wan3.0-video`，30 秒）。餘額偏緊時請預留，退款在任務完成後數秒內到賬。
</Info>

## ⚠️ 端點選擇（最重要）

API易 同時掛載兩條路徑，**只有 DashScope 透傳端點對 Wan3.0 完整可用**：

| 路徑 | 協議風格 | 可用性 | 結論 |
| - | - | - | - |
| `/v1/videos` | OpenAI 扁平風格 | ❌ 媒體欄位被丟棄，**且計費不準確** | **不要用** |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope 原生透傳 | ✅ 完整可用 | **始終用這條** |

<Warning>
  看到任何文件/示例裡寫 `/v1/videos` 提交 Wan 影片任務，**直接忽略**。該路徑不僅會丟棄 `media` 欄位，**解析度與時長引數也不生效、計費會偏高**。所有 Wan3.0 請求都走 `/wan/api/v1/...video-synthesis`。
</Warning>

## 非同步呼叫流程

<Steps>
  <Step title="建立任務">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，請求頭帶 `X-DashScope-Async: enable`，立刻返回 `task_id`。
  </Step>

  <Step title="輪詢狀態">
    `GET /v1/tasks/{task_id}`（帶 `Authorization`），每 5–10 秒查一次（**不要小於 3 秒**），直到 `status` 變為 `completed`。
  </Step>

  <Step title="下載影片">
    從響應的 `result_url` 直接 GET 下載 mp4，**不要帶 `Authorization` 頭**（它是 OSS 簽名直鏈，帶 Auth 反而 403），有效期 24 小時。
  </Step>
</Steps>

### 任務狀態說明

| 狀態 | 含義 | 下一步操作 |
| - | - | - |
| `submitted` | 已提交，排隊中 | 繼續輪詢 |
| `in_progress` | 生成中 | 繼續輪詢（progress 常停在 30%，是上游彙報粒度粗，不是卡住） |
| `completed` | 成功 | 從 `result_url` 下載 |
| `failed` | 失敗 | 看 `error.message` / `fail_reason`，**不計費** |

<Warning>
  終態字串是 **`completed` / `failed`**，不是 DashScope 原生的 `SUCCEEDED` / `FAILED`。按原生列舉寫判斷會永遠輪詢不到終點。
</Warning>

<Tip>
  **引數不合法也是先返回 HTTP 200、再非同步 `failed`**，不是同步 400。例如素材 URL 下載不了、輸入+輸出超 30 秒，都要輪詢到終態才知道。客戶端不能只看提交那一步的狀態碼。
</Tip>

### 完整 Python 客戶端

```python theme={null}
import json, time, urllib.request

BASE = "https://api.apiyi.com"
KEY  = "sk-your-api-key"   # 你的 API易 Key

def post(path, body):
    h = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
         "X-DashScope-Async": "enable"}
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": f"Bearer {KEY}"})
    return json.loads(urllib.request.urlopen(req).read())

# 1. 建立任務（換玩法只改 input.media，模型 ID 不變）
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "wan3.0-video",
    "input": {"prompt": "黃昏海邊的燈塔，鏡頭緩慢推進，海浪輕拍礁石，海鳥叫聲"},
    "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True}
})
task_id = r["output"]["task_id"]
print("task_id:", task_id)

# 2. 輪詢（5–10 秒一次）
while True:
    info = get(f"/v1/tasks/{task_id}")
    status = info["status"]
    print("status:", status, "progress:", info.get("progress"))
    if status == "completed":
        url = info["result_url"]
        break
    if status == "failed":
        raise RuntimeError(info.get("error") or info.get("fail_reason"))
    time.sleep(10)

# 3. 下載（不要帶 Authorization！result_url 是 OSS 簽名直鏈）
urllib.request.urlretrieve(url, "out.mp4")
print("saved out.mp4")
```

## 關鍵引數詳解

提交時 body 為 DashScope 巢狀結構：`{ model, input: { prompt, media[] }, parameters: {...} }`。

### `input` 欄位

| 欄位 | 型別 | 必填 | 說明 |
| - | - | - | - |
| `prompt` | string | ✓ | 自然語言描述；有多個素材時用「圖1 / 影片1」在 prompt 裡指代 |
| `negative_prompt` | string | | 反向提示詞 |
| `media` | array | 非文生影片時必填 | 媒體素材陣列，見下 |

### `media[]` 型別與玩法對應

| `type` | 玩法 | 說明 |
| - | - | - |
| 不傳 `media` | **文生影片** | 純文本 |
| `first_frame` | **圖生影片** | 以這張圖為首幀 |
| `last_frame` | 首尾幀生影片 | 與 `first_frame` 搭配使用 |
| `reference_image` | **參考生影片** | 保持主體 / 服裝 / 場景一致 |
| `reference_video` | 參考生影片 / 影片編輯 | **這段影片的時長要計費** |
| `reference_audio` | 音色 / 節奏參考 | 不計費 |
| `file` / `link` | 文件、網頁轉影片 | 不計費 |

<Warning>
  **`first_frame` / `last_frame` 不能與 `reference_*` / `file` / `link` 混用**，兩類素材互斥，混傳會被上游拒絕。
</Warning>

每個媒體物件至少含 `type` + `url`，`url` 必須是公網可直接 GET 的 https 連結（本地檔案先上傳到 OSS / CDN，且**在任務完成前保持可訪問**）。

### `parameters` 欄位

| 欄位 | 型別 | 取值 | 說明 |
| - | - | - | - |
| `resolution` | string | `480P` / `720P` / `1080P` | 大寫，**建議顯式指定**（決定單價） |
| `ratio` | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` / `adaptive` | 寬高比；傳了首幀圖時自動忽略 |
| `duration` | int | 整數秒 | 輸出時長；不傳預設 5 秒，**輸入+輸出合計 ≤ 30** |
| `prompt_extend` | bool | `true` / `false` | 智慧改寫 prompt，預設 `true`，**建議保持** |
| `audio` | bool | `true` / `false` | 是否輸出音軌，預設 `true` |
| `watermark` | bool | `true` / `false` | 右下角「AI 生成」水印 |
| `seed` | int | 0–2147483647 | 固定可提升可復現性 |

<Tip>
  `duration` 必須是**整數** `5` 而不是字串 `"5"`；`resolution` 寫**大寫** `720P` 更穩。
</Tip>

## 怎麼選：Wan3.0 / Wan2.7 / HappyHorse

| 場景 | 推薦 |
| - | - |
| 要 30 秒長影片、要 480P 省錢檔、要原生音軌 | **Wan3.0** |
| 要音訊驅動對口型（`driving_audio`） | [Wan2.7 `i2v`](/zh-Hant/api-capabilities/wan/overview) |
| 對出片時延敏感的線上業務 | **`wan3.0-video-prime`** |
| 想要更低單價的同類能力 | [HappyHorse](/zh-Hant/api-capabilities/happyhorse/overview) |

## 最佳實踐

<AccordionGroup>
  <Accordion title="先用 480P 試 prompt，定稿再升 1080P" icon="wallet">
    480P 單價只有 1080P 的四分之一。prompt 與運鏡在 480P 調通後再升檔，一條 5 秒 1080P 的成本可以試四條草稿。
  </Accordion>

  <Accordion title="參考影片先裁剪再上傳" icon="scissors">
    輸入影片的秒數要計費。只需要其中 3 秒就別傳 30 秒的原片——這是 Wan3.0 上最容易被忽略的成本項。
  </Accordion>

  <Accordion title="prompt 寫動作，不要只寫畫面" icon="pen-line">
    影片模型吃的是「誰在做什麼、鏡頭怎麼動」。「一隻橘貓在窗臺伸懶腰，鏡頭緩慢推近」比「一隻可愛的橘貓，陽光，高畫質」有效得多。
  </Accordion>

  <Accordion title="輪詢間隔別小於 3 秒" icon="timer">
    480P 約 100 秒、720P 約 120 秒、1080P 約 170 秒出片（5 秒影片，實測）。5–10 秒輪詢一次足夠，過密只會浪費配額。
  </Accordion>

  <Accordion title="失敗不要自動重試同一條 prompt" icon="repeat">
    失敗任務全額退費，但重複提交會**重複計費**。內容稽核類失敗換 prompt，素材類失敗先檢查 URL 可達性。
  </Accordion>
</AccordionGroup>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼賬單上的秒數比我出的影片長？">
    因為計費秒數 = **輸入參考影片時長 + 輸出影片時長**。傳了 10 秒參考影片、出 2 秒成品，按 12 秒計費。參考圖片、音訊、檔案不計費。
  </Accordion>

  <Accordion title="為什麼剛提交就扣了一大筆，之後又退回來了？">
    帶參考影片的任務按上限 30 秒頂格預扣，任務完成後按實際秒數重算並退差額。賬單裡會看到一條負數的調整記錄。
  </Accordion>

  <Accordion title="任務一直是 in_progress / progress 停在 30%？">
    這是上游彙報粒度粗，不是卡住。1080P 或長影片可能要 3–5 分鐘，繼續輪詢即可。
  </Accordion>

  <Accordion title="result_url 下載報 403？">
    下載時**不要帶 `Authorization` 頭**，它是 OSS 簽名直鏈。連結 24 小時過期，請及時轉存。
  </Accordion>

  <Accordion title="提交返回 200，但任務 failed？">
    引數與素材類錯誤都是非同步失敗，不是同步 400。常見原因：素材 URL 下載不了（含過期簽名連結）、輸入+輸出超 30 秒、內容稽核攔截。失敗任務全額退費。
  </Accordion>

  <Accordion title="報「該模型無可用渠道」？">
    檢查令牌的**計費模式**是否為「按量優先 / 按量計費」（按次計費無法路由影片模型），以及**分組**是否包含 `Wan&HappyHorse`。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="影片生成 API 參考" icon="code" href="/zh-Hant/api-capabilities/wan3/video-generation">
    線上 Playground + cURL / Python / Node 示例
  </Card>

  <Card title="Wan2.7 影片生成" icon="video" href="/zh-Hant/api-capabilities/wan/overview">
    上一代四模型方案，支援音訊驅動對口型
  </Card>

  <Card title="HappyHorse 影片生成" icon="horse" href="/zh-Hant/api-capabilities/happyhorse/overview">
    同分組的另一影片系列
  </Card>

  <Card title="模型價格" icon="dollar-sign" href="/zh-Hant/models/index">
    全站模型價格總表（權威）
  </Card>
</CardGroup>

官方參考：`help.aliyun.com/zh/model-studio/wan3-video-generation-guide`、`help.aliyun.com/zh/model-studio/wan3-video-generation-api-reference`


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.