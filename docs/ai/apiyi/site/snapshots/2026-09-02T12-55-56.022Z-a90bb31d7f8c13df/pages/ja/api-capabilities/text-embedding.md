> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# テキスト埋め込み API

> テキストを高次元ベクトルに変換し、ナレッジベース検索、セマンティック検索、類似度スコアリングに利用できます。OpenAI の text-embedding ファミリーと、オープンソースの多言語モデル bge-m3 の両方が利用可能です。

APIYIは、OpenAIのEmbeddingモデルを使用してテキストを高次元のベクトル表現に変換する、業界をリードするテキスト埋め込み機能を提供します。これは、インテリジェントな知識ベース、セマンティック検索、RAG (Retrieval-Augmented Generation) システムを構築するための中核技術であり、超高い同時実行数と極めて低コストを特徴とします。

<Note>
  **テキスト埋め込みのコア機能**
  テキストを数値ベクトルに変換し、意味情報を捉え、効率的なセマンティック検索、類似度計算、インテリジェントなレコメンドを可能にします。
</Note>

## 主な機能

* **2つのモデルファミリー**: OpenAI のテキスト埋め込みシリーズに加え、オープンソースの多言語 `bge-m3`（1024 次元、8192 コンテキスト、100+ 言語）
* **超高同時実行数**: 大規模な同時リクエストをサポートし、エンタープライズアプリケーションに適しています
* **非常に低コスト**: 従量課金で、価格は \$0.01/百万 tokens から
* **使いやすい**: OpenAI API 形式に対応しており、シームレスに統合できます
* **高品質ベクター**: 深い意味論を捉え、高い検索精度を実現します

## 対応 Embedding モデル

| モデル名                       | モデルID                    | ベクトル次元 | 価格               | 推奨シナリオ                 |
| -------------------------- | ------------------------ | ------ | ---------------- | ---------------------- |
| **text-embedding-3-large** | `text-embedding-3-large` | 3072次元 | \$0.13/1M tokens | 高精度な意味検索               |
| **text-embedding-3-small** | `text-embedding-3-small` | 1536次元 | \$0.02/1M tokens | 一般的なシナリオ、最良のコストパフォーマンス |
| **bge-m3** 🆕              | `bge-m3`                 | 1024次元 | \$0.01/1M tokens | 中国語および多言語のナレッジベース、最安値  |
| **text-embedding-ada-002** | `text-embedding-ada-002` | 1536次元 | \$0.10/1M tokens | 従来型モデル、互換性が高い          |

<Tip>
  **モデル選定ガイド**:

  * **高精度が必要な場合**: text-embedding-3-large を使用します。専門ナレッジベースや法務文書などに適しています。
  * **一般的なシナリオ**: text-embedding-3-small を推奨します。コストパフォーマンスが最も高く、ほとんどのアプリケーションに適しています
  * **中国語中心のナレッジベース**: `bge-m3` を推奨します。text-embedding-3-small と同等の検索性能で単価は半分、さらに中国語では token 効率が2倍以上高く（約2.1文字/token 対 0.9）、
    **同じ中国語コーパスなら費用はおよそ5分の1** になります。1024次元により、1536次元と比べてストレージも33%節約できます
  * **互換性を優先する場合**: text-embedding-ada-002 を使用します。旧バージョンと完全互換です

  モデルごとにスコア範囲は大きく異なるため、**しきい値をモデル間で流用することはできません**。実測に基づく
  モデル比較、チャンクサイズ設定、しきい値のキャリブレーション、バッチ処理と同時実行数は
  [実践でのEmbeddingチューニング](/ja/api-capabilities/embedding-best-practices) で解説しています。
</Tip>

## クイックスタート

### 1. 最も簡単な例 - curl コマンドを使用

```bash theme={null}
curl https://api.apiyi.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": "Artificial intelligence is changing the world",
    "model": "text-embedding-3-small"
  }'
```

<Accordion title="レスポンス例を見る">
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

### 2. 基本例 - OpenAI SDK を使用

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

def get_embedding(text, model="text-embedding-3-small"):
    """Get vector representation of text"""
    response = client.embeddings.create(
        input=text,
        model=model
    )
    return response.data[0].embedding

# Usage example
text = "Artificial intelligence is changing the world"
embedding = get_embedding(text)

print(f"Vector dimensions: {len(embedding)}")
print(f"First 5 values: {embedding[:5]}")
```

### 3. テキストのバッチベクトル化

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

def batch_get_embeddings(texts, model="text-embedding-3-small"):
    """Batch get text vectors"""
    response = client.embeddings.create(
        input=texts,
        model=model
    )
    return [item.embedding for item in response.data]

# Batch processing
texts = [
    "Machine learning is the core technology of AI",
    "Deep learning drives the development of AI",
    "Natural language processing enables machines to understand human language",
    "Computer vision enables machines to see images"
]

embeddings = batch_get_embeddings(texts)
print(f"Successfully vectorized {len(embeddings)} texts")
```

### 4. requests ライブラリを使用

```python theme={null}
import requests

def get_embedding_with_requests(text, model="text-embedding-3-small"):
    """Get vectors using requests library"""
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
        print(f"Error: {response.status_code} - {response.text}")
        return None

# Usage example
embedding = get_embedding_with_requests("Artificial intelligence technology")
print(f"Vector dimensions: {len(embedding)}")
```

## 代表的なユースケース

### 1. セマンティック検索エンジン

```python theme={null}
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

def cosine_similarity(a, b):
    """Calculate cosine similarity"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def semantic_search(query, documents, top_k=3):
    """Semantic search"""
    # Get query and document vectors
    all_texts = [query] + documents
    response = client.embeddings.create(
        input=all_texts,
        model="text-embedding-3-small"
    )

    embeddings = [item.embedding for item in response.data]
    query_embedding = embeddings[0]
    doc_embeddings = embeddings[1:]

    # Calculate similarity
    similarities = [
        cosine_similarity(query_embedding, doc_emb)
        for doc_emb in doc_embeddings
    ]

    # Sort and return most relevant documents
    ranked_indices = np.argsort(similarities)[::-1][:top_k]

    results = [
        {
            "document": documents[i],
            "similarity": similarities[i]
        }
        for i in ranked_indices
    ]

    return results

# Usage example
documents = [
    "Python is a high-level programming language",
    "Machine learning requires large amounts of data",
    "Deep learning is an important branch of AI",
    "JavaScript is used for web development"
]

query = "artificial intelligence and machine learning"
results = semantic_search(query, documents)

for i, result in enumerate(results, 1):
    print(f"{i}. {result['document']} (similarity: {result['similarity']:.4f})")
```

### 2. ベクトルデータベースの構築

```python theme={null}
import numpy as np
import json
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

class SimpleVectorDB:
    """Simple vector database implementation"""

    def __init__(self, model="text-embedding-3-small"):
        self.model = model
        self.documents = []
        self.embeddings = []

    def add_documents(self, docs):
        """Add documents to vector database"""
        response = client.embeddings.create(
            input=docs,
            model=self.model
        )

        embeddings = [item.embedding for item in response.data]
        self.documents.extend(docs)
        self.embeddings.extend(embeddings)

        print(f"Added {len(docs)} documents to vector database")

    def search(self, query, top_k=5):
        """Search for most relevant documents"""
        response = client.embeddings.create(
            input=query,
            model=self.model
        )
        query_embedding = response.data[0].embedding

        # Calculate similarity
        similarities = []
        for doc_embedding in self.embeddings:
            sim = np.dot(query_embedding, doc_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
            )
            similarities.append(sim)

        # Sort
        ranked_indices = np.argsort(similarities)[::-1][:top_k]

        return [
            {
                "document": self.documents[i],
                "similarity": similarities[i]
            }
            for i in ranked_indices
        ]

# Usage example
db = SimpleVectorDB()

# Add knowledge base documents
knowledge_base = [
    "Machine learning is a technology that enables computers to learn from data",
    "Deep learning uses multi-layer neural networks to process complex patterns",
    "Natural language processing helps computers understand human language",
    "Reinforcement learning trains agents through reward mechanisms"
]

db.add_documents(knowledge_base)

# Search
results = db.search("What is deep learning?", top_k=2)
for result in results:
    print(f"Similarity {result['similarity']:.4f}: {result['document']}")
```

### 3. RAGシステム

```python theme={null}
from openai import OpenAI
import numpy as np

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

class RAGSystem:
    """Simple RAG system implementation"""

    def __init__(self):
        self.knowledge_base = []
        self.embeddings = []

    def add_knowledge(self, documents):
        """Add knowledge to knowledge base"""
        response = client.embeddings.create(
            input=documents,
            model="text-embedding-3-small"
        )

        embeddings = [item.embedding for item in response.data]
        self.knowledge_base.extend(documents)
        self.embeddings.extend(embeddings)

    def retrieve(self, query, top_k=3):
        """Retrieve relevant documents"""
        response = client.embeddings.create(
            input=query,
            model="text-embedding-3-small"
        )
        query_embedding = response.data[0].embedding

        # Calculate similarity
        similarities = [
            np.dot(query_embedding, doc_emb) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_emb)
            )
            for doc_emb in self.embeddings
        ]

        # Get most relevant documents
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [self.knowledge_base[i] for i in top_indices]

    def generate_answer(self, question):
        """Generate answer"""
        relevant_docs = self.retrieve(question, top_k=3)

        context = "\n".join(relevant_docs)
        prompt = f"""Answer the question based on the following knowledge:

Knowledge base content:
{context}

Question: {question}

Please provide an accurate answer based on the above knowledge:"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        return response.choices[0].message.content

# Usage example
rag = RAGSystem()

knowledge = [
    "GPT-4 is a large language model developed by OpenAI with powerful understanding and generation capabilities.",
    "Claude is an AI assistant developed by Anthropic, focusing on safety and helpfulness.",
    "Gemini is a multimodal AI model developed by Google, supporting text, images, and video.",
    "LLaMA is an open-source large language model series developed by Meta."
]

rag.add_knowledge(knowledge)

question = "Who developed GPT-4?"
answer = rag.generate_answer(question)
print(f"Question: {question}")
print(f"Answer: {answer}")
```

## ベストプラクティス

### 1. テキストの前処理

```python theme={null}
import re

def preprocess_text(text):
    """Text preprocessing"""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def chunk_text(text, max_tokens=500, overlap=50):
    """Split long text into chunks"""
    words = text.split()
    chunks = []

    for i in range(0, len(words), max_tokens - overlap):
        chunk = ' '.join(words[i:i + max_tokens])
        chunks.append(chunk)

    return chunks
```

### 2. キャッシュ機構

```python theme={null}
import hashlib
import pickle
import os

class EmbeddingCache:
    """Vector caching system"""

    def __init__(self, cache_dir="./embedding_cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)

    def _get_cache_key(self, text, model):
        """Generate cache key"""
        content = f"{text}_{model}"
        return hashlib.md5(content.encode()).hexdigest()

    def get(self, text, model):
        """Get cached vector"""
        cache_key = self._get_cache_key(text, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.pkl")

        if os.path.exists(cache_file):
            with open(cache_file, 'rb') as f:
                return pickle.load(f)
        return None

    def set(self, text, model, embedding):
        """Save vector to cache"""
        cache_key = self._get_cache_key(text, model)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.pkl")

        with open(cache_file, 'wb') as f:
            pickle.dump(embedding, f)
```

### 3. エラーハンドリングと再試行

```python theme={null}
import time
from openai import OpenAI

def get_embedding_with_retry(text, model="text-embedding-3-small", max_retries=3):
    """Get vector with retry mechanism"""
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
            print(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise

    return None
```

## パフォーマンス比較

| 機能      | text-embedding-3-large | text-embedding-3-small | text-embedding-ada-002 |
| ------- | ---------------------- | ---------------------- | ---------------------- |
| ベクトル次元数 | 3072                   | 1536                   | 1536                   |
| 精度      | 5つ星                    | 4つ星                    | 3つ星                    |
| 速度      | 3つ星                    | 5つ星                    | 4つ星                    |
| 価格      | \$0.13/1M tokens       | \$0.02/1M tokens       | \$0.10/1M tokens       |
| 推奨シナリオ  | 高精度な検索                 | 一般的なシナリオ               | レガシー互換性                |

## コスト最適化の推奨事項

1. **適切なモデルを選ぶ** - 一般的なシナリオでは text-embedding-3-small を使用します（最も安価です）
2. **バッチ処理** - ネットワークのオーバーヘッドを減らすために、リクエストをバッチで送信します
3. **キャッシュ戦略** - 重複するテキストにはキャッシュを使用して、無駄な計算を避けます
4. **テキストの前処理** - 不要な情報を削除して token 消費を抑えます

## 重要な注意事項

1. **テキスト長**: 1つのテキストはモデルの token 上限（通常は 8191 tokens）を超えないようにしてください
2. **バッチ上限**: 1回のリクエストは 2048 texts を超えないようにしてください
3. **レート制限**: API のレート制限に注意し、必要に応じて遅延を追加してください
4. **ベクターストレージ**: 適切なベクターデータベースを選択してください（例: Pinecone、Milvus、Weaviate）
5. **類似度計算**: 最良の結果にはコサイン類似度の使用を推奨します

## 関連リソース

* [完全なコード例](https://github.com/apiyi-api/ai-api-code-samples)
* [API料金情報](https://api.apiyi.com/account/pricing)

<Note>
  **ヒント**: エンベディングは、インテリジェントなアプリケーションを構築するための基盤となる機能です。まずは text-embedding-3-small から始めることをおすすめします。これは、性能とコストのバランスが最も優れています。エンタープライズ向けアプリケーションでは、専用のベクトルデータベース（例: Pinecone、Milvus）と組み合わせて使うことをおすすめします。
</Note>
