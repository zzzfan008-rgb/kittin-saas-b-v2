> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Sol and Luna Are Live: Half the Price, Cut the Same Day as Claude

> OpenAI released GPT-6 Sol and GPT-6 Luna on 22 September 2026 at about half the previous generation's price, as permanent pricing: Sol at $2 input / $10 output and Luna at $0.10 / $0.50 per 1M tokens. Live on APIYI with all four billing items matching the provider; both Chat and Responses endpoints tested and working.

## Key Takeaways

* **Prices dropped again**: `gpt-6-sol` is \$2 input / \$10 output and `gpt-6-luna` is \$0.10 / \$0.50 per 1M tokens, about half of the previous `gpt-5.6-sol` / `gpt-5.6-luna`. OpenAI says this is **permanent pricing**, not a limited-time promotion
* **Clear division of labor**: Sol is for everyday complex work such as building features, reviewing code, debugging and data analysis; Luna is for high-volume tasks such as summarization, extraction and simple Q\&A
* **Flagship-class specs**: both have a 1.05M context window, 128K max output and six reasoning effort levels (`none` to `max`), defaulting to `medium`
* **Live on APIYI**: available in the `default` / `svip` / `CodexResponses` groups with all four billing items matching the provider; `/v1/chat/completions` and `/v1/responses`, including function calling, **all passed our tests**
* **Same-day price cut as Claude**: on the same day, Anthropic released Claude Opus 5.5 at a lower price. When both leading providers cut prices at once, developers and end users benefit most directly

## Background

On 3 September, OpenAI released its new flagship GPT-6 Astra, priced at \$10 / \$50 and aimed at computer use and long-horizon agents. Nineteen days later, on 22 September, the GPT-6 family gained its mid and light tiers: **Sol and Luna**.

The headline here is price rather than benchmarks. Sol's input and output prices are each half of the previous `gpt-5.6-sol`, and Luna's output price falls from \$1.20 to \$0.50. OpenAI stresses that these are permanent prices, not launch promotions.

On the same day, Anthropic released Claude Opus 5.5, also priced below its predecessor. Two leading providers cutting prices on the same day shows that price competition is still going: the same budget does more, or the same task costs less. For teams using both families on APIYI, the benefit shows up directly on the bill.

APIYI has launched `gpt-6-sol` and `gpt-6-luna` with **input, output, cache read and cache write all priced in line with the provider**.

## In Detail

### Which One to Use

<CardGroup cols={2}>
  <Card title="GPT-6 Sol: Everyday Workhorse" icon="sun">
    Complex work that comes up again and again: building features, code review, debugging, data analysis. 68.8% on DeepSWE v1.1, and on par with Claude Fable 5.1 on FrontierCode at xhigh
  </Card>

  <Card title="GPT-6 Luna: High Volume" icon="moon">
    Well-scoped tasks such as summarization, extraction, simple Q\&A and classification. Output at \$0.50 per 1M tokens, still 66.6% on DeepSWE v1.1
  </Card>
</CardGroup>

Within the family: use `gpt-6-astra` for computer use and the longest agent tasks; evaluate most other workloads on Sol first; send high-volume, simple jobs to Luna.

### Benchmarks

| Benchmark | GPT-6 Sol | GPT-6 Luna |
| - | - | - |
| **DeepSWE v1.1** (max) | **68.8%** | 66.6% |
| **AutomationBench 1.0.6** | **33.2%** (xhigh) | 30.3% |
| **OSWorld 2.0** (xhigh) | 60.5% | — |
| **Agents' Last Exam** (max) | 56.4% | — |

OpenAI also shared a cost comparison: on AutomationBench, Sol at xhigh scores 33.2% at about \$0.27 per task, while Claude Opus 5 at max scores 26.9% at roughly 11 times Sol's cost.

<Info>
  Sources: OpenAI's launch materials as reported by VentureBeat and MarkTechPost (22 September 2026); not yet independently reproduced. Parentheses show the reasoning effort used. Data retrieved 23 September 2026.
</Info>

### Technical Specs

| Parameter | GPT-6 Sol | GPT-6 Luna |
| - | - | - |
| **Model ID** | `gpt-6-sol` | `gpt-6-luna` |
| **Context length** | 1,050,000 tokens | 1,050,000 tokens (922K max input per request) |
| **Max output** | 128,000 tokens | 128,000 tokens |
| **Knowledge cutoff** | 20 April 2026 | 18 May 2026 |
| **Reasoning effort** | `none` / `low` / `medium` (default) / `high` / `xhigh` / `max` | Same |
| **Input / output modalities** | Text, image / text | Text, image / text |
| **Features** | Streaming, function calling, structured outputs, prompt caching | Same |

### APIYI Endpoint Tests (23 September 2026)

On launch day we ran 5 minimal requests against each model, and **all 10 returned HTTP 200**:

| Case | gpt-6-sol | gpt-6-luna |
| - | - | - |
| `/v1/chat/completions` plain text | ✅ | ✅ |
| `/v1/chat/completions` + function tool | ✅ tool call returned | ✅ tool call returned |
| `/v1/chat/completions` + function tool + `reasoning_effort` | ✅ | ✅ |
| `/v1/responses` plain text | ✅ | ✅ |
| `/v1/responses` + function tool | ✅ | ✅ |

<Tip>
  Unlike GPT-6 Astra, **Sol and Luna accept function tools on the Chat Completions endpoint**, and `tools` can be sent together with `reasoning_effort`. Existing Chat code only needs a new model name.
</Tip>

<Warning>
  **Leave room for reasoning in the output limit**: reasoning tokens count toward it. In our test, Luna with `max_output_tokens` set to 64 spent the whole budget on reasoning and returned no text. Don't set the limit too tight for normal calls.
</Warning>

## Using It

### Code Examples

<CodeGroup>
  ```python Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-sol",
      reasoning_effort="medium",   # none / low / medium / high / xhigh / max
      messages=[
          {"role": "user", "content": "Review this code, point out likely bugs and suggest fixes"}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```python Responses API theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-luna",
      reasoning={"effort": "low"},
      input="Summarize this support conversation in three bullet points: ...",
  )
  print(response.output_text)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-sol",
      "reasoning_effort": "medium",
      "messages": [{"role": "user", "content": "In one sentence, how do GPT-6 Sol and Luna differ?"}]
    }'
  ```
</CodeGroup>

### Best Practices

* **Migrating from 5.6 is a model-name change**: `gpt-5.6-sol` → `gpt-6-sol`, `gpt-5.6-luna` → `gpt-6-luna`; request shapes on both endpoints stay the same
* **Pick reasoning effort per task**: the default is `medium`. Raise coding and agent work to `high` or `xhigh`; run Luna batch summarization and extraction at `low` or `none` for more speed and fewer reasoning tokens
* **Use caching**: cache reads cost a tenth of standard input. Put stable content such as system prompts and tool definitions at the start of the messages so every turn hits the cache
* **Keep context under 272K where you can**: above that, the whole request moves to a higher pricing tier (see the tier table below)

## Pricing and Availability

### Pricing

Provider list prices (USD per 1M tokens, input up to 272K):

| Item | GPT-6 Sol | GPT-5.6 Sol | GPT-6 Luna | GPT-5.6 Luna |
| - | - | - | - | - |
| **Input** | **\$2.00** | \$4.00 | **\$0.10** | \$0.20 |
| **Output** | **\$10.00** | \$20.00 | **\$0.50** | \$1.20 |
| **Cache read** | **\$0.20** | \$0.40 | **\$0.01** | \$0.02 |
| **Cache write (5 min)** | **\$2.50** | \$5.00 | **\$0.125** | \$0.25 |

This table is also APIYI's pricing: **all four items match the provider, with no markup**.

<Info>
  **Our model prices match the provider; we don't mark them up.** On top of that, some groups carry discounts and you can stack top-up bonuses. That is our own give-back and separate from the model's pricing. Top-ups settle at a fixed 1:7 exchange rate.
</Info>

### Long-Context Tier

As on the provider's side, when a single request's input exceeds 272K tokens, **the whole request** is billed at the second tier (input and cache ×2, output ×1.5):

| Input tokens | Model | Input | Output | Cache read | Cache write |
| - | - | - | - | - | - |
| 0 - 272K | `gpt-6-sol` | \$2.00 | \$10.00 | \$0.20 | \$2.50 |
| Above 272K | `gpt-6-sol` | \$4.00 | \$15.00 | \$0.40 | \$5.00 |
| 0 - 272K | `gpt-6-luna` | \$0.10 | \$0.50 | \$0.01 | \$0.125 |
| Above 272K | `gpt-6-luna` | \$0.20 | \$0.75 | \$0.02 | \$0.25 |

Tiers are decided per request, not accumulated per account. See the [model pricing page](/en/models/index) for live figures.

### Groups and Endpoints

| Item | Details |
| - | - |
| **Model names** | `gpt-6-sol` / `gpt-6-luna` |
| **Groups** | `default` / `svip` / `CodexResponses` |
| **Endpoints** | `/v1/chat/completions`, `/v1/responses` (both support function calling) |
| **Base URL** | `https://api.apiyi.com/v1` |

For group differences, see [Groups Explained](/en/faq/codex-claudecode-default-groups).

### Stack with Top-Up Promotions

APIYI top-up bonuses lower your effective cost further. See [Recharge Promotions](/en/faq/recharge-promotions).

## Summary

GPT-6 Sol and Luna bring OpenAI's workhorse and light tiers down to about half the previous generation's price, as permanent pricing. With Claude Opus 5.5 also launching at a lower price the same day, both leading providers are giving back at once, and developers can run more work on a smaller budget.

**Recommendations**:

1. **`gpt-5.6-sol` / `gpt-5.6-luna` users**: change the model name to roughly halve the cost; no code changes on either the Chat or Responses endpoint
2. **Cost-sensitive batch work**: Luna output is only \$0.50 per 1M tokens; pair it with `low` reasoning effort and caching for large-scale summarization and extraction
3. **Not sure which provider to use**: on APIYI one key calls both GPT-6 and Claude, so run your own tasks through each and compare

<Info>
  Sources: OpenAI model docs `developers.openai.com/api/docs/models/gpt-6-sol` and `developers.openai.com/api/docs/models/gpt-6-luna`, plus coverage from VentureBeat, MarkTechPost, TechCrunch and others. Endpoint tests run by APIYI on 23 September 2026. APIYI prices follow live platform data.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.