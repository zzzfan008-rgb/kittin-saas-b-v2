> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M3

> MiniMax-M3 on APIYI: $0.3 input / $1.2 output per 1M tokens, 1,000,000 context, available in 3 billing groups.

The first open-weight model combining frontier agentic coding, a million-token context and native multimodality; MSA sparse attention cuts long-context inference cost to about 1/20 of the previous generation.

## Specifications

| Item                   | Value              |
| ---------------------- | ------------------ |
| **Model ID**           | `MiniMax-M3`       |
| **Vendor**             | MiniMax            |
| **Vendor release**     | 2026-06-01         |
| **Available on APIYI** | 2026-06-05         |
| **Knowledge cutoff**   | Not disclosed      |
| **Input modalities**   | Text, Image, Video |
| **Output modalities**  | Text               |
| **Context window**     | 1,000,000 tokens   |
| **Billing**            | Usage-based        |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input | Cached input | Output |
| ----- | ------------ | ------ |
| \$0.3 | \$0.06       | \$1.2  |

<Info>The table shows **list prices**. Recharge promotions and group discounts **stack**; the console reflects the actual charge in real time. See [Pricing](/en/pricing) and [Recharge promotions](/en/faq/recharge-promotions).</Info>

## Tiered pricing

This model is tier-priced by the token size of each request (output price = tier input price × output multiplier):

* 0 – 524,288 tokens: \$0.3/1M input
* Above 524,288 tokens: \$0.6/1M input

(already discounted to 50% of the vendor's list price)

## Endpoints

| Endpoint                  | Path                                          | Supported |
| ------------------------- | --------------------------------------------- | --------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅         |
| `OpenAI Responses`        | `POST /v1/responses`                          | —         |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅         |
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
| Vision             | ✅         |
| Prompt caching     | ✅         |
| Extended thinking  | Opt-in    |

## Example request

The example below calls `MiniMax-M3` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "MiniMax-M3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/minimax-m3-launch">
    Background, benchmarks and migration notes for MiniMax-M3
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all 283 models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API, updated 2026-08-31 11:46 (UTC+8), specs last verified 2026-07-31.</Note>
