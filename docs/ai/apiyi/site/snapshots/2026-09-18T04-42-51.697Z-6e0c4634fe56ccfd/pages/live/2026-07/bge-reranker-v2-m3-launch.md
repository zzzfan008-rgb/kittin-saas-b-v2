> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# bge-reranker-v2-m3 上线：RAG 检索加一层精排

> 智源开源的多语言重排序模型 bge-reranker-v2-m3 上线 API易，标准 /v1/rerank 端点，0.01 美元每 1M tokens 只按输入计费。实测同一批候选仅更换排序方法，nDCG@3 从 0.53 提升到 1.00，中英日韩俄法阿七语种及跨语言排序均正确。

**2026/7/30 22:52 (UTC+8)** · 新模型 · BAAI

🚀 **重排序模型 `bge-reranker-v2-m3` 上线，标准 `/v1/rerank` 端点即用**

智源开源的多语言重排序模型上架，`default` / `svip` 分组可用，\$0.01 每 1M tokens、只按输入计费。它不产生向量、不能建索引，作用是**接在向量召回后面做精排**——实测同一批 10 篇候选只换排序方法，nDCG\@3 从 0.53 升到 1.00，把"同主题但不回答问题"的干扰项挤了下去；中英日韩俄法阿七语种及中英跨语言排序均实测正确。

推荐用法：向量或 BM25 召回 50–100 条 → 精排出 Top-3 至 Top-5 → 送进大模型。三个坑要避开：`relevance_score` 不是跨 query 可比的置信度（别设固定阈值）、否定语义是明确弱项、长文档需切成 200–500 字的块再送。

上游 TPM 配额扩容申请中，大批量需求可联系 API易客服评估。完整实测数据与调参方法见 [重排序模型概览](/api-capabilities/rerank/overview) 与 [RAG 实战调优](/api-capabilities/rerank/rag-best-practices)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
