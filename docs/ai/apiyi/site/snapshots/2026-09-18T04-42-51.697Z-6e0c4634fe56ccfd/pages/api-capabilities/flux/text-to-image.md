> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生图 API 参考

> FLUX 文生图 API 参考与在线调试 — FLUX.2 [klein/pro/max/flex] 全系列 OpenAI 兼容直连，支持 4MP 输出与 hex 精确色控

<Info>
  右侧的交互式 Playground 支持直接在线调试。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），输入 prompt、选择模型与尺寸后一键发送即可。
</Info>

<Tip>
  **场景说明**：本页用于「文本生成图片」，仅需输入提示词，无需上传任何图片。如需根据现有图片做编辑、多图融合，请使用 [图片编辑接口](/api-capabilities/flux/image-edit)。
</Tip>

<Warning>
  **⚠️ 关键差异 / 不支持的参数**

  * **结果 URL 仅 10 分钟有效** — `data[0].url` 必须立即下载，过期返回 404
  * **`width` / `height` 必须是 16 的倍数** — 不满足会 400 报错
  * **`prompt_upsampling` FLUX.2 \[klein] 不支持** — 传入会被忽略
  * **总像素上限 4MP**（约 2048×2048）— 超过会 400 报错
  * **`grounding search` 仅 `flux-2-max`** — 其它模型 prompt 含实时知识也不会触发
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

## 代码示例

### Python（OpenAI SDK 直连）

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

# data[0].url 仅 10 分钟有效，立即下载
image_url = resp.data[0].url
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python（原生 requests · 含 width/height 写法）

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
// 立即下载 - URL 10 分钟过期
const img = await fetch(data[0].url);
fs.writeFileSync('out.jpg', Buffer.from(await img.arrayBuffer()));
```

### 浏览器 JavaScript（直接渲染）

```javascript theme={null}
{/* 仅作演示，生产请走后端代理避免 Key 泄露；URL 不开 CORS，需要后端代下载 */}
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
{/* delivery URL 不开 CORS，浏览器直接 <img src> 渲染可行（不走 fetch 即可），但建议后端代下载到自有 CDN */}
document.getElementById('img').src = data[0].url;
```

## 参数说明速查

| 参数                  | 类型      | 必填 | 默认          | 说明                               |
| ------------------- | ------- | -- | ----------- | -------------------------------- |
| `model`             | string  | 是  | —           | FLUX 模型 ID，见下表                   |
| `prompt`            | string  | 是  | —           | 提示词，最长 32K tokens，支持中英文与结构化 JSON |
| `size`              | string  | 否  | `1024x1024` | OpenAI 风格尺寸字符串，如 `1920x1080`     |
| `width`             | integer | 否  | `1024`      | BFL 原生写法，与 size 二选一，必须 16 倍数     |
| `height`            | integer | 否  | `1024`      | BFL 原生写法，必须 16 倍数                |
| `seed`              | integer | 否  | 随机          | 固定可复现                            |
| `safety_tolerance`  | integer | 否  | `2`         | 0（最严）– 6（最宽松）                    |
| `output_format`     | string  | 否  | `jpeg`      | `jpeg` / `png`                   |
| `prompt_upsampling` | boolean | 否  | `false`     | 自动扩写 prompt（\[klein] 不支持）        |
| `steps`             | integer | 否  | `50`        | **仅 `flux-2-flex`**，最大 50        |
| `guidance`          | number  | 否  | `4.5`       | **仅 `flux-2-flex`**，1.5–10       |
| `n`                 | integer | 否  | `1`         | 仅支持 1                            |

### 支持的模型 ID

| 模型 ID                | 速度         | 适用              |
| -------------------- | ---------- | --------------- |
| `flux-2-max`         | \< 15s     | 旗舰画质 + 联网搜索     |
| `flux-2-pro`         | \< 10s     | 生产规模、最佳性价比      |
| `flux-2-flex`        | 较慢         | 文字渲染特化          |
| `flux-2-klein-9b`    | sub-second | 平衡型             |
| `flux-2-klein-4b`    | sub-second | 最快              |
| `flux-pro-1.1-ultra` | \~10s      | 老版 4MP（详见历史版本页） |
| `flux-pro-1.1`       | \~5s       | 老版 1.6MP        |
| `flux-pro`           | \~6s       | 初代 pro          |
| `flux-dev`           | \~5s       | 开发版             |

<Tip>
  详细的参数约束、可选值、示例请查看右侧 Playground 中的字段说明，所有 enum 字段均支持下拉选择。
</Tip>

## 响应格式

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
  **⚠️ `data[0].url` 仅 10 分钟有效**

  * URL 托管在 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`，签名 10 分钟过期
  * **不开启 CORS**，浏览器 `fetch` 会被拦，但 `<img src>` 直显可行
  * 生产服务**必须**服务端代下载到自有 OSS / CDN，不要把原 URL 直接给客户端

  与 OpenAI `gpt-image-2`（返回 `b64_json` 纯 base64）不同，**FLUX 走 URL，不返回 base64**。
</Warning>

<Info>
  FLUX 不返回 `usage` 字段（按张计费而非按 token），实际扣费按本文档定价表执行。响应头 `x-request-id` 用于排查。
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