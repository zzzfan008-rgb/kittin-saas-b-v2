> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 4.8

> Claude Opus 4.8 on APIYI: $5 input / $25 output per 1M tokens, 200,000 context, available in 4 billing groups.

The previous Opus flagship: 69.2% on agentic coding, with five effort levels and dynamic workflows.

## Specifications

| Item                   | Value                                          |
| ---------------------- | ---------------------------------------------- |
| **Model ID**           | `claude-opus-4-8` · `claude-opus-4-8-thinking` |
| **Vendor**             | Anthropic                                      |
| **Available on APIYI** | 2026-05-28                                     |
| **Knowledge cutoff**   | Not disclosed                                  |
| **Input modalities**   | Text, Image                                    |
| **Output modalities**  | Text                                           |
| **Context window**     | 200,000 tokens                                 |
| **Billing**            | Usage-based                                    |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input | Cached input | Output |
| ----- | ------------ | ------ |
| \$5   | \$0.5        | \$25   |

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
| `Claude_Reverse` | 0.5×       | 50% of list price |
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

## Variants

| Model ID                   | Notes                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- |
| `claude-opus-4-8`          | Standard call.                                                                  |
| `claude-opus-4-8-thinking` | Forced-thinking variant; pricing and endpoints identical to the standard model. |

## Example request

The example below calls `claude-opus-4-8` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-4-8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/claude-opus-4-8-launch">
    Background, benchmarks and migration notes for Claude Opus 4.8
  </Card>

  <Card title="Claude API Basics" icon="book-open" href="/en/api-capabilities/claude">
    Parameters, usage and best practices
  </Card>

  <Card title="Effort & Thinking" icon="book-open" href="/en/api-capabilities/claude-effort-thinking">
    Parameters, usage and best practices
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/en/models/claude-opus-5">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
