> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan 影片生成（阿里雲通義萬相）

> 阿里雲通義萬相 Wan2.7 影片生成系列完整指南：文生影片 / 圖生影片（含音訊驅動）/ 參考圖生影片 / 影片編輯，統一 DashScope 非同步端點，支援 720P / 1080P 與 2–15 秒時長。

## 概述

**Wan（通義萬相）** 是阿里雲推出的影片生成模型系列。API易 通過 **DashScope 透傳通道** 直連阿里雲百鍊，讓你用一個 `sk-` 開頭的 API易 Key 即可呼叫全部 Wan 影片能力，無需單獨註冊阿里雲賬號。當前主力版本為 **Wan2.7**，覆蓋四種核心玩法：

| 玩法         | 模型 ID              | 你給的輸入                  | 產出                       |
| ---------- | ------------------ | ---------------------- | ------------------------ |
| **文生影片**   | `wan2.7-t2v`       | 一段文本 prompt            | 5–15 秒短影片                |
| **圖生影片**   | `wan2.7-i2v`       | 首幀圖 + prompt（可選驅動音訊）   | 讓靜態圖"動起來"，配音訊可做對口型 / rap |
| **參考圖生影片** | `wan2.7-r2v`       | 1–5 個參考圖/影片 + prompt   | 保持參考主體特徵的單/多角色影片，支援音色參考  |
| **影片編輯**   | `wan2.7-videoedit` | 一段影片 + 1–5 張參考圖 + 編輯指令 | 換裝、換背景等編輯後的影片            |

<Note>
  **🎬 核心亮點**：四種能力共用同一個非同步端點和同一套請求結構，**切換玩法只改 `model` 欄位**。原生支援 720P / 1080P 解析度與 2–15 秒整數時長，`wan2.7-i2v` 還支援驅動音訊做對口型。適合短影片生產、電商素材、數字人口播、創意運營等場景。
</Note>

<CardGroup cols={2}>
  <Card title="文生影片 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/wan/text-to-video">
    `wan2.7-t2v`，純文本提示詞生成影片，最簡單的入口。
  </Card>

  <Card title="圖生影片 API" icon="image" href="/zh-Hant/api-capabilities/wan/image-to-video">
    `wan2.7-i2v`，首幀圖 + 可選驅動音訊，做對口型 / rap。
  </Card>

  <Card title="參考圖生影片 API" icon="users" href="/zh-Hant/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v`，參考圖/影片保持主體特徵，支援音色參考。
  </Card>

  <Card title="影片編輯 API" icon="scissors" href="/zh-Hant/api-capabilities/wan/video-edit">
    `wan2.7-videoedit`，影片 + 參考圖做換裝、換背景等編輯。
  </Card>

  <Card title="視覺化介面測試" icon="flask-conical" href="https://icover.ai/zh/wan-official">
    在 iCover 視覺化測試工具裡直接除錯本介面，無需寫程式碼。
  </Card>

  <Card title="非同步任務查詢 / 下載" icon="list-checks" href="https://api.apiyi.com/task">
    在 API易後臺檢視已提交的影片任務、下載影片連結（API 之外的查詢入口）。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——非同步輪詢、**不能用 `/v1/videos`**、缺 `X-DashScope-Async` 頭會報錯、`duration` 必須是整數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Wan2.7 的文生影片、圖生影片、參考生影片與影片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Wan2.7 的影片生成（文生影片 / 圖生影片 / 參考生影片 / 影片編輯）。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/wan/overview.md](https://docs.apiyi.com/api-capabilities/wan/overview.md) 拿到本頁純文本版；四種能力各有一頁（text-to-video、image-to-video、reference-to-video、video-edit），同樣加 `.md` 字尾。

  接入要求：

  1. 端點和非同步頭（**最容易一上來就卡住的兩條**）：提交必須打 `POST /wan/api/v1/services/aigc/video-generation/video-synthesis`，而且**必須帶請求頭 `X-DashScope-Async: enable`**，否則上游報 `current user api does not support synchronous calls`。**絕對不要用 `/v1/videos`**——那條路會把 `media` 欄位丟掉，上游報 `[InvalidParameter] Field required: input.media`。輪詢用的是**另一個字首**：`GET /v1/tasks/{task_id}`（輪詢不需要帶非同步頭）。

  2. 輪詢與狀態：任務 ID 在提交響應的 **`output.task_id`**。輪詢每 5 到 10 秒一次，**不要小於 3 秒**（會被限流），客戶端整體給 20 分鐘兜底。狀態是 `submitted` / `in_progress` / `completed` / `failed`，**成功是 `completed`**。`progress` 長時間停在 30% 是正常的——上游只彙報 0 / 10 / 30 / 100 四檔，不是卡住了。任務 ID 本身只有 **24 小時**查詢有效期，超過會返回 `UNKNOWN`。

  3. 影片落地：地址在頂層 **`result_url`**，是阿里雲 OSS 簽名直鏈、**24 小時過期**。拿到後**立即在服務端下載轉存到自己的 OSS / CDN**，不要存進資料庫當長期地址。下載這條直鏈時**不要帶 `Authorization` 頭**，帶了會 403 報 `SignatureDoesNotMatch`。

  4. 請求體結構與型別：body 是 DashScope 的巢狀結構 `{ model, input: { prompt, media[] }, parameters: { ... } }`，不是扁平的。兩個型別坑：**`duration` 必須是整數 `5`，不能是字串 `"5"`**（否則報 `cannot unmarshal string into Go struct field ... of type int`）；**`resolution` 要寫大寫 `720P` / `1080P`**，本模型**沒有 480P**。

  5. 關鍵引數：`duration` 是 2 到 15 的整數、預設 5（**帶參考影片時不能超過 10**）。`ratio` 五選一（`16:9` `9:16` `1:1` `4:3` `3:4`），預設 `16:9`，但**傳了首幀圖時 `ratio` 會被自動忽略**。`prompt_extend` 預設 `true`，強烈建議保持開啟。**注意 `wan2.7-r2v` 的 `resolution` 預設是 `1080P` 而不是 `720P`**，而計費是按解析度分檔的，不顯式指定會悄悄用上更貴的檔位——務必顯式傳。`wan2.7-videoedit` 的輸出時長跟隨輸入影片，`duration` 不起作用（模型名裡 **`videoedit` 沒有連字元**，別寫成 `video-edit`）。

  6. 媒體輸入：放在 `input.media[]`，每項形如 `{"type": ..., "url": ...}`，`url` 按文件口徑要是**公網可直接 GET 的 https 連結**。各能力的型別和張數：`first_frame` 最多 1 張（i2v 和 r2v）；`reference_image` 與 `reference_video` 在 r2v 裡**合計不超過 5 個**；`driving_audio` **只有 i2v 支援**；影片編輯要 1 個 `video` 加 1 到 5 張 `reference_image`。參考生影片的提示詞裡用「圖1 / 圖2」「影片1 / 影片2」按 `media` 陣列順序指代，圖和影片分別計數。

  7. 計費與冪等：**按秒計費、按解析度分檔**，1080P 明顯貴於 720P。任務進入 `failed` **不計費**，但**重複提交同一個任務會重複計費**——業務層要維護「業務 ID 到 task\_id」的對映做冪等，不要寫無腦自動重試。錯誤分兩個階段：提交階段被閘道拒（HTTP 4xx/5xx，`type` 為 `task_error` / `parse_request_failed` 等）說明請求體有問題，立刻改不要重試；執行階段是任務 `failed` 且 `error.message` 帶方括號字首，其中 `[InvalidImageUrl]` 可能是媒體連結臨時不可達、可以重試，`[InvalidParameter]` 或敏感詞**不要重試**。5xx 和網路錯誤做指數退避（1 秒 / 4 秒 / 16 秒）。

  8. 令牌要求：本模型需要令牌帶 `Wan&HappyHorse` 分組，且計費模式是**按量優先或按量計費**——**按次計費的令牌路由不過去**，會報「該模型無可用渠道」。

  9. Key 從環境變數 `APIYI_API_KEY` 讀，不要硬編碼進程式碼、也不要提交進 git。

  10. 改完真跑一次文生影片 + 一次圖生影片，把生成的影片和這兩次呼叫的花費貼給我。注意整個流程要幾分鐘，如果你在受限的執行環境裡跑，記得把命令超時放到 600 秒以上或者放後臺。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                      | 擋掉的坑                                                    |
  | ----------------------- | ------------------------------------------------------- |
  | 不能用 `/v1/videos`        | 那條路會靜默丟掉 `media` 欄位，上游報缺少 `input.media`，看起來像引數寫錯其實是端點選錯 |
  | 必須帶 `X-DashScope-Async` | 缺這個頭會被當成同步呼叫直接拒絕                                        |
  | 提交與輪詢字首不同               | 提交在 `/wan/api/v1/...`，輪詢卻在 `/v1/tasks/{task_id}`        |
  | `duration` 是整數不是字串      | 傳 `"5"` 直接反序列化失敗；`resolution` 還要大寫                      |
  | `r2v` 預設 1080P          | 不顯式指定就悄悄用上更貴的檔位，按秒計費下成本翻倍                               |
  | 重複提交會重複計費               | 失敗不計費，但無腦重試等於多付錢，必須自己做冪等                                |
  | 下載不帶 `Authorization`    | OSS 簽名直鏈帶 Auth 反而 403                                   |
</Accordion>

## 為什麼選 API易 的 Wan

<CardGroup cols={2}>
  <Card title="一個 Key 調全部能力" icon="key">
    無需註冊阿里雲、無需配置地域和環境變數。一把 API易 Key 即可呼叫 Wan2.7 全部四種能力以及 [HappyHorse 系列](/zh-Hant/api-capabilities/happyhorse/overview)。
  </Card>

  <Card title="國內直連 · 免出海" icon="globe">
    直連 `api.apiyi.com`，國內機房、家寬網路均可訪問，省去為阿里雲配置地域 Endpoint 的麻煩。
  </Card>

  <Card title="失敗不計費" icon="circle-check">
    任務進入 `failed` 狀態（媒體 URL 不可達、prompt 涉敏、上游容量等）**不計費**，可放心重試。
  </Card>

  <Card title="DashScope 協議透傳" icon="plug">
    請求體與阿里雲 DashScope 原生協議一一對齊，對照官方文件即可遷移，響應已統一收口便於輪詢。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="四合一非同步端點" icon="list-check">
    t2v / i2v / r2v / video-edit 共用 `POST /wan/api/v1/...video-synthesis`，提交後返回 `task_id`，輪詢 + 下載，便於批次管理。
  </Card>

  <Card title="音訊驅動對口型" icon="volume-2">
    `wan2.7-i2v` 支援 `driving_audio`，讓靜態人像跟隨音訊做口型與節奏，適合 rap / 口播 / 數字人。
  </Card>

  <Card title="多主體參考" icon="users">
    `wan2.7-r2v` 支援參考圖 + 參考影片混合輸入（合計 ≤5），用「圖1 / 影片1」標識在 prompt 裡指代，支援音色參考。
  </Card>

  <Card title="多檔解析度與時長" icon="expand">
    720P / 1080P 解析度，2–15 秒整數時長，`prompt_extend` 智慧改寫進一步提升短 prompt 的畫質。
  </Card>
</CardGroup>

## 支援的模型

| 模型 ID              | 能力     | 必需媒體輸入                                       | 說明                        |
| ------------------ | ------ | -------------------------------------------- | ------------------------- |
| `wan2.7-t2v`       | 文生影片   | 無                                            | 純文本生成                     |
| `wan2.7-i2v`       | 圖生影片   | `first_frame`（+ 可選 `driving_audio`）          | 唯一支援音訊驅動的能力               |
| `wan2.7-r2v`       | 參考圖生影片 | `reference_image` / `reference_video`（合計 ≤5） | 支援 `reference_voice` 音色參考 |
| `wan2.7-videoedit` | 影片編輯   | `video` + `reference_image`（1–5 張）           | 編輯模型名 **無連字元**            |

<Warning>
  `wan2.7-videoedit` 是影像編輯影片用途；另有 `wan2.7-image-pro` 屬於 **圖片** 模型（走 `/v1/images/generations`），不在本影片端點範圍內，請勿混用。歷史版本 Wan2.6 見 [歷史版本](/zh-Hant/api-capabilities/wan/historical-versions)。
</Warning>

## 分組介紹

Wan 與 [HappyHorse](/zh-Hant/api-capabilities/happyhorse/overview) 兩個系列**共用同一個 `Wan&HappyHorse` 分組**——一把令牌即可同時呼叫兩個系列。影片模型按**秒**計費，令牌必須同時滿足兩個條件才能成功路由：

1. **計費模式**：選「按量優先」或「按量計費」—— 影片按秒計費，**按次計費的令牌無法路由**
2. **分組**：選擇包含 `Wan&HappyHorse`

<Frame caption="建立令牌：計費模式選「按量優先」，分組選 Wan&HappyHorse（0.14x），即可呼叫 Wan2.7 與 HappyHorse 全部影片模型（截圖中為分組舊名 Wan，現已更名 Wan&HappyHorse）">
  <img src="https://mintcdn.com/apiyillc/5-SttsT0c5VQwgVz/images/wan-token-group-setup-20260523.png?fit=max&auto=format&n=5-SttsT0c5VQwgVz&q=85&s=f46887cb88777eb34d70837983f1fc49" alt="建立令牌介面：計費模式選「按量優先」，分組下拉中選擇 Wan&HappyHorse（倍率 0.14x），令牌可同時用於 Wan2.7 與 HappyHorse" width="1286" height="988" data-path="images/wan-token-group-setup-20260523.png" />
</Frame>

## 模型定價

### 預設價格 = 阿里雲官方原價的 98％（理解簡單）

控制台裡 `Wan&HappyHorse` 分組顯示倍率 **0.14x**，這是按**人民幣**計價單位計的。本站統一用**美元充值、固定匯率 1:7**，實際折算：

```
0.14（人民幣計價單位） × 7（固定匯率） = 0.98
```

也就是說，**預設價格 = 阿里雲官方原價的 98%（98 折）**——比官方直採更省，且無需自建出海鏈路。

> 換算公式：**本站每秒美元價 = 官方人民幣原價 × 0.14**（即 `× 0.98 ÷ 7`）。例如官方 1080P 原價 ¥1.0/秒 → \$0.14/秒，正好等於控制台裡看到的 `0.14x`。

### 價格明細（預設價，按秒計費）

Wan2.7 文生 / 圖生 / 參考生影片同價，僅 `720P` / `1080P` 兩檔（不支援 480P）：

| 解析度     | 官方原價   | 本站預設價/秒   | 5 秒    | 10 秒   | 12 秒   |
| ------- | ------ | --------- | ------ | ------ | ------ |
| `720P`  | ¥0.6/秒 | \$0.084/秒 | \$0.42 | \$0.84 | \$1.01 |
| `1080P` | ¥1.0/秒 | \$0.14/秒  | \$0.70 | \$1.40 | \$1.68 |

<Info>
  * `wan2.7-r2v` 預設 `1080P`，且參考素材含影片時時長上限為 10 秒。
  * `wan2.7-videoedit`（影片編輯）輸出時長跟隨源影片，按實際輸出秒數計費，不由 `duration` 決定。
  * 表中為 **預設價（官方 98%）**；疊加充值加贈最高檔約為表中價 **÷ 1.2**（例：1080P 5 秒 \$0.70 → 約 \$0.58）。
</Info>

### 疊加充值加贈，折扣進一步走低

參與 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 後，到賬額度最高可放大約 1.2 倍，等效價格進一步下探：

```
0.98 ÷ 1.2 ≈ 0.816
```

即大客戶最低可做到 **官方原價的約 81.6%（約 82 折）**。

| 檔位             | 等效價格（對比阿里雲官方原價）     | 演算法               |
| -------------- | ------------------- | ----------------- |
| 預設             | **98%**（98 折）       | 倍率 0.14x × 固定匯率 7 |
| 疊加充值加贈（大客戶最高檔） | **約 81.6%**（約 82 折） | 0.98 ÷ 1.2        |

<Info>
  * 計費維度 = **解析度檔位 × 時長（秒）**，失敗任務不計費。
  * 1:7 為**固定結算匯率**（不是優惠匯率），所有美元充值統一適用。
  * 充值加贈的最高加贈檔位與適用渠道見 [充值加贈活動](/zh-Hant/faq/recharge-promotions)。最新倍率以 [控制台](https://api.apiyi.com/token) 為準。
</Info>

## ⚠️ 端點選擇（最重要）

API易 同時掛載兩條路徑，**只有 DashScope 透傳端點對 Wan 全部能力完整可用**：

| 路徑                                                           | 協議風格           | i2v / r2v 可用性 | 結論        |
| ------------------------------------------------------------ | -------------- | ------------- | --------- |
| `/v1/videos`                                                 | OpenAI 扁平風格    | ❌ 媒體欄位會被丟棄    | **不要用**   |
| `/wan/api/v1/services/aigc/video-generation/video-synthesis` | DashScope 原生透傳 | ✅ 完整可用        | **始終用這條** |

<Warning>
  看到任何文件/示例裡寫 `/v1/videos` 提交 Wan 影片任務，**直接忽略**。該路徑對 i2v / r2v 的 `media` 欄位適配不完整，會導致上游報 `[InvalidParameter] Field required: input.media`。所有 Wan 影片建立請求都走 `/wan/api/v1/...video-synthesis`。
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
    從響應的 `result_url` 直接 GET 下載 mp4，**不要帶 `Authorization` 頭**（它是 OSS 簽名直鏈，帶 Auth 反而 403）。
  </Step>
</Steps>

### 任務狀態說明

`GET /v1/tasks/{task_id}` 響應頂層的 `status` 欄位（API易 已統一收口）：

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
    "model": "wan2.7-t2v",
    "input": {"prompt": "黃昏海邊的燈塔，鏡頭緩慢推進，海浪輕拍礁石，海鳥叫聲"},
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

### `input` 欄位

| 欄位                | 型別     | 必填              | 說明                                     |
| ----------------- | ------ | --------------- | -------------------------------------- |
| `prompt`          | string | ✓               | 自然語言描述，wan2.7-r2v 支援「圖1 / 影片1」標識指代參考素材 |
| `negative_prompt` | string |                 | 反向提示詞，≤500 字元                          |
| `media`           | array  | i2v/r2v/edit 必填 | 媒體素材陣列，見下                              |

### `media[]` 型別

| `type`            | 用途                                | 適用模型          |
| ----------------- | --------------------------------- | ------------- |
| `first_frame`     | 首幀圖（≤1 張）                         | i2v、r2v       |
| `reference_image` | 參考圖（保持主體/場景）                      | r2v、videoedit |
| `reference_video` | 參考影片（主體/音色參考）                     | r2v           |
| `driving_audio`   | 驅動音訊（對口型）                         | **僅 i2v**     |
| `video`           | 輸入影片                              | videoedit     |
| `reference_voice` | 音色參考（附在 reference\_image/video 上） | r2v           |

每個媒體物件至少含 `type` + `url`，`url` 必須是公網可直接 GET 的 https 連結（本地檔案先上傳到 OSS / CDN）。

### `parameters` 欄位

| 欄位              | 型別     | 取值                                      | 說明                            |
| --------------- | ------ | --------------------------------------- | ----------------------------- |
| `resolution`    | string | `720P` / `1080P`                        | 大寫，建議顯式指定                     |
| `ratio`         | string | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` | 寬高比；傳了首幀圖時自動忽略                |
| `duration`      | int    | 2–15                                    | 秒數（整數），常用 5 / 10；含參考影片時上限為 10 |
| `prompt_extend` | bool   | `true` / `false`                        | 智慧改寫 prompt，**強烈推薦 `true`**   |
| `watermark`     | bool   | `true` / `false`                        | 右下角「AI 生成」水印                  |
| `seed`          | int    | 0–2147483647                            | 固定可提升可復現性                     |

<Tip>
  `duration` 必須是 **整數** `5` 而不是字串 `"5"`，否則報 `cannot unmarshal string into Go struct field ... of type int`。`resolution` 寫 **大寫** `720P` 更穩。
</Tip>

## 如何選擇 Wan 還是 HappyHorse

Wan 和 [HappyHorse](/zh-Hant/api-capabilities/happyhorse/overview) 都是阿里系影片模型、共用同一端點和 schema（只改 `model` 名即可互換），但能力側重不同：

| 維度           | Wan2.7                            | HappyHorse-1.1    |
| ------------ | --------------------------------- | ----------------- |
| 音訊驅動對口型（i2v） | ✅ `wan2.7-i2v` 支援 `driving_audio` | ❌ 不支援，i2v 僅首幀     |
| 參考圖生影片上限     | 參考圖 + 參考影片合計 ≤5                   | 參考圖最多 9 張         |
| 影片編輯參考圖      | ≤5 張                              | ≤5 張              |
| 主體一致性風格      | 多主體互動、音色參考                        | 偏「高度還原動態畫面」，主體保持穩 |

<Tip>
  **需要對口型 / rap / 數字人口播** → 選 `wan2.7-i2v`（唯一支援音訊驅動）。
  **需要多張參考圖保持主體一致** → 考慮 [HappyHorse r2v（≤9 張）](/zh-Hant/api-capabilities/happyhorse/reference-to-video)。
</Tip>

## 最佳實踐

<Steps>
  <Step title="先用 720P / 5 秒聯調">
    開發期用低解析度短影片快速驗證 prompt 與鏡頭方向，定型後再放大到 720P / 1080P 與更長時長，降低單價與等待時間。
  </Step>

  <Step title="始終開 prompt_extend">
    `prompt_extend: true` 對短 prompt 的畫質提升明顯，代價只是多幾秒生成時間。
  </Step>

  <Step title="輪詢 5–10 秒一次">
    不要小於 3 秒（會被限流），也不要長任務死等。720P / 5 秒典型耗時 70–140 秒，1080P / 長影片可能超 5 分鐘。
  </Step>

  <Step title="客戶端超時設 20 分鐘兜底">
    1080P 或 10 秒以上影片顯著更慢，給輪詢迴圈設定 20 分鐘兜底超時。
  </Step>

  <Step title="拿到 result_url 立即下載落地">
    `result_url` 預設 **24 小時過期**，且是 OSS 簽名直鏈，下載時**不要帶 Authorization 頭**。生產場景務必轉存到自己的 OSS / CDN。
  </Step>

  <Step title="做好冪等">
    失敗任務不扣費，但重複提交相同任務會重複計費。業務層維護「業務 ID → task\_id」對映避免誤扣。
  </Step>
</Steps>

## 錯誤碼與重試

錯誤來自兩個階段，處理方式不同：

| 來源               | 特徵                                                                                         | 處理                              |
| ---------------- | ------------------------------------------------------------------------------------------ | ------------------------------- |
| **建立階段（API易 拒）** | HTTP 4xx/5xx，`type` 為 `task_error` / `parse_request_failed` / `build_request_failed`       | 改 body 重試（多為欄位型別錯、缺 media、用錯端點） |
| **執行階段（上游阿里雲拒）** | 任務最終 `status=failed`，`error.message` 以 `[InvalidParameter]` / `[InvalidImageUrl]` 等方括號字首打頭 | 看方括號提示，多為媒體 URL 不可達或 prompt 涉敏  |

<Info>
  **建議客戶端**：HTTP 5xx / 網路錯誤做指數退避重試（1s / 4s / 16s）；HTTP 4xx 立刻 surface 不重試；任務 `failed` 含 `[InvalidImageUrl]` 可重試（可能臨時網路），含 `[InvalidParameter]` / 敏感詞不重試。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼不能用 /v1/videos 提交 Wan 任務？">
    `/v1/videos` 是 OpenAI 扁平風格端點，對 Wan 的 i2v / r2v 適配不完整：`media` 等媒體欄位會被丟棄，上游阿里雲會報 `[InvalidParameter] Field required: input.media`。**所有 Wan 影片建立請求都走 `/wan/api/v1/services/aigc/video-generation/video-synthesis`**，查詢統一走 `/v1/tasks/{task_id}`。
  </Accordion>

  <Accordion title="X-DashScope-Async: enable 這個頭是幹啥的？必須帶嗎？">
    它告訴端點「這是非同步任務，立刻返回 task\_id 不要堵塞」。**所有建立請求都必須帶**，缺失會報 `current user api does not support synchronous calls`。查詢任務（GET）不需要帶這個頭。
  </Accordion>

  <Accordion title="查任務為什麼是 /v1/tasks/{id} 而不是 /wan/api/v1/tasks/{id}？">
    API易 把所有影片任務查詢統一收口到了 `/v1/tasks/{task_id}`。不管你用哪個路徑建立，查任務都走這一個端點，響應頂層的 `status` / `progress` / `result_url` / `error` 欄位一致。
  </Accordion>

  <Accordion title="result_url 下載報 403 / SignatureDoesNotMatch 怎麼辦？">
    去掉 `Authorization` 頭。`result_url` 已經是阿里雲 OSS 簽好名的直鏈，再帶 API易 Key OSS 反而會拒：

    ```bash theme={null}
    curl -L -o out.mp4 "$RESULT_URL"          # ✅ 對
    curl -L -H "Authorization: Bearer $KEY" -o out.mp4 "$RESULT_URL"   # ❌ 錯
    ```
  </Accordion>

  <Accordion title="result_url 過期了怎麼辦？">
    連結預設有效期 **24 小時**。過期後重新 GET `/v1/tasks/{task_id}` 通常會得到新的 `result_url`，但 task\_id 本身查詢有效期也是 24 小時（超時返回 `UNKNOWN`）。需要長期儲存請儘快下載到自己的儲存。
  </Accordion>

  <Accordion title="progress 一直停在 30% 是卡住了嗎？">
    不是。阿里雲上游彙報的 progress 是粗粒度的（只有 0% / 10% / 30% / 100% 幾檔）。**只要 `status` 還是 `in_progress` 就繼續等**，通常 30% 到 100% 之間直接跳過。
  </Accordion>

  <Accordion title="一個 Key 能併發跑幾個任務？">
    實測可同時提交 4–8 個任務不報限流。生產建議同時活躍任務 ≤10 個，超出排隊。查詢介面預設 RPS 較高，但輪詢間隔仍建議 5–10 秒。
  </Accordion>

  <Accordion title="失敗任務扣費嗎？">
    `status=failed` 不扣費。但需注意：重複提交相同任務會重複計費，做好冪等。測試期可關掉 `prompt_extend`、用 720P / 5 秒 / 短 prompt 降低單價。
  </Accordion>

  <Accordion title="wan2.6 還能用嗎？">
    可以。Wan2.6 系列（含 `wan2.6-r2v-flash`）仍在可呼叫列表，協議與 Wan2.7 一致，只改 `model` 名即可。詳見 [歷史版本](/zh-Hant/api-capabilities/wan/historical-versions)。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="文生影片 Playground" icon="wand-sparkles" href="/zh-Hant/api-capabilities/wan/text-to-video">
    `wan2.7-t2v` 線上除錯 + 程式碼示例
  </Card>

  <Card title="圖生影片 Playground" icon="image" href="/zh-Hant/api-capabilities/wan/image-to-video">
    `wan2.7-i2v` 首幀 + 驅動音訊
  </Card>

  <Card title="參考圖生影片 Playground" icon="users" href="/zh-Hant/api-capabilities/wan/reference-to-video">
    `wan2.7-r2v` 多主體參考 + 音色
  </Card>

  <Card title="影片編輯 Playground" icon="scissors" href="/zh-Hant/api-capabilities/wan/video-edit">
    `wan2.7-videoedit` 換裝 / 換背景
  </Card>

  <Card title="歷史版本（Wan2.6）" icon="rotate-ccw-clock" href="/zh-Hant/api-capabilities/wan/historical-versions">
    Wan2.6 系列與遷移說明
  </Card>

  <Card title="HappyHorse 系列" icon="monitor-play" href="/zh-Hant/api-capabilities/happyhorse/overview">
    同為阿里系，選型對照
  </Card>
</CardGroup>

<Info>
  阿里雲官方文件（參考）：`help.aliyun.com/zh/model-studio/text-to-video-api-reference`。如有問題或建議，歡迎在 [API易控制台](https://api.apiyi.com) 工單中反饋。
</Info>
