> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash GA Launch: Full Hands-On Test

> DeepSeek-V4-Flash-0731 GA is live on APIYI at $0.14 input / $0.28 output per million tokens. Our tests: 322K-token context answered in 14.8s, 99.9% implicit cache hit on round two, zero throttling at 20 concurrent — plus three traps you need to route around.

## Key Takeaways

* **GA release is live**: `deepseek-v4-flash-ga-260731`, matching open-source `DeepSeek-V4-Flash-0731`, promoted from preview on July 31, 2026
* **Same architecture, new post-training**: still 284B total / 13B activated MoE — DeepSeek states only the post-training stage was redone, yet agent benchmarks jumped sharply
* **Beats the Pro preview on five agent benchmarks**: Terminal Bench 2.1 hits 82.7 (Flash preview 61.8 / Pro preview 72.1)
* **Long context holds up in practice**: 322,055-token prompt answered in 14.77s with the buried needle retrieved correctly; hard context ceiling is 1,048,570 tokens
* **Implicit cache needs no configuration**: 15,616 of 15,634 tokens cached on round two — 99.9% hit rate, billed at \$0.028 per million tokens
* **Pricing**: \$0.14 input / \$0.28 output per million tokens, matching BytePlus list price, stackable with APIYI top-up bonuses
* **Both endpoints available**: Chat Completions and Responses are both open, and Responses adds chained explicit caching that hits the full prior context
* **Three traps to route around**: structured output silently ignored, online search backend consistently failing, `reasoning_effort` is not a monotonic dial

<Info>
  Performance and compatibility figures below come from APIYI hands-on testing on 2026-08-05;
  the test scripts and raw logs are reproducible. Benchmark scores are vendor self-reported,
  sourced from `huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731`.
</Info>

## Background

DeepSeek shipped the V4 preview in April 2026 with two models, V4-Pro and V4-Flash.
Three months later, on July 31, the Flash line was the first to reach general availability
under the checkpoint name **DeepSeek-V4-Flash-0731**.

There is one detail that is easy to miss: **this is not a new model**. DeepSeek is explicit
about it — architecture, parameter count, and context length are all unchanged from the April
preview (284B total / 13B activated MoE, 1M context, 384K max output). **Only the post-training
stage changed.**

The size of the resulting gain is counterintuitive. On the vendor's own agent benchmarks, GA
not only clears its own preview by a wide margin but **overtakes the same-generation V4-Pro preview**:

| Benchmark           | Flash-0731 GA | Flash preview | Pro preview |
| ------------------- | ------------- | ------------- | ----------- |
| Terminal Bench 2.1  | **82.7**      | 61.8          | 72.1        |
| Cybergym            | **76.7**      | 38.7          | 52.7        |
| Toolathlon-Verified | **70.3**      | 49.7          | 55.9        |
| DeepSWE             | **54.4**      | 7.3           | 12.8        |
| NL2Repo             | **54.2**      | 39.4          | 38.5        |

DeepSWE going from 7.3 to 54.4 is beyond what "tuning" normally explains. One caveat worth
stating plainly: these are vendor self-reported numbers with **no third-party reproduction**
so far. Artificial Analysis puts its Intelligence Index at 50, which measures general
capability rather than agent-specific performance.

## Deep Dive

### What we actually tested

A capability sheet is one thing; whether it works through the gateway is another. We ran
21 test cases, a three-way model comparison, and a dedicated reasoning-effort probe.
Here is what came back.

### Long context: this is where it shines

First, the ceiling. Sending an oversized request makes the gateway state the hard number:

```
Input length 1280009 exceeds the maximum length 1048570
```

**1,048,570 tokens** — the 1M claim is real. Max output probes to a hard ceiling of
**393,216 tokens** (384K), matching the official spec.

Then a needle-in-a-haystack test, with a passphrase buried mid-document:

| prompt tokens | latency    | needle found |
| ------------- | ---------- | ------------ |
| 74,031        | 4.85s      | ✅            |
| 322,055       | **14.77s** | ✅            |

322K tokens of context, 14.8 seconds, correct retrieval from the middle of the document.
That is a strong result for this price tier.

### Implicit cache: zero configuration, hits on round two

We sent the same 15.6k-token prefix three times, five seconds apart:

| Round | prompt\_tokens | cached\_tokens | Hit rate  | Latency |
| ----- | -------------- | -------------- | --------- | ------- |
| 1     | 15,634         | 0              | —         | 2.99s   |
| 2     | 15,634         | 15,616         | **99.9%** | 2.56s   |
| 3     | 15,634         | 15,616         | **99.9%** | 2.55s   |

No parameters required, near-total hit from the second call onward. Cached tokens bill at
\$0.028 per million, so a repeated prefix costs 80% less. For multi-turn Q\&A over long
documents or batch jobs with a fixed system prompt, this single property drives your bill.

<Tip>
  Implicit cache requires a **byte-identical prefix**. Keep anything variable — timestamps,
  random IDs, user names — at the end of the prompt, never mixed into the prefix.
</Tip>

### Explicit cache: chain it through Responses

Both Chat Completions and Responses are open. Responses adds a second layer — **explicit
cache** — but it is easy to invoke wrongly. It is **not** a matter of resending the same long
prefix twice (do that and `cached_tokens` stays at 0). You write the cache on the first call
with `caching: {"type": "enabled"}`, then chain subsequent calls via `previous_response_id`:

| Round     | Call shape               | input\_tokens | cached\_tokens | Latency |
| --------- | ------------------------ | ------------- | -------------- | ------- |
| 1 (write) | `caching: enabled`       | 15,629        | 0              | 4.10s   |
| 2         | + `previous_response_id` | 15,664        | **15,629**     | 5.18s   |
| 3         | + `previous_response_id` | 15,701        | **15,664**     | 4.57s   |
| 4         | + `previous_response_id` | 15,738        | **15,701**     | 4.54s   |

Each round hits the entire prior context. For multi-turn long-context sessions — follow-up
questions over a long document, say — this is far cheaper than resending the full text each turn.

### Concurrency: 20 parallel requests, no throttling

Same key, no warm-up, straight into concurrent load:

| Concurrency | Status codes | Wall clock | Slowest request |
| ----------- | ------------ | ---------- | --------------- |
| 5           | all 200      | 2.63s      | 2.62s           |
| 10          | all 200      | 3.41s      | 3.38s           |
| 20          | all 200      | 3.92s      | 3.85s           |

All 20 succeeded, with wall-clock only 1.3s above a single call and no sign of queuing.
The "high-concurrency agent" positioning holds up.

### Speed comparison: not a clean sweep

Four tasks against `deepseek-v4-flash` (the 0423 preview channel) and `deepseek-v4-pro`,
all at default thinking level:

| Task  | Model        | Latency   | Output tokens | of which thinking |
| ----- | ------------ | --------- | ------------- | ----------------- |
| Math  | **GA**       | **3.46s** | 201           | 200               |
|       | v4-flash     | 4.75s     | 302           | 230               |
|       | v4-pro       | 6.46s     | 308           | 306               |
| Code  | **GA**       | **3.06s** | 147           | 47                |
|       | v4-flash     | 4.84s     | 227           | 127               |
|       | v4-pro       | 8.00s     | 401           | 281               |
| Logic | GA           | 25.74s    | 1996          | 1826              |
|       | **v4-flash** | **9.52s** | 682           | 587               |
|       | v4-pro       | 18.07s    | 872           | 754               |
| Trick | GA           | 4.64s     | 269           | 263               |
|       | **v4-flash** | **2.54s** | 50            | 44                |
|       | v4-pro       | 2.91s     | 61            | 54                |

All four answers were correct across all three models, including the classic
"is 9.11 bigger than 9.9" trick question. But the speed story **is not one-directional**:

* On **well-structured tasks like math and code**, GA runs 30–37% faster than the preview
  channel and costs less
* On **logic and trick questions GA is actually slower**, because it thinks more by default —
  263 thinking tokens on the trick question versus 44 for the preview

This is a real personality change in GA: **it is more willing to think**. The upside is
steadier quality on hard tasks; the cost is paying for reasoning on trivial ones.
The fix is one parameter — see the code samples below.

## Three Traps to Route Around

<Warning>
  This is the most useful section of this article. All three fail **silently** — no error
  raised, no effect applied. Checking the HTTP status code will mislead you.
</Warning>

### Trap 1: structured output is accepted but not enforced

The official sheet marks structured output as unsupported. Our tests confirm it, and the
failure mode is well hidden:

1. Passing `response_format: json_schema` **raises no error** (HTTP 200)
2. But if the prompt contains no literal "json" string, the upstream returns 400 — which
   reveals it as a prompt-based compatibility shim, not native constrained decoding
3. Once "json" appears in the prompt, the model **ignores the schema entirely**

We tested `{"answer": string}` with `strict: true` **three times on each endpoint**. The
returned keys were `name / englishName / country / coordinates / population…` — unrelated to
the schema. Two of three on Chat and three of three on Responses were wrapped in code fences,
so `json.loads()` failed outright.

**Workaround**: use Function Call for structured output. Tool arguments **are** genuinely
constrained and tested stable.

### Trap 2: online search is wired, but the backend returns nothing

This is the subtlest gap against the capability sheet. The `web_search` tool itself **is
wired** — the response `output` contains `web_search_call` items with `status: completed`,
so everything looks fine at first glance.

But the search backend fails consistently. Across 6 independent tests and 17 search calls,
the model replied every time that the search service was erroring and it could not retrieve
live information. The `web_search_call` items carry only `action / id / status / type` —
**no `results` field**.

6 out of 6 failed, so this is not intermittent. The plumbing works, the backend does not;
we would not rely on it in production right now.

In the same test batch, **MCP** consistently returns `AccessDenied`
(`you do not have access to the built in tool`). Swapping in a valid public MCP server URL
gives the same result, so this is an account/channel-level built-in-tool entitlement,
not a model limitation.

### Trap 3: reasoning\_effort is not a monotonic dial

Two questions × five levels × five samples each, median thinking tokens:

| Level     | river median | prob median | Note                                    |
| --------- | ------------ | ----------- | --------------------------------------- |
| `minimal` | **0**        | **0**       | exactly 0 in 10/10 runs — deterministic |
| `low`     | 956          | 367         | ranged 150 to 1993 within the level     |
| `medium`  | 506          | 193         |                                         |
| `high`    | **97**       | **153**     | lowest of the four on both questions    |
| `max`     | 577          | 173         |                                         |

**`high` produced less thinking than `low` on both questions**, and within-level variance far
exceeds between-level differences. Treating this as a cost dial gives unpredictable results.

**Only `minimal` is reliable** — it is equivalent to disabling thinking. Use it for cost
control, but do not expect low → max to scale depth linearly.

### Side finding: n>1 is silently ignored

Passing `n=2` returns 200 with just one element in `choices`. All other sampling parameters
(`temperature`, `top_p`, `stop`, `logprobs`, `seed`, both penalties) behaved correctly.

## Practical Usage

### Recommended scenarios

<CardGroup cols={2}>
  <Card title="Good fit" icon="circle-check">
    * High-concurrency everyday Q\&A and text processing
    * Long-document summarization and Q\&A (322K tokens in 15s)
    * Lightweight agents that need tool calling
    * Batch jobs with a fixed system prompt (rides the implicit cache)
    * Multi-turn long-context sessions (chained explicit cache on Responses)
  </Card>

  <Card title="Avoid" icon="circle-x">
    * Anything needing enforced `json_schema` (use Function Call)
    * Anything depending on online search or MCP (backend / entitlement not ready)
    * Claude Code integration (no Anthropic endpoint)
    * Any image input (this is a text-only model)
  </Card>
</CardGroup>

### Code samples

Disable thinking explicitly on simple tasks so you are not paying hundreds of reasoning
tokens for a one-line answer:

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

# Simple task: disabling thinking saved 200+ reasoning tokens in our tests
resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "Rewrite this more concisely: ..."}],
    extra_body={"thinking": {"type": "disabled"}},
)
print(resp.choices[0].message.content)
```

Enable thinking on complex tasks and read the reasoning chain:

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "Analyze this code's time complexity and optimize it"}],
    extra_body={"thinking": {"type": "enabled"}},
)
msg = resp.choices[0].message
print("Reasoning:", getattr(msg, "reasoning_content", None))
print("Answer:", msg.content)
```

For structured output, use Function Call instead of `response_format`:

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "submit_result",
        "description": "Submit the extracted result",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "temp_c": {"type": "number"},
            },
            "required": ["city", "temp_c"],
        },
    },
}]

resp = client.chat.completions.create(
    model="deepseek-v4-flash-ga-260731",
    messages=[{"role": "user", "content": "Beijing is 25 degrees today"}],
    tools=tools,
)
# Tool arguments are genuinely constrained and parse reliably
import json
args = json.loads(resp.choices[0].message.tool_calls[0].function.arguments)
print(args)
```

### Best practices

<Steps>
  <Step title="Disable thinking on simple tasks">
    GA thinks more by default. Both `thinking: {"type": "disabled"}` and
    `reasoning_effort: "minimal"` shut it off reliably.
  </Step>

  <Step title="Keep variable content at the end of the prompt">
    Implicit cache needs a byte-identical prefix. A timestamp or random ID mixed into the
    prefix drops your hit rate to zero.
  </Step>

  <Step title="Always use Function Call for structured output">
    `response_format` has no effect on this model and raises no error — the easiest trap to fall into.
  </Step>

  <Step title="Chain multi-turn long sessions through Responses">
    Write the cache on the first call with `caching: {"type": "enabled"}`, then chain with
    `previous_response_id` — each round hits the entire prior context.
  </Step>

  <Step title="Do not depend on online search or MCP">
    `web_search` is wired but its backend keeps erroring, and MCP returns `AccessDenied` —
    neither returns usable results today.
  </Step>
</Steps>

## Pricing and Availability

### Pricing

| Model                         | Input              | Output            | Cache hit          |
| ----------------------------- | ------------------ | ----------------- | ------------------ |
| `deepseek-v4-flash-ga-260731` | \$0.14 / M tokens  | \$0.28 / M tokens | \$0.028 / M tokens |
| `deepseek-v4-pro`             | \$0.435 / M tokens | \$0.87 / M tokens | —                  |

Matches the BytePlus list price. Available groups: `default`, `svip`.

<Info>
  **On the "less than 1/10th of the flagship" claim**: the vendor's marketing compares against
  V4-Pro's preview-era \$1.74 / \$3.48. Against the current V4-Pro list price, GA is
  **roughly 1/3**, not 1/10. We quote the actual list price rather than carrying the old framing forward.
</Info>

### Stacking top-up bonuses

On top of the prices above, APIYI top-up bonus campaigns further reduce your effective cost.
See [top-up promotions](/en/faq/recharge-promotions) for details.

## Summary and Recommendations

DeepSeek-V4-Flash-0731 is a "post-training only, but it clearly worked" release. From our
testing, its strengths are unambiguous: **long context, implicit cache, and concurrent
throughput** — 322K tokens in 15 seconds, 99.9% cache hit on round two, and zero throttling
at 20 concurrent. Combined with \$0.14 input pricing, that makes it a strong value pick for
long-document processing and high-concurrency text workloads.

Be equally clear about its current boundaries: **this is a text-only model** — no image input,
and no Anthropic endpoint, so no Claude Code. Structured output does not work on either
endpoint, `reasoning_effort` is not a dependable dial, and online search and MCP return
nothing usable today. These are not complaints — they are facts worth knowing before
integration. Knowing them lets you route around them; not knowing them costs you an afternoon
of debugging.

Selection guidance: **pick GA for high-concurrency Q\&A, long documents, multi-turn long
sessions, and lightweight tool-calling agents**; **pick `deepseek-v4-flash` if you need
Claude Code integration**.

<Info>
  Sources and collection dates: APIYI hands-on testing (2026-08-05, 21 test cases plus a
  three-way comparison, a reasoning-effort probe, and a dedicated Responses-endpoint retest);
  benchmark scores are vendor self-reported from
  `huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731`; V4 preview background from
  `api-docs.deepseek.com/news/news260424`. Benchmark data has no third-party reproduction yet —
  validate against your own workload before committing to a model choice.
</Info>

<Note>
  **Correction notice**: this article originally reported that the Responses endpoint was not
  wired. That was a channel-side configuration issue, fixed the same day (2026-08-05). After
  retesting, Responses is fully available and explicit caching works; the affected sections
  have been updated.
</Note>
