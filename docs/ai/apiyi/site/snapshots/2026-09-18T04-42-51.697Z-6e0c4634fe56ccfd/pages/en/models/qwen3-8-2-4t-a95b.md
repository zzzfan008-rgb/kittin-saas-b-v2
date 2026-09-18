> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-2.4T-A95B

> Qwen3.8-2.4T-A95B on APIYI: $1.72 input / $5.16 output per 1M tokens, 262,144 context, available in 2 billing groups.

The first Max-class Qwen released as open weights: a 2.4T-parameter sparse MoE with 95B active, and the base model behind Qwen3.8-Max; the open release is text-only and drops the Max version's vision.

## Specifications

| Item                   | Value               |
| ---------------------- | ------------------- |
| **Model ID**           | `qwen3.8-2.4t-a95b` |
| **Vendor**             | Alibaba             |
| **Vendor release**     | 2026-08-12          |
| **Available on APIYI** | 2026-09-03          |
| **Knowledge cutoff**   | Not disclosed       |
| **Input modalities**   | Text                |
| **Output modalities**  | Text                |
| **Context window**     | 262,144 tokens      |
| **Billing**            | Usage-based         |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input  | Cached input | Output |
| ------ | ------------ | ------ |
| \$1.72 | \$0.215      | \$5.16 |

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
| Prompt caching     | ✅         |

## Example request

The example below calls `qwen3.8-2.4t-a95b` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.8-2.4t-a95b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Qwen3.7-Max" icon="git-compare" href="/en/models/qwen3-7-max">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
