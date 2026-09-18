> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash ネイティブ API リファレンス

> Gemini 3.6 Flash ネイティブ generateContent API リファレンスおよびインタラクティブなプレイグラウンド：公式のリクエスト形式、検索グラウンディング、コード実行、URL コンテキストツールに対応。

<Info>
  右側のプレイグラウンドを使ってください: `sk-your-api-key`（APIYI token です。Google キーは不要です）を **x-goog-api-key** に設定します。デフォルトの例では thinking が low に設定されています。send を押すと応答が表示されます。
</Info>

<Tip>
  **Thinking はデフォルトで有効です。** コストを重視する呼び出しでは、`thinkingConfig: {"thinkingLevel": "minimal"}` または `{"thinkingBudget": 0}` を渡してください。Search grounding、コード実行、URL コンテキスト、Maps ツールは、このネイティブ エンドポイントでのみ動作します。機能、料金、測定済みの thinking レベル: [Gemini 3.6 Flash の概要](/ja/api-capabilities/gemini-3-6-flash/overview).
</Tip>

<Warning>
  * ストリーミングを行う場合は URL を `:streamGenerateContent?alt=sse` に変更してください（プレイグラウンドでは非ストリーミングを示しています）
  * コード実行は動作しますが、`executableCode` / `codeExecutionResult` フィールドは現在エコーされません — 結果はテキスト本文に表示されます
  * `:countTokens` と明示的な cache API（`cachedContents`）は、まだプラットフォームで有効になっていません
</Warning>

## パラメータ早見表

| パラメータ                                                  | 型      | 必須 | 備考                                                                                         |
| ------------------------------------------------------ | ------ | -- | ------------------------------------------------------------------------------------------ |
| `contents`                                             | array  | ✓  | 会話内容。`parts` は `text` と `inlineData`（base64 画像/PDF/音声/動画）を混在できます                           |
| `systemInstruction`                                    | object |    | システム指示                                                                                     |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |    | `minimal` / `low` / `medium` / `high`、0/403/487/837 の thinking token 数で計測                  |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |    | 思考部分をエコー（`thought: true`）                                                                  |
| `generationConfig.responseMimeType` + `responseSchema` |        |    | 構造化出力（JSON Schema）                                                                         |
| `tools`                                                | array  |    | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations` |

## Response notes

* 思考コストは `usageMetadata.thoughtsTokenCount` に表示されます（出力として請求されます）
* グラウンディングソースは `candidates[0].groundingMetadata` に表示されます; URL コンテキストは `urlContextMetadata` に表示されます
* 暗黙のキャッシュヒットは `usageMetadata.cachedContentTokenCount` に表示されます（確率的なもので、頼りにしないでください）


## OpenAPI

````yaml api-reference/gemini-3-6-flash-native-openapi-en.yaml POST /v1beta/models/gemini-3.6-flash:generateContent
openapi: 3.1.0
info:
  title: Gemini 3.6 Flash Native generateContent API
  description: >
    Gemini 3.6 Flash (`gemini-3.6-flash`) — native Gemini generateContent
    endpoint. Call it directly with your APIYI token; no Google API Key needed.


    - Input $1.50 / output $7.50 per 1M tokens (output includes thinking), 1M
    context / 64K output

    - Thinking is ON by default (thinking tokens are billed as output);
    `thinkingConfig.thinkingLevel` supports minimal/low/medium/high, and
    `thinkingBudget: 0` disables it

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
  /v1beta/models/gemini-3.6-flash:generateContent:
    post:
      tags:
        - Text Generation
      summary: 'Text generation: Gemini 3.6 Flash (native Gemini format)'
      description: >
        Generate content with `gemini-3.6-flash`, fully compatible with Google's
        official request format. For streaming use
        `:streamGenerateContent?alt=sse`.
      operationId: generategemini_3_6_flash_en
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
              generationConfig:
                thinkingConfig:
                  thinkingLevel: low
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