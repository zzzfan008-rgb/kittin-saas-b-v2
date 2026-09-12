> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How to Configure Base URL? Differences Between /v1, Root Domain, and /v1beta

> Complete guide to configuring API.YI Base URL: /v1 for OpenAI, root domain for Claude, /v1beta for Gemini

## Quick Answer

<Info>
  **Remember this**: OpenAI models need `/v1`, Claude uses root domain only, Gemini needs `/v1beta`. Incorrect Base URL is the most common integration issue.
</Info>

| Model Family                       | Base URL                   | SDK                                            |
| ---------------------------------- | -------------------------- | ---------------------------------------------- |
| GPT / DeepSeek / Llama / Qwen etc. | `https://api.apiyi.com/v1` | OpenAI SDK                                     |
| Claude series                      | `https://api.apiyi.com`    | Anthropic SDK                                  |
| Gemini series                      | `https://api.apiyi.com`    | Google GenAI SDK (set `api_version: "v1beta"`) |

## Why Different Base URLs for Different Models?

This is determined by each vendor's SDK implementation:

* **OpenAI SDK**: Appends resource paths after `base_url`, so `/v1` must be included
* **Anthropic SDK**: Internally appends `/v1/messages` — adding `/v1` yourself results in `/v1/v1/messages` (404 error)
* **Google GenAI SDK**: Uses `/v1beta` path, SDK handles concatenation automatically

## Code Examples

### OpenAI-Compatible Models (GPT / DeepSeek / Llama etc.)

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"  # Domain + /v1
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

### Claude Models (Anthropic SDK)

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com"  # Root domain only, NO /v1
)

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
```

### Gemini Models (Google GenAI SDK)

```python theme={null}
from google import genai

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"api_version": "v1beta", "base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="Hello!"
)
print(response.text)
```

<Warning>
  **Common mistake for Claude users**: When using the official Anthropic SDK, Base URL should be `https://api.apiyi.com` only — do NOT add `/v1`. However, if you're calling Claude through OpenAI SDK's compatible mode, you DO need `/v1`.
</Warning>

## Domain Node Selection

APIYI provides 4 domain nodes with identical features, differing in network routing and deployment architecture:

<CardGroup cols={2}>
  <Card title="🌏 Global Direct (Recommended for Overseas)" icon="globe">
    **`vip.apiyi.com`**

    Direct connection to backend, lowest latency. **Recommended for all non-China-mainland customers**.
  </Card>

  <Card title="🇨🇳 China Default (Recommended for Mainland)" icon="server">
    **`api.apiyi.com`**

    Optimized for China mainland network. **Default for China mainland customers**.
  </Card>

  <Card title="🏢 China Backup / Business" icon="building">
    **`b.apiyi.com`**

    Backup node and Business enterprise line. Use when primary node is unavailable.
  </Card>

  <Card title="⚡ Cloudflare CDN Global Acceleration" icon="bolt">
    **`api-cf.apiyi.com`**

    Cloudflare global CDN acceleration. For **text-only API calls**. Has a 100-second timeout limit.
  </Card>
</CardGroup>

| Node                  | Domain             | Recommended For              | Notes                                |
| --------------------- | ------------------ | ---------------------------- | ------------------------------------ |
| Global Direct         | `vip.apiyi.com`    | Non-China-mainland customers | Direct backend, lowest latency       |
| China Default         | `api.apiyi.com`    | China mainland customers     | Optimized domestic routing (default) |
| China Backup/Business | `b.apiyi.com`      | Enterprise / backup          | Backup + Business                    |
| Cloudflare CDN        | `api-cf.apiyi.com` | Text-only calls              | Global acceleration, 100s timeout    |

<Warning>
  **Cloudflare CDN Node Limitation**: `api-cf.apiyi.com` is deployed on Cloudflare Workers, which has a maximum request timeout of **100 seconds**. Therefore:

  * ✅ **Suitable for**: Regular text chat, short text generation, and other fast-response calls
  * ❌ **Not suitable for**: Complex long-text tasks exceeding 100 seconds
  * ❌ **Not suitable for**: Nano Banana Pro and other image generation tasks
  * ❌ **Not suitable for**: Video generation API calls

  If your tasks may exceed 100 seconds, use `vip.apiyi.com` (overseas) or `api.apiyi.com` (China mainland) instead.
</Warning>

<Tip>
  We recommend configuring a fallback node in your code for automatic switching to improve service availability.
</Tip>

## Common Error Troubleshooting

| Error                  | Possible Cause                                               | Solution                                                                                   |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **404 Not Found**      | Missing `/v1` in OpenAI SDK, or extra `/v1` in Anthropic SDK | Verify path matches SDK specification                                                      |
| **400 Bad Request**    | Gemini SDK path version mismatch                             | Confirm using `/v1beta`                                                                    |
| **Connection Timeout** | Wrong domain node                                            | Use `api.apiyi.com` in China, `vip.apiyi.com` overseas; CF-CDN node has 100s timeout limit |
| **SSL Error**          | Missing `https://` prefix                                    | All nodes require HTTPS                                                                    |
| **Double Slash Error** | Trailing `/` in base\_url                                    | Remove trailing slash                                                                      |

## Full Configuration Reference

### OpenAI-Compatible Models

| Node                       | Base URL                      |
| -------------------------- | ----------------------------- |
| Global Direct (Overseas)   | `https://vip.apiyi.com/v1`    |
| China Default (Mainland)   | `https://api.apiyi.com/v1`    |
| China Backup/Business      | `https://b.apiyi.com/v1`      |
| Cloudflare CDN (Text Only) | `https://api-cf.apiyi.com/v1` |

### Claude Models (Anthropic SDK)

| Node                       | Base URL                   |
| -------------------------- | -------------------------- |
| Global Direct (Overseas)   | `https://vip.apiyi.com`    |
| China Default (Mainland)   | `https://api.apiyi.com`    |
| China Backup/Business      | `https://b.apiyi.com`      |
| Cloudflare CDN (Text Only) | `https://api-cf.apiyi.com` |

### Gemini Models

| Node                       | Base URL                   |
| -------------------------- | -------------------------- |
| Global Direct (Overseas)   | `https://vip.apiyi.com`    |
| China Default (Mainland)   | `https://api.apiyi.com`    |
| China Backup/Business      | `https://b.apiyi.com`      |
| Cloudflare CDN (Text Only) | `https://api-cf.apiyi.com` |

<Info>
  When using the Google GenAI SDK for Gemini, set `base_url` to the root domain and `api_version: "v1beta"` — the SDK will automatically construct the full path.
</Info>
