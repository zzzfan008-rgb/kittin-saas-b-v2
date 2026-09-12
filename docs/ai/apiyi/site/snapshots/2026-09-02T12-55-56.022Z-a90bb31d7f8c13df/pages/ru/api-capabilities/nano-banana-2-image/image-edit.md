> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API редактирования изображений

> Справочник API редактирования изображений Nano Banana 2 и интерактивная песочница — предоставьте изображение + инструкцию, чтобы сгенерировать отредактированный результат

<Info>
  Интерактивный Playground справа поддерживает выбор параметров через выпадающие списки. Введите свой ключ API в поле **Authorization** (формат: `Bearer sk-xxx`), чтобы отправлять тестовые запросы одним щелчком.
</Info>

<Tip>
  **Область применения**: эта страница предназначена для **редактирования изображений**. Вам нужно предоставить входное изображение (закодированное в base64) вместе с инструкциями по редактированию. Чтобы создать новое изображение только по тексту, используйте [эндпоинт Text-to-Image](/ru/api-capabilities/nano-banana-2-image/text-to-image).
</Tip>

<Warning>
  **🖥️ Ограничение Browser Playground (важно)**

  Этот эндпоинт возвращает изображение в формате base64 (`inlineData.data`, обычно несколько МБ) в ответе. Из-за ограничений рендеринга в браузере Playground справа может показать `请求时发生错误: unable to complete request` после получения ответа — **запрос на самом деле был выполнен успешно**; браузер просто не может отрендерить такую длинную строку base64.

  **Рекомендуемый рабочий процесс** (подходит для начинающих):

  * **Скопируйте приведенный ниже пример на Python / Node.js / cURL и запустите его локально**. Код автоматически `base64.b64decode`s ответ и **записывает изображение в файл**.
  * Если вам обязательно нужно использовать встроенный в браузер Playground, **используйте маленькое эталонное изображение (\< 50KB)** и установите `imageSize` на минимальный уровень (например, `512` / `1K`).
</Warning>

<Warning>
  **⚠️ Структура массива `parts` (важно — прочитайте это для редактирования нескольких изображений)**

  Каждый `part` должен быть **либо `text`, либо `inlineData`, но не обоими сразу**. Это соответствует официальному контракту Google `gemini-3.1-flash-image-preview`.

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
  **🖼️ О поле `inlineData.data`**

  Этот эндпоинт использует формат **JSON** (не multipart-загрузку файлов), поэтому Playground не может напрямую выбрать локальные файлы. Сначала нужно преобразовать изображение в **строку Base64**, а затем вставить ее в поле ввода `data`.

  **Однострочная команда: преобразовать + скопировать в буфер обмена**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  После выполнения просто `Cmd+V` / `Ctrl+V` вставьте в поле `data` в Playground. Также не забудьте установить `mimeType` в соответствующий `image/jpeg` или `image/png`.

  **Рекомендация**: для тестирования используйте небольшие изображения (\< 200KB), чтобы избежать торможения браузера из-за длинных строк base64. Для частых тестов редактирования изображений лучше используйте приведенные ниже примеры кода и запускайте их локально.
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
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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
  "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent" \
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

## Редактирование нескольких изображений

При объединении или сравнении нескольких входных изображений используйте **одну часть `text`** (инструкцию), за которой следуют **несколько частей `inlineData`** (по одной на каждое изображение).

### Python (несколько изображений)

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
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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

### cURL (несколько изображений, повторяет официальный формат Google)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent" \
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

| Параметр                                          | Тип     | Обязательно | Описание                                                                                                                                    |
| ------------------------------------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `contents[].parts`                                | array   | Yes         | Состоит из **1 текстовой части + N частей inlineData**. Каждая часть содержит либо `text`, либо `inlineData` — никогда не оба сразу         |
| `contents[].parts[].text`                         | string  | Yes         | Инструкция для редактирования (разместите её только в первой части)                                                                         |
| `contents[].parts[].inlineData.mimeType`          | string  | Yes         | `image/jpeg` или `image/png`                                                                                                                |
| `contents[].parts[].inlineData.data`              | string  | Yes         | Изображение, закодированное в Base64 (для редактирования нескольких изображений повторяйте по одной части inlineData на каждое изображение) |
| `generationConfig.responseModalities`             | array   | Yes         | Обычно `["IMAGE"]`                                                                                                                          |
| `generationConfig.imageConfig.aspectRatio`        | string  | No          | 14 соотношений, по умолчанию `1:1`                                                                                                          |
| `generationConfig.imageConfig.imageSize`          | string  | No          | `512` / `1K` / `2K` / `4K`, по умолчанию `1K`                                                                                               |
| `generationConfig.thinkingConfig.thinkingLevel`   | string  | No          | `minimal` (быстро) / `High` (глубокое рассуждение)                                                                                          |
| `generationConfig.thinkingConfig.includeThoughts` | boolean | No          | Вернуть текст процесса рассуждения                                                                                                          |

## Многоходовое разговорное редактирование

Nano Banana 2 (`gemini-3.1-flash-image-preview`) поддерживает **настоящее разговорное многоходовое редактирование**: добавляйте изображение, сгенерированное на каждом ходе, обратно в `contents` как **`role: "model"` `inlineData`**, затем отправляйте следующую инструкцию пользователя. Модель редактирует на основе **полной истории разговора** и **накапливает изменения** (например, сначала перекрасьте диван, затем добавьте аксессуар — предыдущее изменение сохраняется).

<Info>
  Это отличается от reverse image models: нативный формат Gemini действительно считывает изображения из ходов истории с ролью `model`. Для согласованности между ходами и пошаговой доработки используйте приведенный ниже шаблон backfill по истории.
</Info>

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1", "imageSize": "2K"}}

contents = []  # keep one running conversation history

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # key: backfill the output image into history
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))
    return part

turn("Generate an orange cat sitting on a blue sofa, simple line-art style", "step1.png")
turn("Make the sofa red; keep the cat and composition unchanged", "step2.png")   # edits the previous image
turn("Put a small yellow hat on the cat; keep everything else the same", "step3.png")  # accumulates; red sofa kept
```

<Tip>
  **Начните многоходовое редактирование с существующего изображения**: поместите `inlineData` (ваше собственное изображение) и инструкцию в первое сообщение пользователя, чтобы отредактировать существующую фотографию, затем продолжайте backfill вывода модели в `contents` на каждом ходе.
</Tip>

<Note>
  **Два стиля многоходовой работы**:

  * **Backfill по истории (выше, рекомендуется)**: `contents` сохраняет чередующуюся историю user/model — накапливает изменения между ходами с лучшей согласованностью.
  * **Повторная подача (проще)**: каждый ход отправляет одно сообщение пользователя (`text` + `inlineData` предыдущего изображения) для однократных правок, без сохранения предыдущего контекста.
</Note>


## OpenAPI

````yaml api-reference/nano-banana-2-edit-openapi-en.yaml POST /v1beta/models/gemini-3.1-flash-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Image Editing API
  description: >
    Google's latest image generation model Nano Banana 2
    (gemini-3.1-flash-image-preview) — Image Editing endpoint.


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
  /v1beta/models/gemini-3.1-flash-image-preview:generateContent:
    post:
      tags:
        - Image Editing
      summary: 'Image Editing: Edit an existing image with text instructions'
      description: >
        Edit images using the Nano Banana 2 model with text-based instructions.
        Supports multi-turn conversational editing.


        - Must provide an input image (`inlineData`, base64-encoded)

        - Text (`text`) describes the edit instructions

        - For text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/nano-banana-2-image/text-to-image)
      operationId: editNanoBanana2ImageEn
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
          description: Successfully edited image
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
          description: Content array containing edit instructions and the image to edit
          items:
            $ref: '#/components/schemas/EditContent'
        generationConfig:
          $ref: '#/components/schemas/GenerationConfig'
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          description: Generation results array
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
          description: Response type. IMAGE returns image only, TEXT+IMAGE returns both
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
          description: Aspect ratio, supports 14 options
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
          description: Output resolution
          enum:
            - '512'
            - 1K
            - 2K
            - 4K
          default: 1K
    ThinkingConfig:
      type: object
      description: >-
        Thinking mode configuration (Nano Banana 2 exclusive). When enabled, the
        model reasons and analyzes before generating, ideal for complex prompts
      properties:
        thinkingLevel:
          type: string
          description: >-
            Thinking depth. minimal = fast generation; High = deep reasoning,
            more accurate but slightly slower
          enum:
            - minimal
            - High
          default: minimal
        includeThoughts:
          type: boolean
          description: >-
            Whether to include thinking process text in the response. Note:
            thinking tokens are billed regardless of this setting
          default: false
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
      description: Inline image data (the image to edit)
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
      description: API Key obtained from APIYI Console

````