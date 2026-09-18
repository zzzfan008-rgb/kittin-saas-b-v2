> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# RAG Tuning in Practice

> How to actually get value from bge-reranker-v2-m3: the two-stage retrieval shape, how many candidates to recall, how to chunk long documents, how to set relevance_score thresholds, how to handle negation, plus LangChain / LlamaIndex / Dify integration code.

The [overview](/en/api-capabilities/rerank/overview) covers what this model is. This page covers **how to use it correctly**.

Every recommendation maps to APIYI measurements taken on 2026-07-30 (UTC+8) — none of it is generic advice.

## 1. Get the architecture right: two-stage retrieval

Reranking is not a standalone retrieval method. It is the second stage of a pipeline.

<Steps>
  <Step title="Recall">
    Use **vector search** or **BM25** to pull a candidate set out of the full corpus. This stage must
    be **fast** and should **over-fetch**: the goal is "the answer is somewhere in here," not
    "the answer is first."
  </Step>

  <Step title="Rerank">
    Send the candidate set plus the query to `bge-reranker-v2-m3` to score and re-sort.
    This stage must be **accurate**: the goal is to push the right answer to the top.
  </Step>

  <Step title="Truncate and feed the LLM">
    Take the reranked top 3–5 into your prompt. **The more precise this is, the less the model
    hallucinates and the less context you pay for.**
  </Step>
</Steps>

<Info>
  **Why you can't skip recall and rerank everything**: a cross-encoder needs the query before it can
  compute anything, so nothing can be precomputed offline. Scoring millions of documents one at a
  time is unaffordable in both cost and latency. Recall takes you from millions to hundreds;
  reranking sorts those hundreds correctly.
</Info>

### A complete working example

This is a minimal but complete two-stage retriever — `text-embedding-3-small` for recall, `bge-reranker-v2-m3` for reranking, both through the same APIYI token:

```python theme={null}
import os
import numpy as np
import requests

BASE = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}


def embed(texts):
    """Batch embed. In production, document vectors live in a vector DB."""
    r = requests.post(f"{BASE}/embeddings", headers=HEADERS, timeout=60,
                      json={"model": "text-embedding-3-small", "input": texts})
    r.raise_for_status()
    data = sorted(r.json()["data"], key=lambda x: x["index"])
    return np.array([d["embedding"] for d in data])


def rerank(query, documents, top_n=5):
    """Rerank. documents must be a plain string array."""
    r = requests.post(f"{BASE}/rerank", headers=HEADERS, timeout=120,
                      json={"model": "bge-reranker-v2-m3", "query": query,
                            "documents": documents, "top_n": top_n})
    r.raise_for_status()
    return r.json()["results"]


def search(query, corpus, recall_k=50, final_k=5):
    """corpus: [{'id':..., 'text':..., 'meta':...}, ...]"""
    # ---- Stage 1: vector recall ----
    doc_vecs = embed([c["text"] for c in corpus])          # from your vector DB in production
    q_vec = embed([query])[0]
    doc_vecs /= np.linalg.norm(doc_vecs, axis=1, keepdims=True)
    q_vec /= np.linalg.norm(q_vec)
    recalled_idx = np.argsort(-(doc_vecs @ q_vec))[:recall_k]
    candidates = [corpus[i] for i in recalled_idx]

    # ---- Stage 2: rerank ----
    results = rerank(query, [c["text"] for c in candidates], top_n=final_k)

    # Key step: map back by index so you keep ids and metadata
    return [{**candidates[r["index"]], "score": r["relevance_score"]}
            for r in results]


corpus = [
    {"id": "kb-001", "text": "A 429 means you hit a rate limit. Reduce concurrency, implement "
                             "exponential backoff on the client, or ask for a higher RPM quota."},
    {"id": "kb-002", "text": "HTTP 4xx status codes indicate client errors: 400 bad parameters, "
                             "401 unauthorized, 403 forbidden, 404 not found."},
    {"id": "kb-003", "text": "To check your balance, call /v1/dashboard/billing/subscription."},
]

for hit in search("My API requests keep returning 429 — how do I fix it?",
                  corpus, recall_k=3, final_k=2):
    print(f"{hit['score']:.4f}  [{hit['id']}]  {hit['text'][:40]}")
```

<Warning>
  **Always map back by `index`; never look documents up by their returned text.**
  Document contents can repeat — two identical documents get bit-identical scores and are
  indistinguishable — so text lookup will attach the wrong ids and metadata.
</Warning>

## 2. How many candidates should you recall?

Measured latency (short documents, P50 of 5 runs per rung):

| Candidates | P50    | P95    |
| ---------- | ------ | ------ |
| 1          | 2.00 s | 2.58 s |
| 10         | 2.35 s | 2.68 s |
| 25         | 2.52 s | 2.81 s |
| 50         | 2.92 s | 3.39 s |
| 100        | 3.80 s | 4.32 s |
| 500        | \~15 s | —      |
| 1000       | \~33 s | —      |
| 2000       | \~68 s | —      |

The important part is the **\~2 second fixed overhead**: even one document costs 2 seconds. Going from 1 to 100 candidates adds only 1.8 seconds, and the retrieval-quality gain is worth far more than that.

**What actually drives latency is total tokens, not document count.** Same 50 candidates:

| 50 candidates                     | Input tokens | P50 latency |
| --------------------------------- | ------------ | ----------- |
| Short documents (\~20 chars each) | 673          | 2.48 s      |
| Long documents (\~480 chars each) | 20,606       | 11.74 s     |

Same count, 4.7× the latency. This is also why the chunking in the next section doesn't slow retrieval down — chunking raises document count without raising total tokens.

<Tip>
  **Recommended `recall_k`: 50–100.**

  * Under 20: the recall list is already short, so there's little mis-ranking left to fix — you're paying the fixed overhead for very little
  * Over 200: latency starts to hurt interactivity, and the tail of the recall list rarely holds the answer, so marginal return approaches zero
  * **1000 or more: guaranteed to 429.** 1000 candidates is 26,867 tokens, exceeding the entire TPM 20,000 minute budget (134%) — the request is doomed regardless of retries
</Tip>

If you genuinely need to rank many documents (offline batch work, say), **split into several ≤100-document requests** with concurrency capped at 4. Note that splitting doesn't reduce total tokens — TPM 20,000 remains the overall gate, so batch jobs need per-minute throttling. That quota is being expanded; for large batch workloads, check the currently available headroom with APIYI support first.

## 3. Chunk long documents

This is the highest-leverage preprocessing step. Two measurements explain why.

**First, unrelated content dilutes relevance.** The same matching sentence with varying amounts of filler appended:

| Total length | Match at start | Match at end | End / start |
| ------------ | -------------- | ------------ | ----------- |
| 528 chars    | 0.933          | 0.720        | 0.77        |
| 1028 chars   | 0.931          | 0.500        | 0.54        |
| 2028 chars   | 0.925          | 0.793        | 0.86        |
| 4028 chars   | 0.907          | 0.351        | 0.39        |
| 8028 chars   | 0.828          | 0.181        | 0.22        |

**Second, length inflates noise scores.** The same irrelevant document scored 0.029 short and 0.121 after 450 characters of filler — 4× higher.

Put together: **a long document with the answer at the end loses to a long document that's entirely off-topic.**

<Tip>
  **Chunking strategy**

  1. Chunk to **200–500 characters** with 10–20% overlap so answers aren't cut at a boundary
  2. Send each chunk as its own element of the `documents` array
  3. Take the **highest chunk score** as the document's score, then dedupe by document
  4. When building the prompt, send either just the matching chunk or the full document — whichever your context budget allows
</Tip>

```python theme={null}
def chunk(text, size=400, overlap=60):
    step = size - overlap
    return [text[i:i + size] for i in range(0, max(len(text) - overlap, 1), step)]


def rerank_long_docs(query, docs, top_n=5):
    """docs: [{'id':..., 'text':...}] — score by chunk, aggregate to best chunk per document."""
    flat, owner = [], []
    for d in docs:
        for c in chunk(d["text"]):
            flat.append(c)
            owner.append(d)

    best = {}
    for r in rerank(query, flat, top_n=len(flat)):
        d = owner[r["index"]]
        if r["relevance_score"] > best.get(d["id"], (0, None))[0]:
            best[d["id"]] = (r["relevance_score"], flat[r["index"]], d)

    ranked = sorted(best.values(), key=lambda x: -x[0])[:top_n]
    return [{**d, "score": s, "best_chunk": c} for s, c, d in ranked]
```

<Warning>
  **8192 tokens is a hard limit**, applied per query-document pair. Exceeding it returns 400
  (`This model's maximum context length is 8192 tokens`) — it **does not silently truncate**.

  The limit is **not** on the request total: a single request with 400 documents × 1000 characters
  (330K tokens) returns normally. So chunking protects both quality and against this 400.
</Warning>

## 4. Setting thresholds (don't just pick 0.5)

`relevance_score` is sigmoid-mapped into the 0–1 range, which makes it look like a confidence value. **It isn't.**

Measured distribution across all quality test cases:

| Group                                       | Score range for genuinely relevant docs | Median |
| ------------------------------------------- | --------------------------------------- | ------ |
| Chinese query × Chinese documents           | 0.289 – 1.000                           | 0.948  |
| Same-language, non-Chinese (JA/KO/RU/FR/AR) | 0.005 – 0.998                           | 0.241  |
| **Cross-lingual (ZH ↔ EN)**                 | **0.0038 – 0.205**                      | 0.008  |
| Irrelevant distractors (Chinese)            | peaked at **0.945**                     | 0.029  |

A fixed 0.5 threshold would **drop every correct cross-lingual result** and most second-place hits in non-Chinese languages, while **admitting** a heavy-keyword-overlap distractor (for "Apple Inc. FY2024 revenue," a document about apple farming prices scored 0.945 and ranked third).

Note the last row: the highest-scoring *irrelevant* document (0.945) outscores the lowest-scoring *relevant* one (0.289). The two distributions overlap — which is precisely why **no "safe" absolute threshold exists**.

<Tip>
  **Three workable filtering strategies, in recommended order:**

  1. **Don't filter — take Top-N** (N = 3–5). Simplest and hardest to get wrong. LLMs tolerate a little noise
  2. **Relative threshold**: keep results where `score >= top1_score × α`, with α around 0.2–0.3. This self-adjusts to the low cross-lingual baseline and still trims the long tail
  3. **Absolute threshold**: only after **you have labelled your own samples and measured the distribution on your own corpus** — and then set separately per language and per query type. Never reuse someone else's threshold
</Tip>

```python theme={null}
def filter_by_relative_threshold(results, alpha=0.25, max_n=5):
    if not results:
        return []
    top = results[0]["relevance_score"]
    return [r for r in results if r["relevance_score"] >= top * alpha][:max_n]
```

## 5. Negation needs a safety net

This is the model's clear weakness. For "Which attractions are good to visit in winter?", two documents that **explicitly say they are not** ranked 2nd and 3rd, pushing genuinely relevant results down to 4th and 5th. nDCG\@3 came out at 0.47.

The model matched the topic "winter + attractions + travel" and **never processed the negation**.

<Warning>
  Any query involving **negation, exclusion or conditionals** — "gluten-free recipes", "offices
  outside Beijing", "clauses not applicable to minors", "which regions do **not** support delivery" —
  must **not** have its reranked Top-N handed straight to users.
</Warning>

**The fix**: add a lightweight LLM verification pass after reranking. A cheap small model is enough:

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"],
                base_url="https://api.apiyi.com/v1")

NEG_HINT = ("not ", "n't", "without", "except", "exclude", "free of", "non-")


def verify_if_negated(query, hits):
    """When the query carries negation, confirm each hit actually satisfies it."""
    q = query.lower()
    if not any(k in q for k in NEG_HINT):
        return hits
    kept = []
    for h in hits:
        resp = client.chat.completions.create(
            model="gemini-3.5-flash-lite",
            messages=[{"role": "user", "content":
                       f"Question: {query}\nDocument: {h['text']}\n"
                       f"Does this document positively satisfy the question's condition? "
                       f"Answer only YES or NO."}],
            max_tokens=4,
        )
        if "YES" in resp.choices[0].message.content.upper():
            kept.append(h)
    return kept
```

## 6. Multilingual and cross-lingual use

Chinese, English, Japanese, Korean, Russian, French and Arabic — plus ZH↔EN cross-lingual retrieval — all **ordered correctly** in testing. One model covers a multilingual knowledge base; you don't need per-language deployments.

But watch the **score magnitudes**:

| Case                                  | Measured top-1 score |
| ------------------------------------- | -------------------- |
| Chinese query × Chinese documents     | 0.97                 |
| Korean query × Korean documents       | 0.87                 |
| Arabic query × Arabic documents       | 1.00                 |
| **Chinese query × English documents** | **0.20**             |
| **English query × Chinese documents** | **0.011**            |

Cross-lingual correct answers score 1–2 orders of magnitude lower — but **the ordering still holds**.

<Tip>
  Two rules for multilingual corpora:

  * **Prefer ordering over scores.** Relative thresholds (strategy 2) are far safer than absolute ones here
  * If you must use an absolute threshold, **calibrate it per query-language × document-language pair**, not globally
</Tip>

## 7. Concurrency, caching and idempotency

### Budget the quota first, then talk about concurrency

The upstream (Huawei Cloud MaaS) allows **TPM 20,000 / RPM 120** for this model. This is the constraint people most often underestimate — the BGE-M3 embedding model on the same platform gets 1,200,000 TPM, **60× more**.

Testing (with a 70-second silence before each case to let the quota window reset) separated two **independent** mechanisms:

| Case | Scenario                                        | Success   | Tokens as % of TPM | Note                                  |
| ---- | ----------------------------------------------- | --------- | ------------------ | ------------------------------------- |
| R1   | 10 concurrent × 10 requests (tiny)              | 4/10      | 4%                 | Fails despite negligible tokens       |
| R2   | 20 concurrent × 20 requests (tiny)              | 5/20      | 3%                 | Doubling concurrency still yields 4–5 |
| R4   | **Fully serial** 20 requests (1.3K tokens each) | 11/20     | 97%                | **429s with zero concurrency**        |
| R5   | **Fully serial** 20 tiny requests               | **20/20** | 0%                 | Serial is unaffected                  |

**Finding 1: roughly 4–5 concurrent in-flight slots.** R1/R2 consume only 3–4% of TPM yet fail widely, and raising concurrency from 10 to 20 still caps successes at 4–5 — while R5's 20 serial requests all pass. Requests beyond the slot limit are **rejected outright, not queued**.

**Finding 2: TPM 20,000 applies independently of concurrency.** R4 is fully serial, and the 8th request 429s at 16,093 cumulative tokens, with 9 consecutive failures before the window slides:

```
#1–#7   [200]  cumulative tokens climbing to 16,093
#8      [429]  ← first rejection (quota 20,000)
#9–#16  [429]  nine consecutive failures
#17–#20 [200]  ← window slides, recovers
```

<Warning>
  Both failure modes return the **identical** message (`upstream load saturated`), so the response
  gives you no way to tell which limit you hit. You have to budget for them — which is what the
  table below is for, at design time.
</Warning>

### How many searches per minute

Using the measured `≈26.9 tokens/document`:

| Candidates per query | Tokens per call | Theoretical ceiling at TPM 20,000 |
| -------------------- | --------------- | --------------------------------- |
| 50                   | 673             | \~29 / min                        |
| 100                  | 1,325           | **\~15 / min**                    |
| 200                  | 2,629           | \~7 / min                         |

**Candidate count is a capacity decision as much as a quality one**: doubling candidates buys limited quality but halves throughput.

It also explains why a single request can't carry too many candidates — 1000 candidates is 26,867 tokens, **134% of the entire minute's budget in one call**, so it is guaranteed to 429. At 2000 it's 269%.

<Tip>
  **Integration checklist**: cap concurrency at 4; implement exponential backoff; check peak QPS
  against the table above; cache frequent queries (next section) to skip the quota entirely.
</Tip>

<Info>
  **Quota expansion is in progress.** The TPM 20,000 above is the upstream's initial allocation, and
  APIYI has already applied to have it raised. If your workload exceeds what the table allows,
  **contact APIYI support to have the upstream quota reviewed** rather than scaling your design down
  to fit the current number.
</Info>

### Caching

**Repeating an identical request 10 times is bit-identical** (zero drift). Drift of \~3.7e-4 appears only when the candidate **order** is shuffled (bf16 batching jitter), and ordering is unaffected.

So results are **safe to cache**:

* Key on `normalised query + ordered hash of document contents`
* **Do not use `relevance_score` itself as an idempotency or dedupe key** — change the candidate order and its last digits move
* Repeated queries (FAQs, popular searches) usually cache well, saving both latency and upstream pressure

## 8. Integrating with existing frameworks

Parameter names match Cohere Rerank v1 (`query` / `documents` / `top_n` / `return_documents`), but **`documents` only accepts a string array** — `[{"text": "..."}]` returns 400 — and the response has no `id` / `meta` fields.

<Warning>
  **The `cohere` SDK v2 does not work as-is**: it targets `/v2/rerank`, and that path returns the
  website's HTML homepage with HTTP 200, so the SDK throws a parse error. Wrapping the HTTP call
  yourself is simplest.
</Warning>

<CodeGroup>
  ```python LangChain theme={null}
  from typing import Sequence
  import os, requests
  from langchain_core.documents import Document
  from langchain_core.callbacks import Callbacks
  from langchain.retrievers.document_compressors.base import BaseDocumentCompressor


  class ApiyiRerank(BaseDocumentCompressor):
      model: str = "bge-reranker-v2-m3"
      top_n: int = 5
      base_url: str = "https://api.apiyi.com/v1"

      def compress_documents(self, documents: Sequence[Document], query: str,
                             callbacks: Callbacks = None) -> Sequence[Document]:
          docs = list(documents)
          if not docs:
              return []
          r = requests.post(
              f"{self.base_url}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": self.model, "query": query,
                    "documents": [d.page_content for d in docs], "top_n": self.top_n},
          )
          r.raise_for_status()
          out = []
          for item in r.json()["results"]:
              d = docs[item["index"]]                    # map back by index, keeping metadata
              d.metadata["relevance_score"] = item["relevance_score"]
              out.append(d)
          return out
  ```

  ```python LlamaIndex theme={null}
  from typing import List, Optional
  import os, requests
  from llama_index.core.postprocessor.types import BaseNodePostprocessor
  from llama_index.core.schema import NodeWithScore, QueryBundle


  class ApiyiRerank(BaseNodePostprocessor):
      model: str = "bge-reranker-v2-m3"
      top_n: int = 5
      base_url: str = "https://api.apiyi.com/v1"

      def _postprocess_nodes(self, nodes: List[NodeWithScore],
                             query_bundle: Optional[QueryBundle] = None
                             ) -> List[NodeWithScore]:
          if not nodes or query_bundle is None:
              return nodes
          r = requests.post(
              f"{self.base_url}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": self.model, "query": query_bundle.query_str,
                    "documents": [n.node.get_content() for n in nodes],
                    "top_n": self.top_n},
          )
          r.raise_for_status()
          out = []
          for item in r.json()["results"]:
              n = nodes[item["index"]]
              n.score = item["relevance_score"]
              out.append(n)
          return out
  ```

  ```python Generic wrapper (with retry) theme={null}
  import os, time, requests

  BASE = "https://api.apiyi.com/v1"


  def rerank(query, documents, top_n=5, tries=4):
      """Rerank with backoff. A 429 means upstream congestion and usually clears on retry."""
      delay = 5
      for attempt in range(tries):
          r = requests.post(
              f"{BASE}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": "bge-reranker-v2-m3", "query": query,
                    "documents": documents, "top_n": top_n},
          )
          if r.status_code == 429 and attempt < tries - 1:
              time.sleep(delay)
              delay *= 2
              continue
          r.raise_for_status()
          return r.json()["results"]
  ```
</CodeGroup>

**For Dify / RAGFlow / FastGPT**: under Model Provider → Rerank Model, pick a custom provider compatible with the Cohere/Jina interface and fill in:

| Setting    | Value                                |
| ---------- | ------------------------------------ |
| API Base   | `https://api.apiyi.com/v1`           |
| API Key    | Your APIYI token (starts with `sk-`) |
| Model name | `bge-reranker-v2-m3`                 |

<Warning>
  **The path must include `/v1`.** Both `/rerank` and `/v2/rerank` return **HTTP 200 with the
  website's HTML homepage** rather than a JSON 404 — which surfaces in platforms as "unparseable
  response" or "model unavailable" and is hard to diagnose. Check that the final request URL is
  `https://api.apiyi.com/v1/rerank` before suspecting anything else.

  If the platform appends `/v1` itself (building `{base}/v1/rerank`), set the API Base to
  `https://api.apiyi.com` so you don't end up with a doubled `/v1`. A single `curl` confirms the path fastest.
</Warning>

## 9. Pre-launch checklist

<AccordionGroup>
  <Accordion title="Correctness">
    * [ ] Mapping back via `results[].index`, not by matching text
    * [ ] Long documents chunked (200–500 chars) and aggregated by best chunk score
    * [ ] No single query-document pair exceeds 8192 tokens
    * [ ] Queries with negation or exclusion have an LLM verification pass
  </Accordion>

  <Accordion title="Reliability">
    * [ ] Candidate sets capped at 100
    * [ ] **Concurrency capped at 4** (measured: upstream allows \~4–5 in-flight requests, excess is rejected outright rather than queued)
    * [ ] **Peak throughput checked against TPM 20,000** (\~15 searches/min at 100 candidates) and confirmed sufficient
    * [ ] Backoff-retry implemented for 429 (upstream congestion is transient)
    * [ ] Timeout set to 60 s or more (100 short documents is \~4.3 s at P95, but long documents or large sets reach tens of seconds)
    * [ ] Request path confirmed as `/v1/rerank` — a wrong path returns 200 + HTML, not 404
    * [ ] Model name spelled correctly and lowercase — a typo returns 503, easily mistaken for an outage
  </Accordion>

  <Accordion title="Quality">
    * [ ] Filtering uses Top-N or a relative threshold, not a guessed fixed value
    * [ ] Multilingual and cross-lingual score magnitudes verified so low scores don't get filtered out
    * [ ] A small labelled query set A/B tested (rerank on vs off) to confirm the metrics actually moved
  </Accordion>

  <Accordion title="Cost and caching">
    * [ ] Aware that `usage.input_tokens` / `output_tokens` are always 0 — read `prompt_tokens` / `total_tokens`
    * [ ] Aware that neither `top_n` nor `return_documents` reduces usage — every candidate is scored
    * [ ] Cost accounting based on the console invoice (`prompt_tokens` and `total_tokens` differ by \~45% at 100 candidates, and this round could not confirm which one is charged)
    * [ ] Result caching in place for high-frequency queries
  </Accordion>
</AccordionGroup>

## Related documentation

* [bge-reranker-v2-m3 overview](/en/api-capabilities/rerank/overview)
* [Rerank API playground](/en/api-capabilities/rerank/rerank-api)
* [Text embeddings](/en/api-capabilities/text-embedding)
