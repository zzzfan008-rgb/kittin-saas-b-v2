> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник API чата Seed 2.1 Turbo

> Справочник API Chat Completions для Seed 2.1 Turbo (dola-seed-2-1-turbo-260628) и интерактивная песочница: совместимо с OpenAI, с переключателем рассуждения и уровнями.

<Info>
  Используйте Playground справа: поместите `Bearer sk-your-api-key` в **Authorization**. В примере по умолчанию deep thinking отключен (`thinking.disabled`), поэтому при первой отправке вы получите быстрый ответ.
</Info>

<Tip>
  У модели **deep thinking включен по умолчанию** — даже на простые вопросы сначала уходят сотни reasoning tokens. Во время отладки сохраняйте `"thinking": {"type": "disabled"}` из примера; переключайтесь на `reasoning_effort` (low / medium / high), когда вам действительно нужно reasoning. Возможности, тарификация и кэширование описаны в [Обзор Seed 2.1 Turbo](/ru/api-capabilities/dola-seed-2-1-turbo/overview).
</Tip>

<Warning>
  * При включенном thinking оставляйте запас `max_tokens` (reasoning учитывается в бюджете вывода) — рекомендуется 3000+
  * Опечатка в названии модели возвращает **503** (нет доступного канала), а не 404
</Warning>

## Краткая справка по параметрам

| Параметр           | Тип    | Обязательно | По умолчанию | Примечания                                                                                           |
| ------------------ | ------ | ----------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `model`            | string | ✓           | —            | Фиксировано: `dola-seed-2-1-turbo-260628`                                                            |
| `messages`         | array  | ✓           | —            | Стандартный массив сообщений OpenAI                                                                  |
| `max_tokens`       | int    |             | —            | Бюджет вывода; 3000+ при включенном рассуждении                                                      |
| `thinking.type`    | string |             | `enabled`    | **ВКЛ по умолчанию**; `disabled` отключает рассуждение                                               |
| `reasoning_effort` | string |             | —            | `low` / `medium` / `high`; измерено примерно 226 (низкий) против \~960 (высокий) токенов рассуждения |
| `stream`           | bool   |             | `false`      | Потоковая передача SSE; добавьте `stream_options.include_usage` для сведений об использовании        |
| `response_format`  | object |             | —            | Структурированный вывод, поддерживает `json_schema` + `strict`                                       |
| `tools`            | array  |             | —            | Список инструментов для вызова функций                                                               |

## Ключевые моменты ответа

* При включённом рассуждении `choices[0].message` содержит `reasoning_content` (полный текст рассуждения) помимо `content`
* Расход на рассуждение: `usage.completion_tokens_details.reasoning_tokens`
* Неявные попадания в кэш: `usage.prompt_tokens_details.cached_tokens` (повторяющийся длинный префикс попадает в кэш со 2-го запроса)


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Chat Completions API
  description: >
    ByteDance Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) — OpenAI-compatible
    Chat Completions endpoint.


    - **Deep thinking is ON by default**: without extra params the model returns
    `reasoning_content` and burns extra tokens; pass `thinking: {"type":
    "disabled"}` for latency/cost-sensitive calls

    - Supports `reasoning_effort` tiers (low / medium / high) to control
    thinking depth

    - Supports structured output (`response_format: json_schema`), function
    calling, and streaming

    - Implicit caching is automatic: a repeated long prefix hits `cached_tokens`
    from the 2nd request


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
  /v1/chat/completions:
    post:
      tags:
        - Text Generation
      summary: Chat completion with Seed 2.1 Turbo
      description: >
        Run chat completions with `dola-seed-2-1-turbo-260628`, fully
        OpenAI-compatible.


        - Deep thinking is enabled by default and adds a `reasoning_content`
        field; the example disables it for fast debugging

        - With thinking enabled, give `max_tokens` generous headroom (reasoning
        counts against it)
      operationId: createSeedChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedChatRequest'
            example:
              model: dola-seed-2-1-turbo-260628
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 500
              thinking:
                type: disabled
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedChatResponse'
        '400':
          description: Invalid parameters (e.g. malformed json_schema, wrong types)
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
    SeedChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Model ID, fixed to dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        messages:
          type: array
          description: Conversation messages, standard OpenAI format
          items:
            type: object
            required:
              - role
              - content
            properties:
              role:
                type: string
                description: Message role
                enum:
                  - system
                  - user
                  - assistant
                  - tool
              content:
                type: string
                description: Message content
        max_tokens:
          type: integer
          description: >-
            Max output tokens. Reasoning counts against this too - give it
            headroom (e.g. 2000+) when thinking is on
          default: 500
        thinking:
          type: object
          description: >-
            Deep-thinking switch. ON by default; pass {"type": "disabled"} to
            turn it off and cut latency and output tokens sharply
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: disabled
        reasoning_effort:
          type: string
          description: >-
            Thinking depth tier (do not combine with thinking.disabled).
            Measured: low ~226, high ~960 reasoning tokens
          enum:
            - low
            - medium
            - high
        stream:
          type: boolean
          description: >-
            Stream via SSE. Combine with stream_options.include_usage to get
            usage in the final chunk
          default: false
        temperature:
          type: number
          description: Sampling temperature
        response_format:
          type: object
          description: >-
            Structured output. Supports {"type": "json_schema", "json_schema":
            {name, strict, schema}}
        tools:
          type: array
          description: Function-calling tool list, standard OpenAI format
          items:
            type: object
    SeedChatResponse:
      type: object
      properties:
        id:
          type: string
          description: Request ID
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
          type: object
          description: >-
            Usage. completion_tokens_details.reasoning_tokens = thinking spend;
            prompt_tokens_details.cached_tokens = implicit cache hits
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````