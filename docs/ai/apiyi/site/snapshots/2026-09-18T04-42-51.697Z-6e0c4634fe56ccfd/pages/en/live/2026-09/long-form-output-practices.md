> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Long-form output in practice: drama scripts and 10k-word writing should stream

> New Long-form Output Practices doc. For 10k-word outputs, 10-20 minutes of real generation is normal; non-streaming buffers the whole thing and races your read timeout, so you often get nothing. Stream instead, and size the read timeout to the inter-event gap.

**2026/9/12 16:25 (UTC+8)** · Docs Update · Anthropic

📚 **Long-form output (drama scripts, fiction, 10k-word articles) should stream, not use non-streaming**

When a model produces tens of thousands of characters in one call, 10-20 minutes of real generation is normal. Non-streaming buffers the whole thing before sending, so your read timeout races the entire generation and you often disconnect before the result arrives. With streaming the first byte arrives within seconds, and after that a data event arrives every few tens of seconds (measured max silent gap during `claude-opus-5` thinking \~42s, with keepalive pings), so a read timeout of 90-120s sized to the inter-event gap is enough — no huge value covering the whole run.

Also: give `max_tokens` room (start at 64000; thinking eats the budget), and check `stop_reason` — `end_turn` is success, `max_tokens` means truncated so raise it and retry.

The full recipe (streaming code, three-part timeout, retry strategy, scenario cheat sheet) is in the new Long-form Output Practices page: `/en/api-capabilities/long-form-output-practices`.

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)
