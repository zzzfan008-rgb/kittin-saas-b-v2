> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.4 Mini & Nano Launch: Lightweight, Cost-Effective Models Built for Scale

> OpenAI released GPT-5.4 Mini and Nano on March 17, 2026. Mini runs 2x faster than GPT-5 Mini, Nano costs just $0.20/M input tokens. Now available on APIYI at official pricing with ~10% deposit bonus.

## Key Highlights

* **Most Capable Small Models**: GPT-5.4 Mini significantly improves over GPT-5 Mini across coding, reasoning, multimodal understanding, and tool use — over 2x faster
* **Ultra Cost-Effective**: GPT-5.4 Nano at just \$0.20/M input tokens and \$1.25/M output tokens, the cheapest GPT-5.4 family model
* **Near-Flagship Performance**: Mini scores 54.4% on SWE-Bench Pro and 72.1% on OSWorld-Verified, approaching full GPT-5.4
* **400K Context Window**: Consistent with the GPT-5 family
* **Full Capabilities**: Text & image input, tool calling, web search, computer use — all supported

## Background

On March 17, 2026, OpenAI officially released GPT-5.4 Mini and GPT-5.4 Nano, calling them "the most capable small models yet." Following the GPT-5.4 flagship launch in early March, this release brings 5.4-level capabilities to lightweight, cost-efficient models.

GPT-5.4 Mini targets developers who need high performance on a budget, delivering near-flagship quality at a fraction of the cost. GPT-5.4 Nano is purpose-built for high-throughput, low-cost workloads like classification, data extraction, ranking, and coding subagents.

APIYI has immediately launched both models at pricing identical to OpenAI's official rates, with official API proxy and \~10% deposit bonus.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="2x Faster" icon="bolt">
    GPT-5.4 Mini runs more than 2x faster than GPT-5 Mini with significantly lower latency
  </Card>

  <Card title="Ultra-Low Pricing" icon="coins">
    Nano can describe 76,000 photos for approximately \$52
  </Card>

  <Card title="Near-Flagship" icon="chart-line">
    Mini scores 54.4% on SWE-Bench Pro (vs GPT-5.4's 57.7%)
  </Card>

  <Card title="Full Capabilities" icon="layers">
    Image understanding, tool calling, web search, computer use — all included
  </Card>
</CardGroup>

### GPT-5.4 Mini Benchmarks

GPT-5.4 Mini dominates across evaluations compared to GPT-5 Mini:

| Benchmark              | GPT-5.4 Mini | GPT-5.4 (Full) | GPT-5 Mini | Description                      |
| ---------------------- | ------------ | -------------- | ---------- | -------------------------------- |
| **SWE-Bench Pro**      | **54.4%**    | 57.7%          | 45.7%      | Real-world software engineering  |
| **OSWorld-Verified**   | **72.1%**    | 75.0%          | 42.0%      | Computer use benchmark           |
| **Toolathlon**         | **42.9%**    | —              | 26.9%      | Tool calling evaluation          |
| **GPQA Diamond**       | **88.0%**    | —              | 81.6%      | Research-level science reasoning |
| **Tau2-Bench**         | **93.4%**    | —              | 74.1%      | Tool calling benchmark           |
| **MCP Atlas**          | **57.7%**    | —              | 47.6%      | MCP protocol evaluation          |
| **Terminal-Bench 2.0** | **60.0%**    | —              | —          | Terminal operation evaluation    |

<Info>
  GPT-5.4 Mini scores 72.1% on OSWorld-Verified, a 71.7% improvement over GPT-5 Mini's 42.0%, approaching the flagship GPT-5.4's 75.0%.
</Info>

### GPT-5.4 Nano Performance

Nano is the smallest, cheapest GPT-5.4 variant, designed for speed and cost-first scenarios:

| Benchmark              | GPT-5.4 Nano | GPT-5.4 Mini |
| ---------------------- | ------------ | ------------ |
| **Terminal-Bench 2.0** | 46.3%        | 60.0%        |
| **OSWorld-Verified**   | 39.0%        | 72.1%        |

<Tip>
  OpenAI recommends Nano for classification, data extraction, ranking, and coding subagents handling simpler supporting tasks.
</Tip>

### Adjustable Reasoning Effort

Both models support variable reasoning effort levels for flexible cost-performance tradeoffs:

* `none`: No reasoning, fastest response
* `low` / `medium` / `high`: Increasing reasoning depth
* `xhigh`: Maximum reasoning effort

<Info>
  Notably, GPT-5.4 Nano at maximum reasoning effort outperforms the previous GPT-5 Mini, achieving last-generation mid-tier capabilities at a fraction of the cost.
</Info>

## Practical Applications

### Recommended Use Cases

**GPT-5.4 Mini:**

1. **Coding Assistant**: 54.4% SWE-Bench Pro, ideal for code generation, review, and debugging
2. **Autonomous Agents**: 72.1% OSWorld, supports computer use and multi-step workflows
3. **Daily Chat**: Default thinking model for ChatGPT Free and Go users
4. **OpenClaw & Similar**: High performance at low cost, perfect for batch intelligent tasks

**GPT-5.4 Nano:**

1. **Data Pipelines**: Classification, extraction, ranking at high throughput
2. **Coding Subagents**: Handle simpler supporting tasks in agent architectures
3. **Batch Image Understanding**: \~\$52 for 76,000 photo descriptions
4. **Real-time Classification**: Ultra-low latency, ultra-low cost

### Code Examples

#### Using GPT-5.4 Mini

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# GPT-5.4 Mini - Cost-effective coding assistant
response = client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {
            "role": "user",
            "content": "Refactor this code to extract common logic and add error handling..."
        }
    ],
    max_tokens=4096
)

print(response.choices[0].message.content)
```

#### Using GPT-5.4 Nano for Batch Processing

```python theme={null}
# GPT-5.4 Nano - Ultra cost-effective batch tasks
response = client.chat.completions.create(
    model="gpt-5.4-nano",
    messages=[
        {
            "role": "system",
            "content": "You are a text classifier. Classify user input as: positive, negative, or neutral. Output only the classification."
        },
        {
            "role": "user",
            "content": "This product is excellent quality, will definitely buy again!"
        }
    ],
    max_tokens=10
)

print(response.choices[0].message.content)
```

## Pricing & Availability

### Pricing

| Tier             | GPT-5.4 Nano      | GPT-5.4 Mini       | GPT-5.4 (Full)     |
| ---------------- | ----------------- | ------------------ | ------------------ |
| **Input**        | \$0.20 / M tokens | \$0.75 / M tokens  | \$2.50 / M tokens  |
| **Cached Input** | \$0.02 / M tokens | \$0.075 / M tokens | —                  |
| **Output**       | \$1.25 / M tokens | \$4.50 / M tokens  | \$15.00 / M tokens |

<Info>
  GPT-5.4 Mini costs just 30% of the flagship GPT-5.4 with near-flagship performance. Nano is only 8% of flagship cost — ultimate value.
</Info>

**Competitive Comparison**:

| Model                 | Input Price | Output Price | Positioning              |
| --------------------- | ----------- | ------------ | ------------------------ |
| **GPT-5.4 Nano**      | **\$0.20**  | **\$1.25**   | Ultra-lightweight        |
| **GPT-5.4 Mini**      | **\$0.75**  | **\$4.50**   | Cost-effective           |
| Gemini 3.1 Flash Lite | \$0.25      | \$0.50       | Lightweight fast         |
| Claude Haiku 4.5      | \$0.80      | \$4.00       | Fast response            |
| GPT-5.2 mini          | \$0.30      | \$1.80       | Previous-gen small model |

### Promotions

<Card title="View Latest Deposit Bonus Offers" icon="gift" href="/en/faq/recharge-promotions">
  APIYI offers deposit bonuses — official API proxy with \~10% bonus on deposits. Pricing matches official rates, with effective discounts through deposit bonuses.
</Card>

### Available Models

| Model Name     | Variant | Context | Description                               |
| -------------- | ------- | ------- | ----------------------------------------- |
| `gpt-5.4-mini` | Mini    | 400K    | Cost-effective, near-flagship performance |
| `gpt-5.4-nano` | Nano    | 400K    | Ultra-low cost, high-throughput scenarios |

### How to Access

**APIYI Platform**:

* Website: `apiyi.com`
* API Endpoint: `https://api.apiyi.com/v1`
* OpenAI-compatible format, works with all OpenAI SDKs
* Official API proxy, stable and reliable

## Summary & Recommendations

GPT-5.4 Mini and Nano bring flagship-level capabilities to developers and applications at dramatically lower costs.

**Key Advantages**:

* **Mini**: Flagship-tier capability at 30% cost, 2x speed
* **Nano**: Ultra-low pricing at 8% of flagship cost, built for scale

**Selection Guide**:

1. **Near-flagship performance needed**: Choose GPT-5.4 Mini (SWE-Bench Pro 54.4%, OSWorld 72.1%)
2. **High-throughput batch processing**: Choose GPT-5.4 Nano (\$0.20/M input tokens)
3. **Agent architecture subtasks**: Nano as execution layer, Mini as decision layer
4. **OpenClaw & similar**: Both Mini and Nano work well — choose based on cost-performance needs
5. **Cost-insensitive professional tasks**: Still recommend GPT-5.4 flagship or Pro

APIYI has launched both GPT-5.4 Mini and Nano at official pricing with \~10% deposit bonus. Experience OpenAI's most capable lightweight models today!

<Info>
  Sources: OpenAI official blog (March 17, 2026), 9to5Mac, The New Stack, Simon Willison's Weblog, and other authoritative sources. Data retrieved: March 18, 2026.
</Info>
