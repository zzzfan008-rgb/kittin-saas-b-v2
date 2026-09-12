> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.0 Lite: ByteDance's Cost-Efficient Enterprise Multimodal Model

> ByteDance Seed 2.0 Lite is now available on APIYI, outperforming Seed 1.8 with multimodal input (image/video/text), AIME 2025 score of 93.0, MMLU-Pro 87.7, ideal for high-throughput production workloads via OpenAI-compatible API.

## Key Highlights

* **Surpasses Previous Generation**: Overall performance exceeds Seed 1.8 with significant improvements in visual reasoning, instruction following, and tool calling
* **Multimodal Input**: Supports image, video, and text input, covering document/chart analysis and video understanding scenarios
* **Flexible Vision Tiers**: Three visual input quality options (low / high / xhigh) to balance cost and fidelity
* **Strong Benchmarks**: AIME 2025 at 93.0, MMLU-Pro 87.7 (surpasses Pro), SWE-Bench Verified 73.5%
* **Cost-Efficient Deployment**: \~1/5 the cost of Pro, ideal for high-QPS and broad-coverage production scenarios

## Background

On February 14, 2026, ByteDance's Seed team officially launched the Seed 2.0 series of large language models, featuring three variants — Pro, Lite, and Mini — covering the full spectrum from flagship to lightweight use cases.

Seed 2.0 Lite is positioned as a **general-purpose production-grade model**, delivering strong capabilities while significantly reducing inference costs. It is designed for high-frequency enterprise workloads including unstructured information processing, text content creation, search and recommendation, and data analysis.

Compared to the previous-generation Seed 1.8, Lite achieves substantial improvements in multimodal understanding, instruction following, reasoning, and tool calling, while adding video understanding and flexible vision quality tiers.

APIYI has fully launched Seed 2.0 Lite, accessible via OpenAI-compatible API.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="Multimodal Understanding" icon="image">
    Supports image, video, and text input, covering document/chart analysis, video captioning, and visual grounding
  </Card>

  <Card title="Flexible Vision Tiers" icon="sliders-horizontal">
    Three quality tiers (low / high / xhigh) — default high for predictability, xhigh for dense text and complex charts
  </Card>

  <Card title="Enhanced Agent Readiness" icon="bot">
    Major gains in instruction following, reasoning, and tool/function calling — COLLIE 94.0, MARS-Bench 80.5
  </Card>

  <Card title="Cost-Efficient Deployment" icon="coins">
    \~1/5 the cost of Pro while preserving capability advantages, ideal for high-QPS and broad-coverage scenarios
  </Card>
</CardGroup>

### Performance Highlights

Seed 2.0 Lite delivers competitive scores across major benchmarks:

| Benchmark              | Seed 2.0 Lite | Seed 2.0 Pro | Seed 1.8 | Notes                                    |
| ---------------------- | ------------- | ------------ | -------- | ---------------------------------------- |
| **AIME 2025**          | **93.0**      | 96.0         | -        | Math reasoning, near-flagship level      |
| **MMLU-Pro**           | **87.7**      | 87.0         | -        | Knowledge understanding, surpasses Pro   |
| **SWE-Bench Verified** | **73.5%**     | 76.5%        | -        | Software engineering tasks               |
| **LiveCodeBench v6**   | **81.7**      | 84.0         | -        | Live coding benchmark                    |
| **MathVision**         | **86.4**      | -            | 81.3     | Visual math reasoning, major improvement |
| **MathVista**          | **89.0**      | -            | -        | Visual math understanding                |
| **VideoMME**           | **87.7**      | -            | -        | Video multimodal understanding           |
| **COLLIE**             | **94.0**      | -            | -        | Instruction following                    |

<Info>
  Data sources: ByteDance Seed official website (`seed.bytedance.com`) and LLM Stats (`llm-stats.com`). Seed 2.0 series officially launched on February 14, 2026.
</Info>

**Key Takeaways**:

* **Near-flagship math reasoning**: AIME 2025 at 93.0, only 3 points below Pro (96.0)
* **Surpasses Pro in knowledge tasks**: MMLU-Pro at 87.7 vs Pro's 87.0, proving Lite is fully capable for knowledge-understanding workloads
* **Major visual reasoning improvement**: MathVision jumps from 81.3 (Seed 1.8) to 86.4
* **Video understanding**: VideoMME at 87.7, VideoReasonBench at 64.2, supporting spatiotemporal video analysis

### Multimodal Capabilities

Seed 2.0 Lite's multimodal capabilities are a major upgrade highlight:

**Image Understanding**:

* Information extraction from mixed text-and-image content
* Document and chart analysis covering most common scenarios
* Visual grounding capabilities

**Video Understanding**:

* Spatiotemporal video understanding and motion perception
* Video captioning
* Video reasoning and analysis

**Vision Quality Tiers**:

| Tier               | Use Case                                              | Cost    |
| ------------------ | ----------------------------------------------------- | ------- |
| **low**            | Simple image recognition, fast classification         | Lowest  |
| **high** (default) | Standard document/chart analysis, good predictability | Medium  |
| **xhigh**          | Dense text, complex charts, detail-rich scenes        | Highest |

<Warning>
  Seed 2.0 Lite supports multimodal input (image/video/text), but output is text-only.
</Warning>

### Technical Specifications

| Parameter            | Seed 2.0 Lite       |
| -------------------- | ------------------- |
| **Release Date**     | February 14, 2026   |
| **Developer**        | ByteDance Seed Team |
| **Input Types**      | Text, Image, Video  |
| **Output Type**      | Text                |
| **Vision Tiers**     | low / high / xhigh  |
| **Knowledge Cutoff** | January 2024        |
| **API Format**       | OpenAI-compatible   |

## Practical Applications

### Recommended Use Cases

Seed 2.0 Lite's cost-efficiency and strong multimodal capabilities make it ideal for:

1. **Unstructured Information Processing**: Document parsing, receipt recognition, contract analysis
2. **Text Content Creation**: Marketing copy, product descriptions, content summarization
3. **Search and Recommendation**: Semantic understanding, intent recognition, content ranking
4. **Data Analysis**: Report interpretation, chart understanding, trend analysis
5. **Video Content Understanding**: Video captioning, content moderation, clip analysis
6. **Agent Workflows**: Multi-step instruction execution, tool calling, function calling

### Code Examples

#### Text Conversation

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="seed-2-0-lite-260228",
    messages=[
        {
            "role": "user",
            "content": "Analyze the following quarterly data and provide key trends and recommendations..."
        }
    ],
    max_tokens=4096
)

print(response.choices[0].message.content)
```

#### Image Understanding

```python theme={null}
response = client.chat.completions.create(
    model="seed-2-0-lite-260228",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analyze the key data and trends in this chart"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/chart.png",
                        "detail": "high"
                    }
                }
            ]
        }
    ],
    max_tokens=4096
)

print(response.choices[0].message.content)
```

#### Tool Calling

```python theme={null}
response = client.chat.completions.create(
    model="seed-2-0-lite-260228",
    messages=[
        {"role": "user", "content": "What's the weather like in Beijing today?"}
    ],
    tools=[
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
)

print(response.choices[0].message)
```

### Best Practices

1. **Choose the Right Vision Tier**:
   * Use default **high** for standard document analysis
   * Use **xhigh** for dense text or complex charts
   * Use **low** for simple classification to save costs

2. **Leverage Multimodal Capabilities**:
   * Mixed image-text input improves information extraction
   * Video understanding supports spatiotemporal analysis for content moderation

3. **Large-Scale Production Deployment**:
   * Lite costs \~1/5 of Pro — prioritize for high-QPS scenarios
   * For knowledge understanding tasks (MMLU-Pro), Lite can fully replace Pro

## Pricing and Availability

### Seed 2.0 Series Comparison

| Variant           | Positioning      | Use Case                      | Cost Level   |
| ----------------- | ---------------- | ----------------------------- | ------------ |
| **Seed 2.0 Pro**  | Flagship         | Highest accuracy tasks        | Highest      |
| **Seed 2.0 Lite** | Production-grade | Daily production tasks        | \~1/5 of Pro |
| **Seed 2.0 Mini** | Lightweight      | Low-latency, high-concurrency | Lowest       |

<Info>
  Seed 2.0 Lite is priced at approximately 1/5 of Pro, while matching or exceeding Pro in some benchmarks (e.g., MMLU-Pro). It is the best value choice for production environments.
</Info>

### Deposit Bonus

<Card title="View Latest Deposit Promotions" icon="gift" href="/faq/recharge-promotions">
  APIYI offers deposit bonuses — the more you deposit, the bigger the bonus. Combined with the model's competitive pricing, your effective cost is even lower.
</Card>

### Available Models

| Model Name             | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `seed-2-0-lite-260228` | General production-grade model with multimodal input |

### How to Access

**APIYI Platform**:

* Website: `apiyi.com`
* API Endpoint: `https://api.apiyi.com/v1`
* OpenAI-compatible format
* Works with all OpenAI SDKs

## Summary and Recommendations

Seed 2.0 Lite is the best value option in ByteDance's Seed 2.0 series, comprehensively outperforming Seed 1.8 in multimodal understanding, instruction following, and reasoning while maintaining highly competitive low costs.

**Core Advantages**:

* **Best Value**: \~1/5 the cost of Pro, surpasses Pro in some benchmarks (MMLU-Pro)
* **Full Multimodal**: Image, video, and text input with flexible vision quality tiers
* **Production-Ready**: Long-context processing, multi-source fusion, high-fidelity structured outputs
* **Strong Agent Capabilities**: Instruction following at 94.0 (COLLIE), major tool calling improvements

**Usage Recommendations**:

1. **Daily production tasks**: Lite is the default choice, balancing capability and cost
2. **High-accuracy needs**: Consider upgrading to Pro for tasks like SWE-Bench
3. **High-concurrency lightweight scenarios**: Consider Mini for lowest cost
4. **Vision-intensive scenarios**: Use xhigh vision tier for best accuracy

**Who Should Use Seed 2.0 Lite**:

* Enterprise users deploying AI capabilities at scale
* Production workflows requiring multimodal document/video analysis
* Developers building agent workflows
* High-QPS applications seeking the best cost-performance ratio

APIYI has fully launched Seed 2.0 Lite — call it directly via OpenAI-compatible API and experience ByteDance's cost-efficient enterprise model today!

<Info>
  Sources: ByteDance Seed official website (`seed.bytedance.com`), LLM Stats (`llm-stats.com`). Seed 2.0 series officially launched February 14, 2026. Data retrieved: March 8, 2026.
</Info>
