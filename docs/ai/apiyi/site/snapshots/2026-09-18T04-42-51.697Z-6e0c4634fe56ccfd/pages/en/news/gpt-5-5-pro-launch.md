> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.5 Pro lands on official-relay: OpenAI's strongest reasoning model

> OpenAI opened the GPT-5.5 Pro API on April 24, 2026: Terminal-Bench 2.0 82.7%, Expert-SWE 73.1%, GDPval 84.9%, priced 6× the base version. APIYI's official-relay channel is now live, restricted to the SVIP group only — single calls can run several dollars, use with care.

## Key Highlights

* **OpenAI's strongest reasoning model today** — flagship reasoning variant for the hardest professional workflows; significantly higher accuracy than base GPT-5.5
* **Top-tier agentic / coding scores** — Terminal-Bench 2.0 82.7%, Expert-SWE 73.1%, GDPval 84.9%
* **Million-token context** — 1,050,000 input window, 128,000 max output
* **Tiered pricing** — \$30 / \$180 per 1M tokens for the 0–272K range; \$60 / \$270 for 272K–∞ (long-context 2x premium)
* **SVIP group only** — not exposed on the Default group to prevent misuse: **a single call can cost several dollars**; confirm you need it before calling

## Background

On April 23, 2026 (UTC+8), OpenAI launched **GPT-5.5 Pro** alongside the standard GPT-5.5, with full API availability landing April 24. GPT-5.5 Pro is positioned as "OpenAI's strongest reasoning model" — built for the toughest professional research, long-horizon code, and autonomous agent workflows.

Compared with base GPT-5.5 (\$5 input / \$30 output), GPT-5.5 Pro's per-token rate jumps **6×** to \$30 input / \$180 output per 1M tokens. OpenAI's framing: Pro spends a much larger reasoning budget and runs stricter multi-pass verification, delivering significantly higher accuracy on the hardest tasks — at exponentially higher compute cost.

After a week of upstream stability monitoring, APIYI shipped `gpt-5.5-pro` on the **OpenAI official-relay channel** on May 3, 2026. Behavior and rate limits match upstream exactly. Because a single call can burn several dollars, the model is **restricted to the SVIP group only** — it is NOT mounted on the Default group to prevent new users from accidentally racking up charges.

## Detailed Breakdown

### Core Capabilities

<CardGroup cols={2}>
  <Card title="Top agentic performance" icon="bot">
    Terminal-Bench 2.0 82.7% — sets a new high for OpenAI agentic coding
  </Card>

  <Card title="Long-horizon code chops" icon="code">
    Expert-SWE long-horizon benchmark 73.1%, leading on cross-file multi-step tasks
  </Card>

  <Card title="Domain-expert accuracy" icon="shield-check">
    GDPval 84.9% across high-bar professional tasks (law, medicine, research)
  </Card>

  <Card title="Million-token context" icon="book-open">
    1.05M input + 128K output — fits whole codebases or multiple long docs
  </Card>
</CardGroup>

### Benchmarks

| Benchmark              | GPT-5.5 Pro | Notes                                                      |
| ---------------------- | ----------- | ---------------------------------------------------------- |
| **Terminal-Bench 2.0** | **82.7%**   | OpenAI's highest agentic-coding score to date              |
| **Expert-SWE**         | **73.1%**   | Internal long-horizon SWE benchmark, multi-file reasoning  |
| **GDPval**             | **84.9%**   | Composite professional eval across high-bar industries     |
| **FrontierMath**       | SOTA        | One of the few open evals to publish frontier math results |
| **CyberGym**           | SOTA        | Cybersecurity reasoning evaluation                         |

<Info>
  Source: OpenAI official model card (April 23, 2026). Benchmark results vary with eval conditions. Pro shows clear gains over base GPT-5.5 on hard tasks but the gap narrows on routine workloads.
</Info>

### Tech Specs

| Parameter            | GPT-5.5 Pro                             |
| -------------------- | --------------------------------------- |
| **Model name**       | `gpt-5.5-pro`                           |
| **Snapshot**         | `gpt-5.5-pro-2026-04-23`                |
| **Context window**   | 1,050,000 tokens                        |
| **Max output**       | 128,000 tokens                          |
| **Knowledge cutoff** | December 1, 2025                        |
| **Reasoning tokens** | Yes (larger budget than base)           |
| **API endpoints**    | `/v1/chat/completions`, `/v1/responses` |
| **Available group**  | **SVIP only**                           |

## Practical Use

### Recommended Scenarios

GPT-5.5 Pro's price tag rules it out for everyday chat or routine tasks. Reserve it for high-value scenarios:

1. **Hardest code engineering** — million-line codebase audits, cross-module deadlock root-cause, Expert-SWE-style long-chain tasks
2. **Professional research** — deep legal analysis, clinical decision support, complex financial modeling — anywhere errors are catastrophic
3. **Long-context synthesis** — million-token cross-document comparison, contract review, patent analysis
4. **Autonomous agent planning** — multi-step planning with self-correction in complex agent workflows
5. **What base GPT-5.5 can't crack** — try `gpt-5.5` first; only escalate to Pro when you've confirmed it can't solve the task

### Code Examples

#### Standard call

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",  # Must be an SVIP-group key
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-5.5-pro",
    messages=[
        {"role": "user", "content": "Analyze this 800-page contract for compliance risks..."}
    ],
    max_tokens=16384
)

print(response.choices[0].message.content)
```

#### Long-context (mind the 272K tier)

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.5-pro",
    messages=[
        {"role": "user", "content": long_codebase_audit_prompt}  # total tokens > 272K
    ],
    max_tokens=32768
)
# Note: above 272K context, input/output prices double
# Single-call cost can jump from a few dollars to double-digits — evaluate carefully
```

### Best Practices

1. **Try base first** — 90% of "hard" tasks are solved by `gpt-5.5`; only escalate when truly stuck
2. **Watch the context budget** — keep total tokens under 272K to avoid the 2x long-context tier
3. **Hard budget limits in your app** — enforce `max_tokens` and per-user quotas to prevent runaway spend
4. **Batch jobs use Batch API** — OpenAI's official Batch API gives 50% off (APIYI hasn't enabled this discount channel yet)
5. **Not for real-time high-frequency apps** — Pro responses are slower and pricier; don't use it as a chat-bot backend

## Pricing & Availability

### Pricing (Tiered)

| Context range       | Input               | Output               | Notes                                  |
| ------------------- | ------------------- | -------------------- | -------------------------------------- |
| **0 – 272K tokens** | \$30.00 / 1M tokens | \$180.00 / 1M tokens | Standard tier, matches OpenAI upstream |
| **272K – ∞ tokens** | \$60.00 / 1M tokens | \$270.00 / 1M tokens | Long-context tier, 2x premium          |

<Frame>
  <img src="https://mintcdn.com/apiyillc/_VzXicItDKpC5c0P/images/gpt-5-5-pro-pricing.png?fit=max&auto=format&n=_VzXicItDKpC5c0P&q=85&s=e3b5a76501732134712113732fdbe284" alt="gpt-5.5-pro tiered pricing: 0-272K input $30 output $180; 272K-∞ input $60 output $270" width="1652" height="662" data-path="images/gpt-5-5-pro-pricing.png" />
</Frame>

### Single-call cost estimates

| Scenario             | Input tokens | Output tokens | Est. cost                       |
| -------------------- | ------------ | ------------- | ------------------------------- |
| Short Q\&A           | 5K           | 2K            | \~\$0.51                        |
| Mid-size code review | 50K          | 8K            | \~\$2.94                        |
| Long-doc analysis    | 200K         | 16K           | \~\$8.88                        |
| **Ultra-long audit** | **500K**     | **32K**       | **\~\$24.84** (with 2x premium) |

<Warning>
  **A single call can cost several dollars to over ten dollars.** To prevent accidental misuse, `gpt-5.5-pro` is NOT exposed on the Default group — **only SVIP keys can call it**. Confirm the use case is worth it, and always set budget alarms in your application layer.
</Warning>

### Price comparison with recent models

| Model           | Input       | Output       | Position                                |
| --------------- | ----------- | ------------ | --------------------------------------- |
| **GPT-5.5 Pro** | **\$30.00** | **\$180.00** | OpenAI's strongest reasoning            |
| GPT-5.5         | \$5.00      | \$30.00      | Base frontier model                     |
| GPT-5.4         | \$2.50      | \$15.00      | Previous flagship, still cost-effective |
| Claude Opus 4.7 | \$5.00      | \$25.00      | Coding flagship                         |
| Gemini 3 Pro    | \$2.00      | \$12.00      | Multimodal                              |

### Stack with site recharge promotions

<Card title="Latest recharge promotions" icon="gift" href="/en/faq/recharge-promotions">
  APIYI offers recharge bonuses; pricing matches upstream and bonuses help amortize per-call cost.
</Card>

### Available models & groups

| Model name               | Channel               | Group    | Notes                                         |
| ------------------------ | --------------------- | -------- | --------------------------------------------- |
| `gpt-5.5-pro`            | OpenAI official relay | **SVIP** | Current latest, auto-tracks upstream snapshot |
| `gpt-5.5-pro-2026-04-23` | OpenAI official relay | **SVIP** | Pinned snapshot version                       |

For SVIP group access, contact support or check the upgrade criteria under "Group Management" in the dashboard.

## Summary & Recommendations

GPT-5.5 Pro is OpenAI's strongest — and most expensive — general reasoning model today. The value lives in **accuracy ceiling on the hardest tasks**: Terminal-Bench 2.0 82.7%, Expert-SWE 73.1%, GDPval 84.9% — numbers that only matter if you're actually stuck on something hard.

**Worth upgrading to Pro when**:

* You've already tried base GPT-5.5 and confirmed it can't solve the task
* Single-error cost is catastrophic (legal, medical, finance, research)
* Long-horizon code, cross-file deep refactors, complex agent workflows
* Per-call value clearly exceeds the \$5–\$15 cost (high-ROI scenarios)

**Don't use Pro when**:

* Routine chat, translation, summarization, code completion (GPT-5.5 or 5.4 is enough)
* High-frequency, low-latency applications (Pro is slower)
* Cost-sensitive, high-volume consumer products

APIYI now ships GPT-5.5 Pro on the **OpenAI official-relay channel** — behavior and pricing match upstream. **SVIP group only.** Recommend running a small, budget-capped pilot first to measure real lift before opening it up in production.

<Info>
  Sources: OpenAI official model card (developers.openai.com), Inworld AI model library, independent benchmark coverage. Data captured: May 3, 2026 (UTC+8).
</Info>
