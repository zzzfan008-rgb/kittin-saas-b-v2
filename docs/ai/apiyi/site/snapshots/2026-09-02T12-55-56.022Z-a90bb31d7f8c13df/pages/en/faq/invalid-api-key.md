> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Why is my API Key invalid?

> Solve API Key invalid errors and learn the correct configuration of Base URL and API Key

## Common Error Symptoms

When you see error messages like this:

```json theme={null}
{
  "error": {
    "message": "Incorrect API key provided: sk-QqHvK***...",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

This usually means **NOT** that your API Key is wrong, but that the **Base URL is misconfigured**.

<Warning>
  **Most Common Mistake**: Using APIYI's Key but sending requests to OpenAI's official endpoint `https://api.openai.com`
</Warning>

## What is Base URL?

**Base URL** (Base URL / Request Address) is the target server address for API requests. Different API service providers use different Base URLs.

### Base URL and API Key Must Match

| Service Provider    | Base URL                 | API Key Format  | Match?      |
| ------------------- | ------------------------ | --------------- | ----------- |
| **APIYI**           | `https://api.apiyi.com`  | `sk-xxxx......` | ✅ Correct   |
| **OpenAI Official** | `https://api.openai.com` | `sk-xxxx......` | ✅ Correct   |
| ❌ APIYI Key         | `https://api.openai.com` | `sk-xxxx......` | ❌ **Wrong** |
| ❌ OpenAI Key        | `https://api.apiyi.com`  | `sk-xxxx......` | ❌ **Wrong** |

<Info>
  **Key Principle**: Use the Base URL that matches your API Key provider.
</Info>

## Correct Configuration

### Method 1: Modify Base URL (Recommended)

Simply replace the OpenAI endpoint with APIYI's, keep everything else unchanged:

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",  # Get Key from APIYI dashboard
      base_url="https://api.apiyi.com/v1"  # Change to APIYI address
  )

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "Hello"}]
  )
  ```

  ```javascript JavaScript/Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-apiyi-key',  // Get Key from APIYI dashboard
    baseURL: 'https://api.apiyi.com/v1'  // Change to APIYI address
  });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }]
  });
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-your-apiyi-key" \
    -d '{
      "model": "gpt-4o",
      "messages": [{"role": "user", "content": "Hello"}]
    }'
  ```
</CodeGroup>

### Method 2: Use Environment Variables

Set environment variables so you don't need to specify Base URL in code:

<CodeGroup>
  ```bash Linux/macOS theme={null}
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```powershell Windows PowerShell theme={null}
  $env:OPENAI_API_KEY="sk-your-apiyi-key"
  $env:OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```cmd Windows CMD theme={null}
  set OPENAI_API_KEY=sk-your-apiyi-key
  set OPENAI_BASE_URL=https://api.apiyi.com/v1
  ```
</CodeGroup>

## Supported Base URL Formats

APIYI supports three Base URL formats depending on your code:

<Tabs>
  <Tab title="Format 1: With /v1 (Recommended)">
    ```
    https://api.apiyi.com/v1
    ```

    **Use Case**: Most libraries automatically append specific paths to Base URL

    **Full Request Examples**:

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/models
    ```
  </Tab>

  <Tab title="Format 2: With /v1/ (Trailing Slash)">
    ```
    https://api.apiyi.com/v1/
    ```

    **Use Case**: Some frameworks require Base URL to end with a slash

    **Full Request Examples**:

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/models
    ```
  </Tab>

  <Tab title="Format 3: Full Path">
    ```
    https://api.apiyi.com/v1/chat/completions
    ```

    **Use Case**: Direct use of complete API endpoint (e.g., cURL requests)

    <Note>
      This approach is typically used for cURL or raw HTTP library requests, no need to set Base URL
    </Note>
  </Tab>
</Tabs>

## Troubleshooting

<AccordionGroup>
  <Accordion title="I've confirmed Base URL is correct but still getting errors">
    **Possible Causes**:

    1. **Multiple configuration points**: Check if Base URL is set in config files, environment variables, code initialization, etc.
    2. **Proxy or middleware**: Some proxy tools may redirect requests
    3. **Cache issues**: Restart the program or clear cache and retry
    4. **Typo**: Verify `apiyi` is spelled correctly (not `apiyii` or `apiyl`)
  </Accordion>

  <Accordion title="How to verify if my Key is valid?">
    Check in APIYI dashboard:

    1. Login to APIYI dashboard `console.apiyi.com`
    2. Go to "Tokens" page
    3. Check if Key status is "Enabled"
    4. Confirm account has sufficient balance
  </Accordion>

  <Accordion title="How to configure third-party tools (like ChatBox, OpenCat)?">
    Most third-party tools have "Custom API" or "Self-hosted Server" options:

    * **API Address / Base URL**: `https://api.apiyi.com/v1`
    * **API Key**: Copy your Key from APIYI dashboard
    * **Model Name**: Refer to model list in APIYI documentation

    <Tip>
      Configuration options are usually found in "Settings" → "API" or "Server" sections
    </Tip>
  </Accordion>

  <Accordion title="Where can I find code examples?">
    APIYI provides complete code examples in multiple languages:

    1. **Quick Start Documentation**: Homepage → Code Examples
    2. **Online Testing Tool**: Dashboard → ApiFox Online Testing
    3. **GitHub Repository**: `github.com/apiyi/docs` → knowledge-base directory
  </Accordion>
</AccordionGroup>

## Wrong vs Correct Examples

<CardGroup cols={2}>
  <Card title="❌ Wrong Configuration" icon="x" color="#ef4444">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.openai.com/v1"
        # ❌ Using OpenAI official endpoint
    )
    ```

    **Result**: OpenAI server will reject APIYI's Key
  </Card>

  <Card title="✅ Correct Configuration" icon="check" color="#10b981">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.apiyi.com/v1"
        # ✅ Using APIYI endpoint
    )
    ```

    **Result**: Request successfully sent to APIYI server
  </Card>
</CardGroup>

## Quick Test Method

Use cURL command to quickly verify your configuration:

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

**Expected Result**: Returns list of available models

```json theme={null}
{
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      ...
    }
  ]
}
```

If you get an error, check:

1. API Key copied correctly (watch for leading/trailing spaces)
2. Network connection is working
3. Account has sufficient balance

## Related Documentation

* [Quick Start Guide](/en/getting-started)
* [API Manual](/en/api-manual)
* [Why can't I use API with remaining balance?](/en/faq/balance-insufficient)
* [Supported Models List](/en/api-capabilities/model-info)

<Tip>
  **Remember the core principle**: Match the URL to the Key provider. APIYI's Key uses `https://api.apiyi.com/v1`
</Tip>
