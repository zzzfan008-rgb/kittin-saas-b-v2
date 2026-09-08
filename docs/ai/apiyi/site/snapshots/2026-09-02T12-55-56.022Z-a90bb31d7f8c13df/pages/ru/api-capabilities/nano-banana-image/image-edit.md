> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для редактирования изображений

> Справочник API для редактирования изображений Nano Banana Pro и интерактивная песочница — предоставьте изображение + инструкцию, чтобы получить отредактированный результат

<Info>
  Интерактивная песочница Playground справа поддерживает выбор параметров из выпадающих списков. Введите ваш API Key в поле **Authorization** (формат: `Bearer sk-xxx`), чтобы отправлять тестовые запросы одним щелчком.
</Info>

<Tip>
  **Область применения**: эта страница предназначена для **редактирования изображений**. Вам нужно предоставить входное изображение (в кодировке base64) вместе с инструкциями по редактированию. Чтобы сгенерировать новое изображение только по тексту, используйте [эндпоинт Text-to-Image](/ru/api-capabilities/nano-banana-image/text-to-image).
</Tip>

<Warning>
  **🖥️ Ограничение браузерной Playground (важно)**

  Этот эндпоинт возвращает изображение в кодировке base64 (`inlineData.data`, обычно несколько MB) в ответе. Из-за ограничений браузерного рендеринга Playground справа после получения ответа может показать `请求时发生错误: unable to complete request` — **запрос на самом деле выполнен успешно**; просто браузер не может отрендерить такую длинную строку base64.

  **Рекомендуемый рабочий процесс** (подходит для начинающих):

  * **Скопируйте приведенный ниже пример на Python / Node.js / cURL и запустите его локально**. Код автоматически `base64.b64decode`s ответ и **записывает изображение в файл**.
  * Если вам обязательно нужно использовать встроенную в браузер Playground, **используйте небольшое эталонное изображение (\< 50KB)** и установите `imageSize` на самый низкий уровень (например, `1K`).
</Warning>

<Warning>
  **⚠️ Структура массива `parts` (важно — прочитайте это для редактирования нескольких изображений)**

  Каждый `part` должен быть **либо `text`, либо `inlineData`, но не обоими сразу**. Это соответствует официальному контракту Google `gemini-3-pro-image-preview`.

  **Правильно**: одна текстовая часть (инструкция) + N частей inlineData (по одной на каждое изображение):

  ```json theme={null}
  "contents": [{
    "parts": [
      {"text": "Combine the people from these two images into one office scene"},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
      {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}}
    ]
  }]
  ```

  **Неправильно** (каждая часть содержит и `text`, и `inlineData` — приводит к неопределенному поведению):

  ```json theme={null}
  "contents": [{
    "parts": [
      {"inlineData": {...}, "text": "is this the prompt 1"},
      {"inlineData": {...}, "text": "is this the prompt 2"}
    ]
  }]
  ```
</Warning>

<Warning>
  **О поле `inlineData.data`**

  Этот эндпоинт использует **формат JSON** (а не загрузку файлов multipart), поэтому Playground не может напрямую выбирать локальные файлы. Сначала вам нужно преобразовать изображение в строку **Base64**, а затем вставить ее в поле ввода `data`.

  **Однострочная команда: преобразовать + скопировать в буфер обмена**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  После выполнения просто `Cmd+V` / `Ctrl+V` вставьте в поле `data` в Playground. Также не забудьте установить `mimeType` в соответствующее `image/jpeg` или `image/png`.

  **Рекомендация**: для тестирования используйте небольшие изображения (меньше 200KB), чтобы избежать торможения браузера из-за длинных строк base64. Для частых тестов редактирования изображений вместо этого используйте приведенные ниже примеры кода для локального запуска.
</Warning>

## Примеры кода

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

# Read the image to edit
with open("input.jpg", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{
            "parts": [
                {"text": "Please blur the background to highlight the person in the foreground"},
                {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}
            ]
        }],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("edited.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("Edited image saved to edited.png")
```

### Node.js

```javascript theme={null}
import fs from "fs";

const API_KEY = "sk-your-api-key";
const imageB64 = fs.readFileSync("input.jpg").toString("base64");

const response = await fetch(
  "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Please blur the background to highlight the person in the foreground" },
          { inlineData: { mimeType: "image/jpeg", data: imageB64 } }
        ]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "2K" }
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
# Note: convert image to base64 first
# IMAGE_B64=$(base64 -i input.jpg | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "Please blur the background to highlight the person in the foreground"},
        {"inlineData": {"mimeType": "image/jpeg", "data": "'"$IMAGE_B64"'"}}
      ]
    }],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
    }
  }'
```

## Многоизображенческое редактирование

При объединении или сравнении нескольких входных изображений используйте **одну часть `text`** (инструкцию), а затем **несколько частей `inlineData`** (по одной на каждое изображение).

### Python (с несколькими изображениями)

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# Prepare multiple images (2 here as an example)
images = ["person1.png", "person2.png"]
parts = [{"text": "Combine the people from these images into one office scene, making funny faces"}]
for path in images:
    parts.append({"inlineData": {"mimeType": "image/png", "data": to_b64(path)}})

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": "5:4", "imageSize": "2K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("merged.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

### cURL (с несколькими изображениями, повторяет официальный формат Google)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "An office group photo of these people, they are making funny faces."},
        {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_1>"}},
        {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_2>"}},
        {"inlineData": {"mimeType": "image/png", "data": "<BASE64_DATA_IMG_3>"}}
      ]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"],
      "imageConfig": {"aspectRatio": "5:4", "imageSize": "2K"}
    }
  }'
```

## Краткая справка по параметрам

| Параметр                                   | Тип    | Обязательный | Описание                                                                                                                                    |
| ------------------------------------------ | ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `contents[].parts`                         | array  | Yes          | Состоит из **1 текстовой части + N частей inlineData**. Каждая часть содержит либо `text`, либо `inlineData` — никогда оба сразу            |
| `contents[].parts[].text`                  | string | Yes          | Инструкция по редактированию (поместите ее только в первую часть)                                                                           |
| `contents[].parts[].inlineData.mimeType`   | string | Yes          | `image/jpeg` или `image/png`                                                                                                                |
| `contents[].parts[].inlineData.data`       | string | Yes          | Изображение, закодированное в Base64 (для редактирования нескольких изображений повторяйте по одной части inlineData на каждое изображение) |
| `generationConfig.responseModalities`      | array  | Yes          | Обычно `["IMAGE"]`                                                                                                                          |
| `generationConfig.imageConfig.aspectRatio` | string | No           | 10 соотношений, по умолчанию `1:1`                                                                                                          |
| `generationConfig.imageConfig.imageSize`   | string | No           | `1K` / `2K` / `4K`, по умолчанию `1K`                                                                                                       |

<Tip>
  Nano Banana Pro поддерживает редактирование нескольких изображений: вы можете загружать несколько изображений вместе с инструкциями по редактированию для расширенных возможностей, таких как композиция из нескольких изображений и перенос стиля.
</Tip>


## OpenAPI

````yaml api-reference/nano-banana-pro-edit-openapi-en.yaml POST /v1beta/models/gemini-3-pro-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana Pro Image Editing API
  description: >
    Google's image generation model Nano Banana Pro (gemini-3-pro-image-preview)
    — Image Editing endpoint.


    Provide an input image + edit instructions to generate a new edited image.
    For text-to-image, use the text-to-image endpoint instead.


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers


    **Get API Key**: Visit [APIYI Console](https://api.apiyi.com/token) to
    create a token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1beta/models/gemini-3-pro-image-preview:generateContent:
    post:
      tags:
        - Image Editing
      summary: 'Image Editing: Edit an existing image with text instructions'
      description: >
        Edit images using the Nano Banana Pro model with text-based
        instructions.


        - Must provide an input image (`inlineData`, base64-encoded)

        - Text (`text`) describes the edit instructions

        - Supports 4K HD editing, fine local editing, text rendering

        - For text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/nano-banana-image/text-to-image)
      operationId: editNanoBananaProImageEn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              contents:
                - parts:
                    - text: >-
                        Combine the people from these two images into one office
                        scene, making funny faces
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
                  imageSize: 2K
      responses:
        '200':
          description: Image edited successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerateContentResponse'
        '401':
          description: Unauthorized - Invalid API Key
        '429':
          description: Rate limit exceeded
        '500':
          description: Internal server error
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
          description: Content array with edit instructions and image to edit
          items:
            $ref: '#/components/schemas/EditContent'
        generationConfig:
          $ref: '#/components/schemas/GenerationConfig'
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          description: Generated results array
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
                              description: Base64-encoded image data
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
          description: >
            Content parts array. **Each part must be EITHER text OR inlineData —
            never both in the same part.**

            For multi-image editing: one text part (the instruction) + multiple
            inlineData parts (one per image), matching Google's official format.
          items:
            $ref: '#/components/schemas/EditPart'
    GenerationConfig:
      type: object
      required:
        - responseModalities
      properties:
        responseModalities:
          type: array
          description: Response type. IMAGE returns only image, TEXT+IMAGE returns both
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
      description: >-
        A content part — either a TextPart or an ImagePart (never both text and
        inlineData in one part)
      oneOf:
        - $ref: '#/components/schemas/TextPart'
        - $ref: '#/components/schemas/ImagePart'
    ImageConfig:
      type: object
      description: Image generation configuration
      properties:
        aspectRatio:
          type: string
          description: Aspect ratio, 10 options available
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
          description: Output resolution
          enum:
            - 1K
            - 2K
            - 4K
          default: 1K
    TextPart:
      type: object
      description: 'Text part: the edit instruction'
      required:
        - text
      properties:
        text:
          type: string
          description: Edit instruction describing how to modify the image
          example: Please blur the background to highlight the person in the foreground
    ImagePart:
      type: object
      description: 'Image part: an input image (repeat this part for multi-image editing)'
      required:
        - inlineData
      properties:
        inlineData:
          $ref: '#/components/schemas/InlineData'
    InlineData:
      type: object
      description: Inline image data (for image editing)
      required:
        - mimeType
        - data
      properties:
        mimeType:
          type: string
          description: Image MIME type
          enum:
            - image/png
            - image/jpeg
          default: image/jpeg
        data:
          type: string
          description: Base64-encoded image data
          example: iVBORw0KGgoAAAANSUhEUg...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from APIYI Console

````