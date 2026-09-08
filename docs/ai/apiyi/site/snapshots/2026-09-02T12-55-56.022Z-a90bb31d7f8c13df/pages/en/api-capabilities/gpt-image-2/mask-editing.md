> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Mask Inpainting Guide

> Complete guide to gpt-image-2 mask-based inpainting — alpha channel fundamentals, mask creation and validation, Python/cURL/Node.js examples, and error troubleshooting

<Info>
  This page is a hands-on guide to localized editing (inpainting) with `gpt-image-2` via `POST /v1/images/edits`, by uploading an **image + mask + prompt**. For full parameter reference and the interactive Playground, see [Image Edit API Reference](/en/api-capabilities/gpt-image-2/image-edit).
</Info>

## Core Principle: the Alpha Channel Defines the Edit Region

A localized edit request consists of three parts:

```text theme={null}
original image
+ mask image
+ edit prompt
= fully edited image
```

The mask marks editable regions through the PNG **alpha (transparency) channel**:

| Mask region       | Alpha value | Effect                                               |
| ----------------- | ----------: | ---------------------------------------------------- |
| Fully transparent |           0 | Model may edit                                       |
| Fully opaque      |         255 | Preserve original as much as possible                |
| Semi-transparent  |       1–254 | Transition zone; do not rely on it as a precise rule |

<Warning>
  **The most common mistake**: what determines the edit region is the **alpha channel**, not the black or white pixels you see.

  ```text theme={null}
  Transparent region = the area to modify
  Opaque region      = the area to keep unchanged
  ```

  A PNG that "looks black and white" but has no alpha channel will fail with `invalid_image_file`.
</Warning>

### A Visual Example

Suppose the original image is 1024×1024:

```text theme={null}
┌──────────────────────────┐
│      Opaque region        │
│   keep original intact    │
│                          │
│      ┌──────────┐        │
│      │transparent│       │
│      │→ flowers  │       │
│      └──────────┘        │
└──────────────────────────┘
```

With a prompt like:

```text theme={null}
Replace the cup in the transparent region with a bouquet of white tulips.
Keep everything else unchanged, preserving the original lighting,
camera angle, and photographic style.
```

## The Mask Is Not a Hard Crop

GPT Image masks are **not** absolute pixel-level constraints like Photoshop selections. Officially, mask editing remains **prompt-guided editing**: the model uses the mask as a reference but does not guarantee strict adherence to every pixel boundary.

You may therefore see:

* Slight shadow changes outside the mask
* Object edges extending beyond the mask
* Coordinated lighting and reflection changes
* Minor background repainting
* Transition effects near mask boundaries

This is good for natural blending, but not suitable when pixel-perfect preservation is required (see "Strictly Preserving Content Outside the Mask" below).

### Improving Edit Stability

Don't just write "change it to a red shirt". Write instead:

```text theme={null}
Only modify the transparent region of the mask. Replace the person's top
with a plain red crew-neck cotton T-shirt. Keep the face, hair, body pose,
arms, background, composition, camera angle, lighting direction, and image
dimensions unchanged. The new shirt must fit the body naturally and
preserve the original photographic realism.
```

Practical tips:

1. Make the mask slightly larger than the target object's edges
2. Don't just cover the object's center — include edges, shadows, and reflections
3. Explicitly state what must remain unchanged
4. If the edit region is too small, enlarge the mask
5. When absolute preservation is required, do a final pixel composite yourself (see below)

## To Mask or Not to Mask? Trade-offs vs Prompt-Only Editing

A common question: **modern AI can already "edit exactly what you point at" with plain language — why bother making a mask?**

It's true that `gpt-image-2` without a mask, given just "replace the cup on the left side of the table with flowers", usually edits the right spot — instruction following is strong, and for casual edits a prompt alone is enough. But a mask solves the cases where **language is ambiguous, or unambiguous but still not reliable enough**:

| Scenario                                                                         | Prompt only                              | Prompt + Mask                                |
| -------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------- |
| Only one target object in the frame                                              | ✅ Sufficient; a mask is overkill         | Unnecessary                                  |
| Multiple similar objects, edit just one (change only the middle person's outfit) | ⚠️ Easily hits the wrong twin            | ✅ Spatially pinned, zero ambiguity           |
| Strict boundaries (product shots / UI screenshots / ID layouts)                  | ❌ Whole-image regeneration; areas drift  | ✅ With pixel compositing, strictly unchanged |
| Batch pipelines (repeatedly replacing the same region in a fixed layout)         | ⚠️ Unstable across runs                  | ✅ Masks are programmable and reproducible    |
| Precise shape / position control (move an object to exact coordinates)           | ❌ Language can't express pixel positions | ✅ The mask *is* pixel coordinates            |

Research points the same way: mask-free (purely text-driven) editing struggles with precise spatial control — prompt-to-prompt style methods, for instance, cannot **spatially move** an object across the frame, and when the implicit edit region is off, you get "the part that should change didn't, and the part that shouldn't did." Mask-based editing trades a little convenience for explicit spatial precision.

<Tip>
  **In one sentence**: masks aren't obsolete tech — they've shifted from "required" to "a precision-control tool". Casual chat-style edits → prompt alone; production workloads that must be reproducible, controllable, and boundary-strict → use a mask. Also remember: prompt-only editing with `gpt-image-2` is essentially **whole-image regeneration**, so unspecified regions may change too — which is exactly why mask + pixel compositing exists.
</Tip>

## File Requirements at a Glance

| Item                   | Requirement                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| Image format           | PNG / JPG / WebP, each under 50MB                                   |
| Number of input images | Up to 16 (repeat the `image[]` field)                               |
| Mask format            | **PNG with an alpha channel (required)**                            |
| Mask dimensions        | Must **exactly match** the **first** image (even 1 pixel off fails) |
| Mask file size         | Under **4MB**                                                       |
| Mask scope             | Applies only to `image[0]` (the first image)                        |

Role assignment when editing with multiple images:

```text theme={null}
image[0]  = the main editing canvas
image[1…] = reference images
mask      = applies only to image[0]
```

<Tip>
  "Exactly matching dimensions" sounds tedious, but you never align sizes by hand — masks are **derived from the original image** (by erasing / brushing / segmenting on a copy of it), so matching dimensions come for free. See [Where Do Masks Come From](#where-do-masks-come-from-five-common-methods) below.
</Tip>

## Python Example

```python theme={null}
import base64
from pathlib import Path
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("input.png", "rb") as image_file, \
     open("mask.png", "rb") as mask_file:

    result = client.images.edit(
        model="gpt-image-2",
        image=image_file,
        mask=mask_file,
        prompt=(
            "Only modify the transparent region of the mask. "
            "Replace the white cup on the table with a bouquet of white tulips. "
            "Keep the table, background, camera angle, composition, and lighting unchanged. "
            "The bouquet should sit naturally where the cup was, casting shadows "
            "consistent with the original lighting."
        ),
        size="1536x1024",
        quality="high",
        output_format="png",
        n=1,
    )

image_bytes = base64.b64decode(result.data[0].b64_json)
Path("edited.png").write_bytes(image_bytes)
print("Saved: edited.png")
```

<Warning>
  **Do not pass `input_fidelity="high"`** — `gpt-image-2` always processes input images at high fidelity by default. The API does not allow adjusting this parameter; passing it returns a 400 error. Simply omit it.
</Warning>

## cURL Example

The image edit endpoint requires `multipart/form-data` — you cannot submit the image and mask as plain JSON fields:

```bash theme={null}
curl -s \
  -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "image[]=@input.png;type=image/png" \
  -F "mask=@mask.png;type=image/png" \
  -F "prompt=Only modify the transparent region of the mask. Replace the cup on the table with a bouquet of white tulips. Keep everything else unchanged, preserving the original composition, lighting, and photographic realism." \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "output_format=png" \
  | jq -r '.data[0].b64_json' \
  | base64 --decode > edited.png
```

Even with a single image, use the `image[]` field name as in the official examples.

<Warning>
  When using `-F`, **do not manually set** `-H "Content-Type: multipart/form-data"`. curl needs to generate the `boundary` automatically; setting the header manually drops the boundary and the server cannot parse the files.
</Warning>

## Node.js Example

```javascript theme={null}
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({
  apiKey: "sk-your-api-key",
  baseURL: "https://api.apiyi.com/v1",
});

const image = await toFile(
  fs.createReadStream("input.png"),
  "input.png",
  { type: "image/png" }
);

const mask = await toFile(
  fs.createReadStream("mask.png"),
  "mask.png",
  { type: "image/png" }
);

const result = await client.images.edit({
  model: "gpt-image-2",
  image,
  mask,
  prompt:
    "Only modify the transparent region of the mask. Replace the white cup " +
    "on the table with a bouquet of white tulips. Keep the background, " +
    "composition, camera angle, and lighting unchanged.",
  size: "1536x1024",
  quality: "high",
  output_format: "png",
});

const imageBuffer = Buffer.from(result.data[0].b64_json, "base64");
fs.writeFileSync("edited.png", imageBuffer);
console.log("Saved: edited.png");
```

## Where Do Masks Come From? Five Common Methods

People often find masks intimidating — "it has to match the original image pixel for pixel". The key realization: **you almost never draw a mask from scratch; you derive it from the original image**. Whether via code, a photo editor, or a web canvas, the flow is always "open the original → mark regions on it → export", so matching dimensions are **automatic**.

| Method                                    | Best for                                       | Effort                                         |
| ----------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| ① Code generation (draw regions with PIL) | Fixed-layout batch jobs, known coordinates     | Low (a few lines)                              |
| ② Manual erasing in a photo editor        | One-off precision edits, complex shapes        | Low (basic selection skills)                   |
| ③ Web brush canvas                        | Building "brush to edit" into your own product | Medium (front-end Canvas)                      |
| ④ AI auto-segmentation (SAM family)       | One click / one phrase → precise mask          | Medium (deploy or call a segmentation service) |
| ⑤ Convert a black-and-white mask to alpha | Consuming B\&W masks from other tools          | Low (a few lines)                              |

### Method 1: Generate a Transparent Mask Programmatically

Set a rectangular region to transparent (editable):

```python theme={null}
from PIL import Image, ImageDraw

original = Image.open("input.png").convert("RGBA")

# Fully opaque by default: preserve everything
mask = Image.new("RGBA", original.size, (255, 255, 255, 255))

draw = ImageDraw.Draw(mask)

# Make the target region fully transparent: editable
# Coordinates: (left, top, right, bottom)
draw.rectangle((300, 250, 750, 800), fill=(0, 0, 0, 0))

mask.save("mask.png")
print("Mask size:", mask.size)
```

* `(255, 255, 255, 255)` = opaque, preserved region
* `(0, 0, 0, 0)` = transparent, editable region

### Method 2: Manual Erasing in a Photo Editor

Any editor that supports transparent PNGs (Photoshop, GIMP, Krita, Photopea, etc.) can produce a mask — it boils down to one action: **erase the region you want edited into transparency**. In Photoshop:

1. Open a **copy of the original image** (working on the original itself guarantees matching dimensions)
2. If the layer is a locked "Background", double-click to convert it to a normal layer (background layers don't support transparency)
3. Select the region to modify with the Lasso / Quick Selection / Object Selection tool
4. Press Delete — the selection becomes the transparent checkerboard
5. "Export As PNG" (with transparency enabled) — the result is a valid alpha mask

Same idea in GIMP: `Layer → Transparency → Add Alpha Channel`, select, Delete, export as PNG.

<Tip>
  Shapes are in no way limited to rectangles — trace an object with the lasso or one-click a subject with smart selection, and the erased transparent region takes any irregular shape. Expand the selection **a few pixels beyond the object's outline** (Photoshop: `Select → Modify → Expand`) so shadows and edges are covered too.
</Tip>

### Method 3: Web Brush Canvas

The "brush over what you want changed" interaction in AI photo apps is just an alpha mask generated live in the browser, built around a single Canvas API property. See [How Brush-Style Editing Works](#mask-shapes-and-how-brush-style-editing-works) below.

### Method 4: One-Click Masks via AI Segmentation

If even brushing feels like work, let a segmentation model do it. Meta's open-source **SAM (Segment Anything Model)** family is the mainstream option:

* **Click to mask**: click an object once and the model returns its pixel-accurate outline (down to hair-strand edges)
* **Text to mask**: **SAM 3**, open-sourced in November 2025, accepts concept-level text prompts like "all yellow taxis" or "players wearing red jerseys" and returns masks for every matching instance (model and code at `github.com/facebookresearch`, overview at `ai.meta.com`)
* **Subject / background split**: open-source tools like `rembg` separate subject from background in one command — the background region can directly serve as a "change only the background" mask

Segmentation output is usually a black-and-white bitmap; convert it with "Method 5" below. The Stable Diffusion community's **Inpaint Anything** extension and ComfyUI's Mask Editor are mature implementations of exactly this pipeline — "SAM segmentation + brush touch-up → mask → inpaint" — and worth borrowing from.

### Method 5: Convert a Black-and-White Mask to an Alpha Mask

If you already have a mask where "black = edit, white = keep":

```python theme={null}
from PIL import Image

bw_mask = Image.open("mask_bw.png").convert("L")

rgba_mask = Image.new("RGBA", bw_mask.size, (255, 255, 255, 255))

# Black (0)   → alpha 0   → transparent → edit
# White (255) → alpha 255 → opaque      → keep
rgba_mask.putalpha(bw_mask)

rgba_mask.save("mask.png")
```

### Validate the Mask Before Uploading

Many `invalid_image_file` errors happen because a file has a `.png` extension but only RGB channels and no alpha. Run this before uploading:

```python theme={null}
from PIL import Image

image = Image.open("input.png")
mask = Image.open("mask.png")

print("Mask format:", mask.format)
print("Mask mode:", mask.mode)
print("Mask size:", mask.size)

assert mask.format == "PNG", "Mask must be a PNG"
assert mask.mode in ("RGBA", "LA"), "Mask must contain an alpha channel"
assert image.size == mask.size, "Image and mask dimensions must match exactly"

alpha = mask.getchannel("A")
assert alpha.getextrema()[0] == 0, "Mask has no fully transparent editable region"

print("Mask check passed")
```

## Mask Shapes and How Brush-Style Editing Works

### Masks Can Be Any Irregular Shape

A mask is fundamentally a **per-pixel bitmap**, not a geometric shape — every pixel carries its own alpha value. So:

* Rectangles and circles are just the simplest examples
* A person-shaped silhouette, hair-strand edges, a freehand scribble, or multiple disconnected patches are all valid
* In practice **most masks are irregular**: they follow the target object's outline, slightly expanded

<Tip>
  The only "shape advice" is about results, not rules: the transparent region should **fully cover the object plus its edges, shadows, and reflections**. Err on the generous side so the model has room to blend naturally.
</Tip>

### How Brush-Style Editing Is Implemented

The "brush where you want changes" interaction in photo apps is surprisingly simple on the front end: **two stacked layers, with the brush "erasing" the top one into transparency**.

```text theme={null}
Bottom <img>     shows the original (visual reference only, not exported)
Top <canvas>     same pixel dimensions as the original, initially fully opaque
                 wherever the brush passes → pixels become transparent
Export canvas    → a valid alpha-mask PNG
```

The core is one line — set the canvas compositing mode to `destination-out` (new strokes "carve out" existing pixels):

```javascript theme={null}
const canvas = document.getElementById("mask-canvas");
const ctx = canvas.getContext("2d");

// 1. Canvas size = the image's natural pixel size (not its CSS display size);
//    matching dimensions come for free
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;

// 2. Start fully opaque = preserve everything
ctx.fillStyle = "rgba(255, 255, 255, 1)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 3. The key line: switch the brush to "erase" mode — strokes become transparent
ctx.globalCompositeOperation = "destination-out";
ctx.lineWidth = 40;          // brush size
ctx.lineCap = "round";
ctx.strokeStyle = "rgba(0, 0, 0, 1)";

// 4. Draw on pointer events (convert display coordinates back to natural pixels)
canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;
  const scaleX = canvas.width / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;
  ctx.lineTo(event.offsetX * scaleX, event.offsetY * scaleY);
  ctx.stroke();
});

// 5. Export: a PNG mask with an alpha channel, ready to upload
canvas.toBlob((blob) => {
  const formData = new FormData();
  formData.append("mask", blob, "mask.png");
  // POST to /v1/images/edits together with the image and prompt
}, "image/png");
```

Engineering details that matter:

1. **Coordinate conversion**: the canvas is usually scaled down by CSS on the page; convert stroke coordinates back by `naturalWidth / clientWidth`, or the mask will be misaligned
2. **Undo**: snapshot with `ctx.getImageData()` before each stroke and restore with `putImageData()`
3. **Mask dilation**: users tend to brush only the object's center — programmatically expand the mask a few pixels before submitting (the "Expand Mask" button in professional tools); on the Python side use `PIL.ImageFilter.MaxFilter` or OpenCV's `cv2.dilate`
4. **Semi-transparent preview**: draw the user-facing highlight (e.g. translucent red) on a **separate preview layer**, keeping the exported mask layer strictly binary opaque/transparent

### Going Further: Click or Text to Mask

One step beyond brushing is replacing "human strokes" with "model inference":

```text theme={null}
User clicks an object            → SAM returns a pixel-accurate outline mask
User types "the cup on the left" → SAM 3 finds all instances matching the concept
Program dilates + feathers       → submit to /v1/images/edits
```

This is exactly how Inpaint Anything and ComfyUI's Mask Editor work: **segmentation handles precision, the brush handles corrections** — auto-generate an accurate mask first, then fine-tune with add/trim brush strokes. For your own product, deploying SAM as a backend service while keeping a brush canvas as the fallback is currently the best-UX combination.

## Multiple Reference Images + Mask

A typical scenario: outfit swap (first image is the person, followed by style / fabric references; the mask marks the clothing region):

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

with open("person.png", "rb") as person, \
     open("clothes_reference.png", "rb") as clothes, \
     open("fabric_reference.png", "rb") as fabric, \
     open("mask.png", "rb") as mask:

    result = client.images.edit(
        model="gpt-image-2",
        image=[person, clothes, fabric],
        mask=mask,
        prompt=(
            "The first image is the subject to edit. "
            "Only modify the clothing inside the transparent mask region "
            "of the first image. Use the garment style from the second image "
            "and the fabric texture from the third image. Keep the face, "
            "hairstyle, pose, body proportions, background, and lighting "
            "of the first image unchanged."
        ),
        quality="high",
        size="1024x1536",
        output_format="png",
    )

with open("result.png", "wb") as output:
    output.write(base64.b64decode(result.data[0].b64_json))
```

<Tip>
  With multiple images, the prompt must **clearly describe each image's role** (first = subject, second = style reference, third = fabric reference); otherwise the model may confuse them.
</Tip>

## Strictly Preserving Content Outside the Mask (Pixel-Level Post-Processing)

Since the model may slightly alter content outside the mask, for pixel-accuracy scenarios (product shots, ID layouts, fixed UI screenshots), composite the region outside the mask back from the original after generation:

```python theme={null}
from PIL import Image, ImageFilter

original = Image.open("input.png").convert("RGBA")
edited = Image.open("edited.png").convert("RGBA")
mask = Image.open("mask.png").convert("RGBA")

if edited.size != original.size:
    edited = edited.resize(original.size, Image.Resampling.LANCZOS)

# Original mask alpha: 0 = edit region, 255 = preserved region
alpha = mask.getchannel("A")

# Inverted: 255 = use edited result, 0 = use original
edit_area = alpha.point(lambda value: 255 - value)

# Slight feathering to avoid hard edges
edit_area = edit_area.filter(ImageFilter.GaussianBlur(radius=3))

final = Image.composite(edited, original, edit_area)
final.save("final.png")
```

Result: the AI edit inside the mask, the original image outside it, with a lightly feathered boundary.

## Common Errors

<AccordionGroup>
  <Accordion title="invalid_image_file / Invalid image file or mode">
    Common causes:

    * The mask is not a valid PNG, or the file is corrupted
    * The extension says PNG but the actual encoding is not PNG
    * Abnormal image mode (CMYK, palette mode, missing alpha)
    * Wrong MIME type on upload
    * The file stream was already consumed or closed before the request

    Re-encoding fixes most cases:

    ```python theme={null}
    from PIL import Image

    Image.open("input_source.jpg").convert("RGBA").save("input.png")
    Image.open("mask_source.png").convert("RGBA").save("mask.png")
    ```
  </Accordion>

  <Accordion title="Image and mask dimensions don't match">
    Even a 1-pixel difference fails. Fix:

    ```python theme={null}
    from PIL import Image

    image = Image.open("input.png")
    mask = Image.open("mask.png").convert("RGBA")

    mask = mask.resize(image.size, Image.Resampling.NEAREST)
    mask.save("mask_fixed.png")
    ```
  </Accordion>

  <Accordion title="Black-and-white mask has no alpha channel">
    `RGB` / `L` / `P` modes are not enough — the mask must be `RGBA`. Use "Method 2" above to convert.
  </Accordion>

  <Accordion title="Mask transparency and output transparency are two different things">
    These two are easy to confuse:

    ```text theme={null}
    Mask transparency:   marks "the model may change this area" — the alpha channel of the mask file
    Output transparency: the result itself carries an alpha channel — controlled by the background parameter
    ```

    They **work together**: pass a `mask` with alpha to mark the edit region and `background: "transparent"` to get a transparent result. Verified — the two do not conflict.

    Output transparency requires `output_format` to be `png` or `webp`; pairing it with `jpeg` returns 400 (jpeg has no alpha channel). Full details: [How do I generate images with a transparent background](/en/faq/image-transparent-background).
  </Accordion>

  <Accordion title="response_format=url returns no image">
    GPT Image models always return Base64 data; `response_format` only applies to legacy DALL·E 2 behavior. Read the result via:

    ```python theme={null}
    result.data[0].b64_json
    ```
  </Accordion>

  <Accordion title="Content-Type isn't multipart/form-data">
    Usually caused by manually setting the `Content-Type` header (losing the boundary), or a middle layer parsing the multipart request into JSON before forwarding. Let your HTTP client generate the multipart headers automatically.
  </Accordion>
</AccordionGroup>

## Size Parameters

`gpt-image-2` supports flexible dimensions, subject to all of the following:

```text theme={null}
Width and height must both be multiples of 16
Longest side no more than 3840px
Aspect ratio no more than 3:1
Total pixels at least 655,360
Total pixels no more than 8,294,400
```

Common sizes: `1024x1024`, `1536x1024`, `1024x1536`, `2048x2048`, `2048x1152`, `3840x2160`, `2160x3840`, `auto`. Square images usually generate faster.

## Production Request Template

```python theme={null}
result = client.images.edit(
    model="gpt-image-2",
    image=open("input.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="""
Only edit the transparent region of the mask.

Edit task:
Replace the white mug inside the transparent region with a bouquet
of white tulips.

Must preserve:
- Original composition
- Camera position and lens perspective
- Table surface and background
- Lighting direction and color temperature
- All people and objects outside the mask
- Realistic photographic style

Blending requirements:
The bouquet should sit naturally where the mug was, with shadows,
reflections, and contact points consistent with the scene lighting.
Do not add any other objects.
""",
    size="1536x1024",
    quality="high",
    output_format="png",
)
```

## Related Pages

<CardGroup cols={2}>
  <Card title="Image Edit API Reference" icon="image" href="/en/api-capabilities/gpt-image-2/image-edit">
    Full parameter reference and interactive Playground
  </Card>

  <Card title="GPT-Image-2 Overview" icon="sparkles" href="/en/api-capabilities/gpt-image-2/overview">
    Model capabilities, pricing, and version notes
  </Card>
</CardGroup>

<Info>
  Official references (copy into your browser):

  * Model page: `developers.openai.com/api/docs/models/gpt-image-2`
  * Image edit API reference: `developers.openai.com/api/reference/python/resources/images/methods/edit/`
  * Image generation guide: `developers.openai.com/api/docs/guides/image-generation`
</Info>
