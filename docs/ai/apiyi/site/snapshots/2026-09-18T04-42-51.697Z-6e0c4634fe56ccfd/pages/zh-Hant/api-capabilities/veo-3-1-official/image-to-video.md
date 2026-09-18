> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official 圖生影片 API 參考

> VEO 3.1 Official 圖生影片 API 參考與線上除錯 — multipart 上傳 input_reference 單張參考圖，讓靜態畫面動起來。

<Info>
  右側的互動式 Playground 支援直接線上除錯。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），上傳一張參考圖、輸入 prompt、選擇 model / seconds / resolution 後一鍵傳送即可。**預設分組 `Default` 即可呼叫，無需切換專屬分組**。
</Info>

<Tip>
  **場景說明**：本頁用於「基於參考圖生成影片」——上傳一張圖片作為影片的視覺錨點 / 起始幀，讓靜態畫面"動起來"。如果不需要參考圖，請使用 [文生影片介面](/zh-Hant/api-capabilities/veo-3-1-official/text-to-video)（同一端點，JSON 請求體）。
</Tip>

<Warning>
  **⚠️ 圖生影片專屬約束**

  * **Content-Type 必須是 `multipart/form-data`**（不是 JSON）
  * **僅支援 1 張參考圖**，欄位名固定 `input_reference`，傳多張只取第一張
  * **不接受遠端 URL**，必須是檔案上傳或 Base64
  * 接受格式：`image/jpeg` / `image/png` / `image/webp`
  * **時長欄位名是 `seconds`（不是 `duration`），且必須傳字串** `"4"` / `"6"` / `"8"`。寫成 `duration` 會被靜默忽略、回落預設 4 秒；傳數字會被拒
  * **1080p / 4k 時 `seconds` 必須 `"8"`**

  Google 官方 Veo 3.1 有多參考圖 / 首尾幀 / 影片擴充套件能力，**本站官轉通道暫未開放**。首尾幀需求請用 [VEO 3.1（官逆）](/api-capabilities/veo/overview) 的 `-fl` 系列模型。
</Warning>

## 程式碼示例

### Python（OpenAI SDK 風格 · 推薦 client.post 底層呼叫）

```python theme={null}
{/* OpenAI 官方 SDK 沒有 videos.create 方法，/v1/videos 是自定義路徑，需用底層 client.post() */}
from openai import OpenAI
import time, mimetypes

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 第 1 步：multipart 上傳（OpenAI SDK 底層 client.post 自動處理 multipart 邊界）
with open("./lighthouse.png", "rb") as f:
    resp = client.post(
        "/videos",
        body=None,
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        extra_body={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "鏡頭從燈塔基座緩慢上升至塔頂，黃昏光線，海浪聲",
            "seconds": "8",  # ⚠️ 必須字串
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9"
        },
        cast_to=dict
    )
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# 第 2 步：輪詢（最長等 3 分鐘）
deadline = time.time() + 180
while time.time() < deadline:
    status_resp = client.get(f"/videos/{task_id}", cast_to=dict)
    print(f"Status: {status_resp['status']}, progress: {status_resp.get('progress', 0)}%")
    if status_resp["status"] == "completed":
        break
    if status_resp["status"] == "failed":
        raise RuntimeError(f"Generation failed: {status_resp}")
    time.sleep(8)

# 第 3 步：下載（帶重試兜底）
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

# 第 1 步：multipart 上傳參考圖 + 表單欄位
with open("./lighthouse.png", "rb") as f:
    resp = requests.post(
        f"{BASE_URL}/videos",
        headers=HEADERS,  # 不要手動加 Content-Type，requests 會自動處理 multipart 邊界
        data={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "鏡頭從燈塔基座緩慢上升至塔頂，黃昏光線，海浪輕拍礁石的聲音",
            "seconds": "8",  # ⚠️ 字串，不是數字
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9",
            "seed": "20260521"
        },
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        timeout=60  # multipart 上傳大圖可能慢，超時建議 60 秒
    ).json()
task_id = resp["task_id"]
print(f"Task ID: {task_id}")

# 第 2 步：輪詢
deadline = time.time() + 180
while time.time() < deadline:
    s = requests.get(f"{BASE_URL}/videos/{task_id}", headers=HEADERS).json()
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(s)
    time.sleep(8)

# 第 3 步：下載（帶 3 次重試）
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

### cURL（multipart 上傳）

```bash theme={null}
{/* 只想用已有 task_id 查詢/下載？見下方「已有 task_id？兩條 cURL 直接查狀態 / 下載」章節 */}
{/* 第 1 步：multipart 上傳（注意 -F 欄位順序，input_reference 用 @ 引用本地檔案）*/}
RESP=$(curl -sS -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=veo-3.1-fast-generate-preview" \
  -F "prompt=鏡頭從燈塔基座緩慢上升至塔頂，黃昏光線" \
  -F "seconds=8" \
  -F "size=1280x720" \
  -F "resolution=720p" \
  -F "aspectRatio=16:9" \
  -F "input_reference=@./lighthouse.png;type=image/png")
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["task_id"])')
echo "task_id=$TASK_ID"

{/* 第 2 步：輪詢狀態 */}
while :; do
  S=$(curl -sS -H "Authorization: Bearer sk-your-api-key" "https://api.apiyi.com/v1/videos/$TASK_ID")
  ST=$(echo "$S" | python3 -c 'import sys,json;print(json.load(sys.stdin)["status"])')
  echo "status=$ST"
  [ "$ST" = "completed" ] && break
  [ "$ST" = "failed" ] && { echo "$S"; exit 1; }
  sleep 8
done

{/* 第 3 步：下載（--retry 兜底 status=completed 後的偶發 400）*/}
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

// 第 1 步：multipart 上傳
const buffer = fs.readFileSync('./lighthouse.png');
const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', '鏡頭從燈塔基座緩慢上升至塔頂，黃昏光線');
form.append('seconds', '8');  // ⚠️ 字串
form.append('size', '1280x720');
form.append('resolution', '720p');
form.append('aspectRatio', '16:9');
form.append('input_reference', new File([buffer], 'lighthouse.png', { type: 'image/png' }));

const submitResp = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` },  // 不要手動加 Content-Type
    body: form
});
const { task_id } = await submitResp.json();
console.log(`Task ID: ${task_id}`);

// 第 2 步：輪詢
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

// 第 3 步：下載（帶重試）
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

### 瀏覽器 JavaScript（FileInput 上傳）

```javascript theme={null}
{/* 僅作演示，生產請走後端代理避免 Key 洩露；影片檔案較大也不適合直接在瀏覽器下載 */}
const fileInput = document.querySelector('input[type=file]');
const file = fileInput.files[0];

const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', '讓這張靜態畫面動起來，緩慢推鏡，自然環境音');
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

{/* 輪詢完成後，把 /content 端點交給後端代理下載，再回流給前端展示 */}
```

## 已有 task\_id？兩條 cURL 直接查狀態 / 下載

如果你已經拿到 `task_id`（提交任務時返回，或在控制台日誌中檢視），只需替換下面命令裡的兩處即可直接使用：

* `sk-your-api-key` → 你的 API易 Key
* `task_xxxxxxxxxxxxxxxx` → 你的任務 ID

### 1. 查詢任務狀態

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

返回 JSON 中 `status` 為 `completed` 即可進行下載；`in_progress` 則稍等幾秒再查一次。

### 2. 下載影片（儲存為 output.mp4）

```bash theme={null}
curl -L --retry 3 --retry-delay 4 \
  "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx/content" \
  -H "Authorization: Bearer sk-your-api-key" \
  -o output.mp4
```

<Tip>
  `/content` 端點必須帶 `Authorization` 請求頭——直接在瀏覽器位址列開啟會返回 401。`--retry 3` 用於兜底 `status` 剛翻 `completed` 後偶發的 400（CDN 同步延遲）。
</Tip>

## 引數說明速查

| 引數                | 型別         | 必填 | 預設         | 說明                                                                                                       |
| ----------------- | ---------- | -- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `input_reference` | file       | 是  | —          | 參考圖檔案，欄位名固定，**僅 1 張**，接受 `image/jpeg` / `image/png` / `image/webp`，**不接受遠端 URL**                         |
| `model`           | string     | 是  | —          | `veo-3.1-fast-generate-preview`（\$0.3/次）或 `veo-3.1-generate-preview`（\$1.2/次）                            |
| `prompt`          | string     | 是  | —          | 描述影片動作 / 鏡頭 / 風格的提示詞。**不要傳 `generateAudio`**，音訊意圖寫進 prompt                                               |
| `seconds`         | **string** | 否  | `"8"`      | `"4"` / `"6"` / `"8"`。**欄位名是 `seconds` 不是 `duration`**（寫 `duration` 會被靜默忽略、回落 4 秒）。**1080p/4k 必須 `"8"`** |
| `size`            | string     | 否  | `1280x720` | 輸出畫素                                                                                                     |
| `resolution`      | string     | 否  | `720p`     | `720p` / `1080p` / `4k`                                                                                  |
| `aspectRatio`     | string     | 否  | `16:9`     | `16:9`（橫）/ `9:16`（豎）                                                                                     |
| `seed`            | int        | 否  | —          | 隨機數種子（multipart 表單欄位，傳字串數字也可）                                                                            |

<Tip>
  **multipart 與 JSON 模式的欄位命名差異**：

  * JSON 模式下巢狀在 `metadata.*` 下（如 `metadata.resolution`）
  * **multipart 模式**下平鋪為表單欄位（直接 `resolution` / `aspectRatio` / `seed`）
  * 上面的程式碼示例已經按 multipart 約定寫法
</Tip>

<Warning>
  **常見錯誤**：

  * 把 `input_reference` 當作 Base64 字串塞進 JSON body —— 必須走 multipart 檔案欄位
  * 欄位名寫成 `image` / `reference` / `input_image` —— 必須正好 `input_reference`
  * 同時傳 2 張圖 —— 服務端只取第一張，第二張被靜默丟棄
  * 傳遠端 URL（如 `https://cdn.../img.png`）—— 不接受，必須檔案或 Base64
</Warning>

## 響應格式

響應結構與 [文生影片](/zh-Hant/api-capabilities/veo-3-1-official/text-to-video#響應格式) 完全一致：第 1 步返回 `task_id` + `status: "queued"`，第 2 步輪詢返回 `status` + 粗粒度 `progress`，第 3 步從 `/content` 端點下載 MP4 二進位制。

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
  **⚠️ 響應欄位陷阱**

  * `task_id` 與 `id` 同值，下游建議統一用 `task_id`
  * **沒有直接的 `video_url` 欄位**，影片從 `GET /v1/videos/{task_id}/content` 下載
  * `progress` 只在 0 / 50 / 100 三檔跳，不是線性進度
  * `/content` 端點在 `status` 剛翻 `completed` 後偶發 400，等 4 秒重試即可
  * **圖生影片任務通常比同參數文生影片慢 10-30%**（多了一次影像編碼）
</Warning>

<Info>
  本端點是非同步任務式入口，**計費在任務進入 `completed` 時按模型名按次結算**（與是否傳 `input_reference` 無關，fast \$0.3 / standard \$1.2）。POST 提交、輪詢查詢、影片下載本身**不計費**，失敗任務也**不計費**。
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