> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 对话式 API 参考

> gpt-image-2-all 对话式端点 — 一个端点同时支持文生图与带参考图改图，直接传入在线图片 URL；多轮改图请把上一张输出作为新一轮 user 消息的参考图。

<Note>
  **本调用方式不再主推**：推荐统一使用 [/v1/images/generations](/api-capabilities/gpt-image-2-all/text-to-image) 与 [/v1/images/edits](/api-capabilities/gpt-image-2-all/image-edit)——更稳定、与官转 `gpt-image-2` 同套代码。本页对话式端点仍可正常调用，适合多轮迭代改图、直接传在线图片 URL 的场景。
</Note>

<Info>
  **对话式端点特点**：**一个端点同时支持文生图与带参考图改图**，方便直接传入**在线图片 URL**（CDN 链接或 base64 data URL）作为参考图。响应为标准 Chat Completions 格式，图片以 Markdown 形式放在 `choices[0].message.content` 里。

  如果你希望同一套代码兼容官转和官逆，建议使用 `/v1/images/generations` 与 `/v1/images/edits`（OpenAI Images API 标准格式）。
</Info>

<Tip>
  **选择模式**：

  * 仅输入文本 `messages` → **文生图**
  * `messages` 的 user 消息里加入 `image_url`（URL 或 base64 data URL）→ **带参考图改图**
  * 要**多轮改上一张图** → 把上一次输出的图片 URL，放进**新一轮 user 消息的 `image_url`** 里再发（见下方[多轮改图](#多轮改图)）
</Tip>

<Warning>
  **多轮改图不能靠保留对话历史。** 本模型是逆向模型，**只读取最后一条 user 消息里的 `image_url` 作为底图**；放在 `assistant` 历史消息里的图片（无论纯文本 URL 还是 `image_url` 结构）**都会被忽略**。要改上一张图，必须把它作为**新一轮 user 消息的参考图**重新传入 —— 详见 [多轮改图](#多轮改图)。
</Warning>

## 响应格式

响应为**标准 Chat Completions 格式**，生成的图片以 **Markdown** 形式放在 `choices[0].message.content` 中（默认是 R2 CDN 链接）：

```json theme={null}
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1778037331,
  "model": "gpt-image-2.5-all",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "![image](https://r2cdn.copilotbase.com/r2cdn2/xxxx.png)\n\n"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 24, "completion_tokens": 818, "total_tokens": 842 }
}
```

<Info>
  **取图建议**：从 `choices[0].message.content` 里**用正则提取 Markdown 链接** `![...](url)` 即可。极少数情况下 `content` 里是 base64 data URL（`![image](data:image/png;base64,...)`），同样可被正则取出，直接作为 `<img src>` 使用。
</Info>

<Warning>
  **🖥️ 浏览器 Playground 限制（响应含 base64 时）**：若 `content` 里返回的是大段 base64，响应字符串可能达数 MB，Playground **可能弹出** `请求时发生错误: unable to complete request` —— **实际请求已成功**，只是浏览器无法显示这么长的内容。遇到时直接复制下方代码到本地运行即可。
</Warning>

## 代码示例

<Note>
  响应是标准 Chat Completions 结构，含 `choices` 字段，因此**也可以直接用 OpenAI SDK**（`client.chat.completions.create(...)`）调用，从 `resp.choices[0].message.content` 取到 Markdown，再提取图片 URL。下面用通用的 `requests` / `fetch` 演示。
</Note>

### Python（文生图）

```python theme={null}
import re, requests

API_KEY = "sk-your-api-key"

resp = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "gpt-image-2.5-all",
        "messages": [
            {"role": "user", "content": "横版 16:9 电影画幅，黄昏时的海边老灯塔，写实风格"}
        ],
    },
    timeout=300,  # 保守值，吸收长尾 + 图片上传/下载耗时
).json()

content = resp["choices"][0]["message"]["content"]
url = re.search(r'!\[[^\]]*\]\((.*?)\)', content).group(1)  # 提取 Markdown 里的图片地址
print(url)
```

### Python（带参考图改图）

```python theme={null}
import re, base64, requests

API_KEY = "sk-your-api-key"

# 可用 HTTPS URL，也可以用 base64 data URL
with open("photo.png", "rb") as f:
    data_url = "data:image/png;base64," + base64.b64encode(f.read()).decode()

resp = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "model": "gpt-image-2.5-all",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "把这张图改成水彩画风"},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
    },
    timeout=300,
).json()

content = resp["choices"][0]["message"]["content"]
print(re.search(r'!\[[^\]]*\]\((.*?)\)', content).group(1))
```

### cURL（文生图）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-all",
    "messages": [
      {"role": "user", "content": "横版 16:9，赛博朋克雨夜街景，霓虹招牌写着 Hello World"}
    ]
  }'
{/* 图片在 choices[0].message.content 里，形如 ![image](https://...png) */}
```

### cURL（带参考图改图）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-all",
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
import { Agent, setGlobalDispatcher } from "undici";

const API_KEY = "sk-your-api-key";

// 出图是长请求，而 undici 默认建连超时只有 10 秒，且不受下面 AbortSignal.timeout
// 控制（两者是不同层），必须单独放宽
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const resp = await fetch("https://api.apiyi.com/v1/chat/completions", {
  method: "POST",
  signal: AbortSignal.timeout(300_000),   // 总超时，与上面三个是不同层
  headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-image-2.5-all",
    messages: [{ role: "user", content: "1024x1024 方形 LOGO，极简猫咪线条" }],
  }),
});

const data = await resp.json();
const content = data.choices[0].message.content;
const url = content.match(/!\[[^\]]*\]\((.*?)\)/)[1];  // 提取图片地址
console.log(url);
```

<Tip>
  上面的 `undici` 需要单独安装（`npm i undici`）——它虽然是内置 `fetch` 的底层实现，但没有以模块名对外暴露；装出来的这份调用 `setGlobalDispatcher` 会同时影响内置 `fetch`。

  `maxRetries`、`connectTimeout` 与「总超时」分属不同层，配错层是 Node 侧最常见的踩坑；连接被重置、`UND_ERR_CONNECT_TIMEOUT`、挂代理导致大响应体收不全等情况，排查方法见[图片 API 连接中断排查](/api-capabilities/image-connection-drops)。
</Tip>

## 多轮改图

要在上一张图的基础上继续修改，**不要依赖对话历史**（assistant 里的图会被忽略）。正确做法：**把上一次输出的图片 URL，作为新一轮 user 消息的 `image_url` 再发一次**，配合新的修改指令。要继续迭代，就把最新一张的输出再喂回去。

```python theme={null}
import re, requests

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1/chat/completions"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}


def edit_with(image_url, instruction):
    """把 image_url 作为底图，按 instruction 改图，返回新图 URL。"""
    resp = requests.post(URL, headers=H, json={
        "model": "gpt-image-2.5-all",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": instruction},
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        }],
    }, timeout=300).json()
    content = resp["choices"][0]["message"]["content"]
    return re.search(r'!\[[^\]]*\]\((.*?)\)', content).group(1)


# 第 1 轮：基于原图改沙发颜色
img1 = edit_with("https://example.com/cat.png", "把沙发改成红色，猫和构图保持不变")
# 第 2 轮：把上一轮输出再喂回去，继续精调
img2 = edit_with(img1, "给猫戴一顶黄色小帽子，其它保持不变")
print(img2)
```

<Warning>
  下面这种"靠 `assistant` 历史的真·对话多轮"**不生效**（产出不会基于上一张图），请勿使用：

  ```json theme={null}
  {"messages": [
    {"role": "user", "content": "生成一只橙色的猫坐在蓝色沙发上"},
    {"role": "assistant", "content": "![image](https://.../cat.png)"},
    {"role": "user", "content": "把沙发改成红色"}
  ]}
  ```

  改成把 `https://.../cat.png` 放进**新一轮 user 消息的 `image_url`**（见上方代码）才会真正基于该图修改。
</Warning>

<Tip>
  等价做法：用 `/v1/images/edits` 标准编辑端点，把上一次输出图片作为 `image` 字段上传 + 新指令，同样实现多轮迭代 —— 见 [图片编辑 API](/api-capabilities/gpt-image-2-all/image-edit)。
</Tip>

## 参数说明速查

| 参数                   | 类型              | 必填 | 说明                                                                                  |
| -------------------- | --------------- | -- | ----------------------------------------------------------------------------------- |
| `model`              | string          | 是  | `gpt-image-2.5-all` 或 `gpt-image-2-all`（同价同行为）                                      |
| `messages`           | array           | 是  | 对话消息数组；支持 `system` / `user` / `assistant` 三种 role（注意：图像底图只认最后一条 user 的 `image_url`） |
| `messages[].content` | string \| array | 是  | 纯文本字符串（文生图）或多模态数组（带图改图）                                                             |
| `stream`             | boolean         | 否  | 是否流式。本模型为一次性出图，建议保持 `false`                                                         |

**多模态 content 片段**（`content` 为数组时）：

| 字段              | 类型     | 必填 | 说明                                                                    |
| --------------- | ------ | -- | --------------------------------------------------------------------- |
| `type`          | enum   | 是  | `text` 或 `image_url`                                                  |
| `text`          | string | 条件 | 当 `type=text` 时必填                                                     |
| `image_url.url` | string | 条件 | 当 `type=image_url` 时必填。支持 `https://...` 或 `data:image/png;base64,...` |

## 对话式端点的优势

<CardGroup cols={2}>
  <Card title="同端点双能力" icon="plug">
    不需要在 generations / edits 两个端点之间切换，统一走一个端点
  </Card>

  <Card title="方便传入在线 URL" icon="link">
    `image_url` 直接接受 CDN 图片地址或 base64 data URL，无需 multipart 上传
  </Card>

  <Card title="标准 Chat 响应" icon="code">
    响应含 `choices`，可直接用 OpenAI SDK / 各类 Chat 前端对接，图片在 `message.content` 的 Markdown 里
  </Card>

  <Card title="迭代改图" icon="image">
    把上一张输出作为新一轮 user 的参考图，即可逐步精调（非对话状态记忆）
  </Card>
</CardGroup>

<Tip>
  如果你的代码需要**同时兼容官转与官逆**，建议改用 `/v1/images/generations` 与 `/v1/images/edits`（OpenAI Images API 标准格式），同一套代码即可切换通道。
</Tip>

## 相关资源

<CardGroup cols={2}>
  <Card title="模型概览" icon="sparkles" href="/api-capabilities/gpt-image-2-all/overview">
    能力说明、定价、最佳实践
  </Card>

  <Card title="文生图 API（/v1/images/generations）" icon="wand-sparkles" href="/api-capabilities/gpt-image-2-all/text-to-image">
    OpenAI Images API 兼容端点
  </Card>

  <Card title="图片编辑 API（/v1/images/edits）" icon="image" href="/api-capabilities/gpt-image-2-all/image-edit">
    multipart/form-data 上传参考图改图，多轮迭代同理
  </Card>

  <Card title="在线出图" icon="globe" href="https://imagen.apiyi.com">
    imagen.apiyi.com 在线测试
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-all-chat-openapi.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: gpt-image-2-all 对话式 API（⭐ 主推）
  description: >
    GPT 图像生成官逆模型 `gpt-image-2-all` — 对话式端点（OpenAI Chat Completions 兼容格式）。


    **⭐ 主推端点**：相比 `/v1/images/generations` 和 `/v1/images/edits`，对话式端点对
    **提示词遵循更好**，并且 **同一端点同时支持文生图与带参考图改图**。


    - 仅输入 `messages`（纯文本）→ 文生图

    - `messages` 的 user 消息中带 `image_url` → 带参考图改图

    - `image_url.url` 支持 `https://...` 或 `data:image/png;base64,...`

    - **多轮改图**：把上一次输出的图片 URL，作为**新一轮 user 消息的 `image_url`** 再发（assistant
    历史里的图会被忽略）

    - 按次计费 $0.03/张

    - **响应为标准 Chat Completions 格式**，图片以 Markdown 形式放在
    `choices[0].message.content`（默认 R2 CDN 链接）

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
        - 对话式（主推）
      summary: 对话式生图 / 改图（⭐ 主推）
      description: >
        使用 `gpt-image-2-all` 的对话式端点，通过 `messages` 数组生成或编辑图片。


        - **文生图**：`messages` 仅含文本

        - **带图改图**：user 消息中添加 `image_url`（URL 或 base64 data URL）

        - **多轮改图**：把上一次输出的图片 URL 作为**新一轮 user 消息的 `image_url`**
        再发。注意：本模型只读取**最后一条 user 消息里的 `image_url`** 作为底图，`assistant`
        历史里的图片会被忽略，因此**不能靠保留对话历史做多轮**。


        响应为标准 Chat Completions 格式，图片以 Markdown（`![image](url)`）放在
        `choices[0].message.content`。
      operationId: chatGptImage2All
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatCompletionRequest'
            examples:
              text-to-image:
                summary: 文生图（纯文本）
                description: 仅输入文本提示词，生成图片。尺寸/比例写在 prompt 里。
                value:
                  model: gpt-image-2.5-all
                  messages:
                    - role: user
                      content: 横版 16:9 电影画幅，黄昏时的海边老灯塔，写实风格
              edit-with-reference:
                summary: 带参考图改图（多模态）
                description: 提供一张参考图（URL 或 base64 data URL）+ 编辑指令。
                value:
                  model: gpt-image-2.5-all
                  messages:
                    - role: user
                      content:
                        - type: text
                          text: 把这张图改成水彩画风
                        - type: image_url
                          image_url:
                            url: https://example.com/photo.png
              multi-turn:
                summary: 多轮改图（把上一张输出当参考图）
                description: >-
                  多轮改图 = 把上一次输出的图片 URL 作为新一轮 user 消息的 image_url 再发，配合新指令。不要靠
                  assistant 历史（会被忽略）。
                value:
                  model: gpt-image-2.5-all
                  messages:
                    - role: user
                      content:
                        - type: text
                          text: 把沙发改成红色，猫和构图保持不变
                        - type: image_url
                          image_url:
                            url: https://r2cdn.copilotbase.com/r2cdn2/上一次输出图片.png
      responses:
        '200':
          description: >-
            成功生成图片。标准 Chat Completions 格式，图片以 Markdown 放在
            `choices[0].message.content`。
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatCompletionResponse'
              example:
                id: chatcmpl-xxx
                object: chat.completion
                created: 1778037331
                model: gpt-image-2.5-all
                choices:
                  - index: 0
                    message:
                      role: assistant
                      content: >+
                        ![image](https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png)

                    finish_reason: stop
                usage:
                  prompt_tokens: 24
                  completion_tokens: 818
                  total_tokens: 842
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
          description: 模型名称：gpt-image-2.5-all 或 gpt-image-2-all（同一 ChatGPT 网页版线路，同价同行为）
          enum:
            - gpt-image-2.5-all
            - gpt-image-2-all
          default: gpt-image-2.5-all
        messages:
          type: array
          description: 对话消息数组。底图只取最后一条 user 消息里的 image_url。
          items:
            $ref: '#/components/schemas/ChatMessage'
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
      description: >
        标准 Chat Completions 响应。生成的图片以 Markdown（`![image](url)`）放在
        `choices[0].message.content`，默认是 R2 CDN 链接；极少数情况下为 base64 data URL。
      properties:
        id:
          type: string
          description: 响应 ID
        object:
          type: string
          example: chat.completion
        created:
          type: integer
          description: 创建时间戳（Unix 秒）
        model:
          type: string
          example: gpt-image-2-all
        choices:
          type: array
          items:
            type: object
            properties:
              index:
                type: integer
              message:
                type: object
                properties:
                  role:
                    type: string
                    example: assistant
                  content:
                    type: string
                    description: 含图片的 Markdown，形如 ![image](https://...png)
              finish_reason:
                type: string
                example: stop
        usage:
          type: object
          description: Token 用量统计
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
            total_tokens:
              type: integer
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
          description: 消息角色。注意：放在 assistant 里的图片不会被当作底图。
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