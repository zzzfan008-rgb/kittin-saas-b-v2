> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite Справочник Chat API

> Справочник API Chat Completions для Gemini 3.5 Flash-Lite и интерактивная песочница: совместимо с OpenAI, рассуждение по умолчанию отключено, с потоковой передачей, вызовом функций и vision.

<Info>
  Используйте песочницу справа: поместите `Bearer sk-your-api-key` в **Authorization** и нажмите «Отправить» — по умолчанию без рассуждения, поэтому ответы быстрые.
</Info>

<Tip>
  Для глубокого рассуждения передайте `reasoning_effort: "high"` (примечание: этот endpoint не сообщает reasoning\_tokens для этой модели — используйте [Нативную песочницу](/ru/api-capabilities/gemini-3-5-flash-lite/generate-content) для точного наблюдения за рассуждением). Привязка к поиску, выполнение кода и другие нативные инструменты недоступны на этом endpoint. Обзор и измеренные данные: [Обзор Gemini 3.5 Flash-Lite](/ru/api-capabilities/gemini-3-5-flash-lite/overview).
</Tip>

## Краткая справка по параметрам

| Параметр           | Тип    | Обязателен | Примечания                                                                                                       |
| ------------------ | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `model`            | string | ✓          | Фиксировано: `gemini-3.5-flash-lite`                                                                             |
| `messages`         | array  | ✓          | Стандартные сообщения OpenAI; `content` может быть мультимодальным массивом (`image_url` поддерживает data URLs) |
| `max_tokens`       | int    |            | Квота вывода; рекомендуется 2000+ с `reasoning_effort: "high"`                                                   |
| `reasoning_effort` | string |            | `high` запускает рассуждение; использование не сообщает объем рассуждения                                        |
| `stream`           | bool   |            | Потоковая передача SSE                                                                                           |
| `response_format`  | object |            | Структурированный вывод `json_schema`, проверено и работает                                                      |
| `tools`            | array  |            | Список инструментов для function-calling, проверено и работает                                                   |

## Примечания к ответу

* `usage.completion_tokens_details.reasoning_tokens` не сообщается для этой модели (3.6 Flash сообщает его) — расход на рассуждение включен в `completion_tokens`
* Текст рассуждения (reasoning\_content) не возвращается в этом эндпоинте
* Еще раз проверьте имя модели `gemini-3.5-flash-lite` (три сегмента в нижнем регистре, через дефис)


## OpenAPI

````yaml api-reference/gemini-3-5-flash-lite-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Gemini 3.5 Flash-Lite Chat Completions API
  description: >
    Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) — OpenAI-compatible Chat
    Completions endpoint; any OpenAI SDK works by switching base_url.


    - Input $0.30 / output $2.50 per 1M tokens (output includes thinking)

    - No thinking by default, very fast; `reasoning_effort: "high"` triggers
    thinking (this model does not report reasoning_tokens on the OpenAI
    endpoint)

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
      summary: 'Chat completion: Gemini 3.5 Flash-Lite (OpenAI-compatible)'
      description: |
        Chat completion with `gemini-3.5-flash-lite`, fully OpenAI-compatible.
      operationId: chatgemini_3_5_flash_lite_en
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: gemini-3.5-flash-lite
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 2000
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
          description: 'Fixed: gemini-3.5-flash-lite'
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