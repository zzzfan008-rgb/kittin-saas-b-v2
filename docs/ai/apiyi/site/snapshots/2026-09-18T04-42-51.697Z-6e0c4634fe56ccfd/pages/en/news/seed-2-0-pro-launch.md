> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.0 Pro: ByteDance's Flagship Reasoning Model

> ByteDance Seed 2.0 Pro flagship reasoning model is now available on APIYI, with AIME 2025 at 98.3, Codeforces 3020, SWE-Bench Verified 76.5%, multimodal understanding and Agent workflows via OpenAI-compatible API.

## Key Highlights

* **Flagship Reasoning**: AIME 2025 at 98.3, AIME 2026 at 94.2, world-class mathematical reasoning
* **Top-Tier Coding**: Codeforces rating 3020 (no tools), LiveCodeBench v6 at 87.8, SWE-Bench Verified 76.5%
* **Powerful Agent Capabilities**: BrowseComp 77.3, tau2-Bench Retail 90.4 / Telecom 94.2, WideSearch 74.7
* **Multimodal Understanding**: Image, video, and text input, VideoMME 89.5, MMMU 85.4
* **Global Competitiveness**: LMArena leaderboard #6, competing directly with GPT-5.2, Claude Opus 4.5, Gemini 3 Pro

## Background

On February 14, 2026, ByteDance's Seed team officially launched the Seed 2.0 series of large language models, featuring four variants — Pro, Lite, Mini, and Code. **Seed 2.0 Pro**, as the flagship variant, is positioned as the highest-accuracy reasoning and agent model, demonstrating world-class performance in mathematics, coding, multimodal understanding, and complex workflow execution.

Seed 2.0 Pro is one of the core models behind the Doubao app, which has over 155 million weekly active users. The Pro variant is designed for scenarios requiring long-chain reasoning, complex decision-making, and multi-step task execution.

APIYI has now launched the latest version `seed-2-0-pro-260328`, accessible via OpenAI-compatible API.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="Flagship Reasoning" icon="brain">
    AIME 2025 at 98.3, GPQA Diamond 88.9, robust long-chain reasoning for complex math and science problems
  </Card>

  <Card title="Top-Tier Coding" icon="code">
    Codeforces 3020 (no tools), SWE-Bench 76.5%, TerminalBench 2.0 at 55.8, covering competitive to production coding
  </Card>

  <Card title="Agent Workflows" icon="bot">
    BrowseComp 77.3, tau2-Bench retail/telecom both above 90, designed for long-chain task execution and tool-enhanced reasoning
  </Card>

  <Card title="Multimodal Understanding" icon="image">
    Image, video, and text input, VideoMME 89.5, MMMU 85.4, MotionBench 75.2
  </Card>
</CardGroup>

### Performance Highlights

Seed 2.0 Pro achieves world-class scores across major benchmarks:

| Category       | Benchmark            | Seed 2.0 Pro | Notes                           |
| -------------- | -------------------- | ------------ | ------------------------------- |
| **Math**       | AIME 2025            | **98.3**     | Near-perfect                    |
| **Math**       | AIME 2026            | **94.2**     | Latest math competition         |
| **Math**       | GPQA Diamond         | **88.9**     | Graduate-level reasoning        |
| **Math**       | MathVision           | **88.8**     | Visual math reasoning           |
| **Knowledge**  | MMLU-Pro             | **87.0**     | Professional knowledge          |
| **Coding**     | Codeforces           | **3020**     | No-tool competitive programming |
| **Coding**     | LiveCodeBench v6     | **87.8**     | Live coding benchmark           |
| **Coding**     | SWE-Bench Verified   | **76.5%**    | Software engineering            |
| **Coding**     | TerminalBench 2.0    | **55.8**     | Terminal operation              |
| **Multimodal** | VideoMME             | **89.5**     | Video understanding             |
| **Multimodal** | MMMU                 | **85.4**     | University-level multimodal     |
| **Agent**      | BrowseComp           | **77.3**     | Browser operation               |
| **Agent**      | tau2-Bench (Retail)  | **90.4**     | Retail agent tasks              |
| **Agent**      | tau2-Bench (Telecom) | **94.2**     | Telecom agent tasks             |

<Info>
  Data sources: ByteDance Seed official website (`seed.bytedance.com`) and LLM Stats (`llm-stats.com`). Seed 2.0 series officially launched February 14, 2026.
</Info>

**Competitive Comparison**:

* **vs GPT-5.2**: Input cost \~1/3.7, output cost \~1/5.9
* **vs Claude Opus 4.5**: Input cost \~1/10
* **vs Gemini 3 Pro**: Each has advantages in different agent and math reasoning tasks
* Seed 2.0 Pro won gold medals at ICPC, IMO, and CMO competitions

### Technical Specifications

| Parameter            | Seed 2.0 Pro                         |
| -------------------- | ------------------------------------ |
| **Model Version**    | seed-2-0-pro-260328                  |
| **Release Date**     | February 14, 2026 (Updated March 28) |
| **Developer**        | ByteDance Seed Team                  |
| **Input Types**      | Text, Image, Video                   |
| **Output Type**      | Text                                 |
| **Knowledge Cutoff** | January 2024                         |
| **API Format**       | OpenAI-compatible                    |

## Practical Applications

### Recommended Use Cases

Seed 2.0 Pro's flagship reasoning and agent capabilities make it ideal for:

1. **Complex Math & Science Reasoning**: Advanced proofs, research assistance, quantitative analysis
2. **Advanced Coding Tasks**: Code generation, code review, large-scale refactoring, bug fixing
3. **Agent Workflows**: Multi-step automation, browser operation, complex decision chains
4. **Image-to-Code**: Converting design mockups into functional web pages
5. **3D Design & CAD**: Engineering design and modeling assistance
6. **Multimodal Document Analysis**: Deep understanding of complex charts and video content

### Code Examples

#### Text Conversation

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="seed-2-0-pro-260328",
    messages=[
        {
            "role": "user",
            "content": "Prove that n^3 + 2n is divisible by 3 for all positive integers n"
        }
    ],
    max_tokens=4096
)

print(response.choices[0].message.content)
```

#### Image Understanding

```python theme={null}
response = client.chat.completions.create(
    model="seed-2-0-pro-260328",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Convert this design mockup into HTML + CSS code"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/design.png",
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
    model="seed-2-0-pro-260328",
    messages=[
        {"role": "user", "content": "Search for recent flights and compare prices"}
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "search_flights",
                "description": "Search for flight information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "origin": {"type": "string", "description": "Departure city"},
                        "destination": {"type": "string", "description": "Destination city"},
                        "date": {"type": "string", "description": "Departure date"}
                    },
                    "required": ["origin", "destination", "date"]
                }
            }
        }
    ]
)

print(response.choices[0].message)
```

### Best Practices

1. **Leverage long-chain reasoning**: Pro excels at complex multi-step problems — use Lite or Mini for simpler tasks to save costs
2. **Prefer Pro for Agent scenarios**: When tool calling and multi-step decisions are needed, Pro's robustness far exceeds other variants
3. **Pair with Lite**: Use Lite (\~1/5 of Pro's cost) for routine production tasks, upgrade to Pro for high-accuracy needs

## Pricing and Availability

### Seed 2.0 Series Comparison

| Variant           | Positioning        | Use Case                          | Cost Level   |
| ----------------- | ------------------ | --------------------------------- | ------------ |
| **Seed 2.0 Pro**  | Flagship reasoning | Highest accuracy, Agent workflows | Highest      |
| **Seed 2.0 Lite** | Production-grade   | Daily production, high QPS        | \~1/5 of Pro |
| **Seed 2.0 Mini** | Lightweight        | Low-latency, high-concurrency     | Lowest       |
| **Seed 2.0 Code** | Coding-specific    | Software development (TRAE)       | -            |

<Info>
  Seed 2.0 Pro input pricing is approximately \$0.47/M tokens, output \$2.37/M tokens — significantly cheaper than GPT-5.2 (\$1.75/\$14.00) and Claude Opus 4.5 (\$5.00/\$25.00).
</Info>

### Deposit Bonus

<Card title="View Latest Deposit Promotions" icon="gift" href="/en/faq/recharge-promotions">
  APIYI offers deposit bonuses — the more you deposit, the bigger the bonus. Combined with the model's competitive pricing, your effective cost is even lower.
</Card>

### Available Models

| Model Name            | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `seed-2-0-pro-260328` | Flagship reasoning model, latest version (March 28, 2026) |

### How to Access

**APIYI Platform**:

* Website: `apiyi.com`
* API Endpoint: `https://api.apiyi.com/v1`
* OpenAI-compatible format
* Works with all OpenAI SDKs

## Summary and Recommendations

Seed 2.0 Pro is ByteDance's flagship model in the Seed 2.0 series, achieving world-class performance in mathematical reasoning, coding, and agent workflows, while being significantly more affordable than comparable competitors.

**Core Advantages**:

* **Reasoning King**: AIME 2025 at 98.3, Codeforces 3020, IMO/ICPC/CMO gold medals
* **Strong Agent Capabilities**: BrowseComp 77.3, tau2-Bench above 90, ideal for complex automation
* **Multimodal Understanding**: Video, image, and text coverage, VideoMME 89.5
* **Highly Competitive Pricing**: \~4-6x cheaper than GPT-5.2, \~10x cheaper than Opus 4.5

**Usage Recommendations**:

1. **High-difficulty reasoning**: Pro is the first choice, especially for math proofs and research
2. **Agent workflows**: Pro offers the best long-chain reasoning robustness
3. **Daily production**: Consider Lite (\~1/5 of Pro's cost), comparable in some tasks
4. **High-concurrency lightweight**: Consider Mini for lowest cost

**Who Should Use Seed 2.0 Pro**:

* Researchers and engineers needing maximum reasoning accuracy
* Developers building complex agent systems
* Teams requiring high-quality code generation and review
* Enterprise users seeking flagship performance with cost efficiency

APIYI has fully launched the latest Seed 2.0 Pro — call it via OpenAI-compatible API and experience ByteDance's flagship reasoning model today!

<Info>
  Sources: ByteDance Seed official website (`seed.bytedance.com`), LLM Stats (`llm-stats.com`), TechNode. Seed 2.0 series launched February 14, 2026. `seed-2-0-pro-260328` is the March 28, 2026 updated version. Data retrieved: March 30, 2026.
</Info>
