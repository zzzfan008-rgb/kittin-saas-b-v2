> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生图 API 参考

> Nano Banana 2.1 文生图 API 参考与在线调试 — 输入文本描述生成图片

<Info>
  右侧的交互式 Playground 支持下拉选择参数（宽高比、分辨率、响应类型等）。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），即可一键发送请求测试。
</Info>

<Tip>
  **场景说明**：本页用于「文本生成图片」。只需输入提示词即可，无需上传任何图片。如需根据现有图片做编辑，请使用 [图片编辑接口](/api-capabilities/gemini-nano-banana-2.1/image-edit)。
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制（重要）**

  本接口的响应里包含 base64 编码的图片（`inlineData.data`，数 MB 量级）。受浏览器渲染限制，右侧 Playground 在收到响应后**可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法把这么长的 base64 显示出来。

  **推荐做法**（小白零踩坑）：

  * **直接复制下方"代码示例"中的 Python / Node.js / cURL 到本地运行**，代码会自动 `base64.b64decode` 并把图片**保存为本地文件**。
  * 如要在浏览器里试 Playground，把 `imageSize` 设为最小档（`1K`），缩小响应体积。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

## 代码示例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "一只可爱的柴犬坐在樱花树下，水彩画风格，高清细节"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": PROMPT}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
        }
    },
    timeout=300
).json()

img_data = [p for p in response["candidates"][0]["content"]["parts"] if "inlineData" in p][-1]["inlineData"]["data"]
with open("output.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("图片已保存至 output.png")
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "未来主义的城市夜景，霓虹灯，赛博朋克风格"}]}],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
    }
  }'
```

### Node.js

```javascript theme={null}
import fs from "fs";

const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "未来主义的城市夜景，霓虹灯，赛博朋克风格" }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "2K" }
      }
    })
  }
);

const data = await response.json();
const imgBase64 = data.candidates[0].content.parts.filter((p) => p.inlineData).at(-1).inlineData.data;
fs.writeFileSync("output.png", Buffer.from(imgBase64, "base64"));
```

## 参数说明速查

| 参数 | 类型 | 必填 | 说明 |
| - | - | - | - |
| `contents[].parts[].text` | string | 是 | 文本提示词 |
| `generationConfig.responseModalities` | array | 是 | `["IMAGE"]` 或 `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | 否 | 14 种宽高比；不传时由模型按内容自选，建议显式传 |
| `generationConfig.imageConfig.imageSize` | string | 否 | `1K` / `2K` / `4K`（不支持 `512`），默认 `1K` |
| `generationConfig.thinkingConfig.thinkingLevel` | string | 否 | `minimal` / `medium` / `high`，默认 `medium` |
| `generationConfig.thinkingConfig.includeThoughts` | boolean | 否 | 是否返回思维过程文本，默认 `false` |

<Tip>
  详细的参数文档、可选值和默认值请查看右侧 Playground 中的字段说明，所有 enum 类型字段（如 `aspectRatio`、`imageSize`、`thinkingLevel`）都支持下拉选择，无需手动输入。
</Tip>

<Info>
  **Google 搜索接地**：可在请求顶层加 `"tools": [{"googleSearch": {}}]`，每次检索另收 \$0.014，检索次数由模型决定。详见 [Nano Banana 2.1 概览](/api-capabilities/gemini-nano-banana-2.1/overview)。
</Info>


## OpenAPI

````yaml api-reference/gemini-nano-banana-2.1-generate-openapi.yaml POST /v1beta/models/gemini-nano-banana-2.1:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2.1 文生图 API
  description: |
    Google 图像生成模型 Nano Banana 2.1（gemini-nano-banana-2.1）— 文生图接口。

    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`

    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
security:
  - bearerAuth: []
paths:
  /v1beta/models/gemini-nano-banana-2.1:generateContent:
    post:
      tags:
        - 文生图
      summary: 文生图：根据文本描述生成图片
      description: >
        使用 Nano Banana 2.1 模型，根据文本提示词生成图片。


        - 仅需要输入提示词（`text`）和生成配置

        - 支持 14 种宽高比、3 档分辨率（1K / 2K / 4K）

        - 如需「图片编辑」请使用
        [图片编辑接口](/api-capabilities/gemini-nano-banana-2.1/image-edit)
      operationId: generateNanoBanana21TextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              contents:
                - parts:
                    - text: 一只可爱的柴犬坐在樱花树下，水彩画风格，高清细节
              generationConfig:
                responseModalities:
                  - IMAGE
                imageConfig:
                  aspectRatio: '16:9'
                  imageSize: 2K
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerateContentResponse'
        '401':
          description: 未授权 - API Key 无效
        '429':
          description: 请求频率超限
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    TextToImageRequest:
      type: object
      required:
        - contents
        - generationConfig
      properties:
        contents:
          type: array
          description: 内容数组，包含文本提示词
          items:
            $ref: '#/components/schemas/TextContent'
        generationConfig:
          $ref: '#/components/schemas/GenerationConfig'
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          description: 生成结果数组
          items:
            type: object
            properties:
              content:
                type: object
                properties:
                  parts:
                    type: array
                    items:
                      type: object
                      properties:
                        inlineData:
                          type: object
                          properties:
                            mimeType:
                              type: string
                              example: image/png
                            data:
                              type: string
                              description: Base64 编码的图片数据
              finishReason:
                type: string
                example: STOP
        usageMetadata:
          type: object
          properties:
            promptTokenCount:
              type: integer
              example: 10
            candidatesTokenCount:
              type: integer
              example: 258
    TextContent:
      type: object
      required:
        - parts
      properties:
        parts:
          type: array
          description: 内容片段数组
          items:
            $ref: '#/components/schemas/TextPart'
    GenerationConfig:
      type: object
      required:
        - responseModalities
      properties:
        responseModalities:
          type: array
          description: 响应类型。IMAGE 仅返回图片，TEXT+IMAGE 同时返回文本和图片
          items:
            type: string
            enum:
              - IMAGE
              - TEXT
          default:
            - IMAGE
          example:
            - IMAGE
        imageConfig:
          $ref: '#/components/schemas/ImageConfig'
        thinkingConfig:
          $ref: '#/components/schemas/ThinkingConfig'
    TextPart:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          description: 文本提示词，描述要生成的图片内容
          example: 一只可爱的柴犬坐在樱花树下，水彩画风格
    ImageConfig:
      type: object
      description: 图片生成配置
      properties:
        aspectRatio:
          type: string
          description: 宽高比，支持 14 种。不传时由模型按内容自行决定（实测风景类多为 16:9、海报类多为 2:3 / 3:4），需要固定比例请显式传
          enum:
            - '1:1'
            - '1:4'
            - '4:1'
            - '1:8'
            - '8:1'
            - '2:3'
            - '3:2'
            - '3:4'
            - '4:3'
            - '4:5'
            - '5:4'
            - '9:16'
            - '16:9'
            - '21:9'
        imageSize:
          type: string
          description: 输出分辨率
          enum:
            - 1K
            - 2K
            - 4K
          default: 1K
    ThinkingConfig:
      type: object
      description: 思考配置。Nano Banana 2.1 默认就会先思考再出图（默认档 medium），思考 tokens 与图片一起计入输出计费
      properties:
        thinkingLevel:
          type: string
          description: 思考深度：minimal / medium（默认）/ high。实测 high 比默认多约 30% 思考 tokens
          enum:
            - minimal
            - medium
            - high
          default: medium
        includeThoughts:
          type: boolean
          description: 是否在响应中返回思维过程文本。注意：无论是否开启，思维 token 都会计费
          default: false
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.