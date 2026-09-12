> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2 official-relay (enterprise group) errors trace to OpenAI upstream

> OpenAI's status page shows an elevated error rate on the image generation API. The gpt-image-2 enterprise group (official-relay to OpenAI API) is currently slow and returning 'The server had an error while processing your request.' — confirmed upstream issue.

**2026/5/7 16:07 (UTC+8)** · Model Status · OpenAI

⚠️ **gpt-image-2 official-relay (enterprise group) latency / errors trace to OpenAI upstream** — `gpt-image-2` on the enterprise group (official relay to OpenAI's API) is currently slow and returning `The server had an error while processing your request.`. **OpenAI's status page** has posted `Increased error rate with image generation in the API` (Monitoring · Affects APIs) — this is an upstream official outage; APIYI's official-relay channel is impacted in lockstep with OpenAI.

🔁 **Status note**: `gpt-image-2-all` (reverse channel, routes through the ChatGPT web pipeline rather than the official API) is not part of this incident scope. We'll keep following OpenAI's status page and update this entry as recovery progresses.

<Frame>
  <img src="https://mintcdn.com/apiyillc/6G_eO3td8qdCgLbM/images/openai-status-image-gen-error-20260507.png?fit=max&auto=format&n=6G_eO3td8qdCgLbM&q=85&s=f1d856920771dcf1977c83272e0808f5" alt="OpenAI status page: Increased error rate with image generation in the API — Monitoring · Ongoing for 8 minutes · Affects APIs" width="1762" height="1458" data-path="images/openai-status-image-gen-error-20260507.png" />
</Frame>

📖 Official-relay vs reverse: [/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [Back to Live Updates](/en/live) · 📚 [Archive](/en/live/archive)
