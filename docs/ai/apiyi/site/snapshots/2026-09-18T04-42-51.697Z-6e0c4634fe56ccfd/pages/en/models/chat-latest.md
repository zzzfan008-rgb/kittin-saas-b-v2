> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# chat-latest

> chat-latest on APIYI: $5 input / $30 output per 1M tokens, 400,000 context, 128,000 max output, available in 2 billing groups.

OpenAI's rolling alias that always points at the model currently powering ChatGPT — today, GPT-5.5 Instant.

## Specifications

| Item                   | Value          |
| ---------------------- | -------------- |
| **Model ID**           | `chat-latest`  |
| **Vendor**             | OpenAI         |
| **Available on APIYI** | 2026-05-21     |
| **Knowledge cutoff**   | 2025-08        |
| **Input modalities**   | Text, Image    |
| **Output modalities**  | Text           |
| **Context window**     | 400,000 tokens |
| **Max output**         | 128,000 tokens |
| **Billing**            | Usage-based    |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input | Cached input | Output |
| ----- | ------------ | ------ |
| \$5   | \$0.5        | \$30   |

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
| Web search         | ✅         |
| Code execution     | ✅         |
| Fine-tuning        | —         |

## Example request

The example below calls `chat-latest` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "chat-latest",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/chat-latest-launch">
    Background, benchmarks and migration notes for chat-latest
  </Card>

  <Card title="Compatible Mode" icon="book-open" href="/en/api-capabilities/openai/compatible">
    Parameters, usage and best practices
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
