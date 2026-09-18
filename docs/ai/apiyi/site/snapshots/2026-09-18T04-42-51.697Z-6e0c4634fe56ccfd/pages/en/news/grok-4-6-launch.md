> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.6 Is Live: Intelligence Index 61, Level With GPT-5.6

> SpaceXAI (xAI)'s new flagship Grok 4.6 is live on APIYI: an Artificial Analysis Intelligence Index of 61, level with GPT-5.6 Sol Max and 5 points above Grok 4.5. Listed at the official $2/$6 per million tokens, with the GrokOfficial group at 0.8x and top-up bonuses stacking on top to bring input as low as $1.33.

## Key Takeaways

* **New flagship, listed same week**: Grok 4.6 shipped on August 7, 2026 and is live on APIYI as `grok-4.6`
* **Intelligence Index 61**: the Artificial Analysis Intelligence Index (High tier) rises from Grok 4.5's 56 to **61**, matching GPT-5.6 Sol Max
* **Gains from post-training, not scale**: it reuses Grok 4.5's 1.5T-parameter V9 foundation, with the entire delta going into supervised fine-tuning (SFT) and reinforcement learning (RL)
* **Stronger self-verification on long tasks**: xAI reports markedly better self-testing and verification on long-running work, and faster first-draft scaffolding on interactive projects
* **Official list price, then 20% off**: \$2.00 / \$6.00 per million tokens matches xAI's own pricing; the `GrokOfficial` group runs at a 0.8x multiplier, and stacking a 10%–20% top-up bonus brings **input down to \$1.33 and output to \$4.00**

## Background

After Grok 4.5 landed on July 8, 2026, Elon Musk previewed an unusually tight cadence: 4.6 in about two weeks, 4.7 a month after that. On August 7, SpaceXAI shipped Grok 4.6 — one month after its predecessor.

The engineering choice here is worth calling out on its own: Grok 4.6 **did not change the base model**. It reuses Grok 4.5's 1.5T-parameter V9 foundation and puts the entire increment into supervised fine-tuning and reinforcement learning. In other words, this is a post-training release rather than a scaling release — and because neither training nor inference cost moved, the list price didn't either.

For anyone already running the model, the practical read is simple: **same price, same speed, same token efficiency, five more points of intelligence index**. If `grok-4.5` is already in production, the marginal cost of switching is close to zero.

## Deep Dive

### Benchmarks (data retrieved 2026/8/13)

| Benchmark / metric                            | Grok 4.6                          | Grok 4.5 | Reference                  |
| --------------------------------------------- | --------------------------------- | -------- | -------------------------- |
| Artificial Analysis Intelligence Index (High) | **61**                            | 56       | Level with GPT-5.6 Sol Max |
| GDPval-AA v2 (sustained knowledge work)       | Top tier                          | Elo 1543 | —                          |
| AA-Briefcase                                  | Top tier                          | —        | —                          |
| Harvey LAB (legal agent)                      | Top tier                          | 1st      | —                          |
| Parameter count                               | 1.5T (V9 foundation, same as 4.5) | 1.5T     | —                          |

<Info>
  Sources: the SpaceXAI announcement `x.ai/news/grok-4-6`, `artificialanalysis.ai`, and coverage from TradingKey and kie.ai; data retrieved August 13, 2026. xAI has not published per-benchmark SWE-Bench Pro / Terminal Bench figures for 4.6, so the table only lists what is public.
</Info>

### Core Capabilities

<CardGroup cols={2}>
  <Card title="Long-task self-verification" icon="repeat">
    xAI highlights stronger self-testing and verification on long-running agent tasks, so multi-step work drifts less — a fit for codebase collaboration and idea-to-app workflows
  </Card>

  <Card title="500K context" icon="scroll">
    A 500K-token context window with text and image input; requests above 200K are billed at the second, higher-context tier
  </Card>

  <Card title="Cost and speed unchanged" icon="gauge">
    Same foundation means Grok 4.5's token efficiency and output speed carry over, at an unchanged list price
  </Card>

  <Card title="Native in Codex" icon="terminal">
    Grok supports `/v1/responses` natively, so it runs inside OpenAI Codex over the native responses protocol
  </Card>
</CardGroup>

### Specifications

| Item             | Value                                   |
| ---------------- | --------------------------------------- |
| Model name       | `grok-4.6`                              |
| Context window   | 500K tokens                             |
| Input modalities | Text, image                             |
| Endpoints        | `/v1/chat/completions`, `/v1/responses` |
| Billing          | Tiered, with the break at 200K tokens   |

## Putting It to Work

### Where it fits

* **Long-horizon coding agents**: self-verification is the headline upgrade this generation, which cuts rework on long chains
* **Knowledge work and professional agents**: top-tier on GDPval-AA v2, AA-Briefcase, and Harvey LAB
* **Existing grok-4.5 workloads**: same price, same speed — swapping the model name is a straight gain
* **Codex / IDE integration**: native responses protocol, with tool calls and reasoning items intact

### Code sample

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="grok-4.6",
    messages=[
        {"role": "user", "content": "Refactor this code and explain what you changed"}
    ]
)
print(response.choices[0].message.content)
```

It is OpenAI-compatible, so existing code only needs the `model` value changed to `grok-4.6`. Integration details, the four server-side tools, and parameter caveats are the same as the rest of the Grok 4.x line — see the [Grok overview](/en/api-capabilities/grok/overview).

<Warning>
  Grok 4.x chat models run internal reasoning **by default**, and reasoning tokens are billed as output. For cost-sensitive short-answer traffic, see the model-selection guidance in [Chat and Reasoning](/en/api-capabilities/grok/chat).
</Warning>

## Pricing and Availability

### List price

Identical to xAI's own pricing, billed in tiers:

| Context tier       | Input       | Output       | Cached input |
| ------------------ | ----------- | ------------ | ------------ |
| 0 – 200K tokens    | \$2.00 / 1M | \$6.00 / 1M  | \$0.50 / 1M  |
| 200K – 512K tokens | \$4.00 / 1M | \$12.00 / 1M | \$1.00 / 1M  |

### Group discount, and what stacks

The `GrokOfficial` direct-relay group runs at a **0.8x** multiplier — **20% off** the default group's price — with identical model behavior and call syntax. Select the group when creating a token; no code changes required.

The discount stacks with top-up bonuses. Taking the first tier as the example:

| Basis                   | Input / 1M tokens         | Output / 1M tokens        |
| ----------------------- | ------------------------- | ------------------------- |
| xAI official            | \$2.00                    | \$6.00                    |
| APIYI list              | \$2.00 (same as official) | \$6.00 (same as official) |
| `GrokOfficial` at 0.8x  | \$1.60                    | \$4.80                    |
| 0.8x + 10% top-up bonus | \$1.45                    | \$4.36                    |
| 0.8x + 20% top-up bonus | **\$1.33**                | **\$4.00**                |

### Stacking top-up promotions

Tiered top-up bonuses run 10%–20% (calculated per single top-up), and stack with the group discount to push the effective rate lower still — see [Top-up promotions](/en/faq/recharge-promotions).

## Verdict

Grok 4.6 is a capability upgrade with no price attached: the foundation didn't move, the price didn't move, speed and token efficiency didn't move — and the intelligence index went from 56 to 61, level with GPT-5.6 Sol Max. That shape of release is about as friendly to existing users as it gets: changing `grok-4.5` to `grok-4.6` is pure upside, with no cost model to redo.

If your workload is long-horizon coding agents, tool-heavy automation pipelines, or professional agents in legal and consulting, make `grok-4.6` the default. For extremely cost-sensitive traffic on simple tasks, `grok-4.3` (1M context, \$1.25/\$2.50) is still cheaper. To get the lowest effective rate, run on the `GrokOfficial` group and stack a top-up bonus.

<Info>
  Sources: the SpaceXAI announcement `x.ai/news/grok-4-6`, the xAI developer docs `docs.x.ai/docs/models`, Artificial Analysis, and TradingKey; data retrieved August 13, 2026. The model is live on APIYI — grab a key and start calling.
</Info>
