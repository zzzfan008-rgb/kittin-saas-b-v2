> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.1 Flash Lite Goes GA: The Sweet Spot for High-Throughput Agents & Low-Latency Workloads

> Gemini 3.1 Flash Lite reached general availability on May 8, 2026. 64% faster output than 2.5 Flash, 86.9% on GPQA Diamond, priced at $0.25/$1.50 per 1M tokens. Live at APIYi via official direct connection with up to 21% off via top-up promotions.

## Key Highlights

* **Now Generally Available**: Google announced GA for Gemini 3.1 Flash Lite on May 8, 2026 (UTC+8) — production-ready
* **Model Identifier Updated**: `gemini-3.1-flash-lite-preview` → `gemini-3.1-flash-lite`. Preview users should plan migration
* **Massive Speed Boost**: **64% faster** output than 2.5 Flash (381.9 vs 232.3 tokens/sec) and **2.5× faster** time-to-first-token
* **Official Pricing Parity**: \$0.25 per 1M input / \$1.50 per 1M output — identical to Google's official rates
* **Stackable Top-up Promo**: APIYi top-up bonuses bring effective price down to **79–85% of list** (up to 21% off)

## Background

On March 3, 2026, Google launched Gemini 3.1 Flash Lite Preview, targeting the "high-throughput agents + ultra-low latency" niche. During the two-month preview, agent-heavy customers like Latitude, Cartwheel, Whering, and HubX gave strong feedback on instruction-following precision, latency, unit cost, and multimodal stability.

On **May 8, 2026 (UTC+8)**, Google formally announced **general availability**. The model identifier dropped the `-preview` suffix and became `gemini-3.1-flash-lite`. With the API contract, behavior, and billing rules now stabilized, it's safe to wire into production.

APIYi has synced GA via the official direct-connection (proxy) channel. Pricing matches Google's official rates exactly, and stacking APIYi's top-up bonus brings the effective price below list — making this one of the cheapest reliable ways to consume the Gemini 3.1 lightweight tier.

## Detailed Analysis

### What changed from Preview to GA

<CardGroup cols={2}>
  <Card title="Model Identifier" icon="tag">
    * Old: `gemini-3.1-flash-lite-preview`
    * New: `gemini-3.1-flash-lite`
    * Old name still works, migration recommended
  </Card>

  <Card title="API Stability" icon="shield-check">
    * Frozen interface contract
    * Stable rate limits and billing
    * Safe for production traffic
  </Card>

  <Card title="Performance Polish" icon="gauge">
    * Higher sustained output speed
    * Lower TTFT
    * More stable function calling & structured output
  </Card>

  <Card title="Ecosystem Maturity" icon="layers">
    * Batch API & Caching production-ready
    * Thinking levels available in production
    * Full multimodal input stable
  </Card>
</CardGroup>

### Performance highlights (GA benchmarks)

Per Artificial Analysis and Google's official numbers:

| Metric                                 | Gemini 3.1 Flash Lite             | Gemini 2.5 Flash | Delta        |
| -------------------------------------- | --------------------------------- | ---------------- | ------------ |
| Output speed (tokens/sec)              | **381.9**                         | 232.3            | +64%         |
| Time-to-first-token                    | **2.5×** faster than 2.5 Flash    | baseline         | -60%         |
| GPQA Diamond                           | **86.9%**                         | —                | Tier-leading |
| MMMU Pro (multimodal reasoning)        | **76.8%**                         | —                | Tier-leading |
| Arena Elo                              | **1432**                          | —                | —            |
| Artificial Analysis Intelligence Index | **34** (median in price tier: 21) | —                | Well above   |

Across 11 benchmarks Google ran internally, Gemini 3.1 Flash Lite **beat GPT-5 mini and Claude Haiku 4.5 on 6**, at materially lower per-token cost.

### Technical specs

| Spec                                  | Value                            |
| ------------------------------------- | -------------------------------- |
| Model name                            | `gemini-3.1-flash-lite`          |
| Context window                        | 1,048,576 tokens (1M+)           |
| Max output                            | 65,536 tokens (64K)              |
| Input modalities                      | Text, image, video, audio, PDF   |
| Output modality                       | Text                             |
| Knowledge cutoff                      | January 2025                     |
| Latest update                         | May 2026                         |
| Thinking                              | ✅ adjustable levels              |
| Function calling                      | ✅                                |
| Structured output                     | ✅                                |
| Code execution                        | ✅                                |
| File search / URL context             | ✅                                |
| Search Grounding / Maps Grounding     | ✅                                |
| Batch API / Caching / Flex / Priority | ✅                                |
| Channel                               | APIYi official direct connection |

## Real-World Use Cases

### Recommended scenarios

<CardGroup cols={2}>
  <Card title="Production Agent Pipelines" icon="bot">
    * Tool calling / routing / multi-step orchestration
    * High-concurrency lightweight decision nodes
    * SLA-sensitive agent tasks needing stable APIs
  </Card>

  <Card title="High-Throughput Data Processing" icon="database">
    * Tabular / form / PDF structured extraction
    * Bulk content moderation, classification, tagging
    * Mass log summarization & normalization
  </Card>

  <Card title="Low-Latency Interaction" icon="bolt">
    * Real-time translation & interpretation assist
    * UI generation, dashboard composition
    * First-touch customer support, intent detection
  </Card>

  <Card title="Lightweight Multimodal Tasks" icon="images">
    * Image / video understanding
    * Audio transcription + key info extraction
    * PDF parsing & field extraction
  </Card>
</CardGroup>

### Code examples

Calling the GA build via APIYi:

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite",  # GA, no -preview suffix
    messages=[
        {"role": "system", "content": "You are an efficient structured-data extraction assistant."},
        {"role": "user", "content": "Extract order_id, amount, and currency from the order text. Return JSON."}
    ],
    temperature=0.2,
    response_format={"type": "json_object"}
)

print(response.choices[0].message.content)
```

**Agent tool-calling example**

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "search_internal_kb",
        "description": "Search the internal knowledge base",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "top_k": {"type": "integer", "default": 5}
            },
            "required": ["query"]
        }
    }
}]

resp = client.chat.completions.create(
    model="gemini-3.1-flash-lite",
    messages=[{"role": "user", "content": "Find docs about the refund process."}],
    tools=tools,
    tool_choice="auto"
)
print(resp.choices[0].message.tool_calls)
```

### Best practices

<Info>
  **Production rollout tips**

  1. **Smooth migration from Preview**: replace `gemini-3.1-flash-lite-preview` with `gemini-3.1-flash-lite`; shadow-traffic compare before cutover
  2. **Thinking levels on demand**: keep Thinking off for routing/classification to maximize speed; turn on for multi-step reasoning
  3. **Prefer structured output**: pair with `response_format={"type": "json_object"}` for robust downstream parsing
  4. **Batch + Cache**: route high-volume jobs through Batch API; enable Caching on repeated context for an extra 90% off cached input
  5. **Watch verbosity**: Flash Lite tends to be talkative — set `max_tokens` explicitly on cost-sensitive endpoints
</Info>

## Pricing & Availability

### APIYi official-direct pricing

<Card title="Identical to Google's official rates" icon="tag">
  | Type                       | Price                                 |
  | -------------------------- | ------------------------------------- |
  | Text / image / video input | \$0.250 per 1M tokens                 |
  | Output                     | \$1.500 per 1M tokens                 |
  | Cached input               | \$0.025 per 1M tokens (\~10% of list) |

  * Official direct-connection (proxy) channel, stable
  * Pricing identical to Google's official rates
  * Stack with Batch API for further savings
</Card>

### Stackable top-up promotion (79–85％ of list)

APIYi runs ongoing top-up bonus promotions. Stacking these on top of the official-direct pricing brings effective cost for Gemini 3.1 Flash Lite down to **79–85% of list**:

| Tier            | Bonus | Effective price   |
| --------------- | ----- | ----------------- |
| Starter         | +18%  | \~**85% of list** |
| Pro             | +22%  | \~**82% of list** |
| High-throughput | +27%  | \~**79% of list** |

See the top-up promotion page: [Recharge Promotions](/en/faq/recharge-promotions).

<Warning>
  **Migration note**

  * Google will keep `gemini-3.1-flash-lite-preview` available for some time, but **new integrations should target the GA build** `gemini-3.1-flash-lite`
  * GA stabilizes the contract, but keep monitoring and fallbacks on critical paths
</Warning>

## Summary & Recommendations

GA Gemini 3.1 Flash Lite pushes "**speed / price / multimodality / agent capability**" to the top of its tier all at once:

* **64% faster output / 2.5× faster TTFT** vs 2.5 Flash — visibly snappier on long agent loops
* **GPQA Diamond 86.9% / MMMU Pro 76.8%** — first-tier on reasoning and multimodal at this price
* **\$0.25 / \$1.50 per 1M tokens**, plus APIYi top-up promo down to **\~79% of list**
* **Stable contract post-GA** — production-ready

**Our recommendations**

* **Teams on Preview**: cut over to the GA model name to lock in a stable contract
* **High-volume agent teams**: route routing / tool-calling / extraction nodes through Flash Lite; combine with Batch + Cache to drive unit cost to the floor
* **Multimodal lightweight teams**: cover text, image, video, audio, PDF with one model — less SDK sprawl

<Info>
  **Sources & data freshness**

  * Google official blog: `blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/`
  * Google GA announcement: `cloud.google.com/blog/products/ai-machine-learning/gemini-3-1-flash-lite-is-now-generally-available`
  * Model docs: `ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite`
  * Benchmarks: Artificial Analysis (`artificialanalysis.ai/models/gemini-3-1-flash-lite-preview`)
  * Data captured: May 9, 2026 (UTC+8)
</Info>

**Get started**

Sign in to APIYi, grab an API key, point your `model` field at `gemini-3.1-flash-lite`, and you're live with a stable GA API, official-parity pricing, and top-up bonuses on top.
