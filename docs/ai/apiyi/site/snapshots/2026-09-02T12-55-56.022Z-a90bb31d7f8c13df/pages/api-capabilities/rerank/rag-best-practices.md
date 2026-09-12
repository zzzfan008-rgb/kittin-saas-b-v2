> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# RAG 实战调优

> 怎么用好 bge-reranker-v2-m3：两段式检索架构、召回条数怎么定、长文档怎么切块、relevance_score 阈值怎么设、否定语义怎么兜底，以及 LangChain / LlamaIndex / Dify 的接入代码。

[概览](/api-capabilities/rerank/overview) 讲了这个模型是什么。这一页讲**怎么把它用对**。

所有建议都对应 API易 2026 年 7 月 30 日 (UTC+8) 的实测数据，不是通用套话。

## 一、先把架构摆对：两段式检索

重排序不是独立的检索方案，它是检索管线的第二级。

<Steps>
  <Step title="召回（Recall）">
    用**向量检索**或 **BM25** 从全量文档里捞出候选集。这一步要**快**、要**宁滥勿缺**，
    目标是"正确答案在这批里"，而不是"正确答案排第一"。
  </Step>

  <Step title="精排（Rerank）">
    把候选集连同 query 一起送进 `bge-reranker-v2-m3`，逐条打分重排。
    这一步要**准**，目标是把正确答案顶到最前面。
  </Step>

  <Step title="截断并送进大模型">
    取重排后的 Top-3 到 Top-5 拼进 prompt。
    这一步决定了最终答案质量——**送进去的越准，大模型幻觉越少、上下文成本越低**。
  </Step>
</Steps>

<Info>
  **为什么不能跳过召回直接精排**：重排序是交叉编码器，必须拿到 query 才能算分，无法离线预计算。
  百万篇文档逐条打分，成本和延迟都不可接受。召回负责把规模从百万降到百，精排负责把百排准。
</Info>

### 完整可运行示例

下面这段代码就是一个最小但完整的两段式检索，向量召回用 `text-embedding-3-small`，
精排用 `bge-reranker-v2-m3`，两个模型同一个 API易 令牌：

```python theme={null}
import os
import numpy as np
import requests

BASE = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}


def embed(texts):
    """批量向量化。真实项目里文档向量应离线算好存进向量库。"""
    r = requests.post(f"{BASE}/embeddings", headers=HEADERS, timeout=60,
                      json={"model": "text-embedding-3-small", "input": texts})
    r.raise_for_status()
    data = sorted(r.json()["data"], key=lambda x: x["index"])
    return np.array([d["embedding"] for d in data])


def rerank(query, documents, top_n=5):
    """精排。documents 只接受字符串数组。"""
    r = requests.post(f"{BASE}/rerank", headers=HEADERS, timeout=120,
                      json={"model": "bge-reranker-v2-m3", "query": query,
                            "documents": documents, "top_n": top_n})
    r.raise_for_status()
    return r.json()["results"]


def search(query, corpus, recall_k=50, final_k=5):
    """corpus: [{'id':..., 'text':..., 'meta':...}, ...]"""
    # ---- 第一级：向量召回 ----
    doc_vecs = embed([c["text"] for c in corpus])          # 生产环境应来自向量库
    q_vec = embed([query])[0]
    doc_vecs /= np.linalg.norm(doc_vecs, axis=1, keepdims=True)
    q_vec /= np.linalg.norm(q_vec)
    recalled_idx = np.argsort(-(doc_vecs @ q_vec))[:recall_k]
    candidates = [corpus[i] for i in recalled_idx]

    # ---- 第二级：重排序精排 ----
    results = rerank(query, [c["text"] for c in candidates], top_n=final_k)

    # 关键：用 index 回填原始文档对象，保住 id 和 meta
    return [{**candidates[r["index"]], "score": r["relevance_score"]}
            for r in results]


corpus = [
    {"id": "kb-001", "text": "429 表示触发了速率限制。解决办法是降低并发、"
                             "在客户端实现指数退避重试，或联系服务商提升账号的 RPM 配额。"},
    {"id": "kb-002", "text": "HTTP 状态码 4xx 系列表示客户端错误，常见的有 400 参数错误、"
                             "401 未授权、403 禁止访问、404 资源不存在。"},
    {"id": "kb-003", "text": "要查询账户余额，请调用 /v1/dashboard/billing/subscription 接口。"},
]

for hit in search("API 请求一直返回 429 错误，怎么解决？", corpus, recall_k=3, final_k=2):
    print(f"{hit['score']:.4f}  [{hit['id']}]  {hit['text'][:40]}")
```

<Warning>
  **务必用 `index` 回填，不要用返回的文本去反查。**
  文档内容可能重复（实测两篇完全相同的文档得分逐位一致，无法区分），
  按文本反查会张冠李戴，丢掉 `id` 和元数据。
</Warning>

## 二、召回多少条送进精排？

实测延迟（短文档，每档 5 次取 P50）：

| 候选条数 | P50 延迟 | P95 延迟 |
| ---- | ------ | ------ |
| 1    | 2.00 s | 2.58 s |
| 10   | 2.35 s | 2.68 s |
| 25   | 2.52 s | 2.81 s |
| 50   | 2.92 s | 3.39 s |
| 100  | 3.80 s | 4.32 s |
| 500  | 约 15 s | —      |
| 1000 | 约 33 s | —      |
| 2000 | 约 68 s | —      |

关键在于**存在约 2 秒的固定开销**：只送 1 篇也要 2 秒。所以候选从 1 加到 100，延迟只多 1.8 秒，
而检索质量的提升远大于这 1.8 秒的代价。

**真正决定延迟的是 token 总量，不是文档条数。** 同样 50 条候选：

| 50 条候选         | 输入 tokens | P50 延迟  |
| -------------- | --------- | ------- |
| 短文档（约 20 字/条）  | 673       | 2.48 s  |
| 长文档（约 480 字/条） | 20,606    | 11.74 s |

条数相同、延迟差 4.7 倍。这也是下一节「切块」不会拖慢检索的原因——
切块只增加条数，不增加总 token 量。

<Tip>
  **推荐 `recall_k` = 50–100。**

  * 低于 20：召回列表本来就短，精排能挽回的漏排有限，浪费了这次调用的固定开销
  * 超过 200：延迟开始明显影响交互，而召回列表尾部极少含正确答案，边际收益趋近于零
  * **≥ 1000：必然 429**。1000 条候选 = 26,867 tokens，超过 TPM 20,000 的整分钟预算（134%），
    单个请求就注定失败，与重试无关
</Tip>

如果确实要排大量文档（比如离线批处理），**拆成多个 ≤100 条的请求**，并发控制在 4 以内。
注意拆分不会降低 token 总量，TPM 20,000 依然是总闸门——离线批处理要按分钟节流。
该配额正在扩容中，有大批量需求可先联系 API易客服确认可用额度。

## 三、长文档必须切块

这是收益最大的一步预处理。实测数据说明了两件事：

**其一，无关内容会稀释相关性。** 同一句命中内容，后面接不同长度的无关填充：

| 文档总长    | 命中句在开头 | 命中句在结尾 | 结尾/开头 |
| ------- | ------ | ------ | ----- |
| 528 字符  | 0.933  | 0.720  | 0.77  |
| 1028 字符 | 0.931  | 0.500  | 0.54  |
| 2028 字符 | 0.925  | 0.793  | 0.86  |
| 4028 字符 | 0.907  | 0.351  | 0.39  |
| 8028 字符 | 0.828  | 0.181  | 0.22  |

**其二，长文档会抬高噪声得分。** 同一篇不相关文档，短版得分 0.029，接上 450 字无关内容后
涨到 0.121——翻了 4 倍。长噪声文档更容易挤进 Top-N。

两者叠加的后果：**一篇把答案写在文末的长文档，会输给一篇通篇跑题的长文档。**

<Tip>
  **切块策略**

  1. 切成 **200–500 字**的块，块之间留 10–20% 重叠，避免答案正好被切断在边界
  2. 每个块**独立送进重排序**（它们只是 `documents` 数组里的不同元素）
  3. 用「该文档所有块的最高分」作为文档得分，再按文档去重
  4. 送给大模型时，可以只送命中的块，也可以回溯取整篇——取决于你的上下文预算
</Tip>

```python theme={null}
def chunk(text, size=400, overlap=60):
    step = size - overlap
    return [text[i:i + size] for i in range(0, max(len(text) - overlap, 1), step)]


def rerank_long_docs(query, docs, top_n=5):
    """docs: [{'id':..., 'text':...}]，按块打分后按文档聚合取最高分。"""
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
  **8192 tokens 是硬上限**，按「query + 单篇文档」这一对计算，超了直接返回 400
  （`This model's maximum context length is 8192 tokens`），**不会静默截断**。

  这个上限**不是**整个请求的总量——实测单请求 400 篇 × 1000 字符（合计 33 万 tokens）正常返回。
  所以切块既是为了质量，也是为了不撞这个 400。
</Warning>

## 四、阈值怎么定（别拍脑袋设 0.5）

`relevance_score` 经 sigmoid 映射到 0–1 区间，看起来很像一个置信度。**它不是。**

实测跨全部质量用例的得分分布：

| 分组                | 真正相关文档的得分区间        | 中位数   |
| ----------------- | ------------------ | ----- |
| 中文 query × 中文文档   | 0.289 – 1.000      | 0.948 |
| 非中文同语言（日/韩/俄/法/阿） | 0.005 – 0.998      | 0.241 |
| **跨语言（中↔英）**      | **0.0038 – 0.205** | 0.008 |
| 不相关的干扰项（中文）       | 最高冲到 **0.945**     | 0.029 |

一个 0.5 的固定阈值会：**滤掉全部跨语言正确结果**、滤掉多数非中文场景的第二名，
同时**放行**那篇关键词高度重合的干扰文档
（查询"苹果公司 2024 财年营业收入"，一篇讲苹果种植收购价的文档拿到了 0.945，排第三）。

注意最后一行：不相关文档的最高分（0.945）**高于**相关文档的最低分（0.289）。
两个分布是重叠的——这从根本上决定了**不存在一个"安全"的绝对阈值**。

<Tip>
  **三种可用的过滤策略，按推荐顺序：**

  1. **不过滤，直接取 Top-N**（N = 3\~5）。最简单，也最不容易出错。大模型对少量噪声有容忍度
  2. **相对阈值**：只保留 `score >= top1_score × α`，α 取 0.2–0.3。
     它自动适配了跨语言整体偏低的情况，也能砍掉长尾
  3. **绝对阈值**：只有在**你自己标注了一批样本、在自己的语料上量过分布之后**才可以用，
     而且必须按语言、按查询类型分别定。不要跨场景复用别人的阈值
</Tip>

```python theme={null}
def filter_by_relative_threshold(results, alpha=0.25, max_n=5):
    if not results:
        return []
    top = results[0]["relevance_score"]
    return [r for r in results if r["relevance_score"] >= top * alpha][:max_n]
```

## 五、否定语义要额外兜底

这是模型的明确弱项。查询"哪些景点适合冬天去？"，两篇**明确说不适合冬天**的文档排到了第 2、第 3，
把真正相关的挤到第 4、第 5，nDCG\@3 只有 0.47。

模型匹配的是"冬天 + 景点 + 旅游"这个话题，**没有理解那个"不"字**。

<Warning>
  凡是包含**否定、排除、条件限定**的查询——"不含麸质的食谱"、"除了北京以外的分公司"、
  "未成年人不适用的条款"、"哪些区域**不**支持配送"——重排序的 Top-N **不能直接交给用户**。
</Warning>

**兜底做法**：重排序后加一道轻量大模型判断。用便宜的小模型即可，成本可控：

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"],
                base_url="https://api.apiyi.com/v1")

NEG_HINT = ("不", "别", "除了", "无需", "禁止", "except", "not ", "without")


def verify_if_negated(query, hits):
    """query 含否定语义时，逐条让小模型确认是否真的满足条件。"""
    if not any(k in query for k in NEG_HINT):
        return hits
    kept = []
    for h in hits:
        resp = client.chat.completions.create(
            model="gemini-3.5-flash-lite",
            messages=[{"role": "user", "content":
                       f"问题：{query}\n文档：{h['text']}\n"
                       f"这份文档是否**正面满足**问题的条件？只回答 是 或 否。"}],
            max_tokens=4,
        )
        if "是" in resp.choices[0].message.content:
            kept.append(h)
    return kept
```

## 六、多语言与跨语言

实测中 / 英 / 日 / 韩 / 俄 / 法 / 阿拉伯语，以及中↔英跨语言检索，**排序全部正确**。
单一模型就能覆盖多语言知识库，不需要按语言分别部署。

但要注意**分数量级差异**：

| 场景                  | Top-1 得分（实测） |
| ------------------- | ------------ |
| 中文 query × 中文文档     | 0.97         |
| 韩文 query × 韩文文档     | 0.87         |
| 阿拉伯文 query × 阿拉伯文文档 | 1.00         |
| **中文 query × 英文文档** | **0.20**     |
| **英文 query × 中文文档** | **0.011**    |

跨语言场景下正确答案的绝对分低 1–2 个数量级，但**排序依然正确**。

<Tip>
  多语言库的两条建议：

  * **优先用排序，不用分数**。跨语言时相对阈值（策略 2）比绝对阈值可靠得多
  * 若必须用绝对阈值，**按「query 语言 × 文档语言」组合分别标定**，不要一个阈值走天下
</Tip>

## 七、并发、缓存与幂等

### 先算配额预算，再谈并发

上游（华为云 MaaS）给本模型的配额是 **TPM 20,000 / RPM 120**。
这是接入这个模型时最容易低估的约束——同平台 BGE-M3 向量化模型是 1,200,000 TPM，**差 60 倍**。

实测（每组前静默 70 秒让配额窗口归零）分离出两个**互相独立**的机制：

| 用例 | 场景                            | 成功率       | token 占 TPM | 说明             |
| -- | ----------------------------- | --------- | ----------- | -------------- |
| R1 | 并发 10 × 10 请求（极小）             | 4/10      | 4%          | token 可忽略仍失败   |
| R2 | 并发 20 × 20 请求（极小）             | 5/20      | 3%          | 并发翻倍，成功数仍是 4–5 |
| R4 | **完全串行** 20 请求（1.3K tokens/个） | 11/20     | 97%         | **零并发也 429**   |
| R5 | **完全串行** 20 个极小请求             | **20/20** | 0%          | 串行不受影响         |

**结论一：并发槽位约 4–5 个在途请求。** R1/R2 的 token 消耗只占 3–4% TPM 却大面积失败，
且并发从 10 提到 20 后成功数仍停在 4–5；而 R5 串行 20 次全过。超出槽位的请求**直接 429、不排队**。

**结论二：TPM 20,000 独立生效，与并发无关。** R4 完全串行，第 8 个请求在累计 16,093 tokens 时
开始 429，连挂 9 个后窗口滑动恢复：

```
#1–#7   [200]  累计 tokens 递增到 16,093
#8      [429]  ← 首次拒绝（配额 20,000）
#9–#16  [429]  连续 9 个被拒
#17–#20 [200]  ← 窗口滑动，恢复
```

<Warning>
  两种失败的错误信息**完全一样**（`当前分组上游负载已饱和`），无法从响应区分撞的是槽位还是 TPM。
  只能自己按预算推算，所以下面这张表要在设计阶段就用上。
</Warning>

### 每分钟能跑多少次检索

按实测 `≈26.9 tokens/文档` 折算：

| 每次查询的候选数 | 单次 tokens | TPM 20,000 下的理论上限 |
| -------- | --------- | ----------------- |
| 50 条     | 673       | 约 29 次/分钟         |
| 100 条    | 1,325     | **约 15 次/分钟**     |
| 200 条    | 2,629     | 约 7 次/分钟          |

**候选数的选择同时是质量决策和容量决策**：候选翻倍，检索质量提升有限，但吞吐直接减半。

这也解释了为什么单请求候选集不能太大——1000 条候选 = 26,867 tokens，
**一个请求就吃掉整分钟预算的 134%**，必然 429；2000 条是 269%。

<Tip>
  **接入清单**：并发上限设 4；实现指数退避重试；按上表核算峰值 QPS 是否够用；
  高频查询接缓存（下一节）直接省掉配额。
</Tip>

<Info>
  **配额正在扩容中**：上述 TPM 20,000 是上游给到的初始配额，API易 已在向平台申请扩容。
  如果你的业务量超出上表的测算，**请直接联系 API易客服评估提升上游配额**，
  不必按当前数字自行降级方案。
</Info>

### 缓存

实测**同一请求重复 10 次，得分逐位一致**（漂移 0）。
只有打乱候选顺序重发时才出现 3.7e-4 量级的漂移（bf16 批处理抖动），排序不受影响。

所以结果**可以放心缓存**：

* 缓存 key 用 `query 归一化 + 候选文档内容哈希（有序）`
* **不要把 `relevance_score` 本身当幂等标识或去重 key**——换个候选顺序它就会变最后几位
* 高频重复查询（FAQ、热门搜索）缓存命中率通常很高，能同时省掉延迟和上游压力

## 八、接入现成框架

参数名与 Cohere Rerank v1 一致（`query` / `documents` / `top_n` / `return_documents`），
但 **`documents` 只接受字符串数组**，传 `[{"text": "..."}]` 会返回 400，响应体也没有 Cohere 的
`id` / `meta` 字段。

<Warning>
  **`cohere` SDK v2 实测直接用不了**：它请求的是 `/v2/rerank`，
  而该路径返回的是网站 HTML 首页（HTTP 200），SDK 抛解析错误。自己包一层 HTTP 调用最省事。
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
              d = docs[item["index"]]                    # 按 index 回填，保住 metadata
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

  ```python 通用封装（含重试） theme={null}
  import os, time, requests

  BASE = "https://api.apiyi.com/v1"


  def rerank(query, documents, top_n=5, tries=4):
      """带退避重试的重排序调用。429 是上游拥塞，退避后通常能成功。"""
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

**Dify / RAGFlow / FastGPT 等平台**：在「模型供应商 → Rerank 模型」里选择兼容 Cohere/Jina 接口的
自定义供应商，填入：

| 配置项             | 值                          |
| --------------- | -------------------------- |
| API Base / 接口地址 | `https://api.apiyi.com/v1` |
| API Key         | 你的 API易 令牌（`sk-` 开头）       |
| 模型名称            | `bge-reranker-v2-m3`       |

<Warning>
  **地址一定要带 `/v1`。** 实测 `/rerank` 与 `/v2/rerank` 都会返回 **HTTP 200 + 网站 HTML 首页**，
  而不是 JSON 404——平台上表现为"返回内容无法解析"或"模型不可用"，很难定位。
  排查顺序：先确认最终请求路径是 `https://api.apiyi.com/v1/rerank`，再怀疑别的。

  如果平台会自动追加 `/v1`（填 base 后它拼成 `{base}/v1/rerank`），那就把 API Base 填成
  `https://api.apiyi.com`，避免出现双 `/v1`。用 `curl` 打一次确认路径最快。
</Warning>

## 九、上线前的检查清单

<AccordionGroup>
  <Accordion title="正确性">
    * [ ] 用 `results[].index` 回填原始文档对象，而不是按文本反查
    * [ ] 长文档已切块（200–500 字），并按文档聚合取最高分
    * [ ] 单个「query + 文档」对不超过 8192 tokens，否则会 400
    * [ ] 含否定/排除语义的查询有大模型兜底
  </Accordion>

  <Accordion title="稳定性">
    * [ ] 候选集控制在 100 条以内
    * [ ] **并发上限设到 4 以内**（实测上游槽位约 4–5 个在途请求，超出直接 429 不排队）
    * [ ] **按 TPM 20,000 核算过峰值吞吐**（100 篇候选约 15 次/分钟），确认够业务用
    * [ ] 实现了 429 退避重试（上游拥塞是瞬时状态）
    * [ ] 超时设置 ≥ 60 秒（100 条短文档 P95 约 4.3 秒，但长文档或大候选集会到几十秒）
    * [ ] 请求路径确认是 `/v1/rerank`——路径写错返回的是 200 + HTML，不是 404
    * [ ] 模型名拼写正确且全小写——写错返回的是 503，容易误判为渠道故障
  </Accordion>

  <Accordion title="效果">
    * [ ] 阈值策略用的是 Top-N 或相对阈值，不是拍脑袋的固定值
    * [ ] 多语言/跨语言场景验证过分数量级，没有被低分误伤
    * [ ] 标注了一小批真实 query 做过 A/B（开/关重排序），确认指标真的涨了
  </Accordion>

  <Accordion title="成本与缓存">
    * [ ] 知道 `usage.input_tokens` / `output_tokens` 恒为 0，用量看 `prompt_tokens` / `total_tokens`
    * [ ] 知道 `top_n` 和 `return_documents` 都不影响用量，所有候选都会过一遍模型
    * [ ] 成本核算以控制台账单为准（`prompt_tokens` 与 `total_tokens` 在 100 篇候选时相差约 45%，
      本轮测试未能确认实际扣的是哪个）
    * [ ] 高频查询接了结果缓存
  </Accordion>
</AccordionGroup>

## 相关文档

* [bge-reranker-v2-m3 概览](/api-capabilities/rerank/overview)
* [重排序 API 在线调试](/api-capabilities/rerank/rerank-api)
* [文本向量化](/api-capabilities/text-embedding)
