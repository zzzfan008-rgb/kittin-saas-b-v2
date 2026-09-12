> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max Chat API 레퍼런스

> Qwen3.8-Max Chat Completions API 레퍼런스 및 실시간 플레이그라운드: OpenAI 호환 형식에 reasoning_effort 단계, 스트리밍, 함수 호출, 이미지/동영상 입력을 지원합니다.

<Info>
  오른쪽의 플레이그라운드를 사용해 요청을 직접 전송하십시오: **Authorization**에 `Bearer sk-your-api-key`를 넣으십시오. 예제에는 이미 `reasoning_effort: "none"`이 포함되어 있으며, 전송을 눌러 응답을 확인하십시오.
</Info>

<Tip>
  모델은 **기본적으로 추론합니다**(티어 `xhigh`, 출력으로 과금됩니다). 이 예제는 디버깅을 빠르고 저렴하게 유지하기 위해 추론을 비활성화합니다. 어려운 추론의 경우 `reasoning_effort` 필드를 제거하고 `max_tokens`를 4000 이상으로 올리십시오. 전체 설명은 [Qwen3.8-Max 개요](/ko/api-capabilities/qwen-3-8/overview)를 참조하십시오.
</Tip>

## 매개변수 빠른 참조

| 매개변수               | 유형            | 필수 | 참고                                                                                         |
| ------------------ | ------------- | -- | ------------------------------------------------------------------------------------------ |
| `model`            | string        | ✓  | 항상 `qwen3.8-max`입니다                                                                        |
| `messages`         | array         | ✓  | 표준 OpenAI 메시지 배열입니다. `content`는 멀티모달 배열일 수 있습니다(`image_url` / `video_url`는 데이터 URL을 허용합니다) |
| `max_tokens`       | int           |    | 보이는 답변에 대한 출력 예산이며, 범위는 `[1, 131072]`입니다. **추론 token을 제한하지 않습니다**                          |
| `reasoning_effort` | string        |    | `none` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max`, 기본값은 `xhigh`입니다          |
| `stream`           | bool          |    | SSE 스트리밍입니다. 이 엔드포인트는 `stream_options`가 없어도 최종 청크에 사용량을 반환합니다                              |
| `response_format`  | object        |    | `json_schema` 구조화된 출력이며, 테스트에서 엄격하게 유지됩니다                                                  |
| `tools`            | array         |    | 함수 호출 도구 목록이며, 동작이 검증되었습니다                                                                 |
| `tool_choice`      | string/object |    | `auto` / `none`는 그대로 작동하며, `required` 또는 이름이 있는 함수에는 `reasoning_effort: "none"`가 필요합니다     |
| `n`                | int           |    | 1보다 큰 값에는 `reasoning_effort: "none"`가 필요합니다                                                |
| `temperature`      | number        |    | 유효 범위는 `[0.0, 2.0)`입니다. `2`를 전달하면 400을 반환합니다                                               |
| `stop`             | array         |    | 중지 시퀀스이며, 동작이 검증되었습니다                                                                      |

## 세 가지 쉬운 실수

<Warning>
  **1. `max_tokens`는 추론을 제한하지 않습니다.** `max_tokens=1`를 설정했지만 여전히 출력 token 1,054개(그중 1,045개는 추론)로 청구되었습니다. 비용을 제어하려면 `reasoning_effort="none"`를 사용하십시오.

  **2. 강제 도구 호출에는 추론을 꺼야 합니다.** `tool_choice`가 `"required"` 또는 이름이 지정된 함수로 설정된 경우, 추론 모드에서는 400이 반환되거나 호출이 조용히 건너뛰어집니다 — 함께 `reasoning_effort="none"`를 전달하십시오.

  **3. `thinking_budget`는 아무 효과가 없습니다.** 어떤 값이든 `low` 티어와 동일하게 동작합니다. 대신 `reasoning_effort`를 사용하십시오.
</Warning>

## 응답 읽기

* 추론 흔적은 `choices[0].message.reasoning_content`에 있습니다(추론이 켜져 있을 때 반환됩니다)
* 추론 비용은 `usage.completion_tokens_details.reasoning_tokens`에, 캐시 적중은 `usage.prompt_tokens_details.cached_tokens`에 있습니다
* **일부 상위 라우트는 이 두 필드를 보고하지 않습니다**(테스트에서 요청의 약 3분의 1) — 정확한 추론 비용 집계가 필요하다면 이 점을 염두에 두십시오
* 7개의 유효한 `reasoning_effort` 값은 실제로 4개의 등급에만 매핑됩니다; `max`는 `xhigh`보다 더 깊게 추론하지 않습니다
* 잘못된 `reasoning_effort` 값은 조용히 낮은 등급으로 대체하지 않고, 전체 유효 집합을 나열하는 400 응답을 반환합니다

## 관련

* [Qwen3.8-Max 개요](/ko/api-capabilities/qwen-3-8/overview) — 전체 기능 매트릭스, 가격, 모범 사례
* [Qwen3.6 시리즈(레거시)](/ko/api-capabilities/qwen-3-6/overview) — 이전 5개 모델


## OpenAPI

````yaml api-reference/qwen-3-8-max-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Qwen3.8-Max Chat Completions API
  description: >
    Qwen3.8-Max (`qwen3.8-max`) — OpenAI-compatible Chat Completions endpoint;
    any OpenAI SDK works by switching base_url.


    - Input $1.65 / output $4.95 per 1M tokens (output includes thinking) —
    17.5% below Alibaba Cloud's list price

    - 1M context, 131K max output, native image and video input

    - **Thinking is ON by default** (tier `xhigh`); `reasoning_effort` maps to
    four real tiers in practice: `none` / `minimal`≡`low` / `medium` /
    `high`≡`xhigh`≡`max`

    - `max_tokens` truncates only the visible answer and **does not bound
    thinking tokens** — use `reasoning_effort: "none"` to control cost

    - Supports streaming, function calling, response_format json_schema

    - Forced `tool_choice` and `n > 1` both require `reasoning_effort: "none"`

    - `thinking_budget` values are ignored; built-in web search is unavailable


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
      summary: 'Chat completion: Qwen3.8-Max (OpenAI compatible)'
      description: >
        Run a chat completion with `qwen3.8-max`, fully compatible with the
        OpenAI format.


        The example ships with `reasoning_effort: "none"` — the recommended
        setting for everyday chat,

        which cut output tokens to roughly 1/30 in testing. For hard reasoning,
        drop that field

        (returning to the default `xhigh` tier) and raise `max_tokens` to 4000+.
      operationId: chatqwen3_8_max
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: qwen3.8-max
              messages:
                - role: user
                  content: Introduce yourself in one sentence.
              max_tokens: 1000
              reasoning_effort: none
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: forced tool_choice or n > 1 while
            thinking is on; an illegal reasoning_effort value; temperature
            outside [0.0, 2.0); max_tokens outside [1, 131072]
        '401':
          description: Invalid API key
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
          description: Always qwen3.8-max
        messages:
          type: array
          description: Standard OpenAI message array
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
                description: String or multimodal array (text / image_url / video_url)
        max_tokens:
          type: integer
          description: >-
            Output budget for the visible answer, range [1, 131072]. Note: does
            not bound thinking tokens
        reasoning_effort:
          type: string
          enum:
            - none
            - minimal
            - low
            - medium
            - high
            - xhigh
            - max
          description: >-
            Thinking tier, default xhigh. Measured to have only four real tiers:
            none / minimal≡low / medium / high≡xhigh≡max
        temperature:
          type: number
          description: Valid range [0.0, 2.0); passing 2 returns 400
        top_p:
          type: number
          description: Valid range (0.0, 1.0]
        top_k:
          type: integer
        stream:
          type: boolean
          description: >-
            SSE streaming. This endpoint returns usage in the final chunk even
            without stream_options
        stop:
          type: array
          description: Stop sequences, verified working
          items:
            type: string
        response_format:
          type: object
          description: >-
            Structured output; json_schema held strictly in testing. Pair it
            with reasoning_effort: none
        tools:
          type: array
          description: Function calling tool list, verified working
          items:
            type: object
        tool_choice:
          description: >-
            auto / none work as-is; required or a named function requires
            reasoning_effort: none
        parallel_tool_calls:
          type: boolean
          description: Set false to limit to a single tool call, verified working
        'n':
          type: integer
          description: 'Number of candidates. Values above 1 require reasoning_effort: none'
        logprobs:
          type: boolean
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
                  reasoning_content:
                    type: string
                    description: Thinking trace, returned while thinking is on
                  tool_calls:
                    type: array
                    items:
                      type: object
              finish_reason:
                type: string
        usage:
          type: object
          description: >-
            Usage stats. Some upstream routes do not report reasoning_tokens or
            cached_tokens
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
              description: Includes thinking tokens
            total_tokens:
              type: integer
            completion_tokens_details:
              type: object
              properties:
                reasoning_tokens:
                  type: integer
            prompt_tokens_details:
              type: object
              properties:
                cached_tokens:
                  type: integer
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'Add Authorization: Bearer YOUR_API_KEY to the request header'

````