> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 再ランキング API リファレンス

> bge-reranker-v2-m3 再ランキング API リファレンスとライブプレイグラウンド: /v1/rerank のパラメータ、レスポンス構造、エラーコード表、デバッグノート。

<Info>
  右側のプレイグラウンドを使ってエンドポイントを直接呼び出せます: Authorization に `Bearer sk-your-api-key` を入れて、送信を押してください — 例の本文はすでに入力済みです。
</Info>

<Tip>
  モデルの機能、料金、測定データ、そして 3 つの注意点は
  [概要](/ja/api-capabilities/rerank/overview) にあります。Recall のサイジング、チャンク分割、しきい値戦略
  は [実践での RAG チューニング](/ja/api-capabilities/rerank/rag-best-practices) にあります。
</Tip>

## パラメータ参照

| パラメータ              | 型         | 必須 | 備考                                                               |
| ------------------ | --------- | -- | ---------------------------------------------------------------- |
| `model`            | string    | ✓  | 常に`bge-reranker-v2-m3`、**大文字小文字を区別します**（名前を間違えると404ではなく503が返ります） |
| `query`            | string    | ✓  | 検索クエリです。空文字列を指定すると400 `query is required` が返ります                  |
| `documents`        | string\[] | ✓  | 候補です。**プレーンな文字列配列のみ**です。空の配列を指定すると400が返ります                       |
| `top_n`            | int       |    | 上位N件を返します。省略 / `0` / 負の値の場合はすべて返します。文字列を指定すると400が返ります            |
| `return_documents` | bool      |    | ⚠️ **このチャネルでは効果がありません** — テキストは常にそのままエコーされます                     |

認識されないパラメータ（`max_chunks_per_doc`、`rank_fields`、`truncate`、…）は、拒否されるのではなく黙って無視されます。

## レスポンスの注意事項

```json theme={null}
{
  "results": [
    { "document": { "text": "..." }, "index": 0, "relevance_score": 0.97265625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91,
             "input_tokens": 0, "output_tokens": 0 }
}
```

* `index` — あなたが送信した `documents` 配列内でのドキュメントの**元の位置**です。これを使って
  自分のドキュメントオブジェクトを参照してください。返された `text` では一致判定しないでください。
* `relevance_score` — 範囲は 0–1 です。**単一リクエスト内でのみ比較可能**です。クエリ間では比較できず、
  クロスリンガルの場合は体系的に低くなります。詳細は
  [概要のしきい値に関する議論](/ja/api-capabilities/rerank/overview) を参照してください。
* `results` は常に `relevance_score` の降順でソートされます。`index` の値は完全で一意です。
* `prompt_tokens`（クエリは 1 回 + すべてのドキュメントでカウント）と `total_tokens`（クエリは
  ペアごとにカウント）から使用量を読み取ってください。`input_tokens` / `output_tokens` はこのチャネルでは**常に 0**です。
  今回は課金からどのフィールドが課金対象かを確認できませんでした — コンソールの請求書を正として扱ってください。

## エラーコード

| HTTP | メッセージ                                                   | 原因と対処                                                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `query is required`                                     | `query` が未指定、または空の文字列です                                                                                                                                                                                                                               |
| 400  | `documents is required`                                 | `documents` が未指定、または空の配列です                                                                                                                                                                                                                            |
| 400  | `Input should be a valid string`                        | `documents` にオブジェクトを渡しました。プレーンな文字列を使用してください                                                                                                                                                                                                           |
| 400  | `cannot unmarshal string into ... top_n of type int`    | `top_n` が文字列でした。整数を渡してください                                                                                                                                                                                                                            |
| 400  | `This model's maximum context length is 8192 tokens`    | 1つの query-document ペアが 8192 tokens を超えています。チャンクに分割して再試行してください                                                                                                                                                                                         |
| 401  | `Invalid token.`                                        | 不正な API キー、または `Authorization` ヘッダーがありません                                                                                                                                                                                                             |
| 429  | 上流の負荷が飽和しました                                            | 上流のクォータ (**TPM 20,000 / RPM 120**) に達しました。どちらの原因でも同じメッセージが返ります: ① 同時進行中のリクエストが約 4〜5 を超える; ② 1 分あたりの累積 tokens が 20,000 を超える（1000 候補の単一リクエストだけでもすでに超過します）。同時実行数を 4 に抑え、バックオフを追加し、token の使用量を見積もってください。このクォータは拡張中です — より多い利用量については APIYI サポートへお問い合わせください |
| 503  | `Current group ... has no available channels for model` | **モデル名のスペルミス**（大文字小文字を区別します）、またはグループに本当にチャネルがありません。まずスペルを確認してください                                                                                                                                                                                     |

<Warning>
  **503 ではまずモデル名を疑ってください。** リクエストボディの解析に失敗する場合（たとえば
  `Content-Type: text/plain`）、ゲートウェイは `model` フィールドを読み取らず、空のモデル名のまま同じ 503
  を返します。見た目はチャネル障害のようですが、実際は違います。
</Warning>

<Warning>
  **間違ったパスでも 404 にはなりません。** `/rerank` と `/v2/rerank` の両方（Cohere v2 SDK の
  デフォルト）は **Web サイトの HTML ホームページ付きの HTTP 200** を返し、クライアント側では
  解析できないレスポンスとして現れます。`https://api.apiyi.com/v1/rerank` だけが有効なパスです。
</Warning>

## デバッグノート

<AccordionGroup>
  <Accordion title="候補が3件だけでテストしないでください">
    候補数が非常に少ないと、スコア差は極端になります（1件目は0.97、2件目は0.12）し、モデルの判定境界がどこにあるのかは何もわかりません。10〜20件のドキュメントを使い、2〜3件の意図的なディストラクタ——トピックは近いが質問に答えていないもの——も含めてください。それによって、*あなたの*コーパスでのスコア範囲が分かります。しきい値はそれに基づいて決める必要があります。
  </Accordion>

  <Accordion title="クロスリンガルテストで低スコアなのは想定内です">
    中国語のクエリを英語のドキュメントに対して実行すると、正解のスコアは 0.003〜0.3 しか出ないことがありますが、**順序は正しい**です。これは呼び出しの不具合ではなく、モデル固有の挙動です。絶対値ではなく、順序で判断してください。
  </Accordion>

  <Accordion title="レイテンシの下限は約2秒あります">
    候補が1件でも、P50 では約2 s かかります。これはゲートウェイと上流側の固定オーバーヘッドです。
    候補が1件から100件に増えても、P50 は 2.0 s から 3.8 s にしかなりません。
    そのため、レイテンシを節約するために**候補セットを小さくしないでください**。効果は想像よりずっと小さいです。
  </Accordion>

  <Accordion title="デバッグ中にクォータに達することがあります">
    上流側の TPM は 20,000 しかありません。100候補で反復すると、約15回の呼び出しで1分分の予算を使い切り、429 が返り始めます。代わりに10〜20候補でデバッグしてください。スコア分布を見るには十分で、クォータに作業を中断されずに済みます。
    [RAG 調整のクォータのセクション](/ja/api-capabilities/rerank/rag-best-practices)を参照してください。
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/bge-reranker-v2-m3-rerank-openapi-en.yaml POST /v1/rerank
openapi: 3.1.0
info:
  title: bge-reranker-v2-m3 Rerank API
  description: >
    `bge-reranker-v2-m3` — a multilingual reranking model. Give it one query
    plus a list of candidate documents; it scores each one for relevance and
    returns them sorted descending.


    - Cross-encoder: outputs a relevance score directly. It produces **no
    embeddings and cannot be indexed** — use it only to re-sort an
    already-retrieved candidate set.

    - Multilingual: verified correct ordering in Chinese, English, Japanese,
    Korean, Russian, French and Arabic.

    - Billed on **input tokens** only; there are no output tokens.

    - Upstream quota is TPM 20,000 / RPM 120 with ~4–5 concurrent slots: about
    15 searches/minute at 100 candidates.

    - Keep candidate sets to 100 or fewer per request (1000 docs = 26,867
    tokens, over the whole minute's TPM budget, so it always 429s).


    **Authentication**: `Authorization: Bearer YOUR_API_KEY` request header


    **Get an API key**: create a token in the APIYI console at
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
  /v1/rerank:
    post:
      tags:
        - Rerank
      summary: 'Rerank documents: bge-reranker-v2-m3'
      description: >
        Pass a `query` and a list of `documents`; get them back sorted by
        relevance, descending.


        The `index` in each result is the document's **original position in the
        request's `documents` array**.

        Use it to look up your own document object (ID, metadata, source text) —
        do not rely on the returned text.
      operationId: rerankBgeRerankerV2M3En
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RerankRequest'
            example:
              model: bge-reranker-v2-m3
              query: What are the must-see attractions in Hangzhou?
              documents:
                - >-
                  West Lake is Hangzhou's most famous attraction, known for
                  Broken Bridge, Su Causeway and Leifeng Pagoda.
                - >-
                  The Bund in Shanghai sits along the Huangpu River and is the
                  city's signature landmark.
                - >-
                  Lingyin Temple, in Hangzhou's West Lake district, is one of
                  China's best-known Buddhist temples.
              top_n: 2
              return_documents: true
      responses:
        '200':
          description: Rerank succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RerankResponse'
              example:
                results:
                  - document:
                      text: >-
                        West Lake is Hangzhou's most famous attraction, known
                        for Broken Bridge, Su Causeway and Leifeng Pagoda.
                    index: 0
                    relevance_score: 0.97265625
                  - document:
                      text: >-
                        Lingyin Temple, in Hangzhou's West Lake district, is one
                        of China's best-known Buddhist temples.
                    index: 2
                    relevance_score: 0.1181640625
                usage:
                  prompt_tokens: 70
                  total_tokens: 91
        '400':
          description: 'Bad request: missing query/documents, or a field has the wrong type'
        '401':
          description: Invalid API key
        '429':
          description: >-
            You hit an upstream quota (TPM 20,000 / RPM 120): either more than
            ~4–5 concurrent in-flight requests, or over 20,000 cumulative tokens
            in a minute. A single 1000-candidate request already exceeds the
            latter
        '503':
          description: Model name misspelled, or no available channel in this group
      security:
        - bearerAuth: []
components:
  schemas:
    RerankRequest:
      type: object
      required:
        - model
        - query
        - documents
      properties:
        model:
          type: string
          description: Always bge-reranker-v2-m3 (case-sensitive; a wrong name returns 503)
          example: bge-reranker-v2-m3
        query:
          type: string
          description: The search query. An empty string returns 400
        documents:
          type: array
          description: >
            Candidate documents. **Plain string array only** — passing
            Cohere-style

            `[{"text": "..."}]` objects returns 400. Cannot be empty. Keep to
            100 or fewer.
          items:
            type: string
        top_n:
          type: integer
          description: >
            Return the top N results. Omitting it, or passing 0 or a negative
            number, returns all.

            Must be an integer — a string returns 400.

            **Does not affect usage**: every candidate is scored regardless.
          example: 2
        return_documents:
          type: boolean
          description: >
            Whether to echo the document text in results.

            **Note: this parameter currently has no effect on this channel** —
            `document.text`

            is always echoed. If response size matters, map results back by
            `index` yourself

            rather than relying on this flag to trim the payload.
          example: true
    RerankResponse:
      type: object
      properties:
        results:
          type: array
          description: Sorted by relevance_score, descending
          items:
            type: object
            properties:
              index:
                type: integer
                description: >-
                  The document's original position in the request's documents
                  array
              relevance_score:
                type: number
                description: >
                  Relevance score in the 0–1 range (post-sigmoid).

                  **It ranks documents within a single query — it is not a
                  confidence value

                  comparable across queries.** Do not apply one fixed threshold
                  everywhere.
              document:
                type: object
                properties:
                  text:
                    type: string
        usage:
          type: object
          description: Token usage. This model consumes input tokens only
          properties:
            prompt_tokens:
              type: integer
              description: >-
                Total input tokens: the query counted once plus every candidate.
                Measured ≈ 26.9 × doc count + 7
            total_tokens:
              type: integer
            input_tokens:
              type: integer
              description: Always 0 on this channel — use prompt_tokens instead
            output_tokens:
              type: integer
              description: Always 0 on this channel
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'Add the Authorization: Bearer YOUR_API_KEY request header'

````