> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生图 API 参考

> gpt-image-2-all 文生图 API 参考与在线调试 — 输入文本描述生成图片，$0.03/张

<Info>
  右侧的交互式 Playground 支持直接在线调试。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），输入 prompt 后一键发送即可。
</Info>

<Tip>
  **场景说明**：本页用于「文本生成图片」。只需输入提示词即可，无需上传任何图片。如需根据现有图片做编辑或融合，请使用 [图片编辑接口](/api-capabilities/gpt-image-2-all/image-edit)。
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制（默认 b64\_json 模式）**

  本端点**默认 `response_format: "b64_json"`**，响应会包含数 MB 的 base64 字符串，浏览器 Playground **可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法显示这么长的 base64。

  **推荐做法**：

  * 只想在 Playground 里看图：**显式传 `"response_format": "url"`**，响应是单条 R2 链接，浏览器渲染正常。
  * 想要 base64：**复制下方"代码示例"到本地运行**，代码会自动解码并把图片保存为本地文件。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

<Warning>
  **⚠️ 参数支持情况**

  * **`size`**：**字段不生效**——传 `auto` 或具体尺寸都不会报错，但会被服务端**静默忽略**。最终尺寸完全由 prompt 决定：
    * prompt 写了尺寸/比例（如"横版 16:9"）→ 模型会遵循 prompt
    * prompt 没写尺寸 → 同一 prompt 多次调用会**抽卡式**出现多样化尺寸，适合看多种构图变体
    * 需要严格锁尺寸请改用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/text-to-image)（支持 `auto` + 30 档锁定）
  * **`n` / `quality` / `aspect_ratio`**：❌ 不接受，传入可能触发参数校验错误。

  尺寸与比例请直接写进 `prompt`，例如：

  * `横版 16:9 电影画幅，黄昏时的海边老灯塔`
  * `竖版 9:16 手机壁纸，赛博朋克城市雨夜`
  * `1024×1024 方形 LOGO，极简猫咪线条`

  **建议把尺寸描述放在 prompt 最前面**，模型遵循度更高。
</Warning>

## 代码示例

### Python

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-image-2-all",
        "prompt": "横版 16:9 日落海边的老灯塔，电影画幅，写实风格",
        "response_format": "url"
    },
    timeout=300  # 保守值，吸收长尾 + 图片下载耗时
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**b64\_json 模式（返回 base64 图片数据）**：

```python theme={null}
import base64
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-all",
        "prompt": "1024x1024 方形 LOGO，极简猫咪线条",
        "response_format": "b64_json"
    },
    timeout=300  # 保守值，吸收长尾 + 图片下载耗时
).json()

# 实测（2026-07）b64_json 为纯 base64（无 data: 前缀）；历史版本曾含前缀，做个检测最稳
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-all",
    "prompt": "横版 16:9 电影画幅，黄昏时的海边老灯塔",
    "response_format": "url"
  }'
```

### Node.js

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import { writeFile } from "node:fs/promises";

const API_KEY = "sk-your-api-key";

// 图片接口是「长时间静默 + MB 级响应体」，而 undici 的默认建连超时只有 10 秒，
// 且不受下面 AbortSignal.timeout 控制（两者是不同层），必须单独放宽
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    signal: AbortSignal.timeout(300_000),   // 总超时，与上面三个是不同层
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2-all",
      prompt: "1024x1024 方形 LOGO，极简猫咪线条",
      response_format: "b64_json"
    })
  }
);

const data = await response.json();
// 实测为纯 base64（无 data: 前缀）；历史版本曾自带前缀，做个检测最稳
let b64 = data.data[0].b64_json;
if (b64.startsWith("data:")) b64 = b64.slice(b64.indexOf(",") + 1);
await writeFile("output.png", Buffer.from(b64, "base64"));
```

<Tip>
  上面的 `undici` 需要单独安装（`npm i undici`）——它虽然是内置 `fetch` 的底层实现，但没有以模块名对外暴露；装出来的这份调用 `setGlobalDispatcher` 会同时影响内置 `fetch`。

  `maxRetries`、`connectTimeout` 与「总超时」分属不同层，配错层是 Node 侧最常见的踩坑；连接被重置、`UND_ERR_CONNECT_TIMEOUT`、挂代理导致大响应体收不全等情况，排查方法见[图片 API 连接中断排查](/api-capabilities/image-connection-drops)。
</Tip>

### 浏览器 JavaScript（Fetch）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2-all',
        prompt: '竖版 9:16 手机壁纸，赛博朋克城市雨夜',
        response_format: 'b64_json'
    })
});
const { data } = await resp.json();
let b64 = data[0].b64_json;
if (!b64.startsWith('data:')) b64 = `data:image/png;base64,${b64}`;
document.getElementById('result').src = b64;
```

## 参数说明速查

| 参数                | 类型     | 必填 | 说明                                                    |
| ----------------- | ------ | -- | ----------------------------------------------------- |
| `model`           | string | 是  | 固定填 `gpt-image-2-all`                                 |
| `prompt`          | string | 是  | 提示词，尺寸/比例/风格请写在此处（**唯一控制尺寸的方式**）                      |
| `response_format` | string | 否  | `b64_json`（默认，纯 base64）或 `url`（返回 R2 CDN 链接）；建议始终显式传值 |

<Note>
  本模型**不支持 `size` 入参**——即便传入也会被静默忽略，不会报错；如需用 `size` 字段锁定 30 档尺寸，请改用 [`gpt-image-2-vip`](/api-capabilities/gpt-image-2-vip/text-to-image)。
</Note>

<Tip>
  详细的参数约束和可选值请查看右侧 Playground 中的字段说明，`response_format` 字段支持下拉选择。
</Tip>

## 响应格式

**`data[0]` 中只会出现 `url` 或 `b64_json` 之一**（取决于 `response_format`），不会两者都返回。本端点**默认返回 `b64_json`**。

**`b64_json` 模式**（默认）：

```json theme={null}
{
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
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

**`url` 模式**（需显式 `"response_format": "url"`，R2 CDN 全球加速）：

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
  **兼容性提示**：2026-07 实测 `b64_json` 字段为**纯 base64（不含 `data:` 前缀）**，需解码写文件或自行拼接前缀后渲染；**历史版本曾直接带前缀**。请在代码里做 `startsWith('data:')` 检测后再处理，兼容两种形态。
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-all 文生图 API
  description: >
    GPT 图像生成官逆模型 `gpt-image-2-all` — 文生图接口。


    - 按次计费，$0.03/张

    - 约 30–60 秒出图，支持中文提示词

    - 尺寸/比例/风格请在 `prompt` 中描述；**`size` 字段不生效**（请求里传 `size=auto`
    或具体值都不报错，但会被静默忽略；最终尺寸完全由 prompt 决定，同一 prompt 多次调用会出多样化尺寸，适合"抽卡"对比）；`n` /
    `quality` 也不支持。要严格锁尺寸请用 `gpt-image-2-vip`

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
  /v1/images/generations:
    post:
      tags:
        - 文生图
      summary: 文生图：根据文本描述生成图片
      description: |
        使用 `gpt-image-2-all` 模型，根据文本提示词生成图片。

        - 仅需要输入 `model`、`prompt`
        - 尺寸/比例请直接写进 prompt（如：横版 16:9 电影画幅）
        - 如需编辑或多图融合，请使用 [图片编辑接口](/api-capabilities/gpt-image-2-all/image-edit)
      operationId: generateGptImage2AllTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2-all
              prompt: 横版 16:9 电影画幅，黄昏时的海边老灯塔
              response_format: b64_json
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
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: 模型名称，固定为 gpt-image-2-all
          enum:
            - gpt-image-2-all
          default: gpt-image-2-all
        prompt:
          type: string
          description: 提示词。尺寸/比例/风格请写在此处，例如：横版 16:9 电影画幅，黄昏时的海边老灯塔
          example: 横版 16:9 电影画幅，黄昏时的海边老灯塔
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
        图片生成响应。`data[0]` 中**只会出现 `url` 或 `b64_json` 之一**（取决于
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