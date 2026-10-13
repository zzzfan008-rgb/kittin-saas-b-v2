> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API генерации видео Wan3.0

> Справочник по API генерации видео Wan3.0 и интерактивный Playground: один ID модели охватывает text-to-video, image-to-video, reference-to-video и редактирование видео, длительность до 30 секунд, 480P-1080P, асинхронный сквозной эндпоинт DashScope.

<Info>
  Используйте Playground справа для прямого тестирования: укажите `Bearer sk-your-api-key` в **Authorization**, заполните `model` / `input` / `parameters` и отправьте запрос. При успешной отправке возвращается `task_id`; опрос статуса и скачивание описаны ниже.
</Info>

<Tip>
  Wan3.0 поддерживает **все режимы через один ID модели** — выполняемое действие определяется тем, какие медиаданные вы отправляете. Полный асинхронный рабочий процесс, таблица статусов, правила тарификации и Python-клиент представлены в [обзоре Wan3.0](/ru/api-capabilities/wan3/overview).
</Tip>

<Warning>
  * Запросы на создание должны отправляться на `/wan/api/v1/services/aigc/video-generation/video-synthesis` с заголовком `X-DashScope-Async: enable`. **Не используйте `/v1/videos`** (медиаполя будут отброшены, а тарификация будет некорректной).
  * `duration` должен быть **целым числом** (`5`, а не `"5"`); указывайте `resolution` в **верхнем регистре** (`720P`).
  * Конечными состояниями являются `completed` / `failed`, **а не** `SUCCEEDED`.
</Warning>

## Четыре режима, одно поле

| Режим | Что указывать в `media` |
| - | - |
| Текст в видео | Пропустите `media` |
| Изображение в видео | `[{ "type": "first_frame", "url": "..." }]` |
| Видео по первому/последнему кадру | `first_frame` + `last_frame` |
| Видео по референсу | `reference_image` / `reference_video` / `reference_audio` (можно комбинировать) |

<Warning>
  `first_frame` / `last_frame` **нельзя** комбинировать с `reference_*` / `file` / `link`.
</Warning>

## Примеры кода

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan3.0-video",
      "input": {
        "prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks, cinematic lighting"
      },
      "parameters": {
        "resolution": "720P",
        "ratio": "16:9",
        "duration": 5,
        "prompt_extend": true
      }
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",   # required when creating a task
  }
  body = {
      "model": "wan3.0-video",
      "input": {"prompt": "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks"},
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  task_id = resp.json()["output"]["task_id"]
  print("task_id:", task_id)
  ```

  ```javascript Node.js theme={null}
  const res = await fetch(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer sk-your-api-key",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wan3.0-video",
        input: { prompt: "A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks" },
        parameters: { resolution: "720P", ratio: "16:9", duration: 5, prompt_extend: true },
      }),
    }
  );
  const data = await res.json();
  console.log("task_id:", data.output.task_id);
  ```
</CodeGroup>

### Генерация видео по изображению (первый кадр)

```json theme={null}
{
  "model": "wan3.0-video",
  "input": {
    "prompt": "The cat turns toward the camera and blinks",
    "media": [{ "type": "first_frame", "url": "https://example.com/cat.jpg" }]
  },
  "parameters": { "resolution": "720P", "duration": 5 }
}
```

### Генерация видео по референсу (референсное изображение + референсное видео)

```json theme={null}
{
  "model": "wan3.0-video-prime",
  "input": {
    "prompt": "Replace the person in video 1 with the person in image 1, keep everything else",
    "media": [
      { "type": "reference_image", "url": "https://example.com/person.jpg" },
      { "type": "reference_video", "url": "https://example.com/source.mp4" }
    ]
  },
  "parameters": { "resolution": "720P", "ratio": "9:16", "duration": 5 }
}
```

<Warning>
  **Длительность референсного видео тарифицируется.** В приведенном выше примере референс длительностью 10 секунд и выходное видео длительностью 5 секунд тарифицируются как **15 секунд**. Суммарная длительность входа и выхода ограничена 30 секундами. См. [правила тарификации](/ru/api-capabilities/wan3/overview#%EF%B8%8F-billing-rules-different-from-other-video-models).
</Warning>

## Опрос и скачивание

```bash theme={null}
# Poll every 5-10 seconds (never below 3)
curl "https://api.apiyi.com/v1/tasks/$TASK_ID" \
  -H "Authorization: Bearer sk-your-api-key"

# Download: result_url is a signed OSS link - do not send Authorization
curl -o out.mp4 "$RESULT_URL"
```

| Статус | Значение | Следующий шаг |
| - | - | - |
| `submitted` | В очереди | Продолжайте опрос |
| `in_progress` | Генерируется | Продолжайте опрос |
| `completed` | Завершено | Скачайте из `result_url` |
| `failed` | Ошибка | Проверьте `error.message`; **не тарифицируется** |

## Краткий обзор цен

Базовый тариф составляет **98% от официальной цены Alibaba**; с максимальным [бонусом за пополнение](/ru/faq/recharge-promotions) цена снижается до **\~81.7%**.

| Модель | Разрешение | По умолчанию | С бонусом 10% | **С бонусом 20%** | Цена с бонусом 20% в CNY |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/сек | \$0.0267/сек | **\$0.0245/сек** | ¥0.1715/сек |
| `wan3.0-video` | 720P | \$0.0588/сек | \$0.0535/сек | **\$0.049/сек** | ¥0.343/сек |
| `wan3.0-video` | 1080P | \$0.1176/сек | \$0.1069/сек | **\$0.098/сек** | ¥0.686/сек |
| `wan3.0-video-prime` | 480P | \$0.063/сек | \$0.0573/сек | **\$0.0525/сек** | ¥0.3675/сек |
| `wan3.0-video-prime` | 720P | \$0.126/сек | \$0.1145/сек | **\$0.105/сек** | ¥0.735/сек |
| `wan3.0-video-prime` | 1080P | \$0.252/сек | \$0.2291/сек | **\$0.21/сек** | ¥1.47/сек |

<Note>Цены соответствуют официальным тарифам провайдера и могут меняться вслед за ними; таблица выше приведена только для справки, а актуальные данные указаны на вкладке **Цены на модели** в верхней навигации: [Цены на модели](/en/models/index).</Note>

<Card title="Полные параметры, правила тарификации и рекомендации" icon="book-open" href="/ru/api-capabilities/wan3/overview">
  Обзор Wan3.0
</Card>


## OpenAPI

````yaml api-reference/wan3-video-openapi-en.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan3.0 Video Generation API
  description: >
    Alibaba Tongyi Wanxiang Wan3.0 video generation — one model ID covers
    text-to-video, image-to-video, reference-to-video and video editing.
    DashScope async passthrough endpoint.


    - Create requests must carry the `X-DashScope-Async: enable` header

    - Async task endpoint: this call only submits the job and returns a
    `task_id`. Poll `GET /v1/tasks/{task_id}`, then download the mp4 from
    `result_url`

    - Terminal states are `completed` / `failed`, **not** DashScope's native
    `SUCCEEDED`

    - `result_url` is a signed Alibaba OSS link — **do not send the
    Authorization header** when downloading. Valid for 24 hours

    - **Do not use `/v1/videos`** to submit Wan video jobs (media fields are
    dropped and billing is inaccurate)


    **Billing**: per second. Billed seconds = input reference video duration +
    output video duration; the unit price follows the output resolution.
    Reference images / audio / files are free. Input + output is capped at 30
    seconds. Failed tasks are fully refunded.


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create one in the APIYI console at `api.apiyi.com/token`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - Video Generation
      summary: 'Video generation: create a Wan3.0 video task'
      description: >
        Submits an asynchronous Wan3.0 video job and returns a `task_id` with
        `task_status: "PENDING"`.


        - Required: `model`, `input.prompt`, and the `X-DashScope-Async: enable`
        header

        - The mode is decided by `input.media[]`: omit it for text-to-video;
        `first_frame` for image-to-video; `reference_image` / `reference_video`
        for reference-to-video

        - `first_frame` / `last_frame` cannot be mixed with `reference_*` /
        `file` / `link`

        - **The response contains no video file** — poll `GET
        /v1/tasks/{task_id}` until `status: "completed"`, then download from
        `result_url`

        - Typical latency for a 5-second clip: ~100 sec at 480P, ~120 sec at
        720P, ~170 sec at 1080P
      operationId: createWan30Video
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: >-
            Async switch. Must be set to enable, otherwise the upstream returns:
            current user api does not support synchronous calls
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
              $ref: '#/components/schemas/Wan30VideoRequest'
            example:
              model: wan3.0-video
              input:
                prompt: >-
                  A lighthouse by the sea at dusk, slow dolly-in, waves on the
                  rocks, seagulls, cinematic lighting
              parameters:
                resolution: 720P
                ratio: '16:9'
                duration: 5
                prompt_extend: true
      responses:
        '200':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Wan30VideoResponse'
              example:
                output:
                  task_id: 9db29626-79fc-40d1-b9c2-c6b0caf8ac15
                  task_status: PENDING
                request_id: e616d8c9-1147-9ecd-b2b5-abbbe89a4642
        '400':
          description: Invalid request parameters
        '401':
          description: 'Authentication failed: invalid API key'
        '403':
          description: >-
            Forbidden: the key group does not include Wan&HappyHorse, or the key
            is on per-call billing
      security:
        - bearerAuth: []
components:
  schemas:
    Wan30VideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          enum:
            - wan3.0-video
            - wan3.0-video-prime
          default: wan3.0-video
          description: >-
            Model ID. wan3.0-video is the standard variant; wan3.0-video-prime
            is the faster Prime variant at a higher unit price
        input:
          $ref: '#/components/schemas/Wan30Input'
        parameters:
          $ref: '#/components/schemas/Wan30Parameters'
    Wan30VideoResponse:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: Task ID, used for polling GET /v1/tasks/{task_id}
            task_status:
              type: string
              description: Always PENDING at submit time
        request_id:
          type: string
          description: Upstream request ID
    Wan30Input:
      type: object
      required:
        - prompt
      properties:
        prompt:
          type: string
          description: >-
            Natural-language description. With multiple assets, refer to them as
            image 1 / video 1 in the prompt
          example: A lighthouse by the sea at dusk, slow dolly-in, waves on the rocks
        negative_prompt:
          type: string
          description: Negative prompt
        media:
          type: array
          description: >-
            Media asset array. Omit for text-to-video. first_frame / last_frame
            cannot be mixed with reference_* / file / link
          items:
            $ref: '#/components/schemas/Wan30Media'
    Wan30Parameters:
      type: object
      properties:
        resolution:
          type: string
          enum:
            - 480P
            - 720P
            - 1080P
          default: 1080P
          description: >-
            Output resolution (uppercase). Determines the unit price — set it
            explicitly
        ratio:
          type: string
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
            - adaptive
          description: Aspect ratio. Ignored when a first frame is supplied
        duration:
          type: integer
          description: >-
            Output length in whole seconds. Defaults to 5. Input reference video
            duration + output duration must not exceed 30 seconds
          example: 5
        prompt_extend:
          type: boolean
          default: true
          description: Prompt rewriting. Keep it true
        audio:
          type: boolean
          default: true
          description: Whether to output an audio track. Enabled by default
        watermark:
          type: boolean
          default: false
          description: AI generated watermark in the lower-right corner
        seed:
          type: integer
          minimum: 0
          maximum: 2147483647
          description: Random seed. Fixing it improves reproducibility
    Wan30Media:
      type: object
      required:
        - type
        - url
      properties:
        type:
          type: string
          enum:
            - first_frame
            - last_frame
            - reference_image
            - reference_video
            - reference_audio
            - file
            - link
          description: >-
            Asset type. reference_video duration counts toward billed seconds;
            all other assets are free
        url:
          type: string
          format: uri
          description: >-
            A publicly reachable https link that must stay available until the
            task completes
          example: https://example.com/first-frame.jpg
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'APIYI API key, format: Bearer sk-your-api-key'

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.