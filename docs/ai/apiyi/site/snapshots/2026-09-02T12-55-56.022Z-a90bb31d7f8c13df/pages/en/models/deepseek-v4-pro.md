> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Pro

> DeepSeek V4 Pro on APIYI: $1.32 input / $3.96 output per 1M tokens, 1,048,576 context, available in 3 billing groups.

The 1.6T-total / 49B-active MoE flagship: open-source SOTA on agentic coding, SWE-Verified 80.6, with thinking effort dialable up to max.

## Specifications

| Item                   | Value             |
| ---------------------- | ----------------- |
| **Model ID**           | `deepseek-v4-pro` |
| **Vendor**             | DeepSeek          |
| **Available on APIYI** | 2026-04-24        |
| **Knowledge cutoff**   | Not disclosed     |
| **Input modalities**   | Text              |
| **Output modalities**  | Text              |
| **Context window**     | 1,048,576 tokens  |
| **Billing**            | Usage-based       |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input  | Cached input | Output |
| ------ | ------------ | ------ |
| \$1.32 | \$0.043996   | \$3.96 |

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

| Group        | Multiplier | Notes             |
| ------------ | ---------- | ----------------- |
| `ClaudeCode` | 0.95×      | 95% of list price |
| `Default`    | 1×         | List price        |
| `SVIP`       | 1×         | List price        |

Some groups carry extra discounts, stackable with recharge bonuses. See [Tokens and groups](/en/faq/token-and-groups).

## Supported features

| Feature           | Supported |
| ----------------- | --------- |
| Streaming         | ✅         |
| Tool calling      | ✅         |
| Prompt caching    | ✅         |
| Extended thinking | Opt-in    |

## Example request

The example below calls `deepseek-v4-pro` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Launch announcement" icon="megaphone" href="/en/news/deepseek-v4-launch">
    Background, benchmarks and migration notes for DeepSeek V4 Pro
  </Card>

  <Card title="DeepSeek V4 Flash" icon="git-compare" href="/en/models/deepseek-v4-flash">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all 283 models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API, updated 2026-08-31 11:46 (UTC+8), specs last verified 2026-08-17.</Note>
