> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Astra Is Live: OpenAI's New Flagship Open for Calls

> OpenAI's GPT-6 Astra, released September 3, 2026, is now on APIYI: 1.05M context, five reasoning-effort levels, computer use, $10 in / $50 out per 1M tokens with $1 cached reads. All four billing items match OpenAI's list price.

## Key Points

* **A new-generation flagship**: OpenAI released `gpt-6-astra` on September 3, 2026, calling it "the most intelligent and aligned model in the world", built for computer use, software engineering, science, and long-horizon agent work. APIYI has it live in the `default` / `svip` official-relay groups and the half-price `Codex_Reverse` group
* **Priced item-for-item with OpenAI**: \$10 in / \$50 out per 1M tokens, \$1 cached reads, \$12.50 cache writes. That is 2.5x the current promotional price of `gpt-5.6-sol` (\$4 / \$20) and identical to Claude Fable 5.1 on input and output
* **Specs stepped up across the board**: 1,050,000-token context, 128,000-token max output, knowledge cutoff April 30, 2026. Reasoning effort gains two new levels, `xhigh` and `max`, for five in total
* **Big jumps on agent benchmarks**: Terminal-Bench 4.0 from 37.3% to **57.9%**, ScreenSpot-Pro from 76.9% to **92.7%**, FrontierMath Tier 4 from 83.0% to **97.6%**. OpenAI says it uses roughly 70% fewer tokens than Sol on equivalent tasks
* **Cyber capability rated "Critical"**: this is the first OpenAI model to cross the cybersecurity Critical threshold in its Preparedness Framework. The public API refuses vulnerability discovery and exploit-writing tasks. Regular development work is unaffected

## Background

Less than two months after GPT-5.6 shipped as the Sol / Terra / Luna trio in July, OpenAI has moved the generation number to 6. Unlike 5.6, GPT-6 currently comes as a single model, `gpt-6-astra`, and OpenAI has not announced a mini or lightweight tier.

The positioning is unambiguous: **this is a model for getting work done, not a chat model**. The one-line pitch from the launch is "anything you can do on a computer, Astra can do for you. Fast." Every headline benchmark is about computer use (OSWorld, ScreenSpot-Pro), terminal and software engineering (Terminal-Bench 4.0, DeepSWE), science (FrontierMath, Terminal-Bench Science), and professional tasks. Conventional conversational benchmarks are almost absent from the official material.

The other first is a **staged rollout**. On September 3 the model went to enterprises in the Trusted Access program and to defenders in the Daybreak cybersecurity program. Over the following days it expanded to ChatGPT Plus / Pro / Business / Enterprise, the OpenAI API, and AWS. APIYI completed onboarding on September 5.

<Info>
  Daybreak is the cybersecurity defense program OpenAI announced alongside Astra, with a stated commitment of \$1 billion in credits for defenders and critical-infrastructure organizations. Vetted organizations get access with looser safeguards. What APIYI serves is the **standard public release**.
</Info>

## Deep Dive

### Benchmarks (retrieved September 5, 2026)

| Benchmark                            | GPT-6 Astra | GPT-5.6 Sol | Delta |
| ------------------------------------ | ----------- | ----------- | ----- |
| Terminal-Bench 4.0                   | **57.9%**   | 37.3%       | +20.6 |
| OSWorld 2.0                          | **72.6%**   | 65.7%       | +6.9  |
| ScreenSpot-Pro                       | **92.7%**   | 76.9%       | +15.8 |
| DeepSWE v1.1                         | **74.1%**   | 72.7%       | +1.4  |
| FrontierMath Tier 4                  | **97.6%**   | 83.0%       | +14.6 |
| GPQA Diamond                         | **96.0%**   | 94.6%       | +1.4  |
| ExploitBench                         | **100%**    | 78.5%       | +21.5 |
| Hallucination rate (lower is better) | **4.2%**    | 12.2%       | −8.0  |

The three largest gains are all agentic: terminal operation, screen grounding, exploit tasks. Knowledge QA (GPQA Diamond) and patch-writing (DeepSWE) move by one or two points. **This generation is about finishing the task, not answering more accurately.**

<Info>
  Figures come from OpenAI's announcement as relayed by third-party outlets (MarkTechPost, Yotta Labs, September 3-4, 2026) and have not been independently reproduced. On ARC-AGI-3 the official figure is 99.9%, but per Latent Space's roundup that is with OpenAI's adapter harness; direct answers land around 63-66%. Quote it with the caveat.
</Info>

Independent evaluations are more measured. On Artificial Analysis, Astra scores 61 on the Intelligence Index, 5 points below Claude Fable 5.1 at 66, and 67 on the Coding Agent Index, level with Claude Opus 5 while Fable 5.1 leads at 70. **Astra's edge is computer use and task efficiency, not raw general intelligence.**

### Core Capabilities

<CardGroup cols={2}>
  <Card title="Computer Use" icon="monitor">
    Browsers, spreadsheets, desktop apps, and terminals. OSWorld 2.0 72.6%, ScreenSpot-Pro 92.7%. OpenAI reports average completion time on complex tasks dropping from about 75 minutes to 40
  </Card>

  <Card title="Five Reasoning Levels" icon="brain">
    `reasoning_effort` accepts `low` / `medium` / `high` / `xhigh` / `max`; `xhigh` and `max` are new this generation. OpenAI says switching levels does not break the prompt cache
  </Card>

  <Card title="Token Efficiency" icon="zap">
    OpenAI reports roughly 70% fewer tokens than GPT-5.6 Sol on equivalent tasks (about one third of Sol's usage in the Codex harness). The unit price is 2.5x, so the real per-task gap is smaller than the price gap
  </Card>

  <Card title="Agent Toolchain" icon="bot">
    Web search, file search, code interpreter, hosted shell, computer use, MCP, and tool search on the Responses side, plus new async function calling and mid-turn steering
  </Card>
</CardGroup>

### Specifications

| Item             | Value                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Model ID         | `gpt-6-astra`                                                                                                                                          |
| Context window   | 1,050,000 tokens                                                                                                                                       |
| Max output       | 128,000 tokens                                                                                                                                         |
| Knowledge cutoff | April 30, 2026                                                                                                                                         |
| Input modalities | Text, image (no audio or video at launch)                                                                                                              |
| Output modality  | Text                                                                                                                                                   |
| Reasoning effort | low / medium / high / xhigh / max                                                                                                                      |
| Features         | Streaming, function calling, structured outputs, prompt caching                                                                                        |
| Groups           | `default` / `svip` (official relay, official price), `Codex_Reverse` (reverse-engineered, 0.5x)                                                        |
| Endpoints        | `/v1/responses` (primary; function calling and the agent toolchain live here), `/v1/chat/completions` (compatibility migration, **no function tools**) |

<Warning>
  **Cybersecurity restrictions**: Astra is the first model OpenAI has placed at the Critical cybersecurity level of its Preparedness Framework. The standard public release refuses offensive tasks such as vulnerability discovery and exploit-code writing, and the API carries built-in safety checks for them. Ordinary software development, security-configuration review, and log analysis are unaffected.
</Warning>

## Practical Use

### Recommended Scenarios

* **Long-horizon agent tasks**: multi-step browser / desktop automation, cross-system data transfer and reconciliation. This is where Astra improves most over the previous generation
* **Complex software engineering**: large code migrations (OpenAI reports 68% migration accuracy, 10 points ahead of second place), cross-repo refactors, SRE incident triage
* **Science and professional analysis**: near-perfect FrontierMath Tier 4, well suited to mathematical derivation, scientific scripting, and professional document drafting
* **Very long context**: 1.05M tokens fits a mid-sized codebase or several hundred pages of documents in one request

**Not recommended** for high-volume simple tasks such as classification, extraction, or short chat. The \$50 output price is more than 8x `gpt-5.6-luna`; leave those workloads to Luna / Terra.

### Code Example

<CodeGroup>
  ```python Responses API theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-astra",
      reasoning={"effort": "high"},   # low / medium / high / xhigh / max
      input="Migrate this repo from Python 3.9 to 3.13 and list every file that needs changes, with reasons",
  )
  print(response.output_text)
  print(response.usage)
  ```

  ```python Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-astra",
      reasoning_effort="high",   # low / medium / high / xhigh / max
      messages=[
          {"role": "user", "content": "Migrate this repo from Python 3.9 to 3.13 and list every file that needs changes, with reasons"}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```bash cURL (Responses) theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-astra",
      "reasoning": {"effort": "high"},
      "input": "In one sentence, how does GPT-6 Astra differ from GPT-5.6 Sol?"
    }'
  ```
</CodeGroup>

Responses is the primary endpoint for this generation: function calling, hosted tools, and async function calling are only available there, and multi-turn conversations can be chained with `previous_response_id`. Chat Completions is there for migrating existing code; both endpoints bill identically.

<Warning>
  **Chat Completions does not support function tools**: a request carrying `tools` is rejected upstream on the official-relay lines (400, pointing you to Responses). This is a model-side limit, not a platform issue. Use Responses for anything that needs function calling. Two more Chat notes: cap output with `max_completion_tokens` (the legacy `max_tokens` returns 400) and do not send `temperature`.
</Warning>

### Best Practices

* **Pick the reasoning level per task**: `low` / `medium` for deterministic steps, `xhigh` / `max` for planning and debugging that needs extended thinking. `max` grows reasoning tokens sharply and output bills at \$50, so measure on a small sample before scaling up
* **Lean on the cache**: cached reads at \$1 are one tenth of the standard input price. In agent loops, keep stable prefixes such as system prompts, tool definitions, and codebase context at the front of the conversation so every turn hits the cache
* **Watch input size**: as on OpenAI, a request whose input exceeds 272K tokens moves to a higher billing tier for the whole request (input and cache double). Unless you genuinely need the whole repo in one shot, keep day-to-day context under 272K
* **Migrating from 5.6 Sol is a model-name change**: both Responses and Chat Completions keep their existing request structure; swap the `model` field and enable `xhigh` / `max` as needed. Start new projects on Responses, since computer use, hosted shell, and the rest of the toolchain live only there

<Warning>
  Astra has **no mini or lightweight tier**, and no Terra / Luna counterpart. For low-cost volume work keep using `gpt-5.6-terra` (\$2 / \$12) or `gpt-5.6-luna` (\$0.20 / \$1.20).
</Warning>

## Pricing and Availability

### Pricing

| Billing item                         | Price (per 1M tokens) |
| ------------------------------------ | --------------------- |
| Input (prompt)                       | \$10.00               |
| Output (completion, incl. reasoning) | \$50.00               |
| Cached read                          | \$1.00                |
| Cache write (5 min)                  | \$12.50               |

**All four items match OpenAI's standard-tier list price.** OpenAI also offers Batch / Flex at half price and a Fast tier at 2x; the figures here are the standard tier.

Those are the prices in the `default` / `svip` official-relay groups. The `Codex_Reverse` group (the Codex reverse-engineered economy channel) also carries this model at a 0.5x discount off the official price: \$5 in / \$25 out, \$0.50 cached reads. It suits Codex coding, client chat, and agent workloads where cost matters; for production, use the official-relay groups. See the [group guide](/en/faq/codex-claudecode-default-groups) for the differences.

### Compared with Peers

| Model              | Input   | Output  | Cached read |
| ------------------ | ------- | ------- | ----------- |
| `gpt-6-astra`      | \$10.00 | \$50.00 | \$1.00      |
| `claude-fable-5-1` | \$10.00 | \$50.00 | \$0.25      |
| `gpt-5.6-sol`      | \$4.00  | \$20.00 | \$0.40      |
| `gpt-5.6-terra`    | \$2.00  | \$12.00 | \$0.20      |

Astra and Claude Fable 5.1 are priced identically on input and output. The difference is cached reads: \$0.25 for Fable 5.1 versus \$1.00 for Astra. In multi-turn agent workloads with high cache hit rates, that line item widens the real cost gap.

### Long-Context Tiered Billing

Matching OpenAI, `gpt-6-astra` bills in two tiers by the input token count of each request; once input passes 272K, the **whole request** moves to the second tier:

| Input tokens     | Input   | Output  | Cached read | Cache write |
| ---------------- | ------- | ------- | ----------- | ----------- |
| 0 - 272K         | \$10.00 | \$50.00 | \$1.00      | \$12.50     |
| 272,001 - 1,050K | \$20.00 | \$75.00 | \$2.00      | \$25.00     |

The tier is decided per request, not by account volume: on the same key, a 200K request bills at tier one and a 300K request at tier two. Keep everyday context under 272K and the first row is what you pay. Treat the live figures on the [model pricing page](/en/models/index) as authoritative.

### Stack the Recharge Promotions

APIYI matches provider pricing item for item, and **discounts come through recharge bonuses** that stack on top of the prices above:

📖 [Recharge promotion details](/en/faq/recharge-promotions)

## Summary and Recommendations

GPT-6 Astra is not a clean-sweep upgrade. On raw general intelligence, independent evaluations still put it slightly behind Claude Fable 5.1, and it costs 2.5x GPT-5.6 Sol. Where it pulls away is **finishing multi-step tasks**: terminal operation, screen grounding, and long-horizon agent benchmarks all move 15 to 20 points, and with the claimed 70% token-efficiency gain, the per-task cost gap should be smaller than the unit-price gap.

The recommendation is straightforward: **if you already run agents, automation, or complex engineering tasks, `gpt-6-astra` deserves a head-to-head trial**, judged on task completion rate and end-to-end token spend rather than list price. For everyday chat, classification, and extraction, `gpt-5.6-terra` / `gpt-5.6-luna` remain the sensible choice.

<Info>
  Sources: OpenAI announcement and developer docs `developers.openai.com/api/docs/models/gpt-6-astra` (September 3, 2026), the OpenAI Developer Community announcement, MarkTechPost, Latent Space, Yotta Labs, CloudZero (September 3-4, 2026), and Artificial Analysis indices. Availability and pricing from the APIYI platform (September 5, 2026); the live model pricing page is authoritative.
</Info>
