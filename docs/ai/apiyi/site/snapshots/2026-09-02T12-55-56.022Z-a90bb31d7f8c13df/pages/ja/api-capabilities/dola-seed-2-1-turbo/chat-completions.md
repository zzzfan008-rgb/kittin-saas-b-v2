> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Chat API リファレンス

> Seed 2.1 Turbo (dola-seed-2-1-turbo-260628) Chat Completions API リファレンスとインタラクティブなプレイグラウンド: OpenAI 互換で、thinking の切り替えと tiers 付きです。

<Info>
  右側のプレイグラウンドを使ってください: `Bearer sk-your-api-key` を **Authorization** に設定します。デフォルトの例では deep thinking が無効（`thinking.disabled`）になっているため、最初の送信で高速に応答が返ります。
</Info>

<Tip>
  このモデルは**deep thinking がデフォルトで ON**です。簡単な質問でも、最初に何百もの reasoning token が生成されます。デバッグ中は、例の `"thinking": {"type": "disabled"}` をそのまま使ってください。実際に推論が必要なときは `reasoning_effort`（low / medium / high）に切り替えます。機能、料金、キャッシュについては、[Seed 2.1 Turbo の概要](/ja/api-capabilities/dola-seed-2-1-turbo/overview)で説明しています。
</Tip>

<Warning>
  * thinking を ON にすると、`max_tokens` に余裕を持たせてください（推論は出力バジェットに含まれます）— 3000+ を推奨します
  * 綴りが間違ったモデル名では **503**（利用可能なチャネルがありません）が返り、404 ではありません
</Warning>

## パラメータのクイックリファレンス

| パラメータ              | 型      | 必須 | デフォルト     | 備考                                                       |
| ------------------ | ------ | -- | --------- | -------------------------------------------------------- |
| `model`            | string | ✓  | —         | 固定: `dola-seed-2-1-turbo-260628`                         |
| `messages`         | array  | ✓  | —         | 標準のOpenAIメッセージ配列                                         |
| `max_tokens`       | int    |    | —         | 出力予算; 推論オンで3000以上                                        |
| `thinking.type`    | string |    | `enabled` | **デフォルトでON**; `disabled`で推論をオフにします                       |
| `reasoning_effort` | string |    | —         | `low` / `medium` / `high`; 実測では約226（低）対約960（高）の推論 tokens |
| `stream`           | bool   |    | `false`   | SSEストリーミング; 使用状況を追加するには `stream_options.include_usage`   |
| `response_format`  | object |    | —         | 構造化出力、`json_schema` + `strict` をサポート                     |
| `tools`            | array  |    | —         | Function-calling ツール一覧                                   |

## Response Highlights

* thinking をオンにすると、`choices[0].message` には `reasoning_content`（完全な推論テキスト）に加えて `content` も含まれます
* 推論消費量: `usage.completion_tokens_details.reasoning_tokens`
* 暗黙的なキャッシュヒット: `usage.prompt_tokens_details.cached_tokens`（長い先頭部分の繰り返しは 2 回目のリクエストからヒットします）


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Chat Completions API
  description: >
    ByteDance Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) — OpenAI-compatible
    Chat Completions endpoint.


    - **Deep thinking is ON by default**: without extra params the model returns
    `reasoning_content` and burns extra tokens; pass `thinking: {"type":
    "disabled"}` for latency/cost-sensitive calls

    - Supports `reasoning_effort` tiers (low / medium / high) to control
    thinking depth

    - Supports structured output (`response_format: json_schema`), function
    calling, and streaming

    - Implicit caching is automatic: a repeated long prefix hits `cached_tokens`
    from the 2nd request


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
  /v1/chat/completions:
    post:
      tags:
        - Text Generation
      summary: Chat completion with Seed 2.1 Turbo
      description: >
        Run chat completions with `dola-seed-2-1-turbo-260628`, fully
        OpenAI-compatible.


        - Deep thinking is enabled by default and adds a `reasoning_content`
        field; the example disables it for fast debugging

        - With thinking enabled, give `max_tokens` generous headroom (reasoning
        counts against it)
      operationId: createSeedChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedChatRequest'
            example:
              model: dola-seed-2-1-turbo-260628
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 500
              thinking:
                type: disabled
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedChatResponse'
        '400':
          description: Invalid parameters (e.g. malformed json_schema, wrong types)
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
    SeedChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Model ID, fixed to dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        messages:
          type: array
          description: Conversation messages, standard OpenAI format
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
            Max output tokens. Reasoning counts against this too - give it
            headroom (e.g. 2000+) when thinking is on
          default: 500
        thinking:
          type: object
          description: >-
            Deep-thinking switch. ON by default; pass {"type": "disabled"} to
            turn it off and cut latency and output tokens sharply
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: disabled
        reasoning_effort:
          type: string
          description: >-
            Thinking depth tier (do not combine with thinking.disabled).
            Measured: low ~226, high ~960 reasoning tokens
          enum:
            - low
            - medium
            - high
        stream:
          type: boolean
          description: >-
            Stream via SSE. Combine with stream_options.include_usage to get
            usage in the final chunk
          default: false
        temperature:
          type: number
          description: Sampling temperature
        response_format:
          type: object
          description: >-
            Structured output. Supports {"type": "json_schema", "json_schema":
            {name, strict, schema}}
        tools:
          type: array
          description: Function-calling tool list, standard OpenAI format
          items:
            type: object
    SeedChatResponse:
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
            Usage. completion_tokens_details.reasoning_tokens = thinking spend;
            prompt_tokens_details.cached_tokens = implicit cache hits
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````