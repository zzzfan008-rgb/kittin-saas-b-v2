> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance Says First/Last Frame Cannot Be Mixed with Reference Media

> Seedance returns 400: first/last frame content cannot be mixed with reference media content, even though you never turned on first/last frame mode. The image in the request has no role, so it is treated as a first frame, and a first frame cannot sit next to a reference video. This mostly happens with third-party tools that submit through the generic /v2/videos/generations endpoint. This page shows how to switch to the native endpoint, how to set role, and how to pass reference videos.

## Short Answer

**Seedance only reads the `role` of each item in the request.** It does not see which switches you ticked in your tool, and it does not read your prompt for this. An image without a `role` is treated as a first frame (image-to-video). Add a reference video to that, and the request becomes "first frame + reference media", which the provider rejects.

The typical error comes back as a 400 at submission time. No task is created and nothing is billed:

```text theme={null}
The parameter `content` specified in the request is not valid:
first/last frame content cannot be mixed with reference media content.
```

**The fix**: submit through the native Seedance endpoint `POST /seedance/api/v3/contents/generations/tasks`, set `"role": "reference_image"` on images and `"role": "reference_video"` on videos, and pass the video as a public URL the provider can download directly, or register it in the asset library and reference it as `asset://`.

## A Real Case

A customer was using a local creative tool they had built. They passed one character image and one video, ticked "omni reference", left "first/last frame" unticked, and even wrote "image 1 is not the first frame, do not use first/last frame mode" in the prompt. Every run still failed with the error above.

We captured the raw request on the gateway side (image Base64 truncated):

```json theme={null}
{
  "model": "doubao-seedance-2-0-260128",
  "prompt": "Replace the person in video 1 with the character in image 1 ... (image 1 is not the first frame) ... do not use first/last frame mode",
  "duration": 14,
  "ratio": "9:16",
  "resolution": "720p",
  "images": ["data:image/jpeg;base64,/9j/4AAQ..."],
  "videos": ["/assets/input/ai_ref_xxxx.mp4"]
}
```

The request has two problems. Either one is enough to make it fail:

| Problem | Explanation |
| - | - |
| **The image has no `role`** | The request went to the generic video endpoint `/v2/videos/generations`, which only has `images` and `videos` arrays and no field that can say "this is a reference image". A single image is a first frame by rule, which conflicts with the reference video. The tool's "omni reference" switch never made it into the request, and prompt text has no effect on parameter validation |
| **The video is a local path** | `/assets/input/ai_ref_xxxx.mp4` is a path inside the tool on the customer's own computer. The provider's servers cannot reach it, so even with the first-frame problem fixed, the video would never reach the model |

The customer's browser console also showed `415 Unsupported Media Type` for the same mp4, coming from the tool's own local preview endpoint (`/api/media-preview/...` on `localhost`). The tool had failed to turn the video into a usable address and put the local path into the request as-is.

## Do Not Submit Seedance Through the Generic Video Endpoints

`/v2/videos/generations` (and `/v1/videos`, `/v1/video/generations`) are the gateway's generic video endpoints. Their fields are the common subset shared by several video models, and **they cannot express Seedance's input modes**:

* **No `role`**: they cannot tell first frame, first/last frame and multimodal reference apart, so one image plus one video always ends up as "first frame + reference"
* **Resolution is not fully passed through**: in our tests, 2.5 requested at 480p came out at 720p, and the 2.0 series requested at 1080p came out at 720p, while billing follows the resolution actually generated
* **Parameters unique to 2.5** (`omni_reference_task_type`, `output_format`, and so on) have no matching field

So **always use the native endpoints** for Seedance:

| Step | Endpoint |
| - | - |
| Submit a task | `POST /seedance/api/v3/contents/generations/tasks` |
| Query a task | `GET /seedance/api/v3/contents/generations/tasks/{id}` |

If you use a third-party tool, check whether its Seedance channel offers a "native" or "Volcengine Ark" format. A tool that only speaks the generic video API cannot run tasks with a reference video.

## The Right Way: Set role on Every Item

```python theme={null}
import os, requests

BASE = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"
headers = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}

body = {
    "model": "doubao-seedance-2-0-260128",
    "content": [
        {"type": "text", "text": "Replace the person in @video1 with the character in @image1, keeping the motion, expressions and background music unchanged"},
        {"type": "image_url", "image_url": {"url": "https://cdn.example.com/character.png"},
         "role": "reference_image"},
        {"type": "video_url", "video_url": {"url": "https://cdn.example.com/source.mp4"},
         "role": "reference_video"},
    ],
    "resolution": "720p",
    "ratio": "9:16",
    "duration": 10,
}

r = requests.post(BASE, headers=headers, json=body, timeout=60)
print(r.status_code, r.json())   # on success: {"id": "cgt-..."}, then poll with that id
```

Key points:

* **The three input modes are mutually exclusive**: first/last frame (2 images, `first_frame` / `last_frame`), first frame (1 image), and multimodal reference (`reference_image` / `reference_video` / `reference_audio`). As soon as there is a reference video or reference audio, every image must be `reference_image`
* **No `role` means first frame**: a single image without `role` is the same as `first_frame`
* In the prompt, refer to items by the order they were passed in, for example `@image1` and `@video1`
* Reference limits: up to 9 images + 3 videos + 3 audio clips for the 2.0 series, and up to 30 images + 10 videos + 10 audio clips for 2.5

## How to Pass a Reference Video

The provider downloads your media **on its own servers**, so the video must be at an address the provider can reach directly.

| Method | Works? | Notes |
| - | - | - |
| **Public direct URL** (preferred) | ✅ | Host it on object storage or a CDN (OSS, S3, R2, TOS, etc.) with no login, cookie or extra headers required, and keep it valid until the task finishes |
| **Asset ID** `asset://...` | ✅ | Use it when the same video is reused, or when real people appear in it. Assets must be mp4 / mov, 2–15 seconds, under 50MB. See [Asset Library](/en/api-capabilities/seedance2/asset-library) |
| **Base64** | ⚠️ Not recommended | Videos are an order of magnitude larger than images, and inlining one in the request body is the easiest way to make submission time out. See [Asset-First Workflow](/en/api-capabilities/seedance2/asset-first-workflow) |
| A path on your machine (`/assets/...`, `C:\...`, `file://...`) | ❌ | The provider cannot read files on your computer |
| A private network address (`localhost`, `127.0.0.1`, `192.168.x.x`) | ❌ | Same as above |
| A link that needs a login to download | ❌ | The provider does not carry your login session when fetching |

Before submitting, you can check the link from any machine with internet access (replace `<URL>` with your video link):

```bash theme={null}
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type} size=%{size_download}\n' '<URL>'
```

You should see `code=200`, a `type` of `video/mp4` or `video/quicktime`, and a `size` that matches the original file. An HTML page, a JSON body or any 4xx means the provider cannot use that link. For the full link check on images, see [Image Link Opens but Fails](/en/faq/seedance-image-url-invalid-format).

## Related Docs

<CardGroup cols={2}>
  <Card title="Video Generation API" icon="video" href="/en/api-capabilities/seedance2/video-generation">
    The native endpoint, plus the content layout and role values for each input mode
  </Card>

  <Card title="Asset-First Workflow" icon="gauge" href="/en/api-capabilities/seedance2/asset-first-workflow">
    Why reference videos should not be sent as Base64, and how to register assets
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.