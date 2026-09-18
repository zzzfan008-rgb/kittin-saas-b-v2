> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Network Wobble Around 15:00 Today · 502 Errors

> 5/19 around 15:00 (UTC+8) backend servers had an incident causing some requests to return 502. Recovery was completed by switching DNS resolution (latency briefly elevated during the switch). Upstream infra-level issue — we're tightening ops monitoring.

**2026/5/19 16:42 (UTC+8)** · Service Notice

⚠️ **Network wobble around 15:00 today (UTC+8) · 502 errors** — Heads-up: around **15:00 (UTC+8) this afternoon**, our backend servers ran into an incident that caused some requests to return **502 errors**. Recovery was completed by **switching DNS resolution**, and request latency was briefly elevated during the switch. The incident sits at the upstream infrastructure layer — out of our hands as it happened, but we'll be **tightening ops monitoring** to soften the impact of similar wobbles. Thanks for your understanding.

💡 **Recommendation**: For transient 502s, clients can add **exponential backoff retries** (1s, 2s, 4s for the first three attempts works well) — retries typically restore service.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by month](/en/live/archive)
