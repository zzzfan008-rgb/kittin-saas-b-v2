> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник по API генерации видео Oxygen

> Справочник по API генерации видео Oxygen (oxygen-1.0) и интерактивный Playground: совместимость с OpenAI Videos, отправка через POST /v1/videos и запрос через GET /v1/videos/{id}, первый/последний кадры и референсные медиа через envelope, посекундная тарификация.

<Info>
  Интерактивный Playground справа позволяет тестировать вызовы в реальном времени. Введите ваш API-ключ в поле **Authorization** (формат `Bearer sk-xxx`), заполните `prompt`, `seconds` и `size` и отправьте запрос. В ответе вернется `id` задачи; получите видео с помощью эндпоинта запроса ниже.
</Info>

<Tip>
  **Один эндпоинт, четыре режима**: только `prompt` = генерация видео по тексту; одно изображение в `input_reference` = видео по первому кадру; JSON-конверт в `input_reference` = видео по первому и последнему кадрам или по референсным медиа, кроме того, конверт позволяет выбрать 320p или 1:1. Полную информацию см. в разделе [Oxygen Overview](/ru/api-capabilities/oxygen/overview).
</Tip>

<Warning>
  **⚠️ Четыре самые частые ошибки**

  1. **Всегда передавайте `size`**: без этого шлюз по умолчанию использует `720x1280`, и вы получите видео в портретной ориентации
  2. **Помещайте расширенные параметры в конверт `input_reference`**: на верхнем уровне действуют только `model`, `prompt`, `seconds`, `size` и `input_reference`; указанные там `last_image`, `reference_images`, `resolution` и `aspect_ratio` **молча игнорируются** без вывода ошибки
  3. **`input_reference` должен быть строкой**: предварительно сериализуйте конверт с помощью `json.dumps` / `JSON.stringify`; передача объекта или массива отклоняется
  4. **Задавайте длительность только через `seconds` верхнего уровня** (4–15); указание `duration` внутри конверта возвращает 400
</Warning>

## Примеры кода

### Python (requests · отправка + опрос + скачивание)

```python theme={null}
import os
import time
import requests

API_KEY = os.environ["APIYI_API_KEY"]
BASE = "https://api.apiyi.com/v1/videos"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# Step 1: submit the task
payload = {
    "model": "oxygen-1.0",
    "prompt": "A paper boat drifting on a calm pond, soft morning light",
    "seconds": "4",          # 4–15, billed per second
    "size": "1280x720",      # always pass it: 1280x720 = 480p landscape
}
r = requests.post(BASE, headers=HEADERS, json=payload, timeout=60)
r.raise_for_status()
video_id = r.json()["id"]
print("id:", video_id)

# Step 2: poll (usually 1–3 minutes, wait up to 15 minutes)
deadline = time.time() + 900
while time.time() < deadline:
    job = requests.get(f"{BASE}/{video_id}", headers=HEADERS, timeout=30).json()
    print(job["status"], job.get("progress"))
    if job["status"] == "completed":
        video_url = job["video_url"]
        break
    if job["status"] == "failed":
        # Failed tasks are refunded automatically; error has the reason
        raise RuntimeError(job.get("error"))
    time.sleep(5)
else:
    raise TimeoutError(video_id)

# Step 3: download video_url directly (no auth header; valid ~24 hours, store it promptly)
with requests.get(video_url, stream=True, timeout=300) as v, open("output.mp4", "wb") as f:
    v.raise_for_status()
    for chunk in v.iter_content(1 << 16):
        f.write(chunk)
print("Saved: output.mp4")
```

### Python (видео по первому кадру · тело запроса)

```python theme={null}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere rolls slowly across the table",
    "seconds": "4",
    "size": "1280x720",      # sets the resolution (480p); aspect ratio follows the first frame
    "input_reference": "https://your-cdn.example.com/first.png",  # a data:image/...;base64,... URI also works
}
```

### Python (первый и последний кадр / референсные медиаданные · JSON-обертка)

```python theme={null}
import json

# First and last frame: the envelope is a JSON string, json.dumps it into input_reference
envelope = {
    "images": ["https://your-cdn.example.com/first.png"],   # first frame (max 1)
    "last_image": "https://your-cdn.example.com/last.png",  # last frame
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": json.dumps(envelope),
}

# Reference media + portrait + 320p (reference media cannot be mixed with first/last frames)
envelope = {
    "reference_images": ["https://your-cdn.example.com/character.png"],   # up to 9
    "reference_videos": ["https://your-cdn.example.com/motion.mp4"],      # up to 3, https only
    "aspect_ratio": "9:16",
    "resolution": "320p",    # resolution in the envelope wins over size
}
payload = {
    "model": "oxygen-1.0",
    "prompt": "The character from the reference image dances following the reference video",
    "seconds": "8",
    "size": "720x1280",
    "input_reference": json.dumps(envelope),
}
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  --max-time 60 \
  -d '{
    "model": "oxygen-1.0",
    "prompt": "A lighthouse at dusk, waves crashing on the rocks",
    "seconds": "4",
    "size": "1792x1024"
  }'
```

Первый и последний кадр (обратите внимание, что значение `input_reference` представляет собой экранированную JSON-строку):

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "oxygen-1.0",
    "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
    "seconds": "5",
    "size": "1280x720",
    "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
  }'
```

### Node.js (нативный fetch)

```javascript theme={null}
const API_KEY = process.env.APIYI_API_KEY;
const BASE = 'https://api.apiyi.com/v1/videos';
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

const submit = await fetch(BASE, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'oxygen-1.0',
    prompt: 'Aurora drifting over snowy mountains, time-lapse feel',
    seconds: '8',
    size: '1280x720',
    // Advanced parameters: JSON.stringify the envelope into a string first
    input_reference: JSON.stringify({ resolution: '320p' }),
  }),
});
if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
const { id } = await submit.json();

let job;
for (;;) {
  await new Promise(r => setTimeout(r, 5000));
  job = await (await fetch(`${BASE}/${id}`, { headers })).json();
  if (job.status === 'completed' || job.status === 'failed') break;
}
if (job.status === 'failed') throw new Error(JSON.stringify(job.error));
console.log('video:', job.video_url);
```

## Есть id? Один запрос cURL для получения результата

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer $APIYI_API_KEY"
```

Когда `status` имеет значение `completed`, `video_url` является адресом MP4 и может быть скачан напрямую:

```bash theme={null}
curl -L -o output.mp4 "<value of video_url>"
```

## Справочник параметров

### Поля верхнего уровня (действуют только эти пять)

| Параметр | Тип | Обязательный | Описание |
| - | - | - | - |
| `model` | string | Да | Всегда `oxygen-1.0` |
| `prompt` | string | Да | Описание видео |
| `seconds` | string / integer | Да | Целое число от 4 до 15, используется для тарификации |
| `size` | string | Настоятельно рекомендуется | `1280x720` / `720x1280` (480p), `1792x1024` / `1024x1792` (768p); по умолчанию `720x1280`, если опущено |
| `input_reference` | string | Нет | URL изображения или data URI = первый кадр; JSON-строка, начинающаяся с `{` = envelope (см. ниже) |

### Ключи envelope `input_reference`

| Ключ | Тип | Описание |
| - | - | - |
| `images` | string\[] | Первый кадр, не более 1 (https или data URI изображения) |
| `last_image` | string | Последний кадр (https или data URI изображения) |
| `reference_images` | string\[] | Референсные изображения, до 9 |
| `reference_videos` | string\[] | Референсные видео, до 3, только https |
| `reference_audios` | string\[] | Референсное аудио, до 3, только https |
| `resolution` | string | `320p` / `480p` / `768p`, имеет приоритет над `size` |
| `aspect_ratio` | string | `16:9` / `9:16` / `1:1`, имеет приоритет над `size`; игнорируется для image-to-video |
| `prompt` | string | Если указан, переопределяет `prompt` верхнего уровня |

<Warning>
  Envelope **не может содержать `duration`** (используйте `seconds` верхнего уровня) или любые ключи, не указанные в таблице, а первый и последний кадры (`images` / `last_image`) нельзя комбинировать с `reference_*`. Любое из этих нарушений возвращает ошибку 400 (`param: input_reference`) без списания средств.
</Warning>

### Разрешение и выходной размер (измеренные значения)

| Разрешение | Альбомная 16:9 | Портретная 9:16 | Квадратная 1:1 |
| - | - | - | - |
| 320p | 576×320 | (не измерялось) | (не измерялось) |
| 480p | 864×480 | 480×864 | 480×480 |
| 768p | 1344×768 | 768×1344 | 768×768 |

Режим image-to-video сохраняет соотношение сторон первого кадра; например, квадратный первый кадр дает 480×480 при 480p.

## Формат ответа

### Создание задачи

```json theme={null}
{
  "id": "task_PSOFP1GQLtN6kGLXv9DpHMkMGBka70Ga",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "queued",
  "progress": 0,
  "seconds": "4",
  "size": "1280x720",
  "created_at": 1790853159
}
```

### Запрос задачи (успех)

```json theme={null}
{
  "id": "task_R0Sb8B4YqmNxVSkQZSphUZ8GwEebRMRu",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "completed",
  "progress": 100,
  "seconds": "5",
  "created_at": 1790902499,
  "completed_at": 1790902566,
  "expires_at": 1790988966,
  "usage": {
    "billing_unit": "second",
    "billed_seconds": 5,
    "resolution": "480p",
    "unit_price_usd": 0.02
  },
  "video_url": "https://your-video-host.example.com/task_R0Sb8B4Y..._0.mp4"
}
```

### Запрос задачи (ошибка)

```json theme={null}
{
  "id": "task_xqNrojcHWebOegX70EZzqpM3EhdXMnOo",
  "object": "video",
  "model": "oxygen-1.0",
  "status": "failed",
  "progress": 100,
  "error": {
    "code": "upstream_timeout",
    "message": "upstream did not finish the video within the deadline"
  }
}
```

### Ошибка отправки (400)

```json theme={null}
{
  "message": "{\"error\":{\"code\":\"invalid_params\",\"message\":\"input_reference: duration is not used here; set the length with the top-level seconds field\",\"param\":\"input_reference\"}}",
  "type": "task_error",
  "code": "fail_to_fetch_task"
}
```

<Warning>
  **⚠️ Примечания к ответу**

  * Статус меняется по цепочке: `queued` → `in_progress` → `completed` / `failed`
  * Видео находится по адресу **`video_url`** и доступно для скачивания без заголовка авторизации; срок действия ссылки истекает в `expires_at` (примерно через 24 часа), поэтому сохраните его своевременно
  * Сразу после `completed` для `/v1/videos/{id}/content` может потребоваться ещё несколько секунд (сначала возвращается 400); рекомендуем использовать `video_url`
  * `usage.unit_price_usd` — это ориентировочная цена для каждого разрешения; **фактическая тарификация рассчитывается по вашему счету**: фиксированные \$0.02 за секунду
  * При ошибках отправки подробная информация передается в виде строки JSON внутри `message`, и её необходимо распарсить повторно
</Warning>

<Info>
  **Тарификация**: списание `seconds × \$0.02` происходит в момент принятия задачи; разрешение и референсные медиафайлы не влияют на стоимость, а за неудавшиеся задачи средства **автоматически возвращаются в полном объеме**. За отправку запросов, возвращающих ошибку 400, плата не взимается, а запросы статуса и скачивание бесплатны. См. раздел [Тарифы в обзоре](/ru/api-capabilities/oxygen/overview#pricing).
</Info>


## OpenAPI

````yaml api-reference/oxygen-video-openapi-en.yaml POST /videos
openapi: 3.1.0
info:
  title: Oxygen Video Generation API
  description: >
    AZ8 Oxygen video generation model with an OpenAI Videos-compatible API. One
    endpoint covers text-to-video, first-frame / first-and-last-frame video, and
    reference image / video / audio video.


    - Model ID: `oxygen-1.0`

    - Length: top-level `seconds`, integer 4–15; resolution 320p / 480p / 768p

    - Billed at \$0.02 per second regardless of resolution; failed tasks are
    refunded automatically

    - **Only five top-level fields take effect: `model` / `prompt` / `seconds` /
    `size` / `input_reference`**; first/last frames, reference media, 320p, and
    1:1 go into the `input_reference` JSON envelope

    - **Asynchronous endpoint**: submitting returns a task `id`; poll `GET
    /v1/videos/{id}` for the result


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
  version: 1.0.0
servers:
  - url: https://api.apiyi.com/v1
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /videos:
    post:
      tags:
        - Video Generation
      summary: Create an Oxygen video generation task
      description: >
        Submits an asynchronous video generation task. Success only means the
        task was accepted; the response is a video object with `status: queued`.


        Modes:

        - No `input_reference` → text-to-video

        - `input_reference` = image URL or data URI → first-frame video (aspect
        ratio follows the first frame)

        - `input_reference` = JSON string starting with `{` → envelope: first
        and last frame (`images` + `last_image`), reference media
        (`reference_images` / `reference_videos` / `reference_audios`),
        `resolution` (including 320p), `aspect_ratio`


        Rules:

        - **Always pass `size`**; it defaults to `720x1280` (portrait) when
        omitted

        - `last_image`, `reference_images`, `resolution`, and `aspect_ratio` are
        silently dropped at the top level and must go in the envelope

        - `duration` is not allowed in the envelope; first/last frames cannot be
        mixed with reference media

        - Usually done in 1–3 minutes; query with `GET /v1/videos/{id}`
      operationId: createOxygenVideo
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OxygenCreateRequest'
            examples:
              TextToVideo:
                summary: Text-to-video
                value:
                  model: oxygen-1.0
                  prompt: A paper boat drifting on a calm pond, soft morning light
                  seconds: '4'
                  size: 1280x720
              FirstFrame:
                summary: First-frame video
                value:
                  model: oxygen-1.0
                  prompt: The glass sphere rolls slowly across the table
                  seconds: '4'
                  size: 1280x720
                  input_reference: https://your-cdn.example.com/first.png
              FirstAndLastFrame:
                summary: First-and-last-frame video
                value:
                  model: oxygen-1.0
                  prompt: >-
                    The glass sphere slowly dissolves into a deep blue abstract
                    wave
                  seconds: '5'
                  size: 1280x720
                  input_reference: >-
                    {"images":["https://your-cdn.example.com/first.png"],"last_image":"https://your-cdn.example.com/last.png"}
              ReferenceImage:
                summary: Reference image video
                value:
                  model: oxygen-1.0
                  prompt: >-
                    The object from the reference image slowly rotates on a
                    wooden table
                  seconds: '4'
                  size: 720x1280
                  input_reference: >-
                    {"reference_images":["https://your-cdn.example.com/object.png"],"aspect_ratio":"9:16"}
              Select320p:
                summary: Select 320p
                value:
                  model: oxygen-1.0
                  prompt: A paper boat drifting on a calm pond
                  seconds: '4'
                  size: 1280x720
                  input_reference: '{"resolution":"320p"}'
      responses:
        '200':
          description: Task accepted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OxygenVideo'
              example:
                id: task_PSOFP1GQLtN6kGLXv9DpHMkMGBka70Ga
                object: video
                model: oxygen-1.0
                status: queued
                progress: 0
                seconds: '4'
                size: 1280x720
                created_at: 1790853159
        '400':
          description: >-
            Validation failed (seconds outside 4–15, invalid envelope JSON /
            unknown key / duration in the envelope, first/last frames mixed with
            reference media, input_reference not a string, etc.); not charged.
            The detail is a JSON string in the `message` field
        '401':
          description: Unauthorized - invalid API key
        '500':
          description: Reference image download failed, etc.; not charged
        '503':
          description: >-
            No available channel in the token's group (usually a misspelled
            model name or a group that does not include this model)
      security:
        - bearerAuth: []
components:
  schemas:
    OxygenCreateRequest:
      type: object
      required:
        - model
        - prompt
        - seconds
      properties:
        model:
          type: string
          description: Always `oxygen-1.0`
          enum:
            - oxygen-1.0
          default: oxygen-1.0
        prompt:
          type: string
          description: Video description
          example: A paper boat drifting on a calm pond, soft morning light
        seconds:
          type: string
          description: >-
            Output length in seconds, integer 4–15, as a string or number. Used
            for billing; the clip usually runs slightly longer
          enum:
            - '4'
            - '5'
            - '6'
            - '7'
            - '8'
            - '9'
            - '10'
            - '11'
            - '12'
            - '13'
            - '14'
            - '15'
          default: '4'
        size:
          type: string
          description: >
            Sets the resolution and orientation. **Pass it every time**; it
            defaults to `720x1280` (portrait) when omitted.

            `1280x720` = 480p landscape, `720x1280` = 480p portrait, `1792x1024`
            = 768p landscape, `1024x1792` = 768p portrait.

            For 320p or 1:1, use `resolution` / `aspect_ratio` in the
            `input_reference` envelope.
          enum:
            - 1280x720
            - 720x1280
            - 1792x1024
            - 1024x1792
          default: 1280x720
        input_reference:
          type: string
          description: >
            Two forms:

            - **Image URL or data URI** → first-frame video; aspect ratio
            follows the first frame

            - **JSON string starting with `{`** (envelope) → allowed keys:
            `images` (first frame, max 1), `last_image` (last frame),
            `reference_images` (up to 9), `reference_videos` (up to 3, https
            only), `reference_audios` (up to 3, https only), `resolution`
            (`320p` / `480p` / `768p`, wins over size), `aspect_ratio` (`16:9` /
            `9:16` / `1:1`, ignored for image-to-video), `prompt`


            Must be a string, so serialize the envelope first. No `duration` and
            no unknown keys in the envelope; first/last frames cannot be mixed
            with reference media.
          example: https://your-cdn.example.com/first.png
    OxygenVideo:
      type: object
      properties:
        id:
          type: string
          description: Task id, used with `GET /v1/videos/{id}`
        object:
          type: string
          enum:
            - video
        model:
          type: string
        status:
          type: string
          enum:
            - queued
            - in_progress
            - completed
            - failed
        progress:
          type: integer
          description: 0–100
        seconds:
          type: string
        size:
          type: string
        created_at:
          type: integer
        completed_at:
          type: integer
        expires_at:
          type: integer
          description: >-
            When video_url expires (Unix seconds), about 24 hours after
            completion
        video_url:
          type: string
          description: >-
            Output MP4 URL, downloadable without an auth header; store it
            promptly
        usage:
          type: object
          description: >-
            Reference billing info; actual billing is a flat \$0.02 per second,
            see your bill
          properties:
            billing_unit:
              type: string
            billed_seconds:
              type: integer
            resolution:
              type: string
            unit_price_usd:
              type: number
        error:
          type: object
          properties:
            code:
              type: string
              description: For example `upstream_error`, `upstream_timeout`
            message:
              type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.