> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生圖 API 參考

> Nano Banana 2 Lite 文生圖 API 參考與線上除錯 — 輸入文本描述生成圖片

<Info>
  右側的互動式 Playground 支援下拉選擇引數（寬高比、響應型別等）。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），即可一鍵傳送請求測試。
</Info>

<Tip>
  **場景說明**：本頁用於「文本生成圖片」。只需輸入提示詞即可，無需上傳任何圖片。如需根據現有圖片做編輯，請使用 [圖片編輯介面](/zh-Hant/api-capabilities/nano-banana-lite-image/image-edit)。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制（重要）**

  本介面的響應裡包含 base64 編碼的圖片（`inlineData.data`，數 MB 量級）。受瀏覽器渲染限制，右側 Playground 在收到響應後**可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法把這麼長的 base64 顯示出來。

  **推薦做法**（小白零踩坑）：

  * **直接複製下方"程式碼示例"中的 Python / Node.js / cURL 到本地執行**，程式碼會自動 `base64.b64decode` 並把圖片**儲存為本地檔案**。
  * Nano Banana 2 Lite 專注 1K 畫布，響應體量適中，但仍建議本地執行以穩妥儲存圖片。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

## 程式碼示例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "一隻可愛的柴犬坐在櫻花樹下，水彩畫風格，高畫質細節"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": PROMPT}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("output.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("圖片已儲存至 output.png")
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "未來主義的城市夜景，霓虹燈，賽博朋克風格"}]}],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
    }
  }'
```

### Node.js

```javascript theme={null}
import fs from "fs";

const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "未來主義的城市夜景，霓虹燈，賽博朋克風格" }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
      }
    })
  }
);

const data = await response.json();
const imgBase64 = data.candidates[0].content.parts[0].inlineData.data;
fs.writeFileSync("output.png", Buffer.from(imgBase64, "base64"));
```

### OpenAI 相容模式

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite-image",
    stream=False,
    messages=[{"role": "user", "content": "一幅秋天的山水畫，遠處有紅葉和飛鳥"}]
)

print(response.choices[0].message.content)
```

## 引數說明速查

| 引數                                         | 型別     | 必填 | 說明                               |
| ------------------------------------------ | ------ | -- | -------------------------------- |
| `contents[].parts[].text`                  | string | 是  | 文本提示詞                            |
| `generationConfig.responseModalities`      | array  | 是  | `["IMAGE"]` 或 `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | 否  | 14 種寬高比，預設 `1:1`                 |
| `generationConfig.imageConfig.imageSize`   | string | 否  | 僅支援 `1K`（Lite 專注 1K 畫布）          |

<Tip>
  詳細的引數文件、可選值和預設值請檢視右側 Playground 中的欄位說明，所有 enum 型別欄位（如 `aspectRatio`）都支援下拉選擇，無需手動輸入。
</Tip>

<Info>
  **從 Nano Banana 2 遷移**：只需把模型名從 `gemini-3.1-flash-image` 改為 `gemini-3.1-flash-lite-image`，其它引數保持不變。注意 Lite 僅支援 `1K` 解析度，如傳入 `2K/4K` 請改回 `1K`。
</Info>


## OpenAPI

````yaml api-reference/nano-banana-lite-generate-openapi.yaml POST /v1beta/models/gemini-3.1-flash-lite-image:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Lite 文生图 API
  description: |
    谷歌最快最省的图像模型 Nano Banana 2 Lite（gemini-3.1-flash-lite-image）— 文生图接口。

    约 4 秒出图、专注 1K 画布，支持 14 种宽高比。

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
  /v1beta/models/gemini-3.1-flash-lite-image:generateContent:
    post:
      tags:
        - 文生图
      summary: 文生图：根据文本描述生成图片
      description: >
        使用 Nano Banana 2 Lite 模型，根据文本提示词生成图片。


        - 仅需要输入提示词（`text`）和生成配置

        - 支持 14 种宽高比，专注 1K 分辨率

        - 如需「图片编辑」请使用
        [图片编辑接口](/api-capabilities/nano-banana-lite-image/image-edit)
      operationId: generateNanoBananaLiteTextToImage
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
                  imageSize: 1K
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
          example: 一只可爱的柴犬坐在樱花树下，水彩画风格
    ImageConfig:
      type: object
      description: 图片生成配置
      properties:
        aspectRatio:
          type: string
          description: 宽高比，支持 14 种
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
          default: '1:1'
        imageSize:
          type: string
          description: 输出分辨率（Lite 专注 1K 画布）
          enum:
            - 1K
          default: 1K
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````