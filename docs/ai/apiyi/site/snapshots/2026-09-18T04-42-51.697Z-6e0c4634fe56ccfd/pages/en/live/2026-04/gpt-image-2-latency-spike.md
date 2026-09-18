> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Widen client timeout to 360–600s on official-relay gpt-image-2

> Official-relay gpt-image-2 calls currently take around 200 seconds, likely an OpenAI upstream issue. Capacity is always tight in a model's early days — quality is fine, speed depends on the upstream. Widen your client timeout to 360–600s so the request can complete. Reverse gpt-image-2-all responds faster, with partial size-parameter support (4K not supported).

**2026/4/29 14:58 (UTC+8)** · Model Status · OpenAI

⏱️ **Widen client timeout to 360–600s on official-relay `gpt-image-2`** — Single calls currently take \~200 seconds, likely an OpenAI upstream issue. Capacity is always tight in a model's early days — what matters is that the image comes through (quality is fine; speed depends on the upstream right now). Widen your client timeout to 360–600s so the request can run to completion. Reverse `gpt-image-2-all` responds faster currently, with partial size-parameter support on that reverse model (4K not supported).

📖 Official relay vs. reverse: [/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

📖 Reverse-channel model docs: [/en/api-capabilities/gpt-image-2-all/overview](/en/api-capabilities/gpt-image-2-all/overview)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
