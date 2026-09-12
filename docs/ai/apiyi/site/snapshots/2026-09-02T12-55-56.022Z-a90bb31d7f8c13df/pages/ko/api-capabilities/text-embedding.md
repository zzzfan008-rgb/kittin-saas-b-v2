> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 텍스트 임베딩 API

> 텍스트를 고차원 벡터로 변환하여 지식 베이스 검색, 의미론적 검색 및 유사도 점수 산출에 사용합니다. OpenAI text-embedding 계열과 오픈소스 다국어 모델 bge-m3를 모두 사용할 수 있습니다.

APIYI는 업계를 선도하는 텍스트 임베딩 기능을 제공하며, OpenAI의 Embedding 모델을 사용해 텍스트를 고차원 벡터 표현으로 변환합니다. 이는 지능형 지식 베이스, 시맨틱 검색, RAG(Retrieval-Augmented Generation) 시스템을 구축하는 핵심 기술이며, 초고동시 실행 수와 매우 낮은 비용을 특징으로 합니다.

<Note>
  **텍스트 임베딩 핵심 기능**
  텍스트를 수치 벡터로 변환하고, 의미 정보를 포착하며, 효율적인 시맨틱 검색, 유사도 계산, 지능형 추천을 가능하게 합니다.
</Note>

## 핵심 기능

* **두 가지 모델 계열**: OpenAI 텍스트 임베딩 시리즈와 오픈소스 다국어 `bge-m3` (1024 차원, 8192 컨텍스트, 100개 이상의 언어)
* **초고동시성**: 대규모 동시 요청을 지원하며, 엔터프라이즈 애플리케이션에 적합합니다
* **매우 낮은 비용**: 종량제 방식이며, 가격은 \$0.01/백만 tokens까지 낮습니다
* **사용하기 쉬움**: OpenAI API 형식과 호환되며, 원활하게 통합됩니다
* **고품질 벡터**: 깊은 의미를 포착하며 높은 검색 정확도를 제공합니다

## 지원되는 임베딩 모델

| 모델명                        | 모델 ID                    | 벡터 차원   | 가격               | 권장 시나리오                 |
| -------------------------- | ------------------------ | ------- | ---------------- | ----------------------- |
| **text-embedding-3-large** | `text-embedding-3-large` | 3072 차원 | \$0.13/1M tokens | 고정밀 의미 검색               |
| **text-embedding-3-small** | `text-embedding-3-small` | 1536 차원 | \$0.02/1M tokens | 일반적인 시나리오, 최고의 비용 대비 성능 |
| **bge-m3** 🆕              | `bge-m3`                 | 1024 차원 | \$0.01/1M tokens | 중국어 및 다국어 지식 베이스, 최저 가격 |
| **text-embedding-ada-002** | `text-embedding-ada-002` | 1536 차원 | \$0.10/1M tokens | 클래식 모델, 호환성이 좋음         |

<Tip>
  **모델 선택 가이드**:

  * **높은 정밀도가 필요한 경우**: text-embedding-3-large를 사용합니다. 전문 지식 베이스, 법률 문서 등에 적합합니다.
  * **일반적인 시나리오**: text-embedding-3-small을 권장합니다. 비용 대비 성능이 가장 좋으며 대부분의 애플리케이션에 적합합니다.
  * **중국어 비중이 높은 지식 베이스**: `bge-m3`를 권장합니다. text-embedding-3-small과 같은 검색 등급이면서 단가의 절반이고, 중국어에서 토큰 효율은 2배 이상 높습니다(약 2.1자/token 대 0.9자/token). 따라서 **동일한 중국어 코퍼스의 비용은 대략 5분의 1 수준**이며, 1024 차원은 1536 대비 저장 공간도 33% 절약합니다.
  * **호환성 우선**: text-embedding-ada-002를 사용합니다. 이전 버전과 완전히 호환됩니다.

  점수 범위는 모델마다 크게 다르므로 **임계값은 모델 간에 그대로 적용할 수 없습니다**. 측정한
  모델 비교, 청크 크기 조정, 임계값 보정, 배치 처리 및 동시 실행 수는
  [실무에서의 임베딩 튜닝](/ko/api-capabilities/embedding-best-practices)에서 다룹니다.
</Tip>

## 빠른 시작

### 1. 가장 간단한 예시 - curl 명령 사용

```bash theme={null}
curl https://api.apiyi.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": "Artificial intelligence is changing the world",
    "model": "text-embedding-3-small"
  }'
```

<Accordion title="응답 예시 보기">
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

### 2. 기본 예시 - OpenAI SDK 사용

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

### 3. 배치 텍스트 벡터화

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

### 4. requests 라이브러리 사용

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

## 일반적인 사용 사례

### 1. 시맨틱 검색 엔진

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

### 2. 벡터 데이터베이스 구축

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

### 3. RAG 시스템

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

## 모범 사례

### 1. 텍스트 전처리

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

### 2. 캐싱 메커니즘

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

### 3. 오류 처리 및 재시도

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

## 성능 비교

| 기능      | text-embedding-3-large | text-embedding-3-small | text-embedding-ada-002 |
| ------- | ---------------------- | ---------------------- | ---------------------- |
| 벡터 차원   | 3072                   | 1536                   | 1536                   |
| 정확도     | 5 stars                | 4 stars                | 3 stars                |
| 속도      | 3 stars                | 5 stars                | 4 stars                |
| 가격      | \$0.13/1M tokens       | \$0.02/1M tokens       | \$0.10/1M tokens       |
| 권장 시나리오 | 고정밀 검색                 | 일반적인 시나리오              | 기존 버전 호환성              |

## 비용 최적화 권장 사항

1. **적절한 모델 선택** - 일반적인 시나리오에는 text-embedding-3-small을 사용합니다(가장 저렴함)
2. **배치 처리** - 네트워크 오버헤드를 줄이기 위해 요청을 배치로 보냅니다
3. **캐싱 전략** - 중복 계산을 피하기 위해 반복되는 텍스트에는 캐시를 사용합니다
4. **텍스트 전처리** - 불필요한 정보를 제거하여 token 소비를 줄입니다

## 중요 참고 사항

1. **텍스트 길이**: 단일 텍스트는 모델의 token 제한을 초과해서는 안 됩니다(보통 8191 tokens입니다)
2. **배치 제한**: 단일 요청은 2048 texts를 초과해서는 안 됩니다
3. **요청 제한**: API 요청 제한에 유의하고, 필요하면 지연을 추가하십시오
4. **벡터 저장소**: 적절한 벡터 데이터베이스를 선택하십시오(예: Pinecone, Milvus, Weaviate)
5. **유사도 계산**: 최상의 결과를 위해 코사인 유사도 사용을 권장합니다

## 관련 자료

* [전체 코드 예제](https://github.com/apiyi-api/ai-api-code-samples)
* [API 가격 정보](https://api.apiyi.com/account/pricing)

<Note>
  **팁**: Embedding은 지능형 애플리케이션을 구축하기 위한 기초 역량입니다. text-embedding-3-small부터 시작할 것을 권장합니다. 이 모델은 성능과 비용의 균형이 가장 좋습니다. 엔터프라이즈 애플리케이션의 경우 전문 벡터 데이터베이스(예: Pinecone, Milvus)와 함께 사용하는 것을 권장합니다.
</Note>
