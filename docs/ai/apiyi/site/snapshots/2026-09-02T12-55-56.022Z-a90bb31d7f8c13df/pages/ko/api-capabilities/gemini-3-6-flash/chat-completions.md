> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash Chat API 레퍼런스

> Gemini 3.6 Flash Chat Completions API 레퍼런스 및 대화형 플레이그라운드: OpenAI 호환, reasoning_effort 단계, 스트리밍, 함수 호출, 비전을 지원합니다.

<Info>
  오른쪽 플레이그라운드를 사용하십시오: `Bearer sk-your-api-key`를 **Authorization**에 넣으십시오. 기본 예제는 `reasoning_effort: "low"`를 사용합니다. 전송하여 응답을 확인하십시오.
</Info>

<Tip>
  **Thinking은 기본적으로 ON입니다**(출력으로 과금됩니다). 디버깅할 때는 low로 유지하십시오. 복잡한 작업에는 `max_tokens`가 4000+일 때 `high`로 전환하십시오. 검색 grounding, code execution 및 기타 네이티브 tools는 이 엔드포인트에서 사용할 수 없습니다 — 대신 [Native Playground](/ko/api-capabilities/gemini-3-6-flash/generate-content)을 사용하십시오. 개요 및 측정 데이터: [Gemini 3.6 Flash Overview](/ko/api-capabilities/gemini-3-6-flash/overview).
</Tip>

## 매개변수 빠른 참조

| 매개변수               | 유형     | 필수 | 비고                                                                      |
| ------------------ | ------ | -- | ----------------------------------------------------------------------- |
| `model`            | string | ✓  | 고정값: `gemini-3.6-flash`                                                 |
| `messages`         | array  | ✓  | 표준 OpenAI 메시지; `content`는 멀티모달 배열일 수 있습니다(`image_url`는 data URL을 지원합니다) |
| `max_tokens`       | int    |    | 출력 쿼터; thinking이 켜진 경우 2000 이상 권장(thinking은 출력으로 과금됨)                   |
| `reasoning_effort` | string |    | `low` / `medium` / `high` thinking 단계, 작동 확인됨                           |
| `stream`           | bool   |    | SSE 스트리밍                                                                |
| `response_format`  | object |    | `json_schema` 구조화 출력, 작동 확인됨                                            |
| `tools`            | array  |    | Function-calling 도구 목록, 작동 확인됨                                          |

## 응답 참고사항

* 추론 사용량은 `usage.completion_tokens_details.reasoning_tokens`입니다(이 모델에 대해 보고됩니다)
* 이 엔드포인트에서는 Thinking text(reasoning\_content)가 다시 출력되지 않습니다 - 네이티브 엔드포인트의 `includeThoughts`를 사용하여 생각을 확인하십시오
* 모델 이름 `gemini-3.6-flash`를 다시 확인하십시오 - 오타가 있으면 조용한 대체 동작 대신 오류가 반환됩니다


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