> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справка по Chat API Qwen3.8-Max

> Справка по API Chat Completions Qwen3.8-Max и интерактивная песочница: формат, совместимый с OpenAI, с уровнями reasoning_effort, потоковой передачей, вызовом функций и входными данными изображений/видео.

<Info>
  Используйте playground справа, чтобы отправлять запросы напрямую: укажите `Bearer sk-your-api-key` в **Authorization**. В примере уже указан `reasoning_effort: "none"` — нажмите send, чтобы увидеть ответ.
</Info>

<Tip>
  По умолчанию модель **использует рассуждение** (tier `xhigh`, тарифицируется как output). В примере рассуждение отключено, чтобы отладка была быстрой и дешевой; для сложного рассуждения удалите поле `reasoning_effort` и увеличьте `max_tokens` до 4000+. Полное описание см. в [обзоре Qwen3.8-Max](/ru/api-capabilities/qwen-3-8/overview).
</Tip>

## Краткая справка по параметрам

| Параметр           | Тип           | Обязательно | Примечания                                                                                                                         |
| ------------------ | ------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `model`            | string        | ✓           | Всегда `qwen3.8-max`                                                                                                               |
| `messages`         | array         | ✓           | Стандартный массив сообщений OpenAI; `content` может быть мультимодальным массивом (`image_url` / `video_url` принимают data URLs) |
| `max_tokens`       | int           |             | Бюджет вывода для видимого ответа, диапазон `[1, 131072]`. **Не ограничивает tokens для рассуждения**                              |
| `reasoning_effort` | string        |             | `none` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max`, по умолчанию `xhigh`                                             |
| `stream`           | bool          |             | Потоковая передача SSE; этот эндпоинт возвращает usage в финальном фрагменте даже без `stream_options`                             |
| `response_format`  | object        |             | Структурированный вывод `json_schema`, строго проверяемый в тестировании                                                           |
| `tools`            | array         |             | Список инструментов для вызова функций, подтверждено, что работает                                                                 |
| `tool_choice`      | string/object |             | `auto` / `none` работают как есть; `required` или именованная функция требует `reasoning_effort: "none"`                           |
| `n`                | int           |             | Значения больше 1 требуют `reasoning_effort: "none"`                                                                               |
| `temperature`      | number        |             | Допустимый диапазон `[0.0, 2.0)`; при передаче `2` возвращается 400                                                                |
| `stop`             | array         |             | Последовательности остановки, подтверждено, что работает                                                                           |

## Три распространенные ошибки

<Warning>
  **1. `max_tokens` не ограничивает рассуждение.** Мы установили `max_tokens=1` и все равно заплатили за 1,054 output tokens (1,045 из них — на рассуждение). Используйте `reasoning_effort="none"`, чтобы контролировать стоимость.

  **2. Принудительные вызовы tools требуют отключить рассуждение.** Если `tool_choice` установлен в `"required"` или именованную функцию, режим рассуждения возвращает 400 или молча пропускает вызов — передавайте `reasoning_effort="none"` вместе с ним.

  **3. `thinking_budget` не влияет.** Любое значение работает как тарифный уровень `low`; вместо этого используйте `reasoning_effort`.
</Warning>

## Чтение ответа

* Трасса рассуждения находится в `choices[0].message.reasoning_content` (возвращается, пока включено рассуждение)
* Стоимость рассуждения находится в `usage.completion_tokens_details.reasoning_tokens`; попадания в кэш — в `usage.prompt_tokens_details.cached_tokens`
* **Некоторые upstream-маршруты не сообщают эти два поля** (примерно у одной трети запросов в тестировании) — учитывайте это, если вам нужен точный учет стоимости рассуждения
* Семь допустимых значений `reasoning_effort` отображаются только в четыре реальных уровня; `max` не рассуждает глубже, чем `xhigh`
* Недопустимое значение `reasoning_effort` возвращает 400 со списком всех допустимых значений, а не выполняет тихое понижение уровня

## Связанное

* [Обзор Qwen3.8-Max](/ru/api-capabilities/qwen-3-8/overview) — полная матрица возможностей, тарификация и лучшие практики
* [Серия Qwen3.6 (устаревшая)](/ru/api-capabilities/qwen-3-6/overview) — предыдущие пять моделей


## OpenAPI

````yaml api-reference/qwen-3-8-max-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Qwen3.8-Max Chat Completions API
  description: >
    Qwen3.8-Max (`qwen3.8-max`) — OpenAI-compatible Chat Completions endpoint;
    any OpenAI SDK works by switching base_url.


    - Input $1.65 / output $4.95 per 1M tokens (output includes thinking) —
    17.5% below Alibaba Cloud's list price

    - 1M context, 131K max output, native image and video input

    - **Thinking is ON by default** (tier `xhigh`); `reasoning_effort` maps to
    four real tiers in practice: `none` / `minimal`≡`low` / `medium` /
    `high`≡`xhigh`≡`max`

    - `max_tokens` truncates only the visible answer and **does not bound
    thinking tokens** — use `reasoning_effort: "none"` to control cost

    - Supports streaming, function calling, response_format json_schema

    - Forced `tool_choice` and `n > 1` both require `reasoning_effort: "none"`

    - `thinking_budget` values are ignored; built-in web search is unavailable


    **Authentication**: header `Authorization: Bearer YOUR_API_KEY`


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`
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
        - Text Generation
      summary: 'Chat completion: Qwen3.8-Max (OpenAI compatible)'
      description: >
        Run a chat completion with `qwen3.8-max`, fully compatible with the
        OpenAI format.


        The example ships with `reasoning_effort: "none"` — the recommended
        setting for everyday chat,

        which cut output tokens to roughly 1/30 in testing. For hard reasoning,
        drop that field

        (returning to the default `xhigh` tier) and raise `max_tokens` to 4000+.
      operationId: chatqwen3_8_max
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: qwen3.8-max
              messages:
                - role: user
                  content: Introduce yourself in one sentence.
              max_tokens: 1000
              reasoning_effort: none
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: forced tool_choice or n > 1 while
            thinking is on; an illegal reasoning_effort value; temperature
            outside [0.0, 2.0); max_tokens outside [1, 131072]
        '401':
          description: Invalid API key
        '429':
          description: Rate limit exceeded
      security:
        - bearerAuth: []
components:
  schemas:
    ChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Always qwen3.8-max
        messages:
          type: array
          description: Standard OpenAI message array
          items:
            type: object
            properties:
              role:
                type: string
                enum:
                  - system
                  - user
                  - assistant
                  - tool
              content:
                description: String or multimodal array (text / image_url / video_url)
        max_tokens:
          type: integer
          description: >-
            Output budget for the visible answer, range [1, 131072]. Note: does
            not bound thinking tokens
        reasoning_effort:
          type: string
          enum:
            - none
            - minimal
            - low
            - medium
            - high
            - xhigh
            - max
          description: >-
            Thinking tier, default xhigh. Measured to have only four real tiers:
            none / minimal≡low / medium / high≡xhigh≡max
        temperature:
          type: number
          description: Valid range [0.0, 2.0); passing 2 returns 400
        top_p:
          type: number
          description: Valid range (0.0, 1.0]
        top_k:
          type: integer
        stream:
          type: boolean
          description: >-
            SSE streaming. This endpoint returns usage in the final chunk even
            without stream_options
        stop:
          type: array
          description: Stop sequences, verified working
          items:
            type: string
        response_format:
          type: object
          description: >-
            Structured output; json_schema held strictly in testing. Pair it
            with reasoning_effort: none
        tools:
          type: array
          description: Function calling tool list, verified working
          items:
            type: object
        tool_choice:
          description: >-
            auto / none work as-is; required or a named function requires
            reasoning_effort: none
        parallel_tool_calls:
          type: boolean
          description: Set false to limit to a single tool call, verified working
        'n':
          type: integer
          description: 'Number of candidates. Values above 1 require reasoning_effort: none'
        logprobs:
          type: boolean
    ChatResponse:
      type: object
      properties:
        id:
          type: string
        model:
          type: string
        choices:
          type: array
          items:
            type: object
            properties:
              message:
                type: object
                properties:
                  role:
                    type: string
                  content:
                    type: string
                  reasoning_content:
                    type: string
                    description: Thinking trace, returned while thinking is on
                  tool_calls:
                    type: array
                    items:
                      type: object
              finish_reason:
                type: string
        usage:
          type: object
          description: >-
            Usage stats. Some upstream routes do not report reasoning_tokens or
            cached_tokens
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
              description: Includes thinking tokens
            total_tokens:
              type: integer
            completion_tokens_details:
              type: object
              properties:
                reasoning_tokens:
                  type: integer
            prompt_tokens_details:
              type: object
              properties:
                cached_tokens:
                  type: integer
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'Add Authorization: Bearer YOUR_API_KEY to the request header'

````