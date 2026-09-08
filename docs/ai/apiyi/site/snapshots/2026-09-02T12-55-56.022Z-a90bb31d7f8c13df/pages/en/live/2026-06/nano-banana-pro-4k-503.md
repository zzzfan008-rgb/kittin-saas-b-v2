> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro hitting 503 at 4K · Google compute congested

> Due to a performance/compute issue on Google's side, Nano Banana Pro frequently returns 503 at 4K resolution, even when the account still has quota — this is not an account-pool issue. 2K is relatively normal, and the sibling gemini-3.1-flash-image (Nano Banana 2) is currently more stable.

**2026/6/24 10:57 (UTC+8)** · Model Status · Google

⚠️ **`gemini-3-pro-image` (Nano Banana Pro) hitting 503 at 4K · Google compute congested**

The root cause is a performance/compute issue on Google's side: `gemini-3-pro-image` frequently returns 503 at 4K. To be clear — this is **not an account-pool issue**: it still returns 503 even when the account has quota left, so it's genuinely compute congestion on the official side; Google's lane is crowded right now.

Current status by resolution / model (pick whichever fits):

* `gemini-3-pro-image` (Nano Banana Pro) 4K: frequent 503
* `gemini-3-pro-image` (Nano Banana Pro) 2K: relatively normal; 2K is a reasonable choice unless 4K is required
* `gemini-3.1-flash-image` (Nano Banana 2): currently more stable

We keep tracking the recovery of Google's compute and will sync progress — thanks for your patience.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
