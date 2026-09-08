> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Chat Completions Compatible Mode

> /v1/chat/completions, the industry-standard endpoint: switch any OpenAI SDK to APIYI with one base_url line and call models from every provider with the same code.

`/v1/chat/completions` is the de facto standard interface of the LLM industry — virtually every framework, client, and SDK supports it out of the box. Through APIYI, this single endpoint reaches OpenAI, Claude, Gemini, DeepSeek, and 400+ models in total; switching models is just swapping a string.

<Info>
  **Which endpoint to pick**: using existing frameworks/clients, or want one codebase across multiple vendors → compatible mode (this page); need built-in tools (web search, code interpreter) or Pro-series models → [Native Calls (/v1/responses)](/en/api-capabilities/openai/native). OpenAI's official stance on Chat Completions: supported long-term, but Responses is recommended for new projects. Both endpoints require you to maintain conversation history yourself — see the [Multi-Turn Conversation Guide](/en/api-capabilities/multi-turn-conversation).
</Info>

## Quick Start

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
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
      messages=[{"role": "user", "content": "Introduce yourself in one sentence"}]
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
    messages: [{ role: 'user', content: 'Introduce yourself in one sentence' }]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

## One Interface, Every Provider

This is the biggest payoff of compatible mode: **switching models means changing a string — not a line of code**.

```python theme={null}
def ask(message: str, model: str) -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content

print(ask("Explain quantum entanglement", "gpt-5.4"))               # OpenAI
print(ask("Explain quantum entanglement", "claude-sonnet-4-6"))      # Anthropic
print(ask("Explain quantum entanglement", "gemini-3-pro-preview"))   # Google
print(ask("Explain quantum entanglement", "deepseek-chat"))          # DeepSeek
```

<Tip>
  Full model names and prices: [Models & Pricing](/en/api-capabilities/model-info). Note: calling Claude through the compatible format forfeits Claude's Prompt Cache discount — for heavy Claude usage, use [Claude Native Calls](/en/api-capabilities/claude).
</Tip>

## SDK Setup per Language

Every official SDK supports a custom base\_url — configure once and go.

### Python

```bash theme={null}
pip install openai
```

```python theme={null}
from openai import OpenAI, AsyncOpenAI

# Synchronous client
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# Async client
async_client = AsyncOpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

Or use environment variables for zero in-code config:

```bash theme={null}
export OPENAI_API_KEY="YOUR_API_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

```python theme={null}
from openai import OpenAI
client = OpenAI()  # reads the environment automatically
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

Use the official OpenAI Go SDK (`github.com/openai/openai-go`):

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

Use the official OpenAI Java SDK (`com.openai:openai-java`):

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
  Legacy projects on third-party libraries (Go's `sashabaranov/go-openai`, Java's `theokanning` packages) still work after changing the base\_url, but we recommend migrating to the official SDKs above — third-party libraries lag on new parameters such as `reasoning_effort`.
</Note>

## Common Features

### Streaming

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "Write a short poem about autumn"}],
    stream=True
)

for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Reasoning control

On Chat Completions, use the **top-level** `reasoning_effort` parameter (different from the nested form on Responses):

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "Prove that the square root of 2 is irrational"}],
    reasoning_effort="high"  # none / low / medium / high / xhigh
)
```

<Warning>
  **On GPT-5.4 and later (including the gpt-5.6 series), `tools` and an explicit `reasoning_effort` can be mutually exclusive on this endpoint**: explicitly sending a non-`none` `reasoning_effort` alongside `tools` fails with a 400 — `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`. All four of `low`, `medium`, `high` and `xhigh` trigger it in our tests; omitting the parameter does not. Whether it fires depends on which upstream route the request lands on, so the same model can behave inconsistently. This is an official OpenAI restriction — for reasoning plus tool calling, switch to the [Responses endpoint](/en/api-capabilities/openai/native), or explicitly set `reasoning_effort="none"`. How to diagnose and migrate: [Endpoint & Migration](/en/api-capabilities/openai/responses-migration).
</Warning>

<Warning>
  gpt-5 series reasoning models **do not support `temperature` / `top_p`** on this endpoint either — passing them raises an error.
</Warning>

### Image input

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
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
    input="Text to embed"
)
embedding = response.data[0].embedding
```

## Error Handling and Retries

The official SDKs retry automatically (2 attempts by default, on 429 / 5xx / connection errors) — prefer that over hand-rolled loops:

```python theme={null}
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,   # built-in exponential backoff
    timeout=60.0
)
```

For finer control, catch by exception type:

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
    print("Rate limited — retry later")
except APIConnectionError:
    print("Connection error — check network/proxy")
except InternalServerError:
    print("Upstream error — worth retrying")
except APIError as e:
    print(f"API error: {e}")
```

## Capability Boundaries of Compatible Mode

| Capability                                       | Compatible mode | Notes                                                                                                                                                                 |
| ------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chat / streaming / multimodal input              | ✅               | Fully supported                                                                                                                                                       |
| Function calling (FC)                            | ✅               | See [Function Calling](/en/api-capabilities/openai/function-calling)                                                                                                  |
| Prompt cache discount                            | ✅               | Automatic for OpenAI models — see [Cache Billing](/en/api-capabilities/openai/prompt-caching)                                                                         |
| Built-in tools (web search, code interpreter, …) | ❌               | [Native Calls](/en/api-capabilities/openai/native) only                                                                                                               |
| Multi-turn conversation                          | ✅               | Maintain `messages` history yourself (native Responses also requires self-managed history — see the [Multi-Turn Guide](/en/api-capabilities/multi-turn-conversation)) |
| `verbosity` output control                       | ❌               | Native only                                                                                                                                                           |
| Pro-series models (gpt-5.4-pro, …)               | ❌               | In practice, native calls only                                                                                                                                        |

## Migrating from OpenAI Direct

Already on OpenAI's official service? Migration is two steps with zero code changes:

1. **Change base\_url and key**

```python theme={null}
# Before
client = OpenAI(api_key="sk-...")

# After
client = OpenAI(
    api_key="YOUR_APIYI_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

2. **Or change environment variables only** (code untouched)

```bash theme={null}
export OPENAI_API_KEY="YOUR_APIYI_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

Method calls, parameter formats, and response structures all stay identical.

## Related Links

* This group: [Native Calls](/en/api-capabilities/openai/native) · [Endpoint & Migration](/en/api-capabilities/openai/responses-migration) · [Cache Billing](/en/api-capabilities/openai/prompt-caching) · [Function Calling](/en/api-capabilities/openai/function-calling)
* Models & pricing: [Models & Pricing](/en/api-capabilities/model-info)
* Get / manage tokens: `https://api.apiyi.com/token`
* Official OpenAI SDK list: `platform.openai.com/docs/libraries`
