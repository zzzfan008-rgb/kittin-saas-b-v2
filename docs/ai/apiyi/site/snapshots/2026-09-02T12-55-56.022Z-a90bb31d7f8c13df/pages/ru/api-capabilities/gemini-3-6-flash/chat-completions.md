> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash Справочник Chat API

> Справочник по Chat Completions API и интерактивная песочница: совместимый с OpenAI, с уровнями reasoning_effort, streaming, вызовом функций и поддержкой vision.

<Info>
  Используйте playground справа: поместите `Bearer sk-your-api-key` в **Authorization**. В примере по умолчанию используется `reasoning_effort: "low"`; нажмите отправку, чтобы увидеть ответ.
</Info>

<Tip>
  **Рассуждение включено по умолчанию** (тарифицируется как output). Оставляйте его на low для отладки; переключайтесь на `high` с `max_tokens` на 4000+ для сложных задач. Search grounding, code execution и другие встроенные инструменты недоступны в этом эндпоинте — вместо этого используйте [Native Playground](/ru/api-capabilities/gemini-3-6-flash/generate-content). Обзор и измеренные данные: [Обзор Gemini 3.6 Flash](/ru/api-capabilities/gemini-3-6-flash/overview).
</Tip>

## Краткая справка по параметрам

| Параметр           | Тип    | Обязателен | Примечания                                                                                                       |
| ------------------ | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `model`            | string | ✓          | Фиксировано: `gemini-3.6-flash`                                                                                  |
| `messages`         | array  | ✓          | Стандартные сообщения OpenAI; `content` может быть мультимодальным массивом (`image_url` поддерживает data URLs) |
| `max_tokens`       | int    |            | Квота вывода; рекомендуется 2000+ при включенном thinking (thinking тарифицируется как вывод)                    |
| `reasoning_effort` | string |            | Уровни thinking `low` / `medium` / `high`, подтверждено, что работает                                            |
| `stream`           | bool   |            | Потоковая передача SSE                                                                                           |
| `response_format`  | object |            | Структурированный output `json_schema`, подтверждено, что работает                                               |
| `tools`            | array  |            | Список инструментов для function-calling, подтверждено, что работает                                             |

## Примечания к ответу

* Расход на рассуждение составляет `usage.completion_tokens_details.reasoning_tokens` (указано для этой модели)
* Текст рассуждений (reasoning\_content) не выводится на этом эндпоинте — используйте `includeThoughts` нативного эндпоинта, чтобы просмотреть мысли
* Перепроверьте название модели `gemini-3.6-flash` — опечатки возвращают ошибку, а не выполняют незаметный fallback


## OpenAPI

````yaml api-reference/gemini-3-6-flash-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Gemini 3.6 Flash Chat Completions API
  description: >
    Gemini 3.6 Flash (`gemini-3.6-flash`) — OpenAI-compatible Chat Completions
    endpoint; any OpenAI SDK works by switching base_url.


    - Input $1.50 / output $7.50 per 1M tokens (output includes thinking)

    - Thinking is ON by default; tier it with `reasoning_effort`
    (low/medium/high), usage reports reasoning_tokens

    - Supports streaming, function calling, response_format json_schema, and
    vision (data URL)

    - For Search grounding / code execution and other advanced tools, use the
    native Gemini endpoint


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
      summary: 'Chat completion: Gemini 3.6 Flash (OpenAI-compatible)'
      description: |
        Chat completion with `gemini-3.6-flash`, fully OpenAI-compatible.
      operationId: chatgemini_3_6_flash_en
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: gemini-3.6-flash
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 2000
              reasoning_effort: low
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '401':
          description: Invalid API Key
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
          description: 'Fixed: gemini-3.6-flash'
        messages:
          type: array
          description: Standard OpenAI messages array
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
                description: String or multimodal array (text / image_url)
        max_tokens:
          type: integer
          description: >-
            Output quota; 2000+ recommended with thinking on (thinking bills as
            output)
        temperature:
          type: number
        stream:
          type: boolean
          description: SSE streaming
        reasoning_effort:
          type: string
          enum:
            - low
            - medium
            - high
          description: Thinking tier
        response_format:
          type: object
          description: Structured output, json_schema supported
        tools:
          type: array
          description: Function-calling tool list
          items:
            type: object
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
                  tool_calls:
                    type: array
                    items:
                      type: object
              finish_reason:
                type: string
        usage:
          type: object
          description: Usage stats
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
            total_tokens:
              type: integer
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'Add Authorization: Bearer YOUR_API_KEY header'

````