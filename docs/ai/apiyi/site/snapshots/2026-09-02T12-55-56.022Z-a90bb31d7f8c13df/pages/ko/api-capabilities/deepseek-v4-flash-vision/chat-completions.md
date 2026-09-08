> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision Chat API 레퍼런스

> deepseek-v4-flash-vision-exp에 대한 OpenAI 호환 Chat Completions API 레퍼런스 및 플레이그라운드입니다: 이미지를 보내는 세 가지 방법, token 절감 상세, 추론 토글을 제공합니다. 기본 그룹 token이 필요합니다.

<Warning>
  **테스트하기 전에 토큰이 `default` 그룹에 있는지 확인합니다.**

  `ClaudeCode` token은 여기에서 여전히 200을 반환하지만, `detail`, thinking 토글과 `logprobs`은
  모두 작동하지 않고 응답에서 `completion_tokens_details` 필드가 빠집니다 —— 마치
  파라미터를 잘못 작성한 것처럼 보이지만 실제로는 그룹이 잘못된 것입니다. Anthropic 형식의 경우
  대신 [Messages Playground](/ko/api-capabilities/deepseek-v4-flash-vision/messages)를 사용합니다.
</Warning>

<Info>
  오른쪽의 플레이그라운드에서 직접 테스트하려면: **Authorization**에 `Bearer sk-your-api-key`을 넣습니다. 예제는 공개 이미지를 사용하고 thinking이 비활성화되어 있으므로, 전송을 누르면 즉시 응답을 볼 수 있습니다. 로컬 파일의 경우 `image_url.url`을 `data:image/jpeg;base64,<BASE64>`으로 변경합니다.
</Info>

## 매개변수 빠른 참고

| 매개변수                                      | 유형     | 필수 | 기본값       | 비고                                                         |
| ----------------------------------------- | ------ | -- | --------- | ---------------------------------------------------------- |
| `model`                                   | string | ✓  | —         | 항상 `deepseek-v4-flash-vision-exp`                          |
| `messages`                                | array  | ✓  | —         | `content`는 문자열이거나, 텍스트와 이미지를 혼합할 때는 부분들의 배열입니다             |
| `max_tokens`                              | int    |    | —         | 출력 예산, 절대 상한 393,216; **추론을 켠 상태에서는 2000+를 사용하십시오**        |
| `thinking.type`                           | string |    | `enabled` | `disabled`는 안정적으로 추론을 끄며 입력 token 80개를 절약합니다               |
| `reasoning_effort`                        | string |    | —         | `none`는 추론 비활성화와 같습니다. 낮음/높음/최대는 안정적인 차이를 보이지 않습니다         |
| `response_format`                         | object |    | —         | `json_object`만 작동하며 `json_schema`는 오류가 발생합니다               |
| `stream`                                  | bool   |    | `false`   | SSE 스트리밍; 사용량을 위해 `stream_options.include_usage`와 함께 사용합니다 |
| `temperature` / `top_p` / `stop` / `seed` | —      |    | —         | 모두 유효합니다                                                   |
| `logprobs` / `top_logprobs`               | —      |    | —         | 유효합니다; `top_logprobs` 범위는 0–20입니다                          |
| `tools`                                   | array  |    | —         | 함수 호출; 구조화된 출력을 위해 `json_schema` 대신 사용합니다                  |

## 이미지를 전송하는 세 가지 방법

### `image_url`와 함께 base64 data URL 사용

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "data:image/jpeg;base64,<BASE64>", "detail": "original"}
}
```

### 공개 링크와 함께 `image_url` 사용

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

URL은 최대 8192자까지 가능하며, 60초 이내에 다운로드되어야 합니다.

### `file_data`이 포함된 `file` 블록

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

token 비용은 `image_url` 채널과 동일합니다(같은 이미지에 대해 어느 쪽이든 303입니다).

<Warning>
  **`file` 블록의 `detail`는 조용히 무시됩니다** —— 오류도 없고 저장도 되지 않습니다.
  `detail: "low"`를 사용하려면, 이미지를 `image_url` 채널을 통해 보내십시오.

  또한, **`file_id`(Files API)는 이 플랫폼에서 사용할 수 없습니다**; 하나를 전달하면
  `invalid file_id`가 반환됩니다.
</Warning>

## `detail`이 절약되는 양

네 가지 수준 모두에서 동일한 1600×1200 이미지입니다:

| `detail`   | 이미지 tokens | `original` 대비 |
| ---------- | ---------- | ------------- |
| `low`      | 142        | **-60%**      |
| `high`     | 354        | 동일            |
| `original` | 354        | 기준값           |
| `auto`     | 354        | 동일            |

이미지 유형을 식별하고, 주제를 인식하거나 대략적으로 분류하는 데에는 `low`이면 충분합니다.
작은 텍스트나 차트 값을 읽을 때는 `original`을 남겨 두십시오.

열거형에 없는 값은 명확하게 실패합니다:
`unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`.

## 이미지가 token으로 변환되는 방식

| 이미지 크기    | Tokens |
| --------- | ------ |
| 64×64     | 114    |
| 384×384   | 114    |
| 800×800   | 346    |
| 2000×2000 | 346    |
| 4000×4000 | 346    |
| 1600×400  | 266    |
| 1600×1200 | 354    |

이미지당 384가 상한입니다. 여러 이미지는 각각 독립적으로 계산되며 선형으로 합산됩니다.
**업로드 전에 미리 압축하면 대역폭은 절약되지만 token은 절약되지 않습니다** —— 2000²와 4000²는
정확히 같은 수로 변환됩니다. 전체 규칙은
[개요](/ko/api-capabilities/deepseek-v4-flash-vision/overview)를 참조하십시오.

## 추론을 비활성화하는 두 가지 방법

```json theme={null}
{ "thinking": { "type": "disabled" } }
```

```json theme={null}
{ "reasoning_effort": "none" }
```

둘 다 검증되었습니다(각각 세 번 실행: `prompt_tokens`가 303에서 223으로 감소하고 `reasoning_content`이 사라집니다). `reasoning: {"effort": "none"}`과 `enable_thinking: false`는 **작동하지 않습니다**.

<Warning>
  **`max_tokens`가 너무 작으면 빈 `content`를 반환합니다.** 추론이 켜져 있으면 한 줄짜리
  질문도 먼저 수백 개의 reasoning token을 내보낼 수 있습니다. 예산이 소진되면
  `finish_reason: "length"`와 빈 문자열이 반환되며 —— 모델이 응답하지 못한 것처럼 쉽게 오해될 수 있습니다.
  추론이 켜진 상태에서는 2000 이상을 사용하거나, 아니면 단순히 비활성화하십시오.
</Warning>

## 구조화된 출력이 필요하신가요? tools를 사용하세요

`response_format: {"type": "json_schema"}`는 반환합니다
`This response_format type is unavailable now` (상위 모델의 한계입니다).
`json_object`는 작동하지만 필드를 제약하지는 않습니다. 강제하려면 Function Call을 사용하십시오:

```json theme={null}
{
  "model": "deepseek-v4-flash-vision-exp",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "Look at the image and call record_shape."},
      {"type": "image_url", "image_url": {"url": "https://example.com/shape.jpg"}}
    ]
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "record_shape",
      "parameters": {
        "type": "object",
        "properties": {
          "shape": {"type": "string"},
          "color": {"type": "string"}
        },
        "required": ["shape", "color"]
      }
    }
  }]
}
```

도구 인수도 스트리밍 증분에서 올바르게 조합됩니다.

## 일반적인 오류

| 오류                                                      | 원인                                             |
| ------------------------------------------------------- | ---------------------------------------------- |
| `You have uploaded an unsupported image`                | 형식이 JPEG/PNG/GIF/WebP가 아니거나, base64가 손상되었습니다   |
| `Failed to download image`                              | URL에 연결할 수 없거나 60초를 초과했습니다                     |
| `image file size exceeds limit 32 MB`                   | 이미지 크기가 32 MiB보다 큽니다                           |
| `external link length … too long, max link length 8192` | URL이 너무 깁니다                                    |
| `Image in assistant message is unsupported`             | 이미지는 `user` 메시지에만 나타날 수 있습니다                   |
| `valid range of max_tokens is [1, 393216]`              | `max_tokens`이 상한을 초과했습니다                       |
| `invalid file_id`                                       | `file_id`을 사용했습니다; 이 플랫폼은 Files API를 제공하지 않습니다 |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-vision-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Vision Chat Completions API
  description: >
    DeepSeek V4 Flash Vision (`deepseek-v4-flash-vision-exp`) —
    OpenAI-compatible Chat Completions endpoint with image input.


    - **Your token must be in the `default` group**: under `ClaudeCode`,
    `detail`, the thinking toggle and `logprobs` all stop working

    - **Three ways to send an image**: `image_url` with a base64 data URL,
    `image_url` with a public link, or a `file` block with `file_data`

    - **Images become input tokens by size**: 384 per image maximum, large
    images are rescaled to roughly an 800x800 equivalent, so pre-compressing
    saves no money

    - **`detail: "low"` cuts tokens by 60%**: 1600x1200 drops from 354 to 142.
    Only effective on `image_url` blocks

    - **Thinking mode is on by default**: for plain image reading pass
    `thinking: {"type": "disabled"}` — it saves 80 input tokens and runs faster

    - **`json_schema` is not supported**: `response_format` accepts only
    `json_object`; use Function Call when you need enforcement


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`, choosing the `default` group
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
        - Vision
      summary: 'Chat completion with vision: DeepSeek V4 Flash Vision'
      description: >
        Run a chat completion with images using `deepseek-v4-flash-vision-exp`,
        fully OpenAI-compatible.


        - The example uses a public image URL, so you can hit send right away.
        For a local file, change `url` to `data:image/jpeg;base64,<BASE64>`

        - Thinking is disabled in the example for fast debugging. Switch it to
        `enabled` for harder reasoning and raise `max_tokens` above 2000

        - Images may only appear in `user` messages; putting one in `assistant`
        returns `Image in assistant message is unsupported`

        - Supported formats: JPEG, PNG, GIF, WebP (detected from file content,
        not from the declared MIME type)
      operationId: createDeepSeekV4FlashVisionChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashVisionChatRequest'
            example:
              model: deepseek-v4-flash-vision-exp
              messages:
                - role: user
                  content:
                    - type: text
                      text: What is in this image? Answer in one sentence.
                    - type: image_url
                      image_url:
                        url: https://docs.apiyi.com/images/checks-passed.png
                        detail: original
              max_tokens: 800
              thinking:
                type: disabled
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashVisionChatResponse'
              example:
                id: 35a4e262-f2b8-4eb7-bdb2-012b02c7012d
                object: chat.completion
                model: deepseek-v4-flash-vision-exp
                choices:
                  - index: 0
                    message:
                      role: assistant
                      content: >-
                        The image shows a notification stating that all checks
                        have passed, including a successful Mintlify deployment.
                    finish_reason: stop
                usage:
                  prompt_tokens: 295
                  completion_tokens: 49
                  total_tokens: 344
                  prompt_cache_hit_tokens: 0
                  prompt_cache_miss_tokens: 295
        '400':
          description: |
            Invalid request. Common causes:
            unsupported image format (`You have uploaded an unsupported image`),
            the URL could not be downloaded (`Failed to download image`),
            an image above 32 MiB (`image file size exceeds limit 32 MB`),
            a URL longer than 8192 characters,
            `max_tokens` above 393,216,
            or a `detail` value other than low/high/original/auto
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
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashVisionChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Model ID, always deepseek-v4-flash-vision-exp
          enum:
            - deepseek-v4-flash-vision-exp
          default: deepseek-v4-flash-vision-exp
        messages:
          type: array
          description: >-
            Message array. content is either a plain string or an array of
            content parts for mixed text and images
          items:
            $ref: '#/components/schemas/VisionMessage'
        max_tokens:
          type: integer
          description: >-
            Output token budget, hard ceiling 393,216. Thinking text counts
            against it, so use 2000 or more with thinking on, otherwise content
            may come back empty
          default: 800
          maximum: 393216
        thinking:
          type: object
          description: >-
            Thinking toggle. Pass {"type": "disabled"} to turn it off, saving 80
            input tokens and all reasoning output. Only effective in the default
            group
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
            Reasoning depth. In testing none reliably disables thinking;
            low/high/max showed no stable difference. Only effective in the
            default group
          enum:
            - none
            - low
            - medium
            - high
            - max
        stream:
          type: boolean
          description: >-
            Stream the response over SSE. Pair with stream_options.include_usage
            to get usage in the final chunk
          default: false
        response_format:
          type: object
          description: >-
            Output format. Only {"type": "json_object"} works; json_schema
            returns This response_format type is unavailable now
          properties:
            type:
              type: string
              enum:
                - text
                - json_object
        temperature:
          type: number
          description: Sampling temperature
        top_p:
          type: number
          description: Nucleus sampling threshold
        stop:
          type: array
          description: Stop sequences
          items:
            type: string
        seed:
          type: integer
          description: Random seed
        logprobs:
          type: boolean
          description: >-
            Return token log probabilities; populated in testing (default group
            only)
        top_logprobs:
          type: integer
          description: Number of candidates per position, range 0-20
          minimum: 0
          maximum: 20
        tools:
          type: array
          description: >-
            Function Call tool list in OpenAI format. Use it instead of
            json_schema when you need structured output
          items:
            type: object
    DeepSeekV4FlashVisionChatResponse:
      type: object
      properties:
        id:
          type: string
          description: Request ID
        object:
          type: string
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
          $ref: '#/components/schemas/VisionUsage'
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
    VisionMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          description: Message role. Image parts may only appear in user messages
          enum:
            - system
            - user
            - assistant
            - tool
        content:
          description: A string, or an array of content parts
          oneOf:
            - type: string
              description: Plain text message
            - type: array
              description: Mixed text and image parts
              items:
                $ref: '#/components/schemas/VisionContentPart'
    VisionUsage:
      type: object
      description: Usage. Tokens converted from images are included in prompt_tokens
      properties:
        prompt_tokens:
          type: integer
          description: Total input tokens (text plus image conversion)
        completion_tokens:
          type: integer
        total_tokens:
          type: integer
        prompt_cache_hit_tokens:
          type: integer
          description: >-
            Cache hit size. The hit stops before the first image; images
            themselves are never cached
        prompt_cache_miss_tokens:
          type: integer
    VisionContentPart:
      type: object
      description: >-
        A content part. type decides which fields apply: text uses text;
        image_url uses image_url; file uses file_data plus filename
      required:
        - type
      properties:
        type:
          type: string
          enum:
            - text
            - image_url
            - file
        text:
          type: string
          description: Text body when type is text
        image_url:
          $ref: '#/components/schemas/VisionImageUrl'
        file_data:
          type: string
          description: >-
            Base64 data URL when type is file; equivalent to the image_url
            channel. Note that detail on a file block is silently ignored
        filename:
          type: string
          description: File name when type is file; identification only
    VisionImageUrl:
      type: object
      required:
        - url
      properties:
        url:
          type: string
          description: >-
            A public http(s) link (max 8192 characters, must download within 60
            seconds), or a base64 data URL such as data:image/jpeg;base64,...
            (max 32 MiB per image)
          examples:
            - https://docs.apiyi.com/images/checks-passed.png
            - data:image/jpeg;base64,<BASE64_DATA>
        detail:
          type: string
          description: >-
            Image processing fidelity. low downscales to 512x512 first, taking a
            1600x1200 image from 354 tokens to 142; high/original/auto keep the
            original. Effective only in the default group and only on image_url
            parts
          enum:
            - low
            - high
            - original
            - auto
          default: original
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        The API Key from the APIYI console; the token must be in the default
        group

````