> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official 图生视频 API 参考

> VEO 3.1 Official 图生视频 API 参考与在线调试 — multipart 上传 input_reference 单张参考图，让静态画面动起来。

<Info>
  右侧的交互式 Playground 支持直接在线调试。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），上传一张参考图、输入 prompt、选择 model / seconds / resolution 后一键发送即可。**默认分组 `Default` 即可调用，无需切换专属分组**。
</Info>

<Tip>
  **场景说明**：本页用于「基于参考图生成视频」——上传一张图片作为视频的视觉锚点 / 起始帧，让静态画面"动起来"。如果不需要参考图，请使用 [文生视频接口](/api-capabilities/veo-3-1-official/text-to-video)（同一端点，JSON 请求体）。
</Tip>

<Warning>
  **⚠️ 图生视频专属约束**

  * **Content-Type 必须是 `multipart/form-data`**（不是 JSON）
  * **仅支持 1 张参考图**，字段名固定 `input_reference`，传多张只取第一张
  * **不接受远程 URL**，必须是文件上传或 Base64
  * 接受格式：`image/jpeg` / `image/png` / `image/webp`
  * **时长字段名是 `seconds`（不是 `duration`），且必须传字符串** `"4"` / `"6"` / `"8"`。写成 `duration` 会被静默忽略、回落默认 4 秒；传数字会被拒
  * **1080p / 4k 时 `seconds` 必须 `"8"`**

  Google 官方 Veo 3.1 有多参考图 / 首尾帧 / 视频扩展能力，**本站官转通道暂未开放**。首尾帧需求请用 [VEO 3.1（官逆）](/api-capabilities/veo/overview) 的 `-fl` 系列模型。
</Warning>

## 代码示例

### Python（OpenAI SDK 风格 · 推荐 client.post 底层调用）

```python theme={null}
{/* OpenAI 官方 SDK 没有 videos.create 方法，/v1/videos 是自定义路径，需用底层 client.post() */}
from openai import OpenAI
import time, mimetypes

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 第 1 步：multipart 上传（OpenAI SDK 底层 client.post 自动处理 multipart 边界）
with open("./lighthouse.png", "rb") as f:
    resp = client.post(
        "/videos",
        body=None,
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        extra_body={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "镜头从灯塔基座缓慢上升至塔顶，黄昏光线，海浪声",
            "seconds": "8",  # ⚠️ 必须字符串
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9"
        },
        cast_to=dict
    )
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# 第 2 步：轮询（最长等 3 分钟）
deadline = time.time() + 180
while time.time() < deadline:
    status_resp = client.get(f"/videos/{task_id}", cast_to=dict)
    print(f"Status: {status_resp['status']}, progress: {status_resp.get('progress', 0)}%")
    if status_resp["status"] == "completed":
        break
    if status_resp["status"] == "failed":
        raise RuntimeError(f"Generation failed: {status_resp}")
    time.sleep(8)

# 第 3 步：下载（带重试兜底）
import urllib.request, urllib.error
time.sleep(4)
for i in range(5):
    try:
        req = urllib.request.Request(
            f"https://api.apiyi.com/v1/videos/{task_id}/content",
            headers={"Authorization": "Bearer sk-your-api-key"}
        )
        with urllib.request.urlopen(req, timeout=180) as r, open("output.mp4", "wb") as f:
            while chunk := r.read(1 << 16):
                f.write(chunk)
        break
    except urllib.error.HTTPError as e:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### Python（原生 requests + multipart）

```python theme={null}
import requests
import time

API_KEY = "sk-your-api-key"
BASE_URL = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# 第 1 步：multipart 上传参考图 + 表单字段
with open("./lighthouse.png", "rb") as f:
    resp = requests.post(
        f"{BASE_URL}/videos",
        headers=HEADERS,  # 不要手动加 Content-Type，requests 会自动处理 multipart 边界
        data={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "镜头从灯塔基座缓慢上升至塔顶，黄昏光线，海浪轻拍礁石的声音",
            "seconds": "8",  # ⚠️ 字符串，不是数字
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9",
            "seed": "20260521"
        },
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        timeout=60  # multipart 上传大图可能慢，超时建议 60 秒
    ).json()
task_id = resp["task_id"]
print(f"Task ID: {task_id}")

# 第 2 步：轮询
deadline = time.time() + 180
while time.time() < deadline:
    s = requests.get(f"{BASE_URL}/videos/{task_id}", headers=HEADERS).json()
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(s)
    time.sleep(8)

# 第 3 步：下载（带 3 次重试）
time.sleep(4)
for i in range(5):
    try:
        with requests.get(
            f"{BASE_URL}/videos/{task_id}/content",
            headers=HEADERS, stream=True, timeout=180
        ) as r:
            r.raise_for_status()
            with open("output.mp4", "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        break
    except requests.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### cURL（multipart 上传）

```bash theme={null}
{/* 只想用已有 task_id 查询/下载？见下方「已有 task_id？两条 cURL 直接查状态 / 下载」章节 */}
{/* 第 1 步：multipart 上传（注意 -F 字段顺序，input_reference 用 @ 引用本地文件）*/}
RESP=$(curl -sS -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=veo-3.1-fast-generate-preview" \
  -F "prompt=镜头从灯塔基座缓慢上升至塔顶，黄昏光线" \
  -F "seconds=8" \
  -F "size=1280x720" \
  -F "resolution=720p" \
  -F "aspectRatio=16:9" \
  -F "input_reference=@./lighthouse.png;type=image/png")
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["task_id"])')
echo "task_id=$TASK_ID"

{/* 第 2 步：轮询状态 */}
while :; do
  S=$(curl -sS -H "Authorization: Bearer sk-your-api-key" "https://api.apiyi.com/v1/videos/$TASK_ID")
  ST=$(echo "$S" | python3 -c 'import sys,json;print(json.load(sys.stdin)["status"])')
  echo "status=$ST"
  [ "$ST" = "completed" ] && break
  [ "$ST" = "failed" ] && { echo "$S"; exit 1; }
  sleep 8
done

{/* 第 3 步：下载（--retry 兜底 status=completed 后的偶发 400）*/}
sleep 4
curl -sSL --retry 3 --retry-delay 4 \
  -H "Authorization: Bearer sk-your-api-key" \
  "https://api.apiyi.com/v1/videos/$TASK_ID/content" \
  -o output.mp4
ls -lh output.mp4
```

### Node.js（原生 fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';
import { FormData, File } from 'undici';

const API_KEY = 'sk-your-api-key';
const BASE_URL = 'https://api.apiyi.com/v1';

// 第 1 步：multipart 上传
const buffer = fs.readFileSync('./lighthouse.png');
const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', '镜头从灯塔基座缓慢上升至塔顶，黄昏光线');
form.append('seconds', '8');  // ⚠️ 字符串
form.append('size', '1280x720');
form.append('resolution', '720p');
form.append('aspectRatio', '16:9');
form.append('input_reference', new File([buffer], 'lighthouse.png', { type: 'image/png' }));

const submitResp = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` },  // 不要手动加 Content-Type
    body: form
});
const { task_id } = await submitResp.json();
console.log(`Task ID: ${task_id}`);

// 第 2 步：轮询
let status = 'queued';
while (status !== 'completed' && status !== 'failed') {
    await new Promise(r => setTimeout(r, 8000));
    const s = await (await fetch(`${BASE_URL}/videos/${task_id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    })).json();
    status = s.status;
    console.log(`Status: ${status}, progress: ${s.progress ?? 0}%`);
}

if (status === 'failed') throw new Error('Generation failed');

// 第 3 步：下载（带重试）
await new Promise(r => setTimeout(r, 4000));
let videoBuffer;
for (let i = 0; i < 4; i++) {
    try {
        const resp = await fetch(`${BASE_URL}/videos/${task_id}/content`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        videoBuffer = Buffer.from(await resp.arrayBuffer());
        break;
    } catch (e) {
        if (i === 3) throw e;
        await new Promise(r => setTimeout(r, 4000));
    }
}
fs.writeFileSync('output.mp4', videoBuffer);
console.log('Saved: output.mp4');
```

### 浏览器 JavaScript（FileInput 上传）

```javascript theme={null}
{/* 仅作演示，生产请走后端代理避免 Key 泄露；视频文件较大也不适合直接在浏览器下载 */}
const fileInput = document.querySelector('input[type=file]');
const file = fileInput.files[0];

const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', '让这张静态画面动起来，缓慢推镜，自然环境音');
form.append('seconds', '4');
form.append('size', '720x1280');
form.append('resolution', '720p');
form.append('aspectRatio', '9:16');
form.append('input_reference', file);

const submitResp = await fetch('https://api.apiyi.com/v1/videos', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { task_id } = await submitResp.json();
console.log('Task ID:', task_id);

{/* 轮询完成后，把 /content 端点交给后端代理下载，再回流给前端展示 */}
```

## 已有 task\_id？两条 cURL 直接查状态 / 下载

如果你已经拿到 `task_id`（提交任务时返回，或在控制台日志中查看），只需替换下面命令里的两处即可直接使用：

* `sk-your-api-key` → 你的 API易 Key
* `task_xxxxxxxxxxxxxxxx` → 你的任务 ID

### 1. 查询任务状态

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

返回 JSON 中 `status` 为 `completed` 即可进行下载；`in_progress` 则稍等几秒再查一次。

### 2. 下载视频（保存为 output.mp4）

```bash theme={null}
curl -L --retry 3 --retry-delay 4 \
  "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx/content" \
  -H "Authorization: Bearer sk-your-api-key" \
  -o output.mp4
```

<Tip>
  `/content` 端点必须带 `Authorization` 请求头——直接在浏览器地址栏打开会返回 401。`--retry 3` 用于兜底 `status` 刚翻 `completed` 后偶发的 400（CDN 同步延迟）。
</Tip>

## 参数说明速查

| 参数                | 类型         | 必填 | 默认         | 说明                                                                                                       |
| ----------------- | ---------- | -- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `input_reference` | file       | 是  | —          | 参考图文件，字段名固定，**仅 1 张**，接受 `image/jpeg` / `image/png` / `image/webp`，**不接受远程 URL**                         |
| `model`           | string     | 是  | —          | `veo-3.1-fast-generate-preview`（\$0.3/次）或 `veo-3.1-generate-preview`（\$1.2/次）                            |
| `prompt`          | string     | 是  | —          | 描述视频动作 / 镜头 / 风格的提示词。**不要传 `generateAudio`**，音频意图写进 prompt                                               |
| `seconds`         | **string** | 否  | `"8"`      | `"4"` / `"6"` / `"8"`。**字段名是 `seconds` 不是 `duration`**（写 `duration` 会被静默忽略、回落 4 秒）。**1080p/4k 必须 `"8"`** |
| `size`            | string     | 否  | `1280x720` | 输出像素                                                                                                     |
| `resolution`      | string     | 否  | `720p`     | `720p` / `1080p` / `4k`                                                                                  |
| `aspectRatio`     | string     | 否  | `16:9`     | `16:9`（横）/ `9:16`（竖）                                                                                     |
| `seed`            | int        | 否  | —          | 随机数种子（multipart 表单字段，传字符串数字也可）                                                                           |

<Tip>
  **multipart 与 JSON 模式的字段命名差异**：

  * JSON 模式下嵌套在 `metadata.*` 下（如 `metadata.resolution`）
  * **multipart 模式**下平铺为表单字段（直接 `resolution` / `aspectRatio` / `seed`）
  * 上面的代码示例已经按 multipart 约定写法
</Tip>

<Warning>
  **常见错误**：

  * 把 `input_reference` 当作 Base64 字符串塞进 JSON body —— 必须走 multipart 文件字段
  * 字段名写成 `image` / `reference` / `input_image` —— 必须正好 `input_reference`
  * 同时传 2 张图 —— 服务端只取第一张，第二张被静默丢弃
  * 传远程 URL（如 `https://cdn.../img.png`）—— 不接受，必须文件或 Base64
</Warning>

## 响应格式

响应结构与 [文生视频](/api-capabilities/veo-3-1-official/text-to-video#响应格式) 完全一致：第 1 步返回 `task_id` + `status: "queued"`，第 2 步轮询返回 `status` + 粗粒度 `progress`，第 3 步从 `/content` 端点下载 MP4 二进制。

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "queued",
  "progress": 0,
  "created_at": 1775025000
}
```

<Warning>
  **⚠️ 响应字段陷阱**

  * `task_id` 与 `id` 同值，下游建议统一用 `task_id`
  * **没有直接的 `video_url` 字段**，视频从 `GET /v1/videos/{task_id}/content` 下载
  * `progress` 只在 0 / 50 / 100 三档跳，不是线性进度
  * `/content` 端点在 `status` 刚翻 `completed` 后偶发 400，等 4 秒重试即可
  * **图生视频任务通常比同参数文生视频慢 10-30%**（多了一次图像编码）
</Warning>

<Info>
  本端点是异步任务式入口，**计费在任务进入 `completed` 时按模型名按次结算**（与是否传 `input_reference` 无关，fast \$0.3 / standard \$1.2）。POST 提交、轮询查询、视频下载本身**不计费**，失败任务也**不计费**。
</Info>


## OpenAPI

````yaml api-reference/veo-3-1-official-image-to-video-openapi.yaml POST /v1/videos
openapi: 3.1.0
info:
  title: VEO 3.1 Official 图生视频 API
  description: >
    Google Veo 3.1 系列图生视频接口（官转通道，multipart/form-data 上传 `input_reference` 参考图）。


    - **仅支持 1 张参考图**，字段名固定 `input_reference`，传多张只取第一张

    - 接受图片格式：`image/jpeg` / `image/png` / `image/webp`

    - **不接受远程 URL**，必须文件或 Base64

    - 时长字段名是 `seconds`（不是 `duration`），必须传字符串 `"4"` / `"6"` / `"8"`，1080p/4k 必须
    `"8"`

    - 单价与文生视频相同（按模型名按次计费），并不会因为多上传一张图额外收费

    - **异步任务式端点**：本端点只提交任务，需配合 `GET /v1/videos/{task_id}` 轮询和 `GET
    /v1/videos/{task_id}/content` 下载

    - **multipart 模式字段平铺**：JSON 模式下嵌套在 `metadata.*` 下的字段（如
    `metadata.resolution`），multipart
    模式直接作为表单字段（`resolution`、`aspectRatio`、`seed`）

    - Google 官方有多参考图 / 首尾帧 / 视频扩展能力，**本官转通道暂未开放**——需要首尾帧请用 [VEO
    3.1（官逆）](/api-capabilities/veo/overview) 的 `-fl` 系列


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **API Key 配置**：**默认分组 `Default` 即可调用，无需切换专属分组**；令牌计费模式需为 **按次计费** 或
    **按量优先**（按量计费暂不支持）


    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /v1/videos:
    post:
      tags:
        - 视频生成
      summary: 图生视频：基于参考图生成视频任务
      description: >
        提交一个 Veo 3.1 图生视频任务。客户端需走 multipart/form-data 上传 1 个参考图文件 + 文本字段。


        - 必填：`model`、`prompt`、`input_reference`

        - 可选：`seconds`（默认 `"8"`，时长字段，不是 `duration`）、`size` / `resolution` /
        `aspectRatio` / `seed`

        - 响应字段、轮询 / 下载流程与文生视频完全一致

        - 典型生成耗时通常比同参数文生视频慢 10–30%（多了一次图像编码）
      operationId: generateVeo31OfficialImageToVideo
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/Veo31ImageToVideoRequest'
            example:
              model: veo-3.1-fast-generate-preview
              prompt: 镜头从灯塔基座缓慢上升至塔顶，黄昏光线，海浪轻拍礁石的声音
              seconds: '8'
              size: 1280x720
              resolution: 720p
              aspectRatio: '16:9'
      responses:
        '200':
          description: 任务已提交，返回 task_id 与 queued 状态
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Veo31VideoTask'
        '400':
          description: 参数非法（seconds 传成数字、字段名误写成 duration、1080p/4k 配了非 8 秒、图片格式不支持等）
        '401':
          description: 未授权 - API Key 无效
        '413':
          description: 上传图片过大
        '429':
          description: 请求频率超限或余额不足
        '500':
          description: 上游网关错误，建议重试 1–2 次（失败任务不计费）
      security:
        - bearerAuth: []
components:
  schemas:
    Veo31ImageToVideoRequest:
      type: object
      required:
        - model
        - prompt
        - input_reference
      properties:
        model:
          type: string
          description: |
            模型 ID（按次计费）：
            - `veo-3.1-fast-generate-preview` —— \$0.3/次
            - `veo-3.1-generate-preview` —— \$1.2/次
          enum:
            - veo-3.1-fast-generate-preview
            - veo-3.1-generate-preview
          default: veo-3.1-fast-generate-preview
        prompt:
          type: string
          description: >
            视频生成提示词。**重点描述如何让画面动起来**：镜头运动、物体动作、光线变化、音频氛围。**不要传
            `generateAudio`**，音频写进 prompt。
          example: 镜头从灯塔基座缓慢上升至塔顶，黄昏光线，海浪轻拍礁石的声音
        input_reference:
          type: string
          format: binary
          description: >
            参考图文件。**字段名固定 `input_reference`，仅支持 1 张**。


            接受格式：`image/jpeg` / `image/png` / `image/webp`。**不接受远程 URL**，需要文件上传或
            Base64。
        seconds:
          type: string
          description: >
            视频时长，**字段名是 `seconds`（不是 `duration`）**，**字符串枚举**：`"4"` / `"6"` /
            `"8"`。写成 `duration` 会被静默忽略、回落默认 4 秒。**1080p / 4k 时必须 `"8"`**。
          enum:
            - '4'
            - '6'
            - '8'
          default: '8'
        size:
          type: string
          description: 输出像素，优先级低于 `resolution`
          enum:
            - 1280x720
            - 720x1280
            - 1920x1080
            - 1080x1920
            - 3840x2160
            - 2160x3840
          default: 1280x720
        resolution:
          type: string
          description: 分辨率档位（multipart 模式下平铺为表单字段，优先级高于 `size`）
          enum:
            - 720p
            - 1080p
            - 4k
          default: 720p
        aspectRatio:
          type: string
          description: 画面比例：`16:9` 横屏（默认）或 `9:16` 竖屏
          enum:
            - '16:9'
            - '9:16'
          default: '16:9'
        seed:
          type: string
          description: 随机数种子（multipart 表单字段，传字符串数字即可）。固定 seed 可让多次输出风格聚集，但不能字节级复现。
          example: '20260521'
        negativePrompt:
          type: string
          description: 反向提示词，推荐传 `"blurry, watermark, distorted, low quality"`
          example: blurry, watermark, distorted, low quality
    Veo31VideoTask:
      type: object
      properties:
        id:
          type: string
          description: 任务 ID（与 `task_id` 同值，下游建议统一用 `task_id`）
          example: task_xxxxxxxxxxxxxxxx
        task_id:
          type: string
          description: 任务 ID，用于后续轮询和下载
          example: task_xxxxxxxxxxxxxxxx
        object:
          type: string
          description: 对象类型，固定 `video`
          example: video
        model:
          type: string
          description: 本次任务使用的模型 ID
          example: veo-3.1-fast-generate-preview
        status:
          type: string
          description: |
            任务状态：
            - `queued` —— 已提交，排队等待
            - `in_progress` —— 正在生成
            - `completed` —— 完成，可下载（`/v1/videos/{task_id}/content`）
            - `failed` —— 失败（**不计费**），可重试
          enum:
            - queued
            - in_progress
            - completed
            - failed
          example: queued
        progress:
          type: integer
          description: 生成进度（粗粒度，**只在 0 / 50 / 100 三档跳**）
          example: 0
        created_at:
          type: integer
          description: 任务创建 Unix 时间戳（秒）
          example: 1775025000
        completed_at:
          type: integer
          description: 任务完成 Unix 时间戳（秒），仅 completed 状态返回
          example: 1775025090
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key（默认分组 + 任意计费模式都能调通）

````