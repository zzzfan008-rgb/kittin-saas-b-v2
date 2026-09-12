> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片编辑 API 参考

> Grok Imagine 2 图片编辑 API 参考与在线调试 — 上传参考图（1-4 张）+ 指令进行改图或多图融合，必须使用 multipart/form-data

<Info>
  右侧的交互式 Playground 支持直接上传本地图片。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），选择 `image` 文件并填入 `prompt`、`model` 后一键发送即可。
</Info>

<Warning>
  **🔴 本接口必须使用 `multipart/form-data` 文件上传**

  发送 JSON 到 `/v1/images/edits` 会**固定返回 400**：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **如果你是照着 xAI / 上游厂商的文档接入的，请特别注意**：上游文档写的是 JSON + 公网图片 URL 的形式（`{"image": {"type": "image_url", "url": "..."}}`），这套写法在 API易 网关上**走不通**，请以本页为准。

  好消息是文件上传**不需要图床**——直接传本地文件即可，比准备公网 URL 更省事。

  文件字段名只能是 **`image`** 或 **`image[]`**；写成 `images` / `image_file` 会返回 **415**。`prompt` 必填，缺失返回 400。
</Warning>

<Tip>
  **场景说明**：本页用于「基于一张或多张参考图改图 / 多图融合」。如需纯文本生成图片，请使用 [文生图接口](/api-capabilities/grok-imagine-image/text-to-image)。
</Tip>

<Warning>
  **⚠️ 输出画幅跟随「第一张」参考图，改不了**

  `resolution` 与 `aspect_ratio` 在本端点传入**不报错也不生效**——编辑结果的尺寸恒等于**第一张参考图的尺寸**（输入 1280×720 就输出 1280×720，输入 1024×1024 就输出 1024×1024）。

  多图融合时同理：实测把 4 张的顺序完全颠倒，输出画幅就从 1280×720 变成 1024×1024，**跟着新的第一张走**。

  需要改变输出画幅，请**先自行裁剪或缩放第一张参考图**再上传。
</Warning>

<Info>
  **多图融合顺序有意义**：`image[]` 可重复传入 **1–4 张**参考图（实测上限 4 张，传 5 张返回 400），**上传顺序就是提示词中「图1 / 图2 / 图3」的引用依据**。建议在提示词里显式指代，例如「把图1的主体放进图2的场景，沿用图2的画风」。

  实测 2 / 3 / 4 张递进验证：**每多传一张，输出就多一个对应主体**，各自的鲜明特征都会保留，融合是真实生效的。
</Info>

## 代码示例

### Python（OpenAI SDK · 单图编辑）

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0
)

# SDK 的 images.edit 内部就是 multipart 文件上传，直接传文件对象即可
resp = client.images.edit(
    model="grok-imagine-image",
    image=open("fox.jpg", "rb"),
    prompt="Change the scarf color to bright RED. Keep everything else exactly the same.",
    n=1
)

urllib.request.urlretrieve(resp.data[0].url, "edited.jpg")
```

### Python（原生 requests · 单图编辑）

```python theme={null}
import requests
import urllib.request

API_KEY = "sk-your-api-key"

# 关键：用 files= 传文件（requests 会自动设置 multipart/form-data 及 boundary）
# 千万不要用 json=，那会发成 application/json 并被网关 400 拒绝
with open("fox.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},  # 不要手动设 Content-Type
        data={
            "model": "grok-imagine-image",
            "prompt": "把围巾改成红色，其余部分完全保持不变",
            "n": 1,
            "response_format": "url"
        },
        files={"image": ("fox.jpg", fp, "image/jpeg")},
        timeout=360
    ).json()

urllib.request.urlretrieve(response["data"][0]["url"], "edited.jpg")
```

### Python（多图融合 · 1–4 张）

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

# 多张参考图用 image[] 重复字段传入，顺序即「图1 / 图2」
files = [
    ("image[]", ("character.jpg", open("character.jpg", "rb"), "image/jpeg")),
    ("image[]", ("scene.jpg", open("scene.jpg", "rb"), "image/jpeg")),
]

response = requests.post(
    "https://api.apiyi.com/v1/images/edits",
    headers={"Authorization": f"Bearer {API_KEY}"},
    data={
        "model": "grok-imagine-image",
        "prompt": "把图1的角色放进图2的场景里，沿用图2的画风和配色",
        "response_format": "url"
    },
    files=files,
    timeout=360
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
# 单图编辑：-F 即 multipart/form-data，@ 前缀表示上传本地文件
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image" \
  -F "prompt=把围巾改成红色，其余部分完全保持不变" \
  -F "n=1" \
  -F "response_format=url" \
  -F "image=@fox.jpg"
```

```bash theme={null}
# 多图融合：image[] 重复传入，顺序即「图1 / 图2」
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image-quality" \
  -F "prompt=把图1的角色放进图2的场景里，沿用图2的画风" \
  -F "image[]=@character.jpg" \
  -F "image[]=@scene.jpg"
```

### Node.js（原生 fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', '把围巾改成红色，其余部分完全保持不变');
form.append('n', '1');
form.append('response_format', 'url');
// 单图用 image；多图融合改用 image[] 重复 append（最多 4 张）
form.append('image', new Blob([fs.readFileSync('./fox.jpg')]), 'fox.jpg');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // 不要手动设 Content-Type，交给 FormData 自动带 boundary
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form,
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();
const img = await fetch(data.data[0].url);
fs.writeFileSync('edited.jpg', Buffer.from(await img.arrayBuffer()));
```

### 浏览器 JavaScript

```javascript theme={null}
// ⚠️ 仅作演示：Key 写在前端会泄露，生产环境请走后端代理
const fileInput = document.querySelector('#file');   // <input type="file">

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', '把背景换成雪夜的松林，保持人物不变');
form.append('response_format', 'url');
form.append('image', fileInput.files[0]);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## 参数说明速查

| 参数名                | 类型      | 必填 | 默认    | 说明                                                                      |
| ------------------ | ------- | -- | ----- | ----------------------------------------------------------------------- |
| `model`            | string  | ✅  | —     | `grok-imagine-image`（\$0.02/张）或 `grok-imagine-image-quality`（\$0.045/张） |
| `prompt`           | string  | ✅  | —     | 编辑指令。建议写明「改什么」并声明「其余保持不变」                                               |
| `image`            | file    | ✅  | —     | 参考图文件。多图融合用 `image[]` 重复传入，**1–4 张**（传 5 张返回 400）。**第一张决定输出画幅**         |
| `n`                | integer | ❌  | `1`   | 出图数量 **1–10**，按张计费，与参考图数量无关                                             |
| `response_format`  | string  | ❌  | `url` | `url` 返回图片直链；`b64_json` 返回纯 base64（**不带** `data:` 前缀）                   |
| ~~`resolution`~~   | string  | ❌  | —     | **本端点不生效**，输出画幅跟随输入图                                                    |
| ~~`aspect_ratio`~~ | string  | ❌  | —     | **本端点不生效**，输出画幅跟随输入图                                                    |

<Info>
  本系列**不支持 mask 局部重绘**。要局部修改请在提示词里描述清楚修改范围，例如「只把围巾改成红色，其余部分完全保持不变」——模型对这类约束遵循度很好。
</Info>

## 编辑效果与提示词写法

编辑接口会**保留输入图的画风、构图、配色与主体身份**，只改提示词指定的部分。为了拿到稳定结果，建议：

| 写法                        | 效果                   |
| ------------------------- | -------------------- |
| ✅ `把围巾改成红色，其余部分完全保持不变`    | 只有围巾变色，画风/构图/背景逐像素保留 |
| ✅ `给这只猫加一副圆形黑色墨镜，其余保持不变`  | 只加墨镜，原有描边风格与背景色不变    |
| ✅ `把图1的角色放进图2的场景，沿用图2的画风` | 双图融合，两张图的特征都保留       |
| ⚠️ `让它更好看一点`              | 指令过于笼统，改动范围不可控       |

<Tip>
  \*\*显式声明「其余保持不变」\*\*是这个模型上最有效的技巧。多图融合时则要显式指代「图1 / 图2」，对应 `image[]` 的上传顺序。

  另外**把最重要的主体放第一张**：第一张不仅决定输出画幅，实测顺序颠倒后次要主体的身份还可能与其它主体发生融合。
</Tip>

## 响应格式

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000
  }
}
```

<Warning>
  **响应字段陷阱**

  * `data[]` 每项只有 `url` 或 `b64_json` **二选一**，取决于 `response_format`，不会同时出现。
  * **不返回 `revised_prompt`**，解析时不要假设它存在。
  * `b64_json` 是**纯 base64，不带 `data:image/...;base64,` 前缀**，可直接 `base64.b64decode`。
  * `created` 恒为 `0`，不能当时间戳用。
  * 输出尺寸由**输入图**决定，不要按请求参数去预判返回图的宽高。
</Warning>

<Info>
  **`usage` 不能用来核账**：`prompt_tokens` 恒为 `1000 × n`，是占位值。编辑与文生图**同价**，按次固定计费，真实扣费请以 API易 控制台账单为准。
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-edit-openapi.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: Grok Imagine 2 图片编辑 API
  description: |
    xAI Grok Imagine 2 图像生成模型 — 图片编辑接口。

    - **请求格式必须为 `multipart/form-data`（文件上传）**，发送 JSON 会返回 400
    - 支持单图编辑与多图融合（1–4 张参考图，`image[]` 字段重复传入）
    - 参考图特征保留度高：画风、构图、配色、主体身份都会被保留，只改提示词指定的部分
    - **输出画幅跟随「第一张」参考图**：`resolution` / `aspect_ratio` 在本端点传了不生效
    - 按次固定计费，与文生图同价

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
  /v1/images/edits:
    post:
      tags:
        - 图片编辑
      summary: 图片编辑：根据指令编辑参考图或融合多图
      description: |
        使用 Grok Imagine 2 模型，根据文本指令对上传的参考图进行编辑或多图融合。

        - **必须使用 `multipart/form-data`**。发送 `application/json`（即便是上游文档里的
          `{"image": {"type": "image_url", "url": "..."}}` 写法）一律返回
          400 `invalid_image_request`：`request Content-Type isn't multipart/form-data`
        - 文件字段名只能是 `image` 或 `image[]`；写成 `images` / `image_file` 会返回 415
        - `prompt` 必填，缺失返回 400
        - 参考图 1–4 张（实测上限 4，传 5 张返回 400），多图时在 prompt 中用「图1/图2」指代上传顺序
      operationId: editGrokImagineImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/GrokImagineEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: 请求不是 multipart/form-data、缺少 prompt，或内容被审核拦截
        '401':
          description: 未授权 - API Key 无效
        '415':
          description: 文件字段名不受支持（只接受 `image` / `image[]`）
        '429':
          description: 请求频率超限或额度不足
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: 模型 ID
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >
            编辑指令。建议明确「改什么」并声明「其余保持不变」，例如

            `Change the scarf color to bright RED. Keep everything else exactly
            the same.`
          example: >-
            Change the scarf color to bright RED. Keep everything else exactly
            the same.
        image:
          type: string
          format: binary
          description: |
            参考图文件。多图融合时用 `image[]` 重复传入（1–4 张），
            顺序即 prompt 中「图1/图2/图3」的引用依据，**第一张还决定输出画幅**。
            实测每多传一张就多一个主体，融合真实生效。格式 png / jpg / webp。
        'n':
          type: integer
          description: 生成图片数量，取值 1–10。与参考图数量无关
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        response_format:
          type: string
          description: '返回格式。`url` 返回图片直链；`b64_json` 返回纯 base64（不带 data: 前缀）'
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
                description: 图片直链，`response_format=url` 时返回
                example: >-
                  https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg
              b64_json:
                type: string
                description: '纯 base64 图片数据，`response_format=b64_json` 时返回（不带 data: 前缀）'
        usage:
          type: object
          description: '**占位值，不能用于核账。** `prompt_tokens` 恒为 `1000 × n`'
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````