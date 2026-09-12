> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-image-2-vip 'Unknown error' tip: compress each input image to under 1.5MB

> Sporadic Unknown error / shell_api_error responses on gpt-image-2-vip are usually triggered by oversized input images. Compress each uploaded image to under 1.5MB before calling. Output dimensions are governed by your size parameter and are not bounded by input size.

**2026/5/8 23:26 (UTC+8)** · Model Status · OpenAI

💡 **gpt-image-2-vip 'Unknown error' debugging tip: keep each input image under 1.5MB** — Sporadic `shell_api_error` / `Unknown error` responses are most often caused by oversized input images. Compress each image you upload to the endpoint to **under 1.5MB** before sending; in multi-image fusion, apply the same cap per image. Output dimensions are controlled by the `size` parameter and are **not bounded by input size** — shrinking the input only improves request success rate, it does not affect output sharpness.

📋 **Sample error log**:

```text theme={null}
An error occurred while processing your request. You can retry your request,
or contact us through our help center at help.openai.com if the error persists.
Please include the request ID fc6c3693-4f7b-46aa-a493-88b48f789e4d in your message.
（traceid: d7716a02769ead1890b90074670b7c99）
(request id: 2026050822473732782809166920955)

"localized_message":"Unknown error","type":"shell_api_error","param":"","code":null
```

If you hit this error, compress the image client-side first (JPEG quality 80–90 / down-sized resolution) and retry — that usually resolves it.

📖 Official-relay vs reverse: [/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [Back to Live Updates](/en/live) · 📚 [Archive](/en/live/archive)
