> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API text-to-image

> Справочник API text-to-image для Nano Banana Pro и интерактивная песочница — генерация изображений по текстовым prompt-ам

<Info>
  Интерактивная Playground справа поддерживает выбор параметров из выпадающих списков (соотношение сторон, разрешение, тип ответа и т. д.). Введите ваш API Key в поле **Authorization** (формат: `Bearer sk-xxx`), чтобы отправлять тестовые запросы в один клик.
</Info>

<Tip>
  **Область применения**: эта страница предназначена для **генерации изображений по тексту**. Просто введите prompt — загрузка изображения не требуется. Для редактирования существующего изображения используйте [эндпоинт редактирования изображения](/ru/api-capabilities/nano-banana-image/image-edit).
</Tip>

<Warning>
  **🖥️ Ограничение Browser Playground (важно)**

  Этот endpoint возвращает изображение, закодированное в base64 (`inlineData.data`, обычно несколько МБ) в ответе. Из-за ограничений рендеринга браузера Playground справа может показать `请求时发生错误: unable to complete request` после получения ответа — **запрос на самом деле успешно выполнен**; браузер просто не может отобразить такую длинную строку base64.

  **Рекомендуемый рабочий процесс** (подходит новичкам):

  * **Скопируйте приведенный ниже пример на Python / Node.js / cURL и запустите его локально**. Код автоматически `base64.b64decode`s ответ и **сохраняет изображение в файл**.
  * Если вам обязательно нужно использовать встроенный в браузер Playground, установите `imageSize` на минимальный уровень (например, `1K`), чтобы уменьшить размер ответа.
</Warning>

<Info>
  Все image API работают **синхронно** — здесь нет ID задачи, который нужно опрашивать, и если ваш клиент отключится, результат будет потерян, хотя запрос все равно будет тарифицироваться. Установите достаточный timeout для этой модели; см. [Основы image API и лучшие практики](/ru/api-capabilities/image-api-best-practices).
</Info>

## Примеры кода

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "A cute cat sitting in a garden, oil painting style, HD details"

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
print("Image saved to output.png")
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
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
  "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
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
const imgBase64 = data.candidates[0].content.parts[0].inlineData.data;
fs.writeFileSync("output.png", Buffer.from(imgBase64, "base64"));
```

## Краткая справка по параметрам

| Параметр                                   | Тип    | Обязательно | Описание                              |
| ------------------------------------------ | ------ | ----------- | ------------------------------------- |
| `contents[].parts[].text`                  | string | Да          | Текстовый prompt                      |
| `generationConfig.responseModalities`      | array  | Да          | `["IMAGE"]` или `["TEXT","IMAGE"]`    |
| `generationConfig.imageConfig.aspectRatio` | string | Нет         | 10 соотношений, по умолчанию `1:1`    |
| `generationConfig.imageConfig.imageSize`   | string | Нет         | `1K` / `2K` / `4K`, по умолчанию `1K` |

<Tip>
  Подробные описания параметров, допустимые значения и значения по умолчанию см. в описаниях полей в Playground справа. Все поля типа enum (например, `aspectRatio`, `imageSize`) поддерживают выбор из выпадающего списка — ручной ввод не требуется.
</Tip>

<Warning>
  **Неподдерживаемые функции**

  Следующие официальные функции Google не поддерживаются через APIYI и требуют отдельной тарификации:

  * **Grounding с Google Search**: Информация поиска в реальном времени через `tools: [{"google_search": {}}]`
  * **thinkingConfig** (режим Thinking): Поддерживается только в Nano Banana 2, но не в Nano Banana Pro

  По вопросам функций search grounding свяжитесь со службой поддержки, чтобы узнать о вариантах отдельной тарификации.
</Warning>


## OpenAPI

````yaml api-reference/nano-banana-pro-generate-openapi-en.yaml POST /v1beta/models/gemini-3-pro-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana Pro Text-to-Image API
  description: >
    Google's image generation model Nano Banana Pro (gemini-3-pro-image-preview)
    — Text-to-Image endpoint.


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
        - Text-to-Image
      summary: 'Text-to-Image: Generate an image from a text prompt'
      description: >
        Generate images using the Nano Banana Pro model based on a text prompt.


        - Only requires a text prompt and generation config

        - Supports 10 aspect ratios and 3 resolutions (1K / 2K / 4K)

        - 4K ultra-HD support, industry-best text rendering

        - For image editing, use the [Image Editing
        endpoint](/en/api-capabilities/nano-banana-image/image-edit)
      operationId: generateNanoBananaProTextToImageEn
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
                        A cute cat sitting in a garden, oil painting style, HD
                        details
              generationConfig:
                responseModalities:
                  - IMAGE
                imageConfig:
                  aspectRatio: '16:9'
                  imageSize: 2K
      responses:
        '200':
          description: Image generated successfully
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
    TextPart:
      type: object
      required:
        - text
      properties:
        text:
          type: string
          description: Text prompt describing the image to generate
          example: A cute cat sitting in a garden, oil painting style, HD details
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from APIYI Console

````