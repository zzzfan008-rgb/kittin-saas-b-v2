> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How do I generate images with a transparent background (PNG cutouts)?

> Pass background: transparent to gpt-image-2 and you get a real alpha-channel PNG back, no post-processing needed. png and webp both work; jpeg has no alpha channel so it is mutually exclusive with transparency. This page covers every image model, minimal examples, and common errors.

## Short answer

**Use `gpt-image-2` and add two fields to the request:**

```json theme={null}
{
  "model": "gpt-image-2",
  "prompt": "a cute cartoon fox sticker, clean cutout edges, no shadow",
  "background": "transparent",
  "output_format": "png"
}
```

The image comes back as a PNG with a real alpha channel — no cutout post-processing required. Both text-to-image and image editing support it.

<Info>
  `background: "transparent"` is a capability OpenAI opened up for GPT-Image-2 on 2026-08-21 (marked preview by OpenAI). APIYI has verified it end to end: both text-to-image and image editing return true alpha transparency.
</Info>

## Which models can produce transparent backgrounds

| Model                                                            | How                                                                                                                        | Reliability                                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2` | **Parameter** — `background: "transparent"` with `output_format` set to `png` or `webp` (same parameters across all three) | ✅ Reliable, recommended (as long as the prompt does not describe a scene — see below) |
| `gpt-image-1.5` / `gpt-image-1`                                  | Same parameter                                                                                                             | ✅ Reliable (older models; new projects should just use `gpt-image-2.5-flare`)         |
| `gpt-image-2-all` / `gpt-image-2-vip`                            | **No `background` parameter** — you can only ask for it in the prompt                                                      | ⚠️ Occasionally unreliable; the same prompt may still come back on white              |
| `seedream-5-0` / `seedream-5-0-pro`                              | `output_format: "png"` plus `transparent background, alpha channel` in the prompt                                          | ⚠️ Prompt-driven, alpha is not guaranteed on every call                               |
| Gemini image models (Nano Banana family)                         | Prompt only                                                                                                                | ⚠️ Same as above                                                                      |
| `seedream-4-5` / `seedream-4-0`                                  | `jpeg` output only, no alpha channel                                                                                       | ❌ Not supported                                                                       |

<Tip>
  **If you need transparency reliably, use `gpt-image-2`.** A parameter and a prompt request are not the same thing: the first is guaranteed by the API, the second is the model doing its best. At batch scale the difference shows.
</Tip>

## Two ways to call it

### Text-to-image `/v1/images/generations`

```bash theme={null}
curl https://api.apiyi.com/v1/images/generations \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "a cute cartoon fox sticker, flat vector illustration, single centered subject, clean cutout edges, no background, no shadow",
    "background": "transparent",
    "output_format": "png",
    "quality": "low"
  }'
```

### Image editing `/v1/images/edits`

Hand it an ordinary photo and ask it to drop the background:

```bash theme={null}
curl https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -F model=gpt-image-2 \
  -F image=@fox.jpg \
  -F 'prompt=remove the background completely and keep only the fox, clean cutout edges, no shadow' \
  -F background=transparent \
  -F output_format=png
```

Mask-based inpainting (`mask`) and a transparent background work together — they do not conflict.

## Why `jpeg` does not work

JPEG has **no alpha channel** — there is nowhere to store transparency. Combining `output_format: "jpeg"` with `background: "transparent"` returns a 400:

```json theme={null}
{
  "error": {
    "message": "Transparent background is not supported for JPEG output format",
    "param": "background",
    "code": "invalid_value"
  }
}
```

For transparency pick `png` (lossless, larger) or `webp` (lossy and tunable, smaller, also supports alpha). `webp` additionally accepts `output_compression` to trim file size.

## Editing is a re-draw, not a precise cutout

Set expectations here up front: when `/v1/images/edits` runs with `background: transparent`, the model **understands the scene and paints the subject again** rather than tracing the original outline the way Photoshop would. That means:

* The subject's **pose, style, and fine detail will shift** — this is not pixel-level preservation
* To stay closer to the original, use `quality: "high"` and state "keep the original composition, do not change the subject's appearance" in the prompt
* If your workflow needs pixel-exact extraction, do the cutout yourself with `rembg`, `PIL`, or `sharp`. Model generation is a better fit for "produce reusable assets" than for exact matting

## Do not describe a scene in the prompt — the parameter cannot override it

`background: "transparent"` only guarantees an alpha channel and nudges the model toward a cutout. **If the prompt or the reference image describes a full scene, the model paints that scene** and the parameter will not stop it. This is the most common reason transparent output "sometimes works, sometimes doesn't", and it has nothing to do with the quality tier.

Measured on 2026-09-11 with `gpt-image-2.5-sunburst`, 30 calls (half medium, half high, text-to-image plus reference-image edits):

| Prompt style                                                                                                                                     | Real transparency                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Subject only (apple, earbuds, a swordsman), with isolated / no background                                                                        | 16 / 16, medium and high equally stable                        |
| Scene described: "a swordsman in an autumn forest with red maple leaves"                                                                         | 0 / 3, **the whole forest was painted**, medium and high alike |
| Same scene rewritten: a few maple leaves drifting around the swordsman + `isolated character on a transparent background, no scenery, no ground` | 2 / 2                                                          |
| Reference image has a full background, prompt only describes a scene and never asks for a cutout                                                 | 1 / 2, a coin flip                                             |
| Reference image has a full background, prompt says `remove the scenery entirely, keep only the subject`                                          | 8 / 8                                                          |

Three writing rules:

* ❌ Avoid **environment words** — ground, sky, room, forest. If you want atmosphere, attach it to the subject ("a few falling maple leaves", not "a maple forest")
* ✅ End every prompt with `isolated subject on a transparent background, no scenery, no ground, no shadow`
* ✅ When the reference image has a background, state `remove the background entirely, keep only the character` in the edit prompt

Raising `quality` from `medium` to `high` **does not** make transparency more reliable; it only costs 4× the tokens (439 → 1,756).

## Billing

**Transparency costs nothing extra.** At the same quality tier and size, `background: "transparent"` and `background: "opaque"` consume exactly the same number of image tokens, billed under the normal per-token rules for `gpt-image-2`.

## Common errors

<AccordionGroup>
  <Accordion title="400: Transparent background is not supported for JPEG output format">
    `output_format` was set to `jpeg`. Switch it to `png` or `webp`.
  </Accordion>

  <Accordion title="The image really is on white, not transparent">
    Check three things. First, that the `background` field actually reached the API — the edits endpoint is `multipart/form-data`, so it must be `-F background=transparent` rather than a JSON body field. Second, whether the top-level `background` in the response echoes `transparent`. Third, whether you are on `gpt-image-2` — `gpt-image-2-all` and `gpt-image-2-vip` have no such parameter and silently ignore it.

    If all three check out and you still get white or a full background, the prompt (or the reference image) almost certainly **describes a scene** — the model painted the environment it was asked for, and the parameter cannot override that. See "Do not describe a scene in the prompt" above.
  </Accordion>

  <Accordion title="How do I confirm the image really has an alpha channel">
    One Python snippet is enough:

    ```python theme={null}
    from PIL import Image
    im = Image.open("out.png")
    print(im.mode)                      # RGBA means it has alpha
    a = im.convert("RGBA").getchannel("A")
    print(a.histogram()[0] / (im.width * im.height))   # share of fully transparent pixels
    ```

    Mode `RGB` means there is no alpha channel at all. Mode `RGBA` with every alpha value at 255 means the channel exists but nothing was cut out.
  </Accordion>

  <Accordion title="My prompt already says transparent background — why pass the parameter too">
    A prompt only asks the model to paint it that way, and the model may paint a grey-and-white checkerboard that merely looks transparent — those are still opaque pixels. Only the `background: "transparent"` parameter guarantees a real alpha channel. The reverse also holds: the parameter guarantees the channel but cannot override a scene described in the prompt — the two have to work together.
  </Accordion>
</AccordionGroup>

## Related docs

<CardGroup cols={2}>
  <Card title="GPT-Image-2 overview" icon="image" href="/en/api-capabilities/gpt-image-2/overview">
    Full parameters, sizes, quality tiers, and error codes
  </Card>

  <Card title="Text-to-image API reference" icon="wand-sparkles" href="/en/api-capabilities/gpt-image-2/text-to-image">
    Every field on `/v1/images/generations`
  </Card>

  <Card title="Image editing API reference" icon="scissors" href="/en/api-capabilities/gpt-image-2/image-edit">
    `/v1/images/edits` and multi-image fusion
  </Card>

  <Card title="Mask inpainting" icon="square-dashed" href="/en/api-capabilities/gpt-image-2/mask-editing">
    Use an alpha mask to mark the region to change
  </Card>

  <Card title="Official vs reverse routes" icon="git-compare" href="/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    Choosing between `gpt-image-2.5-flare` / `sunburst` / `gpt-image-2` / `-all` / `-vip`
  </Card>

  <Card title="Artifacts on white backgrounds" icon="triangle-alert" href="/en/faq/white-background-image-artifacts">
    A different problem with pure-white backgrounds
  </Card>
</CardGroup>
