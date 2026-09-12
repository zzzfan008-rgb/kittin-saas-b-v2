> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash

> DeepSeek V4 Flash on APIYI: $0.44 input / $1.32 output per 1M tokens, 1,048,576 context, 393,216 max output, available in 4 billing groups.

A 284B-total / 13B-active MoE with 1M context, built for high concurrency and low latency; implicit caching needs no setup and lands near-full hits from the second turn.

## Specifications

| Item                   | Value               |
| ---------------------- | ------------------- |
| **Model ID**           | `deepseek-v4-flash` |
| **Vendor**             | DeepSeek            |
| **Available on APIYI** | 2026-04-24          |
| **Knowledge cutoff**   | Not disclosed       |
| **Input modalities**   | Text                |
| **Output modalities**  | Text                |
| **Context window**     | 1,048,576 tokens    |
| **Max output**         | 393,216 tokens      |
| **Billing**            | Usage-based         |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input  | Cached input | Output |
| ------ | ------------ | ------ |
| \$0.44 | \$0.01408    | \$1.32 |

<Info>The table shows **list prices**. Recharge promotions and group discounts **stack**; the console reflects the actual charge in real time. See [Pricing](/en/pricing) and [Recharge promotions](/en/faq/recharge-promotions).</Info>

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

| Group            | Multiplier | Notes             |
| ---------------- | ---------- | ----------------- |
| `ClaudeCode`     | 0.95×      | 95% of list price |
| `CodexResponses` | 1×         | List price        |
| `Default`        | 1×         | List price        |
| `SVIP`           | 1×         | List price        |

Some groups carry extra discounts, stackable with recharge bonuses. See [Tokens and groups](/en/faq/token-and-groups).

## Supported features

| Feature            | Supported |
| ------------------ | --------- |
| Streaming          | ✅         |
| Tool calling       | ✅         |
| Structured outputs | —         |
| Prompt caching     | ✅         |
| Extended thinking  | Opt-in    |
| Web search         | —         |

## Example request

The example below calls `deepseek-v4-flash` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/deepseek-v4-flash-ga-launch">
    Background, benchmarks and migration notes for DeepSeek V4 Flash
  </Card>

  <Card title="Overview" icon="book-open" href="/en/api-capabilities/deepseek-v4-flash/overview">
    Parameters, usage and best practices
  </Card>

  <Card title="DeepSeek V4 Pro" icon="git-compare" href="/en/models/deepseek-v4-pro">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all 283 models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API, updated 2026-08-31 11:46 (UTC+8), specs last verified 2026-08-17.</Note>
