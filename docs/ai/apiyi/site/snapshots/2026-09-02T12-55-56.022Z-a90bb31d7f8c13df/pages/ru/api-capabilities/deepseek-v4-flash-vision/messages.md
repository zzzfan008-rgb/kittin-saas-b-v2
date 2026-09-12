> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision Messages API Reference

> Справочник и песочница Anthropic-native /v1/messages API для deepseek-v4-flash-vision-exp: источники изображений base64 и URL, переключатель thinking, полный round trip инструментов. Требуется token группы ClaudeCode.

<Warning>
  **Ваш token для этого эндпоинта должен быть в группе `ClaudeCode`. Это жёсткое требование.**

  Использование группы `default` приводит к двум наслаивающимся проблемам:

  1. Если не указывать `top_p`, каждый раз возвращается 400 `Invalid top_p value`
  2. Даже если `top_p` указан, повторная отправка блока `thinking` из первого хода во второй ход
     возвращает `unknown variant 'thinking', expected one of 'text', 'image_url', 'file'`
     —— а стандартные клиенты, такие как Claude Code и Anthropic SDK, всегда повторно отправляют его, поэтому
     **многоходовой режим всегда ломается**

  Переключитесь на группу `ClaudeCode`, и ни одна из этих проблем не возникнет. Для формата OpenAI используйте
  [Песочницу чата](/ru/api-capabilities/deepseek-v4-flash-vision/chat-completions) вместо этого.
</Warning>

<Info>
  Используйте песочницу справа, чтобы протестировать напрямую: поместите `sk-your-apiyi-key` в **x-api-key**
  (токен `ClaudeCode`, без префикса `Bearer `) и оставьте `anthropic-version` на `2023-06-01`.
  В примере используется общедоступное изображение и отключён thinking, так что вы можете нажать «Отправить» и сразу увидеть
  ответ.
</Info>

## Краткая справка по параметрам

| Параметр                                   | Тип    | Обязательный | По умолчанию | Примечания                                                                                       |
| ------------------------------------------ | ------ | ------------ | ------------ | ------------------------------------------------------------------------------------------------ |
| `model`                                    | string | ✓            | —            | Всегда `deepseek-v4-flash-vision-exp`                                                            |
| `max_tokens`                               | int    | ✓            | —            | Требуется в формате Anthropic, жесткий предел 393,216; используйте 2000+ при включённом thinking |
| `messages`                                 | array  | ✓            | —            | `content` — это строка или массив блоков содержимого                                             |
| `system`                                   | string |              | —            | Системный prompt                                                                                 |
| `thinking.type`                            | string |              | `enabled`    | `disabled` оставляет только блок `text` в `content`                                              |
| `thinking.budget_tokens`                   | int    |              | —            | Бюджет рассуждения при `enabled`                                                                 |
| `stream`                                   | bool   |              | `false`      | SSE-потоковая передача со стандартной последовательностью событий Anthropic                      |
| `top_p`                                    | number |              | —            | Необязательно в группе `ClaudeCode`                                                              |
| `temperature` / `top_k` / `stop_sequences` | —      |              | —            | Все вступают в силу                                                                              |
| `tools`                                    | array  |              | —            | Стандартный формат Anthropic `input_schema`                                                      |

## Two ways to send an image

### `source.type = "base64"`

```json theme={null}
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/jpeg",
    "data": "<BASE64>"
  }
}
```

Обратите внимание, что `data` **не** содержит префикса `data:image/jpeg;base64,` —— это отличается от формата
OpenAI.

### `source.type = "url"`

```json theme={null}
{
  "type": "image",
  "source": {"type": "url", "url": "https://example.com/image.jpg"}
}
```

<Note>
  `source.type = "url"` **работает только в группе `ClaudeCode`**; группа `default` возвращает
  `You have uploaded an unsupported image`.

  `source.type = "file"` требует Files API, который эта платформа не предоставляет.
</Note>

## Содержимое ответа представляет собой массив блоков

| Случай                              | `content`                                                |
| ----------------------------------- | -------------------------------------------------------- |
| По умолчанию (рассуждение включено) | `[{"type": "thinking", ...}, {"type": "text", ...}]`     |
| `thinking.type = "disabled"`        | `[{"type": "text", ...}]`                                |
| При вызове инструмента              | `[{"type": "thinking", ...}, {"type": "tool_use", ...}]` |

В группе `ClaudeCode` блок `thinking` содержит поле `signature`, а потоковая передача также выдает `signature_delta`.

## Многоходовый диалог и возврат через инструмент

Поместите весь `content` предыдущего хода ассистента обратно в `messages` —— **включая блок
`thinking`, не удаляйте его** —— затем добавьте `tool_result`:

```json theme={null}
{
  "model": "deepseek-v4-flash-vision-exp",
  "max_tokens": 1500,
  "tools": [{
    "name": "record_shape",
    "input_schema": {
      "type": "object",
      "properties": {
        "shape": {"type": "string"},
        "color": {"type": "string"}
      },
      "required": ["shape", "color"]
    }
  }],
  "messages": [
    {"role": "user", "content": [
      {"type": "text", "text": "Look at the image and call record_shape."},
      {"type": "image", "source": {"type": "url", "url": "https://example.com/shape.jpg"}}
    ]},
    {"role": "assistant", "content": "<the content array returned by the previous turn, verbatim>"},
    {"role": "user", "content": [
      {"type": "tool_result", "tool_use_id": "<the tool_use id from the previous turn>", "content": "{\"ok\":true}"}
    ]}
  ]
}
```

Второй ход проходит успешно в тестировании. **Именно здесь группа `default` возвращает 400**,
и именно по этому пути идет каждый клиент в стиле Claude Code —— поэтому группа должна быть правильной.

## Как читаются поля кэша

Применяется автоматическое кэширование префикса, сопоставленное со стандартными полями Anthropic:

| Поле                          | Поведение                                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cache_read_input_tokens`     | Размер попадания в автоматический кэш префикса. Попадание останавливается перед первым изображением; **сами изображения никогда не кэшируются**                                                  |
| `cache_creation_input_tokens` | **Всегда 0.** Upstream использует автоматическое кэширование префикса и игнорирует явные маркеры `cache_control`                                                                                 |
| `input_tokens`                | После попадания здесь хранится **только некэшированный остаток**, в отличие от формата OpenAI, где `prompt_tokens` всегда равно полному количеству. Эти два значения нельзя напрямую согласовать |

Запросы с изображением впервые получают попадание на 3-м вызове (только текст — на 2-м). Помещайте ваши фиксированные длинные инструкции **перед** изображением, чтобы они кэшировались.

## Распространённые ошибки

| Ошибка                                                      | Причина                                                                                        |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Invalid top_p value, the valid range of top_p is (0, 1.0]` | Токен группы `default` без `top_p` —— переключитесь на `ClaudeCode`                            |
| `unknown variant 'thinking'`                                | Токен группы `default`, повторно отправляющий блок `thinking` —— переключитесь на `ClaudeCode` |
| `You have uploaded an unsupported image`                    | Неподдерживаемый формат или токен группы `default` с `source.type = "url"`                     |
| `Image in assistant message is unsupported`                 | Изображения могут появляться только в сообщениях `user`                                        |
| `image file size exceeds limit 32 MB`                       | Изображение больше 32 MiB                                                                      |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-vision-messages-openapi-en.yaml POST /v1/messages
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Vision Messages API
  description: >
    DeepSeek V4 Flash Vision (`deepseek-v4-flash-vision-exp`) — Anthropic-native
    `/v1/messages` endpoint with image input.


    - **Your token must be in the `ClaudeCode` group.** This is a hard
    requirement, not a suggestion

    - **Do not call this endpoint with a `default` group token**: omitting
    `top_p` returns 400 every time, and even with
      `top_p` supplied, replaying the first turn's `thinking` block into the second turn returns
      `unknown variant 'thinking'` — standard clients such as Claude Code and the Anthropic SDK always replay it,
      so multi-turn always breaks
    - **Two ways to send an image**: `source.type` of `base64` or `url` (`file`
    needs the Files API, which this platform does not offer)

    - **Images become input tokens by size**: 384 per image maximum, large
    images are rescaled to roughly an 800x800 equivalent

    - **`detail` has no effect on this endpoint**; use the OpenAI-format
    endpoint if you need that token saving

    - **Thinking mode is on by default**: for plain image reading pass
    `thinking: {"type": "disabled"}`, which works in both groups here


    **Authentication**: add `x-api-key: YOUR_API_KEY` and `anthropic-version:
    2023-06-01` to the request headers


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`, choosing the `ClaudeCode` group
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - anthropicKey: []
paths:
  /v1/messages:
    post:
      tags:
        - Vision
      summary: 'Messages with vision: DeepSeek V4 Flash Vision (Anthropic format)'
      description: >
        Run a conversation with images using `deepseek-v4-flash-vision-exp` in
        the native Anthropic format.


        - The example uses a public image URL, so you can hit send right away.
        For a local file use
          `{"type": "base64", "media_type": "image/jpeg", "data": "<BASE64>"}`
        - The response `content` is an array of blocks: `[thinking, text]` with
        thinking on, just `[text]` with it off

        - Tool use works end to end: replay `thinking` (with its `signature`)
        plus `tool_use`, then send `tool_result`,
          and the second turn succeeds
        - Images may only appear in `user` messages
      operationId: createDeepSeekV4FlashVisionMessage
      parameters:
        - name: anthropic-version
          in: header
          required: true
          description: Anthropic API version, always 2023-06-01
          schema:
            type: string
            default: '2023-06-01'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VisionMessagesRequest'
            example:
              model: deepseek-v4-flash-vision-exp
              max_tokens: 800
              thinking:
                type: disabled
              messages:
                - role: user
                  content:
                    - type: text
                      text: What is in this image? Answer in one sentence.
                    - type: image
                      source:
                        type: url
                        url: https://docs.apiyi.com/images/checks-passed.png
      responses:
        '200':
          description: Generation succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VisionMessagesResponse'
              example:
                id: a5cb230d-ac08-43ed-8c4b-8f88b37119d3
                type: message
                role: assistant
                model: deepseek-v4-flash-vision-exp
                content:
                  - type: text
                    text: >-
                      The image shows a notification stating that all checks
                      have passed, including a successful Mintlify deployment.
                stop_reason: end_turn
                usage:
                  input_tokens: 295
                  output_tokens: 51
                  cache_creation_input_tokens: 0
                  cache_read_input_tokens: 0
        '400':
          description: >
            Invalid request. Common causes:

            a `default` group token without `top_p` (`Invalid top_p value`),

            a `default` group token replaying a `thinking` block (`unknown
            variant 'thinking'`),

            an unsupported image format,

            or an image placed in an assistant message (`Image in assistant
            message is unsupported`)
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
        - anthropicKey: []
components:
  schemas:
    VisionMessagesRequest:
      type: object
      required:
        - model
        - max_tokens
        - messages
      properties:
        model:
          type: string
          description: Model ID, always deepseek-v4-flash-vision-exp
          enum:
            - deepseek-v4-flash-vision-exp
          default: deepseek-v4-flash-vision-exp
        max_tokens:
          type: integer
          description: >-
            Output token budget (required in the Anthropic format), hard ceiling
            393,216. Use 2000 or more with thinking on
          default: 800
          maximum: 393216
        messages:
          type: array
          description: >-
            Message array. content is either a plain string or an array of
            content blocks for mixed text and images
          items:
            $ref: '#/components/schemas/AnthropicMessage'
        system:
          type: string
          description: System prompt
        thinking:
          type: object
          description: >-
            Thinking toggle. With {"type": "disabled"} the response content
            holds only a text block. Works in both groups on this endpoint
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: disabled
            budget_tokens:
              type: integer
              description: Thinking budget when type is enabled
        stream:
          type: boolean
          description: >-
            Stream the response over SSE, emitting the standard Anthropic
            message_start / content_block_delta / message_stop events
          default: false
        temperature:
          type: number
          description: Sampling temperature
        top_p:
          type: number
          description: >-
            Nucleus sampling threshold. Optional in the ClaudeCode group; in the
            default group, omitting it returns 400
        top_k:
          type: integer
          description: Candidate cutoff
        stop_sequences:
          type: array
          description: Stop sequences
          items:
            type: string
        tools:
          type: array
          description: >-
            Tool list in the standard Anthropic input_schema format. Verified
            with streaming increments and a full two-turn round trip
          items:
            type: object
    VisionMessagesResponse:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        role:
          type: string
        model:
          type: string
        content:
          type: array
          description: >-
            Array of content blocks. [thinking, text] with thinking on, just
            [text] with it off, and [thinking, tool_use] when calling a tool
          items:
            type: object
        stop_reason:
          type: string
        usage:
          $ref: '#/components/schemas/AnthropicUsage'
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
    AnthropicMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          description: Message role. Image blocks may only appear in user messages
          enum:
            - user
            - assistant
        content:
          description: A string, or an array of content blocks
          oneOf:
            - type: string
              description: Plain text message
            - type: array
              description: Array of content blocks
              items:
                $ref: '#/components/schemas/AnthropicContentBlock'
    AnthropicUsage:
      type: object
      description: >-
        Usage. Note this differs from the OpenAI format: after a cache hit
        input_tokens holds only the uncached remainder, so it cannot be
        reconciled with prompt_tokens directly
      properties:
        input_tokens:
          type: integer
        output_tokens:
          type: integer
        cache_creation_input_tokens:
          type: integer
          description: >-
            Always 0. Upstream uses automatic prefix caching and ignores
            explicit cache_control markers
        cache_read_input_tokens:
          type: integer
          description: >-
            Automatic prefix cache hit size. The hit stops before the first
            image; images themselves are never cached
    AnthropicContentBlock:
      type: object
      description: >-
        A content block. type text uses the text field; type image uses the
        source field
      required:
        - type
      properties:
        type:
          type: string
          enum:
            - text
            - image
            - tool_use
            - tool_result
            - thinking
        text:
          type: string
          description: Text body when type is text
        source:
          $ref: '#/components/schemas/AnthropicImageSource'
    AnthropicImageSource:
      type: object
      description: Image source. Use either base64 or url
      required:
        - type
      properties:
        type:
          type: string
          description: >-
            base64 for an inline image; url for a public link (ClaudeCode group
            only); file needs the Files API, which this platform does not offer
          enum:
            - base64
            - url
        media_type:
          type: string
          description: Media type when type is base64
          enum:
            - image/jpeg
            - image/png
            - image/gif
            - image/webp
        data:
          type: string
          description: >-
            Image data when type is base64, without the data: prefix. Max 32 MiB
            per image
        url:
          type: string
          description: Public image link when type is url, max 8192 characters
          examples:
            - https://docs.apiyi.com/images/checks-passed.png
  securitySchemes:
    anthropicKey:
      type: apiKey
      in: header
      name: x-api-key
      description: >-
        Your APIYI token, the raw sk- key. The token must be in the ClaudeCode
        group

````