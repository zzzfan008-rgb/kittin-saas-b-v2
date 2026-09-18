> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для редактирования изображений

> Справочник API для редактирования изображений Grok Imagine 2 и практическое тестирование — загрузите 1-4 эталонных изображения и инструкцию для редактирования или слияния; требуется multipart/form-data

<Warning>
  **🔒 Не открыт по умолчанию**: Grok Imagine 2 не входит в группу `Default`. Он находится в собственной **группе `Grok_imagine`**, и перед его вызовом необходимо запросить доступ (включая Playground на этой странице). Без него каждый вызов возвращает `503`.

  Политика безопасности контента этого семейства существенно отличается от других моделей на платформе, и некоторые категории не фильтруются, поэтому для ограничения рисков соответствия требованиям мы предоставляем доступ выборочно: существующие клиенты с совокупными расходами от \$1,000 могут включить его, описав свой сценарий использования службе поддержки; все остальные подают заявку через [поддержку WeCom](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec), указав сценарий использования и действующие меры модерации контента. Полный процесс: [Обзор Grok Imagine 2 — настройка группы](/ru/api-capabilities/grok-imagine-image/overview#group-setup).
</Warning>

<Info>
  Интерактивный Playground справа поддерживает загрузку локальных файлов. Введите свой API Key в **Authorization** (формат: `Bearer sk-xxx`), выберите файл `image`, заполните `prompt` и `model`, затем отправьте запрос.
</Info>

<Warning>
  **🔴 Этот эндпоинт требует загрузки файла `multipart/form-data`**

  Отправка JSON в `/v1/images/edits` **всегда возвращает 400**:

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **Это особенно важно, если вы интегрируетесь по документации xAI или исходного поставщика**: в этой документации описано тело JSON с публичным URL изображения (`{"image": {"type": "image_url", "url": "..."}}`), и такая форма **не** работает через шлюз APIYI. Вместо этого следуйте инструкциям на этой странице.

  Преимущество в том, что загрузка файла означает **отсутствие необходимости в хостинге изображений** — просто отправьте локальный файл, что проще, чем подготавливать публичный URL.

  Поле файла должно называться **`image`** или **`image[]`**; `images` / `image_file` возвращают **415**. `prompt` обязательно — его отсутствие возвращает 400.
</Warning>

<Tip>
  **Когда использовать эту страницу**: для редактирования одного референсного изображения или объединения нескольких. Для генерации только по prompt используйте [эндпоинт преобразования текста в изображение](/ru/api-capabilities/grok-imagine-image/text-to-image).
</Tip>

<Warning>
  **⚠️ Размеры результата соответствуют ПЕРВОМУ референсному изображению и не могут быть изменены**

  `resolution` и `aspect_ratio` принимаются здесь без ошибки, но **не влияют на результат** — отредактированный результат всегда соответствует **размерам первого референсного изображения** (1280x720 на входе даёт 1280x720 на выходе; 1024x1024 на входе даёт 1024x1024 на выходе).

  То же относится к объединению: изменение порядка 4 референсов переключило результат с 1280x720 на 1024x1024, **следуя новому первому изображению**.

  Чтобы изменить размер результата, **обрежьте или измените размер первого референсного изображения перед загрузкой**.
</Warning>

<Info>
  **Порядок объединения имеет значение**: `image[]` принимает **1–4** референсных изображения (измеренный предел — 4; пятое возвращает 400), и **порядок загрузки определяет, что означает «изображение 1 / изображение 2 / изображение 3» в prompt**. Укажите это явно, например: «поместите объект с изображения 1 в сцену с изображения 2, сохранив художественный стиль изображения 2».

  Проверено на 2 / 3 / 4 референсах: **каждое дополнительное изображение добавляет соответствующий объект в результат**, при этом сохраняются отличительные черты каждого — объединение действительно работает.
</Info>

## Примеры кода

### Python (OpenAI SDK, одно изображение)

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0
)

# The SDK's images.edit already performs a multipart upload — pass the file object directly
resp = client.images.edit(
    model="grok-imagine-image",
    image=open("fox.jpg", "rb"),
    prompt="Change the scarf color to bright RED. Keep everything else exactly the same.",
    n=1
)

urllib.request.urlretrieve(resp.data[0].url, "edited.jpg")
```

### Python (сырые запросы, одно изображение)

```python theme={null}
import requests
import urllib.request

API_KEY = "sk-your-api-key"

# Key point: use files= so requests sets multipart/form-data and the boundary for you.
# Never use json= — that sends application/json and the gateway rejects it with 400.
with open("fox.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},  # do NOT set Content-Type manually
        data={
            "model": "grok-imagine-image",
            "prompt": "Change the scarf to red, keep everything else exactly the same",
            "n": 1,
            "response_format": "url"
        },
        files={"image": ("fox.jpg", fp, "image/jpeg")},
        timeout=360
    ).json()

urllib.request.urlretrieve(response["data"][0]["url"], "edited.jpg")
```

### Python (объединение нескольких изображений, 1-4 файла)

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

# Repeat the image[] field for multiple references — order is "image 1 / image 2"
files = [
    ("image[]", ("character.jpg", open("character.jpg", "rb"), "image/jpeg")),
    ("image[]", ("scene.jpg", open("scene.jpg", "rb"), "image/jpeg")),
]

response = requests.post(
    "https://api.apiyi.com/v1/images/edits",
    headers={"Authorization": f"Bearer {API_KEY}"},
    data={
        "model": "grok-imagine-image",
        "prompt": "Put the character from image 1 into the scene from image 2, "
                  "keeping image 2's art style and palette",
        "response_format": "url"
    },
    files=files,
    timeout=360
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
# Single-image edit: -F means multipart/form-data, @ uploads a local file
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image" \
  -F "prompt=Change the scarf to red, keep everything else exactly the same" \
  -F "n=1" \
  -F "response_format=url" \
  -F "image=@fox.jpg"
```

```bash theme={null}
# Multi-image fusion: repeat image[], order is "image 1 / image 2"
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image-quality" \
  -F "prompt=Put the character from image 1 into the scene from image 2, keep image 2's style" \
  -F "image[]=@character.jpg" \
  -F "image[]=@scene.jpg"
```

### Node.js (нативный fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', 'Change the scarf to red, keep everything else exactly the same');
form.append('n', '1');
form.append('response_format', 'url');
// Single image uses `image`; for fusion append `image[]` repeatedly (max 3)
form.append('image', new Blob([fs.readFileSync('./fox.jpg')]), 'fox.jpg');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // Do not set Content-Type manually — let FormData supply the boundary
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form,
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();
const img = await fetch(data.data[0].url);
fs.writeFileSync('edited.jpg', Buffer.from(await img.arrayBuffer()));
```

### JavaScript в браузере

```javascript theme={null}
// ⚠️ Demo only: a front-end key is exposed — use a backend proxy in production
const fileInput = document.querySelector('#file');   // an <input type="file"> element

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', 'Replace the background with a snowy pine forest at night, keep the subject');
form.append('response_format', 'url');
form.append('image', fileInput.files[0]);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## Справочник параметров

| Parameter          | Type    | Required | Default | Description                                                                                                                           |
| ------------------ | ------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `model`            | string  | ✅        | —       | `grok-imagine-image` (\$0.02/image) or `grok-imagine-image-quality` (\$0.045/image)                                                   |
| `prompt`           | string  | ✅        | —       | Инструкция по редактированию. Укажите, что именно нужно изменить, и что всё остальное должно остаться без изменений                   |
| `image`            | file    | ✅        | —       | Файл с эталонным изображением. Для fusion повторите `image[]`, **1-4 files** (пятый возвращает 400). **Первый задаёт размеры выхода** |
| `n`                | integer | ❌        | `1`     | Выходные изображения, **1-10**, тарификация за каждое изображение, независимо от числа эталонов                                       |
| `response_format`  | string  | ❌        | `url`   | `url` возвращает прямую ссылку; `b64_json` возвращает необработанный base64 (**без** префикса `data:`)                                |
| ~~`resolution`~~   | string  | ❌        | —       | **Здесь не имеет эффекта** — результат следует входному изображению                                                                   |
| ~~`aspect_ratio`~~ | string  | ❌        | —       | **Здесь не имеет эффекта** — результат следует входному изображению                                                                   |

<Info>
  Это семейство **не поддерживает mask inpainting**. Чтобы ограничить область изменения, опишите его в prompt точно — например: «измените только шарф на красный, всё остальное оставьте точно таким же». Модель строго следует таким ограничениям.
</Info>

## Поведение редактирования и стиль prompt

Эндпоинт редактирования **сохраняет художественный стиль, композицию, палитру и идентичность объекта входного изображения**, изменяя только то, что указано в prompt. Для стабильных результатов:

| Стиль prompt                                                                         | Результат                                                                 |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| ✅ `Change the scarf to red, keep everything else exactly the same`                   | Меняется только шарф; стиль, композиция и фон сохраняются                 |
| ✅ `Add round black sunglasses to the cat, keep everything else unchanged`            | Добавляются только очки; контурный стиль и цвет фона остаются неизменными |
| ✅ `Put the character from image 1 into the scene from image 2, keep image 2's style` | Слияние, сохраняющее характеристики обоих входных изображений             |
| ⚠️ `Make it look better`                                                             | Слишком расплывчато — область изменений становится непредсказуемой        |

<Tip>
  **Явное указание «оставьте всё остальное без изменений»** — это самый эффективный приём для этой модели. Для слияния всегда используйте «изображение 1 / изображение 2», соответствующие порядку загрузки `image[]`.

  Также **ставьте самый важный объект первым**: первое изображение не только задаёт размеры результата, но и в ходе тестирования обратный порядок приводил к тому, что идентичность второстепенного объекта смешивалась с другим.
</Tip>

## Формат ответа

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000
  }
}
```

<Warning>
  **Подводные камни полей ответа**

  * Каждая запись `data[]` содержит **либо** `url` **или** `b64_json` в зависимости от `response_format` — никогда оба.
  * **`revised_prompt` не возвращается** — не предполагайте, что оно существует.
  * `b64_json` — это **необработанный base64 без префикса `data:image/...;base64,`** — декодируйте его напрямую.
  * `created` всегда `0` и не может использоваться как временная метка.
  * Размеры вывода определяются **входным изображением**, поэтому не определяйте ширину/высоту по параметрам запроса.
</Warning>

<Info>
  **`usage` не может использоваться для сверки**: `prompt_tokens` всегда `1000 x n`, это заполнитель. Редактирование стоит **столько же**, сколько text-to-image, по фиксированной ставке за изображение; используйте записи тарификации в APIYI Console для фактических списаний.
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-edit-openapi-en.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: Grok Imagine 2 Image Editing API
  description: >
    xAI Grok Imagine 2 image generation models — image editing endpoint.


    - **Requests must be `multipart/form-data` (file upload)** — sending JSON
    returns 400

    - Supports single-image editing and multi-image fusion (1-4 reference images
    via repeated `image[]`)

    - Reference fidelity is high: art style, composition, palette and subject
    identity are preserved;
      only what the prompt asks for changes
    - **Output dimensions follow the FIRST reference image**: `resolution` /
    `aspect_ratio` have no effect here

    - Flat per-request pricing, same as text-to-image


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
  /v1/images/edits:
    post:
      tags:
        - Image Editing
      summary: 'Image editing: edit a reference image or fuse several'
      description: >
        Edit uploaded reference images with a text instruction using Grok
        Imagine 2 models.


        - **Must use `multipart/form-data`.** Sending `application/json`
        (including the
          `{"image": {"type": "image_url", "url": "..."}}` form shown in upstream vendor docs)
          always returns 400 `invalid_image_request`:
          `request Content-Type isn't multipart/form-data`
        - The file field must be named `image` or `image[]`; `images` /
        `image_file` return 415

        - `prompt` is required; omitting it returns 400

        - 1-4 reference images (measured ceiling is 4; a fifth returns 400);
        with multiple images refer to them as "image 1 / image 2" in the prompt
      operationId: editGrokImagineImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/GrokImagineEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: Image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Request was not multipart/form-data, prompt missing, or content
            blocked by moderation
        '401':
          description: Unauthorized - invalid API Key
        '415':
          description: Unsupported file field name (only `image` / `image[]` are accepted)
        '429':
          description: Rate limit exceeded or insufficient balance
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: Model ID
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >
            Editing instruction. State what to change and explicitly ask for
            everything else to stay put,

            e.g. `Change the scarf color to bright RED. Keep everything else
            exactly the same.`
          example: >-
            Change the scarf color to bright RED. Keep everything else exactly
            the same.
        image:
          type: string
          format: binary
          description: >
            Reference image file. For multi-image fusion repeat the `image[]`
            field (1-4 files);

            upload order is what "image 1 / image 2 / image 3" refers to in the
            prompt, and

            **the first file also determines output dimensions**. Each added
            image contributes

            a subject in testing. Accepted formats: png / jpg / webp.
        'n':
          type: integer
          description: >-
            Number of output images, 1-10. Independent of the number of
            reference images
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        response_format:
          type: string
          description: >-
            Response format. `url` returns a direct link; `b64_json` returns raw
            base64 (no data: prefix)
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
                description: Direct image link, returned when `response_format=url`
                example: >-
                  https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg
              b64_json:
                type: string
                description: >-
                  Raw base64 image data, returned when
                  `response_format=b64_json` (no data: prefix)
        usage:
          type: object
          description: >-
            **Placeholder values — do not use for billing reconciliation.**
            `prompt_tokens` is always `1000 x n`
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
      description: API Key created in the APIYI Console

````