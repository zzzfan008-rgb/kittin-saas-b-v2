> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6.1 Sol Is Live: Near-Astra Smarts, Half-Price Cache Reads

> OpenAI released GPT-6.1 Sol at DevDay on 29 September 2026. It comes close to GPT-6 Astra, keeps GPT-6 Sol's $2 input / $10 output pricing, and cuts cache reads from $0.20 to $0.10. Live on APIYI with all four billing items matching the provider.

## Key Takeaways

* **Cache reads cut in half**: `gpt-6.1-sol` keeps the same \$2 input / \$10 output as `gpt-6-sol`, while **cache reads drop from \$0.20 to \$0.10** per 1M tokens, just 5％ of the standard input price. Cache-heavy workloads such as multi-turn chat, agents and coding assistants will see a noticeably smaller bill
* **Close to Astra**: 52 on the Artificial Analysis Intelligence Index at max effort, 4 points above GPT-6 Sol and only 1 point below GPT-6 Astra. OpenAI says it matches Astra on DeepSWE v1.1 at roughly one-fifth the price
* **Fewer factual errors**: on deliberately difficult factuality prompts at low reasoning effort, OpenAI reports the share of responses containing a factual error falling from 11.4％ to 7.7％
* **Live on APIYI**: all four billing items match the provider with no markup; savings come from our top-up promotions, see [Top-up Promotions](/en/faq/recharge-promotions)
* **One change to note**: reasoning effort no longer supports `none`; the lowest level is `low`

## Background

On 22 September, OpenAI released GPT-6 Sol and Luna, halving the price of its main tier. One week later, on 29 September at DevDay 2026, OpenAI launched an upgraded Sol: **GPT-6.1 Sol**.

The point of this release is getting close to Astra-level capability at Sol pricing. According to OpenAI, GPT-6.1 Sol approaches GPT-6 Astra on agentic coding, computer use and professional document work, while its standard input and output prices are one-fifth of Astra's. The other change that hits the bill directly is the cache read price, which is halved from \$0.20 to \$0.10 per 1M tokens.

APIYI has launched `gpt-6.1-sol` with **input, output, cache read and cache write all priced in line with the provider**.

## In Detail

### Benchmarks

**Independent evaluation (Artificial Analysis Intelligence Index)**

| Reasoning effort | GPT-6.1 Sol |
| - | - |
| `max` | **52** |
| `xhigh` | 51 |
| `high` | 50 |
| `medium` | 48 |
| `low` | 42 |

Per Artificial Analysis, GPT-6.1 Sol is 4 points above GPT-6 Sol, 5 points above GPT-5.6 Sol, and 1 point below GPT-6 Astra.

**Vendor-reported**

| Benchmark | GPT-6.1 Sol | GPT-6 Sol | GPT-6 Astra |
| - | - | - | - |
| **DeepSWE v1.1** | **75.2％** (high) | 68.8％ (max) | 74.8％ (high) |
| **OSWorld 2.0** | **71.4％** (max) | 64.4％ (max) | 73.5％ (max) |
| **GDP.pdf** | **32.0％** (high) | 28.0％ | 32.2％ |
| **AutomationBench 1.0.6** | **36.0％** (high) | 31.2％ (medium) | — |

OpenAI also frames it in cost terms: on OSWorld 2.0 it is about 2.1 points behind Astra at roughly one-seventh the cost per task; on AutomationBench at medium effort it beats Claude Opus 5.5 by 2.2 points at roughly one-third the cost.

<Info>
  Independent results are from Artificial Analysis (`artificialanalysis.ai/models/releases/gpt-6-1-sol`). Vendor-reported figures come from OpenAI's launch materials as compiled by Vellum and VentureBeat; parentheses show the reasoning effort used, and they have not been independently reproduced. Data retrieved on 30 September 2026.
</Info>

### Key Features

<CardGroup cols={2}>
  <Card title="Half-Price Cache Reads" icon="database">
    Half the cache read price of GPT-6 Sol, just 5％ of standard input. Biggest gains where system prompts, tool definitions or long documents are hit again and again
  </Card>

  <Card title="Near-Astra Capability" icon="trophy">
    Close to the flagship on agentic coding, computer use and professional documents, billed at the Sol tier
  </Card>

  <Card title="Better Factuality" icon="circle-check">
    Responses with factual errors fall from 11.4％ to 7.7％ at low effort; OpenAI says it stays within 1.9 points of Astra across all settings
  </Card>

  <Card title="Ultrafast Option" icon="gauge">
    OpenAI says an Ultrafast tier is coming, with up to about 6x generation speed via the API at 6x the standard price. We will announce it separately once it is available on APIYI
  </Card>
</CardGroup>

### Specifications

| Parameter | GPT-6.1 Sol |
| - | - |
| **Model ID** | `gpt-6.1-sol` |
| **Context window** | 1,050,000 tokens (max single input 922K) |
| **Max output** | 128,000 tokens |
| **Knowledge cutoff** | 30 April 2026 |
| **Reasoning effort** | `low` / `medium` (default) / `high` / `xhigh` / `max`; **`none` / `minimal` not supported** |
| **Input / output modalities** | Text, image / text |
| **Features** | Streaming, function calling, structured outputs, prompt caching |

## Practical Use

### Recommended Scenarios

* **Coding assistants and agents**: system prompts and code context are re-read from cache every turn, so halved cache reads show up directly on the bill
* **Long-document analysis**: ask repeated questions about the same contract, financial report or codebase, with cached tokens billed at just \$0.10
* **Mid-difficulty tasks currently on Astra**: run a comparison with GPT-6.1 Sol first; capability is close and the price is about one-fifth

### Code Examples

<CodeGroup>
  ```python Responses API theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6.1-sol",
      reasoning={"effort": "medium"},   # low / medium / high / xhigh / max
      input="Review this code, point out potential bugs and suggest fixes: ...",
  )
  print(response.output_text)
  ```

  ```python Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6.1-sol",
      reasoning_effort="medium",
      messages=[
          {"role": "user", "content": "Summarize the core goals of this requirements doc in three sentences: ..."}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer sk-your-apiyi-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6.1-sol",
      "reasoning": {"effort": "medium"},
      "input": "In one sentence, what changed from GPT-6 Sol to GPT-6.1 Sol?"
    }'
  ```
</CodeGroup>

### Best Practices

* **Migrating from GPT-6 Sol is mostly a model-name change**: `gpt-6-sol` → `gpt-6.1-sol`. The one thing to check is reasoning effort: **code that passes `none` must switch to `low`**
* **Prefer Responses for tool calling**: OpenAI's model docs list tool calling under the Responses API, so use `/v1/responses` for function calling and multi-step agents
* **Put stable content first**: place system prompts, tool definitions and long documents at the start of the message so later turns hit the cache at \$0.10
* **Stay within 272K input where possible**: above that, the whole request moves to a higher pricing tier (see the tier table below)
* **Leave room for reasoning**: reasoning tokens count toward the output limit, so do not set `max_output_tokens` too tight

## Pricing and Availability

### Pricing

Provider list prices (USD per 1M tokens, input up to 272K):

| Item | GPT-6.1 Sol | GPT-6 Sol | GPT-6 Astra |
| - | - | - | - |
| **Input** | \$2.00 | \$2.00 | \$10.00 |
| **Output** | \$10.00 | \$10.00 | \$50.00 |
| **Cache read** | **\$0.10** | \$0.20 | \$1.00 |
| **Cache write (5 min)** | \$2.50 | \$2.50 | \$12.50 |

The GPT-6.1 Sol column is also APIYI's pricing: **all four billing items match the provider, with no markup**.

<Note>Model prices are aligned with the provider and may change with them; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

### Long-Context Tiers

As with the provider, when a single request's input exceeds 272K tokens, **the entire request** is billed at the second tier:

| Input tokens | Input | Output | Cache read | Cache write |
| - | - | - | - | - |
| 0 - 272K | \$2.00 | \$10.00 | \$0.10 | \$2.50 |
| Above 272K | \$4.00 | \$15.00 | \$0.20 | \$5.00 |

Tiers are determined per request, not by cumulative account usage.

### What Half-Price Cache Reads Save

Take a typical coding-assistant turn: 100K input tokens, of which 90K hit the cache and 10K are new, plus 2K output tokens.

| Cost per turn | GPT-6 Sol | GPT-6.1 Sol |
| - | - | - |
| Cache read 90K | \$0.018 | \$0.009 |
| New input 10K | \$0.020 | \$0.020 |
| Output 2K | \$0.020 | \$0.020 |
| **Total** | **\$0.058** | **\$0.049** |

With input and output prices unchanged, the cache alone makes each such turn about 16％ cheaper; the higher the cache share and the shorter the output, the more you save.

### Groups and Endpoints

| Item | Details |
| - | - |
| **Model name** | `gpt-6.1-sol` |
| **Groups** | `default` / `svip` / `CodexResponses` / `CodexReverse` |
| **Endpoints** | `/v1/responses` (recommended), `/v1/chat/completions` |
| **Base URL** | `https://api.apiyi.com/v1` |

See [group differences](/en/faq/codex-claudecode-default-groups).

### Stack With Top-up Promotions

Model prices match the provider, and the savings come through our top-up promotions: bonus credit on top-ups lowers your effective cost further, and top-ups settle at a fixed 1:7 exchange rate. See [Top-up Promotions](/en/faq/recharge-promotions).

## Summary and Recommendations

GPT-6.1 Sol is a same-price upgrade with better capability and cheaper caching: input and output prices match GPT-6 Sol, capability comes close to GPT-6 Astra, and cache reads are half price. For cache-heavy coding and agent workloads, that is a cost reduction you will see directly on the bill.

**Recommendations**:

1. **Current `gpt-6-sol` users**: switch to `gpt-6.1-sol` and check whether you pass `reasoning_effort: none`; nothing else needs to change
2. **Using `gpt-6-astra` for mid-difficulty tasks**: run your own tasks through both; if capability is close, cost drops to about one-fifth
3. **Cache-heavy workloads**: keep a stable prefix at the very start of your messages to get the most out of the halved cache price

<Info>
  Sources: OpenAI model docs `developers.openai.com/api/docs/models/gpt-6.1-sol`; Artificial Analysis `artificialanalysis.ai/models/releases/gpt-6-1-sol`; reporting by TechCrunch, VentureBeat, Vellum and others (29 September 2026). Data retrieved on 30 September 2026. APIYI pricing is subject to live platform data.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.