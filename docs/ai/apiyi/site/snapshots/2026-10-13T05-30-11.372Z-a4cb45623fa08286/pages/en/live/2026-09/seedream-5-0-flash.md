> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedream 5.0 Flash Is Live: $0.018 per Image in About 15–20 Seconds

> BytePlus's new fast image model seedream-5-0-flash-260915 is live: $0.018 per request, the same as the official price, free reference images, 15–20 second generation and accurate Chinese layouts in our tests. No batch sequence or streaming; transparent layers use layer separation, billed per output image.

**2026/9/24 19:06 (UTC+8)** · New Model · ByteDance

🚀 **`seedream-5-0-flash-260915` is live at \$0.018 per request, the cheapest in the series**

BytePlus's new fast image model focuses on speed, layout and low cost. In our launch-day tests, text-to-image took 15–20 seconds and all three lines of a Chinese poster rendered correctly. Reference images are free: 1 and 10 reference images were each billed \$0.018. Pricing matches the provider, and top-up bonuses bring it roughly 9%–17% below the official price.

Before integrating, note:

* `sequential_image_generation` and `stream` are not supported; any value returns 400
* Without `watermark: false`, images carry an "AI generated" watermark
* Transparent assets need `layer_decomposition`, which is billed per output image, often a dozen or more

Full write-up: [Seedream 5.0 Flash Is Live](/en/news/seedream-5-0-flash-launch). Parameters: [Seedream overview](/en/api-capabilities/seedream-image/overview).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.