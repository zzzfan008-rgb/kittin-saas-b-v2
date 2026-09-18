> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo

> Seed 2.1 Turbo on APIYI: $0.5 input / $2.5 output per 1M tokens, 256,000 context, available in 3 billing groups.

A production text model for high-frequency workloads: 15/15 verified across both endpoints, with a thinking toggle and two layers of caching.

## Specifications

| Item                   | Value                        |
| ---------------------- | ---------------------------- |
| **Model ID**           | `dola-seed-2-1-turbo-260628` |
| **Vendor**             | ByteDance                    |
| **Vendor release**     | 2026-06-23                   |
| **Available on APIYI** | 2026-07-21                   |
| **Knowledge cutoff**   | Not disclosed                |
| **Input modalities**   | Text                         |
| **Output modalities**  | Text                         |
| **Context window**     | 256,000 tokens               |
| **Billing**            | Usage-based                  |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input | Cached input | Output |
| ----- | ------------ | ------ |
| \$0.5 | \$0.1        | \$2.5  |

<Info>The table shows **list prices**. Recharge promotions and group discounts **stack**; the console reflects the actual charge in real time. See [Pricing](/en/pricing) and [Recharge promotions](/en/faq/recharge-promotions).</Info>

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
| Prompt caching     | ✅             |
| Extended thinking  | On by default |

## Example request

The example below calls `dola-seed-2-1-turbo-260628` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "dola-seed-2-1-turbo-260628",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/dola-seed-2-1-turbo-launch">
    Background, benchmarks and migration notes for Seed 2.1 Turbo
  </Card>

  <Card title="Overview" icon="book-open" href="/en/api-capabilities/dola-seed-2-1-turbo/overview">
    Parameters, usage and best practices
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
