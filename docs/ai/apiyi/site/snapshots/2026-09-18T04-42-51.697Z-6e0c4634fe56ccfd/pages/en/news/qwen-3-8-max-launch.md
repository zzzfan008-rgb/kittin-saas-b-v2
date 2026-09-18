> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max Is Live: 2.4T Params, 1M Context, 17.5% Below List Price

> Alibaba's flagship Qwen3.8-Max landed on APIYI the day it shipped: 2.4T-parameter MoE, 1M context, 131K max output, GPQA Diamond 92.6, PaperBench 93.0. Listed at $1.65/$4.95 per 1M tokens versus Alibaba's $2/$6 — 17.5% cheaper, stackable with top-up promotions. Includes findings from our 586-call capability test.

## Highlights

* **Live on launch day**: Alibaba's Qwen team shipped Qwen3.8-Max on August 3, 2026; APIYI listed it the same day
* **2.4T-parameter sparse MoE**: 1M context window, 131K max output, 262K max thinking budget
* **Benchmarks**: GPQA Diamond 92.6, PaperBench 93.0, Terminal-Bench 2.1 86.6, SWE-bench Pro 67.7; FrontierSWE jumps from 40.7 to 73.5
* **17.5% below list price**: \$1.65/\$4.95 per 1M tokens versus Alibaba's \$2.00/\$6.00, and top-up promotions stack on top
* **Natively multimodal**: image and video input both verified working — this is not a text-only model
* **We ran 586 calls against it**: capability boundaries, billing traps, and parameter pitfalls are all documented below

<Info>
  Sources: Alibaba Qwen's official announcement (`qwen.ai/blog?id=qwen3.8`) and the QwenCloud model card (`qwencloud.com/models/qwen3.8-max`); benchmark figures are Alibaba's published numbers as of 2026-08-03. APIYI-side findings come from 586 live calls run 12:50–14:35 (UTC+8) on 2026-08-03.
</Info>

## Background

Qwen3.8-Max is the newest flagship in the Qwen Max line, continuing the sparse MoE architecture at 2.4 trillion total parameters.

Compared with Qwen3.7-Max, Alibaba put this generation's effort into **agentic and multimodal capability** rather than raw reasoning scores. The clearest signal is FrontierSWE going from 40.7 to 73.5, and DeepSWE from 21.6 to 56.6 — benchmarks that measure whether a model can keep working inside a real codebase, not whether it can solve one hard problem.

The practical upside: 1M context and multimodal input now live in the same model, so you no longer switch between a "long-context model" and a "vision model."

## Deep Dive

### Official benchmarks

| Benchmark            | Qwen3.8-Max | Note                                               |
| -------------------- | ----------- | -------------------------------------------------- |
| PaperBench           | 93.0        | Its strongest result                               |
| GPQA Diamond         | 92.6        | Graduate-level science reasoning                   |
| OmniDocBench 1.5     | 92.1        | Document understanding                             |
| Terminal-Bench 2.1   | 86.6        | Terminal agent tasks; GPT-5.6 Sol leads at 88.8    |
| OSWorld-Verified     | 86.1        | Computer-use tasks                                 |
| IFBench              | 82.8        | Instruction following; ahead of GPT-5.6 Sol (72.7) |
| FrontierSWE          | 73.5        | Previous generation scored 40.7                    |
| SWE-bench Pro        | 67.7        | Real-world software engineering                    |
| Humanity's Last Exam | 43.6        | Behind Fable 5 (53.3) and GPT-5.6 Sol (47.2)       |

### Specifications

| Item                | Value                                              |
| ------------------- | -------------------------------------------------- |
| Architecture        | Sparse MoE                                         |
| Total parameters    | 2.4 trillion                                       |
| Context window      | 1M tokens (991K input without thinking, 983K with) |
| Max output          | 131,072 tokens                                     |
| Max thinking budget | 262K tokens                                        |
| Thinking mode       | On by default, default tier `xhigh`                |
| Input modalities    | Text, image, video                                 |

### Endpoint support on APIYI

We ran a full case matrix against all three endpoints:

<CardGroup cols={3}>
  <Card title="Chat Completions" icon="check">
    `/v1/chat/completions`

    **Fully working, recommended.** Tool calling, structured output, multimodal, and streaming all behave correctly.
  </Card>

  <Card title="Anthropic Messages" icon="triangle-alert">
    `/v1/messages`

    **Works for code integration**, provided you strip `thinking` blocks when replaying history. Off-the-shelf clients like Claude Code are not usable yet.
  </Card>

  <Card title="Responses" icon="ban">
    `/v1/responses`

    **Not supported yet.** All 30 test calls failed; reported upstream.
  </Card>
</CardGroup>

### What we verified working

* **128K long-context recall**: we buried a unique marker mid-document and another at the tail across 8K / 32K / 128K bodies — both endpoints recalled all 6/6 exactly. A 128K call takes roughly 80 seconds
* **Strict structured output**: `json_schema` held for nested objects, enums, arrays, and `additionalProperties: false` — no extra fields, no Markdown fences
* **Image input**: shape recognition, color recognition, bitmap OCR, and multi-image disambiguation all correct
* **Video input**: content described accurately (a 3D animated scene was reconstructed correctly); 144–285 seconds per call
* **Tool calling**: single tool, parallel tools, full two-round round-trip, picking 1 out of 20 tools, and streaming deltas all worked
* **Stability**: 12/12 success at 12-way concurrency; long streams terminated cleanly with no tail stalling; \~19–22 tokens/s output, Chat non-streaming P50 around 3.4 seconds

## Getting Started

### Code example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Explain load balancing in one sentence."}],
    max_tokens=500,
)
print(response.choices[0].message.content)
```

### Note 1: thinking is on by default — use `reasoning_effort` to control cost

Qwen3.8-Max **thinks by default**, at the `xhigh` tier. For everyday chat, turn it off explicitly:

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Hello"}],
    reasoning_effort="none",   # disable thinking
    max_tokens=500,
)
```

On the same prompt, dropping from the default to `none` took output from roughly 158 tokens to 5, and latency from about 5 seconds to 2.

`reasoning_effort` accepts 7 values but maps to only **4 real tiers** in practice:

| Value passed             | Effective tier                                                                |
| ------------------------ | ----------------------------------------------------------------------------- |
| `none`                   | Thinking off                                                                  |
| `minimal` / `low`        | Low                                                                           |
| `medium`                 | Medium                                                                        |
| `high` / `xhigh` / `max` | Default tier (all three identical — `max` does not think harder than `xhigh`) |

### Note 2: `max_tokens` does not cap thinking tokens

<Warning>
  **This is the easiest trap to fall into.** `max_tokens` truncates only the visible answer; it does not bound the thinking portion.

  We set `max_tokens=1` and were still billed for **1,054** output tokens — 1,045 of them thinking tokens.

  **To control cost, use `reasoning_effort="none"`. Do not rely on `max_tokens`.**
</Warning>

### Note 3: forced tool calls require thinking off

If you need `tool_choice` to force a call (`"required"` or a named function), or you need `n > 1`, you **must also set `reasoning_effort="none"`** — otherwise you get a 400 or the parameter is silently ignored:

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "What's the weather in Beijing?"}],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},
    reasoning_effort="none",   # required, otherwise 400
)
```

`tool_choice` set to `"auto"` or `"none"` is not affected.

### Note 4: turn thinking off for structured output

Structured output drives thinking volume up sharply. Same schema, two configurations:

| Configuration                             | Output tokens | Of which thinking | Latency |
| ----------------------------------------- | ------------- | ----------------- | ------- |
| `json_schema` + default thinking          | 4,066         | 3,971             | 100 s   |
| `json_schema` + `reasoning_effort="none"` | 154           | 0                 | 4.7 s   |

Schema conformance was identical in both cases. **Disable thinking explicitly for structured output** — cost and latency both drop by an order of magnitude.

### Note 5: how to use the Anthropic endpoint

When integrating `/v1/messages` in your own code, strip `thinking` blocks before replaying history:

```python theme={null}
def strip_thinking(blocks):
    return [b for b in blocks if b.get("type") != "thinking"]

# Filter before appending the model's content to your history
messages.append({"role": "assistant", "content": strip_thinking(resp["content"])})
```

With that one filter in place, we verified 3-turn cross-turn memory, a full two-round tool round-trip, and tool results persisting into later turns. Off-the-shelf clients such as Claude Code cannot have their replay behavior changed, so use `/v1/chat/completions` there for now.

### Context caching

The measured cache-hit threshold is roughly **1,024 tokens**. Real multi-turn conversations that append messages do hit the cache, and 128K long-document scenarios reached 98.6% cached input.

<Warning>
  Cache hits were **not stable** in our testing — the same prefix hit on some rounds and missed on others. Treat caching as a bonus when it happens; **do not build cost projections on it.**
</Warning>

### Not supported today

* The `/v1/responses` endpoint
* Built-in web search (neither invocation form worked)
* The `thinking_budget` parameter (any value behaves like the `low` tier)
* Remote image URLs on the Anthropic endpoint (use base64 instead)
* `response_format` on the Anthropic endpoint (force a tool call for structured output instead)

## Pricing and Availability

### Pricing (per 1M tokens)

| Item        | APIYI list price | Alibaba Cloud | Difference      |
| ----------- | ---------------- | ------------- | --------------- |
| Input       | **\$1.65**       | \$2.00        | **17.5% lower** |
| Output      | **\$4.95**       | \$6.00        | **17.5% lower** |
| Cache read  | **\$0.20625**    | \$0.25        | 17.5% lower     |
| Cache write | **\$2.0625**     | —             | —               |

These are **pre-discount** list prices.

### Stack with top-up promotions

Top-up promotions apply on top of the list price. See [Top-up promotions](/en/faq/recharge-promotions).

### Calling it

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-apiyi-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.8-max",
    "messages": [{"role": "user", "content": "Hello"}],
    "reasoning_effort": "none"
  }'
```

## Verdict

**Where Qwen3.8-Max fits**

* Long-document analysis and codebase comprehension — 128K recall was exact in testing, and long-document cache hit rates are high
* Data extraction requiring strict JSON — `json_schema` conformance is solid, just remember to disable thinking
* Mixed text/image/video understanding — one model covers all three modalities, no switching overhead
* Agents and tool orchestration — the tool-calling chain is complete, and the FrontierSWE / Terminal-Bench gains show up in this class of work

**Three things to remember before integrating**

1. Thinking is on by default — add `reasoning_effort="none"` for everyday chat
2. `max_tokens` is not a cost guardrail; `reasoning_effort` is
3. Use `/v1/chat/completions` as your primary endpoint; `/v1/responses` is not supported yet

<Info>
  APIYI-side figures in this article come from 586 live calls on 2026-08-03 (12:50–14:35 UTC+8). Billing-related conclusions are based on the usage fields returned by the API and were not cross-checked line by line against invoices. Model and gateway behavior may change as channels are adjusted — treat live calls as the source of truth.
</Info>
