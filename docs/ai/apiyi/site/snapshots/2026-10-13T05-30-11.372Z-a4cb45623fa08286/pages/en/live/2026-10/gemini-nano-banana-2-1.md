> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 Is Live: $0.05 per Request, 4K Included

> Google Nano Banana 2.1 (gemini-nano-banana-2.1), now generally available, is live on APIYI with better image quality, text rendering and multi-turn consistency than Nano Banana 2. $0.05 per request (same for 1K/2K/4K), or token-based at $0.66 input / $13.2 output per 1M tokens. Nano Banana 2 remains available at the same price.

**2026/10/7 13:52 (UTC+8)** · New Model · Google

🚀 **Nano Banana 2.1 (`gemini-nano-banana-2.1`) is live at \$0.05 per request, the same price for 1K / 2K / 4K**

Google released this GA model on October 6 as an upgrade to Nano Banana 2, with better image quality, in-image text rendering and multi-turn editing consistency, and the tiling artifacts fixed. Token-based billing is \$0.66 input / \$13.2 output per 1M tokens (44% of Google's price).

A few things to note:

* The `512` resolution is not supported; passing it returns 400 (not billed)
* The model thinks before generating by default, and thinking tokens are billed at the same rate as the image, so per-request billing is cheaper for 4K
* Groups: `Default` and `NB-Enterprise` (1.4x)

Nano Banana 2 (`gemini-3.1-flash-image`) remains available at the same price, and Google has not announced a shutdown date for it. See [Nano Banana 2.1 Image Gen/Editing](/en/api-capabilities/gemini-nano-banana-2.1/overview).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.