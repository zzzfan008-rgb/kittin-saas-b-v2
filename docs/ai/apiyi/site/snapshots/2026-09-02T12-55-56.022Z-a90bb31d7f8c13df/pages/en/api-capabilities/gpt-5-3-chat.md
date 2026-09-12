> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.3 Chat Text Generation

> OpenAI's latest GPT-5.3 Instant chat model with 400K context window, 26.8% reduced hallucination rate, official direct connection

GPT-5.3-chat-latest is OpenAI's latest chat model released on March 3, 2026, the GPT-5.3 Instant model used in ChatGPT. Compared to its predecessor, it features significant improvements in accuracy, context understanding, and conversational fluency. APIYI connects through **official direct channels** for reliable and stable service.

<Info>
  **APIYI now supports GPT-5.3-chat-latest** via official direct connection, compatible with OpenAI format, plug and play.
</Info>

## Key Advantages

<CardGroup cols={2}>
  <Card title="Massive Context" icon="scroll">
    400K token context window, 3x the previous generation, easily handles ultra-long documents
  </Card>

  <Card title="Lower Hallucination" icon="shield-check">
    26.8% reduction in hallucination rate (with web search), 19.7% (knowledge-only)
  </Card>

  <Card title="Natural Conversation" icon="message-circle">
    Fewer unnecessary refusals and preachy responses, smoother and more natural dialogue
  </Card>

  <Card title="Official Direct Connection" icon="server">
    OpenAI official API transparent forwarding, same quality and stability as official
  </Card>
</CardGroup>

## Model Information

| Parameter             | Value                 |
| --------------------- | --------------------- |
| **Model Name**        | `gpt-5.3-chat-latest` |
| **Context Window**    | 128,000 tokens        |
| **Max Output**        | 16,384 tokens         |
| **Knowledge Cutoff**  | August 31, 2025       |
| **Input Format**      | Text + Image          |
| **Output Format**     | Text                  |
| **Streaming**         | ✅ Supported           |
| **Function Calling**  | ✅ Supported           |
| **Structured Output** | ✅ Supported           |

## Pricing

| Item         | Price (per million tokens) |
| ------------ | -------------------------- |
| Input        | \$1.75                     |
| Cached Input | \$0.175                    |
| Output       | \$14.00                    |

<Info>
  Pricing matches OpenAI official rates. Top-up bonuses available for better value. See [Pricing](/en/pricing) for details.
</Info>

## How to Use

### Endpoint

```
https://api.apiyi.com/v1/chat/completions
```

### Basic Call

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-5.3-chat-latest",
      "messages": [
        {"role": "user", "content": "Hello, tell me about your capabilities"}
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
          {"role": "user", "content": "Hello, tell me about your capabilities"}
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
      { role: 'user', content: 'Hello, tell me about your capabilities' }
    ]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

### Streaming Output

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-5.3-chat-latest",
    messages=[
        {"role": "user", "content": "Write a short essay about the future of AI"}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Multimodal Input (Vision)

GPT-5.3-chat-latest supports image input for understanding and analyzing visual content:

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
                {"type": "text", "text": "Describe the content of this image"},
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

### Function Calling

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
            "description": "Get weather information for a specified city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City name"
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
        {"role": "user", "content": "What's the weather like in Beijing today?"}
    ],
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message)
```

## Comparison with Other GPT Models

| Feature                   | GPT-5.3 Chat             | GPT-5.2   | GPT-5     |
| ------------------------- | ------------------------ | --------- | --------- |
| Context Window            | 128K                     | 128K      | 400K      |
| Max Output                | 16K                      | 16K       | 128K      |
| Input Price               | \$1.75/M                 | \$1.75/M  | \$1.25/M  |
| Output Price              | \$14.00/M                | \$14.00/M | \$10.00/M |
| Hallucination Improvement | ✅ 26.8% reduction        | -         | -         |
| Conversation Naturalness  | ✅ Significantly improved | Good      | Good      |
| Image Input               | ✅                        | ✅         | ✅         |
| Function Calling          | ✅                        | ✅         | ✅         |

## FAQ

<AccordionGroup>
  <Accordion title="What's the difference between GPT-5.3-chat-latest and GPT-5.2?">
    GPT-5.3 Chat is the latest Instant model used in ChatGPT. Compared to GPT-5.2, it reduces hallucination rates by 26.8% (with web search), features more natural conversation style, and eliminates unnecessary refusals and preachy responses.
  </Accordion>

  <Accordion title="What scenarios is this model best for?">
    GPT-5.3 Chat is ideal for everyday conversations, customer service, content creation, and Q\&A scenarios requiring natural and fluent dialogue. For coding tasks, consider using the GPT-5.3-Codex model.
  </Accordion>

  <Accordion title="Does it support image input?">
    Yes, GPT-5.3-chat-latest supports text and image input for understanding and analyzing visual content. However, audio and video inputs are not supported.
  </Accordion>

  <Accordion title="What is the maximum output length?">
    The maximum output is 16,384 tokens. If output is truncated, check the `finish_reason` field and adjust the `max_tokens` parameter accordingly.
  </Accordion>

  <Accordion title="How to reduce costs with cached input?">
    When your requests contain large repeated prefix content (such as system prompts), OpenAI automatically caches these. Cached input is billed at \$0.175/M tokens, just 1/10 of the regular input price.
  </Accordion>

  <Accordion title="Is APIYI's GPT-5.3 Chat officially connected?">
    Yes, APIYI uses OpenAI's official API transparent forwarding, ensuring the same service quality and stability as the official API.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Text Generation Guide" icon="book" href="/en/api-capabilities/text-generation">
    Complete guide to Chat Completions API
  </Card>

  <Card title="Model Information" icon="database" href="/en/api-capabilities/model-info">
    View all available models and pricing
  </Card>

  <Card title="OpenAI Compatible Mode" icon="code" href="/en/api-capabilities/openai/compatible">
    OpenAI SDK configuration and usage tutorial
  </Card>

  <Card title="Use Cases" icon="layers" href="/en/scenarios">
    Explore various use case configurations
  </Card>
</CardGroup>
