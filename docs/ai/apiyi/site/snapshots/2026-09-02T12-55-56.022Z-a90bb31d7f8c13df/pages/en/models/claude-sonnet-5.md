> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5

> Claude Sonnet 5 on APIYI: $2 input / $10 output per 1M tokens, available in 4 billing groups.

The pick for coding and agent development: 85.2% on SWE-bench Verified, pure AWS passthrough with high cache hit rates.

## Specifications

| Item                   | Value                                          |
| ---------------------- | ---------------------------------------------- |
| **Model ID**           | `claude-sonnet-5` · `claude-sonnet-5-thinking` |
| **Vendor**             | Anthropic                                      |
| **Available on APIYI** | 2026-07-01                                     |
| **Knowledge cutoff**   | Not disclosed                                  |
| **Input modalities**   | Text, Image                                    |
| **Output modalities**  | Text                                           |
| **Billing**            | Usage-based                                    |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input | Cached input | Output |
| ----- | ------------ | ------ |
| \$2   | \$0.2        | \$10   |

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

| Group               | Multiplier | Notes             |
| ------------------- | ---------- | ----------------- |
| `ClaudeCode`        | 0.95×      | 95% of list price |
| `ClaudeCodeReverse` | 0.5×       | 50% of list price |
| `Default`           | 1×         | List price        |
| `SVIP`              | 1×         | List price        |

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

## Variants

| Model ID                   | Notes                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- |
| `claude-sonnet-5`          | Standard call.                                                                  |
| `claude-sonnet-5-thinking` | Forced-thinking variant; pricing and endpoints identical to the standard model. |

## Example request

The example below calls `claude-sonnet-5` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-sonnet-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/claude-sonnet-5-launch">
    Background, benchmarks and migration notes for Claude Sonnet 5
  </Card>

  <Card title="Claude API Basics" icon="book-open" href="/en/api-capabilities/claude">
    Parameters, usage and best practices
  </Card>

  <Card title="Prompt Caching" icon="book-open" href="/en/api-capabilities/claude-prompt-caching">
    Parameters, usage and best practices
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/en/models/claude-opus-5">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all 283 models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API, updated 2026-08-31 11:46 (UTC+8), specs last verified 2026-07-31.</Note>
