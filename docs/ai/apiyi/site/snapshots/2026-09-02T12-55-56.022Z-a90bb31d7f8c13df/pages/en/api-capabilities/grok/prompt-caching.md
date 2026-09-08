> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Prompt Caching Billing Guide

> Grok caching is automatic with no write fee: cached input is billed at 0.25x. The 128-token block granularity, how to write requests that hit, how to read cached_tokens, and why long conversations belong on the responses chain.

When you run agents, long system prompts, or multi-turn conversations on Grok, prompt caching bills the **cached portion** of your input at **0.25×** (a 75% saving) — and **no code changes are needed**, because caching is fully automatic.

Set expectations up front: xAI states explicitly that cache entries may be evicted under memory pressure, on restart, or when a request lands on a different server, so **hits are not guaranteed**. Treat the cache discount as a nice-to-have, and **budget at the uncached price**.

This page follows xAI's official documentation (`docs.x.ai/developers/advanced-api-usage/prompt-caching`) and is grounded in **hands-on testing of `grok-4.6` on the APIYI gateway on 2026-08-19** (124 calls, reconciled line-by-line against backend billing records).

## In One Sentence

Whenever the **opening portion (the prefix) of your request matches a recent request byte for byte**, the upstream skips the redundant work: the matched portion is billed at **0.25×**. No parameters, no markers.

How it differs from the other two:

* **vs Claude**: no `cache_control` markers — it just happens once the conditions are met
* **vs OpenAI**: equally automatic and equally free to write, but Grok gives you no `prompt_cache_key`-style routing control

## Why Bother — Look at the Multipliers

Taking the model's raw input token price as **1×**:

| Type          | Price         | Notes                                |
| ------------- | ------------- | ------------------------------------ |
| Regular input | **1×**        | Anything that misses, at full price  |
| Cache write   | **0× (free)** | Happens automatically, costs nothing |
| **Cache hit** | **0.25×**     | The cached portion is 75% cheaper    |

**Break-even: the second request.** There is no write fee to amortize, so the first time a prefix is reused, everything you save is pure gain.

In dollars for `grok-4.6` (per 1M tokens, both context tiers):

| Tier        | Regular input | Cache hit  |
| ----------- | ------------- | ---------- |
| 0 – 200K    | \$2.00        | **\$0.50** |
| 200K – 512K | \$4.00        | **\$1.00** |

Tier breakpoints and cached-read rates for the other Grok models are in the [tiered pricing table on the Grok overview](/en/api-capabilities/grok/overview).

### Good Fits

* One long system prompt plus tool definitions, called over and over (agents, support bots)
* Batch work over one document (50 questions against one contract)
* RAG where stable document chunks sit at the front of the prompt
* Multi-turn conversations — but note that on Grok the two ways of doing this behave very differently (see below)

### Poor Fits

* Requests that differ from the very first character every time
* Prompts **below the thousand-token range** — in testing, repeatedly calling such a request never built a reusable cache

## Both Endpoints, Streaming and Non-Streaming, All Reconciled

`/v1/chat/completions` and `/v1/responses`, each streaming and non-streaming: **we reconciled all four combinations against backend billing records on 2026-08-19**, and the cached portion was billed at the cache rate in every one:

|                        | Non-streaming | Streaming  |
| ---------------------- | ------------- | ---------- |
| `/v1/chat/completions` | Reconciled    | Reconciled |
| `/v1/responses`        | Reconciled    | Reconciled |

<Info>
  **No client-side adaptation is needed for the gateway.** Cache behavior is passed through to the upstream, `cached_tokens` is echoed back verbatim, and the backend bill lists the cached portion as its own "cache read" line item.
</Info>

## Conditions for a Hit

| Condition             | Requirement                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| How it triggers       | **Fully automatic** — no parameters, no markers                                                                   |
| Where matching starts | From the **beginning** of the `messages` array, byte by byte                                                      |
| Append only           | Editing, deleting, or reordering earlier messages invalidates the cache; **appending at the end does not**        |
| Block granularity     | **128 tokens** (see below)                                                                                        |
| Length                | No official minimum is published; in testing, prompts below the thousand-token range never built a reusable cache |
| Time window           | Officially evictable at any time — **the shorter the gap, the more reliable**                                     |

### Hits Round Down to 128 Tokens

```text theme={null}
cached_tokens = floor(matched prefix length / 128) * 128
```

Two rounds of testing agree: an 8802-token prefix hit 8704 (= 68 × 128), and an earlier round's 2735-token prefix hit 2688 (= 21 × 128). **So `cached_tokens` is normally a little smaller than your stable prefix — that is expected.**

### Append Only: Editing History Breaks It

Same prefix, sent back to back, with one call altered:

| Action                                         | `cached_tokens`          |
| ---------------------------------------------- | ------------------------ |
| Unchanged                                      | 8704                     |
| **First character of the prefix changed**      | 128 (effectively a miss) |
| **One line appended to the end of the prefix** | 8704 (unaffected)        |
| Original prefix sent again                     | 8704                     |

**What this means in practice: stable content first, volatile content last.**

```python theme={null}
# WRONG: dynamic content at the start of system, so the prefix changes every time and never hits
messages = [
    {"role": "system", "content": f"Current time {datetime.now()}. You are an assistant." + LONG_INSTRUCTIONS},
    {"role": "user", "content": question},
]

# RIGHT: long instructions and tool definitions stay stable up front, dynamic content goes in the user message
messages = [
    {"role": "system", "content": LONG_INSTRUCTIONS},          # stable, will hit
    {"role": "user", "content": f"Current time {datetime.now()}. {question}"},  # volatile, goes last
]
```

## Minimal Runnable Example

Send the same long prefix twice with different questions: the first writes the cache, the second hits it.

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# The prefix has to be long enough: below the thousand-token range you get essentially nothing
LONG_SYSTEM = open("long_instructions.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="grok-4.6",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("Summarize the key points", "call 1")   # cold start: cached is 0 or a tiny value
ask("Give me 3 keywords", "call 2")         # expect cached close to the prefix length
```

Expected output:

```text theme={null}
[call 1] input=8804 cached=128
[call 2] input=8804 cached=8704
```

On the second call `cached` is close to the system prompt length (rounded down to 128), and that portion is billed at 0.25×.

<Info>
  The `/v1/responses` endpoint works the same way automatically; the field is `usage.input_tokens_details.cached_tokens`. **Long conversations get an extra benefit on that endpoint** — see "Long conversations belong on the responses chain" below.
</Info>

## Telling a Hit From a Miss — Read the usage Field

| Endpoint               | Hit field                                   |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

### How to Read It: Small Values Are Not Hits

Do not just check for "greater than zero". **Compare `cached_tokens` against your stable prefix length:**

| `cached_tokens`                                                  | Reading                  |
| ---------------------------------------------------------------- | ------------------------ |
| `0`                                                              | Miss                     |
| A tiny fraction of the prefix (tens, or one or two hundred)      | **Also treat as a miss** |
| In the thousands, close to the prefix length rounded down to 128 | A real hit               |

In testing even a cold first call sometimes echoes a value of one or two hundred. Do not be fooled — that does not mean your prefix was cached.

### Reconciling: The Cache Billing Detail in the Console

The backend log for a single call lists the **cached-read token count and its discount multiplier as a separate line**, which you can match against the `cached_tokens` in the response. When you need to know exactly how one call was billed, that is the authoritative view.

Three-step self-check:

1. Build a stable prefix above a thousand tokens and send two requests back to back
2. The second response should show `cached_tokens` clearly in the thousands
3. In the backend [call logs](/en/faq/call-logs), that request shows a "cache read" line item and a visibly lower input cost than the first

## Improving Your Hit Rate

### Engineer a Stable Prefix

* Long instructions, few-shot examples, and tool definitions go first; user input and timestamps go last
* Keep tool-definition ordering and JSON serialization fixed (do not let your serializer shuffle keys)
* Image inputs participate in prefix matching too — keep base64 / URL and parameters identical when reusing one
* **Reuse the same prefix in a tight burst** rather than spreading calls out

The methodology matches OpenAI's; for the long version see the [OpenAI prompt caching guide](/en/api-capabilities/openai/prompt-caching).

### Long Conversations Belong on the Responses Chain

This is an easily missed difference on Grok:

| Approach                                    | What testing showed                                                                                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/chat/completions`, appending turns     | Across 5 turns, with the prompt growing from 8.8K to 10K, `cached_tokens` **stayed at the size of the original static prefix** — the new Q\&A from each turn never became reusable |
| `/v1/responses` with `previous_response_id` | Hits **grow with each turn** (measured: 8704 on turn 2 → 9344 on turn 3)                                                                                                           |

So for long conversations and multi-step agents, prefer the Responses API chain:

```python theme={null}
r1 = client.responses.create(
    model="grok-4.6",
    input=[{"role": "system", "content": LONG_SYSTEM},
           {"role": "user", "content": "First question"}],
    store=True,
)

r2 = client.responses.create(
    model="grok-4.6",
    previous_response_id=r1.id,          # send only the new turn; the upstream carries the history
    input=[{"role": "user", "content": "Follow-up"}],
    store=True,
)
print(r2.usage.input_tokens_details.cached_tokens)
```

Endpoint differences are covered in the [endpoint overview on the Grok overview page](/en/api-capabilities/grok/overview).

### About `x-grok-conv-id`

xAI's best practices recommend sending an `x-grok-conv-id` header (a UUID or session ID) on every request to improve hit rates. We ran a symmetric A/B on APIYI — several independent prefixes with and without the header, several reuses each — and **saw no observable difference between the two groups**. Sending it does no harm, but do not count on it for hit rates.

## Hit Rates and What to Expect

<Warning>
  **Cache hits are not guaranteed.** xAI's documentation states that entries can be lost to memory pressure, service restarts, or a request being routed to a different server.

  In testing, most requests hit when a **stable prefix is reused in a tight burst**, but there is real jitter, and it originates upstream — nothing on the caller's side controls it. **Budget at the uncached price and treat hits as a bonus.**
</Warning>

One more thing worth saying plainly: **the value of caching is cost, not speed.** Measured time-to-first-token differed by only a few hundred milliseconds between hits and misses — do not expect caching to make long-context requests fast.

## Common Pitfalls

| Symptom                                           | Cause                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `cached_tokens` is always 0 or always tiny        | Prompt too short (below the thousand-token range) / a timestamp, UUID, or random ID sits at the start of the prefix |
| Hits come and go                                  | Upstream eviction — expected; shorten the gap between reuses and send batch work in a burst                         |
| Hits come up short of the prefix                  | Rounding down to 128 tokens; normal                                                                                 |
| `cached_tokens` stops growing in multi-turn chats | chat/completions only reuses the original static prefix — move long conversations to the responses chain            |
| Editing an earlier message killed the hits        | The cache is append-only: editing, deleting, or reordering history invalidates it                                   |
| No hits after switching models                    | Caches are **isolated per model** — `grok-4.6` and `grok-4.5` do not share                                          |

## Quick Comparison With Other Channels

|                   | Grok                                                         | OpenAI          | Gemini                               | Claude                    |
| ----------------- | ------------------------------------------------------------ | --------------- | ------------------------------------ | ------------------------- |
| How it triggers   | **Automatic**                                                | **Automatic**   | Implicit, automatic                  | Manual `cache_control`    |
| Write fee         | **Free**                                                     | **Free**        | Free                                 | 1.25× / 2×                |
| Hit price         | 0.25×                                                        | 0.1×            | Up to 90% off, per Google            | 0.1×                      |
| Minimum size      | Not published; below \~1K tokens nothing caches in testing   | 1024 tokens     | 4096 (3 series) / 2048 (2.5 series)  | 1024–4096                 |
| Block granularity | 128 tokens                                                   | 128 tokens      | —                                    | —                         |
| Hit reliability   | Hits are deterministic, but the upstream offers no guarantee | Stable          | Not guaranteed; mediocre in practice | Stable                    |
| Hit field         | `cached_tokens`                                              | `cached_tokens` | `cachedContentTokenCount`            | `cache_read_input_tokens` |

For caching support across the whole platform, see the [cache billing FAQ](/en/faq/cache-billing).

<Info>
  **Everything on this page was measured on `grok-4.6` (2026-08-19).** xAI states that all Grok language models support prefix caching; we have not benchmarked the others one by one, so treat details such as block granularity and short-prompt behavior as something to confirm on your own workload.

  If the billing you see for a given prefix clearly disagrees with what is described here, contact support with the request-id from the response headers.
</Info>

## Recap

<CardGroup cols={2}>
  <Card title="1. Fully automatic" icon="wand-sparkles">
    No markers, no write fee. Meet the conditions and it caches; the second reuse is pure savings.
  </Card>

  <Card title="2. Append only" icon="layers">
    Matching runs byte by byte from the start of messages; editing history invalidates it, and hits round down to 128 tokens.
  </Card>

  <Card title="3. Chain long conversations" icon="link">
    Multi-turn chat only reuses the original static prefix; responses + previous\_response\_id grows hits with every turn.
  </Card>

  <Card title="4. Do not bank on hits" icon="scale">
    Hits are not guaranteed. Budget at the uncached price and treat the discount as a bonus.
  </Card>
</CardGroup>

## Related Links

* Same group: [Grok overview](/en/api-capabilities/grok/overview) · [Chat and reasoning](/en/api-capabilities/grok/chat) · [Web and X search](/en/api-capabilities/grok/web-search) · [Code execution and MCP](/en/api-capabilities/grok/code-execution-mcp)
* Caching on other channels: [OpenAI cache billing](/en/api-capabilities/openai/prompt-caching) · [Gemini cache billing](/en/api-capabilities/gemini/prompt-caching) · [Claude cache billing](/en/api-capabilities/claude-prompt-caching)
* Platform-wide overview: [cache billing FAQ](/en/faq/cache-billing)
* Get or manage tokens: `https://api.apiyi.com/token`
* xAI official docs: `docs.x.ai/developers/advanced-api-usage/prompt-caching`
