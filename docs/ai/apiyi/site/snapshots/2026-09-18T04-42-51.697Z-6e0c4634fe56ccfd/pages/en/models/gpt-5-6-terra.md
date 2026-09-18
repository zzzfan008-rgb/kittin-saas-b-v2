> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Terra

> GPT-5.6 Terra on APIYI: $2 input / $12 output per 1M tokens, 1,000,000 context, available in 4 billing groups.

The workhorse tier of the GPT-5.6 family: GPT-5.5-class performance at half the price — the default choice when migrating.

## Specifications

| Item                   | Value            |
| ---------------------- | ---------------- |
| **Model ID**           | `gpt-5.6-terra`  |
| **Vendor**             | OpenAI           |
| **Available on APIYI** | 2026-07-10       |
| **Knowledge cutoff**   | Not disclosed    |
| **Input modalities**   | Text, Image      |
| **Output modalities**  | Text             |
| **Context window**     | 1,000,000 tokens |
| **Billing**            | Usage-based      |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input | Cached input | Output |
| ----- | ------------ | ------ |
| \$2   | \$0.2        | \$12   |

<Info>The table shows **list prices**. Recharge promotions and group discounts **stack**; the console reflects the actual charge in real time. See [Pricing](/en/pricing) and [Recharge promotions](/en/faq/recharge-promotions).</Info>

## Tiered pricing

This model is tier-priced by the token size of each request (output price = tier input price × output multiplier):

* 0 – 272,000 tokens: \$2/1M input
* Above 272,000 tokens: \$4/1M input

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

| Group            | Multiplier | Notes             |
| ---------------- | ---------- | ----------------- |
| `CodexResponses` | 1×         | List price        |
| `Codex_Reverse`  | 0.5×       | 50% of list price |
| `Default`        | 1×         | List price        |
| `SVIP`           | 1×         | List price        |

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

The example below calls `gpt-5.6-terra` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-terra",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/gpt-5-6-launch">
    Background, benchmarks and migration notes for GPT-5.6 Terra
  </Card>

  <Card title="Compatible Mode" icon="book-open" href="/en/api-capabilities/openai/compatible">
    Parameters, usage and best practices
  </Card>

  <Card title="GPT-5.6 Sol" icon="git-compare" href="/en/models/gpt-5-6-sol">
    Details for a model in the same family
  </Card>

  <Card title="GPT-5.6 Luna" icon="git-compare" href="/en/models/gpt-5-6-luna">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
