> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Rerank API Reference

> bge-reranker-v2-m3 rerank API reference and live playground: /v1/rerank parameters, response structure, error-code table and debugging notes.

<Info>
  Use the playground on the right to call the endpoint directly: put `Bearer sk-your-api-key` in
  **Authorization**, then hit send — the example body is already filled in.
</Info>

<Tip>
  Model capabilities, pricing, measured data and the three gotchas are in the
  [overview](/en/api-capabilities/rerank/overview). Recall sizing, chunking and threshold strategy
  are in [RAG tuning in practice](/en/api-capabilities/rerank/rag-best-practices).
</Tip>

## Parameter reference

| Parameter          | Type      | Required | Notes                                                                               |
| ------------------ | --------- | -------- | ----------------------------------------------------------------------------------- |
| `model`            | string    | ✓        | Always `bge-reranker-v2-m3`, **case-sensitive** (a wrong name returns 503, not 404) |
| `query`            | string    | ✓        | The search query. An empty string returns 400 `query is required`                   |
| `documents`        | string\[] | ✓        | Candidates. **Plain string array only**; an empty array returns 400                 |
| `top_n`            | int       |          | Return top N. Omitted / `0` / negative all return everything; a string returns 400  |
| `return_documents` | bool      |          | ⚠️ **No effect on this channel** — text is always echoed                            |

Unrecognised parameters (`max_chunks_per_doc`, `rank_fields`, `truncate`, …) are silently ignored rather than rejected.

## Response notes

```json theme={null}
{
  "results": [
    { "document": { "text": "..." }, "index": 0, "relevance_score": 0.97265625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91,
             "input_tokens": 0, "output_tokens": 0 }
}
```

* `index` — the document's **original position** in the `documents` array you sent. Use it to look
  up your own document object; don't match on the returned `text`.
* `relevance_score` — range 0–1. **Comparable only within a single request.** Not comparable
  across queries, and systematically lower in cross-lingual cases. See the
  [threshold discussion in the overview](/en/api-capabilities/rerank/overview).
* `results` is always sorted by `relevance_score` descending; `index` values are complete and unique.
* Read usage from `prompt_tokens` (query counted once + all documents) and `total_tokens` (query
  counted per pair); `input_tokens` / `output_tokens` are **always 0** on this channel.
  This round could not confirm from billing which field is charged — treat the console invoice as authoritative.

## Error codes

| HTTP | Message                                                 | Cause and fix                                                                                                                                                                                                                                                                                                                                                                     |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `query is required`                                     | `query` missing or an empty string                                                                                                                                                                                                                                                                                                                                                |
| 400  | `documents is required`                                 | `documents` missing or an empty array                                                                                                                                                                                                                                                                                                                                             |
| 400  | `Input should be a valid string`                        | You passed objects in `documents`; use plain strings                                                                                                                                                                                                                                                                                                                              |
| 400  | `cannot unmarshal string into ... top_n of type int`    | `top_n` was a string; pass an integer                                                                                                                                                                                                                                                                                                                                             |
| 400  | `This model's maximum context length is 8192 tokens`    | One query-document pair exceeds 8192 tokens; chunk and retry                                                                                                                                                                                                                                                                                                                      |
| 401  | `Invalid token.`                                        | Bad API key, or no `Authorization` header                                                                                                                                                                                                                                                                                                                                         |
| 429  | upstream load saturated                                 | You hit an upstream quota (**TPM 20,000 / RPM 120**). Both causes return this same message: ① more than \~4–5 concurrent in-flight requests; ② over 20,000 cumulative tokens in a minute (a single 1000-candidate request already exceeds it). Cap concurrency at 4, add backoff, and budget your tokens. This quota is being expanded — contact APIYI support for higher volumes |
| 503  | `Current group ... has no available channels for model` | **Model name misspelled** (case-sensitive), or the group genuinely has no channel. Check spelling first                                                                                                                                                                                                                                                                           |

<Warning>
  **Suspect the model name first on a 503.** If the request body fails to parse (for example
  `Content-Type: text/plain`), the gateway never reads the `model` field and returns this same 503
  with an empty model name — which reads like a channel outage but is not one.
</Warning>

<Warning>
  **A wrong path does not give you a 404.** Both `/rerank` and `/v2/rerank` (the Cohere v2 SDK's
  default) return **HTTP 200 with the website's HTML homepage**, which surfaces client-side as an
  unparseable response. `https://api.apiyi.com/v1/rerank` is the only valid path.
</Warning>

## Debugging notes

<AccordionGroup>
  <Accordion title="Don't test with only 3 candidates">
    With very few candidates the score gaps are extreme (0.97 for first, 0.12 for second) and tell
    you nothing about where the model's decision boundary sits. Use 10–20 documents including 2–3
    deliberate distractors — topically close but not answering the question. That's what shows you
    the score range on *your* corpus, which is what any threshold has to be based on.
  </Accordion>

  <Accordion title="Low scores in cross-lingual tests are expected">
    A Chinese query against English documents may score correct answers at just 0.003–0.3, but
    **the ordering is right**. That's inherent to the model, not a broken call. Judge by ordering,
    not absolute value.
  </Accordion>

  <Accordion title="There is a ~2 second latency floor">
    Even a single candidate measures around 2 s at P50 — that's fixed gateway and upstream overhead.
    Going from 1 to 100 candidates only moves P50 from 2.0 s to 3.8 s.
    So **don't shrink your candidate set to save latency**; the payoff is far smaller than expected.
  </Accordion>

  <Accordion title="You can hit the quota while debugging">
    Upstream TPM is only 20,000. Iterating with 100 candidates burns the whole minute's budget in
    about 15 calls and starts returning 429. Debug with 10–20 candidates instead — enough to see the
    score distribution, without the quota interrupting you. See the
    [quota section in RAG tuning](/en/api-capabilities/rerank/rag-best-practices).
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