> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash GA Launch

> deepseek-v4-flash-ga-260731 is live at official pricing, $0.14/$0.28 per 1M tokens. Measured: 322K-token context answered in 14.77s, 99.9% implicit cache hit on round two, zero throttling at 20 concurrent; both endpoints available with chained explicit caching, while structured output and online search are not usable.

**2026/8/5 23:29 (UTC+8)** · New Model · DeepSeek

🚀 **DeepSeek V4 Flash GA is live at \$0.14/\$0.28 per 1M tokens, matching official pricing**

`deepseek-v4-flash-ga-260731` corresponds to `DeepSeek-V4-Flash-0731`, the open-source checkpoint promoted from preview on July 31. The architecture is unchanged from the preview (284B total / 13B activated MoE, 1M context, 384K max output) and DeepSeek states only the post-training stage was redone — yet it beats the V4-Pro preview on five agent benchmarks, reaching 82.7 on Terminal Bench 2.1.

We ran 21 test cases before launch: a 322K-token context was answered in **14.77s** with mid-document information retrieved correctly, and the hard context ceiling is 1,048,570 tokens. Implicit cache needs no configuration and hit 99.9% on the second round. All 20 concurrent requests succeeded with no throttling.

**Both endpoints are available** — Chat Completions and Responses. Explicit caching on Responses works through chaining: write the cache on the first call with `caching: {"type": "enabled"}`, then chain via `previous_response_id`. Each round measured a full hit on the entire prior context (15,629 → 15,664 → 15,701).

Three boundaries to know before integrating:

* Structured output accepts `response_format` / `text.format` on both endpoints without constraining anything: it returns 200 while ignoring the schema entirely. Use Function Call when you need enforcement
* The online search tool is wired (`web_search_call` items appear) but its backend failed 6/6 and returns no `results`; MCP returns `AccessDenied`, an account-level built-in-tool entitlement
* `reasoning_effort` is not a monotonic dial; only `minimal` behaves deterministically. For cost control, use `thinking: {"type": "disabled"}`

This is a text-only model with no image input and no Anthropic endpoint. For Claude Code integration, use `deepseek-v4-flash`.

Full measurements are in the [launch write-up](/en/news/deepseek-v4-flash-ga-launch).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
