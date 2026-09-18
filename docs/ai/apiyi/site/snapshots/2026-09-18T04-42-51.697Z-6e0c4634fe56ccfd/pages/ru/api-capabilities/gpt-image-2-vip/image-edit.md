> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API редактирования изображений

> Справочник API редактирования изображений gpt-image-2-vip и интерактивная песочница — загружайте опорные изображения + инструкции для редактирования одного изображения или слияния нескольких изображений. Используйте size, чтобы зафиксировать размеры выхода.

<Info>
  Интерактивный Playground справа поддерживает прямую загрузку локальных изображений. Введите ваш API Key в поле **Authorization** (формат: `Bearer sk-xxx`), выберите изображение, задайте `prompt` / `model` / `size`, затем нажмите отправить.
</Info>

<Tip>
  **Область применения**: эта страница предназначена для **редактирования или объединения одного или нескольких референсных изображений**. Запрос использует `multipart/form-data`. Для чистой генерации изображений по тексту см. [эндпоинт Text-to-Image](/ru/api-capabilities/gpt-image-2-vip/text-to-image).

  **Отличие от `gpt-image-2-all`**: идентичная структура вызова, только с одним дополнительным полем `size`. Если вам не нужно фиксировать размеры и нужен максимально быстрый результат, используйте [`gpt-image-2-all`](/ru/api-capabilities/gpt-image-2-all/image-edit).
</Tip>

<Warning>
  **🖥️ Ограничение браузерного Playground**

  Этот endpoint **по умолчанию возвращает строку base64 (`b64_json`)**, которая может занимать несколько MB, поэтому браузерный Playground может показывать `请求时发生错误: unable to complete request` — **запрос на самом деле успешно выполнен**; браузер просто не может отобразить такую длинную строку base64.

  **Рекомендуемый рабочий процесс**: если вам нужен base64 или требуется загрузить очень большие референсные изображения, **скопируйте приведенный ниже пример кода и запустите его локально**.
</Warning>

<Warning>
  **📎 Порядок объединения нескольких изображений важен**

  Поле `image` принимает несколько референсных изображений. **Порядок является основой для ссылок "image1 / image2 / image3" в вашем prompt.** Явно указывайте их в prompt, например:

  > Поместите человека из image1 в сцену image2, в стиле живописи image3

  Рекомендуется **≤ 10 MB на изображение**, форматы `png` / `jpg` / `webp`. Слишком большие изображения могут упереться в лимиты шлюза.
</Warning>

<Tip>
  **🎯 Редактирование с сохранением формы**: когда вы передаете `size=auto` (или не указываете `size`), output **наследует соотношение сторон того референсного изображения, которое prompt называет целью редактирования** — **не обязательно первого** в сценариях с несколькими изображениями.

  Например, при prompt "**измените image2**, подберите одежду и шляпу image2 под image1", если image2 имеет формат 1:1, output тоже будет 1:1 (даже если image1 — пейзажный формат 16:9).

  Это полезно для замены одежды, добавления аксессуаров, ретуши и других редактирований с сохранением формы. Если prompt не указывает цель, модель определит ее сама; передавайте явный 30-бакетный `size` только тогда, когда вам нужно изменить соотношение сторон.
</Tip>

<Warning>
  **⚠️ Важные замечания по параметрам**

  * **`size`**: **для редактирования предпочтительно `auto` (или не указывать поле)** — модель сохраняет соотношение сторон **того референсного изображения, которое prompt называет целью редактирования**, а не обязательно первого в сценариях с несколькими изображениями. Например, при prompt "измените image2, подберите одежду image2 под image1" соотношение сторон output совпадает с image2; если prompt не снимает неоднозначность, модель решит сама. Чтобы принудительно задать другой размер, выберите один из 30 поддерживаемых размеров; используйте строчные ASCII `x`, например `2048x1360`, `3840x2160`. Полная таблица: [страница обзора](/ru/api-capabilities/gpt-image-2-vip/overview#supported-sizes-full-30-size-table).
  * **`quality`**: ❌ отклонено — **не передавайте**.
  * **`n`**: ❌ отклонено — одно изображение на вызов.
  * **`response_format`**: если не указывать, возвращается base64 (raw, без префикса, проверено в июле 2026); передавайте `"url"` для получения URL изображения. Компаниям, которые **зависят от output в виде URL**, следует переключить свой token на группу `image2_OSS`, чтобы получать детерминированный output URL без fallback на base64.
</Warning>

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
            "model": "gpt-image-2.5-vip",
            "prompt": "Replace the background with a sunset beach",
            "size": "2048x1360"          # 3:2 2K Recommended
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # conservative; absorbs upload + long-tail
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
            "model": "gpt-image-2.5-vip",
            "prompt": "Place the person from image1 into the scene of image2, in the style of image3",
            "size": "2048x2048"          # 1:1 2K Recommended
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300
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
  -F "model=gpt-image-2.5-vip" \
  -F "prompt=Replace the background with a sunset beach" \
  -F "size=2048x1360" \
  -F "image=@./photo.png"
```

**Объединение нескольких изображений**:

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-vip" \
  -F "prompt=Place the person from image1 into the scene of image2, in the style of image3" \
  -F "size=2048x2048" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js (нативные fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2.5-vip');
form.append('prompt', 'Replace the background with outer space');
form.append('size', '2048x1360');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

### Браузерный JavaScript (объекты File)

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2.5-vip');
form.append('prompt', 'Fuse these images into a single poster');
form.append('size', '2048x2048');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## Параметры

| Поле     | Тип   | Обязательно | Описание                                                                                                                                                                                                                       |
| -------- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`  | текст | Да          | `gpt-image-2.5-vip` (= `gpt-image-2.5-sunburst-vip`) / `gpt-image-2.5-flare-vip` / `gpt-image-2-vip` предыдущего поколения, одинаковые цена и формат вызова; `mask` — регенерация всего изображения во всех трёх случаях       |
| `prompt` | текст | Да          | Описание редактирования/объединения на естественном языке                                                                                                                                                                      |
| `image`  | файл  | Да          | Эталонное изображение; можно повторять (поле-массив)                                                                                                                                                                           |
| `size`   | текст | Нет         | Размер результата: `auto` (по умолчанию — **соответствует тому эталонному изображению, которое промпт называет целью редактирования**, а не обязательно первому) или один из 30 размеров; формат `WIDTHxHEIGHT` (строчные `x`) |

<Tip>
  **Итерация в несколько ходов**: передавайте предыдущий результат в качестве `image` следующего вызова вместе с новой инструкцией редактирования для поэтапного улучшения. Для каждого раунда можно указать собственный `size`.
</Tip>

## Формат ответа

Как и в endpoint text-to-image: **по умолчанию возвращает base64** (`data[0].b64_json`, сырой base64 без префикса, проверено в июле 2026). Для **URL изображения** явно передайте `response_format: "url"`; компаниям, которым **нужен вывод URL**, следует перевести свой token в **группу `image2_OSS`** для детерминированного вывода URL без fallback на base64. `data[0]` возвращает либо `url`, либо `b64_json` — никогда не оба варианта.

**Режим `b64_json`** (по умолчанию):

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

**Режим `url`** (явно передайте `response_format: "url"`; используйте группу `image2_OSS`, если вам нужны URL):

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
  Проверено в июле 2026: поле `b64_json` — это **сырой base64 без префикса `data:`** — декодируйте его или добавьте префикс самостоятельно перед рендерингом. **В более ранних версиях префикс действительно присутствовал**, поэтому сначала всегда проверяйте `startsWith('data:')`, чтобы обработать оба варианта.
</Warning>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Обзор модели (полная таблица размеров)" icon="sparkles" href="/ru/api-capabilities/gpt-image-2-vip/overview">
    Полная таблица 30 размеров, цены, технические характеристики
  </Card>

  <Card title="API для генерации изображений по тексту" icon="wand-sparkles" href="/ru/api-capabilities/gpt-image-2-vip/text-to-image">
    `/v1/images/generations` совместимый эндпоинт
  </Card>

  <Card title="Сопутствующая модель gpt-image-2-all" icon="copy" href="/ru/api-capabilities/gpt-image-2-all/image-edit">
    Тот же формат вызова, когда вам не нужен фиксированный размер — более быстрый вывод
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-vip Image Editing API
  description: >
    GPT image generation reverse-engineered model `gpt-image-2-vip` (Adobe line,
    Firefly) — image editing endpoint.


    - Supports single-image editing and multi-image fusion (repeat the `image`
    field for multiple uploads; order is preserved)

    - Request format is `multipart/form-data`

    - Reference upload order in prompts as "image1/image2/image3"

    - Supports 30 explicit sizes (10 ratios × 1K / 2K / 4K, flat $0.03/image
    across all tiers)

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
      summary: 'Image editing: edit or fuse reference images with locked output size'
      description: >
        Edit or fuse reference images with `gpt-image-2-vip` and lock the output
        dimension via `size`.


        - Provide at least one reference image via the `image` field

        - For multiple reference images, **repeat the same `image` field** —
        e.g., `-F image=@a.png -F image=@b.png` (upload order maps to "image1 /
        image2 / ..." in the prompt)

        - Recommended ≤ 10MB per image, formats png/jpg/webp

        - Strongly recommend passing `size` (one of the 30 sizes); `quality` is
        optional (see the field description); do not pass `n`

        - For pure text-to-image, use the [Text-to-Image
        endpoint](/en/api-capabilities/gpt-image-2-vip/text-to-image)
      operationId: editGptImage2VipImage
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
          description: >-
            Edit/fusion instruction. For multi-image flows, reference upload
            order as image1/image2/image3
          example: >-
            Place the person from image1 into the scene of image2, in the style
            of image3
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
            Output size. **For editing, prefer `auto` (or omit the field)** —
            the model preserves the aspect ratio of **whichever reference image
            the prompt names as the target of the edit** (not necessarily the
            first one in multi-image scenarios). For example, with the prompt
            "modify image2, change image2's outfit to match image1", the output
            ratio matches image2. If the prompt doesn't disambiguate, the model
            decides on its own. To force a different dimension, pick one of the
            30 supported sizes; format: `WIDTHxHEIGHT` with lowercase ASCII `x`,
            e.g., `2048x1360`, `3840x2160`. Flat $0.03/image across all tiers.
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
          example: 2048x1360
    ImageResponse:
      type: object
      description: >
        Image editing response. **Returns base64 by default**
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