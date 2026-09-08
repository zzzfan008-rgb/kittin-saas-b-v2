> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生图 API 参考

> Grok Imagine 2 文生图 API 参考与在线调试 — 纯文本提示词出图，支持 5 种宽高比、1K/2K 双档分辨率、单次最多 10 张

<Info>
  右侧的交互式 Playground 支持直接在线调试。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），输入 `prompt`、选择 `aspect_ratio` / `resolution` 后一键发送即可。
</Info>

<Tip>
  **场景说明**：本页用于「文本生成图片」，只需提示词，无需上传任何图片。如果你要基于现有图片做修改、或做多图融合，请使用 [图片编辑接口](/api-capabilities/grok-imagine-image/image-edit)。
</Tip>

<Warning>
  **⚠️ 不要把参考图传到这个端点**

  本端点传入 `image` / `image_url` / `images` **不会报错**，会返回 200 并按提示词生成一张全新的图——**参考图被静默丢弃，且照常计费**。

  由于没有任何错误信号，这个问题往往要到发现「出的图和输入图毫无关系」时才被察觉。**只要涉及参考图，一律走 [`/v1/images/edits`](/api-capabilities/grok-imagine-image/image-edit)。**
</Warning>

<Warning>
  **⚠️ 参数写错不会报错**

  非法的 `aspect_ratio`（如 `5:7`）、`resolution`（如 `1K`、`1024x1024`）、`response_format`（如 `base64`）都会**静默回退默认值**并正常出图。拿到的图不符合预期时，请先检查参数拼写——注意 `resolution` 是小写 `1k` / `2k`。

  唯一例外：`resolution: "4k"` 返回 `503 model_service_unavailable`，这是**该档位不支持**而非渠道故障，重试无效。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。1K 出图约 9 秒、2K 约 15–17 秒，**建议客户端超时设到 360 秒**，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

## 代码示例

### Python（OpenAI SDK 直连）

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0  # 图片 API 是同步调用，超时要给足
)

resp = client.images.generate(
    model="grok-imagine-image",
    prompt="A photorealistic red wooden boat moored on a glassy alpine lake at dawn, "
           "mist over the water, snow-capped peaks behind, cinematic photography",
    n=1,
    # aspect_ratio / resolution 不是 OpenAI SDK 的标准字段，要放进 extra_body
    extra_body={
        "aspect_ratio": "16:9",
        "resolution": "1k",
        "response_format": "url"
    }
)

# 默认 response_format=url，返回的是图片直链（1K 为 .jpg、2K 为 .png）
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
        "prompt": "赛博朋克城市雨夜，霓虹招牌特写，电影感打光",
        "n": 1,
        "aspect_ratio": "16:9",
        "resolution": "2k",          # 2k 输出 PNG，单张 5-6MB
        "response_format": "b64_json"
    },
    timeout=360  # 2K 约 15-17 秒，高峰更久；按 60 秒配会大量误超时
).json()

# b64_json 是纯 base64（不带 data: 前缀），直接 decode 写文件
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
    "prompt": "一只戴墨镜的橘猫坐在海边吧台，写实摄影，暖色调夕阳",
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
        n: 2,                       // 单次最多 10 张，按张计费
        aspect_ratio: '4:3',
        resolution: '1k',
        response_format: 'url'
    }),
    // Node 18+ 默认无超时，生产环境建议用 AbortSignal.timeout(360000) 显式控制
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();

// n=2 时 data 数组有两项，逐个下载
for (const [i, item] of data.data.entries()) {
    const img = await fetch(item.url);
    fs.writeFileSync(`out-${i}.jpg`, Buffer.from(await img.arrayBuffer()));
}
```

### 浏览器 JavaScript

```javascript theme={null}
// ⚠️ 仅作演示：Key 写在前端会泄露，生产环境请走后端代理
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
        response_format: 'url'   // 浏览器里用 url 比 b64_json 更省内存
    })
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## 参数说明速查

| 参数名               | 类型      | 必填 | 默认    | 说明                                                                      |
| ----------------- | ------- | -- | ----- | ----------------------------------------------------------------------- |
| `model`           | string  | ✅  | —     | `grok-imagine-image`（\$0.02/张）或 `grok-imagine-image-quality`（\$0.045/张） |
| `prompt`          | string  | ✅  | —     | 提示词，支持中英文。建议描述主体、场景、风格、光线                                               |
| `n`               | integer | ❌  | `1`   | 出图数量 **1–10**，按张计费。传 `0` 按 `1` 处理，`≥11` 返回 400                          |
| `aspect_ratio`    | string  | ❌  | `1:1` | `1:1` / `16:9` / `9:16` / `4:3` / `3:4`，枚举外的值静默按 `1:1` 处理               |
| `resolution`      | string  | ❌  | `1k`  | `1k`（JPEG，约 1 MP）或 `2k`（PNG，约 4.2–4.5 MP）。**两档同价**；`4k` 返回 503          |
| `response_format` | string  | ❌  | `url` | `url` 返回图片直链；`b64_json` 返回纯 base64（**不带** `data:` 前缀）                   |

**各宽高比的实际输出像素**：

| `aspect_ratio` | `1k`      | `2k`      |
| -------------- | --------- | --------- |
| `1:1`          | 1024×1024 | 2048×2048 |
| `16:9`         | 1280×720  | 2816×1584 |
| `9:16`         | 720×1280  | 1584×2816 |
| `4:3`          | 1152×864  | 2368×1776 |
| `3:4`          | 864×1152  | 1776×2368 |

<Info>
  不支持 `seed`（传了不报错也不生效，结果不可复现）、不支持 mask。`size` / `quality` / `style` 等 OpenAI 习惯字段会被静默忽略。
</Info>

## 响应格式

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
  **响应字段陷阱**

  * `data[]` 每项只有 `url` 或 `b64_json` **二选一**，取决于 `response_format`，不会同时出现。
  * **不返回 `revised_prompt`**，也没有 `respect_moderation` / `model` 等字段，解析时不要假设它们存在。
  * `b64_json` 是**纯 base64，不带 `data:image/...;base64,` 前缀**，可直接 `base64.b64decode`。
  * `created` 恒为 `0`，不能当时间戳用。
  * `n > 1` 时 `data` 数组有多项，别只取 `data[0]`。
</Warning>

<Info>
  **`usage` 不能用来核账**：`prompt_tokens` 恒为 `1000 × n`，与提示词实际长度无关，是占位值。本系列按次固定计费（\$0.02 / \$0.045 一张），真实扣费请以 API易 控制台账单为准。
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