> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash 네이티브 API 참조

> Gemini 3.6 Flash 네이티브 generateContent API 참조 및 대화형 플레이그라운드입니다. Search grounding, 코드 실행, URL 컨텍스트 도구를 지원하는 공식 요청 형식입니다.

<Info>
  오른쪽의 플레이그라운드를 사용하십시오: `sk-your-api-key` (귀하의 APIYI token — Google Key는 필요 없습니다)을 **x-goog-api-key**에 넣으십시오. 기본 예제는 추론을 low로 설정합니다. 보내기를 눌러 응답을 확인하십시오.
</Info>

<Tip>
  **추론은 기본적으로 켜져 있습니다.** 비용에 민감한 호출의 경우 `thinkingConfig: {"thinkingLevel": "minimal"}` 또는 `{"thinkingBudget": 0}`를 전달하십시오. 검색 그라운딩, 코드 실행, URL 컨텍스트, 그리고 Maps 도구는 이 네이티브 엔드포인트에서만 동작합니다. 기능, 요금, 그리고 측정된 추론 단계: [Gemini 3.6 Flash 개요](/ko/api-capabilities/gemini-3-6-flash/overview).
</Tip>

<Warning>
  * 스트리밍하려면 URL을 `:streamGenerateContent?alt=sse`로 변경하십시오(플레이그라운드는 스트리밍이 아님을 보여줍니다)
  * 코드 실행은 동작하지만, `executableCode` / `codeExecutionResult` 필드는 현재 에코되지 않습니다 — 결과는 텍스트 본문에 표시됩니다
  * `:countTokens`과 명시적 캐시 API(`cachedContents`)는 아직 플랫폼에서 활성화되어 있지 않습니다
</Warning>

## 매개변수 빠른 참조

| 매개변수                                                   | 유형     | 필수 | 비고                                                                                         |
| ------------------------------------------------------ | ------ | -- | ------------------------------------------------------------------------------------------ |
| `contents`                                             | array  | ✓  | 대화 내용; `parts`는 `text`와 `inlineData`(base64 이미지/PDF/오디오/비디오)를 혼합할 수 있습니다                   |
| `systemInstruction`                                    | object |    | 시스템 지시                                                                                     |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |    | `minimal` / `low` / `medium` / `high`, 0/403/487/837 추론 token으로 측정됩니다                      |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |    | 생각 부분(`thought: true`)을 에코합니다                                                              |
| `generationConfig.responseMimeType` + `responseSchema` |        |    | 구조화된 출력(JSON Schema)                                                                       |
| `tools`                                                | array  |    | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations` |

## 응답 참고사항

* 추론 사용량은 `usageMetadata.thoughtsTokenCount`입니다(출력으로 청구됩니다)
* 근거 출처는 `candidates[0].groundingMetadata`에 표시되며; URL 컨텍스트는 `urlContextMetadata`에 표시됩니다
* 암시적 캐시 적중은 `usageMetadata.cachedContentTokenCount`에 표시됩니다(확률적이므로 — 이에 의존하지 마십시오)


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