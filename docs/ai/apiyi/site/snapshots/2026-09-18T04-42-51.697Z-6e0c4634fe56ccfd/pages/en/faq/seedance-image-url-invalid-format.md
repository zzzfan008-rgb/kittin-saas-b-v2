> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance Says invalid image format, but the Link Opens in a Browser

> Your Seedance image link opens fine in a browser, yet task submission returns 400 invalid image format. The link is built for one download in a browser, not for server-side fetching: it rejects Range requests, caps the number of downloads, or expires too soon. This page shows how to check a link and how to choose between a public URL, an asset ID, and Base64.

## Short Answer

What the provider received was not an image but an error response from your server. A link that opens in a browser only proves that **one browser download** works. It does not prove that **the provider's servers can fetch it**.

The typical error comes back as a 400 at submission time, and no task is created:

```text theme={null}
The parameter `content[1]` specified in the request is not valid:
invalid image format (detected format); received: "".
```

`received: ""` means the provider could not detect any image format in what it downloaded.

**The simplest fix**: host the image on a regular object storage bucket or CDN and pass a plain public URL, such as `https://cdn.example.com/xxx.png`.

## A Real Case

A customer's first-frame image link looked like this:

```text theme={null}
https://<customer-domain>/api/v1/resource-download-grants/<file-id>/content?access_token=<signed token with an expiry>
```

The image displayed fine in a browser, but submitting the Seedance task returned the 400 above. We tested the link:

| Test                                                             | Result                                             |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| Plain GET (same as a browser)                                    | 200, returns a PNG image                           |
| GET with a `Range` header, asking for the first part of the file | **416**, returns a JSON error instead of the image |
| After about 10 downloads in a row                                | **429**, download grant exhausted                  |
| Same image submitted as Base64                                   | **Succeeded** and produced the video               |

The last row shows that the image and the request parameters were fine. Only the link was the problem.

## Why Links Like This Exist

This is not an image address. It is an **application endpoint**: private user files live on the backend, and whenever one is needed, the app issues a temporary download grant carrying an expiry, a signature, and a download cap. This is a common way to protect private files. A leaked link stops working soon and after a few uses, and every download can be audited.

The design assumes **one person downloading once in a browser**. It breaks when a server fetches the file instead:

* **No Range support**: many services fetch media by first requesting the opening bytes with a `Range` header to detect the format, or by downloading in chunks. Endpoints like this only return the whole file and answer a Range request with an error
* **Download cap**: when the provider fetches media, it may probe, download, and retry on failure, so it will not necessarily download just once. Once the cap is used up, the response is an error JSON
* **Short expiry**: once the link expires, the response is not an image either

A public URL on object storage or a CDN (R2, S3, OSS, TOS, and so on) has none of these limits. It points straight at a static file, supports Range, has no download cap, and needs no extra headers or cookies.

## Choosing How to Pass the Image

| Method                                 | When to use it                                                                 | Notes                                                                                                                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public URL** (preferred)             | Images used once                                                               | Tiny request body. The provider's servers fetch the file directly, and they have more capacity and bandwidth. The link must pass the checks below                                                                                         |
| **Asset ID** `asset://...`             | The same image is referenced repeatedly, or it contains a realistic human face | Upload it once, then pass only a short string every time. See [Asset-First Workflow](/en/api-capabilities/seedance2/asset-first-workflow)                                                                                                 |
| **Base64** `data:image/png;base64,...` | Fallback when no suitable public URL is available                              | Encoding adds about a third to the size, and all of it is uploaded from your machine, which noticeably slows submission. In one test, a 2.3 MB PNG became a 3.1 MB request body, and the create-task call took about 60 seconds to return |

If your files sit behind this kind of download-grant endpoint, produce a different link before submitting:

* If the file is already in object storage (OSS, S3, R2, and so on), generate a **presigned URL** from the storage service and set its expiry to at least 1 hour. Presigned URLs expire by time only, have no download cap, and support Range
* Otherwise, copy the image to a public object storage bucket or CDN and pass the new URL to Seedance

## Checking a Link Before Submitting

Run these two commands on any machine with internet access. Replace `<URL>` with your image link and keep it in single quotes so the shell does not interpret `&`:

```bash theme={null}
# 1. Plain download: expect 200 and an image Content-Type such as image/png or image/jpeg
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type} size=%{size_download}\n' '<URL>'

# 2. Range download: expect 206 (or 200 with the full image), never a 4xx
curl -s -o /dev/null -w 'code=%{http_code} type=%{content_type}\n' -H 'Range: bytes=0-1023' '<URL>'
```

Also confirm that:

* Both commands return an image, not JSON or HTML
* Repeated downloads keep working, with no download cap
* No cookie, login session, or extra header is required
* The link stays valid at least until submission completes, ideally for 1 hour or more
* The link is reachable from the public internet, not behind an intranet or an IP allowlist

<Warning>
  Checking a download-capped link uses up downloads too. Test with a separately issued link so you do not exhaust the one you plan to submit.
</Warning>

## Related Docs

<CardGroup cols={2}>
  <Card title="Video Generation API" icon="video" href="/en/api-capabilities/seedance2/video-generation">
    The three ways to pass images and every request parameter
  </Card>

  <Card title="Asset-First Workflow" icon="gauge" href="/en/api-capabilities/seedance2/asset-first-workflow">
    Submission-time comparison of the three methods and how to upload assets
  </Card>
</CardGroup>
