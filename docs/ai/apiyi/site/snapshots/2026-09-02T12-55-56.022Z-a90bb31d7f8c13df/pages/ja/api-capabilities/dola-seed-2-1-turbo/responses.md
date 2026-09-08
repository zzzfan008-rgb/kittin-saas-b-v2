> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Responses API リファレンス

> Seed 2.1 Turbo (dola-seed-2-1-turbo-260628) の Responses API リファレンスとインタラクティブなプレイグラウンド: ネイティブなマルチターン previous_response_id と、連鎖する明示的キャッシュ。

<Info>
  右側の Playground を使ってください: **Authorization** に `Bearer sk-your-api-key` を入れ、`input` を入力して送信します。レスポンスの `output` 配列では、`type: "reasoning"` 項目が推論サマリーで、`type: "message"` が実際の回答です。
</Info>

<Tip>
  マルチターン会話では、前回レスポンスの `id`（`resp_` プレフィックス）を次回呼び出しの `previous_response_id` として渡してください。履歴を再送する必要はありません。明示的なキャッシュと推論制御については、[Seed 2.1 Turbo 概要](/ja/api-capabilities/dola-seed-2-1-turbo/overview) で説明しています。
</Tip>

<Warning>
  * 小さな `max_output_tokens` は推論に消費され、`status: "incomplete"` は**空のテキスト**で返ってきます — 1500 から始めてください
  * 明示的なキャッシュ `caching: {"type": "enabled"}` は、**連結**で `previous_response_id` 経由した場合にのみヒットします。同じプレフィックスを繰り返してもヒットせず、暗黙のプレフィックスキャッシュも無効になります
</Warning>

## パラメータのクイックリファレンス

| パラメータ                  | 型              | 必須 | デフォルト      | 備考                                                               |
| ---------------------- | -------------- | -- | ---------- | ---------------------------------------------------------------- |
| `model`                | string         | ✓  | —          | 固定: `dola-seed-2-1-turbo-260628`                                 |
| `input`                | string / array | ✓  | —          | 文字列またはメッセージ配列（`function_call_output` アイテムを含む）                    |
| `max_output_tokens`    | int            |    | —          | thinking を含む出力予算。1500以上を推奨します                                    |
| `reasoning.effort`     | string         |    | —          | `low` / `medium` / `high`; 約371（低）対約1317（高）の reasoning token を測定 |
| `previous_response_id` | string         |    | —          | ネイティブなマルチターン用の前回レスポンスID。フルコンテキストの明示的なキャッシュヒットを有効にします             |
| `caching.type`         | string         |    | `disabled` | `enabled` で明示的キャッシュを有効化します（連鎖が必要です）                              |
| `store`                | bool           |    | `true`     | このレスポンスを後で参照できるように保存します                                          |
| `stream`               | bool           |    | `false`    | SSE イベントストリーム（`response.created` → `response.completed`）         |
| `text.format`          | object         |    | —          | 構造化出力、`json_schema` + `strict` に対応                               |
| `tools`                | array          |    | —          | Function calling ツール一覧（フラット形式）                                   |

## レスポンスのハイライト

* `status` が `incomplete` の場合は、`incomplete_details.reason` を確認してください（通常は `length`: 推論が予算を使い切っています）
* 推論の消費量: `usage.output_tokens_details.reasoning_tokens`
* キャッシュヒット: `usage.input_tokens_details.cached_tokens`（連続した2ターン目では、テストで直前までのコンテキスト全体にヒットし、レイテンシはおおむね半減しました）
* レスポンスの `caching` フィールドには、実際に有効なキャッシュモードが反映されます


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-responses-openapi-en.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Responses API
  description: >
    ByteDance Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) — native Responses
    API endpoint.


    - Full Responses semantics: event stream, reasoning items, multi-turn via
    `previous_response_id`

    - **Explicit caching**: `caching: {"type": "enabled"}` combined with
    `previous_response_id` chaining hits the entire previous context on turn 2
    (measured: 7873 cached tokens, ~2x faster)

    - Reasoning is on by default: a small `max_output_tokens` gets eaten by
    thinking, yielding `status: incomplete` with empty text - use 1500+

    - Supports `reasoning.effort` tiers, structured output (`text.format`), and
    function calling


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
  /v1/responses:
    post:
      tags:
        - Text Generation
      summary: Responses API with Seed 2.1 Turbo (native multi-turn / explicit cache)
      description: >
        Call the Responses API with `dola-seed-2-1-turbo-260628`.


        - For multi-turn conversations pass `previous_response_id` instead of
        resending history

        - With `caching.enabled`, cache hits require `previous_response_id`
        chaining; merely repeating the same prefix does not hit
      operationId: createSeedResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedResponsesRequest'
            example:
              model: dola-seed-2-1-turbo-260628
              input: Introduce yourself in one sentence
              max_output_tokens: 1500
      responses:
        '200':
          description: >-
            Generation succeeded. The output array contains reasoning and
            message items
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedResponsesResponse'
        '400':
          description: Invalid parameters
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
    SeedResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        input:
          type: string
          description: >-
            Input content. Either a string or a message array ([{role, content},
            ...], including function_call_output items)
          example: Introduce yourself in one sentence
        max_output_tokens:
          type: integer
          description: >-
            Max output tokens (thinking included). Too small yields incomplete
            with empty text - use 1500+
          default: 1500
        reasoning:
          type: object
          description: >-
            Thinking depth control. Measured: effort low ~371, high ~1317
            reasoning tokens
          properties:
            effort:
              type: string
              enum:
                - low
                - medium
                - high
        previous_response_id:
          type: string
          description: >-
            Previous response id (resp_ prefix) for native multi-turn; combine
            with caching.enabled for explicit cache hits
        caching:
          type: object
          description: >-
            Explicit cache switch. enabled only hits when chained via
            previous_response_id
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
        store:
          type: boolean
          description: >-
            Whether to store this response for later previous_response_id
            reference
        stream:
          type: boolean
          description: >-
            Stream via SSE (response.created → response.output_text.delta →
            response.completed)
          default: false
        text:
          type: object
          description: >-
            Structured output. Supports {"format": {"type": "json_schema", name,
            strict, schema}}
        tools:
          type: array
          description: >-
            Function-calling tool list (flat Responses format: {type, name,
            description, parameters})
          items:
            type: object
    SeedResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: >-
            Response ID (resp_ prefix), usable as the next turn's
            previous_response_id
        status:
          type: string
          description: >-
            completed / incomplete (incomplete when thinking eats the token
            budget)
        output:
          type: array
          description: >-
            Output items: reasoning (thinking summary), message (text),
            function_call, etc.
          items:
            type: object
        usage:
          type: object
          description: >-
            Usage. output_tokens_details.reasoning_tokens = thinking spend;
            input_tokens_details.cached_tokens = cache hits
        caching:
          type: object
          description: The cache mode actually in effect for this request
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````