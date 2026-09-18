> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# claude-jupiter-v1-p Launches: Claude Opus 4.8 Preview

> APIYI launches claude-jupiter-v1-p — the preview build of Claude Opus 4.8, faithfully relayed straight from the official channel and priced identically to Claude Opus 4.7 ($5 / $25 per 1M tokens). Free to test and usable as an Opus model; as a preview it may be unstable and is not recommended for production.

## Key Highlights

* **Opus 4.8 Preview**: `claude-jupiter-v1-p` is the preview build of Claude Opus 4.8 — an early look at the next-gen Opus
* **Faithful Official Relay**: APIYI relays the official channel as-is; inputs and outputs match the official model with no extra processing
* **Same Price as Opus 4.7**: \$5 input / \$25 output per 1M tokens — identical to `claude-opus-4-7`
* **Usable as an Opus Model**: Positioned like the Opus family — existing Opus workflows can switch the model name and try it directly
* **Preview Caveat**: Free to test, but it may be unstable — **not recommended for production**

<Warning>
  `claude-jupiter-v1-p` is a **preview model**, still in the early-access testing phase. It may experience rate limits, timeouts, or behavioral fluctuations. **Do not use it in production** — keep critical workloads on the stable `claude-opus-4-7`.
</Warning>

## Background

`claude-jupiter-v1-p` is APIYI's **Claude Opus 4.8 preview channel**. After Opus 4.7 (released April 2026) settled in as the strongest coding model, word of Anthropic's next flagship, Opus 4.8, has surfaced in the industry — but it has **not been officially announced yet**. APIYI now offers preview access under the name `claude-jupiter-v1-p`, letting developers get an early feel for where the next Opus is headed.

The preview is meant for **early access and testing**: use it to evaluate how the next-gen Opus performs on your own workloads and to validate migration ahead of time. But because the model is still in preview, stability, availability, and behavioral consistency may change over time, so **avoid wiring it into production paths**.

<Info>
  Specific "Claude Opus 4.8" specs (e.g., improved visual understanding, stronger multi-step reasoning, tokenizer changes) currently come from online chatter and backend clues and are **not officially confirmed by Anthropic**. Official announcements take precedence. This page only describes the preview channel APIYI provides.
</Info>

## Detailed Analysis

### What It Is

In `claude-jupiter-v1-p`, `jupiter` is the preview-stage codename and `v1-p` denotes the preview build. It points to the Claude Opus 4.8 preview weights, **faithfully relayed by APIYI straight from the official channel** — requests and responses pass through as-is, with no rewriting or downgrading, so what you test is the real official preview behavior.

### Relationship to Claude Opus 4.7

| Aspect              | claude-jupiter-v1-p                         | claude-opus-4-7                    |
| ------------------- | ------------------------------------------- | ---------------------------------- |
| **Positioning**     | Opus 4.8 preview (early-access testing)     | Opus 4.7 GA (production-ready)     |
| **Stability**       | Preview, may fluctuate                      | Stable, recommended for production |
| **Price (in/out)**  | \$5 / \$25 per 1M tokens                    | \$5 / \$25 per 1M tokens           |
| **Recommended use** | Evaluation, early access, migration testing | Critical workloads, production     |

In short: **for an early look at next-gen Opus, use `claude-jupiter-v1-p`; for stable production calls, stay on `claude-opus-4-7`.** Pricing is identical, so switching costs only a model-name change.

### Use It as an Opus Model

`claude-jupiter-v1-p` is positioned like the Opus family, so **using it as an Opus model works fine**. Prompts, parameters, and agent pipelines built for `claude-opus-4-7` / `claude-opus-4-6` can largely be reused as-is — just swap the model name to `claude-jupiter-v1-p` to start testing.

## Real-World Use

### Recommended Scenarios

The preview fits "testing-oriented" scenarios best:

1. **Next-gen capability evaluation**: Benchmark against Opus 4.7 on your coding, reasoning, and agent tasks to gauge upgrade value
2. **Migration validation**: Verify compatibility and quality ahead of moving to the Opus 4.8 GA
3. **Early access**: For developers who want to feel out Anthropic's next flagship first
4. **Non-critical trials**: Run it in demos, internal tools, and experiments (keep it out of production)

### Code Examples

#### OpenAI-Compatible Call

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-jupiter-v1-p",
    messages=[
        {
            "role": "user",
            "content": "Refactor this Python code and explain your changes."
        }
    ]
)

print(response.choices[0].message.content)
```

#### Anthropic Native Call

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-jupiter-v1-p",
    max_tokens=4096,
    messages=[
        {"role": "user", "content": "Walk through the root cause of this production bug step by step."}
    ]
)

print(message.content[0].text)
```

### Best Practices

1. **Retry on instability**: Occasional timeouts/rate limits are normal in preview — retry, or temporarily fall back to `claude-opus-4-7`
2. **Keep a production fallback**: Run production on `claude-opus-4-7`, using the preview only for side-channel evaluation
3. **Reuse Opus tuning**: Existing Opus prompts and parameters port over directly, lowering test cost

## Pricing & Availability

### Pricing

| Item       | claude-jupiter-v1-p | claude-opus-4-7  | Note |
| ---------- | ------------------- | ---------------- | ---- |
| **Input**  | \$5 / 1M tokens     | \$5 / 1M tokens  | Same |
| **Output** | \$25 / 1M tokens    | \$25 / 1M tokens | Same |

<Info>
  The preview is priced exactly like Claude Opus 4.7 — **no early-access surcharge**. If Opus 4.8 reaches GA and pricing changes, we'll announce separately.
</Info>

### Stack the Recharge Promo

Combine with APIYI's recharge-bonus promotions to lower effective cost further: `docs.apiyi.com/faq/recharge-promotions`.

### Channels

**APIYI platform**:

* Site: `apiyi.com`
* OpenAI format: `https://api.apiyi.com/v1`
* Anthropic native format: `https://api.apiyi.com`
* Model name: `claude-jupiter-v1-p`

## Summary & Recommendations

`claude-jupiter-v1-p` lets you preview Claude Opus 4.8 at zero surcharge: faithfully relayed from the official channel, priced like Opus 4.7, and usable directly as an Opus model.

**Recommendations**:

1. **Evaluate early**: Run your coding / reasoning / agent tasks on `claude-jupiter-v1-p` and compare against Opus 4.7
2. **Keep production stable**: Stay on `claude-opus-4-7` for critical workloads; use the preview as a side channel
3. **Watch for the announcement**: The Opus 4.8 GA and final specs are subject to Anthropic's official announcement

Try `claude-jupiter-v1-p` now to feel out where the next-gen Opus is headed — and send us your test feedback.

<Info>
  Sources: APIYI preview-channel launch info; "Claude Opus 4.8" rumors come from public online clues and are **not confirmed by Anthropic**. Data retrieved: May 26, 2026 (UTC+8).
</Info>
