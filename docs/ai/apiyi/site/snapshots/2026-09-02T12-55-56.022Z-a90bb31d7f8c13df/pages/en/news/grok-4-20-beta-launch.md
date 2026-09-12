> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.20 Beta Series: 4-Agent Architecture, 2M Context

> xAI releases Grok 4.20 Beta with 4 models featuring a multi-agent collaboration architecture, 2M token context window, and unified pricing at $2/$6 per million tokens. Now available on APIYI.

## Key Highlights

* **4-Agent Architecture**: Grok 4.20's core innovation — 4 specialized agents think in parallel and debate before producing answers, reducing hallucinations by \~65%
* **2M Context Window**: 8x increase from Grok 4's 256K to 2 million tokens
* **4 Models for Every Use Case**: Reasoning, multi-agent, base, and non-reasoning variants for everything from instant responses to deep research
* **Unified Low Pricing**: \$2 input / \$6 output per million tokens, a major price drop from Grok 4 (\$3/\$15)
* **Multimodal Input**: Supports text + image (JPG, PNG) input

## Background

On February 17, 2026, xAI launched Grok 4.20 Beta on `grok.com` for consumers. The API variants were released on March 9-10, 2026. Grok 4.20 represents a major architectural shift from a single model to a multi-agent collaboration system.

The core innovation is a 4-agent architecture: Grok (captain/coordinator), Harper (research & fact-checking), Benjamin (logic/math/coding specialist), and Lucas (creative synthesis & devil's advocate). These agents work in parallel, debate each other, and produce more accurate, comprehensive answers.

All 4 models are now available on APIYI with pricing matching xAI's official rates.

## Detailed Analysis

### Model Comparison

| Model                               | Purpose            | Best For                                                     |
| ----------------------------------- | ------------------ | ------------------------------------------------------------ |
| `grok-4.20-beta`                    | General purpose    | Daily conversation, content generation, general tasks        |
| `grok-4.20-beta-0309-reasoning`     | Enhanced reasoning | Complex logic, multi-step math, scientific reasoning, coding |
| `grok-4.20-beta-0309-non-reasoning` | Ultra-fast         | Low-latency scenarios, simple Q\&A, classification           |
| `grok-4.20-multi-agent-beta-0309`   | Multi-agent        | Deep research, complex multi-step workflows                  |

### Core Features

<CardGroup cols={2}>
  <Card title="4-Agent Collaboration" icon="users">
    Grok (coordinator), Harper (research), Benjamin (logic), Lucas (creative) — parallel thinking with debate
  </Card>

  <Card title="2M Context Window" icon="scroll-text">
    2 million tokens, 8x larger than Grok 4's 256K
  </Card>

  <Card title="Reduced Hallucinations" icon="shield-check">
    Multi-agent collaboration reduces hallucination rate from \~12% to \~4.2%, a \~65% improvement
  </Card>

  <Card title="Unified Low Pricing" icon="coins">
    \$2 input / \$6 output per million tokens, \~60% cheaper than Grok 4
  </Card>
</CardGroup>

### Performance Data

<Info>
  Data sourced from Artificial Analysis and other third-party benchmarks. xAI has not yet published official comprehensive benchmark results.
</Info>

| Metric                    | Reasoning | Non-Reasoning | Grok 4 (Reference) |
| ------------------------- | --------- | ------------- | ------------------ |
| **AA Intelligence Index** | 48        | 30            | 42                 |
| **Output Speed**          | \~231 t/s | \~232.5 t/s   | —                  |
| **Context Window**        | 2M        | 2M            | 256K               |
| **Input Price**           | \$2/M     | \$2/M         | \$3/M              |
| **Output Price**          | \$6/M     | \$6/M         | \$15/M             |

### Multi-Agent Model Details

`grok-4.20-multi-agent-beta-0309` includes built-in tool capabilities:

* **web\_search**: Web search
* **x\_search**: Real-time X (Twitter) data search
* **code\_execution**: Code execution
* **collections\_search**: Knowledge base search

API calls return only the lead agent's final response. Sub-agent intermediate reasoning is not exposed by default.

## Getting Started

### Code Example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Reasoning variant - for complex logic tasks
response = client.chat.completions.create(
    model="grok-4.20-beta-0309-reasoning",
    messages=[
        {"role": "user", "content": "Analyze the time complexity of this algorithm and suggest optimizations..."}
    ]
)
print(response.choices[0].message.content)
```

```python theme={null}
# Non-reasoning variant - for low-latency scenarios
response = client.chat.completions.create(
    model="grok-4.20-beta-0309-non-reasoning",
    messages=[
        {"role": "user", "content": "Translate the following text to Chinese: ..."}
    ]
)
print(response.choices[0].message.content)
```

### Recommended Use Cases

<CardGroup cols={2}>
  <Card title="Reasoning" icon="brain">
    Math competitions, scientific analysis, complex coding, multi-step logic
  </Card>

  <Card title="Non-Reasoning" icon="bolt">
    Quick Q\&A, text classification, translation, data extraction
  </Card>

  <Card title="Base" icon="messages-square">
    Daily conversation, content creation, general assistant
  </Card>

  <Card title="Multi-Agent" icon="users">
    Deep research reports, complex investigations, multi-perspective analysis
  </Card>
</CardGroup>

## Pricing & Availability

### Pricing

| Model                               | Input Price    | Output Price   | Billing     |
| ----------------------------------- | -------------- | -------------- | ----------- |
| `grok-4.20-beta`                    | \$2 / M tokens | \$6 / M tokens | Pay-per-use |
| `grok-4.20-beta-0309-reasoning`     | \$2 / M tokens | \$6 / M tokens | Pay-per-use |
| `grok-4.20-beta-0309-non-reasoning` | \$2 / M tokens | \$6 / M tokens | Pay-per-use |
| `grok-4.20-multi-agent-beta-0309`   | \$2 / M tokens | \$6 / M tokens | Pay-per-use |

### Deposit Bonuses

Top-up promotions apply. See [promotion details](/en/faq/recharge-promotions).

## Summary & Recommendations

Grok 4.20 Beta's standout feature is its 4-agent collaboration architecture and 2M ultra-long context. While its AA Intelligence Index (48) trails Gemini 3.1 Pro (57) and GPT-5.4 (57), the unique multi-agent mechanism excels at reducing hallucinations and improving accuracy on complex tasks. The unified \$2/\$6 pricing is highly competitive.

<Warning>
  Grok 4.20 is still in Beta. xAI states they are shipping bug fixes and improvements daily. Implement proper error handling for production use.
</Warning>

<Info>
  Sources: xAI official documentation at `docs.x.ai`, Artificial Analysis benchmark data, xAI release announcements. Data retrieved: March 2026.
</Info>
