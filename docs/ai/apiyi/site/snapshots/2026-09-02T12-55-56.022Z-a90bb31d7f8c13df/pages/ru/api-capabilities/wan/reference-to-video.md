> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API Wan2.7 для генерации видео по референсу

> Справочник API Wan2.7-r2v для генерации видео по референсу и интерактивная песочница: сохраняйте признаки объекта из референсных изображений/видео, с взаимодействием нескольких объектов, голосовым референсом и раскадровками в режиме разделенного экрана.

<Info>
  Песочница справа позволяет отлаживать напрямую: укажите `Bearer sk-your-api-key` в **Authorization**, заполните `model` / `input.media` / `parameters` и отправьте запрос. Успешная отправка возвращает `task_id`; ниже см. опрос и скачивание.
</Info>

<Tip>
  Эта страница — эндпоинт создания для `wan2.7-r2v` (reference-to-video): передайте референсные изображения/видео, и model сохранит их subjects (people/animals/objects) и scene features, создавая сцены с одним персонажем или взаимодействия нескольких персонажей. Если вам нужно больше референсных изображений (до 9), рассмотрите [HappyHorse r2v](/ru/api-capabilities/happyhorse/reference-to-video). Для полного async flow см. [Wan Обзор](/ru/api-capabilities/wan/overview).
</Tip>

<Warning>
  * **Соглашение о цитировании референсных ресурсов**: в prompt используйте «image 1 / image 2» для обозначения `reference_image` и «video 1 / video 2» для обозначения `reference_video` в том же порядке, что и массив `media` (изображения и видео считаются отдельно). При одном изображении/видео можно просто написать «референсное изображение» / «референсное видео».
  * **Ограничения по количеству**: `reference_image` + `reference_video` всего ≤5; не более 1 `first_frame`.
  * Запросы на создание отправляйте в `/wan/api/v1/...` с `X-DashScope-Async: enable`; не используйте `/v1/videos`.
</Warning>

## Примеры кода

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-r2v",
      "input": {
        "prompt": "A girl wearing this gown walks slowly through a garden bathed in sunset, the breeze gently lifting her skirt, cinematic lighting",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/dress.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (референс одного изображения) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "The reference image: a girl walking slowly through a garden bathed in sunset, cinematic lighting",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (несколько объектов + голос) theme={null}
  import requests

  # Multi-subject: image 1 = girl (with voice), video 1 = boy (with voice), image 2/3 = props/background
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "Video 1 holds image 2, walks past image 1, and says: the sunshine is lovely today.",
          "media": [
              {"type": "reference_image", "url": "https://your-cdn.com/girl.jpg",
               "reference_voice": "https://your-cdn.com/girl-voice.mp3"},
              {"type": "reference_video", "url": "https://your-cdn.com/boy.mp4",
               "reference_voice": "https://your-cdn.com/boy-voice.mp3"},
              {"type": "reference_image", "url": "https://your-cdn.com/object.png"},
          ],
      },
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 10, "prompt_extend": False, "watermark": True},
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

| Параметр                   | Тип    | Обязательный | По умолчанию | Примечания                                                                       |
| -------------------------- | ------ | ------------ | ------------ | -------------------------------------------------------------------------------- |
| `model`                    | string | ✓            | —            | Фиксированный `wan2.7-r2v`                                                       |
| `input.prompt`             | string | ✓            | —            | ≤5000 символов; используйте «image 1/video 1» для ссылки на ресурсы              |
| `input.media`              | array  | ✓            | —            | См. таблицу медиа ниже                                                           |
| `parameters.resolution`    | string |              | `1080P`      | `720P` / `1080P`                                                                 |
| `parameters.ratio`         | string |              | `16:9`       | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` (игнорируется, если передан первый кадр) |
| `parameters.duration`      | int    |              | `5`          | 2-10 с reference video; 2-15 без него                                            |
| `parameters.prompt_extend` | bool   |              | `true`       | Умное переписывание                                                              |
| `parameters.watermark`     | bool   |              | `false`      | Водяной знак «AI generated»                                                      |

### Значения `media[]`

| `type`            | Количество / лимит     | Примечания                                                                                                                          |
| ----------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `reference_image` | ≤5 в сочетании с video | Референсное изображение, задает объект (человек/животное/предмет) или сцену; можно прикрепить `reference_voice`, чтобы задать голос |
| `reference_video` | ≤5 в сочетании с image | Референсное видео, задает объект и референс голоса; не передавайте видео с пустой сценой                                            |
| `first_frame`     | ≤1                     | Необязательный первый кадр, совместно управляет начальным кадром                                                                    |
| `reference_voice` | прикрепленное поле     | Прикрепляется к `reference_image`/`reference_video`, чтобы задать голос этого объекта (wav/mp3, 1-10 s)                             |

## Формат ответа

```json theme={null}
{
  "output": { "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb", "task_status": "PENDING" },
  "request_id": "..."
}
```

## Проверка статуса и скачивание

После того как у вас есть `task_id`, выполните три шага ниже, чтобы опросить статус и скачать mp4:

* **Опрос** `GET /v1/tasks/{task_id}` (с `Authorization`; запросу **не** нужен заголовок `X-DashScope-Async`), каждые 10 секунд (не \< 3 секунд), пока `status` не станет `completed`. Преобразование reference-to-video обычно занимает 1-5 минут, поэтому на всякий случай задайте клиентский тайм-аут 20 минут.
* **Значения статуса**: `submitted` (в очереди) / `in_progress` (генерируется; если `progress` часто зависает на 30%, это нормально) / `completed` (успех) / `failed` (проверьте `error`).
* **Скачивание**: выполните GET для `result_url` напрямую из ответа, **без заголовка `Authorization`** (это подписанная прямая ссылка OSS — при отправке Auth вернется 403); `result_url` по умолчанию истекает через **24 часа**, поэтому сохраните его сразу.

<CodeGroup>
  ```bash Проверка статуса theme={null}
  curl "https://api.apiyi.com/v1/tasks/acda59b4-3b10-4789-a5e5-edadae48adcb" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json Завершенный ответ theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb"
  }
  ```

  ```bash Скачать видео theme={null}
  # result_url is an OSS signed direct link — do NOT send the Authorization header (it returns 403)
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash Одна команда: проверка + скачивание theme={null}
  TASK_ID="acda59b4-3b10-4789-a5e5-edadae48adcb"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # no Authorization
  ```
</CodeGroup>

<Warning>
  Приведенное выше — это быстрый путь проверки/скачивания для случая «у вас уже есть task\_id». Для полного цикла опроса (с запасным тайм-аутом) и Python client см. [Обзор Wan · Поток асинхронных вызовов](/ru/api-capabilities/wan/overview#async-call-flow).
</Warning>


## OpenAPI

````yaml api-reference/wan-reference-to-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 Reference-to-Video API
  description: >
    Alibaba Cloud Tongyi Wanxiang Wan2.7 reference-to-video (`wan2.7-r2v`) —
    preserve subject features from reference images/videos, with multi-subject
    interaction, voice reference, and split-screen storyboards. DashScope async
    passthrough endpoint.


    - Creation requests must include the header `X-DashScope-Async: enable`

    - In the prompt, use "image 1 / video 1" to refer to reference assets, in
    the same order as the media array

    - `reference_image` + `reference_video` total <=5; `first_frame` <=1

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
        Reference-to-video: create a video task that preserves subject features
        from reference images/videos
      description: >
        Submit a `wan2.7-r2v` reference-to-video task (async); returns a
        `task_id`.


        - Required: `model`, `input.prompt`, `input.media` (at least 1
        reference_image / reference_video), header `X-DashScope-Async: enable`

        - Optional: `reference_voice` (voice reference), `parameters` (including
        ratio)

        - **The response does not contain the video file**; poll `GET
        /v1/tasks/{task_id}` until `completed`, then download from `result_url`

        - 720P / 5 seconds typically takes 120-140 seconds; multi-subject tasks
        may take 1-5 minutes
      operationId: createWan27ReferenceToVideo
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
              $ref: '#/components/schemas/WanReferenceToVideoRequest'
            example:
              model: wan2.7-r2v
              input:
                prompt: >-
                  A girl wearing this gown walks slowly through a garden bathed
                  in sunset, the breeze gently lifting her skirt, cinematic
                  lighting
                media:
                  - type: reference_image
                    url: https://your-cdn.com/dress.png
              parameters:
                resolution: 720P
                ratio: '16:9'
                duration: 5
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
          description: Invalid parameter or more than 5 reference assets
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: Blocked by content moderation, or no permission for the group
        '429':
          description: Rate limit exceeded or insufficient balance
        '500':
          description: Missing media or upstream error; check the body and retry
      security:
        - bearerAuth: []
components:
  schemas:
    WanReferenceToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: >-
            Model ID; for reference-to-video use wan2.7-r2v (legacy versions
            wan2.6-r2v / wan2.6-r2v-flash)
          enum:
            - wan2.7-r2v
            - wan2.6-r2v
            - wan2.6-r2v-flash
          default: wan2.7-r2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: >-
                Text prompt, <=5000 characters; use 'image 1/video 1' to refer
                to reference assets
              example: >-
                The reference image: a girl walking slowly through a garden
                bathed in sunset, cinematic lighting
            negative_prompt:
              type: string
              description: Negative prompt, <=500 characters
            media:
              type: array
              description: >-
                Media asset array; reference_image + reference_video total <=5,
                first_frame <=1
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      Media type: reference_image (reference image) /
                      reference_video (reference video) / first_frame (optional
                      first frame)
                    enum:
                      - reference_image
                      - reference_video
                      - first_frame
                  url:
                    type: string
                    description: Public https link fetchable directly with GET
                    example: https://your-cdn.com/dress.png
                  reference_voice:
                    type: string
                    description: >-
                      Optional: voice reference audio URL (wav/mp3, 1-10s) to
                      set this subject's voice
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
              example: acda59b4-3b10-4789-a5e5-edadae48adcb
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
          description: >-
            Resolution tier (uppercase); wan2.7-r2v supports 720P / 1080P,
            default 1080P
          enum:
            - 720P
            - 1080P
          default: 1080P
        ratio:
          type: string
          description: Aspect ratio; ignored automatically when a first_frame is supplied
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
          default: '16:9'
        duration:
          type: integer
          description: >-
            Video duration (seconds), integer; range 2-10 with a reference
            video, 2-15 without
          minimum: 2
          maximum: 15
          default: 5
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