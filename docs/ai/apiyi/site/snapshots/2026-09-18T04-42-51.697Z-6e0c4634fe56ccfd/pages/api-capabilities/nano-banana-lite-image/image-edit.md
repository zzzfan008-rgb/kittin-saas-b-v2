> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片编辑 API 参考

> Nano Banana 2 Lite 图片编辑 API 参考与在线调试 — 输入图片 + 指令生成新图片

<Info>
  右侧的交互式 Playground 支持下拉选择参数。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），即可一键发送请求测试。
</Info>

<Tip>
  **场景说明**：本页用于「图片编辑」，必须上传一张待编辑的图片（base64 编码）+ 编辑指令。如果只想根据文本生成新图片，请使用 [文生图接口](/api-capabilities/nano-banana-lite-image/text-to-image)。
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制（重要）**

  本接口的响应里包含 base64 编码的图片（`inlineData.data`，数 MB 量级）。受浏览器渲染限制，右侧 Playground 在收到响应后**可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法把这么长的 base64 显示出来。

  **推荐做法**（小白零踩坑）：

  * **直接复制下方"代码示例"中的 Python / Node.js / cURL 到本地运行**，代码会自动 `base64.b64decode` 并把图片**保存为本地文件**。
  * 如要在浏览器里试 Playground，**用极小的参考图（少于 50KB）**，缩小响应体积。
</Warning>

<Warning>
  **⚠️ `parts` 数组结构（重要，多图编辑必看）**

  每个 `part` **只能是 `text` 或 `inlineData` 中的一个**，二者不能同时出现在同一个 part 里。这与谷歌官方 `gemini-3.1-flash-lite-image` 的契约一致。

  **正确**：一个 text part（编辑指令）+ N 个 inlineData part（每张图一个）：

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "把这两张图里的人物合成到同一个办公室场景中"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **错误**（每个 part 同时塞了 text 和 inlineData，会导致非预期行为）：

  ```json theme={null}
  "contents": [{
    "parts": [
      {"inlineData": {...}, "text": "这是提示词吗 1"},
      {"inlineData": {...}, "text": "这是提示词吗 2"}
    ]
  }]
  ```
</Warning>

<Warning>
  **🖼️ 关于 `inlineData.data` 字段**

  本接口是 **JSON 格式**（非 multipart 文件上传），所以 Playground 无法直接选择本地文件，需要先把图片转成 **Base64 字符串**再粘贴到 `data` 输入框。

  **一行命令转换 + 自动复制到剪贴板**：

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  执行后直接在 Playground 的 `data` 字段 `Cmd+V` / `Ctrl+V` 粘贴即可。同时记得把 `mimeType` 切换为对应的 `image/jpeg` 或 `image/png`。

  **建议**：测试用小图（少于 200KB），避免 base64 字符串过长导致浏览器卡顿。频繁测试图片编辑更推荐用下方代码示例直接在本地运行。
</Warning>

## 代码示例

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

# 读取待编辑的图片
with open("input.jpg", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{
            "parts": [
                {"text": "请把背景模糊化，突出前景的人物"},
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
print("编辑后的图片已保存至 edited.png")
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
          { text: "请把背景模糊化，突出前景的人物" },
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
# 注意：需要先将图片转为 base64 字符串
# IMAGE_B64=$(base64 -i input.jpg | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "请把背景模糊化，突出前景的人物"},
        {"inlineData": {"mimeType": "image/jpeg", "data": "'"$IMAGE_B64"'"}}
      ]
    }],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
    }
  }'
```

## 多图编辑示例

把多张图作为输入合成或对比时，**只用一个 `text` part**（编辑指令），后面追加多个 `inlineData` part（每张图一个）。

### Python（多图）

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# 准备多张图（这里以 2 张为例，最多可上传多张）
images = ["person1.png", "person2.png"]
parts = [{"text": "把这两张图里的人物合成到同一个办公室场景中，做着搞怪表情"}]
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

## 参数说明速查

| 参数                                         | 类型     | 必填 | 说明                                                                                       |
| ------------------------------------------ | ------ | -- | ---------------------------------------------------------------------------------------- |
| `contents[].parts`                         | array  | 是  | 由「**1 个 text part + N 个 inlineData part**」组成。每个 part 只能含 `text` 或 `inlineData` 之一，不可同时出现 |
| `contents[].parts[].text`                  | string | 是  | 编辑指令（建议只放在第一个 part 中）                                                                    |
| `contents[].parts[].inlineData.mimeType`   | string | 是  | `image/jpeg` 或 `image/png`                                                               |
| `contents[].parts[].inlineData.data`       | string | 是  | 图片的 Base64 编码（多图编辑时重复多个 inlineData part）                                                 |
| `generationConfig.responseModalities`      | array  | 是  | 通常为 `["IMAGE"]`                                                                          |
| `generationConfig.imageConfig.aspectRatio` | string | 否  | 14 种宽高比，默认 `1:1`                                                                         |
| `generationConfig.imageConfig.imageSize`   | string | 否  | 仅支持 `1K`（Lite 专注 1K 画布）                                                                  |

## 多轮对话式编辑

Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）支持**对话式多轮编辑**：把模型每一轮产出的图片，作为 **`role: "model"` 的 `inlineData`** 追加回 `contents`，再发下一条 user 指令。模型会基于**完整对话历史**继续修改并**累积效果**（例如先改沙发颜色、再加配饰，前一步的改动会保留）。

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1", "imageSize": "1K"}}

contents = []  # 全程维护同一个对话历史

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # 关键：把产出的图回填进历史
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))
    return part

turn("生成一只橙色的猫，坐在蓝色沙发上，简笔画风格", "step1.png")
turn("把沙发改成红色，猫和构图保持不变", "step2.png")       # 基于上一轮的图修改
turn("给猫戴一顶黄色小帽子，其它保持不变", "step3.png")       # 继续累积，红沙发会保留
```

<Tip>
  **从已有图片开始多轮**：第一轮的 user 消息里放 `inlineData`（你自己的图）+ 指令即可编辑现有照片，之后每轮照样把模型产出回填进 `contents`。
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