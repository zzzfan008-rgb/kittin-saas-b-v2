> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision Chat API Reference

> OpenAI-compatible Chat Completions API reference and playground for deepseek-v4-flash-vision-exp: three ways to send images, detail token savings, thinking toggle. Requires a default-group token.

<Warning>
  **Check that your token is in the `default` group before you test.**

  A `ClaudeCode` token still returns 200 here, but `detail`, the thinking toggle and `logprobs`
  all stop working and the response drops its `completion_tokens_details` field —— it looks like
  you wrote the parameters wrong when in fact the group is wrong. For the Anthropic format use the
  [Messages Playground](/en/api-capabilities/deepseek-v4-flash-vision/messages) instead.
</Warning>

<Info>
  Use the playground on the right to test directly: put `Bearer sk-your-api-key` in
  **Authorization**. The example uses a public image and has thinking disabled, so you can hit send
  and see a response immediately. For a local file, change `image_url.url` to
  `data:image/jpeg;base64,<BASE64>`.
</Info>

## Parameter quick reference

| Parameter                                 | Type   | Required | Default   | Notes                                                                              |
| ----------------------------------------- | ------ | -------- | --------- | ---------------------------------------------------------------------------------- |
| `model`                                   | string | ✓        | —         | Always `deepseek-v4-flash-vision-exp`                                              |
| `messages`                                | array  | ✓        | —         | `content` is a string, or an array of parts for mixed text and images              |
| `max_tokens`                              | int    |          | —         | Output budget, hard ceiling 393,216; **use 2000+ with thinking on**                |
| `thinking.type`                           | string |          | `enabled` | `disabled` reliably turns thinking off and saves 80 input tokens                   |
| `reasoning_effort`                        | string |          | —         | `none` is equivalent to disabling thinking; low/high/max show no stable difference |
| `response_format`                         | object |          | —         | Only `json_object` works; `json_schema` errors out                                 |
| `stream`                                  | bool   |          | `false`   | SSE streaming; pair with `stream_options.include_usage` for usage                  |
| `temperature` / `top_p` / `stop` / `seed` | —      |          | —         | All effective                                                                      |
| `logprobs` / `top_logprobs`               | —      |          | —         | Effective; `top_logprobs` range is 0–20                                            |
| `tools`                                   | array  |          | —         | Function Call; use it instead of `json_schema` for structured output               |

## Three ways to send an image

### `image_url` with a base64 data URL

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "data:image/jpeg;base64,<BASE64>", "detail": "original"}
}
```

### `image_url` with a public link

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

The URL may be at most 8192 characters and must download within 60 seconds.

### A `file` block with `file_data`

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

Token cost is identical to the `image_url` channel (303 for the same image either way).

<Warning>
  **`detail` on a `file` block is silently ignored** —— no error, and no saving either.
  To use `detail: "low"`, send the image through the `image_url` channel.

  Also, **`file_id` (the Files API) is unavailable on this platform**; passing one returns
  `invalid file_id`.
</Warning>

## How much `detail` saves

The same 1600×1200 image at all four levels:

| `detail`   | Image tokens | vs. `original` |
| ---------- | ------------ | -------------- |
| `low`      | 142          | **-60%**       |
| `high`     | 354          | same           |
| `original` | 354          | baseline       |
| `auto`     | 354          | same           |

`low` is enough for identifying an image type, recognising the subject or rough classification.
Reserve `original` for reading small text or chart values.

An out-of-enum value fails loudly:
`unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`.

## How images become tokens

| Image size | Tokens |
| ---------- | ------ |
| 64×64      | 114    |
| 384×384    | 114    |
| 800×800    | 346    |
| 2000×2000  | 346    |
| 4000×4000  | 346    |
| 1600×400   | 266    |
| 1600×1200  | 354    |

384 per image is the ceiling; multiple images are counted independently and add up linearly.
**Pre-compressing before upload saves bandwidth but not tokens** —— 2000² and 4000² convert to
exactly the same number. Full rules in the
[overview](/en/api-capabilities/deepseek-v4-flash-vision/overview).

## Two ways to disable thinking

```json theme={null}
{ "thinking": { "type": "disabled" } }
```

```json theme={null}
{ "reasoning_effort": "none" }
```

Both are verified (three runs each: `prompt_tokens` drops from 303 to 223 and `reasoning_content`
disappears). `reasoning: {"effort": "none"}` and `enable_thinking: false` **do not work**.

<Warning>
  **Too small a `max_tokens` returns an empty `content`.** With thinking on, even a one-line
  question can emit several hundred tokens of reasoning first; once the budget runs out you get
  `finish_reason: "length"` and an empty string —— easily mistaken for the model failing to answer.
  Use 2000 or more with thinking on, or simply disable it.
</Warning>

## Need structured output? Use tools

`response_format: {"type": "json_schema"}` returns
`This response_format type is unavailable now` (an upstream model limitation).
`json_object` works but does not constrain fields. For enforcement, use Function Call:

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

Tool arguments also assemble correctly from streaming increments.

## Common errors

| Error                                                   | Cause                                                     |
| ------------------------------------------------------- | --------------------------------------------------------- |
| `You have uploaded an unsupported image`                | Format is not JPEG/PNG/GIF/WebP, or the base64 is corrupt |
| `Failed to download image`                              | The URL is unreachable or took over 60 seconds            |
| `image file size exceeds limit 32 MB`                   | The image is larger than 32 MiB                           |
| `external link length … too long, max link length 8192` | The URL is too long                                       |
| `Image in assistant message is unsupported`             | Images may only appear in `user` messages                 |
| `valid range of max_tokens is [1, 393216]`              | `max_tokens` is above the ceiling                         |
| `invalid file_id`                                       | You used `file_id`; this platform offers no Files API     |


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