> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash チャット API リファレンス

> Gemini 3.6 Flash チャット補完 API のリファレンスとインタラクティブなプレイグラウンド：OpenAI互換で、reasoning_effort のティア、ストリーミング、関数呼び出し、ビジョンに対応しています。

<Info>
  右側のプレイグラウンドを使います: **Authorization** に `Bearer sk-your-api-key` を入れてください。デフォルトの例では `reasoning_effort: "low"` を使っています。送信するとレスポンスが表示されます。
</Info>

<Tip>
  **Thinking はデフォルトで ON です**（出力として課金されます）。デバッグでは low のままにしておき、複雑なタスクでは `max_tokens` を 4000 以上にして `high` に切り替えてください。検索 grounding、コード実行、その他のネイティブツールはこのエンドポイントでは利用できません — 代わりに [ネイティブ プレイグラウンド](/ja/api-capabilities/gemini-3-6-flash/generate-content) を使ってください。概要と計測データ: [Gemini 3.6 Flash 概要](/ja/api-capabilities/gemini-3-6-flash/overview)。
</Tip>

## パラメーターのクイックリファレンス

| パラメーター             | 型      | 必須 | 注記                                                                          |
| ------------------ | ------ | -- | --------------------------------------------------------------------------- |
| `model`            | string | ✓  | 固定: `gemini-3.6-flash`                                                      |
| `messages`         | array  | ✓  | 標準の OpenAI メッセージ。`content` はマルチモーダル配列にできます（`image_url` は data URL をサポートします） |
| `max_tokens`       | int    |    | 出力クォータ。thinking を有効にする場合は 2000+ を推奨します（thinking は出力として課金されます）               |
| `reasoning_effort` | string |    | `low` / `medium` / `high` の thinking ティア、動作確認済み                             |
| `stream`           | bool   |    | SSE ストリーミング                                                                 |
| `response_format`  | object |    | `json_schema` の構造化出力、動作確認済み                                                 |
| `tools`            | array  |    | 関数呼び出しツール一覧、動作確認済み                                                          |

## 応答ノート

* Thinking の消費は `usage.completion_tokens_details.reasoning_tokens` です（このモデルで報告されます）
* Thinking テキスト（reasoning\_content）はこのエンドポイントでは表示されません。思考を確認するには、ネイティブのエンドポイントの `includeThoughts` を使用してください
* モデル名 `gemini-3.6-flash` を再確認してください。 টাইポがあると、サイレントなフォールバックではなくエラーになります


## OpenAPI

````yaml api-reference/gemini-3-6-flash-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Gemini 3.6 Flash Chat Completions API
  description: >
    Gemini 3.6 Flash (`gemini-3.6-flash`) — OpenAI-compatible Chat Completions
    endpoint; any OpenAI SDK works by switching base_url.


    - Input $1.50 / output $7.50 per 1M tokens (output includes thinking)

    - Thinking is ON by default; tier it with `reasoning_effort`
    (low/medium/high), usage reports reasoning_tokens

    - Supports streaming, function calling, response_format json_schema, and
    vision (data URL)

    - For Search grounding / code execution and other advanced tools, use the
    native Gemini endpoint


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
      summary: 'Chat completion: Gemini 3.6 Flash (OpenAI-compatible)'
      description: |
        Chat completion with `gemini-3.6-flash`, fully OpenAI-compatible.
      operationId: chatgemini_3_6_flash_en
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: gemini-3.6-flash
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 2000
              reasoning_effort: low
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '401':
          description: Invalid API Key
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
          description: 'Fixed: gemini-3.6-flash'
        messages:
          type: array
          description: Standard OpenAI messages array
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
                description: String or multimodal array (text / image_url)
        max_tokens:
          type: integer
          description: >-
            Output quota; 2000+ recommended with thinking on (thinking bills as
            output)
        temperature:
          type: number
        stream:
          type: boolean
          description: SSE streaming
        reasoning_effort:
          type: string
          enum:
            - low
            - medium
            - high
          description: Thinking tier
        response_format:
          type: object
          description: Structured output, json_schema supported
        tools:
          type: array
          description: Function-calling tool list
          items:
            type: object
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
                  tool_calls:
                    type: array
                    items:
                      type: object
              finish_reason:
                type: string
        usage:
          type: object
          description: Usage stats
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
            total_tokens:
              type: integer
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'Add Authorization: Bearer YOUR_API_KEY header'

````