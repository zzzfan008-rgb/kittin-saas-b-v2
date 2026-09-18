> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Asset-Referenced Video Generation in Code

> End-to-end code guide for Seedance 2.0 asset references: upload a local image, ingest it to get an asset:// ID, reference it to generate character-consistent videos, and poll and download — complete Python / cURL / Node.js scripts.

<Info>
  This page focuses on the **code path**: turn a local image into an `asset://` asset ID, then reference it to generate a character-consistent video — one script, end to end. For endpoint-by-endpoint documentation and the zero-code web UI see the [Asset Library](/en/api-capabilities/seedance2/asset-library); for the full parameter table of the generation endpoint see the [Video Generation API](/en/api-capabilities/seedance2/video-generation).

  The asset library is **free with the Seedance 2.0 API — no annual fee** (officially a separately purchased add-on: a six-figure CNY annual contract for customers without a framework agreement).
</Info>

## When you need asset references

When generating character-consistent videos, Seedance 2.0 **does not accept reference images containing photorealistic human faces directly** (anti-deepfake filtering). You must first ingest the portrait as a trusted asset, get an `asset://xxx` asset ID, and reference it in the generation request — keeping the character's face and clothing consistent across episodes and shots. Find your case first:

| Material type                                         | Examples                                              | How to use                                                                                                                                                                           |
| ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anime / stylized characters                           | Anime, cartoon, 3D-cartoon characters                 | No photorealistic face, generally not blocked: use a public URL / Base64 reference image directly — **no ingest needed**; start from step 4 (generate) of this page                  |
| Virtual avatar (AI-generated photorealistic portrait) | Model-generated, no such person exists                | Use virtual-avatar ingest (the full flow on this page) and reference the `asset://` ID                                                                                               |
| Real face                                             | Photos of celebrities, models, or the user themselves | First run the fully automated real-person verification API flow to get a real-person asset group, pass its `groupId` when ingesting — the rest of the code is identical to this page |

## Prerequisites

<Warning>
  **Two different keys — do not mix them up**:

  * **Asset Library KEY** (created under Settings → Asset Library KEY on icover.ai, `sk-...`): for uploading / ingesting / querying assets; see [Step 0 of the Asset Library page](/en/api-capabilities/seedance2/asset-library).
  * **APIYI Seedance video token** (created on api.apiyi.com, `sk-...`, with the `SeeDance2` group enabled, shared by 2.5 and the 2.0 family): for the video-generation endpoint.
</Warning>

## The pipeline at a glance

Local image → 1) `presign` a direct-upload URL and `PUT` the file to get a public URL → 2) ingest the asset and get an asset Id → 3) poll until `Active` (about 13 seconds per image) → 4) reference `asset://<Id>` in the generation request, referring to it as "Image 1" in the prompt → 5) poll the task until `succeeded` → 6) download `content.video_url` (the signed link **expires in 24 hours** — save it immediately).

If you already have a public image URL, skip step 1. Asset IDs are permanent — ingest once, reference forever.

## Complete code

<CodeGroup>
  ```python Python (end to end: upload → ingest → generate → download) theme={null}
  import time
  from pathlib import Path

  import requests

  ASSET_KEY = "sk-your-asset-library-KEY"  # icover.ai Settings → Asset Library KEY
  APIYI_KEY = "sk-your-APIYI-token"        # api.apiyi.com: token needs the SeeDance2 group
  IMAGE_PATH = "portrait.jpg"              # local reference image (virtual avatar)
  PROMPT = "The character in Image 1 smiles at the camera, slow push-in, natural light"

  ICOVER = "https://icover.ai/api"
  SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
  ASSET_HEADERS = {"Authorization": f"Bearer {ASSET_KEY}"}
  APIYI_HEADERS = {
      "Authorization": f"Bearer {APIYI_KEY}",
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",  # required: works around a gateway gzip header mismatch
  }


  def upload_image(path: str) -> str:
      """1) presign + PUT the local image; returns a public URL (skip if you have one)"""
      ext = Path(path).suffix.lstrip(".").lower() or "jpg"
      content_type = f"image/{'jpeg' if ext in ('jpg', 'jpeg') else ext}"
      data = requests.post(
          f"{ICOVER}/storage/presign", headers=ASSET_HEADERS,
          json={"ext": ext, "contentType": content_type}, timeout=30,
      ).json()["data"]
      resp = requests.put(
          data["uploadUrl"], data=Path(path).read_bytes(),
          headers={"Content-Type": content_type}, timeout=120,  # must match the presign
      )
      resp.raise_for_status()
      return data["publicUrl"]


  def ingest_asset(image_url: str, label: str = "", group_id: str = None) -> str:
      """2) ingest the asset; returns the asset Id. Real-person assets: pass the verified group_id"""
      body = {"imageUrl": image_url, "label": label}
      if group_id:
          body["groupId"] = group_id
      r = requests.post(
          f"{ICOVER}/asset-library/assets", headers=ASSET_HEADERS,
          json=body, timeout=60,
      ).json()
      return r["Result"]["Id"]


  def wait_asset_active(asset_id: str, timeout: int = 90) -> None:
      """3) poll the ingest status until Active (about 13 seconds per image, no SLA)"""
      deadline = time.time() + timeout
      while time.time() < deadline:
          status = requests.get(
              f"{ICOVER}/asset-library/assets/{asset_id}",
              headers=ASSET_HEADERS, timeout=30,
          ).json()["Result"]["Status"]
          print("asset status:", status)
          if status == "Active":
              return
          if status == "Failed":
              raise RuntimeError("Ingest failed: check format / aspect ratio 0.4-2.5 / side 300-6000px, then re-upload")
          time.sleep(3)
      raise TimeoutError("Not Active after 90 seconds — investigate and retry")


  def create_video_task(asset_id: str) -> str:
      """4) create the generation task referencing asset://. Say "Image 1" in the prompt, never the raw asset ID"""
      body = {
          "model": "doubao-seedance-2-0-260128",
          "content": [
              {"type": "text", "text": PROMPT},
              {"type": "image_url",
               "image_url": {"url": f"asset://{asset_id}"},
               "role": "reference_image"},
          ],
          "resolution": "720p", "ratio": "16:9", "duration": 5,
      }
      return requests.post(SEEDANCE, headers=APIYI_HEADERS, json=body, timeout=60).json()["id"]


  def wait_video(task_id: str) -> dict:
      """5) poll the task until a terminal state (succeeded / failed / expired)"""
      while True:
          time.sleep(20)
          task = requests.get(f"{SEEDANCE}/{task_id}", headers=APIYI_HEADERS, timeout=30).json()
          print("task status:", task.get("status"))
          if task.get("status") in ("succeeded", "failed", "expired"):
              return task


  def download(task: dict, out: str) -> None:
      """6) download the video. The signed link expires in 24 hours; no Authorization header here"""
      with requests.get(task["content"]["video_url"], stream=True, timeout=300) as r:
          r.raise_for_status()
          with open(out, "wb") as f:
              for chunk in r.iter_content(chunk_size=1 << 20):
                  f.write(chunk)
      print("saved", out)


  if __name__ == "__main__":
      public_url = upload_image(IMAGE_PATH)
      asset_id = ingest_asset(public_url, label="character-A-front")
      print("asset ID:", f"asset://{asset_id}")
      wait_asset_active(asset_id)

      task_id = create_video_task(asset_id)
      print("task_id:", task_id)
      task = wait_video(task_id)
      if task["status"] == "succeeded":
          print("billed tokens:", task["usage"]["completion_tokens"])
          download(task, f"{task_id}.mp4")
      else:
          print("task did not succeed:", task.get("error"))
  ```

  ```bash cURL (step by step) theme={null}
  # 1) Request a presigned upload URL (skip 1-2 if you already have a public image URL)
  curl -X POST https://icover.ai/api/storage/presign \
    -H "Authorization: Bearer sk-your-asset-library-KEY" \
    -H "Content-Type: application/json" \
    -d '{"ext":"jpg","contentType":"image/jpeg"}'
  # → { "code":0, "data": { "uploadUrl":"...", "publicUrl":"https://cdn.icover.ai/..." } }

  # 2) PUT the file (Content-Type must match the presign); publicUrl is then your public address
  curl -X PUT "the-uploadUrl-you-just-received" \
    -H "Content-Type: image/jpeg" \
    --data-binary @portrait.jpg

  # 3) Ingest the asset (real-person assets: add "groupId":"the-verified-group-ID")
  curl -X POST https://icover.ai/api/asset-library/assets \
    -H "Authorization: Bearer sk-your-asset-library-KEY" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://cdn.icover.ai/uploads/seedance/xxx.jpg","label":"character-A-front"}'
  # → { ..., "Result": { "Id": "asset-2026xxxx-xxxxx" } }

  # 4) Poll every 3 seconds until Result.Status == "Active"
  curl https://icover.ai/api/asset-library/assets/asset-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-your-asset-library-KEY"

  # 5) Create the generation task referencing asset:// (switch to your APIYI token!
  #    Refer to the asset as "Image 1" in the prompt)
  curl -X POST https://api.apiyi.com/seedance/api/v3/contents/generations/tasks \
    -H "Authorization: Bearer sk-your-APIYI-token" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "doubao-seedance-2-0-260128",
      "content": [
        {"type":"text","text":"The character in Image 1 smiles at the camera, slow push-in, natural light"},
        {"type":"image_url","image_url":{"url":"asset://asset-2026xxxx-xxxxx"},"role":"reference_image"}
      ],
      "resolution":"720p","ratio":"16:9","duration":5
    }'
  # → {"id":"cgt-2026xxxx-xxxxx"}

  # 6) Poll every 20 seconds; once status=succeeded, download content.video_url (expires in 24h)
  curl https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/cgt-2026xxxx-xxxxx \
    -H "Authorization: Bearer sk-your-APIYI-token"
  ```

  ```javascript Node.js (end to end) theme={null}
  import { readFileSync, writeFileSync } from "node:fs";

  const ASSET_KEY = "sk-your-asset-library-KEY"; // icover.ai Settings → Asset Library KEY
  const APIYI_KEY = "sk-your-APIYI-token";       // api.apiyi.com: token needs the SeeDance2 group
  const IMAGE_PATH = "portrait.jpg";

  const ICOVER = "https://icover.ai/api";
  const SEEDANCE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks";
  const AH = { Authorization: `Bearer ${ASSET_KEY}`, "Content-Type": "application/json" };
  const VH = { Authorization: `Bearer ${APIYI_KEY}`, "Content-Type": "application/json" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 1) presign + PUT the local image to get a public URL
  const { data } = await fetch(`${ICOVER}/storage/presign`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ ext: "jpg", contentType: "image/jpeg" }),
  }).then((r) => r.json());
  await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: readFileSync(IMAGE_PATH),
  });

  // 2) Ingest the asset (real-person assets: add groupId to the body)
  const ingest = await fetch(`${ICOVER}/asset-library/assets`, {
    method: "POST", headers: AH,
    body: JSON.stringify({ imageUrl: data.publicUrl, label: "character-A-front" }),
  }).then((r) => r.json());
  const assetId = ingest.Result.Id;
  console.log("asset ID:", `asset://${assetId}`);

  // 3) Poll until Active (about 13 seconds)
  let assetStatus;
  do {
    await sleep(3000);
    const info = await fetch(`${ICOVER}/asset-library/assets/${assetId}`, { headers: AH })
      .then((r) => r.json());
    assetStatus = info.Result.Status;
    console.log("asset status:", assetStatus);
  } while (assetStatus !== "Active" && assetStatus !== "Failed");
  if (assetStatus === "Failed") throw new Error("Ingest failed — check the image and re-upload");

  // 4) Create the generation task referencing asset://
  //    (say "Image 1" in the prompt, never the raw asset ID)
  const { id } = await fetch(SEEDANCE, {
    method: "POST", headers: VH,
    body: JSON.stringify({
      model: "doubao-seedance-2-0-260128",
      content: [
        { type: "text", text: "The character in Image 1 smiles at the camera, slow push-in, natural light" },
        { type: "image_url", image_url: { url: `asset://${assetId}` }, role: "reference_image" },
      ],
      resolution: "720p", ratio: "16:9", duration: 5,
    }),
  }).then((r) => r.json());
  console.log("task_id:", id);

  // 5) Poll the task until a terminal state
  let task;
  do {
    await sleep(20000);
    task = await fetch(`${SEEDANCE}/${id}`, { headers: VH }).then((r) => r.json());
    console.log("task status:", task.status);
  } while (!["succeeded", "failed", "expired"].includes(task.status));

  // 6) Download (the signed link expires in 24 hours; no Authorization header here)
  if (task.status === "succeeded") {
    const buf = Buffer.from(await fetch(task.content.video_url).then((r) => r.arrayBuffer()));
    writeFileSync(`${id}.mp4`, buf);
    console.log(`saved ${id}.mp4`);
  } else {
    console.log("task did not succeed:", task.error);
  }
  ```
</CodeGroup>

<Warning>
  Refer to assets as "Image 1", "Image 2" in the prompt (matching their order in the `content` array) — **never write the raw asset ID in the prompt**.
</Warning>

## Advanced usage with multiple assets

* **Multiple reference images**: put several `image_url` items in `content` (0–9 images, each with `role: "reference_image"`) and refer to them as "Image 1", "Image 2" in order. For one character, referencing a full-body frontal shot plus a neutral frontal face close-up together gives the best consistency.
* **Mixing sources**: `asset://` IDs, public URLs, and Base64 (`data:image/png;base64,...`) can be mixed in the same `content` array — only images containing photorealistic faces must go through `asset://`.
* **Reference video / audio**: you can also add 0–3 `video_url` items (`role: "reference_video"`) and 0–3 `audio_url` items (`role: "reference_audio"`); at least one image or one video is required, and audio must be sent together with an image or video.
* **Real-person assets**: first run the [fully automated real-person verification flow](/en/api-capabilities/seedance2/asset-library) — the actor completes liveness verification and you get a dedicated real-person asset group `GroupId`; pass it as `groupId` when ingesting. The generation-side code is identical to this page.

## Common errors

| Error / symptom                                      | Cause                                                                                                                      | Fix                                                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 400 `The specified asset ... is not found`           | The `asset://` ID does not belong to the APIYI channel's account (e.g. ingested with another provider), or the ID is wrong | Re-ingest on icover.ai following this page; double-check the asset ID                                   |
| "No available channel for this model"                | The APIYI token is missing the `SeeDance2` group                                                                           | Enable it in the token settings on api.apiyi.com and retry                                              |
| Python gzip decoding error / truncated non-JSON body | The gateway's gzip response header does not match the actual encoding                                                      | Add the `"Accept-Encoding": "identity"` request header (already in the script)                          |
| Asset status `Failed`                                | Image format / dimensions out of spec                                                                                      | Aspect ratio 0.4–2.5, side length 300–6000px, under 30MB — fix and re-upload                            |
| Direct face image rejected                           | Photorealistic faces cannot be used as direct reference images (anti-deepfake filtering)                                   | Ingest first and reference the `asset://` ID; real-person photos require real-person verification first |
| Errors prefixed with `PUBLIC_`                       | Blocked by upstream content moderation (that attempt is not billed)                                                        | Adjust the material / prompt and simply retry                                                           |

## Related pages

<CardGroup cols={3}>
  <Card title="Seedance 2.0 Overview" icon="sparkles" href="/en/api-capabilities/seedance2/overview">
    Model selection, pricing, resolution tables, and FAQ
  </Card>

  <Card title="Video Generation API" icon="video" href="/en/api-capabilities/seedance2/video-generation">
    Full parameter table, the four generation modes, and response format
  </Card>

  <Card title="Asset Library" icon="images" href="/en/api-capabilities/seedance2/asset-library">
    All asset-library endpoints, the zero-code web UI, and real-person verification
  </Card>

  <Card title="Asset-First Workflow" icon="gauge" href="/en/api-capabilities/seedance2/asset-first-workflow">
    Why an asset ID beats an inline image on speed and reliability, and how to handle submission timeouts
  </Card>
</CardGroup>
