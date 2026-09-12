> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4-Pro / V4-Flash Launch: 1M Context + Open-Source SOTA

> DeepSeek V4 preview models are now live on APIYI! 1M context, Hybrid Attention architecture, open-source SOTA Agentic Coding, 80.6 on SWE-Verified rivaling Claude/Gemini. Official price matched, ~85% off with recharge bonuses.

## Key Highlights

* **Two models launched**: `deepseek-v4-pro` (1.6T total / 49B active) and `deepseek-v4-flash` (284B total / 13B active), both MoE
* **1M context**: Full 1,000,000-token context across the family, powered by a new Hybrid Attention architecture + DSA sparse attention
* **Open-source SOTA**: V4-Pro is the current best open-source model on Agentic Coding; scores 80.6 on SWE-Verified, matching Claude (80.8) and Gemini (80.6)
* **Tunable thinking**: Supports `reasoning_effort` parameter (high / max); official guidance recommends `max` for complex agent scenarios
* **Dual API compatibility**: Works with both the OpenAI ChatCompletions and Anthropic endpoints
* **Friendly pricing**: Flash at \$0.14 in / \$0.28 out per 1M tokens; Pro at \$1.74 in / \$3.48 out — same as official
* **Recharge bonus**: Stackable with APIYI recharge promotions for an effective **\~15% discount** off the official list price

<Info>
  The version currently live on APIYI is the **Aliyun official relay channel**. Release date: 2026-04-24 (official preview). Source: DeepSeek docs at `api-docs.deepseek.com/zh-cn/news/news260424`.
</Info>

## Background

A full year after DeepSeek-R1 shook the industry, DeepSeek returned on April 24, 2026 with its V4 preview release — launching a performance flagship **V4-Pro** and a speed/cost-optimized **V4-Flash** simultaneously.

The headline technical advance in V4 is the **Hybrid Attention Architecture**: attention is compressed along the token dimension and combined with DSA sparse attention, making long-context inference both efficient and accurate. Paired with a **1M-token context window**, this generation is purpose-built for agents and long-horizon reasoning.

DeepSeek is candid about its positioning versus closed frontier models: V4-Pro trails only Gemini-Pro-3.1 on world knowledge, and the overall gap with GPT-5.4 / Gemini-Pro-3.1 is "about 3 to 6 months" — the strongest catch-up yet from the open-source camp.

## Deep Dive

### The Two New Models

<CardGroup cols={2}>
  <Card title="deepseek-v4-pro" icon="rocket">
    **Performance flagship**

    1.6T total params / 49B active, MoE, 1M context. For complex agents, coding, math, STEM, and competitive-grade code. Agentic Coding is open-source SOTA.
  </Card>

  <Card title="deepseek-v4-flash" icon="bolt">
    **Speed + economy**

    284B total / 13B active, MoE, 1M context. For high-throughput, latency-sensitive, cost-conscious workloads like chat, text ops, and batch tasks.
  </Card>
</CardGroup>

### Benchmark Highlights

Based on official and third-party evaluations:

| Dimension                                | DeepSeek-V4-Pro                          | Competitor reference       |
| ---------------------------------------- | ---------------------------------------- | -------------------------- |
| SWE-Verified (real software engineering) | **80.6**                                 | Claude 80.8 / Gemini 80.6  |
| Agentic Coding                           | **Open-source SOTA**                     | Approaches Claude Opus 4.5 |
| World knowledge                          | Open-source leader                       | Only behind Gemini-Pro-3.1 |
| Math / STEM / Competition code           | **Beats every public open-source model** | —                          |
| Overall gap vs. GPT-5.4 / Gemini-Pro-3.1 | \~**3-6 months**                         | —                          |

<Tip>
  In DeepSeek's internal evaluation, **V4-Pro-Max (max reasoning\_effort)** beats Claude Sonnet 4.5 on agent tasks and approaches Claude Opus 4.5.
</Tip>

### Architecture & Specs

<Card title="Hybrid Attention Architecture" icon="network">
  * **Token-level compression**: A new attention mechanism compresses along the token axis, drastically lowering long-context inference cost
  * **DSA sparse attention**: Combined with sparse attention for better long-range dependency modeling
  * **MoE experts**: V4-Pro activates \~3% (49B/1.6T); V4-Flash activates \~4.6% (13B/284B)
  * **1M context**: Full 1,000,000 tokens across the family — ideal for agents, repo-scale code, and long documents
</Card>

### Thinking Modes & reasoning\_effort

V4 supports both **non-thinking** and **thinking** modes. In thinking mode, `reasoning_effort` is tunable:

* `high`: standard deep reasoning, for most complex tasks
* `max`: maximum reasoning budget, **officially recommended for complex agent scenarios**

<Warning>
  For complex agent tasks (long tool-use chains, repo-scale refactors, etc.), DeepSeek explicitly recommends **thinking mode + `reasoning_effort=max`**. Expect higher completion rates at the cost of more output tokens and latency.
</Warning>

## In Practice

### Recommended Use Cases

<CardGroup cols={2}>
  <Card title="Agents & tool use" icon="bot">
    V4-Pro-Max is the strongest open-source agent base today — great for Claude Code, Cline, and custom agent pipelines
  </Card>

  <Card title="Repo-scale coding" icon="code">
    SWE-Verified 80.6 + 1M context: load a mid-to-large repo in a single call
  </Card>

  <Card title="Long-document analysis" icon="file-text">
    Reports, legal docs, papers — 1M context + compressed attention keep costs friendly
  </Card>

  <Card title="High-throughput economy" icon="bolt">
    V4-Flash at \$0.14 / 1M tokens input: ideal for support bots, classification, translation
  </Card>
</CardGroup>

### Quickstart (OpenAI-compatible)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# Flagship: V4-Pro at max reasoning effort for complex agents
resp = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "system", "content": "You are a senior full-stack engineer."},
        {"role": "user", "content": "Implement a circuit-breaker retry strategy for login in the existing repo."}
    ],
    extra_body={"reasoning_effort": "max"}
)
print(resp.choices[0].message.content)
```

### Economy Mode (Flash)

```python theme={null}
# High-throughput economy: V4-Flash, non-thinking by default, lowest latency
resp = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "Translate the following English text to Chinese: ..."}]
)
```

### Anthropic Endpoint

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com"
)

msg = client.messages.create(
    model="deepseek-v4-pro",
    max_tokens=4096,
    messages=[{"role": "user", "content": "Design a rate-limiting scheme for a distributed queue."}]
)
print(msg.content[0].text)
```

### Best Practices

* **Model choice**: Default to Flash; switch to Pro for agents / complex code / reasoning-heavy tasks
* **Thinking effort**: Disable thinking for simple tasks; use `reasoning_effort=max` for heavy agent work
* **Long context**: 1M is great, but input tokens are billed — pre-filter before feeding
* **Streaming**: Thinking mode may emit many intermediate tokens — stream on the client for better UX

## Pricing & Availability

### Price Sheet (USD / 1M tokens)

| Model               | Billing              | Prompt (input) | Completion (output) | Prompt multiplier | Completion multiplier |
| ------------------- | -------------------- | -------------- | ------------------- | ----------------- | --------------------- |
| `deepseek-v4-flash` | Pay-as-you-go - Chat | **\$0.1400**   | **\$0.2800**        | 0.07              | 2.0000                |
| `deepseek-v4-pro`   | Pay-as-you-go - Chat | **\$1.7400**   | **\$3.4800**        | 0.87              | 2.0000                |

<Info>
  APIYI's list price exactly matches DeepSeek's official pricing — no markup. The channel is currently **Aliyun official relay**, with stability on par with direct-to-official access.
</Info>

### Stack With Recharge Promotions

Recharge promotions bring effective cost down to roughly **85% of official**. See:

<Card title="Recharge Promotions" icon="gift" href="/en/faq/recharge-promotions">
  View the latest recharge bonus tiers — larger top-ups earn higher bonus ratios
</Card>

## Summary & Recommendations

DeepSeek V4 is the strongest submission from the open-source camp in the past year:

* ✅ **Best open-source agent / coding model**: V4-Pro is now the most capable open agent base — Claude-Sonnet-class performance at a fraction of the cost
* ✅ **Best cost-performance for long docs**: Flash at \$0.14 / 1M tokens input + 1M context is arguably the price-performance ceiling for long-doc workloads
* ✅ **Frictionless migration**: OpenAI + Anthropic dual-endpoint support — change `base_url` and `model`, keep the rest

**Recommended migration path**:

1. A/B your existing DeepSeek-V3 / R1 traffic onto V4-Flash
2. Upgrade agent / coding tasks to V4-Pro with `reasoning_effort=max`
3. Stack APIYI recharge bonuses to cut another \~15% off the cost

<Info>
  **Sources & dates**

  * DeepSeek official: `api-docs.deepseek.com/zh-cn/news/news260424`
  * Third-party reports & reviews: `simonwillison.net/2026/Apr/24/deepseek-v4/`, `thenextweb.com`, `felloai.com/deepseek-v4/`, `techxplore.com`, `digitalapplied.com`
  * Data retrieved: 2026-04-24
</Info>
