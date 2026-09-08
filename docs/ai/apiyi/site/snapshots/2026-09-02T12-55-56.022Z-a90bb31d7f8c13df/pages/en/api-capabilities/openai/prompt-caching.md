> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Prompt Caching Billing Guide

> OpenAI caching is fully automatic, zero-markup, and free to write: cached input bills at 10% of the input price. How to write requests that hit, and how to read cached_tokens.

If you run agents, multi-turn chats, or batch document jobs on the gpt-5 series, Prompt Caching cuts the cached portion of your input bill to **10% of the normal price** — and it requires **zero code changes**; caching is fully automatic.

This page is based on the official OpenAI documentation (`developers.openai.com/api/docs/guides/prompt-caching`, as of June 2026), with examples adapted for APIYI.

## The One-Sentence Version

Whenever a request's **opening segment (prefix) exactly matches a recent request and is at least 1024 tokens long**, the server skips reprocessing it: the matched portion bills at **0.1×** and latency drops by up to 80%.

The two biggest differences from Claude's caching:

* **No markers**: there is no `cache_control` — caching kicks in automatically when conditions are met
* **No write fee**: Claude charges 1.25× / 2× to write; OpenAI writes for free

## Why Bother — the Billing Multipliers

With the model's raw input token price as **1×**:

| Type          | Price         | Notes                                |
| ------------- | ------------- | ------------------------------------ |
| Regular input | **1×**        | The unmatched portion, full price    |
| Cache write   | **0× (free)** | Happens automatically, costs nothing |
| **Cache hit** | **0.1×**      | Matched portion is 90% off           |

**Break-even: the 2nd request.** With no write cost to amortize, every reuse of a prefix is pure savings — simpler than Claude, where you pay 1.25× upfront and need two reuses to break even.

In APIYI's live prices (per 1M tokens):

| Model               | Regular input | Cache hit   |
| ------------------- | ------------- | ----------- |
| `gpt-5.4`           | \$2.50        | **\$0.25**  |
| `gpt-5.4-mini`      | \$0.75        | **\$0.075** |
| `gpt-5.5`           | \$5.00        | **\$0.50**  |
| `gpt-5.1` / `gpt-5` | \$1.25        | **\$0.125** |

### Good fits

* A long system prompt + tool definitions reused across calls (agents, support bots)
* Multi-turn conversations (each new turn auto-hits on all prior history)
* Batch-processing one document (asking 50 questions about one contract)
* RAG with stable document chunks placed at the front of the prompt

### Poor fits

* Requests that differ from the very first character
* Prompts under 1024 tokens total (below the caching threshold)

## Three Hard Conditions for a Hit

All three are required.

### 1. Prefix of at least 1024 tokens

Requests shorter than 1024 tokens are **never cached** (no error — it silently doesn't apply). Beyond 1024, hits extend in **128-token increments**: the matched length lands on steps like 1024, 1152, 1280 …, so `cached_tokens` typically reads slightly below your full stable prefix. That's normal.

### 2. Byte-for-byte identical prefix

Caching is **prefix matching**: comparison starts at the first character and stops at the first difference. Any change — a timestamp, a username, JSON key order — makes everything after it bill at full price.

**Practical rule: stable content first, volatile content last.**

```python theme={null}
# ❌ Wrong: dynamic content at the start of system — prefix changes every time, never hits
messages = [
    {"role": "system", "content": f"Current time {datetime.now()}. You are an assistant." + long_instructions},
    {"role": "user", "content": question},
]

# ✅ Right: long instructions and tool definitions stay stable up front; dynamic bits go last
messages = [
    {"role": "system", "content": long_instructions},          # stable — will hit
    {"role": "user", "content": f"Current time {datetime.now()}. {question}"},  # volatile — last
]
```

### 3. Reuse within the retention window

* Base retention: evicted after **5–10 minutes** idle, at most 1 hour
* **Since May 29, 2026 (UTC)**, gpt-5.1 and later models (including pro variants) default to **24-hour extended retention** (`prompt_cache_retention: "24h"`) for non-ZDR organizations, at no extra cost — same-day reuse essentially always hits

## Minimal Working Example

Send the same long prefix twice with different questions — the first write is automatic, the second hits:

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1"
)

# Must be long enough: at least 1024 tokens (~750+ English words)
LONG_SYSTEM = open("long_instructions.txt").read()


def ask(question: str, label: str):
    r = client.chat.completions.create(
        model="gpt-5.4",
        messages=[
            {"role": "system", "content": LONG_SYSTEM},
            {"role": "user", "content": question},
        ],
    )
    cached = r.usage.prompt_tokens_details.cached_tokens
    print(f"[{label}] input={r.usage.prompt_tokens} cached={cached}")


ask("Summarize the key points", "1st")   # expect cached=0
ask("Give 3 keywords", "2nd")            # expect cached ≈ prefix length
```

Expected output:

```text theme={null}
[1st] input=2330 cached=0
[2nd] input=2335 cached=2304
```

The 2nd call's `cached` is close to the system prompt length (rounded to 128) — that portion bills at 10%.

<Info>
  The `/v1/responses` endpoint caches automatically too; the field is `usage.input_tokens_details.cached_tokens`. OpenAI's internal testing shows cache utilization on Responses runs 40%–80% higher than Chat Completions — for multi-turn agents, prefer [Native Calls](/en/api-capabilities/openai/native).
</Info>

## Did It Hit? Read the usage Fields

| Endpoint               | Hit field                                   |
| ---------------------- | ------------------------------------------- |
| `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens` |
| `/v1/responses`        | `usage.input_tokens_details.cached_tokens`  |

**`cached_tokens > 0` means you're saving**: that portion bills at 0.1×, and the remaining `prompt_tokens - cached_tokens` bills at full price.

## Advanced: Raising Your Hit Rate

### prompt\_cache\_key routing

A hit requires the request to land on the same cache machine. Default prefix-hash routing usually suffices, but when **many users share similar prefixes** or concurrency is high, an explicit `prompt_cache_key` noticeably improves hit rates:

```python theme={null}
r = client.chat.completions.create(
    model="gpt-5.4",
    messages=messages,
    prompt_cache_key="user-12345"  # pin routing per user/session
)
```

<Warning>
  Once a single "prefix + prompt\_cache\_key" combination exceeds roughly **15 requests/minute**, traffic spills over to other machines and the hit rate drops. Under high concurrency, **split keys per user or session** — don't share one global key.
</Warning>

### Engineering a stable prefix

* Keep tool definition order and JSON serialization fixed (don't let your serializer randomize key order)
* Image inputs participate in prefix matching too — keep the URL / base64 and `detail` parameter identical when reusing
* To vary available tools per scenario, use `allowed_tools` to restrict the subset instead of editing the `tools` list — the former doesn't break the cache prefix

### Multi-turn chats hit for free

An append-only messages array naturally satisfies prefix stability: each turn's history is the previous turn's full prefix. Hits happen automatically with no extra work.

## Common Pitfalls

| Symptom                               | Cause                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `cached_tokens` always 0              | Under 1024 tokens total / dynamic content at the start of the prefix (timestamps, UUIDs, random IDs)                               |
| Intermittent hits                     | High concurrency without split `prompt_cache_key` / idle past retention                                                            |
| Hit count lower than expected         | 128-token step truncation (normal) / dynamic content leaked into the middle of the prefix                                          |
| No hits after switching models        | Caches are isolated per model — `gpt-5.4` and `gpt-5.4-mini` don't share                                                           |
| No cached\_tokens when calling Claude | OpenAI-compatible calls to Claude can't use Claude's cache — use [Claude Native Calls](/en/api-capabilities/claude-prompt-caching) |

## OpenAI vs. Claude Caching at a Glance

|                   | OpenAI (gpt-5 series)               | Claude                           |
| ----------------- | ----------------------------------- | -------------------------------- |
| Trigger           | **Fully automatic**, zero code      | Manual `cache_control` markers   |
| Write fee         | **Free**                            | 1.25× (5 min) / 2× (1 hour)      |
| Hit price         | 0.1×                                | 0.1×                             |
| Minimum threshold | 1024 tokens                         | 1024–4096 tokens by model        |
| Retention         | From 5 min; 24h default on gpt-5.1+ | 5 min / 1 hour (sliding renewal) |
| Field to watch    | `cached_tokens`                     | `cache_read_input_tokens`        |

For the full Claude-side playbook, see the [Claude Cache Billing Guide](/en/api-capabilities/claude-prompt-caching).

## APIYI and Caching

<Info>
  **The APIYI OpenAI channel supports cache hits.** Requests are forwarded upstream as-is, the `cached_tokens` field is returned to you untouched, and the billing dashboard lists the matched portion as a separate "cache read" line item at the official 0.1× rate — no middleware-specific adaptation needed in your code.
</Info>

Self-check:

1. Build a stable prefix of at least 1024 tokens and send 2 requests back to back
2. The 2nd response should show `cached_tokens > 0`
3. In the call logs, the 2nd request's input cost should be visibly lower than the 1st

## Key Takeaways

<CardGroup cols={2}>
  <Card title="1. Fully automatic" icon="wand-sparkles">
    No markers, no write fee — caching applies automatically and the 2nd use is pure savings.
  </Card>

  <Card title="2. Long enough" icon="ruler">
    At least 1024 tokens of prefix to start caching; hits count in 128-token steps.
  </Card>

  <Card title="3. Stable prefix" icon="lock">
    Stable content first, volatile content last; keep timestamps and random IDs out of the opening.
  </Card>

  <Card title="4. Watch usage" icon="search">
    Only `cached_tokens > 0` proves a hit — that portion bills at 10%.
  </Card>
</CardGroup>

## Related Links

* This group: [Native Calls](/en/api-capabilities/openai/native) · [Compatible Mode](/en/api-capabilities/openai/compatible) · [Function Calling](/en/api-capabilities/openai/function-calling)
* Claude-side caching: [Claude Cache Billing Guide](/en/api-capabilities/claude-prompt-caching)
* Get / manage tokens: `https://api.apiyi.com/token`
* Official OpenAI docs: `developers.openai.com/api/docs/guides/prompt-caching`
