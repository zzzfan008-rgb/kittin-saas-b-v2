> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文本生成（对话补全）

> 使用大语言模型进行对话补全，支持单轮对话、多轮对话、角色扮演等多种文本生成场景

## 功能概述

文本生成（Chat Completions）是 API易平台最核心的能力之一，支持调用 400+ 热门 AI 大模型进行智能对话和文本生成。通过统一的 OpenAI 兼容接口，你可以轻松实现：

* **智能对话**：构建聊天机器人、虚拟助手
* **内容创作**：文章写作、创意生成、文案润色
* **代码辅助**：代码生成、调试、重构建议
* **知识问答**：回答问题、知识检索、信息提取
* **角色扮演**：定制化 AI 角色、场景模拟

<Info>
  支持 OpenAI GPT-4、Claude、Gemini、DeepSeek、Qwen 等 400+ 主流大模型，一个 API Key 调用所有模型。
</Info>

## 快速开始

### 基础对话示例

使用 Chat Completions API 进行简单的单轮对话：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "介绍一下人工智能的发展历程"}
    ]
)

print(response.choices[0].message.content)
```

### 多轮对话示例

通过 `messages` 数组维护对话历史，实现上下文连贯的多轮对话：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

messages = [
    {"role": "system", "content": "你是一个专业的 Python 编程助手"},
    {"role": "user", "content": "如何读取 CSV 文件？"},
    {"role": "assistant", "content": "可以使用 pandas 库的 read_csv() 函数..."},
    {"role": "user", "content": "那如何过滤特定列的数据？"}
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)

print(response.choices[0].message.content)
```

## 核心参数详解

### model（必填）

指定要使用的模型名称，详见 [模型信息](/api-capabilities/model-info) 页面。

```python theme={null}
model="gpt-4o"  # GPT-4 Omni
model="claude-sonnet-4.5"  # Claude Sonnet 4.5
model="gemini-3-pro-preview"  # Gemini 3 Pro
model="deepseek-chat"  # DeepSeek Chat
```

### messages（必填）

对话消息数组，每条消息包含 `role` 和 `content` 字段：

<CardGroup cols={3}>
  <Card title="system" icon="settings">
    系统提示，定义 AI 的行为和角色
  </Card>

  <Card title="user" icon="user">
    用户消息，代表用户的输入
  </Card>

  <Card title="assistant" icon="bot">
    助手消息，代表 AI 的回复
  </Card>
</CardGroup>

```python theme={null}
messages = [
    {"role": "system", "content": "你是一个友好的客服助手"},
    {"role": "user", "content": "我想咨询退款问题"},
    {"role": "assistant", "content": "好的，请问您遇到了什么问题？"},
    {"role": "user", "content": "商品有质量问题"}
]
```

### temperature（可选）

控制输出的随机性，范围 `0.0 ~ 2.0`，默认 `1.0`：

* **0.0 \~ 0.3**：输出更确定、一致，适合事实性任务（翻译、总结、代码生成）
* **0.7 \~ 1.0**：平衡创造性和准确性，适合日常对话
* **1.0 \~ 2.0**：输出更有创意、多样性，适合创意写作、头脑风暴

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "写一首关于春天的诗"}],
    temperature=1.2  # 提高创造性
)
```

### max\_tokens（可选）

限制生成的最大 token 数量，用于控制成本和响应长度：

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "用一句话介绍 AI"}],
    max_tokens=50  # 限制输出长度
)
```

<Warning>
  不同模型的 token 计费标准不同，详见 [定价说明](/pricing) 页面。
</Warning>

### top\_p（可选）

核采样参数，范围 `0.0 ~ 1.0`，控制输出的多样性：

* 较低的值（如 `0.5`）：输出更聚焦、确定
* 较高的值（如 `0.9`）：输出更多样、随机

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "推荐一些科幻电影"}],
    top_p=0.8
)
```

<Info>
  通常建议只调整 `temperature` 或 `top_p` 其中之一，避免同时使用。
</Info>

### stream（可选）

启用流式输出，逐 token 返回结果，提升用户体验：

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "写一篇关于人工智能的文章"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

详见 [流式输出](/wiki/applications/streaming-output) 文档。

## 高级用法

### 系统提示（System Prompt）

通过 `system` 角色定义 AI 的行为、角色、知识范围和回复风格：

```python theme={null}
messages = [
    {
        "role": "system",
        "content": """你是一个专业的法律顾问助手。

规则：
1. 提供准确、专业的法律建议
2. 使用通俗易懂的语言解释法律术语
3. 必要时引用相关法律条文
4. 避免给出绝对性的结论，建议咨询专业律师
5. 保持中立、客观的立场"""
    },
    {"role": "user", "content": "请问劳动合同可以随时解除吗？"}
]
```

### 角色扮演

创建具有特定性格和专业领域的 AI 助手：

```python theme={null}
messages = [
    {
        "role": "system",
        "content": "你是一位资深的 Python 开发者，拥有 10 年经验。你擅长用简洁的代码解决问题，喜欢使用 Pythonic 的写法，并且会主动指出代码中的潜在问题。"
    },
    {"role": "user", "content": "帮我写一个快速排序算法"}
]
```

### 上下文管理

对于长对话，需要合理管理上下文长度，避免超过模型的 token 限制：

```python theme={null}
def manage_context(messages, max_history=10):
    """保留最近的对话历史"""
    # 保留 system 消息
    system_messages = [m for m in messages if m["role"] == "system"]
    # 保留最近的 N 条对话
    recent_messages = messages[-max_history:]

    return system_messages + recent_messages

# 使用示例
messages = manage_context(messages, max_history=10)
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)
```

### JSON 模式输出

某些模型支持强制输出 JSON 格式：

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个数据提取助手，始终以 JSON 格式返回结果"},
        {"role": "user", "content": "提取这段文本的关键信息：张三，男，30岁，软件工程师"}
    ],
    response_format={"type": "json_object"}
)

import json
result = json.loads(response.choices[0].message.content)
print(result)
```

## 最佳实践

### 1. 选择合适的模型

根据任务需求选择性价比最优的模型：

| 任务类型  | 推荐模型                                            | 说明       |
| ----- | ----------------------------------------------- | -------- |
| 日常对话  | gpt-4o-mini, deepseek-chat                      | 成本低，响应快  |
| 复杂推理  | gpt-4o, claude-sonnet-4.5, gemini-3-pro-preview | 能力强，准确度高 |
| 代码生成  | gpt-4o, deepseek-coder, claude-sonnet-4.5       | 专业性强     |
| 创意写作  | claude-sonnet-4.5, gpt-4o                       | 文笔流畅     |
| 多语言翻译 | gemini-3-pro-preview, gpt-4o                    | 支持语言多    |

### 2. 优化提示词（Prompt）

好的提示词能显著提升输出质量：

<CardGroup cols={2}>
  <Card title="明确任务" icon="check">
    清楚说明需要 AI 做什么，提供必要的上下文
  </Card>

  <Card title="指定格式" icon="list">
    明确输出格式、长度、语气等要求
  </Card>

  <Card title="提供示例" icon="lightbulb">
    给出输入输出示例，帮助 AI 理解期望
  </Card>

  <Card title="分步引导" icon="list-ordered">
    复杂任务拆分成多个步骤，逐步完成
  </Card>
</CardGroup>

```python theme={null}
# ❌ 不好的提示词
"写一篇文章"

# ✅ 好的提示词
"""请写一篇关于人工智能在医疗领域应用的科普文章。

要求：
- 长度：800-1000 字
- 受众：普通读者
- 结构：引言、应用场景、案例分析、未来展望
- 语气：专业但易懂
- 包含 2-3 个真实案例"""
```

### 3. 控制成本

合理使用参数降低 API 调用成本：

```python theme={null}
# 设置 max_tokens 限制输出长度
response = client.chat.completions.create(
    model="gpt-4o-mini",  # 使用性价比更高的模型
    messages=messages,
    max_tokens=500,  # 限制最大输出
    temperature=0.7
)

{/* 定期清理对话历史 */}
if len(messages) > 20:
    messages = messages[-10:]  # 只保留最近 10 条
```

### 4. 错误处理

添加异常处理，提升应用稳定性：

```python theme={null}
from openai import OpenAI, OpenAIError
import time

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def chat_with_retry(messages, max_retries=3):
    """带重试机制的聊天函数"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            return response.choices[0].message.content
        except OpenAIError as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 指数退避
                continue
            else:
                raise

# 使用示例
try:
    result = chat_with_retry(messages)
    print(result)
except OpenAIError as e:
    print(f"API 调用失败：{e}")
```

详见 [错误处理](/wiki/applications/error-handling) 文档。

### 5. 使用流式输出

对于长文本生成，建议使用流式输出提升用户体验：

```python theme={null}
def stream_chat(messages):
    """流式输出示例"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True
    )

    full_response = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)
            full_response += content

    return full_response
```

## 常见问题

### 如何计算 token 数量？

不同模型的 tokenizer 不同，建议使用 `tiktoken` 库估算：

```python theme={null}
import tiktoken

def count_tokens(text, model="gpt-4o"):
    """估算文本的 token 数量"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# 使用示例
text = "你好，世界！"
tokens = count_tokens(text)
print(f"Token 数量：{tokens}")
```

### 为什么输出被截断了？

可能的原因：

1. 达到了 `max_tokens` 限制
2. 模型的上下文窗口不足
3. 触发了内容安全策略

解决方法：

* 增加 `max_tokens` 参数
* 选择支持更长上下文的模型
* 检查 `finish_reason` 字段判断原因

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    max_tokens=2000  # 增加输出长度限制
)

finish_reason = response.choices[0].finish_reason
if finish_reason == "length":
    print("输出因长度限制被截断")
elif finish_reason == "content_filter":
    print("输出因内容安全被过滤")
```

### 如何实现对话记忆？

在应用层维护对话历史：

```python theme={null}
class ChatSession:
    def __init__(self, system_prompt=""):
        self.messages = []
        if system_prompt:
            self.messages.append({"role": "system", "content": system_prompt})

    def chat(self, user_message):
        """发送消息并记录对话"""
        self.messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=self.messages
        )

        assistant_message = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": assistant_message})

        return assistant_message

# 使用示例
session = ChatSession(system_prompt="你是一个友好的助手")
print(session.chat("你好"))
print(session.chat("我刚才说了什么？"))  # AI 可以记住上下文
```

## 相关文档

<CardGroup cols={2}>
  <Card title="模型信息" icon="database" href="/api-capabilities/model-info">
    查看支持的所有模型及定价
  </Card>

  <Card title="文本嵌入" icon="vector-square" href="/api-capabilities/text-embedding">
    将文本转换为向量表示
  </Card>

  <Card title="流式输出" icon="zap" href="/wiki/applications/streaming-output">
    实现打字机效果的流式响应
  </Card>

  <Card title="错误处理" icon="triangle-alert" href="/wiki/applications/error-handling">
    处理 API 调用异常
  </Card>
</CardGroup>
