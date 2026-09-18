> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник по API редактирования изображений

> Справочник по API редактирования изображений gpt-image-2-all и интерактивная песочница — загружайте эталонные изображения + инструкции для редактирования одного изображения или слияния нескольких изображений

<Info>
  Интерактивный Playground справа поддерживает прямую локальную загрузку файлов. Введите ваш API Key в поле **Authorization** (формат: `Bearer sk-xxx`), выберите изображения, заполните `prompt` и `model`, затем нажмите send.
</Info>

<Tip>
  **Область применения**: Эта страница предназначена для **редактирования или объединения одного или нескольких опорных изображений**. Запросы используют `multipart/form-data`. Для чистой генерации изображений по тексту используйте [эндпоинт Text-to-Image](/ru/api-capabilities/gpt-image-2-all/text-to-image).
</Tip>

<Warning>
  **🖥️ Ограничение браузерного Playground (режим по умолчанию b64\_json)**

  Этот эндпоинт **по умолчанию использует `response_format: "b64_json"`**, поэтому ответ содержит base64-строку размером в несколько МБ, и браузерный Playground может показывать `请求时发生错误: unable to complete request` — **запрос на самом деле завершился успешно**; браузер просто не может отрисовать такую длинную base64-строку.

  **Рекомендуемый рабочий процесс**:

  * Нужно только посмотреть изображение в Playground? **Явно передайте `"response_format": "url"`** — ответом будет одна ссылка R2, и она отобразится без проблем.
  * Нужны base64 или загрузка больших опорных изображений? **Скопируйте кодовый пример ниже и запустите его локально** — код автоматически обрабатывает загрузку и декодирование.
</Warning>

<Warning>
  **📎 Порядок нескольких изображений важен**

  Поле `image` можно повторять для загрузки нескольких опорных изображений. **Порядок определяет, как будут разрешаться «image1/image2/image3» в prompt.** Мы рекомендуем ссылаться на них явно, например:

  > Поместите человека из image1 в сцену image2, используя художественный стиль image3

  Рекомендуется **≤ 10MB на изображение**, форматы `png` / `jpg` / `webp`. Слишком большие изображения могут упереться в лимиты шлюза.
</Warning>

<Tip>
  **🎯 Правки с сохранением формы**: Соотношение сторон результата этого эндпоинта **следует тому опорному изображению, которое prompt указывает как цель редактирования** — **не обязательно первому** в сценариях с несколькими изображениями.

  Например, при prompt «**измените image2**, измените одежду и шляпу image2, чтобы они соответствовали image1», если image2 имеет формат 1:1, выход тоже будет 1:1 (даже если image1 — пейзаж 16:9).

  Полезно для замены одежды, добавления аксессуаров, ретуши и других правок с сохранением формы. **Поле `size` не влияет на эту модель** (передача любого значения будет молча проигнорирована — для жесткой фиксации размера используйте [`gpt-image-2-vip`](/ru/api-capabilities/gpt-image-2-vip/image-edit)). Если prompt не выбирает цель, модель решает сама.
</Tip>

## Примеры кода

### Python

**Редактирование одного изображения**:

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

with open("photo.png", "rb") as f:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "Change the background to a seaside sunset",
            "response_format": "url"
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # conservative — absorbs tail latency + image upload/download time
    ).json()

print(response["data"][0]["url"])
```

**Объединение нескольких изображений**:

```python theme={null}
import requests

with open("ref1.png", "rb") as f1, \
     open("ref2.png", "rb") as f2, \
     open("ref3.png", "rb") as f3:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": "Bearer sk-your-api-key"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "Put the person from image1 into the scene of image2, using the art style of image3",
            "response_format": "b64_json"
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300  # conservative — absorbs tail latency + image upload/download time
    ).json()

# Verified July 2026: b64_json is raw base64 (no data: prefix); earlier versions
# included the prefix, so a defensive check is safest
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

**Редактирование одного изображения**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=Change the background to a seaside sunset" \
  -F "response_format=url" \
  -F "image=@./photo.png"
```

**Объединение нескольких изображений**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=Put the person from image1 into the scene of image2, using the art style of image3" \
  -F "response_format=b64_json" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js (встроенные fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';
import { Agent, setGlobalDispatcher } from 'undici';

// Editing uploads a reference image and waits on an MB-scale body, while undici's
// default connect timeout is only 10s and is NOT governed by AbortSignal.timeout
// below (different layers) — widen all three explicitly
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', 'Change the background to outer space');
form.append('response_format', 'url');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),   // total timeout — a different layer
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

<Tip>
  Импорт `undici` выше необходимо устанавливать отдельно (`npm i undici`) — он обеспечивает работу встроенного `fetch`, но не предоставляется под этим именем модуля, а установленная вами копия по-прежнему обращается к встроенному `fetch` через `setGlobalDispatcher`.

  `maxRetries`, `connectTimeout` и общий тайм-аут запроса относятся к разным уровням, и настройка неправильного параметра — наиболее распространённая проблема на стороне Node.js. При сбросах соединения, `UND_ERR_CONNECT_TIMEOUT` или усечённых больших ответах за прокси-сервером см. раздел [Устранение разрывов соединения с Image API](/ru/api-capabilities/image-connection-drops).
</Tip>

### JavaScript в браузере (объекты File)

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', 'Fuse these images into one poster');
form.append('response_format', 'url');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## Краткая справка по параметрам

| Поле              | Тип   | Обязательно | Описание                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`           | текст | Да          | `gpt-image-2.5-all` или `gpt-image-2-all` (одинаковые цена и поведение)                                                                                                                                                                                                                                                                                                                                      |
| `prompt`          | текст | Да          | Инструкция на естественном языке для редактирования/объединения                                                                                                                                                                                                                                                                                                                                              |
| `image`           | файл  | Да          | Эталонное изображение; можно повторять                                                                                                                                                                                                                                                                                                                                                                       |
| `size`            | текст | Нет         | **Поле не влияет на результат; любое переданное значение будет молча проигнорировано.** Соотношение сторон результата **соответствует тому эталонному изображению, которое промпт указывает в качестве цели редактирования** (не обязательно первому в сценариях с несколькими изображениями). Для строгой фиксации размера используйте [`gpt-image-2-vip`](/ru/api-capabilities/gpt-image-2-vip/image-edit) |
| `response_format` | текст | Нет         | `b64_json` (по умолчанию) или `url`                                                                                                                                                                                                                                                                                                                                                                          |

<Tip>
  **Многошаговая итерация**: передайте предыдущее выходное изображение обратно в качестве входных данных `image` с новыми инструкциями, чтобы итеративно дорабатывать результат.
</Tip>

## Формат ответа

Как и у эндпоинта text-to-image: **`data[0]` возвращает либо `url`, либо `b64_json` — никогда оба** (зависит от `response_format`). Этот эндпоинт **по умолчанию использует `b64_json`**.

**`b64_json` режим** (по умолчанию):

```json theme={null}
{
  "data": [
    {
      "b64_json": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
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

**`url` режим** (требует явного `"response_format": "url"`):

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
  Проверено в июле 2026: поле `b64_json` — это **необработанный base64 без префикса `data:`** — декодируйте его или добавьте префикс вручную перед отображением. **В более ранних версиях префикс действительно был включен**, поэтому всегда сначала проверяйте `startsWith('data:')`, чтобы обработать оба варианта.
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-all Image Editing API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-all` — image
    editing endpoint.


    - Supports single-image editing and multi-image fusion (repeat the `image`
    field for multiple uploads; order is preserved)

    - Request format is `multipart/form-data`

    - Reference upload order in prompts as "image1/image2/image3"

    - **The `size` field has no effect** (sending any value is silently ignored,
    no error). The output aspect ratio **follows whichever reference image the
    prompt names as the edit target** — not necessarily the first one in
    multi-image scenarios. For example, with the prompt "modify image2", the
    output ratio matches image2; if the prompt doesn't disambiguate, the model
    decides on its own. For strict size locking, use `gpt-image-2-vip`.

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
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit or fuse reference images with instructions'
      description: >
        Use `gpt-image-2-all` to edit or fuse input images based on a text
        instruction.


        - Provide at least one reference image via the `image` field

        - For multiple reference images, **repeat the same `image` field** —
        e.g., `-F image=@a.png -F image=@b.png` (upload order maps to "image1 /
        image2 / ..." in the prompt)

        - Recommended ≤ 10MB per image, formats png/jpg/webp

        - For pure text-to-image generation, use the [Text-to-Image
        endpoint](/en/api-capabilities/gpt-image-2-all/text-to-image)
      operationId: editGptImage2AllImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: >-
            Model name: gpt-image-2.5-all or gpt-image-2-all (same ChatGPT web
            line, same price and behavior)
          enum:
            - gpt-image-2.5-all
            - gpt-image-2-all
          default: gpt-image-2.5-all
        prompt:
          type: string
          description: >-
            Edit/fusion instruction. For multi-image fusion, reference upload
            order as image1/image2/image3
          example: >-
            Put the person from image1 into the scene of image2, using the art
            style of image3
        image:
          type: array
          description: >-
            Reference images. **For a single image, send the field once; for
            multiple images, repeat the same `image` field** (e.g., `-F
            image=@a.png -F image=@b.png`) — upload order maps to image1 /
            image2 / ... in the prompt. Recommended ≤ 10MB each, formats png /
            jpg / webp.
          items:
            type: string
            format: binary
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
        Image editing response. `data[0]` returns **either `url` or `b64_json`,
        never both** (depends on `response_format`; this endpoint defaults to
        `b64_json`).
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