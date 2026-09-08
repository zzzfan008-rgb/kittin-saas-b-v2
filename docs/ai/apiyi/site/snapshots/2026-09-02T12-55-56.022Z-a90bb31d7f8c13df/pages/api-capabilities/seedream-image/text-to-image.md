> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生图 API 参考

> Seedream 文生图 API 参考与在线调试 — 纯文本提示词出图，支持 1K/2K/3K/4K 与精确像素，三版本统一端点

<Info>
  右侧的交互式 Playground 支持直接在线调试。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），输入 prompt、选择 model / size 后一键发送即可。
</Info>

<Tip>
  **场景说明**：本页用于「纯文本提示词生成图片」——不传 `image` 字段。如需基于参考图编辑、多图融合或批量序列生成，请使用 [图片编辑接口](/api-capabilities/seedream-image/image-edit)（同一端点，多传 `image` 参数）。
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制（仅 b64\_json 模式）**

  默认 `response_format: "url"` 模式下 Playground 工作正常（响应只是一个 BytePlus TOS 临时链接）。如果你切换成 `response_format: "b64_json"`，响应会包含数 MB 的 base64 字符串，浏览器 Playground **可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法显示这么长的 base64。

  **推荐做法**：

  * 只想看图：**保持默认 `url` 模式**，Playground 会直接返回链接（注意 24 小时内下载到自己的存储）。
  * 真的需要 b64\_json：**复制下方"代码示例"到本地运行**，代码会自动解码并把图片保存为本地文件。
</Warning>

<Warning>
  **⚠️ 各版本支持的分辨率档位不同**

  * `seedream-5-0-pro-260628` —— 预设 `1K` / `2K` + 精确 WxH 总像素 ≤ 4.19M（16:9 最长边可达 2720×1530，实测可用；无 3K/4K 预设；不支持 `sequential_image_generation` / `stream`，传入即 400；约 2 分钟出图）
  * `seedream-5-0-260128` —— 仅 `2K` / `3K`（无 4K）
  * `seedream-4-5-251128` —— `2K` / `4K`
  * `seedream-4-0-250828` —— `1K` / `2K` / `4K`

  **不支持的尺寸会直接返回 400**。精确像素总像素需 ∈ \[1280×720, 4096×4096]，宽高比 ∈ \[1/16, 16]。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

## 代码示例

### Python（OpenAI SDK 直连）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="A modern tech product launch poster with bold typography, sleek smartphone on gradient background, text: 'Innovation 2026', ultra detailed, professional",
    size="2K",
    response_format="url",
    extra_body={
        "output_format": "png",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python（原生 requests）

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
        "model": "seedream-5-0-260128",
        "prompt": "A serene Japanese garden with cherry blossoms, koi pond, traditional wooden bridge, golden hour, ultra detailed",
        "size": "2K",
        "response_format": "url",
        "watermark": False
    },
    timeout=60  # 单图约 15 秒，4K + hd 可达 30-60 秒
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "A futuristic cityscape at night with neon lights and flying vehicles, cyberpunk style, high detail",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js（原生 fetch）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Minimalist line-art logo of a cat, monochrome, vector style',
        size: '2K',
        response_format: 'url',
        output_format: 'png',
        watermark: false
    })
});

const { data } = await resp.json();
console.log(data[0].url);
```

### 浏览器 JavaScript

```javascript theme={null}
{/* 仅作演示，生产请走后端代理避免 Key 泄露 */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Watercolor northern lights over snowy mountains',
        size: '2K'
    })
});

const { data } = await resp.json();
document.getElementById('img').src = data[0].url;
```

## 参数说明速查

| 参数                | 类型      | 必填 | 默认      | 说明                                                                                                                                              |
| ----------------- | ------- | -- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string  | 是  | —       | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628`（专业版，\$0.12/次）                                 |
| `prompt`          | string  | 是  | —       | 提示词，支持中英文，建议详细描述场景、风格、光线                                                                                                                        |
| `size`            | string  | 否  | `2K`    | 预设档位（各版本不同）或精确像素 `WxH`                                                                                                                          |
| `response_format` | string  | 否  | `url`   | `url` 返回图片链接；`b64_json` 返回纯 base64 字符串                                                                                                          |
| `output_format`   | string  | 否  | `jpeg`  | 5.0 支持 `png` / `jpeg`；4.5 / 4.0 仅 `jpeg`（OpenAI SDK 中通过 `extra_body` 传入）                                                                        |
| `n`               | integer | —  | —       | ⚠️ **上游不支持此参数**：传入会被静默忽略，仍只返回 1 张、按 1 张计费。多图输出请用 `sequential_image_generation`（按实际张数计费），见 [图片编辑接口](/api-capabilities/seedream-image/image-edit) |
| `seed`            | integer | —  | —       | ⚠️ 官方仅 seedream-3-0-t2i 支持该参数，当前 4.x / 5.x 系列传入不生效                                                                                              |
| `watermark`       | boolean | 否  | 见各版本默认  | 是否输出水印（建议显式 `false` 商用）                                                                                                                         |
| `stream`          | boolean | 否  | `false` | 流式输出，适合长 prompt + 高分辨率                                                                                                                          |

<Tip>
  详细的参数约束、可选值、示例请查看右侧 Playground 中的字段说明，所有 enum 字段均支持下拉选择。**编辑/多图相关参数（`image`、`sequential_image_generation` 等）见 [图片编辑接口](/api-capabilities/seedream-image/image-edit)**。
</Tip>

## 响应格式

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 1,
    "output_tokens": 6240,
    "total_tokens": 6240
  }
}
```

<Warning>
  **⚠️ 响应字段陷阱**

  * `response_format=url` 模式下，`data[].url` 是 **BytePlus TOS 临时签名 URL**，有时效性（通常 24 小时内有效），生产场景建议拿到后立即下载到自己的存储
  * `response_format=b64_json` 模式下，`data[].b64_json` 是 **纯 base64 字符串**，**不含** `data:image/...;base64,` 前缀，客户端需 `base64.b64decode` 写文件，或浏览器渲染时自行拼前缀
  * `data[].size` 字段反映**实际输出尺寸**，可能与请求的 `size` 略有差异（模型按比例约束）
</Warning>

<Info>
  `usage` 字段反映本次实际计费的张数（`generated_images`）。Seedream 按张计费，`output_tokens` / `total_tokens` 仅用于性能观测，不参与账单核算。
</Info>


## OpenAPI

````yaml api-reference/seedream-image-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream 文生图 API
  description: >
    BytePlus 火山方舟 Seedream 系列图像生成模型 — 文生图接口（不传 `image` 字段）。


    - 活跃版本统一接入：`seedream-5-0-260128` / `seedream-4-5-251128` /
    `seedream-4-0-250828` / `seedream-5-0-pro-260628`（专业版，按次 \$0.12，约 2 分钟出图）

    - 各版本支持的分辨率档位不同（5.0：2K/3K；4.5：2K/4K；4.0：1K/2K/4K；5.0-pro：1K/2K + WxH 总像素 ≤
    4.19M，16:9 最长边约 2720）

    - 输出格式：5.0 / 5.0-pro 支持 png / jpeg；4.5 / 4.0 仅 jpeg

    - 5.0-pro 不支持 `sequential_image_generation` / `stream`，传入即 400

    - 速度约 15 秒/张，4K + hd 可达 30-60 秒

    - 默认 500 张/分钟（RPM）

    - 编辑、多图融合、批量序列生成请见
    [图片编辑接口](/api-capabilities/seedream-image/image-edit)（同端点不同参数）


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
      description: >
        使用 Seedream 系列模型根据文本提示词生成图片。


        - 必填：`model`、`prompt`

        - 可选：`size`、`response_format`、`output_format`、`watermark`、`stream`

        - 注意：OpenAI 的 `n` 参数上游不支持（传入被静默忽略，仍返回 1 张）；多图输出请用
        `sequential_image_generation`

        - 各版本支持的分辨率档位不同，详见
        [总览页技术规格表](/api-capabilities/seedream-image/overview#技术规格)

        - 如需基于参考图编辑或多图融合，请使用
        [图片编辑接口](/api-capabilities/seedream-image/image-edit)，同一端点 + `image` /
        `sequential_image_generation` 参数
      operationId: generateSeedreamTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamGenerateRequest'
            example:
              model: seedream-5-0-260128
              prompt: >-
                A modern tech product launch poster, sleek smartphone on
                gradient background, text: 'Innovation 2026', ultra detailed,
                professional
              size: 2K
              response_format: url
              output_format: png
              watermark: false
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: 参数非法（size 不在该版本支持档位、超出像素范围、宽高比超限等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截
        '429':
          description: 触发 500 RPM 限流或余额不足
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: 模型 ID
          enum:
            - seedream-5-0-260128
            - seedream-5-0-lite-260128
            - seedream-4-5-251128
            - seedream-4-0-250828
            - seedream-5-0-pro-260628
          default: seedream-5-0-260128
        prompt:
          type: string
          description: 提示词，支持中英文。建议详细描述场景、风格、光线
          example: >-
            A serene Japanese garden with cherry blossoms, koi pond, traditional
            bridge, golden hour, ultra detailed
        size:
          type: string
          description: |
            输出尺寸。预设档位（各版本支持不同）：
            - `1K`（约 1024×1024）：仅 4.0
            - `2K`（约 2048×2048）：5.0 / 4.5 / 4.0
            - `3K`（约 3072×3072）：仅 5.0
            - `4K`（约 4096×4096）：4.5 / 4.0

            或精确像素 `WxH`，总像素 ∈ \[1280×720, 4096×4096\]，宽高比 ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
          description: '返回格式。url 返回临时签名链接（24 小时有效）；b64_json 返回纯 base64 字符串（不带 data: 前缀）'
          enum:
            - url
            - b64_json
          default: url
        output_format:
          type: string
          description: 输出格式。5.0 支持 png / jpeg；4.5 / 4.0 仅 jpeg
          enum:
            - png
            - jpeg
          default: jpeg
        seed:
          type: integer
          description: 随机种子。注意：官方仅 seedream-3-0-t2i 支持，当前 4.x / 5.x 系列传入不生效
          example: 42
        watermark:
          type: boolean
          description: 是否输出带 BytePlus 水印的图片。商用场景建议显式 false
          default: false
        stream:
          type: boolean
          description: 是否启用流式输出。长 prompt + 高分辨率场景建议开启
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          description: 本次实际调用的模型 ID
          example: seedream-5-0-260128
        created:
          type: integer
          description: Unix 时间戳
          example: 1768518000
        data:
          type: array
          description: 生成结果数组（文生图通常 1 个元素）
          items:
            type: object
            properties:
              url:
                type: string
                description: 图片 URL（response_format=url 时返回，临时签名 24 小时有效）
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png
              b64_json:
                type: string
                description: >-
                  纯 base64 字符串（response_format=b64_json 时返回，**不含**
                  data:image/...;base64, 前缀）
              size:
                type: string
                description: 实际输出尺寸，可能与请求略有差异（按比例约束修正）
                example: 2048x2048
        usage:
          type: object
          description: 本次调用计费张数与 token 用量
          properties:
            generated_images:
              type: integer
              description: 实际计费张数（按张计费）
              example: 1
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6240
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````