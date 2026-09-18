> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash ビジョン メッセージ API リファレンス

> Anthropicネイティブ /v1/messages API リファレンスと、deepseek-v4-flash-vision-exp 向けのプレイグラウンド: base64 と URL の画像ソース、thinking の切り替え、完全な tool ラウンドトリップ。ClaudeCodeグループの token が必要です。

<Warning>
  **この endpoint 用の token は `ClaudeCode` グループに含まれていなければなりません。これは必須条件です。**

  `default` グループを使うと、2つの問題が重なって発生します。

  1. `top_p` を省略すると、毎回 400 `Invalid top_p value` が返ります
  2. `top_p` を指定しても、最初のターンの `thinking` ブロックを2回目のターンに再送すると
     `unknown variant 'thinking', expected one of 'text', 'image_url', 'file'` が返ります
     —— そして Claude Code や Anthropic SDK などの標準クライアントは常にこれを再送するため、
     **マルチターンは常に壊れます**

  `ClaudeCode` グループに切り替えれば、どちらの問題も発生しません。OpenAI フォーマットの場合は、
  代わりに [Chat Playground](/ja/api-capabilities/deepseek-v4-flash-vision/chat-completions) をご利用ください。
</Warning>

<Info>
  右側の playground を使って直接テストできます。**x-api-key** に `sk-your-apiyi-key` を入れ
  （`ClaudeCode` token で、`Bearer ` プレフィックスはありません）、**`anthropic-version`** は `2023-06-01` のままにしてください。
  この例では公開画像を使用し、thinking は無効化されているため、送信するとすぐに
  response を確認できます。
</Info>

## パラメータのクイックリファレンス

| パラメータ                                      | 型      | 必須 | デフォルト     | 備考                                                                     |
| ------------------------------------------ | ------ | -- | --------- | ---------------------------------------------------------------------- |
| `model`                                    | string | ✓  | —         | 常に`deepseek-v4-flash-vision-exp`                                       |
| `max_tokens`                               | int    | ✓  | —         | Anthropic 形式では必須で、絶対上限は 393,216 です。thinking を有効にする場合は 2000 以上を使用してください |
| `messages`                                 | array  | ✓  | —         | `content` は string、または content blocks の配列です                            |
| `system`                                   | string |    | —         | システム prompt                                                            |
| `thinking.type`                            | string |    | `enabled` | `disabled` にすると `content` に `text` ブロックのみが残ります                         |
| `thinking.budget_tokens`                   | int    |    | —         | `enabled` のときの thinkingBudget                                          |
| `stream`                                   | bool   |    | `false`   | 標準の Anthropic イベントシーケンスによる SSE ストリーミング                                 |
| `top_p`                                    | number |    | —         | `ClaudeCode` グループでは任意                                                  |
| `temperature` / `top_k` / `stop_sequences` | —      |    | —         | すべて有効                                                                  |
| `tools`                                    | array  |    | —         | 標準の Anthropic `input_schema` 形式                                        |

## 画像を送信する2つの方法

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

なお、`data` には **`data:image/jpeg;base64,`** プレフィックスがありません——これは
OpenAI 形式とは異なります。

### `source.type = "url"`

```json theme={null}
{
  "type": "image",
  "source": {"type": "url", "url": "https://example.com/image.jpg"}
}
```

<Note>
  `source.type = "url"` は `ClaudeCode` グループでのみ機能します。`default` グループでは
  `You have uploaded an unsupported image` が返されます。

  `source.type = "file"` には Files API が必要ですが、このプラットフォームでは提供していません。
</Note>

## レスポンス content は block 配列です

| ケース                          | `content`                                                |
| ---------------------------- | -------------------------------------------------------- |
| デフォルト（thinking 有効）           | `[{"type": "thinking", ...}, {"type": "text", ...}]`     |
| `thinking.type = "disabled"` | `[{"type": "text", ...}]`                                |
| ツールを呼び出すとき                   | `[{"type": "thinking", ...}, {"type": "tool_use", ...}]` |

`ClaudeCode` グループでは、`thinking` ブロックに `signature` フィールドが含まれ、ストリーミングでは `signature_delta` も出力されます。

## マルチターンとツールの往復

前回のアシスタントターンの`content`全体を`messages`に戻してください—— **`thinking` ブロックも含めて、
削除しないでください** —— そして `tool_result` を追記します:

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

テストでは 2 回目のターンは成功します。**これはまさに `default` グループが 400 を返す場所です**、
そしてこれはすべての Claude Code スタイルのクライアントがたどるパスです——だからこそ、グループは正しくなければなりません。

## キャッシュフィールドの読み方

自動プレフィックスキャッシュが適用され、標準のAnthropicフィールドに対応します:

| フィールド                         | 動作                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `cache_read_input_tokens`     | 自動プレフィックスのキャッシュヒットサイズ。ヒットは最初の画像の前で止まります。**画像自体は決してキャッシュされません**                                                   |
| `cache_creation_input_tokens` | **常に0です。** 上流側は自動プレフィックスキャッシュを使用し、明示的な`cache_control`マーカーは無視します                                                  |
| `input_tokens`                | ヒット後は、OpenAI形式の`prompt_tokens`とは異なり、ここには**キャッシュされていない残り部分のみ**が入ります。OpenAI形式の`prompt_tokens`は常に全件数です。両者は直接は整合しません |

画像を含むリクエストは3回目の呼び出しで最初のヒットになります（テキストのみの場合は2回目）。固定の長い指示は、キャッシュされるように画像の**前**に置いてください。

## よくあるエラー

| エラー                                                         | 原因                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Invalid top_p value, the valid range of top_p is (0, 1.0]` | `default` グループ token で `top_p` がない —— `ClaudeCode` に切り替えてください            |
| `unknown variant 'thinking'`                                | `default` グループ token が `thinking` ブロックを再生している —— `ClaudeCode` に切り替えてください |
| `You have uploaded an unsupported image`                    | サポートされていない形式、または `default` グループ token に `source.type = "url"` がある        |
| `Image in assistant message is unsupported`                 | 画像は `user` メッセージにのみ表示できます                                                |
| `image file size exceeds limit 32 MB`                       | 画像のサイズが 32 MiB を超えています                                                   |


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