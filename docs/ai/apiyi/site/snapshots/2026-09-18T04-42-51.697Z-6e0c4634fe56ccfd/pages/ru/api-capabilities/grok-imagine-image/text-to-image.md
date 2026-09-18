> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API генерации изображений по тексту

> Справочник API Grok Imagine 2 для генерации изображений по тексту и live-тестирования — генерация только по prompt с 5 соотношениями сторон, уровнями 1K/2K и до 10 изображений за один вызов

<Warning>
  **🔒 По умолчанию не открыт**: Grok Imagine 2 не входит в группу `Default`. Он находится в собственной **группе `Grok_imagine`**, и перед вызовом необходимо запросить доступ к нему (включая Playground на этой странице). Без него каждый вызов возвращает `503`.

  Политика безопасности контента этого семейства существенно отличается от политик других моделей на платформе, и некоторые категории не фильтруются, поэтому для ограничения рисков соответствия требованиям мы предоставляем доступ избирательно: существующие клиенты с совокупными расходами от \$1,000 могут включить его, описав свой сценарий использования службе поддержки; все остальные подают заявку через [поддержку WeCom](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec), указав сценарий использования и действующие меры модерации контента. Полный процесс: [Обзор Grok Imagine 2 — настройка группы](/ru/api-capabilities/grok-imagine-image/overview#group-setup).
</Warning>

<Info>
  Интерактивный Playground справа позволяет протестировать эндпоинт напрямую. Введите свой API-ключ в **Authorization** (формат: `Bearer sk-xxx`), заполните `prompt`, выберите `aspect_ratio` / `resolution` и отправьте запрос.
</Info>

<Tip>
  **Когда использовать эту страницу**: генерация изображения по тексту только из prompt — без загрузки изображения. Чтобы изменить существующее изображение или объединить несколько, используйте [эндпоинт редактирования изображений](/ru/api-capabilities/grok-imagine-image/image-edit).
</Tip>

<Warning>
  **⚠️ Не отправляйте референсные изображения в этот эндпоинт**

  Передача `image` / `image_url` / `images` здесь **не вызывает ошибку**. Возвращается 200 и генерируется совершенно новое изображение по prompt — **референс молча отбрасывается, а тарификация всё равно выполняется**.

  При отсутствии сигнала об ошибке это обычно обнаруживается только тогда, когда кто-то замечает, что результат не имеет ничего общего с входными данными. **Любой workflow с референсным изображением должен использовать [`/v1/images/edits`](/ru/api-capabilities/grok-imagine-image/image-edit).**
</Warning>

<Warning>
  **⚠️ Недопустимые параметры не вызывают ошибок**

  Недопустимые `aspect_ratio` (например, `5:7`), `resolution` (например, `1K`, `1024x1024`) и `response_format` (например, `base64`) все **молча заменяются значениями по умолчанию** и всё равно возвращают изображение. Если результат не соответствует ожиданиям, сначала проверьте написание параметров — обратите внимание, что значения `resolution` указываются в нижнем регистре: `1k` / `2k`.

  Одно исключение: `resolution: "4k"` возвращает `503 model_service_unavailable`, что означает **тарифный уровень не поддерживается**, а не то, что канал недоступен. Повторная попытка не поможет.
</Warning>

<Info>
  Все API изображений являются **синхронными**: асинхронного ID задачи нет, поэтому при отключении клиента результат теряется, хотя запрос всё равно тарифицируется. 1K занимает около 9 секунд, а 2K — около 15–17 секунд, поэтому **установите тайм-аут клиента на 360 секунд** — см. [Рекомендации по работе с Image API](/ru/api-capabilities/image-api-best-practices).
</Info>

## Примеры кода

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0  # image APIs are synchronous — allow plenty of time
)

resp = client.images.generate(
    model="grok-imagine-image",
    prompt="A photorealistic red wooden boat moored on a glassy alpine lake at dawn, "
           "mist over the water, snow-capped peaks behind, cinematic photography",
    n=1,
    # aspect_ratio / resolution are not standard OpenAI SDK fields — pass via extra_body
    extra_body={
        "aspect_ratio": "16:9",
        "resolution": "1k",
        "response_format": "url"
    }
)

# response_format defaults to url, returning a direct link (.jpg for 1K, .png for 2K)
urllib.request.urlretrieve(resp.data[0].url, "out.jpg")
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
        "model": "grok-imagine-image",
        "prompt": "Cyberpunk city on a rainy night, neon signage close-up, cinematic lighting",
        "n": 1,
        "aspect_ratio": "16:9",
        "resolution": "2k",          # 2k returns PNG at 5-6 MB per image
        "response_format": "b64_json"
    },
    timeout=360  # 2K takes 15-17s and longer at peak; 60s causes spurious timeouts
).json()

# b64_json is raw base64 with no data: prefix — decode and write directly
with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-image-quality",
    "prompt": "An orange tabby cat wearing sunglasses at a seaside bar, photorealistic, warm sunset tones",
    "n": 1,
    "aspect_ratio": "16:9",
    "resolution": "1k",
    "response_format": "url"
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
        model: 'grok-imagine-image',
        prompt: 'A serene Japanese garden with cherry blossoms, koi pond, golden hour',
        n: 2,                       // up to 10 per call, billed per image
        aspect_ratio: '4:3',
        resolution: '1k',
        response_format: 'url'
    }),
    // Node 18+ has no default timeout — use AbortSignal.timeout in production
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();

// with n=2 the data array holds two entries — download each
for (const [i, item] of data.data.entries()) {
    const img = await fetch(item.url);
    fs.writeFileSync(`out-${i}.jpg`, Buffer.from(await img.arrayBuffer()));
}
```

### JavaScript в браузере

```javascript theme={null}
// ⚠️ Demo only: a front-end key is exposed — use a backend proxy in production
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt: 'a minimalist poster of a mountain at sunrise, flat vector style',
        aspect_ratio: '3:4',
        resolution: '1k',
        response_format: 'url'   // url is far lighter than b64_json in a browser
    })
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## Справочник по параметрам

| Параметр          | Тип     | Обязательно | По умолчанию | Описание                                                                                                       |
| ----------------- | ------- | ----------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `model`           | string  | ✅           | —            | `grok-imagine-image` (\$0.02/image) или `grok-imagine-image-quality` (\$0.045/image)                           |
| `prompt`          | string  | ✅           | —            | Prompt на английском или китайском языке. Опишите объект, сцену, стиль и освещение                             |
| `n`               | integer | ❌           | `1`          | Изображений на вызов, **1-10**, тарифицируется за каждое изображение. `0` становится `1`; `≥11` возвращает 400 |
| `aspect_ratio`    | string  | ❌           | `1:1`        | `1:1` / `16:9` / `9:16` / `4:3` / `3:4`; другие значения без сообщения об ошибке откатываются к `1:1`          |
| `resolution`      | string  | ❌           | `1k`         | `1k` (JPEG, \~1 MP) или `2k` (PNG, \~4.2-4.5 MP). **Та же цена**; `4k` возвращает 503                          |
| `response_format` | string  | ❌           | `url`        | `url` возвращает прямую ссылку; `b64_json` возвращает raw base64 (**без** префикса `data:`)                    |

**Фактическое количество пикселей на выходе для каждого соотношения сторон:**

| `aspect_ratio` | `1k`      | `2k`      |
| -------------- | --------- | --------- |
| `1:1`          | 1024x1024 | 2048x2048 |
| `16:9`         | 1280x720  | 2816x1584 |
| `9:16`         | 720x1280  | 1584x2816 |
| `4:3`          | 1152x864  | 2368x1776 |
| `3:4`          | 864x1152  | 1776x2368 |

<Info>
  `seed` не поддерживается (принимается без ошибки, но не влияет на результат — результаты не воспроизводимы), как и mask inpainting. Поля в стиле OpenAI, такие как `size` / `quality` / `style`, игнорируются без сообщения об ошибке.
</Info>

## Формат ответа

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **Подводные камни полей ответа**

  * Каждая запись `data[]` содержит **либо** `url` **либо** `b64_json` в зависимости от `response_format` — никогда не оба сразу.
  * **`revised_prompt` не возвращается**, как и `respect_moderation` / `model`. Не предполагайте, что они существуют.
  * `b64_json` — это **сырой base64 без префикса `data:image/...;base64,`** — декодируйте его напрямую.
  * `created` всегда `0` и не может использоваться как временная метка.
  * При `n > 1` массив `data` содержит несколько записей — не считывайте только `data[0]`.
</Warning>

<Info>
  **`usage` не может использоваться для сверки**: `prompt_tokens` всегда равен `1000 x n`, независимо от фактической длины prompt. Это семейство тарифицируется по фиксированной ставке за изображение (\$0.02 / \$0.045); используйте записи тарификации в консоли APIYI для фактических списаний.
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Grok Imagine 2 Text-to-Image API
  description: >
    xAI Grok Imagine 2 image generation models — text-to-image endpoint.


    - Two models: `grok-imagine-image` (standard, \$0.02 per image),
    `grok-imagine-image-quality` (high quality, \$0.045 per image)

    - Flat per-request pricing — **1K and 2K cost the same**

    - 5 aspect ratios x 2 resolution tiers, all parameters genuinely take effect

    - Up to 10 images per request (`n` from 1 to 10)

    - 1K returns JPEG (~220-300 KB), 2K returns PNG (~5-6 MB)


    **⚠️ This endpoint does not accept reference images**: passing `image` /
    `image_url` / `images`

    returns 200 with a normal image, but the reference is silently discarded and
    you are still billed.

    For reference-image editing use the

    [Image Editing endpoint](/en/api-capabilities/grok-imagine-image/image-edit)
    (`multipart/form-data`).


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
      summary: 'Text-to-image: generate images from a text prompt'
      description: >
        Generate images from a text prompt with Grok Imagine 2 models.


        - Required: `model`, `prompt`

        - Optional: `n`, `aspect_ratio`, `resolution`, `response_format`

        - Invalid values do not raise errors — they **silently fall back to the
        default**
          (e.g. `aspect_ratio: "5:7"` is treated as `1:1`)
        - `resolution: "4k"` returns 503 `model_service_unavailable` — this is
        an unsupported
          parameter tier, not a channel outage
        - `seed` is not supported; repeated calls with the same prompt are not
        reproducible
      operationId: generateGrokImagineTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GrokImagineGenerateRequest'
      responses:
        '200':
          description: Images generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid parameters, or prompt blocked by content moderation (both
            share the `invalid_request` code)
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: >-
            Unsupported parameter tier (e.g. `resolution: 4k`), or no available
            channel in the current Group
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: >-
            Model ID. The quality variant delivers higher fidelity at a higher
            price
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >-
            Prompt, English or Chinese. Describe subject, scene, style and
            lighting in detail
          example: >-
            A photorealistic red wooden boat moored on a glassy alpine lake at
            dawn, mist over the water, snow-capped peaks behind, cinematic
            photography
        'n':
          type: integer
          description: >-
            Number of images, 1-10. Values of 11 or above return 400; 0 is
            silently treated as 1
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        aspect_ratio:
          type: string
          description: >
            Output aspect ratio. Actual pixel dimensions per resolution tier:


            | Aspect ratio | `1k` | `2k` |

            |---|---|---|

            | `1:1` | 1024x1024 | 2048x2048 |

            | `16:9` | 1280x720 | 2816x1584 |

            | `9:16` | 720x1280 | 1584x2816 |

            | `4:3` | 1152x864 | 2368x1776 |

            | `3:4` | 864x1152 | 1776x2368 |


            Values outside this enum do not raise an error — they silently fall
            back to `1:1`.
          enum:
            - '1:1'
            - '16:9'
            - '9:16'
            - '4:3'
            - '3:4'
          default: '1:1'
          example: '16:9'
        resolution:
          type: string
          description: >
            Resolution tier. `1k` is roughly 0.9-1.05 megapixels and returns
            JPEG;

            `2k` is roughly 4.2-4.5 megapixels and returns PNG (5-6 MB per
            image).

            **Both tiers cost the same.**


            `4k` returns 503; other invalid values (such as `1K` or `1024x1024`)
            silently fall back to `1k`.
          enum:
            - 1k
            - 2k
          default: 1k
          example: 1k
        response_format:
          type: string
          description: >
            Response format. `url` returns a direct image link (no signed query
            params);

            `b64_json` returns a raw base64 string (**without** the `data:`
            prefix).


            Invalid values silently fall back to the default `url`.
          enum:
            - url
            - b64_json
          default: url
          example: url
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: >-
            Creation timestamp. Always 0 for this model — do not use it for
            timing
          example: 0
        data:
          type: array
          description: Array of image results, length equals the requested `n`
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  Direct image link, returned when `response_format=url`. .jpg
                  for 1K, .png for 2K
                example: >-
                  https://apac.ossforai.com/2026/08/12/1ab87d04-3637-464f-bafd-f026cac05dd3.jpg
              b64_json:
                type: string
                description: >-
                  Raw base64 image data, returned when
                  `response_format=b64_json` (no data: prefix)
        usage:
          type: object
          description: >
            **Placeholder values — do not use for billing reconciliation.**
            `prompt_tokens` is always

            `1000 x n`, regardless of actual prompt length. Use the Console
            billing records instead.
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
            output_tokens:
              type: integer
              example: 0
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key created in the APIYI Console

````