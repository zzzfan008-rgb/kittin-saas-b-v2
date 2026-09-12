> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.1 Flash Lite Preview: Google's Latest Lightweight Model for Agent Tasks & Low Latency

> Google launches Gemini 3.1 Flash Lite Preview, optimized for high-throughput agent tasks and low-latency scenarios. 1M+ context, multimodal input, now available at APIYi via official direct connection.

## Key Highlights

* **New Lightweight Model**: Gemini 3.1 Flash Lite Preview is the lightest and fastest variant in Google's Gemini 3.1 family
* **Agent-Optimized**: Purpose-built for high-throughput agent tasks, simple data extraction, and ultra-low latency applications
* **Massive Context**: Supports 1,048,576 tokens (1M+) context window with 65,536 tokens max output
* **Full Multimodal Input**: Accepts text, images, video, audio, and PDF inputs
* **Official Direct Connection**: Available at APIYi via official proxy channel, pricing matches Google's official rates

## Background

With the explosive growth of AI Agent applications, developers increasingly need lightweight, low-latency, high-throughput models. Many agent task scenarios — such as tool calling, data extraction, routing, and simple classification — don't require the most powerful reasoning capabilities, but rather fast responses and low costs.

Google's **Gemini 3.1 Flash Lite Preview** is built precisely for this purpose. As the lightweight variant of the Gemini 3.1 family, it maintains strong multimodal capabilities while significantly reducing latency and cost, making it an ideal choice for agent task pipelines.

APIYi has launched this model via official direct connection (official proxy) channel, with pricing matching Google's official rates, providing developers with a stable and reliable calling experience.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="Agent Task Optimized" icon="bot">
    * Designed for Agent workflows
    * Ultra-low latency responses
    * High-throughput concurrency support
  </Card>

  <Card title="Full Multimodal Input" icon="layers">
    * Text, images, video, audio, PDF
    * 1M+ tokens context window
    * 65K tokens max output
  </Card>

  <Card title="Rich Capabilities" icon="wand-sparkles">
    * Function Calling
    * Code Execution
    * Structured Output
    * Search Grounding
  </Card>

  <Card title="Enterprise Features" icon="building">
    * Batch API processing
    * Context Caching
    * Chain-of-thought output
    * File Search & URL Context
  </Card>
</CardGroup>

### Technical Specifications

| Specification    | Value                                       |
| ---------------- | ------------------------------------------- |
| Model Name       | `gemini-3.1-flash-lite-preview`             |
| Context Window   | 1,048,576 tokens (1M+)                      |
| Max Output       | 65,536 tokens (64K)                         |
| Input Modalities | Text, Images, Video, Audio, PDF             |
| Output Modality  | Text                                        |
| Access Channel   | Official Direct Connection (Official Proxy) |

### Comparison with Previous Generation

| Feature            | 3.1 Flash Lite Preview | 2.5 Flash Lite |
| ------------------ | ---------------------- | -------------- |
| Context Window     | 1M+ tokens             | 1M tokens      |
| Max Output         | 64K tokens             | 64K tokens     |
| Function Calling   | ✅                      | ✅              |
| Code Execution     | ✅                      | ✅              |
| Structured Output  | ✅                      | ✅              |
| Chain-of-Thought   | ✅                      | ✅              |
| File Search        | ✅                      | ❌              |
| URL Context        | ✅                      | ❌              |
| Search Grounding   | ✅                      | ❌              |
| Agent Optimization | ✅                      | ❌              |

Gemini 3.1 Flash Lite Preview adds File Search, URL Context, Search Grounding and more on top of its predecessor, better serving agent task scenarios.

## Practical Applications

### Recommended Use Cases

<CardGroup cols={2}>
  <Card title="Agent Workflows" icon="bot">
    * Tool calling and routing
    * Multi-step agent orchestration
    * Lightweight decision nodes
  </Card>

  <Card title="Data Extraction" icon="database">
    * Structured information extraction
    * Table/form parsing
    * Batch document processing
  </Card>

  <Card title="Real-time Classification" icon="tags">
    * Content classification and labeling
    * Intent recognition
    * Sentiment analysis
  </Card>

  <Card title="Multimodal Processing" icon="images">
    * Image/video content understanding
    * Audio transcription
    * PDF document parsing
  </Card>
</CardGroup>

### Code Example

Here's a Python example using APIYi to call Gemini 3.1 Flash Lite Preview:

```python theme={null}
import openai

# Configure APIYi client
client = openai.OpenAI(
    api_key="your-apiyi-api-key",  # Replace with your APIYi API key
    base_url="https://api.apiyi.com/v1"
)

# Call Gemini 3.1 Flash Lite Preview
response = client.chat.completions.create(
    model="gemini-3.1-flash-lite-preview",
    messages=[
        {
            "role": "system",
            "content": "You are an efficient data extraction assistant. Extract structured information from user-provided text."
        },
        {
            "role": "user",
            "content": "Extract the company name, founding year, and main business from: APIYi was founded in 2024, a tech company focused on AI model API proxy services, supporting 400+ popular AI models."
        }
    ],
    max_tokens=1024,
    temperature=0.3,
    response_format={"type": "json_object"}
)

print(response.choices[0].message.content)
```

**Function Calling Example**

```python theme={null}
import openai
import json

client = openai.OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather information for a specified city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name"}
                },
                "required": ["city"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite-preview",
    messages=[{"role": "user", "content": "What's the weather like in Beijing today?"}],
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message.tool_calls)
```

### Best Practices

<Info>
  **Agent Task Optimization Tips**

  1. **Concise Prompts**: Flash Lite responds better to concise instructions; avoid lengthy system prompts
  2. **Structured Output**: Use `response_format` for JSON output, facilitating downstream processing
  3. **Batch Processing**: Use Batch API for high-throughput scenarios to further reduce costs
  4. **Cache Utilization**: Enable caching for repetitive contexts to reduce input token consumption
  5. **Temperature Control**: For data extraction tasks, set temperature to 0-0.3
</Info>

## Pricing & Availability

### APIYi Pricing

<Card title="Official Direct Connection Pricing" icon="tag">
  **Available Now at APIYi**

  | Type        | Price                   |
  | ----------- | ----------------------- |
  | Text Input  | \$0.25 / million tokens |
  | Image Input | \$0.25 / million tokens |
  | Video Input | \$0.25 / million tokens |
  | Output      | \$1.50 / million tokens |

  * Official direct connection (official proxy) channel
  * Pricing matches Google's official rates
  * Recharge bonus discounts available
</Card>

<Warning>
  **Important Notes**

  * This is a Preview version; API interfaces may be subject to changes
  * Recommended to test in non-critical applications first
  * Follow APIYi announcements for future updates
</Warning>

### Getting Started

1. Visit APIYi website: `apiyi.com`
2. Register and top up (multiple payment methods supported)
3. Get your API Key from the dashboard
4. Use OpenAI SDK format (set base\_url to `https://api.apiyi.com/v1`)

## Summary & Recommendations

Gemini 3.1 Flash Lite Preview is Google's purpose-built lightweight model for agent tasks and low-latency scenarios: **ultra-low cost** (input \$0.25/M), **lightning-fast responses**, **full multimodal input** (text/images/video/audio/PDF), **rich capabilities** (function calling/structured output/search grounding) — an ideal building block for AI Agent workflows.

**Our Recommendations**

* **Agent Developers**: Ideal for tool calling, routing, and simple classification as lightweight nodes
* **Data Processing Teams**: Perfect for batch document parsing, information extraction, and content classification
* **Cost-Sensitive Scenarios**: Get Gemini 3.1 series multimodal capabilities at minimal cost

<Info>
  **Information Sources & Update Date**

  * Source: Google AI Official Documentation
  * Model Identifier: `gemini-3.1-flash-lite-preview`
  * Data Retrieved: March 5, 2026
</Info>

**Start Using Today**

Visit the APIYi website, get your API Key, and begin your Gemini 3.1 Flash Lite Preview journey!
