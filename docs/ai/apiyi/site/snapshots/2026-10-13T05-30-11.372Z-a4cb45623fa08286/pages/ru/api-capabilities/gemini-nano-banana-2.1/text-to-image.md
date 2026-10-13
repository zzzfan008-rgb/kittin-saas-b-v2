> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник по API Text-to-Image

> Справочник по API Text-to-Image для Nano Banana 2.1 и интерактивная песочница — генерация изображений по текстовым промптам

<Info>
  Интерактивный Playground справа поддерживает выбор параметров (соотношение сторон, разрешение, тип ответа и т. д.) из выпадающего списка. Введите ваш API-ключ в поле **Authorization** (формат: `Bearer sk-xxx`), чтобы отправлять тестовые запросы в один клик.
</Info>

<Tip>
  **Назначение**: эта страница предназначена для **генерации изображений по тексту**. Просто введите prompt — загрузка изображения не требуется. Для редактирования существующего изображения используйте [эндпоинт редактирования изображений](/ru/api-capabilities/gemini-nano-banana-2.1/image-edit).
</Tip>

<Warning>
  **🖥️ Ограничение браузерного Playground (важно)**

  Этот эндпоинт возвращает в ответе изображение в кодировке base64 (`inlineData.data`, обычно размером в несколько МБ). Из-за ограничений браузера на рендеринг Playground справа может показать `请求时发生错误: unable to complete request` после получения ответа — **на самом деле запрос прошел успешно**, браузер просто не может отобразить такую длинную строку base64.

  **Рекомендуемый порядок действий** (подходит для начинающих):

  * **Скопируйте приведенный ниже пример для Python / Node.js / cURL и запустите его локально**. Код автоматически выполнит `base64.b64decode` ответа и **запишет изображение в файл**.
  * Если вам необходимо использовать Playground в браузере, установите для `imageSize` наименьшее значение (`1K`), чтобы уменьшить размер ответа.
</Warning>

<Info>
  Все API для работы с изображениями являются **синхронными** — здесь нет task ID для опроса, и если ваш клиент отключится, результат будет потерян, при этом запрос всё равно будет тарифицирован. Задайте достаточный таймаут для этой модели; см. [Основы и рекомендации по работе с API изображений](/ru/api-capabilities/image-api-best-practices).
</Info>

## Примеры кода

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "A cute Shiba Inu sitting under cherry blossom trees, watercolor style, HD details"

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
print("Image saved to output.png")
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-nano-banana-2.1:generateContent" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Futuristic city night view, neon lights, cyberpunk style"}]}],
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
      contents: [{ parts: [{ text: "Futuristic city night view, neon lights, cyberpunk style" }] }],
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

## Краткий справочник по параметрам

| Параметр | Тип | Обязательный | Описание |
| - | - | - | - |
| `contents[].parts[].text` | string | Да | Текстовый prompt |
| `generationConfig.responseModalities` | array | Да | `["IMAGE"]` или `["TEXT","IMAGE"]` |
| `generationConfig.imageConfig.aspectRatio` | string | Нет | 14 соотношений сторон; если не указано, модель выбирает его на основе содержимого, поэтому передавайте его явно |
| `generationConfig.imageConfig.imageSize` | string | Нет | `1K` / `2K` / `4K` (`512` не поддерживается), по умолчанию `1K` |
| `generationConfig.thinkingConfig.thinkingLevel` | string | Нет | `minimal` / `medium` / `high`, по умолчанию `medium` |
| `generationConfig.thinkingConfig.includeThoughts` | boolean | Нет | Возвращать текст процесса рассуждения, по умолчанию `false` |

<Tip>
  Подробную документацию по параметрам, допустимые значения и значения по умолчанию см. в описании полей в Playground справа. Все поля типа enum (например, `aspectRatio`, `imageSize`, `thinkingLevel`) поддерживают выбор из выпадающего списка — вводить вручную не требуется.
</Tip>

<Info>
  **Привязка к Google Search (grounding)**: добавьте `"tools": [{"googleSearch": {}}]` на верхнем уровне запроса. Каждый поисковый запрос тарифицируется дополнительно в размере \$0.014, а модель сама определяет, сколько запросов выполнить. См. [обзор Nano Banana 2.1](/ru/api-capabilities/gemini-nano-banana-2.1/overview).
</Info>


## OpenAPI

````yaml api-reference/gemini-nano-banana-2.1-generate-openapi-en.yaml POST /v1beta/models/gemini-nano-banana-2.1:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2.1 Text-to-Image API
  description: >
    Google image generation model Nano Banana 2.1 (gemini-nano-banana-2.1) —
    Text-to-Image endpoint.


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
        - Text-to-Image
      summary: 'Text-to-Image: Generate an image from a text prompt'
      description: >
        Generate images using the Nano Banana 2.1 model based on a text prompt.


        - Only requires a text prompt and generation config

        - Supports 14 aspect ratios and 3 resolutions (1K / 2K / 4K)

        - For image editing, use the [Image Editing
        endpoint](/en/api-capabilities/gemini-nano-banana-2.1/image-edit)
      operationId: generateNanoBanana21TextToImageEn
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
                        A cute Shiba Inu sitting under cherry blossom trees,
                        watercolor style, HD details
              generationConfig:
                responseModalities:
                  - IMAGE
                imageConfig:
                  aspectRatio: '16:9'
                  imageSize: 2K
      responses:
        '200':
          description: Successfully generated image
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
    TextToImageRequest:
      type: object
      required:
        - contents
        - generationConfig
      properties:
        contents:
          type: array
          description: Content array containing text prompts
          items:
            $ref: '#/components/schemas/TextContent'
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
    TextContent:
      type: object
      required:
        - parts
      properties:
        parts:
          type: array
          description: Content parts array
          items:
            $ref: '#/components/schemas/TextPart'
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
    TextPart:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          description: Text prompt describing the image to generate
          example: >-
            A cute Shiba Inu sitting under cherry blossom trees, watercolor
            style
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.