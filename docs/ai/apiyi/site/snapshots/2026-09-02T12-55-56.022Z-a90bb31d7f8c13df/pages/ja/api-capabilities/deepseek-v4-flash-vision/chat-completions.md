> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision チャット APIリファレンス

> OpenAI互換の Chat Completions API リファレンスと、deepseek-v4-flash-vision-exp のためのプレイグラウンドです。画像の送信方法は3通りあり、token の節約の詳細や推論の切り替えも確認できます。デフォルトグループの token が必要です。

<Warning>
  **テストする前に、`default` グループに token が含まれていることを確認してください。**

  `ClaudeCode` の token でもここでは 200 が返りますが、`detail`、thinking の切り替えと `logprobs` は
  すべて動作しなくなり、レスポンスから `completion_tokens_details` フィールドが消えます —— そのため、
  パラメータの指定を間違えたように見えますが、実際にはグループが違うだけです。Anthropic 形式の場合は、代わりに
  [メッセージ プレイグラウンド](/ja/api-capabilities/deepseek-v4-flash-vision/messages) を使用してください。
</Warning>

<Info>
  右側のプレイグラウンドで直接テストできます: `Bearer sk-your-api-key` を
  **認証** に入れてください。例では公開画像を使用し、thinking は無効になっているため、送信を押すと
  すぐにレスポンスを確認できます。ローカルファイルの場合は、`image_url.url` を
  `data:image/jpeg;base64,<BASE64>` に変更してください。
</Info>

## パラメーターのクイックリファレンス

| パラメーター                                    | 型      | 必須 | デフォルト     | 注記                                                          |
| ----------------------------------------- | ------ | -- | --------- | ----------------------------------------------------------- |
| `model`                                   | string | ✓  | —         | 常に `deepseek-v4-flash-vision-exp`                           |
| `messages`                                | array  | ✓  | —         | `content` は文字列、またはテキストと画像が混在する場合のパーツの配列です                   |
| `max_tokens`                              | int    |    | —         | 出力予算。上限は 393,216 です。**thinking を有効にする場合は 2000 以上を使用してください** |
| `thinking.type`                           | string |    | `enabled` | `disabled` は確実に thinking をオフにし、入力 tokens を 80 節約します         |
| `reasoning_effort`                        | string |    | —         | `none` は thinking を無効化するのと同等です。low/high/max の間に安定した差はありません  |
| `response_format`                         | object |    | —         | `json_object` のみが動作し、`json_schema` はエラーになります                |
| `stream`                                  | bool   |    | `false`   | SSE ストリーミング。利用時は `stream_options.include_usage` と組み合わせてください |
| `temperature` / `top_p` / `stop` / `seed` | —      |    | —         | すべて有効です                                                     |
| `logprobs` / `top_logprobs`               | —      |    | —         | 有効です。`top_logprobs` の範囲は 0–20 です                            |
| `tools`                                   | array  |    | —         | Function Call。構造化出力では `json_schema` の代わりにこれを使用してください        |

## 画像を送信する3つの方法

### `image_url` を base64 データ URL で送信する

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "data:image/jpeg;base64,<BASE64>", "detail": "original"}
}
```

### `image_url` を公開リンクで送信する

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

URL は最大 8192 文字までで、60 秒以内にダウンロードできる必要があります。

### `file` ブロックを `file_data` 付きで送信する

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

token コストは `image_url` チャネルと同じです（同じ画像ならどちらの方法でも 303 です）。

<Warning>
  **`detail` の `file` ブロック上での指定は黙って無視されます** —— エラーにもならず、保存もされません。
  `detail: "low"` を使うには、画像を `image_url` チャネル経由で送信してください。

  また、**`file_id`（Files API）はこのプラットフォームでは利用できません**。渡すと
  `invalid file_id` が返されます。
</Warning>

## `detail`でどれだけ節約できるか

4つのレベルすべてで同じ1600×1200画像:

| `detail`   | 画像 tokens | 対 `original` |
| ---------- | --------- | ------------ |
| `low`      | 142       | **-60%**     |
| `high`     | 354       | 同じ           |
| `original` | 354       | ベースライン       |
| `auto`     | 354       | 同じ           |

`low` は、画像の種類の判別、被写体の認識、または大まかな分類には十分です。
小さな文字やグラフの数値を読むには `original` を使ってください。

列挙外の値ははっきりとエラーになります:
`unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`.

## 画像が token になる仕組み

| 画像サイズ     | Tokens |
| --------- | ------ |
| 64×64     | 114    |
| 384×384   | 114    |
| 800×800   | 346    |
| 2000×2000 | 346    |
| 4000×4000 | 346    |
| 1600×400  | 266    |
| 1600×1200 | 354    |

1画像あたり384が上限です。複数画像はそれぞれ個別にカウントされ、線形に加算されます。
**アップロード前に事前圧縮すると帯域幅は節約できますが、tokens は節約できません** —— 2000² と 4000² は
まったく同じ数に変換されます。完全なルールは
[概要](/ja/api-capabilities/deepseek-v4-flash-vision/overview)をご覧ください。

## 推論を無効にする2つの方法

```json theme={null}
{ "thinking": { "type": "disabled" } }
```

```json theme={null}
{ "reasoning_effort": "none" }
```

どちらも確認済みです（それぞれ3回実行: `prompt_tokens` は 303 から 223 に下がり、`reasoning_content`
は消えます）。`reasoning: {"effort": "none"}` と `enable_thinking: false` は **動作しません**。

<Warning>
  **`max_tokens` が小さすぎると空の `content` が返ります。** 推論を有効にしていると、1行の
  質問でも最初に数百 token 分の推論が出力されることがあります。予算が尽きると
  `finish_reason: "length"` と空文字列が返り——モデルが応答に失敗したと誤解されがちです。
  推論を有効にする場合は 2000 以上にするか、単純に無効化してください。
</Warning>

## 構造化出力が必要ですか？ ツールを使ってください

`response_format: {"type": "json_schema"}` は返します
`This response_format type is unavailable now`（上流モデルの制限です）。
`json_object` は動作しますが、フィールドを制約しません。強制するには、関数呼び出しを使用してください：

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

ツール引数も、ストリーミングの増分から正しく組み立てられます。

## よくあるエラー

| エラー                                                     | 原因                                               |
| ------------------------------------------------------- | ------------------------------------------------ |
| `You have uploaded an unsupported image`                | 形式が JPEG/PNG/GIF/WebP ではないか、base64 が壊れています       |
| `Failed to download image`                              | URL に到達できないか、60秒を超えました                           |
| `image file size exceeds limit 32 MB`                   | 画像が 32 MiB を超えています                               |
| `external link length … too long, max link length 8192` | URL が長すぎます                                       |
| `Image in assistant message is unsupported`             | 画像は `user` メッセージにのみ含められます                        |
| `valid range of max_tokens is [1, 393216]`              | `max_tokens` が上限を超えています                          |
| `invalid file_id`                                       | `file_id` を使用しましたが、このプラットフォームには Files API がありません |


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