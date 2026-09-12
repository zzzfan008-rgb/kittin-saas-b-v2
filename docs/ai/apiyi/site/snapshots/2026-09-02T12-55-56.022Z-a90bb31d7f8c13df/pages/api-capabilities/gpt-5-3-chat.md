> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.3 Chat 文本生成

> OpenAI 最新 GPT-5.3 Instant 聊天模型，400K 上下文窗口，幻觉率降低 26.8%，官方直连稳定可靠

GPT-5.3-chat-latest 是 OpenAI 于 2026 年 3 月 3 日发布的最新聊天模型，即 ChatGPT 中使用的 GPT-5.3 Instant。相比前代模型，它在准确性、上下文理解和对话流畅度上均有显著提升。API易通过**官方直连**通道接入，确保稳定可靠。

<Info>
  **API易已接入 GPT-5.3-chat-latest**，官方直连通道，支持 OpenAI 兼容格式调用，即插即用。
</Info>

## 核心优势

<CardGroup cols={2}>
  <Card title="超大上下文" icon="scroll">
    400K token 上下文窗口，是前代的 3 倍，轻松处理超长文档
  </Card>

  <Card title="更低幻觉率" icon="shield-check">
    幻觉率降低 26.8%（联网搜索场景），19.7%（纯知识场景）
  </Card>

  <Card title="更自然对话" icon="message-circle">
    减少不必要的拒绝和说教式回复，对话风格更流畅自然
  </Card>

  <Card title="官方直连" icon="server">
    OpenAI 官方 API 透明转发，稳定性和质量与官方一致
  </Card>
</CardGroup>

## 模型信息

| 参数        | 值                     |
| --------- | --------------------- |
| **模型名称**  | `gpt-5.3-chat-latest` |
| **上下文窗口** | 128,000 tokens        |
| **最大输出**  | 16,384 tokens         |
| **知识截止**  | 2025 年 8 月 31 日       |
| **输入格式**  | 文本 + 图像               |
| **输出格式**  | 文本                    |
| **流式输出**  | ✅ 支持                  |
| **函数调用**  | ✅ 支持                  |
| **结构化输出** | ✅ 支持                  |

## 定价

| 项目   | 价格（每百万 tokens） |
| ---- | -------------- |
| 输入   | \$1.75         |
| 缓存输入 | \$0.175        |
| 输出   | \$14.00        |

<Info>
  价格与 OpenAI 官方一致，充值加赠后更优惠。详见 [定价说明](/pricing)。
</Info>

## 调用方式

### 端点地址

```
https://api.apiyi.com/v1/chat/completions
```

### 基础调用

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-5.3-chat-latest",
      "messages": [
        {"role": "user", "content": "你好，请介绍一下你的能力"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gpt-5.3-chat-latest",
      messages=[
          {"role": "user", "content": "你好，请介绍一下你的能力"}
      ]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.chat.completions.create({
    model: 'gpt-5.3-chat-latest',
    messages: [
      { role: 'user', content: '你好，请介绍一下你的能力' }
    ]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### 流式输出

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-5.3-chat-latest",
    messages=[
        {"role": "user", "content": "写一篇关于人工智能未来的短文"}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 多模态输入（图像理解）

GPT-5.3-chat-latest 支持图像输入，可以理解和分析图片内容：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-5.3-chat-latest",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "描述这张图片的内容"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.png"
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

### 函数调用

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称"
                    }
                },
                "required": ["city"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-5.3-chat-latest",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message)
```

## 与其他 GPT 模型对比

| 特性    | GPT-5.3 Chat | GPT-5.2   | GPT-5     |
| ----- | ------------ | --------- | --------- |
| 上下文窗口 | 128K         | 128K      | 400K      |
| 最大输出  | 16K          | 16K       | 128K      |
| 输入价格  | \$1.75/M     | \$1.75/M  | \$1.25/M  |
| 输出价格  | \$14.00/M    | \$14.00/M | \$10.00/M |
| 幻觉率改进 | ✅ 26.8% 降低   | -         | -         |
| 对话自然度 | ✅ 显著提升       | 良好        | 良好        |
| 图像输入  | ✅            | ✅         | ✅         |
| 函数调用  | ✅            | ✅         | ✅         |

## 常见问题

<AccordionGroup>
  <Accordion title="GPT-5.3-chat-latest 和 GPT-5.2 有什么区别？">
    GPT-5.3 Chat 是 ChatGPT 中使用的最新 Instant 模型。相比 GPT-5.2，它的幻觉率降低了 26.8%（联网场景），对话风格更自然，减少了不必要的拒绝和说教式回复。
  </Accordion>

  <Accordion title="这个模型适合哪些场景？">
    GPT-5.3 Chat 特别适合日常对话、客服助手、内容创作、知识问答等需要自然流畅对话体验的场景。对于编程任务，建议使用 GPT-5.3-Codex 模型。
  </Accordion>

  <Accordion title="支持图像输入吗？">
    是的，GPT-5.3-chat-latest 支持文本和图像输入，可以理解和分析图片内容。但不支持音频和视频输入。
  </Accordion>

  <Accordion title="最大输出长度是多少？">
    最大输出为 16,384 tokens。如果输出被截断，可以通过检查 `finish_reason` 字段判断原因，并适当调整 `max_tokens` 参数。
  </Accordion>

  <Accordion title="如何使用缓存输入降低成本？">
    当你的请求中包含大量重复的前缀内容（如 system prompt）时，OpenAI 会自动缓存这些内容，缓存命中的输入按 \$0.175/M tokens 计费，仅为正常输入价格的 1/10。
  </Accordion>

  <Accordion title="API易的 GPT-5.3 Chat 是官方直连吗？">
    是的，API易通过 OpenAI 官方 API 透明转发，确保与官方完全一致的服务质量和稳定性。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="文本生成通用指南" icon="book" href="/api-capabilities/text-generation">
    查看 Chat Completions API 的完整使用指南
  </Card>

  <Card title="模型信息" icon="database" href="/api-capabilities/model-info">
    查看所有可用模型及定价
  </Card>

  <Card title="OpenAI 兼容模式调用" icon="code" href="/api-capabilities/openai/compatible">
    OpenAI SDK 配置和调用教程
  </Card>

  <Card title="使用场景" icon="layers" href="/scenarios">
    查看各种使用场景配置
  </Card>
</CardGroup>
