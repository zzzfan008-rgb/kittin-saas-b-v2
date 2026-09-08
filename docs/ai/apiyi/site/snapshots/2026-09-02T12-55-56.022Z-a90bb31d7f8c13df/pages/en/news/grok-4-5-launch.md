> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.5 Is Live: Opus-Class Power at Half the Price

> xAI's (SpaceXAI) new flagship Grok 4.5 is now on APIYI: co-trained with Cursor, built for coding and agentic tasks, priced at official-parity $2/$6 per million tokens with ~4x better output-token efficiency than Opus 4.8.

## Key Takeaways

* **Live on launch week**: Grok 4.5 was released on July 8, 2026 and is already available on APIYI as `grok-4.5`, in the default / svip groups
* **Opus-class positioning**: Musk calls it "an Opus-class model, but faster, more token-efficient and lower cost"; it scores 54 on the Artificial Analysis Intelligence Index, ranking #4 (behind Claude Fable 5, Opus 4.8 and GPT-5.5) — and **tops the field on agentic tool use**
* **Coding and agent specialist**: co-trained with Cursor (acquired by SpaceX), scoring 83.3% on Terminal Bench 2.1 — close to Fable (max) at 84.3% — and ranking #1 on the Harvey legal-agent evaluation
* **Standout token efficiency**: averages 15,954 output tokens on SWE Bench Pro, roughly 1/4.2 of Opus 4.8 (max), resolving tasks in about half the steps — which compounds into lower real-world cost
* **Sharp pricing**: \$2.00 per million input tokens and \$6.00 per million output tokens — about half the price of comparable flagships

## Background

On July 8, 2026, SpaceXAI (the brand xAI operates under after folding into SpaceX) released Grok 4.5, billing it as its "smartest model yet" for coding, agentic tasks, and knowledge work.

Two signals stand out. First, the training approach: Grok 4.5 was co-trained with the AI coding tool Cursor, with reinforcement learning spanning hundreds of thousands of real tasks on tens of thousands of NVIDIA GB300 GPUs. Second, the pricing strategy: while it trails Claude Fable 5 on benchmarks, it undercuts comparable flagships by roughly half — a move industry observers widely read as price pressure on Anthropic and OpenAI.

Note that Grok 4.5 is not yet available in the EU on the official platform (expected mid-July); calling it through the APIYI gateway is not subject to that regional restriction.

## Deep Dive

### Benchmarks (data retrieved 2026/7/10)

| Benchmark                              | Grok 4.5     | Reference (Fable max) |
| -------------------------------------- | ------------ | --------------------- |
| Artificial Analysis Intelligence Index | 54 (rank #4) | —                     |
| DeepSWE 1.0 (pass\@1)                  | 62.0%        | 66.1%                 |
| Terminal Bench 2.1                     | 83.3%        | 84.3%                 |
| SWE Bench Pro                          | 64.7%        | 80.4%                 |
| Harvey Legal Agent                     | Rank #1      | —                     |
| Agentic tool use                       | Rank #1      | —                     |

<Info>
  Benchmark sources: the official SpaceXAI announcement at `x.ai/news/grok-4-5`, `artificialanalysis.ai/models/grok-4-5`, and `marktechpost.com` (July 8, 2026).
</Info>

### Core Features

<CardGroup cols={2}>
  <Card title="Agentic & Coding Strength" icon="terminal">
    Co-trained with Cursor, tops agentic tool use, and resolves tasks in roughly half the steps of comparable models — well suited to coding agents and terminal automation
  </Card>

  <Card title="Token Efficiency" icon="gauge">
    Averages 15,954 output tokens on SWE Bench Pro versus 67,020 for Opus 4.8 (max) — about 4.2x fewer, so the same task costs less end to end
  </Card>

  <Card title="Long Context" icon="scroll">
    500K context window (portions beyond 200K are billed at official higher-context rates), with text + image input
  </Card>

  <Card title="Speed" icon="zap">
    Measured output around 80-90 tokens/s, above the class average of roughly 76 tokens/s
  </Card>
</CardGroup>

## Practical Use

### Recommended Scenarios

* **Coding agents / IDE integration**: trained on the same data lineage as Cursor, with standout tool-calling and terminal-task performance
* **High-volume agent pipelines**: high token efficiency and fewer steps mean the cost advantage compounds over long chains
* **Knowledge work**: field-tested #1 result on the Harvey legal-agent evaluation

### Code Example

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="grok-4.5",
    messages=[
        {"role": "user", "content": "Write a binary search in Python and explain the boundary conditions"}
    ]
)
print(response.choices[0].message.content)
```

It speaks the OpenAI-compatible format — existing code only needs the `model` field changed to `grok-4.5`.

## Pricing & Availability

### Pricing

| Item         | Official API       | APIYI                                  |
| ------------ | ------------------ | -------------------------------------- |
| Input        | \$2.00 / 1M tokens | \$2.00 / 1M tokens (official parity)   |
| Output       | \$6.00 / 1M tokens | \$6.00 / 1M tokens (official parity)   |
| Cached input | \$0.50 / 1M tokens | Discounted automatically on cache hits |

<Info>
  Official terms: requests beyond 200K tokens are billed at higher long-context rates; the EU is not yet served on the official platform (expected mid-July), while the APIYI channel has no regional restriction.
</Info>

### Stack It with Recharge Bonuses

APIYI recharge bonuses stack on top, bringing the effective price below official direct billing — see the [recharge promotions guide](/en/faq/recharge-promotions).

## Summary & Recommendations

Grok 4.5's positioning is crisp: rather than chasing the top benchmark spot, it claims the high-volume agent and coding segment with "Opus-class capability at half the price and 4x the token efficiency." If your main workload is coding agents, tool-call-heavy automation, or cost-sensitive long pipelines, Grok 4.5 belongs on your shortlist; for frontier reasoning and complex research, Claude Fable 5 and GPT-5.5 still set the ceiling.

<Info>
  Sources: the official SpaceXAI announcement at `x.ai/news/grok-4-5`, TechCrunch, Artificial Analysis, MarkTechPost; data retrieved July 10, 2026. The model is live on APIYI — grab a key and start calling.
</Info>
