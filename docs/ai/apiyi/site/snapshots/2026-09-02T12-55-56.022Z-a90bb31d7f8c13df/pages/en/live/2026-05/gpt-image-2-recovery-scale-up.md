> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2 official-relay recovered yesterday + enterprise group scaled up; watch status.openai.com

> gpt-image-2 enterprise group (official relay to OpenAI API) recovered yesterday alongside OpenAI upstream, and we've added more resources to handle increased demand. Pro tip: watch status.openai.com directly for upstream visibility. Reverse channel gpt-image-2-all remains stable.

**2026/5/8 09:53 (UTC+8)** · Model Status · OpenAI

✅ **gpt-image-2 official-relay recovered yesterday + enterprise group scaled up** — The 5/7 latency and `The server had an error while processing your request.` errors on `gpt-image-2` enterprise group (official relay to OpenAI API) **recovered yesterday in lockstep with the OpenAI upstream**. We also took advantage of the demand spike to add another batch of capacity to the enterprise group — overall throughput stability is up.

💡 **Tip from this incident**: When the OpenAI official-relay channel misbehaves, the fastest signal is to open `status.openai.com` directly — if upstream is degraded, the relay will be too. Saves troubleshooting time on our side.

🔁 **Status note**: `gpt-image-2-all` (reverse channel) has been continuously stable through this period, and traffic on it keeps trending up.

📖 Official-relay vs reverse: [/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [Back to Live Updates](/en/live) · 📚 [Archive](/en/live/archive)
