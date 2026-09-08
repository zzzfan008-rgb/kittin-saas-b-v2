> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2 429 / 408 errors notice (Default group under load)

> The Default group's gpt-image-2 official-relay capacity is tight and may surface as 429 rate-limit or 408 timeout; options include retrying, switching token group to image2Enterprise (1.2x), or moving to the per-call gpt-image-2-all reverse channel (also tight on concurrency, ETA ~30 min).

**2026/4/27 11:24 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2` 429 / 408 errors notice** — The Default group's `gpt-image-2` official-relay capacity is tight, which can surface as 429 (rate-limit) or 408 (timeout). Available options:

1. **Retry**: wait for capacity to free up.
2. **Switch token group**: edit your token and move it to `image2Enterprise` (1.2x rate) — still official relay, suitable as a temporary bridge.
3. **Switch model**: use the per-call `gpt-image-2-all` (reverse); that channel also has tight concurrency right now, ETA \~30 minutes to replenish.

📖 Official relay vs. reverse: [/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
