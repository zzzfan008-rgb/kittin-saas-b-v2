> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API для редактирования видео HappyHorse

> Справочник API для редактирования видео HappyHorse-1.0-video-edit и онлайн-отладка: входное видео + до 5 референсных изображений + инструкции на естественном языке для локальных/глобальных правок.

<Info>
  Вы можете отлаживать напрямую в Playground справа: заполните **Authorization** значением `Bearer sk-your-api-key`, задайте `model` / `input.media` / `parameters`, затем отправьте запрос. Успешная отправка возвращает `task_id`; ниже см. опрос и скачивание.
</Info>

<Tip>
  Эта страница описывает create-endpoint для `happyhorse-1.0-video-edit` (Video Edit): передайте видео + до 5 референсных изображений + инструкции на естественном языке, чтобы вносить локальные/глобальные правки в элементы видео. Обратите внимание, что в названии модели **есть дефис** (`video-edit`). Полный асинхронный поток см. в [Обзор HappyHorse](/ru/api-capabilities/happyhorse/overview).
</Tip>

<Warning>
  * `input.media` должен включать и `video` (редактируемое видео), и как минимум 1 `reference_image` (≤5).
  * Название модели — `happyhorse-1.0-video-edit` (**есть дефис**), в отличие от `wan2.7-videoedit` Wan (без дефиса) — не перепутайте.
  * Запрос create отправляется в `/wan/api/v1/...` с `X-DashScope-Async: enable`; не используйте `/v1/videos`.
</Warning>

## Примеры кода

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "happyhorse-1.0-video-edit",
      "input": {
        "prompt": "Replace the clothes of the girl in the video with the clothes in the image",
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
      "model": "happyhorse-1.0-video-edit",
      "input": {
          "prompt": "Replace the clothes of the girl in the video with the clothes in the image",
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
</CodeGroup>

## Краткая справка по параметрам и медиа

| Параметр                   | Тип    | Обязательно | По умолчанию | Примечания                                         |
| -------------------------- | ------ | ----------- | ------------ | -------------------------------------------------- |
| `model`                    | string | ✓           | —            | Жестко задано `happyhorse-1.0-video-edit`          |
| `input.prompt`             | string | ✓           | —            | Инструкция по редактированию на естественном языке |
| `input.media`              | array  | ✓           | —            | См. таблицу медиа ниже                             |
| `parameters.resolution`    | string |             | `720P`       | `720P` / `1080P`                                   |
| `parameters.prompt_extend` | bool   |             | `true`       | Умная переработка                                  |
| `parameters.watermark`     | bool   |             | `false`      | Водяной знак «Сгенерировано ИИ»                    |

### `media[]` Значения

| `type`            | Обязательно | Количество | Примечания                                            |
| ----------------- | ----------- | ---------- | ----------------------------------------------------- |
| `video`           | ✓           | 1          | Исходное видео, которое редактируется                 |
| `reference_image` | ✓           | 1–5        | Справочный материал (новая одежда, новый фон и т. д.) |

<Info>
  Длительность результата редактирования видео соответствует входному видео и не определяется `duration`, поэтому эта возможность обычно не передает `duration`.
</Info>

## Формат ответа

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  После отправки, **опросите `GET /v1/tasks/{task_id}`** до тех пор, пока `completed`, затем скачайте mp4 из `result_url` (**без заголовка `Authorization`**, срок действия истекает через 24 часа). См. полный цикл опроса в [HappyHorse Overview · Async Call Flow](/ru/api-capabilities/happyhorse/overview#async-call-flow).
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-video-edit-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse Video Edit API
  description: >
    Alibaba Cloud HappyHorse-1.0 Video Edit (`happyhorse-1.0-video-edit`, the
    model name has a hyphen) — input video + up to 5 reference images +
    natural-language instructions for local/global edits. DashScope async
    passthrough endpoint.


    - The create request must include the request header `X-DashScope-Async:
    enable`

    - `input.media` must contain 1 `video` + 1-5 `reference_image`

    - The output duration follows the input video; usually `duration` is not
    passed

    - Async task-style endpoint: returns a `task_id`, poll `GET
    /v1/tasks/{task_id}`, then download from `result_url` (without the
    Authorization header, expires in 24 hours)

    - **Do not use `/v1/videos`**


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    header


    **Get an API Key**: visit the APIYI Console `api.apiyi.com/token` to create
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
        Video Edit: create an edit task from video + reference images +
        instruction
      description: >
        Submit a `happyhorse-1.0-video-edit` Video Edit task (async), returning
        a `task_id`.


        - Required: `model`, `input.prompt` (editing instruction), `input.media`
        (1 video + 1-5 reference_image), request header `X-DashScope-Async:
        enable`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`
      operationId: createHappyHorseVideoEdit
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: Async processing switch, must be set to enable
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
              $ref: '#/components/schemas/HappyHorseVideoEditRequest'
            example:
              model: happyhorse-1.0-video-edit
              input:
                prompt: >-
                  Replace the clothes of the girl in the video with the clothes
                  in the image
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
          description: Task submitted, returns task_id and PENDING status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HappyHorseVideoTask'
        '400':
          description: Invalid parameter or more than 5 reference images
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation or group has no permission
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Missing video / reference_image or upstream error
      security:
        - bearerAuth: []
components:
  schemas:
    HappyHorseVideoEditRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to happyhorse-1.0-video-edit (has a hyphen)
          enum:
            - happyhorse-1.0-video-edit
          default: happyhorse-1.0-video-edit
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: Natural-language editing instruction
              example: >-
                Replace the clothes of the girl in the video with the clothes in
                the image
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
                      reference_image (reference material)
                    enum:
                      - video
                      - reference_image
                  url:
                    type: string
                    description: A public https link fetchable directly via GET
                    example: https://your-cdn.com/source.mp4
        parameters:
          $ref: '#/components/schemas/HappyHorseParameters'
    HappyHorseVideoTask:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: >-
                Task ID, used for polling GET /v1/tasks/{task_id}, valid for 24
                hours
              example: hh-...
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
    HappyHorseParameters:
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
          description: Whether to add the AI Generated watermark in the bottom-right corner
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
      description: The API Key obtained from the APIYI Console

````