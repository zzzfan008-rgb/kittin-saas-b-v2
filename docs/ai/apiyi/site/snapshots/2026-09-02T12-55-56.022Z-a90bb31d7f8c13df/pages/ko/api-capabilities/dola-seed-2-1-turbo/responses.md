> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Responses API 레퍼런스

> Seed 2.1 Turbo (dola-seed-2-1-turbo-260628) Responses API 레퍼런스 및 대화형 플레이그라운드: 네이티브 멀티턴 previous_response_id와 연결된 명시적 캐싱입니다.

<Info>
  오른쪽 플레이그라운드를 사용하십시오: **인증**에 `Bearer sk-your-api-key`을 넣고, `input`를 입력한 다음 전송하십시오. 응답의 `output` 배열에서, `type: "reasoning"` 항목은 추론 요약이며 — `type: "message"`는 실제 답변입니다.
</Info>

<Tip>
  멀티턴 대화에서는 이전 응답의 `id`(`resp_` 접두사)를 다음 호출의 `previous_response_id`로 전달하면 되며 — 히스토리를 다시 보낼 필요가 없습니다. 명시적 캐싱과 추론 제어는 [Seed 2.1 Turbo 개요](/ko/api-capabilities/dola-seed-2-1-turbo/overview)에서 다룹니다.
</Tip>

<Warning>
  * 작은 `max_output_tokens`는 추론에 잠식되어 **빈 텍스트**의 `status: "incomplete"`를 반환합니다 — 1500부터 시작하십시오
  * 명시적 캐싱 `caching: {"type": "enabled"}`은 `previous_response_id`를 통해 **연결된** 경우에만 캐시 적중합니다; 동일한 접두사를 단순히 반복하는 것만으로는 절대 적중하지 않으며(암시적 접두사 캐시도 비활성화됩니다)
</Warning>

## 매개변수 빠른 참조

| 매개변수                   | 유형             | 필수 | 기본값        | 비고                                                                |
| ---------------------- | -------------- | -- | ---------- | ----------------------------------------------------------------- |
| `model`                | string         | ✓  | —          | 고정: `dola-seed-2-1-turbo-260628`                                  |
| `input`                | string / array | ✓  | —          | 문자열 또는 메시지 배열(`function_call_output` 항목 포함)                       |
| `max_output_tokens`    | int            |    | —          | thinking을 포함한 출력 예산; 1500 이상 권장                                   |
| `reasoning.effort`     | string         |    | —          | `low` / `medium` / `high`; 약 \~371(낮음) 대비 \~1317(높음) 추론 token 측정값 |
| `previous_response_id` | string         |    | —          | 기본 멀티턴을 위한 이전 응답 ID입니다. 전체 컨텍스트의 명시적 캐시 적중을 활성화합니다                |
| `caching.type`         | string         |    | `disabled` | `enabled`가 명시적 캐싱을 켭니다(체이닝 필요)                                    |
| `store`                | bool           |    | `true`     | 나중에 참조할 수 있도록 이 응답을 저장합니다                                         |
| `stream`               | bool           |    | `false`    | SSE 이벤트 스트림(`response.created` → `response.completed`)            |
| `text.format`          | object         |    | —          | 구조화된 출력, `json_schema` + `strict` 지원                              |
| `tools`                | array          |    | —          | 함수 호출 도구 목록(평면 형식)                                                |

## 응답 하이라이트

* `status`가 `incomplete`일 때는 `incomplete_details.reason`을 확인합니다(보통 `length`입니다: 추론이 예산을 소진했습니다)
* 추론 사용량: `usage.output_tokens_details.reasoning_tokens`
* 캐시 적중: `usage.input_tokens_details.cached_tokens`(연속된 2번째 턴은 테스트에서 이전 컨텍스트 전체를 적중했고, 지연 시간이 대략 절반으로 줄었습니다)
* 응답의 `caching` 필드는 실제로 적용된 캐시 모드를 반영합니다


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-responses-openapi-en.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Responses API
  description: >
    ByteDance Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) — native Responses
    API endpoint.


    - Full Responses semantics: event stream, reasoning items, multi-turn via
    `previous_response_id`

    - **Explicit caching**: `caching: {"type": "enabled"}` combined with
    `previous_response_id` chaining hits the entire previous context on turn 2
    (measured: 7873 cached tokens, ~2x faster)

    - Reasoning is on by default: a small `max_output_tokens` gets eaten by
    thinking, yielding `status: incomplete` with empty text - use 1500+

    - Supports `reasoning.effort` tiers, structured output (`text.format`), and
    function calling


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
  /v1/responses:
    post:
      tags:
        - Text Generation
      summary: Responses API with Seed 2.1 Turbo (native multi-turn / explicit cache)
      description: >
        Call the Responses API with `dola-seed-2-1-turbo-260628`.


        - For multi-turn conversations pass `previous_response_id` instead of
        resending history

        - With `caching.enabled`, cache hits require `previous_response_id`
        chaining; merely repeating the same prefix does not hit
      operationId: createSeedResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedResponsesRequest'
            example:
              model: dola-seed-2-1-turbo-260628
              input: Introduce yourself in one sentence
              max_output_tokens: 1500
      responses:
        '200':
          description: >-
            Generation succeeded. The output array contains reasoning and
            message items
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedResponsesResponse'
        '400':
          description: Invalid parameters
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
    SeedResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        input:
          type: string
          description: >-
            Input content. Either a string or a message array ([{role, content},
            ...], including function_call_output items)
          example: Introduce yourself in one sentence
        max_output_tokens:
          type: integer
          description: >-
            Max output tokens (thinking included). Too small yields incomplete
            with empty text - use 1500+
          default: 1500
        reasoning:
          type: object
          description: >-
            Thinking depth control. Measured: effort low ~371, high ~1317
            reasoning tokens
          properties:
            effort:
              type: string
              enum:
                - low
                - medium
                - high
        previous_response_id:
          type: string
          description: >-
            Previous response id (resp_ prefix) for native multi-turn; combine
            with caching.enabled for explicit cache hits
        caching:
          type: object
          description: >-
            Explicit cache switch. enabled only hits when chained via
            previous_response_id
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
        store:
          type: boolean
          description: >-
            Whether to store this response for later previous_response_id
            reference
        stream:
          type: boolean
          description: >-
            Stream via SSE (response.created → response.output_text.delta →
            response.completed)
          default: false
        text:
          type: object
          description: >-
            Structured output. Supports {"format": {"type": "json_schema", name,
            strict, schema}}
        tools:
          type: array
          description: >-
            Function-calling tool list (flat Responses format: {type, name,
            description, parameters})
          items:
            type: object
    SeedResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: >-
            Response ID (resp_ prefix), usable as the next turn's
            previous_response_id
        status:
          type: string
          description: >-
            completed / incomplete (incomplete when thinking eats the token
            budget)
        output:
          type: array
          description: >-
            Output items: reasoning (thinking summary), message (text),
            function_call, etc.
          items:
            type: object
        usage:
          type: object
          description: >-
            Usage. output_tokens_details.reasoning_tokens = thinking spend;
            input_tokens_details.cached_tokens = cache hits
        caching:
          type: object
          description: The cache mode actually in effect for this request
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````