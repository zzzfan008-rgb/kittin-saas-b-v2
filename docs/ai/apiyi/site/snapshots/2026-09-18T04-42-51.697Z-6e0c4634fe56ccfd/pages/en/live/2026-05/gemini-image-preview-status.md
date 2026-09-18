> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini image preview status · 3-pro normal · 3.1-flash restocking

> Since 10:00 (UTC+8) today, gemini-3-pro-image-preview runs normally while gemini-3.1-flash-image-preview is restocking due to insufficient concurrency. For Nano Banana 2, extend client timeout to up to 360s — the balance point between success rate and UX.

**2026/5/22 10:46 (UTC+8)** · Model Status · Google

📊 **Gemini image preview status sync · `gemini-3-pro-image-preview` normal · `gemini-3.1-flash-image-preview` restocking** — Since **10:00 (UTC+8)** today: `gemini-3-pro-image-preview` is **running normally** and callable directly; `gemini-3.1-flash-image-preview` is **restocking** due to **insufficient concurrency** — queues / timeouts may surface during peak hours while we keep ops on it.

💡 **Nano Banana 2 timeout guidance**: clients should **extend the timeout up to 360s max** — this is the **balance point between success rate and UX**: too short kills requests that would otherwise have succeeded; too long degrades the wait experience.

🎯 **Our ops principle**: **If upstream doesn't break, neither do we** — stable upstream means stable relay; when upstream wobbles, we keep investing ops effort and post status updates on Live as soon as we have signal.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
