> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official 文生影片 API 參考

> VEO 3.1 Official 文生影片 API 參考與線上除錯 — JSON 請求體、非同步任務三步流程、4/6/8 秒靈活時長、按次計費。

<Info>
  右側的互動式 Playground 支援直接線上除錯。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），輸入 prompt、選擇 model / seconds / metadata.resolution 後一鍵傳送即可。**預設分組 `Default` 即可呼叫，無需切換專屬分組**。
</Info>

<Tip>
  **場景說明**：本頁用於「純文本提示詞生成影片」——不傳 `input_reference`、走 `application/json` 請求體。如需基於一張參考圖生成影片（圖生影片），請使用 [圖生影片介面](/zh-Hant/api-capabilities/veo-3-1-official/image-to-video)（同一端點 + `input_reference` 檔案上傳）。
</Tip>

<Warning>
  **⚠️ 三處最容易踩的坑**

  1. **時長欄位名是 `seconds`（不是 `duration`），且必須傳字串** `"4"` / `"6"` / `"8"`。寫成 `duration` 會被靜默忽略 → 時長回落預設 4 秒（"傳了 8s 只出 4s" 就是這麼來的）；傳數字會被服務端拒，報 `parse_request_failed: cannot unmarshal number into Go struct field ... duration of type string`
  2. **不要傳 `generateAudio` 引數**，上游會回 `INVALID_ARGUMENT`。音訊效果（環境音、對白、BGM）直接寫進 prompt
  3. **1080p / 4k 解析度時 `seconds` 必須 `"8"`**，傳 `"4"` / `"6"` 會被上游拒
</Warning>

<Warning>
  **三步非同步流程，本頁只覆蓋第一步（提交）**

  * **第 1 步（本頁）**：`POST /v1/videos` → 返回 `task_id` + `status: "queued"`
  * **第 2 步**：`GET /v1/videos/{task_id}` 輪詢，直到 `status: "completed"`
  * **第 3 步**：`GET /v1/videos/{task_id}/content` 下載 MP4 檔案

  POST 提交本身耗時秒級，**不會**等到影片生成完成。完整流程見下方 Python 程式碼示例。
</Warning>

## 程式碼示例

### Python（OpenAI SDK 風格 · 推薦 client.post 底層呼叫）

```python theme={null}
{/* OpenAI 官方 SDK 沒有 videos.create 方法，/v1/videos 是自定義路徑，需用底層 client.post() */}
from openai import OpenAI
import time

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 第 1 步：提交生成任務
resp = client.post(
    "/videos",
    body={
        "model": "veo-3.1-fast-generate-preview",
        "prompt": "黃昏海邊的燈塔，鏡頭緩慢推進，海浪輕拍礁石，海鳥叫聲，電影級光影，穩定運鏡",
        "seconds": "8",  # 必須字串
        "size": "1280x720",
        "metadata": {
            "resolution": "720p",
            "aspectRatio": "16:9",
            "seed": 20260521,
            "negativePrompt": "blurry, watermark, distorted, low quality"
        }
    },
    cast_to=dict
)
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# 第 2 步：輪詢狀態（最長等 3 分鐘）
deadline = time.time() + 180
while time.time() < deadline:
    status_resp = client.get(f"/videos/{task_id}", cast_to=dict)
    print(f"Status: {status_resp['status']}, progress: {status_resp.get('progress', 0)}%")
    if status_resp["status"] == "completed":
        break
    if status_resp["status"] == "failed":
        raise RuntimeError(f"Generation failed: {status_resp}")
    time.sleep(8)

# 第 3 步：下載影片（status 剛翻 completed 偶發 400，等幾秒重試）
import urllib.request, urllib.error
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

### Python（原生 requests）

```python theme={null}
import requests
import time

API_KEY = "sk-your-api-key"
BASE_URL = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# 第 1 步：提交（JSON 請求體）
resp = requests.post(
    f"{BASE_URL}/videos",
    headers={**HEADERS, "Content-Type": "application/json"},
    json={
        "model": "veo-3.1-fast-generate-preview",
        "prompt": "傍晚海邊的燈塔，鏡頭緩慢推進，穩定運鏡，海浪聲、遠處海鳥叫聲",
        "seconds": "8",  # ⚠️ 必須字串
        "size": "1280x720",
        "metadata": {
            "resolution": "720p",
            "aspectRatio": "16:9"
        }
    },
    timeout=30  # POST 提交本身只是入隊，30 秒足夠
).json()
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# 第 2 步：輪詢（最長等 3 分鐘，4K 用 10 分鐘）
deadline = time.time() + 180
while time.time() < deadline:
    status_resp = requests.get(f"{BASE_URL}/videos/{task_id}", headers=HEADERS).json()
    print(f"Status: {status_resp['status']}, progress: {status_resp.get('progress', 0)}%")
    if status_resp["status"] == "completed":
        break
    if status_resp["status"] == "failed":
        raise RuntimeError(f"Generation failed: {status_resp}")
    time.sleep(8)

# 第 3 步：下載（帶 3 次重試兜底 status=completed 後的 CDN 同步延遲）
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

### cURL

```bash theme={null}
{/* 只想用已有 task_id 查詢/下載？見下方「已有 task_id？兩條 cURL 直接查狀態 / 下載」章節 */}
{/* 第 1 步：提交任務（注意時長欄位是 seconds，字串 "8"，不是數字 8，也不是 duration）*/}
RESP=$(curl -sS -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "veo-3.1-fast-generate-preview",
    "prompt": "黃昏海邊的燈塔，鏡頭緩慢推進，海浪聲，電影級光影",
    "seconds": "8",
    "size": "1280x720",
    "metadata": {"resolution": "720p", "aspectRatio": "16:9"}
  }')
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["task_id"])')
echo "task_id=$TASK_ID"

{/* 第 2 步：輪詢狀態（每 8 秒）*/}
while :; do
  S=$(curl -sS -H "Authorization: Bearer sk-your-api-key" "https://api.apiyi.com/v1/videos/$TASK_ID")
  ST=$(echo "$S" | python3 -c 'import sys,json;print(json.load(sys.stdin)["status"])')
  echo "status=$ST"
  [ "$ST" = "completed" ] && break
  [ "$ST" = "failed" ] && { echo "$S"; exit 1; }
  sleep 8
done

{/* 第 3 步：下載影片檔案（--retry 兜底 status 剛翻 completed 後的偶發 400）*/}
sleep 4
curl -sSL --retry 3 --retry-delay 4 \
  -H "Authorization: Bearer sk-your-api-key" \
  "https://api.apiyi.com/v1/videos/$TASK_ID/content" \
  -o output.mp4
ls -lh output.mp4
```

### Node.js（原生 fetch）

```javascript theme={null}
import fs from 'node:fs';

const API_KEY = 'sk-your-api-key';
const BASE_URL = 'https://api.apiyi.com/v1';

// 第 1 步：提交
const submitResp = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
        model: 'veo-3.1-fast-generate-preview',
        prompt: '一隻柯基犬在金色沙灘上奔跑，慢動作，黃昏時分，電影質感',
        seconds: '8',  // ⚠️ 必須字串
        size: '1280x720',
        metadata: {
            resolution: '720p',
            aspectRatio: '16:9'
        }
    })
});
const { task_id } = await submitResp.json();
console.log(`Task ID: ${task_id}`);

// 第 2 步：輪詢
let status = 'queued';
while (status !== 'completed' && status !== 'failed') {
    await new Promise(r => setTimeout(r, 8000));
    const statusResp = await fetch(`${BASE_URL}/videos/${task_id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const data = await statusResp.json();
    status = data.status;
    console.log(`Status: ${status}, progress: ${data.progress ?? 0}%`);
}

if (status === 'failed') throw new Error('Generation failed');

// 第 3 步：下載（最多重試 3 次，每次間隔 4 秒）
await new Promise(r => setTimeout(r, 4000));
let buffer;
for (let i = 0; i < 4; i++) {
    try {
        const contentResp = await fetch(`${BASE_URL}/videos/${task_id}/content`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!contentResp.ok) throw new Error(`HTTP ${contentResp.status}`);
        buffer = Buffer.from(await contentResp.arrayBuffer());
        break;
    } catch (e) {
        if (i === 3) throw e;
        await new Promise(r => setTimeout(r, 4000));
    }
}
fs.writeFileSync('output.mp4', buffer);
console.log('Saved: output.mp4');
```

### 瀏覽器 JavaScript

```javascript theme={null}
{/* 僅作演示，生產請走後端代理避免 Key 洩露；影片檔案較大也不適合直接在瀏覽器下載 */}
const submitResp = await fetch('https://api.apiyi.com/v1/videos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'veo-3.1-fast-generate-preview',
        prompt: '水彩風格的極光在雪山上空緩緩流動，柔和鏡頭',
        seconds: '4',
        size: '720x1280',
        metadata: { resolution: '720p', aspectRatio: '9:16' }
    })
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

| 引數                        | 型別         | 必填 | 預設         | 說明                                                                                                                     |
| ------------------------- | ---------- | -- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `model`                   | string     | 是  | —          | `veo-3.1-fast-generate-preview`（\$0.3/次）或 `veo-3.1-generate-preview`（\$1.2/次）                                          |
| `prompt`                  | string     | 是  | —          | 影片描述提示詞，建議詳細描述場景、鏡頭運動、風格、光線、**音訊意圖**（不要傳 `generateAudio`）                                                              |
| `seconds`                 | **string** | 否  | `"8"`      | 影片時長，**字串列舉**：`"4"` / `"6"` / `"8"`。**欄位名是 `seconds` 不是 `duration`**（寫 `duration` 會被靜默忽略、回落 4 秒）。**1080p/4k 必須 `"8"`** |
| `size`                    | string     | 否  | `1280x720` | 輸出畫素，如 `1280x720` / `1920x1080` / `3840x2160`，優先順序低於 `metadata.resolution`                                             |
| `metadata.resolution`     | string     | 否  | `720p`     | `720p` / `1080p` / `4k`，優先順序高於 `size`                                                                                  |
| `metadata.aspectRatio`    | string     | 否  | `16:9`     | `16:9`（橫屏）或 `9:16`（豎屏）                                                                                                 |
| `metadata.seed`           | int        | 否  | —          | 隨機數種子，固定 seed 可讓多次輸出風格聚集（但**不能位元組級復現**）                                                                                |
| `metadata.negativePrompt` | string     | 否  | —          | 反向提示詞，推薦傳 `"blurry, watermark, distorted, low quality"`                                                                |

<Warning>
  **不要傳 `generateAudio` 欄位**！Veo 3.1 原生帶音軌，傳該引數會被上游回 `INVALID_ARGUMENT`。要控制音訊，**把意圖寫進 prompt**：`"海浪聲、遠處海鳥叫聲、低沉的風聲"`。
</Warning>

<Tip>
  引數識別優先順序：

  * 秒數：`metadata.durationSeconds > seconds > 8`（請求欄位寫 `seconds`，寫 `duration` 不識別）
  * 解析度：`metadata.resolution > size > 720p`
  * 比例：顯式 `metadata.aspectRatio` > 由 size 推導 > `16:9`
</Tip>

## 響應格式

### 第 1 步 - 提交後立即返回

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

### 第 2 步 - 輪詢返回（生成中）

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "in_progress",
  "progress": 50,
  "created_at": 1775025000
}
```

### 第 2 步 - 輪詢返回（完成）

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "completed",
  "progress": 100,
  "created_at": 1775025000,
  "completed_at": 1775025090
}
```

<Warning>
  **⚠️ 響應欄位陷阱**

  * **`id` 和 `task_id` 欄位同時返回且值一致**，下游建議統一用 `task_id`（與既有 VEO 官逆相容）
  * **沒有任何 CDN / 公網 URL 返回**——響應欄位裡沒有 `video_url` / `data.url`，影片**只能通過 `GET /v1/videos/{task_id}/content` 拉取 MP4 二進位制流**（需鑑權頭）。前端不能直連此端點，**建議後端下載後落地到自己的 OSS / CDN 再分發**
  * `progress` 欄位是**粗粒度，只在 0 / 50 / 100 三檔跳**，不要拿來做百分比進度條
  * `status: "failed"` 時上游有時不帶詳細 `error` 欄位，多見於內容稽核或引數錯誤，**直接重試或調整 prompt** 即可
  * **`/content` 端點在 `status` 剛翻 `completed` 後偶發 400**，等 4 秒重試即可（上面所有程式碼示例都內建了重試）
</Warning>

<Info>
  本端點是非同步任務式入口，**計費在任務進入 `completed` 時按模型名按次結算**（fast \$0.3 / standard \$1.2，見 [概覽頁定價表](/zh-Hant/api-capabilities/veo-3-1-official/overview#模型定價)）。POST 提交、輪詢查詢、影片下載本身**不計費**，失敗任務也**不計費**。
</Info>


## OpenAPI

````yaml api-reference/veo-3-1-official-text-to-video-openapi.yaml POST /v1/videos
openapi: 3.1.0
info:
  title: VEO 3.1 Official 文生视频 API
  description: >
    Google Veo 3.1 系列视频生成模型（官转通道）— 文生视频接口（不传 `input_reference`，走
    `application/json`）。


    - 两个活跃模型：`veo-3.1-fast-generate-preview`（\$0.3/次）与
    `veo-3.1-generate-preview`（\$1.2/次）

    - 时长支持 `"4"` / `"6"` / `"8"` 秒（**字符串枚举，传数字会被拒**）

    - 时长字段名是 `seconds`（不是 `duration`）；**1080p / 4k 分辨率时 `seconds` 必须 `"8"`**

    - 同步音轨视频原生输出（含环境音、对话、配乐）— **不要传 `generateAudio`，传了会被上游回
    `INVALID_ARGUMENT`**，音频意图写进 `prompt`

    - **异步任务式端点**：本端点只提交任务，需配合 `GET /v1/videos/{task_id}` 轮询和 `GET
    /v1/videos/{task_id}/content` 下载

    - 视频留存时间官方未明确，建议生成完成后立即下载落地

    - 如需基于参考图生成视频，请使用
    [图生视频接口](/api-capabilities/veo-3-1-official/image-to-video)（同端点 + multipart
    上传 `input_reference`）


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
      summary: 文生视频：根据文本提示词生成视频任务
      description: >
        提交一个 Veo 3.1 视频生成任务（异步），返回 `task_id` 和 `status: "queued"`。


        - 必填：`model`、`prompt`

        - 可选：`seconds`（默认 `"8"`，时长字段，不是 `duration`）、`size`（默认
        `"1280x720"`）、`metadata.*`

        - **响应不会包含视频文件**，需要轮询 `GET /v1/videos/{task_id}` 直到 `status:
        "completed"`，再调 `GET /v1/videos/{task_id}/content` 下载 MP4

        - 典型生成耗时：720p 60–90 秒，1080p 80–120 秒，4K 5–6 分钟

        - 若使用参考图生成（图生视频），请改用
        [图生视频接口](/api-capabilities/veo-3-1-official/image-to-video)
      operationId: generateVeo31OfficialTextToVideo
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Veo31TextToVideoRequest'
            example:
              model: veo-3.1-fast-generate-preview
              prompt: 黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声，电影级光影，稳定运镜
              seconds: '8'
              size: 1280x720
              metadata:
                resolution: 720p
                aspectRatio: '16:9'
                seed: 20260521
                negativePrompt: blurry, watermark, distorted, low quality
      responses:
        '200':
          description: 任务已提交，返回 task_id 与 queued 状态
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Veo31VideoTask'
        '400':
          description: >-
            参数非法（seconds 传成数字、seconds 不在 4/6/8、字段名误写成 duration、1080p/4k 配了非 8
            秒、prompt 缺失等）
        '401':
          description: 未授权 - API Key 无效
        '429':
          description: 请求频率超限或余额不足
        '500':
          description: 上游网关错误，建议重试 1–2 次（失败任务不计费）
      security:
        - bearerAuth: []
components:
  schemas:
    Veo31TextToVideoRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: |
            模型 ID（按次计费，时长 / 分辨率不影响单价）：
            - `veo-3.1-fast-generate-preview` —— \$0.3/次，试水 / 批量出片首选
            - `veo-3.1-generate-preview` —— \$1.2/次，最终交付 / 4K 高清场景
          enum:
            - veo-3.1-fast-generate-preview
            - veo-3.1-generate-preview
          default: veo-3.1-fast-generate-preview
        prompt:
          type: string
          description: >
            视频生成提示词，建议详细描述：场景 + 主体 + 动作 + 镜头 + 光影 + 风格。


            **音频意图也写进 prompt**（如 "海浪声、远处海鸟叫声、低沉的风声"），**不要传 `generateAudio`
            参数**——上游会拒 `INVALID_ARGUMENT`。
          example: 黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声，电影级光影，稳定运镜
        seconds:
          type: string
          description: >
            视频时长，**字段名是 `seconds`（不是 `duration`）**，**字符串枚举**（不是数字）：

            - `"4"` —— 4 秒，720p 可用

            - `"6"` —— 6 秒，720p 可用

            - `"8"` —— 8 秒（默认），**1080p / 4k 必须用这档**


            写成 `duration` 会被静默忽略 → 时长回落默认 4 秒（720p 不报错但只出 4 秒；1080p/4k 因 4
            秒非法直接报错 `... but got 4`）。传数字（`8`）会报 `parse_request_failed: cannot
            unmarshal number into Go struct field ... duration of type string`。
          enum:
            - '4'
            - '6'
            - '8'
          default: '8'
        size:
          type: string
          description: |
            输出像素，优先级低于 `metadata.resolution`：
            - `1280x720` / `720x1280` —— 720p（默认）
            - `1920x1080` / `1080x1920` —— 1080p（seconds 必须 `"8"`）
            - `3840x2160` / `2160x3840` —— 4k（seconds 必须 `"8"`，渲染慢 4–6 倍）
          enum:
            - 1280x720
            - 720x1280
            - 1920x1080
            - 1080x1920
            - 3840x2160
            - 2160x3840
          default: 1280x720
        metadata:
          $ref: '#/components/schemas/Veo31TextToVideoMetadata'
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
          description: 生成进度（粗粒度，**只在 0 / 50 / 100 三档跳**，不要拿来做百分比进度条）
          example: 0
        created_at:
          type: integer
          description: 任务创建 Unix 时间戳（秒）
          example: 1775025000
        completed_at:
          type: integer
          description: 任务完成 Unix 时间戳（秒），仅 completed 状态返回
          example: 1775025090
    Veo31TextToVideoMetadata:
      type: object
      description: >
        生成参数细节包装对象。**优先级高于顶层的 `size` 等字段**：

        - 秒数识别顺序：`metadata.durationSeconds > seconds > 8`（请求字段写 `seconds`，写
        `duration` 不识别）

        - 分辨率识别顺序：`metadata.resolution > size > 720p`
      properties:
        resolution:
          type: string
          description: 分辨率档位（优先级高于 `size`）
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
          type: integer
          description: >
            随机数种子。固定 seed 可让多次输出风格聚集（同 seed 多次结果文件大小跨度仅 6%、跨 seed 跨度
            36%），**但不能字节级复现**。
          example: 20260521
        negativePrompt:
          type: string
          description: 反向提示词，推荐传 `"blurry, watermark, distorted, low quality"`
          example: blurry, watermark, distorted, low quality
        durationSeconds:
          type: integer
          description: 等价于顶层 `seconds`，优先级最高（一般不推荐用，统一用 `seconds` 即可）
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key（默认分组 + 任意计费模式都能调通）

````