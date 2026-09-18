> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance image link opens in a browser but fails with a format error? New FAQ explains why and how to check

> New FAQ: links from application endpoints with download caps, no Range support, or short expiry open fine in a browser, but the provider receives an error when fetching them, and submission returns 400 invalid image format. Use a plain public URL, an asset ID for repeated use, and Base64 only as a fallback. Includes curl checks.

**2026/9/18 11:19 (UTC+8)** · Docs Update · ByteDance

📚 **Seedance first-frame link opens in a browser but submission fails with `invalid image format`? The link is the problem, not the image**

A real ticket: the image link was a download grant issued by an application endpoint (`access_token` with an expiry, capped at 10 downloads), and it answered requests with a `Range` header with a 416 and a JSON body. The provider did not receive an image, so submission returned a 400 with `received: ""`. The same image submitted as Base64 produced the video.

The new FAQ explains why links like this do not work for server-side fetching, how to choose between a public URL, an `asset://` asset ID, and Base64, and gives two curl commands for checking a link. See [Seedance Says invalid image format, but the Link Opens in a Browser](/en/faq/seedance-image-url-invalid-format).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)
