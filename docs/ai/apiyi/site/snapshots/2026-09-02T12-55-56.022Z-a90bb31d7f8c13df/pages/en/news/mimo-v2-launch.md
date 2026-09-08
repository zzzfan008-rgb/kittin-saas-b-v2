> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiMo-V2 Series: Xiaomi's Trillion-Parameter Agent Model

> Xiaomi launches MiMo-V2-Pro (1T+ parameter reasoning model) and MiMo-V2-Omni (unified multimodal model). Pro approaches Claude Opus 4.6 at 1/6th the price. Now available on APIYI.

## Key Highlights

* **Trillion Parameters**: MiMo-V2-Pro has 1T+ total parameters, 42B active, MoE architecture
* **Near-Top Performance**: AA Intelligence Index 49 (#8 globally), ClawEval 61.5 approaching Opus 4.6 (66.3), coding surpasses Sonnet 4.6
* **1/6th the Price**: Pro at \$1 input / \$3 output per M tokens — roughly 1/6th of GPT-5.2 and Opus 4.6
* **Full Multimodal**: MiMo-V2-Omni accepts text, image, video, and audio — with 10+ hours continuous audio understanding
* **1M Context**: Pro supports 1 million token context window

## Background

On March 18-19, 2026, Xiaomi officially launched the MiMo-V2 model family. MiMo-V2-Pro had previously been circulating anonymously on OpenRouter under the codename "Hunter Alpha", generating significant buzz before Xiaomi claimed ownership.

MiMo-V2-Pro is designed as an agentic foundation model optimized for orchestrating complex workflows, tool use, and code execution. MiMo-V2-Omni is a unified multimodal model that natively processes text, image, video, and audio — claimed to be the first omni model supporting 10+ hours of continuous audio understanding.

Both models are now available on APIYI.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="Trillion-Parameter MoE" icon="microchip">
    Pro: 1T+ total params, 42B active, 7:1 hybrid attention ratio
  </Card>

  <Card title="Exceptional Value" icon="coins">
    Pro at \$1/\$3 per M tokens — \~1/6th the cost of comparable models
  </Card>

  <Card title="Full Multimodal" icon="layers">
    Omni accepts text, image, video, and audio inputs natively
  </Card>

  <Card title="1M Context" icon="scroll-text">
    Pro: 1M token context window, 131,072 max output tokens
  </Card>
</CardGroup>

### MiMo-V2-Pro Performance

| Benchmark                 | MiMo-V2-Pro          | Claude Opus 4.6 | GPT-5.2 | Notes                           |
| ------------------------- | -------------------- | --------------- | ------- | ------------------------------- |
| **AA Intelligence Index** | **49**               | —               | —       | #8 globally, #2 Chinese LLM     |
| **ClawEval**              | **61.5**             | 66.3            | 50.0    | Agentic benchmark               |
| **Coding**                | Surpasses Sonnet 4.6 | —               | —       | Code generation & understanding |

### MiMo-V2-Omni Performance

| Benchmark                 | MiMo-V2-Omni           | Comparison        | Notes                               |
| ------------------------- | ---------------------- | ----------------- | ----------------------------------- |
| **AA Intelligence Index** | **43**                 | avg. 14           | Far above average                   |
| **BigBench Audio**        | **94.0**               | —                 | Audio understanding                 |
| **MMAU-Pro**              | **69.4**               | —                 | Multimodal audio understanding      |
| **Image Understanding**   | Surpasses Opus 4.6     | MMMU-Pro, CharXiv | Visual reasoning                    |
| **Audio Understanding**   | Surpasses Gemini 3 Pro | —                 | Environmental sounds, multi-speaker |

### Technical Specs

| Spec                 | MiMo-V2-Pro                         | MiMo-V2-Omni                 |
| -------------------- | ----------------------------------- | ---------------------------- |
| **Context Window**   | 1,000,000 tokens                    | 256,000 tokens               |
| **Max Output**       | 131,072 tokens                      | —                            |
| **Input Modalities** | Text + image                        | Text + image + video + audio |
| **Output**           | Text                                | Text                         |
| **Architecture**     | MoE (1T+ total, 42B active)         | Unified multimodal           |
| **Special**          | Chain-of-thought, agentic workflows | 10+ hour continuous audio    |

## Getting Started

### Code Example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# MiMo-V2-Pro - complex reasoning and coding
response = client.chat.completions.create(
    model="mimo-v2-pro",
    messages=[
        {"role": "user", "content": "Design a high-concurrency message queue architecture supporting 1M+ TPS..."}
    ]
)
print(response.choices[0].message.content)
```

```python theme={null}
# MiMo-V2-Omni - multimodal understanding
response = client.chat.completions.create(
    model="mimo-v2-omni",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Describe the contents of this image"},
                {"type": "image_url", "image_url": {"url": "https://example.com/image.png"}}
            ]
        }
    ]
)
print(response.choices[0].message.content)
```

### Recommended Use Cases

<CardGroup cols={2}>
  <Card title="MiMo-V2-Pro" icon="brain">
    Complex coding, agentic workflows, deep reasoning, long document analysis (1M context)
  </Card>

  <Card title="MiMo-V2-Omni" icon="film">
    Video understanding, audio transcription & analysis, multimodal document parsing, chart analysis
  </Card>
</CardGroup>

## Pricing & Availability

### Pricing

| Model                      | Input Price       | Output Price      | Notes                    |
| -------------------------- | ----------------- | ----------------- | ------------------------ |
| `mimo-v2-pro` (up to 256K) | \$1.00 / M tokens | \$3.00 / M tokens | Reasoning model with CoT |
| `mimo-v2-pro` (256K–1M)    | \$2.00 / M tokens | \$6.00 / M tokens | Extended context         |
| `mimo-v2-omni`             | \$0.40 / M tokens | \$2.00 / M tokens | Full multimodal          |

<Info>
  MiMo-V2-Pro is priced at roughly 1/6th of Claude Opus 4.6 and GPT-5.2 — exceptional value.
</Info>

### Deposit Bonuses

Top-up promotions apply. See [promotion details](/en/faq/recharge-promotions).

## Summary & Recommendations

The MiMo-V2 series is Xiaomi's major AI play. Pro approaches Opus 4.6 on agentic benchmarks with its trillion-parameter architecture and 1M context, at just 1/6th the price. Omni's unified multimodal understanding — especially 10+ hour audio — stands out among competitors.

**Recommendation**: Choose Pro for high-value reasoning and coding tasks. Choose Omni for multimodal understanding, especially audio and video.

<Warning>
  MiMo-V2 series was recently launched. Implement proper error handling for production use and watch for updates.
</Warning>

<Info>
  Sources: Xiaomi official site `mimo.xiaomi.com`, Artificial Analysis benchmarks, OpenRouter pricing. Data retrieved: March 2026.
</Info>
