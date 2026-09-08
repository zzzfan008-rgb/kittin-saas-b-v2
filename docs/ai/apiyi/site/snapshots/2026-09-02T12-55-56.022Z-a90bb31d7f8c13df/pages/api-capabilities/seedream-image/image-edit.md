> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片编辑 API 参考

> Seedream 图片编辑 / 多图融合 / 批量序列生成 API 参考与在线调试 — 同 generations 端点，传入 image 数组与 sequential_image_generation 切换模式

<Info>
  **同端点，不同模式**：Seedream 没有独立的 `/v1/images/edits` 端点，编辑 / 多图融合 / 批量序列都走 `POST /v1/images/generations`。本页 Playground 与 [文生图页](/api-capabilities/seedream-image/text-to-image) 调的是同一个端点，区别只在请求体的 `image` 与 `sequential_image_generation` 参数。
</Info>

<Tip>
  **场景说明**：

  * **单图编辑** —— `image: ["url"]` + `sequential_image_generation: "disabled"`
  * **多图融合** —— `image: ["url1", "url2", ...]` + `sequential_image_generation: "disabled"`
  * **批量序列生成** —— `sequential_image_generation: "auto"` + `sequential_image_generation_options.max_images: N`
  * **图生序列** —— 上面两个组合：传 `image` 数组 + `auto` + `max_images`
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制（仅 b64\_json 模式）**

  默认 `response_format: "url"` 模式下 Playground 工作正常（响应只是一个 BytePlus TOS 临时链接）。如果你切换成 `response_format: "b64_json"`，响应会包含数 MB 的 base64 字符串，浏览器 Playground **可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法显示这么长的 base64。

  **推荐做法**：

  * 只想看图：**保持默认 `url` 模式**，Playground 会直接返回链接（注意 24 小时内下载到自己的存储）。
  * 真的需要 b64\_json：**复制下方"代码示例"到本地运行**，代码会自动解码并把图片保存为本地文件。
</Warning>

<Warning>
  **⚠️ 关键差异（与 OpenAI gpt-image-2 的图编辑不同）**

  * **不接受 multipart/form-data 上传文件** —— 请把图片传到 OSS / 公网图床拿到 URL，再放进 `image` 数组
  * **`image` 是 URL 数组**，**不是** `image[]` 字段重复（与 OpenAI `gpt-image-2` 的 `multipart/form-data` 格式完全不同）
  * **没有 `mask` 字段** —— Seedream 不支持 alpha 通道掩码局部重绘，整图 prompt 改写
  * **总张数硬约束**：输入参考图 + 输出图 **≤ 15 张**
</Warning>

<Warning>
  **📎 多图融合顺序有意义**

  `image` 数组的顺序会作为 prompt 中「图1/图2/图3」的引用依据。建议在 prompt 中显式指代：

  > Replace the clothing in image 1 with the outfit from image 2, keeping the lighting from image 3.

  推荐 prompt 用英文（官方训练以英文为主），中文也可用但表达不要含糊。
</Warning>

## 代码示例

<Note>
  **关于 `extra_body`（重要，别被「套一层」误导）**

  `image`、`sequential_image_generation`、`watermark` 不是 OpenAI SDK `images.generate()` 的标准参数，所以在 Python SDK 里**必须**放进 `extra_body` 才能传出去。

  但 `extra_body` 只是 SDK 的传参容器——里面的字段会被**平铺合并到请求体顶层**，和 `model`、`prompt` **同一层级**。最终发出去的 JSON 跟下方 cURL 示例完全一致（`image` 就在顶层），**并不会**真的多出一层 `"extra_body": {...}` 嵌套。

  如果你不用 OpenAI SDK、而是直接拼 JSON（requests / fetch 等），就**不要**写 `extra_body`，直接把 `image` 等字段放到与 `model` 同级即可。
</Note>

### Python（OpenAI SDK · 单图编辑）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="Generate a close-up image of a dog lying on lush grass.",
    size="2K",
    response_format="url",
    # extra_body 里的字段会被 SDK 平铺到请求体顶层（与 model 同级），不是真的多嵌套一层
    extra_body={
        "image": ["https://your-oss.example.com/source-photo.png"],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python（OpenAI SDK · 多图融合）

```python theme={null}
resp = client.images.generate(
    model="seedream-4-5-251128",
    prompt="Replace the clothing in image 1 with the outfit from image 2, keeping the lighting style of image 3.",
    size="4K",
    response_format="url",
    extra_body={
        "image": [
            "https://your-oss.example.com/person.png",
            "https://your-oss.example.com/outfit.png",
            "https://your-oss.example.com/lighting-ref.png",
        ],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python（OpenAI SDK · 批量序列生成）

```python theme={null}
resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt=(
        "Generate four cinematic sci-fi storyboard scenes:"
        "Scene 1 — astronaut repairing a spacecraft;"
        "Scene 2 — meteor strike in deep space;"
        "Scene 3 — emergency dodge in zero gravity;"
        "Scene 4 — astronaut returning to ship."
    ),
    size="2K",
    response_format="url",
    extra_body={
        "sequential_image_generation": "auto",
        "sequential_image_generation_options": {"max_images": 4},
        "watermark": False,
    }
)

for item in resp.data:
    print(item.url)
```

### cURL（多图融合）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "Replace the clothing in image 1 with the outfit from image 2.",
    "image": [
      "https://your-oss.example.com/person.png",
      "https://your-oss.example.com/outfit.png"
    ],
    "sequential_image_generation": "disabled",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js（原生 fetch · 批量序列）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'A four-panel comic about a cat astronaut: launch, space walk, alien encounter, return home.',
        size: '2K',
        sequential_image_generation: 'auto',
        sequential_image_generation_options: { max_images: 4 },
        response_format: 'url',
        watermark: false
    })
});

const { data } = await resp.json();
data.forEach((item, i) => console.log(`#${i + 1}:`, item.url));
```

## 参数说明速查

| 字段                                               | 类型              | 必填        | 默认         | 说明                                                                                                              |
| ------------------------------------------------ | --------------- | --------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| `model`                                          | string          | 是         | —          | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628`（专业版，\$0.12/次） |
| `prompt`                                         | string          | 是         | —          | 编辑 / 融合 / 序列指令                                                                                                  |
| `image`                                          | array of string | 否（编辑场景必填） | —          | 参考图数组，元素为 URL 或 base64 data URI（`data:image/jpeg;base64,...`，已实测），**最多 10 张**（4.5 / 5.0-pro 官方明确）               |
| `sequential_image_generation`                    | string          | 否         | `disabled` | `disabled` 单图输出；`auto` 批量序列输出。**5.0-pro 不支持：传任何值（含 `disabled`）都返回 400，用 pro 时请勿传此参数**                           |
| `sequential_image_generation_options.max_images` | integer         | 否         | —          | 仅 `auto` 模式生效，输出张数（受 **输入+输出 ≤ 15** 总约束）。5.0-pro 同样不可传                                                          |
| `size`                                           | string          | 否         | `2K`       | 预设档位或精确像素，**各版本支持档位见 overview**                                                                                 |
| `response_format`                                | string          | 否         | `url`      | `url` / `b64_json`                                                                                              |
| `output_format`                                  | string          | 否         | `jpeg`     | 5.0 / 5.0-pro 支持 `png` / `jpeg`；4.5 / 4.0 仅 `jpeg`                                                              |
| `watermark`                                      | boolean         | 否         | 见版本默认      | 商用建议 `false`                                                                                                    |
| `stream`                                         | boolean         | 否         | `false`    | 流式输出，长 prompt 时建议开。**5.0-pro 不支持，传入即 400**                                                                      |

## 多图与批量场景的张数约束

| 场景        | 输入 `image` 张数 | `max_images` | 实际输出 | 总和约束         |
| --------- | ------------- | ------------ | ---- | ------------ |
| 单图编辑      | 1             | —            | 1    | 2 ≤ 15 ✅     |
| 多图融合      | 3             | —            | 1    | 4 ≤ 15 ✅     |
| 多图融合 + 序列 | 3             | 4            | 4    | 7 ≤ 15 ✅     |
| 多图融合 + 序列 | 10            | 6            | 6    | 16 > 15 ❌ 报错 |

<Tip>
  **多轮迭代**：把上一次的输出 URL 作为下一次的 `image` 输入，配合新的编辑指令逐步精调。每一轮都按张计费，预算时留意累计成本。
</Tip>

## 响应格式

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../scene-1.png",
      "size": "2048x2048"
    },
    {
      "url": "https://...scene-2.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 2,
    "output_tokens": 12480,
    "total_tokens": 12480
  }
}
```

<Warning>
  **⚠️ `data` 数组长度反映实际输出张数**

  * `sequential_image_generation: "disabled"` → `data` 单元素
  * `sequential_image_generation: "auto"` + `max_images: N` → `data` 通常 N 个元素（个别 prompt 模型可能输出少于 N）
  * 计费按 `usage.generated_images` 实际张数算，**不是按 `max_images`**
</Warning>

<Info>
  编辑请求和文生图请求**计费完全一致**——按出图张数算。多图输入（参考图）不额外计费。
</Info>


## OpenAPI

````yaml api-reference/seedream-image-edit-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream 图片编辑 / 多图融合 / 批量序列 API
  description: >
    BytePlus 火山方舟 Seedream 系列图像生成模型 — 编辑 / 多图融合 / 批量序列接口。


    **重要**：Seedream 没有独立的 `/v1/images/edits` 端点，编辑 / 多图 / 序列都走 `POST
    /v1/images/generations`，区别只在请求体的 `image` 与 `sequential_image_generation` 参数。


    - 单图编辑：`image: ["url"]` + `sequential_image_generation: "disabled"`

    - 多图融合：`image: ["url1", "url2", ...]` + `disabled`（最多 10 张参考图）

    - 批量序列：`sequential_image_generation: "auto"` + `max_images`

    - 总约束：**输入参考图 + 输出图 ≤ 15 张**


    与 OpenAI gpt-image-2 不同：本接口**不接受 multipart/form-data**，请把图片传到 OSS / 公网图床后用
    URL 数组传入。


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`
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
        - 图片编辑
      summary: 图片编辑 / 多图融合 / 批量序列
      description: |
        基于参考图（`image` URL 数组）+ 编辑指令生成新图，或开启批量序列模式输出多张连贯图像。

        - 单图编辑场景：传 1 张 image + disabled
        - 多图融合场景：传多张 image + disabled，prompt 中用「图1/图2」指代
        - 批量序列场景：传或不传 image + auto + max_images
      operationId: editSeedreamImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamEditRequest'
            example:
              model: seedream-5-0-260128
              prompt: Replace the clothing in image 1 with the outfit from image 2.
              image:
                - https://your-oss.example.com/person.png
                - https://your-oss.example.com/outfit.png
              sequential_image_generation: disabled
              size: 2K
              response_format: url
              watermark: false
      responses:
        '200':
          description: 成功生成编辑后图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: 参数非法（image 数组超 10、输入+输出超 15、size 不支持等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截
        '404':
          description: image 数组中的 URL 无法访问
        '429':
          description: 触发 500 RPM 限流或余额不足
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamEditRequest:
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
          description: 编辑 / 融合 / 序列指令。多图场景建议用「图1/图2」明确指代顺序
          example: Replace the clothing in image 1 with the outfit from image 2.
        image:
          type: array
          items:
            type: string
            format: uri
          description: 参考图 URL 数组。**最多 10 张**（4.5 官方明确）。注意输入 + 输出张数总和 ≤ 15
          maxItems: 10
          example:
            - https://your-oss.example.com/person.png
            - https://your-oss.example.com/outfit.png
        sequential_image_generation:
          type: string
          description: 图像生成模式开关。disabled = 单图输出（默认）；auto = 批量序列输出，配合 max_images 指定张数
          enum:
            - disabled
            - auto
          default: disabled
        sequential_image_generation_options:
          type: object
          description: 批量序列生成选项，仅 sequential_image_generation=auto 时生效
          properties:
            max_images:
              type: integer
              description: 最大输出张数。受 输入参考图 + 输出图 ≤ 15 总约束
              minimum: 1
              maximum: 15
              example: 4
        size:
          type: string
          description: |
            输出尺寸。预设档位（各版本支持不同）：
            - `1K`（仅 4.0）/ `2K`（全版本）/ `3K`（仅 5.0）/ `4K`（4.5、4.0）

            或精确像素 `WxH`，总像素 ∈ \[1280×720, 4096×4096\]，宽高比 ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
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
        watermark:
          type: boolean
          default: false
        stream:
          type: boolean
          description: 流式输出。长 prompt 或多图序列场景建议开启
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          example: 1768518000
        data:
          type: array
          description: 生成结果数组。disabled 模式 1 个元素，auto 模式通常 max_images 个元素（实际可能少于）
          items:
            type: object
            properties:
              url:
                type: string
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/.../image.png
              b64_json:
                type: string
                description: '纯 base64 字符串，不含 data: 前缀'
              size:
                type: string
                example: 2048x2048
        usage:
          type: object
          description: 按 generated_images 实际张数计费，不是按 max_images
          properties:
            generated_images:
              type: integer
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