> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Implicit Caching Billing Guide

> Gemini implicit caching is auto-enabled and hits bill at the official discount — but hit rates trail Claude/OpenAI, so budget at uncached prices.

APIYI's Gemini channel auto-enables **implicit context caching**: when a request prefix hits, the matched portion bills at the official discount and the `cached_content_token_count` field is returned untouched — zero code changes.

The headline first: **Gemini caching exists, but don't count on it.** Implicit cache behavior is controlled upstream, and real-world hit rates clearly trail [OpenAI](/en/api-capabilities/openai/prompt-caching) and [Claude](/en/api-capabilities/claude-prompt-caching). Treat it as a nice-to-have bonus and **always estimate costs at the uncached price**.

This page is based on the official Google documentation (`ai.google.dev/gemini-api/docs/caching`, as of June 2026).

## The Mechanism in One Sentence

When a request's opening segment (prefix) matches a recent request and meets the minimum length, the upstream reuses its cache automatically: the matched portion bills at the official discount (officially **up to 90% off**), no markers needed.

## Trigger Conditions

| Condition             | Requirement                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Minimum prefix length | **Gemini 3 / 3.1 / 3.5 series: 4096 tokens**; 2.5 series: 2048 tokens                                       |
| Stable prefix         | Byte-for-byte identical from the first character; dynamic content (timestamps, random IDs) breaks the match |
| Time window           | Caches expire after idle time; back-to-back requests hit more reliably                                      |

Note Gemini's caching threshold (4096) is much higher than OpenAI's (1024) — **short system prompts essentially never hit on Gemini**, one reason Gemini caching feels underwhelming.

## How to Confirm a Hit

Check `usage_metadata.cached_content_token_count`:

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[LONG_STABLE_PREFIX, question]
)

usage = response.usage_metadata
print(f"Input: {usage.prompt_token_count}")
print(f"Cache hits: {usage.cached_content_token_count}")  # > 0 means a hit
```

Hits appear as discounted line items in the billing dashboard; in REST responses the field is `usageMetadata.cachedContentTokenCount`.

## Raising Your Odds

The playbook is the same as OpenAI's (full explanation in the [OpenAI Cache Billing Guide](/en/api-capabilities/openai/prompt-caching)):

* **Stable content first**: long system instructions, documents, few-shot examples up front; user input and timestamps last
* **Make the prefix long**: anything under 4096 tokens (Gemini 3 series) never hits
* **Cluster reuse in time**: send batch jobs back to back, don't space them out
* Multi-turn chats are naturally append-only prefixes and hit more easily

Even doing everything right, **a hit is not guaranteed** — implicit caching is best-effort, unlike the deterministic behavior of OpenAI/Claude.

## Explicit Caching (cachedContents)

Google also offers an explicit caching API (`cachedContents` — create a TTL'd cache object and reference it). That is a **stateful server-side resource and is not currently supported** on the APIYI channel; use implicit caching.

## Versus Other Channels

|                   | Gemini                                  | OpenAI          | Claude                    |
| ----------------- | --------------------------------------- | --------------- | ------------------------- |
| Trigger           | Implicit, automatic                     | Fully automatic | Manual markers            |
| Minimum threshold | **4096** (3 series) / 2048 (2.5 series) | 1024            | 1024–4096                 |
| Hit discount      | Officially up to 90% off                | 0.1×            | 0.1×                      |
| Hit reliability   | ⚠️ Best-effort, mediocre                | ✅ Stable        | ✅ Stable                  |
| Hit field         | `cached_content_token_count`            | `cached_tokens` | `cache_read_input_tokens` |

**For cache-sensitive workloads with long, frequent prefixes (agents, RAG, batch documents), prefer the OpenAI or Claude channels.** Platform-wide cache support overview: [Cache Billing FAQ](/en/faq/cache-billing).

## Related Links

* This group: [Native Calls](/en/api-capabilities/gemini/native) · [Multimodal & Code Execution](/en/api-capabilities/gemini/multimodal) · [Function Calling](/en/api-capabilities/gemini/function-calling)
* Other channels: [OpenAI Cache Billing](/en/api-capabilities/openai/prompt-caching) · [Claude Cache Billing](/en/api-capabilities/claude-prompt-caching)
* Official Google docs: `ai.google.dev/gemini-api/docs/caching`
