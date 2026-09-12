> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite ネイティブ API リファレンス

> Gemini 3.5 Flash-Lite のネイティブ generateContent API リファレンスとインタラクティブな Playground: 公式のリクエスト形式、デフォルトで推論なし、Search grounding やその他のツールに対応しています。

<Info>
  右側のプレイグラウンドを使ってください: `sk-your-api-key`（あなたの APIYI token — Google Key は不要）を **x-goog-api-key** に入れて送信してください — デフォルトでは推論なしなので、応答は高速です。
</Info>

<Tip>
  **デフォルトでは推論出力はありません。** 深い推論には `thinkingConfig: {"thinkingLevel": "high"}` を渡してください（私たちのテストでは、推論を確実に有効にするのは上位ティアのみです）。検索グラウンディング、コード実行、URL コンテキスト、Maps ツールは、このネイティブ エンドポイントでのみ動作します。機能と課金: [Gemini 3.5 Flash-Lite の概要](/ja/api-capabilities/gemini-3-5-flash-lite/overview)。
</Tip>

<Warning>
  * ストリーミングの場合、URL を `:streamGenerateContent?alt=sse` に変更してください（プレイグラウンドでは非ストリーミングを示しています）
  * コード実行は機能しますが、`executableCode` / `codeExecutionResult` フィールドは現在エコーされず — 結果はテキスト本文に表示されます
  * `:countTokens` と明示的なキャッシュ API はまだ有効化されていません; Computer Use はこのモデルでは公式にはサポートされていません
</Warning>

## パラメータのクイックリファレンス

| パラメータ                                                  | 型      | 必須 | 備考                                                                                         |
| ------------------------------------------------------ | ------ | -- | ------------------------------------------------------------------------------------------ |
| `contents`                                             | array  | ✓  | 会話内容; `parts` は `text` と `inlineData`（base64 image/PDF/audio/video）を混在できます                 |
| `systemInstruction`                                    | object |    | システム指示                                                                                     |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |    | デフォルトでは推論なし; `high` は約1000 thinking tokensで測定                                              |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |    | 推論部分をエコーします（高ティアと組み合わせます）                                                                  |
| `generationConfig.responseMimeType` + `responseSchema` |        |    | 構造化出力（JSON Schema）                                                                         |
| `tools`                                                | array  |    | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations` |

## レスポンスに関する注意

* thinking の消費量は `usageMetadata.thoughtsTokenCount` です（デフォルトは 0 です）
* グラウンディングソースは `candidates[0].groundingMetadata` に表示されます。URL コンテキストは `urlContextMetadata` です
* このモデルではテストで暗黙キャッシュのヒットは確認されていません。これを前提にコストモデルを組まないでください


## OpenAPI

````yaml api-reference/gemini-3-5-flash-lite-native-openapi-en.yaml POST /v1beta/models/gemini-3.5-flash-lite:generateContent
openapi: 3.1.0
info:
  title: Gemini 3.5 Flash-Lite Native generateContent API
  description: >
    Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) — native Gemini
    generateContent endpoint. Call it directly with your APIYI token; no Google
    API Key needed.


    - Input $0.30 / output $2.50 per 1M tokens (output includes thinking), 1M
    context / 64K output

    - Thinking is OFF by default for minimal latency; pass
    `thinkingConfig.thinkingLevel: "high"` when you need deep reasoning (in our
    tests only the high tier reliably triggers thinking)

    - Advanced tools (Search/Maps grounding, URL context, code execution) are
    exclusive to this native format


    **Authentication**: header `x-goog-api-key: YOUR_API_KEY`


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - geminiKey: []
paths:
  /v1beta/models/gemini-3.5-flash-lite:generateContent:
    post:
      tags:
        - Text Generation
      summary: 'Text generation: Gemini 3.5 Flash-Lite (native Gemini format)'
      description: >
        Generate content with `gemini-3.5-flash-lite`, fully compatible with
        Google's official request format. For streaming use
        `:streamGenerateContent?alt=sse`.
      operationId: generategemini_3_5_flash_lite_en
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GenerateContentRequest'
            example:
              contents:
                - role: user
                  parts:
                    - text: Introduce yourself in one sentence
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerateContentResponse'
        '401':
          description: Invalid API Key
        '429':
          description: Rate limit exceeded
      security:
        - geminiKey: []
components:
  schemas:
    GenerateContentRequest:
      type: object
      required:
        - contents
      properties:
        contents:
          type: array
          description: Conversation contents; parts can mix modalities
          items:
            type: object
            properties:
              role:
                type: string
                enum:
                  - user
                  - model
              parts:
                type: array
                items:
                  type: object
                  properties:
                    text:
                      type: string
                    inlineData:
                      type: object
                      description: Inline base64 media (image/PDF/audio/video)
                      properties:
                        mimeType:
                          type: string
                        data:
                          type: string
        systemInstruction:
          type: object
          description: System instruction
          properties:
            parts:
              type: array
              items:
                type: object
                properties:
                  text:
                    type: string
        generationConfig:
          type: object
          description: Generation config
          properties:
            temperature:
              type: number
            maxOutputTokens:
              type: integer
            responseMimeType:
              type: string
              description: Set to application/json for structured output
            responseSchema:
              type: object
              description: JSON Schema for structured output
            thinkingConfig:
              type: object
              description: Thinking config (see overview for measured tiers)
              properties:
                thinkingLevel:
                  type: string
                  enum:
                    - minimal
                    - low
                    - medium
                    - high
                thinkingBudget:
                  type: integer
                includeThoughts:
                  type: boolean
        tools:
          type: array
          description: >-
            Tools: google_search / url_context / codeExecution /
            functionDeclarations, etc.
          items:
            type: object
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          items:
            type: object
            properties:
              content:
                type: object
                properties:
                  role:
                    type: string
                  parts:
                    type: array
                    items:
                      type: object
              finishReason:
                type: string
              groundingMetadata:
                type: object
                description: Returned when grounding tools are enabled
        usageMetadata:
          type: object
          description: Usage; thoughtsTokenCount is the thinking spend
          properties:
            promptTokenCount:
              type: integer
            candidatesTokenCount:
              type: integer
            thoughtsTokenCount:
              type: integer
            totalTokenCount:
              type: integer
        modelVersion:
          type: string
  securitySchemes:
    geminiKey:
      type: apiKey
      in: header
      name: x-goog-api-key
      description: APIYI token, the sk- prefixed key

````