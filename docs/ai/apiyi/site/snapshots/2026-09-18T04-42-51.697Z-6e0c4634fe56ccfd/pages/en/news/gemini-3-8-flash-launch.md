> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash Is Live: API Access Ahead of the Docs

> Google's gemini-3.8-flash, out on September 2, 2026, is now callable on APIYI. Google's own docs have not listed it yet, so we ran 150 pre-launch test cases: capability parity with 3.7 Flash, priced identically at $0.75/$3.75.

## Key Points

* **Available on the API first**: Google put out `gemini-3.8-flash` on September 2, 2026, roughly three weeks after 3.7 Flash. **Google's own model docs and launch blog do not list this version yet** — APIYI has it open for calls
* **Priced identically to 3.7 Flash**: \$0.75 in / \$3.75 out per 1M tokens, \$0.0750 cached reads. **Migrating from 3.7 changes nothing about your costs**
* **150 pre-launch test cases**: paired against `gemini-3.7-flash` across both protocols — core capability, reasoning, tool calling and multimodal all line up, **with no regression unique to 3.8**
* **Two endpoints, two groups**: both the OpenAI-compatible format and the Gemini native format work; the `default` and `svip` groups are both open
* **Official numbers pending**: third-party outlets report this version targets coding and agents and cuts verbose output, but **no official benchmarks or specs have been published**, so this article does not relay them

## Background

Flash is the **middle tier** of the Gemini line — Pro sits above it, Flash-Lite below — and it carries the majority of production workloads where capability is sufficient and unit price has to survive real volume.

The cadence on this line over the past two months has been unusually fast: 3.6 Flash on July 21, 3.7 Flash on August 13, and now 3.8 Flash on September 2 — **three versions in five weeks**.

What is different this time is that the model **arrived ahead of the documentation**. As of this article, neither Google's Gemini API model list nor the DeepMind model card carries an entry for 3.8 Flash, and no launch blog post is up. Third-party tech outlets report the internal codename `skimaki`, availability inside Google Cloud's Agent Studio, and a focus on coding, agent tasks, and reducing the verbose output that earlier Flash releases were repeatedly criticized for.

<Warning>
  Those improvement claims come from third-party reporting, **not from Google**. Official benchmark scores, context window, and knowledge cutoff are all unpublished right now — we neither relay nor guess at them. This article will be updated once official material lands.
</Warning>

## Details

### Pre-launch testing

Precisely because the official specs are not out, we focused on what we could verify ourselves: a paired comparison against `gemini-3.7-flash`, with both models fired **simultaneously** on every case so they land in the same time window and short-term fluctuation cannot be mistaken for a model difference.

The run covered **150 case logs and 198 HTTP calls** across both the Gemini native and OpenAI-compatible protocols.

| Dimension                            | gemini-3.8-flash              | gemini-3.7-flash |
| ------------------------------------ | ----------------------------- | ---------------- |
| Core capability (native)             | 14/14                         | 14/14            |
| Core capability (OpenAI-compatible)  | 12/13                         | 12/13            |
| Reasoning tasks (5 types × 2 rounds) | 10/10                         | 10/10            |
| Parallel tool calls                  | 4/4                           | 4/4              |
| Image understanding                  | 2/2                           | 2/2              |
| Video understanding                  | 2/2                           | 2/2              |
| Response field-set differences       | 1 group total, 0 type changes | —                |

A few points worth calling out:

* **Function calling closes the loop**: single call, result hand-back, parallel and sequential calling all completed; parallel calling returned two calls with intact arguments and IDs across two rounds
* **Long context works**: on a needle-in-context task with a 14,543-character prefix and a 128-token output cap, both models returned the same correct answer
* **Structured output is byte-identical**: given the same JSON Schema, both models returned exactly the same JSON
* **Multimodal accounting matches**: on the same image and the same video clip, IMAGE and VIDEO modality token counts came back digit-for-digit identical to 3.7 Flash
* **Thinking tiers work**: `low` / `medium` / `high` were all accepted, with thinking tokens scaling across the tiers

The one cell short of full marks (12/13 on OpenAI-compatible) is a negative probe — an invalid thinking tier that should return 4xx returns 200 instead. **`gemini-3.7-flash` behaves exactly the same way on that case**, so it is pre-existing behavior, not a 3.8 regression.

### Specifications

| Item                        | Value                                                                            |
| --------------------------- | -------------------------------------------------------------------------------- |
| Model ID                    | `gemini-3.8-flash`                                                               |
| Input modalities            | text / image / audio / video (image and video verified in testing)               |
| Output modality             | text                                                                             |
| Thinking tiers              | low / medium / high                                                              |
| Endpoints                   | `/v1/chat/completions` (OpenAI-compatible), `/v1beta/models/...` (Gemini native) |
| Groups                      | `default` / `svip`                                                               |
| Context window / max output | not published by Google                                                          |
| Knowledge cutoff            | not published by Google                                                          |

## Putting It to Work

### Where it fits

* **A flat migration from 3.7 Flash**: same price, same protocols, same parameter shapes — change the model name in one place. This is the most direct use of this launch
* **Coding and code review**: the focus of three consecutive Flash releases, and reportedly pushed further here
* **Agents and multi-step workflows**: parallel tool calling tested stable, which suits orchestration that needs several calls back at once
* **Long documents and multimodal batches**: image and video understanding verified, with accounting identical to 3.7, so your existing cost estimates carry over

### Code examples

<CodeGroup>
  ```python OpenAI-compatible theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gemini-3.8-flash",
      messages=[
          {"role": "user", "content": "Write a Python HTTP client with retries and exponential backoff"}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```bash Gemini native theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Write a Python HTTP client with retries and exponential backoff"}]}]
    }'
  ```
</CodeGroup>

The native endpoint takes your APIYI key directly (`x-goog-api-key: sk-...`) — no Google API key needed.

### Best practices

* **Migrating from 3.7 means changing the model name only**: request shape, parameters and response fields are unchanged; testing found a single field-set difference and zero type changes, so clients need no adaptation
* **Match the thinking tier to the task**: `low` for batch classification and extraction where latency matters, `high` for complex refactoring and multi-step agents
* **Ramp gradually**: with official specs unpublished, there is no authoritative figure for the context limit. If you lean heavily on long context, run a slice of traffic first and confirm the boundary before cutting over

<Warning>
  A few behaviors are shared with `gemini-3.7-flash`, so you will not hit them as new surprises: implicit cache hit rates on the Gemini side are modest to begin with, and eight consecutive rounds produced no observed hits; explicit caching (`cachedContents`) and the `countTokens` endpoint are not enabled at the gateway; and `stop` and `seed` on the OpenAI-compatible path have no effect — use `stopSequences` and `seed` on the Gemini native format if you need them. All of these apply to both models, not just 3.8.
</Warning>

## Pricing and Availability

| Billing item                           | Price (per 1M tokens) |
| -------------------------------------- | --------------------- |
| Input (prompt)                         | \$0.7500              |
| Output (completion, thinking included) | \$3.7500              |
| Cached read                            | \$0.0750              |

**Line-for-line identical to `gemini-3.7-flash`**, so migrating from 3.7 changes nothing about your costs and your existing budget carries over.

<Info>
  Google has not published official pricing for 3.8 Flash. For reference: the \$0.75 / \$3.75 currently in effect for 3.7 Flash is Google's own limited-time promotional rate, stated as valid through December 31, 2026. If Google publishes 3.8 pricing that differs from what is in effect now, we will adjust and announce it in advance.
</Info>

### Stacking with top-up promotions

APIYI prices match the provider line for line, and **discounts come through top-up bonuses**, which stack on top of the rates above:

📖 [Top-up promotion details](/en/faq/recharge-promotions)

## Bottom Line

3.8 Flash is a launch that got ahead of its own documentation. Until the official benchmarks and specs are out, the most useful thing we can offer is not repeated rumor but a set of numbers we generated ourselves: **across 150 test cases it lines up with 3.7 Flash item by item, with no regression unique to it, at exactly the same price.**

So the recommendation is simple: **if you are already on `gemini-3.7-flash`, change the model name in one place and start a canary** — same price, same protocols, same parameters, and a migration cost close to zero. If you depend heavily on long context, waiting for the official specs before a full cutover is the safer call.

<Info>
  Sources: model availability and pricing from APIYI platform testing (September 2, 2026); release cadence and improvement direction from third-party tech reporting — Google has not published a formal announcement for this model. Google's own channels: `ai.google.dev/gemini-api/docs/models`, `deepmind.google/models/gemini/flash/`. Pricing follows the live data on the APIYI model pricing page.
</Info>
