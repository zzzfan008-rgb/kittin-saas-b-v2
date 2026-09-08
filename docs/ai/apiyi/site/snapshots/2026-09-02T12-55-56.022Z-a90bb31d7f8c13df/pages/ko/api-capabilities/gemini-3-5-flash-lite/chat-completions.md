> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite Chat API 레퍼런스

> Gemini 3.5 Flash-Lite Chat Completions API 레퍼런스 및 인터랙티브 플레이그라운드: OpenAI 호환, 기본값으로 추론 없음, 스트리밍, 함수 호출, 비전 지원.

<Info>
  오른쪽의 플레이그라운드를 사용하십시오: `Bearer sk-your-api-key`을 **Authorization**에 넣고 전송을 누르십시오 — 기본적으로 추론을 하지 않으므로 응답이 빠릅니다.
</Info>

<Tip>
  심층 추론을 위해 `reasoning_effort: "high"`를 전달하십시오(참고: 이 엔드포인트는 이 모델에 대해 reasoning\_tokens를 보고하지 않습니다 — 정확한 추론 관찰을 위해 [네이티브 플레이그라운드](/ko/api-capabilities/gemini-3-5-flash-lite/generate-content)를 사용하십시오). 검색 그라운딩, 코드 실행 및 기타 네이티브 도구는 이 엔드포인트에서 사용할 수 없습니다. 개요 및 측정 데이터: [Gemini 3.5 Flash-Lite 개요](/ko/api-capabilities/gemini-3-5-flash-lite/overview).
</Tip>

## 매개변수 빠른 참고

| 매개변수               | 유형     | 필수 | 참고                                                                         |
| ------------------ | ------ | -- | -------------------------------------------------------------------------- |
| `model`            | string | ✓  | 고정값: `gemini-3.5-flash-lite`                                               |
| `messages`         | array  | ✓  | 표준 OpenAI 메시지입니다. `content`는 멀티모달 배열일 수 있습니다(`image_url`는 data URL을 지원합니다) |
| `max_tokens`       | int    |    | 출력 쿼터; `reasoning_effort: "high"` 사용 시 2000 이상을 권장합니다                      |
| `reasoning_effort` | string |    | `high`가 추론을 유발합니다. usage에는 추론량이 보고되지 않습니다                                  |
| `stream`           | bool   |    | SSE 스트리밍                                                                   |
| `response_format`  | object |    | `json_schema` 구조화된 출력, 작동 확인됨                                              |
| `tools`            | array  |    | 함수 호출 도구 목록, 작동 확인됨                                                        |

## 응답 참고사항

* `usage.completion_tokens_details.reasoning_tokens`는 이 모델에서는 보고되지 않습니다(3.6 Flash는 보고합니다) — thinking 사용량은 `completion_tokens`에 포함됩니다
* Thinking text(reasoning\_content)는 이 엔드포인트에서 그대로 표시되지 않습니다
* 모델 이름 `gemini-3.5-flash-lite`(세 개의 소문자 세그먼트로 이루어진 하이픈 연결 형식)을 다시 확인하십시오


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