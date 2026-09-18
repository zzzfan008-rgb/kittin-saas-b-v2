> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API Text-to-Image

> gpt-image-2-vip справочник API для text-to-image и интерактивная песочница — генерация изображений по тексту + размер, фиксированно $0.03 за изображение для всех размеров

<Info>
  Интерактивная песочница справа поддерживает прямое онлайн-тестирование. Введите ваш API Key в поле **Authorization** (формат: `Bearer sk-xxx`), задайте `prompt` и `size`, затем нажмите «Отправить».
</Info>

<Tip>
  **Область применения**: Эта страница предназначена для **генерации изображений по тексту**. Просто введите prompt и `size` — загрузка изображения не требуется. Чтобы редактировать или объединять существующие изображения, используйте [эндпоинт Image Editing](/ru/api-capabilities/gpt-image-2-vip/image-edit).

  **Отличие от `gpt-image-2-all`**: идентичная структура вызова, только на одно дополнительное поле `size`. Если вам не нужно жестко фиксировать размеры и нужен максимально быстрый результат, используйте [`gpt-image-2-all`](/ru/api-capabilities/gpt-image-2-all/text-to-image) вместо этого.
</Tip>

<Warning>
  **🖥️ Ограничение браузерной песочницы**

  Этот эндпоинт **по умолчанию возвращает base64-строку (`b64_json`)**, которая может занимать несколько МБ, поэтому в браузерной песочнице может отображаться `请求时发生错误: unable to complete request` — **на самом деле запрос выполнен успешно**; браузер просто не может отрисовать такую длинную base64-строку.

  **Рекомендуемый рабочий процесс**: **скопируйте пример кода ниже и запустите его локально** — он автоматически декодирует изображение и сохранит его в файл.
</Warning>

<Info>
  Все image API являются **синхронными** — здесь нет task ID для опроса, и если ваш клиент отключится, результат будет потерян, хотя запрос все равно будет тарифицирован. Установите для этой модели достаточно большой timeout; см. [Основы и лучшие практики Image API](/ru/api-capabilities/image-api-best-practices).
</Info>

<Warning>
  **⚠️ Важные примечания по параметрам**

  * **`size`**: передайте `auto`, чтобы модель выбрала размер сама (vip обычно сходится к относительно **фиксированному/стабильному** размеру для данного prompt), либо выберите один из 30 поддерживаемых размеров (10 соотношений сторон × 1K Fast / 2K Recommended / 4K Detail — см. [полную таблицу размеров на странице обзора](/ru/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table)) для жесткой фиксации. Используйте строчные ASCII `x`, например `2048x1360`, `3840x2160` — никогда не `×` и не заглавные `X`.
  * **`quality`**: ❌ отклоняется — **не передавайте**.
  * **`n`**: ❌ отклоняется — по одному изображению за вызов. **Отправка `n=3` тарифицируется в 3×, но все равно возвращается 1 изображение.** Уберите это поле.
  * **`aspect_ratio`**: ❌ отклоняется — соотношение сторон определяется `size`.
  * **`response_format`**: если не указывать, возвращается base64 (raw, без префикса, проверено 2026-07); передайте `"url"` для получения URL изображения. Компаниям, которым нужен **предсказуемый вывод URL**, следует переключить свой token на группу `image2_OSS`, чтобы получать детерминированный вывод URL без fallback на base64.
</Warning>

## Примеры кода

### Python

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-image-2.5-vip",
        "prompt": "Cinematic landscape, old lighthouse by the sea at dusk, photorealistic",
        "size": "2048x1152",         # 16:9 2K Recommended
        "response_format": "url"     # defaults to base64; explicit response_format needed to read the url field
    },
    timeout=300  # conservative; absorbs long-tail and image download
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**Пример уровня детализации 4K (обои / печать)**:

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2.5-vip",
        "prompt": "Desktop wallpaper, cyberpunk city night, neon signs, wet pavement reflections",
        "size": "3840x2160"          # 16:9 4K Detail
    },
    timeout=300
).json()

# Verified 2026-07: b64_json is raw base64 (no data: prefix); earlier versions included the prefix — a check is safest
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("wallpaper.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-vip",
    "prompt": "Product shot of a white ceramic mug on a gray desk, soft natural light",
    "size": "2048x1360"
  }'
```

### Node.js

```javascript theme={null}
const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2.5-vip",
      prompt: "1:1 square logo, minimalist cat line art",
      size: "2048x2048"        // 1:1 2K Recommended
    })
  }
);

const data = await response.json();
// Verified raw base64 (no data: prefix) — prepend before rendering; earlier versions included the prefix, so check first
let b64 = data.data[0].b64_json;
if (!b64.startsWith("data:")) b64 = `data:image/png;base64,${b64}`;
document.getElementById("result").src = b64;
```

### OpenAI SDK (Python, рекомендуется)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2.5-vip",
    prompt="Ink wash landscape painting, traditional Chinese style, vertical composition",
    size="1536x2048",        # 3:4 2K Portrait
)
print(resp.data[0].url)
```

## Параметры

| Параметр | Тип    | Обязательный                   | Описание                                                                                                                                                                                                       |
| -------- | ------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`  | string | Да                             | `gpt-image-2.5-vip` (= `gpt-image-2.5-sunburst-vip`) / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip` предыдущего поколения, та же цена и формат вызова                                                         |
| `prompt` | string | Да                             | Промпт — опишите содержание, стиль, освещение и т. д.                                                                                                                                                          |
| `size`   | string | **Настоятельно рекомендуется** | Размер вывода: `auto` (определяется моделью — **vip остаётся относительно фиксированным для данного промпта**) или один из 30 размеров; формат `WIDTHxHEIGHT` (строчные `x`); пропуск поля эквивалентен `auto` |

<Tip>
  **Шпаргалка по размерам** — эти варианты подходят для большинства случаев:

  * Главные изображения для электронной коммерции: `2048x1360` (3:2 2K) / `2048x2048` (1:1 2K)
  * Вертикальные постеры: `1536x2048` (3:4 2K) / `2480x3312` (3:4 4K)
  * Миниатюры видео: `2048x1152` (16:9 2K) / `3840x2160` (16:9 4K)
  * Обои для историй / телефона: `1152x2048` (9:16 2K) / `2160x3840` (9:16 4K)

  Полная таблица из 30 размеров: [страница обзора](/ru/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table).
</Tip>

## Формат ответа

**По умолчанию возвращается base64** (`data[0].b64_json`, raw base64 без префикса, проверено в 2026-07). Чтобы вместо этого получить **image URL**, явно передайте `response_format: "url"`; компаниям, которым **нужен вывод по URL**, следует переключить группу своего token на **`image2_OSS`** для стабильного вывода URL без fallback на base64. `data[0]` возвращает либо `url`, либо `b64_json` — никогда оба сразу.

**Режим `b64_json`** (по умолчанию):

```json theme={null}
{
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "created": 1778037127,
  "usage": {
    "input_tokens": 98,
    "output_tokens": 1185,
    "total_tokens": 1283
  }
}
```

**Режим `url`** (явно передайте `response_format: "url"`; используйте группу `image2_OSS`, если вы зависите от URL — R2 CDN globally accelerated):

```json theme={null}
{
  "data": [
    {
      "url": "https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png"
    }
  ],
  "created": 1778037331,
  "usage": {
    "input_tokens": 30,
    "output_tokens": 2074,
    "total_tokens": 2104
  }
}
```

<Warning>
  **Примечание о совместимости**: проверено в июле 2026 — поле `b64_json` представляет собой **raw base64 без префикса `data:`**; декодируйте его, чтобы записать файл, или добавьте префикс вручную перед рендерингом. **В более ранних версиях префикс действительно присутствовал**, поэтому всегда сначала выполняйте проверку `startsWith('data:')`, чтобы поддерживать оба варианта.
</Warning>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Обзор модели (полная таблица размеров)" icon="sparkles" href="/ru/api-capabilities/gpt-image-2-vip/overview">
    Полная таблица из 30 размеров, цены, технические характеристики
  </Card>

  <Card title="API редактирования изображений" icon="image" href="/ru/api-capabilities/gpt-image-2-vip/image-edit">
    `/v1/images/edits` объединение нескольких изображений и редактирование
  </Card>

  <Card title="Смежная модель gpt-image-2-all" icon="copy" href="/ru/api-capabilities/gpt-image-2-all/text-to-image">
    Тот же формат вызова, если вам не нужен фиксированный размер — более быстрый вывод (\~30–60s)
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-vip Text-to-Image API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Adobe line,
    Firefly) — text-to-image endpoint.


    - Per-call billing, $0.03/image (flat across all sizes; no surcharge for 4K)

    - Supports 30 explicit sizes (10 ratios × 1K Fast / 2K Recommended / 4K
    Detail)

    - ~90–150s generation time, supports Chinese prompts

    - `quality` works in testing (all six tiers on the 2.5 models, up to `high`
    on `gpt-image-2-vip`; channel behavior, not a commitment); n / aspect_ratio
    are not supported

    - **Defaults to base64 (`b64_json`); can switch to R2 CDN URL (`url`)**.
    `data[0]` returns either `url` **or** `b64_json` — never both in the same
    response.


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers


    **Get API Key**: Visit [API易 Console](https://api.apiyi.com/token) to create
    a token
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
      summary: 'Text-to-Image: generate at an explicit size from a text prompt'
      description: >
        Generate images with `gpt-image-2-vip` from a text prompt and lock the
        output dimension via `size`.


        - `model` and `prompt` required; `size` strongly recommended

        - `size` must be one of the 30 supported sizes (see overview page)

        - `quality` is optional (see the field description); do not pass `n`

        - For editing or multi-image fusion, use the [Image Editing
        endpoint](/en/api-capabilities/gpt-image-2-vip/image-edit)
      operationId: generateGptImage2VipTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2.5-vip
              prompt: >-
                Cinematic landscape, old lighthouse by the sea at dusk,
                photorealistic
              size: 2048x1152
      responses:
        '200':
          description: >-
            Image successfully generated. Defaults to base64 in
            `data[0].b64_json` — `url` is not returned in the same response.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
              example:
                data:
                  - b64_json: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
                created: 1778037127
                usage:
                  input_tokens: 98
                  output_tokens: 1185
                  total_tokens: 1283
        '400':
          description: size not in the 30-size set, or malformed
        '401':
          description: Unauthorized - Invalid API Key
        '429':
          description: Rate limited or quota exhausted
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
            Model name: gpt-image-2.5-vip (= sunburst-vip) /
            gpt-image-2.5-flare-vip / gpt-image-2-vip, same price and call
            format
          enum:
            - gpt-image-2.5-vip
            - gpt-image-2.5-sunburst-vip
            - gpt-image-2.5-flare-vip
            - gpt-image-2-vip
          default: gpt-image-2.5-vip
        prompt:
          type: string
          description: Prompt — describe content, style, lighting, etc.
          example: >-
            Cinematic landscape, old lighthouse by the sea at dusk,
            photorealistic
        quality:
          type: string
          description: >
            Quality tier (works in testing; channel behavior, not a commitment —
            go by the actual response). All six tiers on the 2.5 models
            (`gpt-image-2.5-vip` / `gpt-image-2.5-sunburst-vip` /
            `gpt-image-2.5-flare-vip`); `gpt-image-2-vip` stops at `high` and
            rejects `xhigh` / `max`.

            Same-named tiers are not equal: 2.5 `high` only equals
            `gpt-image-2-vip` `medium`, and 2.5 `max` equals its `high`. The
            flat $0.03 does not change with the tier, but latency rises with it.
          enum:
            - auto
            - low
            - medium
            - high
            - xhigh
            - max
          example: high
        size:
          type: string
          description: >
            Output size. Pass `auto` to let the model decide (vip tends to
            converge on a relatively fixed size for a given prompt), or pick one
            of the 30 supported sizes (10 ratios × 1K Fast / 2K Recommended / 4K
            Detail) to lock it strictly.

            Format: `WIDTHxHEIGHT` with lowercase ASCII `x`, e.g., `2048x1360`,
            `3840x2160`. Flat $0.03/image across all tiers.
          enum:
            - auto
            - 1280x1280
            - 848x1280
            - 1280x848
            - 960x1280
            - 1280x960
            - 1024x1280
            - 1280x1024
            - 720x1280
            - 1280x720
            - 1280x544
            - 2048x2048
            - 1360x2048
            - 2048x1360
            - 1536x2048
            - 2048x1536
            - 1632x2048
            - 2048x1632
            - 1152x2048
            - 2048x1152
            - 2048x864
            - 2880x2880
            - 2336x3520
            - 3520x2336
            - 2480x3312
            - 3312x2480
            - 2560x3216
            - 3216x2560
            - 2160x3840
            - 3840x2160
            - 3840x1632
          example: 2048x1152
    ImageResponse:
      type: object
      description: >
        Image generation response. **Returns base64 by default**
        (`data[0].b64_json`); to get a `url`, switch to the `image2_OSS` group
        with `response_format=url`. `data[0]` returns **either `url` or
        `b64_json`, never both**.
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  R2 CDN accelerated link (returned when using the image2_OSS
                  group with response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned by default; already includes
                  the data:image/png;base64, prefix)
        created:
          type: integer
          description: Unix timestamp (seconds)
        usage:
          type: object
          description: Token usage statistics
          properties:
            input_tokens:
              type: integer
              description: Input tokens
            output_tokens:
              type: integer
              description: Output tokens (includes image-pixel accounting)
            total_tokens:
              type: integer
              description: Total tokens
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the API易 Console

````