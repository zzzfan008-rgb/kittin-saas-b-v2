> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Multi-Agent Model Guide

> grok-4.20-multi-agent-beta-0309 on APIYI, verified hands-on: parallel multi-agent collaboration for complex research tasks — with a critical explanation of its billing amplification (all internal agent traffic is billed).

`grok-4.20-multi-agent-beta-0309` is xAI's multi-agent collaboration model: a single request spins up **multiple agents working in parallel** internally (the model calls itself Oppie, a "collaborative AI team leader"), with a lead agent synthesizing the final answer. It suits complex research and multi-angle comparative analysis. Available on APIYI in the standard OpenAI-compatible format.

## Billing Profile (Read This First)

<Warning>
  **All internal agent traffic lands on your bill.** This is the biggest difference from regular models:

  * A measured ordinary prompt of \~40 tokens actually billed **39,263 prompt tokens + 9,997 completion tokens** (all internal multi-agent round-trips included)
  * Even the simplest one-liner request carries a fixed overhead of roughly **3,900 prompt tokens**
  * The unit price matches grok-4.3 (\$1.25 / \$2.50 per 1M tokens), but **a single request can cost tens of times more than a regular model**

  Do not use this model for simple tasks — use `grok-4.3` or `grok-4.20-0309-reasoning` for ordinary Q\&A.
</Warning>

The good news: internal traffic gets high cache hit rates (26.8K of the measured 39K prompt tokens hit the discounted cache rate — that is the total across many internal calls, not one request's hit count), so real cost runs below a naive token-count conversion — but still far above regular models. For how the caching itself works, see the [Grok cache billing guide](/en/api-capabilities/grok/prompt-caching).

## How to Call It

Identical to any other model — only the `model` field differs:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.chat.completions.create(
    model="grok-4.20-multi-agent-beta-0309",
    messages=[{
        "role": "user",
        "content": "Compare Rust and Go for building highly concurrent network services: 3 points each, then a one-line verdict"
    }],
)
print(resp.choices[0].message.content)
print("Billed tokens:", resp.usage.total_tokens)
```

Multi-agent orchestration is **entirely server-side** — no extra parameters. Streaming and Structured Outputs (`json_schema`) are verified working too.

## Measured Characteristics (2026-07-13)

| Dimension                      | Measured                                            |
| ------------------------------ | --------------------------------------------------- |
| Medium-complexity task latency | \~29 s                                              |
| Simple Q\&A latency            | \~5 s                                               |
| Simple Q\&A fixed overhead     | \~3,900 prompt tokens                               |
| Medium task token consumption  | \~39K prompt + \~10K completion                     |
| Internal cache hits            | \~2/3 of prompt tokens at the discounted cache rate |
| Chain-of-thought exposure      | Not exposed (`reasoning_tokens` still billed)       |

## When to Use It

<CardGroup cols={2}>
  <Card title="Good Fit" icon="check">
    Multi-angle deep comparative analysis, complex research questions, open-ended tasks that benefit from several lines of thought cross-validating each other — parallel agent exploration meaningfully improves answer completeness.
  </Card>

  <Card title="Poor Fit" icon="ban">
    Everyday Q\&A, translation, summarization, code completion — single-track tasks where output quality is close to regular models but cost is amplified tens of times. Use grok-4.3 / grok-4.5 for these.
  </Card>
</CardGroup>

<Tip>
  Before going live, compare output quality between `grok-4.20-0309-reasoning` and the multi-agent model on a handful of real tasks, then decide whether the quality delta justifies the billing amplification — for most scenarios, the reasoning variant is enough.
</Tip>

## FAQ

<AccordionGroup>
  <Accordion title="Why does the model call itself Oppie?">
    It's the model's built-in persona (the leader role of the multi-agent team) — entirely normal. Verify model identity via the `model` field in your request and response.
  </Accordion>

  <Accordion title="Can I control the number of internal agents?">
    No. Multi-agent orchestration happens inside xAI's servers, with no control parameters exposed.
  </Accordion>

  <Accordion title="Any special max_tokens setting?">
    Set it generously (e.g. 8192) — the model's internal reasoning is token-hungry, and a small budget easily truncates the final answer.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Grok Overview" icon="rocket" href="/en/api-capabilities/grok/overview">
    Full model lineup and pricing
  </Card>

  <Card title="Chat & Reasoning" icon="message-square" href="/en/api-capabilities/grok/chat">
    Chain-of-thought and billing for the regular models
  </Card>
</CardGroup>
