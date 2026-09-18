> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.3 launches: xAI's new flagship, 37.5% input / 58.3% output price cuts

> xAI shipped Grok 4.3 on April 30, 2026: Intelligence Index 53, GDPval-AA ELO 1500, τ²-Bench 98%, IFBench 81%, 159 tokens/s. Listed at just \$1.25 / \$2.50 per 1M tokens, available on all common groups, ~85% of upstream pricing after the 10% recharge bonus.

## Key Highlights

* **xAI's new flagship** — Grok 4.3 (April 30, 2026), positioned for "lowest hallucination rate, strongest agentic tool calling, best instruction following"
* **Major price cuts** — input down **37.5%** and output down **58.3%** vs. Grok 4.20 0309 v2; full Intelligence Index eval costs about 20% less
* **Blazing fast** — 159 tokens/s output, well above the 64.6 t/s median for same-tier reasoning models
* **Million-token context + multimodal** — 1M context window, text + image input, always-on reasoning (cannot be disabled)
* **All common groups available** — Default, SVIP, etc. all open; **deposit \$100 get 10% bonus, \~85% of xAI's upstream pricing**

## Background

On April 30, 2026 (UTC+8), xAI shipped **Grok 4.3** as the next flagship after Grok 4.20. The headline isn't a benchmark sweep — it's a **cost-performance leap**: a score of 53 on the Artificial Analysis Intelligence Index with the full eval suite costing only \$395 to run, \~20% cheaper than Grok 4.20 0309 v2.

xAI's official positioning calls out "industry-leading non-hallucination rate, agentic tool calling, and instruction following" — three dimensions all targeted at production-grade agent workloads. On the Intelligence Index, Grok 4.3 edges past Claude Sonnet 4.6; the single biggest jump is on GDPval-AA, where ELO leapt from Grok 4.20 v2's 1179 straight to **1500** — a 321-point one-generation gain.

APIYI has shipped Grok 4.3 with **all common user groups (Default, SVIP, etc.) open** — pricing is friendly, blast radius is contained, no need to gate it like GPT-5.5 Pro. Stack the 10% deposit bonus and effective cost lands around 85% of xAI's upstream rate.

## Detailed Breakdown

### Core Capabilities

<CardGroup cols={2}>
  <Card title="Industry-leading agent tool calling" icon="bot">
    τ²-Bench Telecom 98%, IFBench 81%; stable on complex tool chains and multi-step agents
  </Card>

  <Card title="Lowest-class hallucination rate" icon="shield-check">
    AA-Omniscience Accuracy +8 vs. previous; xAI claims industry-leading non-hallucination rate
  </Card>

  <Card title="Very fast output" icon="bolt">
    159 tokens/s — 2.5× the 64.6 t/s median for same-tier reasoning models
  </Card>

  <Card title="Million-token context + multimodal" icon="book-open">
    1M tokens context, text + image input, always-on reasoning
  </Card>
</CardGroup>

### Benchmarks

| Benchmark                   | Grok 4.3    | Grok 4.20 v2 | Δ                     |
| --------------------------- | ----------- | ------------ | --------------------- |
| **Intelligence Index**      | **53**      | 49           | +4                    |
| **GDPval-AA (ELO)**         | **1500**    | 1179         | **+321**              |
| **τ²-Bench Telecom**        | **98%**     | —            | Industry-leading      |
| **IFBench**                 | **81%**     | —            | Instruction following |
| **AA-Omniscience Accuracy** | +8 vs. v2   | baseline     | Accuracy lift         |
| **Output speed**            | **159 t/s** | lower        | Big jump              |
| **Cost to run Index**       | **\$395**   | \~\$494      | -20%                  |

<Info>
  Sources: xAI official announcement, Artificial Analysis independent benchmarks (April 30, 2026). The Intelligence Index aggregates multiple benchmarks and is a useful proxy for overall model intelligence.
</Info>

### Tech Specs

| Parameter            | Grok 4.3                                   |
| -------------------- | ------------------------------------------ |
| **Model name**       | `grok-4.3`                                 |
| **Context window**   | 1,000,000 tokens                           |
| **Max output**       | No explicit cap (within remaining context) |
| **Input modalities** | Text + image                               |
| **Reasoning mode**   | Always-on reasoning (cannot be disabled)   |
| **Output speed**     | \~159 tokens/s                             |
| **API endpoint**     | `/v1/chat/completions`                     |
| **Available groups** | **Default, SVIP**, and other common groups |

## Practical Use

### Recommended Scenarios

Grok 4.3's combo — high speed + low price + strong agent — fits well for:

1. **Production agent workflows** — high-frequency tool calls, multi-step planning, scenarios that demand stable instruction following
2. **Large-scale document processing** — 1M context + 159 t/s makes long-doc summarization and cross-file audits run fast
3. **Customer support / telecom dialogues** — 98% on τ²-Bench Telecom suggests strong performance on ticketing and tech-support tool-calling tasks
4. **Multimodal analysis** — image + text mixed input for screenshot analysis, chart reading
5. **Cost-sensitive high-QPS apps** — low unit price + fast speed makes Grok 4.3 a reasonable substitute for GPT-5.4 / Claude Sonnet in some flows

### Code Examples

#### Standard call

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="grok-4.3",
    messages=[
        {"role": "user", "content": "Analyze this customer ticket and propose a resolution"}
    ],
    max_tokens=4096
)

print(response.choices[0].message.content)
```

#### Multimodal call (image + text)

```python theme={null}
response = client.chat.completions.create(
    model="grok-4.3",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's the cause of this error in the screenshot?"},
                {"type": "image_url", "image_url": {"url": "https://example.com/error.png"}}
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

#### Agent tool calling

```python theme={null}
tools = [
    {
        "type": "function",
        "function": {
            "name": "query_order_status",
            "description": "Look up a customer order status",
            "parameters": {
                "type": "object",
                "properties": {"order_id": {"type": "string"}},
                "required": ["order_id"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="grok-4.3",
    messages=[{"role": "user", "content": "Check the status of order #A1024"}],
    tools=tools,
    tool_choice="auto"
)
```

### Best Practices

1. **Pick it for agents** — τ²-Bench / IFBench data points to a clear edge in tool calling and instruction following over generic models
2. **Mind the 200K context tier** — past 200K, input/output prices double; control prompt length on long-doc workflows
3. **Always-on reasoning is default** — reasoning tokens count against your output bill; even simple tasks incur some reasoning spend
4. **Speed-first chat** — 159 t/s throughput makes Grok 4.3 great for "stream-and-render" real-time chat UX
5. **Stack the recharge bonus** — APIYI's deposit \$100 / +10% offer effectively brings cost to \~85% of upstream

## Pricing & Availability

### Pricing (Tiered)

| Context range       | Input              | Output             | Notes                               |
| ------------------- | ------------------ | ------------------ | ----------------------------------- |
| **0 – 200K tokens** | \$1.25 / 1M tokens | \$2.50 / 1M tokens | Standard tier, matches xAI upstream |
| **200K – ∞ tokens** | \$2.50 / 1M tokens | \$5.00 / 1M tokens | Long-context tier, 2x premium       |

<Frame>
  <img src="https://mintcdn.com/apiyillc/_VzXicItDKpC5c0P/images/grok-4-3-pricing.png?fit=max&auto=format&n=_VzXicItDKpC5c0P&q=85&s=cf7ea3e3ce3d96d77c3dd7a7b3bbf55b" alt="grok-4.3 tiered pricing: 0-200K input $1.25 output $2.50; 200K-∞ input $2.50 output $5.00" width="1636" height="708" data-path="images/grok-4-3-pricing.png" />
</Frame>

### Price comparison with recent models

| Model             | Input      | Output     | Speed       | Position                    |
| ----------------- | ---------- | ---------- | ----------- | --------------------------- |
| **Grok 4.3**      | **\$1.25** | **\$2.50** | **159 t/s** | High-speed agent value pick |
| Grok 4.20         | \$2.00     | \$6.00     | lower       | Previous flagship           |
| Claude Sonnet 4.6 | \$3.00     | \$15.00    | medium      | Coding generalist           |
| GPT-5.5           | \$5.00     | \$30.00    | medium      | Frontier reasoning          |
| Gemini 3 Pro      | \$2.00     | \$12.00    | higher      | Multimodal                  |

<Info>
  At \$1.25 / \$2.50, Grok 4.3 has essentially no same-tier rival — comparable-performance models cost 2-10× more. Cost-performance is the headline.
</Info>

### Stack with site recharge promotions

<Card title="Deposit $100 get 10% bonus, ~85% of upstream" icon="gift" href="/en/faq/recharge-promotions">
  APIYI offers a deposit \$100 / +10% bonus. Stacked on listed pricing, effective cost lands around 85% of xAI's upstream rate — better the longer you use it.
</Card>

### Available models & groups

| Model name | Channel            | Available groups                           | Notes                        |
| ---------- | ------------------ | ------------------------------------------ | ---------------------------- |
| `grok-4.3` | xAI official relay | **Default, SVIP**, and other common groups | Latest, auto-tracks upstream |

### Access

* Site: `apiyi.com`
* API endpoint: `https://api.apiyi.com/v1`
* OpenAI SDK compatible — just swap `base_url`, `api_key`, and set `model` to `grok-4.3`

## Summary & Recommendations

Grok 4.3 is xAI's most cost-effective flagship to date: **\$1.25 / \$2.50 + 159 t/s + 1M context + strong agent skills** — a combination that has essentially no competitor in the \$1-3 input-price band.

**Worth trying / migrating to Grok 4.3 when**:

* You're already running Grok 4.20 / Claude Sonnet 4.6 / GPT-5.4 mini for agent tasks — evaluate migration first
* High-frequency tool calling, customer-support automation, telecom-style ticketing
* Cost-sensitive, high-QPS real-time chat products
* Workloads needing image input multimodal analysis

**Don't switch when**:

* You're already on GPT-5.5 / Claude Opus 4.7 for the hardest reasoning (Grok 4.3's intelligence ceiling is lower)
* You depend heavily on OpenAI/Anthropic-specific API behaviors (e.g., OpenAI's strict function schema)
* You're stable on GPT-5.4 / Gemini 3 Pro and the migration upside is marginal

APIYI has Grok 4.3 open on **Default, SVIP, and other common groups** — friendly pricing, fast speed, contained risk. After the 10% recharge bonus, effective cost is roughly 85% of xAI's upstream. Recommend a small-scale A/B on your real workloads before rolling out broadly.

<Info>
  Sources: xAI official API docs (docs.x.ai), Artificial Analysis independent benchmarks, VentureBeat and The Decoder coverage. Data captured: May 3, 2026 (UTC+8).
</Info>
