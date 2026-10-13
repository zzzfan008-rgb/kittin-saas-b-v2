> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API Text-to-Image

> Справочник API Text-to-Image и интерактивный Playground для Seedream — только текстовые prompt, разрешения 1K/1.5K/2K/3K/4K и точные размеры в пикселях, все версии на едином эндпоинте

<Info>
  Интерактивный Playground справа позволяет вызывать API напрямую. Укажите в заголовке **Authorization** ваш API-ключ (формат: `Bearer sk-xxx`), введите prompt, выберите модель и размер и нажмите кнопку отправки.
</Info>

<Tip>
  **Область применения**: на этой странице рассматривается исключительно генерация изображений по тексту (без поля `image`). Для редактирования на основе референсных изображений, объединения нескольких изображений или пакетной генерации последовательностей см. раздел [Редактирование изображений](/ru/api-capabilities/seedream-image/image-edit) — используется тот же эндпоинт, отличаются только параметры.
</Tip>

<Warning>
  **🖥️ Ограничение Playground в браузере (только для режима b64\_json)**

  В режиме по умолчанию `response_format: "url"` Playground работает корректно (ответ представляет собой лишь временную ссылку BytePlus TOS). Если переключиться на `response_format: "b64_json"`, ответ будет содержать строку base64 размером в несколько мегабайт, и Playground в браузере может отобразить `请求时发生错误: unable to complete request` — **на самом деле запрос завершился успешно**; браузер просто не может отрендерить настолько длинную строку base64.

  **Рекомендуемый рабочий процесс**:

  * Хотите просто просмотреть изображение? **Оставьте режим по умолчанию `url`** — Playground напрямую возвращает ссылку (не забудьте скачать её в собственное хранилище в течение 24 часов).
  * Нужен b64\_json? **Скопируйте приведенный ниже пример кода и запустите его локально** — код автоматически декодирует изображение и сохранит его в файл.
</Warning>

<Warning>
  **⚠️ Доступные разрешения зависят от версии**

  * `seedream-5-0-flash-260915` — пресеты `1K` / `1.5K` / `2K`, а также точные значения WxH от 0.92M до 4.62M пикселей суммарно, соотношение сторон до 16:1 (пресетов 3K/4K нет; при использовании пресетов модель сама выбирает соотношение сторон; `sequential_image_generation` / `stream` не принимаются — их передача возвращает 400; \~15–20 с на изображение, \$0.018 за запрос)
  * `seedream-5-0-pro-260628` — пресеты `1K` / `2K`, а также точные значения WxH до 4.19M пикселей суммарно (при соотношении 16:9 длинная сторона достигает 2720×1530, проверено; пресетов 3K/4K нет; `sequential_image_generation` / `stream` не принимаются — их передача возвращает 400; \~2 мин на изображение)
  * `seedream-5-0-260128` — только `2K` / `3K` (без 4K)
  * `seedream-4-5-251128` — `2K` / `4K`
  * `seedream-4-0-250828` — `1K` / `2K` / `4K`

  **При неподдерживаемых размерах возвращается ошибка 400**. Точные значения пикселей должны удовлетворять условию: общее число пикселей ∈ \[1280×720, 4096×4096] и соотношение сторон ∈ \[1/16, 16].
</Warning>

<Info>
  Все API для работы с изображениями **синхронны** — здесь нет task ID для опроса статуса, и если клиент разорвёт соединение, результат будет потерян, при этом тарификация за запрос всё равно будет списана. Установите для этой модели достаточно большой таймаут; см. [Основы работы с API изображений и лучшие практики](/ru/api-capabilities/image-api-best-practices).
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

| Параметр | Тип | Обязательный | По умолчанию | Описание |
| - | - | - | - | - |
| `model` | string | да | — | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (тариф pro, \$0.12/запрос) / `seedream-5-0-flash-260915` (тариф fast, \$0.018/запрос) |
| `prompt` | string | да | — | Текст prompt. Поддерживаются английский и китайский языки. Подробно опишите сцену, стиль, освещение. |
| `size` | string | нет | `2K` | Предустановленный уровень (зависит от версии) или точный размер в пикселях `WxH` |
| `response_format` | string | нет | `url` | `url` возвращает подписанную ссылку; `b64_json` возвращает обычную строку base64 |
| `output_format` | string | нет | `jpeg` | Серия 5.0 поддерживает `png` / `jpeg`; 4.5 / 4.0 — только `jpeg` (передается через `extra_body` в OpenAI SDK) |
| `n` | integer | — | — | ⚠️ **Не поддерживается upstream**: параметр игнорируется без уведомления — вы все равно получаете 1 изображение и тарификация идет за 1. Для генерации нескольких изображений используйте `sequential_image_generation` (тарифицируется каждое сгенерированное изображение), см. [Редактирование изображений](/ru/api-capabilities/seedream-image/image-edit) |
| `seed` | integer | — | — | ⚠️ Официально поддерживается только seedream-3-0-t2i; игнорируется текущими моделями 4.x / 5.x |
| `watermark` | boolean | нет | различается | Добавлять ли водяной знак BytePlus (укажите `false` для коммерческого использования; 5.0-flash добавляет водяной знак «AI generated», если параметр опущен) |
| `stream` | boolean | нет | `false` | Потоковая передача вывода, полезна для длинных prompt + высокого разрешения. Не поддерживается в 5.0-pro / 5.0-flash — возвращает 400 |

<Tip>
  Подробные ограничения параметров, допустимые значения и примеры доступны на панели Playground справа. **Параметры редактирования / генерации нескольких изображений (`image`, `sequential_image_generation` и т. д.) описаны на странице [Редактирование изображений](/ru/api-capabilities/seedream-image/image-edit).**
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
    request, ~2 min per image) / `seedream-5-0-flash-260915` (fast tier, \$0.018
    per request, ~15–20 s per image)

    - Resolution tiers vary by version (5.0: 2K/3K; 4.5: 2K/4K; 4.0: 1K/2K/4K;
    5.0-pro: 1K/2K plus WxH up to 4.19M total px, longest edge ~2720 at 16:9;
    5.0-flash: 1K/1.5K/2K plus WxH from 0.92M to 4.62M total px)

    - Output format: the 5.0 series supports png/jpeg; 4.5/4.0 only jpeg

    - 5.0-pro / 5.0-flash do not accept `sequential_image_generation` / `stream`
    — passing them returns 400

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
            - seedream-5-0-flash-260915
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

            - `1K` (~1024×1024) — 4.0 / 5.0-pro / 5.0-flash

            - `1.5K` (~1536×1536) — 5.0-flash only

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
            generation. Not accepted by 5.0-pro / 5.0-flash (returns 400)
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.