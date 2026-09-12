> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для генерации изображений по тексту

> Справочник API Seedream для text-to-image и живой Playground — только текстовые prompt, 1K/2K/3K/4K и точные размеры в пикселях, три версии на одном эндпоинте

<Info>
  Интерактивный Playground справа позволяет вызывать API напрямую. Установите **Authorization** в значение вашего API-ключа (формат: `Bearer sk-xxx`), введите prompt, выберите модель и размер и нажмите отправку.
</Info>

<Tip>
  **Область применения**: эта страница охватывает только чистый text-to-image (без поля `image`). Для редактирования по опорному изображению, смешивания нескольких изображений или пакетной генерации последовательностей см. [Редактирование изображений](/ru/api-capabilities/seedream-image/image-edit) — тот же эндпоинт, только другие параметры.
</Tip>

<Warning>
  **🖥️ Ограничение Playground в браузере (только режим b64\_json)**

  В режиме `response_format: "url"` по умолчанию Playground работает нормально (ответ — это просто временная ссылка BytePlus TOS). Если переключиться на `response_format: "b64_json"`, ответ содержит строку base64 размером в несколько МБ, и браузерный Playground может показать `请求时发生错误: unable to complete request` — **запрос на самом деле успешно выполнен**; браузер просто не может отрисовать такую длинную строку base64.

  **Рекомендуемый рабочий процесс**:

  * Хотите просто посмотреть изображение? **Оставьте режим `url` по умолчанию** — Playground вернет ссылку напрямую (не забудьте скачать изображение в свое хранилище в течение 24 часов).
  * Нужен b64\_json? **Скопируйте приведенный ниже пример кода и запустите его локально** — код автоматически декодирует и сохранит изображение в файл.
</Warning>

<Warning>
  **⚠️ Уровни разрешения зависят от версии**

  * `seedream-5-0-pro-260628` — пресеты `1K` / `2K` плюс точные WxH до 4.19M суммарных пикселей (при 16:9 самая длинная сторона достигает 2720×1530, подтверждено; пресетов 3K/4K нет; `sequential_image_generation` / `stream` не принимаются — при передаче возвращается 400; \~2 мин на изображение)
  * `seedream-5-0-260128` — только `2K` / `3K` (без 4K)
  * `seedream-4-5-251128` — `2K` / `4K`
  * `seedream-4-0-250828` — `1K` / `2K` / `4K`

  **Неподдерживаемые размеры возвращают 400**. Точные значения пикселей должны удовлетворять: total ∈ \[1280×720, 4096×4096] и aspect ratio ∈ \[1/16, 16].
</Warning>

<Info>
  Все API генерации изображений работают **синхронно** — нет task ID для опроса, и если ваш клиент отключится, результат будет потерян, хотя запрос все равно будет тарифицироваться. Установите для этой модели достаточно большой timeout; см. [Основы API генерации изображений и лучшие практики](/ru/api-capabilities/image-api-best-practices).
</Info>

## Примеры кода

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="A modern tech product launch poster with bold typography, sleek smartphone on gradient background, text: 'Innovation 2026', ultra detailed, professional",
    size="2K",
    response_format="url",
    extra_body={
        "output_format": "png",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (сырые запросы)

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
        "model": "seedream-5-0-260128",
        "prompt": "A serene Japanese garden with cherry blossoms, koi pond, traditional wooden bridge, golden hour, ultra detailed",
        "size": "2K",
        "response_format": "url",
        "watermark": False
    },
    timeout=60  # ~15s typical, 4K + hd may reach 30-60s
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "A futuristic cityscape at night with neon lights and flying vehicles, cyberpunk style, high detail",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js (fetch)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Minimalist line-art logo of a cat, monochrome, vector style',
        size: '2K',
        response_format: 'url',
        output_format: 'png',
        watermark: false
    })
});

const { data } = await resp.json();
console.log(data[0].url);
```

### JavaScript в браузере

```javascript theme={null}
{/* Demo only — proxy through your backend in production to avoid leaking the key */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Watercolor northern lights over snowy mountains',
        size: '2K'
    })
});

const { data } = await resp.json();
document.getElementById('img').src = data[0].url;
```

## Справочник параметров

| Параметр          | Тип     | Обязательно | По умолчанию      | Описание                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ------- | ----------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string  | да          | —                 | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (уровень pro, \$0.12/запрос)                                                                                                                                                                                                                                        |
| `prompt`          | string  | да          | —                 | Текст prompt. Поддерживает английский и китайский языки. Укажите подробности сцены, стиля и освещения.                                                                                                                                                                                                                                                                |
| `size`            | string  | нет         | `2K`              | Предустановленный tier (зависит от версии) или точные пиксели `WxH`                                                                                                                                                                                                                                                                                                   |
| `response_format` | string  | нет         | `url`             | `url` возвращает подписанную ссылку; `b64_json` возвращает обычную base64-строку                                                                                                                                                                                                                                                                                      |
| `output_format`   | string  | нет         | `jpeg`            | 5.0 поддерживает `png` / `jpeg`; 4.5 / 4.0 — только `jpeg` (передавайте через `extra_body` в OpenAI SDK)                                                                                                                                                                                                                                                              |
| `n`               | integer | —           | —                 | ⚠️ **Не поддерживается upstream**: параметр игнорируется без предупреждения — вы по-прежнему получите 1 изображение и будете тарифицироваться за 1. Для вывода нескольких изображений используйте `sequential_image_generation` (тарификация за каждое сгенерированное изображение), см. [Редактирование изображений](/ru/api-capabilities/seedream-image/image-edit) |
| `seed`            | integer | —           | —                 | ⚠️ Официально поддерживается только seedream-3-0-t2i; игнорируется текущими моделями 4.x / 5.x                                                                                                                                                                                                                                                                        |
| `watermark`       | boolean | нет         | зависит от версии | Включать ли водяной знак BytePlus (установите `false` для коммерческого использования)                                                                                                                                                                                                                                                                                |
| `stream`          | boolean | нет         | `false`           | Потоковый вывод, полезен для длинных prompt и высокого разрешения                                                                                                                                                                                                                                                                                                     |

<Tip>
  Подробные ограничения параметров, допустимые значения и примеры доступны на панели Playground справа. **Параметры редактирования / multi-image (`image`, `sequential_image_generation` и т. д.) описаны на странице [Редактирование изображений](/ru/api-capabilities/seedream-image/image-edit).**
</Tip>

## Формат ответа

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 1,
    "output_tokens": 6240,
    "total_tokens": 6240
  }
}
```

<Warning>
  **⚠️ Оговорки по полям ответа**

  * Когда `response_format=url`, `data[].url` — это **временный подписанный BytePlus TOS URL** (обычно действителен 24 часа). Для production сразу загрузите его в свое хранилище.
  * Когда `response_format=b64_json`, `data[].b64_json` — это **обычная base64-строка**, **без** префикса `data:image/...;base64,`. Декодируйте ее (`base64.b64decode`) для вывода в файл или самостоятельно добавьте префикс для отображения в браузере.
  * `data[].size` отражает **фактический размер результата**, который может немного отличаться от запрошенного `size` после нормализации соотношения сторон моделью.
</Warning>

<Info>
  `usage.generated_images` отражает количество изображений, учитываемых в тарификации. Seedream тарифицируется за каждое изображение; `output_tokens` / `total_tokens` — это метрики наблюдаемости, и они не влияют на тарификацию.
</Info>


## OpenAPI

````yaml api-reference/seedream-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream Text-to-Image API
  description: >
    BytePlus ModelArk Seedream image generation models — text-to-image endpoint
    (no `image` field).


    - Active versions unified: `seedream-5-0-260128` / `seedream-4-5-251128` /
    `seedream-4-0-250828` / `seedream-5-0-pro-260628` (pro tier, \$0.12 per
    request, ~2 min per image)

    - Resolution tiers vary by version (5.0: 2K/3K; 4.5: 2K/4K; 4.0: 1K/2K/4K;
    5.0-pro: 1K/2K plus WxH up to 4.19M total px, longest edge ~2720 at 16:9)

    - Output format: 5.0 / 5.0-pro support png/jpeg; 4.5/4.0 only jpeg

    - 5.0-pro does not accept `sequential_image_generation` / `stream` — passing
    them returns 400

    - Latency ≈ 15s per image, may extend to 30-60s for 4K + hd

    - Default 500 RPM (Max Images per Minute)

    - For editing, multi-image fusion, or batch sequence generation, see [Image
    Editing](/en/api-capabilities/seedream-image/image-edit) (same endpoint,
    different params)


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.


    **Get API Key**: visit [APIYI Console](https://api.apiyi.com/token) to
    create a token.
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
      summary: 'Text-to-Image: generate an image from a text prompt'
      description: >
        Generate an image with the Seedream models from a text prompt.


        - Required: `model`, `prompt`

        - Optional: `size`, `response_format`, `output_format`, `watermark`,
        `stream`

        - Note: OpenAI's `n` parameter is not supported upstream (silently
        ignored — you still get 1 image); for multi-image output use
        `sequential_image_generation`

        - Resolution tiers vary by version — see [Overview / Technical
        Specs](/en/api-capabilities/seedream-image/overview#technical-specs)

        - For reference-image editing or multi-image fusion, use the same
        endpoint with `image` and `sequential_image_generation` — see [Image
        Editing](/en/api-capabilities/seedream-image/image-edit)
      operationId: generateSeedreamTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamGenerateRequest'
            example:
              model: seedream-5-0-260128
              prompt: >-
                A modern tech product launch poster, sleek smartphone on
                gradient background, text: 'Innovation 2026', ultra detailed,
                professional
              size: 2K
              response_format: url
              output_format: png
              watermark: false
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: >-
            Invalid parameters (size not supported by this version, pixel out of
            range, aspect ratio out of bounds)
        '401':
          description: Unauthorized — invalid API key
        '403':
          description: Blocked by content moderation
        '429':
          description: Rate limit (default 500 RPM) or insufficient balance
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - seedream-5-0-260128
            - seedream-5-0-lite-260128
            - seedream-4-5-251128
            - seedream-4-0-250828
            - seedream-5-0-pro-260628
          default: seedream-5-0-260128
        prompt:
          type: string
          description: >-
            Prompt, supports both English and Chinese. Describe scene, style,
            and lighting in detail for better results.
          example: >-
            A serene Japanese garden with cherry blossoms, koi pond, traditional
            bridge, golden hour, ultra detailed
        size:
          type: string
          description: >
            Output size. Preset tiers (vary by version):

            - `1K` (~1024×1024) — 4.0 only

            - `2K` (~2048×2048) — 5.0 / 4.5 / 4.0

            - `3K` (~3072×3072) — 5.0 only

            - `4K` (~4096×4096) — 4.5 / 4.0


            Or exact pixel size `WxH`, total pixels ∈ \[1280×720, 4096×4096\],
            aspect ratio ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
          description: >-
            url returns a temp signed link (24h validity); b64_json returns
            plain base64 (no data: prefix)
          enum:
            - url
            - b64_json
          default: url
        output_format:
          type: string
          description: Output format. 5.0 supports png/jpeg; 4.5/4.0 only jpeg
          enum:
            - png
            - jpeg
          default: jpeg
        seed:
          type: integer
          description: >-
            Random seed. Note: officially supported only by seedream-3-0-t2i;
            ignored by the current 4.x / 5.x models
          example: 42
        watermark:
          type: boolean
          description: >-
            Whether to include the BytePlus watermark. Set to false for
            commercial use
          default: false
        stream:
          type: boolean
          description: >-
            Enable streaming output. Useful for long prompts and high-resolution
            generation
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          description: Unix timestamp
          example: 1768518000
        data:
          type: array
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  Image URL (returned when response_format=url; signed temp URL
                  valid for 24h)
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png
              b64_json:
                type: string
                description: >-
                  Plain base64 string (no data:image/...;base64, prefix).
                  Returned when response_format=b64_json.
              size:
                type: string
                description: >-
                  Actual output size, may differ slightly from requested due to
                  aspect-ratio adjustments
                example: 2048x2048
        usage:
          type: object
          properties:
            generated_images:
              type: integer
              description: Actual billed image count
              example: 1
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6240
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````