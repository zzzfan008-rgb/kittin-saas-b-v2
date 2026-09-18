> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2 now supports transparent backgrounds — one parameter, real alpha-channel PNGs

> OpenAI opened up the transparent value of the background parameter for GPT-Image-2, and APIYI has verified it end to end. Pass background as transparent with output_format set to png or webp and you get a real alpha-channel image back. Text-to-image, image editing, and the Responses image tool all support it, at no extra cost.

**2026/8/21 16:57 (UTC+8)** · New Model · OpenAI

🚀 **`gpt-image-2` now does transparent backgrounds — one parameter gets you a real alpha-channel PNG, no manual cutouts**

OpenAI opened up the `transparent` value of the `background` parameter for GPT-Image-2 today (marked preview by OpenAI), and APIYI has verified it works. Two fields in the request is all it takes: `"background": "transparent"` plus `"output_format": "png"`, and what comes back is a PNG with a real alpha channel. `webp` also carries alpha and produces smaller files.

All three paths work: text-to-image `/v1/images/generations`, image editing `/v1/images/edits`, and the `image_generation` tool on `/v1/responses`. Mask inpainting (`mask`) and a transparent background work together without conflict. **Transparency costs nothing extra** — at the same quality tier and size, `transparent` and `opaque` consume exactly the same image tokens.

Two boundaries worth knowing:

* `jpeg` has no alpha channel and is mutually exclusive with transparency; passing `output_format: jpeg` returns 400, so use `png` or `webp`
* On the edit endpoint, transparency is a **re-draw**, not a precise trace of the original outline — subject detail will shift. For pixel-exact extraction, run `rembg` / `PIL` / `sharp` yourself

The reverse models `gpt-image-2-all` and `gpt-image-2-vip` have no `background` parameter — you can only ask for transparency in the prompt, and it is occasionally unreliable. For dependable transparent backgrounds, use official-relay `gpt-image-2`.

Per-model support, minimal examples, and common errors: [How do I generate images with a transparent background](/en/faq/image-transparent-background).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
