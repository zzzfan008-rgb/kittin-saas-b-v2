> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana OSS Group

> Nano Banana OSS (NB-OSS) beta group: image output is a URL instead of Base64, reducing transfer overhead and improving the experience. Best for scenarios where you use URLs directly.

## Background (Read First)

<Info>
  **What it is**: This is a beta group whose image output is a **URL** rather than Base64, which reduces Base64 transfer overhead and improves the customer experience. **Best for scenarios where you use the URL directly.** If you have no special needs and can handle Base64-encoded image output, we still recommend using the "Normal Default Group" or the "NanoBanana Enterprise Group".
</Info>

**Supported models** (Nano Banana Pro and Gen 1):

* `gemini-3-pro-image-preview`
* `gemini-3.1-flash-image-preview`
* `gemini-2.5-flash-image`

## Getting Started

<Steps>
  <Step title="Ask an admin to enable this visible group">
    Contact an admin to enable the NB-OSS visible group for your account (add NB-OSS under "Edit User Info → Extra Visible Groups").

    <Frame caption="Edit User Info: add NB-OSS under Extra Visible Groups">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-contact-admin.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=d4975f7e75786ca3452e99659297f9dc" alt="Edit User Info screen, adding the NB-OSS group under Extra Visible Groups" width="736" height="310" data-path="images/nano-banana-oss-contact-admin.png" />
    </Frame>
  </Step>

  <Step title="Create a token: select the NB-OSS group">
    When creating a token, set the billing model to "per-call billing" and select the **NB-OSS** group (Nano Banana PRO, image output as URL instead of Base64). You only swap the token; the request format stays the same.

    <Frame caption="Create token: set billing model to per-call billing, select the NB-OSS group (1x) — image output as URL instead of Base64">
      <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-create-token.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6ccac2359d775f8c0f9a185884bb6e4a" alt="Create token screen: billing model set to per-call billing, NB-OSS group selected, image output as URL instead of Base64" width="1284" height="886" data-path="images/nano-banana-oss-create-token.png" />
    </Frame>
  </Step>

  <Step title="Swap the token and test">
    Swap in the token and run a test. **Your code needs to handle parsing URL output** — don't simply replace Base64; supporting both works best.
  </Step>
</Steps>

## Example Code

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### Output Example

The image URL is in the `text` field, and the `thoughtSignature` below it is the base64 of the reasoning process.

<Frame caption="Response JSON: candidates → content → parts, the image URL is in the text field; thoughtSignature is the base64 of the reasoning">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-output-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=7c466c969fc59d03a889f31c8b192bcb" alt="Example API response JSON, the text field contains the image URL, the thoughtSignature field is the base64 of the reasoning" width="1200" height="637" data-path="images/nano-banana-oss-output-example.png" />
</Frame>

## OSS Storage Region and Download Speed

### Where Are the Images Stored?

The output image URLs are hosted on **Alibaba Cloud OSS in Los Angeles (US West, `us-west-1`, North America region)**. The URLs look like:

```
https://<bucket-name>.oss-us-west-1.aliyuncs.com/xxxx.png
```

<Warning>
  The subdomain part of the URL (the `<bucket-name>`, e.g. `mycdn-gg`) **may change over time — do not hard-code the full domain** in your code or firewall rules. If you need to match or allowlist the domain, match the suffix `oss-us-west-1.aliyuncs.com` (Alibaba Cloud's official OSS domain), or more loosely allow `*.aliyuncs.com`.
</Warning>

### Downloads Are Slow?

Since the storage node is in North America, direct downloads from some regions (e.g. mainland China) can be slow. Common causes and suggestions:

* **Corporate network throttling / allowlist blocking of overseas traffic**: ask your network admin to lift rate limits on and allowlist `*.oss-us-west-1.aliyuncs.com` (or `*.aliyuncs.com`).
* **Re-host promptly**: download the image as soon as you get the URL and re-upload it to your own storage / CDN before serving end users — don't expose the OSS URL to end users long-term.
* **Download via a server**: if your local network is slow, download through an overseas server (or one with a good network route) first, then relay it.

For more network troubleshooting ideas (DNS, routing, cross-border bandwidth, etc.), see the FAQ: [What to Do When CDN Image/Video Downloads Are Slow?](/en/faq/cdn-download-slow)

### URL Won't Open?

The key is to restore the escaped sequence `\u0026` in the output JSON back to a normal `&`, while ignoring the base64 content after `thoughtSignature`.

<Frame caption="The image link is in the text field; restore the JSON-escaped & back to the & in the URL, and ignore the base64 after thoughtSignature">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-oss-url-unescape.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=5998b89a3f6b0cf6448041e47db2d9dd" alt="Diagram: the image link is in the text field, restore the JSON escape backslash u0026 back to the & symbol, and ignore the base64 content after thoughtSignature" width="1200" height="723" data-path="images/nano-banana-oss-url-unescape.png" />
</Frame>
