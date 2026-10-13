> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 视频生成 API 参考

> MiniMax-H3 视频生成 API 参考与在线调试：一个端点覆盖文生、首尾帧、参考图/视频/音频生视频，异步提交 + 按 task_id 查询，768P、4–15 秒、按秒计费。

<Info>
  右侧的交互式 Playground 支持在线调试。在 **Authorization** 填入你的 API Key（格式 `Bearer sk-xxx`），在 `content` 里放一个文本项（需要时再加图片 / 视频 / 音频项），选好 `duration` 与 `ratio` 即可发送。发送后拿到的是 `task_id`，视频要用下文的查询接口取回。
</Info>

<Tip>
  **一个端点，四种玩法**：只放文本 = 文生视频；加 `first_frame` / `last_frame` 图片 = 首尾帧生视频；加 `reference_image` / `reference_video` / `reference_audio` = 参考素材生视频。系统按 `content[]` 自动识别，不用切换端点。能力总览见 [MiniMax-H3 概览](/api-capabilities/minimax-h3/overview)。
</Tip>

<Warning>
  **⚠️ 最容易踩的四个坑**

  1. **路径带 `/hailuo` 前缀**：创建是 `POST /hailuo/v2/video_generation`，查询是 `GET /hailuo/v2/query/video_generation/{task_id}`。不带前缀的 `/v2/...` 会返回网页而不是 JSON
  2. **`duration` 必须是整数，范围 4–15**：传字符串 `"5"` 或小数 `5.5` 会被拒
  3. **`resolution` 只能写大写 `768P`**：`768p`、`2K` 都会被拒
  4. **纯文本和纯音频请求不能用 `ratio: "adaptive"`**，必须选固定比例；`adaptive` 只在带图片或视频时可用
</Warning>

## 代码示例

### Python（requests · 提交 + 轮询 + 下载）

```python theme={null}
import time
import requests

API_KEY = "sk-your-api-key"
BASE = "https://api.apiyi.com/hailuo/v2"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# 第 1 步：提交任务
payload = {
    "model": "MiniMax-H3",
    "content": [
        {"type": "text", "text": "黄昏海边的灯塔，镜头缓慢推进，海浪拍打礁石，电影级光影"}
    ],
    "resolution": "768P",   # 只支持大写 768P
    "duration": 5,          # 整数 4–15，按秒计费
    "ratio": "16:9",        # 纯文本请求必须用固定比例
}
for attempt in range(3):
    # 提交本身要几秒；高峰期偶发 500，不扣费，退避后重试
    r = requests.post(f"{BASE}/video_generation", headers=HEADERS, json=payload, timeout=60)
    if r.status_code != 500:
        break
    time.sleep(5 * (attempt + 1))
r.raise_for_status()
task_id = r.json()["task_id"]
print("task_id:", task_id)

# 第 2 步：轮询（通常 2–4 分钟出片，最长等 15 分钟）
deadline = time.time() + 900
while time.time() < deadline:
    task = requests.get(f"{BASE}/query/video_generation/{task_id}",
                        headers=HEADERS, timeout=30).json()["task"]
    print(task["status"])
    if task["status"] == "succeeded":
        video_url = task["content"]["url"]
        break
    if task["status"] == "failed":
        # 失败任务自动退款，error 里有原因
        raise RuntimeError(task["error"])
    time.sleep(10)
else:
    raise TimeoutError(task_id)

# 第 3 步：下载（地址不需要鉴权；用 GET，不要用 HEAD 探活）
with requests.get(video_url, stream=True, timeout=300) as v, open("output.mp4", "wb") as f:
    v.raise_for_status()
    for chunk in v.iter_content(1 << 16):
        f.write(chunk)
print("Saved: output.mp4")
```

### Python（首帧生视频 · 请求体片段）

```python theme={null}
payload = {
    "model": "MiniMax-H3",
    "content": [
        {"type": "text", "text": "人物缓缓转头微笑，微风吹动发丝，镜头轻推"},
        {"type": "image_url",
         "image_url": {"url": "https://your-cdn.example.com/first.png"},
         "role": "first_frame"},
    ],
    "resolution": "768P",
    "duration": 5,
    "ratio": "adaptive",   # 跟随首帧图片比例
}
```

### Python（多参考素材 · 请求体片段）

```python theme={null}
payload = {
    "model": "MiniMax-H3",
    "content": [
        # 按同类素材的出现顺序编号：第 1 张图 = <Picture 1>，第 1 段视频 = <Video 1>
        {"type": "text", "text": "<Picture 1> 按照 <Video 1> 的动作起舞，节奏跟随 <Audio 1>"},
        {"type": "image_url", "image_url": {"url": "https://your-cdn.example.com/character.png"},
         "role": "reference_image"},
        {"type": "video_url", "video_url": {"url": "https://your-cdn.example.com/motion.mp4"},
         "role": "reference_video"},
        {"type": "audio_url", "audio_url": {"url": "https://your-cdn.example.com/music.mp3"},
         "role": "reference_audio"},
    ],
    "resolution": "768P",
    "duration": 10,
    "ratio": "adaptive",
}
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/hailuo/v2/video_generation" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  --max-time 60 \
  -d '{
    "model": "MiniMax-H3",
    "content": [
      {"type": "text", "text": "黄昏海边的灯塔，镜头缓慢推进，海浪拍打礁石，电影级光影"}
    ],
    "resolution": "768P",
    "duration": 5,
    "ratio": "16:9"
  }'
```

### Node.js（原生 fetch）

```javascript theme={null}
const API_KEY = 'sk-your-api-key';
const BASE = 'https://api.apiyi.com/hailuo/v2';
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

const submit = await fetch(`${BASE}/video_generation`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'MiniMax-H3',
    content: [{ type: 'text', text: '雪山上空缓缓流动的极光，延时摄影质感' }],
    resolution: '768P',
    duration: 8,
    ratio: '21:9',
  }),
});
if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
const { task_id } = await submit.json();

let task;
for (;;) {
  await new Promise(r => setTimeout(r, 10000));
  task = (await (await fetch(`${BASE}/query/video_generation/${task_id}`, { headers })).json()).task;
  if (task.status === 'succeeded' || task.status === 'failed') break;
}
if (task.status === 'failed') throw new Error(JSON.stringify(task.error));
console.log('video:', task.content.url);
```

### 浏览器 JavaScript

```javascript theme={null}
{/* 仅作演示，生产请走后端代理避免 Key 泄露 */}
const resp = await fetch('https://api.apiyi.com/hailuo/v2/video_generation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-your-api-key' },
  body: JSON.stringify({
    model: 'MiniMax-H3',
    content: [{ type: 'text', text: '水彩风格的小船漂过平静的河面' }],
    resolution: '768P',
    duration: 4,
    ratio: '9:16',
  }),
});
const { task_id } = await resp.json();
console.log('task_id:', task_id);
{/* 轮询交给后端，拿到 content.url 后直接用 video 标签播放 */}
```

## 已有 task\_id？一条 cURL 查结果

```bash theme={null}
curl "https://api.apiyi.com/hailuo/v2/query/video_generation/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

`status` 为 `succeeded` 时，`task.content.url` 就是 MP4 地址，可直接下载：

```bash theme={null}
curl -L -o output.mp4 "<task.content.url 的值>"
```

## 参数说明速查

| 参数 | 类型 | 必填 | 默认 | 说明 |
| - | - | - | - | - |
| `model` | string | 是 | — | 固定 `MiniMax-H3`，大小写敏感 |
| `content` | array | 是 | — | 恰好 1 个文本项 + 0–12 个媒体项（参考图 ≤ 9、参考视频 ≤ 3、参考音频 ≤ 3） |
| `content[].text` | string | 是 | — | 1–7000 字符；引用素材写 `<Picture 1>` / `<Video 1>` / `<Audio 1>` |
| `content[].role` | string | 视情况 | — | 图片：`first_frame` / `last_frame` / `reference_image`；视频：`reference_video`；音频：`reference_audio`。只有一张图时可省略（按首帧处理） |
| `resolution` | string | 是 | — | 仅 `768P` |
| `duration` | integer | 是 | — | 4–15 秒，按秒计费 |
| `ratio` | string | 是 | — | `21:9` / `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `adaptive` |

### 比例与输出尺寸（实测）

| `ratio` | 输出尺寸 |
| - | - |
| `21:9` | 1536×672 |
| `16:9` | 1344×768 |
| `4:3` | 1024×768 |
| `1:1` | 768×768 |
| `3:4` | 768×1024 |
| `9:16` | 768×1344 |
| `adaptive` | 跟随输入图片比例（如方图出 768×768） |

### 素材要求

| 类型 | 格式 | 大小 | 时长 / 尺寸 |
| - | - | - | - |
| 图片 | JPG / PNG / WebP / HEIC / HEIF（静态） | ≤ 30MB | 单边 256–5760 像素，宽高比 0.4–2.5；首尾帧比例差不超过 2% |
| 视频 | MP4 / MOV（H.264 / H.265） | ≤ 50MB | 每段 ≥ 2 秒；超 15 秒只取片头；多段**累计**不超过 15 秒 |
| 音频 | WAV / MP3 / M4A / AAC | ≤ 15MB | 每段 ≥ 2 秒；超 15 秒只取片头 |

<Warning>
  所有素材都必须是**公网可直接下载的 HTTPS 链接**。Base64、data URI、`http://` 链接、内网地址都不支持；带防盗链或需要登录的链接会让任务在下载素材时失败。
</Warning>

## 响应格式

### 创建任务

```json theme={null}
{"task_id": "task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx"}
```

### 查询任务（生成中）

```json theme={null}
{
  "task": {
    "id": "task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx",
    "status": "running",
    "progress": 0,
    "content": null,
    "error": null
  }
}
```

### 查询任务（成功）

```json theme={null}
{
  "task": {
    "id": "task_R3SNqSywqnYPTAbqg1Z4iXEItPoln59I",
    "status": "succeeded",
    "progress": 1,
    "model": "MiniMax-H3",
    "modality": "video",
    "task_type": "generation",
    "ratio": "21:9",
    "resolution": "768P",
    "duration": 5,
    "usage": {
      "input_image_count": 0,
      "input_seconds": 0,
      "output_seconds": 5,
      "total_seconds": 5
    },
    "content": {
      "url": "https://your-video-host.example.com/outputs/4a441cc0....mp4"
    },
    "created_at": 1790641245,
    "updated_at": 1790641411
  }
}
```

### 查询任务（失败）

```json theme={null}
{
  "task": {
    "id": "task_w6ASrlpw5rfIVeeMSMnC5sHryP2Xv4th",
    "status": "failed",
    "error": {"code": "input_download_failed", "message": "media server returned 404"}
  }
}
```

<Warning>
  **⚠️ 响应字段要点**

  * 查询结果包在 **`task`** 对象里，不在顶层
  * 成功时稳定存在的只有 `id`、`status`、`progress`、`content.url`；`usage`、`model`、`ratio` 等字段**不保证每次都返回**，解析时请做好缺省处理
  * 状态依次为 `queued` → `running` → `succeeded` / `failed`；高峰期可能直接从 `running` 开始
  * `progress` 只在 0 和 1 之间跳，不适合做百分比进度条
  * 视频地址在 `task.content.url`，下载**不需要**鉴权头。该地址对 `HEAD` 请求返回 403，但 `GET` 正常——检查可用性请用 `GET`
  * 建议拿到地址后尽快下载转存到自己的存储
</Warning>

<Info>
  **计费**：任务受理时按 `duration × \$0.03` 预扣，参考素材不额外收费；任务失败会**自动全额退款**。提交阶段返回 4xx / 5xx 的请求不扣费，查询与下载不收费。价格详见 [概览页定价](/api-capabilities/minimax-h3/overview#模型定价)。
</Info>


## OpenAPI

````yaml api-reference/minimax-h3-video-openapi.yaml POST /hailuo/v2/video_generation
openapi: 3.1.0
info:
  title: MiniMax-H3 视频生成 API
  description: >
    MiniMax H3（海螺 3.0）视频生成模型 — 一个端点覆盖文生视频、首尾帧生视频、参考图 / 参考视频 / 参考音频生视频。


    - 模型 ID：`MiniMax-H3`（大小写敏感）

    - 分辨率仅 `768P`；时长整数 4–15 秒；比例 `21:9` / `16:9` / `4:3` / `1:1` / `3:4` /
    `9:16` / `adaptive`

    - 输出 MP4 自带立体声音轨（配乐 / 音效由模型根据 prompt 生成，无开关参数）

    - 按秒计费 \$0.03/秒，参考素材不额外收费；失败任务自动退款

    - **异步任务式端点**：本端点只提交任务、返回 `task_id`，需轮询 `GET
    /hailuo/v2/query/video_generation/{task_id}` 取结果


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
security:
  - bearerAuth: []
paths:
  /hailuo/v2/video_generation:
    post:
      tags:
        - 视频生成
      summary: 创建 MiniMax-H3 视频生成任务
      description: >
        提交一个异步视频生成任务，成功只代表任务已受理，返回 `{"task_id": "task_..."}`。


        系统根据 `content[]` 自动识别生成方式：

        - 只有文本 → 文生视频（`ratio` 必须是固定比例，不能用 `adaptive`）

        - 文本 + `first_frame` / `last_frame` 图片 → 关键帧生视频

        - 文本 + `reference_image` / `reference_video` / `reference_audio` →
        参考素材生视频，提示词用 `<Picture 1>`、`<Video 1>`、`<Audio 1>` 引用


        规则：

        - `content[]` 必须恰好一个文本项，外加 0–12 个媒体项（参考图 ≤ 9、参考视频 ≤ 3、参考音频 ≤ 3）

        - 所有媒体必须是公网 HTTPS 链接，不支持 Base64 / data URI / 私网地址

        - 首尾帧不能与 `reference_*` 混用；多张图片必须显式写 `role`

        - 典型生成耗时 2–4 分钟，之后用 `GET /hailuo/v2/query/video_generation/{task_id}` 查询
      operationId: createMiniMaxH3VideoGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/H3CreateRequest'
            examples:
              文生视频:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: 黄昏海边的灯塔，镜头缓慢推进，海浪拍打礁石，电影级光影
                  resolution: 768P
                  duration: 5
                  ratio: '16:9'
              首帧生视频:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: 人物缓缓转头微笑，微风吹动发丝，镜头轻推
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/first.png
                      role: first_frame
                  resolution: 768P
                  duration: 5
                  ratio: adaptive
              多参考图:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: <Picture 1> 和 <Picture 2> 并肩走过下雨的街道
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/person-a.png
                      role: reference_image
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/person-b.png
                      role: reference_image
                  resolution: 768P
                  duration: 8
                  ratio: adaptive
              参考音频:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: 一段随 <Audio 1> 节奏起舞的电影感舞蹈表演
                    - type: audio_url
                      audio_url:
                        url: https://your-cdn.example.com/music.mp3
                      role: reference_audio
                  resolution: 768P
                  duration: 10
                  ratio: '16:9'
      responses:
        '200':
          description: 任务已受理，返回 task_id
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/H3CreateResponse'
              example:
                task_id: task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx
        '400':
          description: 参数校验失败（时长不在 4–15、比例非法、文本超 7000 字符、媒体数量超限、角色混用等），不扣费
        '401':
          description: 未授权 - API Key 无效
        '500':
          description: 上游错误（含部分非法参数与瞬时过载），不扣费；检查参数后退避重试
        '503':
          description: 当前令牌分组下没有可用渠道（常见于 model 拼写错误或令牌分组未包含本模型）
      security:
        - bearerAuth: []
components:
  schemas:
    H3CreateRequest:
      type: object
      required:
        - model
        - content
        - resolution
        - duration
        - ratio
      properties:
        model:
          type: string
          description: 固定为 `MiniMax-H3`（大小写敏感）
          enum:
            - MiniMax-H3
          default: MiniMax-H3
        content:
          type: array
          description: >
            恰好一个文本项 + 0–12 个媒体项。媒体项类型：

            - `image_url`：角色 `first_frame` / `last_frame` /
            `reference_image`，参考图最多 9 张；只有一张图且省略 `role` 时按首帧处理

            - `video_url`：角色 `reference_video`，最多 3 段，MP4/MOV，≤ 50MB，每段 ≥ 2
            秒，累计不超过 15 秒

            - `audio_url`：角色 `reference_audio`，最多 3 段，WAV/MP3/M4A/AAC，≤ 15MB，每段
            ≥ 2 秒
          minItems: 1
          maxItems: 13
          items:
            oneOf:
              - $ref: '#/components/schemas/H3TextItem'
              - $ref: '#/components/schemas/H3ImageItem'
              - $ref: '#/components/schemas/H3VideoItem'
              - $ref: '#/components/schemas/H3AudioItem'
        resolution:
          type: string
          description: 分辨率，本通道仅支持 `768P`（必须大写，`768p` / `2K` 会被拒）
          enum:
            - 768P
          default: 768P
        duration:
          type: integer
          description: 输出时长（秒），整数 4–15。按秒计费；实际成片通常比名义值长 0.1–0.5 秒
          minimum: 4
          maximum: 15
          default: 5
        ratio:
          type: string
          description: >
            画面比例与输出尺寸：`21:9`=1536×672、`16:9`=1344×768、`4:3`=1024×768、`1:1`=768×768、`3:4`=768×1024、`9:16`=768×1344。

            `adaptive` 跟随输入图片比例，只能用于带图片 / 视频的请求；纯文本和纯音频请求必须用固定比例。
          enum:
            - '16:9'
            - '9:16'
            - '21:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - adaptive
          default: '16:9'
    H3CreateResponse:
      type: object
      properties:
        task_id:
          type: string
          description: 任务 ID，用于 `GET /hailuo/v2/query/video_generation/{task_id}` 查询
          example: task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx
    H3TextItem:
      type: object
      required:
        - type
        - text
      properties:
        type:
          type: string
          enum:
            - text
        text:
          type: string
          maxLength: 7000
          description: >-
            视频描述，1–7000 字符。引用参考素材用 `<Picture 1>` / `<Video 1>` / `<Audio
            1>`（按同类素材在 content 中的顺序编号）
          example: 黄昏海边的灯塔，镜头缓慢推进，海浪拍打礁石，电影级光影
    H3ImageItem:
      type: object
      required:
        - type
        - image_url
      properties:
        type:
          type: string
          enum:
            - image_url
        image_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: >-
                公网 HTTPS 图片地址。JPG/PNG/WebP/HEIC/HEIF，≤ 30MB，单边 256–5760 像素，宽高比
                0.4–2.5
              example: https://your-cdn.example.com/first.png
        role:
          type: string
          enum:
            - first_frame
            - last_frame
            - reference_image
          description: 首帧 / 尾帧 / 参考图。首尾帧不能与参考素材混用
    H3VideoItem:
      type: object
      required:
        - type
        - video_url
        - role
      properties:
        type:
          type: string
          enum:
            - video_url
        video_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: 公网 HTTPS 视频地址。MP4/MOV（H.264/H.265），≤ 50MB；超过 15 秒只取片头 15 秒
              example: https://your-cdn.example.com/motion.mp4
        role:
          type: string
          enum:
            - reference_video
    H3AudioItem:
      type: object
      required:
        - type
        - audio_url
        - role
      properties:
        type:
          type: string
          enum:
            - audio_url
        audio_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: 公网 HTTPS 音频地址。WAV/MP3/M4A/AAC，≤ 15MB；超过 15 秒只取片头 15 秒
              example: https://your-cdn.example.com/music.mp3
        role:
          type: string
          enum:
            - reference_audio
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.