> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash

> Gemini 3.8 Flash on APIYI: $0.75 input / $3.75 output per 1M tokens, available in 2 billing groups.

The next Flash at the same price as 3.7, matching it item by item across 150 measured cases; official specs are still unpublished. Thinking tiers are down to low/medium/high — minimal is gone.

## Specifications

| Item                   | Value                     |
| ---------------------- | ------------------------- |
| **Model ID**           | `gemini-3.8-flash`        |
| **Vendor**             | Google                    |
| **Vendor release**     | 2026-09-02                |
| **Available on APIYI** | 2026-09-02                |
| **Knowledge cutoff**   | Not disclosed             |
| **Input modalities**   | Text, Image, Video, Audio |
| **Output modalities**  | Text                      |
| **Billing**            | Usage-based               |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input  | Cached input | Output |
| ------ | ------------ | ------ |
| \$0.75 | \$0.075      | \$3.75 |

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

| Feature            | Supported     |
| ------------------ | ------------- |
| Streaming          | ✅             |
| Tool calling       | ✅             |
| Structured outputs | ✅             |
| Vision             | ✅             |
| Prompt caching     | ✅             |
| Extended thinking  | On by default |
| Code execution     | ✅             |

## Example request

The example below calls `gemini-3.8-flash` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.8-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/gemini-3-8-flash-launch">
    Background, benchmarks and migration notes for Gemini 3.8 Flash
  </Card>

  <Card title="Gemini 3.8 Flash Overview" icon="book-open" href="/en/api-capabilities/gemini-3-8-flash/overview">
    Parameters, usage and best practices
  </Card>

  <Card title="Native Calls" icon="book-open" href="/en/api-capabilities/gemini/native">
    Parameters, usage and best practices
  </Card>

  <Card title="Gemini 3.7 Flash" icon="git-compare" href="/en/models/gemini-3-7-flash">
    Details for a model in the same family
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/en/models/gemini-3-6-flash">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
