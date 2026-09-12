> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для преобразования текста в изображение

> Справочник API для преобразования текста в изображение FLUX и живой отладчик — полное семейство FLUX.2 [klein/pro/max/flex] через OpenAI-совместимый drop-in, вывод 4 МП и точное управление HEX-цветом

<Info>
  Интерактивная песочница справа поддерживает отладку в реальном времени. Заполните свой API Key в заголовке **Authorization** (формат: `Bearer sk-xxx`), выберите модель и размер, введите prompt и отправьте.
</Info>

<Tip>
  **Используйте эту страницу для** «генерация изображения по тексту» — нужен только prompt, загрузка не требуется. Для редактирования или слияния нескольких референсов существующих изображений см. [эндпоинт редактирования изображений](/ru/api-capabilities/flux/image-edit).
</Tip>

<Warning>
  **⚠️ Ключевые отличия / неподдерживаемые параметры**

  * **URL результата действителен только 10 минут** — `data[0].url` нужно скачать немедленно, истекшие URL возвращают 404
  * **`width` / `height` должны быть кратны 16** — иначе возвращается 400
  * **`prompt_upsampling` не поддерживается в FLUX.2 \[klein]** — игнорируется без предупреждения
  * **Общий лимит пикселей — 4MP** (\~2048×2048) — превышение возвращает 400
  * **`grounding search` только на `flux-2-max`** — другие модели не запустят live search даже с prompt, чувствительными ко времени
</Warning>

<Info>
  Все image API работают **синхронно** — здесь нет task ID для опроса, и если ваше соединение будет разорвано, результат будет потерян, хотя запрос все равно тарифицируется. Установите достаточно большой timeout для этой модели; см. [Основы и лучшие практики Image API](/ru/api-capabilities/image-api-best-practices).
</Info>

## Примеры кода

### Python (подстановка OpenAI SDK)

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="flux-2-pro",
    prompt="A cinematic shot of a futuristic city at sunset, 85mm lens, hyper-realistic",
    size="1920x1080"
)

# data[0].url is valid for only 10 minutes — download immediately
image_url = resp.data[0].url
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python (Native requests · с синтаксисом width/height)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "flux-2-max",
        "prompt": "Score of yesterday's Champions League final, infographic style",
        "width": 1920,
        "height": 1080,
        "safety_tolerance": 2,
        "output_format": "jpeg",
        "seed": 42
    },
    timeout=120
).json()

image_url = response["data"][0]["url"]
with open("out.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "Luxury eyeshadow palette with 6 pans: top row #B76E79, #E8D5B7, #8B4789; bottom row #CD7F32, #F8F6F0, #800020",
    "size": "1024x1024",
    "output_format": "png"
  }'
```

### Node.js (нативный fetch)

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'flux-2-klein-9b',
        prompt: 'A serene mountain landscape at golden hour, soft diffused light',
        width: 1024,
        height: 1024
    })
});

const { data } = await resp.json();
// Download immediately — URL expires in 10 minutes
const img = await fetch(data[0].url);
fs.writeFileSync('out.jpg', Buffer.from(await img.arrayBuffer()));
```

### JavaScript в браузере (прямой рендер)

```javascript theme={null}
{/* Demo only — production should proxy via backend to avoid leaking the key. The delivery URL has CORS disabled, so server-side download to your own CDN is recommended. */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: 'Watercolor aurora borealis over Nordic mountains',
        size: '1536x1024'
    })
});

const { data } = await resp.json();
{/* delivery URL has CORS disabled, but <img src> works for direct rendering. Server-side download is still recommended for production. */}
document.getElementById('img').src = data[0].url;
```

## Справочник параметров

| Параметр            | Тип     | Обязательно | Значение по умолчанию | Описание                                                                       |
| ------------------- | ------- | ----------- | --------------------- | ------------------------------------------------------------------------------ |
| `model`             | string  | Да          | —                     | ID модели FLUX, см. таблицу ниже                                               |
| `prompt`            | string  | Да          | —                     | prompt, до 32K tokens. Поддерживает естественный язык и структурированный JSON |
| `size`              | string  | Нет         | `1024x1024`           | Строка размера в стиле OpenAI, например `1920x1080`                            |
| `width`             | integer | Нет         | `1024`                | Нативный для BFL, альтернатива `size`, должно быть кратно 16                   |
| `height`            | integer | Нет         | `1024`                | Нативный для BFL, должно быть кратно 16                                        |
| `seed`              | integer | Нет         | random                | Фиксированное значение для воспроизводимости                                   |
| `safety_tolerance`  | integer | Нет         | `2`                   | 0 (самый строгий) – 6 (самый мягкий)                                           |
| `output_format`     | string  | Нет         | `jpeg`                | `jpeg` / `png`                                                                 |
| `prompt_upsampling` | boolean | Нет         | `false`               | Автоматически разворачивать prompt (не для \[klein])                           |
| `steps`             | integer | Нет         | `50`                  | **Только для `flux-2-flex`**, максимум 50                                      |
| `guidance`          | number  | Нет         | `4.5`                 | **Только для `flux-2-flex`**, 1.5–10                                           |
| `n`                 | integer | Нет         | `1`                   | Поддерживается только 1                                                        |

### Поддерживаемые ID моделей

| ID модели            | Скорость       | Лучше всего для                                         |
| -------------------- | -------------- | ------------------------------------------------------- |
| `flux-2-max`         | \< 15s         | Флагманская + grounding search                          |
| `flux-2-pro`         | \< 10s         | Продакшн в масштабе, лучшее соотношение цены и качества |
| `flux-2-flex`        | Медленнее      | Специалист по типографике                               |
| `flux-2-klein-9b`    | Меньше секунды | Сбалансированный                                        |
| `flux-2-klein-4b`    | Меньше секунды | Самый быстрый                                           |
| `flux-pro-1.1-ultra` | \~10s          | Устаревшая 4MP (см. Исторические версии)                |
| `flux-pro-1.1`       | \~5s           | Устаревшая 1.6MP                                        |
| `flux-pro`           | \~6s           | pro первого поколения                                   |
| `flux-dev`           | \~5s           | Разработка/тестирование                                 |

<Tip>
  Подробные ограничения, допустимые значения и примеры видны в подсказках полей Playground справа. Все поля enum поддерживают выбор из выпадающего списка.
</Tip>

## Формат ответа

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "url": "https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=..."
        }
    ]
}
```

<Warning>
  **⚠️ `data[0].url` действительно только 10 минут**

  * URL размещен на `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`, подпись истекает через 10 min
  * **CORS отключен** — браузерная `fetch` заблокирована, но `<img src>`-рендеринг работает
  * Production-сервисы **должны** скачивать на стороне сервера в свой OSS / CDN
  * В отличие от `gpt-image-2` OpenAI (которая возвращает `b64_json`), **FLUX возвращает только URL — без base64**.
</Warning>

<Info>
  FLUX не возвращает поле `usage` (тарифицируется за изображение, а не за token). Фактическая тарификация следует таблице цен на этом сайте. Заголовок ответа `x-request-id` используется для трассировки обращений в поддержку.
</Info>


## OpenAPI

````yaml api-reference/flux-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX Text-to-Image API
  description: >
    Black Forest Labs FLUX model family — text-to-image endpoint
    (OpenAI-compatible wrapper).


    - Full model matrix: FLUX.2 [klein 4b/9b, pro, max, flex], FLUX.1
    [pro/1.1/1.1-ultra/dev]

    - Output up to 4MP (2048×2048), arbitrary aspect ratio (dimensions must be
    multiples of 16)

    - Supports 32K-token prompts, exact hex color control, structured JSON
    prompting

    - `flux-2-max` exclusive: grounding search (real-time web)

    - Response `data[0].url` is **valid for only 10 minutes**, download
    immediately (CORS disabled)

    - APIYI gateway wraps BFL's async polling as a synchronous OpenAI Images API


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header.


    **Get API Key**: create a token at the [APIYI
    Console](https://api.apiyi.com/token).
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: Generate an image from a text prompt
      description: >
        Generate images from text using the FLUX model family.


        - Required: `model`, `prompt`

        - Optional: `size` or `width`+`height` (pick one), `seed`,
        `safety_tolerance`, `output_format`, `prompt_upsampling`

        - flex-only: `steps`, `guidance`

        - Custom dimensions must satisfy: multiples of 16, 64×64 ≤ size ≤ 4MP

        - For reference-image editing or fusion, use the [Image Editing
        endpoint](/en/api-capabilities/flux/image-edit).
      operationId: generateFluxTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: flux-2-pro
              prompt: A cinematic shot of a futuristic city at sunset, 85mm lens
              size: 1920x1080
              output_format: jpeg
              safety_tolerance: 2
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid params (width/height not multiple of 16, exceeds 4MP, prompt
            over 32K tokens, etc.)
        '401':
          description: Unauthorized — invalid API Key
        '403':
          description: Moderation block
        '429':
          description: Rate limited or out of credits (active tasks > 24)
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >-
            FLUX model ID. For FLUX.2 prefer flux-2-pro / flux-2-max; legacy
            versions in the Historical Versions page.
          enum:
            - flux-2-max
            - flux-2-pro
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-pro-1.1-ultra
            - flux-pro-1.1
            - flux-pro
            - flux-dev
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            Prompt, up to 32K tokens. Supports natural language, hex codes, and
            structured JSON.
          example: A cinematic shot of a futuristic city at sunset, 85mm lens
        size:
          type: string
          description: >
            OpenAI-style size string. Pick either `size` or `width`+`height`.

            Common: 1024x1024 / 1536x1024 / 1024x1536 / 1920x1080 / 1440x2048 /
            2048x2048.

            Custom must satisfy: multiples of 16, 64×64–4MP.
          example: 1920x1080
          default: 1024x1024
        width:
          type: integer
          description: >-
            BFL-native syntax, alternative to `size`. Must be a multiple of 16,
            between 64 and 2048.
          minimum: 64
          maximum: 2048
          example: 1920
          default: 1024
        height:
          type: integer
          description: BFL-native syntax. Must be a multiple of 16, between 64 and 2048.
          minimum: 64
          maximum: 2048
          example: 1080
          default: 1024
        seed:
          type: integer
          description: >-
            Fix for reproducibility — same seed + same other params yields the
            same result.
          example: 42
        safety_tolerance:
          type: integer
          description: Moderation level. 0 = strictest, 6 = most permissive, default 2.
          minimum: 0
          maximum: 6
          default: 2
        output_format:
          type: string
          description: Output format.
          enum:
            - jpeg
            - png
          default: jpeg
        prompt_upsampling:
          type: boolean
          description: >-
            Auto-expand the prompt. Not supported on FLUX.2 [klein] (silently
            ignored).
          default: false
        steps:
          type: integer
          description: '**Only flux-2-flex**. Inference steps, max 50.'
          minimum: 1
          maximum: 50
          default: 50
        guidance:
          type: number
          description: >-
            **Only flux-2-flex**. Guidance scale. 1.5–10, higher = closer to
            prompt.
          minimum: 1.5
          maximum: 10
          default: 4.5
        'n':
          type: integer
          description: Number of images. Only 1 supported.
          enum:
            - 1
          default: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Unix timestamp
          example: 1776832476
        data:
          type: array
          description: Result array (single image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  **Signed URL, valid for 10 minutes**. Hosted on
                  delivery-eu.bfl.ai / delivery-us.bfl.ai with CORS disabled —
                  server-side download required.
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI Console

````