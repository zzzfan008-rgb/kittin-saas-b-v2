> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite Chat API リファレンス

> Gemini 3.5 Flash-Lite の Chat Completions API リファレンスとインタラクティブなプレイグラウンドです。OpenAI 互換で、デフォルトでは推論なし、ストリーミング、関数呼び出し、ビジョンに対応しています。

<Info>
  右側のプレイグラウンドを使用してください。`Bearer sk-your-api-key` を **Authorization** に設定して送信します。デフォルトでは推論を行わないため、応答は高速です。
</Info>

<Tip>
  深い推論を行うには `reasoning_effort: "high"` を指定してください（注: このエンドポイントでは、このモデルの reasoning\_tokens は報告されません。正確な推論の観察には [ネイティブ Playground](/ja/api-capabilities/gemini-3-5-flash-lite/generate-content) をご利用ください）。検索グラウンディング、コード実行、およびその他のネイティブツールは、このエンドポイントでは利用できません。概要と測定データ: [Gemini 3.5 Flash-Lite 概要](/ja/api-capabilities/gemini-3-5-flash-lite/overview)。
</Tip>

## パラメータ早見表

| パラメータ              | 種類     | 必須 | 備考                                                                        |
| ------------------ | ------ | -- | ------------------------------------------------------------------------- |
| `model`            | string | ✓  | 固定: `gemini-3.5-flash-lite`                                               |
| `messages`         | array  | ✓  | 標準のOpenAIメッセージ。`content` はマルチモーダル配列にできます（`image_url` は data URL をサポートします） |
| `max_tokens`       | int    |    | 出力クォータ。`reasoning_effort: "high"` では 2000 以上を推奨します                        |
| `reasoning_effort` | string |    | `high` で推論が開始されます。usage には推論量は表示されません                                     |
| `stream`           | bool   |    | SSE streaming                                                             |
| `response_format`  | object |    | `json_schema` の構造化出力、動作確認済み                                               |
| `tools`            | array  |    | Function-calling ツール一覧、動作確認済み                                             |

## レスポンス注記

* `usage.completion_tokens_details.reasoning_tokens` はこのモデルでは報告されません（3.6 Flash では報告されます） — thinking の消費は `completion_tokens` に含まれます
* thinking テキスト（reasoning\_content）はこのエンドポイントではエコーされません
* モデル名 `gemini-3.5-flash-lite`（小文字 3 セグメント、ハイフン区切り）を再確認してください


## OpenAPI

````yaml api-reference/gemini-3-5-flash-lite-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Gemini 3.5 Flash-Lite Chat Completions API
  description: >
    Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) — OpenAI-compatible Chat
    Completions endpoint; any OpenAI SDK works by switching base_url.


    - Input $0.30 / output $2.50 per 1M tokens (output includes thinking)

    - No thinking by default, very fast; `reasoning_effort: "high"` triggers
    thinking (this model does not report reasoning_tokens on the OpenAI
    endpoint)

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
      summary: 'Chat completion: Gemini 3.5 Flash-Lite (OpenAI-compatible)'
      description: |
        Chat completion with `gemini-3.5-flash-lite`, fully OpenAI-compatible.
      operationId: chatgemini_3_5_flash_lite_en
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: gemini-3.5-flash-lite
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 2000
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
          description: 'Fixed: gemini-3.5-flash-lite'
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