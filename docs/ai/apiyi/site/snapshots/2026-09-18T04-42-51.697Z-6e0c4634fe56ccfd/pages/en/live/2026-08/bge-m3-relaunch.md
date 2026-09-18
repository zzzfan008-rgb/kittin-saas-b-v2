> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# bge-m3 is back, with a measured tuning guide

> The open-source multilingual embedding model bge-m3 is back: 1024 dims, 8192 context, 100+ languages, priced at $0.01/1M tokens, half of text-embedding-3-small. Measured Chinese retrieval matches it while using only 42% of the tokens, landing at about one fifth the spend, and a new tuning guide ships alongside.

**2026/8/25 18:45 (UTC+8)** · New Model

🚀 **`bge-m3` is back, with a measured tuning guide alongside it**

BAAI's open-source multilingual embedding model: 1024 dimensions, 8192-token context, 100+ languages, served on the standard `/v1/embeddings` endpoint and priced at \$0.01 / 1M tokens — half of `text-embedding-3-small`. We ran a full measurement pass before relaunching it: Chinese retrieval quality is in the same tier, and Chinese tokenizes more than twice as efficiently (about 2.1 characters per token). Half the unit price on 42% of the tokens puts **the same Chinese corpus at roughly one fifth the spend**.

Two traps are worth reading before you wire it up: its similarity scores sit roughly 0.13 higher than OpenAI's across the board, so **any threshold carried over from OpenAI has to be recalibrated**; and with LangChain you must set `check_embedding_ctx_length=False`, otherwise it sends tiktoken token ids instead of text — the call still returns 200 while measured Chinese Recall\@1 drops from 80% to 15%.

Model comparison, chunk sizing, threshold calibration, batching and concurrency guidance are all in the new page: [Embedding Tuning in Practice](/en/api-capabilities/embedding-best-practices)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
