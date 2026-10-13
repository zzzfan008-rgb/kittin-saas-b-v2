> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 视频生成 API 参考

> Oxygen（oxygen-1.0）视频生成 API 参考与在线调试：OpenAI Videos 兼容，POST /v1/videos 提交、GET /v1/videos/{id} 查询，支持首尾帧与参考素材信封，按秒计费。

<Info>
  右侧的交互式 Playground 支持在线调试。在 **Authorization** 填入你的 API Key（格式 `Bearer sk-xxx`），填好 `prompt`、`seconds`、`size` 即可发送。发送后拿到的是任务 `id`，视频要用下文的查询接口取回。
</Info>

<Tip>
  **一个端点，四种玩法**：只给 `prompt` = 文生视频；`input_reference` 填一张图 = 首帧生视频；`input_reference` 填 JSON 信封 = 首尾帧 / 参考素材生视频，也可以在信封里选 320p、1:1。能力总览见 [Oxygen 概览](/api-capabilities/oxygen/overview)。
</Tip>

<Warning>
  **⚠️ 最容易踩的四个坑**

  1. **每次都显式传 `size`**：不传时网关默认补 `720x1280`，出来是竖屏
  2. **高级参数写进 `input_reference` 信封**：顶层只有 `model`、`prompt`、`seconds`、`size`、`input_reference` 会生效；`last_image`、`reference_images`、`resolution`、`aspect_ratio` 写在顶层会被**静默丢弃**，不报错
  3. **`input_reference` 必须是字符串**：信封先 `json.dumps` / `JSON.stringify` 再放进去，直接传对象或数组会被拒
  4. **时长只用顶层 `seconds`**（4–15），信封里写 `duration` 会返回 400
</Warning>

## 代码示例

### Python（requests · 提交 + 轮询 + 下载）

```python theme={null}
import os
import time
import requests

API_KEY = os.environ["APIYI_API_KEY"]
BASE = "https://api.apiyi.com/v1/videos"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# 第 1 步：提交任务
payload = {
    "model": "oxygen-1.0",
    "prompt": "A paper boat drifting on a calm pond, soft morning light",
    "seconds": "4",          # 4–15，按秒计费
    "size": "1280x720",      # 必须显式传：1280x720 = 480p 横屏
}
r = requests.post(BASE, headers=HEADERS, json=payload, timeout=60)
r.raise_for_status()
video_id = r.json()["id"]
print("id:", video_id)

# 第 2 步：轮询（通常 1–3 分钟出片，最长等 15 分钟）
deadline = time.time() + 900
while time.time() < deadline:
    job = requests.get(f"{BASE}/{video_id}", headers=HEADERS, timeout=30).json()
    print(job["status"], job.get("progress"))
    if job["status"] == "completed":
        video_url = job["video_url"]
        break
    if job["status"] == "failed":
        # 失败任务自动退款，error 里有原因
        raise RuntimeError(job.get("error"))
    time.sleep(5)
else:
    raise TimeoutError(video_id)

# 第 3 步：直接下载 video_url（不需要鉴权头；约 24 小时有效，请及时转存）
with requests.get(video_url, stream=True, timeout=300) as v, open("output.mp4", "wb") as f:
    v.raise_for_status()
    for chunk in v.iter_content(1 << 16):
        f.write(chunk)
print("Saved: output.mp4")
```

### Python（首帧生视频 · 请求体片段）

```python theme={null}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere rolls slowly across the table",
    "seconds": "4",
    "size": "1280x720",      # 决定清晰度（480p）；画幅跟随首帧图片
    "input_reference": "https://your-cdn.example.com/first.png",  # 也可以是 data:image/...;base64,...
}
```

### Python（首尾帧 / 参考素材 · JSON 信封）

```python theme={null}
import json

# 首尾帧：信封是 JSON 字符串，先 json.dumps 再放进 input_reference
envelope = {
    "images": ["https://your-cdn.example.com/first.png"],   # 首帧（最多 1 张）
    "last_image": "https://your-cdn.example.com/last.png",  # 尾帧
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": json.dumps(envelope),
}

# 参考素材 + 竖屏 + 320p（参考素材不能和首尾帧混用）
envelope = {
    "reference_images": ["https://your-cdn.example.com/character.png"],   # ≤ 9
    "reference_videos": ["https://your-cdn.example.com/motion.mp4"],      # ≤ 3，仅 https
    "aspect_ratio": "9:16",
    "resolution": "320p",    # 信封里的 resolution 优先于 size
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

首尾帧（注意 `input_reference` 的值是转义后的 JSON 字符串）：

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
    // 高级参数：信封要先 JSON.stringify 成字符串
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

## 已有 id？一条 cURL 查结果

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer $APIYI_API_KEY"
```

`status` 为 `completed` 时，`video_url` 就是 MP4 地址，可直接下载：

```bash theme={null}
curl -L -o output.mp4 "<video_url 的值>"
```

## 参数说明速查

### 顶层字段（只有这五个会生效）

| 参数 | 类型 | 必填 | 说明 |
| - | - | - | - |
| `model` | string | 是 | 固定 `oxygen-1.0` |
| `prompt` | string | 是 | 视频描述 |
| `seconds` | string / integer | 是 | 整数 4–15，按此计费 |
| `size` | string | 建议必传 | `1280x720` / `720x1280`（480p）、`1792x1024` / `1024x1792`（768p）；不传默认 `720x1280` |
| `input_reference` | string | 否 | 图片链接或 data URI = 首帧；以 `{` 开头的 JSON 字符串 = 信封（见下表） |

### `input_reference` 信封字段

| 键 | 类型 | 说明 |
| - | - | - |
| `images` | string\[] | 首帧，最多 1 张（https 或图片 data URI） |
| `last_image` | string | 尾帧（https 或图片 data URI） |
| `reference_images` | string\[] | 参考图，最多 9 张 |
| `reference_videos` | string\[] | 参考视频，最多 3 段，仅 https |
| `reference_audios` | string\[] | 参考音频，最多 3 段，仅 https |
| `resolution` | string | `320p` / `480p` / `768p`，优先于 `size` |
| `aspect_ratio` | string | `16:9` / `9:16` / `1:1`，优先于 `size`；图生视频时忽略 |
| `prompt` | string | 写了就覆盖顶层 `prompt` |

<Warning>
  信封里**不能写 `duration`**（时长用顶层 `seconds`），也不能出现表外的键；首尾帧（`images` / `last_image`）与 `reference_*` 不能混用。违反任一条返回 400（`param: input_reference`），不扣费。
</Warning>

### 清晰度与输出尺寸（实测）

| 清晰度 | 横 16:9 | 竖 9:16 | 方 1:1 |
| - | - | - | - |
| 320p | 576×320 | （未实测） | （未实测） |
| 480p | 864×480 | 480×864 | 480×480 |
| 768p | 1344×768 | 768×1344 | 768×768 |

图生视频的画幅跟随首帧图片，例如方图首帧输出 480×480（480p）。

## 响应格式

### 创建任务

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

### 查询任务（成功）

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

### 查询任务（失败）

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

### 提交报错（400）

```json theme={null}
{
  "message": "{\"error\":{\"code\":\"invalid_params\",\"message\":\"input_reference: duration is not used here; set the length with the top-level seconds field\",\"param\":\"input_reference\"}}",
  "type": "task_error",
  "code": "fail_to_fetch_task"
}
```

<Warning>
  **⚠️ 响应字段要点**

  * 状态依次为 `queued` → `in_progress` → `completed` / `failed`
  * 成片地址在 **`video_url`**，下载不需要鉴权头；`expires_at` 之后失效（约 24 小时），请及时转存
  * 刚变成 `completed` 时，`/v1/videos/{id}/content` 可能还要几秒才能下载（先返回 400），优先用 `video_url`
  * `usage.unit_price_usd` 是按清晰度的参考单价，**实际扣费以账单为准**：统一 \$0.02/秒
  * 提交报错时，具体原因是 `message` 字段里的一段 JSON 字符串，需要再解析一次
</Warning>

<Info>
  **计费**：任务受理时按 `seconds × \$0.02` 预扣，清晰度和参考素材不影响价格；任务失败会**自动全额退款**。提交阶段返回 400 的请求不扣费，查询与下载不收费。价格详见 [概览页定价](/api-capabilities/oxygen/overview#模型定价)。
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