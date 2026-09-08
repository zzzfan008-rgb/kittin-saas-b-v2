> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision Messages API 참조

> deepseek-v4-flash-vision-exp를 위한 Anthropic 네이티브 /v1/messages API 참조 및 플레이그라운드입니다: base64 및 URL 이미지 소스, 사고 토글, 전체 도구 왕복을 지원합니다. ClaudeCode 그룹 token이 필요합니다.

<Warning>
  **이 엔드포인트용 token은 반드시 `ClaudeCode` 그룹에 있어야 합니다. 이는 반드시 지켜야 하는 필수 조건입니다.**

  `default` 그룹을 사용하면 두 가지 문제가 겹칩니다.

  1. `top_p`을 생략하면 매번 400 `Invalid top_p value`가 반환됩니다
  2. `top_p`를 제공하더라도 첫 턴의 `thinking` 블록을 두 번째 턴에 다시 전송하면
     `unknown variant 'thinking', expected one of 'text', 'image_url', 'file'`가 반환됩니다
     —— 그리고 Claude Code와 Anthropic SDK 같은 표준 클라이언트는 항상 이를 다시 전송하므로
     **멀티턴은 항상 깨집니다**

  `ClaudeCode` 그룹으로 전환하면 두 문제 모두 사라집니다. OpenAI 형식의 경우에는
  [채팅 플레이그라운드](/ko/api-capabilities/deepseek-v4-flash-vision/chat-completions)를 대신 사용하십시오.
</Warning>

<Info>
  오른쪽의 플레이그라운드를 사용하여 직접 테스트하십시오: **x-api-key**에 `sk-your-apiyi-key`를 넣고
  (`ClaudeCode` token이며 `Bearer ` 접두사는 없습니다) `anthropic-version`는 `2023-06-01`로 두십시오.
  이 예시는 공개 이미지를 사용하고 thinking이 비활성화되어 있으므로, 전송하면 즉시
  응답을 볼 수 있습니다.
</Info>

## 매개변수 빠른 참조

| 매개변수                                       | 유형     | 필수 | 기본값       | 비고                                                                       |
| ------------------------------------------ | ------ | -- | --------- | ------------------------------------------------------------------------ |
| `model`                                    | string | ✓  | —         | 항상 `deepseek-v4-flash-vision-exp`                                        |
| `max_tokens`                               | int    | ✓  | —         | Anthropic 형식에서 필수이며, 절대 상한은 393,216입니다. thinking이 켜져 있을 때는 2000+를 사용하십시오 |
| `messages`                                 | array  | ✓  | —         | `content`는 string이거나 콘텐츠 블록 배열입니다                                        |
| `system`                                   | string |    | —         | 시스템 prompt                                                               |
| `thinking.type`                            | string |    | `enabled` | `disabled`는 `content`에 `text` 블록만 남깁니다                                   |
| `thinking.budget_tokens`                   | int    |    | —         | `enabled`이 켜져 있을 때의 thinking 예산                                          |
| `stream`                                   | bool   |    | `false`   | 표준 Anthropic 이벤트 시퀀스를 사용하는 SSE 스트리밍                                      |
| `top_p`                                    | number |    | —         | `ClaudeCode` 그룹에서는 선택 사항입니다                                              |
| `temperature` / `top_k` / `stop_sequences` | —      |    | —         | 모두 유효합니다                                                                 |
| `tools`                                    | array  |    | —         | 표준 Anthropic `input_schema` 형식                                           |

## 이미지를 전송하는 두 가지 방법

### `source.type = "base64"`

```json theme={null}
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/jpeg",
    "data": "<BASE64>"
  }
}
```

참고로 `data`에는 `data:image/jpeg;base64,` 접두사가 **없습니다** —— 이는 OpenAI 형식과 다릅니다.

### `source.type = "url"`

```json theme={null}
{
  "type": "image",
  "source": {"type": "url", "url": "https://example.com/image.jpg"}
}
```

<Note>
  `source.type = "url"`는 **`ClaudeCode` 그룹에서만 작동합니다**; `default` 그룹은
  `You have uploaded an unsupported image`를 반환합니다.

  `source.type = "file"`에는 파일 API가 필요하지만, 이 플랫폼에서는 제공하지 않습니다.
</Note>

## 응답 콘텐츠는 블록 배열입니다

| 경우                           | `content`                                                |
| ---------------------------- | -------------------------------------------------------- |
| 기본값(추론 켜짐)                   | `[{"type": "thinking", ...}, {"type": "text", ...}]`     |
| `thinking.type = "disabled"` | `[{"type": "text", ...}]`                                |
| 도구를 호출할 때                    | `[{"type": "thinking", ...}, {"type": "tool_use", ...}]` |

`ClaudeCode` 그룹에서는 `thinking` 블록에 `signature` 필드가 포함되며, 스트리밍 시 `signature_delta`도 함께 전송됩니다.

## 멀티턴과 툴 왕복

이전 어시스턴트 턴의 전체 `content`를 `messages`에 다시 넣습니다 —— **`thinking` 블록을 포함해, 제거하지 마십시오** —— 그런 다음 `tool_result`를 추가합니다:

```json theme={null}
{
  "model": "deepseek-v4-flash-vision-exp",
  "max_tokens": 1500,
  "tools": [{
    "name": "record_shape",
    "input_schema": {
      "type": "object",
      "properties": {
        "shape": {"type": "string"},
        "color": {"type": "string"}
      },
      "required": ["shape", "color"]
    }
  }],
  "messages": [
    {"role": "user", "content": [
      {"type": "text", "text": "Look at the image and call record_shape."},
      {"type": "image", "source": {"type": "url", "url": "https://example.com/shape.jpg"}}
    ]},
    {"role": "assistant", "content": "<the content array returned by the previous turn, verbatim>"},
    {"role": "user", "content": [
      {"type": "tool_result", "tool_use_id": "<the tool_use id from the previous turn>", "content": "{\"ok\":true}"}
    ]}
  ]
}
```

두 번째 턴은 테스트에서는 성공합니다. **바로 이 지점에서 `default` 그룹이 400을 반환합니다**, 그리고 이는 모든 Claude Code 스타일 클라이언트가 거치는 경로입니다 —— 따라서 그룹이 정확해야 합니다.

## 캐시 필드의 해석 방식

자동 프리픽스 캐싱이 적용되며, 표준 Anthropic 필드에 매핑됩니다:

| 필드                            | 동작                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `cache_read_input_tokens`     | 자동 프리픽스 캐시 적중 크기입니다. 적중은 첫 번째 image 전에 멈춥니다. **image 자체는 절대 캐시되지 않습니다**                                    |
| `cache_creation_input_tokens` | **항상 0입니다.** 상위 계층은 자동 프리픽스 캐싱을 사용하며 명시적인 `cache_control` 마커는 무시합니다                                        |
| `input_tokens`                | 적중 후에는 이것이 **캐시되지 않은 나머지 부분만** 보유합니다. OpenAI 형식의 `prompt_tokens`가 항상 전체 개수인 것과는 다릅니다. 둘은 직접적으로 일치시킬 수 없습니다 |

image가 포함된 요청은 3번째 호출에서 처음 적중합니다(텍스트만 있는 경우는 2번째 호출에서 적중합니다). 고정된 긴
지시사항은 캐시되도록 image **앞에** 배치하십시오.

## 일반적인 오류

| 오류                                                          | 원인                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| `Invalid top_p value, the valid range of top_p is (0, 1.0]` | `top_p` 없이 `default` 그룹 token이 있는 경우 —— `ClaudeCode`로 전환하십시오   |
| `unknown variant 'thinking'`                                | `thinking` 블록을 재생하는 `default` 그룹 token —— `ClaudeCode`로 전환하십시오 |
| `You have uploaded an unsupported image`                    | 지원되지 않는 형식이거나 `source.type = "url"`가 있는 `default` 그룹 token입니다  |
| `Image in assistant message is unsupported`                 | 이미지는 `user` 메시지에만 나타날 수 있습니다                                   |
| `image file size exceeds limit 32 MB`                       | 이미지가 32 MiB보다 큽니다                                              |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-vision-messages-openapi-en.yaml POST /v1/messages
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Vision Messages API
  description: >
    DeepSeek V4 Flash Vision (`deepseek-v4-flash-vision-exp`) — Anthropic-native
    `/v1/messages` endpoint with image input.


    - **Your token must be in the `ClaudeCode` group.** This is a hard
    requirement, not a suggestion

    - **Do not call this endpoint with a `default` group token**: omitting
    `top_p` returns 400 every time, and even with
      `top_p` supplied, replaying the first turn's `thinking` block into the second turn returns
      `unknown variant 'thinking'` — standard clients such as Claude Code and the Anthropic SDK always replay it,
      so multi-turn always breaks
    - **Two ways to send an image**: `source.type` of `base64` or `url` (`file`
    needs the Files API, which this platform does not offer)

    - **Images become input tokens by size**: 384 per image maximum, large
    images are rescaled to roughly an 800x800 equivalent

    - **`detail` has no effect on this endpoint**; use the OpenAI-format
    endpoint if you need that token saving

    - **Thinking mode is on by default**: for plain image reading pass
    `thinking: {"type": "disabled"}`, which works in both groups here


    **Authentication**: add `x-api-key: YOUR_API_KEY` and `anthropic-version:
    2023-06-01` to the request headers


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`, choosing the `ClaudeCode` group
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - anthropicKey: []
paths:
  /v1/messages:
    post:
      tags:
        - Vision
      summary: 'Messages with vision: DeepSeek V4 Flash Vision (Anthropic format)'
      description: >
        Run a conversation with images using `deepseek-v4-flash-vision-exp` in
        the native Anthropic format.


        - The example uses a public image URL, so you can hit send right away.
        For a local file use
          `{"type": "base64", "media_type": "image/jpeg", "data": "<BASE64>"}`
        - The response `content` is an array of blocks: `[thinking, text]` with
        thinking on, just `[text]` with it off

        - Tool use works end to end: replay `thinking` (with its `signature`)
        plus `tool_use`, then send `tool_result`,
          and the second turn succeeds
        - Images may only appear in `user` messages
      operationId: createDeepSeekV4FlashVisionMessage
      parameters:
        - name: anthropic-version
          in: header
          required: true
          description: Anthropic API version, always 2023-06-01
          schema:
            type: string
            default: '2023-06-01'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VisionMessagesRequest'
            example:
              model: deepseek-v4-flash-vision-exp
              max_tokens: 800
              thinking:
                type: disabled
              messages:
                - role: user
                  content:
                    - type: text
                      text: What is in this image? Answer in one sentence.
                    - type: image
                      source:
                        type: url
                        url: https://docs.apiyi.com/images/checks-passed.png
      responses:
        '200':
          description: Generation succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VisionMessagesResponse'
              example:
                id: a5cb230d-ac08-43ed-8c4b-8f88b37119d3
                type: message
                role: assistant
                model: deepseek-v4-flash-vision-exp
                content:
                  - type: text
                    text: >-
                      The image shows a notification stating that all checks
                      have passed, including a successful Mintlify deployment.
                stop_reason: end_turn
                usage:
                  input_tokens: 295
                  output_tokens: 51
                  cache_creation_input_tokens: 0
                  cache_read_input_tokens: 0
        '400':
          description: >
            Invalid request. Common causes:

            a `default` group token without `top_p` (`Invalid top_p value`),

            a `default` group token replaying a `thinking` block (`unknown
            variant 'thinking'`),

            an unsupported image format,

            or an image placed in an assistant message (`Image in assistant
            message is unsupported`)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized - invalid API Key
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: Rate limited or insufficient balance
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '503':
          description: Wrong model name, or no available channel in the group
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
      security:
        - anthropicKey: []
components:
  schemas:
    VisionMessagesRequest:
      type: object
      required:
        - model
        - max_tokens
        - messages
      properties:
        model:
          type: string
          description: Model ID, always deepseek-v4-flash-vision-exp
          enum:
            - deepseek-v4-flash-vision-exp
          default: deepseek-v4-flash-vision-exp
        max_tokens:
          type: integer
          description: >-
            Output token budget (required in the Anthropic format), hard ceiling
            393,216. Use 2000 or more with thinking on
          default: 800
          maximum: 393216
        messages:
          type: array
          description: >-
            Message array. content is either a plain string or an array of
            content blocks for mixed text and images
          items:
            $ref: '#/components/schemas/AnthropicMessage'
        system:
          type: string
          description: System prompt
        thinking:
          type: object
          description: >-
            Thinking toggle. With {"type": "disabled"} the response content
            holds only a text block. Works in both groups on this endpoint
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: disabled
            budget_tokens:
              type: integer
              description: Thinking budget when type is enabled
        stream:
          type: boolean
          description: >-
            Stream the response over SSE, emitting the standard Anthropic
            message_start / content_block_delta / message_stop events
          default: false
        temperature:
          type: number
          description: Sampling temperature
        top_p:
          type: number
          description: >-
            Nucleus sampling threshold. Optional in the ClaudeCode group; in the
            default group, omitting it returns 400
        top_k:
          type: integer
          description: Candidate cutoff
        stop_sequences:
          type: array
          description: Stop sequences
          items:
            type: string
        tools:
          type: array
          description: >-
            Tool list in the standard Anthropic input_schema format. Verified
            with streaming increments and a full two-turn round trip
          items:
            type: object
    VisionMessagesResponse:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        role:
          type: string
        model:
          type: string
        content:
          type: array
          description: >-
            Array of content blocks. [thinking, text] with thinking on, just
            [text] with it off, and [thinking, tool_use] when calling a tool
          items:
            type: object
        stop_reason:
          type: string
        usage:
          $ref: '#/components/schemas/AnthropicUsage'
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            message:
              type: string
              description: The original error message from DeepSeek upstream
            type:
              type: string
            code:
              type: string
    AnthropicMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          description: Message role. Image blocks may only appear in user messages
          enum:
            - user
            - assistant
        content:
          description: A string, or an array of content blocks
          oneOf:
            - type: string
              description: Plain text message
            - type: array
              description: Array of content blocks
              items:
                $ref: '#/components/schemas/AnthropicContentBlock'
    AnthropicUsage:
      type: object
      description: >-
        Usage. Note this differs from the OpenAI format: after a cache hit
        input_tokens holds only the uncached remainder, so it cannot be
        reconciled with prompt_tokens directly
      properties:
        input_tokens:
          type: integer
        output_tokens:
          type: integer
        cache_creation_input_tokens:
          type: integer
          description: >-
            Always 0. Upstream uses automatic prefix caching and ignores
            explicit cache_control markers
        cache_read_input_tokens:
          type: integer
          description: >-
            Automatic prefix cache hit size. The hit stops before the first
            image; images themselves are never cached
    AnthropicContentBlock:
      type: object
      description: >-
        A content block. type text uses the text field; type image uses the
        source field
      required:
        - type
      properties:
        type:
          type: string
          enum:
            - text
            - image
            - tool_use
            - tool_result
            - thinking
        text:
          type: string
          description: Text body when type is text
        source:
          $ref: '#/components/schemas/AnthropicImageSource'
    AnthropicImageSource:
      type: object
      description: Image source. Use either base64 or url
      required:
        - type
      properties:
        type:
          type: string
          description: >-
            base64 for an inline image; url for a public link (ClaudeCode group
            only); file needs the Files API, which this platform does not offer
          enum:
            - base64
            - url
        media_type:
          type: string
          description: Media type when type is base64
          enum:
            - image/jpeg
            - image/png
            - image/gif
            - image/webp
        data:
          type: string
          description: >-
            Image data when type is base64, without the data: prefix. Max 32 MiB
            per image
        url:
          type: string
          description: Public image link when type is url, max 8192 characters
          examples:
            - https://docs.apiyi.com/images/checks-passed.png
  securitySchemes:
    anthropicKey:
      type: apiKey
      in: header
      name: x-api-key
      description: >-
        Your APIYI token, the raw sk- key. The token must be in the ClaudeCode
        group

````