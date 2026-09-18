> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max Chat API リファレンス

> Qwen3.8-Max Chat Completions API リファレンスとライブプレイグラウンド: reasoning_effort の段階、streaming、関数呼び出し、画像/動画入力に対応した OpenAI 互換フォーマット。

<Info>
  右側のプレイグラウンドを使って、直接リクエストを送信できます。**Authorization** に `Bearer sk-your-api-key` を入れてください。例にはすでに `reasoning_effort: "none"` が含まれています。送信してレスポンスを確認してください。
</Info>

<Tip>
  このモデルは**デフォルトで推論します**（tier `xhigh`、課金は output として扱われます）。この例では、デバッグを高速かつ低コストに保つために推論を無効化しています。難しい推論を行う場合は、`reasoning_effort` フィールドを削除し、`max_tokens` を 4000+ に上げてください。詳しい解説は、[Qwen3.8-Max の概要](/ja/api-capabilities/qwen-3-8/overview) をご覧ください。
</Tip>

## パラメータ クイックリファレンス

| Parameter          | Type          | Required | Notes                                                                                        |
| ------------------ | ------------- | -------- | -------------------------------------------------------------------------------------------- |
| `model`            | string        | ✓        | 常に `qwen3.8-max`                                                                             |
| `messages`         | array         | ✓        | 標準の OpenAI メッセージ配列; `content` はマルチモーダル配列にできます (`image_url` / `video_url` は data URL を受け付けます) |
| `max_tokens`       | int           |          | 表示される回答の出力バジェット。範囲 `[1, 131072]`。**推論用 token には制限されません**                                     |
| `reasoning_effort` | string        |          | `none` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max`、デフォルト `xhigh`               |
| `stream`           | bool          |          | SSE ストリーミング; このエンドポイントは `stream_options` がなくても最終チャンクで usage を返します                            |
| `response_format`  | object        |          | `json_schema` の構造化出力、テストでは厳格に適用                                                              |
| `tools`            | array         |          | Function calling のツール一覧、動作確認済み                                                               |
| `tool_choice`      | string/object |          | `auto` / `none` はそのまま動作; `required` または名前付き関数には `reasoning_effort: "none"` が必要です             |
| `n`                | int           |          | 1 を超える値には `reasoning_effort: "none"` が必要です                                                   |
| `temperature`      | number        |          | 有効範囲 `[0.0, 2.0)`; `2` を渡すと 400 を返します                                                        |
| `stop`             | array         |          | 停止シーケンス、動作確認済み                                                                               |

## 3つのよくあるミス

<Warning>
  **1. `max_tokens` では推論の上限は設定されません。** `max_tokens=1` を設定しましたが、それでも出力 token が 1,054 個課金されました（うち 1,045 個は推論です）。コストを抑えるには `reasoning_effort="none"` を使用してください。

  **2. 強制的なツール呼び出しには推論をオフにする必要があります。** `tool_choice` を `"required"` または名前付き関数に設定すると、推論モードは 400 を返すか、何も言わずに呼び出しをスキップします。これと併せて `reasoning_effort="none"` を指定してください。

  **3. `thinking_budget` には効果がありません。** どの値でも `low` ティアと同じように扱われます。代わりに `reasoning_effort` を使用してください。
</Warning>

## レスポンスの読み方

* thinking トレースは `choices[0].message.reasoning_content` にあります（thinking がオンのときに返されます）
* thinking コストは `usage.completion_tokens_details.reasoning_tokens` にあり、キャッシュヒットは `usage.prompt_tokens_details.cached_tokens` です
* **一部の上流ルートはこの 2 つのフィールドを報告しません**（テストではリクエストのおよそ 3 分の 1） — 正確な thinking コストの集計が必要な場合は、この点に留意してください
* 7 つの有効な `reasoning_effort` 値は、実際には 4 つのティアに対応します。`max` は `xhigh` より深く推論しません
* 不正な `reasoning_effort` 値を指定すると、黙ってダウングレードされるのではなく、有効な全セットを列挙した 400 が返されます

## 関連

* [Qwen3.8-Max 概要](/ja/api-capabilities/qwen-3-8/overview) — 機能比較表、料金、ベストプラクティスの完全版
* [Qwen3.6 シリーズ（旧版）](/ja/api-capabilities/qwen-3-6/overview) — 直前の5モデル


## OpenAPI

````yaml api-reference/qwen-3-8-max-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Qwen3.8-Max Chat Completions API
  description: >
    Qwen3.8-Max (`qwen3.8-max`) — OpenAI-compatible Chat Completions endpoint;
    any OpenAI SDK works by switching base_url.


    - Input $1.65 / output $4.95 per 1M tokens (output includes thinking) —
    17.5% below Alibaba Cloud's list price

    - 1M context, 131K max output, native image and video input

    - **Thinking is ON by default** (tier `xhigh`); `reasoning_effort` maps to
    four real tiers in practice: `none` / `minimal`≡`low` / `medium` /
    `high`≡`xhigh`≡`max`

    - `max_tokens` truncates only the visible answer and **does not bound
    thinking tokens** — use `reasoning_effort: "none"` to control cost

    - Supports streaming, function calling, response_format json_schema

    - Forced `tool_choice` and `n > 1` both require `reasoning_effort: "none"`

    - `thinking_budget` values are ignored; built-in web search is unavailable


    **Authentication**: header `Authorization: Bearer YOUR_API_KEY`


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
      summary: 'Chat completion: Qwen3.8-Max (OpenAI compatible)'
      description: >
        Run a chat completion with `qwen3.8-max`, fully compatible with the
        OpenAI format.


        The example ships with `reasoning_effort: "none"` — the recommended
        setting for everyday chat,

        which cut output tokens to roughly 1/30 in testing. For hard reasoning,
        drop that field

        (returning to the default `xhigh` tier) and raise `max_tokens` to 4000+.
      operationId: chatqwen3_8_max
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: qwen3.8-max
              messages:
                - role: user
                  content: Introduce yourself in one sentence.
              max_tokens: 1000
              reasoning_effort: none
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: forced tool_choice or n > 1 while
            thinking is on; an illegal reasoning_effort value; temperature
            outside [0.0, 2.0); max_tokens outside [1, 131072]
        '401':
          description: Invalid API key
        '429':
          description: Rate limit exceeded
      security:
        - bearerAuth: []
components:
  schemas:
    ChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Always qwen3.8-max
        messages:
          type: array
          description: Standard OpenAI message array
          items:
            type: object
            properties:
              role:
                type: string
                enum:
                  - system
                  - user
                  - assistant
                  - tool
              content:
                description: String or multimodal array (text / image_url / video_url)
        max_tokens:
          type: integer
          description: >-
            Output budget for the visible answer, range [1, 131072]. Note: does
            not bound thinking tokens
        reasoning_effort:
          type: string
          enum:
            - none
            - minimal
            - low
            - medium
            - high
            - xhigh
            - max
          description: >-
            Thinking tier, default xhigh. Measured to have only four real tiers:
            none / minimal≡low / medium / high≡xhigh≡max
        temperature:
          type: number
          description: Valid range [0.0, 2.0); passing 2 returns 400
        top_p:
          type: number
          description: Valid range (0.0, 1.0]
        top_k:
          type: integer
        stream:
          type: boolean
          description: >-
            SSE streaming. This endpoint returns usage in the final chunk even
            without stream_options
        stop:
          type: array
          description: Stop sequences, verified working
          items:
            type: string
        response_format:
          type: object
          description: >-
            Structured output; json_schema held strictly in testing. Pair it
            with reasoning_effort: none
        tools:
          type: array
          description: Function calling tool list, verified working
          items:
            type: object
        tool_choice:
          description: >-
            auto / none work as-is; required or a named function requires
            reasoning_effort: none
        parallel_tool_calls:
          type: boolean
          description: Set false to limit to a single tool call, verified working
        'n':
          type: integer
          description: 'Number of candidates. Values above 1 require reasoning_effort: none'
        logprobs:
          type: boolean
    ChatResponse:
      type: object
      properties:
        id:
          type: string
        model:
          type: string
        choices:
          type: array
          items:
            type: object
            properties:
              message:
                type: object
                properties:
                  role:
                    type: string
                  content:
                    type: string
                  reasoning_content:
                    type: string
                    description: Thinking trace, returned while thinking is on
                  tool_calls:
                    type: array
                    items:
                      type: object
              finish_reason:
                type: string
        usage:
          type: object
          description: >-
            Usage stats. Some upstream routes do not report reasoning_tokens or
            cached_tokens
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
              description: Includes thinking tokens
            total_tokens:
              type: integer
            completion_tokens_details:
              type: object
              properties:
                reasoning_tokens:
                  type: integer
            prompt_tokens_details:
              type: object
              properties:
                cached_tokens:
                  type: integer
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'Add Authorization: Bearer YOUR_API_KEY to the request header'

````