> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Make.com + Gemini Image Understanding

> Use Make.com's HTTP request node to call APIYI's Gemini image understanding API, enabling automated image analysis, OCR, and multimodal workflows without code.

## Overview

Make.com (formerly Integromat) is a powerful no-code automation platform. Using its built-in **HTTP request node (Make a request)**, you can directly call APIYI's Gemini native format API for image understanding, content analysis, and other multimodal automation workflows — no coding required.

<Info>
  **Integration Info**

  * 🔧 Tool: Make.com (`make.com`)
  * 🔌 Integration: HTTP request node (Make a request)
  * 🤖 Model: Gemini series (via APIYI Gemini native format)
  * 📡 API Endpoint: `https://api.apiyi.com/v1beta/models/{model}:generateContent`
</Info>

## Why Make.com + APIYI

<CardGroup cols={2}>
  <Card title="Zero-Code Integration" icon="wand-sparkles">
    Configure HTTP request nodes through visual drag-and-drop, no coding needed to call AI models
  </Card>

  <Card title="Automated Workflows" icon="refresh-cw">
    Combine with Make.com triggers and conditional logic to build complete image processing automation
  </Card>

  <Card title="Multi-Model Support" icon="layers">
    APIYI supports 400+ models — one API key to switch between different AI capabilities in Make.com
  </Card>

  <Card title="Flexible Extension" icon="puzzle">
    Seamlessly connect with 1000+ apps including Google Sheets, Slack, Email, and more
  </Card>
</CardGroup>

## Supported APIYI Models

| Model Name             | Model ID                 | Use Case                              | API Docs                                        |
| ---------------------- | ------------------------ | ------------------------------------- | ----------------------------------------------- |
| Gemini 3.1 Pro Preview | `gemini-3.1-pro-preview` | Image understanding, text generation  | [View Docs](/en/api-capabilities/gemini/native) |
| Gemini 3 Pro Preview   | `gemini-3-pro-preview`   | Image understanding, image generation | [View Docs](/en/api-capabilities/gemini/native) |
| Gemini 3 Flash Preview | `gemini-3-flash-preview` | Image understanding (fast)            | [View Docs](/en/api-capabilities/gemini/native) |

<Tip>
  Recommended: `gemini-3.1-pro-preview` for the strongest image understanding capabilities. For higher speed, choose the Flash series.
</Tip>

## Setup Steps

<Steps>
  <Step title="Step 1: Get Your APIYI API Key">
    1. Visit [APIYI Console](https://api.apiyi.com) to register/login
    2. Go to the **Tokens** section and generate a new API key
    3. Copy the key (starts with `sk-`), you'll need it for configuration
  </Step>

  <Step title="Step 2: Create a Make.com Scenario">
    1. Log in to Make.com and click **Create a new scenario**
    2. Click **+** to add a module
    3. Search for and select the **HTTP** module
    4. Under Actions, select **Make a request**
  </Step>

  <Step title="Step 3: Configure the HTTP Request Node">
    Fill in the following configuration in the HTTP request node:

    **URL**:

    ```
    https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent
    ```

    **Method**: `POST`

    **Headers**:

    | Header Name     | Value                      |
    | --------------- | -------------------------- |
    | `Content-Type`  | `application/json`         |
    | `Authorization` | `Bearer sk-your-APIYI-key` |

    **Body type**: `Raw`

    **Content type**: `JSON (application/json)`

    **Request content (Body)**:

    ```json theme={null}
    {
      "contents": [
        {
          "parts": [
            {
              "text": "What is in this image?"
            },
            {
              "fileData": {
                "mimeType": "image/png",
                "fileUri": "https://your-image-url-here"
              }
            }
          ]
        }
      ]
    }
    ```
  </Step>

  <Step title="Step 4: Test Run">
    Click **Run once** to test the request and verify it returns correct image understanding results.
  </Step>
</Steps>

## Complete Request Example

Here's a complete image understanding request example that analyzes an otter image:

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "What is in this image?"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png"
          }
        }
      ]
    }
  ]
}
```

### Request Parameters

| Field                       | Type   | Required | Description                                                 |
| --------------------------- | ------ | -------- | ----------------------------------------------------------- |
| `contents`                  | array  | Yes      | Conversation content array                                  |
| `contents[].parts`          | array  | Yes      | Message parts (text + image)                                |
| `parts[].text`              | string | Yes      | User's text prompt                                          |
| `parts[].fileData.mimeType` | string | Yes      | Image format: `image/png`, `image/jpeg`, `image/webp`, etc. |
| `parts[].fileData.fileUri`  | string | Yes      | Publicly accessible image URL                               |

<Warning>
  `fileUri` must be a **publicly accessible** image URL. If the image requires authentication, upload it to a public storage service first.
</Warning>

## Practical Scenarios

### Scenario 1: Auto-Analyze Email Attachment Images

1. **Trigger**: Gmail - Watch emails (monitor new emails)
2. **Process**: HTTP node calls Gemini image understanding
3. **Output**: Write analysis results to Google Sheets or send to Slack

### Scenario 2: E-commerce Product Image Auto-Tagging

1. **Trigger**: Google Drive - Watch files (monitor newly uploaded images)
2. **Process**: HTTP node analyzes product image content
3. **Output**: Automatically add category tags to product images

### Scenario 3: Social Media Content Moderation

1. **Trigger**: Periodically fetch user-submitted images
2. **Process**: HTTP node analyzes image content for compliance
3. **Output**: Auto-flag non-compliant content for review

## Advanced Tips

### Dynamic Image URL Replacement

In Make.com, you can use output variables from upstream modules to dynamically replace `fileUri` for batch image analysis:

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "Please describe this image and extract any text in it"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "{{upstream module's image URL variable}}"
          }
        }
      ]
    }
  ]
}
```

### Switching Models

Simply change the model name in the URL to switch models:

| Need                    | URL                                                                          |
| ----------------------- | ---------------------------------------------------------------------------- |
| Strongest understanding | `https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent` |
| High-speed analysis     | `https://api.apiyi.com/v1beta/models/gemini-3-flash-preview:generateContent` |

## FAQ

<AccordionGroup>
  <Accordion title="HTTP request returns 401 error?">
    Please check:

    1. Authorization Header format: `Bearer sk-your-key` (note the space after Bearer)
    2. API key is valid (verify in APIYI Console)
    3. Account balance is sufficient
  </Accordion>

  <Accordion title="Image not recognized or returns error?">
    Please verify:

    1. `fileUri` is a publicly accessible URL (can be opened directly in browser)
    2. `mimeType` matches the actual image format
    3. Image size is within model limits
  </Accordion>

  <Accordion title="How to process the response in Make.com?">
    The Gemini API returns JSON format. You can:

    1. Use Make.com's **JSON** module to parse the response
    2. Extract the `candidates[0].content.parts[0].text` field for the analysis result
    3. Pass the result to downstream modules (e.g., write to database, send notifications)
  </Accordion>

  <Accordion title="How to get an APIYI API key?">
    Visit [APIYI Console](https://api.apiyi.com/token), register an account and generate a new key in the Tokens section. New users get free test credits.
  </Accordion>

  <Accordion title="Does it support Base64-encoded images?">
    Yes. Replace `fileData` with `inlineData`:

    ```json theme={null}
    {
      "inlineData": {
        "mimeType": "image/png",
        "data": "Base64-encoded-image-data"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Gemini Native Format Docs" icon="book" href="/en/api-capabilities/gemini/native">
    View complete Gemini native API format documentation
  </Card>

  <Card title="Image Understanding API" icon="eye" href="/en/api-capabilities/vision-understanding">
    View APIYI image understanding capabilities overview
  </Card>

  <Card title="FAQ" icon="circle-question-mark" href="/en/faq/model-selection-guide">
    Get more help from the FAQ section
  </Card>

  <Card title="APIYI Token Management" icon="settings" href="https://api.apiyi.com/token">
    Manage API keys, view usage and balance
  </Card>
</CardGroup>
