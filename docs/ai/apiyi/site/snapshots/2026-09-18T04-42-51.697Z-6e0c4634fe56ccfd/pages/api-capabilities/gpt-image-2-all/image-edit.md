> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片编辑 API 参考

> gpt-image-2-all 图片编辑 API 参考与在线调试 — 上传参考图 + 指令进行单图改图或多图融合

<Info>
  右侧的交互式 Playground 支持直接上传本地图片。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），选择图片与填入 `prompt`、`model` 后一键发送即可。
</Info>

<Tip>
  **场景说明**：本页用于「基于一张或多张参考图改图 / 融合生成」。请求为 `multipart/form-data` 格式。如需纯文本生成图片，请使用 [文生图接口](/api-capabilities/gpt-image-2-all/text-to-image)。
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制（默认 b64\_json 模式）**

  本端点**默认 `response_format: "b64_json"`**，响应会包含数 MB 的 base64 字符串，浏览器 Playground **可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法显示这么长的 base64。

  **推荐做法**：

  * 只想在 Playground 里看图：**显式传 `"response_format": "url"`**，响应是单条 R2 链接，浏览器渲染正常。
  * 想要 base64 或要传超大参考图：**复制下方"代码示例"到本地运行**，代码会自动处理上传与解码。
</Warning>

<Warning>
  **📎 多图融合顺序有意义**

  `image` 字段可重复传入多张参考图，**顺序将作为 prompt 中「图1/图2/图3」的引用依据**。建议在 prompt 中显式指代，例如：

  > 把图1的人物放进图2的场景，参考图3的画风

  推荐单张 **≤ 10MB**，格式 `png` / `jpg` / `webp`，过大的图可能触发网关限制。
</Warning>

<Tip>
  **🎯 保形改图小技巧**：本端点的输出尺寸**跟随 prompt 里点名要修改的那张图的比例**——多图场景下**不一定是第一张**。

  例如 prompt 写"**修改图2**，把图2 的衣服和帽子改成图1 里的样子"，那图2 是 1:1，则输出也是 1:1（即便图1 是横版 16:9）。

  对换装、加帽子、修图等保形场景特别好用。**`size` 字段在本模型不生效**（传入静默忽略，要严格锁尺寸请用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/image-edit)）；prompt 没明确指代时由模型自行判断。
</Tip>

## 代码示例

### Python

**单图编辑**：

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

with open("photo.png", "rb") as f:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "把背景换成海边黄昏",
            "response_format": "url"
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # 保守值，吸收长尾 + 图片上传/下载耗时
    ).json()

print(response["data"][0]["url"])
```

**多图融合**：

```python theme={null}
import requests

with open("ref1.png", "rb") as f1, \
     open("ref2.png", "rb") as f2, \
     open("ref3.png", "rb") as f3:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": "Bearer sk-your-api-key"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "把图1的人物放进图2的场景，参考图3的画风",
            "response_format": "b64_json"
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300  # 保守值，吸收长尾 + 图片上传/下载耗时
    ).json()

# 实测（2026-07）b64_json 为纯 base64（无 data: 前缀）；历史版本曾含前缀，做个检测最稳
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

**单图编辑**：

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=把背景换成海边黄昏" \
  -F "response_format=url" \
  -F "image=@./photo.png"
```

**多图融合**：

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=把图1的人物放进图2的场景，参考图3的画风" \
  -F "response_format=b64_json" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js（原生 fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';
import { Agent, setGlobalDispatcher } from 'undici';

// 图片编辑要上传参考图、又要等 MB 级响应体，而 undici 默认建连超时只有 10 秒，
// 且不受下面 AbortSignal.timeout 控制（两者是不同层），必须单独放宽
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', '把背景换成太空');
form.append('response_format', 'url');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),   // 总超时，与上面三个是不同层
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

<Tip>
  上面的 `undici` 需要单独安装（`npm i undici`）——它虽然是内置 `fetch` 的底层实现，但没有以模块名对外暴露；装出来的这份调用 `setGlobalDispatcher` 会同时影响内置 `fetch`。

  `maxRetries`、`connectTimeout` 与「总超时」分属不同层，配错层是 Node 侧最常见的踩坑；连接被重置、`UND_ERR_CONNECT_TIMEOUT`、挂代理导致大响应体收不全等情况，排查方法见[图片 API 连接中断排查](/api-capabilities/image-connection-drops)。
</Tip>

### 浏览器 JavaScript（File 对象）

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', '把这几张图融合成一张海报');
form.append('response_format', 'url');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## 参数说明速查

| 字段                | 类型   | 必填 | 说明                                                                                                                                         |
| ----------------- | ---- | -- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`           | text | 是  | `gpt-image-2.5-all` 或 `gpt-image-2-all`（同价同行为）                                                                                             |
| `prompt`          | text | 是  | 改图/融合的自然语言描述                                                                                                                               |
| `image`           | file | 是  | 参考图，可重复多次（数组字段）                                                                                                                            |
| `size`            | text | 否  | **本字段不生效，传入会被静默忽略**。输出尺寸**跟随 prompt 里点名要修改的那张图的比例**（多图下不一定是第一张）。要严格锁尺寸请用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/image-edit) |
| `response_format` | text | 否  | `b64_json`（默认）或 `url`                                                                                                                      |

<Tip>
  **多轮迭代**：把上一次的输出图片作为下一次的 `image` 输入，配合新的编辑指令，可逐步精调画面效果。
</Tip>

## 响应格式

与文生图接口一致：**`data[0]` 中只会出现 `url` 或 `b64_json` 之一**（取决于 `response_format`），不会两者都返回。本端点**默认返回 `b64_json`**。

**`b64_json` 模式**（默认）：

```json theme={null}
{
  "data": [
    {
      "b64_json": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "created": 1778037127,
  "usage": {
    "input_tokens": 98,
    "output_tokens": 1185,
    "total_tokens": 1283
  }
}
```

**`url` 模式**（需显式 `"response_format": "url"`）：

```json theme={null}
{
  "data": [
    {
      "url": "https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png"
    }
  ],
  "created": 1778037331,
  "usage": {
    "input_tokens": 30,
    "output_tokens": 2074,
    "total_tokens": 2104
  }
}
```

<Warning>
  2026-07 实测 `b64_json` 字段为**纯 base64（不含 `data:` 前缀）**，需解码或自行拼接前缀后使用；**历史版本曾直接带前缀**。请先做 `startsWith('data:')` 检测再处理，兼容两种形态。
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-edit-openapi.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-all 图片编辑 API
  description: >
    GPT 图像生成官逆模型 `gpt-image-2-all` — 图片编辑接口。


    - 支持单图改图与多图融合（同名 `image` 字段可重复传，多图按上传顺序排序）

    - 请求格式为 `multipart/form-data`

    - 在 prompt 中可用「图1/图2/图3」指代上传顺序

    - **`size` 字段不生效**（传任何值都不会报错，但会被静默忽略）；输出尺寸**跟随 prompt
    里点名要修改的那张图的比例**（多图场景下不一定是第一张），保形改图友好。例如 prompt 写"修改图2"，输出比例就跟图2 一致；prompt
    没明确指代时由模型自行判断。要严格锁尺寸请用 `gpt-image-2-vip`

    - **默认返回 base64 (`b64_json`)，可切换为 R2 CDN 链接 (`url`)**；响应中 `data[0]` 只会出现
    `url` **或** `b64_json` 之一，不会两者都返回


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
      summary: 图片编辑：根据指令编辑或融合参考图
      description: >
        使用 `gpt-image-2-all` 模型，根据文本指令对输入图片进行编辑或多图融合。


        - 必须提供至少一张输入图片（`image` 字段）

        - 多张参考图：**重复传同名 `image` 字段**，例如 `-F image=@a.png -F
        image=@b.png`（按上传顺序对应 prompt 中的「图1/图2/...」）

        - 单张图片推荐 ≤ 10MB，格式 png/jpg/webp

        - 如需纯文本生成图片，请使用 [文生图接口](/api-capabilities/gpt-image-2-all/text-to-image)
      operationId: editGptImage2AllImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: 成功生成图片。响应默认返回 base64（`data[0].b64_json`），不会同时返回 `url`。
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
              example:
                data:
                  - b64_json: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
                created: 1778037127
                usage:
                  input_tokens: 98
                  output_tokens: 1185
                  total_tokens: 1283
        '401':
          description: 未授权 - API Key 无效
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
        - image
      properties:
        model:
          type: string
          description: 模型名称：gpt-image-2.5-all 或 gpt-image-2-all（同一 ChatGPT 网页版线路，同价同行为）
          enum:
            - gpt-image-2.5-all
            - gpt-image-2-all
          default: gpt-image-2.5-all
        prompt:
          type: string
          description: 编辑/融合指令。多图场景可用「图1/图2/图3」指代 image 字段的上传顺序
          example: 把图1的人物放进图2的场景，参考图3的画风
        image:
          type: array
          description: >-
            参考图。**单图直接传一次，多图重复传同名 `image` 字段**（例如 `-F image=@a.png -F
            image=@b.png`），按上传顺序对应 prompt 中的「图1/图2/...」。推荐单张 ≤ 10MB，格式
            png/jpg/webp。
          items:
            type: string
            format: binary
        response_format:
          type: string
          description: 响应格式。b64_json 返回已含 data URL 前缀的 base64 字符串（默认）；url 返回 R2 CDN 链接
          enum:
            - b64_json
            - url
          default: b64_json
    ImageResponse:
      type: object
      description: >
        图片编辑响应。`data[0]` 中**只会出现 `url` 或 `b64_json` 之一**（取决于
        `response_format`，本端点默认 `b64_json`），不会两者都返回。
      properties:
        data:
          type: array
          description: 生成结果数组（本模型单次返回 1 张）
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN 加速链接（response_format=url 时返回）
              b64_json:
                type: string
                description: >-
                  Base64 编码的 data URL（response_format=b64_json 时返回，已含
                  data:image/png;base64, 前缀）
        created:
          type: integer
          description: 创建时间戳（Unix 秒）
        usage:
          type: object
          description: Token 用量统计
          properties:
            input_tokens:
              type: integer
              description: 输入 token 数
            output_tokens:
              type: integer
              description: 输出 token 数（含图片像素折算）
            total_tokens:
              type: integer
              description: 总 token 数
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````