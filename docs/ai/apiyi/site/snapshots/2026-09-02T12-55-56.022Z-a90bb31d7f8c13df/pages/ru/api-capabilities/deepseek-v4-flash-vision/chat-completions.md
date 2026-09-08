> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник Chat API для DeepSeek V4 Flash Vision

> Справочник по OpenAI-compatible Chat Completions API и песочница для deepseek-v4-flash-vision-exp: три способа отправки изображений, подробная экономия token, переключатель рассуждения. Требуется token группы по умолчанию.

<Warning>
  **Проверьте, что ваш token находится в группе `default` перед тестированием.**

  token `ClaudeCode` всё ещё возвращает здесь 200, но `detail`, переключатель режима рассуждения и `logprobs`
  все перестают работать, а из ответа пропадает поле `completion_tokens_details` —— кажется, что вы неправильно
  задали параметры, хотя на самом деле неверна группа. Для формата Anthropic используйте вместо этого
  [песочницу сообщений](/ru/api-capabilities/deepseek-v4-flash-vision/messages).
</Warning>

<Info>
  Используйте песочницу справа для прямого тестирования: поместите `Bearer sk-your-api-key` в
  **Authorization**. В примере используется публичное изображение, а режим рассуждения отключён, поэтому вы можете нажать
  отправить и сразу увидеть ответ. Для локального файла замените `image_url.url` на
  `data:image/jpeg;base64,<BASE64>`.
</Info>

## Краткая справка по параметрам

| Параметр                                  | Тип    | Обязательно | Значение по умолчанию | Примечания                                                                             |
| ----------------------------------------- | ------ | ----------- | --------------------- | -------------------------------------------------------------------------------------- |
| `model`                                   | string | ✓           | —                     | Всегда `deepseek-v4-flash-vision-exp`                                                  |
| `messages`                                | array  | ✓           | —                     | `content` — это string или массив частей для смешанного текста и изображений           |
| `max_tokens`                              | int    |             | —                     | Бюджет вывода, жёсткий потолок 393,216; **используйте 2000+ при включённом thinking**  |
| `thinking.type`                           | string |             | `enabled`             | `disabled` надёжно отключает thinking и экономит 80 input tokens                       |
| `reasoning_effort`                        | string |             | —                     | `none` эквивалентен отключению thinking; low/high/max не показывают стабильной разницы |
| `response_format`                         | object |             | —                     | Работает только `json_object`; `json_schema` выдаёт ошибку                             |
| `stream`                                  | bool   |             | `false`               | Потоковая передача SSE; используйте вместе с `stream_options.include_usage` для usage  |
| `temperature` / `top_p` / `stop` / `seed` | —      |             | —                     | Все действуют                                                                          |
| `logprobs` / `top_logprobs`               | —      |             | —                     | Работает; диапазон `top_logprobs` — 0–20                                               |
| `tools`                                   | array  |             | —                     | Function Call; используйте его вместо `json_schema` для структурированного вывода      |

## Три способа отправить изображение

### `image_url` с base64 data URL

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "data:image/jpeg;base64,<BASE64>", "detail": "original"}
}
```

### `image_url` с публичной ссылкой

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

URL может содержать не более 8192 символов и должен загружаться за 60 секунд.

### Блок `file` с `file_data`

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

Стоимость token одинакова для канала `image_url` (303 token для одного и того же изображения в любом случае).

<Warning>
  **`detail` в блоке `file` игнорируется без предупреждения** —— без ошибки и без сохранения.
  Чтобы использовать `detail: "low"`, отправьте изображение через канал `image_url`.

  Также, **`file_id` (Files API) недоступен на этой платформе**; при передаче одного возвращается
  `invalid file_id`.
</Warning>

## Сколько экономит `detail`

Одно и то же изображение 1600×1200 на всех четырёх уровнях:

| `detail`   | Image tokens | по сравнению с `original` |
| ---------- | ------------ | ------------------------- |
| `low`      | 142          | **-60%**                  |
| `high`     | 354          | same                      |
| `original` | 354          | baseline                  |
| `auto`     | 354          | same                      |

`low` достаточно для определения типа изображения, распознавания объекта или грубой классификации.
`original` оставляйте для чтения мелкого текста или значений на диаграммах.

Значение вне перечисления вызывает явную ошибку:
`unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`.

## Как изображения становятся token

| Размер изображения | tokens |
| ------------------ | ------ |
| 64×64              | 114    |
| 384×384            | 114    |
| 800×800            | 346    |
| 2000×2000          | 346    |
| 4000×4000          | 346    |
| 1600×400           | 266    |
| 1600×1200          | 354    |

384 на изображение — это верхний предел; несколько изображений учитываются независимо и суммируются линейно.
**Предварительное сжатие перед загрузкой экономит трафик, но не token** —— 2000² и 4000² преобразуются в
точно одно и то же число. Полные правила — в
[обзоре](/ru/api-capabilities/deepseek-v4-flash-vision/overview).

## Два способа отключить рассуждение

```json theme={null}
{ "thinking": { "type": "disabled" } }
```

```json theme={null}
{ "reasoning_effort": "none" }
```

Оба варианта проверены (по три прогона каждый: `prompt_tokens` снижается с 303 до 223, а `reasoning_content`
исчезает). `reasoning: {"effort": "none"}` и `enable_thinking: false` **не работают**.

<Warning>
  **Слишком маленький `max_tokens` возвращает пустой `content`.** При включённом рассуждении даже вопрос
  в одну строку может сначала выдать несколько сотен tokens рассуждения; когда бюджет
  заканчивается, вы получаете `finish_reason: "length"` и пустую строку —— это легко принять за то, что модель не смогла ответить.
  Используйте 2000 или больше при включённом рассуждении или просто отключите его.
</Warning>

## Нужен структурированный вывод? Используйте инструменты

`response_format: {"type": "json_schema"}` возвращает
`This response_format type is unavailable now` (ограничение модели выше по цепочке).
`json_object` работает, но не ограничивает поля. Для принудительного применения используйте Вызов функции:

```json theme={null}
{
  "model": "deepseek-v4-flash-vision-exp",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "Look at the image and call record_shape."},
      {"type": "image_url", "image_url": {"url": "https://example.com/shape.jpg"}}
    ]
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "record_shape",
      "parameters": {
        "type": "object",
        "properties": {
          "shape": {"type": "string"},
          "color": {"type": "string"}
        },
        "required": ["shape", "color"]
      }
    }
  }]
}
```

Аргументы tools также корректно собираются из инкрементов потоковой передачи.

## Распространённые ошибки

| Ошибка                                                  | Причина                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `You have uploaded an unsupported image`                | Формат не JPEG/PNG/GIF/WebP, либо base64 повреждён                  |
| `Failed to download image`                              | URL недоступен или ответ не был получен в течение более 60 секунд   |
| `image file size exceeds limit 32 MB`                   | Размер изображения больше 32 MiB                                    |
| `external link length … too long, max link length 8192` | URL слишком длинный                                                 |
| `Image in assistant message is unsupported`             | Изображения могут появляться только в сообщениях `user`             |
| `valid range of max_tokens is [1, 393216]`              | `max_tokens` выше допустимого предела                               |
| `invalid file_id`                                       | Вы использовали `file_id`; эта платформа не предоставляет Files API |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-vision-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Vision Chat Completions API
  description: >
    DeepSeek V4 Flash Vision (`deepseek-v4-flash-vision-exp`) —
    OpenAI-compatible Chat Completions endpoint with image input.


    - **Your token must be in the `default` group**: under `ClaudeCode`,
    `detail`, the thinking toggle and `logprobs` all stop working

    - **Three ways to send an image**: `image_url` with a base64 data URL,
    `image_url` with a public link, or a `file` block with `file_data`

    - **Images become input tokens by size**: 384 per image maximum, large
    images are rescaled to roughly an 800x800 equivalent, so pre-compressing
    saves no money

    - **`detail: "low"` cuts tokens by 60%**: 1600x1200 drops from 354 to 142.
    Only effective on `image_url` blocks

    - **Thinking mode is on by default**: for plain image reading pass
    `thinking: {"type": "disabled"}` — it saves 80 input tokens and runs faster

    - **`json_schema` is not supported**: `response_format` accepts only
    `json_object`; use Function Call when you need enforcement


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`, choosing the `default` group
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/chat/completions:
    post:
      tags:
        - Vision
      summary: 'Chat completion with vision: DeepSeek V4 Flash Vision'
      description: >
        Run a chat completion with images using `deepseek-v4-flash-vision-exp`,
        fully OpenAI-compatible.


        - The example uses a public image URL, so you can hit send right away.
        For a local file, change `url` to `data:image/jpeg;base64,<BASE64>`

        - Thinking is disabled in the example for fast debugging. Switch it to
        `enabled` for harder reasoning and raise `max_tokens` above 2000

        - Images may only appear in `user` messages; putting one in `assistant`
        returns `Image in assistant message is unsupported`

        - Supported formats: JPEG, PNG, GIF, WebP (detected from file content,
        not from the declared MIME type)
      operationId: createDeepSeekV4FlashVisionChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashVisionChatRequest'
            example:
              model: deepseek-v4-flash-vision-exp
              messages:
                - role: user
                  content:
                    - type: text
                      text: What is in this image? Answer in one sentence.
                    - type: image_url
                      image_url:
                        url: https://docs.apiyi.com/images/checks-passed.png
                        detail: original
              max_tokens: 800
              thinking:
                type: disabled
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashVisionChatResponse'
              example:
                id: 35a4e262-f2b8-4eb7-bdb2-012b02c7012d
                object: chat.completion
                model: deepseek-v4-flash-vision-exp
                choices:
                  - index: 0
                    message:
                      role: assistant
                      content: >-
                        The image shows a notification stating that all checks
                        have passed, including a successful Mintlify deployment.
                    finish_reason: stop
                usage:
                  prompt_tokens: 295
                  completion_tokens: 49
                  total_tokens: 344
                  prompt_cache_hit_tokens: 0
                  prompt_cache_miss_tokens: 295
        '400':
          description: |
            Invalid request. Common causes:
            unsupported image format (`You have uploaded an unsupported image`),
            the URL could not be downloaded (`Failed to download image`),
            an image above 32 MiB (`image file size exceeds limit 32 MB`),
            a URL longer than 8192 characters,
            `max_tokens` above 393,216,
            or a `detail` value other than low/high/original/auto
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized - invalid API Key
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: Rate limited or insufficient balance
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '503':
          description: Wrong model name, or no available channel in the group
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashVisionChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Model ID, always deepseek-v4-flash-vision-exp
          enum:
            - deepseek-v4-flash-vision-exp
          default: deepseek-v4-flash-vision-exp
        messages:
          type: array
          description: >-
            Message array. content is either a plain string or an array of
            content parts for mixed text and images
          items:
            $ref: '#/components/schemas/VisionMessage'
        max_tokens:
          type: integer
          description: >-
            Output token budget, hard ceiling 393,216. Thinking text counts
            against it, so use 2000 or more with thinking on, otherwise content
            may come back empty
          default: 800
          maximum: 393216
        thinking:
          type: object
          description: >-
            Thinking toggle. Pass {"type": "disabled"} to turn it off, saving 80
            input tokens and all reasoning output. Only effective in the default
            group
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
                - auto
              default: disabled
        reasoning_effort:
          type: string
          description: >-
            Reasoning depth. In testing none reliably disables thinking;
            low/high/max showed no stable difference. Only effective in the
            default group
          enum:
            - none
            - low
            - medium
            - high
            - max
        stream:
          type: boolean
          description: >-
            Stream the response over SSE. Pair with stream_options.include_usage
            to get usage in the final chunk
          default: false
        response_format:
          type: object
          description: >-
            Output format. Only {"type": "json_object"} works; json_schema
            returns This response_format type is unavailable now
          properties:
            type:
              type: string
              enum:
                - text
                - json_object
        temperature:
          type: number
          description: Sampling temperature
        top_p:
          type: number
          description: Nucleus sampling threshold
        stop:
          type: array
          description: Stop sequences
          items:
            type: string
        seed:
          type: integer
          description: Random seed
        logprobs:
          type: boolean
          description: >-
            Return token log probabilities; populated in testing (default group
            only)
        top_logprobs:
          type: integer
          description: Number of candidates per position, range 0-20
          minimum: 0
          maximum: 20
        tools:
          type: array
          description: >-
            Function Call tool list in OpenAI format. Use it instead of
            json_schema when you need structured output
          items:
            type: object
    DeepSeekV4FlashVisionChatResponse:
      type: object
      properties:
        id:
          type: string
          description: Request ID
        object:
          type: string
        model:
          type: string
        choices:
          type: array
          description: >-
            Completion results. Besides content, message carries
            reasoning_content when thinking is on
          items:
            type: object
        usage:
          $ref: '#/components/schemas/VisionUsage'
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            message:
              type: string
              description: The original error message from DeepSeek upstream
            type:
              type: string
            code:
              type: string
    VisionMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          description: Message role. Image parts may only appear in user messages
          enum:
            - system
            - user
            - assistant
            - tool
        content:
          description: A string, or an array of content parts
          oneOf:
            - type: string
              description: Plain text message
            - type: array
              description: Mixed text and image parts
              items:
                $ref: '#/components/schemas/VisionContentPart'
    VisionUsage:
      type: object
      description: Usage. Tokens converted from images are included in prompt_tokens
      properties:
        prompt_tokens:
          type: integer
          description: Total input tokens (text plus image conversion)
        completion_tokens:
          type: integer
        total_tokens:
          type: integer
        prompt_cache_hit_tokens:
          type: integer
          description: >-
            Cache hit size. The hit stops before the first image; images
            themselves are never cached
        prompt_cache_miss_tokens:
          type: integer
    VisionContentPart:
      type: object
      description: >-
        A content part. type decides which fields apply: text uses text;
        image_url uses image_url; file uses file_data plus filename
      required:
        - type
      properties:
        type:
          type: string
          enum:
            - text
            - image_url
            - file
        text:
          type: string
          description: Text body when type is text
        image_url:
          $ref: '#/components/schemas/VisionImageUrl'
        file_data:
          type: string
          description: >-
            Base64 data URL when type is file; equivalent to the image_url
            channel. Note that detail on a file block is silently ignored
        filename:
          type: string
          description: File name when type is file; identification only
    VisionImageUrl:
      type: object
      required:
        - url
      properties:
        url:
          type: string
          description: >-
            A public http(s) link (max 8192 characters, must download within 60
            seconds), or a base64 data URL such as data:image/jpeg;base64,...
            (max 32 MiB per image)
          examples:
            - https://docs.apiyi.com/images/checks-passed.png
            - data:image/jpeg;base64,<BASE64_DATA>
        detail:
          type: string
          description: >-
            Image processing fidelity. low downscales to 512x512 first, taking a
            1600x1200 image from 354 tokens to 142; high/original/auto keep the
            original. Effective only in the default group and only on image_url
            parts
          enum:
            - low
            - high
            - original
            - auto
          default: original
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        The API Key from the APIYI console; the token must be in the default
        group

````