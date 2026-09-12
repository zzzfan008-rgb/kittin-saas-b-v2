> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API текст-в-изображение

> Справочник API Nano Banana 2 для текст-в-изображение и интерактивная песочница — генерируйте изображения по текстовым prompt

<Info>
  Интерактивная песочница справа поддерживает выбор параметров из выпадающих списков (соотношение сторон, разрешение, тип ответа и т. д.). Введите свой ключ API в поле **Authorization** (формат: `Bearer sk-xxx`), чтобы отправлять тестовые запросы в один клик.
</Info>

<Tip>
  **Область применения**: эта страница предназначена для **генерации изображений по тексту**. Просто введите prompt — загрузка изображения не требуется. Для редактирования существующего изображения используйте [эндпоинт редактирования изображений](/ru/api-capabilities/nano-banana-2-image/image-edit).
</Tip>

<Warning>
  **🖥️ Ограничение песочницы в браузере (важно)**

  Этот endpoint возвращает изображение, закодированное в base64 (`inlineData.data`, обычно несколько МБ) в ответе. Из-за ограничений рендеринга браузера песочница справа после получения ответа может показать `请求时发生错误: unable to complete request` — **запрос на самом деле выполнен успешно**; браузер просто не может отрисовать такую длинную строку base64.

  **Рекомендуемый рабочий процесс** (подходит для новичков):

  * **Скопируйте приведенный ниже пример Python / Node.js / cURL и запустите его локально**. Код автоматически `base64.b64decode`s ответ и **записывает изображение в файл**.
  * Если вам все же нужно использовать встроенную в браузер песочницу, установите `imageSize` на самый маленький уровень (например, `512` / `1K`), чтобы уменьшить размер ответа.
</Warning>

<Info>
  Все image API являются **синхронными** — здесь нет ID задачи для опроса, и если ваш клиент отключится, результат будет потерян, хотя запрос все равно будет тарифицироваться. Установите достаточно большой timeout для этой модели; см. [Основы API изображений и лучшие практики](/ru/api-capabilities/image-api-best-practices).
</Info>

## Примеры кода

### Python

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"
PROMPT = "A cute Shiba Inu sitting under cherry blossom trees, watercolor style, HD details"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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
curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent" \
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
  "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
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

| Parameter                                         | Type    | Required | Description                                                                |
| ------------------------------------------------- | ------- | -------- | -------------------------------------------------------------------------- |
| `contents[].parts[].text`                         | string  | Да       | Текстовый prompt                                                           |
| `generationConfig.responseModalities`             | array   | Да       | `["IMAGE"]` или `["TEXT","IMAGE"]`                                         |
| `generationConfig.imageConfig.aspectRatio`        | string  | Нет      | 14 соотношений сторон, по умолчанию `1:1`                                  |
| `generationConfig.imageConfig.imageSize`          | string  | Нет      | `512` / `1K` / `2K` / `4K`, по умолчанию `1K`                              |
| `generationConfig.thinkingConfig.thinkingLevel`   | string  | Нет      | `minimal` (быстро) / `High` (глубокое рассуждение), по умолчанию `minimal` |
| `generationConfig.thinkingConfig.includeThoughts` | boolean | Нет      | Возвращать текст процесса рассуждения, по умолчанию `false`                |

<Tip>
  См. описания полей в Playground справа для подробной документации по параметрам, допустимых значений и значений по умолчанию. Все поля типа enum (например, `aspectRatio`, `imageSize`, `thinkingLevel`) поддерживают выбор из выпадающего списка — ручной ввод не требуется.
</Tip>

<Warning>
  **Неподдерживаемые функции**

  Следующие официальные функции Google не поддерживаются через APIYI и требуют отдельной тарификации:

  * **Grounding with Google Search**: Информация поиска в реальном времени через `tools: [{"google_search": {}}]`
  * **Grounding по поиску изображений** (только для Nano Banana 2): Визуальный контекст из поиска изображений Google

  За эти функции взимается дополнительная плата за Google Search API, и они не входят в передачу через APIYI.
</Warning>


## OpenAPI

````yaml api-reference/nano-banana-2-generate-openapi-en.yaml POST /v1beta/models/gemini-3.1-flash-image-preview:generateContent
openapi: 3.1.0
info:
  title: Nano Banana 2 Text-to-Image API
  description: >
    Google's latest image generation model Nano Banana 2
    (gemini-3.1-flash-image-preview) — Text-to-Image endpoint.


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
        - Text-to-Image
      summary: 'Text-to-Image: Generate an image from a text prompt'
      description: >
        Generate images using the Nano Banana 2 model based on a text prompt.


        - Only requires a text prompt and generation config

        - Supports 14 aspect ratios and 4 resolutions (512px / 1K / 2K / 4K)

        - For image editing, use the [Image Editing
        endpoint](/en/api-capabilities/nano-banana-2-image/image-edit)
      operationId: generateNanoBanana2TextToImageEn
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````