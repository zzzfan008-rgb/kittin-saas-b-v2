> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# bge-reranker-v2-m3 is live: a precision layer for RAG retrieval

> BAAI's open-source multilingual reranker bge-reranker-v2-m3 is now on APIYI via the standard /v1/rerank endpoint at 0.01 USD per 1M input tokens. In testing, swapping only the ranking method on the same candidate set lifted nDCG@3 from 0.53 to 1.00, with correct ordering across seven languages and cross-lingual queries.

**2026/7/30 22:52 (UTC+8)** · New Model · BAAI

🚀 **The reranking model `bge-reranker-v2-m3` is live on the standard `/v1/rerank` endpoint**

BAAI's open-source multilingual reranker is now available in the `default` and `svip` groups at \$0.01 per 1M tokens, billed on input only. It produces no embeddings and cannot be indexed — its job is to **sit behind vector recall and re-sort what came back**. In testing on the same 10 candidates, changing nothing but the ranking method lifted nDCG\@3 from 0.53 to 1.00, pushing out the distractors that share a topic but never answer the question. Ordering was correct across Chinese, English, Japanese, Korean, Russian, French and Arabic, plus cross-lingual queries.

Recommended shape: recall 50–100 candidates with vectors or BM25 → rerank down to the top 3–5 → feed the LLM. Three pitfalls to avoid: `relevance_score` is not a confidence value comparable across queries (don't set a fixed threshold), negation is a clear weakness, and long documents need chunking to 200–500 characters first.

An upstream TPM quota increase is being applied for; contact APIYI support to review higher volumes. Full measurements and tuning guidance are in the [rerank overview](/en/api-capabilities/rerank/overview) and [RAG tuning in practice](/en/api-capabilities/rerank/rag-best-practices).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
