> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 向量检索实战调优

> 怎么把 Embedding 用对：bge-m3 与 OpenAI 三款模型的实测对照、切块多大、相似度阈值怎么定、批量与并发开多少、成本怎么算，以及 LangChain 接第三方 embedding 时那个会让召回率从 80% 掉到 15% 的默认配置。

[文本向量化](/api-capabilities/text-embedding) 讲了怎么把接口调通。这一页讲**怎么把它用对**。

Embedding 的坑几乎都不在「调不通」——接口返回 200、维度也对，但召回质量悄悄崩掉。
下面每一条建议都对应 API易 2026 年 8 月 25 日 (UTC+8) 的实测数据，不是通用套话。

<Note>
  **测试方法**：围绕「大模型网关接入」构造 20 篇中文文档 + 一一对应的 20 篇英文文档，
  20 条中文 query + 20 条英文 query 人工标注答案，同一批语料在同一时间窗内跑三个模型。
  语料规模有限，**小于 5 个百分点的差距不构成结论**，请按自己的语料复现。
</Note>

## 一、先选对模型

|                   | `bge-m3`             | `text-embedding-3-small` | `text-embedding-3-large` |
| ----------------- | -------------------- | ------------------------ | ------------------------ |
| 价格                | **\$0.01/1M tokens** | \$0.02/1M tokens         | \$0.13/1M tokens         |
| 向量维度              | **1024**             | 1536                     | 3072                     |
| 最大长度              | 8192 token           | 8191 token               | 8191 token               |
| 是否已归一化            | 是                    | 是                        | 是                        |
| 支持降维 `dimensions` | ❌ 明确报错               | ✅                        | ✅                        |
| 中文检索 Recall\@1    | 80%                  | 80%                      | 85%                      |
| 英文检索 Recall\@1    | 70%                  | 80%                      | 85%                      |
| 中英混合库 Recall\@1   | 65%                  | 80%                      | 85%                      |
| 中文 token 密度       | **2.1 字/token**      | 0.9 字/token              | 0.9 字/token              |

<CardGroup cols={2}>
  <Card title="选 bge-m3 的场景" icon="check">
    * 语料**以中文为主**：检索质量与 3-small 同档，单价是它的一半，
      同一批中文文本的 token 数又只有它的 42% —— **实际花费约 1/5**
    * 想省存储：1024 维比 1536 省 33%、比 3072 省 66%
    * 需要覆盖冷门语种（100+ 语言）
    * 希望本地能跑同一个开源模型，保证线上线下向量一致
  </Card>

  <Card title="选 OpenAI 的场景" icon="check">
    * 语料**以英文或代码为主**：检索质量高一档。这类内容上 bge-m3 的 token 数反而多 15%–50%，
      但单价减半之后总花费仍然更低，所以**这里该按质量选，不是按价格选**
    * 知识库里**中英文混排**、又只要返回一条答案
    * 需要 `dimensions` 降维来压缩存储
    * 已有大量按 OpenAI 分数带标定的阈值，不想重标
  </Card>
</CardGroup>

<Warning>
  **中英混合库是 bge-m3 的弱项**（Recall\@1 65%）。原因不是它跨语言不行，恰恰相反：
  它给「同一件事的中文版和英文版」打的分太接近（实测 0.75–0.87，OpenAI 只有 0.56–0.69），
  中文提问经常把英文版排到中文版前面。

  **只要一条答案的 RAG**，请按语种分库，或在检索时带上语种过滤条件；
  **要跨语种把资料召齐**的场景，这反而是它的优点。
</Warning>

## 二、长文档一定要切块

`bge-m3` 的窗口是 8192 token，一篇上万字的手册整篇塞得进去。**但不该这么做。**

实测：把 20 个小节串成一篇长手册，候选集里另放 20 篇「每篇正好对应其中一节」的强干扰短文，
再用 20 条问题去检索——

| 做法     | 结果                                     |
| ------ | -------------------------------------- |
| 整篇一条向量 | 长手册排第 1 的比例 **10%**                    |
| 按小节切块  | Top1 落在本手册的比例 **75%**，精确命中正确小节 **65%** |

同一个问题，对「整篇」和「正确那一小节」的相似度平均相差 **+0.10**：

| 问题                | 整篇    | 正确小节  | 差          |
| ----------------- | ----- | ----- | ---------- |
| 美元和人民币是怎么换算的      | 0.487 | 0.684 | **+0.198** |
| 怎样保证模型输出的是合法 JSON | 0.487 | 0.650 | **+0.163** |
| 提示 401 未授权怎么办     | 0.485 | 0.612 | +0.127     |

一篇长文的单一向量是全文语义的**平均值**，会被任何一段精准的短文本压过去。

<Tip>
  **切块建议**

  * 按语义段落切 **200–500 token**，块间重叠 10%–15%
  * 中文约 2.1 字一个 token，所以 200–500 token ≈ **420–1050 个汉字**
  * **不要切成几十 token 的碎块**：每条输入固定附带 2 个特殊 token，
    500 token 的块里占 0.4%，16 token 的碎块里就是 12.5% 的纯浪费
  * 把标题拼进每个块的开头，能明显改善「这段在讲什么」的可辨识度
</Tip>

## 三、相似度阈值必须按模型重标

这是从 OpenAI 迁到 `bge-m3` 时最容易翻车的地方。**两者的分数带完全不同。**

同一批人工标注的语义对，三个模型给出的分：

| 语义关系                       | `bge-m3`  | `3-small` | `3-large` |
| -------------------------- | --------- | --------- | --------- |
| 完全无关（「如何开启流式输出」↔「今天北京天气」）  | **0.417** | 0.094     | 0.108     |
| 同义改写（「返回 429」↔「提示触发限流」）    | 0.552     | 0.420     | 0.360     |
| 跨语言同义                      | 0.753     | 0.557     | 0.681     |
| 主客体互换（「用户给模型发图」↔「模型给用户发图」） | 0.975     | 0.908     | 0.895     |

<Warning>
  `bge-m3` 的**地板在 0.42**，OpenAI 在 0.09。
  照抄「低于 0.3 就丢掉」这类经验值，在 `bge-m3` 上等于完全不设防；
  照抄「0.8 以上才算相关」，则会把绝大多数正确结果一起扔掉。
</Warning>

实测出的最佳单一阈值（`bge-m3`）：

| 场景         | 建议起步阈值    | 该阈值下的准确率 |
| ---------- | --------- | -------- |
| 中文库 / 中文提问 | **0.53**  | 75%      |
| 英文库 / 英文提问 | 0.51      | 80%      |
| 跨语言检索      | 0.53–0.55 | 75%–82%  |
| 中英混合库      | 0.62      | 68%      |

作为对照，`text-embedding-3-small` 中文场景的最佳阈值是 **0.45**，`3-large` 是 **0.33**。

<Tip>
  **落地做法**：起步取 **0.5**，把 **0.45–0.60** 当成需要人工确认的灰区，
  上线前用自己语料的 50–100 条标注样本重标一次。
</Tip>

## 四、相似度不能用来判断「说得对不对」

这一条对**所有** embedding 模型都成立，不是某个模型的缺陷，但必须提前知道：

| 文本对                                            | `bge-m3` | `3-small` | `3-large` |
| ---------------------------------------------- | -------- | --------- | --------- |
| 「支持函数调用」↔「**不**支持函数调用」                         | 0.891    | 0.851     | 0.805     |
| 「每百万 token **2** 美元」↔「每百万 token **20** 美元」     | 0.965    | 0.954     | 0.902     |
| 「改成 api.**apiyi**.com」↔「改成 api.**openai**.com」 | 0.873    | 0.878     | 0.738     |
| 「用户给模型发图片」↔「模型给用户发图片」                          | 0.975    | 0.908     | 0.895     |

三个模型全部失守。**余弦相似度衡量的是「在不在谈同一件事」，不是「说法是否一致」。**

所以否定、价格数字、版本号、实体名这类关键差异，**检索阶段一定分不开**。正确的兜底是：

<Steps>
  <Step title="向量召回 Top 50–100">
    用 `bge-m3` 把候选范围快速缩小，阈值只用来挡掉明显无关的。
  </Step>

  <Step title="重排序精排 Top 3–5">
    用 [`bge-reranker-v2-m3`](/api-capabilities/rerank/overview) 对候选逐条打分。
    它是 query 和文档拼在一起过一遍模型的 Cross-Encoder，**恰好擅长区分这类细微差异**，
    而且和 `bge-m3` 出自同一个模型家族。
  </Step>

  <Step title="生成阶段让大模型自己判断">
    把 Top 3–5 连同原始问题一起交给大模型，在提示词里明确要求「若检索内容与问题不符，直接说没有找到」。
  </Step>
</Steps>

## 五、批量与并发怎么开

### 批量：64–128 是拐点

| 批量      | 单次耗时  | 每条摊薄     |
| ------- | ----- | -------- |
| 16      | 1.67s | 105ms    |
| 64      | 5.04s | 79ms     |
| **128** | 7.45s | **58ms** |
| 256     | 14.6s | 57ms     |
| 1024    | 54.4s | 53ms     |

128 条以后每条摊薄成本几乎不再下降（58ms → 53ms），单次耗时却涨了 7 倍。
单次耗时直接决定客户端超时风险，以及一次失败要重做多少工作。

### 并发：线上 8，灌库 32–48

| 并发       | 成功率       | 整体吞吐        | 最慢请求  |
| -------- | --------- | ----------- | ----- |
| 8（200 次） | **100%**  | 55 条/秒      | 5.6s  |
| 48       | 99.3%     | **133 条/秒** | 10.2s |
| 96       | **88.2%** | 65 条/秒      | 59.8s |

* **线上实时检索走并发 8**：实测 200 次零失败
* **离线灌库可以开到 32–48**：吞吐最高，但已经开始出现 429，必须带指数退避
* **不要超过 64**：96 并发失败率 11.8%，且出现 59 秒级的挂起请求

<Warning>
  **客户端必须带重试。** 即使在低并发下也观测到约 0.8% 的连接被中断
  （`Connection aborted / Remote end closed connection`）。
  这类失败重试一次就能过，但不重试就是灌库中间断一条。

  离线灌库的客户端超时建议设 **60–90 秒**，不要设几百秒等着 —— 挂起比失败更难处理。
</Warning>

```python theme={null}
import time
from openai import OpenAI

client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1", timeout=90.0)

def embed_batch(texts, model="bge-m3", retries=3):
    """带退避重试的批量向量化。批量控制在 64-128 条。"""
    for attempt in range(retries):
        try:
            resp = client.embeddings.create(model=model, input=texts)
            return [d.embedding for d in sorted(resp.data, key=lambda x: x.index)]
        except Exception as e:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)          # 1s, 2s, 4s
```

## 六、成本怎么算

成本由两件事相乘决定：**单价**和**同一段文本被切成多少 token**。两者在这里都不一样。

`bge-m3` 是 **\$0.01 / 1M tokens**，`text-embedding-3-small` 是 **\$0.02**，单价先差一半。
再叠上分词效率——`bge-m3` 用 XLM-R 的 SentencePiece，中文约 **2.1 字/token**，
OpenAI 的 cl100k 中文只有约 **0.9 字/token**：

| 语料             | `bge-m3` token 数 | OpenAI token 数 | token 倍数 | **实际花费**  |
| -------------- | ---------------- | -------------- | -------- | --------- |
| 中文技术文档（492 字）  | **231**          | 552            | 0.42×    | **0.21×** |
| 日文（456 字）      | **231**          | 480            | 0.48×    | **0.24×** |
| 俄文（810 字）      | **213**          | 411            | 0.52×    | **0.26×** |
| 中英混排（760 字）    | 413              | 360            | 1.15×    | 0.57×     |
| 英文技术文档（1053 字） | 210              | 182            | 1.15×    | 0.58×     |
| 代码片段（1200 字）   | 453              | 300            | 1.51×    | 0.76×     |

**中文语料的实际花费约为 `text-embedding-3-small` 的 1/5。**
英文和代码上 `bge-m3` 消耗的 token 更多，但单价减半之后总花费仍然更低——
所以这两类语料该不该用它，**看的是检索质量（英文 Recall\@1 70% vs 80%），不是价格**。

存储侧同样有差距。向量已 L2 归一化、返回值本身就是 fp16 精度，
所以**用 float16 存 `bge-m3` 的向量是零精度损失的**：

| 方案                                      | 每条       | 100 万条   |
| --------------------------------------- | -------- | -------- |
| `bge-m3` 1024 维 float16                 | **2 KB** | **2 GB** |
| `bge-m3` 1024 维 float32                 | 4 KB     | 4 GB     |
| `text-embedding-3-small` 1536 维 float32 | 6 KB     | 6 GB     |
| `text-embedding-3-large` 3072 维 float32 | 12 KB    | 12 GB    |

<Tip>
  向量已经归一化（实测 L2 范数 0.99992–1.00029），所以**点积就等于余弦相似度**。
  向量库里索引选 `IP`（内积）和 `COSINE` 结果等价，选 `IP` 还能省一次归一化开销。
</Tip>

## 七、几个会静默出错的坑

### 7.1 LangChain 的默认配置会让召回率从 80％ 掉到 15％

<Warning>
  `langchain_openai.OpenAIEmbeddings` 默认 `check_embedding_ctx_length=True`，
  它会**先用 tiktoken 把文本编码成 token id**，再把整数数组发给 `/v1/embeddings`。

  这在 OpenAI 自家模型上没问题，因为分词器就是 tiktoken。
  但 `bge-m3` 用的是 XLM-R 分词器，两套 id 空间完全不同。

  **接口照样返回 200、维度照样是 1024、`usage` 也正常，只有召回质量悄悄崩掉。**
</Warning>

实测代价：

| 检查项                                     | 结果            |
| --------------------------------------- | ------------- |
| 同一句话「文本输入」与「tiktoken token-id 输入」的向量相似度 | **0.282**     |
| 中文库检索 Recall\@1                         | **80% → 15%** |

修复方式：

```python theme={null}
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="bge-m3",
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    check_embedding_ctx_length=False,   # 必须关掉，否则发出去的是 tiktoken 的 token id
    chunk_size=64,                      # 每批 64 条
)
```

同类风险存在于**任何「客户端先分词再发 id」的封装**。接第三方 embedding 模型时，
先确认 SDK 发出去的是原始文本还是 token id。

### 7.2 空字符串会被当成有效输入

`input: ""` 在 `bge-m3` 上返回 **200**（OpenAI 官方此处是 400），会得到一条 1024 维向量并计费 2 token。

切块脚本如果没过滤空块，知识库里就会混进一批无意义向量，还会在检索时随机冒出来。
**入库前自己过滤空白文本。**

### 7.3 `dimensions` 参数不能用

```json theme={null}
{ "model": "bge-m3", "input": "...", "dimensions": 512 }
```

返回 400：`Model "bge-m3" does not support matryoshka representation, changing output dimensions will lead to poor results.`

`bge-m3` 没有做 Matryoshka 训练，**截断向量会显著掉点**。要压缩存储请用 float16，不要自己截断维度。

### 7.4 模型名大小写敏感、没有别名

只有 `bge-m3` 可用。`BAAI/bge-m3`、`BGE-M3` 都会返回 503「无可用渠道」。

### 7.5 8192 是「每条输入」的上限

单条超过 8192 token 直接返回 400，**不会静默截断**（这是好事：不会拿到一个丢了后半段却看着正常的向量）。

但这个上限是**逐条**判定的，不是整次请求：实测单次请求塞进 **1024 条 / 102560 token** 仍然正常返回。
批量里只要有一条超限，整个请求就 400，报错里的 token 数是**那一条**的，不是总和。

## 八、一份可以直接抄的最小实现

```python theme={null}
"""bge-m3 灌库 + 检索的最小可用实现。"""
import time
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    timeout=90.0,
)

MODEL = "bge-m3"
BATCH = 96          # 64-128 之间
THRESHOLD = 0.50    # 起步值，上线前用自己的样本重标


def embed(texts, retries=3):
    """批量向量化，带退避重试。返回 float32 数组。"""
    texts = [t.strip() for t in texts if t and t.strip()]   # 过滤空块，见 7.2
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
    # 向量已归一化，直接存 float16 无精度损失，见第六节
    return np.array(out, dtype=np.float16)


def search(query, doc_vectors, docs, top_k=50):
    """向量已归一化，点积即余弦相似度。"""
    qv = embed([query])[0].astype(np.float32)
    scores = doc_vectors.astype(np.float32) @ qv
    order = np.argsort(-scores)[:top_k]
    return [(docs[i], float(scores[i])) for i in order if scores[i] >= THRESHOLD]


if __name__ == "__main__":
    docs = ["……你的切块结果，每块 200-500 token……"]
    dv = embed(docs)
    for text, score in search("用户的问题", dv, docs):
        print(f"{score:.4f}  {text[:60]}")
    # 生产环境请把这里的 Top 50 交给 bge-reranker-v2-m3 精排，见第四节
```

## 相关文档

<CardGroup cols={2}>
  <Card title="文本向量化 API" icon="vector-square" href="/api-capabilities/text-embedding">
    接口参数、返回格式、快速上手
  </Card>

  <Card title="重排序模型" icon="list-ordered" href="/api-capabilities/rerank/overview">
    `bge-reranker-v2-m3`，精排环节的正确解法
  </Card>

  <Card title="RAG 实战调优" icon="sliders-horizontal" href="/api-capabilities/rerank/rag-best-practices">
    两段式检索架构、召回条数怎么定
  </Card>

  <Card title="模型价格" icon="tags" href="/models">
    全部 embedding 模型的实时价格
  </Card>
</CardGroup>
