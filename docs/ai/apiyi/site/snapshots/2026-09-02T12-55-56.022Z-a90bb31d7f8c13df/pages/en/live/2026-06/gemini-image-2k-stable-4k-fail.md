> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini image model status follow-up · 2K stable, 4K currently failing

> Following up on the official high-load alert: in our tests, gemini-3-pro-image-preview 2K image generation remains stable (first byte ~40-70s), while 4K requests currently fail almost every time. Use 2K during the spike and retry 4K after official load subsides.

**2026/6/5 18:19 (UTC+8)** · Model Status · Google

⚠️ **`gemini-3-pro-image-preview` status follow-up · 2K stable, 4K currently failing** —— Following up on the 17:01 (UTC+8) official high-load alert: in our tests, **2K image generation remains stable** (non-streaming first byte \~40-70s, see the call logs below), while **4K requests currently fail almost every time**. During the demand spike, 2K is the workable resolution — retry 4K after official load subsides.

<Frame caption="Call logs at 18:19 (UTC+8), June 5, 2026: consecutive successful 2K generations on gemini-3-pro-image-preview, first byte 36-71s">
  <img src="https://mintcdn.com/apiyillc/4XK5KU-hJ0N-aQDj/images/live/gemini-3-pro-image-2k-logs-20260605.jpg?fit=max&auto=format&n=4XK5KU-hJ0N-aQDj&q=85&s=29d709427c9f2833a88bf43599b4f16c" alt="gemini-3-pro-image-preview 2K generation call logs, consecutive successes, first byte 36-71 seconds" width="1096" height="1442" data-path="images/live/gemini-3-pro-image-2k-logs-20260605.jpg" />
</Frame>

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
