> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How to fix distorted prints when changing outfits with Nano Banana Pro?

> Prompt optimization, reference image weighting, multi-roll retries, and channel fallbacks for garment try-on scenarios — with bad-vs-good prompt comparisons and a step-by-step troubleshooting guide

## Short answer

Distorted prints with Nano Banana Pro are not a model failure — they come from two stacked causes: **inherent randomness in single-shot generation** plus **overly assertive prompts**. Use this order:

1. First reproduce with the **same prompt + reference images** on [imagen.apiyi.com](https://imagen.apiyi.com) to rule out client-side issues
2. Rewrite the prompt: drop absolute phrases like "strictly lock" or "pixel-perfect restore"; use concrete color / position / preserve-item descriptions instead
3. Upload clear, well-defined reference images using **Base64 encoding** (Nano Banana series does NOT support OpenAI-style URL uploads)
4. Enable multi-roll retries: have your business code auto-retry the same prompt 1\~3 times
5. If still no luck, switch channel or model: banana pro defaults to AI Studio — switch to the [Vertex group](/en/faq/google-upstream-aistudio-vertex), or try the [gpt-image-2 series](/en/api-capabilities/gpt-image-2-all/image-edit) (whose edit style stays closer to the source)

## Why prints get distorted

AI image generation is **single-shot atomic sampling** — every call is an independent draw, with no "strict restore" toggle. The two most common culprits:

* **Overly assertive prompt phrasing**: phrases like "strictly lock in place", "pixel-perfect restore", or "1:1 reproduce" can make the model interpret the request as "redraw it", and the print gets redrawn along with everything else
* **Wrong reference-image upload format**: Nano Banana series **only supports Base64-encoded uploads**. Pasting a URL directly into the OpenAI-compatible `image_url` field makes the model "not see" the reference, so the print is free to drift

<Info>
  Even with a perfect description, the model will still "wander" in roughly **5%\~15%** of single-shot samples. This is not a defect — it is **inherent to generative models**: the same prompt naturally yields different results across calls.
</Info>

## Step-by-step troubleshooting

<Steps>
  <Step title="Reproduce in the test tool to rule out client issues">
    Open [imagen.apiyi.com/#generate](https://imagen.apiyi.com/#generate) and run the **exact same prompt + reference images** again:

    * Print is also distorted in the tool → most likely a **prompt** issue, go to Step 2
    * Print is preserved in the tool → debug your integration (image actually uploaded? parameters correct?), see [Generated image differs too much from reference](/en/faq/image-result-differs-from-reference)
  </Step>

  <Step title="Rewrite the prompt, drop absolute phrasing">
    Replace command-style language like "strictly restore" or "pixel-perfect" with **concrete attribute descriptions** (see "Prompt optimization examples" below).
  </Step>

  <Step title="Make sure reference images are uploaded correctly">
    * Nano Banana series **does NOT support OpenAI-format URL uploads** — you must use **Base64**
    * Reference images should be **clear and feature-rich**: blurry or cluttered references force the model to "guess", making prints more likely to drift
    * Single image ≤ **7MB** (Gemini's official limit) — lossless compression recommended before upload
    * Each prompt accepts up to **14 reference images**; if you only need to preserve one print, upload just that close-up and raise its weight
  </Step>

  <Step title="Enable multi-roll retries (auto retry)">
    In your business code, implement **1\~3 automatic retries** for the same prompt. One failed attempt doesn't mean the model is broken — more rolls significantly raise the hit rate.
  </Step>

  <Step title="Switch channel or model as fallback">
    * Switch to the **Vertex group** (just pick the Vertex group when editing the token in the console — no code change) — Vertex's moderation differs from AI Studio's, and some outfit-swap requests that get falsely flagged on AI Studio pass cleanly on Vertex
    * Or try the **gpt-image-2 series** — its edit style stays closer to the source image, with less color drift and style shift, ideal when "stay close to the original" is the priority
  </Step>
</Steps>

## Prompt optimization examples

Below is a bad-vs-good comparison table for the outfit swap + print preservation scenario:

| Writing style           | ❌ Bad example                     | ✅ Improved version                                                                                   |
| ----------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Be specific about color | "Change to black"                 | "Change to **matte pure black**, preserve the original material texture"                             |
| Describe print location | "Print must stay strictly locked" | "The print on the chest — **position, color, proportions, layout** — must all stay exactly the same" |
| List what to preserve   | "Everything else unchanged"       | "All other objects' **color, position, and text labels** must remain unchanged"                      |
| Split actions           | Cram 5 edits into one sentence    | Split into multiple edits — **change one thing at a time**                                           |

**Improved full prompt example**:

> Edit this image. Complete two things: ① Change the two teapots inside the red box to matte pure black, preserving the original material texture and shape; ② Delete the red box outline itself. The color, position, dimension labels, and text of all other objects in the image must **remain completely unchanged**.

<Tip>
  **General principle: change one category per call.** If your outfit swap needs "change color + change background + add text", split it into multiple edits — each call's success rate will be noticeably higher than one mega-instruction.
</Tip>

## About overall red / warm color tint

If you notice the whole image skews red or warm after the swap, that's a **different** problem — its usual cause is [banana pro edit results in overall red tint](/en/faq/banana-pro-edit-red-cast). The causes and fixes are different from print distortion (switch to Vertex channel or fall back to gpt-image-2).

## Related docs

* [Nano Banana series dev guide](/en/api-capabilities/nano-banana-dev-guide) — model lineup, pricing, Base64 upload requirements
* [Generated image differs too much from reference](/en/faq/image-result-differs-from-reference) — debugging wrong reference formats
* [Do Google models run on AI Studio or Vertex?](/en/faq/google-upstream-aistudio-vertex) — how to switch to the Vertex group
* [How to generate images you're happy with](/en/api-capabilities/image-generation-success-tips) — four strategies: prompt rewrite, retry, switch model, test-tool triage
* [Gemini image API error handling guide](/en/api-capabilities/gemini-image-error-handling) — debugging failed / blocked generations
* [Common reasons Nano Banana series image generation fails](/en/faq/nano-banana-image-failure) — content safety block scenarios
* [banana pro edit results in overall red tint](/en/faq/banana-pro-edit-red-cast) — overall color cast issue

## Contact support

If the steps above still don't resolve it, contact support in the workspace or email [hi@apiyi.com](mailto:hi@apiyi.com) with:

* Reproduction result of the same prompt in [imagen.apiyi.com](https://imagen.apiyi.com) (screenshot or link)
* The model name you're using (e.g. `gemini-3-pro-image-preview` / Nano Banana 2)
* API call timestamp + request ID (if available)
