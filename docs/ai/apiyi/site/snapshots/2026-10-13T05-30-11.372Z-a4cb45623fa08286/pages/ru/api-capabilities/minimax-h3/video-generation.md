> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API по генерации видео MiniMax-H3

> Справочник API по генерации видео MiniMax-H3 и интерактивный Playground: единый эндпоинт для видео по тексту, первому/последнему кадру и референсным изображениям/видео/аудио; асинхронная отправка плюс запрос по task_id; 768P, 4–15 с, посекундная тарификация.

<Info>
  Интерактивный Playground справа позволяет протестировать работу в реальном времени. Укажите ваш API-ключ в **Authorization** (формат `Bearer sk-xxx`), добавьте один текстовый элемент в `content` (а также изображения, видео или аудио при необходимости), выберите `duration` и `ratio` и отправьте запрос. В ответе вернется `task_id`; получите видео с помощью эндпоинта запроса, описанного ниже.
</Info>

<Tip>
  **Один эндпоинт, четыре режима**: только текст = text-to-video; добавление изображения `first_frame` / `last_frame` = видео по ключевым кадрам; добавление `reference_image` / `reference_video` / `reference_audio` = видео по референсу. Режим определяется на основе `content[]`, поэтому переключать эндпоинт не требуется. Подробности см. в [обзоре MiniMax-H3](/ru/api-capabilities/minimax-h3/overview).
</Tip>

<Warning>
  **⚠️ Четыре самые распространенные ошибки**

  1. **Путь начинается с `/hailuo`**: создание через `POST /hailuo/v2/video_generation`, запрос через `GET /hailuo/v2/query/video_generation/{task_id}`. Путь `/v2/...` сам по себе возвращает веб-страницу, а не JSON
  2. **`duration` должно быть целым числом от 4 до 15**: строка `"5"` или дробное число вроде `5.5` будут отклонены
  3. **`resolution` должно быть в верхнем регистре `768P`**: и `768p`, и `2K` будут отклонены
  4. **Запросы только с текстом и только с аудио не могут использовать `ratio: "adaptive"`**; выберите фиксированное соотношение сторон. `adaptive` работает только тогда, когда запрос содержит изображения или видео
</Warning>

## Примеры кода

### Python (requests · отправка + опрос + скачивание)

```python theme={null}
import time
import requests

API_KEY = "sk-your-api-key"
BASE = "https://api.apiyi.com/hailuo/v2"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# Step 1: submit the task
payload = {
    "model": "MiniMax-H3",
    "content": [
        {"type": "text", "text": "A lighthouse by the sea at dusk, slow dolly in, waves crashing on the rocks, cinematic lighting"}
    ],
    "resolution": "768P",   # uppercase 768P only
    "duration": 5,          # integer 4–15, billed per second
    "ratio": "16:9",        # text-only requests need a fixed ratio
}
for attempt in range(3):
    # Submitting takes a few seconds; occasional 500s at peak are not billed, so back off and retry
    r = requests.post(f"{BASE}/video_generation", headers=HEADERS, json=payload, timeout=60)
    if r.status_code != 500:
        break
    time.sleep(5 * (attempt + 1))
r.raise_for_status()
task_id = r.json()["task_id"]
print("task_id:", task_id)

# Step 2: poll (usually 2–4 minutes; give up after 15)
deadline = time.time() + 900
while time.time() < deadline:
    task = requests.get(f"{BASE}/query/video_generation/{task_id}",
                        headers=HEADERS, timeout=30).json()["task"]
    print(task["status"])
    if task["status"] == "succeeded":
        video_url = task["content"]["url"]
        break
    if task["status"] == "failed":
        # Failed tasks are refunded automatically; the reason is in error
        raise RuntimeError(task["error"])
    time.sleep(10)
else:
    raise TimeoutError(task_id)

# Step 3: download (no auth header needed; use GET, not HEAD, to check the URL)
with requests.get(video_url, stream=True, timeout=300) as v, open("output.mp4", "wb") as f:
    v.raise_for_status()
    for chunk in v.iter_content(1 << 16):
        f.write(chunk)
print("Saved: output.mp4")
```

### Python (видео по первому кадру · тело запроса)

```python theme={null}
payload = {
    "model": "MiniMax-H3",
    "content": [
        {"type": "text", "text": "The character slowly turns and smiles, a light breeze moves the hair, gentle push-in"},
        {"type": "image_url",
         "image_url": {"url": "https://your-cdn.example.com/first.png"},
         "role": "first_frame"},
    ],
    "resolution": "768P",
    "duration": 5,
    "ratio": "adaptive",   # follow the first frame's aspect ratio
}
```

### Python (смешанные референсы · тело запроса)

```python theme={null}
payload = {
    "model": "MiniMax-H3",
    "content": [
        # Numbered by order within each media type: first image = <Picture 1>, first video = <Video 1>
        {"type": "text", "text": "<Picture 1> dances with the moves from <Video 1>, in time with <Audio 1>"},
        {"type": "image_url", "image_url": {"url": "https://your-cdn.example.com/character.png"},
         "role": "reference_image"},
        {"type": "video_url", "video_url": {"url": "https://your-cdn.example.com/motion.mp4"},
         "role": "reference_video"},
        {"type": "audio_url", "audio_url": {"url": "https://your-cdn.example.com/music.mp3"},
         "role": "reference_audio"},
    ],
    "resolution": "768P",
    "duration": 10,
    "ratio": "adaptive",
}
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/hailuo/v2/video_generation" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  --max-time 60 \
  -d '{
    "model": "MiniMax-H3",
    "content": [
      {"type": "text", "text": "A lighthouse by the sea at dusk, slow dolly in, waves crashing on the rocks, cinematic lighting"}
    ],
    "resolution": "768P",
    "duration": 5,
    "ratio": "16:9"
  }'
```

### Node.js (нативный fetch)

```javascript theme={null}
const API_KEY = 'sk-your-api-key';
const BASE = 'https://api.apiyi.com/hailuo/v2';
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

const submit = await fetch(`${BASE}/video_generation`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'MiniMax-H3',
    content: [{ type: 'text', text: 'Aurora drifting over snowy mountains, time-lapse look' }],
    resolution: '768P',
    duration: 8,
    ratio: '21:9',
  }),
});
if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
const { task_id } = await submit.json();

let task;
for (;;) {
  await new Promise(r => setTimeout(r, 10000));
  task = (await (await fetch(`${BASE}/query/video_generation/${task_id}`, { headers })).json()).task;
  if (task.status === 'succeeded' || task.status === 'failed') break;
}
if (task.status === 'failed') throw new Error(JSON.stringify(task.error));
console.log('video:', task.content.url);
```

### Браузерный JavaScript

```javascript theme={null}
{/* Demo only. In production, call through your backend so the key is not exposed */}
const resp = await fetch('https://api.apiyi.com/hailuo/v2/video_generation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-your-api-key' },
  body: JSON.stringify({
    model: 'MiniMax-H3',
    content: [{ type: 'text', text: 'A watercolor paper boat drifting down a calm river' }],
    resolution: '768P',
    duration: 4,
    ratio: '9:16',
  }),
});
const { task_id } = await resp.json();
console.log('task_id:', task_id);
{/* Let the backend poll; once you have content.url, play it in a video tag */}
```

## Уже есть task\_id? Один вызов cURL

```bash theme={null}
curl "https://api.apiyi.com/hailuo/v2/query/video_generation/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

Когда `status` равен `succeeded`, `task.content.url` — это URL MP4, и его можно скачать напрямую:

```bash theme={null}
curl -L -o output.mp4 "<value of task.content.url>"
```

## Справочник параметров

| Параметр | Тип | Обязательный | По умолчанию | Описание |
| - | - | - | - | - |
| `model` | string | Да | — | Всегда `MiniMax-H3`, с учётом регистра |
| `content` | array | Да | — | Ровно 1 текстовый элемент + 0–12 медиаэлементов (до 9 референсных изображений, 3 референсных видео, 3 референсных аудиоклипов) |
| `content[].text` | string | Да | — | 1–7000 символов; ссылайтесь на медиафайлы как `<Picture 1>` / `<Video 1>` / `<Audio 1>` |
| `content[].role` | string | Зависит от условий | — | Изображения: `first_frame` / `last_frame` / `reference_image`; видео: `reference_video`; аудио: `reference_audio`. Необязательно, если передано только одно изображение (обрабатывается как первый кадр) |
| `resolution` | string | Да | — | Только `768P` |
| `duration` | integer | Да | — | 4–15 секунд, посекундная тарификация |
| `ratio` | string | Да | — | `21:9` / `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `adaptive` |

### Соотношение сторон и размер на выходе (измеренный)

| `ratio` | Выходной размер |
| - | - |
| `21:9` | 1536×672 |
| `16:9` | 1344×768 |
| `4:3` | 1024×768 |
| `1:1` | 768×768 |
| `3:4` | 768×1024 |
| `9:16` | 768×1344 |
| `adaptive` | Соответствует соотношению сторон входного изображения (квадратное изображение даёт 768×768) |

### Требования к медиафайлам

| Тип | Формат | Размер | Длительность / размеры |
| - | - | - | - |
| Изображение | JPG / PNG / WebP / HEIC / HEIF (статические) | ≤ 30MB | 256–5760 px на сторону, соотношение сторон 0.4–2.5; соотношение сторон первого и последнего кадров отличается не более чем на 2% |
| Видео | MP4 / MOV (H.264 / H.265) | ≤ 50MB | Не менее 2 с на клип; клипы длиннее 15 с обрезаются до первых 15 с; **суммарно** по всем клипам не более 15 с |
| Аудио | WAV / MP3 / M4A / AAC | ≤ 15MB | Не менее 2 с на клип; клипы длиннее 15 с обрезаются до первых 15 с |

<Warning>
  Все медиафайлы должны быть **публичными HTTPS URL, доступными для прямого скачивания**. Base64, data URI, ссылки `http://` и адреса частных сетей не поддерживаются. Ссылки с защитой от хотлинкинга или требующие авторизации приведут к сбою выполнения задачи при попытке скачивания медиафайлов.
</Warning>

## Формат ответа

### Создание задачи

```json theme={null}
{"task_id": "task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx"}
```

### Запрос задачи (в процессе)

```json theme={null}
{
  "task": {
    "id": "task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx",
    "status": "running",
    "progress": 0,
    "content": null,
    "error": null
  }
}
```

### Запрос задачи (успешно)

```json theme={null}
{
  "task": {
    "id": "task_R3SNqSywqnYPTAbqg1Z4iXEItPoln59I",
    "status": "succeeded",
    "progress": 1,
    "model": "MiniMax-H3",
    "modality": "video",
    "task_type": "generation",
    "ratio": "21:9",
    "resolution": "768P",
    "duration": 5,
    "usage": {
      "input_image_count": 0,
      "input_seconds": 0,
      "output_seconds": 5,
      "total_seconds": 5
    },
    "content": {
      "url": "https://your-video-host.example.com/outputs/4a441cc0....mp4"
    },
    "created_at": 1790641245,
    "updated_at": 1790641411
  }
}
```

### Запрос задачи (ошибка)

```json theme={null}
{
  "task": {
    "id": "task_w6ASrlpw5rfIVeeMSMnC5sHryP2Xv4th",
    "status": "failed",
    "error": {"code": "input_download_failed", "message": "media server returned 404"}
  }
}
```

<Warning>
  **⚠️ Примечания к ответу**

  * Результат запроса обернут в объект **`task`**, а не находится на верхнем уровне
  * При успешном выполнении гарантируются только `id`, `status`, `progress` и `content.url`; `usage`, `model`, `ratio` и подобные поля **возвращаются не всегда**, поэтому обрабатывайте их с осторожностью
  * Статус меняется по цепочке `queued` → `running` → `succeeded` / `failed`; в периоды пиковой нагрузки задача может начинаться с `running`
  * `progress` принимает только значения 0 и 1, поэтому его не стоит использовать как индикатор выполнения в процентах
  * URL видео — это `task.content.url`, и для него **не** требуется заголовок авторизации. На запросы `HEAD` возвращается 403, но с `GET` он работает корректно, поэтому для проверки используйте `GET`
  * Скачайте и сохраните видео на своей стороне как можно скорее после получения URL
</Warning>

<Info>
  **Тарификация**: при принятии задачи предварительно списывается `duration × \$0.03` без дополнительной платы за референсные медиафайлы; за задачи, завершившиеся ошибкой, средства **автоматически возвращаются в полном объеме**. Запросы, возвращающие 4xx / 5xx при отправке, не тарифицируются, а запросы статуса и скачивание бесплатны. См. [цены на обзорной странице](/ru/api-capabilities/minimax-h3/overview#pricing).
</Info>


## OpenAPI

````yaml api-reference/minimax-h3-video-openapi-en.yaml POST /hailuo/v2/video_generation
openapi: 3.1.0
info:
  title: MiniMax-H3 Video Generation API
  description: >
    MiniMax H3 (Hailuo 3.0) video generation — one endpoint covers
    text-to-video, first/last-frame video, and video from reference images,
    videos, and audio.


    - Model ID: `MiniMax-H3` (case-sensitive)

    - Resolution `768P` only; duration is an integer from 4 to 15 seconds;
    ratios `21:9` / `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `adaptive`

    - The output MP4 always includes a stereo audio track (music and sound
    effects follow the prompt; there is no switch to turn it off)

    - Billed per second at \$0.03/s with no extra charge for reference media;
    failed tasks are refunded automatically

    - **Async task endpoint**: this call only submits the task and returns a
    `task_id`; poll `GET /hailuo/v2/query/video_generation/{task_id}` for the
    result


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create a token in the [APIYI
    console](https://api.apiyi.com/token)
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /hailuo/v2/video_generation:
    post:
      tags:
        - Video Generation
      summary: Create a MiniMax-H3 video generation task
      description: >
        Submits an async video generation task. Success only means the task was
        accepted; the response is `{"task_id": "task_..."}`.


        The generation mode is inferred from `content[]`:

        - Text only → text-to-video (`ratio` must be a fixed ratio, not
        `adaptive`)

        - Text + `first_frame` / `last_frame` image → keyframe video

        - Text + `reference_image` / `reference_video` / `reference_audio` →
        reference video; refer to the media in the prompt as `<Picture 1>`,
        `<Video 1>`, `<Audio 1>`


        Rules:

        - `content[]` must contain exactly one text item plus 0–12 media items
        (at most 9 reference images, 3 reference videos, 3 reference audio
        clips)

        - All media must be public HTTPS URLs; Base64, data URIs, and private
        addresses are not supported

        - First/last frames cannot be mixed with `reference_*` media; with more
        than one image, set `role` explicitly

        - Generation typically takes 2–4 minutes; then query `GET
        /hailuo/v2/query/video_generation/{task_id}`
      operationId: createMiniMaxH3VideoGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/H3CreateRequest'
            examples:
              TextToVideo:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: >-
                        A lighthouse by the sea at dusk, slow dolly in, waves
                        crashing on the rocks, cinematic lighting
                  resolution: 768P
                  duration: 5
                  ratio: '16:9'
              FirstFrame:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: >-
                        The character slowly turns and smiles, a light breeze
                        moves the hair, gentle push-in
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/first.png
                      role: first_frame
                  resolution: 768P
                  duration: 5
                  ratio: adaptive
              ReferenceImages:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: >-
                        <Picture 1> and <Picture 2> walk side by side down a
                        rainy street
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/person-a.png
                      role: reference_image
                    - type: image_url
                      image_url:
                        url: https://your-cdn.example.com/person-b.png
                      role: reference_image
                  resolution: 768P
                  duration: 8
                  ratio: adaptive
              ReferenceAudio:
                value:
                  model: MiniMax-H3
                  content:
                    - type: text
                      text: A cinematic dance performance synchronized to <Audio 1>
                    - type: audio_url
                      audio_url:
                        url: https://your-cdn.example.com/music.mp3
                      role: reference_audio
                  resolution: 768P
                  duration: 10
                  ratio: '16:9'
      responses:
        '200':
          description: Task accepted; returns task_id
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/H3CreateResponse'
              example:
                task_id: task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx
        '400':
          description: >-
            Validation failed (duration outside 4–15, invalid ratio, text over
            7000 characters, too many media items, mixed roles, etc.). Not
            billed
        '401':
          description: Unauthorized - invalid API Key
        '500':
          description: >-
            Upstream error (includes some invalid parameters and transient
            overload). Not billed; check the parameters, then retry with backoff
        '503':
          description: >-
            No available channel for the token's group (usually a misspelled
            model name, or the token's group does not include this model)
      security:
        - bearerAuth: []
components:
  schemas:
    H3CreateRequest:
      type: object
      required:
        - model
        - content
        - resolution
        - duration
        - ratio
      properties:
        model:
          type: string
          description: Always `MiniMax-H3` (case-sensitive)
          enum:
            - MiniMax-H3
          default: MiniMax-H3
        content:
          type: array
          description: >
            Exactly one text item plus 0–12 media items. Media item types:

            - `image_url`: role `first_frame` / `last_frame` /
            `reference_image`; up to 9 reference images. A single image without
            `role` is treated as the first frame

            - `video_url`: role `reference_video`; up to 3 clips, MP4/MOV, 50MB
            max, at least 2 seconds each, 15 seconds total at most

            - `audio_url`: role `reference_audio`; up to 3 clips,
            WAV/MP3/M4A/AAC, 15MB max, at least 2 seconds each
          minItems: 1
          maxItems: 13
          items:
            oneOf:
              - $ref: '#/components/schemas/H3TextItem'
              - $ref: '#/components/schemas/H3ImageItem'
              - $ref: '#/components/schemas/H3VideoItem'
              - $ref: '#/components/schemas/H3AudioItem'
        resolution:
          type: string
          description: >-
            Resolution. This channel supports `768P` only (uppercase; `768p` and
            `2K` are rejected)
          enum:
            - 768P
          default: 768P
        duration:
          type: integer
          description: >-
            Output length in seconds, an integer from 4 to 15. Billed per
            second; the finished clip is usually 0.1–0.5 s longer than requested
          minimum: 4
          maximum: 15
          default: 5
        ratio:
          type: string
          description: >
            Aspect ratio and output size: `21:9`=1536×672, `16:9`=1344×768,
            `4:3`=1024×768, `1:1`=768×768, `3:4`=768×1024, `9:16`=768×1344.

            `adaptive` follows the input image's ratio and only works for
            requests with images or videos; text-only and audio-only requests
            need a fixed ratio.
          enum:
            - '16:9'
            - '9:16'
            - '21:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - adaptive
          default: '16:9'
    H3CreateResponse:
      type: object
      properties:
        task_id:
          type: string
          description: Task ID for `GET /hailuo/v2/query/video_generation/{task_id}`
          example: task_Clo9iKPCM46sRwRsMFcmJG6pGNSL1ygx
    H3TextItem:
      type: object
      required:
        - type
        - text
      properties:
        type:
          type: string
          enum:
            - text
        text:
          type: string
          maxLength: 7000
          description: >-
            Video description, 1–7000 characters. Refer to media as `<Picture
            1>` / `<Video 1>` / `<Audio 1>` (numbered by order within each media
            type)
          example: >-
            A lighthouse by the sea at dusk, slow dolly in, waves crashing on
            the rocks, cinematic lighting
    H3ImageItem:
      type: object
      required:
        - type
        - image_url
      properties:
        type:
          type: string
          enum:
            - image_url
        image_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: >-
                Public HTTPS image URL. JPG/PNG/WebP/HEIC/HEIF, 30MB max,
                256–5760 px per side, aspect ratio 0.4–2.5
              example: https://your-cdn.example.com/first.png
        role:
          type: string
          enum:
            - first_frame
            - last_frame
            - reference_image
          description: >-
            First frame / last frame / reference image. First/last frames cannot
            be mixed with reference media
    H3VideoItem:
      type: object
      required:
        - type
        - video_url
        - role
      properties:
        type:
          type: string
          enum:
            - video_url
        video_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: >-
                Public HTTPS video URL. MP4/MOV (H.264/H.265), 50MB max; clips
                longer than 15 s are trimmed to the first 15 s
              example: https://your-cdn.example.com/motion.mp4
        role:
          type: string
          enum:
            - reference_video
    H3AudioItem:
      type: object
      required:
        - type
        - audio_url
        - role
      properties:
        type:
          type: string
          enum:
            - audio_url
        audio_url:
          type: object
          required:
            - url
          properties:
            url:
              type: string
              description: >-
                Public HTTPS audio URL. WAV/MP3/M4A/AAC, 15MB max; clips longer
                than 15 s are trimmed to the first 15 s
              example: https://your-cdn.example.com/music.mp3
        role:
          type: string
          enum:
            - reference_audio
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.