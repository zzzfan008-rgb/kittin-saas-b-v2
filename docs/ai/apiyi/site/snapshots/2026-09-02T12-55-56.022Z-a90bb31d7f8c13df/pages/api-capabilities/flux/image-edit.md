> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片编辑 API 参考

> FLUX 图片编辑 API 参考与在线调试 — 上传参考图（最多 8 张）+ 指令进行单图改图、多图融合，FLUX.2 全系列 + FLUX.1 Kontext 通用

<Info>
  右侧的交互式 Playground：在 **Authorization** 中填入 API Key（格式：`Bearer sk-xxx`），把参考图的**公网 URL** 填到 `input_image`，多图融合继续填 `input_image_2` … `input_image_8`，然后填 `prompt`、`model` 一键发送即可。Playground 只支持 URL 输入；如需用 base64 data URL，请复制下方代码示例到本地调试。
</Info>

<Tip>
  **场景说明**：本页用于「基于一张或多张参考图改图 / 多图融合」。FLUX 图片编辑支持两种方式：

  * **方式 A（本页 Playground，推荐）**：JSON + `input_image` 发 `/v1/images/generations`（与文生图共用端点，传入 `input_image` 即触发编辑模式），适用全部 FLUX 模型（含 Kontext，已实测），支持多图融合（`input_image_2` \~ `input_image_8`）
  * **方式 B**：OpenAI 兼容 multipart 端点 `/v1/images/edits`（见下方「方式 B」章节），单图编辑，与 OpenAI SDK 的 `client.images.edit()` 直接兼容

  如需纯文本生成图片，请使用 [文生图接口](/api-capabilities/flux/text-to-image)。
</Tip>

<Warning>
  **⚠️ 关键差异 / 注意事项（方式 A）**

  * **端点路径**：`/v1/images/generations`（与文生图共用；另有 OpenAI 兼容的 `/v1/images/edits` 单图编辑端点，见方式 B）
  * **Content-Type**：`application/json`（方式 B 的 `/edits` 端点则为 `multipart/form-data`）
  * **所有参考图字段是字符串**：`input_image` / `input_image_2` … `input_image_8`，值为公网 URL（推荐）或 `data:image/...;base64,xxx` data URL
  * **多图上限因模型而异**：FLUX.2 \[pro/max/flex] 最多 **8 张**，FLUX.2 \[klein] 最多 **4 张**，FLUX.1 Kontext 系列原生只支持 **1 张**
  * **单张参考图 ≤ 20MB 或 20MP**，格式 `png` / `jpg` / `webp`
  * **输入分辨率**：最小 64×64，最大 4MP；dimensions 必须是 16 的倍数
  * **结果 URL 仅 10 分钟有效** — `data[0].url` 必须立即下载
  * **不传 `aspect_ratio` 时，输出尺寸自动匹配第一张输入图**
</Warning>

<Warning>
  **📎 多图融合顺序有意义**

  `input_image` / `input_image_2` / `input_image_3` … 的编号 **就是 prompt 中「image 1 / image 2 / image 3」的引用依据**。建议在 prompt 中显式指代，例如：

  > Place the person from image 1 into the scene from image 2, applying the color palette of image 3.

  每张图必须为可公网访问的 URL（推荐 ≤ 20MB），或 `data:image/png;base64,xxx` 格式 base64 data URL。
</Warning>

## 代码示例

### cURL（双图融合 · URL）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "自然融合这两个图片",
    "input_image": "https://static.apiyi.com/apiyi-logo.png",
    "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL（三图融合 · URL）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "The person from image 1 is petting the cat from image 2, the bird from image 3 is next to them",
    "input_image": "https://example.com/person.jpg",
    "input_image_2": "https://example.com/cat.jpg",
    "input_image_3": "https://example.com/bird.jpg",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL（单图编辑 · Kontext）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-kontext-pro",
    "prompt": "Convert this architectural photo into a pencil sketch style, preserve all structural details",
    "input_image": "https://your-oss.example.com/architecture.jpg"
  }'
```

### cURL（本地文件 · base64 data URL）

```bash theme={null}
# 先把本地图片转为 base64 data URL（macOS / Linux）
B64=$(base64 -w0 < person.png 2>/dev/null || base64 < person.png | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg img "data:image/png;base64,$B64" '{
    model: "flux-2-pro",
    prompt: "把图1风格化为油画",
    input_image: $img
  }')"
```

### Python（requests · 双图融合）

```python theme={null}
import requests

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "自然融合这两个图片",
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
    timeout=120,
)
image_url = resp.json()["data"][0]["url"]

# data[0].url 仅 10 分钟有效，立即下载
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python（requests · 本地文件 base64）

```python theme={null}
import base64, requests, mimetypes

def to_data_url(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return f"data:{mime};base64,{b64}"

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "把图1人物放进图2场景",
        "input_image": to_data_url("person.png"),
        "input_image_2": "https://your-oss.example.com/scene.jpg",
    },
    timeout=120,
)
print(resp.json()["data"][0]["url"])
```

### Python（OpenAI SDK · extra\_body 注入 input\_image）

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# OpenAI SDK 的 images.generate() 走 /v1/images/generations + JSON，
# BFL 原生字段通过 extra_body 直接拼到 JSON 请求体里
resp = client.images.generate(
    model="flux-2-pro",
    prompt="自然融合这两个图片",
    extra_body={
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
)
image_url = resp.data[0].url
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Node.js（fetch · 多图融合）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sk-your-api-key',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: '自然融合这两个图片',
        input_image: 'https://static.apiyi.com/apiyi-logo.png',
        input_image_2: 'https://images.unsplash.com/photo-1762138012600-2ab523f8b35a',
        seed: 42,
        output_format: 'jpeg',
    }),
});

const { data } = await resp.json();
const img = await fetch(data[0].url);
const fs = await import('node:fs');
fs.writeFileSync('fused.jpg', Buffer.from(await img.arrayBuffer()));
```

## 方式 B：OpenAI 兼容编辑端点（multipart）

除上述 JSON 方式外，FLUX 图片编辑也支持 OpenAI Images API 的标准编辑端点，与 `client.images.edit()` 直接兼容（2026-07-04 实测 `flux-kontext-max` 成功出图）：

* **端点**：`POST https://api.apiyi.com/v1/images/edits`
* **Content-Type**：`multipart/form-data`（使用 SDK 或 curl `-F` 时自动设置，**不要手动指定**，否则 boundary 丢失会导致解析失败）

<Note>
  FLUX.1 Kontext 系列仅支持单张输入图；多图融合请使用方式 A（`input_image` \~ `input_image_8`）。方式 B 目前已实测 Kontext 系列可用。
</Note>

### 请求参数（form 字段）

| 字段                 | 类型      | 必填 | 说明                                                                        |
| ------------------ | ------- | -- | ------------------------------------------------------------------------- |
| `model`            | string  | ✓  | 如 `flux-kontext-max` / `flux-kontext-pro`                                 |
| `prompt`           | string  | ✓  | 编辑指令                                                                      |
| `image`            | file    | ✓  | 原图二进制文件（png/jpg/webp，≤ 20MB）。**字段名必须是 `image`**，缺失时返回 `image is required` |
| `aspect_ratio`     | string  | ✗  | 如 `1:1` / `16:9`，form 顶层字段直接传；OpenAI SDK 用户通过 `extra_body` 传入             |
| `safety_tolerance` | integer | ✗  | 0（最严）– 6（最宽松）                                                             |

### cURL 示例

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=flux-kontext-max" \
  -F "prompt=换一套时装" \
  -F "aspect_ratio=16:9" \
  -F "image=@input.jpg"
```

### Python（OpenAI SDK）示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

result = client.images.edit(
    model="flux-kontext-max",
    image=open("input.jpg", "rb"),
    prompt="换一套时装",
    extra_body={"aspect_ratio": "16:9"},  # FLUX 特有参数通过 extra_body 传递
)
print(result.data[0].url)
```

### Node.js（fetch + FormData）示例

```javascript theme={null}
const form = new FormData();
form.append('model', 'flux-kontext-max');
form.append('prompt', '换一套时装');
form.append('aspect_ratio', '16:9');
form.append('image', imageBlob, 'input.jpg'); // 浏览器 Blob 或 Node 的 fs.openAsBlob()

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    // 注意：不要手动设置 Content-Type，让运行时自动生成 multipart boundary
    body: form,
});
const data = await resp.json();
console.log(data.data[0].url);
```

响应格式与方式 A 相同（`data[0].url`，BFL 签名 URL 10 分钟有效，生产环境请服务端转存）。

### 两种方式如何选？

|      | 方式 A（JSON `input_image`） | 方式 B（multipart `/edits`）                   |
| ---- | ------------------------ | ------------------------------------------ |
| 适合   | 直接发 HTTP / 前端应用 / 多图融合   | 已有 OpenAI SDK 代码、`client.images.edit()` 迁移 |
| 多图   | 支持（flux-2 最多 8 张）        | 仅单图                                        |
| 图片形式 | 公网 URL 或 base64 data URL | 二进制文件                                      |

## 参数说明速查

| 字段                                 | 类型      | 必填 | 默认      | 说明                                                                                                        |
| ---------------------------------- | ------- | -- | ------- | --------------------------------------------------------------------------------------------------------- |
| `model`                            | string  | 是  | —       | FLUX 模型 ID，多图融合推荐 `flux-2-pro` / `flux-2-max`，单图改图也可用 `flux-kontext-max` / `flux-kontext-pro`             |
| `prompt`                           | string  | 是  | —       | 编辑 / 融合指令，最长 32K tokens；多图场景用「image 1 / image 2 / image 3」指代 image / input\_image\_2 / input\_image\_3 顺序 |
| `input_image`                      | string  | 是  | —       | 参考图 1。公网 URL（推荐）或 `data:image/...;base64,xxx` data URL                                                    |
| `input_image_2` \~ `input_image_8` | string  | 否  | —       | 第 2–8 张参考图，URL 或 data URL。FLUX.2 \[pro/max/flex] **最多 8 张**，\[klein] **4 张**，Kontext 不支持                  |
| `aspect_ratio`                     | string  | 否  | 跟随首图    | 例如 `1:1` / `16:9` / `9:16` / `4:3` / `3:2`                                                                |
| `seed`                             | integer | 否  | 随机      | 固定可复现                                                                                                     |
| `safety_tolerance`                 | integer | 否  | `2`     | 0（最严）– 6（最宽松）                                                                                             |
| `output_format`                    | string  | 否  | `jpeg`  | `jpeg` / `png`                                                                                            |
| `prompt_upsampling`                | boolean | 否  | `false` | 是否自动扩写 prompt                                                                                             |
| `steps`                            | integer | 否  | `50`    | **仅 `flux-2-flex`**，最大 50                                                                                 |
| `guidance`                         | number  | 否  | `4.5`   | **仅 `flux-2-flex`**，1.5–10                                                                                |

## 多图融合策略

<AccordionGroup>
  <Accordion icon="user" title="角色一致性（最多 8 张）">
    上传同一角色的多张照片作参考，模型会自动维持身份特征。适合广告系列、漫画分镜、时尚编辑。

    ```
    Eight consistent characters from the reference images,
    in a fashion editorial set on a Tokyo rooftop at golden hour
    ```
  </Accordion>

  <Accordion icon="palette" title="风格迁移">
    一张内容图 + 一张风格图，prompt 显式指代：

    ```
    Using the style of image 2, render the subject from image 1
    ```
  </Accordion>

  <Accordion icon="layers" title="对象组合">
    把多张图里的不同物体组合到一个新场景：

    ```
    The person from image 1 is petting the cat from image 2,
    the bird from image 3 is next to them
    ```
  </Accordion>

  <Accordion icon="shirt" title="服装/产品换样">
    把图1人物的上衣换成图2 的款式：

    ```
    Replace the top of the person in image 1 with the one from image 2,
    keep the pose and background unchanged
    ```
  </Accordion>
</AccordionGroup>

<Tip>
  **多轮迭代**：把上一次的 `data[0].url` 重新下载后作为下一次 `input_image` 输入，配合新指令逐步精调画面。每轮按张数计费。
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
  * **不开启 CORS**，浏览器 `fetch` 会被拦
  * 生产服务**必须**服务端代下载到自有 OSS / CDN
  * FLUX 编辑端点**不返回** `b64_json`，仅返回 url
</Warning>

<Info>
  编辑请求与文生图同价，按张数计费而非按 token。多图融合不会因图片数量加价（与 OpenAI gpt-image-2 编辑不同）。
</Info>

## 常见问题

<AccordionGroup>
  <Accordion title="报错 image is required (shell_api_error) 是什么原因？">
    请求到达了 `/v1/images/edits` 编辑端点（方式 B），但网关在请求体里找不到图片。常见原因：

    1. multipart 表单里没有 `image` 文件字段，或字段名写错（如 `image[]`、`file`）
    2. 手动设置了 `Content-Type: multipart/form-data` 但没带 boundary（用 SDK / fetch / curl 时不要手动设置该头）
    3. 客户端图片转换失败后仍发出了请求（检查 `image` 字段的实际字节数是否大于 0）
    4. 想用 JSON 方式传图却发到了 `/edits` 端点——JSON + `input_image` 请发 `/v1/images/generations`（方式 A）
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/flux-edit-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX 图片编辑 API
  description: >
    Black Forest Labs FLUX 模型族 — 图片编辑接口（apiyi 代理：`/v1/images/generations` 端点 +
    JSON body）。


    - **端点路径**：`POST /v1/images/generations`（FLUX 系列文生图与图片编辑共用同一端点；传入
    `input_image` 即触发编辑模式）

    - **Content-Type**：`application/json`（本 Playground 为 JSON 方式，推荐；另有 OpenAI
    兼容的 `/v1/images/edits` multipart 单图编辑端点，见文档页「方式 B」章节）

    - **参考图字段**：`input_image` / `input_image_2` … `input_image_8`，**值是公网 URL
    字符串**（也支持 `data:image/...;base64,xxx` 格式 base64 data URL，但 Playground 推荐填
    URL，base64 留给本地代码调试）

    - 多图融合：FLUX.2 [pro/max/flex] 最多 8 张，[klein] 最多 4 张，FLUX.1 Kontext 单图

    - 在 prompt 中用「image 1 / image 2 / image 3」对应 input_image / input_image_2 /
    input_image_3

    - 响应 `data[0].url` **仅 10 分钟有效**，需立即下载（CORS 关闭）


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
        - 图片编辑
      summary: 图片编辑：根据指令编辑或融合参考图
      description: >
        使用 FLUX 系列模型，根据文本指令对一张或多张参考图进行编辑、融合。


        - **接口路径与文生图共用 `/v1/images/generations`**（另有 OpenAI 兼容的
        `/v1/images/edits` multipart 单图编辑端点，见文档页「方式 B」章节）

        - 请求 Content-Type 为 `application/json`

        - **所有参考图字段是 URL 字符串**：`input_image`、`input_image_2` … `input_image_8`

        - 不传 `aspect_ratio` 时输出尺寸跟随首张输入图
      operationId: editFluxImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              model: flux-2-pro
              prompt: 自然融合这两个图片
              input_image: https://static.apiyi.com/apiyi-logo.png
              input_image_2: https://images.unsplash.com/photo-1762138012600-2ab523f8b35a
              seed: 42
              output_format: jpeg
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: 参数非法（input_image 缺失 / dimensions 非 16 倍数 / 超 4MP 等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截
        '413':
          description: 上传图片过大
        '429':
          description: 请求频率超限或额度不足
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - input_image
      properties:
        model:
          type: string
          description: >-
            FLUX 模型 ID。多图融合推荐 flux-2-pro / flux-2-max；单图改图也可用 flux-kontext-max /
            flux-kontext-pro
          enum:
            - flux-2-pro
            - flux-2-max
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-kontext-max
            - flux-kontext-pro
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            编辑/融合指令。多图场景用「image 1 / image 2 / image 3」指代 input_image /
            input_image_2 / input_image_3 顺序
          example: 自然融合这两个图片
        input_image:
          type: string
          description: >-
            参考图 1 的公网 URL（必填）。**Playground 直接填 URL**；本地代码调试也可传
            `data:image/png;base64,xxx` 形式的 base64 data URL
          example: https://static.apiyi.com/apiyi-logo.png
        input_image_2:
          type: string
          description: 参考图 2 的公网 URL（可选）
        input_image_3:
          type: string
          description: 参考图 3 的公网 URL（可选）
        input_image_4:
          type: string
          description: 参考图 4 的公网 URL（可选）
        input_image_5:
          type: string
          description: 参考图 5 的公网 URL（可选）
        input_image_6:
          type: string
          description: 参考图 6 的公网 URL（可选）
        input_image_7:
          type: string
          description: 参考图 7 的公网 URL（可选）
        input_image_8:
          type: string
          description: 参考图 8 的公网 URL（可选，仅 FLUX.2 [pro/max/flex] 支持到 8 张）
        aspect_ratio:
          type: string
          description: 宽高比，例如 1:1 / 16:9 / 9:16 / 4:3 / 3:4。不传则跟随首张输入图
        seed:
          type: integer
          description: 固定可复现
        safety_tolerance:
          type: integer
          description: 审核档位。0 最严格，6 最宽松，默认 2
          minimum: 0
          maximum: 6
        output_format:
          type: string
          description: 输出格式，默认 jpeg
          enum:
            - jpeg
            - png
        prompt_upsampling:
          type: boolean
          description: 是否自动扩写 prompt，默认 false
        steps:
          type: integer
          description: '**仅 flux-2-flex**。推理步数，默认 50'
          minimum: 1
          maximum: 50
        guidance:
          type: number
          description: '**仅 flux-2-flex**。引导强度，默认 4.5'
          minimum: 1.5
          maximum: 10
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
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
                  delivery-us.bfl.ai，CORS 关闭
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````