> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3.1-flash-image-preview occasionally slow

> gemini-3.1-flash-image-preview is currently occasionally slow (2-4 min) due to Google upstream load fluctuations; in the same window, gemini-3-pro-image-preview (Nano Banana Pro) is running stably.

**2026/5/14 10:11 (UTC+8)** · Model Status · Google

⚠️ **`gemini-3.1-flash-image-preview` occasionally slow (2-4 min)** —— Update: `gemini-3.1-flash-image-preview` is currently experiencing occasional slow responses, with per-request image generation clustered in the **2-4 minute** range. The root cause is **Google upstream load fluctuations**, which cannot be absorbed at the relay layer. In the same window, `gemini-3-pro-image-preview` (Nano Banana Pro) is running stably and calls return as expected.

💡 **Recommendation**: Clients may **increase timeout** appropriately and add **exponential backoff retries** to give upstream enough processing room. We will update this entry once upstream load eases.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
