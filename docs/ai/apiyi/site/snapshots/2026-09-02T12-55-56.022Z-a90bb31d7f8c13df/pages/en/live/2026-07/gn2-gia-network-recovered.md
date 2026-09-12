> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cross-Border Return Route Recovered Around 13:00 (UTC+8)

> The cross-border return route (GN2 GIA) slowdown that began around 11:50 (UTC+8) on 7/31 recovered around 13:00 (UTC+8), with Base64 image endpoint download times back to normal. The incident was a carrier-side link fluctuation; the platform and upstream model services were healthy throughout and text endpoints were never affected.

**2026/7/31 16:06 (UTC+8)** · Service Notice

✅ **The cross-border return route recovered around 13:00 (UTC+8) — image endpoint download times are back to normal**

Root cause: the slowdown was on the carrier link for the return leg into mainland China (the GN2 GIA route) — a carrier-side link fluctuation. The platform and upstream model services were healthy throughout: during the window, `nano-banana`, `gpt-image-2` and other image endpoints accepted requests and generated without error, and only the downstream transfer of Base64 response bodies was slow. Plain text endpoints were never affected. Cross-border link issues like this are outside what we or our upstreams can control — all we can do is monitor in real time and wait for the carrier side to recover.

Current status:

* Image endpoints (Base64 responses): recovered, download times back to normal
* Text endpoints: normal throughout
* Any client-side timeout you raised this morning can be restored at your own discretion

Thank you for your patience and reports during the window — we continue to monitor the cross-border links. The original incident notice: [Cross-Border Return Route Slowdown](/en/live/2026-07/gn2-gia-network-latency).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
