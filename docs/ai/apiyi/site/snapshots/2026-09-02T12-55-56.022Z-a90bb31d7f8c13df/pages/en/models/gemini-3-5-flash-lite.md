> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite

> Gemini 3.5 Flash-Lite on APIYI: $0.3 input / $2.4999 output per 1M tokens, 1,048,576 context, 65,536 max output, available in 2 billing groups.

The high-throughput lightweight tier: zero thinking by default and roughly two-second responses, built for concurrency and batch jobs.

## Specifications

| Item                   | Value                          |
| ---------------------- | ------------------------------ |
| **Model ID**           | `gemini-3.5-flash-lite`        |
| **Vendor**             | Google                         |
| **Available on APIYI** | 2026-07-22                     |
| **Knowledge cutoff**   | Not disclosed                  |
| **Input modalities**   | Text, Image, Audio, Video, PDF |
| **Output modalities**  | Text                           |
| **Context window**     | 1,048,576 tokens               |
| **Max output**         | 65,536 tokens                  |
| **Billing**            | Usage-based                    |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input | Cached input | Output   |
| ----- | ------------ | -------- |
| \$0.3 | \$0.03       | \$2.4999 |

<Info>The table shows **list prices**. Recharge promotions and group discounts **stack**; the console reflects the actual charge in real time. See [Pricing](/en/pricing) and [Recharge promotions](/en/faq/recharge-promotions).</Info>

## Endpoints

| Endpoint                  | Path                                          | Supported |
| ------------------------- | --------------------------------------------- | --------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅         |
| `OpenAI Responses`        | `POST /v1/responses`                          | —         |
| `Anthropic Messages`      | `POST /v1/messages`                           | —         |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅         |
| `Image Generations`       | `POST /v1/images/generations`                 | —         |
| `Embeddings`              | `POST /v1/embeddings`                         | —         |

## Billing groups

| Group     | Multiplier | Notes      |
| --------- | ---------- | ---------- |
| `Default` | 1×         | List price |
| `SVIP`    | 1×         | List price |

Some groups carry extra discounts, stackable with recharge bonuses. See [Tokens and groups](/en/faq/token-and-groups).

## Supported features

| Feature            | Supported |
| ------------------ | --------- |
| Streaming          | ✅         |
| Tool calling       | ✅         |
| Structured outputs | ✅         |
| Vision             | ✅         |
| Prompt caching     | ✅         |
| Extended thinking  | Opt-in    |

## Example request

The example below calls `gemini-3.5-flash-lite` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.5-flash-lite",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/gemini-3-6-flash-lite-launch">
    Background, benchmarks and migration notes for Gemini 3.5 Flash-Lite
  </Card>

  <Card title="Overview" icon="book-open" href="/en/api-capabilities/gemini-3-5-flash-lite/overview">
    Parameters, usage and best practices
  </Card>

  <Card title="Native Calls" icon="book-open" href="/en/api-capabilities/gemini/native">
    Parameters, usage and best practices
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/en/models/gemini-3-6-flash">
    Details for a model in the same family
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/en/models/gemini-3-5-flash">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all 283 models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API, updated 2026-08-31 11:46 (UTC+8), specs last verified 2026-07-31.</Note>
