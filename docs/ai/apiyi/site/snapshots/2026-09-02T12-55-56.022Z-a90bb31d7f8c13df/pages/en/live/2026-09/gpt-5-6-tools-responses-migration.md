> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.4+ Tool Calls Returning 400: Endpoint & Migration Guide Published

> On GPT-5.4 and later, sending tools together with an explicit reasoning_effort to /v1/chat/completions can be rejected upstream with a 400. A new page covers how to confirm you hit it, how to choose between the two remedies, and exactly what changes in your code.

**2026/9/2 19:45 (UTC+8)** · Docs Update · OpenAI

📖 **On GPT-5.4+, tool calling with an explicit reasoning effort can be rejected on the chat endpoint**

A request that carries `tools` while explicitly sending a non-`none` `reasoning_effort` gets a 400 from upstream: `Function tools with reasoning_effort are not supported ...`. This is an official OpenAI restriction introduced with the GPT-5.4 series, intended to move tool calling onto `/v1/responses`.

We measured this in the default group on September 2: all four of `low`, `medium`, `high` and `xhigh` trigger it, while **omitting the parameter does not**. Whether it fires also depends on which upstream route the request lands on, so the same model can return 200 now and 400 later — "it worked last time" is not evidence that you are safe.

Two ways out: move tool-carrying requests to `/v1/responses` (keeping both reasoning and tools), or set `reasoning_effort="none"` explicitly (keeping the endpoint, giving up reasoning). The new page has the measurements, the trade-off between the two, a full before/after tool-calling code comparison, and a post-migration checklist.

📖 [Endpoint & Migration](/en/api-capabilities/openai/responses-migration)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
