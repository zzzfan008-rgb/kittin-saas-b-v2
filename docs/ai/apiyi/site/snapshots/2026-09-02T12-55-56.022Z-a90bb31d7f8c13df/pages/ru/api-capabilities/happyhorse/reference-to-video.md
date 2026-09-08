> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API Reference-to-Video HappyHorse

> Справочник API HappyHorse-1.1-r2v Reference-to-Video и онлайн-отладка: до 9 референсных изображений, чтобы сохранить согласованность объекта и сцены, асинхронный passthrough-эндпоинт DashScope.

<Info>
  Вы можете отлаживать напрямую в Playground справа: заполните **Authorization** значением `Bearer sk-your-api-key`, задайте `model` / `input.media` / `parameters`, затем отправьте запрос. При успешной отправке возвращается `task_id`; ниже см. инструкции по опросу и скачиванию.
</Info>

<Tip>
  На этой странице описан create endpoint для `happyhorse-1.1-r2v` (Reference-to-Video): укажите референсные изображения, и модель сохранит в них объекты и особенности сцены. HappyHorse-r2v поддерживает **до 9 референсных изображений**, обеспечивая более сильную согласованность объектов в сценариях с несколькими референсами. Полный асинхронный процесс см. в [Обзор HappyHorse](/ru/api-capabilities/happyhorse/overview).
</Tip>

<Warning>
  * `happyhorse-1.1-r2v` поддерживает до **9** записей `reference_image` (это больше, чем суммарные ≤5 у Wan2.7-r2v).
  * `input.media` обязателен, а media `url` должен быть публичной https-ссылкой, которую можно напрямую получить через GET.
  * Запрос на создание отправляется в `/wan/api/v1/...` с `X-DashScope-Async: enable`; не используйте `/v1/videos`.
</Warning>

## Примеры кода

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "happyhorse-1.1-r2v",
      "input": {
        "prompt": "Following the reference image, a girl walking slowly through a garden bathed in sunset light, cinematic lighting",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/girl.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (одно эталонное изображение) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "happyhorse-1.1-r2v",
      "input": {
          "prompt": "Following the reference image, a girl walking slowly through a garden bathed in sunset light, cinematic lighting",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (несколько эталонных изображений, до 9) theme={null}
  import requests

  # happyhorse-1.1-r2v supports up to 9 reference_image entries
  refs = [
      "https://your-cdn.com/ref1.png",
      "https://your-cdn.com/ref2.png",
      "https://your-cdn.com/ref3.png",
  ]
  body = {
      "model": "happyhorse-1.1-r2v",
      "input": {
          "prompt": "Keep the character and clothing features from the reference images, strolling through a city night scene with neon lighting",
          "media": [{"type": "reference_image", "url": u} for u in refs],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
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

| Параметр                   | Тип    | Обязательный | По умолчанию | Примечания                                  |
| -------------------------- | ------ | ------------ | ------------ | ------------------------------------------- |
| `model`                    | string | ✓            | —            | Фиксировано на `happyhorse-1.1-r2v`         |
| `input.prompt`             | string | ✓            | —            | Текстовый prompt                            |
| `input.media`              | array  | ✓            | —            | См. таблицу медиа ниже                      |
| `parameters.resolution`    | string |              | `720P`       | `720P` / `1080P`                            |
| `parameters.duration`      | int    |              | `5`          | Целое число от 2 до 15 секунд               |
| `parameters.prompt_extend` | bool   |              | `true`       | Умное переписывание, рекомендуется включать |
| `parameters.watermark`     | bool   |              | `false`      | Водяной знак «AI Generated»                 |

### `media[]` Значения

| `type`            | Обязательный | Количество | Примечания                                                                               |
| ----------------- | ------------ | ---------- | ---------------------------------------------------------------------------------------- |
| `reference_image` | ✓            | 1–9        | Референсное изображение; сохраняет объект (человек/животное/предмет) и особенности сцены |

## Формат ответа

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  После отправки **опрашивайте `GET /v1/tasks/{task_id}`** до `completed`, затем скачайте mp4 из `result_url` (**без заголовка `Authorization`**, срок действия — 24 часа). Полный цикл опроса см. в [Обзор HappyHorse · Асинхронный поток вызовов](/ru/api-capabilities/happyhorse/overview#async-call-flow).
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-reference-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse Reference-to-Video API
  description: >
    Alibaba Cloud HappyHorse-1.0 Reference-to-Video (`happyhorse-1.1-r2v`) — up
    to 9 reference images to keep the subject and scene consistent. DashScope
    async passthrough endpoint.


    - The create request must include the request header `X-DashScope-Async:
    enable`

    - `reference_image` up to 9 (more than Wan2.7-r2v's combined <=5)

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
        Reference-to-Video: create a video task with up to 9 reference images to
        preserve the subject
      description: >
        Submit a `happyhorse-1.1-r2v` Reference-to-Video task (async), returning
        a `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (1-9
        reference_image), request header `X-DashScope-Async: enable`

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`
      operationId: createHappyHorseReferenceToVideo
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
              $ref: '#/components/schemas/HappyHorseReferenceToVideoRequest'
            example:
              model: happyhorse-1.1-r2v
              input:
                prompt: >-
                  Following the reference image, a girl walking slowly through a
                  garden bathed in sunset light, cinematic lighting
                media:
                  - type: reference_image
                    url: https://your-cdn.com/girl.png
              parameters:
                resolution: 720P
                duration: 5
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
          description: Invalid parameter or more than 9 reference images
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation or group has no permission
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: >-
            Missing media or upstream error, recommended to check the body and
            retry
      security:
        - bearerAuth: []
components:
  schemas:
    HappyHorseReferenceToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to happyhorse-1.1-r2v for Reference-to-Video
          enum:
            - happyhorse-1.1-r2v
          default: happyhorse-1.1-r2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: >-
                Text prompt; preserves the subject/clothing/scene features from
                the reference images
              example: >-
                Following the reference image, a girl walking slowly through a
                garden bathed in sunset light, cinematic lighting
            media:
              type: array
              description: Media asset array; reference_image up to 9
              maxItems: 9
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: 'Media type: reference_image (reference image)'
                    enum:
                      - reference_image
                  url:
                    type: string
                    description: A public https image link fetchable directly via GET
                    example: https://your-cdn.com/girl.png
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
        duration:
          type: integer
          description: Video duration (seconds), integer, value 2-15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: Whether to enable smart prompt rewriting, strongly recommended true
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