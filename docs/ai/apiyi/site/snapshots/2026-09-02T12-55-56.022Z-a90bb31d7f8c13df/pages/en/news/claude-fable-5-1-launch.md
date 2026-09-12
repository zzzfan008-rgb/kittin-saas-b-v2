> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5.1 Is Live: Same Price, Cache Reads Cut to a Quarter

> Anthropic shipped Claude Fable 5.1 on September 1, 2026. Input and output stay at $10/$50 per 1M tokens while cache reads drop from $1.00 to $0.25. claude-fable-5-1 and claude-fable-5-1-thinking are live on APIYI at provider pricing on every line item, across both OpenAI-compatible and native Anthropic endpoints. Note three breaking changes and the 30-day data retention requirement.

## Key Takeaways

* **An upgrade at the same price**: \$10 input / \$50 output per 1M tokens, identical to Fable 5, with capabilities a clear step up
* **Cache reads cost a quarter**: cache reads drop from \$1.00 to **\$0.25 / 1M tokens** (0.025x base input, versus 0.1x on other Claude models), which lands directly on long-running agent sessions. **APIYI has already matched the cut**
* **Benchmark jumps, not nudges**: Terminal-Bench-Science goes from 24.7% to **52.6%**, AutomationBench from 17.1% to **31.4%** — both more than doubling
* **⚠️ Three breaking changes**: forced tool use (`tool_choice` of `any` / `tool`) now returns 400, thinking blocks are bound to the model that produced them, and editing earlier turns invalidates thinking blocks — read before migrating from Fable 5
* **Live on APIYI**: both `claude-fable-5-1` and `claude-fable-5-1-thinking`, on the OpenAI-compatible and native Anthropic endpoints, in the `default` / `svip` / `ClaudeCode` groups

## Background

On September 1, 2026, Anthropic released Claude Fable 5.1 and Claude Mythos 5.1 — the first iteration of the Mythos-class line since Fable 5 launched on June 9. Anthropic positions both as the most advanced models for coding and knowledge work.

Unlike the usual generational price bump, Fable 5.1 holds input and output pricing **exactly level** with Fable 5. The only price change is a **75% cut to cache reads**. Anthropic's own framing: at low and medium effort, Fable 5.1 reaches similar or better results than Fable 5 at a **much lower cost** — roughly 25% lower overall for typical workloads, and up to 45% lower on agentic tasks.

Fable 5.1 and Mythos 5.1 are **the same model with different levels of safeguards**. Mythos 5.1 is offered only to approved Project Glasswing customers; Fable 5.1 is the publicly available one.

APIYI has `claude-fable-5-1` and `claude-fable-5-1-thinking` live, with **all four line items — input, output, cache reads, and cache writes — priced exactly in line with the provider**, cache reads included at \$0.25.

## What's New

### Capability gains

<CardGroup cols={2}>
  <Card title="Long-horizon agentic coding" icon="code">
    Multi-file features, large refactors and migrations, debugging and code review across sessions that run for hours
  </Card>

  <Card title="Documents, spreadsheets, slides" icon="file-text">
    From a first question to a finished document, a live-formula spreadsheet, or a deck built from a blank page
  </Card>

  <Card title="Research and search" icon="search">
    Higher accuracy on multistep web research and deep-research tasks that follow up on what they find
  </Card>

  <Card title="Vision" icon="image">
    Reads dense charts, filings and tables nested in PDFs, including crop-and-zoom on charts
  </Card>

  <Card title="Long context" icon="scroll">
    Reasons over and connects details across the full 1M token context window
  </Card>

  <Card title="Computer use" icon="monitor">
    Operates browsers and desktop apps more reliably and recovers from failed steps
  </Card>
</CardGroup>

### Benchmark highlights

Official figures (Fable 5.1 vs Fable 5 vs Opus 5):

| Benchmark                             | Fable 5.1 | Fable 5 | Opus 5 | What it measures            |
| ------------------------------------- | --------- | ------- | ------ | --------------------------- |
| **Terminal-Bench-Science 0.1**        | **52.6%** | 24.7%   | 29.0%  | Agentic scientific research |
| **Terminal-Bench 4.0**                | **55.8%** | 42.0%   | 52.3%  | Agentic coding              |
| **AutomationBench**                   | **31.4%** | 17.1%   | 26.9%  | Business workflows          |
| **GDPval-AA v2**                      | **1853**  | 1723    | 1824   | Knowledge work (score)      |
| **OSWorld 2.0 (partial)**             | **77.9%** | 72.9%   | 75.4%  | Computer use                |
| **OSWorld 2.0 (strict)**              | **41.7%** | 36.1%   | 39.6%  | Computer use                |
| **Humanity's Last Exam (no tools)**   | **60.9%** | 57.8%   | 56.6%  | Multidisciplinary reasoning |
| **Humanity's Last Exam (with tools)** | **65.0%** | 63.8%   | 63.6%  | Multidisciplinary reasoning |
| **CursorBench 3.2.0**                 | **73.4%** | 70.5%   | 70.0%  | Agentic coding              |

Terminal-Bench-Science and AutomationBench are the two that more than double — and they map onto exactly the workloads people run in production: long-horizon research agents and business process automation. Multilingual performance is on par with Fable 5.

### Specifications

| Parameter          | Spec                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Model ID**       | `claude-fable-5-1` / `claude-fable-5-1-thinking`                                                                |
| **Context window** | 1,000,000 tokens (default and maximum, standard per-token pricing across the whole window)                      |
| **Max output**     | 128,000 tokens                                                                                                  |
| **Thinking**       | Adaptive thinking always on, depth steered by the `effort` parameter                                            |
| **Effort levels**  | `low` / `medium` / `high` / `x-high` / `max`, defaulting to `high`                                              |
| **Tokenizer**      | Same as Fable 5 (introduced with Opus 4.7); the same text produces roughly 30% more tokens than on older models |
| **Data retention** | Inputs and outputs retained for 30 days (abuse detection)                                                       |
| **API formats**    | OpenAI-compatible / native Anthropic                                                                            |

## ⚠️ Three Breaking Changes (read before migrating)

<Warning>
  If you already call `claude-fable-5`, these three will either error out or change behavior. Check them before you swap the model name.
</Warning>

### 1. Forced tool use is not supported

`tool_choice` set to `{"type": "any"}` or `{"type": "tool", "name": "..."}` returns a 400 `invalid_request_error`:

```text theme={null}
tool_choice: type "tool" and "any" are not supported for this model.
```

`{"type": "auto"}` (the default) and `{"type": "none"}` are unchanged. The same validation applies to the token counting endpoint.

Thinking is always on for this model, and a forced tool call would skip it — the model would write its working-out into the tool arguments instead, which lowers argument quality.

**What to do instead**: keep `tool_choice: {"type": "auto"}` and use strict tool use (`strict: true`) or structured outputs for schema-valid JSON. To make the model call a tool rather than reply in text, state in the prompt when the tool applies (for example, "Use the `get_weather` tool to answer") — Fable 5.1 follows explicit tool instructions reliably.

### 2. Thinking blocks are tied to the model that produced them

Every thinking block records which model produced it, and it is preserved **in one direction only**: Fable 5.1 reads earlier models' thinking blocks, and no earlier model reads Fable 5.1's.

So a conversation that moves onto Fable 5.1 from Opus 5, Fable 5, or any earlier Claude model keeps its reasoning; a conversation that moves from Fable 5.1 back to those models loses it for the turns that run there. When a request carries a block the target model can't read, the API drops it before the model sees it — dropped blocks don't count toward `input_tokens` and aren't billed.

<Info>
  Worth a close look if your gateway or client does model routing or failure fallback that switches models mid-conversation. The `thinking-binding-controls-2026-08-01` beta header surfaces dropped blocks in a top-level `input_transformations` array; without it, the drop is silent.
</Info>

### 3. Editing earlier turns invalidates thinking blocks

Modifying anything **before** a Fable 5.1 thinking block — the `system` prompt, the `tools` array, or an earlier message — errors on the next request with `The block is bound to a different conversation`.

Patterns that invalidate every later thinking block:

* Editing, reordering, or removing an earlier turn while keeping later ones
* Injecting per-request text into an earlier turn (a reminder or status line) that you remove on the next request
* Rebuilding the top-level `system` prompt or `tools` array between requests in the same conversation
* An image or document URL that serves different bytes on a later request (the check covers the bytes, not the URL, so a rotating signed URL for the same file is fine)

Patterns that keep later blocks valid: removing a leading run of thinking blocks oldest first, letting server-side compaction or context editing trim the history, moving `cache_control` markers, and changing `effort` between requests.

<Info>
  The check is **enforced for accounts created on or after August 31, 2026**. Earlier accounts have the mismatch recorded but not acted on, unless the request sets `thinking.block_binding.prefix_mismatch_behavior`.

  Practical rule: **treat the conversation as append-only**. Add instructions with a turn-scoped system message (`clear_at: "next_user_message"`, beta) and change tools with mid-conversation tool changes rather than editing `system` or `tools`. These patterns also keep the prompt cache warm.
</Info>

## New Features (all beta)

<CardGroup cols={3}>
  <Card title="Change effort mid-conversation" icon="sliders-horizontal">
    Raise it for a hard step, lower it for routine ones, without invalidating the prompt cache. Beta header: `mid-conversation-output-config-2026-07-01`
  </Card>

  <Card title="Turn-scoped system messages" icon="message-square">
    `clear_at: "next_user_message"` applies for the current turn only; the message stays in `messages` and is sent back verbatim, so nothing earlier changes. Beta header: `mid-conversation-system-clear-at-2026-08-21`
  </Card>

  <Card title="Progress updates between tool calls" icon="activity">
    Set `thinking.display` to `"updates"` to receive progress updates as text while reasoning stays hidden. Beta header: `thinking-display-updates-2026-08-18`
  </Card>
</CardGroup>

Text generated by Fable 5.1 and Mythos 5.1 also carries Anthropic's **statistical text watermark** on every platform, and images and videos retrieved through the Files API carry signed C2PA Content Credentials. Anthropic states the watermark does not change the meaning, quality, or readability of the output, adds no tokens or hidden characters, carries no information about you or your organization, and needs no changes to your requests or responses.

## Behavior Differences from Fable 5 (no code change required to notice)

None of these error out, but they change how the model feels. Each has a prompting fix:

| Difference                                 | What you see                                                                                                                       | What to do                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Parallel tool calling is more variable** | One tool call per turn where Fable 5 batched several. Extra tokens, round trips and wall-clock time, but no loss of answer quality | Add a line asking it to batch independent tool calls in the same turn                                            |
| **Fewer progress updates**                 | Less user-facing text between tool calls, especially at higher effort                                                              | Set `thinking.display` to `"updates"`; remove any prompt line telling it to hold findings for the final response |
| **Answers from memory more at low effort** | Calls search or retrieval tools less often at the lowest effort                                                                    | Raise effort for turns that need fresh information, or add a verification nudge                                  |
| **Denser prose**                           | Longer sentences, fewer paragraph breaks                                                                                           | Ask explicitly for paragraphing and pacing                                                                       |
| **Less formatting in chat**                | Bold, headers and lists used less than on earlier Claude models                                                                    | Re-check anti-formatting rules written for older models — they may suppress structure the content needs          |
| **Unmarked quotations**                    | When summarizing documents, more likely to reproduce source passages without marking them as quotations                            | Ask explicitly for quotation marks and source attribution                                                        |
| **Whole-file rewrites for small edits**    | Rewrites the whole file rather than making a targeted edit; same result, more output tokens and time                               | Ask for targeted edits over whole-file rewrites                                                                  |

### Unchanged from Fable 5

* Adaptive thinking is always on: `thinking: {"type": "enabled"}` with `budget_tokens` and `{"type": "disabled"}` both return 400. Omit `thinking` or send `{"type": "adaptive"}`
* `thinking.display` defaults to `"omitted"`; `"summarized"` is available, and the raw chain of thought is never returned
* Prefilling the assistant response returns 400
* Non-default `temperature`, `top_p`, or `top_k` values return 400
* The minimum cacheable prompt length is still 512 tokens
* Interleaved thinking is automatic, with no beta header

## Refusals, Fallback, and Billing

Fable 5.1 carries safety classifiers covering the same `stop_details` categories as Fable 5:

* **Refusals**: a declined request returns HTTP 200 with `stop_reason: "refusal"` and a `stop_details` object naming the policy area that fired
* **Fallback**: retry a refused request on another model with server-side fallback. The permitted fallback targets for Fable 5.1 are **Claude Opus 4.8 and Claude Opus 5**
* **Billing**: you aren't billed for a refusal that arrives before any output, and fallback credit refunds the prompt-cache cost of switching models

## Data Retention and Compliance (important)

<Warning>
  **Fable 5.1 and Mythos 5.1 still carry the 30-day data retention requirement**

  Both are Covered Models, the same as Fable 5 and Mythos 5: **inputs and outputs are retained for 30 days** for serious-abuse detection, and they **aren't available under zero data retention unless expressly authorized by Anthropic**.

  * **Default access scope**: retained data is **accessed only by automated safety systems**; human review happens **only when those systems flag potential harm**
  * **Human review scope**: limited to what is needed to complete the review
  * **Combined review across accounts**: when traffic from multiple accounts is flagged for the **same prohibited activity**, it may be reviewed together
</Warning>

<Info>
  **The retention happens at Anthropic and the cloud providers, not at APIYI**: the 30-day retention above takes place **provider-side** (passed through to Anthropic for abuse detection). **APIYI retains no data of its own and acts as a transparent proxy**, forwarding requests only. **Only Mythos-class models (Fable 5 / 5.1, Mythos 5 / 5.1) are subject to this requirement — other Claude models such as Opus 5, Opus 4.8, and Sonnet 5 are unaffected.**
</Info>

## Putting It to Work

### Where it fits

1. **Long-horizon agentic coding**: large cross-session refactors, migrations, multi-file feature work
2. **Multistep research and deep retrieval**: tasks that follow up on intermediate findings
3. **Document-heavy knowledge work**: filings, papers, chart-dense PDFs, through to a finished deliverable
4. **Very long context analysis**: connecting details across a 1M token window

<Info>
  Anthropic's own guidance: **start with Claude Opus 5 for most workloads**. Reach for Fable 5.1 for demanding reasoning and long-horizon agentic work, or when your evals on Opus 5 at higher effort still fall short.
</Info>

### Code examples

#### Native Anthropic format

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-fable-5-1",
    max_tokens=8192,
    messages=[
        {
            "role": "user",
            "content": "Review this repository's architecture, flag the risks, and propose a refactor path. Batch independent tool calls into the same turn."
        }
    ]
)

print(message.content[0].text)
```

#### OpenAI-compatible format

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-fable-5-1",
    messages=[
        {"role": "user", "content": "Trace the root cause of this production bug step by step and propose a fix."}
    ]
)

print(response.choices[0].message.content)
```

### Five-step migration checklist

1. **Change the model ID**: `claude-fable-5` → `claude-fable-5-1`
2. **Remove forced tool use**: drop `tool_choice` of type `any` / `tool`, and move schema enforcement to strict tool use or structured outputs
3. **Keep history append-only**: pass thinking blocks back unchanged, and don't rebuild `system` / `tools` or edit earlier messages between requests
4. **Re-tune effort**: the default is `high`; consider changing it mid-conversation instead of holding one level for the whole session
5. **Re-run your evals**: refusal handling, fallback, and token counts carry over, but cache reads cost less and the default behaviors above differ

## Pricing and Availability

### Pricing

Official pricing (USD per 1M tokens):

| Line item           | Fable 5.1  | Fable 5 | Change       |
| ------------------- | ---------- | ------- | ------------ |
| **Base input**      | \$10.00    | \$10.00 | unchanged    |
| **Output**          | \$50.00    | \$50.00 | unchanged    |
| **5m cache writes** | \$12.50    | \$12.50 | unchanged    |
| **1h cache writes** | \$20.00    | \$20.00 | unchanged    |
| **Cache reads**     | **\$0.25** | \$1.00  | **down 75%** |

That table is also APIYI's pricing — **every line item matches the provider, with no markup**.

Cache reads (hits and refreshes) cost **0.025x the base input price** on these models, versus 0.1x on other Claude models — the saving lands hardest on long agentic sessions that re-read the same cached prefix. Batch processing is \$5 input / \$25 output per 1M tokens.

<Info>
  **APIYI prices this model in line with the provider and adds no markup.** On top of that, some groups carry a discount and stack with recharge bonus campaigns — that part is our own margin given back, separate from the model's pricing.

  For what you were actually charged, treat the console's cache billing detail as authoritative — the `usage` cache fields echoed by the API are not a billing record.
</Info>

### Groups and endpoints

| Item                           | Value                                                 |
| ------------------------------ | ----------------------------------------------------- |
| **Model name**                 | `claude-fable-5-1` (also `claude-fable-5-1-thinking`) |
| **Groups**                     | `default` / `svip` / `ClaudeCode`                     |
| **OpenAI-compatible endpoint** | `https://api.apiyi.com/v1`                            |
| **Native Anthropic endpoint**  | `https://api.apiyi.com`                               |

<Info>
  The `ClaudeCode` group is for clients speaking the native Anthropic protocol, such as Claude Code. **Match the group to the protocol**: use `ClaudeCode` for the native Anthropic protocol, and `default` / `svip` for the OpenAI-compatible protocol. That group also carries a discount, which stacks with recharge bonuses.
</Info>

### Stacking with recharge promotions

Pair this with APIYI's recharge bonus campaigns to bring the effective cost down further: `docs.apiyi.com/en/faq/recharge-promotions`.

## Verdict

Claude Fable 5.1 is an unusual release: the price of input and output doesn't move at all, cache reads fall to a quarter, and the agentic benchmarks that matter most in production more than double. For teams already running long-horizon agents, the migration pays for itself quickly. On APIYI every line item matches the provider, cache reads included at the new \$0.25.

**Confirm three things before you migrate**:

* Whether your code sets `tool_choice` to `any` or `tool` — it will 400 outright
* Whether your conversation history is append-only — injected-then-deleted reminders and rebuilt `system` / `tools` arrays both invalidate thinking blocks
* Whether your team knows about the **30-day data retention** requirement, and handles sensitive data under your own compliance policy

<Info>
  Sources: Anthropic's launch announcement and platform documentation (`anthropic.com/claude-fable-and-mythos-5-1`, `platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1`), released September 1, 2026. APIYI availability and pricing taken from the platform pricing endpoint; data retrieved September 2, 2026 (UTC+8). Final billing follows real-time platform data.
</Info>
