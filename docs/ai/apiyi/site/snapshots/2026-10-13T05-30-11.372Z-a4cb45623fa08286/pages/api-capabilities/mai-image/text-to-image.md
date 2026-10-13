> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生图 API 参考

> MAI-Image 2.6 文生图 API 参考与在线调试 — 纯文本提示词出图，width/height 自定义尺寸最高 1536×1536 面积，固定返回 PNG base64

<Info>
  右侧的交互式 Playground 支持直接在线调试。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），选择 `model`、输入 `prompt`，按需填 `width` / `height` 后一键发送即可。
</Info>

<Tip>
  **场景说明**：本页用于「文本生成图片」，只需提示词。如果你要基于现有图片做修改，请使用 [图片编辑接口](/api-capabilities/mai-image/image-edit)。
</Tip>

<Warning>
  **⚠️ 三个参数传了就 400**

  `response_format`、`seed`、`negative_prompt` 本系列都不接受，传入返回 400 `Invalid parameters: xxx`。从 gpt-image / DALL·E 迁移的代码请先删掉 `response_format`——返回值固定是 `data[0].b64_json`。
</Warning>

<Warning>
  **⚠️ 尺寸用 width + height，不用 size**

  本端点传 `size` 会被**静默忽略**，恒出 1024×1024。请改用整数 `width` + `height`（必须成对），每维 ≥ 768、宽×高 ≤ 2,359,296（1536×1536 面积）。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。1024×1024 出图 Flash 约 17 秒、2.6 约 30 秒，**建议客户端超时 Flash ≥ 120 秒、2.6 ≥ 180 秒**，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

## 代码示例

### Python（OpenAI SDK）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0  # 同步调用，超时要给足
)

resp = client.images.generate(
    model="MAI-Image-2.6-Flash",
    prompt="一家古风茶馆的门面，木质招牌上写着「API易 欢迎」，红灯笼，黄昏暖光，写实摄影",
    # width / height 不是 OpenAI SDK 的标准字段，要放进 extra_body
    # 不要传 response_format，会 400
    extra_body={"width": 1024, "height": 1024}
)

with open("out.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python（原生 requests）

```python theme={null}
import base64
import os
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
    json={
        "model": "MAI-Image-2.6",
        "prompt": "A red fox sitting on a mossy rock in a misty forest, soft morning light, photorealistic",
        "width": 1536,
        "height": 1024
    },
    timeout=180
)
response.raise_for_status()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MAI-Image-2.6-Flash",
    "prompt": "一张极简风格的咖啡店海报，顶部大字写着「秋日限定」，暖棕配色",
    "width": 1024,
    "height": 1536
  }' | python3 -c "import sys,json,base64; open('out.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js（原生 fetch）

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIYI_API_KEY}`
    },
    body: JSON.stringify({
        model: 'MAI-Image-2.6-Flash',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        width: 1792,
        height: 1008               // 16:9，宽×高不超过 2,359,296
    }),
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('out.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

### 一次要多张：并发请求

文生图接口每次只返回 1 张（`n` 无效），要多张就并发：

```python theme={null}
import base64, os, requests
from concurrent.futures import ThreadPoolExecutor

def gen(i):
    r = requests.post(
        "https://api.apiyi.com/v1/images/generations",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        json={"model": "MAI-Image-2.6-Flash", "prompt": "a watercolor lighthouse at dusk"},
        timeout=120
    )
    r.raise_for_status()
    open(f"out-{i}.png", "wb").write(base64.b64decode(r.json()["data"][0]["b64_json"]))

with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(gen, range(4)))
```

## 参数说明速查

| 参数名 | 类型 | 必填 | 默认 | 说明 |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6`（\$0.12/张）或 `MAI-Image-2.6-Flash`（\$0.06/张），**大小写敏感** |
| `prompt` | string | ✅ | — | 提示词，支持中英文。要出现在图里的文字用引号括起来 |
| `width` | integer | ❌ | `1024` | 输出宽度。≥ 768，与 `height` 必须成对，非 16 倍数向下取整 |
| `height` | integer | ❌ | `1024` | 输出高度。≥ 768，宽×高 ≤ 2,359,296 |
| ~~`response_format`~~ | — | — | — | **传入返回 400**，返回值固定为 `b64_json` |
| ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **传入返回 400** |
| ~~`size`~~ | — | — | — | 本端点**静默忽略** |
| ~~`n`~~ | — | — | — | 本端点无效，恒出 1 张 |

<Info>
  `quality`、`output_format`、`background`、`style` 等 OpenAI 习惯字段会被静默忽略，输出恒为 PNG。
</Info>

## 响应格式

```json theme={null}
{
  "created": 1790999642,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zU..."
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "input_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **响应字段说明**

  * `b64_json` 是**纯 base64，不带 `data:image/png;base64,` 前缀**，可直接解码，解码后为 PNG。
  * 没有 `url` 字段，也不返回 `revised_prompt`。
  * 1024×1024 的 PNG 约 1.5–1.7 MB，base64 后响应体约 2.1–2.3 MB；1536×1536 约 4–5 MB，注意客户端的响应体大小限制。
</Warning>

<Info>
  **`usage` 不能用来核账**：`prompt_tokens` 恒为 `1000 × 张数`、`output_tokens` 恒为 0，是占位值。本系列按张固定计费，真实扣费请以 API易 控制台账单为准。
</Info>


## OpenAPI

````yaml api-reference/mai-image-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: MAI-Image 2.6 文生图 API
  description: >
    微软 MAI-Image 2.6 图像生成模型 — 文生图接口。


    -
    两个模型：`MAI-Image-2.6`（旗舰，\$0.12/张）、`MAI-Image-2.6-Flash`（快速，\$0.06/张），模型名大小写敏感

    - 按次固定计费，**不区分尺寸**

    - 尺寸用 `width` + `height`（整数、成对）：每维 ≥ 768，宽×高 ≤ 2,359,296

    - 每次固定返回 1 张 PNG，`data[0].b64_json`（纯 base64，无 `data:` 前缀）


    **⚠️ 不要传 `response_format` / `seed` / `negative_prompt`**：三者都会返回 400。

    `size` 在本端点被静默忽略。


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
security:
  - bearerAuth: []
paths:
  /v1/images/generations:
    post:
      tags:
        - 文生图
      summary: 文生图：根据文本提示词生成图片
      description: |
        使用 MAI-Image 2.6 模型根据文本提示词生成图片。

        - 必填：`model`、`prompt`
        - 可选：`width`、`height`（必须成对，不传默认 1024×1024）
        - 非 16 倍数的尺寸向下取整到 16 的倍数
        - `n` 无效，每次固定 1 张；要多张请并发请求
      operationId: generateMaiImageTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MaiImageGenerateRequest'
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            参数非法（尺寸越界 `unsupported_request_value`、传了不支持的参数
            `invalid_request`），或内容被审核拦截（`content_safety_violation`）
        '401':
          description: 未授权 - API Key 无效
        '404':
          description: 请求发到了 chat / responses 端点，本系列只支持 Images API
        '429':
          description: 请求频率超限或额度不足
        '503':
          description: 模型名大小写错误，或当前分组无可用渠道
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: 模型 ID（大小写敏感）。2.6 画质优先，Flash 速度优先
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: 提示词，支持中英文。要出现在图里的文字用引号括起来
          example: 一家古风茶馆的门面，木质招牌上写着「API易 欢迎」，红灯笼，黄昏暖光，写实摄影
        width:
          type: integer
          description: |
            输出宽度（像素）。每维 ≥ 768，宽×高 ≤ 2,359,296（1536×1536 面积），
            必须与 `height` 成对传入；非 16 倍数向下取整。
          minimum: 768
          default: 1024
          example: 1024
        height:
          type: integer
          description: 输出高度（像素），规则同 `width`
          minimum: 768
          default: 1024
          example: 1024
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: 创建时间戳
          example: 1790999642
        data:
          type: array
          description: 图片结果数组，文生图固定 1 项
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: '纯 base64 图片数据（PNG，不带 data: 前缀）'
        usage:
          type: object
          description: |
            **占位值，不能用于核账。** `prompt_tokens` 恒为 `1000 × 张数`、`output_tokens` 恒为 0。
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.