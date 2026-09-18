> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# kimi-k3 Multi-Turn Tool Calling 400 Error Fixed

> Until now, any second-round chat/completions request to kimi-k3 that echoed tool_calls history returned a 400. The cause was on APIYI's gateway, which added an extra function.parameters field when forwarding history that the model's provider strictly rejects. The fix shipped and was verified at 10:24 (UTC+8) on 11 September; streaming and non-streaming both work again and no code changes are needed.

**2026/9/11 14:18 (UTC+8)** · Model Status · Moonshot

✅ **Multi-turn tool calling on `kimi-k3` is back to normal; the earlier 400 issue is closed**

In full candor: until now, any `/v1/chat/completions` request to `kimi-k3` that echoed the assistant's `tool_calls` history into the second round returned a consistent 400 (`Extra inputs are not permitted … parameters`). The cause was on APIYI's gateway: when forwarding history it added an extra `function.parameters` field. Every other model's provider ignores that field, but the `kimi-k3` provider validates strictly and rejected it. First-round tool calls and plain-text multi-turn chats always worked, and `/v1/responses` was unaffected, so our monitoring never caught it and it was only pinned down after a customer report. That gap is on us.

The fix shipped and was verified at 10:24 (UTC+8) on 11 September: streaming and non-streaming echoes, multi-turn parallel tool calls, and a third-party agent tool all run end to end. No code or parameter changes are needed.

Thank you to the customer who reported it, and our apologies for the disruption in the meantime. We are monitoring continuously.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
