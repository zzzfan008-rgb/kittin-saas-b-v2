> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник по Responses API для Seed 2.1 Turbo

> Справочник по Responses API для Seed 2.1 Turbo (dola-seed-2-1-turbo-260628) и интерактивная песочница: нативный многоходовый previous_response_id и связанное явное кэширование.

<Info>
  Используйте Playground справа: поместите `Bearer sk-your-api-key` в **Authorization**, заполните `input` и отправьте запрос. В массиве `output` ответа элементы `type: "reasoning"` — это сводки рассуждения, а `type: "message"` — фактический ответ.
</Info>

<Tip>
  Для многоходовых бесед передавайте `id` предыдущего ответа (префикс `resp_`) как `previous_response_id` следующего вызова — заново отправлять историю не нужно. Подробности о явном кэшировании и управлении рассуждением приведены в [Seed 2.1 Turbo Обзор](/ru/api-capabilities/dola-seed-2-1-turbo/overview).
</Tip>

<Warning>
  * Небольшой `max_output_tokens` уходит на рассуждение, возвращая `status: "incomplete"` с **пустым текстом** — начинайте с 1500
  * Явное кэширование `caching: {"type": "enabled"}` срабатывает только при **цепочке** через `previous_response_id`; простое повторение того же префикса никогда не дает попадания в кэш (и также отключает неявный кэш префикса)
</Warning>

## Краткая справка по параметрам

| Parameter              | Type           | Required | Default    | Notes                                                                                                                        |
| ---------------------- | -------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `model`                | string         | ✓        | —          | Фиксировано: `dola-seed-2-1-turbo-260628`                                                                                    |
| `input`                | string / array | ✓        | —          | Строка или массив сообщений (включая элементы `function_call_output`)                                                        |
| `max_output_tokens`    | int            |          | —          | Бюджет вывода, включая рассуждение; рекомендуется 1500+                                                                      |
| `reasoning.effort`     | string         |          | —          | `low` / `medium` / `high`; измерено примерно 371 (низкий) против примерно 1317 (высокий) reasoning tokens                    |
| `previous_response_id` | string         |          | —          | Идентификатор предыдущего ответа для нативного многотурового режима; обеспечивает явные попадания в кэш при полном контексте |
| `caching.type`         | string         |          | `disabled` | `enabled` включает явное кэширование (требует цепочки)                                                                       |
| `store`                | bool           |          | `true`     | Сохранить этот ответ для последующего использования                                                                          |
| `stream`               | bool           |          | `false`    | SSE-поток событий (`response.created` → `response.completed`)                                                                |
| `text.format`          | object         |          | —          | Структурированный вывод, поддерживает `json_schema` + `strict`                                                               |
| `tools`                | array          |          | —          | Список инструментов для function-calling (плоский формат)                                                                    |

## Основные моменты ответа

* Когда `status` = `incomplete`, проверьте `incomplete_details.reason` (обычно `length`: рассуждение съело бюджет)
* Расход на рассуждение: `usage.output_tokens_details.reasoning_tokens`
* Попадания в кэш: `usage.input_tokens_details.cached_tokens` (в наших тестах на второй связанной реплике был полный доступ к предыдущему контексту, что примерно вдвое снизило задержку)
* Поле response `caching` отражает режим кэширования, который фактически был включен


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-responses-openapi-en.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Responses API
  description: >
    ByteDance Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) — native Responses
    API endpoint.


    - Full Responses semantics: event stream, reasoning items, multi-turn via
    `previous_response_id`

    - **Explicit caching**: `caching: {"type": "enabled"}` combined with
    `previous_response_id` chaining hits the entire previous context on turn 2
    (measured: 7873 cached tokens, ~2x faster)

    - Reasoning is on by default: a small `max_output_tokens` gets eaten by
    thinking, yielding `status: incomplete` with empty text - use 1500+

    - Supports `reasoning.effort` tiers, structured output (`text.format`), and
    function calling


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` header


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
  /v1/responses:
    post:
      tags:
        - Text Generation
      summary: Responses API with Seed 2.1 Turbo (native multi-turn / explicit cache)
      description: >
        Call the Responses API with `dola-seed-2-1-turbo-260628`.


        - For multi-turn conversations pass `previous_response_id` instead of
        resending history

        - With `caching.enabled`, cache hits require `previous_response_id`
        chaining; merely repeating the same prefix does not hit
      operationId: createSeedResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedResponsesRequest'
            example:
              model: dola-seed-2-1-turbo-260628
              input: Introduce yourself in one sentence
              max_output_tokens: 1500
      responses:
        '200':
          description: >-
            Generation succeeded. The output array contains reasoning and
            message items
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedResponsesResponse'
        '400':
          description: Invalid parameters
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: >-
            Wrong model name or no available channel for your group (this model
            returns 503 instead of 404 for unknown model names)
      security:
        - bearerAuth: []
components:
  schemas:
    SeedResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        input:
          type: string
          description: >-
            Input content. Either a string or a message array ([{role, content},
            ...], including function_call_output items)
          example: Introduce yourself in one sentence
        max_output_tokens:
          type: integer
          description: >-
            Max output tokens (thinking included). Too small yields incomplete
            with empty text - use 1500+
          default: 1500
        reasoning:
          type: object
          description: >-
            Thinking depth control. Measured: effort low ~371, high ~1317
            reasoning tokens
          properties:
            effort:
              type: string
              enum:
                - low
                - medium
                - high
        previous_response_id:
          type: string
          description: >-
            Previous response id (resp_ prefix) for native multi-turn; combine
            with caching.enabled for explicit cache hits
        caching:
          type: object
          description: >-
            Explicit cache switch. enabled only hits when chained via
            previous_response_id
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
        store:
          type: boolean
          description: >-
            Whether to store this response for later previous_response_id
            reference
        stream:
          type: boolean
          description: >-
            Stream via SSE (response.created → response.output_text.delta →
            response.completed)
          default: false
        text:
          type: object
          description: >-
            Structured output. Supports {"format": {"type": "json_schema", name,
            strict, schema}}
        tools:
          type: array
          description: >-
            Function-calling tool list (flat Responses format: {type, name,
            description, parameters})
          items:
            type: object
    SeedResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: >-
            Response ID (resp_ prefix), usable as the next turn's
            previous_response_id
        status:
          type: string
          description: >-
            completed / incomplete (incomplete when thinking eats the token
            budget)
        output:
          type: array
          description: >-
            Output items: reasoning (thinking summary), message (text),
            function_call, etc.
          items:
            type: object
        usage:
          type: object
          description: >-
            Usage. output_tokens_details.reasoning_tokens = thinking spend;
            input_tokens_details.cached_tokens = cache hits
        caching:
          type: object
          description: The cache mode actually in effect for this request
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````