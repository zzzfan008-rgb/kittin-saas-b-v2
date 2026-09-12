> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API Text-to-Image

> Справочник API Nano Banana 2 Lite и интерактивная песочница — генерируйте изображения из текстовых prompt

<Info>
  Интерактивный Playground справа поддерживает выбор параметров в выпадающих списках (соотношение сторон, тип ответа и т. д.). Введите свой API Key в поле **Authorization** (формат: `Bearer sk-xxx`), чтобы отправлять тестовые запросы в один клик.
</Info>

<Tip>
  **Область применения**: Эта страница предназначена для **генерации изображений по тексту**. Просто введите prompt — загрузка изображения не требуется. Для редактирования существующего изображения используйте [эндпоинт редактирования изображений](/ru/api-capabilities/nano-banana-lite-image/image-edit).
</Tip>

<Warning>
  **🖥️ Ограничение Browser Playground (важно)**

  Этот эндпоинт возвращает base64-кодированное изображение (`inlineData.data`, обычно несколько MB) в ответе. Из-за ограничений браузерного рендеринга Playground справа после получения ответа может показать `请求时发生错误: unable to complete request` — **запрос на самом деле выполнен успешно**; браузер просто не может отрисовать такую длинную base64-строку.

  **Рекомендуемый рабочий процесс** (подходит для начинающих):

  * **Скопируйте пример Python / Node.js / cURL ниже и запустите его локально**. Код автоматически `base64.b64decode`s ответ и **сохраняет изображение в файл**.
  * Nano Banana 2 Lite ориентирован на холст 1K, поэтому ответ имеет умеренный размер, но запуск локально по-прежнему остается самым безопасным способом сохранить изображение.
</Warning>

<Info>
  Все image API являются **синхронными** — здесь нет task ID для опроса, и если ваш client отключится, результат будет потерян, хотя запрос все равно тарифицируется. Для этой модели задайте большой timeout; см. [Основы Image API и лучшие практики](/ru/api-capabilities/image-api-best-practices).
</Info>

## Примеры кода

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "A cute Shiba Inu sitting under cherry blossom trees, watercolor style, HD details"

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
print("Image saved to output.png")
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Futuristic city night view, neon lights, cyberpunk style"}]}],
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
      contents: [{ parts: [{ text: "Futuristic city night view, neon lights, cyberpunk style" }] }],
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

### Режим, совместимый с OpenAI

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite-image",
    stream=False,
    messages=[{"role": "user", "content": "An autumn landscape painting with red leaves and birds in the distance"}]
)

print(response.choices[0].message.content)
```

## Краткая справка по параметрам

| Параметр                                   | Тип    | Обязательно | Описание                                    |
| ------------------------------------------ | ------ | ----------- | ------------------------------------------- |
| `contents[].parts[].text`                  | string | Yes         | Текст prompt                                |
| `generationConfig.responseModalities`      | array  | Yes         | `["IMAGE"]` или `["TEXT","IMAGE"]`          |
| `generationConfig.imageConfig.aspectRatio` | string | No          | 14 соотношений сторон, по умолчанию `1:1`   |
| `generationConfig.imageConfig.imageSize`   | string | No          | Только `1K` (Lite ориентирован на холст 1K) |

<Tip>
  См. описания полей в Playground справа для получения подробной документации по параметрам, допустимым значениям и значениям по умолчанию. Все поля типа enum (например, `aspectRatio`) поддерживают выбор из выпадающего списка — ручной ввод не требуется.
</Tip>

<Info>
  **Переход с Nano Banana 2**: просто измените название модели с `gemini-3.1-flash-image` на `gemini-3.1-flash-lite-image`; остальные параметры оставьте без изменений. Учтите, что Lite поддерживает только `1K` — если вы передаете `2K/4K`, вернитесь к `1K`.
</Info>


## OpenAPI

````yaml api-reference/nano-banana-lite-generate-openapi-en.yaml POST /v1beta/models/gemini-3.1-flash-lite-image:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Lite Text-to-Image API
  description: >
    Google's fastest, most efficient image model Nano Banana 2 Lite
    (gemini-3.1-flash-lite-image) — text-to-image endpoint.


    ~4s per image, focused on the 1K canvas, 14 aspect ratios.


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
        - Text-to-Image
      summary: 'Text-to-image: generate an image from a text description'
      description: >
        Use the Nano Banana 2 Lite model to generate images from text prompts.


        - Only a prompt (`text`) and generation config are required

        - Supports 14 aspect ratios, focused on 1K resolution

        - For image editing, use the [image editing
        endpoint](/en/api-capabilities/nano-banana-lite-image/image-edit)
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
                    - text: >-
                        A cute Shiba Inu sitting under cherry blossoms,
                        watercolor style, high detail
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
    TextToImageRequest:
      type: object
      required:
        - contents
        - generationConfig
      properties:
        contents:
          type: array
          description: Content array containing the text prompt
          items:
            $ref: '#/components/schemas/TextContent'
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
    TextContent:
      type: object
      required:
        - parts
      properties:
        parts:
          type: array
          description: Array of content parts
          items:
            $ref: '#/components/schemas/TextPart'
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
    TextPart:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          description: Text prompt describing the image to generate
          example: A cute Shiba Inu sitting under cherry blossoms, watercolor style
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI console

````