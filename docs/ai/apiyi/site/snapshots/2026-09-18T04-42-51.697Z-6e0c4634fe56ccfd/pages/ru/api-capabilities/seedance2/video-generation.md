> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API генерации видео Seedance 2.0 / 2.5

> Справочник API генерации видео Seedance 2.0 и 2.5 с интерактивной песочницей: видео из текста, первый+последний/первый кадр, мультимодальные референсы, редактирование и расширение видео в одном асинхронном эндпоинте, а также полный код для опроса статуса и скачивания.

<Info>
  Используйте Playground справа: установите для **Authorization** значение `Bearer sk-your-api-key` (токену нужна группа `SeeDance2`, общая для версии 2.5 и семейства 2.0), заполните `model` / `content` и отправьте запрос. При успешной отправке возвращается `id` задачи; процессы опроса и скачивания описаны в приведённых ниже примерах кода.
</Info>

<Warning>
  **Об ошибке Playground «ответ не получен»**: это эндпоинт асинхронных задач, и при нажатии «Отправить» в браузере может появиться такое сообщение — междоменная проверка безопасности браузера заблокировала ответ, но **задача была успешно отправлена** (проверьте это через приведённый ниже эндпоинт запроса или в журналах консоли). Playground также может только создать задачу; он не поддерживает опрос состояния или скачивание видео. Чтобы выполнить полный процесс создания → опроса → скачивания, скопируйте и запустите приведённые ниже **примеры кода** (cURL / Python / Node.js).
</Warning>

<Tip>
  Это эндпоинт создания задачи для Seedance 2.0. Для преобразования текста в видео, создания видео по первому и последнему кадру / первому кадру, а также преобразования мультимодальных референсов в видео используется один и тот же эндпоинт — режим выбирается с помощью массива `content`. Информацию о выборе модели, ценах, таблице разрешений и количества пикселей, а также ответы на часто задаваемые вопросы см. в разделе [Обзор Seedance 2.0](/ru/api-capabilities/seedance2/overview).
</Tip>

<Warning>
  * Префикс пути — `/seedance/api/v3` — **не удаляйте сегмент `/api`** и не используйте `/v1/videos`
  * Для токена должна быть включена группа `SeeDance2`, иначе появится ошибка «для этой модели нет доступного канала»: **2.5 и семейство 2.0 используют `SeeDance2`**, поэтому один токен предоставляет доступ ко всем четырём моделям (для `mini` / `fast` также доступны льготные `SD2Mini` / `SD2Fast`)
  * `generate_audio` **по умолчанию имеет значение true** (в выходном видео есть звук) — явно передайте `false` для видео без звука
  * Для Python requests требуется заголовок `"Accept-Encoding": "identity"` — без него может возникнуть ошибка декодирования gzip, усечённое тело, не являющееся JSON (например, теряется начальный `{"` и остаётся только `id":"cgt-xxx"}`), или периодические ошибки 400
  * Статус успешного выполнения — `succeeded` (а не `completed`); URL видео находится в `content.video_url` и **истекает через 24 часа**
</Warning>

## Примеры кода

<CodeGroup>
  ```bash cURL (текст в видео) theme={null}
  curl -X POST "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
        {"type": "text", "text": "Drone shot flying over an autumn valley, golden forests and a winding river, cinematic"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      "generate_audio": false
    }'
  # Returns {"id":"cgt-2026xxxx-xxxxx"} — poll the query endpoint with this id
  ```

  ```python Python (полный процесс: создание → проверка статуса → скачивание) theme={null}
  import time
  import requests

  BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  HEADERS = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      # Required: the gateway's gzip header does not match the actual encoding.
      # Without this you may get gzip decode errors, a truncated non-JSON body
      # (e.g. id":"cgt-xxx"} with the leading {" lost), or intermittent 400s
      "Accept-Encoding": "identity",
  }

  # 1. Create the task
  body = {
      "model": "doubao-seedance-2-0-fast-260128",
      "content": [
          {"type": "text", "text": "Waves crashing on rocks at sunset, slow motion, serene mood"}
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
      # "generate_audio": False,  # defaults to True; uncomment for silent video
      # "seed": 12345,            # fix the seed for similar, reproducible results
  }
  task_id = requests.post(BASE, json=body, headers=HEADERS, timeout=60).json()["id"]
  print("task_id:", task_id)

  # 2. Poll until a terminal state (succeeded / failed / expired)
  while True:
      time.sleep(20)
      task = requests.get(f"{BASE}/{task_id}", headers=HEADERS, timeout=30).json()
      status = task.get("status")
      print("status:", status)
      if status in ("succeeded", "failed", "expired"):
          break

  # 3. Download the video (the URL expires in 24 h — copy it out immediately)
  if status == "succeeded":
      video_url = task["content"]["video_url"]   # note: under content, not top-level
      print("tokens:", task["usage"]["completion_tokens"])
      with requests.get(video_url, stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(f"{task_id}.mp4", "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print(f"saved {task_id}.mp4")
  else:
      print("task did not succeed:", task.get("error"))
  ```

  ```python Python (режимы первого и последнего кадра / референса) theme={null}
  # First + last frame: 2 images, roles required; mutually exclusive with reference mode
  body_first_last = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "Smooth transition from the first frame to the last, slow camera move"},
          {"type": "image_url", "image_url": {"url": "https://example.com/first.jpg"},
           "role": "first_frame"},
          {"type": "image_url", "image_url": {"url": "https://example.com/last.jpg"},
           "role": "last_frame"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",   # match the first frame's ratio to avoid cropping
      "duration": 5,
  }

  # Multi-modal reference: 0-9 reference images + 0-3 reference videos + 0-3 reference audios
  # (at least 1 image or 1 video); can create / edit / extend videos
  body_reference = {
      "model": "doubao-seedance-2-0-260128",
      "content": [
          {"type": "text", "text": "Using the reference character and style, the character walks down a rainy street at night"},
          {"type": "image_url", "image_url": {"url": "https://example.com/character.png"},
           "role": "reference_image"},
          # {"type": "video_url", "video_url": {"url": "..."}, "role": "reference_video"},
          # {"type": "audio_url", "audio_url": {"url": "..."}, "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # Images also accept Base64 (data:image/png;base64,xxx) and platform asset IDs (asset://xxx)
  ```

  ```python Python (Seedance 2.5: 30-секундные клипы / редактирование видео / расширение видео) theme={null}
  # 2.5 shares the endpoint and request shape with 2.0 — only `model` changes.
  # The four bodies below are capabilities unique to 2.5.

  # 1. 30-second clip: 2.5 caps at 30 s (the 2.0 family caps at 15)
  body_30s = {
      "model": "doubao-seedance-2-5-260628",
      "content": [{"type": "text", "text": "Drone shot flying over an autumn valley, morning mist drifting through the trees, one continuous take"}],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 30,        # Do not omit: on 2.5 the default is -1 and the model picks its own length
  }

  # 2. Video editing: ratio must be adaptive, duration must be -1, source video 4-30 s
  body_edit = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # The prompt needs an editing verb: add / remove / delete / change / replace
          {"type": "text", "text": "Add a few birds flying across @video1"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",                    # Required; a concrete ratio returns a synchronous 400
      "duration": -1,                         # Required; a concrete duration returns a synchronous 400
      "omni_reference_task_type": "edit",     # Declare it to validate at submission time
      "output_format": "mov",                 # Optional: mov is recommended for post (some players cannot open it)
  }

  # 3. Video extension: ratio must be adaptive
  body_extend = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          # The prompt needs an extension verb: extend / continue
          {"type": "text", "text": "Extend @video1 forward, camera keeps pushing in as the light fades"},
          {"type": "video_url", "video_url": {"url": "https://example.com/source.mp4"},
           "role": "reference_video"},
      ],
      "resolution": "720p",
      "ratio": "adaptive",
      "omni_reference_task_type": "extend",
  }

  # 4. Audio-only reference: unique to 2.5; the 2.0 family requires an image or video alongside audio
  body_audio_only = {
      "model": "doubao-seedance-2-5-260628",
      "content": [
          {"type": "text", "text": "Abstract light and shadow pulsing to the rhythm of @audio1"},
          {"type": "audio_url", "audio_url": {"url": "https://example.com/track.mp3"},
           "role": "reference_audio"},
      ],
      "resolution": "720p",
      "ratio": "16:9",
      "duration": 5,
  }
  # Submission and polling are identical to the flow above.
  ```

  ```javascript Node.js (fetch) theme={null}
  const BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const HEADERS = {
    "Authorization": "Bearer sk-your-api-key",
    "Content-Type": "application/json",
  };

  // 1. Create the task
  const { id } = await fetch(BASE, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-fast-260128",
      content: [{ type: "text", text: "A mountain lake reflecting the starry sky, time-lapse" }],
      resolution: "720p",
      ratio: "9:16",        // portrait costs the same as landscape
      duration: 5,
    }),
  }).then(r => r.json());
  console.log("task_id:", id);

  // 2. Poll until a terminal state
  let task;
  do {
    await new Promise(r => setTimeout(r, 20000));
    task = await fetch(`${BASE}/${id}`, { headers: HEADERS }).then(r => r.json());
    console.log("status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 3. The video link (expires in 24 h — re-host immediately)
  if (task.status === "succeeded") console.log(task.content.video_url);
  ```

  ```bash cURL (проверка статуса задачи) theme={null}
  curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx" \
    -H "Authorization: Bearer sk-your-api-key"
  ```
</CodeGroup>

## Справочник параметров

| Параметр                   | Тип    | Обязательный | По умолчанию                    | Примечания                                                                                                                                                                                                                                                                                                    |
| -------------------------- | ------ | ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`                    | string | ✓            | —                               | `doubao-seedance-2-5-260628` (**2.5, рекомендуется** — 1080p, до 30 с) / `doubao-seedance-2-0-260128` (стандартный, 1080p) / `doubao-seedance-2-0-fast-260128` (быстрый, до 720p) / `doubao-seedance-2-0-mini-260615` (mini/lite, до 720p, примерно половина стандартной цены). Только ID, без префикса `ep-` |
| `content`                  | array  | ✓            | —                               | Входной массив — см. раздел «Режимы генерации» ниже                                                                                                                                                                                                                                                           |
| `resolution`               | string |              | `720p`                          | `480p` / `720p` / `1080p` (1080p поддерживается только в 2.5 и стандартной версиях; быстрая и mini-версии ограничены 720p). **Ни одна модель не поддерживает `4k`**                                                                                                                                           |
| `ratio`                    | string |              | `adaptive`                      | `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9` / `adaptive`; все соотношения сторон в рамках одного уровня стоят одинаково                                                                                                                                                                                  |
| `duration`                 | int    |              | `-1` в 2.5, `5` в семействе 2.0 | Целое число секунд **4–30** в 2.5, 4–15 в семействе 2.0; `-1` позволяет модели выбрать длительность (тарификация выполняется по фактическому результату). **В 2.5 значение по умолчанию — `-1`** — если не указать его, модель выберет длительность, изменив итоговую стоимость                               |
| `generate_audio`           | bool   |              | `true`                          | Синхронизированный звук (голос/SFX/музыка, моно)                                                                                                                                                                                                                                                              |
| `watermark`                | bool   |              | `false`                         | Добавляет водяной знак, сгенерированный AI                                                                                                                                                                                                                                                                    |
| `seed`                     | int    |              | `-1`                            | \[-1, 2^32-1]; одинаковое начальное значение даёт похожие (но не идентичные) результаты                                                                                                                                                                                                                       |
| `return_last_frame`        | bool   |              | `false`                         | Возвращает PNG последнего кадра без водяного знака для объединения клипов                                                                                                                                                                                                                                     |
| `execution_expires_after`  | int    |              | `172800`                        | Порог истечения срока действия задачи в секундах, диапазон \[3600, 259200]                                                                                                                                                                                                                                    |
| `output_format`            | string |              | `mp4`                           | **Только 2.5**: `mp4` (универсальный) или `mov` (QuickTime, H.264 + yuv444p + PCM — более высокая точность цветопередачи для постобработки; некоторые проигрыватели не могут его открыть)                                                                                                                     |
| `omni_reference_task_type` | string |              | `auto`                          | **Только 2.5**: `auto` / `edit` (редактирование видео) / `extend` (расширение видео). Явное указание перемещает проверку ограничений **на момент отправки**, поэтому вы сразу получаете ошибку 400 вместо задачи, которая завершится с ошибкой через несколько минут                                          |

<Warning>
  Ни Seedance 2.5, ни семейство 2.0 не поддерживают `frames` или `camera_fixed` — это параметры Seedance 1.x, которые будут проигнорированы или отклонены.

  **Ограничения типов задач, уникальные для 2.5** (при нарушении возвращается `InvalidParameter.TaskTypeConstraint` во время отправки; тарификация не выполняется):

  | Тип задачи                             | `ratio`                    | `duration`                                                   |
  | -------------------------------------- | -------------------------- | ------------------------------------------------------------ |
  | Текст-видео / референс-видео           | без ограничений            | без ограничений                                              |
  | Первый кадр / первый и последний кадры | **должно быть `adaptive`** | без ограничений                                              |
  | Редактирование видео                   | **должно быть `adaptive`** | **должно быть `-1`**, а исходное видео должно длиться 4–30 с |
  | Расширение видео                       | **должно быть `adaptive`** | без ограничений                                              |
</Warning>

### Режимы генерации (комбинации содержимого)

| Режим                                 | элементы содержимого                                                                                                                                                                     | значения role                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Текст-видео                           | 1 `text`                                                                                                                                                                                 | —                                                         |
| Первый и последний кадры              | необязательный текст + 2 `image_url`                                                                                                                                                     | обязательно: `first_frame` / `last_frame`                 |
| Первый кадр                           | необязательный текст + 1 `image_url`                                                                                                                                                     | `first_frame` или не указывается                          |
| Мультимодальное референс-видео        | текст + референсные ресурсы (2.5: до 30 `image_url` + 10 `video_url` + 10 `audio_url`; семейство 2.0: 0–9 изображений + 0–3 видео + 0–3 аудиозаписи, не менее 1 изображения или 1 видео) | `reference_image` / `reference_video` / `reference_audio` |
| Редактирование видео (**только 2.5**) | текст с глаголом редактирования + не менее 1 `video_url`                                                                                                                                 | `reference_video`, с `omni_reference_task_type: "edit"`   |
| Расширение видео (**только 2.5**)     | текст с глаголом расширения + не менее 1 `video_url`                                                                                                                                     | `reference_video`, с `omni_reference_task_type: "extend"` |

Три режима работы с изображениями **взаимоисключающие**. Для изображений поддерживаются общедоступные URL, Base64 (`data:image/png;base64,...`) и ID ресурсов (`asset://...`). Входные данные, содержащие лица реальных людей, отклоняются. Пример кода для сквозной работы со ссылками на ресурсы (загрузка → `asset://` → генерация → скачивание) см. в [руководстве по ссылкам на ресурсы](/ru/api-capabilities/seedance2/asset-reference).

**Встраивание больших медиафайлов замедляет создание задачи.** Время загрузки полезных данных Base64 или получения больших изображений по URL полностью приходится на фазу отправки, из-за чего вызов create-task может занимать около секунды, десятки секунд или завершаться по тайм-ауту чтения на стороне клиента. Если запрос содержит изображения или видео, сначала загрузите медиафайлы и укажите их как ID ресурса `asset://`: см. [процесс с предварительной загрузкой ресурсов](/ru/api-capabilities/seedance2/asset-first-workflow).

**Ограничения на референсные материалы зависят от режима генерации**: 2.5 принимает 30 изображений + 10 видео + 10 аудиоклипов, и **аудио может быть единственным референсным материалом**; семейство 2.0 принимает 9 изображений + 3 видео + 3 аудиоклипа, причём аудио необходимо отправлять как минимум с одним изображением или видео.

**Редактирование и расширение определяются намерением промпта** — `omni_reference_task_type` лишь переносит проверку на более ранний этап. Ссылайтесь на ресурсы в промпте по позициям (`@video1`, `@image1`) в том порядке, в котором они были переданы; для редактирования нужен такой глагол, как add / remove / change / replace, а для расширения — extend / continue. Если тип задачи, определённый моделью по промпту, противоречит указанному вами типу, задача асинхронно завершается с ошибкой `InvalidParameter.TaskTypeMismatch`.

## Формат ответа

Создание возвращает только идентификатор задачи (**не видео**):

```json theme={null}
{ "id": "cgt-20260606160057-6bbjd" }
```

Получив `id`, опрашивайте `GET /seedance/api/v3/contents/generations/tasks/{id}` для получения статуса задачи.

### Рекомендуемая периодичность опроса

| Пункт           | Рекомендация                                                                 | Почему                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Первая проверка | Через **20–30 с** после отправки                                             | Любой более ранний запрос гарантированно вернёт `queued` — это бесполезный запрос                                       |
| Интервал опроса | Каждые **10–20 с**                                                           | Генерация занимает несколько минут; опрос с интервалом менее секунды ничего не даёт и может привести к лимитам запросов |
| Тайм-аут        | Считайте отсутствие терминального состояния в течение **10 минут** аномалией | В периоды пиковой очереди увеличьте до 15 минут или используйте `execution_expires_after` в качестве запасного варианта |

Измеренная сквозная задержка (включая ожидание в очереди). Семейство 2.0 при 720p: около **90–140 с** для 5-секундного клипа, **170 с** для 15 секунд. 2.5: около **150 с** при 720p/5 с, **330 с** при 720p/30 с, **150 с** при 1080p/5 с. Более высокое разрешение и большая длительность требуют больше времени, а очередь в пиковые часы дополнительно увеличивает задержку. В примерах кода ниже используется фиксированный интервал в 20 секунд — этого достаточно при предсказуемом числе запросов.

Успешная задача выглядит так (реальный пример из наших тестов):

```json theme={null}
{
  "id": "cgt-20260606160057-6bbjd",
  "model": "doubao-seedance-2-0-fast-260128",
  "status": "succeeded",
  "content": {
    "video_url": "https://ark-acg-cn-beijing.tos-cn-beijing.volces.com/....mp4?X-Tos-Expires=86400&..."
  },
  "usage": { "completion_tokens": 108900, "total_tokens": 108900 },
  "created_at": 1780732857,
  "updated_at": 1780732991,
  "seed": 97151,
  "resolution": "720p",
  "ratio": "16:9",
  "duration": 5,
  "framespersecond": 24,
  "generate_audio": true,
  "draft": false
}
```

<Warning>
  * URL видео находится в **`content.video_url`**, а не на верхнем уровне; это подписанная ссылка, срок действия которой **истекает через 24 часа** — скачайте файл сразу
  * Машина состояний: `queued → running → succeeded / failed / expired`; успешное состояние — **`succeeded`**
  * Скачивайте по ссылке обычным GET — **не отправляйте заголовок `Authorization`** на подписанный URL
</Warning>

<Info>
  `usage.completion_tokens` — это количество token, учитываемое при тарификации; оно соответствует `tokens ≈ duration × width × height × 24 / 1024` (с точностью до 0,1% в наших тестах). При использовании `duration: -1` или `ratio: adaptive` фактическая длительность и соотношение указываются в полях ответа `duration` / `ratio`.
</Info>


## OpenAPI

````yaml api-reference/seedance2-video-openapi-en.yaml POST /seedance/api/v3/contents/generations/tasks
openapi: 3.1.0
info:
  title: Seedance 2.0 Video Generation API
  description: >
    ByteDance Seedance 2.0 video generation (official Volcengine Mainland China
    resource).


    Capabilities:

    - Text-to-video / image-to-video (first+last frame, first frame) /
    multi-modal reference-to-video (0-9 reference images + 0-3 reference videos
    + 0-3 reference audios, at least 1 image or 1 video)

    - Resolutions 480p / 720p / 1080p (fast model caps at 720p), 6 aspect ratios
    plus adaptive; all ratios in the same tier share the same pixel area and
    price

    - Duration 4-15 s (or -1 for model-chosen length), fixed 24 fps,
    synchronized audio ON by default (generate_audio defaults to true)

    - Async task flow: create returns a task id, poll GET
    /seedance/api/v3/contents/generations/tasks/{id} until succeeded, then
    download from content.video_url (expires in ~24 hours)


    Authentication: Bearer Token (Pay-as-you-go Priority billing model; the
    Token needs the matching group: SeeDance25 for 2.5, SeeDance2 for the 2.0
    family).

    Get your key from the APIYI console → Token management.
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /seedance/api/v3/contents/generations/tasks:
    post:
      tags:
        - Video Generation
      summary: Create a Seedance 2.0 video generation task
      description: >
        Async endpoint: returns a task `id` immediately — **not the video
        itself**.


        - Required: `model` + `content` (text only, text+images,
        text+images+video+audio, etc.)

        - The three image modes are mutually exclusive: first+last frame (2
        images, role required) / first frame (1 image) / multi-modal
        reference-to-video (0-9 images + 0-3 videos + 0-3 audios, at least 1
        image or 1 video, image role = reference_image)

        - Inputs containing real human faces are rejected; audio must be sent
        together with at least one image or video

        - `frames` / `camera_fixed` are NOT supported (Seedance 1.x only)

        - Billing is pre-charged on submit and settled on completion; rejected
        requests are not billed


        After creation, poll `GET
        /seedance/api/v3/contents/generations/tasks/{id}`.

        Status flow: `queued → running → succeeded / failed / expired`.

        On success, download the mp4 from `content.video_url` (expires in ~24
        hours).

        See the "Seedance 2.0 Overview" doc for details.
      operationId: createSeedance2VideoTaskEn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Seedance2CreateTaskRequest'
            example:
              model: doubao-seedance-2-5-260628
              content:
                - type: text
                  text: >-
                    Drone shot flying over an autumn valley, golden forests and
                    a winding river, cinematic
              resolution: 720p
              ratio: '16:9'
              duration: 5
              generate_audio: false
      responses:
        '200':
          description: Task created. Returns the task ID for polling
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Seedance2TaskCreated'
              example:
                id: cgt-20260606160057-6bbjd
        '400':
          description: >-
            InvalidParameter — e.g. 1080p with the fast model, duration outside
            4-15, or an unsupported ratio. The error message names the offending
            parameter; not billed
        '401':
          description: Unauthorized - invalid API key
        '403':
          description: Content moderation rejection (real human faces, policy violations)
        '429':
          description: Rate limited or insufficient quota
        '500':
          description: Internal server error
      security:
        - bearerAuth: []
components:
  schemas:
    Seedance2CreateTaskRequest:
      type: object
      required:
        - model
        - content
      properties:
        model:
          type: string
          description: >-
            Model ID (plain ID, no ep- prefix). 2.5 supports 1080p, 4-30 s, and
            up to 30 images + 10 videos + 10 audio clips as references; 2.0
            standard supports 1080p; fast and mini cap at 720p, with mini at
            about half the standard price. No model supports 4k
          enum:
            - doubao-seedance-2-5-260628
            - doubao-seedance-2-0-260128
            - doubao-seedance-2-0-fast-260128
            - doubao-seedance-2-0-mini-260615
          example: doubao-seedance-2-5-260628
        content:
          type: array
          description: >-
            Input array. Text-to-video: a single text item. Image-to-video: add
            image_url items (role: first_frame / last_frame). Multi-modal
            reference-to-video: image_url items (role: reference_image) plus
            optional video_url / audio_url. Reference limits: 2.5 allows 30
            images + 10 videos + 10 audio clips and audio may stand alone; the
            2.0 family allows 9 images + 3 videos + 3 audio clips and needs at
            least 1 image or 1 video. The three image modes are mutually
            exclusive
          items:
            type: object
            properties:
              type:
                type: string
                description: Content type
                enum:
                  - text
                  - image_url
                  - video_url
                  - audio_url
                example: text
              text:
                type: string
                description: >-
                  Prompt (required when type=text). Up to ~1000 English words;
                  put spoken lines in double quotes to improve generated
                  voice-over
                example: Waves crashing on rocks at sunset, slow motion, serene mood
              image_url:
                type: object
                description: >-
                  Image object (required when type=image_url). Accepts public
                  URL, Base64 (data:image/png;base64,...), or asset ID
                  (asset://...). Formats jpeg/png/webp/bmp/tiff/gif/heic/heif;
                  aspect ratio (0.4, 2.5); sides (300, 6000) px; under 30 MB
                  each. Real human faces are not allowed
                properties:
                  url:
                    type: string
                    description: Image URL / Base64 / asset:// ID
                    example: https://example.com/first.jpg
              video_url:
                type: object
                description: >-
                  Reference video object (required when type=video_url);
                  multi-modal reference mode only
                properties:
                  url:
                    type: string
                    description: Video URL
              audio_url:
                type: object
                description: >-
                  Reference audio object (required when type=audio_url).
                  wav/mp3, 2-15 s per clip, up to 3 clips and 15 s total; must
                  accompany at least one image or video
                properties:
                  url:
                    type: string
                    description: Audio URL
              role:
                type: string
                description: >-
                  Media role. Required for first+last frame
                  (first_frame/last_frame); optional for a single first frame;
                  reference media use reference_*
                enum:
                  - first_frame
                  - last_frame
                  - reference_image
                  - reference_video
                  - reference_audio
        resolution:
          type: string
          description: >-
            Resolution tier (defines pixel area — every ratio in a tier costs
            the same). 1080p is available on 2.5 and 2.0 standard only; fast and
            mini cap at 720p. No model supports 4k
          enum:
            - 480p
            - 720p
            - 1080p
          default: 720p
        ratio:
          type: string
          description: >-
            Aspect ratio. adaptive auto-fits the input (recommended for
            image-to-video to avoid cropping); the actual ratio is returned in
            the task's ratio field
          enum:
            - '16:9'
            - '4:3'
            - '1:1'
            - '3:4'
            - '9:16'
            - '21:9'
            - adaptive
          default: adaptive
        duration:
          type: integer
          description: >-
            Video length in whole seconds: 4-30 on 2.5, 4-15 on the 2.0 family;
            or -1 to let the model choose (billed by actual output). Cost scales
            linearly with duration. Note the default is -1 on 2.5 and 5 on the
            2.0 family
          default: 5
          example: 5
        generate_audio:
          type: boolean
          description: >-
            Generate synchronized audio (voice, SFX, background music; mono).
            Note it DEFAULTS TO TRUE — pass false explicitly for silent video
          default: true
        watermark:
          type: boolean
          description: Add an AI-generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: >-
            Random seed, [-1, 2^32-1]. The same seed produces similar (not
            identical) results; -1 means random
          default: -1
        return_last_frame:
          type: boolean
          description: >-
            Return the last frame as a watermark-free png (same dimensions as
            the video) — chain it as the first frame of the next task to produce
            continuous multi-clip videos
          default: false
        execution_expires_after:
          type: integer
          description: >-
            Task expiry threshold in seconds; tasks exceeding it are marked
            expired. Range [3600, 259200]
          default: 172800
        output_format:
          type: string
          description: >-
            Output container, supported on doubao-seedance-2-5-260628 only. mov
            is a QuickTime container (H.264 + yuv444p + PCM) with better colour
            fidelity for post-production, but some players cannot open it
          enum:
            - mp4
            - mov
          default: mp4
        omni_reference_task_type:
          type: string
          description: >-
            Task type for omni-reference generation, supported on
            doubao-seedance-2-5-260628 only. Declaring edit or extend validates
            constraints up front: video editing requires ratio=adaptive and
            duration=-1, video extension requires ratio=adaptive; violations
            return InvalidParameter.TaskTypeConstraint at submission
          enum:
            - auto
            - edit
            - extend
          default: auto
    Seedance2TaskCreated:
      type: object
      description: >-
        Creation response. Poll GET
        /seedance/api/v3/contents/generations/tasks/{id}; on success the video
        URL is at content.video_url (expires in ~24 h) and billed tokens at
        usage.completion_tokens
      properties:
        id:
          type: string
          description: Video generation task ID (kept for 7 days)
          example: cgt-20260606160057-6bbjd
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        API key from the APIYI console (SeeDance25 group for 2.5, SeeDance2
        group for the 2.0 family)

````