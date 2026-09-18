> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Embedding Tuning in Practice

> How to actually get value from embeddings: measured comparison of bge-m3 against three OpenAI models, how big to chunk, how to set similarity thresholds, how much batching and concurrency to use, how cost really works, and the LangChain default that silently drops recall from 80% to 15%.

[Text Embedding](/en/api-capabilities/text-embedding) covers how to call the API. This page covers **how to use it correctly**.

Almost no embedding problem shows up as a failed call. The endpoint returns 200, the dimensions are right,
and retrieval quality quietly collapses. Every recommendation below maps to measurements taken on the
APIYI gateway on 2026-08-25 (UTC+8) — not generic advice.

<Note>
  **Method**: 20 Chinese documents about LLM gateway integration plus 20 matching English documents,
  20 Chinese and 20 English queries with hand-labelled answers, all three models run against the same
  corpus in the same time window. The corpus is small, so **differences under 5 percentage points are not
  conclusive** — reproduce on your own data before treating any of it as final.
</Note>

## 1. Pick the right model first

|                              | `bge-m3`             | `text-embedding-3-small` | `text-embedding-3-large` |
| ---------------------------- | -------------------- | ------------------------ | ------------------------ |
| Price                        | **\$0.01/1M tokens** | \$0.02/1M tokens         | \$0.13/1M tokens         |
| Dimensions                   | **1024**             | 1536                     | 3072                     |
| Max length                   | 8192 tokens          | 8191 tokens              | 8191 tokens              |
| Pre-normalized               | Yes                  | Yes                      | Yes                      |
| `dimensions` parameter       | ❌ explicit 400       | ✅                        | ✅                        |
| Chinese Recall\@1            | 80%                  | 80%                      | 85%                      |
| English Recall\@1            | 70%                  | 80%                      | 85%                      |
| Mixed zh+en corpus Recall\@1 | 65%                  | 80%                      | 85%                      |
| Chinese token density        | **2.1 chars/token**  | 0.9 chars/token          | 0.9 chars/token          |

<CardGroup cols={2}>
  <Card title="Choose bge-m3 when" icon="check">
    * Your corpus is **mostly Chinese** (or Japanese / Russian): retrieval quality matches 3-small, the list
      price is half, and the same text takes only 42% of the tokens — **about 1/5 the actual spend**
    * You want smaller storage: 1024 dims is 33% below 1536 and 66% below 3072
    * You need coverage of long-tail languages (100+ supported)
    * You want to run the same open-source model locally so offline and online vectors match
  </Card>

  <Card title="Choose OpenAI when" icon="check">
    * Your corpus is **mostly English or code**: quality is a tier higher. bge-m3 does burn 15%–50% more tokens
      on this kind of content, but half the unit price still makes it cheaper overall — so **decide on quality
      here, not on price**
    * Your knowledge base **mixes languages** and you only want one answer back
    * You need `dimensions` to shrink storage
    * You already have thresholds calibrated against OpenAI score ranges and do not want to redo them
  </Card>
</CardGroup>

<Warning>
  **A mixed-language corpus is bge-m3's weak spot** (Recall\@1 65%). Not because cross-lingual retrieval is
  poor — the opposite. It scores the Chinese and English versions of the same fact almost identically
  (measured 0.75–0.87, versus 0.56–0.69 for OpenAI), so a Chinese query often ranks the English copy above
  the Chinese one.

  **If your RAG returns a single answer**, split the index by language or add a language filter at query time.
  **If you need to gather material across languages**, this is a feature rather than a bug.
</Warning>

## 2. Always chunk long documents

`bge-m3` has an 8192-token window, so a long manual fits in a single call. **That does not make it a good idea.**

Measured: 20 sections concatenated into one long manual, with 20 short documents (each corresponding to one
section) added as strong distractors, queried by 20 questions —

| Approach                     | Result                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Whole document as one vector | The manual ranks first **10%** of the time                                           |
| Chunked by section           | Top1 lands inside the manual **75%** of the time; hits the *correct* section **65%** |

For the same question, the correct section scores on average **+0.10** above the whole document:

| Question                             | Whole doc | Correct section | Delta      |
| ------------------------------------ | --------- | --------------- | ---------- |
| How is RMB converted to USD          | 0.487     | 0.684           | **+0.198** |
| How do I guarantee valid JSON output | 0.487     | 0.650           | **+0.163** |
| Getting a 401, what should I do      | 0.485     | 0.612           | +0.127     |

A long document's single vector is the **average** of everything in it, so any precisely-worded short
passage beats it.

<Tip>
  **Chunking guidance**

  * Split on semantic boundaries at **200–500 tokens**, with 10%–15% overlap
  * Chinese runs about 2.1 characters per token, so 200–500 tokens is roughly **420–1050 Chinese characters**
  * **Do not shred into tiny chunks**: every input carries 2 fixed special tokens — 0.4% overhead on a
    500-token chunk, but 12.5% pure waste on a 16-token one
  * Prepending the section heading to each chunk noticeably improves how identifiable the chunk is
</Tip>

## 3. Thresholds must be recalibrated per model

This is where a migration from OpenAI to `bge-m3` most often goes wrong. **The two score ranges are completely different.**

The same hand-labelled pairs, scored by all three models:

| Relationship                                                                       | `bge-m3`  | `3-small` | `3-large` |
| ---------------------------------------------------------------------------------- | --------- | --------- | --------- |
| Unrelated ("how to enable streaming" ↔ "weather in Beijing today")                 | **0.417** | 0.094     | 0.108     |
| Paraphrase ("got a 429" ↔ "the API says rate limited")                             | 0.552     | 0.420     | 0.360     |
| Cross-lingual paraphrase                                                           | 0.753     | 0.557     | 0.681     |
| Subject/object swapped ("user sends model an image" ↔ "model sends user an image") | 0.975     | 0.908     | 0.895     |

<Warning>
  `bge-m3`'s **floor sits at 0.42**; OpenAI's sits at 0.09.
  Copying a rule like "drop anything below 0.3" means no filtering at all on `bge-m3`;
  copying "only 0.8 and above counts as relevant" throws away almost every correct result.
</Warning>

Best single thresholds measured for `bge-m3`:

| Scenario                         | Suggested starting threshold | Accuracy at that threshold |
| -------------------------------- | ---------------------------- | -------------------------- |
| Chinese corpus / Chinese queries | **0.53**                     | 75%                        |
| English corpus / English queries | 0.51                         | 80%                        |
| Cross-lingual retrieval          | 0.53–0.55                    | 75%–82%                    |
| Mixed-language corpus            | 0.62                         | 68%                        |

For comparison, the best Chinese-scenario threshold is **0.45** for `text-embedding-3-small` and **0.33** for `3-large`.

<Tip>
  **In practice**: start at **0.50**, treat **0.45–0.60** as a grey zone needing confirmation, and recalibrate
  against 50–100 labelled samples from your own corpus before going live.
</Tip>

## 4. Similarity cannot tell you whether something is *correct*

This holds for **every** embedding model — it is not a flaw in any one of them, but you need to know it upfront:

| Pair                                                                             | `bge-m3` | `3-small` | `3-large` |
| -------------------------------------------------------------------------------- | -------- | --------- | --------- |
| "supports function calling" ↔ "does **not** support function calling"            | 0.891    | 0.851     | 0.805     |
| "\$**2** per million tokens" ↔ "\$**20** per million tokens"                     | 0.965    | 0.954     | 0.902     |
| "point base\_url at api.**apiyi**.com" ↔ "point base\_url at api.**openai**.com" | 0.873    | 0.878     | 0.738     |
| "user sends the model an image" ↔ "model sends the user an image"                | 0.975    | 0.908     | 0.895     |

All three fail. **Cosine similarity measures whether two texts are about the same thing, not whether they agree.**

Negation, prices, version numbers and entity names cannot be separated at the retrieval stage. The correct
fallback is:

<Steps>
  <Step title="Vector recall, Top 50–100">
    Use `bge-m3` to narrow the field fast. The threshold only filters out the obviously unrelated.
  </Step>

  <Step title="Rerank down to Top 3–5">
    Send the candidates to [`bge-reranker-v2-m3`](/en/api-capabilities/rerank/overview). It is a cross-encoder
    that runs the query and document through the model together, which is **exactly the right tool for these
    fine distinctions** — and it comes from the same model family as `bge-m3`.
  </Step>

  <Step title="Let the LLM judge at generation time">
    Pass the Top 3–5 along with the original question, and state explicitly in the prompt that the model should
    say it found nothing when the retrieved content does not match the question.
  </Step>
</Steps>

## 5. Batch size and concurrency

### Batching: the knee is at 64–128

| Batch   | Wall time | Per item |
| ------- | --------- | -------- |
| 16      | 1.67s     | 105ms    |
| 64      | 5.04s     | 79ms     |
| **128** | 7.45s     | **58ms** |
| 256     | 14.6s     | 57ms     |
| 1024    | 54.4s     | 53ms     |

Past 128 the per-item cost barely improves (58ms → 53ms) while a single request grows 7×.
Request duration directly drives client timeout risk and how much work one failure throws away.

### Concurrency: 8 online, 32–48 for bulk indexing

| Concurrency      | Success rate | Total throughput | Slowest request |
| ---------------- | ------------ | ---------------- | --------------- |
| 8 (200 requests) | **100%**     | 55 items/s       | 5.6s            |
| 48               | 99.3%        | **133 items/s**  | 10.2s           |
| 96               | **88.2%**    | 65 items/s       | 59.8s           |

* **Use concurrency 8 for live retrieval**: 200 requests with zero failures
* **Bulk indexing can go to 32–48**: highest throughput, but 429s start appearing, so exponential backoff is required
* **Do not exceed 64**: at 96 the failure rate is 11.8% and requests start hanging for \~60 seconds

<Warning>
  **Your client must retry.** Even at low concurrency roughly 0.8% of requests hit a dropped connection
  (`Connection aborted / Remote end closed connection`). One retry clears it; no retry means a gap in your index.

  Set the client timeout to **60–90 seconds** for bulk indexing rather than several hundred — a hung request
  is harder to deal with than a failed one.
</Warning>

```python theme={null}
import time
from openai import OpenAI

client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1", timeout=90.0)

def embed_batch(texts, model="bge-m3", retries=3):
    """Batch embedding with backoff. Keep batches between 64 and 128."""
    for attempt in range(retries):
        try:
            resp = client.embeddings.create(model=model, input=texts)
            return [d.embedding for d in sorted(resp.data, key=lambda x: x.index)]
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)          # 1s, 2s, 4s
```

## 6. How cost actually works

Cost is the product of two things: **unit price** and **how many tokens a given piece of text becomes**.
Both differ here.

`bge-m3` is **\$0.01 / 1M tokens** against **\$0.02** for `text-embedding-3-small` — half the unit price
before anything else. On top of that comes tokenizer efficiency: `bge-m3` uses XLM-R SentencePiece and gets
about **2.1 Chinese characters per token**, while OpenAI's cl100k manages about **0.9**:

| Corpus                             | `bge-m3` tokens | OpenAI tokens | Token ratio | **Real spend** |
| ---------------------------------- | --------------- | ------------- | ----------- | -------------- |
| Chinese technical doc (492 chars)  | **231**         | 552           | 0.42×       | **0.21×**      |
| Japanese (456 chars)               | **231**         | 480           | 0.48×       | **0.24×**      |
| Russian (810 chars)                | **213**         | 411           | 0.52×       | **0.26×**      |
| Mixed zh+en (760 chars)            | 413             | 360           | 1.15×       | 0.57×          |
| English technical doc (1053 chars) | 210             | 182           | 1.15×       | 0.58×          |
| Code snippet (1200 chars)          | 453             | 300           | 1.51×       | 0.76×          |

**Chinese corpora cost roughly one fifth of `text-embedding-3-small`.**
English and code consume more tokens on `bge-m3`, but half the unit price still lands it below OpenAI on
total spend — so for those two corpora the decision rests on **retrieval quality (English Recall\@1 70% vs
80%), not on price**.

Storage differs too. Vectors are already L2-normalized and the returned values are fp16 precision, so
**storing `bge-m3` vectors as float16 costs nothing in accuracy**:

| Layout                                  | Per vector | 1M vectors |
| --------------------------------------- | ---------- | ---------- |
| `bge-m3` 1024-d float16                 | **2 KB**   | **2 GB**   |
| `bge-m3` 1024-d float32                 | 4 KB       | 4 GB       |
| `text-embedding-3-small` 1536-d float32 | 6 KB       | 6 GB       |
| `text-embedding-3-large` 3072-d float32 | 12 KB      | 12 GB      |

<Tip>
  Vectors come back normalized (measured L2 norms 0.99992–1.00029), so **the dot product already is cosine
  similarity**. `IP` and `COSINE` index types give identical results in your vector database, and `IP` saves
  one normalization pass.
</Tip>

## 7. Failure modes that stay silent

### 7.1 LangChain's default drops recall from 80％ to 15％

<Warning>
  `langchain_openai.OpenAIEmbeddings` defaults to `check_embedding_ctx_length=True`, which **encodes your text
  into tiktoken token ids first** and sends an array of integers to `/v1/embeddings`.

  That is fine against OpenAI models, whose tokenizer *is* tiktoken. `bge-m3` uses the XLM-R tokenizer, and the
  two id spaces have nothing in common.

  **The call still returns 200, the vector is still 1024-dimensional, `usage` still looks normal — only
  retrieval quality quietly collapses.**
</Warning>

Measured cost:

| Check                                                                      | Result        |
| -------------------------------------------------------------------------- | ------------- |
| Similarity between the same sentence sent as text vs as tiktoken token ids | **0.282**     |
| Chinese corpus Recall\@1                                                   | **80% → 15%** |

The fix:

```python theme={null}
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="bge-m3",
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    check_embedding_ctx_length=False,   # required, otherwise tiktoken ids go out instead of text
    chunk_size=64,
)
```

The same risk applies to **any wrapper that tokenizes client-side before sending**. When wiring up a
third-party embedding model, confirm whether your SDK sends raw text or token ids.

### 7.2 An empty string is accepted as valid input

`input: ""` returns **200** on `bge-m3` (OpenAI returns 400 here), producing a 1024-dimensional vector and
billing 2 tokens.

A chunking script that does not filter empty chunks will seed your index with meaningless vectors that
surface at random during retrieval. **Filter blank text before indexing.**

### 7.3 The `dimensions` parameter is rejected

```json theme={null}
{ "model": "bge-m3", "input": "...", "dimensions": 512 }
```

Returns 400: `Model "bge-m3" does not support matryoshka representation, changing output dimensions will lead to poor results.`

`bge-m3` was not trained with Matryoshka representation, so **truncating the vector measurably hurts quality**.
Use float16 to shrink storage instead of cutting dimensions yourself.

### 7.4 The model name is case-sensitive with no aliases

Only `bge-m3` works. `BAAI/bge-m3` and `BGE-M3` both return 503 "no available channels".

### 7.5 8192 is a per-input limit

A single input above 8192 tokens returns 400 and is **never silently truncated** — which is the safer
behaviour: you will not receive a normal-looking vector that quietly lost the second half of your text.

The limit applies **per item, not per request**: a single call carrying **1024 items / 102560 tokens** returned
normally in testing. If any one item exceeds the limit the whole request fails, and the token count in the
error refers to **that item**, not the total.

## 8. A minimal implementation you can copy

```python theme={null}
"""Minimal working bge-m3 indexing + retrieval."""
import time
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    timeout=90.0,
)

MODEL = "bge-m3"
BATCH = 96          # keep between 64 and 128
THRESHOLD = 0.50    # starting point; recalibrate on your own samples before launch


def embed(texts, retries=3):
    """Batch embedding with backoff. Returns float16 vectors."""
    texts = [t.strip() for t in texts if t and t.strip()]   # drop blanks, see 7.2
    out = []
    for i in range(0, len(texts), BATCH):
        chunk = texts[i:i + BATCH]
        for attempt in range(retries):
            try:
                resp = client.embeddings.create(model=MODEL, input=chunk)
                out += [d.embedding for d in sorted(resp.data, key=lambda x: x.index)]
                break
            except Exception:
                if attempt == retries - 1:
                    raise
                time.sleep(2 ** attempt)
    # already normalized, so float16 storage is lossless here, see section 6
    return np.array(out, dtype=np.float16)


def search(query, doc_vectors, docs, top_k=50):
    """Vectors are normalized, so the dot product is cosine similarity."""
    qv = embed([query])[0].astype(np.float32)
    scores = doc_vectors.astype(np.float32) @ qv
    order = np.argsort(-scores)[:top_k]
    return [(docs[i], float(scores[i])) for i in order if scores[i] >= THRESHOLD]


if __name__ == "__main__":
    docs = ["...your chunks, 200-500 tokens each..."]
    dv = embed(docs)
    for text, score in search("your question", dv, docs):
        print(f"{score:.4f}  {text[:60]}")
    # In production, hand this Top 50 to bge-reranker-v2-m3, see section 4
```

## Related documentation

<CardGroup cols={2}>
  <Card title="Text Embedding API" icon="vector-square" href="/en/api-capabilities/text-embedding">
    Parameters, response format, quick start
  </Card>

  <Card title="Rerank" icon="list-ordered" href="/en/api-capabilities/rerank/overview">
    `bge-reranker-v2-m3`, the right tool for the precision stage
  </Card>

  <Card title="RAG Tuning" icon="sliders-horizontal" href="/en/api-capabilities/rerank/rag-best-practices">
    Two-stage retrieval, how many candidates to recall
  </Card>

  <Card title="Model Pricing" icon="tags" href="/en/models">
    Live pricing for every embedding model
  </Card>
</CardGroup>
