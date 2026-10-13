> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image calls drop after about 90 seconds behind a proxy? New FAQ explains why and how to fix it

> New FAQ: when you develop locally with a VPN or proxy on, the proxy closes connections that carry no data for too long. Image requests drop in batches after 90-180 seconds no matter how long the client timeout is, and they are still billed. Routing api.apiyi.com directly fixes it; direct server deployments usually never see it.

**2026/10/3 21:17 (UTC+8)** · Docs Update

📚 **Image requests behind a VPN drop in batches after 90-180 seconds? The local proxy is the cause, not concurrency or an API timeout**

A real ticket: a customer developing an image app locally had a proxy running and a 900-second client timeout, yet about four in ten `gpt-image-2-vip` requests dropped after 90-180 seconds, often several in the same second. No data flows while an image is generated, so the proxy treated the connection as idle and closed it. APIYI still generated and billed the image, but the result never reached the program.

The new FAQ explains how proxy idle timeouts work, how to confirm the cause, how to set a direct rule in Clash / v2rayN or bypass the proxy in code, and whether this happens after deploying to a server. See [Image Calls Drop After About 90 Seconds Behind a Proxy?](/en/faq/proxy-idle-timeout-disconnect).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.