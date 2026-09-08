> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cross-Border Return Route Slowdown: Base64 Image Endpoints Download Slowly, Text Endpoints Normal

> Around 11:50 (UTC+8) on 7/31, the cross-border return route (GN2 GIA) appears degraded. Upstream model services are healthy — nano-banana, gpt-image-2 and other image endpoints accept and generate normally; the slowdown is in the downstream transfer of response data, so endpoints returning images as Base64 are the most affected. Text endpoints are unaffected.

**2026/7/31 12:25 (UTC+8)** · Service Notice

⚠️ **Around 11:50 (UTC+8), the cross-border return route appears degraded — Base64 image endpoints download slowly, text endpoints are normal**

Root cause: the issue currently points to the carrier link on the return leg into mainland China (the GN2 GIA route). Upstream model services themselves are healthy — `nano-banana`, `gpt-image-2` and other image endpoints accept requests and generate without error; what is slow is the downstream transfer of the response. Endpoints that return images as Base64 are therefore the most affected (large response bodies multiply the download time), while plain text endpoints are unaffected.

Current status:

* Image endpoints (Base64 responses): callable, with longer response times
* Text endpoints: normal
* Live concurrency: still high, with a few customers reporting the slowdown

For latency-sensitive image jobs, consider raising your client-side timeout and retrying. We are tracking the link condition and will update this page once it recovers. Thank you for your patience — we remain on continuous operations duty.

**Update (around 13:00 UTC+8 on 7/31)**: the link has recovered and image endpoint download times are back to normal — see [Cross-Border Return Route Recovered](/en/live/2026-07/gn2-gia-network-recovered).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
