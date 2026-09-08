> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Multiple Images in One Call

> Nano Banana models can return several independent finished images in a single call — up to 10 in our tests. Covers what triggers it, how to control the count, why the two models bill it completely differently, and how to tell it apart from thinking drafts.

Most people assume Gemini image models return exactly one image per call. **They don't.** When the prompt asks for "N variations", "a storyboard", or "a step-by-step illustrated guide", the model returns **several independent finished images in the same response**, each preceded by its own caption. We measured up to **10 images** in one call.

Findings below come from 92 live calls against the APIYI production gateway on 2026-08-27 (6 prompt shapes × 8 runs for trigger rates, plus count limits, a two-model comparison, resolution stacking, and the OpenAI-compatible path), cross-checked against 1,212 high-output records from 24 hours of production logs.

<Info>
  This is **not** the same thing as [Developer Guide · Occasional multi-image output](/en/api-capabilities/nano-banana-dev-guide#why-do-responses-occasionally-contain-multiple-images). That section describes **thinking drafts** the model produces on its own during complex edits (successive revisions of one design — keep the last one). This page is about **multiple images you explicitly asked for, each a separate deliverable** — where "keep the last one" silently throws away what the user wanted. See [Telling them apart](#telling-them-apart-from-thinking-drafts) below.
</Info>

## At a glance

| Question                      | Answer                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| How many per call?            | **Up to 10 measured.** Ask for 6, get 6; ask for 10, get 10 — `finishReason` is still `STOP` (not truncated)                                    |
| What triggers it?             | Prompt shape, **not chance**. "Step-by-step illustrated guide" triggered 8/8; "N design variations" 5/8                                         |
| Multiple candidates?          | **No.** `candidateCount` is rejected (`Multiple candidates is not enabled for this model`); all images sit in **one candidate's `parts` array** |
| Are the images duplicates?    | No. All 10 had distinct sha256 hashes — 10 different finished images                                                                            |
| How is it billed?             | **`gemini-3.1-flash-image` scales linearly per image; `gemini-3-pro-image` is a flat \$0.09 per call no matter how many**                       |
| Does resolution apply to all? | Yes. `imageSize` applies to every image; tokens are "per-image amount × count"                                                                  |

## What the response looks like

A "give me 3 logo variations" prompt actually returns:

```text theme={null}
candidates = 1,  finishReason = "STOP",  parts length = 6

  parts[0]  text        "Here are three distinct logo design variations…"
  parts[1]  inlineData  image/jpeg  914,915 B  1408×768   sha256 prefix f6ab6076c1e6
  parts[2]  text        "### Variation 2: The Modern Minimalist…"
  parts[3]  inlineData  image/jpeg  632,568 B  1408×768   sha256 prefix e3d5eda56d83
  parts[4]  text        "### Variation 3: The Geometric Abstract…"
  parts[5]  inlineData  image/jpeg  796,069 B  1408×768   sha256 prefix 5fdf9d3fe811
```

And the usage:

```json theme={null}
"usageMetadata": {
  "promptTokenCount": 23,
  "candidatesTokenCount": 4132,
  "candidatesTokensDetails": [
    { "modality": "IMAGE", "tokenCount": 3360 }   // 3360 = 3 images × 1120
  ],
  "totalTokenCount": 4155
}
```

All three sha256 hashes differ, and so do the file sizes (914KB / 632KB / 796KB) — **three different designs, not three iterations of one**.

## What prompts trigger it

Triggering is **probabilistic and driven by prompt shape**. Trigger rates from 8 runs per prompt:

| Prompt shape                       | Example                                                                             | Trigger rate | Typical count   |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ------------ | --------------- |
| **Step-by-step illustrated guide** | "Brew pour-over coffee in 3 steps; after each step's text, include an illustration" | **8/8**      | 3               |
| **Storyboard / sequential panels** | "A 3-panel storyboard: cat wakes up, stretches, eats — one image per panel"         | **7/8**      | 3 (once gave 6) |
| **N design variations**            | "3 logo variations for a coffee shop called Ember, each as a separate image"        | 5/8          | 3               |
| **N art styles**                   | "The same lighthouse in 3 styles: watercolor, flat vector, 1950s pulp"              | 1/8          | 3               |
| **Before / after**                 | "A living room before and after a minimalist renovation, two separate images"       | **0/8**      | 1               |
| **Listing N objects**              | "Generate 4 separate images: red apple, green pear, banana, purple grape"           | **0/8**      | 1               |

<Tip>
  **To get multi-image reliably, phrase it so the images have a narrative relationship** — steps, panels, variations, styles.

  **Merely listing N unrelated objects does not trigger it** (0/8); the model draws them all into one image. This is the counterintuitive part: spelling out "generate 4 separate images" does not work, while "Step 1… Step 2…" does.
</Tip>

## How many can you get

Asking explicitly for 6 and for 10, 6 runs each:

| Requested | Triggered | Actually returned            | Image tokens      | `finishReason` |
| --------- | --------- | ---------------------------- | ----------------- | -------------- |
| 6         | 3/6       | **exactly 6**, all distinct  | 6720 = 6 × 1120   | `STOP`         |
| 10        | 3/6       | **exactly 10**, all distinct | 11200 = 10 × 1120 | `STOP`         |

When it triggers you get the count you asked for; when it doesn't, you fall back to 1. `finishReason` stays `STOP`, so 10 is not a ceiling we hit — just the highest we tried.

## Billing: the two models behave in opposite ways

This is the part that matters most.

### `gemini-3.1-flash-image` (Nano Banana 2) — metered, count multiplies straight through

Each image adds a fixed token amount to `candidatesTokensDetails`, so **output tokens grow strictly linearly with the count**:

| Images | Image tokens (1K) | Measured charge per call |
| ------ | ----------------- | ------------------------ |
| 1      | 1120              | \$0.035                  |
| 3      | 3360              | \$0.090                  |
| 6      | 6720              | \$0.173                  |
| 10     | 11200             | \$0.278                  |

`imageSize` applies to every image, and the per-image amount follows the tier:

| `imageSize`    | Pixels per image | Tokens per image | At 3 images |
| -------------- | ---------------- | ---------------- | ----------- |
| `1K` (default) | 1408×768         | **1120**         | 3360        |
| `2K`           | 2816×1536        | **1680**         | 5040        |
| `4K`           | 5632×3072        | **2520**         | 7560        |

<Note>
  **This table applies to `gemini-3.1-flash-image` (NB2) only. Pro uses a different schedule** — measured twice each on the same prompt:

  | Model                          | 1K   | 2K       | 4K       |
  | ------------------------------ | ---- | -------- | -------- |
  | `gemini-3.1-flash-image` (NB2) | 1120 | **1680** | **2520** |
  | `gemini-3-pro-image` (Pro)     | 1120 | **1120** | **2000** |

  Pixel dimensions are identical for both (1408×768 / 2816×1536 / 5632×3072), but NB2 charges more tokens per image at the 2K and 4K tiers.
  Pro's breakdown lives in [Usage Fields and Output Explained](/en/api-capabilities/nano-banana-usage-metadata);
  since Pro bills a flat rate per call, those token counts never reach a Pro invoice.
</Note>

<Warning>
  **Multi-image plus 4K moves the per-call cost up an order of magnitude.** Three 4K images = 7,560 image tokens, measured at **\$0.18** per call — over 5× a single 1K image (\$0.035).

  If your app passes user input straight through to the model, a casual "give me a few options" can trigger multi-image. **Under metered billing, constrain the count in your prompt layer**, or switch to the per-call Pro pricing below.
</Warning>

### `gemini-3-pro-image` (Nano Banana Pro) — flat per call, extra images are free

Pro bills **\$0.09 per call regardless of tokens**. Same "3 logo variations" prompt, 8 runs:

|                              | Images returned   | Image tokens | Measured charge |
| ---------------------------- | ----------------- | ------------ | --------------- |
| `gemini-3-pro-image`         | **3 in 8/8 runs** | 3360         | **\$0.0900**    |
| Reference: Pro, single image | 1                 | 1120         | \$0.0900        |

**Three images cost the same as one.** Pro also prices 1K–4K identically, so "three 4K variations in one call" and "one 1K image" both cost \$0.09.

<Tip>
  **For anything that needs options to choose from (logos, posters, editorial images), Pro's per-call pricing is clearly cheaper.**

  Three 4K images: Pro **\$0.09** vs NB2 metered ≈ **\$0.18**. It flips for single 1K images, where NB2 (\$0.035) beats Pro (\$0.09). **The break-even between per-call and metered comes down to how many images, at what size.**
</Tip>

## Telling them apart from thinking drafts

The two look nearly identical — same candidate, both carry `thoughtSignature`, neither is marked `thought: true`. **The tell is whether text appears between the images**:

|                             | Interleaved generation (this page)                                  | Thinking drafts ([Developer Guide](/en/api-capabilities/nano-banana-dev-guide#why-do-responses-occasionally-contain-multiple-images)) |
| --------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `parts` layout              | `text image text image text image` (each image has its own caption) | `image image image` (images back to back, no text between)                                                                            |
| Relationship between images | Independent deliverables, entirely different compositions           | Successive revisions of one design; same composition, small differences                                                               |
| Count                       | Matches what the prompt asked for (ask 6, get 6)                    | Model's own choice, 2–10                                                                                                              |
| Typical trigger             | Step guides / storyboards / N variations                            | Complex task-style edits with many constraints                                                                                        |
| **What to keep**            | **All of them**                                                     | **The last one**                                                                                                                      |

Measured contrast: a complex edit prompt (remove background + studio gradient + headline + price badge + relight) returned **1 image in 6/6 runs**, layout `image`; the step-guide prompt returned 3 images in 8/8 runs, layout `text image text image text image`.

<Warning>
  **The existing "just keep the last one" advice applies only to the thinking-draft case.** Applied to interleaved generation, it discards 2 of the user's 3 logos.

  The safe rule is **check the layout first**: text between images → keep all; images back to back → keep the last.
</Warning>

## Parsing code

```python theme={null}
parts = (response.get("candidates") or [{}])[0].get("content", {}).get("parts") or []

images, has_text_between = [], False
prev_was_image = False
for p in parts:
    if "inlineData" in p:
        images.append(p["inlineData"])          # keep data and mimeType; derive the extension from mimeType
        prev_was_image = True
    elif p.get("text", "").strip():
        if prev_was_image:
            has_text_between = True             # text after an image = interleaved generation
        prev_was_image = False

if not images:
    raise RuntimeError("No image returned — check whether safety filtering kicked in")

# Interleaved -> every image is a deliverable, keep all; otherwise drafts -> keep the last
results = images if (len(images) > 1 and has_text_between) else images[-1:]
```

```javascript theme={null}
const parts = resp?.candidates?.[0]?.content?.parts ?? [];
const images = parts.filter((p) => p.inlineData?.data);
const hasTextBetween = parts.some(
  (p, i) => p.text?.trim() && i > 0 && parts[i - 1].inlineData,
);
const results =
  images.length > 1 && hasTextBetween ? images : images.slice(-1);
```

<Warning>
  **Never hard-code `parts[0]` or `parts[1]`**, and never hard-code `mimeType` — both `image/png` and `image/jpeg` occur in practice, so always derive the file extension from the `mimeType` in the response. See [Usage Fields and Output Explained](/en/api-capabilities/nano-banana-usage-metadata).
</Warning>

## `responseModalities` strips the captions

If you want the images without the prose, pass `responseModalities: ["IMAGE"]` in `generationConfig`. Same variations prompt, 12 runs each:

| Setting           | Multi-image | Response contains text parts | Output tokens (3-image subset) |
| ----------------- | ----------- | ---------------------------- | ------------------------------ |
| Default (omitted) | 5/12        | **12/12**                    | 4067                           |
| `["IMAGE"]`       | 10/12       | **0/12**                     | 3809                           |

* **Text parts are suppressed entirely (0/12), yet all three images still come back.**
* Output drops by **258 tokens (−6.3%)** — real prose removed, not noise.
* Note: **this defeats the "text between images" test above**, since there is no text left. If you rely on layout to detect drafts, don't set this parameter.

<Note>
  For ordinary **single-image** prompts, `["IMAGE"]` saves only about 2.8% (not statistically significant) — single-image responses rarely carry text anyway. **This parameter only pays off in the multi-image interleaved case.**
</Note>

## The OpenAI-compatible path returns all images too

On `/v1/images/generations`, multiple images come back as multiple elements of the `data` array — 5 of 6 runs returned 3 distinct elements:

```json theme={null}
{
  "data": [
    { "b64_json": "…" },   // variation 1
    { "b64_json": "…" },   // variation 2
    { "b64_json": "…" }    // variation 3
  ],
  "usage": { "completion_tokens_details": { "image_tokens": 3360 } }
}
```

<Warning>
  **The OpenAI path drops the captions**, so the "text between images" test is unavailable there and you cannot distinguish interleaved output from thinking drafts. **Use the native `generateContent` path when you need to tell them apart.**

  Also, don't read only `data[0]` — that silently discards the rest while you are billed for every image.
</Warning>

## Quick recap

* Nano Banana models **can return multiple independent finished images per call** — up to 10 measured, all inside one candidate's `parts`
* **Prompt shape drives it**: step guide (8/8) > storyboard (7/8) > N variations (5/8); merely listing N objects never triggers it (0/8)
* You get the count you asked for, with `finishReason` still `STOP`
* **The two models bill it in opposite ways**: NB2 is metered and multiplies per image (10 images = \$0.278); Pro is flat per call, so **extra images are free (3 images still \$0.09)**
* Per-image tokens on NB2: 1K = 1120, 2K = 1680, 4K = 2520; `imageSize` applies to every image (**Pro uses a different schedule** — see the table above)
* **Don't blindly "keep the last one"**: text between images = interleaved, keep them all; images back to back = drafts, keep the last
* For images without prose use `responseModalities: ["IMAGE"]` — about 6% cheaper, but it disables the layout test above

## Related documentation

<CardGroup cols={2}>
  <Card title="Nano Banana Developer Guide" icon="book-open" href="/en/api-capabilities/nano-banana-dev-guide">
    Request construction, robust parsing, and the thinking-draft flavour of multi-image output
  </Card>

  <Card title="Usage Fields and Output Explained" icon="receipt-text" href="/en/api-capabilities/nano-banana-usage-metadata">
    Response structure, usage field meanings, and reconciliation
  </Card>

  <Card title="Nano Banana Series Pricing" icon="tags" href="/en/api-capabilities/nano-banana-pricing">
    Per-call and metered pricing for all four models
  </Card>

  <Card title="Image Compression and Output Resolution" icon="crop" href="/en/api-capabilities/image-compression-resolution">
    Values and effects of imageSize and aspectRatio
  </Card>
</CardGroup>
