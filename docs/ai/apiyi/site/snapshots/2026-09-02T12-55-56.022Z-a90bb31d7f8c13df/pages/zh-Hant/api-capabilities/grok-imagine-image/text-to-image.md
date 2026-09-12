> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生圖 API 參考

> Grok Imagine 2 文生圖 API 參考與線上除錯 — 純文本提示詞出圖，支援 5 種寬高比、1K/2K 雙檔解析度、單次最多 10 張

<Info>
  右側的互動式 Playground 支援直接線上除錯。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），輸入 `prompt`、選擇 `aspect_ratio` / `resolution` 後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「文本生成圖片」，只需提示詞，無需上傳任何圖片。如果你要基於現有圖片做修改、或做多圖融合，請使用 [圖片編輯介面](/zh-Hant/api-capabilities/grok-imagine-image/image-edit)。
</Tip>

<Warning>
  **⚠️ 不要把參考圖傳到這個端點**

  本端點傳入 `image` / `image_url` / `images` **不會報錯**，會返回 200 並按提示詞生成一張全新的圖——**參考圖被靜默丟棄，且照常計費**。

  由於沒有任何錯誤訊號，這個問題往往要到發現「出的圖和輸入圖毫無關係」時才被察覺。**只要涉及參考圖，一律走 [`/v1/images/edits`](/zh-Hant/api-capabilities/grok-imagine-image/image-edit)。**
</Warning>

<Warning>
  **⚠️ 引數寫錯不會報錯**

  非法的 `aspect_ratio`（如 `5:7`）、`resolution`（如 `1K`、`1024x1024`）、`response_format`（如 `base64`）都會**靜默回退預設值**並正常出圖。拿到的圖不符合預期時，請先檢查引數拼寫——注意 `resolution` 是小寫 `1k` / `2k`。

  唯一例外：`resolution: "4k"` 返回 `503 model_service_unavailable`，這是**該檔位不支援**而非渠道故障，重試無效。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。1K 出圖約 9 秒、2K 約 15–17 秒，**建議客戶端超時設到 360 秒**，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

## 程式碼示例

### Python（OpenAI SDK 直連）

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0  # 圖片 API 是同步呼叫，超時要給足
)

resp = client.images.generate(
    model="grok-imagine-image",
    prompt="A photorealistic red wooden boat moored on a glassy alpine lake at dawn, "
           "mist over the water, snow-capped peaks behind, cinematic photography",
    n=1,
    # aspect_ratio / resolution 不是 OpenAI SDK 的標準欄位，要放進 extra_body
    extra_body={
        "aspect_ratio": "16:9",
        "resolution": "1k",
        "response_format": "url"
    }
)

# 預設 response_format=url，返回的是圖片直鏈（1K 為 .jpg、2K 為 .png）
urllib.request.urlretrieve(resp.data[0].url, "out.jpg")
```

### Python（原生 requests）

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "grok-imagine-image",
        "prompt": "賽博朋克城市雨夜，霓虹招牌特寫，電影感打光",
        "n": 1,
        "aspect_ratio": "16:9",
        "resolution": "2k",          # 2k 輸出 PNG，單張 5-6MB
        "response_format": "b64_json"
    },
    timeout=360  # 2K 約 15-17 秒，高峰更久；按 60 秒配會大量誤超時
).json()

# b64_json 是純 base64（不帶 data: 字首），直接 decode 寫檔案
with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-image-quality",
    "prompt": "一隻戴墨鏡的橘貓坐在海邊吧檯，寫實攝影，暖色調夕陽",
    "n": 1,
    "aspect_ratio": "16:9",
    "resolution": "1k",
    "response_format": "url"
  }'
```

### Node.js（原生 fetch）

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        n: 2,                       // 單次最多 10 張，按張計費
        aspect_ratio: '4:3',
        resolution: '1k',
        response_format: 'url'
    }),
    // Node 18+ 預設無超時，生產環境建議用 AbortSignal.timeout(360000) 顯式控制
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();

// n=2 時 data 陣列有兩項，逐個下載
for (const [i, item] of data.data.entries()) {
    const img = await fetch(item.url);
    fs.writeFileSync(`out-${i}.jpg`, Buffer.from(await img.arrayBuffer()));
}
```

### 瀏覽器 JavaScript

```javascript theme={null}
// ⚠️ 僅作演示：Key 寫在前端會洩露，生產環境請走後端代理
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'a minimalist poster of a mountain at sunrise, flat vector style',
        aspect_ratio: '3:4',
        resolution: '1k',
        response_format: 'url'   // 瀏覽器裡用 url 比 b64_json 更省記憶體
    })
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## 引數說明速查

| 引數名               | 型別      | 必填 | 預設    | 說明                                                                      |
| ----------------- | ------- | -- | ----- | ----------------------------------------------------------------------- |
| `model`           | string  | ✅  | —     | `grok-imagine-image`（\$0.02/張）或 `grok-imagine-image-quality`（\$0.045/張） |
| `prompt`          | string  | ✅  | —     | 提示詞，支援中英文。建議描述主體、場景、風格、光線                                               |
| `n`               | integer | ❌  | `1`   | 出圖數量 **1–10**，按張計費。傳 `0` 按 `1` 處理，`≥11` 返回 400                          |
| `aspect_ratio`    | string  | ❌  | `1:1` | `1:1` / `16:9` / `9:16` / `4:3` / `3:4`，列舉外的值靜默按 `1:1` 處理               |
| `resolution`      | string  | ❌  | `1k`  | `1k`（JPEG，約 1 MP）或 `2k`（PNG，約 4.2–4.5 MP）。**兩檔同價**；`4k` 返回 503          |
| `response_format` | string  | ❌  | `url` | `url` 返回圖片直鏈；`b64_json` 返回純 base64（**不帶** `data:` 字首）                   |

**各寬高比的實際輸出畫素**：

| `aspect_ratio` | `1k`      | `2k`      |
| -------------- | --------- | --------- |
| `1:1`          | 1024×1024 | 2048×2048 |
| `16:9`         | 1280×720  | 2816×1584 |
| `9:16`         | 720×1280  | 1584×2816 |
| `4:3`          | 1152×864  | 2368×1776 |
| `3:4`          | 864×1152  | 1776×2368 |

<Info>
  不支援 `seed`（傳了不報錯也不生效，結果不可復現）、不支援 mask。`size` / `quality` / `style` 等 OpenAI 習慣欄位會被靜默忽略。
</Info>

## 響應格式

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **響應欄位陷阱**

  * `data[]` 每項只有 `url` 或 `b64_json` **二選一**，取決於 `response_format`，不會同時出現。
  * **不返回 `revised_prompt`**，也沒有 `respect_moderation` / `model` 等欄位，解析時不要假設它們存在。
  * `b64_json` 是**純 base64，不帶 `data:image/...;base64,` 字首**，可直接 `base64.b64decode`。
  * `created` 恆為 `0`，不能當時間戳用。
  * `n > 1` 時 `data` 陣列有多項，別隻取 `data[0]`。
</Warning>

<Info>
  **`usage` 不能用來核賬**：`prompt_tokens` 恆為 `1000 × n`，與提示詞實際長度無關，是佔位值。本系列按次固定計費（\$0.02 / \$0.045 一張），真實扣費請以 API易 控制台賬單為準。
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Grok Imagine 2 文生图 API
  description: >
    xAI Grok Imagine 2 图像生成模型 — 文生图接口。


    -
    两个模型：`grok-imagine-image`（标准，\$0.02/张）、`grok-imagine-image-quality`（高质量，\$0.045/张）

    - 按次固定计费，**1K 与 2K 同价**

    - 支持 5 种宽高比 × 2 档分辨率，参数真实生效

    - 单次最多 10 张（`n` 取值 1–10）

    - 1K 输出 JPEG（约 220–300 KB），2K 输出 PNG（约 5–6 MB）


    **⚠️ 本端点不接受参考图**：传入 `image` / `image_url` / `images` 会返回 200 并正常出图，

    但参考图被静默丢弃且照常计费。参考图编辑请用

    [图片编辑接口](/api-capabilities/grok-imagine-image/image-edit)（`multipart/form-data`）。


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


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
  /v1/images/generations:
    post:
      tags:
        - 文生图
      summary: 文生图：根据文本提示词生成图片
      description: |
        使用 Grok Imagine 2 模型根据文本提示词生成图片。

        - 必填：`model`、`prompt`
        - 可选：`n`、`aspect_ratio`、`resolution`、`response_format`
        - 非法参数值不会报错，会**静默回退默认值**（如 `aspect_ratio: "5:7"` 按 `1:1` 处理）
        - `resolution: "4k"` 会返回 503 `model_service_unavailable`，这是参数不支持而非渠道故障
        - 不支持 `seed`，同一提示词多次调用结果不可复现
      operationId: generateGrokImagineTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GrokImagineGenerateRequest'
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: 参数非法，或提示词被内容审核拦截（两者错误码相同，均为 `invalid_request`）
        '401':
          description: 未授权 - API Key 无效
        '429':
          description: 请求频率超限或额度不足
        '503':
          description: '参数档位不可用（如 `resolution: 4k`），或当前分组无可用渠道'
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: 模型 ID。quality 版画质更高、价格更贵
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: 提示词，支持中英文。建议详细描述主体、场景、风格、光线
          example: >-
            A photorealistic red wooden boat moored on a glassy alpine lake at
            dawn, mist over the water, snow-capped peaks behind, cinematic
            photography
        'n':
          type: integer
          description: 生成图片数量，取值 1–10。传 11 及以上返回 400；传 0 静默按 1 处理
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        aspect_ratio:
          type: string
          description: |
            输出宽高比。各比例在两档分辨率下的实际像素：

            | 宽高比 | `1k` | `2k` |
            |---|---|---|
            | `1:1` | 1024×1024 | 2048×2048 |
            | `16:9` | 1280×720 | 2816×1584 |
            | `9:16` | 720×1280 | 1584×2816 |
            | `4:3` | 1152×864 | 2368×1776 |
            | `3:4` | 864×1152 | 1776×2368 |

            传入枚举外的值不会报错，会静默按默认 `1:1` 处理。
          enum:
            - '1:1'
            - '16:9'
            - '9:16'
            - '4:3'
            - '3:4'
          default: '1:1'
          example: '16:9'
        resolution:
          type: string
          description: |
            输出分辨率档位。`1k` 约 0.9–1.05 兆像素、输出 JPEG；
            `2k` 约 4.2–4.5 兆像素、输出 PNG（单张 5–6 MB）。**两档同价。**

            传 `4k` 会返回 503；传其它非法值（如 `1K`、`1024x1024`）静默按 `1k` 处理。
          enum:
            - 1k
            - 2k
          default: 1k
          example: 1k
        response_format:
          type: string
          description: |
            返回格式。`url` 返回图片直链（无签名参数）；
            `b64_json` 返回纯 base64 字符串（**不带** `data:` 前缀）。

            传入非法值静默回退为默认的 `url`。
          enum:
            - url
            - b64_json
          default: url
          example: url
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: 创建时间戳。本模型恒返回 0，不可用于计时
          example: 0
        data:
          type: array
          description: 图片结果数组，长度等于请求的 `n`
          items:
            type: object
            properties:
              url:
                type: string
                description: 图片直链，`response_format=url` 时返回。1K 为 .jpg、2K 为 .png
                example: >-
                  https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg
              b64_json:
                type: string
                description: '纯 base64 图片数据，`response_format=b64_json` 时返回（不带 data: 前缀）'
        usage:
          type: object
          description: |
            **占位值，不能用于核账。** `prompt_tokens` 恒为 `1000 × n`，与实际提示词长度无关。
            真实扣费以控制台账单为准。
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
            output_tokens:
              type: integer
              example: 0
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````