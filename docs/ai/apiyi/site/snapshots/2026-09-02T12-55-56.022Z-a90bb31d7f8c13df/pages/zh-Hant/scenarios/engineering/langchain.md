> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LangChain

> 構建 AI 應用的開發框架整合指南

# LangChain

LangChain 是一個強大的框架，用於開發基於語言模型的應用程式。通過 API易，您可以在 LangChain 中使用各種主流 AI 模型。

## 快速開始

### 安裝

```bash theme={null}
pip install langchain langchain-openai
```

### 基礎配置

```python theme={null}
import os
from langchain_openai import ChatOpenAI

# 設定環境變數
os.environ["OPENAI_API_KEY"] = "您的API易金鑰"
os.environ["OPENAI_BASE_URL"] = "https://api.apiyi.com/v1"

# 初始化模型
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.7
)
```

## 核心功能

### 基礎對話

```python theme={null}
from langchain.schema import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="你是一個有幫助的助手"),
    HumanMessage(content="介紹一下 Python 的主要特點")
]

response = llm.invoke(messages)
print(response.content)
```

### 對話鏈

```python theme={null}
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 建立帶記憶的對話鏈
memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# 多輪對話
conversation.predict(input="我想學習機器學習")
conversation.predict(input="推薦一些入門資源")
```

### 文件問答系統

```python theme={null}
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA

# 配置嵌入模型
embeddings = OpenAIEmbeddings(
    api_key="您的API易金鑰",
    base_url="https://api.apiyi.com/v1"
)

# 載入文件
loader = TextLoader("document.txt")
documents = loader.load()

# 分割文本
text_splitter = CharacterTextSplitter(
    chunk_size=1000, 
    chunk_overlap=0
)
texts = text_splitter.split_documents(documents)

# 建立向量儲存
vectorstore = FAISS.from_documents(texts, embeddings)

# 建立問答鏈
qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# 提問
result = qa.run("文件中的關鍵概念是什麼？")
```

## 模型切換

### 使用不同模型

```python theme={null}
# GPT-4
gpt4 = ChatOpenAI(
    model="gpt-4",
    api_key="您的API易金鑰",
    base_url="https://api.apiyi.com/v1"
)

# Claude 3
claude = ChatOpenAI(
    model="claude-3-opus-20240229",
    api_key="您的API易金鑰", 
    base_url="https://api.apiyi.com/v1"
)

# 比較不同模型的回答
question = "解釋量子計算的基本原理"
gpt4_answer = gpt4.invoke([HumanMessage(content=question)])
claude_answer = claude.invoke([HumanMessage(content=question)])
```

## 高階應用

### Agent 系統

```python theme={null}
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool
from langchain import hub

# 定義工具
def get_weather(location: str) -> str:
    """獲取天氣資訊"""
    return f"{location}的天氣是晴天，溫度25°C"

weather_tool = Tool(
    name="Weather",
    func=get_weather,
    description="獲取指定地點的天氣資訊"
)

# 建立 Agent
prompt = hub.pull("hwchase17/openai-functions-agent")
agent = create_openai_functions_agent(llm, [weather_tool], prompt)
agent_executor = AgentExecutor(agent=agent, tools=[weather_tool])

# 使用 Agent
result = agent_executor.invoke({"input": "北京今天天氣怎麼樣？"})
```

### 批次處理

```python theme={null}
# 批次生成響應
prompts = [
    "解釋人工智慧",
    "什麼是機器學習", 
    "深度學習的應用"
]

responses = llm.batch([
    HumanMessage(content=p) for p in prompts
])

for response in responses:
    print(response.content)
    print("-" * 50)
```

### 流式輸出

```python theme={null}
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# 配置流式輸出
streaming_llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# 流式生成
streaming_llm.invoke("寫一首關於春天的詩")
```

## 錯誤處理

```python theme={null}
from langchain.callbacks import get_openai_callback

try:
    with get_openai_callback() as cb:
        response = llm.invoke("你好")
        print(f"使用的 Token 數: {cb.total_tokens}")
        print(f"API 呼叫成本: ${cb.total_cost}")
except Exception as e:
    print(f"發生錯誤: {e}")
```

## 最佳實踐

### 1. 模型選擇策略

<Card title="檢視場景化模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的場景化模型推薦，包括簡單對話、複雜推理、長文本處理、創意寫作等全場景的最佳模型選擇。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

### 2. 成本最佳化

```python theme={null}
class CostOptimizedLLM:
    def __init__(self):
        self.cheap_model = ChatOpenAI(model="gpt-3.5-turbo")
        self.premium_model = ChatOpenAI(model="gpt-4")
    
    def smart_invoke(self, message, complexity="low"):
        model = self.premium_model if complexity == "high" else self.cheap_model
        return model.invoke(message)
```

### 3. 快取策略

```python theme={null}
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

# 啟用快取
set_llm_cache(InMemoryCache())

# 相同請求會使用快取
response1 = llm.invoke("什麼是人工智慧？")
response2 = llm.invoke("什麼是人工智慧？")  # 使用快取
```

### 4. 非同步處理

```python theme={null}
import asyncio
from langchain_openai import AsyncChatOpenAI

async def async_chat():
    async_llm = AsyncChatOpenAI(
        model="gpt-3.5-turbo",
        api_key="您的API易金鑰",
        base_url="https://api.apiyi.com/v1"
    )
    
    response = await async_llm.ainvoke("非同步生成的內容")
    return response.content

# 執行非同步函式
result = asyncio.run(async_chat())
```

## 複雜應用示例

### 多模態 RAG 系統

```python theme={null}
class MultiModalRAG:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o")  # 支援影像
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = None
    
    def add_documents(self, documents):
        """新增文件到知識庫"""
        texts = self.text_splitter.split_documents(documents)
        self.vectorstore = FAISS.from_documents(texts, self.embeddings)
    
    def query_with_image(self, question, image_url):
        """支援影像的查詢"""
        context = self.vectorstore.similarity_search(question, k=3)
        
        messages = [
            {"role": "system", "content": "基於提供的文件回答問題"},
            {"role": "user", "content": [
                {"type": "text", "text": f"問題: {question}\n\n上下文: {context}"},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]}
        ]
        
        return self.llm.invoke(messages)
```

### 智慧工作流

```python theme={null}
from langchain.schema.runnable import RunnableLambda, RunnableSequence

def classify_intent(query):
    """意圖分類"""
    classifier = ChatOpenAI(model="gpt-3.5-turbo")
    result = classifier.invoke(f"將以下查詢分類為：問答、創作、分析、其他\n\n{query}")
    return result.content.strip()

def route_to_specialist(intent_and_query):
    """路由到專門的處理器"""
    intent, query = intent_and_query
    
    if "問答" in intent:
        model = ChatOpenAI(model="gpt-3.5-turbo")
    elif "創作" in intent:
        model = ChatOpenAI(model="claude-3-sonnet")
    elif "分析" in intent:
        model = ChatOpenAI(model="gpt-4")
    else:
        model = ChatOpenAI(model="gpt-3.5-turbo")
    
    return model.invoke(query)

# 建立工作流
workflow = RunnableSequence(
    RunnableLambda(lambda x: (classify_intent(x), x)),
    RunnableLambda(route_to_specialist)
)

# 使用工作流
result = workflow.invoke("幫我分析這個季度的銷售資料")
```

## 效能監控

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
            print(f"LLM呼叫失敗: {e}")
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"LLM呼叫 - 成功: {success}, 耗時: {duration:.2f}s")
        return result
    
    return wrapper

@monitor_llm_calls
def safe_llm_call(llm, message):
    return llm.invoke(message)
```

## 部署建議

### 1. 生產環境配置

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
            # 記錄錯誤日誌
            print(f"LLM錯誤: {e}")
            return "抱歉，服務暫時不可用"
```

### 2. 容錯機制

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
                    time.sleep(delay * (2 ** attempt))  # 指數退避
            return wrapper
    return decorator

@retry_llm_call(max_retries=3)
def robust_llm_call(llm, message):
    return llm.invoke(message)
```

需要更多幫助？請檢視 [詳細整合文件](/zh-Hant/scenarios/engineering/langchain)。
