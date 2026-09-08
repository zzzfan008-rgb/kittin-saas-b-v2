> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для генерации изображений по тексту

> Справочник API для text-to-image gpt-image-2-all и интерактивная песочница — генерируйте изображения по текстовым prompt, $0.03/image

<Info>
  Интерактивная песочница справа поддерживает прямое онлайн-тестирование. Введите свой API Key в поле **Authorization** (формат: `Bearer sk-xxx`), введите prompt и нажмите отправку.
</Info>

<Tip>
  **Область применения**: эта страница предназначена для **генерации изображений по тексту**. Просто введите prompt — загрузка изображения не требуется. Чтобы редактировать или объединять существующие изображения, используйте [эндпоинт редактирования изображений](/ru/api-capabilities/gpt-image-2-all/image-edit).
</Tip>

<Warning>
  **🖥️ Ограничение песочницы в браузере (режим b64\_json по умолчанию)**

  Этот эндпоинт **по умолчанию использует `response_format: "b64_json"`**, поэтому ответ содержит base64-строку размером в несколько МБ, и браузерная песочница может показать `请求时发生错误: unable to complete request` — **запрос на самом деле выполнен успешно**; браузер просто не может отрисовать такую длинную base64-строку.

  **Рекомендуемый порядок работы**:

  * Хотите просто посмотреть изображение в Playground? **Укажите `"response_format": "url"` явно** — в ответе будет одна ссылка R2, и все отобразится корректно.
  * Нужен base64? **Скопируйте кодовый пример ниже и запустите его локально** — код автоматически декодирует изображение и сохранит его в файл.
</Warning>

<Info>
  Все API изображений работают **синхронно** — task ID для опроса отсутствует, и если ваш клиент отключится, результат будет потерян, хотя запрос все равно будет тарифицирован. Задайте этому модели достаточно большой timeout; см. [Основы Image API и лучшие практики](/ru/api-capabilities/image-api-best-practices).
</Info>

<Warning>
  **⚠️ Поддержка параметров**

  * **`size`**: **поле не влияет на результат** — отправка `auto` или любого конкретного значения не вызывает ошибку, но значение **молча игнорируется** сервером. Размеры полностью задаются prompt:
    * В prompt указаны размер или соотношение сторон (например, «Landscape 16:9») → модель следует prompt
    * В prompt нет указаний на размер → один и тот же prompt дает **разные размеры** в разных вызовах, как будто вы «тянете разные карты» — это полезно для поиска нескольких вариантов композиции
    * Для строгой фиксации размера используйте [`gpt-image-2-vip`](/ru/api-capabilities/gpt-image-2-vip/text-to-image) (поддерживает `auto` + 30 явных размеров)
  * **`n` / `quality` / `aspect_ratio`**: ❌ отклоняется. Отправка этих параметров может вызвать ошибки проверки параметров.

  Указывайте размер и соотношение сторон прямо в `prompt`, например:

  * `Landscape 16:9 cinematic, old lighthouse by the sea at dusk`
  * `Portrait 9:16 phone wallpaper, cyberpunk city rainy night`
  * `1024×1024 square logo, minimalist cat line art`

  **Размещайте описание размера в начале prompt** для лучшего соответствия.
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
        "model": "gpt-image-2-all",
        "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset, photorealistic",
        "response_format": "url"
    },
    timeout=300  # conservative — absorbs tail latency + image download time
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**Режим b64\_json (возвращает данные изображения в base64)**:

```python theme={null}
import base64
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-all",
        "prompt": "1024x1024 square logo, minimalist cat line art",
        "response_format": "b64_json"
    },
    timeout=300  # conservative — absorbs tail latency + image download time
).json()

# Verified 2026-07: b64_json is raw base64 (no data: prefix); earlier versions included the prefix — a check is safest
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2-all",
    "prompt": "Landscape 16:9 cinematic, old lighthouse at sunset",
    "response_format": "url"
  }'
```

### Node.js

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import { writeFile } from "node:fs/promises";

const API_KEY = "sk-your-api-key";

// Image endpoints mean long silences plus MB-scale bodies, while undici's default
// connect timeout is only 10s and is NOT governed by AbortSignal.timeout below
// (different layers) — widen all three explicitly
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2-all",
      prompt: "1024x1024 square logo, minimalist cat line art",
      response_format: "b64_json"
    })
  }
);

const data = await response.json();
// Verified raw base64 (no data: prefix); earlier versions included one, so check first
let b64 = data.data[0].b64_json;
if (b64.startsWith("data:")) b64 = b64.slice(b64.indexOf(",") + 1);
await writeFile("output.png", Buffer.from(b64, "base64"));
```

<Tip>
  Импорт `undici` выше нужно устанавливать отдельно (`npm i undici`) — он обеспечивает встроенный `fetch`, но не доступен под этим именем модуля, а установленная вами копия по-прежнему обращается к встроенному `fetch` через `setGlobalDispatcher`.

  `maxRetries`, `connectTimeout` и общий таймаут запроса находятся на разных уровнях, и настройка не того параметра — самая распространенная ловушка на стороне Node. При сбросах соединения, `UND_ERR_CONNECT_TIMEOUT` или обрезанных крупных ответах за прокси см. [Устранение обрывов соединения с Image API](/ru/api-capabilities/image-connection-drops).
</Tip>

### JavaScript в браузере (Fetch)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2-all',
        prompt: 'Portrait 9:16 phone wallpaper, cyberpunk city rainy night',
        response_format: 'b64_json'
    })
});
const { data } = await resp.json();
let b64 = data[0].b64_json;
if (!b64.startsWith('data:')) b64 = `data:image/png;base64,${b64}`;
document.getElementById('result').src = b64;
```

## Краткий справочник параметров

| Параметр          | Тип    | Обязательно | Описание                                                                                                                                                                                  |
| ----------------- | ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string | Да          | Фиксированное значение: `gpt-image-2-all`                                                                                                                                                 |
| `prompt`          | string | Да          | Промпт. Укажите здесь размер/соотношение сторон/стиль                                                                                                                                     |
| `size`            | string | Нет         | Поддерживается только `auto` (один и тот же prompt дает разные размеры). Для строгой фиксации размера используйте [`gpt-image-2-vip`](/ru/api-capabilities/gpt-image-2-vip/text-to-image) |
| `response_format` | string | Нет         | `b64_json` (по умолчанию, необработанный base64) или `url` (возвращает ссылку R2 CDN); всегда передавайте явно                                                                            |

<Tip>
  Подробные ограничения параметров и допустимые значения показаны в правой панели Playground. Поле `response_format` поддерживает выбор из выпадающего списка.
</Tip>

## Формат ответа

**`data[0]` возвращает либо `url`, либо `b64_json` — никогда оба** (зависит от `response_format`). Этот эндпоинт **по умолчанию использует `b64_json`**.

**`b64_json` режим** (по умолчанию):

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

**`url` режим** (требует явного `"response_format": "url"`, глобально ускорен через R2 CDN):

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
  **Примечание о совместимости**: проверено в июле 2026 — поле `b64_json` представляет собой **raw base64 без префикса `data:`**; декодируйте его, чтобы записать файл, или добавьте префикс вручную перед рендерингом. **В более ранних версиях префикс присутствовал**, поэтому всегда сначала выполняйте проверку `startsWith('data:')`, чтобы обработать оба варианта.
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-generate-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-all Text-to-Image API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` —
    text-to-image endpoint.


    - Per-call billing, $0.03/image

    - ~30–60s generation time, supports Chinese prompts

    - Describe size/ratio/style in the `prompt`. **The `size` field has no
    effect** — sending `size=auto` or any concrete value does not error, but the
    value is silently ignored; the prompt is the sole driver of dimensions, and
    the same prompt yields varied dimensions across calls (good for "drawing
    multiple variants"). `n` / `quality` are not supported either. For strict
    size locking, use `gpt-image-2-vip`.

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
      summary: 'Text-to-Image: generate an image from a text prompt'
      description: >
        Generate images with `gpt-image-2-all` from a text prompt.


        - Only `model` and `prompt` are required

        - Size/ratio goes directly in the prompt (e.g., "Landscape 16:9
        cinematic")

        - For editing or multi-image fusion, use the [Image Editing
        endpoint](/en/api-capabilities/gpt-image-2-all/image-edit)
      operationId: generateGptImage2AllTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2-all
              prompt: Landscape 16:9 cinematic, old lighthouse at sunset
              response_format: b64_json
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
          description: Model name, fixed to gpt-image-2-all
          enum:
            - gpt-image-2-all
          default: gpt-image-2-all
        prompt:
          type: string
          description: >-
            Prompt. Include size/ratio/style here, e.g., Landscape 16:9
            cinematic, old lighthouse at sunset
          example: Landscape 16:9 cinematic, old lighthouse at sunset
        response_format:
          type: string
          description: >-
            Response format. b64_json returns a base64 string already prefixed
            with a data URL header (default); url returns an R2 CDN link
          enum:
            - b64_json
            - url
          default: b64_json
    ImageResponse:
      type: object
      description: >
        Image generation response. `data[0]` returns **either `url` or
        `b64_json`, never both** (depends on `response_format`; this endpoint
        defaults to `b64_json`).
      properties:
        data:
          type: array
          description: Result array (this model returns 1 image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN accelerated link (returned when response_format=url)
              b64_json:
                type: string
                description: >-
                  Base64-encoded data URL (returned when
                  response_format=b64_json; already includes the
                  data:image/png;base64, prefix)
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