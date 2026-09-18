> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Chat API リファレンス

> DeepSeek V4 Flash GA (deepseek-v4-flash-ga-260731) Chat Completions API リファレンスとプレイグラウンド: OpenAI 互換、100万コンテキスト、thinking の切り替え、および暗黙的キャッシュ。

<Info>
  右側のプレイグラウンドを使って直接テストできます: **Authorization** に `Bearer sk-your-api-key` を入れてください。デフォルトの例ではすでに深い推論（`thinking.disabled`）が無効になっているため、送信するとすぐに応答が返ります。
</Info>

<Tip>
  このモデルはデフォルトでかなり推論します — 1行の質問でも、最初に数百の reasoning tokens を出力します。デバッグ中は例の `"thinking": {"type": "disabled"}` をそのまま使ってください。
  機能、料金、キャッシュについては、[DeepSeek V4 Flash の概要](/ja/api-capabilities/deepseek-v4-flash/overview) をご覧ください。
</Tip>

<Warning>
  * 推論がオンの場合は、`max_tokens` に余裕を持たせてください（推論は出力クォータにカウントされます） — 3000以上を推奨します
  * **`response_format` は効果がありません**: `json_schema` を渡しても、スキーマを完全に無視したまま 200 が返ります。構造化出力には `tools` を使用してください
  * **`n` は黙って無視されます**: `n=2` を渡すと、`choices` にちょうど1要素を含む 200 が返ります
  * テキスト専用モデル — 画像コンテンツブロックを渡すと `Model do not support image input` が返ります
</Warning>

## パラメータ クイックリファレンス

| パラメータ                   | 型   | 必須 | デフォルト     | 備考                                                                                       |
| ----------------------- | --- | -- | --------- | ---------------------------------------------------------------------------------------- |
| `model`                 | 文字列 | ✓  | —         | `deepseek-v4-flash-ga-260731` に固定                                                        |
| `messages`              | 配列  | ✓  | —         | 標準的な OpenAI メッセージ配列、テキストのみ                                                               |
| `max_tokens`            | 整数  |    | —         | 出力クォータ、厳格な上限は 393,216；推論有効時は 3000+                                                       |
| `thinking.type`         | 文字列 |    | `enabled` | `disabled` で推論を確実にオフにします；`auto` も使用できます                                                  |
| `reasoning_effort`      | 文字列 |    | —         | `minimal` のみが決定的です（reasoning tokens は 0）；low/medium/high/max は **単調ではありません**。概要を参照してください |
| `stream`                | 真偽値 |    | `false`   | SSE ストリーミング；使用量には `stream_options.include_usage` を組み合わせます                                |
| `temperature` / `top_p` | 数値  |    | —         | サンプリングパラメータ、どちらも有効です                                                                     |
| `stop`                  | 配列  |    | —         | 停止シーケンス、切り詰められることを確認済み                                                                   |
| `seed` / `logprobs`     | —   |    | —         | どちらも有効です                                                                                 |
| `tools`                 | 配列  |    | —         | Function Call — **tool 引数は実際に制約されます**                                                    |

## コンテキストと出力の上限

| 項目              | ハード上限            | 発生するエラー                                                   |
| --------------- | ---------------- | --------------------------------------------------------- |
| 入力              | 1,048,570 tokens | `Input length ... exceeds the maximum length 1048570`     |
| 出力 `max_tokens` | 393,216          | `integer above maximum value, expected a value <= 393216` |

322,055-token の入力は、文書中ほどの needle が正しく取得された状態で 14.77 秒で返されました。

## 暗黙キャッシュ

パラメータは不要です。まったく同じ長いプレフィックスは、2回目のリクエストでヒットします。

| Round | prompt\_tokens | cached\_tokens | ヒット率  |
| ----- | -------------- | -------------- | ----- |
| 1     | 15,634         | 0              | —     |
| 2     | 15,634         | 15,616         | 99.9% |
| 3     | 15,634         | 15,616         | 99.9% |

キャッシュされた tokens の課金は、100万あたり \$0.028 です。タイムスタンプ、ランダムな ID、その他の可変コンテンツは prompt の末尾に置いてください。これらをプレフィックスに混ぜると、ヒット率はゼロになります。

## 構造化された出力が必要ですか？ tools を使いましょう

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

`choices[0].message.tool_calls[0].function.arguments` から JSON 文字列を取得してください — 安定してパースできます。


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