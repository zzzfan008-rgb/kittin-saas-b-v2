> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo 채팅 API 레퍼런스

> Seed 2.1 Turbo (dola-seed-2-1-turbo-260628) Chat Completions API 레퍼런스 및 인터랙티브 플레이그라운드: OpenAI 호환, 추론 토글 및 티어 포함.

<Info>
  오른쪽 플레이그라운드를 사용하십시오: `Bearer sk-your-api-key`를 **Authorization**에 넣으십시오. 기본 예제는 심층 추론이 비활성화됨(`thinking.disabled`)으로 설정되어 있어 첫 전송에서 빠른 응답을 받을 수 있습니다.
</Info>

<Tip>
  이 모델은 **심층 추론이 기본값으로 ON**되어 있습니다. 간단한 질문도 먼저 수백 개의 reasoning tokens를 생성합니다. 디버깅하는 동안 예제의 `"thinking": {"type": "disabled"}`를 유지하십시오. 실제로 reasoning이 필요할 때는 `reasoning_effort`(낮음 / 중간 / 높음)으로 전환하십시오. 기능, 가격, 캐싱은 [Seed 2.1 Turbo 개요](/ko/api-capabilities/dola-seed-2-1-turbo/overview)에서 다룹니다.
</Tip>

<Warning>
  * thinking을 켠 상태에서는 `max_tokens` 여유를 두십시오(reasoning이 출력 예산에 포함됩니다) — 3000+ 권장
  * 모델 이름을 잘못 입력하면 **503**(사용 가능한 채널 없음)을 반환하며, 404가 아닙니다
</Warning>

## 매개변수 빠른 참조

| 매개변수               | 유형     | 필수 | 기본값       | 메모                                                                           |
| ------------------ | ------ | -- | --------- | ---------------------------------------------------------------------------- |
| `model`            | string | ✓  | —         | 고정값: `dola-seed-2-1-turbo-260628`                                            |
| `messages`         | array  | ✓  | —         | 표준 OpenAI 메시지 배열                                                             |
| `max_tokens`       | int    |    | —         | 출력 예산; thinking이 켜져 있으면 3000+                                                |
| `thinking.type`    | string |    | `enabled` | **기본값은 ON입니다**; `disabled`는 추론을 끕니다                                          |
| `reasoning_effort` | string |    | —         | `low` / `medium` / `high`; 측정값은 reasoning tokens 기준 약 226(낮음) 대 약 960(높음)입니다 |
| `stream`           | bool   |    | `false`   | SSE 스트리밍; 사용량을 보려면 `stream_options.include_usage`를 추가합니다                     |
| `response_format`  | object |    | —         | 구조화된 출력, `json_schema` + `strict`를 지원합니다                                     |
| `tools`            | array  |    | —         | 함수 호출 도구 목록                                                                  |

## 응답 하이라이트

* 추론을 사용하면, `choices[0].message`는 `reasoning_content`(전체 추론 텍스트) 외에도 `content`를 포함합니다
* 추론 비용: `usage.completion_tokens_details.reasoning_tokens`
* 암시적 캐시 적중: `usage.prompt_tokens_details.cached_tokens`(반복되는 긴 접두사는 2번째 요청부터 적중합니다)


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