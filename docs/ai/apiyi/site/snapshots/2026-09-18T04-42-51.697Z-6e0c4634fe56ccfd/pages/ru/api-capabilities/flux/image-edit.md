> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API по редактированию изображений

> Справочник API по редактированию изображений FLUX и интерактивный отладчик — загружайте до 8 эталонных изображений + инструкции для редактирования одного изображения, слияния нескольких эталонных изображений. Работает с FLUX.2 и FLUX.1 Kontext.

<Info>
  Использование Playground: введите свой API Key в **Authorization** (формат `Bearer sk-xxx`). Вставьте **публичный URL** референсного изображения 1 в `input_image`; для нескольких референсов заполните URL дополнительных изображений в `input_image_2` … `input_image_8`. Затем заполните `prompt` / `model` и отправьте. Playground принимает только URL; для входных данных base64 data URL скопируйте приведенные ниже примеры кода и запустите их локально.
</Info>

<Tip>
  **Используйте эту страницу для** «редактирования или объединения одного или нескольких reference images». Редактирование изображений FLUX поддерживает два варианта:

  * **Вариант A (Playground этой страницы, рекомендуется)**: JSON + `input_image` до `/v1/images/generations` (общий с text-to-image — отправка `input_image` активирует режим редактирования). Работает для всех моделей FLUX (включая Kontext, подтверждено) и поддерживает объединение нескольких референсов (`input_image_2` \~ `input_image_8`).
  * **Вариант B**: multipart-эндпоинт `/v1/images/edits`, совместимый с OpenAI (см. раздел «Вариант B» ниже) — редактирование одного изображения, напрямую совместимое с `client.images.edit()` в OpenAI SDK.

  Для чистого text-to-image см. [эндпоинт Text-to-Image](/ru/api-capabilities/flux/text-to-image).
</Tip>

<Warning>
  **⚠️ Ключевые различия / примечания (Вариант A)**

  * **Путь эндпоинта**: `/v1/images/generations` (общий с text-to-image; также существует совместимый с OpenAI однокадровый `/v1/images/edits` эндпоинт — см. Вариант B)
  * **Content-Type**: `application/json` (эндпоинт `/edits` в Варианте B вместо этого использует `multipart/form-data`)
  * **Каждое поле референсного изображения является строкой**: `input_image` / `input_image_2` … `input_image_8` принимают публичный URL (рекомендуется) или data URL `data:image/...;base64,xxx`
  * **Максимальное число референсных изображений зависит от модели**: FLUX.2 \[pro/max/flex] до **8**, FLUX.2 \[klein] до **4**, FLUX.1 Kontext нативно поддерживает **1**
  * **Каждое изображение ≤ 20MB или 20MP**, форматы `png` / `jpg` / `webp`
  * **Входное разрешение**: минимум 64×64, максимум 4MP; размеры должны быть кратны 16
  * **URL результата действителен только 10 минут** — `data[0].url` необходимо скачать немедленно
  * **Если `aspect_ratio` не указан, размеры выхода будут соответствовать первому входному изображению**
</Warning>

<Warning>
  **📎 Порядок нескольких референсов важен**

  Нумерация `input_image` / `input_image_2` / `input_image_3` … **точно соответствует индексу, используемому для "image 1 / image 2 / image 3"** в вашем prompt:

  > Поместите человека из image 1 в сцену из image 2, применив цветовую палитру image 3.

  Каждое значение должно быть общедоступным URL (рекомендуется ≤ 20MB) или data URL `data:image/png;base64,xxx`.
</Warning>

## Примеры кода

### cURL (слияние двух изображений · URL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "Naturally blend these two images",
    "input_image": "https://static.apiyi.com/apiyi-logo.png",
    "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL (слияние трёх изображений · URL)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "The person from image 1 is petting the cat from image 2, the bird from image 3 is next to them",
    "input_image": "https://example.com/person.jpg",
    "input_image_2": "https://example.com/cat.jpg",
    "input_image_3": "https://example.com/bird.jpg",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL (редактирование одного изображения · Kontext)

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-kontext-pro",
    "prompt": "Convert this architectural photo into a pencil sketch style, preserve all structural details",
    "input_image": "https://your-oss.example.com/architecture.jpg"
  }'
```

### cURL (локальный файл · data URL base64)

```bash theme={null}
# Encode local image as base64 data URL (macOS / Linux)
B64=$(base64 -w0 < person.png 2>/dev/null || base64 < person.png | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg img "data:image/png;base64,$B64" '{
    model: "flux-2-pro",
    prompt: "Stylize image 1 as an oil painting",
    input_image: $img
  }')"
```

### Python (requests · слияние двух изображений)

```python theme={null}
import requests

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "Naturally blend these two images",
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
    timeout=120,
)
image_url = resp.json()["data"][0]["url"]

# data[0].url is valid for only 10 minutes — download immediately
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python (requests · локальный файл как base64)

```python theme={null}
import base64, requests, mimetypes

def to_data_url(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return f"data:{mime};base64,{b64}"

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "Place the person from image 1 into the scene from image 2",
        "input_image": to_data_url("person.png"),
        "input_image_2": "https://your-oss.example.com/scene.jpg",
    },
    timeout=120,
)
print(resp.json()["data"][0]["url"])
```

### Python (OpenAI SDK · передача input\_image через extra\_body)

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# OpenAI SDK images.generate() targets /v1/images/generations with JSON;
# BFL-native fields are added straight into the body via extra_body.
resp = client.images.generate(
    model="flux-2-pro",
    prompt="Naturally blend these two images",
    extra_body={
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
)
image_url = resp.data[0].url
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Node.js (fetch · слияние нескольких референсов)

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sk-your-api-key',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: 'Naturally blend these two images',
        input_image: 'https://static.apiyi.com/apiyi-logo.png',
        input_image_2: 'https://images.unsplash.com/photo-1762138012600-2ab523f8b35a',
        seed: 42,
        output_format: 'jpeg',
    }),
});

const { data } = await resp.json();
const img = await fetch(data[0].url);
const fs = await import('node:fs');
fs.writeFileSync('fused.jpg', Buffer.from(await img.arrayBuffer()));
```

## Вариант B: совместимый с OpenAI эндпоинт редактирования (multipart)

Помимо JSON-варианта выше, редактирование изображений FLUX также поддерживает стандартный эндпоинт редактирования OpenAI Images API, напрямую совместимый с `client.images.edit()` (проверено 2026-07-04 с `flux-kontext-max`, генерация выполнена успешно):

* **Эндпоинт**: `POST https://api.apiyi.com/v1/images/edits`
* **Content-Type**: `multipart/form-data` (устанавливается автоматически SDK и curl `-F` — **не задавайте его вручную**, иначе boundary будет потерян и разбор завершится с ошибкой)

<Note>
  Серия FLUX.1 Kontext принимает только одно входное изображение; для объединения нескольких референсов используйте Вариант A (`input_image` \~ `input_image_8`). Вариант B на данный момент проверен на серии Kontext.
</Note>

### Параметры запроса (поля формы)

| Поле               | Тип     | Обязательно | Описание                                                                                                                                             |
| ------------------ | ------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`            | string  | ✓           | Напр. `flux-kontext-max` / `flux-kontext-pro`                                                                                                        |
| `prompt`           | string  | ✓           | Инструкция редактирования                                                                                                                            |
| `image`            | file    | ✓           | Бинарные данные исходного изображения (png/jpg/webp, ≤ 20MB). **Имя поля должно быть `image`** — если его опустить, возвращается `image is required` |
| `aspect_ratio`     | string  | ✗           | Напр. `1:1` / `16:9`, передается как поле формы верхнего уровня; пользователи OpenAI SDK передают его через `extra_body`                             |
| `safety_tolerance` | integer | ✗           | 0 (самый строгий) – 6 (самый мягкий)                                                                                                                 |

### Пример cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=flux-kontext-max" \
  -F "prompt=Change the outfit to a fashion look" \
  -F "aspect_ratio=16:9" \
  -F "image=@input.jpg"
```

### Пример на Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

result = client.images.edit(
    model="flux-kontext-max",
    image=open("input.jpg", "rb"),
    prompt="Change the outfit to a fashion look",
    extra_body={"aspect_ratio": "16:9"},  # FLUX-specific params go through extra_body
)
print(result.data[0].url)
```

### Пример на Node.js (fetch + FormData)

```javascript theme={null}
const form = new FormData();
form.append('model', 'flux-kontext-max');
form.append('prompt', 'Change the outfit to a fashion look');
form.append('aspect_ratio', '16:9');
form.append('image', imageBlob, 'input.jpg'); // browser Blob or Node's fs.openAsBlob()

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    // Note: do NOT set Content-Type manually — let the runtime generate the multipart boundary
    body: form,
});
const data = await resp.json();
console.log(data.data[0].url);
```

Формат ответа идентичен Варианту A (`data[0].url`, подписанный URL BFL, действительный 10 минут — в production загружайте его на стороне сервера в собственное хранилище).

### Какой вариант следует использовать?

|                          | Вариант A (JSON `input_image`)                                         | Вариант B (multipart `/edits`)                                      |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Лучше всего подходит для | Прямого HTTP / frontend-приложений / объединения нескольких референсов | Существующего кода на OpenAI SDK, миграции с `client.images.edit()` |
| Несколько изображений    | Да (flux-2 до 8)                                                       | Только одно изображение                                             |
| Входное изображение      | Публичный URL или base64 data URL                                      | Бинарный файл                                                       |

## Справочник параметров

| Поле                              | Тип     | Обязательно | Значение по умолчанию | Описание                                                                                                                                                                                       |
| --------------------------------- | ------- | ----------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                           | string  | Yes         | —                     | Идентификатор модели FLUX. Для слияния нескольких референсов предпочтительнее `flux-2-pro` / `flux-2-max`; для редактирования одного изображения также `flux-kontext-max` / `flux-kontext-pro` |
| `prompt`                          | string  | Yes         | —                     | Инструкция для редактирования / слияния, до 32K token. Используйте «image 1 / image 2 / image 3», чтобы указать порядок image / input\_image\_2 / input\_image\_3                              |
| `input_image`                     | string  | Yes         | —                     | Референсное изображение 1. Публичный URL (рекомендуется) или `data:image/...;base64,xxx` data URL                                                                                              |
| `input_image_2` … `input_image_8` | string  | No          | —                     | Референсные изображения 2–8 — URL или data URL. FLUX.2 \[pro/max/flex] до 8, \[klein] 4, Kontext не поддерживает дополнительные                                                                |
| `aspect_ratio`                    | string  | No          | matches first input   | Напр. `1:1` / `16:9` / `9:16` / `4:3` / `3:2`                                                                                                                                                  |
| `seed`                            | integer | No          | random                | Фиксированное значение для воспроизводимости                                                                                                                                                   |
| `safety_tolerance`                | integer | No          | `2`                   | 0 (самый строгий) – 6 (наиболее свободный)                                                                                                                                                     |
| `output_format`                   | string  | No          | `jpeg`                | `jpeg` / `png`                                                                                                                                                                                 |
| `prompt_upsampling`               | boolean | No          | `false`               | Автоматически апскейлить prompt                                                                                                                                                                |
| `steps`                           | integer | No          | `50`                  | **Только `flux-2-flex`**, максимум 50                                                                                                                                                          |
| `guidance`                        | number  | No          | `4.5`                 | **Только `flux-2-flex`**, 1.5–10                                                                                                                                                               |

## Стратегии с несколькими референсами

<AccordionGroup>
  <Accordion icon="user" title="Согласованность персонажа (до 8 изображений)">
    Загрузите несколько снимков одного и того же персонажа в качестве референсов — модель автоматически сохраняет особенности идентичности. Отлично подходит для рекламных кампаний, комиксных панелей, fashion-редакций.

    ```
    Eight consistent characters from the reference images,
    in a fashion editorial set on a Tokyo rooftop at golden hour
    ```
  </Accordion>

  <Accordion icon="palette" title="Перенос стиля">
    Одно изображение с содержимым + одно изображение стиля, с явным референсом в prompt:

    ```
    Using the style of image 2, render the subject from image 1
    ```
  </Accordion>

  <Accordion icon="layers" title="Композиция объектов">
    Объедините объекты из нескольких изображений в одну новую сцену:

    ```
    The person from image 1 is petting the cat from image 2,
    the bird from image 3 is next to them
    ```
  </Accordion>

  <Accordion icon="shirt" title="Замена наряда / товара">
    Перенесите наряд с одного изображения на другого субъекта:

    ```
    Replace the top of the person in image 1 with the one from image 2,
    keep the pose and background unchanged
    ```
  </Accordion>
</AccordionGroup>

<Tip>
  **Итеративное редактирование**: скачайте `data[0].url`, передайте его обратно как `input_image` в следующем вызове с новой инструкцией и постепенно уточняйте результат. Каждый раунд тарифицируется как одно изображение.
</Tip>

## Формат ответа

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "url": "https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=..."
        }
    ]
}
```

<Warning>
  **⚠️ `data[0].url` действует только 10 минут**

  * URL размещен на `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`, срок действия подписи истекает через 10 мин
  * **CORS отключен** — браузер `fetch` заблокирован
  * В production необходимо выполнять загрузку на стороне сервера в ваш собственный OSS / CDN
  * Эндпоинт редактирования FLUX не возвращает `b64_json` — только url
</Warning>

<Info>
  Запросы на редактирование стоят столько же, сколько text-to-image (за изображение, а не за token). Multi-reference не взимает дополнительную плату за дополнительные изображения (в отличие от редактирования OpenAI gpt-image-2).
</Info>

## Вопросы и ответы

<AccordionGroup>
  <Accordion title="Из-за чего возникает ошибка image is required (shell_api_error)?">
    Запрос дошел до эндпоинта `/v1/images/edits` (вариант B), но шлюз не смог найти изображение в теле запроса. Типичные причины:

    1. В multipart form нет поля файла `image`, либо имя поля указано неверно (например, `image[]`, `file`)
    2. `Content-Type: multipart/form-data` был установлен вручную без boundary (не задавайте этот заголовок самостоятельно при использовании SDK / fetch / curl)
    3. Конвертация изображения на стороне клиента не удалась, но запрос все равно был отправлен (проверьте, что поле `image` действительно содержит больше 0 байт)
    4. Вы хотели отправить изображение через JSON, но попали в `/edits` — JSON + `input_image` идет в `/v1/images/generations` (вариант A)
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/flux-edit-openapi-en.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX Image Editing API
  description: >
    Black Forest Labs FLUX model family — image editing endpoint (apiyi proxy:
    `/v1/images/generations` + JSON body).


    - **Endpoint path**: `POST /v1/images/generations` (FLUX shares this path
    between text-to-image and editing — passing `input_image` switches to edit
    mode)

    - **Content-Type**: `application/json` (this Playground uses the JSON
    option, recommended; an OpenAI-compatible multipart single-image
    `/v1/images/edits` endpoint also exists — see "Option B" on the docs page)

    - **Reference image fields**: `input_image` / `input_image_2` …
    `input_image_8`, **values are public URL strings** (also accepts
    `data:image/...;base64,xxx` data URLs, but the Playground encourages plain
    URLs and leaves base64 for local code testing)

    - Multi-reference caps: FLUX.2 [pro/max/flex] up to 8, [klein] up to 4,
    FLUX.1 Kontext single image

    - In the prompt, "image 1 / image 2 / image 3" map to input_image /
    input_image_2 / input_image_3

    - Response `data[0].url` is **valid for only 10 minutes**, download
    immediately (CORS disabled)


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header.


    **Get API Key**: create a token at the [APIYI
    Console](https://api.apiyi.com/token).
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
      summary: Edit or fuse one or more reference images by instruction
      description: >
        Edit or fuse one or more reference images using FLUX.


        - **Path is shared with text-to-image: `/v1/images/generations`** (an
        OpenAI-compatible multipart single-image `/v1/images/edits` endpoint
        also exists — see "Option B" on the docs page)

        - Request Content-Type is `application/json`

        - **All reference image fields are URL strings**: `input_image`,
        `input_image_2` … `input_image_8`

        - If `aspect_ratio` is omitted, output dimensions match the first input
        image
      operationId: editFluxImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              model: flux-2-pro
              prompt: Naturally blend these two images
              input_image: https://static.apiyi.com/apiyi-logo.png
              input_image_2: https://images.unsplash.com/photo-1762138012600-2ab523f8b35a
              seed: 42
              output_format: jpeg
      responses:
        '200':
          description: Image generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: >-
            Invalid params (missing input_image, dimensions not multiple of 16,
            exceeds 4MP, etc.)
        '401':
          description: Unauthorized — invalid API Key
        '403':
          description: Moderation block
        '413':
          description: Uploaded image too large
        '429':
          description: Rate limited or out of credits
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
        - input_image
      properties:
        model:
          type: string
          description: >-
            FLUX model ID. For multi-reference fusion prefer flux-2-pro /
            flux-2-max; for single-image edits also flux-kontext-max /
            flux-kontext-pro.
          enum:
            - flux-2-pro
            - flux-2-max
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-kontext-max
            - flux-kontext-pro
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            Edit / fusion instruction. In multi-reference scenarios, refer to
            images by index: 'image 1' / 'image 2' / 'image 3' map to
            input_image / input_image_2 / input_image_3.
          example: Naturally blend these two images
        input_image:
          type: string
          description: >-
            Public URL for reference image 1 (required). **Use plain URLs in the
            Playground**; for local code you can also pass a
            `data:image/png;base64,xxx` data URL.
          example: https://static.apiyi.com/apiyi-logo.png
        input_image_2:
          type: string
          description: Public URL for reference image 2 (optional)
        input_image_3:
          type: string
          description: Public URL for reference image 3 (optional)
        input_image_4:
          type: string
          description: Public URL for reference image 4 (optional)
        input_image_5:
          type: string
          description: Public URL for reference image 5 (optional)
        input_image_6:
          type: string
          description: Public URL for reference image 6 (optional)
        input_image_7:
          type: string
          description: Public URL for reference image 7 (optional)
        input_image_8:
          type: string
          description: >-
            Public URL for reference image 8 (optional, only FLUX.2
            [pro/max/flex] supports up to 8)
        aspect_ratio:
          type: string
          description: >-
            Aspect ratio, e.g. 1:1 / 16:9 / 9:16 / 4:3 / 3:4. Defaults to first
            input image.
        seed:
          type: integer
          description: Fix for reproducibility.
        safety_tolerance:
          type: integer
          description: Moderation level. 0 = strictest, 6 = most permissive. Default 2.
          minimum: 0
          maximum: 6
        output_format:
          type: string
          description: Output format. Default jpeg.
          enum:
            - jpeg
            - png
        prompt_upsampling:
          type: boolean
          description: Auto-upsample the prompt. Default false.
        steps:
          type: integer
          description: '**Only flux-2-flex**. Inference steps. Default 50.'
          minimum: 1
          maximum: 50
        guidance:
          type: number
          description: '**Only flux-2-flex**. Guidance scale. Default 4.5.'
          minimum: 1.5
          maximum: 10
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: Result array (single image per call)
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  **Signed URL, valid for 10 minutes**. Hosted on
                  delivery-eu.bfl.ai / delivery-us.bfl.ai with CORS disabled.
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI Console

````