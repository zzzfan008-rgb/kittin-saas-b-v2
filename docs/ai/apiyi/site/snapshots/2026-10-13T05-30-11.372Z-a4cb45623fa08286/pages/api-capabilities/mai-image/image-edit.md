> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片编辑 API 参考

> MAI-Image 2.6 图片编辑 API 参考与在线调试 — 上传 1–5 张参考图 + 指令改图或多图融合，必须使用 multipart/form-data 文件上传，参考图张数不影响价格

<Info>
  右侧的交互式 Playground 支持直接上传本地图片。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），选择 `image` 文件（可添加多张）并填入 `prompt`、`model` 后一键发送即可。
</Info>

<Warning>
  **🔴 本接口只接受 `multipart/form-data` 文件上传**

  发送 JSON 到 `/v1/images/edits`（`image` 填 URL、data URI 或裸 base64）会返回 400：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **不支持图片 URL 入参**。手上只有 URL 时，请先在服务端下载成文件再上传。文件上传不需要图床，直接传本地文件即可。
</Warning>

<Tip>
  **场景说明**：本页用于「基于参考图改图」，支持单图编辑与 1–5 张多图融合。如需纯文本生成图片，请使用 [文生图接口](/api-capabilities/mai-image/text-to-image)。
</Tip>

<Info>
  **🖼️ 支持 1–5 张参考图（2026-10-07 起）**

  * **写法**：重复 `image[]` 字段，每个字段放一张图；OpenAI SDK 直接传列表 `client.images.edit(image=[f1, f2, ...])`。`image` 同名重复也可以
  * **顺序**：按上传顺序依次是图1、图2……，提示词里可以直接说「把图2里的狐狸放进图1」
  * **价格**：按次计费，**传 1 张还是 5 张都是同一个价**
  * **格式**：JPEG、PNG、WebP；GIF 等其他格式返回 400
  * **超过 5 张**返回 400 `at most 5 reference images are accepted for <model>`
</Info>

<Warning>
  **不要用 `image` + `image2` 这类编号字段名**：返回 200，但**只有第一张图生效**，第二张被丢弃；`image1` + `image2` 则返回 500 `image is required`。多张图请一律用重复的 `image[]`。
</Warning>

<Info>
  **参数红线与文生图相同**：不要传 `response_format`、`seed`、`negative_prompt`（返回 400）。返回值固定为 `data[0].b64_json`（PNG）。
</Info>

## 代码示例

### Python（OpenAI SDK · 单图编辑）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# SDK 的 images.edit 内部就是 multipart 文件上传；不要传 response_format
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=open("teaset.jpg", "rb"),
    prompt="Change the teapot to a deep cobalt blue glaze, keep everything else identical"
)

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python（OpenAI SDK · 多图融合）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# image 传列表即可，1–5 张；SDK 会把每张图作为一个 image[] 字段上传
# 按上传顺序依次是图1、图2……，价格与单图相同
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=[open("teaset.jpg", "rb"), open("fox.jpg", "rb")],
    prompt="把图2里的狐狸（保留它的全部外观细节）放进图1的场景里，坐在茶具旁边，图1其余部分保持不变"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python（原生 requests · 单图编辑）

```python theme={null}
import base64
import os
import requests

# 用 files= 传文件，requests 会自动设置 multipart/form-data 及 boundary
# 不要用 json=，也不要手动设 Content-Type
with open("teaset.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        data={
            "model": "MAI-Image-2.6",
            "prompt": "把茶壶改成深钴蓝釉，其余部分完全保持不变"
        },
        files={"image": ("teaset.jpg", fp, "image/jpeg")},
        timeout=180
    )
response.raise_for_status()

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

多图时 `files` 改用元组列表，每张图一个 `image[]`（dict 不能放重复的键）：

```python theme={null}
files = [
    ("image[]", ("teaset.jpg", open("teaset.jpg", "rb"), "image/jpeg")),
    ("image[]", ("fox.jpg", open("fox.jpg", "rb"), "image/jpeg")),
]
```

### cURL

```bash theme={null}
# 单图编辑：-F 即 multipart/form-data，@ 前缀表示上传本地文件
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=把茶壶改成深钴蓝釉，其余部分完全保持不变" \
  -F "image=@teaset.jpg" \
  | python3 -c "import sys,json,base64; open('edited.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

```bash theme={null}
# 编辑时改画幅为 1536×1024（与原图比例不同会重新构图）
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6" \
  -F "prompt=把这张茶具图改成摆在木桌上的生活场景，自然光，写实摄影" \
  -F "width=1536" \
  -F "height=1024" \
  -F "image=@teaset.jpg"
```

```bash theme={null}
# 多图融合：重复 image[] 字段，1–5 张，按顺序为图1、图2……
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=把图2里的狐狸（保留它的全部外观细节）放进图1的场景里，坐在茶具旁边，图1其余部分保持不变" \
  -F "image[]=@teaset.jpg" \
  -F "image[]=@fox.jpg" \
  | python3 -c "import sys,json,base64; open('fused.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js（原生 fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'MAI-Image-2.6-Flash');
form.append('prompt', '把背景换成雪夜的松林，保持人物不变');
form.append('image', new Blob([fs.readFileSync('./photo.jpg')]), 'photo.jpg');
// 多图融合：改成多次 form.append('image[]', ...)，每次一张，最多 5 张

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // 不要手动设 Content-Type，交给 FormData 自动带 boundary
    headers: { 'Authorization': `Bearer ${process.env.APIYI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('edited.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

## 参数说明速查

| 参数名 | 类型 | 必填 | 默认 | 说明 |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6`（\$0.12/张）或 `MAI-Image-2.6-Flash`（\$0.06/张），**大小写敏感** |
| `prompt` | string | ✅ | — | 编辑指令。建议写明「改什么」并声明「其余保持不变」 |
| `image` / `image[]` | file | ✅ | — | 参考图文件，**1–5 张**。单图用 `image`；多图重复 `image[]` 字段，按上传顺序为图1…图N。支持 JPEG / PNG / WebP，张数不影响价格 |
| `width` / `height` | integer | ❌ | 跟随原图比例 | 指定输出尺寸，规则同文生图；与原图比例不同时会**重新构图** |
| `n` | integer | ❌ | `1` | 出图张数，**本端点有效**，按张计费 |
| ~~`mask`~~ | — | — | — | **不支持**，传入返回 400 `<model> does not support mask edits` |
| ~~`response_format`~~ / ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **传入返回 400** |

<Info>
  **不传尺寸时的输出**：按原图比例贴合到 16 的倍数网格，例如 1344×756 的输入输出 1360×768；多图时以**图1**的比例为准。只想改局部、不想动构图时，不要传 `width` / `height`。
</Info>

## 编辑效果与提示词写法

编辑接口会**保留原图的构图、配色与细节**，只改提示词指定的部分：

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flash 编辑示例：茶壶从米白改为钴蓝，其余不变" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

| 写法 | 效果 |
| - | - |
| ✅ `把茶壶改成深钴蓝釉，其余部分完全保持不变` | 只有茶壶变色，尺寸标注、其它物件逐像素保留 |
| ✅ `把这张照片改成水彩画风格，构图不变` | 风格整体重绘，构图保持 |
| ⚠️ `让它更好看一点` | 指令过于笼统，改动范围不可控 |

<Tip>
  \*\*显式声明「其余保持不变」\*\*是这个模型上最有效的技巧，能最大限度保留原图。
</Tip>

### 多图融合

把图1当作底图，其余参考图里的物体按提示词放进去。下例一次传入 5 张（茶具图 + 狐狸 + 橡皮鸭 + 闹钟 + 仙人掌），提示词为「把图2的狐狸、图3的黄色橡皮鸭、图4的红色复古闹钟、图5的仙人掌盆栽都摆进图1的茶桌场景里，每个物体保留原有外观，图1其余部分保持不变」：

<Frame>
  <img src="https://mintcdn.com/apiyillc/M34PNfQX341lt5W7/images/mai-image-multi-ref-5.jpg?fit=max&auto=format&n=M34PNfQX341lt5W7&q=85&s=0c18a285c65fa48646505b109e3600c7" alt="MAI-Image-2.6-Flash 多图融合示例：5 张参考图输入，4 个物体都被放进茶具图里，原图其余部分不变" width="1200" height="1229" data-path="images/mai-image-multi-ref-5.jpg" />
</Frame>

| 写法 | 效果 |
| - | - |
| ✅ `把图2里的狐狸放进图1的场景里，图1其余部分保持不变` | 用「图N」指代参考图，按上传顺序对应，最稳定 |
| ✅ 点名每张图里的物体：`图3的黄色橡皮鸭、图4的红色闹钟` | 张数多时逐个点名，避免漏放 |
| ⚠️ `把这几张图合成一张` | 没指明底图和主体，构图不可控 |

## 响应格式

```json theme={null}
{
  "created": 1791000788,
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

  * `b64_json` 是**纯 base64，不带 `data:` 前缀**，解码后为 PNG。
  * `n > 1` 时 `data` 数组有多项，别只取 `data[0]`。
  * 不返回 `url` 与 `revised_prompt`。
</Warning>

<Info>
  **`usage` 不能用来核账**：是占位值（`prompt_tokens` 恒为 `1000 × 张数`）。编辑与文生图**同价**，按张固定计费，**参考图张数不影响价格**，真实扣费请以 API易 控制台账单为准。
</Info>


## OpenAPI

````yaml api-reference/mai-image-edit-openapi.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: MAI-Image 2.6 图片编辑 API
  description: >
    微软 MAI-Image 2.6 图像生成模型 — 图片编辑接口。


    - **请求格式必须为 `multipart/form-data`（文件上传）**，发送 JSON 或图片 URL 会返回 400

    - 支持 **1–5 张参考图**：单图用 `image`，多图重复 `image[]` 字段（OpenAI SDK
    传列表），按上传顺序为图1…图N；**不要用 `image2` 这类编号字段名**（第二张会被丢弃）

    - 不支持 mask；不要传 `response_format` / `seed` / `negative_prompt`

    - 按次固定计费，与文生图同价，参考图张数不影响价格；`n` 在本端点有效、按张计费


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
security:
  - bearerAuth: []
paths:
  /v1/images/edits:
    post:
      tags:
        - 图片编辑
      summary: 图片编辑：根据指令编辑参考图（1–5 张）
      description: >
        使用 MAI-Image 2.6 模型，根据文本指令对上传的 1–5 张参考图进行编辑或融合。


        - **必须使用 `multipart/form-data`**，发送 `application/json` 返回
          400：`request Content-Type isn't multipart/form-data`
        - **多图融合**：重复 `image[]` 字段，最多 5 张，超过返回 400；`image` + `image2` 只用第一张；带
        `mask` 返回 400

        - 参考图只接受 JPEG / PNG / WebP

        - 不传 `width` / `height` 时按原图比例输出；传入与原图比例不同的尺寸会重新构图
      operationId: editMaiImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/MaiImageEditRequest'
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
          description: 请求不是 multipart/form-data、参考图超过 5 张或格式不支持、带了 mask、参数非法，或内容被审核拦截
        '401':
          description: 未授权 - API Key 无效
        '429':
          description: 请求频率超限或额度不足
        '500':
          description: 请求中没有图片文件字段，或用了 `image1` + `image2` 这类编号字段名（`image is required`）
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: 模型 ID（大小写敏感）
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: 编辑指令。建议明确「改什么」并声明「其余保持不变」
          example: 把茶壶改成深钴蓝釉，其余部分完全保持不变
        image:
          type: array
          items:
            type: string
            format: binary
          minItems: 1
          maxItems: 5
          description: 参考图文件，1–5 张，按上传顺序为图1…图N。格式 png / jpg / webp。代码调用时多图请重复 `image[]` 字段
        width:
          type: integer
          description: 可选，输出宽度。规则同文生图：每维 ≥ 768、宽×高 ≤ 2,359,296，须与 `height` 成对
          minimum: 768
        height:
          type: integer
          description: 可选，输出高度，规则同 `width`
          minimum: 768
        'n':
          type: integer
          description: 出图张数，本端点有效，按张计费
          minimum: 1
          default: 1
          example: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: 创建时间戳
          example: 1791000788
        data:
          type: array
          description: 图片结果数组，长度等于 `n`
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: '纯 base64 图片数据（PNG，不带 data: 前缀）'
        usage:
          type: object
          description: '**占位值，不能用于核账。** `prompt_tokens` 恒为 `1000 × 张数`'
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.