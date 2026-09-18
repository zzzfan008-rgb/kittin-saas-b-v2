> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Launch: ByteDance's Production Model

> ByteDance Seed 2.1 Turbo lands on APIYI: $0.50 input / $2.50 output per 1M tokens, both Chat Completions and Responses endpoints verified 15/15, controllable deep thinking and two-layer caching.

## Key Takeaways

* **Now live**: ByteDance Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) is available on APIYI for the `default` / `svip` groups
* **Both endpoints verified**: Chat Completions and Responses passed 15/15 test cases — measured, not just listed
* **Production-grade pricing**: \$0.50 input / \$2.50 output per 1M tokens, officially positioned at half the price of the same-generation Seed 2.1 Pro
* **Controllable deep thinking**: on by default, with a one-line off switch and low/high tiers that differ \~4x in measured reasoning tokens
* **Two-layer caching**: implicit cache hits automatically from the 2nd request; explicit caching on Responses with chained calls hits the full context and roughly halves latency

## Background

Seed 2.1 Turbo is a production-grade text model released by ByteDance's Seed team on June 23, 2026 (BytePlus product name: Dola-Seed-2.1-turbo). Sharing a generation with the flagship Seed 2.1 Pro, it targets low-cost, low-latency enterprise workloads at high request volume, with a family-rated 256K context window.

Unlike listings that are "live but unverified", APIYI ran a **full two-endpoint test suite** before launch: basic chat, streaming, structured output, two-turn function calling, thinking toggle and tiers, implicit/explicit caching, and native multi-turn — 15 cases, all passed. Every number in this article comes from our July 21, 2026 test records.

<Info>
  As of publication (July 21, 2026), no independent third-party benchmarks for the Turbo variant have been published; treat vendor performance-parity claims as unconfirmed until authoritative evaluations land. This article only states behavior we measured ourselves.
</Info>

## Deep Dive

### Verified capability matrix

| Capability                               | Chat Completions      | Responses                                  |
| ---------------------------------------- | --------------------- | ------------------------------------------ |
| Basic chat (non-stream / stream)         | ✅ / ✅                 | ✅ / ✅ (full event stream)                  |
| Structured output (json\_schema, strict) | ✅                     | ✅ (`text.format`)                          |
| Thinking toggle / tiers                  | ✅                     | ✅                                          |
| Function calling (two-turn loop)         | ✅                     | ✅                                          |
| Implicit caching                         | ✅ hits on 2nd request | ✅ hits on 2nd request                      |
| Explicit caching                         | —                     | ✅ requires `previous_response_id` chaining |
| Native multi-turn `previous_response_id` | —                     | ✅                                          |

### The one thing you must know: thinking is ON by default

Without any extra parameters, **deep thinking is enabled by default** — even a one-line question first produces hundreds of reasoning tokens. Measured: a one-sentence self-introduction consumed 444 output tokens (409 of them reasoning) and took 7–19 seconds non-streaming.

Three control modes, measured:

| Setting                          | Reasoning tokens (measured) | Best for                                  |
| -------------------------------- | --------------------------- | ----------------------------------------- |
| `thinking: {"type": "disabled"}` | 0                           | high-frequency short Q\&A, cost-sensitive |
| `reasoning_effort: "low"`        | Chat 226 / Responses 371    | routine reasoning                         |
| `reasoning_effort: "high"`       | Chat 960 / Responses 1317   | complex planning, math, code              |

<Warning>
  Reasoning content is billed as regular output tokens. For high-frequency short Q\&A, make `thinking: {"type": "disabled"}` your baseline — measured reasoning tokens drop to zero and responses get dramatically faster.
</Warning>

### Two caching layers — do not mix them up

* **Implicit caching** (both endpoints): zero config, a repeated long prefix hits automatically from the 2nd request. Measured: a \~2,600-token system prompt reported 2,360 `cached_tokens` on request 2.
* **Explicit caching** (Responses only): `caching: {"type": "enabled"}` **must be combined with `previous_response_id` chaining** — turn 2 carrying the previous id hits the entire prior context (measured: 7,873 tokens fully cached, latency down from 8s to 4s). Enabling without chaining loses on both fronts: no explicit hits, and the implicit prefix cache stops applying too.

## Putting It to Work

### Recommended scenarios

<CardGroup cols={2}>
  <Card title="High-frequency Q&A / support bots" icon="zap">
    With thinking off it is fast and cheap - the \$0.50 input price suits heavy traffic.
  </Card>

  <Card title="Agents / tool calling" icon="wrench">
    Two-turn function calling verified stable; Responses adds native multi-turn without resending history.
  </Card>

  <Card title="Long-document multi-turn Q&A" icon="file-text">
    256K family context plus chained explicit caching cuts both cost and latency on long-background follow-ups.
  </Card>

  <Card title="Structured data extraction" icon="braces">
    json\_schema strict mode verified to return valid, complete JSON - ready for batch extraction pipelines.
  </Card>
</CardGroup>

### Code example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Baseline config for high-frequency workloads: thinking off
response = client.chat.completions.create(
    model="dola-seed-2-1-turbo-260628",
    messages=[{"role": "user", "content": "Introduce yourself in one sentence"}],
    max_tokens=500,
    extra_body={"thinking": {"type": "disabled"}},
)
print(response.choices[0].message.content)
```

More examples (streaming, tiered thinking, chained caching on Responses) are in the [Seed 2.1 Turbo Overview](/en/api-capabilities/dola-seed-2-1-turbo/overview), or send requests directly from the [Chat Playground](/en/api-capabilities/dola-seed-2-1-turbo/chat-completions) and [Responses Playground](/en/api-capabilities/dola-seed-2-1-turbo/responses).

### Best practices

1. Make `thinking disabled` the baseline; switch to `reasoning_effort` tiers only for genuinely complex tasks
2. With thinking on, give `max_tokens` / `max_output_tokens` headroom (3000+) — on Responses a small budget returns `incomplete` with empty text
3. Put fixed system prompts first so implicit caching saves money automatically
4. In error handling, note that a misspelled model name returns **503** (no available channel), not the OpenAI-conventional 404

## Pricing and Availability

### Pricing

| Item   | APIYI price        |
| ------ | ------------------ |
| Input  | \$0.50 / 1M tokens |
| Output | \$2.50 / 1M tokens |

The model is open to the `default` and `svip` groups. Existing tokens need no configuration change — just switch the model name to `dola-seed-2-1-turbo-260628`.

### Stack with top-up bonuses

Top-up bonuses lower the effective cost further — see [Recharge Promotions](/en/faq/recharge-promotions).

## Summary

Seed 2.1 Turbo is a "cheap, fast, fully-featured" production model: structured output, function calling, and both caching layers are all verified by measurement, making it a solid primary or fallback for high-frequency workloads. The one thing to get right is the **default-on deep thinking** — control thinking depth explicitly per task, and the price-performance truly pays off.

<Info>
  Sources: APIYI two-endpoint test records, July 21, 2026; model release information from ByteDance Seed team public materials, June 23, 2026. Prices are list prices at publication time - the console shows real-time pricing.
</Info>
