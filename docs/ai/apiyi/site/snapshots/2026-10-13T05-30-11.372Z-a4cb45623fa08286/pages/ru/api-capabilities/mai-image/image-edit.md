> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API редактирования изображений

> Справочник API редактирования изображений MAI-Image 2.6 с интерактивным Playground — загрузите 1–5 референсных изображений и инструкцию для их редактирования или объединения, поддерживается только загрузка файлов через multipart/form-data; количество референсных изображений не влияет на стоимость

<Info>
  Интерактивный Playground справа поддерживает загрузку локальных изображений. Введите свой API-ключ в поле **Authorization** (формат: `Bearer sk-xxx`), выберите один или несколько файлов `image`, заполните `prompt` и `model` и отправьте запрос.
</Info>

<Warning>
  **🔴 Этот эндпоинт принимает только загрузку файлов через `multipart/form-data`**

  Отправка JSON на `/v1/images/edits` (с `image` в виде URL, data URI или необработанного base64) возвращает 400:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **URL изображений не поддерживаются в качестве входных данных.** Если у вас есть только URL, сначала скачайте файл на свой сервер, а затем загрузите его. Для загрузки файлов не требуется хостинг изображений — достаточно просто отправить локальный файл.
</Warning>

<Tip>
  **Сценарий использования**: эта страница предназначена для редактирования с референсными изображениями, включая обработку одного изображения и объединение от 1 до 5 изображений. Для генерации только по тексту используйте [API генерации изображений по тексту](/ru/api-capabilities/mai-image/text-to-image).
</Tip>

<Info>
  **🖼️ Поддерживается от 1 до 5 референсных изображений (с 2026-10-07)**

  * **Способ**: повторяйте поле `image[]`, по одному изображению на поле. В OpenAI SDK передайте список: `client.images.edit(image=[f1, f2, ...])`. Повторение `image` также работает
  * **Порядок**: изображения нумеруются в порядке загрузки (изображение 1, изображение 2, …), поэтому в prompt можно указать «поместите лису с изображения 2 на изображение 1»
  * **Стоимость**: тарификация выполняется за запрос; **1 изображение или 5 изображений стоят одинаково**
  * **Форматы**: JPEG, PNG, WebP; GIF и другие форматы возвращают 400
  * **Более 5 изображений** возвращает 400 `at most 5 reference images are accepted for <model>`
</Info>

<Warning>
  **Не используйте нумерованные имена полей, такие как `image` + `image2`**: запрос вернет 200, но **будет использовано только первое изображение**; второе будет отброшено. `image1` + `image2` возвращает 500 `image is required`. Для нескольких изображений всегда повторяйте `image[]`.
</Warning>

<Info>
  **Те же запрещенные параметры, что и для генерации изображений по тексту**: не отправляйте `response_format`, `seed` или `negative_prompt` (400). В ответе всегда возвращается `data[0].b64_json` (PNG).
</Info>

## Примеры кода

### Python (OpenAI SDK · одно изображение)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# images.edit uses a multipart file upload under the hood; do not pass response_format
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=open("teaset.jpg", "rb"),
    prompt="Change the teapot to a deep cobalt blue glaze, keep everything else identical"
)

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (OpenAI SDK · объединение нескольких изображений)

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# Pass a list of 1-5 files; the SDK uploads each one as an image[] field
# Images are numbered in upload order (image 1, image 2, ...); same price as a single image
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=[open("teaset.jpg", "rb"), open("fox.jpg", "rb")],
    prompt="Put the fox from image 2 (keeping every detail of its look) into the scene of image 1, sitting next to the tea set; keep everything else in image 1 unchanged"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python (requests · одно изображение)

```python theme={null}
import base64
import os
import requests

# Pass the file via files=; requests sets multipart/form-data and the boundary for you
# Do not use json=, and do not set Content-Type by hand
with open("teaset.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        data={
            "model": "MAI-Image-2.6",
            "prompt": "Change the teapot to a deep cobalt blue glaze, keep everything else exactly the same"
        },
        files={"image": ("teaset.jpg", fp, "image/jpeg")},
        timeout=180
    )
response.raise_for_status()

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

Для нескольких изображений передайте `files` в виде списка кортежей с одним `image[]` на каждое изображение (словарь не может содержать повторяющиеся ключи):

```python theme={null}
files = [
    ("image[]", ("teaset.jpg", open("teaset.jpg", "rb"), "image/jpeg")),
    ("image[]", ("fox.jpg", open("fox.jpg", "rb"), "image/jpeg")),
]
```

### cURL

```bash theme={null}
# Single-image edit: -F means multipart/form-data, @ uploads a local file
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=Change the teapot to a deep cobalt blue glaze, keep everything else identical" \
  -F "image=@teaset.jpg" \
  | python3 -c "import sys,json,base64; open('edited.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

```bash theme={null}
# Edit and change the canvas to 1536×1024 (a different aspect ratio recomposes the image)
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6" \
  -F "prompt=Turn this tea set into a lifestyle scene on a wooden table, natural light, photorealistic" \
  -F "width=1536" \
  -F "height=1024" \
  -F "image=@teaset.jpg"
```

```bash theme={null}
# Multi-image fusion: repeat the image[] field, 1-5 images, numbered in upload order
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=Put the fox from image 2 (keeping every detail of its look) into the scene of image 1, sitting next to the tea set; keep everything else in image 1 unchanged" \
  -F "image[]=@teaset.jpg" \
  -F "image[]=@fox.jpg" \
  | python3 -c "import sys,json,base64; open('fused.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js (fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'MAI-Image-2.6-Flash');
form.append('prompt', 'Replace the background with a snowy pine forest at night, keep the person unchanged');
form.append('image', new Blob([fs.readFileSync('./photo.jpg')]), 'photo.jpg');
// Multi-image fusion: call form.append('image[]', ...) once per image instead, up to 5

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // Do not set Content-Type by hand; FormData adds the boundary
    headers: { 'Authorization': `Bearer ${process.env.APIYI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('edited.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

## Справочник параметров

| Параметр | Тип | Обязательный | По умолчанию | Описание |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6` (\$0.12/изображение) или `MAI-Image-2.6-Flash` (\$0.06/изображение), **чувствительно к регистру** |
| `prompt` | string | ✅ | — | Инструкция по редактированию. Укажите, что нужно изменить и что всё остальное должно остаться без изменений |
| `image` / `image[]` | file | ✅ | — | Файлы референсных изображений, **1–5**. Используйте `image` для одного изображения; для нескольких повторите поле `image[]`, нумеруя изображения как 1…N в порядке загрузки. JPEG / PNG / WebP; количество не влияет на цену |
| `width` / `height` | integer | ❌ | Наследует соотношение оригинала | Размер на выходе, те же правила, что и для text-to-image; другое соотношение сторон **меняет композицию** изображения |
| `n` | integer | ❌ | `1` | Количество изображений. **Работает на этом эндпоинте**, тарифицируется за изображение |
| ~~`mask`~~ | — | — | — | **Не поддерживается**; возвращает 400 `<model> does not support mask edits` |
| ~~`response_format`~~ / ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **Возвращают 400** |

<Info>
  **Размер на выходе, если параметр опущен**: размер на выходе наследует соотношение сторон оригинала с округлением до чисел, кратных 16, например, ввод 1344×756 дает 1360×768; при наличии нескольких изображений соотношение сторон задает **изображение 1**. Для локальных правок, где требуется сохранить композицию, не передавайте `width` / `height`.
</Info>

## Результаты редактирования и составление prompt

Эндпоинт редактирования **сохраняет композицию, цвета и детали оригинала** и изменяет только то, что запрошено в prompt:

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="Пример редактирования MAI-Image-2.6-Flash: цвет чайника изменен с кремового на кобальтово-синий, все остальное осталось без изменений" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

| Prompt | Результат |
| - | - |
| ✅ `Change the teapot to a deep cobalt blue glaze, keep everything else exactly the same` | Изменяется только цвет чайника; надписи и другие объекты остаются попиксельно идентичными |
| ✅ `Turn this photo into a watercolor painting, keep the composition` | Стиль перерисован, композиция сохранена |
| ⚠️ `Make it look better` | Слишком расплывчато; объем изменений непредсказуем |

<Tip>
  **Явное указание «keep everything else the same»** — наиболее эффективная техника при работе с этой моделью, позволяющая максимально сохранить оригинал.
</Tip>

### Объединение нескольких изображений

Изображение 1 служит основой, а объекты из других референсных изображений размещаются на нем в соответствии с описанием в prompt. В приведенном ниже примере в одном запросе отправляются 5 изображений (чайный сервиз + лиса + резиновая уточка + будильник + кактус) с prompt, где требуется разместить лису из изображения 2, желтую резиновую уточку из изображения 3, красный винтажный будильник из изображения 4 и кактус в горшке из изображения 5 на чайный столик из изображения 1, сохранив внешний вид каждого объекта и оставив остальную часть изображения 1 без изменений:

<Frame>
  <img src="https://mintcdn.com/apiyillc/M34PNfQX341lt5W7/images/mai-image-multi-ref-5.jpg?fit=max&auto=format&n=M34PNfQX341lt5W7&q=85&s=0c18a285c65fa48646505b109e3600c7" alt="Пример объединения нескольких изображений MAI-Image-2.6-Flash: на входе 5 референсных изображений, все четыре объекта помещены на изображение с чайным сервизом, остальная часть оставлена без изменений" width="1200" height="1229" data-path="images/mai-image-multi-ref-5.jpg" />
</Frame>

| Prompt | Результат |
| - | - |
| ✅ `Put the fox from image 2 into the scene of image 1, keep everything else in image 1 unchanged` | Указывайте изображения как image N в порядке загрузки; это наиболее надежная формулировка |
| ✅ Назовите объект на каждом изображении: `the yellow rubber duck from image 3, the red alarm clock from image 4` | При большом количестве изображений указание названия каждого объекта гарантирует, что ни один из них не будет пропущен |
| ⚠️ `Combine these images into one` | Базовое изображение и объект не названы, поэтому композиция непредсказуема |

## Формат ответа

```json theme={null}
{
  "created": 1791000788,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zU..."
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "input_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **Поля ответа**

  * `b64_json` — это **чистый base64 без префикса `data:`**, который декодируется в PNG.
  * При `n > 1` массив `data` содержит несколько элементов; не считывайте только `data[0]`.
  * `url` и `revised_prompt` не возвращаются.
</Warning>

<Info>
  **Не сверяйте тарификацию по `usage`**: здесь содержатся фиктивные значения (`prompt_tokens` всегда равно 1000 × количество изображений). Редактирование **стоит столько же**, сколько генерация из текста в изображение, тарифицируется за изображение, при этом **количество референсных изображений не влияет на цену**; определяющим является счет в консоли APIYI.
</Info>


## OpenAPI

````yaml api-reference/mai-image-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: MAI-Image 2.6 Image Editing API
  description: >
    Microsoft MAI-Image 2.6 image generation — image editing endpoint.


    - **The request must be `multipart/form-data` (file upload)**; JSON or image
    URLs return 400

    - **1–5 reference images**: use `image` for one; for several, repeat the
    `image[]` field (pass a list with the OpenAI SDK), numbered image 1…N in
    upload order. **Do not use numbered field names such as `image2`** (the
    second image is dropped)

    - No mask support; do not send `response_format` / `seed` /
    `negative_prompt`

    - Flat per-image pricing, same as text-to-image, regardless of the number of
    reference images; `n` works on this endpoint and is billed per image


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit reference images (1–5)'
      description: >
        Edit or fuse 1–5 uploaded reference images from a text instruction with
        MAI-Image 2.6.


        - **Must use `multipart/form-data`**. Sending `application/json` returns
          400: `request Content-Type isn't multipart/form-data`
        - **Multi-image fusion**: repeat the `image[]` field, up to 5 images
        (more returns 400); `image` + `image2` uses only the first image; a
        `mask` field returns 400

        - Reference images must be JPEG / PNG / WebP

        - Without `width` / `height` the output follows the original's ratio; a
        different aspect ratio recomposes the image
      operationId: editMaiImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/MaiImageEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Not multipart/form-data, more than 5 or unsupported-format reference
            images, a mask field, invalid parameters, or blocked by moderation
        '401':
          description: Unauthorized - invalid API key
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: >-
            No image file field in the request, or numbered field names such as
            `image1` + `image2` (`image is required`)
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model ID (case-sensitive)
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: >-
            Edit instruction. State what to change and that everything else
            stays the same
          example: >-
            Change the teapot to a deep cobalt blue glaze, keep everything else
            identical
        image:
          type: array
          items:
            type: string
            format: binary
          minItems: 1
          maxItems: 5
          description: >-
            Reference image files, 1–5, numbered image 1…N in upload order. png
            / jpg / webp. In code, repeat the `image[]` field for several images
        width:
          type: integer
          description: >-
            Optional output width. Same rules as text-to-image: each side ≥ 768,
            width × height ≤ 2,359,296, sent together with `height`
          minimum: 768
        height:
          type: integer
          description: Optional output height, same rules as `width`
          minimum: 768
        'n':
          type: integer
          description: Number of images. Works on this endpoint, billed per image
          minimum: 1
          default: 1
          example: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Creation timestamp
          example: 1791000788
        data:
          type: array
          description: Image results; length equals `n`
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: 'Plain base64 image data (PNG, no data: prefix)'
        usage:
          type: object
          description: >-
            **Placeholder values, not for billing reconciliation.**
            `prompt_tokens` is always `1000 × images`
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.