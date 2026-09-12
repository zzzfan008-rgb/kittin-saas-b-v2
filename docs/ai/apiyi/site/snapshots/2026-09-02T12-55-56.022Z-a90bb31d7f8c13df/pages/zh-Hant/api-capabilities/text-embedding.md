> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文本向量化（Embedding）

> 把文本轉換為高維向量，支援知識庫檢索、語義搜尋、文本相似度計算等場景。提供 OpenAI text-embedding 系列與開源多語言模型 bge-m3。

API易 提供業界領先的文本向量化（Embedding）能力，使用 OpenAI 的 Embedding 模型將文本轉換為高維向量表示。這是構建智慧知識庫、語義搜尋、RAG（檢索增強生成）系統的核心技術，具有超高併發能力和極低的使用成本。

<Note>
  **🔍 文本向量化核心能力**
  將文本轉換為數值向量，捕捉語義資訊，實現高效的語義檢索、相似度計算和智慧推薦。
</Note>

## 🌟 核心特性

* **🎯 兩條技術路線**：OpenAI text-embedding 系列 + 開源多語言模型 `bge-m3`（1024 維、8192 上下文、100+ 語種）
* **⚡ 超高併發**：支援大規模併發請求，適合企業級應用
* **💰 極低成本**：按量付費，價格低至 \$0.01/百萬 tokens
* **🔧 簡單易用**：相容 OpenAI API 格式，無縫整合
* **📊 高品質向量**：捕捉深層語義，檢索準確度高

## 📋 支援的 Embedding 模型

| 模型名稱                         | 模型 ID                    | 向量維度   | 價格               | 推薦場景          |
| ---------------------------- | ------------------------ | ------ | ---------------- | ------------- |
| **text-embedding-3-large**   | `text-embedding-3-large` | 3072 維 | \$0.13/1M tokens | 高精度語義檢索       |
| **text-embedding-3-small** ⭐ | `text-embedding-3-small` | 1536 維 | \$0.02/1M tokens | 通用場景，價效比最高    |
| **bge-m3** 🆕                | `bge-m3`                 | 1024 維 | \$0.01/1M tokens | 中文與多語言知識庫，最低價 |
| **text-embedding-ada-002**   | `text-embedding-ada-002` | 1536 維 | \$0.10/1M tokens | 經典模型，相容性好     |

<Tip>
  **模型選擇建議**：

  * **高精度需求**：使用 text-embedding-3-large，適合專業知識庫、法律文件等場景
  * **通用場景**：推薦 text-embedding-3-small，價效比最高，適合大多數應用
  * **中文為主的知識庫**：推薦 `bge-m3`。檢索品質與 text-embedding-3-small 同檔，單價卻只有它的一半；
    中文分詞效率還高一倍多（約 2.1 字/token vs 0.9 字/token），兩項疊加後
    **同一批中文語料的實際花費約為 1/5**；1024 維還比 1536 維省 33% 儲存
  * **相容性優先**：使用 text-embedding-ada-002，與舊版本完全相容

  不同模型的相似度分數帶差別很大，**閾值不能跨模型照搬**。選型對照、切塊粒度、閾值標定、
  批次與併發的實測資料見 [向量檢索實戰調優](/zh-Hant/api-capabilities/embedding-best-practices)。
</Tip>

## 🚀 快速開始

### 1. 最簡單示例 - 使用 curl 命令

```bash theme={null}
curl https://api.apiyi.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": "人工智慧正在改變世界",
    "model": "text-embedding-3-small"
  }'
```

<Accordion title="檢視返回結果示例">
  ```json theme={null}
  {
    "object": "list",
    "data": [
      {
        "object": "embedding",
        "index": 0,
        "embedding": [
          -0.006929283,
          -0.005336422,
          0.024047505,
          -0.01407986,
          ...
        ]
      }
    ],
    "model": "text-embedding-3-small",
    "usage": {
      "prompt_tokens": 5,
      "total_tokens": 5
    }
  }
  ```
</Accordion>

### 2. 基礎示例 - 使用 OpenAI SDK

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

def get_embedding(text, model="text-embedding-3-small"):
    """獲取文本的向量表示"""
    response = client.embeddings.create(
        input=text,
        model=model
    )
    return response.data[0].embedding

# 使用示例
text = "人工智慧正在改變世界"
embedding = get_embedding(text)

print(f"向量維度: {len(embedding)}")
print(f"向量前5個值: {embedding[:5]}")
```

### 3. 批次文本向量化

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

def batch_get_embeddings(texts, model="text-embedding-3-small"):
    """批次獲取文本向量"""
    response = client.embeddings.create(
        input=texts,
        model=model
    )
    return [item.embedding for item in response.data]

# 批次處理
texts = [
    "機器學習是人工智慧的核心技術",
    "深度學習推動了AI的發展",
    "自然語言處理讓機器理解人類語言",
    "計算機視覺讓機器看懂影像"
]

embeddings = batch_get_embeddings(texts)
print(f"成功向量化 {len(embeddings)} 條文本")
```

### 4. 使用 requests 庫

```python theme={null}
import requests

def get_embedding_with_requests(text, model="text-embedding-3-small"):
    """使用 requests 庫獲取向量"""
    url = "https://api.apiyi.com/v1/embeddings"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "input": text
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        data = response.json()
        return data['data'][0]['embedding']
    else:
        print(f"錯誤: {response.status_code} - {response.text}")
        return None

# 使用示例
embedding = get_embedding_with_requests("人工智慧技術")
print(f"向量維度: {len(embedding)}")
```

## 🎯 典型應用場景

### 1. 語義搜尋引擎

```python theme={null}
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

def cosine_similarity(a, b):
    """計算餘弦相似度"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def semantic_search(query, documents, top_k=3):
    """語義搜尋"""
    # 獲取查詢和文件的向量
    all_texts = [query] + documents
    response = client.embeddings.create(
        input=all_texts,
        model="text-embedding-3-small"
    )

    embeddings = [item.embedding for item in response.data]
    query_embedding = embeddings[0]
    doc_embeddings = embeddings[1:]

    # 計算相似度
    similarities = [
        cosine_similarity(query_embedding, doc_emb)
        for doc_emb in doc_embeddings
    ]

    # 排序並返回最相關的文件
    ranked_indices = np.argsort(similarities)[::-1][:top_k]

    results = [
        {
            "document": documents[i],
            "similarity": similarities[i]
        }
        for i in ranked_indices
    ]

    return results

# 使用示例
documents = [
    "Python是一種高階程式語言",
    "機器學習需要大量資料",
    "深度學習是AI的重要分支",
    "JavaScript用於網頁開發"
]

query = "人工智慧和機器學習"
results = semantic_search(query, documents)

for i, result in enumerate(results, 1):
    print(f"{i}. {result['document']} (相似度: {result['similarity']:.4f})")
```

### 2. 構建向量資料庫

```python theme={null}
import numpy as np
import json
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

class SimpleVectorDB:
    """簡單的向量資料庫實現"""

    def __init__(self, model="text-embedding-3-small"):
        self.model = model
        self.documents = []
        self.embeddings = []

    def add_documents(self, docs):
        """新增文件到向量庫"""
        # 獲取向量
        response = client.embeddings.create(
            input=docs,
            model=self.model
        )

        embeddings = [item.embedding for item in response.data]

        self.documents.extend(docs)
        self.embeddings.extend(embeddings)

        print(f"已新增 {len(docs)} 條文件到向量庫")

    def search(self, query, top_k=5):
        """搜尋最相關的文件"""
        # 獲取查詢向量
        response = client.embeddings.create(
            input=query,
            model=self.model
        )
        query_embedding = response.data[0].embedding

        # 計算相似度
        similarities = []
        for doc_embedding in self.embeddings:
            sim = np.dot(query_embedding, doc_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
            )
            similarities.append(sim)

        # 排序
        ranked_indices = np.argsort(similarities)[::-1][:top_k]

        return [
            {
                "document": self.documents[i],
                "similarity": similarities[i]
            }
            for i in ranked_indices
        ]

    def save(self, filepath):
        """儲存向量庫到檔案"""
        data = {
            "documents": self.documents,
            "embeddings": self.embeddings,
            "model": self.model
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)

    def load(self, filepath):
        """從檔案載入向量庫"""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.documents = data['documents']
        self.embeddings = data['embeddings']
        self.model = data['model']

# 使用示例
db = SimpleVectorDB()

# 新增知識庫文件
knowledge_base = [
    "機器學習是讓計算機從資料中學習的技術",
    "深度學習使用多層神經網路處理複雜模式",
    "自然語言處理幫助計算機理解人類語言",
    "強化學習通過獎勵機制訓練智慧體"
]

db.add_documents(knowledge_base)

# 搜尋
results = db.search("什麼是深度學習?", top_k=2)
for result in results:
    print(f"相似度 {result['similarity']:.4f}: {result['document']}")
```

### 3. 文本去重和聚類

```python theme={null}
import numpy as np
from sklearn.cluster import KMeans
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

def deduplicate_texts(texts, threshold=0.95):
    """基於向量相似度去重"""
    # 獲取所有文本的向量
    response = client.embeddings.create(
        input=texts,
        model="text-embedding-3-small"
    )
    embeddings = np.array([item.embedding for item in response.data])

    # 計算相似度矩陣
    unique_indices = [0]  # 保留第一個

    for i in range(1, len(texts)):
        is_duplicate = False
        for j in unique_indices:
            similarity = np.dot(embeddings[i], embeddings[j]) / (
                np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[j])
            )
            if similarity > threshold:
                is_duplicate = True
                break

        if not is_duplicate:
            unique_indices.append(i)

    return [texts[i] for i in unique_indices]

def cluster_texts(texts, n_clusters=3):
    """文本聚類"""
    # 獲取向量
    response = client.embeddings.create(
        input=texts,
        model="text-embedding-3-small"
    )
    embeddings = np.array([item.embedding for item in response.data])

    # K-means 聚類
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(embeddings)

    # 組織結果
    clusters = {i: [] for i in range(n_clusters)}
    for text, label in zip(texts, labels):
        clusters[label].append(text)

    return clusters

# 使用示例 - 去重
texts_with_duplicates = [
    "人工智慧正在改變世界",
    "AI技術正在改變我們的世界",  # 語義相似
    "機器學習是AI的核心",
    "深度學習推動AI發展"
]

unique_texts = deduplicate_texts(texts_with_duplicates, threshold=0.9)
print(f"去重後剩餘 {len(unique_texts)} 條文本")

# 使用示例 - 聚類
texts_to_cluster = [
    "Python程式語言",
    "機器學習演算法",
    "Java開發框架",
    "深度學習模型",
    "JavaScript前端開發",
    "神經網路訓練"
]

clusters = cluster_texts(texts_to_cluster, n_clusters=2)
for cluster_id, cluster_texts in clusters.items():
    print(f"\n聚類 {cluster_id}:")
    for text in cluster_texts:
        print(f"  - {text}")
```

### 4. RAG（檢索增強生成）系統

```python theme={null}
from openai import OpenAI
import numpy as np

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

class RAGSystem:
    """簡單的 RAG 系統實現"""

    def __init__(self):
        self.knowledge_base = []
        self.embeddings = []

    def add_knowledge(self, documents):
        """新增知識到知識庫"""
        response = client.embeddings.create(
            input=documents,
            model="text-embedding-3-small"
        )

        embeddings = [item.embedding for item in response.data]
        self.knowledge_base.extend(documents)
        self.embeddings.extend(embeddings)

    def retrieve(self, query, top_k=3):
        """檢索相關文件"""
        # 獲取查詢向量
        response = client.embeddings.create(
            input=query,
            model="text-embedding-3-small"
        )
        query_embedding = response.data[0].embedding

        # 計算相似度
        similarities = [
            np.dot(query_embedding, doc_emb) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_emb)
            )
            for doc_emb in self.embeddings
        ]

        # 獲取最相關的文件
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [self.knowledge_base[i] for i in top_indices]

    def generate_answer(self, question):
        """生成答案"""
        # 檢索相關知識
        relevant_docs = self.retrieve(question, top_k=3)

        # 構建 prompt
        context = "\n".join(relevant_docs)
        prompt = f"""基於以下知識回答問題：

知識庫內容：
{context}

問題：{question}

請基於上述知識給出準確的回答："""

        # 生成回答
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        return response.choices[0].message.content

# 使用示例
rag = RAGSystem()

# 新增知識庫
knowledge = [
    "GPT-4 是 OpenAI 開發的大型語言模型，具有強大的理解和生成能力。",
    "Claude 是 Anthropic 開發的 AI 助手，注重安全性和有用性。",
    "Gemini 是 Google 開發的多模態 AI 模型，支援文本、影像和影片。",
    "LLaMA 是 Meta 開發的開源大語言模型系列。"
]

rag.add_knowledge(knowledge)

# 提問並生成答案
question = "GPT-4 是誰開發的？"
answer = rag.generate_answer(question)
print(f"問題: {question}")
print(f"答案: {answer}")
```

### 5. 推薦系統

```python theme={null}
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

class ContentRecommender:
    """基於內容的推薦系統"""

    def __init__(self):
        self.items = []
        self.embeddings = []

    def add_items(self, items):
        """新增物品（標題、描述等）"""
        response = client.embeddings.create(
            input=items,
            model="text-embedding-3-small"
        )

        embeddings = [item.embedding for item in response.data]
        self.items.extend(items)
        self.embeddings.extend(embeddings)

    def recommend(self, user_preference, top_k=5):
        """基於使用者偏好推薦"""
        # 獲取使用者偏好向量
        response = client.embeddings.create(
            input=user_preference,
            model="text-embedding-3-small"
        )
        pref_embedding = response.data[0].embedding

        # 計算相似度
        similarities = [
            np.dot(pref_embedding, item_emb) / (
                np.linalg.norm(pref_embedding) * np.linalg.norm(item_emb)
            )
            for item_emb in self.embeddings
        ]

        # 排序推薦
        top_indices = np.argsort(similarities)[::-1][:top_k]

        return [
            {
                "item": self.items[i],
                "score": similarities[i]
            }
            for i in top_indices
        ]

# 使用示例
recommender = ContentRecommender()

# 新增商品
products = [
    "MacBook Pro M3 專業筆記型電腦 高效能辦公",
    "iPhone 15 Pro 智慧手機 拍照攝影",
    "AirPods Pro 無線降噪耳機",
    "iPad Air 平板電腦 娛樂學習",
    "ThinkPad X1 商務筆記本 辦公利器"
]

recommender.add_items(products)

# 推薦
user_pref = "我想買一臺用於程式設計和辦公的筆記型電腦"
recommendations = recommender.recommend(user_pref, top_k=3)

print(f"使用者需求: {user_pref}\n")
print("推薦商品:")
for i, rec in enumerate(recommendations, 1):
    print(f"{i}. {rec['item']} (匹配度: {rec['score']:.4f})")
```

## 💡 最佳實踐

### 1. 文本預處理

```python theme={null}
import re

def preprocess_text(text):
    """文本預處理"""
    # 去除多餘空白
    text = re.sub(r'\s+', ' ', text)

    # 去除特殊字元（可選）
    # text = re.sub(r'[^\w\s]', '', text)

    # 轉小寫（可選，取決於場景）
    # text = text.lower()

    return text.strip()

# 長文本分塊
def chunk_text(text, max_tokens=500, overlap=50):
    """將長文本分割成小塊"""
    words = text.split()
    chunks = []

    for i in range(0, len(words), max_tokens - overlap):
        chunk = ' '.join(words[i:i + max_tokens])
        chunks.append(chunk)

    return chunks

# 使用示例
long_text = """這是一段很長的文本..."""
chunks = chunk_text(long_text, max_tokens=200)

# 為每個分塊獲取向量
embeddings = batch_get_embeddings(chunks)
```

### 2. 快取機制

```python theme={null}
import hashlib
import pickle
import os

class EmbeddingCache:
    """向量快取系統"""

    def __init__(self, cache_dir="./embedding_cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)

    def _get_cache_key(self, text, model):
        """生成快取鍵"""
        content = f"{text}_{model}"
        return hashlib.md5(content.encode()).hexdigest()

    def get(self, text, model):
        """獲取快取的向量"""
        cache_key = self._get_cache_key(text, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.pkl")

        if os.path.exists(cache_file):
            with open(cache_file, 'rb') as f:
                return pickle.load(f)
        return None

    def set(self, text, model, embedding):
        """儲存向量到快取"""
        cache_key = self._get_cache_key(text, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.pkl")

        with open(cache_file, 'wb') as f:
            pickle.dump(embedding, f)

    def clear(self):
        """清空快取"""
        for file in os.listdir(self.cache_dir):
            os.remove(os.path.join(self.cache_dir, file))

# 使用快取的向量獲取函式
cache = EmbeddingCache()

def get_embedding_cached(text, model="text-embedding-3-small"):
    """帶快取的向量獲取"""
    # 嘗試從快取獲取
    cached = cache.get(text, model)
    if cached is not None:
        return cached

    # 呼叫 API
    response = client.embeddings.create(input=text, model=model)
    embedding = response.data[0].embedding

    # 儲存到快取
    cache.set(text, model, embedding)

    return embedding
```

### 3. 錯誤處理和重試

```python theme={null}
import time
from openai import OpenAI

def get_embedding_with_retry(text, model="text-embedding-3-small", max_retries=3):
    """帶重試機制的向量獲取"""
    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    for attempt in range(max_retries):
        try:
            response = client.embeddings.create(
                input=text,
                model=model
            )
            return response.data[0].embedding

        except Exception as e:
            print(f"嘗試 {attempt + 1}/{max_retries} 失敗: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 指數退避
            else:
                raise

    return None
```

### 4. 批處理最佳化

```python theme={null}
def batch_process_large_dataset(texts, batch_size=100, model="text-embedding-3-small"):
    """大數據集批次處理"""
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        print(f"處理批次 {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")

        try:
            response = client.embeddings.create(
                input=batch,
                model=model
            )
            embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(embeddings)

            # 避免速率限制
            time.sleep(0.1)

        except Exception as e:
            print(f"批次處理失敗: {e}")
            # 可以選擇重試或跳過

    return all_embeddings
```

## 🔧 高階技巧

### 1. 多語言支援

```python theme={null}
# OpenAI Embedding 模型天然支援多語言
multilingual_texts = [
    "人工智慧改變世界",           # 中文
    "AI is changing the world",  # 英文
    "L'IA change le monde",      # 法文
    "AIが世界を変える"            # 日文
]

embeddings = batch_get_embeddings(multilingual_texts)

# 可以跨語言計算相似度
sim = cosine_similarity(embeddings[0], embeddings[1])
print(f"中英文相似度: {sim:.4f}")
```

### 2. 維度歸一化

```python theme={null}
import numpy as np

def normalize_embedding(embedding):
    """L2 歸一化"""
    norm = np.linalg.norm(embedding)
    return embedding / norm if norm > 0 else embedding

# 歸一化後可以直接用點積計算餘弦相似度
emb1_normalized = normalize_embedding(embedding1)
emb2_normalized = normalize_embedding(embedding2)
similarity = np.dot(emb1_normalized, emb2_normalized)
```

### 3. 使用不同維度

```python theme={null}
# text-embedding-3-large 支援自定義維度
response = client.embeddings.create(
    input="示例文本",
    model="text-embedding-3-large",
    dimensions=1024  # 可以指定維度，最大 3072
)

# 更小的維度可以節省儲存和計算成本
```

## 📊 效能對比

| 特性   | text-embedding-3-large | text-embedding-3-small | text-embedding-ada-002 |
| ---- | ---------------------- | ---------------------- | ---------------------- |
| 向量維度 | 3072                   | 1536                   | 1536                   |
| 準確度  | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐                   | ⭐⭐⭐                    |
| 速度   | ⭐⭐⭐                    | ⭐⭐⭐⭐⭐                  | ⭐⭐⭐⭐                   |
| 價格   | \$0.13/1M tokens       | \$0.02/1M tokens       | \$0.10/1M tokens       |
| 推薦場景 | 高精度檢索                  | 通用場景                   | 相容舊版                   |

## 💰 成本最佳化建議

1. **選擇合適的模型**
   * 通用場景使用 text-embedding-3-small（最便宜）
   * 高精度需求才使用 text-embedding-3-large

2. **批次處理**
   * 儘量批次傳送請求，減少網路開銷
   * 單次請求最多支援數千條文本

3. **快取策略**
   * 對重複文本使用快取，避免重複計算
   * 儲存向量結果，減少 API 呼叫

4. **文本預處理**
   * 去除無用資訊，減少 token 消耗
   * 合理分塊，避免超長文本

## 🚨 注意事項

1. **文本長度**：單個文本不要超過模型的 token 限制（通常 8191 tokens）
2. **批次限制**：單次請求建議不超過 2048 條文本
3. **速率限制**：注意 API 的速率限制，必要時新增延遲
4. **向量儲存**：合理選擇向量資料庫（如 Pinecone、Milvus、Weaviate）
5. **相似度計算**：推薦使用餘弦相似度，效果最好

## 🔗 相關資源

* [完整程式碼示例](https://github.com/apiyi-api/ai-api-code-samples)
* [API 定價說明](https://api.apiyi.com/account/pricing)
* [向量資料庫選型指南](/wiki/infrastructure/vector-database-selection)

<Note>
  💡 **小貼士**：Embedding 是構建智慧應用的基礎能力。推薦從 text-embedding-3-small 開始，它在效能和成本之間達到了最佳平衡。對於企業級應用，建議結合專業的向量資料庫（如 Pinecone、Milvus）使用。
</Note>
