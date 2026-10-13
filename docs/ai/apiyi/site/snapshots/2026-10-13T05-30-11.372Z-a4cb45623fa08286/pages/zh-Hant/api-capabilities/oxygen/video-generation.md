> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 影片生成 API 參考

> Oxygen（oxygen-1.0）影片生成 API 參考與線上除錯：OpenAI Videos 相容，POST /v1/videos 提交、GET /v1/videos/{id} 查詢，支援首尾幀與參考素材信封，按秒計費。

<Info>
  右側的互動式 Playground 支援線上除錯。在 **Authorization** 填入你的 API Key（格式 `Bearer sk-xxx`），填好 `prompt`、`seconds`、`size` 即可傳送。傳送後拿到的是任務 `id`，影片要用下文的查詢介面取回。
</Info>

<Tip>
  **一個端點，四種玩法**：只給 `prompt` = 文生影片；`input_reference` 填一張圖 = 首幀生影片；`input_reference` 填 JSON 信封 = 首尾幀 / 參考素材生影片，也可以在信封裡選 320p、1:1。能力總覽見 [Oxygen 概覽](/zh-Hant/api-capabilities/oxygen/overview)。
</Tip>

<Warning>
  **⚠️ 最容易踩的四個坑**

  1. **每次都顯式傳 `size`**：不傳時閘道預設補 `720x1280`，出來是豎屏
  2. **高階引數寫進 `input_reference` 信封**：頂層只有 `model`、`prompt`、`seconds`、`size`、`input_reference` 會生效；`last_image`、`reference_images`、`resolution`、`aspect_ratio` 寫在頂層會被**靜默丟棄**，不報錯
  3. **`input_reference` 必須是字串**：信封先 `json.dumps` / `JSON.stringify` 再放進去，直接傳物件或陣列會被拒
  4. **時長只用頂層 `seconds`**（4–15），信封裡寫 `duration` 會返回 400
</Warning>

## 程式碼示例

### Python（requests · 提交 + 輪詢 + 下載）

```python theme={null}
import os
import time
import requests

API_KEY = os.environ["APIYI_API_KEY"]
BASE = "https://api.apiyi.com/v1/videos"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# 第 1 步：提交任務
payload = {
    "model": "oxygen-1.0",
    "prompt": "A paper boat drifting on a calm pond, soft morning light",
    "seconds": "4",          # 4–15，按秒計費
    "size": "1280x720",      # 必須顯式傳：1280x720 = 480p 橫屏
}
r = requests.post(BASE, headers=HEADERS, json=payload, timeout=60)
r.raise_for_status()
video_id = r.json()["id"]
print("id:", video_id)

# 第 2 步：輪詢（通常 1–3 分鐘出片，最長等 15 分鐘）
deadline = time.time() + 900
while time.time() < deadline:
    job = requests.get(f"{BASE}/{video_id}", headers=HEADERS, timeout=30).json()
    print(job["status"], job.get("progress"))
    if job["status"] == "completed":
        video_url = job["video_url"]
        break
    if job["status"] == "failed":
        # 失敗任務自動退款，error 裡有原因
        raise RuntimeError(job.get("error"))
    time.sleep(5)
else:
    raise TimeoutError(video_id)

# 第 3 步：直接下載 video_url（不需要鑑權頭；約 24 小時有效，請及時轉存）
with requests.get(video_url, stream=True, timeout=300) as v, open("output.mp4", "wb") as f:
    v.raise_for_status()
    for chunk in v.iter_content(1 << 16):
        f.write(chunk)
print("Saved: output.mp4")
```

### Python（首幀生影片 · 請求體片段）

```python theme={null}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere rolls slowly across the table",
    "seconds": "4",
    "size": "1280x720",      # 決定清晰度（480p）；畫幅跟隨首幀圖片
    "input_reference": "https://your-cdn.example.com/first.png",  # 也可以是 data:image/...;base64,...
}
```

### Python（首尾幀 / 參考素材 · JSON 信封）

```python theme={null}
import json

# 首尾幀：信封是 JSON 字串，先 json.dumps 再放進 input_reference
envelope = {
    "images": ["https://your-cdn.example.com/first.png"],   # 首幀（最多 1 張）
    "last_image": "https://your-cdn.example.com/last.png",  # 尾幀
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": json.dumps(envelope),
}

# 參考素材 + 豎屏 + 320p（參考素材不能和首尾幀混用）
envelope = {
    "reference_images": ["https://your-cdn.example.com/character.png"],   # ≤ 9
    "reference_videos": ["https://your-cdn.example.com/motion.mp4"],      # ≤ 3，僅 https
    "aspect_ratio": "9:16",
    "resolution": "320p",    # 信封裡的 resolution 優先於 size
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The character from the reference image dances following the reference video",
    "seconds": "8",
    "size": "720x1280",
    "input_reference": json.dumps(envelope),
}
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  --max-time 60 \
  -d '{
    "model": "oxygen-1.0",
    "prompt": "A lighthouse at dusk, waves crashing on the rocks",
    "seconds": "4",
    "size": "1792x1024"
  }'
```

首尾幀（注意 `input_reference` 的值是轉義後的 JSON 字串）：

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
  }'
```

### Node.js（原生 fetch）

```javascript theme={null}
const API_KEY = process.env.APIYI_API_KEY;
const BASE = 'https://api.apiyi.com/v1/videos';
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

const submit = await fetch(BASE, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'oxygen-1.0',
    prompt: 'Aurora drifting over snowy mountains, time-lapse feel',
    seconds: '8',
    size: '1280x720',
    // 高階引數：信封要先 JSON.stringify 成字串
    input_reference: JSON.stringify({ resolution: '320p' }),
  }),
});
if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
const { id } = await submit.json();

let job;
for (;;) {
  await new Promise(r => setTimeout(r, 5000));
  job = await (await fetch(`${BASE}/${id}`, { headers })).json();
  if (job.status === 'completed' || job.status === 'failed') break;
}
if (job.status === 'failed') throw new Error(JSON.stringify(job.error));
console.log('video:', job.video_url);
```

## 已有 id？一條 cURL 查結果

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer $APIYI_API_KEY"
```

`status` 為 `completed` 時，`video_url` 就是 MP4 地址，可直接下載：

```bash theme={null}
curl -L -o output.mp4 "<video_url 的值>"
```

## 引數說明速查

### 頂層欄位（只有這五個會生效）

| 引數 | 型別 | 必填 | 說明 |
| - | - | - | - |
| `model` | string | 是 | 固定 `oxygen-1.0` |
| `prompt` | string | 是 | 影片描述 |
| `seconds` | string / integer | 是 | 整數 4–15，按此計費 |
| `size` | string | 建議必傳 | `1280x720` / `720x1280`（480p）、`1792x1024` / `1024x1792`（768p）；不傳預設 `720x1280` |
| `input_reference` | string | 否 | 圖片連結或 data URI = 首幀；以 `{` 開頭的 JSON 字串 = 信封（見下表） |

### `input_reference` 信封欄位

| 鍵 | 型別 | 說明 |
| - | - | - |
| `images` | string\[] | 首幀，最多 1 張（https 或圖片 data URI） |
| `last_image` | string | 尾幀（https 或圖片 data URI） |
| `reference_images` | string\[] | 參考圖，最多 9 張 |
| `reference_videos` | string\[] | 參考影片，最多 3 段，僅 https |
| `reference_audios` | string\[] | 參考音訊，最多 3 段，僅 https |
| `resolution` | string | `320p` / `480p` / `768p`，優先於 `size` |
| `aspect_ratio` | string | `16:9` / `9:16` / `1:1`，優先於 `size`；圖生影片時忽略 |
| `prompt` | string | 寫了就覆蓋頂層 `prompt` |

<Warning>
  信封裡**不能寫 `duration`**（時長用頂層 `seconds`），也不能出現表外的鍵；首尾幀（`images` / `last_image`）與 `reference_*` 不能混用。違反任一條返回 400（`param: input_reference`），不扣費。
</Warning>

### 清晰度與輸出尺寸（實測）

| 清晰度 | 橫 16:9 | 豎 9:16 | 方 1:1 |
| - | - | - | - |
| 320p | 576×320 | （未實測） | （未實測） |
| 480p | 864×480 | 480×864 | 480×480 |
| 768p | 1344×768 | 768×1344 | 768×768 |

圖生影片的畫幅跟隨首幀圖片，例如方圖首幀輸出 480×480（480p）。

## 響應格式

### 建立任務

```json theme={null}
{
  "id": "task_PSOFP1GQLtN6kGLXv9DpHMkMGBka70Ga",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "queued",
  "progress": 0,
  "seconds": "4",
  "size": "1280x720",
  "created_at": 1790853159
}
```

### 查詢任務（成功）

```json theme={null}
{
  "id": "task_R0Sb8B4YqmNxVSkQZSphUZ8GwEebRMRu",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "completed",
  "progress": 100,
  "seconds": "5",
  "created_at": 1790902499,
  "completed_at": 1790902566,
  "expires_at": 1790988966,
  "usage": {
    "billing_unit": "second",
    "billed_seconds": 5,
    "resolution": "480p",
    "unit_price_usd": 0.02
  },
  "video_url": "https://your-video-host.example.com/task_R0Sb8B4Y..._0.mp4"
}
```

### 查詢任務（失敗）

```json theme={null}
{
  "id": "task_xqNrojcHWebOegX70EZzqpM3EhdXMnOo",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "failed",
  "progress": 100,
  "error": {
    "code": "upstream_timeout",
    "message": "upstream did not finish the video within the deadline"
  }
}
```

### 提交報錯（400）

```json theme={null}
{
  "message": "{\"error\":{\"code\":\"invalid_params\",\"message\":\"input_reference: duration is not used here; set the length with the top-level seconds field\",\"param\":\"input_reference\"}}",
  "type": "task_error",
  "code": "fail_to_fetch_task"
}
```

<Warning>
  **⚠️ 響應欄位要點**

  * 狀態依次為 `queued` → `in_progress` → `completed` / `failed`
  * 成片地址在 **`video_url`**，下載不需要鑑權頭；`expires_at` 之後失效（約 24 小時），請及時轉存
  * 剛變成 `completed` 時，`/v1/videos/{id}/content` 可能還要幾秒才能下載（先返回 400），優先用 `video_url`
  * `usage.unit_price_usd` 是按清晰度的參考單價，**實際扣費以賬單為準**：統一 \$0.02/秒
  * 提交報錯時，具體原因是 `message` 欄位裡的一段 JSON 字串，需要再解析一次
</Warning>

<Info>
  **計費**：任務受理時按 `seconds × \$0.02` 預扣，清晰度和參考素材不影響價格；任務失敗會**自動全額退款**。提交階段返回 400 的請求不扣費，查詢與下載不收費。價格詳見 [概覽頁定價](/zh-Hant/api-capabilities/oxygen/overview#模型定價)。
</Info>


## OpenAPI

````yaml api-reference/oxygen-video-openapi.yaml POST /videos
openapi: 3.1.0
info:
  title: Oxygen 视频生成 API
  description: >
    AZ8 Oxygen 视频生成模型，接口兼容 OpenAI Videos。一个端点覆盖文生视频、首帧 / 首尾帧生视频、参考图 / 参考视频 /
    参考音频生视频。


    - 模型 ID：`oxygen-1.0`

    - 时长：顶层 `seconds`，整数 4–15；清晰度 320p / 480p / 768p

    - 按秒计费 \$0.02/秒，不分清晰度；失败任务自动退款

    - **只有 `model` / `prompt` / `seconds` / `size` / `input_reference`
    五个顶层字段生效**；首尾帧、参考素材、320p、1:1 写进 `input_reference` 的 JSON 信封

    - **异步任务式端点**：提交返回任务 `id`，需轮询 `GET /v1/videos/{id}` 取结果


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com/v1
    description: 主要端点
security:
  - bearerAuth: []
paths:
  /videos:
    post:
      tags:
        - 视频生成
      summary: 创建 Oxygen 视频生成任务
      description: >
        提交一个异步视频生成任务，成功只代表任务已受理，返回 `status: queued` 的 video 对象。


        生成方式：

        - 不传 `input_reference` → 文生视频

        - `input_reference` 填图片链接或 data URI → 首帧生视频（画幅跟随首帧）

        - `input_reference` 填以 `{` 开头的 JSON 字符串 → 信封：首尾帧（`images` +
        `last_image`）、参考素材（`reference_images` / `reference_videos` /
        `reference_audios`）、`resolution`（含 320p）、`aspect_ratio`


        规则：

        - **每次都显式传 `size`**，不传时默认 `720x1280`（竖屏）

        - `last_image`、`reference_images`、`resolution`、`aspect_ratio`
        写在顶层会被静默丢弃，必须写进信封

        - 信封里不能写 `duration`；首尾帧不能与参考素材混用

        - 通常 1–3 分钟出片，之后用 `GET /v1/videos/{id}` 查询
      operationId: createOxygenVideo
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OxygenCreateRequest'
            examples:
              文生视频:
                value:
                  model: oxygen-1.0
                  prompt: A paper boat drifting on a calm pond, soft morning light
                  seconds: '4'
                  size: 1280x720
              首帧生视频:
                value:
                  model: oxygen-1.0
                  prompt: The glass sphere rolls slowly across the table
                  seconds: '4'
                  size: 1280x720
                  input_reference: https://your-cdn.example.com/first.png
              首尾帧生视频:
                value:
                  model: oxygen-1.0
                  prompt: >-
                    The glass sphere slowly dissolves into a deep blue abstract
                    wave
                  seconds: '5'
                  size: 1280x720
                  input_reference: >-
                    {"images":["https://your-cdn.example.com/first.png"],"last_image":"https://your-cdn.example.com/last.png"}
              参考图生视频:
                value:
                  model: oxygen-1.0
                  prompt: >-
                    The object from the reference image slowly rotates on a
                    wooden table
                  seconds: '4'
                  size: 720x1280
                  input_reference: >-
                    {"reference_images":["https://your-cdn.example.com/object.png"],"aspect_ratio":"9:16"}
              选择320p:
                value:
                  model: oxygen-1.0
                  prompt: A paper boat drifting on a calm pond
                  seconds: '4'
                  size: 1280x720
                  input_reference: '{"resolution":"320p"}'
      responses:
        '200':
          description: 任务已受理
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OxygenVideo'
              example:
                id: task_PSOFP1GQLtN6kGLXv9DpHMkMGBka70Ga
                object: video
                model: oxygen-1.0
                status: queued
                progress: 0
                seconds: '4'
                size: 1280x720
                created_at: 1790853159
        '400':
          description: >-
            参数校验失败（seconds 不在 4–15、信封 JSON 非法 / 含未知键 / 写了
            duration、首尾帧与参考素材混用、input_reference 不是字符串等），不扣费。原因在 `message` 字段的
            JSON 字符串里
        '401':
          description: 未授权 - API Key 无效
        '500':
          description: 参考图片下载失败等，不扣费
        '503':
          description: 当前令牌分组下没有可用渠道（常见于 model 拼写错误或令牌分组未包含本模型）
      security:
        - bearerAuth: []
components:
  schemas:
    OxygenCreateRequest:
      type: object
      required:
        - model
        - prompt
        - seconds
      properties:
        model:
          type: string
          description: 固定为 `oxygen-1.0`
          enum:
            - oxygen-1.0
          default: oxygen-1.0
        prompt:
          type: string
          description: 视频描述
          example: A paper boat drifting on a calm pond, soft morning light
        seconds:
          type: string
          description: 输出时长（秒），整数 4–15，字符串或数字均可。按此计费；成片通常略长于请求值
          enum:
            - '4'
            - '5'
            - '6'
            - '7'
            - '8'
            - '9'
            - '10'
            - '11'
            - '12'
            - '13'
            - '14'
            - '15'
          default: '4'
        size:
          type: string
          description: >
            决定清晰度与横竖。**建议每次都传**，不传默认 `720x1280`（竖屏）。

            `1280x720` = 480p 横屏，`720x1280` = 480p 竖屏，`1792x1024` = 768p
            横屏，`1024x1792` = 768p 竖屏。

            320p 和 1:1 请用 `input_reference` 信封里的 `resolution` / `aspect_ratio`。
          enum:
            - 1280x720
            - 720x1280
            - 1792x1024
            - 1024x1792
          default: 1280x720
        input_reference:
          type: string
          description: >
            两种写法：

            - **图片链接或 data URI** → 首帧生视频，画幅跟随首帧

            - **以 `{` 开头的 JSON 字符串**（信封）→
            可用键：`images`（首帧，≤1）、`last_image`（尾帧）、`reference_images`（≤9）、`reference_videos`（≤3，仅
            https）、`reference_audios`（≤3，仅 https）、`resolution`（`320p` / `480p` /
            `768p`，优先于 size）、`aspect_ratio`（`16:9` / `9:16` /
            `1:1`，图生时忽略）、`prompt`


            必须是字符串，信封要先 JSON 序列化；信封里不能写 `duration`、不能有未知键；首尾帧不能与参考素材混用。
          example: https://your-cdn.example.com/first.png
    OxygenVideo:
      type: object
      properties:
        id:
          type: string
          description: 任务 id，用于 `GET /v1/videos/{id}` 查询
        object:
          type: string
          enum:
            - video
        model:
          type: string
        status:
          type: string
          enum:
            - queued
            - in_progress
            - completed
            - failed
        progress:
          type: integer
          description: 0–100
        seconds:
          type: string
        size:
          type: string
        created_at:
          type: integer
        completed_at:
          type: integer
        expires_at:
          type: integer
          description: video_url 失效时间（Unix 秒），约为完成后 24 小时
        video_url:
          type: string
          description: 成片 MP4 地址，下载不需要鉴权头，请及时转存
        usage:
          type: object
          description: 参考计费信息；实际扣费统一为 \$0.02/秒，以账单为准
          properties:
            billing_unit:
              type: string
            billed_seconds:
              type: integer
            resolution:
              type: string
            unit_price_usd:
              type: number
        error:
          type: object
          properties:
            code:
              type: string
              description: 如 `upstream_error`、`upstream_timeout`
            message:
              type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.