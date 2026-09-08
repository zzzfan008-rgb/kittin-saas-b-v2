> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LangChain

> AI 애플리케이션 구축용 개발 프레임워크 통합 가이드

LangChain은 언어 모델을 기반으로 애플리케이션을 개발하기 위한 강력한 프레임워크입니다. APIYI를 통해 LangChain에서 다양한 주류 AI 모델을 사용할 수 있습니다.

## 빠른 시작

### 설치

```bash theme={null}
pip install langchain langchain-openai
```

### 기본 설정

```python theme={null}
import os
from langchain_openai import ChatOpenAI

# Set environment variables
os.environ["OPENAI_API_KEY"] = "Your APIYI key"
os.environ["OPENAI_BASE_URL"] = "https://api.apiyi.com/v1"

# Initialize model
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.7
)
```

## 핵심 기능

### 기본 대화

```python theme={null}
from langchain.schema import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are a helpful assistant"),
    HumanMessage(content="Introduce the main features of Python")
]

response = llm.invoke(messages)
print(response.content)
```

### 대화 체인

```python theme={null}
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# Create conversation chain with memory
memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# Multi-turn conversation
conversation.predict(input="I want to learn machine learning")
conversation.predict(input="Recommend some introductory resources")
```

### 문서 Q\&A 시스템

```python theme={null}
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA

# Configure embedding model
embeddings = OpenAIEmbeddings(
    api_key="Your APIYI key",
    base_url="https://api.apiyi.com/v1"
)

# Load documents
loader = TextLoader("document.txt")
documents = loader.load()

# Split text
text_splitter = CharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=0
)
texts = text_splitter.split_documents(documents)

# Create vector store
vectorstore = FAISS.from_documents(texts, embeddings)

# Create Q&A chain
qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# Ask question
result = qa.run("What are the key concepts in the document?")
```

## 모델 전환

### 다른 모델 사용

```python theme={null}
# GPT-4
gpt4 = ChatOpenAI(
    model="gpt-4",
    api_key="Your APIYI key",
    base_url="https://api.apiyi.com/v1"
)

# Claude 3
claude = ChatOpenAI(
    model="claude-3-opus-20240229",
    api_key="Your APIYI key",
    base_url="https://api.apiyi.com/v1"
)

# Compare answers from different models
question = "Explain the basic principles of quantum computing"
gpt4_answer = gpt4.invoke([HumanMessage(content=question)])
claude_answer = claude.invoke([HumanMessage(content=question)])
```

## 고급 활용 사례

### 에이전트 시스템

```python theme={null}
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool
from langchain import hub

# Define tools
def get_weather(location: str) -> str:
    """Get weather information"""
    return f"The weather in {location} is sunny, temperature 25°C"

weather_tool = Tool(
    name="Weather",
    func=get_weather,
    description="Get weather information for a specified location"
)

# Create Agent
prompt = hub.pull("hwchase17/openai-functions-agent")
agent = create_openai_functions_agent(llm, [weather_tool], prompt)
agent_executor = AgentExecutor(agent=agent, tools=[weather_tool])

# Use Agent
result = agent_executor.invoke({"input": "What's the weather like in Beijing today?"})
```

### 배치 처리

```python theme={null}
# Batch generate responses
prompts = [
    "Explain artificial intelligence",
    "What is machine learning",
    "Applications of deep learning"
]

responses = llm.batch([
    HumanMessage(content=p) for p in prompts
])

for response in responses:
    print(response.content)
    print("-" * 50)
```

### 스트리밍 출력

```python theme={null}
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# Configure streaming output
streaming_llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# Stream generation
streaming_llm.invoke("Write a poem about spring")
```

## 오류 처리

```python theme={null}
from langchain.callbacks import get_openai_callback

try:
    with get_openai_callback() as cb:
        response = llm.invoke("Hello")
        print(f"Tokens used: {cb.total_tokens}")
        print(f"API call cost: ${cb.total_cost}")
except Exception as e:
    print(f"Error occurred: {e}")
```

## 모범 사례

### 1. 모델 선택 전략

| 작업 유형   | 권장 모델           | 이유         |
| ------- | --------------- | ---------- |
| 간단한 대화  | gpt-3.5-turbo   | 빠르고 경제적입니다 |
| 복잡한 추론  | gpt-4           | 높은 정확도     |
| 긴 텍스트   | claude-3-opus   | 긴 컨텍스트     |
| 창의적 글쓰기 | claude-3-sonnet | 뛰어난 창의성    |

### 2. 비용 최적화

```python theme={null}
class CostOptimizedLLM:
    def __init__(self):
        self.cheap_model = ChatOpenAI(model="gpt-3.5-turbo")
        self.premium_model = ChatOpenAI(model="gpt-4")

    def smart_invoke(self, message, complexity="low"):
        model = self.premium_model if complexity == "high" else self.cheap_model
        return model.invoke(message)
```

### 3. 캐싱 전략

```python theme={null}
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

# Enable caching
set_llm_cache(InMemoryCache())

# Same requests will use cache
response1 = llm.invoke("What is artificial intelligence?")
response2 = llm.invoke("What is artificial intelligence?")  # Uses cache
```

### 4. 비동기 처리

```python theme={null}
import asyncio
from langchain_openai import AsyncChatOpenAI

async def async_chat():
    async_llm = AsyncChatOpenAI(
        model="gpt-3.5-turbo",
        api_key="Your APIYI key",
        base_url="https://api.apiyi.com/v1"
    )

    response = await async_llm.ainvoke("Async generated content")
    return response.content

# Run async function
result = asyncio.run(async_chat())
```

## 복합 애플리케이션 예시

### 멀티모달 RAG 시스템

```python theme={null}
class MultiModalRAG:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o")  # Supports images
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = None

    def add_documents(self, documents):
        """Add documents to knowledge base"""
        texts = self.text_splitter.split_documents(documents)
        self.vectorstore = FAISS.from_documents(texts, self.embeddings)

    def query_with_image(self, question, image_url):
        """Query with image support"""
        context = self.vectorstore.similarity_search(question, k=3)

        messages = [
            {"role": "system", "content": "Answer questions based on provided documents"},
            {"role": "user", "content": [
                {"type": "text", "text": f"Question: {question}\n\nContext: {context}"},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]}
        ]

        return self.llm.invoke(messages)
```

### 지능형 워크플로

```python theme={null}
from langchain.schema.runnable import RunnableLambda, RunnableSequence

def classify_intent(query):
    """Intent classification"""
    classifier = ChatOpenAI(model="gpt-3.5-turbo")
    result = classifier.invoke(f"Classify the following query as: Q&A, Creation, Analysis, Other\n\n{query}")
    return result.content.strip()

def route_to_specialist(intent_and_query):
    """Route to specialized processor"""
    intent, query = intent_and_query

    if "Q&A" in intent:
        model = ChatOpenAI(model="gpt-3.5-turbo")
    elif "Creation" in intent:
        model = ChatOpenAI(model="claude-3-sonnet")
    elif "Analysis" in intent:
        model = ChatOpenAI(model="gpt-4")
    else:
        model = ChatOpenAI(model="gpt-3.5-turbo")

    return model.invoke(query)

# Create workflow
workflow = RunnableSequence(
    RunnableLambda(lambda x: (classify_intent(x), x)),
    RunnableLambda(route_to_specialist)
)

# Use workflow
result = workflow.invoke("Help me analyze this quarter's sales data")
```

## 성능 모니터링

```python theme={null}
import time
from functools import wraps

def monitor_llm_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            success = True
        except Exception as e:
            result = None
            success = False
            print(f"LLM call failed: {e}")

        end_time = time.time()
        duration = end_time - start_time

        print(f"LLM call - Success: {success}, Duration: {duration:.2f}s")
        return result

    return wrapper

@monitor_llm_calls
def safe_llm_call(llm, message):
    return llm.invoke(message)
```

## 배포 권장 사항

### 1. 운영 환경 구성

```python theme={null}
import os
from langchain_openai import ChatOpenAI

class ProductionLLM:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=os.getenv("LLM_MODEL", "gpt-3.5-turbo"),
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.7")),
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "1000")),
            request_timeout=int(os.getenv("LLM_REQUEST_TIMEOUT", "60"))
        )

    def chat(self, message):
        try:
            return self.llm.invoke(message)
        except Exception as e:
            # Log error
            print(f"LLM error: {e}")
            return "Sorry, service temporarily unavailable"
```

### 2. 장애 허용성

```python theme={null}
def retry_llm_call(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    time.sleep(delay * (2 ** attempt))  # Exponential backoff
            return wrapper
    return decorator

@retry_llm_call(max_retries=3)
def robust_llm_call(llm, message):
    return llm.invoke(message)
```

더 도움이 필요하십니까? [상세 통합 문서](/ko/scenarios/engineering/langchain)를 확인해 주십시오.
