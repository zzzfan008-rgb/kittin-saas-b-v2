> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How to fix the image content does not match MIME type error?

> If the image URL ends with an x-oss-process (or similar CDN processing) parameter, this error is triggered. Strip the parameter or use the raw direct link.

## Short answer

When the image URL passed to the API ends with a cloud-storage processing parameter such as `?x-oss-process=...`, the API returns the “image content does not match MIME type” error.

To fix it, strip the processing parameter from the URL and pass the raw direct link to the API, or download and reprocess the image on your own server before uploading it.

## What does the error look like?

The error response is:

```json theme={null}
{
  "error": {
    "message": "decode image: image content does not match MIME type 'image/png'",
    "type": "invalid_request_error",
    "code": 429
  }
}
```

A typical triggering URL looks like:

```text theme={null}
https://oss.fzputi.com/tools/aiCraft/...jpg?x-oss-process=image/resize,w_800
```

The `?x-oss-process=...` suffix is the image-processing parameter used by Alibaba Cloud OSS and similar object-storage services. Image generation endpoints on APIYI are known to return the error above when URLs contain this kind of parameter.

## Known affected parameter names

The following parameter name has been reported to trigger this error when present on an image URL:

* `x-oss-process`

If you use image-processing parameters from other cloud-storage providers (such as the equivalent parameters on Tencent Cloud COS or Huawei Cloud OBS), follow the same steps below before passing the URL to the API.

## Steps to fix it

<Steps>
  <Step title="Strip the processing parameter from the URL">
    Copy the raw direct link of the image (without any `?x-oss-process=`-style parameter) and pass it to the API again.

    For example, change:

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg?x-oss-process=image/resize,w_800
    ```

    to:

    ```text theme={null}
    https://oss.fzputi.com/abc.jpg
    ```
  </Step>

  <Step title="If you need size adjustment, process the image on your server first">
    If your workflow actually depends on OSS-side compression or cropping, first download the processed image from your bucket to local storage, then upload it via local path or a new parameter-free direct link.
  </Step>
</Steps>

## Notes

<Warning>
  Keep image URLs passed to the API as plain direct links with no trailing parameters, otherwise this error may be triggered.
</Warning>

## If it still does not work

* Confirm the URL can be opened directly in a browser, and that the real image format shown by the browser (right-click → inspect) matches the URL extension (jpg / png / webp)
* If you are using an image-processing parameter from a different cloud-storage provider, contact technical support with the full error JSON and the request ID

## Related documentation

* [Is there an async image API? Can I query results by task ID?](/en/faq/image-async-api)
* [Why does the generated image differ greatly from the reference?](/en/faq/image-result-differs-from-reference)
