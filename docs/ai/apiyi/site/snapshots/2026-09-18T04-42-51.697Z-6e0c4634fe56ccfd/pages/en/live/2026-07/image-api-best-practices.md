> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# New Docs Group "Image API Essentials" with a Must-Read Best Practices Page

> The docs center's Image API section adds an "Image API Essentials" group, opening with a Must-Read & Best Practices page: all image models are synchronous with no async task ID — a dropped connection loses the result but is still billed — plus per-model timeout recommendations and a base64/URL output reference table.

**2026/7/15 12:49 (UTC+8)** · Docs Update

📚 **The docs center's "Image API (Official Relay)" section adds an "Image API Essentials" group, opening with the new "Must-Read & Best Practices" page**

The one-line takeaway: all APIYI image models are **synchronous calls** — there is no async task ID and no polling endpoint; if the client disconnects early, that result is lost but the request is still billed, so **setting a generous `timeout` is the first rule of image API development**. The page provides recommended `timeout` values per model plus a reference table comparing base64 and URL output modes — start at [Must-Read & Best Practices](/en/api-capabilities/image-api-best-practices).

The existing pages "[Image Compression & Output Resolution](/en/api-capabilities/image-compression-resolution)" and "[How to Generate Satisfying Images](/en/api-capabilities/image-generation-success-tips)" have also been moved into this group, so all general image-API guidance now lives in one place.

Happy reading — feedback and additions are welcome.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
