> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Hitting Google's High-Demand Error

> gemini-3-pro-image-preview (Nano Banana Pro) is frequently returning Google's upstream high-demand error — not a quota issue, an upstream-side situation. Recommend backoff retries while waiting for recovery.

**2026/5/12 17:31 (UTC+8)** · Model Status · Google

⚠️ **`gemini-3-pro-image-preview` (a.k.a. Nano Banana Pro) frequently hitting Google's high-demand error** — Calls to `gemini-3-pro-image-preview` are repeatedly returning `This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.` from Google upstream. **This is NOT an account quota issue** — it's a demand spike on Google's official side that the proxy layer cannot absorb. Recommend adding **exponential backoff retries** on the client and waiting for upstream demand to ease. We'll update this entry when upstream recovers.

***

← [Back to Live](/en/live) · 📚 [Monthly Archive](/en/live/archive)
