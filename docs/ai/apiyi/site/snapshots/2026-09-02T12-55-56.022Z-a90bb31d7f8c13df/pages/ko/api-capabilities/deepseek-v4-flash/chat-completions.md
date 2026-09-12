> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Chat API 레퍼런스

> DeepSeek V4 Flash GA (deepseek-v4-flash-ga-260731) Chat Completions API 레퍼런스 및 플레이그라운드: OpenAI 호환, 1M 컨텍스트, thinking 토글 및 암시적 캐싱.

<Info>
  오른쪽의 플레이그라운드를 사용해 직접 테스트하십시오. `Bearer sk-your-api-key`를
  **Authorization**에 넣으십시오. 기본 예시에서는 이미 심층 추론을 비활성화합니다
  (`thinking.disabled`), 따라서 전송 시 빠른 응답을 받습니다.
</Info>

<Tip>
  이 모델은 기본적으로 **많이 추론합니다** — 한 줄 질문에도 먼저 수백 개의 reasoning
  token을 출력합니다. 디버깅하는 동안 예시의 `"thinking": {"type": "disabled"}`를 유지하십시오.
  기능, 과금 및 캐싱에 대해서는
  [DeepSeek V4 Flash 개요](/ko/api-capabilities/deepseek-v4-flash/overview)를 참고하십시오.
</Tip>

<Warning>
  * 추론이 켜져 있을 때는 `max_tokens`에 여유를 두십시오(추론은 출력 쿼터에 포함됩니다) — 3000+를 권장합니다
  * **`response_format`는 영향을 주지 않습니다**: `json_schema`를 전달하면 스키마를 완전히 무시한 채 200을 반환합니다. 구조화된 출력에는 `tools`를 사용하십시오
  * **`n`는 조용히 무시됩니다**: `n=2`를 전달하면 `choices`에 정확히 하나의 요소가 들어 있는 상태로 200을 반환합니다
  * 텍스트 전용 모델 — 이미지 콘텐츠 블록을 전달하면 `Model do not support image input`를 반환합니다
</Warning>

## 매개변수 빠른 참조

| 매개변수                    | 유형     | 필수 | 기본값       | 비고                                                                              |
| ----------------------- | ------ | -- | --------- | ------------------------------------------------------------------------------- |
| `model`                 | string | ✓  | —         | `deepseek-v4-flash-ga-260731`로 고정됨                                              |
| `messages`              | array  | ✓  | —         | 표준 OpenAI 메시지 배열, 텍스트만                                                          |
| `max_tokens`            | int    |    | —         | 출력 쿼터, 하드 상한 393,216; 추론이 켜져 있을 때는 3000+                                        |
| `thinking.type`         | string |    | `enabled` | `disabled`는 추론을 확실하게 끕니다; `auto`도 지원됩니다                                         |
| `reasoning_effort`      | string |    | —         | `minimal`만 결정적입니다(추론 token 0개); low/medium/high/max는 **단조적이지 않으므로**, 개요를 참고하십시오 |
| `stream`                | bool   |    | `false`   | SSE 스트리밍; 사용량을 위해 `stream_options.include_usage`와 함께 사용하십시오                     |
| `temperature` / `top_p` | number |    | —         | 샘플링 매개변수이며, 둘 다 유효합니다                                                           |
| `stop`                  | array  |    | —         | 정지 시퀀스, 잘리는 것이 검증되었습니다                                                          |
| `seed` / `logprobs`     | —      |    | —         | 둘 다 유효합니다                                                                       |
| `tools`                 | array  |    | —         | 함수 호출 — **도구 인수는 실제로 제한됩니다**                                                    |

## 컨텍스트 및 출력 상한

| 항목              | 하드 상한           | 발생한 오류                                                    |
| --------------- | --------------- | --------------------------------------------------------- |
| 입력              | 1,048,570 token | `Input length ... exceeds the maximum length 1048570`     |
| 출력 `max_tokens` | 393,216         | `integer above maximum value, expected a value <= 393216` |

322,055-token 입력이 문서 중간의 needle이 올바르게 검색된 상태로 14.77초 만에 반환되었습니다.

## 암시적 캐시

추가 매개변수는 필요 없습니다 — 동일한 긴 접두사는 두 번째 요청에서 적중합니다:

| Round | prompt\_tokens | cached\_tokens | 적중률   |
| ----- | -------------- | -------------- | ----- |
| 1     | 15,634         | 0              | —     |
| 2     | 15,634         | 15,616         | 99.9% |
| 3     | 15,634         | 15,616         | 99.9% |

캐시된 token은 백만 개당 \$0.028로 과금됩니다. 타임스탬프, 랜덤 ID 및 기타 가변 콘텐츠는 prompt의 끝에 두세요 — 이를 접두사에 섞으면 적중률이 0으로 떨어집니다.

## 구조화된 출력이 필요하십니까? 도구를 사용하십시오

```json theme={null}
{
  "model": "deepseek-v4-flash-ga-260731",
  "messages": [{"role": "user", "content": "Beijing is 25 degrees today"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "submit_result",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {"type": "string"},
          "temp_c": {"type": "number"}
        },
        "required": ["city", "temp_c"]
      }
    }
  }]
}
```

`choices[0].message.tool_calls[0].function.arguments`에서 JSON 문자열을 사용하십시오 — 안정적으로 파싱됩니다.


## OpenAPI

````yaml api-reference/deepseek-v4-flash-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Chat Completions API
  description: >
    DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) — OpenAI-compatible
    Chat Completions endpoint.


    - **1M context**: hard input ceiling of 1,048,570 tokens, max output 393,216
    tokens

    - **Thinks a lot by default**: for simple tasks pass `thinking: {"type":
    "disabled"}` or `reasoning_effort: "minimal"`

    - **Implicit cache works automatically**: an identical long prefix hits on
    the second request, measured at 99.9%

    - **Structured output is not supported**: `response_format` is accepted but
    does not constrain the schema — use Function Call when you need enforcement

    - **Text-only model**: image input is rejected


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


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
      summary: 'Chat completion: DeepSeek V4 Flash text generation'
      description: >
        Run a chat completion with `deepseek-v4-flash-ga-260731`, fully
        OpenAI-compatible.


        - When thinking is on, the response carries a `reasoning_content` field
        and reasoning counts toward `max_tokens`

        - The example disables thinking for quick debugging; switch to `enabled`
        for complex reasoning

        - The `n` parameter is silently ignored (always returns exactly one
        choice)
      operationId: createDeepSeekV4FlashChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashChatRequest'
            example:
              model: deepseek-v4-flash-ga-260731
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 500
              thinking:
                type: disabled
      responses:
        '200':
          description: Completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashChatResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: input above 1,048,570 tokens,
            max_tokens above 393,216, or image content passed in
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: Wrong model name, or no available channel in the group
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Model ID, fixed to deepseek-v4-flash-ga-260731
          enum:
            - deepseek-v4-flash-ga-260731
          default: deepseek-v4-flash-ga-260731
        messages:
          type: array
          description: >-
            Message array in standard OpenAI format. Text only — image content
            blocks are not supported
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
            Max output tokens, hard ceiling 393,216. Reasoning counts toward
            this when thinking is on
          default: 500
          maximum: 393216
        thinking:
          type: object
          description: >-
            Deep thinking switch. Passing {"type": "disabled"} saved 200+
            reasoning tokens on simple tasks in our tests
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
                - auto
              default: disabled
        reasoning_effort:
          type: string
          description: >-
            Reasoning depth tier. Only minimal is deterministic (reasoning
            tokens always 0); low/medium/high/max do not form a monotonic
            ladder, and within-tier variance exceeds between-tier differences
          enum:
            - minimal
            - low
            - medium
            - high
            - max
        stream:
          type: boolean
          description: >-
            Stream the response over SSE. Pair with stream_options.include_usage
            to get usage at the end
          default: false
        temperature:
          type: number
          description: Sampling temperature
        top_p:
          type: number
          description: Nucleus sampling threshold
        stop:
          type: array
          description: Stop sequences, verified to truncate correctly
          items:
            type: string
        seed:
          type: integer
          description: Random seed
        logprobs:
          type: boolean
          description: Return token log probabilities, verified to be populated
        tools:
          type: array
          description: >-
            Function Call tool list in standard OpenAI format. Tool arguments
            are genuinely constrained — use this instead of response_format when
            you need structured output
          items:
            type: object
    DeepSeekV4FlashChatResponse:
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
            Usage. completion_tokens_details.reasoning_tokens is reasoning
            spend; prompt_tokens_details.cached_tokens is the implicit cache hit
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI console

````