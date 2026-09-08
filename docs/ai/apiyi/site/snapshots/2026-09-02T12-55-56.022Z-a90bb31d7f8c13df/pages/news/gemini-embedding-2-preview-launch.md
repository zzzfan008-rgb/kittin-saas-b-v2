> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Embedding 2 Preview 上线：首个原生多模态嵌入模型

> 谷歌首个原生多模态嵌入模型 Gemini Embedding 2 Preview 上线 API易，支持文本/图片/视频/音频/PDF 统一向量空间，MTEB 英文榜首 68.32，3072 维 MRL 灵活降维，文本仅 $0.20/百万 tokens。

## 核心要点

* **首个原生多模态嵌入**：支持文本、图片、视频、音频、PDF 五种模态统一映射到同一向量空间
* **MTEB 英文榜首**：68.32 分登顶，分类 +9.6、检索 +9.0、聚类 +3.7 领先第二名
* **灵活维度控制**：默认 3072 维，支持 128～3072 任意截断（Matryoshka 表征学习），768 维仍达 67.99
* **超长输入支持**：文本最大 8192 tokens，图片最多 6 张/请求，视频最长 120 秒
* **100+ 语言覆盖**：多语言嵌入能力，MTEB 多语言榜 Top 5

## 背景介绍

2026 年 3 月 10 日，谷歌正式发布 Gemini Embedding 2 Preview，这是 Gemini 系列的**首个原生多模态嵌入模型**。与此前仅支持文本的 text-embedding-004 和 gemini-embedding-001 不同，Gemini Embedding 2 可以将文本、图片、视频、音频和 PDF 文档统一映射到同一个向量空间，实现真正的跨模态语义检索。

这意味着你可以用一段文本去搜索相关的图片，或者用一张图片去检索匹配的文档——所有模态共享同一套向量表示，无需分别处理。

API易已上架 `gemini-embedding-2-preview`，支持 OpenAI 兼容的 `/v1/embeddings` 接口直接调用。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="原生多模态" icon="layers">
    文本、图片、视频、音频、PDF 统一向量空间，实现跨模态语义搜索和相似度计算
  </Card>

  <Card title="MTEB 榜首" icon="trophy">
    英文 68.32 分登顶，分类、检索、聚类三项大幅领先，多语言 Top 5
  </Card>

  <Card title="Matryoshka 降维" icon="shrink">
    支持 128～3072 维灵活截断，低维仍保持高质量，按需平衡性能与存储成本
  </Card>

  <Card title="Prompt 指令式任务" icon="wand-sparkles">
    告别固定 task\_type 枚举，使用自然语言 prompt 描述任务类型，更灵活精确
  </Card>
</CardGroup>

### 性能亮点

Gemini Embedding 2 Preview 在 MTEB 基准上全面领先：

| 维度           | MTEB 英文总分 | 说明           |
| ------------ | --------- | ------------ |
| **3072**（默认） | **68.32** | 榜首           |
| **2048**     | **68.16** | 接近满维表现       |
| **1536**     | **68.17** | 适合替代 3-large |
| **768**      | **67.99** | 存储减半，性能几乎无损  |

**分项领先幅度**（相比第二名）：

| 任务类型   | 领先幅度   |
| ------ | ------ |
| **分类** | +9.6 分 |
| **检索** | +9.0 分 |
| **聚类** | +3.7 分 |

<Info>
  数据来源：谷歌官方博客（`blog.google`）及 MTEB 排行榜。Gemini Embedding 2 Preview 于 2026 年 3 月 10 日发布。
</Info>

### 与前代模型对比

| 特性          | text-embedding-004 | gemini-embedding-001 | gemini-embedding-2-preview |
| ----------- | ------------------ | -------------------- | -------------------------- |
| **模态**      | 仅文本                | 仅文本                  | 文本/图片/视频/音频/PDF            |
| **最大输入**    | 2048 tokens        | 2048 tokens          | **8192 tokens**            |
| **默认维度**    | 768                | 3072                 | **3072**                   |
| **维度范围**    | 有限                 | MRL 支持               | **128～3072（MRL）**          |
| **任务指定**    | task\_type 枚举      | task\_type 枚举        | **Prompt 指令式**             |
| **MTEB 英文** | 较低                 | 中等                   | **68.32（榜首）**              |
| **语言**      | 有限                 | 100+                 | **100+**                   |

<Warning>
  Gemini Embedding 2 与之前版本的嵌入空间不兼容，不能混用不同版本生成的向量。迁移时需要重新生成全部嵌入。
</Warning>

### 多模态输入规格

| 输入类型    | 限制             | 支持格式     |
| ------- | -------------- | -------- |
| **文本**  | 最大 8192 tokens | 纯文本      |
| **图片**  | 每请求最多 6 张      | PNG、JPEG |
| **视频**  | 最长 120 秒       | MP4、MOV  |
| **音频**  | 原生音频嵌入（无需转文本）  | 常见音频格式   |
| **PDF** | 原生支持           | PDF 文档   |

### 支持的任务类型

Gemini Embedding 2 使用 prompt 指令式任务描述：

| 任务          | 说明            |
| ----------- | ------------- |
| **语义相似度**   | 评估文本间的语义相似程度  |
| **分类**      | 按预设标签对文本分类    |
| **聚类**      | 按相似度对文本分组     |
| **检索（文档端）** | 优化文档侧的搜索嵌入    |
| **检索（查询端）** | 优化查询侧的搜索嵌入    |
| **代码检索**    | 用自然语言检索代码片段   |
| **问答**      | 为 QA 系统生成问题嵌入 |
| **事实验证**    | 为事实核查生成陈述嵌入   |

### 技术规格

| 参数         | Gemini Embedding 2 Preview |
| ---------- | -------------------------- |
| **模型 ID**  | gemini-embedding-2-preview |
| **发布日期**   | 2026 年 3 月 10 日            |
| **开发商**    | Google                     |
| **输入类型**   | 文本、图片、视频、音频、PDF            |
| **输出**     | 浮点向量                       |
| **默认维度**   | 3072                       |
| **维度范围**   | 128～3072（MRL）              |
| **最大文本输入** | 8192 tokens                |
| **语言**     | 100+                       |

## 实际应用

### 推荐场景

1. **跨模态语义搜索**：用文本搜图片、用图片搜文档，统一向量空间实现混合检索
2. **多语言 RAG**：100+ 语言覆盖，适合构建全球化检索增强生成系统
3. **文档智能分析**：直接嵌入 PDF，无需预处理即可建立文档检索库
4. **视频/音频内容检索**：原生支持视频和音频嵌入，适合媒体内容管理
5. **聚类与分类**：分类 +9.6、聚类 +3.7 的优势，适合大规模内容组织
6. **代码语义搜索**：自然语言查询代码片段，提升开发效率

### 代码示例

#### 文本嵌入

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.embeddings.create(
    model="gemini-embedding-2-preview",
    input="谷歌最新的多模态嵌入模型有哪些特点？",
    dimensions=768  # 可选：128～3072
)

embedding = response.data[0].embedding
print(f"维度: {len(embedding)}")
```

#### 批量文本嵌入

```python theme={null}
texts = [
    "人工智能的最新发展趋势",
    "机器学习在医疗领域的应用",
    "大语言模型的工作原理"
]

response = client.embeddings.create(
    model="gemini-embedding-2-preview",
    input=texts,
    dimensions=1536
)

for i, data in enumerate(response.data):
    print(f"文本 {i}: 维度 {len(data.embedding)}")
```

#### 语义搜索示例

```python theme={null}
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 构建文档库嵌入
docs = ["量子计算原理", "深度学习入门", "区块链技术概述"]
doc_resp = client.embeddings.create(
    model="gemini-embedding-2-preview",
    input=docs,
    dimensions=768
)
doc_embeddings = [d.embedding for d in doc_resp.data]

# 查询
query_resp = client.embeddings.create(
    model="gemini-embedding-2-preview",
    input="神经网络是怎么工作的？",
    dimensions=768
)
query_embedding = query_resp.data[0].embedding

# 计算相似度
for i, doc_emb in enumerate(doc_embeddings):
    sim = cosine_similarity(query_embedding, doc_emb)
    print(f"{docs[i]}: {sim:.4f}")
```

### 最佳实践

1. **选择合适维度**：768 维性价比最优（67.99 分，存储减半），3072 维追求极致精度
2. **注意向量归一化**：3072 维已预归一化，降维后需手动归一化
3. **利用 prompt 指令**：检索场景区分 query 和 document 端，可显著提升效果
4. **不可混用版本**：与 text-embedding-004 或 gemini-embedding-001 的向量空间不兼容，迁移需全量重建

## 价格与可用性

### 定价

| 输入类型   | 价格（每百万 tokens）         |
| ------ | ---------------------- |
| **文本** | \$0.20                 |
| **图片** | \$0.45（约 \$0.00012/张）  |
| **音频** | \$6.50（约 \$0.00016/秒）  |
| **视频** | \$12.00（约 \$0.00079/帧） |

### 与竞品价格对比

| 模型                             | 文本价格/百万 tokens | 维度   | 多模态   |
| ------------------------------ | -------------- | ---- | ----- |
| **gemini-embedding-2-preview** | **\$0.20**     | 3072 | ✅ 五模态 |
| text-embedding-3-large         | \$0.13         | 3072 | ❌ 仅文本 |
| text-embedding-3-small         | \$0.02         | 1536 | ❌ 仅文本 |

<Info>
  文本价格略高于 OpenAI text-embedding-3 系列，但 Gemini Embedding 2 是唯一支持五模态统一嵌入的模型，跨模态检索场景无需额外模型。
</Info>

### 叠加网站充值活动

<Card title="查看最新充值优惠政策" icon="gift" href="/faq/recharge-promotions">
  API易 提供充值加赠优惠，充值越多加赠越多，叠加模型本身的价格优势，实际使用成本更低。
</Card>

### 可用模型

| 模型名称                         | 说明                          |
| ---------------------------- | --------------------------- |
| `gemini-embedding-2-preview` | 原生多模态嵌入模型，支持文本/图片/视频/音频/PDF |

### 购买渠道

**API易平台**：

* 官网：`apiyi.com`
* API 端点：`https://api.apiyi.com/v1`
* 接口：`/v1/embeddings`（OpenAI 兼容格式）
* 兼容所有 OpenAI SDK

## 总结与建议

Gemini Embedding 2 Preview 是当前最强大的嵌入模型，也是业界首个原生多模态嵌入模型。它在 MTEB 英文榜登顶，同时支持五种模态的统一向量表示，为跨模态检索开辟了全新可能。

**核心优势**：

* **多模态统一**：文本/图片/视频/音频/PDF 共享向量空间，一个模型搞定所有检索
* **性能榜首**：MTEB 68.32 登顶，分类、检索、聚类三项大幅领先
* **灵活降维**：MRL 支持 128～3072 维，按需平衡精度与成本
* **超长输入**：8192 tokens，4 倍于前代

**使用建议**：

1. **跨模态检索**：首选 Gemini Embedding 2，目前唯一选择
2. **纯文本 + 极致低价**：text-embedding-3-small 仍是最便宜的选项
3. **纯文本 + 高精度**：Gemini Embedding 2 的 768 维已超越 text-embedding-3-large
4. **RAG 场景**：8192 tokens 长输入 + 灵活降维，非常适合大文档分块检索

**谁应该使用 Gemini Embedding 2**：

* 需要跨模态搜索的应用（图搜文、文搜图等）
* 构建多语言 RAG 系统的开发者
* 需要处理 PDF/视频/音频内容的企业场景
* 追求最高嵌入质量的检索系统

<Info>
  信息来源：Google 官方博客（`blog.google`）、Google AI 开发者文档（`ai.google.dev`）、MTEB 排行榜。Gemini Embedding 2 Preview 于 2026 年 3 月 10 日发布。数据获取时间：2026 年 3 月 31 日。
</Info>
