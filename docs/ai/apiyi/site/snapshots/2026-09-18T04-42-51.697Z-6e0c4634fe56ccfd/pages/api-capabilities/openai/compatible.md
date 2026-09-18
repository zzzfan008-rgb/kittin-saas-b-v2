> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Chat Completions 兼容模式调用

> /v1/chat/completions 业界标准端点：各语言 OpenAI SDK 一行 base_url 切换到 API易，同一套代码调用全平台模型。

`/v1/chat/completions` 是大模型行业的事实标准接口 —— 几乎所有框架、客户端、SDK 默认支持它。通过 API易，这一个端点可以统一调用 OpenAI、Claude、Gemini、DeepSeek 等全部 400+ 模型，切换模型只需要换一个字符串。

<Info>
  **怎么选端点**：用现成框架/客户端、或要用同一套代码调多家模型 → 用本页的兼容模式；要内置工具（联网搜索、代码解释器）或调 Pro 系列模型 → 用 [原生调用（/v1/responses）](/api-capabilities/openai/native)。OpenAI 官方对 Chat Completions 的定位是"长期支持，但新项目推荐 Responses"。多轮对话两种端点都需自己维护历史，见 [多轮对话实现指南](/api-capabilities/multi-turn-conversation)。
</Info>

## 快速开始

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [
        {"role": "user", "content": "用一句话介绍你自己"}
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
      model="gpt-5.4",
      messages=[{"role": "user", "content": "用一句话介绍你自己"}]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-5.4',
    messages: [{ role: 'user', content: '用一句话介绍你自己' }]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

## 一个接口调用全平台模型

这是兼容模式最大的价值：**换模型只换字符串，代码一行不动**。

```python theme={null}
def ask(message: str, model: str) -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content

print(ask("解释量子纠缠", "gpt-5.4"))               # OpenAI
print(ask("解释量子纠缠", "claude-sonnet-4-6"))      # Anthropic
print(ask("解释量子纠缠", "gemini-3-pro-preview"))   # Google
print(ask("解释量子纠缠", "deepseek-chat"))          # DeepSeek
```

<Tip>
  各家模型的完整名称和价格见 [模型与价格总览](/api-capabilities/model-info)。注意：用兼容格式调 Claude 时拿不到 Claude 的 Prompt Cache 优惠，深度使用 Claude 请走 [Claude 原生调用](/api-capabilities/claude)。
</Tip>

## 各语言 SDK 配置

所有官方 SDK 都支持自定义 base\_url，配置一次即可。

### Python

```bash theme={null}
pip install openai
```

```python theme={null}
from openai import OpenAI, AsyncOpenAI

# 同步客户端
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# 异步客户端
async_client = AsyncOpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

也可以用环境变量，代码里零配置：

```bash theme={null}
export OPENAI_API_KEY="YOUR_API_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

```python theme={null}
from openai import OpenAI
client = OpenAI()  # 自动读取环境变量
```

### Node.js / TypeScript

```bash theme={null}
npm install openai
```

```typescript theme={null}
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.apiyi.com/v1'
});

const response = await openai.chat.completions.create({
  model: 'gpt-5.4-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
  temperature: 0.7
});
```

### .NET

```bash theme={null}
dotnet add package OpenAI
```

```csharp theme={null}
using OpenAI;
using OpenAI.Chat;

var client = new OpenAIClient(
    new System.ClientModel.ApiKeyCredential("YOUR_API_KEY"),
    new OpenAIClientOptions { Endpoint = new Uri("https://api.apiyi.com/v1") }
);

var chatClient = client.GetChatClient("gpt-5.4");
var response = await chatClient.CompleteChatAsync("Hello!");
Console.WriteLine(response.Value.Content[0].Text);
```

### Go

使用 OpenAI 官方 Go SDK（`github.com/openai/openai-go`）：

```bash theme={null}
go get github.com/openai/openai-go
```

```go theme={null}
package main

import (
    "context"
    "fmt"

    "github.com/openai/openai-go"
    "github.com/openai/openai-go/option"
)

func main() {
    client := openai.NewClient(
        option.WithAPIKey("YOUR_API_KEY"),
        option.WithBaseURL("https://api.apiyi.com/v1"),
    )

    completion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
        Model: "gpt-5.4",
        Messages: []openai.ChatCompletionMessageParamUnion{
            openai.UserMessage("Hello!"),
        },
    })
    if err != nil {
        panic(err)
    }
    fmt.Println(completion.Choices[0].Message.Content)
}
```

### Java

使用 OpenAI 官方 Java SDK（`com.openai:openai-java`）：

```xml theme={null}
<dependency>
    <groupId>com.openai</groupId>
    <artifactId>openai-java</artifactId>
    <version>LATEST</version>
</dependency>
```

```java theme={null}
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

OpenAIClient client = OpenAIOkHttpClient.builder()
    .apiKey("YOUR_API_KEY")
    .baseUrl("https://api.apiyi.com/v1")
    .build();

ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
    .model("gpt-5.4")
    .addUserMessage("Hello!")
    .build();

ChatCompletion completion = client.chat().completions().create(params);
System.out.println(completion.choices().get(0).message().content().orElse(""));
```

<Note>
  老项目如果还在用第三方库（Go 的 `sashabaranov/go-openai`、Java 的 `theokanning` 系列），改 base\_url 同样能跑通，但建议迁移到上面的官方 SDK —— 第三方库对新模型参数（如 `reasoning_effort`）跟进较慢。
</Note>

## 常用功能

### 流式输出

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "写一首关于秋天的短诗"}],
    stream=True
)

for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### 推理控制

Chat Completions 端点用**顶层** `reasoning_effort` 参数（注意与 Responses 端点的嵌套写法不同）：

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "证明根号2是无理数"}],
    reasoning_effort="high"  # none / low / medium / high / xhigh
)
```

<Warning>
  **GPT-5.4 及之后的模型（含 gpt-5.6 系列）在本端点上 `tools` 与显式的 `reasoning_effort` 可能互斥**：显式传了非 `none` 的 `reasoning_effort` 又携带 `tools` 时会报 400 `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`（`low` / `medium` / `high` / `xhigh` 四档实测都会触发，不传该参数则不触发）。是否触发取决于请求落到哪条上游链路，同一模型可能时灵时不灵。这是 OpenAI 官方限制——需要推理 + 工具调用请改用 [Responses 端点](/api-capabilities/openai/native)，或显式设置 `reasoning_effort="none"`；怎么判断、怎么迁见 [端点选型与迁移](/api-capabilities/openai/responses-migration)。
</Warning>

<Warning>
  gpt-5 系列推理模型在该端点同样**不支持 `temperature` / `top_p`**，传了会报错。
</Warning>

### 图像输入

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "这张图片里有什么？"},
                {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
            ]
        }
    ]
)
```

### Embeddings

```python theme={null}
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="要嵌入的文本内容"
)
embedding = response.data[0].embedding
```

## 错误处理与重试

官方 SDK 内建自动重试（默认 2 次，针对 429 / 5xx / 连接错误），优先用它而不是自己写循环：

```python theme={null}
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,   # 内建指数退避重试
    timeout=60.0
)
```

需要精细处理时按异常类型捕获：

```python theme={null}
from openai import (
    APIError,
    APIConnectionError,
    RateLimitError,
    InternalServerError,
)

try:
    response = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Hello"}]
    )
except RateLimitError:
    print("请求频率超限，稍后重试")
except APIConnectionError:
    print("网络连接错误，检查网络或代理")
except InternalServerError:
    print("上游服务错误，建议重试")
except APIError as e:
    print(f"API 错误：{e}")
```

## 兼容模式的能力边界

| 能力                      | 兼容模式 | 说明                                                                                            |
| ----------------------- | ---- | --------------------------------------------------------------------------------------------- |
| 基础对话 / 流式 / 多模态输入       | ✅    | 完整支持                                                                                          |
| 函数调用（FC）                | ✅    | 见 [FC函数调用](/api-capabilities/openai/function-calling)                                         |
| Prompt 缓存折扣             | ✅    | OpenAI 模型自动生效，见 [缓存计费](/api-capabilities/openai/prompt-caching)                               |
| 内置工具（联网搜索、代码解释器等）       | ❌    | 仅 [原生调用](/api-capabilities/openai/native)                                                     |
| 多轮对话                    | ✅    | 自己维护 `messages` 历史（原生 Responses 同样需自管理，见 [多轮对话指南](/api-capabilities/multi-turn-conversation)） |
| `verbosity` 输出控制        | ❌    | 仅原生调用                                                                                         |
| Pro 系列模型（gpt-5.4-pro 等） | ❌    | 实务上仅原生调用可用                                                                                    |

## 从 OpenAI 官方迁移

已经在用 OpenAI 官方服务的项目，迁移只需两步、代码零改动：

1. **换 base\_url 和 key**

```python theme={null}
# 原来
client = OpenAI(api_key="sk-...")

# 改为
client = OpenAI(
    api_key="YOUR_APIYI_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

2. **或者只改环境变量**（代码完全不动）

```bash theme={null}
export OPENAI_API_KEY="YOUR_APIYI_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

方法调用、参数格式、响应结构全部保持一致。

## 相关链接

* 同组页面：[原生调用](/api-capabilities/openai/native) · [端点选型与迁移](/api-capabilities/openai/responses-migration) · [缓存计费](/api-capabilities/openai/prompt-caching) · [FC函数调用](/api-capabilities/openai/function-calling)
* 模型与价格：[模型与价格总览](/api-capabilities/model-info)
* 获取 / 管理令牌：`https://api.apiyi.com/token`
* OpenAI 官方 SDK 列表：`platform.openai.com/docs/libraries`
