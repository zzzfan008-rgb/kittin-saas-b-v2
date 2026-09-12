> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Asset-First: Faster, More Reliable Image and Video Inputs

> When a Seedance call carries images or video, the create-task endpoint can take tens of seconds to return a task ID — or time out on the client. Ingest the media first, get an asset:// ID, and reference that instead: the request body drops from megabytes to a few dozen bytes, submission returns immediately, and content checks move up to ingest time. Includes a latency breakdown, what to do after a timeout, and migration steps.

<Note>
  **The short version**: text-to-video is unaffected and returns a task ID in about a second. **The moment a request carries an image or a video, ingest the media into the asset library first, get an `asset://` asset ID, and reference that in the generation request.** The request body drops from megabytes to a few dozen bytes, the create-task endpoint returns immediately, and the content check on your media happens at ingest time instead.

  This page is about **submission** speed and reliability. For endpoint-by-endpoint documentation of the asset library see the [Asset Library](/en/api-capabilities/seedance2/asset-library); for end-to-end runnable code see the [Asset Reference Guide](/en/api-capabilities/seedance2/asset-reference).
</Note>

## First: is submission slow, or is generation slow?

Seedance is an **async, task-based** API. One clip involves two separate phases, and their latency comes from completely different places:

| Phase                                                        | What you get back                      | Normal duration                                                                | Why it gets slow                                                                                                                                            |
| ------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Submit**: `POST .../generations/tasks`                  | A task ID, `{"id": "cgt-..."}`         | About a second for text-to-video; grows with media size when media is attached | Your media has to travel upstream to APIYI, then be forwarded to Volcengine and decoded and validated there — the task ID only comes back after all of that |
| **2. Generate**: poll `GET .../tasks/{id}` until `succeeded` | The finished clip, `content.video_url` | Usually **2–5 minutes** (longer for 1080p or long durations)                   | Provider-side queueing and inference — this is normal speed                                                                                                 |

**The two phases are independent.** "Submission took 60 seconds" and "generation took 5 minutes" are two different problems, so identify which one is slow before changing anything. The duration column in the console log is **time to first byte**, which corresponds to phase 1 — not the total time to produce a clip. See [Console duration vs. client wait time](/en/faq/log-duration-vs-client-wait).

<Warning>
  **A common misdiagnosis**: setting a 60-second read timeout on an image-carrying request, then treating the timeout as "the service is down" and immediately resending. In reality the media was still in transit — resending just uploads the same payload again, competes for the same uplink bandwidth, and may create and bill a duplicate task.
</Warning>

## Three ways to pass media, compared

For the same image, the three options behave very differently at submission time:

| Method                        | Request body size                                                                         | Time to get a task ID                                                                     | Main risk                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Base64 / data URL, inline** | Same order of magnitude as the file, plus roughly a third for encoding — often several MB | Grows linearly with size and **your uplink bandwidth**, and stacks across multiple images | Client read timeouts; every retry re-uploads the entire payload                                 |
| **Public URL**                | Tiny, but the upstream has to fetch the file on the spot                                  | Depends on **how fast your host serves the file** and how large it is                     | A slow, rate-limited, auth-protected, or cross-region host stretches this out or fails outright |
| **`asset://` asset ID**       | A few dozen bytes                                                                         | Same order as plain text-to-video                                                         | Requires one ingest step up front                                                               |

Neither of the first two is determined by the model or by inference: **they are governed by bandwidth at both ends and by file size, which makes them both slow and unpredictable** — the same code can take 8 seconds today and 90 seconds tomorrow. An `asset://` reference moves that cost **once, up front**, to the ingest step; every generation after that sends only a short string.

## Asset-first is not only faster

<CardGroup cols={2}>
  <Card title="Submission time decoupled from file size" icon="gauge">
    The request body is just a prompt and an asset ID, so create-task latency returns to text-to-video levels and a 30–60 second client timeout is plenty.
  </Card>

  <Card title="Retries cost almost nothing" icon="rotate-ccw">
    Re-running with a different prompt, aspect ratio, or duration resends a few dozen bytes instead of several megabytes of media.
  </Card>

  <Card title="Content checks happen earlier" icon="shield-check">
    Media is validated at **ingest** time and polled to `Active`, so anything non-compliant surfaces right there instead of failing a generation task halfway through.
  </Card>

  <Card title="Assets are reusable" icon="repeat">
    Ingest once and reuse indefinitely — referencing the same asset ID across shots and episodes also gives better character consistency.
  </Card>
</CardGroup>

One case is a **hard requirement** rather than an optimization: media containing photorealistic human faces cannot be passed as a direct reference image (deepfake protection), so it must be ingested and referenced as `asset://`. See the [Asset Library](/en/api-capabilities/seedance2/asset-library).

## Migrating in three steps

<Steps>
  <Step title="Ingest the media and get an asset ID">
    Upload through the web UI with no code, or batch-ingest through the API — both paths share the same library. See the [Asset Library](/en/api-capabilities/seedance2/asset-library). Poll until the status is `Active` (about 13 seconds for a single image) and the asset is ready to use.

    The asset library is **free with the Seedance API — no annual fee**.
  </Step>

  <Step title="Swap the inline data for asset:// in the generation request">
    The `content` structure, the `role` values, and every other parameter stay the same. Only the value of `image_url.url` changes, from a data URL to `asset://<Id>`. Refer to media in the prompt as "image 1", "image 2" in the order you passed them — **do not write the asset ID into the prompt text**.
  </Step>

  <Step title="Store the asset ID in your own database">
    Asset IDs are long-lived, so never upload the same file twice. Keep a mapping from your local media to its asset ID and read from that on every subsequent generation.
  </Step>
</Steps>

Before and after differ by exactly one field value:

```json Before: the whole image inline, request body several MB theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "The person in image 1 smiles at the camera, slow push-in" },
    { "type": "image_url",
      "image_url": { "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg... (millions of characters)" },
      "role": "reference_image" }
  ],
  "ratio": "adaptive", "duration": 5, "resolution": "720p"
}
```

```json After: request body a few hundred bytes, task ID returns immediately theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    { "type": "text", "text": "The person in image 1 smiles at the camera, slow push-in" },
    { "type": "image_url",
      "image_url": { "url": "asset://asset-2026090200000000-abcde" },
      "role": "reference_image" }
  ],
  "ratio": "adaptive", "duration": 5, "resolution": "720p"
}
```

For a complete runnable script (upload, ingest, generate, download) see the [Asset Reference Guide](/en/api-capabilities/seedance2/asset-reference).

## What about first/last frame jobs?

First/last frame (`role: "first_frame"` / `"last_frame"`) and multi-modal reference (`role: "reference_image"`) are **mutually exclusive input modes** with different semantics, so do not swap one for the other blindly:

* **If you genuinely need exact start and end frames** — for example to butt-join seamlessly against a previous clip — stay in first/last frame mode and replace the inline data URL with a **public URL**. The request body drops from megabytes to a few hundred bytes immediately, and the remaining fetch cost moves upstream. Host the images somewhere fast, unauthenticated, and well-provisioned.
* **If what you actually need is a consistent character or scene** and the boundary frames do not have to match pixel for pixel, switch to **multi-modal reference generation** with an `asset://` asset ID. That is the most reliable path and the one this page recommends.

<Tip>
  To chain clips into a longer video you do not need to extract the final frame yourself: pass `return_last_frame: true` and you get a watermark-free last-frame png to use as the first frame of the next task.
</Tip>

## Reference video and audio

A reference video (`role: "reference_video"`) is an order of magnitude larger than an image, which makes **inline Base64 the single most likely cause of a submission timeout**. Avoid it:

* **Prefer a public URL**, hosted somewhere fast, unauthenticated, and well-provisioned.
* Verified-person asset groups accept video and audio ingest (video: mp4 / mov, 2–15 seconds, under 50MB; audio: mp3 / wav, 2–15 seconds, under 15MB) through the identity-verification flow in the [Asset Library](/en/api-capabilities/seedance2/asset-library).
* Worth noting: tasks with a reference video hit the **lower price tier** — \$7.56 per million tokens with video input versus \$12.60 without. See [Model pricing in the overview](/en/api-capabilities/seedance2/overview).

## What to do after a timeout

When the create-task POST times out, **the client cannot tell whether the task was created**: no response headers arrived, so there is no task ID to query. Work through it in this order:

<Steps>
  <Step title="Check for a record before resending anything">
    Look up that moment in the APIYI console logs or billing. **If a record exists, the task was created and billed** — the task ID is in the record, so poll it directly. Only the absence of a record means the request never completed. Blind resending creates and bills duplicate tasks.
  </Step>

  <Step title="Change the read timeout and the media method together">
    Raising the read timeout alone only treats the symptom. Once you are on `asset://`, a **30–60 second** timeout on the create request is plenty — the async endpoint itself is fast, and the real work happens on the task side. If you must keep inlining large media, set the connect timeout and the read timeout **separately**, and size the read timeout from your file sizes and uplink bandwidth.
  </Step>

  <Step title="Reduce concurrency before investigating further">
    Several concurrent create requests carrying large media compete for the same uplink, which shows up as every request timing out right at your timeout value. Get a single request working first, then raise concurrency gradually.
  </Step>

  <Step title="Check your Base URL">
    Different Base URLs take different network paths, and large uploads can behave differently across them. Measure submission time against each available endpoint from your own server and keep the fastest. See [Base URL configuration](/en/faq/base-url-config) for the endpoint list and how to choose.
  </Step>
</Steps>

For general timeout troubleshooting — how large a client timeout should be and how to isolate the layer at fault — see [How to avoid API timeouts](/en/faq/timeout-configuration).

## FAQ

<AccordionGroup>
  <Accordion title="Does text-to-video need the asset library too?">
    No. With no media attached the request body is just a prompt, the create-task endpoint returns a task ID in about a second, and none of this applies.
  </Accordion>

  <Accordion title="How long does ingest itself take? Isn't this just moving the cost around?">
    A single image takes about 13 seconds to preprocess and reach `Active` — fully automatic, with no manual review.

    The point is that **it happens once**. The same asset can then be referenced indefinitely, whereas inline upload repeats the whole transfer on **every** generation. The more clips you produce, the wider the gap.
  </Accordion>

  <Accordion title="Do asset IDs expire?">
    No. Asset IDs stay usable long-term, unlike the finished-clip URL. Assets are scoped to your icover.ai account, so you only ever see and use your own.
  </Accordion>

  <Accordion title="Does the asset library cost extra?">
    No. It is **free with the Seedance API — no annual fee**. Volcengine's own private asset library is a separately purchased add-on for customers without a framework agreement, at a six-figure CNY annual contract.
  </Accordion>

  <Accordion title="How long does the generated video URL stay valid?">
    `content.video_url` is a signed direct link valid for **24 hours**. Copy the file into your own storage as soon as the task succeeds, and do not hand that URL out as a permanent address.
  </Accordion>

  <Accordion title="Is the asset library KEY the same as the Seedance token?">
    No — two keys, do not mix them up. The **asset library KEY** is created on icover.ai and is only for uploading, ingesting, and querying assets. The **APIYI Seedance video token** is created on api.apiyi.com, needs the `SeeDance2` group selected, and is only for the video generation API.
  </Accordion>
</AccordionGroup>

## Related pages

<CardGroup cols={3}>
  <Card title="Asset Library" icon="images" href="/en/api-capabilities/seedance2/asset-library">
    Every asset library endpoint, the zero-code web UI, and identity verification
  </Card>

  <Card title="Asset Reference Guide" icon="clapperboard" href="/en/api-capabilities/seedance2/asset-reference">
    End-to-end runnable scripts from upload and ingest through download
  </Card>

  <Card title="Seedance 2.0 / 2.5 Overview" icon="sparkles" href="/en/api-capabilities/seedance2/overview">
    Model selection, pricing, resolution tables, and FAQ
  </Card>
</CardGroup>
