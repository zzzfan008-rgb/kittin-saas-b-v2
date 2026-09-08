> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip Upstream Org-Level Rate Limit Alert

> Recent gpt-image-2-vip errors come from OpenAI's official-side org-level rate limiting: multiple accounts are linked under one organization sharing a 4000 input-images-per-minute quota, so hitting it triggers throttling — largely unrelated to our account pool. If it affects your business, we recommend switching to official-relay gpt-image-2; the images API call method and Size parameters are fully compatible.

**2026/6/5 10:59 (UTC+8)** · Model Status · OpenAI

⚠️ **`gpt-image-2-vip` upstream org-level rate limit alert** —— Recent errors like `Rate limit reached for gpt-image-2-codex ... in organization ... on input-images per min: Limit 4000, Used 4000` come from **OpenAI's official-side org-level rate limiting**: OpenAI links multiple accounts under the same organization, so all users in that org share a 4,000 input-images-per-minute quota — once it's hit, requests are throttled. This is **largely unrelated to our account pool — it's an upstream issue**. If it affects your business, we recommend switching to the official-relay `gpt-image-2`: the call method (images API) and parameters like Size are fully compatible.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
