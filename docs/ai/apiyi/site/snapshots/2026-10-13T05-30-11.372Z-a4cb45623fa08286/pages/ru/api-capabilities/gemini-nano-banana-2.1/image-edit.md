> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник по API редактирования изображений

> Справочник по API и интерактивная песочница для редактирования изображений с помощью Nano Banana 2.1 — передайте изображение и инструкцию, чтобы получить отредактированный результат

<Info>
  Интерактивный Playground справа поддерживает выбор параметров из выпадающего списка. Введите свой API Key в поле **Authorization** (формат: `Bearer sk-xxx`), чтобы отправлять тестовые запросы в один клик.
</Info>

<Tip>
  **Область применения**: эта страница предназначена для **редактирования изображений**. Необходимо предоставить исходное изображение (в кодировке base64) вместе с инструкциями по редактированию. Для генерации нового изображения только по тексту используйте [эндпоинт Text-to-Image](/ru/api-capabilities/gemini-nano-banana-2.1/text-to-image).
</Tip>

<Warning>
  **🖥️ Ограничение Playground в браузере (важно)**

  Этот эндпоинт возвращает в ответе изображение в кодировке base64 (`inlineData.data`, обычно размером в несколько МБ). Из-за ограничений рендеринга в браузере Playground справа может отображать `请求时发生错误: unable to complete request` после получения ответа — **на самом деле запрос выполнен успешно**; браузер просто не может отобразить такую длинную строку base64.

  **Рекомендуемый порядок действий** (подходит для начинающих):

  * **Скопируйте приведенный ниже пример для Python / Node.js / cURL и запустите его локально**. Код автоматически `base64.b64decode` ответ и **записывает изображение в файл**.
  * Если вам необходимо использовать Playground в браузере, **используйте эталонное изображение минимального размера (\< 50 КБ)** и установите `imageSize` на минимальный уровень (`1K`).
</Warning>

<Warning>
  **⚠️ Структура массива `parts` (важно — ознакомьтесь для редактирования нескольких изображений)**

  Каждый `part` должен быть **либо `text`, либо `inlineData`, но ни в коем случае не обоими сразу**. Это соответствует официальному контракту `gemini-nano-banana-2.1` от Google.

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

  **Неправильно** (каждая часть содержит как `text`, так и `inlineData` — приводит к неопределенному поведению):

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

  Этот эндпоинт использует **формат JSON** (а не составную загрузку файлов multipart), поэтому в Playground нельзя напрямую выбрать локальные файлы. Сначала необходимо преобразовать изображение в **строку base64**, а затем вставить ее в поле ввода `data`.

  **Однострочная команда: преобразование + копирование в буфер обмена**:

  ```bash theme={null}
  # macOS
  base64 -i your-image.jpg | tr -d '\n' | pbcopy

  # Linux
  base64 -w0 your-image.jpg | xclip -selection clipboard

  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-image.jpg")) | Set-Clipboard
  ```

  После выполнения просто вставьте значение с помощью `Cmd+V` / `Ctrl+V` в поле `data` в Playground. Также не забудьте установить для `mimeType` соответствующий `image/jpeg` или `image/png`.

  **Рекомендация**: используйте для тестирования небольшие изображения (\< 200 КБ), чтобы избежать зависания браузера из-за длинных строк base64. Для регулярного тестирования редактирования изображений используйте приведенные ниже примеры кода для локального запуска.
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
    "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
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

img_data = [p for p in response["candidates"][0]["content"]["parts"] if "inlineData" in p][-1]["inlineData"]["data"]
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
  "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
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
const imgBase64 = data.candidates[0].content.parts.filter((p) => p.inlineData).at(-1).inlineData.data;
fs.writeFileSync("edited.png", Buffer.from(imgBase64, "base64"));
```

### cURL

```bash theme={null}
# Note: convert image to base64 first
# IMAGE_B64=$(base64 -i input.jpg | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent" \
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
    "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
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

img_data = [p for p in response["candidates"][0]["content"]["parts"] if "inlineData" in p][-1]["inlineData"]["data"]
with open("merged.png", "wb") as f:
    f.write(base64.b64decode(img_data))
```

### cURL (несколько изображений, повторяет официальный формат Google)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent" \
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

## Краткий справочник по параметрам

| Параметр | Тип | Обязательный | Описание |
| - | - | - | - |
| `contents[].parts` | массив | Да | Состоит из **1 текстовой части + N частей inlineData**. Каждая часть содержит либо `text`, либо `inlineData` — но никогда оба одновременно |
| `contents[].parts[].text` | строка | Да | Инструкция по редактированию (указывается только в первой части) |
| `contents[].parts[].inlineData.mimeType` | строка | Да | `image/jpeg` или `image/png` |
| `contents[].parts[].inlineData.data` | строка | Да | Изображение в формате base64 (дублируйте по одной части inlineData на каждое изображение при редактировании нескольких изображений) |
| `generationConfig.responseModalities` | массив | Да | Обычно `["IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | строка | Нет | 14 соотношений сторон; если не указано, модель выбирает его на основе содержимого, поэтому передавайте явно |
| `generationConfig.imageConfig.imageSize` | строка | Нет | `1K` / `2K` / `4K` (`512` не поддерживается), по умолчанию `1K` |
| `generationConfig.thinkingConfig.thinkingLevel` | строка | Нет | `minimal` / `medium` / `high`, по умолчанию `medium` |
| `generationConfig.thinkingConfig.includeThoughts` | логический | Нет | Возвращать текст процесса рассуждения |

## Многоэтапное диалоговое редактирование

Nano Banana 2.1 (`gemini-nano-banana-2.1`) поддерживает **полноценное диалоговое многоэтапное редактирование**: добавляйте сгенерированное на каждом шаге изображение обратно в `contents` как **`role: "model"` `inlineData`**, а затем отправляйте следующую инструкцию пользователя. Модель выполняет редактирование с учётом **всей истории диалога** и **накапливает изменения** (например, сначала перекрасьте диван, затем добавьте аксессуар — предыдущее изменение сохранится).

<Info>
  Это отличается от моделей обратного поиска изображений: нативный формат Gemini действительно считывает изображения из реплик истории с ролью `model`. Для согласованности между шагами и поэтапного уточнения используйте приведенный ниже паттерн заполнения истории.
</Info>

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent"
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
  **Начало многоэтапного редактирования с существующего изображения**: поместите `inlineData` (ваше собственное изображение) вместе с инструкцией в первое сообщение пользователя, чтобы отредактировать существующую фотографию, а затем на каждом шаге продолжайте передавать ответ модели обратно в `contents`.
</Tip>

<Note>
  **Два стиля многоэтапного редактирования**:

  * **Заполнение истории (выше, рекомендуется)**: `contents` сохраняет чередующуюся историю диалога «пользователь/модель» — накапливает изменения от шага к шагу с лучшей согласованностью.
  * **Повторная отправка (проще)**: на каждом шаге отправляется одно сообщение пользователя (`text` + `inlineData` предыдущего изображения) для одноэтапного редактирования без сохранения предыдущего контекста.
</Note>


## OpenAPI

````yaml api-reference/gemini-nano-banana-2.1-edit-openapi-en.yaml POST /v1beta/models/gemini-nano-banana-2.1:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2.1 Image Editing API
  description: >
    Google image generation model Nano Banana 2.1 (gemini-nano-banana-2.1) —
    Image Editing endpoint.


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
security:
  - bearerAuth: []
paths:
  /v1beta/models/gemini-nano-banana-2.1:generateContent:
    post:
      tags:
        - Image Editing
      summary: 'Image Editing: Edit an existing image with text instructions'
      description: >
        Edit images using the Nano Banana 2.1 model with text-based
        instructions. Supports multi-turn conversational editing.


        - Must provide an input image (`inlineData`, base64-encoded)

        - Text (`text`) describes the edit instructions

        - For text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/gemini-nano-banana-2.1/text-to-image)
      operationId: editNanoBanana21ImageEn
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
          description: >-
            Aspect ratio, 14 options. If omitted, the model picks one based on
            the content (in our tests, scenes mostly came out 16:9 and posters
            2:3 / 3:4). Pass it explicitly if you need a fixed ratio
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
          description: Output resolution
          enum:
            - 1K
            - 2K
            - 4K
          default: 1K
    ThinkingConfig:
      type: object
      description: >-
        Thinking configuration. Nano Banana 2.1 thinks before generating by
        default (default level: medium); thinking tokens are billed together
        with the image as output
      properties:
        thinkingLevel:
          type: string
          description: >-
            Thinking depth: minimal / medium (default) / high. In our tests,
            high used about 30% more thinking tokens than the default
          enum:
            - minimal
            - medium
            - high
          default: medium
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.