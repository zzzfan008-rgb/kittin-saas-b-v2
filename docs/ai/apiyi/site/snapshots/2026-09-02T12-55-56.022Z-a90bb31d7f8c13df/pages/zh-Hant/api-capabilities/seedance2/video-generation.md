> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 / 2.5 影片生成 API 參考

> Seedance 2.0 影片生成 API 參考與線上除錯：文生影片 / 首尾幀 / 首幀 / 多模態參考生影片，非同步任務式端點，含完整輪詢與下載程式碼。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`（令牌須勾選 `SeeDance2` 分組，2.5 與 2.0 系通用），填好 `model` / `content` 後發起請求。提交成功返回任務 `id`，後續輪詢與下載見下方程式碼示例。
</Info>

<Warning>
  **關於 Playground 報「請求時發生錯誤: no response received」**：本介面是非同步任務式端點，在瀏覽器裡點「傳送」可能出現此提示——這是瀏覽器的跨域安全校驗攔截了響應，**任務實際已成功提交到後臺**（可用下方查詢介面或控制台日誌驗證）。此外 Playground 僅能建立任務、無法完成輪詢與下載影片。要跑通完整的「建立 → 輪詢 → 下載」流程，請直接複製下方 **程式碼示例**（cURL / Python / Node.js）執行。
</Warning>

<Tip>
  本頁是 Seedance 2.0 的建立任務介面，文生影片、首尾幀/首幀、多模態參考生影片共用同一端點，靠 `content` 陣列區分模式。模型選型、定價、解析度畫素表、FAQ 見 [Seedance 2.0 概覽](/zh-Hant/api-capabilities/seedance2/overview)。
</Tip>

<Warning>
  * 路徑字首是 `/seedance/api/v3`，**不要漏掉 `/api`**，也不要用 `/v1/videos`
  * 令牌必須勾選 `SeeDance2` 分組，否則報「該模型無可用渠道」：**2.5 與 2.0 系都走 `SeeDance2`**，一把令牌通吃四個模型（`mini` / `fast` 另有特價的 `SD2Mini` / `SD2Fast`）
  * `generate_audio` **預設 true**（輸出帶聲音），不需要請顯式傳 `false`
  * Python requests 需加請求頭 `"Accept-Encoding": "identity"`，否則可能報 gzip 解碼錯誤，或響應體被截斷成非法 JSON（如開頭丟失 `{"`，只剩 `id":"cgt-xxx"}`），甚至間歇性 400
  * 成功狀態是 `succeeded`（不是 `completed`），影片地址在 `content.video_url`，**24 小時過期**
</Warning>

## 程式碼示例

<CodeGroup>
  ```bash cURL（文生影片） theme={null}
  curl -X POST "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
        {"type": "text", "text": "無人機航拍視角飛越秋天的山谷，金黃色的森林和蜿蜒的河流，電影感"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      "generate_audio": false
    }'
  # 返回：{"id":"cgt-2026xxxx-xxxxx"}，拿 id 輪詢查詢介面
  ```

  ```python Python（完整流程：建立 → 輪詢 → 下載） theme={null}
  import time
  import requests

  BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  HEADERS = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      # 必加：閘道 gzip 頭與實際編碼不符，缺了會報 gzip 解碼錯誤，
      # 或響應體被截斷成非法 JSON（如開頭丟 {"，只剩 id":"cgt-xxx"}），甚至間歇 400
      "Accept-Encoding": "identity",
  }

  # 1. 建立任務
  body = {
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
          {"type": "text", "text": "海浪拍打礁石，夕陽把海面染成金色，慢鏡頭，氛圍寧靜"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      # "generate_audio": False,  # 預設 True；不要聲音時取消註釋
      # "seed": 12345,            # 固定隨機性，可復現類似結果
  }
  task_id = requests.post(BASE, json=body, headers=HEADERS, timeout=60).json()["id"]
  print("task_id:", task_id)

  # 2. 輪詢直到終態（succeeded / failed / expired）
  while True:
      time.sleep(20)
      task = requests.get(f"{BASE}/{task_id}", headers=HEADERS, timeout=30).json()
      status = task.get("status")
      print("status:", status)
      if status in ("succeeded", "failed", "expired"):
          break

  # 3. 下載影片（URL 24 小時過期，成功後立即轉存）
  if status == "succeeded":
      video_url = task["content"]["video_url"]   # 注意：在 content 下，不在頂層
      print("tokens:", task["usage"]["completion_tokens"])
      with requests.get(video_url, stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(f"{task_id}.mp4", "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print(f"已儲存 {task_id}.mp4")
  else:
      print("任務未成功:", task.get("error"))
  ```

  ```python Python（首尾幀 / 參考圖模式） theme={null}
  # 首尾幀：2 張圖，role 必填；與參考圖模式互斥
  body_first_last = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "畫面從第一幀平滑過渡到最後一幀，鏡頭緩慢運動"},
          {"type": "image_url", "image_url": {"url": "https://example.com/first.jpg"},
           "role": "first_frame"},
          {"type": "image_url", "image_url": {"url": "https://example.com/last.jpg"},
           "role": "last_frame"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",   # 按首幀圖片比例自動適配，避免裁剪
      "duration": 5,
  }

  # 多模態參考：0~9 參考圖 + 0~3 參考影片 + 0~3 參考音訊（至少 1 圖或 1 影片），可生成全新/編輯/延長影片
  body_reference = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "以參考圖的角色和風格，生成角色在雨夜街頭行走的鏡頭"},
          {"type": "image_url", "image_url": {"url": "https://example.com/character.png"},
           "role": "reference_image"},
          # {"type": "video_url", "video_url": {"url": "..."}, "role": "reference_video"},
          # {"type": "audio_url", "audio_url": {"url": "..."}, "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # 圖片也支援 Base64（data:image/png;base64,xxx）與平臺素材 ID（asset://xxx）
  ```

  ```python Python（Seedance 2.5：30 秒長片 / 影片編輯 / 影片延長） theme={null}
  # 2.5 與 2.0 共用同一端點與請求結構，只需換 model；以下三段是 2.5 獨有的能力

  # ① 30 秒長片：2.5 的 duration 上限是 30（2.0 系是 15）
  body_30s = {
      "model": "doubao-seedance-2-5-260628",
      "content": [{"type": "text", "text": "無人機航拍飛越秋天的山谷，晨霧在林間流動，一鏡到底"}],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 30,        # 別省略！2.5 的 duration 預設是 -1，模型會自己選時長
  }

  # ② 影片編輯：ratio 必須 adaptive、duration 必須 -1，參考影片時長需在 4-30 秒
  body_edit = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # 提示詞必須帶編輯意圖詞：增加 / 加上 / 刪除 / 去掉 / 修改 / 替換 / 改成
          {"type": "text", "text": "在 @影片1 中增加幾隻飛過的小鳥"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",                    # 必須；傳具體比例會同步 400
      "duration": -1,                         # 必須；傳具體秒數會同步 400
      "omni_reference_task_type": "edit",     # 顯式宣告，把引數校驗前置到提交時
      "output_format": "mov",                 # 可選：後期加工推薦 mov（部分播放器不相容）
  }

  # ③ 影片延長：ratio 必須 adaptive
  body_extend = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # 提示詞必須帶延長意圖詞：向前/向後延長、延續、續寫
          {"type": "text", "text": "向後延長 @影片1，鏡頭繼續向前推進，天色漸暗"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",
      "omni_reference_task_type": "extend",
  }

  # ④ 純音訊參考：2.5 獨有，2.0 系必須搭配圖片或影片
  body_audio_only = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          {"type": "text", "text": "根據 @音訊1 的節奏，生成抽象光影隨節拍律動的畫面"},
          {"type": "audio_url", "audio_url": {"url": "https://example.com/track.mp3"},
           "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # 提交與輪詢流程與上面完全一致，不再重複
  ```

  ```javascript Node.js（fetch） theme={null}
  const BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const HEADERS = {
    "Authorization": "Bearer sk-your-api-key",
    "Content-Type": "application/json",
  };

  // 1. 建立任務
  const { id } = await fetch(BASE, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-fast-260128",
      content: [{ type: "text", text: "雪山腳下的湖泊倒映著星空，延時攝影效果" }],
      resolution: "720p",
      ratio: "9:16",        // 豎屏與橫屏同價
      duration: 5,
    }),
  }).then(r => r.json());
  console.log("task_id:", id);

  // 2. 輪詢直到終態
  let task;
  do {
    await new Promise(r => setTimeout(r, 20000));
    task = await fetch(`${BASE}/${id}`, { headers: HEADERS }).then(r => r.json());
    console.log("status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 3. 影片直鏈（24 小時過期，請立即轉存）
  if (task.status === "succeeded") console.log(task.content.video_url);
  ```

  ```bash cURL（查詢任務） theme={null}
  curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx" \
    -H "Authorization: Bearer sk-your-api-key"
  ```
</CodeGroup>

## 引數說明速查

| 引數                         | 型別     | 必填 | 預設                    | 說明                                                                                                                                                                                                                                |
| -------------------------- | ------ | -- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                    | string | ✓  | —                     | `doubao-seedance-2-5-260628`（**2.5，推薦**，支援 1080p、最長 30 秒）/ `doubao-seedance-2-0-260128`（標準版，支援 1080p）/ `doubao-seedance-2-0-fast-260128`（極速版，最高 720p）/ `doubao-seedance-2-0-mini-260615`（輕量版，最高 720p，單價約標準版一半）。寫純 ID，不要帶 `ep-` 字首 |
| `content`                  | array  | ✓  | —                     | 輸入資訊陣列，見下方「生成模式」                                                                                                                                                                                                                  |
| `resolution`               | string |    | `720p`                | `480p` / `720p` / `1080p`（1080p 僅 2.5 與標準版，fast 與 mini 最高 720p）；**四個模型都不支援 `4k`**                                                                                                                                                 |
| `ratio`                    | string |    | `adaptive`            | `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9` / `adaptive`；同檔位全比例同價                                                                                                                                                            |
| `duration`                 | int    |    | 2.5 為 `-1`，2.0 係為 `5` | 2.5 支援 **4–30** 整數秒，2.0 系支援 4–15；`-1` 由模型智慧選時長（按實際產出計費）。**2.5 預設即 `-1`**，不顯式傳會自動選時長、費用隨之變化                                                                                                                                        |
| `generate_audio`           | bool   |    | `true`                | 是否生成同步音訊（人聲/音效/配樂，單聲道）                                                                                                                                                                                                            |
| `watermark`                | bool   |    | `false`               | 是否加「AI 生成」水印                                                                                                                                                                                                                      |
| `seed`                     | int    |    | `-1`                  | \[-1, 2^32-1]；相同 seed 生成類似（不保證一致）結果                                                                                                                                                                                               |
| `return_last_frame`        | bool   |    | `false`               | 返回尾幀 png（無水印），用於多段影片接力                                                                                                                                                                                                            |
| `execution_expires_after`  | int    |    | `172800`              | 任務過期閾值（秒），範圍 \[3600, 259200]                                                                                                                                                                                                      |
| `output_format`            | string |    | `mp4`                 | **僅 2.5**：`mp4`（通用）/ `mov`（QuickTime，H.264 + yuv444p + PCM，色彩還原更好，適合後期；部分播放器不相容）                                                                                                                                                  |
| `omni_reference_task_type` | string |    | `auto`                | **僅 2.5**：`auto` / `edit`（影片編輯）/ `extend`（影片延長）。顯式指定後接口會**前置校驗**特殊引數限制，提交時就能拿到 400，而不是等任務跑完才失敗                                                                                                                                    |

<Warning>
  Seedance 2.5 與 2.0 系均**不支援** `frames`、`camera_fixed` 引數——這些是 Seedance 1.x 的能力，傳入會被忽略或報錯。

  **2.5 獨有的任務型別硬約束**（違反會在提交時返回 `InvalidParameter.TaskTypeConstraint`，不扣費）：

  | 任務型別         | `ratio`           | `duration`                    |
  | ------------ | ----------------- | ----------------------------- |
  | 文生影片 / 參考生影片 | 無限制               | 無限制                           |
  | 首幀 / 首尾幀生影片  | **必須 `adaptive`** | 無限制                           |
  | 影片編輯         | **必須 `adaptive`** | **必須 `-1`**，且待編輯影片時長在 4–30 秒內 |
  | 影片延長         | **必須 `adaptive`** | 無限制                           |
</Warning>

### 生成模式（content 組合）

| 模式              | content 組成                                                                                                      | role 取值                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 文生影片            | 1 個 `text`                                                                                                      | —                                                         |
| 圖生影片-首尾幀        | text（可選）+ 2 個 `image_url`                                                                                       | 必填 `first_frame` / `last_frame`                           |
| 圖生影片-首幀         | text（可選）+ 1 個 `image_url`                                                                                       | `first_frame` 或不填                                         |
| 多模態參考生影片        | text + 參考素材（2.5：最多 30 `image_url` + 10 `video_url` + 10 `audio_url`；2.0 系：0–9 圖 + 0–3 影片 + 0–3 音訊，至少 1 圖或 1 影片） | `reference_image` / `reference_video` / `reference_audio` |
| 影片編輯（**僅 2.5**） | text（含編輯意圖詞）+ 至少 1 個 `video_url`                                                                                | `reference_video`，配 `omni_reference_task_type: "edit"`    |
| 影片延長（**僅 2.5**） | text（含延長意圖詞）+ 至少 1 個 `video_url`                                                                                | `reference_video`，配 `omni_reference_task_type: "extend"`  |

三種圖生場景**互斥**。圖片支援公網 URL、Base64（`data:image/png;base64,...`）、素材 ID（`asset://...`）；不支援含真人人臉的輸入素材。素材引用的端到端程式碼（上傳入庫 → `asset://` 出片 → 下載）見 [素材引用實戰](/zh-Hant/api-capabilities/seedance2/asset-reference)。

**大素材內聯會拖慢建立任務**：Base64 或大圖 URL 的上行/下載耗時全都算在提交階段，會把秒級的建立任務介面拖到幾十秒甚至讀超時。帶圖帶影片時建議先入庫拿 `asset://` 素材 ID，見 [素材優先實踐](/zh-Hant/api-capabilities/seedance2/asset-first-workflow)。

**參考素材數量按模型區分**：2.5 支援 30 圖 + 10 影片 + 10 音訊，且**音訊可以單獨作為唯一參考**；2.0 系是 9 圖 + 3 影片 + 3 音訊，音訊必須與至少 1 個圖片或影片一起傳。

**編輯與延長靠提示詞意圖觸發**，`omni_reference_task_type` 只是把校驗前置。提示詞裡用 `@影片1`、`@影像1` 按傳入順序指代素材；編輯要帶「增加 / 刪除 / 修改 / 替換」這類詞，延長要帶「向後延長 / 續寫 / 延續」。若模型按提示詞判定的任務型別與顯式宣告不符，任務會非同步失敗並返回 `InvalidParameter.TaskTypeMismatch`。

## 響應格式

建立成功只返回任務 ID（**不是影片本身**）：

```json theme={null}
{ "id": "cgt-20260606160057-6bbjd" }
```

拿到 `id` 後輪詢 `GET /seedance/api/v3/contents/generations/tasks/{id}` 查詢狀態。

### 輪詢節奏建議

| 專案     | 建議值                | 說明                                              |
| ------ | ------------------ | ----------------------------------------------- |
| 首次查詢延遲 | 提交後 **20–30 秒**    | 更早查必然是 `queued`，純屬浪費請求                          |
| 輪詢間隔   | **10–20 秒**一次      | 影片生成是分鐘級任務，秒級輪詢沒有意義，還可能觸發限流                     |
| 超時上限   | **10 分鐘**未到終態即視為異常 | 排隊高峰可放寬到 15 分鐘，或改由 `execution_expires_after` 兜底 |

實測出片耗時（含排隊）：2.0 系 720p 5 秒約 **90–140 秒**、15 秒約 **170 秒**；2.5 的 720p 5 秒約 **150 秒**、**30 秒約 330 秒**、1080p 5 秒約 **150 秒**。解析度越高、時長越長越慢，排隊高峰會進一步拉長。下方程式碼示例採用 20 秒固定間隔，夠用且請求數可控。

成功後的完整響應（實測樣本）：

```json theme={null}
{
  "id": "cgt-20260606160057-6bbjd",
  "model": "doubao-seedance-2-0-fast-260128",
  "status": "succeeded",
  "content": {
    "video_url": "https://ark-acg-cn-beijing.tos-cn-beijing.volces.com/....mp4?X-Tos-Expires=86400&..."
  },
  "usage": { "completion_tokens": 108900, "total_tokens": 108900 },
  "created_at": 1780732857,
  "updated_at": 1780732991,
  "seed": 97151,
  "resolution": "720p",
  "ratio": "16:9",
  "duration": 5,
  "framespersecond": 24,
  "generate_audio": true,
  "draft": false
}
```

<Warning>
  * 影片地址在 **`content.video_url`**，不在頂層；簽名直鏈 **24 小時過期**，成功後立即下載轉存
  * 狀態機：`queued → running → succeeded / failed / expired`，成功是 **`succeeded`**
  * 下載影片時直接 GET 直鏈即可，**不要帶 `Authorization` 頭**
</Warning>

<Info>
  `usage.completion_tokens` 即計費 token 數，滿足 `token ≈ 時長 × 寬 × 高 × 24 / 1024`（實測偏差少於 0.1%）。**含參考影片時，輸入影片時長按輸出解析度一併計入**，即 `(輸入影片時長 + 輸出時長) × 寬 × 高 × 24 / 1024`。`duration: -1` 或 `ratio: adaptive` 時，實際時長與比例以響應中的 `duration` / `ratio` 欄位為準（編輯任務的時長**可能是非整數秒**）。
</Info>


## OpenAPI

````yaml api-reference/seedance2-video-openapi.yaml POST /seedance/api/v3/contents/generations/tasks
openapi: 3.1.0
info:
  title: Seedance 2.0 视频生成 API
  description: >
    字节跳动 Seedance 2.0 视频生成（火山引擎国内版官方资源）。


    能力要点：

    - 文生视频 / 图生视频（首尾帧、首帧）/ 多模态参考生视频（0-9 参考图 + 0-3 参考视频 + 0-3 参考音频，至少 1 图或 1 视频）

    - 分辨率 480p / 720p / 1080p（fast 不支持 1080p），6 种宽高比 + adaptive，同档位全比例同价

    - 时长 4-15 秒或 -1 智能时长，帧率固定 24fps，默认输出同步音频（generate_audio 默认 true）

    - 异步任务式：创建返回任务 id，轮询 GET /seedance/api/v3/contents/generations/tasks/{id} 直到
    succeeded，从 content.video_url 下载（24 小时过期）


    认证方式：Bearer Token（计费模式选「按量优先」；令牌须勾选对应分组：2.5 用 SeeDance25，2.0 系用 SeeDance2）。

    获取 Key：API易控制台 → 令牌管理。
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /seedance/api/v3/contents/generations/tasks:
    post:
      tags:
        - 视频生成
      summary: 创建 Seedance 2.0 视频生成任务
      description: >
        异步接口：提交后立即返回任务 `id`，**不是视频本身**。


        - 必填：`model` + `content`（文本 / 文本+图片 / 文本+图片+视频+音频等组合）

        - 三种图生场景互斥：首尾帧（2 图，role 必填）/ 首帧（1 图）/ 多模态参考生视频（0-9 图 + 0-3 视频 + 0-3
        音频，至少 1 图或 1 视频，图片 role 均为 reference_image）

        - 不支持含真人人脸的输入素材；音频需与至少 1 个图片或视频一起传

        - 不支持 `frames` / `camera_fixed`（Seedance 1.x 参数）

        - 提交时预扣费、完成后多退少补；参数错误被拒不扣费


        提交成功后轮询 `GET /seedance/api/v3/contents/generations/tasks/{id}`，

        状态机 `queued → running → succeeded / failed / expired`，

        成功后从 `content.video_url` 下载 mp4（约 24 小时过期）。

        详细说明见文档「Seedance 2.0 概览」。
      operationId: createSeedance2VideoTask
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Seedance2CreateTaskRequest'
            example:
              model: doubao-seedance-2-5-260628
              content:
                - type: text
                  text: 无人机航拍视角飞越秋天的山谷，金黄色的森林和蜿蜒的河流，电影感
              resolution: 720p
              ratio: '16:9'
              duration: 5
              generate_audio: false
      responses:
        '200':
          description: 任务创建成功，返回任务 ID（用于轮询查询）
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Seedance2TaskCreated'
              example:
                id: cgt-20260606160057-6bbjd
        '400':
          description: >-
            参数错误（InvalidParameter）：如 fast 模型传 1080p、duration 超出 4-15、非法
            ratio。错误信息会指明具体参数名；不扣费
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截（真人面孔、违规内容）
        '429':
          description: 请求频率超限或额度不足
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    Seedance2CreateTaskRequest:
      type: object
      required:
        - model
        - content
      properties:
        model:
          type: string
          description: >-
            模型 ID（写纯 ID，不要带 ep- 前缀）。2.5 支持 1080p 与 4-30 秒，参考素材上限 30 图 + 10 视频 +
            10 音频；2.0 标准版支持 1080p；fast 与 mini 最高 720p，mini 单价约标准版一半。四个模型均不支持 4k
          enum:
            - doubao-seedance-2-5-260628
            - doubao-seedance-2-0-260128
            - doubao-seedance-2-0-fast-260128
            - doubao-seedance-2-0-mini-260615
          example: doubao-seedance-2-5-260628
        content:
          type: array
          description: >-
            输入信息数组。文生视频只放 1 个 text；图生视频追加 image_url（role: first_frame /
            last_frame）；多模态参考生视频追加 image_url（role: reference_image），可再加
            video_url / audio_url。参考素材上限：2.5 为 30 图 + 10 视频 + 10 音频且音频可单独使用，2.0
            系为 9 图 + 3 视频 + 3 音频且至少需 1 图或 1 视频。三种图生场景互斥
          items:
            type: object
            properties:
              type:
                type: string
                description: 内容类型
                enum:
                  - text
                  - image_url
                  - video_url
                  - audio_url
                example: text
              text:
                type: string
                description: 文本提示词（type=text 时必填）。中文建议不超过 500 字、英文不超过 1000 词；对话放双引号内可优化配音
                example: 海浪拍打礁石，夕阳把海面染成金色，慢镜头
              image_url:
                type: object
                description: >-
                  图片对象（type=image_url 时必填）。支持公网
                  URL、Base64（data:image/png;base64,...）、素材
                  ID（asset://...）；jpeg/png/webp/bmp/tiff/gif/heic/heif，宽高比
                  (0.4,2.5)，边长 (300,6000)px，单张小于 30MB；不支持真人人脸
                properties:
                  url:
                    type: string
                    description: 图片 URL / Base64 / asset:// 素材 ID
                    example: https://example.com/first.jpg
              video_url:
                type: object
                description: 参考视频对象（type=video_url 时必填），仅多模态参考模式使用
                properties:
                  url:
                    type: string
                    description: 视频 URL
              audio_url:
                type: object
                description: >-
                  参考音频对象（type=audio_url 时必填）。wav/mp3，单段 2-15 秒，最多 3 段且总时长不超过 15
                  秒；必须与至少 1 个图片或视频一起传
                properties:
                  url:
                    type: string
                    description: 音频 URL
              role:
                type: string
                description: 媒体用途。首尾帧必填 first_frame/last_frame；单首帧可不填；参考素材填 reference_*
                enum:
                  - first_frame
                  - last_frame
                  - reference_image
                  - reference_video
                  - reference_audio
        resolution:
          type: string
          description: >-
            分辨率档位（定义像素面积，同档位全比例同价）。1080p 仅 2.5 与 2.0 标准版支持，fast 与 mini 最高
            720p；均不支持 4k
          enum:
            - 480p
            - 720p
            - 1080p
          default: 720p
        ratio:
          type: string
          description: 宽高比。adaptive 按输入自动适配（图生视频推荐，避免裁剪）；实际比例见查询响应 ratio 字段
          enum:
            - '16:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - '9:16'
            - '21:9'
            - adaptive
          default: adaptive
        duration:
          type: integer
          description: >-
            视频时长（整数秒）：2.5 为 4-30，2.0 系为 4-15；或 -1 由模型智能选择（按实际产出计费）。费用与时长线性相关。注意
            2.5 的缺省值是 -1，2.0 系是 5
          default: 5
          example: 5
        generate_audio:
          type: boolean
          description: 是否生成与画面同步的音频（人声/音效/背景音乐，单声道）。注意默认 true，不需要声音时显式传 false
          default: true
        watermark:
          type: boolean
          description: 是否在右下角加「AI 生成」水印
          default: false
        seed:
          type: integer
          description: 随机种子，[-1, 2^32-1]。相同 seed 生成类似（不保证一致）结果；-1 表示随机
          default: -1
        return_last_frame:
          type: boolean
          description: 是否返回尾帧 png（无水印、与视频同宽高），用于把尾帧作为下一段任务首帧、量产连续视频
          default: false
        execution_expires_after:
          type: integer
          description: 任务过期阈值（秒），超时任务标记为 expired。范围 [3600, 259200]
          default: 172800
        output_format:
          type: string
          description: >-
            输出视频格式，仅 doubao-seedance-2-5-260628 支持。mov 为 QuickTime 容器（H.264 +
            yuv444p + PCM），色彩还原更好、适合后期，但部分播放器不兼容
          enum:
            - mp4
            - mov
          default: mp4
        omni_reference_task_type:
          type: string
          description: >-
            全模态参考生视频的任务类型，仅 doubao-seedance-2-5-260628 支持。显式指定 edit 或 extend
            时接口会前置校验：视频编辑要求 ratio=adaptive 且 duration=-1，视频延长要求
            ratio=adaptive，不符合会在提交时返回 InvalidParameter.TaskTypeConstraint
          enum:
            - auto
            - edit
            - extend
          default: auto
    Seedance2TaskCreated:
      type: object
      description: >-
        任务创建成功响应。拿 id 轮询 GET
        /seedance/api/v3/contents/generations/tasks/{id}；任务成功后视频地址在
        content.video_url（24 小时过期），计费 token 在 usage.completion_tokens
      properties:
        id:
          type: string
          description: 视频生成任务 ID（保存 7 天）
          example: cgt-20260606160057-6bbjd
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key（2.5 须勾选 SeeDance25 分组，2.0 系须勾选 SeeDance2 分组）

````