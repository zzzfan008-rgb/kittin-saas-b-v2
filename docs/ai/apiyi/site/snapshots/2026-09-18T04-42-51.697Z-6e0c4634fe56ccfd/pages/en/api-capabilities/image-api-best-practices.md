> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image API Essentials & Best Practices

> All APIYI image APIs are synchronous: there is no async task ID, and a dropped connection loses the result while the request is still billed. Includes per-model timeout recommendations plus a base64/URL output reference table.

<Info>
  **The one-line answer**: every image model on APIYI is **synchronous** — send the request, keep the connection open, and the generated image comes back in the same response. There is no async task ID and no polling endpoint; if your client disconnects early, that result is gone, yet the request is still billed. **A generous timeout is rule number one for image API development.**
</Info>

## Three Facts to Know Before You Start

<CardGroup cols={3}>
  <Card title="Everything Is Synchronous" icon="arrow-right-left">
    A single HTTP request blocks until completion, matching the official upstream API shape — there is no submit-then-poll mode. Even providers that are async upstream (like FLUX) are wrapped into synchronous calls by the gateway, so you never write a polling loop.
  </Card>

  <Card title="No Task ID" icon="search-x">
    There is no task\_id lookup endpoint, and you cannot recover an image later using a request\_id. APIYI proxies requests transparently and does not store generated results — once the connection drops, the result is unrecoverable.
  </Card>

  <Card title="Disconnects Are Still Billed" icon="unplug">
    If your client times out and disconnects, the server and upstream still finish generating, and the request is **billed as usual**. A timeout that is too small means paying for images you never receive.
  </Card>
</CardGroup>

## Model Series Quick Reference

Recommended timeouts, output formats, and URL support for each image model series:

| Model Series                                                                                    | Endpoint                                                  | Recommended Timeout                                                                                                  | Output Format                                                                                                  | URL Output & Validity                                                                                           |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [GPT-Image-2.5 / 2 (Official: flare / sunburst / 2)](/en/api-capabilities/gpt-image-2/overview) | `/v1/images/generations`, `/v1/images/edits`              | **360s** (gpt-image-2 high + 2K/4K measured at 3-5 minutes; 2.5 is faster but keep the headroom for `xhigh` / `max`) | Raw b64\_json (**no `data:` prefix**)                                                                          | ❌ Not supported (`response_format` returns 400; the `image2_OSS` group does not cover the official channel yet) |
| [GPT-Image-2-All (Reverse)](/en/api-capabilities/gpt-image-2-all/overview)                      | Same as above                                             | **300s**                                                                                                             | Default `b64_json` (**no `data:` prefix**, verified 2026-07); switchable via explicit `response_format: "url"` | ✅ Explicit `url`: R2 CDN, \~24 hours; use the `image2_OSS` group if you depend on URLs                          |
| [GPT-Image-2-VIP](/en/api-capabilities/gpt-image-2-vip/overview)                                | Same as above                                             | **300s**                                                                                                             | Same as All (default `b64_json`, no prefix, verified 2026-07)                                                  | ✅ Same as All (explicit `url` or the `image2_OSS` group)                                                        |
| [Nano Banana Pro](/en/api-capabilities/nano-banana-image/overview)                              | Native Gemini `:generateContent`                          | 1K/2K **300s**, 4K **600s**, multi-image 5+ minutes                                                                  | Raw base64 in `inlineData.data`                                                                                | `NB_OSS` beta group (see below)                                                                                 |
| [Nano Banana 2](/en/api-capabilities/nano-banana-2-image/overview)                              | Same as above                                             | **360s**                                                                                                             | Same as above                                                                                                  | `NB_OSS` coverage: contact support                                                                              |
| [Nano Banana Lite](/en/api-capabilities/nano-banana-lite-image/overview)                        | Same as above                                             | **300s** (\~4s typical, headroom for peak congestion)                                                                | Same as above                                                                                                  | `NB_OSS` coverage: contact support                                                                              |
| [FLUX](/en/api-capabilities/flux/overview)                                                      | `/v1/images/generations`                                  | **60-120s**, 180s for flex models                                                                                    | `data[0].url` only (**URL is the upstream default**)                                                           | ⚠️ Valid for only \~**10 minutes**, no CORS — re-host server-side immediately                                   |
| [Seedream](/en/api-capabilities/seedream-image/overview)                                        | `/v1/images/generations` (unified generate/edit endpoint) | **60s** (4K + hd around 30-60s)                                                                                      | Default `url` (**URL is the upstream default**); optional `b64_json` (raw base64, no prefix)                   | ✅ BytePlus TOS, \~24 hours                                                                                      |

<Tip>
  `response_format` has a **narrow surface**: only GPT-Image-2-All / VIP and Seedream accept it; the official GPT-Image-2 channel returns 400 `unknown_parameter` if you pass it. Where supported, **always pass it explicitly** rather than relying on the default — the default has historically varied across groups and load conditions.
</Tip>

## Billing and What Drives the Price

The most common billing question from newcomers: "Is each reference image a flat fee, or do bigger images consume more tokens?" Start with three intuitions:

<CardGroup cols={3}>
  <Card title="Output Dominates the Cost" icon="trending-up">
    Taking gpt-image-2 as an example: text input \$5/M, image input \$8/M, **output \$30/M**. The biggest price levers are always the **output size and quality** (quality × size) — reference image count comes second.
  </Card>

  <Card title="Input Images Are Not Flat-Fee" icon="scaling">
    GPT-family input images map to tokens by **dimensions/aspect ratio** (bigger = more, with both a floor and a cap), and **count adds up strictly linearly**. The Gemini family is the opposite — output images cost a fixed token amount per resolution tier.
  </Card>

  <Card title="Trust the Returned usage" icon="receipt">
    Both input and output tokens are in the response: GPT family in `usage.input_tokens_details.image_tokens`, Gemini family in `usageMetadata.promptTokensDetails`. Reconcile and price against these — never estimate by image count.
  </Card>
</CardGroup>

### Token Accounting: The Two Model Families

| Family                                     | Input Image Tokens                                                                                                                                    | Output Image Tokens                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **GPT family** (gpt-image-2 etc.)          | Dynamic by dimensions: square images at or below 1024² are all 1024 tokens, 2048² and above cap at 1521 (verified 2026-07); **N images = N × single** | Determined by `size` × `quality`: 1024² ranges from 196 tokens at low to several thousand at high |
| **Gemini family** (all Nano Banana models) | Counted in the IMAGE modality of `promptTokensDetails`                                                                                                | **Fixed per resolution tier**: 1120 per image at 1K/2K, 2000 at 4K, regardless of aspect ratio    |

### Cost Intuition for Multiple Input Images

* One reference image runs about **800-1600 image tokens ≈ \$0.008-0.012** (gpt-image-2, measured, varying with dimensions/aspect ratio);
* Count adds up linearly: **16 images ≈ \$0.13**, the same order of magnitude as one `high` output (≈\$0.21) — input cost is no longer negligible in multi-image fusion;
* **Tokens are determined by pixel dimensions, not file size**: compressing files helps upload stability but saves no tokens; to save tokens, reduce the image count (oversized images are capped, so no runaway bills either).

Full measurement table: [gpt-image-2 — How Multiple Input Images Affect the Price](/en/api-capabilities/gpt-image-2/overview#how-multiple-input-images-affect-the-price-verified-july-2026); Gemini-family token accounting: [usageMetadata guide](/en/api-capabilities/nano-banana-usage-metadata) and [Nano Banana pricing](/en/api-capabilities/nano-banana-pricing).

## Timeout Configuration

### Why Default Timeouts Break Things

Most HTTP clients default to 30-60 second timeouts (`requests` has no limit itself but is often wrapped by frameworks that add \~30s), while image generation is a genuinely long request:

* GPT-Image-2 at `high` quality with 2K/4K resolution measures **3-5 minutes** end to end;
* Nano Banana series 4K images start around 50 seconds, longer at peak times;
* Multi-image fusion and image-edit requests are generally slower than text-to-image.

With default settings, the client kills the connection while the server is still generating normally — you see a wave of "timeouts" that are actually **successful requests you disconnected from yourself**, and every one of them is billed.

### Per-Model Timeout Tiers

```python theme={null}
# Set client timeouts (seconds) per model, not one global value
IMAGE_TIMEOUTS = {
    "gpt-image-2": 360,                      # high + 2K/4K measured at 3-5 min
    "gpt-image-2.5-flare": 360,              # 2.5 shares price and parameters; reuse the timeout
    "gpt-image-2.5-sunburst": 360,
    "gpt-image-2-all": 300,
    "gpt-image-2-vip": 300,
    "gemini-3-pro-image": 600,               # Nano Banana Pro, 600s covers 4K
    "gemini-3.1-flash-image-preview": 360,   # Nano Banana 2
    "gemini-3.1-flash-lite-image": 300,      # Nano Banana Lite
    "flux": 120,                             # 180 recommended for flex models
    "seedream": 60,                          # 4K + hd around 30-60s
}

import requests

def generate_image(model: str, payload: dict, api_key: str) -> dict:
    resp = requests.post(
        "https://api.apiyi.com/v1/images/generations",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, **payload},
        timeout=IMAGE_TIMEOUTS.get(model, 300),  # 300s fallback for unknown models
    )
    resp.raise_for_status()
    return resp.json()
```

### Retry Strategy

Not every failure deserves a retry — start from how each case is billed:

| Failure                                    | Billed?                                   | Recommendation                                                        |
| ------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------- |
| 429 / 503 (rate limit, upstream overload)  | Not billed                                | Retry with exponential backoff (e.g. 5s, 15s, 45s)                    |
| Client timeout / early disconnect          | **Billed**                                | Increase the timeout first; if you must retry, cap attempts carefully |
| 400 / 403 (parameter or permission errors) | Not billed                                | Fix the request before resending — blind retries are pointless        |
| Content moderation block                   | **Depends on the model** (see note below) | Revise the prompt; resending as-is will most likely be blocked again  |

<Info>
  **Moderation-block billing depends on the model**: token-billed models (official GPT-Image-2 etc.) usually return a 400 error when moderation triggers — **not billed**. Only the **per-image-billed Nano Banana Pro** hits the "HTTP 200 but generation failed" Google-side block, and that call **is billed** — APIYI covers these non-user-fault failures with the [Failed-Generation Credit Reimbursement Plan](/en/api-capabilities/nano-banana-pro-guarantee), which reimburses credit based on a per-image tally.
</Info>

## Working with base64 Output

### Prefix Differences

The base64 payload is **not uniform across series** — this is the most common trap for new integrations:

| Model Series               | base64 Field                                    | Includes `data:image/...;base64,` Prefix?                              |
| -------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| GPT-Image-2 (Official)     | `data[0].b64_json`                              | No prefix (raw base64)                                                 |
| GPT-Image-2-All / VIP      | `data[0].b64_json`                              | No prefix (verified 2026-07; **earlier versions included the prefix**) |
| Nano Banana series         | `candidates[0].content.parts[].inlineData.data` | No prefix (raw base64)                                                 |
| Seedream (`b64_json` mode) | `data[0].b64_json`                              | No prefix (raw base64)                                                 |

Prefix behavior has changed across channel versions, so **always check `startsWith("data:")` first**: strip the prefix before decoding (or use the value directly as an `img src`) when present, and decode raw values as-is — this avoids both the double-prefix bug and decoding failures on prefixed payloads.

### Decoding to a File

```python theme={null}
import base64

b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):          # defensive strip: some channel versions included a data: prefix
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

```javascript theme={null}
let b64 = response.data[0].b64_json;
if (b64.startsWith("data:")) {
  b64 = b64.slice(b64.indexOf(",") + 1);
}
require("fs").writeFileSync("output.png", Buffer.from(b64, "base64"));
```

### Playground Rendering Limits

base64 responses are often several megabytes, and the browser Playground may show `unable to complete request` — this **does not mean the request failed**. The request succeeded and was billed; the browser simply cannot render a string that long. Verify results from code, or switch to a model/parameter that returns a `url`.

## Input Image Preprocessing

Image-edit / reference-image endpoints (such as gpt-image-2's `/v1/images/edits`) only accept **png / jpg / webp**. Products that let users upload their own photos hit one particularly sneaky trap: **photos straight off a phone camera are often not standard JPEG**.

### Typical Symptom: 400 invalid\_image\_file

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "code": "invalid_image_file"
  }
}
```

The usual root cause is **MPO format** (Multi-Picture Object, a multi-frame JPEG container): `.jpg` files straight out of Huawei Mate-series and similar phones embed an HDR gain-map sub-frame and are actually MPO. What makes them sneaky is that the file starts with the same `FFD8` header — **the extension, the HTTP Content-Type, and the `file` command all report JPEG** — and only frame-aware parsing reveals the truth:

```python theme={null}
from PIL import Image
Image.open("photo.jpg").format   # "MPO" means you're hit; standard images return "JPEG"/"PNG"
```

Verified July 2026 (gpt-image-2 edits endpoint): MPO images are always rejected, while the same image re-encoded to standard JPEG/PNG succeeds **at the full original resolution (3072×4096)** — the problem is the format, not the size. This 400 is returned quickly at the input-validation stage and is **not billed**.

### Recommendation: Re-encode Server-Side, Uniformly

Rather than debugging photos one by one, add a single re-encode step to your upload pipeline — it also absorbs HEIC, CMYK, and other non-standard inputs:

```python theme={null}
from PIL import Image
import io

def normalize_image(raw: bytes) -> bytes:
    """Any source image → standard JPEG that passes image-edit format validation"""
    im = Image.open(io.BytesIO(raw))
    im.load()                      # multi-frame formats (MPO etc.): keep the first frame only
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")     # normalize CMYK / P and other modes to RGB
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)
    return out.getvalue()
```

While re-encoding, shrink the payload too (long edge up to 4096, JPEG quality 80-92) and keep each image under 1.5MB — upload success rates and generation speed both improve, and output quality does not depend on input file size. See [gpt-image-2 image edit: Reference Image Format Requirements and Preprocessing](/en/api-capabilities/gpt-image-2/image-edit#reference-image-format-requirements-and-preprocessing).

## Input Image Format Preprocessing

Image-edit / reference-image endpoints (such as gpt-image-2's `/v1/images/edits`) only accept **png / jpg / webp** as input. Products that take user-shot photos hit one particularly sneaky trap: **photos straight off a phone camera are often not standard JPEG**.

### Typical symptom: 400 invalid\_image\_file

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "code": "invalid_image_file"
  }
}
```

The usual root cause is **MPO format** (Multi-Picture Object, a multi-frame JPEG container): `.jpg` files straight out of Huawei Mate-series phones embed an HDR gain-map sub-frame and are actually MPO. What makes these files sneaky is that the header is the same `FFD8` — **the extension, the HTTP Content-Type, and the `file` command all report JPEG** — and only frame-aware parsing can tell:

```python theme={null}
from PIL import Image
Image.open("photo.jpg").format   # "MPO" means you're affected; standard files return "JPEG"/"PNG"
```

Verified July 2026 (gpt-image-2 edit endpoint): MPO files are always rejected; the same image re-encoded as standard JPEG/PNG succeeds **at the full original resolution (3072×4096)** — the problem is the format, not the size. This 400 is returned quickly at the input-validation stage and is **not billed**.

### Recommendation: re-encode uniformly on the server side

Rather than debugging images one by one, add a single re-encode step to your upload pipeline — it also covers HEIC, CMYK, and other non-standard inputs:

```python theme={null}
from PIL import Image
import io

def normalize_image(raw: bytes) -> bytes:
    """Any input image → standard JPEG that passes image-edit endpoint validation"""
    im = Image.open(io.BytesIO(raw))
    im.load()                      # multi-frame formats (MPO etc.): keep only the first frame
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")     # normalize CMYK / P etc. to RGB
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)
    return out.getvalue()
```

While re-encoding, compress as well (long edge no more than 4096px, JPEG quality 80-92) and keep each image within 1.5MB — upload success rate and generation speed both improve, and output quality is unrelated to input file size. See [gpt-image-2 Image Edit — Reference Image Format Requirements and Preprocessing](/en/api-capabilities/gpt-image-2/image-edit#reference-image-format-requirements-and-preprocessing).

## Getting URL Output Instead

There are three paths, in order of reliability:

1. **URL is the upstream default** — FLUX (valid only \~10 minutes, no CORS headers; download and re-host server-side immediately) and Seedream (BytePlus TOS, \~24 hours) return URLs natively, with no configuration needed.
2. **OSS groups (deterministic URL output — recommended for production)**:
   * `image2_OSS` group: covers **GPT-Image-2-All / VIP** (1x multiplier, no surcharge); switch your token to this group for stable URL output with no base64 fallback. **The official GPT-Image-2 channel is not covered yet.**
   * `NB_OSS` beta group: covers the Nano Banana series, with the image URL delivered in the `text` field — see the [NB-OSS group guide](/en/api-capabilities/nano-banana-oss-group).
3. **Explicit `response_format: "url"`** — only GPT-Image-2-All / VIP (R2 CDN, \~24 hours) and Seedream accept it; the surface is **narrow**, and the official GPT-Image-2 channel returns 400 if you pass it. This is a per-request switch on the default group — businesses that depend on URLs should use an OSS group instead.

**GPT-Image-2 (Official) currently has no URL output path at all** — base64 only.

<Warning>
  Every image URL these platforms return is a **temporary link** (10 minutes to 24 hours). Anything that needs long-term storage — product images, user creations, history — must be **re-hosted to your own object storage / CDN immediately** after generation, with your own URL saved to your database.
</Warning>

## Troubleshooting Timeouts and Disconnects

If you have already raised the SDK timeout and still see frequent "timeouts", work through this checklist:

<Steps>
  <Step title="Confirm the effective client-side timeout">
    Frameworks often wrap the HTTP client in another timeout layer (task-queue worker limits, serverless execution caps). Any layer shorter than the model's generation time will kill the request.
  </Step>

  <Step title="Check intermediaries: nginx / load balancers / CDN">
    Self-hosted reverse proxies (`proxy_read_timeout`), cloud load balancer idle timeouts, and CDN origin timeouts **commonly default to 60 seconds** and will cut the connection before your client does. Every hop on a long-request path needs to be widened.
  </Step>

  <Step title="Enable keep-alive so idle connections are not reclaimed">
    Connections with no bytes flowing for a long time can be silently dropped by NAT devices or firewalls; TCP or HTTP keep-alive significantly reduces the odds.
  </Step>

  <Step title="Use the request ID and console logs to check billing">
    Record the `x-request-id` response header and look it up in the APIYI console call logs. If the call appears there, the server finished generating and billed the request — the connection was cut on your side of the path.
  </Step>
</Steps>

## Want Task-Style Async Management?

The platform does not offer an async API, but you can build an async shell on top of the synchronous endpoints yourself:

<CardGroup cols={3}>
  <Card title="Why There Is No Async API" icon="circle-question-mark" href="/en/faq/image-async-api">
    FAQ: Is there an async image API? Can I query results by task ID?
  </Card>

  <Card title="Build Your Own Async Queue" icon="list-checks" href="/en/api-capabilities/image-async-queue">
    Engineering guide: wrap synchronous calls in a task queue with your own task\_id, persistence, and retries
  </Card>

  <Card title="NB-OSS URL Output Group" icon="cloud-upload" href="/en/api-capabilities/nano-banana-oss-group">
    Switch Nano Banana output to URLs and cut base64 transfer overhead
  </Card>
</CardGroup>
