> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Microsoft MAI-Image 2.6 Image Models Now Available

> Microsoft's in-house image models MAI-Image-2.6 and MAI-Image-2.6-Flash are live via the official channel, with text-to-image, reference-image editing, and strong Chinese text rendering. Flat per-image pricing of 0.12 / 0.06 USD regardless of size, available in the default group.

**2026/10/3 18:59 (UTC+8)** · New Model · Microsoft

🚀 **Microsoft `MAI-Image-2.6` / `MAI-Image-2.6-Flash` are live at \$0.12 / \$0.06 per image, any size**

Microsoft AI's in-house image models entered public preview on Microsoft Foundry on 9/4 and launched at No. 2 on Arena for both text-to-image and image editing. APIYI serves them through Microsoft's official channel, with text-to-image (`/v1/images/generations`) and reference-image editing (`/v1/images/edits`). Chinese signs and couplets render character-accurate.

* Size: custom `width` + `height`, up to a 1536×1536 area
* Group: available in `default`
* Note: do not send `response_format` / `seed` / `negative_prompt` (400); editing only accepts multipart file uploads; chat endpoints are not supported

See the [integration guide](/en/api-capabilities/mai-image/overview).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.