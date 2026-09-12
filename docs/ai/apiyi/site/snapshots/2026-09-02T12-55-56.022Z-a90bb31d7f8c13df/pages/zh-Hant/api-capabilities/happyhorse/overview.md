> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 影片生成（阿里雲）

> 阿里雲 HappyHorse-1.1 影片生成系列完整指南：文生影片 / 圖生影片 / 參考圖生影片（≤9 張參考圖）/ 影片編輯，統一 DashScope 非同步端點，主體高度還原。

## 概述

**HappyHorse（快馬）** 是阿里系影片生成模型系列，主打**高度還原的動態畫面生成**——精準理解文本語義，輸出流暢自然、細節豐富、主體保持穩定的高品質影片。API易 通過 **DashScope 透傳通道** 直連，讓你用一個 API易 Key 即可呼叫全部 HappyHorse 能力。當前主力版本 **HappyHorse-1.1**（影片編輯為 1.0）覆蓋四種核心玩法：

| 玩法         | 模型 ID                       | 你給的輸入               | 產出                     |
| ---------- | --------------------------- | ------------------- | ---------------------- |
| **文生影片**   | `happyhorse-1.1-t2v`        | 一段文本 prompt         | 短影片                    |
| **圖生影片**   | `happyhorse-1.1-i2v`        | 首幀圖 + prompt        | 讓靜態圖"動起來"（**不支援音訊驅動**） |
| **參考圖生影片** | `happyhorse-1.1-r2v`        | 最多 9 張參考圖 + prompt  | 主體與場景高度還原的影片           |
| **影片編輯**   | `happyhorse-1.0-video-edit` | 影片 + 最多 5 張參考圖 + 指令 | 局部/全域性編輯後的影片           |

<Note>
  **🐎 核心亮點**：四種能力共用同一個非同步端點和同一套請求結構，**切換玩法只改 `model` 欄位**。HappyHorse 偏「高度還原動態畫面」，參考圖生影片支援 **最多 9 張參考圖**、影片編輯支援 **最多 5 張參考圖**，主體一致性強。與 [Wan 系列](/zh-Hant/api-capabilities/wan/overview) 同端點、可直接互換。
</Note>

<CardGroup cols={2}>
  <Card title="文生影片 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v`，純文本提示詞生成影片。
  </Card>

  <Card title="圖生影片 API" icon="image" href="/zh-Hant/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v`，首幀圖生成影片（無音訊驅動）。
  </Card>

  <Card title="參考圖生影片 API" icon="users" href="/zh-Hant/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v`，最多 9 張參考圖保持主體。
  </Card>

  <Card title="影片編輯 API" icon="scissors" href="/zh-Hant/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit`，最多 5 張參考圖編輯影片。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——非同步輪詢、**不能用 `/v1/videos`**、缺 `X-DashScope-Async` 頭會報錯、`duration` 必須是整數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 HappyHorse 的文生影片、圖生影片、參考生影片與影片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 HappyHorse 的影片生成（文生影片 / 圖生影片 / 參考生影片 / 影片編輯）。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/happyhorse/overview.md](https://docs.apiyi.com/api-capabilities/happyhorse/overview.md) 拿到本頁純文本版；四種能力各有一頁（text-to-video、image-to-video、reference-to-video、video-edit），同樣加 `.md` 字尾。

  接入要求：

  1. 端點和非同步頭（**最容易一上來就卡住的兩條**）：提交必須打 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，而且**必須帶請求頭 `X-DashScope-Async: enable`**。**絕對不要用 `/v1/videos`**——那條路會把 `media` 欄位丟掉，上游報 `[InvalidParameter] Field required: input.media`。輪詢用的是**另一個字首**：`GET /v1/tasks/{task_id}`，需要帶 `Authorization`。

  2. 輪詢與狀態：任務 ID 在提交響應的 **`output.task_id`**。輪詢每 5 到 10 秒一次，**不要小於 3 秒**（會被限流），客戶端整體給 20 分鐘兜底——720P 5 秒的典型耗時約 105 到 115 秒，1080P 或長影片會明顯更久。輪詢響應裡的狀態是 `submitted` / `in_progress` / `completed` / `failed`，**成功是 `completed`**。`progress` 長時間停在 30% 是正常的，上游彙報粒度粗，不是卡住了。任務 ID 有 **24 小時**有效期。

  3. 影片落地：地址在輪詢響應的 **`result_url`**，是 OSS 簽名直鏈、**24 小時過期**。拿到後**立即在服務端下載轉存到自己的 OSS / CDN**，不要存進資料庫當長期地址。下載這條直鏈時**不要帶 `Authorization` 頭**，帶了反而會 403。

  4. 請求體結構與型別：body 是 DashScope 的巢狀結構 `{ model, input: { prompt, media[] }, parameters: { ... } }`，不是扁平的。兩個型別坑：**`duration` 必須是整數 `5`，不能是字串 `"5"`**；**`resolution` 要寫大寫 `720P` / `1080P`**，本模型**沒有 480P**。

  5. 模型名與引數：四個模型是 `happyhorse-1.1-t2v` / `happyhorse-1.1-i2v` / `happyhorse-1.1-r2v` / `happyhorse-1.0-video-edit`——注意**影片編輯那個是 `video-edit`，帶連字元**（跟 Wan 的 `videoedit` 寫法相反，別混）。`duration` 是 2 到 15 的整數、預設 5；`resolution` 預設 `720P`；`prompt_extend` 預設 `true`，建議保持開啟。兩個要注意的點：**HappyHorse 的圖生影片不支援 `driving_audio`**（那是 Wan 才有的），傳了沒用；**影片編輯的輸出時長跟隨輸入影片，`duration` 不起作用**，通常不用傳。

  6. 媒體輸入：放在 `input.media[]`，每項形如 `{"type": ..., "url": ...}`，`url` 要是**公網可直接 GET 的 https 連結**（JPEG / PNG / WEBP），本地檔案要先傳到自己的 OSS。各能力的型別和張數：圖生影片要正好 1 張 `first_frame`；參考生影片要 1 到 9 張 `reference_image`；影片編輯要 1 個 `video` 加 1 到 5 張 `reference_image`。缺 `media` 時上游會報「圖生影片模型 ... 必須提供圖片」。

  7. 計費與冪等：**按秒計費、按解析度分檔**，1080P 明顯貴於 720P；影片編輯按實際輸出秒數計費（跟隨源影片，不看 `duration`）。任務進入 `failed` **不計費**，但**重複提交同一個任務會重複計費**——業務層要做冪等，不要寫無腦自動重試。錯誤分兩個階段：提交階段被閘道拒（HTTP 4xx/5xx，`type` 為 `task_error` / `parse_request_failed` 等）說明請求體有問題，立刻改不要重試；執行階段是任務 `failed` 且 `error.message` 帶方括號字首，其中 `[InvalidImageUrl]` 可能是媒體連結臨時不可達、可以重試，`[InvalidParameter]` 或敏感詞**不要重試**。5xx 和網路錯誤做指數退避。

  8. 令牌要求：本模型需要令牌帶 `Wan&HappyHorse` 分組，且計費模式是**按量優先或按量計費**——**按次計費的令牌路由不過去**。

  9. Key 從環境變數 `APIYI_API_KEY` 讀，不要硬編碼進程式碼、也不要提交進 git。

  10. 改完真跑一次文生影片 + 一次圖生影片，把生成的影片和這兩次呼叫的花費貼給我。注意整個流程要幾分鐘，如果你在受限的執行環境裡跑，記得把命令超時放到 600 秒以上或者放後臺。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                      | 擋掉的坑                                                    |
  | ----------------------- | ------------------------------------------------------- |
  | 不能用 `/v1/videos`        | 那條路會靜默丟掉 `media` 欄位，上游報缺少 `input.media`，看起來像引數寫錯其實是端點選錯 |
  | 必須帶 `X-DashScope-Async` | 缺這個頭會被當成同步呼叫直接拒絕                                        |
  | 提交與輪詢字首不同               | 提交在 `/wan/api/v1/...`，輪詢卻在 `/v1/tasks/{task_id}`        |
  | 模型名是 `video-edit` 帶連字元  | 與 Wan 的 `wan2.7-videoedit`（無連字元）相反，兩個系列一起接時最容易寫錯        |
  | i2v 沒有 `driving_audio`  | 那是 Wan 獨有的能力，照搬 Wan 的程式碼會白傳一個無效欄位                       |
  | 重複提交會重複計費               | 失敗不計費，但無腦重試等於多付錢，必須自己做冪等                                |
  | 下載不帶 `Authorization`    | OSS 簽名直鏈帶 Auth 反而 403，且連結 24 小時過期                       |
</Accordion>

## 為什麼選 API易 的 HappyHorse

<CardGroup cols={2}>
  <Card title="一個 Key 調全部能力" icon="key">
    無需註冊阿里雲、無需配置地域。一把 API易 Key 即可呼叫 HappyHorse 全部四種能力以及 [Wan 系列](/zh-Hant/api-capabilities/wan/overview)。
  </Card>

  <Card title="國內直連 · 免出海" icon="globe">
    直連 `api.apiyi.com`，國內機房、家寬網路均可訪問。
  </Card>

  <Card title="失敗不計費" icon="circle-check">
    任務進入 `failed` 狀態（媒體 URL 不可達、prompt 涉敏等）**不計費**，可放心重試。
  </Card>

  <Card title="DashScope 協議透傳" icon="plug">
    與 Wan 系列共用同一端點和 schema，已有 Wan 程式碼切 `model` 名即可呼叫 HappyHorse。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="四合一非同步端點" icon="list-check">
    t2v / i2v / r2v / video-edit 共用 `POST /wan/api/v1/...video-synthesis`，提交後返回 `task_id`，輪詢 + 下載。
  </Card>

  <Card title="主體高度還原" icon="target">
    模型整體偏「高度還原動態畫面」風格，人物/物體在動態過程中保持得更穩。
  </Card>

  <Card title="最多 9 張參考圖" icon="images">
    `happyhorse-1.1-r2v` 官方支援最多 9 張 `reference_image`，多參考圖場景的主體一致性更強。
  </Card>

  <Card title="多檔解析度與時長" icon="expand">
    720P / 1080P 解析度，2–15 秒整數時長，`prompt_extend` 智慧改寫提升短 prompt 畫質。
  </Card>
</CardGroup>

## 支援的模型

| 模型 ID                       | 能力     | 必需媒體輸入                              | 說明                      |
| --------------------------- | ------ | ----------------------------------- | ----------------------- |
| `happyhorse-1.1-t2v`        | 文生影片   | 無                                   | 純文本生成                   |
| `happyhorse-1.1-i2v`        | 圖生影片   | `first_frame`                       | **不支援** `driving_audio` |
| `happyhorse-1.1-r2v`        | 參考圖生影片 | `reference_image`（最多 9 張）           | 多參考圖主體保持                |
| `happyhorse-1.0-video-edit` | 影片編輯   | `video` + `reference_image`（最多 5 張） | 模型名 **有連字元**            |

## 分組介紹

HappyHorse 與 [Wan](/zh-Hant/api-capabilities/wan/overview) 兩個系列**共用同一個 `Wan&HappyHorse` 分組**——一把令牌即可同時呼叫兩個系列。影片模型按**秒**計費，令牌必須同時滿足兩個條件才能成功路由：

1. **計費模式**：選「按量優先」或「按量計費」—— 影片按秒計費，**按次計費的令牌無法路由**
2. **分組**：選擇包含 `Wan&HappyHorse`

<Frame caption="建立令牌：計費模式選「按量優先」，分組選 Wan&HappyHorse（0.14x），即可呼叫 Wan2.7 與 HappyHorse 全部影片模型（截圖中為分組舊名 Wan，現已更名 Wan&HappyHorse）">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="建立令牌介面：計費模式選「按量優先」，分組下拉中選擇 Wan&HappyHorse（倍率 0.14x），令牌可同時用於 Wan2.7 與 HappyHorse" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 模型定價

### 預設價格 = 阿里雲官方原價的 98％（理解簡單）

**API易 系統已內建 HappyHorse 全部模型的價格**，無需任何手動配置，通過分組折扣自動生效。控制台裡 `Wan&HappyHorse` 分組顯示倍率 **0.14x**，這是按**人民幣**計價單位計的。本站統一用**美元充值、固定匯率 1:7**，實際折算：

```
0.14（人民幣計價單位） × 7（固定匯率） = 0.98
```

也就是說，**預設價格 = 阿里雲官方原價的 98%（98 折）**——比官方直採更省，且無需自建出海鏈路。

> 換算公式：**本站每秒美元價 = 官方人民幣原價 × 0.14**（即 `× 0.98 ÷ 7`）。

### 價格明細（預設價，按秒計費）

HappyHorse-1.1 文生 / 圖生 / 參考生影片同價，僅 `720P` / `1080P` 兩檔（不支援 480P）：

| 解析度     | 官方原價   | 本站預設價/秒   | 5 秒    | 10 秒   | 12 秒   |
| ------- | ------ | --------- | ------ | ------ | ------ |
| `720P`  | ¥0.9/秒 | \$0.126/秒 | \$0.63 | \$1.26 | \$1.51 |
| `1080P` | ¥1.6/秒 | \$0.224/秒 | \$1.12 | \$2.24 | \$2.69 |

<Info>
  * `happyhorse-1.0-video-edit`（影片編輯）輸出時長跟隨源影片，按實際輸出秒數計費，不由 `duration` 決定。
  * 表中為 **預設價（官方 98%）**；疊加充值加贈最高檔約為表中價 **÷ 1.2**（例：1080P 5 秒 \$1.12 → 約 \$0.93）。
</Info>

### 疊加充值加贈，折扣進一步走低

參與 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 後，到賬額度最高可放大約 1.2 倍，等效價格進一步下探：

```
0.98 ÷ 1.2 ≈ 0.816
```

即大客戶最低可做到 **官網約 81 折**（0.98 ÷ 1.2 ≈ 0.816）。

| 檔位             | 等效價格（對比阿里雲官方原價）     | 演算法               |
| -------------- | ------------------- | ----------------- |
| 預設             | **98%**（98 折）       | 倍率 0.14x × 固定匯率 7 |
| 疊加充值加贈（大客戶最高檔） | **約 81.6%**（約 81 折） | 0.98 ÷ 1.2        |

<Info>
  * 計費維度 = **解析度檔位 × 時長（秒）**，失敗任務不計費。
  * 1:7 為**固定結算匯率**（不是優惠匯率），所有美元充值統一適用。
  * 充值加贈的最高加贈檔位與適用渠道見 [充值加贈活動](/zh-Hant/faq/recharge-promotions)。最新倍率以 [控制台](https://api.apiyi.com/token) 為準。
</Info>

## ⚠️ 端點選擇（最重要）

API易 同時掛載兩條路徑，**只有 DashScope 透傳端點對 HappyHorse 全部能力完整可用**：

| 路徑                                                           | 協議風格           | i2v / r2v 可用性 | 結論        |
| ------------------------------------------------------------ | -------------- | ------------- | --------- |
| `/v1/videos`                                                 | OpenAI 扁平風格    | ❌ 媒體欄位會被丟棄    | **不要用**   |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope 原生透傳 | ✅ 完整可用        | **始終用這條** |

<Warning>
  HappyHorse 與 Wan 共用同一個透傳端點。看到任何文件/示例裡寫 `/v1/videos` 提交影片任務，**直接忽略**。所有建立請求都走 `/wan/api/v1/...video-synthesis`，查詢統一走 `/v1/tasks/{task_id}`。
</Warning>

## 非同步呼叫流程

整套流程是非同步的三步：**建立任務 → 輪詢狀態 → 下載影片**。

<Steps>
  <Step title="建立任務">
    `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，請求頭帶 `X-DashScope-Async: enable`，立刻返回 `task_id`。
  </Step>

  <Step title="輪詢狀態">
    `GET /v1/tasks/{task_id}`（帶 `Authorization`），每 5–10 秒查一次（**不要小於 3 秒**），直到 `status` 變為 `completed`。
  </Step>

  <Step title="下載影片">
    從響應的 `result_url` 直接 GET 下載 mp4，**不要帶 `Authorization` 頭**（OSS 簽名直鏈，帶 Auth 反而 403）。
  </Step>
</Steps>

### 任務狀態說明

| 狀態            | 含義      | 下一步操作                                |
| ------------- | ------- | ------------------------------------ |
| `submitted`   | 已提交，排隊中 | 繼續輪詢                                 |
| `in_progress` | 生成中     | 繼續輪詢（progress 常停在 30%，是上游彙報粒度粗，不是卡住） |
| `completed`   | 成功      | 從 `result_url` 下載                    |
| `failed`      | 失敗      | 看 `error.message` / `fail_reason`    |

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

# 1. 建立任務（切換玩法只改 model 和 media）
r = post("/wan/api/v1/services/aigc/video-generation/video-synthesis", {
    "model": "happyhorse-1.1-t2v",
    "input": {"prompt": "一隻貓在草地上奔跑，陽光明媚，鏡頭跟隨"},
    "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True}
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

### `media[]` 型別

| `type`            | 用途                                | 適用模型           |
| ----------------- | --------------------------------- | -------------- |
| `first_frame`     | 首幀圖（≤1 張）                         | i2v、r2v        |
| `reference_image` | 參考圖（r2v 最多 9 張，video-edit 最多 5 張） | r2v、video-edit |
| `video`           | 輸入影片                              | video-edit     |

<Warning>
  HappyHorse 的 i2v **不支援 `driving_audio`**（音訊驅動是 [Wan2.7-i2v](/zh-Hant/api-capabilities/wan/image-to-video) 的專屬能力）。做對口型 / rap 請用 Wan2.7。
</Warning>

### `parameters` 欄位

| 欄位              | 型別     | 取值               | 說明                          |
| --------------- | ------ | ---------------- | --------------------------- |
| `resolution`    | string | `720P` / `1080P` | 大寫，建議顯式指定                   |
| `duration`      | int    | 2–15             | 秒數（整數），常用 5 / 10            |
| `prompt_extend` | bool   | `true` / `false` | 智慧改寫 prompt，**強烈推薦 `true`** |
| `watermark`     | bool   | `true` / `false` | 右下角「AI 生成」水印                |
| `seed`          | int    | 0–2147483647     | 固定可提升可復現性                   |

<Tip>
  `duration` 必須是 **整數** `5` 而不是字串 `"5"`；`resolution` 寫 **大寫** `720P` 更穩。
</Tip>

## 如何選擇 HappyHorse 還是 Wan

HappyHorse 和 [Wan](/zh-Hant/api-capabilities/wan/overview) 都是阿里系影片模型、共用同一端點和 schema（只改 `model` 名即可互換），側重不同：

| 維度           | HappyHorse-1.1 | Wan2.7                            |
| ------------ | -------------- | --------------------------------- |
| 音訊驅動對口型（i2v） | ❌ 不支援，i2v 僅首幀  | ✅ `wan2.7-i2v` 支援 `driving_audio` |
| 參考圖生影片上限     | 參考圖最多 9 張      | 參考圖 + 參考影片合計 ≤5                   |
| 影片編輯參考圖      | ≤5 張           | ≤5 張                              |
| 風格側重         | 高度還原動態畫面，主體保持穩 | 多主體互動、音色參考                        |

<Tip>
  **需要多張參考圖保持主體一致** → 選 `happyhorse-1.1-r2v`（最多 9 張）。
  **需要對口型 / rap / 數字人口播** → 選 [Wan2.7-i2v](/zh-Hant/api-capabilities/wan/image-to-video)（唯一支援音訊驅動）。
</Tip>

## 最佳實踐

<Steps>
  <Step title="先用 720P / 5 秒聯調">
    開發期用低解析度短影片快速驗證 prompt 與參考圖效果，定型後再放大解析度與時長。
  </Step>

  <Step title="始終開 prompt_extend">
    `prompt_extend: true` 對短 prompt 的畫質提升明顯。
  </Step>

  <Step title="輪詢 5–10 秒一次">
    不要小於 3 秒（會被限流）。HappyHorse 各能力 720P / 5 秒典型耗時 105–115 秒。
  </Step>

  <Step title="客戶端超時設 20 分鐘兜底">
    1080P 或長影片顯著更慢，給輪詢迴圈設定 20 分鐘兜底超時。
  </Step>

  <Step title="拿到 result_url 立即下載落地">
    `result_url` 預設 **24 小時過期**，且是 OSS 簽名直鏈，下載時**不要帶 Authorization 頭**。
  </Step>
</Steps>

## 錯誤碼與重試

| 來源               | 特徵                                                                                       | 處理                             |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------------------ |
| **建立階段（API易 拒）** | HTTP 4xx/5xx，`type` 為 `task_error` / `parse_request_failed` / `build_request_failed`     | 改 body 重試（欄位型別錯、缺 media、用錯端點）  |
| **執行階段（上游阿里雲拒）** | 任務 `status=failed`，`error.message` 以 `[InvalidParameter]` / `[InvalidImageUrl]` 等方括號字首打頭 | 看方括號提示，多為媒體 URL 不可達或 prompt 涉敏 |

<Info>
  **建議客戶端**：HTTP 5xx / 網路錯誤做指數退避重試；HTTP 4xx 立刻 surface 不重試；任務 `failed` 含 `[InvalidImageUrl]` 可重試，含 `[InvalidParameter]` / 敏感詞不重試。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="HappyHorse 和 Wan 接入有差別嗎？">
    **沒有**。兩者共用同一個 DashScope 透傳端點、同一套請求結構、同一組 media type 名、同一個查詢端點。**切換隻改 `model` 欄位**（如 `wan2.7-t2v` → `happyhorse-1.1-t2v`），body 其餘部分一字不改。
  </Accordion>

  <Accordion title="HappyHorse 的 i2v 為什麼不能做對口型？">
    `happyhorse-1.1-i2v` 不支援 `driving_audio`（音訊驅動）欄位，i2v 只接受 `first_frame`。做對口型 / rap / 數字人口播請用 [Wan2.7-i2v](/zh-Hant/api-capabilities/wan/image-to-video)。
  </Accordion>

  <Accordion title="happyhorse-1.1-r2v 真的能塞 9 張參考圖嗎？">
    可以。官方說最多 9 張 `reference_image`，直接放在 `media` 數組裡即可。多參考圖能讓主體/服裝/場景一致性更強。
  </Accordion>

  <Accordion title="為什麼不能用 /v1/videos 提交？">
    `/v1/videos` 對 i2v / r2v 的 `media` 欄位適配不完整，會導致上游報 `[InvalidParameter] Field required: input.media`。**所有建立請求都走 `/wan/api/v1/services/aigc/video-generation/video-synthesis`**，查詢走 `/v1/tasks/{task_id}`。
  </Accordion>

  <Accordion title="result_url 下載報 403 怎麼辦？">
    去掉 `Authorization` 頭。`result_url` 已是 OSS 簽好名的直鏈，再帶 API易 Key 反而被 OSS 拒。`result_url` 預設 24 小時過期，請儘快下載落地。
  </Accordion>

  <Accordion title="失敗任務扣費嗎？">
    `status=failed` 不扣費。但重複提交相同任務會重複計費，做好冪等。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="文生影片 Playground" icon="wand-sparkles" href="/zh-Hant/api-capabilities/happyhorse/text-to-video">
    `happyhorse-1.1-t2v` 線上除錯
  </Card>

  <Card title="圖生影片 Playground" icon="image" href="/zh-Hant/api-capabilities/happyhorse/image-to-video">
    `happyhorse-1.1-i2v` 首幀生成
  </Card>

  <Card title="參考圖生影片 Playground" icon="users" href="/zh-Hant/api-capabilities/happyhorse/reference-to-video">
    `happyhorse-1.1-r2v` 最多 9 張參考圖
  </Card>

  <Card title="影片編輯 Playground" icon="scissors" href="/zh-Hant/api-capabilities/happyhorse/video-edit">
    `happyhorse-1.0-video-edit` 換裝 / 換背景
  </Card>

  <Card title="Wan 系列" icon="video" href="/zh-Hant/api-capabilities/wan/overview">
    同為阿里系，選型對照
  </Card>
</CardGroup>

<Info>
  HappyHorse 系列通過 API易 DashScope 透傳通道提供。如有問題或建議，歡迎在 [API易控制台](https://api.apiyi.com) 工單中反饋。
</Info>
