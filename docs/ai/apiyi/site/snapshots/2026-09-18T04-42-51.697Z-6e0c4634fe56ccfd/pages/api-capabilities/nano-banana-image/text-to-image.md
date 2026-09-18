> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生图 API 参考

> Nano Banana Pro 文生图 API 参考与在线调试 — 输入文本描述生成图片

<Info>
  右侧的交互式 Playground 支持下拉选择参数（宽高比、分辨率、响应类型等）。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），即可一键发送请求测试。
</Info>

<Tip>
  **场景说明**：本页用于「文本生成图片」。只需输入提示词即可，无需上传任何图片。如需根据现有图片做编辑，请使用 [图片编辑接口](/api-capabilities/nano-banana-image/image-edit)。
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制（重要）**

  本接口的响应里包含 base64 编码的图片（`inlineData.data`，数 MB 量级）。受浏览器渲染限制，右侧 Playground 在收到响应后**可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法把这么长的 base64 显示出来。

  **推荐做法**（小白零踩坑）：

  * **直接复制下方"代码示例"中的 Python / Node.js / cURL 到本地运行**，代码会自动 `base64.b64decode` 并把图片**保存为本地文件**。
  * 如要在浏览器里试 Playground，把 `imageSize` 设为最小档（如 `1K`），缩小响应体积。
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
PROMPT = "一只可爱的小猫坐在花园里，油画风格，高清，细节丰富"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
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

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("output.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("图片已保存至 output.png")
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
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
  "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
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
const imgBase64 = data.candidates[0].content.parts[0].inlineData.data;
fs.writeFileSync("output.png", Buffer.from(imgBase64, "base64"));
```

## 参数说明速查

| 参数                                         | 类型     | 必填 | 说明                               |
| ------------------------------------------ | ------ | -- | -------------------------------- |
| `contents[].parts[].text`                  | string | 是  | 文本提示词                            |
| `generationConfig.responseModalities`      | array  | 是  | `["IMAGE"]` 或 `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | 否  | 10 种宽高比，默认 `1:1`                 |
| `generationConfig.imageConfig.imageSize`   | string | 否  | `1K` / `2K` / `4K`，默认 `1K`       |

<Tip>
  详细的参数文档、可选值和默认值请查看右侧 Playground 中的字段说明，所有 enum 类型字段（如 `aspectRatio`、`imageSize`）都支持下拉选择，无需手动输入。
</Tip>

<Warning>
  **不支持的功能**

  以下谷歌官方功能在 API易 中**不支持**，需要单独计费：

  * **Grounding with Google Search**（谷歌搜索增强）：通过 `tools: [{"google_search": {}}]` 调用实时搜索信息
  * **thinkingConfig**（思维模式）：仅 Nano Banana 2 支持，Nano Banana Pro 不支持此参数

  如需搜索增强功能，请联系客服了解单独计费方案。
</Warning>


## OpenAPI

````yaml api-reference/nano-banana-pro-generate-openapi.yaml POST /v1beta/models/gemini-3-pro-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana Pro 文生图 API
  description: |
    Google 图像生成模型 Nano Banana Pro（gemini-3-pro-image-preview）— 文生图接口。

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
  /v1beta/models/gemini-3-pro-image-preview:generateContent:
    post:
      tags:
        - 文生图
      summary: 文生图：根据文本描述生成图片
      description: |
        使用 Nano Banana Pro 模型，根据文本提示词生成图片。

        - 仅需要输入提示词（`text`）和生成配置
        - 支持 10 种宽高比、3 档分辨率（1K / 2K / 4K）
        - 4K 超高清支持，业界最佳文字渲染
        - 如需「图片编辑」请使用 [图片编辑接口](/api-capabilities/nano-banana-image/image-edit)
      operationId: generateNanoBananaProTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              contents:
                - parts:
                    - text: 一只可爱的小猫坐在花园里，油画风格，高清，细节丰富
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
    TextPart:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          description: 文本提示词，描述要生成的图片内容
          example: 一只可爱的小猫坐在花园里，油画风格，高清
    ImageConfig:
      type: object
      description: 图片生成配置
      properties:
        aspectRatio:
          type: string
          description: 宽高比，支持 10 种
          enum:
            - '1:1'
            - '2:3'
            - '3:2'
            - '3:4'
            - '4:3'
            - '4:5'
            - '5:4'
            - '9:16'
            - '16:9'
            - '21:9'
          default: '1:1'
        imageSize:
          type: string
          description: 输出分辨率
          enum:
            - 1K
            - 2K
            - 4K
          default: 1K
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````