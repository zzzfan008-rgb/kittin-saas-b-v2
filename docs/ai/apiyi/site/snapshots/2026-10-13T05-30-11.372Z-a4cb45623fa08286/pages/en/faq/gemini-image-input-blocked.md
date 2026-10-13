> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why Does Gemini Image Return blockReason: OTHER?

> When a Gemini image model returns promptFeedback.blockReason with no candidates within seconds, find the blocked reference image and preprocess reference images, for both manual and code workflows.

## Short answer

If the Gemini image API returns HTTP 200 but the response has **no `candidates`** and only `promptFeedback.blockReason` (most often `OTHER`), the request was blocked by the provider's input check **before generation started**.

* This kind of block usually comes back within a few seconds, much faster than a normal image
* `OTHER` does not state a reason, and `safetyRatings` is often empty
* It is **not necessarily related to how the prompt is written**; often a single reference image triggers it
* gemini-3-pro-image (Nano Banana Pro) checks input more strictly than gemini-3.1-flash-image, so the same request may be blocked on Pro and succeed on flash

The approach is: **first find which image triggers the block, then preprocess all reference images consistently**.

## How to recognize it

A typical response looks like this:

```json theme={null}
{
  "promptFeedback": {
    "blockReason": "OTHER",
    "safetyRatings": []
  },
  "usageMetadata": {
    "promptTokenCount": 1919,
    "candidatesTokenCount": 0
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

| Characteristic | blockReason block | NO\_IMAGE |
| - | - | - |
| Field carrying the failure | `promptFeedback.blockReason` | `candidates[0].finishReason` |
| `candidates` | None | Present, but `parts` is `null` |
| Response time | Within a few seconds | Similar to a normal generation |
| Common cause | Input (usually a reference image) was blocked | Unclear image intent in the prompt |
| What to do | Find and preprocess the reference image | Fix the prompt; see [NO\_IMAGE troubleshooting](/en/faq/gemini-no-image) |

## A tested case

In September 2026 (UTC+8) we re-ran a fashion-catalog request: one prompt plus 6 reference images (pose, person, scene, outfit, a shoes-and-socks collage, and a hat), 2:3, 2K, `responseModalities: ["IMAGE"]`.

* gemini-3-pro-image returned `blockReason: OTHER` 3 times in a row; the same request succeeded on gemini-3.1-flash-image
* By repeatedly splitting the images in half, we found that **the only trigger was the person reference image**: an AI-generated character sheet with front, back, side, and close-up face panels
* That image was blocked with any prompt, including an unrelated instruction such as "change the background to light gray"
* The two images we suspected most, a real-person pose photo with a watermark and a hat photo with a logo, both passed on their own

The key finding:

| How the person reference image was sent | Result |
| - | - |
| Original image | Blocked 13/13 |
| Identical pixels in a different file format (for example, saved as PNG) | Blocked 2/2 |
| Re-exported as JPEG (quality 95, no visible difference) | Passed 6/6 |
| Full 6-image request with the re-exported image swapped in | Generated 2/2, with the correct person, pose, and outfit |

In other words, this check can be very sensitive to the exact pixels of certain images, and re-exporting the image once lets the request through. The provider does not publish what `OTHER` is based on, so we cannot attribute it further.

<Info>
  This case shows that sending many reference images in one request, or merging several steps into a single generation, is not the problem in itself. When you see `OTHER`, find the image first before rewriting the prompt or splitting the workflow.
</Info>

## How to find the image

<Steps>
  <Step title="Step 1: Confirm that it reproduces">
    Resend the request unchanged 2–3 times. A `blockReason` block usually reproduces consistently. If it only fails sometimes, the problem is more likely the [NO\_IMAGE](/en/faq/gemini-no-image) kind.
  </Step>

  <Step title="Step 2: Rule out the prompt">
    Keep all images and replace the prompt with a simple, unrelated instruction, such as "change the background to light gray." If it is still blocked, the cause is in the images.
  </Step>

  <Step title="Step 3: Split the images in half">
    Send each half separately, then keep splitting only the half that is still blocked until you reach a single image. Six images take at most three rounds.
  </Step>

  <Step title="Step 4: Fix that image">
    Re-export the image as described under "Recommendations" below, then send the full request again to confirm.
  </Step>
</Steps>

<Tip>
  While narrowing down, one generated image is enough to mark a group as "passes," so there is no need to repeat it. Two blocks in a row are enough to mark it as "blocked." The whole search usually takes only a dozen or so calls.
</Tip>

## Recommendations

### Scenario 1: Manual work (generating in a canvas or tool)

1. **Re-export reference images before uploading them**: use any image editor (such as the built-in Preview app or Photoshop) to export JPEG at quality 90–95, with the long edge at 2048px or less.
2. **Downscale large images**: originals with a long edge of 3000–4000px can be reduced to 2048px without affecting the result, and they upload faster.
3. **If a request fails within seconds, suspect a reference image first**: re-export the image you added most recently and try again. If that does not help, check the images one by one as described above.
4. **Prefer full-body images as person references**: in the case above, the front full-body panel passed on its own once the character sheet was split. If a character sheet keeps getting blocked, try using only its full-body view.
5. **Temporary alternative**: if an image cannot pass on Pro, use gemini-3.1-flash-image for that step.

### Scenario 2: Code (automated processing)

**1. Preprocess every reference image before sending**, instead of handling individual images: convert to sRGB → apply the EXIF orientation → limit the long edge to 2048px → re-encode as JPEG (quality 90–95) → drop metadata.

The main benefit is a much smaller request body and faster uploads (the original request in the case above was about 4.6 MB). It also reduces `OTHER` blocks of this kind. Node.js example:

```javascript theme={null}
import sharp from "sharp";

async function normalizeReference(buffer) {
  return sharp(buffer, { failOn: "none" })
    .rotate()                       // apply the EXIF orientation
    .toColorspace("srgb")
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();                    // metadata is dropped by default
}

// parts.push({ inlineData: { mimeType: "image/jpeg", data: (await normalizeReference(buf)).toString("base64") } });
```

The same pipeline in Python with Pillow:

```python theme={null}
from io import BytesIO
from PIL import Image, ImageOps

def normalize_reference(raw: bytes) -> bytes:
    im = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    im.thumbnail((2048, 2048))
    out = BytesIO()
    im.save(out, "JPEG", quality=92)
    return out.getvalue()
```

**2. Handle each failure type differently**:

| Response | Meaning | Recommended handling |
| - | - | - |
| `promptFeedback.blockReason` is `OTHER`, returned within seconds | Input blocked by the provider's check; reason not disclosed | Automatically resend once with different encoding settings (for example, quality 88 and a long edge 1% smaller); if it still fails, switch to flash or ask the user for a different reference image |
| `blockReason` is `SAFETY` / `PROHIBITED_CONTENT`, or `finishReason` is `IMAGE_SAFETY` or similar | An explicit content-safety block | **Do not retry**; ask the user to change the material or description |
| `finishReason` is `NO_IMAGE` with zero output tokens | Unclear image intent in the prompt | Append "output the final image only, no text" to the prompt and resend; see [NO\_IMAGE troubleshooting](/en/faq/gemini-no-image) |

<Warning>
  Automatic retries apply only to `OTHER`, whose reason is unknown. For explicit safety reasons, re-encoding images cannot and should not be used to change the outcome; ask the user to adjust the content instead.
</Warning>

**3. Log troubleshooting details**: on every failure, record the `responseId` and each reference image's hash and dimensions. This lets you find the image quickly and gives us what we need if you contact support.

## Frequently asked questions

<AccordionGroup>
  <Accordion title="Why does flash generate the image while Pro blocks it?">
    The two models use different input checks, and Pro is stricter. A reference image that passes on flash and is blocked on Pro is expected behavior and does not mean the request itself is wrong.
  </Accordion>

  <Accordion title="Can AI-generated reference images be blocked too?">
    Yes. The blocked image in the case above was a character sheet regenerated from the customer's own photos. Whether an image is blocked does not map simply to where it came from; find and preprocess it as described on this page.
  </Accordion>

  <Accordion title="Are 6 reference images in one request too many?">
    In the case above, 6 images were not the problem: after replacing the one person image, the full 6-image request generated normally.
  </Accordion>

  <Accordion title="Will a blocked request be charged?">
    Check the APIYI call logs to confirm whether the request created a charge record.
  </Accordion>
</AccordionGroup>

## Still stuck? Contact support

Please include the following so we can help:

* Model name and token group;
* The complete response (at least `promptFeedback` and `responseId`) and the `request ID`;
* Time of occurrence (with time zone);
* The reference image you identified, if you can share it.

<Warning>
  Never send a complete API key. Redact the key before sharing screenshots or logs.
</Warning>

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan the QR code, or click this card to contact support directly.
  </Card>

  <Card title="Email Support" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    We recommend including "blockReason" and the model name in the subject.
  </Card>
</CardGroup>

## Related documentation

<CardGroup cols={2}>
  <Card title="Why Does the Gemini Image API Return NO_IMAGE?" icon="image-off" href="/en/faq/gemini-no-image">
    Missing images caused by unclear prompt intent, and how to fix them
  </Card>

  <Card title="Nano Banana image generation failures" icon="image-off" href="/en/faq/nano-banana-image-failure">
    Common causes including safety, watermark removal, well-known IP, and minors
  </Card>

  <Card title="Gemini Image API Error Handling" icon="triangle-alert" href="/en/api-capabilities/gemini-image-error-handling">
    The full response-checking order and user-friendly error messages
  </Card>

  <Card title="How do I read billing amounts in the logs?" icon="file-text" href="/en/faq/log-billing-explained">
    Use call logs to confirm whether a request succeeded and was charged
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.