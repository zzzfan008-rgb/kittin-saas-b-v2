> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite 네이티브 API 레퍼런스

> Gemini 3.5 Flash-Lite 네이티브 generateContent API 레퍼런스와 대화형 플레이그라운드: 공식 요청 형식, 기본값은 추론 없음, Search grounding 및 기타 tools를 지원합니다.

<Info>
  오른쪽의 플레이그라운드를 사용하십시오: `sk-your-api-key`(귀하의 APIYI token — Google 키가 필요 없습니다)을 **x-goog-api-key**에 넣고 보내기를 누르십시오 — 기본적으로 추론이 없어서 응답이 빠릅니다.
</Info>

<Tip>
  **기본적으로 추론은 출력되지 않습니다.** 심층 추론에는 `thinkingConfig: {"thinkingLevel": "high"}`를 전달하십시오(저희 테스트에서는 상위 티어만 안정적으로 추론을 트리거합니다). 검색 그라운딩, 코드 실행, URL 컨텍스트, 그리고 Maps tools는 이 네이티브 엔드포인트에서만 작동합니다. 기능과 가격: [Gemini 3.5 Flash-Lite 개요](/ko/api-capabilities/gemini-3-5-flash-lite/overview).
</Tip>

<Warning>
  * 스트리밍의 경우 URL을 `:streamGenerateContent?alt=sse`로 변경하십시오(플레이그라운드는 비스트리밍을 보여줍니다)
  * 코드 실행은 작동하지만 `executableCode` / `codeExecutionResult` 필드는 현재 반영되지 않습니다 — 결과는 텍스트 본문에 나타납니다
  * `:countTokens`와 명시적 캐시 API는 아직 활성화되지 않았으며; Computer Use는 이 모델에서 공식적으로 지원되지 않습니다
</Warning>

## 매개변수 빠른 참조

| 매개변수                                                   | 유형     | 필수 | 비고                                                                                         |
| ------------------------------------------------------ | ------ | -- | ------------------------------------------------------------------------------------------ |
| `contents`                                             | array  | ✓  | 대화 내용; `parts`은 `text`와 `inlineData`(base64 이미지/PDF/오디오/동영상)를 혼합할 수 있습니다                   |
| `systemInstruction`                                    | object |    | 시스템 지시문                                                                                    |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |    | 기본적으로 추론 없음; `high`은 약 1000개의 추론 token 기준으로 측정됩니다                                          |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |    | 추론 부분을 에코합니다(고급 등급과 함께 사용)                                                                 |
| `generationConfig.responseMimeType` + `responseSchema` |        |    | 구조화된 출력(JSON Schema)                                                                       |
| `tools`                                                | array  |    | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations` |

## 응답 참고사항

* 추론 비용은 `usageMetadata.thoughtsTokenCount`입니다(기본값은 0입니다)
* 근거 소스는 `candidates[0].groundingMetadata`에 표시되며, URL 컨텍스트는 `urlContextMetadata`에 있습니다
* 테스트에서 이 모델에서는 암묵적 캐시 적중이 관찰되지 않았습니다. 이를 바탕으로 비용 모델을 만들지 마십시오


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