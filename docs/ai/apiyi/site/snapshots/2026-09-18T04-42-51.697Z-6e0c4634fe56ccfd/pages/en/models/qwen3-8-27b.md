> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-27B

> Qwen3.8-27B on APIYI: $0.44 input / $1.76 output per 1M tokens, 262,144 context, available in 2 billing groups.

An Apache-2.0 dense 27B vision-language model taking text, image and video input; at one-ninetieth the size of the same-generation open flagship, it keeps the vision that the larger open release drops.

## Specifications

| Item                   | Value              |
| ---------------------- | ------------------ |
| **Model ID**           | `qwen3.8-27b`      |
| **Vendor**             | Alibaba            |
| **Vendor release**     | 2026-08-14         |
| **Available on APIYI** | 2026-09-03         |
| **Knowledge cutoff**   | Not disclosed      |
| **Input modalities**   | Text, Image, Video |
| **Output modalities**  | Text               |
| **Context window**     | 262,144 tokens     |
| **Billing**            | Usage-based        |

## Pricing

Prices in USD per 1M tokens (\$/1M).

| Input  | Cached input | Output |
| ------ | ------------ | ------ |
| \$0.44 | \$0.088      | \$1.76 |

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
| Vision             | ✅         |
| Prompt caching     | ✅         |

## Example request

The example below calls `qwen3.8-27b` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.8-27b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Related docs

<CardGroup cols={2}>
  <Card title="Qwen3.8-2.4T-A95B" icon="git-compare" href="/en/models/qwen3-8-2-4t-a95b">
    Details for a model in the same family
  </Card>

  <Card title="Model pricing directory" icon="table" href="/en/models">
    Live pricing, endpoints and groups for all models
  </Card>
</CardGroup>

<Note>Specs on this page are maintained by hand in `models/data/model-details.json`; pricing and endpoints come from the live pricing API and are refreshed with every rebuild.</Note>
