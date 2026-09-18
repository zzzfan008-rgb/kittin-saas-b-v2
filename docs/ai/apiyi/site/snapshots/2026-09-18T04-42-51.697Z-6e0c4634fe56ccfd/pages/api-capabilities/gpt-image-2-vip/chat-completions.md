> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 对话式 API 参考

> gpt-image-2-vip 对话式端点 — 一个端点同时支持文生图与带参考图改图，方便直接传入在线图片 URL，支持多轮迭代。

<Note>
  **本调用方式不再主推**：推荐统一使用 [/v1/images/generations](/api-capabilities/gpt-image-2-vip/text-to-image) 与 [/v1/images/edits](/api-capabilities/gpt-image-2-vip/image-edit)——更稳定、与官转 `gpt-image-2` 同套代码。本页对话式端点仍可正常调用，适合多轮迭代改图、直接传在线图片 URL 的场景。
</Note>

<Info>
  **对话式端点特点**：**一个端点同时支持文生图与带参考图改图**，方便直接传入**在线图片 URL**（CDN 链接或 base64 data URL）作为参考图，并能天然做多轮迭代。右侧 Playground 填入 API Key 后，直接从下拉选择 example（文生图 / 带参考图改图 / 多轮迭代）即可。

  如果你希望同一套代码兼容官转和官逆，建议使用 `/v1/images/generations` 与 `/v1/images/edits`（OpenAI Images API 标准格式）。
</Info>

<Tip>
  **选择模式**：

  * 仅输入文本 `messages` → **文生图**
  * `messages` 中加入 `image_url`（URL 或 base64 data URL）→ **带参考图改图**
  * 保留 `assistant` 历史消息继续追问 → **多轮迭代改图**

  **与 `gpt-image-2-all` 的区别**：调用方式完全一致，把 `model` 换成 `gpt-image-2-vip` 即可；本端点额外支持顶层 `size` 字段锁尺寸（30 档常见尺寸，与 `/v1/images/generations` 一致）。

  ✨ **`size` 字段为可选**：传入则严格锁定输出尺寸；不传则由 prompt 描述决定（行为与 `-all` 一致）。
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制（响应含 base64 时）**

  本端点**默认返回 R2 CDN URL**（`data[0].url`），Playground 显示正常。少数情况下如果返回的是 base64（`data[0].b64_json`），或你在 `image_url` 里传入了大 base64 输入图，响应字符串可能达数 MB，浏览器 Playground **可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法显示这么长的内容。

  **推荐做法**：遇到此提示时，**直接复制下方"代码示例"到本地运行**，程序可从 `data[0].url` 或 `data[0].b64_json` 中拿到结果（**两者只会出现其一**，不会同时返回）。
</Warning>

## 代码示例

### Python（文生图）

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "gpt-image-2.5-vip",
        "size": "2048x1152",  # 可选；不传则由 prompt 描述决定
        "messages": [
            {"role": "user", "content": "横版 16:9 电影画幅，黄昏时的海边老灯塔，写实风格"}
        ]
    },
    timeout=300  # 保守值，吸收长尾 + 图片上传/下载耗时
).json()

# 默认返回 url；如显式切到 b64_json 模式则取 response["data"][0]["b64_json"]
print(response["data"][0]["url"])
```

### Python（带参考图改图）

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

# 可用 HTTPS URL，也可以用 base64 data URL
with open("photo.png", "rb") as f:
    data_url = "data:image/png;base64," + base64.b64encode(f.read()).decode()

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "gpt-image-2.5-vip",
        "size": "2048x2048",  # 可选；不传则由 prompt 描述决定
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "把这张图改成水彩画风"},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }
        ]
    },
    timeout=300
).json()

# 默认返回 url；如显式切到 b64_json 模式则取 response["data"][0]["b64_json"]
print(response["data"][0]["url"])
```

### cURL（文生图）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-vip",
    "size": "2048x1152",
    "messages": [
      {"role": "user", "content": "横版 16:9，赛博朋克雨夜街景，霓虹招牌写着 Hello World"}
    ]
  }'
```

### cURL（带参考图改图）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-vip",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "把这张图改成水彩画风" },
          { "type": "image_url", "image_url": { "url": "https://example.com/photo.png" } }
        ]
      }
    ]
  }'
```

### Node.js（文生图）

```javascript theme={null}
const API_KEY = "sk-your-api-key";

const response = await fetch("https://api.apiyi.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-image-2.5-vip",
    messages: [
      { role: "user", content: "1024x1024 方形 LOGO，极简猫咪线条" }
    ]
  })
});

const data = await response.json();
// 默认返回 url；如显式切到 b64_json 模式则取 data.data[0].b64_json
console.log(data.data[0].url);
```

<Note>
  **关于 OpenAI SDK**：本端点**请求格式**与 OpenAI Chat Completions 兼容，但**响应格式**为 `{data: [{url|b64_json}], created, usage}`，不含 `choices` 字段。直接用 `client.chat.completions.create(...)` 解析时会失败，请改用上面的 `requests` / `fetch` 直接拿到原始 JSON 解析。
</Note>

## 参数说明速查

| 参数                   | 类型              | 必填 | 说明                                                                                                            |
| -------------------- | --------------- | -- | ------------------------------------------------------------------------------------------------------------- |
| `model`              | string          | 是  | `gpt-image-2.5-vip`（= `gpt-image-2.5-sunburst-vip`）/ `gpt-image-2.5-flare-vip` / 上一代 `gpt-image-2-vip`        |
| `messages`           | array           | 是  | 对话消息数组；支持 `system` / `user` / `assistant` 三种 role                                                             |
| `messages[].content` | string \| array | 是  | 纯文本字符串（文生图）或多模态数组（带图改图）                                                                                       |
| `size`               | string          | 否  | 输出尺寸（30 档），如 `2048x1152`、`3840x2160`。不传则由 prompt 描述决定。完整档位见[模型概览](/api-capabilities/gpt-image-2-vip/overview) |
| `stream`             | boolean         | 否  | 是否流式。本模型为一次性出图，建议保持 `false`                                                                                   |

**多模态 content 片段**（`content` 为数组时）：

| 字段              | 类型     | 必填 | 说明                                                                    |
| --------------- | ------ | -- | --------------------------------------------------------------------- |
| `type`          | enum   | 是  | `text` 或 `image_url`                                                  |
| `text`          | string | 条件 | 当 `type=text` 时必填                                                     |
| `image_url.url` | string | 条件 | 当 `type=image_url` 时必填。支持 `https://...` 或 `data:image/png;base64,...` |

<Tip>
  详细的字段说明与可选值请查看右侧 Playground。下拉 "Example" 可在 **文生图 / 带参考图改图 / 多轮迭代** 之间切换。
</Tip>

## 响应格式

对话式端点的响应格式为 `{data: [{url|b64_json}], created, usage}` ——`data[0]` 中**只会出现 `url` 或 `b64_json` 之一**，不会同时返回。本端点**默认返回 `url`**。

**默认 `url` 输出**：

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

**`b64_json` 输出**（少数情况）：

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

<Info>
  **解析建议**：先取 `data[0].url`，若为空再取 `data[0].b64_json`。`b64_json` 已带 `data:image/png;base64,` 前缀，可直接作为 `<img src>` 使用。
</Info>

## 对话式端点的优势

<CardGroup cols={2}>
  <Card title="同端点双能力" icon="plug">
    不需要在 generations / edits 两个端点之间切换，统一走一个端点
  </Card>

  <Card title="方便传入在线 URL" icon="link">
    `image_url` 直接接受 CDN 图片地址或 base64 data URL，无需 multipart 上传
  </Card>

  <Card title="天然多轮迭代" icon="message-circle">
    保留 `assistant` 历史消息即可继续精调，逻辑与 ChatGPT 一致
  </Card>

  <Card title="SDK 生态最完整" icon="package">
    OpenAI 官方 SDK、LangChain、各类 Chat 前端都能直接对接
  </Card>
</CardGroup>

<Tip>
  **严格锁尺寸**：传入顶层 `size` 字段（30 档常见尺寸，如 `2048x1152`、`3840x2160`）即可锁定输出。需要 OpenAI Images API 标准格式时，仍可改走 [文生图接口](/api-capabilities/gpt-image-2-vip/text-to-image)（`/v1/images/generations`）。
</Tip>

## 相关资源

<CardGroup cols={2}>
  <Card title="模型概览（含完整 size 表）" icon="sparkles" href="/api-capabilities/gpt-image-2-vip/overview">
    30 档 size 完整对照表、定价、技术规格
  </Card>

  <Card title="文生图 API（/v1/images/generations）" icon="wand-sparkles" href="/api-capabilities/gpt-image-2-vip/text-to-image">
    OpenAI Images API 兼容端点，传 `size` 锁定输出尺寸
  </Card>

  <Card title="图片编辑 API（/v1/images/edits）" icon="image" href="/api-capabilities/gpt-image-2-vip/image-edit">
    multipart/form-data 上传参考图改图
  </Card>

  <Card title="姐妹模型 gpt-image-2-all" icon="copy" href="/api-capabilities/gpt-image-2-all/chat-completions">
    不需要锁尺寸时调用方式一致，出图更快
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-chat-openapi.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: gpt-image-2-vip 对话式 API
  description: >
    GPT 图像生成 Adobe 官逆模型（Firefly 线路） `gpt-image-2-vip` — 对话式端点（OpenAI Chat
    Completions 兼容格式）。


    **对话式端点特点**：**一个端点同时支持文生图与带参考图改图**，方便直接传入**在线图片 URL**（CDN 链接或 base64 data
    URL）作为参考图，并能天然做多轮迭代。


    - 仅输入 `messages`（纯文本）→ 文生图

    - `messages` 中带 `image_url` → 带参考图改图

    - `image_url.url` 支持 `https://...` 或 `data:image/png;base64,...`

    - 按次计费 $0.03/张

    - 支持 `size` 字段锁定尺寸（30 档常见尺寸，与 /v1/images/generations 一致）；不传则由 prompt 描述决定

    - **响应默认返回 R2 CDN URL**（与 `/v1/images/generations`、`/v1/images/edits` 默认
    base64 不同），响应中的 `data[0]` 只会出现 `url` **或** `b64_json` 之一

    - Playground 不支持流式响应预览，建议使用 SDK 测试流式输出


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
  /v1/chat/completions:
    post:
      tags:
        - 对话式
      summary: 对话式生图 / 改图
      description: |
        使用 `gpt-image-2-vip` 的对话式端点，通过 `messages` 数组生成或编辑图片。

        - **文生图**：`messages` 仅含文本，返回图片 URL 或 data URL
        - **带图改图**：`messages` 中添加 `image_url`（URL 或 base64 data URL），返回编辑后的图片
        - **多轮迭代**：保留上下文 `messages` 可进行多轮精调

        下方 examples 提供 **纯文本文生图** 和 **带参考图改图** 两种模式，可在 Playground 右侧下拉切换。
      operationId: chatGptImage2Vip
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatCompletionRequest'
            examples:
              text-to-image:
                summary: 文生图（纯文本）
                description: 仅输入文本提示词，生成图片。可选 `size` 字段锁定尺寸；不传则由 prompt 描述决定。
                value:
                  model: gpt-image-2.5-vip
                  size: 2048x1152
                  messages:
                    - role: user
                      content: 横版 16:9 电影画幅，黄昏时的海边老灯塔，写实风格
              edit-with-reference:
                summary: 带参考图改图（多模态）
                description: 提供一张参考图（URL 或 base64 data URL）+ 编辑指令。可选 `size` 锁定输出尺寸。
                value:
                  model: gpt-image-2.5-vip
                  size: 2048x2048
                  messages:
                    - role: user
                      content:
                        - type: text
                          text: 把这张图改成水彩画风
                        - type: image_url
                          image_url:
                            url: https://example.com/photo.png
              multi-turn:
                summary: 多轮迭代改图
                description: 保留历史 messages 继续精调。
                value:
                  model: gpt-image-2.5-vip
                  messages:
                    - role: user
                      content: 生成一张方形猫咪 LOGO，极简线条
                    - role: assistant
                      content: （上一次生成的图片 URL）
                    - role: user
                      content: 把线条颜色换成橙色，背景保持纯白
      responses:
        '200':
          description: 成功生成图片。响应默认返回 R2 CDN URL（`data[0].url`），不会同时返回 `b64_json`。
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatCompletionResponse'
              example:
                data:
                  - url: >-
                      https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png
                created: 1778037331
                usage:
                  input_tokens: 30
                  output_tokens: 2074
                  total_tokens: 2104
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
    ChatCompletionRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: >-
            模型名称：gpt-image-2.5-vip（= sunburst-vip）/ gpt-image-2.5-flare-vip /
            gpt-image-2-vip，同价同调用
          enum:
            - gpt-image-2.5-vip
            - gpt-image-2.5-sunburst-vip
            - gpt-image-2.5-flare-vip
            - gpt-image-2-vip
          default: gpt-image-2.5-vip
        messages:
          type: array
          description: 对话消息数组。支持多轮对话与多模态内容。
          items:
            $ref: '#/components/schemas/ChatMessage'
        size:
          type: string
          description: >
            输出尺寸，可选字段。可传 `auto` 让模型自动决定（vip 在同一提示词下倾向收敛到一个相对固定的尺寸；**带参考图改图时会跟随
            prompt 里点名要修改的那张图的尺寸比例**——多图场景下不一定是第一张），或从 30 档常见尺寸里选（10 比例 × 1K
            Fast / 2K Recommended / 4K Detail）严格锁尺寸。不传则由 prompt 描述决定。

            写法：`宽x高`（半角小写 x），如 `2048x1360`、`3840x2160`。所有档位统一价 $0.03/张。
          enum:
            - auto
            - 1280x1280
            - 848x1280
            - 1280x848
            - 960x1280
            - 1280x960
            - 1024x1280
            - 1280x1024
            - 720x1280
            - 1280x720
            - 1280x544
            - 2048x2048
            - 1360x2048
            - 2048x1360
            - 1536x2048
            - 2048x1536
            - 1632x2048
            - 2048x1632
            - 1152x2048
            - 2048x1152
            - 2048x864
            - 2880x2880
            - 2336x3520
            - 3520x2336
            - 2480x3312
            - 3312x2480
            - 2560x3216
            - 3216x2560
            - 2160x3840
            - 3840x2160
            - 3840x1632
          example: 2048x1152
        stream:
          type: boolean
          default: false
          description: 是否流式返回。本模型为一次性出图，建议保持 false。Playground 不支持流式预览。
        temperature:
          type: number
          minimum: 0
          maximum: 2
          default: 1
          description: 采样温度（对生图影响较小，保持默认即可）
    ChatCompletionResponse:
      type: object
      description: |
        对话式端点的响应格式。`data[0]` 中**只会出现 `url` 或 `b64_json` 之一**，本端点默认返回 `url`。
      properties:
        data:
          type: array
          description: 生成结果数组（本模型单次返回 1 张）
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN 加速链接（默认返回）
              b64_json:
                type: string
                description: Base64 编码的 data URL（少数情况下出现，已含 data:image/png;base64, 前缀）
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
    ChatMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          enum:
            - system
            - user
            - assistant
          description: 消息角色：system（系统设定）、user（用户输入）、assistant（助手回复，用于多轮上下文）
        content:
          oneOf:
            - type: string
              description: 纯文本消息。用于文生图或文本指令。
            - type: array
              description: 多模态消息数组。用于带参考图改图场景。
              items:
                $ref: '#/components/schemas/MessageContentPart'
          description: 消息内容。字符串用于纯文本；数组用于多模态（文本 + 图片）。
    MessageContentPart:
      type: object
      description: 多模态消息片段。可以是文本或图片 URL。
      required:
        - type
      properties:
        type:
          type: string
          enum:
            - text
            - image_url
          description: 片段类型：text（文本）或 image_url（图片引用）
        text:
          type: string
          description: 当 type=text 时的文本内容
          example: 把这张图改成水彩画风
        image_url:
          $ref: '#/components/schemas/ImageUrl'
    ImageUrl:
      type: object
      description: 图片引用。支持 HTTPS URL 或 base64 data URL。
      required:
        - url
      properties:
        url:
          type: string
          description: 图片 URL。支持 https://... 或 data:image/png;base64,... 两种形式。单张建议 ≤ 10MB。
          example: https://example.com/photo.png
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````