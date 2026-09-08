> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生圖 API 參考

> FLUX 文生圖 API 參考與線上除錯 — FLUX.2 [klein/pro/max/flex] 全系列 OpenAI 相容直連，支援 4MP 輸出與 hex 精確色控

<Info>
  右側的互動式 Playground 支援直接線上除錯。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），輸入 prompt、選擇模型與尺寸後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「文本生成圖片」，僅需輸入提示詞，無需上傳任何圖片。如需根據現有圖片做編輯、多圖融合，請使用 [圖片編輯介面](/zh-Hant/api-capabilities/flux/image-edit)。
</Tip>

<Warning>
  **⚠️ 關鍵差異 / 不支援的引數**

  * **結果 URL 僅 10 分鐘有效** — `data[0].url` 必須立即下載，過期返回 404
  * **`width` / `height` 必須是 16 的倍數** — 不滿足會 400 報錯
  * **`prompt_upsampling` FLUX.2 \[klein] 不支援** — 傳入會被忽略
  * **總畫素上限 4MP**（約 2048×2048）— 超過會 400 報錯
  * **`grounding search` 僅 `flux-2-max`** — 其它模型 prompt 含即時知識也不會觸發
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

## 程式碼示例

### Python（OpenAI SDK 直連）

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="flux-2-pro",
    prompt="A cinematic shot of a futuristic city at sunset, 85mm lens, hyper-realistic",
    size="1920x1080"
)

# data[0].url 僅 10 分鐘有效，立即下載
image_url = resp.data[0].url
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python（原生 requests · 含 width/height 寫法）

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "flux-2-max",
        "prompt": "Score of yesterday's Champions League final, infographic style",
        "width": 1920,
        "height": 1080,
        "safety_tolerance": 2,
        "output_format": "jpeg",
        "seed": 42
    },
    timeout=120
).json()

image_url = response["data"][0]["url"]
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020",
    "size": "1024x1024",
    "output_format": "png"
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
        model: 'flux-2-klein-9b',
        prompt: 'A serene mountain landscape at golden hour, soft diffused light',
        width: 1024,
        height: 1024
    })
});

const { data } = await resp.json();
// 立即下載 - URL 10 分鐘過期
const img = await fetch(data[0].url);
fs.writeFileSync('out.jpg', Buffer.from(await img.arrayBuffer()));
```

### 瀏覽器 JavaScript（直接渲染）

```javascript theme={null}
{/* 僅作演示，生產請走後端代理避免 Key 洩露；URL 不開 CORS，需要後端代下載 */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: 'Watercolor aurora borealis over Nordic mountains',
        size: '1536x1024'
    })
});

const { data } = await resp.json();
{/* delivery URL 不開 CORS，瀏覽器直接 <img src> 渲染可行（不走 fetch 即可），但建議後端代下載到自有 CDN */}
document.getElementById('img').src = data[0].url;
```

## 引數說明速查

| 引數                  | 型別      | 必填 | 預設          | 說明                               |
| ------------------- | ------- | -- | ----------- | -------------------------------- |
| `model`             | string  | 是  | —           | FLUX 模型 ID，見下表                   |
| `prompt`            | string  | 是  | —           | 提示詞，最長 32K tokens，支援中英文與結構化 JSON |
| `size`              | string  | 否  | `1024x1024` | OpenAI 風格尺寸字串，如 `1920x1080`      |
| `width`             | integer | 否  | `1024`      | BFL 原生寫法，與 size 二選一，必須 16 倍數     |
| `height`            | integer | 否  | `1024`      | BFL 原生寫法，必須 16 倍數                |
| `seed`              | integer | 否  | 隨機          | 固定可復現                            |
| `safety_tolerance`  | integer | 否  | `2`         | 0（最嚴）– 6（最寬鬆）                    |
| `output_format`     | string  | 否  | `jpeg`      | `jpeg` / `png`                   |
| `prompt_upsampling` | boolean | 否  | `false`     | 自動擴寫 prompt（\[klein] 不支援）        |
| `steps`             | integer | 否  | `50`        | **僅 `flux-2-flex`**，最大 50        |
| `guidance`          | number  | 否  | `4.5`       | **僅 `flux-2-flex`**，1.5–10       |
| `n`                 | integer | 否  | `1`         | 僅支援 1                            |

### 支援的模型 ID

| 模型 ID                | 速度         | 適用              |
| -------------------- | ---------- | --------------- |
| `flux-2-max`         | \< 15s     | 旗艦畫質 + 聯網搜尋     |
| `flux-2-pro`         | \< 10s     | 生產規模、最佳價效比      |
| `flux-2-flex`        | 較慢         | 文字渲染特化          |
| `flux-2-klein-9b`    | sub-second | 平衡型             |
| `flux-2-klein-4b`    | sub-second | 最快              |
| `flux-pro-1.1-ultra` | \~10s      | 老版 4MP（詳見歷史版本頁） |
| `flux-pro-1.1`       | \~5s       | 老版 1.6MP        |
| `flux-pro`           | \~6s       | 初代 pro          |
| `flux-dev`           | \~5s       | 開發版             |

<Tip>
  詳細的引數約束、可選值、示例請檢視右側 Playground 中的欄位說明，所有 enum 欄位均支援下拉選擇。
</Tip>

## 響應格式

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "url": "https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=..."
        }
    ]
}
```

<Warning>
  **⚠️ `data[0].url` 僅 10 分鐘有效**

  * URL 託管在 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`，簽名 10 分鐘過期
  * **不開啟 CORS**，瀏覽器 `fetch` 會被攔，但 `<img src>` 直顯可行
  * 生產服務**必須**服務端代下載到自有 OSS / CDN，不要把原 URL 直接給客戶端

  與 OpenAI `gpt-image-2`（返回 `b64_json` 純 base64）不同，**FLUX 走 URL，不返回 base64**。
</Warning>

<Info>
  FLUX 不返回 `usage` 欄位（按張計費而非按 token），實際扣費按本文件定價表執行。響應頭 `x-request-id` 用於排查。
</Info>


## OpenAPI

````yaml api-reference/flux-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX 文生图 API
  description: |
    Black Forest Labs FLUX 模型族 — 文生图接口（OpenAI 兼容封装）。

    - 全模型矩阵：FLUX.2 [klein 4b/9b、pro、max、flex]、FLUX.1 [pro/1.1/1.1-ultra/dev]
    - 输出最大 4MP（2048×2048），任意宽高（边长须 16 倍数）
    - 支持 32K tokens 长 prompt、hex 色精确控制、结构化 JSON prompt
    - `flux-2-max` 独家：grounding search 联网搜索
    - 响应 `data[0].url` **仅 10 分钟有效**，需立即下载（CORS 关闭）
    - APIYI 网关把 BFL 异步 polling 封装为同步 OpenAI Images API

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
      summary: 文生图：根据文本描述生成图片
      description: >
        使用 FLUX 系列模型，根据文本提示词生成图片。


        - 必填：`model`、`prompt`

        - 可选：`size` 或
        `width`+`height`（二选一）、`seed`、`safety_tolerance`、`output_format`、`prompt_upsampling`

        - flex 独有：`steps`、`guidance`

        - 自定义尺寸需满足：边长 16 倍数、64×64 ≤ size ≤ 4MP

        - 如需带参考图编辑或多图融合，请使用 [图片编辑接口](/api-capabilities/flux/image-edit)
      operationId: generateFluxTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: flux-2-pro
              prompt: A cinematic shot of a futuristic city at sunset, 85mm lens
              size: 1920x1080
              output_format: jpeg
              safety_tolerance: 2
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: 参数非法（width/height 非 16 倍数 / 超 4MP / prompt 超 32K tokens 等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截
        '429':
          description: 请求频率超限或额度不足（active tasks 超 24 个）
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: FLUX 模型 ID。FLUX.2 推荐 flux-2-pro / flux-2-max；旧版见历史版本页
          enum:
            - flux-2-max
            - flux-2-pro
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-pro-1.1-ultra
            - flux-pro-1.1
            - flux-pro
            - flux-dev
          default: flux-2-pro
        prompt:
          type: string
          description: 提示词，最长 32K tokens。支持自然语言、hex 色码、结构化 JSON
          example: A cinematic shot of a futuristic city at sunset, 85mm lens
        size:
          type: string
          description: >
            OpenAI 风格尺寸字符串，与 `width`/`height` 二选一。

            常用：1024x1024 / 1536x1024 / 1024x1536 / 1920x1080 / 1440x2048 /
            2048x2048。

            自定义需满足：边长 16 倍数、64×64–4MP 之间。
          example: 1920x1080
          default: 1024x1024
        width:
          type: integer
          description: BFL 原生写法，与 size 二选一。必须是 16 的倍数，64–2048 之间
          minimum: 64
          maximum: 2048
          example: 1920
          default: 1024
        height:
          type: integer
          description: BFL 原生写法，必须是 16 的倍数，64–2048 之间
          minimum: 64
          maximum: 2048
          example: 1080
          default: 1024
        seed:
          type: integer
          description: 固定可复现，传相同 seed + 相同其它参数得一致结果
          example: 42
        safety_tolerance:
          type: integer
          description: 审核档位。0 最严格，6 最宽松，默认 2
          minimum: 0
          maximum: 6
          default: 2
        output_format:
          type: string
          description: 输出格式
          enum:
            - jpeg
            - png
          default: jpeg
        prompt_upsampling:
          type: boolean
          description: 是否自动扩写 prompt。FLUX.2 [klein] 不支持，传入会被忽略
          default: false
        steps:
          type: integer
          description: '**仅 flux-2-flex**。推理步数，最大 50'
          minimum: 1
          maximum: 50
          default: 50
        guidance:
          type: number
          description: '**仅 flux-2-flex**。引导强度。1.5–10，越高越贴 prompt'
          minimum: 1.5
          maximum: 10
          default: 4.5
        'n':
          type: integer
          description: 出图数量。本接口仅支持 1
          enum:
            - 1
          default: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Unix 时间戳
          example: 1776832476
        data:
          type: array
          description: 生成结果数组（本接口单次返回 1 张）
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  **签名 URL，仅 10 分钟有效**。托管在 delivery-eu.bfl.ai /
                  delivery-us.bfl.ai，CORS 关闭，需服务端代下载
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````