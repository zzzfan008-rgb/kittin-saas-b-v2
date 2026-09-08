> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Text Generation (Chat Completions)

> Use large language models for conversational AI, supporting single-turn dialogue, multi-turn conversation, role-playing, and more

## Overview

Text Generation (Chat Completions) is one of the core capabilities of the APIYi platform, supporting 400+ popular AI models for intelligent conversations and text generation. Through a unified OpenAI-compatible interface, you can easily implement:

* **Intelligent Dialogue**: Build chatbots and virtual assistants
* **Content Creation**: Article writing, creative generation, copywriting
* **Code Assistance**: Code generation, debugging, refactoring suggestions
* **Knowledge Q\&A**: Answer questions, knowledge retrieval, information extraction
* **Role-Playing**: Customized AI characters and scenario simulation

<Info>
  Supports OpenAI GPT-4, Claude, Gemini, DeepSeek, Qwen, and 400+ mainstream models with a single API key.
</Info>

## Quick Start

### Basic Conversation Example

Simple single-turn conversation using Chat Completions API:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Tell me about the history of artificial intelligence"}
    ]
)

print(response.choices[0].message.content)
```

### Multi-Turn Conversation Example

Maintain conversation history through the `messages` array for context-aware dialogue:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

messages = [
    {"role": "system", "content": "You are a professional Python programming assistant"},
    {"role": "user", "content": "How do I read a CSV file?"},
    {"role": "assistant", "content": "You can use pandas library's read_csv() function..."},
    {"role": "user", "content": "How do I filter specific columns?"}
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)

print(response.choices[0].message.content)
```

## Core Parameters

### model (required)

Specify the model name. See [Model Information](/en/api-capabilities/model-info) for details.

```python theme={null}
model="gpt-4o"  # GPT-4 Omni
model="claude-sonnet-4.5"  # Claude Sonnet 4.5
model="gemini-3-pro-preview"  # Gemini 3 Pro
model="deepseek-chat"  # DeepSeek Chat
```

### messages (required)

Array of conversation messages, each containing `role` and `content` fields:

<CardGroup cols={3}>
  <Card title="system" icon="settings">
    System prompt defining AI behavior and role
  </Card>

  <Card title="user" icon="user">
    User message representing user input
  </Card>

  <Card title="assistant" icon="bot">
    Assistant message representing AI response
  </Card>
</CardGroup>

```python theme={null}
messages = [
    {"role": "system", "content": "You are a friendly customer service assistant"},
    {"role": "user", "content": "I want to inquire about refunds"},
    {"role": "assistant", "content": "Sure, what issue did you encounter?"},
    {"role": "user", "content": "The product has quality issues"}
]
```

### temperature (optional)

Controls output randomness, range `0.0 ~ 2.0`, default `1.0`:

* **0.0 \~ 0.3**: More deterministic and consistent, suitable for factual tasks (translation, summarization, code generation)
* **0.7 \~ 1.0**: Balanced creativity and accuracy, suitable for daily conversation
* **1.0 \~ 2.0**: More creative and diverse, suitable for creative writing and brainstorming

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a poem about spring"}],
    temperature=1.2  # Increase creativity
)
```

### max\_tokens (optional)

Limit maximum number of tokens generated to control cost and response length:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Describe AI in one sentence"}],
    max_tokens=50  # Limit output length
)
```

<Warning>
  Different models have different token pricing. See [Pricing](/en/pricing) for details.
</Warning>

### top\_p (optional)

Nucleus sampling parameter, range `0.0 ~ 1.0`, controls output diversity:

* Lower values (e.g., `0.5`): More focused and deterministic output
* Higher values (e.g., `0.9`): More diverse and random output

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Recommend some sci-fi movies"}],
    top_p=0.8
)
```

<Info>
  It's recommended to adjust only `temperature` or `top_p`, not both simultaneously.
</Info>

### stream (optional)

Enable streaming output to return results token by token, improving user experience:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write an article about artificial intelligence"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## Advanced Usage

### System Prompt

Define AI behavior, role, knowledge scope, and response style through the `system` role:

```python theme={null}
messages = [
    {
        "role": "system",
        "content": """You are a professional legal advisor assistant.

Rules:
1. Provide accurate and professional legal advice
2. Use plain language to explain legal terms
3. Cite relevant laws when necessary
4. Avoid absolute conclusions, suggest consulting professional lawyers
5. Maintain a neutral and objective stance"""
    },
    {"role": "user", "content": "Can employment contracts be terminated at any time?"}
]
```

### Role-Playing

Create AI assistants with specific personalities and expertise:

```python theme={null}
messages = [
    {
        "role": "system",
        "content": "You are an experienced Python developer with 10 years of experience. You excel at solving problems with concise code, prefer Pythonic approaches, and proactively identify potential issues in code."
    },
    {"role": "user", "content": "Help me write a quicksort algorithm"}
]
```

### Context Management

For long conversations, properly manage context length to avoid exceeding model token limits:

```python theme={null}
def manage_context(messages, max_history=10):
    """Keep recent conversation history"""
    # Preserve system messages
    system_messages = [m for m in messages if m["role"] == "system"]
    # Keep recent N messages
    recent_messages = messages[-max_history:]

    return system_messages + recent_messages

# Usage example
messages = manage_context(messages, max_history=10)
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages
)
```

### JSON Mode Output

Some models support forcing JSON format output:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a data extraction assistant. Always return results in JSON format"},
        {"role": "user", "content": "Extract key information from this text: Zhang San, male, 30 years old, software engineer"}
    ],
    response_format={"type": "json_object"}
)

import json
result = json.loads(response.choices[0].message.content)
print(result)
```

## Best Practices

### 1. Choose the Right Model

Select the most cost-effective model based on task requirements:

| Task Type                | Recommended Models                              | Notes                            |
| ------------------------ | ----------------------------------------------- | -------------------------------- |
| Daily Conversation       | gpt-4o-mini, deepseek-chat                      | Low cost, fast response          |
| Complex Reasoning        | gpt-4o, claude-sonnet-4.5, gemini-3-pro-preview | Strong capability, high accuracy |
| Code Generation          | gpt-4o, deepseek-coder, claude-sonnet-4.5       | Professional expertise           |
| Creative Writing         | claude-sonnet-4.5, gpt-4o                       | Fluent writing                   |
| Multilingual Translation | gemini-3-pro-preview, gpt-4o                    | Support many languages           |

### 2. Optimize Prompts

Good prompts significantly improve output quality:

<CardGroup cols={2}>
  <Card title="Clear Task" icon="check">
    Clearly state what AI needs to do with necessary context
  </Card>

  <Card title="Specify Format" icon="list">
    Define output format, length, tone, etc.
  </Card>

  <Card title="Provide Examples" icon="lightbulb">
    Give input-output examples to help AI understand expectations
  </Card>

  <Card title="Step-by-Step" icon="list-ordered">
    Break complex tasks into multiple steps
  </Card>
</CardGroup>

```python theme={null}
# ❌ Poor prompt
"Write an article"

# ✅ Good prompt
"""Write a popular science article about AI applications in healthcare.

Requirements:
- Length: 800-1000 words
- Audience: General readers
- Structure: Introduction, Application Scenarios, Case Analysis, Future Outlook
- Tone: Professional but accessible
- Include 2-3 real-world cases"""
```

### 3. Cost Control

Use parameters wisely to reduce API costs:

```python theme={null}
# Set max_tokens to limit output length
response = client.chat.completions.create(
    model="gpt-4o-mini",  # Use more cost-effective model
    messages=messages,
    max_tokens=500,  # Limit maximum output
    temperature=0.7
)

{/* Regularly clean conversation history */}
if len(messages) > 20:
    messages = messages[-10:]  # Keep only recent 10 messages
```

### 4. Error Handling

Add exception handling to improve application stability:

```python theme={null}
from openai import OpenAI, OpenAIError
import time

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def chat_with_retry(messages, max_retries=3):
    """Chat function with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )
            return response.choices[0].message.content
        except OpenAIError as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                raise

# Usage example
try:
    result = chat_with_retry(messages)
    print(result)
except OpenAIError as e:
    print(f"API call failed: {e}")
```

### 5. Use Streaming Output

For long text generation, streaming output improves user experience:

```python theme={null}
def stream_chat(messages):
    """Streaming output example"""
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

## FAQ

### How to count tokens?

Different models use different tokenizers. Use the `tiktoken` library for estimation:

```python theme={null}
import tiktoken

def count_tokens(text, model="gpt-4o"):
    """Estimate token count for text"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# Usage example
text = "Hello, world!"
tokens = count_tokens(text)
print(f"Token count: {tokens}")
```

### Why is the output truncated?

Possible reasons:

1. Reached `max_tokens` limit
2. Model's context window is insufficient
3. Content safety policy triggered

Solutions:

* Increase `max_tokens` parameter
* Choose models with longer context support
* Check `finish_reason` field to determine cause

```python theme={null}
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    max_tokens=2000  # Increase output length limit
)

finish_reason = response.choices[0].finish_reason
if finish_reason == "length":
    print("Output truncated due to length limit")
elif finish_reason == "content_filter":
    print("Output filtered due to content safety")
```

### How to implement conversation memory?

Maintain conversation history at the application layer:

```python theme={null}
class ChatSession:
    def __init__(self, system_prompt=""):
        self.messages = []
        if system_prompt:
            self.messages.append({"role": "system", "content": system_prompt})

    def chat(self, user_message):
        """Send message and record conversation"""
        self.messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=self.messages
        )

        assistant_message = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": assistant_message})

        return assistant_message

# Usage example
session = ChatSession(system_prompt="You are a friendly assistant")
print(session.chat("Hello"))
print(session.chat("What did I just say?"))  # AI can remember context
```

## Related Documentation

<CardGroup cols={2}>
  <Card title="Model Information" icon="database" href="/en/api-capabilities/model-info">
    View all supported models and pricing
  </Card>

  <Card title="Text Embedding" icon="vector-square" href="/en/api-capabilities/text-embedding">
    Convert text to vector representations
  </Card>
</CardGroup>
