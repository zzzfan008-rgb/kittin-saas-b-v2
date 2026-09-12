> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LangChain

> 构建 AI 应用的开发框架集成指南

# LangChain

LangChain 是一个强大的框架，用于开发基于语言模型的应用程序。通过 API易，您可以在 LangChain 中使用各种主流 AI 模型。

## 快速开始

### 安装

```bash theme={null}
pip install langchain langchain-openai
```

### 基础配置

```python theme={null}
import os
from langchain_openai import ChatOpenAI

# 设置环境变量
os.environ["OPENAI_API_KEY"] = "您的API易密钥"
os.environ["OPENAI_BASE_URL"] = "https://api.apiyi.com/v1"

# 初始化模型
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.7
)
```

## 核心功能

### 基础对话

```python theme={null}
from langchain.schema import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="你是一个有帮助的助手"),
    HumanMessage(content="介绍一下 Python 的主要特点")
]

response = llm.invoke(messages)
print(response.content)
```

### 对话链

```python theme={null}
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 创建带记忆的对话链
memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# 多轮对话
conversation.predict(input="我想学习机器学习")
conversation.predict(input="推荐一些入门资源")
```

### 文档问答系统

```python theme={null}
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA

# 配置嵌入模型
embeddings = OpenAIEmbeddings(
    api_key="您的API易密钥",
    base_url="https://api.apiyi.com/v1"
)

# 加载文档
loader = TextLoader("document.txt")
documents = loader.load()

# 分割文本
text_splitter = CharacterTextSplitter(
    chunk_size=1000, 
    chunk_overlap=0
)
texts = text_splitter.split_documents(documents)

# 创建向量存储
vectorstore = FAISS.from_documents(texts, embeddings)

# 创建问答链
qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# 提问
result = qa.run("文档中的关键概念是什么？")
```

## 模型切换

### 使用不同模型

```python theme={null}
# GPT-4
gpt4 = ChatOpenAI(
    model="gpt-4",
    api_key="您的API易密钥",
    base_url="https://api.apiyi.com/v1"
)

# Claude 3
claude = ChatOpenAI(
    model="claude-3-opus-20240229",
    api_key="您的API易密钥", 
    base_url="https://api.apiyi.com/v1"
)

# 比较不同模型的回答
question = "解释量子计算的基本原理"
gpt4_answer = gpt4.invoke([HumanMessage(content=question)])
claude_answer = claude.invoke([HumanMessage(content=question)])
```

## 高级应用

### Agent 系统

```python theme={null}
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool
from langchain import hub

# 定义工具
def get_weather(location: str) -> str:
    """获取天气信息"""
    return f"{location}的天气是晴天，温度25°C"

weather_tool = Tool(
    name="Weather",
    func=get_weather,
    description="获取指定地点的天气信息"
)

# 创建 Agent
prompt = hub.pull("hwchase17/openai-functions-agent")
agent = create_openai_functions_agent(llm, [weather_tool], prompt)
agent_executor = AgentExecutor(agent=agent, tools=[weather_tool])

# 使用 Agent
result = agent_executor.invoke({"input": "北京今天天气怎么样？"})
```

### 批量处理

```python theme={null}
# 批量生成响应
prompts = [
    "解释人工智能",
    "什么是机器学习", 
    "深度学习的应用"
]

responses = llm.batch([
    HumanMessage(content=p) for p in prompts
])

for response in responses:
    print(response.content)
    print("-" * 50)
```

### 流式输出

```python theme={null}
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# 配置流式输出
streaming_llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# 流式生成
streaming_llm.invoke("写一首关于春天的诗")
```

## 错误处理

```python theme={null}
from langchain.callbacks import get_openai_callback

try:
    with get_openai_callback() as cb:
        response = llm.invoke("你好")
        print(f"使用的 Token 数: {cb.total_tokens}")
        print(f"API 调用成本: ${cb.total_cost}")
except Exception as e:
    print(f"发生错误: {e}")
```

## 最佳实践

### 1. 模型选择策略

<Card title="查看场景化模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的场景化模型推荐，包括简单对话、复杂推理、长文本处理、创意写作等全场景的最佳模型选择。
</Card>

<Info>
  **为什么不在此列出具体模型？**

  AI 模型更新迭代速度非常快，为了确保您获取最准确的模型推荐信息，我们统一在 [模型推荐页面](/api-capabilities/model-info) 维护最新的模型列表、性能数据和使用建议。
</Info>

### 2. 成本优化

```python theme={null}
class CostOptimizedLLM:
    def __init__(self):
        self.cheap_model = ChatOpenAI(model="gpt-3.5-turbo")
        self.premium_model = ChatOpenAI(model="gpt-4")
    
    def smart_invoke(self, message, complexity="low"):
        model = self.premium_model if complexity == "high" else self.cheap_model
        return model.invoke(message)
```

### 3. 缓存策略

```python theme={null}
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache

# 启用缓存
set_llm_cache(InMemoryCache())

# 相同请求会使用缓存
response1 = llm.invoke("什么是人工智能？")
response2 = llm.invoke("什么是人工智能？")  # 使用缓存
```

### 4. 异步处理

```python theme={null}
import asyncio
from langchain_openai import AsyncChatOpenAI

async def async_chat():
    async_llm = AsyncChatOpenAI(
        model="gpt-3.5-turbo",
        api_key="您的API易密钥",
        base_url="https://api.apiyi.com/v1"
    )
    
    response = await async_llm.ainvoke("异步生成的内容")
    return response.content

# 运行异步函数
result = asyncio.run(async_chat())
```

## 复杂应用示例

### 多模态 RAG 系统

```python theme={null}
class MultiModalRAG:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o")  # 支持图像
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = None
    
    def add_documents(self, documents):
        """添加文档到知识库"""
        texts = self.text_splitter.split_documents(documents)
        self.vectorstore = FAISS.from_documents(texts, self.embeddings)
    
    def query_with_image(self, question, image_url):
        """支持图像的查询"""
        context = self.vectorstore.similarity_search(question, k=3)
        
        messages = [
            {"role": "system", "content": "基于提供的文档回答问题"},
            {"role": "user", "content": [
                {"type": "text", "text": f"问题: {question}\n\n上下文: {context}"},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]}
        ]
        
        return self.llm.invoke(messages)
```

### 智能工作流

```python theme={null}
from langchain.schema.runnable import RunnableLambda, RunnableSequence

def classify_intent(query):
    """意图分类"""
    classifier = ChatOpenAI(model="gpt-3.5-turbo")
    result = classifier.invoke(f"将以下查询分类为：问答、创作、分析、其他\n\n{query}")
    return result.content.strip()

def route_to_specialist(intent_and_query):
    """路由到专门的处理器"""
    intent, query = intent_and_query
    
    if "问答" in intent:
        model = ChatOpenAI(model="gpt-3.5-turbo")
    elif "创作" in intent:
        model = ChatOpenAI(model="claude-3-sonnet")
    elif "分析" in intent:
        model = ChatOpenAI(model="gpt-4")
    else:
        model = ChatOpenAI(model="gpt-3.5-turbo")
    
    return model.invoke(query)

# 创建工作流
workflow = RunnableSequence(
    RunnableLambda(lambda x: (classify_intent(x), x)),
    RunnableLambda(route_to_specialist)
)

# 使用工作流
result = workflow.invoke("帮我分析这个季度的销售数据")
```

## 性能监控

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
            print(f"LLM调用失败: {e}")
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"LLM调用 - 成功: {success}, 耗时: {duration:.2f}s")
        return result
    
    return wrapper

@monitor_llm_calls
def safe_llm_call(llm, message):
    return llm.invoke(message)
```

## 部署建议

### 1. 生产环境配置

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
            # 记录错误日志
            print(f"LLM错误: {e}")
            return "抱歉，服务暂时不可用"
```

### 2. 容错机制

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
                    time.sleep(delay * (2 ** attempt))  # 指数退避
            return wrapper
    return decorator

@retry_llm_call(max_retries=3)
def robust_llm_call(llm, message):
    return llm.invoke(message)
```

需要更多帮助？请查看 [详细集成文档](/scenarios/engineering/langchain)。
