> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Официальный API преобразования изображения в видео

> Официальная справка по API VEO 3.1 для преобразования изображения в видео и интерактивная песочница — multipart-загрузка одного изображения input_reference для анимации статичных визуальных материалов.

<Info>
  Интерактивная песочница справа поддерживает отладку в реальном времени. Укажите свой API-ключ в поле **Authorization** (формат `Bearer sk-xxx`), загрузите опорное изображение, введите prompt, выберите модель / секунды / разрешение, затем отправьте. **`Default` группа работает — отдельный переключатель группы не нужен**.
</Info>

<Tip>
  **Область применения**: Эта страница охватывает «генерацию видео по опорному изображению» — загрузите одно изображение как визуальную опору / стартовый кадр, чтобы анимировать статичный контент. Если вам не нужно опорное изображение, используйте [эндпоинт генерации видео по тексту](/ru/api-capabilities/veo-3-1-official/text-to-video) (тот же эндпоинт, JSON-тело).
</Tip>

<Warning>
  **⚠️ Ограничения image-to-video**

  * **Content-Type должен быть `multipart/form-data`** (не JSON)
  * **Поддерживается только 1 reference image**; имя поля жестко задано как `input_reference`. При отправке нескольких изображений сохраняется только первое
  * **Удаленные URLs не принимаются** — нужна либо загрузка файла, либо Base64
  * Поддерживаемые форматы: `image/jpeg` / `image/png` / `image/webp`
  * **Поле длины называется `seconds` (а не `duration`) и должно быть строкой** `"4"` / `"6"` / `"8"`. Если назвать его `duration`, это будет молча проигнорировано и вернется значение по умолчанию — 4 сек.; передача числа завершится ошибкой
  * **При 1080p / 4k `seconds` должно быть `"8"`**

  Google upstream Veo 3.1 поддерживает multi-reference / first-last-frame / video extension; **этот официальный канал пока не предоставляет их**. Для first/last frame используйте [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` серии.
</Warning>

## Примеры кода

### Python (OpenAI SDK · низкоуровневый client.post)

```python theme={null}
{/* OpenAI SDK has no videos.create method; /v1/videos is a custom path, use low-level client.post() */}
from openai import OpenAI
import time

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Step 1: multipart upload (low-level client.post handles multipart boundary)
with open("./lighthouse.png", "rb") as f:
    resp = client.post(
        "/videos",
        body=None,
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        extra_body={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "Camera slowly rises from the base of the lighthouse to the top, dusk lighting, ocean ambience",
            "seconds": "8",  # must be string
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9"
        },
        cast_to=dict
    )
task_id = resp["task_id"]
print(f"Task ID: {task_id}, status: {resp['status']}")

# Step 2: poll (up to 3 minutes)
deadline = time.time() + 180
while time.time() < deadline:
    s = client.get(f"/videos/{task_id}", cast_to=dict)
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(f"Generation failed: {s}")
    time.sleep(8)

# Step 3: download (with retry)
import urllib.request, urllib.error
time.sleep(4)
for i in range(5):
    try:
        req = urllib.request.Request(
            f"https://api.apiyi.com/v1/videos/{task_id}/content",
            headers={"Authorization": "Bearer sk-your-api-key"}
        )
        with urllib.request.urlopen(req, timeout=180) as r, open("output.mp4", "wb") as f:
            while chunk := r.read(1 << 16):
                f.write(chunk)
        break
    except urllib.error.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### Python (requests + multipart)

```python theme={null}
import requests
import time

API_KEY = "sk-your-api-key"
BASE_URL = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# Step 1: multipart upload of reference image + form fields
with open("./lighthouse.png", "rb") as f:
    resp = requests.post(
        f"{BASE_URL}/videos",
        headers=HEADERS,  # do not set Content-Type manually; requests handles multipart boundary
        data={
            "model": "veo-3.1-fast-generate-preview",
            "prompt": "Camera slowly rises from the base of the lighthouse to the top, dusk lighting, waves lapping the rocks",
            "seconds": "8",  # string, not number
            "size": "1280x720",
            "resolution": "720p",
            "aspectRatio": "16:9",
            "seed": "20260521"
        },
        files={
            "input_reference": ("lighthouse.png", f, "image/png")
        },
        timeout=60  # multipart upload of large images may be slow
    ).json()
task_id = resp["task_id"]
print(f"Task ID: {task_id}")

# Step 2: poll
deadline = time.time() + 180
while time.time() < deadline:
    s = requests.get(f"{BASE_URL}/videos/{task_id}", headers=HEADERS).json()
    print(f"Status: {s['status']}, progress: {s.get('progress', 0)}%")
    if s["status"] == "completed":
        break
    if s["status"] == "failed":
        raise RuntimeError(s)
    time.sleep(8)

# Step 3: download (with 3 retries)
time.sleep(4)
for i in range(5):
    try:
        with requests.get(
            f"{BASE_URL}/videos/{task_id}/content",
            headers=HEADERS, stream=True, timeout=180
        ) as r:
            r.raise_for_status()
            with open("output.mp4", "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        break
    except requests.HTTPError:
        if i == 4:
            raise
        time.sleep(4)
print("Saved: output.mp4")
```

### cURL (multipart-загрузка)

```bash theme={null}
{/* Just want to check/download with an existing task_id? See the "Already have a task_id?" section below */}
{/* Step 1: multipart upload (input_reference uses @ to reference a local file) */}
RESP=$(curl -sS -X POST "https://api.apiyi.com/v1/videos" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=veo-3.1-fast-generate-preview" \
  -F "prompt=Camera slowly rises from the base of the lighthouse to the top, dusk lighting" \
  -F "seconds=8" \
  -F "size=1280x720" \
  -F "resolution=720p" \
  -F "aspectRatio=16:9" \
  -F "input_reference=@./lighthouse.png;type=image/png")
TASK_ID=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["task_id"])')
echo "task_id=$TASK_ID"

{/* Step 2: poll */}
while :; do
  S=$(curl -sS -H "Authorization: Bearer sk-your-api-key" "https://api.apiyi.com/v1/videos/$TASK_ID")
  ST=$(echo "$S" | python3 -c 'import sys,json;print(json.load(sys.stdin)["status"])')
  echo "status=$ST"
  [ "$ST" = "completed" ] && break
  [ "$ST" = "failed" ] && { echo "$S"; exit 1; }
  sleep 8
done

{/* Step 3: download (--retry covers occasional 400 right after status=completed) */}
sleep 4
curl -sSL --retry 3 --retry-delay 4 \
  -H "Authorization: Bearer sk-your-api-key" \
  "https://api.apiyi.com/v1/videos/$TASK_ID/content" \
  -o output.mp4
ls -lh output.mp4
```

### Node.js (нативный fetch + FormData)

```javascript theme={null}
import fs from 'node:fs';
import { FormData, File } from 'undici';

const API_KEY = 'sk-your-api-key';
const BASE_URL = 'https://api.apiyi.com/v1';

// Step 1: multipart upload
const buffer = fs.readFileSync('./lighthouse.png');
const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', 'Camera slowly rises from the base of the lighthouse to the top, dusk lighting');
form.append('seconds', '8');  // string
form.append('size', '1280x720');
form.append('resolution', '720p');
form.append('aspectRatio', '16:9');
form.append('input_reference', new File([buffer], 'lighthouse.png', { type: 'image/png' }));

const submitResp = await fetch(`${BASE_URL}/videos`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` },  // do not set Content-Type manually
    body: form
});
const { task_id } = await submitResp.json();
console.log(`Task ID: ${task_id}`);

// Step 2: poll
let status = 'queued';
while (status !== 'completed' && status !== 'failed') {
    await new Promise(r => setTimeout(r, 8000));
    const s = await (await fetch(`${BASE_URL}/videos/${task_id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    })).json();
    status = s.status;
    console.log(`Status: ${status}, progress: ${s.progress ?? 0}%`);
}

if (status === 'failed') throw new Error('Generation failed');

// Step 3: download (with retry)
await new Promise(r => setTimeout(r, 4000));
let videoBuffer;
for (let i = 0; i < 4; i++) {
    try {
        const resp = await fetch(`${BASE_URL}/videos/${task_id}/content`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        videoBuffer = Buffer.from(await resp.arrayBuffer());
        break;
    } catch (e) {
        if (i === 3) throw e;
        await new Promise(r => setTimeout(r, 4000));
    }
}
fs.writeFileSync('output.mp4', videoBuffer);
console.log('Saved: output.mp4');
```

### JavaScript в браузере (загрузка через input file)

```javascript theme={null}
{/* Demo only; route through a backend proxy in production to avoid Key leakage */}
const fileInput = document.querySelector('input[type=file]');
const file = fileInput.files[0];

const form = new FormData();
form.append('model', 'veo-3.1-fast-generate-preview');
form.append('prompt', 'Animate this scene with a gentle camera push-in and natural ambient sound');
form.append('seconds', '4');
form.append('size', '720x1280');
form.append('resolution', '720p');
form.append('aspectRatio', '9:16');
form.append('input_reference', file);

const submitResp = await fetch('https://api.apiyi.com/v1/videos', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { task_id } = await submitResp.json();
console.log('Task ID:', task_id);

{/* After polling completes, route the /content endpoint through your backend proxy */}
```

## У вас уже есть task\_id? Две команды cURL для копирования и вставки

Если у вас уже есть `task_id` (полученный при отправке задачи или видимый в журналах консоли), просто замените два заполнителя ниже и выполните:

* `sk-your-api-key` → ваш ключ APIYI
* `task_xxxxxxxxxxxxxxxx` → ваш ID задачи

### 1. Проверьте статус задачи

```bash theme={null}
curl "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer sk-your-api-key"
```

Когда в ответе JSON отображается `status: "completed"`, можно скачивать; если отображается `in_progress`, подождите несколько секунд и проверьте еще раз.

### 2. Скачайте видео (сохраняется как output.mp4)

```bash theme={null}
curl -L --retry 3 --retry-delay 4 \
  "https://api.apiyi.com/v1/videos/task_xxxxxxxxxxxxxxxx/content" \
  -H "Authorization: Bearer sk-your-api-key" \
  -o output.mp4
```

<Tip>
  Эндпоинт `/content` требует заголовок `Authorization` — если открыть URL напрямую в адресной строке браузера, возвращается 401. `--retry 3` покрывает редкие 400 сразу после того, как `status` переключается на `completed` (задержка синхронизации CDN).
</Tip>

## Справочник параметров

| Параметр          | Тип        | Обязательно | По умолчанию | Описание                                                                                                                                                                     |
| ----------------- | ---------- | ----------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input_reference` | file       | Да          | —            | Файл референсного изображения. **Имя поля фиксировано, только 1 изображение**, принимает `image/jpeg` / `image/png` / `image/webp`. **Удаленные URL не принимаются**         |
| `model`           | string     | Да          | —            | `veo-3.1-fast-generate-preview` (\$0.3/запрос) или `veo-3.1-generate-preview` (\$1.2/запрос)                                                                                 |
| `prompt`          | string     | Да          | —            | Опишите, как должна анимироваться сцена: движение камеры, действие объекта, освещение, стиль. **Не передавайте `generateAudio`**, намерение для аудио указывается в prompt   |
| `seconds`         | **string** | Нет         | `"8"`        | `"4"` / `"6"` / `"8"`. **Поле `seconds`, а не `duration`** (если назвать его `duration`, это будет тихо проигнорировано и вернется к 4 сек.). **1080p/4k должны быть `"8"`** |
| `size`            | string     | Нет         | `1280x720`   | Выходное разрешение                                                                                                                                                          |
| `resolution`      | string     | Нет         | `720p`       | `720p` / `1080p` / `4k`                                                                                                                                                      |
| `aspectRatio`     | string     | Нет         | `16:9`       | `16:9` (альбомная ориентация) / `9:16` (портретная ориентация)                                                                                                               |
| `seed`            | int        | Нет         | —            | Случайное seed-значение (поле multipart form; число в виде строки тоже подходит)                                                                                             |

<Tip>
  **Разница в именовании полей по сравнению с JSON mode**:

  * В JSON mode они вложены под `metadata.*` (например, `metadata.resolution`)
  * **Multipart mode** делает их плоскими form fields (`resolution` / `aspectRatio` / `seed` напрямую)
  * Приведенные выше примеры кода уже используют соглашения multipart
</Tip>

<Warning>
  **Распространенные ошибки**:

  * Отправка `input_reference` как строки Base64 внутри JSON body — нужно использовать multipart file field
  * Название поля `image` / `reference` / `input_image` — должно быть точно `input_reference`
  * Отправка 2 изображений — сервер сохраняет только первое, второе незаметно отбрасывается
  * Отправка удаленного URL (`https://cdn.../img.png`) — не принимается; должен быть файл или Base64
</Warning>

## Формат ответа

Структура ответа идентична [Text-to-Video](/ru/api-capabilities/veo-3-1-official/text-to-video#response-format): Шаг 1 возвращает `task_id` + `status: "queued"`, опрос на шаге 2 возвращает `status` + приблизительный `progress`, Шаг 3 загружает бинарный MP4 из `/content`.

```json theme={null}
{
  "id": "task_xxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "veo-3.1-fast-generate-preview",
  "status": "queued",
  "progress": 0,
  "created_at": 1775025000
}
```

<Warning>
  **⚠️ Особенности полей ответа**

  * `task_id` соответствует `id`; последующим системам следует стандартизировать использование `task_id`
  * **Поля `video_url` нет**; загружайте из `GET /v1/videos/{task_id}/content`
  * `progress` меняется только между 0 / 50 / 100, а не линейно
  * `/content` иногда возвращает 400 сразу после того, как `status` переключается на `completed`; повторите через 4 сек
  * **Задачи image-to-video обычно занимают на 10–30% больше времени**, чем эквивалентные задачи text-to-video (дополнительный шаг кодирования изображения)
</Warning>

<Info>
  Этот endpoint — асинхронная точка входа для задачи. **Тарификация происходит, когда задача достигает `completed`, и взимается за запрос по имени модели** (независимо от того, указан ли `input_reference`; быстрый \$0.3 / стандартный \$1.2). Отправка POST, опрос и загрузка сами по себе **не тарифицируются**; неудачные задачи также **не тарифицируются**.
</Info>


## OpenAPI

````yaml api-reference/veo-3-1-official-image-to-video-openapi-en.yaml POST /v1/videos
openapi: 3.1.0
info:
  title: VEO 3.1 Official Image-to-Video API
  description: >
    Google Veo 3.1 image-to-video endpoint (Official Relay channel,
    multipart/form-data upload of `input_reference`).


    - **Only 1 reference image supported**; field name is fixed as
    `input_reference`; multi-image submissions keep only the first

    - Accepted formats: `image/jpeg` / `image/png` / `image/webp`

    - **Remote URLs not accepted** — must be file upload or Base64

    - The duration field is named `seconds` (not `duration`); it must be a
    string `"4"` / `"6"` / `"8"`; 1080p/4k must be `"8"`

    - Same per-request price as text-to-video (per model name); image upload
    does not add cost

    - **Async task endpoint**: this endpoint only submits the task; combine with
    `GET /v1/videos/{task_id}` to poll and `GET /v1/videos/{task_id}/content` to
    download

    - **Multipart mode flattens fields**: fields nested under `metadata.*` in
    JSON mode (e.g. `metadata.resolution`) become top-level form fields in
    multipart mode (`resolution`, `aspectRatio`, `seed`)

    - Google upstream has multi-reference / first-last-frame / video extension
    capabilities; **this Official channel does not yet expose them** — use the
    [VEO 3.1 (Reverse)](/en/api-capabilities/veo/overview) `-fl` series for
    first/last frame


    **Authentication**: include `Authorization: Bearer YOUR_API_KEY` in the
    request header


    **API Key configuration**: **`Default` group works — no dedicated group
    switch needed**; the Token must use **Pay-per-request** or **Pay-as-you-go
    Priority** billing mode (pure **Pay-as-you-go is not supported**)


    **Get an API Key**: visit the [APIYI console](https://api.apiyi.com/token)
    to create a Token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/videos:
    post:
      tags:
        - Video Generation
      summary: 'Image-to-video: submit a generation task from a reference image'
      description: >
        Submit a Veo 3.1 image-to-video task. The client must use
        multipart/form-data with 1 reference image file + text fields.


        - Required: `model`, `prompt`, `input_reference`

        - Optional: `seconds` (default `"8"`, the duration field — not
        `duration`), `size` / `resolution` / `aspectRatio` / `seed`

        - Response structure, polling, and download flow are identical to
        text-to-video

        - Typical render time is 10–30% longer than equivalent text-to-video
        (extra image encoding step)
      operationId: generateVeo31OfficialImageToVideo
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/Veo31ImageToVideoRequest'
            example:
              model: veo-3.1-fast-generate-preview
              prompt: >-
                Camera slowly rises from the base of the lighthouse to the top,
                dusk lighting, waves lapping the rocks
              seconds: '8'
              size: 1280x720
              resolution: 720p
              aspectRatio: '16:9'
      responses:
        '200':
          description: Task submitted; returns task_id and queued status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Veo31VideoTask'
        '400':
          description: >-
            Invalid parameter (seconds as number; field misnamed as duration;
            non-8-sec at 1080p/4k; unsupported image format; etc.)
        '401':
          description: Unauthorized - invalid API Key
        '413':
          description: Uploaded image too large
        '429':
          description: Rate limit or insufficient balance
        '500':
          description: Upstream gateway error; retry 1–2 times (failed tasks not billed)
      security:
        - bearerAuth: []
components:
  schemas:
    Veo31ImageToVideoRequest:
      type: object
      required:
        - model
        - prompt
        - input_reference
      properties:
        model:
          type: string
          description: |
            Model ID (per-request billing):
            - `veo-3.1-fast-generate-preview` — \$0.3/request
            - `veo-3.1-generate-preview` — \$1.2/request
          enum:
            - veo-3.1-fast-generate-preview
            - veo-3.1-generate-preview
          default: veo-3.1-fast-generate-preview
        prompt:
          type: string
          description: >
            Video generation prompt. **Focus on how the scene should animate**:
            camera motion, object action, lighting, audio atmosphere. **Do not
            pass `generateAudio`** — audio intent goes in the prompt.
          example: >-
            Camera slowly rises from the base of the lighthouse to the top, dusk
            lighting, waves lapping the rocks
        input_reference:
          type: string
          format: binary
          description: >
            Reference image file. **Field name is fixed as `input_reference`,
            only 1 image supported**.


            Accepted formats: `image/jpeg` / `image/png` / `image/webp`.
            **Remote URLs not accepted** — must be a file upload or Base64.
        seconds:
          type: string
          description: >
            Video length. **The field name is `seconds` (not `duration`)**, a
            **string enum**: `"4"` / `"6"` / `"8"`. Sending `duration` is
            silently ignored and falls back to the default 4 sec. **Must be
            `"8"` at 1080p / 4k**.
          enum:
            - '4'
            - '6'
            - '8'
          default: '8'
        size:
          type: string
          description: Output pixel dimensions; lower precedence than `resolution`
          enum:
            - 1280x720
            - 720x1280
            - 1920x1080
            - 1080x1920
            - 3840x2160
            - 2160x3840
          default: 1280x720
        resolution:
          type: string
          description: >-
            Resolution tier (multipart mode flattens this as a top-level form
            field; higher precedence than `size`)
          enum:
            - 720p
            - 1080p
            - 4k
          default: 720p
        aspectRatio:
          type: string
          description: 'Aspect ratio: `16:9` landscape (default) or `9:16` portrait'
          enum:
            - '16:9'
            - '9:16'
          default: '16:9'
        seed:
          type: string
          description: >-
            Random seed (multipart form field; string-encoded number is fine).
            Fixed seed clusters outputs in style but does not byte-reproduce.
          example: '20260521'
        negativePrompt:
          type: string
          description: >-
            Negative prompt; recommended `"blurry, watermark, distorted, low
            quality"`
          example: blurry, watermark, distorted, low quality
    Veo31VideoTask:
      type: object
      properties:
        id:
          type: string
          description: >-
            Task ID (matches `task_id`; downstream should standardize on
            `task_id`)
          example: task_xxxxxxxxxxxxxxxx
        task_id:
          type: string
          description: Task ID for subsequent polling and download
          example: task_xxxxxxxxxxxxxxxx
        object:
          type: string
          description: Object type, fixed to `video`
          example: video
        model:
          type: string
          description: Model ID used for this task
          example: veo-3.1-fast-generate-preview
        status:
          type: string
          description: |
            Task status:
            - `queued` — submitted, awaiting processing
            - `in_progress` — generating
            - `completed` — done, downloadable (`/v1/videos/{task_id}/content`)
            - `failed` — failed (**not billed**), retry possible
          enum:
            - queued
            - in_progress
            - completed
            - failed
          example: queued
        progress:
          type: integer
          description: >-
            Generation progress (coarse-grained, **jumps only between 0 / 50 /
            100**)
          example: 0
        created_at:
          type: integer
          description: Task creation Unix timestamp (seconds)
          example: 1775025000
        completed_at:
          type: integer
          description: >-
            Task completion Unix timestamp (seconds); only present for completed
            status
          example: 1775025090
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API Key from APIYI console (Default group + Pay-per-request or
        Pay-as-you-go Priority Token; pure Pay-as-you-go not supported)

````