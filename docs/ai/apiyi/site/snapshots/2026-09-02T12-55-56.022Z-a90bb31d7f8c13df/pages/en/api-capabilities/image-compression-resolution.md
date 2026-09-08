> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Compression & Output Resolution

> Clears up the two most commonly confused questions in image API calls: what determines the output resolution, and does compressing input reference images make the output blurry?

This page is for developers calling image generation/editing models via API. It clears up the two most commonly confused questions: **① What determines the resolution of the output image? ② Does compressing input reference images make the output blurry?** The conclusions apply to Nano Banana, GPT image, SeeDream, Flux, and other image models, independent of any specific product UI.

## Two Completely Different Things

When calling an image model, there are two "resolutions". They are **two independent fields** in the request — don't mix them up:

|                               | Input image resolution / compression                                  | Output image resolution                                                       |
| ----------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| What it refers to             | The size/pixels of the **reference image / image to edit** you upload | The size/pixels of the image the model **generates**                          |
| What determines it            | The compression you apply before uploading                            | The **size parameter** in the request (`size` / `imageSize` / `aspect_ratio`) |
| Where it lives in the request | Image data fields (e.g. `inline_data.data`, `image[]`, `input_image`) | The size parameter field — **completely unrelated** to the image data         |

**In one sentence**: compression affects "the image you feed in"; the resolution parameter controls "the image the model spits out". They each mind their own business.

## Compressing Quality or Compressing Dimensions? What "Compression" Actually Compresses

"Compression" gets used loosely, but an image has two independent kinds of "size", each with its own compression lever:

|                    | Pixel dimensions (resolution)                                       | File size                                                             |
| ------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| What it refers to  | Width × height in pixels, e.g. `4284×5712`                          | Disk/bandwidth footprint, e.g. 4.6 MB                                 |
| What determines it | The resolution at capture/generation time                           | Pixel count × encoding quality × visual complexity                    |
| Compression lever  | **Resizing**: shrink the longest edge proportionally — fewer pixels | **Re-encoding**: lossy JPEG/WebP encoding — same pixels, smaller file |

The two can be wildly out of proportion. A real example (empirical values; varies with encoding):

* A photo from an iPhone 16 Pro measures **4284×5712** (about 24 megapixels — very large) yet the file is only **4.6 MB**, because the system already applied efficient lossy encoding when saving;
* A photo with the same pixel count exported at high quality can approach **30 MB**.

So "does this image need compressing" can't be judged by pixels alone or by file size alone — they affect different stages:

* **Pixel dimensions** set the ceiling on how much information the model can "see", and the decoding/understanding cost;
* **File size** drives transfer costs: the \~33% Base64 inflation, upload time, and the 20 MB single-file cap all target bytes.

<Tip>
  **The practical recommendation is to do both, in order**: first cap pixels (shrink the longest edge to ≤ 2048px proportionally), then cap quality (re-encode at 0.9); and **use file size as the trigger** (only process files above 1.5 MB). That 4.6 MB photo above would get both steps: the 4284px edge shrinks to 2048px, then re-encodes at quality 0.9 — the file typically drops below 1 MB with no effect on how well the model understands it.
</Tip>

## Output Resolution Is Set by the Size Parameter, Not the Prompt

This is the most common misconception, so conclusion first:

<Warning>
  **Writing "4K", "HD", "ultra-clear", or "8K" in the prompt will NOT make the output 4K.** The actual output resolution **depends only on the size parameter in the request**. The prompt controls "what to draw", not "how big the output is".
</Warning>

Different models use different size parameters. The common ones:

| Model family                                        | Parameter controlling output size                   | Value format            | Example                                  |
| --------------------------------------------------- | --------------------------------------------------- | ----------------------- | ---------------------------------------- |
| **Gemini image series** (e.g. `gemini-3-pro-image`) | `imageConfig.imageSize` + `imageConfig.aspectRatio` | **Tier string** + ratio | `imageSize: "4K"`, `aspectRatio: "16:9"` |
| **GPT image series** (gpt-image, etc.)              | `size`                                              | **Pixel string `WxH`**  | `size: "2048x2048"`                      |
| **SeeDream series**                                 | `size`                                              | Pixel string / tier     | `size: "2048x2048"`                      |
| **Flux series**                                     | `aspect_ratio` or `width` + `height`                | Ratio string / pixels   | `aspect_ratio: "16:9"`                   |

### Example: gemini-3-pro-image

It controls output resolution via the **`imageSize`** tier — **`1K` / `2K` / `4K`** (defaults to `1K` if omitted) — with `aspectRatio` controlling the frame ratio:

```json theme={null}
{
  "contents": [ /* prompt text + input images (if any) */ ],
  "generationConfig": {
    "responseModalities": ["IMAGE"],
    "imageConfig": {
      "aspectRatio": "16:9",
      "imageSize": "4K"
    }
  }
}
```

`imageSize` is the field that actually determines output resolution. Each ratio + tier maps to fixed pixel dimensions — e.g. 1:1 at 1K/2K/4K is roughly `1024×1024 / 2048×2048 / 4096×4096`, and 16:9 is roughly `1376×768 / 2752×1536 / 5504×3072`.

### GPT image series uses a size pixel string

```json theme={null}
{
  "model": "gpt-image-...",
  "prompt": "...",
  "size": "2048x2048"
}
```

<Tip>
  **Key point**: if you want 4K, set the size parameter to the matching tier/pixels (e.g. `imageSize:"4K"` or `size:"4096x4096"`) — **do NOT write "4K" in the prompt**. The prompt and the size parameter are two independent fields in the request; the engine does not parse "4K" out of your prompt to adjust resolution.
</Tip>

<Info>
  A few models (certain adaptive-output types) **do not accept a size parameter** — the output resolution is decided by the model itself (typically around 1–1.5K). For these models, 4K cannot be forced via parameters, let alone via the prompt. Check each model's docs/capability statement.
</Info>

<Warning>
  **Supported `imageSize` tiers also vary within the same model family.** For example, in the Gemini image lineup, `gemini-3-pro-image` supports `1K`/`2K`/`4K`, but Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) **only accepts `1K`** — passing `2K`/`4K` returns an error. When switching models, always check that specific model's supported tiers instead of reusing parameters from another model in the same family.
</Warning>

## Does Compressing the Input Image Hurt Output Sharpness? Basically No

Conclusion: **in the vast majority of scenarios, reasonably compressing input reference images has almost no effect on output sharpness.** Three reasons:

1. **The output is re-generated, not an upscale of your image.**
   The model **paints a new image** at the size you specified. Output resolution depends only on `imageSize`/`size`, not on how many pixels the input image had. Whether the input is 3000px or compressed to 2000px, if you choose 4K, you get 4K.

2. **The input compression field and the output size field are independent.**
   Compression only changes the volume/pixels of the "image data" field in the request — it **never touches** the size parameter field. The two are unrelated in the request.

3. **The recommended compression is gentle — well above what the model needs to "see" the image.**
   In practice, compressing the reference image to a **longest edge of \~2048px at JPEG quality \~0.9** is more than enough for the model to understand composition, colors, style, and subject details — these models internally downscale input images to a modest resolution before encoding them anyway.

### To Be Rigorous: the Edge Case

In **image-to-image / fine editing** tasks (strictly preserving tiny textures or small text in a specific region of the input), compressing the input **too aggressively** (e.g. longest edge down to a few hundred pixels, or quality below 0.5) could theoretically lose some detail and indirectly affect how faithfully the edit preserves the original.

But as long as you follow a gentle standard like "longest edge ≤ 2048px, quality ≥ 0.85", this effect is **negligible** in real use. The more precise statement:

> **Reasonable compression** (longest edge 2048px, quality 0.9) → **no perceptible effect** on output sharpness;
> only **extreme over-compression** could cause detail loss in fine-editing scenarios.

## Practical Compression Settings for Input Images

If you compress input images before calling, we recommend these gentle standards — saving bandwidth without losing useful information:

| Item                           | Recommended value                       | Notes                                                                   |
| ------------------------------ | --------------------------------------- | ----------------------------------------------------------------------- |
| Compression trigger threshold  | Original > **1.5 MB**                   | Small images don't need compression — send as-is                        |
| Longest edge cap               | **2048 px**                             | Scale proportionally, keep aspect ratio, **never upscale** small images |
| Compression quality            | **0.9** (0–1)                           | High quality, virtually lossless to the eye                             |
| Output format                  | **Keep original format** (JPG/PNG/WebP) | Don't force-convert; use PNG/WebP for transparency                      |
| Total size for multiple images | Keep under **\~6 MB**                   | With multiple reference images, adaptively split the per-image budget   |
| Single file cap                | **≤ 20 MB**                             | Compress oversized files first to avoid upload timeouts/rejections      |

Adaptive multi-image approach: `per-image target = clamp(total budget ÷ image count, 0.3MB, 1.5MB)`. More images → smaller per-image share, keeping the total under control; images already within target pass through untouched.

<Tip>
  **Fault tolerance**: compression is a nice-to-have — keep a fallback. **If compressing an image fails, fall back to the original and continue**; never abort the whole generation request because the compression step failed.
</Tip>

## Generated Images Feeding a Downstream Workflow: Process Them Too

Images produced by APIs are often larger than you expect. Take Nano Banana Pro's 4K tier as an example (empirical values; varies with each channel's encoding):

| Channel           | Typical size per 4K image |
| ----------------- | ------------------------- |
| AI Studio channel | \~**9 MB**                |
| Vertex channel    | \~**18 MB**               |

Same 4K tier, but different channels encode differently — the file size can differ by 2×.

If a generated image becomes the input of the next step (re-editing, multi-image compositing, reference image), **compress it first using the same standard as input images** (longest edge 2048px, quality 0.9). Otherwise an 18 MB image inflates to roughly 24 MB after \~33% Base64 encoding overhead — easily hitting request-body/single-file limits and slowing uploads. See the [Nano Banana Series Developer Guide](/en/api-capabilities/nano-banana-dev-guide) for Base64 inflation details.

<Tip>
  Downstream use ≠ needing the pristine original. Compress intermediate workflow images to the "model can understand it" standard; if the final deliverable needs 4K, generate 4K **only in the last step** — iterate at 1K/2K in between for speed and cost.
</Tip>

If the generated image is only for display/archiving and never goes back to a model, consider the [Nano Banana OSS Group](/en/api-capabilities/nano-banana-oss-group): images are returned as URLs, avoiding Base64 transfer overhead.

## More Image-Processing Best Practices

Beyond compression, the following are worth handling before upload in API-calling scenarios:

* **Bake EXIF orientation into the pixels**: phone photos often store their rotation in the EXIF Orientation tag rather than in the pixels. Some processing pipelines ignore the tag, so the model sees a sideways/upside-down image. Apply the rotation to the pixels before upload (most compression libraries do this automatically when re-encoding).
* **Strip EXIF privacy metadata before upload**: original photos often carry GPS coordinates, device model, and capture time in EXIF. Strip metadata before sending user photos to a third-party API — re-encoding usually does this as a side effect, but mind the order: **apply orientation first, then strip**.
* **Format compatibility**: the iPhone's default HEIC/HEIF format is unsupported by most image APIs — convert to JPEG/PNG first; use PNG/WebP for transparency; animated GIFs typically only have their first frame read.
* **Convert color space to sRGB**: Apple device photos commonly use Display P3. Pipelines that ignore the color profile will produce color shifts — convert to sRGB before upload.
* **Choose the transfer method per scenario**: on the input side, Base64 is the most reliable; URL (`fileUri`) upload has strict CDN requirements — see the [Nano Banana Series Developer Guide](/en/api-capabilities/nano-banana-dev-guide) for the trade-offs. On the output side, use the [Nano Banana OSS Group](/en/api-capabilities/nano-banana-oss-group) to receive URLs instead of Base64.
* **Pick the output tier you actually need**: don't request 4K unless the deliverable requires it — slower generation, bigger files, higher downstream transfer/processing cost. Iterate at 1K/2K and switch to 4K only for the final render.
* **Persist URL outputs promptly**: image URLs returned by APIs expire. Transfer them to your own storage as soon as you receive them — never treat a temporary URL as a permanent asset.

## Quick Reference

* **Output resolution = the size parameter** (`imageSize` / `size` / `aspect_ratio`), **not text in the prompt**. Want 4K? Set the parameter — don't write it in the prompt.
* `gemini-3-pro-image` uses `imageSize` with tiers **1K / 2K / 4K** (default 1K); GPT image series uses a `size` pixel string.
* **Input compression and output resolution are unrelated** — two independent fields in the request.
* **Pixel dimensions and file size are two different things**: compression = resize first (longest edge 2048px), then re-encode (quality 0.9); use file size as the trigger (only above 1.5MB).
* **Reasonable input compression (longest edge 2048px, quality 0.9) does not affect output sharpness**; only extreme over-compression could lose detail in fine editing.
* Recommended input compression: only compress above 1.5MB, longest edge ≤2048px, quality 0.9, keep original format, multi-image total ≤6MB, single file ≤20MB, fall back to the original on failure.
* **Compress generated images before feeding them into downstream workflows**: a Nano Banana Pro 4K image runs \~9–18 MB per image (varies by channel) — sending it back as-is easily hits limits.
* **Handle EXIF and format before upload**: bake orientation into pixels, strip GPS and other privacy metadata, convert HEIC to JPEG, convert Display P3 to sRGB.

## Related Docs

* [Nano Banana Series Developer Guide](/en/api-capabilities/nano-banana-dev-guide)
* [Usage Fields & Output Explained](/en/api-capabilities/nano-banana-usage-metadata)
* [Gemini Image API Error Handling Guide](/en/api-capabilities/gemini-image-error-handling)
