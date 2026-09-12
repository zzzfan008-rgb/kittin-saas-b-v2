> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для редактирования изображений

> Справочник API для редактирования изображений Nano Banana 2 Lite и интерактивная песочница — предоставьте изображение + инструкцию, чтобы сгенерировать отредактированный результат

<Info>
  Интерактивная песочница справа поддерживает выбор параметров из выпадающего списка. Введите свой API Key в поле **Authorization** (формат: `Bearer sk-xxx`), чтобы отправлять тестовые запросы в один клик.
</Info>

<Tip>
  **Область применения**: Эта страница предназначена для **редактирования изображений**. Вы должны предоставить входное изображение (закодированное в base64) вместе с инструкциями по редактированию. Чтобы сгенерировать новое изображение только по тексту, используйте [эндпоинт Text-to-Image](/ru/api-capabilities/nano-banana-lite-image/text-to-image).
</Tip>

<Warning>
  **🖥️ Ограничение браузерной песочницы (важно)**

  Этот эндпоинт возвращает изображение, закодированное в base64 (`inlineData.data`, обычно несколько MB), в ответе. Из-за ограничений рендеринга в браузере песочница справа может показать `请求时发生错误: unable to complete request` после получения ответа — **запрос на самом деле выполнен успешно**; браузер просто не может отрендерить такую длинную строку base64.

  **Рекомендуемый рабочий процесс** (подходит для новичков):

  * **Скопируйте приведенный ниже пример на Python / Node.js / cURL и запустите его локально**. Код автоматически `base64.b64decode`s ответ и **записывает изображение в файл**.
  * Если вам все же нужно использовать встроенную в браузер песочницу, **используйте крошечное референсное изображение (меньше 50KB)**, чтобы уменьшить размер ответа.
</Warning>

<Warning>
  **⚠️ Структура массива `parts` (важно — прочитайте это для правок с несколькими изображениями)**

  Каждый `part` должен быть **либо `text`, либо `inlineData`, но никогда не оба сразу**. Это соответствует официальному контракту Google `gemini-3.1-flash-lite-image`.

  **Правильно**: одна текстовая часть (инструкция) + N частей inlineData (по одной на изображение):

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

  Этот эндпоинт использует **формат JSON** (а не загрузку файлов через multipart), поэтому в Playground нельзя напрямую выбрать локальные файлы. Сначала нужно преобразовать изображение в **строку Base64**, а затем вставить ее в поле `data`.

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

  **Рекомендация**: Для тестирования используйте небольшие изображения (меньше 200KB), чтобы избежать задержек в браузере из-за длинных строк base64. Для частых тестов редактирования изображений лучше использовать приведенные ниже примеры кода и запускать их локально.
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
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
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
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
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
          { text: "Please blur the background to highlight the person in the foreground" },
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
# Note: convert image to base64 first
# IMAGE_B64=$(base64 -i input.jpg | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent" \
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
      "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
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

## Краткая справка по параметрам

| Параметр                                   | Тип    | Обязательно | Описание                                                                                                                                     |
| ------------------------------------------ | ------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `contents[].parts`                         | массив | Да          | Состоит из **1 текстового фрагмента + N фрагментов inlineData**. Каждый фрагмент содержит либо `text`, либо `inlineData` — никогда оба сразу |
| `contents[].parts[].text`                  | строка | Да          | Инструкция по редактированию (поместите ее только в первый фрагмент)                                                                         |
| `contents[].parts[].inlineData.mimeType`   | строка | Да          | `image/jpeg` или `image/png`                                                                                                                 |
| `contents[].parts[].inlineData.data`       | строка | Да          | Изображение в кодировке Base64 (для редактирования нескольких изображений повторяйте по одному фрагменту inlineData на каждое изображение)   |
| `generationConfig.responseModalities`      | массив | Да          | Обычно `["IMAGE"]`                                                                                                                           |
| `generationConfig.imageConfig.aspectRatio` | строка | Нет         | 14 соотношений сторон, по умолчанию `1:1`                                                                                                    |
| `generationConfig.imageConfig.imageSize`   | строка | Нет         | Только `1K` (Lite ориентирован на холст 1K)                                                                                                  |

## Многоходовое редактирование в диалоге

Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) поддерживает **многоходовое редактирование в диалоге**: добавляйте сгенерированное изображение каждого хода обратно в `contents` как **`role: "model"` `inlineData`**, затем отправляйте следующую инструкцию пользователя. Модель редактирует на основе **полной истории разговора** и **накапливает изменения** (например, сначала перекрасьте диван, затем добавьте аксессуар — предыдущее изменение сохраняется).

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1", "imageSize": "1K"}}

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
  **Начните многоходовое редактирование с существующего изображения**: поместите `inlineData` (ваше собственное изображение) и инструкцию в первое сообщение пользователя, чтобы отредактировать существующую фотографию, затем на каждом ходе продолжайте подставлять вывод модели в `contents`.
</Tip>


## OpenAPI

````yaml api-reference/nano-banana-lite-edit-openapi-en.yaml POST /v1beta/models/gemini-3.1-flash-lite-image:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Lite Image Editing API
  description: >
    Google's fastest, most efficient image model Nano Banana 2 Lite
    (gemini-3.1-flash-lite-image) — image editing endpoint.


    Provide an input image + edit instruction to generate a new edited image.
    For text-to-image, use the text-to-image endpoint.


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: Visit the [APIYI console](https://api.apiyi.com/token)
    to create a token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1beta/models/gemini-3.1-flash-lite-image:generateContent:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit an existing image per instructions'
      description: >
        Use the Nano Banana 2 Lite model to edit an input image per text
        instructions. Supports multi-turn conversational editing.


        - An input image (`inlineData`, base64-encoded) is required

        - Text (`text`) describes the edit instruction

        - For text-to-image, use the [text-to-image
        endpoint](/en/api-capabilities/nano-banana-lite-image/text-to-image)
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
                    - text: >-
                        Composite the people from these two images into the same
                        office scene, making funny faces
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
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerateContentResponse'
        '401':
          description: Unauthorized - invalid API Key
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
          description: >-
            Content array containing the edit instruction and the image(s) to
            edit
          items:
            $ref: '#/components/schemas/EditContent'
        generationConfig:
          $ref: '#/components/schemas/GenerationConfig'
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          description: Array of generation results
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
            Array of content parts. **Each part can be either text OR inlineData
            — the two cannot appear in the same part.**

            Multi-image editing: use one text part (edit instruction) + multiple
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
          description: >-
            Response type. IMAGE returns only images; TEXT+IMAGE returns both
            text and images
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
        A content part, either a TextPart or an ImagePart (cannot contain both
        text and inlineData)
      oneOf:
        - $ref: '#/components/schemas/TextPart'
        - $ref: '#/components/schemas/ImagePart'
    ImageConfig:
      type: object
      description: Image generation config
      properties:
        aspectRatio:
          type: string
          description: Aspect ratio, 14 supported
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
          description: Output resolution (Lite is focused on the 1K canvas)
          enum:
            - 1K
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
          example: Blur the background to emphasize the person in the foreground
    ImagePart:
      type: object
      description: 'Image part: the image to edit (repeat multiple for multi-image editing)'
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
      description: API Key obtained from the APIYI console

````