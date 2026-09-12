> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite Native API Reference

> Gemini 3.5 Flash-Lite native generateContent API reference and interactive playground: official request format, zero thinking by default, Search grounding and other tools supported.

<Info>
  Use the playground on the right: put `sk-your-api-key` (your APIYI token — no Google Key needed) in **x-goog-api-key** and hit send — no thinking by default, so responses are fast.
</Info>

<Tip>
  **No thinking output by default.** For deep reasoning pass `thinkingConfig: {"thinkingLevel": "high"}` (only the high tier reliably triggers thinking in our tests). Search grounding, code execution, URL context, and Maps tools work only on this native endpoint. Capabilities and pricing: [Gemini 3.5 Flash-Lite Overview](/en/api-capabilities/gemini-3-5-flash-lite/overview).
</Tip>

<Warning>
  * For streaming, change the URL to `:streamGenerateContent?alt=sse` (the playground demonstrates non-streaming)
  * Code execution works, but `executableCode` / `codeExecutionResult` fields are currently not echoed — results appear in the text body
  * `:countTokens` and the explicit cache API are not yet enabled; Computer Use is not supported by this model officially
</Warning>

## Parameter quick reference

| Parameter                                              | Type   | Required | Notes                                                                                         |
| ------------------------------------------------------ | ------ | -------- | --------------------------------------------------------------------------------------------- |
| `contents`                                             | array  | ✓        | Conversation contents; `parts` can mix `text` and `inlineData` (base64 image/PDF/audio/video) |
| `systemInstruction`                                    | object |          | System instruction                                                                            |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |          | No thinking by default; `high` measured at \~1000 thinking tokens                             |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |          | Echo thought parts (pair with high tier)                                                      |
| `generationConfig.responseMimeType` + `responseSchema` |        |          | Structured output (JSON Schema)                                                               |
| `tools`                                                | array  |          | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations`    |

## Response notes

* Thinking spend is in `usageMetadata.thoughtsTokenCount` (0 by default)
* Grounding sources appear in `candidates[0].groundingMetadata`; URL context in `urlContextMetadata`
* No implicit-cache hits observed for this model in our tests — don't build cost models on them


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