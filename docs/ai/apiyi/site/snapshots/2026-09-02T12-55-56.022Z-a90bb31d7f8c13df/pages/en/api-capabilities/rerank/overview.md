> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# bge-reranker-v2-m3 Text Reranking

> bge-reranker-v2-m3 is a multilingual reranking model that scores retrieved candidates against your query and re-sorts them — the cheapest meaningful upgrade to RAG retrieval quality. Available on APIYI at /v1/rerank, $0.01 per 1M tokens.

`bge-reranker-v2-m3` is an open-source multilingual reranking model from BAAI. It solves the single most common failure in retrieval systems: **vector search pulled the right documents back, but the ones at the top aren't the ones that actually answer the question.**

APIYI exposes the standard `/v1/rerank` endpoint — one token, same key as every other model.

<Info>
  **Model name**: `bge-reranker-v2-m3` (case-sensitive). **Endpoint**: `POST /v1/rerank`.
  Available in the `default` and `svip` groups.
  Every number on this page comes from APIYI testing on 2026-07-30 (UTC+8), 60+ test cases.
</Info>

## What it is and when to reach for it

A reranker is a **cross-encoder**: it concatenates your query with each candidate document, runs the pair through the model, and emits a relevance score directly.

That is fundamentally different from an embedding model:

|                        | Embedding (vector search)                                                | Rerank                                                             |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| How it computes        | Query and document are encoded **separately**, then compared by distance | Query and document go through the model **together**               |
| Can it be pre-indexed? | ✅ Document vectors are computed offline and stored in a vector DB        | ❌ Needs the query to compute anything — nothing can be precomputed |
| Speed                  | Fast; milliseconds over millions of documents                            | Slow; scales with candidate count                                  |
| Accuracy               | Moderate                                                                 | High                                                               |
| Role                   | **Recall**: pull dozens of documents out of millions                     | **Precision**: pick the best few out of dozens                     |

So it does not replace vector search — it's the **second stage that sits behind it**.

<Warning>
  A reranker **cannot build an index and cannot do retrieval**. It has no vector output and cannot
  process documents without a query. If what you want is "put my documents in a vector database,"
  you want [text embeddings](/en/api-capabilities/text-embedding), not this model.
</Warning>

### A measured comparison

Same 10 candidate documents, same query ("My API requests keep returning 429 — how do I fix it?"), only the ranking method changes:

| Ranking method                                    | nDCG\@3  | P\@3     | What landed in the top 3                                                               |
| ------------------------------------------------- | -------- | -------- | -------------------------------------------------------------------------------------- |
| Vector similarity only (`text-embedding-3-small`) | 0.53     | 0.33     | Direct answer, **a glossary of 4xx status codes**, **a datacenter maintenance notice** |
| Plus `bge-reranker-v2-m3`                         | **1.00** | **1.00** | Direct answer, direct answer, exponential-backoff explainer                            |

Vector search put an HTTP-4xx glossary and a maintenance notice mentioning "April 29" into the top 3. Both are topically close and share vocabulary with the query — but neither answers it. The reranker pushed both down.

That is the whole value proposition: **it separates "same topic" from "actually answers the question."**

## Model information

| Property          | Value                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Model name**    | `bge-reranker-v2-m3` (case-sensitive; a wrong name returns 503)                                                            |
| **Architecture**  | Cross-encoder, XLM-RoBERTa-large backbone, fine-tuned from bge-m3                                                          |
| **Parameters**    | \~568M (0.6B)                                                                                                              |
| **Context limit** | **8192 tokens, per query-document pair** (measured: exceeding it returns 400, no silent truncation)                        |
| **Languages**     | Verified correct ordering in Chinese, English, Japanese, Korean, Russian, French and Arabic; cross-lingual retrieval works |
| **Endpoint**      | `POST /v1/rerank`                                                                                                          |
| **Groups**        | `default`, `svip`                                                                                                          |
| **Upstream**      | Huawei Cloud ModelArts (official passthrough)                                                                              |
| **License**       | Apache 2.0                                                                                                                 |

## Pricing

| Item   | Price                                    |
| ------ | ---------------------------------------- |
| Input  | \$0.01 / 1M tokens                       |
| Output | None (this model emits no output tokens) |

<Info>
  **Cheap enough to ignore.** Reranking 100 candidates (\~2,700 tokens) costs about \$0.000027.
  A million such calls comes to \$27. Reranking is almost never the cost bottleneck in a RAG system —
  **latency is the constraint, not money**. Tune candidate-set size against latency, not spend.
</Info>

**Usage semantics** (measured):

* `prompt_tokens` = the query (counted once) plus every candidate document. Strictly linear in practice: `≈ 26.9 × doc count + 7` (fit error \< 0.31%), so you can predict it client-side
* `total_tokens` is larger, and the gap grows with candidate count — consistent with the query being counted once per query-document pair
* `input_tokens` / `output_tokens` are **always 0** on this channel — don't use them
* `top_n` and `return_documents` **do not change usage** — every candidate is scored either way

<Warning>
  This round **could not confirm from billing records whether charges follow `prompt_tokens` or
  `total_tokens`** (the test token can't read the account balance endpoint). At 100 candidates the
  two differ by about 45%. For cost-sensitive work, treat the console invoice as authoritative
  rather than computing spend from the `usage` fields.
</Warning>

## Minimal call

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/rerank \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "bge-reranker-v2-m3",
      "query": "What are the must-see attractions in Hangzhou?",
      "documents": [
        "West Lake is Hangzhou'\''s most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
        "The Bund in Shanghai sits along the Huangpu River and is the city'\''s signature landmark.",
        "Lingyin Temple, in Hangzhou'\''s West Lake district, is a well-known Buddhist temple."
      ],
      "top_n": 2
    }'
  ```

  ```python Python theme={null}
  import os, requests

  resp = requests.post(
      "https://api.apiyi.com/v1/rerank",
      headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
      json={
          "model": "bge-reranker-v2-m3",
          "query": "What are the must-see attractions in Hangzhou?",
          "documents": [
              "West Lake is Hangzhou's most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
              "The Bund in Shanghai sits along the Huangpu River and is the city's signature landmark.",
              "Lingyin Temple, in Hangzhou's West Lake district, is a well-known Buddhist temple.",
          ],
          "top_n": 2,
      },
      timeout=60,
  ).json()

  for r in resp["results"]:
      print(f"{r['relevance_score']:.4f}  {r['document']['text']}")
  ```

  ```javascript Node.js theme={null}
  const resp = await fetch('https://api.apiyi.com/v1/rerank', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.APIYI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'bge-reranker-v2-m3',
      query: 'What are the must-see attractions in Hangzhou?',
      documents: [
        "West Lake is Hangzhou's most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
        "The Bund in Shanghai sits along the Huangpu River and is the city's signature landmark.",
        "Lingyin Temple, in Hangzhou's West Lake district, is a well-known Buddhist temple.",
      ],
      top_n: 2,
    }),
  });

  const data = await resp.json();
  data.results.forEach((r) => console.log(r.relevance_score, r.document.text));
  ```
</CodeGroup>

Response:

```json theme={null}
{
  "results": [
    { "document": { "text": "West Lake is Hangzhou's most famous attraction..." }, "index": 0, "relevance_score": 0.97265625 },
    { "document": { "text": "Lingyin Temple, in Hangzhou's West Lake district..." }, "index": 2, "relevance_score": 0.1181640625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91 }
}
```

<Tip>
  **`index` is the field that matters.** It is the document's **original position** in the
  `documents` array you sent. Use it to look up your own document object (ID, URL, metadata) —
  don't try to match on the returned `text`.
</Tip>

## Request parameters

| Parameter          | Type      | Required | Notes                                                                            |
| ------------------ | --------- | -------- | -------------------------------------------------------------------------------- |
| `model`            | string    | ✓        | Always `bge-reranker-v2-m3`, **case-sensitive**                                  |
| `query`            | string    | ✓        | The search query. An empty string returns 400                                    |
| `documents`        | string\[] | ✓        | Candidates. **Plain string array only.** An empty array returns 400              |
| `top_n`            | int       |          | Return top N. Omitted / `0` / negative all return everything. No effect on usage |
| `return_documents` | bool      |          | ⚠️ **No effect on this channel** — see known issues below                        |

## Measured capability matrix

| Capability                            | Result                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Chinese semantic ranking              | ✅ nDCG\@3 = 1.00                                                                                 |
| Keyword-trap resistance               | ✅ Top-2 correct, but a distractor can still score very high (see below)                          |
| Cross-lingual (ZH ↔ EN)               | ✅ Ordering correct, but absolute scores drop 1–2 orders of magnitude                             |
| Multilingual (JA / KO / RU / FR / AR) | ✅ All five ordered correctly                                                                     |
| **Negation understanding**            | ❌ **Clear weakness**, nDCG\@3 = 0.47 (see below)                                                 |
| Determinism                           | ✅ Repeating a request 10× is bit-identical; shuffling candidates drifts only 3.7e-4              |
| Duplicate-document consistency        | ✅ Identical documents get bit-identical scores                                                   |
| Max candidates per request            | ✅ 2000 works in practice; **keep to ≤ 100**                                                      |
| Max document length                   | 8192 tokens per pair; over that returns 400 (no silent truncation)                               |
| **Upstream quota**                    | ⚠️ TPM 20,000 / RPM 120, \~4–5 concurrent slots; \~15 searches/min at 100 candidates (see below) |
| `return_documents: false`             | ❌ Parameter ignored                                                                              |

## Three things you must know

<AccordionGroup>
  <Accordion title="1. relevance_score is not a confidence value comparable across queries" icon="triangle-alert">
    The instinct is to "just filter at 0.5." **Measured data says that breaks things:**

    | Case                                             | Score range for genuinely relevant docs |
    | ------------------------------------------------ | --------------------------------------- |
    | Chinese query × Chinese documents                | 0.289 – 1.000 (median 0.948)            |
    | Same-language, non-Chinese (JA/KO/RU/FR/AR)      | **0.005 – 0.998** (median 0.241)        |
    | **Cross-lingual (ZH ↔ EN)**                      | **0.0038 – 0.205**                      |
    | Irrelevant distractor with heavy keyword overlap | peaked at **0.945**                     |

    A 0.5 threshold would **discard every correct cross-lingual result** and most second-place hits
    in non-Chinese languages, while **admitting** a document about apple farming prices for the
    query "Apple Inc. FY2024 revenue."

    **What to do instead**: treat it as a sort key, not a confidence. If you must filter, use a
    relative threshold (`score >= top1_score × 0.3`) or just take Top-N, and calibrate on your own
    labelled data.
  </Accordion>

  <Accordion title="2. Negation is a clear weakness of this model" icon="circle-x">
    Query: "Which attractions are good to visit in winter?" Two candidates explicitly say the
    opposite:

    | Rank | Score | Document                                          | Actually relevant? |
    | ---- | ----- | ------------------------------------------------- | ------------------ |
    | #1   | 0.811 | Harbin Ice and Snow World… top winter destination | ✅                  |
    | #2   | 0.769 | Beidaihe… **not suitable for winter tourism**     | ❌                  |
    | #3   | 0.531 | Qinghai Lake… **not recommended in winter**       | ❌                  |
    | #4   | 0.375 | Wusong Island… a must-see in winter               | ✅                  |
    | #5   | 0.289 | Sanya… popular winter escape                      | ✅                  |

    The model matched the topic "winter + attractions + travel" and **did not process the negation**.
    nDCG\@3 came out at just 0.47.

    **Mitigation**: for queries involving negation, exclusion or conditionals ("gluten-free",
    "anywhere except Beijing", "not applicable to minors"), add an LLM verification pass after
    reranking — do not hand the Top-N straight to users.
  </Accordion>

  <Accordion title="3. Long documents both dilute relevance and inflate noise" icon="scissors">
    Same matching sentence, padded with varying amounts of unrelated filler:

    | Total length | Score, match at **start** | Score, match at **end** |
    | ------------ | ------------------------- | ----------------------- |
    | 528 chars    | 0.933                     | 0.720                   |
    | 1028 chars   | 0.931                     | 0.500                   |
    | 4028 chars   | 0.907                     | 0.351                   |
    | 8028 chars   | 0.828                     | 0.181                   |

    And **length inflates irrelevant documents too**: the same non-matching document scored 0.029
    short and 0.121 padded — 4× higher.

    **Mitigation**: chunk long documents to 200–500 characters before reranking, and take the
    highest-scoring chunk as the document's score. Chunking is the single highest-leverage
    preprocessing step for this model.
  </Accordion>
</AccordionGroup>

Full tuning method — chunking, thresholds, recall sizing — is in [RAG tuning in practice](/en/api-capabilities/rerank/rag-best-practices).

## Known issues

<Warning>
  **`return_documents` has no effect** (measured 2026-07-30). Whether you pass `true`, `false`, or
  omit it entirely, `document.text` is echoed back. For bandwidth-sensitive workloads (large
  candidate sets with long documents) the response is much bigger than expected — map results back
  by `index` yourself instead of relying on this flag.
</Warning>

<Warning>
  **A wrong model name returns 503, not 404.** The message reads
  `Current group default has no available channels for model xxx`. The name is **case-sensitive** —
  `BGE-Reranker-v2-M3` is treated as a nonexistent model. If you get a 503 during integration,
  check spelling before assuming a channel outage.
</Warning>

<Warning>
  **Upstream quota is this model's hardest constraint — budget your tokens before you integrate.**

  The upstream (Huawei Cloud MaaS) allows **TPM 20,000 / RPM 120** for this model. The BGE-M3
  embedding model on the same platform gets 1,200,000 TPM — **60× more**.

  Testing separated two **independent** mechanisms:

  | Mechanism                            | Measured behaviour                                                                                                                                                                  |
  | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **\~4–5 concurrent in-flight slots** | 10 concurrent → 4 succeed; 20 concurrent → 5 succeed (tokens only 3–4% of TPM); **20 serial requests → 20/20 succeed**                                                              |
  | **TPM 20,000 sliding window**        | Trips even with **zero concurrency**: firing 1.3K-token requests serially, the 8th returns 429 at 16,093 cumulative tokens, 9 in a row fail, then the window slides and it recovers |

  Requests beyond the slot limit are **rejected outright, not queued**, and both failures return the
  identical message `upstream load saturated` — you cannot tell them apart from the response, so you
  have to budget for them.

  **Recommendation**: cap concurrency at 4, add exponential backoff, and size your throughput
  against the table below.
</Warning>

### How many searches per minute

Using the measured `≈26.9 tokens/document` against TPM 20,000:

| Candidates per query | Tokens per call | Theoretical ceiling |
| -------------------- | --------------- | ------------------- |
| 50                   | 673             | \~29 / min          |
| 100                  | 1,325           | **\~15 / min**      |
| 200                  | 2,629           | \~7 / min           |

This also explains why a single request can't carry too many candidates: 1000 candidates is
26,867 tokens — **one request consuming 134% of the entire minute's budget**, so it is guaranteed
to 429. At 2000 candidates it's 269%.

<Info>
  **Quota expansion is in progress.** The TPM 20,000 above is the upstream's initial allocation, and
  APIYI has already applied to have it raised. If your workload exceeds what the table allows,
  **contact APIYI support to have the upstream quota reviewed** rather than scaling your design down
  to fit the current number.
</Info>

<Warning>
  **`/v1/rerank` is the only valid path.** Requesting `/rerank` or `/v2/rerank` (the Cohere v2 SDK's
  default) returns **HTTP 200 with the website's HTML homepage**, not a JSON 404 — clients just see a
  confusing parse error. If an integration reports "unparseable response," check for the `/v1` first.
</Warning>

## FAQ

<AccordionGroup>
  <Accordion title="Can I use just one of vector search or reranking?">
    Vector search alone: workable, but Top-N precision is markedly worse (measured nDCG\@3 drops from
    1.00 to 0.53).

    Reranking alone: **no.** It has no vector output and needs a candidate set. Scoring millions of
    documents one by one is neither practical nor affordable.

    The standard shape is two-stage: recall 50–100 with vectors/BM25 → rerank down to 3–5 → feed
    the LLM.
  </Accordion>

  <Accordion title="How many candidates should I recall?">
    Measured latency scales roughly linearly with candidate count (short documents): 10 ≈ 2 s,
    100 ≈ 4 s, 500 ≈ 15 s, 1000 ≈ 33 s.

    **50–100 is the sweet spot.** Below 20, there isn't much mis-ranking left for the reranker to
    fix. Above 200, latency starts hurting interactivity while the tail of the recall list rarely
    contains the answer anyway.

    Budget matters too: 100 candidates is \~1,325 tokens, so TPM 20,000 allows only \~15 searches per
    minute. Double the candidates and you halve throughput — **candidate count is a capacity
    decision as much as a quality one**.
  </Accordion>

  <Accordion title="Can I point the Cohere or Jina SDK at it?">
    **The `cohere` SDK v2 does not work as-is**: it targets `/v2/rerank`, which returns the HTML
    homepage instead of JSON, so the SDK throws a parse error.

    The parameter names (`query` / `documents` / `top_n` / `return_documents`) do match Cohere Rerank
    v1, but `documents` **only accepts a string array** (`[{"text": "..."}]` returns 400) and the
    response has no `id` / `meta` fields. **Wrapping the HTTP call yourself is simplest** —
    [RAG tuning in practice](/en/api-capabilities/rerank/rag-best-practices) has ready-made
    LangChain and LlamaIndex adapters.

    Verified working clients: plain `requests` POST ✅, and the `openai` SDK escape hatch
    `client.post("/rerank", ...)` ✅.
  </Accordion>

  <Accordion title="Can I cache results?">
    Yes, and it's very stable. **Repeating an identical request 10 times is bit-identical** (zero
    drift). Drift of \~3.7e-4 appears only when you **shuffle the candidate order** (bf16 batching
    jitter), and ordering is unaffected.

    Key your cache on `normalised query + ordered hash of document contents`. Because order
    introduces that small drift, **do not treat `relevance_score` itself as an idempotency key.**
  </Accordion>

  <Accordion title="What happens past 8192 tokens?">
    You get a 400 with `This model's maximum context length is 8192 tokens`. It **does not silently
    truncate.** The limit applies per query-document pair, not to the request as a whole — a single
    request with 400 documents × 1000 characters (330K tokens total) returns normally.
  </Accordion>
</AccordionGroup>

## Related documentation

* [Rerank API playground](/en/api-capabilities/rerank/rerank-api)
* [RAG tuning in practice](/en/api-capabilities/rerank/rag-best-practices)
* [Text embeddings](/en/api-capabilities/text-embedding)
* [Model pricing](/en/models)
