> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Prompt Caching Guide

> Get started with Prompt Cache on the Anthropic native format: how to write cacheable requests, how to read your bill, and why your hit rate is zero. Cuts cost by up to 90%.

If you're using Claude Code, Cline, Cursor, or hand-rolling your own Claude API calls, **Prompt Cache is the single biggest knob for lowering your bill** — cached input tokens are billed at just **0.1×**, a 90% discount.

This page is based on Anthropic's official documentation (`platform.claude.com/docs/en/build-with-claude/prompt-caching`) and adapted to APIYI's setup with copy-paste-ready examples.

## In one sentence

Mark a **long, reused prompt prefix** (system instructions / a long document / few-shot examples) with `cache_control`. The server stores it; on the next request with the same prefix, it skips reprocessing — **roughly 10× cheaper and faster**. It expires after a period of inactivity.

## Why bother — read the multipliers

Relative to the model's base input token price (`1×`):

| Type                     | Price     | Notes                               |
| ------------------------ | --------- | ----------------------------------- |
| Plain input              | **1×**    | Whatever isn't cached, full price   |
| Cache write (5-min TTL)  | **1.25×** | First-time write costs 25% more     |
| Cache write (1-hour TTL) | **2×**    | Pay more to store longer            |
| **Cache read (hit)**     | **0.1×**  | The whole point. 90% off thereafter |

**Break-even points:**

* **5-min TTL**: only **2 reuses** of the same prefix to break even (1.25 + 0.1 = 1.35, cheaper than 2.0 for two uncached requests).
* **1-hour TTL**: **3 reuses** to break even (2 + 0.2 = 2.2, cheaper than 3.0).

<Info>
  TTL is a **sliding window**: every cache hit resets the expiration timer, so active conversations don't expire from under you. Only true idleness beyond the TTL causes eviction.
</Info>

### Good fit

* The same long system prompt called many times (agents, chatbots)
* Multi-turn conversations (every prior turn becomes reusable prefix)
* Batch processing of one document (asking 50 questions about one contract)
* RAG, where stable retrieved chunks form the prefix

### Bad fit

* Every prompt differs from the first character onward
* The whole thing is short and never crosses the per-model minimum (below)

## The three hard requirements

All three are mandatory.

### 1. Explicit `cache_control` marker

`content` cannot be a plain string. It must be a **content block array**, with `cache_control` attached to the block you want cached:

```python theme={null}
# ❌ Wrong: plain string is never cached
"content": "a long passage..."

# ✅ Right: content block + cache_control
"content": [
    {
        "type": "text",
        "text": "a long passage...",
        "cache_control": {"type": "ephemeral"},
    },
    {"type": "text", "text": "the question"},
]
```

### 2. Length must clear the per-model minimum

If the content is shorter than the model's minimum, **it won't be cached even with the marker** (no error, just silently skipped). Verified against Anthropic's official docs:

| Minimum tokens | Models                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| **512**        | Opus 5, Fable 5, Mythos 5                                              |
| **1,024**      | Opus 4.8, Sonnet 5, Sonnet 4.6, Sonnet 4.5, Sonnet 4, Opus 4.1, Opus 4 |
| **2,048**      | Opus 4.7, Haiku 3.5                                                    |
| **4,096**      | Opus 4.6, Opus 4.5, Haiku 4.5                                          |

<Warning>
  **This threshold does not decrease monotonically with version number — don't guess it.** The most counterintuitive pairs: Opus 5 needs only **512**, while the older Opus 4.6 / 4.5 need **4,096** — an 8× difference. Haiku 4.5 is also 4,096, which is *higher* than the older Haiku 3.5 (2,048). So neither "newer models have lower thresholds" nor "smaller models have lower thresholds" holds. Check the table whenever you switch models.
</Warning>

<Tip>
  English text averages roughly 0.75 words per token. In practice: Opus 5 caches from about **380+ words** of stable content, Sonnet 5 / Sonnet 4.6 need around **770 words**, and Opus 4.6 / Haiku 4.5 need roughly **3,000 words** before caching does anything. Always refer to Anthropic's official docs for the latest thresholds — they can change between model versions.
</Tip>

<Info>
  **Measured on APIYI (2026-07-29).** We probed the write threshold with a fixed prefix stepped up in size: `claude-opus-5` produced no cache write at 301 tokens but did at 614, bracketing the official **512**; `claude-sonnet-5` produced none at 612 but did at 1,250, bracketing the official **1,024**. Both match the table above.
</Info>

### 3. Prefix must match byte-for-byte

Caching is **prefix-based**: from the start of the request up to the `cache_control` marker, the byte stream must be **identical** to the previous request. Any single character change — whitespace, JSON key ordering, a timestamp — counts as a new prefix and triggers a fresh write instead of a hit.

**Practical rule: stable stuff up front, volatile stuff at the back.**

```python theme={null}
# ❌ Wrong: question first means the prefix changes every turn; never hits
content = [
    {"type": "text", "text": "Please answer this question: " + question},  # volatile
    {"type": "text", "text": long_doc, "cache_control": {"type": "ephemeral"}},
]

# ✅ Right: long stable content first with marker, question after
content = [
    {"type": "text", "text": long_doc, "cache_control": {"type": "ephemeral"}},  # stable
    {"type": "text", "text": question},                                            # volatile
]
```

## Minimal runnable example

Send two requests using the same long document but different questions. The first writes, the second hits:

```python theme={null}
import json, os, requests

URL = "https://api.apiyi.com/v1/messages"
KEY = os.environ["APIYI_API_KEY"]
HEADERS = {
    "content-type": "application/json",
    "x-api-key": KEY,
    "anthropic-version": "2023-06-01",
}

# Must be long enough. Sonnet 4.6 needs >= 1,024 tokens (~770+ English words).
LONG_TEXT = open("long_document.txt").read()


def ask(question: str, label: str):
    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 256,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": LONG_TEXT, "cache_control": {"type": "ephemeral"}},
                {"type": "text", "text": question},
            ],
        }],
    }
    r = requests.post(URL, headers=HEADERS, data=json.dumps(payload), timeout=120)
    u = r.json().get("usage", {})
    print(f"[{label}] input={u.get('input_tokens')} "
          f"write={u.get('cache_creation_input_tokens')} "
          f"read={u.get('cache_read_input_tokens')}")


ask("Summarize the main idea", "1st")  # expect write>0, read=0
ask("Give 3 keywords",        "2nd")    # expect write=0, read>0
```

Expected output:

```text theme={null}
[1st] input=35 write=6512 read=0
[2nd] input=22 write=0    read=6512
```

The second call's `read` ≈ the first call's `write` — the same prefix is being reused.

## How to tell whether you hit — three usage fields

In every response, `usage` reports:

| Field                         | Meaning                           | Billing multiplier |
| ----------------------------- | --------------------------------- | ------------------ |
| `input_tokens`                | Uncached input tokens             | 1×                 |
| `cache_creation_input_tokens` | Tokens written to cache this call | 1.25× or 2×        |
| `cache_read_input_tokens`     | Tokens read from cache this call  | **0.1×**           |

**Total input tokens = sum of all three.** As long as `cache_read_input_tokens > 0`, you're saving money.

## Most common pitfalls

| Symptom                                          | Cause                                                                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `write` always `0` or field missing              | No `cache_control` marker / below the minimum threshold / used OpenAI-compatible format                                                                     |
| 2nd request still has `write > 0` and `read = 0` | Prefix changed. Common culprits: `datetime.now()`, UUIDs, rotating user IDs in the prompt; non-deterministic JSON serialization; timestamped system prompts |
| It worked, then a while later writes again       | Idle beyond TTL. Use `{"type": "ephemeral", "ttl": "1h"}` for longer retention                                                                              |
| Same prompt, different model — no hit            | Caches are isolated per model. Switching models = new cache key                                                                                             |
| Recent turns in a long conversation don't hit    | Max **4** `cache_control` breakpoints per request; each breakpoint only looks back **20 content blocks** for prior cache entries                            |

<Warning>
  **Prompt Cache only works on the Anthropic native format (`/v1/messages`).** When you call Claude through the OpenAI-compatible format (`/v1/chat/completions`), no cache fields will come back regardless of what you send. For Claude Code, Cline, Cursor and similar high-frequency clients, the native format is mandatory if you care about your bill.
</Warning>

## Advanced: multi-turn conversations

Place `cache_control` on **the last content block of the most recent user message**. Each new turn auto-extends the cached read range up to the end of the previous turn:

```python theme={null}
# When constructing the Nth turn's request
messages[-1]["content"][-1]["cache_control"] = {"type": "ephemeral"}
```

Two hard limits to keep in mind:

* At most **4** `cache_control` breakpoints per request.
* Each breakpoint's prefix lookup window is **at most 20 content blocks back** — anything older than that won't be considered for a hit. In other words, in very long conversations, marking only the latest turn won't cover the entire prior history.

A common pattern: place one breakpoint each on tool definitions, system prompt, long documents, and the latest conversation turn — using all 4 slots so that sections changing at different rates don't invalidate each other's cache.

## On APIYI and caching

<Info>
  **APIYI forwards cache fields end-to-end.** The `cache_control` you send is passed through to upstream Claude (AWS Claude or Claude Official) as-is, and the returned `cache_creation_input_tokens` / `cache_read_input_tokens` are passed straight back to you — no special adaptation needed in your code.
</Info>

How to self-verify:

1. On the first request, `usage.cache_creation_input_tokens > 0` (write succeeded).
2. Within seconds, send the same prefix again — you should see `usage.cache_read_input_tokens > 0` (hit).
3. Your billing dashboard will itemize **cache writes** and **cache reads** separately, at the same official multipliers (1.25× / 2× / 0.1×).

## Recap

<CardGroup cols={2}>
  <Card title="1. Mark it" icon="tag">
    `cache_control: {"type": "ephemeral"}` on a content block — **plain-string `content` is never cached**.
  </Card>

  <Card title="2. Long enough" icon="ruler">
    Opus 5 ≥ 512; Sonnet 5 / Sonnet 4.6 ≥ 1,024; Opus 4.7 ≥ 2,048; Opus 4.6 / Haiku 4.5 ≥ 4,096 tokens, otherwise silently skipped.
  </Card>

  <Card title="3. Stable prefix" icon="lock">
    Stable up front, volatile in the back; one character of drift kills the hit.
  </Card>

  <Card title="4. Check usage" icon="search">
    Only `cache_read_input_tokens > 0` proves you actually saved money.
  </Card>
</CardGroup>

## Related links

* Parent page: [Claude API Basics](/en/api-capabilities/claude)
* Client setup guides: [Claude Code integration](/en/scenarios/programming/claude-code) · [Cherry Studio integration](/en/scenarios/chat/cherry-studio)
* Get / manage tokens: `https://api.apiyi.com/token`
* Anthropic official docs: `platform.claude.com/docs/en/build-with-claude/prompt-caching`
