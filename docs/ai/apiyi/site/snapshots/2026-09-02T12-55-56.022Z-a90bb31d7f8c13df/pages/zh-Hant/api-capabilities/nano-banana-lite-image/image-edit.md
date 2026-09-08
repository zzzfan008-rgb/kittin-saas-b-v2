> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片編輯 API 參考

> Nano Banana 2 Lite 圖片編輯 API 參考與線上除錯 — 輸入圖片 + 指令生成新圖片

<Info>
  右側的互動式 Playground 支援下拉選擇引數。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），即可一鍵傳送請求測試。
</Info>

<Tip>
  **場景說明**：本頁用於「圖片編輯」，必須上傳一張待編輯的圖片（base64 編碼）+ 編輯指令。如果只想根據文本生成新圖片，請使用 [文生圖介面](/zh-Hant/api-capabilities/nano-banana-lite-image/text-to-image)。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制（重要）**

  本介面的響應裡包含 base64 編碼的圖片（`inlineData.data`，數 MB 量級）。受瀏覽器渲染限制，右側 Playground 在收到響應後**可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法把這麼長的 base64 顯示出來。

  **推薦做法**（小白零踩坑）：

  * **直接複製下方"程式碼示例"中的 Python / Node.js / cURL 到本地執行**，程式碼會自動 `base64.b64decode` 並把圖片**儲存為本地檔案**。
  * 如要在瀏覽器裡試 Playground，**用極小的參考圖（少於 50KB）**，縮小響應體積。
</Warning>

<Warning>
  **⚠️ `parts` 陣列結構（重要，多圖編輯必看）**

  每個 `part` **只能是 `text` 或 `inlineData` 中的一個**，二者不能同時出現在同一個 part 裡。這與谷歌官方 `gemini-3.1-flash-lite-image` 的契約一致。

  **正確**：一個 text part（編輯指令）+ N 個 inlineData part（每張圖一個）：

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "把這兩張圖裡的人物合成到同一個辦公室場景中"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **錯誤**（每個 part 同時塞了 text 和 inlineData，會導致非預期行為）：

  ```json theme={null}
  "contents": [{
    "parts": [
      {"inlineData": {...}, "text": "這是提示詞嗎 1"},
      {"inlineData": {...}, "text": "這是提示詞嗎 2"}
    ]
  }]
  ```
</Warning>

<Warning>
  **🖼️ 關於 `inlineData.data` 欄位**

  本介面是 **JSON 格式**（非 multipart 檔案上傳），所以 Playground 無法直接選擇本地檔案，需要先把圖片轉成 **Base64 字串**再貼上到 `data` 輸入框。

  **一行命令轉換 + 自動複製到剪貼簿**：

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  執行後直接在 Playground 的 `data` 欄位 `Cmd+V` / `Ctrl+V` 貼上即可。同時記得把 `mimeType` 切換為對應的 `image/jpeg` 或 `image/png`。

  **建議**：測試用小圖（少於 200KB），避免 base64 字串過長導致瀏覽器卡頓。頻繁測試圖片編輯更推薦用下方程式碼示例直接在本地執行。
</Warning>

## 程式碼示例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

# 讀取待編輯的圖片
with open("input.jpg", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{
            "parts": [
                {"text": "請把背景模糊化，突出前景的人物"},
                {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}
            ]
        }],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("edited.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("編輯後的圖片已儲存至 edited.png")
```

### Node.js

```javascript theme={null}
import fs from "fs";

const API_KEY = "sk-your-api-key";
const imageB64 = fs.readFileSync("input.jpg").toString("base64");

const response = await fetch(
  "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "請把背景模糊化，突出前景的人物" },
          { inlineData: { mimeType: "image/jpeg", data: imageB64 } }
        ]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
      }
    })
  }
);

const data = await response.json();
const imgBase64 = data.candidates[0].content.parts[0].inlineData.data;
fs.writeFileSync("edited.png", Buffer.from(imgBase64, "base64"));
```

### cURL

```bash theme={null}
# 注意：需要先將圖片轉為 base64 字串
# IMAGE_B64=$(base64 -i input.jpg | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "請把背景模糊化，突出前景的人物"},
        {"inlineData": {"mimeType": "image/jpeg", "data": "'"$IMAGE_B64"'"}}
      ]
    }],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
    }
  }'
```

## 多圖編輯示例

把多張圖作為輸入合成或對比時，**只用一個 `text` part**（編輯指令），後面追加多個 `inlineData` part（每張圖一個）。

### Python（多圖）

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# 準備多張圖（這裡以 2 張為例，最多可上傳多張）
images = ["person1.png", "person2.png"]
parts = [{"text": "把這兩張圖裡的人物合成到同一個辦公室場景中，做著搞怪表情"}]
for path in images:
    parts.append({"inlineData": {"mimeType": "image/png", "data": to_b64(path)}})

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": "5:4", "imageSize": "1K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("merged.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

## 引數說明速查

| 引數                                         | 型別     | 必填 | 說明                                                                                       |
| ------------------------------------------ | ------ | -- | ---------------------------------------------------------------------------------------- |
| `contents[].parts`                         | array  | 是  | 由「**1 個 text part + N 個 inlineData part**」組成。每個 part 只能含 `text` 或 `inlineData` 之一，不可同時出現 |
| `contents[].parts[].text`                  | string | 是  | 編輯指令（建議只放在第一個 part 中）                                                                    |
| `contents[].parts[].inlineData.mimeType`   | string | 是  | `image/jpeg` 或 `image/png`                                                               |
| `contents[].parts[].inlineData.data`       | string | 是  | 圖片的 Base64 編碼（多圖編輯時重複多個 inlineData part）                                                 |
| `generationConfig.responseModalities`      | array  | 是  | 通常為 `["IMAGE"]`                                                                          |
| `generationConfig.imageConfig.aspectRatio` | string | 否  | 14 種寬高比，預設 `1:1`                                                                         |
| `generationConfig.imageConfig.imageSize`   | string | 否  | 僅支援 `1K`（Lite 專注 1K 畫布）                                                                  |

## 多輪對話式編輯

Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）支援**對話式多輪編輯**：把模型每一輪產出的圖片，作為 **`role: "model"` 的 `inlineData`** 追加回 `contents`，再發下一條 user 指令。模型會基於**完整對話歷史**繼續修改並**累積效果**（例如先改沙發顏色、再加配飾，前一步的改動會保留）。

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1", "imageSize": "1K"}}

contents = []  # 全程維護同一個對話歷史

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # 關鍵：把產出的圖回填進歷史
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))
    return part

turn("生成一隻橙色的貓，坐在藍色沙發上，簡筆畫風格", "step1.png")
turn("把沙發改成紅色，貓和構圖保持不變", "step2.png")       # 基於上一輪的圖修改
turn("給貓戴一頂黃色小帽子，其它保持不變", "step3.png")       # 繼續累積，紅沙發會保留
```

<Tip>
  **從已有圖片開始多輪**：第一輪的 user 訊息裡放 `inlineData`（你自己的圖）+ 指令即可編輯現有照片，之後每輪照樣把模型產出回填進 `contents`。
</Tip>


## OpenAPI

````yaml api-reference/nano-banana-lite-edit-openapi.yaml POST /v1beta/models/gemini-3.1-flash-lite-image:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Lite 图片编辑 API
  description: |
    谷歌最快最省的图像模型 Nano Banana 2 Lite（gemini-3.1-flash-lite-image）— 图片编辑接口。

    输入一张图片 + 编辑指令，生成编辑后的新图片。如需「文生图」请使用文生图接口。

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
        - 图片编辑
      summary: 图片编辑：根据指令编辑现有图片
      description: >
        使用 Nano Banana 2 Lite 模型，根据文本指令对输入图片进行编辑。支持多轮对话式编辑。


        - 必须提供输入图片（`inlineData`，base64 编码）

        - 文本（`text`）描述编辑指令

        - 如需「文生图」请使用
        [文生图接口](/api-capabilities/nano-banana-lite-image/text-to-image)
      operationId: editNanoBananaLiteImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              contents:
                - parts:
                    - text: 把这两张图里的人物合成到同一个办公室场景中，做着搞怪表情
                    - inlineData:
                        mimeType: image/png
                        data: <BASE64_DATA_IMG_1>
                    - inlineData:
                        mimeType: image/png
                        data: <BASE64_DATA_IMG_2>
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
    EditImageRequest:
      type: object
      required:
        - contents
        - generationConfig
      properties:
        contents:
          type: array
          description: 内容数组，包含编辑指令和待编辑的图片
          items:
            $ref: '#/components/schemas/EditContent'
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
    EditContent:
      type: object
      required:
        - parts
      properties:
        parts:
          type: array
          description: |
            内容片段数组。**每个 part 只能是 text 或 inlineData 中的一个，二者不能同时出现在同一个 part 里**。
            多图编辑：使用一个 text part（编辑指令）+ 多个 inlineData part（每张图一个），与谷歌官方格式一致。
          items:
            $ref: '#/components/schemas/EditPart'
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
    EditPart:
      description: 内容片段，必须是 TextPart 或 ImagePart 中的一种（不可同时含 text 和 inlineData）
      oneOf:
        - $ref: '#/components/schemas/TextPart'
        - $ref: '#/components/schemas/ImagePart'
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
    TextPart:
      type: object
      description: 文本片段：编辑指令
      required:
        - text
      properties:
        text:
          type: string
          description: 编辑指令，描述如何修改图片
          example: 请把背景模糊化，突出前景的人物
    ImagePart:
      type: object
      description: 图片片段：待编辑的图片（可重复多个以实现多图编辑）
      required:
        - inlineData
      properties:
        inlineData:
          $ref: '#/components/schemas/InlineData'
    InlineData:
      type: object
      description: 内联图片数据（用于图片编辑场景）
      required:
        - mimeType
        - data
      properties:
        mimeType:
          type: string
          description: 图片 MIME 类型
          enum:
            - image/png
            - image/jpeg
          default: image/jpeg
        data:
          type: string
          description: 图片的 Base64 编码数据
          example: iVBORw0KGgoAAAANSUhEUg...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````