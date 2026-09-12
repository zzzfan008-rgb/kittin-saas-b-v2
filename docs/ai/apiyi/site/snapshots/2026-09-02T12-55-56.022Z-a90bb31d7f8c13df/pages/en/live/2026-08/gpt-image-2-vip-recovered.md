> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip is back to normal

> As of 00:45 (UTC+8) on 25 August, gpt-image-2-vip has recovered: failure rates and latency are back to their usual levels and the provider-side rate limiting that started at 20:30 last night has ended. Teams running -vip are still advised to wire up the official-relay gpt-image-2 as a second channel, or expose both in consumer-facing products.

**2026/8/25 00:45 (UTC+8)** · Model Status · OpenAI

✅ **`gpt-image-2-vip` recovered at 00:45 (UTC+8) on 25 August**

The provider-side abuse controls and rate limiting that began at 20:30 (UTC+8) last night have ended. Failure rates and image latency on `gpt-image-2-vip` are back to their usual levels, and 2K / 4K rendering with precise `size` control is working normally. This closes out the earlier instability notice.

Current status of the image endpoints (pick whichever fits your case):

* `gpt-image-2-vip`: back to normal
* Official-relay `gpt-image-2`: running normally, billed by usage; 4K and `quality=high` carry a higher per-image cost

For teams whose main endpoint is `-vip`, our standing integration advice is to **also wire up the official-relay `gpt-image-2` as a second channel** and handle failover in code; consumer-facing products can expose both channels in the UI and let the end user choose. That way a wobble on either channel does not take the whole flow down. When integrating the official relay, pass `quality` explicitly — the default `auto` is a dynamic tier whose cost and latency drift — see the [gpt-image-2 overview](/en/api-capabilities/gpt-image-2/overview) for the parameter reference.

Thanks for your patience during the disruption; we will keep monitoring.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by month](/en/live/archive)
