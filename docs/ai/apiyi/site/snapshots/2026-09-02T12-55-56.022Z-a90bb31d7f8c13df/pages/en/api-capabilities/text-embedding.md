> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text Embedding API

> Convert text into high-dimensional vectors for knowledge base retrieval, semantic search and similarity scoring. Both the OpenAI text-embedding family and the open-source multilingual model bge-m3 are available.

APIYI provides industry-leading text embedding capabilities, using OpenAI's Embedding models to convert text into high-dimensional vector representations. This is the core technology for building intelligent knowledge bases, semantic search, and RAG (Retrieval-Augmented Generation) systems, featuring ultra-high concurrency and extremely low cost.

<Note>
  **Text Embedding Core Capabilities**
  Convert text into numerical vectors, capture semantic information, and enable efficient semantic retrieval, similarity calculation, and intelligent recommendations.
</Note>

## Core Features

* **Two Model Families**: the OpenAI text-embedding series plus the open-source multilingual `bge-m3` (1024 dims, 8192 context, 100+ languages)
* **Ultra-High Concurrency**: Supports large-scale concurrent requests, suitable for enterprise applications
* **Extremely Low Cost**: Pay-as-you-go, prices as low as \$0.01/million tokens
* **Easy to Use**: Compatible with OpenAI API format, seamless integration
* **High-Quality Vectors**: Captures deep semantics with high retrieval accuracy

## Supported Embedding Models

| Model Name                 | Model ID                 | Vector Dimensions | Price            | Recommended Scenarios                                  |
| -------------------------- | ------------------------ | ----------------- | ---------------- | ------------------------------------------------------ |
| **text-embedding-3-large** | `text-embedding-3-large` | 3072 dims         | \$0.13/1M tokens | High-precision semantic retrieval                      |
| **text-embedding-3-small** | `text-embedding-3-small` | 1536 dims         | \$0.02/1M tokens | General scenarios, best cost-performance               |
| **bge-m3** 🆕              | `bge-m3`                 | 1024 dims         | \$0.01/1M tokens | Chinese and multilingual knowledge bases, lowest price |
| **text-embedding-ada-002** | `text-embedding-ada-002` | 1536 dims         | \$0.10/1M tokens | Classic model, good compatibility                      |

<Tip>
  **Model Selection Guide**:

  * **High Precision Needs**: Use text-embedding-3-large, suitable for professional knowledge bases, legal documents, etc.
  * **General Scenarios**: Recommend text-embedding-3-small, best cost-performance, suitable for most applications
  * **Chinese-heavy knowledge bases**: Recommend `bge-m3`. Same retrieval tier as text-embedding-3-small at
    half the unit price, and more than twice as token-efficient on Chinese (about 2.1 chars/token versus 0.9),
    so **the same Chinese corpus costs roughly one fifth as much**; 1024 dims also saves 33% storage against 1536
  * **Compatibility Priority**: Use text-embedding-ada-002, fully compatible with older versions

  Score ranges differ sharply between models, so **thresholds cannot be carried across models**. Measured
  model comparisons, chunk sizing, threshold calibration, batching and concurrency are covered in
  [Embedding Tuning in Practice](/en/api-capabilities/embedding-best-practices).
</Tip>

## Quick Start

### 1. Simplest Example - Using curl Command

```bash theme={null}
curl https://api.apiyi.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": "Artificial intelligence is changing the world",
    "model": "text-embedding-3-small"
  }'
```

<Accordion title="View Response Example">
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

### 2. Basic Example - Using OpenAI SDK

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

### 3. Batch Text Vectorization

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

### 4. Using requests Library

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

## Typical Use Cases

### 1. Semantic Search Engine

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

### 2. Building a Vector Database

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

### 3. RAG System

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

## Best Practices

### 1. Text Preprocessing

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

### 2. Caching Mechanism

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

### 3. Error Handling and Retry

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

## Performance Comparison

| Feature               | text-embedding-3-large   | text-embedding-3-small | text-embedding-ada-002 |
| --------------------- | ------------------------ | ---------------------- | ---------------------- |
| Vector Dimensions     | 3072                     | 1536                   | 1536                   |
| Accuracy              | 5 stars                  | 4 stars                | 3 stars                |
| Speed                 | 3 stars                  | 5 stars                | 4 stars                |
| Price                 | \$0.13/1M tokens         | \$0.02/1M tokens       | \$0.10/1M tokens       |
| Recommended Scenarios | High-precision retrieval | General scenarios      | Legacy compatibility   |

## Cost Optimization Recommendations

1. **Choose the Right Model** - Use text-embedding-3-small for general scenarios (cheapest)
2. **Batch Processing** - Send requests in batches to reduce network overhead
3. **Caching Strategy** - Use cache for repeated texts to avoid redundant computation
4. **Text Preprocessing** - Remove useless information to reduce token consumption

## Important Notes

1. **Text Length**: Single text should not exceed model's token limit (usually 8191 tokens)
2. **Batch Limit**: Single request should not exceed 2048 texts
3. **Rate Limiting**: Be aware of API rate limits, add delays if necessary
4. **Vector Storage**: Choose appropriate vector database (e.g., Pinecone, Milvus, Weaviate)
5. **Similarity Calculation**: Recommend using cosine similarity for best results

## Related Resources

* [Complete Code Examples](https://github.com/apiyi-api/ai-api-code-samples)
* [API Pricing Information](https://api.apiyi.com/account/pricing)

<Note>
  **Pro Tip**: Embedding is the foundational capability for building intelligent applications. Recommend starting with text-embedding-3-small, which achieves the best balance between performance and cost. For enterprise applications, recommend using it with professional vector databases (e.g., Pinecone, Milvus).
</Note>
