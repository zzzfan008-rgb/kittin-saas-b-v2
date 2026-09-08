> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite Нативная справка по API

> Справка по нативному API generateContent для Gemini 3.5 Flash-Lite и интерактивная песочница: официальный формат запроса, рассуждение по умолчанию отключено, поддерживаются Search grounding и другие tools.

<Info>
  Используйте playground справа: поместите `sk-your-api-key` (ваш token APIYI — ключ Google не нужен) в **x-goog-api-key** и нажмите «Отправить» — по умолчанию без reasoning, поэтому ответы быстрые.
</Info>

<Tip>
  **По умолчанию рассуждение не выводится.** Для глубокого рассуждения передайте `thinkingConfig: {"thinkingLevel": "high"}` (в наших тестах thinking надежно запускается только на высоком тарифе). Search grounding, выполнение кода, URL context и инструменты Maps работают только на этом нативном эндпоинте. Возможности и тарифы: [Gemini 3.5 Flash-Lite Overview](/ru/api-capabilities/gemini-3-5-flash-lite/overview).
</Tip>

<Warning>
  * Для потоковой передачи измените URL на `:streamGenerateContent?alt=sse` (playground демонстрирует работу без потоковой передачи)
  * Выполнение кода работает, но поля `executableCode` / `codeExecutionResult` сейчас не возвращаются в ответе — результаты появляются в body текста
  * `:countTokens` и явный cache API еще не включены; Computer Use официально не поддерживается этой моделью
</Warning>

## Краткая справка по параметрам

| Параметр                                               | Тип    | Обязательно | Примечания                                                                                            |
| ------------------------------------------------------ | ------ | ----------- | ----------------------------------------------------------------------------------------------------- |
| `contents`                                             | array  | ✓           | Содержимое беседы; `parts` может смешивать `text` и `inlineData` (base64 изображение/PDF/аудио/видео) |
| `systemInstruction`                                    | object |             | Системная инструкция                                                                                  |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |             | По умолчанию без рассуждений; `high` измеряется примерно на 1000 токенов рассуждения                  |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |             | Повторяет части рассуждения (используйте вместе с высоким tier)                                       |
| `generationConfig.responseMimeType` + `responseSchema` |        |             | Структурированный вывод (JSON Schema)                                                                 |
| `tools`                                                | array  |             | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations`            |

## Примечания к ответу

* Расход на thinking указан в `usageMetadata.thoughtsTokenCount` (по умолчанию 0)
* Источники grounding указаны в `candidates[0].groundingMetadata`; контекст URL — в `urlContextMetadata`
* В наших тестах для этой модели не было попаданий в implicit cache — не стройте на них модели стоимости


## OpenAPI

````yaml api-reference/gemini-3-5-flash-lite-native-openapi-en.yaml POST /v1beta/models/gemini-3.5-flash-lite:generateContent
openapi: 3.1.0
info:
  title: Gemini 3.5 Flash-Lite Native generateContent API
  description: >
    Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) — native Gemini
    generateContent endpoint. Call it directly with your APIYI token; no Google
    API Key needed.


    - Input $0.30 / output $2.50 per 1M tokens (output includes thinking), 1M
    context / 64K output

    - Thinking is OFF by default for minimal latency; pass
    `thinkingConfig.thinkingLevel: "high"` when you need deep reasoning (in our
    tests only the high tier reliably triggers thinking)

    - Advanced tools (Search/Maps grounding, URL context, code execution) are
    exclusive to this native format


    **Authentication**: header `x-goog-api-key: YOUR_API_KEY`


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - geminiKey: []
paths:
  /v1beta/models/gemini-3.5-flash-lite:generateContent:
    post:
      tags:
        - Text Generation
      summary: 'Text generation: Gemini 3.5 Flash-Lite (native Gemini format)'
      description: >
        Generate content with `gemini-3.5-flash-lite`, fully compatible with
        Google's official request format. For streaming use
        `:streamGenerateContent?alt=sse`.
      operationId: generategemini_3_5_flash_lite_en
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GenerateContentRequest'
            example:
              contents:
                - role: user
                  parts:
                    - text: Introduce yourself in one sentence
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerateContentResponse'
        '401':
          description: Invalid API Key
        '429':
          description: Rate limit exceeded
      security:
        - geminiKey: []
components:
  schemas:
    GenerateContentRequest:
      type: object
      required:
        - contents
      properties:
        contents:
          type: array
          description: Conversation contents; parts can mix modalities
          items:
            type: object
            properties:
              role:
                type: string
                enum:
                  - user
                  - model
              parts:
                type: array
                items:
                  type: object
                  properties:
                    text:
                      type: string
                    inlineData:
                      type: object
                      description: Inline base64 media (image/PDF/audio/video)
                      properties:
                        mimeType:
                          type: string
                        data:
                          type: string
        systemInstruction:
          type: object
          description: System instruction
          properties:
            parts:
              type: array
              items:
                type: object
                properties:
                  text:
                    type: string
        generationConfig:
          type: object
          description: Generation config
          properties:
            temperature:
              type: number
            maxOutputTokens:
              type: integer
            responseMimeType:
              type: string
              description: Set to application/json for structured output
            responseSchema:
              type: object
              description: JSON Schema for structured output
            thinkingConfig:
              type: object
              description: Thinking config (see overview for measured tiers)
              properties:
                thinkingLevel:
                  type: string
                  enum:
                    - minimal
                    - low
                    - medium
                    - high
                thinkingBudget:
                  type: integer
                includeThoughts:
                  type: boolean
        tools:
          type: array
          description: >-
            Tools: google_search / url_context / codeExecution /
            functionDeclarations, etc.
          items:
            type: object
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          items:
            type: object
            properties:
              content:
                type: object
                properties:
                  role:
                    type: string
                  parts:
                    type: array
                    items:
                      type: object
              finishReason:
                type: string
              groundingMetadata:
                type: object
                description: Returned when grounding tools are enabled
        usageMetadata:
          type: object
          description: Usage; thoughtsTokenCount is the thinking spend
          properties:
            promptTokenCount:
              type: integer
            candidatesTokenCount:
              type: integer
            thoughtsTokenCount:
              type: integer
            totalTokenCount:
              type: integer
        modelVersion:
          type: string
  securitySchemes:
    geminiKey:
      type: apiKey
      in: header
      name: x-goog-api-key
      description: APIYI token, the sk- prefixed key

````