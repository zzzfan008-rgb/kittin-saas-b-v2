> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API векторизации текста

> Преобразуйте текст в высокоразмерные векторы для извлечения данных из базы знаний, семантического поиска и оценки сходства. Доступны как семейство OpenAI text-embedding, так и open-source многоязычная модель bge-m3.

APIYI предоставляет ведущие в отрасли возможности генерации векторных представлений текста, используя модели Embedding от OpenAI для преобразования текста в векторные представления высокой размерности. Это ключевая технология для создания интеллектуальных баз знаний, семантического поиска и систем RAG (генерация с расширением за счет извлечения данных), отличающаяся сверхвысокой параллельностью и чрезвычайно низкой стоимостью.

<Note>
  **Основные возможности Text Embedding**
  Преобразует текст в числовые векторы, извлекает семантическую информацию и обеспечивает эффективный семантический поиск, расчет сходства и интеллектуальные рекомендации.
</Note>

## Основные возможности

* **Две семейства моделей**: серия OpenAI text-embedding плюс открытая многоязычная `bge-m3` (1024 размерности, контекст 8192, более 100 языков)
* **Сверхвысокая параллельность**: поддерживает крупномасштабные параллельные запросы, подходит для корпоративных приложений
* **Чрезвычайно низкая стоимость**: оплата по мере использования, цены от \$0.01/миллион tokens
* **Простота использования**: совместимо с форматом OpenAI API, бесшовная интеграция
* **Векторы высокого качества**: улавливает глубокую семантику с высокой точностью поиска

## Поддерживаемые модели Embedding

| Название модели            | ID модели                | Размерность вектора | Цена             | Рекомендуемые сценарии                                     |
| -------------------------- | ------------------------ | ------------------- | ---------------- | ---------------------------------------------------------- |
| **text-embedding-3-large** | `text-embedding-3-large` | 3072 dims           | \$0.13/1M tokens | Высокоточное семантическое извлечение                      |
| **text-embedding-3-small** | `text-embedding-3-small` | 1536 dims           | \$0.02/1M tokens | Универсальные сценарии, лучшее соотношение цены и качества |
| **bge-m3** 🆕              | `bge-m3`                 | 1024 dims           | \$0.01/1M tokens | Китайские и многоязычные базы знаний, самая низкая цена    |
| **text-embedding-ada-002** | `text-embedding-ada-002` | 1536 dims           | \$0.10/1M tokens | Классическая модель, хорошая совместимость                 |

<Tip>
  **Руководство по выбору модели**:

  * **Потребность в высокой точности**: используйте text-embedding-3-large, подходит для профессиональных баз знаний, юридических документов и т. д.
  * **Универсальные сценарии**: рекомендуем text-embedding-3-small, лучшее соотношение цены и качества, подходит для большинства приложений
  * **Китайскоязычные базы знаний**: рекомендуем `bge-m3`. Тот же уровень извлечения, что и text-embedding-3-small, при
    вдвое меньшей цене за единицу, и более чем вдвое выше эффективность по token на китайском (около 2,1 символа/token против 0,9),
    поэтому **тот же китайский корпус обходится примерно в пять раз дешевле**; 1024 размерности также экономят 33% хранилища по сравнению с 1536
  * **Приоритет совместимости**: используйте text-embedding-ada-002, полностью совместима со старыми версиями

  Диапазоны оценок сильно различаются между моделями, поэтому **пороги нельзя переносить между моделями**. Сравнения
  моделей по результатам измерений, размер фрагментов, калибровка порогов, пакетирование и параллельные запросы рассматриваются в
  [Практическая настройка Embedding](/ru/api-capabilities/embedding-best-practices).
</Tip>

## Быстрый старт

### 1. Самый простой пример — использование команды curl

```bash theme={null}
curl https://api.apiyi.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": "Artificial intelligence is changing the world",
    "model": "text-embedding-3-small"
  }'
```

<Accordion title="Просмотреть пример ответа">
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

### 2. Базовый пример — использование OpenAI SDK

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

### 3. Пакетная векторизация текста

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

### 4. Использование библиотеки requests

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

## Типичные варианты использования

### 1. Семантический поисковый движок

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

### 2. Создание векторной базы данных

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

### 3. Система RAG

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

## Лучшие практики

### 1. Предварительная обработка текста

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

### 2. Механизм кэширования

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

### 3. Обработка ошибок и повторные попытки

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

## Сравнение производительности

| Характеристика         | text-embedding-3-large | text-embedding-3-small | text-embedding-ada-002               |
| ---------------------- | ---------------------- | ---------------------- | ------------------------------------ |
| Размерность вектора    | 3072                   | 1536                   | 1536                                 |
| Точность               | 5 stars                | 4 stars                | 3 stars                              |
| Скорость               | 3 stars                | 5 stars                | 4 stars                              |
| Цена                   | \$0.13/1M tokens       | \$0.02/1M tokens       | \$0.10/1M tokens                     |
| Рекомендуемые сценарии | Высокоточный поиск     | Общие сценарии         | Совместимость с устаревшими версиями |

## Рекомендации по оптимизации затрат

1. **Выберите подходящую модель** - Используйте `text-embedding-3-small` для общих сценариев (самая дешевая)
2. **Пакетная обработка** - Отправляйте запросы пакетами, чтобы снизить сетевые накладные расходы
3. **Стратегия кэширования** - Используйте кэш для повторяющихся текстов, чтобы избежать избыточных вычислений
4. **Предобработка текста** - Удаляйте ненужную информацию, чтобы снизить расход token

## Важные примечания

1. **Длина текста**: отдельный текст не должен превышать лимит token модели (обычно 8191 token)
2. **Ограничение пакета**: один запрос не должен содержать более 2048 текстов
3. **Лимит запросов**: учитывайте лимиты запросов API, при необходимости добавляйте задержки
4. **Векторное хранилище**: выберите подходящую векторную базу данных (например, Pinecone, Milvus, Weaviate)
5. **Вычисление схожести**: для наилучших результатов рекомендуется использовать косинусную схожесть

## Связанные материалы

* [Полные примеры кода](https://github.com/apiyi-api/ai-api-code-samples)
* [Информация о ценах API](https://api.apiyi.com/account/pricing)

<Note>
  **Совет**: Embedding — это базовая возможность для создания интеллектуальных приложений. Рекомендуем начать с `text-embedding-3-small`, который обеспечивает наилучший баланс между производительностью и стоимостью. Для корпоративных приложений рекомендуем использовать его с профессиональными векторными базами данных (например, Pinecone, Milvus).
</Note>
