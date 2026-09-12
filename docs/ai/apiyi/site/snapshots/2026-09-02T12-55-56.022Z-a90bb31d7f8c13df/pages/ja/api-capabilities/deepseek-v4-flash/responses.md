> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Responses API リファレンス

> DeepSeek V4 Flash GA (deepseek-v4-flash-ga-260731) Responses API リファレンスおよびプレイグラウンド: 各ラウンドで直前のコンテキスト全体にヒットする連鎖型の明示的キャッシュ。

<Info>
  右側のプレイグラウンドを使って直接テストしてください。**Authorization** に `Bearer sk-your-api-key` を入れてください。デフォルトのサンプルにはすでに `caching: {"type": "enabled"}` と
  `store: true` が含まれており、連鎖した明示キャッシュ向けの初回呼び出しの書き込み形式になっています。
</Info>

<Tip>
  Responses は Chat Completions に**明示キャッシュ**レイヤーを追加します。機能、料金、
  推論制御については、
  [DeepSeek V4 Flash の概要](/ja/api-capabilities/deepseek-v4-flash/overview) をご覧ください。
</Tip>

<Warning>
  * **`text.format` json\_schema は無効です**: スキーマを無視したまま 200 を返します。3/3 件のレスポンスはコードフェンスで囲まれており、パースに失敗しました
  * **`web_search` バックエンドは使用不可です**: ツールは接続済みですが（`web_search_call` の項目が `status: completed` として表示されます）、6/6 件の検索でエラーが発生し、`results` は返されませんでした
  * **`mcp` は `AccessDenied` を返します**: アカウント/チャネルレベルの組み込みツール権限です。有効なサーバー URL でも同じ結果になります
  * テキストのみのモデル — 画像を渡すと `Model do not support image input` が返されます
</Warning>

## パラメータのクイックリファレンス

| パラメータ                  | 型              | 必須 | デフォルト   | 注記                                                         |
| ---------------------- | -------------- | -- | ------- | ---------------------------------------------------------- |
| `model`                | string         | ✓  | —       | `deepseek-v4-flash-ga-260731` に固定                          |
| `input`                | string / array | ✓  | —       | 文字列または標準の Responses メッセージ配列、テキストのみ                         |
| `max_output_tokens`    | int            |    | —       | 上限は 393,216 です。推論はこれに加算されます                                |
| `store`                | bool           |    | `true`  | 連結するには true である必要があります                                     |
| `previous_response_id` | string         |    | —       | 直前の応答の `id`。`caching` と組み合わせると明示的キャッシュにヒットします              |
| `caching.type`         | string         |    | —       | `enabled` が明示的キャッシュを書き込みます。応答はこのフィールドをエコーします               |
| `reasoning.effort`     | string         |    | —       | `minimal` は推論 token を 0 にします。他のティアは単調ではありません               |
| `stream`               | bool           |    | `false` | SSE ストリーミング。計測された TTFB は約 2.31 秒です                         |
| `tools`                | array          |    | —       | `function` は動作します。`web_search` / `mcp` については上記の警告を参照してください |

## 明示的キャッシュ: チェーン接続が必要です

<Warning>
  **よくある間違い**: `caching` を設定して同じ長いプレフィックスを 2 回再送しても、`cached_tokens` は 0 のままです。明示的キャッシュはプレフィックス一致ではありません — `previous_response_id` でセッションをチェーン接続する必要があります。
</Warning>

正しいパターン: 最初の呼び出しでは、キャッシュに書き込むためにドキュメント全体を送信し、その後は前回の`id`をチェーン接続しながら、新しい質問だけを送ります。

| ラウンド     | 呼び出し形式                             | input\_tokens | cached\_tokens | レイテンシ |
| -------- | ---------------------------------- | ------------- | -------------- | ----- |
| 1 (書き込み) | `caching: enabled` + `store: true` | 15,629        | 0              | 4.10s |
| 2        | + `previous_response_id`           | 15,664        | **15,629**     | 5.18s |
| 3        | + `previous_response_id`           | 15,701        | **15,664**     | 4.57s |
| 4        | + `previous_response_id`           | 15,738        | **15,701**     | 4.54s |

各ラウンドで前回までのコンテキスト全体がヒットします。長いドキュメントに対するフォローアップの質問では、毎回全文を再送するよりもはるかに安価です。

### チェーン接続された呼び出しの例

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

long_doc = open("report.md").read()

# Round 1: write the cache
first = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input=long_doc + "\n\nSummarize the core conclusions of this report.",
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(first.output_text)

# Round 2 onward: send only the new question, chaining the prior id
second = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input="What risks are mentioned in section three?",
    previous_response_id=first.id,
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(second.output_text)
print("Cache hit:", second.usage.input_tokens_details.cached_tokens)
```

## 暗黙キャッシュ

`caching` がなくても、暗黙キャッシュは引き続き適用されます。まったく同じ長いプレフィックスを繰り返すと、99.9%（15,633 → 15,616）でヒットします。用途に応じて選択してください — **多数の独立したリクエストで 1 つのプレフィックスを再利用する場合** は暗黙キャッシュが適しており、**1 つのセッションで連続する追加質問を行う場合** は、連鎖させた明示的キャッシュが適しています。

## 出力アイテムの種類

レスポンス `output` は、次のアイテムを含む場合がある配列です。

| 型                 | 注記                                                   |
| ----------------- | ---------------------------------------------------- |
| `reasoning`       | 推論コンテンツ（`reasoning.effort` が `minimal` でない場合に表示されます） |
| `message`         | 最終回答; テキストは `content[].text` にあります                   |
| `function_call`   | `call_id` と `arguments` を伴うツール呼び出し                   |
| `web_search_call` | 検索呼び出しレコード — **現在は `results` フィールドを含みません**           |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-responses-openapi-en.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Responses API
  description: >
    DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) — OpenAI-compatible
    Responses endpoint.


    Compared with Chat Completions, Responses adds a second caching layer —
    **explicit cache**:


    - Write the cache on the first call with `caching: {"type": "enabled"}`

    - Chain subsequent calls via `previous_response_id`; each round hits the
    entire prior context

    - Note: resending the same long prefix twice will **not** hit the explicit
    cache — you must chain


    Known unavailable: `text.format` json_schema is accepted but does not
    constrain the schema;

    the `web_search` tool is wired but its backend keeps erroring; the `mcp`
    tool returns `AccessDenied`.


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
  /v1/responses:
    post:
      tags:
        - Text Generation
      summary: >-
        Responses: DeepSeek V4 Flash text generation (with chained explicit
        cache)
      description: >
        Call the Responses endpoint with `deepseek-v4-flash-ga-260731`.


        Typical multi-turn long-context pattern:


        1. First call: send the full long document plus `caching: {"type":
        "enabled"}` and `store: true`

        2. Record the `id` from the response

        3. Later calls: send only the new question plus `previous_response_id` —
        the prior context hits the cache in full
      operationId: createDeepSeekV4FlashResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashResponsesRequest'
            example:
              model: deepseek-v4-flash-ga-260731
              input: Explain the MoE architecture in one sentence.
              max_output_tokens: 500
              store: true
              caching:
                type: enabled
      responses:
        '200':
          description: Generation succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashResponsesResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: input above 1,048,570 tokens, or
            image content (returns Model do not support image input)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: >-
            No built-in tool entitlement (returns AccessDenied when using mcp
            and similar built-in tools)
        '429':
          description: Rate limit exceeded or insufficient balance
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to deepseek-v4-flash-ga-260731
          enum:
            - deepseek-v4-flash-ga-260731
          default: deepseek-v4-flash-ga-260731
        input:
          description: >-
            Input content. Either a string or a standard OpenAI Responses
            message array. Text only — no images
          oneOf:
            - type: string
            - type: array
              items:
                type: object
        max_output_tokens:
          type: integer
          description: >-
            Max output tokens, hard ceiling 393,216. Reasoning counts toward
            this
          default: 500
          maximum: 393216
        store:
          type: boolean
          description: >-
            Whether to store this response. Must be true to chain with
            previous_response_id
          default: true
        previous_response_id:
          type: string
          description: >-
            The id of the previous response. Combined with caching, this hits
            the explicit cache in full
        caching:
          type: object
          description: >-
            Explicit cache switch. Pass {"type": "enabled"} on the first call to
            write, then chain with previous_response_id to hit
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: enabled
        reasoning:
          type: object
          description: >-
            Reasoning control. Measured: effort=minimal always yields 0
            reasoning tokens; the other tiers do not form a monotonic ladder
          properties:
            effort:
              type: string
              enum:
                - minimal
                - low
                - medium
                - high
                - max
        stream:
          type: boolean
          description: Stream the response over SSE. Measured TTFB around 2.3 seconds
          default: false
        tools:
          type: array
          description: >-
            Tool list. The function type works; web_search is wired but its
            backend errors, and mcp returns AccessDenied
          items:
            type: object
    DeepSeekV4FlashResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: Response ID, used as the next call's previous_response_id
        model:
          type: string
        output:
          type: array
          description: >-
            Output item array. May contain reasoning / message / function_call /
            web_search_call items
          items:
            type: object
        caching:
          type: object
          description: Explicit cache status echo
        usage:
          type: object
          description: >-
            Usage. input_tokens_details.cached_tokens is the cache hit;
            output_tokens_details.reasoning_tokens is reasoning spend
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI console

````