> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для text-to-image

> Справочник API для gpt-image-2 text-to-image и живого тестирования — любое допустимое разрешение (включая 4K), с оплатой по token

<Info>
  Интерактивная песочница справа поддерживает тестирование в реальном времени. Укажите ваш ключ API в **Authorization** (формат: `Bearer sk-xxx`), введите prompt, выберите размер / качество и отправьте.
</Info>

<Tip>
  **Сценарий использования**: Эта страница предназначена для «text-to-image». Просто укажите prompt — загрузка изображения не требуется. Для редактирования по опорному изображению, объединения нескольких изображений или дорисовки по маске используйте [эндпоинт Image Edit](/ru/api-capabilities/gpt-image-2/image-edit).
</Tip>

<Warning>
  **🖥️ Ограничение браузерной песочницы (важно)**

  Этот эндпоинт возвращает в ответе **необработанную строку base64** (обычно несколько МБ). Из-за ограничений рендеринга в браузере песочница справа после получения ответа может показать `请求时发生错误: unable to complete request` — **на самом деле запрос успешно выполнен**; браузер просто не может отобразить такую длинную строку base64.

  **Рекомендуемый рабочий процесс** (подходит для новичков):

  * **Скопируйте приведённый ниже пример на Python / Node.js / cURL и запустите его локально**. Код автоматически `base64.b64decode`s ответ и **записывает изображение в файл**.
  * Если вам всё же нужно использовать встроенную браузерную песочницу, установите `size` на самый маленький уровень (например, `1024x1024`) и `quality` на `low`, чтобы уменьшить ответ.
</Warning>

<Info>
  Все API для изображений являются **синхронными** — здесь нет ID задачи для опроса, и если ваш клиент отключится, результат будет потерян, хотя запрос всё равно будет тарифицироваться. Установите достаточно большой таймаут для этой модели; см. [Основы и лучшие практики Image API](/ru/api-capabilities/image-api-best-practices).
</Info>

<Warning>
  **⚠️ Неподдерживаемые параметры**

  * `input_fidelity` — `gpt-image-2` принудительно включает high-fidelity; передача этого параметра вернёт 400. При миграции с 1.5 просто удалите эту строку.

  **Результаты выше `2560×1440` остаются экспериментальными**. Для продакшена предпочитайте пресеты: `2048x1152` / `2048x2048` / `3840x2160`.
</Warning>

## Примеры кода

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2",
    prompt="Cyberpunk city at night, neon sign closeup, cinematic frame",
    size="2048x1152",
    quality="high",
    output_format="jpeg",
    output_compression=85
)

# b64_json is raw base64 (no prefix) — decode and write to file
with open("out.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (сырые запросы)

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-image-2",
        "prompt": "Landscape 2K seaside lighthouse at sunset, cinematic frame",
        "size": "2048x1152",
        "quality": "high"
    },
    timeout=360  # high + 2K/4K can run 3-5 min; ~120s defaults will frequently false-timeout
).json()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "Orange tabby cat with sunglasses at a seaside bar, cinematic",
    "size": "2048x1152",
    "quality": "high",
    "output_format": "jpeg",
    "output_compression": 85
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
        model: 'gpt-image-2',
        prompt: 'Minimalist line-art cat logo',
        size: '1024x1024',
        quality: 'medium'
    })
});

const { data } = await resp.json();
// b64_json is raw base64 — decode manually
fs.writeFileSync('logo.png', Buffer.from(data[0].b64_json, 'base64'));
```

### JavaScript в браузере (прямой рендер)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: 'Watercolor-style Nordic aurora',
        size: '1536x1024',
        quality: 'high'
    })
});

const { data } = await resp.json();
// Browser rendering needs the data URL prefix prepended manually
document.getElementById('img').src = `data:image/png;base64,${data[0].b64_json}`;
```

## Справочник параметров

| Параметр             | Тип    | Обязательно | По умолчанию | Описание                                                                                                                                                                                                    |
| -------------------- | ------ | ----------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | string | Yes         | —            | Фиксировано: `gpt-image-2`                                                                                                                                                                                  |
| `prompt`             | string | Yes         | —            | prompt, поддерживает китайский и английский                                                                                                                                                                 |
| `size`               | string | No          | `auto`       | Размер вывода — предустановленный или пользовательский, соответствующий ограничениям                                                                                                                        |
| `quality`            | string | No          | `auto`       | `low` / `medium` / `high` / `auto`                                                                                                                                                                          |
| `output_format`      | string | No          | `png`        | `png` / `jpeg` / `webp`                                                                                                                                                                                     |
| `output_compression` | int    | No          | —            | 0–100, только для `jpeg` / `webp`                                                                                                                                                                           |
| `background`         | string | No          | `auto`       | `transparent` / `opaque` / `auto`. При `transparent`, `output_format` должно быть `png` или `webp` — сочетание с `jpeg` возвращает 400. См. [FAQ по прозрачному фону](/ru/faq/image-transparent-background) |
| `moderation`         | string | No          | `auto`       | `auto` / `low` (мягкая модерация)                                                                                                                                                                           |
| `n`                  | int    | No          | 1            | Поддерживается только 1                                                                                                                                                                                     |

<Warning>
  **Не передавайте устаревшие значения DALL·E `standard` / `hd` для `quality`.** Принимаются только четыре официальных значения enum `low` / `medium` / `high` / `auto`. Устаревшие значения ведут себя непоследовательно в разных каналах бэкенда: иногда они сразу завершаются с 400 (`invalid_value`), а иногда молча игнорируются, и запрос выполняется с `auto` (непредсказуемая стоимость). Всегда явно передавайте одно из четырёх официальных значений.
</Warning>

<Tip>
  Подробные ограничения, допустимые значения и примеры видны в Playground справа — все поля enum поддерживают выбор из выпадающего списка.
</Tip>

## Формат ответа

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ],
    "usage": {
        "input_tokens": 17,
        "input_tokens_details": {
            "image_tokens": 0,
            "text_tokens": 17
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 213
    }
}
```

<Warning>
  **⚠️ b64\_json is raw base64**, **без** `data:image/...;base64,` префикса. Клиент должен:

  * **Записать файл**: `base64.b64decode(b64_str)` → записать на диск
  * **Отрисовка в браузере**: добавьте `data:image/png;base64,` вручную

  По состоянию на июль 2026 года, `gpt-image-2-all` / `gpt-image-2-vip` тоже возвращают raw base64, но их ранние версии включали префикс — при использовании кода для разных моделей всегда сначала проверяйте `startsWith('data:')`.
</Warning>

<Info>
  Поле `usage` отражает фактическое число тарифицируемых tokens для этого вызова. `input_tokens_details` / `output_tokens_details` отдельно разбивают tokens текста и изображения (`image_tokens` всегда равно 0 для обычного text-to-image). Полное описание поля и формулу самостоятельного расчета стоимости см. в разделе [Как проверить реальное число tokens для каждого вызова](/ru/api-capabilities/gpt-image-2/overview#how-to-check-the-real-token-count-for-each-call) на обзорной странице.
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2 Text-to-Image API
  description: >
    OpenAI's flagship image generation model `gpt-image-2` — text-to-image
    endpoint.


    - Any valid resolution (1K / 2K / 4K, up to 3840×2160)

    - Quality tiers: low / medium / high / auto

    - Output formats: png (default) / jpeg / webp

    - Native Chinese prompt support

    - Single image per call (n=1)

    - ~120 seconds (4K high quality approaches 2 minutes)

    - **Not supported**: transparent background (`background: transparent` will
    error)


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
  /v1/images/generations:
    post:
      tags:
        - Text-to-Image
      summary: 'Text-to-Image: generate image from text prompt'
      description: >
        Generate an image from a text prompt using `gpt-image-2`.


        - Required: `model`, `prompt`

        - Optional: `size`, `quality`, `output_format`, `output_compression`,
        `background`, `moderation`, `n`

        - Custom sizes must satisfy: max edge ≤ 3840px, both edges multiples of
        16, ratio ≤ 3:1, total pixels 0.65MP–8.3MP

        - For reference-image editing or multi-image fusion, use [Image Edit
        endpoint](/en/api-capabilities/gpt-image-2/image-edit)
      operationId: generateGptImage2TextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2
              prompt: Cyberpunk city at night, neon sign closeup, cinematic frame
              size: 2048x1152
              quality: high
              output_format: jpeg
              output_compression: 85
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters (size constraint violation, input_fidelity
            passed, background:transparent, etc.)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Content moderation block
        '429':
          description: Rate limit or quota exceeded
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
          description: Model name, fixed as gpt-image-2
          enum:
            - gpt-image-2
          default: gpt-image-2
        prompt:
          type: string
          description: >-
            Prompt text. Supports both Chinese and English. Place scene
            description at the front for better adherence.
          example: Cyberpunk city at night, neon sign closeup, cinematic frame
        size:
          type: string
          description: >
            Output size. Presets: 1024x1024 / 1536x1024 / 1024x1536 / 2048x2048
            / 2048x1152 / 3840x2160 / 2160x3840.

            Also accepts any valid custom size (max edge ≤ 3840, both multiples
            of 16, ratio ≤ 3:1, total pixels 0.65–8.3MP).
          example: 2048x1152
          default: auto
        quality:
          type: string
          description: >-
            Quality tier. low (sketches/batch), medium (daily), high (final/fine
            text), auto (default)
          enum:
            - auto
            - low
            - medium
            - high
          default: auto
        output_format:
          type: string
          description: Output format
          enum:
            - png
            - jpeg
            - webp
          default: png
        output_compression:
          type: integer
          description: Output compression (0–100), only effective for jpeg/webp
          minimum: 0
          maximum: 100
          example: 85
        background:
          type: string
          description: >-
            Background mode. auto (default) or opaque. **Not supported**:
            transparent
          enum:
            - auto
            - opaque
          default: auto
        moderation:
          type: string
          description: Moderation strength. auto (default) or low
          enum:
            - auto
            - low
          default: auto
        'n':
          type: integer
          description: Number of images. This model only supports 1
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
          description: Generation results (this model returns 1 image per call)
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: >-
                  **Raw base64 string** (no data:image/...;base64, prefix).
                  Client must decode to file or prepend prefix.
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: Token usage for this call (used for token-based billing)
          properties:
            input_tokens:
              type: integer
              example: 42
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6282
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from APIYI Console

````