> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3-flash-preview occasional lag · gemini-3.5-flash has more concurrency to try

> gemini-3-flash-preview has been lagging / queueing occasionally lately due to insufficient concurrency. The newer gemini-3.5-flash has more concurrency (Google has plenty of compute), slightly more expensive but better quality and performance — worth trying as a new option.

**2026/5/22 12:39 (UTC+8)** · Model Status · Google

📊 **`gemini-3-flash-preview` occasional lag · root cause: insufficient concurrency · `gemini-3.5-flash` has more headroom** — Heads-up: `gemini-3-flash-preview` has been **lagging / queueing occasionally** lately, root cause is **insufficient concurrency**. The newer-generation `gemini-3.5-flash` ships with **more concurrency** (Google has plenty of compute on its side), slightly more expensive but **better quality and performance** — worth trying as a **new option**.

💡 **How to choose**:

* `gemini-3-flash-preview`: positioned for **cost-efficiency**, callable directly during normal hours
* `gemini-3.5-flash`: positioned as the **new flagship Flash** — generous concurrency, fast output, benchmarks broadly ahead of Gemini 3.1 Pro; better fit for **stability / quality-sensitive** workloads

📖 Gemini 3.5 Flash launch notes: [/en/news/gemini-3-5-flash-launch](/en/news/gemini-3-5-flash-launch)

🎯 **Our ops principle**: **If upstream doesn't break, neither do we** — stable upstream means stable relay; when upstream wobbles, we keep investing ops effort and post status updates on Live as soon as we have signal.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
