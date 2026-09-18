> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# bge-m3 重新上线，配套实测调优文档

> 开源多语言向量模型 bge-m3 重新上线，1024 维、8192 上下文、100+ 语种，定价 $0.01/1M tokens，是 text-embedding-3-small 的一半。实测中文检索质量同档、tokens 只用约 42%，实际花费约 1/5，同时发布一份向量检索实战调优文档。

**2026/8/25 18:45 (UTC+8)** · 新模型

🚀 **`bge-m3` 重新上线，同步配套一份实测调优文档**

智源研究院开源的多语言向量模型，1024 维、8192 token 上下文、覆盖 100+ 语种，走标准 `/v1/embeddings` 端点，定价 \$0.01 / 1M tokens，是 `text-embedding-3-small` 的一半。上线前我们做了一轮完整实测：中文检索质量与后者同档，中文分词效率还高一倍多（约 2.1 字/token），单价与 token 数两项叠加后，**同一批中文语料的实际花费约为 1/5**。

有两个坑建议接入前先看一眼：它的相似度分数带比 OpenAI 整体高约 0.13，**从 OpenAI 迁过来的阈值必须重新标定**；用 LangChain 接入时务必设 `check_embedding_ctx_length=False`，否则默认发出去的是 tiktoken 的 token id，接口照样返回 200，中文召回率实测会从 80% 掉到 15%。

选型对照、切块粒度、阈值标定、批量与并发建议，都写进了新页：[向量检索实战调优](/api-capabilities/embedding-best-practices)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
