> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.2

> GLM-5.2 on APIYI: $1.142 input / $3.997 output per 1M tokens, 1,000,000 context, available in 3 billing groups.

A \~744B-parameter MoE with 40B active weights, ranked first among open models on the AA intelligence index — suited to project-scale coding and long-horizon agents.

## Specifications

| Item                   | Value            |
| ---------------------- | ---------------- |
| **Model ID**           | `glm-5.2`        |
| **Vendor**             | Zhipu            |
| **Available on APIYI** | 2026-06-18       |
| **Knowledge cutoff**   | 2025-11          |
| **Input modalities**   | Text             |
| **Output modalities**  | Text             |
| **Context window**     | 1,000,000 tokens |
| **Billing**            | Usage-based      |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input   | Cached input | Output  |
| ------- | ------------ | ------- |
| \$1.142 | \$0.2284     | \$3.997 |

<Info>The table shows **list prices**. Recharge promotions and group discounts **stack**; the console reflects the actual charge in real time. See [Pricing](/en/pricing) and [Recharge promotions](/en/faq/recharge-promotions).</Info>

## Endpoints

| Endpoint                  | Path                                          | Supported |
| ------------------------- | --------------------------------------------- | --------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅         |
| `OpenAI Responses`        | `POST /v1/responses`                          | —         |
| `Anthropic Messages`      | `POST /v1/messages`                           | —         |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —         |
| `Image Generations`       | `POST /v1/images/generations`                 | —         |
| `Embeddings`              | `POST /v1/embeddings`                         | —         |

## Billing groups

| Group        | Multiplier | Notes             |
| ------------ | ---------- | ----------------- |
| `ClaudeCode` | 0.95×      | 95% of list price |
| `Default`    | 1×         | List price        |
| `SVIP`       | 1×         | List price        |

Some groups carry extra discounts, stackable with recharge bonuses. See [Tokens and groups](/en/faq/token-and-groups).

## Supported features

| Feature            | Supported |
| ------------------ | --------- |
| Streaming          | ✅         |
| Tool calling       | ✅         |
| Structured outputs | ✅         |
| Prompt caching     | ✅         |
| Extended thinking  | Opt-in    |

## Example request

The example below calls `glm-5.2` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/glm-5-2-launch">
    Background, benchmarks and migration notes for GLM-5.2
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
