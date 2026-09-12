> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для редактирования видео Wan2.7

> Справочник API редактирования видео Wan2.7-videoedit и живая песочница: входное видео + эталонные изображения + инструкция на естественном языке для локальных/глобальных правок, таких как замена одежды и замена фона.

<Info>
  Песочница справа позволяет отлаживать напрямую: поместите `Bearer sk-your-api-key` в **Authorization**, заполните `model` / `input.media` / `parameters` и отправьте запрос. Успешная отправка возвращает `task_id`; ниже см. сведения о polling и загрузке.
</Info>

<Tip>
  Эта страница — эндпоинт создания для `wan2.7-videoedit` (редактирование видео): передайте видео + 1-5 reference images + инструкцию редактирования на естественном языке, чтобы изменить элементы видео, например заменить одежду или фон. Обратите внимание: у названия модели **нет дефиса** (`videoedit`). Полный асинхронный процесс см. в [Обзор Wan](/ru/api-capabilities/wan/overview).
</Tip>

<Warning>
  * `input.media` должен содержать и `video` (редактируемое видео), и как минимум одно `reference_image` (референсный объект, ≤5).
  * Название модели — `wan2.7-videoedit` (**без дефиса**), оно отличается от HappyHorse's `happyhorse-1.0-video-edit` (с дефисами), так что не путайте их.
  * Запросы на создание отправляются в `/wan/api/v1/...` с `X-DashScope-Async: enable`; не используйте `/v1/videos`.
</Warning>

## Примеры кода

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-videoedit",
      "input": {
        "prompt": "Replace the girl's outfit in the video with the outfit in the image",
        "media": [
          {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
          {"type": "reference_image", "url": "https://your-cdn.com/new-clothes.png"}
        ]
      },
      "parameters": {"resolution": "720P", "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "Replace the girl's outfit in the video with the outfit in the image",
          "media": [
              {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
              {"type": "reference_image", "url": "https://your-cdn.com/new-clothes.png"},
          ],
      },
      "parameters": {"resolution": "720P", "prompt_extend": True, "watermark": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (multiple reference images) theme={null}
  import requests

  # Up to 5 reference_image for finer local/global edits
  body = {
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "Replace the background in the video with the seaside in image 1, and change the character's outfit to image 2",
          "media": [
              {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
              {"type": "reference_image", "url": "https://your-cdn.com/beach.png"},
              {"type": "reference_image", "url": "https://your-cdn.com/outfit.png"},
          ],
      },
      "parameters": {"resolution": "720P", "prompt_extend": True},
  }
  resp = requests.post(
      "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
      json=body,
      headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
               "X-DashScope-Async": "enable"},
      timeout=30,
  )
  print(resp.json()["output"]["task_id"])
  ```
</CodeGroup>

## Краткая справка по параметрам и медиа

| Параметр                   | Тип    | Обязательно | По умолчанию | Примечания                                         |
| -------------------------- | ------ | ----------- | ------------ | -------------------------------------------------- |
| `model`                    | string | ✓           | —            | Фиксированное `wan2.7-videoedit`                   |
| `input.prompt`             | string | ✓           | —            | Инструкция по редактированию на естественном языке |
| `input.media`              | array  | ✓           | —            | См. таблицу медиа ниже                             |
| `parameters.resolution`    | string |             | `720P`       | `720P` / `1080P`                                   |
| `parameters.prompt_extend` | bool   |             | `true`       | Умное переписывание                                |
| `parameters.watermark`     | bool   |             | `false`      | Водяной знак «сгенерировано AI»                    |

### Значения `media[]`

| `type`            | Обязательно | Количество | Примечания                                        |
| ----------------- | ----------- | ---------- | ------------------------------------------------- |
| `video`           | ✓           | 1          | Исходное видео, которое редактируется             |
| `reference_image` | ✓           | 1-5        | Референсный файл (новый наряд, новый фон и т. д.) |

<Info>
  Длительность результата редактирования видео соответствует входному видео, а не параметру `duration`, поэтому эта возможность обычно не передает `duration`.
</Info>

## Формат ответа

```json theme={null}
{
  "output": { "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103", "task_status": "PENDING" },
  "request_id": "..."
}
```

## Проверка статуса и скачивание

Когда у вас есть `task_id`, выполните следующие три шага, чтобы опрашивать статус и скачать mp4:

* **Опрос** `GET /v1/tasks/{task_id}` (с `Authorization`; запросу не нужен заголовок `X-DashScope-Async`) каждые 5-10 секунд (не \< 3 секунд), пока `status` не станет `completed`.
* **Значения статуса**: `submitted` (в очереди) / `in_progress` (генерируется; если `progress` часто остается на 30%, это нормально) / `completed` (успешно) / `failed` (проверьте `error`).
* **Скачивание**: получите `result_url` напрямую из ответа, **без заголовка `Authorization`** (это подписанная прямая ссылка OSS — при отправке Auth возвращается 403); `result_url` по умолчанию истекает через **24 часа**, поэтому сохраните ее сразу.

<CodeGroup>
  ```bash Проверка статуса theme={null}
  curl "https://api.apiyi.com/v1/tasks/3b216861-6a5f-441d-a438-602ab2c0d103" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json Завершенный ответ theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103"
  }
  ```

  ```bash Скачивание видео theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash Одна команда: проверка + скачивание theme={null}
  TASK_ID="3b216861-6a5f-441d-a438-602ab2c0d103"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  Выше приведен быстрый путь проверки/скачивания для случая «у вас уже есть task\_id». Для полного цикла опроса (с запасным вариантом при тайм-ауте) и Python-клиента см. [Обзор Wan · Поток асинхронного вызова](/ru/api-capabilities/wan/overview#async-call-flow).
</Warning>


## OpenAPI

````yaml api-reference/wan-video-edit-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Video Edit API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 video edit (`wan2.7-videoedit`, model
    name has no hyphen) — input video + reference images + natural-language
    instruction for local/global edits like outfit swap and background swap.
    DashScope async passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - `input.media` must contain 1 `video` + 1-5 `reference_image`

    - The output duration follows the input video; usually `duration` is not
    passed

    - Async task endpoint: returns a `task_id`; poll `GET /v1/tasks/{task_id}`,
    then download from `result_url` (no Authorization header, expires in 24
    hours)

    - **Do not use `/v1/videos`**


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    header


    **Get an API Key**: visit the APIYI console `api.apiyi.com/token` to create
    a Token
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - Video Generation
      summary: >-
        Video edit: create an edit task from a video + reference images +
        instruction
      description: >
        Submit a `wan2.7-videoedit` video edit task (async); returns a
        `task_id`.


        - Required: `model`, `input.prompt` (edit instruction), `input.media` (1
        video + 1-5 reference_image), header `X-DashScope-Async: enable`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - Time depends on the input video length; measured at about 100 seconds
      operationId: createWan27VideoEdit
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: Async processing switch; must be set to enable
          schema:
            type: string
            enum:
              - enable
            default: enable
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WanVideoEditRequest'
            example:
              model: wan2.7-videoedit
              input:
                prompt: >-
                  Replace the girl's outfit in the video with the outfit in the
                  image
                media:
                  - type: video
                    url: https://your-cdn.com/source.mp4
                  - type: reference_image
                    url: https://your-cdn.com/new-clothes.png
              parameters:
                resolution: 720P
                prompt_extend: true
                watermark: true
      responses:
        '200':
          description: Task submitted; returns task_id and PENDING status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WanVideoTask'
        '400':
          description: Invalid parameter or more than 5 reference images
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation, or no permission for the group
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Missing video / reference_image or upstream error
      security:
        - bearerAuth: []
components:
  schemas:
    WanVideoEditRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed wan2.7-videoedit (no hyphen)
          enum:
            - wan2.7-videoedit
          default: wan2.7-videoedit
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Natural-language edit instruction
              example: >-
                Replace the girl's outfit in the video with the outfit in the
                image
            media:
              type: array
              description: Media asset array; must contain 1 video + 1-5 reference_image
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: video (the source video being edited) /
                      reference_image (reference asset)
                    enum:
                      - video
                      - reference_image
                  url:
                    type: string
                    description: Public https link fetchable directly with GET
                    example: https://your-cdn.com/source.mp4
        parameters:
          $ref: '#/components/schemas/WanParameters'
    WanVideoTask:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: >-
                Task ID, used to poll GET /v1/tasks/{task_id}, valid for 24
                hours
              example: 3b216861-6a5f-441d-a438-602ab2c0d103
            task_status:
              type: string
              enum:
                - PENDING
                - RUNNING
                - SUCCEEDED
                - FAILED
              example: PENDING
        request_id:
          type: string
          description: Unique request identifier
          example: ...
    WanParameters:
      type: object
      properties:
        resolution:
          type: string
          description: Resolution tier (uppercase)
          enum:
            - 720P
            - 1080P
          default: 720P
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting
          default: true
        watermark:
          type: boolean
          description: Whether to add an AI generated watermark in the bottom-right corner
          default: false
        seed:
          type: integer
          description: Random seed, 0-2147483647
          minimum: 0
          maximum: 2147483647
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: The API Key obtained from the APIYI console

````