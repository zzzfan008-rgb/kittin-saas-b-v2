> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# New image2_OSS group: deterministic image URL output

> New image2_OSS group (1x rate, no markup) built for workloads that require deterministic URL output. gpt-image-2-vip / gpt-image-2-all may fall back to base64 when the Default group is under resource pressure; switch your token group to image2_OSS to reliably get image URLs without the base64 downgrade.

**2026/5/25 11:48 (UTC+8)** · New Model · OpenAI

🆕 **New `image2_OSS` group: deterministic image URL output** — `gpt-image-2-vip` / `gpt-image-2-all` return an image `url` by default, but the response **may fall back to `b64_json` (base64) when the Default group is under resource pressure**. For workloads that strictly depend on URL output, switch your token group to **`image2_OSS`** (**1x rate, no markup**) to reliably get image URLs without the base64 downgrade.

<Frame caption="Token creation: set billing to usage-priority and pick the image2_OSS group (1x) when you need deterministic URL output">
  <img src="https://mintcdn.com/apiyillc/eNGQJU-a_dFb12gU/images/image2-oss-token-setup-20260525.png?fit=max&auto=format&n=eNGQJU-a_dFb12gU&q=85&s=727f61464cc759006a59e8de6ceccd32" alt="Token creation dialog: billing mode usage-priority, group image2_OSS (1x rate), a group that supports image URL output, suitable for gpt-image-2-all and gpt-image-2-vip" width="1278" height="846" data-path="images/image2-oss-token-setup-20260525.png" />
</Frame>

📖 Group details: [gpt-image-2-vip](/en/api-capabilities/gpt-image-2-vip/overview) · [gpt-image-2-all](/en/api-capabilities/gpt-image-2-all/overview)

***

← [Back to Live](/en/live) · 📚 [Monthly Archive](/en/live/archive)
