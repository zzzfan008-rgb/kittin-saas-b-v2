> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для редактирования изображений

> Справочник API и live Playground для редактирования изображений Seedream, многoизображенческой фузии и пакетной генерации последовательностей — тот же endpoint generations, переключение через массив изображений и параметр sequential_image_generation

<Info>
  **Один эндпоинт, несколько режимов**: у Seedream нет отдельного эндпоинта `/v1/images/edits`. Редактирование, слияние нескольких изображений и пакетная последовательность выполняются через `POST /v1/images/generations`. Playground на этой странице обращается к тому же эндпоинту, что и [Текст-в-изображение](/ru/api-capabilities/seedream-image/text-to-image) — единственное различие состоит в параметрах `image` и `sequential_image_generation` в теле запроса.
</Info>

<Tip>
  **Режимы**:

  * **Редактирование одного изображения** — `image: ["url"]` + `sequential_image_generation: "disabled"`
  * **Слияние нескольких изображений** — `image: ["url1", "url2", ...]` + `disabled`
  * **Пакетная последовательность** — `sequential_image_generation: "auto"` + `sequential_image_generation_options.max_images: N`
  * **Изображение-в-последовательность** — объединяет оба: массив `image` + `auto` + `max_images`
</Tip>

<Warning>
  **🖥️ Ограничение Browser Playground (только режим b64\_json)**

  В режиме `response_format: "url"` по умолчанию Playground работает нормально (в ответе просто временная ссылка BytePlus TOS). Если вы переключитесь на `response_format: "b64_json"`, ответ будет содержать base64-строку размером в несколько МБ, и браузерный Playground может показать `请求时发生错误: unable to complete request` — **запрос на самом деле выполнен успешно**; браузер просто не может отобразить такую длинную base64-строку.

  **Рекомендуемый рабочий процесс**:

  * Просто хотите посмотреть изображение? **Оставьте режим `url` по умолчанию** — Playground возвращает ссылку напрямую (не забудьте скачать ее в свое хранилище в течение 24 часов).
  * Нужен b64\_json? **Скопируйте пример кода ниже и запустите его локально** — код автоматически декодирует и сохранит изображение в файл.
</Warning>

<Warning>
  **⚠️ Ключевые отличия от редактирования OpenAI gpt-image-2**

  * **Нет загрузок multipart/form-data** — сначала загрузите свои изображения в OSS или на публичный хост изображений, а затем передайте URL в массиве `image`
  * **`image` — это массив URL**, а не повторяющееся поле `image[]` (в отличие от формата `multipart/form-data` OpenAI)
  * **Нет поля `mask`** — Seedream не поддерживает inpainting по маске alpha-канала; все изображение переписывается по prompt
  * **Жесткий лимит на общее количество**: входные ссылки + выходные изображения ≤ 15
</Warning>

<Warning>
  **📎 Порядок нескольких изображений имеет значение**

  Порядок URL в массиве `image` становится тем, что в prompt обозначается как «изображение 1 / изображение 2 / изображение 3». Явно указывайте порядок:

  > Замените одежду на изображении 1 на наряд с изображения 2, сохранив освещение с изображения 3.

  Лучше всего работают prompt на английском языке (модель в основном обучена на English), но китайский тоже поддерживается, если формулировка однозначна.
</Warning>

## Примеры кода

<Note>
  **О `extra_body` (важно — не подумайте, что это дополнительный уровень вложенности)**

  `image`, `sequential_image_generation` и `watermark` не являются стандартными параметрами `images.generate()` в OpenAI SDK, поэтому в Python SDK вы **обязаны** поместить их внутрь `extra_body`, чтобы передать их.

  Но `extra_body` — это всего лишь контейнер параметров SDK: его поля **разворачиваются и объединяются с верхним уровнем** тела запроса, **на том же уровне**, что и `model` и `prompt`. Фактически отправляемый JSON идентичен примеру cURL ниже (`image` находится на верхнем уровне); в запросе **нет** реальной вложенности `"extra_body": {...}`.

  Если вы не используете OpenAI SDK, а формируете JSON напрямую (requests / fetch / и т. д.), **не записывайте** `extra_body` — просто разместите `image` и остальные поля на том же уровне, что и `model`.
</Note>

### Python (OpenAI SDK · редактирование одного изображения)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="Generate a close-up image of a dog lying on lush grass.",
    size="2K",
    response_format="url",
    # Fields in extra_body are flattened to the top level of the request body
    # (same level as model) by the SDK — not an extra nesting layer
    extra_body={
        "image": ["https://your-oss.example.com/source-photo.png"],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (OpenAI SDK · объединение нескольких изображений)

```python theme={null}
resp = client.images.generate(
    model="seedream-4-5-251128",
    prompt="Replace the clothing in image 1 with the outfit from image 2, keeping the lighting style of image 3.",
    size="4K",
    response_format="url",
    extra_body={
        "image": [
            "https://your-oss.example.com/person.png",
            "https://your-oss.example.com/outfit.png",
            "https://your-oss.example.com/lighting-ref.png",
        ],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python (OpenAI SDK · пакетная последовательность)

```python theme={null}
resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt=(
        "Generate four cinematic sci-fi storyboard scenes:"
        "Scene 1 — astronaut repairing a spacecraft;"
        "Scene 2 — meteor strike in deep space;"
        "Scene 3 — emergency dodge in zero gravity;"
        "Scene 4 — astronaut returning to ship."
    ),
    size="2K",
    response_format="url",
    extra_body={
        "sequential_image_generation": "auto",
        "sequential_image_generation_options": {"max_images": 4},
        "watermark": False,
    }
)

for item in resp.data:
    print(item.url)
```

### cURL (объединение нескольких изображений)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "Replace the clothing in image 1 with the outfit from image 2.",
    "image": [
      "https://your-oss.example.com/person.png",
      "https://your-oss.example.com/outfit.png"
    ],
    "sequential_image_generation": "disabled",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js (fetch · пакетная последовательность)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'A four-panel comic about a cat astronaut: launch, space walk, alien encounter, return home.',
        size: '2K',
        sequential_image_generation: 'auto',
        sequential_image_generation_options: { max_images: 4 },
        response_format: 'url',
        watermark: false
    })
});

const { data } = await resp.json();
data.forEach((item, i) => console.log(`#${i + 1}:`, item.url));
```

<Warning>
  **Передавайте эталонные изображения в виде общедоступных URL, а не в формате base64 (особо отмечается с 2026-09-11)**

  Если элементы массива `image` являются URL, тело запроса занимает всего несколько КБ, а BytePlus **загружает ваши изображения напрямую из своего региона в Сингапуре** (проверено: IP-адрес, с которого выполняется загрузка, принадлежит BytePlus, а шлюз APIYI не участвует).
  Если элементы являются строками `data:image/...;base64,...`, несколько эталонных изображений высокого разрешения легко увеличивают размер тела до 20–30 МБ. Сначала это тело необходимо полностью загрузить на шлюз APIYI, а затем переслать в Сингапур. Если трансграничная загрузка выполняется медленно, превышается лимит провайдера на входящие запросы — 600 секунд на чтение тела запроса, — и возникает `400 Error when parsing request`.
  Весь запрос завершается с ошибкой и не переключается в режим URL, поскольку шлюз не преобразует base64 в ссылку для загрузки.

  * ✅ Разместите изображения в собственном объектном хранилище или на хостинге изображений и передавайте общедоступные URL без аутентификации, доступные через обычный GET; размер каждого изображения не должен превышать примерно 10 МБ
  * ⚠️ Если без base64 не обойтись, сначала сожмите изображения: длинная сторона — не более 2048 пикселей, перекодируйте с качеством 0.9 и ограничьте общий размер нескольких изображений 6 МБ
  * ❌ Не отправляйте тела в формате base64 размером более 20 МБ и не передавайте адреса из частных сетей или ссылки, требующие входа в систему (BytePlus возвращает `InvalidParameter: Error while downloading`, если загрузка не выполняется)
</Warning>

## Справочник параметров

| Параметр                                         | Тип             | Обязательное                 | Значение по умолчанию | Описание                                                                                                                                                                                     |
| ------------------------------------------------ | --------------- | ---------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                                          | string          | да                           | —                     | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628` (уровень Pro, \$0.12/запрос)                                                               |
| `prompt`                                         | string          | да                           | —                     | Инструкция для редактирования / fusion / sequence                                                                                                                                            |
| `image`                                          | array of string | требуется для редактирования | —                     | Справочные изображения в виде URL или base64 data URI (`data:image/jpeg;base64,...`, проверенные), **до 10** (согласно официальной документации 4.5 / 5.0-pro)                               |
| `sequential_image_generation`                    | string          | нет                          | `disabled`            | `disabled` для одиночного вывода; `auto` для пакетной последовательности. **Не принимается 5.0-pro: любое значение (включая `disabled`) возвращает 400 — полностью опустите параметр с pro** |
| `sequential_image_generation_options.max_images` | integer         | нет                          | —                     | Действует только с `auto`. Ограничено **input + output ≤ 15**. Также не принимается 5.0-pro                                                                                                  |
| `size`                                           | string          | нет                          | `2K`                  | Предустановленный уровень или точные пиксели — **поддержка уровней зависит от версии** (см. Обзор)                                                                                           |
| `response_format`                                | string          | нет                          | `url`                 | `url` / `b64_json`                                                                                                                                                                           |
| `output_format`                                  | string          | нет                          | `jpeg`                | 5.0 / 5.0-pro поддерживают `png` / `jpeg`; 4.5 / 4.0 только `jpeg`                                                                                                                           |
| `watermark`                                      | boolean         | нет                          | зависит               | Установите `false` для коммерческого использования                                                                                                                                           |
| `stream`                                         | boolean         | нет                          | `false`               | Потоковый вывод, рекомендуется для длинных prompt. **Не принимается 5.0-pro — возвращает 400**                                                                                               |

## Ограничения по количеству в режимах Multi-image и последовательности

| Сценарий                                            | Количество входных `image` | `max_images` | Фактический результат | Суммарное ограничение |
| --------------------------------------------------- | -------------------------- | ------------ | --------------------- | --------------------- |
| Редактирование одного изображения                   | 1                          | —            | 1                     | 2 ≤ 15 ✅              |
| Слияние нескольких изображений                      | 3                          | —            | 1                     | 4 ≤ 15 ✅              |
| Слияние нескольких изображений + последовательность | 3                          | 4            | 4                     | 7 ≤ 15 ✅              |
| Слияние нескольких изображений + последовательность | 10                         | 6            | 6                     | 16 > 15 ❌ отклонено   |

<Tip>
  **Итеративная доработка**: передавайте URL предыдущего результата как следующий вход с новой инструкцией по редактированию, чтобы последовательно уточнять результат. Каждый раунд тарифицируется по каждому изображению — следите за накопительной стоимостью.
</Tip>

## Формат ответа

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../scene-1.png",
      "size": "2048x2048"
    },
    {
      "url": "https://...scene-2.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 2,
    "output_tokens": 12480,
    "total_tokens": 12480
  }
}
```

<Warning>
  **⚠️ Длина массива `data` отражает фактическое количество вывода**

  * `sequential_image_generation: "disabled"` → массив из одного элемента `data`
  * `sequential_image_generation: "auto"` + `max_images: N` → обычно N элементов (иногда меньше, если prompt возвращает меньше)
  * Тарификация производится по `usage.generated_images`, **а не по `max_images`**
</Warning>

<Info>
  Запросы на редактирование тарифицируются так же, как text-to-image, — по одному выходному изображению. Входные reference image не тарифицируются отдельно.
</Info>


## OpenAPI

````yaml api-reference/seedream-image-edit-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream Image Editing / Multi-image Fusion / Batch Sequence API
  description: >
    BytePlus ModelArk Seedream image generation models — editing / multi-image
    fusion / batch sequence endpoint.


    **Important**: Seedream has no separate `/v1/images/edits` endpoint.
    Editing, multi-image fusion, and batch sequence generation all run through
    `POST /v1/images/generations`. The mode is switched via `image` and
    `sequential_image_generation` in the request body.


    - Single-image editing: `image: ["url"]` + `sequential_image_generation:
    "disabled"`

    - Multi-image fusion: `image: ["url1", "url2", ...]` + `disabled` (up to 10
    reference images)

    - Batch sequence: `sequential_image_generation: "auto"` + `max_images`

    - Hard constraint: **input reference images + output images ≤ 15**


    Unlike OpenAI gpt-image-2, this endpoint **does not accept
    multipart/form-data**. Upload images to your OSS or a public image host
    first, then pass the URLs as an array.


    **Auth**: add `Authorization: Bearer YOUR_API_KEY` to the request header.
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
        - Image Editing
      summary: Image Editing / Multi-image Fusion / Batch Sequence
      description: >
        Generate new images from reference images (`image` URL array) plus a
        prompt, or enable batch sequence to output multiple coherent images.


        - Single-image edit: pass 1 image + disabled

        - Multi-image fusion: pass multiple images + disabled, refer to "image 1
        / image 2" in the prompt

        - Batch sequence: with or without image, set auto + max_images
      operationId: editSeedreamImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamEditRequest'
            example:
              model: seedream-5-0-260128
              prompt: Replace the clothing in image 1 with the outfit from image 2.
              image:
                - https://your-oss.example.com/person.png
                - https://your-oss.example.com/outfit.png
              sequential_image_generation: disabled
              size: 2K
              response_format: url
              watermark: false
      responses:
        '200':
          description: Edited image generated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: >-
            Invalid parameters (image array exceeds 10, total input+output
            exceeds 15, unsupported size, etc.)
        '401':
          description: Unauthorized — invalid API key
        '403':
          description: Blocked by content moderation
        '404':
          description: URLs in image array unreachable
        '429':
          description: Rate limit (default 500 RPM) or insufficient balance
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamEditRequest:
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
            Editing / fusion / sequence instruction. For multi-image scenarios,
            refer to images explicitly as 'image 1 / image 2'
          example: Replace the clothing in image 1 with the outfit from image 2.
        image:
          type: array
          items:
            type: string
            format: uri
          description: >-
            Reference image URL array. **Up to 10 images** (per official 4.5
            docs). Note: input + output count ≤ 15
          maxItems: 10
          example:
            - https://your-oss.example.com/person.png
            - https://your-oss.example.com/outfit.png
        sequential_image_generation:
          type: string
          description: >-
            Generation mode switch. disabled = single output (default); auto =
            batch sequence, paired with max_images
          enum:
            - disabled
            - auto
          default: disabled
        sequential_image_generation_options:
          type: object
          description: >-
            Batch sequence options. Effective only when
            sequential_image_generation=auto
          properties:
            max_images:
              type: integer
              description: Max number of output images. Subject to input + output ≤ 15
              minimum: 1
              maximum: 15
              example: 4
        size:
          type: string
          description: >
            Output size. Preset tiers (vary by version):

            - `1K` (4.0 only) / `2K` (all) / `3K` (5.0 only) / `4K` (4.5, 4.0)


            Or exact pixel size `WxH`, total pixels ∈ \[1280×720, 4096×4096\],
            aspect ratio ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
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
        watermark:
          type: boolean
          default: false
        stream:
          type: boolean
          description: >-
            Streaming output. Recommended for long prompts and multi-image
            sequence scenarios
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          example: 1768518000
        data:
          type: array
          description: >-
            Result array. disabled mode returns 1 element; auto mode typically
            returns max_images elements (may be fewer)
          items:
            type: object
            properties:
              url:
                type: string
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/.../image.png
              b64_json:
                type: string
                description: 'Plain base64 string, no data: prefix'
              size:
                type: string
                example: 2048x2048
        usage:
          type: object
          description: Billed by generated_images actual count, NOT by max_images
          properties:
            generated_images:
              type: integer
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