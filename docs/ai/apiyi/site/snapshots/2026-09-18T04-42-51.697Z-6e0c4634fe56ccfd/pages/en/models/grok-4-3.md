> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.3

> Grok 4.3 on APIYI: $1.25 input / $2.5 output per 1M tokens, 1,000,000 context, available in 3 billing groups.

Always-on reasoning that cannot be disabled, a 1M context window, and roughly 159 tokens/s output.

## Specifications

| Item                   | Value            |
| ---------------------- | ---------------- |
| **Model ID**           | `grok-4.3`       |
| **Vendor**             | xAI              |
| **Available on APIYI** | 2026-05-03       |
| **Knowledge cutoff**   | Not disclosed    |
| **Input modalities**   | Text, Image      |
| **Output modalities**  | Text             |
| **Context window**     | 1,000,000 tokens |
| **Billing**            | Usage-based      |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input  | Cached input | Output |
| ------ | ------------ | ------ |
| \$1.25 | \$0.2        | \$2.5  |

<Info>The table shows **list prices**. Recharge promotions and group discounts **stack**; the console reflects the actual charge in real time. See [Pricing](/en/pricing) and [Recharge promotions](/en/faq/recharge-promotions).</Info>

## Tiered pricing

This model is tier-priced by the token size of each request (output price = tier input price × output multiplier):

* 0 – 204,800 tokens: \$1.25/1M input
* Above 204,800 tokens: \$2.5/1M input

## Endpoints

| Endpoint                  | Path                                          | Supported |
| ------------------------- | --------------------------------------------- | --------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅         |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅         |
| `Anthropic Messages`      | `POST /v1/messages`                           | —         |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —         |
| `Image Generations`       | `POST /v1/images/generations`                 | —         |
| `Embeddings`              | `POST /v1/embeddings`                         | —         |

## Billing groups

| Group            | Multiplier | Notes      |
| ---------------- | ---------- | ---------- |
| `CodexResponses` | 1×         | List price |
| `Default`        | 1×         | List price |
| `SVIP`           | 1×         | List price |

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
| Web search         | ✅             |
| Code execution     | ✅             |

## Example request

The example below calls `grok-4.3` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "grok-4.3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/grok-4-3-launch">
    Background, benchmarks and migration notes for Grok 4.3
  </Card>

  <Card title="Grok Overview" icon="book-open" href="/en/api-capabilities/grok/overview">
    Parameters, usage and best practices
  </Card>

  <Card title="Grok 4.6" icon="git-compare" href="/en/models/grok-4-6">
    Details for a model in the same family
  </Card>

  <Card title="Grok 4.5" icon="git-compare" href="/en/models/grok-4-5">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
