> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Responses API 참고서

> DeepSeek V4 Flash GA (deepseek-v4-flash-ga-260731) Responses API 참고서 및 플레이그라운드: 매 라운드마다 전체 이전 컨텍스트에 적중하는 체인형 명시적 캐싱입니다.

<Info>
  오른쪽의 플레이그라운드를 사용해 바로 테스트하십시오: `Bearer sk-your-api-key`를
  **Authorization**에 넣으십시오. 기본 예제에는 이미 `caching: {"type": "enabled"}`과
  `store: true`가 포함되어 있습니다 — 연결된 명시적 캐싱을 위한 첫 호출 쓰기 형식입니다.
</Info>

<Tip>
  Responses는 Chat Completions 위에 명시적 캐시 계층을 추가합니다. 기능, 과금
  및 추론 제어는
  [DeepSeek V4 Flash 개요](/ko/api-capabilities/deepseek-v4-flash/overview)를 참조하십시오.
</Tip>

<Warning>
  * **`text.format` json\_schema는 영향이 없습니다**: 스키마를 무시한 채 200을 반환하며, 3/3 응답이 코드 펜스로 감싸져 파싱에 실패했습니다
  * **`web_search` 백엔드는 사용할 수 없습니다**: 도구는 연결되어 있지만 (`web_search_call` 항목이 `status: completed`와 함께 나타남) 6/6 검색이 오류로 종료되어 `results`을 반환하지 않았습니다
  * **`mcp`는 `AccessDenied`를 반환합니다**: 계정/채널 수준의 내장 도구 권한입니다 — 유효한 서버 URL을 사용해도 같은 결과가 나옵니다
  * 텍스트 전용 모델 — 이미지를 전달하면 `Model do not support image input`을 반환합니다
</Warning>

## 매개변수 빠른 참조

| 매개변수                   | 유형             | 필수 | 기본값     | 비고                                                        |
| ---------------------- | -------------- | -- | ------- | --------------------------------------------------------- |
| `model`                | string         | ✓  | —       | `deepseek-v4-flash-ga-260731`로 고정됩니다                      |
| `input`                | string / array | ✓  | —       | 문자열 또는 표준 Responses 메시지 배열이며, 텍스트만 허용됩니다                  |
| `max_output_tokens`    | int            |    | —       | 절대 상한은 393,216이며, reasoning이 그 수치에 포함됩니다                  |
| `store`                | bool           |    | `true`  | 체인하려면 true여야 합니다                                          |
| `previous_response_id` | string         |    | —       | 이전 응답의 `id`이며, `caching`와 함께 사용하면 명시적 캐시에 적중합니다           |
| `caching.type`         | string         |    | —       | `enabled`이 명시적 캐시를 기록하며, 응답은 이 필드를 그대로 반환합니다              |
| `reasoning.effort`     | string         |    | —       | `minimal`은 reasoning token을 0개 생성합니다. 다른 티어는 단조롭지 않습니다    |
| `stream`               | bool           |    | `false` | SSE 스트리밍이며, 측정된 TTFB는 약 2.31초입니다                          |
| `tools`                | array          |    | —       | `function`이 작동합니다. `web_search` / `mcp`에 대한 경고는 위를 참조하십시오 |

## 명시적 캐시: 체인이 필요합니다

<Warning>
  **흔한 실수**: `caching`가 설정된 상태에서 같은 긴 접두사를 두 번 다시 보내면
  `cached_tokens`가 0으로 남습니다. 명시적 캐시는 **접두사 일치** 방식이 아닙니다. `previous_response_id`로
  세션을 체인해야 합니다.
</Warning>

올바른 패턴은 첫 번째 호출에서 전체 문서를 보내 캐시를 기록한 다음, 이전 `id`를
체인하면서 새 질문만 보내는 것입니다.

| 라운드    | 호출 형식                              | input\_tokens | cached\_tokens | 지연 시간 |
| ------ | ---------------------------------- | ------------- | -------------- | ----- |
| 1 (쓰기) | `caching: enabled` + `store: true` | 15,629        | 0              | 4.10s |
| 2      | + `previous_response_id`           | 15,664        | **15,629**     | 5.18s |
| 3      | + `previous_response_id`           | 15,701        | **15,664**     | 4.57s |
| 4      | + `previous_response_id`           | 15,738        | **15,701**     | 4.54s |

각 라운드는 이전의 전체 컨텍스트를 적중합니다. 긴 문서에 대해 후속 질문을 할 때는
매 턴 전체 텍스트를 다시 보내는 것보다 훨씬 저렴합니다.

### 체인된 호출 예시

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

long_doc = open("report.md").read()

# Round 1: write the cache
first = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input=long_doc + "\n\nSummarize the core conclusions of this report.",
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(first.output_text)

# Round 2 onward: send only the new question, chaining the prior id
second = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input="What risks are mentioned in section three?",
    previous_response_id=first.id,
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(second.output_text)
print("Cache hit:", second.usage.input_tokens_details.cached_tokens)
```

## 암시적 캐시

`caching` 없이도 암시적 캐시는 계속 적용됩니다. 동일한 긴 접두부를 반복하면 캐시 적중률은 99.9%입니다(15,633 → 15,616). 상황에 맞게 선택하십시오 — **여러 개의 독립적인 요청에 걸쳐 하나의 접두부를 재사용하는 경우**에는 암시적 캐시가 적합하고, **하나의 세션에서 연속적인 후속 질문을 주고받는 경우**에는 연결된 명시적 캐싱이 적합합니다.

## 출력 항목 유형

응답 `output`는 다음 항목을 포함할 수 있는 배열입니다:

| 유형                | 설명                                               |
| ----------------- | ------------------------------------------------ |
| `reasoning`       | 추론 내용(`reasoning.effort`가 `minimal`가 아닐 때 표시됩니다) |
| `message`         | 최종 답변; 텍스트는 `content[].text`에 있습니다               |
| `function_call`   | `call_id` 및 `arguments`가 포함된 도구 호출               |
| `web_search_call` | 검색 호출 기록 — **현재 `results` 필드가 없습니다**             |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-responses-openapi-en.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Responses API
  description: >
    DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) — OpenAI-compatible
    Responses endpoint.


    Compared with Chat Completions, Responses adds a second caching layer —
    **explicit cache**:


    - Write the cache on the first call with `caching: {"type": "enabled"}`

    - Chain subsequent calls via `previous_response_id`; each round hits the
    entire prior context

    - Note: resending the same long prefix twice will **not** hit the explicit
    cache — you must chain


    Known unavailable: `text.format` json_schema is accepted but does not
    constrain the schema;

    the `web_search` tool is wired but its backend keeps erroring; the `mcp`
    tool returns `AccessDenied`.


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
  /v1/responses:
    post:
      tags:
        - Text Generation
      summary: >-
        Responses: DeepSeek V4 Flash text generation (with chained explicit
        cache)
      description: >
        Call the Responses endpoint with `deepseek-v4-flash-ga-260731`.


        Typical multi-turn long-context pattern:


        1. First call: send the full long document plus `caching: {"type":
        "enabled"}` and `store: true`

        2. Record the `id` from the response

        3. Later calls: send only the new question plus `previous_response_id` —
        the prior context hits the cache in full
      operationId: createDeepSeekV4FlashResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashResponsesRequest'
            example:
              model: deepseek-v4-flash-ga-260731
              input: Explain the MoE architecture in one sentence.
              max_output_tokens: 500
              store: true
              caching:
                type: enabled
      responses:
        '200':
          description: Generation succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashResponsesResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: input above 1,048,570 tokens, or
            image content (returns Model do not support image input)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: >-
            No built-in tool entitlement (returns AccessDenied when using mcp
            and similar built-in tools)
        '429':
          description: Rate limit exceeded or insufficient balance
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to deepseek-v4-flash-ga-260731
          enum:
            - deepseek-v4-flash-ga-260731
          default: deepseek-v4-flash-ga-260731
        input:
          description: >-
            Input content. Either a string or a standard OpenAI Responses
            message array. Text only — no images
          oneOf:
            - type: string
            - type: array
              items:
                type: object
        max_output_tokens:
          type: integer
          description: >-
            Max output tokens, hard ceiling 393,216. Reasoning counts toward
            this
          default: 500
          maximum: 393216
        store:
          type: boolean
          description: >-
            Whether to store this response. Must be true to chain with
            previous_response_id
          default: true
        previous_response_id:
          type: string
          description: >-
            The id of the previous response. Combined with caching, this hits
            the explicit cache in full
        caching:
          type: object
          description: >-
            Explicit cache switch. Pass {"type": "enabled"} on the first call to
            write, then chain with previous_response_id to hit
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: enabled
        reasoning:
          type: object
          description: >-
            Reasoning control. Measured: effort=minimal always yields 0
            reasoning tokens; the other tiers do not form a monotonic ladder
          properties:
            effort:
              type: string
              enum:
                - minimal
                - low
                - medium
                - high
                - max
        stream:
          type: boolean
          description: Stream the response over SSE. Measured TTFB around 2.3 seconds
          default: false
        tools:
          type: array
          description: >-
            Tool list. The function type works; web_search is wired but its
            backend errors, and mcp returns AccessDenied
          items:
            type: object
    DeepSeekV4FlashResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: Response ID, used as the next call's previous_response_id
        model:
          type: string
        output:
          type: array
          description: >-
            Output item array. May contain reasoning / message / function_call /
            web_search_call items
          items:
            type: object
        caching:
          type: object
          description: Explicit cache status echo
        usage:
          type: object
          description: >-
            Usage. input_tokens_details.cached_tokens is the cache hit;
            output_tokens_details.reasoning_tokens is reasoning spend
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI console

````