> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash Native API Reference

> Gemini 3.6 Flash native generateContent API reference and interactive playground: official request format, with Search grounding, code execution, and URL context tools.

<Info>
  Use the playground on the right: put `sk-your-api-key` (your APIYI token — no Google Key needed) in **x-goog-api-key**. The default example sets thinking to low; hit send to see a response.
</Info>

<Tip>
  **Thinking is ON by default.** For cost-sensitive calls pass `thinkingConfig: {"thinkingLevel": "minimal"}` or `{"thinkingBudget": 0}`. Search grounding, code execution, URL context, and Maps tools work only on this native endpoint. Capabilities, pricing, and measured thinking tiers: [Gemini 3.6 Flash Overview](/en/api-capabilities/gemini-3-6-flash/overview).
</Tip>

<Warning>
  * For streaming, change the URL to `:streamGenerateContent?alt=sse` (the playground demonstrates non-streaming)
  * Code execution works, but `executableCode` / `codeExecutionResult` fields are currently not echoed — results appear in the text body
  * `:countTokens` and the explicit cache API (`cachedContents`) are not yet enabled on the platform
</Warning>

## Parameter quick reference

| Parameter                                              | Type   | Required | Notes                                                                                         |
| ------------------------------------------------------ | ------ | -------- | --------------------------------------------------------------------------------------------- |
| `contents`                                             | array  | ✓        | Conversation contents; `parts` can mix `text` and `inlineData` (base64 image/PDF/audio/video) |
| `systemInstruction`                                    | object |          | System instruction                                                                            |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |          | `minimal` / `low` / `medium` / `high`, measured 0/403/487/837 thinking tokens                 |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |          | Echo thought parts (`thought: true`)                                                          |
| `generationConfig.responseMimeType` + `responseSchema` |        |          | Structured output (JSON Schema)                                                               |
| `tools`                                                | array  |          | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations`    |

## Response notes

* Thinking spend is in `usageMetadata.thoughtsTokenCount` (bills as output)
* Grounding sources appear in `candidates[0].groundingMetadata`; URL context in `urlContextMetadata`
* Implicit cache hits show in `usageMetadata.cachedContentTokenCount` (probabilistic — don't rely on it)


## OpenAPI

````yaml api-reference/gemini-3-6-flash-native-openapi-en.yaml POST /v1beta/models/gemini-3.6-flash:generateContent
openapi: 3.1.0
info:
  title: Gemini 3.6 Flash Native generateContent API
  description: >
    Gemini 3.6 Flash (`gemini-3.6-flash`) — native Gemini generateContent
    endpoint. Call it directly with your APIYI token; no Google API Key needed.


    - Input $1.50 / output $7.50 per 1M tokens (output includes thinking), 1M
    context / 64K output

    - Thinking is ON by default (thinking tokens are billed as output);
    `thinkingConfig.thinkingLevel` supports minimal/low/medium/high, and
    `thinkingBudget: 0` disables it

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
  /v1beta/models/gemini-3.6-flash:generateContent:
    post:
      tags:
        - Text Generation
      summary: 'Text generation: Gemini 3.6 Flash (native Gemini format)'
      description: >
        Generate content with `gemini-3.6-flash`, fully compatible with Google's
        official request format. For streaming use
        `:streamGenerateContent?alt=sse`.
      operationId: generategemini_3_6_flash_en
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
              generationConfig:
                thinkingConfig:
                  thinkingLevel: low
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